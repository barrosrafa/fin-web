"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPercent } from "@/lib/formatters";
import { getREITs, REITItem } from "@/lib/api";

export default function REITsPage() {
  const [reits, setREITs] = useState<REITItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getREITs();
        setREITs(data);
      } catch (err) {
        console.error("Failed to load REITs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = reits.filter((r) =>
    r.ticker.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.subtipo_reit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-indigo">Real Estate dos EUA</span>
            <span className="text-xs text-[#64748b]">Nareit Accounting & IRS 30%</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            REITs (Real Estate Investment Trusts)
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Catálogo especializado de Fundos Imobiliários norte-americanos com múltiplos Nareit
            (FFO, AFFO, P/FFO) e cálculo do Dividend Yield Líquido já descontados os 30% de imposto retido na fonte pelo IRS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por Ticker ou Subtipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* REITs Table */}
      <Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Ticker</th>
                <th className="py-4 px-4">Nome do REIT</th>
                <th className="py-4 px-4">Segmento</th>
                <th className="py-4 px-4 text-right">Preço (USD)</th>
                <th className="py-4 px-4 text-right">P/FFO</th>
                <th className="py-4 px-4 text-right">P/AFFO</th>
                <th className="py-4 px-4 text-right">Ocupação</th>
                <th className="py-4 px-4 text-right">DY Bruto USD</th>
                <th className="py-4 px-6 text-right">DY Líquido (-30%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b]">
                    Carregando REITs americanos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b]">
                    Nenhum REIT encontrado para a busca.
                  </td>
                </tr>
              ) : (
                filtered.map((reit) => (
                  <tr key={reit.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="font-mono text-cyan-400">{reit.ticker}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">{reit.name}</td>
                    <td className="py-4 px-4">
                      <Badge variant="indigo">{reit.subtipo_reit}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ${reit.price_usd.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-cyan-400">
                      {reit.p_ffo.toFixed(1)}x
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-amber-400">
                      {reit.p_affo.toFixed(1)}x
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[#94a3b8]">
                      {reit.occupancy_rate_pct.toFixed(1)}%
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[#94a3b8]">
                      {formatPercent(reit.gross_dy_pct)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">
                      {formatPercent(reit.net_dy_brl_pct)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
