"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await loginUser({ email, password: senha });
      if (res.user) {
        router.push("/carteira");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha na autenticação. Verifique seu e-mail e senha.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-up">
      <CmsElement feature="ui.app/-frontend-/login/page.Card.1"><Card className="w-full max-w-md p-8 border border-white/10 bg-[#0f172a]/90 flex flex-col gap-6">
        <div className="text-center">
          <span className="badge-neon badge-neon-cyan mb-2"><CmsText>{"Autenticação"}</CmsText></span>
          <h1 className="text-2xl font-black text-white mt-1"><CmsText>{"Acessar Plataforma"}</CmsText></h1>
          <p className="text-xs text-[#94a3b8] mt-1"><CmsText>{"Entre com suas credenciais para gerenciar sua carteira e recursos exclusivos."}</CmsText></p>
        </div>

        <CmsText>{error && (
          <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <CmsText>{error}</CmsText>
          </div>
        )}</CmsText>

        <CmsElement feature="ui.app/-frontend-/login/page.form.2"><form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#94a3b8]"><CmsText>{"E-mail:"}</CmsText></label>
            <CmsElement feature="ui.app/-frontend-/login/page.input.3"><input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
            /></CmsElement>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#94a3b8]"><CmsText>{"Senha:"}</CmsText></label>
              <CmsElement feature="ui.app/-frontend-/login/page.Link.4"><Link href="/login/recuperacao" className="text-xs text-cyan-400 hover:underline"><CmsText>{"Esqueceu a senha?"}</CmsText></Link></CmsElement>
            </div>
            <CmsElement feature="ui.app/-frontend-/login/page.input.5"><input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
            /></CmsElement>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            <CmsText>{loading ? "Entrando..." : "Entrar na Conta"}</CmsText>
          </Button>
        </form></CmsElement>

        <div className="text-center pt-2 border-t border-white/10 text-xs text-[#94a3b8]"><CmsText>{"Não tem uma conta?"}</CmsText><CmsText>{" "}</CmsText>
          <CmsElement feature="ui.app/-frontend-/login/page.Link.6"><Link href="/cadastro" className="text-cyan-400 font-bold hover:underline"><CmsText>{"Cadastre-se grátis"}</CmsText></Link></CmsElement>
        </div>
      </Card></CmsElement>
    </div>
  );
}
