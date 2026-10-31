"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
          <span className="badge-neon badge-neon-emerald"><CmsText>{"ETFs Brasil Standard"}</CmsText></span>
          <span className="text-xs text-[#94a3b8]"><CmsText>{"Exchange Traded Funds"}</CmsText></span>
          <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            <CmsText>{total > 0 ? `${total} ETFs no Banco` : "ETFs B3"}</CmsText>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"ETFs Locais & Globais (Fundos de Índice)"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Análise de custo total efetivo (TER - primária e secundária), monitor de Spread NAV (ágio/deságio), liquidez de criação/destruição de cotas e replicação de índices."}</CmsText></p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CmsElement feature="ui.app/-frontend-/etfs/page.MetricCard.1"><MetricCard
          title="Menor Custo TER (B3)"
          value="BOVA11 • 0,30% a.a."
          subtitle="Taxa primária sem custos secundários"
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/etfs/page.MetricCard.2"><MetricCard
          title="Top Liquidez Internacional"
          value="IVVB11 • S&P 500"
          subtitle="Spread NAV médio inferior a 0,10%"
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/etfs/page.MetricCard.3"><MetricCard
          title="ETF Criptoativo Institucional"
          value="HASH11 • NCI Index"
          subtitle="Custódia física regulada em Cold Storage"
          glow="violet"
        /></CmsElement>
      </div>

      {/* Search Input */}
      <CmsElement feature="ui.app/-frontend-/etfs/page.Card.4"><Card>
        <div className="relative">
          <CmsElement feature="ui.app/-frontend-/etfs/page.input.5"><input
            id="etfs-search"
            name="search"
            aria-label="Buscar ETFs por ticker ou nome"
            type="text"
            placeholder="Buscar por ticker ou nome no banco em tempo real (ex: BOVA11, IVVB11, SMAL11)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00f5a0] transition-colors"
          /></CmsElement>
          <CmsText>{search && (
            <CmsElement feature="ui.app/-frontend-/etfs/page.button.6"><button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-2 text-xs text-[#94a3b8] hover:text-white"
            ><CmsText>{"✕"}</CmsText></button></CmsElement>
          )}</CmsText>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>
            <CmsText>{loading
              ? "Consultando banco de dados..."
              : `Exibindo ${etfs.length} de ${total} ETFs ${search ? `para "${search}"` : ""}`}</CmsText>
          </span>
          <CmsText>{hasMore && !loading && (
            <span className="text-[var(--positive)]"><CmsText>{"Role para carregar mais automaticamente ↓"}</CmsText></span>
          )}</CmsText>
        </div>
      </Card></CmsElement>

      {/* ETFs Table */}
      <CmsElement feature="ui.app/-frontend-/etfs/page.Card.7"><Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2"><CmsText>{"ETF / Ticker"}</CmsText></th>
                <th className="pb-3"><CmsText>{"Índice Subjacente"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Cotação"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Var. 24h"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Retorno 12M"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"P/VP"}</CmsText></th>
                <th className="pb-3 text-right pr-2"><CmsText>{"Ação"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              <CmsText>{etfs.map((asset) => {
                const isPositive = asset.change24h >= 0;
                return (
                  <tr key={asset.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs"><CmsText>{asset.ticker}</CmsText></span>
                        <CmsText>{asset.badge && (
                          <Badge variant="cyan" className="text-[10px]">
                            <CmsText>{asset.badge}</CmsText>
                          </Badge>
                        )}</CmsText>
                      </div>
                      <span className="text-[11px] text-[#94a3b8] font-sans block mt-0.5">
                        <CmsText>{asset.name}</CmsText>
                      </span>
                    </td>
                    <td className="py-3 font-sans text-white"><CmsText>{asset.sector}</CmsText></td>
                    <td className="py-3 text-right font-bold text-white">
                      <CmsText>{formatCurrency(asset.currentPrice)}</CmsText>
                    </td>
                    <td
                      className={`py-3 text-right font-bold ${
                        isPositive ? "text-[var(--positive)]" : "text-[#ff3b5c]"
                      }`}
                    >
                      <CmsText>{formatPercent(asset.change24h)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{formatPercent(asset.change12m)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      <CmsText>{formatMultiple(asset.pvp ?? 1.0)}</CmsText>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <CmsElement feature="ui.app/-frontend-/etfs/page.Link.8"><Link
                        href={`/etfs/${asset.ticker}`}
                        className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors"
                      ><CmsText>{"Detalhes ↗"}</CmsText></Link></CmsElement>
                    </td>
                  </tr>
                );
              })}</CmsText>
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
      </Card></CmsElement>
    </div>
  );
}
