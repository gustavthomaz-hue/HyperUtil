export interface Impressora {
    id: string;
    nome: string;
    marca: string;
    preco: string;
    linkOficial: string;
    linkAmazon: string;
    usoIndicado: "hobby" | "velocidade" | "pro";
    faixaOrcamento: "baixo" | "medio" | "alto";
    motivoRecomendacao: string;
  }
  
  export const IMPRESSORAS: Impressora[] = [
    {
      id: "ender-3-v3-se",
      nome: "Ender-3 V3 SE",
      marca: "Creality",
      preco: "R$ 1.699",
      linkOficial: "https://seulink.com/ender3-se-oficial",
      linkAmazon: "https://seulink.com/ender3-se-amazon",
      usoIndicado: "hobby",
      faixaOrcamento: "baixo",
      motivoRecomendacao: "A opção mais barata e confiável para quem está começando agora e não quer gastar muito.",
    },
    {
      id: "bambu-a1-mini",
      nome: "Bambu Lab A1 Mini",
      marca: "Bambu Lab",
      preco: "R$ 2.899",
      linkOficial: "https://seulink.com/bambu-a1-mini",
      linkAmazon: "https://seulink.com/bambu-a1-mini-amazon",
      usoIndicado: "velocidade",
      faixaOrcamento: "medio",
      motivoRecomendacao: "A melhor impressora rápida 'plug and play' da atualidade para quem busca facilidade absoluta.",
    },
    {
      id: "bambu-p1s",
      nome: "Bambu Lab P1S",
      marca: "Bambu Lab",
      preco: "R$ 6.499",
      linkOficial: "https://seulink.com/bambu-p1s",
      linkAmazon: "https://seulink.com/bambu-p1s-amazon",
      usoIndicado: "pro",
      faixaOrcamento: "alto",
      motivoRecomendacao: "Fechada de fábrica, perfeita para materiais técnicos e uso profissional diário.",
    },
  ];