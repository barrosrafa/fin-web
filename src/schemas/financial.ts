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
