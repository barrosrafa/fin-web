"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RadarChart, RadarDataPoint } from "@/components/ui/RadarChart";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { MOCK_ASSETS } from "@/data/mock/marketData";

export default function ComparadorPage() {
  const [ticker1, setTicker1] = useState("PETR4");
  const [ticker2, setTicker2] = useState("VALE3");

  const asset1 = MOCK_ASSETS.find((a) => a.ticker === ticker1) || MOCK_ASSETS[0];
  const asset2 = MOCK_ASSETS.find((a) => a.ticker === ticker2) || MOCK_ASSETS[1];

  // Spider radar points for Asset 1
  const radarData1: RadarDataPoint[] = [
    { axis: "Dividend Yield", value: Math.min(100, asset1.dividendYield * 6.5) },
    { axis: "ROE / Margem", value: 85 },
    { axis: "Desconto P/VP", value: asset1.pvp ? Math.min(100, (2 - asset1.pvp) * 60) : 50 },
    { axis: "Preço Justo", value: 90 },
    { axis: "Liquidez B3", value: 95 },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Análise de Ações + ETFs Brasil Standard</span>
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
              {MOCK_ASSETS.map((a) => (
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
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-[#00d9f5]"
            >
              {MOCK_ASSETS.map((a) => (
                <option key={a.ticker} value={a.ticker}>
                  {a.ticker} — {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Comparison */}
        <div className="lg:col-span-7">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-3 pl-2">Indicador</th>
                    <th className="pb-3 text-right font-mono text-[#00f5a0]">
                      {asset1.ticker}
                    </th>
                    <th className="pb-3 text-right font-mono text-[#00d9f5]">
                      {asset2.ticker}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">Preço Atual</td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(asset1.currentPrice)}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(asset2.currentPrice)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">Variação 24h</td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {formatPercent(asset1.change24h)}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">
                      {formatPercent(asset2.change24h)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">Dividend Yield (12M)</td>
                    <td className={`py-3 text-right font-bold ${asset1.dividendYield >= asset2.dividendYield ? "text-[#00f5a0]" : "text-white"}`}>
                      {formatPercent(asset1.dividendYield, false)}
                    </td>
                    <td className={`py-3 text-right font-bold ${asset2.dividendYield >= asset1.dividendYield ? "text-[#00d9f5]" : "text-white"}`}>
                      {formatPercent(asset2.dividendYield, false)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">P/VP</td>
                    <td className="py-3 text-right text-white">
                      {asset1.pvp ? asset1.pvp.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {asset2.pvp ? asset2.pvp.toFixed(2) : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">P/L</td>
                    <td className="py-3 text-right text-white">
                      {asset1.pl ? asset1.pl.toFixed(1) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {asset2.pl ? asset2.pl.toFixed(1) : "—"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">Variação 12 Meses</td>
                    <td className="py-3 text-right text-white">
                      {formatPercent(asset1.change12m)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatPercent(asset2.change12m)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-2 text-white font-sans font-medium">Valor de Mercado</td>
                    <td className="py-3 text-right text-white">
                      {asset1.marketCap ? formatCurrency(asset1.marketCap, true) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {asset2.marketCap ? formatCurrency(asset2.marketCap, true) : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Radar Spider Chart comparison */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <Card glow="emerald" className="w-full flex flex-col items-center p-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider mb-2">
              Perfil Poligonal ({asset1.ticker})
            </span>
            <RadarChart data={radarData1} size={280} color="#00f5a0" fillOpacity={0.25} />
          </Card>
        </div>
      </div>
    </div>
  );
}
