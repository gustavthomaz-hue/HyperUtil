import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      source: 'fallback',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      title: query,
    });
  }

  try {
    const response = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        gl: 'br',
        hl: 'pt-br',
        num: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.images && data.images.length > 0) {
      const firstImage = data.images[0];
      return NextResponse.json({
        source: 'serper',
        url: firstImage.imageUrl,
        title: firstImage.title || query,
      });
    }

    // Fallback caso não encontre imagem
    return NextResponse.json({
      source: 'fallback',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      title: query,
    });
  } catch (error) {
    console.error('Erro na busca via Serper:', error);
    return NextResponse.json({
      source: 'fallback',
      url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      title: query,
    });
  }
}