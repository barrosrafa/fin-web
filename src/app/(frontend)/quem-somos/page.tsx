import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";

export const metadata = {
  title: "Quem Somos - Metodologia e Governança - ETFs Brasil",
  description: "Conheça a missão, governança de dados e metodologia de indexação passiva da plataforma ETFs Brasil.",
};

export default function QuemSomosPage() {
  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald">Transparência & Governança</span>
          <span className="text-xs text-[#64748b]">Metodologia Teva Índices</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Quem Somos & Metodologia Analítica
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl">
          O portal ETFs Brasil é uma iniciativa dedicada a disseminar dados públicos auditados, transparência de custos e ferramentas quantitativas para investidores de fundos de índice e alocadores de carteiras.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Foco em Gestão Passiva"
          value="Baixo Custo Efetivo"
          subtitle="Adoção de índices amplos para mitigar o risco de stock picking"
          glow="emerald"
        />
        <MetricCard
          title="Transparência de TER"
          value="Custo Real Total"
          subtitle="Decomposição explícita de taxas primárias e secundárias"
          glow="cyan"
        />
        <MetricCard
          title="Rigor Científico"
          value="Dados SPIVA & CVM"
          subtitle="Modelos estatísticos com base em dados abertos diários"
          glow="violet"
        />
      </div>

      {/* Content Sections */}
      <Card glow="emerald">
        <h3 className="text-lg font-bold text-white tracking-tight mb-3">
          Nossa Missão
        </h3>
        <p className="text-xs text-[#94a3b8] leading-relaxed mb-4">
          O mercado brasileiro de capitais historicamente privilegiou fundos com altas taxas de administração e de performance, corroendo o retorno real do investidor no longo prazo. Estudos acadêmicos e relatórios SPIVA comprovam que mais de 85% dos fundos ativos não superam seus benchmarks no horizonte de 5 a 10 anos.
        </p>
        <p className="text-xs text-[#94a3b8] leading-relaxed">
          Nossa missão é democratizar o acesso à análise independente de ETFs, Fundos Imobiliários e Fundos de Infraestrutura, oferecendo simuladores com dados reais ajustados para proventos e cálculo preciso de Tracking Difference.
        </p>
      </Card>

      <Card glow="cyan">
        <h3 className="text-lg font-bold text-white tracking-tight mb-3">
          Parceria e Metodologia Teva Índices
        </h3>
        <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">
          Os índices de referência calculados pela Teva Índices seguem normas internacionais de governança da IOSCO (*International Organization of Securities Commissions*). Cada índice possui critérios transparentes de seleção de ativos, ponderação por valor de mercado em free float e rebalanceamento periódico quadrimestral.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/ativos/indices"
            className="text-xs font-bold text-[#00f5a0] hover:underline"
          >
            Conheça todos os índices monitorados →
          </Link>
        </div>
      </Card>
    </div>
  );
}
