import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TickerTape } from "@/components/ui/TickerTape";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { MOCK_BENCHMARKS } from "@/data/mock/marketData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIN·WEB — Terminal Avançado de Análise & Valuation",
  description:
    "Plataforma institucional de alta performance para Ações, FIIs, Fundos CVM 175, ETFs e Renda Fixa com modelos de Graham, Bazin, Brick Score e Comitê de IA.",
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
        {/* Real-time Ticker Tape */}
        <TickerTape items={MOCK_BENCHMARKS} />

        {/* Floating Glass Island Nav */}
        <Suspense fallback={<div className="h-14" />}>
          <Navbar />
        </Suspense>

        {/* Main Application Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
          {children}
        </main>

        {/* Global Tech Footer */}
        <Footer />
      </body>
    </html>
  );
}
