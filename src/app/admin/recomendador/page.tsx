'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Layers, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Opcao {
  id: string;
  texto: string;
}

interface Pergunta {
  id: string;
  titulo: string;
  opcoes: Opcao[];
}

export default function AdminQuizPage() {
  const [abaAtiva, setAbaAtiva] = useState<'impressoras-3d' | 'drones'>('impressoras-3d');
  const [perguntasPorCategoria, setPerguntasPorCategoria] = useState<Record<string, Pergunta[]>>({
    'impressoras-3d': [],
    'drones': [],
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarDoSupabase() {
      setLoading(true);
      try {
        const { data: dadosImp } = await supabase
          .from('configuracoes')
          .select('valor')
          .eq('chave', 'quiz_perguntas')
          .single();

        const { data: dadosDrones } = await supabase
          .from('configuracoes')
          .select('valor')
          .eq('chave', 'quiz_perguntas_drones')
          .single();

        const sanitizarDados = (dadosBrutos: any): Pergunta[] => {
          if (!dadosBrutos) return [];
          const lista = typeof dadosBrutos === 'string' ? JSON.parse(dadosBrutos) : dadosBrutos;
          if (!Array.isArray(lista)) return [];
          
          return lista.map((p: any, pIdx: number) => {
            const idValido = p && typeof p.id === 'string' && p.id.trim() !== '' 
              ? p.id 
              : `p-${Date.now()}-${pIdx}-${Math.random().toString(36).substr(2, 5)}`;
            
            const tituloValido = p && typeof p.titulo === 'string' ? p.titulo : '';
            
            const opcoesBrutas = p && Array.isArray(p.opcoes) ? p.opcoes : [];
            const opcoesValidas = opcoesBrutas.map((o: any, oIdx: number) => {
              const oIdValido = o && typeof o.id === 'string' && o.id.trim() !== '' 
                ? o.id 
                : `o-${Date.now()}-${pIdx}-${oIdx}-${Math.random().toString(36).substr(2, 5)}`;
              
              const textoValido = typeof o === 'string' 
                ? o 
                : (o && typeof o.texto === 'string' ? o.texto : '');

              return { id: oIdValido, texto: textoValido };
            });

            return {
              id: idValido,
              titulo: tituloValido,
              opcoes: opcoesValidas,
            };
          });
        };

        setPerguntasPorCategoria({
          'impressoras-3d': sanitizarDados(dadosImp?.valor),
          'drones': sanitizarDados(dadosDrones?.valor),
        });
      } catch (e) {
        console.error('Erro ao carregar do Supabase', e);
      } finally {
        setLoading(false);
      }
    }

    carregarDoSupabase();
  }, []);

  const perguntasAtuais = perguntasPorCategoria[abaAtiva] || [];

  function handleAdicionarPergunta() {
    const novaPergunta: Pergunta = {
      id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      titulo: 'Nova Pergunta do Quiz',
      opcoes: [{ id: `o-${Date.now()}-1-${Math.random().toString(36).substr(2, 9)}`, texto: 'Opção de resposta 1' }],
    };

    setPerguntasPorCategoria((prev) => ({
      ...prev,
      [abaAtiva]: [...(prev[abaAtiva] || []), novaPergunta],
    }));
  }

  function handleRemoverPergunta(idPergunta: string) {
    setPerguntasPorCategoria((prev) => ({
      ...prev,
      [abaAtiva]: prev[abaAtiva].filter((p) => p.id !== idPergunta),
    }));
  }

  function handleAtualizarTituloPergunta(idPergunta: string, novoTitulo: string) {
    setPerguntasPorCategoria((prev) => ({
      ...prev,
      [abaAtiva]: prev[abaAtiva].map((p) => (p.id === idPergunta ? { ...p, titulo: novoTitulo } : p)),
    }));
  }

  function handleAdicionarOpcao(idPergunta: string) {
    setPerguntasPorCategoria((prev) => ({
      ...prev,
      [abaAtiva]: prev[abaAtiva].map((p) => {
        if (p.id === idPergunta) {
          return {
            ...p,
            opcoes: [
              ...p.opcoes,
              { id: `o-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, texto: 'Nova opção' }
            ],
          };
        }
        return p;
      }),
    }));
  }

  function handleRemoverOpcao(idPergunta: string, idOpcao: string) {
    setPerguntasPorCategoria((prev) => ({
      ...prev,
      [abaAtiva]: prev[abaAtiva].map((p) => {
        if (p.id === idPergunta) {
          return {
            ...p,
            opcoes: p.opcoes.filter((o) => o.id !== idOpcao),
          };
        }
        return p;
      }),
    }));
  }

  function handleAtualizarTextoOpcao(idPergunta: string, idOpcao: string, novoTexto: string) {
    setPerguntasPorCategoria((prev) => ({
      ...prev,
      [abaAtiva]: prev[abaAtiva].map((p) => {
        if (p.id === idPergunta) {
          return {
            ...p,
            opcoes: p.opcoes.map((o) => (o.id === idOpcao ? { ...o, texto: novoTexto } : o)),
          };
        }
        return p;
      }),
    }));
  }

  async function handleSalvarTudo() {
    setSalvando(true);
    try {
      await supabase.from('configuracoes').upsert({
        chave: 'quiz_perguntas',
        valor: perguntasPorCategoria['impressoras-3d'],
      }, { onConflict: 'chave' });

      await supabase.from('configuracoes').upsert({
        chave: 'quiz_perguntas_drones',
        valor: perguntasPorCategoria['drones'],
      }, { onConflict: 'chave' });

      alert('Configurações do Quiz salvas com sucesso no Supabase!');
    } catch (e) {
      console.error('Erro ao salvar:', e);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans flex justify-center">
      <div className="w-full max-w-4xl space-y-4">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              Gerenciador do Quiz Recomendador
            </h1>
            <p className="text-slate-400 text-[11px] mt-0.5">
              Crie perguntas, adicione opções e salve diretamente no banco de dados.
            </p>
          </div>
          <button
            onClick={handleSalvarTudo}
            disabled={salvando}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shadow-purple-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

        {/* Abas de Categorias */}
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setAbaAtiva('impressoras-3d')}
            className={`px-4 py-2 font-bold text-xs transition-colors border-b-2 ${
              abaAtiva === 'impressoras-3d'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Impressoras 3D
          </button>
          <button
            onClick={() => setAbaAtiva('drones')}
            className={`px-4 py-2 font-bold text-xs transition-colors border-b-2 ${
              abaAtiva === 'drones'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Drones
          </button>
        </div>

        {/* Lista de Perguntas */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-200">
              Perguntas para: <span className="text-purple-400 capitalize">{abaAtiva.replace('-', ' ')}</span>
            </h2>
            <button
              onClick={handleAdicionarPergunta}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-colors border border-slate-700"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              Adicionar Nova Pergunta
            </button>
          </div>

          {perguntasAtuais.length === 0 ? (
            <div className="p-6 text-center bg-slate-950/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
              Nenhuma pergunta cadastrada para esta categoria ainda. Clique no botão acima para começar.
            </div>
          ) : (
            perguntasAtuais.map((pergunta, pIndex) => (
              <div key={pergunta.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-lg">
                
                {/* Título da Pergunta e Excluir */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                    #{pIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={pergunta.titulo}
                    onChange={(e) => handleAtualizarTituloPergunta(pergunta.id, e.target.value)}
                    placeholder="Digite o enunciado da pergunta..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs focus:border-purple-500 outline-none"
                  />
                  <button
                    onClick={() => handleRemoverPergunta(pergunta.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-red-500/20"
                    title="Excluir Pergunta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bloco de Opções */}
                <div className="pl-3 md:pl-5 space-y-2 border-l-2 border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Opções de Resposta
                  </div>

                  {pergunta.opcoes.map((opcao, oIndex) => (
                    <div key={opcao.id} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 w-5">{oIndex + 1}.</span>
                      <input
                        type="text"
                        value={opcao.texto}
                        onChange={(e) => handleAtualizarTextoOpcao(pergunta.id, opcao.id, e.target.value)}
                        placeholder="Texto da opção..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:border-purple-500 outline-none"
                      />
                      <button
                        onClick={() => handleRemoverOpcao(pergunta.id, opcao.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remover Opção"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAdicionarOpcao(pergunta.id)}
                    className="mt-1 text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 py-1 px-2 rounded hover:bg-purple-500/10 w-fit transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Opção
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}