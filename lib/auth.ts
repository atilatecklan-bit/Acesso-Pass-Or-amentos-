import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { q, q1, json } from "./db";
import type { Usuario } from "./types";

export const COOKIE = "ap_sessao";
const DURACAO_DIAS = 7;

let segredoCache: Uint8Array | undefined;
async function segredo(): Promise<Uint8Array> {
  if (segredoCache) return segredoCache;
  let s = process.env.SESSION_SECRET;
  if (!s) {
    const row = await q1<{ valor: unknown }>(`SELECT valor FROM config WHERE chave = 'session_secret'`);
    if (row) s = json<string>(row.valor);
    else {
      s = randomBytes(48).toString("base64url");
      await q(`INSERT INTO config (chave, valor) VALUES ('session_secret', $1::jsonb) ON CONFLICT (chave) DO NOTHING`, [
        JSON.stringify(s),
      ]);
      const again = await q1<{ valor: unknown }>(`SELECT valor FROM config WHERE chave = 'session_secret'`);
      s = json<string>(again!.valor);
    }
  }
  segredoCache = new TextEncoder().encode(s);
  return segredoCache;
}

export async function hashSenha(senha: string) {
  return bcrypt.hash(senha, 10);
}

export async function conferirSenha(senha: string, hash: string) {
  return bcrypt.compare(senha, hash);
}

export async function iniciarSessao(u: Usuario) {
  const token = await new SignJWT({ uid: u.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_DIAS}d`)
    .sign(await segredo());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_DIAS * 86400,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE);
}

export async function usuarioAtual(): Promise<Usuario | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await segredo());
    const u = await q1<Usuario>(`SELECT id, nome, email, papel, ativo FROM usuarios WHERE id = $1`, [payload.uid]);
    return u && u.ativo ? u : null;
  } catch {
    return null;
  }
}

/** Para páginas: manda para o login se não houver sessão válida. */
export async function exigirUsuario(admin = false): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) redirect("/login?expirou=1");
  if (admin && u.papel !== "admin") redirect("/");
  return u;
}

/** Para rotas de API: devolve o usuário ou null (a rota responde 401). */
export async function usuarioApi(admin = false): Promise<Usuario | null> {
  const u = await usuarioAtual();
  if (!u) return null;
  if (admin && u.papel !== "admin") return null;
  return u;
}

export async function existeUsuario() {
  const r = await q1<{ n: number }>(`SELECT COUNT(*)::int AS n FROM usuarios`);
  return (r?.n ?? 0) > 0;
}
