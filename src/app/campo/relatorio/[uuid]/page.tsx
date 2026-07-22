"use client";

// Ver relatório já sincronizado; se DEVOLVIDO, permite corrigir (online).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import FormularioDinamico, { type FotoView } from "@/components/FormularioDinamico";
import RespostasView from "@/components/RespostasView";
import { montarRespostas, type CampoDef, type Resposta } from "@/lib/tipos";

type Detalhe = {
  uuid: string;
  modeloId: number;
  modeloNome: string;
  clienteId: number;
  clienteNome: string;
  data: string;
  status: "ENVIADO" | "DEVOLVIDO" | "APROVADO";
  comentarioGestor: string | null;
  respostas: Resposta[];
  fotos: { uuid: string; campoId: number | null; arquivo: string; legenda: string | null }[];
  modeloCampos: CampoDef[];
};

// Reconstrói a definição dos campos para correção: usa o modelo atual quando o
// campo ainda existe; senão, deriva do snapshot (campo removido continua editável).
function derivarCampos(respostas: Resposta[], modeloCampos: CampoDef[]): CampoDef[] {
  return respostas.map((r, i) => {
    const atual = modeloCampos.find((c) => c.id === r.campoId);
    if (atual) return atual;
    return {
      id: r.campoId,
      ordem: i,
      tipo: r.tipo,
      rotulo: r.rotulo,
      obrigatorio: false,
      multipla: Array.isArray(r.valor),
      opcoes:
        r.tipo === "ESCOLHA"
          ? Array.isArray(r.valor)
            ? (r.valor as string[])
            : r.valor
              ? [String(r.valor)]
              : []
          : null,
    };
  });
}

export default function VerRelatorio({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const router = useRouter();
  const [det, setDet] = useState<Detalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [corrigindo, setCorrigindo] = useState(false);
  const [valores, setValores] = useState<Record<number, unknown>>({});
  const [obsCampos, setObsCampos] = useState<Record<number, string>>({});
  const [novasFotos, setNovasFotos] = useState<{ uuid: string; campoId: number | null; file: File }[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch(`/api/meus-relatorios/${uuid}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Relatório não encontrado");
        setDet(await res.json());
      })
      .catch(() => setErro("Sem conexão — relatórios enviados só podem ser abertos online."));
  }, [uuid]);

  const campos = useMemo(() => (det ? derivarCampos(det.respostas, det.modeloCampos) : []), [det]);
  const urlsNovas = useMemo(() => new Map(novasFotos.map((f) => [f.uuid, URL.createObjectURL(f.file)])), [novasFotos]);
  useEffect(() => () => urlsNovas.forEach((u) => URL.revokeObjectURL(u)), [urlsNovas]);

  if (erro) {
    return (
      <div className="cartao p-4 text-slate-600">
        {erro}{" "}
        <Link href="/campo" className="font-medium text-marinho-claro underline">
          Voltar
        </Link>
      </div>
    );
  }
  if (!det) return null;

  function iniciarCorrecao() {
    const v: Record<number, unknown> = {};
    const o: Record<number, string> = {};
    for (const r of det!.respostas) {
      if (r.tipo !== "FOTO") v[r.campoId] = r.valor;
      if (r.obs) o[r.campoId] = r.obs;
    }
    setValores(v);
    setObsCampos(o);
    setCorrigindo(true);
  }

  async function salvarCorrecao() {
    if (!det) return;
    setSalvando(true);
    try {
      const respostas = montarRespostas({ id: det.modeloId, nome: det.modeloNome, campos }, valores, obsCampos);
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid: det.uuid,
          modeloId: det.modeloId,
          clienteId: det.clienteId,
          data: det.data,
          respostas,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      for (const f of novasFotos) {
        const fd = new FormData();
        fd.set("uuid", f.uuid);
        fd.set("relatorioUuid", det.uuid);
        if (f.campoId !== null) fd.set("campoId", String(f.campoId));
        fd.set("arquivo", f.file, "foto.jpg");
        const fres = await fetch("/api/fotos", { method: "POST", body: fd });
        if (!fres.ok) throw new Error(await fres.text());
      }
      router.replace("/campo");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao salvar correção");
      setSalvando(false);
    }
  }

  if (corrigindo) {
    const fotosView: FotoView[] = [
      ...det.fotos.map((f) => ({
        uuid: f.uuid,
        campoId: f.campoId,
        url: `/uploads/${f.arquivo}`,
        removivel: false,
      })),
      ...novasFotos.map((f) => ({
        uuid: f.uuid,
        campoId: f.campoId,
        url: urlsNovas.get(f.uuid) ?? "",
        removivel: true,
      })),
    ];
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-marinho">Corrigir: {det.modeloNome}</h1>
          {det.comentarioGestor && (
            <p className="mt-1 rounded-md bg-alerta-bg-suave p-3 text-sm text-alerta">
              Comentário do gestor: {det.comentarioGestor}
            </p>
          )}
        </div>
        <FormularioDinamico
          campos={campos}
          valores={valores}
          obs={obsCampos}
          fotos={fotosView}
          onValor={(campoId, valor) => setValores((v) => ({ ...v, [campoId]: valor }))}
          onObs={(campoId, texto) => setObsCampos((o) => ({ ...o, [campoId]: texto }))}
          onAddFoto={(campoId, file) =>
            setNovasFotos((fs) => [...fs, { uuid: crypto.randomUUID(), campoId, file }])
          }
          onRemoveFoto={(fotoUuid) => setNovasFotos((fs) => fs.filter((f) => f.uuid !== fotoUuid))}
        />
        <button
          onClick={salvarCorrecao}
          disabled={salvando}
          className="btn-primario w-full rounded-xl p-4 text-lg disabled:opacity-40"
        >
          {salvando ? "Enviando…" : "Reenviar relatório"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-marinho">{det.modeloNome}</h1>
        <p className="text-sm text-texto-sec">
          {det.clienteNome} ·{" "}
          {new Date(det.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
        </p>
      </div>

      {det.status === "DEVOLVIDO" && (
        <div className="rounded-xl bg-alerta-bg-suave p-4">
          <p className="text-sm font-semibold text-alerta">Devolvido para correção</p>
          {det.comentarioGestor && <p className="mt-1 text-sm text-alerta">{det.comentarioGestor}</p>}
          <button
            onClick={iniciarCorrecao}
            className="btn-primario mt-3 w-full rounded-lg p-3"
          >
            Corrigir agora
          </button>
        </div>
      )}

      <div className="cartao p-4">
        <RespostasView
          respostas={det.respostas}
          fotos={det.fotos.map((f) => ({
            uuid: f.uuid,
            campoId: f.campoId,
            url: `/uploads/${f.arquivo}`,
            legenda: f.legenda,
          }))}
        />
      </div>
    </div>
  );
}
