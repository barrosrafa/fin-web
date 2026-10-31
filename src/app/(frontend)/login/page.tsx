"use client";

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
      if (res.token) {
        document.cookie = `auth_token=${res.token}; path=/; max-age=604800; SameSite=Lax;`;
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
      <Card className="w-full max-w-md p-8 border border-white/10 bg-[#0f172a]/90 flex flex-col gap-6">
        <div className="text-center">
          <span className="badge-neon badge-neon-cyan mb-2">Autenticação</span>
          <h1 className="text-2xl font-black text-white mt-1">Acessar Plataforma</h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Entre com suas credenciais para gerenciar sua carteira e recursos exclusivos.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-[#94a3b8]">E-mail:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#94a3b8]">Senha:</label>
              <Link href="/login/recuperacao" className="text-xs text-cyan-400 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? "Entrando..." : "Entrar na Conta"}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-white/10 text-xs text-[#94a3b8]">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-cyan-400 font-bold hover:underline">
            Cadastre-se grátis
          </Link>
        </div>
      </Card>
    </div>
  );
}
