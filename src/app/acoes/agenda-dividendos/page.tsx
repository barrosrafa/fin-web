"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getDividendCalendar, DividendCalendarItem } from "@/lib/api";

export default function AgendaDividendosPage() {
  const [dividends, setDividends] = useState<DividendCalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDividendCalendar(50);
        setDividends(data);
      } catch (err) {
        console.error("Erro ao carregar agenda de proventos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Proventos B3</span>
          <span className="text-xs text-[#64748b]">Agenda Unificada de Dividendos & JCP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Agenda de Dividendos e Rendimentos
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Acompanhe datas de corte (Data COM), datas de negociação ex-proventos e datas de pagamento de dividendos e JCP de todas as ações e FIIs da B3.
        </p>
      </div>

      {/* Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            {loading ? "Carregando..." : `${dividends.length} proventos programados`}
          </span>
          <span className="text-[11px] text-[#64748b]">Ordenado por Data COM</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4">Ticker</th>
                <th className="py-3">Tipo</th>
                <th className="py-3">Mês Ref</th>
                <th className="py-3">Data COM</th>
                <th className="py-3">Data Pagamento</th>
                <th className="py-3 text-right">Valor por Ação</th>
                <th className="py-3 text-right pr-4">Yield Imediato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] font-sans animate-pulse">
                    Consultando proventos anunciados e homologados...
                  </td>
                </tr>
              ) : dividends.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] font-sans">
                    Nenhum provento pendente encontrado.
                  </td>
                </tr>
              ) : (
                dividends.map((d) => (
                  <tr key={d.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <Link href={`/acoes/${d.assetTicker}`} className="hover:text-[#00f5a0] transition-colors">
                        {d.assetTicker}
                      </Link>
                    </td>
                    <td className="py-3 font-sans">
                      <Badge variant={d.type === "DIVIDENDO" ? "emerald" : d.type === "JCP" ? "cyan" : "violet"}>
                        {d.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-[#94a3b8] font-sans">{d.referenceMonth}</td>
                    <td className="py-3 text-white font-bold">{d.dateCom}</td>
                    <td className="py-3 text-[#00f5a0] font-bold">{d.paymentDate}</td>
                    <td className="py-3 text-right text-white font-bold">
                      {formatCurrency(d.valuePerShare)}
                    </td>
                    <td className="py-3 text-right pr-4 text-[#00d9f5] font-bold">
                      {formatPercent(d.yieldOnCostPct, false)}
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
