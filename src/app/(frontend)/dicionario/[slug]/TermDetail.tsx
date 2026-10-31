
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { GlossaryItem } from "@/lib/api";

export function TermDetail({ term }: { term: GlossaryItem | null }) {
  if (!term) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2"><CmsText>{"Definição indisponível"}</CmsText></h2>
        <CmsElement feature="ui.app/-frontend-/dicionario/-slug-/TermDetail.Link.1"><Link href="/dicionario" className="text-cyan-400 hover:underline text-sm"><CmsText>{"← Voltar ao Dicionário"}</CmsText></Link></CmsElement>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up">
      <div>
        <CmsElement feature="ui.app/-frontend-/dicionario/-slug-/TermDetail.Link.2"><Link href="/dicionario" className="text-xs text-cyan-400 hover:underline mb-2 inline-block"><CmsText>{"← Voltar para o Dicionário"}</CmsText></Link></CmsElement>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="cyan"><CmsText>{term.categoria}</CmsText></Badge>
          <span className="text-xs text-[#64748b]"><CmsText>{"Letra "}</CmsText><CmsText>{term.letra_inicial}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          <CmsText>{term.termo}</CmsText>
        </h1>
        <p className="text-base text-[#94a3b8] mt-2"><CmsText>{term.definicao_curta}</CmsText></p>
      </div>

      <CmsText>{term.formula_latex && (
        <CmsElement feature="ui.app/-frontend-/dicionario/-slug-/TermDetail.Card.3"><Card className="p-6 border border-emerald-500/20 bg-emerald-950/10">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2"><CmsText>{"Fórmula Matemática & Algoritmo"}</CmsText></span>
          <div className="font-mono text-base text-white bg-black/40 p-4 rounded-xl border border-white/10 overflow-x-auto">
            <CmsText>{term.formula_latex}</CmsText>
          </div>
        </Card></CmsElement>
      )}</CmsText>

      <CmsElement feature="ui.app/-frontend-/dicionario/-slug-/TermDetail.Card.4"><Card className="p-8 border border-white/10 bg-[#0f172a]/60">
        <h2 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-3"><CmsText>{"Explicação Detalhada & Aplicação Prática"}</CmsText></h2>
        <div className="prose prose-invert max-w-none text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-line">
          <CmsText>{term.conteudo_markdown || term.definicao_curta}</CmsText>
        </div>
      </Card></CmsElement>
    </div>
  );
}
