import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, X, ShieldCheck, Trophy, MessageCircle } from 'lucide-react';

export const revalidate = 0;

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DueloPage({ params }: Props) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const { data: duelo } = await supabase
    .from('duelos')
    .select(`
      *,
      produto1:produtos!duelos_produto1_id_fkey(*),
      produto2:produtos!duelos_produto2_id_fkey(*)
    `)
    .eq('slug', slug)
    .single();

  if (!duelo) {
    notFound();
  }

  const { produto1, produto2 } = duelo;

  let iaData: any = {};
  try {
    if (duelo.resumo_ia) {
      iaData = typeof duelo.resumo_ia === 'string' ? JSON.parse(duelo.resumo_ia) : duelo.resumo_ia;
    }
  } catch (e) {
    iaData = {};
  }

  const pros1 = iaData.pros_produto1 || iaData.pros1 || [];
  const contras1 = iaData.contras_produto1 || iaData.contras1 || [];
  const pros2 = iaData.pros_produto2 || iaData.pros2 || [];
  const contras2 = iaData.contras_produto2 || iaData.contras2 || [];
  const veredito = iaData.veredito || iaData.resumo_ia || '';
  const melhorCustoBeneficio = iaData.melhor_custo_beneficio || iaData.melhorCustoBeneficio || produto1?.nome || produto1?.titulo || '';

  const getSpecs = (prod: any, iaSpecs: any) => {
    return {
      volume: iaSpecs?.volume || prod?.especificacoes?.volume || prod?.volume_impressao || 'Não informado',
      velocidade: iaSpecs?.velocidade || prod?.especificacoes?.velocidade || prod?.velocidade_maxima || 'Não informado',
      temperatura: iaSpecs?.temperatura || prod?.especificacoes?.temperatura || prod?.temperatura_bico || 'Não informado',
      nivelamento: iaSpecs?.nivelamento || prod?.especificacoes?.nivelamento || prod?.nivelamento || 'Não informado',
      conectividade: iaSpecs?.conectividade || prod?.especificacoes?.conectividade || prod?.conectividade || 'Não informado'
    };
  };

  const specs1 = getSpecs(produto1, iaData.specs_produto1 || iaData.especificacoes_produto1);
  const specs2 = getSpecs(produto2, iaData.specs_produto2 || iaData.especificacoes_produto2);

  return (
    <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">

        {/* Cabeçalho de Navegação e Tag */}
        <div className="flex items-center justify-between">
          <Link href="/duelos" className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-blue-600 transition">
            <ArrowLeft className="h-4 w-4" />
            Voltar para todos os duelos
          </Link>
          <span className="text-xs font-bold bg-purple-50 text-purple-600 px-3.5 py-1.5 rounded-full border border-purple-100 flex items-center gap-1.5 shadow-sm">
            Duelo Técnico
          </span>
        </div>

        {/* Título */}
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {produto1?.nome || produto1?.titulo} <span className="text-purple-600">vs</span> {produto2?.nome || produto2?.titulo}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Análise detalhada de especificações, prós, contras e recomendação técnica com inteligência artificial.
          </p>
        </div>

        {/* Cards Lado a Lado */}
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Produto 1 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="text-center space-y-3">
              <div className="h-40 flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <img 
                  src={produto1?.imagem_url || produto1?.foto_url || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400"} 
                  alt={produto1?.nome || produto1?.titulo} 
                  className="max-h-full object-contain"
                />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md uppercase border border-purple-100">
                {produto1?.categoria || produto1?.subcategoria || 'Impressora 3D'}
              </span>
              <h2 className="text-lg font-black text-slate-900 line-clamp-2">{produto1?.nome || produto1?.titulo}</h2>
              <div className="text-lg font-black text-emerald-600">
                {produto1?.preco ? `R$ ${Number(produto1.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : (produto1?.faixa_preco || 'Consulte')}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> PONTOS FORTES
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {pros1.length > 0 ? pros1.map((pro: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span> {pro}
                    </li>
                  )) : <li className="text-slate-400 italic">Nenhum ponto forte listado.</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> PONTOS FRACOS
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {contras1.length > 0 ? contras1.map((contra: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span> {contra}
                    </li>
                  )) : <li className="text-slate-400 italic">Nenhum ponto fraco listado.</li>}
                </ul>
              </div>
            </div>

            {produto1?.link_afiliado && (
              <a 
                href={produto1.link_afiliado}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm uppercase tracking-wider"
              >
                COMPRAR {produto1?.nome || produto1?.titulo}
              </a>
            )}
          </div>

          {/* Produto 2 */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="text-center space-y-3">
              <div className="h-40 flex items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <img 
                  src={produto2?.imagem_url || produto2?.foto_url || "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400"} 
                  alt={produto2?.nome || produto2?.titulo} 
                  className="max-h-full object-contain"
                />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md uppercase border border-purple-100">
                {produto2?.categoria || produto2?.subcategoria || 'Impressora 3D'}
              </span>
              <h2 className="text-lg font-black text-slate-900 line-clamp-2">{produto2?.nome || produto2?.titulo}</h2>
              <div className="text-lg font-black text-emerald-600">
                {produto2?.preco ? `R$ ${Number(produto2.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : (produto2?.faixa_preco || 'Consulte')}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> PONTOS FORTES
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {pros2.length > 0 ? pros2.map((pro: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span> {pro}
                    </li>
                  )) : <li className="text-slate-400 italic">Nenhum ponto forte listado.</li>}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <X className="h-3.5 w-3.5" /> PONTOS FRACOS
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {contras2.length > 0 ? contras2.map((contra: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span> {contra}
                    </li>
                  )) : <li className="text-slate-400 italic">Nenhum ponto fraco listado.</li>}
                </ul>
              </div>
            </div>

            {produto2?.link_afiliado && (
              <a 
                href={produto2.link_afiliado}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-sm uppercase tracking-wider"
              >
                COMPRAR {produto2?.nome || produto2?.titulo}
              </a>
            )}
          </div>
        </div>

        {/* Tabela Comparativa de Especificações */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Tabela Comparativa de Especificações</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3 font-bold">ESPECIFICAÇÃO</th>
                  <th className="py-3 px-3 font-bold text-purple-600">{produto1?.nome || produto1?.titulo}</th>
                  <th className="py-3 px-3 font-bold text-purple-600">{produto2?.nome || produto2?.titulo}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-500">Volume de Impressão</td>
                  <td className="py-3 px-3">{specs1.volume}</td>
                  <td className="py-3 px-3">{specs2.volume}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-500">Velocidade Máxima</td>
                  <td className="py-3 px-3">{specs1.velocidade}</td>
                  <td className="py-3 px-3">{specs2.velocidade}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-500">Temperatura do Bico</td>
                  <td className="py-3 px-3">{specs1.temperatura}</td>
                  <td className="py-3 px-3">{specs2.temperatura}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-500">Nivelamento</td>
                  <td className="py-3 px-3">{specs1.nivelamento}</td>
                  <td className="py-3 px-3">{specs2.nivelamento}</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-500">Conectividade</td>
                  <td className="py-3 px-3">{specs1.conectividade}</td>
                  <td className="py-3 px-3">{specs2.conectividade}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Veredito da IA */}
        {veredito && (
          <div className="bg-[#1e1035] text-white rounded-2xl p-6 sm:p-8 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>VEREDITO DA IA RECOMENDADORA</span>
            </div>
            
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm sm:text-base tracking-wide">
              <Trophy className="h-5 w-5 shrink-0" />
              <span>Melhor Custo-Benefício: {melhorCustoBeneficio}</span>
            </div>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{veredito}</p>

            <div className="pt-4 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="text-xs font-bold text-white">Quer receber alertas de promoções dessas impressoras?</p>
                <p className="text-[11px] text-purple-300">Entre no nosso grupo exclusivo e receba cupom em primeira mão.</p>
              </div>
              <a
                href="https://whatsapp.com/channel/0029VbDrSu40bIdmU5sqjH2J" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-full text-xs flex items-center gap-2 transition shadow-md shrink-0"
              >
                <MessageCircle className="h-4 w-4" />
                ENTRAR NO CANAL DE OFERTAS
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}