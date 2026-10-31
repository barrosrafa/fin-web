"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { StockCompleteDetails } from "@/lib/api";

interface StockFundamentalsGridProps {
  data: StockCompleteDetails;
}

export function StockFundamentalsGrid({ data }: StockFundamentalsGridProps) {
  const { details, multiples, financials } = data;
  const isBank = details.is_financial_institution;

  const formatNumberCompact = (val?: number | null) => {
    if (val === undefined || val === null) return "-";
    if (Math.abs(val) >= 1_000_000_000_000) {
      return `R$ ${(val / 1_000_000_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tri`;
    }
    if (Math.abs(val) >= 1_000_000_000) {
      return `R$ ${(val / 1_000_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bi`;
    }
    if (Math.abs(val) >= 1_000_000) {
      return `R$ ${(val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Mi`;
    }
    return formatCurrency(val);
  };

  const formatMultiple = (val?: number | null, suffix = "") => {
    if (val === undefined || val === null) return "-";
    return `${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Banking / Financial Institution Alert Notice */}
      <CmsText>{isBank && (
        <div className="p-4 rounded-2xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-[#00f5a0]/20 text-[var(--positive)] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5"><CmsText>{"🏦"}</CmsText></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm"><CmsText>{"Instituição Financeira / Bancária (BACEN / COSIF)"}</CmsText></span>
              <Badge variant="emerald"><CmsText>{"Regime Contábil Bancário"}</CmsText></Badge>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed"><CmsText>{"Para bancos e intermediários financeiros, métricas industriais convencionais (como Margem Bruta, EBIT, EBITDA e Dívida Líquida) não são aplicáveis. As demonstrações contábeis priorizam"}</CmsText><CmsText>{" "}</CmsText>
              <strong className="text-white"><CmsText>{"Resultado de Intermediação Financeira"}</CmsText></strong><CmsText>{","}</CmsText><CmsText>{" "}</CmsText>
              <strong className="text-white"><CmsText>{"Carteira de Crédito Classificada"}</CmsText></strong><CmsText>{" e"}</CmsText><CmsText>{" "}</CmsText>
              <strong className="text-white"><CmsText>{"Depósitos Totais"}</CmsText></strong><CmsText>{"."}</CmsText></p>
          </div>
        </div>
      )}</CmsText>

      {/* BLOCO 1: Cotação, Faixa 52 Semanas e Capitalização */}
      <CmsElement feature="ui.components/stocks/StockFundamentalsGrid.Card.1"><Card glow="cyan">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Identificação & Valor de Mercado"}</CmsText></h3>
            <p className="text-xs text-[#94a3b8]"><CmsText>{"Dados de cotação atualizada, oscilação de 52 semanas e capitalização da firma."}</CmsText></p>
          </div>
          <Badge variant="cyan"><CmsText>{details.segmento ?? details.sector ?? "B3"}</CmsText></Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Cotação Atual"}</CmsText></span>
            <span className="text-lg font-black font-mono text-white">
              <CmsText>{formatCurrency(details.current_price)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Mín 52 Semanas"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[var(--negative)]">
              <CmsText>{details.min_52_semanas ? formatCurrency(details.min_52_semanas) : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Máx 52 Semanas"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              <CmsText>{details.max_52_semanas ? formatCurrency(details.max_52_semanas) : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Vol. Médio (2M)"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatNumberCompact(details.volume_medio_2m)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Valor de Mercado"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[#00d9f5]">
              <CmsText>{formatNumberCompact(details.valor_mercado)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Valor da Firma (EV)"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{details.valor_firma ? formatNumberCompact(details.valor_firma) : "-"}</CmsText>
            </span>
          </div>
        </div>
      </Card></CmsElement>

      {/* BLOCO 2: Indicadores Fundamentalistas (Valuation & Eficiência) */}
      <CmsElement feature="ui.components/stocks/StockFundamentalsGrid.Card.2"><Card glow="emerald">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Indicadores Fundamentalistas & Valuation"}</CmsText></h3>
            <p className="text-xs text-[#94a3b8]"><CmsText>{"Múltiplos de preço, margens operacionais, rentabilidade sobre o capital e liquidez."}</CmsText></p>
          </div>
          <Badge variant="emerald"><CmsText>{"24 Indicadores Auditados"}</CmsText></Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"P/L"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              <CmsText>{formatMultiple(multiples.pl)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"P/VP"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.pvp)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Div. Yield"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              <CmsText>{multiples.dividend_yield ? formatPercent(multiples.dividend_yield, false) : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"P/EBIT"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.pebit)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"PSR"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.psr)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"P/Ativos"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.p_ativos)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"EV / EBITDA"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[#00d9f5]">
              <CmsText>{formatMultiple(multiples.ev_ebitda)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"EV / EBIT"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.ev_ebit)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Margem Bruta"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{multiples.margem_bruta !== undefined && multiples.margem_bruta !== null ? `${multiples.margem_bruta.toFixed(1)}%` : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Margem EBIT"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{multiples.margem_ebit !== undefined && multiples.margem_ebit !== null ? `${multiples.margem_ebit.toFixed(1)}%` : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Margem Líquida"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              <CmsText>{multiples.margem_liquida !== undefined && multiples.margem_liquida !== null ? `${multiples.margem_liquida.toFixed(1)}%` : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"ROE"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              <CmsText>{multiples.roe !== undefined && multiples.roe !== null ? `${multiples.roe.toFixed(1)}%` : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"ROIC"}</CmsText></span>
            <span className="text-base font-bold font-mono text-[#00d9f5]">
              <CmsText>{multiples.roic !== undefined && multiples.roic !== null ? `${multiples.roic.toFixed(1)}%` : "-"}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Liquidez Corrente"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.liquidez_corrente)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Dív. Bruta / PL"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.div_bruta_patrimonio)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"Giro dos Ativos"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.giro_ativos)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"P/Cap. Giro"}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.p_cap_giro)}</CmsText>
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1"><CmsText>{"P/Ativo Circ. Líq."}</CmsText></span>
            <span className="text-base font-bold font-mono text-white">
              <CmsText>{formatMultiple(multiples.p_ativo_circ_liq)}</CmsText>
            </span>
          </div>
        </div>
      </Card></CmsElement>

      {/* BLOCO 3: Balanço Patrimonial & Demonstrativo de Resultados (12M & 3M) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balanço Patrimonial */}
        <CmsElement feature="ui.components/stocks/StockFundamentalsGrid.Card.3"><Card glow="cyan">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Balanço Patrimonial"}</CmsText></h3>
              <p className="text-xs text-[#94a3b8]"><CmsText>{"Posição patrimonial consolidada (Data: "}</CmsText><CmsText>{financials.data_balanco ?? "Recente"}</CmsText><CmsText>{")."}</CmsText></p>
            </div>
            <Badge variant="cyan"><CmsText>{"Consolidado"}</CmsText></Badge>
          </div>

          <div className="space-y-3 mono-nums text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#94a3b8]"><CmsText>{"Ativo Total"}</CmsText></span>
              <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.ativo_total)}</CmsText></span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#94a3b8]"><CmsText>{"Disponibilidades / Caixa"}</CmsText></span>
              <span className="font-bold text-[var(--positive)]"><CmsText>{formatNumberCompact(financials.disponibilidades)}</CmsText></span>
            </div>

            <CmsText>{isBank ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Carteira de Crédito Classificada"}</CmsText></span>
                  <span className="font-bold text-[#00d9f5]"><CmsText>{formatNumberCompact(financials.carteira_credito)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Depósitos Totais"}</CmsText></span>
                  <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.depositos)}</CmsText></span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Ativo Circulante"}</CmsText></span>
                  <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.ativo_circulante)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Dívida Bruta"}</CmsText></span>
                  <span className="font-bold text-[var(--negative)]"><CmsText>{formatNumberCompact(financials.divida_bruta)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Dívida Líquida"}</CmsText></span>
                  <span className="font-bold text-[var(--negative)]"><CmsText>{formatNumberCompact(financials.divida_liquida)}</CmsText></span>
                </div>
              </>
            )}</CmsText>

            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-white font-bold"><CmsText>{"Patrimônio Líquido"}</CmsText></span>
              <span className="font-black text-[var(--positive)] text-base"><CmsText>{formatNumberCompact(financials.patrimonio_liquido)}</CmsText></span>
            </div>
          </div>
        </Card></CmsElement>

        {/* DRE: 12 Meses vs Últimos 3 Meses */}
        <CmsElement feature="ui.components/stocks/StockFundamentalsGrid.Card.4"><Card glow="emerald">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Demonstrativo de Resultados (DRE)"}</CmsText></h3>
              <p className="text-xs text-[#94a3b8]"><CmsText>{"Comparativo de performance entre os últimos 12 meses e últimos 3 meses."}</CmsText></p>
            </div>
            <Badge variant="emerald"><CmsText>{"12M vs 3M"}</CmsText></Badge>
          </div>

          <div className="space-y-3 mono-nums text-sm">
            <CmsText>{isBank ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Res. Intermediação Fin. (12M)"}</CmsText></span>
                  <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.resultado_intermediacao_12m)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Res. Intermediação Fin. (3M)"}</CmsText></span>
                  <span className="font-bold text-[#00d9f5]"><CmsText>{formatNumberCompact(financials.resultado_intermediacao_3m)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Receita de Serviços (12M)"}</CmsText></span>
                  <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.receita_servicos_12m)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Receita de Serviços (3M)"}</CmsText></span>
                  <span className="font-bold text-[#00d9f5]"><CmsText>{formatNumberCompact(financials.receita_servicos_3m)}</CmsText></span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Receita Líquida (12M)"}</CmsText></span>
                  <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.receita_liquida_12m)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"Receita Líquida (Últimos 3M)"}</CmsText></span>
                  <span className="font-bold text-[#00d9f5]"><CmsText>{formatNumberCompact(financials.receita_liquida_3m)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"EBIT (12M)"}</CmsText></span>
                  <span className="font-bold text-white"><CmsText>{formatNumberCompact(financials.ebit_12m)}</CmsText></span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"EBIT (Últimos 3M)"}</CmsText></span>
                  <span className="font-bold text-[#00d9f5]"><CmsText>{formatNumberCompact(financials.ebit_3m)}</CmsText></span>
                </div>
              </>
            )}</CmsText>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-white font-semibold"><CmsText>{"Lucro Líquido (12M)"}</CmsText></span>
              <span className="font-black text-[var(--positive)] text-base"><CmsText>{formatNumberCompact(financials.lucro_liquido_12m)}</CmsText></span>
            </div>

            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-white font-semibold"><CmsText>{"Lucro Líquido (Últimos 3M)"}</CmsText></span>
              <span className="font-black text-[var(--positive)] text-base"><CmsText>{formatNumberCompact(financials.lucro_liquido_3m)}</CmsText></span>
            </div>
          </div>
        </Card></CmsElement>
      </div>
    </div>
  );
}
