// Marca EmCampo — "A linha que vira colina" (escolha final do usuário):
// duas linhas de formulário mantêm o ritmo do laudo e a terceira se ergue em
// colina sob o sol laranja. Formas sólidas em currentColor (navy em fundo
// claro, branco em fundo navy); o sol é sempre laranja. Sem hooks de client.

import { useId } from "react";

function LinhaQueViraColina() {
  return (
    <>
      <rect x="12" y="16" width="36" height="12" rx="6" fill="currentColor" />
      <rect x="12" y="36" width="26" height="12" rx="6" fill="currentColor" />
      <path
        fill="currentColor"
        d="M18 84 Q12 84 12 78 L12 62 Q12 56 18 56 L34 56 C46 56 52 44 64 44 C74 44 84 50 84 64 L84 78 Q84 84 78 84 Z"
      />
      <circle cx="70" cy="23" r="13" fill="#F97316" />
    </>
  );
}

export function LogoSimbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden>
      <LinhaQueViraColina />
    </svg>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoSimbolo className="h-[1.5em] w-[1.5em] flex-none" />
      <span className="font-titulo font-extrabold tracking-tight">EmCampo</span>
    </span>
  );
}

/** Selo circular — para PDF, materiais e carimbo "gerado por EmCampo". */
export function LogoSelo({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 170 170" className={className} aria-hidden>
      <defs>
        <path id={`${id}-arco`} d="M85 20a65 65 0 1 1-0.01 0" />
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
        <textPath href={`#${id}-arco`} startOffset="2%">
          EMCAMPO • RELATÓRIOS DE CAMPO •
        </textPath>
      </text>
      <g transform="translate(52.6 52.6) scale(0.675)">
        <LinhaQueViraColina />
      </g>
    </svg>
  );
}
