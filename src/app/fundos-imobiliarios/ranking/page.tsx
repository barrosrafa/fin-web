"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getFIIRankingPaginated } from "@/lib/api";
import { FIIRankingRow } from "@/schemas/oceans14";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function FIIRankingPage() {
  const [sortBy, setSortBy] = useState("dy");

  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string, filterStr?: string) => {
      return await getFIIRankingPaginated({
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
  } = useInfiniteScroll<FIIRankingRow>({
    fetchPage,
    limit: 50,
    initialFilter: sortBy,
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">FIIs & Real Estate</span>
          <span className="text-xs text-[#64748b]">Ranking Oceans14</span>
          <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            {total > 0 ? `${total} Fundos no Ranking` : "FIIs B3"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Ranking de Fundos Imobiliários (FIIs)
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Classificação de fundos imobiliários por Dividend Yield anualizado, desconto patrimonial (P/VP), vacância física e volume diário de negociação.
        </p>
      </div>

      {/* Preset Sort Buttons & Search */}
      <Card glow="emerald">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-[#64748b] mr-2">Ordenar por:</span>
            {[
              { id: "dy", label: "Maior Dividend Yield (12M)" },
              { id: "pvp", label: "Menor P/VP (Desconto)" },
              { id: "vacancia", label: "Menor Vacância Física" },
              { id: "liquidez", label: "Maior Liquidez Diária" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSortBy(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  sortBy === item.id
                    ? "bg-[#00f5a0] text-black shadow-[0_0_15px_rgba(0,245,160,0.4)]"
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
              className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00f5a0] transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2 text-xs text-[#64748b] hover:text-white"
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
            {loading ? "Consultando banco de dados..." : `Exibindo ${ranking.length} de ${total} fundos`}
          </span>
          {hasMore && !loading && (
            <span className="text-xs text-[#00f5a0]">Role para carregar mais automaticamente ↓</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4 w-12 text-center">Pos</th>
                <th className="py-3">Fundo (Ticker)</th>
                <th className="py-3">Segmento</th>
                <th className="py-3 text-right">Preço</th>
                <th className="py-3 text-right">D.Y. (12M)</th>
                <th className="py-3 text-right">P/VP</th>
                <th className="py-3 text-right">Vacância Física</th>
                <th className="py-3 text-right">Vacância Fin.</th>
                <th className="py-3 text-right">Patrimônio Líq</th>
                <th className="py-3 text-right pr-4 font-sans">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b] font-sans animate-pulse">
                    Consultando rankings de FIIs no banco de dados...
                  </td>
                </tr>
              ) : (
                ranking.map((row) => (
                  <tr key={row.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 text-center font-bold text-[#64748b]">
                      #{row.rank}
                    </td>
                    <td className="py-3 font-sans">
                      <Link href={`/fiis/${row.ticker}`} className="font-bold text-white hover:text-[#00f5a0] transition-colors">
                        {row.ticker}
                      </Link>
                      <span className="block text-[10px] text-[#64748b] truncate max-w-[130px]">
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-white text-[11px]">
                      {row.segment}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(row.price)}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">
                      {formatPercent(row.dy_12m, false)}
                    </td>
                    <td className="py-3 text-right text-white font-bold">
                      {row.pvp.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      {row.physical_vacancy_pct > 0 ? `${row.physical_vacancy_pct.toFixed(1)}%` : "0.0%"}
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      {row.financial_vacancy_pct > 0 ? `${row.financial_vacancy_pct.toFixed(1)}%` : "0.0%"}
                    </td>
                    <td className="py-3 text-right text-white">
                      R$ {(row.net_worth / 1_000_000_000).toFixed(2)} Bi
                    </td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <Link
                        href={`/fiis/${row.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      >
                        Ver FII
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
          entityName="FIIs no Ranking"
          emptyMessage="Nenhum FII encontrado no ranking."
        />
      </Card>
    </div>
  );
}
