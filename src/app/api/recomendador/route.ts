import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa o cliente do Supabase utilizando as variáveis de ambiente do projeto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Ajuste aqui com o link do seu grupo de WhatsApp ou oferta principal
const LINK_WHATSAPP = "https://chat.whatsapp.com/SEU_GRUPO_AQUI";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const respostasObj = body.respostas || body;
    
    // Extrai todas as respostas fornecidas pelo usuário no quiz
    const respostasValores = Object.values(respostasObj).map(v => String(v));
    const respostaAlvo = respostasValores[respostasValores.length - 1] || "";

    // 1. Busca no Supabase produtos amarrados DIRETAMENTE a essa opção escolhida pelo usuário
    const { data: produtosVinculados, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("opcao_vinculada", respostaAlvo);

    // Validação estrita: Se houver erro ou nenhum produto vinculado exatamente, retorna sucesso: false
    if (error || !produtosVinculados || produtosVinculados.length === 0) {
      return NextResponse.json({ 
        sucesso: false, 
        mensagem: "Nenhum produto vinculado estritamente a esta resposta." 
      }, { status: 200 });
    }

    // 2. Se houver mais de um produto vinculado à mesma opção, fazemos um sorteio para alternar!
    const selecionado = produtosVinculados[Math.floor(Math.random() * produtosVinculados.length)];

    return retornarRecomendacao(selecionado, `Selecionado perfeitamente para a sua escolha: "${respostaAlvo}".`);

  } catch (err) {
    console.error("Erro na API do recomendador:", err);
    return NextResponse.json({ sucesso: false, erro: "Erro interno no servidor" }, { status: 500 });
  }
}

function retornarRecomendacao(produto: any, justificativa: string) {
  return NextResponse.json({
    sucesso: true,
    recomendacao: {
      id: produto.id,
      nome: produto.nome || produto.titulo || "Produto Recomendado",
      tipo: `Preço: ${produto.faixa_preco || produto.preco || "Consulte"}`,
      imagem: produto.imagem_url || produto.imagem || "https://m.media-amazon.com/images/I/61S1k2xAn-L._AC_SL1500_.jpg",
      justificativa: justificativa,
      linkCompra: produto.link_afiliado || produto.link || "#",
      linkWhatsapp: LINK_WHATSAPP,
    },
  });
}