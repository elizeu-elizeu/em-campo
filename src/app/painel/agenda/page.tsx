import Link from "next/link";
import { cancelarAgendamento, criarAgendamento } from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

const CHIP_AG: Record<string, string> = {
  ABERTO: "bg-info-bg text-info",
  CONCLUIDO: "bg-ok-bg text-ok",
  CANCELADO: "bg-slate-200 text-slate-600",
};
const NOME_AG: Record<string, string> = {
  ABERTO: "Aberto",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

export default async function Agenda({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  await requireUser("GESTOR");
  const { erro } = await searchParams;

  const [abertos, encerrados, clientes, modelos, tecnicos] = await Promise.all([
    prisma.agendamento.findMany({
      where: { status: "ABERTO" },
      include: { cliente: true, modelo: true, tecnico: true },
      orderBy: { data: "asc" },
    }),
    prisma.agendamento.findMany({
      where: { status: { in: ["CONCLUIDO", "CANCELADO"] } },
      include: { cliente: true, modelo: true, tecnico: true },
      orderBy: { data: "desc" },
      take: 20,
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.modelo.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.user.findMany({ where: { papel: "TECNICO", ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  const selectCls = "campo-input p-2 text-sm";
  const dataHora = (d: Date) =>
    `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-marinho">Agenda</h1>
        <p className="text-sm text-texto-sec">
          O serviço agendado aparece no app do técnico — inclusive offline — pronto para virar relatório.
        </p>
      </div>

      {erro === "dados" && (
        <p className="rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
          Preencha cliente, modelo, técnico e uma data válida.
        </p>
      )}

      <form action={criarAgendamento} className="cartao flex flex-wrap items-end gap-2 p-3">
        <select name="clienteId" required className={selectCls}>
          <option value="">Cliente…</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select name="modeloId" required className={selectCls}>
          <option value="">Tipo de serviço…</option>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        <select name="tecnicoId" required className={selectCls}>
          <option value="">Técnico…</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        <input type="datetime-local" name="data" required className={selectCls} />
        <input
          type="text"
          name="observacao"
          placeholder="Observação (opcional)"
          className={`${selectCls} min-w-44 flex-1`}
        />
        <button className="btn-secundario rounded-md px-4 py-2 text-sm">Agendar</button>
      </form>

      <section className="cartao p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">
          Próximos serviços ({abertos.length})
        </h2>
        {abertos.length === 0 && (
          <p className="text-sm text-slate-400">
            Nenhum serviço agendado.
            <span className="mt-1 block text-xs">Agende no formulário acima.</span>
          </p>
        )}
        <ul className="space-y-2">
          {abertos.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3">
              <span className="text-sm font-medium tabular-nums text-marinho">{dataHora(a.data)}</span>
              <div className="min-w-40 flex-1">
                <p className="font-medium text-slate-800">{a.modelo.nome}</p>
                <p className="text-sm text-texto-sec">
                  {a.cliente.nome} · técnico {a.tecnico.nome}
                </p>
                {a.observacao && <p className="text-xs text-slate-500">{a.observacao}</p>}
              </div>
              <form action={cancelarAgendamento}>
                <input type="hidden" name="id" value={a.id} />
                <button className="text-sm text-alerta underline">Cancelar</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {encerrados.length > 0 && (
        <section className="cartao p-4">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">Encerrados recentes</h2>
          <ul className="space-y-1.5">
            {encerrados.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="tabular-nums text-texto-sec">{dataHora(a.data)}</span>
                <span className="font-medium text-slate-800">{a.modelo.nome}</span>
                <span className="text-texto-sec">· {a.cliente.nome}</span>
                <span className={`chip ${CHIP_AG[a.status]}`}>{NOME_AG[a.status]}</span>
                {a.relatorioUuid && (
                  <Link href={`/painel/relatorio/${a.relatorioUuid}`} className="text-marinho-claro underline">
                    ver relatório
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
