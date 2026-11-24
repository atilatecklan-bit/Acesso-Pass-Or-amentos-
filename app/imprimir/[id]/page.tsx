import { notFound } from "next/navigation";
import Documento from "@/components/Documento";
import BarraImpressao from "@/components/BarraImpressao";
import { exigirUsuario } from "@/lib/auth";
import { lerConfig, lerProposta, lerVersao } from "@/lib/repo";
import "../doc.css";

export const dynamic = "force-dynamic";

export default async function Imprimir({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  await exigirUsuario();
  const id = Number((await params).id);
  const v = Number((await searchParams).v) || undefined;
  const p = Number.isInteger(id) ? await lerProposta(id) : undefined;
  if (!p) notFound();
  const dados = v ? await lerVersao(id, v) : p.dados;
  if (!dados) notFound();
  const cfg = await lerConfig();
  const titulo = `Proposta ${p.numero} - ${dados.cliente.nome || "sem cliente"}`;
  return (
    <>
      <BarraImpressao
        titulo={titulo}
        voltar={`/propostas/${id}`}
        versao={v}
        numero={p.numero}
        cliente={dados.cliente.nome}
        telefone={dados.cliente.telefone}
        id={v ? undefined : id}
      />
      <div className="doc-wrap"><Documento d={dados} numero={p.numero} cfg={cfg} /></div>
    </>
  );
}
