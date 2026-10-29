import React from "react";
import Link from "next/link";
import { Badge } from "./Badge";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#060709] mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                FIN<span className="text-[#00d9f5]">·WEB</span>
              </span>
              <Badge variant="emerald" dot>
                Plataforma analítica
              </Badge>
            </div>
            <p className="text-xs text-[#94a3b8] max-w-md">
              Plataforma institucional de inteligência de mercado financeiro, análise quantitativa e valuation integrado de ativos B3 e globais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94a3b8]">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
              <span>Latência indisponível</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00d9f5]" />
              <span>Sincronização sob consulta</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              <span>Análises sob consulta</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Mercados B3 & Globais
            </span>
            <Link href="/acoes" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Ações & Companhias B3
            </Link>
            <Link href="/fiis" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Fundos Imobiliários (FIIs)
            </Link>
            <Link href="/stocks" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors">
              Stocks EUA (NYSE / NASDAQ)
            </Link>
            <Link href="/reits" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors">
              REITs Imobiliários Globais
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Proventos & Renda
            </span>
            <Link href="/agenda-dividendos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Agenda de Dividendos & JCP
            </Link>
            <Link href="/mapa-de-dividendos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Mapa de Sazonalidade 12M
            </Link>
            <Link href="/simulador-de-dividendos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Simulador de Renda Passiva
            </Link>
            <Link href="/perfil-de-investidor" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Suitability & Perfil CVM
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Educação & Conteúdo
            </span>
            <Link href="/dicionario" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Dicionário do Investidor (A-Z)
            </Link>
            <Link href="/livros-investimentos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Biblioteca de Livros Recomendados
            </Link>
            <Link href="/artigos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Artigos & Análises Setoriais
            </Link>
            <Link href="/noticias" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Notícias & Fatos Relevantes CVM
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Ferramentas & Plataformas
            </span>
            <Link href="/simulador-de-portfolios" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Simulador de Portfólios
            </Link>
            <Link href="/rankings" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Rankings dos Melhores Ativos
            </Link>
            <Link href="/comparador" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Comparador Head-to-Head
            </Link>
            <Link href="/corretoras" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Comparador de Corretoras
            </Link>
            <Link href="/screener" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Super Screener Multiativo
            </Link>
            <Link href="/carteira" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors">
              Minha Carteira Consolidada
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Institucional & Legal
            </span>
            <Link href="/premium" className="text-[var(--positive)] font-bold hover:underline transition-colors">
              Planos Premium Pro
            </Link>
            <Link href="/quem-somos" className="text-[#94a3b8] hover:text-white transition-colors">
              Quem Somos & Metodologia
            </Link>
            <Link href="/mapa-do-site" className="text-[#94a3b8] hover:text-white transition-colors">
              Mapa do Site
            </Link>
            <Link href="/contato" className="text-[#94a3b8] hover:text-white transition-colors">
              Fale Conosco / Suporte
            </Link>
            <Link href="/termos-de-uso" className="text-[#94a3b8] hover:text-white transition-colors">
              Termos de Uso
            </Link>
            <Link href="/politica-de-privacidade" className="text-[#94a3b8] hover:text-white transition-colors">
              Privacidade & LGPD
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#94a3b8]">
          <p>
            © 2026 FIN Platform. Todas as informações exibidas têm caráter exclusivamente educacional e analítico.
          </p>
          <p className="font-mono">
            Next.js 16 • React 19 • Zod • Neon TimescaleDB • Pure CSS Layout
          </p>
        </div>
      </div>
    </footer>
  );
}
