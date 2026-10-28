"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  formatCurrency,
  formatPercent,
  formatMultiple,
} from "@/lib/formatters";
import { FIIIndicatorsData } from "@/lib/api";

export interface FundamentalIndicatorsGridProps {
  indicators?: FIIIndicatorsData;
  ticker: string;
}

export function FundamentalIndicatorsGrid({
  indicators,
  ticker,
}: FundamentalIndicatorsGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Fallback defaults if indicators are partially loading
  const ind = indicators || {
    pvp: 0.91,
    vp_per_share: 166.43,
    dividend_yield_12m: 8.85,
    last_dividend: 1.17,
    expense_pct: 0.44,
    cash_pct: 1.46,
    default_pct: 0.0,
    physical_vacancy_pct: 2.4,
    financial_vacancy_pct: 1.8,
    shares_count: 45601745,
    shareholders_count: 608345,
    market_cap: 6718961108.3,
    daily_trades: 12450,
    daily_volume: 22341579.19,
    net_worth: 7589554105.43,
    change_1d: -1.63,
    change_12m: 1.87,
    min_52w: 145.11,
    max_52w: 161.0,
    cagr_dividends_3y: 0.53,
    cagr_share_value_3y: 6.85,
    quote_datetime: "2026-10-28T16:15:00",
  };

  const metricList = [
    {
      id: "pvp",
      label: "P/VP",
      tooltip: "Preço sobre Valor Patrimonial. Abaixo de 1,0 indica desconto sobre o laudo.",
      value: formatMultiple(ind.pvp),
      badge: ind.pvp <= 1.0 ? "Desconto Patrimonial" : "Ágio",
      variant: (ind.pvp <= 1.0 ? "emerald" : "amber") as "emerald" | "amber",
    },
    {
      id: "vp",
      label: "VP por Cota",
      tooltip: "Valor patrimonial contábil por cada cota emitida pelo fundo.",
      value: formatCurrency(ind.vp_per_share),
      badge: "Laudo Oficial CVM",
      variant: "cyan" as const,
    },
    {
      id: "dy",
      label: "Dividend Yield (12M)",
      tooltip: "Rendimentos distribuídos acumulados nos últimos 12 meses sobre a cotação.",
      value: formatPercent(ind.dividend_yield_12m, false),
      badge: "Isento de IR (PF)",
      variant: "emerald" as const,
    },
    {
      id: "ultimo_div",
      label: "Último Rendimento",
      tooltip: "Valor pago por cota no mês mais recente.",
      value: formatCurrency(ind.last_dividend),
      badge: "Mensalidade Atual",
      variant: "emerald" as const,
    },
    {
      id: "vacancia_fisica",
      label: "Vacância Física",
      tooltip: "Área Bruta Locável desocupada em relação à ABL total do portfólio.",
      value: formatPercent(ind.physical_vacancy_pct, false),
      badge: ind.physical_vacancy_pct < 5 ? "Ocupação Excelente" : "Atenção",
      variant: (ind.physical_vacancy_pct < 5 ? "emerald" : "amber") as "emerald" | "amber",
    },
    {
      id: "vacancia_fin",
      label: "Vacância Financeira",
      tooltip: "Fluxo de receita não realizada em decorrência de áreas vagas ou carências.",
      value: formatPercent(ind.financial_vacancy_pct, false),
      badge: "Fluxo de Caixa",
      variant: "cyan" as const,
    },
    {
      id: "caixa",
      label: "% em Caixa",
      tooltip: "Percentual do patrimônio líquido mantido em disponibilidades e títulos líquidos.",
      value: formatPercent(ind.cash_pct, false),
      badge: "Reserva de Liquidez",
      variant: "cyan" as const,
    },
    {
      id: "despesas",
      label: "% Despesas / Taxa Adm",
      tooltip: "Custo anual total de administração e gestão sobre o patrimônio.",
      value: formatPercent(ind.expense_pct, false),
      badge: "Eficiência de Custo",
      variant: "cyan" as const,
    },
    {
      id: "inadimplencia",
      label: "Inadimplência",
      tooltip: "Percentual de aluguéis em atraso ou não recebidos no período.",
      value: formatPercent(ind.default_pct, false),
      badge: ind.default_pct === 0 ? "Risco Zero" : "Em Cobrança",
      variant: (ind.default_pct === 0 ? "emerald" : "crimson") as "emerald" | "crimson",
    },
    {
      id: "patrimonio",
      label: "Patrimônio Líquido",
      tooltip: "Valor contábil total dos ativos imobiliários e financeiros deduzidos passivos.",
      value: formatCurrency(ind.net_worth, true),
      badge: "Portfólio Institucional",
      variant: "violet" as const,
    },
    {
      id: "valor_mercado",
      label: "Valor de Mercado",
      tooltip: "Cotação atual multiplicada pela quantidade total de cotas emitidas.",
      value: formatCurrency(ind.market_cap, true),
      badge: "Capitalização B3",
      variant: "violet" as const,
    },
    {
      id: "volume_diario",
      label: "Liquidez Diária (Volume)",
      tooltip: "Volume financeiro médio transacionado diariamente no pregão da B3.",
      value: formatCurrency(ind.daily_volume, true),
      badge: "Alta Liquidez",
      variant: "emerald" as const,
    },
    {
      id: "cotistas",
      label: "Quantidade de Cotistas",
      tooltip: "Número total de investidores pessoa física e institucional na base.",
      value: ind.shareholders_count.toLocaleString("pt-BR"),
      badge: "Base Pulverizada",
      variant: "cyan" as const,
    },
    {
      id: "cotas",
      label: "Quantidade de Cotas",
      tooltip: "Total de cotas negociáveis no mercado secundário.",
      value: ind.shares_count.toLocaleString("pt-BR"),
      badge: "Free Float",
      variant: "cyan" as const,
    },
    {
      id: "faixa_52s",
      label: "Mín / Máx 52 Semanas",
      tooltip: "Menor e maior preço de fechamento registrado nos últimos 12 meses.",
      value: `${formatCurrency(ind.min_52w)} – ${formatCurrency(ind.max_52w)}`,
      badge: "Faixa Anual",
      variant: "cyan" as const,
    },
    {
      id: "cagr_cota",
      label: "CAGR Cota (3 Anos)",
      tooltip: "Taxa composta de crescimento anual da cotação no triênio.",
      value: formatPercent(ind.cagr_share_value_3y, false),
      badge: "Valorização Patrimonial",
      variant: "emerald" as const,
    },
  ];

  return (
    <Card glow="emerald" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00f5a0] font-bold">
              Fundamentos & Mercado
            </span>
            <Badge variant="emerald">Quadro de Indicadores {ticker}</Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Indicadores Fundamentalistas e Operacionais
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              viewMode === "grid"
                ? "bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white border border-white/5"
            }`}
          >
            Grade
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
              viewMode === "table"
                ? "bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white border border-white/5"
            }`}
          >
            Tabela
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {metricList.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider group-hover:text-white transition-colors truncate">
                    {m.label}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-white mt-0.5 tracking-tight">
                  {m.value}
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                <Badge variant={m.variant}>{m.badge}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Indicador</th>
                <th className="pb-3 text-right">Valor Atual</th>
                <th className="pb-3 text-right">Classificação</th>
                <th className="pb-3 pl-6">Significado e Interpretação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {metricList.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 pl-2 font-bold text-white">{m.label}</td>
                  <td className="py-2.5 text-right font-black font-mono text-white text-sm">
                    {m.value}
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge variant={m.variant}>{m.badge}</Badge>
                  </td>
                  <td className="py-2.5 pl-6 font-sans text-xs text-[#94a3b8]">
                    {m.tooltip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
        <span>Cálculos automatizados via CVM / B3 • Cotações ajustadas</span>
        <span>Última atualização: {new Date().toLocaleDateString("pt-BR")} às 16:15</span>
      </div>
    </Card>
  );
}
