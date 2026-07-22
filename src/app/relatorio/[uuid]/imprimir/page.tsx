import { notFound } from "next/navigation";
import RespostasView, { formatarValor } from "@/components/RespostasView";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import type { Resposta } from "@/lib/tipos";
import BotaoImprimir from "./BotaoImprimir";

// Vista de impressão: o "Salvar como PDF" do navegador é o exportador.
export default async function Imprimir({ params }: { params: Promise<{ uuid: string }> }) {
  const session = await requireUser();
  const { uuid } = await params;

  const [r, empresa] = await Promise.all([
    prisma.relatorio.findUnique({
      where: { uuid },
      include: {
        modelo: { select: { nome: true } },
        cliente: { select: { nome: true, endereco: true, contato: true } },
        tecnico: { select: { nome: true } },
        fotos: true,
      },
    }),
    prisma.empresa.findUnique({ where: { id: 1 } }),
  ]);
  // Técnico só imprime o próprio relatório; gestor imprime qualquer um.
  if (!r || (session.papel === "TECNICO" && r.tecnicoId !== session.userId)) notFound();

  const respostas = JSON.parse(r.respostas) as Resposta[];
  // Campos marcados "no cabeçalho" sobem para o bloco de identificação (e saem do corpo)
  const destaques = respostas.filter(
    (x) => x.cab && x.tipo !== "FOTO" && x.tipo !== "ASSINATURA" && x.valor != null && x.valor !== ""
  );
  const corpo = respostas.filter((x) => !destaques.includes(x));

  const linhaEmpresa = [
    empresa?.cnpj && `CNPJ ${empresa.cnpj}`,
    empresa?.telefone,
    empresa?.email,
    empresa?.endereco,
  ].filter(Boolean);

  const info: [string, string][] = [
    ["Cliente", r.cliente.nome],
    ...(r.cliente.endereco ? ([["Endereço", r.cliente.endereco]] as [string, string][]) : []),
    ["Técnico responsável", r.tecnico.nome],
    ["Tipo de serviço", r.modelo.nome],
    ["Data", r.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })],
    ["Relatório nº", r.uuid.slice(0, 8).toUpperCase()],
    ...destaques.map((d): [string, string] => [d.rotulo, formatarValor(d)]),
  ];

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <header className="mb-6">
        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-3">
          <div className="flex items-center gap-4">
            {empresa?.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/uploads/${empresa.logo}`}
                alt={`Logo ${empresa.nome}`}
                className="h-14 w-auto max-w-32 object-contain"
              />
            )}
            <div>
              <p className="text-2xl font-bold text-slate-900">{empresa?.nome ?? r.modelo.nome}</p>
              {linhaEmpresa.length > 0 && (
                <p className="mt-0.5 text-xs text-slate-500">{linhaEmpresa.join(" · ")}</p>
              )}
            </div>
          </div>
          <BotaoImprimir />
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Relatório de serviço
        </p>
        <h1 className="text-xl font-bold text-slate-900">{r.modelo.nome}</h1>

        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 rounded-md border border-slate-200 p-4 sm:grid-cols-3">
          {info.map(([rotulo, valor]) => (
            <div key={rotulo}>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{rotulo}</dt>
              <dd className="text-sm font-medium text-slate-800">{valor}</dd>
            </div>
          ))}
        </dl>
      </header>

      <RespostasView
        respostas={corpo}
        fotos={r.fotos.map((f) => ({
          uuid: f.uuid,
          campoId: f.campoId,
          url: `/uploads/${f.arquivo}`,
          legenda: f.legenda,
        }))}
      />

      <p className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-400">
        Relatório nº {r.uuid.slice(0, 8).toUpperCase()}
        {empresa?.nome ? ` · ${empresa.nome}` : ""} · gerado por EmCampo
      </p>
    </div>
  );
}
