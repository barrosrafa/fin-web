type Payment = { date_payment: string; value_per_share: number };

export function dividendSummary(payments: Payment[], currentPrice: number, asOfDay: string) {
  const cutoff = new Date(`${asOfDay}T12:00:00Z`);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 1);
  const cutoffDay = cutoff.toISOString().slice(0, 10);
  const paid = payments.filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date_payment)
    && p.date_payment < asOfDay && Number.isFinite(p.value_per_share));
  const recent = paid.filter((p) => p.date_payment >= cutoffDay);
  const lastDay = paid.map((p) => p.date_payment).sort().at(-1);
  const lastDiv = lastDay ? paid.filter((p) => p.date_payment === lastDay)
    .reduce((sum, p) => sum + p.value_per_share, 0) : null;
  const totalPaid12m = recent.length ? recent.reduce((sum, p) => sum + p.value_per_share, 0) : null;
  return {
    lastDiv,
    totalPaid12m,
    avgMonthly: totalPaid12m === null ? null : totalPaid12m / 12,
    dy12m: totalPaid12m !== null && currentPrice > 0 ? totalPaid12m / currentPrice * 100 : null,
  };
}
