import type { TradingStatus } from "@/lib/api";

export function TradingStatusNotice({ trading }: { trading?: TradingStatus }) {
  if (trading?.status !== "inactive") return null;
  return <p role="note" className="text-sm text-amber-300">
    Negociação encerrada{trading.ended_on ? ` desde ${trading.ended_on}` : ""}.
    {trading.successor && ` Sucessor: ${trading.successor}.`}
    {" Preços históricos não representam cotação corrente. Valuation atual indisponível. "}
    {trading.source_url && <a className="underline" href={trading.source_url} target="_blank" rel="noreferrer">Comunicado oficial</a>}
  </p>;
}
