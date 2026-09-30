# CHECKLIST - berry-mutations

Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` feito (commit existe) · `[!]` bloqueado

- Feature: berry-mutations (cruzamento de bagas na pagina do item e tag/filtro de origem na listagem)
- Branch: feature/berry-mutations (base main `3134cd43`)
- HEAD baseline: `bc113bd91c43`
- Criado em: 2026-09-30
- SPEC: SPEC_berry-mutations.md

## Pre-flight

- [x] Rodar a suite completa uma vez antes de implementar (baseline da main 3134cd43 ja registrado no STATE: tudo verde exceto join.test.ts por falta de cache da PokeAPI no worktree; confirmar que passa na pasta principal)
  - 2026-09-30, pasta principal, HEAD 5b7e4396 (so artefatos .forge acima da main): typecheck ok; lint ok; vitest 84/84 arquivos, 694 testes ok, 0 falha (join.test.ts verde, cache da PokeAPI presente); Playwright 237 ok / 0 falha / 16 skipped (3,0 min). Nenhum flake; nenhuma falha preexistente.

Janela quebrada planejada (SPEC 2.4 item 11): de B1.1 ate B2.2 `tests/unit/data/published-schemas.test.ts` falha e fica excluido (`npx vitest run --exclude tests/unit/data/published-schemas.test.ts`); nenhum e2e roda na janela; o Frontend so comeca depois de B2.2 verde.

---

# BACKEND

## Fase B1: Contrato e pipeline

- [ ] **B1.1** Contrato do dataset (tipo, zod, placeholder e fixtures)
  - categoria: estrutura
  - Done when: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde (janela quebrada aberta: `published-schemas.test.ts` le o `items.json` publicado sem `berry` e so volta em B2.2; nenhum e2e roda ate B2.2; anotar no checklist e no HANDOFF); pipeline no snapshot (regra geral) roda sem erro e todo item do `items.json` gerado tem `"berry":null`.
  - commit: 
  - status: pendente

- [ ] **B1.2** Origem e cruzamentos das bagas no pipeline
  - categoria: build
  - Done when: pipeline no snapshot (regra geral); em `tools/dataset/out/_bm_pub/data/<versao>/items.json`: `cobblemon:cheri_berry`, `cobblemon:lum_berry` e `cobblemon:liechi_berry` com `berry` byte a byte igual a secao 5.3; script inline (node) sobre o arquivo: 70 itens com `berry` nao nulo, todos com `category === "berry"`; 31/40/77/154 (spawn/resultados/pares/usos) iguais ao recalculo independente direto dos 70 arquivos do snapshot (o script le `data-source/.../berries/*.json`, nao o pipeline); `tools/dataset/out/_bm_stage/report.json` sem nenhum aviso `W_BERRY_*`; rota `plantable` das 110 com `plantable` identica a do `items.json` publicado atual (comparacao por id); tamanho do `items.json` <= 1.659.908 bytes; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde.
  - commit: 
  - status: pendente

## Fase B2: Auditoria e publicacao

- [ ] **B2.1** Auditoria com checks de origem e cruzamento
  - categoria: outro
  - Done when: `run.ts` contra `_bm_pub` imprime `divergencias {}` (0 em todas as severidades) com numero de checks MAIOR que 46558 (baseline da Rodada 5) e pelo menos 210 checks novos (70 x 3); `AUDIT_REPORT.md` com a Rodada 6 toda 0; `npx vitest run tests/unit/dataset/audit.test.ts` verde.
  - commit: 
  - status: pendente

- [ ] **B2.2** Paridade, determinismo e republicacao do dataset
  - categoria: build
  - Done when: `current.json` com `datasetVersion` nova (diferente de `...-2ef2f512`); `published-schemas.test.ts` e `join.test.ts` verdes; `items.json` instancia = snapshot = publicado (sha256 anotado no HANDOFF); passo 4 sem diferenca; tamanho dentro do teto; auditoria 0; `npx vitest run` inteiro verde.
  - commit: 
  - status: pendente

---

# FRONTEND

O Frontend so comeca depois de B2.2 verde.

## Fase F1: Pagina do item (Encontrada no mundo, Cresce melhor em, Como cruzar, Usada em cruzamento)

- [ ] **F1.1** Textos i18n (pagina e listagem)
  - categoria: frontend
  - Done when: `npx vitest run tests/unit/ui-foundation/i18n.test.tsx tests/unit/ui-shell/i18n-modules.test.ts` verde; `npm run lint` e `npm run typecheck` limpos; captura headless (regra geral) da pagina da Occa `after-f11-occa-pt.png` sem nenhuma mudanca visual (as chaves ainda nao sao usadas).
  - commit: 
  - status: pendente

- [ ] **F1.2** Regras puras de origem, linhas e agrupamento
  - categoria: outro
  - Done when: teste rapido em node (`npx tsx -e` importando os dois modelos e o `items.json` publicado de B2.2) imprime: `berryOrigins` com contagens 30/39/1 (so world/so mutation/ambas) e 0 para nao-bagas; `pageObtainRoutes` da Occa = `craftable, drop, structureLoot` e `berryObtainExtras` = `berryWorld, berryGrowth`; Eggant extras = `berryGrowth, mutation`; Red Apricorn com `pageObtainRoutes` identico a `obtainRows` e extras `[]`; `groupMutationPairs` de Lum, Figy, Enigma e `groupMutationUses` de Cheri, Oran, Lum iguais aos exemplos da secao 2.4 item 8; `filterByOrigin(list, "all") === list`; `npm run typecheck` limpo.
  - commit: 
  - status: pendente

- [ ] **F1.3** "Encontrada no mundo" e "Cresce melhor em" no lugar do "Plantavel" das bagas
  - categoria: frontend
  - Done when: capturas `after-item-occa-{pt,en,pt-390}.png`, `after-item-oran-pt.png`, `after-item-liechi-pt.png`, `after-item-sitrus-pt.png`, `after-item-red_apricorn-pt.png` em `ui-refs/`; no spec temporario: Occa `.item-obtain .ob-row` = 5 com `data-row` na ordem `craftable, drop, structureLoot, berryWorld, berryGrowth`; Occa `[data-row='berryWorld']` contem "Nasce sozinha em:"; Oran `[data-row='berryWorld']` contem "qualquer bioma" e 0 `.biome`; Liechi `[data-row='berryWorld']` contem "Mirage Ilha"; Sitrus 0 `[data-row='berryWorld']` e 1 `[data-row='berryGrowth']`; Red Apricorn com `[data-row='plantable']` e texto "Pode ser plantado" iguais aos de hoje e 0 linhas novas; `expectNoOverlap(".item-screen")` a 360/390/1280; `npx vitest run tests/unit/ui-screens` verde; `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/item.spec.ts` verde (com o 5 da linha 259).
  - commit: 
  - status: pendente

- [ ] **F1.4** Linha "Como cruzar" (pares clicaveis, chance e mecanica)
  - categoria: frontend
  - Done when: capturas `after-item-lum-{pt,en,pt-390}.png`, `after-item-enigma-{pt,pt-390,pt-360}.png`, `after-item-eggant-pt.png`, `after-item-starf-pt.png`, `after-item-liechi-pt.png` (refeita) em `ui-refs/`; no spec temporario: Lum `[data-row='mutation'] [data-mut-fixed='cobblemon:oran_berry']` com 6 `button[data-item]` (Oran + 5), asserts POR PARTES: `[data-mut-chance]` contem "12,5%" e "50% com" e `[data-mut-chance] button[data-item='cobblemon:surprise_mulch']` contem "Adubo Surpresa"; em EN (interface e card) `[data-mut-chance]` contem "12.5%" e "50% with" e o botao da mulch contem "Surprise Mulch"; e o `textContent` de `[data-mut-chance]` normalizado (`replace(/\s+/g, " ")`) contem "50% com Adubo Surpresa"; Enigma com 19 `button[data-item]` no grupo (Hopo + 18), todos visiveis e sem `.ob-more`; Figy com 1 grupo Cheri + Persim; Starf -> clique Pomeg -> Sitrus -> Lum -> Oran, cada pagina com a propria linha (Oran sem `mutation` e com `berryWorld`), e `page.goBack()` volta passo a passo; `expectNoOverlap(".item-screen")` da Enigma a 360/390/1280.
  - commit: 
  - status: pendente

- [ ] **F1.5** "Usada em cruzamento" no Usado em
  - categoria: frontend
  - Done when: capturas `after-item-cheri-{pt,en}.png`, `after-item-hopo-pt-360.png`, `after-item-oran-used-pt.png`, `after-item-lum-used-pt.png` em `ui-refs/`; no spec temporario: Cheri `.item-used [data-row='mutationUses'] [data-mut-result]` = 2 (`cobblemon:figy_berry`, `cobblemon:lum_berry`, nessa ordem) e clicar Oran abre a Oran e `goBack()` volta a Cheri; Oran com 2 grupos (leppa, lum) de 5 parceiros cada; Lum tem `[data-row='mutation']` em `.item-obtain` e `[data-row='mutationUses']` em `.item-used`; Starf com 0 `mutationUses`; `.item-used [data-row]` da Occa comeca pelas mesmas linhas de hoje e termina em `mutationUses`; `expectNoOverlap(".item-screen")` do Hopo a 360/390/1280.
  - commit: 
  - status: pendente

## Fase F2: Listagem de itens (tag e filtro de origem)

- [ ] **F2.1** Tag de origem nos cards das bagas
  - categoria: frontend
  - Done when: capturas `after-items-berries-{pt,en,pt-360,pt-390}.png`, `after-items-berries-pt-black.png`, `after-items-iscas-pt.png`, `after-items-search-ber-pt.png` em `ui-refs/` (comparar com `recon-items-*`); no spec temporario: aba Berries com 70 cards e `.item-origin` = 71 (70 + a segunda da Liechi); Occa `[data-origin='world']`, Sitrus `[data-origin='mutation']`, Liechi os dois; cards de apricorn e mint sem `.item-origins`; `.item-tag` da Occa "Berries" acima de `.item-name` (mesma medida de `items.spec.ts:74-76`); `expectNoOverlap("#item-grid")` a 360/390/1280 PT e EN na aba Berries; `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/items.spec.ts` verde sem mudar nenhum assert.
  - commit: 
  - status: pendente

- [ ] **F2.2** Filtro de origem na listagem
  - categoria: frontend
  - Done when: capturas `after-items-filter-mutation-pt.png`, `after-items-filter-world-pt-390.png`, `after-items-filter-empty-pt.png` (Medicina + Mutacao), `after-items-filter-pt-360.png` em `ui-refs/`; no spec temporario: `#item-grid[data-count]` = 40 (Berries + Mutacao), 31 (Berries + Mundo) e 40 (Iscas + Mutacao); Medicina + Mutacao mostra `.items-screen .empty-state`; com "Todos" a contagem de cada aba e igual a de antes; abrir Sitrus com filtro Mutacao e `page.goBack()` volta com o botao Mutacao `aria-pressed="true"` e a mesma aba; `expectNoOverlap(".items-screen .item-top")` a 360/390/1280 PT/EN; `.item-origin-filter` sem rolagem vertical; `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/items.spec.ts tests/e2e/responsive.spec.ts` verde sem mudar assert.
  - commit: 
  - status: pendente

---

# TESTES (Sprint final)

## Fase T1: Testes (definidos no SPEC, escritos na etapa de testes)

Prerequisito: B1, B2, F1, F2 completos (T1.1 e T1.2 podem ser escritos logo depois de B2.2; T1.6 fica para o fim). O SPEC nao declara explicitamente o lado dono de cada T1.x (a secao 6 diz apenas "Sprint final T1: testes"); o campo `lado` abaixo e inferido dos arquivos da feature.

- [ ] **T1.1** Pipeline e auditoria (origem e cruzamentos)
  - categoria: outro
  - lado: backend (inferido: tests/unit/dataset, pipeline e auditoria)
  - Done when: `npx vitest run tests/unit/dataset/berry-mutations.test.ts tests/unit/dataset/audit.test.ts` verde; cobertura de `tools/dataset/src/**` >= 80/80.
  - commit: 
  - status: pendente

- [ ] **T1.2** Contrato publicado e dataset real
  - categoria: outro
  - lado: backend (inferido: contrato de dados e dataset publicado)
  - Done when: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
  - commit: 
  - status: pendente

- [ ] **T1.3** Regras puras com o dataset real
  - categoria: outro
  - lado: frontend (inferido: tests/unit/ui-screens, funcoes de src/screens)
  - Done when: `npx vitest run tests/unit/ui-screens/berry-model.test.ts` verde; as funcoes novas com >= 95% de linhas cobertas.
  - commit: 
  - status: pendente

- [ ] **T1.4** RTL da pagina do item e da listagem
  - categoria: outro
  - lado: frontend (inferido: RTL de telas)
  - Done when: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70.
  - commit: 
  - status: pendente

- [ ] **T1.5** e2e headless (pagina, listagem, temas, offline) sem quebrar os existentes
  - categoria: outro
  - lado: frontend (inferido: e2e da UI)
  - Done when: `npx playwright test tests/e2e/item.spec.ts tests/e2e/items.spec.ts tests/e2e/item-obtain-v2.spec.ts tests/e2e/detail.spec.ts tests/e2e/responsive.spec.ts tests/e2e/pwa-offline.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
  - commit: 
  - status: pendente

- [ ] **T1.6** Regressao completa, qualidade, auditoria e byte a byte
  - categoria: outro
  - lado: ambos (inferido: regressao completa, sem arquivo de codigo; numeros vao para o STATE)
  - Done when: os 9 passos verdes e os numeros (testes, cobertura, checks da auditoria, sha256 do `items.json`, bytes) anotados no STATE.
  - commit: 
  - status: pendente

---

## Notas por fase

(vazio, preenchido pelo agente de implementacao: desvios e bloqueios)

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Correcao / commit |
|---|---|---|---|
