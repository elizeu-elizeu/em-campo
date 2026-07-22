"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getSession, requireUser } from "./session";
import { TIPOS_CAMPO, type TipoCampo } from "./tipos";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  const user = email && senha ? await prisma.user.findUnique({ where: { email } }) : null;
  if (!user || !user.ativo || !bcrypt.compareSync(senha, user.senha)) {
    redirect("/login?erro=1");
  }

  const session = await getSession();
  session.userId = user.id;
  session.nome = user.nome;
  session.papel = user.papel as "TECNICO" | "GESTOR";
  await session.save();

  redirect(user.papel === "GESTOR" ? "/painel" : "/campo");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/login");
}

// ---------- Modelos (gestor) ----------

export async function criarModelo(formData: FormData) {
  await requireUser("GESTOR");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 200);
  if (!nome) redirect("/painel/modelos");
  const modelo = await prisma.modelo.create({ data: { nome } });
  revalidatePath("/painel/modelos");
  redirect(`/painel/modelos/${modelo.id}`);
}

export async function renomearModelo(formData: FormData) {
  await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 200);
  if (Number.isInteger(id) && nome) {
    await prisma.modelo.update({ where: { id }, data: { nome } });
  }
  revalidatePath(`/painel/modelos/${id}`);
}

export async function alternarModeloAtivo(formData: FormData) {
  await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const modelo = await prisma.modelo.findUnique({ where: { id } });
  if (modelo) await prisma.modelo.update({ where: { id }, data: { ativo: !modelo.ativo } });
  revalidatePath("/painel/modelos");
  revalidatePath(`/painel/modelos/${id}`);
}

export async function adicionarCampo(formData: FormData) {
  await requireUser("GESTOR");
  const modeloId = Number(formData.get("modeloId"));
  const tipo = String(formData.get("tipo") ?? "");
  const rotulo = String(formData.get("rotulo") ?? "").trim().slice(0, 500);
  const obrigatorio = formData.get("obrigatorio") === "on";
  const multipla = formData.get("multipla") === "on";
  const opcoes = String(formData.get("opcoes") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (!Number.isInteger(modeloId) || !rotulo || !TIPOS_CAMPO.includes(tipo as TipoCampo)) {
    redirect(`/painel/modelos/${modeloId}`);
  }
  if (tipo === "ESCOLHA" && opcoes.length === 0) redirect(`/painel/modelos/${modeloId}?erro=opcoes`);

  const ultima = await prisma.campo.aggregate({ where: { modeloId }, _max: { ordem: true } });
  await prisma.campo.create({
    data: {
      modeloId,
      tipo,
      rotulo,
      obrigatorio,
      multipla: tipo === "ESCOLHA" && multipla,
      opcoes: tipo === "ESCOLHA" ? JSON.stringify(opcoes) : null,
      ordem: (ultima._max.ordem ?? -1) + 1,
    },
  });
  revalidatePath(`/painel/modelos/${modeloId}`);
}

export async function removerCampo(formData: FormData) {
  await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const campo = await prisma.campo.findUnique({ where: { id } });
  if (campo) await prisma.campo.delete({ where: { id } }); // relatórios têm snapshot — nada quebra
  revalidatePath(`/painel/modelos/${campo?.modeloId}`);
}

export async function moverCampo(formData: FormData) {
  await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const direcao = String(formData.get("direcao"));
  const campo = await prisma.campo.findUnique({ where: { id } });
  if (!campo) return;
  const vizinho = await prisma.campo.findFirst({
    where: {
      modeloId: campo.modeloId,
      ordem: direcao === "subir" ? { lt: campo.ordem } : { gt: campo.ordem },
    },
    orderBy: { ordem: direcao === "subir" ? "desc" : "asc" },
  });
  if (vizinho) {
    await prisma.$transaction([
      prisma.campo.update({ where: { id: campo.id }, data: { ordem: vizinho.ordem } }),
      prisma.campo.update({ where: { id: vizinho.id }, data: { ordem: campo.ordem } }),
    ]);
  }
  revalidatePath(`/painel/modelos/${campo.modeloId}`);
}

// ---------- Clientes e usuários (gestor) ----------

export async function criarCliente(formData: FormData) {
  await requireUser("GESTOR");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 200);
  const endereco = String(formData.get("endereco") ?? "").trim().slice(0, 500) || null;
  const contato = String(formData.get("contato") ?? "").trim().slice(0, 200) || null;
  if (nome) await prisma.cliente.create({ data: { nome, endereco, contato } });
  revalidatePath("/painel/clientes");
}

export async function criarUsuario(formData: FormData) {
  await requireUser("GESTOR");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const senha = String(formData.get("senha") ?? "");
  const papel = String(formData.get("papel") ?? "");
  if (!nome || !email.includes("@") || senha.length < 6 || !["TECNICO", "GESTOR"].includes(papel)) {
    redirect("/painel/usuarios?erro=dados");
  }
  try {
    await prisma.user.create({ data: { nome, email, senha: bcrypt.hashSync(senha, 10), papel } });
  } catch {
    redirect("/painel/usuarios?erro=email"); // e-mail já cadastrado
  }
  revalidatePath("/painel/usuarios");
}

export async function alternarUsuarioAtivo(formData: FormData) {
  const session = await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  if (id === session.userId) redirect("/painel/usuarios"); // não se auto-desativa
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) await prisma.user.update({ where: { id }, data: { ativo: !user.ativo } });
  revalidatePath("/painel/usuarios");
}

// ---------- Revisão de relatórios (gestor) ----------

export async function aprovarRelatorio(formData: FormData) {
  await requireUser("GESTOR");
  const uuid = String(formData.get("uuid") ?? "");
  await prisma.relatorio.updateMany({
    where: { uuid, status: { in: ["ENVIADO", "DEVOLVIDO"] } },
    data: { status: "APROVADO" },
  });
  revalidatePath("/painel");
  revalidatePath(`/painel/relatorio/${uuid}`);
}

export async function devolverRelatorio(formData: FormData) {
  await requireUser("GESTOR");
  const uuid = String(formData.get("uuid") ?? "");
  const comentario = String(formData.get("comentario") ?? "").trim().slice(0, 2000);
  if (!comentario) redirect(`/painel/relatorio/${uuid}?erro=comentario`);
  await prisma.relatorio.updateMany({
    where: { uuid, status: "ENVIADO" },
    data: { status: "DEVOLVIDO", comentarioGestor: comentario },
  });
  revalidatePath("/painel");
  revalidatePath(`/painel/relatorio/${uuid}`);
}
