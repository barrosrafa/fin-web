"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termosAceitos) {
      alert("É necessário aceitar os Termos de Uso e a Política de Privacidade.");
      return;
    }
    // Simulate signup success
    setSucesso(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-fade-up">
      <Card className="w-full max-w-md p-8 border border-white/10 bg-[#0f172a]/90 flex flex-col gap-6">
        <div className="text-center">
          <span className="badge-neon badge-neon-cyan mb-2">Criar Nova Conta</span>
          <h1 className="text-2xl font-black text-white mt-1">Junte-se à Plataforma</h1>
          <p className="text-xs text-[#94a3b8] mt-1">
            Cadastre-se gratuitamente para acessar simuladores, mapa de dividendos e valuations.
          </p>
        </div>

        {sucesso ? (
          <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col gap-3">
            <span className="text-2xl">✓</span>
            <h3 className="text-lg font-bold text-white">Conta criada com sucesso!</h3>
            <p className="text-xs text-[#cbd5e1]">
              Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada.
            </p>
            <Link href="/login" className="mt-2">
              <Button variant="primary" className="w-full">
                Ir para o Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#94a3b8]">Nome Completo:</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João da Silva"
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
              />
            </div>

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
              <label className="text-xs text-[#94a3b8]">Senha de Acesso:</label>
              <input
                type="password"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                className="bg-[#0b1120] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                required
                id="termos"
                checked={termosAceitos}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-cyan-400 rounded"
              />
              <label htmlFor="termos" className="text-xs text-[#94a3b8] leading-tight">
                Li e concordo com os{" "}
                <Link href="/termos-de-uso" className="text-cyan-400 hover:underline">
                  Termos de Uso
                </Link>{" "}
                e com a{" "}
                <Link href="/politica-de-privacidade" className="text-cyan-400 hover:underline">
                  Política de Privacidade (LGPD)
                </Link>
                .
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2">
              Criar Conta Gratuita
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-white/10 text-xs text-[#94a3b8]">
          Já possui uma conta?{" "}
          <Link href="/login" className="text-cyan-400 font-bold hover:underline">
            Acessar Plataforma
          </Link>
        </div>
      </Card>
    </div>
  );
}
