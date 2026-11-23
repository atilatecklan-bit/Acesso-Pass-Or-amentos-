export type Periodo = "DIAS" | "MESES" | "HORAS" | "UN";

export interface Item {
  descricao: string;
  detalhe?: string;
  qtd: number;
  periodo: number;
  unitario: number;
}

export interface Secao {
  titulo: string;
  colunaPeriodo: Periodo;
  itens: Item[];
}

export interface Taxa {
  rotulo: string;
  detalhe?: string;
  valor: string;
}

export interface MeioPagamento {
  meio: string;
  custo: string;
  recebimento: string;
}

export interface Textos {
  comoDinheiroEntra: string;
  comoDinheiroEntraItens: string[];
  repasseItens: string[];
  repasseNota: string;
  naoIncluso: string[];
  obrigacoes: string[];
  condicoes: string[];
}

export interface DadosProposta {
  cliente: { nome: string; contato: string; documento: string; telefone: string; email: string };
  evento: { nome: string; tipo: string; local: string; datas: string; diasOperacao: string };
  emissao: string; // AAAA-MM-DD
  validade: string; // AAAA-MM-DD
  escopo: string;
  incluso: string[];
  taxas: Taxa[];
  meiosPagamento: MeioPagamento[];
  notaPagamento: string;
  secoes: Secao[];
  rotuloTotal: string;
  taxaSistemaEstimada: number;
  observacoes: string;
  textos: Textos;
}

export interface ItemCatalogo {
  descricao: string;
  unitario: number;
  secao: string;
  colunaPeriodo: Periodo;
}

export interface Configuracoes {
  empresa: { nome: string; site: string; rodape: string };
  validadeDias: number;
  modelo: DadosProposta;
  catalogo: ItemCatalogo[];
  logo?: string; // data URL opcional
}

export type Status = "rascunho" | "enviada" | "aprovada" | "recusada" | "cancelada";

export const STATUS: { valor: Status; rotulo: string }[] = [
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "enviada", rotulo: "Enviada" },
  { valor: "aprovada", rotulo: "Aprovada" },
  { valor: "recusada", rotulo: "Recusada" },
  { valor: "cancelada", rotulo: "Cancelada" },
];

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: "admin" | "usuario";
  ativo: boolean;
}
