import Link from "next/link";
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
      <h1 className="text-xl font-bold tracking-tight text-marinho">Clientes</h1>

      <form action={criarCliente} className="cartao grid gap-2 p-3 sm:grid-cols-[2fr_2fr_1fr_auto]">
        <input type="text" name="nome" required placeholder="Nome do cliente" className="campo-input p-2 text-sm" />
        <input type="text" name="endereco" placeholder="Endereço" className="campo-input p-2 text-sm" />
        <input type="text" name="contato" placeholder="Contato" className="campo-input p-2 text-sm" />
        <button className="btn-secundario rounded-md px-4 py-2 text-sm">Cadastrar</button>
      </form>

      <div className="cartao overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-texto-sec">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">Endereço</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Relatórios</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`/painel/clientes/${c.id}`} className="font-medium text-marinho-claro underline">
                    {c.nome}
                  </Link>
                </td>
                <td className="p-3">{c.endereco ?? "—"}</td>
                <td className="p-3">{c.contato ?? "—"}</td>
                <td className="p-3 tabular-nums">{c._count.relatorios}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
