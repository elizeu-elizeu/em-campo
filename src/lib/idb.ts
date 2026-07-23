"use client";

// Armazenamento local do técnico: catálogo (modelos/clientes), rascunhos e cache de enviados.

import { openDB, type IDBPDatabase } from "idb";
import type { AgendamentoDef, ClienteDef, ModeloDef, Rascunho, RelatorioResumo } from "./tipos";

let dbPromise: Promise<IDBPDatabase> | null = null;

function db() {
  dbPromise ??= openDB("relatorios-campo", 1, {
    upgrade(d) {
      d.createObjectStore("catalogo"); // chaves: "modelos", "clientes", "enviados"
      d.createObjectStore("rascunhos", { keyPath: "uuid" });
    },
  });
  return dbPromise;
}

export type ConfigApp = { exigirFoto: boolean };

export async function salvarCatalogo(
  modelos: ModeloDef[],
  clientes: ClienteDef[],
  config?: ConfigApp,
  agendamentos?: AgendamentoDef[]
) {
  const d = await db();
  await d.put("catalogo", modelos, "modelos");
  await d.put("catalogo", clientes, "clientes");
  if (config) await d.put("catalogo", config, "config");
  if (agendamentos) await d.put("catalogo", agendamentos, "agendamentos");
}

export async function lerAgendamentos(): Promise<AgendamentoDef[]> {
  return ((await (await db()).get("catalogo", "agendamentos")) as AgendamentoDef[] | undefined) ?? [];
}

export async function lerConfig(): Promise<ConfigApp | null> {
  return ((await (await db()).get("catalogo", "config")) as ConfigApp | undefined) ?? null;
}

export async function lerCatalogo(): Promise<{ modelos: ModeloDef[]; clientes: ClienteDef[] } | null> {
  const d = await db();
  const modelos = (await d.get("catalogo", "modelos")) as ModeloDef[] | undefined;
  const clientes = (await d.get("catalogo", "clientes")) as ClienteDef[] | undefined;
  return modelos && clientes ? { modelos, clientes } : null;
}

export async function salvarEnviadosCache(lista: RelatorioResumo[]) {
  await (await db()).put("catalogo", lista, "enviados");
}

export async function lerEnviadosCache(): Promise<RelatorioResumo[]> {
  return ((await (await db()).get("catalogo", "enviados")) as RelatorioResumo[] | undefined) ?? [];
}

export async function salvarRascunho(r: Rascunho) {
  await (await db()).put("rascunhos", r);
}

export async function lerRascunho(uuid: string): Promise<Rascunho | undefined> {
  return (await db()).get("rascunhos", uuid) as Promise<Rascunho | undefined>;
}

export async function listarRascunhos(): Promise<Rascunho[]> {
  const todos = (await (await db()).getAll("rascunhos")) as Rascunho[];
  return todos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function removerRascunho(uuid: string) {
  await (await db()).delete("rascunhos", uuid);
}

/** Fecha a conexão — necessário antes de deleteDatabase (logout). */
export async function fecharDb() {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = null;
  }
}
