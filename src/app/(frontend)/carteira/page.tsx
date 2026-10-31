"use client";

import React, { useState, useEffect } from "react";
import { DataStatus } from "@/components/shared/DataStatus";
import { SectionState } from "@/components/shared/SectionState";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getDemoPortfolioPositions, DemoPosition } from "@/lib/api";

export default function CarteiraPage() {
  const [targetMonthlyYield, setTargetMonthlyYield] = useState(3000);
  const [portfolioItems, setPortfolioItems] = useState<DemoPosition[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    // A new request generation invalidates the previous visible loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    async function load() {
      try {
        const res = await getDemoPortfolioPositions(controller.signal);
        if (!controller.signal.aborted) setPortfolioItems(res);
      } catch (err) {
        if (!controller.signal.aborted) setError("Carteira demonstrativa indisponível.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [revision]);

  const totalPortfolioValue = portfolioItems.reduce((acc, curr) => acc + curr.total, 0);
  const totalMonthlyIncome = portfolioItems.reduce((acc, curr) => acc + curr.monthlyEstimate, 0);
  const averageYield = totalPortfolioValue > 0 ? ((totalMonthlyIncome * 12) / totalPortfolioValue) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Demonstração educacional</span>
          <span className="text-xs text-[#94a3b8]">Simulador & Portfólio Inteligente Neon DB</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Carteira demonstrativa — dados fictícios
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Simulação educacional com posições e preços fictícios. Não representa sua custódia ou uma auditoria.
        </p>
      </div>

      <DataStatus mode="demo" source="Exemplo estático FIN" />
      <SectionState loading={loading} error={error} onRetry={() => setRevision(n => n + 1)} />
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Patrimônio Total Alocado"
          value={loading || error ? "—" : formatCurrency(totalPortfolioValue)}
          subtitle={`${portfolioItems.length} Ativos fictícios`}
          glow="emerald"
        />
        <MetricCard
          title="Renda Mensal Estimada"
          value={loading || error ? "—" : formatCurrency(totalMonthlyIncome)}
          subtitle="Projeção média com reinvestimento"
          glow="cyan"
        />
        <MetricCard
          title="Yield Médio da Carteira"
          value={loading || error ? "—" : formatPercent(averageYield, false)}
          subtitle="Ponderado por alocação de capital"
          glow="violet"
        />
      </div>

      {/* Tabela de Posições demonstrativas */}
      <Card glow="emerald">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Ativos fictícios & Renda Passiva Projetada
          </h3>
          <Badge variant="emerald">Demonstração fictícia</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Ticker / Ativo</th>
                <th className="pb-3">Classe</th>
                <th className="pb-3 text-right">Quantidade</th>
                <th className="pb-3 text-right">Preço de Fechamento</th>
                <th className="pb-3 text-right">Posição Total</th>
                <th className="pb-3 text-right">D.Y. Anual</th>
                <th className="pb-3 text-right pr-2">Provento Mensal Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {portfolioItems.map((item) => (
                <tr key={item.ticker} className="hover:bg-white/[0.02]">
                  <td className="py-3 pl-2 font-bold text-white font-sans">{item.ticker}</td>
                  <td className="py-3 font-sans">
                    <Badge variant={item.type === "AÇÃO" ? "cyan" : item.type === "FII" ? "emerald" : "violet"}>
                      {item.type}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-white">{item.shares.toLocaleString("pt-BR")}</td>
                  <td className="py-3 text-right text-white font-bold">{formatCurrency(item.price)}</td>
                  <td className="py-3 text-right font-bold text-white">{formatCurrency(item.total)}</td>
                  <td className="py-3 text-right text-[var(--positive)] font-bold">{item.yieldAnn.toFixed(2)}%</td>
                  <td className="py-3 text-right pr-2 font-bold text-[#00d9f5]">
                    {formatCurrency(item.monthlyEstimate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Simulador de Aporte para Renda Desejada */}
      <Card glow="cyan">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Simulador de Liberdade Financeira (Viver de Renda)
          </h3>
          <Badge variant="cyan">Projeção Composta</Badge>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#94a3b8]">Renda Passiva Desejada:</span>
            <span className="font-mono text-white font-bold">{formatCurrency(targetMonthlyYield)} / mês</span>
          </div>
          <input
            type="range"
            min="1000"
            max="20000"
            step="500"
            value={targetMonthlyYield}
            onChange={(e) => setTargetMonthlyYield(parseFloat(e.target.value))}
            className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5">
          <div>
            <span className="text-xs text-[#94a3b8] block mb-1">Patrimônio Alvo Necessário (Yield 9,5% a.a.)</span>
            <div className="text-2xl font-black font-mono text-[var(--positive)]">
              {formatCurrency((targetMonthlyYield * 12) / 0.095, true)}
            </div>
          </div>
          <div>
            <span className="text-xs text-[#94a3b8] block mb-1">Aporte Adicional Necessário</span>
            <div className="text-2xl font-black font-mono text-[#00d9f5]">
              {formatCurrency(Math.max(0, (targetMonthlyYield * 12) / 0.095 - totalPortfolioValue), true)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
