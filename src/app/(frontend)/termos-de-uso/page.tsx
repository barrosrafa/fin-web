import React from "react";
import { Card } from "@/components/ui/Card";

export default function TermosDeUsoPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-indigo">Regulamentação</span>
          <span className="text-xs text-[#64748b]">Atualizado em Outubro de 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Termos e Condições de Uso
        </h1>
        <p className="text-sm text-[#94a3b8] mt-1">
          Diretrizes que regem a navegação, acesso aos dados e utilização dos serviços da plataforma.
        </p>
      </div>

      <Card className="p-8 border border-white/10 bg-[#0f172a]/80 space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-white mb-2">1. Aceite dos Termos</h2>
          <p>
            Ao acessar ou utilizar a plataforma, o usuário declara ter lido, compreendido e concordado integralmente
            com as presentes disposições. Caso não concorde com qualquer cláusula, deverá cessar imediatamente o uso.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">2. Natureza dos Serviços e Isenção de Responsabilidade</h2>
          <p>
            A plataforma disponibiliza ferramentas computacionais de organização, agregação e modelagem quantitativa
            de dados públicos de mercado (B3, CVM, SEC e Banco Central). Em nenhuma hipótese as análises, estimativas de
            Preço Teto, Preço Justo ou simulações configuram recomendação de investimento ou consultoria financeira regulada.
            As decisões de alocação de recursos são de responsabilidade exclusiva e soberana do investidor.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">3. Propriedade Intelectual e Proibição de Raspagem</h2>
          <p>
            Todos os códigos-fonte, estruturas de banco de dados, matrizes de cálculo e marcas são protegidos pelas leis de
            direitos autorais e propriedade industrial. É expressamente vedada a utilização de scripts, robôs, crawlers
            ou engenharia reversa para extração massiva não autorizada de dados (*scraping*) sem consentimento prévio por escrito.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white mb-2">4. Planos, Assinaturas e Política de Cancelamento</h2>
          <p>
            Os planos pagos concedem acesso temporário aos recursos analíticos Pro. Conforme o Artigo 49 do Código de Defesa
            do Consumidor (CDC), o usuário poderá solicitar o cancelamento e reembolso integral do primeiro pagamento em até
            7 (sete) dias corridos após a contratação.
          </p>
        </section>
      </Card>
    </div>
  );
}
