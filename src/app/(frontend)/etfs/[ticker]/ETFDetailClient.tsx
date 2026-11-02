"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency } from "@/lib/formatters";
import { getETFDetail, ETFDetailData } from "@/lib/api";
import { UnderwaterDrawdownChart } from "@/components/etfs/UnderwaterDrawdownChart";
import { SectionState } from "@/components/shared/SectionState";
import { DataStatus } from "@/components/shared/DataStatus";
import { TradingStatusNotice } from "@/components/shared/TradingStatusNotice";
import { quoteProvenance } from "@/lib/quote-provenance";

export function ETFDetailClient({ ticker }: { ticker: string }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [etfData, setEtfData] = useState<ETFDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setEtfData(null);
    void getETFDetail(ticker, controller.signal).then(res => {
      if (controller.signal.aborted) return;
      if (!res || res.ticker.toUpperCase() !== ticker.toUpperCase()) setError("Dados indisponíveis para este ETF.");
      else setEtfData(res);
    }).catch(() => {
      if (!controller.signal.aborted) setError("Falha ao consultar este ETF.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
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

  if (loading || !etfData) return <SectionState loading={loading} error={error || "Dados indisponíveis para este ETF."} />;
  const etf = etfData;

  const navItems = [
    { id: "composicao", label: `1. Composição (${etf.underlying_holdings.length})` },
    { id: "nav-spread", label: "2. Spread NAV & Arbitragem" },
    { id: "aluguel", label: "3. Empréstimo BTC" },
    { id: "drawdown", label: "4. Curva de Drawdown" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up pb-16">
      <DataStatus {...quoteProvenance(etf.source ?? undefined, etf.quote_date ?? undefined)} />
      <TradingStatusNotice trading={etf.trading} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.Link.1"><Link href="/" className="hover:text-white transition-colors"><CmsText>{"Cockpit"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.Link.2"><Link href="/etfs" className="hover:text-white transition-colors"><CmsText>{"ETFs"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <span className="text-[#00f5a0] mono-nums"><CmsText>{ticker}</CmsText></span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight"><CmsText>{ticker}</CmsText></h1>
            <Badge variant="cyan"><CmsText>{etf.name}</CmsText></Badge>
            <Badge variant="emerald"><CmsText>{etf.policy}</CmsText></Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{"Índice Subjacente: "}</CmsText><span className="text-white font-semibold"><CmsText>{etf.benchmark_index ?? "—"}</CmsText></span><CmsText>{" • Provedor: "}</CmsText><CmsText>{etf.provider ?? "—"}</CmsText><CmsText>{" • Empréstimo de ativos: "}</CmsText><CmsText>{etf.shares_lending_pct == null ? "—" : `${etf.shares_lending_pct}% do PL`}</CmsText></p>
        </div>

        <div className="flex items-center gap-6 bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b]">
          <div>
            <div className="text-xs text-[#64748b]"><CmsText>{"Cotação Mercado"}</CmsText></div>
            <div className="text-xl font-bold text-white mono-nums"><CmsText>{formatCurrency(etf.current_price)}</CmsText></div>
          </div>
          <div className="w-px h-8 bg-[#1e293b]" />
          <div>
            <div className="text-xs text-[#64748b]"><CmsText>{"Spread NAV (Ágio)"}</CmsText></div>
            <div className="text-xl font-bold text-[#00f5a0] mono-nums">
              <CmsText>{typeof etf.nav_spread_pct === "number"
                ? `${etf.nav_spread_pct > 0 ? "+" : ""}${etf.nav_spread_pct.toFixed(2)}%`
                : "N/D"}</CmsText>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas ETF */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.MetricCard.3"><MetricCard
          title="Taxa Total Efetiva (TER)"
          value={etf.ter_pct == null ? "—" : `${etf.ter_pct.toFixed(2)}% a.a.`}
          subtitle={`Primária: ${etf.primary_fee_pct == null ? "—" : `${etf.primary_fee_pct.toFixed(2)}%`} | Secundária: ${etf.secondary_fee_pct == null ? "—" : `${etf.secondary_fee_pct.toFixed(2)}%`}`}
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.MetricCard.4"><MetricCard
          title="Valor Patrimonial (NAV / Cota)"
          value={
            typeof etf.nav_per_share === "number" && etf.nav_per_share > 0
              ? formatCurrency(etf.nav_per_share)
              : "N/D"
          }
          subtitle="Cálculo contábil auditado de fechamento"
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.MetricCard.5"><MetricCard
          title="Aluguel de Ações (BTC Receita)"
          value={etf.shares_lending_pct == null ? "—" : `${etf.shares_lending_pct}%`}
          subtitle={`Limite informado: ${etf.max_lending_limit_pct == null ? "—" : `${etf.max_lending_limit_pct}%`}`}
          glow="violet"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.MetricCard.6"><MetricCard
          title="Política de Proventos"
          value={etf.policy ?? "—"}
          subtitle="Reinvestimento automático sem bitributação"
          glow="emerald"
        /></CmsElement>
      </div>

      {/* Zero Clicks Sticky Anchor Navigation */}
      <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.nav.7"><nav
        aria-label="Navegação rápida do ETF"
        className="sticky top-4 z-40 bg-[#0c1017]/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 hidden md:inline"><CmsText>{"Ir para:"}</CmsText></span>
        <CmsText>{navItems.map((item) => (
          <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.button.8" key={item.id}><button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <CmsText>{item.label}</CmsText>
          </button></CmsElement>
        ))}</CmsText>
      </nav></CmsElement>

      {/* CONTINUOUS VERTICAL CONTENT FLOW (NO TABS, ZERO CLICKS) */}

      {/* SECTION 1: Composição da Carteira */}
      <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.section.9"><section id="composicao" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"1. Composição da Carteira Teórica ("}</CmsText><CmsText>{etf.benchmark_index ?? "—"}</CmsText><CmsText>{")"}</CmsText></h2>
          </div>
          <Badge variant="cyan"><CmsText>{etf.underlying_holdings.length}</CmsText><CmsText>{" Ativos Subjacentes"}</CmsText></Badge>
        </div>

        <div id="panel-VISAO_GERAL">
          <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.Card.10"><Card glow="cyan">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Principais Ativos Subjacentes ("}</CmsText><CmsText>{etf.benchmark_index ?? "—"}</CmsText><CmsText>{")"}</CmsText></h3>
              <span className="text-xs text-[#64748b]"><CmsText>{"Metodologia de Ponderação por Valor de Mercado"}</CmsText></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2"><CmsText>{"Ativo"}</CmsText></th>
                    <th className="pb-3"><CmsText>{"Razão Social"}</CmsText></th>
                    <th className="pb-3"><CmsText>{"Setor Econômico"}</CmsText></th>
                    <th className="pb-3 text-right pr-2"><CmsText>{"Peso no ETF"}</CmsText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <CmsText>{etf.underlying_holdings.map((item) => (
                    <tr key={item.ticker} className="hover:bg-white/[0.02]">
                      <td className="py-3 pl-2 font-bold text-[#00f5a0]"><CmsText>{item.ticker}</CmsText></td>
                      <td className="py-3 font-sans text-white"><CmsText>{item.name}</CmsText></td>
                      <td className="py-3 font-sans text-[#94a3b8]"><CmsText>{item.sector}</CmsText></td>
                      <td className="py-3 text-right pr-2 font-bold text-white">
                        <CmsText>{item.weight_pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</CmsText><CmsText>{"%"}</CmsText></td>
                    </tr>
                  ))}</CmsText>
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
              <span><CmsText>{"Gestor cadastrado: "}</CmsText><CmsText>{etf.provider ?? "—"}</CmsText></span>
              <span><CmsText>{"Data-base da carteira: não informada"}</CmsText></span>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 2: NAV Spread & Arbitragem */}
      <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.section.11"><section id="nav-spread" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"2. Mecanismo de Criação, Resgate & Arbitragem de NAV"}</CmsText></h2>
          </div>
          <Badge variant="emerald">
            <CmsText>{typeof etf.nav_spread_pct === "number" ? "Spread Monitorado" : "Aguardando Informe"}</CmsText>
          </Badge>
        </div>

        <div id="panel-NAV_ARBITRAGEM">
          <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.Card.12"><Card glow="emerald">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Mecanismo de Criação e Resgate (Arbitragem de Formadores de Mercado)"}</CmsText></h3>
              <Badge variant="emerald">
                <CmsText>{typeof etf.nav_spread_pct === "number" ? "Spread Monitorado" : "Aguardando Informe"}</CmsText>
              </Badge>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <p><CmsText>{"Fechamento de mercado: "}</CmsText><strong className="text-white"><CmsText>{formatCurrency(etf.current_price)}</CmsText></strong><CmsText>{"; valor patrimonial por cota registrado: "}</CmsText><strong className="text-white"><CmsText>{typeof etf.nav_per_share === "number" && etf.nav_per_share > 0 ? formatCurrency(etf.nav_per_share) : "indisponível"}</CmsText></strong><CmsText>{"."}</CmsText></p>
              <p>
                <CmsText>{typeof etf.nav_spread_pct === "number" ? (
                  <><CmsText>{"O spread calculado é "}</CmsText><strong className="text-[#00f5a0]"><CmsText>{etf.nav_spread_pct > 0 ? "+" : ""}</CmsText><CmsText>{etf.nav_spread_pct.toFixed(2)}</CmsText><CmsText>{"%"}</CmsText></strong><CmsText>{" entre preço e NAV registrados; isso não mede liquidez nem garante arbitragem."}</CmsText></>
                ) : (
                  <><CmsText>{"O cálculo contábil do spread aguarda a publicação diária de cotas emitidas e patrimônio líquido oficial pelo administrador fiduciário perante a CVM."}</CmsText></>
                )}</CmsText>
              </p>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 3: Aluguel de Ações (BTC) */}
      <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.section.13"><section id="aluguel" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"3. Remuneração por Empréstimo de Ativos (BTC) & Receita Revertida"}</CmsText></h2>
          </div>
          <Badge variant="violet"><CmsText>{etf.shares_lending_pct == null ? "Informação indisponível" : `${etf.shares_lending_pct}% do PL em empréstimo`}</CmsText></Badge>
        </div>

        <div id="panel-ALUGUEL">
          <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.Card.14"><Card glow="violet">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Remuneração por Empréstimo de Ativos da Carteira"}</CmsText></h3>
              <Badge variant="neutral"><CmsText>{etf.shares_lending_pct == null ? "Não informado" : "Empréstimo registrado"}</CmsText></Badge>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <p><CmsText>{etf.shares_lending_pct == null ? "Posições de empréstimo não têm fonte verificável disponível para este ETF." : `Empréstimo registrado: ${etf.shares_lending_pct}% do patrimônio.`}</CmsText></p>
              <p><CmsText>{"A política de repasse de receitas de empréstimo não está informada."}</CmsText></p>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 4: Drawdown Subaquático */}
      <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.section.15"><section id="drawdown" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"4. Curva Subaquática & Risco Histórico (Drawdown)"}</CmsText></h2>
          </div>
          <CmsText>{etf.drawdown && typeof etf.drawdown.max_drawdown_pct === "number" && (
            <Badge variant="crimson"><CmsText>{"Queda Máx: "}</CmsText><CmsText>{etf.drawdown.max_drawdown_pct.toFixed(2)}</CmsText><CmsText>{"%"}</CmsText></Badge>
          )}</CmsText>
        </div>

        <div id="panel-DRAWDOWN">
          <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.Card.16"><Card glow="crimson">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Curva Subaquática & Risco Histórico"}</CmsText></h3>
                <p className="text-xs text-[#94a3b8] mt-0.5"><CmsText>{"Cálculo sobre os fechamentos diários oficiais verificados disponíveis"}</CmsText></p>
              </div>
              <CmsText>{etf.drawdown && typeof etf.drawdown.max_drawdown_pct === "number" && (
                <Badge variant="crimson"><CmsText>{"Queda Máx: "}</CmsText><CmsText>{etf.drawdown.max_drawdown_pct.toFixed(2)}</CmsText><CmsText>{"%"}</CmsText></Badge>
              )}</CmsText>
            </div>

            <CmsText>{etf.drawdown && typeof etf.drawdown.max_drawdown_pct === "number" && etf.drawdown.drawdown_curve.length > 0 ? (
              <CmsElement feature="ui.app/-frontend-/etfs/-ticker-/ETFDetailClient.UnderwaterDrawdownChart.17"><UnderwaterDrawdownChart
                data={etf.drawdown.drawdown_curve}
                maxDrawdownPct={etf.drawdown.max_drawdown_pct}
                valleyDate={etf.drawdown.valley_date ?? undefined}
                recoveryDays={etf.drawdown.recovery_days ?? undefined}
                height={220}
              /></CmsElement>
            ) : (
              <div className="p-8 text-center text-xs text-[#64748b]"><CmsText>{"Sem dados de cotações suficientes para calcular a curva de drawdown deste ativo."}</CmsText></div>
            )}</CmsText>
          </Card></CmsElement>
        </div>
      </section></CmsElement>
    </div>
  );
}
