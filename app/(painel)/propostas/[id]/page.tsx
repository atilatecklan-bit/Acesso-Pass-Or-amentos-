import Link from "next/link";
import { notFound } from "next/navigation";
import Editor from "@/components/Editor";
import { exigirUsuario } from "@/lib/auth";
import { lerConfig, lerProposta } from "@/lib/repo";
import { dataHoraBR } from "@/lib/format";

export default async function EditarProposta({ params }: { params: Promise<{ id: string }> }) {
  const u = await exigirUsuario();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [p, cfg] = await Promise.all([lerProposta(id), lerConfig()]);
  if (!p) notFound();
  return (
    <>
      <div className="topo">
        <div>
          <h1>{p.cliente || "Orçamento sem cliente"}</h1>
          <p>
            Nº {p.numero} · {p.evento || "sem evento"} · versão {p.versao} · atualizado em {dataHoraBR(p.atualizado_em)}
            {p.editor ? ` por ${p.editor}` : ""}
          </p>
        </div>
        <Link href="/" className="btn">← Voltar à lista</Link>
      </div>
      <Editor
        key={p.versao}
        id={p.id}
        numero={p.numero}
        versao={p.versao}
        status={p.status}
        inicial={p.dados}
        catalogo={cfg.catalogo}
        admin={u.papel === "admin"}
      />
    </>
  );
}
