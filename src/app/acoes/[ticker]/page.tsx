import React, { Suspense } from "react";
import { AcaoDetailClient } from "./AcaoDetailClient";

export function generateStaticParams() {
  return [
    { ticker: "PETR4" },
    { ticker: "VALE3" },
    { ticker: "WEGE3" },
    { ticker: "BBAS3" },
    { ticker: "ITUB4" },
  ];
}

export default async function AcaoDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const resolved = await params;
  const ticker = (resolved.ticker || "PETR4").toUpperCase();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono">
          Carregando cockpit analítico de {ticker}...
        </div>
      }
    >
      <AcaoDetailClient ticker={ticker} />
    </Suspense>
  );
}
