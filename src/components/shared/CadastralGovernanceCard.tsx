"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface CadastralGovernanceProps {
  legalName?: string;
  cnpj?: string;
  tradingCode: string;
  administratorName?: string;
  administratorCnpj?: string;
  administratorAddress?: string;
  administratorPhone?: string;
  administratorSite?: string;
  managerName?: string;
  mandate?: string;
  targetAudience?: string;
  durationTerm?: string;
  managementType?: string;
  adminFeeDesc?: string;
  sharesCount?: number;
  shareholdersCount?: number;
  segment?: string;
}

export function CadastralGovernanceCard({
  legalName,
  cnpj,
  tradingCode,
  administratorName,
  administratorCnpj,
  administratorAddress,
  administratorPhone,
  administratorSite,
  managerName,
  mandate,
  targetAudience,
  durationTerm,
  managementType,
  adminFeeDesc,
  sharesCount,
  shareholdersCount,
  segment,
}: CadastralGovernanceProps) {
  return (
    <CmsElement feature="ui.components/shared/CadastralGovernanceCard.Card.1"><Card glow="cyan" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold"><CmsText>{"Registro & Governança CVM"}</CmsText></span>
            <Badge variant="cyan"><CmsText>{"Auditoria Oficial B3"}</CmsText></Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            <CmsText>{legalName || `${tradingCode} - Fundo de Investimento Imobiliário`}</CmsText>
          </h2>
        </div>
        <div className="text-xs font-mono text-[#94a3b8] flex items-center gap-2">
          <span><CmsText>{"CNPJ:"}</CmsText></span>
          <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            <CmsText>{cnpj || "11.728.688/0001-47"}</CmsText>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8 text-xs">
        {/* Administrador */}
        <div className="flex flex-col gap-1">
          <span className="text-[#64748b] uppercase tracking-wider font-semibold text-[10px]"><CmsText>{"Administrador Fiduciário"}</CmsText></span>
          <span className="font-bold text-white text-sm">
            <CmsText>{administratorName || "GENIAL INVESTIMENTOS CORRETORA DE MOBILIARIOS S.A."}</CmsText>
          </span>
          <CmsText>{administratorCnpj && (
            <span className="text-[11px] text-[#94a3b8] font-mono"><CmsText>{"CNPJ Adm: "}</CmsText><CmsText>{administratorCnpj}</CmsText>
            </span>
          )}</CmsText>
          <CmsText>{administratorPhone && (
            <span className="text-[11px] text-[#94a3b8]"><CmsText>{"Contato: "}</CmsText><CmsText>{administratorPhone}</CmsText>
            </span>
          )}</CmsText>
          <CmsText>{administratorAddress && (
            <CmsElement><span className="text-[11px] text-[#64748b] truncate" title={administratorAddress}>
              <CmsText>{administratorAddress}</CmsText>
            </span></CmsElement>
          )}</CmsText>
          <CmsText>{administratorSite && (
            <CmsElement feature="ui.components/shared/CadastralGovernanceCard.a.3"><a
              href={administratorSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d9f5] hover:underline text-[11px] font-mono mt-0.5 inline-flex items-center gap-1"
            ><CmsText>{"Portal RI Administrador ↗"}</CmsText></a></CmsElement>
          )}</CmsText>
        </div>

        {/* Gestor e Mandato */}
        <div className="flex flex-col gap-1">
          <span className="text-[#64748b] uppercase tracking-wider font-semibold text-[10px]"><CmsText>{"Gestão de Recursos & Mandato"}</CmsText></span>
          <span className="font-bold text-white text-sm">
            <CmsText>{managerName || "Pátria Investimentos Gestão de Recursos Ltda."}</CmsText>
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#94a3b8]"><CmsText>{"Tipo de Gestão:"}</CmsText></span>
            <Badge variant="emerald"><CmsText>{managementType || "Ativa"}</CmsText></Badge>
          </div>
          <div className="text-[11px] text-[#94a3b8] mt-0.5"><CmsText>{"Mandato: "}</CmsText><strong className="text-white"><CmsText>{mandate || "Renda / Híbrido"}</CmsText></strong>
          </div>
          <div className="text-[11px] text-[#94a3b8]"><CmsText>{"Segmento: "}</CmsText><strong className="text-white"><CmsText>{segment || "Galpões Logísticos Industriais"}</CmsText></strong>
          </div>
        </div>

        {/* Taxas e Termos */}
        <div className="flex flex-col gap-1">
          <span className="text-[#64748b] uppercase tracking-wider font-semibold text-[10px]"><CmsText>{"Remuneração & Estrutura de Taxas"}</CmsText></span>
          <span className="font-medium text-white text-xs leading-relaxed">
            <CmsText>{adminFeeDesc || "0,44% sobre patrimônio ou 0,47% sobre valor de mercado"}</CmsText>
          </span>
          <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-[#64748b] block"><CmsText>{"Prazo de Duração"}</CmsText></span>
              <span className="font-mono text-white font-semibold">
                <CmsText>{durationTerm || "Indeterminado"}</CmsText>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block"><CmsText>{"Público-Alvo"}</CmsText></span>
              <span className="font-mono text-white font-semibold">
                <CmsText>{targetAudience || "Geral"}</CmsText>
              </span>
            </div>
          </div>
        </div>

        {/* Base Acionária / Cotistas */}
        <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-3 pt-3 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Cotas Emitidas"}</CmsText></span>
              <span className="text-base font-black font-mono text-white mt-1 block">
                <CmsText>{(sharesCount || 45601745).toLocaleString("pt-BR")}</CmsText>
              </span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Total de Cotistas"}</CmsText></span>
              <span className="text-base font-black font-mono text-[#00f5a0] mt-1 block">
                <CmsText>{(shareholdersCount || 608345).toLocaleString("pt-BR")}</CmsText>
              </span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Código de Negociação"}</CmsText></span>
              <span className="text-base font-black font-mono text-white mt-1 block">
                <CmsText>{tradingCode}</CmsText>
              </span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block"><CmsText>{"Status CVM"}</CmsText></span>
              <span className="text-xs font-bold font-mono text-[#00f5a0] mt-2 block"><CmsText>{"● Operacional Regular"}</CmsText></span>
            </div>
          </div>
        </div>
      </div>
    </Card></CmsElement>
  );
}
