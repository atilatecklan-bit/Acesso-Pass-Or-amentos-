export const metadata = { title: "Termos de uso" };

export default function Termos() {
  return (
    <main className="pagina-texto">
      <img src="/logo.png" alt="Acesso Pass" />
      <h1>Termos de uso — Acesso Pass Orçamentos</h1>
      <p>
        O sistema Acesso Pass Orçamentos é uma ferramenta interna. O acesso é liberado pelo administrador e pode ser
        retirado a qualquer momento.
      </p>
      <p>
        Quem usa o sistema se compromete a manter em sigilo as informações de clientes, valores e condições comerciais, e a
        não compartilhar seu acesso com outras pessoas.
      </p>
      <p>
        Os links de proposta enviados a clientes mostram apenas aquela proposta e podem ser desativados cancelando o
        orçamento.
      </p>
      <p className="mudo">Atualizados em 24/11/2026.</p>
    </main>
  );
}
