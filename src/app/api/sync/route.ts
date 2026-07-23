import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registrarEvento } from "@/lib/eventos";
import { getUsuarioAtivo } from "@/lib/session";
import { TIPOS_CAMPO, type Resposta, type TipoCampo } from "@/lib/tipos";

const UUID_RE = /^[0-9a-f-]{8,64}$/i;
const TAMANHO_MAX_RESPOSTAS = 2_000_000; // ~2MB serializado — protege banco e disco

function valorValido(v: unknown, tipo: TipoCampo): boolean {
  if (v === null || v === "" || typeof v === "boolean") return true;
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "string") {
    // Assinatura precisa ser imagem embutida — URL externa viraria request ao
    // servidor de terceiros aberto na tela do gestor.
    if (tipo === "ASSINATURA") return v.length <= 200_000 && v.startsWith("data:image/png;base64,");
    return v.length <= 10_000;
  }
  if (Array.isArray(v)) return v.length <= 50 && v.every((x) => typeof x === "string" && x.length <= 500);
  return false;
}

// Recebe um relatório COMPLETO do aparelho do técnico. Idempotente por uuid:
// reenviar o mesmo relatório (retry de sync, correção de devolvido) faz upsert.
export async function POST(req: Request) {
  const user = await getUsuarioAtivo();
  if (!user) return new NextResponse("Não autenticado", { status: 401 });
  if (user.papel !== "TECNICO") return new NextResponse("Apenas técnicos enviam relatórios", { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new NextResponse("Corpo inválido", { status: 400 });

  const { uuid, modeloId, clienteId, data, respostas, agendamentoId } = body as Record<string, unknown>;
  if (typeof uuid !== "string" || !UUID_RE.test(uuid)) return new NextResponse("uuid inválido", { status: 400 });
  if (typeof modeloId !== "number" || typeof clienteId !== "number")
    return new NextResponse("modeloId/clienteId inválidos", { status: 400 });
  if (agendamentoId !== undefined && !Number.isInteger(agendamentoId))
    return new NextResponse("agendamentoId inválido", { status: 400 });
  const dataDate = typeof data === "string" ? new Date(data) : null;
  if (!dataDate || isNaN(dataDate.getTime())) return new NextResponse("data inválida", { status: 400 });
  if (!Array.isArray(respostas) || respostas.length > 200)
    return new NextResponse("respostas inválidas", { status: 400 });

  const limpas: Resposta[] = [];
  for (const r of respostas) {
    const { campoId, rotulo, tipo, valor, obs, cab } = (r ?? {}) as Record<string, unknown>;
    if (
      typeof campoId !== "number" ||
      typeof rotulo !== "string" ||
      rotulo.length > 500 ||
      !TIPOS_CAMPO.includes(tipo as TipoCampo) ||
      !valorValido(valor, tipo as TipoCampo) ||
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
      cab: cab === true,
    });
  }

  const respostasJsonPreview = JSON.stringify(limpas);
  if (respostasJsonPreview.length > TAMANHO_MAX_RESPOSTAS)
    return new NextResponse("Relatório grande demais", { status: 413 });

  const [modelo, cliente, existente] = await Promise.all([
    prisma.modelo.findUnique({ where: { id: modeloId } }),
    prisma.cliente.findUnique({ where: { id: clienteId } }),
    prisma.relatorio.findUnique({ where: { uuid } }),
  ]);
  if (!modelo) return new NextResponse("Modelo não existe mais — fale com o gestor", { status: 400 });
  if (!cliente) return new NextResponse("Cliente não existe mais — fale com o gestor", { status: 400 });
  if (existente && existente.tecnicoId !== user.userId)
    return new NextResponse("Relatório pertence a outro técnico", { status: 403 });
  if (existente && existente.status === "APROVADO")
    return new NextResponse("Relatório já aprovado — não pode ser alterado", { status: 409 });

  const respostasJson = respostasJsonPreview;
  await prisma.relatorio.upsert({
    where: { uuid },
    create: {
      uuid,
      modeloId,
      clienteId,
      tecnicoId: user.userId,
      data: dataDate,
      status: "ENVIADO",
      respostas: respostasJson,
    },
    // Correção de DEVOLVIDO ou retry: atualiza respostas e volta para ENVIADO.
    update: { respostas: respostasJson, status: "ENVIADO" },
  });

  // Atendimento de serviço agendado: marca como concluído (idempotente — só sai de ABERTO)
  if (typeof agendamentoId === "number") {
    await prisma.agendamento.updateMany({
      where: { id: agendamentoId, tecnicoId: user.userId, status: "ABERTO" },
      data: { status: "CONCLUIDO", relatorioUuid: uuid },
    });
  }

  await registrarEvento(user.userId, existente ? "reenviou relatório" : "enviou relatório", uuid.slice(0, 8));

  return NextResponse.json({ ok: true });
}
