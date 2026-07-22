import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUsuarioAtivo } from "@/lib/session";

// Em produção, o Next só serve de public/ o que existia no momento do build —
// fotos são gravadas em runtime por /api/fotos, então precisam deste handler.
// Fotos de relatório são privadas: gestor vê todas; técnico só as dos próprios
// relatórios. A logo da empresa é visível a qualquer usuário logado.

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Mesmo formato gravado por /api/fotos e pela logo: uuid validado + extensão
// conhecida — sem path traversal.
const NOME_RE = /^[0-9a-f-]{8,64}\.(jpg|png|webp)$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ nome: string }> }) {
  const user = await getUsuarioAtivo();
  if (!user) return new NextResponse("Não autenticado", { status: 401 });

  const { nome: nomeRaw } = await params;
  const nome = nomeRaw.toLowerCase();
  if (!NOME_RE.test(nome)) return new NextResponse("Nome inválido", { status: 400 });

  const foto = await prisma.foto.findFirst({
    where: { arquivo: nome },
    include: { relatorio: { select: { tecnicoId: true } } },
  });
  if (foto) {
    if (user.papel !== "GESTOR" && foto.relatorio.tecnicoId !== user.userId)
      return new NextResponse("Não encontrado", { status: 404 });
  } else {
    // Não é foto de relatório: só serve se for a logo cadastrada da empresa
    const empresa = await prisma.empresa.findUnique({ where: { id: 1 } });
    if (empresa?.logo?.toLowerCase() !== nome) return new NextResponse("Não encontrado", { status: 404 });
  }

  try {
    const buf = await readFile(path.join(process.cwd(), "public", "uploads", nome));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": CONTENT_TYPE[path.extname(nome)] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        // uuid no nome → conteúdo imutável; private: exige cookie de sessão
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Não encontrado", { status: 404 });
  }
}
