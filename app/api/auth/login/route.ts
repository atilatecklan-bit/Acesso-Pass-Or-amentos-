import { q1 } from "@/lib/db";
import { conferirSenha, iniciarSessao } from "@/lib/auth";
import { corpo, erro, ok } from "@/lib/http";

export async function POST(req: Request) {
  const { email, senha } = await corpo(req);
  if (!email || !senha) return erro("Informe e-mail e senha.");
  const u = await q1<any>(`SELECT id, nome, email, papel, ativo, pendente, senha_hash FROM usuarios WHERE LOWER(email) = LOWER($1)`, [String(email).trim()]);
  if (!u || !(await conferirSenha(String(senha), u.senha_hash))) return erro("E-mail ou senha incorretos.", 401);
  if (u.pendente) return erro("Seu acesso ainda está aguardando aprovação do administrador.", 403);
  if (!u.ativo) return erro("Este usuário está desativado. Fale com o administrador.", 403);
  await iniciarSessao(u);
  return ok();
}
