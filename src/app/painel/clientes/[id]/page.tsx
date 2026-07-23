import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

const CHIP: Record<string, string> = {
  ENVIADO: "bg-info-bg text-info",
  DEVOLVIDO: "bg-alerta-bg text-alerta",
  APROVADO: "bg-ok-bg text-ok",
};
const NOME_STATUS: Record<string, string> = {
  ENVIADO: "Enviado",
  DEVOLVIDO: "Devolvido",
  APROVADO: "Aprovado",
};

// Histórico do cliente: tudo o que já foi feito naquele local, em linha do tempo.
export default async function HistoricoCliente({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("GESTOR");
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(id) || 0 },
    include: {
      relatorios: {
        include: { modelo: { select: { nome: true } }, tecnico: { select: { nome: true } } },
        orderBy: { data: "desc" },
      },
    },
  });
  if (!cliente) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-marinho">{cliente.nome}</h1>
        <p className="text-sm text-texto-sec">
          {[cliente.endereco, cliente.contato].filter(Boolean).join(" · ") || "Sem endereço/contato cadastrado"}
        </p>
      </div>

      <section className="cartao p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">
          Histórico de serviços ({cliente.relatorios.length})
        </h2>
        {cliente.relatorios.length === 0 && (
          <p className="text-sm text-slate-400">
            Nenhum serviço registrado ainda.
            <span className="mt-1 block text-xs">Os relatórios dos técnicos aparecem aqui.</span>
          </p>
        )}
        <ol className="relative space-y-4 border-l-2 border-slate-200 pl-5">
          {cliente.relatorios.map((r) => (
            <li key={r.uuid} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[27px] top-1.5 h-3 w-3 rounded-full ${
                  r.status === "APROVADO" ? "bg-ok" : r.status === "DEVOLVIDO" ? "bg-alerta" : "bg-marinho-claro"
                }`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm tabular-nums text-texto-sec">
                  {r.data.toLocaleDateString("pt-BR")}
                </span>
                <Link
                  href={`/painel/relatorio/${r.uuid}`}
                  className="font-medium text-marinho-claro underline"
                >
                  {r.modelo.nome}
                </Link>
                <span className={`chip ${CHIP[r.status]}`}>{NOME_STATUS[r.status]}</span>
              </div>
              <p className="text-xs text-slate-500">técnico {r.tecnico.nome}</p>
            </li>
          ))}
        </ol>
      </section>

      <Link href="/painel/clientes" className="inline-block text-sm text-marinho-claro underline">
        ← Voltar para clientes
      </Link>
    </div>
  );
}
