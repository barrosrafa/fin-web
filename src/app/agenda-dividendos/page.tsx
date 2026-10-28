"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent, formatDividendUnit } from "@/lib/formatters";
import { getDetailedDividendCalendarPaginated, DividendCalendarDetailItem } from "@/lib/api";

export default function AgendaDividendosPage() {
  const [events, setEvents] = useState<DividendCalendarDetailItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "DIVIDENDO" | "JCP" | "RENDIMENTO">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "FUTURO" | "PAGO">("ALL");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDetailedDividendCalendarPaginated({
        limit: 100,
        offset: 0,
        eventType: filterType,
        status: filterStatus,
        ticker: search,
      });
      setEvents(res.items);
      setTotalCount(res.total);
    } catch (err) {
      console.error("Failed to load dividend calendar:", err);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(handler);
  }, [loadData]);

  const handleExportCSV = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const q = new URLSearchParams();
    if (filterType !== "ALL") q.set("event_type", filterType);
    if (filterStatus !== "ALL") q.set("status", filterStatus);
    if (search.trim()) q.set("ticker", search.trim().toUpperCase());
    window.open(`${apiUrl}/analytics/dividend-calendar/export?${q.toString()}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald">Tracking de Proventos</span>
            <span className="text-xs text-[#64748b]">Agenda B3 & Exterior</span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              {totalCount} Proventos Mapeados
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Agenda de Dividendos & JCP
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Acompanhe datas de corte (Data-Com), data-ex, liquidação financeira (Data de Pagamento),
            valores brutos/líquidos e status auditado em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            📥 Exportar CSV Oficial
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4">
        {/* Search */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <input
            type="text"
            placeholder="Buscar por Ticker (ex: PETR4, VALE3, MXRF11)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full lg:w-64"
          />
        </div>

        {/* Status Filter (Futuro vs Pago) */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          {(["ALL", "FUTURO", "PAGO"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              {st === "ALL" ? "Todos os Status" : st === "FUTURO" ? "🔮 A Pagar (Futuros)" : "✅ Pagos (Histórico)"}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {(["ALL", "DIVIDENDO", "JCP", "RENDIMENTO"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
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
                <th className="py-4 px-3">Tipo</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-3">Data-Com</th>
                <th className="py-4 px-3">Data-Ex</th>
                <th className="py-4 px-3">Pagamento</th>
                <th className="py-4 px-4 text-right">Valor Bruto</th>
                <th className="py-4 px-3 text-right">Alíquota IR</th>
                <th className="py-4 px-4 text-right">Valor Líquido</th>
                <th className="py-4 px-6 text-right">Yield Evento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b]">
                    Carregando agenda de proventos...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b]">
                    Nenhum provento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                events.map((item) => (
                  <tr key={item.id_provento} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      <Link href={`/acoes/${item.ticker}`} className="font-mono text-cyan-400 hover:underline">
                        {item.ticker}
                      </Link>
                    </td>
                    <td className="py-4 px-3">
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
                    <td className="py-4 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.status === "FUTURO"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse"
                            : "bg-white/5 text-[#94a3b8] border-white/10"
                        }`}
                      >
                        {item.status === "FUTURO" ? "A PAGAR" : "PAGO"}
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-xs">{item.data_com || "A definir"}</td>
                    <td className="py-4 px-3 font-mono text-xs text-[#94a3b8]">{item.data_ex || "—"}</td>
                    <td className="py-4 px-3 font-mono text-xs text-emerald-400">
                      {item.data_pagamento || "A definir"}
                    </td>
                    <td className="py-4 px-4 text-right font-mono">
                      {formatDividendUnit(item.valor_bruto)}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-xs text-[#94a3b8]">
                      {item.aliquota_ir_pct > 0 ? `${item.aliquota_ir_pct}%` : "Isento"}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      {formatDividendUnit(item.valor_liquido)}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-cyan-400 font-semibold">
                      {item.yield_evento_pct !== undefined ? formatPercent(item.yield_evento_pct) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <InfiniteScrollFooter
          loading={loading}
          loadingMore={false}
          hasMore={false}
          count={events.length}
          total={totalCount}
          sentinelRef={() => {}}
          entityName="proventos"
          emptyMessage="Nenhum provento encontrado para os filtros selecionados."
        />
      </Card>
    </div>
  );
}
