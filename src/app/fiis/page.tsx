"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getAssets } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export default function FIIsPage() {
  const [search, setSearch] = useState("");
  const [selectedSubsector, setSelectedSubsector] = useState("TODOS");
  const [fiis, setFiis] = useState<AssetSummary[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getAssets("FII");
        setFiis(res);
      } catch (err) {
        console.error("Failed to load FIIs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const subsectors = [
    "TODOS",
    ...Array.from(new Set(fiis.map((f) => f.subsector || f.sector))),
  ];

  const filtered = fiis.filter((fii) => {
    const matchesSearch =
      fii.ticker.toLowerCase().includes(search.toLowerCase()) ||
      fii.name.toLowerCase().includes(search.toLowerCase());
    const matchesSub =
      selectedSubsector === "TODOS" ||
      (fii.subsector || fii.sector) === selectedSubsector;
    return matchesSearch && matchesSub;
  });

  const highestDYFII = fiis.length > 0 ? [...fiis].sort((a, b) => b.dividendYield - a.dividendYield)[0] : null;
  const lowestPvpFII = fiis.length > 0 ? [...fiis].filter(f => (f.pvp ?? 0) > 0).sort((a, b) => (a.pvp ?? 999) - (b.pvp ?? 999))[0] : null;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald">Mercado Imobiliário B3</span>
            <span className="text-xs text-[#64748b]">FIIs & Fiagros</span>
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
          value={highestDYFII ? `${highestDYFII.ticker} • ${highestDYFII.dividendYield.toFixed(1)}%` : "KNIP11 • 11,2%"}
          subtitle="Rendimentos isentos de IR para pessoa física"
          glow="emerald"
        />
        <MetricCard
          title="Maior Desconto Patrimonial"
          value={lowestPvpFII ? `${lowestPvpFII.ticker} • ${lowestPvpFII.pvp?.toFixed(2)}x` : "HGLG11 • 0,98x"}
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
              type="text"
              placeholder="Buscar por ticker ou nome (ex: HGLG11, KNIP11, MXRF11)..."
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
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fii) => {
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
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      {fii.sector} • {fii.subsector}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-white">
                      {formatCurrency(fii.currentPrice)}
                    </div>
                    <div
                      className={`text-xs font-mono font-medium ${
                        isPositive ? "text-[#00f5a0]" : "text-[#ff3b5c]"
                      }`}
                    >
                      {formatPercent(fii.change24h)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 my-4 p-3 rounded-xl bg-[#131926] border border-white/5 text-center">
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      D.Y. (12M)
                    </div>
                    <div className="text-xs font-bold font-mono text-[#00f5a0] mt-0.5">
                      {formatPercent(fii.dividendYield, false)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      P/VP
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {fii.pvp !== undefined ? `${fii.pvp.toFixed(2)}x` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                      Liquidez
                    </div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      Alta B3
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] text-[#64748b] mb-1 font-semibold flex justify-between">
                    <span>Tendência 5D</span>
                    <span className="font-mono text-white">
                      12M: {formatPercent(fii.change12m)}
                    </span>
                  </div>
                  <Sparkline
                    data={fii.sparkline && fii.sparkline.length > 0 ? fii.sparkline : [fii.currentPrice, fii.currentPrice]}
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
    </div>
  );
}
