"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, RotateCcw, ShoppingCart, MessageCircle, Loader2, Printer, Compass } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Opcao {
  texto: string;
}

interface Pergunta {
  id: number;
  titulo: string;
  opcoes: Opcao[];
}

export default function RecomendadorPage() {
  const [categoria, setCategoria] = useState<"impressoras" | "drones">("impressoras");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [orcamentoMin, setOrcamentoMin] = useState<number>(0);
  const [orcamentoMax, setOrcamentoMax] = useState<number>(999999);
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    async function carregarPerguntas() {
      setLoadingInitial(true);
      const chaveBusca = categoria === "impressoras" ? "quiz_perguntas" : "quiz_perguntas_drones";

      const { data } = await supabase
        .from("configuracoes")
        .select("valor")
        .eq("chave", chaveBusca)
        .single();

      if (data?.valor) {
        try {
          const parsed = typeof data.valor === "string" ? JSON.parse(data.valor) : data.valor;
          setPerguntas(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Erro ao converter JSON das perguntas:", e);
          setPerguntas([]);
        }
      } else {
        setPerguntas([]);
      }
      setLoadingInitial(false);
    }

    carregarPerguntas();
  }, [categoria]);

  const calcularIntervaloOrcamento = (texto: string) => {
    const t = texto.toLowerCase();

    if (t.includes("até") || t.includes("ate")) {
      if (t.includes("100")) return { min: 0, max: 100 };
      if (t.includes("2.000") || t.includes("2000")) return { min: 0, max: 2000 };
      const num = t.replace(/[^\d]/g, "");
      return { min: 0, max: num ? Number(num) : 2000 };
    }

    if (t.includes("acima de")) {
      if (t.includes("100.000")) return { min: 100000, max: 9999999 };
      const num = t.replace(/[^\d]/g, "");
      return { min: num ? Number(num) : 5000, max: 9999999 };
    }

    const numerosMatch = t.match(/\d{1,3}(?:\.\d{3})*|\d+/g);
    if (numerosMatch && numerosMatch.length >= 2) {
      const min = Number(numerosMatch[0].replace(/\./g, ""));
      const max = Number(numerosMatch[1].replace(/\./g, ""));
      return { min, max };
    }

    return { min: 0, max: 9999999 };
  };

  const handleSelect = (perguntaTitulo: string, opcaoIndex: number, respostaTexto: string) => {
    const chaveEstavel = `p${step}_opt_${opcaoIndex}`;
    const novasRespostas = { ...respostas, [perguntaTitulo]: chaveEstavel };
    setRespostas(novasRespostas);

    let min = orcamentoMin;
    let max = orcamentoMax;

    const ehPerguntaOrcamento = 
      perguntaTitulo.toLowerCase().includes("orçamento") || 
      perguntaTitulo.toLowerCase().includes("faixa") ||
      perguntaTitulo.toLowerCase().includes("quanto");

    if (ehPerguntaOrcamento) {
      const intervalo = calcularIntervaloOrcamento(respostaTexto);
      min = intervalo.min;
      max = intervalo.max;
      setOrcamentoMin(min);
      setOrcamentoMax(max);
    }

    if (step < perguntas.length) {
      setStep(step + 1);
    } else {
      enviarParaProcessamento(novasRespostas, min, max);
    }
  };

  const enviarParaProcessamento = async (dados: Record<string, string>, min: number, max: number) => {
    setLoading(true);
    setStep(perguntas.length + 1);

    try {
      const res = await fetch("/api/recomendador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          respostas: dados, 
          orcamentoMin: min, 
          orcamentoMax: max,
          tipoProduto: categoria === "impressoras" ? "Impressora 3D" : "Drone"
        }),
      });

      const data = await res.json();
      
      if (data.sucesso && data.recomendacao && data.recomendacao.id) {
        setResultado(data.recomendacao);
      } else {
        setResultado({
          nome: categoria === "impressoras" ? "Nenhuma impressora encontrada" : "Nenhum drone encontrado",
          tipo: "Aviso",
          justificativa: "Não há nenhum produto cadastrado e vinculado a esta combinação de respostas no momento.",
          linkCompra: "",
          imagem: ""
        });
      }
    } catch (err) {
      console.error(err);
      setResultado({
        nome: "Erro de Conexão",
        tipo: "Erro",
        justificativa: "Ocorreu um erro ao processar a recomendação.",
        linkCompra: "",
        imagem: ""
      });
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setStep(1);
    setResultado(null);
    setRespostas({});
    setOrcamentoMin(0);
    setOrcamentoMax(999999);
  };

  const mudarCategoria = (novaCat: "impressoras" | "drones") => {
    setCategoria(novaCat);
    reiniciar();
  };

  return (
    <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {categoria === "impressoras" ? "Assistente de Impressoras 3D" : "Assistente de Drones"}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {categoria === "impressoras" ? "Encontre a Impressora 3D Ideal" : "Encontre o Drone Ideal"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Responda às perguntas para filtrar e encontrar o modelo perfeito para você.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex bg-slate-200/80 p-1 rounded-xl gap-1.5 shadow-inner">
            <button
              onClick={() => mudarCategoria("impressoras")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                categoria === "impressoras" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" /> Impressoras 3D
            </button>
            <button
              onClick={() => mudarCategoria("drones")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                categoria === "drones" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-purple-600" /> Drones
            </button>
          </div>
        </div>

        <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
          {loadingInitial ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs font-medium text-slate-600">Carregando perguntas...</p>
            </div>
          ) : perguntas.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs font-medium text-slate-600">Nenhuma pergunta configurada para esta categoria no momento.</p>
              <p className="text-[11px] text-slate-400">Cadastre as perguntas no Painel Admin para exibi-las aqui.</p>
            </div>
          ) : (
            <>
              {step <= perguntas.length && perguntas[step - 1] && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-0.5">
                      Passo {step} de {perguntas.length}
                    </span>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {perguntas[step - 1].titulo}
                    </h2>
                  </div>

                  <div className="grid gap-2.5">
                    {perguntas[step - 1].opcoes?.map((opcao, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelect(perguntas[step - 1].titulo, idx, opcao.texto)}
                        className="w-full text-left px-4 py-3 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/30 font-semibold text-xs sm:text-sm text-slate-700 hover:text-blue-900 transition-all shadow-sm"
                      >
                        {opcao.texto}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step > perguntas.length && (
                <div className="space-y-4 text-center">
                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-xs font-medium text-slate-600">
                        Filtrando produtos com base nas suas respostas...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {resultado?.id ? "Modelo Ideal Encontrado" : "Nenhum Produto Vinculado"}
                      </div>

                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-left space-y-3">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          {resultado?.imagem && (
                            <img
                              src={resultado.imagem}
                              alt={resultado?.nome || "Produto"}
                              className="w-24 h-24 object-cover rounded-xl border border-slate-200/80 shadow-sm shrink-0"
                            />
                          )}
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                              {resultado?.tipo || "Produto Recomendado"}
                            </span>
                            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">{resultado?.nome || "Produto sem nome"}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {resultado?.justificativa}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        {resultado?.linkCompra ? (
                          <a
                            href={resultado.linkCompra}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3 px-4 rounded-xl transition shadow-sm text-xs uppercase tracking-wider"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" /> Ver Preço e Comprar
                          </a>
                        ) : null}

                        <a
                          href="https://whatsapp.com/channel/0029VbDrSu40bIdmU5sqjH2J"
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold py-3 px-4 rounded-xl transition shadow-sm text-xs uppercase tracking-wider"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Entrar no Canal de Ofertas no WhatsApp
                        </a>

                        <button
                          onClick={reiniciar}
                          className="flex items-center justify-center gap-1.5 w-full text-xs font-bold text-slate-400 hover:text-slate-700 py-1.5 transition mt-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Refazer o teste
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}