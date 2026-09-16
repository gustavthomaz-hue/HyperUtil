import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

    const { subcategoria } = await request.json();

    if (!subcategoria) {
      return NextResponse.json(
        { error: 'Subcategoria não fornecida' },
        { status: 400 }
      );
    }

    const { data: produtos, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('subcategoria', subcategoria)
      .eq('ativo', true);

    if (error) throw error;

    if (!produtos || produtos.length === 0) {
      return NextResponse.json({
        message: 'Nenhum produto ativo encontrado para esta subcategoria.',
      });
    }

    const listaParaIA = produtos.map((p) => ({
      id: p.id,
      nome: p.nome,
      marca: p.marca,
      faixa_preco: p.faixa_preco,
      loja: p.loja,
    }));

    const groq = new Groq({ apiKey });

    const prompt = `Você é um avaliador técnico especialista em e-commerce.
Analise e compare a lista de produtos da subcategoria "${subcategoria}":

${JSON.stringify(listaParaIA, null, 2)}

Sua tarefa:
Compare todos os produtos com base em custo-benefício, popularidade e reputação.
Atribua uma nota de 0.0 a 10.0 e defina a ordem exata do melhor (1º lugar) ao menor.

Retorne ESTRITAMENTE um objeto JSON com a propriedade "avaliacoes":
{
  "avaliacoes": [
    {
      "id": "ID_DO_PRODUTO",
      "posicao_ranking": 1,
      "nota": 9.5,
      "pros": ["Ponto forte 1", "Ponto forte 2"],
      "contras": ["Ponto a considerar 1"]
    }
  ]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em ranking de e-commerce. Responda estritamente em JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const respostaTexto = completion.choices[0]?.message?.content || '{}';
    const jsonParsed = JSON.parse(respostaTexto);
    const avaliacoes = jsonParsed.avaliacoes || jsonParsed.produtos || [];

    for (const item of avaliacoes) {
      if (item.id) {
        await supabase
          .from('produtos')
          .update({
            posicao_ranking: Number(item.posicao_ranking) || null,
            nota: Number(item.nota) || null,
            pros: item.pros || [],
            contras: item.contras || [],
          })
          .eq('id', item.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Ranking da subcategoria "${subcategoria}" atualizado com sucesso.`,
      avaliacoes,
    });
  } catch (err: any) {
    console.error('Erro na API de geração de rankings:', err);
    return NextResponse.json(
      { error: err.message || 'Erro ao processar ranking.' },
      { status: 500 }
    );
  }
}