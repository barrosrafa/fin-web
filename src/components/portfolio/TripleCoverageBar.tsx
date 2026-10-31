
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";

export interface TripleCoverageProps {
  pctResolved: number;
  pctTemporaryPending: number;
  pctStructureOpaque: number;
  className?: string;
}

export const TripleCoverageBar: React.FC<TripleCoverageProps> = ({
  pctResolved,
  pctTemporaryPending,
  pctStructureOpaque,
  className = "",
}) => {
  const total = Math.max(pctResolved + pctTemporaryPending + pctStructureOpaque, 100.0);
  const resolvedWidth = Math.min((pctResolved / total) * 100, 100);
  const pendingWidth = Math.min((pctTemporaryPending / total) * 100, 100 - resolvedWidth);
  const opaqueWidth = Math.min((pctStructureOpaque / total) * 100, 100 - resolvedWidth - pendingWidth);

  return (
    <div className={`w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400"><CmsText>{"Transparência Radical de Cobertura"}</CmsText></span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20"><CmsText>{"Fosso de Confiança"}</CmsText></span>
        </div>
        <span className="text-sm font-mono font-medium text-slate-200">
          <CmsText>{pctResolved.toFixed(1)}</CmsText><CmsText>{"% Mapeado"}</CmsText></span>
      </div>

      {/* Tripartite Bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800">
        <CmsElement><div
          style={{ width: `${resolvedWidth}%` }}
          className="h-full bg-emerald-500 rounded-l-full transition-all duration-500 hover:brightness-110"
          title={`Resolvido: ${pctResolved.toFixed(1)}%`}
        /></CmsElement>
        <CmsElement><div
          style={{ width: `${pendingWidth}%` }}
          className="h-full bg-amber-500 transition-all duration-500 hover:brightness-110"
          title={`Pendente de Curadoria: ${pctTemporaryPending.toFixed(1)}%`}
        /></CmsElement>
        <CmsElement><div
          style={{ width: `${opaqueWidth}%` }}
          className="h-full bg-slate-600 rounded-r-full transition-all duration-500 hover:brightness-110"
          title={`Estruturalmente Opaco: ${pctStructureOpaque.toFixed(1)}%`}
        /></CmsElement>
      </div>

      {/* Legend & Semantics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-slate-200"><CmsText>{pctResolved.toFixed(1)}</CmsText><CmsText>{"% Resolvido"}</CmsText></div>
            <div className="text-[11px] text-slate-400"><CmsText>{"ANBIMA Data / Base Curada"}</CmsText></div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-slate-200"><CmsText>{pctTemporaryPending.toFixed(1)}</CmsText><CmsText>{"% Temporário"}</CmsText></div>
            <div className="text-[11px] text-slate-400"><CmsText>{"Ofertas pré-dez/25 em curadoria"}</CmsText></div>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-slate-200"><CmsText>{pctStructureOpaque.toFixed(1)}</CmsText><CmsText>{"% Estrutural"}</CmsText></div>
            <div className="text-[11px] text-slate-400"><CmsText>{"CRI pulverizado sem devedor > 20%"}</CmsText></div>
          </div>
        </div>
      </div>
    </div>
  );
};
