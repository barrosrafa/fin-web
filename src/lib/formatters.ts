/**
 * Universal formatting utilities for BRL Currency, Percentages, and Numerical Data
 */

export function formatCurrency(
  value: number,
  compact: boolean = false,
  fractionDigits: number = 2
): string {
  if (isNaN(value)) return "R$ 0,00";

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

export function formatPercent(value: number, includeSign: boolean = true): string {
  if (isNaN(value)) return "0,00%";
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function formatNumber(
  value: number,
  decimals: number = 2,
  compact: boolean = false
): string {
  if (isNaN(value)) return "0";
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
