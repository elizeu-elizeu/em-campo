"use client";

// Renderiza o formulário a partir da definição de campos do modelo.
// Todo campo aceita fotos de evidência e uma observação livre (padrão laudo de inspeção).

import { useState } from "react";
import type { CampoDef } from "@/lib/tipos";
import AssinaturaCanvas from "./AssinaturaCanvas";

export type FotoView = { uuid: string; campoId: number | null; url: string; removivel: boolean };

type Props = {
  campos: CampoDef[];
  valores: Record<number, unknown>;
  obs: Record<number, string>;
  fotos: FotoView[];
  onValor: (campoId: number, valor: unknown) => void;
  onObs: (campoId: number, texto: string) => void;
  onAddFoto: (campoId: number | null, file: File) => void;
  onRemoveFoto: (uuid: string) => void;
};

function BotaoOpcao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-base ${
        ativo ? "border-blue-600 bg-blue-600 font-semibold text-white" : "border-slate-300 bg-white text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

export function CampoFoto({
  campoId,
  fotos,
  onAddFoto,
  onRemoveFoto,
}: {
  campoId: number | null;
  fotos: FotoView[];
  onAddFoto: Props["onAddFoto"];
  onRemoveFoto: Props["onRemoveFoto"];
}) {
  const doCampo = fotos.filter((f) => f.campoId === campoId);
  return (
    <div className="space-y-2">
      {doCampo.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {doCampo.map((f) => (
            <div key={f.uuid} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="Foto do relatório" className="h-24 w-full rounded-md object-cover" />
              {f.removivel && (
                <button
                  type="button"
                  onClick={() => onRemoveFoto(f.uuid)}
                  aria-label="Remover foto"
                  className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-red-600 text-sm font-bold text-white"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <label className="block cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-white p-3 text-center text-sm font-medium text-slate-600">
        📷 Tirar / anexar foto
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onAddFoto(campoId, file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

// Fotos de evidência + observação, ocultas atrás de links até serem usadas.
function ExtrasCampo({
  campoId,
  comFoto,
  obs,
  onObs,
  fotos,
  onAddFoto,
  onRemoveFoto,
}: {
  campoId: number;
  comFoto: boolean; // FOTO já tem a foto como controle principal
  obs: string;
  onObs: Props["onObs"];
  fotos: FotoView[];
  onAddFoto: Props["onAddFoto"];
  onRemoveFoto: Props["onRemoveFoto"];
}) {
  const [mostrarFoto, setMostrarFoto] = useState(fotos.some((f) => f.campoId === campoId));
  const [mostrarObs, setMostrarObs] = useState(Boolean(obs));

  return (
    <div className="mt-2 space-y-2">
      {comFoto && mostrarFoto && (
        <CampoFoto campoId={campoId} fotos={fotos} onAddFoto={onAddFoto} onRemoveFoto={onRemoveFoto} />
      )}
      {mostrarObs && (
        <textarea
          rows={2}
          value={obs}
          onChange={(e) => onObs(campoId, e.target.value)}
          placeholder="Observação sobre este item…"
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
        />
      )}
      {(!mostrarObs || (comFoto && !mostrarFoto)) && (
        <div className="flex gap-5 text-sm font-medium text-blue-700">
          {comFoto && !mostrarFoto && (
            <button type="button" onClick={() => setMostrarFoto(true)}>
              📷 Adicionar foto
            </button>
          )}
          {!mostrarObs && (
            <button type="button" onClick={() => setMostrarObs(true)}>
              ✎ Adicionar observação
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FormularioDinamico({ campos, valores, obs, fotos, onValor, onObs, onAddFoto, onRemoveFoto }: Props) {
  return (
    <div className="space-y-5">
      {campos.map((campo) => {
        const v = valores[campo.id];
        return (
          <div key={campo.id}>
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              {campo.rotulo}
              {campo.obrigatorio && <span className="text-red-500"> *</span>}
            </span>

            {campo.tipo === "TEXTO_CURTO" && (
              <input
                type="text"
                value={(v as string) ?? ""}
                onChange={(e) => onValor(campo.id, e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
              />
            )}

            {campo.tipo === "TEXTO_LONGO" && (
              <textarea
                rows={4}
                value={(v as string) ?? ""}
                onChange={(e) => onValor(campo.id, e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
              />
            )}

            {campo.tipo === "NUMERO" && (
              <input
                type="number"
                inputMode="decimal"
                value={(v as number | string) ?? ""}
                onChange={(e) => onValor(campo.id, e.target.value === "" ? null : Number(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white p-3 text-base"
              />
            )}

            {campo.tipo === "SIM_NAO" && (
              <div className="flex gap-2">
                <BotaoOpcao ativo={v === true} onClick={() => onValor(campo.id, v === true ? null : true)}>
                  Sim
                </BotaoOpcao>
                <BotaoOpcao ativo={v === false} onClick={() => onValor(campo.id, v === false ? null : false)}>
                  Não
                </BotaoOpcao>
              </div>
            )}

            {campo.tipo === "ESCOLHA" && (
              <div className="flex flex-wrap gap-2">
                {(campo.opcoes ?? []).map((op) =>
                  campo.multipla ? (
                    <BotaoOpcao
                      key={op}
                      ativo={Array.isArray(v) && (v as string[]).includes(op)}
                      onClick={() => {
                        const atual = Array.isArray(v) ? (v as string[]) : [];
                        onValor(
                          campo.id,
                          atual.includes(op) ? atual.filter((x) => x !== op) : [...atual, op]
                        );
                      }}
                    >
                      {op}
                    </BotaoOpcao>
                  ) : (
                    <BotaoOpcao
                      key={op}
                      ativo={v === op}
                      onClick={() => onValor(campo.id, v === op ? null : op)}
                    >
                      {op}
                    </BotaoOpcao>
                  )
                )}
              </div>
            )}

            {campo.tipo === "FOTO" && (
              <CampoFoto campoId={campo.id} fotos={fotos} onAddFoto={onAddFoto} onRemoveFoto={onRemoveFoto} />
            )}

            {campo.tipo === "ASSINATURA" && (
              <AssinaturaCanvas
                valor={(v as string) ?? null}
                onChange={(dataURL) => onValor(campo.id, dataURL)}
              />
            )}

            <ExtrasCampo
              campoId={campo.id}
              comFoto={campo.tipo !== "FOTO"}
              obs={obs[campo.id] ?? ""}
              onObs={onObs}
              fotos={fotos}
              onAddFoto={onAddFoto}
              onRemoveFoto={onRemoveFoto}
            />
          </div>
        );
      })}
    </div>
  );
}
