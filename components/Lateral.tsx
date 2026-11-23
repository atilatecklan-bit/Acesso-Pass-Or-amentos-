"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Usuario } from "@/lib/types";

export default function Lateral({ usuario }: { usuario: Usuario }) {
  const p = usePathname();
  const ativo = (href: string) => (href === "/" ? p === "/" || (p.startsWith("/propostas") && p !== "/propostas/nova") : p.startsWith(href));
  const links = [
    { href: "/", rot: "Orçamentos" },
    { href: "/propostas/nova", rot: "Novo orçamento" },
    { href: "/configuracoes", rot: "Configurações" },
    ...(usuario.papel === "admin" ? [{ href: "/usuarios", rot: "Usuários" }] : []),
  ];
  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <aside className="lateral">
      <Link href="/" className="marca">
        <img src="/logo-branco.png" alt="Acesso Pass" />
      </Link>
      <div className="sub">Orçamentos</div>
      <nav>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={ativo(l.href) ? "ativo" : ""}>
            {l.rot}
          </Link>
        ))}
      </nav>
      <div className="rodape">
        <strong>{usuario.nome}</strong>
        {usuario.papel === "admin" ? "Administrador" : "Usuário"}
        <div>
          <button className="btn pequeno" onClick={sair}>Sair</button>
        </div>
      </div>
    </aside>
  );
}
