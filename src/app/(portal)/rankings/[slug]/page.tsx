"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ItemRanking {
  posicao: number;
  produto_id: string;
  nome: string;
  nota?: number | string;
  destaque?: string;
  veredito?: string;
  preco?: number | string;
  precoNumerico?: number;
  imagem?: string;
  link_afiliado?: string;
}

export default function RankingSlugPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = use(params as Promise<{ slug: string }>);
  const slug = resolvedParams?.slug || "";

  const [introducao, setIntroducao] = useState("");
  const [itensRanking, setItensRanking] = useState<ItemRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function fetchRankingSalvo() {
      try {
        setLoading(true);
        const termoBusca = decodeURIComponent(slug).replace(/-/g, " ").trim();
        const slugBuscaClean = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');

        const { data: rankings, error } = await supabase
          .from("rankings_salvos")
          .select("*");

        if (error || !rankings) {
          throw error;
        }

        const data = rankings.find((r) => {
          const slugSalvoClean = (r.subcategoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');
          return slugSalvoClean === slugBuscaClean || slugSalvoClean.includes(slugBuscaClean) || slugBuscaClean.includes(slugSalvoClean);
        });

        if (!data) {
          console.warn("Nenhum ranking salvo encontrado para:", termoBusca);
          setItensRanking([]);
        } else {
          setIntroducao(data.introducao_embate || "");
          
          const itensBrutos = data.ranking || [];
          const { data: todosProdutos } = await supabase.from("produtos").select("*");

          const itensEnriquecidos = itensBrutos.map((item: any, index: number) => {
            const produtoReal = todosProdutos?.find(
              (p) => p.id === item.produto_id || p.nome.toLowerCase() === item.nome.toLowerCase()
            );

            const precoBruto = item.preco || produtoReal?.preco || "Sob consulta";
            
            // Atribuição inteligente de peso/preço baseada no nome para ordenar do mais barato ao mais caro caso esteja como "Sob consulta"
            let precoNum = 99999;
            const nomeLower = (item.nome || "").toLowerCase();

            if (typeof precoBruto === "number") {
              precoNum = precoBruto;
            } else if (typeof precoBruto === "string" && precoBruto.toLowerCase() !== "sob consulta" && precoBruto.trim() !== "") {
              const limpo = precoBruto.replace(/[^\d,\.]/g, "").replace(/\./g, "").replace(",", ".");
              const parsed = parseFloat(limpo);
              if (!isNaN(parsed)) precoNum = parsed;
            }

            // Fallback de ordenação por relevância de porte/preço se o banco estiver como "Sob consulta"
            if (precoNum === 99999) {
              if (nomeLower.includes("mini") || nomeLower.includes("a1 mini")) precoNum = 1500;
              else if (nomeLower.includes("ender") || nomeLower.includes("neptune 3")) precoNum = 1800;
              else if (nomeLower.includes("bambu lab a1") || nomeLower.includes("k1")) precoNum = 3200;
              else if (nomeLower.includes("creator") || nomeLower.includes("multicor") || nomeLower.includes("u1")) precoNum = 5500;
              else precoNum = 2500 + index * 100; // Mantém uma base consistente
            }

            return {
              ...item,
              veredito: "", 
              imagem: item.imagem || produtoReal?.imagem_url || "",
              preco: precoBruto,
              precoNumerico: precoNum,
              link_afiliado: item.link_afiliado || produtoReal?.link_afiliado || "#",
            };
          });

          // Ordena rigorosamente do menor preço/porte para o maior (mais baratos no topo) com tipos definidos
          itensEnriquecidos.sort((a: ItemRanking, b: ItemRanking) => (a.precoNumerico || 0) - (b.precoNumerico || 0));

          setItensRanking(itensEnriquecidos);
        }
      } catch (err) {
        console.error("Erro ao buscar ranking salvo:", err);
        setItensRanking([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRankingSalvo();
  }, [slug]);

  const tituloFormatado = slug
    ? decodeURIComponent(slug).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "";

  const tituloLimpo = tituloFormatado.replace(/tintas/gi, "").trim();

  return (
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
            {tituloLimpo.toLowerCase().includes("melhores") ? tituloLimpo : `Melhores ${tituloLimpo}`}
          </h1>
          {introducao ? (
            <p className="text-slate-600 text-xs mt-2 max-w-2xl leading-relaxed">
              {introducao}
            </p>
          ) : (
            <p className="text-slate-600 text-xs mt-1.5 max-w-2xl leading-relaxed">
              Seleção completa dos melhores modelos com base em testes, avaliações e custo-benefício.
            </p>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium text-xs">
              Carregando ranking...
            </div>
          ) : itensRanking.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs">
              Nenhum ranking configurado para esta categoria ainda. Acesse o painel admin e clique em "✨ Gerar IA".
            </div>
          ) : (
            itensRanking.map((item, index) => {
              const posicaoVisual = index + 1;
              return (
                <div
                  key={item.produto_id || index}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition grid md:grid-cols-12 gap-4 items-center"
                >
                  <div className="md:col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                      #{posicaoVisual}
                    </div>
                    <div className="bg-slate-50 border border-slate-100 h-20 w-full rounded-xl flex items-center justify-center text-xs font-semibold text-slate-400 overflow-hidden p-2">
                      {item.imagem ? (
                        <img
                          src={item.imagem}
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
                      {item.destaque && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.destaque}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.nome}</h3>
                  </div>

                  <div className="md:col-span-3 flex md:flex-col justify-between md:justify-center items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">A partir de</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {typeof item.preco === "number" && item.preco > 0
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
                      className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-black py-2.5 px-3 rounded-xl text-[11px] transition text-center w-full shadow-sm flex items-center justify-center gap-1 border border-amber-500"
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