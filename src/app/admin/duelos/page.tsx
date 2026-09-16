"use client";

import React, { useState, useEffect } from "react";
import { Swords, Trash2, Edit3, Loader2, Sparkles, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Produto {
  id: string;
  nome: string;
  slug: string;
}

interface Duelo {
  id: string;
  slug: string;
  produto1_id: string;
  produto2_id: string;
  resumo_ia: string;
}

export default function AdminDuelosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [duelos, setDuelos] = useState<Duelo[]>([]);
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);

  const [produto1Id, setProduto1Id] = useState("");
  const [produto2Id, setProduto2Id] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [dueloEditandoId, setDueloEditandoId] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    
    const { data: prodData, error: prodError } = await supabase.from("produtos").select("id, nome, slug");
    if (prodData) {
      setProdutos(prodData);
    } else if (prodError) {
      console.error("Erro ao carregar produtos:", prodError.message);
    }

    const { data: duelData, error: duelError } = await supabase.from("duelos").select("*");
    if (duelData) {
      setDuelos(duelData);
    } else if (duelError) {
      console.error("Erro ao carregar duelos:", duelError.message);
    }

    setLoading(false);
  }

  const salvarOuGerarDuelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto1Id || !produto2Id) {
      alert("Selecione os dois produtos para o duelo.");
      return;
    }
    if (produto1Id === produto2Id) {
      alert("Você deve selecionar dois produtos diferentes.");
      return;
    }

    setGerando(true);
    setMensagem(dueloEditandoId ? "Atualizando duelo..." : "Gerando análise técnica via Groq...");

    try {
      if (dueloEditandoId) {
        const p1 = produtos.find(p => p.id === produto1Id);
        const p2 = produtos.find(p => p.id === produto2Id);
        const novoSlug = p1 && p2 ? `${p1.slug}-vs-${p2.slug}` : "duelo-atualizado";

        const { error } = await supabase
          .from("duelos")
          .update({
            produto1_id: produto1Id,
            produto2_id: produto2Id,
            slug: novoSlug
          })
          .eq("id", dueloEditandoId);

        if (error) throw error;

        setMensagem("Duelo atualizado com sucesso!");
        setDueloEditandoId(null);
        setProduto1Id("");
        setProduto2Id("");
        carregarDados();
      } else {
        const res = await fetch("/api/admin/gerar-duelo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ produto1Id, produto2Id }),
        });

        const data = await res.json();

        if (data.sucesso) {
          setMensagem("Duelo gerado e salvo com sucesso!");
          setProduto1Id("");
          setProduto2Id("");
          carregarDados();
        } else {
          alert("Erro ao gerar duelo: " + (data.erro || "Desconhecido"));
        }
      }
    } catch (err: any) {
      console.error("Erro na operação:", err);
      alert("Erro ao salvar o duelo: " + (err.message || "Erro desconhecido"));
    } finally {
      setGerando(false);
    }
  };

  const iniciarEdicao = (duelo: Duelo) => {
    setDueloEditandoId(duelo.id);
    setProduto1Id(duelo.produto1_id);
    setProduto2Id(duelo.produto2_id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicao = () => {
    setDueloEditandoId(null);
    setProduto1Id("");
    setProduto2Id("");
  };

  const excluirDuelo = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este duelo?")) return;

    const { error } = await supabase.from("duelos").delete().eq("id", id);
    if (!error) {
      setDuelos(duelos.filter((d) => d.id !== id));
    } else {
      alert("Erro ao excluir duelo.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans flex justify-center">
      <div className="w-full max-w-4xl space-y-4">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
              <Swords className="w-3.5 h-3.5" /> Painel Administrativo • Categoria: <span className="text-slate-200 bg-slate-800 px-1.5 py-0.5 rounded ml-1">Impressão 3D</span>
            </div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              Gerenciador de Duelos
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Selecione os dois produtos abaixo e clique no botão para gerar a análise comparativa via IA.
            </p>
          </div>
        </div>

        {/* Formulário / Configurar Confronto */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> {dueloEditandoId ? "Editar Duelo Selecionado" : "Configurar Novo Confronto"}
            </h2>
            {dueloEditandoId && (
              <button onClick={cancelarEdicao} className="text-[11px] text-rose-400 font-bold hover:underline">
                Cancelar Edição
              </button>
            )}
          </div>

          <form onSubmit={salvarOuGerarDuelo} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Produto 1 (Lado Esquerdo)</label>
                <select
                  value={produto1Id}
                  onChange={(e) => setProduto1Id(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-medium text-slate-200 focus:border-purple-500 outline-none"
                  required
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Produto 2 (Lado Direito)</label>
                <select
                  value={produto2Id}
                  onChange={(e) => setProduto2Id(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-medium text-slate-200 focus:border-purple-500 outline-none"
                  required
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={gerando}
              className="flex items-center justify-center gap-1.5 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-lg transition shadow-md shadow-purple-600/20 text-xs uppercase tracking-wide disabled:opacity-50 cursor-pointer"
            >
              {gerando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {mensagem}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> {dueloEditandoId ? "Salvar Alterações" : "Gerar Duelo"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de Duelos Cadastrados */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-lg">
          <h2 className="text-xs font-bold text-slate-200">Duelos Cadastrados ({duelos.length})</h2>

          {loading ? (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            </div>
          ) : duelos.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-4 text-center">Nenhum duelo cadastrado ainda.</p>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {duelos.map((duelo, index) => {
                const p1 = produtos.find((p) => p.id === duelo.produto1_id);
                const p2 = produtos.find((p) => p.id === duelo.produto2_id);
                return (
                  <div key={duelo.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">#{index + 1}</span>
                        <span className="text-[10px] font-semibold text-purple-400 uppercase">Slug: /{duelo.slug}</span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-200 mt-0.5">
                        {p1?.nome || "Produto 1"} <span className="text-slate-500 font-normal">vs</span> {p2?.nome || "Produto 2"}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => iniciarEdicao(duelo)}
                        className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                        title="Editar Duelo"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirDuelo(duelo.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        title="Excluir Duelo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}