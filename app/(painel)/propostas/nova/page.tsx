import Editor from "@/components/Editor";
import { exigirUsuario } from "@/lib/auth";
import { lerConfig } from "@/lib/repo";
import { novaProposta } from "@/lib/defaults";

export const metadata = { title: "Novo orçamento" };

export default async function Nova() {
  const u = await exigirUsuario();
  const cfg = await lerConfig();
  return (
    <>
      <div className="topo">
        <div>
          <h1>Novo orçamento</h1>
          <p>Começa com o modelo padrão das Configurações. Ajuste o que precisar e salve.</p>
        </div>
      </div>
      <Editor inicial={novaProposta(cfg)} catalogo={cfg.catalogo} admin={u.papel === "admin"} />
    </>
  );
}
