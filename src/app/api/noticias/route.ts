import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import Groq from 'groq-sdk';

interface RequestBody {
  titulo?: string;
  produto?: string;
  categoria?: string;
  detalhes?: string;
}

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function garantirHtmlFormatado(texto: string, fontePadrao: string): string {
  if (!texto) return '';

  let html = texto;

  if (!html.includes('<h2') && !html.includes('<p>')) {
    const linhas = html.split('\n');
    let resultado = '';

    for (let linha of linhas) {
      const l = linha.trim();
      if (!l) continue;

      if (l.match(/^(\d+\.|\*\*|##)/) || (l.length < 50 && !l.endsWith('.'))) {
        const tituloLimpo = l.replace(/^(\d+\.|\*\*|##)\s*/, '').replace(/\*\*/g, '');
        resultado += `<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">${tituloLimpo}</h2>\n`;
      } else if (l.startsWith('- ') || l.startsWith('* ')) {
        const itemLimpo = l.replace(/^[-*]\s+/, '');
        resultado += `<li class="mb-2">${itemLimpo}</li>\n`;
      } else {
        resultado += `<p class="mb-4 text-gray-700 leading-relaxed">${l}</p>\n`;
      }
    }

    if (resultado.includes('<li>')) {
      resultado = resultado.replace(/(<li[\s\S]*?<\/li>)+/g, '<ul class="list-disc pl-5 my-4 space-y-2">$&</ul>');
    }

    html = resultado;
  } else {
    html = html
      .replace(/<h2>/g, '<h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">')
      .replace(/<p>/g, '<p class="mb-4 text-gray-700 leading-relaxed">')
      .replace(/<ul>/g, '<ul class="list-disc pl-5 my-4 space-y-2">');
  }

  if (!html.includes(fontePadrao)) {
    html += `<p class="mt-6 text-sm italic text-gray-500">Fonte: Baseado em cobertura de ${fontePadrao}</p>`;
  }

  return html;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const queryProduto = body.produto || body.titulo || 'DJI Mini 4 Pro';
    const categoria = body.categoria || 'Lançamentos';

    const serperKey = process.env.SERPER_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!serperKey) {
      return NextResponse.json({
        success: false,
        error: 'A chave SERPER_API_KEY não está configurada no seu .env.local',
      }, { status: 400 });
    }

    let imageUrl = 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80';
    try {
      const imgRes = await fetch('https://google.serper.dev/images', {
        method: 'POST',
        headers: {
          'X-API-KEY': serperKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `${queryProduto} produto tecnologia`,
          gl: 'br',
          hl: 'pt-br',
          num: 1,
        }),
      });

      if (imgRes.ok) {
        const imgData = await imgRes.json();
        if (imgData.images?.[0]?.imageUrl) {
          imageUrl = imgData.images[0].imageUrl;
        }
      }
    } catch (e) {
      console.error('Erro ao buscar imagem no Serper:', e);
    }

    const newsRes = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: queryProduto,
        gl: 'br',
        hl: 'pt-br',
        num: 6,
      }),
    });

    const newsData = newsRes.ok ? await newsRes.json() : { news: [] };
    const artigos = newsData.news || [];
    const fontePrincipal = artigos[0]?.source || 'Portal Especializado';

    let tituloGerado = `Análise e Novidades: ${queryProduto}`;
    let resumoGerado = `Confira todos os detalhes, especificações técnicas e panorama de mercado sobre o ${queryProduto}.`;
    let textoNoticia = '';

    if (groqApiKey) {
      try {
        const groq = new Groq({ apiKey: groqApiKey });
        const contextoSerper = artigos.length > 0 
          ? artigos.map((a: any) => `- Título: ${a.title}\n   Resumo: ${a.snippet}\n   Fonte: ${a.source}`).join('\n\n')
          : `Produto de tecnologia relevante no mercado atual: ${queryProduto}`;

        const promptRedacao = `
          Você é um jornalista técnico sênior rigoroso e especialista em tecnologia, hardware e inovação.
          Sua principal diretriz é a PRECISÃO ABSOLUTA DOS DADOS. Utilize estritamente as informações contidas nos DADOS DA WEB fornecidos abaixo. 
          
          REGRAS CRÍTICAS DE SEGURANÇA CONTRA ALUCINAÇÕES:
          1. NÃO INVENTE, NÃO ESTIME E NÃO ALUCINE especificações técnicas (como preços, velocidades, dimensões ou pesos) que NÃO constem explicitamente nos DADOS DA WEB abaixo.
          2. NUNCA cite nomes de portais de notícias externos (como Tom's Hardware, How-To Geek, etc.) a menos que eles estejam explicitamente nomeados nos dados da web fornecidos. Caso contrário, utilize termos genéricos como "portais especializados" ou "fontes do setor".
          3. Se os dados da web forem escassos ou omissos sobre valores ou preços, NÃO invente preços em dólares ou euros. Omita valores ou foque nos recursos gerais do produto.

          DADOS DA WEB RECOLHIDOS:
          ${contextoSerper}

          A matéria DEVE obrigatoriamente conter estas 4 seções estruturadas:
          1. Introdução e Destaque Principal
          2. Especificações Técnicas e Recursos
          3. Público-Alvo e Aplicações
          4. Veredito e Panorama

          Retorne estritamente um JSON válido com o seguinte formato:
          {
            "titulo": "Título jornalístico atraente, profissional e livre de exageros",
            "resumo": "Um resumo direto e atrativo de até 2 linhas",
            "conteudo": "O texto completo da matéria escrito em parágrafos ricos, cobrindo todas as seções solicitadas com total fidelidade aos fatos."
          }
        `;

        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'Você é um redator técnico expert focado em dados reais e precisão. Responda estritamente em JSON válido.' },
            { role: 'user', content: promptRedacao },
          ],
          model: 'openai/gpt-oss-120b',
          response_format: { type: 'json_object' },
        });

        const respostaJson = JSON.parse(completion.choices[0]?.message?.content || '{}');
        if (respostaJson.titulo) tituloGerado = respostaJson.titulo;
        if (respostaJson.resumo) resumoGerado = respostaJson.resumo;
        
        if (respostaJson.conteudo) {
          textoNoticia = garantirHtmlFormatado(respostaJson.conteudo, fontePrincipal);
        }
      } catch (aiError) {
        console.error('Erro na chamada da IA:', aiError);
      }
    }

    if (!textoNoticia) {
      textoNoticia = `
        <h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">Introdução e Destaque Principal</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">O ${queryProduto} chega ao mercado de ${categoria} trazendo inovações importantes que prometem elevar o padrão da categoria, oferecendo melhorias significativas em desempenho e usabilidade para os usuários.</p>
        
        <h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">Especificações Técnicas e Recursos</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">Equipado com tecnologia de ponta, o modelo conta com arquitetura otimizada, garantindo alta velocidade de processamento e eficiência energética superior em relação às gerações anteriores.</p>
        
        <h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">Público-Alvo e Aplicações</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">O dispositivo é ideal tanto para entusiastas quanto para profissionais que necessitam de ferramentas confiáveis, precisas e de alto rendimento para o dia a dia.</p>
        
        <h2 class="text-xl font-bold mt-6 mb-3 text-gray-900">Veredito e Panorama</h2>
        <p class="mb-4 text-gray-700 leading-relaxed">Com um conjunto equilibrado de recursos e preço competitivo, o ${queryProduto} consolida-se como uma excelente escolha no mercado atual.</p>
        <p class="mt-6 text-sm italic text-gray-500">Fonte: Baseado em cobertura de ${fontePrincipal}</p>
      `;
    }

    const slugDesejado = gerarSlug(tituloGerado);

    const payloadNoticia = {
      titulo: tituloGerado,
      slug: slugDesejado,
      resumo: resumoGerado,
      conteudo: textoNoticia,
      categoria: categoria,
      imagem_url: imageUrl,
      publicado: true,
      tempo_leitura: '4 min de leitura',
    };

    const { data: existente } = await supabase
      .from('noticias')
      .select('id')
      .eq('slug', slugDesejado)
      .maybeSingle();

    let savedData;
    let dbErrorReal;

    if (existente?.id) {
      const { data, error } = await supabase
        .from('noticias')
        .update(payloadNoticia)
        .eq('id', existente.id)
        .select()
        .single();
      savedData = data;
      dbErrorReal = error;
    } else {
      const { data, error } = await supabase
        .from('noticias')
        .insert([payloadNoticia])
        .select()
        .single();
      savedData = data;
      dbErrorReal = error;
    }

    if (dbErrorReal) {
      console.error('Erro ao salvar notícia no Supabase:', dbErrorReal);
      return NextResponse.json({
        success: false,
        error: `Erro ao gravar no banco: ${dbErrorReal.message}`,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedData.id,
        titulo: tituloGerado,
        resumo: resumoGerado,
        produto: queryProduto,
        categoria,
        imagemUrl: imageUrl,
        conteudo: textoNoticia,
        criadoEm: savedData.created_at || new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Erro na rota de notícias:', error);
    return NextResponse.json({
      success: false,
      error: `Erro ao processar requisição: ${error.message || 'Erro interno'}`,
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não fornecido' }, { status: 400 });
    }

    const { error } = await supabase.from('noticias').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Notícia excluída com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}