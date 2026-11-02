"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCurrency, formatPercent, formatDividendUnit, formatMultiple } from "@/lib/formatters";
import { DataStatus } from "@/components/shared/DataStatus";
import { TradingStatusNotice } from "@/components/shared/TradingStatusNotice";
import { quoteProvenance } from "@/lib/quote-provenance";
import {
  getBenchmarks,
  getAssets,
  getDividends,
  getAISentiment,
  getStockValuation,
  BenchmarkItem,
  DividendCalendarItem,
  AISentimentData,
  StockValuationDetail,
} from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export default function HomePage() {
  const [activeAssetTab, setActiveAssetTab] = useState("TODOS");
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [dividends, setDividends] = useState<DividendCalendarItem[]>([]);
  const [aiVerdict, setAiVerdict] = useState<AISentimentData | null>(null);
  const [valuationPetr4, setValuationPetr4] = useState<StockValuationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bRes, aRes, dRes, aiRes, vRes] = await Promise.all([
          getBenchmarks().catch(() => []),
          getAssets(),
          getDividends(5),
          getAISentiment("PETR4"),
          getStockValuation("PETR4").catch(() => null),
        ]);
        setBenchmarks(bRes);
        setAssets(aRes);
        setDividends(dRes);
        setAiVerdict(aiRes);
        setValuationPetr4(vRes);
      } catch (err) {
        console.error("Error loading home page market data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAssets =
    activeAssetTab === "TODOS"
      ? assets
      : assets.filter((a) => a.type === activeAssetTab);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-neon badge-neon-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-[#94a3b8]" /><CmsText>{"Sessão B3 não informada"}</CmsText></span>
            <span className="text-xs text-[#94a3b8] mono-nums"><CmsText>{"Dados periódicos • Horário de mercado não verificado"}</CmsText></span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white"><CmsText>{"Cockpit de Inteligência Financeira"}</CmsText></h1>
          <p className="text-sm sm:text-base text-[#94a3b8] mt-2 max-w-2xl font-normal"><CmsText>{"Terminal unificado de análise fundamentalista, valuation algorítmico (Graham, Bazin, DCF) e monitoramento contínuo de Ações, FIIs e Fundos CVM 175."}</CmsText></p>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/screener" variant="cyan"><CmsText>{"Super Screener"}</CmsText></Button>
          <Button href="/comparador" variant="primary"><CmsText>{"Comparar Ativos"}</CmsText></Button>
        </div>
      </div>

      {/* Macro Indicators 4-Col Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CmsText>{benchmarks.slice(0, 4).map((b) => (
          <CmsElement feature="ui.app/-frontend-/page.MetricCard.1" key={b.ticker}><MetricCard
            key={b.ticker}
            title={b.name}
            value={b.value.toLocaleString("pt-BR", {
              minimumFractionDigits: b.ticker === "USDBRL" ? 3 : 2,
            })}
            change={b.change}
            sparkline={b.sparkline}
            subtitle={b.ticker}
            glow={b.change >= 0 ? "emerald" : "crimson"}
          /></CmsElement>
        ))}</CmsText>
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento 1: Market Explorer (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <CmsElement feature="ui.app/-frontend-/page.Card.2"><Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span><CmsText>{"Radar de Oportunidades"}</CmsText></span>
                  <span className="text-xs text-[#94a3b8] font-normal"><CmsText>{"(Últimos dados disponíveis)"}</CmsText></span>
                </h2>
                <p className="text-xs text-[#94a3b8]"><CmsText>{"Ativos destacados por liquidez, dividend yield e desconto patrimonial."}</CmsText></p>
              </div>

              <CmsElement feature="ui.app/-frontend-/page.Tabs.3"><Tabs
                tabs={[
                  { id: "TODOS", label: "Todos", count: assets.length },
                  { id: "ACAO", label: "Ações" },
                  { id: "FII", label: "FIIs" },
                  { id: "ETF", label: "ETFs" },
                ]}
                activeTab={activeAssetTab}
                onChange={setActiveAssetTab}
              /></CmsElement>
            </div>

            {/* Asset Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2"><CmsText>{"Ativo"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Preço"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Var. 24h"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"D.Y. (12M)"}</CmsText></th>
                    <th className="pb-3 text-right hidden sm:table-cell"><CmsText>{"P/VP"}</CmsText></th>
                    <th className="pb-3 text-right hidden md:table-cell"><CmsText>{"P/L"}</CmsText></th>
                    <th className="pb-3 text-right hidden lg:table-cell"><CmsText>{"Gráfico"}</CmsText></th>
                    <th className="pb-3 text-right pr-2"><CmsText>{"Ação"}</CmsText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <CmsText>{filteredAssets.map((asset) => {
                    const isPositive = asset.change24h != null && asset.change24h >= 0;
                    const detailHref =
                      asset.type === "FII"
                        ? `/fiis/${asset.ticker}`
                        : asset.type === "ETF"
                        ? `/etfs/${asset.ticker}`
                        : `/acoes/${asset.ticker}`;

                    return (
                      <tr
                        key={asset.ticker}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-3.5 pl-2">
                          <CmsElement feature="ui.app/-frontend-/page.Link.4"><Link href={detailHref} className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[#f0f4f8] text-[11px] group-hover:border-[#00f5a0] transition-colors">
                              <CmsText>{asset.ticker.slice(0, 2)}</CmsText>
                            </div>
                            <div>
                              <DataStatus {...quoteProvenance(asset.source, asset.quote_date)} />
                              <TradingStatusNotice trading={asset.trading} />
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-xs group-hover:text-[var(--positive)] transition-colors">
                                  <CmsText>{asset.ticker}</CmsText>
                                </span>
                                <CmsText>{asset.badge && (
                                  <Badge
                                    variant={
                                      asset.badge.includes("Renda")
                                        ? "emerald"
                                        : asset.badge.includes("Desconto") || asset.badge.includes("P/VP")
                                        ? "cyan"
                                        : "violet"
                                    }
                                    className="hidden sm:inline-flex text-[9px] py-0 px-1.5"
                                  >
                                    <CmsText>{asset.badge}</CmsText>
                                  </Badge>
                                )}</CmsText>
                              </div>
                              <div className="text-[11px] text-[#94a3b8] truncate max-w-[140px] sm:max-w-[200px]">
                                <CmsText>{asset.name}</CmsText>
                              </div>
                            </div>
                          </Link></CmsElement>
                        </td>

                        <td className="py-3.5 text-right font-mono font-medium text-white">
                          <CmsText>{formatCurrency(asset.currentPrice)}</CmsText>
                        </td>

                        <td
                          className={`py-3.5 text-right font-mono font-medium ${
                            asset.change24h == null ? "text-[#94a3b8]" : isPositive ? "text-[var(--positive)]" : "text-[#ff3b5c]"
                          }`}
                        >
                          <CmsText>{formatPercent(asset.change24h)}</CmsText>
                        </td>

                        <td className="py-3.5 text-right font-mono font-medium text-white">
                          <CmsText>{formatPercent(asset.dividendYield, false)}</CmsText>
                        </td>

                        <td className="py-3.5 text-right font-mono text-[#94a3b8] hidden sm:table-cell">
                          <CmsText>{formatMultiple(asset.pvp)}</CmsText>
                        </td>

                        <td className="py-3.5 text-right font-mono text-[#94a3b8] hidden md:table-cell">
                          <CmsText>{asset.pl !== undefined && asset.pl !== 0 ? formatMultiple(asset.pl, 1) : "—"}</CmsText>
                        </td>

                        <td className="py-3.5 text-right hidden lg:table-cell">
                          <div className="inline-block w-20 h-5">
                            <Sparkline
                              data={asset.sparkline && asset.sparkline.length > 0 ? asset.sparkline : []}
                              color={isPositive ? "#00f5a0" : "#ff3b5c"}
                              height={20}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 text-right pr-2">
                          <CmsElement feature="ui.app/-frontend-/page.Link.5"><Link
                            href={detailHref}
                            className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors"
                          ><CmsText>{"Analisar"}</CmsText></Link></CmsElement>
                        </td>
                      </tr>
                    );
                  })}</CmsText>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>
        </div>

        {/* Bento 2: AI Committee & Sentiment (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <CmsElement feature="ui.app/-frontend-/page.Card.6"><Card glow="violet">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider"><CmsText>{"Comitê de IA"}</CmsText></h3>
              </div>
              <Badge variant="violet"><CmsText>{"Score "}</CmsText><CmsText>{aiVerdict?.confidence_score ?? "—"}</CmsText><CmsText>{"%"}</CmsText></Badge>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white"><CmsText>{"Destaque: "}</CmsText><CmsText>{aiVerdict?.ticker ?? "—"}</CmsText>
                </span>
                <Badge variant={aiVerdict?.sentiment === "BEARISH" ? "crimson" : "emerald"} dot>
                  <CmsText>{aiVerdict?.sentiment ?? "Indisponível"}</CmsText>
                </Badge>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-4">
                <CmsText>{aiVerdict?.executive_summary ?? "Análise indisponível para este instrumento."}</CmsText>
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#94a3b8]"><CmsText>{"Principais Forças Detectadas:"}</CmsText></span>
              <CmsText>{(aiVerdict?.swot?.strengths ?? [])
                .slice(0, 2)
                .map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-[#f0f4f8]"
                  >
                    <span className="text-[var(--positive)] mt-0.5"><CmsText>{"✓"}</CmsText></span>
                    <span><CmsText>{s}</CmsText></span>
                  </div>
                ))}</CmsText>
            </div>

            <Button href="/radar-ia" variant="violet" className="w-full justify-between"><CmsText>{"Acessar Central do Comitê IA"}</CmsText></Button>
          </Card></CmsElement>

          {/* Quick Valuation Model preview card */}
          <CmsElement feature="ui.app/-frontend-/page.Card.7"><Card glow="cyan">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Valuation Graham / Bazin"}</CmsText></h3>
              <Badge variant="cyan"><CmsText>{"PETR4"}</CmsText></Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-[#94a3b8] uppercase font-semibold"><CmsText>{"Preço Justo Graham"}</CmsText></div>
                <CmsText>{valuationPetr4 ? (
                  <>
                    <div className="text-base font-bold text-[var(--positive)] font-mono mt-0.5">
                      <CmsText>{formatCurrency(valuationPetr4.graham_fair_value)}</CmsText>
                    </div>
                    <div className="text-[10px] text-[var(--positive)] font-medium">
                      <CmsText>{formatPercent(valuationPetr4.graham_upside_pct)}</CmsText><CmsText>{" Margem"}</CmsText></div>
                  </>
                ) : (
                  <p role="status" className="mt-1 text-xs text-[#94a3b8]"><CmsText>{loading ? "Carregando…" : "Dados indisponíveis"}</CmsText></p>
                )}</CmsText>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-[#94a3b8] uppercase font-semibold"><CmsText>{"Preço Teto Bazin"}</CmsText></div>
                <CmsText>{valuationPetr4 ? (
                  <>
                    <div className="text-base font-bold text-[#00d9f5] font-mono mt-0.5">
                      <CmsText>{formatCurrency(valuationPetr4.bazin_ceiling_price)}</CmsText>
                    </div>
                    <div className="text-[10px] text-[#00d9f5] font-medium">
                      <CmsText>{formatPercent(valuationPetr4.bazin_upside_pct)}</CmsText><CmsText>{" Margem"}</CmsText></div>
                  </>
                ) : (
                  <p role="status" className="mt-1 text-xs text-[#94a3b8]"><CmsText>{loading ? "Carregando…" : "Dados indisponíveis"}</CmsText></p>
                )}</CmsText>
              </div>
            </div>

            <CmsElement feature="ui.app/-frontend-/page.Link.8"><Link
              href="/acoes/PETR4"
              className="text-xs text-[#00d9f5] hover:underline flex items-center justify-end gap-1 font-semibold"
            ><CmsText>{"Simular parâmetros interativos ↗"}</CmsText></Link></CmsElement>
          </Card></CmsElement>
        </div>
      </div>

      {/* Bento Bottom Row: Dividend Calendar & Magic Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dividend Agenda (Competência + Pagamento) */}
        <CmsElement feature="ui.app/-frontend-/page.Card.9"><Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Agenda de Dividendos Confirmados"}</CmsText></h3>
              <p className="text-xs text-[#94a3b8]"><CmsText>{"Proventos com data-com definida e mês de competência registrado."}</CmsText></p>
            </div>
            <CmsElement feature="ui.app/-frontend-/page.Link.10"><Link
              href="/agenda-dividendos"
              className="text-xs text-[var(--positive)] hover:underline font-medium"
            ><CmsText>{"Ver Todos ↗"}</CmsText></Link></CmsElement>
          </div>

          <div className="flex flex-col divide-y divide-white/5">
            <CmsText>{dividends.map((div) => (
              <div
                key={div.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(0,245,160,0.1)] border border-[rgba(0,245,160,0.2)] flex items-center justify-center font-bold text-[var(--positive)] text-xs">
                    <CmsText>{div.assetTicker.slice(0, 4)}</CmsText>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        <CmsText>{div.assetTicker}</CmsText>
                      </span>
                      <Badge variant="neutral"><CmsText>{"Comp: "}</CmsText><CmsText>{div.referenceMonth}</CmsText>
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#94a3b8]"><CmsText>{"Data-Com: "}</CmsText><CmsText>{div.dateCom}</CmsText><CmsText>{" • Pagamento: "}</CmsText><CmsText>{div.paymentDate}</CmsText>
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[var(--positive)]">
                    <CmsText>{formatDividendUnit(div.valuePerShare)}</CmsText><CmsText>{" / cota"}</CmsText></div>
                  <div className="text-[10px] text-[#94a3b8]"><CmsText>{"Yield "}</CmsText><CmsText>{formatPercent(div.yieldOnCostPct, false)}</CmsText>
                  </div>
                </div>
              </div>
            ))}</CmsText>
          </div>
        </Card></CmsElement>

        {/* Magic Number Simulator Callout */}
        <CmsElement feature="ui.app/-frontend-/page.Card.11"><Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="badge-neon badge-neon-emerald mb-2"><CmsText>{"Fórmula da Bola de Neve"}</CmsText></span>
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Simulador do Número Mágico"}</CmsText></h3>
              <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Quantas cotas são necessárias para que os proventos mensais comprem uma nova cota automaticamente?"}</CmsText></p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#131926] border border-white/10 mb-4 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]"><CmsText>{"Ativo de Referência"}</CmsText></span>
              <span className="text-white font-bold"><CmsText>{"HGLG11 (CSHG Logística)"}</CmsText></span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]"><CmsText>{"Cotação Atual"}</CmsText></span>
              <span className="font-mono text-white"><CmsText>{"R$ 162,50"}</CmsText></span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]"><CmsText>{"Último Rendimento Distribuído"}</CmsText></span>
              <span className="font-mono text-[var(--positive)]"><CmsText>{"R$ 1,10 / cota"}</CmsText></span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-white block"><CmsText>{"Número Mágico Calculado:"}</CmsText></span>
                <span className="text-[10px] text-[#94a3b8]"><CmsText>{"Ponto de reinvestimento autônomo"}</CmsText></span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xl font-black text-[var(--positive)]"><CmsText>{"148 cotas"}</CmsText></span>
                <span className="text-[10px] text-[#94a3b8] block"><CmsText>{"Aporte Total: R$ 24.050,00"}</CmsText></span>
              </div>
            </div>
          </div>

          <Button href="/fiis" variant="primary" className="w-full justify-between"><CmsText>{"Simular outros FIIs e Ações"}</CmsText></Button>
        </Card></CmsElement>
      </div>
    </div>
  );
}
