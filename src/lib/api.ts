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
  SimulatePortfolioRequest,
  SimulatePortfolioResponse,
  RankingsResponse,
  ComparatorResult,
  AssetComparisonMetrics,
  HoldingsOverlapAnalysis,
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

import {
  CDN_BASE,
  fetchCdnSnapshot,
  getStockSnapshot,
  getFIISnapshot,
  getMarketOverviewSnapshot,
  getRankingsSnapshot,
} from "./snapshots";

export {
  CDN_BASE,
  fetchCdnSnapshot,
  getStockSnapshot,
  getFIISnapshot,
  getMarketOverviewSnapshot,
  getRankingsSnapshot,
};

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
export const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, "")}/api/v1`)
  : (typeof window !== "undefined" ? "/api/v1" : "https://fin-api-jbrz.onrender.com/api/v1");

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fin_token");
}

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = getStoredToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const defaultCache = options?.cache ?? (token ? "no-store" : "default");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    cache: defaultCache,
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

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

async function fetchWithHeaders<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T; headers: Headers }> {
  const url = `${API_BASE}${path}`;
  const token = getStoredToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const defaultCache = options?.cache ?? (token ? "no-store" : "default");
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options?.headers,
    },
    cache: defaultCache,
  });
  if (!res.ok) {
    throw new Error(`API error [${res.status}] on ${path}: ${res.statusText}`);
  }
  const text = await res.text();
  const data = JSON.parse(text, function (this: unknown, _key: string, value: unknown) {
    return value === null && !Array.isArray(this) ? undefined : value;
  }) as T;
  return { data, headers: res.headers };
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
  type: "DIVIDENDO" | "JCP" | "RENDIMENTO" | string;
  referenceMonth: string;
  dateCom: string;
  dateEx?: string;
  paymentDate: string;
  valuePerShare: number;
  yieldOnCostPct: number;
  status?: "FUTURO" | "PAGO" | string;
  sourceUrl?: string;
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

export interface FIICadastralData {
  legal_name?: string;
  cnpj?: string;
  trading_code: string;
  administrator_name?: string;
  administrator_cnpj?: string;
  administrator_address?: string;
  administrator_phone?: string;
  administrator_site?: string;
  manager_name?: string;
  mandate?: string;
  target_audience?: string;
  duration_term?: string;
  management_type?: string;
  admin_fee_desc?: string;
  shares_count?: number;
  shareholders_count?: number;
}

export interface FIIIndicatorsData {
  pvp: number;
  vp_per_share: number;
  dividend_yield_12m: number;
  last_dividend: number;
  expense_pct: number;
  cash_pct: number;
  default_pct: number;
  physical_vacancy_pct: number;
  financial_vacancy_pct: number;
  shares_count: number;
  shareholders_count: number;
  market_cap: number;
  daily_trades: number;
  daily_volume: number;
  net_worth: number;
  change_1d: number;
  change_12m: number;
  min_52w: number;
  max_52w: number;
  cagr_dividends_3y: number;
  cagr_share_value_3y: number;
  quote_datetime?: string;
}

export interface FIIDividendItem {
  id: string;
  type: string;
  reference_month?: string;
  date_approval?: string;
  date_com: string;
  date_ex?: string;
  date_payment: string;
  value_per_share: number;
  yield_pct: number;
  status: string;
}

export interface FIIDisclosureItem {
  document_id: string;
  document_type: string;
  title: string;
  document_date: string;
  published_at?: string;
  source_url?: string;
  external_id?: string;
  ai_summary?: string;
  ai_sentiment?: string;
}

export interface FIIBalanceSheetData {
  data_referencia: string;
  total_assets: number;
  liquid_assets: {
    caixa: number;
    titulos_publicos: number;
    titulos_privados: number;
    renda_fixa: number;
    total: number;
  };
  investments: {
    imoveis: number;
    fiis: number;
    cris: number;
    outros: number;
    total: number;
  };
  receivables: {
    alugueis: number;
    venda_imoveis: number;
    outros: number;
    total: number;
  };
  total_liabilities: {
    rendimentos_distribuir: number;
    taxa_administracao: number;
    taxa_performance: number;
    outros_valores_pagar: number;
    total: number;
  };
  net_worth: number;
}

export interface FIILucratividadeData {
  rental_income: number;
  property_sale_income: number;
  securities_income: number;
  financial_income: number;
  operating_expenses: number;
  admin_fee_expense: number;
  other_expenses: number;
  net_profit: number;
  distributed_per_share: number;
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
  cadastral?: FIICadastralData;
  indicators?: FIIIndicatorsData;
  dividends?: FIIDividendItem[];
  disclosures?: FIIDisclosureItem[];
  balance_sheet?: FIIBalanceSheetData;
  lucratividade?: FIILucratividadeData;
}

export interface ETFDrawdownData {
  ticker: string;
  max_drawdown_pct: number;
  valley_date?: string | null;
  recovery_days?: number | null;
  drawdown_curve: Array<[timestamp: number, pct: number]>;
}

export interface ETFDetailData {
  ticker: string;
  name: string;
  benchmark_index: string;
  provider: string;
  current_price: number;
  nav_per_share?: number | null;
  nav_spread_pct?: number | null;
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
  drawdown?: ETFDrawdownData | null;
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

export type { ComparatorResult, AssetComparisonMetrics, HoldingsOverlapAnalysis };

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
    if (CDN_BASE) {
      const snap = await fetchCdnSnapshot<{
        indices: Array<{ codigo: string; nome: string; valor: number; variacao_pct: number }>;
      }>("market", "overview.json");
      if (snap?.indices && snap.indices.length > 0) {
        return snap.indices.map((idx) => ({
          name: idx.nome,
          ticker: idx.codigo,
          value: idx.valor,
          change: idx.variacao_pct,
          sparkline: [idx.valor, idx.valor, idx.valor, idx.valor, idx.valor],
        }));
      }
    }
    return await fetchJson<BenchmarkItem[]>("/market/benchmarks");
  } catch (err) {
    console.error("Failed to fetch benchmarks:", err);
    return [];
  }
}

export async function getAssets(
  type?: string,
  limit: number = 50,
  offset: number = 0,
  search?: string,
  subsector?: string,
  sector?: string,
  sortBy?: string
): Promise<AssetSummary[]> {
  try {
    const q = new URLSearchParams();
    if (type && type !== "TODOS") q.set("asset_type", type);
    q.set("limit", limit.toString());
    if (offset > 0) q.set("offset", offset.toString());
    if (search && search.trim()) q.set("search", search.trim());
    if (subsector && subsector !== "TODOS") q.set("subsector", subsector);
    if (sector && sector !== "TODOS") q.set("sector", sector);
    if (sortBy) q.set("sort_by", sortBy);
    return await fetchJson<AssetSummary[]>(`/market/assets?${q.toString()}`);
  } catch (err) {
    console.error("Failed to fetch assets:", err);
    return [];
  }
}

export async function getAssetsPaginated(params: {
  type?: string;
  limit?: number;
  offset?: number;
  search?: string;
  subsector?: string;
  sector?: string;
  sortBy?: string;
}): Promise<PaginatedResult<AssetSummary>> {
  const { type, limit = 24, offset = 0, search, subsector, sector, sortBy } = params;
  const q = new URLSearchParams();
  if (type && type !== "TODOS") q.set("asset_type", type);
  q.set("limit", limit.toString());
  q.set("offset", offset.toString());
  if (search && search.trim()) q.set("search", search.trim());
  if (subsector && subsector !== "TODOS") q.set("subsector", subsector);
  if (sector && sector !== "TODOS") q.set("sector", sector);
  if (sortBy) q.set("sort_by", sortBy);

  try {
    const { data, headers } = await fetchWithHeaders<AssetSummary[]>(`/market/assets?${q.toString()}`);
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader ? parseInt(totalHeader, 10) : offset + data.length;
    const hasMore = offset + data.length < total;
    return { items: data, total, hasMore };
  } catch (err) {
    console.error("Failed to fetch paginated assets:", err);
    return { items: [], total: 0, hasMore: false };
  }
}

export async function getMarketSectors(assetType?: string): Promise<string[]> {
  try {
    const q = assetType ? `?asset_type=${assetType}` : "";
    return await fetchJson<string[]>(`/market/sectors${q}`);
  } catch (err) {
    console.error("Failed to fetch market sectors:", err);
    return ["TODOS"];
  }
}

export async function getMarketHighlights(assetType: string = "FII"): Promise<{
  highest_dy?: { ticker: string; dividendYield: number; name: string };
  lowest_pvp?: { ticker: string; pvp: number; name: string };
}> {
  try {
    return await fetchJson<{
      highest_dy?: { ticker: string; dividendYield: number; name: string };
      lowest_pvp?: { ticker: string; pvp: number; name: string };
    }>(`/market/highlights?asset_type=${assetType}`);
  } catch (err) {
    console.error("Failed to fetch market highlights:", err);
    return {};
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

export async function getDividendsPaginated(params: {
  ticker?: string;
  status?: "FUTURO" | "PAGO" | "ALL";
  eventType?: string;
  limit?: number;
  offset?: number;
}): Promise<PaginatedResult<DividendCalendarItem>> {
  const { ticker, status, eventType, limit = 50, offset = 0 } = params;
  const q = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (ticker && ticker.trim()) q.set("ticker", ticker.trim().toUpperCase());
  if (status && status !== "ALL") q.set("status", status);
  if (eventType && eventType !== "ALL") q.set("event_type", eventType);

  try {
    const { data, headers } = await fetchWithHeaders<DividendCalendarItem[]>(
      `/market/dividends?${q.toString()}`
    );
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader ? parseInt(totalHeader, 10) : offset + data.length;
    return { items: data, total, hasMore: offset + data.length < total };
  } catch (err) {
    console.error("Failed to fetch paginated dividends:", err);
    return { items: [], total: 0, hasMore: false };
  }
}

export interface DailyQuoteItem {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  close_adjusted: number;
  volume: number;
  pct_change: number;
  num_trades?: number;
  corporate_events?: string;
}

export interface QuoteHistoryResponse {
  ticker: string;
  timeframe: string;
  adjusted: boolean;
  total_days: number;
  data: DailyQuoteItem[];
}

export async function getQuoteHistory(
  ticker: string,
  timeframe: string = "1Y",
  adjusted: boolean = true,
  limit: number = 500,
  offset: number = 0
): Promise<QuoteHistoryResponse> {
  try {
    const q = new URLSearchParams({
      timeframe,
      adjusted: adjusted.toString(),
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return await fetchJson<QuoteHistoryResponse>(
      `/market/${encodeURIComponent(ticker)}/history?${q.toString()}`
    );
  } catch (err) {
    console.error(`Failed to fetch quote history for ${ticker}:`, err);
    return {
      ticker,
      timeframe,
      adjusted,
      total_days: 0,
      data: [],
    };
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

export async function getETFDrawdown(ticker: string): Promise<ETFDrawdownData | null> {
  try {
    return await fetchJson<ETFDrawdownData>(`/etfs/${ticker}/drawdown`);
  } catch (err) {
    console.error(`Failed to fetch ETF drawdown for ${ticker}:`, err);
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
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<StockRankingRow[]> {
  try {
    const q = new URLSearchParams({
      sort_by: sortBy,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search && search.trim()) q.set("search", search.trim());
    return await fetchJson<StockRankingRow[]>(`/stocks/ranking?${q.toString()}`);
  } catch (err) {
    console.error("Failed to fetch stocks ranking:", err);
    return [];
  }
}

export async function getStocksRankingPaginated(params: {
  sortBy?: string;
  limit?: number;
  offset?: number;
  search?: string;
  sector?: string;
  minDY?: number;
  maxPL?: number;
  maxPVP?: number;
  minROE?: number;
  minROIC?: number;
  minMargem?: number;
}): Promise<PaginatedResult<StockRankingRow>> {
  const {
    sortBy = "dy",
    limit = 50,
    offset = 0,
    search,
    sector,
    minDY,
    maxPL,
    maxPVP,
    minROE,
    minROIC,
    minMargem,
  } = params;
  const q = new URLSearchParams({
    sort_by: sortBy,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (search && search.trim()) q.set("search", search.trim());
  if (sector && sector !== "TODOS") q.set("sector", sector);
  if (minDY !== undefined) q.set("min_dy", minDY.toString());
  if (maxPL !== undefined) q.set("max_pl", maxPL.toString());
  if (maxPVP !== undefined) q.set("max_pvp", maxPVP.toString());
  if (minROE !== undefined) q.set("min_roe", minROE.toString());
  if (minROIC !== undefined) q.set("min_roic", minROIC.toString());
  if (minMargem !== undefined) q.set("min_margem", minMargem.toString());

  try {
    const { data, headers } = await fetchWithHeaders<StockRankingRow[]>(`/stocks/ranking?${q.toString()}`);
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader ? parseInt(totalHeader, 10) : offset + data.length;
    const hasMore = offset + data.length < total;
    return { items: data, total, hasMore };
  } catch (err) {
    console.error("Failed to fetch paginated stocks ranking:", err);
    return { items: [], total: 0, hasMore: false };
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
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<FIIRankingRow[]> {
  try {
    const q = new URLSearchParams({
      sort_by: sortBy,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (search && search.trim()) q.set("search", search.trim());
    return await fetchJson<FIIRankingRow[]>(`/fiis/ranking?${q.toString()}`);
  } catch (err) {
    console.error("Failed to fetch FII ranking:", err);
    return [];
  }
}

export async function getFIIRankingPaginated(params: {
  sortBy?: string;
  limit?: number;
  offset?: number;
  search?: string;
  segment?: string;
  minDY?: number;
  maxPVP?: number;
  maxVacancia?: number;
}): Promise<PaginatedResult<FIIRankingRow>> {
  const {
    sortBy = "dy",
    limit = 50,
    offset = 0,
    search,
    segment,
    minDY,
    maxPVP,
    maxVacancia,
  } = params;
  const q = new URLSearchParams({
    sort_by: sortBy,
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (search && search.trim()) q.set("search", search.trim());
  if (segment && segment !== "TODOS") q.set("segment", segment);
  if (minDY !== undefined) q.set("min_dy", minDY.toString());
  if (maxPVP !== undefined) q.set("max_pvp", maxPVP.toString());
  if (maxVacancia !== undefined) q.set("max_vacancia", maxVacancia.toString());

  try {
    const { data, headers } = await fetchWithHeaders<FIIRankingRow[]>(`/fiis/ranking?${q.toString()}`);
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader ? parseInt(totalHeader, 10) : offset + data.length;
    const hasMore = offset + data.length < total;
    return { items: data, total, hasMore };
  } catch (err) {
    console.error("Failed to fetch paginated FII ranking:", err);
    return { items: [], total: 0, hasMore: false };
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

// ==========================================
// ANÁLISE DE AÇÕES REA CLIENT METHODS & TYPES
// ==========================================

export interface DividendSimulationRequest {
  ticker?: string;
  initial_capital: number;
  monthly_contribution: number;
  time_horizon_months: number;
  initial_stock_price: number;
  monthly_dividend_per_unit: number;
  annual_inflation_rate?: number;
  annual_dividend_growth_rate?: number;
  tax_rate?: number;
  reinvest_dividends?: boolean;
}

export interface MonthlyMilestone {
  mes: number;
  cotas: number;
  patrimonio: number;
  aporte_realizado: number;
  provento_recebido: number;
  total_investido_bolso: number;
  yield_on_cost_pct: number;
}

export interface DividendSimulationResponse {
  patrimonio_final: number;
  total_aportado_bolso: number;
  total_proventos_gerados: number;
  cotas_finais: number;
  renda_mensal_final: number;
  magic_number: {
    atingido: boolean;
    mes?: number;
    cotas_necessarias?: number;
  };
  evolucao: MonthlyMilestone[];
}

export async function simulateDividends(
  req: DividendSimulationRequest
): Promise<DividendSimulationResponse> {
  return await fetchJson<DividendSimulationResponse>(
    "/analytics/simulate-dividends",
    {
      method: "POST",
      body: JSON.stringify(req),
    }
  );
}

export interface MonthlyHeatmapItem {
  month: number;
  record_date_probability_pct: number;
  payment_probability_pct: number;
  average_payout_per_unit: number;
  last_payment_year?: number;
}

export interface DividendMapEntry {
  ticker: string;
  asset_name: string;
  asset_type: string;
  monthly_heatmap: MonthlyHeatmapItem[];
}

export async function getDividendMap(
  month?: number,
  minProbability: number = 0.0
): Promise<DividendMapEntry[]> {
  try {
    const params = new URLSearchParams();
    if (month) params.set("month", month.toString());
    if (minProbability > 0) params.set("min_probability", minProbability.toString());
    const res = await fetchJson<{ total: number; items: DividendMapEntry[] }>(
      `/analytics/dividend-map?${params.toString()}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch dividend map:", err);
    return [];
  }
}

export interface DividendCalendarDetailItem {
  id_provento: number;
  ticker: string;
  tipo: string;
  data_com?: string;
  data_ex?: string;
  data_pagamento?: string;
  status?: "FUTURO" | "PAGO" | string;
  valor_bruto: number;
  aliquota_ir_pct: number;
  valor_liquido: number;
  moeda: string;
  cotacao_atual?: number;
  yield_evento_pct?: number;
}

export async function getDetailedDividendCalendar(
  limit: number = 50
): Promise<DividendCalendarDetailItem[]> {
  try {
    return await fetchJson<DividendCalendarDetailItem[]>(
      `/analytics/dividend-calendar?limit=${limit}`
    );
  } catch (err) {
    console.error("Failed to fetch detailed dividend calendar:", err);
    return [];
  }
}

export async function getDetailedDividendCalendarPaginated(params: {
  limit?: number;
  offset?: number;
  eventType?: string;
  status?: string;
  ticker?: string;
}): Promise<PaginatedResult<DividendCalendarDetailItem>> {
  const { limit = 50, offset = 0, eventType, status, ticker } = params;
  const q = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (eventType && eventType !== "ALL") q.set("event_type", eventType);
  if (status && status !== "ALL") q.set("status", status);
  if (ticker && ticker.trim()) q.set("ticker", ticker.trim().toUpperCase());

  try {
    const { data, headers } = await fetchWithHeaders<DividendCalendarDetailItem[]>(
      `/analytics/dividend-calendar?${q.toString()}`
    );
    const totalHeader = headers.get("X-Total-Count");
    const total = totalHeader ? parseInt(totalHeader, 10) : offset + data.length;
    return { items: data, total, hasMore: offset + data.length < total };
  } catch (err) {
    console.error("Failed to fetch detailed paginated dividend calendar:", err);
    return { items: [], total: 0, hasMore: false };
  }
}

export interface GlossaryItem {
  id: number;
  slug: string;
  termo: string;
  letra_inicial: string;
  categoria: string;
  definicao_curta: string;
  formula_latex?: string;
  conteudo_markdown?: string;
}

export async function getGlossary(
  letter?: string,
  q?: string
): Promise<GlossaryItem[]> {
  try {
    const params = new URLSearchParams();
    if (letter) params.set("letter", letter);
    if (q) params.set("q", q);
    const res = await fetchJson<{ total: number; items: GlossaryItem[] }>(
      `/cms/glossary?${params.toString()}`
    );
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch glossary:", err);
    return [];
  }
}

export async function getGlossaryTerm(slug: string): Promise<GlossaryItem | null> {
  try {
    return await fetchJson<GlossaryItem>(`/cms/glossary/${slug}`);
  } catch (err) {
    console.error(`Failed to fetch glossary term ${slug}:`, err);
    return null;
  }
}

export interface BookItem {
  id: number;
  slug: string;
  titulo: string;
  subtitulo?: string;
  autor: string;
  ano_publicacao?: number;
  nivel_dificuldade: string;
  categoria: string;
  resenha_markdown: string;
  principais_licoes: string[];
  avaliacao_media: number;
}

export async function getBooks(category?: string): Promise<BookItem[]> {
  try {
    const params = category ? `?category=${encodeURIComponent(category)}` : "";
    return await fetchJson<BookItem[]>(`/cms/books${params}`);
  } catch (err) {
    console.error("Failed to fetch books:", err);
    return [];
  }
}

export interface ArticleItem {
  id: number;
  slug: string;
  titulo: string;
  subtitulo?: string;
  autor_nome: string;
  categoria: string;
  tags: string[];
  tempo_leitura_min: number;
  is_premium: boolean;
  publicado_em?: string;
}

export async function getArticles(limit: number = 10): Promise<ArticleItem[]> {
  try {
    return await fetchJson<ArticleItem[]>(`/cms/articles?limit=${limit}`);
  } catch (err) {
    console.error("Failed to fetch articles:", err);
    return [];
  }
}

export interface ArticleDetail extends ArticleItem {
  conteudo_markdown: string;
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  try {
    return await fetchJson<ArticleDetail>(`/cms/articles/${slug}`);
  } catch (err) {
    console.error(`Failed to fetch article ${slug}:`, err);
    return null;
  }
}

export async function submitSupportTicket(ticket: {
  nome_contato: string;
  email_contato: string;
  assunto: string;
  mensagem: string;
}): Promise<{ id_ticket: number; status: string; mensagem_retorno: string }> {
  return await fetchJson("/cms/support/ticket", {
    method: "POST",
    body: JSON.stringify(ticket),
  });
}

export interface SuitabilityOption {
  id_opcao: number;
  ordem: number;
  texto: string;
  pontos: number;
}

export interface SuitabilityQuestion {
  id_pergunta: number;
  ordem: number;
  titulo: string;
  descricao?: string;
  eixo: string;
  opcoes: SuitabilityOption[];
}

export interface SuitabilityEvaluateResponse {
  score_total: number;
  codigo_categoria: string;
  nome_categoria: string;
  descricao: string;
  alocacao_alvo: {
    renda_fixa: number;
    fiis: number;
    acoes: number;
    internacional: number;
    cripto?: number;
  };
  recomendacoes_principais: string[];
}

export async function getSuitabilityQuestions(): Promise<SuitabilityQuestion[]> {
  try {
    return await fetchJson<SuitabilityQuestion[]>("/suitability/questions");
  } catch (err) {
    console.error("Failed to fetch suitability questions:", err);
    return [];
  }
}

export async function evaluateSuitability(
  respostas: Array<{ id_pergunta: number; id_opcao_selecionada: number }>
): Promise<SuitabilityEvaluateResponse> {
  return await fetchJson<SuitabilityEvaluateResponse>("/suitability/evaluate", {
    method: "POST",
    body: JSON.stringify({ respostas }),
  });
}

export interface BrokerItem {
  id: number;
  nome: string;
  cnpj: string;
  is_internacional: boolean;
  costs: {
    taxa_acoes: number;
    taxa_fiis: number;
    taxa_opcoes: number;
    custodia_mensal: number;
    spread_cambial_ptax_pct: number;
  };
  ratings: {
    nota_geral: number;
    total_avaliacoes: number;
  };
  plataformas_suportadas: string[];
}

export async function getBrokers(): Promise<BrokerItem[]> {
  try {
    const res = await fetchJson<{ total: number; items: BrokerItem[] }>("/brokers");
    return res.items ?? [];
  } catch (err) {
    console.error("Failed to fetch brokers:", err);
    return [];
  }
}

export interface USEquityItem {
  ticker: string;
  name: string;
  price_usd: number;
  price_brl: number;
  ptax_rate: number;
  pe_ratio?: number;
  dividend_yield_pct: number;
  market_cap_usd?: number;
  sector: string;
}

export async function getUSEquities(): Promise<USEquityItem[]> {
  try {
    return await fetchJson<USEquityItem[]>("/stocks/us");
  } catch (err) {
    console.error("Failed to fetch US equities:", err);
    return [];
  }
}

export interface REITItem {
  ticker: string;
  name: string;
  subtipo_reit: string;
  price_usd: number;
  price_brl: number;
  ptax_rate: number;
  ffo_per_share: number;
  affo_per_share: number;
  p_ffo: number;
  p_affo: number;
  ffo_payout_pct: number;
  occupancy_rate_pct: number;
  gross_dy_pct: number;
  net_dy_brl_pct: number;
  properties_count: number;
}

export async function getREITs(): Promise<REITItem[]> {
  try {
    return await fetchJson<REITItem[]>("/stocks/reits");
  } catch (err) {
    console.error("Failed to fetch REITs:", err);
    return [];
  }
}

export interface PlanItem {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  badge: string;
  features: string[];
  restricted_features: string[];
}

export async function getBillingPlans(): Promise<PlanItem[]> {
  try {
    const res = await fetchJson<{ plans: PlanItem[] }>("/billing/plans");
    return res.plans ?? [];
  } catch (err) {
    console.error("Failed to fetch billing plans:", err);
    return [];
  }
}

// =============================================================================
// ETFS BRASIL: SIMULADOR, COMPARADOR & RANKINGS API METHODS
// =============================================================================

export async function simulatePortfolio(
  request: SimulatePortfolioRequest
): Promise<SimulatePortfolioResponse | null> {
  try {
    return await fetchJson<SimulatePortfolioResponse>("/simulate-portfolio", {
      method: "POST",
      body: JSON.stringify(request),
    });
  } catch (err) {
    console.error("Failed to run portfolio simulation:", err);
    return null;
  }
}

export async function getRankings(
  tipoAtivo: string = "ETF",
  ordem: string = "retorno_30d",
  categoria: string = "Todos"
): Promise<RankingsResponse | null> {
  try {
    const params = new URLSearchParams({
      tipo_ativo: tipoAtivo,
      ordem: ordem,
      categoria: categoria,
    });
    return await fetchJson<RankingsResponse>(`/rankings?${params.toString()}`);
  } catch (err) {
    console.error("Failed to fetch rankings:", err);
    return null;
  }
}

export async function getCanonicalPair(
  tickerA: string,
  tickerB: string
): Promise<ComparatorResult | null> {
  try {
    return await fetchJson<ComparatorResult>(
      `/comparator/pair/${tickerA.toUpperCase()}/${tickerB.toUpperCase()}`
    );
  } catch (err) {
    console.error(`Failed to fetch canonical pair ${tickerA} vs ${tickerB}:`, err);
    return null;
  }
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  tier: string;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export async function loginUser(credentials: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  if (typeof window !== "undefined" && res?.token) {
    localStorage.setItem("fin_token", res.token);
  }
  return res;
}

export async function registerUser(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (typeof window !== "undefined" && res?.token) {
    localStorage.setItem("fin_token", res.token);
  }
  return res;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await fetchJson<AuthUser>("/auth/me");
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetchJson("/auth/logout", { method: "POST" });
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fin_token");
      document.cookie = "auth_token=; path=/; max-age=0;";
    }
  }
}

export interface SubscriptionRequest {
  plan_tier: "PRO" | "ENTERPRISE";
  payment_method: "PIX" | "BOLETO" | "CREDIT_CARD";
}

export interface PixSubscriptionResponse {
  subscription_id: string;
  qr_code_base64: string;
  copy_paste_code: string;
  expiration_date?: string;
  value: number;
}

export interface CardSubscriptionResponse {
  subscription_id: string;
  checkout_url: string;
}

export async function createSubscription(
  req: SubscriptionRequest
): Promise<PixSubscriptionResponse | CardSubscriptionResponse> {
  return fetchJson("/billing/subscribe", {
    method: "POST",
    body: JSON.stringify(req),
  });
}




