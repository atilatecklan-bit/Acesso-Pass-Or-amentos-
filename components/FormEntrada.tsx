"use client";
import { useState } from "react";

export default function FormEntrada({ modo }: { modo: "login" | "setup" }) {
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    const f = new FormData(e.currentTarget);
    const dados = Object.fromEntries(f.entries());
    if (modo === "setup" && dados.senha !== dados.confirmar) return setErro("As senhas não conferem.");
    setEnviando(true);
    const r = await fetch(modo === "login" ? "/api/auth/login" : "/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...dados, exemplo: f.get("exemplo") === "on" }),
    });
    const j = await r.json().catch(() => ({}));
    setEnviando(false);
    if (!r.ok) return setErro(j.erro || "Não foi possível entrar.");
    window.location.href = "/";
  }

  return (
    <form onSubmit={enviar}>
      {erro && <div className="aviso erro">{erro}</div>}
      {modo === "setup" && (
        <label className="campo">
          Seu nome
          <input name="nome" required autoComplete="name" />
        </label>
      )}
      <label className="campo">
        E-mail
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label className="campo">
        Senha
        <input name="senha" type="password" required minLength={modo === "setup" ? 8 : 1} autoComplete={modo === "setup" ? "new-password" : "current-password"} />
      </label>
      {modo === "setup" && (
        <>
          <label className="campo">
            Confirmar senha
            <input name="confirmar" type="password" required minLength={8} autoComplete="new-password" />
          </label>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
            <input type="checkbox" name="exemplo" defaultChecked style={{ width: "auto", marginTop: 3 }} />
            Já cadastrar a proposta do Sindicato Rural de Jaíba (versão revisada)
          </label>
        </>
      )}
      <button className="btn primario" disabled={enviando}>
        {enviando ? "Aguarde…" : modo === "login" ? "Entrar" : "Criar acesso de administrador"}
      </button>
    </form>
  );
}
