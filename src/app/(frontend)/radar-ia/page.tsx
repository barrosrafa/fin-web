"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { getAIAlerts, getAISentiment, AIAlert, AISentimentData } from "@/lib/api";

const FEATURED_TICKERS = ["PETR4", "VALE3", "WEGE3", "BBAS3", "ITUB4", "HGLG11"];

export default function RadarIAPage() {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [selectedTicker, setSelectedTicker] = useState("PETR4");
  const [sentiment, setSentiment] = useState<AISentimentData | null>(null);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingSentiment, setLoadingSentiment] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getAIAlerts();
        setAlerts(data);
      } catch (err) {
        console.error("Failed to load AI alerts:", err);
      } finally {
        setLoadingAlerts(false);
      }
    }
    loadAlerts();
  }, []);

  useEffect(() => {
    async function loadSentiment() {
      setLoadingSentiment(true);
      try {
        const data = await getAISentiment(selectedTicker);
        setSentiment(data);
      } catch (err) {
        console.error(`Failed to load AI sentiment for ${selectedTicker}:`, err);
      } finally {
        setLoadingSentiment(false);
      }
    }
    loadSentiment();
  }, [selectedTicker]);

  const bullishCount = alerts.filter((a) => a.sentiment === "BULLISH").length;
  const bullishPct = alerts.length > 0 ? Math.round((bullishCount / alerts.length) * 100) : 100;
  const criticalCount = alerts.filter((a) => a.sentiment === "BEARISH").length;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-violet"><CmsText>{"Comitê de IA & NLP CVM"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Ingestão Semântica Contínua"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Central de Inteligência Artificial"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl"><CmsText>{"Modelos neurais sintetizam relatórios gerenciais, fatos relevantes, DFP e atas da CVM em tempo real, calculando escores de sentimento e identificando anomalias contábeis."}</CmsText></p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CmsElement feature="ui.app/-frontend-/radar-ia/page.MetricCard.1"><MetricCard
          title="Documentos CVM Ingeridos"
          value={loadingAlerts ? "Carregando..." : `${alerts.length} comunicados`}
          subtitle="Taxa de processamento: 1.2s / doc"
          glow="violet"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/radar-ia/page.MetricCard.2"><MetricCard
          title="Sentimento Geral B3"
          value={loadingAlerts ? "Carregando..." : `${bullishPct}% Otimista`}
          subtitle={`${bullishCount} de ${alerts.length} comunicados com viés de alta`}
          glow="emerald"
        /></CmsElement>
        <CmsElement feature="ui.app/-frontend-/radar-ia/page.MetricCard.3"><MetricCard
          title="Anomalias Críticas Detectadas"
          value={loadingAlerts ? "Carregando..." : `${criticalCount} alertas de atenção`}
          subtitle="Auditoria e monitoramento de passivos"
          glow={criticalCount > 0 ? "crimson" : "cyan"}
        /></CmsElement>
      </div>

      {/* Deep Dive Ticker Intelligence */}
      <CmsElement feature="ui.app/-frontend-/radar-ia/page.Card.4"><Card glow="violet">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Veredito do Comitê de IA por Ativo"}</CmsText></h3>
              <p className="text-xs text-[#94a3b8]"><CmsText>{"Selecione uma empresa para inspecionar síntese de NLP, score de confiança e matriz SWOT."}</CmsText></p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <CmsText>{FEATURED_TICKERS.map((t) => (
                <CmsElement feature="ui.app/-frontend-/radar-ia/page.button.5" key={t}><button
                  key={t}
                  onClick={() => setSelectedTicker(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                    selectedTicker === t
                      ? "bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <CmsText>{t}</CmsText>
                </button></CmsElement>
              ))}</CmsText>
            </div>
          </div>

          <CmsText>{loadingSentiment ? (
            <div className="py-8 text-center text-xs text-[#64748b] animate-pulse"><CmsText>{"Consultando modelo de inteligência para "}</CmsText><CmsText>{selectedTicker}</CmsText><CmsText>{"..."}</CmsText></div>
          ) : sentiment ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-white">
                    <CmsText>{sentiment.ticker}</CmsText>
                  </span>
                  <Badge
                    variant={
                      sentiment.sentiment === "BULLISH"
                        ? "emerald"
                        : sentiment.sentiment === "BEARISH"
                        ? "crimson"
                        : "amber"
                    }
                    dot
                  >
                    <CmsText>{sentiment.sentiment}</CmsText>
                  </Badge>
                  <span className="text-xs text-[#64748b]"><CmsText>{"Confiança: "}</CmsText><span className="text-white font-mono"><CmsText>{sentiment.confidence_score}</CmsText><CmsText>{"%"}</CmsText></span>
                  </span>
                </div>
                <div className="text-xs text-[#64748b]"><CmsText>{"Último doc: "}</CmsText><span className="text-[#94a3b8]"><CmsText>{sentiment.last_analyzed_doc || "Recente"}</CmsText></span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1"><CmsText>{"Resumo Executivo Neural"}</CmsText></h4>
                <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#0a0d14] p-3 rounded-lg border border-white/5">
                  <CmsText>{sentiment.executive_summary}</CmsText>
                </p>
              </div>

              {/* SWOT Matrix */}
              <CmsText>{sentiment.swot && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2"><CmsText>{"Matriz SWOT Sintetizada"}</CmsText></h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#00f5a0]/[0.03] border border-[#00f5a0]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#00f5a0] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" /><CmsText>{" Forças (Strengths)"}</CmsText></div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        <CmsText>{sentiment.swot.strengths.map((s, idx) => (
                          <li key={idx}><CmsText>{s}</CmsText></li>
                        ))}</CmsText>
                      </ul>
                    </div>

                    <div className="bg-[#ff3b69]/[0.03] border border-[#ff3b69]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#ff3b69] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b69]" /><CmsText>{" Fraquezas (Weaknesses)"}</CmsText></div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        <CmsText>{sentiment.swot.weaknesses.map((w, idx) => (
                          <li key={idx}><CmsText>{w}</CmsText></li>
                        ))}</CmsText>
                      </ul>
                    </div>

                    <div className="bg-[#00d9f5]/[0.03] border border-[#00d9f5]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#00d9f5] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d9f5]" /><CmsText>{" Oportunidades (Opportunities)"}</CmsText></div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        <CmsText>{sentiment.swot.opportunities.map((o, idx) => (
                          <li key={idx}><CmsText>{o}</CmsText></li>
                        ))}</CmsText>
                      </ul>
                    </div>

                    <div className="bg-[#f59e0b]/[0.03] border border-[#f59e0b]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#f59e0b] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /><CmsText>{" Ameaças (Threats)"}</CmsText></div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        <CmsText>{sentiment.swot.threats.map((t, idx) => (
                          <li key={idx}><CmsText>{t}</CmsText></li>
                        ))}</CmsText>
                      </ul>
                    </div>
                  </div>
                </div>
              )}</CmsText>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#64748b]"><CmsText>{"Nenhum dado de inteligência disponível no momento."}</CmsText></div>
          )}</CmsText>
        </div>
      </Card></CmsElement>

      {/* Real-time Document Stream */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-white tracking-tight"><CmsText>{"Feed em Tempo Real de Análises & Fatos Relevantes CVM"}</CmsText></h3>

        <CmsText>{loadingAlerts ? (
          <div className="space-y-3">
            <CmsText>{[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}</CmsText>
          </div>
        ) : alerts.length === 0 ? (
          <CmsElement feature="ui.app/-frontend-/radar-ia/page.Card.6"><Card>
            <div className="py-8 text-center text-xs text-[#64748b]"><CmsText>{"Nenhum fato relevante indexado recentemente no banco de dados."}</CmsText></div>
          </Card></CmsElement>
        ) : (
          alerts.map((a) => (
            <CmsElement feature="ui.app/-frontend-/radar-ia/page.Card.7" key={a.id}><Card
              key={a.id}
              glow={
                a.sentiment === "BULLISH"
                  ? "emerald"
                  : a.sentiment === "BEARISH"
                  ? "crimson"
                  : "cyan"
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <CmsElement feature="ui.app/-frontend-/radar-ia/page.Link.8"><Link
                    href={`/acoes/${a.ticker}`}
                    className="font-bold text-white font-mono text-sm hover:text-[#00f5a0] transition-colors"
                  >
                    <CmsText>{a.ticker}</CmsText>
                  </Link></CmsElement>
                  <Badge
                    variant={
                      a.sentiment === "BULLISH"
                        ? "emerald"
                        : a.sentiment === "BEARISH"
                        ? "crimson"
                        : "amber"
                    }
                    dot
                  >
                    <CmsText>{a.sentiment}</CmsText>
                  </Badge>
                  <span className="text-xs text-[#64748b]"><CmsText>{a.type}</CmsText></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748b] font-mono"><CmsText>{a.time}</CmsText></span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#94a3b8]"><CmsText>{"Score: "}</CmsText><CmsText>{a.score}</CmsText>
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-2"><CmsText>{a.title}</CmsText></h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed"><CmsText>{a.summary}</CmsText></p>
            </Card></CmsElement>
          ))
        )}</CmsText>
      </div>
    </div>
  );
}
