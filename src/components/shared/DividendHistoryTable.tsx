"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent, formatDividendUnit } from "@/lib/formatters";
import { FIIDividendItem } from "@/lib/api";
import { dividendSummary } from "@/lib/dividend-summary";

export interface DividendHistoryTableProps {
  dividends?: FIIDividendItem[];
  ticker: string;
  currentPrice: number;
}

export function DividendHistoryTable({
  dividends = [],
  ticker,
  currentPrice,
}: DividendHistoryTableProps) {
  const [filterYear, setFilterYear] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Derive unique years from dividends
  const years = Array.from(
    new Set(
      dividends
        .map((d) => d.date_com?.slice(0, 4))
        .filter((y): y is string => Boolean(y))
    )
  ).sort((a, b) => b.localeCompare(a));

  const filtered = dividends.filter((d) => {
    if (filterYear === "ALL") return true;
    return d.date_com?.startsWith(filterYear);
  });

  const displayed = filtered.slice(0, visibleCount);

  const asOfDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const { lastDiv, totalPaid12m, avgMonthly, dy12m } = dividendSummary(dividends, currentPrice, asOfDay);

  const exportCsv = () => {
    const headers = "Tipo;Data Com;Data Pagamento;Valor por Cota;Yield %;Status\r\n";
    const rows = filtered
      .map(
        (d) =>
          `${d.type};${d.date_com};${d.date_payment};${d.value_per_share.toFixed(11)};${d.yield_pct.toFixed(2)}%;${d.status}`
      )
      .join("\r\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dividendos_${ticker}_historico.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CmsElement feature="ui.components/shared/DividendHistoryTable.Card.1"><Card glow="emerald" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00f5a0] font-bold"><CmsText>{"Histórico & Agenda de Proventos"}</CmsText></span>
            <Badge variant="emerald"><CmsText>{dividends.length}</CmsText><CmsText>{" Pagamentos Registrados"}</CmsText></Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight"><CmsText>{"Pagamentos de Dividendos e Rendimentos "}</CmsText><CmsText>{ticker}</CmsText>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <CmsElement feature="ui.components/shared/DividendHistoryTable.select.2"><select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setVisibleCount(12);
            }}
            className="bg-[#131926] border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-[#00f5a0]"
          >
            <option value="ALL"><CmsText>{"Todos os Anos ("}</CmsText><CmsText>{dividends.length}</CmsText><CmsText>{")"}</CmsText></option>
            <CmsText>{years.map((y) => (
              <option key={y} value={y}><CmsText>{"Ano "}</CmsText><CmsText>{y}</CmsText>
              </option>
            ))}</CmsText>
          </select></CmsElement>

          {/* Export CSV button */}
          <CmsElement feature="ui.components/shared/DividendHistoryTable.button.3"><button
            type="button"
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center gap-1.5"
            title="Baixar histórico completo em planilha CSV"
          >
            <span><CmsText>{"📥 Exportar CSV"}</CmsText></span>
          </button></CmsElement>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Último Rendimento"}</CmsText></span>
          <div className="text-2xl font-black font-mono text-[#00f5a0] mt-1">
            <CmsText>{formatDividendUnit(lastDiv)}</CmsText>
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"por cota"}</CmsText></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Total Pago (Últimos 12M)"}</CmsText></span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            <CmsText>{formatCurrency(totalPaid12m)}</CmsText>
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"acumulado 12 meses"}</CmsText></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Dividend Yield (12M)"}</CmsText></span>
          <div className="text-2xl font-black font-mono text-[#00f5a0] mt-1">
            <CmsText>{formatPercent(dy12m, false)}</CmsText>
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"isento para PF"}</CmsText></span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Rendimento Médio Mensal"}</CmsText></span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            <CmsText>{formatCurrency(avgMonthly)}</CmsText>
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"frequência mensal"}</CmsText></span>
        </div>
      </div>

      {/* Table */}
      <CmsText>{displayed.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94a3b8] bg-white/[0.01] rounded-2xl border border-white/5"><CmsText>{"Nenhum provento encontrado para o filtro selecionado."}</CmsText></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2"><CmsText>{"Tipo"}</CmsText></th>
                <th className="pb-3"><CmsText>{"Mês Ref."}</CmsText></th>
                <th className="pb-3"><CmsText>{"Data Com (Corte)"}</CmsText></th>
                <th className="pb-3"><CmsText>{"Data Pagamento"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Valor / Cota"}</CmsText></th>
                <th className="pb-3 text-right"><CmsText>{"Yield Mês"}</CmsText></th>
                <th className="pb-3 text-right pr-2"><CmsText>{"Status"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              <CmsText>{displayed.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-2 font-bold text-white">
                    <Badge variant="cyan"><CmsText>{d.type}</CmsText></Badge>
                  </td>
                  <td className="py-3 font-sans text-white font-medium">
                    <CmsText>{d.reference_month || d.date_com.slice(0, 7)}</CmsText>
                  </td>
                  <td className="py-3 font-mono text-[#94a3b8]">
                    <CmsText>{d.date_com ? new Date(d.date_com + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</CmsText>
                  </td>
                  <td className="py-3 font-mono font-bold text-white">
                    <CmsText>{d.date_payment ? new Date(d.date_payment + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</CmsText>
                  </td>
                  <td className="py-3 text-right font-black font-mono text-[#00f5a0] text-sm">
                    <CmsText>{formatDividendUnit(d.value_per_share)}</CmsText>
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white">
                    <CmsText>{formatPercent(d.yield_pct, false)}</CmsText>
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00f5a0]/10 text-[#00f5a0] border border-[#00f5a0]/20"><CmsText>{"● "}</CmsText><CmsText>{d.status}</CmsText>
                    </span>
                  </td>
                </tr>
              ))}</CmsText>
            </tbody>
          </table>
        </div>
      )}</CmsText>

      {/* Pagination / Expand */}
      <CmsText>{filtered.length > visibleCount && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#64748b]"><CmsText>{"Exibindo "}</CmsText><strong><CmsText>{displayed.length}</CmsText></strong><CmsText>{" de "}</CmsText><strong><CmsText>{filtered.length}</CmsText></strong><CmsText>{" proventos"}</CmsText></span>
          <CmsElement feature="ui.components/shared/DividendHistoryTable.button.4"><button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#131926] hover:bg-[#1b2336] text-[#00f5a0] border border-white/10 transition-colors"
          ><CmsText>{"Carregar Mais (+12 Meses) ↓"}</CmsText></button></CmsElement>
        </div>
      )}</CmsText>

      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
        <span><CmsText>{"Fonte: B3 / Banco Escriturador • Dividendos creditados na conta da corretora"}</CmsText></span>
        <span><CmsText>{"Data habitual de anúncio: Último dia útil do mês"}</CmsText></span>
      </div>
    </Card></CmsElement>
  );
}
