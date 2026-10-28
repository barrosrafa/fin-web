"use client";

import React, { useState, useEffect } from "react";
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

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await simulatePortfolio({
        startDate,
        endDate,
        startingAmount,
        monthlyContributions: monthlyContribution,
        rebalancingFrequency: rebalancing,
        advisoryFee,
        portfolioList: portfolios,
      });
      if (res) setResult(res);
    } catch (err) {
      console.error("Erro na simulação:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          <span className="badge-neon badge-neon-emerald">ETFs Brasil Quantitative</span>
          <span className="text-xs text-[#64748b]">Backtesting & Risco</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Simulador de Portfólios de ETFs
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Monte até 3 carteiras de ETFs, fundos e índices, compare o desempenho histórico real lado a lado com rebalanceamento programável e métricas avançadas de risco (Sharpe, Sortino e Drawdown Máximo).
        </p>
      </div>

      {/* Inputs de Configuração */}
      <Card glow="cyan">
        {/* Date Range & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#64748b] block mb-1">
                Data Inicial (Backtest Real)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#131926] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f5a0]"
              />
            </div>
            <span className="text-[#64748b] mt-4">até</span>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#64748b] block mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#131926] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00f5a0]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] mr-1">Atalhos:</span>
            <button
              onClick={() => {
                setStartDate("2024-01-02");
                setEndDate("2024-10-25");
              }}
              className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition-colors"
            >
              2024 Completo
            </button>
            <button
              onClick={() => {
                setStartDate("2023-10-25");
                setEndDate("2024-10-25");
              }}
              className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition-colors"
            >
              12 Meses
            </button>
            <button
              onClick={() => {
                setStartDate("2023-01-02");
                setEndDate("2026-10-25");
              }}
              className="px-2.5 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-cyan-400 font-semibold transition-colors"
            >
              Histórico Integral
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Patrimônio Inicial (R$)
            </label>
            <input
              type="number"
              value={startingAmount}
              onChange={(e) => setStartingAmount(Number(e.target.value))}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Aporte Mensal (R$)
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Rebalanceamento Periódico
            </label>
            <select
              value={rebalancing}
              onChange={(e) => setRebalancing(e.target.value as any)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            >
              <option value="NENHUM">Sem Rebalanceamento (Buy & Hold)</option>
              <option value="MENSAL">Mensal</option>
              <option value="TRIMESTRAL">Trimestral (Padrão Teva)</option>
              <option value="SEMESTRAL">Semestral</option>
              <option value="ANUAL">Anual</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Taxa de Consultoria (% a.a.)
            </label>
            <input
              type="number"
              step="0.1"
              value={advisoryFee}
              onChange={(e) => setAdvisoryFee(Number(e.target.value))}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="cyan"
            onClick={runSimulation}
            disabled={loading}
          >
            {loading ? "Calculando Simulação..." : "Recalcular Portfólios ↻"}
          </Button>
        </div>
      </Card>

      {/* Resultados de Métricas Comparativas */}
      {result && result.portfolios.length > 0 && (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {result.portfolios.map((p, i) => (
              <MetricCard
                key={p.name}
                title={`Portfólio ${p.name}`}
                value={formatCurrency(p.metrics.finalAmount)}
                subtitle={`Retorno: +${p.metrics.totalReturnPct.toFixed(1)}% | CAGR: ${p.metrics.cagrPct.toFixed(1)}% a.a.`}
                glow={i === 0 ? "emerald" : i === 1 ? "cyan" : "violet"}
              />
            ))}
          </div>

          {/* Gráfico de Evolução de Retorno Relativo Base 100 */}
          <Card glow="emerald">
            <h3 className="text-base font-bold text-white tracking-tight mb-4">
              Evolução Patrimonial Normalizada (Base 100 vs Benchmark CDI)
            </h3>
            <RelativePerformanceBase100Chart
              series={base100Series}
              tickers={result.portfolios.map((p) => p.name)}
              height={260}
            />
          </Card>

          {/* Tabela Comparativa de Risco e Retorno */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">
                Métricas Estatísticas Consolidadas
              </h3>
              <span className="text-xs text-[#64748b]">Período Completo (2024 - 2026)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Portfólio</th>
                    <th className="pb-3 text-right">Taxa Média</th>
                    <th className="pb-3 text-right">Retorno Total</th>
                    <th className="pb-3 text-right">Volatilidade Anual</th>
                    <th className="pb-3 text-right">Sharpe Ratio</th>
                    <th className="pb-3 text-right">Sortino Ratio</th>
                    <th className="pb-3 text-right">Max Drawdown</th>
                    <th className="pb-3 text-right pr-2">Patrimônio Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  {result.portfolios.map((p, i) => (
                    <tr key={p.name} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pl-2 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{
                              backgroundColor: i === 0 ? "#00f5a0" : i === 1 ? "#00d9f5" : "#a855f7",
                            }}
                          />
                          {p.name}
                        </div>
                      </td>
                      <td className="py-3 text-right text-[#94a3b8]">
                        {p.metrics.weightedAdminFee.toFixed(2)}% a.a.
                      </td>
                      <td className="py-3 text-right font-bold text-[#00f5a0]">
                        +{p.metrics.totalReturnPct.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right text-white">
                        {p.metrics.standardDeviation.allTime.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right font-bold text-white">
                        {p.metrics.sharpeRatio.allTime.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-bold text-white">
                        {p.metrics.sortinoRatio.allTime.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-bold text-[#ff3b5c]">
                        {formatPercent(p.metrics.maxDrawdown.pct)}
                      </td>
                      <td className="py-3 text-right pr-2 font-bold text-white">
                        {formatCurrency(p.metrics.finalAmount)}
                      </td>
                    </tr>
                  ))}
                  {/* Linha CDI */}
                  <tr className="hover:bg-white/[0.02] text-[#94a3b8]">
                    <td className="py-3 pl-2 font-bold text-[#94a3b8]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                        Benchmark CDI
                      </div>
                    </td>
                    <td className="py-3 text-right">—</td>
                    <td className="py-3 text-right">+{result.benchmark.metrics.totalReturnPct.toFixed(1)}%</td>
                    <td className="py-3 text-right">{result.benchmark.metrics.standardDeviation.allTime.toFixed(1)}%</td>
                    <td className="py-3 text-right">0.00</td>
                    <td className="py-3 text-right">0.00</td>
                    <td className="py-3 text-right">0.00%</td>
                    <td className="py-3 text-right pr-2">{formatCurrency(result.benchmark.metrics.finalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Gráfico de Drawdown Subaquático para o Portfólio Selecionado */}
          <Card glow="crimson">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Curva Subaquática de Quedas & Recuperação
                </h3>
                <span className="text-xs text-[#64748b]">
                  Selecione o portfólio para inspecionar o estresse histórico de pico a vale
                </span>
              </div>
              <div className="flex items-center gap-2">
                {result.portfolios.map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPortfolioIdx(idx)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      selectedPortfolioIdx === idx
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-transparent text-[#64748b] hover:text-white"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {result.portfolios[selectedPortfolioIdx] && (
              <UnderwaterDrawdownChart
                data={result.portfolios[selectedPortfolioIdx].drawdownCurve}
                maxDrawdownPct={result.portfolios[selectedPortfolioIdx].metrics.maxDrawdown.pct}
                valleyDate={result.portfolios[selectedPortfolioIdx].metrics.maxDrawdown.valleyDate}
                recoveryDays={result.portfolios[selectedPortfolioIdx].metrics.maxDrawdown.recoveryDays}
                height={220}
              />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
