import type { DadosProposta, Secao } from "./types";

export const brl = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const subtotalSecao = (s: Secao) =>
  s.itens.reduce((t, i) => t + (Number(i.qtd) || 0) * (Number(i.periodo) || 0) * (Number(i.unitario) || 0), 0);

export const totalProposta = (d: DadosProposta) =>
  d.secoes.reduce((t, s) => t + subtotalSecao(s), 0) + (Number(d.taxaSistemaEstimada) || 0);

export const dataBR = (iso?: string | null) => {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

export const hojeISO = () => {
  const d = new Date(Date.now() - 3 * 3600 * 1000); // horário de Brasília
  return d.toISOString().slice(0, 10);
};

export const somarDias = (iso: string, dias: number) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
};

export const dataHoraBR = (v: string | Date) =>
  new Date(v).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

/** Troca {validade}, {cliente}, {evento} nos textos padrão. */
export const preencher = (t: string, d: DadosProposta) =>
  t
    .replaceAll("{validade}", dataBR(d.validade))
    .replaceAll("{cliente}", d.cliente.nome)
    .replaceAll("{evento}", d.evento.nome);
