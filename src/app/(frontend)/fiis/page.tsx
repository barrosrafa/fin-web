"use client";

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
            <span className="badge-neon badge-neon-emerald">Mercado Imobiliário B3</span>
            <span className="text-xs text-[#94a3b8]">FIIs & Fiagros</span>
            <span className="text-xs font-mono text-[var(--positive)] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              {total > 0 ? `${total} Fundos no Banco` : "606 Fundos no Banco"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Fundos de Investimento Imobiliário (FIIs)
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
            Cockpit imobiliário com dados de ativos físicos SiiLA, radar de vacância física/financeira, Brick Score em 6 eixos e cronograma de contratos de locação.
          </p>
        </div>

        <Button href="/comparador" variant="cyan">
          Comparar FIIs
        </Button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Maior Rendimento Anualizado"
          value={highestDYFII ? `${highestDYFII.ticker} • ${formatPercent(highestDYFII.dividendYield, false)}` : "KEVE11 • 36,2%"}
          subtitle="Rendimentos isentos de IR para pessoa física"
          glow="emerald"
        />
        <MetricCard
          title="Maior Desconto Patrimonial"
          value={lowestPvpFII ? `${lowestPvpFII.ticker} • ${formatMultiple(lowestPvpFII.pvp)}` : "HGLG11 • 0,91x"}
          subtitle="Desconto em relação ao valor patrimonial por cota"
          glow="cyan"
        />
        <MetricCard
          title="Benchmark de Mercado"
          value="IFIX • 3.763 pts"
          subtitle="Índice de Fundos de Investimentos Imobiliários"
          glow="violet"
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              id="fiis-search"
              name="search"
              aria-label="Buscar FIIs por ticker ou nome"
              type="text"
              placeholder="Buscar por ticker ou nome no banco em tempo real (ex: MXRF11, HGLG11, KNIP11)..."
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {subsectors.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubsector(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubsector === sub
                    ? "bg-[#00f5a0] text-[#060709]"
                    : "bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Counter feedback */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>
            {loading
              ? "Consultando banco de dados..."
              : `Exibindo ${fiis.length} de ${total} FIIs ${search ? `para "${search}"` : ""}`}
          </span>
          {hasMore && !loading && (
            <span className="text-[var(--positive)]">Role para carregar mais automaticamente ↓</span>
          )}
        </div>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fiis.map((fii) => {
          const isPositive = fii.change24h >= 0;
          return (
            <Card key={fii.ticker} glow="emerald" className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white tracking-tight">
                        {fii.ticker}
                      </span>
                      {fii.badge && (
                        <Badge variant="emerald" className="text-[10px]">
                          {fii.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#94a3b8] font-medium truncate max-w-[220px]">
                      {fii.name}
                    </div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">
                      {fii.sector} • {fii.subsector}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">
                      {formatCurrency(fii.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-mono font-medium ${
                        isPositive ? "text-[var(--positive)]" : "text-[#ff3b5c]"
                      }`}
                    >
                      {formatPercent(fii.change24h)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-[#131926] border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                      D.Y. (12M)
                    </div>
                    <div className="text-xs font-bold font-mono text-[var(--positive)] mt-0.5">
                      {formatPercent(fii.dividendYield, false)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                      P/VP
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {formatMultiple(fii.pvp)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-semibold">
                      Liquidez
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      Alta B3
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-[#94a3b8] mb-1 font-semibold flex justify-between">
                    <span>Tendência 5D</span>
                    <span className="font-mono text-white">
                      12M: {formatPercent(fii.change12m)}
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
              >
                Inspecionar Imóveis & Brick Score ↗
              </Button>
            </Card>
          );
        })}
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
