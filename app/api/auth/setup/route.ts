import { q1 } from "@/lib/db";
import { existeUsuario, hashSenha, iniciarSessao } from "@/lib/auth";
import { criarProposta } from "@/lib/repo";
import { exemploSindicato } from "@/lib/defaults";
import { corpo, erro, ok } from "@/lib/http";

export async function POST(req: Request) {
  if (await existeUsuario()) return erro("O sistema já foi configurado.", 403);
  const { nome, email, senha, exemplo } = await corpo(req);
  if (!nome || !email || !senha) return erro("Preencha nome, e-mail e senha.");
  if (String(senha).length < 8) return erro("A senha precisa ter pelo menos 8 caracteres.");
  const u = await q1<any>(
    `INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES ($1, $2, $3, 'admin')
     RETURNING id, nome, email, papel, ativo`,
    [String(nome).trim(), String(email).trim().toLowerCase(), await hashSenha(String(senha))],
  );
  if (exemplo) await criarProposta(exemploSindicato(), u.id, undefined, "Importada do PDF revisado");
  await iniciarSessao(u);
  return ok();
}
