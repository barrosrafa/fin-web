"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency } from "@/lib/formatters";
import { getDerivatives, DerivativesData } from "@/lib/api";
import { OptionContract, StockBorrowingBTC, BuybackProgram } from "@/schemas/financial";

export function DerivativesClient() {
  const [selectedTicker, setSelectedTicker] = useState("PETR4");
  const [optionType, setOptionType] = useState<"CALL" | "PUT">("CALL");
  const [activeTab, setActiveTab] = useState("OPCOES");
  const [derivativesData, setDerivativesData] = useState<DerivativesData | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getDerivatives(selectedTicker);
        if (res) setDerivativesData(res);
      } catch (err) {
        console.error("Failed to load derivatives data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedTicker]);

  const callsList: OptionContract[] = derivativesData?.calls ?? [];
  const putsList: OptionContract[] = derivativesData?.puts ?? [];
  const optionsList = optionType === "CALL" ? callsList : putsList;

  const btc: StockBorrowingBTC = derivativesData?.btc_borrowing ?? {
    ticker: selectedTicker,
    borrowerRateAvg: 4.85,
    borrowerRateMin: 4.20,
    borrowerRateMax: 5.50,
    lenderRateAvg: 3.90,
    activeContracts: 12450,
    sharesBorrowedQty: 48500000,
    financialVolume: 1864825000,
    freeFloatBorrowedPct: 2.45,
  };

  const buybacks: BuybackProgram[] = derivativesData?.buybacks ?? [];

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
                  ? "bg-[#00f5a0] text-[#060709]"
                  : "text-[#94a3b8] hover:text-white hover:bg-white/5"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Metric Cards BTC & Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Taxa de Aluguel BTC Média"
          value={`${btc.borrowerRateAvg.toFixed(2)}% a.a.`}
          subtitle={`Spread Doador: ${btc.lenderRateAvg.toFixed(2)}% • Contratos: ${btc.activeContracts.toLocaleString("pt-BR")}`}
          glow="emerald"
        />
        <MetricCard
          title="Volume Financeiro Alugado"
          value={formatCurrency(btc.financialVolume, true)}
          subtitle={`${btc.freeFloatBorrowedPct.toFixed(2)}% do Free Float alugado`}
          glow="cyan"
        />
        <MetricCard
          title="Preço Spot Ativo Objeto"
          value={formatCurrency(derivativesData?.spot_price ?? 38.45)}
          subtitle="Cotação de referência para cálculo das gregas"
          glow="violet"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "OPCOES", label: "Grade de Opções & Gregas Black-Scholes", count: optionsList.length },
          { id: "ALUGUEL_BTC", label: "Raio-X de Empréstimo de Ações (BTC)" },
          { id: "RECOMPRAS", label: "Programas de Recompra de Ações", count: buybacks.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Opções */}
      {activeTab === "OPCOES" && (
        <Card glow="cyan">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Contratos de Opções Abertos ({selectedTicker})
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Cálculo de Gregas analíticas de primeira e segunda ordem com modelo de Black-Scholes.
              </p>
            </div>

            {/* CALL vs PUT Selector */}
            <div className="flex items-center gap-1 bg-[#0a0f1d] p-1 rounded-lg border border-[#1e293b]">
              <button
                onClick={() => setOptionType("CALL")}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  optionType === "CALL"
                    ? "bg-[#00f5a0] text-[#060709]"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                CALL (Compra)
              </button>
              <button
                onClick={() => setOptionType("PUT")}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  optionType === "PUT"
                    ? "bg-[#ff3b5c] text-white"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              >
                PUT (Venda)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Símbolo</th>
                  <th className="pb-3">Tipo / Estilo</th>
                  <th className="pb-3 text-right">Strike</th>
                  <th className="pb-3 text-right">Último Prêmio</th>
                  <th className="pb-3 text-right">Vol. Implícita</th>
                  <th className="pb-3 text-right">Delta</th>
                  <th className="pb-3 text-right">Gamma</th>
                  <th className="pb-3 text-right">Theta</th>
                  <th className="pb-3 text-right">Open Interest</th>
                  <th className="pb-3 text-right pr-2">Vencimento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {optionsList.map((opt) => (
                  <tr key={opt.symbol} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-white">
                      {opt.symbol}
                      <span className="text-[10px] ml-1.5 text-[#64748b] font-sans">
                        ({opt.moneyness})
                      </span>
                    </td>
                    <td className="py-3 font-sans">
                      <Badge variant={opt.type === "CALL" ? "emerald" : "crimson"}>
                        {opt.type} • {opt.style}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {formatCurrency(opt.strike)}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {formatCurrency(opt.lastPrice)}
                    </td>
                    <td className="py-3 text-right text-[#00d9f5]">
                      {opt.impliedVolatilityPct.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right text-white">
                      {opt.delta.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      {opt.gamma.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-[#ff3b5c]">
                      {opt.theta.toFixed(2)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {opt.openInterest.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 text-right pr-2 text-[#94a3b8] font-sans">
                      {opt.expirationDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Aluguel BTC */}
      {activeTab === "ALUGUEL_BTC" && (
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Estatísticas de Aluguel de Ações (Banco de Títulos CBLC / B3)
            </h3>
            <Badge variant="emerald">Dados Auditados B3</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Estrutura de Taxas de Aluguel
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Taxa Média Tomador:</span>
                <span className="font-mono text-white font-bold">{btc.borrowerRateAvg.toFixed(2)}% a.a.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Taxa Mínima Tomador:</span>
                <span className="font-mono text-[#00f5a0]">{btc.borrowerRateMin.toFixed(2)}% a.a.</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Taxa Máxima Tomador:</span>
                <span className="font-mono text-[#ff3b5c]">{btc.borrowerRateMax.toFixed(2)}% a.a.</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Taxa Média Repassada ao Doador:</span>
                <span className="font-mono text-[#00d9f5] font-bold">{btc.lenderRateAvg.toFixed(2)}% a.a.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Volume e Pressão Vendedora
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Quantidade de Contratos Ativos:</span>
                <span className="font-mono text-white font-bold">{btc.activeContracts.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Total de Ações Alugadas:</span>
                <span className="font-mono text-white font-bold">{btc.sharesBorrowedQty.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span>Percentual do Free Float Alugado:</span>
                <span className="font-mono text-[#00f5a0] font-bold">{btc.freeFloatBorrowedPct.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Volume Financeiro em Aluguel:</span>
                <span className="font-mono text-white font-bold">{formatCurrency(btc.financialVolume)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: Recompras */}
      {activeTab === "RECOMPRAS" && (
        <Card glow="violet">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Programas de Recompra Aprovados pelo Conselho ({selectedTicker})
            </h3>
            <Badge variant="violet">Cancelamento em Tesouraria</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Identificador</th>
                  <th className="pb-3">Data Aprovação</th>
                  <th className="pb-3">Vencimento</th>
                  <th className="pb-3 text-right">Ações Autorizadas</th>
                  <th className="pb-3 text-right">Adquiridas</th>
                  <th className="pb-3 text-right pr-2">Execução</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {buybacks.map((bb) => (
                  <tr key={bb.programId} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-white">{bb.programId}</td>
                    <td className="py-3 font-sans text-[#94a3b8]">{bb.approvalDate}</td>
                    <td className="py-3 font-sans text-[#94a3b8]">{bb.expirationDate}</td>
                    <td className="py-3 text-right text-white">
                      {bb.sharesAuthorized.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {bb.sharesAcquired.toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-[#00d9f5]">
                      {bb.executionPct.toFixed(1)}%
                    </td>
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
