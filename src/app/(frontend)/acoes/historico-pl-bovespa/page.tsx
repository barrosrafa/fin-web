"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { getIbovPEHistory } from "@/lib/api";
import { IbovPEHistoryItem } from "@/schemas/oceans14";

export default function HistoricoPLBovespaPage() {
  const [history, setHistory] = useState<IbovPEHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getIbovPEHistory(60);
        setHistory(data);
      } catch (err) {
        console.error("Erro ao carregar histórico P/L Ibov:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latest = history[history.length - 1] ?? {
    fechamento_indice: 148500.0,
    pl_ponderado: 9.42,
    media_historica_5y: 10.20,
    banda_superior_1dp: 12.05,
    banda_inferior_1dp: 8.35,
    banda_superior_2dp: 13.90,
    banda_inferior_2dp: 6.50,
  };

  const isCheap = latest.pl_ponderado < latest.media_historica_5y;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Valuation Macro B3"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Corredor Histórico de Preço / Lucro"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Histórico P/L Bovespa (Ibovespa)"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Análise histórica da relação Preço sobre Lucro ponderada pelo valor de mercado das empresas constituintes do índice Ibovespa e suas bandas de desvio padrão."}</CmsText></p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <CmsElement feature="ui.app/-frontend-/acoes/historico-pl-bovespa/page.MetricCard.1"><MetricCard
          title="P/L Ponderado Atual"
          value={`${latest.pl_ponderado.toFixed(2)}x`}
          subtitle={isCheap ? "Abaixo da Média Histórica" : "Acima da Média Histórica"}
          glow={isCheap ? "emerald" : "violet"}
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/acoes/historico-pl-bovespa/page.MetricCard.2"><MetricCard
          title="Média Histórica (5 Anos)"
          value={`${latest.media_historica_5y.toFixed(2)}x`}
          subtitle="Equilíbrio estrutural da bolsa"
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/acoes/historico-pl-bovespa/page.MetricCard.3"><MetricCard
          title="Zona de Barganha (-1 DP)"
          value={`${latest.banda_inferior_1dp.toFixed(2)}x`}
          subtitle="Desconto acentuado de valuation"
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/acoes/historico-pl-bovespa/page.MetricCard.4"><MetricCard
          title="Zona de Euforia (+1 DP)"
          value={`${latest.banda_superior_1dp.toFixed(2)}x`}
          subtitle="Regime de sobreavaliação"
          glow="crimson"
        /></CmsElement>
      </div>

      {/* Corridor Table & Analysis */}
      <CmsElement feature="ui.app/-frontend-/acoes/historico-pl-bovespa/page.Card.5"><Card glow="cyan">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-4"><CmsText>{"Série Histórica e Bandas Estatísticas de Valuation (Ibov)"}</CmsText></h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 pl-2 font-sans"><CmsText>{"Data Ref"}</CmsText></th>
                <th className="py-2.5 text-right font-sans"><CmsText>{"Pontos Ibov"}</CmsText></th>
                <th className="py-2.5 text-right font-sans"><CmsText>{"P/L Ponderado"}</CmsText></th>
                <th className="py-2.5 text-right font-sans"><CmsText>{"P/L Mediano"}</CmsText></th>
                <th className="py-2.5 text-right font-sans"><CmsText>{"Média (5A)"}</CmsText></th>
                <th className="py-2.5 text-right font-sans"><CmsText>{"Banda -1σ (Barganha)"}</CmsText></th>
                <th className="py-2.5 text-right font-sans"><CmsText>{"Banda +1σ (Euforia)"}</CmsText></th>
                <th className="py-2.5 text-right pr-2 font-sans"><CmsText>{"Status"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#64748b] font-sans animate-pulse"><CmsText>{"Carregando série histórica de múltiplos..."}</CmsText></td>
                </tr>
              ) : (
                history.map((pt) => {
                  const statusLabel =
                    pt.pl_ponderado <= pt.banda_inferior_1dp
                      ? "SUB-AVALIADO"
                      : pt.pl_ponderado >= pt.banda_superior_1dp
                      ? "SOBRE-AVALIADO"
                      : "JUSTO";
                  const badgeVariant =
                    statusLabel === "SUB-AVALIADO"
                      ? "emerald"
                      : statusLabel === "SOBRE-AVALIADO"
                      ? "crimson"
                      : "neutral";

                  return (
                    <tr key={pt.data_referencia} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-2 text-white font-sans"><CmsText>{pt.data_referencia}</CmsText></td>
                      <td className="py-2.5 text-right text-white font-bold">
                        <CmsText>{pt.fechamento_indice.toLocaleString("pt-BR")}</CmsText><CmsText>{" pts"}</CmsText></td>
                      <td className="py-2.5 text-right font-bold text-[#00d9f5]">
                        <CmsText>{pt.pl_ponderado.toFixed(2)}</CmsText><CmsText>{"x"}</CmsText></td>
                      <td className="py-2.5 text-right text-white"><CmsText>{pt.pl_mediano.toFixed(2)}</CmsText><CmsText>{"x"}</CmsText></td>
                      <td className="py-2.5 text-right text-[#94a3b8]"><CmsText>{pt.media_historica_5y.toFixed(2)}</CmsText><CmsText>{"x"}</CmsText></td>
                      <td className="py-2.5 text-right text-[#00f5a0]"><CmsText>{pt.banda_inferior_1dp.toFixed(2)}</CmsText><CmsText>{"x"}</CmsText></td>
                      <td className="py-2.5 text-right text-[#ff3b69]"><CmsText>{pt.banda_superior_1dp.toFixed(2)}</CmsText><CmsText>{"x"}</CmsText></td>
                      <td className="py-2.5 text-right pr-2 font-sans">
                        <Badge variant={badgeVariant}><CmsText>{statusLabel}</CmsText></Badge>
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
