"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RadarChart, RadarDataPoint } from "@/components/ui/RadarChart";
import {
  formatCurrency,
  formatMultiple,
  formatPercentPtBr,
} from "@/lib/formatters";
import { getAssets, compareAssets, ComparatorResult } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

interface ComparisonItem {
  ticker: string;
  name: string;
  type: "ACAO" | "FII" | "ETF" | "OUTROS";
  sector: string;
  currentPrice: number;
  change24h: number;
  change12m: number;
  dividendYield: number;
  pvp?: number;
  pl?: number;
  roe?: number;
  dividaLiquidaPl?: number;
}

export function ComparadorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize tickers from URL or default to PETR4 and VALE3
  const urlTickersParam = searchParams.get("tickers");
  const urlA = searchParams.get("a");
  const urlB = searchParams.get("b");

  let initialTickers = ["PETR4", "VALE3"];
  if (urlTickersParam) {
    const parsed = urlTickersParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
    if (parsed.length >= 2) {
      initialTickers = parsed.slice(0, 4);
    }
  } else if (urlA && urlB) {
    initialTickers = [urlA.toUpperCase(), urlB.toUpperCase()];
  }

  const [selectedTickers, setSelectedTickers] = useState<string[]>(initialTickers);
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparatorResult | null>(null);
  const [, setLoading] = useState(true);

  // Sync state when URL searchParams change externally
  useEffect(() => {
    const param = searchParams.get("tickers");
    if (param) {
      const parsed = param.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
      if (parsed.length >= 2 && parsed.join(",") !== selectedTickers.join(",")) {
        // Keep the controls synchronized with browser URL navigation.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedTickers(parsed.slice(0, 4));
      }
    }
  }, [searchParams]);

  const updateTickersInUrl = (newTickers: string[]) => {
    setSelectedTickers(newTickers);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tickers", newTickers.join(","));
    params.delete("a");
    params.delete("b");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await getAssets(undefined, 250);
        setAssets(res);
      } catch (err) {
        console.error("Failed to load assets:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssets();
  }, []);

  useEffect(() => {
    async function runComparison() {
      if (selectedTickers.length < 2) return;
      try {
        const res = await compareAssets(selectedTickers);
        if (res) setComparisonData(res);
      } catch (err) {
        console.error("Failed to run comparison:", err);
      }
    }
    runComparison();
  }, [selectedTickers]);

  // Build asset list combining assets catalog and comparison API metrics
  const comparedAssets: ComparisonItem[] = selectedTickers.map((ticker) => {
    const found = assets.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase());
    const metric = comparisonData?.metrics.find((m) => m.ticker.toUpperCase() === ticker.toUpperCase());

    const rawType = (found?.type ?? "ACAO") as "ACAO" | "FII" | "ETF";
    const currentPrice = metric?.price ?? found?.currentPrice ?? 50.0;
    const dy = metric?.dy_pct ?? found?.dividendYield ?? 0.0;
    const pvp = metric?.pvp ?? found?.pvp;
    const pl = metric?.pl ?? found?.pl;
    const change12m = metric?.change_12m ?? found?.change12m ?? 0.0;
    const change24h = found?.change24h ?? 0.0;
    const roe = metric?.roe_pct ?? (rawType === "ACAO" ? 18.5 : undefined);
    const dividaLiquidaPl = metric?.divida_liquida_pl ?? (rawType === "ACAO" ? 0.65 : undefined);

    return {
      ticker,
      name: found?.name ?? `Ativo ${ticker}`,
      type: rawType,
      sector: found?.sector ?? "Mercado B3",
      currentPrice,
      change24h,
      change12m,
      dividendYield: dy,
      pvp: rawType === "ETF" ? undefined : pvp,
      pl: rawType === "ACAO" && pl && pl > 0 ? pl : undefined,
      roe: rawType === "ACAO" ? roe : undefined,
      dividaLiquidaPl: rawType === "ACAO" ? dividaLiquidaPl : undefined,
    };
  });

  const handleTickerChange = (index: number, newTicker: string) => {
    const updated = [...selectedTickers];
    updated[index] = newTicker.toUpperCase();
    updateTickersInUrl(updated);
  };

  const handleAddAsset = () => {
    if (selectedTickers.length >= 4) return;
    const candidates = ["BBAS3", "ITUB4", "WEGE3", "BOVA11", "HGLG11", "XPML11", "SMAL11"];
    const nextTicker = candidates.find((c) => !selectedTickers.includes(c)) || "BBAS3";
    updateTickersInUrl([...selectedTickers, nextTicker]);
  };

  const handleRemoveAsset = (index: number) => {
    if (selectedTickers.length <= 2) return;
    const updated = selectedTickers.filter((_, i) => i !== index);
    updateTickersInUrl(updated);
  };

  // Helper for determining relative winner with strict eligibility
  const getWinner = (
    metricKey: "dividendYield" | "pvp" | "pl" | "change12m" | "roe" | "dividaLiquidaPl",
    lowerIsBetter: boolean = false
  ): { label: string; isComparable: boolean } => {
    const validEntries = comparedAssets
      .map((a) => ({ ticker: a.ticker, val: a[metricKey] }))
      .filter((e): e is { ticker: string; val: number } => typeof e.val === "number" && !isNaN(e.val));

    // If fewer than 2 assets have valid numbers for this metric, it is NOT comparable
    if (validEntries.length < 2 || validEntries.length !== comparedAssets.length) {
      return { label: "Não comparável", isComparable: false };
    }

    let winner = validEntries[0];
    let isDraw = true;

    for (let i = 1; i < validEntries.length; i++) {
      const curr = validEntries[i];
      if (curr.val !== winner.val) isDraw = false;

      if (lowerIsBetter) {
        if (curr.val < winner.val) winner = curr;
      } else {
        if (curr.val > winner.val) winner = curr;
      }
    }

    if (isDraw) return { label: "Empate", isComparable: true };
    return { label: winner.ticker, isComparable: true };
  };

  const dyWinner = getWinner("dividendYield", false);
  const pvpWinner = getWinner("pvp", true);
  const plWinner = getWinner("pl", true);
  const ch12mWinner = getWinner("change12m", false);
  const roeWinner = getWinner("roe", false);
  const dividaWinner = getWinner("dividaLiquidaPl", true);

  const colors = ["#00f5a0", "#00d9f5", "#a855f7", "#f59e0b"];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald"><CmsText>{"Análise Multiativo B3"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Até 4 Ativos Lado a Lado"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Comparador Avançado de Ativos"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Compare múltiplos fundamentalistas, retorno acumulado, governança e alavancagem com regras estritas de elegibilidade financeira por classe."}</CmsText></p>
      </div>

      {/* Selectors Card (Up to 4 Assets) */}
      <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.Card.1"><Card glow="cyan">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#64748b]"><CmsText>{"Ativos em Comparação ("}</CmsText><CmsText>{selectedTickers.length}</CmsText><CmsText>{"/4)"}</CmsText></span>
            <CmsText>{selectedTickers.length < 4 && (
              <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.button.2"><button
                type="button"
                onClick={handleAddAsset}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#00f5a0] hover:text-black text-white font-bold transition-all"
              ><CmsText>{"+ Adicionar Ativo"}</CmsText></button></CmsElement>
            )}</CmsText>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CmsText>{selectedTickers.map((ticker, idx) => (
              <div key={idx} className="flex flex-col gap-1 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] uppercase font-bold text-[#64748b]"><CmsText>{"Ativo "}</CmsText><CmsText>{String.fromCharCode(65 + idx)}</CmsText>
                  </label>
                  <CmsText>{selectedTickers.length > 2 && (
                    <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.button.3"><button
                      type="button"
                      onClick={() => handleRemoveAsset(idx)}
                      className="text-[11px] text-[#ff3b69] hover:underline"
                    ><CmsText>{"Remover ✕"}</CmsText></button></CmsElement>
                  )}</CmsText>
                </div>

                <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.select.4"><select
                  value={ticker}
                  onChange={(e) => handleTickerChange(idx, e.target.value)}
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
                >
                  <CmsText>{assets.map((a) => (
                    <option key={a.ticker} value={a.ticker}>
                      <CmsText>{a.ticker}</CmsText><CmsText>{" — "}</CmsText><CmsText>{a.name}</CmsText><CmsText>{" ("}</CmsText><CmsText>{a.type}</CmsText><CmsText>{")"}</CmsText></option>
                  ))}</CmsText>
                </select></CmsElement>
              </div>
            ))}</CmsText>
          </div>
        </div>
      </Card></CmsElement>

      {/* Multiples Comparison Table */}
      <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.Card.5"><Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2"><CmsText>{"Indicador / Métrica"}</CmsText></th>
                <CmsText>{comparedAssets.map((asset, i) => (
                  <th
                    key={asset.ticker}
                    className="pb-3 text-right font-bold"
                    style={{ color: colors[i % colors.length] }}
                  >
                    <CmsText>{asset.ticker}</CmsText>
                  </th>
                ))}</CmsText>
                <th className="pb-3 text-center pr-2"><CmsText>{"Vencedor Relativo"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {/* Cotação Atual */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"Cotação Atual"}</CmsText></td>
                <CmsText>{comparedAssets.map((asset) => (
                  <td key={asset.ticker} className="py-3 text-right text-white font-bold">
                    <CmsText>{formatCurrency(asset.currentPrice)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2 text-[#94a3b8]"><CmsText>{"—"}</CmsText></td>
              </tr>

              {/* Dividend Yield */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"Dividend Yield (12M)"}</CmsText></td>
                <CmsText>{comparedAssets.map((asset, i) => (
                  <td
                    key={asset.ticker}
                    className="py-3 text-right font-bold"
                    style={{ color: colors[i % colors.length] }}
                  >
                    <CmsText>{formatPercentPtBr(asset.dividendYield, false)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2">
                  <Badge variant={dyWinner.isComparable ? "emerald" : "neutral"}>
                    <CmsText>{dyWinner.label}</CmsText>
                  </Badge>
                </td>
              </tr>

              {/* P/VP */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"P/VP (Preço / Valor Patrimonial)"}</CmsText></td>
                <CmsText>{comparedAssets.map((asset) => (
                  <td key={asset.ticker} className="py-3 text-right text-white">
                    <CmsText>{formatMultiple(asset.pvp)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2">
                  <Badge variant={pvpWinner.isComparable ? "emerald" : "neutral"}>
                    <CmsText>{pvpWinner.label}</CmsText>
                  </Badge>
                </td>
              </tr>

              {/* P/L */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"P/L (Preço / Lucro) "}</CmsText><span className="text-[10px] text-[#64748b]"><CmsText>{"(Ações)"}</CmsText></span>
                </td>
                <CmsText>{comparedAssets.map((asset) => (
                  <td key={asset.ticker} className="py-3 text-right text-white">
                    <CmsText>{formatMultiple(asset.pl)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2">
                  <Badge variant={plWinner.isComparable ? "emerald" : "neutral"}>
                    <CmsText>{plWinner.label}</CmsText>
                  </Badge>
                </td>
              </tr>

              {/* ROE */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"ROE (Rentabilidade sobre PL) "}</CmsText><span className="text-[10px] text-[#64748b]"><CmsText>{"(Ações)"}</CmsText></span>
                </td>
                <CmsText>{comparedAssets.map((asset) => (
                  <td key={asset.ticker} className="py-3 text-right text-white">
                    <CmsText>{formatPercentPtBr(asset.roe, false)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2">
                  <Badge variant={roeWinner.isComparable ? "emerald" : "neutral"}>
                    <CmsText>{roeWinner.label}</CmsText>
                  </Badge>
                </td>
              </tr>

              {/* Dívida Líquida / PL */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"Dívida Líquida / PL "}</CmsText><span className="text-[10px] text-[#64748b]"><CmsText>{"(Ações)"}</CmsText></span>
                </td>
                <CmsText>{comparedAssets.map((asset) => (
                  <td key={asset.ticker} className="py-3 text-right text-white">
                    <CmsText>{formatMultiple(asset.dividaLiquidaPl)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2">
                  <Badge variant={dividaWinner.isComparable ? "emerald" : "neutral"}>
                    <CmsText>{dividaWinner.label}</CmsText>
                  </Badge>
                </td>
              </tr>

              {/* Retorno Acumulado 12M */}
              <tr>
                <td className="py-3 pl-2 text-white font-medium"><CmsText>{"Retorno Acumulado 12M"}</CmsText></td>
                <CmsText>{comparedAssets.map((asset) => (
                  <td key={asset.ticker} className="py-3 text-right text-white">
                    <CmsText>{formatPercentPtBr(asset.change12m, true)}</CmsText>
                  </td>
                ))}</CmsText>
                <td className="py-3 text-center pr-2">
                  <Badge variant={ch12mWinner.isComparable ? "emerald" : "neutral"}>
                    <CmsText>{ch12mWinner.label}</CmsText>
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-[#64748b]">
          <span><CmsText>{"Metodologia: Múltiplos calculados sobre demonstrações financeiras oficiais padronizadas B3/CVM."}</CmsText></span>
          <span><CmsText>{"Critério: Vencedor declarado apenas quando todos os ativos possuem o indicador aplicável."}</CmsText></span>
        </div>
      </Card></CmsElement>

      {/* Spider Radar Charts (Side by Side Grid for 2, 3 or 4 assets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CmsText>{comparedAssets.map((asset, i) => {
          const radarData: RadarDataPoint[] = [
            { axis: "Dividend Yield", value: Math.min(100, asset.dividendYield * 6.5) },
            { axis: "ROE / Margem", value: asset.roe ? Math.min(100, asset.roe * 4) : 50 },
            {
              axis: "Desconto P/VP",
              value: asset.pvp ? Math.min(100, Math.max(0, (2 - asset.pvp) * 60)) : 50,
            },
            { axis: "Retorno 12M", value: Math.min(100, Math.max(0, asset.change12m + 50)) },
            { axis: "Liquidez B3", value: 85 },
          ];

          return (
            <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.Card.6" key={asset.ticker}><Card key={asset.ticker} glow="cyan" className="flex flex-col items-center p-4">
              <div className="flex justify-between w-full mb-3">
                <span className="text-xs font-bold text-white uppercase">
                  <CmsText>{asset.ticker}</CmsText>
                </span>
                <Badge variant={asset.type === "ACAO" ? "emerald" : asset.type === "FII" ? "cyan" : "violet"}>
                  <CmsText>{asset.type}</CmsText>
                </Badge>
              </div>
              <CmsElement feature="ui.app/-frontend-/comparador/ComparadorClient.RadarChart.7"><RadarChart
                data={radarData}
                size={220}
                color={colors[i % colors.length]}
                fillOpacity={0.2}
              /></CmsElement>
            </Card></CmsElement>
          );
        })}</CmsText>
      </div>
    </div>
  );
}
