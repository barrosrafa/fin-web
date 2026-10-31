
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import { Card } from "@/components/ui/Card";

export default function PoliticaPrivacidadePage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-emerald"><CmsText>{"Lei Geral de Proteção de Dados"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Lei nº 13.709/2018 (LGPD)"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Política de Privacidade & Proteção de Dados"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{"Saiba como tratamos seus dados pessoais, como garantimos a segurança da informação e como exercer seus direitos de titular."}</CmsText></p>
      </div>

      <CmsElement feature="ui.app/-frontend-/politica-de-privacidade/page.Card.1"><Card className="p-8 border border-white/10 bg-[#0f172a]/80 space-y-6 text-sm text-[#cbd5e1] leading-relaxed">
        <CmsElement feature="ui.app/-frontend-/politica-de-privacidade/page.section.2"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"1. Coleta e Finalidade dos Dados"}</CmsText></h2>
          <p><CmsText>{"Coletamos apenas as informações estritamente necessárias para a prestação dos nossos serviços, incluindo: nome completo, endereço de e-mail e credenciais de login. Dados de faturamento (cartão de crédito e CPF) são processados diretamente por gateways homologados PCI-DSS (Asaas e Stripe), sem armazenamento de dados sensíveis de pagamento em nossos servidores."}</CmsText></p>
        </section></CmsElement>

        <CmsElement feature="ui.app/-frontend-/politica-de-privacidade/page.section.3"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"2. Base Legal de Tratamento"}</CmsText></h2>
          <p><CmsText>{"O tratamento de dados é realizado sob as bases legais de: (i) execução de contrato e termos de serviço; (ii) cumprimento de obrigação legal ou regulatória (Marco Civil da Internet, Lei nº 12.965/2014); e (iii) legítimo interesse na prevenção a fraudes e melhoria de desempenho técnico."}</CmsText></p>
        </section></CmsElement>

        <CmsElement feature="ui.app/-frontend-/politica-de-privacidade/page.section.4"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"3. Direitos dos Titulares de Dados"}</CmsText></h2>
          <p><CmsText>{"Nos termos do Artigo 18 da LGPD, você possui o direito de solicitar a qualquer momento: confirmação da existência de tratamento, acesso facilitado aos dados, correção de dados incompletos ou inexatos, anonimização ou eliminação definitiva dos dados pessoais desnecessários."}</CmsText></p>
        </section></CmsElement>

        <CmsElement feature="ui.app/-frontend-/politica-de-privacidade/page.section.5"><section>
          <h2 className="text-base font-bold text-white mb-2"><CmsText>{"4. Canal de Contato com o Encarregado (DPO)"}</CmsText></h2>
          <p><CmsText>{"Para exercer qualquer um dos seus direitos de privacidade ou esclarecer dúvidas operacionais, entre em contato com o nosso Encarregado de Proteção de Dados pelo e-mail:"}</CmsText><CmsText>{" "}</CmsText>
            <span className="font-mono text-cyan-400"><CmsText>{"dpo@analisedeacoes.com"}</CmsText></span><CmsText>{" ou através do nosso canal de atendimento em /contato."}</CmsText></p>
        </section></CmsElement>
      </Card></CmsElement>
    </div>
  );
}
