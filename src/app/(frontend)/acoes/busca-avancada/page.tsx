"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
    async (offset: number, limit: number, searchStr: string, _filter?: string, signal?: AbortSignal) => {
      return await getStocksRankingPaginated({
        signal,
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
    error, retry, windowStart, windowFull, nextWindow, previousWindow,
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
          <span className="badge-neon badge-neon-violet"><CmsText>{"Super Screener Multi-Slider"}</CmsText></span>
          <span className="text-xs text-[#94a3b8]"><CmsText>{"Filtros Server-Side B3"}</CmsText></span>
          <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            <CmsText>{total > 0 ? `${total} Ações Atendem aos Critérios` : "Filtro no Banco"}</CmsText>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Busca Avançada de Ações"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Filtre oportunidades na bolsa através de ranges combinados de múltiplos de valuation, retorno sobre capital, dividend yield e eficiência de margem com execução server-side em todo o universo da B3."}</CmsText></p>
      </div>

      {/* Control Box: 6 Sliders + Sector */}
      <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.Card.1"><Card glow="violet">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"Dividend Yield Mínimo"}</CmsText></span>
              <span className="text-[#00d9f5] font-mono"><CmsText>{minDY}</CmsText><CmsText>{"%"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.2"><input
              type="range"
              min="0"
              max="20"
              step="0.5"
              value={minDY}
              onChange={(e) => setMinDY(parseFloat(e.target.value))}
              className="w-full accent-[#00d9f5] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"P/L Máximo"}</CmsText></span>
              <span className="text-white font-mono"><CmsText>{maxPL}</CmsText><CmsText>{"x"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.3"><input
              type="range"
              min="2"
              max="30"
              step="0.5"
              value={maxPL}
              onChange={(e) => setMaxPL(parseFloat(e.target.value))}
              className="w-full accent-[#a855f7] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"P/VP Máximo"}</CmsText></span>
              <span className="text-white font-mono"><CmsText>{maxPVP.toFixed(1)}</CmsText><CmsText>{"x"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.4"><input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={maxPVP}
              onChange={(e) => setMaxPVP(parseFloat(e.target.value))}
              className="w-full accent-[#a855f7] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"ROE Mínimo"}</CmsText></span>
              <span className="text-[var(--positive)] font-mono"><CmsText>{minROE}</CmsText><CmsText>{"%"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.5"><input
              type="range"
              min="0"
              max="35"
              step="1"
              value={minROE}
              onChange={(e) => setMinROE(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"ROIC Mínimo"}</CmsText></span>
              <span className="text-[var(--positive)] font-mono"><CmsText>{minROIC}</CmsText><CmsText>{"%"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.6"><input
              type="range"
              min="0"
              max="30"
              step="1"
              value={minROIC}
              onChange={(e) => setMinROIC(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"Margem Líquida Mínima"}</CmsText></span>
              <span className="text-white font-mono"><CmsText>{minMargem}</CmsText><CmsText>{"%"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.7"><input
              type="range"
              min="0"
              max="30"
              step="1"
              value={minMargem}
              onChange={(e) => setMinMargem(parseFloat(e.target.value))}
              className="w-full accent-white cursor-pointer"
            /></CmsElement>
          </div>

          <div className="sm:col-span-2">
            <label className="text-[11px] uppercase font-bold text-[#94a3b8] block mb-1"><CmsText>{"Filtrar por Setor Econômico"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.select.8"><select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7] cursor-pointer"
            >
              <CmsText>{sectorsList.map((sec) => (
                <option key={sec} value={sec}>
                  <CmsText>{sec === "TODOS" ? "Todos os Setores" : sec}</CmsText>
                </option>
              ))}</CmsText>
            </select></CmsElement>
          </div>
        </div>

        {/* Real-time search input */}
        <div className="mt-4 pt-4 border-t border-white/5 relative">
          <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.input.9"><input
            type="text"
            placeholder="Buscar ação por ticker ou nome (ex: PETR4, Vale, WEG)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00f5a0] transition-colors"
          /></CmsElement>
          <CmsText>{search && (
            <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.button.10"><button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-6 text-xs text-[#94a3b8] hover:text-white"
            ><CmsText>{"✕"}</CmsText></button></CmsElement>
          )}</CmsText>
        </div>
      </Card></CmsElement>

      {/* Results Table */}
      <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.Card.11"><Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            <CmsText>{loading ? "Filtrando universo de ativos..." : `Exibindo ${stocks.length} de ${total} ações encontradas`}</CmsText>
          </span>
          <CmsText>{hasMore && !loading && (
            <span className="text-xs text-[var(--positive)]"><CmsText>{"Role para carregar mais automaticamente ↓"}</CmsText></span>
          )}</CmsText>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4"><CmsText>{"Ticker"}</CmsText></th>
                <th className="py-3"><CmsText>{"Empresa"}</CmsText></th>
                <th className="py-3"><CmsText>{"Setor"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Preço"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"D.Y."}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"P/L"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"P/VP"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"ROE"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"ROIC"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Margem Líq."}</CmsText></th>
                <th className="py-3 text-right pr-4 font-sans"><CmsText>{"Ação"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#94a3b8] font-sans animate-pulse"><CmsText>{"Filtrando ações no Neon DB em tempo real..."}</CmsText></td>
                </tr>
              ) : (
                stocks.map((s) => (
                  <tr key={s.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.Link.12"><Link href={`/acoes/${s.ticker}`} className="hover:text-[var(--positive)] transition-colors">
                        <CmsText>{s.ticker}</CmsText>
                      </Link></CmsElement>
                    </td>
                    <td className="py-3 font-sans text-white text-[11px] truncate max-w-[130px]"><CmsText>{s.name}</CmsText></td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]"><CmsText>{s.sector}</CmsText></td>
                    <td className="py-3 text-right font-bold text-white"><CmsText>{formatCurrency(s.price)}</CmsText></td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]"><CmsText>{formatPercent(s.dy, false)}</CmsText></td>
                    <td className="py-3 text-right text-white"><CmsText>{s.pl !== null ? s.pl.toFixed(2) : "—"}</CmsText></td>
                    <td className="py-3 text-right text-white"><CmsText>{s.pvp !== null ? s.pvp.toFixed(2) : "—"}</CmsText></td>
                    <td className="py-3 text-right text-[var(--positive)] font-bold"><CmsText>{s.roe !== null ? formatPercent(s.roe, false) : "—"}</CmsText></td>
                    <td className="py-3 text-right text-[var(--positive)]"><CmsText>{s.roic !== null ? formatPercent(s.roic, false) : "—"}</CmsText></td>
                    <td className="py-3 text-right text-white"><CmsText>{s.margem_liquida !== null ? formatPercent(s.margem_liquida, false) : "—"}</CmsText></td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <CmsElement feature="ui.app/-frontend-/acoes/busca-avancada/page.Link.13"><Link
                        href={`/acoes/${s.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#a855f7] hover:text-white font-semibold transition-all"
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
          count={stocks.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          error={error} onRetry={retry}
          windowStart={windowStart} windowFull={windowFull}
          onNextWindow={nextWindow} onPreviousWindow={previousWindow}
          entityName="Ações filtradas"
          emptyMessage="Nenhuma ação encontrada para os filtros selecionados."
        />
      </Card></CmsElement>
    </div>
  );
}
