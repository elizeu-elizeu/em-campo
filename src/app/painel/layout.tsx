import BotaoSair from "@/components/BotaoSair";
import NavPainel from "@/components/NavPainel";
import { requireUser } from "@/lib/session";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("GESTOR");

  return (
    <div className="min-h-dvh bg-base">
      <header className="header-app text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold">EmCampo</span>
            <NavPainel />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
              {session.nome}
            </span>
            <BotaoSair />
          </div>
        </div>
      </header>
      <div className="fita-hivis" />
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
