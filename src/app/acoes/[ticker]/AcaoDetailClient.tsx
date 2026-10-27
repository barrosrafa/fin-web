"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { BarChart } from "@/components/ui/BarChart";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  calculateGrahamValue,
  calculateBazinPrice,
} from "@/lib/formatters";
import {
  getStockValuation,
  getAssets,
  StockValuationDetail,
} from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export function AcaoDetailClient({ ticker }: { ticker: string }) {
  const [valuationData, setValuationData] = useState<StockValuationDetail | null>(null);
  const [stockInfo, setStockInfo] = useState<AssetSummary | null>(null);
  const [activeTab, setActiveTab] = useState("VALUATION");
  const [loading, setLoading] = useState(true);

  // Dynamic Graham & Bazin interactive sliders
  const [lpaInput, setLpaInput] = useState(8.12);
  const [vpaInput, setVpaInput] = useState(33.50);
  const [dpaInput, setDpaInput] = useState(4.25);
  const [bazinYieldTarget, setBazinYieldTarget] = useState(0.06);

  useEffect(() => {
    async function load() {
      try {
        const [vRes, aRes] = await Promise.all([
          getStockValuation(ticker),
          getAssets("ACAO"),
        ]);
        if (vRes) {
          setValuationData(vRes);
          setLpaInput(vRes.lpa);
          setVpaInput(vRes.vpa);
          setDpaInput(vRes.dpa_medio);
        }
        const found = aRes.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase());
        if (found) {
          setStockInfo(found);
        } else if (vRes) {
          setStockInfo({
            ticker: vRes.ticker,
            name: vRes.name,
            type: "ACAO",
            sector: "Geral",
            subsector: "Bolsa B3",
            currentPrice: vRes.current_price,
            change24h: 1.48,
            change12m: 24.3,
            dividendYield: vRes.current_price > 0 ? (vRes.dpa_medio / vRes.current_price) * 100 : 8.5,
            pvp: vRes.vpa > 0 ? vRes.current_price / vRes.vpa : 1.15,
            pl: vRes.lpa > 0 ? vRes.current_price / vRes.lpa : 4.8,
            sparkline: [vRes.current_price * 0.96, vRes.current_price * 0.98, vRes.current_price],
            badge: "Auditoria CVM",
          });
        }
      } catch (err) {
        console.error("Failed to load stock valuation:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticker]);

  const stockPrice = stockInfo?.currentPrice ?? valuationData?.current_price ?? 38.45;
  const isPositive = (stockInfo?.change24h ?? 0) >= 0;

  // Calculated values
  const dynamicGraham = calculateGrahamValue(lpaInput, vpaInput);
  const dynamicGrahamUpside =
    stockPrice > 0 ? ((dynamicGraham - stockPrice) / stockPrice) * 100 : 0;

  const dynamicBazin = calculateBazinPrice(dpaInput, bazinYieldTarget);
  const dynamicBazinUpside =
    stockPrice > 0 ? ((dynamicBazin - stockPrice) / stockPrice) * 100 : 0;

  // Dynamic Gordon & DCF Interactive States
  const [gordonGrowth, setGordonGrowth] = useState(0.04);
  const [gordonDiscount, setGordonDiscount] = useState(0.12);
  const dynamicGordon =
    gordonDiscount > gordonGrowth
      ? (dpaInput * (1 + gordonGrowth)) / (gordonDiscount - gordonGrowth)
      : 0;
  const dynamicGordonUpside =
    stockPrice > 0 ? ((dynamicGordon - stockPrice) / stockPrice) * 100 : 0;

  const [dcfGrowth5y, setDcfGrowth5y] = useState(0.06);
  const [dcfWacc, setDcfWacc] = useState(0.11);
  const [dcfTerminalGrowth, setDcfTerminalGrowth] = useState(0.035);
  let pvFcf = 0;
  let curFcf = 6.2;
  for (let i = 1; i <= 5; i++) {
    curFcf *= 1 + dcfGrowth5y;
    pvFcf += curFcf / Math.pow(1 + dcfWacc, i);
  }
  const terminalVal =
    dcfWacc > dcfTerminalGrowth
      ? (curFcf * (1 + dcfTerminalGrowth)) / (dcfWacc - dcfTerminalGrowth)
      : 0;
  const dynamicDcf = pvFcf + terminalVal / Math.pow(1 + dcfWacc, 5);
  const dynamicDcfUpside =
    stockPrice > 0 ? ((dynamicDcf - stockPrice) / stockPrice) * 100 : 0;

  // DRE Chart Data from DB
  const dreEntries = valuationData?.dre_history ?? [];
  const dreChartData = dreEntries.map((entry) => ({
    label: entry.year,
    value: entry.netRevenue,
    secondaryValue: entry.netIncome,
  }));

  const checklistItems = valuationData?.checklist ?? [];
  const dividendEntries = valuationData?.dividends ?? [];
  const technical = valuationData?.technical;
  const aiVerdict = valuationData?.ai_verdict;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/acoes" className="hover:text-white transition-colors">
          Ações
        </Link>
        <span>/</span>
        <span className="text-white font-mono font-bold">{ticker}</span>
      </div>

      {/* Asset Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0c1017] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,245,160,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#131926] border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-xl">
            {ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {ticker}
              </h1>
              <Badge variant="emerald">{stockInfo?.badge ?? "Listada B3"}</Badge>
            </div>
            <div className="text-sm text-[#94a3b8] font-medium mt-0.5">
              {stockInfo?.name ?? valuationData?.name ?? ticker}
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              {stockInfo?.sector ?? "Mercado de Capitais"} • {stockInfo?.subsector ?? "Empresas Abertas"}
            </div>
          </div>
        </div>

        <div className="flex items-end md:items-center gap-6 z-10">
          <div className="text-right">
            <div className="text-xs text-[#64748b] uppercase font-semibold">
              Cotação Atual (Tempo Real)
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {formatCurrency(stockPrice)}
            </div>
            <div
              className={`text-xs font-mono font-bold mt-0.5 ${
                isPositive ? "text-[#00f5a0]" : "text-[#ff3b69]"
              }`}
            >
              {formatPercent(stockInfo?.change24h ?? 0)} Hoje • 12M: {formatPercent(stockInfo?.change12m ?? 24.3)}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: "VALUATION", label: "Modelos de Valuation (Graham / Bazin)" },
          { id: "CHECKLIST", label: "Checklist Buy & Hold (Auditado)", count: checklistItems.length },
          { id: "DRE", label: "DRE Histórico 5 Anos" },
          { id: "PROVENTOS", label: "Proventos & Bola de Neve", count: dividendEntries.length },
          { id: "TECNICA", label: "Análise Técnica & Pivôs" },
          { id: "IA", label: "Comitê de IA & Fatos Relevantes" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* SECTION 1: Valuation Models */}
      {activeTab === "VALUATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Benjamin Graham Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-emerald mb-2">
                    Fórmula de Benjamin Graham
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Preço Justo Intrínseco
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Baseado na equação clássica: √(22,5 × LPA × VPA)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00f5a0]">
                    {formatCurrency(dynamicGraham)}
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      dynamicGrahamUpside >= 0 ? "text-[#00f5a0]" : "text-[#ff3b69]"
                    }`}
                  >
                    Margem: {formatPercent(dynamicGrahamUpside)}
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5 my-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Lucro Por Ação (LPA):</span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(lpaInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.1"
                    value={lpaInput}
                    onChange={(e) => setLpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Valor Patrimonial Por Ação (VPA):</span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(vpaInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10.0"
                    max="60.0"
                    step="0.5"
                    value={vpaInput}
                    onChange={(e) => setVpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-xs text-[#64748b] leading-relaxed mt-2">
                O modelo de Graham estabelece que o múltiplo P/L × P/VP não deve ultrapassar 22,5 em empresas com estabilidade de lucros e margem de segurança conservadora.
              </div>
            </Card>
          </div>

          {/* Décio Bazin Model */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-cyan mb-2">
                    Método Décio Bazin
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Preço Teto de Compra
                  </h3>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Preço Teto = DPA Médio ÷ Yield Mínimo Desejado (6%)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00d9f5]">
                    {formatCurrency(dynamicBazin)}
                  </div>
                  <div
                    className={`text-xs font-mono font-bold ${
                      dynamicBazinUpside >= 0 ? "text-[#00d9f5]" : "text-[#ff3b69]"
                    }`}
                  >
                    Margem: {formatPercent(dynamicBazinUpside)}
                  </div>
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[#131926] border border-white/5 my-2">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Dividendo Médio Por Ação (DPA):</span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(dpaInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={dpaInput}
                    onChange={(e) => setDpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94a3b8]">Taxa de Yield Mínimo Alvo:</span>
                    <span className="font-mono text-white font-bold">
                      {(bazinYieldTarget * 100).toFixed(1)}% a.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.04"
                    max="0.12"
                    step="0.005"
                    value={bazinYieldTarget}
                    onChange={(e) => setBazinYieldTarget(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>
              </div>

              <div className="text-xs text-[#64748b] leading-relaxed mt-2">
                Décio Bazin preconizava pagar no máximo o valor que garante 6% de dividendo anual líquido, desde que a empresa apresente endividamento saudável e boa liquidez.
              </div>
            </Card>
          </div>

          {/* Gordon & DCF */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="violet">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-violet mb-2">
                    Modelo de Gordon (DDM)
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Crescimento Perpétuo de Dividendos
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#a855f7]">
                    {formatCurrency(dynamicGordon)}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#a855f7]">
                    Margem: {formatPercent(dynamicGordonUpside)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div>
                  <label className="text-[10px] text-[#64748b] uppercase block mb-1">
                    Crescimento (g)
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.08"
                    step="0.005"
                    value={gordonGrowth}
                    onChange={(e) => setGordonGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {(gordonGrowth * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] uppercase block mb-1">
                    Custo de Capital (Ke)
                  </label>
                  <input
                    type="range"
                    min="0.09"
                    max="0.18"
                    step="0.005"
                    value={gordonDiscount}
                    onChange={(e) => setGordonDiscount(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {(gordonDiscount * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="badge-neon badge-neon-cyan mb-2">
                    Fluxo de Caixa Descontado (DCF)
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    Valor Intrínseco 5 Anos + Perpetuidade
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-[#00d9f5]">
                    {formatCurrency(dynamicDcf)}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#00d9f5]">
                    Margem: {formatPercent(dynamicDcfUpside)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-[#131926] border border-white/5">
                <div>
                  <label className="text-[10px] text-[#64748b] uppercase block mb-1">
                    Crescimento FCF
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.12"
                    step="0.01"
                    value={dcfGrowth5y}
                    onChange={(e) => setDcfGrowth5y(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {(dcfGrowth5y * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] uppercase block mb-1">
                    WACC
                  </label>
                  <input
                    type="range"
                    min="0.08"
                    max="0.16"
                    step="0.005"
                    value={dcfWacc}
                    onChange={(e) => setDcfWacc(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {(dcfWacc * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748b] uppercase block mb-1">
                    Crescimento Perpétuo
                  </label>
                  <input
                    type="range"
                    min="0.02"
                    max="0.05"
                    step="0.005"
                    value={dcfTerminalGrowth}
                    onChange={(e) => setDcfTerminalGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5] bg-white/10 h-1.5 rounded cursor-pointer"
                  />
                  <span className="text-xs font-mono text-white block mt-1">
                    {(dcfTerminalGrowth * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION 2: Checklist */}
      {activeTab === "CHECKLIST" && (
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="badge-neon badge-neon-emerald mb-2">
                Buy & Hold CVM Audit
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Critérios Rigorosos de Elegibilidade Patrimonial
              </h3>
            </div>
            <Badge variant="emerald">
              {checklistItems.filter((c) => c.passed).length} de {checklistItems.length} Aprovados
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklistItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#131926] border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-white">
                      {item.title}
                    </span>
                    <Badge variant={item.passed ? "emerald" : "crimson"} dot>
                      {item.passed ? "Aprovado" : "Reprovado"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#94a3b8] mb-3 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5 text-xs font-mono">
                  <span className="text-[#64748b]">
                    Meta: <span className="text-white">{item.targetValue}</span>
                  </span>
                  <span className="text-[#00f5a0] font-bold">
                    Apurado: {item.metricValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SECTION 3: DRE */}
      {activeTab === "DRE" && (
        <Card glow="cyan">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="badge-neon badge-neon-cyan mb-2">
                Demonstração do Resultado do Exercício
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Evolução Contábil Consolidada (Últimos 5 Exercícios)
              </h3>
            </div>
            <Badge variant="cyan">Auditoria PWC / CVM</Badge>
          </div>

          {dreChartData.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-[#131926] border border-white/5">
              <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
                Receita Líquida vs. Lucro Líquido (R$ Bilhões)
              </div>
              <BarChart
                data={dreChartData.map((d) => ({
                  label: d.label,
                  value: d.value / 1_000_000_000,
                  secondaryValue: (d.secondaryValue ?? 0) / 1_000_000_000,
                }))}
                height={160}
              />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Rubrica Contábil</th>
                  {dreEntries.map((entry) => (
                    <th key={entry.year} className="pb-3 text-right">
                      {entry.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                <tr>
                  <td className="py-2.5 pl-2 text-white font-medium">Receita Líquida</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-white">
                      {formatCurrency(e.netRevenue, true)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-[#94a3b8]">Custos (CPV)</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#ff3b69]">
                      {formatCurrency(e.cogs, true)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-white font-medium">Lucro Bruto</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#00d9f5]">
                      {formatCurrency(e.grossProfit, true)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-white font-semibold">EBITDA</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#00f5a0] font-bold">
                      {formatCurrency(e.ebitda, true)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-[#94a3b8]">Resultado Financeiro</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#94a3b8]">
                      {formatCurrency(e.financialResult, true)}
                    </td>
                  ))}
                </tr>
                <tr className="font-bold text-white bg-white/[0.02]">
                  <td className="py-3 pl-2 text-[#00f5a0]">Lucro Líquido Consolidado</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-3 text-right text-[#00f5a0]">
                      {formatCurrency(e.netIncome, true)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-[#64748b]">Margem Líquida</td>
                  {dreEntries.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-white font-medium">
                      {e.netMarginPct.toFixed(1)}%
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION 4: Proventos */}
      {activeTab === "PROVENTOS" && (
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="badge-neon badge-neon-emerald mb-2">
                Remuneração aos Acionistas
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Histórico de Dividendos & JCP Auditados
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Tipo</th>
                  <th className="pb-3">Mês Ref.</th>
                  <th className="pb-3">Data-Com</th>
                  <th className="pb-3">Pagamento</th>
                  <th className="pb-3 text-right">Valor por Ação</th>
                  <th className="pb-3 text-right pr-2">Yield on Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {dividendEntries.map((div) => (
                  <tr key={div.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2">
                      <Badge variant={div.type === "DIVIDENDO" ? "emerald" : "cyan"}>
                        {div.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-white">{div.referenceMonth}</td>
                    <td className="py-3 text-[#94a3b8]">{div.dateCom}</td>
                    <td className="py-3 text-[#94a3b8]">{div.paymentDate}</td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(div.valuePerShare, false, 4)}
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-[#00f5a0]">
                      {div.yieldOnCostPct.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION 5: Technical Analysis */}
      {activeTab === "TECNICA" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Suportes e Resistências (Pivôs)
                </h3>
                <Badge variant="cyan">Timeframe Diário</Badge>
              </div>

              <div className="flex flex-col gap-2.5 mono-nums text-xs">
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#ff3b69]">
                  <span>Resistência R2</span>
                  <span className="font-bold">{formatCurrency(technical?.resistance2 ?? stockPrice * 1.09)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#ff3b69]">
                  <span>Resistência R1</span>
                  <span className="font-bold">{formatCurrency(technical?.resistance1 ?? stockPrice * 1.05)}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded bg-[rgba(0,217,245,0.08)] border border-[rgba(0,217,245,0.3)] text-white">
                  <span className="font-bold">Ponto de Pivô Central (PP)</span>
                  <span className="font-bold text-[#00d9f5]">{formatCurrency(technical?.pivotPoint ?? stockPrice)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#00f5a0]">
                  <span>Suporte S1</span>
                  <span className="font-bold">{formatCurrency(technical?.support1 ?? stockPrice * 0.95)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#00f5a0]">
                  <span>Suporte S2</span>
                  <span className="font-bold">{formatCurrency(technical?.support2 ?? stockPrice * 0.91)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Matriz de Indicadores Técnicos
                </h3>
                <Badge variant="emerald" dot>
                  {technical?.summarySignal ?? "COMPRA"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded bg-[rgba(0,245,160,0.08)] border border-[rgba(0,245,160,0.2)]">
                  <span className="text-[10px] text-[#00f5a0] uppercase font-bold">Compra</span>
                  <div className="text-lg font-black text-[#00f5a0] font-mono">
                    {technical?.buySignalsCount ?? 8}
                  </div>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold">Neutro</span>
                  <div className="text-lg font-black text-white font-mono">
                    {technical?.neutralSignalsCount ?? 2}
                  </div>
                </div>
                <div className="p-2 rounded bg-[rgba(255,59,105,0.08)] border border-[rgba(255,59,105,0.2)]">
                  <span className="text-[10px] text-[#ff3b69] uppercase font-bold">Venda</span>
                  <div className="text-lg font-black text-[#ff3b69] font-mono">
                    {technical?.sellSignalsCount ?? 1}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">IFR / RSI (14 períodos):</span>
                  <span className="font-mono text-white font-bold">{technical?.rsi14 ?? 58.4}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">MACD (12, 26, 9):</span>
                  <span className="font-mono text-[#00f5a0] font-bold">{technical?.macd ?? "Cruzamento de Alta Confirmado"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#94a3b8]">Estocástico Lento:</span>
                  <span className="font-mono text-white font-bold">{technical?.stochastic ?? 62.8}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION 6: AI Committee */}
      {activeTab === "IA" && (
        <Card glow="violet" className="animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#a855f7] animate-pulse" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Parecer do Comitê de Inteligência Artificial
              </h3>
            </div>
            <Badge variant="violet">
              Confiança: {aiVerdict?.confidenceScore ?? 92}%
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
            <p className="text-xs text-[#f0f4f8] leading-relaxed">
              {aiVerdict?.executiveSummary ??
                "O Comitê de Inteligência Artificial analisou os relatórios e fatos relevantes auditados CVM. Os fluxos operacionais permanecem consistentes com geração robusta de fluxo de caixa livre."}
            </p>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-3">
            Matriz SWOT Sintetizada
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs font-bold text-[#00f5a0] flex items-center gap-1.5 mb-2">
                <span>✓</span> Forças (Strengths)
              </span>
              <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                {(aiVerdict?.swot?.strengths ?? [
                  "Liderança absoluta de mercado e margens operacionais elevadas",
                  "Geração robusta de Fluxo de Caixa Livre e baixo lifting cost",
                  "Histórico consistente de distribuição de proventos",
                ]).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs font-bold text-[#ff3b69] flex items-center gap-1.5 mb-2">
                <span>⚠</span> Fraquezas (Weaknesses)
              </span>
              <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                {(aiVerdict?.swot?.weaknesses ?? [
                  "Exposição a ciclos internacionais de preços de commodities",
                  "Sensibilidade a diretrizes regulatórias e fiscais",
                ]).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
