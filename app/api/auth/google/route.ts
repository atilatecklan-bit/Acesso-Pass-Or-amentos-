import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { googleAtivo, origem, urlAutorizacao } from "@/lib/google";

export async function GET(req: Request) {
  if (!googleAtivo()) return NextResponse.redirect(`${origem(req)}/login?erro=google-off`);
  const state = randomBytes(24).toString("base64url");
  const res = NextResponse.redirect(urlAutorizacao(req, state));
  res.cookies.set("ap_oauth", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
