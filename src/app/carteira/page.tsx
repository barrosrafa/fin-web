"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";

export default function CarteiraPage() {
  const [targetMonthlyYield, setTargetMonthlyYield] = useState(3000);

  const portfolioItems = [
    { ticker: "PETR4", type: "AÇÃO", shares: 800, price: 38.45, total: 30760, yieldAnn: 14.8, monthlyEstimate: 379.37 },
    { ticker: "VALE3", type: "AÇÃO", shares: 400, price: 62.10, total: 24840, yieldAnn: 9.2, monthlyEstimate: 190.44 },
    { ticker: "HGLG11", type: "FII", shares: 250, price: 164.20, total: 41050, yieldAnn: 8.65, monthlyEstimate: 295.91 },
    { ticker: "KNIP11", type: "FII", shares: 500, price: 94.80, total: 47400, yieldAnn: 11.2, monthlyEstimate: 442.40 },
    { ticker: "BOVA11", type: "ETF", shares: 150, price: 128.50, total: 19275, yieldAnn: 0.0, monthlyEstimate: 0.0 },
    { ticker: "TESOURO IPCA+ 2035", type: "RENDA FIXA", shares: 12, price: 2240.80, total: 26889.6, yieldAnn: 6.48, monthlyEstimate: 145.20 },
  ];

  const totalPortfolioValue = portfolioItems.reduce((acc, curr) => acc + curr.total, 0);
  const totalMonthlyIncome = portfolioItems.reduce((acc, curr) => acc + curr.monthlyEstimate, 0);
  const averageYield = totalPortfolioValue > 0 ? (totalMonthlyIncome * 12 / totalPortfolioValue) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Status Invest + FIIs.com.br Standard</span>
          <span className="text-xs text-[#64748b]">Simulador & Portfólio Inteligente</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Gestão de Carteira & Renda Passiva
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Acompanhamento consolidado de patrimônio, projeção de proventos futuros com competência mensal e simulação de independência financeira.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Patrimônio Total Alocado"
          value={formatCurrency(totalPortfolioValue)}
          subtitle="6 Ativos em 4 Classes"
          glow="emerald"
        />
        <MetricCard
          title="Renda Mensal Estimada"
          value={formatCurrency(totalMonthlyIncome)}
          subtitle="Projeção média com reinvestimento"
          glow="cyan"
        />
        <MetricCard
          title="Yield Médio da Carteira"
          value={formatPercent(averageYield, false)}
          subtitle="Ponderado por alocação de capital"
          glow="violet"
        />
      </div>

      {/* Portfolio Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Distribuição de Posições Ativas
          </h3>
          <Badge variant="cyan">Diversificação Equilibrada</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Ativo</th>
                <th className="pb-3">Classe</th>
                <th className="pb-3 text-right">Qtd. Cotas</th>
                <th className="pb-3 text-right">Preço Médio</th>
                <th className="pb-3 text-right">Saldo Atual</th>
                <th className="pb-3 text-right">% Carteira</th>
                <th className="pb-3 text-right pr-2">Renda Mensal Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {portfolioItems.map((item) => {
                const partPct = (item.total / totalPortfolioValue) * 100;

                return (
                  <tr key={item.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 pl-2 font-bold text-white font-sans">
                      {item.ticker}
                    </td>
                    <td className="py-3.5 font-sans">
                      <Badge variant="neutral">{item.type}</Badge>
                    </td>
                    <td className="py-3.5 text-right text-white">
                      {item.shares.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3.5 text-right text-[#94a3b8]">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="py-3.5 text-right text-[#00d9f5] font-bold">
                      {partPct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 text-right pr-2 text-[#00f5a0] font-bold">
                      {item.monthlyEstimate > 0 ? formatCurrency(item.monthlyEstimate) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
