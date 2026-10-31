"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getUSEquities, USEquityItem } from "@/lib/api";

export default function StocksPage() {
  const [stocks, setStocks] = useState<USEquityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getUSEquities();
        setStocks(data);
      } catch (err) {
        console.error("Failed to load US stocks:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = stocks.filter((s) =>
    s.ticker.toLowerCase().includes(search.toLowerCase()) ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-indigo"><CmsText>{"Mercado Americano (EUA)"}</CmsText></span>
            <span className="text-xs text-[#64748b]"><CmsText>{"NYSE & NASDAQ"}</CmsText></span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              <CmsText>{stocks.length}</CmsText><CmsText>{" Stocks Globais"}</CmsText></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Stocks & Ações Internacionais"}</CmsText></h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Catálogo de empresas globais cotadas em Dólar (USD) com conversão simultânea em Reais (BRL) calculada pela taxa PTAX diária do Banco Central."}</CmsText></p>
        </div>

        <div className="flex items-center gap-2">
          <CmsElement feature="ui.app/-frontend-/stocks/page.input.1"><input
            type="text"
            placeholder="Buscar por Ticker ou Nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          /></CmsElement>
        </div>
      </div>

      {/* Stocks Table */}
      <CmsElement feature="ui.app/-frontend-/stocks/page.Card.2"><Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6"><CmsText>{"Ticker"}</CmsText></th>
                <th className="py-4 px-4"><CmsText>{"Empresa"}</CmsText></th>
                <th className="py-4 px-4"><CmsText>{"Setor"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"Preço (USD)"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"Preço (BRL PTAX)"}</CmsText></th>
                <th className="py-4 px-4 text-right"><CmsText>{"P/L (P/E)"}</CmsText></th>
                <th className="py-4 px-6 text-right"><CmsText>{"Dividend Yield"}</CmsText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <CmsText>{loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b]"><CmsText>{"Carregando ações americanas..."}</CmsText></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b]"><CmsText>{"Nenhuma ação internacional encontrada."}</CmsText></td>
                </tr>
              ) : (
                filtered.map((stock) => (
                  <tr key={stock.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="font-mono text-cyan-400"><CmsText>{stock.ticker}</CmsText></span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white"><CmsText>{stock.name}</CmsText></td>
                    <td className="py-4 px-4">
                      <Badge variant="indigo"><CmsText>{stock.sector}</CmsText></Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white"><CmsText>{"$"}</CmsText><CmsText>{stock.price_usd?.toFixed(2) ?? "—"}</CmsText>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[#94a3b8]">
                      <CmsText>{formatCurrency(stock.price_brl)}</CmsText>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-cyan-400">
                      <CmsText>{stock.pe_ratio ? `${stock.pe_ratio.toFixed(1)}x` : "—"}</CmsText>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-400 font-semibold">
                      <CmsText>{formatPercent(stock.dividend_yield_pct)}</CmsText>
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
          entityName="ações internacionais"
          emptyMessage="Nenhuma ação internacional encontrada."
        />
      </Card></CmsElement>
    </div>
  );
}
