"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { MOCK_ASSETS } from "@/data/mock/marketData";

export default function AcoesPage() {
  const [search, setSearch] = useState("");
  const [selectedSector, setSelectedSector] = useState("TODOS");

  const stocks = MOCK_ASSETS.filter((a) => a.type === "ACAO");

  const sectors = ["TODOS", ...Array.from(new Set(stocks.map((s) => s.sector)))];

  const filtered = stocks.filter((stock) => {
    const matchesSearch =
      stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase());
    const matchesSector =
      selectedSector === "TODOS" || stock.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

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
          value="PETR4 • 14,8%"
          subtitle="Política de 45% do Fluxo de Caixa Livre"
          glow="emerald"
        />
        <MetricCard
          title="Maior Retorno Anual (12M)"
          value="WEGE3 • +42,1%"
          subtitle="Crescimento contínuo e ROE de 31%"
          glow="cyan"
        />
        <MetricCard
          title="Maior Desconto P/VP"
          value="BBAS3 • 0,78x"
          subtitle="22% abaixo do valor patrimonial"
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
                    ? "bg-white/10 text-[#00f5a0] border border-[rgba(0,245,160,0.3)] shadow-[0_0_12px_rgba(0,245,160,0.1)]"
                    : "bg-white/[0.02] text-[#64748b] hover:text-white border border-transparent"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((stock) => {
          const isPositive = stock.change24h >= 0;

          return (
            <Card key={stock.ticker} glow={isPositive ? "emerald" : "crimson"}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-[#00f5a0] text-sm">
                    {stock.ticker.slice(0, 4)}
                  </div>
                  <div>
                    <Link
                      href={`/acoes/${stock.ticker}`}
                      className="text-base font-bold text-white hover:text-[#00f5a0] transition-colors block"
                    >
                      {stock.ticker}
                    </Link>
                    <span className="text-xs text-[#64748b] line-clamp-1">
                      {stock.name}
                    </span>
                  </div>
                </div>

                {stock.badge && (
                  <Badge variant="cyan">{stock.badge}</Badge>
                )}
              </div>

              {/* Price & Sparkline */}
              <div className="flex items-baseline justify-between mb-4 pb-4 border-b border-white/5">
                <div>
                  <div className="text-2xl font-black text-white font-mono">
                    {formatCurrency(stock.currentPrice)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded font-mono ${
                        isPositive
                          ? "bg-[rgba(0,245,160,0.1)] text-[#00f5a0]"
                          : "bg-[rgba(255,59,105,0.1)] text-[#ff3b69]"
                      }`}
                    >
                      {formatPercent(stock.change24h)}
                    </span>
                    <span className="text-[11px] text-[#64748b]">hoje</span>
                  </div>
                </div>

                <Sparkline
                  data={stock.sparkline}
                  positive={isPositive}
                  width={90}
                  height={36}
                />
              </div>

              {/* Fundamental Multiples 3-col */}
              <div className="grid grid-cols-3 gap-2 mb-5 text-center">
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                    D.Y. (12M)
                  </div>
                  <div className="text-sm font-bold text-[#00d9f5] font-mono mt-0.5">
                    {formatPercent(stock.dividendYield, false)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                    P/L
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {stock.pl ? stock.pl.toFixed(1) : "—"}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                    P/VP
                  </div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {stock.pvp ? stock.pvp.toFixed(2) : "—"}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                href={`/acoes/${stock.ticker}`}
                variant="primary"
                className="w-full justify-between"
              >
                Análise Detalhada & DRE
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
