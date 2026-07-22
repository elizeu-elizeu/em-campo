// Exibição somente-leitura das respostas de um relatório (snapshot JSON).
// Sem hooks: funciona em server components (painel, impressão) e client (técnico).

import type { Resposta } from "@/lib/tipos";

export type FotoRemota = { uuid: string; campoId: number | null; url: string; legenda: string | null };

function formatarValor(r: Resposta): string {
  if (r.valor === null || r.valor === undefined || r.valor === "") return "—";
  if (r.tipo === "SIM_NAO") return r.valor ? "Sim" : "Não";
  if (Array.isArray(r.valor)) return r.valor.length ? r.valor.join(", ") : "—";
  return String(r.valor);
}

function GradeFotos({ fotos }: { fotos: FotoRemota[] }) {
  if (fotos.length === 0) return <p className="text-slate-400">Sem fotos</p>;
  return (
    <div className="grid grid-cols-3 gap-2 print:grid-cols-3">
      {fotos.map((f) => (
        <figure key={f.uuid}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={f.url} alt={f.legenda ?? "Foto do relatório"} className="h-32 w-full rounded-md object-cover print:h-40" />
          {f.legenda && <figcaption className="mt-0.5 text-xs text-slate-500">{f.legenda}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export default function RespostasView({ respostas, fotos }: { respostas: Resposta[]; fotos: FotoRemota[] }) {
  const avulsas = fotos.filter((f) => f.campoId === null);
  return (
    <dl className="space-y-4">
      {respostas.map((r) => {
        const doCampo = fotos.filter((f) => f.campoId === r.campoId);
        return (
          <div key={r.campoId} className="border-b border-slate-100 pb-3 last:border-0">
            <dt className="text-sm font-medium text-slate-500">{r.rotulo}</dt>
            <dd className="mt-1 space-y-2 text-slate-800">
              {r.tipo === "FOTO" ? (
                <GradeFotos fotos={doCampo} />
              ) : r.tipo === "ASSINATURA" && typeof r.valor === "string" && r.valor ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.valor} alt="Assinatura" className="h-24 rounded-md border border-slate-200 bg-white object-contain" />
              ) : (
                <span className="whitespace-pre-wrap">{formatarValor(r)}</span>
              )}
              {r.tipo !== "FOTO" && doCampo.length > 0 && <GradeFotos fotos={doCampo} />}
              {r.obs && (
                <p className="rounded-md bg-slate-50 p-2 text-sm text-slate-600 print:bg-transparent print:p-0 print:italic">
                  Obs.: <span className="whitespace-pre-wrap">{r.obs}</span>
                </p>
              )}
            </dd>
          </div>
        );
      })}
      {avulsas.length > 0 && (
        <div>
          <dt className="text-sm font-medium text-slate-500">Fotos adicionais</dt>
          <dd className="mt-1">
            <GradeFotos fotos={avulsas} />
          </dd>
        </div>
      )}
    </dl>
  );
}
