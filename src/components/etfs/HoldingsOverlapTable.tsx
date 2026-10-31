"use client";


import { CmsText } from "@/components/content/Cms";
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
          <div className="text-xs text-[#64748b]"><CmsText>{"Sobreposição Efetiva de Carteira"}</CmsText></div>
          <div className="text-2xl font-black text-white mono-nums mt-0.5">
            <CmsText>{totalOverlapPct.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></div>
          <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Fração do patrimônio líquido alocada simultaneamente nos mesmos ativos subjacentes."}</CmsText></p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={totalOverlapPct > 50 ? "crimson" : "cyan"}>
            <CmsText>{totalOverlapPct > 50 ? "Alta Redundância" : "Diversificação Eficiente"}</CmsText>
          </Badge>
          <span className="text-xs text-[#94a3b8] mono-nums">
            <CmsText>{commonCount}</CmsText><CmsText>{" ativos em comum"}</CmsText></span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0a0f1d]/50">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
              <th className="py-3 pl-3"><CmsText>{"Ativo Subjacente"}</CmsText></th>
              <th className="py-3 text-right font-mono text-[#00f5a0]"><CmsText>{tickerA}</CmsText></th>
              <th className="py-3 text-right font-mono text-[#00d9f5]"><CmsText>{tickerB}</CmsText></th>
              <th className="py-3 text-right pr-3 text-white"><CmsText>{"Sobreposição Min"}</CmsText></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 mono-nums">
            <CmsText>{items.map((item) => (
              <tr key={item.codigo} className="hover:bg-white/[0.02]">
                <td className="py-3 pl-3">
                  <span className="font-bold text-white"><CmsText>{item.codigo}</CmsText></span>
                  <span className="text-[11px] text-[#64748b] block font-sans">
                    <CmsText>{item.nome}</CmsText>
                  </span>
                </td>
                <td className="py-3 text-right font-bold text-white">
                  <CmsText>{item.peso_a.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                <td className="py-3 text-right font-bold text-white">
                  <CmsText>{item.peso_b.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                <td className="py-3 text-right pr-3 font-bold text-[#f59e0b]">
                  <CmsText>{item.overlap_min.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
              </tr>
            ))}</CmsText>
          </tbody>
        </table>
      </div>
    </div>
  );
}
