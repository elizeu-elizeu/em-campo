import Link from "next/link";
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

export default async function Painel({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tecnicoId?: string; clienteId?: string; modeloId?: string }>;
}) {
  await requireUser("GESTOR");
  const f = await searchParams;

  const where = {
    ...(f.status && ["ENVIADO", "DEVOLVIDO", "APROVADO"].includes(f.status) ? { status: f.status } : {}),
    ...(Number(f.tecnicoId) ? { tecnicoId: Number(f.tecnicoId) } : {}),
    ...(Number(f.clienteId) ? { clienteId: Number(f.clienteId) } : {}),
    ...(Number(f.modeloId) ? { modeloId: Number(f.modeloId) } : {}),
  };

  const inicio30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [relatorios, tecnicos, clientes, modelos, total30, pendentes, aprovados30, empresa] =
    await Promise.all([
      prisma.relatorio.findMany({
        where,
        include: { modelo: { select: { nome: true } }, cliente: { select: { nome: true } }, tecnico: { select: { nome: true } } },
        orderBy: { data: "desc" },
        take: 200,
      }),
      prisma.user.findMany({ where: { papel: "TECNICO" }, orderBy: { nome: "asc" } }),
      prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
      prisma.modelo.findMany({ orderBy: { nome: "asc" } }),
      prisma.relatorio.count({ where: { data: { gte: inicio30 } } }),
      prisma.relatorio.count({ where: { status: "ENVIADO" } }),
      prisma.relatorio.count({ where: { status: "APROVADO", data: { gte: inicio30 } } }),
      prisma.empresa.findUnique({ where: { id: 1 } }),
    ]);

  const passos = [
    { ok: Boolean(empresa), rotulo: "Cadastrar dados e logo da empresa", href: "/painel/empresa" },
    { ok: modelos.length > 0, rotulo: "Criar o primeiro modelo de relatório", href: "/painel/modelos" },
    { ok: clientes.length > 0, rotulo: "Cadastrar um cliente", href: "/painel/clientes" },
    { ok: tecnicos.length > 0, rotulo: "Cadastrar o primeiro técnico", href: "/painel/usuarios" },
  ];
  const setupIncompleto = passos.some((p) => !p.ok);

  const stats = [
    { valor: total30, rotulo: "Relatórios (30 dias)", href: "/painel" },
    { valor: pendentes, rotulo: "Aguardando revisão", href: "/painel?status=ENVIADO", destaque: pendentes > 0 },
    { valor: aprovados30, rotulo: "Aprovados (30 dias)", href: "/painel?status=APROVADO" },
    { valor: tecnicos.filter((t) => t.ativo).length, rotulo: "Técnicos ativos", href: "/painel/usuarios" },
  ];

  const selectCls = "campo-input p-2 text-sm";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight text-marinho">Relatórios</h1>

      {setupIncompleto && (
        <section className="cartao p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">
            Primeiros passos
          </h2>
          <ul className="space-y-1.5">
            {passos.map((p) => (
              <li key={p.rotulo} className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold ${
                    p.ok ? "bg-ok-bg text-ok" : "border border-slate-300 text-slate-400"
                  }`}
                >
                  {p.ok ? "✓" : ""}
                </span>
                {p.ok ? (
                  <span className="text-slate-500 line-through">{p.rotulo}</span>
                ) : (
                  <Link href={p.href} className="font-medium text-marinho-claro underline">
                    {p.rotulo}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.rotulo}
            href={s.href}
            className={`cartao p-4 ${s.destaque ? "border-l-4 border-laranja" : ""}`}
          >
            <p className="font-titulo text-3xl font-extrabold tabular-nums tracking-tight text-marinho">
              {s.valor}
            </p>
            <p className="text-xs font-medium text-texto-sec">{s.rotulo}</p>
          </Link>
        ))}
      </div>

      <form className="cartao flex flex-wrap items-end gap-2 p-3">
        <select name="status" defaultValue={f.status ?? ""} className={selectCls}>
          <option value="">Todos os status</option>
          {Object.entries(NOME_STATUS).map(([v, n]) => (
            <option key={v} value={v}>{n}</option>
          ))}
        </select>
        <select name="tecnicoId" defaultValue={f.tecnicoId ?? ""} className={selectCls}>
          <option value="">Todos os técnicos</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
        <select name="clienteId" defaultValue={f.clienteId ?? ""} className={selectCls}>
          <option value="">Todos os clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <select name="modeloId" defaultValue={f.modeloId ?? ""} className={selectCls}>
          <option value="">Todos os modelos</option>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        <button className="btn-secundario rounded-md px-4 py-2 text-sm">Filtrar</button>
        <Link href="/painel" className="p-2 text-sm text-slate-500 underline">Limpar</Link>
      </form>

      <div className="cartao overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-texto-sec">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Técnico</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {relatorios.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  Nenhum relatório encontrado.
                  <span className="mt-1 block text-xs">Ajuste os filtros acima ou aguarde o envio dos técnicos.</span>
                </td>
              </tr>
            )}
            {relatorios.map((r) => (
              <tr key={r.uuid} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
                <td className="p-3 tabular-nums">{r.data.toLocaleDateString("pt-BR")}</td>
                <td className="p-3 font-medium text-slate-800">{r.modelo.nome}</td>
                <td className="p-3">{r.cliente.nome}</td>
                <td className="p-3">{r.tecnico.nome}</td>
                <td className="p-3">
                  <span className={`chip ${CHIP[r.status]}`}>
                    {NOME_STATUS[r.status]}
                  </span>
                </td>
                <td className="p-3">
                  <Link href={`/painel/relatorio/${r.uuid}`} className="font-medium text-marinho-claro underline">
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
