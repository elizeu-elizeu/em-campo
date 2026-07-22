import Link from "next/link";
import { alternarModeloAtivo, criarModelo } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function Modelos() {
  await requireUser("GESTOR");
  const modelos = await prisma.modelo.findMany({
    include: { _count: { select: { campos: true, relatorios: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Modelos de relatório</h1>

      <form action={criarModelo} className="flex gap-2 rounded-xl bg-white p-3 shadow-sm">
        <input
          type="text"
          name="nome"
          required
          placeholder="Nome do novo modelo (ex.: Instalação de ar-condicionado)"
          className="flex-1 rounded-md border border-slate-300 p-2 text-sm"
        />
        <button className="rounded-md bg-marinho px-4 py-2 text-sm font-semibold text-white">
          Criar modelo
        </button>
      </form>

      <ul className="space-y-2">
        {modelos.length === 0 && (
          <li className="rounded-xl bg-white p-6 text-center text-slate-400 shadow-sm">
            Nenhum modelo ainda — crie o primeiro acima.
          </li>
        )}
        {modelos.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <Link href={`/painel/modelos/${m.id}`} className="font-medium text-marinho-claro underline">
                {m.nome}
              </Link>
              <p className="text-sm text-slate-500">
                {m._count.campos} campo(s) · {m._count.relatorios} relatório(s)
                {!m.ativo && <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs">inativo</span>}
              </p>
            </div>
            <form action={alternarModeloAtivo}>
              <input type="hidden" name="id" value={m.id} />
              <button className="text-sm text-slate-600 underline">
                {m.ativo ? "Desativar" : "Ativar"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
