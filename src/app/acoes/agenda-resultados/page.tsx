"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getEarningsCalendar } from "@/lib/api";
import { EarningsCalendarRow } from "@/schemas/oceans14";

export default function AgendaResultadosPage() {
  const [events, setEvents] = useState<EarningsCalendarRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEarningsCalendar(50);
        setEvents(data);
      } catch (err) {
        console.error("Erro ao carregar agenda de resultados:", err);
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
          <span className="badge-neon badge-neon-violet">Calendário Corporativo</span>
          <span className="text-xs text-[#64748b]">Balanços CVM DFP / ITR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Agenda de Divulgação de Resultados
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Cronograma das datas e horários de publicação dos relatórios financeiros trimestrais, teleconferências e apresentações de resultados da B3.
        </p>
      </div>

      {/* Events Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            {loading ? "Carregando..." : `${events.length} divulgações agendadas`}
          </span>
          <span className="text-[11px] text-[#64748b]">Horários de Brasília</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4">Data Prevista</th>
                <th className="py-3">Ticker</th>
                <th className="py-3">Companhia</th>
                <th className="py-3">Período</th>
                <th className="py-3">Horário</th>
                <th className="py-3 text-center">Status</th>
                <th className="py-3 text-right pr-4">Acesso RI / Webcast</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] animate-pulse font-sans">
                    Consultando calendário de balanços CVM...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] font-sans">
                    Nenhuma divulgação agendada para o período.
                  </td>
                </tr>
              ) : (
                events.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-mono font-bold text-white">
                      {ev.data_prevista}
                    </td>
                    <td className="py-3 font-bold text-white">
                      <Link href={`/acoes/${ev.ticker}`} className="hover:text-[#00f5a0] transition-colors">
                        {ev.ticker}
                      </Link>
                    </td>
                    <td className="py-3 text-[#f0f4f8] text-[11px]">
                      {ev.nome_empresarial}
                    </td>
                    <td className="py-3 font-mono text-[#00d9f5] font-bold">
                      {ev.periodo_referencia} ({ev.tipo_documento})
                    </td>
                    <td className="py-3 text-white text-[11px]">
                      {ev.horario_previsto === "APOS_FECHAMENTO" ? (
                        <span className="text-[#a855f7] font-semibold">Após Fechamento</span>
                      ) : ev.horario_previsto === "ANTES_ABERTURA" ? (
                        <span className="text-[#00d9f5] font-semibold">Antes da Abertura</span>
                      ) : (
                        "Durante Pregão"
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={ev.status === "CONFIRMADO" ? "emerald" : "neutral"}>
                        {ev.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right pr-4">
                      {ev.link_webcast ? (
                        <a
                          href={ev.link_webcast}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] px-2.5 py-1 rounded bg-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7] hover:text-black font-semibold transition-all inline-block"
                        >
                          Webcast RI ↗
                        </a>
                      ) : (
                        <span className="text-[#64748b] text-[11px]">—</span>
                      )}
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
