"use client";
export default function Restaurar({ id, versao }: { id: number; versao: number }) {
  async function ir() {
    if (!confirm(`Restaurar a versão ${versao}? Ela vira a versão atual (as outras continuam no histórico).`)) return;
    const r = await fetch(`/api/propostas/${id}/restaurar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versao }),
    });
    if (r.ok) window.location.href = `/propostas/${id}`;
    else alert("Não foi possível restaurar.");
  }
  return <button className="btn pequeno" onClick={ir}>Restaurar</button>;
}
