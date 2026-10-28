"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { FIIDividendItem } from "@/lib/api";

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

  // Compute key dividend stats
  const lastDiv = dividends[0]?.value_per_share ?? 1.17;
  const totalPaid12m = dividends.slice(0, 12).reduce((acc, curr) => acc + curr.value_per_share, 0);
  const avgMonthly = dividends.length > 0 ? totalPaid12m / Math.min(12, dividends.length) : 1.11;
  const dy12m = currentPrice > 0 ? (totalPaid12m / currentPrice) * 100 : 8.85;

  const exportCsv = () => {
    const headers = "Tipo;Data Com;Data Pagamento;Valor por Cota;Yield %;Status\r\n";
    const rows = filtered
      .map(
        (d) =>
          `${d.type};${d.date_com};${d.date_payment};${d.value_per_share.toFixed(4)};${d.yield_pct.toFixed(2)}%;${d.status}`
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
    <Card glow="emerald" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00f5a0] font-bold">
              Histórico & Agenda de Proventos
            </span>
            <Badge variant="emerald">{dividends.length} Pagamentos Registrados</Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Pagamentos de Dividendos e Rendimentos {ticker}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Year selector */}
          <select
            value={filterYear}
            onChange={(e) => {
              setFilterYear(e.target.value);
              setVisibleCount(12);
            }}
            className="bg-[#131926] border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 font-mono focus:outline-none focus:border-[#00f5a0]"
          >
            <option value="ALL">Todos os Anos ({dividends.length})</option>
            {years.map((y) => (
              <option key={y} value={y}>
                Ano {y}
              </option>
            ))}
          </select>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={exportCsv}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors flex items-center gap-1.5"
            title="Baixar histórico completo em planilha CSV"
          >
            <span>📥 Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
            Último Rendimento
          </span>
          <div className="text-2xl font-black font-mono text-[#00f5a0] mt-1">
            {formatCurrency(lastDiv)}
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block">por cota</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
            Total Pago (Últimos 12M)
          </span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {formatCurrency(totalPaid12m)}
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block">acumulado 12 meses</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
            Dividend Yield (12M)
          </span>
          <div className="text-2xl font-black font-mono text-[#00f5a0] mt-1">
            {formatPercent(dy12m, false)}
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block">isento para PF</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
            Rendimento Médio Mensal
          </span>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {formatCurrency(avgMonthly)}
          </div>
          <span className="text-[11px] text-[#94a3b8] mt-0.5 block">frequência mensal</span>
        </div>
      </div>

      {/* Table */}
      {displayed.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94a3b8] bg-white/[0.01] rounded-2xl border border-white/5">
          Nenhum provento encontrado para o filtro selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Tipo</th>
                <th className="pb-3">Mês Ref.</th>
                <th className="pb-3">Data Com (Corte)</th>
                <th className="pb-3">Data Pagamento</th>
                <th className="pb-3 text-right">Valor / Cota</th>
                <th className="pb-3 text-right">Yield Mês</th>
                <th className="pb-3 text-right pr-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {displayed.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-2 font-bold text-white">
                    <Badge variant="cyan">{d.type}</Badge>
                  </td>
                  <td className="py-3 font-sans text-white font-medium">
                    {d.reference_month || d.date_com.slice(0, 7)}
                  </td>
                  <td className="py-3 font-mono text-[#94a3b8]">
                    {d.date_com ? new Date(d.date_com + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="py-3 font-mono font-bold text-white">
                    {d.date_payment ? new Date(d.date_payment + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="py-3 text-right font-black font-mono text-[#00f5a0] text-sm">
                    {formatCurrency(d.value_per_share)}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white">
                    {formatPercent(d.yield_pct, false)}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00f5a0]/10 text-[#00f5a0] border border-[#00f5a0]/20">
                      ● {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination / Expand */}
      {filtered.length > visibleCount && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
          <span className="text-[#64748b]">
            Exibindo <strong>{displayed.length}</strong> de <strong>{filtered.length}</strong> proventos
          </span>
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-[#131926] hover:bg-[#1b2336] text-[#00f5a0] border border-white/10 transition-colors"
          >
            Carregar Mais (+12 Meses) ↓
          </button>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
        <span>Fonte: B3 / Banco Escriturador • Dividendos creditados na conta da corretora</span>
        <span>Data habitual de anúncio: Último dia útil do mês</span>
      </div>
    </Card>
  );
}
