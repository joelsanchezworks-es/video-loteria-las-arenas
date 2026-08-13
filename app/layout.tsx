import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Generative AI — Vídeo + Voz IA",
  description:
    "Alternativa gratuita y open-source a Higgsfield AI para generar vídeo y voz con IA desde una sola interfaz. Modelo BYOK: trae tu propia API Key de MuAPI.",
  applicationName: "Open Generative AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
