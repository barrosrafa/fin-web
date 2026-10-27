"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";

export default function RendaFixaPage() {
  const bonds = [
    { name: "Tesouro Selic 2029", type: "LFT", rate: "SELIC + 0,14%", pu: 15420.5, maturity: "01/03/2029", badge: "Liquidez D+0" },
    { name: "Tesouro IPCA+ 2035", type: "NTN-B Principal", rate: "IPCA + 6,48%", pu: 2240.8, maturity: "15/05/2035", badge: "Proteção Inflação" },
    { name: "Tesouro IPCA+ 2045 com Juros Semestrais", type: "NTN-B", rate: "IPCA + 6,55%", pu: 4120.3, maturity: "15/05/2045", badge: "Renda Semestral" },
    { name: "Tesouro Prefixado 2031", type: "LTN", rate: "12,85% a.a.", pu: 512.4, maturity: "01/01/2031", badge: "Taxa Travada" },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">ANBIMA & Tesouro Nacional</span>
          <span className="text-xs text-[#64748b]">Títulos Públicos Federais (TPF) & Crédito Privado</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Renda Fixa & Curva de Juros (ETTJ)
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Preços e taxas indicativas do mercado secundário ANBIMA, Estrutura a Termo da Taxa de Juros (ETTJ / Curva Zero) e monitoramento de debêntures e títulos públicos.
        </p>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Taxa Selic Meta Copom"
          value="11,25% a.a."
          subtitle="CDI Diário Anualizado: 11,15%"
          glow="emerald"
        />
        <MetricCard
          title="Taxa Média IPCA+ Longo"
          value="IPCA + 6,55%"
          subtitle="NTN-B 2045 no mercado secundário"
          glow="cyan"
        />
        <MetricCard
          title="Curva Zero 10 Anos (DI1F35)"
          value="12,92% a.a."
          subtitle="Inclinação positiva da curva futura"
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
              Taxas oficiais e Preços Unitários (PU) atualizados diariamente.
            </p>
          </div>
          <Badge variant="emerald" dot>
            Liquidez Garantida
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Título Público</th>
                <th className="pb-3">Sigla SELIC</th>
                <th className="pb-3 text-right">Taxa Anual Indicativa</th>
                <th className="pb-3 text-right">Preço Unitário (PU)</th>
                <th className="pb-3 text-right">Vencimento</th>
                <th className="pb-3 text-right pr-2">Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {bonds.map((b) => (
                <tr key={b.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white font-sans">
                    {b.name}
                  </td>
                  <td className="py-3.5 font-sans text-[#94a3b8]">{b.type}</td>
                  <td className="py-3.5 text-right font-bold text-[#00f5a0]">
                    {b.rate}
                  </td>
                  <td className="py-3.5 text-right text-white font-bold">
                    {formatCurrency(b.pu)}
                  </td>
                  <td className="py-3.5 text-right text-[#94a3b8]">
                    {b.maturity}
                  </td>
                  <td className="py-3.5 text-right pr-2 font-sans">
                    <Badge variant="cyan">{b.badge}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
