import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Swords, ChevronRight } from 'lucide-react';

export const revalidate = 0;

export default async function ListaDuelosPage() {
  const { data: duelos } = await supabase
    .from('duelos')
    .select(`
      *,
      produto1:produtos!duelos_produto1_id_fkey(nome, imagem_url, preco),
      produto2:produtos!duelos_produto2_id_fkey(nome, imagem_url, preco)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
      {/* Largura intermediária (max-w-3xl) na medida certa */}
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        
        {/* Voltar e Tag */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Link>
          <span className="text-xs font-bold bg-purple-50 text-purple-600 px-3.5 py-1.5 rounded-full border border-purple-100 flex items-center gap-1.5 shadow-sm">
            <Swords className="h-3.5 w-3.5" />
            Duelos
          </span>
        </div>

        {/* Título */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Escolha um Duelo
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Compare especificações técnicas, prós, contras e veja o veredito da IA.
          </p>
        </div>

        {/* Lista de Duelos */}
        <div className="grid gap-4">
          {duelos && duelos.length > 0 ? (
            duelos.map((duelo) => (
              <Link 
                key={duelo.id}
                href={`/duelos/${duelo.slug}`}
                className="bg-white hover:border-purple-300 border border-slate-200/80 rounded-2xl p-5 sm:p-6 transition shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 group"
              >
                {/* Lado esquerdo: Miniaturas e Nomes */}
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-start">
                  
                  {/* Miniatura Produto 1 */}
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex items-center justify-center shrink-0 shadow-sm">
                      <img 
                        src={duelo.produto1?.imagem_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200"} 
                        alt={duelo.produto1?.nome}
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                    <div className="font-bold text-slate-800 text-xs sm:text-sm max-w-[130px] sm:max-w-[170px] line-clamp-2">
                      {duelo.produto1?.nome || 'Produto 1'}
                    </div>
                  </div>

                  <span className="bg-purple-50 text-purple-600 font-black text-xs px-3 py-1.5 rounded-xl uppercase shrink-0 border border-purple-100">
                    vs
                  </span>

                  {/* Miniatura Produto 2 */}
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-slate-800 text-xs sm:text-sm max-w-[130px] sm:max-w-[170px] line-clamp-2 text-right">
                      {duelo.produto2?.nome || 'Produto 2'}
                    </div>
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-slate-50 border border-slate-100 p-2.5 flex items-center justify-center shrink-0 shadow-sm">
                      <img 
                        src={duelo.produto2?.imagem_url || "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200"} 
                        alt={duelo.produto2?.nome}
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                  </div>

                </div>

                {/* Botão de ação à direita */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-purple-600 transition">
                    Ver comparativo completo
                  </span>
                  <div className="h-8 w-8 rounded-xl bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600 flex items-center justify-center transition shrink-0">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs shadow-sm">
              Nenhum duelo cadastrado no momento.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}