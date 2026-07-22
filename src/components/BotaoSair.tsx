"use client";

// Sair limpa TUDO que ficou no aparelho (Cache Storage + IndexedDB) antes de
// destruir a sessão — em aparelho compartilhado, o próximo usuário não herda
// relatórios, fotos nem rascunhos do anterior.

import { logout } from "@/lib/actions";
import { fecharDb, listarRascunhos } from "@/lib/idb";

export default function BotaoSair() {
  async function sair() {
    try {
      const rascunhos = await listarRascunhos();
      if (
        rascunhos.length > 0 &&
        !confirm(
          `Há ${rascunhos.length} rascunho(s) não enviado(s) neste aparelho — sair vai apagá-los. Continuar?`
        )
      ) {
        return;
      }
    } catch {
      // sem IndexedDB acessível — segue com a saída
    }

    try {
      const chaves = await caches.keys();
      await Promise.all(chaves.map((c) => caches.delete(c)));
    } catch {}
    try {
      await fecharDb();
      await new Promise<void>((res) => {
        const req = indexedDB.deleteDatabase("relatorios-campo");
        req.onsuccess = req.onerror = req.onblocked = () => res();
      });
    } catch {}

    await logout();
  }

  return (
    <button onClick={sair} className="text-sm underline">
      Sair
    </button>
  );
}
