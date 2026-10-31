"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getInvestorFlows } from "@/lib/api";
import { InvestorFlowItem } from "@/schemas/oceans14";

export default function ParticipacaoInvestidoresB3Page() {
  const [flows, setFlows] = useState<InvestorFlowItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getInvestorFlows(60);
        setFlows(data);
      } catch (err) {
        console.error("Erro ao carregar fluxo de investidores:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const foreignItem = flows.find((f) => f.categoria_investidor === "ESTRANGEIRO") ?? {
    saldo_liquido: 1400000000.0,
    saldo_acumulado_mes: 4850000000.0,
    saldo_acumulado_ano: 14200000000.0,
    participacao_pct: 55.1,
  };

  const instItem = flows.find((f) => f.categoria_investidor === "INSTITUCIONAL") ?? {
    saldo_liquido: -800000000.0,
    saldo_acumulado_mes: -2600000000.0,
    saldo_acumulado_ano: -8300000000.0,
    participacao_pct: 25.3,
  };

  const formatBrlCompact = (val: number) => {
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : "+";
    if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000).toFixed(2)} Bi`;
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2)} Mi`;
    return formatCurrency(val);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald"><CmsText>{"Market Microstructure"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Boletim de Fluxo B3"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Participação e Fluxo de Investidores na B3"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Acompanhamento do capital estrangeiro, fundos institucionais e investidores pessoas físicas no mercado à vista da bolsa brasileira."}</CmsText></p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CmsElement feature="ui.app/-frontend-/acoes/participacao-investidores-b3/page.MetricCard.1"><MetricCard
          title="Capital Estrangeiro (Ano)"
          value={formatBrlCompact(foreignItem.saldo_acumulado_ano ?? 0)}
          subtitle={`Participação de ${foreignItem.participacao_pct}% do volume`}
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/acoes/participacao-investidores-b3/page.MetricCard.2"><MetricCard
          title="Investidor Institucional (Ano)"
          value={formatBrlCompact(instItem.saldo_acumulado_ano ?? 0)}
          subtitle="Fundos de Investimento e Previdência"
          glow="violet"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/acoes/participacao-investidores-b3/page.MetricCard.3"><MetricCard
          title="Fluxo Estrangeiro no Mês"
          value={formatBrlCompact(foreignItem.saldo_acumulado_mes ?? 0)}
          subtitle="Saldo líquido de compras - vendas"
          glow="cyan"
        /></CmsElement>
      </div>

      {/* Table */}
      <CmsElement feature="ui.app/-frontend-/acoes/participacao-investidores-b3/page.Card.4"><Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white"><CmsText>{"Histórico Recente de Negociação por Categoria"}</CmsText></span>
          <span className="text-[11px] text-[#64748b]"><CmsText>{"Dados divulgados em D+2 pela B3"}</CmsText></span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4 font-sans"><CmsText>{"Data Pregão"}</CmsText></th>
                <th className="py-3 font-sans"><CmsText>{"Categoria Investidor"}</CmsText></th>
                <th className="py-3 text-right font-sans"><CmsText>{"Participação"}</CmsText></th>
                <th className="py-3 text-right font-sans"><CmsText>{"Compras"}</CmsText></th>
                <th className="py-3 text-right font-sans"><CmsText>{"Vendas"}</CmsText></th>
                <th className="py-3 text-right font-sans"><CmsText>{"Saldo do Dia"}</CmsText></th>
                <th className="py-3 text-right pr-4 font-sans"><CmsText>{"Acumulado Mês"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b] font-sans animate-pulse"><CmsText>{"Carregando fluxo de capitais da B3..."}</CmsText></td>
                </tr>
              ) : (
                flows.map((f, idx) => {
                  const isPos = f.saldo_liquido >= 0;
                  return (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-4 text-white font-sans"><CmsText>{f.data_pregao}</CmsText></td>
                      <td className="py-2.5 font-sans font-bold text-white">
                        <CmsText>{f.categoria_investidor}</CmsText>
                      </td>
                      <td className="py-2.5 text-right text-white">
                        <CmsText>{f.participacao_pct ? `${f.participacao_pct}%` : "—"}</CmsText>
                      </td>
                      <td className="py-2.5 text-right text-[#94a3b8]">
                        <CmsText>{formatCurrency(f.compras_reais)}</CmsText>
                      </td>
                      <td className="py-2.5 text-right text-[#94a3b8]">
                        <CmsText>{formatCurrency(f.vendas_reais)}</CmsText>
                      </td>
                      <td className={`py-2.5 text-right font-bold ${isPos ? "text-[#00f5a0]" : "text-[#ff3b69]"}`}>
                        <CmsText>{formatBrlCompact(f.saldo_liquido)}</CmsText>
                      </td>
                      <td className="py-2.5 text-right pr-4 text-white">
                        <CmsText>{f.saldo_acumulado_mes !== null && f.saldo_acumulado_mes !== undefined
                          ? formatBrlCompact(f.saldo_acumulado_mes)
                          : "—"}</CmsText>
                      </td>
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
