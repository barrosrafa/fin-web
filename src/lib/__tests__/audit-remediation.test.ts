import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it("every API request receives a bounded signal even without caller cancellation", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "[]" });
  vi.stubGlobal("fetch", fetchMock);
  const { getAssets } = await import("../api");
  await getAssets("FII");
  expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
});

it("caller cancellation propagates through the combined deadline signal", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "[]", headers: new Headers() });
  vi.stubGlobal("fetch", fetchMock);
  const { getAssetsPaginated } = await import("../api");
  const controller = new AbortController();
  await getAssetsPaginated({ signal: controller.signal });
  const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
  controller.abort();
  expect(signal.aborted).toBe(true);
});

it("provenance uses explicit fact time and can render without reading a clock", async () => {
  const { quoteProvenance } = await import("../quote-provenance");
  const now = Date.parse("2026-11-01T12:00:00Z");
  expect(quoteProvenance("B3", "2026-10-30", now).mode).toBe("periodic");
  expect(quoteProvenance("B3", "2026-10-01", now).mode).toBe("stale");
  expect(quoteProvenance("B3", "2026-11-02", now).mode).toBe("missing");
  const spy = vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("clock read during prerender"); });
  expect(quoteProvenance("B3", "2026-10-30").mode).toBe("periodic");
  spy.mockRestore();
});
