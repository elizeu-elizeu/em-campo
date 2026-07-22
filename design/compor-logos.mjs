// Compõe design/opcoes-logo-refino.html a partir dos journals dos workflows de logo.
// Uso: node design/compor-logos.mjs <journal1> [journal2 ...]
import { readFileSync, writeFileSync } from "node:fs";

const ORDEM = ["modernista", "negativo", "traco", "emblema", "minimo", "entardecer", "gesto"];

const resultados = process.argv.slice(2).flatMap((p) =>
  readFileSync(p, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .filter((e) => e.type === "result")
    .map((e) => e.result)
    .filter((r) => r && r.slug)
);
const porSlug = Object.fromEntries(resultados.map((r) => [r.slug, r]));
const logos = ORDEM.map((s) => porSlug[s]).filter(Boolean);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const secoes = logos
  .map(
    (l, i) => `
  <section class="opcao" id="opcao-${i + 1}">
    <h2><span class="num">${i + 1}</span> ${esc(l.nome)}</h2>
    <div class="linha">
      <div class="tile claro"><div class="g">${l.svgMarca}</div></div>
      <div class="tile escuro"><div class="g branco">${l.svgMarca}</div></div>
      <div class="tile mini">
        <div style="width:96px;height:96px">${l.svgTile}</div>
        <div style="width:44px;height:44px">${l.svgTile}</div>
        <div style="width:20px;height:20px">${l.svgTile}</div>
      </div>
      <aside>${esc(l.ideia)}</aside>
    </div>
  </section>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EmCampo — refino da logo</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #17181c; color: #e7e7ea; font: 16px/1.5 system-ui, sans-serif; }
  .topo { padding: 28px 32px 8px; }
  .topo h1 { margin: 0; font-size: 22px; }
  .topo p { margin: 4px 0 0; color: #9a9aa3; }
  .opcao { padding: 28px 32px; border-top: 1px solid #2a2b31; }
  .opcao h2 { margin: 0 0 14px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
  .num { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #e7e7ea; color: #17181c; font-weight: 800; flex: none; }
  .linha { display: flex; gap: 20px; flex-wrap: wrap; align-items: stretch; }
  .tile { border-radius: 12px; display: flex; gap: 18px; align-items: center; justify-content: center; padding: 24px; }
  .claro { background: #f4f5f2; flex: 1 1 240px; min-height: 190px; }
  .escuro { background: #132a4a; flex: 1 1 240px; min-height: 190px; }
  .mini { background: #f4f5f2; flex: 0 0 220px; }
  .g { width: 130px; height: 130px; }
  .g svg, .mini svg { width: 100%; height: 100%; display: block; }
  /* no navy, o símbolo precisa virar branco: troca fills navy por branco via filtro simples */
  .branco svg [fill="#132A4A"], .branco svg [fill="#132a4a"] { fill: #ffffff; }
  .branco svg [stroke="#132A4A"], .branco svg [stroke="#132a4a"] { stroke: #ffffff; }
  aside { flex: 1 1 260px; max-width: 380px; color: #cfcfd6; font-size: 14px; padding: 4px 0; }
  .rodape { padding: 28px 32px 48px; border-top: 1px solid #2a2b31; color: #cfcfd6; }
</style>
</head>
<body>
  <div class="topo">
    <h1>EmCampo — refino da logo (conceito Laudo de Campo)</h1>
    <p>Mesma história, ${logos.length} execuções. Cada uma em fundo claro, navy e nos tamanhos de ícone (96/44/20px).</p>
  </div>
  ${secoes}
  <div class="rodape"><strong>Escolha respondendo com o número.</strong> Ajustes finos são bem-vindos ("a 3 com o sol maior").</div>
</body>
</html>`;

writeFileSync(new URL("./opcoes-logo-refino.html", import.meta.url), html);
console.log(`OK: ${logos.length} logos (${logos.map((l) => l.slug).join(", ")})`);
