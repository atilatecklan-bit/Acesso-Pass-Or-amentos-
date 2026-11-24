import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { q, q1 } from "@/lib/db";
import { randomBytes } from "crypto";
import { hashSenha, iniciarSessao } from "@/lib/auth";
import { emailDoGoogle, googleAtivo, origem } from "@/lib/google";

export async function GET(req: Request) {
  const base = origem(req);
  const falha = (motivo: string) => NextResponse.redirect(`${base}/login?erro=${motivo}`);
  if (!googleAtivo()) return falha("google-off");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const esperado = jar.get("ap_oauth")?.value;
  jar.delete("ap_oauth");
  if (url.searchParams.get("error")) return falha("google-cancelado");
  if (!code || !state || !esperado || state !== esperado) return falha("google-falhou");

  let g: { email: string; nome: string; foto: string };
  try {
    g = await emailDoGoogle(req, code);
  } catch {
    return falha("google-falhou");
  }
  const u = await q1<any>(`SELECT id, nome, email, papel, ativo, pendente FROM usuarios WHERE LOWER(email) = $1`, [g.email]);
  if (!u) {
    // Pessoa nova: vira um pedido de acesso para o administrador aprovar.
    await q(
      `INSERT INTO usuarios (nome, email, senha_hash, papel, ativo, pendente, foto)
       VALUES ($1, $2, $3, 'usuario', FALSE, TRUE, $4) ON CONFLICT (email) DO NOTHING`,
      [g.nome || g.email, g.email, await hashSenha(randomBytes(32).toString("base64url")), g.foto || null],
    );
    return falha("aguardando");
  }
  if (u.pendente) return falha("aguardando");
  if (!u.ativo) return falha("desativado");
  if (g.foto) await q(`UPDATE usuarios SET foto = $1 WHERE id = $2`, [g.foto, u.id]);
  await iniciarSessao(u);
  return NextResponse.redirect(`${base}/`);
}
