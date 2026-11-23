import { encerrarSessao } from "@/lib/auth";
import { ok } from "@/lib/http";

export async function POST() {
  await encerrarSessao();
  return ok();
}
