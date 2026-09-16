import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GROQ_API_KEY não configurada no .env.local' },
        { status: 500 }
      );
    }

    const { prompt } = await request.json();
    const groq = new Groq({ apiKey });

    // Chamada direta para o modelo de texto ativo na sua conta
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente útil de SEO. Responda estritamente em formato JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' },
    });

    const textoGerado = completion.choices[0]?.message?.content || '{}';

    return NextResponse.json({ resultado: textoGerado });
  } catch (err: any) {
    console.error('Erro na API Groq:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar com a IA.' },
      { status: 500 }
    );
  }
}