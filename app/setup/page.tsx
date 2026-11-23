import { redirect } from "next/navigation";
import FormEntrada from "@/components/FormEntrada";
import { existeUsuario } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Primeiro acesso" };

export default async function Setup() {
  if (await existeUsuario()) redirect("/login");
  return (
    <main className="entrada">
      <div className="caixa">
        <img src="/logo.png" alt="Acesso Pass" />
        <p className="tit">Primeiro acesso: crie o usuário administrador</p>
        <FormEntrada modo="setup" />
      </div>
    </main>
  );
}
