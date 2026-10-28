"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

  const mockNews: NewsFeedItem[] = [
    {
      id: "1",
      ticker: "PETR4",
      empresa: "Petróleo Brasileiro S.A.",
      titulo: "Petrobras aprova pagamento de dividendos e JCP complementares no valor de R$ 13,4 bilhões",
      tipo: "DIVIDENDO",
      sentimento: "POSITIVO",
      data_hora: "Hoje às 18:42",
      resumo: "Conselho de Administração deliberou favoravelmente à distribuição de remuneração aos acionistas com data de corte prevista para o encerramento do pregão da próxima semana.",
      cvm_protocolo: "FNET-098231/2026",
    },
    {
      id: "2",
      ticker: "VALE3",
      empresa: "Vale S.A.",
      titulo: "Relatório de Produção e Vendas do 3T26: Produção de minério de ferro atinge 87 milhões de toneladas",
      tipo: "RESULTADO",
      sentimento: "NEUTRO",
      data_hora: "Hoje às 17:15",
      resumo: "Desempenho operacional em linha com o guidance anual com incremento de prêmio de qualidade no complexo de Carajás.",
      cvm_protocolo: "CVM-RAD-44120/2026",
    },
    {
      id: "3",
      ticker: "HGLG11",
      empresa: "CSHG Logística FII",
      titulo: "Fato Relevante: Aquisição de novo galpão logístico Triple A em Cajamar/SP com cap rate de 9,2%",
      tipo: "FATO_RELEVANTE",
      sentimento: "POSITIVO",
      data_hora: "Ontem às 19:30",
      resumo: "Gestão comunica a assinatura de escritura definitiva para aquisição de imóvel totalmente locado com contratos atípicos de longo prazo.",
      cvm_protocolo: "FNET-097541/2026",
    },
    {
      id: "4",
      ticker: "ITUB4",
      empresa: "Itaú Unibanco Holding S.A.",
      titulo: "Itaú anuncia cronograma de pagamentos de proventos para o primeiro semestre de 2027",
      tipo: "DIVIDENDO",
      sentimento: "POSITIVO",
      data_hora: "Ontem às 14:10",
      resumo: "Fixação das datas habituais de corte e pagamento mensal de JCP aos detentores de ações ordinárias e preferenciais.",
      cvm_protocolo: "CVM-RAD-43990/2026",
    },
  ];

  const filtered = mockNews.filter((n) => {
    const matchesSearch =
      n.ticker.toLowerCase().includes(search.toLowerCase()) ||
      n.titulo.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || n.tipo === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald">Tempo Real</span>
            <span className="text-xs text-[#64748b]">CVM, FNET & B3</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Notícias & Fatos Relevantes
          </h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
            Acompanhe comunicados ao mercado oficiais protocolados na CVM com análise de sentimento
            automatizada por Inteligência Artificial e impacto nos proventos.
          </p>
        </div>

        <input
          type="text"
          placeholder="Buscar notícias por Ticker ou termo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
        />
      </div>

      {/* Filter Tabs */}
      <Card className="flex items-center gap-2 p-3 overflow-x-auto">
        {(["ALL", "DIVIDENDO", "RESULTADO", "FATO_RELEVANTE"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === tab
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white"
            }`}
          >
            {tab === "ALL"
              ? "Todas as Notícias"
              : tab === "FATO_RELEVANTE"
              ? "Fatos Relevantes"
              : tab === "DIVIDENDO"
              ? "Proventos"
              : "Resultados"}
          </button>
        ))}
      </Card>

      {/* News Feed Timeline */}
      <div className="flex flex-col gap-4">
        {filtered.map((news) => (
          <Card key={news.id} className="p-6 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-400 font-bold text-sm bg-cyan-500/10 px-2 py-0.5 rounded">
                  {news.ticker}
                </span>
                <span className="text-xs text-[#94a3b8] font-medium">{news.empresa}</span>
                <Badge
                  variant={
                    news.sentimento === "POSITIVO"
                      ? "emerald"
                      : news.sentimento === "NEGATIVO"
                      ? "amber"
                      : "cyan"
                  }
                >
                  {news.sentimento}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#64748b] font-mono">
                {news.cvm_protocolo && <span>Protocolo: {news.cvm_protocolo}</span>}
                <span>•</span>
                <span>{news.data_hora}</span>
              </div>
            </div>

            <h3 className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer transition-colors">
              {news.titulo}
            </h3>

            <p className="text-xs text-[#cbd5e1] leading-relaxed">{news.resumo}</p>

            <div className="pt-2 flex justify-end">
              <Button variant="outline">Ver Documento Oficial CVM</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
