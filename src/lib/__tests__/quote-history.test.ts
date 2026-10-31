import { afterEach, expect, it, vi } from "vitest";
import { getFullQuoteHistory } from "../api";

vi.mock("../cache/market-db", () => ({
  historyKey: vi.fn(() => "history"),
  readPublicHistory: vi.fn(async () => null),
  writePublicHistory: vi.fn(async () => {}),
}));
afterEach(() => vi.unstubAllGlobals());

for (const [period, count] of [["5Y", 1250], ["MAX", 6736]] as const) {
  it(`loads every quote for ${period}, including history beyond the first page`, async () => {
    const quotes = Array.from({ length: count }, (_, i) => ({ date: String(count - i), close: i + 1 }));
    const fetchMock = vi.fn(async (url: string) => {
      const params = new URL(url, "http://localhost").searchParams;
      const offset = Number(params.get("offset"));
      const limit = Number(params.get("limit"));
      expect(params.get("timeframe")).toBe(period);
      return { ok: true, text: async () => JSON.stringify({ ticker: "PETR4", timeframe: period, adjusted: true,
        total_days: count, data: quotes.slice(offset, offset + limit) }) };
    });
    vi.stubGlobal("fetch", fetchMock);
    const history = await getFullQuoteHistory("PETR4", period);
    expect(history.data).toEqual(quotes);
    expect(fetchMock).toHaveBeenCalledTimes(Math.ceil(count / 5000));
  });
}

it("rejects a missing continuation page instead of displaying an incomplete period", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({
    ticker: "PETR4", total_days: 2, data: [],
  }) }));
  await expect(getFullQuoteHistory("PETR4", "MAX")).rejects.toThrow("Histórico incompleto");
});
