
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import Link from "next/link";
import { Badge } from "./Badge";

export function Footer() {
  return (
    <CmsElement feature="ui.components/ui/Footer.footer.1"><footer className="w-full border-t border-white/5 bg-[#060709] mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight"><CmsText>{"FIN"}</CmsText><span className="text-[#00d9f5]"><CmsText>{"·WEB"}</CmsText></span>
              </span>
              <Badge variant="emerald" dot><CmsText>{"Plataforma analítica"}</CmsText></Badge>
            </div>
            <p className="text-xs text-[#94a3b8] max-w-md"><CmsText>{"Plataforma institucional de inteligência de mercado financeiro, análise quantitativa e valuation integrado de ativos B3 e globais."}</CmsText></p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94a3b8]">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
              <span><CmsText>{"Latência indisponível"}</CmsText></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00d9f5]" />
              <span><CmsText>{"Sincronização sob consulta"}</CmsText></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              <span><CmsText>{"Análises sob consulta"}</CmsText></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]"><CmsText>{"Mercados B3 & Globais"}</CmsText></span>
            <CmsElement feature="ui.components/ui/Footer.Link.2"><Link href="/acoes" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Ações & Companhias B3"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.3"><Link href="/fiis" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Fundos Imobiliários (FIIs)"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.4"><Link href="/stocks" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors"><CmsText>{"Stocks EUA (NYSE / NASDAQ)"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.5"><Link href="/reits" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors"><CmsText>{"REITs Imobiliários Globais"}</CmsText></Link></CmsElement>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]"><CmsText>{"Proventos & Renda"}</CmsText></span>
            <CmsElement feature="ui.components/ui/Footer.Link.6"><Link href="/agenda-dividendos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Agenda de Dividendos & JCP"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.7"><Link href="/mapa-de-dividendos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Mapa de Sazonalidade 12M"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.8"><Link href="/simulador-de-dividendos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Simulador de Renda Passiva"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.9"><Link href="/perfil-de-investidor" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Suitability & Perfil CVM"}</CmsText></Link></CmsElement>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]"><CmsText>{"Educação & Conteúdo"}</CmsText></span>
            <CmsElement feature="ui.components/ui/Footer.Link.10"><Link href="/dicionario" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Dicionário do Investidor (A-Z)"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.11"><Link href="/livros-investimentos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Biblioteca de Livros Recomendados"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.12"><Link href="/artigos" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Artigos & Análises Setoriais"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.13"><Link href="/noticias" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Notícias & Fatos Relevantes CVM"}</CmsText></Link></CmsElement>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]"><CmsText>{"Ferramentas & Plataformas"}</CmsText></span>
            <CmsElement feature="ui.components/ui/Footer.Link.14"><Link href="/simulador-de-portfolios" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Simulador de Portfólios"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.15"><Link href="/rankings" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Rankings dos Melhores Ativos"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.16"><Link href="/comparador" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Comparador Head-to-Head"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.17"><Link href="/corretoras" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Comparador de Corretoras"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.18"><Link href="/screener" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Super Screener Multiativo"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.19"><Link href="/carteira" className="text-[#94a3b8] hover:text-[var(--positive)] transition-colors"><CmsText>{"Minha Carteira Consolidada"}</CmsText></Link></CmsElement>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]"><CmsText>{"Institucional & Legal"}</CmsText></span>
            <CmsElement feature="ui.components/ui/Footer.Link.20"><Link href="/premium" className="text-[var(--positive)] font-bold hover:underline transition-colors"><CmsText>{"Planos Premium Pro"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.21"><Link href="/quem-somos" className="text-[#94a3b8] hover:text-white transition-colors"><CmsText>{"Quem Somos & Metodologia"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.22"><Link href="/mapa-do-site" className="text-[#94a3b8] hover:text-white transition-colors"><CmsText>{"Mapa do Site"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.23"><Link href="/contato" className="text-[#94a3b8] hover:text-white transition-colors"><CmsText>{"Fale Conosco / Suporte"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.24"><Link href="/termos-de-uso" className="text-[#94a3b8] hover:text-white transition-colors"><CmsText>{"Termos de Uso"}</CmsText></Link></CmsElement>
            <CmsElement feature="ui.components/ui/Footer.Link.25"><Link href="/politica-de-privacidade" className="text-[#94a3b8] hover:text-white transition-colors"><CmsText>{"Privacidade & LGPD"}</CmsText></Link></CmsElement>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#94a3b8]">
          <p><CmsText>{"© 2026 FIN Platform. Todas as informações exibidas têm caráter exclusivamente educacional e analítico."}</CmsText></p>
          <p className="font-mono"><CmsText>{"Next.js 16 • React 19 • Zod • Neon TimescaleDB • Pure CSS Layout"}</CmsText></p>
        </div>
      </div>
    </footer></CmsElement>
  );
}
