import { usuarioApi } from "@/lib/auth";
import { excluirProposta, lerProposta, mudarStatus, salvarProposta } from "@/lib/repo";
import { corpo, erro, naoAutorizado, ok } from "@/lib/http";
import { validarDados } from "@/lib/validar";
import { STATUS, type Status } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };
const idDe = async (c: Ctx) => Number((await c.params).id);

export async function PUT(req: Request, c: Ctx) {
  const u = await usuarioApi();
  if (!u) return naoAutorizado();
  const { dados, nota } = await corpo(req);
  const v = validarDados(dados);
  if (typeof v === "string") return erro(v);
  const versao = await salvarProposta(await idDe(c), v, u.id, String(nota || ""));
  if (!versao) return erro("Orçamento não encontrado.", 404);
  return ok({ versao });
}

export async function PATCH(req: Request, c: Ctx) {
  const u = await usuarioApi();
  if (!u) return naoAutorizado();
  const { status } = await corpo(req);
  if (!STATUS.some((s) => s.valor === status)) return erro("Status inválido.");
  await mudarStatus(await idDe(c), status as Status, u.id);
  return ok();
}

export async function DELETE(_req: Request, c: Ctx) {
  const u = await usuarioApi(true);
  if (!u) return erro("Só administradores podem excluir.", 403);
  const id = await idDe(c);
  if (!(await lerProposta(id))) return erro("Orçamento não encontrado.", 404);
  await excluirProposta(id);
  return ok();
}
