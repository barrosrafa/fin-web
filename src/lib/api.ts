import {
  AssetSummary,
  ChecklistItem,
  DREEntry,
  DividendEntry,
  FIIProperty,
  BrickScoreAxis,
  QuantRiskMatrix,
  TechnicalIndicators,
  AICommitteeVerdict,
  OptionContract,
  StockBorrowingBTC,
  BuybackProgram,
  FundHoldingCDA,
} from "@/schemas/financial";
import {
  FinancialMatrixData,
  ConsistencyScreenerAsset,
  StockRankingRow,
  FIIRankingRow,
  FIIVacancyHistoryData,
  IbovPEHistoryItem,
  InvestorFlowItem,
  EarningsCalendarRow,
  DividendMatrixData,
  GovernmentAccountsRow,
  CreditSystemRow,
} from "@/schemas/oceans14";

export const API_BASE =
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
  // The backend serializes missing values as JSON `null`, while the frontend
  // schemas model them as optional (`undefined`). Normalize object properties so
  // checks like `x !== undefined` followed by `x.toFixed()` don't crash on null.
  const text = await res.text();
  return JSON.parse(text, function (this: unknown, _key: string, value: unknown) {
    return value === null && !Array.isArray(this) ? undefined : value;
  }) as T;
}

/**
 * The API serializes nested structures (properties, risk matrix, options, BTC,
 * buybacks, CDA holdings) in snake_case, while the shared Zod schemas used by the
 * UI expect camelCase. Convert keys recursively for those nested payloads.
 */
function camelizeKeys<T>(value: unknown): T {
  if (Array.isArray(value)) return value.map((v) => camelizeKeys(v)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase())] = camelizeKeys(v);
    }
    return out as T;
  }
  return value as T;
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

export const getDividendCalendar = getDividends;

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
    const data = await fetchJson<FIIDetailData>(`/fiis/${ticker}`);
    return { ...data, properties: camelizeKeys<FIIProperty[]>(data.properties ?? []) };
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
    const data = await fetchJson<DerivativesData>(`/derivatives/${ticker}/options-chain`);
    return {
      ...data,
      calls: camelizeKeys<OptionContract[]>(data.calls ?? []),
      puts: camelizeKeys<OptionContract[]>(data.puts ?? []),
      btc_borrowing: camelizeKeys<StockBorrowingBTC>(data.btc_borrowing),
      buybacks: camelizeKeys<BuybackProgram[]>(data.buybacks ?? []),
    };
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

export interface StockDetails {
  ticker: string;
  name: string;
  tipo?: string;
  classe_acao?: string;
  sector?: string;
  subsector?: string;
  segmento?: string;
  current_price: number;
  data_cotacao?: string;
  min_52_semanas?: number;
  max_52_semanas?: number;
  volume_medio_2m?: number;
  valor_mercado?: number;
  valor_firma?: number;
  numero_acoes?: number;
  is_financial_institution: boolean;
}

export interface StockMultiples {
  ticker: string;
  pl?: number;
  pvp?: number;
  pebit?: number;
  psr?: number;
  p_ativos?: number;
  p_cap_giro?: number;
  p_ativo_circ_liq?: number;
  dividend_yield?: number;
  ev_ebitda?: number;
  ev_ebit?: number;
  margem_bruta?: number;
  margem_ebit?: number;
  margem_liquida?: number;
  roic?: number;
  roe?: number;
  liquidez_corrente?: number;
  div_bruta_patrimonio?: number;
  giro_ativos?: number;
  lpa?: number;
  vpa?: number;
}

export interface StockFinancials {
  ticker: string;
  is_financial_institution: boolean;
  data_balanco?: string;
  ativo_total?: number;
  disponibilidades?: number;
  ativo_circulante?: number;
  divida_bruta?: number;
  divida_liquida?: number;
  patrimonio_liquido?: number;
  receita_liquida_12m?: number;
  receita_liquida_3m?: number;
  ebit_12m?: number;
  ebit_3m?: number;
  lucro_liquido_12m?: number;
  lucro_liquido_3m?: number;
  carteira_credito?: number;
  depositos?: number;
  resultado_intermediacao_12m?: number;
  resultado_intermediacao_3m?: number;
  receita_servicos_12m?: number;
  receita_servicos_3m?: number;
}

export interface StockCompleteDetails {
  details: StockDetails;
  multiples: StockMultiples;
  financials: StockFinancials;
}

export async function getStockCompleteDetails(ticker: string): Promise<StockCompleteDetails | null> {
  try {
    return await fetchJson<StockCompleteDetails>(`/stocks/${ticker}`);
  } catch (err) {
    console.error(`Failed to fetch complete stock details for ${ticker}:`, err);
    return null;
  }
}

export async function getFundRiskMatrix(fundId: string = "cvm175-macro"): Promise<FundRiskMatrixData | null> {
  try {
    const data = await fetchJson<FundRiskMatrixData>(`/funds/${fundId}/risk-matrix`);
    const matrix = camelizeKeys<Array<QuantRiskMatrix & { volatilityPct?: number; maxDrawdownPct?: number }>>(
      data.matrix ?? []
    ).map((row) => ({
      ...row,
      volatility: row.volatility ?? row.volatilityPct ?? 0,
      maxDrawdown: row.maxDrawdown ?? row.maxDrawdownPct ?? 0,
    }));
    return {
      ...data,
      matrix,
      cda_holdings: camelizeKeys<FundHoldingCDA[]>(data.cda_holdings ?? []),
    };
  } catch (err) {
    console.error(`Failed to fetch fund risk matrix for ${fundId}:`, err);
    return null;
  }
}

// ==========================================
// OCEANS14 FINANCIAL & QUANTITATIVE HELPERS
// ==========================================

export async function getStocksRanking(
  sortBy: string = "dy",
  limit: number = 50
): Promise<StockRankingRow[]> {
  try {
    return await fetchJson<StockRankingRow[]>(`/stocks/ranking?sort_by=${sortBy}&limit=${limit}`);
  } catch (err) {
    console.error("Failed to fetch stocks ranking:", err);
    return [];
  }
}

export async function getConsistencyScreener(
  minYears: number = 5,
  minCagr?: number
): Promise<ConsistencyScreenerAsset[]> {
  try {
    const cagrParam = minCagr !== undefined ? `&min_cagr=${minCagr}` : "";
    return await fetchJson<ConsistencyScreenerAsset[]>(
      `/stocks/screener/consistency?min_years=${minYears}${cagrParam}`
    );
  } catch (err) {
    console.error("Failed to fetch consistency screener:", err);
    return [];
  }
}

export async function getStockFinancialMatrix(
  ticker: string,
  periodType: "ANUAL" | "TRIMESTRAL" = "ANUAL"
): Promise<FinancialMatrixData | null> {
  try {
    return await fetchJson<FinancialMatrixData>(
      `/stocks/${ticker}/financials/matrix?period_type=${periodType}`
    );
  } catch (err) {
    console.error(`Failed to fetch financial matrix for ${ticker}:`, err);
    return null;
  }
}

export async function getStockDividendMatrix(
  ticker: string
): Promise<DividendMatrixData | null> {
  try {
    return await fetchJson<DividendMatrixData>(`/stocks/${ticker}/dividends/matrix`);
  } catch (err) {
    console.error(`Failed to fetch dividend matrix for ${ticker}:`, err);
    return null;
  }
}

export async function getFIIRanking(
  sortBy: string = "dy",
  limit: number = 50
): Promise<FIIRankingRow[]> {
  try {
    return await fetchJson<FIIRankingRow[]>(`/fiis/ranking?sort_by=${sortBy}&limit=${limit}`);
  } catch (err) {
    console.error("Failed to fetch FII ranking:", err);
    return [];
  }
}

export async function getFIIVacancyHistory(
  ticker: string
): Promise<FIIVacancyHistoryData | null> {
  try {
    return await fetchJson<FIIVacancyHistoryData>(`/fiis/${ticker}/vacancy-history`);
  } catch (err) {
    console.error(`Failed to fetch FII vacancy history for ${ticker}:`, err);
    return null;
  }
}

export async function getIbovPEHistory(
  limit: number = 60
): Promise<IbovPEHistoryItem[]> {
  try {
    const res = await fetchJson<{ total_records: number; items: IbovPEHistoryItem[] }>(
      `/market/ibov-pe-history?limit=${limit}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch IBOV PE history:", err);
    return [];
  }
}

export async function getInvestorFlows(
  limit: number = 60
): Promise<InvestorFlowItem[]> {
  try {
    const res = await fetchJson<{ total_records: number; items: InvestorFlowItem[] }>(
      `/market/investor-flows?limit=${limit}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch investor flows:", err);
    return [];
  }
}

export async function getEarningsCalendar(
  limit: number = 50
): Promise<EarningsCalendarRow[]> {
  try {
    const res = await fetchJson<{ total: number; items: EarningsCalendarRow[] }>(
      `/market/earnings-calendar?limit=${limit}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch earnings calendar:", err);
    return [];
  }
}

export async function getGovernmentAccounts(
  limit: number = 36
): Promise<GovernmentAccountsRow[]> {
  try {
    const res = await fetchJson<{ total_records: number; items: GovernmentAccountsRow[] }>(
      `/macro/government-accounts?limit=${limit}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch government accounts:", err);
    return [];
  }
}

export async function getCreditSystem(
  limit: number = 36
): Promise<CreditSystemRow[]> {
  try {
    const res = await fetchJson<{ total_records: number; items: CreditSystemRow[] }>(
      `/macro/credit-system?limit=${limit}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch credit system indicators:", err);
    return [];
  }
}

