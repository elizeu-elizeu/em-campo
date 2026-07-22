"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { lerEnviadosCache, listarRascunhos, salvarEnviadosCache } from "@/lib/idb";
import type { Rascunho, RelatorioResumo } from "@/lib/tipos";

const CHIP: Record<RelatorioResumo["status"], string> = {
  ENVIADO: "bg-blue-100 text-blue-800",
  DEVOLVIDO: "bg-amber-100 text-amber-800",
  APROVADO: "bg-green-100 text-green-800",
};
const NOME_STATUS: Record<RelatorioResumo["status"], string> = {
  ENVIADO: "Enviado",
  DEVOLVIDO: "Devolvido",
  APROVADO: "Aprovado",
};

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export default function CampoHome() {
  const [rascunhos, setRascunhos] = useState<Rascunho[]>([]);
  const [enviados, setEnviados] = useState<RelatorioResumo[]>([]);

  const carregar = useCallback(async () => {
    setRascunhos(await listarRascunhos());
    try {
      const res = await fetch("/api/meus-relatorios", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const lista: RelatorioResumo[] = await res.json();
      setEnviados(lista);
      await salvarEnviadosCache(lista);
    } catch {
      setEnviados(await lerEnviadosCache()); // offline: última lista conhecida
    }
  }, []);

  useEffect(() => {
    carregar();
    window.addEventListener("sync-concluido", carregar);
    return () => window.removeEventListener("sync-concluido", carregar);
  }, [carregar]);

  return (
    <div className="space-y-6">
      <Link
        href="/campo/novo"
        className="block rounded-xl bg-blue-600 p-4 text-center text-lg font-semibold text-white shadow active:bg-blue-700"
      >
        + Novo relatório
      </Link>

      {rascunhos.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">No aparelho</h2>
          <ul className="space-y-2">
            {rascunhos.map((r) => (
              <li key={r.uuid}>
                <Link
                  href={`/campo/rascunho/${r.uuid}`}
                  className="block rounded-xl bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{r.modelo.nome}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.estado === "PENDENTE" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {r.estado === "PENDENTE" ? "Aguardando envio" : "Rascunho"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {r.clienteNome} · {dataCurta(r.criadoEm)}
                  </p>
                  {r.erroEnvio && <p className="mt-1 text-xs text-red-600">Falha no envio: {r.erroEnvio}</p>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">Enviados</h2>
        {enviados.length === 0 ? (
          <p className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
            Nenhum relatório enviado ainda.
          </p>
        ) : (
          <ul className="space-y-2">
            {enviados.map((r) => (
              <li key={r.uuid}>
                <Link
                  href={`/campo/relatorio/${r.uuid}`}
                  className="block rounded-xl bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{r.modeloNome}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CHIP[r.status]}`}>
                      {NOME_STATUS[r.status]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {r.clienteNome} · {dataCurta(r.data)}
                  </p>
                  {r.status === "DEVOLVIDO" && r.comentarioGestor && (
                    <p className="mt-1 text-sm text-amber-700">Gestor: {r.comentarioGestor}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
