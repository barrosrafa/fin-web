"use client";

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
        <span className="text-xs text-[#94a3b8] font-medium">
          Consultando dados...
        </span>
      </div>
    );
  }

  if (error) return <div role="alert" className="p-4 text-sm text-[#94a3b8]">
    Falha ao consultar dados. Os itens já carregados foram preservados.
    <button type="button" onClick={onRetry} className="ml-3 underline">Tentar novamente</button>
  </div>;

  if (count === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-[#131926]/60 border border-white/5 my-4">
        <div className="text-sm font-semibold text-white mb-1">{emptyMessage}</div>
        <p className="text-xs text-[#94a3b8]">
          Tente refinar sua busca por ticker, nome ou altere os filtros selecionados.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3">
      {windowStart > 0 && <button type="button" onClick={onPreviousWindow} className="text-sm underline">Voltar ao bloco anterior</button>}
      {windowFull && hasMore && <button type="button" onClick={onNextWindow} className="text-sm underline">Próximo bloco de {entityName}</button>}
      {windowStart > 0 && <p className="text-xs text-[#94a3b8]">Itens {windowStart + 1} a {windowStart + count} de {total}; memória limitada por bloco.</p>}
      {/* Sentinel element observed by IntersectionObserver */}
      {hasMore && !windowFull && <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />}

      {loadingMore && (
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#131926] border border-[#00f5a0]/30 text-xs text-[var(--positive)] animate-pulse">
          <div className="w-4 h-4 rounded-full border-2 border-[#00f5a0]/20 border-t-[#00f5a0] animate-spin" />
          <span>Carregando mais {entityName} do banco...</span>
        </div>
      )}

      {!hasMore && count > 0 && (
        <div className="text-center py-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#94a3b8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" />
            Fim da consulta: {total} {entityName}
          </span>
        </div>
      )}

      {hasMore && !windowFull && !loadingMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          className="mt-2 px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#94a3b8] hover:text-white transition-all cursor-pointer"
        >
          Carregar mais {entityName} ({count} de {total})
        </button>
      )}
    </div>
  );
}
