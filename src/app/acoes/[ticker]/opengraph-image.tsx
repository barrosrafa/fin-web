import { ImageResponse } from "next/og";
import { getPublicStock } from "@/lib/server/stock";
import { formatCurrency } from "@/lib/formatters";
export const alt = "FIN — análise de ações";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image({ params }: { params: Promise<{ ticker: string }> }) {
  const ticker = (await params).ticker.toUpperCase();
  const { details } = await getPublicStock(ticker);
  // Price is published only when its reference date is known.
  const date = details?.details.data_cotacao;
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, width: "100%", height: "100%", background: "#0c1017", color: "#f0f4f8", fontFamily: "sans-serif" }}>
    <div style={{ fontSize: 28, color: "#00d9f5" }}>FIN • Análise de ações • BRL</div>
    <div style={{ fontSize: 80, marginTop: 32 }}>{ticker}</div>
    <div style={{ fontSize: 32 }}>{details?.details.name || "Cadastro do instrumento"}</div>
    <div style={{ fontSize: 28, marginTop: 40 }}>{date ? `${formatCurrency(details?.details.current_price ?? Number.NaN)} • Referência: ${date}` : "Preço com data-base indisponível"}</div>
  </div>, size);
}
