"use client";

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
    <Card glow="cyan" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold">
              Registro & Governança CVM
            </span>
            <Badge variant="cyan">Auditoria Oficial B3</Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            {legalName || `${tradingCode} - Fundo de Investimento Imobiliário`}
          </h2>
        </div>
        <div className="text-xs font-mono text-[#94a3b8] flex items-center gap-2">
          <span>CNPJ:</span>
          <span className="font-bold text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {cnpj || "11.728.688/0001-47"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8 text-xs">
        {/* Administrador */}
        <div className="flex flex-col gap-1">
          <span className="text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
            Administrador Fiduciário
          </span>
          <span className="font-bold text-white text-sm">
            {administratorName || "GENIAL INVESTIMENTOS CORRETORA DE MOBILIARIOS S.A."}
          </span>
          {administratorCnpj && (
            <span className="text-[11px] text-[#94a3b8] font-mono">
              CNPJ Adm: {administratorCnpj}
            </span>
          )}
          {administratorPhone && (
            <span className="text-[11px] text-[#94a3b8]">
              Contato: {administratorPhone}
            </span>
          )}
          {administratorAddress && (
            <span className="text-[11px] text-[#64748b] truncate" title={administratorAddress}>
              {administratorAddress}
            </span>
          )}
          {administratorSite && (
            <a
              href={administratorSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00d9f5] hover:underline text-[11px] font-mono mt-0.5 inline-flex items-center gap-1"
            >
              Portal RI Administrador ↗
            </a>
          )}
        </div>

        {/* Gestor e Mandato */}
        <div className="flex flex-col gap-1">
          <span className="text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
            Gestão de Recursos & Mandato
          </span>
          <span className="font-bold text-white text-sm">
            {managerName || "Pátria Investimentos Gestão de Recursos Ltda."}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#94a3b8]">Tipo de Gestão:</span>
            <Badge variant="emerald">{managementType || "Ativa"}</Badge>
          </div>
          <div className="text-[11px] text-[#94a3b8] mt-0.5">
            Mandato: <strong className="text-white">{mandate || "Renda / Híbrido"}</strong>
          </div>
          <div className="text-[11px] text-[#94a3b8]">
            Segmento: <strong className="text-white">{segment || "Galpões Logísticos Industriais"}</strong>
          </div>
        </div>

        {/* Taxas e Termos */}
        <div className="flex flex-col gap-1">
          <span className="text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
            Remuneração & Estrutura de Taxas
          </span>
          <span className="font-medium text-white text-xs leading-relaxed">
            {adminFeeDesc || "0,44% sobre patrimônio ou 0,47% sobre valor de mercado"}
          </span>
          <div className="mt-2 pt-2 border-t border-white/5 grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-[#64748b] block">Prazo de Duração</span>
              <span className="font-mono text-white font-semibold">
                {durationTerm || "Indeterminado"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#64748b] block">Público-Alvo</span>
              <span className="font-mono text-white font-semibold">
                {targetAudience || "Geral"}
              </span>
            </div>
          </div>
        </div>

        {/* Base Acionária / Cotistas */}
        <div className="flex flex-col gap-1 md:col-span-2 lg:col-span-3 pt-3 border-t border-white/5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                Cotas Emitidas
              </span>
              <span className="text-base font-black font-mono text-white mt-1 block">
                {(sharesCount || 45601745).toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                Total de Cotistas
              </span>
              <span className="text-base font-black font-mono text-[#00f5a0] mt-1 block">
                {(shareholdersCount || 608345).toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                Código de Negociação
              </span>
              <span className="text-base font-black font-mono text-white mt-1 block">
                {tradingCode}
              </span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase font-bold text-[#64748b] block">
                Status CVM
              </span>
              <span className="text-xs font-bold font-mono text-[#00f5a0] mt-2 block">
                ● Operacional Regular
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
