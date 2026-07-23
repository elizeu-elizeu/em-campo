import Link from "next/link";
import { notFound } from "next/navigation";
import BotaoCopiarLink from "@/components/BotaoCopiarLink";
import RespostasView from "@/components/RespostasView";
import { aprovarRelatorio, devolverRelatorio, gerarLinkPublico, revogarLinkPublico } from "@/lib/actions";
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
          <h1 className="text-xl font-bold tracking-tight text-marinho">{r.modelo.nome}</h1>
          <p className="text-sm text-texto-sec">
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
        <p className="rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
          Devolvido para correção{r.comentarioGestor ? `: ${r.comentarioGestor}` : ""}
        </p>
      )}
      {r.status === "APROVADO" && (
        <p className="rounded-md bg-ok-bg p-3 text-sm font-semibold text-ok">Relatório aprovado</p>
      )}

      <div className="cartao p-5">
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
        <div className="cartao flex flex-wrap items-start gap-3 p-4">
          <form action={aprovarRelatorio}>
            <input type="hidden" name="uuid" value={r.uuid} />
            <button className="rounded-md bg-ok px-4 py-2 font-semibold text-white transition-colors hover:brightness-110">Aprovar</button>
          </form>

          {r.status === "ENVIADO" && (
            <form action={devolverRelatorio} className="flex flex-1 flex-wrap items-start gap-2">
              <input type="hidden" name="uuid" value={r.uuid} />
              <textarea
                name="comentario"
                rows={2}
                placeholder="O que o técnico precisa corrigir?"
                className="campo-input min-w-64 flex-1 p-2 text-sm"
              />
              <button className="btn-primario rounded-md px-4 py-2">
                Devolver p/ correção
              </button>
            </form>
          )}
        </div>
      )}

      <div className="cartao flex flex-wrap items-center gap-3 p-4">
        <div className="min-w-52 flex-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">
            Compartilhar com o cliente
          </h2>
          {r.linkPublico ? (
            <p className="text-sm text-slate-600">
              Link ativo — quem tiver o endereço vê o relatório e as fotos, sem precisar de conta.
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Gere um link público para enviar por WhatsApp ou e-mail.
            </p>
          )}
        </div>
        {r.linkPublico ? (
          <div className="flex flex-wrap items-center gap-2">
            <BotaoCopiarLink token={r.linkPublico} />
            <Link
              href={`/r/${r.linkPublico}`}
              target="_blank"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              Abrir
            </Link>
            <form action={revogarLinkPublico}>
              <input type="hidden" name="uuid" value={r.uuid} />
              <button className="px-2 text-sm text-alerta underline">Revogar</button>
            </form>
          </div>
        ) : (
          <form action={gerarLinkPublico}>
            <input type="hidden" name="uuid" value={r.uuid} />
            <button className="btn-secundario rounded-md px-4 py-2 text-sm">Gerar link público</button>
          </form>
        )}
      </div>
    </div>
  );
}
