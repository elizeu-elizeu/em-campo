import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUsuarioAtivo } from "@/lib/session";

// Catálogo que o app do técnico guarda no aparelho para funcionar offline.
export async function GET() {
  const user = await getUsuarioAtivo();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const [modelos, clientes, config, agendamentos] = await Promise.all([
    prisma.modelo.findMany({
      where: { ativo: true },
      include: { campos: { orderBy: { ordem: "asc" } } },
      orderBy: { nome: "asc" },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.config.findUnique({ where: { id: 1 } }),
    user.papel === "TECNICO"
      ? prisma.agendamento.findMany({
          where: { tecnicoId: user.userId, status: "ABERTO" },
          include: { cliente: true, modelo: { include: { campos: { orderBy: { ordem: "asc" } } } } },
          orderBy: { data: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const mapearCampos = (campos: (typeof modelos)[number]["campos"]) =>
    campos.map((c) => ({
      id: c.id,
      ordem: c.ordem,
      tipo: c.tipo,
      rotulo: c.rotulo,
      obrigatorio: c.obrigatorio,
      multipla: c.multipla,
      opcoes: c.opcoes ? (JSON.parse(c.opcoes) as string[]) : null,
      noCabecalho: c.noCabecalho,
    }));

  return NextResponse.json({
    modelos: modelos.map((m) => ({ id: m.id, nome: m.nome, campos: mapearCampos(m.campos) })),
    clientes: clientes.map((c) => ({ id: c.id, nome: c.nome, endereco: c.endereco })),
    config: { exigirFoto: config?.exigirFoto ?? false },
    // Serviços agendados do técnico, com o modelo COMPLETO embutido — o atendimento
    // funciona offline mesmo que o modelo seja desativado depois.
    agendamentos: agendamentos.map((a) => ({
      id: a.id,
      data: a.data.toISOString(),
      observacao: a.observacao,
      cliente: { id: a.cliente.id, nome: a.cliente.nome, endereco: a.cliente.endereco },
      modelo: { id: a.modelo.id, nome: a.modelo.nome, campos: mapearCampos(a.modelo.campos) },
    })),
  });
}
