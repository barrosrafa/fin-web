import "server-only";
import { cacheLife } from "next/cache";
import type { CmsSnapshot } from "@/components/content/Cms";

export async function getCmsSnapshot(): Promise<CmsSnapshot> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 60, expire: 300 });
  const backend = (process.env.API_BACKEND_URL || (process.env.NODE_ENV === "development" ? "http://localhost:8000" : ""))
    .replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
  async function read(dataset: string): Promise<Record<string, unknown>[]> {
    if (!backend) return [];
    try {
      const response = await fetch(`${backend}/api/v1/content/${dataset}`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
      if (!response.ok) return [];
      const body = await response.json();
      return Array.isArray(body.data) ? body.data : [];
    } catch { return []; }
  }
  const [texts, flags] = await Promise.all([read("ui-texts"), read("feature-flags")]);
  return {
    texts: Object.fromEntries(texts.filter(row => typeof row.text_key === "string" && typeof row.value === "string").map(row => [row.text_key, row.value])),
    flags: Object.fromEntries(flags.filter(row => typeof row.flag_key === "string" && typeof row.enabled === "boolean").map(row => [row.flag_key, row.enabled])),
  };
}
