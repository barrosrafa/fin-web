"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent, formatDividendUnit } from "@/lib/formatters";
import { getDetailedDividendCalendar, DividendCalendarDetailItem } from "@/lib/api";

export default function AgendaDividendosPage() {
  const [events, setEvents] = useState<DividendCalendarDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "DIVIDENDO" | "JCP" | "RENDIMENTO">("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getDetailedDividendCalendar(100);
        setEvents(data);
      } catch (err) {
        console.error("Failed to load dividend calendar:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = events.filter((ev) => {
    const matchesSearch = ev.ticker.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || ev.tipo.toUpperCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald">Tracking de Proventos</span>
            <span className="text-xs text-[#64748b]">Agenda B3 & Exterior</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Agenda de Dividendos & JCP
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Acompanhe datas de corte (Data-Com), datas de liquidação (Data de Pagamento),
            valores brutos e retenção tributária líquida para montar sua estratégia de renda passiva.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.print()}>
            Exportar Calendário
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por Ticker (ex: PETR4, VALE3)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "DIVIDENDO", "JCP", "RENDIMENTO"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterType === type
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white"
              }`}
            >
              {type === "ALL" ? "Todos os Tipos" : type}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Ativo</th>
                <th className="py-4 px-4">Tipo</th>
                <th className="py-4 px-4">Data-Com</th>
                <th className="py-4 px-4">Pagamento</th>
                <th className="py-4 px-4 text-right">Valor Bruto</th>
                <th className="py-4 px-4 text-right">Alíquota IR</th>
                <th className="py-4 px-4 text-right">Valor Líquido</th>
                <th className="py-4 px-6 text-right">Yield Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748b]">
                    Carregando agenda de proventos...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748b]">
                    Nenhum provento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id_provento} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      <span className="font-mono text-cyan-400">{item.ticker}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          item.tipo === "DIVIDENDO"
                            ? "emerald"
                            : item.tipo === "JCP"
                            ? "amber"
                            : "cyan"
                        }
                      >
                        {item.tipo}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs">{item.data_com || "A definir"}</td>
                    <td className="py-4 px-4 font-mono text-xs text-emerald-400">
                      {item.data_pagamento || "A definir"}
                    </td>
                    <td className="py-4 px-4 text-right font-mono">
                      {formatDividendUnit(item.valor_bruto)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs text-[#94a3b8]">
                      {item.aliquota_ir_pct > 0 ? `${item.aliquota_ir_pct}%` : "Isento"}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      {formatDividendUnit(item.valor_liquido)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-cyan-400 font-semibold">
                      {formatPercent(item.yield_evento_pct)}
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
