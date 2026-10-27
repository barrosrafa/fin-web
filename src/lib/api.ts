import {
  AssetSummary,
  ValuationModel,
  ChecklistItem,
  DREEntry,
  DividendEntry,
  FIIProperty,
  BrickScoreAxis,
  QuantRiskMatrix,
  TechnicalIndicators,
  AICommitteeVerdict,
  ETFDetail,
  OptionContract,
  StockBorrowingBTC,
  BuybackProgram,
  TreasuryBond,
  FundHoldingCDA,
} from "@/schemas/financial";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API error [${res.status}] on ${path}: ${res.statusText}`);
  }
  return res.json();
}

export interface BenchmarkItem {
  name: string;
  ticker: string;
  value: number;
  change: number;
  sparkline: number[];
}

export interface DividendCalendarItem {
  id: string;
  assetTicker: string;
  type: "DIVIDENDO" | "JCP" | "RENDIMENTO";
  referenceMonth: string;
  dateCom: string;
  paymentDate: string;
  valuePerShare: number;
  yieldOnCostPct: number;
}

export interface ScreenerFilterParams {
  asset_class?: string;
  min_dy?: number;
  max_pl?: number;
  max_pvp?: number;
  min_roe?: number;
  sector?: string;
  limit?: number;
}

export interface ScreenerItem {
  ticker: string;
  name: string;
  asset_class: string;
  sector: string;
  price: number;
  change_24h: number;
  dy_pct: number;
  pvp?: number;
  pl?: number;
  roe_pct?: number;
  liquidity_daily: number;
}

export interface ScreenerQueryResult {
  total: number;
  items: ScreenerItem[];
}

export interface StockValuationDetail {
  ticker: string;
  name: string;
  current_price: number;
  lpa: number;
  vpa: number;
  dpa_medio: number;
  graham_fair_value: number;
  graham_upside_pct: number;
  bazin_ceiling_price: number;
  bazin_upside_pct: number;
  gordon_fair_value?: number;
  dcf_intrinsic_value: number;
  dcf_upside_pct: number;
  margin_of_safety_pct: number;
  checklist: ChecklistItem[];
  dre_history: DREEntry[];
  dividends: DividendEntry[];
  technical?: TechnicalIndicators;
  ai_verdict?: AICommitteeVerdict;
  revenue_by_segment: Array<{ segment_name: string; revenue_amount: number; percentage: number }>;
  revenue_by_geography: Array<{ segment_name: string; revenue_amount: number; percentage: number }>;
  consensus?: {
    target_price_min: number;
    target_price_avg: number;
    target_price_max: number;
    recommendation: string;
    analysts_count: number;
    forecast_2026: Record<string, number>;
    forecast_2027: Record<string, number>;
  };
}

export interface FIIDetailData {
  ticker: string;
  name: string;
  segment: string;
  current_price: number;
  pvp: number;
  dividend_yield_12m: number;
  net_worth: number;
  physical_vacancy_pct: number;
  financial_vacancy_pct: number;
  wault_years: number;
  properties: FIIProperty[];
  brick_score: BrickScoreAxis[];
  top_tenants: Array<{
    tenant_name: string;
    sector: string;
    revenue_pct: number;
    contract_type: string;
  }>;
  cri_portfolio: Array<{
    code: string;
    debtor: string;
    indexer: string;
    coupon_pct: number;
    ltv_pct: number;
    guarantees: string;
    rating?: string;
  }>;
  quarterly_dre?: Record<string, number>;
}

export interface ETFDetailData {
  ticker: string;
  name: string;
  benchmark_index: string;
  provider: string;
  current_price: number;
  nav_per_share: number;
  nav_spread_pct: number;
  ter_pct: number;
  primary_fee_pct: number;
  secondary_fee_pct: number;
  policy: "ACUMULATIVO" | "DISTRIBUTIVO";
  shares_lending_pct: number;
  max_lending_limit_pct: number;
  underlying_holdings: Array<{
    ticker: string;
    name: string;
    weight_pct: number;
    sector: string;
  }>;
  flow_history_30d: Array<{
    date: string;
    flow_millions: number;
    shares_count: number;
  }>;
}

export interface FixedIncomeData {
  bonds: Array<{
    name: string;
    type: "SELIC" | "PREFIXADO" | "IPCA";
    maturity_date: string;
    annual_rate_pct: number;
    unit_price: number;
    min_investment_value: number;
  }>;
  ettj_curves: Array<{
    term_years: number;
    zero_rate_pct: number;
    inflation_implied_pct?: number;
  }>;
}

export interface DerivativesData {
  underlying: string;
  spot_price: number;
  calls: OptionContract[];
  puts: OptionContract[];
  btc_borrowing: StockBorrowingBTC;
  buybacks: BuybackProgram[];
}

export interface ComparatorResult {
  tickers: string[];
  metrics: Array<{
    ticker: string;
    price: number;
    change_12m: number;
    dy_pct: number;
    pvp: number;
    pl: number;
    volatility_pct: number;
    sharpe: number;
  }>;
  series: Array<{
    date: string;
    values: Record<string, number>;
  }>;
}

export interface AIAlert {
  id: string;
  ticker: string;
  type: string;
  title: string;
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
  score: number;
  time: string;
  summary: string;
}

export interface AISentimentData {
  ticker: string;
  sentiment: "BULLISH" | "NEUTRAL" | "BEARISH";
  confidence_score: number;
  executive_summary: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  material_facts_count: number;
  anomalies: string[];
  last_analyzed_doc?: string;
  timestamp?: string;
}

export interface DemoPosition {
  ticker: string;
  type: string;
  shares: number;
  price: number;
  total: number;
  yieldAnn: number;
  monthlyEstimate: number;
}

export interface FundRiskMatrixData {
  fund_id: string;
  name: string;
  cnpj: string;
  category_cvm175: string;
  benchmark: string;
  net_worth: number;
  matrix: QuantRiskMatrix[];
  cda_holdings: FundHoldingCDA[];
}

// ==========================================
// API Client Functions (Zero Mocks / Live DB)
// ==========================================

export async function getBenchmarks(): Promise<BenchmarkItem[]> {
  try {
    return await fetchJson<BenchmarkItem[]>("/market/benchmarks");
  } catch (err) {
    console.error("Failed to fetch benchmarks:", err);
    return [];
  }
}

export async function getAssets(
  type?: string,
  limit: number = 50
): Promise<AssetSummary[]> {
  try {
    const q = new URLSearchParams();
    if (type && type !== "TODOS") q.set("asset_type", type);
    q.set("limit", limit.toString());
    return await fetchJson<AssetSummary[]>(`/market/assets?${q.toString()}`);
  } catch (err) {
    console.error("Failed to fetch assets:", err);
    return [];
  }
}

export async function getDividends(limit: number = 15): Promise<DividendCalendarItem[]> {
  try {
    return await fetchJson<DividendCalendarItem[]>(`/market/dividends?limit=${limit}`);
  } catch (err) {
    console.error("Failed to fetch dividends:", err);
    return [];
  }
}

export async function queryScreener(
  params: ScreenerFilterParams
): Promise<ScreenerQueryResult> {
  try {
    return await fetchJson<ScreenerQueryResult>("/screener/query", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch (err) {
    console.error("Failed to query screener:", err);
    return { total: 0, items: [] };
  }
}

export async function getStockValuation(ticker: string): Promise<StockValuationDetail | null> {
  try {
    return await fetchJson<StockValuationDetail>(`/stocks/${ticker}/valuation`);
  } catch (err) {
    console.error(`Failed to fetch stock valuation for ${ticker}:`, err);
    return null;
  }
}

export async function getFIIDetail(ticker: string): Promise<FIIDetailData | null> {
  try {
    return await fetchJson<FIIDetailData>(`/fiis/${ticker}`);
  } catch (err) {
    console.error(`Failed to fetch FII detail for ${ticker}:`, err);
    return null;
  }
}

export async function getETFDetail(ticker: string): Promise<ETFDetailData | null> {
  try {
    return await fetchJson<ETFDetailData>(`/etfs/${ticker}`);
  } catch (err) {
    console.error(`Failed to fetch ETF detail for ${ticker}:`, err);
    return null;
  }
}

export async function getFixedIncome(): Promise<FixedIncomeData> {
  try {
    return await fetchJson<FixedIncomeData>("/fixed-income/treasury");
  } catch (err) {
    console.error("Failed to fetch fixed income:", err);
    return { bonds: [], ettj_curves: [] };
  }
}

export async function getDerivatives(ticker: string): Promise<DerivativesData | null> {
  try {
    return await fetchJson<DerivativesData>(`/derivatives/${ticker}/options-chain`);
  } catch (err) {
    console.error(`Failed to fetch derivatives for ${ticker}:`, err);
    return null;
  }
}

export async function compareAssets(
  tickers: string[],
  timeframe: string = "12M"
): Promise<ComparatorResult | null> {
  try {
    return await fetchJson<ComparatorResult>("/comparator/compare", {
      method: "POST",
      body: JSON.stringify({ tickers, timeframe }),
    });
  } catch (err) {
    console.error("Failed to compare assets:", err);
    return null;
  }
}

export async function getAIAlerts(): Promise<AIAlert[]> {
  try {
    return await fetchJson<AIAlert[]>("/intelligence/alerts");
  } catch (err) {
    console.error("Failed to fetch AI alerts:", err);
    return [];
  }
}

export async function getAISentiment(ticker: string): Promise<AISentimentData | null> {
  try {
    return await fetchJson<AISentimentData>(`/intelligence/sentiment/${ticker}`);
  } catch (err) {
    console.error(`Failed to fetch AI sentiment for ${ticker}:`, err);
    return null;
  }
}

export async function getDemoPortfolioPositions(): Promise<DemoPosition[]> {
  try {
    return await fetchJson<DemoPosition[]>("/portfolio/demo/positions");
  } catch (err) {
    console.error("Failed to fetch demo portfolio positions:", err);
    return [];
  }
}

export async function getFundRiskMatrix(fundId: string = "cvm175-macro"): Promise<FundRiskMatrixData | null> {
  try {
    return await fetchJson<FundRiskMatrixData>(`/funds/${fundId}/risk-matrix`);
  } catch (err) {
    console.error(`Failed to fetch fund risk matrix for ${fundId}:`, err);
    return null;
  }
}
