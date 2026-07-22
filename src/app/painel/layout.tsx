import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";
import NavPainel from "@/components/NavPainel";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("GESTOR");

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold">EmCampo</span>
            <NavPainel />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-400">{session.nome}</span>
            <form action={logout}>
              <button className="underline">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">{children}</main>
    </div>
  );
}
