"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getStocksRankingPaginated } from "@/lib/api";
import { StockRankingRow } from "@/schemas/oceans14";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function AcoesRankingPage() {
  const [sortBy, setSortBy] = useState("dy");

  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string, filterStr?: string, signal?: AbortSignal) => {
      return await getStocksRankingPaginated({
        signal,
        sortBy: filterStr || "dy",
        limit,
        offset,
        search: searchStr,
      });
    },
    []
  );

  const {
    items: ranking,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    sentinelRef,
    loadMore,
    error, retry, windowStart, windowFull, nextWindow, previousWindow,
  } = useInfiniteScroll<StockRankingRow>({
    fetchPage,
    limit: 50,
    initialFilter: sortBy,
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Oceans14 Standard"}</CmsText></span>
          <span className="text-xs text-[#94a3b8]"><CmsText>{"Ranking Quantitativo Dinâmico"}</CmsText></span>
          <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            <CmsText>{total > 0 ? `${total} Ações no Ranking` : "Ações B3"}</CmsText>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Ranking Fundamentalista de Ações"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Classificação automatizada de todas as companhias listadas na B3 por múltiplos de proventos, valuation, rentabilidade e margens."}</CmsText></p>
      </div>

      {/* Preset Buttons & Search */}
      <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.Card.1"><Card glow="cyan">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#94a3b8] mr-2"><CmsText>{"Ordenar por:"}</CmsText></span>
            <CmsText>{[
              { id: "dy", label: "Maior Dividend Yield" },
              { id: "pl", label: "Menor P/L" },
              { id: "pvp", label: "Menor P/VP" },
              { id: "roe", label: "Maior ROE" },
              { id: "roic", label: "Maior ROIC" },
              { id: "margem_liquida", label: "Maior Margem Líquida" },
            ].map((item) => (
              <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.button.2" key={item.id}><button
                key={item.id}
                onClick={() => setSortBy(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sortBy === item.id
                    ? "bg-[#00d9f5] text-black shadow-[0_0_15px_rgba(0,217,245,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              >
                <CmsText>{item.label}</CmsText>
              </button></CmsElement>
            ))}</CmsText>
          </div>

          <div className="relative w-full md:w-72">
            <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.input.3"><input
              type="text"
              placeholder="Buscar no ranking por ticker ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00f5a0] transition-colors"
            /></CmsElement>
            <CmsText>{search && (
              <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.button.4"><button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2 text-xs text-[#94a3b8] hover:text-white"
              ><CmsText>{"✕"}</CmsText></button></CmsElement>
            )}</CmsText>
          </div>
        </div>
      </Card></CmsElement>

      {/* Table */}
      <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.Card.5"><Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            <CmsText>{loading ? "Consultando banco de dados..." : `Exibindo ${ranking.length} de ${total} empresas`}</CmsText>
          </span>
          <CmsText>{hasMore && !loading && (
            <span className="text-xs text-[var(--positive)]"><CmsText>{"Role para carregar mais automaticamente ↓"}</CmsText></span>
          )}</CmsText>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4 w-12 text-center"><CmsText>{"Pos"}</CmsText></th>
                <th className="py-3"><CmsText>{"Ativo"}</CmsText></th>
                <th className="py-3"><CmsText>{"Setor"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Preço"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"D.Y. (12M)"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"P/L"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"P/VP"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"ROE"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"ROIC"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Margem Líq"}</CmsText></th>
                <th className="py-3 text-right pr-4"><CmsText>{"Ação"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#94a3b8] font-sans animate-pulse"><CmsText>{"Consultando rankings e indicadores fundamentalistas no Neon DB..."}</CmsText></td>
                </tr>
              ) : (
                ranking.map((row) => (
                  <tr key={row.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-4 text-center font-bold text-[#94a3b8]"><CmsText>{"#"}</CmsText><CmsText>{row.rank}</CmsText>
                    </td>
                    <td className="py-3 font-sans">
                      <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.Link.6"><Link href={`/acoes/${row.ticker}`} className="font-bold text-white hover:text-[var(--positive)] transition-colors">
                        <CmsText>{row.ticker}</CmsText>
                      </Link></CmsElement>
                      <span className="block text-[10px] text-[#94a3b8] truncate max-w-[140px] font-sans">
                        <CmsText>{row.name}</CmsText>
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]">
                      <CmsText>{row.sector}</CmsText>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      <CmsText>{formatCurrency(row.price)}</CmsText>
                    </td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">
                      <CmsText>{formatPercent(row.dy, false)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{row.pl !== null ? row.pl.toFixed(2) : "—"}</CmsText>
                    </td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{row.pvp !== null ? row.pvp.toFixed(2) : "—"}</CmsText>
                    </td>
                    <td className="py-3 text-right text-[var(--positive)] font-bold">
                      <CmsText>{row.roe !== null ? formatPercent(row.roe, false) : "—"}</CmsText>
                    </td>
                    <td className="py-3 text-right text-[var(--positive)]">
                      <CmsText>{row.roic !== null ? formatPercent(row.roic, false) : "—"}</CmsText>
                    </td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{row.margem_liquida !== null ? formatPercent(row.margem_liquida, false) : "—"}</CmsText>
                    </td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <CmsElement feature="ui.app/-frontend-/acoes/ranking/page.Link.7"><Link
                        href={`/acoes/${row.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      ><CmsText>{"Auditar"}</CmsText></Link></CmsElement>
                    </td>
                  </tr>
                ))
              )}</CmsText>
            </tbody>
          </table>
        </div>

        <InfiniteScrollFooter
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          count={ranking.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          error={error} onRetry={retry}
          windowStart={windowStart} windowFull={windowFull}
          onNextWindow={nextWindow} onPreviousWindow={previousWindow}
          entityName="Ações no Ranking"
          emptyMessage="Nenhuma ação encontrada no ranking."
        />
      </Card></CmsElement>
    </div>
  );
}
