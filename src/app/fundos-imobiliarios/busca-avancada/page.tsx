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

export default function FIIBuscaAvancadaPage() {
  // Filtros
  const [minDY, setMinDY] = useState(8.0);
  const [maxPVP, setMaxPVP] = useState(1.1);
  const [maxVacancia, setMaxVacancia] = useState(10.0);
  const [selectedSegment, setSelectedSegment] = useState("TODOS");

  const filterKey = `${minDY}-${maxPVP}-${maxVacancia}-${selectedSegment}`;

  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string) => {
      return await getFIIRankingPaginated({
        sortBy: "dy",
        limit,
        offset,
        search: searchStr,
        segment: selectedSegment === "TODOS" ? undefined : selectedSegment,
        minDY,
        maxPVP,
        maxVacancia,
      });
    },
    [minDY, maxPVP, maxVacancia, selectedSegment]
  );

  const {
    items: fiis,
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
    initialFilter: filterKey,
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Screener de FIIs</span>
          <span className="text-xs text-[#64748b]">Filtros por Mandato e Imóveis</span>
          <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            {total > 0 ? `${total} Fundos Atendem aos Critérios` : "Filtro no Banco"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Busca Avançada de Fundos Imobiliários
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Localize os melhores FIIs de tijolo, papel, logística e híbridos combinando taxas de retorno, desconto sobre o patrimônio e métricas de vacância.
        </p>
      </div>

      {/* Control Box */}
      <Card glow="emerald">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>Dividend Yield Mínimo</span>
              <span className="text-[#00d9f5] font-mono">{minDY}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={minDY}
              onChange={(e) => setMinDY(parseFloat(e.target.value))}
              className="w-full accent-[#00d9f5] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>P/VP Máximo</span>
              <span className="text-white font-mono">{maxPVP.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.02"
              value={maxPVP}
              onChange={(e) => setMaxPVP(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>Vacância Física Máxima</span>
              <span className="text-white font-mono">{maxVacancia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={maxVacancia}
              onChange={(e) => setMaxVacancia(parseFloat(e.target.value))}
              className="w-full accent-[#ff3b69] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Segmento / Mandato
            </label>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f5a0] cursor-pointer"
            >
              <option value="TODOS">Todos os Segmentos</option>
              <option value="Logística">Logística / Galpões</option>
              <option value="Papel">Papel / Títulos (CRI)</option>
              <option value="Lajes">Lajes Corporativas</option>
              <option value="Shopping">Shoppings</option>
              <option value="Híbrido">Híbridos / FOF</option>
            </select>
          </div>
        </div>

        {/* Search input in control box */}
        <div className="mt-4 pt-4 border-t border-white/5 relative">
          <input
            type="text"
            placeholder="Buscar FII por ticker ou nome (ex: MXRF11, HGLG11, KNIP11)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00f5a0] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-6 text-xs text-[#64748b] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            {loading ? "Filtrando FIIs no banco..." : `Exibindo ${fiis.length} de ${total} fundos encontrados`}
          </span>
          {hasMore && !loading && (
            <span className="text-xs text-[#00f5a0]">Role para carregar mais automaticamente ↓</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4">Ticker</th>
                <th className="py-3">Nome</th>
                <th className="py-3">Segmento</th>
                <th className="py-3 text-right">Preço</th>
                <th className="py-3 text-right">D.Y. (12M)</th>
                <th className="py-3 text-right">P/VP</th>
                <th className="py-3 text-right">Vacância Física</th>
                <th className="py-3 text-right pr-4 font-sans">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748b] font-sans animate-pulse">
                    Filtrando FIIs no banco de dados em tempo real...
                  </td>
                </tr>
              ) : (
                fiis.map((f) => (
                  <tr key={f.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <Link href={`/fiis/${f.ticker}`} className="hover:text-[#00f5a0] transition-colors">
                        {f.ticker}
                      </Link>
                    </td>
                    <td className="py-3 font-sans text-white text-[11px]">{f.name}</td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]">{f.segment}</td>
                    <td className="py-3 text-right font-bold text-white">{formatCurrency(f.price)}</td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">{formatPercent(f.dy_12m, false)}</td>
                    <td className="py-3 text-right font-bold text-white">{f.pvp.toFixed(2)}</td>
                    <td className="py-3 text-right text-[#94a3b8]">{f.physical_vacancy_pct.toFixed(1)}%</td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <Link
                        href={`/fiis/${f.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      >
                        Ver
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
          count={fiis.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          entityName="FIIs filtrados"
          emptyMessage="Nenhum FII encontrado para os critérios selecionados."
        />
      </Card>
    </div>
  );
}
