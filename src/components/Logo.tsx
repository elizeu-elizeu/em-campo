// Marca EmCampo — combinação escolhida: símbolo "Ciclo" (setas de sync
// abraçando colina + sol) dentro do formato "Selo" (carimbo circular).
// Sem hooks: funciona em server e client components. O traço principal usa
// currentColor (text-white em header navy, text-marinho em fundo claro);
// o sol é sempre laranja.

export function LogoSimbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 90" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
        <path d="M72 38 A 27 27 0 0 0 24 30" />
        <path d="M18 52 A 27 27 0 0 0 66 60" />
      </g>
      <path d="M24 30 l-9 3 7 8z" fill="currentColor" />
      <path d="M66 60 l9 -3 -7 -8z" fill="currentColor" />
      <circle cx="54" cy="38" r="5.5" fill="#F97316" />
      <path d="M28 54 C35 45 44 45 50 51 C54 55 60 54 64 51 L64 58 L28 58 Z" fill="currentColor" />
    </svg>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoSimbolo className="h-[1.6em] w-[1.6em] flex-none" />
      <span className="font-titulo font-extrabold tracking-tight">EmCampo</span>
    </span>
  );
}

/** Selo circular completo — para PDF, materiais e favicon grande. */
export function LogoSelo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 170" className={className} aria-hidden>
      <defs>
        <path id="logo-selo-arco" d="M85 20a65 65 0 1 1-0.01 0" />
      </defs>
      <circle cx="85" cy="85" r="80" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="85" cy="85" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        fontSize="13"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="2.5"
        fontFamily="var(--font-archivo), sans-serif"
      >
        <textPath href="#logo-selo-arco" startOffset="2%">
          EMCAMPO • RELATÓRIOS DE CAMPO •
        </textPath>
      </text>
      <g transform="translate(40 40)">
        <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
          <path d="M72 38 A 27 27 0 0 0 24 30" />
          <path d="M18 52 A 27 27 0 0 0 66 60" />
        </g>
        <path d="M24 30 l-9 3 7 8z" fill="currentColor" />
        <path d="M66 60 l9 -3 -7 -8z" fill="currentColor" />
        <circle cx="54" cy="38" r="5.5" fill="#F97316" />
        <path d="M28 54 C35 45 44 45 50 51 C54 55 60 54 64 51 L64 58 L28 58 Z" fill="currentColor" />
      </g>
    </svg>
  );
}
