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
  ],
};

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [extraindo, setExtraindo] = useState(false);
  
  const [opcoesQuizPorNicho, setOpcoesQuizPorNicho] = useState<Record<string, { pergunta: string; opcao: string }[]>>({
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
        const resultado: { pergunta: string; opcao: string }[] = [];
        lista.forEach((p: any) => {
          const tituloPergunta = p?.titulo || '';
          const opcoes = Array.isArray(p?.opcoes) ? p.opcoes : [];
          opcoes.forEach((o: any) => {
            const textoOpcao = typeof o === 'string' ? o : (o?.texto || '');
            if (tituloPergunta && textoOpcao) {
              resultado.push({ pergunta: tituloPergunta, opcao: textoOpcao });
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
    if (!form.nome || !form.link_afiliado) {
      alert('Preencha o Nome e o Link de Afiliado.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-3 md:p-5 flex justify-center">
      <div className="w-full max-w-6xl space-y-4">
        
        {/* FORMULÁRIO DE CADASTRO / EDIÇÃO */}
        <form onSubmit={handleSalvar} className="bg-slate-950 rounded-xl p-4 md:p-5 shadow-lg border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {form.id ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h1>
            <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">Painel de gerenciamento compacto com alto contraste e clareza visual.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Nome do Produto *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Bambu Lab A1 Mini"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleExtrairComIA}
                  disabled={extraindo}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-purple-900/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {extraindo ? 'Lendo...' : 'Preencher com IA'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Marca</label>
              <input
                type="text"
                placeholder="Ex: Bambu Lab, Creality"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Nicho Principal *</label>
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
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                <option value="Impressão 3D">Impressão 3D</option>
                <option value="Drones">Drones</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Subcategoria Exata (Slug)</label>
              <select
                value={form.subcategoria}
                onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              >
                {subcategoriasAtuais.map((sub) => (
                  <option key={sub.slug} value={sub.slug}>
                    {sub.label} ({sub.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Loja / Marketplace</label>
              <select
                value={form.loja}
                onChange={(e) => setForm({ ...form, loja: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
              <label className="block text-xs font-semibold text-slate-200 mb-1">Faixa de Preço</label>
              <select
                value={form.faixa_preco}
                onChange={(e) => setForm({ ...form, faixa_preco: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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

          {/* ESPECIFICAÇÕES TÉCNICAS (IMPRESSORA 3D) */}
          {ehImpressora3D && (
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Especificações Técnicas (Impressora 3D)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Dados vitais para o comparador de duelos e inteligência artificial.</p>
                </div>
                <span className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded font-semibold">Obrigatório para Duelos</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Volume de Impressão</label>
                  <input
                    type="text"
                    placeholder="Ex: 180 x 180 x 180 mm"
                    value={form.volume_impressao || ''}
                    onChange={(e) => setForm({ ...form, volume_impressao: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Velocidade Máxima</label>
                  <input
                    type="text"
                    placeholder="Ex: 500 mm/s"
                    value={form.velocidade_maxima || ''}
                    onChange={(e) => setForm({ ...form, velocidade_maxima: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Temperatura do Bico</label>
                  <input
                    type="text"
                    placeholder="Ex: 300°C"
                    value={form.temperatura_bico || ''}
                    onChange={(e) => setForm({ ...form, temperatura_bico: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Nivelamento</label>
                  <input
                    type="text"
                    placeholder="Ex: Automático"
                    value={form.nivelamento || ''}
                    onChange={(e) => setForm({ ...form, nivelamento: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-0.5">Conectividade</label>
                  <input
                    type="text"
                    placeholder="Ex: Wi-Fi / USB / App"
                    value={form.conectividade || ''}
                    onChange={(e) => setForm({ ...form, conectividade: e.target.value })}
                    className="w-full px-2.5 py-1 rounded border border-slate-700 bg-slate-950 text-white text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VÍNCULO AO QUIZ */}
          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-purple-500/40 space-y-2.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-purple-300">
                Vincular à Opção do Quiz por Nicho
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
                    className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
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
            <select
              value={form.opcao_vinculada}
              onChange={(e) => setForm({ ...form, opcao_vinculada: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg border border-purple-500/40 bg-slate-950 text-white focus:ring-1 focus:ring-purple-500 outline-none text-xs font-medium"
            >
              <option value="">Selecione a resposta do quiz correspondente a {nichoSelecionado}...</option>
              {opcoesQuizAtuais.map((item, idx) => (
                <option key={idx} value={item.opcao}>
                  [{item.pergunta}] → {item.opcao}
                </option>
              ))}
            </select>
          </div>

          {/* CHECKBOX DE DESTAQUE (ADICIONADO AQUI) */}
          <div className="bg-amber-950/30 p-3 rounded-lg border border-amber-500/30 flex items-center gap-3">
            <input
              type="checkbox"
              id="destacado"
              checked={form.destacado || false}
              onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
              className="w-4 h-4 rounded border-amber-700 bg-slate-900 text-amber-600 focus:ring-amber-500 outline-none cursor-pointer"
            />
            <label htmlFor="destacado" className="text-xs font-semibold text-amber-200 cursor-pointer select-none">
              Marcar como <strong className="text-amber-400">Produto em Destaque</strong> na Home (exibe independente do nicho na seção principal de ofertas/achados)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">URL Direta da Imagem</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.imagem_url}
                onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">Link de Afiliado *</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.link_afiliado}
                onChange={(e) => setForm({ ...form, link_afiliado: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-white text-xs md:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-emerald-900/30"
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-700"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>

        {/* SEÇÃO DE LISTAGEM ORGANIZADA POR GAVETAS */}
        <section className="bg-slate-950 rounded-xl p-4 md:p-5 shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                Produtos Cadastrados no Banco ({produtos.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Organizados por nichos e gavetas de subcategorias.</p>
            </div>

            {/* ABAS DOS NICHOS */}
            <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {Object.keys(nichosConfig).map((nicho) => {
                const totalNicho = produtos.filter(p => {
                  const subProd = (p.subcategoria || '').trim().toLowerCase();
                  return nichosConfig[nicho].some(config => {
                    const subConfig = config.slug.trim().toLowerCase();
                    return (
                      subProd === subConfig ||
                      subProd === subConfig.replace(/s$/, '') ||
                      subConfig === subProd.replace(/s$/, '') ||
                      (subConfig.includes('fdm') && (subProd.includes('fdm') || subProd.includes('impressora-3d') || subProd === 'impressoras')) ||
                      (subConfig.includes('resina') && subConfig.includes('impressora') && subProd.includes('resina') && subProd.includes('impressora')) ||
                      (subConfig.includes('filamento-pla') && (subProd.includes('pla') || subProd.includes('filamento'))) ||
                      (subConfig.includes('filamento-petg') && (subProd.includes('petg') || subProd.includes('filamento'))) ||
                      (subConfig.includes('resinas-3d') && subProd.includes('resina') && !subProd.includes('impressora')) ||
                      (subConfig.includes('aerografo') && subProd.includes('aerografo')) ||
                      (subConfig.includes('drones-para-iniciantes') && (subProd.includes('iniciante') || subProd.includes('drone'))) ||
                      (subConfig.includes('drones-intermediarios') && (subProd.includes('intermediario') || subProd.includes('drone'))) ||
                      (subConfig.includes('drones-avancados') && (subProd.includes('avancado') || subProd.includes('drone')))
                    );
                  });
                }).length;

                return (
                  <button
                    key={nicho}
                    type="button"
                    onClick={() => setAbaListagemNicho(nicho)}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center gap-1.5 ${
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

          {/* GAVETAS DE SUBCATEGORIAS */}
          <div className="space-y-3">
            {subcatsDaAba.map((sub) => {
              const prodsDaSub = produtos.filter(p => {
                const subProd = (p.subcategoria || '').trim().toLowerCase();
                const subConfig = sub.slug.trim().toLowerCase();
                if (subProd === subConfig || subProd === subConfig.replace(/s$/, '') || subConfig === subProd.replace(/s$/, '')) {
                  return true;
                }
                if (subConfig.includes('fdm') && (subProd.includes('fdm') || subProd.includes('impressora-3d') || subProd === 'impressoras')) {
                  return true;
                }
                if (subConfig.includes('resina') && subConfig.includes('impressora') && subProd.includes('resina') && subProd.includes('impressora')) {
                  return true;
                }
                if (subConfig.includes('filamento-pla') && (subProd.includes('pla') || subProd.includes('filamento'))) {
                  return true;
                }
                if (subConfig.includes('filamento-petg') && (subProd.includes('petg') || subProd.includes('filamento'))) {
                  return true;
                }
                if (subConfig.includes('resinas-3d') && subProd.includes('resina') && !subProd.includes('impressora')) {
                  return true;
                }
                if (subConfig.includes('aerografo') && subProd.includes('aerografo')) {
                  return true;
                }
                if (subConfig.includes('drones-para-iniciantes') && (subProd.includes('iniciante') || subProd.includes('drone'))) {
                  return true;
                }
                if (subConfig.includes('drones-intermediarios') && (subProd.includes('intermediario') || subProd.includes('drone'))) {
                  return true;
                }
                if (subConfig.includes('drones-avancados') && (subProd.includes('avancado') || subProd.includes('drone'))) {
                  return true;
                }
                return false;
              });

              const estaAberta = subcategoriasAbertas[sub.slug] ?? true;

              return (
                <div key={sub.slug} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-sm transition-all">
                  <button
                    type="button"
                    onClick={() => toggleGaveta(sub.slug)}
                    className="w-full px-4 py-2.5 flex items-center justify-between bg-slate-950/80 hover:bg-slate-900 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></span>
                      <span className="font-bold text-white text-xs md:text-sm">{sub.label}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                        {prodsDaSub.length} {prodsDaSub.length === 1 ? 'produto' : 'produtos'}
                      </span>
                    </div>
                    <div className="text-slate-400 hover:text-white">
                      {estaAberta ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {estaAberta && (
                    <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
                      {prodsDaSub.length === 0 ? (
                        <div className="text-center py-4 text-slate-500 text-[11px] font-medium italic">
                          Nenhum produto cadastrado nesta subcategoria ainda.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px] md:text-xs text-slate-200">
                            <thead className="text-slate-400 uppercase font-bold border-b border-slate-800 text-[10px]">
                              <tr>
                                <th className="pb-2 px-2">Imagem</th>
                                <th className="pb-2 px-2">Nome</th>
                                <th className="pb-2 px-2">Loja</th>
                                <th className="pb-2 px-2">Preço</th>
                                <th className="pb-2 px-2">Destaque</th>
                                <th className="pb-2 px-2">Opção Quiz</th>
                                <th className="pb-2 px-2 text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {prodsDaSub.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                  <td className="py-2 px-2">
                                    {p.imagem_url ? (
                                      <img
                                        src={p.imagem_url}
                                        alt={p.nome}
                                        className="w-8 h-8 object-contain rounded border border-slate-700 bg-white p-0.5 shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-slate-950 rounded border border-slate-800" />
                                    )}
                                  </td>
                                  <td className="py-2 px-2 font-semibold text-white max-w-[200px] truncate" title={p.nome}>
                                    {p.nome}
                                  </td>
                                  <td className="py-2 px-2 text-slate-300 font-medium truncate max-w-[100px]">
                                    {p.loja}
                                  </td>
                                  <td className="py-2 px-2 font-bold text-emerald-400 whitespace-nowrap">
                                    {p.faixa_preco}
                                  </td>
                                  <td className="py-2 px-2">
                                    {p.destacado ? (
                                      <span className="bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Sim
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[10px]">-</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2">
                                    {p.opcao_vinculada ? (
                                      <span
                                        className="bg-purple-950/80 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-medium inline-block max-w-[160px] truncate shadow-sm"
                                        title={p.opcao_vinculada}
                                      >
                                        {p.opcao_vinculada}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[10px] italic">Não vinculado</span>
                                    )}
                                  </td>
                                  <td className="py-2 px-2 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      onClick={() => handleEditar(p)}
                                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[11px] font-semibold transition-colors border border-slate-700"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleDeletar(p.id)}
                                      className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 rounded text-[11px] font-semibold transition-colors border border-red-500/30"
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