
import { CmsText } from "@/components/content/Cms";
import type { DataProvenance } from "@/schemas/data-provenance";
const labels = {
  loading: "Carregando", missing: "Dado indisponível", stale: "Dado desatualizado",
  demo: "Dados fictícios — demonstração", estimated: "Estimativa", periodic: "Atualização periódica",
};
export function DataStatus({ mode, source, asOf, collectedAt }: DataProvenance) {
  return <p role="status" className="text-xs text-[#94a3b8] leading-relaxed">
    <CmsText>{labels[mode]}</CmsText><CmsText>{" • Fonte: "}</CmsText><CmsText>{source || "não informada"}</CmsText><CmsText>{" • Data-base: "}</CmsText><CmsText>{asOf || "não informada"}</CmsText>
    <CmsText>{collectedAt && <><CmsText>{" • Coletado em: "}</CmsText><time dateTime={collectedAt}><CmsText>{collectedAt}</CmsText></time></>}</CmsText>
  </p>;
}
