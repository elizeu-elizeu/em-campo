import { login } from "@/lib/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-800">EmCampo</h1>
          <p className="text-sm text-slate-500">Entre com a sua conta</p>
        </div>

        {erro && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            E-mail ou senha inválidos.
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">E-mail</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-slate-300 p-3 text-base"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Senha</span>
          <input
            type="password"
            name="senha"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-300 p-3 text-base"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 p-3 text-base font-semibold text-white active:bg-blue-700"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
