
import { CmsText } from "@/components/content/Cms";
import React, { Suspense } from "react";
import { FIIDetailClient } from "./FIIDetailClient";

export function generateStaticParams() {
  return [
    { ticker: "HGLG11" },
    { ticker: "KNIP11" },
    { ticker: "MXRF11" },
  ];
}

export default async function FIIDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const resolved = await params;
  const ticker = (resolved.ticker || "HGLG11").toUpperCase();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono"><CmsText>{"Carregando cockpit imobiliário de "}</CmsText><CmsText>{ticker}</CmsText><CmsText>{"..."}</CmsText></div>
      }
    >
      <FIIDetailClient ticker={ticker} />
    </Suspense>
  );
}
