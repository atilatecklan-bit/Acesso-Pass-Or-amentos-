import "server-only";
import { q, q1, json } from "./db";
import { CONFIG_PADRAO } from "./defaults";
import { totalProposta } from "./format";
import type { Configuracoes, DadosProposta, Status } from "./types";

export interface PropostaLinha {
  id: number;
  numero: string;
  cliente: string;
  evento: string;
  status: Status;
  total: number;
  versao: number;
  atualizado_em: string;
  criado_em: string;
  autor: string | null;
  editor: string | null;
}

export interface Proposta extends PropostaLinha {
  dados: DadosProposta;
}

export async function lerConfig(): Promise<Configuracoes> {
  const r = await q1<{ valor: unknown }>(`SELECT valor FROM config WHERE chave = 'geral'`);
  if (!r) return structuredClone(CONFIG_PADRAO);
  const c = json<Configuracoes>(r.valor);
  return { ...structuredClone(CONFIG_PADRAO), ...c, empresa: { ...CONFIG_PADRAO.empresa, ...c.empresa } };
}

export async function salvarConfig(c: Configuracoes) {
  await q(
    `INSERT INTO config (chave, valor) VALUES ('geral', $1::jsonb)
     ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor`,
    [JSON.stringify(c)],
  );
}

const CAMPOS = `p.id, p.numero, p.cliente, p.evento, p.status, p.total::float AS total, p.versao,
  p.atualizado_em, p.criado_em, ua.nome AS autor, ue.nome AS editor`;

export async function listarPropostas(filtro: { busca?: string; status?: string }) {
  const cond: string[] = [];
  const params: unknown[] = [];
  if (filtro.busca) {
    params.push(`%${filtro.busca.trim()}%`);
    cond.push(`(p.cliente ILIKE $${params.length} OR p.evento ILIKE $${params.length} OR p.numero ILIKE $${params.length})`);
  }
  if (filtro.status) {
    params.push(filtro.status);
    cond.push(`p.status = $${params.length}`);
  }
  return q<PropostaLinha>(
    `SELECT ${CAMPOS} FROM propostas p
     LEFT JOIN usuarios ua ON ua.id = p.criado_por
     LEFT JOIN usuarios ue ON ue.id = p.atualizado_por
     ${cond.length ? "WHERE " + cond.join(" AND ") : ""}
     ORDER BY p.atualizado_em DESC LIMIT 500`,
    params,
  );
}

export async function resumoStatus() {
  return q<{ status: Status; n: number; total: number }>(
    `SELECT status, COUNT(*)::int AS n, COALESCE(SUM(total),0)::float AS total FROM propostas GROUP BY status`,
  );
}

export async function lerProposta(id: number): Promise<Proposta | undefined> {
  const r = await q1<any>(
    `SELECT ${CAMPOS}, p.dados FROM propostas p
     LEFT JOIN usuarios ua ON ua.id = p.criado_por
     LEFT JOIN usuarios ue ON ue.id = p.atualizado_por
     WHERE p.id = $1`,
    [id],
  );
  if (!r) return undefined;
  r.dados = json<DadosProposta>(r.dados);
  return r as Proposta;
}

export async function criarProposta(dados: DadosProposta, uid: number, origemId?: number, nota = "Criada") {
  const total = totalProposta(dados);
  const r = await q1<{ id: number }>(
    `INSERT INTO propostas (cliente, evento, total, dados, origem_id, criado_por, atualizado_por)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $6) RETURNING id`,
    [dados.cliente.nome, dados.evento.nome, total, JSON.stringify(dados), origemId ?? null, uid],
  );
  const id = r!.id;
  const ano = (dados.emissao || new Date().toISOString()).slice(0, 4);
  await q(`UPDATE propostas SET numero = $1 WHERE id = $2`, [`${ano}-${String(id).padStart(4, "0")}`, id]);
  await q(
    `INSERT INTO proposta_versoes (proposta_id, versao, dados, total, nota, criado_por) VALUES ($1, 1, $2::jsonb, $3, $4, $5)`,
    [id, JSON.stringify(dados), total, nota, uid],
  );
  return id;
}

export async function salvarProposta(id: number, dados: DadosProposta, uid: number, nota: string) {
  const total = totalProposta(dados);
  const r = await q1<{ versao: number }>(
    `UPDATE propostas SET dados = $1::jsonb, cliente = $2, evento = $3, total = $4, versao = versao + 1,
       atualizado_por = $5, atualizado_em = NOW()
     WHERE id = $6 RETURNING versao`,
    [JSON.stringify(dados), dados.cliente.nome, dados.evento.nome, total, uid, id],
  );
  if (!r) return undefined;
  await q(
    `INSERT INTO proposta_versoes (proposta_id, versao, dados, total, nota, criado_por) VALUES ($1, $2, $3::jsonb, $4, $5, $6)`,
    [id, r.versao, JSON.stringify(dados), total, nota, uid],
  );
  return r.versao;
}

export async function mudarStatus(id: number, status: Status, uid: number) {
  await q(`UPDATE propostas SET status = $1, atualizado_por = $2, atualizado_em = NOW() WHERE id = $3`, [status, uid, id]);
}

export async function excluirProposta(id: number) {
  await q(`DELETE FROM propostas WHERE id = $1`, [id]);
}

export async function listarVersoes(id: number) {
  return q<{ versao: number; total: number; nota: string; criado_em: string; autor: string | null }>(
    `SELECT v.versao, v.total::float AS total, v.nota, v.criado_em, u.nome AS autor
     FROM proposta_versoes v LEFT JOIN usuarios u ON u.id = v.criado_por
     WHERE v.proposta_id = $1 ORDER BY v.versao DESC`,
    [id],
  );
}

export async function lerVersao(id: number, versao: number) {
  const r = await q1<{ dados: unknown }>(`SELECT dados FROM proposta_versoes WHERE proposta_id = $1 AND versao = $2`, [id, versao]);
  return r ? json<DadosProposta>(r.dados) : undefined;
}
