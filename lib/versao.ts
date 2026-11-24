/**
 * Histórico de versões. A cada atualização, adicione um item NO TOPO
 * com o número da versão e o que mudou. É isso que aparece para a equipe.
 */
export const NOVIDADES: { versao: string; data: string; itens: string[] }[] = [
  {
    versao: "1.3.0",
    data: "2026-11-24",
    itens: [
      "Pedido de acesso: quem entra com o Google aguarda aprovação do administrador",
      "Perfis Administrador e Colaborador",
      "App para celular: instale na tela inicial com o ícone da Acesso Pass",
      "Enviar o PDF direto do celular (WhatsApp, e-mail…) e enviar por link",
      "Aviso de atualização e número da versão no sistema",
    ],
  },
  { versao: "1.2.0", data: "2026-11-24", itens: ["Login com Google"] },
  { versao: "1.1.0", data: "2026-11-23", itens: ["Atualizações de segurança"] },
  {
    versao: "1.0.0",
    data: "2026-11-23",
    itens: ["Sistema online: login, lista de orçamentos, histórico de versões, duplicar e PDF"],
  },
];

export const VERSAO = NOVIDADES[0].versao;
/** Identificador do build (commit). Muda a cada publicação, mesmo sem trocar o número da versão. */
export const BUILD = process.env.NEXT_PUBLIC_BUILD || "local";
