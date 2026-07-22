import { redirect } from "next/navigation";
import { getUsuarioAtivo } from "@/lib/session";

export default async function Home() {
  const user = await getUsuarioAtivo();
  if (!user) redirect("/login");
  redirect(user.papel === "GESTOR" ? "/painel" : "/campo");
}
