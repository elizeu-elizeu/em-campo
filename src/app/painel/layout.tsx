import Link from "next/link";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/session";

const LINKS = [
  { href: "/painel", rotulo: "Relatórios" },
  { href: "/painel/modelos", rotulo: "Modelos" },
  { href: "/painel/clientes", rotulo: "Clientes" },
  { href: "/painel/usuarios", rotulo: "Usuários" },
];

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser("GESTOR");

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-bold">EmCampo</span>
            <nav className="flex gap-4 text-sm">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-slate-300 hover:text-white">
                  {l.rotulo}
                </Link>
              ))}
            </nav>
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
