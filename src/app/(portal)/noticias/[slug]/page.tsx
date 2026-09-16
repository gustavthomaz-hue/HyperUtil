'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Noticia {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string;
  conteudo: string;
  imagem_url: string;
  created_at: string;
}

export default function DetalheNoticiaPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarNoticia() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

      if (!error && data) {
        setNoticia(data);
      }
      setCarregando(false);
    }

    buscarNoticia();
  }, [resolvedParams.slug]);

  if (carregando) {
    return (
      <div className="w-full flex justify-center pb-16">
        <div className="w-full max-w-3xl px-6 pt-20 text-center text-slate-500 text-xs">
          Carregando notícia...
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="w-full flex justify-center pb-16">
        <div className="w-full max-w-3xl px-6 pt-20 text-center">
          <h1 className="text-xl font-bold text-slate-800">Notícia não encontrada</h1>
          <Link href="/noticias" className="mt-4 inline-block text-xs text-blue-600 hover:underline font-semibold">
            ← Voltar para Notícias
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        <article className="space-y-4">
          <Link href="/noticias" className="text-xs text-blue-600 hover:underline font-semibold inline-block">
            ← Voltar para Notícias
          </Link>

          <div className="space-y-2">
            <span className="inline-block text-[10px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded">
              {noticia.categoria}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {noticia.titulo}
            </h1>
            <p className="text-slate-400 text-[11px]">
              Publicado em {new Date(noticia.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>

          {noticia.imagem_url && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm max-h-[380px] flex items-center justify-center">
              <img src={noticia.imagem_url} alt={noticia.titulo} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-slate max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed pt-2 space-y-4 prose-headings:font-bold prose-headings:text-slate-900 prose-headings:text-base sm:prose-headings:text-lg prose-headings:mt-6 prose-headings:mb-2 prose-p:my-3 prose-ul:my-3 prose-li:my-1.5">
            {noticia.conteudo.includes('</') ? (
              <div dangerouslySetInnerHTML={{ __html: noticia.conteudo.replace(/\\n/g, '') }} />
            ) : (
              noticia.conteudo.split(/\\n|\n/).map((paragrafo, index) => {
                const textoLimpo = paragrafo.replace(/\\n/g, '').trim();
                if (!textoLimpo) return null;
                return <p key={index}>{textoLimpo}</p>;
              })
            )}
          </div>
        </article>
      </div>
    </div>
  );
}