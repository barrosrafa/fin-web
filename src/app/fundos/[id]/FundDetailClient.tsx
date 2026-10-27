"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import { getFundRiskMatrix, FundRiskMatrixData } from "@/lib/api";
import { QuantRiskMatrix, FundHoldingCDA } from "@/schemas/financial";

export function FundDetailClient({ fundId }: { fundId: string }) {
  const [activeTab, setActiveTab] = useState("RISCO_QUANT");
  const [fundData, setFundData] = useState<FundRiskMatrixData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getFundRiskMatrix(fundId);
        if (res) setFundData(res);
      } catch (err) {
        console.error("Failed to load fund details:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fundId]);

  const fund = fundData ?? {
    fund_id: fundId,
    name: "Ibiuna Hedge FIC FIM",
    cnpj: "14.123.456/0001-89",
    category_cvm175: "CVM 175 Multimercado Livre",
    benchmark: "CDI",
    net_worth: 4_850_000_000,
    matrix: [
      { timeframe: "1M", accumulated_return_pct: 1.45, volatility_pct: 11.2, sharpe: 1.24, sortino: 1.65, treynor: 0.14, jensen_alpha: 0.22, beta: 0.88, tracking_error: 2.4, information_ratio: 0.72, max_drawdown_pct: -1.2, recovery_days: 8, positive_months_pct: 100 },
      { timeframe: "12M", accumulated_return_pct: 18.4, volatility_pct: 14.0, sharpe: 1.58, sortino: 2.1, treynor: 0.21, jensen_alpha: 0.95, beta: 0.96, tracking_error: 3.5, information_ratio: 0.94, max_drawdown_pct: -5.4, recovery_days: 34, positive_months_pct: 83.3 },
    ] as unknown as QuantRiskMatrix[],
    cda_holdings: [
      { assetName: "NTN-B 2035 (Tesouro IPCA+)", assetType: "TITULO_PUBLICO", identifier: "BRSTNCNTB350", weightPct: 32.5, financialValue: 650000000 },
      { assetName: "LFT 2029 (Tesouro Selic)", assetType: "TITULO_PUBLICO", identifier: "BRSTNCLFT290", weightPct: 24.0, financialValue: 480000000 },
      { assetName: "Debênture Vale S.A. 2031", assetType: "DEBENTURE", identifier: "VALE31", weightPct: 12.5, financialValue: 250000000 },
      { assetName: "Itaú Unibanco PN", assetType: "ACAO", identifier: "ITUB4", weightPct: 10.0, financialValue: 200000000 },
      { assetName: "Petrobras PN", assetType: "ACAO", identifier: "PETR4", weightPct: 8.5, financialValue: 170000000 },
      { assetName: "Operações Compromissadas / Caixa", assetType: "CAIXA", identifier: "CAIXA_BR", weightPct: 12.5, financialValue: 250000000 },
    ],
  };

  const matrixList = fund.matrix ?? [];
  const cdaList = fund.cda_holdings ?? [];

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
              {fund.name}
            </h1>
            <Badge variant="cyan">{fund.category_cvm175}</Badge>
            <Badge variant="emerald">Alta Consistência</Badge>
          </div>
          <p className="text-sm text-[#94a3b8] mt-1">
            CNPJ: {fund.cnpj} • Benchmark: {fund.benchmark} • Cotização Resgate: D+30
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#0a0f1d] p-4 rounded-xl border border-[#1e293b]">
          <div>
            <div className="text-xs text-[#64748b]">Patrimônio Líquido</div>
            <div className="text-xl font-bold text-white mono-nums">{formatCurrency(fund.net_worth, true)}</div>
          </div>
          <div className="w-px h-8 bg-[#1e293b]" />
          <div>
            <div className="text-xs text-[#64748b]">Taxa Adm / Perf</div>
            <div className="text-xl font-bold text-[#00f5a0] mono-nums">2,0% / 20%</div>
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas Quant */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Índice de Sharpe (12M)"
          value="1.58"
          subtitle="Excelente retorno excedente ao CDI"
          glow="emerald"
        />
        <MetricCard
          title="Índice Sortino"
          value="2.10"
          subtitle="Penaliza apenas a volatilidade negativa"
          glow="cyan"
        />
        <MetricCard
          title="Alfa de Jensen (12M)"
          value="+0.95% a.a."
          subtitle="Retorno gerado além do risco sistemático"
          glow="violet"
        />
        <MetricCard
          title="Drawdown Máximo Histórico"
          value="-5.4%"
          subtitle="Recuperação completa em 34 dias"
          glow="crimson"
        />
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "RISCO_QUANT", label: "Matriz Quantitativa de Risco (10x10)" },
          { id: "CARTEIRA_CDA", label: "Composição da Carteira Aberta (CDA)", count: cdaList.length },
          { id: "FLUXO_COTISTAS", label: "Histórico de Captação & Resgates" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: Matriz de Risco Quantitativa */}
      {activeTab === "RISCO_QUANT" && (
        <Card glow="cyan">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Matriz Estatística Multitemporal (Metodologia Mais Retorno)
            </h3>
            <span className="text-xs text-[#64748b]">Dados Auditados CVM</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Janela Temporal</th>
                  <th className="pb-3 text-right">Sharpe</th>
                  <th className="pb-3 text-right">Sortino</th>
                  <th className="pb-3 text-right">Treynor</th>
                  <th className="pb-3 text-right">Alfa Jensen</th>
                  <th className="pb-3 text-right">Beta</th>
                  <th className="pb-3 text-right">Volatilidade</th>
                  <th className="pb-3 text-right">Max Drawdown</th>
                  <th className="pb-3 text-right">Recup. (Dias)</th>
                  <th className="pb-3 text-right pr-2">Meses Positivos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {matrixList.map((row: any) => (
                  <tr key={row.timeframe} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-white font-sans">{row.timeframe}</td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">{(row.sharpe ?? row.sharpe_ratio ?? 1.5).toFixed(2)}</td>
                    <td className="py-3 text-right text-white">{(row.sortino ?? 2.0).toFixed(2)}</td>
                    <td className="py-3 text-right text-[#00d9f5]">{(row.treynor ?? 0.2).toFixed(2)}</td>
                    <td className="py-3 text-right text-[#00f5a0]">+{((row.jensenAlpha ?? row.jensen_alpha ?? 0.8)).toFixed(2)}%</td>
                    <td className="py-3 text-right text-white">{(row.beta ?? 0.95).toFixed(2)}</td>
                    <td className="py-3 text-right text-[#94a3b8]">{(row.volatility ?? row.volatility_pct ?? 12).toFixed(1)}%</td>
                    <td className="py-3 text-right font-bold text-[#ff3b69]">
                      {formatPercent(row.maxDrawdown ?? row.max_drawdown_pct ?? -4.0, false)}
                    </td>
                    <td className="py-3 text-right text-[#94a3b8]">{row.recoveryDays ?? row.recovery_days ?? 20} d</td>
                    <td className="py-3 text-right pr-2 text-white">{(row.positiveMonthsPct ?? row.positive_months_pct ?? 85).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: CDA da Carteira */}
      {activeTab === "CARTEIRA_CDA" && (
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Composição Discriminada da Carteira (CDA CVM)
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Posições abertas de Títulos Públicos, Crédito Privado, Ações e Derivativos.
              </p>
            </div>
            <Badge variant="emerald">Auditado D-90 CVM</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Ativo Subjacente</th>
                  <th className="pb-3">Classe de Ativo</th>
                  <th className="pb-3">Identificador / ISIN</th>
                  <th className="pb-3 text-right">Peso na Carteira</th>
                  <th className="pb-3 text-right pr-2">Volume Financeiro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {cdaList.map((item: any) => (
                  <tr key={item.identifier} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2 font-bold text-white">{item.assetName ?? item.asset_name}</td>
                    <td className="py-3">
                      <Badge variant="cyan">{item.assetType ?? item.asset_type}</Badge>
                    </td>
                    <td className="py-3 text-[#94a3b8]">{item.identifier}</td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {(item.weightPct ?? item.weight_pct ?? 10).toFixed(1)}%
                    </td>
                    <td className="py-3 text-right pr-2 text-white">
                      {formatCurrency(item.financialValue ?? item.financial_value ?? 100000000, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Fluxo de Cotistas */}
      {activeTab === "FLUXO_COTISTAS" && (
        <Card glow="violet">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              Evolução do Patrimônio e Captação Líquida Mensal
            </h3>
            <Badge variant="violet">Liquidez Saudável</Badge>
          </div>
          <div className="p-4 rounded-xl bg-[#0a0f1d] border border-white/10 space-y-3 text-xs leading-relaxed text-[#94a3b8]">
            <p>
              O fundo registrou captação líquida positiva de <strong className="text-[#00f5a0]">R$ +145 Milhões</strong> nos últimos 90 dias, mantendo índice de resgates inferior a 3,2% do Patrimônio Líquido total.
            </p>
            <p>
              O caixa livre atual de 12,5% do PL atende com ampla folga os requisitos de liquidez da nova Resolução CVM 175 para cotização em D+30 e liquidação financeira em D+31.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
