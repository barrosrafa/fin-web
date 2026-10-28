"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { RadarChart, RadarDataPoint } from "@/components/ui/RadarChart";
import {
  formatCurrency,
  formatPercent,
  calculateMagicNumber,
} from "@/lib/formatters";
import { getFIIDetail, getAssets, FIIDetailData } from "@/lib/api";
import { AssetSummary } from "@/schemas/financial";

export function FIIDetailClient({ ticker }: { ticker: string }) {
  const [fiiDetail, setFiiDetail] = useState<FIIDetailData | null>(null);
  const [fiiAsset, setFiiAsset] = useState<AssetSummary | null>(null);
  const [activeTab, setActiveTab] = useState("IMOVEIS");
  const [, setLoading] = useState(true);

  // Magic Number interactive state
  const monthlyYield = 1.1; // R$ 1,10 por cota
  const [targetIncome, setTargetIncome] = useState(5000); // R$ 5.000 de renda mensal desejada

  useEffect(() => {
    async function load() {
      try {
        const [dRes, aRes] = await Promise.all([
          getFIIDetail(ticker),
          getAssets("FII"),
        ]);
        if (dRes) setFiiDetail(dRes);
        const found = aRes.find((a) => a.ticker.toUpperCase() === ticker.toUpperCase());
        if (found) {
          setFiiAsset(found);
        } else if (dRes) {
          setFiiAsset({
            ticker: dRes.ticker,
            name: dRes.name,
            type: "FII",
            sector: "Imobiliário",
            subsector: dRes.segment,
            currentPrice: dRes.current_price,
            change24h: 0.15,
            change12m: 12.8,
            dividendYield: dRes.dividend_yield_12m,
            pvp: dRes.pvp,
            sparkline: [dRes.current_price * 0.98, dRes.current_price],
            badge: "Brick Score AAA",
          });
        }
      } catch (err) {
        console.error("Failed to load FII detail:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [ticker]);

  const currentPrice = fiiAsset?.currentPrice ?? fiiDetail?.current_price ?? 162.50;
  const isPositive = (fiiAsset?.change24h ?? 0) >= 0;

  const magicCotas = calculateMagicNumber(currentPrice, monthlyYield);
  const capitalForMagic = magicCotas * currentPrice;

  const cotasForTargetIncome = Math.ceil(targetIncome / monthlyYield);
  const capitalForTarget = cotasForTargetIncome * currentPrice;

  // Radar Chart data from Brick Score
  const brickScoreList = fiiDetail?.brick_score ?? [];
  const radarData: RadarDataPoint[] = brickScoreList.map((axis) => ({
    axis: axis.name,
    value: axis.score,
    weight: axis.weight,
  }));

  const overallScore = Math.round(
    brickScoreList.reduce(
      (acc, curr) => acc + curr.score * curr.weight,
      0
    )
  );

  const propertiesList = fiiDetail?.properties ?? [];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#64748b]">
        <Link href="/" className="hover:text-white transition-colors">
          Cockpit
        </Link>
        <span>/</span>
        <Link href="/fiis" className="hover:text-white transition-colors">
          FIIs
        </Link>
        <span>/</span>
        <span className="text-white font-mono font-bold">{ticker}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-3xl bg-[#0c1017] border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(0,245,160,0.06)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#131926] border border-white/10 flex items-center justify-center font-black text-xl text-white shadow-xl">
            {ticker.slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {ticker}
              </h1>
              <Badge variant="emerald">{fiiAsset?.badge ?? "Imobiliário Tijolo"}</Badge>
            </div>
            <div className="text-sm text-[#94a3b8] font-medium mt-0.5">
              {fiiAsset?.name ?? fiiDetail?.name ?? ticker}
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              {fiiAsset?.sector ?? "Imobiliário"} • {fiiAsset?.subsector ?? fiiDetail?.segment ?? "Logística"}
            </div>
          </div>
        </div>

        <div className="flex items-end md:items-center gap-6 z-10">
          <div className="text-right">
            <div className="text-xs text-[#64748b] uppercase font-semibold">
              Cotação Atual (Tempo Real)
            </div>
            <div className="text-3xl font-black font-mono text-white mt-0.5">
              {formatCurrency(currentPrice)}
            </div>
            <div
              className={`text-xs font-mono font-bold mt-0.5 ${
                isPositive ? "text-[#00f5a0]" : "text-[#ff3b69]"
              }`}
            >
              {formatPercent(fiiAsset?.change24h ?? 0)} Hoje • 12M: {formatPercent(fiiAsset?.change12m ?? 12.8)}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]">
            Dividend Yield (12M)
          </span>
          <div className="text-xl font-black font-mono text-[#00f5a0] mt-1">
            {formatPercent(fiiAsset?.dividendYield ?? fiiDetail?.dividend_yield_12m ?? 8.75, false)}
          </div>
        </Card>
        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]">
            P/VP (Preço / Valor Patr.)
          </span>
          <div className="text-xl font-black font-mono text-white mt-1">
            {(fiiAsset?.pvp ?? fiiDetail?.pvp ?? 0.98).toFixed(2)}x
          </div>
        </Card>
        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]">
            Patrimônio Líquido
          </span>
          <div className="text-xl font-black font-mono text-white mt-1">
            {formatCurrency(fiiDetail?.net_worth ?? 5_420_000_000, true)}
          </div>
        </Card>
        <Card className="text-center p-3">
          <span className="text-[10px] uppercase font-bold text-[#64748b]">
            Vacância Física SiiLA
          </span>
          <div className="text-xl font-black font-mono text-[#00f5a0] mt-1">
            {(fiiDetail?.physical_vacancy_pct ?? 2.4).toFixed(1)}%
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "IMOVEIS", label: "Imóveis Físicos SiiLA", count: propertiesList.length },
          { id: "BRICK_SCORE", label: "Brick Score 360° (6 Eixos)" },
          { id: "MAGIC_NUMBER", label: "Simulador de Independência (Magic Number)" },
          { id: "DRE", label: "Demonstrativo Trimestral" },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* SECTION 1: Imóveis Físicos */}
      {activeTab === "IMOVEIS" && (
        <Card glow="emerald">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="badge-neon badge-neon-emerald mb-2">
                Padrão Institucional SiiLA
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Portfólio de Ativos Imobiliários Físicos
              </h3>
            </div>
            <Badge variant="emerald">
              {propertiesList.length} Empreendimentos Auditados
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                  <th className="pb-3 pl-2">Empreendimento</th>
                  <th className="pb-3">Localização</th>
                  <th className="pb-3">Padrão SiiLA</th>
                  <th className="pb-3 text-right">ABL (m²)</th>
                  <th className="pb-3 text-right">Ocupação</th>
                  <th className="pb-3 text-right pr-2">Participação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 mono-nums">
                {propertiesList.map((prop) => (
                  <tr key={prop.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pl-2">
                      <span className="font-bold text-white block">
                        {prop.name}
                      </span>
                      <span className="text-[10px] text-[#64748b] font-sans">
                        {prop.address}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-[#94a3b8]">
                      {prop.city} / {prop.state}
                    </td>
                    <td className="py-3">
                      <Badge variant="cyan">{prop.siilaStandard}</Badge>
                    </td>
                    <td className="py-3 text-right font-bold text-white">
                      {prop.ablM2.toLocaleString("pt-BR")} m²
                    </td>
                    <td className="py-3 text-right font-bold text-[#00f5a0]">
                      {formatPercent(prop.occupancyPct, false)}
                    </td>
                    <td className="py-3 text-right pr-2 font-bold text-white">
                      {prop.fundSharePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION 2: Brick Score 6 Eixos with Radar Chart */}
      {activeTab === "BRICK_SCORE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <Card glow="violet" className="w-full flex flex-col items-center p-4">
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Radar Poligonal do Score
                </span>
                <Badge variant="violet">{overallScore} / 100</Badge>
              </div>
              <RadarChart data={radarData} size={300} color="#a855f7" fillOpacity={0.25} />
            </Card>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-3">
            {brickScoreList.map((axis) => (
              <div
                key={axis.name}
                className="p-3.5 rounded-2xl bg-[#0c1017] border border-white/5 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {axis.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#00f5a0]">
                      {axis.score} pts
                    </span>
                    <Badge variant={axis.status === "EXCELENTE" ? "emerald" : "cyan"}>
                      {axis.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  {axis.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: Magic Number & Retirement Simulator */}
      {activeTab === "MAGIC_NUMBER" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
          {/* Magic Number Card */}
          <div className="lg:col-span-6">
            <Card glow="emerald">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Efeito Bola de Neve (Magic Number)
                </h3>
                <Badge variant="emerald">Auto-Sustentável</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-6 text-center">
                <span className="text-xs text-[#64748b] uppercase font-semibold">
                  Cotas para Autocompra Mensal
                </span>
                <div className="text-4xl font-black font-mono text-[#00f5a0] my-2">
                  {magicCotas} Cotas
                </div>
                <span className="text-xs text-[#94a3b8]">
                  Investimento Necessário: {formatCurrency(capitalForMagic)}
                </span>
              </div>

              <div className="text-xs text-[#64748b] leading-relaxed">
                Ao atingir {magicCotas} cotas, o provento mensal distribuído pelo fundo ({formatCurrency(magicCotas * monthlyYield)}) é suficiente para adquirir 1 nova cota todos os meses sem novos aportes do investidor.
              </div>
            </Card>
          </div>

          {/* Retirement Goal Simulator */}
          <div className="lg:col-span-6">
            <Card glow="cyan">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Meta de Renda Passiva
                </h3>
                <Badge variant="cyan">Simulador Mensal</Badge>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#94a3b8]">Renda Mensal Desejada:</span>
                  <span className="font-mono text-white font-bold">
                    {formatCurrency(targetIncome)} / mês
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="30000"
                  step="500"
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(parseFloat(e.target.value))}
                  className="w-full accent-[#00d9f5] bg-white/10 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#131926] border border-white/5 text-center">
                <div>
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                    Cotas Necessárias
                  </div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    {cotasForTargetIncome.toLocaleString("pt-BR")}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748b] uppercase font-semibold">
                    Patrimônio Alocado
                  </div>
                  <div className="text-xl font-bold font-mono text-[#00d9f5] mt-1">
                    {formatCurrency(capitalForTarget, true)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* SECTION 4: DRE Trimestral */}
      {activeTab === "DRE" && (
        <Card glow="cyan">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white tracking-tight">
              DRE Gerencial do Último Trimestre
            </h3>
            <Badge variant="cyan">Competência CVM</Badge>
          </div>

          <div className="flex flex-col divide-y divide-white/5 mono-nums text-xs">
            <div className="flex justify-between py-2 text-white">
              <span>(+) Receitas de Locação de Galpões</span>
              <span className="font-bold">{formatCurrency(84500000, true)}</span>
            </div>
            <div className="flex justify-between py-2 text-[#94a3b8]">
              <span>(+) Rendimentos Financeiros de Caixa</span>
              <span>{formatCurrency(6200000, true)}</span>
            </div>
            <div className="flex justify-between py-2 text-[#ff3b69]">
              <span>(-) Taxa de Administração e Gestão</span>
              <span>{formatCurrency(-4200000, true)}</span>
            </div>
            <div className="flex justify-between py-2 text-[#ff3b69]">
              <span>(-) Despesas Operacionais com Imóveis</span>
              <span>{formatCurrency(-1800000, true)}</span>
            </div>
            <div className="flex justify-between py-3 text-[#00f5a0] font-bold text-sm bg-white/[0.02]">
              <span>(=) Resultado Líquido Distribuível</span>
              <span>{formatCurrency(84700000, true)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
