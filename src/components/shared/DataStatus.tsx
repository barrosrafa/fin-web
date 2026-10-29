import type { DataProvenance } from "@/schemas/data-provenance";
const labels = {
  loading: "Carregando", missing: "Dado indisponível", stale: "Dado desatualizado",
  demo: "Dados fictícios — demonstração", estimated: "Estimativa", periodic: "Atualização periódica",
};
export function DataStatus({ mode, source, asOf, collectedAt }: DataProvenance) {
  return <p role="status" className="text-xs text-[#94a3b8] leading-relaxed">
    {labels[mode]} • Fonte: {source || "não informada"} • Data-base: {asOf || "não informada"}
    {collectedAt && <> • Coletado em: <time dateTime={collectedAt}>{collectedAt}</time></>}
  </p>;
}
