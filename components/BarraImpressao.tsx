"use client";
import { useEffect, useRef, useState } from "react";
import { baixar, foneWhats, gerarPdf, nomePdf } from "@/lib/pdf-cliente";

interface Props {
  titulo: string;
  voltar?: string;
  versao?: number;
  numero: string;
  cliente: string;
  telefone?: string;
  /** id da proposta: habilita o envio por link (só para quem está logado) */
  id?: number;
}

export default function BarraImpressao(p: Props) {
  const arquivo = useRef<File | null>(null);
  const [estado, setEstado] = useState<"preparando" | "pronto" | "erro">("preparando");
  const [podeCompartilhar, setPodeCompartilhar] = useState(false);
  const [msg, setMsg] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    document.body.classList.add("imprimir");
    document.title = p.titulo;
    const el = document.querySelector<HTMLElement>(".doc");
    let ativo = true;
    // Prepara o PDF já ao abrir, para o botão de enviar responder na hora.
    (async () => {
      try {
        if (!el) throw new Error();
        const f = await gerarPdf(el, nomePdf(p.numero, p.cliente));
        if (!ativo) return;
        arquivo.current = f;
        setPodeCompartilhar(!!navigator.canShare?.({ files: [f] }));
        setEstado("pronto");
      } catch {
        if (ativo) setEstado("erro");
      }
    })();
    return () => {
      ativo = false;
      document.body.classList.remove("imprimir");
    };
  }, [p.titulo, p.numero, p.cliente]);

  async function compartilhar() {
    const f = arquivo.current;
    if (!f) return;
    try {
      await navigator.share({ files: [f], title: p.titulo, text: `Segue a proposta da Acesso Pass para ${p.cliente}.` });
    } catch (e: any) {
      if (e?.name !== "AbortError") baixar(f);
    }
  }

  async function obterLink() {
    if (link) return link;
    const r = await fetch(`/api/propostas/${p.id}/link`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || "Não foi possível criar o link.");
    setLink(j.url);
    return j.url as string;
  }

  async function whatsLink() {
    // abre a janela já no clique (o navegador bloqueia janelas abertas depois de esperar)
    const janela = window.open("", "_blank");
    try {
      const url = await obterLink();
      const texto = `Olá! Segue a proposta da Acesso Pass para ${p.cliente}: ${url}`;
      const fone = foneWhats(p.telefone);
      const destino = `https://wa.me/${fone}?text=${encodeURIComponent(texto)}`;
      if (janela) janela.location.href = destino;
      else window.location.href = destino;
    } catch (e: any) {
      janela?.close();
      setMsg(e.message);
    }
  }

  async function copiarLink() {
    try {
      const url = await obterLink();
      await navigator.clipboard.writeText(url);
      setMsg("Link copiado. Quem abrir vê a proposta e pode baixar o PDF.");
    } catch (e: any) {
      setMsg(e.message || "Não foi possível copiar.");
    }
  }

  const pronto = estado === "pronto";
  return (
    <div className="barra-impressao">
      {p.voltar && <a className="btn pequeno" href={p.voltar}>← Voltar</a>}
      {podeCompartilhar && (
        <button className="btn primario" onClick={compartilhar} disabled={!pronto}>
          {pronto ? "Enviar PDF (WhatsApp, e-mail…)" : "Preparando PDF…"}
        </button>
      )}
      <button className={`btn ${podeCompartilhar ? "" : "primario"}`} onClick={() => arquivo.current && baixar(arquivo.current)} disabled={!pronto}>
        {pronto ? "Baixar PDF" : estado === "erro" ? "PDF indisponível" : "Preparando PDF…"}
      </button>
      {p.id && <button className="btn" onClick={whatsLink}>Enviar link no WhatsApp</button>}
      {p.id && <button className="btn pequeno" onClick={copiarLink}>Copiar link</button>}
      <button className="btn pequeno" onClick={() => window.print()}>Imprimir</button>
      {(msg || p.versao) && <span className="dica">{msg || `Versão ${p.versao}`}</span>}
    </div>
  );
}
