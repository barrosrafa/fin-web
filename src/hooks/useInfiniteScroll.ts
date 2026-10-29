"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export type PaginatedFetcher<T> = (
  offset: number, limit: number, search: string, filter?: string, signal?: AbortSignal
) => Promise<PaginatedResult<T>>;

export interface UseInfiniteScrollOptions<T> {
  fetchPage: PaginatedFetcher<T>;
  limit?: number;
  initialSearch?: string;
  initialFilter?: string;
  debounceMs?: number;
  getKey?: (item: T) => string;
  maxPages?: number;
}

// All current consumers identify instruments by exchange/type + ticker, or rows by id.
function defaultKey<T>(item: T): string {
  const row = item as Record<string, unknown>;
  const id = row.instrumentId ?? row.id;
  if (id != null) return String(id);
  if (row.ticker != null) return `${row.exchange ?? "B3"}:${row.type ?? ""}:${row.ticker}`;
  return JSON.stringify(item);
}

export function useInfiniteScroll<T>({
  fetchPage, limit = 24, initialSearch = "", initialFilter = "TODOS",
  debounceMs = 300, getKey = defaultKey, maxPages = 8,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filter, setFilter] = useState(initialFilter);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [windowStart, setWindowStart] = useState(0);
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  const inFlight = useRef<AbortController | null>(null);
  const cursor = useRef(0);
  const pages = useRef(0);
  const ready = useRef(false);
  const more = useRef(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const context = useRef({ search: debouncedSearch, filter, fetchPage, limit });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const merge = useCallback((rows: T[]) => [...new Map(rows.map(row => [getKey(row), row])).values()], [getKey]);
  const [windowFull, setWindowFull] = useState(false);

  useEffect(() => {
    const id = ++generation.current;
    inFlight.current?.abort();
    observer.current?.disconnect();
    const controller = new AbortController();
    inFlight.current = controller;
    const changed = context.current.search !== debouncedSearch || context.current.filter !== filter ||
      context.current.fetchPage !== fetchPage || context.current.limit !== limit;
    context.current = { search: debouncedSearch, filter, fetchPage, limit };
    const start = changed ? 0 : windowStart;
    if (changed) setWindowStart(0);
    cursor.current = start;
    pages.current = 0;
    ready.current = false;
    more.current = true;
    // A new request generation invalidates the previous visible loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([]);
    setTotal(0);
    setLoading(true);
    setLoadingMore(false);
    setWindowFull(false);
    setError(null);
    void fetchPage(start, limit, debouncedSearch, filter, controller.signal).then(res => {
      if (generation.current !== id || controller.signal.aborted) return;
      setItems(merge(res.items));
      cursor.current = start + res.items.length; // protocol offset, never deduplicated length
      pages.current = 1;
      more.current = res.hasMore && res.items.length > 0;
      setTotal(res.total);
      setHasMore(more.current);
      setWindowFull(pages.current >= maxPages);
      ready.current = true;
    }).catch(err => {
      if (generation.current !== id || controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    }).finally(() => {
      if (inFlight.current !== controller) return;
      inFlight.current = null;
      setLoading(false);
    });
    return () => {
      ++generation.current;
      controller.abort();
      inFlight.current?.abort();
      inFlight.current = null;
      ready.current = false;
      observer.current?.disconnect();
    };
  }, [debouncedSearch, filter, limit, fetchPage, windowStart, revision, merge, maxPages]);

  const loadMore = useCallback(async () => {
    if (!ready.current || inFlight.current || !more.current || pages.current >= maxPages) return;
    const controller = new AbortController();
    inFlight.current = controller; // synchronous owner lock, before any await
    const id = generation.current;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetchPage(cursor.current, limit, debouncedSearch, filter, controller.signal);
      if (generation.current !== id || controller.signal.aborted) return;
      setItems(prev => merge([...prev, ...res.items]));
      cursor.current += res.items.length;
      pages.current += 1;
      more.current = res.hasMore && res.items.length > 0;
      setHasMore(more.current);
      setTotal(res.total);
      setWindowFull(pages.current >= maxPages);
    } catch (err) {
      if (generation.current === id && !controller.signal.aborted)
        setError(err instanceof Error ? err.message : "Erro ao carregar mais dados");
    } finally {
      if (inFlight.current === controller) {
        inFlight.current = null;
        setLoadingMore(false);
      }
    }
  }, [fetchPage, limit, debouncedSearch, filter, merge, maxPages]);

  const sentinelRef = useCallback((node: HTMLElement | null) => {
    observer.current?.disconnect();
    if (!node || error || windowFull || typeof IntersectionObserver === "undefined") return;
    observer.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) void loadMore();
    }, { rootMargin: "250px" });
    observer.current.observe(node);
  }, [loadMore, error, windowFull]);

  const retry = () => ready.current ? void loadMore() : setRevision(n => n + 1);
  return {
    items, setItems, total, loading, loadingMore, hasMore, search, setSearch,
    debouncedSearch, filter, setFilter, error, sentinelRef, loadMore, retry,
    windowStart, windowFull,
    nextWindow: () => { if (!inFlight.current && windowFull && more.current) setWindowStart(cursor.current); },
    previousWindow: () => setWindowStart(n => Math.max(0, n - maxPages * limit)),
  };
}
