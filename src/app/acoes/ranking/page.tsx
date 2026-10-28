"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getStocksRanking } from "@/lib/api";
import { StockRankingRow } from "@/schemas/oceans14";

export default function AcoesRankingPage() {
  const [ranking, setRanking] = useState<StockRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("dy");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getStocksRanking(sortBy, 100);
        setRanking(data);
      } catch (err) {
        console.error("Erro ao carregar ranking de ações:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sortBy]);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">Oceans14 Standard</span>
          <span className="text-xs text-[#64748b]">Ranking Quantitativo Dinâmico</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Ranking Fundamentalista de Ações
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Classificação automatizada de todas as companhias listadas na B3 por múltiplos de proventos, valuation, rentabilidade e margens.
        </p>
      </div>

      {/* Preset Buttons */}
      <Card glow="cyan">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase text-[#64748b] mr-2">Ordenar por:</span>
          {[
            { id: "dy", label: "Maior Dividend Yield" },
            { id: "pl", label: "Menor P/L" },
            { id: "pvp", label: "Menor P/VP" },
            { id: "roe", label: "Maior ROE" },
            { id: "roic", label: "Maior ROIC" },
            { id: "margem_liquida", label: "Maior Margem Líquida" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSortBy(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === item.id
                  ? "bg-[#00d9f5] text-black shadow-[0_0_15px_rgba(0,217,245,0.4)]"
                  : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <span className="text-xs font-bold text-white">
            {loading ? "Calculando ranking..." : `${ranking.length} empresas ranqueadas`}
          </span>
          <span className="text-[11px] text-[#64748b]">Atualizado após fechamento da B3</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4 w-12 text-center">Pos</th>
                <th className="py-3">Ativo</th>
                <th className="py-3">Setor</th>
                <th className="py-3 text-right">Preço</th>
                <th className="py-3 text-right">D.Y. (12M)</th>
                <th className="py-3 text-right">P/L</th>
                <th className="py-3 text-right">P/VP</th>
                <th className="py-3 text-right">ROE</th>
                <th className="py-3 text-right">ROIC</th>
                <th className="py-3 text-right">Margem Líq</th>
                <th className="py-3 text-right pr-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#64748b] font-sans animate-pulse">
                    Consultando rankings e indicadores fundamentalistas no Neon DB...
                  </td>
                </tr>
              ) : (
                ranking.map((row) => (
                  <tr key={row.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-4 text-center font-bold text-[#64748b]">
                      #{row.rank}
                    </td>
                    <td className="py-3 font-sans">
                      <Link href={`/acoes/${row.ticker}`} className="font-bold text-white hover:text-[#00f5a0] transition-colors">
                        {row.ticker}
                      </Link>
                      <span className="block text-[10px] text-[#64748b] truncate max-w-[140px] font-sans">
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]">
                      {row.sector}
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(row.price)}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">
                      {formatPercent(row.dy, false)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {row.pl !== null ? row.pl.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {row.pvp !== null ? row.pvp.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-[#00f5a0] font-bold">
                      {row.roe !== null ? formatPercent(row.roe, false) : "—"}
                    </td>
                    <td className="py-3 text-right text-[#00f5a0]">
                      {row.roic !== null ? formatPercent(row.roic, false) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {row.margem_liquida !== null ? formatPercent(row.margem_liquida, false) : "—"}
                    </td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <Link
                        href={`/acoes/${row.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      >
                        Ver
                      </Link>
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
