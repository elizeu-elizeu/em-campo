// Relatório público — a página que a prestadora compartilha com o cliente final.
// Sem login: o token imprevisível é a chave. É o cartão de visita do EmCampo.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LogoSimbolo } from "@/components/Logo";
import RespostasView from "@/components/RespostasView";
import { prisma } from "@/lib/db";
import type { Resposta } from "@/lib/tipos";

const TOKEN_RE = /^[A-Za-z0-9_-]{8,32}$/;

async function buscar(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  return prisma.relatorio.findUnique({
    where: { linkPublico: token },
    include: {
      modelo: { select: { nome: true } },
      cliente: { select: { nome: true } },
      tecnico: { select: { nome: true } },
      fotos: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const r = await buscar(token);
  const empresa = r ? await prisma.empresa.findUnique({ where: { id: 1 } }) : null;
  return {
    title: r ? `${r.modelo.nome} — ${empresa?.nome ?? "EmCampo"}` : "Relatório",
    robots: { index: false },
  };
}

function CenaCapa() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c3a63] via-[#132a4a] to-[#0e2138]" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 45% at 70% 80%, rgb(249 115 22 / 0.25), transparent 65%)",
        }}
      />
      <svg className="absolute bottom-0 h-24 w-full" viewBox="0 0 1440 96" preserveAspectRatio="none">
        <path d="M0 60 C240 30 480 70 720 50 C960 32 1200 66 1440 44 L1440 96 L0 96 Z" fill="#0e2138" />
        <path d="M0 78 C300 58 620 88 920 72 C1180 60 1340 76 1440 70 L1440 96 L0 96 Z" fill="#0a1a2e" />
      </svg>
    </div>
  );
}

export default async function RelatorioPublico({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [r, empresa] = await Promise.all([buscar(token), prisma.empresa.findUnique({ where: { id: 1 } })]);
  if (!r) notFound();

  const respostas = JSON.parse(r.respostas) as Resposta[];
  const linhaEmpresa = [empresa?.cnpj && `CNPJ ${empresa.cnpj}`, empresa?.telefone, empresa?.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-dvh bg-base">
      {/* Capa */}
      <header className="relative overflow-hidden px-5 pb-16 pt-8 text-white">
        <CenaCapa />
        <div className="relative mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            {empresa?.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/uploads/${empresa.logo}`}
                alt={`Logo ${empresa.nome}`}
                className="h-12 w-auto max-w-28 rounded bg-white/90 object-contain p-1"
              />
            )}
            <div>
              <p className="font-titulo text-xl font-extrabold tracking-tight">
                {empresa?.nome ?? "Relatório de serviço"}
              </p>
              {linhaEmpresa && <p className="text-xs text-slate-300">{linhaEmpresa}</p>}
            </div>
          </div>

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.18em] text-laranja">
            Relatório de serviço
          </p>
          <h1 className="font-titulo text-3xl font-extrabold leading-tight tracking-tight">
            {r.modelo.nome}
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {r.cliente.nome} · {r.data.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            {" · "}técnico {r.tecnico.nome}
          </p>
          {r.status === "APROVADO" && (
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <span className="text-ok-bg">✓</span> Conferido pela empresa
            </p>
          )}
        </div>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-2xl px-4 pb-6">
        <div className="cartao -mt-8 p-5 sm:p-7">
          <RespostasView
            respostas={respostas}
            fotos={r.fotos.map((f) => ({
              uuid: f.uuid,
              campoId: f.campoId,
              url: `/uploads/${f.arquivo}`,
              legenda: f.legenda,
            }))}
          />
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 pb-4 text-center text-xs text-slate-400">
          Relatório nº {r.uuid.slice(0, 8).toUpperCase()} · feito com
          <LogoSimbolo className="inline h-4 w-4 text-slate-500" />
          <span className="font-titulo font-bold text-slate-500">EmCampo</span>
        </p>
      </main>
    </div>
  );
}
