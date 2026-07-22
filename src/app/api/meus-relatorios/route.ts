import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Lista de relatórios já sincronizados do técnico logado (o app guarda em cache p/ offline).
export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (session.papel !== "TECNICO") return NextResponse.json({ error: "Apenas técnicos" }, { status: 403 });

  const lista = await prisma.relatorio.findMany({
    where: { tecnicoId: session.userId },
    include: { modelo: { select: { nome: true } }, cliente: { select: { nome: true } } },
    orderBy: { data: "desc" },
    take: 100,
  });

  return NextResponse.json(
    lista.map((r) => ({
      uuid: r.uuid,
      modeloNome: r.modelo.nome,
      clienteNome: r.cliente.nome,
      data: r.data.toISOString(),
      status: r.status,
      comentarioGestor: r.comentarioGestor,
    }))
  );
}
