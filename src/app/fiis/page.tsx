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

export default function FIIsPage() {
  const [search, setSearch] = useState("");
  const [selectedSubsector, setSelectedSubsector] = useState("TODOS");

  const fiis = MOCK_ASSETS.filter((a) => a.type === "FII");
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
          title="FII de Maior Liquidez"
          value="MXRF11 • R$ 10,15"
          subtitle="Mais de 1 milhão de cotistas ativos"
          glow="cyan"
        />
        <MetricCard
          title="FII com Maior Desconto P/VP"
          value="KNIP11 • P/VP 0,98"
          subtitle="Carteira de CRIs IPCA+ com taxa média de 8,4%"
          glow="emerald"
        />
        <MetricCard
          title="Portfólio Logístico AAA"
          value="HGLG11 • R$ 164,20"
          subtitle="Vacância mínima de 4.1% e contratos atípicos"
          glow="violet"
        />
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por ticker ou nome (ex: HGLG11, KNIP11, Maxi Renda)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-full px-4 py-2 text-xs text-white placeholder-[#64748b] focus:outline-none focus:border-[#00f5a0] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {subsectors.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubsector(sub)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubsector === sub
                    ? "bg-white/10 text-[#00f5a0] border border-[rgba(0,245,160,0.3)] shadow-[0_0_12px_rgba(0,245,160,0.1)]"
                    : "bg-white/[0.02] text-[#64748b] hover:text-white border border-transparent"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* FIIs Ranking Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Fundo Imobiliário</th>
                <th className="pb-3">Segmento</th>
                <th className="pb-3 text-right">Cotação</th>
                <th className="pb-3 text-right">Var. 24h</th>
                <th className="pb-3 text-right">D.Y. (12M)</th>
                <th className="pb-3 text-right">P/VP</th>
                <th className="pb-3 text-right hidden md:table-cell">Patrimônio Líquido</th>
                <th className="pb-3 text-right pr-2">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {filtered.map((fii) => {
                const isPositive = fii.change24h >= 0;
                const pvpBelowOne = fii.pvp && fii.pvp < 1.0;

                return (
                  <tr key={fii.ticker} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3.5 pl-2">
                      <Link href={`/fiis/${fii.ticker}`} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white group-hover:border-[#00f5a0] transition-colors">
                          {fii.ticker.slice(0, 4)}
                        </div>
                        <div>
                          <span className="font-bold text-white group-hover:text-[#00f5a0] transition-colors block">
                            {fii.ticker}
                          </span>
                          <span className="text-[10px] text-[#64748b] truncate max-w-[150px] sm:max-w-[220px] block font-sans">
                            {fii.name}
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 font-sans text-[#94a3b8] text-xs">
                      {fii.subsector || fii.sector}
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {formatCurrency(fii.currentPrice)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          isPositive
                            ? "bg-[rgba(0,245,160,0.1)] text-[#00f5a0]"
                            : "bg-[rgba(255,59,105,0.1)] text-[#ff3b69]"
                        }`}
                      >
                        {formatPercent(fii.change24h)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#00d9f5]">
                      {formatPercent(fii.dividendYield, false)}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`font-bold ${
                          pvpBelowOne ? "text-[#00f5a0]" : "text-white"
                        }`}
                      >
                        {fii.pvp ? fii.pvp.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right text-[#94a3b8] hidden md:table-cell">
                      {fii.marketCap ? formatCurrency(fii.marketCap, true) : "—"}
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <Link
                        href={`/fiis/${fii.ticker}`}
                        className="text-[11px] px-3 py-1 rounded-full bg-white/5 hover:bg-[rgba(0,245,160,0.15)] hover:text-[#00f5a0] border border-white/10 transition-all font-medium inline-flex items-center gap-1 font-sans"
                      >
                        Cockpit
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
