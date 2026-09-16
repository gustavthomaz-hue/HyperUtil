import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idRaw = searchParams.get('id');

  if (!idRaw) {
    return NextResponse.json({ error: 'ID não informado' }, { status: 400 });
  }

  // Se o usuário colou um link inteiro, extrai o wid=MLB... ou o primeiro MLB que achar
  let targetId = idRaw;
  const widMatch = idRaw.match(/wid=(MLB\d+)/i);
  if (widMatch) {
    targetId = widMatch[1];
  } else {
    const mlbMatch = idRaw.match(/MLB-?\d+/i);
    if (mlbMatch) targetId = mlbMatch[0].replace('-', '');
  }

  const numericOnly = targetId.replace(/\D/g, '');
  const cleanId = `MLB${numericOnly}`;

  try {
    const res = await fetch(`https://api.mercadolibre.com/items/${cleanId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.price) {
        const precoFormatado = data.price.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
        return NextResponse.json({ preco: precoFormatado });
      }
    }

    return NextResponse.json({ error: 'Preço não encontrado para este ID' }, { status: 404 });
  } catch (error) {
    console.error('Erro na API preco-ml:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}