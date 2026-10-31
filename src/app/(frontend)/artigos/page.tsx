"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getEditorialArticles, ArticleItem, EditorialMeta } from "@/lib/api";

export default function ArtigosPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState<EditorialMeta | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const content = await getEditorialArticles();
        setArticles(content.data);
        setMeta(content.meta);
      } catch (err) {
        console.error("Failed to load articles:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center text-zinc-400"><CmsText>{"Carregando artigos e análises..."}</CmsText></div>
    );
  }

  const displayList = articles;

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Conteúdo Educacional"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Estudos & Análises Setoriais"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Artigos & Relatórios de Mercado"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Análises macroeconômicas, guias de valuation, relatórios setoriais aprofundados e estratégias para acumulação de renda passiva com consistência."}</CmsText></p>
      </div>

      <CmsText>{error && <p role="alert"><CmsText>{"Não foi possível carregar os artigos. Tente novamente mais tarde."}</CmsText></p>}</CmsText>
      <CmsText>{meta?.stale && <p role="status"><CmsText>{"Conteúdo salvo, temporariamente desatualizado. Publicação: "}</CmsText><CmsText>{meta.as_of || "data não informada"}</CmsText><CmsText>{"."}</CmsText></p>}</CmsText>
      <CmsText>{!error && articles.length === 0 && <p><CmsText>{"Nenhum artigo publicado."}</CmsText></p>}</CmsText>
      {/* Articles Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CmsText>{displayList.map((art) => (
          <CmsElement feature="ui.app/-frontend-/artigos/page.Card.1" key={art.slug}><Card key={art.slug} className="p-6 flex flex-col justify-between gap-6 border border-white/10 hover:border-cyan-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant={art.is_premium ? "amber" : "cyan"}>
                  <CmsText>{art.is_premium ? "Exclusivo Pro" : art.categoria}</CmsText>
                </Badge>
                <span className="text-xs text-[#64748b] font-mono"><CmsText>{art.tempo_leitura_min}</CmsText><CmsText>{" min de leitura"}</CmsText></span>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-2"><CmsText>{art.titulo}</CmsText></h3>
              <CmsText>{art.subtitulo && (
                <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-3 mb-4">
                  <CmsText>{art.subtitulo}</CmsText>
                </p>
              )}</CmsText>

              <div className="flex flex-wrap gap-1 mb-2">
                <CmsText>{art.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-[#cbd5e1]"><CmsText>{"#"}</CmsText><CmsText>{tag}</CmsText>
                  </span>
                ))}</CmsText>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-[#64748b]"><CmsText>{art.publicado_em || "Recente"}</CmsText></span>
              <CmsElement feature="ui.app/-frontend-/artigos/page.Link.2"><Link href={`/artigos/${art.slug}`}>
                <Button variant="outline"><CmsText>{"Ler Artigo"}</CmsText></Button>
              </Link></CmsElement>
            </div>
          </Card></CmsElement>
        ))}</CmsText>
      </div>
    </div>
  );
}
