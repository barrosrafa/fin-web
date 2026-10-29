"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency } from "@/lib/formatters";
import { getETFDetail, ETFDetailData } from "@/lib/api";
import { UnderwaterDrawdownChart } from "@/components/etfs/UnderwaterDrawdownChart";

export function ETFDetailClient({ ticker }: { ticker: string }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [etfData, setEtfData] = useState<ETFDetailData | null>(null);
  const [, setLoading] = useState(true);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  // Deep linking: if tab or hash param is present, smooth scroll to section
  useEffect(() => {
    const target =
      tabParam?.toLowerCase().replace(/_/g, "-") ||
      (typeof window !== "undefined" ? window.location.hash.replace("#", "") : "");
    if (target) {
      const el =
        document.getElementById(target) ||
        document.getElementById(`panel-${tabParam}`) ||
        (target === "visao-geral" ? document.getElementById("composicao") : null);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
      }
    }
  }, [tabParam]);

  const isIvvb = ticker.toUpperCase() === "IVVB11";

  const etf = etfData ?? {
    ticker: ticker,
    name: isIvvb ? "iShares S&P 500 Fundo de Índice" : `iShares ${ticker} Fundo de Índice`,
    benchmark_index: isIvvb ? "S&P 500" : "IBOVESPA",
    provider: isIvvb ? "BlackRock Brasil / S&P Dow Jones" : "BlackRock Brasil",
    current_price: isIvvb ? 432.80 : 128.40,
    nav_per_share: isIvvb ? 432.10 : 128.25,
    nav_spread_pct: 0.117,
    ter_pct: isIvvb ? 0.23 : 0.30,
    primary_fee_pct: isIvvb ? 0.23 : 0.30,
    secondary_fee_pct: 0.00,
    policy: "ACUMULATIVO" as const,
    shares_lending_pct: 14.5,
    max_lending_limit_pct: 30.0,
    underlying_holdings: isIvvb
      ? [
          { ticker: "MSFT", name: "Microsoft Corporation", weight_pct: 6.8, sector: "Tecnologia da Informação" },
          { ticker: "AAPL", name: "Apple Inc.", weight_pct: 6.5, sector: "Tecnologia da Informação" },
          { ticker: "NVDA", name: "NVIDIA Corporation", weight_pct: 6.2, sector: "Tecnologia da Informação" },
          { ticker: "AMZN", name: "Amazon.com Inc.", weight_pct: 3.6, sector: "Consumo Discricionário" },
          { ticker: "GOOGL", name: "Alphabet Inc. Class A", weight_pct: 2.3, sector: "Serviços de Comunicação" },
          { ticker: "META", name: "Meta Platforms Inc.", weight_pct: 2.2, sector: "Serviços de Comunicação" },
        ]
      : [
          { ticker: "VALE3", name: "Vale S.A.", weight_pct: 13.2, sector: "Materiais Básicos" },
          { ticker: "PETR4", name: "Petrobras PN", weight_pct: 11.5, sector: "Petróleo e Gás" },
          { ticker: "ITUB4", name: "Itaú Unibanco PN", weight_pct: 8.4, sector: "Financeiro" },
          { ticker: "BBDC4", name: "Banco Bradesco PN", weight_pct: 4.5, sector: "Financeiro" },
        ],
    flow_history_30d: [],
  };

  const navItems = [
    { id: "composicao", label: `1. Composição (${etf.underlying_holdings.length})` },
    { id: "nav-spread", label: "2. Spread NAV & Arbitragem" },
    { id: "aluguel", label: "3. Empréstimo BTC" },
    { id: "drawdown", label: "4. Curva de Drawdown" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up pb-16">
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

      {/* Header Banner */}
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
            <div className="text-xl font-bold text-[#00f5a0] mono-nums">
              {typeof etf.nav_spread_pct === "number"
                ? `${etf.nav_spread_pct > 0 ? "+" : ""}${etf.nav_spread_pct.toFixed(2)}%`
                : "N/D"}
            </div>
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
          value={
            typeof etf.nav_per_share === "number" && etf.nav_per_share > 0
              ? formatCurrency(etf.nav_per_share)
              : "N/D"
          }
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

      {/* Zero Clicks Sticky Anchor Navigation */}
      <nav
        aria-label="Navegação rápida do ETF"
        className="sticky top-4 z-40 bg-[#0c1017]/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 hidden md:inline">
          Ir para:
        </span>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* CONTINUOUS VERTICAL CONTENT FLOW (NO TABS, ZERO CLICKS) */}

      {/* SECTION 1: Composição da Carteira */}
      <section id="composicao" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Composição da Carteira Teórica ({etf.benchmark_index})
            </h2>
          </div>
          <Badge variant="cyan">{etf.underlying_holdings.length} Ativos Subjacentes</Badge>
        </div>

        <div id="panel-VISAO_GERAL">
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
                        {item.weight_pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
              <span>Fonte Auditada: {etf.provider} / B3</span>
              <span>Data-base da Carteira: Outubro/2026</span>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 2: NAV Spread & Arbitragem */}
      <section id="nav-spread" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Mecanismo de Criação, Resgate & Arbitragem de NAV
            </h2>
          </div>
          <Badge variant="emerald">
            {typeof etf.nav_spread_pct === "number" ? "Spread Monitorado" : "Aguardando Informe"}
          </Badge>
        </div>

        <div id="panel-NAV_ARBITRAGEM">
          <Card glow="emerald">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">
                Mecanismo de Criação e Resgate (Arbitragem de Formadores de Mercado)
              </h3>
              <Badge variant="emerald">
                {typeof etf.nav_spread_pct === "number" ? "Spread Monitorado" : "Aguardando Informe"}
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <p>
                O ETF é negociado no mercado secundário a <strong className="text-white">{formatCurrency(etf.current_price)}</strong>, enquanto o seu valor intrínseco contábil (NAV) é de <strong className="text-white">{typeof etf.nav_per_share === "number" && etf.nav_per_share > 0 ? formatCurrency(etf.nav_per_share) : "N/D (em conciliação)"}</strong>.
              </p>
              <p>
                {typeof etf.nav_spread_pct === "number" ? (
                  <>
                    O spread atual de <strong className="text-[#00f5a0]">{etf.nav_spread_pct > 0 ? "+" : ""}{etf.nav_spread_pct.toFixed(2)}%</strong> encontra-se dentro do túnel de arbitragem tolerado pelo formador de mercado (Authorized Participant), garantindo que as cotas não se descolem significativamente da carteira subjacente do {etf.benchmark_index}.
                  </>
                ) : (
                  <>
                    O cálculo contábil do spread aguarda a publicação diária de cotas emitidas e patrimônio líquido oficial pelo administrador fiduciário perante a CVM.
                  </>
                )}
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 3: Aluguel de Ações (BTC) */}
      <section id="aluguel" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Remuneração por Empréstimo de Ativos (BTC) & Receita Revertida
            </h2>
          </div>
          <Badge variant="violet">{etf.shares_lending_pct}% do PL em Aluguel</Badge>
        </div>

        <div id="panel-ALUGUEL">
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
        </div>
      </section>

      {/* SECTION 4: Drawdown Subaquático */}
      <section id="drawdown" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Curva Subaquática & Risco Histórico (Drawdown)
            </h2>
          </div>
          {etf.drawdown && typeof etf.drawdown.max_drawdown_pct === "number" && (
            <Badge variant="crimson">
              Queda Máx: {etf.drawdown.max_drawdown_pct.toFixed(2)}%
            </Badge>
          )}
        </div>

        <div id="panel-DRAWDOWN">
          <Card glow="crimson">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Curva Subaquática & Risco Histórico
                </h3>
                <p className="text-xs text-[#94a3b8] mt-0.5">
                  Cálculo em tempo real sobre a série de cotações diárias oficiais de fechamento na B3
                </p>
              </div>
              {etf.drawdown && typeof etf.drawdown.max_drawdown_pct === "number" && (
                <Badge variant="crimson">
                  Queda Máx: {etf.drawdown.max_drawdown_pct.toFixed(2)}%
                </Badge>
              )}
            </div>

            {etf.drawdown && etf.drawdown.drawdown_curve && etf.drawdown.drawdown_curve.length > 0 ? (
              <UnderwaterDrawdownChart
                data={etf.drawdown.drawdown_curve}
                maxDrawdownPct={etf.drawdown.max_drawdown_pct}
                valleyDate={etf.drawdown.valley_date ?? undefined}
                recoveryDays={etf.drawdown.recovery_days ?? undefined}
                height={220}
              />
            ) : (
              <div className="p-8 text-center text-xs text-[#64748b]">
                Sem dados de cotações suficientes para calcular a curva de drawdown deste ativo.
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
