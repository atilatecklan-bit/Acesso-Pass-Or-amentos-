import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { q1 } from "@/lib/db";
import { iniciarSessao } from "@/lib/auth";
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

  let email: string;
  try {
    ({ email } = await emailDoGoogle(req, code));
  } catch {
    return falha("google-falhou");
  }
  const u = await q1<any>(`SELECT id, nome, email, papel, ativo FROM usuarios WHERE LOWER(email) = $1`, [email]);
  if (!u) return falha("nao-cadastrado");
  if (!u.ativo) return falha("desativado");
  await iniciarSessao(u);
  return NextResponse.redirect(`${base}/`);
}
