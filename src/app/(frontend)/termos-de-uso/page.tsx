
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import { Card } from "@/components/ui/Card";

export default function TermosDeUsoPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-indigo"><CmsText>{"Regulamentação"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Atualizado em Outubro de 2026"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Termos e Condições de Uso"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{"Diretrizes que regem a navegação, acesso aos dados e utilização dos serviços da plataforma."}</CmsText></p>
      </div>

      <CmsElement feature="ui.app/-frontend-/termos-de-uso/page.Card.1"><Card className="p-8 border border-white/10 bg-[#0f172a]/80 space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
        <CmsElement feature="ui.app/-frontend-/termos-de-uso/page.section.2"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"1. Aceite dos Termos"}</CmsText></h2>
          <p><CmsText>{"Ao acessar ou utilizar a plataforma, o usuário declara ter lido, compreendido e concordado integralmente com as presentes disposições. Caso não concorde com qualquer cláusula, deverá cessar imediatamente o uso."}</CmsText></p>
        </section></CmsElement>

        <CmsElement feature="ui.app/-frontend-/termos-de-uso/page.section.3"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"2. Natureza dos Serviços e Isenção de Responsabilidade"}</CmsText></h2>
          <p><CmsText>{"A plataforma disponibiliza ferramentas computacionais de organização, agregação e modelagem quantitativa de dados públicos de mercado (B3, CVM, SEC e Banco Central). Em nenhuma hipótese as análises, estimativas de Preço Teto, Preço Justo ou simulações configuram recomendação de investimento ou consultoria financeira regulada. As decisões de alocação de recursos são de responsabilidade exclusiva e soberana do investidor."}</CmsText></p>
        </section></CmsElement>

        <CmsElement feature="ui.app/-frontend-/termos-de-uso/page.section.4"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"3. Propriedade Intelectual e Proibição de Raspagem"}</CmsText></h2>
          <p><CmsText>{"Todos os códigos-fonte, estruturas de banco de dados, matrizes de cálculo e marcas são protegidos pelas leis de direitos autorais e propriedade industrial. É expressamente vedada a utilização de scripts, robôs, crawlers ou engenharia reversa para extração massiva não autorizada de dados (*scraping*) sem consentimento prévio por escrito."}</CmsText></p>
        </section></CmsElement>

        <CmsElement feature="ui.app/-frontend-/termos-de-uso/page.section.5"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"4. Planos, Assinaturas e Política de Cancelamento"}</CmsText></h2>
          <p><CmsText>{"Os planos pagos concedem acesso temporário aos recursos analíticos Pro. Conforme o Artigo 49 do Código de Defesa do Consumidor (CDC), o usuário poderá solicitar o cancelamento e reembolso integral do primeiro pagamento em até 7 (sete) dias corridos após a contratação."}</CmsText></p>
        </section></CmsElement>
      </Card></CmsElement>
    </div>
  );
}
