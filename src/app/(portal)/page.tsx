import Link from 'next/link';
import { Swords, Trophy, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        
        {/* Hero Section */}
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3">
            <span className="inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
              Decisões de compra sem achismo
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Compare, escolha e compre a impressora 3D certa
            </h1>
            <p className="text-slate-600 text-xs leading-relaxed max-w-xl">
              Duelos lado a lado, rankings de insumos e um recomendador inteligente. Tudo com prós, contras e as melhores ofertas das principais lojas.
            </p>
            
            <div className="pt-1">
              <Link href="/recomendador" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Descobrir minha impressora ideal
              </Link>
            </div>
          </div>

          {/* Card Compacto de Duelo */}
          <div className="md:col-span-5 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
              <Swords className="h-3.5 w-3.5" />
              <span>Duelo em destaque</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 items-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center space-y-1">
                <div className="h-12 flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200" alt="Anycubic" className="max-h-full object-contain" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 truncate">Anycubic</div>
                <div className="text-[9px] font-bold text-amber-500">★ 4.6</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center space-y-1">
                <div className="h-12 flex items-center justify-center">
                  <img src="https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=200" alt="Bambu Lab" className="max-h-full object-contain" />
                </div>
                <div className="text-[10px] font-bold text-slate-800 truncate">Bambu Lab</div>
                <div className="text-[9px] font-bold text-amber-500">★ 4.8</div>
              </div>
            </div>

            <Link 
              href="/duelos"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition uppercase tracking-wider shadow-sm"
            >
              Ver duelo completo →
            </Link>
          </div>
        </div>

        {/* Cards Inferiores */}
        <div className="grid md:grid-cols-3 gap-4 pb-4">
          <Link 
            href="/duelos" 
            className="block bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-blue-300 transition group"
          >
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Swords className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs mb-0.5">Duelos de Impressoras</h3>
            <p className="text-[10px] text-slate-500 leading-normal">Comparativos técnicos lado a lado com prós e contras detalhados.</p>
          </Link>

          <Link href="/rankings" className="block bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-blue-300 transition group">
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs mb-0.5">Rankings de Insumos</h3>
            <p className="text-[10px] text-slate-500 leading-normal">Os melhores filamentos, aerógrafos e ferramentas testados.</p>
          </Link>

          <Link href="/recomendador" className="block bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:border-blue-300 transition group">
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <h3 className="font-bold text-slate-900 text-xs mb-0.5">Recomendador</h3>
            <p className="text-[10px] text-slate-500 leading-normal">Responda poucas perguntas e receba a indicação ideal para seu perfil.</p>
          </Link>
        </div>

      </div>
    </div>
  );
}