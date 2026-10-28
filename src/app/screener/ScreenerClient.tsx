"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent, formatMultiple } from "@/lib/formatters";
import { getAssetsPaginated } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export function ScreenerClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  // Initialize state from URL search params
  const initialSearch = searchParams.get("q") ?? "";
  const initialType = searchParams.get("type") ?? "TODOS";
  const initialMinDY = searchParams.get("minDY") ? parseFloat(searchParams.get("minDY")!) : 0;
  const initialMaxPVP = searchParams.get("maxPVP") ? parseFloat(searchParams.get("maxPVP")!) : 5.0;
  const initialSort = (searchParams.get("sort") as "dividendYield" | "currentPrice" | "pvp" | "change24h") || "dividendYield";
  const initialOrder = searchParams.get("order") === "asc";

  const [assetType, setAssetType] = useState<string>(initialType);
  const [minDY, setMinDY] = useState<number>(initialMinDY);
  const [maxPVP, setMaxPVP] = useState<number>(initialMaxPVP);
  const [sortField, setSortField] = useState<"dividendYield" | "currentPrice" | "pvp" | "change24h">(initialSort);
  const [sortAsc, setSortAsc] = useState<boolean>(initialOrder);

  const fetchPage = useCallback(
    async (offset: number, limit: number, searchStr: string, filterStr?: string) => {
      const sortMap: Record<string, string> = {
        dividendYield: "dy",
        pvp: "pvp",
        currentPrice: "preco",
        change24h: "change24h",
      };
      return await getAssetsPaginated({
        type: filterStr === "TODOS" ? undefined : filterStr,
        limit,
        offset,
        search: searchStr,
        sortBy: sortMap[sortField] || "dy",
      });
    },
    [sortField]
  );

  const {
    items: assets,
    total,
    loading,
    loadingMore,
    hasMore,
    search,
    setSearch,
    debouncedSearch,
    filter,
    setFilter,
    sentinelRef,
    loadMore,
  } = useInfiniteScroll<AssetSummary>({
    fetchPage,
    limit: 50,
    initialSearch,
    initialFilter: initialType,
  });

  const updateUrlParams = useCallback(
    (updates: { q?: string; type?: string; minDY?: number; maxPVP?: number; sort?: string; order?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString());
      const q = updates.q !== undefined ? updates.q : search;
      const type = updates.type !== undefined ? updates.type : assetType;
      const dy = updates.minDY !== undefined ? updates.minDY : minDY;
      const pvp = updates.maxPVP !== undefined ? updates.maxPVP : maxPVP;
      const sort = updates.sort !== undefined ? updates.sort : sortField;
      const order = updates.order !== undefined ? updates.order : sortAsc;

      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");

      if (type !== "TODOS") params.set("type", type);
      else params.delete("type");

      if (dy > 0) params.set("minDY", dy.toString());
      else params.delete("minDY");

      if (pvp < 5.0) params.set("maxPVP", pvp.toString());
      else params.delete("maxPVP");

      if (sort !== "dividendYield") params.set("sort", sort);
      else params.delete("sort");

      if (order) params.set("order", "asc");
      else params.delete("order");

      startTransition(() => {
        const queryStr = params.toString();
        router.replace(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
      });
    },
    [search, assetType, minDY, maxPVP, sortField, sortAsc, pathname, router, searchParams]
  );

  // Filter pipeline for sliders
  const filtered = assets.filter((a) => {
    const matchesDY = a.dividendYield >= minDY;
    const matchesPVP = a.pvp !== undefined ? a.pvp <= maxPVP : true;
    return matchesDY && matchesPVP;
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateUrlParams({ q: value });
  };

  const handleTypeChange = (value: string) => {
    setAssetType(value);
    setFilter(value);
    updateUrlParams({ type: value });
  };

  const handleMinDYChange = (value: number) => {
    setMinDY(value);
    updateUrlParams({ minDY: value });
  };

  const handleMaxPVPChange = (value: number) => {
    setMaxPVP(value);
    updateUrlParams({ maxPVP: value });
  };

  const toggleSort = (field: typeof sortField) => {
    let nextAsc = false;
    if (sortField === field) {
      nextAsc = !sortAsc;
      setSortAsc(nextAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    updateUrlParams({ sort: field, order: nextAsc });
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">Fundamentus + Status Invest Engine</span>
          <span className="text-xs text-[#64748b]">Filtro Multiativo em Tempo Real</span>
          <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
            {total > 0 ? `${total} Ativos no Universo B3` : "Universo B3"}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Super Screener Universal
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Filtre e ordene centenas de ativos da bolsa em milissegundos com regras combinadas de valuation, proventos, endividamento e liquidez.
        </p>
      </div>

      {/* Filter Control Box */}
      <Card glow="cyan">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Buscar Ticker / Nome
            </label>
            <input
              type="text"
              placeholder="Ex: PETR4, HGLG11, MXRF11..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f5a0]"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Tipo de Ativo
            </label>
            <select
              value={assetType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f5a0] cursor-pointer"
            >
              <option value="TODOS">Todos os Ativos</option>
              <option value="ACAO">Ações</option>
              <option value="FII">Fundos Imobiliários</option>
              <option value="ETF">ETFs</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>Dividend Yield Mínimo</span>
              <span className="text-[#00d9f5] font-mono">{formatPercent(minDY, false)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={minDY}
              onChange={(e) => handleMinDYChange(parseFloat(e.target.value))}
              className="w-full accent-[#00d9f5] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>P/VP Máximo</span>
              <span className="text-[#00f5a0] font-mono">{formatMultiple(maxPVP, 1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={maxPVP}
              onChange={(e) => handleMaxPVPChange(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0] cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#94a3b8] font-mono">
            {loading ? "Consultando banco em tempo real..." : `Exibindo ${filtered.length} de ${total} ativos`}
          </span>
          <span className="text-xs text-[#64748b]">
            Clique nos cabeçalhos para ordenar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Ticker</th>
                <th className="pb-3">Tipo</th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort("currentPrice")}
                >
                  Preço {sortField === "currentPrice" && (sortAsc ? "↑" : "↓")}
                </th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort("change24h")}
                >
                  Var. 24h {sortField === "change24h" && (sortAsc ? "↑" : "↓")}
                </th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort("dividendYield")}
                >
                  D.Y. (12M) {sortField === "dividendYield" && (sortAsc ? "↑" : "↓")}
                </th>
                <th
                  className="pb-3 text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort("pvp")}
                >
                  P/VP {sortField === "pvp" && (sortAsc ? "↑" : "↓")}
                </th>
                <th className="pb-3 text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {filtered.map((a) => (
                <tr key={a.ticker} className="hover:bg-white/[0.02]">
                  <td className="py-3 pl-2 font-bold text-white font-sans">
                    <Link
                      href={
                        a.type === "FII"
                          ? `/fiis/${a.ticker}`
                          : a.type === "ETF"
                          ? `/etfs/${a.ticker}`
                          : `/acoes/${a.ticker}`
                      }
                      className="hover:text-[#00f5a0] transition-colors"
                    >
                      {a.ticker}
                    </Link>
                  </td>
                  <td className="py-3 font-sans">
                    <Badge variant="neutral">{a.type}</Badge>
                  </td>
                  <td className="py-3 text-right font-bold text-white">
                    {formatCurrency(a.currentPrice)}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-bold ${
                        a.change24h >= 0 ? "text-[#00f5a0]" : "text-[#ff3b69]"
                      }`}
                    >
                      {formatPercent(a.change24h)}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-[#00d9f5]">
                    {formatPercent(a.dividendYield, false)}
                  </td>
                  <td className="py-3 text-right text-white">
                    {formatMultiple(a.pvp)}
                  </td>
                  <td className="py-3 text-right pr-2 font-sans">
                    <Link
                      href={
                        a.type === "FII"
                          ? `/fiis/${a.ticker}`
                          : a.type === "ETF"
                          ? `/etfs/${a.ticker}`
                          : `/acoes/${a.ticker}`
                      }
                      className="text-[11px] px-2.5 py-1 rounded bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InfiniteScrollFooter
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          count={filtered.length}
          total={total}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          entityName="ativos"
          emptyMessage="Nenhum ativo correspondeu aos filtros aplicados."
        />
      </Card>
    </div>
  );
}
