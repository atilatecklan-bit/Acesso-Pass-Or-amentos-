"use client";
import { useState } from "react";

export default function AcoesLinha({ id }: { id: number }) {
  const [ocupado, setOcupado] = useState(false);
  async function duplicar() {
    setOcupado(true);
    const r = await fetch(`/api/propostas/${id}/duplicar`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setOcupado(false);
    if (r.ok) window.location.href = `/propostas/${j.id}`;
    else alert(j.erro || "Não foi possível duplicar.");
  }
  return (
    <div className="acoes" style={{ justifyContent: "flex-end", flexWrap: "nowrap" }}>
      <a className="btn pequeno" href={`/imprimir/${id}`} target="_blank">PDF</a>
      <button className="btn pequeno" onClick={duplicar} disabled={ocupado}>Duplicar</button>
    </div>
  );
}
