"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export type PaginatedFetcher<T> = (
  offset: number,
  limit: number,
  search: string,
  filter?: string
) => Promise<PaginatedResult<T>>;

export interface UseInfiniteScrollOptions<T> {
  fetchPage: PaginatedFetcher<T>;
  limit?: number;
  initialSearch?: string;
  initialFilter?: string;
  debounceMs?: number;
}

export function useInfiniteScroll<T>({
  fetchPage,
  limit = 24,
  initialSearch = "",
  initialFilter = "TODOS",
  debounceMs = 300,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [search, setSearch] = useState<string>(initialSearch);
  const [filter, setFilter] = useState<string>(initialFilter);
  const [error, setError] = useState<string | null>(null);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  const requestIdRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Reset & load page 0 whenever debouncedSearch or filter changes
  useEffect(() => {
    let active = true;
    const currentReqId = ++requestIdRef.current;

    async function initialLoad() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPage(0, limit, debouncedSearch, filter);
        if (active && currentReqId === requestIdRef.current) {
          setItems(res.items);
          setTotal(res.total);
          setHasMore(res.hasMore);
        }
      } catch (err) {
        if (active && currentReqId === requestIdRef.current) {
          setError(err instanceof Error ? err.message : "Erro ao carregar dados");
          setItems([]);
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        if (active && currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      active = false;
    };
  }, [debouncedSearch, filter, limit, fetchPage]);

  // Load next page on demand
  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const currentReqId = requestIdRef.current;
    const currentOffset = items.length;

    try {
      const res = await fetchPage(currentOffset, limit, debouncedSearch, filter);
      if (currentReqId === requestIdRef.current) {
        setItems((prev) => [...prev, ...res.items]);
        setTotal(res.total);
        setHasMore(res.hasMore);
      }
    } catch (err) {
      console.error("Erro ao carregar mais dados:", err);
    } finally {
      if (currentReqId === requestIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [loading, loadingMore, hasMore, items.length, limit, debouncedSearch, filter, fetchPage]);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "250px" }
      );

      observerRef.current.observe(node);
    },
    [loadMore]
  );

  return {
    items,
    setItems,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    debouncedSearch,
    filter,
    setFilter,
    error,
    sentinelRef,
    loadMore,
  };
}
