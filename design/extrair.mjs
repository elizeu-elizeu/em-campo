// Extrai as direções dos journals dos workflows para design/direcoes.json (ordem fixa).
// Uso: node design/extrair.mjs <journal1> [journal2 ...]
import { readFileSync, writeFileSync } from "node:fs";

const journals = process.argv.slice(2);
const ORDEM = [
  "capacete", "prancheta", "uniforme", "noturno", "campo",
  "medidor", "contrato", "oficina", "radar", "azulejo",
];

const resultados = journals.flatMap((journalPath) =>
  readFileSync(journalPath, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((e) => e.type === "result")
    .map((e) => e.result ?? e.value ?? e.output)
    .filter((r) => r && r.slug)
);

const porSlug = Object.fromEntries(resultados.map((r) => [r.slug, r]));
const ordenados = ORDEM.map((s) => porSlug[s]).filter(Boolean);

writeFileSync(new URL("./direcoes.json", import.meta.url), JSON.stringify(ordenados, null, 1));
console.log(`OK: ${ordenados.length} direções (${ordenados.map((d) => d.slug).join(", ")})`);
