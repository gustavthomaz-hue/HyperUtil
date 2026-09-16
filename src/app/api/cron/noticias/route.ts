import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Trava de segurança opcional: só roda se for a Vercel ou com Token
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const { data: configData } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'automacao_noticias')
      .single();

    const config = configData?.valor;

    if (!config || !config.ativo) {
      return NextResponse.json({ success: false, message: 'Automação inativa' });
    }

    // Sorteia um foco aleatório da lista configurada
    const focosTexto = config.categoria_padrao || 'Impressão 3D, Tecnologia, Drones, Eletrônicos';
    const listaFocos = focosTexto.split(',').map((f: string) => f.trim()).filter(Boolean);
    const temaSorteado = listaFocos[Math.floor(Math.random() * listaFocos.length)];

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/noticias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produto: temaSorteado,
        categoria: 'Mercado',
        detalhes: 'Crie uma notícia inédita e atrativa com um título exclusivo sobre lançamentos ou tendências do setor.',
      }),
    });

    const result = await res.json();

    if (!result.success || !result.data) {
      return NextResponse.json({ success: false, error: 'Falha ao gerar notícia pela IA' });
    }

    const titulo = result.data.titulo || `Análise e Novidades: ${result.data.produto}`;
    const resumo = result.data.resumo || `Confira as últimas atualizações sobre ${result.data.produto}.`;

    // Slug limpo e padronizado (chave única para evitar duplicatas)
    const slugUnico = titulo
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Upsert blindado utilizando explicitamente a constraint de conflito no slug
    const { error } = await supabase.from('noticias').upsert(
      [
        {
          titulo,
          slug: slugUnico,
          resumo,
          conteudo: result.data.conteudo,
          categoria: 'Mercado',
          imagem_url: result.data.imagemUrl || '',
          publicado: true,
        },
      ],
      { onConflict: 'slug' }
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Matéria sobre "${temaSorteado}" gerada e processada com sucesso via cron!`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}