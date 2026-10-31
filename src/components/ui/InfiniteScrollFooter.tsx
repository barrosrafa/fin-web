"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";

interface InfiniteScrollFooterProps {
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  count: number;
  total: number;
  sentinelRef: (node: HTMLElement | null) => void;
  onLoadMore?: () => void;
  entityName?: string;
  emptyMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  windowStart?: number;
  windowFull?: boolean;
  onNextWindow?: () => void;
  onPreviousWindow?: () => void;
}

export function InfiniteScrollFooter({
  error, onRetry, windowStart = 0, windowFull = false, onNextWindow, onPreviousWindow,
  loading,
  loadingMore,
  hasMore,
  count,
  total,
  sentinelRef,
  onLoadMore,
  entityName = "ativos",
  emptyMessage = "Nenhum resultado encontrado.",
}: InfiniteScrollFooterProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#00f5a0]/20 border-t-[#00f5a0] animate-spin" />
        <span className="text-xs text-[#94a3b8] font-medium"><CmsText>{"Consultando dados..."}</CmsText></span>
      </div>
    );
  }

  if (error) return <div role="alert" className="p-4 text-sm text-[#94a3b8]"><CmsText>{"Falha ao consultar dados. Os itens já carregados foram preservados."}</CmsText><CmsElement feature="ui.components/ui/InfiniteScrollFooter.button.1"><button type="button" onClick={onRetry} className="ml-3 underline"><CmsText>{"Tentar novamente"}</CmsText></button></CmsElement>
  </div>;

  if (count === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#131926]/60 border border-white/5 my-4">
        <div className="text-sm font-semibold text-white mb-1"><CmsText>{emptyMessage}</CmsText></div>
        <p className="text-xs text-[#94a3b8]"><CmsText>{"Tente refinar sua busca por ticker, nome ou altere os filtros selecionados."}</CmsText></p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      <CmsText>{windowStart > 0 && <CmsElement feature="ui.components/ui/InfiniteScrollFooter.button.2"><button type="button" onClick={onPreviousWindow} className="text-sm underline"><CmsText>{"Voltar ao bloco anterior"}</CmsText></button></CmsElement>}</CmsText>
      <CmsText>{windowFull && hasMore && <CmsElement feature="ui.components/ui/InfiniteScrollFooter.button.3"><button type="button" onClick={onNextWindow} className="text-sm underline"><CmsText>{"Próximo bloco de "}</CmsText><CmsText>{entityName}</CmsText></button></CmsElement>}</CmsText>
      <CmsText>{windowStart > 0 && <p className="text-xs text-[#94a3b8]"><CmsText>{"Itens "}</CmsText><CmsText>{windowStart + 1}</CmsText><CmsText>{" a "}</CmsText><CmsText>{windowStart + count}</CmsText><CmsText>{" de "}</CmsText><CmsText>{total}</CmsText><CmsText>{"; memória limitada por bloco."}</CmsText></p>}</CmsText>
      {/* Sentinel element observed by IntersectionObserver */}
      <CmsText>{hasMore && !windowFull && <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />}</CmsText>

      <CmsText>{loadingMore && (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#131926] border border-[#00f5a0]/30 text-xs text-[var(--positive)] animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-[#00f5a0]/20 border-t-[#00f5a0] animate-spin" />
          <span><CmsText>{"Carregando mais "}</CmsText><CmsText>{entityName}</CmsText><CmsText>{" do banco..."}</CmsText></span>
        </div>
      )}</CmsText>

      <CmsText>{!hasMore && count > 0 && (
        <div className="text-center py-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#94a3b8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" /><CmsText>{"Fim da consulta: "}</CmsText><CmsText>{total}</CmsText> <CmsText>{entityName}</CmsText>
          </span>
        </div>
      )}</CmsText>

      <CmsText>{hasMore && !windowFull && !loadingMore && onLoadMore && (
        <CmsElement feature="ui.components/ui/InfiniteScrollFooter.button.4"><button
          type="button"
          onClick={onLoadMore}
          className="mt-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#94a3b8] hover:text-white transition-all cursor-pointer"
        ><CmsText>{"Carregar mais "}</CmsText><CmsText>{entityName}</CmsText><CmsText>{" ("}</CmsText><CmsText>{count}</CmsText><CmsText>{" de "}</CmsText><CmsText>{total}</CmsText><CmsText>{")"}</CmsText></button></CmsElement>
      )}</CmsText>
    </div>
  );
}
