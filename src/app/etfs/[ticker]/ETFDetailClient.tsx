"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  MOCK_ETF_BOVA11_DETAIL,
  MOCK_ETF_UNDERLYING_BOVA11,
} from "@/data/mock/marketData";

export function ETFDetailClient({ ticker }: { ticker: string }) {
  const [activeTab, setActiveTab] = useState("VISAO_GERAL");
  const etf = MOCK_ETF_BOVA11_DETAIL;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/etfs" className="hover:text-white transition-colors">
          ETFs
        </Link>
        <span>/</span>
        <span className="text-[#00f5a0] mono-nums">{ticker}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">{ticker}</h1>
            <Badge variant="cyan">{etf.name}</Badge>
            <Badge variant="emerald">{etf.policy}</Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-1">
            Índice Subjacente: <span className="text-white font-semibold">{etf.benchmarkIndex}</span> • Provedor: {etf.provider} • Aluguel: {etf.sharesLendingPct}% do PL
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b]">
          <div>
            <div className="text-xs text-[#64748b]">Cotação Mercado</div>
            <div className="text-xl font-bold text-white mono-nums">{formatCurrency(etf.currentPrice)}</div>
          </div>
          <div className="w-px h-8 bg-[#1e293b]" />
          <div>
            <div className="text-xs text-[#64748b]">Spread NAV (Ágio)</div>
            <div className="text-xl font-bold text-[#00f5a0] mono-nums">+{etf.navSpreadPct}%</div>
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas ETF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Custo Total (TER)"
          value={`${etf.terPct.toFixed(2)}% a.a.`}
          subtitle="Taxa Primária + Secundária"
        />
        <MetricCard
          title="Valor Patrimonial (NAV)"
          value={formatCurrency(etf.navPerShare)}
          subtitle="Por cota da carteira"
        />
        <MetricCard
          title="Taxa Primária Gestora"
          value={`${etf.primaryFeePct.toFixed(2)}% a.a.`}
          subtitle="Taxa da casa local"
        />
        <MetricCard
          title="Taxa Subjacente"
          value={`${etf.secondaryFeePct.toFixed(2)}% a.a.`}
          subtitle="Custo do índice externo"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "VISAO_GERAL", label: "Top 10 Ativos da Carteira" },
          { id: "FLUXO_COTAS", label: "Fluxo de Criação e Destruição (30d)" },
          { id: "ALUGUEL_COTAS", label: "Empréstimo de Cotas" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Ativos Subjacentes */}
      {activeTab === "VISAO_GERAL" && (
        <Card
          title="Composição e Ponderação dos Ativos Subjacentes"
          subtitle="Pesos teóricos oficiais da carteira do ETF"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e293b] text-[#64748b] uppercase">
                  <th className="py-3 px-4 font-semibold">Ticker</th>
                  <th className="py-3 px-4 font-semibold">Ativo</th>
                  <th className="py-3 px-4 font-semibold">Setor</th>
                  <th className="py-3 px-4 font-semibold text-right">Peso na Carteira %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60">
                {MOCK_ETF_UNDERLYING_BOVA11.map((item) => (
                  <tr key={item.ticker} className="hover:bg-[#1e293b]/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white mono-nums">{item.ticker}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{item.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral">{item.sector}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#00f5a0] mono-nums">
                      {item.weight.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Fluxo Institucional de Cotas */}
      {activeTab === "FLUXO_COTAS" && (
        <Card
          title="Fluxo Institucional de Cotas dos Formadores de Mercado (Market Makers)"
          subtitle="Emissão líquida (demanda compradora) vs. cancelamento de cotas"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Captação Líquida 30 Dias</div>
              <div className="text-2xl font-black text-[#00f5a0] mt-1 mono-nums">+ R$ 206,2 M</div>
              <p className="text-xs text-[#94a3b8] mt-2">Saldo líquido fortemente positivo</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Total de Novas Cotas Criadas</div>
              <div className="text-2xl font-black text-white mt-1 mono-nums">1.700.000 cotas</div>
              <p className="text-xs text-[#94a3b8] mt-2">Atividade alta do formador de mercado</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Spread Médio Compra / Venda</div>
              <div className="text-2xl font-black text-cyan-400 mt-1 mono-nums">0,02%</div>
              <p className="text-xs text-[#94a3b8] mt-2">Excelente liquidez no book de ofertas</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Aluguel de Cotas */}
      {activeTab === "ALUGUEL_COTAS" && (
        <Card title="Mercado de Empréstimo de Cotas do ETF" subtitle="Regras operacionais e remuneração da carteira">
          <div className="p-6 rounded-xl bg-[#0a0f1d] border border-[#1e293b] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94a3b8]">Volume de Cotas Doadas em Empréstimo</span>
              <span className="text-sm font-bold text-white mono-nums">{etf.sharesLendingPct}% do Patrimônio Líquido</span>
            </div>
            <div className="w-full bg-[#1e293b] h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00f5a0] to-[#00d9f5] h-full rounded-full"
                style={{ width: `${(etf.sharesLendingPct / etf.maxLendingLimitPct) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span>Utilizado: {etf.sharesLendingPct}%</span>
              <span>Limite Regulatório Máximo Permitido: {etf.maxLendingLimitPct}%</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
