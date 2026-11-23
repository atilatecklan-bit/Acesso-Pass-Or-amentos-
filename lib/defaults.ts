import type { Configuracoes, DadosProposta } from "./types";
import { hojeISO, somarDias } from "./format";

/** Modelo padrão, tirado da proposta que o gerador antigo produzia. */
export const MODELO_PADRAO: DadosProposta = {
  cliente: { nome: "", contato: "", documento: "", telefone: "", email: "" },
  evento: { nome: "", tipo: "Show", local: "", datas: "", diasOperacao: "" },
  emissao: "",
  validade: "",
  escopo:
    "Venda de ingressos, credenciamento e controle de acesso, com equipe própria em campo durante toda a operação.",
  incluso: [
    "Sistema de venda online com hotsite próprio do evento",
    "Painel do produtor com acompanhamento de vendas em tempo real",
    "Sistema de validação de ingresso na portaria",
    "Relatórios de venda, público validado e fechamento financeiro",
    "Cadastro de lotes, setores e lugares marcados",
    "Lista de convidados com envio automático do ingresso",
    "Sistema de comissários com link e código próprio",
    "Bilheteria no local do evento",
  ],
  taxas: [
    { rotulo: "Taxa de conveniência — venda online", detalhe: "Cobrada do comprador, no ato da compra", valor: "10%" },
    { rotulo: "Taxa sobre venda física / PDV", valor: "1%" },
    { rotulo: "Cortesia emitida", valor: "R$ 0,00" },
    { rotulo: "Ingresso cancelado", valor: "R$ 0,00" },
    { rotulo: "Bobina térmica por ingresso impresso", valor: "R$ 0,20" },
  ],
  meiosPagamento: [
    { meio: "Pix — Sicoob", custo: "Sem taxa", recebimento: "Na hora" },
    { meio: "Pix — Asaas", custo: "Conforme tabela Asaas", recebimento: "Em segundos" },
    { meio: "Boleto bancário", custo: "Conforme tabela Asaas", recebimento: "Conforme Asaas" },
    { meio: "Cartão de débito e crédito", custo: "Conforme tabela Asaas", recebimento: "Conforme Asaas" },
  ],
  notaPagamento:
    "Os custos acima são cobrados pelo meio de pagamento (Asaas) e não são receita da Acesso Pass. O prazo indicado é o tempo até o valor ficar disponível para repasse, exceto o Pix pelo Sicoob, que é liquidado na hora e sem tarifa.",
  secoes: [
    { titulo: "Equipamentos", colunaPeriodo: "DIAS", itens: [] },
    { titulo: "Equipe em campo", colunaPeriodo: "DIAS", itens: [] },
    { titulo: "Diárias, deslocamento e alimentação", colunaPeriodo: "DIAS", itens: [] },
  ],
  rotuloTotal: "Total de equipamentos e equipe",
  taxaSistemaEstimada: 0,
  observacoes: "",
  textos: {
    comoDinheiroEntra:
      "Nesta modalidade, todo o valor arrecadado é creditado diretamente em conta de titularidade do contratante. A Acesso Pass não retém, não intermedeia e não repassa recursos — opera o sistema de venda e o controle de acesso, e recebe apenas as taxas devidas pelo serviço.",
    comoDinheiroEntraItens: [
      "Pix — chave e conta do próprio produtor no Sicoob. Sem tarifa e com liquidação imediata.",
      "Cartão de crédito no site — conta Asaas aberta em nome do produtor.",
      "PDV e bilheteria — maquininha do banco de preferência do produtor. O ingresso impresso no local é vendido em Pix, crédito e débito.",
    ],
    repasseItens: [
      "Apuração mensal, com relatório detalhado de ingressos emitidos, cortesias e cancelamentos enviado ao contratante.",
    ],
    repasseNota:
      "Os custos dos meios de pagamento são debitados diretamente nas contas do contratante, por serem de titularidade dele.",
    naoIncluso: [
      "Pontos de energia no credenciamento e nas catracas",
      "Mesas, balcões, cadeiras e estrutura física da portaria",
      "Segurança para os equipamentos e para a fila",
      "Operadores, recepcionistas e atendentes de bilheteria",
      "Crachás, cordões e pulseiras (orçados à parte)",
      "Montagens extras fora do escopo desta proposta",
      "Hospedagem e alimentação fora das diárias previstas",
    ],
    obrigacoes: [
      "Unifila ou grades em quantidade suficiente para organizar o fluxo",
      "Ponto de energia 110v ou 220v em cada posição de catraca e bilheteria",
      "Local coberto ou protegido de chuva, com iluminação adequada",
      "Segurança para apoio à equipe e guarda dos equipamentos",
      "Água potável para toda a equipe durante a operação",
      "Base de dados de convidados entregue com até 24h de antecedência",
    ],
    condicoes: [
      "Proposta válida até {validade}.",
      "A Acesso Pass não comercializa nem divulga os dados dos compradores e convidados do evento, que pertencem ao contratante.",
    ],
  },
};

export const CONFIG_PADRAO: Configuracoes = {
  empresa: { nome: "Acesso Pass", site: "acessopass.com.br", rodape: "ACESSO PASS · Ingressos e controle de acesso" },
  validadeDias: 15,
  modelo: MODELO_PADRAO,
  catalogo: [
    { descricao: "SISTEMA PDV POR PONTO DE VENDA", unitario: 200, secao: "Equipamentos", colunaPeriodo: "DIAS" },
    { descricao: "IMPRESSORA DE PDV", unitario: 50, secao: "Equipamentos", colunaPeriodo: "DIAS" },
    { descricao: "COMPUTADOR COMPLETO PARA VENDA", unitario: 100, secao: "Equipamentos", colunaPeriodo: "DIAS" },
    { descricao: "KIT PDV: SISTEMA + IMPRESSORA + COMPUTADOR (aluguel mensal)", unitario: 750, secao: "Equipamentos", colunaPeriodo: "MESES" },
    { descricao: "Técnico de suporte", unitario: 400, secao: "Equipe em campo", colunaPeriodo: "DIAS" },
    { descricao: "Assistência de suporte nas vendas", unitario: 1500, secao: "Suporte às vendas", colunaPeriodo: "MESES" },
    { descricao: "Deslocamento (km)", unitario: 1.2, secao: "Diárias, deslocamento e alimentação", colunaPeriodo: "DIAS" },
  ],
};

export function novaProposta(cfg: Configuracoes): DadosProposta {
  const d: DadosProposta = structuredClone(cfg.modelo);
  d.emissao = hojeISO();
  d.validade = somarDias(d.emissao, cfg.validadeDias || 15);
  return d;
}

/** Proposta do Sindicato Rural de Jaíba já revisada, para servir de exemplo. */
export function exemploSindicato(): DadosProposta {
  const d = structuredClone(MODELO_PADRAO);
  d.cliente = { nome: "Sindicato Rural de Jaíba", contato: "João Welington", documento: "", telefone: "", email: "" };
  d.evento = { nome: "1º EXPO JAÍBA", tipo: "Show", local: "Parque de Exposições Jaíba", datas: "22 a 26/04/2027", diasOperacao: "5" };
  d.emissao = hojeISO();
  d.validade = somarDias(d.emissao, 15);
  d.secoes = [
    {
      titulo: "Equipamentos",
      colunaPeriodo: "MESES",
      itens: [
        {
          descricao: "KIT PDV: SISTEMA + IMPRESSORA + COMPUTADOR",
          detalhe: "Aluguel mensal por ponto de venda · R$ 3.000,00/mês para os 4 pontos",
          qtd: 4,
          periodo: 5,
          unitario: 750,
        },
      ],
    },
    { titulo: "Equipe em campo", colunaPeriodo: "DIAS", itens: [{ descricao: "Técnico de suporte", qtd: 3, periodo: 3, unitario: 400 }] },
    { titulo: "Suporte às vendas", colunaPeriodo: "MESES", itens: [{ descricao: "Assistência de suporte nas vendas", qtd: 1, periodo: 5, unitario: 1500 }] },
    {
      titulo: "Diárias, deslocamento e alimentação",
      colunaPeriodo: "DIAS",
      itens: [{ descricao: "Deslocamento (km)", qtd: 73, periodo: 2, unitario: 1.2 }],
    },
  ];
  d.rotuloTotal = "Total de equipamentos, equipe e suporte";
  return d;
}
