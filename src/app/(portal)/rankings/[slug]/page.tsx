"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Produto {
  id: string;
  nome: string;
  marca?: string;
  categoria?: string;
  categoria_slug?: string;
  preco?: number | string;
  imagem_url?: string;
  link_afiliado?: string;
  nota?: number | string;
  pontos_fortes?: string[];
  destaque_tag?: string;
}

export default function RankingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = use(params as Promise<{ slug: string }>);
  const slug = resolvedParams?.slug || "";

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchProdutos() {
      try {
        setLoading(true);
        const slugLower = slug.toLowerCase().trim();

        const { data, error } = await supabase.from("produtos").select("*");

        if (error) {
          console.error("Erro Supabase:", error.message);
          setProdutos([]);
        } else if (data) {
          const filtrados = data.filter((p) => {
            const catSlug = (p.categoria_slug || "").toLowerCase().trim();
            const catNome = (p.categoria || "").toLowerCase().trim();
            const nomeProduto = (p.nome || "").toLowerCase().trim();

            const limpar = (str: string) => str.replace(/[\(\)\-\s]/g, "");
            const slugClean = limpar(slugLower);
            const catSlugClean = limpar(catSlug);
            const catNomeClean = limpar(catNome);

            // 1. TRAVA RIGOROSA PARA DRONES
            if (slugClean.includes("drone")) {
              const eDrone = nomeProduto.includes("drone") || catSlugClean.includes("drone") || catNomeClean.includes("drone");
              const temProibido = nomeProduto.includes("impressora") || nomeProduto.includes("filamento") || nomeProduto.includes("resina") || nomeProduto.includes("aerografo");
              return eDrone && !temProibido;
            }

            // 2. TRAVA RIGOROSA PARA IMPRESSORAS 3D FDM
            if (slugClean.includes("fdm") || (slugClean.includes("impressora") && !slugClean.includes("resina"))) {
              const eImpressora = nomeProduto.includes("impressora") || catSlugClean.includes("fdm");
              const temProibido =
                nomeProduto.includes("filamento") ||
                nomeProduto.includes("petg") ||
                nomeProduto.includes("pla") ||
                nomeProduto.includes("resina") ||
                nomeProduto.includes("aerografo") ||
                nomeProduto.includes("tinta") ||
                nomeProduto.includes("drone");
              return eImpressora && !temProibido;
            }

            // 3. TRAVA PARA FILAMENTOS PLA
            if (slugClean.includes("pla")) {
              const ePla = nomeProduto.includes("pla") || catSlugClean.includes("pla") || catNomeClean.includes("pla");
              const temProibido = nomeProduto.includes("impressora") || nomeProduto.includes("aerografo") || nomeProduto.includes("resina") || nomeProduto.includes("drone") || nomeProduto.includes("petg");
              return ePla && !temProibido;
            }

            // 4. TRAVA PARA FILAMENTOS PETG
            if (slugClean.includes("petg")) {
              const ePetg = nomeProduto.includes("petg") || catSlugClean.includes("petg") || catNomeClean.includes("petg");
              const temProibido = nomeProduto.includes("impressora") || nomeProduto.includes("aerografo") || nomeProduto.includes("drone") || nomeProduto.includes("pla");
              return ePetg && !temProibido;
            }

            // 5. TRAVA PARA RESINAS / IMPRESSORAS DE RESINA
            if (slugClean.includes("resina")) {
              const eResina = nomeProduto.includes("resina") || catSlugClean.includes("resina") || catNomeClean.includes("resina");
              const temProibido = nomeProduto.includes("filamento") || nomeProduto.includes("aerografo") || nomeProduto.includes("drone");
              return eResina && !temProibido;
            }

            // 6. TRAVA PARA AERÓGRAFOS E TINTAS
            if (slugClean.includes("aerografo") || slugClean.includes("tinta")) {
              const eAero = nomeProduto.includes("aerografo") || nomeProduto.includes("tinta") || catSlugClean.includes("aerografo") || catNomeClean.includes("aerografo");
              const temProibido = nomeProduto.includes("impressora") || nomeProduto.includes("filamento") || nomeProduto.includes("drone");
              return eAero && !temProibido;
            }

            // Fallback restrito para outras categorias
            return catSlugClean.includes(slugClean) || slugClean.includes(catSlugClean);
          });

          const ordenados = [...filtrados].sort(
            (a, b) => Number(b.nota || 0) - Number(a.nota || 0)
          );

          setProdutos(ordenados);
        }
      } catch (err) {
        console.error("Erro geral:", err);
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, [slug]);

  const tituloFormatado = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "";

  return (
    // Alterado de max-w-7xl para max-w-3xl, padronizando com as demais páginas
    <main className="flex-1 w-full flex justify-center pb-16">
      <div className="w-full max-w-3xl px-6 pt-6 space-y-6">
        <div>
          <Link
            href="/rankings"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mb-3"
          >
            ← Voltar para todas as categorias
          </Link>
          <span className="text-blue-600 text-xs font-bold tracking-wider uppercase block mb-1">
            Ranking Atualizado 2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Melhores {tituloFormatado}
          </h1>
          <p className="text-slate-600 text-xs mt-1.5 max-w-2xl leading-relaxed">
            Seleção completa dos melhores modelos com base em testes, avaliações e custo-benefício.
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium text-xs">
              Carregando ranking...
            </div>
          ) : produtos.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
              Nenhum produto cadastrado para essa categoria ainda.
            </div>
          ) : (
            produtos.map((item, index) => {
              const posicao = index + 1;
              return (
                <div
                  key={item.id || index}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition grid md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      #{posicao}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 h-20 w-full rounded-xl flex items-center justify-center text-xs font-semibold text-slate-400 overflow-hidden p-2">
                      {item.imagem_url ? (
                        <img
                          src={item.imagem_url}
                          alt={item.nome}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span>[Sem Imagem]</span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <div className="flex items-center gap-2">
                      {item.marca && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {item.marca}
                        </span>
                      )}
                      {(item.destaque_tag || item.categoria) && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.destaque_tag || item.categoria}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.nome}</h3>
                    {item.pontos_fortes && item.pontos_fortes.length > 0 && (
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        {item.pontos_fortes.map((pro, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="text-emerald-600 font-bold">✓</span> {pro}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="md:col-span-3 flex md:flex-col justify-between md:justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">A partir de</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {typeof item.preco === "number"
                          ? `R$ ${item.preco}`
                          : item.preco || "Sob consulta"}
                      </span>
                      {item.nota && (
                        <div className="text-amber-500 text-[11px] font-bold mt-0.5">
                          ★ {item.nota}
                        </div>
                      )}
                    </div>

                    <a
                      href={item.link_afiliado || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-[11px] transition text-center w-full shadow-sm"
                    >
                      Ver Melhor Oferta →
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}