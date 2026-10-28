/**
 * Canonical asset route resolver for the FIN platform.
 * Guarantees that tickers, indices, currencies, ETFs and FIIs always route to the correct page.
 */

const KNOWN_INDICES = new Set([
  "IBOV",
  "IBOVESPA",
  "IFIX",
  "SP500",
  "S&P 500",
  "SELIC",
  "CDI",
  "IPCA",
  "USD/BRL",
  "DOLAR",
  "EURO",
]);

const KNOWN_ETFS = new Set([
  "BOVA11",
  "IVVB11",
  "SMAL11",
  "HASH11",
  "DEBB11",
  "BITH11",
  "SPXI11",
  "XINA11",
  "GOLD11",
  "NASD11",
  "ACWI11",
  "LFTS11",
  "CDIB11",
  "5PRE11",
  "LFIN11",
  "CMDB11",
]);

export function resolveAssetHref(ticker: string, assetType?: string): string {
  if (!ticker) return "/acoes";
  const t = ticker.toUpperCase().trim();

  // 1. Economic Indicators & Macro Indices
  if (KNOWN_INDICES.has(t) || assetType === "INDEX" || assetType === "MACRO") {
    return `/indicadores-economicos?asset=${encodeURIComponent(t)}`;
  }

  // 2. ETFs (B3 and International)
  if (assetType === "ETF" || KNOWN_ETFS.has(t)) {
    return `/etfs/${t}`;
  }

  // 3. FIIs (Real Estate Funds ending in 11 that aren't ETFs)
  if (assetType === "FII" || (t.endsWith("11") && !KNOWN_ETFS.has(t))) {
    return `/fiis/${t}`;
  }

  // 4. BDRs
  if (assetType === "BDR" || t.endsWith("34") || t.endsWith("35") || t.endsWith("39")) {
    return `/acoes/${t}`;
  }

  // 5. Default to Equities / Ações
  return `/acoes/${t}`;
}
