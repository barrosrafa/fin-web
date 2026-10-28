import React from "react";
import { Card } from "@/components/ui/Card";

export default function SobrePage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan">Institucional</span>
          <span className="text-xs text-[#64748b]">Nossa Missão & Governança</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Sobre a Plataforma
        </h1>
        <p className="text-base text-[#94a3b8] mt-2 leading-relaxed">
          Nossa missão é democratizar ferramentas quantitativas, modelos matemáticos de valuation e
          análise fundamentalista institucional para o investidor brasileiro e global.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-white/10 flex flex-col gap-2">
          <span className="text-2xl">🏛️</span>
          <h3 className="text-base font-bold text-white">Value Investing Rigoroso</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Aplicamos os princípios clássicos de Benjamin Graham, Décio Bazin e Charlie Munger com
            disciplina matemática e sem ruído de curto prazo.
          </p>
        </Card>
        <Card className="p-6 border border-white/10 flex flex-col gap-2">
          <span className="text-2xl">⚡</span>
          <h3 className="text-base font-bold text-white">Infraestrutura em Tempo Real</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Consumo direto de feeds oficiais da B3, CVM, SEC e Banco Central processados por engines
            assíncronas de alta performance e bancos de dados serverless.
          </p>
        </Card>
        <Card className="p-6 border border-white/10 flex flex-col gap-2">
          <span className="text-2xl">🛡️</span>
          <h3 className="text-base font-bold text-white">Independência Editorial</h3>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Não somos uma corretora de valores nem recebemos comissões de transação. Nosso modelo de
            negócio é sustentado exclusivamente pela assinatura dos nossos membros.
          </p>
        </Card>
      </div>

      <Card className="p-6 border border-amber-500/20 bg-amber-950/10">
        <h2 className="text-sm font-bold text-amber-400 mb-2 uppercase tracking-wider">
          Aviso Legal Regulatório (Resolução CVM nº 20)
        </h2>
        <p className="text-xs text-[#cbd5e1] leading-relaxed">
          As informações, estimativas de múltiplos, modelos de valuation (incluindo Preço Justo de Graham e Preço Teto de Bazin),
          simuladores de proventos e scores analíticos disponibilizados nesta plataforma possuem caráter estritamente educacional
          e informativo. Não configuram, sob qualquer hipótese, recomendação individualizada de compra, venda ou manutenção de
          valores mobiliários. Investimentos em bolsa de valores envolvem riscos de perda patrimonial. Rentabilidade passada não
          representa garantia de rentabilidade futura.
        </p>
      </Card>
    </div>
  );
}
