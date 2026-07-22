import { notFound } from "next/navigation";
import RespostasView from "@/components/RespostasView";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import BotaoImprimir from "./BotaoImprimir";

// Vista de impressão: o "Salvar como PDF" do navegador é o exportador.
export default async function Imprimir({ params }: { params: Promise<{ uuid: string }> }) {
  const session = await requireUser();
  const { uuid } = await params;

  const r = await prisma.relatorio.findUnique({
    where: { uuid },
    include: {
      modelo: { select: { nome: true } },
      cliente: { select: { nome: true, endereco: true, contato: true } },
      tecnico: { select: { nome: true } },
      fotos: true,
    },
  });
  // Técnico só imprime o próprio relatório; gestor imprime qualquer um.
  if (!r || (session.papel === "TECNICO" && r.tecnicoId !== session.userId)) notFound();

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <div className="mb-6 flex items-start justify-between border-b-2 border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{r.modelo.nome}</h1>
          <p className="mt-1 text-sm text-slate-600">
            <strong>Cliente:</strong> {r.cliente.nome}
            {r.cliente.endereco && <> · {r.cliente.endereco}</>}
          </p>
          <p className="text-sm text-slate-600">
            <strong>Técnico:</strong> {r.tecnico.nome} · <strong>Data:</strong>{" "}
            {r.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <BotaoImprimir />
      </div>

      <RespostasView
        respostas={JSON.parse(r.respostas)}
        fotos={r.fotos.map((f) => ({
          uuid: f.uuid,
          campoId: f.campoId,
          url: `/uploads/${f.arquivo}`,
          legenda: f.legenda,
        }))}
      />

      <p className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-400 print:fixed print:bottom-0 print:left-0 print:right-0">
        Relatório nº {r.uuid.slice(0, 8)} · gerado por EmCampo
      </p>
    </div>
  );
}
