"use client";
import { useEffect, useState } from "react";
import { quoteProvenance } from "@/lib/quote-provenance";

import { CmsText } from "@/components/content/Cms";
import type { DataProvenance } from "@/schemas/data-provenance";
const labels = {
  loading: "Carregando", missing: "Dado indisponível", stale: "Dado desatualizado",
  demo: "Dados fictícios — demonstração", estimated: "Estimativa", periodic: "Atualização periódica",
};
export function DataStatus({ mode, source, asOf, collectedAt }: DataProvenance) {
  const [now, setNow] = useState<number>();
  useEffect(() => {
    // Evaluate age after hydration; fact date is never replaced by render time.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
  }, [mode, source, asOf]);
  const resolvedMode = mode === "periodic" && source && asOf ? quoteProvenance(source, asOf, now).mode : mode;
  return <p role="status" className="text-xs text-[#94a3b8] leading-relaxed">
    <CmsText>{labels[resolvedMode]}</CmsText><CmsText>{" • Fonte: "}</CmsText><CmsText>{source || "não informada"}</CmsText><CmsText>{" • Data-base: "}</CmsText><CmsText>{asOf || "não informada"}</CmsText>
    <CmsText>{collectedAt && <><CmsText>{" • Coletado em: "}</CmsText><time dateTime={collectedAt}><CmsText>{collectedAt}</CmsText></time></>}</CmsText>
  </p>;
}
