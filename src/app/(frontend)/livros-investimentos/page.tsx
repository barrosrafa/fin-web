"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getBooks, BookItem } from "@/lib/api";

export default function LivrosInvestimentosPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-amber">Literatura Financeira</span>
          <span className="text-xs text-[#64748b]">Biblioteca Curada</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Livros de Investimentos Recomendados
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          Seleção rigorosa de clássicos de Valuation, Value Investing, Finanças Comportamentais e
          Gestão de Risco para acelerar sua formação como investidor.
        </p>
      </div>

      {/* Books List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-[#64748b]">Carregando livros...</div>
        ) : (
          books.map((book) => (
            <Card key={book.slug} className="p-6 flex flex-col justify-between gap-6 border border-white/10 hover:border-amber-500/30 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge
                    variant={
                      book.nivel_dificuldade === "INICIANTE"
                        ? "emerald"
                        : book.nivel_dificuldade === "INTERMEDIARIO"
                        ? "cyan"
                        : "amber"
                    }
                  >
                    {book.nivel_dificuldade}
                  </Badge>
                  <div className="text-amber-400 font-mono text-xs font-bold">
                    ★ {book.avaliacao_media.toFixed(2)}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{book.titulo}</h3>
                {book.subtitulo && (
                  <p className="text-xs text-cyan-400/80 mb-2">{book.subtitulo}</p>
                )}
                <span className="text-xs text-[#94a3b8] block mb-3 font-semibold">
                  Por {book.autor} {book.ano_publicacao ? `(${book.ano_publicacao})` : ""}
                </span>

                <p className="text-xs text-[#cbd5e1] leading-relaxed mb-4 line-clamp-4">
                  {book.resenha_markdown}
                </p>

                {book.principais_licoes.length > 0 && (
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                      Principais Lições:
                    </span>
                    <ul className="space-y-1 text-xs text-[#94a3b8]">
                      {book.principais_licoes.slice(0, 2).map((licao, idx) => (
                        <li key={idx} className="line-clamp-2">
                          • {licao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button variant="outline" className="w-full">
                  Ver Fichamento Completo
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
