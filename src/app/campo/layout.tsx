import Link from "next/link";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";
import AutoSync from "./AutoSync";

export default async function CampoLayout({ children }: { children: React.ReactNode }) {
  await requireUser("TECNICO");

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-blue-700 px-4 py-3 text-white">
        <Link href="/campo" className="text-base font-bold">
          EmCampo
        </Link>
        <div className="flex items-center gap-3">
          <AutoSync />
          <form action={logout}>
            <button className="text-sm underline">Sair</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-lg p-4 pb-24">{children}</main>
    </div>
  );
}
