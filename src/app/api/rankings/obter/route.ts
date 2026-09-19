import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoriaParam = searchParams.get('subcategoria');

    if (!subcategoriaParam) {
      return NextResponse.json({ error: 'Subcategoria não informada' }, { status: 400 });
    }

    const termoBusca = subcategoriaParam.trim();
    const slugBuscaClean = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');

    // Busca todos os registros para comparar os slugs normalizados
    const { data: rankings, error } = await supabase
      .from('rankings_salvos')
      .select('*');

    if (error) {
      throw error;
    }

    const rankingEncontrado = rankings?.find((r) => {
      const slugSalvoClean = (r.subcategoria || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\(\)\-\s]/g, '');
      return slugSalvoClean === slugBuscaClean || slugSalvoClean.includes(slugBuscaClean) || slugBuscaClean.includes(slugSalvoClean);
    });

    if (!rankingEncontrado) {
      return NextResponse.json({ ranking: null }, { status: 200 });
    }

    return NextResponse.json({ ranking: rankingEncontrado });
  } catch (err: any) {
    console.error('Erro ao obter ranking:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}