import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Converte a imagem enviada para Base64 Data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/png';
    const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

    return NextResponse.json({ url: base64Image });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    return NextResponse.json({ error: 'Falha ao processar arquivo' }, { status: 500 });
  }
}