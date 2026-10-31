"use client";


import { CmsText, CmsElement } from "@/components/content/Cms";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  getSuitabilityQuestions,
  evaluateSuitability,
  SuitabilityQuestion,
  SuitabilityEvaluateResponse,
} from "@/lib/api";

export default function PerfilInvestidorPage() {
  const [questions, setQuestions] = useState<SuitabilityQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<SuitabilityEvaluateResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const qList = await getSuitabilityQuestions();
        setQuestions(qList);
      } catch (err) {
        console.error("Failed to load suitability questions:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitEvaluation();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitEvaluation = async () => {
    try {
      const payload = Object.entries(answers).map(([qId, opId]) => ({
        id_pergunta: Number(qId),
        id_opcao_selecionada: opId,
      }));
      const res = await evaluateSuitability(payload);
      setResult(res);
    } catch (err) {
      console.error("Evaluation failed:", err);
    }
  };

  const currentQ = questions[currentStep];
  const progressPct = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="badge-neon badge-neon-indigo"><CmsText>{"Resolução CVM 30"}</CmsText></span>
          <span className="text-xs text-[#64748b]"><CmsText>{"Suitability & Score de Risco"}</CmsText></span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white"><CmsText>{"Descubra seu Perfil de Investidor"}</CmsText></h1>
        <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{"Responda ao questionário regulatório para descobrir sua tolerância a risco e receber uma alocação percentual recomendada para sua carteira."}</CmsText></p>
      </div>

      <CmsText>{loading ? (
        <CmsElement feature="ui.app/-frontend-/perfil-de-investidor/page.Card.1"><Card className="p-12 text-center text-[#64748b]"><CmsText>{"Carregando questionário..."}</CmsText></Card></CmsElement>
      ) : result ? (
        /* Result View */
        <CmsElement feature="ui.app/-frontend-/perfil-de-investidor/page.Card.2"><Card className="p-8 flex flex-col gap-8 border border-cyan-500/30 bg-[#0f172a]/90">
          <div className="text-center border-b border-white/10 pb-6">
            <Badge variant="cyan" className="mb-2"><CmsText>{"Seu Perfil Oficial"}</CmsText></Badge>
            <h2 className="text-3xl font-black text-white"><CmsText>{result.nome_categoria}</CmsText></h2>
            <p className="text-sm text-[#94a3b8] mt-2 max-w-xl mx-auto"><CmsText>{result.descricao}</CmsText></p>
            <div className="mt-4 text-xs font-mono text-cyan-400"><CmsText>{"Pontuação de Risco: "}</CmsText><span className="font-bold text-lg text-white"><CmsText>{result.score_total}</CmsText><CmsText>{"/100"}</CmsText></span>
            </div>
          </div>

          {/* Allocation Breakdown */}
          <div>
            <h3 className="text-base font-bold text-white mb-4"><CmsText>{"Alocação Alvo Recomendada"}</CmsText></h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                <span className="text-xs text-[#94a3b8]"><CmsText>{"Renda Fixa"}</CmsText></span>
                <p className="text-2xl font-black font-mono text-white mt-1">
                  <CmsText>{result.alocacao_alvo.renda_fixa}</CmsText><CmsText>{"%"}</CmsText></p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                <span className="text-xs text-[#94a3b8]"><CmsText>{"Fundos Imobiliários"}</CmsText></span>
                <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
                  <CmsText>{result.alocacao_alvo.fiis}</CmsText><CmsText>{"%"}</CmsText></p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                <span className="text-xs text-[#94a3b8]"><CmsText>{"Ações Nacionais"}</CmsText></span>
                <p className="text-2xl font-black font-mono text-cyan-400 mt-1">
                  <CmsText>{result.alocacao_alvo.acoes}</CmsText><CmsText>{"%"}</CmsText></p>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 text-center">
                <span className="text-xs text-[#94a3b8]"><CmsText>{"Internacional (USD)"}</CmsText></span>
                <p className="text-2xl font-black font-mono text-indigo-400 mt-1">
                  <CmsText>{result.alocacao_alvo.internacional}</CmsText><CmsText>{"%"}</CmsText></p>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div>
            <h3 className="text-base font-bold text-white mb-3"><CmsText>{"Diretrizes Práticas"}</CmsText></h3>
            <ul className="space-y-2">
              <CmsText>{result.recomendacoes_principais.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-[#cbd5e1]">
                  <span className="text-cyan-400 font-bold"><CmsText>{"•"}</CmsText></span>
                  <CmsText>{rec}</CmsText>
                </li>
              ))}</CmsText>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="outline" onClick={() => { setResult(null); setCurrentStep(0); setAnswers({}); }}><CmsText>{"Refazer Questionário"}</CmsText></Button>
          </div>
        </Card></CmsElement>
      ) : (
        /* Questionnaire Steps */
        <CmsElement feature="ui.app/-frontend-/perfil-de-investidor/page.Card.3"><Card className="p-8 flex flex-col gap-6 border border-white/10">
          {/* Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-[#94a3b8]">
              <span><CmsText>{"Pergunta "}</CmsText><CmsText>{currentStep + 1}</CmsText><CmsText>{" de "}</CmsText><CmsText>{questions.length}</CmsText></span>
              <span><CmsText>{Math.round(progressPct)}</CmsText><CmsText>{"% concluído"}</CmsText></span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Question Title */}
          <CmsText>{currentQ && (
            <div className="flex flex-col gap-4">
              <div>
                <span className="badge-neon badge-neon-cyan mb-2"><CmsText>{"Eixo: "}</CmsText><CmsText>{currentQ.eixo}</CmsText></span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  <CmsText>{currentQ.titulo}</CmsText>
                </h2>
                <CmsText>{currentQ.descricao && (
                  <p className="text-sm text-[#94a3b8] mt-1"><CmsText>{currentQ.descricao}</CmsText></p>
                )}</CmsText>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-3 mt-2">
                <CmsText>{currentQ.opcoes.map((opt) => {
                  const isSelected = answers[currentQ.id_pergunta] === opt.id_opcao;
                  return (
                    <CmsElement feature="ui.app/-frontend-/perfil-de-investidor/page.button.4" key={opt.id_opcao}><button
                      key={opt.id_opcao}
                      onClick={() => handleSelectOption(currentQ.id_pergunta, opt.id_opcao)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500 text-white font-semibold ring-1 ring-cyan-500/30"
                          : "bg-white/[0.02] border-white/10 text-[#cbd5e1] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-cyan-400 bg-cyan-400" : "border-[#64748b]"
                          }`}
                        >
                          <CmsText>{isSelected && <div className="w-2 h-2 rounded-full bg-black" />}</CmsText>
                        </div>
                        <span className="text-sm"><CmsText>{opt.texto}</CmsText></span>
                      </div>
                    </button></CmsElement>
                  );
                })}</CmsText>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                ><CmsText>{"Anterior"}</CmsText></Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!answers[currentQ.id_pergunta]}
                >
                  <CmsText>{currentStep === questions.length - 1 ? "Ver Meu Perfil" : "Próxima"}</CmsText>
                </Button>
              </div>
            </div>
          )}</CmsText>
        </Card></CmsElement>
      )}</CmsText>
    </div>
  );
}
