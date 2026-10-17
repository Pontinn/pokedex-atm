---
feature: natures-lang
stage: complete
status: done
language: pt-BR
branch: feature/natures-lang
mode: quick
top_model: opus
running_agent: none
worktree: C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart (repo pokedex; branch feature/natures-lang a partir de main 5aa961fa)
user_gate: autonomo; merge e push autorizados pelo Pontin em 2026-10-17 para a pagina de naturezas (esta opcao e parte do mesmo pedido)
baselines:
  IDEA: { commit: 5aa961fa, deps: [src/screens/Natures/NaturesScreen.tsx, src/screens/Natures/NatureTable.tsx, src/screens/Natures/NatureFocus.tsx, src/screens/Natures/NatureByStat.tsx, src/components/TermsToggle.tsx, src/state/preferences-store.ts, src/screens/Balls/BallsScreen.tsx] }
updated: 2026-10-17 14:52
---
## 2026-10-17 14:50 - quick criada
- Pontin pediu opcao de ver as naturezas em ingles (jogos em ingles). Cobblemon reusa o toggle de termos por card; o oficial recebe mecanismo proprio depois do porte da pagina.
## 2026-10-17 14:52 - complete
- N1 b2f6a908 em 12 min. Gate: typecheck 0, lint 0, vitest 98/843, e2e natures+shell+responsive 53/53, build ok.
