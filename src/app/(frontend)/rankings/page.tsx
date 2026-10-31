"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getRankings } from "@/lib/api";
import { RankingAssetItem } from "@/schemas/financial";

const ASSET_CLASSES = [
  { id: "ETF", label: "ETFs B3" },
  { id: "FII", label: "FIIs" },
  { id: "FI_INFRA", label: "FI-Infras" },
  { id: "FUNDO", label: "Fundos Mútuos" },
  { id: "INDICE", label: "Índices" },
  { id: "ETF_EUA", label: "ETFs EUA" },
  { id: "STOCK_EUA", label: "Ações EUA" },
];

const ORDER_CRITERIA = [
  { id: "retorno_30d", label: "Retorno 30 Dias" },
  { id: "retorno_12m", label: "Retorno 12 Meses" },
  { id: "taxa_adm", label: "Menor Taxa Total (TER)" },
  { id: "pl", label: "Maior Patrimônio Líquido" },
  { id: "cotistas", label: "Mais Cotistas" },
];

const CATEGORIES = ["Todos", "Renda Fixa", "Ações", "Ações Internacionais", "Alternativos"];

export default function RankingsPage() {
  const [selectedClass, setSelectedClass] = useState("ETF");
  const [selectedOrder, setSelectedOrder] = useState("retorno_30d");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [items, setItems] = useState<RankingAssetItem[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getRankings(selectedClass, selectedOrder, selectedCategory);
        if (res && res.items) {
          setItems(res.items);
        }
      } catch (err) {
        console.error("Falha ao carregar rankings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedClass, selectedOrder, selectedCategory]);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">ETFs Brasil Leaderboards</span>
          <span className="text-xs text-[#64748b]">Tabelas Classificatórias</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Rankings de Melhores Ativos de 2026
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Consulte as tabelas classificatórias dos melhores ativos do mercado financeiro brasileiro e global, ordenados por rentabilidade, menor custo de administração (TER) e captação líquida.
        </p>
      </div>

      {/* Top 3 Destaques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Líder Rentabilidade 12M"
          value="HASH11 • +112,4%"
          subtitle="Criptoativos Institucionais (NCI Index)"
          glow="emerald"
        />
        <MetricCard
          title="Menor Custo TER do Mercado"
          value="BOVA11 • 0,10% a.a."
          subtitle="Taxa primária BlackRock sem taxa secundária"
          glow="cyan"
        />
        <MetricCard
          title="Maior Base de Cotistas"
          value="IVVB11 • 195.430 cotistas"
          subtitle="Patrimônio superior a R$ 6,5 bilhões"
          glow="violet"
        />
      </div>

      {/* Painel de Filtros e Seletores */}
      <Card glow="cyan">
        <div className="flex flex-col gap-4">
          {/* Seletor de Classe de Ativo */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-2 tracking-wider">
              Classe de Ativo
            </span>
            <div className="flex flex-wrap gap-2">
              {ASSET_CLASSES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedClass(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedClass === c.id
                      ? "bg-[#00f5a0]/15 text-[#00f5a0] border border-[#00f5a0]/40 shadow-[0_0_12px_rgba(0,245,160,0.15)]"
                      : "bg-[#131926] text-[#94a3b8] border border-white/5 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seletor de Critério de Ordenação */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-2 tracking-wider">
              Ordenar Por
            </span>
            <div className="flex flex-wrap gap-2">
              {ORDER_CRITERIA.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrder(o.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedOrder === o.id
                      ? "bg-[#00d9f5]/15 text-[#00d9f5] border border-[#00d9f5]/40 shadow-[0_0_12px_rgba(0,217,245,0.15)]"
                      : "bg-[#131926] text-[#94a3b8] border border-white/5 hover:text-white"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#64748b] block mb-2 tracking-wider">
              Subcategoria
            </span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-[#64748b] hover:text-[#94a3b8]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela de Rankings Top 20 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white tracking-tight">
            Classificação Top 20 • {selectedClass} ({selectedCategory})
          </h3>
          <span className="text-xs text-[#64748b] mono-nums">
            {items.length} ativos listados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                <th className="pb-3 pl-3 w-10">Pos.</th>
                <th className="pb-3">Ticker / Fundo</th>
                <th className="pb-3 text-right">Patrimônio (PL)</th>
                <th className="pb-3 text-right">Ret. 30 Dias</th>
                <th className="pb-3 text-right">Ret. no Ano</th>
                <th className="pb-3 text-right">Ret. 12M</th>
                <th className="pb-3 text-right">Sharpe 12M</th>
                <th className="pb-3 text-right">Taxa Total (TER)</th>
                <th className="pb-3 text-right pr-3">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 mono-nums">
              {items.map((it) => (
                <tr key={it.ticker} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pl-3 font-bold text-[#64748b]">
                    #{it.pos}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{it.ticker}</span>
                      <Badge variant="cyan" className="text-[10px]">
                        {it.categoria}
                      </Badge>
                    </div>
                    <span className="text-[11px] text-[#64748b] font-sans block mt-0.5">
                      {it.nome}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-white">
                    {formatCurrency(it.patrimonio_liquido_mm * 1e6)}
                  </td>
                  <td
                    className={`py-3 text-right font-bold ${
                      it.retorno_30d >= 0 ? "text-[#00f5a0]" : "text-[#ff3b5c]"
                    }`}
                  >
                    {formatPercent(it.retorno_30d)}
                  </td>
                  <td
                    className={`py-3 text-right ${
                      it.retorno_ano >= 0 ? "text-[#00f5a0]" : "text-[#ff3b5c]"
                    }`}
                  >
                    {formatPercent(it.retorno_ano)}
                  </td>
                  <td
                    className={`py-3 text-right font-bold ${
                      it.retorno_12m >= 0 ? "text-[#00f5a0]" : "text-[#ff3b5c]"
                    }`}
                  >
                    {formatPercent(it.retorno_12m)}
                  </td>
                  <td className="py-3 text-right text-white">
                    {it.sharpe_12m !== null && it.sharpe_12m !== undefined
                      ? it.sharpe_12m.toFixed(2)
                      : "—"}
                  </td>
                  <td className="py-3 text-right font-medium text-[#f59e0b]">
                    {it.taxa_adm_total.toFixed(2)}%
                  </td>
                  <td className="py-3 text-right pr-3">
                    <Link
                      href={`/etfs/${it.ticker.toLowerCase()}`}
                      className="inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-semibold bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                      Ver ↗
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
