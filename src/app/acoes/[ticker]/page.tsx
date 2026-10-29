import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { AcaoDetailClient } from "./AcaoDetailClient";
import { getPublicStock, siteUrl } from "@/lib/server/stock";
import { formatCurrency } from "@/lib/formatters";
import { DataStatus } from "@/components/shared/DataStatus";

type Props = { params: Promise<{ ticker: string }> };
export function generateStaticParams() {
  return ["PETR4", "VALE3", "WEGE3", "BBAS3", "ITUB4"].map(ticker => ({ ticker }));
}
function normalize(ticker: string) {
  if (!/^[a-z0-9]{4,12}$/i.test(ticker)) notFound();
  return ticker.toUpperCase();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ticker = normalize((await params).ticker);
  const { details } = await getPublicStock(ticker);
  const name = details?.details.name || ticker;
  const title = `${ticker} — ${name} | FIN`;
  const description = `Consulte ${ticker} (${name}): cadastro, histórico de preços, fundamentos e estimativas de valuation. Confira a data-base e a origem dos dados.`;
  const url = `${siteUrl}/acoes/${ticker}`;
  return {
    title, description, alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", locale: "pt_BR",
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: `${ticker} — análise FIN` }] },
    twitter: { card: "summary_large_image", title, description },
  };
}
async function StockContent({ ticker }: { ticker: string }) {
  const { details, valuation, history } = await getPublicStock(ticker);
  const name = details?.details.name || ticker;
  const url = `${siteUrl}/acoes/${ticker}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": url, url, name: `${ticker} — ${name}`, inLanguage: "pt-BR", about: { "@id": `${url}#instrument` } },
      { "@type": "FinancialProduct", "@id": `${url}#instrument`, name: `${ticker} — ${name}`, identifier: `B3:${ticker}`, url },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ações", item: `${siteUrl}/acoes` },
        { "@type": "ListItem", position: 2, name: ticker, item: url },
      ] },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    <section aria-label={`Cadastro público de ${ticker}`} className="mb-6 p-4 rounded-xl border border-white/10">
      <h1 className="text-xl font-bold">{ticker} — {name}</h1>
      <p className="text-sm text-[#94a3b8]">Instrumento B3:{ticker}{details?.details.sector ? ` • Setor: ${details.details.sector}` : ""}. Preços em BRL.</p>
      <DataStatus mode={details ? "periodic" : "missing"} asOf={details?.details.data_cotacao} />
      {history?.data?.length ? <table className="text-sm w-full mt-3">
        <caption className="text-left">Histórico de referência — fechamento nominal em BRL; últimos registros disponíveis. Fonte documental não informada.</caption>
        <thead><tr><th scope="col" className="text-left">Data</th><th scope="col" className="text-right">Fechamento</th></tr></thead>
        <tbody>{history.data.map(row => <tr key={row.date}><th scope="row" className="text-left"><time dateTime={row.date}>{row.date}</time></th><td className="text-right">{formatCurrency(row.close)}</td></tr>)}</tbody>
      </table> : <p className="text-sm">Histórico indisponível.</p>}
    </section>
    <Suspense fallback={<p>Carregando ferramentas de análise…</p>}>
      <AcaoDetailClient key={ticker} ticker={ticker} initialDetails={details} initialValuation={valuation} />
    </Suspense>
  </>;
}
export default async function AcaoDetailPage({ params }: Props) {
  const raw = (await params).ticker;
  const ticker = normalize(raw);
  if (raw !== ticker) permanentRedirect(`/acoes/${ticker}`);
  return <StockContent ticker={ticker} />;
}
