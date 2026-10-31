
import { CmsText } from "@/components/content/Cms";
import React, { Suspense } from "react";
import { ComparadorClient } from "./ComparadorClient";

export default function ComparadorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono"><CmsText>{"Carregando comparador de ativos..."}</CmsText></div>
      }
    >
      <ComparadorClient />
    </Suspense>
  );
}
