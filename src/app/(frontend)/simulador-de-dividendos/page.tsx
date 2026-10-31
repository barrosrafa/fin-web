"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect, useTransition, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { simulateDividends, DividendSimulationResponse } from "@/lib/api";

export default function SimuladorDividendosPage() {
  const [initialCapital, setInitialCapital] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [years, setYears] = useState(10);
  const [stockPrice, setStockPrice] = useState(10.0);
  const [monthlyDividend, setMonthlyDividend] = useState(0.10);
  const [annualInflation, setAnnualInflation] = useState(0.045);
  const [dividendGrowth, setDividendGrowth] = useState(0.05);
  const [reinvest, setReinvest] = useState(true);

  const [result, setResult] = useState<DividendSimulationResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSimulate = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await simulateDividends({
          initial_capital: initialCapital,
          monthly_contribution: monthlyContribution,
          time_horizon_months: years * 12,
          initial_stock_price: stockPrice,
          monthly_dividend_per_unit: monthlyDividend,
          annual_inflation_rate: annualInflation,
          annual_dividend_growth_rate: dividendGrowth,
          reinvest_dividends: reinvest,
        });
        setResult(res);
      } catch (err) {
        console.error("Simulation failed:", err);
      }
    });
  }, [initialCapital, monthlyContribution, years, stockPrice, monthlyDividend, annualInflation, dividendGrowth, reinvest]);

  useEffect(() => {
    handleSimulate();
  }, [handleSimulate]);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-amber"><CmsText>{"Independência Financeira"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Juros Compostos & Proventos"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Simulador de Dividendos & Renda Passiva"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Calcule a evolução do seu patrimônio com reinvestimento automático de dividendos, aportes indexados pela inflação e descubra em quanto tempo você atingirá o Número Mágico."}</CmsText></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column (5 cols) */}
        <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.Card.1"><Card className="lg:col-span-5 p-6 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-3"><CmsText>{"Parâmetros da Simulação"}</CmsText></h2>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94a3b8]"><CmsText>{"Capital Inicial:"}</CmsText></span>
              <span className="font-mono font-bold text-white"><CmsText>{formatCurrency(initialCapital)}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.2"><input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full accent-cyan-400"
            /></CmsElement>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94a3b8]"><CmsText>{"Aporte Mensal Regular:"}</CmsText></span>
              <span className="font-mono font-bold text-white"><CmsText>{formatCurrency(monthlyContribution)}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.3"><input
              type="range"
              min="100"
              max="20000"
              step="100"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-cyan-400"
            /></CmsElement>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94a3b8]"><CmsText>{"Prazo do Investimento:"}</CmsText></span>
              <span className="font-mono font-bold text-white"><CmsText>{years}</CmsText><CmsText>{" anos ("}</CmsText><CmsText>{years * 12}</CmsText><CmsText>{" meses)"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.4"><input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-cyan-400"
            /></CmsElement>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Preço Cota (R$):"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.5"><input
                type="number"
                step="0.10"
                value={stockPrice}
                onChange={(e) => setStockPrice(Number(e.target.value))}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
              /></CmsElement>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Dividendo Mensal (R$):"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.6"><input
                type="number"
                step="0.01"
                value={monthlyDividend}
                onChange={(e) => setMonthlyDividend(Number(e.target.value))}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
              /></CmsElement>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Inflação Anual (%):"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.7"><input
                type="number"
                step="0.1"
                value={(annualInflation * 100).toFixed(1)}
                onChange={(e) => setAnnualInflation(Number(e.target.value) / 100)}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
              /></CmsElement>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Cresc. Proventos a.a (%):"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.8"><input
                type="number"
                step="0.1"
                value={(dividendGrowth * 100).toFixed(1)}
                onChange={(e) => setDividendGrowth(Number(e.target.value) / 100)}
                className="bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
              /></CmsElement>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-sm text-[#cbd5e1]"><CmsText>{"Reinvestir 100% dos Proventos:"}</CmsText></span>
            <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.input.9"><input
              type="checkbox"
              checked={reinvest}
              onChange={(e) => setReinvest(e.target.checked)}
              className="h-5 w-5 accent-cyan-400 rounded"
            /></CmsElement>
          </div>

          <CmsText>{isPending && (
            <p className="text-xs text-cyan-400 animate-pulse text-center"><CmsText>{"Recalculando curvas de juros compostos..."}</CmsText></p>
          )}</CmsText>
        </Card></CmsElement>

        {/* Results Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <CmsText>{result && (
            <>
              {/* Magic Number Card */}
              <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.Card.10"><Card className="p-6 border border-emerald-500/30 bg-emerald-950/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-neon badge-neon-emerald"><CmsText>{"Ponto de Inflexão"}</CmsText></span>
                    <span className="text-xs text-[#94a3b8]"><CmsText>{"Bola de Neve Financeira"}</CmsText></span>
                  </div>
                  <h3 className="text-xl font-black text-white">
                    <CmsText>{result.magic_number.atingido
                      ? `Número Mágico Atingido no Mês ${result.magic_number.mes}!`
                      : "Meta do Número Mágico"}</CmsText>
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Com "}</CmsText><CmsText>{result.magic_number.cotas_necessarias?.toLocaleString("pt-BR")}</CmsText><CmsText>{" cotas, seus proventos mensais superam o valor de 1 cota de "}</CmsText><CmsText>{formatCurrency(stockPrice)}</CmsText><CmsText>{"."}</CmsText></p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    <CmsText>{result.magic_number.cotas_necessarias?.toLocaleString("pt-BR")}</CmsText><CmsText>{" cotas"}</CmsText></span>
                </div>
              </Card></CmsElement>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.MetricCard.11"><MetricCard
                  title="Patrimônio Acumulado"
                  value={formatCurrency(result.patrimonio_final)}
                  change={0}
                  subtitle="Valor futuro estimado"
                /></CmsElement>
                <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.MetricCard.12"><MetricCard
                  title="Renda Mensal Projetada"
                  value={formatCurrency(result.renda_mensal_final)}
                  change={0}
                  subtitle="Proventos/mês no final"
                /></CmsElement>
                <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.MetricCard.13"><MetricCard
                  title="Total de Proventos Gerados"
                  value={formatCurrency(result.total_proventos_gerados)}
                  change={0}
                  subtitle="Efeito multiplicador"
                /></CmsElement>
              </div>

              {/* Milestones Table */}
              <CmsElement feature="ui.app/-frontend-/simulador-de-dividendos/page.Card.14"><Card className="p-0 overflow-hidden border border-white/10">
                <div className="p-4 border-b border-white/10 bg-[#0f172a]/60">
                  <h3 className="text-sm font-bold text-white"><CmsText>{"Evolução Quinquenal da Renda"}</CmsText></h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#cbd5e1]">
                    <thead className="bg-[#0f172a]/80 text-[#94a3b8] uppercase">
                      <tr>
                        <th className="py-3 px-4"><CmsText>{"Ano"}</CmsText></th>
                        <th className="py-3 px-4 text-right"><CmsText>{"Patrimônio"}</CmsText></th>
                        <th className="py-3 px-4 text-right"><CmsText>{"Aporte Acumulado"}</CmsText></th>
                        <th className="py-3 px-4 text-right"><CmsText>{"Renda Mensal"}</CmsText></th>
                        <th className="py-3 px-4 text-right"><CmsText>{"Yield on Cost"}</CmsText></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      <CmsText>{result.evolucao
                        .filter((m) => m.mes % 12 === 0 || m.mes === result.evolucao.length)
                        .map((m) => (
                          <tr key={m.mes} className="hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-bold text-white"><CmsText>{"Ano "}</CmsText><CmsText>{m.mes / 12}</CmsText></td>
                            <td className="py-3 px-4 text-right text-cyan-400">
                              <CmsText>{formatCurrency(m.patrimonio)}</CmsText>
                            </td>
                            <td className="py-3 px-4 text-right text-[#94a3b8]">
                              <CmsText>{formatCurrency(m.total_investido_bolso)}</CmsText>
                            </td>
                            <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                              <CmsText>{formatCurrency(m.provento_recebido)}</CmsText>
                            </td>
                            <td className="py-3 px-4 text-right text-amber-400">
                              <CmsText>{formatPercent(m.yield_on_cost_pct)}</CmsText>
                            </td>
                          </tr>
                        ))}</CmsText>
                    </tbody>
                  </table>
                </div>
              </Card></CmsElement>
            </>
          )}</CmsText>
        </div>
      </div>
    </div>
  );
}
