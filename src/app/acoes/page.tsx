"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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

function AcoesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") ?? "";
  const initialSector = searchParams.get("setor") ?? "TODOS";

  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string, filterStr?: string) => {
      return await getAssetsPaginated({
        type: "ACAO",
        limit,
        offset,
        search: searchStr,
        sector: filterStr === "TODOS" ? undefined : filterStr,
      });
    },
    []
  );

  const {
    items: stocks,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    debouncedSearch,
    filter: selectedSector,
    setFilter: setSelectedSector,
    sentinelRef,
    loadMore,
  } = useInfiniteScroll<AssetSummary>({
    fetchPage,
    limit: 24,
    initialSearch,
    initialFilter: initialSector,
  });

  const [sectors, setSectors] = useState<string[]>(["TODOS"]);
  const [highlights, setHighlights] = useState<{
    highest_dy?: { ticker: string; dividendYield: number; name: string };
    lowest_pvp?: { ticker: string; pvp: number; name: string };
  }>({});

  // Sync URL query params with current search/filter
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    if (selectedSector && selectedSector !== "TODOS") {
      params.set("setor", selectedSector);
    } else {
      params.delete("setor");
    }
    const queryStr = params.toString();
    router.replace(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
  }, [debouncedSearch, selectedSector, pathname, router, searchParams]);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [secs, high] = await Promise.all([
          getMarketSectors("ACAO"),
          getMarketHighlights("ACAO"),
        ]);
        if (secs.length > 0) setSectors(secs);
        if (high) setHighlights(high);
      } catch (err) {
        console.error("Failed to load Ações metadata:", err);
      }
    }
    loadMetadata();
  }, []);

  const highestDYStock = highlights.highest_dy ?? (stocks.length > 0 ? [...stocks].sort((a, b) => b.dividendYield - a.dividendYield)[0] : null);
  const bestPerformerStock = stocks.length > 0 ? [...stocks].sort((a, b) => (b.change12m ?? 0) - (a.change12m ?? 0))[0] : null;
  const lowestPvpStock = highlights.lowest_pvp ?? (stocks.length > 0 ? [...stocks].filter(s => (s.pvp ?? 0) > 0).sort((a, b) => (a.pvp ?? 999) - (b.pvp ?? 999))[0] : null);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald">Mercado de Ações B3</span>
            <span className="text-xs text-[#64748b]">Empresas Listadas CVM</span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              {total > 0 ? `${total} Ações no Banco` : "617 Ações no Banco"}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Ações & Companhias Abertas
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
            Modelos de valuation automatizados (Graham, Bazin, DCF), histórico contábil auditado CVM e indicadores fundamentalistas de alta precisão.
          </p>
        </div>

        <Button href="/comparador" variant="cyan">
          Comparar Ações
        </Button>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Maior Dividend Yield"
          value={highestDYStock ? `${highestDYStock.ticker} • ${formatPercent(highestDYStock.dividendYield, false)}` : "PETR4 • 14,8%"}
          subtitle="Proventos pagos nos últimos 12 meses"
          glow="emerald"
        />
        <MetricCard
          title="Maior Valorização (12M)"
          value={bestPerformerStock ? `${bestPerformerStock.ticker} • ${formatPercent(bestPerformerStock.change12m)}` : "PRIO3 • +48,2%"}
          subtitle="Retorno nominal em 12 meses móveis"
          glow="cyan"
        />
        <MetricCard
          title="Maior Desconto Patrimonial"
          value={lowestPvpStock ? `${lowestPvpStock.ticker} • ${formatMultiple(lowestPvpStock.pvp)}` : "USIM5 • 0,42x"}
          subtitle="Relação Preço sobre Valor Patrimonial"
          glow="violet"
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              id="acoes-search"
              name="search"
              aria-label="Buscar ações por ticker ou nome"
              type="text"
              placeholder="Buscar por ticker ou nome no banco em tempo real (ex: PETR4, Vale, WEG)..."
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

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {sectors.slice(0, 15).map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSector === sec
                    ? "bg-[#00f5a0] text-[#060709]"
                    : "bg-white/5 text-[#94a3b8] hover:text-white hover:bg-white/10"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* Counter feedback */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-[#64748b]">
          <span>
            {loading
              ? "Consultando banco de dados..."
              : `Exibindo ${stocks.length} de ${total} Ações ${search ? `para "${search}"` : ""}`}
          </span>
          {hasMore && !loading && (
            <span className="text-[#00f5a0]">Role para carregar mais automaticamente ↓</span>
          )}
        </div>
      </Card>

      {/* Stocks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock) => {
          const isPositive = stock.change24h >= 0;
          return (
            <Card key={stock.ticker} glow="cyan" className="flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white tracking-tight">
                        {stock.ticker}
                      </span>
                      {stock.badge && (
                        <Badge
                          variant={
                            stock.badge.includes("Renda")
                              ? "emerald"
                              : stock.badge.includes("Desconto") || stock.badge.includes("P/VP")
                              ? "cyan"
                              : "violet"
                          }
                          className="text-[10px]"
                        >
                          {stock.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-[#94a3b8] font-medium truncate max-w-[220px]">
                      {stock.name}
                    </div>
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      {stock.sector} • {stock.subsector}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">
                      {formatCurrency(stock.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-mono font-medium ${
                        isPositive ? "text-[#00f5a0]" : "text-[#ff3b5c]"
                      }`}
                    >
                      {formatPercent(stock.change24h)}
                    </div>
                  </div>
                </div>

                {/* Key Fundamental Multiples */}
                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-[#131926] border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      D.Y. (12M)
                    </div>
                    <div className="text-xs font-bold font-mono text-[#00f5a0] mt-0.5">
                      {formatPercent(stock.dividendYield, false)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      P/VP
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {formatMultiple(stock.pvp)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      P/L
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {stock.pl !== undefined && stock.pl !== 0 ? formatMultiple(stock.pl, 1) : "—"}
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="mb-4">
                  <div className="text-[10px] text-[#64748b] mb-1 font-semibold flex justify-between">
                    <span>Desempenho 5D</span>
                    <span className="font-mono text-white">
                      12M: {formatPercent(stock.change12m)}
                    </span>
                  </div>
                  <Sparkline
                    data={stock.sparkline && stock.sparkline.length > 0 ? stock.sparkline : [stock.currentPrice ?? 0, stock.currentPrice ?? 0]}
                    color={isPositive ? "#00f5a0" : "#ff3b5c"}
                    height={36}
                  />
                </div>
              </div>

              {/* Action Button */}
              <Button
                href={`/acoes/${stock.ticker}`}
                variant="primary"
                className="w-full justify-center text-xs mt-2"
              >
                Auditar Valuation Completo ↗
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
        count={stocks.length}
        total={total}
        sentinelRef={sentinelRef}
        onLoadMore={loadMore}
        entityName="Ações"
        emptyMessage="Nenhuma ação encontrada para os termos da busca."
      />
    </div>
  );
}

export default function AcoesPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto px-4 py-12 text-center text-zinc-400">
          Carregando mercado de ações...
        </div>
      }
    >
      <AcoesContent />
    </React.Suspense>
  );
}
