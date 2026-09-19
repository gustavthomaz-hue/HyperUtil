'use client';

import React, { useState } from 'react';

const NICHOS_RANKINGS = [
  {
    nicho: 'Impressão 3D',
    descricaoNicho: 'Rankings de impressoras, filamentos, resinas e insumos.',
    subcategorias: [
      { nome: 'Impressoras 3D FDM', slug: 'Impressoras 3D FDM', descricao: 'As melhores impressoras de filamento' },
      { nome: 'Filamentos PLA', slug: 'Filamentos PLA', descricao: 'Top filamentos PLA com melhor fluidez' },
      { nome: 'Filamentos PETG', slug: 'Filamentos PETG', descricao: 'Opções resistentes para peças estruturais' },
      { nome: 'Impressoras 3D Resina', slug: 'Impressoras 3D Resina', descricao: 'Precisão máxima para miniaturas' },
      { nome: 'Resinas 3D', slug: 'Resinas 3D', descricao: 'Resinas padrão, laváveis em água' },
      { nome: 'Aerógrafos', slug: 'Aerógrafos', descricao: 'Materiais para pintura e acabamento' },
    ],
  },
  {
    nicho: 'Drones',
    descricaoNicho: 'Ranking de marcas e modelos de drones mais conhecidos do mercado',
    subcategorias: [
      { nome: 'Drones para Iniciantes', slug: 'Drones para Iniciantes', descricao: 'Modelos acessíveis e fáceis de pilotar' },
      { nome: 'Drones intermediários', slug: 'Drones intermediários', descricao: 'Drones para filmagens dinâmicas e de alta...' },
      { nome: 'Drones avançados', slug: 'Drones avançados', descricao: 'Para filmagens padrão cinematográfico' },
    ],
  },
];

export default function AdminRankingsPage() {
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState('');
  const [loading, setLoading] = useState(false);
  const [introducao, setIntroducao] = useState('');
  const [itensRanking, setItensRanking] = useState<any[]>([]);
  const [mensagemStatus, setMensagemStatus] = useState('');
  const [selecionados, setSelecionados] = useState<number[]>([]);

  // Função auxiliar para processar e ordenar a lista do mais barato para o mais caro
  const processarEOrdenarItens = (itensBrutos: any[]) => {
    const unicosMap = new Map();
    itensBrutos.forEach((item: any, idx: number) => {
      const chaveUnica = item.produto_id ? String(item.produto_id) : `${(item.nome || "").trim().toLowerCase()}-${idx}`;
      if (!unicosMap.has(chaveUnica)) {
        unicosMap.set(chaveUnica, item);
      }
    });

    const itensUnicos = Array.from(unicosMap.values()) as any[];

    const itensEnriquecidos = itensUnicos.map((item: any, index: number) => {
      const precoBruto = item.preco !== undefined && item.preco !== null ? item.preco : "Sob consulta";
      let precoNum = 999999;
      const nomeLower = (item.nome || "").toLowerCase();

      if (typeof precoBruto === "number") {
        precoNum = precoBruto;
      } else if (typeof precoBruto === "string" && precoBruto.toLowerCase() !== "sob consulta" && precoBruto.trim() !== "") {
        const limpo = precoBruto.replace(/[^\d,\.]/g, "").replace(/\./g, "").replace(",", ".");
        const parsed = parseFloat(limpo);
        if (!isNaN(parsed) && parsed > 0) precoNum = parsed;
      }

      if (precoNum === 999999) {
        if (nomeLower.includes("mini") || nomeLower.includes("a1 mini")) precoNum = 1500;
        else if (nomeLower.includes("ender") || nomeLower.includes("neptune 3")) precoNum = 1800;
        else if (nomeLower.includes("bambu lab a1") || nomeLower.includes("k1")) precoNum = 3200;
        else if (nomeLower.includes("creator") || nomeLower.includes("multicor") || nomeLower.includes("u1")) precoNum = 5500;
        else precoNum = 3000 + index;
      }

      return {
        ...item,
        nota: item.nota !== undefined ? item.nota : "",
        destaque: item.destaque || "",
        veredito: item.veredito || "",
        preco: precoBruto,
        precoNumerico: precoNum,
      };
    });

    // Ordenação rigorosa: Crescente (do menor preço para o maior preço)
    itensEnriquecidos.sort((a, b) => a.precoNumerico - b.precoNumerico);

    return itensEnriquecidos.map((item, index) => ({
      ...item,
      posicao: index + 1,
    }));
  };

  const moverItem = (index: number, direcao: 'cima' | 'baixo') => {
    const novoIndice = direcao === 'cima' ? index - 1 : index + 1;
    if (novoIndice < 0 || novoIndice >= itensRanking.length) return;

    const copia = [...itensRanking];
    const itemMovido = copia.splice(index, 1)[0];
    copia.splice(novoIndice, 0, itemMovido);

    const reordenado = copia.map((item, idx) => ({
      ...item,
      posicao: idx + 1,
    }));
    setItensRanking(reordenado);
  };

  const carregarRanking = async (subcat: string) => {
    setSubcategoriaSelecionada(subcat);
    setLoading(true);
    setMensagemStatus('Buscando ranking salvo...');
    setSelecionados([]);

    try {
      const res = await window.fetch(`/api/rankings/obter?subcategoria=${encodeURIComponent(subcat)}`);
      const json = await res.json();
      
      if (json.ranking && json.ranking.ranking) {
        setIntroducao(json.ranking.introducao_embate || '');
        const ordenados = processarEOrdenarItens(json.ranking.ranking);
        setItensRanking(ordenados);
      } else {
        alert('Nenhum ranking salvo encontrado para esta subcategoria. Clique em "✨ Gerar IA" para criar o primeiro.');
        setItensRanking([]);
        setIntroducao('');
      }
    } catch (err: any) {
      alert(`Erro ao carregar: ${err.message}`);
    } finally {
      setLoading(false);
      setMensagemStatus('');
    }
  };

  const gerarComIA = async (subcat: string) => {
    setSubcategoriaSelecionada(subcat);
    setLoading(true);
    setMensagemStatus('Gerando novo ranking com IA e cruzando com os produtos...');
    setSelecionados([]);

    try {
      const res = await window.fetch('/api/rankings/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategoria: subcat }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao gerar');
      
      setIntroducao(json.data.introducao_embate);
      const ordenados = processarEOrdenarItens(json.data.ranking);
      setItensRanking(ordenados);
      alert('Ranking gerado e salvo com sucesso!');
    } catch (err: any) {
      alert(`Erro ao gerar com IA: ${err.message}`);
    } finally {
      setLoading(false);
      setMensagemStatus('');
    }
  };

  const salvarAlteracoes = async () => {
    try {
      setLoading(true);
      const res = await window.fetch('/api/rankings/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategoria: subcategoriaSelecionada,
          introducao_embate: introducao,
          ranking: itensRanking,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao salvar');
      alert('Alterações e ordem dos produtos salvas com sucesso!');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removerItem = (indexParaRemover: number) => {
    if (!confirm('Tem certeza que deseja remover este produto do ranking?')) return;
    const novoRanking = itensRanking.filter((_, idx) => idx !== indexParaRemover);
    const reordenado = novoRanking.map((item, idx) => ({
      ...item,
      posicao: idx + 1,
    }));
    setItensRanking(reordenado);
    setSelecionados(selecionados.filter(i => i !== indexParaRemover).map(i => i > indexParaRemover ? i - 1 : i));
  };

  const toggleSelecionarTodos = () => {
    if (selecionados.length === itensRanking.length) {
      setSelecionados([]);
    } else {
      setSelecionados(itensRanking.map((_, idx) => idx));
    }
  };

  const toggleSelecionarItem = (index: number) => {
    if (selecionados.includes(index)) {
      setSelecionados(selecionados.filter(i => i !== index));
    } else {
      setSelecionados([...selecionados, index]);
    }
  };

  const excluirSelecionados = () => {
    if (selecionados.length === 0) return;
    if (!confirm(`Tem certeza que deseja remover os ${selecionados.length} produtos selecionados?`)) return;

    const novoRanking = itensRanking.filter((_, idx) => !selecionados.includes(idx));
    const reordenado = novoRanking.map((item, idx) => ({
      ...item,
      posicao: idx + 1,
    }));

    setItensRanking(reordenado);
    setSelecionados([]);
  };

  return (
    <div className="p-8 text-white min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🏆 Gestor Visual de Rankings (Admin)</h1>
        <p className="text-gray-400 mb-8">Selecione uma subcategoria para visualizar as miniaturas dos produtos, editar detalhes ou remover itens do ranking.</p>

        <div className="space-y-10 mb-12">
          {NICHOS_RANKINGS.map((grupo) => (
            <div key={grupo.nicho} className="bg-gray-950/60 border border-gray-800/80 p-6 rounded-2xl">
              <div className="mb-6 pb-3 border-b border-gray-800">
                <h2 className="text-2xl font-extrabold text-white tracking-wide">{grupo.nicho}</h2>
                <p className="text-sm text-gray-400">{grupo.descricaoNicho}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grupo.subcategorias.map((item) => {
                  const selecionado = subcategoriaSelecionada === item.slug;
                  return (
                    <div 
                      key={item.slug} 
                      className={`bg-gray-900 border p-5 rounded-xl flex flex-col justify-between transition-all ${
                        selecionado ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <h3 className="font-bold text-lg text-indigo-300 mb-1">{item.nome}</h3>
                        <p className="text-xs text-gray-400 mb-4">{item.descricao}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => carregarRanking(item.slug)}
                          disabled={loading}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-xs py-2 px-3 rounded font-medium transition-colors cursor-pointer"
                        >
                          Ver / Editar
                        </button>
                        <button
                          onClick={() => gerarComIA(item.slug)}
                          disabled={loading}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs py-2 px-3 rounded font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          ✨ Gerar IA
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="bg-indigo-950/40 border border-indigo-900/50 p-6 rounded-xl text-center mb-8 animate-pulse">
            <p className="text-indigo-300 font-medium">{mensagemStatus || 'Processando...'}</p>
          </div>
        )}

        {subcategoriaSelecionada && !loading && (
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-800">
              <div>
                <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Gerenciando Exibição (Ordenado por Menor Preço)</span>
                <h2 className="text-2xl font-bold">{subcategoriaSelecionada}</h2>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => gerarComIA(subcategoriaSelecionada)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-all cursor-pointer"
                >
                  ✨ Regenerar com IA
                </button>
                <button
                  onClick={salvarAlteracoes}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg transition-all text-sm cursor-pointer"
                >
                  💾 Salvar Alterações
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">Introdução do Ranking (Texto exibido no topo da página)</label>
              <textarea
                value={introducao}
                onChange={(e) => setIntroducao(e.target.value)}
                rows={3}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Barra de Ações em Massa */}
            <div className="flex justify-between items-center mb-4 bg-gray-950 p-3 rounded-lg border border-gray-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={itensRanking.length > 0 && selecionados.length === itensRanking.length}
                  onChange={toggleSelecionarTodos}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-300">
                  Selecionar Todos ({selecionados.length} de {itensRanking.length} selecionados)
                </span>
              </div>

              {selecionados.length > 0 && (
                <button
                  onClick={excluirSelecionados}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  🗑️ Excluir Selecionados ({selecionados.length})
                </button>
              )}
            </div>
            
            {itensRanking.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center bg-gray-950 rounded-lg">Nenhum produto listado neste ranking ainda. Clique em "Regenerar com IA" acima.</p>
            ) : (
              <div className="space-y-4">
                {itensRanking.map((prod, index) => {
                  const estaSelecionado = selecionados.includes(index);
                  return (
                    <div 
                      key={prod.produto_id || index} 
                      className={`bg-gray-950 border p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 transition-all ${
                        estaSelecionado ? 'border-red-500/50 bg-red-950/10' : 'border-gray-800'
                      }`}
                    >
                      {/* Checkbox de Seleção & Posição */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={estaSelecionado}
                          onChange={() => toggleSelecionarItem(index)}
                          className="w-4 h-4 accent-indigo-600 cursor-pointer"
                        />

                        {/* Botões de Mover Manualmente (▲ / ▼) */}
                        <div className="flex flex-col gap-0.5">
                          <button 
                            onClick={() => moverItem(index, 'cima')} 
                            disabled={index === 0} 
                            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                            title="Mover para cima"
                          >
                            ▲
                          </button>
                          <button 
                            onClick={() => moverItem(index, 'baixo')} 
                            disabled={index === itensRanking.length - 1} 
                            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-[10px] px-1.5 py-0.5 rounded cursor-pointer"
                            title="Mover para baixo"
                          >
                            ▼
                          </button>
                        </div>

                        <span className="bg-indigo-600 text-white font-extrabold w-10 h-10 rounded-full flex items-center justify-center text-sm shadow shrink-0">
                          #{prod.posicao || index + 1}
                        </span>
                      </div>

                      {/* Miniatura da Imagem */}
                      <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {prod.imagem ? (
                          <img src={prod.imagem} alt={prod.nome} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-500 text-center px-1">Sem foto</span>
                        )}
                      </div>

                      {/* Dados Editáveis do Produto */}
                      <div className="flex-1 space-y-2 w-full">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={prod.nome}
                            onChange={(e) => {
                              const novo = [...itensRanking];
                              novo[index].nome = e.target.value;
                              setItensRanking(novo);
                            }}
                            className="flex-1 bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-sm font-bold text-white"
                            placeholder="Nome do produto"
                          />
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs text-gray-400">Nota:</span>
                            <input
                              type="number"
                              step="0.1"
                              max="10"
                              min="0"
                              value={prod.nota !== null && prod.nota !== undefined ? prod.nota : ''}
                              onChange={(e) => {
                                const novo = [...itensRanking];
                                const val = e.target.value;
                                novo[index].nota = val === '' ? '' : parseFloat(val);
                                setItensRanking(novo);
                              }}
                              placeholder="Vazio"
                              className="w-20 bg-gray-900 border border-gray-800 rounded px-2 py-1.5 text-sm text-center text-white font-bold text-indigo-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={prod.destaque || ''}
                            onChange={(e) => {
                              const novo = [...itensRanking];
                              novo[index].destaque = e.target.value;
                              setItensRanking(novo);
                            }}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1 text-xs text-gray-300"
                            placeholder="Destaque principal..."
                          />
                          <input
                            type="text"
                            value={prod.veredito || ''}
                            onChange={(e) => {
                              const novo = [...itensRanking];
                              novo[index].veredito = e.target.value;
                              setItensRanking(novo);
                            }}
                            className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1 text-xs text-gray-300"
                            placeholder="Veredito..."
                          />
                        </div>
                      </div>

                      {/* Botão de Excluir Item Unitário */}
                      <button
                        onClick={() => removerItem(index)}
                        className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 self-end md:self-center"
                        title="Excluir este produto do ranking"
                      >
                        🗑️ Excluir
                      </button>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}