"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function IconeLista({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 2.5h6V6H9z" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function IconeNovo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconeConta({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

const ABAS = [
  { href: "/campo", rotulo: "Meus relatórios", Icone: IconeLista },
  { href: "/campo/novo", rotulo: "Novo relatório", Icone: IconeNovo },
  { href: "/conta", rotulo: "Conta", Icone: IconeConta },
];

export default function NavCampo() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(19_42_74/0.08)]">
      {ABAS.map(({ href, rotulo, Icone }) => {
        const ativo =
          href === "/campo"
            ? pathname === "/campo" || pathname.startsWith("/campo/rascunho") || pathname.startsWith("/campo/relatorio")
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors ${
              ativo ? "font-bold text-marinho" : "font-medium text-texto-sec"
            }`}
          >
            {ativo && <span aria-hidden className="absolute inset-x-8 top-0 h-0.5 rounded-b bg-laranja" />}
            <Icone className="h-5 w-5" />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
