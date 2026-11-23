import Link from "next/link";
import AcoesLinha from "@/components/AcoesLinha";
import { listarPropostas, resumoStatus } from "@/lib/repo";
import { brl, dataHoraBR } from "@/lib/format";
import { STATUS } from "@/lib/types";

export const metadata = { title: "Orçamentos" };

export default async function Inicio({ searchParams }: { searchParams: Promise<{ busca?: string; status?: string }> }) {
  const sp = await searchParams;
  const [lista, resumo] = await Promise.all([listarPropostas(sp), resumoStatus()]);
  const r = (s: string) => resumo.find((x) => x.status === s) ?? { n: 0, total: 0 };
  const totalGeral = resumo.reduce((t, x) => t + x.n, 0);
  const rot = (s: string) => STATUS.find((x) => x.valor === s)?.rotulo ?? s;

  return (
    <>
      <div className="topo">
        <div>
          <h1>Orçamentos</h1>
          <p>Todas as propostas da equipe, com histórico de versões.</p>
        </div>
        <Link href="/propostas/nova" className="btn primario">+ Novo orçamento</Link>
      </div>

      <div className="resumo">
        <div className="cartao"><div className="rot">Total de propostas</div><div className="val">{totalGeral}</div></div>
        <div className="cartao"><div className="rot">Em aberto (enviadas)</div><div className="val">{r("enviada").n}<small>{brl(r("enviada").total)}</small></div></div>
        <div className="cartao"><div className="rot">Aprovadas</div><div className="val">{r("aprovada").n}<small>{brl(r("aprovada").total)}</small></div></div>
        <div className="cartao"><div className="rot">Rascunhos</div><div className="val">{r("rascunho").n}</div></div>
      </div>

      <div className="cartao">
        <form className="filtros">
          <input name="busca" placeholder="Buscar por cliente, evento ou número" defaultValue={sp.busca ?? ""} />
          <select name="status" defaultValue={sp.status ?? ""}>
            <option value="">Todos os status</option>
            {STATUS.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
          </select>
          <button className="btn">Filtrar</button>
          {(sp.busca || sp.status) && <Link href="/" className="btn fantasma">Limpar</Link>}
        </form>

        {lista.length === 0 ? (
          <p className="mudo" style={{ padding: "20px 4px" }}>
            {sp.busca || sp.status ? "Nenhum orçamento encontrado com esse filtro." : "Nenhum orçamento ainda. Clique em “Novo orçamento” para começar."}
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="lista">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Cliente / evento</th>
                  <th>Status</th>
                  <th className="num">Total</th>
                  <th className="ocultar-m">Atualizado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lista.map((p) => (
                  <tr key={p.id}>
                    <td className="mudo" style={{ whiteSpace: "nowrap" }}>{p.numero}</td>
                    <td>
                      <Link className="link" href={`/propostas/${p.id}`}>{p.cliente || "(sem cliente)"}</Link>
                      <div className="mudo">{p.evento || "—"}</div>
                    </td>
                    <td><span className={`selo ${p.status}`}>{rot(p.status)}</span></td>
                    <td className="num"><strong>{brl(p.total)}</strong></td>
                    <td className="mudo ocultar-m">
                      {dataHoraBR(p.atualizado_em)}
                      <div>{p.editor ?? ""} · v{p.versao}</div>
                    </td>
                    <td><AcoesLinha id={p.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
