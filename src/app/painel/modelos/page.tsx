import Link from "next/link";
import { alternarModeloAtivo, criarModelo, criarModeloPronto } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { MODELOS_PRONTOS } from "@/lib/modelos-prontos";
import { requireUser } from "@/lib/session";

export default async function Modelos() {
  await requireUser("GESTOR");
  const modelos = await prisma.modelo.findMany({
    include: { _count: { select: { campos: true, relatorios: true } } },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-marinho">Modelos de relatório</h1>

      <section className="cartao p-4">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">
          Comece com um modelo pronto
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          Formulários completos por segmento — use e ajuste como quiser.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {MODELOS_PRONTOS.map((p) => (
            <form key={p.slug} action={criarModeloPronto} className="flex">
              <input type="hidden" name="slug" value={p.slug} />
              <button className="flex w-full flex-col rounded-lg border border-slate-200 p-3 text-left transition-colors hover:border-marinho">
                <span className="text-xs font-bold uppercase tracking-wide text-laranja">{p.segmento}</span>
                <span className="font-medium text-marinho">{p.nome}</span>
                <span className="text-xs text-slate-500">{p.campos.length} campos · usar este modelo</span>
              </button>
            </form>
          ))}
        </div>
      </section>

      <form action={criarModelo} className="cartao flex gap-2 p-3">
        <input
          type="text"
          name="nome"
          required
          placeholder="Ou crie um modelo em branco (ex.: Instalação de portão)"
          className="campo-input flex-1 p-2 text-sm"
        />
        <button className="btn-secundario rounded-md px-4 py-2 text-sm">
          Criar modelo
        </button>
      </form>

      <ul className="space-y-2">
        {modelos.length === 0 && (
          <li className="cartao p-6 text-center text-slate-400">
            Nenhum modelo ainda.
            <span className="mt-1 block text-xs">Crie o primeiro no formulário acima.</span>
          </li>
        )}
        {modelos.map((m) => (
          <li key={m.id} className="cartao flex items-center justify-between p-4">
            <div>
              <Link href={`/painel/modelos/${m.id}`} className="font-medium text-marinho-claro underline">
                {m.nome}
              </Link>
              <p className="text-sm text-slate-500">
                {m._count.campos} campo(s) · {m._count.relatorios} relatório(s)
                {!m.ativo && <span className="chip ml-2 bg-slate-200 text-slate-700">inativo</span>}
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
