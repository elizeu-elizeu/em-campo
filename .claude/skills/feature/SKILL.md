---
name: feature
description: Workflow padrão para construir uma feature no relatorios-app com o time de agentes do projeto — planejar (planejador), implementar (construtor), revisar (revisor) e verificar E2E (verificador). Invocar quando o usuário pedir /feature ou uma funcionalidade nova não trivial.
---

# Workflow de feature

Dada a feature pedida em `$ARGUMENTS` (ou na conversa):

1. **Planejar** — lance o agente `planejador` com a descrição da feature. Se o plano contrariar o pedido do usuário ou parecer grande demais, resolva antes de seguir (AskUserQuestion se for decisão do usuário).
2. **Implementar** — feature pequena (≤3 arquivos): implemente você mesmo seguindo o plano. Feature maior: lance o agente `construtor` com o plano completo no prompt. Duas frentes independentes (ex.: área do técnico + área do gestor) podem ser dois `construtor` em paralelo, cada um com lista disjunta de arquivos.
3. **Revisar** — lance o agente `revisor` sobre os arquivos alterados. Corrija todo achado de segurança ou bug confirmado; ressalvas de estilo podem ficar.
4. **Verificar** — lance o agente `verificador` com o fluxo específico da feature (ele sobe o dev server e dirige com Playwright). Só declare pronto com o veredito verde dele.
5. Se qualquer etapa revelou fricção no processo (agente com instrução errada, convenção faltando), sugira rodar `/melhorar-skills`.
