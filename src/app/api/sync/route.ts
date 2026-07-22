import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { TIPOS_CAMPO, type Resposta, type TipoCampo } from "@/lib/tipos";

const UUID_RE = /^[0-9a-f-]{8,64}$/i;

function valorValido(v: unknown): boolean {
  if (v === null || typeof v === "boolean") return true;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") return v.length <= 200_000; // assinatura em dataURL cabe aqui
  if (Array.isArray(v)) return v.length <= 50 && v.every((x) => typeof x === "string" && x.length <= 500);
  return false;
}

// Recebe um relatório COMPLETO do aparelho do técnico. Idempotente por uuid:
// reenviar o mesmo relatório (retry de sync, correção de devolvido) faz upsert.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return new NextResponse("Não autenticado", { status: 401 });
  if (session.papel !== "TECNICO") return new NextResponse("Apenas técnicos enviam relatórios", { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new NextResponse("Corpo inválido", { status: 400 });

  const { uuid, modeloId, clienteId, data, respostas } = body as Record<string, unknown>;
  if (typeof uuid !== "string" || !UUID_RE.test(uuid)) return new NextResponse("uuid inválido", { status: 400 });
  if (typeof modeloId !== "number" || typeof clienteId !== "number")
    return new NextResponse("modeloId/clienteId inválidos", { status: 400 });
  const dataDate = typeof data === "string" ? new Date(data) : null;
  if (!dataDate || isNaN(dataDate.getTime())) return new NextResponse("data inválida", { status: 400 });
  if (!Array.isArray(respostas) || respostas.length > 200)
    return new NextResponse("respostas inválidas", { status: 400 });

  const limpas: Resposta[] = [];
  for (const r of respostas) {
    const { campoId, rotulo, tipo, valor, obs } = (r ?? {}) as Record<string, unknown>;
    if (
      typeof campoId !== "number" ||
      typeof rotulo !== "string" ||
      rotulo.length > 500 ||
      !TIPOS_CAMPO.includes(tipo as TipoCampo) ||
      !valorValido(valor) ||
      (obs != null && typeof obs !== "string")
    ) {
      return new NextResponse("resposta inválida", { status: 400 });
    }
    limpas.push({
      campoId,
      rotulo,
      tipo: tipo as TipoCampo,
      valor,
      obs: typeof obs === "string" ? obs.slice(0, 5000) : null,
    });
  }

  const [modelo, cliente, existente] = await Promise.all([
    prisma.modelo.findUnique({ where: { id: modeloId } }),
    prisma.cliente.findUnique({ where: { id: clienteId } }),
    prisma.relatorio.findUnique({ where: { uuid } }),
  ]);
  if (!modelo) return new NextResponse("Modelo não existe mais — fale com o gestor", { status: 400 });
  if (!cliente) return new NextResponse("Cliente não existe mais — fale com o gestor", { status: 400 });
  if (existente && existente.tecnicoId !== session.userId)
    return new NextResponse("Relatório pertence a outro técnico", { status: 403 });
  if (existente && existente.status === "APROVADO")
    return new NextResponse("Relatório já aprovado — não pode ser alterado", { status: 409 });

  const respostasJson = JSON.stringify(limpas);
  await prisma.relatorio.upsert({
    where: { uuid },
    create: {
      uuid,
      modeloId,
      clienteId,
      tecnicoId: session.userId,
      data: dataDate,
      status: "ENVIADO",
      respostas: respostasJson,
    },
    // Correção de DEVOLVIDO ou retry: atualiza respostas e volta para ENVIADO.
    update: { respostas: respostasJson, status: "ENVIADO" },
  });

  return NextResponse.json({ ok: true });
}
