"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/ui/Sparkline";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent, formatMultiple } from "@/lib/formatters";
import { getAssetsPaginated, getMarketSectors, getMarketHighlights } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function FIIsPage() {
  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string, filterStr?: string, signal?: AbortSignal) => {
      return await getAssetsPaginated({
        signal,
        type: "FII",
        limit,
        offset,
        search: searchStr,
        subsector: filterStr === "TODOS" ? undefined : filterStr,
      });
    },
    []
  );

  const {
    items: fiis,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    filter: selectedSubsector,
    setFilter: setSelectedSubsector,
    sentinelRef,
    loadMore,
    error, retry, windowStart, windowFull, nextWindow, previousWindow,
  } = useInfiniteScroll<AssetSummary>({
    fetchPage,
    limit: 24,
    initialFilter: "TODOS",
  });

  const [subsectors, setSubsectors] = useState<string[]>(["TODOS"]);
  const [highlights, setHighlights] = useState<{
    highest_dy?: { ticker: string; dividendYield: number; name: string };
    lowest_pvp?: { ticker: string; pvp: number; name: string };
  }>({});

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [secs, high] = await Promise.all([
          getMarketSectors("FII"),
          getMarketHighlights("FII"),
        ]);
        if (secs.length > 0) setSubsectors(secs);
        if (high) setHighlights(high);
      } catch (err) {
        console.error("Failed to load FII metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  const highestDYFII = highlights.highest_dy ?? (fiis.length > 0 ? [...fiis].sort((a, b) => b.dividendYield - a.dividendYield)[0] : null);
  const lowestPvpFII = highlights.lowest_pvp ?? (fiis.length > 0 ? [...fiis].filter(f => (f.pvp ?? 0) > 0).sort((a, b) => (a.pvp ?? 999) - (b.pvp ?? 999))[0] : null);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald"><CmsText>{"Mercado Imobiliário B3"}</CmsText></span>
            <span className="text-xs text-[#94a3b8]"><CmsText>{"FIIs & Fiagros"}</CmsText></span>
            <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              <CmsText>{total > 0 ? `${total} Fundos no Banco` : "606 Fundos no Banco"}</CmsText>
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Fundos de Investimento Imobiliário (FIIs)"}</CmsText></h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Cockpit imobiliário com dados de ativos físicos SiiLA, radar de vacância física/financeira, Brick Score em 6 eixos e cronograma de contratos de locação."}</CmsText></p>
        </div>

        <Button href="/comparador" variant="cyan"><CmsText>{"Comparar FIIs"}</CmsText></Button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CmsElement feature="ui.app/-frontend-/fiis/page.MetricCard.1"><MetricCard
          title="Maior Rendimento Anualizado"
          value={highestDYFII ? `${highestDYFII.ticker} • ${formatPercent(highestDYFII.dividendYield, false)}` : "KEVE11 • 36,2%"}
          subtitle="Rendimentos isentos de IR para pessoa física"
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/fiis/page.MetricCard.2"><MetricCard
          title="Maior Desconto Patrimonial"
          value={lowestPvpFII ? `${lowestPvpFII.ticker} • ${formatMultiple(lowestPvpFII.pvp)}` : "HGLG11 • 0,91x"}
          subtitle="Desconto em relação ao valor patrimonial por cota"
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/fiis/page.MetricCard.3"><MetricCard
          title="Benchmark de Mercado"
          value="IFIX • 3.763 pts"
          subtitle="Índice de Fundos de Investimentos Imobiliários"
          glow="violet"
        /></CmsElement>
      </div>

      {/* Filters & Search */}
      <CmsElement feature="ui.app/-frontend-/fiis/page.Card.4"><Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <CmsElement feature="ui.app/-frontend-/fiis/page.input.5"><input
              id="fiis-search"
              name="search"
              aria-label="Buscar FIIs por ticker ou nome"
              type="text"
              placeholder="Buscar por ticker ou nome no banco em tempo real (ex: MXRF11, HGLG11, KNIP11)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#94a3b8] focus:outline-none focus:border-[#00f5a0] transition-colors"
            /></CmsElement>
            <CmsText>{search && (
              <CmsElement feature="ui.app/-frontend-/fiis/page.button.6"><button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-2 text-xs text-[#94a3b8] hover:text-white"
              ><CmsText>{"✕"}</CmsText></button></CmsElement>
            )}</CmsText>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <CmsText>{subsectors.map((sub) => (
              <CmsElement feature="ui.app/-frontend-/fiis/page.button.7" key={sub}><button
                key={sub}
                type="button"
                onClick={() => setSelectedSubsector(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubsector === sub
                    ? "bg-[#00f5a0] text-[#060709]"
                    : "bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10"
                }`}
              >
                <CmsText>{sub}</CmsText>
              </button></CmsElement>
            ))}</CmsText>
          </div>
        </div>

        {/* Counter feedback */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>
            <CmsText>{loading
              ? "Consultando banco de dados..."
              : `Exibindo ${fiis.length} de ${total} FIIs ${search ? `para "${search}"` : ""}`}</CmsText>
          </span>
          <CmsText>{hasMore && !loading && (
            <span className="text-[var(--positive)]"><CmsText>{"Role para carregar mais automaticamente ↓"}</CmsText></span>
          )}</CmsText>
        </div>
      </Card></CmsElement>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CmsText>{fiis.map((fii) => {
          const isPositive = fii.change24h >= 0;
          return (
            <CmsElement feature="ui.app/-frontend-/fiis/page.Card.8" key={fii.ticker}><Card key={fii.ticker} glow="emerald" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white tracking-tight">
                        <CmsText>{fii.ticker}</CmsText>
                      </span>
                      <CmsText>{fii.badge && (
                        <Badge variant="emerald" className="text-[10px]">
                          <CmsText>{fii.badge}</CmsText>
                        </Badge>
                      )}</CmsText>
                    </div>
                    <div className="text-xs text-[#94a3b8] font-medium truncate max-w-[220px]">
                      <CmsText>{fii.name}</CmsText>
                    </div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">
                      <CmsText>{fii.sector}</CmsText><CmsText>{" • "}</CmsText><CmsText>{fii.subsector}</CmsText>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">
                      <CmsText>{formatCurrency(fii.currentPrice)}</CmsText>
                    </div>
                    <div
                      className={`text-xs font-mono font-medium ${
                        isPositive ? "text-[var(--positive)]" : "text-[#ff3b5c]"
                      }`}
                    >
                      <CmsText>{formatPercent(fii.change24h)}</CmsText>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-[#131926] border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-semibold"><CmsText>{"D.Y. (12M)"}</CmsText></div>
                    <div className="text-xs font-bold font-mono text-[var(--positive)] mt-0.5">
                      <CmsText>{formatPercent(fii.dividendYield, false)}</CmsText>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-semibold"><CmsText>{"P/VP"}</CmsText></div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      <CmsText>{formatMultiple(fii.pvp)}</CmsText>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-semibold"><CmsText>{"Liquidez"}</CmsText></div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5"><CmsText>{"Alta B3"}</CmsText></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-[#94a3b8] mb-1 font-semibold flex justify-between">
                    <span><CmsText>{"Tendência 5D"}</CmsText></span>
                    <span className="font-mono text-white"><CmsText>{"12M: "}</CmsText><CmsText>{formatPercent(fii.change12m)}</CmsText>
                    </span>
                  </div>
                  <Sparkline
                    data={fii.sparkline && fii.sparkline.length > 0 ? fii.sparkline : [fii.currentPrice ?? 0, fii.currentPrice ?? 0]}
                    color={isPositive ? "#00f5a0" : "#ff3b5c"}
                    height={36}
                  />
                </div>
              </div>

              <Button
                href={`/fiis/${fii.ticker}`}
                variant="primary"
                className="w-full justify-center text-xs mt-2"
              ><CmsText>{"Inspecionar Imóveis & Brick Score ↗"}</CmsText></Button>
            </Card></CmsElement>
          );
        })}</CmsText>
      </div>

      {/* Infinite Scroll Footer / Loader / Sentinel */}
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
        entityName="FIIs"
        emptyMessage="Nenhum FII encontrado para os termos da busca."
      />
    </div>
  );
}
