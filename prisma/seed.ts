import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const senha = bcrypt.hashSync("123456", 10);

  await prisma.user.upsert({
    where: { email: "gestor@empresa.com" },
    update: {},
    create: { nome: "Gestor Exemplo", email: "gestor@empresa.com", senha, papel: "GESTOR" },
  });
  await prisma.user.upsert({
    where: { email: "tecnico@empresa.com" },
    update: {},
    create: { nome: "Técnico Exemplo", email: "tecnico@empresa.com", senha, papel: "TECNICO" },
  });

  if ((await prisma.cliente.count()) === 0) {
    await prisma.cliente.create({
      data: {
        nome: "Condomínio Jardim das Flores",
        endereco: "Rua das Acácias, 120 — São Paulo/SP",
        contato: "(11) 98765-4321",
      },
    });
  }

  if ((await prisma.modelo.count()) === 0) {
    await prisma.modelo.create({
      data: {
        nome: "Manutenção preventiva",
        campos: {
          create: [
            { ordem: 0, tipo: "TEXTO_CURTO", rotulo: "Equipamento", obrigatorio: true },
            { ordem: 1, tipo: "ESCOLHA", rotulo: "Estado geral", obrigatorio: true, opcoes: JSON.stringify(["Ótimo", "Bom", "Regular", "Ruim"]) },
            { ordem: 2, tipo: "SIM_NAO", rotulo: "Limpeza realizada" },
            { ordem: 3, tipo: "NUMERO", rotulo: "Horas trabalhadas" },
            { ordem: 4, tipo: "TEXTO_LONGO", rotulo: "Descrição do serviço", obrigatorio: true },
            { ordem: 5, tipo: "FOTO", rotulo: "Foto após o serviço" },
            { ordem: 6, tipo: "ASSINATURA", rotulo: "Assinatura do responsável" },
          ],
        },
      },
    });
  }

  console.log("Seed concluído.");
}

main().finally(() => prisma.$disconnect());
