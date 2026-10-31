"use client";

import React, { useState, useEffect } from "react";
import { TripleCoverageBar } from "@/components/portfolio/TripleCoverageBar";
import { DebtorConcentrationCard, DebtorItem } from "@/components/portfolio/DebtorConcentrationCard";
import { FalsifiablePhraseCard } from "@/components/intelligence/FalsifiablePhraseCard";
import { DivergenceExplainerModal } from "@/components/reconciliation/DivergenceExplainerModal";
import { API_BASE } from "@/lib/api";

export default function DebtorAnalysisPage() {
  const [isDivergenceModalOpen, setIsDivergenceModalOpen] = useState(false);
  const [overrideEntity, setOverrideEntity] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [debtors, setDebtors] = useState<DebtorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDebtors() {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE}/portfolio/demo-investor-001/debtor-concentration`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.debtors && data.debtors.length > 0) {
            setDebtors(data.debtors.map((d: { debtor_name?: string; entityName: string; total_exposure_pct?: number; totalExposurePct: number; is_level_0?: boolean; rating?: string; rating_agency?: string; contributing_assets?: { ticker: string; asset_class: string; allocation_pct: number; effective_exposure_pct: number }[] }) => ({
              entityName: d.debtor_name || d.entityName,
              totalExposurePct: d.total_exposure_pct ?? d.totalExposurePct,
              isLevel0: d.is_level_0 ?? false,
              rating: d.rating,
              ratingAgency: d.rating_agency,
              contributingAssets: (d.contributing_assets || []).map((a) => ({
                ticker: a.ticker,
                assetClass: a.asset_class,
                allocationPct: a.allocation_pct,
                effectiveExposurePct: a.effective_exposure_pct,
              }))
            })));
          }
        }
      } catch (e) {
        console.error('Failed to load real debtor concentration:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDebtors();
  }, []);

  const handleApplyOverride = async () => {
    if (!overrideEntity) return;

    try {
      await fetch(`${API_BASE}/portfolio/demo-investor-001/overrides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_asset_id: "KNIP11",
          target_entity_name: overrideEntity,
          override_type: "EXCLUDE_EDGE",
          reason: "User manual exclusion via Cockpit",
        }),
      });
    } catch {
      // Optimistic client-side fallback if API is offline
    }

    // Exclude selected entity locally
    setDebtors((prev) => prev.filter((d) => d.entityName !== overrideEntity));
    setSuccessToast(`Ajuste local persistido para ${overrideEntity}! Aresta desconsiderada na sua carteira.`);
    setOverrideEntity(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                NOVA ENGINE v3.5
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Cockpit de Concentração por Devedor &amp; Reconciliação
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Desdobramento de FIIs e Fundos via CDA CVM 175 e ANBIMA Data com auditoria falsificável
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDivergenceModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 text-xs font-medium transition shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Por que meu número não bate? (KNIP11)
          </button>
        </div>

        {/* Toast Alert */}
        {successToast && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 flex items-center justify-between animate-in fade-in">
            <span>✓ {successToast}</span>
            <button type="button" onClick={() => setSuccessToast(null)} className="text-slate-400 hover:text-white">
              &times;
            </button>
          </div>
        )}

        {/* 1. Radical Coverage Bar (v1 Invariant) */}
        <TripleCoverageBar
          pctResolved={88.0}
          pctTemporaryPending={8.0}
          pctStructureOpaque={4.0}
        />

        {/* 2. Falsifiable AI Committee Phrase */}
        <FalsifiablePhraseCard
          text="Sua exposição a crédito imobiliário de papel é 34.0% do patrimônio — soma de KNIP11 (22.0%), Fundo CVM 175 Y (9.0%) e CRI JHSF 129S (3.0%). O rating do CRI JHSF 129S caiu de AA para A em 12/09 (fonte: Brick360, atualizado 14:32). O KNIP11 tem 18.5% do PL no mesmo emissor (fonte: Clube FII / SiiLA). Você não tem concentração por ticker — tem concentração por devedor."
          interactivePills={[
            {
              pill_id: "p1",
              label: "34.0%",
              value: 34.0,
              pill_type: "PERCENTAGE",
              modal_target: "MODAL_CALCULATION_TREE",
              metadata: { grupo: "Grupo JHSF", componentes: ["KNIP11", "Fundo Y", "CRI 129S"] },
            },
            {
              pill_id: "p2",
              label: "Brick360",
              value: "A",
              pill_type: "SOURCE_PROVENANCE",
              modal_target: "MODAL_SOURCE_PROOF",
              metadata: { data: "12/09/2026", hora: "14:32", rating_anterior: "AA" },
            },
            {
              pill_id: "p3",
              label: "Clube FII / SiiLA",
              value: 18.5,
              pill_type: "SOURCE_PROVENANCE",
              modal_target: "MODAL_SOURCE_PROOF",
              metadata: { fundo: "KNIP11", informe_competencia: "08/2026" },
            },
          ]}
          inferenceLog={{
            user_id: "demo-investor-001",
            portfolio_version_hash: "a9f8b4c2e17d",
            template_id: "portfolio_debtor_concentration_v1",
            created_at: "2026-10-26T23:30:00.000Z",
          }}
        />

        {/* 3. Debtor Concentration Card */}
        <DebtorConcentrationCard
          debtors={debtors}
          userThresholdPct={25.0}
          onOpenOverride={(entity) => setOverrideEntity(entity)}
        />

        {/* Override Modal */}
        {overrideEntity && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl">
              <h4 className="font-semibold text-sm text-slate-100 mb-2">
                Ajuste Local de Mapeamento: {overrideEntity}
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Este ajuste afetará apenas a sua conta pessoal, persistindo mesmo após novas ingestões mensais da CVM.
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleApplyOverride}
                  className="w-full py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition"
                >
                  Excluir aresta da minha carteira
                </button>
                <button
                  type="button"
                  onClick={() => setOverrideEntity(null)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Source Divergence Explainer Modal */}
        <DivergenceExplainerModal
          isOpen={isDivergenceModalOpen}
          onClose={() => setIsDivergenceModalOpen(false)}
          ticker="KNIP11"
          metricName="Dividend Yield 12M"
          taxonomyCode="DIVIDEND_WINDOW_MISMATCH"
          taxonomyDisplayName="Janela de Proventos Divergente (12M LTM vs Anualização)"
          deltaPct={3.8}
          consensusRange={{ min: 7.90, max: 8.20, iqr: 0.30 }}
          sources={[
            {
              source: "Status Invest",
              value: 8.20,
              methodology: "12 meses corridos (LTM)",
              isAnchor: true,
            },
            {
              source: "Funds Explorer",
              value: 7.90,
              methodology: "Último provento pago anualizado",
              isAnchor: false,
            },
          ]}
        />
      </div>
    </div>
  );
}
