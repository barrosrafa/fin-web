import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "Mapa do Site - Taxonomia Global - ETFs Brasil",
  description: "Índice estruturado de rotas e classes de ativos indexados disponíveis na plataforma ETFs Brasil.",
};

export default function MapaDoSitePage() {
  const sections = [
    {
      title: "Hub de Ativos & Screeners",
      links: [
        { href: "/ativos", label: "Hub Central de Ativos" },
        { href: "/ativos/etfs", label: "ETFs Listados na B3" },
        { href: "/ativos/bdrs", label: "BDRs de Ações e ETFs Internacionais" },
        { href: "/ativos/fiis", label: "Fundos Imobiliários (FIIs)" },
        { href: "/ativos/fi-infras", label: "Fundos de Infraestrutura (FI-Infras Isentos)" },
        { href: "/ativos/fundos", label: "Fundos Mútuos CVM 175" },
        { href: "/ativos/indices", label: "Índices & Benchmarks (B3 e Teva)" },
        { href: "/ativos/etfs-eua", label: "ETFs dos Estados Unidos (NYSE / NASDAQ)" },
        { href: "/ativos/acoes-eua", label: "Ações dos Estados Unidos" },
      ],
    },
    {
      title: "Motores Analíticos & Ferramentas",
      links: [
        { href: "/simulador-de-portfolios", label: "Simulador de Portfólios de ETFs" },
        { href: "/comparador", label: "Comparador de Ativos Multi-Ativo" },
        { href: "/comparador/cdib11/lftb11", label: "Comparador Canônico: CDIB11 x LFTB11" },
        { href: "/comparador/blft11/lfts11", label: "Comparador Canônico: BLFT11 x LFTS11" },
        { href: "/comparador/bova11/smal11", label: "Comparador Canônico: BOVA11 x SMAL11" },
        { href: "/rankings", label: "Rankings dos Melhores Ativos" },
      ],
    },
    {
      title: "Conteúdo, Institucional & Compliance",
      links: [
        { href: "/artigos", label: "Artigos e Estudos Quantitativos" },
        { href: "/contato", label: "Fale Conosco / Contato" },
        { href: "/quem-somos", label: "Quem Somos & Metodologia Analítica" },
        { href: "/termos-de-uso", label: "Termos de Uso & Isenção CVM" },
        { href: "/politica-de-privacidade", label: "Política de Privacidade & LGPD" },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Arquitetura de Informação</span>
          <span className="text-xs text-[#64748b]">Sitemap do Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Mapa do Site
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-xl">
          Navegue pela estrutura completa de dados abertos, screeners setoriais, ferramentas quantitativas e rotas canônicas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((sec) => (
          <Card key={sec.title} glow="cyan">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              {sec.title}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {sec.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#94a3b8] hover:text-[#00f5a0] transition-colors flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <span className="text-[#64748b] text-[10px]">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
