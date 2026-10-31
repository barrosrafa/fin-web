"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PaywallGate } from "@/components/auth/PaywallGate";
import { getEditorialArticles, ArticleDetail, getCurrentUser } from "@/lib/api";

function ArtigoDetailContent() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isSubscriber, setIsSubscriber] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setIsSubscriber(user?.tier === "PRO" || user?.tier === "ENTERPRISE");

        const content = await getEditorialArticles();
        setArticle(content.data.find((row) => row.slug === slug) || null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      load();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-[#94a3b8]"><CmsText>{"Carregando artigo..."}</CmsText></div>
    );
  }

  if (error) return <p role="alert"><CmsText>{"Não foi possível carregar o artigo. Tente novamente mais tarde."}</CmsText></p>;

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4"><CmsText>{"Artigo não encontrado"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mb-6"><CmsText>{"O artigo solicitado não está disponível ou foi movido."}</CmsText></p>
        <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.Link.1"><Link href="/artigos" className="text-cyan-400 hover:underline"><CmsText>{"← Voltar para Artigos & Relatórios"}</CmsText></Link></CmsElement>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.nav.2"><nav aria-label="Navegação estrutural" className="text-xs text-[#64748b] flex items-center gap-2">
        <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.Link.3"><Link href="/" className="hover:text-[#94a3b8]"><CmsText>{"Início"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.Link.4"><Link href="/artigos" className="hover:text-[#94a3b8]"><CmsText>{"Artigos"}</CmsText></Link></CmsElement>
        <span><CmsText>{"/"}</CmsText></span>
        <span className="text-cyan-400 truncate max-w-xs"><CmsText>{article.titulo}</CmsText></span>
      </nav></CmsElement>

      {/* Header */}
      <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.header.5"><header className="border-b border-white/10 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge variant={article.is_premium ? "amber" : "cyan"}>
            <CmsText>{article.is_premium ? "Exclusivo Pro" : article.categoria}</CmsText>
          </Badge>
          <span className="text-xs text-[#64748b] font-mono">
            <CmsText>{article.tempo_leitura_min}</CmsText><CmsText>{" min de leitura"}</CmsText></span>
          <CmsText>{article.publicado_em && (
            <span className="text-xs text-[#64748b]"><CmsText>{"• "}</CmsText><CmsText>{article.publicado_em}</CmsText>
            </span>
          )}</CmsText>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          <CmsText>{article.titulo}</CmsText>
        </h1>

        <CmsText>{article.subtitulo && (
          <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed">
            <CmsText>{article.subtitulo}</CmsText>
          </p>
        )}</CmsText>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#cbd5e1] font-semibold"><CmsText>{"Por "}</CmsText><CmsText>{article.autor_nome}</CmsText>
          </span>
          <div className="flex flex-wrap gap-1">
            <CmsText>{article.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-[#cbd5e1]"><CmsText>{"#"}</CmsText><CmsText>{tag}</CmsText>
              </span>
            ))}</CmsText>
          </div>
        </div>
      </header></CmsElement>

      {/* Body */}
      <CmsText>{article.is_premium ? (
        <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.PaywallGate.6"><PaywallGate isSubscriber={isSubscriber} featureName="Artigo Completo">
          <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.Card.7"><Card className="p-8 prose prose-invert max-w-none bg-[#0c1017] border-white/10 text-sm leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
            <CmsText>{article.conteudo_markdown}</CmsText>
          </Card></CmsElement>
        </PaywallGate></CmsElement>
      ) : (
        <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.Card.8"><Card className="p-8 prose prose-invert max-w-none bg-[#0c1017] border-white/10 text-sm leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
          <CmsText>{article.conteudo_markdown}</CmsText>
        </Card></CmsElement>
      )}</CmsText>

      {/* Footer Navigation */}
      <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.footer.9"><footer className="pt-6 border-t border-white/10 flex justify-between items-center">
        <CmsElement feature="ui.app/-frontend-/artigos/-slug-/page.Link.10"><Link href="/artigos" className="text-sm text-cyan-400 hover:underline"><CmsText>{"← Voltar para Artigos & Análises"}</CmsText></Link></CmsElement>
      </footer></CmsElement>
    </article>
  );
}

export default function ArtigoDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-[#94a3b8]"><CmsText>{"Carregando artigo..."}</CmsText></div>
      }
    >
      <ArtigoDetailContent />
    </React.Suspense>
  );
}
