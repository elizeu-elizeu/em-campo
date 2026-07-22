---
name: melhorar-skills
description: Automelhoramento do time de agentes e skills deste projeto — audita .claude/agents/ e .claude/skills/ contra a fricção real observada na sessão e aplica melhorias nos próprios arquivos. Invocar quando o usuário pedir /melhorar-skills, ou proativamente após uma sessão em que um agente/skill errou, travou ou precisou de instrução repetida.
---

# Automelhoramento de skills e agentes

Objetivo: os arquivos em `.claude/agents/` e `.claude/skills/` devem melhorar com o uso, não apodrecer.

## Processo

1. **Colete evidência da sessão atual** (memória da conversa): onde um agente errou, ignorou convenção, precisou de correção do usuário, ou uma skill disparou errado/não disparou. Também: comandos que falharam repetidamente, convenções novas que surgiram na conversa e não estão escritas.
2. **Audite os arquivos**: leia todos os `.claude/agents/*.md`, `.claude/skills/*/SKILL.md` e o `AGENTS.md`. Para cada um cheque:
   - A `description` dispara nas situações certas? (é ela que decide quando o agente/skill é usado)
   - As instruções citam arquivos, comandos e usuários seed que **ainda existem**? (verifique no repo, não assuma)
   - Há instrução que a sessão provou errada ou insuficiente?
   - Há aprendizado da sessão que deveria virar instrução permanente?
3. **Aplique as melhorias** direto nos arquivos — edições mínimas e específicas; não reescreva o que funciona. Convenção nova de projeto vai para `AGENTS.md`; instrução de processo vai para o agente/skill dono dela.
4. **Registre** cada mudança em `.claude/skills/melhorar-skills/CHANGELOG.md`: data, arquivo, o que mudou, e a evidência que motivou (1 linha cada).
5. Reporte ao usuário: tabela mudança → motivo. Se não houver evidência de fricção, diga isso e **não mude nada** — melhoria sem evidência é ruído.

## Regras

- Esta skill também se audita: se o processo acima falhou em algo, corrija este arquivo e registre.
- Nunca remova a regra de segurança (`requireUser` + validação) nem as regras de arquitetura offline dos prompts dos agentes.
