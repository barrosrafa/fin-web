"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { MOCK_AI_VERDICT_PETR4 } from "@/data/mock/marketData";

export default function RadarIAPage() {
  const alerts = [
    {
      ticker: "PETR4",
      type: "Fato Relevante CVM",
      title: "Descoberta de acumulação de hidrocarbonetos em bloco exploratório no Pré-Sal",
      sentiment: "BULLISH",
      score: 92,
      time: "Há 2 horas",
      summary: "Companhia comunicou à ANP teste de formação com vazão expressiva em águas ultraprofundas, com lifting cost projetado abaixo de US$ 5.5/boe, corroborando estimativas de expansão de reservas provadas (1P).",
    },
    {
      ticker: "VALE3",
      type: "Ata da Diretoria",
      title: "Aprovação de novo programa de recompras de até 120 milhões de ações",
      sentiment: "BULLISH",
      score: 86,
      time: "Há 5 horas",
      summary: "Conselho de Administração deliberou favoravelmente à renovação do programa de cancelamento em tesouraria, gerando acréscimo direto no LPA futuro dos acionistas remanescentes.",
    },
    {
      ticker: "HGLG11",
      type: "Relatório Gerencial",
      title: "Renovação antecipada de contrato atípico por 10 anos no galpão Louveira",
      sentiment: "BULLISH",
      score: 95,
      time: "Ontem às 19:30",
      summary: "Locatário líder de e-commerce estendeu vigência até 2035 com reajuste pelo IPCA sem direito a revisional, assegurando fluxo de proventos e eliminando risco de vacância financeira no ativo.",
    },
    {
      ticker: "MGLU3",
      type: "Demonstrações ITR",
      title: "Pressão de despesas financeiras decorrentes do patamar da Selic",
      sentiment: "BEARISH",
      score: 74,
      time: "Há 1 dia",
      summary: "O Comitê de IA detectou que a despesa de juros consumiu 82% do resultado operacional consolidado no trimestre, restringindo a conversão de EBITDA em caixa líquido.",
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-violet">Comitê de IA & NLP CVM</span>
          <span className="text-xs text-[#64748b]">Ingestão Semântica Contínua</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Central de Inteligência Artificial
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Modelos neurais sintetizam relatórios gerenciais, fatos relevantes, DFP e atas da CVM em tempo real, calculando escores de sentimento e identificando anomalias contábeis.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Documentos CVM Ingeridos Hoje"
          value="142 comunicados"
          subtitle="Taxa de processamento: 1.2s / doc"
          glow="violet"
        />
        <MetricCard
          title="Sentimento Geral B3"
          value="64% Bullish"
          subtitle="Predomínio de resultados acima do consenso"
          glow="emerald"
        />
        <MetricCard
          title="Anomalias Críticas Detectadas"
          value="0 alertas graves"
          subtitle="Auditoria contábil sem ressalvas"
          glow="cyan"
        />
      </div>

      {/* Real-time Document Stream */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Feed em Tempo Real de Análises & Fatos Relevantes
        </h3>

        {alerts.map((a, i) => (
          <Card key={i} glow={a.sentiment === "BULLISH" ? "emerald" : "crimson"}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white font-mono text-sm">
                  {a.ticker}
                </span>
                <Badge variant={a.sentiment === "BULLISH" ? "emerald" : "crimson"} dot>
                  {a.sentiment}
                </Badge>
                <span className="text-xs text-[#64748b]">{a.type}</span>
              </div>
              <span className="text-xs text-[#64748b] font-mono">{a.time}</span>
            </div>

            <h4 className="text-sm font-bold text-white mb-2">
              {a.title}
            </h4>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              {a.summary}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
