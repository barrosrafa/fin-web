import React, { Suspense } from "react";
import { Metadata } from "next";
import { CanonicalPairClient } from "./CanonicalPairClient";

export function generateStaticParams() {
  return [
    { tickerA: "cdib11", tickerB: "lftb11" },
    { tickerA: "blft11", tickerB: "lfts11" },
    { tickerA: "bova11", tickerB: "smal11" },
    { tickerA: "ivvb11", tickerB: "spxi11" },
    { tickerA: "b5p211", tickerB: "b5mb11" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tickerA: string; tickerB: string }>;
}): Promise<Metadata> {
  const { tickerA, tickerB } = await params;
  const a = (tickerA || "CDIB11").toUpperCase();
  const b = (tickerB || "LFTB11").toUpperCase();

  return {
    title: `${a} x ${b}: Qual é melhor? Compare Taxas, Carteira e Retorno - ETFs Brasil`,
    description: `${a} ou ${b}? Veja lado a lado a rentabilidade histórica, taxa de administração total (TER), volatilidade, sobreposição de ativos na carteira e liquidez.`,
    alternates: {
      canonical: `https://www.etfsbrasil.com.br/comparador/${tickerA.toLowerCase()}/${tickerB.toLowerCase()}`,
    },
  };
}

export default async function CanonicalPairComparatorPage({
  params,
}: {
  params: Promise<{ tickerA: string; tickerB: string }>;
}) {
  const { tickerA, tickerB } = await params;
  const a = (tickerA || "CDIB11").toUpperCase();
  const b = (tickerB || "LFTB11").toUpperCase();

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono">
          Carregando comparação {a} vs {b}...
        </div>
      }
    >
      <CanonicalPairClient tickerA={a} tickerB={b} />
    </Suspense>
  );
}
