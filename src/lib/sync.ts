"use client";

// Motor de sincronização: envia rascunhos PENDENTES quando há conexão.
// Idempotente de ponta a ponta: relatório upsert por uuid, foto upsert por uuid.

import { listarRascunhos, removerRascunho, salvarCatalogo, salvarRascunho } from "./idb";
import { montarRespostas, type Rascunho, type SyncPayload } from "./tipos";

export async function atualizarCatalogo(): Promise<boolean> {
  try {
    const res = await fetch("/api/bootstrap", { cache: "no-store" });
    if (!res.ok) return false;
    const { modelos, clientes } = await res.json();
    await salvarCatalogo(modelos, clientes);
    return true;
  } catch {
    return false; // offline — segue com o catálogo local
  }
}

async function enviarRascunho(r: Rascunho): Promise<void> {
  const payload: SyncPayload = {
    uuid: r.uuid,
    modeloId: r.modelo.id,
    clienteId: r.clienteId,
    data: r.criadoEm,
    respostas: montarRespostas(r.modelo, r.valores, r.obsPorCampo ?? {}),
  };

  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.text()) || `Erro ${res.status} ao enviar relatório`);

  for (const foto of r.fotos) {
    const fd = new FormData();
    fd.set("uuid", foto.uuid);
    fd.set("relatorioUuid", r.uuid);
    if (foto.campoId !== null) fd.set("campoId", String(foto.campoId));
    if (foto.legenda) fd.set("legenda", foto.legenda);
    fd.set("arquivo", foto.blob, "foto.jpg");
    const fres = await fetch("/api/fotos", { method: "POST", body: fd });
    if (!fres.ok) throw new Error((await fres.text()) || `Erro ${fres.status} ao enviar foto`);
  }

  await removerRascunho(r.uuid);
}

/** Tenta enviar todos os pendentes. Retorna quantos foram e quantos falharam. */
export async function sincronizarPendentes(): Promise<{ enviados: number; falhas: number }> {
  let enviados = 0;
  let falhas = 0;
  const pendentes = (await listarRascunhos()).filter((r) => r.estado === "PENDENTE");
  for (const r of pendentes) {
    try {
      await enviarRascunho(r);
      enviados++;
    } catch (e) {
      falhas++;
      await salvarRascunho({ ...r, erroEnvio: e instanceof Error ? e.message : "Falha de conexão" });
    }
  }
  return { enviados, falhas };
}
