import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave GROQ_API_KEY não encontrada no .env.local' },
        { status: 500 }
      );
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Entrada para extração é obrigatória' },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    // Modelo ativo na sua chave conforme retornado na rota de teste
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especialista em e-commerce. Identifique e estruture as informações do produto em formato JSON estrito.',
        },
        {
          role: 'user',
          content: `Extraia e estruture as informações do produto com base neste texto/link: "${url}".
          
Retorne ESTRITAMENTE um objeto JSON válido sem formatação markdown ou textos adicionais, com o seguinte padrão:
{
  "nome": "Nome comercial do produto",
  "marca": "Marca do fabricante",
  "loja": "Mercado Livre",
  "faixa_preco": "R$ 100 - R$ 250",
  "subcategoria": "Filamento",
  "imagem_url": ""
}`,
        },
      ],
      model: 'qwen/qwen3.8-27b',
      response_format: { type: 'json_object' },
    });

    const respostaTexto = completion.choices[0]?.message?.content || '{}';
    const dadosExtraidos = JSON.parse(respostaTexto);

    return NextResponse.json({
      success: true,
      dados: dadosExtraidos,
    });
  } catch (err: any) {
    console.error('Erro ao extrair produto:', err);
    return NextResponse.json(
      { error: err.message || 'Erro interno de extração' },
      { status: 500 }
    );
  }
}