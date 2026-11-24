import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Acesso Pass Orçamentos",
    short_name: "Orçamentos",
    description: "Orçamentos da Acesso Pass: criar, editar e enviar propostas pelo celular",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14141c",
    theme_color: "#14141c",
    lang: "pt-BR",
    icons: [
      { src: "/app-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [{ name: "Novo orçamento", short_name: "Novo", url: "/propostas/nova", icons: [{ src: "/app-192.png", sizes: "192x192" }] }],
  };
}
