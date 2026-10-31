"use client";

import { CmsText, CmsElement } from "@/components/content/Cms";
export function SectionState({ loading, error, onRetry }: {
  loading?: boolean; error?: string | null; onRetry?: () => void;
}) {
  if (!loading && !error) return null;
  return <div role={error ? "alert" : "status"} className="p-4 rounded-xl border border-white/10 text-sm text-[#94a3b8]">
    <CmsText>{loading ? "Carregando dados…" : error}</CmsText>
    <CmsText>{error && onRetry && <CmsElement feature="ui.components/shared/SectionState.button.1"><button type="button" onClick={onRetry} className="ml-3 underline"><CmsText>{"Tentar novamente"}</CmsText></button></CmsElement>}</CmsText>
  </div>;
}
