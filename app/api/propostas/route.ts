import { usuarioApi } from "@/lib/auth";
import { criarProposta } from "@/lib/repo";
import { corpo, erro, naoAutorizado, ok } from "@/lib/http";
import { validarDados } from "@/lib/validar";

export async function POST(req: Request) {
  const u = await usuarioApi();
  if (!u) return naoAutorizado();
  const { dados, nota } = await corpo(req);
  const v = validarDados(dados);
  if (typeof v === "string") return erro(v);
  const id = await criarProposta(v, u.id, undefined, String(nota || "Criada"));
  return ok({ id });
}
