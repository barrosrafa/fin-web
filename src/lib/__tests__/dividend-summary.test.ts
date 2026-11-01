import { describe, expect, it } from "vitest";
import { dividendSummary } from "../dividend-summary";

describe("confirmed dividend summaries", () => {
  it("uses payment dates and all installments rather than the first twelve events", () => {
    const payments = Array.from({ length: 24 }, (_, i) => ({
      date_payment: `2026-${String(Math.floor(i / 3) + 1).padStart(2, "0")}-15`, value_per_share: 0.1,
    }));
    payments.unshift({ date_payment: "2026-12-21", value_per_share: 99 });
    payments.push({ date_payment: "2024-12-21", value_per_share: 99 });
    const result = dividendSummary(payments, 100, "2026-11-01");
    expect(result.totalPaid12m).toBeCloseTo(2.4, 10);
    expect(result.avgMonthly).toBeCloseTo(0.2, 10);
    expect(result.lastDiv).toBeCloseTo(0.3, 10);
    expect(result.dy12m).toBeCloseTo(2.4, 10);
  });

  it("keeps unavailable history and yield unknown", () => {
    expect(dividendSummary([], 0, "2026-11-01")).toEqual({
      lastDiv: null, totalPaid12m: null, avgMonthly: null, dy12m: null,
    });
    expect(dividendSummary([{ date_payment: "2026-12-21", value_per_share: 0.67407131 }], 0,
      "2026-11-01").lastDiv).toBeNull();
  });
});
