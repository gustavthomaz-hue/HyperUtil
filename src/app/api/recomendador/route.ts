import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const LINK_WHATSAPP = "https://chat.whatsapp.com/SEU_GRUPO_AQUI";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const respostasObj = body.respostas || {};
    
    // LOG DE DIAGNÓSTICO: Vamos ver exatamente o formato que chega do front-end no terminal/console do servidor
    console.log("==================================================");
    console.log("🔍 [DEBUG COMPLETO DO QUIZ]:", JSON.stringify(respostasObj, null, 2));

    const { data: todosProdutos, error: errBanco } = await supabase
      .from("produtos")
      .select("*");

    if (errBanco || !todosProdutos) {
      console.error("❌ Erro ao acessar o Supabase:", errBanco);
      return NextResponse.json({ sucesso: false, erro: "Erro no banco" }, { status: 500 });
    }

    // Vamos extrair todas as chaves e valores enviados pelo front-end de forma segura
    const entradas = Object.entries(respostasObj);
    
    let chaveObjetivo: string | null = null;
    let chaveOrcamento: string | null = null;
    let chaveCor: string | null = null;

    // Se o front-end envia um objeto mapeado (ex: { "Qual é o seu objetivo?": "p1_opt_0" })
    for (const [pergunta, resposta] of entradas) {
      const respStr = String(resposta).trim();
      const pergStr = String(pergunta).toLowerCase();

      // Se o valor começa com p1_, ou a pergunta se refere ao objetivo
      if (respStr.startsWith("p1_") || pergStr.includes("objetivo") || pergStr.includes("uso")) {
        chaveObjetivo = respStr;
      } 
      // Se o valor começa com p2_, ou a pergunta se refere ao orçamento
      else if (respStr.startsWith("p2_") || pergStr.includes("orçamento") || pergStr.includes("orcamento") || pergStr.includes("faixa")) {
        chaveOrcamento = respStr;
      } 
      // Se o valor começa com p3_, ou a pergunta se refere à cor
      else if (respStr.startsWith("p3_") || pergStr.includes("colorido") || pergStr.includes("cor")) {
        chaveCor = respStr;
      }
    }

    // Se ainda assim alguma chave ficou vazia, tentamos apanhar por ordem posicional do array de valores
    const valoresArray = Object.values(respostasObj).map(val => String(val).trim());
    if (!chaveObjetivo && valoresArray.length > 0) chaveObjetivo = valoresArray[0];
    if (!chaveOrcamento && valoresArray.length > 1) chaveOrcamento = valoresArray[1];
    if (!chaveCor && valoresArray.length > 2) chaveCor = valoresArray[2];

    console.log(`🎯 [FILTROS FINAIS APLICADOS] Objetivo: "${chaveObjetivo}" | Orçamento: "${chaveOrcamento}" | Cor: "${chaveCor}"`);

    let produtosValidos: any[] = [];

    // PASSO 1: APLICAR FILTROS RÍGIDOS OBRIGATÓRIOS
    for (const produto of todosProdutos) {
      if (!produto.opcao_vinculada) continue;

      const listaVinculos = produto.opcao_vinculada.split(',').map((s: string) => s.trim());

      // 1. Filtro estrito de Objetivo
      if (chaveObjetivo && !listaVinculos.includes(chaveObjetivo)) {
        continue; 
      }

      // 2. Filtro estrito de Orçamento
      if (chaveOrcamento && !listaVinculos.includes(chaveOrcamento)) {
        continue; 
      }

      // 3. Filtro estrito de Cor
      if (chaveCor && !listaVinculos.includes(chaveCor)) {
        continue;
      }

      produtosValidos.push({
        produto,
        listaVinculos
      });
    }

    if (produtosValidos.length === 0) {
      console.log("❌ NENHUM PRODUTO PASSOU NOS FILTROS.");
      return NextResponse.json({ 
        sucesso: false, 
        mensagem: "Nenhum produto atende rigorosamente a esta combinação de escolhas." 
      }, { status: 200 });
    }

    // PASSO 2: SORTEIO ALEATÓRIO ENTRE OS VÁLIDOS
    const indiceAleatorio = Math.floor(Math.random() * produtosValidos.length);
    const selecionado = produtosValidos[indiceAleatorio].produto;

    console.log(`✅ [SELECIONADO FINAL] "${selecionado.nome}"`);

    return NextResponse.json({
      sucesso: true,
      recomendacao: {
        id: selecionado.id,
        nome: selecionado.nome || selecionado.titulo || "Produto Recomendado",
        tipo: `Preço: ${selecionado.faixa_preco || selecionado.preco || "Consulte"}`,
        imagem: selecionado.imagem_url || selecionado.imagem || "https://m.media-amazon.com/images/I/61S1k2xAn-L._AC_SL1500_.jpg",
        justificativa: `Modelo recomendado por atender rigorosamente ao seu perfil, orçamento e restrições de impressão.`,
        linkCompra: selecionado.link_afiliado || selecionado.link || "#",
        linkWhatsapp: LINK_WHATSAPP,
      },
    });

  } catch (err) {
    console.error("Erro crítico na API do recomendador:", err);
    return NextResponse.json({ sucesso: false, erro: "Erro interno no servidor" }, { status: 500 });
  }
}