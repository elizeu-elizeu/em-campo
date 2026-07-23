import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUsuarioAtivo } from "@/lib/session";

// Exporta o painel filtrado em CSV (separador ; e BOM — abre certo no Excel pt-BR).
export async function GET(req: Request) {
  const user = await getUsuarioAtivo();
  if (!user || user.papel !== "GESTOR") return new NextResponse("Não autorizado", { status: 401 });

  const p = new URL(req.url).searchParams;
  const busca = (p.get("q") ?? "").trim().slice(0, 100);
  const status = p.get("status") ?? "";
  const where = {
    ...(["ENVIADO", "DEVOLVIDO", "APROVADO"].includes(status) ? { status } : {}),
    ...(Number(p.get("tecnicoId")) ? { tecnicoId: Number(p.get("tecnicoId")) } : {}),
    ...(Number(p.get("clienteId")) ? { clienteId: Number(p.get("clienteId")) } : {}),
    ...(Number(p.get("modeloId")) ? { modeloId: Number(p.get("modeloId")) } : {}),
    ...(busca
      ? {
          OR: [
            { cliente: { nome: { contains: busca } } },
            { tecnico: { nome: { contains: busca } } },
            { modelo: { nome: { contains: busca } } },
            { respostas: { contains: busca } },
          ],
        }
      : {}),
  };

  const lista = await prisma.relatorio.findMany({
    where,
    include: {
      modelo: { select: { nome: true } },
      cliente: { select: { nome: true } },
      tecnico: { select: { nome: true } },
    },
    orderBy: { data: "desc" },
    take: 5000,
  });

  const campo = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const linhas = [
    ["Data", "Modelo", "Cliente", "Técnico", "Status", "Nº"].join(";"),
    ...lista.map((r) =>
      [
        r.data.toLocaleDateString("pt-BR"),
        campo(r.modelo.nome),
        campo(r.cliente.nome),
        campo(r.tecnico.nome),
        r.status,
        r.uuid.slice(0, 8).toUpperCase(),
      ].join(";")
    ),
  ];

  return new NextResponse("﻿" + linhas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorios-emcampo.csv"`,
    },
  });
}
