import { brl, dataBR, preencher, subtotalSecao, totalProposta } from "@/lib/format";
import type { Configuracoes, DadosProposta } from "@/lib/types";

const COLUNA: Record<string, string> = { DIAS: "Dias", MESES: "Meses", HORAS: "Horas", UN: "Un." };
const n = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });

export default function Documento({ d, numero, cfg }: { d: DadosProposta; numero?: string; cfg: Configuracoes }) {
  const t = d.textos;
  const total = totalProposta(d);
  const secoes = d.secoes.filter((s) => s.itens.length > 0);
  const lista = (itens: string[]) => (
    <ul className="bolas">{itens.map((x, i) => <li key={i}>{preencher(x, d)}</li>)}</ul>
  );

  return (
    <article className="doc">
      <header className="cab">
        <img src={cfg.logo || "/logo.png"} alt={cfg.empresa.nome} />
        <div className="meta">
          Proposta{numero ? <> Nº <strong>{numero}</strong></> : null}
          <br />Emitida em <strong>{dataBR(d.emissao)}</strong>
          <br />Válida até <strong>{dataBR(d.validade)}</strong>
        </div>
      </header>

      <h1>Proposta comercial<br />de ingressos e controle de acesso</h1>
      <p className="para">
        Preparada para <strong>{d.cliente.nome || "—"}</strong>
        {d.cliente.contato ? <> · a/c {d.cliente.contato}</> : null}
        {d.cliente.documento ? <> · {d.cliente.documento}</> : null}
      </p>
      <hr className="tracejado" />

      <div className="duas">
        <div>
          <div className="rot">Evento</div>
          <strong>{d.evento.nome}</strong>
          {d.evento.tipo && <div>{d.evento.tipo}</div>}
          {d.evento.local && <div>{d.evento.local}</div>}
          {d.evento.datas && <div>{d.evento.datas}</div>}
          {d.evento.diasOperacao && <div>{d.evento.diasOperacao} dia(s) de operação</div>}
        </div>
        <div>
          <div className="rot">Escopo</div>
          <div>{preencher(d.escopo, d)}</div>
        </div>
      </div>

      {d.incluso.length > 0 && (
        <section className="bloco">
          <div className="rot">Incluso sem custo adicional</div>
          {lista(d.incluso)}
        </section>
      )}

      {d.taxas.length > 0 && (
        <section className="bloco">
          <div className="rot">Taxas do sistema</div>
          <table className="taxas">
            <tbody>
              {d.taxas.map((x, i) => (
                <tr key={i}>
                  <td>{x.rotulo}{x.detalhe && <span className="det">{preencher(x.detalhe, d)}</span>}</td>
                  <td className="r" style={{ whiteSpace: "nowrap" }}>{x.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {d.meiosPagamento.length > 0 && (
        <section className="bloco">
          <div className="rot">Meios de pagamento e prazos de recebimento</div>
          <table>
            <thead><tr><th>Meio de pagamento</th><th className="r">Custo</th><th className="r">Recebimento</th></tr></thead>
            <tbody>
              {d.meiosPagamento.map((m, i) => (
                <tr key={i}><td>{m.meio}</td><td className="r">{m.custo}</td><td className="r">{m.recebimento}</td></tr>
              ))}
            </tbody>
          </table>
          {d.notaPagamento && <p className="nota">{preencher(d.notaPagamento, d)}</p>}
        </section>
      )}

      {secoes.map((s, si) => (
        <section className="bloco" key={si}>
          <div className="rot">{s.titulo}</div>
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th className="r" style={{ width: "9%" }}>Qtd</th>
                <th className="r" style={{ width: "10%" }}>{COLUNA[s.colunaPeriodo]}</th>
                <th className="r" style={{ width: "17%" }}>Unitário</th>
                <th className="r" style={{ width: "18%" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {s.itens.map((it, ii) => (
                <tr key={ii}>
                  <td>{it.descricao}{it.detalhe && <span className="det">{it.detalhe}</span>}</td>
                  <td className="r">{n(it.qtd)}</td>
                  <td className="r">{n(it.periodo)}</td>
                  <td className="r">{brl(it.unitario)}</td>
                  <td className="r">{brl(it.qtd * it.periodo * it.unitario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      {secoes.length > 0 && (
        <div className="total" style={{ marginTop: 0 }}>
          <span>{d.rotuloTotal}</span>
          <span>{brl(secoes.reduce((t2, s) => t2 + subtotalSecao(s), 0))}</span>
        </div>
      )}

      <div className="invest">
        <div>
          <div className="k">Investimento estimado</div>
          <div className="v">{brl(total)}</div>
        </div>
        <div className="lado">
          {secoes.map((s, i) => <div key={i}>{s.titulo}: {brl(subtotalSecao(s))}</div>)}
          {d.taxaSistemaEstimada > 0 && <div>Taxa do sistema (estimada): {brl(d.taxaSistemaEstimada)}</div>}
        </div>
      </div>

      <div className="quebra" />

      {(t.comoDinheiroEntra || t.comoDinheiroEntraItens.length > 0) && (
        <section className="bloco">
          <div className="rot">Como o dinheiro entra</div>
          {t.comoDinheiroEntra && <p style={{ margin: "0 0 8pt" }}>{preencher(t.comoDinheiroEntra, d)}</p>}
          {lista(t.comoDinheiroEntraItens)}
        </section>
      )}
      {(t.repasseItens.length > 0 || t.repasseNota) && (
        <section className="bloco">
          <div className="rot">Repasse das taxas à {cfg.empresa.nome}</div>
          {lista(t.repasseItens)}
          {t.repasseNota && <p className="nota">{preencher(t.repasseNota, d)}</p>}
        </section>
      )}
      {t.naoIncluso.length > 0 && (
        <section className="bloco"><div className="rot">Não incluso nesta proposta</div>{lista(t.naoIncluso)}</section>
      )}
      {t.obrigacoes.length > 0 && (
        <section className="bloco"><div className="rot">Obrigações do organizador</div>{lista(t.obrigacoes)}</section>
      )}
      {t.condicoes.length > 0 && (
        <section className="bloco"><div className="rot">Condições gerais</div>{lista(t.condicoes)}</section>
      )}
      {d.observacoes && (
        <section className="bloco"><div className="rot">Observações</div><p style={{ whiteSpace: "pre-line", margin: 0 }}>{preencher(d.observacoes, d)}</p></section>
      )}

      <div className="assinatura">
        <div className="traco">{d.cliente.nome || "Contratante"}</div>
        De acordo — data ___/___/______
      </div>

      <footer className="rodape">
        <span>{cfg.empresa.rodape}</span>
        <span>{cfg.empresa.site}</span>
      </footer>
    </article>
  );
}
