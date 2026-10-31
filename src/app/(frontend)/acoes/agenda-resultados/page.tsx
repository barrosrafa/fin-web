"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
          <span className="badge-neon badge-neon-violet"><CmsText>{"Calendário Corporativo"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Balanços CVM DFP / ITR"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Agenda de Divulgação de Resultados"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Cronograma das datas e horários de publicação dos relatórios financeiros trimestrais, teleconferências e apresentações de resultados da B3."}</CmsText></p>
      </div>

      {/* Events Table */}
      <CmsElement feature="ui.app/-frontend-/acoes/agenda-resultados/page.Card.1"><Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            <CmsText>{loading ? "Carregando..." : `${events.length} divulgações agendadas`}</CmsText>
          </span>
          <span className="text-[11px] text-[#64748b]"><CmsText>{"Horários de Brasília"}</CmsText></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4"><CmsText>{"Data Prevista"}</CmsText></th>
                <th className="py-3"><CmsText>{"Ticker"}</CmsText></th>
                <th className="py-3"><CmsText>{"Companhia"}</CmsText></th>
                <th className="py-3"><CmsText>{"Período"}</CmsText></th>
                <th className="py-3"><CmsText>{"Horário"}</CmsText></th>
                <th className="py-3 text-center"><CmsText>{"Status"}</CmsText></th>
                <th className="py-3 text-right pr-4"><CmsText>{"Acesso RI / Webcast"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] animate-pulse font-sans"><CmsText>{"Consultando calendário de balanços CVM..."}</CmsText></td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] font-sans"><CmsText>{"Nenhuma divulgação agendada para o período."}</CmsText></td>
                </tr>
              ) : (
                events.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-4 font-mono font-bold text-white">
                      <CmsText>{ev.data_prevista}</CmsText>
                    </td>
                    <td className="py-3 font-bold text-white">
                      <CmsElement feature="ui.app/-frontend-/acoes/agenda-resultados/page.Link.2"><Link href={`/acoes/${ev.ticker}`} className="hover:text-[#00f5a0] transition-colors">
                        <CmsText>{ev.ticker}</CmsText>
                      </Link></CmsElement>
                    </td>
                    <td className="py-3 text-[#f0f4f8] text-[11px]">
                      <CmsText>{ev.nome_empresarial}</CmsText>
                    </td>
                    <td className="py-3 font-mono text-[#00d9f5] font-bold">
                      <CmsText>{ev.periodo_referencia}</CmsText><CmsText>{" ("}</CmsText><CmsText>{ev.tipo_documento}</CmsText><CmsText>{")"}</CmsText></td>
                    <td className="py-3 text-white text-[11px]">
                      <CmsText>{ev.horario_previsto === "APOS_FECHAMENTO" ? (
                        <span className="text-[#a855f7] font-semibold"><CmsText>{"Após Fechamento"}</CmsText></span>
                      ) : ev.horario_previsto === "ANTES_ABERTURA" ? (
                        <span className="text-[#00d9f5] font-semibold"><CmsText>{"Antes da Abertura"}</CmsText></span>
                      ) : (
                        "Durante Pregão"
                      )}</CmsText>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={ev.status === "CONFIRMADO" ? "emerald" : "neutral"}>
                        <CmsText>{ev.status}</CmsText>
                      </Badge>
                    </td>
                    <td className="py-3 text-right pr-4">
                      <CmsText>{ev.link_webcast ? (
                        <CmsElement feature="ui.app/-frontend-/acoes/agenda-resultados/page.a.3"><a
                          href={ev.link_webcast}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] px-2.5 py-1 rounded bg-[#a855f7]/20 text-[#a855f7] hover:bg-[#a855f7] hover:text-black font-semibold transition-all inline-block"
                        ><CmsText>{"Webcast RI ↗"}</CmsText></a></CmsElement>
                      ) : (
                        <span className="text-[#64748b] text-[11px]"><CmsText>{"—"}</CmsText></span>
                      )}</CmsText>
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
