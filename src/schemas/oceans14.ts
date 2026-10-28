export interface FinancialStatementRowItem {
  account_name: string;
  account_code: string;
  is_total?: boolean;
  indentation_level?: number;
  values_by_year: Record<string, number | null>;
}

export interface FinancialMatrixData {
  ticker: string;
  company_name: string;
  period_type: "ANUAL" | "TRIMESTRAL";
  years: string[];
  dre: FinancialStatementRowItem[];
  balance_sheet: FinancialStatementRowItem[];
  cash_flow: FinancialStatementRowItem[];
  margins_and_returns: FinancialStatementRowItem[];
}

export interface ConsistencyScreenerAsset {
  ticker: string;
  company_name: string;
  sector: string;
  segment: string;
  consecutive_profitable_years: number;
  cagr_lucro_5y: number | null;
  current_pe: number | null;
  current_pb: number | null;
  current_dy: number;
  current_roe: number;
}

export interface StockRankingRow {
  rank: number;
  ticker: string;
  name: string;
  sector: string;
  price: number;
  dy: number;
  pl: number | null;
  pvp: number | null;
  roe: number | null;
  roic: number | null;
  margem_liquida: number | null;
  ev_ebitda: number | null;
  liquidez: number;
}

export interface FIIRankingRow {
  rank: number;
  ticker: string;
  name: string;
  segment: string;
  price: number;
  dy_12m: number;
  pvp: number;
  net_worth: number;
  physical_vacancy_pct: number;
  financial_vacancy_pct: number;
  liquidity_daily: number;
}

export interface FIIVacancyItem {
  data_referencia: string;
  vacancia_fisica_pct: number;
  vacancia_financeira_pct: number;
  abl_propria_m2?: number | null;
  area_ocupada_m2?: number | null;
}

export interface FIIVacancyHistoryData {
  ticker: string;
  history: FIIVacancyItem[];
}

export interface IbovPEHistoryItem {
  data_referencia: string;
  fechamento_indice: number;
  pl_ponderado: number;
  pl_mediano: number;
  media_historica_5y: number;
  banda_superior_1dp: number;
  banda_inferior_1dp: number;
  banda_superior_2dp: number;
  banda_inferior_2dp: number;
}

export interface InvestorFlowItem {
  data_pregao: string;
  categoria_investidor: string;
  compras_reais: number;
  vendas_reais: number;
  saldo_liquido: number;
  saldo_acumulado_mes?: number | null;
  saldo_acumulado_ano?: number | null;
  participacao_pct?: number | null;
}

export interface EarningsCalendarRow {
  ticker: string;
  nome_empresarial: string;
  periodo_referencia: string;
  tipo_documento: string;
  data_prevista: string;
  horario_previsto?: string | null;
  status: string;
  link_webcast?: string | null;
}

export interface DividendMatrixRow {
  year: number;
  months: (number | null)[];
  annual_total: number;
  yield_on_cost_pct: number;
}

export interface DividendMatrixData {
  ticker: string;
  years: number[];
  matrix: DividendMatrixRow[];
}

export interface GovernmentAccountsRow {
  data_referencia: string;
  receita_total_bruta?: number | null;
  transferencias_estados_mun?: number | null;
  receita_liquida: number;
  despesa_previdencia?: number | null;
  despesa_pessoal?: number | null;
  despesa_total: number;
  resultado_primario: number;
  resultado_nominal?: number | null;
  divida_bruta_pib_pct?: number | null;
  divida_liquida_pib_pct?: number | null;
}

export interface CreditSystemRow {
  data_referencia: string;
  poupanca_captacao_liquida?: number | null;
  poupanca_saldo_total?: number | null;
  inadimplencia_pf_pct?: number | null;
  inadimplencia_pj_pct?: number | null;
  inadimplencia_total_pct?: number | null;
  estoque_credito_pj?: number | null;
  estoque_credito_pf?: number | null;
  concessao_imobiliario_pf?: number | null;
  tcr_efetiva_indice?: number | null;
}
