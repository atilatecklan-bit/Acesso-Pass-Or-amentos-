import { hashSenha, usuarioApi } from "@/lib/auth";
import { q, q1 } from "@/lib/db";
import { corpo, erro, ok } from "@/lib/http";

export async function PATCH(req: Request, c: { params: Promise<{ id: string }> }) {
  const eu = await usuarioApi(true);
  if (!eu) return erro("Só administradores podem alterar usuários.", 403);
  const id = Number((await c.params).id);
  const alvo = await q1<{ id: number }>(`SELECT id FROM usuarios WHERE id = $1`, [id]);
  if (!alvo) return erro("Usuário não encontrado.", 404);
  const b = await corpo(req);
  if (b.senha !== undefined) {
    if (String(b.senha).length < 8) return erro("A senha precisa ter pelo menos 8 caracteres.");
    await q(`UPDATE usuarios SET senha_hash = $1 WHERE id = $2`, [await hashSenha(String(b.senha)), id]);
  }
  if (b.papel !== undefined) {
    if (id === eu.id) return erro("Você não pode mudar o próprio perfil.");
    await q(`UPDATE usuarios SET papel = $1 WHERE id = $2`, [b.papel === "admin" ? "admin" : "usuario", id]);
  }
  if (b.ativo !== undefined) {
    if (id === eu.id) return erro("Você não pode desativar a si mesmo.");
    await q(`UPDATE usuarios SET ativo = $1 WHERE id = $2`, [Boolean(b.ativo), id]);
  }
  return ok();
}
