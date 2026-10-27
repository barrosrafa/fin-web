import React from "react";
import Link from "next/link";
import { formatPercent } from "@/lib/formatters";

interface TickerItem {
  ticker: string;
  name: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
}

interface TickerTapeProps {
  items: TickerItem[];
}

export function TickerTape({ items }: TickerTapeProps) {
  // Duplicate array to achieve smooth infinite marquee loop
  const duplicated = [...items, ...items];

  return (
    <div className="w-full bg-[#060709]/90 border-b border-white/5 py-1.5 overflow-hidden select-none relative z-30">
      <div className="animate-ticker">
        {duplicated.map((item, idx) => {
          const isPositive = item.change >= 0;
          return (
            <Link
              key={`tape-${item.ticker}-${idx}`}
              href={item.ticker.includes("11") ? `/fiis/${item.ticker}` : `/acoes/${item.ticker}`}
              className="inline-flex items-center gap-2.5 px-4 text-xs hover:bg-white/[0.04] py-0.5 rounded transition-colors group"
            >
              <span className="font-bold text-[#f0f4f8] group-hover:text-[#00d9f5] transition-colors">
                {item.ticker}
              </span>
              <span className="text-[#64748b] hidden sm:inline text-[11px]">
                {item.name}
              </span>
              <span className="mono-nums text-[#94a3b8] font-medium">
                {item.prefix || ""}
                {item.value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                {item.suffix || ""}
              </span>
              <span
                className={`mono-nums font-semibold text-[11px] px-1.5 py-0.5 rounded ${
                  isPositive
                    ? "bg-[rgba(0,245,160,0.1)] text-[#00f5a0]"
                    : "bg-[rgba(255,59,105,0.1)] text-[#ff3b69]"
                }`}
              >
                {formatPercent(item.change)}
              </span>
              <span className="text-white/10 mx-2">•</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
