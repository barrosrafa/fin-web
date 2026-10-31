import React, { Suspense } from "react";
import { DerivativesClient } from "./DerivativesClient";

export default function DerivativesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono">
          Carregando cockpit de derivativos e aluguel de ações...
        </div>
      }
    >
      <DerivativesClient />
    </Suspense>
  );
}
