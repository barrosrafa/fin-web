import React, { useState } from "react";

export interface InteractivePill {
  pill_id: string;
  label: string;
  value: any;
  pill_type: string;
  modal_target: string;
  metadata?: Record<string, any>;
}

export interface FalsifiablePhraseCardProps {
  text: string;
  interactivePills: InteractivePill[];
  inferenceLog?: {
    user_id: string;
    portfolio_version_hash: string;
    template_id: string;
    created_at: string;
  };
  className?: string;
}

export const FalsifiablePhraseCard: React.FC<FalsifiablePhraseCardProps> = ({
  text,
  interactivePills,
  inferenceLog,
  className = "",
}) => {
  const [activeModal, setActiveModal] = useState<InteractivePill | null>(null);

  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden ${className}`}>
      {/* Glow highlight */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h4 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono">
            Comitê IA — Diagnóstico Portfolio-Aware
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60">
          Frase Falsificável &amp; Auditável
        </span>
      </div>

      {/* Statement Box */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 my-2">
        <p className="text-sm leading-relaxed text-slate-200">
          &ldquo;{text}&rdquo;
        </p>
      </div>

      {/* Interactive Pills */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <div className="text-[11px] font-medium text-slate-400 mb-2">
          Evidências Clicáveis (Auditoria Instantânea de Fatos):
        </div>
        <div className="flex flex-wrap gap-2">
          {interactivePills.map((pill) => (
            <button
              key={pill.pill_id}
              type="button"
              onClick={() => setActiveModal(pill)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-200 transition group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
              <span className="font-medium">{pill.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">↗</span>
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Footer */}
      {inferenceLog && (
        <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Hash Carteira: {inferenceLog.portfolio_version_hash.slice(0, 12)}...</span>
          <span>Template: {inferenceLog.template_id}</span>
          <span>{new Date(inferenceLog.created_at).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Proof Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h5 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Rastro de Auditoria: {activeModal.label}
              </h5>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="py-4 text-xs space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-500">Tipo de Dado:</span>
                <span className="font-mono text-slate-200">{activeModal.pill_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-500">Valor Auditado:</span>
                <span className="font-mono text-cyan-400 font-semibold">{String(activeModal.value)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/50">
                <span className="text-slate-500">Alvo de Prova:</span>
                <span className="font-mono text-slate-300">{activeModal.modal_target}</span>
              </div>
              {activeModal.metadata && Object.keys(activeModal.metadata).length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-1">Metadados de Proveniência:</span>
                  <pre className="bg-slate-950 p-2 rounded text-[11px] font-mono text-slate-400 overflow-x-auto border border-slate-800">
                    {JSON.stringify(activeModal.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
              >
                Fechar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
