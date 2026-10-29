import "fake-indexeddb/auto";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { historyKey, readPublicHistory, writePublicHistory } from "../cache/market-db";
beforeEach(async () => {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase("fin-public-history-v1");
    request.onsuccess = () => resolve(); request.onerror = () => reject(request.error);
  });
});
afterEach(() => vi.restoreAllMocks());
it("keeps public history separate by instrument, adjustment and schema", async () => {
  const key = historyKey("PETR4", "1Y", true, 500, 0);
  await writePublicHistory(key, { price: 12, asOf: "2026-10-26" });
  expect(await readPublicHistory(key)).toEqual({ price: 12, asOf: "2026-10-26" });
  expect(await readPublicHistory(historyKey("VALE3", "1Y", true, 500, 0))).toBeNull();
  expect(await readPublicHistory(historyKey("PETR4", "1Y", false, 500, 0))).toBeNull();
});
it("expires historical payloads instead of using them indefinitely", async () => {
  const now = Date.now();
  await writePublicHistory("old", { price: 12 });
  vi.spyOn(Date, "now").mockReturnValue(now + 8 * 86_400_000);
  expect(await readPublicHistory("old")).toBeNull();
});
it("evicts oldest entries within the payload budget", async () => {
  const payload = "a".repeat(13 * 1024 * 1024);
  await writePublicHistory("oldest", payload);
  await writePublicHistory("newest", payload);
  expect(await readPublicHistory("oldest")).toBeNull();
  expect((await readPublicHistory<string>("newest"))?.length).toBe(payload.length);
});
