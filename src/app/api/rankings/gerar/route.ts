import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { subcategoria } = await request.json();

    if (!subcategoria) {
      return NextResponse.json({ error: 'Subcategoria não informada' }, { status: 400 });
    }

    const termoBusca = subcategoria.trim();
    const slugClean = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');

    // Busca todos os produtos do banco
    const { data: todosProdutos, error: produtoError } = await supabase
      .from('produtos')
      .select('*');

    if (produtoError || !todosProdutos) {
      return NextResponse.json(
        { error: 'Erro ao buscar produtos no banco de dados.' },
        { status: 500 }
      );
    }

    // TRAVAS RIGOROSAS DE FILTRAGEM POR SUBCATEGORIA
    const produtosFiltrados = todosProdutos.filter((p) => {
      const nome = (p.nome || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const catSlug = (p.categoria_slug || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');
      const subCadastrada = (p.subcategoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');

      // 1. TRAVA PARA IMPRESSORAS 3D FDM
      if (slugClean.includes('fdm') || (slugClean.includes('impressora') && !slugClean.includes('resina'))) {
        const eImpressora = nome.includes('impressora') || subCadastrada.includes('fdm') || catSlug.includes('fdm');
        const temProibido = 
          nome.includes('filamento') || 
          nome.includes('pla') || 
          nome.includes('petg') || 
          nome.includes('resina') || 
          nome.includes('aerografo') || 
          nome.includes('tinta') || 
          nome.includes('drone');
        return eImpressora && !temProibido;
      }

      // 2. TRAVA PARA FILAMENTOS PLA
      if (slugClean.includes('pla')) {
        const ePla = nome.includes('pla') || subCadastrada.includes('pla') || catSlug.includes('pla');
        const temProibido = 
          nome.includes('impressora') || 
          nome.includes('petg') || 
          nome.includes('resina') || 
          nome.includes('aerografo') || 
          nome.includes('drone');
        return ePla && !temProibido;
      }

      // 3. TRAVA PARA FILAMENTOS PETG
      if (slugClean.includes('petg')) {
        const ePetg = nome.includes('petg') || subCadastrada.includes('petg') || catSlug.includes('petg');
        const temProibido = 
          nome.includes('impressora') || 
          nome.includes('pla') || 
          nome.includes('resina') || 
          nome.includes('aerografo') || 
          nome.includes('drone');
        return ePetg && !temProibido;
      }

      // 4. TRAVA PARA IMPRESSORAS DE RESINA
      if (slugClean.includes('resina') && slugClean.includes('impressora')) {
        const eResinaImp = (nome.includes('resina') || nome.includes('sla') || nome.includes('msla')) && nome.includes('impressora');
        const temProibido = nome.includes('filamento') || nome.includes('pla');
        return eResinaImp && !temProibido;
      }

      // 5. TRAVA PARA RESINAS (Insumo)
      if (slugClean === 'resinas3d' || (slugClean.includes('resina') && !slugClean.includes('impressora'))) {
        const eResinaInsumo = nome.includes('resina') && !nome.includes('impressora');
        const temProibido = nome.includes('filamento') || nome.includes('impressora 3d');
        return eResinaInsumo && !temProibido;
      }

      // 6. TRAVA PARA AERÓGRAFOS
      if (slugClean.includes('aerografo')) {
        const eAero = nome.includes('aerografo') || nome.includes('tinta') || nome.includes('compressor') || nome.includes('bico') || subCadastrada.includes('aerografo');
        const temProibido = nome.includes('impressora 3d') || nome.includes('filamento');
        return eAero && !temProibido;
      }

      return subCadastrada.includes(slugClean) || catSlug.includes(slugClean);
    });

    if (produtosFiltrados.length === 0) {
      return NextResponse.json(
        { error: `Nenhum produto correspondente encontrado estritamente para "${subcategoria}".` },
        { status: 404 }
      );
    }

    // Mapeia os itens sem nota automática (nota: null por padrão)
    const rankingItens = produtosFiltrados.map((p, index) => ({
      posicao: index + 1,
      produto_id: p.id,
      nome: p.nome,
      nota: null, // Sem nota automática para todas as categorias geradas
      destaque: p.destaque_tag || `Destaque em performance na categoria ${subcategoria}`,
      pontos_fortes: p.pontos_fortes?.length > 0 ? p.pontos_fortes : [
        'Construção robusta e de alta durabilidade',
        'Excelente desempenho em demandas exigentes',
        'Ótima recepção e avaliações no mercado'
      ],
      pontos_fracos: ['Verificar especificações técnicas para o seu projeto'],
      veredito: p.descricao || `O modelo ${p.nome} integra a curadoria especializada de ${subcategoria}, indicado para projetos que buscam confiabilidade e eficiência.`,
      preco: p.preco,
      imagem: p.imagem_url,
      link_afiliado: p.link_afiliado
    }));

    const dadosGerados = {
      introducao_embate: `Guia atualizado de ${subcategoria}. Reunimos as principais opções disponíveis no mercado desta categoria para ajudar você a comparar e escolher o equipamento ideal conforme o seu objetivo.`,
      ranking: rankingItens
    };

    const payloadSalvar = {
      subcategoria: termoBusca,
      introducao_embate: dadosGerados.introducao_embate,
      ranking: dadosGerados.ranking,
      atualizado_em: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('rankings_salvos')
      .upsert(payloadSalvar, { onConflict: 'subcategoria' });

    if (upsertError) {
      throw upsertError;
    }

    return NextResponse.json({ success: true, data: dadosGerados });
  } catch (err: any) {
    console.error('Erro interno ao processar ranking:', err);
    return NextResponse.json({ error: err.message || 'Erro interno ao gerar ranking' }, { status: 500 });
  }
}