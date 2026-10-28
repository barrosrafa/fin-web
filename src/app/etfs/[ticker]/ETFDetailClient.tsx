"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency } from "@/lib/formatters";
import { getETFDetail, ETFDetailData } from "@/lib/api";
import { UnderwaterDrawdownChart } from "@/components/etfs/UnderwaterDrawdownChart";

export function ETFDetailClient({ ticker }: { ticker: string }) {
  const [activeTab, setActiveTab] = useState("VISAO_GERAL");
  const [etfData, setEtfData] = useState<ETFDetailData | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getETFDetail(ticker);
        if (res) setEtfData(res);
      } catch (err) {
        console.error("Failed to load ETF details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticker]);

  const etf = etfData ?? {
    ticker: ticker,
    name: `iShares ${ticker} Fundo de Índice`,
    benchmark_index: "IBOVESPA",
    provider: "BlackRock Brasil",
    current_price: 128.40,
    nav_per_share: 128.25,
    nav_spread_pct: 0.117,
    ter_pct: 0.30,
    primary_fee_pct: 0.30,
    secondary_fee_pct: 0.00,
    policy: "ACUMULATIVO" as const,
    shares_lending_pct: 14.5,
    max_lending_limit_pct: 30.0,
    underlying_holdings: [
      { ticker: "VALE3", name: "Vale S.A.", weight_pct: 13.2, sector: "Materiais Básicos" },
      { ticker: "PETR4", name: "Petrobras PN", weight_pct: 11.5, sector: "Petróleo e Gás" },
      { ticker: "ITUB4", name: "Itaú Unibanco PN", weight_pct: 8.4, sector: "Financeiro" },
      { ticker: "BBDC4", name: "Banco Bradesco PN", weight_pct: 4.5, sector: "Financeiro" },
    ],
    flow_history_30d: [],
  };

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
            Índice Subjacente: <span className="text-white font-semibold">{etf.benchmark_index}</span> • Provedor: {etf.provider} • Aluguel: {etf.shares_lending_pct}% do PL
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b]">
          <div>
            <div className="text-xs text-[#64748b]">Cotação Mercado</div>
            <div className="text-xl font-bold text-white mono-nums">{formatCurrency(etf.current_price)}</div>
          </div>
          <div className="w-px h-8 bg-[#1e293b]" />
          <div>
            <div className="text-xs text-[#64748b]">Spread NAV (Ágio)</div>
            <div className="text-xl font-bold text-[#00f5a0] mono-nums">+{etf.nav_spread_pct}%</div>
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas ETF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Taxa Total Efetiva (TER)"
          value={`${etf.ter_pct.toFixed(2)}% a.a.`}
          subtitle={`Primária: ${etf.primary_fee_pct.toFixed(2)}% | Secundária: ${etf.secondary_fee_pct.toFixed(2)}%`}
          glow="cyan"
        />
        <MetricCard
          title="Valor Patrimonial (NAV / Cota)"
          value={formatCurrency(etf.nav_per_share)}
          subtitle="Cálculo contábil auditado de fechamento"
          glow="emerald"
        />
        <MetricCard
          title="Aluguel de Ações (BTC Receita)"
          value={`${etf.shares_lending_pct}%`}
          subtitle={`Limite legal de doação: ${etf.max_lending_limit_pct}%`}
          glow="violet"
        />
        <MetricCard
          title="Política de Proventos"
          value={etf.policy}
          subtitle="Reinvestimento automático sem bitributação"
          glow="emerald"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "VISAO_GERAL", label: "Composição da Carteira Teórica", count: etf.underlying_holdings.length },
          { id: "NAV_ARBITRAGEM", label: "Monitor de Spread NAV & Criação" },
          { id: "ALUGUEL", label: "Programa de Empréstimo de Ativos" },
          { id: "DRAWDOWN", label: "Curva Subaquática & Risco" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Composição */}
      {activeTab === "VISAO_GERAL" && (
        <Card glow="cyan">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Principais Ações Subjacentes ({etf.benchmark_index})
            </h3>
            <span className="text-xs text-[#64748b]">Metodologia de Ponderação por Valor de Mercado</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Ativo</th>
                  <th className="pb-3">Razão Social</th>
                  <th className="pb-3">Setor Econômico</th>
                  <th className="pb-3 text-right pr-2">Peso no ETF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {etf.underlying_holdings.map((item) => (
                  <tr key={item.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-[#00f5a0]">{item.ticker}</td>
                    <td className="py-3 font-sans text-white">{item.name}</td>
                    <td className="py-3 font-sans text-[#94a3b8]">{item.sector}</td>
                    <td className="py-3 text-right pr-2 font-bold text-white">
                      {item.weight_pct.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: NAV Spread */}
      {activeTab === "NAV_ARBITRAGEM" && (
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Mecanismo de Criação e Resgate (Arbitragem de Formadores de Mercado)
            </h3>
            <Badge variant="emerald">Spread Estável</Badge>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
            <p>
              O ETF é negociado no mercado secundário a <strong className="text-white">{formatCurrency(etf.current_price)}</strong>, enquanto o seu valor intrínseco contábil (NAV) é de <strong className="text-white">{formatCurrency(etf.nav_per_share)}</strong>.
            </p>
            <p>
              O spread atual de <strong className="text-[#00f5a0]">+{etf.nav_spread_pct}%</strong> encontra-se dentro do túnel de arbitragem tolerado pelo formador de mercado (Authorized Participant), garantindo que as cotas não se descolem significativamente da carteira subjacente do {etf.benchmark_index}.
            </p>
          </div>
        </Card>
      )}

      {/* TAB 3: Empréstimo */}
      {activeTab === "ALUGUEL" && (
        <Card glow="violet">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Remuneração por Empréstimo de Ativos da Carteira
            </h3>
            <Badge variant="violet">Aluguel Ativo</Badge>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
            <p>
              O gestor {etf.provider} mantém atualmente <strong className="text-white">{etf.shares_lending_pct}%</strong> do patrimônio do fundo doado em operações de empréstimo (BTC) na B3.
            </p>
            <p>
              Toda a receita gerada com o empréstimo das ações é repassada integralmente ao patrimônio líquido do fundo, reduzindo efetivamente o custo de carregamento (TER) para o investidor final.
            </p>
          </div>
        </Card>
      )}

      {/* TAB 4: Drawdown Subaquático */}
      {activeTab === "DRAWDOWN" && (
        <Card glow="crimson">
          <UnderwaterDrawdownChart
            data={[
              [1704153600000, 0.0],
              [1706745600000, -2.5],
              [1709251200000, -6.8],
              [1711929600000, -14.5],
              [1714521600000, -11.2],
              [1717200000000, -4.1],
              [1719792000000, -1.2],
              [1722470400000, 0.0],
              [1725148800000, -3.4],
              [1727740800000, -1.8],
              [1729814400000, 0.0],
            ]}
            maxDrawdownPct={-14.5}
            valleyDate="2024-04-01"
            recoveryDays={122}
            height={220}
          />
        </Card>
      )}
    </div>
  );
}
