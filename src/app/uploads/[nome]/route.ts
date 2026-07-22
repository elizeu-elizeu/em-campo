import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Em produção, o Next só serve de public/ o que existia no momento do build —
// fotos são gravadas em runtime por /api/fotos, então precisam deste handler.
// Fotos de relatório são privadas: exige sessão (técnico ou gestor), como na
// vista de impressão.

const CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Mesmo formato gravado por /api/fotos: uuid validado + extensão conhecida —
// sem path traversal.
const NOME_RE = /^[0-9a-f-]{8,64}\.(jpg|png|webp)$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ nome: string }> }) {
  const session = await getSession();
  if (!session.userId) return new NextResponse("Não autenticado", { status: 401 });

  const { nome: nomeRaw } = await params;
  const nome = nomeRaw.toLowerCase();
  if (!NOME_RE.test(nome)) return new NextResponse("Nome inválido", { status: 400 });

  try {
    const buf = await readFile(path.join(process.cwd(), "public", "uploads", nome));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": CONTENT_TYPE[path.extname(nome)] ?? "application/octet-stream",
        // uuid no nome → conteúdo imutável; private: exige cookie de sessão
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Não encontrado", { status: 404 });
  }
}
