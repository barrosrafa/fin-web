import { z } from "zod";

export const AssetTypeSchema = z.enum([
  "ACAO",
  "FII",
  "FUNDO",
  "ETF",
  "RENDA_FIXA",
  "CRIPTO",
  "INDICE",
  "BDR",
  "FI_INFRA",
  "ETF_EUA",
  "STOCK_EUA",
]);

export type AssetType = z.infer<typeof AssetTypeSchema>;

export const QuotePointSchema = z.object({
  date: z.string(),
  price: z.number(),
  volume: z.number().optional(),
});

export const AssetSummarySchema = z.object({
  ticker: z.string(),
  name: z.string(),
  source: z.string().optional(),
  quote_date: z.string().optional(),
  trading: z.object({ status: z.enum(["active", "inactive", "unknown"]), ended_on: z.string().optional(), successor: z.string().optional(), source_url: z.string().optional() }).optional(),
  type: AssetTypeSchema,
  sector: z.string(),
  subsector: z.string().optional(),
  currentPrice: z.number().nullable(),
  change24h: z.number().nullable(),
  change12m: z.number().nullable(),
  dividendYield: z.number().nullable(),
  marketCap: z.number().optional(),
  pvp: z.number().optional(),
  pl: z.number().optional(),
  sparkline: z.array(z.number()),
  badge: z.string().optional(),
});

export type AssetSummary = z.infer<typeof AssetSummarySchema>;

export const ValuationModelSchema = z.object({
  currentPrice: z.number(),
  grahamFairValue: z.number(),
  grahamUpsidePct: z.number(),
  bazinCeilingPrice: z.number(),
  bazinUpsidePct: z.number(),
  dcfIntrinsicValue: z.number(),
  dcfUpsidePct: z.number(),
  lpa: z.number(),
  vpa: z.number(),
  dpaAverage: z.number(),
  discountRate: z.number(),
  growthRate: z.number(),
  marginOfSafetyPct: z.number(),
});

export type ValuationModel = z.infer<typeof ValuationModelSchema>;

export const ChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  pillar: z.string(),
  description: z.string(),
  passed: z.boolean(),
  metricValue: z.string(),
  targetValue: z.string(),
  explanation: z.string(),
});

export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const DREEntrySchema = z.object({
  year: z.string(),
  netRevenue: z.number().nullable().optional(),
  cogs: z.number().nullable().optional(),
  grossProfit: z.number().nullable().optional(),
  operatingExpenses: z.number().nullable().optional(),
  ebitda: z.number().nullable().optional(),
  ebit: z.number().nullable().optional(),
  financialResult: z.number().nullable().optional(),
  taxes: z.number().nullable().optional(),
  netIncome: z.number().nullable().optional(),
  netMarginPct: z.number().nullable().optional(),
});

export type DREEntry = z.infer<typeof DREEntrySchema>;

export const DividendEntrySchema = z.object({
  id: z.string(),
  assetTicker: z.string(),
  type: z.enum(["DIVIDENDO", "JCP", "RENDIMENTO"]),
  referenceMonth: z.string(), // Competência
  dateCom: z.string(),
  paymentDate: z.string(),
  valuePerShare: z.number(),
  yieldOnCostPct: z.number(),
});

export type DividendEntry = z.infer<typeof DividendEntrySchema>;

export const FIIPropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["LOGISTICA", "LAJES_CORP", "SHOPPING", "RENDA_URBANA", "HOSPITAL"]),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  ablM2: z.number(),
  occupancyPct: z.number(),
  siilaStandard: z.enum(["AAA", "AA", "A", "B", "C"]),
  fundSharePct: z.number(),
});

export type FIIProperty = z.infer<typeof FIIPropertySchema>;

export const BrickScoreAxisSchema = z.object({
  name: z.string(),
  score: z.number(), // 0 to 100
  weight: z.number(),
  status: z.enum(["EXCELENTE", "BOM", "REGULAR", "ATENCAO"]),
  comment: z.string(),
});

export type BrickScoreAxis = z.infer<typeof BrickScoreAxisSchema>;

export const QuantRiskMatrixSchema = z.object({
  timeframe: z.string(), // "1M", "12M", "36M", etc.
  sharpe: z.number(),
  sortino: z.number(),
  treynor: z.number(),
  jensenAlpha: z.number(),
  beta: z.number(),
  volatility: z.number(),
  maxDrawdown: z.number(),
  recoveryDays: z.number(),
  positiveMonthsPct: z.number(),
});

export type QuantRiskMatrix = z.infer<typeof QuantRiskMatrixSchema>;

export const TechnicalIndicatorsSchema = z.object({
  ticker: z.string(),
  timeframe: z.string(),
  rsi14: z.number(),
  macd: z.string(),
  stochastic: z.number(),
  bollingerWidth: z.number(),
  pivotPoint: z.number(),
  support1: z.number(),
  support2: z.number(),
  resistance1: z.number(),
  resistance2: z.number(),
  summarySignal: z.enum(["COMPRA_FORTE", "COMPRA", "NEUTRO", "VENDA", "VENDA_FORTE"]),
  buySignalsCount: z.number(),
  neutralSignalsCount: z.number(),
  sellSignalsCount: z.number(),
});

export type TechnicalIndicators = z.infer<typeof TechnicalIndicatorsSchema>;

export const AICommitteeVerdictSchema = z.object({
  ticker: z.string(),
  sentiment: z.enum(["BULLISH", "NEUTRAL", "BEARISH"]),
  confidenceScore: z.number(), // 0 to 100
  executiveSummary: z.string(),
  swot: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
  anomaliesDetected: z.array(z.string()),
  lastAnalyzedDoc: z.string(),
  timestamp: z.string(),
});

export type AICommitteeVerdict = z.infer<typeof AICommitteeVerdictSchema>;

export const ETFDetailSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  benchmarkIndex: z.string(),
  provider: z.string(),
  currentPrice: z.number(),
  navPerShare: z.number(),
  navSpreadPct: z.number(),
  terPct: z.number(),
  primaryFeePct: z.number(),
  secondaryFeePct: z.number(),
  policy: z.enum(["ACUMULATIVO", "DISTRIBUTIVO"]),
  sharesLendingPct: z.number(),
  maxLendingLimitPct: z.number(),
});

export type ETFDetail = z.infer<typeof ETFDetailSchema>;

export const OptionContractSchema = z.object({
  symbol: z.string(),
  type: z.enum(["CALL", "PUT"]),
  style: z.enum(["AMERICANA", "EUROPEIA"]),
  strike: z.number(),
  expirationDate: z.string(),
  moneyness: z.enum(["ITM", "ATM", "OTM"]),
  lastPrice: z.number(),
  impliedVolatilityPct: z.number(),
  delta: z.number(),
  gamma: z.number(),
  theta: z.number(),
  vega: z.number(),
  rho: z.number(),
  openInterest: z.number(),
  volume24h: z.number(),
});

export type OptionContract = z.infer<typeof OptionContractSchema>;

export const StockBorrowingBTCSchema = z.object({
  ticker: z.string(),
  borrowerRateAvg: z.number(),
  borrowerRateMin: z.number(),
  borrowerRateMax: z.number(),
  lenderRateAvg: z.number(),
  activeContracts: z.number(),
  sharesBorrowedQty: z.number(),
  financialVolume: z.number(),
  freeFloatBorrowedPct: z.number(),
});

export type StockBorrowingBTC = z.infer<typeof StockBorrowingBTCSchema>;

export const BuybackProgramSchema = z.object({
  programId: z.string(),
  approvalDate: z.string(),
  expirationDate: z.string(),
  sharesAuthorized: z.number(),
  sharesAcquired: z.number(),
  sharesInTreasury: z.number(),
  executionPct: z.number(),
});

export type BuybackProgram = z.infer<typeof BuybackProgramSchema>;

export const TreasuryBondSchema = z.object({
  name: z.string(),
  type: z.enum(["SELIC", "PREFIXADO", "IPCA"]),
  maturityDate: z.string(),
  annualRatePct: z.number(),
  unitPrice: z.number(),
  minInvestmentValue: z.number(),
});

export type TreasuryBond = z.infer<typeof TreasuryBondSchema>;

export const FundHoldingCDASchema = z.object({
  assetName: z.string(),
  assetType: z.string(),
  identifier: z.string(),
  weightPct: z.number(),
  financialValue: z.number(),
});

export type FundHoldingCDA = z.infer<typeof FundHoldingCDASchema>;

// =============================================================================
// ETFS BRASIL: SIMULADOR, COMPARADOR & RANKINGS SCHEMAS
// =============================================================================

export interface PortfolioAssetAllocation {
  ticker: string;
  assetsType?: string;
  percentage: number; // 0.0 a 1.0
}

export interface PortfolioDraft {
  name: string;
  assets: PortfolioAssetAllocation[];
}

export interface SimulatePortfolioRequest {
  startDate: string;
  endDate: string;
  startingAmount: number;
  monthlyContributions: number;
  rebalancingFrequency: "NENHUM" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  advisoryFee: number;
  portfolioList: PortfolioDraft[];
}

export interface PeriodReturnData {
  YearToDate?: number;
  months12?: number;
  months24?: number;
  months36?: number;
  allTime: number;
}

export interface PortfolioSimulationMetrics {
  finalAmount: number;
  totalReturnPct: number;
  cagrPct: number;
  standardDeviation: PeriodReturnData;
  sharpeRatio: PeriodReturnData;
  sortinoRatio: PeriodReturnData;
  maxDrawdown: {
    pct: number;
    valleyDate?: string;
    recoveryDays: number;
  };
  weightedAdminFee: number;
}

export interface PortfolioSimulationResultItem {
  name: string;
  metrics: PortfolioSimulationMetrics;
  equityCurve: [timestamp: number, value: number][];
  drawdownCurve: [timestamp: number, pct: number][];
}

export interface SimulatePortfolioResponse {
  assumptions?: string[];
  simulationId?: string;
  benchmark: {
    name: string;
    metrics: PortfolioSimulationMetrics;
    equityCurve: [timestamp: number, value: number][];
  };
  portfolios: PortfolioSimulationResultItem[];
}

export interface HoldingOverlapItem {
  codigo: string;
  nome: string;
  peso_a: number;
  peso_b: number;
  overlap_min: number;
}

export interface HoldingsOverlapAnalysis {
  total_overlap_pct: number;
  common_holdings_count: number;
  top_shared_holdings: HoldingOverlapItem[];
}

export interface AssetComparisonMetrics {
  ticker: string;
  price: number;
  change_12m: number;
  dy_pct: number;
  pvp: number;
  pl: number;
  volatility_pct: number;
  sharpe: number;
  roe_pct?: number;
  divida_liquida_pl?: number;
  ter_pct?: number;
  gestora?: string;
}

export interface NormalizedSeriesPoint {
  date: string;
  values: Record<string, number>;
}

export interface ComparatorResult {
  tickers: string[];
  metrics: AssetComparisonMetrics[];
  series: NormalizedSeriesPoint[];
  overlap_analysis?: HoldingsOverlapAnalysis;
}

export interface RankingAssetItem {
  pos: number;
  ticker: string;
  nome: string;
  patrimonio_liquido_mm: number;
  retorno_30d: number;
  retorno_ano: number;
  retorno_12m: number;
  retorno_24m?: number;
  sharpe_12m?: number;
  taxa_adm_total: number;
  categoria: string;
  cotistas: number;
  negociacao_diaria_mm: number;
}

export interface RankingsResponse {
  tipo_ativo: string;
  ordem: string;
  categoria: string;
  total_assets: number;
  items: RankingAssetItem[];
}

