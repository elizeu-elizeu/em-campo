import type { Metadata } from "next";
import { Karla, Nunito_Sans } from "next/font/google";
import "./globals.css";

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
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
      className={`${karla.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
