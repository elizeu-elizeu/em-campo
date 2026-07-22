import Link from "next/link";
import BotaoSair from "@/components/BotaoSair";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import AutoSync from "./AutoSync";
import NavCampo from "./NavCampo";

export default async function CampoLayout({ children }: { children: React.ReactNode }) {
  await requireUser("TECNICO");
  const [config, empresa] = await Promise.all([
    prisma.config.findUnique({ where: { id: 1 } }),
    prisma.empresa.findUnique({ where: { id: 1 } }),
  ]);
  // Parametrização: app do técnico com a marca da prestadora
  const titulo = (config?.usarNomeEmpresa ?? true) && empresa?.nome ? empresa.nome : "EmCampo";

  return (
    <div className="min-h-dvh bg-base">
      <header className="header-app sticky top-0 z-10 flex items-center justify-between px-4 py-3 text-white">
        <Link href="/campo" className="truncate pr-2 text-base font-bold">
          {titulo}
        </Link>
        <div className="flex items-center gap-3">
          <AutoSync />
          <BotaoSair />
        </div>
      </header>
      <div className="fita-hivis" />
      <main className="mx-auto max-w-lg p-4 pb-28">{children}</main>
      <NavCampo />
    </div>
  );
}
