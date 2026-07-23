"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/painel", rotulo: "Relatórios" },
  { href: "/painel/agenda", rotulo: "Agenda" },
  { href: "/painel/modelos", rotulo: "Modelos" },
  { href: "/painel/clientes", rotulo: "Clientes" },
  { href: "/painel/usuarios", rotulo: "Usuários" },
  { href: "/painel/empresa", rotulo: "Empresa" },
  { href: "/painel/parametrizacoes", rotulo: "Parametrizações" },
];

export default function NavPainel() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-1 text-sm">
      {LINKS.map((l) => {
        const ativo =
          l.href === "/painel"
            ? pathname === "/painel" || pathname.startsWith("/painel/relatorio")
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              ativo
                ? "bg-white/15 font-semibold text-white shadow-[inset_0_-2px_0_var(--color-laranja)]"
                : "text-slate-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            {l.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
