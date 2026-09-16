"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";

interface Subtema {
  nome: string;
  slug: string;
  descricao: string;
}

interface Categoria {
  id: string;
  titulo: string;
  icone: string;
  descricao: string;
  subtemas: Subtema[];
}

const CATEGORIAS: Categoria[] = [
  {
    id: "impressao-3d",
    titulo: "Impressão 3D",
    icone: "🖨️",
    descricao: "Rankings de impressoras, filamentos, resinas e insumos.",
    subtemas: [
      { nome: "Impressoras 3D FDM", slug: "impressoras-3d-fdm", descricao: "As melhores impressoras de filamento para iniciantes e pro" },
      { nome: "Filamentos PLA", slug: "filamentos-pla", descricao: "Top filamentos PLA com melhor fluidez e acabamento" },
      { nome: "Filamentos PETG", slug: "filamentos-petg", descricao: "Opções resistentes para peças estruturais" },
      { nome: "Impressoras 3D Resina", slug: "impressoras-3d-resina", descricao: "Precisão máxima para miniaturas e odontologia" },
      { nome: "Resinas 3D", slug: "resinas", descricao: "Resinas padrão, laváveis em água e de alta resistência" },
      { nome: "Aerógrafos", slug: "aerografos-tintas", descricao: "Materiais para pintura e acabamento de peças 3D" },
    ],
  },
  {
    id: "drones",
    titulo: "Drones",
    icone: "🚁",
    descricao: "Ranking de marcas e modelos de drones mais conhecidos do mercado",
    subtemas: [
      { nome: "Drones para Iniciantes", slug: "drones-iniciantes", descricao: "Modelos acessíveis e fáceis de pilotar" },
      { nome: "Drones intermediários", slug: "drones-intermediarios", descricao: "Drones para filmagens dinâmicas e de alta velocidade" },
      { nome: "Drones avançados", slug: "drones-avancados", descricao: "Para filmagens padrão cinematográfico" },
    ],
  },
];

export default function RankingsMainPage() {
  const [gavetaAberta, setGavetaAberta] = useState<string | null>(null);

  const toggleGaveta = (id: string) => {
    setGavetaAberta(gavetaAberta === id ? null : id);
  };

  return (
    <div className="w-full flex justify-center bg-[#F8FAFC] min-h-screen text-slate-800 font-sans pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        
        {/* Cabeçalho da Seção */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            Guias & Comparativos
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Central de Rankings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto">
            Escolha um nicho e navegue pelas subcategorias para encontrar os melhores produtos testados e avaliados.
          </p>
        </div>

        {/* Lista de Categorias */}
        <div className="space-y-4">
          {CATEGORIAS.map((cat) => {
            const isOpen = gavetaAberta === cat.id;

            return (
              <div
                key={cat.id}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleGaveta(cat.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl sm:text-3xl h-14 w-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      {cat.icone}
                    </span>
                    <div className="space-y-0.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">{cat.titulo}</h2>
                      <p className="text-xs text-slate-500">{cat.descricao}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 hidden sm:inline-block">
                      {cat.subtemas.length} subcategorias
                    </span>
                    <span
                      className={`h-7 w-7 rounded-xl bg-slate-50 text-slate-400 font-bold flex items-center justify-center transition-transform duration-200 text-xs ${
                        isOpen ? "rotate-180 bg-blue-50 text-blue-600" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cat.subtemas.map((sub) => (
                      <Link
                        key={sub.slug}
                        href={`/rankings/${sub.slug}`}
                        className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-sm transition flex items-center justify-between group"
                      >
                        <div className="space-y-0.5 pr-2">
                          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-xs sm:text-sm">
                            {sub.nome}
                          </h3>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {sub.descricao}
                          </p>
                        </div>
                        <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition text-xs shrink-0">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}