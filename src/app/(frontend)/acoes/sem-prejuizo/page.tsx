"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getConsistencyScreener } from "@/lib/api";
import { ConsistencyScreenerAsset } from "@/schemas/oceans14";

export default function SemPrejuizoPage() {
  const [assets, setAssets] = useState<ConsistencyScreenerAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [minYears, setMinYears] = useState<number>(10);
  const [onlyPositiveCAGR, setOnlyPositiveCAGR] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getConsistencyScreener(minYears, onlyPositiveCAGR ? 0.0 : undefined);
        setAssets(data);
      } catch (err) {
        console.error("Erro ao carregar consistência de ações:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [minYears, onlyPositiveCAGR]);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Filtro de Consistência</span>
          <span className="text-xs text-[#64748b]">Graham & Barsi Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Ações Sem Histórico de Prejuízo
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Filtro estrito do Oceans14 que isola empresas com lucros líquidos estritamente positivos em todos os anos analisados e histórico consistente de crescimento.
        </p>
      </div>

      {/* Control Box */}
      <Card glow="emerald">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-[#64748b]">Janela de Consistência:</span>
            {[
              { years: 5, label: "Últimos 5 Anos" },
              { years: 10, label: "Últimos 10 Anos" },
              { years: 15, label: "Histórico Completo" },
            ].map((item) => (
              <button
                key={item.years}
                onClick={() => setMinYears(item.years)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  minYears === item.years
                    ? "bg-[#00f5a0] text-black shadow-[0_0_15px_rgba(0,245,160,0.4)]"
                    : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
            <input
              type="checkbox"
              checked={onlyPositiveCAGR}
              onChange={(e) => setOnlyPositiveCAGR(e.target.checked)}
              className="accent-[#00f5a0] rounded w-4 h-4"
            />
            <span>Exigir CAGR de Lucro Positivo (5 Anos)</span>
          </label>
        </div>
      </Card>

      {/* Results Table */}
      <Card glow="none" className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131926]/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">
              {loading ? "Auditando demonstrações..." : `${assets.length} empresas com 100% de lucros`}
            </span>
            <Badge variant="emerald">0 Prejuízos</Badge>
          </div>
          <span className="text-[11px] text-[#64748b]">Auditoria DFP/ITR CVM</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px] bg-[#131926]/60">
                <th className="py-3 pl-4">Ticker</th>
                <th className="py-3">Empresa</th>
                <th className="py-3">Setor</th>
                <th className="py-3 text-center">Anos Sem Prejuízo</th>
                <th className="py-3 text-right">CAGR Lucro (5A)</th>
                <th className="py-3 text-right">D.Y.</th>
                <th className="py-3 text-right">P/L</th>
                <th className="py-3 text-right">P/VP</th>
                <th className="py-3 text-right">ROE</th>
                <th className="py-3 text-right pr-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b] font-sans animate-pulse">
                    Varrendo balanços auditados dos últimos 15 anos...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#64748b] font-sans">
                    Nenhuma empresa atendeu aos critérios na janela selecionada.
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr key={a.ticker} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pl-4 font-bold text-white font-sans">
                      <Link href={`/acoes/${a.ticker}`} className="hover:text-[#00f5a0] transition-colors">
                        {a.ticker}
                      </Link>
                    </td>
                    <td className="py-3 font-sans text-white text-[11px]">
                      {a.company_name}
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8] text-[11px]">
                      {a.sector}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#00f5a0]/10 text-[#00f5a0] font-bold text-[11px]">
                        {a.consecutive_profitable_years} anos consecutivos
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {a.cagr_lucro_5y !== null ? `+${a.cagr_lucro_5y.toFixed(2)}%` : "—"}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00d9f5]">
                      {formatPercent(a.current_dy, false)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {a.current_pe !== null ? a.current_pe.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-white">
                      {a.current_pb !== null ? a.current_pb.toFixed(2) : "—"}
                    </td>
                    <td className="py-3 text-right text-[#00f5a0] font-bold">
                      {formatPercent(a.current_roe, false)}
                    </td>
                    <td className="py-3 text-right pr-4 font-sans">
                      <Link
                        href={`/acoes/${a.ticker}`}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#00f5a0] hover:text-black font-semibold transition-all"
                      >
                        Analisar
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
