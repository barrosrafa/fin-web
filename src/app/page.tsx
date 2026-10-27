"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import {
  MOCK_BENCHMARKS,
  MOCK_ASSETS,
  MOCK_AI_VERDICT_PETR4,
  MOCK_DIVIDENDS_PETR4,
} from "@/data/mock/marketData";

export default function HomePage() {
  const [activeAssetTab, setActiveAssetTab] = useState("TODOS");

  const filteredAssets =
    activeAssetTab === "TODOS"
      ? MOCK_ASSETS
      : MOCK_ASSETS.filter((a) => a.type === activeAssetTab);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-neon badge-neon-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0] animate-pulse" />
              Mercado B3 Aberto
            </span>
            <span className="text-xs text-[#64748b] mono-nums">
              Pregão Regular • Atualização contínua
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Cockpit de Inteligência Financeira
          </h1>
          <p className="text-sm sm:text-base text-[#94a3b8] mt-2 max-w-2xl font-normal">
            Terminal unificado de análise fundamentalista, valuation algorítmico (Graham, Bazin, DCF) e monitoramento contínuo de Ações, FIIs e Fundos CVM 175.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button href="/screener" variant="cyan">
            Super Screener
          </Button>
          <Button href="/comparador" variant="primary">
            Comparar Ativos
          </Button>
        </div>
      </div>

      {/* Macro Indicators 4-Col Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_BENCHMARKS.slice(0, 4).map((b) => (
          <MetricCard
            key={b.ticker}
            title={b.name}
            value={b.value.toLocaleString("pt-BR", {
              minimumFractionDigits: b.ticker === "USDBRL" ? 3 : 2,
            })}
            change={b.change}
            sparkline={b.sparkline}
            subtitle={b.ticker}
            glow={b.change >= 0 ? "emerald" : "crimson"}
          />
        ))}
      </div>

      {/* Asymmetrical Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bento 1: Market Explorer (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Radar de Oportunidades</span>
                  <span className="text-xs text-[#64748b] font-normal">
                    (Múltiplos em tempo real)
                  </span>
                </h2>
                <p className="text-xs text-[#94a3b8]">
                  Ativos destacados por liquidez, dividend yield e desconto patrimonial.
                </p>
              </div>

              <Tabs
                tabs={[
                  { id: "TODOS", label: "Todos", count: MOCK_ASSETS.length },
                  { id: "ACAO", label: "Ações" },
                  { id: "FII", label: "FIIs" },
                  { id: "ETF", label: "ETFs" },
                ]}
                activeTab={activeAssetTab}
                onChange={setActiveAssetTab}
              />
            </div>

            {/* Asset Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Ativo</th>
                    <th className="pb-3 text-right">Preço</th>
                    <th className="pb-3 text-right">Var. 24h</th>
                    <th className="pb-3 text-right">D.Y. (12M)</th>
                    <th className="pb-3 text-right hidden sm:table-cell">P/VP</th>
                    <th className="pb-3 text-right hidden md:table-cell">P/L</th>
                    <th className="pb-3 text-right hidden lg:table-cell">Gráfico</th>
                    <th className="pb-3 text-right pr-2">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAssets.map((asset) => {
                    const isPositive = asset.change24h >= 0;
                    const detailHref =
                      asset.type === "FII"
                        ? `/fiis/${asset.ticker}`
                        : asset.type === "ETF"
                        ? `/etfs/${asset.ticker}`
                        : `/acoes/${asset.ticker}`;

                    return (
                      <tr
                        key={asset.ticker}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-3.5 pl-2">
                          <Link href={detailHref} className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-[#f0f4f8] text-[11px] group-hover:border-[#00f5a0] transition-colors">
                              {asset.ticker.slice(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white group-hover:text-[#00f5a0] transition-colors">
                                {asset.ticker}
                              </span>
                              <span className="text-[10px] text-[#64748b] truncate max-w-[140px] sm:max-w-[200px]">
                                {asset.name}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 text-right font-mono font-medium text-white">
                          {formatCurrency(asset.currentPrice)}
                        </td>
                        <td className="py-3.5 text-right font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                              isPositive
                                ? "bg-[rgba(0,245,160,0.1)] text-[#00f5a0]"
                                : "bg-[rgba(255,59,105,0.1)] text-[#ff3b69]"
                            }`}
                          >
                            {formatPercent(asset.change24h)}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-mono font-semibold text-[#00d9f5]">
                          {formatPercent(asset.dividendYield, false)}
                        </td>
                        <td className="py-3.5 text-right font-mono text-[#94a3b8] hidden sm:table-cell">
                          {asset.pvp ? asset.pvp.toFixed(2) : "—"}
                        </td>
                        <td className="py-3.5 text-right font-mono text-[#94a3b8] hidden md:table-cell">
                          {asset.pl ? asset.pl.toFixed(1) : "—"}
                        </td>
                        <td className="py-3.5 text-right hidden lg:table-cell">
                          <div className="flex justify-end">
                            <Sparkline
                              data={asset.sparkline}
                              positive={isPositive}
                              width={70}
                              height={24}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 text-right pr-2">
                          <Link
                            href={detailHref}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 hover:bg-[rgba(0,245,160,0.15)] hover:text-[#00f5a0] border border-white/10 transition-all font-medium inline-flex items-center gap-1"
                          >
                            Analisar
                            <span>→</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Bento 2: AI Committee & Sentiment (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card glow="violet">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-pulse" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Comitê de IA
                </h3>
              </div>
              <Badge variant="violet">
                Score {MOCK_AI_VERDICT_PETR4.confidenceScore}%
              </Badge>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">
                  Destaque: {MOCK_AI_VERDICT_PETR4.ticker}
                </span>
                <Badge variant="emerald" dot>
                  Bullish
                </Badge>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-4">
                {MOCK_AI_VERDICT_PETR4.executiveSummary}
              </p>
            </div>

            <div className="flex flex-col gap-2 mb-5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#64748b]">
                Principais Forças Detectadas:
              </span>
              {MOCK_AI_VERDICT_PETR4.swot.strengths.slice(0, 2).map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-[#f0f4f8]"
                >
                  <span className="text-[#00f5a0] mt-0.5">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>

            <Button href="/radar-ia" variant="violet" className="w-full justify-between">
              Acessar Central do Comitê IA
            </Button>
          </Card>

          {/* Quick Valuation Model preview card */}
          <Card glow="cyan">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Valuation Graham / Bazin
              </h3>
              <Badge variant="cyan">PETR4</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                  Preço Justo Graham
                </div>
                <div className="text-base font-bold text-[#00f5a0] font-mono mt-0.5">
                  R$ 56,80
                </div>
                <div className="text-[10px] text-[#00f5a0] font-medium">
                  +47,7% Margem
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                  Preço Teto Bazin
                </div>
                <div className="text-base font-bold text-[#00d9f5] font-mono mt-0.5">
                  R$ 64,10
                </div>
                <div className="text-[10px] text-[#00d9f5] font-medium">
                  +66,7% Margem
                </div>
              </div>
            </div>

            <Link
              href="/acoes/PETR4"
              className="text-xs text-[#00d9f5] hover:underline flex items-center justify-end gap-1 font-semibold"
            >
              Simular parâmetros interativos ↗
            </Link>
          </Card>
        </div>
      </div>

      {/* Bento Bottom Row: Dividend Calendar & Magic Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dividend Agenda (Competência + Pagamento) */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Agenda de Dividendos Confirmados
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Proventos com data-com definida e mês de competência registrado.
              </p>
            </div>
            <Link
              href="/carteira"
              className="text-xs text-[#00f5a0] hover:underline font-medium"
            >
              Ver Todos ↗
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-white/5">
            {MOCK_DIVIDENDS_PETR4.map((div) => (
              <div
                key={div.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(0,245,160,0.1)] border border-[rgba(0,245,160,0.2)] flex items-center justify-center font-bold text-[#00f5a0] text-xs">
                    {div.assetTicker.slice(0, 4)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">
                        {div.assetTicker}
                      </span>
                      <Badge variant="neutral">
                        Comp: {div.referenceMonth}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#64748b]">
                      Data-Com: {div.dateCom} • Pagamento: {div.paymentDate}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-white text-xs">
                    {formatCurrency(div.valuePerShare)} / cota
                  </div>
                  <span className="text-[10px] text-[#00f5a0] font-semibold">
                    Yield {formatPercent(div.yieldOnCostPct, false)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* FII Real Estate & Cap Rate Cockpit */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Monitor Imobiliário FII (Dados SiiLA)
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Ativos físicos, padrão construtivo AAA e vacância física.
              </p>
            </div>
            <Link
              href="/fiis/HGLG11"
              className="text-xs text-[#00d9f5] hover:underline font-medium"
            >
              Painel Completo ↗
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                ABL Monitorada
              </div>
              <div className="text-lg font-bold text-white font-mono mt-1">
                435k m²
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                Vacância Média
              </div>
              <div className="text-lg font-bold text-[#00f5a0] font-mono mt-1">
                4.1%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                Padrão AAA
              </div>
              <div className="text-lg font-bold text-[#00d9f5] font-mono mt-1">
                82%
              </div>
            </div>
          </div>

          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Mapeamento dinâmico de galpões logísticos classe A+ e edifícios corporativos prime com dados de contratos de locação típicos vs. atípicos e apuração de taxa interna de retorno (TIR).
          </p>
        </Card>
      </div>
    </div>
  );
}
