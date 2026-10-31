"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
      <CmsElement feature="ui.components/fiis/FIIPropertyPortfolioTable.Card.1"><Card glow="emerald" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#00f5a0] font-bold"><CmsText>{"Ativos Imobiliários Físicos"}</CmsText></span>
              <Badge variant="emerald"><CmsText>{"Padrão Institucional SiiLA"}</CmsText></Badge>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight"><CmsText>{"Portfólio de Galpões e Empreendimentos "}</CmsText><CmsText>{ticker}</CmsText>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="cyan"><CmsText>{properties.length}</CmsText><CmsText>{" Ativos em "}</CmsText><CmsText>{states.join(", ")}</CmsText></Badge>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"ABL Total Própria"}</CmsText></span>
            <div className="text-xl font-black font-mono text-white mt-1">
              <CmsText>{totalAbl.toLocaleString("pt-BR")}</CmsText><CmsText>{" m²"}</CmsText></div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"área locável"}</CmsText></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Ocupação Consolidada"}</CmsText></span>
            <div className="text-xl font-black font-mono text-[#00f5a0] mt-1">
              <CmsText>{formatPercent(avgOccupancy, false)}</CmsText>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"área locada"}</CmsText></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Vacância Física Média"}</CmsText></span>
            <div className="text-xl font-black font-mono text-white mt-1">
              <CmsText>{formatPercent(100 - avgOccupancy, false)}</CmsText>
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{"baixo risco"}</CmsText></span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Estados Atendidos"}</CmsText></span>
            <div className="text-xl font-black font-mono text-[#00d9f5] mt-1">
              <CmsText>{states.length}</CmsText><CmsText>{" Estados"}</CmsText></div>
            <span className="text-[11px] text-[#94a3b8] mt-0.5 block"><CmsText>{states.join(" • ")}</CmsText></span>
          </div>
        </div>

        <CmsText>{properties.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white/[0.02] border border-white/5 rounded-2xl">
            <h4 className="text-sm font-bold text-white mb-1"><CmsText>{"Fundo de Papel / Recebíveis Imobiliários (Sem imóveis físicos diretos)"}</CmsText></h4>
            <p className="text-xs text-[#94a3b8] max-w-lg mx-auto"><CmsText>{"O fundo "}</CmsText><CmsText>{ticker}</CmsText><CmsText>{" aloca seus recursos prioritariamente em títulos de crédito imobiliário (CRIs) e cotas de outros fundos."}</CmsText></p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2"><CmsText>{"Empreendimento"}</CmsText></th>
                  <th className="pb-3"><CmsText>{"Localização"}</CmsText></th>
                  <th className="pb-3"><CmsText>{"Padrão SiiLA"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"ABL Total (m²)"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Taxa Ocupação"}</CmsText></th>
                  <th className="pb-3 text-right pr-2"><CmsText>{"Participação Fundo"}</CmsText></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                <CmsText>{properties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-white block text-sm">
                        <CmsText>{prop.name}</CmsText>
                      </span>
                      <span className="text-[11px] text-[#64748b] font-sans">
                        <CmsText>{prop.address}</CmsText>
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8]">
                      <CmsText>{prop.city}</CmsText><CmsText>{" / "}</CmsText><strong className="text-white"><CmsText>{prop.state}</CmsText></strong>
                    </td>
                    <td className="py-3">
                      <Badge variant="cyan"><CmsText>{prop.siilaStandard}</CmsText></Badge>
                    </td>
                    <td className="py-3 text-right font-black font-mono text-white text-sm">
                      <CmsText>{prop.ablM2.toLocaleString("pt-BR")}</CmsText><CmsText>{" m²"}</CmsText></td>
                    <td className="py-3 text-right font-black font-mono text-[#00f5a0]">
                      <CmsText>{formatPercent(prop.occupancyPct, false)}</CmsText>
                    </td>
                    <td className="py-3 text-right pr-2 font-black font-mono text-white">
                      <CmsText>{prop.fundSharePct}</CmsText><CmsText>{"%"}</CmsText></td>
                  </tr>
                ))}</CmsText>
              </tbody>
            </table>
          </div>
        )}</CmsText>

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
          <span><CmsText>{"Classificação técnica de galpões auditada por SiiLA Brasil"}</CmsText></span>
          <span><CmsText>{"Atualização regular de ocupação e laudos técnicos"}</CmsText></span>
        </div>
      </Card></CmsElement>

      {/* 2. Inquilinos e CRIs (Exposição de Crédito e Locatários) */}
      <CmsText>{(topTenants.length > 0 || criPortfolio.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CmsText>{topTenants.length > 0 && (
            <CmsElement feature="ui.components/fiis/FIIPropertyPortfolioTable.Card.2"><Card glow="cyan" className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold block mb-1"><CmsText>{"Diversificação de Locatários"}</CmsText></span>
                  <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Maiores Inquilinos por Receita"}</CmsText></h3>
                </div>
                <Badge variant="cyan"><CmsText>{"Contratos Atípicos"}</CmsText></Badge>
              </div>

              <div className="flex flex-col gap-2.5">
                <CmsText>{topTenants.map((t) => (
                  <div
                    key={t.tenant_name}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-white block"><CmsText>{t.tenant_name}</CmsText></strong>
                      <span className="text-[10px] text-[#64748b]">
                        <CmsText>{t.sector}</CmsText><CmsText>{" • Contrato "}</CmsText><CmsText>{t.contract_type}</CmsText>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#00d9f5] block">
                        <CmsText>{t.revenue_pct}</CmsText><CmsText>{"%"}</CmsText></span>
                      <span className="text-[10px] text-[#64748b]"><CmsText>{"da receita total"}</CmsText></span>
                    </div>
                  </div>
                ))}</CmsText>
              </div>
            </Card></CmsElement>
          )}</CmsText>

          <CmsText>{criPortfolio.length > 0 && (
            <CmsElement feature="ui.components/fiis/FIIPropertyPortfolioTable.Card.3"><Card glow="violet" className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-[#a855f7] font-bold block mb-1"><CmsText>{"Carteira de Crédito Imobiliário"}</CmsText></span>
                  <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"CRIs e Recebíveis Estruturados"}</CmsText></h3>
                </div>
                <Badge variant="violet"><CmsText>{"Garantia Real"}</CmsText></Badge>
              </div>

              <div className="flex flex-col gap-2.5">
                <CmsText>{criPortfolio.map((cri) => (
                  <div
                    key={cri.code}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white"><CmsText>{cri.code}</CmsText><CmsText>{" — "}</CmsText><CmsText>{cri.debtor}</CmsText></strong>
                      <CmsText>{cri.rating && <Badge variant="cyan"><CmsText>{cri.rating}</CmsText></Badge>}</CmsText>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#94a3b8]">
                      <span><CmsText>{"Taxa: "}</CmsText><strong className="text-[#00f5a0]"><CmsText>{cri.indexer}</CmsText></strong></span>
                      <span><CmsText>{"LTV: "}</CmsText><strong className="text-white"><CmsText>{cri.ltv_pct}</CmsText><CmsText>{"%"}</CmsText></strong></span>
                    </div>
                    <CmsElement><span className="text-[10px] text-[#64748b] truncate" title={cri.guarantees}><CmsText>{"Garantia: "}</CmsText><CmsText>{cri.guarantees}</CmsText>
                    </span></CmsElement>
                  </div>
                ))}</CmsText>
              </div>
            </Card></CmsElement>
          )}</CmsText>
        </div>
      )}</CmsText>
    </div>
  );
}
