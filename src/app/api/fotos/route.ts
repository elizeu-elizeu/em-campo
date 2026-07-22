import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extPorConteudo } from "@/lib/imagem";
import { getUsuarioAtivo } from "@/lib/session";

const UUID_RE = /^[0-9a-f-]{8,64}$/i;
const TAMANHO_MAX = 10 * 1024 * 1024; // 10MB

// Upload de foto de um relatório. Idempotente por uuid da foto (retry não duplica).
export async function POST(req: Request) {
  const user = await getUsuarioAtivo();
  if (!user) return new NextResponse("Não autenticado", { status: 401 });
  if (user.papel !== "TECNICO") return new NextResponse("Apenas técnicos enviam fotos", { status: 403 });

  const fd = await req.formData().catch(() => null);
  if (!fd) return new NextResponse("FormData inválido", { status: 400 });

  const uuid = String(fd.get("uuid") ?? "");
  const relatorioUuid = String(fd.get("relatorioUuid") ?? "");
  const campoIdRaw = fd.get("campoId");
  const legenda = fd.get("legenda") ? String(fd.get("legenda")).slice(0, 500) : null;
  const arquivo = fd.get("arquivo");

  if (!UUID_RE.test(uuid) || !UUID_RE.test(relatorioUuid))
    return new NextResponse("uuid inválido", { status: 400 });
  const campoId = campoIdRaw === null ? null : Number(campoIdRaw);
  if (campoId !== null && !Number.isInteger(campoId))
    return new NextResponse("campoId inválido", { status: 400 });
  if (!(arquivo instanceof File)) return new NextResponse("arquivo ausente", { status: 400 });
  if (arquivo.size > TAMANHO_MAX) return new NextResponse("Foto acima de 10MB", { status: 400 });
  // Tipo verificado pelos bytes reais, não pelo Content-Type declarado
  const conteudo = Buffer.from(await arquivo.arrayBuffer());
  const ext = extPorConteudo(conteudo);
  if (!ext) return new NextResponse("Formato aceito: JPEG, PNG ou WebP", { status: 400 });

  const [relatorio, fotoExistente] = await Promise.all([
    prisma.relatorio.findUnique({ where: { uuid: relatorioUuid } }),
    prisma.foto.findUnique({ where: { uuid: uuid.toLowerCase() } }),
  ]);
  if (!relatorio || relatorio.tecnicoId !== user.userId)
    return new NextResponse("Relatório não encontrado", { status: 404 });
  if (relatorio.status === "APROVADO")
    return new NextResponse("Relatório já aprovado — não pode ser alterado", { status: 409 });
  // uuid é escolhido pelo cliente: reuso de uuid de foto alheia sobrescreveria o arquivo dela
  if (fotoExistente && fotoExistente.relatorioUuid !== relatorioUuid)
    return new NextResponse("uuid de foto já pertence a outro relatório", { status: 403 });

  // Nome do arquivo derivado apenas do uuid validado — sem path traversal.
  const nomeArquivo = `${uuid.toLowerCase()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, nomeArquivo), conteudo);

  await prisma.foto.upsert({
    where: { uuid: uuid.toLowerCase() },
    create: { uuid: uuid.toLowerCase(), relatorioUuid, campoId, arquivo: nomeArquivo, legenda },
    update: { campoId, legenda },
  });

  return NextResponse.json({ ok: true });
}
