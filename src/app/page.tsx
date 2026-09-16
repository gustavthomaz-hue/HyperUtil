import Link from 'next/link';
import { 
  Sparkles, 
  Swords, 
  Trophy, 
  Newspaper,
  ExternalLink,
  HelpCircle,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import WhatsappBanner from '@/components/WhatsappBanner';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const revalidate = 0;

export default async function Home() {
  const { data: duelos } = await supabase
    .from('duelos')
    .select(`
      *,
      produto1:produtos!duelos_produto1_id_fkey(*),
      produto2:produtos!duelos_produto2_id_fkey(*)
    `)
    .limit(1);

  const dueloDestaque = duelos && duelos.length > 0 ? duelos[0] : null;

  const { data: noticiasData } = await supabase
    .from('noticias')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);

  const noticias = noticiasData && noticiasData.length > 0 ? noticiasData : [
    {
      id: 1,
      titulo: 'Novas tecnologias em filamentos de alta velocidade para 2026',
      resumo: 'Descubra como os novos compostos plásticos estão revolucionando o tempo de impressão.',
      slug: 'novas-tecnologias-filamentos',
      created_at: '2026-06-01',
      imagem_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80'
    },
    {
      id: 2,
      titulo: 'Vale a pena investir em uma impressora coreXY fechada?',
      resumo: 'Analisamos os prós e contras das estruturas fechadas para impressões técnicas em ABS e Nylon.',
      slug: 'vale-a-pena-corexy',
      created_at: '2026-05-28',
      imagem_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80'
    },
    {
      id: 3,
      titulo: 'Guia definitivo de calibração de primeira camada',
      resumo: 'Evite descolamentos e falhas com dicas práticas direto da bancada.',
      slug: 'guia-calibracao-primeira-camada',
      created_at: '2026-05-20',
      imagem_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80'
    }
  ];

  // Busca dinâmica dos produtos destacados usando a coluna recém-criada
  const { data: produtosDestacadosData } = await supabase
    .from('produtos')
    .select('*')
    .eq('destacado', true)
    .limit(3);

  const produtosDestacados = produtosDestacadosData && produtosDestacadosData.length > 0 ? produtosDestacadosData : [
    {
      id: 'fallback-1',
      nome: 'Impressora 3D Bambu Lab A1 Mini',
      marca: 'Bambu Lab',
      faixa_preco: 'R$ 2.199,90',
      imagem_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
      link_afiliado: '#',
      subcategoria: 'impressoras'
    },
    {
      id: 'fallback-2',
      nome: 'PLA Premium Sunlu 1kg',
      marca: 'Sunlu',
      faixa_preco: 'R$ 119,90',
      imagem_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80',
      link_afiliado: '#',
      subcategoria: 'filamentos-pla'
    },
    {
      id: 'fallback-3',
      nome: 'Paquímetro Digital Aço Inox Profissional',
      marca: 'Digimess',
      faixa_preco: 'R$ 89,90',
      imagem_url: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&q=80',
      link_afiliado: '#',
      subcategoria: 'acessorios'
    }
  ];

  const faqs = [
    {
      pergunta: "Como funcionam os duelos?",
      resposta: "Analisamos especificações técnicas e custo-benefício de forma neutra."
    },
    {
      pergunta: "Os links são confiáveis?",
      resposta: "Sim, indicamos apenas lojas oficiais e parceiros verificados."
    },
    {
      pergunta: "O recomendador é gratuito?",
      resposta: "Sim! Responda poucas perguntas e receba indicações sob medida."
    }
  ];

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC] min-h-screen text-slate-800 font-sans">
      <SiteHeader />

      <main className="flex-1 w-full flex justify-center pb-16">
        <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
          
          {/* HERO */}
          <section className="grid md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 space-y-2.5">
              <span className="inline-block px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">
                Decisões de compra sem achismo
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Compare, escolha e compre o equipamento certo
              </h1>
              
              <p className="text-slate-600 text-xs leading-relaxed max-w-lg">
                Duelos lado a lado, rankings de insumos e recomendador inteligente com prós, contras e as melhores ofertas.
              </p>
              
              <div className="pt-1">
                <Link
                  href="/recomendador"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Descobrir minha opção ideal
                </Link>
              </div>
            </div>

            {/* CARD DE DUELO */}
            <div className="md:col-span-5 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                <Swords className="w-3.5 h-3.5" />
                <span>Duelo em destaque</span>
              </div>

              {dueloDestaque ? (
                <>
                  <div className="grid grid-cols-2 gap-3 relative items-center">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-2">
                      <div className="h-28 mx-auto flex items-center justify-center p-1 bg-white rounded-lg border border-slate-100">
                        <img 
                          src={dueloDestaque.produto1?.imagem_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300"} 
                          alt={dueloDestaque.produto1?.nome} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">{dueloDestaque.produto1?.marca}</div>
                      <div className="font-bold text-xs text-slate-800 truncate">{dueloDestaque.produto1?.nome}</div>
                      <div className="text-[10px] text-amber-500 font-bold">★ {dueloDestaque.produto1?.avaliacao || "4.6"}</div>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white z-10 shadow-md">
                      VS
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center space-y-2">
                      <div className="h-28 mx-auto flex items-center justify-center p-1 bg-white rounded-lg border border-slate-100">
                        <img 
                          src={dueloDestaque.produto2?.imagem_url || "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=300"} 
                          alt={dueloDestaque.produto2?.nome} 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate">{dueloDestaque.produto2?.marca}</div>
                      <div className="font-bold text-xs text-slate-800 truncate">{dueloDestaque.produto2?.nome}</div>
                      <div className="text-[10px] text-amber-500 font-bold">★ {dueloDestaque.produto2?.avaliacao || "4.8"}</div>
                    </div>
                  </div>

                  <Link
                    href={`/duelos/${dueloDestaque.slug}`}
                    className="w-full block text-center py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition"
                  >
                    Ver duelo completo →
                  </Link>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">Nenhum duelo cadastrado.</div>
              )}
            </div>
          </section>

          {/* NAVEGAÇÃO RÁPIDA */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <Link href="/duelos" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition shadow-sm group">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                <Swords className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-600">Duelos e Comparativos</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Comparativos técnicos lado a lado.</p>
            </Link>

            <Link href="/rankings" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition shadow-sm group">
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-2">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-600">Rankings e Achados</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Produtos e insumos testados.</p>
            </Link>

            <Link href="/recomendador" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition shadow-sm group">
              <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-2">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs group-hover:text-blue-600">Recomendador</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Indicação ideal para o seu perfil.</p>
            </Link>
          </section>

          {/* OFERTAS EM DESTAQUE */}
          <section className="space-y-3">
            <div className="flex justify-between items-end">
              <h2 className="text-sm font-bold text-slate-900">Ofertas em Destaque</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {produtosDestacados.map((item: any, idx: number) => (
                <div key={item.id || idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between relative">
                  {/* Detalhe de faixa âmbar sutil no topo do card */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
                  
                  <div className="p-4 space-y-2">
                    <div className="h-32 mx-auto flex items-center justify-center p-1 bg-white rounded-lg border border-slate-100">
                      <img 
                        src={item.imagem_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"} 
                        alt={item.nome}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      {/* Tag atualizada para usar o azul padrão do site (bg-blue-600 com texto branco) */}
                      <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded shadow-sm">{item.marca || 'Destaque'}</span>
                      <span className="text-[10px] font-bold text-amber-500">★ {item.avaliacao || "4.8"}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-xs line-clamp-1">{item.nome}</h3>
                  </div>
                  <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between mt-3 bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-900">{item.faixa_preco || 'Consulte'}</span>
                    <a href={item.link_afiliado || '#'} target="_blank" rel="noopener noreferrer" className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm shadow-amber-500/20 transition">
                      <span>Oferta</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* NOTÍCIAS RECENTES */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Newspaper className="w-4 h-4 text-blue-600" />
                <h2>Últimas Notícias e Artigos</h2>
              </div>
              <Link href="/noticias" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {noticias.map((noticia: any) => (
                <Link 
                  key={noticia.id} 
                  href={`/noticias/${noticia.slug}`} 
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-300 transition flex flex-col group"
                >
                  <div className="h-32 w-full overflow-hidden bg-slate-100">
                    <img 
                      src={noticia.imagem_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&q=80"} 
                      alt={noticia.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                  </div>
                  <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(noticia.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 group-hover:text-blue-600 transition line-clamp-2">
                        {noticia.titulo}
                      </h3>
                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {noticia.resumo}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1 pt-1">
                      Ler artigo <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 space-y-3.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Perguntas Frequentes</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <h3 className="font-bold text-xs text-slate-800">{faq.pergunta}</h3>
                  <p className="text-[11px] text-slate-600">{faq.resposta}</p>
                </div>
              ))}
            </div>
          </section>

          <WhatsappBanner />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}