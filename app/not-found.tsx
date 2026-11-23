import Link from "next/link";
export default function NaoEncontrado() {
  return (
    <main className="entrada">
      <div className="caixa" style={{ textAlign: "center" }}>
        <img src="/logo.png" alt="Acesso Pass" />
        <p className="tit">Página ou orçamento não encontrado.</p>
        <Link className="btn primario" href="/">Ir para os orçamentos</Link>
      </div>
    </main>
  );
}
