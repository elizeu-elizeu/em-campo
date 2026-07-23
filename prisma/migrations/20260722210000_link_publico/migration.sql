-- Link público compartilhável do relatório (token; null = não compartilhado)
ALTER TABLE "Relatorio" ADD COLUMN "linkPublico" TEXT;
CREATE UNIQUE INDEX "Relatorio_linkPublico_key" ON "Relatorio"("linkPublico");
