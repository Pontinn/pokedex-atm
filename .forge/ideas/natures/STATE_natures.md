---
feature: natures
stage: impl
status: in-progress
language: pt-BR
branch: feature/natures
mode: quick
top_model: opus
running_agent: forge-imp-frontend (opus) - implementando F1..T1 no worktree pokedex-type-chart
worktree: C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart (repo pokedex; branch feature/natures a partir de main 28030e45)
user_gate: autonomo ate o fim; merge e push ja autorizados pelo Pontin (2026-10-17, "merge e push autorizado")
baselines:
  IDEA: { commit: 28030e45, deps: [src/domain/natures.ts, src/screens/Types/TypesScreen.tsx, src/screens/Types/types.css, src/components/nav-items.ts, src/navigation/types.ts, src/screens/registry.ts, src/components/Icon.tsx, src/i18n/messages.ts, src/i18n/messages/core.ts, src/components/SegmentedControl.tsx] }
updated: 2026-10-17
---
## 2026-10-17 - quick criada (sem PRD/SPEC; plano inline na IDEA sec. 5)
- Pedido do Pontin: pagina so de naturezas, o que cada uma aumenta e diminui, nos dois repos, didatica como Tipos. Decisoes na IDEA sec. 2.
- Dominio ja existe e e identico nos dois repos. Construir aqui primeiro, portar por copia para o pontindex (agente novo) em seguida.
