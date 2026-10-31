"use client";

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
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/acoes" className="hover:text-white transition-colors">
          Ações
        </Link>
        <span>/</span>
        <span className="text-white font-mono font-bold">{ticker}</span>
      </div>

      {/* Asset Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0c1017] border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,245,160,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#131926] border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-xl">
            {ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {ticker}
              </h2>
              <Badge variant="emerald">{stockInfo?.badge ?? "Listada B3"}</Badge>
            </div>
            <div className="text-sm text-[#94a3b8] font-medium mt-0.5">
              {stockInfo?.name ?? valuationData?.name ?? ticker}
            </div>
            <div className="text-xs text-[#94a3b8] mt-1">
              {stockInfo?.sector ?? "Mercado de Capitais"} • {stockInfo?.subsector ?? "Empresas Abertas"}
            </div>
          </div>
        </div>

        <div className="flex items-end md:items-center gap-6 z-10 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
          <div className="text-right">
            <div className="text-xs text-[#94a3b8] uppercase font-semibold">
              Último preço disponível
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {formatCurrency(stockPrice)}
            </div>
            <div
              className={`text-xs font-mono font-bold mt-0.5 ${
                isPositive ? "text-[var(--positive)]" : "text-[var(--negative)]"
              }`}
            >
              {formatPercent(stockInfo?.change24h ?? Number.NaN)} Hoje • 12M: {formatPercent(stockInfo?.change12m ?? Number.NaN)}
            </div>
          </div>
        </div>
      </div>

      <DataStatus mode={loading ? "loading" : errors.details && completeDetails ? "stale" : completeDetails ? "periodic" : "missing"} asOf={completeDetails?.details.data_cotacao} />
      {Object.entries(errors).filter(([key]) => key !== "details").map(([key, error]) => <SectionState key={key} error={error} onRetry={() => setRevision(n => n + 1)} />)}
      <p className="text-xs text-[#94a3b8]">Valuation é uma estimativa baseada nos parâmetros abaixo, não uma recomendação. DCF usa aproximação de 80% do lucro por ação, não fluxo de caixa reportado. Séries contábeis distintas não foram reconciliadas.</p>
      {/* KPI Top Bar - Executive Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="text-center p-3 border-emerald-500/20 bg-emerald-500/[0.02]">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            Dividend Yield (12M)
          </span>
          <div className="text-xl font-black font-mono text-[var(--positive)] mt-1">
            {formatPercent(stockInfo?.dividendYield ?? (stockPrice > 0 ? (dpaInput / stockPrice) * 100 : Number.NaN), false)}
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono">
            DPA implícito: {formatCurrency(valuationData ? dpaInput : Number.NaN)}
          </span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            P/L (Preço / Lucro)
          </span>
          <div className="text-xl font-black font-mono text-white mt-1">
            {formatMultiple(stockInfo?.pl)}
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono">
            LPA: {formatCurrency(valuationData ? lpaInput : Number.NaN)}
          </span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            P/VP (Preço / Valor Patr.)
          </span>
          <div className="text-xl font-black font-mono text-white mt-1">
            {formatMultiple(stockInfo?.pvp)}
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono">
            VPA: {formatCurrency(valuationData ? vpaInput : Number.NaN)}
          </span>
        </Card>

        <Card className="text-center p-3 border-emerald-500/20">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            Justo Benjamin Graham
          </span>
          <div className={`text-xl font-black font-mono mt-1 ${dynamicGrahamUpside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
            {formatCurrency(dynamicGraham)}
          </div>
          <span className={`text-[10px] font-mono font-bold ${dynamicGrahamUpside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
            {dynamicGrahamUpside >= 0 ? "▲ Upside" : "▼ Ágio"} {formatPercent(dynamicGrahamUpside)}
          </span>
        </Card>

        <Card className="text-center p-3 border-cyan-500/20">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            Teto Décio Bazin
          </span>
          <div className={`text-xl font-black font-mono mt-1 ${dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"}`}>
            {formatCurrency(dynamicBazin)}
          </div>
          <span className={`text-[10px] font-mono font-bold ${dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"}`}>
            Margem: {formatPercent(dynamicBazinMargin)}
          </span>
        </Card>

        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
            Checklist Buy & Hold
          </span>
          <div className="text-xl font-black font-mono text-[var(--positive)] mt-1">
            {checklistItems.filter((c) => c.passed).length} / {checklistItems.length}
          </div>
          <span className="text-[10px] text-[#94a3b8] font-mono">
            {checklistItems.filter((c) => c.passed).length === (checklistItems.length) ? "Critérios calculados" : "Critérios disponíveis"}
          </span>
        </Card>
      </div>

      {/* Zero Clicks Sticky Anchor Navigation */}
      <nav
        aria-label="Navegação rápida da ação"
        className="sticky top-[var(--asset-nav-top,5.5rem)] z-40 bg-[#0c1017]/95 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none"
      >
        <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider px-3 hidden md:inline">
          Ir para:
        </span>
        {navItems.map((item) => (
          <button
            key={item.id}
            id={item.testId}
            onClick={() => scrollToSection(item.id)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* CONTINUOUS VERTICAL CONTENT FLOW (NO TABS, ZERO CLICKS) */}

      {/* SECTION 1: Modelos de Valuation */}
      <section id="valuation" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              1. Modelos de Valuation & Preço Justo (Graham, Bazin, Gordon & DCF)
            </h2>
          </div>
          <Badge variant="emerald">Modelos Quantitativos</Badge>
        </div>

        <div
          role="region"
          id="panel-VALUATION"
          aria-labelledby="tab-VALUATION"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Benjamin Graham Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-emerald mb-2">
                    Fórmula de Benjamin Graham
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Preço Justo Intrínseco
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Baseado na equação clássica: √(22,5 × LPA × VPA)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[var(--positive)]">
                    {formatCurrency(dynamicGraham)}
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      dynamicGrahamUpside >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                    }`}
                  >
                    Upside: {formatPercent(dynamicGrahamUpside)}
                  </div>
                  {dynamicGrahamMargin > 0 && (
                    <div className="text-[10px] font-mono text-[#94a3b8]">
                      Margem Segurança: {formatPercent(dynamicGrahamMargin)}
                    </div>
                  )}
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5 my-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Lucro Por Ação (LPA):</span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(valuationData ? lpaInput : Number.NaN)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.1"
                    value={lpaInput}
                    onChange={(e) => setLpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Valor Patrimonial Por Ação (VPA):</span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(valuationData ? vpaInput : Number.NaN)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10.0"
                    max="60.0"
                    step="0.5"
                    value={vpaInput}
                    onChange={(e) => setVpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-xs text-[#94a3b8] leading-relaxed mt-2">
                O modelo de Graham estabelece que o múltiplo P/L × P/VP não deve ultrapassar 22,5 em empresas com estabilidade de lucros e margem de segurança conservadora.
              </div>
            </Card>
          </div>

          {/* Décio Bazin Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-cyan mb-2">
                    Método Décio Bazin
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Preço Teto de Compra
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Preço Teto = DPA implícito ÷ Yield Mínimo Desejado (6%)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00d9f5]">
                    {formatCurrency(dynamicBazin)}
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"
                    }`}
                  >
                    Upside: {formatPercent(dynamicBazinUpside)}
                  </div>
                  {dynamicBazinMargin > 0 && (
                    <div className="text-[10px] font-mono text-[#94a3b8]">
                      Desconto s/ Teto: {formatPercent(dynamicBazinMargin)}
                    </div>
                  )}
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5 my-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Dividendo Médio Por Ação (DPA):</span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(valuationData ? dpaInput : Number.NaN)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={dpaInput}
                    onChange={(e) => setDpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Taxa de Yield Mínimo Alvo:</span>
                    <span className="font-mono text-white font-bold">
                      {formatNumber(bazinYieldTarget * 100, 1)}% a.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.04"
                    max="0.12"
                    step="0.005"
                    value={bazinYieldTarget}
                    onChange={(e) => setBazinYieldTarget(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-xs text-[#94a3b8] leading-relaxed mt-2">
                Décio Bazin preconizava pagar no máximo o valor que garante 6% de dividendo anual líquido, desde que a empresa apresente endividamento saudável e boa liquidez.
              </div>
            </Card>
          </div>

          {/* Gordon Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="violet">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-violet mb-2">
                    Modelo de Gordon (DDM)
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Crescimento Perpétuo de Dividendos
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#a855f7]">
                    {formatCurrency(dynamicGordon)}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#a855f7]">
                    Margem: {formatPercent(dynamicGordonUpside)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                    Crescimento (g)
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.08"
                    step="0.005"
                    value={gordonGrowth}
                    onChange={(e) => setGordonGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {formatNumber(gordonGrowth * 100, 1)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                    Custo de Capital (Ke)
                  </label>
                  <input
                    type="range"
                    min="0.09"
                    max="0.18"
                    step="0.005"
                    value={gordonDiscount}
                    onChange={(e) => setGordonDiscount(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {formatNumber(gordonDiscount * 100, 1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* DCF Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-cyan mb-2">
                    Fluxo de Caixa Descontado (DCF)
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Valor Intrínseco 5 Anos + Perpetuidade
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00d9f5]">
                    {formatCurrency(dynamicDcf)}
                  </div>
                  <div className={`text-xs font-mono font-bold ${dynamicDcfUpside >= 0 ? "text-[#00d9f5]" : "text-[var(--negative)]"}`}>
                    Upside: {formatPercent(dynamicDcfUpside)}
                  </div>
                  {dynamicDcfMargin > 0 && (
                    <div className="text-[10px] font-mono text-[#94a3b8]">
                      Margem Segurança: {formatPercent(dynamicDcfMargin)}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                    Crescimento FCF
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.12"
                    step="0.01"
                    value={dcfGrowth5y}
                    onChange={(e) => setDcfGrowth5y(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {formatNumber(dcfGrowth5y * 100, 0)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                    WACC
                  </label>
                  <input
                    type="range"
                    min="0.08"
                    max="0.16"
                    step="0.005"
                    value={dcfWacc}
                    onChange={(e) => setDcfWacc(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {formatNumber(dcfWacc * 100, 1)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] uppercase block mb-1">
                    Crescimento Perpétuo
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.05"
                    step="0.005"
                    value={dcfTerminalGrowth}
                    onChange={(e) => setDcfTerminalGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {formatNumber(dcfTerminalGrowth * 100, 1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 2: Oceans14 10-Year Statement Matrix */}
      <section id="matriz-10a" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              2. Matriz Contábil Padronizada Oceans14 (Série Histórica 10 Anos)
            </h2>
          </div>
          <Badge variant="cyan">Demonstrações disponíveis</Badge>
        </div>

        <div
          role="region"
          id="panel-MATRIZ_10A"
          aria-labelledby="tab-MATRIZ_10A"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#131926]/40 border border-white/5">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Matriz Contábil Padronizada Oceans14 (10 Anos)
              </span>
              <p className="text-[11px] text-[#94a3b8] mt-0.5">
                Série informada pela fonte. Confira período, unidade e metodologia antes de comparar.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMatrixPeriod("ANUAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  matrixPeriod === "ANUAL"
                    ? "bg-[#00f5a0] text-black shadow-[0_0_15px_rgba(0,245,160,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              >
                Anual Consolidado
              </button>
              <button
                onClick={() => setMatrixPeriod("TRIMESTRAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  matrixPeriod === "TRIMESTRAL"
                    ? "bg-[#00f5a0] text-black shadow-[0_0_15px_rgba(0,245,160,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              >
                Trimestral
              </button>
            </div>
          </div>

          {/* DRE Matrix */}
          <Card glow="none" className="p-0 overflow-hidden">
            <div className="p-3.5 bg-[#131926]/70 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                DRE — Demonstração do Resultado do Exercício (R$ Milhões)
              </span>
              <Badge variant="cyan">Regime de Competência</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/90 font-sans">
                    <th className="py-2.5 pl-4 min-w-[240px] sticky left-0 bg-[#131926] z-10">Conta Contábil</th>
                    {(financialMatrix?.years ?? []).map((y) => (
                      <th key={y} className="py-2.5 px-3 text-right min-w-[100px]">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(financialMatrix?.dre ?? []).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] ${row.is_total ? "font-bold text-white bg-white/[0.01]" : "text-[#94a3b8]"}`}>
                      <td className={`py-2 pl-4 sticky left-0 bg-[#0a0e17] z-10 font-sans ${row.indentation_level ? "pl-8 text-[#94a3b8]" : ""}`}>
                        {row.account_name}
                      </td>
                      {(financialMatrix?.years ?? []).map((y) => {
                        const val = row.values_by_year[y];
                        const isNeg = val !== null && val !== undefined && val < 0;
                        return (
                          <td key={y} className={`py-2 px-3 text-right ${isNeg ? "text-[var(--negative)]" : ""}`}>
                            {val !== null && val !== undefined ? (val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Balance Sheet Matrix */}
          <Card glow="none" className="p-0 overflow-hidden">
            <div className="p-3.5 bg-[#131926]/70 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Balanço Patrimonial — Ativo, Passivo & Patrimônio Líquido (R$ Milhões)
              </span>
              <Badge variant="violet">Estrutura de Capital</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/90 font-sans">
                    <th className="py-2.5 pl-4 min-w-[240px] sticky left-0 bg-[#131926] z-10">Conta Patrimonial</th>
                    {(financialMatrix?.years ?? []).map((y) => (
                      <th key={y} className="py-2.5 px-3 text-right min-w-[100px]">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(financialMatrix?.balance_sheet ?? []).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] ${row.is_total ? "font-bold text-white bg-white/[0.01]" : "text-[#94a3b8]"}`}>
                      <td className={`py-2 pl-4 sticky left-0 bg-[#0a0e17] z-10 font-sans ${row.indentation_level ? "pl-8 text-[#94a3b8]" : ""}`}>
                        {row.account_name}
                      </td>
                      {(financialMatrix?.years ?? []).map((y) => {
                        const val = row.values_by_year[y];
                        return (
                          <td key={y} className="py-2 px-3 text-right">
                            {val !== null && val !== undefined ? (val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Cash Flow Matrix */}
          <Card glow="none" className="p-0 overflow-hidden">
            <div className="p-3.5 bg-[#131926]/70 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                DFC — Demonstração do Fluxo de Caixa & Caixa Livre (R$ Milhões)
              </span>
              <Badge variant="emerald">Geração de Caixa</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/90 font-sans">
                    <th className="py-2.5 pl-4 min-w-[240px] sticky left-0 bg-[#131926] z-10">Fluxo de Caixa</th>
                    {(financialMatrix?.years ?? []).map((y) => (
                      <th key={y} className="py-2.5 px-3 text-right min-w-[100px]">{y}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(financialMatrix?.cash_flow ?? []).map((row, idx) => (
                    <tr key={idx} className={`hover:bg-white/[0.02] ${row.is_total ? "font-bold text-[var(--positive)]" : "text-[#94a3b8]"}`}>
                      <td className="py-2 pl-4 sticky left-0 bg-[#0a0e17] z-10 font-sans">
                        {row.account_name}
                      </td>
                      {(financialMatrix?.years ?? []).map((y) => {
                        const val = row.values_by_year[y];
                        const isNeg = val !== null && val !== undefined && val < 0;
                        return (
                          <td key={y} className={`py-2 px-3 text-right ${isNeg ? "text-[var(--negative)]" : ""}`}>
                            {val !== null && val !== undefined ? (val / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 3: Monthly Dividend Matrix (Jan-Dez) */}
      <section id="grade-proventos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Grade Mensal de Proventos & Sazonalidade (Jan a Dez)
            </h2>
          </div>
          <Badge variant="emerald">Sazonalidade Oceans14</Badge>
        </div>

        <div
          role="region"
          id="panel-GRADE_PROVENTOS"
          aria-labelledby="tab-GRADE_PROVENTOS"
        >
          <Card glow="emerald" className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Grade Histórica de Proventos por Mês de Pagamento (Jan a Dez)
                </span>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Valores nominais por ação distribuídos por competência de desembolso financeiro efetivo.
                </p>
              </div>
              <Badge variant="emerald">Sazonalidade Oceans14</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                    <th className="py-3 pl-4">Ano</th>
                    <th className="py-3 text-right">Jan</th>
                    <th className="py-3 text-right">Fev</th>
                    <th className="py-3 text-right">Mar</th>
                    <th className="py-3 text-right">Abr</th>
                    <th className="py-3 text-right">Mai</th>
                    <th className="py-3 text-right">Jun</th>
                    <th className="py-3 text-right">Jul</th>
                    <th className="py-3 text-right">Ago</th>
                    <th className="py-3 text-right">Set</th>
                    <th className="py-3 text-right">Out</th>
                    <th className="py-3 text-right">Nov</th>
                    <th className="py-3 text-right">Dez</th>
                    <th className="py-3 text-right font-bold text-white">Total Anual</th>
                    <th className="py-3 text-right pr-4 text-[#00d9f5]">Yield informado pela fonte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(dividendMatrix?.matrix ?? []).map((row) => (
                    <tr key={row.year} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-4 font-bold text-white font-sans">{row.year}</td>
                      {row.months.map((m, mIdx) => (
                        <td key={mIdx} className="py-2.5 text-right text-white">
                          {m !== null && m !== undefined ? (
                            <span className="text-[var(--positive)] font-bold">{formatCurrency(m)}</span>
                          ) : (
                            <span className="text-[#94a3b8]">—</span>
                          )}
                        </td>
                      ))}
                      <td className="py-2.5 text-right font-bold text-white">
                        {formatCurrency(row.annual_total)}
                      </td>
                      <td className="py-2.5 text-right pr-4 font-bold text-[#00d9f5]">
                        {row.yield_on_cost_pct > 0 ? formatPercent(row.yield_on_cost_pct, false) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 4: Daily Historical Quotes & Chart */}
      <section id="cotacao-historica" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              4. Cotações Diárias & Histórico de Negociação B3
            </h2>
          </div>
          <Badge variant="outline">Série Oficial Diária B3</Badge>
        </div>

        <div
          role="region"
          id="panel-COTACAO_HISTORICA"
          aria-labelledby="tab-COTACAO_HISTORICA"
        >
          <StockPriceHistorySection ticker={ticker} />
        </div>
      </section>

      {/* SECTION 5: Fundamentus Fundamentals */}
      <section id="fundamentos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Indicadores Fundamentalistas & Múltiplos de Mercado (Fundamentus)
            </h2>
          </div>
          <Badge variant="amber">24 Indicadores Contábeis</Badge>
        </div>

        <div
          role="region"
          id="panel-FUNDAMENTOS"
          aria-labelledby="tab-FUNDAMENTOS"
        >
          {completeDetails ? <StockFundamentalsGrid data={completeDetails} /> :
            <SectionState loading={loading} error={errors.details || (!loading ? "Fundamentos indisponíveis." : null)} onRetry={() => setRevision(n => n + 1)} />}

        </div>
      </section>

      {/* SECTION 6: Checklist */}
      <section id="checklist" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              6. Checklist Buy & Hold do Investidor
            </h2>
          </div>
          <Badge variant="emerald">
            {checklistItems.filter((c) => c.passed).length} de {checklistItems.length} Aprovados
          </Badge>
        </div>

        <div
          role="region"
          id="panel-CHECKLIST"
          aria-labelledby="tab-CHECKLIST"
        >
          <Card glow="emerald">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="badge-neon badge-neon-emerald mb-2">
                  Critérios analíticos
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Critérios Rigorosos de Elegibilidade Patrimonial
                </h3>
              </div>
              <Badge variant="emerald">
                {checklistItems.filter((c) => c.passed).length} de {checklistItems.length} Aprovados
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#131926] border border-white/5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-white">
                        {item.title}
                      </span>
                      <Badge variant={item.passed ? "emerald" : "crimson"} dot>
                        {item.passed ? "Aprovado" : "Reprovado"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#94a3b8] mb-3 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs font-mono">
                    <span className="text-[#94a3b8]">
                      Meta: <span className="text-white">{item.targetValue}</span>
                    </span>
                    <span className="text-[var(--positive)] font-bold">
                      Apurado: {item.metricValue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 7: DRE */}
      <section id="dre" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              7. Demonstração do Resultado do Exercício (DRE 5 Anos)
            </h2>
          </div>
          <Badge variant="cyan">Fonte documental não verificada</Badge>
        </div>

        <div
          role="region"
          id="panel-DRE"
          aria-labelledby="tab-DRE"
        >
          <Card glow="cyan">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="badge-neon badge-neon-cyan mb-2">
                  Demonstração do Resultado do Exercício
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Evolução Contábil Consolidada (Últimos 5 Exercícios)
                </h3>
              </div>
              <Badge variant="cyan">Fonte documental não verificada</Badge>
            </div>

            {dreChartData.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Receita Líquida vs. Lucro Líquido (R$ Bilhões)
                </div>
                <BarChart
                  data={dreChartData.map((d) => ({
                    label: d.label,
                    value: d.value / 1_000_000_000,
                    secondaryValue: (d.secondaryValue ?? 0) / 1_000_000_000,
                  }))}
                  height={160}
                />
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Rubrica Contábil</th>
                    {dreEntries.map((entry) => (
                      <th key={entry.year} className="pb-3 text-right">
                        {entry.year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <tr>
                    <td className="py-2.5 pl-2 text-white font-medium">Receita Líquida</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-white">
                        {formatCurrency(e.netRevenue, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-[#94a3b8]">Custos (CPV)</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[var(--negative)]">
                        {formatCurrency(e.cogs, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-white font-medium">Lucro Bruto</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[#00d9f5]">
                        {formatCurrency(e.grossProfit, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-white font-semibold">EBITDA</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[var(--positive)] font-bold">
                        {formatCurrency(e.ebitda, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-[#94a3b8]">Resultado Financeiro</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-[#94a3b8]">
                        {formatCurrency(e.financialResult, true)}
                      </td>
                    ))}
                  </tr>
                  <tr className="font-bold text-white bg-white/[0.02]">
                    <td className="py-3 pl-2 text-[var(--positive)]">Lucro Líquido Consolidado</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-3 text-right text-[var(--positive)]">
                        {formatCurrency(e.netIncome, true)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 pl-2 text-[#94a3b8]">Margem Líquida</td>
                    {dreEntries.map((e) => (
                      <td key={e.year} className="py-2.5 text-right text-white font-medium">
                        {formatPercent(e.netMarginPct, false)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 8: Proventos */}
      <section id="proventos" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              8. Histórico Detalhado de Proventos, Dividendos & JCP
            </h2>
          </div>
          <Badge variant="emerald">{dividendEntries.length} Eventos Corporativos</Badge>
        </div>

        <div
          role="region"
          id="panel-PROVENTOS"
          aria-labelledby="tab-PROVENTOS"
        >
          <Card glow="emerald">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="badge-neon badge-neon-emerald mb-2">
                  Remuneração aos Acionistas
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Histórico de Dividendos & JCP
                </h3>
              </div>
              <button
                onClick={() => {
                  window.open(`/api/v1/stocks/${ticker}/dividends/export`, "_blank");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer self-start sm:self-auto"
              >
                📥 Exportar Histórico CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Tipo</th>
                    <th className="pb-3">Mês Ref.</th>
                    <th className="pb-3">Data-Com</th>
                    <th className="pb-3">Pagamento</th>
                    <th className="pb-3 text-right">Valor por Ação</th>
                    <th className="pb-3 text-right pr-2">Yield informado pela fonte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  {dividendEntries.map((div) => (
                    <tr key={div.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 pl-2">
                        <Badge variant={div.type === "DIVIDENDO" ? "emerald" : "cyan"}>
                          {div.type}
                        </Badge>
                      </td>
                      <td className="py-3 text-white">{div.referenceMonth}</td>
                      <td className="py-3 text-[#94a3b8]">{div.dateCom}</td>
                      <td className="py-3 text-[#94a3b8]">{div.paymentDate}</td>
                      <td className="py-3 text-right font-bold text-white">
                        {formatCurrency(div.valuePerShare, false, 4)}
                      </td>
                      <td className="py-3 text-right pr-2 font-bold text-[var(--positive)]">
                        {formatPercent(div.yieldOnCostPct, false)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      {/* SECTION 9: Technical Analysis */}
      <section id="tecnica" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              9. Análise Técnica, Médias Móveis, Suportes & Pivôs
            </h2>
          </div>
          <Badge variant="cyan">Timeframe Diário</Badge>
        </div>

        <div
          role="region"
          id="panel-TECNICA"
          aria-labelledby="tab-TECNICA"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Suportes e Resistências (Pivôs)
                </h3>
                <Badge variant="cyan">Timeframe Diário</Badge>
              </div>

              <div className="flex flex-col gap-2.5 mono-nums text-xs">
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--negative)]">
                  <span>Resistência R2</span>
                  <span className="font-bold">{formatCurrency(technical?.resistance2 ?? Number.NaN)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--negative)]">
                  <span>Resistência R1</span>
                  <span className="font-bold">{formatCurrency(technical?.resistance1 ?? Number.NaN)}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded bg-[rgba(0,217,245,0.08)] border border-[rgba(0,217,245,0.3)] text-white">
                  <span className="font-bold">Ponto de Pivô Central (PP)</span>
                  <span className="font-bold text-[#00d9f5]">{formatCurrency(technical?.pivotPoint ?? Number.NaN)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--positive)]">
                  <span>Suporte S1</span>
                  <span className="font-bold">{formatCurrency(technical?.support1 ?? Number.NaN)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[var(--positive)]">
                  <span>Suporte S2</span>
                  <span className="font-bold">{formatCurrency(technical?.support2 ?? Number.NaN)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Matriz de Indicadores Técnicos
                </h3>
                <Badge variant="emerald" dot>
                  {technical?.summarySignal ?? "Indisponível"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded bg-[rgba(0,245,160,0.08)] border border-[rgba(0,245,160,0.2)]">
                  <span className="text-[10px] text-[var(--positive)] uppercase font-bold">Compra</span>
                  <div className="text-lg font-black text-[var(--positive)] font-mono">
                    {technical?.buySignalsCount ?? "—"}
                  </div>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-[#94a3b8] uppercase font-bold">Neutro</span>
                  <div className="text-lg font-black text-white font-mono">
                    {technical?.neutralSignalsCount ?? "—"}
                  </div>
                </div>
                <div className="p-2 rounded bg-[rgba(255,59,105,0.08)] border border-[rgba(255,59,105,0.2)]">
                  <span className="text-[10px] text-[var(--negative)] uppercase font-bold">Venda</span>
                  <div className="text-lg font-black text-[var(--negative)] font-mono">
                    {technical?.sellSignalsCount ?? "—"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">IFR / RSI (14 períodos):</span>
                  <span className="font-mono text-white font-bold">{technical?.rsi14 ?? "—"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">MACD (12, 26, 9):</span>
                  <span className="font-mono text-[var(--positive)] font-bold">{technical?.macd ?? "Indisponível"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#94a3b8]">Estocástico Lento:</span>
                  <span className="font-mono text-white font-bold">{technical?.stochastic ?? "—"}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SECTION 10: AI Committee */}
      <section id="ia" className="scroll-mt-24 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              10. Parecer do Comitê de Inteligência Artificial & Matriz SWOT
            </h2>
          </div>
          <Badge variant="violet">
            Confiança: {aiVerdict?.confidenceScore ?? "—"}%
          </Badge>
        </div>

        <div
          role="region"
          id="panel-IA"
          aria-labelledby="tab-IA"
        >
          <Card glow="violet">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#a855f7] animate-pulse" />
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Parecer do Comitê de Inteligência Artificial
                </h3>
              </div>
              <Badge variant="violet">
                Confiança: {aiVerdict?.confidenceScore ?? "—"}%
              </Badge>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
              <p className="text-xs text-[#f0f4f8] leading-relaxed">
                {aiVerdict?.executiveSummary ?? "Análise indisponível. Não há parecer validado para este instrumento."}
              </p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-3">
              Matriz SWOT Sintetizada
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-bold text-[var(--positive)] flex items-center gap-1.5 mb-2">
                  <span>✓</span> Forças (Strengths)
                </span>
                <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                  {(aiVerdict?.swot?.strengths ?? []).map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs font-bold text-[var(--negative)] flex items-center gap-1.5 mb-2">
                  <span>⚠</span> Fraquezas (Weaknesses)
                </span>
                <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                  {(aiVerdict?.swot?.weaknesses ?? []).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
