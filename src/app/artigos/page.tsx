"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getArticles, ArticleItem } from "@/lib/api";

export default function ArtigosPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getArticles(20);
        setArticles(data);
      } catch (err) {
        console.error("Failed to load articles:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-zinc-400">
        Carregando artigos e análises...
      </div>
    );
  }

  const fallbackArticles: ArticleItem[] = [
    {
      id: 1,
      slug: "como-analisar-bancos-margem-financeira-basileia",
      titulo: "Como Analisar Ações de Bancos na B3: Do ROE ao Índice de Basileia",
      subtitulo: "Entenda por que métricas tradicionais como Margem Bruta e EBITDA não funcionam para instituições financeiras.",
      autor_nome: "Equipe de Análise",
      categoria: "Setorial",
      tags: ["Bancos", "Valuation", "B3"],
      tempo_leitura_min: 7,
      is_premium: false,
      publicado_em: "2026-10-25",
    },
    {
      id: 2,
      slug: "metodo-bazin-preco-teto-dividendos",
      titulo: "Guia Definitivo do Método Bazin: Como Calcular o Preço Teto",
      subtitulo: "Aprenda a fórmula original de Décio Bazin para nunca mais pagar caro em ações pagadoras de dividendos.",
      autor_nome: "Equipe de Análise",
      categoria: "Dividendos",
      tags: ["Bazin", "Preço Teto", "Renda Passiva"],
      tempo_leitura_min: 6,
      is_premium: true,
      publicado_em: "2026-10-24",
    },
    {
      id: 3,
      slug: "fiis-de-papel-vs-tijolo-ciclo-de-juros",
      titulo: "FIIs de Papel vs. FIIs de Tijolo: O Que Esperar com a Taxa Selic",
      subtitulo: "A dinâmica de repasse da inflação em CRIs e o impacto do custo de oportunidade na precificação de galpões.",
      autor_nome: "Equipe de Análise",
      categoria: "Fundos Imobiliários",
      tags: ["FIIs", "Selic", "Imóveis"],
      tempo_leitura_min: 8,
      is_premium: false,
      publicado_em: "2026-10-22",
    },
  ];

  const displayList = articles.length > 0 ? articles : fallbackArticles;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">Conteúdo Educacional</span>
          <span className="text-xs text-[#64748b]">Estudos & Análises Setoriais</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Artigos & Relatórios de Mercado
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Análises macroeconômicas, guias de valuation, relatórios setoriais aprofundados e estratégias
          para acumulação de renda passiva com consistência.
        </p>
      </div>

      {/* Articles Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayList.map((art) => (
          <Card key={art.slug} className="p-6 flex flex-col justify-between gap-6 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant={art.is_premium ? "amber" : "cyan"}>
                  {art.is_premium ? "Exclusivo Pro" : art.categoria}
                </Badge>
                <span className="text-xs text-[#64748b] font-mono">{art.tempo_leitura_min} min de leitura</span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{art.titulo}</h3>
              {art.subtitulo && (
                <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-3 mb-4">
                  {art.subtitulo}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mb-2">
                {art.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-[#cbd5e1]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-[#64748b]">{art.publicado_em || "Recente"}</span>
              <Button variant="outline">Ler Artigo</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
