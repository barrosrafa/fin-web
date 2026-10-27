"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatPercent } from "@/lib/formatters";
import { getFundRiskMatrix, FundRiskMatrixData } from "@/lib/api";
import { QuantRiskMatrix } from "@/schemas/financial";

export default function FundosPage() {
  const [fundData, setFundData] = useState<FundRiskMatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getFundRiskMatrix("cvm175-macro");
        if (res) setFundData(res);
      } catch (err) {
        console.error("Failed to load fund risk matrix:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const matrix: QuantRiskMatrix[] = fundData?.matrix ?? [
    { timeframe: "1M", sharpe: 1.24, sortino: 1.65, treynor: 0.14, jensenAlpha: 0.22, beta: 0.88, volatility: 11.2, maxDrawdown: -1.2, recoveryDays: 8, positiveMonthsPct: 100 },
    { timeframe: "3M", sharpe: 1.35, sortino: 1.82, treynor: 0.16, jensenAlpha: 0.38, beta: 0.91, volatility: 12.4, maxDrawdown: -2.4, recoveryDays: 14, positiveMonthsPct: 100 },
    { timeframe: "6M", sharpe: 1.42, sortino: 1.95, treynor: 0.18, jensenAlpha: 0.55, beta: 0.94, volatility: 13.1, maxDrawdown: -3.8, recoveryDays: 22, positiveMonthsPct: 83.3 },
    { timeframe: "12M", sharpe: 1.58, sortino: 2.10, treynor: 0.21, jensenAlpha: 0.95, beta: 0.96, volatility: 14.0, maxDrawdown: -5.4, recoveryDays: 34, positiveMonthsPct: 83.3 },
    { timeframe: "24M", sharpe: 1.62, sortino: 2.18, treynor: 0.22, jensenAlpha: 1.10, beta: 0.97, volatility: 14.5, maxDrawdown: -7.1, recoveryDays: 45, positiveMonthsPct: 79.2 },
    { timeframe: "36M", sharpe: 1.70, sortino: 2.30, treynor: 0.24, jensenAlpha: 1.28, beta: 0.98, volatility: 15.1, maxDrawdown: -8.9, recoveryDays: 58, positiveMonthsPct: 77.8 },
    { timeframe: "YTD", sharpe: 1.48, sortino: 2.02, treynor: 0.19, jensenAlpha: 0.68, beta: 0.95, volatility: 13.6, maxDrawdown: -4.1, recoveryDays: 19, positiveMonthsPct: 87.5 },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">Nova Resolução CVM 175</span>
          <span className="text-xs text-[#64748b]">Fundo • Classe • Subclasse</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Fundos de Investimento (CVM 175)
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Análise quantitativa profunda baseada na metodologia do Mais Retorno: Matriz de Risco 10x10, Composição de Carteira (CDA aberto) e histórico de compras e vendas declaradas.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Fundo Multimercado Destaque"
          value="SPX Nimitz Feeder"
          subtitle="Índice de Sharpe de 1.58 (12M)"
          glow="cyan"
        />
        <MetricCard
          title="Fundo Renda Fixa Crédito Privado"
          value="Kinea Rendimentos"
          subtitle="112% do CDI com volatilidade 1.2%"
          glow="emerald"
        />
        <MetricCard
          title="Fundo de Ações Long Bias"
          value="Kapitalo Tarkus FIA"
          subtitle="Alfa de Jensen +3.8% vs IBOV"
          glow="violet"
        />
      </div>

      {/* Quant Risk Matrix 10x10 */}
      <Card glow="cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Matriz Quantitativa de Risco (10x10)</span>
              <Badge variant="cyan">Mais Retorno Standard</Badge>
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Indicadores estatísticos de Sharpe, Sortino, Treynor, Alfa de Jensen e Drawdown calculados em janelas móveis.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Janela Temporal</th>
                <th className="pb-3 text-right">Sharpe</th>
                <th className="pb-3 text-right">Sortino</th>
                <th className="pb-3 text-right">Treynor</th>
                <th className="pb-3 text-right">Alfa Jensen</th>
                <th className="pb-3 text-right">Beta</th>
                <th className="pb-3 text-right">Volatilidade</th>
                <th className="pb-3 text-right">Max Drawdown</th>
                <th className="pb-3 text-right">Recup. (Dias)</th>
                <th className="pb-3 text-right pr-2">Meses Positivos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {matrix.map((m) => (
                <tr key={m.timeframe} className="hover:bg-white/[0.02]">
                  <td className="py-3 pl-2 font-bold text-white font-sans">
                    {m.timeframe}
                  </td>
                  <td className="py-3 text-right font-bold text-[#00f5a0]">
                    {m.sharpe.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-white">
                    {m.sortino.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-[#00d9f5]">
                    {m.treynor.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-[#00f5a0]">
                    +{m.jensenAlpha.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right text-white">
                    {m.beta.toFixed(2)}
                  </td>
                  <td className="py-3 text-right text-[#94a3b8]">
                    {m.volatility.toFixed(1)}%
                  </td>
                  <td className="py-3 text-right font-bold text-[#ff3b69]">
                    {formatPercent(m.maxDrawdown, false)}
                  </td>
                  <td className="py-3 text-right text-[#94a3b8]">
                    {m.recoveryDays} d
                  </td>
                  <td className="py-3 text-right pr-2 text-white">
                    {m.positiveMonthsPct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
