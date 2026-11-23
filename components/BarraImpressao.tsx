"use client";
import { useEffect } from "react";

export default function BarraImpressao({ titulo, voltar, versao }: { titulo: string; voltar: string; versao?: number }) {
  useEffect(() => {
    document.body.classList.add("imprimir");
    document.title = titulo; // vira o nome do arquivo PDF
    return () => document.body.classList.remove("imprimir");
  }, [titulo]);
  return (
    <div className="barra-impressao">
      <a className="btn pequeno" href={voltar}>← Voltar</a>
      <button className="btn primario" onClick={() => window.print()}>Salvar PDF / Imprimir</button>
      <span className="dica">
        {versao ? `Versão ${versao}. ` : ""}Na janela que abrir, escolha “Salvar como PDF”. No celular: Compartilhar → Imprimir → Salvar PDF.
      </span>
    </div>
  );
}
