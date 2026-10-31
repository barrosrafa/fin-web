import React, { Suspense } from "react";
import { ETFDetailClient } from "./ETFDetailClient";

export function generateStaticParams() {
  return [
    { ticker: "BOVA11" },
    { ticker: "IVVB11" },
    { ticker: "SMAL11" },
  ];
}

export default async function ETFDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const resolved = await params;
  const ticker = (resolved.ticker || "BOVA11").toUpperCase();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono">
          Carregando cockpit analítico de ETF {ticker}...
        </div>
      }
    >
      <ETFDetailClient ticker={ticker} />
    </Suspense>
  );
}
