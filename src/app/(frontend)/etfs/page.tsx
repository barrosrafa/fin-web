"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent, formatMultiple } from "@/lib/formatters";
import { getAssetsPaginated } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function ETFsPage() {
  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string, _filter?: string, signal?: AbortSignal) => {
      return await getAssetsPaginated({
        signal,
        type: "ETF",
        limit,
        offset,
        search: searchStr,
      });
    },
    []
  );

  const {
    items: etfs,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    sentinelRef,
    loadMore,
    error, retry, windowStart, windowFull, nextWindow, previousWindow,
  } = useInfiniteScroll<AssetSummary>({
    fetchPage,
    limit: 24,
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">ETFs Brasil Standard</span>
          <span className="text-xs text-[#94a3b8]">Exchange Traded Funds</span>
          <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            {total > 0 ? `${total} ETFs no Banco` : "ETFs B3"}
          </span>
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

      {/* Search Input */}
      <Card>
        <div className="relative">
          <input
            id="etfs-search"
            name="search"
            aria-label="Buscar ETFs por ticker ou nome"
            type="text"
            placeholder="Buscar por ticker ou nome no banco em tempo real (ex: BOVA11, IVVB11, SMAL11)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00f5a0] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2 text-xs text-[#94a3b8] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>
            {loading
              ? "Consultando banco de dados..."
              : `Exibindo ${etfs.length} de ${total} ETFs ${search ? `para "${search}"` : ""}`}
          </span>
          {hasMore && !loading && (
            <span className="text-[var(--positive)]">Role para carregar mais automaticamente ↓</span>
          )}
        </div>
      </Card>

      {/* ETFs Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
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
                      <span className="text-[11px] text-[#94a3b8] font-sans block mt-0.5">
                        {asset.name}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-white">{asset.sector}</td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(asset.currentPrice)}
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        isPositive ? "text-[var(--positive)]" : "text-[#ff3b5c]"
                      }`}
                    >
                      {formatPercent(asset.change24h)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatPercent(asset.change12m)}
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      {formatMultiple(asset.pvp ?? 1.0)}
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

        <InfiniteScrollFooter
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          count={etfs.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          error={error} onRetry={retry}
          windowStart={windowStart} windowFull={windowFull}
          onNextWindow={nextWindow} onPreviousWindow={previousWindow}
          entityName="ETFs"
          emptyMessage="Nenhum ETF encontrado para a busca."
        />
      </Card>
    </div>
  );
}
