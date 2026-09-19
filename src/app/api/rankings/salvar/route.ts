import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { subcategoria, introducao_embate, ranking } = await request.json();

    if (!subcategoria) {
      return NextResponse.json({ error: 'Subcategoria obrigatória' }, { status: 400 });
    }

    const payload = {
      subcategoria: subcategoria.trim(),
      introducao_embate,
      ranking,
      atualizado_em: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('rankings_salvos')
      .upsert(payload, { onConflict: 'subcategoria' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao salvar ranking:', err);
    return NextResponse.json({ error: err.message || 'Erro ao salvar' }, { status: 500 });
  }
}