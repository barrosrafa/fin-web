"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getStocksRankingPaginated, getMarketSectors } from "@/lib/api";
import { StockRankingRow } from "@/schemas/oceans14";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function BuscaAvancadaPage() {
  // Sliders multi-critério
  const [minDY, setMinDY] = useState(6.0);
  const [maxPL, setMaxPL] = useState(15.0);
  const [maxPVP, setMaxPVP] = useState(2.5);
  const [minROE, setMinROE] = useState(10.0);
  const [minROIC, setMinROIC] = useState(8.0);
  const [minMargem, setMinMargem] = useState(5.0);
  const [sectorFilter, setSectorFilter] = useState("TODOS");
  const [sectorsList, setSectorsList] = useState<string[]>(["TODOS"]);

  useEffect(() => {
    async function loadSectors() {
      try {
        const secs = await getMarketSectors("ACAO");
        if (secs.length > 0) setSectorsList(secs);
      } catch (err) {
        console.error("Erro ao carregar setores:", err);
      }
    }
    loadSectors();
  }, []);

  const filterKey = `${minDY}-${maxPL}-${maxPVP}-${minROE}-${minROIC}-${minMargem}-${sectorFilter}`;

  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string) => {
      return await getStocksRankingPaginated({
        sortBy: "dy",
        limit,
        offset,
        search: searchStr,
        minDY,
        maxPL,
        maxPVP,
        minROE,
        minROIC,
        minMargem,
        sector: sectorFilter !== "TODOS" ? sectorFilter : undefined,
      });
    },
    [minDY, maxPL, maxPVP, minROE, minROIC, minMargem, sectorFilter]
  );

  const {
    items: stocks,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    sentinelRef,
    loadMore,
  } = useInfiniteScroll<StockRankingRow>({
    fetchPage,
    limit: 50,
    initialFilter: filterKey,
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-violet">Super Screener Multi-Slider</span>
          <span className="text-xs text-[#64748b]">Filtros Server-Side B3</span>
          <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            {total > 0 ? `${total} Ações Atendem aos Critérios` : "Filtro no Banco"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Busca Avançada de Ações
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Filtre oportunidades na bolsa através de ranges combinados de múltiplos de valuation, retorno sobre capital, dividend yield e eficiência de margem com execução server-side em todo o universo da B3.
        </p>
      </div>

      {/* Control Box: 6 Sliders + Sector */}
      <Card glow="violet">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>Dividend Yield Mínimo</span>
              <span className="text-[#00d9f5] font-mono">{minDY}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={minDY}
              onChange={(e) => setMinDY(parseFloat(e.target.value))}
              className="w-full accent-[#00d9f5] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>P/L Máximo</span>
              <span className="text-white font-mono">{maxPL}x</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="0.5"
              value={maxPL}
              onChange={(e) => setMaxPL(parseFloat(e.target.value))}
              className="w-full accent-[#a855f7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>P/VP Máximo</span>
              <span className="text-white font-mono">{maxPVP.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={maxPVP}
              onChange={(e) => setMaxPVP(parseFloat(e.target.value))}
              className="w-full accent-[#a855f7] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>ROE Mínimo</span>
              <span className="text-[#00f5a0] font-mono">{minROE}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              step="1"
              value={minROE}
              onChange={(e) => setMinROE(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>ROIC Mínimo</span>
              <span className="text-[#00f5a0] font-mono">{minROIC}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={minROIC}
              onChange={(e) => setMinROIC(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>Margem Líquida Mínima</span>
              <span className="text-white font-mono">{minMargem}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={minMargem}
              onChange={(e) => setMinMargem(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Filtrar por Setor Econômico
            </label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7] cursor-pointer"
            >
              {sectorsList.map((sec) => (
                <option key={sec} value={sec}>
                  {sec === "TODOS" ? "Todos os Setores" : sec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time search input */}
        <div className="mt-4 pt-4 border-t border-white/5 relative">
          <input
            type="text"
            placeholder="Buscar ação por ticker ou nome (ex: PETR4, Vale, WEG)..."
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

      {/* Results Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            {loading ? "Filtrando universo de ativos..." : `Exibindo ${stocks.length} de ${total} ações encontradas`}
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
                <th className="py-3">Empresa</th>
                <th className="py-3">Setor</th>
                <th className="py-3 text-right">Preço</th>
                <th className="py-3 text-right">D.Y.</th>
                <th className="py-3 text-right">P/L</th>
                <th className="py-3 text-right">P/VP</th>
                <th className="py-3 text-right">ROE</th>
                <th className="py-3 text-right">ROIC</th>
                <th className="py-3 text-right">Margem Líq.</th>
                <th className="py-3 text-right pr-4 font-sans">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#64748b] font-sans animate-pulse">
                    Filtrando ações no Neon DB em tempo real...
                  </td>
                </tr>
              ) : (
                stocks.map((s) => (
                  <tr key={s.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <Link href={`/acoes/${s.ticker}`} className="hover:text-[#00f5a0] transition-colors">
                        {s.ticker}
                      </Link>
                    </td>
                    <td className="py-3 font-sans text-white text-[11px] truncate max-w-[130px]">{s.name}</td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]">{s.sector}</td>
                    <td className="py-3 text-right font-bold text-white">{formatCurrency(s.price)}</td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">{formatPercent(s.dy, false)}</td>
                    <td className="py-3 text-right text-white">{s.pl !== null ? s.pl.toFixed(2) : "—"}</td>
                    <td className="py-3 text-right text-white">{s.pvp !== null ? s.pvp.toFixed(2) : "—"}</td>
                    <td className="py-3 text-right text-[#00f5a0] font-bold">{s.roe !== null ? formatPercent(s.roe, false) : "—"}</td>
                    <td className="py-3 text-right text-[#00f5a0]">{s.roic !== null ? formatPercent(s.roic, false) : "—"}</td>
                    <td className="py-3 text-right text-white">{s.margem_liquida !== null ? formatPercent(s.margem_liquida, false) : "—"}</td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <Link
                        href={`/acoes/${s.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#a855f7] hover:text-white font-semibold transition-all"
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
          count={stocks.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          entityName="Ações filtradas"
          emptyMessage="Nenhuma ação encontrada para os filtros selecionados."
        />
      </Card>
    </div>
  );
}
