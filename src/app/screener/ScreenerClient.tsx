"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent, formatMultiple } from "@/lib/formatters";
import { getAssets } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

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

  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [assetType, setAssetType] = useState<string>(initialType);
  const [minDY, setMinDY] = useState<number>(initialMinDY);
  const [maxPVP, setMaxPVP] = useState<number>(initialMaxPVP);
  const [sortField, setSortField] = useState<"dividendYield" | "currentPrice" | "pvp" | "change24h">(initialSort);
  const [sortAsc, setSortAsc] = useState<boolean>(initialOrder);

  // Sync state if URL changes externally (e.g. Back/Forward)
  useEffect(() => {
    const qParam = searchParams.get("q") ?? "";
    const typeParam = searchParams.get("type") ?? "TODOS";
    const minDYParam = searchParams.get("minDY") ? parseFloat(searchParams.get("minDY")!) : 0;
    const maxPVPParam = searchParams.get("maxPVP") ? parseFloat(searchParams.get("maxPVP")!) : 5.0;
    const sortParam = (searchParams.get("sort") as "dividendYield" | "currentPrice" | "pvp" | "change24h") || "dividendYield";
    const orderParam = searchParams.get("order") === "asc";

    if (qParam !== search) setSearch(qParam);
    if (typeParam !== assetType) setAssetType(typeParam);
    if (minDYParam !== minDY) setMinDY(minDYParam);
    if (maxPVPParam !== maxPVP) setMaxPVP(maxPVPParam);
    if (sortParam !== sortField) setSortField(sortParam);
    if (orderParam !== sortAsc) setSortAsc(orderParam);
  }, [searchParams]);

  // Sync state to URL search parameters
  const updateUrlParams = useCallback(
    (newParams: {
      q?: string;
      type?: string;
      minDY?: number;
      maxPVP?: number;
      sort?: string;
      order?: boolean;
    }) => {
      const q = newParams.q !== undefined ? newParams.q : search;
      const type = newParams.type !== undefined ? newParams.type : assetType;
      const dy = newParams.minDY !== undefined ? newParams.minDY : minDY;
      const pvp = newParams.maxPVP !== undefined ? newParams.maxPVP : maxPVP;
      const sort = newParams.sort !== undefined ? newParams.sort : sortField;
      const order = newParams.order !== undefined ? newParams.order : sortAsc;

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (type !== "TODOS") params.set("type", type);
      if (dy > 0) params.set("minDY", dy.toString());
      if (pvp < 5.0) params.set("maxPVP", pvp.toString());
      if (sort !== "dividendYield") params.set("sort", sort);
      if (order) params.set("order", "asc");

      startTransition(() => {
        const queryStr = params.toString();
        router.replace(queryStr ? `${pathname}?${queryStr}` : pathname, { scroll: false });
      });
    },
    [search, assetType, minDY, maxPVP, sortField, sortAsc, pathname, router]
  );

  useEffect(() => {
    async function load() {
      try {
        const data = await getAssets(undefined, 200);
        setAssets(data);
      } catch (err) {
        console.error("Failed to load screener assets:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter pipeline
  const filtered = assets
    .filter((a) => {
      const matchesSearch =
        a.ticker.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = assetType === "TODOS" || a.type === assetType;
      const matchesDY = a.dividendYield >= minDY;
      const matchesPVP = a.pvp !== undefined ? a.pvp <= maxPVP : true;

      return matchesSearch && matchesType && matchesDY && matchesPVP;
    })
    .sort((a, b) => {
      const valA = a[sortField] ?? 0;
      const valB = b[sortField] ?? 0;
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateUrlParams({ q: value });
  };

  const handleTypeChange = (value: string) => {
    setAssetType(value);
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
              placeholder="Ex: PETR4, HGLG11..."
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
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f5a0]"
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
              className="w-full accent-[#00d9f5]"
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
              className="w-full accent-[#00f5a0]"
            />
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#94a3b8] font-mono">
            {loading ? "Carregando ativos da API..." : `${filtered.length} ativos encontrados`}
          </span>
          <span className="text-xs text-[#64748b]">
            Clique nos cabeçalhos para ordenar
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#64748b] animate-pulse">
            Consultando cotações e múltiplos em tempo real no banco de dados...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748b]">
            Nenhum ativo correspondeu aos filtros aplicados.
          </div>
        ) : (
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
        )}
      </Card>
    </div>
  );
}
