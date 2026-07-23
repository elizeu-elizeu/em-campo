"use client";

import { useState } from "react";

export default function BotaoCopiarLink({ token }: { token: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(`${location.origin}/r/${token}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      prompt("Copie o link:", `${location.origin}/r/${token}`);
    }
  }

  return (
    <button type="button" onClick={copiar} className="btn-secundario rounded-md px-4 py-2 text-sm">
      {copiado ? "Copiado ✓" : "Copiar link"}
    </button>
  );
}
