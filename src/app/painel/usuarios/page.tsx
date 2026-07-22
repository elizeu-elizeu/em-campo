import { alternarPapel, alternarUsuarioAtivo, criarUsuario, redefinirSenha } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function Usuarios({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const session = await requireUser("GESTOR");
  const { erro } = await searchParams;
  const usuarios = await prisma.user.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Usuários</h1>

      {erro && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {erro === "email" ? "Este e-mail já está cadastrado." : "Preencha nome, e-mail válido e senha com 6+ caracteres."}
        </p>
      )}

      <form action={criarUsuario} className="grid gap-2 rounded-xl bg-white p-3 shadow-sm sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
        <input type="text" name="nome" required placeholder="Nome" className="rounded-md border border-slate-300 p-2 text-sm" />
        <input type="email" name="email" required placeholder="E-mail" className="rounded-md border border-slate-300 p-2 text-sm" />
        <input type="password" name="senha" required minLength={6} placeholder="Senha" className="rounded-md border border-slate-300 p-2 text-sm" />
        <select name="papel" className="rounded-md border border-slate-300 p-2 text-sm">
          <option value="TECNICO">Técnico</option>
          <option value="GESTOR">Gestor</option>
        </select>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Cadastrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Papel</th>
              <th className="p-3">Situação</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3 font-medium text-slate-800">{u.nome}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.papel === "GESTOR" ? "Gestor" : "Técnico"}</td>
                <td className="p-3">{u.ativo ? "Ativo" : <span className="text-red-600">Inativo</span>}</td>
                <td className="p-3">
                  {u.id !== session.userId && (
                    <div className="flex flex-wrap items-center gap-3">
                      <form action={alternarUsuarioAtivo}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-slate-600 underline">{u.ativo ? "Desativar" : "Reativar"}</button>
                      </form>
                      <form action={alternarPapel}>
                        <input type="hidden" name="id" value={u.id} />
                        <button className="text-slate-600 underline">
                          {u.papel === "GESTOR" ? "Tornar técnico" : "Tornar gestor"}
                        </button>
                      </form>
                      <form action={redefinirSenha} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={u.id} />
                        <input
                          type="password"
                          name="senha"
                          required
                          minLength={6}
                          placeholder="Nova senha"
                          className="w-28 rounded-md border border-slate-300 p-1 text-xs"
                        />
                        <button className="text-slate-600 underline">Redefinir</button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
