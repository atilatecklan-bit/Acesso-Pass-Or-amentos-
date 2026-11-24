import Lateral from "@/components/Lateral";
import AvisoAtualizacao from "@/components/AvisoAtualizacao";
import InstalarApp from "@/components/InstalarApp";
import { exigirUsuario } from "@/lib/auth";
import { q1 } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  const pend = u.papel === "admin" ? (await q1<{ n: number }>(`SELECT COUNT(*)::int AS n FROM usuarios WHERE pendente`))?.n ?? 0 : 0;
  return (
    <div className="shell">
      <Lateral usuario={u} pendentes={pend} />
      <main className="conteudo">
        <InstalarApp />
        {children}
      </main>
      <AvisoAtualizacao />
    </div>
  );
}
