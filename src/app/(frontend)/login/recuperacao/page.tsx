"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function RecuperacaoSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-up">
      <CmsElement feature="ui.app/-frontend-/login/recuperacao/page.Card.1"><Card className="w-full max-w-md p-8 border border-white/10 bg-[#0f172a]/90 flex flex-col gap-6">
        <div className="text-center">
          <span className="badge-neon badge-neon-amber mb-2"><CmsText>{"Segurança"}</CmsText></span>
          <h1 className="text-2xl font-black text-white mt-1"><CmsText>{"Recuperar Senha"}</CmsText></h1>
          <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Insira o e-mail cadastrado para enviarmos as instruções de redefinição de acesso."}</CmsText></p>
        </div>

        <CmsText>{enviado ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col gap-3">
            <span className="text-2xl"><CmsText>{"✉️"}</CmsText></span>
            <h3 className="text-lg font-bold text-white"><CmsText>{"Instruções Enviadas!"}</CmsText></h3>
            <p className="text-xs text-[#cbd5e1]"><CmsText>{"Caso exista uma conta vinculada ao e-mail informado, você receberá um link seguro de recuperação em instantes."}</CmsText></p>
            <CmsElement feature="ui.app/-frontend-/login/recuperacao/page.Link.2"><Link href="/login" className="mt-2">
              <Button variant="outline" className="w-full"><CmsText>{"Voltar para o Login"}</CmsText></Button>
            </Link></CmsElement>
          </div>
        ) : (
          <CmsElement feature="ui.app/-frontend-/login/recuperacao/page.form.3"><form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"E-mail Cadastrado:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/login/recuperacao/page.input.4"><input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
              /></CmsElement>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2"><CmsText>{"Enviar Link de Redefinição"}</CmsText></Button>
          </form></CmsElement>
        )}</CmsText>

        <div className="text-center pt-2 border-t border-white/10 text-xs text-[#94a3b8]"><CmsText>{"Lembrou da senha?"}</CmsText><CmsText>{" "}</CmsText>
          <CmsElement feature="ui.app/-frontend-/login/recuperacao/page.Link.5"><Link href="/login" className="text-cyan-400 font-bold hover:underline"><CmsText>{"Voltar para Login"}</CmsText></Link></CmsElement>
        </div>
      </Card></CmsElement>
    </div>
  );
}
