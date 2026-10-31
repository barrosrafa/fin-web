"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FIIDisclosureItem } from "@/lib/api";

export interface OfficialDisclosuresListProps {
  disclosures?: FIIDisclosureItem[];
  ticker: string;
}

export function OfficialDisclosuresList({
  disclosures = [],
  ticker,
}: OfficialDisclosuresListProps) {
  const [filterType, setFilterType] = useState<string>("ALL");

  const types = Array.from(
    new Set(disclosures.map((d) => d.document_type).filter(Boolean))
  );

  const filtered = disclosures.filter((d) => {
    if (filterType === "ALL") return true;
    return d.document_type === filterType;
  });

  const getBadgeVariant = (type: string): "amber" | "emerald" | "cyan" | "violet" => {
    const t = type.toUpperCase();
    if (t.includes("FATO RELEVANTE") || t.includes("FR")) return "amber";
    if (t.includes("RELATÓRIO") || t.includes("GERENCIAL")) return "emerald";
    if (t.includes("AVISO")) return "cyan";
    return "violet";
  };

  const getSentimentVariant = (sentiment?: string): "emerald" | "crimson" | "cyan" => {
    const s = (sentiment || "").toUpperCase();
    if (s.includes("BULLISH") || s.includes("POSITIVO")) return "emerald";
    if (s.includes("BEARISH") || s.includes("NEGATIVO")) return "crimson";
    return "cyan";
  };

  return (
    <CmsElement feature="ui.components/shared/OfficialDisclosuresList.Card.1"><Card glow="cyan" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold"><CmsText>{"Divulgações Oficiais CVM & B3"}</CmsText></span>
            <Badge variant="cyan"><CmsText>{disclosures.length}</CmsText><CmsText>{" Documentos Auditados"}</CmsText></Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight"><CmsText>{"Comunicados, Fatos Relevantes e Relatórios "}</CmsText><CmsText>{ticker}</CmsText>
          </h2>
        </div>

        <CmsText>{types.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <CmsElement feature="ui.components/shared/OfficialDisclosuresList.button.2"><button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                filterType === "ALL"
                  ? "bg-[#00d9f5]/15 text-[#00d9f5] border border-[#00d9f5]/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white border border-white/5"
              }`}
            ><CmsText>{"Todos ("}</CmsText><CmsText>{disclosures.length}</CmsText><CmsText>{")"}</CmsText></button></CmsElement>
            <CmsText>{types.map((t) => (
              <CmsElement feature="ui.components/shared/OfficialDisclosuresList.button.3" key={t}><button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                  filterType === t
                    ? "bg-[#00d9f5]/15 text-[#00d9f5] border border-[#00d9f5]/30"
                    : "bg-white/5 text-[#94a3b8] hover:text-white border border-white/5"
                }`}
              >
                <CmsText>{t}</CmsText>
              </button></CmsElement>
            ))}</CmsText>
          </div>
        )}</CmsText>
      </div>

      <CmsText>{filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94a3b8] bg-white/[0.01] rounded-2xl border border-white/5"><CmsText>{"Nenhum comunicado encontrado para a categoria selecionada."}</CmsText></div>
      ) : (
        <div className="flex flex-col gap-3">
          <CmsText>{filtered.map((doc) => (
            <div
              key={doc.document_id}
              className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(doc.document_type)}>
                    <CmsText>{doc.document_type}</CmsText>
                  </Badge>
                  <CmsText>{doc.ai_sentiment && (
                    <Badge variant={getSentimentVariant(doc.ai_sentiment)}><CmsText>{"Impacto "}</CmsText><CmsText>{doc.ai_sentiment}</CmsText>
                    </Badge>
                  )}</CmsText>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#64748b]">
                  <span><CmsText>{"📅 "}</CmsText><CmsText>{new Date(doc.document_date + "T00:00:00").toLocaleDateString("pt-BR")}</CmsText>
                  </span>
                  <CmsText>{doc.source_url && (
                    <CmsElement feature="ui.components/shared/OfficialDisclosuresList.a.4"><a
                      href={doc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00d9f5] hover:underline inline-flex items-center gap-1 font-bold"
                    ><CmsText>{"Ver no CVM/B3 ↗"}</CmsText></a></CmsElement>
                  )}</CmsText>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#00d9f5] transition-colors leading-snug">
                <CmsText>{doc.title}</CmsText>
              </h3>

              <CmsText>{doc.ai_summary && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#94a3b8] leading-relaxed flex items-start gap-2">
                  <span className="text-sm select-none"><CmsText>{"💡"}</CmsText></span>
                  <div>
                    <strong className="text-white block mb-0.5"><CmsText>{"Síntese de Inteligência:"}</CmsText></strong>
                    <CmsText>{doc.ai_summary}</CmsText>
                  </div>
                </div>
              )}</CmsText>
            </div>
          ))}</CmsText>
        </div>
      )}</CmsText>

      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
        <span><CmsText>{"Documentos sincronizados em tempo real com o Sistema CVM / B3 Empresa Net"}</CmsText></span>
        <span><CmsText>{"Auditoria canônica verificada"}</CmsText></span>
      </div>
    </Card></CmsElement>
  );
}
