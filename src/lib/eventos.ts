import { prisma } from "./db";

/**
 * Registra um evento na trilha de auditoria. Nunca derruba a operação
 * principal — auditoria que falha vira log, não erro para o usuário.
 */
export async function registrarEvento(userId: number, acao: string, alvo?: string) {
  try {
    await prisma.evento.create({ data: { userId, acao, alvo: alvo ?? null } });
  } catch (e) {
    console.error("[auditoria] falha ao registrar evento:", acao, e);
  }
}
