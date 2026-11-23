import Link from "next/link";
import { notFound } from "next/navigation";
import Restaurar from "@/components/Restaurar";
import { lerProposta, listarVersoes } from "@/lib/repo";
import { brl, dataHoraBR } from "@/lib/format";

export const metadata = { title: "Histórico de versões" };

export default async function Versoes({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const p = Number.isInteger(id) ? await lerProposta(id) : undefined;
  if (!p) notFound();
  const vs = await listarVersoes(id);
  return (
    <>
      <div className="topo">
        <div>
          <h1>Histórico de versões</h1>
          <p>{p.cliente} · Nº {p.numero}</p>
        </div>
        <Link href={`/propostas/${id}`} className="btn">← Voltar ao orçamento</Link>
      </div>
      <div className="cartao">
        <table className="lista">
          <thead>
            <tr><th>Versão</th><th>Quando</th><th>Quem</th><th>O que mudou</th><th className="num">Total</th><th></th></tr>
          </thead>
          <tbody>
            {vs.map((v) => (
              <tr key={v.versao}>
                <td><strong>v{v.versao}</strong>{v.versao === p.versao && <span className="selo aprovada" style={{ marginLeft: 8 }}>atual</span>}</td>
                <td className="mudo">{dataHoraBR(v.criado_em)}</td>
                <td>{v.autor ?? "—"}</td>
                <td>{v.nota || <span className="mudo">—</span>}</td>
                <td className="num">{brl(v.total)}</td>
                <td>
                  <div className="acoes" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
                    <a className="btn pequeno" href={`/imprimir/${id}?v=${v.versao}`} target="_blank">Ver PDF</a>
                    {v.versao !== p.versao && <Restaurar id={id} versao={v.versao} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
