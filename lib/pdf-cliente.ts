"use client";

/** Gera o PDF da proposta a partir do elemento .doc já desenhado na tela. */
export async function gerarPdf(el: HTMLElement, nomeArquivo: string): Promise<File> {
  const html2pdf = (await import("html2pdf.js")).default as any;
  const wrap = el.parentElement;
  wrap?.classList.add("capturando"); // tira a redução de tamanho usada no celular
  try {
    await document.fonts?.ready;
    const blob: Blob = await html2pdf()
      .set({
        margin: [8, 0, 10, 0],
        filename: nomeArquivo,
        image: { type: "jpeg", quality: 0.92 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: 900 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css"], before: ".quebra", avoid: ["tr", "li", ".bloco", ".invest", ".assinatura", ".total"] },
      })
      .from(el)
      .outputPdf("blob");
    return new File([blob], nomeArquivo, { type: "application/pdf" });
  } finally {
    wrap?.classList.remove("capturando");
  }
}

export function baixar(f: File) {
  const url = URL.createObjectURL(f);
  const a = document.createElement("a");
  a.href = url;
  a.download = f.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export const nomePdf = (numero: string, cliente: string) =>
  `Proposta ${numero} - ${cliente || "Acesso Pass"}`.replace(/[\\/:*?"<>|]/g, "").trim() + ".pdf";

/** Telefone brasileiro para o link do WhatsApp (55 + DDD + número). */
export function foneWhats(t?: string) {
  const d = (t || "").replace(/\D/g, "");
  if (!d) return "";
  return d.length <= 11 ? "55" + d : d;
}
