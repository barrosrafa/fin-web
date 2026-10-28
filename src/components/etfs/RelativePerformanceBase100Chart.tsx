"use client";

import React from "react";
import { NormalizedSeriesPoint } from "@/schemas/financial";

interface Base100ChartProps {
  series: NormalizedSeriesPoint[];
  tickers: string[];
  height?: number;
}

const COLOR_PALETTE = [
  "#00f5a0", // Emerald
  "#00d9f5", // Cyan
  "#a855f7", // Violet
  "#f59e0b", // Amber
  "#64748b", // Slate for CDI
];

export function RelativePerformanceBase100Chart({
  series,
  tickers,
  height = 240,
}: Base100ChartProps) {
  if (!series || series.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-[#64748b] bg-[#0a0f1d] rounded-xl border border-white/5">
        Sem dados de série normalizada para o período.
      </div>
    );
  }

  const width = 650;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };

  const allKeys = [...tickers];
  if (series[0]?.values["CDI"] !== undefined && !allKeys.includes("CDI")) {
    allKeys.push("CDI");
  }

  let minVal = 100.0;
  let maxVal = 100.0;

  series.forEach((pt) => {
    allKeys.forEach((k) => {
      const v = pt.values[k];
      if (v !== undefined) {
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
      }
    });
  });

  minVal = Math.floor(minVal * 0.98);
  maxVal = Math.ceil(maxVal * 1.02);

  const getX = (idx: number) => {
    return padding.left + (idx / (series.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / (maxVal - minVal || 1.0);
    return height - padding.bottom - ratio * (height - padding.top - padding.bottom);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
        {allKeys.map((k, i) => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              className="w-3 h-1 rounded-full"
              style={{ backgroundColor: COLOR_PALETTE[i % COLOR_PALETTE.length] }}
            />
            <span className="text-white font-bold">{k}</span>
            <span className="text-[#94a3b8] text-[11px]">
              ({series[series.length - 1]?.values[k]?.toFixed(1) ?? 100.0})
            </span>
          </div>
        ))}
      </div>

      <div className="relative w-full overflow-hidden bg-[#0a0f1d] p-3 rounded-xl border border-white/5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          {/* Baseline 100 line */}
          <line
            x1={padding.left}
            y1={getY(100.0)}
            x2={width - padding.right}
            y2={getY(100.0)}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <text
            x={padding.left - 8}
            y={getY(100.0) + 3}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="end"
            className="mono-nums font-mono"
          >
            100
          </text>

          {/* Top line */}
          <text
            x={padding.left - 8}
            y={getY(maxVal) + 8}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            className="mono-nums font-mono"
          >
            {maxVal}
          </text>

          {/* Draw each key series */}
          {allKeys.map((k, keyIdx) => {
            const color = COLOR_PALETTE[keyIdx % COLOR_PALETTE.length];
            const pts = series
              .map((pt, i) => {
                const v = pt.values[k];
                return v !== undefined ? `${getX(i)},${getY(v)}` : null;
              })
              .filter(Boolean)
              .join(" ");

            return (
              <polyline
                key={k}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth={k === "CDI" ? 1.5 : 2.5}
                strokeDasharray={k === "CDI" ? "4 4" : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* X Axis Dates */}
          {series.map((pt, i) => (
            <text
              key={pt.date}
              x={getX(i)}
              y={height - 8}
              fill="#64748b"
              fontSize="9"
              textAnchor="middle"
              className="mono-nums font-mono"
            >
              {pt.date.slice(5)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
