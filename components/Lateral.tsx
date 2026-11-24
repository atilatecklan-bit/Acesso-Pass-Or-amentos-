"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROTULO_PAPEL, type Usuario } from "@/lib/types";
import { VERSAO } from "@/lib/versao";

const I = {
  lista: <path d="M4 6h16M4 12h16M4 18h10" />,
  novo: <path d="M12 5v14M5 12h14" />,
  config: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.3l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2.2-1.3L14.4 3h-4l-.4 2.4a7.6 7.6 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.6l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2.2 1.3l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 2.2-1.3l2.4 1 2-3.4-2-1.6c.1-.4.1-.9.1-1.3Z" />,
  pessoas: <path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM21 19v-1a4 4 0 0 0-3-3.9M15.5 4.1a3 3 0 0 1 0 5.8" />,
};
const Icone = ({ d }: { d: React.ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export default function Lateral({ usuario, pendentes = 0 }: { usuario: Usuario; pendentes?: number }) {
  const p = usePathname();
  const ativo = (href: string) =>
    href === "/" ? p === "/" || (p.startsWith("/propostas") && p !== "/propostas/nova") : p.startsWith(href);
  const links = [
    { href: "/", rot: "Orçamentos", curto: "Orçamentos", i: I.lista },
    { href: "/propostas/nova", rot: "Novo orçamento", curto: "Novo", i: I.novo },
    { href: "/configuracoes", rot: "Configurações", curto: "Ajustes", i: I.config },
    ...(usuario.papel === "admin" ? [{ href: "/usuarios", rot: "Usuários", curto: "Equipe", i: I.pessoas, badge: pendentes }] : []),
  ] as { href: string; rot: string; curto: string; i: React.ReactNode; badge?: number }[];

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <aside className="lateral">
        <Link href="/" className="marca"><img src="/logo-branco.png" alt="Acesso Pass" /></Link>
        <div className="sub">Orçamentos</div>
        <nav>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={ativo(l.href) ? "ativo" : ""}>
              <Icone d={l.i} />
              <span>{l.rot}</span>
              {!!l.badge && <span className="contador">{l.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="rodape">
          <div className="pessoa">
            {usuario.foto ? <img src={usuario.foto} alt="" className="avatar" referrerPolicy="no-referrer" /> : <span className="avatar ini">{usuario.nome.slice(0, 1)}</span>}
            <div>
              <strong>{usuario.nome}</strong>
              {ROTULO_PAPEL[usuario.papel]}
            </div>
          </div>
          <div className="acoes" style={{ marginTop: 10 }}>
            <button className="btn pequeno" onClick={sair}>Sair</button>
            <Link href="/novidades" className="versao">v{VERSAO}</Link>
          </div>
        </div>
      </aside>

      {/* Celular: barra de cima e abas embaixo, como um aplicativo */}
      <header className="topo-m">
        <Link href="/"><img src="/logo-branco.png" alt="Acesso Pass" /></Link>
        <Link href="/novidades" className="versao">v{VERSAO}</Link>
        <button className="btn pequeno" onClick={sair}>Sair</button>
      </header>
      <nav className="abas-m">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={ativo(l.href) ? "ativo" : ""}>
            <Icone d={l.i} />
            <span>{l.curto}</span>
            {!!l.badge && <span className="contador">{l.badge}</span>}
          </Link>
        ))}
      </nav>
    </>
  );
}
