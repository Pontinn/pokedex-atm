---
feature: natures-lang
language: pt-BR
type: change
mode: quick
status: in-progress
created: 2026-10-17
repo: pokedex (Pontindex Cobblemon), branch feature/natures-lang a partir de main 5aa961fa, worktree Projetos/pokedex-type-chart
also_in: pontindex (mesma opcao, mecanismo proprio porque o oficial nao tem o toggle de termos; feito depois do porte da pagina)
---

# IDEA - natures-lang (opcao de ver as naturezas em ingles)

## 1. Objetivo

Pontin (2026-10-17, 14:45): "deixa opcao de deixar as natures em ingles. Os jogos sao todos em ingles." Hoje a pagina Naturezas mostra o nome no idioma da UI (pt) e o ingles so pequeno no painel de foco; na tabela e nas faixas o ingles nao aparece. Ele joga em ingles e quer achar "Adamant" direto.

## 2. Decisoes (orquestrador, por delegacao)

Conferido antes: no Cobblemon ja existe o mecanismo de "termos do jogo" (`usePreferencesStore.termsLanguage` global, override por card com `setTermsOverride(cardKey, lang)`, hook `useTermsLanguage(cardKey)`, componente `src/components/TermsToggle.tsx` = seg PT | EN com icone Languages, usado em Balls (`cardKey="balls"`) e AbilitiesPanel). A calculadora da ficha JA usa `useTermsLanguage("calc")` para o nome das naturezas. A pagina Naturezas hoje le `uiLanguage` direto (NatureTable.tsx:15, NatureFocus.tsx:11, provavelmente NatureByStat).

- No Cobblemon: REUSAR o mecanismo de termos. A pagina Naturezas passa a ler `useTermsLanguage("natures")` em todo lugar que mostra nome de natureza (tabela, faixas Por status, foco) e ganha um `<TermsToggle cardKey="natures" />` no `page-head`, a direita do titulo, igual ao padrao de Balls. O padrao global (Configuracoes > Termos do jogo) continua valendo quando nao ha override; o toggle da pagina grava o override persistido so para esse card.
- Painel de foco: nome principal no idioma escolhido e o OUTRO idioma pequeno embaixo (hoje so mostra o ingles quando a UI e pt; passa a ser simetrico: em EN mostra o portugues pequeno). Classe `nt-focus-en` pode virar `nt-focus-alt`.
- Tabela e faixas: so o nome no idioma escolhido (sem segundo nome, para nao poluir); quem quiser o outro nome clica e ve no foco.
- Sem campo novo de preferencia, sem mudanca de schema, sem tela nova. Zero travessao (U+2014).
- Testes: unit da tela cobre a troca PT -> EN (a tabela passa a mostrar "Adamant" no lugar de "Rigida" e o foco inverte os nomes); e2e `natures.spec` ganha um teste que clica EN no toggle, confere "Adamant" na tabela e que a escolha persiste apos reload (preferencia gravada). Capturas novas: `table-en-1280.png`, `focus-en-360.png` em `.forge/ideas/natures-lang/captures/`.

## 3. Escopo

In-scope: os 4 arquivos de `src/screens/Natures/` que mostram nome, o toggle no cabecalho, testes e capturas.
Out-of-scope / NAO tocar: `TermsToggle.tsx`, `preferences-store.ts`, `StatsCalculator.tsx` (ja respeita o toggle de termos), dominio, Configuracoes.

## 4. Superficie de regressao

Pagina Naturezas (tabela, Por status, foco, celular 360 com o toggle no cabecalho sem sobreposicao: o harness no-overlap trata `.seg`/button como controle), persistencia das preferencias (override por card ja existe), testes `natures-*.test`, `natures.spec`, `responsive.spec`.

## 5. Plano inline (quick)

- N1 `useTermsLanguage("natures")` nos 4 componentes + `TermsToggle` no `page-head` + foco simetrico; unit atualizado; e2e novo; capturas; typecheck, lint, vitest, `natures.spec` + `responsive.spec` + `shell.spec` verdes; UM commit `feat(natures): ...`.

## 6. Pontos em aberto

Nenhum.
