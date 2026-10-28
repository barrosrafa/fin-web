"use client";

import React from "react";
import { formatPercent } from "@/lib/formatters";

interface UnderwaterChartProps {
  data: [timestamp: number, pct: number][];
  maxDrawdownPct: number;
  valleyDate?: string;
  recoveryDays?: number;
  height?: number;
}

export function UnderwaterDrawdownChart({
  data,
  maxDrawdownPct,
  valleyDate,
  recoveryDays,
  height = 200,
}: UnderwaterChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-xs text-[#64748b] bg-[#0a0f1d] rounded-xl border border-white/5">
        Sem dados de drawdown disponíveis para o período.
      </div>
    );
  }

  const width = 650;
  const padding = { top: 20, right: 30, bottom: 30, left: 50 };

  const minVal = Math.min(-5.0, ...data.map((d) => d[1]));
  const maxVal = 0.0;

  const getX = (index: number) => {
    return padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
  };

  const getY = (val: number) => {
    const clamped = Math.min(0, Math.max(minVal, val));
    const ratio = (clamped - maxVal) / (minVal - maxVal);
    return padding.top + ratio * (height - padding.top - padding.bottom);
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d[1])}`).join(" ");
  const zeroY = getY(0);

  // Area path closing back to the zero waterline
  const areaPath = `M ${getX(0)},${zeroY} L ${points} L ${getX(data.length - 1)},${zeroY} Z`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">Curva de Drawdown Subaquática</span>
          <span className="text-[#64748b]">• Queda acumulada do pico histórico</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] mono-nums">
          <span className="text-[#ff3b5c] font-bold">
            Max: {formatPercent(maxDrawdownPct)}
          </span>
          {valleyDate && (
            <span className="text-[#94a3b8]">Vale: {valleyDate}</span>
          )}
          {recoveryDays !== undefined && recoveryDays > 0 && (
            <span className="text-[#94a3b8]">Recup: {recoveryDays} dias</span>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden bg-[#0a0f1d] p-3 rounded-xl border border-white/5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="underwaterRedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff3b5c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff3b5c" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Waterline 0% */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={width - padding.right}
            y2={zeroY}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
          <text
            x={padding.left - 8}
            y={zeroY + 3}
            fill="#94a3b8"
            fontSize="10"
            textAnchor="end"
            className="mono-nums font-mono"
          >
            0%
          </text>

          {/* Bottom limit line */}
          <line
            x1={padding.left}
            y1={getY(minVal)}
            x2={width - padding.right}
            y2={getY(minVal)}
            stroke="#ff3b5c"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.2}
          />
          <text
            x={padding.left - 8}
            y={getY(minVal) + 3}
            fill="#ff3b5c"
            fontSize="10"
            textAnchor="end"
            className="mono-nums font-mono"
          >
            {minVal.toFixed(0)}%
          </text>

          {/* Area under waterline */}
          <path d={areaPath} fill="url(#underwaterRedGrad)" />

          {/* Line trajectory */}
          <polyline
            points={points}
            fill="none"
            stroke="#ff3b5c"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
