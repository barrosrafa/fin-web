"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Cockpit" },
    { href: "/acoes", label: "Ações" },
    { href: "/fiis", label: "FIIs" },
    { href: "/fundos", label: "Fundos 175" },
    { href: "/etfs", label: "ETFs" },
    { href: "/renda-fixa", label: "Renda Fixa" },
    { href: "/screener", label: "Screener" },
    { href: "/comparador", label: "Comparador" },
    { href: "/carteira", label: "Carteira" },
    { href: "/radar-ia", label: "Radar IA" },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 max-w-7xl mx-auto w-full transition-all duration-300">
      <nav className="glass-island rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f5a0] via-[#00d9f5] to-[#a855f7] p-[1.5px] flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#060709] rounded-full flex items-center justify-center">
              <span className="text-xs font-black tracking-tighter bg-gradient-to-r from-[#00f5a0] to-[#00d9f5] bg-clip-text text-transparent">
                FIN
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#f0f4f8] group-hover:text-[#00f5a0] transition-colors">
              FIN<span className="text-[#00d9f5]">·WEB</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#64748b] -mt-0.5">
              Terminal v4.0
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 select-none ${
                  isActive
                    ? "bg-white/10 text-[#00f5a0] border border-[rgba(0,245,160,0.3)] shadow-[0_0_12px_rgba(0,245,160,0.12)]"
                    : "text-[#94a3b8] hover:text-[#f0f4f8] hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right CTA / Search trigger */}
        <div className="flex items-center gap-3">
          <Link
            href="/screener"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-[#94a3b8] hover:text-white transition-all"
          >
            <svg
              className="w-3.5 h-3.5 text-[#00f5a0]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <span>Buscar Ativo</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-[#64748b] border border-white/5">
              ⌘K
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-white/5 text-[#94a3b8] hover:text-white"
            aria-label="Abrir menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl glass-island border border-white/10 animate-fade-up">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold tracking-wide text-center transition-colors ${
                    isActive
                      ? "bg-[rgba(0,245,160,0.1)] text-[#00f5a0] border border-[rgba(0,245,160,0.3)]"
                      : "bg-white/[0.03] text-[#94a3b8] hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
