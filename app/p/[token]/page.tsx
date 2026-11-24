import { notFound } from "next/navigation";
import Documento from "@/components/Documento";
import BarraImpressao from "@/components/BarraImpressao";
import { q1, json } from "@/lib/db";
import { lerConfig } from "@/lib/repo";
import type { DadosProposta } from "@/lib/types";
import "../../imprimir/doc.css";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/** Página pública da proposta, aberta pelo link enviado ao cliente (sem login). */
export default async function PropostaPublica({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) notFound();
  const r = await q1<{ numero: string; dados: unknown; status: string }>(
    `SELECT numero, dados, status FROM propostas WHERE token_publico = $1`,
    [token],
  );
  if (!r || r.status === "cancelada") notFound();
  const d = json<DadosProposta>(r.dados);
  const cfg = await lerConfig();
  return (
    <>
      <BarraImpressao titulo={`Proposta ${r.numero} - ${d.cliente.nome}`} numero={r.numero} cliente={d.cliente.nome} />
      <div className="doc-wrap"><Documento d={d} numero={r.numero} cfg={cfg} /></div>
    </>
  );
}
