"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BarChart } from "@/components/ui/BarChart";
import {
  formatCurrency,
  formatPercent,
  formatMultiple,
  formatNumber,
  calculateGrahamValue,
  calculateBazinPrice,
} from "@/lib/formatters";
import {
  getStockValuation,
  getStockCompleteDetails,
  getStockFinancialMatrix,
  getStockDividendMatrix,
  StockValuationDetail,
  StockCompleteDetails,
} from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";
import { FinancialMatrixData, DividendMatrixData } from "@/schemas/oceans14";
import { DataStatus } from "@/components/shared/DataStatus";
import { SectionState } from "@/components/shared/SectionState";
import { StockFundamentalsGrid } from "@/components/stocks/StockFundamentalsGrid";
import { StockPriceHistorySection } from "@/components/stocks/StockPriceHistorySection";

export function AcaoDetailClient({ ticker, initialDetails = null, initialValuation = null }: {
  ticker: string; initialDetails?: StockCompleteDetails | null; initialValuation?: StockValuationDetail | null;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [valuationData, setValuationData] = useState<StockValuationDetail | null>(initialValuation);
  const [completeDetails, setCompleteDetails] = useState<StockCompleteDetails | null>(initialDetails);
  const [financialMatrix, setFinancialMatrix] = useState<FinancialMatrixData | null>(null);
  const [dividendMatrix, setDividendMatrix] = useState<DividendMatrixData | null>(null);
  const [matrixPeriod, setMatrixPeriod] = useState<"ANUAL" | "TRIMESTRAL">("ANUAL");
  const stockInfo: Partial<AssetSummary> | null = completeDetails ? {
    name: completeDetails.details.name, sector: completeDetails.details.sector,
    subsector: completeDetails.details.subsector, currentPrice: completeDetails.details.current_price ?? undefined,
    pl: completeDetails.multiples.pl, pvp: completeDetails.multiples.pvp,
    dividendYield: completeDetails.multiples.dividend_yield,
  } : null;
  const [loading, setLoading] = useState(!initialDetails);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [revision, setRevision] = useState(0);

  // Dynamic Graham & Bazin interactive sliders
  const [lpaInput, setLpaInput] = useState(initialValuation?.lpa ?? 0);
  const [vpaInput, setVpaInput] = useState(initialValuation?.vpa ?? 0);
  const [dpaInput, setDpaInput] = useState(initialValuation?.dpa_medio ?? 0);
  const [bazinYieldTarget, setBazinYieldTarget] = useState(0.06);

  // Dynamic Gordon & DCF Interactive States
  const [gordonGrowth, setGordonGrowth] = useState(0.04);
  const [gordonDiscount, setGordonDiscount] = useState(0.12);
  const [dcfGrowth5y, setDcfGrowth5y] = useState(0.06);
  const [dcfWacc, setDcfWacc] = useState(0.11);
  const [dcfTerminalGrowth, setDcfTerminalGrowth] = useState(0.035);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  };

  // Deep linking: if tab or hash param is present, smooth scroll to section
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    const target =
      hash ||
      (tabParam ? tabParam.toLowerCase().replace(/_/g, "-") : "");
    if (target) {
      const el =
        document.getElementById(target) ||
        document.getElementById(`panel-${tabParam}`) ||
        (target === "matriz-10a" ? document.getElementById("matriz-10a") : null) ||
        (target === "valuation" ? document.getElementById("valuation") : null);
      if (el) {
        const timer = setTimeout(() => el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }), 150);
        return () => clearTimeout(timer);
      }
    }
  }, [tabParam]);

  useEffect(() => {
    const controller = new AbortController();
    // A new request generation invalidates the previous visible loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const run = async <T,>(key: string, request: Promise<T>, apply: (data: T) => void) => {
      try {
        const data = await request;
        if (!controller.signal.aborted) {
          apply(data);
          setErrors(prev => ({ ...prev, [key]: null }));
        }
      } catch {
        if (!controller.signal.aborted) setErrors(prev => ({ ...prev, [key]: "Dados indisponíveis nesta seção." }));
      }
    };
    void Promise.allSettled([
      run("valuation", getStockValuation(ticker, controller.signal), data => {
        setValuationData(data);
        if (data) { setLpaInput(data.lpa); setVpaInput(data.vpa); setDpaInput(data.dpa_medio); }
      }),
      run("details", getStockCompleteDetails(ticker, controller.signal), setCompleteDetails),
      run("dividends", getStockDividendMatrix(ticker, controller.signal), setDividendMatrix),
    ]).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ticker, revision]);

  useEffect(() => {
    const controller = new AbortController();
    // A new request generation invalidates the previous visible loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFinancialMatrix(null);
    setErrors(prev => ({ ...prev, matrix: null }));
    void getStockFinancialMatrix(ticker, matrixPeriod, controller.signal).then(data => {
      if (!controller.signal.aborted) setFinancialMatrix(data);
    }).catch(() => {
      if (!controller.signal.aborted) setErrors(prev => ({ ...prev, matrix: "Matriz indisponível para o período selecionado." }));
    });
    return () => controller.abort();
  }, [ticker, matrixPeriod, revision]);

  const stockPrice = stockInfo?.currentPrice ?? valuationData?.current_price ?? Number.NaN;
  const isPositive = (stockInfo?.change24h ?? Number.NaN) >= 0;

  // Calculated values: Graham
  const dynamicGraham = valuationData && lpaInput > 0 && vpaInput > 0 ? calculateGrahamValue(lpaInput, vpaInput) : Number.NaN;
  const dynamicGrahamUpside =
    stockPrice > 0 ? ((dynamicGraham - stockPrice) / stockPrice) * 100 : Number.NaN;
  const dynamicGrahamMargin =
    dynamicGraham > 0 && Number.isFinite(stockPrice) ? ((dynamicGraham - stockPrice) / dynamicGraham) * 100 : Number.NaN;

  // Calculated values: Décio Bazin
  const dynamicBazin = valuationData ? calculateBazinPrice(dpaInput, bazinYieldTarget) : Number.NaN;
  const dynamicBazinUpside =
    stockPrice > 0 ? ((dynamicBazin - stockPrice) / stockPrice) * 100 : Number.NaN;
  const dynamicBazinMargin =
    dynamicBazin > 0 && Number.isFinite(stockPrice) ? ((dynamicBazin - stockPrice) / dynamicBazin) * 100 : Number.NaN;

  // Gordon calculation
  const dynamicGordon =
    valuationData && gordonDiscount > gordonGrowth
      ? (dpaInput * (1 + gordonGrowth)) / (gordonDiscount - gordonGrowth)
      : Number.NaN;
  const dynamicGordonUpside =
    stockPrice > 0 ? ((dynamicGordon - stockPrice) / stockPrice) * 100 : Number.NaN;

  // DCF calculation
  let pvFcf = 0;
  const baseFcf =
    valuationData?.lpa && valuationData.lpa > 0
      ? valuationData.lpa * 0.8
      : lpaInput > 0
      ? lpaInput * 0.8
      : Number.NaN;
  let curFcf = baseFcf;
  for (let i = 1; i <= 5; i++) {
    curFcf *= 1 + dcfGrowth5y;
    pvFcf += curFcf / Math.pow(1 + dcfWacc, i);
  }
  const terminalVal =
    dcfWacc > dcfTerminalGrowth
      ? (curFcf * (1 + dcfTerminalGrowth)) / (dcfWacc - dcfTerminalGrowth)
      : Number.NaN;
  const dynamicDcf = pvFcf + terminalVal / Math.pow(1 + dcfWacc, 5);
  const dynamicDcfUpside =
    stockPrice > 0 ? ((dynamicDcf - stockPrice) / stockPrice) * 100 : Number.NaN;
  const dynamicDcfMargin =
    dynamicDcf > 0 && Number.isFinite(stockPrice) ? ((dynamicDcf - stockPrice) / dynamicDcf) * 100 : Number.NaN;

  // DRE Chart Data from DB
  const dreEntries = valuationData?.dre_history ?? [];
  const dreChartData = dreEntries.filter(entry => Number.isFinite(entry.netRevenue) && Number.isFinite(entry.netIncome)).map((entry) => ({
    label: entry.year,
    value: entry.netRevenue!,
    secondaryValue: entry.netIncome!,
  }));

  const checklistItems = valuationData?.checklist ?? [];
  const dividendEntries = valuationData?.dividends ?? [];
  const technical = valuationData?.technical;
  const aiVerdict = valuationData?.ai_verdict;

  const navItems = [
    { id: "valuation", label: "1. Valuation (Graham / Bazin)", testId: "tab-VALUATION" },
    { id: "matriz-10a", label: "2. Balanço 10A (Oceans14)", testId: "tab-MATRIZ_10A" },
    { id: "grade-proventos", label: "3. Grade de Proventos", testId: "tab-GRADE_PROVENTOS" },
    { id: "cotacao-historica", label: "4. Cotações B3", testId: "tab-COTACAO_HISTORICA" },
    { id: "fundamentos", label: "5. Fundamentos (Fundamentus)", testId: "tab-FUNDAMENTOS" },
    { id: "checklist", label: `6. Checklist Buy & Hold (${checklistItems.length})`, testId: "tab-CHECKLIST" },
    { id: "dre", label: "7. DRE 5 Anos", testId: "tab-DRE" },
    { id: "proventos", label: `8. Proventos (${dividendEntries.length})`, testId: "tab-PROVENTOS" },
    { id: "tecnica", label: "9. Análise Técnica", testId: "tab-TECNICA" },
    { id: "ia", label: "10. Radar IA & SWOT", testId: "tab-IA" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Link.1"><Link href="/" className="hover:text-white transition-colors"><CmsText>{"Cockpit"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Link.2"><Link href="/acoes" className="hover:text-white transition-colors"><CmsText>{"Ações"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <span className="text-white font-mono font-bold"><CmsText>{ticker}</CmsText></span>
      </div>

      {/* Asset Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0c1017] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,245,160,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#131926] border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-xl">
            <CmsText>{ticker.slice(0, 2)}</CmsText>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                <CmsText>{ticker}</CmsText>
              </h2>
              <Badge variant="emerald"><CmsText>{stockInfo?.badge ?? "Listada B3"}</CmsText></Badge>
            </div>
            <div className="text-sm text-[#94a3b8] font-medium mt-0.5">
              <CmsText>{stockInfo?.name ?? valuationData?.name ?? ticker}</CmsText>
            </div>
            <div className="text-xs text-[#94a3b8] mt-1">
              <CmsText>{stockInfo?.sector ?? "Mercado de Capitais"}</CmsText><CmsText>{" • "}</CmsText><CmsText>{stockInfo?.subsector ?? "Empresas Abertas"}</CmsText>
            </div>
          </div>
        </div>

        <div className="flex items-end md:items-center gap-6 z-10 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <div className="text-xs text-[#94a3b8] uppercase font-semibold"><CmsText>{"Último preço disponível"}</CmsText></div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              <CmsText>{formatCurrency(stockPrice)}</CmsText>
            </div>
            <div
              className={`text-xs font-mono font-bold mt-0.5 ${
                isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"
              }`}
            >
              <CmsText>{formatPercent(stockInfo?.change24h ?? Number.NaN)}</CmsText><CmsText>{" Hoje • 12M: "}</CmsText><CmsText>{formatPercent(stockInfo?.change12m ?? Number.NaN)}</CmsText>
            </div>
          </div>
        </div>
      </div>

      <DataStatus mode={loading ? "loading" : errors.details && completeDetails ? "stale" : completeDetails ? "periodic" : "missing"} asOf={completeDetails?.details.data_cotacao} />
      <CmsText>{Object.entries(errors).filter(([key]) => key !== "details").map(([key, error]) => <SectionState key={key} error={error} onRetry={() => setRevision(n => n + 1)} />)}</CmsText>
      <p className="text-xs text-[#94a3b8]"><CmsText>{"Valuation é uma estimativa baseada nos parâmetros abaixo, não uma recomendação. DCF usa aproximação de 80% do lucro por ação, não fluxo de caixa reportado. Séries contábeis distintas não foram reconciliadas."}</CmsText></p>
      {/* KPI Top Bar - Executive Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.3"><Card className="text-center p-3 border-emerald-500/20 bg-emerald-500/[0.02]">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]"><CmsText>{"Dividend Yield (12M)"}</CmsText></span>
          <div className="text-xl font-black font-mono text-[var(--positive)] mt-1">
            <CmsText>{formatPercent(stockInfo?.dividendYield ?? (stockPrice > 0 ? (dpaInput / stockPrice) * 100 : Number.NaN), false)}</CmsText>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono"><CmsText>{"DPA implícito: "}</CmsText><CmsText>{formatCurrency(valuationData ? dpaInput : Number.NaN)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.4"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]"><CmsText>{"P/L (Preço / Lucro)"}</CmsText></span>
          <div className="text-xl font-black font-mono text-white mt-1">
            <CmsText>{formatMultiple(stockInfo?.pl)}</CmsText>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono"><CmsText>{"LPA: "}</CmsText><CmsText>{formatCurrency(valuationData ? lpaInput : Number.NaN)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.5"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]"><CmsText>{"P/VP (Preço / Valor Patr.)"}</CmsText></span>
          <div className="text-xl font-black font-mono text-white mt-1">
            <CmsText>{formatMultiple(stockInfo?.pvp)}</CmsText>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono"><CmsText>{"VPA: "}</CmsText><CmsText>{formatCurrency(valuationData ? vpaInput : Number.NaN)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.6"><Card className="text-center p-3 border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]"><CmsText>{"Justo Benjamin Graham"}</CmsText></span>
          <div className={`text-xl font-black font-mono mt-1 ${dynamicGrahamUpside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
            <CmsText>{formatCurrency(dynamicGraham)}</CmsText>
          </div>
          <span className={`text-[10px] font-mono font-bold ${dynamicGrahamUpside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
            <CmsText>{dynamicGrahamUpside >= 0 ? "▲ Upside" : "▼ Ágio"}</CmsText> <CmsText>{formatPercent(dynamicGrahamUpside)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.7"><Card className="text-center p-3 border-cyan-500/20">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]"><CmsText>{"Teto Décio Bazin"}</CmsText></span>
          <div className={`text-xl font-black font-mono mt-1 ${dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"}`}>
            <CmsText>{formatCurrency(dynamicBazin)}</CmsText>
          </div>
          <span className={`text-[10px] font-mono font-bold ${dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"}`}><CmsText>{"Margem: "}</CmsText><CmsText>{formatPercent(dynamicBazinMargin)}</CmsText>
          </span>
        </Card></CmsElement>

        <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.8"><Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]"><CmsText>{"Checklist Buy & Hold"}</CmsText></span>
          <div className="text-xl font-black font-mono text-[var(--positive)] mt-1">
            <CmsText>{checklistItems.filter((c) => c.passed).length}</CmsText><CmsText>{" / "}</CmsText><CmsText>{checklistItems.length}</CmsText>
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono">
            <CmsText>{checklistItems.filter((c) => c.passed).length === (checklistItems.length) ? "Critérios calculados" : "Critérios disponíveis"}</CmsText>
          </span>
        </Card></CmsElement>
      </div>

      {/* Zero Clicks Sticky Anchor Navigation */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.nav.9"><nav
        aria-label="Navegação rápida da ação"
        className="sticky top-[var(--asset-nav-top,5.5rem)] z-40 bg-[#0c1017]/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 hidden md:inline"><CmsText>{"Ir para:"}</CmsText></span>
        <CmsText>{navItems.map((item) => (
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.button.10" key={item.id}><button
            key={item.id}
            id={item.testId}
            onClick={() => scrollToSection(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <CmsText>{item.label}</CmsText>
          </button></CmsElement>
        ))}</CmsText>
      </nav></CmsElement>

      {/* CONTINUOUS VERTICAL CONTENT FLOW (NO TABS, ZERO CLICKS) */}

      {/* SECTION 1: Modelos de Valuation */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.11"><section id="valuation" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"1. Modelos de Valuation & Preço Justo (Graham, Bazin, Gordon & DCF)"}</CmsText></h2>
          </div>
          <Badge variant="emerald"><CmsText>{"Modelos Quantitativos"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-VALUATION"
          aria-labelledby="tab-VALUATION"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Benjamin Graham Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.12"><Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-emerald mb-2"><CmsText>{"Fórmula de Benjamin Graham"}</CmsText></span>
                  <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Preço Justo Intrínseco"}</CmsText></h3>
                  <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Baseado na equação clássica: √(22,5 × LPA × VPA)"}</CmsText></p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[var(--positive)]">
                    <CmsText>{formatCurrency(dynamicGraham)}</CmsText>
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      dynamicGrahamUpside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                    }`}
                  ><CmsText>{"Upside: "}</CmsText><CmsText>{formatPercent(dynamicGrahamUpside)}</CmsText>
                  </div>
                  <CmsText>{dynamicGrahamMargin > 0 && (
                    <div className="text-[10px] font-mono text-[#94a3b8]"><CmsText>{"Margem Segurança: "}</CmsText><CmsText>{formatPercent(dynamicGrahamMargin)}</CmsText>
                    </div>
                  )}</CmsText>
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5 my-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]"><CmsText>{"Lucro Por Ação (LPA):"}</CmsText></span>
                    <span className="font-mono text-white font-bold">
                      <CmsText>{formatCurrency(valuationData ? lpaInput : Number.NaN)}</CmsText>
                    </span>
                  </div>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.13"><input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.1"
                    value={lpaInput}
                    onChange={(e) => setLpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  /></CmsElement>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]"><CmsText>{"Valor Patrimonial Por Ação (VPA):"}</CmsText></span>
                    <span className="font-mono text-white font-bold">
                      <CmsText>{formatCurrency(valuationData ? vpaInput : Number.NaN)}</CmsText>
                    </span>
                  </div>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.14"><input
                    type="range"
                    min="10.0"
                    max="60.0"
                    step="0.5"
                    value={vpaInput}
                    onChange={(e) => setVpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  /></CmsElement>
                </div>
              </div>

              <div className="text-xs text-[#94a3b8] leading-relaxed mt-2"><CmsText>{"O modelo de Graham estabelece que o múltiplo P/L × P/VP não deve ultrapassar 22,5 em empresas com estabilidade de lucros e margem de segurança conservadora."}</CmsText></div>
            </Card></CmsElement>
          </div>

          {/* Décio Bazin Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.15"><Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-cyan mb-2"><CmsText>{"Método Décio Bazin"}</CmsText></span>
                  <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Preço Teto de Compra"}</CmsText></h3>
                  <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Preço Teto = DPA implícito ÷ Yield Mínimo Desejado (6%)"}</CmsText></p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00d9f5]">
                    <CmsText>{formatCurrency(dynamicBazin)}</CmsText>
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"
                    }`}
                  ><CmsText>{"Upside: "}</CmsText><CmsText>{formatPercent(dynamicBazinUpside)}</CmsText>
                  </div>
                  <CmsText>{dynamicBazinMargin > 0 && (
                    <div className="text-[10px] font-mono text-[#94a3b8]"><CmsText>{"Desconto s/ Teto: "}</CmsText><CmsText>{formatPercent(dynamicBazinMargin)}</CmsText>
                    </div>
                  )}</CmsText>
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5 my-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]"><CmsText>{"Dividendo Médio Por Ação (DPA):"}</CmsText></span>
                    <span className="font-mono text-white font-bold">
                      <CmsText>{formatCurrency(valuationData ? dpaInput : Number.NaN)}</CmsText>
                    </span>
                  </div>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.16"><input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={dpaInput}
                    onChange={(e) => setDpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  /></CmsElement>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]"><CmsText>{"Taxa de Yield Mínimo Alvo:"}</CmsText></span>
                    <span className="font-mono text-white font-bold">
                      <CmsText>{formatNumber(bazinYieldTarget * 100, 1)}</CmsText><CmsText>{"% a.a."}</CmsText></span>
                  </div>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.17"><input
                    type="range"
                    min="0.04"
                    max="0.12"
                    step="0.005"
                    value={bazinYieldTarget}
                    onChange={(e) => setBazinYieldTarget(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  /></CmsElement>
                </div>
              </div>

              <div className="text-xs text-[#94a3b8] leading-relaxed mt-2"><CmsText>{"Décio Bazin preconizava pagar no máximo o valor que garante 6% de dividendo anual líquido, desde que a empresa apresente endividamento saudável e boa liquidez."}</CmsText></div>
            </Card></CmsElement>
          </div>

          {/* Gordon Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.18"><Card glow="violet">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-violet mb-2"><CmsText>{"Modelo de Gordon (DDM)"}</CmsText></span>
                  <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Crescimento Perpétuo de Dividendos"}</CmsText></h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#a855f7]">
                    <CmsText>{formatCurrency(dynamicGordon)}</CmsText>
                  </div>
                  <div className="text-xs font-mono font-bold text-[#a855f7]"><CmsText>{"Margem: "}</CmsText><CmsText>{formatPercent(dynamicGordonUpside)}</CmsText>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1"><CmsText>{"Crescimento (g)"}</CmsText></label>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.19"><input
                    type="range"
                    min="0.01"
                    max="0.08"
                    step="0.005"
                    value={gordonGrowth}
                    onChange={(e) => setGordonGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7] bg-white/10 h-1.5 rounded cursor-pointer"
                  /></CmsElement>
                  <span className="text-xs font-mono text-white block mt-1">
                    <CmsText>{formatNumber(gordonGrowth * 100, 1)}</CmsText><CmsText>{"%"}</CmsText></span>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1"><CmsText>{"Custo de Capital (Ke)"}</CmsText></label>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.20"><input
                    type="range"
                    min="0.09"
                    max="0.18"
                    step="0.005"
                    value={gordonDiscount}
                    onChange={(e) => setGordonDiscount(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7] bg-white/10 h-1.5 rounded cursor-pointer"
                  /></CmsElement>
                  <span className="text-xs font-mono text-white block mt-1">
                    <CmsText>{formatNumber(gordonDiscount * 100, 1)}</CmsText><CmsText>{"%"}</CmsText></span>
                </div>
              </div>
            </Card></CmsElement>
          </div>

          {/* DCF Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.21"><Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-cyan mb-2"><CmsText>{"Fluxo de Caixa Descontado (DCF)"}</CmsText></span>
                  <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Valor Intrínseco 5 Anos + Perpetuidade"}</CmsText></h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00d9f5]">
                    <CmsText>{formatCurrency(dynamicDcf)}</CmsText>
                  </div>
                  <div className={`text-xs font-mono font-bold ${dynamicDcfUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"}`}><CmsText>{"Upside: "}</CmsText><CmsText>{formatPercent(dynamicDcfUpside)}</CmsText>
                  </div>
                  <CmsText>{dynamicDcfMargin > 0 && (
                    <div className="text-[10px] font-mono text-[#94a3b8]"><CmsText>{"Margem Segurança: "}</CmsText><CmsText>{formatPercent(dynamicDcfMargin)}</CmsText>
                    </div>
                  )}</CmsText>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1"><CmsText>{"Crescimento FCF"}</CmsText></label>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.22"><input
                    type="range"
                    min="0.02"
                    max="0.12"
                    step="0.01"
                    value={dcfGrowth5y}
                    onChange={(e) => setDcfGrowth5y(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  /></CmsElement>
                  <span className="text-xs font-mono text-white block mt-1">
                    <CmsText>{formatNumber(dcfGrowth5y * 100, 0)}</CmsText><CmsText>{"%"}</CmsText></span>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1"><CmsText>{"WACC"}</CmsText></label>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.23"><input
                    type="range"
                    min="0.08"
                    max="0.16"
                    step="0.005"
                    value={dcfWacc}
                    onChange={(e) => setDcfWacc(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  /></CmsElement>
                  <span className="text-xs font-mono text-white block mt-1">
                    <CmsText>{formatNumber(dcfWacc * 100, 1)}</CmsText><CmsText>{"%"}</CmsText></span>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1"><CmsText>{"Crescimento Perpétuo"}</CmsText></label>
                  <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.input.24"><input
                    type="range"
                    min="0.02"
                    max="0.05"
                    step="0.005"
                    value={dcfTerminalGrowth}
                    onChange={(e) => setDcfTerminalGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  /></CmsElement>
                  <span className="text-xs font-mono text-white block mt-1">
                    <CmsText>{formatNumber(dcfTerminalGrowth * 100, 1)}</CmsText><CmsText>{"%"}</CmsText></span>
                </div>
              </div>
            </Card></CmsElement>
          </div>
        </div>
      </section></CmsElement>

      {/* SECTION 2: Oceans14 10-Year Statement Matrix */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.25"><section id="matriz-10a" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"2. Matriz Contábil Padronizada Oceans14 (Série Histórica 10 Anos)"}</CmsText></h2>
          </div>
          <Badge variant="cyan"><CmsText>{"Demonstrações disponíveis"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-MATRIZ_10A"
          aria-labelledby="tab-MATRIZ_10A"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#131926]/40 border border-white/5">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Matriz Contábil Padronizada Oceans14 (10 Anos)"}</CmsText></span>
              <p className="text-[11px] text-[#94a3b8] mt-0.5"><CmsText>{"Série informada pela fonte. Confira período, unidade e metodologia antes de comparar."}</CmsText></p>
            </div>
            <div className="flex items-center gap-2">
              <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.button.26"><button
                onClick={() => setMatrixPeriod("ANUAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  matrixPeriod === "ANUAL"
                    ? "bg-[#00f5a0] text-black shadow-[0_0_15px_rgba(0,245,160,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              ><CmsText>{"Anual Consolidado"}</CmsText></button></CmsElement>
              <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.button.27"><button
                onClick={() => setMatrixPeriod("TRIMESTRAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  matrixPeriod === "TRIMESTRAL"
                    ? "bg-[#00f5a0] text-black shadow-[0_0_15px_rgba(0,245,160,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              ><CmsText>{"Trimestral"}</CmsText></button></CmsElement>
            </div>
          </div>

          {/* DRE Matrix */}
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.28"><Card glow="none" className="p-0 overflow-hidden">
            <div className="p-3.5 bg-[#131926]/70 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"DRE — Demonstração do Resultado do Exercício (R$ Milhões)"}</CmsText></span>
              <Badge variant="cyan"><CmsText>{"Regime de Competência"}</CmsText></Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/90 font-sans">
                    <th className="py-2.5 pl-4 min-w-[240px] sticky left-0 bg-[#131926] z-10"><CmsText>{"Conta Contábil"}</CmsText></th>
                    <CmsText>{(financialMatrix?.years ?? []).map((y) => (
                      <th key={y} className="py-2.5 px-3 text-right min-w-[100px]"><CmsText>{y}</CmsText></th>
                    ))}</CmsText>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <CmsText>{(financialMatrix?.dre ?? []).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] ${row.is_total ? "font-bold text-white bg-white/[0.01]" : "text-[#94a3b8]"}`}>
                      <td className={`py-2 pl-4 sticky left-0 bg-[#0a0e17] z-10 font-sans ${row.indentation_level ? "pl-8 text-[#94a3b8]" : ""}`}>
                        <CmsText>{row.account_name}</CmsText>
                      </td>
                      <CmsText>{(financialMatrix?.years ?? []).map((y) => {
                        const val = row.values_by_year[y];
                        const isNeg = val !== null && val !== undefined && val < 0;
                        return (
                          <td key={y} className={`py-2 px-3 text-right ${isNeg ? "text-[var(--negative)]" : ""}`}>
                            <CmsText>{val !== null && val !== undefined ? (val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}</CmsText>
                          </td>
                        );
                      })}</CmsText>
                    </tr>
                  ))}</CmsText>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>

          {/* Balance Sheet Matrix */}
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.29"><Card glow="none" className="p-0 overflow-hidden">
            <div className="p-3.5 bg-[#131926]/70 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Balanço Patrimonial — Ativo, Passivo & Patrimônio Líquido (R$ Milhões)"}</CmsText></span>
              <Badge variant="violet"><CmsText>{"Estrutura de Capital"}</CmsText></Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/90 font-sans">
                    <th className="py-2.5 pl-4 min-w-[240px] sticky left-0 bg-[#131926] z-10"><CmsText>{"Conta Patrimonial"}</CmsText></th>
                    <CmsText>{(financialMatrix?.years ?? []).map((y) => (
                      <th key={y} className="py-2.5 px-3 text-right min-w-[100px]"><CmsText>{y}</CmsText></th>
                    ))}</CmsText>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <CmsText>{(financialMatrix?.balance_sheet ?? []).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] ${row.is_total ? "font-bold text-white bg-white/[0.01]" : "text-[#94a3b8]"}`}>
                      <td className={`py-2 pl-4 sticky left-0 bg-[#0a0e17] z-10 font-sans ${row.indentation_level ? "pl-8 text-[#94a3b8]" : ""}`}>
                        <CmsText>{row.account_name}</CmsText>
                      </td>
                      <CmsText>{(financialMatrix?.years ?? []).map((y) => {
                        const val = row.values_by_year[y];
                        return (
                          <td key={y} className="py-2 px-3 text-right">
                            <CmsText>{val !== null && val !== undefined ? (val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}</CmsText>
                          </td>
                        );
                      })}</CmsText>
                    </tr>
                  ))}</CmsText>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>

          {/* Cash Flow Matrix */}
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.30"><Card glow="none" className="p-0 overflow-hidden">
            <div className="p-3.5 bg-[#131926]/70 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"DFC — Demonstração do Fluxo de Caixa & Caixa Livre (R$ Milhões)"}</CmsText></span>
              <Badge variant="emerald"><CmsText>{"Geração de Caixa"}</CmsText></Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/90 font-sans">
                    <th className="py-2.5 pl-4 min-w-[240px] sticky left-0 bg-[#131926] z-10"><CmsText>{"Fluxo de Caixa"}</CmsText></th>
                    <CmsText>{(financialMatrix?.years ?? []).map((y) => (
                      <th key={y} className="py-2.5 px-3 text-right min-w-[100px]"><CmsText>{y}</CmsText></th>
                    ))}</CmsText>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <CmsText>{(financialMatrix?.cash_flow ?? []).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] ${row.is_total ? "font-bold text-[var(--positive)]" : "text-[#94a3b8]"}`}>
                      <td className="py-2 pl-4 sticky left-0 bg-[#0a0e17] z-10 font-sans">
                        <CmsText>{row.account_name}</CmsText>
                      </td>
                      <CmsText>{(financialMatrix?.years ?? []).map((y) => {
                        const val = row.values_by_year[y];
                        const isNeg = val !== null && val !== undefined && val < 0;
                        return (
                          <td key={y} className={`py-2 px-3 text-right ${isNeg ? "text-[var(--negative)]" : ""}`}>
                            <CmsText>{val !== null && val !== undefined ? (val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}</CmsText>
                          </td>
                        );
                      })}</CmsText>
                    </tr>
                  ))}</CmsText>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 3: Monthly Dividend Matrix (Jan-Dez) */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.31"><section id="grade-proventos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"3. Grade Mensal de Proventos & Sazonalidade (Jan a Dez)"}</CmsText></h2>
          </div>
          <Badge variant="emerald"><CmsText>{"Sazonalidade Oceans14"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-GRADE_PROVENTOS"
          aria-labelledby="tab-GRADE_PROVENTOS"
        >
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.32"><Card glow="emerald" className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Grade Histórica de Proventos por Mês de Pagamento (Jan a Dez)"}</CmsText></span>
                <p className="text-[11px] text-[#94a3b8] mt-0.5"><CmsText>{"Valores nominais por ação distribuídos por competência de desembolso financeiro efetivo."}</CmsText></p>
              </div>
              <Badge variant="emerald"><CmsText>{"Sazonalidade Oceans14"}</CmsText></Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                    <th className="py-3 pl-4"><CmsText>{"Ano"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Jan"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Fev"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Mar"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Abr"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Mai"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Jun"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Jul"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Ago"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Set"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Out"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Nov"}</CmsText></th>
                    <th className="py-3 text-right"><CmsText>{"Dez"}</CmsText></th>
                    <th className="py-3 text-right font-bold text-white"><CmsText>{"Total Anual"}</CmsText></th>
                    <th className="py-3 text-right pr-4 text-[#00d9f5]"><CmsText>{"Yield informado pela fonte"}</CmsText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <CmsText>{(dividendMatrix?.matrix ?? []).map((row) => (
                    <tr key={row.year} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-4 font-bold text-white font-sans"><CmsText>{row.year}</CmsText></td>
                      <CmsText>{row.months.map((m, mIdx) => (
                        <td key={mIdx} className="py-2.5 text-right text-white">
                          <CmsText>{m !== null && m !== undefined ? (
                            <span className="text-[var(--positive)] font-bold"><CmsText>{formatCurrency(m)}</CmsText></span>
                          ) : (
                            <span className="text-[#94a3b8]"><CmsText>{"—"}</CmsText></span>
                          )}</CmsText>
                        </td>
                      ))}</CmsText>
                      <td className="py-2.5 text-right font-bold text-white">
                        <CmsText>{formatCurrency(row.annual_total)}</CmsText>
                      </td>
                      <td className="py-2.5 text-right pr-4 font-bold text-[#00d9f5]">
                        <CmsText>{row.yield_on_cost_pct > 0 ? formatPercent(row.yield_on_cost_pct, false) : "—"}</CmsText>
                      </td>
                    </tr>
                  ))}</CmsText>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 4: Daily Historical Quotes & Chart */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.33"><section id="cotacao-historica" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"4. Cotações Diárias & Histórico de Negociação B3"}</CmsText></h2>
          </div>
          <Badge variant="outline"><CmsText>{"Série Oficial Diária B3"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-COTACAO_HISTORICA"
          aria-labelledby="tab-COTACAO_HISTORICA"
        >
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.StockPriceHistorySection.34"><StockPriceHistorySection ticker={ticker} /></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 5: Fundamentus Fundamentals */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.35"><section id="fundamentos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"5. Indicadores Fundamentalistas & Múltiplos de Mercado (Fundamentus)"}</CmsText></h2>
          </div>
          <Badge variant="amber"><CmsText>{"24 Indicadores Contábeis"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-FUNDAMENTOS"
          aria-labelledby="tab-FUNDAMENTOS"
        >
          <CmsText>{completeDetails ? <StockFundamentalsGrid data={completeDetails} /> :
            <SectionState loading={loading} error={errors.details || (!loading ? "Fundamentos indisponíveis." : null)} onRetry={() => setRevision(n => n + 1)} />}</CmsText>

        </div>
      </section></CmsElement>

      {/* SECTION 6: Checklist */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.36"><section id="checklist" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"6. Checklist Buy & Hold do Investidor"}</CmsText></h2>
          </div>
          <Badge variant="emerald">
            <CmsText>{checklistItems.filter((c) => c.passed).length}</CmsText><CmsText>{" de "}</CmsText><CmsText>{checklistItems.length}</CmsText><CmsText>{" Aprovados"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-CHECKLIST"
          aria-labelledby="tab-CHECKLIST"
        >
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.37"><Card glow="emerald">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="badge-neon badge-neon-emerald mb-2"><CmsText>{"Critérios analíticos"}</CmsText></span>
                <h3 className="text-xl font-bold text-white tracking-tight"><CmsText>{"Critérios Rigorosos de Elegibilidade Patrimonial"}</CmsText></h3>
              </div>
              <Badge variant="emerald">
                <CmsText>{checklistItems.filter((c) => c.passed).length}</CmsText><CmsText>{" de "}</CmsText><CmsText>{checklistItems.length}</CmsText><CmsText>{" Aprovados"}</CmsText></Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CmsText>{checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-white">
                        <CmsText>{item.title}</CmsText>
                      </span>
                      <Badge variant={item.passed ? "emerald" : "crimson"} dot>
                        <CmsText>{item.passed ? "Aprovado" : "Reprovado"}</CmsText>
                      </Badge>
                    </div>
                    <p className="text-xs text-[#94a3b8] mb-3 leading-relaxed">
                      <CmsText>{item.explanation}</CmsText>
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs font-mono">
                    <span className="text-[#94a3b8]"><CmsText>{"Meta: "}</CmsText><span className="text-white"><CmsText>{item.targetValue}</CmsText></span>
                    </span>
                    <span className="text-[var(--positive)] font-bold"><CmsText>{"Apurado: "}</CmsText><CmsText>{item.metricValue}</CmsText>
                    </span>
                  </div>
                </div>
              ))}</CmsText>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 7: DRE */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.38"><section id="dre" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"7. Demonstração do Resultado do Exercício (DRE 5 Anos)"}</CmsText></h2>
          </div>
          <Badge variant="cyan"><CmsText>{"Fonte documental não verificada"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-DRE"
          aria-labelledby="tab-DRE"
        >
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.39"><Card glow="cyan">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="badge-neon badge-neon-cyan mb-2"><CmsText>{"Demonstração do Resultado do Exercício"}</CmsText></span>
                <h3 className="text-xl font-bold text-white tracking-tight"><CmsText>{"Evolução Contábil Consolidada (Últimos 5 Exercícios)"}</CmsText></h3>
              </div>
              <Badge variant="cyan"><CmsText>{"Fonte documental não verificada"}</CmsText></Badge>
            </div>

            <CmsText>{dreChartData.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2"><CmsText>{"Receita Líquida vs. Lucro Líquido (R$ Bilhões)"}</CmsText></div>
                <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.BarChart.40"><BarChart
                  data={dreChartData.map((d) => ({
                    label: d.label,
                    value: d.value / 1_000_000_000,
                    secondaryValue: (d.secondaryValue ?? 0) / 1_000_000_000,
                  }))}
                  height={160}
                /></CmsElement>
              </div>
            )}</CmsText>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2"><CmsText>{"Rubrica Contábil"}</CmsText></th>
                    <CmsText>{dreEntries.map((entry) => (
                      <th key={entry.year} className="pb-3 text-right">
                        <CmsText>{entry.year}</CmsText>
                      </th>
                    ))}</CmsText>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <tr>
                    <td className="py-2.5 pl-2 text-white font-medium"><CmsText>{"Receita Líquida"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-white">
                        <CmsText>{formatCurrency(e.netRevenue, true)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-[#94a3b8]"><CmsText>{"Custos (CPV)"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[var(--negative)]">
                        <CmsText>{formatCurrency(e.cogs, true)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-white font-medium"><CmsText>{"Lucro Bruto"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[#00d9f5]">
                        <CmsText>{formatCurrency(e.grossProfit, true)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-white font-semibold"><CmsText>{"EBITDA"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[var(--positive)] font-bold">
                        <CmsText>{formatCurrency(e.ebitda, true)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-[#94a3b8]"><CmsText>{"Resultado Financeiro"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[#94a3b8]">
                        <CmsText>{formatCurrency(e.financialResult, true)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                  <tr className="font-bold text-white bg-white/[0.02]">
                    <td className="py-3 pl-2 text-[var(--positive)]"><CmsText>{"Lucro Líquido Consolidado"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-3 text-right text-[var(--positive)]">
                        <CmsText>{formatCurrency(e.netIncome, true)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-[#94a3b8]"><CmsText>{"Margem Líquida"}</CmsText></td>
                    <CmsText>{dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-white font-medium">
                        <CmsText>{formatPercent(e.netMarginPct, false)}</CmsText>
                      </td>
                    ))}</CmsText>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 8: Proventos */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.41"><section id="proventos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"8. Histórico Detalhado de Proventos, Dividendos & JCP"}</CmsText></h2>
          </div>
          <Badge variant="emerald"><CmsText>{dividendEntries.length}</CmsText><CmsText>{" Eventos Corporativos"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-PROVENTOS"
          aria-labelledby="tab-PROVENTOS"
        >
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.42"><Card glow="emerald">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="badge-neon badge-neon-emerald mb-2"><CmsText>{"Remuneração aos Acionistas"}</CmsText></span>
                <h3 className="text-xl font-bold text-white tracking-tight"><CmsText>{"Histórico de Dividendos & JCP"}</CmsText></h3>
              </div>
              <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.button.43"><button
                onClick={() => {
                  window.open(`/api/v1/stocks/${ticker}/dividends/export`, "_blank");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
              ><CmsText>{"📥 Exportar Histórico CSV"}</CmsText></button></CmsElement>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2"><CmsText>{"Tipo"}</CmsText></th>
                    <th className="pb-3"><CmsText>{"Mês Ref."}</CmsText></th>
                    <th className="pb-3"><CmsText>{"Data-Com"}</CmsText></th>
                    <th className="pb-3"><CmsText>{"Pagamento"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Valor por Ação"}</CmsText></th>
                    <th className="pb-3 text-right pr-2"><CmsText>{"Yield informado pela fonte"}</CmsText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <CmsText>{dividendEntries.map((div) => (
                    <tr key={div.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 pl-2">
                        <Badge variant={div.type === "DIVIDENDO" ? "emerald" : "cyan"}>
                          <CmsText>{div.type}</CmsText>
                        </Badge>
                      </td>
                      <td className="py-3 text-white"><CmsText>{div.referenceMonth}</CmsText></td>
                      <td className="py-3 text-[#94a3b8]"><CmsText>{div.dateCom}</CmsText></td>
                      <td className="py-3 text-[#94a3b8]"><CmsText>{div.paymentDate}</CmsText></td>
                      <td className="py-3 text-right font-bold text-white">
                        <CmsText>{formatCurrency(div.valuePerShare, false, 4)}</CmsText>
                      </td>
                      <td className="py-3 text-right pr-2 font-bold text-[var(--positive)]">
                        <CmsText>{formatPercent(div.yieldOnCostPct, false)}</CmsText>
                      </td>
                    </tr>
                  ))}</CmsText>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>

      {/* SECTION 9: Technical Analysis */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.44"><section id="tecnica" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"9. Análise Técnica, Médias Móveis, Suportes & Pivôs"}</CmsText></h2>
          </div>
          <Badge variant="cyan"><CmsText>{"Timeframe Diário"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-TECNICA"
          aria-labelledby="tab-TECNICA"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-6">
            <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.45"><Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Suportes e Resistências (Pivôs)"}</CmsText></h3>
                <Badge variant="cyan"><CmsText>{"Timeframe Diário"}</CmsText></Badge>
              </div>

              <div className="flex flex-col gap-2.5 mono-nums text-xs">
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--negative)]">
                  <span><CmsText>{"Resistência R2"}</CmsText></span>
                  <span className="font-bold"><CmsText>{formatCurrency(technical?.resistance2 ?? Number.NaN)}</CmsText></span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--negative)]">
                  <span><CmsText>{"Resistência R1"}</CmsText></span>
                  <span className="font-bold"><CmsText>{formatCurrency(technical?.resistance1 ?? Number.NaN)}</CmsText></span>
                </div>
                <div className="flex justify-between p-2.5 rounded bg-[rgba(0,217,245,0.08)] border border-[rgba(0,217,245,0.3)] text-white">
                  <span className="font-bold"><CmsText>{"Ponto de Pivô Central (PP)"}</CmsText></span>
                  <span className="font-bold text-[#00d9f5]"><CmsText>{formatCurrency(technical?.pivotPoint ?? Number.NaN)}</CmsText></span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--positive)]">
                  <span><CmsText>{"Suporte S1"}</CmsText></span>
                  <span className="font-bold"><CmsText>{formatCurrency(technical?.support1 ?? Number.NaN)}</CmsText></span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--positive)]">
                  <span><CmsText>{"Suporte S2"}</CmsText></span>
                  <span className="font-bold"><CmsText>{formatCurrency(technical?.support2 ?? Number.NaN)}</CmsText></span>
                </div>
              </div>
            </Card></CmsElement>
          </div>

          <div className="lg:col-span-6">
            <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.46"><Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Matriz de Indicadores Técnicos"}</CmsText></h3>
                <Badge variant="emerald" dot>
                  <CmsText>{technical?.summarySignal ?? "Indisponível"}</CmsText>
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded bg-[rgba(0,245,160,0.08)] border border-[rgba(0,245,160,0.2)]">
                  <span className="text-[10px] text-[var(--positive)] uppercase font-bold"><CmsText>{"Compra"}</CmsText></span>
                  <div className="text-lg font-black text-[var(--positive)] font-mono">
                    <CmsText>{technical?.buySignalsCount ?? "—"}</CmsText>
                  </div>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-[#94a3b8] uppercase font-bold"><CmsText>{"Neutro"}</CmsText></span>
                  <div className="text-lg font-black text-white font-mono">
                    <CmsText>{technical?.neutralSignalsCount ?? "—"}</CmsText>
                  </div>
                </div>
                <div className="p-2 rounded bg-[rgba(255,59,105,0.08)] border border-[rgba(255,59,105,0.2)]">
                  <span className="text-[10px] text-[var(--negative)] uppercase font-bold"><CmsText>{"Venda"}</CmsText></span>
                  <div className="text-lg font-black text-[var(--negative)] font-mono">
                    <CmsText>{technical?.sellSignalsCount ?? "—"}</CmsText>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"IFR / RSI (14 períodos):"}</CmsText></span>
                  <span className="font-mono text-white font-bold"><CmsText>{technical?.rsi14 ?? "—"}</CmsText></span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]"><CmsText>{"MACD (12, 26, 9):"}</CmsText></span>
                  <span className="font-mono text-[var(--positive)] font-bold"><CmsText>{technical?.macd ?? "Indisponível"}</CmsText></span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#94a3b8]"><CmsText>{"Estocástico Lento:"}</CmsText></span>
                  <span className="font-mono text-white font-bold"><CmsText>{technical?.stochastic ?? "—"}</CmsText></span>
                </div>
              </div>
            </Card></CmsElement>
          </div>
        </div>
      </section></CmsElement>

      {/* SECTION 10: AI Committee */}
      <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.section.47"><section id="ia" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"10. Parecer do Comitê de Inteligência Artificial & Matriz SWOT"}</CmsText></h2>
          </div>
          <Badge variant="violet"><CmsText>{"Confiança: "}</CmsText><CmsText>{aiVerdict?.confidenceScore ?? "—"}</CmsText><CmsText>{"%"}</CmsText></Badge>
        </div>

        <div
          role="region"
          id="panel-IA"
          aria-labelledby="tab-IA"
        >
          <CmsElement feature="ui.app/-frontend-/acoes/-ticker-/AcaoDetailClient.Card.48"><Card glow="violet">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#a855f7] animate-pulse" />
                <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Parecer do Comitê de Inteligência Artificial"}</CmsText></h3>
              </div>
              <Badge variant="violet"><CmsText>{"Confiança: "}</CmsText><CmsText>{aiVerdict?.confidenceScore ?? "—"}</CmsText><CmsText>{"%"}</CmsText></Badge>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
              <p className="text-xs text-[#f0f4f8] leading-relaxed">
                <CmsText>{aiVerdict?.executiveSummary ?? "Análise indisponível. Não há parecer validado para este instrumento."}</CmsText>
              </p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3"><CmsText>{"Matriz SWOT Sintetizada"}</CmsText></h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-bold text-[var(--positive)] flex items-center gap-1.5 mb-2">
                  <span><CmsText>{"✓"}</CmsText></span><CmsText>{" Forças (Strengths)"}</CmsText></span>
                <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                  <CmsText>{(aiVerdict?.swot?.strengths ?? []).map((s, i) => (
                    <li key={i}><CmsText>{s}</CmsText></li>
                  ))}</CmsText>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-bold text-[var(--negative)] flex items-center gap-1.5 mb-2">
                  <span><CmsText>{"⚠"}</CmsText></span><CmsText>{" Fraquezas (Weaknesses)"}</CmsText></span>
                <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                  <CmsText>{(aiVerdict?.swot?.weaknesses ?? []).map((w, i) => (
                    <li key={i}><CmsText>{w}</CmsText></li>
                  ))}</CmsText>
                </ul>
              </div>
            </div>
          </Card></CmsElement>
        </div>
      </section></CmsElement>
    </div>
  );
}
