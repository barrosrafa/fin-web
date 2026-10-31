"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatPercent } from "@/lib/formatters";
import { getREITs, REITItem } from "@/lib/api";

export default function REITsPage() {
  const [reits, setREITs] = useState<REITItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getREITs();
        setREITs(data);
      } catch (err) {
        console.error("Failed to load REITs:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = reits.filter((r) =>
    r.ticker.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.subtipo_reit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-indigo"><CmsText>{"Real Estate dos EUA"}</CmsText></span>
            <span className="text-xs text-[#64748b]"><CmsText>{"Nareit Accounting & IRS 30%"}</CmsText></span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              <CmsText>{reits.length}</CmsText><CmsText>{" REITs Listados"}</CmsText></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"REITs (Real Estate Investment Trusts)"}</CmsText></h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Catálogo de fundos imobiliários norte-americanos e indicadores FFO, AFFO e P/FFO quando disponíveis. Dados sem fonte são exibidos como indisponíveis."}</CmsText></p>
        </div>

        <div className="flex items-center gap-2">
          <CmsElement feature="ui.app/-frontend-/reits/page.input.1"><input
            type="text"
            placeholder="Buscar por Ticker ou Subtipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          /></CmsElement>
        </div>
      </div>

      {/* REITs Table */}
      <CmsElement feature="ui.app/-frontend-/reits/page.Card.2"><Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6"><CmsText>{"Ticker"}</CmsText></th>
                <th className="py-4 px-4"><CmsText>{"Nome do REIT"}</CmsText></th>
                <th className="py-4 px-4"><CmsText>{"Segmento"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"Preço (USD)"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"P/FFO"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"P/AFFO"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"Ocupação"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"DY Bruto USD"}</CmsText></th>
                <th className="py-4 px-6 text-right"><CmsText>{"DY Líquido (-30%)"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b]"><CmsText>{"Carregando REITs americanos..."}</CmsText></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748b]"><CmsText>{"Nenhum REIT encontrado para a busca."}</CmsText></td>
                </tr>
              ) : (
                filtered.map((reit) => (
                  <tr key={reit.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="font-mono text-cyan-400"><CmsText>{reit.ticker}</CmsText></span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white"><CmsText>{reit.name}</CmsText></td>
                    <td className="py-4 px-4">
                      <Badge variant="indigo"><CmsText>{reit.subtipo_reit}</CmsText></Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white"><CmsText>{"$"}</CmsText><CmsText>{reit.price_usd?.toFixed(2) ?? "—"}</CmsText>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-cyan-400">
                      <CmsText>{reit.p_ffo?.toFixed(1) ?? "—"}</CmsText><CmsText>{"x"}</CmsText></td>
                    <td className="py-4 px-4 text-right font-mono text-amber-400">
                      <CmsText>{reit.p_affo?.toFixed(1) ?? "—"}</CmsText><CmsText>{"x"}</CmsText></td>
                    <td className="py-4 px-4 text-right font-mono text-[#94a3b8]">
                      <CmsText>{reit.occupancy_rate_pct?.toFixed(1) ?? "—"}</CmsText><CmsText>{"%"}</CmsText></td>
                    <td className="py-4 px-4 text-right font-mono text-[#94a3b8]">
                      <CmsText>{formatPercent(reit.gross_dy_pct)}</CmsText>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-400 font-bold">
                      <CmsText>{formatPercent(reit.net_dy_brl_pct)}</CmsText>
                    </td>
                  </tr>
                ))
              )}</CmsText>
            </tbody>
          </table>
        </div>

        <InfiniteScrollFooter
          loading={loading}
          loadingMore={false}
          hasMore={false}
          count={filtered.length}
          total={filtered.length}
          sentinelRef={() => {}}
          entityName="REITs"
          emptyMessage="Nenhum REIT encontrado para a busca."
        />
      </Card></CmsElement>
    </div>
  );
}
