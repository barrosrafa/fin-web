"use client";


import { CmsText, CmsElement, useCmsText } from "@/components/content/Cms";
import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { registerUser } from "@/lib/api";

export default function CadastroPage() {
  const cmsText = useCmsText();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termosAceitos) {
      alert(cmsText("É necessário aceitar os Termos de Uso e a Política de Privacidade."));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await registerUser({ name: nome, email, password: senha });
      if (res.user) {
        setSucesso(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar conta. Verifique os dados informados.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-up">
      <CmsElement feature="ui.app/-frontend-/cadastro/page.Card.1"><Card className="w-full max-w-md p-8 border border-white/10 bg-[#0f172a]/90 flex flex-col gap-6">
        <div className="text-center">
          <span className="badge-neon badge-neon-cyan mb-2"><CmsText>{"Criar Nova Conta"}</CmsText></span>
          <h1 className="text-2xl font-black text-white mt-1"><CmsText>{"Junte-se à Plataforma"}</CmsText></h1>
          <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Cadastre-se gratuitamente para acessar simuladores, mapa de dividendos e valuations."}</CmsText></p>
        </div>

        <CmsText>{error && (
          <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <CmsText>{error}</CmsText>
          </div>
        )}</CmsText>

        <CmsText>{sucesso ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col gap-3">
            <span className="text-2xl"><CmsText>{"✓"}</CmsText></span>
            <h3 className="text-lg font-bold text-white"><CmsText>{"Conta criada com sucesso!"}</CmsText></h3>
            <p className="text-xs text-[#cbd5e1]"><CmsText>{"Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada."}</CmsText></p>
            <CmsElement feature="ui.app/-frontend-/cadastro/page.Link.2"><Link href="/login" className="mt-2">
              <Button variant="primary" className="w-full"><CmsText>{"Ir para o Login"}</CmsText></Button>
            </Link></CmsElement>
          </div>
        ) : (
          <CmsElement feature="ui.app/-frontend-/cadastro/page.form.3"><form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Nome Completo:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/cadastro/page.input.4"><input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
              /></CmsElement>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"E-mail:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/cadastro/page.input.5"><input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
              /></CmsElement>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Senha de Acesso:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/cadastro/page.input.6"><input
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
              /></CmsElement>
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <CmsElement feature="ui.app/-frontend-/cadastro/page.input.7"><input
                type="checkbox"
                required
                id="termos"
                checked={termosAceitos}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-cyan-400 rounded"
              /></CmsElement>
              <label htmlFor="termos" className="text-xs text-[#94a3b8] leading-tight"><CmsText>{"Li e concordo com os"}</CmsText><CmsText>{" "}</CmsText>
                <CmsElement feature="ui.app/-frontend-/cadastro/page.Link.8"><Link href="/termos-de-uso" className="text-cyan-400 hover:underline"><CmsText>{"Termos de Uso"}</CmsText></Link></CmsElement><CmsText>{" "}</CmsText><CmsText>{"e com a"}</CmsText><CmsText>{" "}</CmsText>
                <CmsElement feature="ui.app/-frontend-/cadastro/page.Link.9"><Link href="/politica-de-privacidade" className="text-cyan-400 hover:underline"><CmsText>{"Política de Privacidade (LGPD)"}</CmsText></Link></CmsElement><CmsText>{"."}</CmsText></label>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}><CmsText>{"Criar Conta Gratuita"}</CmsText></Button>
          </form></CmsElement>
        )}</CmsText>

        <div className="text-center pt-2 border-t border-white/10 text-xs text-[#94a3b8]"><CmsText>{"Já possui uma conta?"}</CmsText><CmsText>{" "}</CmsText>
          <CmsElement feature="ui.app/-frontend-/cadastro/page.Link.10"><Link href="/login" className="text-cyan-400 font-bold hover:underline"><CmsText>{"Acessar Plataforma"}</CmsText></Link></CmsElement>
        </div>
      </Card></CmsElement>
    </div>
  );
}
