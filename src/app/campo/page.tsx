"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { lerEnviadosCache, listarRascunhos, salvarEnviadosCache } from "@/lib/idb";
import type { Rascunho, RelatorioResumo } from "@/lib/tipos";

const CHIP: Record<RelatorioResumo["status"], string> = {
  ENVIADO: "bg-info-bg text-info",
  DEVOLVIDO: "bg-alerta-bg text-alerta",
  APROVADO: "bg-ok-bg text-ok",
};
const BORDA: Record<RelatorioResumo["status"], string> = {
  ENVIADO: "border-info",
  DEVOLVIDO: "border-alerta",
  APROVADO: "border-ok",
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
        className="btn-primario block rounded-xl p-4 text-center text-lg"
      >
        + Novo relatório
      </Link>

      {rascunhos.length > 0 && (
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">No aparelho</h2>
          <ul className="space-y-2">
            {rascunhos.map((r) => (
              <li key={r.uuid}>
                <Link
                  href={`/campo/rascunho/${r.uuid}`}
                  className={`cartao block border-l-4 p-4 ${
                    r.estado === "PENDENTE" ? "border-espera" : "border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{r.modelo.nome}</span>
                    <span
                      className={`chip ${
                        r.estado === "PENDENTE" ? "bg-espera-bg text-espera" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {r.estado === "PENDENTE" ? "Aguardando envio" : "Rascunho"}
                    </span>
                  </div>
                  <p className="text-sm text-texto-sec">
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
        <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-texto-sec">Enviados</h2>
        {enviados.length === 0 ? (
          <div className="cartao p-4 text-sm text-slate-500">
            <p>Nenhum relatório enviado ainda.</p>
            <p className="mt-1 text-xs text-slate-400">Toque em + Novo relatório para começar.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {enviados.map((r) => (
              <li key={r.uuid}>
                <Link
                  href={`/campo/relatorio/${r.uuid}`}
                  className={`cartao block border-l-4 p-4 ${BORDA[r.status]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{r.modeloNome}</span>
                    <span className={`chip ${CHIP[r.status]}`}>
                      {NOME_STATUS[r.status]}
                    </span>
                  </div>
                  <p className="text-sm text-texto-sec">
                    {r.clienteNome} · {dataCurta(r.data)}
                  </p>
                  {r.status === "DEVOLVIDO" && r.comentarioGestor && (
                    <p className="mt-1 rounded-md bg-alerta-bg-suave p-2 text-sm text-alerta">Gestor: {r.comentarioGestor}</p>
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
