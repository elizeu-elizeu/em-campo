"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/campo", rotulo: "Meus relatórios", icone: "📋" },
  { href: "/campo/novo", rotulo: "Novo relatório", icone: "➕" },
];

export default function NavCampo() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {ABAS.map((a) => {
        const ativo = a.href === "/campo" ? pathname === "/campo" || pathname.startsWith("/campo/rascunho") || pathname.startsWith("/campo/relatorio") : pathname.startsWith(a.href);
        return (
          <Link
            key={a.href}
            href={a.href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
              ativo ? "text-marinho font-bold" : "text-slate-500"
            }`}
          >
            <span aria-hidden className="text-lg leading-none">{a.icone}</span>
            {a.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
