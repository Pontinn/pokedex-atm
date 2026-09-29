# CHECKLIST - spawn-bait

- Feature: spawn-bait (iscas de spawn: Poke-Lanche e Pokeisca)
- Branch: `feature/spawn-bait`
- Baseline HEAD: `ff3a26b0`
- Criada em: 2026-09-29
- SPEC: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/in-progress/spawn-bait/SPEC_spawn-bait.md`
- Legenda: `[ ]` pendente · `[~]` em andamento · `[x]` concluido (commit existe) · `[!]` bloqueado

## Backend

> Nota (janela quebrada B1.1 -> B2.3): B1.1 torna `fishing`/`bait` obrigatorios; ate B2.3 republicar, `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` falham e o app/e2e nao abrem. Por isso todo "Done when" de B1.x e B2.1/B2.2 roda o vitest com `--exclude tests/unit/data/published-schemas.test.ts --exclude tests/unit/dataset/join.test.ts`; os dois voltam e TEM de passar em B2.3. O Frontend so comeca depois de B2.3 verde. Nunca publicar em `public/` antes de B2.3. O agente de backend anota a janela nas notas do checklist e no HANDOFF.

### Fase B1: Contrato e pipeline

- [x] **B1.1** Contrato do dataset (tipos, zod e fixtures) `[category: estrutura]`
  - Done when: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts --exclude tests/unit/dataset/join.test.ts` verde com o dataset ATUAL (os dois arquivos excluidos validam o dataset PUBLICADO com os schemas, `join.test.ts:91` e `:140`, e so voltam a passar em B2.3; o app e o e2e tambem ficam quebrados de B1.1 ate B2.3; o agente de backend registra isso nas notas do checklist e no HANDOFF); o pipeline no snapshot (comando das regras gerais) roda sem erro e todo `species/*.json` tem `"fishing":null` e todo item `"bait":null`.
  - commit: (ver commit feat(data): contrato do spawn-bait)
  - status: done

- [ ] **B1.2** Condicoes de pesca tipadas no spawn `[category: build]`
  - Done when: pipeline no snapshot; em `tools/dataset/out/_sb_pub/data/<versao>/species/`: `120.json` spawn `allthemons:staryu-10` igual ao exemplo da secao 5.3 (fishing e extra); `194.json` `cobblemon:wooper-true-16` com `rodBall "cobblemon:love_ball"` e 2 multiplicadores; `704.json` Goomy `minLureLevel 2, maxLureLevel 2`; script de contagem (node inline) sobre todos os `species/*.json`: 143 spawns com `fishing.minLureLevel != null`, 3 com `maxLureLevel`, 3 com `bait`, 6 com `rodType`, soma de `lureMultipliers` = 357 (159 singular + 198 da lista), e 0 ocorrencias de `minLureLevel`/`maxLureLevel`/`rodType`/`bait` dentro de `extra`; `species` em bytes <= 5.693.585.
  - commit: 
  - status: pending

- [ ] **B1.3** Efeitos de isca e temperos aceitos em items.json `[category: build]`
  - Done when: pipeline no snapshot; em `items.json`: `cobblemon:occa_berry.bait` igual ao exemplo da secao 5.3 (texto PT e EN exatos); `cobblemon:lum_berry.bait.effects` = 2 `eggGroup` (`dragon`, `monster`); `cobblemon:starf_berry` tem `shinyReroll` com texto en "100% - 5× Shiny Chance"; nenhum `subcategory` com ":" (script inline); 73 itens com `bait != null` nesta etapa (os 72 bagas/frutas ja no catalogo + `poke_bait`; conferir contagem real e registrar); `cobblemon:pecha_berry.bait.seasoning === true`; `items.json` em bytes <= 1.659.908.
  - commit: 
  - status: pending

- [ ] **B1.4** Catalogo com os 8 itens novos, tag/categoria e ingredientes da panela `[category: build]`
  - Done when: pipeline no snapshot; `items.json`: `cobblemon:poke_snack` igual ao exemplo da secao 5.3 (categoria `bait`, tag `bait`, `cooking: null`, `potRecipes` com os 4 ingredientes 3/2/1/3 nessa ordem); `cobblemon:poke_bait` com `potRecipes` mel x1, `c:mushrooms` x1, `minecraft:wheat` x1 (`name.pt` "Trigo"); nenhum outro item com `potRecipes` (script inline: exatamente 2); os 9 itens da regra de categoria (secao 2.4 item 7) com `category: "bait"` e as 72 bagas com `berry`; `minecraft:golden_apple` e `minecraft:enchanted_golden_apple` presentes com tag `bait` (a textura vanilla ja resolve pelo `publishVanillaTextures` se B1.5 ja copiou os modelos; senao registrar e seguir); `tools/dataset/out/_sb_stage/report.json` secao `recipes` com as mesmas chaves e contagens de antes (`recipeIds`, `status`, `removedByKubejsTotal` iguais aos do report anterior do mesmo snapshot); `npx vitest run tests/unit/dataset/recipes.test.ts` verde.
  - commit: 
  - status: pending

- [ ] **B1.5** Texturas dos itens novos e copia para o snapshot `[category: build]`
  - Done when: pipeline no snapshot; os 8 ids em `items.json` com `texture` nao nula e arquivo existente em `tools/dataset/out/_sb_pub/assets/items/` (`minecraft/golden_apple.png` etc., `allthemodium/allthemodium_apple.png`, `cobblemon/food/poke_snack.png`); texturas distintas referenciadas por `items.json` = 931 (< 1200); abrir os 7 PNGs novos com o Read (conferencia visual).
  - commit: 
  - status: pending

### Fase B2: Snapshot, auditoria e publicacao

- [ ] **B2.1** Paridade do snapshot para os ids novos e checagem byte a byte `[category: outro]`
  - Done when: `cmp` sem saida entre `_sb_inst/data/<v>/items.json` e `_sb_snap/data/<v>/items.json` e entre cada par de `species/<dex>.json` (1027), e as duas `datasetVersion` iguais; o resultado (hash sha256 dos dois `items.json`) anotado no paragrafo do README do snapshot.
  - commit: 
  - status: pending

- [ ] **B2.2** Auditoria com checks de isca, tempero, receita e pesca `[category: outro]`
  - Done when: `run.ts` contra `_sb_snap` imprime `divergencias {}` (0 em todas as severidades) com o numero de checks maior que 43102 (checks novos contados); `AUDIT_REPORT.md` com a tabela da rodada 5 toda 0; `npx vitest run tests/unit/dataset/audit.test.ts` verde.
  - commit: 
  - status: pending

- [ ] **B2.3** Republicar o dataset `[category: build]`
  - Done when: `current.json` com `datasetVersion` != `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba`; `published-schemas.test.ts` e `join.test.ts` verdes; os 3 numeros dentro das metas; `items.json` publicado identico (sha256) ao de `_sb_snap` e `_sb_inst` (mesmo conteudo).
  - commit: 
  - status: pending

## Frontend

> Nota: o Frontend so comeca depois de B2.3 verde. Toda feature de frontend so fica verde depois de renderizada headless (dev server + spec temporario apagado antes do commit; PNGs `after-*` versionados em `ui-refs/`), conforme "Regras gerais" do SPEC.

### Fase F1: Ficha do Pokemon (bloco "Iscas" e pesca na linha do spawn)

- [ ] **F1.1** Textos i18n do bloco, da pesca e dos efeitos `[category: frontend]`
  - Done when: `npx vitest run tests/unit/ui-foundation/i18n.test.tsx tests/unit/ui-shell/i18n-modules.test.ts` verde; `npm run lint` limpo; captura headless (regra geral) da ficha do Charizard sem mudanca visual (as chaves ainda nao sao usadas): `after-detail-charizard-i18n-pt.png` igual a `detail-where-charizard-pt.png`.
  - commit: 
  - status: pending

- [ ] **F1.2** Regra das 3 melhores bagas (dominio puro) `[category: outro]`
  - Done when: com o `items.json` publicado (B2.3) e as fichas reais, um teste rapido em node (`npx tsx -e` importando `src/domain/bait.ts`) imprime: dex 6 -> `occa_berry(fire), coba_berry(flying), lum_berry(dragon/monster)`; 130 -> `passho, coba, aspear`; 95 -> `charti, shuca, persim`; 129 -> `passho, aspear, lum`; 120 -> `passho, pecha` (2); 132 -> `chilan` (1); 172 -> `wacan` (1); 194 -> `passho, shuca, aspear`; 349 -> `passho, aspear, lum`; `baitContexts` 6 -> snack so, 349 -> rod so, 129 -> ambos, 1011 -> null; boosters = 7 ids (`allthemodium:allthemodium_apple`, `allthemodium:allthemodium_carrot`, `cobblemon:starf_berry`, `minecraft:enchanted_golden_apple`, `minecraft:glistering_melon_slice`, `minecraft:golden_apple`, `minecraft:golden_carrot`); pior tempo de `recommendBerries` nas 1027 fichas < 5 ms e `buildBaitIndex` < 5 ms. Os testes definitivos sao T1.1.
  - commit: 
  - status: pending

- [ ] **F1.3** Bloco "Iscas" no painel "Onde encontrar" `[category: frontend]`
  - Done when: dev server + spec temporario (regra geral): capturas `after-detail-where-charizard-{pt,en,pt-mobile}.png`, `after-detail-where-magikarp-fishing-{pt,en,pt-mobile}.png`, `after-detail-where-staryu-lure-{pt,en,pt-mobile}.png`, `after-detail-where-wooper-fishing-{pt,en,pt-mobile}.png`, `after-detail-where-no-spawn-1011-{pt,en,pt-mobile}.png` em `ui-refs/`; comparadas com as "antes" do UISPEC secao 2: tudo o que existia igual e o bloco novo entre spawns e drops; no spec temporario: Charizard `[data-bait-berry]` = `occa_berry, coba_berry, lum_berry` na ordem e texto do bloco com "(Fogo)", "(Voador)", "(Dragão/Monstro)"; Magikarp 2 `[data-bait-row]`; 1011 `[data-bait]` count 0; o texto de `[data-bait]` nao casa `/x\d/`; e os asserts existentes de `tests/e2e/detail.spec.ts` bloco "F5.1" (linhas 413-490) rodados com `PW_DEV=1 PW_PORT=4177 npx playwright test tests/e2e/detail.spec.ts -g "F5.1"` verdes; `expectNoOverlap` em `#where-panel` a 360/390/1280 PT e EN (ja coberto pelo teste "where panel without overlap", que usa o Mewtwo; rodar tambem manualmente no spec temporario para o Gyarados).
  - commit: 
  - status: pending

- [ ] **F1.4** Condicoes de pesca na linha do spawn `[category: frontend]`
  - Done when: capturas `after-detail-where-wooper-fishing-expanded-{pt,en}.png` (apos "Mostrar todas") e `after-detail-where-staryu-lure-expanded-{pt,en,pt-mobile}.png` em `ui-refs/`; no spec temporario: `[data-spawn='cobblemon:wooper-true-17'] [data-fishing] [data-item='cobblemon:love_sweet']` visivel e clicavel (abre a pagina, Voltar volta); `[data-spawn='allthemons:staryu-10'] [data-fishing]` contem "Lure 3+: x3"; os asserts do Mewtwo (`entry.locator(".badge")` "Ultra-raro", `.tag` "Cobblemon Community Content") continuam verdes (`-g "F5.1"`).
  - commit: 
  - status: pending

### Fase F2: Pagina do item (efeitos e receita da panela)

- [ ] **F2.1** Painel "Efeitos de isca" na pagina do item `[category: frontend]`
  - Done when: capturas `after-item-occa_berry-{pt,en,pt-mobile}.png`, `after-item-lum_berry-{pt,en,pt-mobile}.png`, `after-item-enchanted_golden_apple-{pt,en}.png` em `ui-refs/` (comparar com `item-occa_berry-*`/`item-lum_berry-*` do UISPEC: hero e "Como obter" iguais, painel novo abaixo); no spec temporario: Occa `[data-bait-effects]` contem "Tipo Fogo" (PT) e "Fire Types" (EN); maca dourada encantada contem "+10" e "6×"; `.item-obtain .ob-row` do Occa com a mesma contagem de antes; `expectNoOverlap` na pagina a 360/390/1280.
  - commit: 
  - status: pending

- [ ] **F2.2** Ingredientes da receita da Panela de Fogueira `[category: frontend]`
  - Done when: capturas `after-item-poke_snack-{pt,en,pt-mobile}.png`, `after-item-poke_bait-{pt,en,pt-mobile}.png`, `after-items-list-bait-{pt,en,pt-mobile}.png` (lista Itens, aba "Iscas" `[data-icat="bait"]`, comparar com `items-list-iscas-*` do UISPEC) em `ui-refs/`; no spec temporario: Poke-Lanche `[data-pot-recipe]` com 4 `.pot-ing` na ordem leite(3x, "Qualquer leite"), `[data-item='minecraft:honey_bottle']` (2x), `[data-item='cobblemon:vivichoke']` (1x), `[data-item='cobblemon:hearty_grains']` (3x) + nota dos 3 temperos; hero com chip "Iscas" e sem `.item-cooking-note`; Pokeisca com chip "Iscas" (era "Outros", decisao de categoria); na lista, os cards dos 7 itens novos e do `poke_bait` com chip "Iscas" e os das bagas com chip de bagas; Pokeisca: `[data-ingredient='minecraft:wheat'] button` count 0 e texto "Trigo"; "Qualquer cogumelo"; "Panela de Fogueira" no badge; aba Iscas lista os 8 ids novos (`[data-item]` de cada um visivel).
  - commit: 
  - status: pending

## Testes

> Sprint T1 e dedicada e final (prerequisito: B1, B2, F1, F2 completos). Testes de backend/pipeline/contrato sao escritos pelo agente de backend; de dominio, RTL e e2e pelo agente de frontend (atribuicao inferida dos arquivos de cada feature no SPEC).

### Fase T1: Testes (definidos aqui, escritos na etapa de testes)

- [ ] **T1.1** Unitarios da regra das 3 melhores `[category: teste]`
  - escrito por: frontend (dominio)
  - Done when: `npx vitest run tests/unit/domain/bait.test.ts` verde; cobertura de `src/domain/bait.ts` >= 95/95.
  - commit: 
  - status: pending

- [ ] **T1.2** Pipeline (pesca, efeitos, kubejs, tempero, receitas, catalogo, midia) `[category: teste]`
  - escrito por: backend
  - Done when: `npx vitest run tests/unit/dataset` verde; cobertura `tools/dataset/src/**` >= 80/80.
  - commit: 
  - status: pending

- [ ] **T1.3** Contrato publicado e paridade com o dataset real `[category: teste]`
  - escrito por: backend
  - Done when: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
  - commit: 
  - status: pending

- [ ] **T1.4** RTL do bloco, dos chips de pesca e da pagina do item `[category: teste]`
  - escrito por: frontend
  - Done when: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70 e `src/components/**` >= 70/70.
  - commit: 
  - status: pending

- [ ] **T1.5** e2e headless (ficha, pagina do item, lista) sem quebrar contagens existentes `[category: teste]`
  - escrito por: frontend
  - Done when: `npx playwright test tests/e2e/detail.spec.ts tests/e2e/item.spec.ts tests/e2e/items.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
  - commit: 
  - status: pending

- [ ] **T1.6** Regressao completa, qualidade, PWA, auditoria e byte a byte `[category: teste]`
  - escrito por: backend + frontend (regressao final, so anotacoes no STATE)
  - Done when: todos os 9 passos verdes e os numeros (testes, cobertura, checks da auditoria, sha256 dos `items.json`) anotados no STATE.
  - commit: 
  - status: pending

## Notas por fase

- 2026-09-29 (backend, B1.1): janela quebrada B1.1 -> B2.3 aberta. Com o contrato novo (fishing/bait obrigatorios), `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` falham contra o dataset publicado antigo, e o app/e2e nao abrem, ate B2.3 republicar. Vitest de B1.x/B2.1/B2.2 roda com os 2 excluidos. Fixtures tipadas de `tests/unit/ui-screens/*`, `tests/e2e/item-obtain-v2.spec.ts` e `tests/unit/domain/ball-ranking.test.ts` ganharam `bait: null`/`fishing: null` (lista da SPEC B1.1).

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Fix / commit |
|---|---|---|---|
