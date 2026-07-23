"use server";

import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { registrarEvento } from "./eventos";
import { extPorConteudo } from "./imagem";
import { getSession, requireUser } from "./session";
import { TIPOS_CAMPO, type TipoCampo } from "./tipos";

// Proteção contra força bruta no login.
// ponytail: contador em memória, por processo — trocar por tabela se rodar múltiplas instâncias
const tentativasLogin = new Map<string, { falhas: number; bloqueadoAte: number }>();
const MAX_FALHAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;
// Compara contra hash dummy quando o e-mail não existe — sem diferença de timing
const HASH_DUMMY = bcrypt.hashSync("senha-que-nunca-bate", 10);

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  const tentativa = tentativasLogin.get(email);
  if (tentativa && tentativa.bloqueadoAte > Date.now()) redirect("/login?erro=bloqueado");

  const user = email && senha ? await prisma.user.findUnique({ where: { email } }) : null;
  const senhaOk = await bcrypt.compare(senha, user?.senha ?? HASH_DUMMY);
  if (!user || !user.ativo || !senhaOk) {
    const falhas = (tentativa?.falhas ?? 0) + 1;
    tentativasLogin.set(email, {
      falhas,
      bloqueadoAte: falhas >= MAX_FALHAS ? Date.now() + BLOQUEIO_MS : 0,
    });
    redirect("/login?erro=1");
  }
  tentativasLogin.delete(email);

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

export async function criarModeloPronto(formData: FormData) {
  await requireUser("GESTOR");
  const slug = String(formData.get("slug") ?? "");
  const { MODELOS_PRONTOS } = await import("./modelos-prontos");
  const pronto = MODELOS_PRONTOS.find((m) => m.slug === slug);
  if (!pronto) redirect("/painel/modelos");
  const modelo = await prisma.modelo.create({
    data: {
      nome: pronto.nome,
      campos: {
        create: pronto.campos.map((c, i) => ({
          ordem: i,
          tipo: c.tipo,
          rotulo: c.rotulo,
          obrigatorio: c.obrigatorio ?? false,
          multipla: c.multipla ?? false,
          noCabecalho: c.noCabecalho ?? false,
          opcoes: c.opcoes ? JSON.stringify(c.opcoes) : null,
        })),
      },
    },
  });
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
  const noCabecalho = formData.get("noCabecalho") === "on";
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
      noCabecalho,
      ordem: (ultima._max.ordem ?? -1) + 1,
    },
  });
  revalidatePath(`/painel/modelos/${modeloId}`);
}

export async function alternarCampoObrigatorio(formData: FormData) {
  await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const campo = await prisma.campo.findUnique({ where: { id } });
  if (campo) await prisma.campo.update({ where: { id }, data: { obrigatorio: !campo.obrigatorio } });
  revalidatePath(`/painel/modelos/${campo?.modeloId}`);
}

export async function alternarCampoCabecalho(formData: FormData) {
  await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const campo = await prisma.campo.findUnique({ where: { id } });
  if (campo) await prisma.campo.update({ where: { id }, data: { noCabecalho: !campo.noCabecalho } });
  revalidatePath(`/painel/modelos/${campo?.modeloId}`);
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

// ---------- Empresa (gestor) ----------

export async function salvarEmpresa(formData: FormData) {
  await requireUser("GESTOR");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 200);
  if (!nome) redirect("/painel/empresa?erro=nome");

  // Logo opcional: mesmo padrão de nome (uuid.ext) servido por /uploads/[nome]
  let logo: string | undefined;
  const arquivo = formData.get("logo");
  if (arquivo instanceof File && arquivo.size > 0) {
    if (arquivo.size > 2 * 1024 * 1024) redirect("/painel/empresa?erro=logo");
    // Tipo verificado pelos bytes reais, não pelo Content-Type declarado
    const conteudo = Buffer.from(await arquivo.arrayBuffer());
    const ext = extPorConteudo(conteudo);
    if (!ext) redirect("/painel/empresa?erro=logo");
    logo = `${crypto.randomUUID()}.${ext}`;
    // Fora de public/ — em public/ o Next serviria estático, pulando a autorização de /uploads/[nome]
    const dir = path.join(process.cwd(), "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, logo), conteudo);
  }

  const dados = {
    nome,
    cnpj: String(formData.get("cnpj") ?? "").trim().slice(0, 30) || null,
    telefone: String(formData.get("telefone") ?? "").trim().slice(0, 50) || null,
    email: String(formData.get("email") ?? "").trim().slice(0, 200) || null,
    endereco: String(formData.get("endereco") ?? "").trim().slice(0, 500) || null,
    ...(logo ? { logo } : {}),
  };
  await prisma.empresa.upsert({ where: { id: 1 }, create: { id: 1, ...dados }, update: dados });
  revalidatePath("/painel/empresa");
}

export async function salvarConfig(formData: FormData) {
  await requireUser("GESTOR");
  const dados = {
    usarNomeEmpresa: formData.get("usarNomeEmpresa") === "on",
    exigirFoto: formData.get("exigirFoto") === "on",
  };
  await prisma.config.upsert({ where: { id: 1 }, create: { id: 1, ...dados }, update: dados });
  revalidatePath("/painel/parametrizacoes");
  revalidatePath("/campo");
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
  const gestorAtual = await requireUser("GESTOR");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 200);
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const senha = String(formData.get("senha") ?? "");
  const papel = String(formData.get("papel") ?? "");
  if (!nome || !email.includes("@") || senha.length < 8 || !["TECNICO", "GESTOR"].includes(papel)) {
    redirect("/painel/usuarios?erro=dados");
  }
  const hash = await bcrypt.hash(senha, 10);
  try {
    await prisma.user.create({ data: { nome, email, senha: hash, papel } });
  } catch {
    redirect("/painel/usuarios?erro=email"); // e-mail já cadastrado
  }
  await registrarEvento(gestorAtual.userId, "criou usuário", `${nome} (${papel.toLowerCase()})`);
  revalidatePath("/painel/usuarios");
}

export async function alternarUsuarioAtivo(formData: FormData) {
  const session = await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  if (id === session.userId) redirect("/painel/usuarios"); // não se auto-desativa
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) {
    await prisma.user.update({ where: { id }, data: { ativo: !user.ativo } });
    await registrarEvento(session.userId, user.ativo ? "desativou usuário" : "reativou usuário", user.nome);
  }
  revalidatePath("/painel/usuarios");
}

export async function alternarPapel(formData: FormData) {
  const session = await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  if (id === session.userId) redirect("/painel/usuarios"); // não rebaixa a si mesmo
  const user = await prisma.user.findUnique({ where: { id } });
  if (user) {
    const novoPapel = user.papel === "GESTOR" ? "TECNICO" : "GESTOR";
    await prisma.user.update({ where: { id }, data: { papel: novoPapel } });
    await registrarEvento(session.userId, "alterou papel", `${user.nome} → ${novoPapel.toLowerCase()}`);
  }
  revalidatePath("/painel/usuarios");
}

export async function redefinirSenha(formData: FormData) {
  const gestor = await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const senha = String(formData.get("senha") ?? "");
  if (!Number.isInteger(id) || senha.length < 8) redirect("/painel/usuarios?erro=dados");
  const alvo = await prisma.user.findUnique({ where: { id } });
  await prisma.user.update({ where: { id }, data: { senha: await bcrypt.hash(senha, 10) } });
  await registrarEvento(gestor.userId, "redefiniu senha", alvo?.nome ?? `usuário ${id}`);
  revalidatePath("/painel/usuarios");
}

// ---------- Agenda (gestor) ----------

export async function criarAgendamento(formData: FormData) {
  const user = await requireUser("GESTOR");
  const clienteId = Number(formData.get("clienteId"));
  const modeloId = Number(formData.get("modeloId"));
  const tecnicoId = Number(formData.get("tecnicoId"));
  const data = new Date(String(formData.get("data") ?? ""));
  const observacao = String(formData.get("observacao") ?? "").trim().slice(0, 500) || null;

  if (!Number.isInteger(clienteId) || !Number.isInteger(modeloId) || !Number.isInteger(tecnicoId) || isNaN(data.getTime())) {
    redirect("/painel/agenda?erro=dados");
  }
  const [cliente, modelo, tecnico] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: clienteId } }),
    prisma.modelo.findUnique({ where: { id: modeloId } }),
    prisma.user.findUnique({ where: { id: tecnicoId } }),
  ]);
  if (!cliente || !modelo || !tecnico || tecnico.papel !== "TECNICO" || !tecnico.ativo) {
    redirect("/painel/agenda?erro=dados");
  }

  await prisma.agendamento.create({ data: { clienteId, modeloId, tecnicoId, data, observacao } });
  await registrarEvento(user.userId, "agendou serviço", `${modelo.nome} · ${cliente.nome} · ${tecnico.nome}`);
  revalidatePath("/painel/agenda");
}

export async function cancelarAgendamento(formData: FormData) {
  const user = await requireUser("GESTOR");
  const id = Number(formData.get("id"));
  const ag = await prisma.agendamento.findUnique({ where: { id }, include: { cliente: true, modelo: true } });
  if (ag && ag.status === "ABERTO") {
    await prisma.agendamento.update({ where: { id }, data: { status: "CANCELADO" } });
    await registrarEvento(user.userId, "cancelou agendamento", `${ag.modelo.nome} · ${ag.cliente.nome}`);
  }
  revalidatePath("/painel/agenda");
}

// ---------- Conta própria (qualquer papel) ----------

export async function trocarMinhaSenha(formData: FormData) {
  const user = await requireUser();
  const atual = String(formData.get("atual") ?? "");
  const nova = String(formData.get("nova") ?? "");
  if (nova.length < 8) redirect("/conta?erro=curta");
  const db = await prisma.user.findUnique({ where: { id: user.userId } });
  if (!db || !(await bcrypt.compare(atual, db.senha))) redirect("/conta?erro=atual");
  await prisma.user.update({ where: { id: user.userId }, data: { senha: await bcrypt.hash(nova, 10) } });
  redirect("/conta?ok=1");
}

// ---------- Revisão de relatórios (gestor) ----------

export async function aprovarRelatorio(formData: FormData) {
  const user = await requireUser("GESTOR");
  const uuid = String(formData.get("uuid") ?? "");
  const alterados = await prisma.relatorio.updateMany({
    where: { uuid, status: { in: ["ENVIADO", "DEVOLVIDO"] } },
    data: { status: "APROVADO" },
  });
  if (alterados.count > 0) await registrarEvento(user.userId, "aprovou relatório", uuid.slice(0, 8));
  revalidatePath("/painel");
  revalidatePath(`/painel/relatorio/${uuid}`);
}

export async function gerarLinkPublico(formData: FormData) {
  const user = await requireUser("GESTOR");
  const uuid = String(formData.get("uuid") ?? "");
  const token = randomBytes(9).toString("base64url"); // 12 caracteres, imprevisível
  await prisma.relatorio.update({ where: { uuid }, data: { linkPublico: token } });
  await registrarEvento(user.userId, "gerou link público", uuid.slice(0, 8));
  revalidatePath(`/painel/relatorio/${uuid}`);
}

export async function revogarLinkPublico(formData: FormData) {
  const user = await requireUser("GESTOR");
  const uuid = String(formData.get("uuid") ?? "");
  await prisma.relatorio.update({ where: { uuid }, data: { linkPublico: null } });
  await registrarEvento(user.userId, "revogou link público", uuid.slice(0, 8));
  revalidatePath(`/painel/relatorio/${uuid}`);
}

export async function devolverRelatorio(formData: FormData) {
  const user = await requireUser("GESTOR");
  const uuid = String(formData.get("uuid") ?? "");
  const comentario = String(formData.get("comentario") ?? "").trim().slice(0, 2000);
  if (!comentario) redirect(`/painel/relatorio/${uuid}?erro=comentario`);
  const alterados = await prisma.relatorio.updateMany({
    where: { uuid, status: "ENVIADO" },
    data: { status: "DEVOLVIDO", comentarioGestor: comentario },
  });
  if (alterados.count > 0) await registrarEvento(user.userId, "devolveu relatório", uuid.slice(0, 8));
  revalidatePath("/painel");
  revalidatePath(`/painel/relatorio/${uuid}`);
}
