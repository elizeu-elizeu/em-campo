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

  const [relatorios, tecnicos, clientes, modelos] = await Promise.all([
    prisma.relatorio.findMany({
      where,
      include: { modelo: { select: { nome: true } }, cliente: { select: { nome: true } }, tecnico: { select: { nome: true } } },
      orderBy: { data: "desc" },
      take: 200,
    }),
    prisma.user.findMany({ where: { papel: "TECNICO" }, orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.modelo.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const selectCls = "rounded-md border border-slate-300 bg-white p-2 text-sm";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Relatórios</h1>

      <form className="flex flex-wrap items-end gap-2 rounded-xl bg-white p-3 shadow-sm">
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
        <button className="rounded-md bg-marinho px-4 py-2 text-sm font-semibold text-white">Filtrar</button>
        <Link href="/painel" className="p-2 text-sm text-slate-500 underline">Limpar</Link>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
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
                </td>
              </tr>
            )}
            {relatorios.map((r) => (
              <tr key={r.uuid} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-3">{r.data.toLocaleDateString("pt-BR")}</td>
                <td className="p-3 font-medium text-slate-800">{r.modelo.nome}</td>
                <td className="p-3">{r.cliente.nome}</td>
                <td className="p-3">{r.tecnico.nome}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CHIP[r.status]}`}>
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
