"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getAssets } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export default function ETFsPage() {
  const [etfs, setEtfs] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAssets("ETF");
        setEtfs(res);
      } catch (err) {
        console.error("Failed to load ETFs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">ETFs Brasil Standard</span>
          <span className="text-xs text-[#64748b]">Exchange Traded Funds</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          ETFs Locais & Globais (Fundos de Índice)
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Análise de custo total efetivo (TER - primária e secundária), monitor de Spread NAV (ágio/deságio), liquidez de criação/destruição de cotas e replicação de índices.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Menor Custo TER (B3)"
          value="BOVA11 • 0,30% a.a."
          subtitle="Taxa primária sem custos secundários"
          glow="emerald"
        />
        <MetricCard
          title="Top Liquidez Internacional"
          value="IVVB11 • S&P 500"
          subtitle="Spread NAV médio inferior a 0,10%"
          glow="cyan"
        />
        <MetricCard
          title="ETF Criptoativo Institucional"
          value="HASH11 • NCI Index"
          subtitle="Custódia física regulada em Cold Storage"
          glow="violet"
        />
      </div>

      {/* ETFs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">ETF / Ticker</th>
                <th className="pb-3">Índice Subjacente</th>
                <th className="pb-3 text-right">Cotação</th>
                <th className="pb-3 text-right">Var. 24h</th>
                <th className="pb-3 text-right">Retorno 12M</th>
                <th className="pb-3 text-right">P/VP</th>
                <th className="pb-3 text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {etfs.map((asset) => {
                const isPositive = asset.change24h >= 0;
                return (
                  <tr key={asset.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{asset.ticker}</span>
                        {asset.badge && (
                          <Badge variant="cyan" className="text-[10px]">
                            {asset.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748b] font-sans block mt-0.5">
                        {asset.name}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-white">{asset.sector}</td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(asset.currentPrice)}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        isPositive ? "text-[#00f5a0]" : "text-[#ff3b5c]"
                      }`}
                    >
                      {formatPercent(asset.change24h)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatPercent(asset.change12m)}
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      {asset.pvp !== undefined ? `${asset.pvp.toFixed(2)}x` : "1.00x"}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Link
                        href={`/etfs/${asset.ticker}`}
                        className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors"
                      >
                        Detalhes ↗
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
  );
}
