import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Groq from 'groq-sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const { produto1Id, produto2Id } = await request.json();

    if (!produto1Id || !produto2Id) {
      return NextResponse.json({ sucesso: false, erro: 'IDs dos produtos não informados.' }, { status: 400 });
    }

    // Busca os produtos reais no Supabase
    const { data: p1, error: err1 } = await supabase.from('produtos').select('*').eq('id', produto1Id).single();
    if (err1 || !p1) {
      return NextResponse.json({ sucesso: false, erro: 'Produto 1 não encontrado.' }, { status: 404 });
    }

    const { data: p2, error: err2 } = await supabase.from('produtos').select('*').eq('id', produto2Id).single();
    if (err2 || !p2) {
      return NextResponse.json({ sucesso: false, erro: 'Produto 2 não encontrado.' }, { status: 404 });
    }

    // TRAVA DE SEGURANÇA: Verifica se os dados essenciais estão preenchidos
    const p1TemDados = p1.volume_impressao || p1.volume || p1.velocidade_maxima || p1.velocidade;
    const p2TemDados = p2.volume_impressao || p2.volume || p2.velocidade_maxima || p2.velocidade;

    const nomeP1 = p1.nome || p1.titulo || 'Produto 1';
    const nomeP2 = p2.nome || p2.titulo || 'Produto 2';

    if (!p1TemDados || !p2TemDados) {
      const faltando = !p1TemDados && !p2TemDados ? `${nomeP1} e ${nomeP2}` : (!p1TemDados ? nomeP1 : nomeP2);
      return NextResponse.json({ 
        sucesso: false, 
        erro: `Impossível gerar o duelo. O produto "${faltando}" está sem as especificações técnicas básicas cadastradas (Volume, Velocidade, etc.). Por favor, atualize o cadastro do produto no painel antes de compará-lo.` 
      }, { status: 400 });
    }

    const slugDuelo = `${p1.slug || 'prod1'}-vs-${p2.slug || 'prod2'}`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ sucesso: false, erro: 'Chave GROQ_API_KEY não encontrada' }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    // Prompt estrito usando apenas os dados reais informados por você no cadastro
    const prompt = `Faça uma comparação técnica profissional e realista entre estas duas impressoras 3D com base EXCLUSIVAMENTE nos dados técnicos cadastrados abaixo:

Produto 1: ${nomeP1}
- Volume de Impressão: ${p1.volume_impressao || p1.volume || 'Não informado'}
- Velocidade Máxima: ${p1.velocidade_maxima || p1.velocidade || 'Não informada'}
- Nivelamento: ${p1.nivelamento || 'Não informado'}
- Conectividade: ${p1.conectividade || 'Não informada'}

Produto 2: ${nomeP2}
- Volume de Impressão: ${p2.volume_impressao || p2.volume || 'Não informado'}
- Velocidade Máxima: ${p2.velocidade_maxima || p2.velocidade || 'Não informada'}
- Nivelamento: ${p2.nivelamento || 'Não informado'}
- Conectividade: ${p2.conectividade || 'Não informada'}

Retorne ESTRITAMENTE um objeto JSON válido contendo exatamente estas chaves:
{
  "resumo_ia": "Um parágrafo técnico detalhado comparando o desempenho, volume e recursos de ambas com base nos dados acima.",
  "veredito": "Veredito técnico final indicando qual das duas vale mais a pena comprar e o porquê.",
  "melhor_custo_beneficio": "Nome exato da impressora que oferece melhor custo-benefício entre as duas",
  "pros_produto1": ["Ponto forte 1", "Ponto forte 2"],
  "contras_produto1": ["Ponto fraco 1"],
  "pros_produto2": ["Ponto forte 1", "Ponto forte 2"],
  "contras_produto2": ["Ponto fraco 1"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'Você é um engenheiro especialista em impressão 3D focado em análises técnicas honestas e realistas. Retorne estritamente um JSON válido.' },
        { role: 'user', content: prompt },
      ],
      model: 'qwen/qwen3.8-27b',
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const respostaTexto = completion.choices[0]?.message?.content || '{}';

    let iaRes;
    try {
      iaRes = JSON.parse(respostaTexto);
    } catch (e) {
      iaRes = {};
    }

    // Montagem final combinando os dados 100% reais do Supabase + análise inteligente da IA
    const dadosDuelosFormatados = {
      resumo_ia: iaRes.resumo_ia || `Análise comparativa direta entre ${nomeP1} e ${nomeP2}.`,
      veredito: iaRes.veredito || "Avalie com base nas especificações cadastradas.",
      melhor_custo_beneficio: iaRes.melhor_custo_beneficio || nomeP1,
      
      // Especificações vindas DIRETAMENTE da sua tabela de produtos
      specs_produto1: {
        volume: p1.volume_impressao || p1.volume || 'Não informado',
        velocidade: p1.velocidade_maxima || p1.velocidade || 'Não informada',
        temperatura: p1.temperatura_bico || p1.temperatura || 'Não informada',
        nivelamento: p1.nivelamento || 'Não informado',
        conectividade: p1.conectividade || 'Não informada'
      },
      specs_produto2: {
        volume: p2.volume_impressao || p2.volume || 'Não informado',
        velocidade: p2.velocidade_maxima || p2.velocidade || 'Não informada',
        temperatura: p2.temperatura_bico || p2.temperatura || 'Não informada',
        nivelamento: p2.nivelamento || 'Não informado',
        conectividade: p2.conectividade || 'Não informada'
      },

      // Prós e Contras gerados pela IA ou fallbacks seguros
      pros_produto1: Array.isArray(iaRes.pros_produto1) && iaRes.pros_produto1.length > 0 
        ? iaRes.pros_produto1 
        : ['Boa construção estrutural', 'Especificações alinhadas à categoria'],
      
      contras_produto1: Array.isArray(iaRes.contras_produto1) && iaRes.contras_produto1.length > 0 
        ? iaRes.contras_produto1 
        : ['Verificar compatibilidade de acessórios'],
      
      pros_produto2: Array.isArray(iaRes.pros_produto2) && iaRes.pros_produto2.length > 0 
        ? iaRes.pros_produto2 
        : ['Excelente desempenho operacional', 'Boa gama de recursos'],
      
      contras_produto2: Array.isArray(iaRes.contras_produto2) && iaRes.contras_produto2.length > 0 
        ? iaRes.contras_produto2 
        : ['Requer atenção aos ajustes iniciais']
    };

    const { error: insertError } = await supabase.from('duelos').upsert({
      slug: slugDuelo,
      produto1_id: produto1Id,
      produto2_id: produto2Id,
      resumo_ia: JSON.stringify(dadosDuelosFormatados),
    }, { onConflict: 'slug' });

    if (insertError) {
      return NextResponse.json({ sucesso: false, erro: 'Erro ao salvar no Supabase: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, slug: slugDuelo });

  } catch (error: any) {
    console.error('Erro na API de duelos:', error);
    return NextResponse.json({ sucesso: false, erro: error.message || 'Erro interno' }, { status: 500 });
  }
}