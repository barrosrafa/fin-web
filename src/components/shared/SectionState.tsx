"use client";
export function SectionState({ loading, error, onRetry }: {
  loading?: boolean; error?: string | null; onRetry?: () => void;
}) {
  if (!loading && !error) return null;
  return <div role={error ? "alert" : "status"} className="p-4 rounded-xl border border-white/10 text-sm text-[#94a3b8]">
    {loading ? "Carregando dados…" : error}
    {error && onRetry && <button type="button" onClick={onRetry} className="ml-3 underline">Tentar novamente</button>}
  </div>;
}
