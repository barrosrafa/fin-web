
import { CmsText } from "@/components/content/Cms";
import React, { Suspense } from "react";
import { TermDetail } from "./TermDetail";
import { cacheLife } from "next/cache";
import type { Metadata } from "next";
import type { GlossaryItem } from "@/lib/api";
import { readPublicJson } from "@/lib/server/stock";

async function getTerm(slug: string) {
  "use cache";
  const term = await readPublicJson<GlossaryItem>(`/cms/glossary/${encodeURIComponent(slug)}`);
  cacheLife(term ? { stale: 300, revalidate: 3600, expire: 86400 } : { stale: 30, revalidate: 30, expire: 300 });
  return term;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = await getTerm(slug);
  return { title: `${term?.termo || slug} — Dicionário FIN`, description: term?.definicao_curta,
    alternates: { canonical: `/dicionario/${encodeURIComponent(slug)}` } };
}

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
  const term = await getTerm(slug);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono"><CmsText>{"Carregando definição de "}</CmsText><CmsText>{slug}</CmsText><CmsText>{"..."}</CmsText></div>
      }
    >
      <TermDetail term={term} />
    </Suspense>
  );
}
