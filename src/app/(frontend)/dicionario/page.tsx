"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getEditorialGlossary, GlossaryItem, EditorialMeta } from "@/lib/api";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function DicionarioPage() {
  const [terms, setTerms] = useState<GlossaryItem[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [meta, setMeta] = useState<EditorialMeta | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const content = await getEditorialGlossary();
        setMeta(content.meta);
        setTerms(content.data.filter((term) => (!selectedLetter || term.letra_inicial === selectedLetter) &&
          (!search || term.termo.toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR")))));
      } catch (err) {
        console.error("Failed to load glossary:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedLetter, search]);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Enciclopédia Financeira"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Glossário de A a Z"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Dicionário do Investidor"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Aprenda o significado exato de termos técnicos, fórmulas contábeis, múltiplos de valuation e jargões do mercado financeiro e de capitais."}</CmsText></p>
      </div>

      {/* Alphabet Selector & Search Bar */}
      <CmsElement feature="ui.app/-frontend-/dicionario/page.Card.1"><Card className="flex flex-col gap-4 p-4">
        <CmsElement feature="ui.app/-frontend-/dicionario/page.input.2"><input
          type="text"
          placeholder="Buscar por termo (ex: Graham, P/L, FFO, Magic Number)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full"
        /></CmsElement>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <CmsElement feature="ui.app/-frontend-/dicionario/page.button.3"><button
            onClick={() => setSelectedLetter(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedLetter === null
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white"
            }`}
          ><CmsText>{"Todos"}</CmsText></button></CmsElement>
          <CmsText>{ALPHABET.map((l) => (
            <CmsElement feature="ui.app/-frontend-/dicionario/page.button.4" key={l}><button
              key={l}
              onClick={() => setSelectedLetter(selectedLetter === l ? null : l)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                selectedLetter === l
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white"
              }`}
            >
              <CmsText>{l}</CmsText>
            </button></CmsElement>
          ))}</CmsText>
        </div>
      </Card></CmsElement>

      <CmsText>{error && <p role="alert"><CmsText>{"Não foi possível carregar o dicionário. Tente novamente mais tarde."}</CmsText></p>}</CmsText>
      <CmsText>{meta?.stale && <p role="status"><CmsText>{"Conteúdo salvo, temporariamente desatualizado. Publicação: "}</CmsText><CmsText>{meta.as_of || "data não informada"}</CmsText><CmsText>{"."}</CmsText></p>}</CmsText>
      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CmsText>{loading ? (
          <div className="col-span-2 py-12 text-center text-[#64748b]"><CmsText>{"Carregando termos..."}</CmsText></div>
        ) : error ? null : terms.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-[#64748b]"><CmsText>{"Nenhum termo encontrado."}</CmsText></div>
        ) : (
          terms.map((term) => (
            <CmsElement feature="ui.app/-frontend-/dicionario/page.Link.5" key={term.slug}><Link key={term.slug} href={`/dicionario/${term.slug}`} className="block">
              <CmsElement feature="ui.app/-frontend-/dicionario/page.Card.6"><Card className="p-6 h-full flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold"><CmsText>{"Letra "}</CmsText><CmsText>{term.letra_inicial}</CmsText>
                    </span>
                    <Badge variant="cyan"><CmsText>{term.categoria}</CmsText></Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2"><CmsText>{term.termo}</CmsText></h3>
                  <p className="text-sm text-[#94a3b8] line-clamp-3"><CmsText>{term.definicao_curta}</CmsText></p>
                </div>
                <CmsText>{term.formula_latex && (
                  <div className="mt-4 pt-3 border-t border-white/5 font-mono text-xs text-emerald-400/90"><CmsText>{"Fórmula: "}</CmsText><code className="bg-black/30 px-2 py-0.5 rounded"><CmsText>{term.formula_latex}</CmsText></code>
                  </div>
                )}</CmsText>
              </Card></CmsElement>
            </Link></CmsElement>
          ))
        )}</CmsText>
      </div>
    </div>
  );
}
