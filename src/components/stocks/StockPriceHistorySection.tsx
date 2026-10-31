"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionState } from "@/components/shared/SectionState";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getQuoteHistory, QuoteHistoryResponse, API_BASE } from "@/lib/api";

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

  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    // Clear the previous instrument/period before starting its replacement request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setHistory(null);
    void getQuoteHistory(ticker, timeframe, adjusted, 500, 0, controller.signal).then(data => {
      if (!controller.signal.aborted) { setHistory(data); setPage(0); }
    }).catch(() => {
      if (!controller.signal.aborted) setError("Histórico indisponível. Tente novamente.");
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [ticker, timeframe, adjusted, revision]);

  const handleExportCSV = () => {
    const apiUrl = API_BASE;
    window.open(
      `${apiUrl}/market/${encodeURIComponent(ticker)}/history/export?timeframe=${timeframe}&adjusted=${adjusted}`,
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
    oldestQuote && latestQuote && (adjusted ? oldestQuote.close_adjusted : oldestQuote.close) > 0
      ? (((adjusted ? latestQuote.close_adjusted : latestQuote.close) - (adjusted ? oldestQuote.close_adjusted : oldestQuote.close)) / (adjusted ? oldestQuote.close_adjusted : oldestQuote.close)) * 100
      : Number.NaN;

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
  if (minPrice === Infinity) minPrice = Number.NaN;
  if (maxPrice === -Infinity) maxPrice = Number.NaN;

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
      <SectionState loading={loading} error={error} onRetry={() => setRevision(n => n + 1)} />
      <CmsText>{history?.cache_status === "offline-stale" && <p role="status" className="text-sm text-amber-300"><CmsText>{"Offline — histórico salvo anteriormente; dados podem estar desatualizados."}</CmsText></p>}</CmsText>
      {/* Controls & Summary Header */}
      <CmsElement feature="ui.components/stocks/StockPriceHistorySection.Card.1"><Card glow="cyan" className="p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-neon badge-neon-cyan"><CmsText>{"Série Histórica Diária"}</CmsText></span>
              <span className="text-xs text-[#94a3b8] font-mono"><CmsText>{"B3 TimescaleDB"}</CmsText></span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight"><CmsText>{"Cotações Diárias & Ajustes Corporativos — "}</CmsText><CmsText>{ticker}</CmsText>
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Série histórica com identificação de proventos e splits em cada pregão."}</CmsText></p>
          </div>

          {/* Action & Export */}
          <div className="flex flex-wrap items-center gap-3">
            <CmsElement feature="ui.components/stocks/StockPriceHistorySection.button.2"><button
              onClick={() => setAdjusted(!adjusted)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                adjusted
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-white/5 text-[#94a3b8] border-white/10 hover:text-white"
              }`}
            >
              <CmsText>{adjusted ? "✓ Preço Ajustado (Splits/Proventos)" : "Preço Nominal (Bruto)"}</CmsText>
            </button></CmsElement>

            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs py-1.5"
            ><CmsText>{"📥 Exportar Série CSV"}</CmsText></Button>
          </div>
        </div>

        {/* Timeframe selector & Key Metrics */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
            <CmsText>{["1M", "3M", "6M", "1Y", "2Y", "5Y", "MAX"].map((tf) => (
              <CmsElement feature="ui.components/stocks/StockPriceHistorySection.button.3" key={tf}><button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeframe === tf
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                <CmsText>{tf}</CmsText>
              </button></CmsElement>
            ))}</CmsText>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#94a3b8] block text-[10px] uppercase font-sans"><CmsText>{"Retorno no Período"}</CmsText></span>
              <span className={`font-bold text-sm ${periodReturnPct >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}>
                <CmsText>{formatPercent(periodReturnPct)}</CmsText>
              </span>
            </div>
            <div>
              <span className="text-[#94a3b8] block text-[10px] uppercase font-sans"><CmsText>{"Mínima"}</CmsText></span>
              <span className="font-bold text-white text-sm"><CmsText>{formatCurrency(minPrice)}</CmsText></span>
            </div>
            <div>
              <span className="text-[#94a3b8] block text-[10px] uppercase font-sans"><CmsText>{"Máxima"}</CmsText></span>
              <span className="font-bold text-white text-sm"><CmsText>{formatCurrency(maxPrice)}</CmsText></span>
            </div>
            <div>
              <span className="text-[#94a3b8] block text-[10px] uppercase font-sans"><CmsText>{"Volume Médio Diário"}</CmsText></span>
              <span className="font-bold text-cyan-400 text-sm"><CmsText>{formatCurrency(avgVolume)}</CmsText></span>
            </div>
          </div>
        </div>
      </Card></CmsElement>

      {/* Interactive Price Chart */}
      <CmsElement feature="ui.components/stocks/StockPriceHistorySection.Card.4"><Card glow="none" className="p-4 overflow-hidden border border-white/10">
        <div className="flex justify-between items-center mb-2 px-2">
          <span className="text-xs font-bold text-white"><CmsText>{"Curva de Fechamento ("}</CmsText><CmsText>{timeframe}</CmsText><CmsText>{")"}</CmsText></span>
          <span className="text-[11px] text-[#94a3b8]">
            <CmsText>{chartData.length}</CmsText><CmsText>{" pregões negociados"}</CmsText></span>
        </div>

        <CmsText>{loading ? (
          <div className="h-[260px] flex items-center justify-center text-xs text-[#94a3b8]"><CmsText>{"Carregando série histórica..."}</CmsText></div>
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-xs text-[#94a3b8]"><CmsText>{"Nenhuma cotação encontrada no período selecionado."}</CmsText></div>
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
              <CmsText>{[0, 0.25, 0.5, 0.75, 1].map((pct) => {
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
                      fill="#94a3b8"
                      textAnchor="end"
                    >
                      <CmsText>{formatCurrency(val)}</CmsText>
                    </text>
                  </g>
                );
              })}</CmsText>

              {/* Area & Line */}
              <CmsText>{areaPoints && (
                <polygon points={areaPoints} fill="url(#priceGradient)" />
              )}</CmsText>
              <CmsText>{polylinePoints && (
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#00d9f5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}</CmsText>

              {/* Date Labels */}
              <CmsText>{chartData.length > 1 && (
                <>
                  <text
                    x={padding.left}
                    y={height - 10}
                    fill="#94a3b8"
                    textAnchor="start"
                  >
                    <CmsText>{chartData[0].date}</CmsText>
                  </text>
                  <text
                    x={width / 2}
                    y={height - 10}
                    fill="#94a3b8"
                    textAnchor="middle"
                  >
                    <CmsText>{chartData[Math.floor(chartData.length / 2)].date}</CmsText>
                  </text>
                  <text
                    x={width - padding.right}
                    y={height - 10}
                    fill="#94a3b8"
                    textAnchor="end"
                  >
                    <CmsText>{chartData[chartData.length - 1].date}</CmsText>
                  </text>
                </>
              )}</CmsText>
            </svg>
          </div>
        )}</CmsText>
      </Card></CmsElement>

      {/* Daily Quotes Table */}
      <CmsElement feature="ui.components/stocks/StockPriceHistorySection.Card.5"><Card glow="none" className="p-0 overflow-hidden border border-white/10">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <div>
            <span className="text-xs font-bold text-white"><CmsText>{"Tabela Diária de Pregões ("}</CmsText><CmsText>{data.length}</CmsText><CmsText>{" registros)"}</CmsText></span>
            <span className="text-[11px] text-[#94a3b8] block mt-0.5"><CmsText>{"Página "}</CmsText><CmsText>{page + 1}</CmsText><CmsText>{" de "}</CmsText><CmsText>{Math.max(1, totalPages)}</CmsText>
            </span>
          </div>

          {/* Table pagination */}
          <div className="flex items-center gap-2">
            <CmsElement feature="ui.components/stocks/StockPriceHistorySection.button.6"><button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 text-xs rounded bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white font-mono"
            ><CmsText>{"◀ Anterior"}</CmsText></button></CmsElement>
            <CmsElement feature="ui.components/stocks/StockPriceHistorySection.button.7"><button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-2.5 py-1 text-xs rounded bg-white/5 disabled:opacity-30 hover:bg-white/10 text-white font-mono"
            ><CmsText>{"Próxima ▶"}</CmsText></button></CmsElement>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/5 text-[#94a3b8] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60 font-sans">
                <th className="py-3 pl-4"><CmsText>{"Data Pregão"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Fechamento"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Ajustado"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Variação %"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Abertura"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Máxima"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Mínima"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Volume (R$)"}</CmsText></th>
                <th className="py-3 text-right"><CmsText>{"Negócios"}</CmsText></th>
                <th className="py-3 pr-4 text-left pl-4 font-sans"><CmsText>{"Eventos Corporativos"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#94a3b8] font-sans"><CmsText>{"Carregando dados diários..."}</CmsText></td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[#94a3b8] font-sans"><CmsText>{"Nenhum registro para o filtro atual."}</CmsText></td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr key={row.date} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pl-4 font-bold text-white"><CmsText>{row.date}</CmsText></td>
                    <td className="py-2.5 text-right font-bold text-white">
                      <CmsText>{formatCurrency(row.close)}</CmsText>
                    </td>
                    <td className="py-2.5 text-right text-cyan-300">
                      <CmsText>{formatCurrency(row.close_adjusted)}</CmsText>
                    </td>
                    <td
                      className={`py-2.5 text-right font-bold ${
                        row.pct_change >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"
                      }`}
                    >
                      <CmsText>{formatPercent(row.pct_change)}</CmsText>
                    </td>
                    <td className="py-2.5 text-right text-[#94a3b8]"><CmsText>{formatCurrency(row.open)}</CmsText></td>
                    <td className="py-2.5 text-right text-[#94a3b8]"><CmsText>{formatCurrency(row.high)}</CmsText></td>
                    <td className="py-2.5 text-right text-[#94a3b8]"><CmsText>{formatCurrency(row.low)}</CmsText></td>
                    <td className="py-2.5 text-right text-[#cbd5e1]"><CmsText>{formatCurrency(row.volume)}</CmsText></td>
                    <td className="py-2.5 text-right text-[#94a3b8]">
                      <CmsText>{row.num_trades ? row.num_trades.toLocaleString("pt-BR") : "—"}</CmsText>
                    </td>
                    <td className="py-2.5 pr-4 pl-4 text-left font-sans">
                      <CmsText>{row.corporate_events ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                          <CmsText>{row.corporate_events}</CmsText>
                        </span>
                      ) : (
                        <span className="text-[#94a3b8] text-[10px]"><CmsText>{"—"}</CmsText></span>
                      )}</CmsText>
                    </td>
                  </tr>
                ))
              )}</CmsText>
            </tbody>
          </table>
        </div>
      </Card></CmsElement>
    </div>
  );
}
