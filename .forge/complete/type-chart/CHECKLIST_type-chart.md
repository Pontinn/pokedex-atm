# CHECKLIST - type-chart (pagina Tipos: quem vence quem)

- **Feature:** type-chart
- **Branch:** feature/type-chart (worktree `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart`)
- **Criado em:** 2026-10-12
- **SPEC:** `SPEC_type-chart.md` (commitado em bba20545)
- **Idioma:** pt-BR
- **Backend:** N/A (SPEC secao 6: feature so de frontend). Secao omitida.

**Baseline (SPEC secao 1):**

- `HEAD`: `2b9dd126` (PRD rev 5.2; depois dele so `.forge/`); ancora de CODIGO `6aa3ffd5e441f298a9632eeb58e25b573b3ff9b3` (`git diff 6aa3ffd5..86c4bde5 -- src tests tools public package.json vite.config.ts` vazio) (branch `feature/type-chart`; so commits em `.forge/` acima de `main` `cee51235`; `git diff cee51235..HEAD -- src tests tools public package.json vite.config.ts` vazio, entao o codigo e o de `main`).
- PRD: `FEATURE_DIR/PRD_type-chart.md` = `f1a043ff6ca54bb6940219f0f526ef2759e3348d` (rev 5.2, commit `86c4bde5`; cascata do review da SPEC: CA-50 so na folha "Mais", RF-37 icones do heroi so em Defendendo, acento em RF-21/CA-18)
- CONTEXT: `FEATURE_DIR/CONTEXT_type-chart.md` = `6a4b28c4d90a0923097c4924c22fafd87bf15404`
- UISPEC: `FEATURE_DIR/UISPEC_type-chart.md` = `f2dcdd584d8a87b2d69dcadf2720fe615bc0cbae`
- IDEA: `FEATURE_DIR/IDEA_type-chart.md` = `c648af069a1221deba0451200299e81d3ad0a33f` (decisoes [14:58] e [15:25])
- LESSONS: `ROOT/.forge/LESSONS.md` = `753caf6ced364872b59c6d5595642dcbccaa128e`

**Legenda:** `[ ]` pendente · `[~]` em andamento · `[x]` concluido (commit existe) · `[!]` bloqueado

Regra geral de toda feature de frontend (SPEC secao 7): a feature so fica `[x]` com a tela RENDERIZADA e capturada (spec temporario, PNGs `after-*`), alem de typecheck e lint.

---

## Frontend

### Fase S0: Pre-voo (linha de base antes de qualquer mudanca)

- [x] **S0.1** Linha de base completa (categoria: outro)
  - Done when: STATE e checklist com os 6 passos e os numeros; `git status` sem mudanca de codigo.
  - commit: (docs no commit do checklist; STATE em 98546721)
  - status: done. typecheck/lint ok; vitest 92/93 arquivos (join.test.ts falha por falta do cache da PokeAPI no worktree, preexistente de ambiente); build ok, 1231061 bytes js+css; e2e 275 ok/16 skip/1 falha (items.spec.ts:123, flake: 3/3 sozinho). Detalhes no STATE.

### Fase F1: Navegacao e registro da tela

- [x] **F1.1** Modulo i18n da pagina (categoria: frontend)
  - Done when: `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts tests/unit/ui-foundation` verde; `npm run typecheck` e `npm run lint` limpos; `node -e` (ou `npx tsx -e`) imprime `Object.keys(TYPES_PAGE_MESSAGES).length === 45`; captura `after-f11-home-classic-desktop.png` sem nenhuma mudanca visual em relacao a `shell-sidebar-classic-desktop.png` (as chaves ainda nao sao usadas).
  - commit: 96de719a
  - status: done. 45 chaves; i18n-modules + ui-foundation 34/34; typecheck/lint ok; after-f11 igual a shell-sidebar (sem mudanca visual).

- [x] **F1.2** Tela registrada, estado, item de navegacao e testes do shell (categoria: frontend)
  - Done when: `npm run typecheck`, `npm run lint` limpos; `npx vitest run tests/unit/ui-shell` verde (inclui l.66 paridade e as 2 listas novas); `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/shell.spec.ts tests/e2e/navigation.spec.ts` verde (as 2 listas novas e `toBeInViewport` da folha); captura headless: `after-f12-sidebar-{classic,black}-desktop.png` (comparar com `shell-sidebar-*-desktop.png`: "Tipos" em 5o com icone proprio, ativo ao clicar, rodape visivel), `after-f12-more-sheet-{classic,black}-phone.png` (com `shell-more-sheet-*-phone.png`: "Tipos" + "Quem vence quem" em 1o) e `after-f12-tabbar-classic-phone.png` (com `shell-tabbar-*-phone.png`: "Mais" ativo com "Tipos" aberto); no spec temporario: `history.length` sobe 1 ao abrir "Tipos" pela sidebar e `page.url()` nao muda de caminho. `responsive.spec.ts` NAO roda aqui (F1.3, logo em seguida).
  - commit: 9d3873a8
  - status: done. ui-shell 20/20; shell+navigation+sync e2e 32/32; capturas after-f12-* conferidas (Tipos 5o com Shapes, ativo, rodape visivel; folha Mais com Tipos + Quem vence quem em 1o); history.length +1, caminho igual. DESVIO DA SPEC 2.7 (lista incompleta): alem das 4 listas, 4 asserts por INDICE deslocados +1 pelo item novo: shell.spec.ts:232 (sheet nth 2->3) e :235 (sidebar nth 6->7), sync.spec.ts:65 (sheet-item nth 3->4) e :67 (nav-item nth 7->8), pwa-offline.spec.ts:341 (nav-item nth 7->8); mesma forca, so o indice. pwa-offline so roda em build+preview: conferir em T1.4.

- [x] **F1.3** Baselines visuais do responsive (10o item da sidebar) (categoria: outro)
  - Done when: os 7 testes de tema verdes sem `--update-snapshots`; diff = 14 PNGs; tabela do passo 7 no STATE com 100% dos pixels diferentes em `x < 236`; `maxDiffPixelRatio` continua `0.02` (`git diff -- tests/e2e/responsive.spec.ts` vazio).
  - commit: 98546721
  - status: done. 7 testes verdes sem update; 14 PNGs; maxDiffPixelRatio intocado. As baselines do HEAD ja eram velhas antes da feature (rodape sem Feito por Pontin/GitHub, arte do Charizard): diff contra elas falha fora da sidebar; isolado regenerando com o codigo de 96de719a: efeito do item 100% em x < 236, exceto 2 px de ruido de antialias (x 276-277, y 259-261, aparece entre duas regeneracoes do mesmo codigo). Tabela no STATE.

### Fase F2: Visao por tipo (principal)

- [x] **F2.1** Modelo puro `types-model.ts` (categoria: frontend)
  - Done when: `npm run typecheck` e `npm run lint` limpos; script `npx tsx -e` (scratchpad) imprime para fire/normal/electric/ghost/steel exatamente os grupos da secao 5.5 e as contagens 51/61/8/204 de `matrixRows()`; `nextSelection` reproduz as 5 linhas da tabela; captura `after-f21-types-classic-desktop.png` (tela ainda so com titulo: nada visual muda; o modelo ainda nao e usado).
  - commit: 346e58a7
  - status: done. npx tsx: fire/normal/electric/ghost/steel = secao 5.5; tons 51 adv/61 dis/8 zero/204 neutral; nextSelection = as 5 linhas; after-f21 so com titulo. Ajuste: defenders[0] via const first (noUncheckedIndexedAccess).

- [x] **F2.2** Legenda, seletor de visao, grade de tipos e bloco heroi (categoria: frontend)
  - Done when: typecheck/lint limpos; `npx vitest run tests/unit/ui-shell` verde; capturas `after-f22-empty-{classic,black}-{desktop,phone}.png` (sem tipo; comparar a grade com `dex-typechips-*.png`, o seletor com `dex-seg-status-*.png`, a legenda/painel com `detail-panel-weak-*.png`) e `after-f22-fire-{classic,black}-{desktop,phone}.png` (Fogo escolhido: chip com anel + check como `dex-typechips-selected-*.png`, heroi com icone 64/56 px, nome "Fogo" e a frase "Fogo queima Planta e Gelo, mas Água apaga Fogo") e `after-f22-fire-focus-classic-desktop.png` (Tab ate o chip de Fogo: anel 2px visivel, comparar com `dex-typechip-focus-*`); no spec temporario `expectNoOverlap(".types-screen")` a 360/390/1280 nos dois estados, `history.length` inalterado depois de 5 escolhas, e o chip selecionado e o UNICO com `aria-pressed="true"`.
  - commit: 3fdafe0c
  - status: done. ui-shell 20/20; capturas after-f22-empty/fire nos 2 temas x 2 tamanhos + focus (outline 2px solid); expectNoOverlap 360/390/1280 nos dois estados; history.length inalterado apos 5 escolhas; 1 so aria-pressed=true; icone heroi 64/56 px.

- [x] **F2.3** Abas Atacando/Defendendo e faixas coloridas (categoria: frontend)
  - Done when: typecheck/lint limpos; capturas `after-f23-fire-attack-{classic,black}-{desktop,phone}.png` e `after-f23-fire-defend-{classic,black}-{desktop,phone}.png` (comparar os tons com as pilulas de `detail-calc-grass-flying-*.png`: verde = `x½`, laranja = `x2`, cinza = `x0`; e o painel com `detail-panel-weak-*.png`), `after-f23-normal-attack-classic-phone.png` ("nenhum" em "Forte contra (x2)") e `after-f23-steel-defend-classic-phone.png` (10 icones quebrando linha); no spec temporario, para Fogo, os `data-type` de cada faixa = `attackGroups`/`defendGroups` calculados no proprio teste a partir de `TYPE_CHART` e os `data-tone` = `adv,dis,zero` (Atacando) e `dis,adv,zero` (Defendendo); `getComputedStyle(.tp-band).backgroundColor` = `rgb(225, 245, 231)` / `rgb(255, 233, 214)` / `rgb(230, 231, 236)` conforme o tom; `expectNoOverlap(".types-screen")` a 360/390/1280, PT e EN, nas duas abas.
  - commit: a69b6817
  - status: done. Fogo: data-type das faixas = derivado de TYPE_CHART no teste; data-tone adv,dis,zero / dis,adv,zero; backgroundColor rgb(225,245,231)/rgb(255,233,214)/rgb(230,231,236); overlap 360/390/1280 PT e EN nas duas abas (Fogo, Aco, Normal); Normal 'nenhum'; Aco Defendendo com 10 icones.

### Fase F3: Tabela completa (matriz 18 x 18)

- [x] **F3.1** Matriz com cabecalhos clicaveis e coluna fixa (categoria: frontend)
  - Done when: typecheck/lint limpos; capturas `after-f31-chart-empty-{classic,black}-desktop.png`, `after-f31-chart-fire-{classic,black}-desktop.png` (linha e coluna do Fogo destacadas; celula Agua x Fogo verde com "2"), `after-f31-chart-fire-grayscale-classic-desktop.png` (com `document.documentElement.style.filter = "grayscale(1)"`: destaque continua visivel), `after-f31-chart-fire-{classic,black}-phone.png` (scroll 0) e `after-f31-chart-fire-scrolled-classic-phone.png` (`scrollLeft = 200`: coluna fixa opaca sobre as celulas); comparar a tipografia das celulas e os tons com `detail-calc-grass-flying-*.png` (pilulas) e o painel com `detail-panel-weak-*.png`; no spec temporario: 324 `td`, `getByRole("cell", { name: "Fogo contra Planta: x2" })` com texto "2", clicar no cabecalho de coluna "Água defende (coluna)" deixa `[data-axis=col][data-type=water]` e `[data-axis=row][data-type=water]` com `aria-pressed="true"` e a pagina na tabela; `expectNoOverlap(".types-screen")` com `scrollLeft = 0` a 360/390/1280; `#main` sem conteudo passando da borda direita.
  - commit: d8fda432
  - status: done. 324 td; Fogo contra Planta: x2 = '2'; Agua x Fogo verde 'adv' com is-col; cabecalho de coluna Agua seleciona e pressiona os 2 cabecalhos, fica na tabela; overlap scroll 0 a 360/390/1280; nada passa da borda de #main. Ajuste alem da SPEC: box-shadow -6px/2px var(--surface) na coluna fixa (.tp-row-head/.tp-corner) para cobrir o padding de 4px e o border-spacing, senao celulas roladas apareciam a esquerda da coluna fixa (capturado em after-f31-chart-fire-scrolled-classic-phone).

### Fase F4: Defesa com 2 tipos `[COULD]`

- [x] **F4.1** Segundo tipo na defesa (categoria: frontend)
  - Done when: typecheck/lint limpos; `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts` verde; capturas `after-f41-water-ground-{classic,black}-{desktop,phone}.png` (5 faixas; Planta em "Muito fraco contra (recebe x4)", Eletrico em "Imune a (x0)"; dois icones no heroi; comparar tons x4/x1/4 com `detail-calc-grass-flying-*.png`), `after-f41-water-ground-attack-classic-desktop.png` (aba Atacando: 1 icone, sem `select`) e `after-f41-select-focus-classic-desktop.png` (foco por Tab no `select`: anel 2px); no spec temporario, Agua + Voador poe Eletrico em x4, e `expectNoOverlap(".types-screen")` a 360/390/1280 com o 2o tipo.
  - commit: 85d1d473
  - status: done. 5 chaves COULD (50 no total); Agua/Terra: 5 faixas, Planta x4, Eletrico x0, heroi 2 icones 'Agua / Terra'; Atacando: 1 icone, sem select, second guardado; Agua/Voador poe Eletrico em x4; '' volta a 3 faixas; foco por Tab no select com outline 2px solid (o computado so atualiza um frame depois: expect.poll); overlap 360/390/1280 com 2o tipo; i18n-modules verde.

### Fase F5: Fechamento

- [x] **F5.1** Varredura de codigo morto (nada a remover) (categoria: outro)
  - Done when: relatorio (passo, comando, saida, decisao) no checklist; suite + build verdes.
  - commit: (sem commit: nada removido)
  - status: done. Passo 1: unica linha removida em src = import antigo de nav-items.ts. Passo 2: linhas removidas em tests = as 4 listas de 2.7 + os 5 indices nth deslocados (ver Bugs). Passo 3: as 50 chaves de TYPES_PAGE_MESSAGES tem referencia em src fora de src/i18n. Passo 4: todo export de TypePicker/TypeFocus/TypeMatrix/TypesScreen usado; do modelo, Tone/TypeGroup/MatrixCell/MatrixRow/CELL_SYMBOL/isTypeId/toneOf so internos (permitido pela SPEC; os testes de T1.1 usam). Nada a remover; suite + build completos ficam para T1.4.

### Fase T1: Testes (definidos aqui, escritos na etapa de testes) e inventario do porte

- [x] **T1.1** Modelo puro, frases de intuicao e i18n (unitarios) (categoria: outro)
  - Done when: `npx vitest run tests/unit/ui-screens/types-model.test.ts tests/unit/ui-screens/types-hints.test.ts` verde.
  - commit: 9c9bf1d5
  - status: done. types-model.test.ts 12 testes + types-hints.test.ts 4 testes verdes (16/16), incl. COULD (306 pares). Ajuste: o teste de isolamento ignora comentarios do CSS (os comentarios que a propria SPEC pos em types.css citam detail.css .mult-* como origem dos hex).

- [x] **T1.2** Tela com Testing Library (categoria: outro)
  - Done when: `npx vitest run tests/unit/ui-screens/types-screen.test.tsx` verde; `npx vitest run --coverage` com `src/screens/**` >= 70/70 e global >= 80/80 (`vitest.config.ts`).
  - commit: f212d5a3
  - status: done. types-screen.test.tsx 7/7. Cobertura (vitest --coverage com tests/unit/dataset/join.test.ts excluido, pois falha so por falta do cache da PokeAPI no worktree, ver S0.1; com ele a suite fica vermelha e o vitest nao imprime cobertura): 95 arquivos, 786 testes; global linhas 90.41% / branches 88.38%; src/screens/** 95.25% / 89.61%; os 5 arquivos de src/screens/Types 100/100; limites do vitest.config.ts respeitados.

- [x] **T1.3** e2e headless da pagina (categoria: outro)
  - Done when: `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/types.spec.ts` verde e `npx playwright test tests/e2e/types.spec.ts` (build + preview) verde.
  - commit: 77cd0217
  - status: done. Dev (PW_DEV=1 PW_PORT=4183) 25/25; build + preview (PW_PORT=4185, --repeat-each 2) 50/50; pwa-offline.spec.ts inteiro verde em build + preview (incl. o nth deslocado em :341). Avancar: plan-reality resolvido pela opcao (a), PRD rev 5.3 CA-31 / SPEC T1.3 passo 3 (e81371db): o teste termina no Voltar (Fogo, Defendendo, scroll a 2 px, caminho da URL igual). Flake achado e corrigido pela causa: ver Notas por fase.

- [x] **T1.4** Regressao completa contra a linha de base (categoria: outro)
  - Done when: os 7 passos verdes e os numeros (testes, cobertura, bytes) no STATE.
  - commit: 013f6e2b
  - status: done. 7 passos verdes (numeros no STATE 17:00): vitest 96 arquivos / 823 testes, global 94,59/88,46; e2e build + preview 299 ok, 16 pulados, 2 falhas preexistentes provadas na main (dex.spec.ts:324 Meltan/Wyrdeer 4 de 15 falham na main; items.spec.ts:69 linha 81, 3 de 8 falham na main); bundle +18182 bytes.

- [x] **T1.5** Porte: inventario (categoria: outro)
  - Done when: inventario no STATE e o passo 1 batendo.
  - commit: 6e849cd9
  - status: done. Inventario no STATE 17:03. Passo 1 bate: 11 A + 9 M (os 7 da SPEC + sync.spec.ts e pwa-offline.spec.ts do desvio de F1.2) + 14 PNGs. Pre-condicoes com hash; +ScreenRouter.tsx e data/types.ts achados pelos imports.

---

## Notas por fase

- F2.2 (ajuste pos-teste, forge-test): no celular a legenda ocupava ~40% da 1a tela (360x800: 320 px) e empurrava a grade. Legenda compacta so em .app.mobile (< 900 px) em types.css: linhas de multiplicador quebrando como no desktop, 12 px, padding e gaps menores, amostras 10 px; mesmos textos (RF-21), sempre visivel, desktop identico (14 baselines do responsive verdes sem regenerar). Medido a 360x800 com Fogo: legenda 320 -> 207 px (25,9%); seletor de visao e a grade inteira na 1a tela. Captura ui-refs/after-legend-compact-phone.png. Commit ddd92b61. Efeito colateral: o teste de Voltar (types.spec.ts) lia o scroll durante a rolagem suave do #main (scroll-behavior: smooth, base.css:41) e passou a errar 4 a 8 px com a pagina mais curta; agora espera a rolagem chegar ao alvo antes de guardar (mesmo assert de 2 px). Commit 6d045b2f. types.spec.ts verde em dev (25/25) e build + preview; lint limpo.
- T1.3 (frontend #2): o app nunca teve Avancar do navegador (history-bridge.ts trata todo popstate como Voltar). Plan-reality resolvido pela opcao (a): PRD rev 5.3 CA-31 e SPEC T1.3 passo 3 sem goForward (e81371db); o teste termina no Voltar.
- T1.3 (frontend #2): 'Fire bands' falhou 1 em 8 rodadas: html.reduce-motion poe transition-duration .001s em todo elemento (base.css:70; transition-property padrao = all) e a faixa reaproveitada (key = multiplicador) troca de tom com 1 ms de transicao; getComputedStyle no mesmo frame devolvia a cor anterior. Correcao no teste (mesmo assert): leitura do fundo por expect.poll e contraste dos 7 temas em toPass. 32/32 com --repeat-each 4 depois.


## Bugs encontrados

| Fase/Feature | Descricao | Causa | Correcao / commit |
|---|---|---|---|
| F1.2 | SPEC 2.7 listava 4 asserts afetados; 5 outros asserts/cliques por indice (nth) quebrariam com o 10o item | Lista da SPEC feita por texto de lista, sem grep por `.nth(` nos seletores de navegacao | Indices deslocados +1 em shell.spec.ts:232,235, sync.spec.ts:65,67, pwa-offline.spec.ts:341 / 9d3873a8 |
| F1.3 | Baselines do responsive ja estavam velhas no HEAD (rodape da sidebar e arte do Charizard), escondidas pela tolerancia de 2% | Mudancas anteriores do app nao regeneraram as baselines | Efeito do item isolado regenerando com o codigo anterior; baselines regravadas / 98546721 |
| T1.3 | Teste de Avancar falha: apos page.goForward() aparece a Home, nao a .dex-screen | history-bridge.ts trata todo popstate como Voltar; a SPEC T1.3 passo 3 e o PRD CA-31 pedem Avancar, que o app nao suporta | BLOQUEADO: plan-reality mismatch, aguardando decisao (sem patch) |
| T1.4 | dex.spec.ts:324 (Meltan/Wyrdeer 360/390) e items.spec.ts:69 (linha 81) falharam na suite | Flakes preexistentes: na main falham 4/15 e 3/8 (timeout sob carga; img.complete lido sem polling) | Nao mexidos (fora do escopo); registrados no STATE |
| S0.1 | tests/unit/dataset/join.test.ts falha no worktree | Cache da PokeAPI (gitignored) so existe na arvore principal | Preexistente de ambiente; nao mexido |
