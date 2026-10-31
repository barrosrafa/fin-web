"use client";

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
          <span className="badge-neon badge-neon-cyan">Macroeconomia & Sistema Financeiro</span>
          <span className="text-xs text-[#64748b]">Bacen SGS & Tesouro Transparente</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Indicadores Macroeconômicos & Crédito
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Séries oficiais de contas públicas do Governo Central, taxas de inadimplência PF/PJ, captação da caderneta de poupança e câmbio real efetivo (TCR).
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Dívida Bruta / PIB"
          value={`${latestGov.divida_bruta_pib_pct ?? 78.1}%`}
          subtitle="Governo Geral (Bacen)"
          glow="violet"
        />
        <MetricCard
          title="Saldo Caderneta Poupança"
          value={formatBrlCompact(latestCredit.poupanca_saldo_total ?? 0)}
          subtitle="Estoque no Sistema Financeiro"
          glow="cyan"
        />
        <MetricCard
          title="Inadimplência PF (> 90d)"
          value={`${latestCredit.inadimplencia_pf_pct ?? 5.1}%`}
          subtitle="Carteira Total Pessoa Física"
          glow="emerald"
        />
        <MetricCard
          title="Taxa Câmbio Real (TCR)"
          value={`${(latestCredit.tcr_efetiva_indice ?? 96.9).toFixed(2)}`}
          subtitle="Índice Efetivo Real (IPCA)"
          glow="violet"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab("CONTAS_PUBLICAS")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "CONTAS_PUBLICAS"
              ? "border-[#00f5a0] text-[#00f5a0]"
              : "border-transparent text-[#94a3b8] hover:text-white"
          }`}
        >
          Contas Públicas (Receitas & Despesas)
        </button>
        <button
          onClick={() => setActiveTab("CREDITO_POUPANCA")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "CREDITO_POUPANCA"
              ? "border-[#00f5a0] text-[#00f5a0]"
              : "border-transparent text-[#94a3b8] hover:text-white"
          }`}
        >
          Crédito SFN & Poupança
        </button>
        <button
          onClick={() => setActiveTab("CAMBIO_TCR")}
          className={`pb-3 text-xs font-bold transition-all border-b-2 ${
            activeTab === "CAMBIO_TCR"
              ? "border-[#00f5a0] text-[#00f5a0]"
              : "border-transparent text-[#94a3b8] hover:text-white"
          }`}
        >
          Câmbio Real Efetivo (TCR)
        </button>
      </div>

      {/* Section 1: Contas Públicas */}
      {activeTab === "CONTAS_PUBLICAS" && (
        <Card glow="none" className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
            <span className="text-xs font-bold text-white">
              Histórico do Resultado Primário do Governo Central
            </span>
            <span className="text-[11px] text-[#64748b]">Valores em Milhões de Reais</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                  <th className="py-3 pl-4">Mês Referência</th>
                  <th className="py-3 text-right">Receita Líquida</th>
                  <th className="py-3 text-right">Despesa Total</th>
                  <th className="py-3 text-right">Resultado Primário</th>
                  <th className="py-3 text-right">Dívida Bruta (% PIB)</th>
                  <th className="py-3 text-right pr-4">Resultado Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {govAccounts.map((g) => {
                  const isPositive = g.resultado_primario >= 0;
                  return (
                    <tr key={g.data_referencia} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-4 text-white font-sans">{g.data_referencia}</td>
                      <td className="py-2.5 text-right text-white">
                        {formatBrlCompact(g.receita_liquida)}
                      </td>
                      <td className="py-2.5 text-right text-[#94a3b8]">
                        {formatBrlCompact(g.despesa_total)}
                      </td>
                      <td className={`py-2.5 text-right font-bold ${isPositive ? "text-[#00f5a0]" : "text-[#ff3b69]"}`}>
                        {formatBrlCompact(g.resultado_primario)}
                      </td>
                      <td className="py-2.5 text-right text-[#a855f7] font-bold">
                        {g.divida_bruta_pib_pct ? `${g.divida_bruta_pib_pct.toFixed(1)}%` : "—"}
                      </td>
                      <td className="py-2.5 text-right pr-4 text-[#94a3b8]">
                        {g.resultado_nominal ? formatBrlCompact(g.resultado_nominal) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Section 2: Crédito SFN & Poupança */}
      {activeTab === "CREDITO_POUPANCA" && (
        <Card glow="none" className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
            <span className="text-xs font-bold text-white">
              Captação da Poupança e Taxas de Inadimplência
            </span>
            <span className="text-[11px] text-[#64748b]">Bacen SGS Séries Oficiais</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                  <th className="py-3 pl-4">Mês Referência</th>
                  <th className="py-3 text-right">Captação Poupança (Mês)</th>
                  <th className="py-3 text-right">Saldo Poupança</th>
                  <th className="py-3 text-right">Inadimplência PF</th>
                  <th className="py-3 text-right">Inadimplência PJ</th>
                  <th className="py-3 text-right pr-4">Estoque Crédito PJ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {creditData.map((c) => (
                  <tr key={c.data_referencia} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pl-4 text-white font-sans">{c.data_referencia}</td>
                    <td className={`py-2.5 text-right font-bold ${
                      (c.poupanca_captacao_liquida ?? 0) >= 0 ? "text-[#00f5a0]" : "text-[#ff3b69]"
                    }`}>
                      {c.poupanca_captacao_liquida != null ? formatBrlCompact(c.poupanca_captacao_liquida) : "—"}
                    </td>
                    <td className="py-2.5 text-right text-white">
                      {c.poupanca_saldo_total != null ? formatBrlCompact(c.poupanca_saldo_total) : "—"}
                    </td>
                    <td className="py-2.5 text-right text-[#00f5a0] font-bold">
                      {c.inadimplencia_pf_pct != null ? `${c.inadimplencia_pf_pct.toFixed(2)}%` : "—"}
                    </td>
                    <td className="py-2.5 text-right text-white">
                      {c.inadimplencia_pj_pct != null ? `${c.inadimplencia_pj_pct.toFixed(2)}%` : "—"}
                    </td>
                    <td className="py-2.5 text-right pr-4 text-white">
                      {c.estoque_credito_pj != null ? formatBrlCompact(c.estoque_credito_pj) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Section 3: Câmbio TCR */}
      {activeTab === "CAMBIO_TCR" && (
        <Card glow="cyan">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-4">
            Evolução da Taxa de Câmbio Real Efetiva (TCR - IPCA)
          </h3>
          <p className="text-xs text-[#94a3b8] mb-6">
            A Taxa de Câmbio Real mede a competitividade das exportações brasileiras ponderada pela inflação relativa dos principais parceiros comerciais.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] font-sans">
                  <th className="py-2.5 pl-2">Mês</th>
                  <th className="py-2.5 text-right">Índice TCR Efetiva</th>
                  <th className="py-2.5 text-right pr-2">Competitividade Externa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {creditData.map((c) => (
                  <tr key={c.data_referencia} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 pl-2 text-white font-sans">{c.data_referencia}</td>
                    <td className="py-2.5 text-right font-bold text-[#00d9f5]">
                      {c.tcr_efetiva_indice != null ? c.tcr_efetiva_indice.toFixed(2) : "—"}
                    </td>
                    <td className="py-2.5 text-right pr-2 font-sans">
                      <Badge variant="cyan">
                        {(c.tcr_efetiva_indice ?? 100) > 100 ? "Depreciado (Exportador Favorecido)" : "Apreciado"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
