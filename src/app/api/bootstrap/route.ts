import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Catálogo que o app do técnico guarda no aparelho para funcionar offline.
export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const [modelos, clientes] = await Promise.all([
    prisma.modelo.findMany({
      where: { ativo: true },
      include: { campos: { orderBy: { ordem: "asc" } } },
      orderBy: { nome: "asc" },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return NextResponse.json({
    modelos: modelos.map((m) => ({
      id: m.id,
      nome: m.nome,
      campos: m.campos.map((c) => ({
        id: c.id,
        ordem: c.ordem,
        tipo: c.tipo,
        rotulo: c.rotulo,
        obrigatorio: c.obrigatorio,
        multipla: c.multipla,
        opcoes: c.opcoes ? (JSON.parse(c.opcoes) as string[]) : null,
      })),
    })),
    clientes: clientes.map((c) => ({ id: c.id, nome: c.nome, endereco: c.endereco })),
  });
}
