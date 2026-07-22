"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { lerCatalogo, salvarRascunho } from "@/lib/idb";
import { atualizarCatalogo } from "@/lib/sync";
import type { ClienteDef, ModeloDef } from "@/lib/tipos";

export default function NovoRelatorio() {
  const router = useRouter();
  const [modelos, setModelos] = useState<ModeloDef[]>([]);
  const [clientes, setClientes] = useState<ClienteDef[]>([]);
  const [semCatalogo, setSemCatalogo] = useState(false);
  const [modeloId, setModeloId] = useState<number | "">("");
  const [clienteId, setClienteId] = useState<number | "">("");

  useEffect(() => {
    (async () => {
      let cat = await lerCatalogo();
      if (!cat) {
        await atualizarCatalogo();
        cat = await lerCatalogo();
      }
      if (!cat || cat.modelos.length === 0) {
        setSemCatalogo(true);
        return;
      }
      setModelos(cat.modelos);
      setClientes(cat.clientes);
    })();
  }, []);

  async function criar() {
    const modelo = modelos.find((m) => m.id === modeloId);
    const cliente = clientes.find((c) => c.id === clienteId);
    if (!modelo || !cliente) return;
    const uuid = crypto.randomUUID();
    await salvarRascunho({
      uuid,
      modelo, // snapshot: edição futura do modelo não afeta este rascunho
      clienteId: cliente.id,
      clienteNome: cliente.nome,
      criadoEm: new Date().toISOString(),
      valores: {},
      fotos: [],
      estado: "RASCUNHO",
    });
    router.replace(`/campo/rascunho/${uuid}`);
  }

  if (semCatalogo) {
    return (
      <p className="rounded-xl bg-white p-4 text-slate-600 shadow-sm">
        Ainda não há modelos no aparelho. Conecte-se à internet uma vez para baixá-los
        (e peça ao gestor para cadastrar um modelo, se ainda não houver).
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-slate-800">Novo relatório</h1>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Tipo de serviço</span>
        <select
          value={modeloId}
          onChange={(e) => setModeloId(e.target.value ? Number(e.target.value) : "")}
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
        >
          <option value="">Escolha o modelo…</option>
          {modelos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Cliente</span>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : "")}
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
        >
          <option value="">Escolha o cliente…</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={criar}
        disabled={!modeloId || !clienteId}
        className="w-full rounded-xl bg-laranja p-4 text-lg font-semibold text-white disabled:opacity-40 active:bg-laranja-escuro"
      >
        Começar a preencher
      </button>
    </div>
  );
}
