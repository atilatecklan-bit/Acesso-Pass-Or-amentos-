import { NextResponse } from "next/server";

export const ok = (dados: unknown = { ok: true }) => NextResponse.json(dados);
export const erro = (msg: string, status = 400) => NextResponse.json({ erro: msg }, { status });
export const naoAutorizado = () => erro("Sessão expirada ou sem permissão. Entre de novo.", 401);

export async function corpo<T = any>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}
