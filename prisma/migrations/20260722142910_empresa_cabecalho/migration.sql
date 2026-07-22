-- CreateTable
CREATE TABLE "Empresa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modeloId" INTEGER NOT NULL,
    "ordem" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "rotulo" TEXT NOT NULL,
    "obrigatorio" BOOLEAN NOT NULL DEFAULT false,
    "opcoes" TEXT,
    "multipla" BOOLEAN NOT NULL DEFAULT false,
    "noCabecalho" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Campo_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Campo" ("id", "modeloId", "multipla", "obrigatorio", "opcoes", "ordem", "rotulo", "tipo") SELECT "id", "modeloId", "multipla", "obrigatorio", "opcoes", "ordem", "rotulo", "tipo" FROM "Campo";
DROP TABLE "Campo";
ALTER TABLE "new_Campo" RENAME TO "Campo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
