import Link from "next/link";
import { notFound } from "next/navigation";
import RespostasView from "@/components/RespostasView";
import { aprovarRelatorio, devolverRelatorio } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function DetalheRelatorio({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  await requireUser("GESTOR");
  const { uuid } = await params;
  const { erro } = await searchParams;

  const r = await prisma.relatorio.findUnique({
    where: { uuid },
    include: {
      modelo: { select: { nome: true } },
      cliente: { select: { nome: true, endereco: true } },
      tecnico: { select: { nome: true } },
      fotos: true,
    },
  });
  if (!r) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{r.modelo.nome}</h1>
          <p className="text-sm text-slate-500">
            {r.cliente.nome} · {r.tecnico.nome} · {r.data.toLocaleDateString("pt-BR")}
          </p>
        </div>
        <Link
          href={`/relatorio/${r.uuid}/imprimir`}
          target="_blank"
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        >
          Exportar PDF
        </Link>
      </div>

      {erro === "comentario" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Escreva o comentário explicando o que corrigir antes de devolver.
        </p>
      )}

      {r.status === "DEVOLVIDO" && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Devolvido para correção{r.comentarioGestor ? `: ${r.comentarioGestor}` : ""}
        </p>
      )}
      {r.status === "APROVADO" && (
        <p className="rounded-md bg-green-50 p-3 text-sm font-semibold text-green-800">Relatório aprovado</p>
      )}

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <RespostasView
          respostas={JSON.parse(r.respostas)}
          fotos={r.fotos.map((f) => ({
            uuid: f.uuid,
            campoId: f.campoId,
            url: `/uploads/${f.arquivo}`,
            legenda: f.legenda,
          }))}
        />
      </div>

      {r.status !== "APROVADO" && (
        <div className="flex flex-wrap items-start gap-3 rounded-xl bg-white p-4 shadow-sm">
          <form action={aprovarRelatorio}>
            <input type="hidden" name="uuid" value={r.uuid} />
            <button className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white">Aprovar</button>
          </form>

          {r.status === "ENVIADO" && (
            <form action={devolverRelatorio} className="flex flex-1 flex-wrap items-start gap-2">
              <input type="hidden" name="uuid" value={r.uuid} />
              <textarea
                name="comentario"
                rows={2}
                placeholder="O que o técnico precisa corrigir?"
                className="min-w-64 flex-1 rounded-md border border-slate-300 p-2 text-sm"
              />
              <button className="rounded-md bg-amber-600 px-4 py-2 font-semibold text-white">
                Devolver p/ correção
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
