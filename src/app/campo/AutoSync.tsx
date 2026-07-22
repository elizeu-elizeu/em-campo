"use client";

// Sincroniza automaticamente: ao abrir o app, ao voltar a conexão e quando um
// rascunho vira PENDENTE (evento "sync-local-mudou"). Mostra estado no header.

import { useCallback, useEffect, useState } from "react";
import { listarRascunhos } from "@/lib/idb";
import { atualizarCatalogo, sincronizarPendentes } from "@/lib/sync";

export default function AutoSync() {
  const [online, setOnline] = useState(true);
  const [pendentes, setPendentes] = useState(0);

  const rodar = useCallback(async () => {
    setOnline(navigator.onLine);
    if (navigator.onLine) {
      await atualizarCatalogo();
      const { enviados } = await sincronizarPendentes();
      if (enviados > 0) window.dispatchEvent(new Event("sync-concluido"));
    }
    setPendentes((await listarRascunhos()).filter((r) => r.estado === "PENDENTE").length);
  }, []);

  useEffect(() => {
    rodar();
    window.addEventListener("online", rodar);
    window.addEventListener("offline", rodar);
    window.addEventListener("sync-local-mudou", rodar);
    return () => {
      window.removeEventListener("online", rodar);
      window.removeEventListener("offline", rodar);
      window.removeEventListener("sync-local-mudou", rodar);
    };
  }, [rodar]);

  return (
    <span className="flex items-center gap-1.5 text-xs" title={online ? "Conectado" : "Sem conexão"}>
      <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-green-400" : "bg-slate-400"}`} />
      {online ? "online" : "offline"}
      {pendentes > 0 && (
        <span className="rounded-full bg-amber-400 px-1.5 font-semibold text-amber-950">
          {pendentes} p/ enviar
        </span>
      )}
    </span>
  );
}
