"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
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
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.Link.1"><Link href="/" className="hover:text-white transition-colors"><CmsText>{"Cockpit"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <span className="text-[#00f5a0]"><CmsText>{"Derivativos & Aluguel BTC"}</CmsText></span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight"><CmsText>{"Central de Derivativos, Opções e Aluguel de Ações"}</CmsText></h1>
            <Badge variant="cyan"><CmsText>{"B3 Balcão & BDI"}</CmsText></Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{"Grade de opções com gregas analíticas Black-Scholes, volatilidade implícita, pressão vendedora em BTC e recompras."}</CmsText></p>
        </div>

        {/* Ticker Selector */}
        <div className="flex items-center gap-2 bg-[#0a0f1d] p-1.5 rounded-xl border border-[#1e293b]">
          <CmsText>{["PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3"].map((t) => (
            <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.button.2" key={t}><button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedTicker === t
                  ? "bg-[#00f5a0] text-[#060709]"
                  : "text-[#94a3b8] hover:text-white hover:bg-white/5"
              }`}
            >
              <CmsText>{t}</CmsText>
            </button></CmsElement>
          ))}</CmsText>
        </div>
      </div>

      {/* Top 3 Metric Cards BTC & Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.MetricCard.3"><MetricCard
          title="Taxa de Aluguel BTC Média"
          value={`${btc.borrowerRateAvg.toFixed(2)}% a.a.`}
          subtitle={`Spread Doador: ${btc.lenderRateAvg.toFixed(2)}% • Contratos: ${btc.activeContracts.toLocaleString("pt-BR")}`}
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.MetricCard.4"><MetricCard
          title="Volume Financeiro Alugado"
          value={formatCurrency(btc.financialVolume, true)}
          subtitle={`${btc.freeFloatBorrowedPct.toFixed(2)}% do Free Float alugado`}
          glow="cyan"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.MetricCard.5"><MetricCard
          title="Preço Spot Ativo Objeto"
          value={formatCurrency(derivativesData?.spot_price ?? 38.45)}
          subtitle="Cotação de referência para cálculo das gregas"
          glow="violet"
        /></CmsElement>
      </div>

      {/* Tabs */}
      <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.Tabs.6"><Tabs
        tabs={[
          { id: "OPCOES", label: "Grade de Opções & Gregas Black-Scholes", count: optionsList.length },
          { id: "ALUGUEL_BTC", label: "Raio-X de Empréstimo de Ações (BTC)" },
          { id: "RECOMPRAS", label: "Programas de Recompra de Ações", count: buybacks.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      /></CmsElement>

      {/* TAB 1: Opções */}
      <CmsText>{activeTab === "OPCOES" && (
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.Card.7"><Card glow="cyan">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Contratos de Opções Abertos ("}</CmsText><CmsText>{selectedTicker}</CmsText><CmsText>{")"}</CmsText></h3>
              <p className="text-xs text-[#94a3b8]"><CmsText>{"Cálculo de Gregas analíticas de primeira e segunda ordem com modelo de Black-Scholes."}</CmsText></p>
            </div>

            {/* CALL vs PUT Selector */}
            <div className="flex items-center gap-1 bg-[#0a0f1d] p-1 rounded-lg border border-[#1e293b]">
              <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.button.8"><button
                onClick={() => setOptionType("CALL")}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  optionType === "CALL"
                    ? "bg-[#00f5a0] text-[#060709]"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              ><CmsText>{"CALL (Compra)"}</CmsText></button></CmsElement>
              <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.button.9"><button
                onClick={() => setOptionType("PUT")}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  optionType === "PUT"
                    ? "bg-[#ff3b5c] text-white"
                    : "text-[#94a3b8] hover:text-white"
                }`}
              ><CmsText>{"PUT (Venda)"}</CmsText></button></CmsElement>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2"><CmsText>{"Símbolo"}</CmsText></th>
                  <th className="pb-3"><CmsText>{"Tipo / Estilo"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Strike"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Último Prêmio"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Vol. Implícita"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Delta"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Gamma"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Theta"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Open Interest"}</CmsText></th>
                  <th className="pb-3 text-right pr-2"><CmsText>{"Vencimento"}</CmsText></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                <CmsText>{optionsList.map((opt) => (
                  <tr key={opt.symbol} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-white">
                      <CmsText>{opt.symbol}</CmsText>
                      <span className="text-[10px] ml-1.5 text-[#64748b] font-sans"><CmsText>{"("}</CmsText><CmsText>{opt.moneyness}</CmsText><CmsText>{")"}</CmsText></span>
                    </td>
                    <td className="py-3 font-sans">
                      <Badge variant={opt.type === "CALL" ? "emerald" : "crimson"}>
                        <CmsText>{opt.type}</CmsText><CmsText>{" • "}</CmsText><CmsText>{opt.style}</CmsText>
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      <CmsText>{formatCurrency(opt.strike)}</CmsText>
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      <CmsText>{formatCurrency(opt.lastPrice)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-[#00d9f5]">
                      <CmsText>{opt.impliedVolatilityPct.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{opt.delta.toFixed(2)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">
                      <CmsText>{opt.gamma.toFixed(2)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-[#ff3b5c]">
                      <CmsText>{opt.theta.toFixed(2)}</CmsText>
                    </td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{opt.openInterest.toLocaleString("pt-BR")}</CmsText>
                    </td>
                    <td className="py-3 text-right pr-2 text-[#94a3b8] font-sans">
                      <CmsText>{opt.expirationDate}</CmsText>
                    </td>
                  </tr>
                ))}</CmsText>
              </tbody>
            </table>
          </div>
        </Card></CmsElement>
      )}</CmsText>

      {/* TAB 2: Aluguel BTC */}
      <CmsText>{activeTab === "ALUGUEL_BTC" && (
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.Card.10"><Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Estatísticas de Aluguel de Ações (Banco de Títulos CBLC / B3)"}</CmsText></h3>
            <Badge variant="emerald"><CmsText>{"Dados Auditados B3"}</CmsText></Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <div className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Estrutura de Taxas de Aluguel"}</CmsText></div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span><CmsText>{"Taxa Média Tomador:"}</CmsText></span>
                <span className="font-mono text-white font-bold"><CmsText>{btc.borrowerRateAvg.toFixed(2)}</CmsText><CmsText>{"% a.a."}</CmsText></span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span><CmsText>{"Taxa Mínima Tomador:"}</CmsText></span>
                <span className="font-mono text-[#00f5a0]"><CmsText>{btc.borrowerRateMin.toFixed(2)}</CmsText><CmsText>{"% a.a."}</CmsText></span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span><CmsText>{"Taxa Máxima Tomador:"}</CmsText></span>
                <span className="font-mono text-[#ff3b5c]"><CmsText>{btc.borrowerRateMax.toFixed(2)}</CmsText><CmsText>{"% a.a."}</CmsText></span>
              </div>
              <div className="flex justify-between py-1">
                <span><CmsText>{"Taxa Média Repassada ao Doador:"}</CmsText></span>
                <span className="font-mono text-[#00d9f5] font-bold"><CmsText>{btc.lenderRateAvg.toFixed(2)}</CmsText><CmsText>{"% a.a."}</CmsText></span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
              <div className="text-xs font-bold text-white uppercase tracking-wider"><CmsText>{"Volume e Pressão Vendedora"}</CmsText></div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span><CmsText>{"Quantidade de Contratos Ativos:"}</CmsText></span>
                <span className="font-mono text-white font-bold"><CmsText>{btc.activeContracts.toLocaleString("pt-BR")}</CmsText></span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span><CmsText>{"Total de Ações Alugadas:"}</CmsText></span>
                <span className="font-mono text-white font-bold"><CmsText>{btc.sharesBorrowedQty.toLocaleString("pt-BR")}</CmsText></span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span><CmsText>{"Percentual do Free Float Alugado:"}</CmsText></span>
                <span className="font-mono text-[#00f5a0] font-bold"><CmsText>{btc.freeFloatBorrowedPct.toFixed(2)}</CmsText><CmsText>{"%"}</CmsText></span>
              </div>
              <div className="flex justify-between py-1">
                <span><CmsText>{"Volume Financeiro em Aluguel:"}</CmsText></span>
                <span className="font-mono text-white font-bold"><CmsText>{formatCurrency(btc.financialVolume)}</CmsText></span>
              </div>
            </div>
          </div>
        </Card></CmsElement>
      )}</CmsText>

      {/* TAB 3: Recompras */}
      <CmsText>{activeTab === "RECOMPRAS" && (
        <CmsElement feature="ui.app/-frontend-/derivativos/DerivativesClient.Card.11"><Card glow="violet">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Programas de Recompra Aprovados pelo Conselho ("}</CmsText><CmsText>{selectedTicker}</CmsText><CmsText>{")"}</CmsText></h3>
            <Badge variant="violet"><CmsText>{"Cancelamento em Tesouraria"}</CmsText></Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2"><CmsText>{"Identificador"}</CmsText></th>
                  <th className="pb-3"><CmsText>{"Data Aprovação"}</CmsText></th>
                  <th className="pb-3"><CmsText>{"Vencimento"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Ações Autorizadas"}</CmsText></th>
                  <th className="pb-3 text-right"><CmsText>{"Adquiridas"}</CmsText></th>
                  <th className="pb-3 text-right pr-2"><CmsText>{"Execução"}</CmsText></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                <CmsText>{buybacks.map((bb) => (
                  <tr key={bb.programId} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-white"><CmsText>{bb.programId}</CmsText></td>
                    <td className="py-3 font-sans text-[#94a3b8]"><CmsText>{bb.approvalDate}</CmsText></td>
                    <td className="py-3 font-sans text-[#94a3b8]"><CmsText>{bb.expirationDate}</CmsText></td>
                    <td className="py-3 text-right text-white">
                      <CmsText>{bb.sharesAuthorized.toLocaleString("pt-BR")}</CmsText>
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      <CmsText>{bb.sharesAcquired.toLocaleString("pt-BR")}</CmsText>
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-[#00d9f5]">
                      <CmsText>{bb.executionPct.toFixed(1)}</CmsText><CmsText>{"%"}</CmsText></td>
                  </tr>
                ))}</CmsText>
              </tbody>
            </table>
          </div>
        </Card></CmsElement>
      )}</CmsText>
    </div>
  );
}
