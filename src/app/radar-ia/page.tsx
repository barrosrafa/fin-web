"use client";

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
          title="Documentos CVM Ingeridos"
          value={loadingAlerts ? "Carregando..." : `${alerts.length} comunicados`}
          subtitle="Taxa de processamento: 1.2s / doc"
          glow="violet"
        />
        <MetricCard
          title="Sentimento Geral B3"
          value={loadingAlerts ? "Carregando..." : `${bullishPct}% Otimista`}
          subtitle={`${bullishCount} de ${alerts.length} comunicados com viés de alta`}
          glow="emerald"
        />
        <MetricCard
          title="Anomalias Críticas Detectadas"
          value={loadingAlerts ? "Carregando..." : `${criticalCount} alertas de atenção`}
          subtitle="Auditoria e monitoramento de passivos"
          glow={criticalCount > 0 ? "crimson" : "cyan"}
        />
      </div>

      {/* Deep Dive Ticker Intelligence */}
      <Card glow="violet">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Veredito do Comitê de IA por Ativo
              </h3>
              <p className="text-xs text-[#94a3b8]">
                Selecione uma empresa para inspecionar síntese de NLP, score de confiança e matriz SWOT.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FEATURED_TICKERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTicker(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                    selectedTicker === t
                      ? "bg-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-white/5 text-[#94a3b8] hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {loadingSentiment ? (
            <div className="py-8 text-center text-xs text-[#64748b] animate-pulse">
              Consultando modelo de inteligência para {selectedTicker}...
            </div>
          ) : sentiment ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-white">
                    {sentiment.ticker}
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
                    {sentiment.sentiment}
                  </Badge>
                  <span className="text-xs text-[#64748b]">
                    Confiança: <span className="text-white font-mono">{sentiment.confidence_score}%</span>
                  </span>
                </div>
                <div className="text-xs text-[#64748b]">
                  Último doc: <span className="text-[#94a3b8]">{sentiment.last_analyzed_doc || "Recente"}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-1">
                  Resumo Executivo Neural
                </h4>
                <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#0a0d14] p-3 rounded-lg border border-white/5">
                  {sentiment.executive_summary}
                </p>
              </div>

              {/* SWOT Matrix */}
              {sentiment.swot && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748b] mb-2">
                    Matriz SWOT Sintetizada
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-[#00f5a0]/[0.03] border border-[#00f5a0]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#00f5a0] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f5a0]" /> Forças (Strengths)
                      </div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        {sentiment.swot.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#ff3b69]/[0.03] border border-[#ff3b69]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#ff3b69] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3b69]" /> Fraquezas (Weaknesses)
                      </div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        {sentiment.swot.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#00d9f5]/[0.03] border border-[#00d9f5]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#00d9f5] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00d9f5]" /> Oportunidades (Opportunities)
                      </div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        {sentiment.swot.opportunities.map((o, idx) => (
                          <li key={idx}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#f59e0b]/[0.03] border border-[#f59e0b]/20 rounded-xl p-3">
                      <div className="text-xs font-bold text-[#f59e0b] uppercase mb-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Ameaças (Threats)
                      </div>
                      <ul className="text-[11px] text-[#94a3b8] space-y-1 list-disc list-inside">
                        {sentiment.swot.threats.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[#64748b]">
              Nenhum dado de inteligência disponível no momento.
            </div>
          )}
        </div>
      </Card>

      {/* Real-time Document Stream */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Feed em Tempo Real de Análises & Fatos Relevantes CVM
        </h3>

        {loadingAlerts ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-xs text-[#64748b]">
              Nenhum fato relevante indexado recentemente no banco de dados.
            </div>
          </Card>
        ) : (
          alerts.map((a) => (
            <Card
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
                  <Link
                    href={`/acoes/${a.ticker}`}
                    className="font-bold text-white font-mono text-sm hover:text-[#00f5a0] transition-colors"
                  >
                    {a.ticker}
                  </Link>
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
                    {a.sentiment}
                  </Badge>
                  <span className="text-xs text-[#64748b]">{a.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#64748b] font-mono">{a.time}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[#94a3b8]">
                    Score: {a.score}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-2">{a.title}</h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{a.summary}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
