"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getGlossary, GlossaryItem } from "@/lib/api";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function DicionarioPage() {
  const [terms, setTerms] = useState<GlossaryItem[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getGlossary(selectedLetter || undefined, search || undefined);
        setTerms(data);
      } catch (err) {
        console.error("Failed to load glossary:", err);
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
          <span className="badge-neon badge-neon-cyan">Enciclopédia Financeira</span>
          <span className="text-xs text-[#64748b]">Glossário de A a Z</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Dicionário do Investidor
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Aprenda o significado exato de termos técnicos, fórmulas contábeis, múltiplos de valuation e
          jargões do mercado financeiro e de capitais.
        </p>
      </div>

      {/* Alphabet Selector & Search Bar */}
      <Card className="flex flex-col gap-4 p-4">
        <input
          type="text"
          placeholder="Buscar por termo (ex: Graham, P/L, FFO, Magic Number)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500 w-full"
        />

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedLetter === null
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white"
            }`}
          >
            Todos
          </button>
          {ALPHABET.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLetter(selectedLetter === l ? null : l)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                selectedLetter === l
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-[#94a3b8] hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </Card>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center text-[#64748b]">Carregando termos...</div>
        ) : terms.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-[#64748b]">Nenhum termo encontrado.</div>
        ) : (
          terms.map((term) => (
            <Link key={term.slug} href={`/dicionario/${term.slug}`} className="block">
              <Card className="p-6 h-full flex flex-col justify-between border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold">
                      Letra {term.letra_inicial}
                    </span>
                    <Badge variant="cyan">{term.categoria}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{term.termo}</h3>
                  <p className="text-sm text-[#94a3b8] line-clamp-3">{term.definicao_curta}</p>
                </div>
                {term.formula_latex && (
                  <div className="mt-4 pt-3 border-t border-white/5 font-mono text-xs text-emerald-400/90">
                    Fórmula: <code className="bg-black/30 px-2 py-0.5 rounded">{term.formula_latex}</code>
                  </div>
                )}
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
