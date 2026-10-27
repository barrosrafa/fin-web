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
                Sistemas Operacionais
              </Badge>
            </div>
            <p className="text-xs text-[#64748b] max-w-md">
              Plataforma institucional de inteligência de mercado financeiro, análise quantitativa e valuation integrado de ativos B3 e globais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#94a3b8]">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00f5a0]" />
              <span>B3 Market Data: 12ms</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#00d9f5]" />
              <span>CVM 175 Sync: Ativo</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
              <span>IA Comitê: Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Mercados B3
            </span>
            <Link href="/acoes" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Ações & Blue Chips
            </Link>
            <Link href="/fiis" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Fundos Imobiliários & Fiagros
            </Link>
            <Link href="/fundos" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Fundos CVM 175 (Multimercado & Renda Fixa)
            </Link>
            <Link href="/etfs" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              ETFs Locais & Internacionais
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Ferramentas Quant
            </span>
            <Link href="/screener" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Super Screener Multiativo
            </Link>
            <Link href="/comparador" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Comparador Head-to-Head
            </Link>
            <Link href="/carteira" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Simulador Magic Number & Proventos
            </Link>
            <Link href="/radar-ia" className="text-[#94a3b8] hover:text-[#00f5a0] transition-colors">
              Comitê de IA & Fatos Relevantes
            </Link>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Fontes & Reguladores
            </span>
            <a href="https://www.b3.com.br" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors">
              B3 Brasil Bolsa Balcão ↗
            </a>
            <a href="https://dados.cvm.gov.br" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors">
              Comissão de Valores Mobiliários (CVM) ↗
            </a>
            <a href="https://www.bcb.gov.br" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors">
              Banco Central do Brasil (SGS) ↗
            </a>
            <a href="https://www.anbima.com.br" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#00d9f5] transition-colors">
              ANBIMA (Curvas & TPF) ↗
            </a>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
              Engenharia & Repositórios
            </span>
            <a href="https://github.com/barrosrafa/fin-web" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#a855f7] transition-colors">
              GitHub: barrosrafa/fin-web ↗
            </a>
            <a href="https://github.com/barrosrafa/fin-db" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#a855f7] transition-colors">
              GitHub: barrosrafa/fin-db ↗
            </a>
            <a href="https://github.com/barrosrafa/fin-api" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#a855f7] transition-colors">
              GitHub: barrosrafa/fin-api ↗
            </a>
            <a href="https://github.com/barrosrafa/fin-ingestion" target="_blank" rel="noreferrer" className="text-[#94a3b8] hover:text-[#a855f7] transition-colors">
              GitHub: barrosrafa/fin-ingestion ↗
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#64748b]">
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
