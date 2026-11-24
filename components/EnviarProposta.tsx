import Link from "next/link";

/** Botão que leva para a tela do PDF, onde dá para enviar pelo celular. */
export default function EnviarProposta({ id, compacto }: { id: number; cliente?: string; telefone?: string; compacto?: boolean }) {
  return (
    <Link className={`btn ${compacto ? "primario" : ""}`} href={`/imprimir/${id}`}>
      {compacto ? "Enviar / PDF" : "Enviar ou baixar PDF"}
    </Link>
  );
}
