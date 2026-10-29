"use client";

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
      {isBank && (
        <div className="p-4 rounded-2xl bg-[#00f5a0]/10 border border-[#00f5a0]/30 flex items-start gap-4">
          <div className="w-8 h-8 rounded-xl bg-[#00f5a0]/20 text-[var(--positive)] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            🏦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Instituição Financeira / Bancária (BACEN / COSIF)
              </span>
              <Badge variant="emerald">Regime Contábil Bancário</Badge>
            </div>
            <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
              Para bancos e intermediários financeiros, métricas industriais convencionais (como Margem Bruta, EBIT, EBITDA e Dívida Líquida) não são aplicáveis. As demonstrações contábeis priorizam{" "}
              <strong className="text-white">Resultado de Intermediação Financeira</strong>,{" "}
              <strong className="text-white">Carteira de Crédito Classificada</strong> e{" "}
              <strong className="text-white">Depósitos Totais</strong>.
            </p>
          </div>
        </div>
      )}

      {/* BLOCO 1: Cotação, Faixa 52 Semanas e Capitalização */}
      <Card glow="cyan">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Identificação & Valor de Mercado
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Dados de cotação atualizada, oscilação de 52 semanas e capitalização da firma.
            </p>
          </div>
          <Badge variant="cyan">{details.segmento ?? details.sector ?? "B3"}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Cotação Atual</span>
            <span className="text-lg font-black font-mono text-white">
              {formatCurrency(details.current_price)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Mín 52 Semanas</span>
            <span className="text-base font-bold font-mono text-[var(--negative)]">
              {details.min_52_semanas ? formatCurrency(details.min_52_semanas) : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Máx 52 Semanas</span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              {details.max_52_semanas ? formatCurrency(details.max_52_semanas) : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Vol. Médio (2M)</span>
            <span className="text-base font-bold font-mono text-white">
              {formatNumberCompact(details.volume_medio_2m)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Valor de Mercado</span>
            <span className="text-base font-bold font-mono text-[#00d9f5]">
              {formatNumberCompact(details.valor_mercado)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Valor da Firma (EV)</span>
            <span className="text-base font-bold font-mono text-white">
              {details.valor_firma ? formatNumberCompact(details.valor_firma) : "-"}
            </span>
          </div>
        </div>
      </Card>

      {/* BLOCO 2: Indicadores Fundamentalistas (Valuation & Eficiência) */}
      <Card glow="emerald">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Indicadores Fundamentalistas & Valuation
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Múltiplos de preço, margens operacionais, rentabilidade sobre o capital e liquidez.
            </p>
          </div>
          <Badge variant="emerald">24 Indicadores Auditados</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">P/L</span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              {formatMultiple(multiples.pl)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">P/VP</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.pvp)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Div. Yield</span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              {multiples.dividend_yield ? formatPercent(multiples.dividend_yield, false) : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">P/EBIT</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.pebit)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">PSR</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.psr)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">P/Ativos</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.p_ativos)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">EV / EBITDA</span>
            <span className="text-base font-bold font-mono text-[#00d9f5]">
              {formatMultiple(multiples.ev_ebitda)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">EV / EBIT</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.ev_ebit)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Margem Bruta</span>
            <span className="text-base font-bold font-mono text-white">
              {multiples.margem_bruta !== undefined && multiples.margem_bruta !== null ? `${multiples.margem_bruta.toFixed(1)}%` : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Margem EBIT</span>
            <span className="text-base font-bold font-mono text-white">
              {multiples.margem_ebit !== undefined && multiples.margem_ebit !== null ? `${multiples.margem_ebit.toFixed(1)}%` : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Margem Líquida</span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              {multiples.margem_liquida !== undefined && multiples.margem_liquida !== null ? `${multiples.margem_liquida.toFixed(1)}%` : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">ROE</span>
            <span className="text-base font-bold font-mono text-[var(--positive)]">
              {multiples.roe !== undefined && multiples.roe !== null ? `${multiples.roe.toFixed(1)}%` : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">ROIC</span>
            <span className="text-base font-bold font-mono text-[#00d9f5]">
              {multiples.roic !== undefined && multiples.roic !== null ? `${multiples.roic.toFixed(1)}%` : "-"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Liquidez Corrente</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.liquidez_corrente)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Dív. Bruta / PL</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.div_bruta_patrimonio)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">Giro dos Ativos</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.giro_ativos)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">P/Cap. Giro</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.p_cap_giro)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#131926] border border-white/5">
            <span className="text-[11px] text-[#94a3b8] block mb-1">P/Ativo Circ. Líq.</span>
            <span className="text-base font-bold font-mono text-white">
              {formatMultiple(multiples.p_ativo_circ_liq)}
            </span>
          </div>
        </div>
      </Card>

      {/* BLOCO 3: Balanço Patrimonial & Demonstrativo de Resultados (12M & 3M) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balanço Patrimonial */}
        <Card glow="cyan">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Balanço Patrimonial
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Posição patrimonial consolidada (Data: {financials.data_balanco ?? "Recente"}).
              </p>
            </div>
            <Badge variant="cyan">Consolidado</Badge>
          </div>

          <div className="space-y-3 mono-nums text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#94a3b8]">Ativo Total</span>
              <span className="font-bold text-white">{formatNumberCompact(financials.ativo_total)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-[#94a3b8]">Disponibilidades / Caixa</span>
              <span className="font-bold text-[var(--positive)]">{formatNumberCompact(financials.disponibilidades)}</span>
            </div>

            {isBank ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Carteira de Crédito Classificada</span>
                  <span className="font-bold text-[#00d9f5]">{formatNumberCompact(financials.carteira_credito)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Depósitos Totais</span>
                  <span className="font-bold text-white">{formatNumberCompact(financials.depositos)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Ativo Circulante</span>
                  <span className="font-bold text-white">{formatNumberCompact(financials.ativo_circulante)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Dívida Bruta</span>
                  <span className="font-bold text-[var(--negative)]">{formatNumberCompact(financials.divida_bruta)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Dívida Líquida</span>
                  <span className="font-bold text-[var(--negative)]">{formatNumberCompact(financials.divida_liquida)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-white font-bold">Patrimônio Líquido</span>
              <span className="font-black text-[var(--positive)] text-base">{formatNumberCompact(financials.patrimonio_liquido)}</span>
            </div>
          </div>
        </Card>

        {/* DRE: 12 Meses vs Últimos 3 Meses */}
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Demonstrativo de Resultados (DRE)
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Comparativo de performance entre os últimos 12 meses e últimos 3 meses.
              </p>
            </div>
            <Badge variant="emerald">12M vs 3M</Badge>
          </div>

          <div className="space-y-3 mono-nums text-sm">
            {isBank ? (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Res. Intermediação Fin. (12M)</span>
                  <span className="font-bold text-white">{formatNumberCompact(financials.resultado_intermediacao_12m)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Res. Intermediação Fin. (3M)</span>
                  <span className="font-bold text-[#00d9f5]">{formatNumberCompact(financials.resultado_intermediacao_3m)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Receita de Serviços (12M)</span>
                  <span className="font-bold text-white">{formatNumberCompact(financials.receita_servicos_12m)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Receita de Serviços (3M)</span>
                  <span className="font-bold text-[#00d9f5]">{formatNumberCompact(financials.receita_servicos_3m)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Receita Líquida (12M)</span>
                  <span className="font-bold text-white">{formatNumberCompact(financials.receita_liquida_12m)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">Receita Líquida (Últimos 3M)</span>
                  <span className="font-bold text-[#00d9f5]">{formatNumberCompact(financials.receita_liquida_3m)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">EBIT (12M)</span>
                  <span className="font-bold text-white">{formatNumberCompact(financials.ebit_12m)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">EBIT (Últimos 3M)</span>
                  <span className="font-bold text-[#00d9f5]">{formatNumberCompact(financials.ebit_3m)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center py-1.5 border-b border-white/5">
              <span className="text-white font-semibold">Lucro Líquido (12M)</span>
              <span className="font-black text-[var(--positive)] text-base">{formatNumberCompact(financials.lucro_liquido_12m)}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 pt-2">
              <span className="text-white font-semibold">Lucro Líquido (Últimos 3M)</span>
              <span className="font-black text-[var(--positive)] text-base">{formatNumberCompact(financials.lucro_liquido_3m)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
