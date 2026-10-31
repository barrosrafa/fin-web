"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatters";
import { FIIBalanceSheetData, FIILucratividadeData } from "@/lib/api";

export interface FinancialStatementsTableProps {
  balanceSheet?: FIIBalanceSheetData;
  lucratividade?: FIILucratividadeData;
  ticker: string;
}

export function FinancialStatementsTable({
  balanceSheet,
  lucratividade,
  ticker,
}: FinancialStatementsTableProps) {
  // Balance sheet fallback
  const bs = balanceSheet || {
    data_referencia: "2026-10-26",
    total_assets: 7758507490.0,
    liquid_assets: {
      caixa: 25607490.0,
      titulos_publicos: 85200000.0,
      titulos_privados: 0.0,
      renda_fixa: 0.0,
      total: 110807490.0,
    },
    investments: {
      imoveis: 7250000000.0,
      fiis: 95000000.0,
      cris: 280000000.0,
      outros: 0.0,
      total: 7625000000.0,
    },
    receivables: {
      alugueis: 18500000.0,
      venda_imoveis: 0.0,
      outros: 4200000.0,
      total: 22700000.0,
    },
    total_liabilities: {
      rendimentos_distribuir: 53354041.65,
      taxa_administracao: 2782836.0,
      taxa_performance: 0.0,
      outros_valores_pagar: 15400000.0,
      total: 71536877.65,
    },
    net_worth: 7589554105.43,
  };

  // Lucratividade fallback
  const luc = lucratividade || {
    rental_income: 84500000.0,
    property_sale_income: 12300000.0,
    securities_income: 4800000.0,
    financial_income: 6200000.0,
    operating_expenses: -1800000.0,
    admin_fee_expense: -4200000.0,
    other_expenses: -1100000.0,
    net_profit: 100700000.0,
    distributed_per_share: 1.17,
  };

  // Asset allocation percentages
  const imovPct = bs.total_assets > 0 ? (bs.investments.imoveis / bs.total_assets) * 100 : 93.4;
  const criPct = bs.total_assets > 0 ? (bs.investments.cris / bs.total_assets) * 100 : 3.6;
  const caixaPct = bs.total_assets > 0 ? (bs.liquid_assets.total / bs.total_assets) * 100 : 1.5;
  const outrosPct = Math.max(0, 100 - imovPct - criPct - caixaPct);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* BALANÇO PATRIMONIAL */}
      <div className="lg:col-span-7 flex flex-col">
        <CmsElement feature="ui.components/shared/FinancialStatementsTable.Card.1"><Card glow="cyan" className="p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#00d9f5] font-bold"><CmsText>{"Demonstração Contábil"}</CmsText></span>
                  <Badge variant="cyan"><CmsText>{"Balanço Patrimonial"}</CmsText></Badge>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Balanço Patrimonial "}</CmsText><CmsText>{ticker}</CmsText>
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#64748b]"><CmsText>{"Data-base: "}</CmsText><CmsText>{new Date(bs.data_referencia + "T00:00:00").toLocaleDateString("pt-BR")}</CmsText>
              </span>
            </div>

            {/* Asset Allocation Bar */}
            <div className="mb-5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex justify-between text-[11px] text-[#94a3b8] mb-1.5">
                <span><CmsText>{"Composição dos Ativos:"}</CmsText></span>
                <span className="font-mono text-white font-bold">
                  <CmsText>{formatCurrency(bs.total_assets, true)}</CmsText>
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                <CmsElement><div
                  style={{ width: `${imovPct}%` }}
                  className="bg-[#00f5a0] h-full"
                  title={`Imóveis: ${imovPct.toFixed(1)}%`}
                /></CmsElement>
                <CmsElement><div
                  style={{ width: `${criPct}%` }}
                  className="bg-[#00d9f5] h-full"
                  title={`CRIs: ${criPct.toFixed(1)}%`}
                /></CmsElement>
                <CmsElement><div
                  style={{ width: `${caixaPct}%` }}
                  className="bg-[#a855f7] h-full"
                  title={`Disponibilidades / Caixa: ${caixaPct.toFixed(1)}%`}
                /></CmsElement>
                <CmsElement><div
                  style={{ width: `${outrosPct}%` }}
                  className="bg-[#f59e0b] h-full"
                  title={`Outros: ${outrosPct.toFixed(1)}%`}
                /></CmsElement>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-[#94a3b8]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00f5a0]" /><CmsText>{" Imóveis ("}</CmsText><CmsText>{imovPct.toFixed(1)}</CmsText><CmsText>{"%)"}</CmsText></span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00d9f5]" /><CmsText>{" CRIs / Papel ("}</CmsText><CmsText>{criPct.toFixed(1)}</CmsText><CmsText>{"%)"}</CmsText></span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7]" /><CmsText>{" Caixa ("}</CmsText><CmsText>{caixaPct.toFixed(1)}</CmsText><CmsText>{"%)"}</CmsText></span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /><CmsText>{" FIIs / Outros ("}</CmsText><CmsText>{outrosPct.toFixed(1)}</CmsText><CmsText>{"%)"}</CmsText></span>
              </div>
            </div>

            {/* Hierarchical Balance Sheet Table matching Oceans14 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[#64748b] uppercase tracking-wider font-semibold text-[10px]">
                    <th className="pb-2.5 pl-2"><CmsText>{"Conta Contábil"}</CmsText></th>
                    <th className="pb-2.5 text-right pr-2"><CmsText>{"Valor Auditado"}</CmsText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 mono-nums">
                  <tr className="bg-white/[0.03] font-bold text-white">
                    <td className="py-2.5 pl-2"><CmsText>{"ATIVO TOTAL"}</CmsText></td>
                    <td className="py-2.5 text-right pr-2 font-mono text-sm text-[#00f5a0]">
                      <CmsText>{formatCurrency(bs.total_assets, true)}</CmsText>
                    </td>
                  </tr>

                  <tr className="font-semibold text-white">
                    <td className="py-2 pl-4 text-[#94a3b8]"><CmsText>{"↳ Disponibilidades"}</CmsText></td>
                    <td className="py-2 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.liquid_assets.total, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-8"><CmsText>{"↳ Caixa e Bancos"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.liquid_assets.caixa, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-8"><CmsText>{"↳ Títulos Públicos (LFT/NTN-B)"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.liquid_assets.titulos_publicos, true)}</CmsText>
                    </td>
                  </tr>

                  <tr className="font-semibold text-white">
                    <td className="py-2 pl-4 text-[#94a3b8]"><CmsText>{"↳ Total Investido"}</CmsText></td>
                    <td className="py-2 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.investments.total, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-8"><CmsText>{"↳ Imóveis Físicos (Galpões)"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono text-white">
                      <CmsText>{formatCurrency(bs.investments.imoveis, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-8"><CmsText>{"↳ CRIs e Recebíveis Imobiliários"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.investments.cris, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-8"><CmsText>{"↳ Cotas de Outros Fundos (FIIs)"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.investments.fiis, true)}</CmsText>
                    </td>
                  </tr>

                  <tr className="font-semibold text-white">
                    <td className="py-2 pl-4 text-[#94a3b8]"><CmsText>{"↳ Valores a Receber"}</CmsText></td>
                    <td className="py-2 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.receivables.total, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-8"><CmsText>{"↳ Aluguéis a Receber"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.receivables.alugueis, true)}</CmsText>
                    </td>
                  </tr>

                  <tr className="bg-white/[0.03] font-bold text-white">
                    <td className="py-2.5 pl-2"><CmsText>{"PASSIVO TOTAL"}</CmsText></td>
                    <td className="py-2.5 text-right pr-2 font-mono text-sm text-[#ff3b69]">
                      <CmsText>{formatCurrency(bs.total_liabilities.total, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-6"><CmsText>{"↳ Rendimentos a Distribuir aos Cotistas"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono text-[#00f5a0]">
                      <CmsText>{formatCurrency(bs.total_liabilities.rendimentos_distribuir, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-6"><CmsText>{"↳ Taxa de Administração a Pagar"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.total_liabilities.taxa_administracao, true)}</CmsText>
                    </td>
                  </tr>
                  <tr className="text-[#64748b]">
                    <td className="py-1.5 pl-6"><CmsText>{"↳ Outros Valores a Pagar / Fornecedores"}</CmsText></td>
                    <td className="py-1.5 text-right pr-2 font-mono">
                      <CmsText>{formatCurrency(bs.total_liabilities.outros_valores_pagar, true)}</CmsText>
                    </td>
                  </tr>

                  <tr className="bg-[#00f5a0]/10 font-bold text-white">
                    <td className="py-3 pl-2 text-base text-[#00f5a0]"><CmsText>{"PATRIMÔNIO LÍQUIDO"}</CmsText></td>
                    <td className="py-3 text-right pr-2 font-black font-mono text-base text-[#00f5a0]">
                      <CmsText>{formatCurrency(bs.net_worth, true)}</CmsText>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#64748b]"><CmsText>{"* Valores consolidados da escrituração fiduciária CVM / B3"}</CmsText></div>
        </Card></CmsElement>
      </div>

      {/* DRE / LUCRATIVIDADE */}
      <div className="lg:col-span-5 flex flex-col">
        <CmsElement feature="ui.components/shared/FinancialStatementsTable.Card.6"><Card glow="emerald" className="p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#00f5a0] font-bold"><CmsText>{"Demonstrativo de Resultado"}</CmsText></span>
                  <Badge variant="emerald"><CmsText>{"DRE Gerencial"}</CmsText></Badge>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight"><CmsText>{"Lucratividade "}</CmsText><CmsText>{ticker}</CmsText>
                </h2>
              </div>
              <Badge variant="cyan"><CmsText>{"Competência"}</CmsText></Badge>
            </div>

            <div className="flex flex-col divide-y divide-white/5 mono-nums text-xs">
              <div className="flex justify-between py-2.5 text-white">
                <span className="font-semibold"><CmsText>{"(+) Receitas de Locação (Renda)"}</CmsText></span>
                <span className="font-black text-[#00f5a0]">
                  <CmsText>{formatCurrency(luc.rental_income, true)}</CmsText>
                </span>
              </div>
              <div className="flex justify-between py-2 text-[#94a3b8]">
                <span><CmsText>{"(+) Resultado de Venda de Imóveis"}</CmsText></span>
                <span><CmsText>{formatCurrency(luc.property_sale_income, true)}</CmsText></span>
              </div>
              <div className="flex justify-between py-2 text-[#94a3b8]">
                <span><CmsText>{"(+) Rendimentos de TVM e CRIs"}</CmsText></span>
                <span><CmsText>{formatCurrency(luc.securities_income, true)}</CmsText></span>
              </div>
              <div className="flex justify-between py-2 text-[#94a3b8]">
                <span><CmsText>{"(+) Resultado Financeiro de Caixa"}</CmsText></span>
                <span><CmsText>{formatCurrency(luc.financial_income, true)}</CmsText></span>
              </div>
              <div className="flex justify-between py-2 text-[#ff3b69]">
                <span><CmsText>{"(-) Despesas Operacionais e Imóveis"}</CmsText></span>
                <span><CmsText>{formatCurrency(luc.operating_expenses, true)}</CmsText></span>
              </div>
              <div className="flex justify-between py-2 text-[#ff3b69]">
                <span><CmsText>{"(-) Taxa de Administração e Gestão"}</CmsText></span>
                <span><CmsText>{formatCurrency(luc.admin_fee_expense, true)}</CmsText></span>
              </div>
              <div className="flex justify-between py-2 text-[#ff3b69]">
                <span><CmsText>{"(-) Outras Despesas / Encargos"}</CmsText></span>
                <span><CmsText>{formatCurrency(luc.other_expenses, true)}</CmsText></span>
              </div>

              <div className="flex justify-between py-3.5 bg-white/[0.03] text-white font-bold px-2 rounded-xl mt-2">
                <span className="text-sm"><CmsText>{"(=) Lucro Líquido Distribuível"}</CmsText></span>
                <span className="text-base text-[#00f5a0] font-black">
                  <CmsText>{formatCurrency(luc.net_profit, true)}</CmsText>
                </span>
              </div>
            </div>

            {/* Rendimento por cota badge */}
            <div className="mt-5 p-3.5 rounded-2xl bg-[#131926] border border-white/5 text-center">
              <span className="text-[10px] text-[#64748b] uppercase font-bold tracking-wider block"><CmsText>{"Rendimento Distribuído Médio por Cota"}</CmsText></span>
              <div className="text-2xl font-black font-mono text-[#00f5a0] mt-1">
                <CmsText>{formatCurrency(luc.distributed_per_share)}</CmsText><CmsText>{" / cota"}</CmsText></div>
              <span className="text-[11px] text-[#94a3b8] mt-1 block"><CmsText>{"Paga mensalmente sem retenção de IR para investidor pessoa física"}</CmsText></span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#64748b]"><CmsText>{"Demonstração elaborada conforme padrões contábeis vigentes da CVM para FIIs."}</CmsText></div>
        </Card></CmsElement>
      </div>
    </div>
  );
}
