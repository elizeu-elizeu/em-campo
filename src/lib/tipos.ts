// Tipos compartilhados entre servidor e cliente offline.

export const TIPOS_CAMPO = [
  "TEXTO_CURTO",
  "TEXTO_LONGO",
  "NUMERO",
  "SIM_NAO",
  "ESCOLHA",
  "FOTO",
  "ASSINATURA",
] as const;

export type TipoCampo = (typeof TIPOS_CAMPO)[number];

export const ROTULO_TIPO: Record<TipoCampo, string> = {
  TEXTO_CURTO: "Texto curto",
  TEXTO_LONGO: "Texto longo",
  NUMERO: "Número",
  SIM_NAO: "Sim/Não",
  ESCOLHA: "Múltipla escolha",
  FOTO: "Foto",
  ASSINATURA: "Assinatura",
};

export type CampoDef = {
  id: number;
  ordem: number;
  tipo: TipoCampo;
  rotulo: string;
  obrigatorio: boolean;
  opcoes: string[] | null;
  multipla: boolean;
};

export type ModeloDef = { id: number; nome: string; campos: CampoDef[] };
export type ClienteDef = { id: number; nome: string; endereco: string | null };

// valor: string | number | boolean | string[] (ESCOLHA multipla) | null (FOTO fica null; fotos são entidades próprias)
// obs: observação livre do técnico sobre o item; fotos de evidência ficam em Foto.campoId (qualquer tipo de campo)
export type Resposta = { campoId: number; rotulo: string; tipo: TipoCampo; valor: unknown; obs?: string | null };

export type FotoLocal = { uuid: string; campoId: number | null; blob: Blob; legenda?: string };

// Rascunho local: guarda o SNAPSHOT do modelo — edição posterior do modelo não quebra o rascunho.
export type Rascunho = {
  uuid: string;
  modelo: ModeloDef;
  clienteId: number;
  clienteNome: string;
  criadoEm: string; // ISO
  valores: Record<number, unknown>; // campoId -> valor
  obsPorCampo?: Record<number, string>; // campoId -> observação (opcional; rascunhos antigos não têm)
  fotos: FotoLocal[];
  estado: "RASCUNHO" | "PENDENTE";
  erroEnvio?: string;
};

export type SyncPayload = {
  uuid: string;
  modeloId: number;
  clienteId: number;
  data: string; // ISO
  respostas: Resposta[];
};

export type RelatorioResumo = {
  uuid: string;
  modeloNome: string;
  clienteNome: string;
  data: string;
  status: "ENVIADO" | "DEVOLVIDO" | "APROVADO";
  comentarioGestor: string | null;
};

/** Monta o snapshot de respostas a partir do modelo + valores preenchidos. */
export function montarRespostas(
  modelo: ModeloDef,
  valores: Record<number, unknown>,
  obsPorCampo: Record<number, string> = {}
): Resposta[] {
  return modelo.campos.map((c) => ({
    campoId: c.id,
    rotulo: c.rotulo,
    tipo: c.tipo,
    valor: c.tipo === "FOTO" ? null : (valores[c.id] ?? null),
    obs: obsPorCampo[c.id]?.trim() || null,
  }));
}

/** Campos obrigatórios sem resposta (FOTO exige ao menos uma foto do campo). */
export function camposFaltando(
  modelo: ModeloDef,
  valores: Record<number, unknown>,
  fotos: { campoId: number | null }[]
): string[] {
  return modelo.campos
    .filter((c) => {
      if (!c.obrigatorio) return false;
      if (c.tipo === "FOTO") return !fotos.some((f) => f.campoId === c.id);
      const v = valores[c.id];
      if (v === undefined || v === null || v === "") return true;
      if (Array.isArray(v) && v.length === 0) return true;
      return false;
    })
    .map((c) => c.rotulo);
}
