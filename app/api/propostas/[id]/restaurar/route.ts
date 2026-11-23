import { usuarioApi } from "@/lib/auth";
import { lerVersao, salvarProposta } from "@/lib/repo";
import { corpo, erro, naoAutorizado, ok } from "@/lib/http";

export async function POST(req: Request, c: { params: Promise<{ id: string }> }) {
  const u = await usuarioApi();
  if (!u) return naoAutorizado();
  const id = Number((await c.params).id);
  const { versao } = await corpo(req);
  const d = await lerVersao(id, Number(versao));
  if (!d) return erro("Versão não encontrada.", 404);
  const nova = await salvarProposta(id, d, u.id, `Restaurada a versão ${versao}`);
  return ok({ versao: nova });
}
