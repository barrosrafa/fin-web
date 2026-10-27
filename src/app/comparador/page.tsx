"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RadarChart, RadarDataPoint } from "@/components/ui/RadarChart";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getAssets, compareAssets, ComparatorResult } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export default function ComparadorPage() {
  const [ticker1, setTicker1] = useState("PETR4");
  const [ticker2, setTicker2] = useState("VALE3");
  const [assets, setAssets] = useState<AssetSummary[]>([]);
  const [comparison, setComparison] = useState<ComparatorResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssets() {
      try {
        const res = await getAssets();
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
      if (!ticker1 || !ticker2) return;
      try {
        const res = await compareAssets([ticker1, ticker2]);
        if (res) setComparison(res);
      } catch (err) {
        console.error("Failed to run comparison:", err);
      }
    }
    runComparison();
  }, [ticker1, ticker2]);

  const asset1 = assets.find((a) => a.ticker === ticker1) || {
    ticker: ticker1,
    name: "Petróleo Brasileiro S.A. Petrobras",
    type: "ACAO" as const,
    sector: "Petróleo e Gás",
    currentPrice: 38.45,
    change24h: 1.48,
    change12m: 24.3,
    dividendYield: 14.8,
    pvp: 1.15,
    pl: 4.8,
    sparkline: [],
  };

  const asset2 = assets.find((a) => a.ticker === ticker2) || {
    ticker: ticker2,
    name: "Vale S.A.",
    type: "ACAO" as const,
    sector: "Materiais Básicos",
    currentPrice: 62.10,
    change24h: -0.85,
    change12m: -8.4,
    dividendYield: 9.2,
    pvp: 1.38,
    pl: 5.9,
    sparkline: [],
  };

  // Spider radar points for Asset 1
  const radarData1: RadarDataPoint[] = [
    { axis: "Dividend Yield", value: Math.min(100, asset1.dividendYield * 6.5) },
    { axis: "ROE / Margem", value: 85 },
    { axis: "Desconto P/VP", value: asset1.pvp ? Math.min(100, Math.max(0, (2 - asset1.pvp) * 60)) : 50 },
    { axis: "Preço Justo", value: 90 },
    { axis: "Liquidez B3", value: 95 },
  ];

  const radarData2: RadarDataPoint[] = [
    { axis: "Dividend Yield", value: Math.min(100, asset2.dividendYield * 6.5) },
    { axis: "ROE / Margem", value: 75 },
    { axis: "Desconto P/VP", value: asset2.pvp ? Math.min(100, Math.max(0, (2 - asset2.pvp) * 60)) : 50 },
    { axis: "Preço Justo", value: 78 },
    { axis: "Liquidez B3", value: 92 },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Análise Multiativo B3</span>
          <span className="text-xs text-[#64748b]">Comparação Head-to-Head</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Comparador Avançado de Ativos
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Compare múltiplos fundamentalistas, retorno acumulado, liquidez e indicadores de risco lado a lado com identificador automático da melhor métrica.
        </p>
      </div>

      {/* Selectors */}
      <Card glow="cyan">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Primeiro Ativo (Ativo A)
            </label>
            <select
              value={ticker1}
              onChange={(e) => setTicker1(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            >
              {assets.map((a) => (
                <option key={a.ticker} value={a.ticker}>
                  {a.ticker} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-bold text-[#64748b] block mb-1">
              Segundo Ativo (Ativo B)
            </label>
            <select
              value={ticker2}
              onChange={(e) => setTicker2(e.target.value)}
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00f5a0]"
            >
              {assets.map((a) => (
                <option key={a.ticker} value={a.ticker}>
                  {a.ticker} — {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Side by Side Multiples Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-2">Indicador / Métrica</th>
                <th className="pb-3 text-right font-bold text-[#00f5a0]">{asset1.ticker}</th>
                <th className="pb-3 text-right font-bold text-[#00d9f5]">{asset2.ticker}</th>
                <th className="pb-3 text-center pr-2">Vencedor Relativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              <tr>
                <td className="py-3 pl-2 text-white font-medium">Cotação Atual</td>
                <td className="py-3 text-right text-white font-bold">{formatCurrency(asset1.currentPrice)}</td>
                <td className="py-3 text-right text-white font-bold">{formatCurrency(asset2.currentPrice)}</td>
                <td className="py-3 text-center pr-2 text-[#94a3b8]">—</td>
              </tr>
              <tr>
                <td className="py-3 pl-2 text-white font-medium">Dividend Yield (12M)</td>
                <td className="py-3 text-right text-[#00f5a0] font-bold">{formatPercent(asset1.dividendYield, false)}</td>
                <td className="py-3 text-right text-[#00d9f5] font-bold">{formatPercent(asset2.dividendYield, false)}</td>
                <td className="py-3 text-center pr-2">
                  <Badge variant={asset1.dividendYield >= asset2.dividendYield ? "emerald" : "cyan"}>
                    {asset1.dividendYield >= asset2.dividendYield ? asset1.ticker : asset2.ticker}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-2 text-white font-medium">P/VP (Preço / Valor Patrimonial)</td>
                <td className="py-3 text-right text-white">{asset1.pvp !== undefined ? `${asset1.pvp.toFixed(2)}x` : "—"}</td>
                <td className="py-3 text-right text-white">{asset2.pvp !== undefined ? `${asset2.pvp.toFixed(2)}x` : "—"}</td>
                <td className="py-3 text-center pr-2">
                  <Badge variant={(asset1.pvp ?? 99) <= (asset2.pvp ?? 99) ? "emerald" : "cyan"}>
                    {(asset1.pvp ?? 99) <= (asset2.pvp ?? 99) ? asset1.ticker : asset2.ticker}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-2 text-white font-medium">P/L (Preço / Lucro)</td>
                <td className="py-3 text-right text-white">{asset1.pl !== undefined && asset1.pl > 0 ? `${asset1.pl.toFixed(1)}x` : "—"}</td>
                <td className="py-3 text-right text-white">{asset2.pl !== undefined && asset2.pl > 0 ? `${asset2.pl.toFixed(1)}x` : "—"}</td>
                <td className="py-3 text-center pr-2">
                  <Badge variant={(asset1.pl ?? 99) <= (asset2.pl ?? 99) ? "emerald" : "cyan"}>
                    {(asset1.pl ?? 99) <= (asset2.pl ?? 99) ? asset1.ticker : asset2.ticker}
                  </Badge>
                </td>
              </tr>
              <tr>
                <td className="py-3 pl-2 text-white font-medium">Retorno Acumulado 12M</td>
                <td className="py-3 text-right text-white">{formatPercent(asset1.change12m)}</td>
                <td className="py-3 text-right text-white">{formatPercent(asset2.change12m)}</td>
                <td className="py-3 text-center pr-2">
                  <Badge variant={asset1.change12m >= asset2.change12m ? "emerald" : "cyan"}>
                    {asset1.change12m >= asset2.change12m ? asset1.ticker : asset2.ticker}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Spider Charts Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glow="emerald" className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-3">
            <span className="text-xs font-bold text-white uppercase">{asset1.ticker} • Polígono Fundamentalista</span>
            <Badge variant="emerald">{asset1.type}</Badge>
          </div>
          <RadarChart data={radarData1} size={280} color="#00f5a0" fillOpacity={0.2} />
        </Card>

        <Card glow="cyan" className="flex flex-col items-center">
          <div className="flex justify-between w-full mb-3">
            <span className="text-xs font-bold text-white uppercase">{asset2.ticker} • Polígono Fundamentalista</span>
            <Badge variant="cyan">{asset2.type}</Badge>
          </div>
          <RadarChart data={radarData2} size={280} color="#00d9f5" fillOpacity={0.2} />
        </Card>
      </div>
    </div>
  );
}
