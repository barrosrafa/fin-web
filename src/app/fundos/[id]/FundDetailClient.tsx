"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import {
  MOCK_QUANT_RISK_FUNDO,
  MOCK_FUND_CDA_HOLDINGS,
} from "@/data/mock/marketData";

export function FundDetailClient({ fundId }: { fundId: string }) {
  const [activeTab, setActiveTab] = useState("RISCO_QUANT");

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/fundos" className="hover:text-white transition-colors">
          Fundos CVM 175
        </Link>
        <span>/</span>
        <span className="text-[#00f5a0] mono-nums">Fundo #{fundId}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1e293b]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">
              Ibiuna Hedge FIC FIM
            </h1>
            <Badge variant="cyan">CVM 175 Multimercado</Badge>
            <Badge variant="emerald">Alta Consistência</Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-1">
            CNPJ: 14.123.456/0001-89 • Gestora: Ibiuna Investimentos • Benchmark: CDI • Cotização Resgate: D+30
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b]">
          <div>
            <div className="text-xs text-[#64748b]">Patrimônio Líquido</div>
            <div className="text-xl font-bold text-white mono-nums">R$ 4,85 Bilhões</div>
          </div>
          <div className="w-px h-8 bg-[#1e293b]" />
          <div>
            <div className="text-xs text-[#64748b]">Taxa Adm / Perf</div>
            <div className="text-xl font-bold text-[#00f5a0] mono-nums">2,0% / 20%</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "RISCO_QUANT", label: "Matriz Quant de Risco 10x10" },
          { id: "CDA_CARTEIRA", label: "Composição da Carteira (CDA CVM)" },
          { id: "GESTORA", label: "Governança & Gestora" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab 1: Matriz de Risco 10x10 */}
      {activeTab === "RISCO_QUANT" && (
        <div className="flex flex-col gap-6">
          <Card
            title="Matriz Quantitativa de Risco Multitemporal (Mais Retorno Engine)"
            subtitle="10 janelas temporais x 10 métricas estatísticas calculadas em tempo real"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#64748b] uppercase">
                    <th className="py-3 px-4 font-semibold">Janela</th>
                    <th className="py-3 px-4 font-semibold text-right">Retorno</th>
                    <th className="py-3 px-4 font-semibold text-right">Volatilidade</th>
                    <th className="py-3 px-4 font-semibold text-right">Índice Sharpe</th>
                    <th className="py-3 px-4 font-semibold text-right">Sortino</th>
                    <th className="py-3 px-4 font-semibold text-right">Treynor</th>
                    <th className="py-3 px-4 font-semibold text-right">Alfa Jensen</th>
                    <th className="py-3 px-4 font-semibold text-right">Beta</th>
                    <th className="py-3 px-4 font-semibold text-right">Max Drawdown</th>
                    <th className="py-3 px-4 font-semibold text-right">Recup. (dias)</th>
                    <th className="py-3 px-4 font-semibold text-right">Meses (+)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60 mono-nums">
                  {MOCK_QUANT_RISK_FUNDO.map((row) => (
                    <tr key={row.timeframe} className="hover:bg-[#1e293b]/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{row.timeframe}</td>
                      <td className="py-3 px-4 text-right text-[#00f5a0] font-medium">
                        +{row.sharpe > 1.4 ? "18.4%" : "4.8%"}
                      </td>
                      <td className="py-3 px-4 text-right text-[#94a3b8]">{row.volatility.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-semibold">{row.sharpe.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-emerald-300">{row.sortino.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-cyan-400">{row.treynor.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-white">+{row.jensenAlpha.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right text-[#94a3b8]">{row.beta.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-[#ff4d4d]">{row.maxDrawdown.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-amber-400">{row.recoveryDays} d</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{row.positiveMonthsPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: CDA Carteira */}
      {activeTab === "CDA_CARTEIRA" && (
        <div className="flex flex-col gap-6">
          <Card
            title="Abertura de Carteira CDA (Composição e Demonstração de Ativos CVM)"
            subtitle="Última posição oficial declarada com abertura de ativos e valores financeiros"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b] text-[#64748b] uppercase">
                    <th className="py-3 px-4 font-semibold">Ativo / Instrumento</th>
                    <th className="py-3 px-4 font-semibold">Classe</th>
                    <th className="py-3 px-4 font-semibold">Código / ISIN</th>
                    <th className="py-3 px-4 font-semibold text-right">Participação %</th>
                    <th className="py-3 px-4 font-semibold text-right">Volume Financeiro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60">
                  {MOCK_FUND_CDA_HOLDINGS.map((item) => (
                    <tr key={item.identifier} className="hover:bg-[#1e293b]/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{item.assetName}</td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral">{item.assetType}</Badge>
                      </td>
                      <td className="py-3 px-4 mono-nums text-[#94a3b8]">{item.identifier}</td>
                      <td className="py-3 px-4 text-right font-bold text-[#00f5a0] mono-nums">
                        {item.weightPct.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-right text-white mono-nums">
                        {formatCurrency(item.financialValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 3: Gestora */}
      {activeTab === "GESTORA" && (
        <Card title="Perfil da Gestora e Equipe de Gestão" subtitle="Ibiuna Investimentos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Total de Ativos sob Gestão (AUM)</div>
              <div className="text-2xl font-black text-white mt-1 mono-nums">R$ 14,2 Bilhões</div>
              <p className="text-xs text-[#94a3b8] mt-2">Crescimento de +18% nos últimos 12 meses</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Ano de Fundação</div>
              <div className="text-2xl font-black text-white mt-1 mono-nums">2010</div>
              <p className="text-xs text-[#94a3b8] mt-2">16 anos de histórico consistente no mercado</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0a0f1d] border border-[#1e293b]">
              <div className="text-xs text-[#64748b]">Equipe de Gestão</div>
              <div className="text-2xl font-black text-white mt-1 mono-nums">24 Analistas</div>
              <p className="text-xs text-[#94a3b8] mt-2">Macro global, juros locais, câmbio e ações</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
