"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getGovernmentAccounts, getCreditSystem } from "@/lib/api";
import { GovernmentAccountsRow, CreditSystemRow } from "@/schemas/oceans14";

export default function IndicadoresEconomicosPage() {
  const [activeTab, setActiveTab] = useState<"CONTAS_PUBLICAS" | "CREDITO_POUPANCA" | "CAMBIO_TCR">("CONTAS_PUBLICAS");
  const [govAccounts, setGovAccounts] = useState<GovernmentAccountsRow[]>([]);
  const [creditData, setCreditData] = useState<CreditSystemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [gov, cred] = await Promise.all([
          getGovernmentAccounts(36),
          getCreditSystem(36),
        ]);
        setGovAccounts(gov);
        setCreditData(cred);
      } catch (err) {
        console.error("Erro ao carregar dados macroeconômicos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const latestGov = govAccounts[govAccounts.length - 1] ?? {
    receita_liquida: 180000000000.0,
    despesa_total: 185000000000.0,
    resultado_primario: -5000000000.0,
    divida_bruta_pib_pct: 78.1,
  };

  const latestCredit = creditData[creditData.length - 1] ?? {
    poupanca_captacao_liquida: -800000000.0,
    poupanca_saldo_total: 986000000000.0,
    inadimplencia_pf_pct: 5.1,
    inadimplencia_pj_pct: 2.8,
    estoque_credito_pj: 2410000000000.0,
    tcr_efetiva_indice: 96.90,
  };

  const formatBrlCompact = (val: number) => {
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : "";
    if (abs >= 1_000_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000_000).toFixed(2)} Tri`;
    if (abs >= 1_000_000_000) return `${sign}R$ ${(abs / 1_000_000_000).toFixed(2)} Bi`;
    if (abs >= 1_000_000) return `${sign}R$ ${(abs / 1_000_000).toFixed(2)} Mi`;
    return formatCurrency(val);
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Macroeconomia & Sistema Financeiro"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Bacen SGS & Tesouro Transparente"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Indicadores Macroeconômicos & Crédito"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Séries oficiais de contas públicas do Governo Central, taxas de inadimplência PF/PJ, captação da caderneta de poupança e câmbio real efetivo (TCR)."}</CmsText></p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.MetricCard.1"><MetricCard
          title="Dívida Bruta / PIB"
          value={`${latestGov.divida_bruta_pib_pct ?? 78.1}%`}
          subtitle="Governo Geral (Bacen)"
          glow="violet"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.MetricCard.2"><MetricCard
          title="Saldo Caderneta Poupança"
          value={formatBrlCompact(latestCredit.poupanca_saldo_total ?? 0)}
          subtitle="Estoque no Sistema Financeiro"
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.MetricCard.3"><MetricCard
          title="Inadimplência PF (> 90d)"
          value={`${latestCredit.inadimplencia_pf_pct ?? 5.1}%`}
          subtitle="Carteira Total Pessoa Física"
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.MetricCard.4"><MetricCard
          title="Taxa Câmbio Real (TCR)"
          value={`${(latestCredit.tcr_efetiva_indice ?? 96.9).toFixed(2)}`}
          subtitle="Índice Efetivo Real (IPCA)"
          glow="violet"
        /></CmsElement>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.button.5"><button
          onClick={() => setActiveTab("CONTAS_PUBLICAS")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "CONTAS_PUBLICAS"
              ? "border-[#00f5a0] text-[#00f5a0]"
              : "border-transparent text-[#94a3b8] hover:text-white"
          }`}
        ><CmsText>{"Contas Públicas (Receitas & Despesas)"}</CmsText></button></CmsElement>
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.button.6"><button
          onClick={() => setActiveTab("CREDITO_POUPANCA")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "CREDITO_POUPANCA"
              ? "border-[#00f5a0] text-[#00f5a0]"
              : "border-transparent text-[#94a3b8] hover:text-white"
          }`}
        ><CmsText>{"Crédito SFN & Poupança"}</CmsText></button></CmsElement>
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.button.7"><button
          onClick={() => setActiveTab("CAMBIO_TCR")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "CAMBIO_TCR"
              ? "border-[#00f5a0] text-[#00f5a0]"
              : "border-transparent text-[#94a3b8] hover:text-white"
          }`}
        ><CmsText>{"Câmbio Real Efetivo (TCR)"}</CmsText></button></CmsElement>
      </div>

      {/* Section 1: Contas Públicas */}
      <CmsText>{activeTab === "CONTAS_PUBLICAS" && (
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.Card.8"><Card glow="none" className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
            <span className="text-xs font-bold text-white"><CmsText>{"Histórico do Resultado Primário do Governo Central"}</CmsText></span>
            <span className="text-[11px] text-[#64748b]"><CmsText>{"Valores em Milhões de Reais"}</CmsText></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                  <th className="py-3 pl-4"><CmsText>{"Mês Referência"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Receita Líquida"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Despesa Total"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Resultado Primário"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Dívida Bruta (% PIB)"}</CmsText></th>
                  <th className="py-3 text-right pr-4"><CmsText>{"Resultado Nominal"}</CmsText></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <CmsText>{govAccounts.map((g) => {
                  const isPositive = g.resultado_primario >= 0;
                  return (
                    <tr key={g.data_referencia} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-4 text-white font-sans"><CmsText>{g.data_referencia}</CmsText></td>
                      <td className="py-2.5 text-right text-white">
                        <CmsText>{formatBrlCompact(g.receita_liquida)}</CmsText>
                      </td>
                      <td className="py-2.5 text-right text-[#94a3b8]">
                        <CmsText>{formatBrlCompact(g.despesa_total)}</CmsText>
                      </td>
                      <td className={`py-2.5 text-right font-bold ${isPositive ? "text-[#00f5a0]" : "text-[#ff3b69]"}`}>
                        <CmsText>{formatBrlCompact(g.resultado_primario)}</CmsText>
                      </td>
                      <td className="py-2.5 text-right text-[#a855f7] font-bold">
                        <CmsText>{g.divida_bruta_pib_pct ? `${g.divida_bruta_pib_pct.toFixed(1)}%` : "—"}</CmsText>
                      </td>
                      <td className="py-2.5 text-right pr-4 text-[#94a3b8]">
                        <CmsText>{g.resultado_nominal ? formatBrlCompact(g.resultado_nominal) : "—"}</CmsText>
                      </td>
                    </tr>
                  );
                })}</CmsText>
              </tbody>
            </table>
          </div>
        </Card></CmsElement>
      )}</CmsText>

      {/* Section 2: Crédito SFN & Poupança */}
      <CmsText>{activeTab === "CREDITO_POUPANCA" && (
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.Card.9"><Card glow="none" className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
            <span className="text-xs font-bold text-white"><CmsText>{"Captação da Poupança e Taxas de Inadimplência"}</CmsText></span>
            <span className="text-[11px] text-[#64748b]"><CmsText>{"Bacen SGS Séries Oficiais"}</CmsText></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                  <th className="py-3 pl-4"><CmsText>{"Mês Referência"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Captação Poupança (Mês)"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Saldo Poupança"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Inadimplência PF"}</CmsText></th>
                  <th className="py-3 text-right"><CmsText>{"Inadimplência PJ"}</CmsText></th>
                  <th className="py-3 text-right pr-4"><CmsText>{"Estoque Crédito PJ"}</CmsText></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <CmsText>{creditData.map((c) => (
                  <tr key={c.data_referencia} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pl-4 text-white font-sans"><CmsText>{c.data_referencia}</CmsText></td>
                    <td className={`py-2.5 text-right font-bold ${
                      (c.poupanca_captacao_liquida ?? 0) >= 0 ? "text-[#00f5a0]" : "text-[#ff3b69]"
                    }`}>
                      <CmsText>{c.poupanca_captacao_liquida != null ? formatBrlCompact(c.poupanca_captacao_liquida) : "—"}</CmsText>
                    </td>
                    <td className="py-2.5 text-right text-white">
                      <CmsText>{c.poupanca_saldo_total != null ? formatBrlCompact(c.poupanca_saldo_total) : "—"}</CmsText>
                    </td>
                    <td className="py-2.5 text-right text-[#00f5a0] font-bold">
                      <CmsText>{c.inadimplencia_pf_pct != null ? `${c.inadimplencia_pf_pct.toFixed(2)}%` : "—"}</CmsText>
                    </td>
                    <td className="py-2.5 text-right text-white">
                      <CmsText>{c.inadimplencia_pj_pct != null ? `${c.inadimplencia_pj_pct.toFixed(2)}%` : "—"}</CmsText>
                    </td>
                    <td className="py-2.5 text-right pr-4 text-white">
                      <CmsText>{c.estoque_credito_pj != null ? formatBrlCompact(c.estoque_credito_pj) : "—"}</CmsText>
                    </td>
                  </tr>
                ))}</CmsText>
              </tbody>
            </table>
          </div>
        </Card></CmsElement>
      )}</CmsText>

      {/* Section 3: Câmbio TCR */}
      <CmsText>{activeTab === "CAMBIO_TCR" && (
        <CmsElement feature="ui.app/-frontend-/indicadores-economicos/page.Card.10"><Card glow="cyan">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-4"><CmsText>{"Evolução da Taxa de Câmbio Real Efetiva (TCR - IPCA)"}</CmsText></h3>
          <p className="text-xs text-[#94a3b8] mb-6"><CmsText>{"A Taxa de Câmbio Real mede a competitividade das exportações brasileiras ponderada pela inflação relativa dos principais parceiros comerciais."}</CmsText></p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] font-sans">
                  <th className="py-2.5 pl-2"><CmsText>{"Mês"}</CmsText></th>
                  <th className="py-2.5 text-right"><CmsText>{"Índice TCR Efetiva"}</CmsText></th>
                  <th className="py-2.5 text-right pr-2"><CmsText>{"Competitividade Externa"}</CmsText></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <CmsText>{creditData.map((c) => (
                  <tr key={c.data_referencia} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pl-2 text-white font-sans"><CmsText>{c.data_referencia}</CmsText></td>
                    <td className="py-2.5 text-right font-bold text-[#00d9f5]">
                      <CmsText>{c.tcr_efetiva_indice != null ? c.tcr_efetiva_indice.toFixed(2) : "—"}</CmsText>
                    </td>
                    <td className="py-2.5 text-right pr-2 font-sans">
                      <Badge variant="cyan">
                        <CmsText>{(c.tcr_efetiva_indice ?? 100) > 100 ? "Depreciado (Exportador Favorecido)" : "Apreciado"}</CmsText>
                      </Badge>
                    </td>
                  </tr>
                ))}</CmsText>
              </tbody>
            </table>
          </div>
        </Card></CmsElement>
      )}</CmsText>
    </div>
  );
}
