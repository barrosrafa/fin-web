"use client";

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
      <div className="container mx-auto px-4 py-16 text-center text-[#94a3b8]">
        Carregando artigo...
      </div>
    );
  }

  if (error) return <p role="alert">Não foi possível carregar o artigo. Tente novamente mais tarde.</p>;

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Artigo não encontrado</h1>
        <p className="text-sm text-[#94a3b8] mb-6">
          O artigo solicitado não está disponível ou foi movido.
        </p>
        <Link href="/artigos" className="text-cyan-400 hover:underline">
          ← Voltar para Artigos & Relatórios
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <nav aria-label="Navegação estrutural" className="text-xs text-[#64748b] flex items-center gap-2">
        <Link href="/" className="hover:text-[#94a3b8]">Início</Link>
        <span>/</span>
        <Link href="/artigos" className="hover:text-[#94a3b8]">Artigos</Link>
        <span>/</span>
        <span className="text-cyan-400 truncate max-w-xs">{article.titulo}</span>
      </nav>

      {/* Header */}
      <header className="border-b border-white/10 pb-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Badge variant={article.is_premium ? "amber" : "cyan"}>
            {article.is_premium ? "Exclusivo Pro" : article.categoria}
          </Badge>
          <span className="text-xs text-[#64748b] font-mono">
            {article.tempo_leitura_min} min de leitura
          </span>
          {article.publicado_em && (
            <span className="text-xs text-[#64748b]">
              • {article.publicado_em}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          {article.titulo}
        </h1>

        {article.subtitulo && (
          <p className="text-base sm:text-lg text-[#94a3b8] leading-relaxed">
            {article.subtitulo}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#cbd5e1] font-semibold">
            Por {article.autor_nome}
          </span>
          <div className="flex flex-wrap gap-1">
            {article.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-[#cbd5e1]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Body */}
      {article.is_premium ? (
        <PaywallGate isSubscriber={isSubscriber} featureName="Artigo Completo">
          <Card className="p-8 prose prose-invert max-w-none bg-[#0c1017] border-white/10 text-sm leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
            {article.conteudo_markdown}
          </Card>
        </PaywallGate>
      ) : (
        <Card className="p-8 prose prose-invert max-w-none bg-[#0c1017] border-white/10 text-sm leading-relaxed text-[#cbd5e1] whitespace-pre-wrap">
          {article.conteudo_markdown}
        </Card>
      )}

      {/* Footer Navigation */}
      <footer className="pt-6 border-t border-white/10 flex justify-between items-center">
        <Link href="/artigos" className="text-sm text-cyan-400 hover:underline">
          ← Voltar para Artigos & Análises
        </Link>
      </footer>
    </article>
  );
}

export default function ArtigoDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center text-[#94a3b8]">
          Carregando artigo...
        </div>
      }
    >
      <ArtigoDetailContent />
    </React.Suspense>
  );
}
