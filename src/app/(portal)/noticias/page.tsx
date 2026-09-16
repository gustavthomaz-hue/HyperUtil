'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Loader2, Newspaper } from 'lucide-react';

interface Noticia {
  id: string;
  titulo: string;
  categoria: string;
  resumo: string;
  imagem_url: string;
  slug: string;
  tempo_leitura: string;
  created_at?: string;
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarNoticias() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('publicado', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNoticias(data);
      }
      setCarregando(false);
    }

    buscarNoticias();
  }, []);

  if (carregando) {
    return (
      <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
        <div className="w-full max-w-3xl px-6 pt-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-medium text-slate-600">Carregando notícias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <Newspaper className="w-3.5 h-3.5" />
            Notícias & Tendências
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fique por dentro das novidades
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Últimas atualizações sobre impressão 3D e tecnologia.
          </p>
        </div>

        {noticias.length === 0 ? (
          <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-8 text-center shadow-sm space-y-2">
            <p className="text-xs font-medium text-slate-600">Nenhuma notícia encontrada no momento.</p>
            <p className="text-[11px] text-slate-400">Volte em breve para conferir novos conteúdos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {noticias.map((item) => (
              <Link
                key={item.id}
                href={`/noticias/${item.slug}`}
                className="group flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="sm:w-48 h-40 sm:h-auto bg-slate-100 relative overflow-hidden shrink-0">
                  {item.imagem_url ? (
                    <img
                      src={item.imagem_url}
                      alt={item.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      Sem imagem
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                      <span className="text-blue-600 uppercase tracking-wider">{item.categoria}</span>
                      <span>{item.tempo_leitura || '3 min de leitura'}</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.titulo}
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {item.resumo}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}