"use client";
import { useState } from "react";
import type { Usuario } from "@/lib/types";

export default function UsuariosAdmin({ lista, eu }: { lista: Usuario[]; eu: number }) {
  const [msg, setMsg] = useState<{ t: "ok" | "erro"; m: string } | null>(null);

  async function api(url: string, method: string, body: unknown) {
    setMsg(null);
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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

  async function redefinir(u: Usuario) {
    const s = prompt(`Nova senha para ${u.nome} (mínimo 8 caracteres):`);
    if (!s) return;
    if (await api(`/api/usuarios/${u.id}`, "PATCH", { senha: s })) setMsg({ t: "ok", m: `Senha de ${u.nome} redefinida. Passe para ele(a) a nova senha.` });
  }

  return (
    <>
      {msg && <div className={`aviso ${msg.t}`}>{msg.m}</div>}
      <div className="cartao">
        <h2>Equipe com acesso</h2>
        <table className="lista">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Situação</th><th></th></tr></thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.nome}</strong>{u.id === eu && <span className="mudo"> (você)</span>}</td>
                <td>{u.email}</td>
                <td>
                  <select value={u.papel} disabled={u.id === eu} style={{ width: 150 }}
                    onChange={async (e) => { if (await api(`/api/usuarios/${u.id}`, "PATCH", { papel: e.target.value })) window.location.reload(); }}>
                    <option value="usuario">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td><span className={`selo ${u.ativo ? "aprovada" : "cancelada"}`}>{u.ativo ? "Ativo" : "Desativado"}</span></td>
                <td>
                  <div className="acoes" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                    <button className="btn pequeno" onClick={() => redefinir(u)}>Redefinir senha</button>
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

      <div className="cartao" style={{ maxWidth: 760 }}>
        <h2>Adicionar pessoa</h2>
        <p className="ajuda" style={{ marginTop: -6, marginBottom: 14 }}>Quem tiver e-mail Google (Gmail ou Workspace) pode entrar pelo botão “Entrar com Google” usando o mesmo e-mail cadastrado aqui.</p>
        <form className="grade g2" onSubmit={criar}>
          <label className="campo">Nome<input name="nome" required /></label>
          <label className="campo">E-mail<input name="email" type="email" required /></label>
          <label className="campo">Senha inicial (opcional)<input name="senha" type="text" minLength={8} placeholder="Em branco = só entra com Google" /></label>
          <label className="campo">Perfil
            <select name="papel" defaultValue="usuario">
              <option value="usuario">Usuário — cria e edita orçamentos</option>
              <option value="admin">Administrador — também configura, exclui e gerencia a equipe</option>
            </select>
          </label>
          <div><button className="btn primario">Adicionar</button></div>
        </form>
      </div>
    </>
  );
}
