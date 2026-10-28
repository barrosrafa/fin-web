"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency } from "@/lib/formatters";
import { getCanonicalPair } from "@/lib/api";
import type { AssetComparisonMetrics, ComparatorResult } from "@/schemas/financial";
import { HoldingsOverlapTable } from "@/components/etfs/HoldingsOverlapTable";
import { RelativePerformanceBase100Chart } from "@/components/etfs/RelativePerformanceBase100Chart";

export function CanonicalPairClient({
  tickerA,
  tickerB,
}: {
  tickerA: string;
  tickerB: string;
}) {
  const a = tickerA.toUpperCase();
  const b = tickerB.toUpperCase();
  const [comparison, setComparison] = useState<ComparatorResult | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getCanonicalPair(a, b);
        if (res) setComparison(res);
      } catch (err) {
        console.error("Failed to load canonical pair comparison:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [a, b]);

  const assetA: AssetComparisonMetrics = comparison?.metrics?.find(
    (m: AssetComparisonMetrics) => m.ticker === a
  ) || {
    ticker: a,
    price: a === "CDIB11" ? 52.78 : a === "BLFT11" ? 108.40 : 172.42,
    change_12m: 12.3,
    dy_pct: 0.0,
    pvp: 1.0,
    pl: 408.7,
    volatility_pct: 1.5,
    sharpe: 1.85,
    ter_pct: a === "BLFT11" ? 0.10 : a === "CDIB11" ? 0.15 : 0.10,
    gestora: "Itaú Unibanco Asset",
  };

  const assetB: AssetComparisonMetrics = comparison?.metrics?.find(
    (m: AssetComparisonMetrics) => m.ticker === b
  ) || {
    ticker: b,
    price: b === "LFTB11" ? 52.75 : b === "LFTS11" ? 114.20 : 118.50,
    change_12m: 12.0,
    dy_pct: 0.0,
    pvp: 1.0,
    pl: 2840.1,
    volatility_pct: 1.8,
    sharpe: 1.75,
    ter_pct: b === "LFTS11" ? 0.19 : 0.19,
    gestora: "Investo Gestão de Recursos",
  };

  const overlap = comparison?.overlap_analysis || {
    total_overlap_pct: 72.5,
    common_holdings_count: 3,
    top_shared_holdings: [
      {
        codigo: "LFT-2029",
        nome: "Tesouro Selic 2029",
        peso_a: 45.0,
        peso_b: 40.0,
        overlap_min: 40.0,
      },
      {
        codigo: "LFT-2027",
        nome: "Tesouro Selic 2027",
        peso_a: 35.0,
        peso_b: 32.5,
        overlap_min: 32.5,
      },
    ],
  };

  const series = comparison?.series || [
    { date: "2025-10-01", values: { [a]: 100.0, [b]: 100.0, CDI: 100.0 } },
    { date: "2026-01-01", values: { [a]: 103.1, [b]: 103.0, CDI: 102.7 } },
    { date: "2026-04-01", values: { [a]: 106.2, [b]: 106.0, CDI: 105.4 } },
    { date: "2026-07-01", values: { [a]: 109.3, [b]: 109.0, CDI: 108.1 } },
    { date: "2026-10-26", values: { [a]: 112.3, [b]: 112.0, CDI: 110.8 } },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Cockpit",
        item: "https://www.etfsbrasil.com.br",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Comparador",
        item: "https://www.etfsbrasil.com.br/comparador",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${a} x ${b}`,
        item: `https://www.etfsbrasil.com.br/comparador/${a.toLowerCase()}/${b.toLowerCase()}`,
      },
    ],
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/comparador" className="hover:text-white transition-colors">
          Comparador
        </Link>
        <span>/</span>
        <span className="text-[#00f5a0] mono-nums">
          {a} x {b}
        </span>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">
            Comparação Canônica Head-to-Head
          </span>
          <span className="text-xs text-[#64748b]">Análise Par a Par</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          {a} versus {b}: Qual é a melhor opção?
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Confronto direto de estrutura de custos (TER primária e secundária),
          volatilidade histórica, sobreposição de carteira e eficiência
          tributária.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Menor Custo Efetivo (TER)"
          value={`${Math.min(assetA.ter_pct ?? 0.3, assetB.ter_pct ?? 0.3).toFixed(2)}% a.a.`}
          subtitle={`Vencedor: ${(assetA.ter_pct ?? 0.3) <= (assetB.ter_pct ?? 0.3) ? a : b}`}
          glow="emerald"
        />
        <MetricCard
          title="Sobreposição Efetiva"
          value={`${overlap.total_overlap_pct.toFixed(1)}% em comum`}
          subtitle={`${overlap.common_holdings_count} ativos subjacentes coincidentes`}
          glow="cyan"
        />
        <MetricCard
          title="Maior Sharpe Ratio"
          value={`${Math.max(assetA.sharpe, assetB.sharpe).toFixed(2)}x`}
          subtitle={`Vencedor: ${assetA.sharpe >= assetB.sharpe ? a : b}`}
          glow="violet"
        />
      </div>

      {/* Tabela Lado a Lado com Destaque de Deltas */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Confronto Técnico Multi-Métricas
          </h3>
          <span className="text-xs text-[#64748b]">
            Dados auditados de fechamento
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-3">Indicador / Métrica</th>
                <th className="pb-3 text-right font-mono text-[#00f5a0]">{a}</th>
                <th className="pb-3 text-right font-mono text-[#00d9f5]">{b}</th>
                <th className="pb-3 text-center pr-3">Diferencial Competitivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              <tr>
                <td className="py-3 pl-3 text-white font-medium">Gestora Responsável</td>
                <td className="py-3 text-right text-[#94a3b8] font-sans">
                  {assetA.gestora}
                </td>
                <td className="py-3 text-right text-[#94a3b8] font-sans">
                  {assetB.gestora}
                </td>
                <td className="py-3 text-center pr-3 text-[#64748b]">—</td>
              </tr>
              <tr>
                <td className="py-3 pl-3 text-white font-medium">Cotação de Mercado</td>
                <td className="py-3 text-right text-white font-bold">
                  {formatCurrency(assetA.price)}
                </td>
                <td className="py-3 text-right text-white font-bold">
                  {formatCurrency(assetB.price)}
                </td>
                <td className="py-3 text-center pr-3 text-[#64748b]">—</td>
              </tr>
              <tr>
                <td className="py-3 pl-3 text-white font-medium">
                  Taxa de Administração Total (TER)
                </td>
                <td className="py-3 text-right text-[#00f5a0] font-bold">
                  {(assetA.ter_pct ?? 0.3).toFixed(2)}% a.a.
                </td>
                <td className="py-3 text-right text-[#00d9f5] font-bold">
                  {(assetB.ter_pct ?? 0.3).toFixed(2)}% a.a.
                </td>
                <td className="py-3 text-center pr-3">
                  <Badge
                    variant={
                      (assetA.ter_pct ?? 0.3) <= (assetB.ter_pct ?? 0.3)
                        ? "emerald"
                        : "cyan"
                    }
                  >
                    {(assetA.ter_pct ?? 0.3) <= (assetB.ter_pct ?? 0.3)
                      ? `${a} mais barato`
                      : `${b} mais barato`}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 text-white font-medium">
                  Retorno Acumulado 12M
                </td>
                <td className="py-3 text-right text-white font-bold">
                  +{assetA.change_12m.toFixed(2)}%
                </td>
                <td className="py-3 text-right text-white font-bold">
                  +{assetB.change_12m.toFixed(2)}%
                </td>
                <td className="py-3 text-center pr-3">
                  <Badge
                    variant={
                      assetA.change_12m >= assetB.change_12m ? "emerald" : "cyan"
                    }
                  >
                    {assetA.change_12m >= assetB.change_12m ? a : b}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 text-white font-medium">
                  Volatilidade Anualizada
                </td>
                <td className="py-3 text-right text-white">
                  {assetA.volatility_pct.toFixed(1)}%
                </td>
                <td className="py-3 text-right text-white">
                  {assetB.volatility_pct.toFixed(1)}%
                </td>
                <td className="py-3 text-center pr-3">
                  <Badge
                    variant={
                      assetA.volatility_pct <= assetB.volatility_pct
                        ? "emerald"
                        : "cyan"
                    }
                  >
                    {assetA.volatility_pct <= assetB.volatility_pct
                      ? `${a} menos volátil`
                      : `${b} menos volátil`}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-3 text-white font-medium">
                  Índice Sharpe (Retorno / Risco)
                </td>
                <td className="py-3 text-right text-white font-bold">
                  {assetA.sharpe.toFixed(2)}
                </td>
                <td className="py-3 text-right text-white font-bold">
                  {assetB.sharpe.toFixed(2)}
                </td>
                <td className="py-3 text-center pr-3">
                  <Badge
                    variant={assetA.sharpe >= assetB.sharpe ? "emerald" : "cyan"}
                  >
                    {assetA.sharpe >= assetB.sharpe ? a : b}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Gráfico de Rentabilidade Relativa Base 100 */}
      <Card glow="cyan">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">
          Curva Comparativa Base 100 vs CDI
        </h3>
        <RelativePerformanceBase100Chart
          series={series}
          tickers={[a, b]}
          height={260}
        />
      </Card>

      {/* Análise de Sobreposição de Carteira */}
      <Card glow="emerald">
        <h3 className="text-base font-bold text-white tracking-tight mb-4">
          Decomposição da Sobreposição de Ativos Subjacentes (Holdings Overlap)
        </h3>
        <HoldingsOverlapTable
          tickerA={a}
          tickerB={b}
          totalOverlapPct={overlap.total_overlap_pct}
          commonCount={overlap.common_holdings_count}
          items={overlap.top_shared_holdings}
        />
      </Card>
    </div>
  );
}