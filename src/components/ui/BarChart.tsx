import React from "react";
import { formatNumber } from "@/lib/formatters";

export interface BarDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  height?: number;
  primaryColor?: string;
  secondaryColor?: string;
  formatTooltipValue?: (val: number) => string;
}

export function BarChart({
  data,
  height = 180,
  primaryColor = "#00f5a0",
  secondaryColor = "#38bdf8",
  formatTooltipValue = (v) => formatNumber(v),
}: BarChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.value, d.secondaryValue || 0))
  );

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className="w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-white/5"
        style={{ height }}
      >
        {data.map((item, idx) => {
          const primaryHeightPct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          const secondaryHeightPct =
            item.secondaryValue && maxVal > 0
              ? (item.secondaryValue / maxVal) * 100
              : 0;

          return (
            <div
              key={`bar-${idx}`}
              className="flex-1 flex flex-col items-center h-full justify-end group relative"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-[#131926] border border-white/10 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap shadow-xl z-20 mono-nums">
                {item.label}: {formatTooltipValue(item.value)}
              </div>

              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                {/* Primary Bar */}
                <div
                  className="w-full max-w-[20px] rounded-t transition-all duration-500 ease-out group-hover:brightness-125"
                  style={{
                    height: `${Math.max(6, primaryHeightPct)}%`,
                    backgroundColor: primaryColor,
                    boxShadow: `0 0 12px ${primaryColor}33`,
                  }}
                />

                {/* Secondary Bar (Optional) */}
                {item.secondaryValue !== undefined && (
                  <div
                    className="w-full max-w-[20px] rounded-t transition-all duration-500 ease-out group-hover:brightness-125"
                    style={{
                      height: `${Math.max(6, secondaryHeightPct)}%`,
                      backgroundColor: secondaryColor,
                      boxShadow: `0 0 12px ${secondaryColor}33`,
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] text-[#64748b] mt-2 select-none font-medium truncate max-w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
