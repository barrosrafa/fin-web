"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getAssets } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export default function AcoesPage() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("TODOS");
  const [stocks, setStocks] = useState<AssetSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAssets("ACAO");
        setStocks(res);
      } catch (err) {
        console.error("Failed to load stocks:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const sectors = ["TODOS", ...Array.from(new Set(stocks.map((s) => s.sector)))];

  const filtered = stocks.filter((stock) => {
    const matchesSearch =
      stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector =
      selectedSector === "TODOS" || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const highestDYStock = stocks.length > 0 ? [...stocks].sort((a, b) => b.dividendYield - a.dividendYield)[0] : null;
  const bestPerformerStock = stocks.length > 0 ? [...stocks].sort((a, b) => b.change12m - a.change12m)[0] : null;
  const lowestPvpStock = stocks.length > 0 ? [...stocks].filter(s => (s.pvp ?? 0) > 0).sort((a, b) => (a.pvp ?? 999) - (b.pvp ?? 999))[0] : null;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald">Mercado de Ações B3</span>
            <span className="text-xs text-[#64748b]">Empresas Listadas CVM</span>
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
          value={highestDYStock ? `${highestDYStock.ticker} • ${highestDYStock.dividendYield.toFixed(1)}%` : "PETR4 • 14,8%"}
          subtitle="Política de distribuição sustentada por caixa"
          glow="emerald"
        />
        <MetricCard
          title="Maior Retorno Anual (12M)"
          value={bestPerformerStock ? `${bestPerformerStock.ticker} • ${formatPercent(bestPerformerStock.change12m)}` : "WEGE3 • +42,1%"}
          subtitle="Crescimento contínuo e eficiência operacional"
          glow="cyan"
        />
        <MetricCard
          title="Maior Desconto P/VP"
          value={lowestPvpStock ? `${lowestPvpStock.ticker} • ${lowestPvpStock.pvp?.toFixed(2)}x` : "BBAS3 • 0,78x"}
          subtitle="Desconto em relação ao valor patrimonial contábil"
          glow="violet"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por ticker ou nome (ex: PETR4, Vale, WEG)..."
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
            {sectors.map((sec) => (
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
      </Card>

      {/* Stocks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((stock) => {
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
                      {stock.pvp !== undefined ? `${stock.pvp.toFixed(2)}x` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      P/L
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {stock.pl !== undefined && stock.pl !== 0 ? `${stock.pl.toFixed(1)}x` : "—"}
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
                    data={stock.sparkline && stock.sparkline.length > 0 ? stock.sparkline : [stock.currentPrice, stock.currentPrice]}
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
    </div>
  );
}
