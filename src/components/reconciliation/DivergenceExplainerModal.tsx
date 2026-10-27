import React from "react";

export interface SourceComparisonItem {
  source: string;
  value: number;
  methodology: string;
  isAnchor?: boolean;
}

export interface DivergenceExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  ticker: string;
  metricName: string;
  taxonomyCode: string;
  taxonomyDisplayName: string;
  deltaPct: number;
  sources: SourceComparisonItem[];
  consensusRange: {
    min: number;
    max: number;
    iqr: number;
  };
}

export const DivergenceExplainerModal: React.FC<DivergenceExplainerProps> = ({
  isOpen,
  onClose,
  ticker,
  metricName,
  taxonomyCode,
  taxonomyDisplayName,
  deltaPct,
  sources,
  consensusRange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-slate-100">
                Por que meu número não bate?
              </h4>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {ticker} • {metricName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Reconciliação e Taxonomia de Divergência Multi-Fonte
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Taxonomy Badge */}
        <div className="my-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider font-mono">
              Causa Classificada: {taxonomyCode}
            </span>
          </div>
          <p className="text-xs text-amber-200/90 font-medium">
            {taxonomyDisplayName} (Discrepância de {deltaPct.toFixed(1)}%)
          </p>
        </div>

        {/* Side-by-Side Sources Table */}
        <div className="border border-slate-800 rounded-lg overflow-hidden my-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Fonte</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
                <th className="py-2.5 px-3">Metodologia Declarada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sources.map((s) => (
                <tr key={s.source} className={s.isAnchor ? "bg-cyan-950/20" : ""}>
                  <td className="py-2.5 px-3 font-medium flex items-center gap-1.5">
                    {s.source}
                    {s.isAnchor && (
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 rounded font-mono">
                        ÂNCORA
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-100">
                    {s.value.toFixed(2)}%
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{s.methodology}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Consensus Interval */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Intervalo de Consenso:</span>
          <span className="text-slate-200 font-semibold">
            [{consensusRange.min.toFixed(2)}% — {consensusRange.max.toFixed(2)}%] (Spread: {consensusRange.iqr.toFixed(2)}%)
          </span>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
