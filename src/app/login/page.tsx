import { LogoSimbolo } from "@/components/Logo";
import { login } from "@/lib/actions";

// Cena de fundo: campo em navy monocromático com linhas gravadas radiantes
// (referência editorial traduzida para a identidade Uniforme).
function FundoCampo() {
  const raiosPrata = [
    [1080, 180, 0, 0],
    [1080, 180, 0, 140],
    [1080, 180, 0, 320],
    [1080, 180, 160, 0],
    [1080, 180, 400, 0],
    [1080, 180, 640, 0],
    [1080, 180, 880, 0],
    [1080, 180, 1440, 40],
    [1080, 180, 1440, 340],
    [1080, 180, 1320, 900],
    [1080, 180, 1440, 620],
    [1080, 180, 40, 560],
  ];
  const raiosLaranja = [
    [1080, 180, 240, 0],
    [1080, 180, 0, 230],
    [1080, 180, 1440, 180],
    [1080, 180, 1160, 900],
  ];
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c3a63] via-[#132a4a] to-[#0a1a2e]" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g strokeWidth="1" fill="none">
          {raiosPrata.map(([x1, y1, x2, y2]) => (
            <line key={`p${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ffffff" strokeOpacity="0.07" />
          ))}
          {raiosLaranja.map(([x1, y1, x2, y2]) => (
            <line key={`l${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeOpacity="0.2" />
          ))}
          <circle cx="1080" cy="180" r="44" stroke="#ffffff" strokeOpacity="0.14" />
          <circle cx="1080" cy="180" r="12" fill="#f97316" fillOpacity="0.35" stroke="none" />
        </g>
        <path
          d="M0,520 C240,468 480,562 720,532 C960,502 1200,572 1440,538 L1440,900 L0,900 Z"
          fill="#16304f"
        />
        <path
          d="M0,618 C220,588 500,662 800,632 C1080,604 1300,662 1440,640 L1440,900 L0,900 Z"
          fill="#122844"
        />
        <path
          d="M0,724 C300,692 620,762 920,732 C1180,706 1340,748 1440,738 L1440,900 L0,900 Z"
          fill="#0e2138"
        />
        <path
          d="M0,812 C360,780 720,844 1080,806 C1260,788 1380,812 1440,818 L1440,900 L0,900 Z"
          fill="#0a1a2e"
        />
      </svg>
    </div>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-marinho">
      <FundoCampo />
      <div aria-hidden className="fita-hivis relative z-10" style={{ height: 3 }} />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 p-1">
            <LogoSimbolo className="h-full w-full text-white" />
          </div>
          <span className="font-titulo text-lg font-extrabold tracking-tight text-white">EmCampo</span>
        </div>
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300 sm:block">
          Plataforma de relatórios de campo
        </span>
      </header>

      <div className="relative z-10 mt-auto flex flex-col gap-10 p-6 pb-10 lg:flex-row lg:items-end lg:justify-between lg:p-10">
        <h1 className="font-titulo text-5xl font-medium leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-7xl">
          O relatório
          <br />
          sai do campo
          <br />
          <span className="text-laranja">pronto.</span>
        </h1>

        <form
          action={login}
          className="w-full max-w-sm space-y-4 rounded-2xl bg-[#f4f5f2] p-6 shadow-2xl shadow-black/40 sm:p-7 lg:w-[380px] lg:flex-none"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-texto-sec">
            Acesso da equipe
          </p>

          {erro === "1" && (
            <p className="rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
              E-mail ou senha inválidos. Confira os dados e tente de novo.
            </p>
          )}
          {erro === "bloqueado" && (
            <p className="rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
              Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente.
            </p>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-marinho">E-mail</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="campo-input w-full p-3 text-base"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-marinho">Senha</span>
            <input
              type="password"
              name="senha"
              required
              autoComplete="current-password"
              className="campo-input w-full p-3 text-base"
            />
          </label>

          <button type="submit" className="btn-primario w-full rounded-full p-3.5 text-base">
            Entrar
          </button>

          <p className="text-center text-xs text-texto-sec">
            Sem acesso? Peça ao gestor da sua empresa para cadastrar você.
          </p>
        </form>
      </div>
    </main>
  );
}
