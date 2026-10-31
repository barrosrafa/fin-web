
import { CmsText } from "@/components/content/Cms";
import React, { Suspense } from "react";
import { ScreenerClient } from "./ScreenerClient";

export default function ScreenerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono"><CmsText>{"Carregando Super Screener Universal..."}</CmsText></div>
      }
    >
      <ScreenerClient />
    </Suspense>
  );
}
