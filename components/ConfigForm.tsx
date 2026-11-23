"use client";
import { useState } from "react";
import Editor from "./Editor";
import { brl } from "@/lib/format";
import type { Configuracoes, DadosProposta, Periodo } from "@/lib/types";

async function enviar(cfg: Configuracoes) {
  const r = await fetch("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || "Não foi possível salvar.");
}

export default function ConfigForm({ inicial, admin }: { inicial: Configuracoes; admin: boolean }) {
  const [cfg, setCfg] = useState(inicial);
  const [msg, setMsg] = useState<{ t: "ok" | "erro"; m: string } | null>(null);
  const [senha, setSenha] = useState({ atual: "", nova: "" });

  const mudar = (f: (c: Configuracoes) => void) =>
    setCfg((o) => {
      const n = structuredClone(o);
      f(n);
      return n;
    });

  async function salvarGeral() {
    setMsg(null);
    try {
      await enviar(cfg);
      setMsg({ t: "ok", m: "Configurações salvas." });
    } catch (e: any) {
      setMsg({ t: "erro", m: e.message });
    }
  }

  function carregarLogo(f?: File) {
    if (!f) return;
    if (f.size > 400_000) return setMsg({ t: "erro", m: "A logo precisa ter menos de 400 KB." });
    const r = new FileReader();
    r.onload = () => mudar((c) => { c.logo = String(r.result); });
    r.readAsDataURL(f);
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch("/api/usuarios/senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(senha),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      setSenha({ atual: "", nova: "" });
      setMsg({ t: "ok", m: "Senha alterada." });
    } else setMsg({ t: "erro", m: j.erro || "Não foi possível alterar a senha." });
  }

  return (
    <>
      {msg && <div className={`aviso ${msg.t}`}>{msg.m}</div>}
      {!admin && <div className="aviso info">Só administradores podem alterar as configurações. Você pode trocar sua senha no fim da página.</div>}

      <fieldset disabled={!admin} style={{ border: 0, padding: 0, margin: 0 }}>
        <div className="cartao">
          <h2>Empresa e documento</h2>
          <div className="grade g3">
            <label className="campo">Nome da empresa
              <input value={cfg.empresa.nome} onChange={(e) => mudar((c) => { c.empresa.nome = e.target.value; })} />
            </label>
            <label className="campo">Site
              <input value={cfg.empresa.site} onChange={(e) => mudar((c) => { c.empresa.site = e.target.value; })} />
            </label>
            <label className="campo">Validade padrão (dias)
              <input type="number" min={1} value={cfg.validadeDias} onChange={(e) => mudar((c) => { c.validadeDias = Number(e.target.value) || 15; })} />
            </label>
            <label className="campo span2">Rodapé do PDF
              <input value={cfg.empresa.rodape} onChange={(e) => mudar((c) => { c.empresa.rodape = e.target.value; })} />
            </label>
            <label className="campo">Logo do PDF (PNG/JPG até 400 KB)
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e) => carregarLogo(e.target.files?.[0])} />
            </label>
          </div>
          <div className="acoes" style={{ marginTop: 14 }}>
            <img src={cfg.logo || "/logo.png"} alt="Logo" style={{ height: 34, border: "1px solid #eee", borderRadius: 6, padding: 4, background: "#fff" }} />
            {cfg.logo && <button className="btn pequeno" onClick={() => mudar((c) => { c.logo = undefined; })}>Voltar à logo padrão</button>}
          </div>
        </div>

        <div className="cartao">
          <h2>Catálogo de itens <small>aparecem no botão “+ Do catálogo” do orçamento</small></h2>
          <div style={{ overflowX: "auto" }}>
            <table className="itens">
              <thead>
                <tr><th>Descrição</th><th className="u">Unitário (R$)</th><th>Seção sugerida</th><th style={{ width: 120 }}>Período</th><th></th></tr>
              </thead>
              <tbody>
                {cfg.catalogo.map((c, i) => (
                  <tr key={i}>
                    <td><input value={c.descricao} onChange={(e) => mudar((x) => { x.catalogo[i].descricao = e.target.value; })} /></td>
                    <td className="u">
                      <input inputMode="decimal" defaultValue={String(c.unitario).replace(".", ",")}
                        onChange={(e) => mudar((x) => { x.catalogo[i].unitario = Number(e.target.value.replace(/\./g, "").replace(",", ".")) || 0; })} />
                    </td>
                    <td><input value={c.secao} onChange={(e) => mudar((x) => { x.catalogo[i].secao = e.target.value; })} /></td>
                    <td>
                      <select value={c.colunaPeriodo} onChange={(e) => mudar((x) => { x.catalogo[i].colunaPeriodo = e.target.value as Periodo; })}>
                        <option value="DIAS">Dias</option><option value="MESES">Meses</option><option value="HORAS">Horas</option><option value="UN">Unidade</option>
                      </select>
                    </td>
                    <td><button className="x" onClick={() => mudar((x) => { x.catalogo.splice(i, 1); })}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="acoes" style={{ marginTop: 10 }}>
            <button className="btn pequeno" onClick={() => mudar((x) => { x.catalogo.push({ descricao: "", unitario: 0, secao: "Equipamentos", colunaPeriodo: "DIAS" }); })}>+ Item no catálogo</button>
            <span className="mudo">{cfg.catalogo.length} itens · média {brl(cfg.catalogo.reduce((t, c) => t + c.unitario, 0) / Math.max(1, cfg.catalogo.length))}</span>
          </div>
        </div>

        <div className="acoes" style={{ margin: "16px 0 26px" }}>
          <button className="btn primario" onClick={salvarGeral}>Salvar empresa e catálogo</button>
        </div>

        <h2 style={{ margin: "8px 0 4px" }}>Modelo padrão do orçamento</h2>
        <p className="ajuda" style={{ marginBottom: 14 }}>
          Taxas, seções, textos e condições que todo orçamento novo já traz preenchidos. Mudar aqui não altera orçamentos já salvos.
        </p>
        <Editor
          inicial={cfg.modelo}
          catalogo={cfg.catalogo}
          admin={admin}
          modoModelo
          onSalvarModelo={async (d: DadosProposta) => {
            const n = { ...cfg, modelo: d };
            await enviar(n);
            setCfg(n);
          }}
        />
      </fieldset>

      <div className="cartao" style={{ marginTop: 24, maxWidth: 520 }}>
        <h2>Minha senha</h2>
        <form className="grade" onSubmit={trocarSenha}>
          <label className="campo">Senha atual
            <input type="password" value={senha.atual} onChange={(e) => setSenha({ ...senha, atual: e.target.value })} required autoComplete="current-password" />
          </label>
          <label className="campo">Nova senha (mínimo 8 caracteres)
            <input type="password" minLength={8} value={senha.nova} onChange={(e) => setSenha({ ...senha, nova: e.target.value })} required autoComplete="new-password" />
          </label>
          <div><button className="btn">Alterar senha</button></div>
        </form>
      </div>
    </>
  );
}
