"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatters";
import { getBrokers, BrokerItem } from "@/lib/api";

export default function CorretorasPage() {
  const [brokers, setBrokers] = useState<BrokerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterIntl, setFilterIntl] = useState<"ALL" | "NACIONAL" | "INTERNACIONAL">("ALL");

  useEffect(() => {
    async function load() {
      try {
        const data = await getBrokers();
        setBrokers(data);
      } catch (err) {
        console.error("Failed to load brokers:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = brokers.filter((b) => {
    if (filterIntl === "NACIONAL") return !b.is_internacional;
    if (filterIntl === "INTERNACIONAL") return b.is_internacional;
    return true;
  });

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-cyan"><CmsText>{"Custos Operacionais"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"B3, CVM & SEC"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Comparador de Corretoras"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1 max-w-2xl"><CmsText>{"Compare custos de corretagem para ações, FIIs e opções, taxa de custódia mensal, spread cambial sobre PTAX para investimentos no exterior e plataformas suportadas."}</CmsText></p>
      </div>

      {/* Filter Tabs */}
      <CmsElement feature="ui.app/-frontend-/corretoras/page.Card.1"><Card className="flex items-center gap-2 p-3">
        <CmsText>{(["ALL", "NACIONAL", "INTERNACIONAL"] as const).map((tab) => (
          <CmsElement feature="ui.app/-frontend-/corretoras/page.button.2" key={tab}><button
            key={tab}
            onClick={() => setFilterIntl(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              filterIntl === tab
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-[#94a3b8] hover:text-white"
            }`}
          >
            <CmsText>{tab === "ALL" ? "Todas as Corretoras" : tab === "NACIONAL" ? "Nacionais (B3)" : "Internacionais (EUA)"}</CmsText>
          </button></CmsElement>
        ))}</CmsText>
      </Card></CmsElement>

      {/* Brokers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CmsText>{loading ? (
          <div className="col-span-2 py-12 text-center text-[#64748b]"><CmsText>{"Carregando corretoras..."}</CmsText></div>
        ) : (
          filtered.map((b) => (
            <CmsElement feature="ui.app/-frontend-/corretoras/page.Card.3" key={b.id}><Card key={b.id} className="p-6 flex flex-col justify-between gap-6 border border-white/10 hover:border-cyan-500/40 transition-all">
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white"><CmsText>{b.nome}</CmsText></h3>
                    <span className="text-xs text-[#64748b] font-mono"><CmsText>{"CNPJ: "}</CmsText><CmsText>{b.cnpj}</CmsText></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CmsText>{b.is_internacional && (
                      <Badge variant="indigo"><CmsText>{"Global / EUA"}</CmsText></Badge>
                    )}</CmsText>
                    <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold"><CmsText>{"★ "}</CmsText><CmsText>{b.ratings.nota_geral.toFixed(2)}</CmsText>
                    </div>
                  </div>
                </div>

                {/* Tariffs Matrix */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[#94a3b8] block"><CmsText>{"Corretagem Ações"}</CmsText></span>
                    <span className="font-mono font-bold text-white">
                      <CmsText>{b.costs.taxa_acoes === 0 ? "Taxa Zero" : formatCurrency(b.costs.taxa_acoes)}</CmsText>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[#94a3b8] block"><CmsText>{"Corretagem FIIs"}</CmsText></span>
                    <span className="font-mono font-bold text-white">
                      <CmsText>{b.costs.taxa_fiis === 0 ? "Taxa Zero" : formatCurrency(b.costs.taxa_fiis)}</CmsText>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[#94a3b8] block"><CmsText>{"Custódia Mensal"}</CmsText></span>
                    <span className="font-mono font-bold text-white">
                      <CmsText>{b.costs.custodia_mensal === 0 ? "Isento" : formatCurrency(b.costs.custodia_mensal)}</CmsText>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[#94a3b8] block"><CmsText>{"Spread Câmbio PTAX"}</CmsText></span>
                    <span className="font-mono font-bold text-cyan-400">
                      <CmsText>{b.costs.spread_cambial_ptax_pct > 0
                        ? `${b.costs.spread_cambial_ptax_pct}%`
                        : "Não operado"}</CmsText>
                    </span>
                  </div>
                </div>

                {/* Supported Platforms */}
                <div>
                  <span className="text-xs text-[#94a3b8] block mb-1.5"><CmsText>{"Plataformas Disponíveis:"}</CmsText></span>
                  <div className="flex flex-wrap gap-1.5">
                    <CmsText>{b.plataformas_suportadas.map((plat) => (
                      <span
                        key={plat}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-[#cbd5e1]"
                      >
                        <CmsText>{plat}</CmsText>
                      </span>
                    ))}</CmsText>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-[#64748b]">
                  <CmsText>{b.ratings.total_avaliacoes}</CmsText><CmsText>{" avaliações verificadas"}</CmsText></span>
                <Button variant="outline"><CmsText>{"Ver Análise Completa"}</CmsText></Button>
              </div>
            </Card></CmsElement>
          ))
        )}</CmsText>
      </div>
    </div>
  );
}
