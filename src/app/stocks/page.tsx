"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-indigo">Mercado Americano (EUA)</span>
            <span className="text-xs text-[#64748b]">NYSE & NASDAQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Stocks & Ações Internacionais
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Catálogo de empresas globais cotadas em Dólar (USD) com conversão simultânea em Reais (BRL)
            calculada pela taxa PTAX diária do Banco Central.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por Ticker ou Nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Stocks Table */}
      <Card className="overflow-hidden p-0 border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#cbd5e1]">
            <thead className="bg-[#0f172a]/80 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-4 px-6">Ticker</th>
                <th className="py-4 px-4">Empresa</th>
                <th className="py-4 px-4">Setor</th>
                <th className="py-4 px-4 text-right">Preço (USD)</th>
                <th className="py-4 px-4 text-right">Preço (BRL PTAX)</th>
                <th className="py-4 px-4 text-right">P/L (P/E)</th>
                <th className="py-4 px-6 text-right">Dividend Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b]">
                    Carregando ações americanas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#64748b]">
                    Nenhuma ação internacional encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((stock) => (
                  <tr key={stock.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <span className="font-mono text-cyan-400">{stock.ticker}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-white">{stock.name}</td>
                    <td className="py-4 px-4">
                      <Badge variant="indigo">{stock.sector}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ${stock.price_usd.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[#94a3b8]">
                      {formatCurrency(stock.price_brl)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-cyan-400">
                      {stock.pe_ratio ? `${stock.pe_ratio.toFixed(1)}x` : "—"}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-emerald-400 font-semibold">
                      {formatPercent(stock.dividend_yield_pct)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
