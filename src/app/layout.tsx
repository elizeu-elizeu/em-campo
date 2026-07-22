import type { Metadata } from "next";
import { Archivo, Caveat, Manrope } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// Manuscrita — só para anotações humanas (login, recompensas)
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EmCampo",
  description: "Relatórios de serviço em campo, offline, para prestadoras de serviço",
  appleWebApp: { capable: true, title: "EmCampo", statusBarStyle: "default" },
};

export const viewport = {
  themeColor: "#132a4a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${manrope.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
