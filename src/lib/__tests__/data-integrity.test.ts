import { afterEach, expect, it, vi } from "vitest";
import { formatCurrency, formatPercent, formatNumber, formatDividendUnit } from "../formatters";
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

it("unknown and non-finite values are not formatted as zero", () => {
  for (const value of [Number.NaN, Infinity, -Infinity, undefined, null]) {
    expect(formatCurrency(value as number)).toBe("—");
    expect(formatPercent(value as number)).toBe("—");
    expect(formatNumber(value as number)).toBe("—");
    expect(formatDividendUnit(value as number)).toBe("—");
  }
  expect(formatPercent(0)).toBe("0,00%");
  expect(formatCurrency(1.33)).toContain("1,33");
});

it("snapshot preserves provenance and marks old generation, without inventing fact date", async () => {
  vi.stubEnv("NEXT_PUBLIC_CDN_URL", "https://snapshot.invalid");
  const meta = { schema: "market-overview", schema_version: "1.0.0", generated_at: new Date(Date.now() - 2 * 86_400_000).toISOString(), content_hash: `sha256:${"a".repeat(64)}`, source: "test-source" };
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ meta, data: { price: 12 } }) }));
  const { fetchCdnSnapshot } = await import("../snapshots");
  const result = await fetchCdnSnapshot("market", "overview.json");
  expect(result?.data).toEqual({ price: 12 });
  expect(result?.meta).toEqual(meta);
  expect(result?.freshness).toBe("stale");
});

it("rejects malformed, future and unsupported snapshot envelopes", async () => {
  vi.stubEnv("NEXT_PUBLIC_CDN_URL", "https://snapshot.invalid");
  const { fetchCdnSnapshot } = await import("../snapshots");
  const meta = { schema: "market-overview", schema_version: "1.0.0", generated_at: new Date().toISOString(), content_hash: `sha256:${"a".repeat(64)}`, source: "test-source" };
  for (const changed of [{}, { ...meta, schema_version: "999" }, { ...meta, generated_at: "invalid" }, { ...meta, generated_at: new Date(Date.now() + 86_400_000).toISOString() }]) {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ meta: changed, data: { price: 12 } }) }));
    expect(await fetchCdnSnapshot("market", "overview.json")).toBeNull();
  }
});
