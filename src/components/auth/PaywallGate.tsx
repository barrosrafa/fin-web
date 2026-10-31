
import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface PaywallGateProps {
  isSubscriber?: boolean;
  children: React.ReactNode;
  featureName: string;
  previewFallback?: React.ReactNode;
}

export function PaywallGate({ 
  isSubscriber = false, 
  children, 
  featureName,
  previewFallback 
}: PaywallGateProps) {
  if (isSubscriber) {
    return <><CmsText>{children}</CmsText></>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 p-6 bg-[#0a0f1d]/50">
      {/* Blurred background preview skeleton */}
      <div 
        aria-hidden="true" 
        // @ts-expect-error - React supports inert attribute in modern versions
        inert=""
        className="select-none filter blur-sm pointer-events-none opacity-30"
      >
        <CmsText>{previewFallback ?? children}</CmsText>
      </div>

      {/* Paywall CTA Card Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center backdrop-blur-xs">
        <span className="badge-neon badge-neon-amber mb-3"><CmsText>{"Recurso Exclusivo Pro"}</CmsText></span>
        <h3 className="text-xl font-bold text-white mb-2"><CmsText>{"Desbloqueie o "}</CmsText><CmsText>{featureName}</CmsText>
        </h3>
        <p className="text-sm text-[#94a3b8] max-w-md mb-6"><CmsText>{"Acesse modelos avançados de valuation, histórico contábil de 10 anos, mapa de dividendos completo e alertas via WhatsApp."}</CmsText></p>
        <CmsElement feature="ui.components/auth/PaywallGate.Link.1"><Link href="/premium">
          <Button variant="primary"><CmsText>{"Assinar Plano Pro Anual (7 dias grátis)"}</CmsText></Button>
        </Link></CmsElement>
      </div>
    </div>
  );
}
