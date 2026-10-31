"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { InfiniteScrollFooter } from "@/components/ui/InfiniteScrollFooter";
import { API_BASE } from "@/lib/api";

interface NewsFeedItem {
  id: string;
  ticker: string;
  empresa: string;
  titulo: string;
  tipo: "FATO_RELEVANTE" | "RESULTADO" | "COMUNICADO" | "PROVENTO" | "DIVIDENDO" | "MERCADO";
  sentimento: "POSITIVO" | "NEUTRO" | "NEGATIVO";
  data_hora: string;
  resumo: string;
  cvm_protocolo?: string | null;
  source_url?: string | null;
}

export default function NoticiasPage() {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [news, setNews] = useState<NewsFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchNewsBatch = useCallback(
    async (offset = 0, isInitial = false) => {
      try {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const catParam = filterType !== "ALL" ? `&category=${filterType}` : "";
        const tickerParam = search.trim() ? `&ticker=${encodeURIComponent(search.trim().toUpperCase())}` : "";
        const res = await fetch(`${API_BASE}/market/news?limit=30&offset=${offset}${catParam}${tickerParam}`);
        if (res.ok) {
          const data = await res.json();
          const items: NewsFeedItem[] = data.items || [];
          if (isInitial) {
            setNews(items);
          } else {
            setNews((prev) => [...prev, ...items]);
          }
          setHasMore(items.length >= 30);
        }
      } catch (err) {
        console.error("Erro ao carregar notícias oficiais:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filterType, search]
  );

  useEffect(() => {
    // A filter change invalidates the current page before its replacement request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNewsBatch(0, true);
  }, [fetchNewsBatch]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      fetchNewsBatch(news.length, false);
    }
  }, [loading, loadingMore, hasMore, news.length, fetchNewsBatch]);

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMore();
          }
        },
        { rootMargin: "250px" }
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [loadMore]
  );

  const filtered = news.filter((n) => {
    const matchesType =
      filterType === "ALL" ||
      n.tipo === filterType ||
      (filterType === "PROVENTO" && (n.tipo === "PROVENTO" || n.tipo === "DIVIDENDO"));
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
      case "PROVENTO":
      case "DIVIDENDO":
        return "emerald";
      case "RESULTADO":
        return "cyan";
      case "COMUNICADO":
        return "violet";
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
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-neon badge-neon-emerald"><CmsText>{"CVM & B3 Divulgações Oficiais"}</CmsText></span>
            <span className="text-xs text-[#64748b]"><CmsText>{"Fatos Relevantes • ITR/DFP • Proventos"}</CmsText></span>
            <span className="text-xs font-mono text-[#00f5a0] bg-[#00f5a0]/10 px-2 py-0.5 rounded-full border border-[#00f5a0]/20">
              <CmsText>{news.length}</CmsText><CmsText>{" Notícias Carregadas"}</CmsText></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Notícias Corporativas & Divulgações"}</CmsText></h1>
          <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Feed oficial auditado diretamente dos canais do Sistema Empresas.NET da CVM e B3. Sem ruído, sem manchetes manipuladas e com protocolo rastreável de autenticidade."}</CmsText></p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchNewsBatch(0, true)}><CmsText>{"Atualizar Feed"}</CmsText></Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <CmsElement feature="ui.app/-frontend-/noticias/page.Card.1"><Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CmsElement feature="ui.app/-frontend-/noticias/page.input.2"><input
            type="text"
            placeholder="Buscar por Ticker ou Assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full sm:w-64"
          /></CmsElement>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <CmsText>{[
            { id: "ALL", label: "Todos os Avisos" },
            { id: "FATO_RELEVANTE", label: "Fatos Relevantes" },
            { id: "RESULTADO", label: "Balanços (ITR/DFP)" },
            { id: "PROVENTO", label: "Proventos" },
            { id: "COMUNICADO", label: "Comunicados" },
          ].map((cat) => (
            <CmsElement feature="ui.app/-frontend-/noticias/page.button.3" key={cat.id}><button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterType === cat.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white"
              }`}
            >
              <CmsText>{cat.label}</CmsText>
            </button></CmsElement>
          ))}</CmsText>
        </div>
      </Card></CmsElement>

      {/* News Feed List */}
      <div className="flex flex-col gap-4">
        <CmsText>{loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
            <span className="text-xs text-[#94a3b8]"><CmsText>{"Carregando documentos regulatórios..."}</CmsText></span>
          </div>
        ) : filtered.length === 0 ? (
          <CmsElement feature="ui.app/-frontend-/noticias/page.Card.4"><Card className="p-8 text-center text-[#64748b]"><CmsText>{"Nenhuma divulgação oficial encontrada para os filtros selecionados."}</CmsText></Card></CmsElement>
        ) : (
          filtered.map((item) => (
            <CmsElement feature="ui.app/-frontend-/noticias/page.Card.5" key={item.id}><Card
              key={item.id}
              className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 border border-white/10 hover:border-white/20 transition-all bg-[#0f172a]/40"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-cyan-400"><CmsText>{item.ticker}</CmsText></span>
                  <span className="text-xs text-white font-semibold"><CmsText>{item.empresa}</CmsText></span>
                  <Badge variant={getBadgeVariant(item.tipo)} className="text-[10px]">
                    <CmsText>{item.tipo.replace("_", " ")}</CmsText>
                  </Badge>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getSentimentColor(
                      item.sentimento
                    )}`}
                  >
                    <CmsText>{item.sentimento}</CmsText>
                  </span>
                  <span className="text-[11px] text-[#64748b] font-mono ml-auto">
                    <CmsText>{item.data_hora}</CmsText>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug"><CmsText>{item.titulo}</CmsText></h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-3"><CmsText>{item.resumo}</CmsText></p>

                <CmsText>{item.cvm_protocolo && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-[#64748b] font-mono">
                    <span><CmsText>{"Protocolo CVM:"}</CmsText></span>
                    <span className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      <CmsText>{item.cvm_protocolo}</CmsText>
                    </span>
                  </div>
                )}</CmsText>
              </div>

              <CmsText>{item.source_url && (
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  <CmsElement feature="ui.app/-frontend-/noticias/page.a.6"><a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
                  ><CmsText>{"Documento Original ↗"}</CmsText></a></CmsElement>
                </div>
              )}</CmsText>
            </Card></CmsElement>
          ))
        )}</CmsText>

        <InfiniteScrollFooter
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          count={filtered.length}
          total={filtered.length}
          sentinelRef={sentinelRef}
          onLoadMore={loadMore}
          entityName="notícias"
          emptyMessage="Nenhuma notícia encontrada."
        />
      </div>
    </div>
  );
}
