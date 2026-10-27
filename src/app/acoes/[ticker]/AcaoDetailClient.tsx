"use client";

import React, { useState } from "react";
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
  MOCK_ASSETS,
  MOCK_VALUATION_PETR4,
  MOCK_CHECKLIST_PETR4,
  MOCK_DRE_PETR4,
  MOCK_DIVIDENDS_PETR4,
  MOCK_TECHNICAL_PETR4,
  MOCK_AI_VERDICT_PETR4,
} from "@/data/mock/marketData";

export function AcaoDetailClient({ ticker }: { ticker: string }) {
  const stock =
    MOCK_ASSETS.find((a) => a.ticker === ticker) || MOCK_ASSETS[0];

  const [activeTab, setActiveTab] = useState("VALUATION");

  // Dynamic Graham & Bazin interactive sliders
  const [lpaInput, setLpaInput] = useState(MOCK_VALUATION_PETR4.lpa);
  const [vpaInput, setVpaInput] = useState(MOCK_VALUATION_PETR4.vpa);
  const [dpaInput, setDpaInput] = useState(MOCK_VALUATION_PETR4.dpaAverage);
  const [bazinYieldTarget, setBazinYieldTarget] = useState(0.06);

  // Calculated values
  const dynamicGraham = calculateGrahamValue(lpaInput, vpaInput);
  const dynamicGrahamUpside =
    stock.currentPrice > 0
      ? ((dynamicGraham - stock.currentPrice) / stock.currentPrice) * 100
      : 0;

  const dynamicBazin = calculateBazinPrice(dpaInput, bazinYieldTarget);
  const dynamicBazinUpside =
    stock.currentPrice > 0
      ? ((dynamicBazin - stock.currentPrice) / stock.currentPrice) * 100
      : 0;

  // Dynamic Gordon & DCF Interactive States
  const [gordonGrowth, setGordonGrowth] = useState(0.04);
  const [gordonDiscount, setGordonDiscount] = useState(0.12);
  const dynamicGordon =
    gordonDiscount > gordonGrowth
      ? (dpaInput * (1 + gordonGrowth)) / (gordonDiscount - gordonGrowth)
      : 0;
  const dynamicGordonUpside =
    stock.currentPrice > 0
      ? ((dynamicGordon - stock.currentPrice) / stock.currentPrice) * 100
      : 0;

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
    stock.currentPrice > 0
      ? ((dynamicDcf - stock.currentPrice) / stock.currentPrice) * 100
      : 0;

  const isPositive = stock.change24h >= 0;

  // DRE Chart Data
  const dreChartData = MOCK_DRE_PETR4.map((entry) => ({
    label: entry.year,
    value: entry.netRevenue,
    secondaryValue: entry.netIncome,
  }));

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
        <span className="text-white font-bold">{stock.ticker}</span>
      </div>

      {/* Asset Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-[#0c1017] via-[#111622] to-[#0c1017] border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-2xl text-[#00f5a0]">
            {stock.ticker.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {stock.ticker}
              </h1>
              <Badge variant="emerald" dot>
                Listada Nível 2 CVM
              </Badge>
              {stock.badge && <Badge variant="cyan">{stock.badge}</Badge>}
            </div>
            <p className="text-sm text-[#94a3b8] mt-1 font-medium">
              {stock.name} • {stock.sector}
            </p>
            <div className="flex items-center gap-4 text-xs text-[#64748b] mt-2 mono-nums">
              <span>CNPJ: 33.000.167/0001-01</span>
              <span>•</span>
              <span>Tag Along: 100% ON / 80% PN</span>
              <span>•</span>
              <span>Free Float: 48,2%</span>
            </div>
          </div>
        </div>

        {/* Current Price & Day Variation */}
        <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {formatCurrency(stock.currentPrice)}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded font-mono ${
                isPositive
                  ? "bg-[rgba(0,245,160,0.1)] text-[#00f5a0]"
                  : "bg-[rgba(255,59,105,0.1)] text-[#ff3b69]"
              }`}
            >
              {formatPercent(stock.change24h)}
            </span>
            <span className="text-xs text-[#64748b]">hoje na B3</span>
          </div>
        </div>
      </div>

      {/* Main Multiples Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Dividend Yield
          </span>
          <div className="text-lg font-black text-[#00d9f5] font-mono mt-0.5">
            {formatPercent(stock.dividendYield, false)}
          </div>
          <span className="text-[10px] text-[#64748b]">Últimos 12M</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Preço / Lucro (P/L)
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            {stock.pl ? stock.pl.toFixed(1) : "—"}
          </div>
          <span className="text-[10px] text-[#00f5a0]">Desconto setorial</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Preço / VP (P/VP)
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            {stock.pvp ? stock.pvp.toFixed(2) : "—"}
          </div>
          <span className="text-[10px] text-[#64748b]">Patrimonial</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            ROE
          </span>
          <div className="text-lg font-black text-[#00f5a0] font-mono mt-0.5">
            28,4%
          </div>
          <span className="text-[10px] text-[#64748b]">Rentabilidade PL</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Dív. Líq. / EBITDA
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            0,85x
          </div>
          <span className="text-[10px] text-[#00f5a0]">Saudável (&lt; 2.5x)</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Valor de Mercado
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            {stock.marketCap ? formatCurrency(stock.marketCap, true) : "—"}
          </div>
          <span className="text-[10px] text-[#64748b]">Capitalização</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <Tabs
        tabs={[
          { id: "VALUATION", label: "Modelos de Valuation & Graham" },
          { id: "DRE", label: "Demonstrações Contábeis DRE/DFC" },
          { id: "CHECKLIST", label: "Checklist Buy & Hold (6 Pilares)" },
          { id: "PROVENTOS", label: "Mapa Anual de Dividendos" },
          { id: "TECNICO", label: "Análise Técnica & Consenso" },
          { id: "IA", label: "Comitê de Inteligência Artificial" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* SECTION 1: Valuation Graham & Bazin */}
      {activeTab === "VALUATION" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          {/* Graham Calculator Card */}
          <div className="lg:col-span-6">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Fórmula de Graham (Preço Justo)
                  </h3>
                  <p className="text-xs text-[#64748b] font-mono mt-0.5">
                    V = √(22.5 × LPA × VPA)
                  </p>
                </div>
                <Badge variant={dynamicGrahamUpside >= 0 ? "emerald" : "crimson"}>
                  {formatPercent(dynamicGrahamUpside)}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                  Preço Justo Calculado
                </span>
                <div className="text-3xl font-black text-[#00f5a0] font-mono mt-1">
                  {formatCurrency(dynamicGraham)}
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">
                  Cotação Atual:{" "}
                  <span className="text-white font-bold">
                    {formatCurrency(stock.currentPrice)}
                  </span>
                </div>
              </div>

              {/* Interactive Sliders */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">
                      LPA (Lucro por Ação):
                    </span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(lpaInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={lpaInput}
                    onChange={(e) => setLpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">
                      VPA (Valor Patrimonial por Ação):
                    </span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(vpaInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="0.5"
                    value={vpaInput}
                    onChange={(e) => setVpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00f5a0]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#64748b] mt-5 leading-relaxed">
                Benjamin Graham preconizava que o produto de P/L e P/VP não deveria exceder 22.5. Quando o preço de mercado se situa abaixo deste valor, há margem de segurança quantitativa.
              </p>
            </Card>
          </div>

          {/* Bazin Ceiling Price Card */}
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Método Décio Bazin (Preço Teto)
                  </h3>
                  <p className="text-xs text-[#64748b] font-mono mt-0.5">
                    P_teto = DPA_médio / Yield_alvo
                  </p>
                </div>
                <Badge variant={dynamicBazinUpside >= 0 ? "cyan" : "crimson"}>
                  {formatPercent(dynamicBazinUpside)}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                  Preço Teto para Compra
                </span>
                <div className="text-3xl font-black text-[#00d9f5] font-mono mt-1">
                  {formatCurrency(dynamicBazin)}
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">
                  Até este valor, você garante o rendimento alvo selecionado.
                </div>
              </div>

              {/* Interactive Sliders */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">
                      Dividendo Médio Anual (DPA):
                    </span>
                    <span className="font-mono text-white font-bold">
                      {formatCurrency(dpaInput)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10"
                    step="0.1"
                    value={dpaInput}
                    onChange={(e) => setDpaInput(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">
                      Yield Mínimo Desejado (%):
                    </span>
                    <span className="font-mono text-white font-bold">
                      {(bazinYieldTarget * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.04"
                    max="0.12"
                    step="0.005"
                    value={bazinYieldTarget}
                    onChange={(e) => setBazinYieldTarget(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5]"
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#64748b] mt-5 leading-relaxed">
                Décio Bazin estabelece como critério de entrada empresas com dividend yield de pelo menos 6% ao ano, endividamento moderado e ausência de notícias negativas contábeis.
              </p>
            </Card>
          </div>

          {/* Gordon Growth Model Card */}
          <div className="lg:col-span-6">
            <Card glow="violet">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Modelo de Gordon (DDM Perpetuidade)
                  </h3>
                  <p className="text-xs text-[#64748b] font-mono mt-0.5">
                    P0 = D1 / (r - g)
                  </p>
                </div>
                <Badge variant={dynamicGordonUpside >= 0 ? "violet" : "crimson"}>
                  {formatPercent(dynamicGordonUpside)}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                  Preço Teórico de Gordon
                </span>
                <div className="text-3xl font-black text-[#a855f7] font-mono mt-1">
                  {formatCurrency(dynamicGordon)}
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">
                  Desconto pelo custo de capital próprio líquido de crescimento
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">Crescimento Perpétuo de Dividendos (g):</span>
                    <span className="font-mono text-white font-bold">{(gordonGrowth * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.08"
                    step="0.005"
                    value={gordonGrowth}
                    onChange={(e) => setGordonGrowth(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">Taxa de Desconto / Custo de Capital (r):</span>
                    <span className="font-mono text-white font-bold">{(gordonDiscount * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.09"
                    max="0.18"
                    step="0.005"
                    value={gordonDiscount}
                    onChange={(e) => setGordonDiscount(parseFloat(e.target.value))}
                    className="w-full accent-[#a855f7]"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* DCF 2-Estágios Card */}
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Fluxo de Caixa Descontado (DCF 2-Estágios)
                  </h3>
                  <p className="text-xs text-[#64748b] font-mono mt-0.5">
                    Valor Intrínseco por Ação (WACC + Perpetuidade)
                  </p>
                </div>
                <Badge variant={dynamicDcfUpside >= 0 ? "cyan" : "crimson"}>
                  {formatPercent(dynamicDcfUpside)}
                </Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase tracking-wider font-semibold">
                  Valor Intrínseco DCF
                </span>
                <div className="text-3xl font-black text-[#00d9f5] font-mono mt-1">
                  {formatCurrency(dynamicDcf)}
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">
                  Projeção 5 anos de FCF + Valor Residual
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">Crescimento FCF (5 anos):</span>
                    <span className="font-mono text-white font-bold">{(dcfGrowth5y * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.15"
                    step="0.005"
                    value={dcfGrowth5y}
                    onChange={(e) => setDcfGrowth5y(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">Taxa WACC (Custo Médio Ponderado):</span>
                    <span className="font-mono text-white font-bold">{(dcfWacc * 100).toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.08"
                    max="0.16"
                    step="0.005"
                    value={dcfWacc}
                    onChange={(e) => setDcfWacc(parseFloat(e.target.value))}
                    className="w-full accent-[#00d9f5]"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION 2: DRE Demonstrations */}
      {activeTab === "DRE" && (
        <Card className="animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Demonstração do Resultado do Exercício (DRE) • 5 Anos
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Rubricas contábeis oficiais CVM anualizadas (em R$ Milhões).
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#00f5a0]">
                <span className="w-2.5 h-2.5 rounded bg-[#00f5a0]" />
                Receita Líquida
              </span>
              <span className="flex items-center gap-1.5 text-[#38bdf8]">
                <span className="w-2.5 h-2.5 rounded bg-[#38bdf8]" />
                Lucro Líquido
              </span>
            </div>
          </div>

          <div className="mb-6">
            <BarChart
              data={dreChartData}
              height={180}
              formatTooltipValue={(v) => `R$ ${(v / 1000).toFixed(1)}B`}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Rubrica Contábil</th>
                  {MOCK_DRE_PETR4.map((entry) => (
                    <th key={entry.year} className="pb-3 text-right">
                      {entry.year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                <tr>
                  <td className="py-2.5 pl-2 text-white font-medium">Receita Líquida</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-white">
                      {formatNumber(e.netRevenue)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-[#94a3b8]">Custos (CPV)</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#ff3b69]">
                      {formatNumber(e.cogs)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-white font-medium">Lucro Bruto</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#00d9f5]">
                      {formatNumber(e.grossProfit)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-white font-semibold">EBITDA</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#00f5a0] font-bold">
                      {formatNumber(e.ebitda)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 pl-2 text-[#94a3b8]">Resultado Financeiro</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-2.5 text-right text-[#94a3b8]">
                      {formatNumber(e.financialResult)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-white/[0.02]">
                  <td className="py-3 pl-2 text-white font-black text-sm">Lucro Líquido</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-3 text-right text-[#00f5a0] font-black text-sm">
                      {formatNumber(e.netIncome)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pl-2 text-[#64748b] text-[11px]">Margem Líquida</td>
                  {MOCK_DRE_PETR4.map((e) => (
                    <td key={e.year} className="py-2 text-right text-[#00d9f5] font-semibold text-[11px]">
                      {formatPercent(e.netMarginPct, false)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION 3: Checklist */}
      {activeTab === "CHECKLIST" && (
        <Card className="animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Checklist do Investidor Fundamentalista
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Critérios objetivos de seleção baseados em longevidade, rentabilidade e governança.
              </p>
            </div>
            <Badge variant="emerald" dot>
              6 de 6 Aprovados (100%)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_CHECKLIST_PETR4.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider">
                      {item.pillar}
                    </span>
                    <Badge variant={item.passed ? "emerald" : "crimson"}>
                      {item.passed ? "Aprovado" : "Reprovado"}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
                    {item.explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs mono-nums">
                  <span className="text-[#64748b]">
                    Meta: {item.targetValue}
                  </span>
                  <span className="text-[#00f5a0] font-bold">
                    Atual: {item.metricValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SECTION 4: Proventos */}
      {activeTab === "PROVENTOS" && (
        <Card className="animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Mapa Histórico de Proventos Declarados
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Dividendos e Juros sobre Capital Próprio (JCP) com data-com, pagamento e mês de competência.
              </p>
            </div>
            <Badge variant="cyan">Yield Médio 5A: 16,2%</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Tipo</th>
                  <th className="pb-3">Competência</th>
                  <th className="pb-3">Data-Com</th>
                  <th className="pb-3">Data Pagamento</th>
                  <th className="pb-3 text-right">Valor Líquido</th>
                  <th className="pb-3 text-right pr-2">Yield na Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {MOCK_DIVIDENDS_PETR4.map((div) => (
                  <tr key={div.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2">
                      <Badge variant={div.type === "DIVIDENDO" ? "emerald" : "cyan"}>
                        {div.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-white font-medium">
                      {div.referenceMonth}
                    </td>
                    <td className="py-3 text-[#94a3b8]">{div.dateCom}</td>
                    <td className="py-3 text-[#94a3b8]">{div.paymentDate}</td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(div.valuePerShare)}
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-[#00f5a0]">
                      {formatPercent(div.yieldOnCostPct, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION 5: Technical */}
      {activeTab === "TECNICO" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Suportes e Resistências (ADVFN Pivôs)
                </h3>
                <Badge variant="cyan">Timeframe Diário</Badge>
              </div>

              <div className="flex flex-col gap-2.5 mono-nums text-xs">
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#ff3b69]">
                  <span>Resistência R2</span>
                  <span className="font-bold">{formatCurrency(MOCK_TECHNICAL_PETR4.resistance2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#ff3b69]">
                  <span>Resistência R1</span>
                  <span className="font-bold">{formatCurrency(MOCK_TECHNICAL_PETR4.resistance1)}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded bg-[rgba(0,217,245,0.08)] border border-[rgba(0,217,245,0.3)] text-white">
                  <span className="font-bold">Ponto de Pivô Central (PP)</span>
                  <span className="font-bold text-[#00d9f5]">{formatCurrency(MOCK_TECHNICAL_PETR4.pivotPoint)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#00f5a0]">
                  <span>Suporte S1</span>
                  <span className="font-bold">{formatCurrency(MOCK_TECHNICAL_PETR4.support1)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-white/[0.02] border border-white/5 text-[#00f5a0]">
                  <span>Suporte S2</span>
                  <span className="font-bold">{formatCurrency(MOCK_TECHNICAL_PETR4.support2)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Matriz de 13 Indicadores Técnicos
                </h3>
                <Badge variant="emerald" dot>
                  {MOCK_TECHNICAL_PETR4.summarySignal}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className="p-2 rounded bg-[rgba(0,245,160,0.08)] border border-[rgba(0,245,160,0.2)]">
                  <span className="text-[10px] text-[#00f5a0] uppercase font-bold">Compra</span>
                  <div className="text-lg font-black text-[#00f5a0] font-mono">
                    {MOCK_TECHNICAL_PETR4.buySignalsCount}
                  </div>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-[#64748b] uppercase font-bold">Neutro</span>
                  <div className="text-lg font-black text-white font-mono">
                    {MOCK_TECHNICAL_PETR4.neutralSignalsCount}
                  </div>
                </div>
                <div className="p-2 rounded bg-[rgba(255,59,105,0.08)] border border-[rgba(255,59,105,0.2)]">
                  <span className="text-[10px] text-[#ff3b69] uppercase font-bold">Venda</span>
                  <div className="text-lg font-black text-[#ff3b69] font-mono">
                    {MOCK_TECHNICAL_PETR4.sellSignalsCount}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">IFR / RSI (14 períodos):</span>
                  <span className="font-mono text-white font-bold">{MOCK_TECHNICAL_PETR4.rsi14}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94a3b8]">MACD (12, 26, 9):</span>
                  <span className="font-mono text-[#00f5a0] font-bold">{MOCK_TECHNICAL_PETR4.macd}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#94a3b8]">Estocástico Lento:</span>
                  <span className="font-mono text-white font-bold">{MOCK_TECHNICAL_PETR4.stochastic}</span>
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
              Confiança: {MOCK_AI_VERDICT_PETR4.confidenceScore}%
            </Badge>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6">
            <p className="text-xs text-[#f0f4f8] leading-relaxed">
              {MOCK_AI_VERDICT_PETR4.executiveSummary}
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
                {MOCK_AI_VERDICT_PETR4.swot.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-xs font-bold text-[#ff3b69] flex items-center gap-1.5 mb-2">
                <span>⚠</span> Fraquezas (Weaknesses)
              </span>
              <ul className="text-xs text-[#94a3b8] space-y-1.5 list-disc list-inside">
                {MOCK_AI_VERDICT_PETR4.swot.weaknesses.map((w, i) => (
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
