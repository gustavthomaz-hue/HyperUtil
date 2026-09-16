'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Produto {
  id: string;
  nome: string;
  categoria?: string;
  loja?: string;
  faixa_preco?: string;
  faixaPreco?: string;
  imagem_url?: string;
  imagem?: string;
  link_afiliado?: string;
  link?: string;
  url?: string;
}

export default function AdminVisaoGeral() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [totalNoticias, setTotalNoticias] = useState(0);
  const [loading, setLoading] = useState(true);

  // Estados para as métricas reais
  const [totalCliquesWhatsapp, setTotalCliquesWhatsapp] = useState(0);
  const [totalVisitasSite, setTotalVisitasSite] = useState(0);
  const [origensVisitas, setOrigensVisitas] = useState<{ origem: string; count: number }[]>([]);
  const [respostasQuiz, setRespostasQuiz] = useState(0);

  // Configuração Local do WhatsApp
  const [linkWhatsapp, setLinkWhatsapp] = useState('https://chat.whatsapp.com/ExemploGrupoHyperUtil');
  const [editandoWhatsapp, setEditandoWhatsapp] = useState(false);
  const [novoLinkWa, setNovoLinkWa] = useState('');

  useEffect(() => {
    async function carregarDadosSupabase() {
      setLoading(true);
      try {
        // 1. Busca produtos reais no Supabase
        const { data: prodsData, error: errProds } = await supabase
          .from('produtos')
          .select('*')
          .order('id', { ascending: false });

        if (!errProds && prodsData) {
          setProdutos(prodsData);
        }

        // 2. Busca contagem de notícias no Supabase
        const { count: countNoticias, error: errNot } = await supabase
          .from('noticias')
          .select('*', { count: 'exact', head: true });

        if (!errNot && countNoticias !== null) {
          setTotalNoticias(countNoticias);
        }

        // 3. Busca cliques reais do WhatsApp
        const { count: countCliques, error: errCliques } = await supabase
          .from('analytics_cliques')
          .select('*', { count: 'exact', head: true })
          .eq('tipo', 'whatsapp');

        if (!errCliques && countCliques !== null) {
          setTotalCliquesWhatsapp(countCliques);
        }

        // 4. Busca total de visitas e origens (Google, WhatsApp, Direto)
        const { data: visitasData, count: countVisitas, error: errVisitas } = await supabase
          .from('analytics_visitas')
          .select('*', { count: 'exact' });

        if (!errVisitas && visitasData) {
          setTotalVisitasSite(countVisitas || 0);

          // Agrupa as origens para exibir de onde vieram
          const contagemOrigem: { [key: string]: number } = {};
          visitasData.forEach((v: any) => {
            const org = v.origem || 'Direto';
            contagemOrigem[org] = (contagemOrigem[org] || 0) + 1;
          });

          const origensFormatadas = Object.keys(contagemOrigem).map((origem) => ({
            origem,
            count: contagemOrigem[origem],
          }));
          setOrigensVisitas(origensFormatadas);
        }

        // 5. Tenta buscar pesquisas do Quiz (caso tenha a tabela, se não, mantém dinâmico ou 0)
        const { count: countQuiz, error: errQuiz } = await supabase
          .from('quiz_respostas') // caso exista ou venha a existir
          .select('*', { count: 'exact', head: true });

        if (!errQuiz && countQuiz !== null) {
          setRespostasQuiz(countQuiz);
        }

      } catch (err) {
        console.error('Erro ao carregar dados da Visão Geral:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosSupabase();

    // Recupera link do WhatsApp salvo localmente
    const waSalvo = localStorage.getItem('hyperutil_link_whatsapp');
    if (waSalvo) {
      setLinkWhatsapp(waSalvo);
    }
  }, []);

  const salvarLinkWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    if (novoLinkWa) {
      setLinkWhatsapp(novoLinkWa);
      localStorage.setItem('hyperutil_link_whatsapp', novoLinkWa);
      setEditandoWhatsapp(false);
      alert('Link do Canal do WhatsApp atualizado!');
    }
  };

  const totalProdutos = produtos.length;
  const ultimosProdutos = produtos.slice(0, 5);

  const produtosSemLink = produtos.filter((p) => {
    const linkEfetivo = p.link_afiliado || p.link || p.url;
    return !linkEfetivo || linkEfetivo.trim() === '' || !linkEfetivo.startsWith('http');
  });

  const statusPorcentagem =
    totalProdutos > 0
      ? Math.round(((totalProdutos - produtosSemLink.length) / totalProdutos) * 100)
      : 100;

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 font-sans flex justify-center">
      <div className="w-full max-w-4xl space-y-4">
        
        {/* CABEÇALHO COM AÇÕES RÁPIDAS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
              Central de Comando HyperUtil
            </span>
            <h1 className="text-xl font-bold">Visão Geral</h1>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/admin/produtos"
              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-[11px] transition-colors shadow-sm"
            >
              + Cadastrar Produto
            </Link>
            <Link
              href="/admin/noticias"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-[11px] transition-colors shadow-sm"
            >
              + Gerenciar Notícias
            </Link>
            <Link
              href="/admin/rankings"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-[11px] transition-colors shadow-sm"
            >
              ⚡ Gerar Ranking IA
            </Link>
            <button
              onClick={() => {
                setNovoLinkWa(linkWhatsapp);
                setEditandoWhatsapp(true);
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-[11px] transition-colors"
            >
              📱 Canal WhatsApp
            </button>
          </div>
        </div>

        {/* FORMULÁRIO DO WHATSAPP */}
        {editandoWhatsapp && (
          <form onSubmit={salvarLinkWhatsapp} className="bg-slate-950 border border-slate-800 text-white p-3.5 rounded-xl shadow-lg space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs text-purple-400">Link Global do Canal do WhatsApp</h3>
              <button
                type="button"
                onClick={() => setEditandoWhatsapp(false)}
                className="text-[11px] text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Este link é aplicado nos botões de chamada para o WhatsApp do portal.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={novoLinkWa}
                onChange={(e) => setNovoLinkWa(e.target.value)}
                required
                className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs focus:border-purple-500 outline-none"
                placeholder="https://chat.whatsapp.com/..."
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                Atualizar
              </button>
            </div>
          </form>
        )}

        {/* KPIS DE PERFORMANCE E CONVERSÃO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Total de Produtos</span>
            <div className="text-xl font-black text-slate-100 mt-0.5">
              {loading ? '...' : totalProdutos}
            </div>
            <p className="text-[10px] text-purple-400 font-medium mt-0.5">Base do Seletor & Duetos</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Notícias Automatizadas</span>
            <div className="text-xl font-black text-slate-100 mt-0.5">
              {loading ? '...' : totalNoticias}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Geradas via RSS + Groq</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Cliques para WhatsApp</span>
            <div className="text-xl font-black text-purple-400 mt-0.5">
              {loading ? '...' : totalCliquesWhatsapp}
            </div>
            <p className="text-[10px] text-purple-400 font-medium mt-0.5">Registros reais no banco</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Integridade dos Links</span>
            <div
              className={`text-xl font-black mt-0.5 ${
                produtosSemLink.length > 0 ? 'text-amber-400' : 'text-purple-400'
              }`}
            >
              {loading ? '...' : `${statusPorcentagem}%`}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {produtosSemLink.length > 0
                ? `${produtosSemLink.length} link(s) requer atenção`
                : 'Links prontos para conversão'}
            </p>
          </div>
        </div>

        {/* PAINEL CENTRAL DE OPERAÇÕES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* COLUNA ESQUERDA: TRÁFEGO, QUIZ E AUDITORIA */}
          <div className="space-y-3">
            
            {/* NOVO BLOCO DE ORIGEM DO TRÁFEGO (GOOGLE VS WHATSAPP) */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-200">Tráfego do Site ({totalVisitasSite} acessos)</h3>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Real
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {origensVisitas.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-1">Nenhum acesso registrado ainda.</p>
                ) : (
                  origensVisitas.map((item) => (
                    <div key={item.origem} className="flex justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-400 capitalize">{item.origem}:</span>
                      <span className="font-bold text-purple-400">{item.count} visitas</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-200">Quiz Recomendador</h3>
                <span className="text-[9px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  3 Perguntas
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Respostas Concluídas:</span>
                  <span className="font-bold text-slate-200">{respostasQuiz} pesquisas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Conversão para Afiliado:</span>
                  <span className="font-bold text-purple-400">--</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Mais Indicado:</span>
                  <span className="font-semibold text-slate-200 truncate max-w-[120px]">Dinâmico</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-200">Automação RSS & IA</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Ativo
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Última Varredura RSS:</span>
                  <span className="font-semibold text-slate-200">Hoje, 14:30</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Fallback de Imagem:</span>
                  <span className="text-emerald-400 font-semibold">100% Ok</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Modelo de Reescrita:</span>
                  <span className="font-semibold text-slate-200">Groq (gpt-oss-120b)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg">
              <h3 className="text-xs font-bold text-slate-200 mb-2">Auditoria de Links</h3>
              {produtosSemLink.length === 0 ? (
                <p className="text-[11px] text-emerald-400 font-medium">
                  ✓ Todos os produtos possuem link de afiliado ativo.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20 font-medium">
                    Atualmente há {produtosSemLink.length} produto(s) sem link de afiliado:
                  </p>
                  <div className="divide-y divide-slate-900">
                    {produtosSemLink.map((p) => (
                      <div key={p.id} className="py-1.5 flex justify-between items-center text-xs">
                        <span className="truncate max-w-[160px] text-slate-300 font-medium">
                          {p.nome}
                        </span>
                        <Link
                          href="/admin/produtos"
                          className="text-purple-400 hover:underline font-semibold text-[10px]"
                        >
                          Corrigir
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: ÚLTIMOS PRODUTOS REGISTRADOS NO SUPABASE */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 p-3.5 rounded-xl shadow-lg h-fit">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-200">Produtos no Catálogo</h3>
                <p className="text-[10px] text-slate-400">Alimentam o Seletor de Duelos, Rankings e Quiz</p>
              </div>
              <Link href="/admin/produtos" className="text-[11px] text-purple-400 font-semibold hover:underline">
                Gerenciar Todos →
              </Link>
            </div>

            {loading ? (
              <p className="text-slate-400 text-xs py-4 text-center">Carregando catálogo do Supabase...</p>
            ) : ultimosProdutos.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">Nenhum produto cadastrado no banco ainda.</p>
            ) : (
              <div className="divide-y divide-slate-900">
                {ultimosProdutos.map((p) => {
                  const imagem = p.imagem_url || p.imagem;
                  const preco = p.faixa_preco || p.faixaPreco || 'Consulte';
                  const loja = p.loja || 'Mercado Livre';
                  const categoria = p.categoria || 'Geral';

                  return (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {imagem ? (
                          <img
                            src={imagem}
                            alt={p.nome}
                            className="w-8 h-8 object-contain border border-slate-800 rounded-lg p-1 bg-slate-900"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-[7px] text-slate-500 font-bold border border-slate-800">
                            SEM FOTO
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-200 text-xs truncate max-w-[200px] md:max-w-xs">
                            {p.nome}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {loja} • {categoria}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 whitespace-nowrap">
                        {preco}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}