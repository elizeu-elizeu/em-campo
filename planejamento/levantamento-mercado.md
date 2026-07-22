# Levantamento — o que falta para o EmCampo ser um produto de mercado

Estado em 22/07/2026. O que já existe e está verificado: modelos dinâmicos, preenchimento
offline com sync idempotente, fotos + observação por campo, assinatura, revisão
aprovar/devolver, PDF com cabeçalho da empresa + logo, parametrizações, papéis
técnico/gestor com revogação imediata, rate limit, design "Uniforme" premium, PWA.

Este documento lista o que falta, em quatro frentes, com prioridade ao final.

---

## 1. A tela memorável (o cartão de visita do produto)

A tela que faz alguém lembrar do app não é uma tela interna — é a que **quem não usa o app vê**.

### Proposta principal: o Relatório Público ("link que impressiona")
Hoje o PDF morre no e-mail. A proposta: cada relatório aprovado ganha um **link público
seguro** (`emcampo.app/r/A1B2C3`) que a prestadora manda ao cliente final pelo WhatsApp:

- **Capa-paisagem**: a cena do entardecer do login (colinas navy + sol laranja) com o nome
  da prestadora, tipo de serviço e o selo "verificado" — identidade instantânea.
- **Fotos antes/depois em comparador deslizante** (o momento "uau" — arrastar e ver o
  serviço feito).
- Checklist com checks animados ao rolar, assinatura do cliente, dados da empresa.
- Rodapé: "Relatório feito com EmCampo" → **é o motor de vendas**: todo cliente final de
  toda prestadora vê a marca. O app se vende a cada serviço entregue.

É memorável, é compartilhável e é aquisição de clientes ao mesmo tempo. Nenhum
concorrente nacional entrega esse momento.

### Complementar: "Fim de expediente" do técnico
Ao enviar o último relatório do dia, uma tela-recompensa: o sol da paisagem se põe e
aparece "Hoje: 6 serviços, 14 fotos, 3 assinaturas". Custo baixo, cria afeto e hábito —
é a alma do produto aparecendo no uso diário.

---

## 2. Telas e funcionalidades que faltam

### Para vender (sem isso não há demonstração que convença)
| Item | Por quê |
|---|---|
| **Onboarding do gestor** (wizard: empresa → logo → 1º modelo → convidar técnico) | Hoje o primeiro acesso cai num painel vazio; o "aha" precisa vir em 5 minutos |
| **Biblioteca de modelos prontos** por segmento (ar-condicionado, elétrica, dedetização, limpeza, obra) | Gestor começa com 1 clique em vez de montar formulário do zero |
| **Dashboard do gestor** (serviços no mês, por técnico, por cliente, pendentes de revisão) | Primeira tela após login precisa responder "como está minha operação?" |
| **Landing page** do produto com o link público de exemplo | Não existe porta de entrada comercial |

### Para operar no dia a dia
| Item | Por quê |
|---|---|
| Busca global no painel (cliente, técnico, texto do relatório) | Com 200+ relatórios os filtros não bastam |
| Agenda/atribuição: gestor agenda serviço → técnico vê a lista do dia | Fecha o ciclo da operação (hoje o técnico decide sozinho o que criar) |
| Notificações (push/WhatsApp): devolvido p/ técnico, enviado p/ gestor | O ciclo de revisão hoje depende de abrir o app |
| Exportar Excel/CSV do painel filtrado | Gestor vive de planilha; relatório fechado do mês |
| Histórico por cliente (linha do tempo de serviços no local) | Valor recorrente: "o que já foi feito neste condomínio?" |
| Perfil próprio: trocar a própria senha, foto | Hoje só o gestor redefine senhas |
| Edição/exclusão de clientes; arquivar relatórios | CRUD incompleto |

### Permissões (para empresas maiores)
- Papel **SUPERVISOR**: aprova/devolve apenas relatórios da sua equipe; não mexe em
  modelos/empresa.
- **Equipes**: técnicos agrupados; supervisor por equipe; filtros por equipe.
- Permissões finas no gestor: quem gerencia usuários, quem exporta, quem edita modelos.
- **Trilha de auditoria** (tabela Evento: quem aprovou/devolveu/alterou e quando) —
  exigência comum em contrato B2B.
- Troca de senha forçada no primeiro acesso (pendência da revisão de segurança).

---

## 3. Design e marca (o que ainda falta)

- **Logo final** (em andamento — painel de execuções do conceito "Laudo de Campo").
- **Tela memorável** (item 1) — leva a identidade para fora do app.
- Microinterações de recompensa: confete discreto no envio, transição do card ao aprovar.
- **Modo claro do PDF impecável**: hoje bom; falta paginação elegante em relatórios longos
  (quebra por seção, numeração de páginas via CSS print).
- Estados de carregamento (skeleton) nas listas do painel.
- Acessibilidade: auditoria de contraste + navegação por teclado completa no builder.
- Ilustrações próprias (a linguagem colinas+sol) nos estados vazios — hoje são só texto.

---

## 4. Infra e confiança (o que empresa compradora pergunta)

| Item | Estado | Próximo passo |
|---|---|---|
| Deploy real com HTTPS | falta | VPS/Railway + Postgres + domínio; remove HTTP_LOCAL |
| Banco | SQLite dev | Postgres gerenciado com backup diário |
| Fotos | disco local | S3/R2 com URL assinada |
| Multi-tenant | single-tenant | decisão: instância por cliente (vender já) → SaaS multi-tenant (escala) |
| LGPD | parcial | termos de uso, política de privacidade, exclusão de dados sob pedido, limpeza de fotos órfãs |
| Observabilidade | nada | Sentry (erros) + uptime monitor + log de sync falho |
| E-mail transacional | nada | convite de usuário, redefinição de senha esquecida (hoje só o gestor redefine) |
| Cobrança | nada | assinatura mensal por técnico ativo (Stripe) quando virar SaaS |
| App nas lojas | PWA | empacotar como TWA (Android) — mesmo código, presença na Play Store |

---

## Roadmap sugerido

**AGORA (fecha o produto vendável — 1ª demo paga)**
1. Logo final + landing page simples
2. Onboarding do gestor + biblioteca de modelos prontos
3. Dashboard do gestor
4. Deploy real (HTTPS, Postgres, backups) + termos/privacidade
5. Troca de senha própria + "esqueci minha senha" por e-mail

**PRÓXIMO (retenção e diferencial)**
6. **Relatório público compartilhável** (a tela memorável — e o motor de aquisição)
7. Notificações de devolução/envio
8. Busca global + exportar Excel + histórico por cliente
9. Supervisor + equipes + auditoria

**DEPOIS (escala)**
10. Agenda/atribuição de serviços
11. Multi-tenant SaaS + cobrança
12. TWA na Play Store + "Fim de expediente" do técnico
