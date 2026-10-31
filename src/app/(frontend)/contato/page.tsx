"use client";


import { CmsText, CmsElement, useCmsText } from "@/components/content/Cms";
import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { submitSupportTicket } from "@/lib/api";

export default function ContatoPage() {
  const cmsText = useCmsText();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("SUGESTAO");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitSupportTicket({
        nome_contato: nome,
        email_contato: email,
        assunto,
        mensagem,
      });
      setEnviado(true);
    } catch (err) {
      console.error("Failed to send support ticket:", err);
      alert(cmsText("Erro ao enviar mensagem. Tente novamente mais tarde."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto animate-fade-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Help Desk"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Suporte ao Investidor"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Fale Conosco & Atendimento"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{"Dúvidas sobre sua assinatura, sugestões de novas funcionalidades ou apontamento de dados? Envie sua mensagem para nosso time de especialistas."}</CmsText></p>
      </div>

      <CmsElement feature="ui.app/-frontend-/contato/page.Card.1"><Card className="p-8 border border-white/10 bg-[#0f172a]/90">
        <CmsText>{enviado ? (
          <div className="p-8 text-center flex flex-col items-center gap-4">
            <span className="text-3xl"><CmsText>{"✓"}</CmsText></span>
            <h3 className="text-xl font-bold text-white"><CmsText>{"Mensagem Enviada com Sucesso!"}</CmsText></h3>
            <p className="text-xs text-[#cbd5e1] max-w-md"><CmsText>{"Seu ticket de suporte foi protocolado em nossa base. Responderemos diretamente ao seu e-mail em até 24 horas úteis."}</CmsText></p>
            <Button variant="outline" onClick={() => { setEnviado(false); setMensagem(""); }}><CmsText>{"Enviar Nova Mensagem"}</CmsText></Button>
          </div>
        ) : (
          <CmsElement feature="ui.app/-frontend-/contato/page.form.2"><form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#94a3b8]"><CmsText>{"Seu Nome:"}</CmsText></label>
                <CmsElement feature="ui.app/-frontend-/contato/page.input.3"><input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome e Sobrenome"
                  className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                /></CmsElement>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-[#94a3b8]"><CmsText>{"E-mail para Resposta:"}</CmsText></label>
                <CmsElement feature="ui.app/-frontend-/contato/page.input.4"><input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                /></CmsElement>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Assunto do Chamado:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/contato/page.select.5"><select
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="SUGESTAO"><CmsText>{"Sugestão de Funcionalidade"}</CmsText></option>
                <option value="ASSINATURA"><CmsText>{"Dúvida sobre Assinatura / Pagamento"}</CmsText></option>
                <option value="ERRO_DADOS"><CmsText>{"Apontar Erro em Cotação / Múltiplo"}</CmsText></option>
                <option value="OUTROS"><CmsText>{"Outros Assuntos"}</CmsText></option>
              </select></CmsElement>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Mensagem:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/contato/page.textarea.6"><textarea
                required
                rows={5}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Descreva detalhadamente sua dúvida ou solicitação..."
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
              /></CmsElement>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
              <CmsText>{loading ? "Enviando Chamado..." : "Enviar Mensagem de Suporte"}</CmsText>
            </Button>
          </form></CmsElement>
        )}</CmsText>
      </Card></CmsElement>
    </div>
  );
}
