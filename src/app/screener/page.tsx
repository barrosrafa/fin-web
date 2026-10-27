"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { MOCK_ASSETS } from "@/data/mock/marketData";

export default function ScreenerPage() {
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState<string>("TODOS");
  const [minDY, setMinDY] = useState<number>(0);
  const [maxPVP, setMaxPVP] = useState<number>(5.0);
  const [sortField, setSortField] = useState<"dividendYield" | "currentPrice" | "pvp" | "change24h">("dividendYield");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter pipeline
  const filtered = MOCK_ASSETS.filter((a) => {
    const matchesSearch =
      a.ticker.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = assetType === "TODOS" || a.type === assetType;
    const matchesDY = a.dividendYield >= minDY;
    const matchesPVP = a.pvp !== undefined ? a.pvp <= maxPVP : true;

    return matchesSearch && matchesType && matchesDY && matchesPVP;
  }).sort((a, b) => {
    const valA = a[sortField] ?? 0;
    const valB = b[sortField] ?? 0;
    return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00f5a0]"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Tipo de Ativo
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
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
              <span className="text-[#00d9f5] font-mono">{minDY}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={minDY}
              onChange={(e) => setMinDY(parseFloat(e.target.value))}
              className="w-full accent-[#00d9f5]"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] uppercase font-bold text-[#64748b] mb-1">
              <span>P/VP Máximo</span>
              <span className="text-[#00f5a0] font-mono">{maxPVP.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={maxPVP}
              onChange={(e) => setMaxPVP(parseFloat(e.target.value))}
              className="w-full accent-[#00f5a0]"
            />
          </div>
        </div>
      </Card>

      {/* Results Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-[#94a3b8] font-mono">
            {filtered.length} ativos encontrados
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
                    {a.pvp ? a.pvp.toFixed(2) : "—"}
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
      </Card>
    </div>
  );
}
