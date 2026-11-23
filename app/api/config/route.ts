import { usuarioApi } from "@/lib/auth";
import { lerConfig, salvarConfig } from "@/lib/repo";
import { corpo, erro, naoAutorizado, ok } from "@/lib/http";
import { validarDados } from "@/lib/validar";
import type { Configuracoes } from "@/lib/types";

export async function GET() {
  if (!(await usuarioApi())) return naoAutorizado();
  return ok(await lerConfig());
}

export async function PUT(req: Request) {
  if (!(await usuarioApi(true))) return erro("Só administradores podem alterar as configurações.", 403);
  const c = await corpo<Configuracoes>(req);
  const atual = await lerConfig();
  const modelo = validarDados(c.modelo ?? atual.modelo);
  if (typeof modelo === "string") return erro(modelo);
  if (c.logo && (!/^data:image\/(png|jpeg|svg\+xml);base64,/.test(c.logo) || c.logo.length > 600_000)) return erro("Logo inválida.");
  const novo: Configuracoes = {
    empresa: { ...atual.empresa, ...(c.empresa ?? {}) },
    validadeDias: Math.max(1, Number(c.validadeDias) || atual.validadeDias),
    modelo,
    catalogo: Array.isArray(c.catalogo)
      ? c.catalogo.filter((i) => i && i.descricao).map((i) => ({
          descricao: String(i.descricao),
          unitario: Number(i.unitario) || 0,
          secao: String(i.secao || ""),
          colunaPeriodo: (["DIAS", "MESES", "HORAS", "UN"].includes(i.colunaPeriodo) ? i.colunaPeriodo : "DIAS") as any,
        }))
      : atual.catalogo,
    logo: c.logo || undefined,
  };
  await salvarConfig(novo);
  return ok();
}
