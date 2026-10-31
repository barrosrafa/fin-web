"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent, formatDividendUnit } from "@/lib/formatters";
import { getDividendsPaginated, DividendCalendarItem } from "@/lib/api";

export default function AgendaDividendosPage() {
  const [dividends, setDividends] = useState<DividendCalendarItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "DIVIDENDO" | "JCP" | "RENDIMENTO">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "FUTURO" | "PAGO">("ALL");
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDividendsPaginated({
        limit: 100,
        offset: 0,
        eventType: filterType,
        status: filterStatus,
        ticker: search,
      });
      setDividends(res.items);
      setTotalCount(res.total);
    } catch (err) {
      console.error("Erro ao carregar agenda de proventos:", err);
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
    window.open(`/api/v1/market/dividends/export?${q.toString()}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald"><CmsText>{"Proventos B3"}</CmsText></span>
            <span className="text-xs text-[#64748b]"><CmsText>{"Agenda Unificada de Dividendos & JCP"}</CmsText></span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              <CmsText>{totalCount}</CmsText><CmsText>{" Proventos"}</CmsText></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Agenda de Dividendos e Rendimentos"}</CmsText></h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Acompanhe datas de corte (Data COM), datas de negociação ex-proventos e datas de pagamento de dividendos e JCP de todas as ações e FIIs da B3."}</CmsText></p>
        </div>

        <div>
          <Button variant="outline" onClick={handleExportCSV} className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"><CmsText>{"📥 Exportar CSV"}</CmsText></Button>
        </div>
      </div>

      {/* Controls */}
      <CmsElement feature="ui.app/-frontend-/acoes/agenda-dividendos/page.Card.1"><Card className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4">
        <CmsElement feature="ui.app/-frontend-/acoes/agenda-dividendos/page.input.2"><input
          type="text"
          placeholder="Filtrar ticker (ex: PETR4, VALE3)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full lg:w-64"
        /></CmsElement>

        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <CmsText>{(["ALL", "FUTURO", "PAGO"] as const).map((st) => (
            <CmsElement feature="ui.app/-frontend-/acoes/agenda-dividendos/page.button.3" key={st}><button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                  : "text-[#94a3b8] hover:text-white"
              }`}
            >
              <CmsText>{st === "ALL" ? "Todos os Status" : st === "FUTURO" ? "🔮 A Pagar" : "✅ Pagos"}</CmsText>
            </button></CmsElement>
          ))}</CmsText>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <CmsText>{(["ALL", "DIVIDENDO", "JCP", "RENDIMENTO"] as const).map((type) => (
            <CmsElement feature="ui.app/-frontend-/acoes/agenda-dividendos/page.button.4" key={type}><button
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
      <CmsElement feature="ui.app/-frontend-/acoes/agenda-dividendos/page.Card.5"><Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            <CmsText>{loading ? "Carregando..." : `${dividends.length} proventos listados (${totalCount} no total)`}</CmsText>
          </span>
          <span className="text-[11px] text-[#64748b]"><CmsText>{"Ordenado por Data COM / Pagamento"}</CmsText></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4"><CmsText>{"Ticker"}</CmsText></th>
                <th className="py-3"><CmsText>{"Tipo"}</CmsText></th>
                <th className="py-3"><CmsText>{"Status"}</CmsText></th>
                <th className="py-3"><CmsText>{"Mês Ref"}</CmsText></th>
                <th className="py-3"><CmsText>{"Data COM"}</CmsText></th>
                <th className="py-3"><CmsText>{"Data EX"}</CmsText></th>
                <th className="py-3"><CmsText>{"Data Pagamento"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Valor por Ação"}</CmsText></th>
                <th className="py-3 text-right pr-4"><CmsText>{"Yield Imediato"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b] font-sans animate-pulse"><CmsText>{"Consultando proventos anunciados e homologados..."}</CmsText></td>
                </tr>
              ) : dividends.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b] font-sans"><CmsText>{"Nenhum provento encontrado para os filtros selecionados."}</CmsText></td>
                </tr>
              ) : (
                dividends.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <CmsElement feature="ui.app/-frontend-/acoes/agenda-dividendos/page.Link.6"><Link href={`/acoes/${d.assetTicker}`} className="hover:text-[#00f5a0] transition-colors">
                        <CmsText>{d.assetTicker}</CmsText>
                      </Link></CmsElement>
                    </td>
                    <td className="py-3 font-sans">
                      <Badge variant={d.type === "DIVIDENDO" ? "emerald" : d.type === "JCP" ? "cyan" : "violet"}>
                        <CmsText>{d.type}</CmsText>
                      </Badge>
                    </td>
                    <td className="py-3 font-sans">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                          d.status === "FUTURO"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-white/5 text-[#94a3b8] border-white/10"
                        }`}
                      >
                        <CmsText>{d.status === "FUTURO" ? "A PAGAR" : "PAGO"}</CmsText>
                      </span>
                    </td>
                    <td className="py-3 text-[#94a3b8] font-sans"><CmsText>{d.referenceMonth}</CmsText></td>
                    <td className="py-3 text-white font-bold"><CmsText>{d.dateCom}</CmsText></td>
                    <td className="py-3 text-[#94a3b8]"><CmsText>{d.dateEx || "—"}</CmsText></td>
                    <td className="py-3 text-[#00f5a0] font-bold"><CmsText>{d.paymentDate}</CmsText></td>
                    <td className="py-3 text-right text-white font-bold">
                      <CmsText>{formatDividendUnit(d.valuePerShare)}</CmsText>
                    </td>
                    <td className="py-3 text-right pr-4 text-[#00d9f5] font-bold">
                      <CmsText>{formatPercent(d.yieldOnCostPct, false)}</CmsText>
                    </td>
                  </tr>
                ))
              )}</CmsText>
            </tbody>
          </table>
        </div>
      </Card></CmsElement>
    </div>
  );
}
