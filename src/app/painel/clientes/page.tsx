import { criarCliente } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function Clientes() {
  await requireUser("GESTOR");
  const clientes = await prisma.cliente.findMany({
    include: { _count: { select: { relatorios: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Clientes</h1>

      <form action={criarCliente} className="grid gap-2 rounded-xl bg-white p-3 shadow-sm sm:grid-cols-[2fr_2fr_1fr_auto]">
        <input type="text" name="nome" required placeholder="Nome do cliente" className="rounded-md border border-slate-300 p-2 text-sm" />
        <input type="text" name="endereco" placeholder="Endereço" className="rounded-md border border-slate-300 p-2 text-sm" />
        <input type="text" name="contato" placeholder="Contato" className="rounded-md border border-slate-300 p-2 text-sm" />
        <button className="rounded-md bg-marinho px-4 py-2 text-sm font-semibold text-white">Cadastrar</button>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Endereço</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Relatórios</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3 font-medium text-slate-800">{c.nome}</td>
                <td className="p-3">{c.endereco ?? "—"}</td>
                <td className="p-3">{c.contato ?? "—"}</td>
                <td className="p-3">{c._count.relatorios}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
