import { MODELO_PADRAO } from "./defaults";
import type { DadosProposta } from "./types";

/** Garante que o JSON recebido tem a forma esperada (completa campos faltando com o modelo). */
export function validarDados(x: any): DadosProposta | string {
  if (!x || typeof x !== "object") return "Dados do orçamento ausentes.";
  const m = structuredClone(MODELO_PADRAO);
  const d: DadosProposta = {
    ...m,
    ...x,
    cliente: { ...m.cliente, ...(x.cliente ?? {}) },
    evento: { ...m.evento, ...(x.evento ?? {}) },
    textos: { ...m.textos, ...(x.textos ?? {}) },
  };
  if (!Array.isArray(d.secoes)) return "Seções inválidas.";
  d.secoes = d.secoes.map((s: any) => ({
    titulo: String(s?.titulo ?? ""),
    colunaPeriodo: ["DIAS", "MESES", "HORAS", "UN"].includes(s?.colunaPeriodo) ? s.colunaPeriodo : "DIAS",
    itens: (Array.isArray(s?.itens) ? s.itens : []).map((i: any) => ({
      descricao: String(i?.descricao ?? ""),
      detalhe: i?.detalhe ? String(i.detalhe) : undefined,
      qtd: Number(i?.qtd) || 0,
      periodo: Number(i?.periodo) || 0,
      unitario: Number(i?.unitario) || 0,
    })),
  }));
  d.taxaSistemaEstimada = Number(d.taxaSistemaEstimada) || 0;
  for (const k of ["incluso", "taxas", "meiosPagamento"] as const) if (!Array.isArray(d[k])) (d as any)[k] = m[k];
  if (JSON.stringify(d).length > 400_000) return "Orçamento grande demais.";
  return d;
}
