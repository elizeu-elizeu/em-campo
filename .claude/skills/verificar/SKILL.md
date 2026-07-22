---
name: verificar
description: Verificação E2E completa do relatorios-app — sobe o app real e percorre o fluxo inteiro (modelo → preenchimento mobile com foto/assinatura → offline/sync → revisão do gestor → PDF). Invocar quando o usuário pedir /verificar, "testa tudo", ou antes de declarar uma entrega pronta.
---

# Verificação E2E

Lance o agente `verificador` com o roteiro padrão completo dele (modelo, preenchimento mobile, offline, revisão, impressão). Se `$ARGUMENTS` indicar um foco (ex.: "só offline"), restrinja o roteiro a isso.

Ao final:
- Veredito verde: reporte a tabela de evidências ao usuário.
- Veredito com falhas: corrija as falhas (ou lance `construtor` para isso), re-lance o `verificador` só nas etapas que falharam, e repita até verde. Reporte o que foi corrigido.
- Registre falha recorrente de processo (ex.: seed quebrado, porta ocupada) como candidata a `/melhorar-skills`.
