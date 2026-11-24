import { NextResponse, type NextRequest } from "next/server";

const PUBLICAS = ["/login", "/setup", "/api/auth/login", "/api/auth/setup", "/api/auth/google"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLICAS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();
  if (!req.cookies.get("ap_sessao")) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.png|apple-icon.png|favicon.ico|logo.png|logo-branco.png).*)"],
};
