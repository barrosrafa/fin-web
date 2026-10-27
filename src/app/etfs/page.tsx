"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { MOCK_ASSETS } from "@/data/mock/marketData";

export default function ETFsPage() {
  const etfs = MOCK_ASSETS.filter((a) => a.type === "ETF");

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">ETFs Brasil Standard</span>
          <span className="text-xs text-[#64748b]">Exchange Traded Funds</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          ETFs Locais & Globais (Fundos de Índice)
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Análise de custo total efetivo (TER - primária e secundária), monitor de Spread NAV (ágio/deságio), liquidez de criação/destruição de cotas e replicação de índices.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Menor Custo TER (B3)"
          value="BOVA11 • 0,10% a.a."
          subtitle="Taxa primária sem custos secundários"
          glow="emerald"
        />
        <MetricCard
          title="Top Liquidez Internacional"
          value="IVVB11 • S&P 500"
          subtitle="Spread NAV médio de apenas 0,02%"
          glow="cyan"
        />
        <MetricCard
          title="ETF Criptoativo Institucional"
          value="HASH11 • NCI Index"
          subtitle="Custódia física regulada em Cold Storage"
          glow="violet"
        />
      </div>

      {/* ETFs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">ETF / Ticker</th>
                <th className="pb-3">Índice Subjacente</th>
                <th className="pb-3 text-right">Cotação</th>
                <th className="pb-3 text-right">Var. 24h</th>
                <th className="pb-3 text-right">Taxa TER</th>
                <th className="pb-3 text-right">Spread NAV</th>
                <th className="pb-3 text-right">Política</th>
                <th className="pb-3 text-right pr-2">Patrimônio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {etfs.map((etf) => (
                <tr key={etf.ticker} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[#00f5a0]">
                        {etf.ticker.slice(0, 4)}
                      </div>
                      <div>
                        <span className="font-bold text-white block">
                          {etf.ticker}
                        </span>
                        <span className="text-[10px] text-[#64748b] font-sans">
                          {etf.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-sans text-[#94a3b8]">
                    {etf.subsector || etf.sector}
                  </td>
                  <td className="py-3.5 text-right font-bold text-white">
                    {formatCurrency(etf.currentPrice)}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="text-[#00f5a0] font-bold">
                      {formatPercent(etf.change24h)}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-[#00d9f5]">
                    {etf.ticker === "BOVA11" ? "0,10%" : "0,23%"}
                  </td>
                  <td className="py-3.5 text-right text-[#00f5a0]">
                    +0,03% (Paridade)
                  </td>
                  <td className="py-3.5 text-right font-sans">
                    <Badge variant="cyan">Reinveste Auto</Badge>
                  </td>
                  <td className="py-3.5 text-right pr-2 text-white font-bold">
                    {etf.marketCap ? formatCurrency(etf.marketCap, true) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Concept Breakdown: Primária vs Secundária */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glow="cyan">
          <h3 className="text-base font-bold text-white mb-2">
            Desdobramento de Custos (Total Expense Ratio)
          </h3>
          <p className="text-xs text-[#94a3b8] mb-4">
            Diferença crítica revelada pelo REA do ETFs Brasil entre a taxa cobrada pelo administrador brasileiro e as taxas dos fundos subjacentes no exterior.
          </p>
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-white">Taxa Primária (Emissor B3)</span>
              <span className="font-mono text-[#00d9f5] font-bold">0,20% a.a.</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-white">Taxa Secundária (Fundo Subjacente nos EUA)</span>
              <span className="font-mono text-[#a855f7] font-bold">0,03% a.a.</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[rgba(0,245,160,0.08)] border border-[rgba(0,245,160,0.3)]">
              <span className="text-white font-bold">Custo Total Efetivo (TER)</span>
              <span className="font-mono text-[#00f5a0] font-black">0,23% a.a.</span>
            </div>
          </div>
        </Card>

        <Card glow="emerald">
          <h3 className="text-base font-bold text-white mb-2">
            Dinâmica de Criação e Destruição de Cotas (NAV)
          </h3>
          <p className="text-xs text-[#94a3b8] mb-4">
            O formador de mercado (Authorized Participant) atua arbitrando eventuais distorções entre a cota na B3 e o valor intrínseco (NAV) dos ativos.
          </p>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">
                Spread Médio
              </span>
              <div className="text-lg font-black text-[#00f5a0] font-mono mt-1">
                &lt; 0.05%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">
                Fluxo Cotas (30D)
              </span>
              <div className="text-lg font-black text-[#00d9f5] font-mono mt-1">
                +R$ 450M
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
