"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { API_BASE } from "@/lib/api";

interface NewsFeedItem {
  id: string;
  ticker: string;
  empresa: string;
  titulo: string;
  tipo: "FATO_RELEVANTE" | "RESULTADO" | "DIVIDENDO" | "MERCADO";
  sentimento: "POSITIVO" | "NEUTRO" | "NEGATIVO";
  data_hora: string;
  resumo: string;
  cvm_protocolo?: string;
}


export default function NoticiasPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [news, setNews] = useState<NewsFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/market/news?limit=30`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.items || []);
        }
      } catch (err) {
        console.error("Erro ao carregar notícias oficiais:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  const filtered = news.filter((n) => {
    const matchesType = filterType === "ALL" || n.tipo === filterType;
    const matchesSearch =
      n.ticker.toLowerCase().includes(search.toLowerCase()) ||
      n.empresa.toLowerCase().includes(search.toLowerCase()) ||
      n.titulo.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getBadgeVariant = (tipo: NewsFeedItem["tipo"]) => {
    switch (tipo) {
      case "FATO_RELEVANTE":
        return "crimson";
      case "DIVIDENDO":
        return "emerald";
      case "RESULTADO":
        return "cyan";
      default:
        return "neutral";
    }
  };

  const getSentimentColor = (sentimento: NewsFeedItem["sentimento"]) => {
    switch (sentimento) {
      case "POSITIVO":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "NEGATIVO":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-slate-400 bg-slate-800/40 border-slate-700/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              Feed Oficial CVM / B3 em Tempo Real
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Fatos Relevantes & Comunicados
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Acompanhe comunicados, distribuições de proventos e demonstrações financeiras sincronizados diretamente com os órgãos reguladores.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === "ALL" ? "primary" : "outline"}
              
              onClick={() => setFilterType("ALL")}
            >
              Todos ({news.length})
            </Button>
            <Button
              variant={filterType === "DIVIDENDO" ? "primary" : "outline"}
              
              onClick={() => setFilterType("DIVIDENDO")}
            >
              Dividendos & JCP
            </Button>
            <Button
              variant={filterType === "RESULTADO" ? "primary" : "outline"}
              
              onClick={() => setFilterType("RESULTADO")}
            >
              Resultados DRE
            </Button>
            <Button
              variant={filterType === "FATO_RELEVANTE" ? "primary" : "outline"}
              
              onClick={() => setFilterType("FATO_RELEVANTE")}
            >
              Fatos Relevantes
            </Button>
          </div>

          <div className="w-full sm:w-64">
            <input
              id="noticias-search"
              name="search"
              aria-label="Buscar comunicados por ticker ou termo"
              type="text"
              placeholder="Buscar por ticker ou termo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* News Feed List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mb-4"></div>
            <p>Carregando comunicados oficiais da B3 e CVM...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-xl border border-slate-800 text-slate-400">
            Nenhum comunicado encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="bg-slate-900/40 hover:bg-slate-900/70 border-slate-800 transition-colors p-5 rounded-xl flex flex-col md:flex-row gap-5 items-start justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {item.ticker}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.empresa}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{item.data_hora}</span>
                    <Badge variant={getBadgeVariant(item.tipo)} className="text-[10px] tracking-wide uppercase">
                      {item.tipo.replace("_", " ")}
                    </Badge>
                  </div>

                  <h2 className="text-base font-semibold text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors">
                    {item.titulo}
                  </h2>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {item.resumo}
                  </p>

                  {item.cvm_protocolo && (
                    <div className="pt-1 flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>Protocolo: {item.cvm_protocolo}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 self-stretch md:self-auto border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                  <div
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getSentimentColor(
                      item.sentimento
                    )}`}
                  >
                    Impacto {item.sentimento}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
