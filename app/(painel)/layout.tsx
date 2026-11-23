import Lateral from "@/components/Lateral";
import { exigirUsuario } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const u = await exigirUsuario();
  return (
    <div className="shell">
      <Lateral usuario={u} />
      <main className="conteudo">{children}</main>
    </div>
  );
}
