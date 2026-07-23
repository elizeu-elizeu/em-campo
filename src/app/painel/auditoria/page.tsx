import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";

// Trilha de auditoria: quem fez o quê e quando.
export default async function Auditoria() {
  await requireUser("GESTOR");
  const eventos = await prisma.evento.findMany({
    include: { user: { select: { nome: true } } },
    orderBy: { quando: "desc" },
    take: 200,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-marinho">Trilha de auditoria</h1>
        <p className="text-sm text-texto-sec">Últimos 200 eventos do sistema.</p>
      </div>

      <div className="cartao overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-texto-sec">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Quem</th>
              <th className="p-3">Ação</th>
              <th className="p-3">Alvo</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  Nenhum evento registrado ainda.
                  <span className="mt-1 block text-xs">Ações de gestão e envios aparecem aqui.</span>
                </td>
              </tr>
            )}
            {eventos.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3 tabular-nums text-texto-sec">
                  {e.quando.toLocaleDateString("pt-BR")}{" "}
                  {e.quando.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="p-3 font-medium text-slate-800">{e.user.nome}</td>
                <td className="p-3">{e.acao}</td>
                <td className="p-3 text-texto-sec">{e.alvo ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
