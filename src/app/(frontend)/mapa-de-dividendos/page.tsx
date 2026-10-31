"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
  const [viewMode, setViewMode] = useState<"com" | "pagamento">("com");
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
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Sazonalidade Histórica"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Matriz 10 Anos B3 & EUA"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Mapa de Sazonalidade de Dividendos"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Visualização em matriz de calor da probabilidade e frequência histórica segregada por"}</CmsText><CmsText>{" "}</CmsText>
          <strong className="text-cyan-300"><CmsText>{"Data-Com (corte)"}</CmsText></strong><CmsText>{" e"}</CmsText><CmsText>{" "}</CmsText>
          <strong className="text-emerald-300"><CmsText>{"Data de Pagamento (crédito em conta)"}</CmsText></strong><CmsText>{"."}</CmsText></p>
      </div>

      {/* Controls: Mode & Month Filter */}
      <CmsElement feature="ui.app/-frontend-/mapa-de-dividendos/page.Card.1"><Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          <CmsElement feature="ui.app/-frontend-/mapa-de-dividendos/page.button.2"><button
            onClick={() => setViewMode("com")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "com"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                : "text-[#94a3b8] hover:text-white"
            }`}
          ><CmsText>{"📅 Data-Com (Corte)"}</CmsText></button></CmsElement>
          <CmsElement feature="ui.app/-frontend-/mapa-de-dividendos/page.button.3"><button
            onClick={() => setViewMode("pagamento")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "pagamento"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "text-[#94a3b8] hover:text-white"
            }`}
          ><CmsText>{"💰 Data de Pagamento (Crédito)"}</CmsText></button></CmsElement>
        </div>

        {/* Month Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#94a3b8] mr-1"><CmsText>{"Filtrar:"}</CmsText></span>
          <CmsElement feature="ui.app/-frontend-/mapa-de-dividendos/page.button.4"><button
            onClick={() => setSelectedMonth(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedMonth === null
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white"
            }`}
          ><CmsText>{"Todos"}</CmsText></button></CmsElement>
          <CmsText>{MONTHS.map((m, idx) => {
            const monthNum = idx + 1;
            const isActive = selectedMonth === monthNum;
            return (
              <CmsElement feature="ui.app/-frontend-/mapa-de-dividendos/page.button.5" key={m}><button
                key={m}
                onClick={() => setSelectedMonth(isActive ? null : monthNum)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-[#94a3b8] hover:text-white"
                }`}
              >
                <CmsText>{m}</CmsText>
              </button></CmsElement>
            );
          })}</CmsText>
        </div>
      </Card></CmsElement>

      {/* Heatmap Grid Table */}
      <CmsElement feature="ui.app/-frontend-/mapa-de-dividendos/page.Card.6"><Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6 min-w-[140px]"><CmsText>{"Ticker"}</CmsText></th>
                <th className="py-4 px-4 min-w-[100px]"><CmsText>{"Classe"}</CmsText></th>
                <CmsText>{MONTHS.map((m, idx) => (
                  <th
                    key={m}
                    className={`py-4 px-3 text-center min-w-[55px] ${
                      selectedMonth === idx + 1 ? "bg-cyan-500/10 text-cyan-400 font-bold" : ""
                    }`}
                  >
                    <CmsText>{m}</CmsText>
                  </th>
                ))}</CmsText>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-[#64748b]"><CmsText>{"Carregando matriz de sazonalidade..."}</CmsText></td>
                </tr>
              ) : mapData.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-[#64748b]"><CmsText>{"Nenhum ativo encontrado para o filtro de mês selecionado."}</CmsText></td>
                </tr>
              ) : (
                mapData.map((row) => {
                  const heatmapMap = new Map(
                    row.monthly_heatmap.map((h) => [h.month, h])
                  );
                  return (
                    <tr key={row.ticker} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-6 font-bold text-white">
                        <span className="font-mono text-cyan-400"><CmsText>{row.ticker}</CmsText></span>
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
                          <CmsText>{row.asset_type}</CmsText>
                        </Badge>
                      </td>
                      <CmsText>{MONTHS.map((_, idx) => {
                        const monthNum = idx + 1;
                        const item = heatmapMap.get(monthNum);
                        const comProb = item?.record_date_probability_pct || 0;
                        const pagProb = item?.payment_probability_pct || 0;
                        const prob = viewMode === "com" ? comProb : pagProb;
                        const isSelected = selectedMonth === monthNum;

                        let bgClass = "bg-white/[0.02] text-transparent";
                        if (viewMode === "com") {
                          if (prob >= 80) bgClass = "bg-cyan-500/40 text-cyan-200 font-bold";
                          else if (prob >= 50) bgClass = "bg-cyan-500/20 text-cyan-300";
                          else if (prob > 0) bgClass = "bg-cyan-500/10 text-cyan-400/80";
                        } else {
                          if (prob >= 80) bgClass = "bg-emerald-500/40 text-emerald-200 font-bold";
                          else if (prob >= 50) bgClass = "bg-emerald-500/20 text-emerald-300";
                          else if (prob > 0) bgClass = "bg-emerald-500/10 text-emerald-400/80";
                        }

                        const tooltip = item
                          ? `${row.ticker} em ${MONTHS[idx]}:\n• Data-Com (corte): ${comProb.toFixed(0)}%\n• Pagamento (crédito): ${pagProb.toFixed(0)}%\n• Valor Médio: R$ ${item.average_payout_per_unit.toFixed(2)}${item.last_payment_year ? ` (Último ano: ${item.last_payment_year})` : ""}`
                          : `${row.ticker} em ${MONTHS[idx]}: Sem histórico`;

                        return (
                          <td
                            key={monthNum}
                            className={`py-3 px-2 text-center font-mono text-xs ${
                              isSelected ? "ring-1 ring-cyan-500/50" : ""
                            }`}
                          >
                            <CmsElement><div
                              className={`mx-auto w-9 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${bgClass}`}
                              title={tooltip}
                            >
                              <CmsText>{prob > 0 ? `${prob.toFixed(0)}%` : "—"}</CmsText>
                            </div></CmsElement>
                          </td>
                        );
                      })}</CmsText>
                    </tr>
                  );
                })
              )}</CmsText>
            </tbody>
          </table>
        </div>
      </Card></CmsElement>
    </div>
  );
}
