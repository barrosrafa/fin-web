"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { HoldingOverlapItem } from "@/schemas/financial";

interface HoldingsOverlapProps {
  tickerA: string;
  tickerB: string;
  totalOverlapPct: number;
  commonCount: number;
  items: HoldingOverlapItem[];
}

export function HoldingsOverlapTable({
  tickerA,
  tickerB,
  totalOverlapPct,
  commonCount,
  items,
}: HoldingsOverlapProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header Stat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0a0f1d] border border-white/5">
        <div>
          <div className="text-xs text-[#64748b]">Sobreposição Efetiva de Carteira</div>
          <div className="text-2xl font-black text-white mono-nums mt-0.5">
            {totalOverlapPct.toFixed(1)}%
          </div>
          <p className="text-xs text-[#94a3b8] mt-1">
            Fração do patrimônio líquido alocada simultaneamente nos mesmos ativos subjacentes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={totalOverlapPct > 50 ? "crimson" : "cyan"}>
            {totalOverlapPct > 50 ? "Alta Redundância" : "Diversificação Eficiente"}
          </Badge>
          <span className="text-xs text-[#94a3b8] mono-nums">
            {commonCount} ativos em comum
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0a0f1d]/50">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 pl-3">Ativo Subjacente</th>
              <th className="py-3 text-right font-mono text-[#00f5a0]">{tickerA}</th>
              <th className="py-3 text-right font-mono text-[#00d9f5]">{tickerB}</th>
              <th className="py-3 text-right pr-3 text-white">Sobreposição Min</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 mono-nums">
            {items.map((item) => (
              <tr key={item.codigo} className="hover:bg-white/[0.02]">
                <td className="py-3 pl-3">
                  <span className="font-bold text-white">{item.codigo}</span>
                  <span className="text-[11px] text-[#64748b] block font-sans">
                    {item.nome}
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-white">
                  {item.peso_a.toFixed(1)}%
                </td>
                <td className="py-3 text-right font-bold text-white">
                  {item.peso_b.toFixed(1)}%
                </td>
                <td className="py-3 text-right pr-3 font-bold text-[#f59e0b]">
                  {item.overlap_min.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
