"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PaywallGate } from "@/components/auth/PaywallGate";
import { getArticleBySlug, ArticleDetail, getCurrentUser } from "@/lib/api";

const FALLBACK_ARTICLES: Record<string, ArticleDetail> = {
  "como-analisar-bancos-margem-financeira-basileia": {
    id: 1,
    slug: "como-analisar-bancos-margem-financeira-basileia",
    titulo: "Como Analisar Ações de Bancos na B3: Do ROE ao Índice de Basileia",
    subtitulo: "Entenda por que métricas tradicionais como Margem Bruta e EBITDA não funcionam para instituições financeiras.",
    autor_nome: "Equipe de Análise Quantitativa",
    categoria: "Setorial",
    tags: ["Bancos", "Valuation", "B3"],
    tempo_leitura_min: 7,
    is_premium: false,
    publicado_em: "2026-10-25",
    conteudo_markdown: `
## A Natureza Diferenciada do Balanço Bancário

Instituições financeiras operam com intermediação de crédito e alavancagem regulatória. Enquanto em indústrias de bens de consumo analisamos EBITDA e Dívida Líquida/EBITDA, no setor bancário a dívida (depósitos à vista e a prazo) é a matéria-prima da operação.

### 1. Margem Financeira Líquida (NIM - Net Interest Margin)
O NIM mede a eficiência com que o banco capta recursos (funding) e os empresta aos tomadores de crédito a taxas superiores, descontando o custo de inadimplência (PDD - Provisão para Devedores Duvidosos).

### 2. Índice de Basileia
Exigido pelos Acordos de Basileia e regulamentado pelo Banco Central do Brasil (BACEN), o índice mede a relação entre o Capital Regulatório (Patrimônio de Referência Nível 1 e 2) e os Ativos Ponderados pelo Risco (RWA). No Brasil, o mínimo exigido costuma ser de 10,5% a 11,0%.

### 3. ROE e Eficiência Operacional
O Retorno sobre o Patrimônio Líquido (ROE) sustentável acima do custo de capital próprio (Ke) é o principal motor de criação de valor no longo prazo para acionistas de grandes bancos brasileiros.
`,
  },
  "metodo-bazin-preco-teto-dividendos": {
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
    conteudo_markdown: `
## O Princípio Fundamental do Método Bazin

Em sua obra clássica "Faça Fortuna com Ações", Décio Bazin estabeleceu um critério quantitativo simples e rigoroso para selecionar empresas pagadoras de dividendos.

### A Fórmula do Preço Teto
$$\\text{Preço Teto} = \\frac{\\text{Dividendo Médio dos Últimos 3 Anos}}{0{,}06}$$

O divisor 6% representa o yield mínimo exigido por Bazin, ancorado no rendimento histórico real da caderneta de poupança com segurança superior.

### Critérios de Exclusão de Risco
1. **Endividamento Moderado**: Relação Dívida Líquida / Patrimônio Líquido sob controle.
2. **Liquidez**: Volume médio diário negociado que permita montagem e desmontagem de posição sem ágio.
3. **Notícias e Governança**: Descarte imediato de empresas envolvidas em escândalos corporativos recorrentes.
`,
  },
  "fiis-de-papel-vs-tijolo-ciclo-de-juros": {
    id: 3,
    slug: "fiis-de-papel-vs-tijolo-ciclo-de-juros",
    titulo: "FIIs de Papel vs. FIIs de Tijolo: O Que Esperar com a Taxa Selic",
    subtitulo: "A dinâmica de repasse da inflação em CRIs e o impacto do custo de oportunidade na precificação de galpões.",
    autor_nome: "Equipe de Análise Imobiliária",
    categoria: "Fundos Imobiliários",
    tags: ["FIIs", "Selic", "Imóveis"],
    tempo_leitura_min: 8,
    is_premium: false,
    publicado_em: "2026-10-22",
    conteudo_markdown: `
## Como os Ciclos Monetários Afetam os FIIs

A precificação de cotas no mercado secundário da B3 e o fluxo de proventos mensais reagem de maneiras opostas nos segmentos de Papel (CRI) e Tijolo (Galpões, Lajes, Shoppings).

### Fundos de Recebíveis Imobiliários (CRIs)
Fundos indexados ao IPCA repassam a variação da inflação mensal com defasagem de 1 a 2 meses na parcela de correção monetária. Fundos atrelados ao CDI têm distribuição nominal mais elevada em períodos de política monetária restritiva.

### Fundos de Tijolo
Sofrem compressão de múltiplos (P/VP abaixo de 1,00) em ciclos de alta de juros devido à elevação da taxa de desconto das NTN-Bs longas, gerando janelas históricas de oportunidade de entrada para investidores de longo prazo.
`,
  },
};

function ArtigoDetailContent() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        setIsSubscriber(user?.tier === "PRO" || user?.tier === "ENTERPRISE");

        const data = await getArticleBySlug(slug);
        if (data) {
          setArticle(data);
        } else if (FALLBACK_ARTICLES[slug]) {
          setArticle(FALLBACK_ARTICLES[slug]);
        }
      } catch {
        if (FALLBACK_ARTICLES[slug]) {
          setArticle(FALLBACK_ARTICLES[slug]);
        }
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
