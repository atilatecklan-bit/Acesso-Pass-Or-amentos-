"use client";
import { useState } from "react";
import { ROTULO_PAPEL, type Usuario } from "@/lib/types";
import { dataHoraBR } from "@/lib/format";

function Avatar({ u }: { u: Usuario }) {
  return u.foto ? (
    <img src={u.foto} alt="" className="avatar" referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar ini">{u.nome.slice(0, 1).toUpperCase()}</span>
  );
}

export default function UsuariosAdmin({ lista, eu }: { lista: Usuario[]; eu: number }) {
  const [msg, setMsg] = useState<{ t: "ok" | "erro"; m: string } | null>(null);
  const pendentes = lista.filter((u) => u.pendente);
  const equipe = lista.filter((u) => !u.pendente);

  async function api(url: string, method: string, body?: unknown) {
    setMsg(null);
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMsg({ t: "erro", m: j.erro || "Não foi possível concluir." });
      return false;
    }
    return true;
  }

  async function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    if (await api("/api/usuarios", "POST", f)) window.location.reload();
  }

  async function aprovar(u: Usuario, papel: "admin" | "usuario") {
    if (await api(`/api/usuarios/${u.id}`, "PATCH", { aprovar: true, papel })) window.location.reload();
  }

  async function recusar(u: Usuario) {
    if (!confirm(`Recusar o pedido de acesso de ${u.nome}?`)) return;
    if (await api(`/api/usuarios/${u.id}`, "DELETE")) window.location.reload();
  }

  async function redefinir(u: Usuario) {
    const s = prompt(`Nova senha para ${u.nome} (mínimo 8 caracteres):`);
    if (!s) return;
    if (await api(`/api/usuarios/${u.id}`, "PATCH", { senha: s })) setMsg({ t: "ok", m: `Senha de ${u.nome} redefinida.` });
  }

  return (
    <>
      {msg && <div className={`aviso ${msg.t}`}>{msg.m}</div>}

      {pendentes.length > 0 && (
        <div className="cartao destaque">
          <h2>Pedidos de acesso <span className="contador">{pendentes.length}</span></h2>
          <p className="ajuda" style={{ marginTop: -6, marginBottom: 12 }}>
            Essas pessoas entraram com o Google e estão esperando sua liberação. Escolha o que cada uma vai ser no sistema.
          </p>
          {pendentes.map((u) => (
            <div className="pedido" key={u.id}>
              <Avatar u={u} />
              <div className="quem">
                <strong>{u.nome}</strong>
                <span className="mudo">{u.email}{u.criado_em ? ` · pediu em ${dataHoraBR(u.criado_em)}` : ""}</span>
              </div>
              <div className="acoes">
                <button className="btn primario pequeno" onClick={() => aprovar(u, "usuario")}>Aprovar como Colaborador</button>
                <button className="btn pequeno" onClick={() => aprovar(u, "admin")}>Aprovar como Administrador</button>
                <button className="btn pequeno perigo" onClick={() => recusar(u)}>Recusar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cartao">
        <h2>Equipe com acesso</h2>
        <div style={{ overflowX: "auto" }}>
          <table className="lista">
            <thead><tr><th>Nome</th><th className="ocultar-m">E-mail</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {equipe.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="pessoa"><Avatar u={u} /><div><strong>{u.nome}</strong>{u.id === eu && <span className="mudo"> (você)</span>}<div className="mudo so-m">{u.email}</div></div></div>
                  </td>
                  <td className="ocultar-m">{u.email}</td>
                  <td>
                    <select value={u.papel} disabled={u.id === eu} style={{ width: 150 }}
                      onChange={async (e) => { if (await api(`/api/usuarios/${u.id}`, "PATCH", { papel: e.target.value })) window.location.reload(); }}>
                      <option value="usuario">{ROTULO_PAPEL.usuario}</option>
                      <option value="admin">{ROTULO_PAPEL.admin}</option>
                    </select>
                  </td>
                  <td><span className={`selo ${u.ativo ? "aprovada" : "cancelada"}`}>{u.ativo ? "Ativo" : "Desativado"}</span></td>
                  <td>
                    <div className="acoes" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                      <button className="btn pequeno" onClick={() => redefinir(u)}>Senha</button>
                      {u.id !== eu && (
                        <button className="btn pequeno" onClick={async () => { if (await api(`/api/usuarios/${u.id}`, "PATCH", { ativo: !u.ativo })) window.location.reload(); }}>
                          {u.ativo ? "Desativar" : "Reativar"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cartao" style={{ maxWidth: 760 }}>
        <h2>Adicionar pessoa manualmente</h2>
        <p className="ajuda" style={{ marginTop: -6, marginBottom: 14 }}>
          Não é obrigatório: quem entrar com o Google aparece em “Pedidos de acesso” para você aprovar.
        </p>
        <form className="grade g2" onSubmit={criar}>
          <label className="campo">Nome<input name="nome" required /></label>
          <label className="campo">E-mail<input name="email" type="email" required /></label>
          <label className="campo">Senha inicial (opcional)<input name="senha" type="text" minLength={8} placeholder="Em branco = só entra com Google" /></label>
          <label className="campo">Perfil
            <select name="papel" defaultValue="usuario">
              <option value="usuario">Colaborador — cria e edita orçamentos</option>
              <option value="admin">Administrador — também configura, exclui e aprova pessoas</option>
            </select>
          </label>
          <div><button className="btn primario">Adicionar</button></div>
        </form>
      </div>
    </>
  );
}
