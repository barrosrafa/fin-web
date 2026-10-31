
import { CmsText, CmsElement, CmsProvider, CmsRoute } from "@/components/content/Cms";
import { textKey } from "@/lib/content/keys";
import { getCmsSnapshot } from "@/lib/content/server";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TickerTape } from "@/components/ui/TickerTape";
import { Navbar } from "@/components/ui/Navbar";
import { DisplayPreferences } from "@/components/shared/DisplayPreferences";
import { Footer } from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultMetadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fin-web-wheat.vercel.app"),
  title: "FIN·WEB — Terminal Avançado de Análise & Valuation",
  description:
    "Plataforma institucional de alta performance para Ações, FIIs, Fundos CVM 175, ETFs e Renda Fixa com modelos de Graham, Bazin, Brick Score e Comitê de IA.",
  manifest: "/manifest.json",
};

export async function generateMetadata(): Promise<Metadata> {
  const { texts } = await getCmsSnapshot();
  const title = defaultMetadata.title as string;
  const description = defaultMetadata.description as string;
  return { ...defaultMetadata, title: texts[textKey(title)] ?? title, description: texts[textKey(description)] ?? description };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshot = await getCmsSnapshot();
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060709] text-[#f0f4f8]">
        <CmsProvider snapshot={snapshot}>
        <CmsElement feature="ui.app/-frontend-/layout.a.1"><a href="#main-content" className="sr-only focus:not-sr-only"><CmsText>{"Ir ao conteúdo"}</CmsText></a></CmsElement>
        {/* Benchmark references */}
        <CmsElement feature="ui.app/-frontend-/layout.TickerTape.2"><TickerTape /></CmsElement>

        {/* Floating Glass Island Nav */}
        <Suspense fallback={<div className="h-14" />}>
          <CmsElement feature="ui.app/-frontend-/layout.Navbar.3"><Navbar /></CmsElement>
        </Suspense>

        {/* Main Application Content */}
        <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <CmsElement feature="ui.app/-frontend-/layout.DisplayPreferences.4"><DisplayPreferences /></CmsElement>
          <Suspense fallback={<p role="status"><CmsText>Carregando…</CmsText></p>}><CmsRoute>{children}</CmsRoute></Suspense>
        </main>

        {/* Global Tech Footer */}
        <CmsElement feature="ui.app/-frontend-/layout.Footer.5"><Footer /></CmsElement>
        </CmsProvider>
      </body>
    </html>
  );
}
