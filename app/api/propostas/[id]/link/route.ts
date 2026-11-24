import { randomBytes } from "crypto";
import { usuarioApi } from "@/lib/auth";
import { q, q1 } from "@/lib/db";
import { erro, naoAutorizado, ok } from "@/lib/http";
import { origem } from "@/lib/google";

/** Cria (ou reaproveita) o link público da proposta para enviar ao cliente. */
export async function POST(req: Request, c: { params: Promise<{ id: string }> }) {
  if (!(await usuarioApi())) return naoAutorizado();
  const id = Number((await c.params).id);
  const p = await q1<{ token_publico: string | null }>(`SELECT token_publico FROM propostas WHERE id = $1`, [id]);
  if (!p) return erro("Orçamento não encontrado.", 404);
  let token = p.token_publico;
  if (!token) {
    token = randomBytes(18).toString("base64url");
    await q(`UPDATE propostas SET token_publico = $1 WHERE id = $2`, [token, id]);
  }
  return ok({ url: `${origem(req)}/p/${token}` });
}
