import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lari — Assistente Imobiliária",
  description: "Sua assistente de IA para anúncios, leads e clientes do mercado imobiliário.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  );
}
