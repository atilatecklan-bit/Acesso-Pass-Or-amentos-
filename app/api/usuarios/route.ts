import { hashSenha, usuarioApi } from "@/lib/auth";
import { q1 } from "@/lib/db";
import { corpo, erro, ok } from "@/lib/http";

export async function POST(req: Request) {
  if (!(await usuarioApi(true))) return erro("Só administradores podem adicionar pessoas.", 403);
  const { nome, email, senha, papel } = await corpo(req);
  if (!nome || !email || !senha) return erro("Preencha nome, e-mail e senha.");
  if (String(senha).length < 8) return erro("A senha precisa ter pelo menos 8 caracteres.");
  const em = String(email).trim().toLowerCase();
  if (await q1(`SELECT 1 FROM usuarios WHERE LOWER(email) = $1`, [em])) return erro("Já existe alguém com esse e-mail.");
  await q1(`INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1, $2, $3, $4)`, [
    String(nome).trim(), em, await hashSenha(String(senha)), papel === "admin" ? "admin" : "usuario",
  ]);
  return ok();
}
