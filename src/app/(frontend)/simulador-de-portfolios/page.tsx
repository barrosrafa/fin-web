"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect, useRef } from "react";
import { SectionState } from "@/components/shared/SectionState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { simulatePortfolio } from "@/lib/api";
import {
  PortfolioDraft,
  SimulatePortfolioResponse,
  NormalizedSeriesPoint,
} from "@/schemas/financial";
import { RelativePerformanceBase100Chart } from "@/components/etfs/RelativePerformanceBase100Chart";
import { UnderwaterDrawdownChart } from "@/components/etfs/UnderwaterDrawdownChart";

const DEFAULT_PORTFOLIOS: PortfolioDraft[] = [
  {
    name: "Conservador",
    assets: [
      { ticker: "BLFT11", percentage: 0.4 },
      { ticker: "DEBB11", percentage: 0.15 },
      { ticker: "LFIN11", percentage: 0.3 },
      { ticker: "CMDB11", percentage: 0.1 },
      { ticker: "5PRE11", percentage: 0.05 },
    ],
  },
  {
    name: "Moderado",
    assets: [
      { ticker: "BLFT11", percentage: 0.25 },
      { ticker: "DEBB11", percentage: 0.2 },
      { ticker: "LFIN11", percentage: 0.35 },
      { ticker: "CMDB11", percentage: 0.15 },
      { ticker: "5PRE11", percentage: 0.05 },
    ],
  },
  {
    name: "Arrojado",
    assets: [
      { ticker: "DEBB11", percentage: 0.25 },
      { ticker: "LFIN11", percentage: 0.45 },
      { ticker: "CMDB11", percentage: 0.2 },
      { ticker: "5PRE11", percentage: 0.1 },
    ],
  },
];

export default function SimuladorPortfoliosPage() {
  const [startDate, setStartDate] = useState<string>("2024-01-02");
  const [endDate, setEndDate] = useState<string>("2024-10-25");
  const [startingAmount, setStartingAmount] = useState<number>(50000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [rebalancing, setRebalancing] = useState<"NENHUM" | "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL">("TRIMESTRAL");
  const [advisoryFee, setAdvisoryFee] = useState<number>(0.0);
  const [portfolios, setPortfolios] = useState<PortfolioDraft[]>(DEFAULT_PORTFOLIOS);
  const [result, setResult] = useState<SimulatePortfolioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPortfolioIdx, setSelectedPortfolioIdx] = useState<number>(0);

  const request = useRef<AbortController | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const runSimulation = async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await simulatePortfolio({
        startDate,
        endDate,
        startingAmount,
        monthlyContributions: monthlyContribution,
        rebalancingFrequency: rebalancing,
        advisoryFee,
        portfolioList: portfolios,
      }, controller.signal);
      if (!controller.signal.aborted && res) setResult(res);
    } catch {
      if (!controller.signal.aborted) setError("Simulação indisponível com os dados históricos atuais. Nenhuma série fictícia foi gerada.");
    } finally {
      if (request.current === controller) setLoading(false);
    }
  };

  useEffect(() => {
    // Date changes intentionally start a new request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runSimulation();
  }, [startDate, endDate]);

  // Convert portfolio equity curves to normalized Base 100 for RelativePerformanceBase100Chart
  const base100Series: NormalizedSeriesPoint[] = [];
  if (result && result.portfolios.length > 0) {
    const firstPortfolio = result.portfolios[0];
    firstPortfolio.equityCurve.forEach((pt, i) => {
      const dateStr = new Date(pt[0]).toISOString().split("T")[0];
      const values: Record<string, number> = {};
      result.portfolios.forEach((p) => {
        const initialVal = p.equityCurve[0][1] || startingAmount;
        const currentVal = p.equityCurve[i]?.[1] || initialVal;
        values[p.name] = roundDec(100.0 * (currentVal / initialVal));
      });
      if (result.benchmark && result.benchmark.equityCurve[i]) {
        const initialBench = result.benchmark.equityCurve[0][1] || startingAmount;
        const currentBench = result.benchmark.equityCurve[i][1];
        values["CDI"] = roundDec(100.0 * (currentBench / initialBench));
      }
      base100Series.push({ date: dateStr, values });
    });
  }

  function roundDec(num: number) {
    return Math.round(num * 100) / 100;
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald"><CmsText>{"ETFs Brasil Quantitative"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Backtesting & Risco"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Simulador de Portfólios de ETFs"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Monte até 3 carteiras de ETFs, fundos e índices, compare o desempenho histórico real lado a lado com rebalanceamento programável e métricas avançadas de risco (Sharpe, Sortino e Drawdown Máximo)."}</CmsText></p>
      </div>

      {/* Inputs de Configuração */}
      <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.Card.1"><Card glow="cyan">
        {/* Date Range & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#64748b] block mb-1"><CmsText>{"Data Inicial (Backtest Real)"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.input.2"><input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#131926] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f5a0]"
              /></CmsElement>
            </div>
            <span className="text-[#64748b] mt-4"><CmsText>{"até"}</CmsText></span>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#64748b] block mb-1"><CmsText>{"Data Final"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.input.3"><input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#131926] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f5a0]"
              /></CmsElement>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] mr-1"><CmsText>{"Atalhos:"}</CmsText></span>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.button.4"><button
              onClick={() => {
                setStartDate("2024-01-02");
                setEndDate("2024-10-25");
              }}
              className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition-colors"
            ><CmsText>{"2024 Completo"}</CmsText></button></CmsElement>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.button.5"><button
              onClick={() => {
                setStartDate("2023-10-25");
                setEndDate("2024-10-25");
              }}
              className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition-colors"
            ><CmsText>{"12 Meses"}</CmsText></button></CmsElement>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.button.6"><button
              onClick={() => {
                setStartDate("2023-01-02");
                setEndDate("2026-10-25");
              }}
              className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition-colors"
            ><CmsText>{"Histórico Integral"}</CmsText></button></CmsElement>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1"><CmsText>{"Patrimônio Inicial (R$)"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.input.7"><input
              type="number"
              value={startingAmount}
              onChange={(e) => setStartingAmount(Number(e.target.value))}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            /></CmsElement>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1"><CmsText>{"Aporte Mensal (R$)"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.input.8"><input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            /></CmsElement>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1"><CmsText>{"Rebalanceamento Periódico"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.select.9"><select
              value={rebalancing}
              onChange={(e) => setRebalancing(e.target.value as typeof rebalancing)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            >
              <option value="NENHUM"><CmsText>{"Sem Rebalanceamento (Buy & Hold)"}</CmsText></option>
              <option value="MENSAL"><CmsText>{"Mensal"}</CmsText></option>
              <option value="TRIMESTRAL"><CmsText>{"Trimestral (Padrão Teva)"}</CmsText></option>
              <option value="SEMESTRAL"><CmsText>{"Semestral"}</CmsText></option>
              <option value="ANUAL"><CmsText>{"Anual"}</CmsText></option>
            </select></CmsElement>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1"><CmsText>{"Taxa de Consultoria (% a.a.)"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.input.10"><input
              type="number"
              step="0.1"
              value={advisoryFee}
              onChange={(e) => setAdvisoryFee(Number(e.target.value))}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            /></CmsElement>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="cyan"
            onClick={runSimulation}
            disabled={loading}
          >
            <CmsText>{loading ? "Calculando Simulação..." : "Recalcular Portfólios ↻"}</CmsText>
          </Button>
        </div>
      </Card></CmsElement>

      <SectionState loading={loading} error={error} onRetry={runSimulation} />
      <CmsText>{result?.assumptions?.map(assumption => <p key={assumption} className="text-xs text-[#94a3b8]"><CmsText>{"Hipótese da simulação: "}</CmsText><CmsText>{assumption}</CmsText></p>)}</CmsText>
      {/* Resultados de Métricas Comparativas */}
      <CmsText>{result && result.portfolios.length > 0 && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <CmsText>{result.portfolios.map((p, i) => (
              <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.MetricCard.11" key={p.name}><MetricCard
                key={p.name}
                title={`Portfólio ${p.name}`}
                value={formatCurrency(p.metrics.finalAmount)}
                subtitle={`Retorno: +${p.metrics.totalReturnPct.toFixed(1)}% | CAGR: ${p.metrics.cagrPct.toFixed(1)}% a.a.`}
                glow={i === 0 ? "emerald" : i === 1 ? "cyan" : "violet"}
              /></CmsElement>
            ))}</CmsText>
          </div>

          {/* Gráfico de Evolução de Retorno Relativo Base 100 */}
          <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.Card.12"><Card glow="emerald">
            <h3 className="text-base font-bold text-white tracking-tight mb-4"><CmsText>{"Evolução Patrimonial Normalizada (Base 100 vs Benchmark CDI)"}</CmsText></h3>
            <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.RelativePerformanceBase100Chart.13"><RelativePerformanceBase100Chart
              series={base100Series}
              tickers={result.portfolios.map((p) => p.name)}
              height={260}
            /></CmsElement>
          </Card></CmsElement>

          {/* Tabela Comparativa de Risco e Retorno */}
          <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.Card.14"><Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Métricas Estatísticas Consolidadas"}</CmsText></h3>
              <span className="text-xs text-[#64748b]"><CmsText>{"Período Completo (2024 - 2026)"}</CmsText></span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2"><CmsText>{"Portfólio"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Taxa Média"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Retorno Total"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Volatilidade Anual"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Sharpe Ratio"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Sortino Ratio"}</CmsText></th>
                    <th className="pb-3 text-right"><CmsText>{"Max Drawdown"}</CmsText></th>
                    <th className="pb-3 text-right pr-2"><CmsText>{"Patrimônio Final"}</CmsText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <CmsText>{result.portfolios.map((p, i) => (
                    <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pl-2 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: i === 0 ? "#00f5a0" : i === 1 ? "#00d9f5" : "#a855f7",
                            }}
                          />
                          <CmsText>{p.name}</CmsText>
                        </div>
                      </td>
                      <td className="py-3 text-right text-[#94a3b8]">
                        <CmsText>{p.metrics.weightedAdminFee.toFixed(2)}</CmsText><CmsText>{"% a.a."}</CmsText></td>
                      <td className="py-3 text-right font-bold text-[#00f5a0]"><CmsText>{"+"}</CmsText><CmsText>{p.metrics.totalReturnPct.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                      <td className="py-3 text-right text-white">
                        <CmsText>{p.metrics.standardDeviation.allTime.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                      <td className="py-3 text-right font-bold text-white">
                        <CmsText>{p.metrics.sharpeRatio.allTime.toFixed(2)}</CmsText>
                      </td>
                      <td className="py-3 text-right font-bold text-white">
                        <CmsText>{p.metrics.sortinoRatio.allTime.toFixed(2)}</CmsText>
                      </td>
                      <td className="py-3 text-right font-bold text-[#ff3b5c]">
                        <CmsText>{formatPercent(p.metrics.maxDrawdown.pct)}</CmsText>
                      </td>
                      <td className="py-3 text-right pr-2 font-bold text-white">
                        <CmsText>{formatCurrency(p.metrics.finalAmount)}</CmsText>
                      </td>
                    </tr>
                  ))}</CmsText>
                  {/* Linha CDI */}
                  <tr className="hover:bg-white/[0.02] text-[#94a3b8]">
                    <td className="py-3 pl-2 font-bold text-[#94a3b8]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /><CmsText>{"Benchmark CDI"}</CmsText></div>
                    </td>
                    <td className="py-3 text-right"><CmsText>{"—"}</CmsText></td>
                    <td className="py-3 text-right"><CmsText>{"+"}</CmsText><CmsText>{result.benchmark.metrics.totalReturnPct.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                    <td className="py-3 text-right"><CmsText>{result.benchmark.metrics.standardDeviation.allTime.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                    <td className="py-3 text-right"><CmsText>{"0.00"}</CmsText></td>
                    <td className="py-3 text-right"><CmsText>{"0.00"}</CmsText></td>
                    <td className="py-3 text-right"><CmsText>{"0.00%"}</CmsText></td>
                    <td className="py-3 text-right pr-2"><CmsText>{formatCurrency(result.benchmark.metrics.finalAmount)}</CmsText></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card></CmsElement>

          {/* Gráfico de Drawdown Subaquático para o Portfólio Selecionado */}
          <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.Card.15"><Card glow="crimson">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Curva Subaquática de Quedas & Recuperação"}</CmsText></h3>
                <span className="text-xs text-[#64748b]"><CmsText>{"Selecione o portfólio para inspecionar o estresse histórico de pico a vale"}</CmsText></span>
              </div>
              <div className="flex items-center gap-2">
                <CmsText>{result.portfolios.map((p, idx) => (
                  <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.button.16" key={p.name}><button
                    key={p.name}
                    onClick={() => setSelectedPortfolioIdx(idx)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      selectedPortfolioIdx === idx
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-transparent text-[#64748b] hover:text-white"
                    }`}
                  >
                    <CmsText>{p.name}</CmsText>
                  </button></CmsElement>
                ))}</CmsText>
              </div>
            </div>

            <CmsText>{result.portfolios[selectedPortfolioIdx] && (
              <CmsElement feature="ui.app/-frontend-/simulador-de-portfolios/page.UnderwaterDrawdownChart.17"><UnderwaterDrawdownChart
                data={result.portfolios[selectedPortfolioIdx].drawdownCurve}
                maxDrawdownPct={result.portfolios[selectedPortfolioIdx].metrics.maxDrawdown.pct}
                valleyDate={result.portfolios[selectedPortfolioIdx].metrics.maxDrawdown.valleyDate}
                recoveryDays={result.portfolios[selectedPortfolioIdx].metrics.maxDrawdown.recoveryDays}
                height={220}
              /></CmsElement>
            )}</CmsText>
          </Card></CmsElement>
        </>
      )}</CmsText>
    </div>
  );
}
