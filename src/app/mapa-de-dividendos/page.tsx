"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDividendMap, DividendMapEntry } from "@/lib/api";

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

export default function MapaDividendosPage() {
  const [mapData, setMapData] = useState<DividendMapEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDividendMap(selectedMonth || undefined);
        setMapData(data);
      } catch (err) {
        console.error("Failed to load dividend map:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedMonth]);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">Sazonalidade Histórica</span>
          <span className="text-xs text-[#64748b]">Matriz 10 Anos B3 & EUA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Mapa de Dividendos
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Visualização em matriz de calor da frequência e probabilidade histórica de anúncio e corte
          de proventos (Data-Com) para cada mês do ano. Descubra quais empresas pagam em cada mês.
        </p>
      </div>

      {/* Month Filter Selector */}
      <Card className="flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold text-[#94a3b8] mr-2">Filtrar por Mês:</span>
        <button
          onClick={() => setSelectedMonth(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            selectedMonth === null
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "bg-white/5 text-[#94a3b8] hover:text-white"
          }`}
        >
          Todos os Meses (Heatmap)
        </button>
        {MONTHS.map((m, idx) => {
          const monthNum = idx + 1;
          const isActive = selectedMonth === monthNum;
          return (
            <button
              key={m}
              onClick={() => setSelectedMonth(isActive ? null : monthNum)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white"
              }`}
            >
              {m}
            </button>
          );
        })}
      </Card>

      {/* Heatmap Grid Table */}
      <Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6 min-w-[140px]">Ticker</th>
                <th className="py-4 px-4 min-w-[100px]">Classe</th>
                {MONTHS.map((m, idx) => (
                  <th
                    key={m}
                    className={`py-4 px-3 text-center min-w-[55px] ${
                      selectedMonth === idx + 1 ? "bg-cyan-500/10 text-cyan-400 font-bold" : ""
                    }`}
                  >
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-[#64748b]">
                    Carregando matriz de sazonalidade...
                  </td>
                </tr>
              ) : mapData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-[#64748b]">
                    Nenhum ativo encontrado para o filtro de mês selecionado.
                  </td>
                </tr>
              ) : (
                mapData.map((row) => {
                  const heatmapMap = new Map(
                    row.monthly_heatmap.map((h) => [h.month, h.record_date_probability_pct])
                  );
                  return (
                    <tr key={row.ticker} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6 font-bold text-white">
                        <span className="font-mono text-cyan-400">{row.ticker}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            row.asset_type === "FII"
                              ? "emerald"
                              : row.asset_type === "REIT"
                              ? "indigo"
                              : "cyan"
                          }
                        >
                          {row.asset_type}
                        </Badge>
                      </td>
                      {MONTHS.map((_, idx) => {
                        const monthNum = idx + 1;
                        const prob = heatmapMap.get(monthNum) || 0;
                        const isSelected = selectedMonth === monthNum;

                        let bgClass = "bg-white/[0.02] text-transparent";
                        if (prob >= 80) bgClass = "bg-emerald-500/40 text-emerald-300 font-bold";
                        else if (prob >= 50) bgClass = "bg-emerald-500/20 text-emerald-400";
                        else if (prob > 0) bgClass = "bg-cyan-500/10 text-cyan-400/80";

                        return (
                          <td
                            key={monthNum}
                            className={`py-3 px-2 text-center font-mono text-xs ${
                              isSelected ? "ring-1 ring-cyan-500/50" : ""
                            }`}
                          >
                            <div
                              className={`mx-auto w-9 h-8 rounded-lg flex items-center justify-center transition-all ${bgClass}`}
                              title={`${row.ticker} em ${MONTHS[idx]}: ${prob}% probabilidade`}
                            >
                              {prob > 0 ? `${prob.toFixed(0)}%` : "—"}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
