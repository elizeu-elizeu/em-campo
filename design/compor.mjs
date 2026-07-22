// Compõe design/opcoes-design.html a partir de design/direcoes.json
// (saída do workflow de designers). Determinístico: rode com `node design/compor.mjs`.

import { readFileSync, writeFileSync } from "node:fs";

const SPECS = {
  Fraunces: "Fraunces:ital,opsz,wght@0,9..144,400..900;1,9..144,400..900",
  "Playfair Display": "Playfair+Display:ital,wght@0,400..900;1,400..900",
  "Cormorant Garamond": "Cormorant+Garamond:ital,wght@0,300..700;1,300..700",
  "DM Serif Display": "DM+Serif+Display:ital@0;1",
  Marcellus: "Marcellus",
  Lora: "Lora:ital,wght@0,400..700;1,400..700",
  "Abril Fatface": "Abril+Fatface",
  Nunito: "Nunito:ital,wght@0,300..900;1,300..900",
  Karla: "Karla:ital,wght@0,300..800;1,300..800",
  "Nunito Sans": "Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000",
  Quicksand: "Quicksand:wght@300..700",
  "Alegreya Sans": "Alegreya+Sans:ital,wght@0,400;0,500;0,700;0,800;1,400;1,700",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const dirs = JSON.parse(readFileSync(new URL("./direcoes.json", import.meta.url), "utf8"));
const familias = [...new Set(dirs.flatMap((d) => d.fontes))];
const specs = familias.map((f) => SPECS[f] ?? f.trim().replace(/ /g, "+"));
const fontsHref = `https://fonts.googleapis.com/css2?${specs.map((s) => `family=${s}`).join("&")}&display=swap`;

const secoes = dirs
  .map(
    (d, i) => `
  <section class="opcao" id="opcao-${i + 1}">
    <h2><span class="num">${i + 1}</span> ${esc(d.nome)}</h2>
    <div class="linha">
      <div class="mock">${d.html}</div>
      <aside>
        <h3>Conceito</h3>
        <p>${esc(d.conceito)}</p>
        <h3>Por que funciona</h3>
        <p>${esc(d.porque)}</p>
        <h3>Paleta</h3>
        <div class="swatches">
          ${d.paleta
            .map(
              (p) => `<div class="sw"><span class="cor" style="background:${esc(p.hex)}"></span><code>${esc(p.hex)}</code><small>${esc(p.uso)}</small></div>`
            )
            .join("")}
        </div>
        <h3>Fontes</h3>
        <p>${d.fontes.map(esc).join(" · ")}</p>
      </aside>
    </div>
  </section>`
  )
  .join("\n");

const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EmCampo — opções de design</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fontsHref}" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #17181c; color: #e7e7ea; font: 16px/1.5 system-ui, sans-serif; }
  .topo { padding: 28px 32px 8px; }
  .topo h1 { margin: 0; font-size: 22px; font-weight: 700; }
  .topo p { margin: 4px 0 0; color: #9a9aa3; }
  .opcao { padding: 28px 32px; border-top: 1px solid #2a2b31; }
  .opcao h2 { margin: 0 0 16px; font-size: 18px; display: flex; align-items: center; gap: 10px; }
  .num { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: #e7e7ea; color: #17181c; font-weight: 800; font-size: 17px; }
  .linha { display: flex; gap: 32px; align-items: flex-start; flex-wrap: wrap; }
  .mock { flex: 0 0 auto; }
  aside { flex: 1 1 320px; max-width: 460px; }
  aside h3 { margin: 18px 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #9a9aa3; }
  aside h3:first-child { margin-top: 0; }
  aside p { margin: 0; color: #cfcfd6; }
  .swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
  .sw { display: flex; align-items: center; gap: 8px; }
  .cor { width: 26px; height: 26px; border-radius: 6px; border: 1px solid #3a3b42; flex: 0 0 auto; }
  .sw code { color: #e7e7ea; font-size: 13px; }
  .sw small { color: #9a9aa3; }
  .rodape { padding: 28px 32px 48px; border-top: 1px solid #2a2b31; color: #cfcfd6; }
</style>
</head>
<body>
  <div class="topo">
    <h1>EmCampo — direções de design</h1>
    <p>Cinco propostas independentes para a mesma tela (home do técnico, mobile).</p>
  </div>
  ${secoes}
  <div class="rodape">
    <strong>Escolha respondendo com o número.</strong> Pode misturar — ex.: “a 2, mas com os chips de status da 4”.
  </div>
</body>
</html>`;

writeFileSync(new URL("./opcoes-design.html", import.meta.url), html);
console.log(`OK: ${dirs.length} direções · fontes: ${familias.join(", ")}`);
console.log(fontsHref);
