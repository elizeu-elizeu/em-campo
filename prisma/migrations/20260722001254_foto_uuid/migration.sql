/*
  Warnings:

  - The primary key for the `Foto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Foto` table. All the data in the column will be lost.
  - Added the required column `uuid` to the `Foto` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Foto" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "relatorioUuid" TEXT NOT NULL,
    "campoId" INTEGER,
    "arquivo" TEXT NOT NULL,
    "legenda" TEXT,
    CONSTRAINT "Foto_relatorioUuid_fkey" FOREIGN KEY ("relatorioUuid") REFERENCES "Relatorio" ("uuid") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Foto" ("arquivo", "campoId", "legenda", "relatorioUuid") SELECT "arquivo", "campoId", "legenda", "relatorioUuid" FROM "Foto";
DROP TABLE "Foto";
ALTER TABLE "new_Foto" RENAME TO "Foto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
