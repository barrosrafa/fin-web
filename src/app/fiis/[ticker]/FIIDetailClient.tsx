"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { RadarChart, RadarDataPoint } from "@/components/ui/RadarChart";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  calculateMagicNumber,
} from "@/lib/formatters";
import {
  MOCK_ASSETS,
  MOCK_FII_HGLG11_PROPERTIES,
  MOCK_BRICK_SCORE_HGLG11,
} from "@/data/mock/marketData";

export function FIIDetailClient({ ticker }: { ticker: string }) {
  const fii =
    MOCK_ASSETS.find((a) => a.ticker === ticker) || MOCK_ASSETS[5];

  const [activeTab, setActiveTab] = useState("IMOVEIS");

  // Magic Number interactive state
  const monthlyYield = 1.1; // R$ 1,10 por cota
  const [targetIncome, setTargetIncome] = useState(5000); // R$ 5.000 de renda mensal desejada

  const magicCotas = calculateMagicNumber(fii.currentPrice, monthlyYield);
  const capitalForMagic = magicCotas * fii.currentPrice;

  const cotasForTargetIncome = Math.ceil(targetIncome / monthlyYield);
  const capitalForTarget = cotasForTargetIncome * fii.currentPrice;

  // Radar Chart data from Brick Score
  const radarData: RadarDataPoint[] = MOCK_BRICK_SCORE_HGLG11.map((axis) => ({
    axis: axis.name,
    value: axis.score,
    weight: axis.weight,
  }));

  const overallScore = Math.round(
    MOCK_BRICK_SCORE_HGLG11.reduce(
      (acc, curr) => acc + curr.score * curr.weight,
      0
    )
  );

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/fiis" className="hover:text-white transition-colors">
          FIIs
        </Link>
        <span>/</span>
        <span className="text-white font-bold">{fii.ticker}</span>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-gradient-to-r from-[#0c1017] via-[#111622] to-[#0c1017] border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-2xl text-[#00f5a0]">
            {fii.ticker.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {fii.ticker}
              </h1>
              <Badge variant="emerald" dot>
                FII Tijolo Logístico
              </Badge>
              <Badge variant="cyan">
                Gestão Hedge / CSHG
              </Badge>
            </div>
            <p className="text-sm text-[#94a3b8] mt-1 font-medium">
              {fii.name} • Galpões Logísticos Classe AAA
            </p>
            <div className="flex items-center gap-4 text-xs text-[#64748b] mt-2 mono-nums">
              <span>CNPJ: 11.728.688/0001-47</span>
              <span>•</span>
              <span>Administrador: Credit Suisse Hedging-Griffo</span>
              <span>•</span>
              <span>Taxa Gestão: 0,75% a.a.</span>
            </div>
          </div>
        </div>

        {/* Current Price */}
        <div className="flex md:flex-col items-end justify-between md:justify-center gap-2">
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            {formatCurrency(fii.currentPrice)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded font-mono bg-[rgba(0,245,160,0.1)] text-[#00f5a0]">
              {formatPercent(fii.change24h)}
            </span>
            <span className="text-xs text-[#64748b]">hoje</span>
          </div>
        </div>
      </div>

      {/* Main Multiples Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Dividend Yield (12M)
          </span>
          <div className="text-lg font-black text-[#00d9f5] font-mono mt-0.5">
            {formatPercent(fii.dividendYield, false)}
          </div>
          <span className="text-[10px] text-[#64748b]">R$ 1,10 / cota mês</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            P/VP (Cota / VP)
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            {fii.pvp ? fii.pvp.toFixed(2) : "1.02"}
          </div>
          <span className="text-[10px] text-[#00f5a0]">VP: R$ 160,80</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Vacância Física
          </span>
          <div className="text-lg font-black text-[#00f5a0] font-mono mt-0.5">
            4.1%
          </div>
          <span className="text-[10px] text-[#00f5a0]">Financ: 2.8%</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            ABL Total Própria
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            435.500 m²
          </div>
          <span className="text-[10px] text-[#64748b]">21 Imóveis</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Brick Score Geral
          </span>
          <div className="text-lg font-black text-[#a855f7] font-mono mt-0.5">
            {overallScore} / 100
          </div>
          <span className="text-[10px] text-[#a855f7]">Qualidade AAA</span>
        </div>
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <span className="text-[10px] text-[#64748b] uppercase font-bold">
            Patrimônio Líquido
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            R$ 5,2B
          </div>
          <span className="text-[10px] text-[#64748b]">CVM Informe Mensal</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "IMOVEIS", label: "Portfólio de Imóveis (SiiLA)" },
          { id: "BRICK_SCORE", label: "Brick Score (6 Eixos)" },
          { id: "MAGIC_NUMBER", label: "Calculadora Magic Number & Renda" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* SECTION 1: Properties Table */}
      {activeTab === "IMOVEIS" && (
        <Card className="animate-fade-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Imóveis Físicos Mapeados
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Galpões logísticos e condomínios industriais com especificações técnicas e padrão construtivo SiiLA.
              </p>
            </div>
            <Badge variant="emerald" dot>
              85% Padrão AAA
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Empreendimento</th>
                  <th className="pb-3">Localização</th>
                  <th className="pb-3">Padrão SiiLA</th>
                  <th className="pb-3 text-right">ABL (m²)</th>
                  <th className="pb-3 text-right">Ocupação</th>
                  <th className="pb-3 text-right pr-2">Participação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {MOCK_FII_HGLG11_PROPERTIES.map((prop) => (
                  <tr key={prop.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-white block">
                        {prop.name}
                      </span>
                      <span className="text-[10px] text-[#64748b] font-sans">
                        {prop.address}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8]">
                      {prop.city} / {prop.state}
                    </td>
                    <td className="py-3">
                      <Badge variant="cyan">{prop.siilaStandard}</Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {prop.ablM2.toLocaleString("pt-BR")} m²
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {formatPercent(prop.occupancyPct, false)}
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-white">
                      {prop.fundSharePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION 2: Brick Score 6 Eixos with Radar Chart */}
      {activeTab === "BRICK_SCORE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <Card glow="violet" className="w-full flex flex-col items-center p-4">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Radar Poligonal do Score
                </span>
                <Badge variant="violet">{overallScore} / 100</Badge>
              </div>
              <RadarChart data={radarData} size={300} color="#a855f7" fillOpacity={0.25} />
            </Card>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-3">
            {MOCK_BRICK_SCORE_HGLG11.map((axis) => (
              <div
                key={axis.name}
                className="p-3.5 rounded-2xl bg-[#0c1017] border border-white/5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {axis.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00f5a0]">
                      {axis.score} pts
                    </span>
                    <Badge variant={axis.status === "EXCELENTE" ? "emerald" : "cyan"}>
                      {axis.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {axis.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Magic Number & Retirement Simulator */}
      {activeTab === "MAGIC_NUMBER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          {/* Magic Number Card */}
          <div className="lg:col-span-6">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Efeito Bola de Neve (Magic Number)
                </h3>
                <Badge variant="emerald">Auto-Sustentável</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase font-semibold">
                  Cotas para 1 Cota Nova por Mês
                </span>
                <div className="text-4xl font-black text-[#00f5a0] font-mono mt-1">
                  {magicCotas} cotas
                </div>
                <div className="text-xs text-[#94a3b8] mt-1">
                  Investimento total necessário:{" "}
                  <span className="text-white font-bold font-mono">
                    {formatCurrency(capitalForMagic)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-[#94a3b8] leading-relaxed">
                <p>
                  Ao atingir <strong className="text-white">{magicCotas} cotas</strong> de {fii.ticker}, o rendimento mensal de R$ {monthlyYield.toFixed(2)} por cota gerará <strong className="text-[#00f5a0]">R$ {(magicCotas * monthlyYield).toFixed(2)}</strong> todo mês, suficiente para adquirir mais 1 cota automaticamente sem novos aportes.
                </p>
              </div>
            </Card>
          </div>

          {/* Target Retirement Income */}
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Simulador de Renda Passiva
                </h3>
                <Badge variant="cyan">Projeção Mensal</Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#94a3b8]">Renda Mensal Desejada:</span>
                  <span className="font-mono text-white font-bold">
                    {formatCurrency(targetIncome)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(parseFloat(e.target.value))}
                  className="w-full accent-[#00d9f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase font-bold">
                    Cotas Necessárias
                  </span>
                  <div className="text-2xl font-black text-[#00d9f5] font-mono mt-1">
                    {cotasForTargetIncome.toLocaleString("pt-BR")}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase font-bold">
                    Patrimônio Alocado
                  </span>
                  <div className="text-2xl font-black text-white font-mono mt-1">
                    {formatCurrency(capitalForTarget, true)}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#64748b] mt-5 leading-relaxed">
                Rendimento líquido de imposto de renda para pessoas físicas conforme legislação vigente dos Fundos de Investimento Imobiliário (Lei 8.668/93 e Lei 11.033/04).
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
