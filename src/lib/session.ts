import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

export type Papel = "TECNICO" | "GESTOR";
export type SessionData = { userId?: number; nome?: string; papel?: Papel };

if (process.env.NODE_ENV === "production" && process.env.HTTP_LOCAL === "1") {
  console.warn(
    "[EmCampo] AVISO DE SEGURANÇA: HTTP_LOCAL=1 — cookie de sessão SEM a flag secure. " +
      "Use apenas em teste local via http://; remova a variável em produção com HTTPS."
  );
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "relatorios_session",
  // 30 dias: o técnico precisa continuar logado em campo, longe de sinal
  ttl: 60 * 60 * 24 * 30,
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    // HTTP_LOCAL=1 no .env permite testar o build de produção via http://IP-local
    // (sem isso o browser rejeita o cookie secure e todo acesso volta ao login).
    // Em deploy real com HTTPS, não defina HTTP_LOCAL.
    secure: process.env.NODE_ENV === "production" && process.env.HTTP_LOCAL !== "1",
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

/**
 * Usuário da sessão REVALIDADO no banco a cada chamada: papel atual e conta ativa.
 * Desativar/rebaixar um usuário tem efeito imediato — o cookie de 30 dias sozinho
 * não dá acesso. Retorna null quando não há acesso válido.
 */
export async function getUsuarioAtivo() {
  const session = await getSession();
  if (!session.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.ativo) return null;
  return { userId: user.id, nome: user.nome, papel: user.papel as Papel };
}

/** Exige usuário logado e ativo (e papel, se informado). Redireciona em vez de lançar. */
export async function requireUser(papel?: Papel) {
  const user = await getUsuarioAtivo();
  if (!user) redirect("/login");
  if (papel && user.papel !== papel) {
    redirect(user.papel === "GESTOR" ? "/painel" : "/campo");
  }
  return user;
}
