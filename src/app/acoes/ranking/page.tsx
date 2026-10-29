"use client";

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
          <span className="badge-neon badge-neon-cyan">Oceans14 Standard</span>
          <span className="text-xs text-[#94a3b8]">Ranking Quantitativo Dinâmico</span>
          <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            {total > 0 ? `${total} Ações no Ranking` : "Ações B3"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Ranking Fundamentalista de Ações
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Classificação automatizada de todas as companhias listadas na B3 por múltiplos de proventos, valuation, rentabilidade e margens.
        </p>
      </div>

      {/* Preset Buttons & Search */}
      <Card glow="cyan">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#94a3b8] mr-2">Ordenar por:</span>
            {[
              { id: "dy", label: "Maior Dividend Yield" },
              { id: "pl", label: "Menor P/L" },
              { id: "pvp", label: "Menor P/VP" },
              { id: "roe", label: "Maior ROE" },
              { id: "roic", label: "Maior ROIC" },
              { id: "margem_liquida", label: "Maior Margem Líquida" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sortBy === item.id
                    ? "bg-[#00d9f5] text-black shadow-[0_0_15px_rgba(0,217,245,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar no ranking por ticker ou nome..."
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
        </div>
      </Card>

      {/* Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            {loading ? "Consultando banco de dados..." : `Exibindo ${ranking.length} de ${total} empresas`}
          </span>
          {hasMore && !loading && (
            <span className="text-xs text-[var(--positive)]">Role para carregar mais automaticamente ↓</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4 w-12 text-center">Pos</th>
                <th className="py-3">Ativo</th>
                <th className="py-3">Setor</th>
                <th className="py-3 text-right">Preço</th>
                <th className="py-3 text-right">D.Y. (12M)</th>
                <th className="py-3 text-right">P/L</th>
                <th className="py-3 text-right">P/VP</th>
                <th className="py-3 text-right">ROE</th>
                <th className="py-3 text-right">ROIC</th>
                <th className="py-3 text-right">Margem Líq</th>
                <th className="py-3 text-right pr-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#94a3b8] font-sans animate-pulse">
                    Consultando rankings e indicadores fundamentalistas no Neon DB...
                  </td>
                </tr>
              ) : (
                ranking.map((row) => (
                  <tr key={row.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-4 text-center font-bold text-[#94a3b8]">
                      #{row.rank}
                    </td>
                    <td className="py-3 font-sans">
                      <Link href={`/acoes/${row.ticker}`} className="font-bold text-white hover:text-[var(--positive)] transition-colors">
                        {row.ticker}
                      </Link>
                      <span className="block text-[10px] text-[#94a3b8] truncate max-w-[140px] font-sans">
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]">
                      {row.sector}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(row.price)}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">
                      {formatPercent(row.dy, false)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {row.pl !== null ? row.pl.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {row.pvp !== null ? row.pvp.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-[var(--positive)] font-bold">
                      {row.roe !== null ? formatPercent(row.roe, false) : "—"}
                    </td>
                    <td className="py-3 text-right text-[var(--positive)]">
                      {row.roic !== null ? formatPercent(row.roic, false) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {row.margem_liquida !== null ? formatPercent(row.margem_liquida, false) : "—"}
                    </td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <Link
                        href={`/acoes/${row.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      >
                        Auditar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
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
      </Card>
    </div>
  );
}
