"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import {
  MOCK_OPTIONS_CALLS_PETR4,
  MOCK_OPTIONS_PUTS_PETR4,
  MOCK_BTC_PETR4,
  MOCK_BUYBACKS_PETR4,
} from "@/data/mock/marketData";

export function DerivativesClient() {
  const [selectedTicker, setSelectedTicker] = useState("PETR4");
  const [optionType, setOptionType] = useState<"CALL" | "PUT">("CALL");
  const [activeTab, setActiveTab] = useState("OPCOES");

  const optionsList =
    optionType === "CALL" ? MOCK_OPTIONS_CALLS_PETR4 : MOCK_OPTIONS_PUTS_PETR4;

  const btc = MOCK_BTC_PETR4;
  const buybacks = MOCK_BUYBACKS_PETR4;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <span className="text-[#00f5a0]">Derivativos & Aluguel BTC</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Central de Derivativos, Opções e Aluguel de Ações
            </h1>
            <Badge variant="cyan">B3 Balcão & BDI</Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-1">
            Grade de opções com gregas analíticas Black-Scholes, volatilidade implícita, pressão vendedora em BTC e recompras.
          </p>
        </div>

        {/* Ticker Selector */}
        <div className="flex items-center gap-2 bg-[#0a0f1d] p-1.5 rounded-xl border border-[#1e293b]">
          {["PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTicker === t
                  ? "bg-[#00f5a0] text-black shadow-lg shadow-[#00f5a0]/20"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Macro 4-Col Grid for Selected Asset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Taxa Média Tomador (BTC)"
          value={`${btc.borrowerRateAvg.toFixed(2)}% a.a.`}
          subtitle="Taxa para alugar ações"
        />
        <MetricCard
          title="% Free Float Alugado"
          value={`${btc.freeFloatBorrowedPct.toFixed(2)}%`}
          subtitle="Pressão vendedora aberta"
        />
        <MetricCard
          title="Volume Alugado"
          value={formatCurrency(btc.financialVolume)}
          subtitle={`${formatNumber(btc.sharesBorrowedQty)} ações`}
        />
        <MetricCard
          title="Contratos Ativos"
          value={formatNumber(btc.activeContracts)}
          subtitle="Posições abertas na B3"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "OPCOES", label: "Grade de Opções & Gregas Black-Scholes" },
          { id: "ALUGUEL_BTC", label: "Monitor de Aluguel de Ações (BTC)" },
          { id: "RECOMPRAS", label: "Programas de Recompra (Buybacks)" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Grade de Opções */}
      {activeTab === "OPCOES" && (
        <Card
          title={`Grade de Opções de ${selectedTicker} — Vencimento Nov/2026`}
          subtitle="Cálculo analítico de Volatilidade Implícita e Gregas (Delta, Gamma, Theta, Vega, Rho)"
        >
          {/* Call / Put Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xs text-[#64748b] font-semibold uppercase">Tipo de Opção:</span>
            <div className="flex bg-[#0a0f1d] p-1 rounded-lg border border-[#1e293b]">
              <button
                onClick={() => setOptionType("CALL")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  optionType === "CALL"
                    ? "bg-[#00f5a0] text-black"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                CALL (Opções de Compra)
              </button>
              <button
                onClick={() => setOptionType("PUT")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  optionType === "PUT"
                    ? "bg-[#00d9f5] text-black"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                PUT (Opções de Venda)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e293b] text-[#64748b] uppercase">
                  <th className="py-3 px-4 font-semibold">Código</th>
                  <th className="py-3 px-4 font-semibold">Modelo</th>
                  <th className="py-3 px-4 font-semibold text-right">Strike</th>
                  <th className="py-3 px-4 font-semibold text-center">Moneyness</th>
                  <th className="py-3 px-4 font-semibold text-right">Último Preço</th>
                  <th className="py-3 px-4 font-semibold text-right">Vol. Implícita</th>
                  <th className="py-3 px-4 font-semibold text-right">Delta (Δ)</th>
                  <th className="py-3 px-4 font-semibold text-right">Gamma (Γ)</th>
                  <th className="py-3 px-4 font-semibold text-right">Theta (Θ)</th>
                  <th className="py-3 px-4 font-semibold text-right">Vega (ν)</th>
                  <th className="py-3 px-4 font-semibold text-right">Volume 24h</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 mono-nums">
                {optionsList.map((op) => (
                  <tr key={op.symbol} className="hover:bg-[#1e293b]/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{op.symbol}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{op.style}</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{formatCurrency(op.strike)}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          op.moneyness === "ITM"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : op.moneyness === "ATM"
                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                            : "bg-[#1e293b] text-[#94a3b8]"
                        }`}
                      >
                        {op.moneyness}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-[#00f5a0]">
                      {formatCurrency(op.lastPrice)}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400">
                      {op.impliedVolatilityPct.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-white">{op.delta.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-[#94a3b8]">{op.gamma.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-[#ff4d4d]">{op.theta.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-cyan-300">{op.vega.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-white">
                      {formatCurrency(op.volume24h)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Monitor de Aluguel BTC */}
      {activeTab === "ALUGUEL_BTC" && (
        <Card
          title={`Panorama do Mercado de Aluguel de Ações (BTC) — ${selectedTicker}`}
          subtitle="Taxas de empréstimo praticadas pelo custodiante CBLC / B3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Taxa Tomador (Mín / Média / Máx)</div>
              <div className="text-xl font-black text-white mt-1 mono-nums">
                {btc.borrowerRateMin}% / {btc.borrowerRateAvg}% / {btc.borrowerRateMax}%
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">Custo para investidores tomadores</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Taxa Média Doador</div>
              <div className="text-xl font-black text-[#00f5a0] mt-1 mono-nums">
                {btc.lenderRateAvg}% a.a.
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">Remuneração líquida para o custodiante</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Total de Contratos Abertos</div>
              <div className="text-xl font-black text-cyan-400 mt-1 mono-nums">
                {formatNumber(btc.activeContracts)}
              </div>
              <p className="text-xs text-[#94a3b8] mt-2">Volume estável em relação aos últimos 30 dias</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Recompras */}
      {activeTab === "RECOMPRAS" && (
        <Card
          title={`Programas Oficiais de Recompra de Ações (Buybacks) — ${selectedTicker}`}
          subtitle="Autorizações de compra de ações aprovadas em Conselho de Administração CVM"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e293b] text-[#64748b] uppercase">
                  <th className="py-3 px-4 font-semibold">Identificação do Programa</th>
                  <th className="py-3 px-4 font-semibold">Data Aprovação</th>
                  <th className="py-3 px-4 font-semibold">Data Vencimento</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações Autorizadas</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações Já Adquiridas</th>
                  <th className="py-3 px-4 font-semibold text-right">Execução %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/60 mono-nums">
                {buybacks.map((bb) => (
                  <tr key={bb.programId} className="hover:bg-[#1e293b]/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{bb.programId}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{bb.approvalDate}</td>
                    <td className="py-3 px-4 text-[#94a3b8]">{bb.expirationDate}</td>
                    <td className="py-3 px-4 text-right text-white">{formatNumber(bb.sharesAuthorized)}</td>
                    <td className="py-3 px-4 text-right text-[#00f5a0]">{formatNumber(bb.sharesAcquired)}</td>
                    <td className="py-3 px-4 text-right font-bold text-cyan-400">{bb.executionPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
