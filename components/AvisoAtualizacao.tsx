"use client";
import { useEffect, useState } from "react";
import { BUILD } from "@/lib/versao";

/** Confere de tempos em tempos se saiu versão nova e avisa na tela. */
export default function AvisoAtualizacao() {
  const [nova, setNova] = useState<{ versao: string; novidades: string[] } | null>(null);

  useEffect(() => {
    let parado = false;
    async function conferir() {
      try {
        const r = await fetch("/api/versao", { cache: "no-store" });
        const j = await r.json();
        if (!parado && j.build && j.build !== BUILD) setNova(j);
      } catch {}
    }
    conferir();
    const t = setInterval(conferir, 60_000);
    const vis = () => document.visibilityState === "visible" && conferir();
    document.addEventListener("visibilitychange", vis);
    return () => {
      parado = true;
      clearInterval(t);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  if (!nova) return null;
  return (
    <div className="aviso-atualizacao" role="status">
      <div>
        <strong>Nova versão {nova.versao} disponível</strong>
        {nova.novidades?.length > 0 && <span>{nova.novidades.slice(0, 2).join(" · ")}</span>}
      </div>
      <button className="btn primario pequeno" onClick={() => window.location.reload()}>Atualizar agora</button>
    </div>
  );
}
