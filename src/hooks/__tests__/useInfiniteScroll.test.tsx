import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useInfiniteScroll, type PaginatedResult } from "../useInfiniteScroll";
const page = (tickers: string[], total = 200): PaginatedResult<{ ticker: string }> => ({ items: tickers.map(ticker => ({ ticker })), total, hasMore: true });
function pending<T>() {
  let resolve!: (value: T) => void;
  let reject!: (value: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
afterEach(cleanup);

it("locks 20 same-render calls, deduplicates by identity, advances by server offset", async () => {
  const delayed = pending<ReturnType<typeof page>>();
  const fetchPage = vi.fn().mockResolvedValueOnce(page(["A", "B"])).mockReturnValueOnce(delayed.promise).mockResolvedValue(page(["D"]));
  const { result } = renderHook(() => useInfiniteScroll<{ ticker: string }>({ fetchPage, limit: 2 }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => { for (let n = 0; n < 20; n++) void result.current.loadMore(); });
  expect(fetchPage).toHaveBeenCalledTimes(2);
  await act(async () => delayed.resolve(page(["B", "C"])));
  expect(result.current.items.map(row => row.ticker)).toEqual(["A", "B", "C"]);
  await act(async () => { await result.current.loadMore(); });
  expect(fetchPage.mock.calls[2][0]).toBe(4);
});

it("aborts stale page, releases loadingMore after filter change, ignores late finally", async () => {
  const old = pending<ReturnType<typeof page>>();
  const current = pending<ReturnType<typeof page>>();
  const fetchPage = vi.fn().mockResolvedValueOnce(page(["A"])).mockReturnValueOnce(old.promise)
    .mockResolvedValueOnce(page(["NEW"])).mockReturnValueOnce(current.promise);
  const { result } = renderHook(() => useInfiniteScroll<{ ticker: string }>({ fetchPage, limit: 1 }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  act(() => { void result.current.loadMore(); });
  const signal = fetchPage.mock.calls[1][4] as AbortSignal;
  act(() => result.current.setFilter("NEW"));
  await waitFor(() => expect(result.current.items[0]?.ticker).toBe("NEW"));
  expect(signal.aborted).toBe(true);
  expect(result.current.loadingMore).toBe(false);
  act(() => { void result.current.loadMore(); });
  await act(async () => old.resolve(page(["STALE"])));
  expect(result.current.loadingMore).toBe(true);
  await act(async () => current.resolve(page(["CURRENT"])));
  expect(result.current.items.map(row => row.ticker)).toEqual(["NEW", "CURRENT"]);
  expect(result.current.loadingMore).toBe(false);
});

it("keeps items on failure, retries the same cursor and invalidates after unmount", async () => {
  const delayed = pending<ReturnType<typeof page>>();
  const fetchPage = vi.fn().mockResolvedValueOnce(page(["A"])).mockRejectedValueOnce(new Error("Offline"))
    .mockReturnValueOnce(delayed.promise);
  const { result, unmount } = renderHook(() => useInfiniteScroll<{ ticker: string }>({ fetchPage }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { await result.current.loadMore(); });
  expect(result.current.items).toHaveLength(1);
  expect(result.current.error).toBe("Offline");
  act(() => result.current.retry());
  expect(fetchPage.mock.calls[1][0]).toBe(fetchPage.mock.calls[2][0]);
  const signal = fetchPage.mock.calls[2][4] as AbortSignal;
  unmount();
  expect(signal.aborted).toBe(true);
  await act(async () => delayed.resolve(page(["OLD"])));
});

it("bounds retained pages and can refetch earlier windows", async () => {
  const fetchPage = vi.fn(async (offset: number) => page([String(offset)]));
  const { result } = renderHook(() => useInfiniteScroll<{ ticker: string }>({ fetchPage, limit: 1, maxPages: 2 }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  await act(async () => { await result.current.loadMore(); });
  expect(result.current.windowFull).toBe(true);
  await act(async () => { await result.current.loadMore(); });
  expect(fetchPage).toHaveBeenCalledTimes(2);
  act(() => result.current.nextWindow());
  await waitFor(() => expect(result.current.items[0]?.ticker).toBe("2"));
  expect(result.current.items).toHaveLength(1);
  act(() => result.current.previousWindow());
  await waitFor(() => expect(result.current.items[0]?.ticker).toBe("0"));
});
