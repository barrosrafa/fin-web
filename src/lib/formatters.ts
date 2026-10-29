/**
 * Universal formatting utilities for BRL Currency, Percentages, and Numerical Data
 */

export function formatCurrency(
  value?: number | null,
  compact: boolean = false,
  fractionDigits: number = 2
): string {
  if (value == null || !Number.isFinite(value)) return "—";

  if (compact) {
    if (Math.abs(value) >= 1_000_000_000_000) {
      return `R$ ${(value / 1_000_000_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}T`;
    }
    if (Math.abs(value) >= 1_000_000_000) {
      return `R$ ${(value / 1_000_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `R$ ${(value / 1_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}k`;
    }
  }

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(value?: number | null, includeSign: boolean = true): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function formatNumber(
  value?: number | null,
  decimals: number = 2,
  compact: boolean = false
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
      })}M`;
    }
  }
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Multiple formatter (e.g. 1,32x, 5,90x) using pt-BR comma convention
 */
export function formatMultiple(
  value?: number | null,
  decimals: number = 2,
  fallback: string = "—"
): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return fallback;
  return `${formatNumber(value, decimals)}x`;
}

/**
 * Preserves 4 decimal places for unit share dividends (e.g. R$ 0,4460) as required by D1.
 */
export function formatDividendUnit(value?: number | null): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return "—";
  // If the value has fractions beyond 2 decimals, format with 4 decimals
  const hasSubCents = Math.abs(value * 100 - Math.round(value * 100)) > 0.001;
  const decimals = hasSubCents ? 4 : 2;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: 4,
  });
}

/**
 * Percent with pt-BR comma and configurable sign
 */
export function formatPercentPtBr(
  value?: number | null,
  includeSign: boolean = false,
  decimals: number = 2,
  fallback: string = "—"
): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return fallback;
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

/**
 * Graham Fair Value Formula
 * V = sqrt(22.5 * LPA * VPA)
 */
export function calculateGrahamValue(lpa: number, vpa: number): number {
  if (lpa <= 0 || vpa <= 0) return 0;
  return Math.sqrt(22.5 * lpa * vpa);
}

/**
 * Bazin Ceiling Price Formula
 * P = DPA / expectedYield (default 6%)
 */
export function calculateBazinPrice(dpa: number, targetYield: number = 0.06): number {
  if (dpa <= 0 || targetYield <= 0) return 0;
  return dpa / targetYield;
}

/**
 * Magic Number calculation (number of shares needed to buy 1 share each month)
 */
export function calculateMagicNumber(sharePrice: number, monthlyDividend: number): number {
  if (monthlyDividend <= 0 || sharePrice <= 0) return 0;
  return Math.ceil(sharePrice / monthlyDividend);
}
