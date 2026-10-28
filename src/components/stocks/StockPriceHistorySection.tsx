"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getQuoteHistory, QuoteHistoryResponse, DailyQuoteItem } from "@/lib/api";

interface StockPriceHistorySectionProps {
  ticker: string;
}

export function StockPriceHistorySection({ ticker }: StockPriceHistorySectionProps) {
  const [timeframe, setTimeframe] = useState<string>("1Y");
  const [adjusted, setAdjusted] = useState<boolean>(true);
  const [history, setHistory] = useState<QuoteHistoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const pageSize = 20;

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQuoteHistory(ticker, timeframe, adjusted, 500, 0);
      setHistory(res);
      setPage(0);
    } catch (err) {
      console.error("Failed to load quote history:", err);
    } finally {
      setLoading(false);
    }
  }, [ticker, timeframe, adjusted]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleExportCSV = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    window.open(
      `${apiUrl}/market/${ticker}/history/export?timeframe=${timeframe}&adjusted=${adjusted}`,
      "_blank"
    );
  };

  const data = history?.data || [];
  // For chart, reverse to chronological order (oldest to newest)
  const chartData = [...data].reverse();

  // Metrics
  const latestQuote = data[0];
  const oldestQuote = data[data.length - 1];
  const periodReturnPct =
    oldestQuote && latestQuote && oldestQuote.close > 0
      ? ((latestQuote.close - oldestQuote.close) / oldestQuote.close) * 100
      : 0;

  let minPrice = Infinity;
  let maxPrice = -Infinity;
  let totalVolume = 0;

  data.forEach((d) => {
    const p = adjusted ? d.close_adjusted : d.close;
    if (p < minPrice) minPrice = p;
    if (p > maxPrice) maxPrice = p;
    totalVolume += d.volume;
  });

  const avgVolume = data.length > 0 ? totalVolume / data.length : 0;
  if (minPrice === Infinity) minPrice = 0;
  if (maxPrice === -Infinity) maxPrice = 0;

  // Pagination for table
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice(page * pageSize, (page + 1) * pageSize);

  // SVG Chart Dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 60 };

  const effectiveMin = minPrice * 0.97;
  const effectiveMax = maxPrice * 1.03;
  const rangeY = effectiveMax - effectiveMin || 1;

  const getX = (idx: number) => {
    if (chartData.length <= 1) return padding.left;
    return (
      padding.left +
      (idx / (chartData.length - 1)) * (width - padding.left - padding.right)
    );
  };

  const getY = (val: number) => {
    const clamped = Math.max(effectiveMin, Math.min(effectiveMax, val));
    return (
      height -
      padding.bottom -
      ((clamped - effectiveMin) / rangeY) * (height - padding.top - padding.bottom)
    );
  };

  const polylinePoints = chartData
    .map((d, idx) => {
      const val = adjusted ? d.close_adjusted : d.close;
      return `${getX(idx).toFixed(1)},${getY(val).toFixed(1)}`;
    })
    .join(" ");

  const areaPoints =
    chartData.length > 0
      ? `${getX(0).toFixed(1)},${height - padding.bottom} ${polylinePoints} ${getX(
          chartData.length - 1
        ).toFixed(1)},${height - padding.bottom}`
      : "";

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Controls & Summary Header */}
      <Card glow="cyan" className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-neon badge-neon-cyan">Série Histórica Diária</span>
              <span className="text-xs text-[#64748b] font-mono">B3 TimescaleDB</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Cotações Diárias & Ajustes Corporativos — {ticker}
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              Série histórica com identificação de proventos e splits em cada pregão.
            </p>
          </div>

          {/* Action & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAdjusted(!adjusted)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                adjusted
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-white/5 text-[#94a3b8] border-white/10 hover:text-white"
              }`}
            >
              {adjusted ? "✓ Preço Ajustado (Splits/Proventos)" : "Preço Nominal (Bruto)"}
            </button>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs py-1.5"
            >
              📥 Exportar Série CSV
            </Button>
          </div>
        </div>

        {/* Timeframe selector & Key Metrics */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            {["1M", "3M", "6M", "1Y", "2Y", "5Y", "MAX"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-sans">Retorno no Período</span>
              <span className={`font-bold text-sm ${periodReturnPct >= 0 ? "text-[#00f5a0]" : "text-[#ff3b69]"}`}>
                {periodReturnPct >= 0 ? "+" : ""}{periodReturnPct.toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-sans">Mínima</span>
              <span className="font-bold text-white text-sm">{formatCurrency(minPrice)}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-sans">Máxima</span>
              <span className="font-bold text-white text-sm">{formatCurrency(maxPrice)}</span>
            </div>
            <div>
              <span className="text-[#64748b] block text-[10px] uppercase font-sans">Volume Médio Diário</span>
              <span className="font-bold text-cyan-400 text-sm">{formatCurrency(avgVolume)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Interactive Price Chart */}
      <Card glow="none" className="p-4 overflow-hidden border border-white/10">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-xs font-bold text-white">Curva de Fechamento ({timeframe})</span>
          <span className="text-[11px] text-[#64748b]">
            {chartData.length} pregões negociados
          </span>
        </div>

        {loading ? (
          <div className="h-[260px] flex items-center justify-center text-xs text-[#64748b]">
            Carregando série histórica...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-xs text-[#64748b]">
            Nenhuma cotação encontrada no período selecionado.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto min-w-[650px] font-mono text-[10px]"
            >
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d9f5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00d9f5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const val = effectiveMin + rangeY * (1 - pct);
                const y = padding.top + pct * (height - padding.top - padding.bottom);
                return (
                  <g key={pct}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke="rgba(255,255,255,0.05)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      fill="#64748b"
                      textAnchor="end"
                    >
                      R$ {val.toFixed(2)}
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              {areaPoints && (
                <polygon points={areaPoints} fill="url(#priceGradient)" />
              )}
              {polylinePoints && (
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#00d9f5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Date Labels */}
              {chartData.length > 1 && (
                <>
                  <text
                    x={padding.left}
                    y={height - 10}
                    fill="#64748b"
                    textAnchor="start"
                  >
                    {chartData[0].date}
                  </text>
                  <text
                    x={width / 2}
                    y={height - 10}
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {chartData[Math.floor(chartData.length / 2)].date}
                  </text>
                  <text
                    x={width - padding.right}
                    y={height - 10}
                    fill="#64748b"
                    textAnchor="end"
                  >
                    {chartData[chartData.length - 1].date}
                  </text>
                </>
              )}
            </svg>
          </div>
        )}
      </Card>

      {/* Daily Quotes Table */}
      <Card glow="none" className="p-0 overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <div>
            <span className="text-xs font-bold text-white">
              Tabela Diária de Pregões ({data.length} registros)
            </span>
            <span className="text-[11px] text-[#64748b] block mt-0.5">
              Página {page + 1} de {Math.max(1, totalPages)}
            </span>
          </div>

          {/* Table pagination */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 text-xs rounded bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white font-mono"
            >
              ◀ Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs rounded bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white font-mono"
            >
              Próxima ▶
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4">Data Pregão</th>
                <th className="py-3 text-right">Fechamento</th>
                <th className="py-3 text-right">Ajustado</th>
                <th className="py-3 text-right">Variação %</th>
                <th className="py-3 text-right">Abertura</th>
                <th className="py-3 text-right">Máxima</th>
                <th className="py-3 text-right">Mínima</th>
                <th className="py-3 text-right">Volume (R$)</th>
                <th className="py-3 text-right">Negócios</th>
                <th className="py-3 pr-4 text-left pl-4 font-sans">Eventos Corporativos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#64748b] font-sans">
                    Carregando dados diários...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#64748b] font-sans">
                    Nenhum registro para o filtro atual.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.date} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pl-4 font-bold text-white">{row.date}</td>
                    <td className="py-2.5 text-right font-bold text-white">
                      {formatCurrency(row.close)}
                    </td>
                    <td className="py-2.5 text-right text-cyan-300">
                      {formatCurrency(row.close_adjusted)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        row.pct_change >= 0 ? "text-[#00f5a0]" : "text-[#ff3b69]"
                      }`}
                    >
                      {row.pct_change >= 0 ? "+" : ""}
                      {row.pct_change.toFixed(2)}%
                    </td>
                    <td className="py-2.5 text-right text-[#94a3b8]">{formatCurrency(row.open)}</td>
                    <td className="py-2.5 text-right text-[#94a3b8]">{formatCurrency(row.high)}</td>
                    <td className="py-2.5 text-right text-[#94a3b8]">{formatCurrency(row.low)}</td>
                    <td className="py-2.5 text-right text-[#cbd5e1]">{formatCurrency(row.volume)}</td>
                    <td className="py-2.5 text-right text-[#94a3b8]">
                      {row.num_trades ? row.num_trades.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="py-2.5 pr-4 pl-4 text-left font-sans">
                      {row.corporate_events ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                          {row.corporate_events}
                        </span>
                      ) : (
                        <span className="text-[#64748b] text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
