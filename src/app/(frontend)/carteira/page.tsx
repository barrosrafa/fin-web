"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
          <span className="badge-neon badge-neon-emerald"><CmsText>{"Demonstração educacional"}</CmsText></span>
          <span className="text-xs text-[#94a3b8]"><CmsText>{"Simulador & Portfólio Inteligente Neon DB"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Carteira demonstrativa — dados fictícios"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Simulação educacional com posições e preços fictícios. Não representa sua custódia ou uma auditoria."}</CmsText></p>
      </div>

      <DataStatus mode="demo" source="Exemplo estático FIN" />
      <SectionState loading={loading} error={error} onRetry={() => setRevision(n => n + 1)} />
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CmsElement feature="ui.app/-frontend-/carteira/page.MetricCard.1"><MetricCard
          title="Patrimônio Total Alocado"
          value={loading || error ? "—" : formatCurrency(totalPortfolioValue)}
          subtitle={`${portfolioItems.length} Ativos fictícios`}
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/carteira/page.MetricCard.2"><MetricCard
          title="Renda Mensal Estimada"
          value={loading || error ? "—" : formatCurrency(totalMonthlyIncome)}
          subtitle="Projeção média com reinvestimento"
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/carteira/page.MetricCard.3"><MetricCard
          title="Yield Médio da Carteira"
          value={loading || error ? "—" : formatPercent(averageYield, false)}
          subtitle="Ponderado por alocação de capital"
          glow="violet"
        /></CmsElement>
      </div>

      {/* Tabela de Posições demonstrativas */}
      <CmsElement feature="ui.app/-frontend-/carteira/page.Card.4"><Card glow="emerald">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Ativos fictícios & Renda Passiva Projetada"}</CmsText></h3>
          <Badge variant="emerald"><CmsText>{"Demonstração fictícia"}</CmsText></Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2"><CmsText>{"Ticker / Ativo"}</CmsText></th>
                <th className="pb-3"><CmsText>{"Classe"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Quantidade"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Preço de Fechamento"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Posição Total"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"D.Y. Anual"}</CmsText></th>
                <th className="pb-3 text-right pr-2"><CmsText>{"Provento Mensal Est."}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              <CmsText>{portfolioItems.map((item) => (
                <tr key={item.ticker} className="hover:bg-white/[0.02]">
                  <td className="py-3 pl-2 font-bold text-white font-sans"><CmsText>{item.ticker}</CmsText></td>
                  <td className="py-3 font-sans">
                    <Badge variant={item.type === "AÇÃO" ? "cyan" : item.type === "FII" ? "emerald" : "violet"}>
                      <CmsText>{item.type}</CmsText>
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-white"><CmsText>{item.shares.toLocaleString("pt-BR")}</CmsText></td>
                  <td className="py-3 text-right text-white font-bold"><CmsText>{formatCurrency(item.price)}</CmsText></td>
                  <td className="py-3 text-right font-bold text-white"><CmsText>{formatCurrency(item.total)}</CmsText></td>
                  <td className="py-3 text-right text-[var(--positive)] font-bold"><CmsText>{item.yieldAnn.toFixed(2)}</CmsText><CmsText>{"%"}</CmsText></td>
                  <td className="py-3 text-right pr-2 font-bold text-[#00d9f5]">
                    <CmsText>{formatCurrency(item.monthlyEstimate)}</CmsText>
                  </td>
                </tr>
              ))}</CmsText>
            </tbody>
          </table>
        </div>
      </Card></CmsElement>

      {/* Simulador de Aporte para Renda Desejada */}
      <CmsElement feature="ui.app/-frontend-/carteira/page.Card.5"><Card glow="cyan">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Simulador de Liberdade Financeira (Viver de Renda)"}</CmsText></h3>
          <Badge variant="cyan"><CmsText>{"Projeção Composta"}</CmsText></Badge>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#94a3b8]"><CmsText>{"Renda Passiva Desejada:"}</CmsText></span>
            <span className="font-mono text-white font-bold"><CmsText>{formatCurrency(targetMonthlyYield)}</CmsText><CmsText>{" / mês"}</CmsText></span>
          </div>
          <CmsElement feature="ui.app/-frontend-/carteira/page.input.6"><input
            type="range"
            min="1000"
            max="20000"
            step="500"
            value={targetMonthlyYield}
            onChange={(e) => setTargetMonthlyYield(parseFloat(e.target.value))}
            className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
          /></CmsElement>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5">
          <div>
            <span className="text-xs text-[#94a3b8] block mb-1"><CmsText>{"Patrimônio Alvo Necessário (Yield 9,5% a.a.)"}</CmsText></span>
            <div className="text-2xl font-black font-mono text-[var(--positive)]">
              <CmsText>{formatCurrency((targetMonthlyYield * 12) / 0.095, true)}</CmsText>
            </div>
          </div>
          <div>
            <span className="text-xs text-[#94a3b8] block mb-1"><CmsText>{"Aporte Adicional Necessário"}</CmsText></span>
            <div className="text-2xl font-black font-mono text-[#00d9f5]">
              <CmsText>{formatCurrency(Math.max(0, (targetMonthlyYield * 12) / 0.095 - totalPortfolioValue), true)}</CmsText>
            </div>
          </div>
        </div>
      </Card></CmsElement>
    </div>
  );
}
