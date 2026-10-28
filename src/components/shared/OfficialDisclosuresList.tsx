"use client";

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
    <Card glow="cyan" className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold">
              Divulgações Oficiais CVM & B3
            </span>
            <Badge variant="cyan">{disclosures.length} Documentos Auditados</Badge>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
            Comunicados, Fatos Relevantes e Relatórios {ticker}
          </h2>
        </div>

        {types.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                filterType === "ALL"
                  ? "bg-[#00d9f5]/15 text-[#00d9f5] border border-[#00d9f5]/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white border border-white/5"
              }`}
            >
              Todos ({disclosures.length})
            </button>
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors whitespace-nowrap ${
                  filterType === t
                    ? "bg-[#00d9f5]/15 text-[#00d9f5] border border-[#00d9f5]/30"
                    : "bg-white/5 text-[#94a3b8] hover:text-white border border-white/5"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#94a3b8] bg-white/[0.01] rounded-2xl border border-white/5">
          Nenhum comunicado encontrado para a categoria selecionada.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((doc) => (
            <div
              key={doc.document_id}
              className="p-4 rounded-2xl bg-[#0c1017] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-2 group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(doc.document_type)}>
                    {doc.document_type}
                  </Badge>
                  {doc.ai_sentiment && (
                    <Badge variant={getSentimentVariant(doc.ai_sentiment)}>
                      Impacto {doc.ai_sentiment}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-[#64748b]">
                  <span>
                    📅 {new Date(doc.document_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                  {doc.source_url && (
                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00d9f5] hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      Ver no CVM/B3 ↗
                    </a>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-[#00d9f5] transition-colors leading-snug">
                {doc.title}
              </h3>

              {doc.ai_summary && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[#94a3b8] leading-relaxed flex items-start gap-2">
                  <span className="text-sm select-none">💡</span>
                  <div>
                    <strong className="text-white block mb-0.5">Síntese de Inteligência:</strong>
                    {doc.ai_summary}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
        <span>Documentos sincronizados em tempo real com o Sistema CVM / B3 Empresa Net</span>
        <span>Auditoria canônica verificada</span>
      </div>
    </Card>
  );
}
