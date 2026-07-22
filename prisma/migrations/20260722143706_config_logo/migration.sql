-- AlterTable
ALTER TABLE "Empresa" ADD COLUMN "logo" TEXT;

-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "usarNomeEmpresa" BOOLEAN NOT NULL DEFAULT true,
    "exigirFoto" BOOLEAN NOT NULL DEFAULT false
);
