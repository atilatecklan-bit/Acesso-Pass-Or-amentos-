"use client";
import { useEffect, useMemo, useState } from "react";
import { brl, subtotalSecao, totalProposta } from "@/lib/format";
import { STATUS, type DadosProposta, type Item, type ItemCatalogo, type Periodo, type Secao, type Status } from "@/lib/types";

interface Props {
  id?: number;
  numero?: string;
  versao?: number;
  status?: Status;
  inicial: DadosProposta;
  catalogo: ItemCatalogo[];
  admin: boolean;
  /** quando o editor é usado só para o modelo padrão (Configurações) */
  modoModelo?: boolean;
  onSalvarModelo?: (d: DadosProposta) => Promise<void>;
}

const PERIODOS: { v: Periodo; r: string }[] = [
  { v: "DIAS", r: "Dias" },
  { v: "MESES", r: "Meses" },
  { v: "HORAS", r: "Horas" },
  { v: "UN", r: "Unidade" },
];

const linhas = (a: string[]) => a.join("\n");
const deLinhas = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);
const num = (v: string) => {
  const n = Number(String(v).replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const numTxt = (n: number) => (n ? String(n).replace(".", ",") : "");

function CampoNumero({ valor, onChange, className }: { valor: number; onChange: (n: number) => void; className?: string }) {
  const [txt, setTxt] = useState(numTxt(valor));
  useEffect(() => {
    if (num(txt) !== valor) setTxt(numTxt(valor));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);
  return (
    <input
      className={className}
      inputMode="decimal"
      value={txt}
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d.,]/g, "");
        setTxt(t);
        onChange(num(t.includes(",") ? t : t.replace(/\./g, ",")));
      }}
    />
  );
}

export default function Editor(p: Props) {
  const [d, setD] = useState<DadosProposta>(p.inicial);
  const [status, setStatus] = useState<Status>(p.status ?? "rascunho");
  const [sujo, setSujo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "erro"; m: string } | null>(null);
  const [nota, setNota] = useState("");

  const total = useMemo(() => totalProposta(d), [d]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (sujo) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [sujo]);

  function alterar(f: (x: DadosProposta) => void) {
    setD((old) => {
      const n = structuredClone(old);
      f(n);
      return n;
    });
    setSujo(true);
    setMsg(null);
  }

  async function salvar(abrirPdf = false) {
    setSalvando(true);
    setMsg(null);
    try {
      if (p.modoModelo && p.onSalvarModelo) {
        await p.onSalvarModelo(d);
        setSujo(false);
        setMsg({ t: "ok", m: "Modelo padrão salvo. Os próximos orçamentos já saem com ele." });
        return;
      }
      const r = await fetch(p.id ? `/api/propostas/${p.id}` : "/api/propostas", {
        method: p.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dados: d, nota }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || "Não foi possível salvar.");
      setSujo(false);
      setNota("");
      if (!p.id) {
        window.location.href = abrirPdf ? `/imprimir/${j.id}` : `/propostas/${j.id}`;
        return;
      }
      setMsg({ t: "ok", m: `Salvo como versão ${j.versao}.` });
      if (abrirPdf) window.open(`/imprimir/${p.id}`, "_blank");
      else window.location.reload();
    } catch (e: any) {
      setMsg({ t: "erro", m: e.message });
    } finally {
      setSalvando(false);
    }
  }

  async function trocarStatus(s: Status) {
    setStatus(s);
    if (!p.id) return;
    const r = await fetch(`/api/propostas/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s }),
    });
    if (!r.ok) setMsg({ t: "erro", m: "Não foi possível mudar o status." });
  }

  async function duplicar() {
    if (sujo && !confirm("Há alterações não salvas. Duplicar a última versão salva mesmo assim?")) return;
    const r = await fetch(`/api/propostas/${p.id}/duplicar`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (r.ok) window.location.href = `/propostas/${j.id}`;
    else setMsg({ t: "erro", m: j.erro || "Não foi possível duplicar." });
  }

  async function excluir() {
    if (!confirm("Excluir este orçamento e todas as versões? Isso não pode ser desfeito.")) return;
    const r = await fetch(`/api/propostas/${p.id}`, { method: "DELETE" });
    if (r.ok) window.location.href = "/";
    else setMsg({ t: "erro", m: "Não foi possível excluir." });
  }

  // ---------- seções de itens ----------
  const setItem = (si: number, ii: number, campo: keyof Item, v: string | number) =>
    alterar((x) => {
      (x.secoes[si].itens[ii] as any)[campo] = v;
    });

  function adicionarDoCatalogo(si: number, idx: string) {
    if (idx === "") return;
    const c = p.catalogo[Number(idx)];
    alterar((x) => {
      x.secoes[si].itens.push({ descricao: c.descricao, qtd: 1, periodo: 1, unitario: c.unitario });
      if (x.secoes[si].itens.length === 1) x.secoes[si].colunaPeriodo = c.colunaPeriodo;
    });
  }

  function moverSecao(si: number, dir: -1 | 1) {
    alterar((x) => {
      const j = si + dir;
      if (j < 0 || j >= x.secoes.length) return;
      [x.secoes[si], x.secoes[j]] = [x.secoes[j], x.secoes[si]];
    });
  }

  return (
    <div className="editor">
      <div>
        {msg && <div className={`aviso ${msg.t}`}>{msg.m}</div>}

        {!p.modoModelo && (
          <div className="cartao">
            <h2>Cliente e evento</h2>
            <div className="grade g2">
              <label className="campo">Cliente (contratante)
                <input value={d.cliente.nome} onChange={(e) => alterar((x) => { x.cliente.nome = e.target.value; })} placeholder="Ex.: Sindicato Rural de Jaíba" />
              </label>
              <label className="campo">A/C (contato)
                <input value={d.cliente.contato} onChange={(e) => alterar((x) => { x.cliente.contato = e.target.value; })} />
              </label>
              <label className="campo">CNPJ / CPF
                <input value={d.cliente.documento} onChange={(e) => alterar((x) => { x.cliente.documento = e.target.value; })} />
              </label>
              <div className="grade g2">
                <label className="campo">Telefone
                  <input value={d.cliente.telefone} onChange={(e) => alterar((x) => { x.cliente.telefone = e.target.value; })} />
                </label>
                <label className="campo">E-mail
                  <input value={d.cliente.email} onChange={(e) => alterar((x) => { x.cliente.email = e.target.value; })} />
                </label>
              </div>
              <label className="campo">Nome do evento
                <input value={d.evento.nome} onChange={(e) => alterar((x) => { x.evento.nome = e.target.value; })} placeholder="Ex.: 1º EXPO JAÍBA" />
              </label>
              <div className="grade g2">
                <label className="campo">Tipo
                  <input value={d.evento.tipo} onChange={(e) => alterar((x) => { x.evento.tipo = e.target.value; })} list="tipos" />
                </label>
                <label className="campo">Dias de operação
                  <input value={d.evento.diasOperacao} onChange={(e) => alterar((x) => { x.evento.diasOperacao = e.target.value; })} />
                </label>
              </div>
              <label className="campo">Local
                <input value={d.evento.local} onChange={(e) => alterar((x) => { x.evento.local = e.target.value; })} />
              </label>
              <label className="campo">Data(s) do evento
                <input value={d.evento.datas} onChange={(e) => alterar((x) => { x.evento.datas = e.target.value; })} placeholder="Ex.: 22 a 26/04/2027" />
              </label>
              <label className="campo">Emitida em
                <input type="date" value={d.emissao} onChange={(e) => alterar((x) => { x.emissao = e.target.value; })} />
              </label>
              <label className="campo">Válida até
                <input type="date" value={d.validade} onChange={(e) => alterar((x) => { x.validade = e.target.value; })} />
              </label>
            </div>
            <datalist id="tipos">
              {["Show", "Feira / Exposição", "Congresso", "Corporativo", "Casamento", "Aniversário", "Formatura", "Réveillon", "Festa"].map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
        )}

        <div className="cartao">
          <h2>Valores <small>itens com quantidade × período × unitário</small></h2>
          {d.secoes.map((s, si) => (
            <div className="secao-ed" key={si}>
              <div className="cab">
                <input value={s.titulo} onChange={(e) => alterar((x) => { x.secoes[si].titulo = e.target.value; })} />
                <select value={s.colunaPeriodo} onChange={(e) => alterar((x) => { x.secoes[si].colunaPeriodo = e.target.value as Periodo; })} title="Coluna de período">
                  {PERIODOS.map((o) => <option key={o.v} value={o.v}>{o.r}</option>)}
                </select>
                <button className="x" title="Subir" onClick={() => moverSecao(si, -1)}>↑</button>
                <button className="x" title="Descer" onClick={() => moverSecao(si, 1)}>↓</button>
                <button className="x" title="Remover seção" onClick={() => { if (confirm(`Remover a seção “${s.titulo}”?`)) alterar((x) => { x.secoes.splice(si, 1); }); }}>×</button>
              </div>
              {s.itens.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table className="itens">
                    <thead>
                      <tr>
                        <th>Descrição</th>
                        <th className="n">Qtd</th>
                        <th className="n">{PERIODOS.find((o) => o.v === s.colunaPeriodo)?.r}</th>
                        <th className="u">Unitário (R$)</th>
                        <th className="st">Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.itens.map((it, ii) => (
                        <tr key={ii}>
                          <td>
                            <input value={it.descricao} onChange={(e) => setItem(si, ii, "descricao", e.target.value)} />
                            <input value={it.detalhe ?? ""} onChange={(e) => setItem(si, ii, "detalhe", e.target.value)} placeholder="Detalhe (opcional, sai em letra menor)" style={{ marginTop: 4, fontSize: 12 }} />
                          </td>
                          <td className="n"><CampoNumero valor={it.qtd} onChange={(n) => setItem(si, ii, "qtd", n)} /></td>
                          <td className="n"><CampoNumero valor={it.periodo} onChange={(n) => setItem(si, ii, "periodo", n)} /></td>
                          <td className="u"><CampoNumero valor={it.unitario} onChange={(n) => setItem(si, ii, "unitario", n)} /></td>
                          <td className="st">{brl(it.qtd * it.periodo * it.unitario)}</td>
                          <td><button className="x" onClick={() => alterar((x) => { x.secoes[si].itens.splice(ii, 1); })}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="rodape-sec">
                <div className="acoes">
                  <button className="btn pequeno" onClick={() => alterar((x) => { x.secoes[si].itens.push({ descricao: "", qtd: 1, periodo: 1, unitario: 0 }); })}>+ Item</button>
                  {p.catalogo.length > 0 && (
                    <select className="btn pequeno" value="" onChange={(e) => adicionarDoCatalogo(si, e.target.value)} style={{ width: "auto" }}>
                      <option value="">+ Do catálogo…</option>
                      {p.catalogo.map((c, i) => <option key={i} value={i}>{c.descricao} — {brl(c.unitario)}</option>)}
                    </select>
                  )}
                </div>
                <strong>{brl(subtotalSecao(s))}</strong>
              </div>
            </div>
          ))}
          <div className="acoes">
            <button className="btn" onClick={() => alterar((x) => { x.secoes.push({ titulo: "Nova seção", colunaPeriodo: "DIAS", itens: [] } as Secao); })}>+ Seção</button>
          </div>
          <div className="grade g2" style={{ marginTop: 16 }}>
            <label className="campo">Texto da linha de total
              <input value={d.rotuloTotal} onChange={(e) => alterar((x) => { x.rotuloTotal = e.target.value; })} />
            </label>
            <label className="campo">Estimativa de taxa do sistema (R$, opcional)
              <CampoNumero valor={d.taxaSistemaEstimada} onChange={(n) => alterar((x) => { x.taxaSistemaEstimada = n; })} />
            </label>
          </div>
        </div>

        <div className="cartao">
          <h2>Taxas do sistema</h2>
          {d.taxas.map((t, i) => (
            <div className="linhas-taxa" key={i}>
              <input value={t.rotulo} onChange={(e) => alterar((x) => { x.taxas[i].rotulo = e.target.value; })} placeholder="Taxa" />
              <input value={t.detalhe ?? ""} onChange={(e) => alterar((x) => { x.taxas[i].detalhe = e.target.value; })} placeholder="Detalhe (opcional)" />
              <input value={t.valor} onChange={(e) => alterar((x) => { x.taxas[i].valor = e.target.value; })} placeholder="Ex.: 10% ou R$ 0,20" />
              <button className="x" onClick={() => alterar((x) => { x.taxas.splice(i, 1); })}>×</button>
            </div>
          ))}
          <button className="btn pequeno" onClick={() => alterar((x) => { x.taxas.push({ rotulo: "", valor: "" }); })}>+ Taxa</button>
        </div>

        <div className="cartao">
          <details className="dobra">
            <summary>Escopo e itens inclusos</summary>
            <div className="grade">
              <label className="campo">Escopo
                <textarea value={d.escopo} onChange={(e) => alterar((x) => { x.escopo = e.target.value; })} />
              </label>
              <label className="campo">Incluso sem custo adicional (um por linha)
                <textarea rows={8} value={linhas(d.incluso)} onChange={(e) => alterar((x) => { x.incluso = deLinhas(e.target.value); })} />
              </label>
            </div>
          </details>
        </div>

        <div className="cartao">
          <details className="dobra">
            <summary>Meios de pagamento</summary>
            <div>
              {d.meiosPagamento.map((m, i) => (
                <div className="linhas-meio" key={i}>
                  <input value={m.meio} onChange={(e) => alterar((x) => { x.meiosPagamento[i].meio = e.target.value; })} placeholder="Meio" />
                  <input value={m.custo} onChange={(e) => alterar((x) => { x.meiosPagamento[i].custo = e.target.value; })} placeholder="Custo" />
                  <input value={m.recebimento} onChange={(e) => alterar((x) => { x.meiosPagamento[i].recebimento = e.target.value; })} placeholder="Recebimento" />
                  <button className="x" onClick={() => alterar((x) => { x.meiosPagamento.splice(i, 1); })}>×</button>
                </div>
              ))}
              <button className="btn pequeno" onClick={() => alterar((x) => { x.meiosPagamento.push({ meio: "", custo: "", recebimento: "" }); })}>+ Meio de pagamento</button>
              <label className="campo" style={{ marginTop: 12 }}>Nota abaixo da tabela
                <textarea value={d.notaPagamento} onChange={(e) => alterar((x) => { x.notaPagamento = e.target.value; })} />
              </label>
            </div>
          </details>
        </div>

        <div className="cartao">
          <details className="dobra">
            <summary>Textos e condições</summary>
            <div className="grade">
              <p className="ajuda">Uma linha por item. Você pode usar {"{validade}"}, {"{cliente}"} e {"{evento}"} que o sistema preenche sozinho.</p>
              <label className="campo">Como o dinheiro entra
                <textarea value={d.textos.comoDinheiroEntra} onChange={(e) => alterar((x) => { x.textos.comoDinheiroEntra = e.target.value; })} />
              </label>
              <label className="campo">Como o dinheiro entra — itens
                <textarea rows={4} value={linhas(d.textos.comoDinheiroEntraItens)} onChange={(e) => alterar((x) => { x.textos.comoDinheiroEntraItens = deLinhas(e.target.value); })} />
              </label>
              <label className="campo">Repasse das taxas — itens
                <textarea rows={4} value={linhas(d.textos.repasseItens)} onChange={(e) => alterar((x) => { x.textos.repasseItens = deLinhas(e.target.value); })} />
              </label>
              <label className="campo">Repasse — nota
                <textarea value={d.textos.repasseNota} onChange={(e) => alterar((x) => { x.textos.repasseNota = e.target.value; })} />
              </label>
              <label className="campo">Não incluso nesta proposta
                <textarea rows={6} value={linhas(d.textos.naoIncluso)} onChange={(e) => alterar((x) => { x.textos.naoIncluso = deLinhas(e.target.value); })} />
              </label>
              <label className="campo">Obrigações do organizador
                <textarea rows={6} value={linhas(d.textos.obrigacoes)} onChange={(e) => alterar((x) => { x.textos.obrigacoes = deLinhas(e.target.value); })} />
              </label>
              <label className="campo">Condições gerais
                <textarea rows={4} value={linhas(d.textos.condicoes)} onChange={(e) => alterar((x) => { x.textos.condicoes = deLinhas(e.target.value); })} />
              </label>
              {!p.modoModelo && (
                <label className="campo">Observações (sai no fim da proposta, opcional)
                  <textarea value={d.observacoes} onChange={(e) => alterar((x) => { x.observacoes = e.target.value; })} />
                </label>
              )}
            </div>
          </details>
        </div>
      </div>

      <div className="lado">
        <div className="total-box">
          <div className="rot">Investimento estimado</div>
          <div className="val">{brl(total)}</div>
          {d.secoes.map((s, i) => (
            <div className="linha" key={i}><span>{s.titulo}</span><span>{brl(subtotalSecao(s))}</span></div>
          ))}
          {d.taxaSistemaEstimada > 0 && <div className="linha"><span>Taxa do sistema</span><span>{brl(d.taxaSistemaEstimada)}</span></div>}
        </div>

        <div className="cartao">
          {!p.modoModelo && p.id && (
            <label className="campo" style={{ marginBottom: 12 }}>Status
              <select value={status} onChange={(e) => trocarStatus(e.target.value as Status)}>
                {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
              </select>
            </label>
          )}
          {!p.modoModelo && (
            <label className="campo" style={{ marginBottom: 12 }}>O que mudou? (opcional)
              <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ex.: reduzi equipe para 3 dias" />
            </label>
          )}
          <div className="grade">
            <button className="btn primario" onClick={() => salvar(false)} disabled={salvando}>
              {salvando ? "Salvando…" : p.modoModelo ? "Salvar modelo padrão" : sujo || !p.id ? "Salvar" : "Salvo"}
            </button>
            {!p.modoModelo && (
              <button className="btn" onClick={() => (sujo || !p.id ? salvar(true) : window.open(`/imprimir/${p.id}`, "_blank"))} disabled={salvando}>
                {sujo || !p.id ? "Salvar e gerar PDF" : "Gerar PDF"}
              </button>
            )}
            {p.id && (
              <>
                <a className="btn" href={`/propostas/${p.id}/versoes`}>Histórico de versões (v{p.versao})</a>
                <button className="btn" onClick={duplicar}>Duplicar orçamento</button>
                {p.admin && <button className="btn perigo" onClick={excluir}>Excluir</button>}
              </>
            )}
          </div>
          {sujo && <p className="ajuda" style={{ marginTop: 10 }}>Há alterações não salvas.</p>}
        </div>
      </div>
    </div>
  );
}
