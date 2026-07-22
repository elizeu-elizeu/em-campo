"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import FormularioDinamico, { CampoFoto, type FotoView } from "@/components/FormularioDinamico";
import { lerConfig, lerRascunho, removerRascunho, salvarRascunho } from "@/lib/idb";
import { sincronizarPendentes } from "@/lib/sync";
import { camposFaltando, type Rascunho } from "@/lib/tipos";

export default function EditarRascunho({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = use(params);
  const router = useRouter();
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [urls, setUrls] = useState<Map<string, string>>(new Map());
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    lerRascunho(uuid).then((r) => (r ? setRascunho(r) : setNaoEncontrado(true)));
  }, [uuid]);

  // URLs de preview dos blobs locais
  useEffect(() => {
    if (!rascunho) return;
    const m = new Map(rascunho.fotos.map((f) => [f.uuid, URL.createObjectURL(f.blob)]));
    setUrls(m);
    return () => m.forEach((u) => URL.revokeObjectURL(u));
  }, [rascunho]);

  if (naoEncontrado) {
    return (
      <div className="cartao p-4 text-slate-600">
        Rascunho não encontrado — provavelmente já foi enviado.{" "}
        <Link href="/campo" className="font-medium text-marinho-claro underline">
          Voltar
        </Link>
      </div>
    );
  }
  if (!rascunho) return null;

  if (rascunho.estado === "PENDENTE") {
    return (
      <div className="cartao space-y-3 p-4">
        <p className="text-slate-700">
          Este relatório está <strong>aguardando envio</strong> — será sincronizado assim que houver
          conexão.
        </p>
        {rascunho.erroEnvio && <p className="text-sm text-red-600">Última tentativa: {rascunho.erroEnvio}</p>}
        <Link href="/campo" className="inline-block font-medium text-marinho-claro underline">
          Voltar
        </Link>
      </div>
    );
  }

  function persistir(r: Rascunho) {
    setRascunho(r);
    salvarRascunho(r); // grava a cada alteração — nada se perde se o app fechar
  }

  const fotosView: FotoView[] = rascunho.fotos.map((f) => ({
    uuid: f.uuid,
    campoId: f.campoId,
    url: urls.get(f.uuid) ?? "",
    removivel: true,
  }));

  async function enviar() {
    const r = rascunho!;
    const faltando = camposFaltando(r.modelo, r.valores, r.fotos);
    if (faltando.length > 0) {
      setErro(`Preencha os campos obrigatórios: ${faltando.join(", ")}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    // Parametrização da empresa: foto obrigatória em todo relatório
    const config = await lerConfig();
    if (config?.exigirFoto && r.fotos.length === 0) {
      setErro("A empresa exige ao menos uma foto por relatório.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    persistir({ ...r, estado: "PENDENTE", erroEnvio: undefined });
    window.dispatchEvent(new Event("sync-local-mudou"));
    await sincronizarPendentes().catch(() => {});
    window.dispatchEvent(new Event("sync-local-mudou"));
    router.replace("/campo");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-marinho">{rascunho.modelo.nome}</h1>
        <p className="text-sm text-slate-500">{rascunho.clienteNome}</p>
      </div>

      {erro && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{erro}</p>}

      <FormularioDinamico
        campos={rascunho.modelo.campos}
        valores={rascunho.valores}
        obs={rascunho.obsPorCampo ?? {}}
        fotos={fotosView}
        onValor={(campoId, valor) =>
          persistir({ ...rascunho, valores: { ...rascunho.valores, [campoId]: valor } })
        }
        onObs={(campoId, texto) =>
          persistir({ ...rascunho, obsPorCampo: { ...(rascunho.obsPorCampo ?? {}), [campoId]: texto } })
        }
        onAddFoto={(campoId, file) =>
          persistir({
            ...rascunho,
            fotos: [...rascunho.fotos, { uuid: crypto.randomUUID(), campoId, blob: file }],
          })
        }
        onRemoveFoto={(fotoUuid) =>
          persistir({ ...rascunho, fotos: rascunho.fotos.filter((f) => f.uuid !== fotoUuid) })
        }
      />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">Fotos adicionais</span>
        <CampoFoto
          campoId={null}
          fotos={fotosView}
          onAddFoto={(campoId, file) =>
            persistir({
              ...rascunho,
              fotos: [...rascunho.fotos, { uuid: crypto.randomUUID(), campoId, blob: file }],
            })
          }
          onRemoveFoto={(fotoUuid) =>
            persistir({ ...rascunho, fotos: rascunho.fotos.filter((f) => f.uuid !== fotoUuid) })
          }
        />
      </div>

      <div className="space-y-3 pt-2">
        <button
          onClick={enviar}
          className="btn-primario w-full rounded-xl p-4 text-lg"
        >
          Enviar relatório
        </button>
        <button
          onClick={async () => {
            if (confirm("Excluir este rascunho? As respostas e fotos serão perdidas.")) {
              await removerRascunho(rascunho.uuid);
              window.dispatchEvent(new Event("sync-local-mudou"));
              router.replace("/campo");
            }
          }}
          className="w-full p-2 text-sm font-medium text-red-600"
        >
          Excluir rascunho
        </button>
      </div>
    </div>
  );
}
