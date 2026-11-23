import ConfigForm from "@/components/ConfigForm";
import { exigirUsuario } from "@/lib/auth";
import { lerConfig } from "@/lib/repo";

export const metadata = { title: "Configurações" };

export default async function Configuracoes() {
  const u = await exigirUsuario();
  const cfg = await lerConfig();
  return (
    <>
      <div className="topo">
        <div>
          <h1>Configurações</h1>
          <p>Dados da empresa, catálogo de preços e o modelo que todo orçamento novo usa.</p>
        </div>
      </div>
      <ConfigForm inicial={cfg} admin={u.papel === "admin"} />
    </>
  );
}
