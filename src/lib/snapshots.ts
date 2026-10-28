/**
 * Cliente de Snapshots CDN/R2 (Borda Cloudflare).
 * 
 * Permite leitura de arquivos estáticos versionados pré-renderizados
 * (/snapshots/acoes/{ticker}.json, /snapshots/fiis/{ticker}.json, etc.)
 * com latência global sub-50ms e zero carga na API FastAPI do Render e Neon DB.
 */

const rawCdnUrl =
  process.env.NEXT_PUBLIC_CDN_URL?.trim() ||
  process.env.NEXT_PUBLIC_R2_URL?.trim();

export const CDN_BASE = rawCdnUrl ? rawCdnUrl.replace(/\/+$/, "") : null;

export interface SnapshotMeta {
  schema: string;
  schema_version: string;
  generated_at: string;
  content_hash: string;
  source: string;
}

export interface SnapshotEnvelope<T> {
  meta: SnapshotMeta;
  data: T;
}

export async function fetchCdnSnapshot<T>(
  category: "acoes" | "fiis" | "rankings" | "market",
  filename: string,
  options?: RequestInit
): Promise<T | null> {
  if (!CDN_BASE) {
    return null;
  }

  const url = `${CDN_BASE}/snapshots/${category}/${filename}`;
  try {
    const res = await fetch(url, {
      ...options,
      cache: options?.cache ?? "default",
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.warn(`[CDN Snapshot] Falha HTTP ${res.status} ao carregar ${url}`);
      return null;
    }

    const envelope = (await res.json()) as SnapshotEnvelope<T>;
    return envelope?.data ?? null;
  } catch (err) {
    console.warn(`[CDN Snapshot] Erro de rede ao consultar ${url}:`, err);
    return null;
  }
}

export async function getStockSnapshot(ticker: string) {
  return fetchCdnSnapshot<Record<string, unknown>>("acoes", `${ticker.toUpperCase()}.json`);
}

export async function getFIISnapshot(ticker: string) {
  return fetchCdnSnapshot<Record<string, unknown>>("fiis", `${ticker.toUpperCase()}.json`);
}

export async function getMarketOverviewSnapshot() {
  return fetchCdnSnapshot<Record<string, unknown>>("market", "overview.json");
}

export async function getRankingsSnapshot() {
  return fetchCdnSnapshot<Record<string, unknown>>("rankings", "summary.json");
}
