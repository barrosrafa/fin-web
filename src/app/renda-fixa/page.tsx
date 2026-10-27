"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";
import { getFixedIncome, FixedIncomeData } from "@/lib/api";

export default function RendaFixaPage() {
  const [fixedIncomeData, setFixedIncomeData] = useState<FixedIncomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getFixedIncome();
        setFixedIncomeData(res);
      } catch (err) {
        console.error("Failed to load fixed income data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const bonds = fixedIncomeData?.bonds ?? [
    { name: "Tesouro Selic 2029", type: "SELIC" as const, annual_rate_pct: 11.25, unit_price: 15240.5, maturity_date: "01/03/2029", min_investment_value: 152.4 },
    { name: "Tesouro IPCA+ 2035", type: "IPCA" as const, annual_rate_pct: 6.55, unit_price: 2210.3, maturity_date: "15/05/2035", min_investment_value: 44.2 },
    { name: "Tesouro IPCA+ 2045", type: "IPCA" as const, annual_rate_pct: 6.62, unit_price: 1310.5, maturity_date: "15/05/2045", min_investment_value: 39.31 },
    { name: "Tesouro Prefixado 2031", type: "PREFIXADO" as const, annual_rate_pct: 12.60, unit_price: 530.15, maturity_date: "01/01/2031", min_investment_value: 31.8 },
  ];

  const curves = fixedIncomeData?.ettj_curves ?? [
    { term_years: 0.5, zero_rate_pct: 11.25, inflation_implied_pct: 4.10 },
    { term_years: 1.0, zero_rate_pct: 11.80, inflation_implied_pct: 4.35 },
    { term_years: 2.0, zero_rate_pct: 12.15, inflation_implied_pct: 4.60 },
    { term_years: 5.0, zero_rate_pct: 12.55, inflation_implied_pct: 4.95 },
    { term_years: 10.0, zero_rate_pct: 12.75, inflation_implied_pct: 5.10 },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">ANBIMA & Tesouro Nacional</span>
          <span className="text-xs text-[#64748b]">Títulos Públicos Federais (TPF) & ETTJ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Renda Fixa & Curva de Juros (ETTJ)
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Preços e taxas indicativas do mercado secundário ANBIMA, Estrutura a Termo da Taxa de Juros (ETTJ / Curva Zero) e monitoramento de títulos públicos em tempo real.
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Taxa Selic Meta Copom"
          value="13,75% a.a."
          subtitle="CDI Diário Anualizado: 13,65%"
          glow="emerald"
        />
        <MetricCard
          title="Taxa Média IPCA+ Longo"
          value="IPCA + 6,62%"
          subtitle="NTN-B 2045 no mercado secundário"
          glow="cyan"
        />
        <MetricCard
          title="Curva Zero 10 Anos (DI1F35)"
          value="12,75% a.a."
          subtitle="Taxa de fechamento mercado futuro B3"
          glow="violet"
        />
      </div>

      {/* Títulos Públicos Table */}
      <Card glow="emerald">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Títulos do Tesouro Direto & Mercado Secundário
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Preços Unitários (PU) e rentabilidades indicativas negociadas.
            </p>
          </div>
          <Badge variant="emerald">Liquidez Diária Garantida</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Título Público</th>
                <th className="pb-3">Indexador</th>
                <th className="pb-3 text-right">Taxa Anualizada</th>
                <th className="pb-3 text-right">Preço Unitário (PU)</th>
                <th className="pb-3 text-right">Aplicação Mínima</th>
                <th className="pb-3 text-right pr-2">Vencimento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {bonds.map((bond) => {
                const rateText =
                  bond.type === "SELIC"
                    ? `SELIC + ${(bond.annual_rate_pct - 11.25 > 0 ? (bond.annual_rate_pct - 11.25).toFixed(2) : 0.15)}%`
                    : bond.type === "IPCA"
                    ? `IPCA + ${bond.annual_rate_pct.toFixed(2)}%`
                    : `${bond.annual_rate_pct.toFixed(2)}% a.a.`;

                return (
                  <tr key={bond.name} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 pl-2">
                      <span className="font-bold text-white block">{bond.name}</span>
                      <span className="text-[10px] text-[#64748b] font-sans">
                        Tesouro Nacional • Risco Soberano AAA
                      </span>
                    </td>
                    <td className="py-3.5">
                      <Badge variant={bond.type === "SELIC" ? "emerald" : bond.type === "IPCA" ? "cyan" : "violet"}>
                        {bond.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-right font-bold text-[#00f5a0]">
                      {rateText}
                    </td>
                    <td className="py-3.5 text-right font-bold text-white">
                      {formatCurrency(bond.unit_price)}
                    </td>
                    <td className="py-3.5 text-right text-[#94a3b8]">
                      {formatCurrency(bond.min_investment_value)}
                    </td>
                    <td className="py-3.5 text-right pr-2 text-white font-sans">
                      {bond.maturity_date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Curva de Juros ETTJ */}
      <Card glow="cyan">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Estrutura a Termo da Taxa de Juros (Curva Zero PRE)
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Vértices calculados a partir dos contratos futuros de DI1 da B3.
            </p>
          </div>
          <Badge variant="cyan">ANBIMA / B3</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {curves.map((pt) => (
            <div key={pt.term_years} className="p-3 rounded-xl bg-[#131926] border border-white/5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                {pt.term_years < 1 ? "6 Meses" : `${pt.term_years} Anos`}
              </span>
              <div className="text-base font-black font-mono text-[#00f5a0] mt-1">
                {pt.zero_rate_pct.toFixed(2)}%
              </div>
              <span className="text-[10px] text-[#94a3b8] block mt-0.5">
                Inflação: {pt.inflation_implied_pct?.toFixed(2) ?? 4.5}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
