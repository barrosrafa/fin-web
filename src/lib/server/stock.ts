import "server-only";
import { cacheLife } from "next/cache";
import type { StockCompleteDetails, StockValuationDetail, QuoteHistoryResponse } from "@/lib/api";

const backend = (process.env.API_BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : ""))
  .replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://fin-web-wheat.vercel.app").replace(/\/+$/, "");

export async function readPublicJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${backend}/api/v1${path}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch { return null; }
}

export async function getPublicStock(ticker: string) {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });
  const encoded = encodeURIComponent(ticker);
  const [details, valuation, history] = await Promise.all([
    readPublicJson<StockCompleteDetails>(`/stocks/${encoded}`),
    readPublicJson<StockValuationDetail>(`/stocks/${encoded}/valuation`),
    readPublicJson<QuoteHistoryResponse>(`/market/${encoded}/history?timeframe=1M&adjusted=true&limit=10&offset=0`),
  ]);
  // Reject mismatched identities instead of publishing another instrument under this URL.
  return {
    details: details?.details?.ticker?.toUpperCase() === ticker ? details : null,
    valuation: valuation?.ticker?.toUpperCase() === ticker ? valuation : null,
    history: history?.ticker?.toUpperCase() === ticker ? history : null,
  };
}
