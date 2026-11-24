import type { Metadata, Viewport } from "next";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Acesso Pass · Orçamentos", template: "%s · Acesso Pass" },
  description: "Gestão de propostas comerciais da Acesso Pass",
  applicationName: "Orçamentos",
  appleWebApp: { capable: true, title: "Orçamentos", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#14141c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
