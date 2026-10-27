"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatPercent } from "@/lib/formatters";
import { MOCK_QUANT_RISK_FUNDO } from "@/data/mock/marketData";

export default function FundosPage() {
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
          subtitle="Índice de Sharpe de 1.45 (12M)"
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
                <th className="pb-3 text-right">Índice Sharpe</th>
                <th className="pb-3 text-right">Índice Sortino</th>
                <th className="pb-3 text-right">Treynor</th>
                <th className="pb-3 text-right">Alfa de Jensen</th>
                <th className="pb-3 text-right">Beta (IBOV)</th>
                <th className="pb-3 text-right">Volatilidade (a.a.)</th>
                <th className="pb-3 text-right">Max Drawdown</th>
                <th className="pb-3 text-right pr-2">Meses Positivos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {MOCK_QUANT_RISK_FUNDO.map((m) => (
                <tr key={m.timeframe} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white">
                    {m.timeframe}
                  </td>
                  <td className="py-3.5 text-right font-bold text-[#00f5a0]">
                    {m.sharpe.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right font-bold text-[#00d9f5]">
                    {m.sortino.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right text-white">
                    {m.treynor.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right font-bold text-[#00f5a0]">
                    +{m.jensenAlpha.toFixed(2)}%
                  </td>
                  <td className="py-3.5 text-right text-[#94a3b8]">
                    {m.beta.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-right text-white">
                    {m.volatility.toFixed(1)}%
                  </td>
                  <td className="py-3.5 text-right font-bold text-[#ff3b69]">
                    {formatPercent(m.maxDrawdown)}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-bold text-[#00f5a0]">
                    {m.positiveMonthsPct.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CDA Holdings Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-base font-bold text-white mb-2">
            Composição CDA Aberto (Alocação de Ativos)
          </h3>
          <p className="text-xs text-[#94a3b8] mb-4">
            Demonstração de ativos enviada à CVM com prazo de defasagem regulatória.
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-white font-medium">Títulos Públicos NTN-B</span>
              <span className="font-mono text-[#00f5a0] font-bold">45,2% PL</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-white font-medium">Ações Locais B3 (Long)</span>
              <span className="font-mono text-[#00d9f5] font-bold">28,5% PL</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-white font-medium">Debêntures Incentivadas AAA</span>
              <span className="font-mono text-[#a855f7] font-bold">16,1% PL</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2 rounded bg-white/[0.02] border border-white/5">
              <span className="text-white font-medium">Caixa & Operações Compromissadas</span>
              <span className="font-mono text-[#94a3b8] font-bold">10,2% PL</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-base font-bold text-white mb-2">
            Regras Operacionais & Cotização
          </h3>
          <p className="text-xs text-[#94a3b8] mb-4">
            Horários de corte, prazos de resgate e tributação CVM 175.
          </p>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">
                Aplicação
              </span>
              <div className="text-base font-bold text-white font-mono mt-1">
                D+0 (Até 14h)
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">
                Cotização Resgate
              </span>
              <div className="text-base font-bold text-[#00f5a0] font-mono mt-1">
                D+30 corridos
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">
                Liquidação Financeira
              </span>
              <div className="text-base font-bold text-[#00d9f5] font-mono mt-1">
                D+2 útil pós cotização
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-[#64748b] uppercase font-bold">
                Taxa Adm / Performance
              </span>
              <div className="text-base font-bold text-white font-mono mt-1">
                2,0% / 20% do Alfa
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
