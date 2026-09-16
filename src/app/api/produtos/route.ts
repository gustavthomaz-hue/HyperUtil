import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Função para gerar o slug amigável para URL (Ex: "Filamento PLA 3D" -> "filamento-pla-3d")
function gerarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '')     // Remove caracteres especiais
    .replace(/[\s_-]+/g, '-')      // Substitui espaços por hífen
    .replace(/^-+|-+$/g, '')       // Remove hífens no início e fim
    + '-' + Date.now().toString().slice(-4); // Adiciona sufixo único para evitar duplicados
}

// GET: Listar produtos
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro Supabase GET:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Criar ou Atualizar produto
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.nome) {
      return NextResponse.json({ error: 'O nome do produto é obrigatório.' }, { status: 400 });
    }

    const payload: Record<string, any> = {
      nome: body.nome,
      slug: gerarSlug(body.nome),
      marca: body.marca || null,
      categoria: body.categoria || null,
      subcategoria: body.subcategoria || null,
      loja: body.loja || null,
      faixa_preco: body.faixa_preco || null,
      imagem_url: body.imagem_url || null,
      link_afiliado: body.link_afiliado,
      opcao_vinculada: body.opcao_vinculada || null,
      ativo: body.ativo ?? true,
      destacado: body.destacado ?? false, // <--- ADICIONADO AQUI
      
      // Especificações Técnicas:
      volume_impressao: body.volume_impressao || null,
      velocidade_maxima: body.velocidade_maxima || null,
      temperatura_bico: body.temperatura_bico || null,
      nivelamento: body.nivelamento || null,
      conectividade: body.conectividade || null,
    };

    let result;

    if (body.id) {
      // Em edições, não atualizamos o slug para manter a URL antiga intacta
      delete payload.slug;

      result = await supabase
        .from('produtos')
        .update(payload)
        .eq('id', body.id)
        .select();
    } else {
      // Inserção de novo registro com o slug gerado
      result = await supabase
        .from('produtos')
        .insert([payload])
        .select();
    }

    if (result.error) {
      console.error('Erro detalhado Supabase POST:', result.error);
      return NextResponse.json(
        { error: `Erro no Banco (${result.error.code}): ${result.error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error('Erro interno POST produtos:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno ao salvar no banco' },
      { status: 500 }
    );
  }
}

// DELETE: Excluir produto
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const { error } = await supabase.from('produtos').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}