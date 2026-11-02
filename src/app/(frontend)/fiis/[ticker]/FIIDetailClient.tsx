"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RadarChart, RadarDataPoint } from "@/components/ui/RadarChart";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatMultiple,
} from "@/lib/formatters";
import { getFIIDetail, FIIDetailData } from "@/lib/api";
import { DataStatus } from "@/components/shared/DataStatus";
import { SectionState } from "@/components/shared/SectionState";
import { quoteProvenance } from "@/lib/quote-provenance";

// Shared Components
import { CadastralGovernanceCard } from "@/components/shared/CadastralGovernanceCard";
import { FundamentalIndicatorsGrid } from "@/components/shared/FundamentalIndicatorsGrid";
import { DividendHistoryTable } from "@/components/shared/DividendHistoryTable";
import { OfficialDisclosuresList } from "@/components/shared/OfficialDisclosuresList";
import { FinancialStatementsTable } from "@/components/shared/FinancialStatementsTable";
import { FIIPropertyPortfolioTable } from "@/components/fiis/FIIPropertyPortfolioTable";

export function FIIDetailClient({ ticker }: { ticker: string }) {
  const [fiiDetail, setFiiDetail] = useState<FIIDetailData | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Magic Number interactive state
  const monthlyYield = Number.NaN; // A single event does not establish recurring monthly income.
  const [targetIncome, setTargetIncome] = useState(5000); // R$ 5.000 de renda mensal

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setFiiDetail(null);
    void getFIIDetail(ticker, controller.signal).then(data => {
      if (controller.signal.aborted) return;
      if (!data || data.ticker.toUpperCase() !== ticker.toUpperCase()) {
        setError("Dados indisponíveis para este FII.");
      } else setFiiDetail(data);
    }).catch(() => {
      if (!controller.signal.aborted) setError("Falha ao consultar este FII.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ticker, revision]);

  const currentPrice = fiiDetail?.current_price ?? Number.NaN;
  const isPositive = (fiiDetail?.indicators?.change_1d ?? Number.NaN) >= 0;

  const hasVerifiedIncomeInput = false;
  const magicCotas = Number.NaN;
  const capitalForMagic = Number.NaN;

  const cotasForTargetIncome = hasVerifiedIncomeInput ? Math.ceil(targetIncome / monthlyYield) : Number.NaN;
  const capitalForTarget = hasVerifiedIncomeInput ? cotasForTargetIncome * currentPrice : Number.NaN;

  // Radar Chart data from Brick Score
  const brickScoreList = fiiDetail?.brick_score ?? [];
  const radarData: RadarDataPoint[] = brickScoreList.map((axis) => ({
    axis: axis.name,
    value: axis.score,
    weight: axis.weight,
  }));

  const overallScore = brickScoreList.length ? Math.round(
    brickScoreList.reduce(
      (acc, curr) => acc + curr.score * curr.weight,
      0
    )
  ) : null;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { id: "dados-cadastrais", label: "Cadastral & Governança" },
    { id: "indicadores", label: "Indicadores" },
    { id: "dividendos", label: `Dividendos (${fiiDetail?.dividends?.length ?? 0})` },
    { id: "comunicados", label: `Comunicados CVM (${fiiDetail?.disclosures?.length ?? 0})` },
    { id: "imoveis", label: `Imóveis & Ativos (${fiiDetail?.properties?.length ?? 0})` },
    { id: "balanco-dre", label: "Balanço & DRE" },
    { id: "brick-score", label: "Brick Score 360°" },
    { id: "magic-number", label: "Bola de Neve" },
  ];

  if (loading || !fiiDetail) return <SectionState loading={loading} error={error || "Dados indisponíveis para este FII."} onRetry={() => setRevision(n => n + 1)} />;

  return (
    <div className="flex flex-col gap-10 animate-fade-up pb-16">
      <DataStatus {...quoteProvenance(fiiDetail.source, fiiDetail.quote_date)} />
      <DataStatus {...quoteProvenance(fiiDetail.fundamentals_source, fiiDetail.fundamentals_date)} />
      <p role="note" className="text-xs text-[#94a3b8]">{fiiDetail.fundamentals_note}</p>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Link.1"><Link href="/" className="hover:text-white transition-colors"><CmsText>{"Cockpit"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Link.2"><Link href="/fiis" className="hover:text-white transition-colors"><CmsText>{"FIIs"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <span className="text-white font-mono font-bold"><CmsText>{ticker}</CmsText></span>
      </div>

      {/* Header Banner - Complete Asset Snapshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0c1017] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,245,160,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#131926] to-[#1c2438] border border-white/15 flex items-center justify-center font-black text-2xl text-white shadow-xl">
            <CmsText>{ticker.slice(0, 2)}</CmsText>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-black text-white tracking-tight">
                <CmsText>{ticker}</CmsText>
              </h1>
              <Badge variant="emerald"><CmsText>{"Dados disponíveis"}</CmsText></Badge>
              <Badge variant="cyan"><CmsText>{fiiDetail?.segment ?? "Logística e Galpões"}</CmsText></Badge>
              <CmsText>{fiiDetail?.cadastral?.mandate && (
                <Badge variant="outline"><CmsText>{fiiDetail.cadastral.mandate}</CmsText></Badge>
              )}</CmsText>
            </div>
            <div className="text-base text-[#e2e8f0] font-semibold mt-1">
              <CmsText>{fiiDetail?.cadastral?.legal_name ?? fiiDetail?.name ?? ticker}</CmsText>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748b] mt-1.5 font-mono">
              <span><CmsText>{"CNPJ: "}</CmsText><CmsText>{fiiDetail?.cadastral?.cnpj ?? "—"}</CmsText></span>
              <span><CmsText>{"•"}</CmsText></span>
              <span><CmsText>{"Admin: "}</CmsText><CmsText>{fiiDetail?.cadastral?.administrator_name ?? "—"}</CmsText></span>
              <span><CmsText>{"•"}</CmsText></span>
              <span><CmsText>{"Gestor: "}</CmsText><CmsText>{fiiDetail?.cadastral?.manager_name ?? "—"}</CmsText></span>
            </div>
          </div>
        </div>

        <div className="flex items-end md:items-center gap-6 z-10 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <div className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider"><CmsText>{"Fechamento nominal (BRL)"}</CmsText></div>
            <div className="text-3xl font-black font-mono text-white mt-0.5 tracking-tight">
              <CmsText>{formatCurrency(currentPrice)}</CmsText>
            </div>
            <div
              className={`text-xs font-mono font-bold mt-1 flex items-center justify-end gap-1.5 ${
                isPositive ? "text-[#00f5a0]" : "text-[#ff3b69]"
              }`}
            >
              <span><CmsText>{isPositive ? "▲" : "▼"}</CmsText> <CmsText>{formatPercent(fiiDetail?.indicators?.change_1d ?? Number.NaN)}</CmsText><CmsText>{" Hoje"}</CmsText></span>
              <span className="text-[#64748b]"><CmsText>{"•"}</CmsText></span>
              <span className="text-[#94a3b8]"><CmsText>{"12M: "}</CmsText><CmsText>{formatPercent(fiiDetail?.indicators?.change_12m ?? Number.NaN)}</CmsText></span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.3"><Card className="text-center p-3 border-emerald-500/20 bg-emerald-500/[0.02]">
          <span className="text-[10px] uppercase font-bold text-[#64748b]"><CmsText>{"DY observado (12M)"}</CmsText></span>
          <div className="text-xl font-black font-mono text-[#00f5a0] mt-1">
            <CmsText>{formatPercent(fiiDetail?.indicators?.dividend_yield_12m ?? fiiDetail?.dividend_yield_12m ?? Number.NaN, false)}</CmsText>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono"><CmsText>{"Último: "}</CmsText><CmsText>{formatCurrency(fiiDetail?.indicators?.last_dividend ?? Number.NaN)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.4"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]"><CmsText>{"P/VP (Cotação / VP)"}</CmsText></span>
          <div className="text-xl font-black font-mono text-white mt-1">
            <CmsText>{formatMultiple(fiiDetail?.indicators?.pvp ?? fiiDetail?.pvp ?? Number.NaN)}</CmsText>
          </div>
          <span className="text-[10px] text-[#00f5a0] font-mono">
            <CmsText>{fiiDetail?.pvp == null ? "Base insuficiente" : fiiDetail.pvp < 1 ? "Com desconto patrimonial" : "Ágio sobre cota"}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.5"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]"><CmsText>{"VP por Cota"}</CmsText></span>
          <div className="text-xl font-black font-mono text-white mt-1">
            <CmsText>{formatCurrency(fiiDetail?.indicators?.vp_per_share ?? Number.NaN)}</CmsText>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono"><CmsText>{"Informe mensal CVM"}</CmsText></span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.6"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]"><CmsText>{"Patrimônio Líquido"}</CmsText></span>
          <div className="text-xl font-black font-mono text-white mt-1">
            <CmsText>{formatCurrency(fiiDetail?.indicators?.net_worth ?? fiiDetail?.net_worth ?? Number.NaN, true)}</CmsText>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono">
            <CmsText>{fiiDetail?.cadastral?.shares_count ? `${(fiiDetail.cadastral.shares_count / 1e6).toFixed(1)}M cotas` : "Ativo consolidado"}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.7"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]"><CmsText>{"Vacância Física"}</CmsText></span>
          <div className="text-xl font-black font-mono text-[#00f5a0] mt-1">
            <CmsText>{formatPercent(fiiDetail?.indicators?.physical_vacancy_pct ?? fiiDetail?.physical_vacancy_pct ?? Number.NaN, false)}</CmsText>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono"><CmsText>{"Financeira: "}</CmsText><CmsText>{formatPercent(fiiDetail?.indicators?.financial_vacancy_pct ?? Number.NaN, false)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.8"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]"><CmsText>{"Cotistas Ativos"}</CmsText></span>
          <div className="text-xl font-black font-mono text-cyan-400 mt-1">
            <CmsText>{fiiDetail?.cadastral?.shareholders_count?.toLocaleString("pt-BR") ?? "—"}</CmsText>
          </div>
          <span className="text-[10px] text-[#64748b] font-mono"><CmsText>{"Base ampla e líquida"}</CmsText></span>
        </Card></CmsElement>
      </div>

      {/* Zero Clicks Sticky Anchor Navigation */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.nav.9"><nav aria-label="Navegação rápida do ativo" className="sticky top-4 z-40 bg-[#0c1017]/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 hidden md:inline"><CmsText>{"Ir para:"}</CmsText></span>
        <CmsText>{navItems.map((item) => (
          <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.button.10" key={item.id}><button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all whitespace-nowrap active:scale-95"
          >
            <CmsText>{item.label}</CmsText>
          </button></CmsElement>
        ))}</CmsText>
      </nav></CmsElement>

      {/* CONTINUOUS VERTICAL CONTENT FLOW (NO TABS, 0 CLICKS) */}

      {/* SECTION 1: DADOS CADASTRAIS & GOVERNANÇA */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.11"><section id="dados-cadastrais" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"1. Dados Cadastrais & Governança Institucional"}</CmsText></h2>
          </div>
          <Badge variant="cyan"><CmsText>{"Registro Oficial CVM"}</CmsText></Badge>
        </div>
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.CadastralGovernanceCard.12"><CadastralGovernanceCard
          legalName={fiiDetail?.cadastral?.legal_name}
          cnpj={fiiDetail?.cadastral?.cnpj}
          tradingCode={ticker}
          administratorName={fiiDetail?.cadastral?.administrator_name}
          administratorCnpj={fiiDetail?.cadastral?.administrator_cnpj}
          administratorAddress={fiiDetail?.cadastral?.administrator_address}
          administratorPhone={fiiDetail?.cadastral?.administrator_phone}
          administratorSite={fiiDetail?.cadastral?.administrator_site}
          managerName={fiiDetail?.cadastral?.manager_name}
          mandate={fiiDetail?.cadastral?.mandate}
          targetAudience={fiiDetail?.cadastral?.target_audience}
          durationTerm={fiiDetail?.cadastral?.duration_term}
          managementType={fiiDetail?.cadastral?.management_type}
          adminFeeDesc={fiiDetail?.cadastral?.admin_fee_desc}
          sharesCount={fiiDetail?.cadastral?.shares_count}
          shareholdersCount={fiiDetail?.cadastral?.shareholders_count}
          segment={fiiDetail?.segment}
        /></CmsElement>
      </section></CmsElement>

      {/* SECTION 2: INDICADORES FUNDAMENTALISTAS */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.13"><section id="indicadores" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"2. Indicadores Fundamentalistas & Métricas de Mercado"}</CmsText></h2>
          </div>
          <Badge variant="emerald"><CmsText>{"Atualizado B3 Diário"}</CmsText></Badge>
        </div>
        <FundamentalIndicatorsGrid
          indicators={fiiDetail?.indicators}
          ticker={ticker}
        />
      </section></CmsElement>

      {/* SECTION 3: HISTÓRICO DE DIVIDENDOS E PROVENTOS (55 MESES) */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.14"><section id="dividendos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"3. Histórico Completo de Dividendos & Pagamentos"}</CmsText></h2>
          </div>
          <Badge variant="emerald">
            <CmsText>{fiiDetail?.dividends?.length ?? 0}</CmsText><CmsText>{" Pagamentos Registrados"}</CmsText></Badge>
        </div>
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.DividendHistoryTable.15"><DividendHistoryTable
          dividends={fiiDetail?.dividends}
          ticker={ticker}
          currentPrice={currentPrice}
        /></CmsElement>
      </section></CmsElement>

      {/* SECTION 4: COMUNICADOS OFICIAIS & FATOS RELEVANTES */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.16"><section id="comunicados" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"4. Comunicados Oficiais, Fatos Relevantes & Informes CVM"}</CmsText></h2>
          </div>
          <Badge variant="amber"><CmsText>{"Divulgações Oficiais B3/CVM"}</CmsText></Badge>
        </div>
        <OfficialDisclosuresList
          disclosures={fiiDetail?.disclosures}
          ticker={ticker}
        />
      </section></CmsElement>

      {/* SECTION 5: PORTFÓLIO DE ATIVOS IMOBILIÁRIOS & CRÉDITO */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.17"><section id="imoveis" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"5. Portfólio de Imóveis Físicos SiiLA & Inquilinos"}</CmsText></h2>
          </div>
          <Badge variant="violet">
            <CmsText>{fiiDetail?.properties?.length ?? 0}</CmsText><CmsText>{" Ativos Físicos Cadastrados"}</CmsText></Badge>
        </div>
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.FIIPropertyPortfolioTable.18"><FIIPropertyPortfolioTable
          properties={fiiDetail?.properties ?? []}
          topTenants={fiiDetail?.top_tenants ?? []}
          criPortfolio={fiiDetail?.cri_portfolio ?? []}
          ticker={ticker}
        /></CmsElement>
      </section></CmsElement>

      {/* SECTION 6: BALANÇO PATRIMONIAL & DRE (DEMONSTRATIVO DE RESULTADOS) */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.19"><section id="balanco-dre" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"6. Balanço Patrimonial & Demonstrativo de Resultados (DRE)"}</CmsText></h2>
          </div>
          <Badge variant="cyan"><CmsText>{"Demonstrações CVM"}</CmsText></Badge>
        </div>
        <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.FinancialStatementsTable.20"><FinancialStatementsTable
          balanceSheet={fiiDetail?.balance_sheet}
          lucratividade={fiiDetail?.lucratividade}
          ticker={ticker}
        /></CmsElement>
      </section></CmsElement>

      {/* SECTION 7: BRICK SCORE 360° INSTITUCIONAL */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.21"><section id="brick-score" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"7. Avaliação Multidimensional Brick Score 360° (6 Eixos)"}</CmsText></h2>
          </div>
          <Badge variant="violet"><CmsText>{overallScore ?? "—"}</CmsText><CmsText>{" / 100 Pts"}</CmsText></Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.22"><Card glow="violet" className="w-full flex flex-col items-center p-4">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Radar Poligonal de Qualidade"}</CmsText></span>
                <Badge variant="violet"><CmsText>{overallScore == null ? "Score indisponível" : `Score ${overallScore}/100`}</CmsText></Badge>
              </div>
              <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.RadarChart.23"><RadarChart data={radarData} size={300} color="#a855f7" fillOpacity={0.25} /></CmsElement>
            </Card></CmsElement>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-3">
            <CmsText>{brickScoreList.map((axis) => (
              <div
                key={axis.name}
                className="p-3.5 rounded-2xl bg-[#0c1017] border border-white/5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    <CmsText>{axis.name}</CmsText>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00f5a0]">
                      <CmsText>{axis.score}</CmsText><CmsText>{" pts"}</CmsText></span>
                    <Badge variant={axis.status === "EXCELENTE" ? "emerald" : "cyan"}>
                      <CmsText>{axis.status}</CmsText>
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  <CmsText>{axis.comment}</CmsText>
                </p>
              </div>
            ))}</CmsText>
          </div>
        </div>
      </section></CmsElement>

      {/* SECTION 8: SIMULADOR DE INDEPENDÊNCIA (MAGIC NUMBER & BOLA DE NEVE) */}
      <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.section.24"><section id="magic-number" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"8. Simulador de Independência Financeira (Magic Number & Bola de Neve)"}</CmsText></h2>
          </div>
          <Badge variant="neutral"><CmsText>{"Projeção indisponível"}</CmsText></Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Magic Number Card */}
          <div className="lg:col-span-6">
            <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.25"><Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Efeito Bola de Neve (Magic Number)"}</CmsText></h3>
                <Badge variant="neutral"><CmsText>{"Indisponível"}</CmsText></Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase font-semibold"><CmsText>{"Cotas para Autocompra Mensal"}</CmsText></span>
                <div className="text-4xl font-black font-mono text-[#00f5a0] my-2">
                  <CmsText>{formatNumber(magicCotas, 0)}</CmsText><CmsText>{" Cotas"}</CmsText></div>
                <span className="text-xs text-[#94a3b8]"><CmsText>{"Investimento Necessário: "}</CmsText><CmsText>{formatCurrency(capitalForMagic)}</CmsText>
                </span>
              </div>

              <div role="status" className="text-xs text-[#64748b] leading-relaxed"><CmsText>{"Simulação indisponível: um pagamento isolado não comprova renda mensal recorrente e o DY de 12 meses não tem cobertura verificada."}</CmsText></div>
            </Card></CmsElement>
          </div>

          {/* Retirement Goal Simulator */}
          <div className="lg:col-span-6">
            <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.Card.26"><Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Meta de Renda Passiva"}</CmsText></h3>
                <Badge variant="cyan"><CmsText>{"Simulador Mensal"}</CmsText></Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#94a3b8]"><CmsText>{"Renda Mensal Desejada:"}</CmsText></span>
                  <span className="font-mono text-white font-bold">
                    <CmsText>{formatCurrency(targetIncome)}</CmsText><CmsText>{" / mês"}</CmsText></span>
                </div>
                <CmsElement feature="ui.app/-frontend-/fiis/-ticker-/FIIDetailClient.input.27"><input
                  type="range"
                  min="1000"
                  max="30000"
                  step="500"
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(parseFloat(e.target.value))}
                  className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                /></CmsElement>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#131926] border border-white/5 text-center">
                <div>
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold"><CmsText>{"Cotas Necessárias"}</CmsText></div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    <CmsText>{formatNumber(cotasForTargetIncome)}</CmsText>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold"><CmsText>{"Patrimônio Alocado"}</CmsText></div>
                  <div className="text-xl font-bold font-mono text-[#00d9f5] mt-1">
                    <CmsText>{formatCurrency(capitalForTarget, true)}</CmsText>
                  </div>
                </div>
              </div>
            </Card></CmsElement>
          </div>
        </div>
      </section></CmsElement>
    </div>
  );
}
