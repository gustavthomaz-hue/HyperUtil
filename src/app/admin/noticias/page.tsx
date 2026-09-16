'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Noticia {
  id?: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  imagemUrl: string;
  publicado: boolean;
  tempoLeitura?: string;
}

interface ConfigAutomacao {
  ativo: boolean;
  frequencia_horas: number;
  horario_execucao: string;
  categoria_padrao: string;
}

export default function AdminNoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Estados da Automação
  const [config, setConfig] = useState<ConfigAutomacao>({
    ativo: true,
    frequencia_horas: 24,
    horario_execucao: '08:00',
    categoria_padrao: 'Impressão 3D',
  });
  const [salvandoConfig, setSalvandoConfig] = useState(false);

  // Estados de geração assistida por IA no Admin
  const [temaIA, setTemaIA] = useState('');
  const [gerandoIA, setGerandoIA] = useState(false);
  const [erroIA, setErroIA] = useState<string | null>(null);

  // Abas de visualização e edição do conteúdo: 'preview' | 'texto' | 'codigo'
  const [modoVisualizacao, setModoVisualizacao] = useState<'preview' | 'texto' | 'codigo'>('preview');

  // Form principal do produto/notícia
  const [form, setForm] = useState<Noticia>({
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'Lançamentos',
    imagemUrl: '',
    publicado: true,
    tempoLeitura: '3 min de leitura',
  });

  const carregarDados = async () => {
    const { data: newsData } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (newsData) {
      setNoticias(
        newsData.map((item: any) => ({
          id: item.id,
          titulo: item.titulo || '',
          resumo: item.resumo || '',
          conteudo: item.conteudo || '',
          categoria: item.categoria || 'Lançamentos',
          imagemUrl: item.imagem_url || item.imagemUrl || '',
          publicado: item.publicado ?? true,
          tempoLeitura: item.tempo_leitura || '3 min de leitura',
        }))
      );
    }

    const { data: configData } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'automacao_noticias')
      .single();

    if (configData?.valor) {
      setConfig(configData.valor as ConfigAutomacao);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Função para limpar asteriscos indesejados e formatar o HTML de forma padronizada
  const limparEFormatarHtml = (htmlBruto: string) => {
    if (!htmlBruto) return '';
    let formatado = htmlBruto.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatado = formatado.replace(/<h2[^>]*>/gi, '<h2 class="text-xl font-bold text-slate-900 mt-6 mb-3">');
    formatado = formatado.replace(/<p[^>]*>/gi, '<p class="mb-4 text-slate-700 leading-relaxed text-sm">');
    formatado = formatado.replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-5 space-y-2 mb-4 text-slate-700 text-sm">');
    return formatado;
  };

  const htmlParaTextoLivre = (html: string) => {
    if (!html) return '';
    let texto = html
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n');
    return texto.replace(/<[^>]+>/g, '').replace(/\*\*/g, '').trim();
  };

  const textoLivreParaHtml = (texto: string) => {
    if (!texto) return '';
    const paragrafos = texto.split(/\n\n+/);
    return paragrafos
      .map((p) => `<p class="mb-4 text-slate-700 leading-relaxed text-sm">${p.trim().replace(/\n/g, '<br>')}</p>`)
      .join('\n');
  };

  // Traz o rascunho da IA usando exatamente o título gerado por ela para evitar divergências
  async function handleGerarNoticiaIA() {
    if (!temaIA.trim()) return;

    setGerandoIA(true);
    setErroIA(null);

    try {
      const res = await fetch('/api/noticias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produto: temaIA,
          categoria: form.categoria || 'Geral',
          detalhes: 'Gere uma análise técnica completa com especificações e opinião.',
        }),
      });

      const result = await res.json();

      if (res.ok && result.success && result.data) {
        const conteudoLimpo = limparEFormatarHtml(result.data.conteudo || '');
        
        setForm((prev) => ({
          ...prev,
          titulo: result.data.titulo || `Análise: ${result.data.produto}`,
          resumo: result.data.resumo || `Confira as principais especificações e recursos do ${result.data.produto}.`,
          conteudo: conteudoLimpo,
          imagemUrl: result.data.imagemUrl || '',
        }));
        
        setModoVisualizacao('preview');
        setTemaIA('');
      } else {
        setErroIA(result.error || 'Erro de comunicação com a API.');
      }
    } catch (e) {
      setErroIA('Erro ao conectar com a rota /api/noticias.');
    } finally {
      setGerandoIA(false);
    }
  }

  // Salvamento blindado com verificação prévia por ID ou Slug
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = form.titulo
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const payload = {
      titulo: form.titulo,
      slug,
      resumo: form.resumo,
      conteudo: limparEFormatarHtml(form.conteudo),
      categoria: form.categoria,
      imagem_url: form.imagemUrl,
      publicado: form.publicado,
      tempo_leitura: form.tempoLeitura,
    };

    let result;
    if (editandoId) {
      result = await supabase.from('noticias').update(payload).eq('id', editandoId);
    } else {
      const { data: existente } = await supabase
        .from('noticias')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existente?.id) {
        result = await supabase.from('noticias').update(payload).eq('id', existente.id);
      } else {
        result = await supabase.from('noticias').insert([payload]);
      }
    }

    if (result.error) {
      alert('Erro ao salvar no Supabase: ' + result.error.message);
      return;
    }

    limparForm();
    await carregarDados();
    alert(editandoId ? 'Matéria atualizada no Supabase!' : 'Matéria salva com sucesso no Supabase!');
  };

  const salvarConfiguracaoAutomacao = async () => {
    setSalvandoConfig(true);
    const { error } = await supabase.from('configuracoes').upsert({
      chave: 'automacao_noticias',
      valor: config,
    });

    setSalvandoConfig(false);
    if (error) {
      alert('Erro ao salvar agendamento: ' + error.message);
    } else {
      alert('Configurações salvas com sucesso!');
    }
  };

  const iniciarEdicao = (noticia: Noticia) => {
    if (!noticia.id) return;
    setEditandoId(noticia.id);
    setForm({
      titulo: noticia.titulo,
      resumo: noticia.resumo,
      conteudo: noticia.conteudo,
      categoria: noticia.categoria || 'Lançamentos',
      imagemUrl: noticia.imagemUrl || '',
      publicado: noticia.publicado ?? true,
      tempoLeitura: noticia.tempoLeitura || '3 min de leitura',
    });
    setModoVisualizacao('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const excluirNoticia = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria do Supabase?')) {
      const { error } = await supabase.from('noticias').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      else carregarDados();
    }
  };

  const limparForm = () => {
    setEditandoId(null);
    setForm({
      titulo: '',
      resumo: '',
      conteudo: '',
      categoria: 'Lançamentos',
      imagemUrl: '',
      publicado: true,
      tempoLeitura: '3 min de leitura',
    });
  };

  return (
    <div className="p-4 bg-slate-900 min-h-screen text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white">Painel Editorial de Notícias</h1>
          <p className="text-[11px] text-slate-400">
            Gerencie matérias manuais ou programe a frequência de geração automática por IA.
          </p>
        </div>

        {/* PAINEL DE PROGRAMAÇÃO */}
        <div className="bg-slate-800 p-3.5 rounded-xl border border-emerald-500/30 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h2 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              🤖 Automação & Agendamento por IA
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={config.ativo}
                onChange={(e) => setConfig({ ...config, ativo: e.target.checked })}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <span className={config.ativo ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {config.ativo ? 'Publicação Automática ATIVA' : 'Inativa'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Horário</label>
              <input
                type="time"
                value={config.horario_execucao}
                onChange={(e) => setConfig({ ...config, horario_execucao: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Frequência</label>
              <select
                value={config.frequencia_horas}
                onChange={(e) => setConfig({ ...config, frequencia_horas: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              >
                <option value={12}>A cada 12 horas</option>
                <option value={24}>A cada 24 horas</option>
                <option value={48}>A cada 48 horas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Foco Principal</label>
              <input
                type="text"
                value={config.categoria_padrao}
                onChange={(e) => setConfig({ ...config, categoria_padrao: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={salvarConfiguracaoAutomacao}
            disabled={salvandoConfig}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors"
          >
            {salvandoConfig ? 'Salvando...' : 'Salvar Regra de Postagem'}
          </button>
        </div>

        {/* GERADOR IA */}
        <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-2">
          <label className="block text-[11px] font-bold text-slate-300">
            Gerar Rascunho com IA (Manual)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={temaIA}
              onChange={(e) => setTemaIA(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              placeholder="Ex: Bambu Lab A1 Mini"
            />
            <button
              type="button"
              onClick={handleGerarNoticiaIA}
              disabled={gerandoIA}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-[11px] rounded-lg transition-colors whitespace-nowrap"
            >
              {gerandoIA ? 'Gerando Conteúdo...' : 'Preencher Campos'}
            </button>
          </div>
          {erroIA && <p className="text-[11px] text-red-400">⚠️ {erroIA}</p>}
        </div>

        {/* FORMULÁRIO */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-3"
        >
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
              {editandoId ? 'EDITANDO MATÉRIA' : 'NOVA MATÉRIA PARA O SUPABASE'}
            </span>
            {editandoId && (
              <button
                type="button"
                onClick={limparForm}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Cancelar Edição
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Título (SEO)</label>
              <input
                type="text"
                name="titulo"
                required
                value={form.titulo}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Categoria Card</label>
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
              >
                <option value="Lançamentos">Lançamentos</option>
                <option value="Guias & Dicas">Guias & Dicas</option>
                <option value="Mercado">Mercado</option>
                <option value="Tutoriais">Tutoriais</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-300">Capa da Notícia (URL)</label>
            {form.imagemUrl && (
              <div className="w-full h-32 bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
                <img src={form.imagemUrl} alt="Capa" className="w-full h-full object-cover" />
              </div>
            )}
            <input
              type="text"
              name="imagemUrl"
              placeholder="https://..."
              value={form.imagemUrl}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">Resumo / Chamada</label>
            <textarea
              name="resumo"
              rows={2}
              value={form.resumo}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
            />
          </div>

          {/* ABAS DO CONTEÚDO */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <label className="block text-[11px] font-bold text-slate-300">Conteúdo Completo</label>
              <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-700 text-[10px]">
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('preview')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    modoVisualizacao === 'preview'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👁️ Visualizar
                </button>
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('texto')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    modoVisualizacao === 'texto'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✏️ Editar Texto Livre
                </button>
                <button
                  type="button"
                  onClick={() => setModoVisualizacao('codigo')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    modoVisualizacao === 'codigo'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💻 Código HTML
                </button>
              </div>
            </div>

            {modoVisualizacao === 'preview' && (
              <div className="w-full min-h-[160px] max-h-[300px] overflow-y-auto bg-white border border-slate-700 rounded-lg p-3 text-xs text-slate-800">
                {form.conteudo ? (
                  <div dangerouslySetInnerHTML={{ __html: form.conteudo }} />
                ) : (
                  <p className="text-slate-400 italic">O conteúdo gerado aparecerá aqui formatado...</p>
                )}
              </div>
            )}

            {modoVisualizacao === 'texto' && (
              <textarea
                rows={7}
                value={htmlParaTextoLivre(form.conteudo)}
                onChange={(e) => setForm({ ...form, conteudo: textoLivreParaHtml(e.target.value) })}
                className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-2 text-xs text-white"
                placeholder="Edite o texto livremente aqui..."
              />
            )}

            {modoVisualizacao === 'codigo' && (
              <textarea
                name="conteudo"
                rows={7}
                value={form.conteudo}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-[11px] text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="publicado"
                checked={form.publicado}
                onChange={handleChange}
                className="rounded border-slate-700 text-emerald-500"
              />
              Publicar imediatamente na Home
            </label>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition-colors"
            >
              {editandoId ? 'Atualizar no Supabase' : 'Salvar no Supabase'}
            </button>
          </div>
        </form>

        {/* LISTAGEM */}
        <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 space-y-2.5">
          <h2 className="text-xs font-bold text-white">
            Matérias Cadastradas no Supabase ({noticias.length})
          </h2>

          {noticias.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">Nenhuma matéria no banco ainda.</p>
          ) : (
            <div className="space-y-2">
              {noticias.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-700 flex gap-3 items-center justify-between"
                >
                  <div className="flex gap-2.5 items-center">
                    {item.imagemUrl ? (
                      <img src={item.imagemUrl} alt="" className="w-12 h-9 object-cover rounded bg-slate-900" />
                    ) : (
                      <div className="w-12 h-9 bg-slate-900 rounded flex items-center justify-center text-[9px] text-slate-600">
                        Sem Img
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {item.categoria}
                        </span>
                        <h3 className="text-[11px] font-bold text-white">{item.titulo}</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.resumo}</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(item)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => item.id && excluirNoticia(item.id)}
                      className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[10px] rounded"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}