"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPercent } from "@/lib/formatters";
import { FIIProperty } from "@/schemas/financial";

export interface FIIPropertyPortfolioTableProps {
  properties: FIIProperty[];
  topTenants?: Array<{
    tenant_name: string;
    sector: string;
    revenue_pct: number;
    contract_type: string;
  }>;
  criPortfolio?: Array<{
    code: string;
    debtor: string;
    indexer: string;
    coupon_pct: number;
    ltv_pct: number;
    guarantees: string;
    rating?: string;
  }>;
  ticker: string;
}

export function FIIPropertyPortfolioTable({
  properties = [],
  topTenants = [],
  criPortfolio = [],
  ticker,
}: FIIPropertyPortfolioTableProps) {
  const totalAbl = properties.reduce((acc, curr) => acc + curr.ablM2, 0);
  const avgOccupancy =
    properties.length > 0
      ? properties.reduce((acc, curr) => acc + curr.occupancyPct, 0) / properties.length
      : 97.6;

  const states = Array.from(new Set(properties.map((p) => p.state).filter(Boolean)));

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Imóveis Físicos */}
      <Card glow="emerald" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#00f5a0] font-bold">
                Ativos Imobiliários Físicos
              </span>
              <Badge variant="emerald">Padrão Institucional SiiLA</Badge>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Portfólio de Galpões e Empreendimentos {ticker}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="cyan">{properties.length} Ativos em {states.join(", ")}</Badge>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">
              ABL Total Própria
            </span>
            <div className="text-xl font-black font-mono text-white mt-1">
              {totalAbl.toLocaleString("pt-BR")} m²
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block">área locável</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">
              Ocupação Consolidada
            </span>
            <div className="text-xl font-black font-mono text-[#00f5a0] mt-1">
              {formatPercent(avgOccupancy, false)}
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block">área locada</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">
              Vacância Física Média
            </span>
            <div className="text-xl font-black font-mono text-white mt-1">
              {formatPercent(100 - avgOccupancy, false)}
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block">baixo risco</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">
              Estados Atendidos
            </span>
            <div className="text-xl font-black font-mono text-[#00d9f5] mt-1">
              {states.length} Estados
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block">{states.join(" • ")}</span>
          </div>
        </div>

        {properties.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white/[0.02] border border-white/5 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-1">
              Fundo de Papel / Recebíveis Imobiliários (Sem imóveis físicos diretos)
            </h4>
            <p className="text-xs text-[#94a3b8] max-w-lg mx-auto">
              O fundo {ticker} aloca seus recursos prioritariamente em títulos de crédito imobiliário (CRIs) e cotas de outros fundos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Empreendimento</th>
                  <th className="pb-3">Localização</th>
                  <th className="pb-3">Padrão SiiLA</th>
                  <th className="pb-3 text-right">ABL Total (m²)</th>
                  <th className="pb-3 text-right">Taxa Ocupação</th>
                  <th className="pb-3 text-right pr-2">Participação Fundo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-white block text-sm">
                        {prop.name}
                      </span>
                      <span className="text-[11px] text-[#64748b] font-sans">
                        {prop.address}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8]">
                      {prop.city} / <strong className="text-white">{prop.state}</strong>
                    </td>
                    <td className="py-3">
                      <Badge variant="cyan">{prop.siilaStandard}</Badge>
                    </td>
                    <td className="py-3 text-right font-black font-mono text-white text-sm">
                      {prop.ablM2.toLocaleString("pt-BR")} m²
                    </td>
                    <td className="py-3 text-right font-black font-mono text-[#00f5a0]">
                      {formatPercent(prop.occupancyPct, false)}
                    </td>
                    <td className="py-3 text-right pr-2 font-black font-mono text-white">
                      {prop.fundSharePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
          <span>Classificação técnica de galpões auditada por SiiLA Brasil</span>
          <span>Atualização regular de ocupação e laudos técnicos</span>
        </div>
      </Card>

      {/* 2. Inquilinos e CRIs (Exposição de Crédito e Locatários) */}
      {(topTenants.length > 0 || criPortfolio.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topTenants.length > 0 && (
            <Card glow="cyan" className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold block mb-1">
                    Diversificação de Locatários
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Maiores Inquilinos por Receita
                  </h3>
                </div>
                <Badge variant="cyan">Contratos Atípicos</Badge>
              </div>

              <div className="flex flex-col gap-2.5">
                {topTenants.map((t) => (
                  <div
                    key={t.tenant_name}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-white block">{t.tenant_name}</strong>
                      <span className="text-[10px] text-[#64748b]">
                        {t.sector} • Contrato {t.contract_type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#00d9f5] block">
                        {t.revenue_pct}%
                      </span>
                      <span className="text-[10px] text-[#64748b]">da receita total</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {criPortfolio.length > 0 && (
            <Card glow="violet" className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a855f7] font-bold block mb-1">
                    Carteira de Crédito Imobiliário
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    CRIs e Recebíveis Estruturados
                  </h3>
                </div>
                <Badge variant="violet">Garantia Real</Badge>
              </div>

              <div className="flex flex-col gap-2.5">
                {criPortfolio.map((cri) => (
                  <div
                    key={cri.code}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{cri.code} — {cri.debtor}</strong>
                      {cri.rating && <Badge variant="cyan">{cri.rating}</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                      <span>Taxa: <strong className="text-[#00f5a0]">{cri.indexer}</strong></span>
                      <span>LTV: <strong className="text-white">{cri.ltv_pct}%</strong></span>
                    </div>
                    <span className="text-[10px] text-[#64748b] truncate" title={cri.guarantees}>
                      Garantia: {cri.guarantees}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
