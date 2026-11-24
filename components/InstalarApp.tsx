"use client";
import { useEffect, useState } from "react";

/** Registra o app e mostra o convite para instalar na tela inicial do celular. */
export default function InstalarApp() {
  const [evento, setEvento] = useState<any>(null);
  const [ios, setIos] = useState(false);
  const [fechado, setFechado] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    const instalado = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    let dispensou = false;
    try { dispensou = localStorage.getItem("ap_instalar_fechado") === "1"; } catch {}
    if (instalado || dispensou) return;
    const ehIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ehIos) { setIos(true); setFechado(false); }
    const h = (e: Event) => { e.preventDefault(); setEvento(e); setFechado(false); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (fechado || (!evento && !ios)) return null;
  const fechar = () => { setFechado(true); try { localStorage.setItem("ap_instalar_fechado", "1"); } catch {} };

  return (
    <div className="convite-app">
      <img src="/app-192.png" alt="" />
      <div>
        <strong>Instale o app de Orçamentos</strong>
        <span>{ios ? "No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”." : "Fica na tela inicial com o ícone da Acesso Pass, abre direto e rápido."}</span>
      </div>
      {evento && (
        <button className="btn primario pequeno" onClick={async () => { evento.prompt(); await evento.userChoice; fechar(); }}>Instalar</button>
      )}
      <button className="x" onClick={fechar} aria-label="Fechar">×</button>
    </div>
  );
}
