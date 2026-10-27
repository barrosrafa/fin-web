import React, { useState } from "react";

export interface ContributingAsset {
  ticker: string;
  assetClass: string;
  allocationPct: number;
  effectiveExposurePct: number;
}

export interface DebtorItem {
  entityName: string;
  totalExposurePct: number;
  isLevel0?: boolean;
  rating?: string;
  ratingAgency?: string;
  contributingAssets: Array<{
    ticker: string;
    assetClass: string;
    allocationPct: number;
    effectiveExposurePct: number;
  }>;
}

export interface DebtorConcentrationCardProps {
  debtors: DebtorItem[];
  userThresholdPct?: number;
  onOpenOverride?: (entityName: string) => void;
  className?: string;
}

export const DebtorConcentrationCard: React.FC<DebtorConcentrationCardProps> = ({
  debtors,
  userThresholdPct = 25.0,
  onOpenOverride,
  className = "",
}) => {
  const [viewScope, setViewScope] = useState<"ALL" | "CREDIT_ONLY">("ALL");

  const filteredDebtors = debtors.filter((d) => {
    if (viewScope === "CREDIT_ONLY") {
      return !d.isLevel0;
    }
    return true;
  });

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg ${className}`}>
      {/* Header & View Scope Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">
              Concentração Real por Devedor (Look-Through)
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-mono">
              Multi-Fonte
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Desdobramento de FIIs de papel, fundos CVM 175 e CRIs consolidados por grupo econômico
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewScope("ALL")}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              viewScope === "ALL"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Carteira Global
          </button>
          <button
            type="button"
            onClick={() => setViewScope("CREDIT_ONLY")}
            className={`px-2.5 py-1 rounded-md transition font-medium ${
              viewScope === "CREDIT_ONLY"
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Fatia de Crédito / FIIs
          </button>
        </div>
      </div>

      {/* Debtors List */}
      <div className="mt-4 divide-y divide-slate-800/60">
        {filteredDebtors.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-mono">
            Nenhum ativo de crédito ou FII encontrado na seleção.
          </div>
        ) : (
          filteredDebtors.map((debtor) => {
          const isOverThreshold = debtor.totalExposurePct > userThresholdPct && !debtor.isLevel0;

          return (
            <div key={debtor.entityName} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-200">{debtor.entityName}</span>
                  {debtor.isLevel0 && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                      Ação Direta
                    </span>
                  )}
                  {debtor.rating && (
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded font-mono">
                      Rating {debtor.rating} ({debtor.ratingAgency || "CVM"})
                    </span>
                  )}
                  {isOverThreshold && (
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-mono">
                      Acima do Limiar ({userThresholdPct}%)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-semibold text-sm ${
                      isOverThreshold ? "text-rose-400" : "text-slate-100"
                    }`}
                  >
                    {debtor.totalExposurePct.toFixed(2)}%
                  </span>
                  {onOpenOverride && !debtor.isLevel0 && (
                    <button
                      type="button"
                      onClick={() => onOpenOverride(debtor.entityName)}
                      className="text-[11px] text-slate-400 hover:text-cyan-400 underline transition"
                    >
                      Ajustar
                    </button>
                  )}
                </div>
              </div>

              {/* Contributing Assets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500">Origem:</span>
                {debtor.contributingAssets.map((asset) => (
                  <span
                    key={asset.ticker}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300"
                  >
                    <span>{asset.ticker}</span>
                    <span className="text-slate-500">({asset.effectiveExposurePct.toFixed(1)}%)</span>
                  </span>
                ))}
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};
