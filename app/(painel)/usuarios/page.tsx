import UsuariosAdmin from "@/components/UsuariosAdmin";
import { exigirUsuario } from "@/lib/auth";
import { q } from "@/lib/db";
import type { Usuario } from "@/lib/types";

export const metadata = { title: "Usuários" };

export default async function Usuarios() {
  const eu = await exigirUsuario(true);
  const lista = await q<Usuario>(`SELECT id, nome, email, papel, ativo FROM usuarios ORDER BY ativo DESC, nome`);
  return (
    <>
      <div className="topo">
        <div>
          <h1>Usuários</h1>
          <p>Quem pode entrar no sistema de orçamentos.</p>
        </div>
      </div>
      <UsuariosAdmin lista={lista} eu={eu.id} />
    </>
  );
}
