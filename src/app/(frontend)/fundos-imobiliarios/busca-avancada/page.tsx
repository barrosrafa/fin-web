"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
    async (offset: number, limit: number, searchStr: string, _filter?: string, signal?: AbortSignal) => {
      return await getFIIRankingPaginated({
        signal,
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
    error, retry, windowStart, windowFull, nextWindow, previousWindow,
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
          <span className="badge-neon badge-neon-emerald"><CmsText>{"Screener de FIIs"}</CmsText></span>
          <span className="text-xs text-[#94a3b8]"><CmsText>{"Filtros por Mandato e Imóveis"}</CmsText></span>
          <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            <CmsText>{total > 0 ? `${total} Fundos Atendem aos Critérios` : "Filtro no Banco"}</CmsText>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Busca Avançada de Fundos Imobiliários"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Localize os melhores FIIs de tijolo, papel, logística e híbridos combinando taxas de retorno, desconto sobre o patrimônio e métricas de vacância."}</CmsText></p>
      </div>

      {/* Control Box */}
      <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.Card.1"><Card glow="emerald">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"Dividend Yield Mínimo"}</CmsText></span>
              <span className="text-[#00d9f5] font-mono"><CmsText>{minDY}</CmsText><CmsText>{"%"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.input.2"><input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={minDY}
              onChange={(e) => setMinDY(parseFloat(e.target.value))}
              className="w-full accent-[#00d9f5] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"P/VP Máximo"}</CmsText></span>
              <span className="text-white font-mono"><CmsText>{maxPVP.toFixed(2)}</CmsText><CmsText>{"x"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.input.3"><input
              type="range"
              min="0.5"
              max="1.5"
              step="0.02"
              value={maxPVP}
              onChange={(e) => setMaxPVP(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#94a3b8] mb-1">
              <span><CmsText>{"Vacância Física Máxima"}</CmsText></span>
              <span className="text-white font-mono"><CmsText>{maxVacancia}</CmsText><CmsText>{"%"}</CmsText></span>
            </div>
            <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.input.4"><input
              type="range"
              min="0"
              max="30"
              step="1"
              value={maxVacancia}
              onChange={(e) => setMaxVacancia(parseFloat(e.target.value))}
              className="w-full accent-[#ff3b69] cursor-pointer"
            /></CmsElement>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#94a3b8] block mb-1"><CmsText>{"Segmento / Mandato"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.select.5"><select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f5a0] cursor-pointer"
            >
              <option value="TODOS"><CmsText>{"Todos os Segmentos"}</CmsText></option>
              <option value="Logística"><CmsText>{"Logística / Galpões"}</CmsText></option>
              <option value="Papel"><CmsText>{"Papel / Títulos (CRI)"}</CmsText></option>
              <option value="Lajes"><CmsText>{"Lajes Corporativas"}</CmsText></option>
              <option value="Shopping"><CmsText>{"Shoppings"}</CmsText></option>
              <option value="Híbrido"><CmsText>{"Híbridos / FOF"}</CmsText></option>
            </select></CmsElement>
          </div>
        </div>

        {/* Search input in control box */}
        <div className="mt-4 pt-4 border-t border-white/5 relative">
          <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.input.6"><input
            type="text"
            placeholder="Buscar FII por ticker ou nome (ex: MXRF11, HGLG11, KNIP11)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00f5a0] transition-colors"
          /></CmsElement>
          <CmsText>{search && (
            <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.button.7"><button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-6 text-xs text-[#94a3b8] hover:text-white"
            ><CmsText>{"✕"}</CmsText></button></CmsElement>
          )}</CmsText>
        </div>
      </Card></CmsElement>

      {/* Table */}
      <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.Card.8"><Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            <CmsText>{loading ? "Filtrando FIIs no banco..." : `Exibindo ${fiis.length} de ${total} fundos encontrados`}</CmsText>
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
                <th className="py-3"><CmsText>{"Nome"}</CmsText></th>
                <th className="py-3"><CmsText>{"Segmento"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Preço"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"D.Y. (12M)"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"P/VP"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Vacância Física"}</CmsText></th>
                <th className="py-3 text-right pr-4 font-sans"><CmsText>{"Ação"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#94a3b8] font-sans animate-pulse"><CmsText>{"Filtrando FIIs no banco de dados em tempo real..."}</CmsText></td>
                </tr>
              ) : (
                fiis.map((f) => (
                  <tr key={f.ticker} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.Link.9"><Link href={`/fiis/${f.ticker}`} className="hover:text-[var(--positive)] transition-colors">
                        <CmsText>{f.ticker}</CmsText>
                      </Link></CmsElement>
                    </td>
                    <td className="py-3 font-sans text-white text-[11px]"><CmsText>{f.name}</CmsText></td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]"><CmsText>{f.segment}</CmsText></td>
                    <td className="py-3 text-right font-bold text-white"><CmsText>{formatCurrency(f.price)}</CmsText></td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]"><CmsText>{formatPercent(f.dy_12m, false)}</CmsText></td>
                    <td className="py-3 text-right font-bold text-white"><CmsText>{f.pvp.toFixed(2)}</CmsText></td>
                    <td className="py-3 text-right text-[#94a3b8]"><CmsText>{f.physical_vacancy_pct.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <CmsElement feature="ui.app/-frontend-/fundos-imobiliarios/busca-avancada/page.Link.10"><Link
                        href={`/fiis/${f.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      ><CmsText>{"Ver"}</CmsText></Link></CmsElement>
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
          count={fiis.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          error={error} onRetry={retry}
          windowStart={windowStart} windowFull={windowFull}
          onNextWindow={nextWindow} onPreviousWindow={previousWindow}
          entityName="FIIs filtrados"
          emptyMessage="Nenhum FII encontrado para os critérios selecionados."
        />
      </Card></CmsElement>
    </div>
  );
}
