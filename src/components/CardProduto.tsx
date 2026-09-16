'use client';

import { useState, useEffect } from 'react';
import { registrarClique } from '@/lib/analytics';

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  loja: string;
  faixaPreco: string;
  linkAfiliado: string;
  imagemUrl?: string;
  idIntegracaoAPI?: string;
  ativo: boolean;
}

export default function CardProduto({ produto }: { produto: Produto }) {
  const [precoApi, setPrecoApi] = useState<string | null>(null);
  const [imagemApi, setImagemApi] = useState<string | null>(null);

  useEffect(() => {
    if (produto.idIntegracaoAPI && produto.idIntegracaoAPI.trim() !== '') {
      fetch(`/api/preco-ml?id=${produto.idIntegracaoAPI}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.preco) setPrecoApi(data.preco);
          if (data.imagem) setImagemApi(data.imagem);
        })
        .catch(() => {});
    }
  }, [produto.idIntegracaoAPI]);

  // Prioriza: 1. Imagem via Upload/URL manual, 2. API do ML, 3. Fallback
  const imagemExibida = produto.imagemUrl || imagemApi;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="w-full h-48 bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden p-2 relative">
          {imagemExibida ? (
            <img
              src={imagemExibida}
              alt={produto.nome}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-slate-400 text-sm">Sem imagem</span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">
            {produto.categoria} {produto.subcategoria && `• ${produto.subcategoria}`}
          </span>
          <span className="font-semibold text-slate-400">{produto.loja}</span>
        </div>

        <h3 className="font-bold text-slate-800 text-lg mb-3 line-clamp-2">
          {produto.nome}
        </h3>
      </div>

      <div>
        <div className="mb-4">
          <span className="text-xs text-slate-400 block mb-0.5">
            {precoApi ? 'Preço Atual no ML' : 'Faixa de Preço'}
          </span>
          <span className="text-xl font-extrabold text-emerald-600">
            {precoApi || produto.faixaPreco}
          </span>
        </div>

        <a
          href={produto.linkAfiliado}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => registrarClique('afiliado', produto.nome)}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          Ver na Loja
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}