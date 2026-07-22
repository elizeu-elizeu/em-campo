import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUsuarioAtivo } from "@/lib/session";

// Detalhe de um relatório do técnico logado — usado para ver enviado e corrigir devolvido (online).
export async function GET(_req: Request, { params }: { params: Promise<{ uuid: string }> }) {
  const user = await getUsuarioAtivo();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (user.papel !== "TECNICO") return NextResponse.json({ error: "Apenas técnicos" }, { status: 403 });

  const { uuid } = await params;
  const r = await prisma.relatorio.findUnique({
    where: { uuid },
    include: {
      modelo: { include: { campos: { orderBy: { ordem: "asc" } } } },
      cliente: { select: { id: true, nome: true } },
      fotos: true,
    },
  });
  if (!r || r.tecnicoId !== user.userId)
    return NextResponse.json({ error: "Relatório não encontrado" }, { status: 404 });

  return NextResponse.json({
    uuid: r.uuid,
    modeloId: r.modeloId,
    modeloNome: r.modelo.nome,
    clienteId: r.cliente.id,
    clienteNome: r.cliente.nome,
    data: r.data.toISOString(),
    status: r.status,
    comentarioGestor: r.comentarioGestor,
    respostas: JSON.parse(r.respostas),
    fotos: r.fotos.map((f) => ({ uuid: f.uuid, campoId: f.campoId, arquivo: f.arquivo, legenda: f.legenda })),
    // Campos atuais do modelo — para opções/obrigatoriedade na correção
    modeloCampos: r.modelo.campos.map((c) => ({
      id: c.id,
      ordem: c.ordem,
      tipo: c.tipo,
      rotulo: c.rotulo,
      obrigatorio: c.obrigatorio,
      multipla: c.multipla,
      opcoes: c.opcoes ? (JSON.parse(c.opcoes) as string[]) : null,
    })),
  });
}
