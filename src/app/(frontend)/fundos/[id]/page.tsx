
import { CmsText } from "@/components/content/Cms";
import React, { Suspense } from "react";
import { FundDetailClient } from "./FundDetailClient";

export function generateStaticParams() {
  return [
    { id: "1001" },
    { id: "1002" },
    { id: "1003" },
  ];
}

export default async function FundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  const id = resolved.id || "1001";

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-24 text-sm text-[#94a3b8] font-mono"><CmsText>{"Carregando cockpit analítico CVM 175 do fundo "}</CmsText><CmsText>{id}</CmsText><CmsText>{"..."}</CmsText></div>
      }
    >
      <FundDetailClient fundId={id} />
    </Suspense>
  );
}
