import { z } from "zod";

export const AssetTypeSchema = z.enum([
  "ACAO",
  "FII",
  "FUNDO",
  "ETF",
  "RENDA_FIXA",
  "CRIPTO",
  "INDICE",
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
  type: AssetTypeSchema,
  sector: z.string(),
  subsector: z.string().optional(),
  currentPrice: z.number(),
  change24h: z.number(),
  change12m: z.number(),
  dividendYield: z.number(),
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
  netRevenue: z.number(),
  cogs: z.number(),
  grossProfit: z.number(),
  operatingExpenses: z.number(),
  ebitda: z.number(),
  ebit: z.number(),
  financialResult: z.number(),
  taxes: z.number(),
  netIncome: z.number(),
  netMarginPct: z.number(),
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
