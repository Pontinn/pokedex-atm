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
  - commit: fd0291ab
  - status: done

- [x] **B1.2** Condicoes de pesca tipadas no spawn `[category: build]`
  - Done when: pipeline no snapshot; em `tools/dataset/out/_sb_pub/data/<versao>/species/`: `120.json` spawn `allthemons:staryu-10` igual ao exemplo da secao 5.3 (fishing e extra); `194.json` `cobblemon:wooper-true-16` com `rodBall "cobblemon:love_ball"` e 2 multiplicadores; `704.json` Goomy `minLureLevel 2, maxLureLevel 2`; script de contagem (node inline) sobre todos os `species/*.json`: 143 spawns com `fishing.minLureLevel != null`, 3 com `maxLureLevel`, 3 com `bait`, 6 com `rodType`, soma de `lureMultipliers` = 357 (159 singular + 198 da lista), e 0 ocorrencias de `minLureLevel`/`maxLureLevel`/`rodType`/`bait` dentro de `extra`; `species` em bytes <= 5.693.585.
  - commit: 400300dd
  - status: done

- [x] **B1.3** Efeitos de isca e temperos aceitos em items.json `[category: build]`
  - Done when: pipeline no snapshot; em `items.json`: `cobblemon:occa_berry.bait` igual ao exemplo da secao 5.3 (texto PT e EN exatos); `cobblemon:lum_berry.bait.effects` = 2 `eggGroup` (`dragon`, `monster`); `cobblemon:starf_berry` tem `shinyReroll` com texto en "100% - 5× Shiny Chance"; nenhum `subcategory` com ":" (script inline); 73 itens com `bait != null` nesta etapa (os 72 bagas/frutas ja no catalogo + `poke_bait`; conferir contagem real e registrar); `cobblemon:pecha_berry.bait.seasoning === true`; `items.json` em bytes <= 1.659.908.
  - commit: 0b5f0f6b
  - status: done

- [x] **B1.4** Catalogo com os 8 itens novos, tag/categoria e ingredientes da panela `[category: build]`
  - Done when: pipeline no snapshot; `items.json`: `cobblemon:poke_snack` igual ao exemplo da secao 5.3 (categoria `bait`, tag `bait`, `cooking: null`, `potRecipes` com os 4 ingredientes 3/2/1/3 nessa ordem); `cobblemon:poke_bait` com `potRecipes` mel x1, `c:mushrooms` x1, `minecraft:wheat` x1 (`name.pt` "Trigo"); nenhum outro item com `potRecipes` (script inline: exatamente 2); os 9 itens da regra de categoria (secao 2.4 item 7) com `category: "bait"` e as 72 bagas com `berry`; `minecraft:golden_apple` e `minecraft:enchanted_golden_apple` presentes com tag `bait` (a textura vanilla ja resolve pelo `publishVanillaTextures` se B1.5 ja copiou os modelos; senao registrar e seguir); `tools/dataset/out/_sb_stage/report.json` secao `recipes` com as mesmas chaves e contagens de antes (`recipeIds`, `status`, `removedByKubejsTotal` iguais aos do report anterior do mesmo snapshot); `npx vitest run tests/unit/dataset/recipes.test.ts` verde.
  - commit: 414db5a3
  - status: done

- [x] **B1.5** Texturas dos itens novos e copia para o snapshot `[category: build]`
  - Done when: pipeline no snapshot; os 8 ids em `items.json` com `texture` nao nula e arquivo existente em `tools/dataset/out/_sb_pub/assets/items/` (`minecraft/golden_apple.png` etc., `allthemodium/allthemodium_apple.png`, `cobblemon/food/poke_snack.png`); texturas distintas referenciadas por `items.json` = 931 (< 1200); abrir os 7 PNGs novos com o Read (conferencia visual).
  - commit: 66b0c4c2
  - status: done

### Fase B2: Snapshot, auditoria e publicacao

- [x] **B2.1** Paridade do snapshot para os ids novos e checagem byte a byte `[category: outro]`
  - Done when: `cmp` sem saida entre `_sb_inst/data/<v>/items.json` e `_sb_snap/data/<v>/items.json` e entre cada par de `species/<dex>.json` (1027), e as duas `datasetVersion` iguais; o resultado (hash sha256 dos dois `items.json`) anotado no paragrafo do README do snapshot.
  - commit: cfcfeb4f
  - status: done

- [x] **B2.2** Auditoria com checks de isca, tempero, receita e pesca `[category: outro]`
  - Done when: `run.ts` contra `_sb_snap` imprime `divergencias {}` (0 em todas as severidades) com o numero de checks maior que 43102 (checks novos contados); `AUDIT_REPORT.md` com a tabela da rodada 5 toda 0; `npx vitest run tests/unit/dataset/audit.test.ts` verde.
  - commit: f944fd87
  - status: done

- [x] **B2.3** Republicar o dataset `[category: build]`
  - Done when: `current.json` com `datasetVersion` != `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba`; `published-schemas.test.ts` e `join.test.ts` verdes; os 3 numeros dentro das metas; `items.json` publicado identico (sha256) ao de `_sb_snap` e `_sb_inst` (mesmo conteudo).
  - commit: ff9ebce9
  - status: done

## Frontend

> Nota: o Frontend so comeca depois de B2.3 verde. Toda feature de frontend so fica verde depois de renderizada headless (dev server + spec temporario apagado antes do commit; PNGs `after-*` versionados em `ui-refs/`), conforme "Regras gerais" do SPEC.

### Fase F1: Ficha do Pokemon (bloco "Iscas" e pesca na linha do spawn)

- [x] **F1.1** Textos i18n do bloco, da pesca e dos efeitos `[category: frontend]`
  - Done when: `npx vitest run tests/unit/ui-foundation/i18n.test.tsx tests/unit/ui-shell/i18n-modules.test.ts` verde; `npm run lint` limpo; captura headless (regra geral) da ficha do Charizard sem mudanca visual (as chaves ainda nao sao usadas): `after-detail-charizard-i18n-pt.png` igual a `detail-where-charizard-pt.png`.
  - commit: (ver commit feat(i18n): textos do bloco de iscas)
  - status: done

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

- [x] **T1.2** Pipeline (pesca, efeitos, kubejs, tempero, receitas, catalogo, midia) `[category: teste]`
  - escrito por: backend
  - Done when: `npx vitest run tests/unit/dataset` verde; cobertura `tools/dataset/src/**` >= 80/80.
  - commit: bffdb9c5
  - status: done

- [x] **T1.3** Contrato publicado e paridade com o dataset real `[category: teste]`
  - escrito por: backend
  - Done when: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
  - commit: 2f1ab0d3
  - status: done

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

- B1.2: conferido no snapshot: 3194 spawns unicos; 143 minLureLevel, 3 maxLureLevel, 3 bait, 6 rodType, 357 lureMultipliers, 0 chaves tipadas em extra; species = 5.246.713 bytes (<= 5.693.585). Staryu-10/Staryu-4/Staryu-2/Wooper-16/Wooper-17/Goomy-13/Whiscash iguais a SPEC 5.3.

- B1.3: contagem real = 73 itens com bait (72 com seasoning true: bagas + minecraft:apple + minecraft:sweet_berries; mais cobblemon:poke_bait com effects [] e seasoning false). Occa/Lum/Starf/Pecha iguais a SPEC; 0 subcategory com ':'; items.json = 1.471.579 bytes (<= 1.659.908). Report `bait`: withTyping 18, withEggGroup 7, boosters [starf_berry] (os outros reforcos entram no catalogo em B1.4).

- B1.4: poke_snack e poke_bait iguais a SPEC 5.3 (nomes do jogo: Poké-Lanche, Frasco de Mel, Brotovital, Grãos Saudáveis, Trigo); exatamente 2 itens com potRecipes; report recipes identico ao anterior (so a chave nova potRecipes). As "72 bagas" da SPEC sao na verdade 70 itens de categoria berry com efeito de isca + minecraft:apple e minecraft:sweet_berries (other, tag bait); as 70 seguem berry. Nesta etapa 949 itens e 7 com categoria bait: os 2 allthemodium ainda caem como fantasma (sem textura nem rota no snapshot); entram com a textura em B1.5. Vanilla com texture null ate B1.5.

- B1.5: no snapshot 951 itens, 9 com categoria bait, os 8 ids novos com textura publicada (5 minecraft pelo publishVanillaTextures, 2 allthemodium pelo publishModItemTextures, poke_snack em cobblemon/food), 931 texturas distintas (< 1200); 7 PNGs conferidos visualmente. Os 2 allthemodium saem `unobtainable` no snapshot (receitas ainda fora do snapshot): paridade com a instancia e em B2.1.

- B2.1: 2 rodadas, 41 arquivos copiados (17 receitas U7a, 18 loot tables U7b, 2 .nbt + 4 da cadeia worldgen U7c/U10). items.json (sha256 6bca7e9d942632f828cd825f5139997c070a5732d0d4510efe768bb578118a95) e os 1027 species/*.json iguais byte a byte entre instancia e snapshot. DESVIO do Done when: as duas `datasetVersion` NAO podem ser iguais (instancia dd869603, snapshot a7736f6b) porque o hash inclui o `dataset-manifest.json`, que guarda `sources` (tamanho/mtime dos jars de origem) e `counts.cries`/`media` (o snapshot tem so parte dos gritos, 1102 x 2141); e assim desde o U11 e nao muda com esta feature. O que o RF-44 pede (items.json + species identicos) esta cumprido; B2.3 confere o sha256 do items.json publicado.

- B2.2: auditoria contra _sb_snap: 46558 checks (> 43102), divergencias {} (0 em todas as severidades). A 1a rodada deu MISSING 7 (texture arquivo) so porque a ferramenta procurava o PNG em public/ e nao na raiz do --publish-dir: corrigido em compare.ts (candidato <datasetDir>/../../<textura>). Achado: `buildExpected().baitItems.size` = 80, nao 81 (81 sao ARQUIVOS: 78 do jar + 3 do kubejs; enchanted_golden_apple esta nos dois e o kubejs vence). AUDIT_REPORT.md: so a nota da Rodada 5 no topo (mesmo formato das rodadas 3 e 4).

- B2.3: publicado `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` (pasta 1a7afcba removida pelo write.ts). Segunda rodada no snapshot (_sb_again) = mesma datasetVersion, items.json e 1027 species iguais. sha256 items.json publicado = _sb_snap = _sb_inst = 6bca7e9d942632f828cd825f5139997c070a5732d0d4510efe768bb578118a95. Metas: items.json 1.499.586 bytes (<= 1.659.908), species 5.246.713 bytes (<= 5.693.585), 931 texturas distintas (<= 931, < 1200), 951 itens. Auditoria no publicado: 46558 checks, 0 divergencias. published-schemas.test.ts + join.test.ts + item-page.test.ts verdes; vitest inteiro 80 arquivos / 627 testes verdes. Janela quebrada B1.1 -> B2.3 FECHADA: o frontend pode comecar.

- T1.2 (escrito pelo backend logo depois de B2.3, antes do frontend: so toca pipeline/auditoria): `tests/unit/dataset/spawn-bait.test.ts` (17 testes) + 2 em recipes.test.ts + 2 em audit.test.ts. `npx vitest run tests/unit/dataset` 17 arquivos / 219 testes verdes; vitest --coverage inteiro 81 arquivos / 648 testes, limites ok; `tools/dataset/src/**` linhas 93,77% / branches 84,56% (>= 80/80). DESVIO da SPEC T1.2: `collectBaitEffects` e `buildExpected().baitItems` tem 80 itens, nao 81 (81 = arquivos; enchanted_golden_apple no jar e no kubejs). O teste confere 80.

- T1.3: +1 it em published-schemas.test.ts (poke_snack com potRecipes passa; campo extra em potRecipes/fishing rejeitado) e +5 its em join.test.ts (951 itens, 9 bait, efeitos, 2 potRecipes, Staryu-10, 0 Lure tipado em extra, bytes e texturas). `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` 19 arquivos / 245 testes verdes.

- T1.6 (parte backend): passos 5 (auditoria 0 divergencias, 46558 checks), 6 (byte a byte instancia x snapshot: items.json + 1027 species iguais), 7 (determinismo: 2a execucao = mesma datasetVersion 2ef2f512) e 8 (`git grep USERPROFILE|Usuario` em data-source/tools/src: nada) rodados verdes em B2.3. T1.6 fica [ ] ate a regressao final com o frontend (e2e, build/PWA).

- F1.1 (frontend): 16 chaves where.* em detail.ts e 24 ip.* em item.ts (PT com acento). i18n.test + i18n-modules verdes, lint/typecheck limpos. Captura after-detail-charizard-i18n-pt.png comparada pixel a pixel com detail-where-charizard-pt.png: 0 pixels diferentes.

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Fix / commit |
|---|---|---|---|
| B2.2 | auditoria acusou MISSING 7 (texture arquivo) no dataset de teste | compare.ts so procurava o PNG em public/, datasetDir e raiz do repo | candidato novo <datasetDir>/../../<textura> (raiz do --publish-dir), no commit do B2.2 |
