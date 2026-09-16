export const categories = [
  {
    slug: "impressao-3d",
    label: "Impressão 3D",
    summary: "Impressoras, filamentos e acessórios.",
  },
  {
    slug: "drones",
    label: "Drones",
    summary: "FPV, cinewhoops e drones de câmera.",
  },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];
