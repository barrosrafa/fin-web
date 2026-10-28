"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";
import { createSubscription, PixSubscriptionResponse, CardSubscriptionResponse } from "@/lib/api";

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [checkoutModal, setCheckoutModal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixSubscriptionResponse | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const handleCheckout = async (method: "PIX" | "CREDIT_CARD") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await createSubscription({
        plan_tier: "PRO",
        payment_method: method,
      });

      if (method === "PIX") {
        setPixData(res as PixSubscriptionResponse);
      } else {
        const cardRes = res as CardSubscriptionResponse;
        if (cardRes.checkout_url) {
          window.location.href = cardRes.checkout_url;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao processar assinatura";
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        setErrorMessage("Você precisa estar autenticado para assinar. Por favor, faça login ou cadastre-se.");
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (pixData?.copy_paste_code) {
      navigator.clipboard.writeText(pixData.copy_paste_code);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

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

      {/* Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 border border-cyan-500/40 bg-[#0f172a] flex flex-col gap-4 animate-fade-up">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">Checkout Seguro Asaas</h3>
              <button
                onClick={() => {
                  setCheckoutModal(null);
                  setPixData(null);
                  setErrorMessage(null);
                }}
                className="text-[#94a3b8] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex flex-col gap-2">
                <span>{errorMessage}</span>
                {errorMessage.includes("autenticado") && (
                  <Link href="/login" className="text-cyan-400 underline font-semibold">
                    Ir para tela de Login →
                  </Link>
                )}
              </div>
            )}

            {checkoutModal === "free" ? (
              <div className="flex flex-col gap-4 text-center py-4">
                <p className="text-sm text-[#cbd5e1]">
                  O plano Gratuito oferece acesso aos dados e simuladores básicos da plataforma sem custo.
                </p>
                <Link href="/cadastro">
                  <Button variant="primary" className="w-full">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            ) : pixData ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <span className="badge-neon badge-neon-emerald">Cobrança PIX Gerada</span>
                <p className="text-xs text-[#94a3b8]">
                  Escaneie o QR Code abaixo no app do seu banco ou use a chave Copia e Cola.
                </p>
                {pixData.qr_code_base64 && (
                  <div className="bg-white p-3 rounded-xl shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${pixData.qr_code_base64}`}
                      alt="QR Code Pix"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                )}
                <div className="w-full flex flex-col gap-2">
                  <Button
                    variant="primary"
                    onClick={handleCopyPix}
                    className="w-full"
                  >
                    {copiedPix ? "Código Copiado!" : "Copiar Código Pix"}
                  </Button>
                  <p className="text-[10px] text-[#64748b]">
                    A ativação da sua conta Pro ocorrerá automaticamente assim que o pagamento for liquidado.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#cbd5e1]">
                  Ambiente de pagamento criptografado PCI-DSS com suporte a PIX instantâneo e Cartão de Crédito.
                </p>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span>Plano Selecionado:</span>
                    <span className="text-cyan-400 font-bold">Premium Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ciclo:</span>
                    <span>{billingCycle === "annual" ? "Anual (30% desconto)" : "Mensal"}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                    <span>Total a Cobrar:</span>
                    <span className="text-emerald-400">
                      {formatCurrency(billingCycle === "annual" ? 358.80 : 42.90)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    disabled={isLoading}
                    onClick={() => handleCheckout("PIX")}
                  >
                    {isLoading ? "Processando..." : "Gerar Cobrança PIX com QR Code"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={() => handleCheckout("CREDIT_CARD")}
                  >
                    {isLoading ? "Processando..." : "Pagar com Cartão de Crédito"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
