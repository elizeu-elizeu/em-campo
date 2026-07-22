import Link from "next/link";
import { LogoSimbolo } from "@/components/Logo";
import { trocarMinhaSenha } from "@/lib/actions";
import { requireUser } from "@/lib/session";

export default async function Conta({ searchParams }: { searchParams: Promise<{ erro?: string; ok?: string }> }) {
  const user = await requireUser();
  const { erro, ok } = await searchParams;
  const voltar = user.papel === "GESTOR" ? "/painel" : "/campo";

  return (
    <div className="min-h-dvh bg-base">
      <header className="header-app flex items-center justify-between px-4 py-3 text-white">
        <Link href={voltar} className="flex items-center gap-2">
          <LogoSimbolo className="h-7 w-7 text-white" />
          <span className="font-titulo font-extrabold tracking-tight">Minha conta</span>
        </Link>
        <Link href={voltar} className="text-sm underline">
          Voltar
        </Link>
      </header>
      <div className="fita-hivis" />

      <main className="mx-auto max-w-lg space-y-4 p-4">
        <section className="cartao p-5">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">Seus dados</h2>
          <p className="font-medium text-marinho">{user.nome}</p>
          <p className="text-sm text-texto-sec">{user.papel === "GESTOR" ? "Gestor" : "Técnico"}</p>
        </section>

        <section className="cartao p-5">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">
            Trocar minha senha
          </h2>

          {ok && (
            <p className="mb-3 rounded-md bg-ok-bg p-3 text-sm font-medium text-ok">Senha alterada.</p>
          )}
          {erro === "atual" && (
            <p className="mb-3 rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
              A senha atual não confere.
            </p>
          )}
          {erro === "curta" && (
            <p className="mb-3 rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
              A nova senha precisa de pelo menos 8 caracteres.
            </p>
          )}

          <form action={trocarMinhaSenha} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-marinho">Senha atual</span>
              <input
                type="password"
                name="atual"
                required
                autoComplete="current-password"
                className="campo-input w-full p-3 text-base"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-marinho">Nova senha (8+ caracteres)</span>
              <input
                type="password"
                name="nova"
                required
                minLength={8}
                autoComplete="new-password"
                className="campo-input w-full p-3 text-base"
              />
            </label>
            <button className="btn-secundario w-full rounded-lg p-3">Salvar nova senha</button>
          </form>
        </section>
      </main>
    </div>
  );
}
