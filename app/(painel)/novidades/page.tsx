import { NOVIDADES, BUILD } from "@/lib/versao";
import { dataBR } from "@/lib/format";

export const metadata = { title: "Novidades" };

export default function Novidades() {
  return (
    <>
      <div className="topo">
        <div>
          <h1>Novidades do sistema</h1>
          <p>Você está na versão {NOVIDADES[0].versao} (build {BUILD}).</p>
        </div>
      </div>
      {NOVIDADES.map((n, i) => (
        <div className="cartao" key={n.versao}>
          <h2>
            Versão {n.versao} <small>{dataBR(n.data)}</small>
            {i === 0 && <span className="selo aprovada" style={{ marginLeft: 8 }}>atual</span>}
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18 }}>{n.itens.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      ))}
    </>
  );
}
