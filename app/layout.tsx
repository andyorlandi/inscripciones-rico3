import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inscripción DG3 Cátedra Rico",
  description: "Sistema de inscripción a comisiones para Diseño Gráfico 3, Cátedra Rico, FADU UBA",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
