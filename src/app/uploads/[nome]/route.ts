import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUsuarioAtivo } from "@/lib/session";

// Os arquivos vivem em uploads/ (FORA de public/) de propósito: qualquer coisa
// em public/ o Next serve estaticamente, pulando este handler e vazando fotos
// privadas. Fotos de relatório são privadas: gestor vê todas; técnico só as dos
// próprios relatórios; relatório com link público expõe as suas fotos. A logo
// da empresa é visível a qualquer um (aparece na página pública /r/<token>).

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Mesmo formato gravado por /api/fotos e pela logo: uuid validado + extensão
// conhecida — sem path traversal.
const NOME_RE = /^[0-9a-f-]{8,64}\.(jpg|png|webp)$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ nome: string }> }) {
  const { nome: nomeRaw } = await params;
  const nome = nomeRaw.toLowerCase();
  if (!NOME_RE.test(nome)) return new NextResponse("Nome inválido", { status: 400 });

  const user = await getUsuarioAtivo();
  const foto = await prisma.foto.findFirst({
    where: { arquivo: nome },
    include: { relatorio: { select: { tecnicoId: true, linkPublico: true } } },
  });

  if (foto) {
    // Relatório compartilhado publicamente: as fotos acompanham (página /r/<token>)
    const publica = foto.relatorio.linkPublico !== null;
    const dono = user && (user.papel === "GESTOR" || foto.relatorio.tecnicoId === user.userId);
    if (!publica && !dono) return new NextResponse("Não encontrado", { status: user ? 404 : 401 });
  } else {
    // Não é foto de relatório: só serve se for a logo cadastrada da empresa
    const empresa = await prisma.empresa.findUnique({ where: { id: 1 } });
    if (empresa?.logo?.toLowerCase() !== nome) return new NextResponse("Não encontrado", { status: 404 });
  }

  try {
    const buf = await readFile(path.join(process.cwd(), "uploads", nome));
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
