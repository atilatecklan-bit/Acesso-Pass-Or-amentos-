import { conferirSenha, hashSenha, usuarioApi } from "@/lib/auth";
import { q, q1 } from "@/lib/db";
import { corpo, erro, naoAutorizado, ok } from "@/lib/http";

export async function POST(req: Request) {
  const u = await usuarioApi();
  if (!u) return naoAutorizado();
  const { atual, nova } = await corpo(req);
  if (!nova || String(nova).length < 8) return erro("A nova senha precisa ter pelo menos 8 caracteres.");
  const r = await q1<{ senha_hash: string }>(`SELECT senha_hash FROM usuarios WHERE id = $1`, [u.id]);
  if (!r || !(await conferirSenha(String(atual ?? ""), r.senha_hash))) return erro("Senha atual incorreta.");
  await q(`UPDATE usuarios SET senha_hash = $1 WHERE id = $2`, [await hashSenha(String(nova)), u.id]);
  return ok();
}
