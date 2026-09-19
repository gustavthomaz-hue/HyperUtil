'use client';
import { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Produto {
  id?: string;
  nome: string;
  marca?: string;
  categoria?: string;
  subcategoria: string;
  loja: string;
  faixa_preco: string;
  imagem_url?: string;
  link_afiliado: string;
  opcao_vinculada?: string;
  ativo?: boolean;
  destacado?: boolean;
  volume_impressao?: string;
  velocidade_maxima?: string;
  temperatura_bico?: string;
  nivelamento?: string;
  conectividade?: string;
}

const nichosConfig: Record<string, { label: string; slug: string }[]> = {
  "Impressão 3D": [
    { label: "Impressora 3D FDM", slug: "impressoras-3d-fdm" },
    { label: "Impressora 3D Resina", slug: "impressoras-3d-resina" },
    { label: "Filamento PLA", slug: "filamentos-pla" },
    { label: "Filamento PETG", slug: "filamentos-petg" },
    { label: "Resina 3D", slug: "resinas-3d" },
    { label: "Aerógrafos", slug: "aerografos" }
  ],
  "Drones": [
    { label: "Drones para Iniciantes", slug: "drones-para-iniciantes" },
    { label: "Drones Intermediários", slug: "drones-intermediarios" },
    { label: "Drones Avançados", slug: "drones-avancados" },
  ]
};

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [extraindo, setExtraindo] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [opcoesQuizPorNicho, setOpcoesQuizPorNicho] = useState<Record<string, { idChave: string; pergunta: string; opcao: string }[]>>({
    "Impressão 3D": [],
    "Drones": []
  });

  const [nichoSelecionado, setNichoSelecionado] = useState<string>("Impressão 3D");
  const [abaListagemNicho, setAbaListagemNicho] = useState<string>("Impressão 3D");

  const [subcategoriasAbertas, setSubcategoriasAbertas] = useState<Record<string, boolean>>({
    "impressoras-3d-fdm": true,
    "impressoras-3d-resina": true,
    "filamentos-pla": true,
    "filamentos-petg": true,
    "resinas-3d": true,
    "aerografos": true,
    "drones-para-iniciantes": true,
    "drones-intermediarios": true,
    "drones-avancados": true,
  });

  const [form, setForm] = useState<Produto>({
    id: '',
    nome: '',
    marca: '',
    categoria: 'Impressão 3D',
    subcategoria: 'impressoras-3d-fdm',
    loja: 'Mercado Livre',
    faixa_preco: 'R$ 1.000 - R$ 2.500',
    imagem_url: '',
    link_afiliado: '',
    opcao_vinculada: '',
    destacado: false,
    volume_impressao: '',
    velocidade_maxima: '',
    temperatura_bico: '',
    nivelamento: '',
    conectividade: '',
  });

  useEffect(() => {
    carregarProdutos();
    carregarOpcoesQuizDoSupabase();
  }, []);

  async function carregarProdutos() {
    setLoading(true);
    try {
      const res = await fetch('/api/produtos');
      const data = await res.json();
      if (Array.isArray(data)) setProdutos(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarOpcoesQuizDoSupabase() {
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

      const processarPerguntas = (dadosBrutos: any) => {
        if (!dadosBrutos) return [];
        const lista = typeof dadosBrutos === 'string' ? JSON.parse(dadosBrutos) : dadosBrutos;
        if (!Array.isArray(lista)) return [];
        
        const resultado: { idChave: string; pergunta: string; opcao: string }[] = [];
        lista.forEach((p: any, pIndex: number) => {
          const tituloPergunta = p?.titulo || '';
          const opcoes = Array.isArray(p?.opcoes) ? p.opcoes : [];
          opcoes.forEach((o: any, oIndex: number) => {
            const textoOpcao = typeof o === 'string' ? o : (o?.texto || '');
            if (tituloPergunta && textoOpcao) {
              resultado.push({
                idChave: `p${pIndex + 1}_opt_${oIndex}`,
                pergunta: tituloPergunta,
                opcao: textoOpcao
              });
            }
          });
        });
        return resultado;
      };

      setOpcoesQuizPorNicho({
        "Impressão 3D": processarPerguntas(dadosImp?.valor),
        "Drones": processarPerguntas(dadosDrones?.valor),
      });
    } catch (e) {
      console.error('Erro ao buscar perguntas do Supabase', e);
    }
  }

  async function handleExtrairComIA() {
    if (!form.nome && !form.link_afiliado) {
      alert('Digite o nome do produto ou insira o link de afiliado para preencher com IA.');
      return;
    }
    setExtraindo(true);
    try {
      const urlParaExtrair = form.link_afiliado || form.nome;
      const res = await fetch('/api/extrair-produto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlParaExtrair }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro na extração');
      if (json.dados) {
        setForm((prev) => ({
          ...prev,
          nome: json.dados.nome || prev.nome,
          marca: json.dados.marca || prev.marca,
          loja: json.dados.loja || prev.loja,
          subcategoria: json.dados.subcategoria || prev.subcategoria,
          faixa_preco: json.dados.faixa_preco || prev.faixa_preco,
          imagem_url: json.dados.imagem_url || prev.imagem_url,
          volume_impressao: json.dados.volume_impressao || json.dados.volume || prev.volume_impressao,
          velocidade_maxima: json.dados.velocidade_maxima || json.dados.velocidade || prev.velocidade_maxima,
          temperatura_bico: json.dados.temperatura_bico || json.dados.temperatura || prev.temperatura_bico,
          nivelamento: json.dados.nivelamento || prev.nivelamento,
          conectividade: json.dados.conectividade || prev.conectividade,
        }));
      }
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setExtraindo(false);
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome && !form.link_afiliado) {
      alert('Preencha pelo menos o Nome ou o Link de Afiliado.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          destacado: Boolean(form.destacado)
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro desconhecido ao salvar');

      setForm({
        id: '',
        nome: '',
        marca: '',
        categoria: 'Impressão 3D',
        subcategoria: 'impressoras-3d-fdm',
        loja: 'Mercado Livre',
        faixa_preco: 'R$ 1.000 - R$ 2.500',
        imagem_url: '',
        link_afiliado: '',
        opcao_vinculada: '',
        destacado: false,
        volume_impressao: '',
        velocidade_maxima: '',
        temperatura_bico: '',
        nivelamento: '',
        conectividade: '',
      });
      setNichoSelecionado('Impressão 3D');
      await carregarProdutos();
      alert('Produto salvo com sucesso!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletar(id?: string) {
    if (!id) return;
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      await fetch(`/api/produtos?id=${id}`, { method: 'DELETE' });
      await carregarProdutos();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEditar(p: Produto) {
    let nichoEncontrado = 'Impressão 3D';
    for (const [nicho, subs] of Object.entries(nichosConfig)) {
      if (subs.some((s) => s.slug === p.subcategoria)) {
        nichoEncontrado = nicho;
        break;
      }
    }
    setNichoSelecionado(nichoEncontrado);
    setForm({
      id: p.id || '',
      nome: p.nome,
      marca: p.marca || '',
      categoria: nichoEncontrado,
      subcategoria: p.subcategoria || nichosConfig[nichoEncontrado][0].slug,
      loja: p.loja || 'Mercado Livre',
      faixa_preco: p.faixa_preco || 'R$ 1.000 - R$ 2.500',
      imagem_url: p.imagem_url || '',
      link_afiliado: p.link_afiliado || '',
      opcao_vinculada: p.opcao_vinculada || '',
      destacado: p.destacado ?? false,
      volume_impressao: p.volume_impressao || '',
      velocidade_maxima: p.velocidade_maxima || '',
      temperatura_bico: p.temperatura_bico || '',
      nivelamento: p.nivelamento || '',
      conectividade: p.conectividade || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const subcategoriasAtuais = nichosConfig[nichoSelecionado] || [];
  const opcoesQuizAtuais = opcoesQuizPorNicho[nichoSelecionado] || [];
  const subcatLower = (form.subcategoria || '').toLowerCase();
  const ehImpressora3D = subcatLower.includes('fdm') || subcatLower.includes('resina') || subcatLower.includes('impressora');

  function toggleGaveta(slug: string) {
    setSubcategoriasAbertas(prev => ({ ...prev, [slug]: !prev[slug] }));
  }

  const subcatsDaAba = nichosConfig[abaListagemNicho] || [];

  const pertenceAGaveta = (p: Produto, slugConfig: string) => {
    const subProd = (p.subcategoria || '').trim().toLowerCase();
    const subConfig = slugConfig.trim().toLowerCase();
    const nomeProd = (p.nome || '').toLowerCase();

    if (subProd === subConfig) {
      if (subConfig.includes('impressoras-3d-fdm') && (nomeProd.includes('filamento') || subProd.includes('filamento'))) return false;
      if (subConfig.includes('filamentos') && (nomeProd.includes('impressora'))) return false;
      return true;
    }
    if (subConfig.includes('impressoras-3d-fdm') && (subProd.includes('fdm') || subProd.includes('impressora') || !subProd)) {
      if (nomeProd.includes('filamento') || nomeProd.includes('resina')) return false;
      return true;
    }
    if (!subProd && nichosConfig[abaListagemNicho]?.[0]?.slug === slugConfig) {
      return true;
    }
    if (subProd.includes(subConfig) || subConfig.includes(subProd)) {
      return true;
    }
    return false;
  };

  const produtosFiltrados = produtos.filter(p => {
    if (!termoBusca.trim()) return true;
    const termo = termoBusca.toLowerCase();
    const nome = (p.nome || '').toLowerCase();
    const marca = (p.marca || '').toLowerCase();
    const loja = (p.loja || '').toLowerCase();
    return nome.includes(termo) || marca.includes(termo) || loja.includes(termo);
  });

  // Funções para manipular múltiplos vínculos via Checkbox
  const listaOpcoesSelecionadas = form.opcao_vinculada ? form.opcao_vinculada.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleOpcaoQuiz = (idChave: string) => {
    let atualizados = [...listaOpcoesSelecionadas];
    if (atualizados.includes(idChave)) {
      atualizados = atualizados.filter(item => item !== idChave);
    } else {
      atualizados.push(idChave);
    }
    setForm({ ...form, opcao_vinculada: atualizados.join(', ') });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-2 md:p-4 flex justify-center">
      <div className="w-full max-w-6xl space-y-4">
        
        <form onSubmit={handleSalvar} className="bg-slate-950 rounded-xl p-3 md:p-5 shadow-lg border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
              {form.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Painel de gerenciamento compacto com suporte a múltiplos vínculos no quiz.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Nome do Produto *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Bambu Lab A1 Mini"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleExtrairComIA}
                  disabled={extraindo}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-lg text-[11px] transition-colors flex items-center gap-1 whitespace-nowrap shadow-sm shadow-purple-900/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {extraindo ? 'Lendo...' : 'IA'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Marca</label>
              <input
                type="text"
                placeholder="Ex: Bambu Lab, Creality"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Nicho Principal *</label>
              <select
                value={nichoSelecionado}
                onChange={(e) => {
                  const novoNicho = e.target.value;
                  setNichoSelecionado(novoNicho);
                  const primeiraSub = nichosConfig[novoNicho]?.[0]?.slug || '';
                  setForm({
                    ...form,
                    categoria: novoNicho,
                    subcategoria: primeiraSub,
                    opcao_vinculada: '',
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                <option value="Impressão 3D">Impressão 3D</option>
                <option value="Drones">Drones</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Subcategoria Exata (Slug)</label>
              <select
                value={form.subcategoria}
                onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                {subcategoriasAtuais.map((sub) => (
                  <option key={sub.slug} value={sub.slug}>
                    {sub.label} ({sub.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Loja / Marketplace</label>
              <select
                value={form.loja}
                onChange={(e) => setForm({ ...form, loja: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Mercado Livre">Mercado Livre</option>
                <option value="Amazon">Amazon</option>
                <option value="Shopee">Shopee</option>
                <option value="AliExpress">AliExpress</option>
                <option value="TikTok Shop">TikTok Shop</option>
                <option value="Magalu">Magalu</option>
                <option value="Casas Bahia">Casas Bahia</option>
                <option value="Kabum">Kabum</option>
                <option value="Ponto Frio">Ponto Frio</option>
                <option value="Americanas">Americanas</option>
                <option value="Loja Própria / Outros">Loja Própria / Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Faixa de Preço</label>
              <select
                value={form.faixa_preco}
                onChange={(e) => setForm({ ...form, faixa_preco: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Até R$ 100">Até R$ 100</option>
                <option value="R$ 100 - R$ 250">R$ 100 - R$ 250</option>
                <option value="R$ 250 - R$ 500">R$ 250 - R$ 500</option>
                <option value="R$ 500 - R$ 1.000">R$ 500 - R$ 1.000</option>
                <option value="R$ 1.000 - R$ 2.500">R$ 1.000 - R$ 2.500</option>
                <option value="R$ 2.500 - R$ 5.000">R$ 2.500 - R$ 5.000</option>
                <option value="R$ 5.000 - R$ 10.000">R$ 5.000 - R$ 10.000</option>
                <option value="R$ 10.000 - R$ 25.000">R$ 10.000 - R$ 25.000</option>
                <option value="R$ 25.000 - R$ 50.000">R$ 25.000 - R$ 50.000</option>
                <option value="R$ 50.000 - R$ 100.000">R$ 50.000 - R$ 100.000</option>
                <option value="Acima de R$ 100.000">Acima de R$ 100.000</option>
              </select>
            </div>
          </div>

          {ehImpressora3D && (
            <div className="bg-slate-900/80 p-3 rounded-lg border border-indigo-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">Especificações Técnicas (Impressora 3D)</h3>
                <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">Obrigatório para Duelos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Volume de Impressão</label>
                  <input
                    type="text"
                    placeholder="Ex: 180x180x180 mm"
                    value={form.volume_impressao || ''}
                    onChange={(e) => setForm({ ...form, volume_impressao: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Velocidade Máxima</label>
                  <input
                    type="text"
                    placeholder="Ex: 500 mm/s"
                    value={form.velocidade_maxima || ''}
                    onChange={(e) => setForm({ ...form, velocidade_maxima: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Temperatura do Bico</label>
                  <input
                    type="text"
                    placeholder="Ex: 300°C"
                    value={form.temperatura_bico || ''}
                    onChange={(e) => setForm({ ...form, temperatura_bico: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Nivelamento</label>
                  <input
                    type="text"
                    placeholder="Ex: Automático"
                    value={form.nivelamento || ''}
                    onChange={(e) => setForm({ ...form, nivelamento: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 mb-0.5">Conectividade</label>
                  <input
                    type="text"
                    placeholder="Ex: Wi-Fi / USB"
                    value={form.conectividade || ''}
                    onChange={(e) => setForm({ ...form, conectividade: e.target.value })}
                    className="w-full px-2 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VÍNCULO AO QUIZ COM CHECKBOXES MÚLTIPLOS */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-purple-500/40 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1.5">
              <label className="block text-[11px] font-bold text-purple-300">
                Vincular a Múltiplas Opções do Quiz ({nichoSelecionado})
              </label>
              <div className="flex bg-slate-950 p-0.5 rounded border border-purple-500/30">
                {Object.keys(nichosConfig).map((nicho) => (
                  <button
                    key={nicho}
                    type="button"
                    onClick={() => {
                      setNichoSelecionado(nicho);
                      const primeiraSub = nichosConfig[nicho]?.[0]?.slug || '';
                      setForm(prev => ({
                        ...prev,
                        categoria: nicho,
                        subcategoria: primeiraSub,
                        opcao_vinculada: ''
                      }));
                    }}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                      nichoSelecionado === nicho
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {nicho}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400">Marque todas as respostas do quiz em que este produto deve ser recomendado:</p>

            <div className="max-h-44 overflow-y-auto space-y-1.5 bg-slate-950 p-2.5 rounded-lg border border-purple-500/30">
              {opcoesQuizAtuais.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">Nenhuma pergunta encontrada para este nicho.</p>
              ) : (
                opcoesQuizAtuais.map((item, idx) => {
                  const estaMarcado = listaOpcoesSelecionadas.includes(item.idChave);
                  return (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                        estaMarcado 
                          ? 'bg-purple-950/40 border-purple-500 text-white font-medium' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={estaMarcado}
                        onChange={() => toggleOpcaoQuiz(item.idChave)}
                        className="mt-0.5 w-3.5 h-3.5 rounded border-purple-700 bg-slate-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      />
                      <span>
                        <strong className="text-purple-300">[{item.idChave}]</strong> {item.pergunta} ➔ <span className="text-amber-200">{item.opcao}</span>
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="destacado"
              checked={form.destacado || false}
              onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              className="w-4 h-4 rounded border-amber-700 bg-slate-900 text-amber-600 focus:ring-amber-500 outline-none cursor-pointer"
            />
            <label htmlFor="destacado" className="text-xs font-semibold text-amber-200 cursor-pointer select-none">
              Marcar como <strong className="text-amber-400">Produto em Destaque</strong> na Home (exibe independente do nicho na seção principal)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">URL Direta da Imagem</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.imagem_url}
                onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-200 mb-1">Link de Afiliado *</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.link_afiliado}
                onChange={(e) => setForm({ ...form, link_afiliado: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-emerald-900/30"
            >
              {loading ? 'Salvando...' : (form.id ? 'Atualizar Produto' : 'Adicionar Produto ao Supabase')}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({
                  id: '',
                  nome: '',
                  marca: '',
                  categoria: 'Impressão 3D',
                  subcategoria: 'impressoras-3d-fdm',
                  loja: 'Mercado Livre',
                  faixa_preco: 'R$ 1.000 - R$ 2.500',
                  imagem_url: '',
                  link_afiliado: '',
                  opcao_vinculada: '',
                  destacado: false,
                  volume_impressao: '',
                  velocidade_maxima: '',
                  temperatura_bico: '',
                  nivelamento: '',
                  conectividade: '',
                })}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors border text-slate-200 border-slate-700"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>

        <section className="bg-slate-950 rounded-xl p-3 md:p-5 shadow-lg border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                Produtos Cadastrados ({produtos.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Organizados por nichos e gavetas de subcategorias.</p>
            </div>

            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {Object.keys(nichosConfig).map((nicho) => {
                const totalNicho = produtos.filter(p => {
                  return nichosConfig[nicho].some(config => pertenceAGaveta(p, config.slug));
                }).length;
                return (
                  <button
                    key={nicho}
                    type="button"
                    onClick={() => setAbaListagemNicho(nicho)}
                    className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
                      abaListagemNicho === nicho
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {nicho}
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${abaListagemNicho === nicho ? 'bg-indigo-900 text-indigo-200' : 'bg-slate-800 text-slate-300'}`}>
                      {totalNicho}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full">
            <input
              type="text"
              placeholder="Pesquisar produto por nome, marca ou loja..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
            />
          </div>

          <div className="space-y-2.5">
            {subcatsDaAba.map((sub) => {
              const prodsDaSub = produtosFiltrados.filter(p => pertenceAGaveta(p, sub.slug));
              const estaAberta = subcategoriasAbertas[sub.slug] ?? true;

              return (
                <div key={sub.slug} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm transition-all">
                  <button
                    type="button"
                    onClick={() => toggleGaveta(sub.slug)}
                    className="w-full px-3.5 py-2 flex items-center justify-between bg-slate-950/80 hover:bg-slate-900 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></span>
                      <span className="font-bold text-white text-xs">{sub.label}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                        {prodsDaSub.length} {prodsDaSub.length === 1 ? 'produto' : 'produtos'}
                      </span>
                    </div>
                    <div className="text-slate-400 hover:text-white">
                      {estaAberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {estaAberta && (
                    <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/35">
                      {prodsDaSub.length === 0 ? (
                        <div className="text-center py-3 text-slate-500 italic text-[11px] font-medium">
                          Nenhum produto cadastrado nesta subcategoria ainda.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px] text-slate-200">
                            <thead className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                              <tr>
                                <th className="py-2 px-1.5 w-16">Imagem</th>
                                <th className="py-2 px-1.5">Nome / Destaque</th>
                                <th className="py-2 px-1.5 w-24">Loja</th>
                                <th className="py-2 px-1.5 w-28">Preço</th>
                                <th className="py-2 px-1.5 w-36">Opções Quiz</th>
                                <th className="py-2 px-1.5 text-right w-24">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {prodsDaSub.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="py-2 px-1.5">
                                    {p.imagem_url ? (
                                      <img
                                        src={p.imagem_url}
                                        alt={p.nome}
                                        className="w-12 h-12 object-contain rounded-lg border border-slate-700 bg-white p-1 shadow-md"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center text-[9px] text-slate-500">
                                        Sem foto
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-2 px-1.5 font-semibold text-white max-w-[220px]">
                                    <div className="truncate" title={p.nome}>{p.nome}</div>
                                    {p.destacado && (
                                      <span className="inline-block mt-0.5 bg-amber-950/80 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded text-[9px] font-bold">
                                        Destacado na Home
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2 px-1.5 text-slate-300 font-medium truncate">
                                    {p.loja}
                                  </td>
                                  <td className="py-2 px-1.5 font-bold text-emerald-400 whitespace-nowrap">
                                    {p.faixa_preco}
                                  </td>
                                  <td className="py-2 px-1.5">
                                    {p.opcao_vinculada ? (
                                      <span className="bg-purple-950/80 text-purple-300 border border-purple-500/40 px-1.5 py-0.5 rounded text-[10px] font-medium inline-block max-w-[140px] truncate shadow-sm" title={p.opcao_vinculada}>
                                        {p.opcao_vinculada}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[10px] italic">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-1.5 text-right space-x-1 whitespace-nowrap">
                                    <button
                                      onClick={() => handleEditar(p)}
                                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-semibold transition-colors border border-slate-700"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeletar(p.id)}
                                      className="px-2 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded text-[10px] font-semibold transition-colors border border-red-500/30"
                                    >
                                      Excluir
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}