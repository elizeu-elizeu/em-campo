import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Papel = "TECNICO" | "GESTOR";
export type SessionData = { userId?: number; nome?: string; papel?: Papel };

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

/** Exige usuário logado (e papel, se informado). Redireciona em vez de lançar. */
export async function requireUser(papel?: Papel) {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  if (papel && session.papel !== papel) {
    redirect(session.papel === "GESTOR" ? "/painel" : "/campo");
  }
  return session as { userId: number; nome: string; papel: Papel } & typeof session;
}
