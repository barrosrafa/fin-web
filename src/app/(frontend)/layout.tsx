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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fin-web-wheat.vercel.app"),
  title: "FIN·WEB — Terminal Avançado de Análise & Valuation",
  description:
    "Plataforma institucional de alta performance para Ações, FIIs, Fundos CVM 175, ETFs e Renda Fixa com modelos de Graham, Bazin, Brick Score e Comitê de IA.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#060709] text-[#f0f4f8]">
        <a href="#main-content" className="sr-only focus:not-sr-only">Ir ao conteúdo</a>
        {/* Benchmark references */}
        <TickerTape />

        {/* Floating Glass Island Nav */}
        <Suspense fallback={<div className="h-14" />}>
          <Navbar />
        </Suspense>

        {/* Main Application Content */}
        <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          <DisplayPreferences />
          {children}
        </main>

        {/* Global Tech Footer */}
        <Footer />
      </body>
    </html>
  );
}
