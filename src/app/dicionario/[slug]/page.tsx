import React, { Suspense } from "react";
import { TermDetailClient } from "./TermDetailClient";

export function generateStaticParams() {
  return [
    { slug: "preco-justo-de-graham" },
    { slug: "preco-teto-de-bazin" },
    { slug: "ffo-funds-from-operations" },
    { slug: "numero-magico-magic-number" },
    { slug: "withholding-tax-irs" },
  ];
}

export default async function TermDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolved = await params;
  const slug = resolved.slug;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono">
          Carregando definição de {slug}...
        </div>
      }
    >
      <TermDetailClient slug={slug} />
    </Suspense>
  );
}
