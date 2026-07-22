import { notFound } from "next/navigation";
import {
  adicionarCampo,
  alternarCampoCabecalho,
  alternarCampoObrigatorio,
  moverCampo,
  removerCampo,
  renomearModelo,
} from "@/lib/actions";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ROTULO_TIPO, TIPOS_CAMPO, type TipoCampo } from "@/lib/tipos";

export default async function EditarModelo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  await requireUser("GESTOR");
  const { id } = await params;
  const { erro } = await searchParams;

  const modelo = await prisma.modelo.findUnique({
    where: { id: Number(id) || 0 },
    include: { campos: { orderBy: { ordem: "asc" } } },
  });
  if (!modelo) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form action={renomearModelo} className="flex items-center gap-2">
        <input type="hidden" name="id" value={modelo.id} />
        <input
          type="text"
          name="nome"
          defaultValue={modelo.nome}
          className="flex-1 rounded-md border border-slate-300 bg-white p-2 text-lg font-bold text-slate-800"
        />
        <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Renomear</button>
      </form>

      {erro === "opcoes" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          Campo de múltipla escolha precisa de pelo menos uma opção (uma por linha).
        </p>
      )}

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">
          Campos do formulário (ordem em que o técnico preenche)
        </h2>
        {modelo.campos.length === 0 && <p className="text-slate-400">Nenhum campo ainda.</p>}
        <ul className="space-y-2">
          {modelo.campos.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3">
              <div className="flex-1">
                <span className="font-medium text-slate-800">{c.rotulo}</span>
                {c.obrigatorio && <span className="text-red-500"> *</span>}
                <p className="text-xs text-slate-500">
                  {ROTULO_TIPO[c.tipo as TipoCampo]}
                  {c.opcoes && ` · ${(JSON.parse(c.opcoes) as string[]).join(" / ")}`}
                  {c.multipla && " · várias escolhas"}
                </p>
                <div className="mt-1.5 flex gap-2">
                  <form action={alternarCampoObrigatorio}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        c.obrigatorio
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-slate-300 text-slate-500"
                      }`}
                    >
                      {c.obrigatorio ? "Obrigatório ✓" : "Obrigatório"}
                    </button>
                  </form>
                  <form action={alternarCampoCabecalho}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                        c.noCabecalho
                          ? "border-info bg-info-bg text-info"
                          : "border-slate-300 text-slate-500"
                      }`}
                    >
                      {c.noCabecalho ? "No cabeçalho ✓" : "No cabeçalho"}
                    </button>
                  </form>
                </div>
              </div>
              <form action={moverCampo}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="direcao" value="subir" />
                <button disabled={i === 0} className="px-2 text-slate-500 disabled:opacity-20" aria-label="Subir">
                  ↑
                </button>
              </form>
              <form action={moverCampo}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="direcao" value="descer" />
                <button
                  disabled={i === modelo.campos.length - 1}
                  className="px-2 text-slate-500 disabled:opacity-20"
                  aria-label="Descer"
                >
                  ↓
                </button>
              </form>
              <form action={removerCampo}>
                <input type="hidden" name="id" value={c.id} />
                <button className="px-2 font-bold text-red-500" aria-label="Remover campo">
                  ×
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">Adicionar campo</h2>
        <form action={adicionarCampo} className="space-y-3">
          <input type="hidden" name="modeloId" value={modelo.id} />
          <div className="flex flex-wrap gap-2">
            <select name="tipo" className="rounded-md border border-slate-300 p-2 text-sm">
              {TIPOS_CAMPO.map((t) => (
                <option key={t} value={t}>
                  {ROTULO_TIPO[t]}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="rotulo"
              required
              placeholder="Rótulo (ex.: Estado do equipamento)"
              className="flex-1 rounded-md border border-slate-300 p-2 text-sm"
            />
          </div>
          <textarea
            name="opcoes"
            rows={3}
            placeholder={"Opções de múltipla escolha — uma por linha (ignore para outros tipos)"}
            className="w-full rounded-md border border-slate-300 p-2 text-sm"
          />
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="obrigatorio" /> Obrigatório
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="multipla" /> Permite marcar várias opções
            </label>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" name="noCabecalho" /> Destacar no cabeçalho do relatório
            </label>
            <button className="ml-auto rounded-md bg-marinho px-4 py-2 font-semibold text-white">
              Adicionar
            </button>
          </div>
        </form>
      </section>

      <p className="text-xs text-slate-400">
        Alterações no modelo não afetam relatórios já preenchidos — cada relatório guarda uma cópia dos
        campos da época.
      </p>
    </div>
  );
}
