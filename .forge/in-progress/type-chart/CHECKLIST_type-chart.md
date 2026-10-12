# CHECKLIST - type-chart (pagina Tipos: quem vence quem)

- **Feature:** type-chart
- **Branch:** feature/type-chart (worktree `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart`)
- **Criado em:** 2026-10-12
- **SPEC:** `SPEC_type-chart.md` (commitado em d991de5a)
- **Idioma:** pt-BR
- **Backend:** N/A (SPEC secao 6: feature so de frontend). Secao omitida.

**Baseline (SPEC secao 1):**

- `HEAD`: `76cf8454` (PRD rev 5.2; depois dele so `.forge/`); ancora de CODIGO `23308678a2516e4043906f4ce78caaa6f97f9407` (`git diff 23308678..2c334cce -- src tests tools public package.json vite.config.ts` vazio) (branch `feature/type-chart`; so commits em `.forge/` acima de `main` `cee51235`; `git diff cee51235..HEAD -- src tests tools public package.json vite.config.ts` vazio, entao o codigo e o de `main`).
- PRD: `FEATURE_DIR/PRD_type-chart.md` = `172e7154a386569d12434cca19e42ecff6e19582` (rev 5.2, commit `2c334cce`; cascata do review da SPEC: CA-50 so na folha "Mais", RF-37 icones do heroi so em Defendendo, acento em RF-21/CA-18)
- CONTEXT: `FEATURE_DIR/CONTEXT_type-chart.md` = `5cbb8e52f5ef5531d0381f029764d3191572efe3`
- UISPEC: `FEATURE_DIR/UISPEC_type-chart.md` = `c5127ca91db4daae03593dfe552feb9cf64d8001`
- IDEA: `FEATURE_DIR/IDEA_type-chart.md` = `1d1a4121ebb8d443ea1f898bba8b7f466210fadf` (decisoes [14:58] e [15:25])
- LESSONS: `ROOT/.forge/LESSONS.md` = `753caf6ced364872b59c6d5595642dcbccaa128e`

**Legenda:** `[ ]` pendente · `[~]` em andamento · `[x]` concluido (commit existe) · `[!]` bloqueado

Regra geral de toda feature de frontend (SPEC secao 7): a feature so fica `[x]` com a tela RENDERIZADA e capturada (spec temporario, PNGs `after-*`), alem de typecheck e lint.

---

## Frontend

### Fase S0: Pre-voo (linha de base antes de qualquer mudanca)

- [ ] **S0.1** Linha de base completa (categoria: outro)
  - Done when: STATE e checklist com os 6 passos e os numeros; `git status` sem mudanca de codigo.
  - commit: 
  - status: pending

### Fase F1: Navegacao e registro da tela

- [ ] **F1.1** Modulo i18n da pagina (categoria: frontend)
  - Done when: `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts tests/unit/ui-foundation` verde; `npm run typecheck` e `npm run lint` limpos; `node -e` (ou `npx tsx -e`) imprime `Object.keys(TYPES_PAGE_MESSAGES).length === 45`; captura `after-f11-home-classic-desktop.png` sem nenhuma mudanca visual em relacao a `shell-sidebar-classic-desktop.png` (as chaves ainda nao sao usadas).
  - commit: 
  - status: pending

- [ ] **F1.2** Tela registrada, estado, item de navegacao e testes do shell (categoria: frontend)
  - Done when: `npm run typecheck`, `npm run lint` limpos; `npx vitest run tests/unit/ui-shell` verde (inclui l.66 paridade e as 2 listas novas); `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/shell.spec.ts tests/e2e/navigation.spec.ts` verde (as 2 listas novas e `toBeInViewport` da folha); captura headless: `after-f12-sidebar-{classic,black}-desktop.png` (comparar com `shell-sidebar-*-desktop.png`: "Tipos" em 5o com icone proprio, ativo ao clicar, rodape visivel), `after-f12-more-sheet-{classic,black}-phone.png` (com `shell-more-sheet-*-phone.png`: "Tipos" + "Quem vence quem" em 1o) e `after-f12-tabbar-classic-phone.png` (com `shell-tabbar-*-phone.png`: "Mais" ativo com "Tipos" aberto); no spec temporario: `history.length` sobe 1 ao abrir "Tipos" pela sidebar e `page.url()` nao muda de caminho. `responsive.spec.ts` NAO roda aqui (F1.3, logo em seguida).
  - commit: 
  - status: pending

- [ ] **F1.3** Baselines visuais do responsive (10o item da sidebar) (categoria: outro)
  - Done when: os 7 testes de tema verdes sem `--update-snapshots`; diff = 14 PNGs; tabela do passo 7 no STATE com 100% dos pixels diferentes em `x < 236`; `maxDiffPixelRatio` continua `0.02` (`git diff -- tests/e2e/responsive.spec.ts` vazio).
  - commit: 
  - status: pending

### Fase F2: Visao por tipo (principal)

- [ ] **F2.1** Modelo puro `types-model.ts` (categoria: frontend)
  - Done when: `npm run typecheck` e `npm run lint` limpos; script `npx tsx -e` (scratchpad) imprime para fire/normal/electric/ghost/steel exatamente os grupos da secao 5.5 e as contagens 51/61/8/204 de `matrixRows()`; `nextSelection` reproduz as 5 linhas da tabela; captura `after-f21-types-classic-desktop.png` (tela ainda so com titulo: nada visual muda; o modelo ainda nao e usado).
  - commit: 
  - status: pending

- [ ] **F2.2** Legenda, seletor de visao, grade de tipos e bloco heroi (categoria: frontend)
  - Done when: typecheck/lint limpos; `npx vitest run tests/unit/ui-shell` verde; capturas `after-f22-empty-{classic,black}-{desktop,phone}.png` (sem tipo; comparar a grade com `dex-typechips-*.png`, o seletor com `dex-seg-status-*.png`, a legenda/painel com `detail-panel-weak-*.png`) e `after-f22-fire-{classic,black}-{desktop,phone}.png` (Fogo escolhido: chip com anel + check como `dex-typechips-selected-*.png`, heroi com icone 64/56 px, nome "Fogo" e a frase "Fogo queima Planta e Gelo, mas Água apaga Fogo") e `after-f22-fire-focus-classic-desktop.png` (Tab ate o chip de Fogo: anel 2px visivel, comparar com `dex-typechip-focus-*`); no spec temporario `expectNoOverlap(".types-screen")` a 360/390/1280 nos dois estados, `history.length` inalterado depois de 5 escolhas, e o chip selecionado e o UNICO com `aria-pressed="true"`.
  - commit: 
  - status: pending

- [ ] **F2.3** Abas Atacando/Defendendo e faixas coloridas (categoria: frontend)
  - Done when: typecheck/lint limpos; capturas `after-f23-fire-attack-{classic,black}-{desktop,phone}.png` e `after-f23-fire-defend-{classic,black}-{desktop,phone}.png` (comparar os tons com as pilulas de `detail-calc-grass-flying-*.png`: verde = `x½`, laranja = `x2`, cinza = `x0`; e o painel com `detail-panel-weak-*.png`), `after-f23-normal-attack-classic-phone.png` ("nenhum" em "Forte contra (x2)") e `after-f23-steel-defend-classic-phone.png` (10 icones quebrando linha); no spec temporario, para Fogo, os `data-type` de cada faixa = `attackGroups`/`defendGroups` calculados no proprio teste a partir de `TYPE_CHART` e os `data-tone` = `adv,dis,zero` (Atacando) e `dis,adv,zero` (Defendendo); `getComputedStyle(.tp-band).backgroundColor` = `rgb(225, 245, 231)` / `rgb(255, 233, 214)` / `rgb(230, 231, 236)` conforme o tom; `expectNoOverlap(".types-screen")` a 360/390/1280, PT e EN, nas duas abas.
  - commit: 
  - status: pending

### Fase F3: Tabela completa (matriz 18 x 18)

- [ ] **F3.1** Matriz com cabecalhos clicaveis e coluna fixa (categoria: frontend)
  - Done when: typecheck/lint limpos; capturas `after-f31-chart-empty-{classic,black}-desktop.png`, `after-f31-chart-fire-{classic,black}-desktop.png` (linha e coluna do Fogo destacadas; celula Agua x Fogo verde com "2"), `after-f31-chart-fire-grayscale-classic-desktop.png` (com `document.documentElement.style.filter = "grayscale(1)"`: destaque continua visivel), `after-f31-chart-fire-{classic,black}-phone.png` (scroll 0) e `after-f31-chart-fire-scrolled-classic-phone.png` (`scrollLeft = 200`: coluna fixa opaca sobre as celulas); comparar a tipografia das celulas e os tons com `detail-calc-grass-flying-*.png` (pilulas) e o painel com `detail-panel-weak-*.png`; no spec temporario: 324 `td`, `getByRole("cell", { name: "Fogo contra Planta: x2" })` com texto "2", clicar no cabecalho de coluna "Água defende (coluna)" deixa `[data-axis=col][data-type=water]` e `[data-axis=row][data-type=water]` com `aria-pressed="true"` e a pagina na tabela; `expectNoOverlap(".types-screen")` com `scrollLeft = 0` a 360/390/1280; `#main` sem conteudo passando da borda direita.
  - commit: 
  - status: pending

### Fase F4: Defesa com 2 tipos `[COULD]`

- [ ] **F4.1** Segundo tipo na defesa (categoria: frontend)
  - Done when: typecheck/lint limpos; `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts` verde; capturas `after-f41-water-ground-{classic,black}-{desktop,phone}.png` (5 faixas; Planta em "Muito fraco contra (recebe x4)", Eletrico em "Imune a (x0)"; dois icones no heroi; comparar tons x4/x1/4 com `detail-calc-grass-flying-*.png`), `after-f41-water-ground-attack-classic-desktop.png` (aba Atacando: 1 icone, sem `select`) e `after-f41-select-focus-classic-desktop.png` (foco por Tab no `select`: anel 2px); no spec temporario, Agua + Voador poe Eletrico em x4, e `expectNoOverlap(".types-screen")` a 360/390/1280 com o 2o tipo.
  - commit: 
  - status: pending

### Fase F5: Fechamento

- [ ] **F5.1** Varredura de codigo morto (nada a remover) (categoria: outro)
  - Done when: relatorio (passo, comando, saida, decisao) no checklist; suite + build verdes.
  - commit: 
  - status: pending

### Fase T1: Testes (definidos aqui, escritos na etapa de testes) e inventario do porte

- [ ] **T1.1** Modelo puro, frases de intuicao e i18n (unitarios) (categoria: outro)
  - Done when: `npx vitest run tests/unit/ui-screens/types-model.test.ts tests/unit/ui-screens/types-hints.test.ts` verde.
  - commit: 
  - status: pending

- [ ] **T1.2** Tela com Testing Library (categoria: outro)
  - Done when: `npx vitest run tests/unit/ui-screens/types-screen.test.tsx` verde; `npx vitest run --coverage` com `src/screens/**` >= 70/70 e global >= 80/80 (`vitest.config.ts`).
  - commit: 
  - status: pending

- [ ] **T1.3** e2e headless da pagina (categoria: outro)
  - Done when: `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/types.spec.ts` verde e `npx playwright test tests/e2e/types.spec.ts` (build + preview) verde.
  - commit: 
  - status: pending

- [ ] **T1.4** Regressao completa contra a linha de base (categoria: outro)
  - Done when: os 7 passos verdes e os numeros (testes, cobertura, bytes) no STATE.
  - commit: 
  - status: pending

- [ ] **T1.5** Porte: inventario (categoria: outro)
  - Done when: inventario no STATE e o passo 1 batendo.
  - commit: 
  - status: pending

---

## Notas por fase


## Bugs encontrados

| Fase/Feature | Descricao | Causa | Correcao / commit |
|---|---|---|---|
