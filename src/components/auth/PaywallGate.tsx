import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PaywallGateProps {
  isSubscriber?: boolean;
  children: React.ReactNode;
  featureName: string;
}

export function PaywallGate({ isSubscriber = false, children, featureName }: PaywallGateProps) {
  if (isSubscriber) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6 bg-[#0a0f1d]/50">
      {/* Blurred background preview to preserve semantic SEO and layout */}
      <div className="select-none filter blur-sm pointer-events-none opacity-40 aria-hidden">
        {children}
      </div>

      {/* Paywall CTA Card Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center backdrop-blur-xs">
        <span className="badge-neon badge-neon-amber mb-3">Recurso Exclusivo Pro</span>
        <h3 className="text-xl font-bold text-white mb-2">
          Desbloqueie o {featureName}
        </h3>
        <p className="text-sm text-[#94a3b8] max-w-md mb-6">
          Acesse modelos avançados de valuation, histórico contábil de 10 anos, mapa de dividendos completo e alertas via WhatsApp.
        </p>
        <Link href="/premium">
          <Button variant="primary">Assinar Plano Pro Anual (7 dias grátis)</Button>
        </Link>
      </div>
    </div>
  );
}
