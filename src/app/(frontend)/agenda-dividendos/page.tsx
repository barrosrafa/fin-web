"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
    const q = new URLSearchParams();
    if (filterType !== "ALL") q.set("event_type", filterType);
    if (filterStatus !== "ALL") q.set("status", filterStatus);
    if (search.trim()) q.set("ticker", search.trim().toUpperCase());
    window.open(`/api/v1/analytics/dividend-calendar/export?${q.toString()}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald"><CmsText>{"Tracking de Proventos"}</CmsText></span>
            <span className="text-xs text-[#64748b]"><CmsText>{"Agenda B3 & Exterior"}</CmsText></span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              <CmsText>{totalCount}</CmsText><CmsText>{" Proventos Mapeados"}</CmsText></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Agenda de Dividendos & JCP"}</CmsText></h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Acompanhe datas de corte (Data-Com), data-ex, liquidação financeira (Data de Pagamento), valores brutos/líquidos e status auditado em tempo real."}</CmsText></p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"><CmsText>{"📥 Exportar CSV Oficial"}</CmsText></Button>
        </div>
      </div>

      {/* Filters Bar */}
      <CmsElement feature="ui.app/-frontend-/agenda-dividendos/page.Card.1"><Card className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4">
        {/* Search */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <CmsElement feature="ui.app/-frontend-/agenda-dividendos/page.input.2"><input
            type="text"
            placeholder="Buscar por Ticker (ex: PETR4, VALE3, MXRF11)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full lg:w-64"
          /></CmsElement>
        </div>

        {/* Status Filter (Futuro vs Pago) */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <CmsText>{(["ALL", "FUTURO", "PAGO"] as const).map((st) => (
            <CmsElement feature="ui.app/-frontend-/agenda-dividendos/page.button.3" key={st}><button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <CmsText>{st === "ALL" ? "Todos os Status" : st === "FUTURO" ? "🔮 A Pagar (Futuros)" : "✅ Pagos (Histórico)"}</CmsText>
            </button></CmsElement>
          ))}</CmsText>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <CmsText>{(["ALL", "DIVIDENDO", "JCP", "RENDIMENTO"] as const).map((type) => (
            <CmsElement feature="ui.app/-frontend-/agenda-dividendos/page.button.4" key={type}><button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === type
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white"
              }`}
            >
              <CmsText>{type === "ALL" ? "Todos os Tipos" : type}</CmsText>
            </button></CmsElement>
          ))}</CmsText>
        </div>
      </Card></CmsElement>

      {/* Table */}
      <CmsElement feature="ui.app/-frontend-/agenda-dividendos/page.Card.5"><Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6"><CmsText>{"Ativo"}</CmsText></th>
                <th className="py-4 px-3"><CmsText>{"Tipo"}</CmsText></th>
                <th className="py-4 px-3"><CmsText>{"Status"}</CmsText></th>
                <th className="py-4 px-3"><CmsText>{"Data-Com"}</CmsText></th>
                <th className="py-4 px-3"><CmsText>{"Data-Ex"}</CmsText></th>
                <th className="py-4 px-3"><CmsText>{"Pagamento"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"Valor Bruto"}</CmsText></th>
                <th className="py-4 px-3 text-right"><CmsText>{"Alíquota IR"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"Valor Líquido"}</CmsText></th>
                <th className="py-4 px-6 text-right"><CmsText>{"Yield Evento"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b]"><CmsText>{"Carregando agenda de proventos..."}</CmsText></td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b]"><CmsText>{"Nenhum provento encontrado para os filtros selecionados."}</CmsText></td>
                </tr>
              ) : (
                events.map((item) => (
                  <tr key={item.id_provento} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      <CmsElement feature="ui.app/-frontend-/agenda-dividendos/page.Link.6"><Link href={`/acoes/${item.ticker}`} className="font-mono text-cyan-400 hover:underline">
                        <CmsText>{item.ticker}</CmsText>
                      </Link></CmsElement>
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
                        <CmsText>{item.tipo}</CmsText>
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
                        <CmsText>{item.status === "FUTURO" ? "A PAGAR" : "PAGO"}</CmsText>
                      </span>
                    </td>
                    <td className="py-4 px-3 font-mono text-xs"><CmsText>{item.data_com || "A definir"}</CmsText></td>
                    <td className="py-4 px-3 font-mono text-xs text-[#94a3b8]"><CmsText>{item.data_ex || "—"}</CmsText></td>
                    <td className="py-4 px-3 font-mono text-xs text-emerald-400">
                      <CmsText>{item.data_pagamento || "A definir"}</CmsText>
                    </td>
                    <td className="py-4 px-4 text-right font-mono">
                      <CmsText>{formatDividendUnit(item.valor_bruto)}</CmsText>
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-xs text-[#94a3b8]">
                      <CmsText>{item.aliquota_ir_pct > 0 ? `${item.aliquota_ir_pct}%` : "Isento"}</CmsText>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      <CmsText>{formatDividendUnit(item.valor_liquido)}</CmsText>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-cyan-400 font-semibold">
                      <CmsText>{item.yield_evento_pct !== undefined ? formatPercent(item.yield_evento_pct) : "—"}</CmsText>
                    </td>
                  </tr>
                ))
              )}</CmsText>
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
      </Card></CmsElement>
    </div>
  );
}
