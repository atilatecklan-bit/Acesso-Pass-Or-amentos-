import { redirect } from "next/navigation";
import FormEntrada from "@/components/FormEntrada";
import { existeUsuario, usuarioAtual } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function Login() {
  if (!(await existeUsuario())) redirect("/setup");
  if (await usuarioAtual()) redirect("/");
  return (
    <main className="entrada">
      <div className="caixa">
        <img src="/logo.png" alt="Acesso Pass" />
        <p className="tit">Gestão de orçamentos</p>
        <FormEntrada modo="login" />
      </div>
    </main>
  );
}
