export const publicNav = [
  { href: "/", label: "Comparar", description: "Impressão 3D e drones lado a lado" },
  { href: "/duelos", label: "Duelos", description: "Dois produtos, um vencedor" },
  {
    href: "/recomendador",
    label: "Recomendador",
    description: "Quiz para achar o modelo certo",
  },
  { href: "/noticias", label: "Notícias", description: "Lançamentos e reviews" },
] as const;

export const adminNav = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/noticias", label: "Notícias" },
] as const;
