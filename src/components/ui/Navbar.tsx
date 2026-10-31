"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!header.current) return;
    const el = header.current;
    const resize = new ResizeObserver(() => document.documentElement.style.setProperty("--asset-nav-top", `${el.getBoundingClientRect().height + 32}px`));
    resize.observe(el);
    return () => resize.disconnect();
  }, []);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/acoes", label: "Ações" },
    { href: "/fiis", label: "FIIs" },
    { href: "/etfs", label: "ETFs B3" },
    { href: "/comparador", label: "Comparador" },
    { href: "/simulador-de-portfolios", label: "Simulador" },
    { href: "/rankings", label: "Rankings" },
    { href: "/stocks", label: "Stocks EUA" },
    { href: "/reits", label: "REITs" },
    { href: "/premium", label: "Premium Pro" },
  ];

  return (
    <CmsElement feature="ui.components/ui/Navbar.header.1"><header ref={header} className="sticky top-4 z-50 px-4 max-w-7xl mx-auto w-full transition-all duration-300">
      <CmsElement feature="ui.components/ui/Navbar.nav.2"><nav className="glass-island rounded-full px-5 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <CmsElement feature="ui.components/ui/Navbar.Link.3"><Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00f5a0] via-[#00d9f5] to-[#a855f7] p-[1.5px] flex items-center justify-center transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#060709] rounded-full flex items-center justify-center">
              <span className="text-xs font-black tracking-tighter bg-gradient-to-r from-[#00f5a0] to-[#00d9f5] bg-clip-text text-transparent"><CmsText>{"FIN"}</CmsText></span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#f0f4f8] group-hover:text-[var(--positive)] transition-colors"><CmsText>{"FIN"}</CmsText><span className="text-[#00d9f5]"><CmsText>{"·WEB"}</CmsText></span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#94a3b8] -mt-0.5"><CmsText>{"Terminal v4.0"}</CmsText></span>
          </div>
        </Link></CmsElement>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          <CmsText>{navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <CmsElement feature="ui.components/ui/Navbar.Link.4" key={link.href}><Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 select-none ${
                  isActive
                    ? "bg-white/10 text-[var(--positive)] border border-[rgba(0,245,160,0.3)] shadow-[0_0_12px_rgba(0,245,160,0.12)]"
                    : "text-[#94a3b8] hover:text-[#f0f4f8] hover:bg-white/5 border border-transparent"
                }`}
              >
                <CmsText>{link.label}</CmsText>
              </Link></CmsElement>
            );
          })}</CmsText>
        </div>

        {/* Right CTA / Search trigger */}
        <div className="flex items-center gap-3">
          <CmsElement feature="ui.components/ui/Navbar.Link.5"><Link
            href="/login"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white hover:text-cyan-400 transition-colors"
          ><CmsText>{"Entrar"}</CmsText></Link></CmsElement>
          <CmsElement feature="ui.components/ui/Navbar.Link.6"><Link
            href="/cadastro"
            className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all"
          ><CmsText>{"Cadastrar"}</CmsText></Link></CmsElement>
          <CmsElement feature="ui.components/ui/Navbar.Link.7"><Link
            href="/screener"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-[#94a3b8] hover:text-white transition-all"
          >
            <svg
              className="w-3.5 h-3.5 text-[var(--positive)]"
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
            <span><CmsText>{"Buscar Ativo"}</CmsText></span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-[#94a3b8] border border-white/5"><CmsText>{"⌘K"}</CmsText></span>
          </Link></CmsElement>

          {/* Mobile Menu Button */}
          <CmsElement feature="ui.components/ui/Navbar.button.8"><button
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
              <CmsText>{mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}</CmsText>
            </svg>
          </button></CmsElement>
        </div>
      </nav></CmsElement>

      {/* Mobile Drawer */}
      <CmsText>{mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-3xl glass-island border border-white/10 animate-fade-up">
          <div className="grid grid-cols-2 gap-2">
            <CmsText>{navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <CmsElement feature="ui.components/ui/Navbar.Link.9" key={link.href}><Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-2.5 rounded-xl text-xs font-semibold tracking-wide text-center transition-colors ${
                    isActive
                      ? "bg-[rgba(0,245,160,0.1)] text-[var(--positive)] border border-[rgba(0,245,160,0.3)]"
                      : "bg-white/[0.03] text-[#94a3b8] hover:text-white"
                  }`}
                >
                  <CmsText>{link.label}</CmsText>
                </Link></CmsElement>
              );
            })}</CmsText>
          </div>
        </div>
      )}</CmsText>
    </header></CmsElement>
  );
}
