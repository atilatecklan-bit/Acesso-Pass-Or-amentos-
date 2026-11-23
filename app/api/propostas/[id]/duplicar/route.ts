import { usuarioApi } from "@/lib/auth";
import { criarProposta, lerConfig, lerProposta } from "@/lib/repo";
import { erro, naoAutorizado, ok } from "@/lib/http";
import { hojeISO, somarDias } from "@/lib/format";

export async function POST(_req: Request, c: { params: Promise<{ id: string }> }) {
  const u = await usuarioApi();
  if (!u) return naoAutorizado();
  const p = await lerProposta(Number((await c.params).id));
  if (!p) return erro("Orçamento não encontrado.", 404);
  const cfg = await lerConfig();
  const d = structuredClone(p.dados);
  d.emissao = hojeISO();
  d.validade = somarDias(d.emissao, cfg.validadeDias || 15);
  const id = await criarProposta(d, u.id, p.id, `Duplicado do Nº ${p.numero}`);
  return ok({ id });
}
