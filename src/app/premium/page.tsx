"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [checkoutModal, setCheckoutModal] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      description: "Para quem está começando a aprender sobre investimentos.",
      price: 0.0,
      badge: "Iniciante",
      features: [
        "Cotações B3 com delay de 15 minutos",
        "Acesso aos filtros básicos de Ações e FIIs",
        "Simulador de Dividendos (até 3 simulações/mês)",
        "Acesso ao Dicionário e Biblioteca de Livros",
      ],
      notIncluded: [
        "Histórico contábil completo de 10 anos",
        "Checklist dos 5 Pilares de Valuation desbloqueado",
        "Preço Teto de Bazin e Preço Justo de Graham",
        "Mapa de Sazonalidade de Dividendos ilimitado",
        "Alertas de proventos via WhatsApp e Telegram",
        "Exportação de dados em planilhas Excel/CSV",
      ],
      isPopular: false,
    },
    {
      id: "pro",
      name: "Premium Pro",
      description: "Acesso ilimitado a todas as ferramentas analíticas profissionais.",
      price: billingCycle === "annual" ? 29.90 : 42.90,
      period: billingCycle === "annual" ? "/mês (faturado anualmente)" : "/mês",
      badge: billingCycle === "annual" ? "Economize 30% no Anual" : "Mensal sem Fidelidade",
      features: [
        "Todos os recursos do plano Gratuito",
        "Histórico contábil completo de 10 anos (Balanço, DRE, DFC)",
        "Checklist dos 5 Pilares com Preço Teto Bazin e Graham",
        "Mapa de Sazonalidade de Dividendos com heatmap de 12 meses",
        "Simulador de Dividendos e Magic Number ilimitado",
        "Módulo internacional: Stocks EUA e REITs com métricas Nareit",
        "Alertas imediatos de Data-Com e Pagamento via WhatsApp",
        "Exportação ilimitada de relatórios em XLSX e CSV",
        "Garantia incondicional de reembolso de 7 dias (CDC)",
      ],
      notIncluded: [],
      isPopular: true,
    },
  ];

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="text-center">
        <span className="badge-neon badge-neon-amber mb-3">Planos & Assinaturas</span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mt-1">
          Invista com Inteligência Institucional
        </h1>
        <p className="text-base text-[#94a3b8] mt-3 max-w-2xl mx-auto">
          Desbloqueie modelos de valuation matemáticos, matriz de calor de proventos, métricas contábeis de 10 anos
          e alertas instantâneos de dividendos.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-[#0f172a] border border-white/10 mt-6">
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "annual"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Plano Anual (30% OFF)
          </button>
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Plano Mensal
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={`p-8 flex flex-col justify-between gap-8 border transition-all ${
              p.isPopular
                ? "border-cyan-500/50 bg-[#0f172a]/90 shadow-2xl shadow-cyan-500/10 ring-1 ring-cyan-500/20"
                : "border-white/10 bg-[#0b1120]/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant={p.isPopular ? "cyan" : "outline"}>{p.badge}</Badge>
              </div>

              <h2 className="text-2xl font-black text-white">{p.name}</h2>
              <p className="text-xs text-[#94a3b8] mt-1 mb-6">{p.description}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-black font-mono text-white">
                  {formatCurrency(p.price)}
                </span>
                {p.period && <span className="text-xs text-[#94a3b8]">{p.period}</span>}
              </div>

              {/* Feature List */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                  O que está incluído:
                </span>
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#cbd5e1]">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{feat}</span>
                  </div>
                ))}
                {p.notIncluded.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#64748b] opacity-60">
                    <span className="text-red-400 font-bold">✕</span>
                    <span className="line-through">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Button
                variant={p.isPopular ? "primary" : "outline"}
                className="w-full py-3"
                onClick={() => setCheckoutModal(p.id)}
              >
                {p.price === 0 ? "Começar Gratuitamente" : "Assinar com 7 Dias Grátis"}
              </Button>
              {p.isPopular && (
                <p className="text-center text-[11px] text-[#64748b] mt-3">
                  Garantia incondicional de 7 dias com cancelamento simplificado em 1 clique.
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Checkout Modal Simulation */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 border border-cyan-500/40 bg-[#0f172a] flex flex-col gap-4 animate-fade-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Checkout Seguro Asaas</h3>
              <button
                onClick={() => setCheckoutModal(null)}
                className="text-[#94a3b8] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#cbd5e1]">
              Ambiente de pagamento criptografado PCI-DSS com suporte a PIX instantâneo e Cartão de Crédito.
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between">
                <span>Plano Selecionado:</span>
                <span className="text-cyan-400 font-bold">{checkoutModal === "pro" ? "Premium Pro" : "Free"}</span>
              </div>
              <div className="flex justify-between">
                <span>Ciclo:</span>
                <span>{billingCycle === "annual" ? "Anual (30% desconto)" : "Mensal"}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                <span>Total a Cobrar:</span>
                <span className="text-emerald-400">
                  {checkoutModal === "pro"
                    ? formatCurrency(billingCycle === "annual" ? 358.80 : 42.90)
                    : "R$ 0,00"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                onClick={() => {
                  alert("Assinatura confirmada com sucesso! Bem-vindo ao plano Pro.");
                  setCheckoutModal(null);
                }}
              >
                Pagar com PIX com QR Code
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  alert("Assinatura confirmada com cartão de crédito!");
                  setCheckoutModal(null);
                }}
              >
                Pagar com Cartão de Crédito
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
