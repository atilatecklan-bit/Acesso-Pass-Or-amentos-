import { NextResponse } from "next/server";
import { BUILD, NOVIDADES, VERSAO } from "@/lib/versao";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { versao: VERSAO, build: BUILD, novidades: NOVIDADES[0].itens },
    { headers: { "Cache-Control": "no-store" } },
  );
}
