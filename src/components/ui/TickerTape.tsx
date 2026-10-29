"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { resolveAssetHref } from "@/lib/routes";
import { formatPercent } from "@/lib/formatters";
import { DataStatus } from "@/components/shared/DataStatus";
import { getBenchmarks } from "@/lib/api";

export interface TickerItem {
  ticker: string;
  name: string;
  value: number;
  change: number;
  prefix?: string;
  suffix?: string;
  provenance?: import("@/schemas/data-provenance").DataProvenance;
}

interface TickerTapeProps {
  items?: TickerItem[];
}

export function TickerTape({ items: initialItems }: TickerTapeProps) {
  const [mode, setMode] = useState<import("@/schemas/data-provenance").DataMode>(initialItems?.length ? "periodic" : "loading");
  const [items, setItems] = useState<TickerItem[]>(initialItems || []);

  useEffect(() => {
    let active = true;
    let pending = false;
    const controller = new AbortController();
    async function load() {
      if (pending) return;
      pending = true;
      try {
        const data = await getBenchmarks(controller.signal);
        if (active && data && data.length > 0) {
          setItems(data);
          setMode(data[0].provenance?.mode ?? "periodic");
        } else if (active) setMode(previous => previous === "periodic" || previous === "stale" ? "stale" : "missing");
      } catch (err) {
        if (active) setMode(previous => previous === "periodic" || previous === "stale" ? "stale" : "missing");
        console.error("Failed to load ticker tape benchmarks:", err);
      } finally { pending = false; }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { active = false; controller.abort(); clearInterval(interval); };
  }, []);

  // Duplicate array to achieve smooth infinite marquee loop
  const duplicated = [...items, ...items];

  return (
    <div className="w-full bg-[#060709]/90 border-b border-white/5 py-1.5 overflow-hidden select-none relative z-30">
      {items.length === 0 && <p role="status" className="text-xs text-center text-[#94a3b8]">{mode === "loading" ? "Carregando cotações de referência…" : "Cotações de referência indisponíveis"}</p>}
      <DataStatus {...items[0]?.provenance} mode={mode} />
      <div className="animate-ticker">
        {duplicated.map((item, idx) => {
          const isPositive = item.change >= 0;
          return (
            <Link
              key={`tape-${item.ticker}-${idx}`}
              href={resolveAssetHref(item.ticker)}
              aria-hidden={idx >= items.length}
              tabIndex={idx >= items.length ? -1 : undefined}
              className="inline-flex items-center gap-2.5 px-4 text-xs hover:bg-white/[0.04] py-0.5 rounded transition-colors group"
            >
              <span className="font-bold text-[#f0f4f8] group-hover:text-[#00d9f5] transition-colors">
                {item.ticker}
              </span>
              <span className="text-[#94a3b8] hidden sm:inline text-[11px]">
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
                    ? "bg-[rgba(0,245,160,0.1)] text-[var(--positive)]"
                    : "bg-[rgba(255,59,105,0.1)] text-[var(--negative)]"
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
