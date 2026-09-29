---
feature: spawn-bait
language: pt-BR
generated: 2026-09-29
stack: React 19 + TypeScript 5.8 + Vite 6 (PWA vite-plugin-pwa), zustand, zod 3.24, Vitest 3 + Testing Library, Playwright 1.63; pipeline de dados Node 24 + tsx em tools/dataset (fflate, @iarna/toml, sharp)
status: spec
prd_source: PRD_spawn-bait.md @ 2548aa491237
---

# SPEC - spawn-bait (iscas de spawn: Poke-Lanche e Pokeisca)

Este documento e o desenho tecnico (COMO) e o plano executavel da feature. Foi escrito para agentes de implementacao com contexto limpo, que terao em maos so este SPEC, o PRD (rev 5), o CONTEXT e o UISPEC. Todo caminho citado e absoluto e foi conferido no disco em 2026-09-29; toda linha citada foi conferida por Read/Grep no HEAD `ff3a26b0`.

Convencoes de leitura:
- `ROOT` nas explicacoes = `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex` (as listas **Files** sempre trazem o caminho absoluto completo).
- `[ASSUMPTION]` = decisao tomada em modo autonomo, com justificativa, revisavel. Lista completa na secao 9.
- Identificadores de codigo em INGLES (camelCase/PascalCase, UPPER_SNAKE para constantes), espelhando o codigo (`collectBaitItemIds`, `ItemLink`, `SPAWN_COLLAPSE_AFTER`). Comentarios em codigo em pt-BR sem acento. Campos JSON e classes CSS em ingles. Textos de UI so em `src/i18n/messages/*.ts` (PT com acento, EN).
- Proibido o caractere travessao em qualquer texto gerado (codigo, comentario, commit, i18n).
- Commits: Conventional Commits em pt-BR sem acento, um commit atomico por feature, SEM linha `Co-Authored-By`. Nunca `git push` nem merge sem o Pontin autorizar.

---

## 1. Baseline (ancora de drift)

- `HEAD`: `ff3a26b0` (branch `feature/spawn-bait`).
- PRD: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/PRD_spawn-bait.md` = `2548aa491237` (revisao 5)
- CONTEXT: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/CONTEXT_spawn-bait.md` = `6ea22e108cb8`
- UISPEC: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/UISPEC_spawn-bait.md` = `cf49c08eee94`
- IDEA: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/IDEA_spawn-bait.md` = `3121bd574c08`

Arquivos de codigo de que este SPEC depende (`git hash-object`, 12 chars):

| arquivo (absoluto) | hash |
|---|---|
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts | 0487474824aa |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/catalog.ts | ae499391e22c |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/categories.ts | d4b8a348f768 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/recipes.ts | ebb6ba903b9f |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/ref-names.ts | 3a46a8e1c578 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/media/vanilla-textures.ts | dd9a03394968 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/spawns.ts | 0d1cc9032192 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/expected.ts | 10c45d466420 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/compare.ts | 7acba6a7d7bd |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/raw.ts | edc52e0f55d6 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/README.md | 10fd90974dd7 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/README.md | d44ca82684dc |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/MANIFEST.json | 76189e221280 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts | 44ad5aea2daf |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts | 72f7e4bd0498 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/WherePanel.tsx | eb0f3a69d560 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/ItemLink.tsx | d34132bea534 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/detail.css | 0b35cdcf0f4f |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/ItemScreen.tsx | 26f58b34768b |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item-page-model.ts | e2985bcc3334 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item.css | 21fd89b2e542 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Items/item-model.ts | cf7be65da6e8 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/detail.ts | 76ff5da39a73 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/item.ts | d82cf516eff1 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/useT.ts | 9ed2b560d188 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-page.test.ts | cb8fb0ad0619 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/data/published-schemas.test.ts | 54b0ee5e84e9 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/join.test.ts | c453c37a8298 |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/detail.spec.ts | 0e63ec87a2ec |
| C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/vite.config.ts | 1e0035bdd4c0 |

Medidas de partida (para RNF-01, RNF-02; bytes reais do dataset atual `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba`): `items.json` = 1.443.399 bytes; soma dos 1027 `species/*.json` = 5.175.986 bytes (`du -sb`; o "7,7 MB" do PRD era tamanho em disco, a meta de +10% vale sobre os bytes); 943 itens; 923 texturas distintas referenciadas por `items.json`.

---

## 2. Design Overview

### 2.1 Abordagem em uma frase

O pipeline passa a publicar, por item, os efeitos de isca ja normalizados e com o texto do jogo renderizado (`ItemInfo.bait`), a flag de tempero aceito pela Panela de Fogueira, os ingredientes das receitas de isca da panela (`craftable.potRecipes`) e, por spawn, as condicoes de pesca tipadas (`SpawnEntry.fishing`); o app calcula no render, com uma funcao pura de dominio, as 3 melhores bagas por Pokemon cruzando `types`/`eggGroups` da ficha com esses efeitos, e mostra tudo no painel "Onde encontrar" e na pagina do item.

### 2.2 Fluxo de dados

```
jar Cobblemon data/cobblemon/spawn_bait_effects/** ─┐  (kubejs/data/cobblemon/spawn_bait_effects/** vence por item)
tag cobblemon:recipe_filters/bait_seasoning (jar) ──┼─► items/bait.ts ─► ItemInfo.bait { effects[], seasoning }
curated/bait-seasoning-extra.json (2 allthemodium) ─┘        (texto = tooltip do jogo cobblemon.fishing_bait_effects.<tipo>.tooltip, PT/EN)
receitas com seasoningTag = bait_seasoning ─► items/pot-recipes.ts ─► craftable.potRecipes[] (ingredientes)
ids de spawn_bait_effects + saidas dessas receitas ─► catalog.ts (8 itens novos) ─► vanilla-textures.ts / mod-item-textures.ts
spawn_pool_world condition.bait/rodType/min|maxLureLevel + weightMultiplier(s) de Lure ─► species/fishing.ts ─► SpawnEntry.fishing
                                                   │
public/data/<versao>/items.json + species/<dex>.json (zod em src/data/schemas.ts)
                                                   │
src/domain/bait.ts (buildBaitIndex, recommendBerries, baitContexts, baitBoosters, lureRange)
   ├─► src/screens/Detail/BaitBlock.tsx (bloco "Iscas" dentro de .where, entre SpawnList e Drops)
   ├─► src/screens/Detail/BaitBlock.tsx FishingConds (chips na linha do spawn)
   └─► src/screens/Item/BaitParts.tsx (painel de efeitos + ingredientes da panela)
```

### 2.3 Mudancas no modelo de dados (resumo; contrato exato na secao 5)

- `SpawnEntry` ganha `fishing: SpawnFishing | null` (antes de `extra`). `bait`, `rodType`, `minLureLevel`, `maxLureLevel` e os multiplicadores cuja condicao e SO Lure saem de `extra` (nao ficam duplicados).
- `ItemInfo` ganha `bait: ItemBait | null` (depois de `cooking`).
- Rota `craftable` ganha `potRecipes?: PotRecipe[]` (opcional: so existe nos 2 itens com receita de isca da panela, `cobblemon:poke_snack` e `cobblemon:poke_bait`; os outros 941+ itens ficam byte a byte iguais nessa rota).
- Catalogo: +8 itens (`minecraft:golden_apple`, `minecraft:enchanted_golden_apple`, `minecraft:golden_carrot`, `minecraft:glistering_melon_slice`, `minecraft:glow_berries`, `allthemodium:allthemodium_apple`, `allthemodium:allthemodium_carrot`, `cobblemon:poke_snack`) = 951 itens. Categoria `bait` para esses 8 e para `cobblemon:poke_bait` (secao 2.4 item 7).

### 2.4 Decisoes-chave

1. **Texto do efeito renderizado no pipeline** (RF-25): o pipeline le o template `cobblemon.fishing_bait_effects.<tipo>.tooltip` do `ctx.lang` (jar Cobblemon com kubejs por cima) e preenche `%1$s/%2$s/%3$s` exatamente como o jogo faz. Regra conferida no bytecode do jar real (`com/cobblemon/mod/common/client/tooltips/SeasoningTooltipHelperKt.generateAdditionalBaitEffectTooltip`, javap em 2026-09-29):
   - chave = `cobblemon.fishing_bait_effects.<path do type>.tooltip` (ex. `cobblemon:typing` -> `typing`);
   - `%1$s` = `DecimalFormat("0.##")` de `chance * 100` (1.0 -> "100", 0.05 -> "5", 0.7 -> "70");
   - `%3$s` = inteiro: `bite_time` -> `(int)(value * 100)`; `shiny_reroll` -> `(int)(value + 1)`; demais -> `(int)value`;
   - `%2$s` = rotulo da subcategoria (path do ResourceLocation, sem namespace): `ev`/`iv`/`nature` -> `cobblemon.stat.<nome>.name` com o mapa `hp->hp, atk->attack, def->defence, spa->special_attack, spd->special_defence, spe->speed` (conferido na classe `Stats`); `gender_chance` -> `cobblemon.gender.<male|female|genderless>`; `typing` -> `cobblemon.type.<tipo>`; `egg_group` -> `cobblemon.egg_group.<grupo>`; outra subcategoria -> o proprio texto; sem subcategoria -> "" (vazio);
   - `%%` vira `%`. Texto EN do `ctx.lang.en`; PT do `ctx.lang.pt` (kubejs por cima), caindo para o EN quando nao ha chave PT; rotulo de `%2$s` resolvido no mesmo idioma do template (PT cai para EN).
   Consequencia registrada: `shiny_reroll` 5.0 da maca dourada encantada do kubejs aparece "6×" (o jogo soma 1). O `value` publicado continua 5.
2. **Subcategoria normalizada** (RF-27): sempre o path depois do `:` (`cobblemon:atk` -> `atk`), como o jogo (`getSubcategory().getPath()`). Efeito repetido no mesmo item com mesmo `kind` + `subcategory` normalizada fica uma vez (o primeiro), com aviso `W_BAIT_EFFECT_DUPLICATE`.
3. **`kind` em camelCase** (convencao de valores discriminados do repo): `typing, eggGroup, nature, ev, iv, biteTime, levelRaise, pokemonChance, genderChance, haChance, friendship, dropsReroll, shinyReroll, rarityBucket` (os 14 tipos presentes nos 81 arquivos). Tipo desconhecido (ex. `tera`, `inert`) = efeito pulado + aviso `W_BAIT_EFFECT_UNKNOWN` (nunca inventa).
4. **Precedencia kubejs** (RF-38/39): chave = id do item (`data.item`); arquivos dos jars obrigatorios em `listJars()` e depois `kubejs/data/cobblemon/spawn_bait_effects/**`; o ultimo vence (kubejs substitui o jar, como datapack). `enchanted_golden_apple` sai com bite_time 0.1, rarity_bucket 10, shiny_reroll 5.0.
5. **Tempero aceito** (RF-08/RF-40): `seasoning = true` se o id esta na tag `cobblemon:recipe_filters/bait_seasoning` resolvida (arquivos de tag dos 7 jars + kubejs/data, tags aninhadas, via `resolveItemTags` ja existente em `recipes.ts:216`) OU no arquivo curado novo `tools/dataset/curated/bait-seasoning-extra.json` (id -> prova citando `kubejs/server_scripts/Tweaks/tags.js:269`). O pipeline NAO interpreta JS. Id curado sem efeito de isca = aviso `W_BAIT_SEASONING_EXTRA_UNKNOWN`.
6. **8 itens no catalogo** (RF-33): `buildCatalog` recebe `baitItemIds` = ids de `spawn_bait_effects` (jar + kubejs) uniao saidas das receitas com `seasoningTag = cobblemon:recipe_filters/bait_seasoning` (so `poke_snack` e `poke_bait` hoje). Entram como `referenceOnly` (regra do fantasma `stage.ts:167` continua valendo; os 8 tem textura).
7. **Tag e categoria** (RF-33/36/37, decisao do orquestrador na revisao): tag `bait` = item com efeito de isca OU saida de receita de isca da panela. Categoria `bait` (chip "Iscas") = item que entra no catalogo SO pela fonte de referencia de isca (`baitItemIds` que nao estaria no catalogo por nenhuma outra fonte: os 5 vanilla e os 2 allthemodium) MAIS as saidas das receitas de isca da panela (`poke_snack` e `poke_bait`). Resultado: 9 itens com categoria `bait`. As bagas do Cobblemon mantem a categoria propria (`berry`) e `minecraft:apple`/`minecraft:sweet_berries` (que ja entravam por drop de especie) mantem `other`; todos esses chegam a aba "Iscas" pela tag. `cooking` = `null` para todo item de categoria `bait` (o `poke_snack` perde a nota "efeito pendente" que a textura em `food/` daria).
8. **Receitas lidas UMA vez, antes do catalogo**: `collectRecipes` (`recipes.ts:705`) e partido em `gatherRecipes(ctx)` (leitura, sem report) e `reportRecipes(ctx, collection, catalogIds)` (o `ctx.report.section("recipes", ...)` de `recipes.ts:797`, com o filtro `relevant` aplicado sobre listas nao filtradas guardadas em `collection.stats`). `collectRecipes(ctx, catalogIds?)` continua exportada como `gatherRecipes` + `reportRecipes` (o teste `tests/unit/dataset/recipes.test.ts:146` nao muda). Assim a saida das receitas de isca existe antes do catalogo sem ler os jars duas vezes.
9. **Ingredientes** (RF-28/29/30/42): extraidos so das receitas com `seasoningTag = cobblemon:recipe_filters/bait_seasoning` (escopo do PRD: so Poke-Lanche e Pokeisca). Shaped (`key` + `pattern`): contagem = ocorrencias do simbolo no `pattern`, ordem = primeira ocorrencia varrendo o `pattern` linha a linha. Shapeless (`ingredients`): cada entrada conta 1, iguais somam, ordem da primeira ocorrencia. Ingrediente `{item}` -> `{ kind:"item", id, count, name }` (nome do jogo pelo `gameItemName`, para item fora do catalogo como `minecraft:wheat` aparecer "Trigo"/"Wheat"); `{tag}` -> `{ kind:"tag", id, count }` (rotulo humano no app). Formato desconhecido (lista de alternativas etc.) = receita sem `potRecipes` + aviso `W_POT_RECIPE_UNPARSED`.
10. **Pesca tipada** (RF-41/46): `fishing` vem de `condition.bait`, `condition.rodType`, `condition.minLureLevel`, `condition.maxLureLevel`, `weightMultiplier` (objeto) e `weightMultipliers` (lista). Multiplicador "so Lure" = `condition` com pelo menos uma e apenas as chaves `minLureLevel`/`maxLureLevel`; entra em `lureMultipliers` (singular primeiro, depois a lista na ordem do arquivo) e SAI de `extra`; os outros (timeRange, isRaining, isThundering, biomes...) ficam em `extra` como hoje. `rodBall` = `pokeBallId` de `data/<ns>/pokerods/<path>.json` do `rodType` (jars obrigatorios, kubejs vence), para a UI mostrar a boia como item clicavel (a vara em si nao tem nome no lang do jogo; o tooltip do jogo e `cobblemon.pokerod.bobber` "Boia: %1$s"). `fishing = null` quando nada disso existe.
11. **Midia** (RF-34): os 5 `minecraft:*` saem pelo `publishVanillaTextures` existente (basta estarem no catalogo e o snapshot ter modelo + textura). Os 2 `allthemodium:*` saem de um passo novo `publishModItemTextures` restrito a itens de isca sem textura de namespace listado em `MOD_TEXTURE_JAR_PREFIX = { allthemodium: "allthemodium-" }` (modelo `assets/<ns>/models/item/<path>.json` -> `layer0` -> PNG), publicado em `assets/items/<ns>/<path>.png`. Restrito para nao mudar a textura de outros itens (o snapshot nao tem as texturas dos outros mods e a regra byte a byte quebraria).
12. **Recomendacao no app** (RF-07..18): funcao pura em `src/domain/bait.ts` com indice memoizado por `items` (WeakMap). Candidatas = itens com `bait.seasoning === true`. Ordem: para cada tipo do Pokemon (ordem de `types`), itens com efeito `typing` daquele tipo (ordenados por id); depois para cada grupo de `eggGroups` (ordem da ficha), itens com efeito `eggGroup` daquele grupo (por id); sem repetir id (fica na primeira posicao); corta em 3. Rotulo entre parenteses = TODAS as subcategorias do mesmo `kind` da baga, na ordem do arquivo (Lum -> "Dragão/Monstro"). Reforcos = candidatas com `rarityBucket` ou `shinyReroll`, ordenadas por id.
13. **Contexto das linhas** (RF-03/04): linha Poke-Lanche se algum spawn tem `context !== "fishing"`; linha Pokeisca se algum tem `context === "fishing"`; bloco inexistente sem spawns (RF-06).
14. **Rotulo da estacao** (RF-31, RF-47, decisao do orquestrador): o texto "Panela de Fogueira"/"Campfire Pot" (nome do jogo, `cobblemon.container.campfire_pot` no jar e no kubejs pt_br) vai para o dicionario central, chave `ip.station.campfirePot` em `src/i18n/messages/item.ts`. `RECIPE_LABELS` (`item-page-model.ts:11-21`) continua sendo a tabela regex -> `LocalizedText` usada por `recipeTypeLabel`/`recipeLabels` (linhas 113 e 118); a entrada da linha 20 passa a apontar para o objeto do dicionario: `[/cooking_pot/, ITEM_MESSAGES["ip.station.campfirePot"]]` (import `ITEM_MESSAGES` de `../../i18n/messages/item`; o valor `{ pt, en }` do dicionario tem a forma de `LocalizedText`). Assim o texto so existe no dicionario e o `recipeLabels(types, uiLang)` do `ItemScreen.tsx:162` continua igual.

### 2.5 Convencao de identificadores (obrigatoria)

Ingles em tudo que e codigo/dado: `SpawnFishing`, `SpawnLureMultiplier`, `ItemBait`, `BaitEffect`, `BaitEffectKind`, `PotRecipe`, `RecipeIngredient`, `collectBaitEffects`, `renderBaitTooltip`, `buildSeasoningSet`, `parsePotIngredients`, `collectPokeRods`, `fishingOf`, `publishModItemTextures`, `buildBaitIndex`, `recommendBerries`, `baitContexts`, `baitBoosters`, `lureRange`, `BaitBlock`, `FishingConds`, `BaitEffectsPanel`, `PotRecipeList`. Classes CSS novas com prefixo `bait-`, `fish-`, `pot-`; atributos `data-bait`, `data-bait-row`, `data-bait-berry`, `data-bait-boost`, `data-fishing`, `data-bait-effects`, `data-pot-recipe`, `data-ingredient`. Chaves i18n em ingles com ponto (`where.bait.title`, `ip.bait.kind.typing`).

## 2b. Mapa de ciclo de vida das entidades

Somente leitura: tudo e dado gerado pelo pipeline e publicado em `public/data/<datasetVersion>/`; nao ha criar/editar/apagar pelo usuario nem estado novo persistido no IndexedDB.

---

## 3. Trade-offs e alternativas rejeitadas

| Decisao | Alternativa rejeitada | Por que |
|---|---|---|
| Recomendacao calculada no app | Pre-computar por especie em `species/*.json` | Constraint da IDEA/PRD (nao inflar species); cruzamento e barato (18 tipos + 15 grupos). |
| Texto do efeito renderizado no pipeline | Publicar so template + args e renderizar no app | O pipeline ja tem o lang do jogo com kubejs; o app nao carrega lang do jogo; +~35 KB em `items.json` (dentro de RNF-01). |
| `SpawnEntry.fishing` objeto unico nullable | 4 campos soltos em todo SpawnEntry | `"fishing":null` custa 15 bytes por spawn contra ~55 dos campos soltos; mantem RNF-01 folgado. |
| `potRecipes` opcional na rota craftable | Campo obrigatorio em toda rota craftable | So 2 itens usam; opcional nao muda os bytes dos outros 800+ itens craftaveis. |
| Excecao curada para os 2 allthemodium | Interpretar `ServerEvents.tags` no JS do kubejs | Restricao do orquestrador (RF-40); JS nao e dado declarativo. A auditoria confere o curado de forma independente (regex na linha do script). |
| `gatherRecipes` + `reportRecipes` | Ler receitas 2 vezes (antes e depois do catalogo) | Custo de I/O dobrado na instancia real (398 jars zipados); a separacao nao muda o report. |
| `rodBall` publicado | Rotulo curado "Vara do Amor" no app | O jogo nao tem nome de vara; a bola da boia tem pagina e nome PT/EN no catalogo. |
| Textura allthemodium restrita a iscas | Acrescentar `allthemodium` em `NAMESPACE_JARS` (item-textures.ts) | Publicaria centenas de texturas e exigiria copiar todas para o snapshot. |
| Categoria `bait` para os itens que entram so pela fonte de isca + saidas das receitas de isca da panela (9 itens) | Categoria `bait` so para o `poke_snack` (cooking + tag) ou para todo item com tag `bait` | Decisao do orquestrador: os itens novos e as duas iscas da panela sao "Iscas" por natureza; trocar a categoria das 72 bagas e de `apple`/`sweet_berries` mudaria chips e abas existentes sem pedido (elas ja aparecem na aba pela tag). |
| Rotulo de ingrediente por tag no app (mapa) | Resolver os membros da tag no pipeline | `c:drinks/milk` e `c:mushrooms` sao tags do NeoForge, fora do snapshot (so `cobblemon:moomoo_milk` em `data/c/tags/item/drinks/milk.json` do jar Cobblemon); resolver daria lista incompleta. |

## 4. Riscos e mitigacoes

| Risco | Impacto | Mitigacao |
|---|---|---|
| Os 8 ids novos aparecem em receitas/loot/estruturas/lang de jars cujo arquivo nao esta no snapshot (golden_apple em baus vanilla e de mods, glow_berries em blocos) | `items.json` do snapshot != instancia (quebra RF-44) | Feature B2.1: laco diferencial instancia x snapshot com copia dos arquivos pelas regras do `data-source/README.md` (U7a, U7b, U7c, U8, U10) ate ficar identico. |
| Auditoria acusar divergencia nos spawns por campo novo | RF-45 | `compare.ts` so compara campos nomeados; B2.2 acrescenta checks explicitos de `fishing`, `bait`, `seasoning`, `potRecipes` e dos 8 itens. |
| e2e de `#where-panel` mudar contagem (`.spawn-entry .badge/.tag/.biome`, `.drop`, `.ob-none`, `.ob-link`, `data-obtain`) | RNF-03 | Classes proprias (`bait-*`, `fish-*`), `ItemLink` sempre com `className` explicito sem `tag`; nenhum `.badge` novo sob `#where-panel` (selos do bloco com `.bait-badge`). T1.5 roda o `detail.spec.ts` inteiro. |
| Schema estrito/`toEqual` rejeitar o arquivo novo | App mostra erro de dataset | B1.1 escreve tipos + zod juntos; T1.3 roda `published-schemas.test.ts` no dataset novo. |
| Fixtures de teste tipadas (`ItemInfo`, `SpawnEntry`) sem os campos novos quebram `typecheck` | RNF-04 | B1.1 atualiza as 8 fixtures listadas. |
| Tooltip PT do jogo com erro de concordancia ("100% - de probabilidade...") | Estetico | E o texto do proprio jogo (RF-25 pede o texto do jogo); nao corrigir. |
| Crescimento do dataset | RNF-01 | Medido em B2.3 (meta: items <= 1.659.908 bytes, species <= 5.693.585 bytes). |
| Cache de texturas do PWA | RNF-02 | 923 + 8 = 931 < 1200 (`vite.config.ts:129`); precache nao muda (`globPatterns` nao desce em `assets/items`). |

---

## 5. Contrato de dados (no lugar de endpoints)

Nao ha API HTTP: o contrato e o JSON publicado em `public/data/<datasetVersion>/` e validado por zod na carga (`src/data/loaders.ts`). Tipos em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts` (importados pelo pipeline via `../../../../src/data/types`), schemas em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts`.

### 5.1 Tipos novos (acrescentar em `src/data/types.ts`)

Depois de `SpawnTimeRange` (linha 232) e antes de `export interface SpawnEntry` (linha 234):

```ts
/** Multiplicador de peso cuja condicao e SO nivel de Lure (spawn-bait RF-46). null = sem limite nesse lado. */
export interface SpawnLureMultiplier {
  lureMin: number | null;
  lureMax: number | null;
  multiplier: number;
}

/** Condicoes de pesca tipadas (spawn-bait RF-41/RF-46); null no SpawnEntry quando o spawn nao tem nenhuma. */
export interface SpawnFishing {
  /** condition.bait: isca exigida na vara, ex. "cobblemon:love_sweet" */
  bait: string | null;
  /** condition.rodType, ex. "cobblemon:love_rod" */
  rodType: string | null;
  /** pokeBallId da vara (data/<ns>/pokerods/<path>.json), ex. "cobblemon:love_ball"; null sem rodType ou sem arquivo */
  rodBall: string | null;
  minLureLevel: number | null;
  maxLureLevel: number | null;
  /** weightMultiplier (objeto) + weightMultipliers (lista) com condicao so de Lure, singular primeiro, ordem do arquivo */
  lureMultipliers: SpawnLureMultiplier[];
}
```

Em `SpawnEntry` (linhas 234-253), novo campo antes de `extra` (linha 252): `fishing: SpawnFishing | null;`

Depois de `export type ItemTag` (linha 358):

```ts
/** Tipos de efeito de isca publicados (type "cobblemon:<snake>" do spawn_bait_effects em camelCase). */
export type BaitEffectKind =
  | "typing" | "eggGroup" | "nature" | "ev" | "iv" | "biteTime" | "levelRaise"
  | "pokemonChance" | "genderChance" | "haChance" | "friendship" | "dropsReroll" | "shinyReroll" | "rarityBucket";

export interface BaitEffect {
  kind: BaitEffectKind;
  /** path da subcategoria sem namespace ("fire", "water_1", "atk", "male"); null quando o efeito nao tem */
  subcategory: string | null;
  /** 0..1 */
  chance: number;
  /** valor cru do arquivo; null quando ausente (pokemon_chance, ha_chance, gender_chance) */
  value: number | null;
  /** tooltip do jogo renderizado (cobblemon.fishing_bait_effects.<tipo>.tooltip), PT cai para EN */
  text: LocalizedText;
}

export interface ItemBait {
  /** na ordem do arquivo vencedor (kubejs > jar) */
  effects: BaitEffect[];
  /** aceito como tempero pela Panela de Fogueira (tag bait_seasoning + excecao curada) */
  seasoning: boolean;
}

export type RecipeIngredient =
  | { kind: "item"; id: string; count: number; name: LocalizedText | null }
  | { kind: "tag"; id: string; count: number };

/** Receita da Panela de Fogueira com temperos de isca (Poke-Lanche, Pokeisca). */
export interface PotRecipe {
  /** id da receita, ex. "cobblemon:campfire_pot/poke_snack" */
  recipeId: string;
  /** "cobblemon:cooking_pot" | "cobblemon:cooking_pot_shapeless" */
  recipeType: string;
  /** "cobblemon:recipe_filters/bait_seasoning" */
  seasoningTag: string;
  ingredients: RecipeIngredient[];
}
```

`ItemObtainRoute` craftable (linha 362) passa a: `| { kind: "craftable"; recipeTypes: string[]; potRecipes?: PotRecipe[] }`

`ItemInfo` (linhas 431-447): novo campo depois de `cooking` (linha 446): `/** efeitos de isca (spawn_bait_effects); null quando o item nao tem arquivo de efeito */ bait: ItemBait | null;`

### 5.2 Schemas zod (em `src/data/schemas.ts`)

- `spawnEntrySchema` (linhas 135-150): antes de `extra` (linha 149) acrescentar
  `fishing: z.object({ bait: z.string().nullable(), rodType: z.string().nullable(), rodBall: z.string().nullable(), minLureLevel: z.number().nullable(), maxLureLevel: z.number().nullable(), lureMultipliers: z.array(z.object({ lureMin: z.number().nullable(), lureMax: z.number().nullable(), multiplier: z.number() }).strict()) }).strict().nullable(),`
- Novo `const baitEffectKindSchema = z.enum(["typing","eggGroup","nature","ev","iv","biteTime","levelRaise","pokemonChance","genderChance","haChance","friendship","dropsReroll","shinyReroll","rarityBucket"]);` e `const recipeIngredientSchema = z.union([z.object({ kind: z.literal("item"), id: z.string(), count: z.number(), name: localizedTextSchema.strict().nullable() }).strict(), z.object({ kind: z.literal("tag"), id: z.string(), count: z.number() }).strict()]);` e `const potRecipeSchema = z.object({ recipeId: z.string(), recipeType: z.string(), seasoningTag: z.string(), ingredients: z.array(recipeIngredientSchema) }).strict();` declarados logo antes de `itemInfoSchema` (linha 243), depois de `itemNamedRefSchema` (linha 241).
- `itemInfoSchema`: rota craftable (linha 257) vira `z.object({ kind: z.literal("craftable"), recipeTypes: z.array(z.string()), potRecipes: z.array(potRecipeSchema).optional() })`; depois de `cooking` (linha 303) acrescentar `bait: z.object({ effects: z.array(z.object({ kind: baitEffectKindSchema, subcategory: z.string().nullable(), chance: z.number(), value: z.number().nullable(), text: localizedTextSchema.strict() }).strict()), seasoning: z.boolean() }).strict().nullable(),`

### 5.3 Exemplos reais esperados (snapshot atm-1.3.0)

`species/120.json`, spawn `allthemons:staryu-10` (antes: `extra: {"weight":1.84,"weightMultiplier":{"multiplier":3,"condition":{"minLureLevel":3}},"condition":{"minLureLevel":1,"minY":-60,"maxY":13}}`):

```json
"fishing": { "bait": null, "rodType": null, "rodBall": null, "minLureLevel": 1, "maxLureLevel": null,
             "lureMultipliers": [ { "lureMin": 3, "lureMax": null, "multiplier": 3 } ] },
"extra": { "weight": 1.84, "condition": { "minY": -60, "maxY": 13 } }
```

`allthemons:staryu-4` (lista com timeRange + Lure): `fishing.lureMultipliers = [{ "lureMin": 3, "lureMax": null, "multiplier": 3 }]`, `minLureLevel: 1`; `extra = { "weight": 1.84, "weightMultipliers": [ { "multiplier": 1.5, "condition": { "timeRange": "night" } } ] }` (a chave `condition` some porque so tinha `minLureLevel`).

`allthemons:staryu-2` (so timeRange): `fishing: null`; `extra` igual ao de hoje.

`species/194.json` `cobblemon:wooper-true-16`: `fishing = { "bait": null, "rodType": "cobblemon:love_rod", "rodBall": "cobblemon:love_ball", "minLureLevel": null, "maxLureLevel": null, "lureMultipliers": [ { "lureMin": 2, "lureMax": 2, "multiplier": 3 }, { "lureMin": 3, "lureMax": null, "multiplier": 5 } ] }`, `extra = { "weight": 2 }`. `cobblemon:wooper-true-17`: `fishing.bait = "cobblemon:love_sweet"`. `species/704.json` `cobblemon:goomy-hisui-13`: `minLureLevel 2, maxLureLevel 2`. `species/340.json` whiscash `rodType cobblemon:master_rod`, `rodBall cobblemon:master_ball`.

`items.json["cobblemon:occa_berry"].bait`:

```json
{ "effects": [ { "kind": "typing", "subcategory": "fire", "chance": 1, "value": 10,
  "text": { "pt": "100% de probabilidade de aumentar em 10× a chance de fisgar Pokémon do Tipo Fogo",
            "en": "100% - 10× Chance for Fire Types" } } ], "seasoning": true }
```

`items.json["minecraft:enchanted_golden_apple"].bait.effects` (kubejs vence): `biteTime` 0.1 (en "100% - Reduce Bite Time 10%"), `rarityBucket` 10 (en "100% - Boost Rarity Bucket +10 Tiers"), `shinyReroll` 5 (en "100% - 6× Shiny Chance", pt "100% de probabilidade de aumentar em 6× a chance de fisgar um Brilhante"); `seasoning: true`.

`items.json["cobblemon:poke_bait"].bait = { "effects": [], "seasoning": false }`. `items.json["cobblemon:potion"].bait = null`.

`items.json["cobblemon:poke_snack"]`: `category: "bait"`, `tags: ["bait"]`, `cooking: null`, `name: { pt: "Poké-Lanche", en: "Poké Snack" }` (pt do kubejs `block.cobblemon.poke_snack`), rota:

```json
{ "kind": "craftable", "recipeTypes": ["cobblemon:cooking_pot"], "potRecipes": [ {
  "recipeId": "cobblemon:campfire_pot/poke_snack", "recipeType": "cobblemon:cooking_pot",
  "seasoningTag": "cobblemon:recipe_filters/bait_seasoning",
  "ingredients": [
    { "kind": "tag", "id": "c:drinks/milk", "count": 3 },
    { "kind": "item", "id": "minecraft:honey_bottle", "count": 2, "name": { "pt": "Frasco de Mel", "en": "Honey Bottle" } },
    { "kind": "item", "id": "cobblemon:vivichoke", "count": 1, "name": { "pt": "Brotovital", "en": "Vivichoke" } },
    { "kind": "item", "id": "cobblemon:hearty_grains", "count": 3, "name": { "pt": "Grãos Saudáveis", "en": "Hearty Grains" } } ] } ] }
```

`cobblemon:poke_bait`: `category: "bait"` (era `other`), tags `["bait"]`; craftable: `potRecipes[0]` = `cobblemon:campfire_pot/poke_bait`, `cobblemon:cooking_pot_shapeless`, ingredientes `minecraft:honey_bottle` x1, tag `c:mushrooms` x1, `minecraft:wheat` x1 (name `{pt:"Trigo", en:"Wheat"}` do lang vanilla). Os nomes exatos vem do lang no momento da execucao (os valores acima sao os do dataset atual).

### 5.4 Formatos EXISTENTES modificados

| Formato | Mudanca | Quem consome |
|---|---|---|
| `SpawnEntry` (types.ts:234, schemas.ts:135) | + `fishing`; `extra` perde `condition.bait/rodType/minLureLevel/maxLureLevel` e os multiplicadores so-Lure | WherePanel (SpawnEntryRow), `ObtainRoute.packSpawn/addon.entries` (mesmos objetos), auditoria, `tests/unit/domain/ball-ranking.test.ts:12` (fixture) |
| `ItemInfo` (types.ts:431, schemas.ts:243) | + `bait` | ItemScreen, domain/bait.ts, fixtures de testes |
| `ItemObtainRoute` craftable (types.ts:362, schemas.ts:257) | + `potRecipes?` | ItemScreen `ObtainRow` |
| `items.json` | +8 itens; categoria `bait` em `poke_snack`, `poke_bait` e nos 7 itens novos de isca (9); tag `bait` em `poke_snack` | ItemsScreen (aba Iscas), ItemLink |
| `RECIPE_LABELS` cooking_pot (item-page-model.ts:20) | aponta para `ITEM_MESSAGES["ip.station.campfirePot"]` ("Panela de Fogueira"/"Campfire Pot") | ItemScreen, `tests/unit/ui-screens/item-page.test.ts:26` |

## 5b. Dependencias e configuracao

Nenhuma biblioteca nova, nenhuma variavel de ambiente nova (so o nome ja existente `ATM_INSTANCE_DIR`; RNF-09), nenhuma chamada de rede nova (RNF-10). `vite.config.ts` nao muda (runtime cache `items` com `maxEntries: 1200`, linha 129).

Arquivo curado novo: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/curated/bait-seasoning-extra.json`:

```json
{
  "allthemodium:allthemodium_apple": "kubejs/server_scripts/Tweaks/tags.js:269: ServerEvents.tags('item') allthemods.add('cobblemon:recipe_filters/bait_seasoning', [\"allthemodium:allthemodium_apple\", \"allthemodium:allthemodium_carrot\"])",
  "allthemodium:allthemodium_carrot": "kubejs/server_scripts/Tweaks/tags.js:269: ServerEvents.tags('item') allthemods.add('cobblemon:recipe_filters/bait_seasoning', [\"allthemodium:allthemodium_apple\", \"allthemodium:allthemodium_carrot\"])"
}
```

Acrescimos ao snapshot `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/` (fontes conferidas com `unzip -l` em 2026-09-29):

| Destino no snapshot | Fonte (absoluta) | Entrada no zip |
|---|---|---|
| `vanilla/1.21.1.jar/assets/minecraft/models/item/{golden_apple,enchanted_golden_apple,golden_carrot,glistering_melon_slice,glow_berries}.json` | `C:/Users/Usuario/curseforge/minecraft/Install/versions/1.21.1/1.21.1.jar` | `assets/minecraft/models/item/<item>.json` (5; o de `enchanted_golden_apple` aponta `layer0 minecraft:item/golden_apple`) |
| `vanilla/1.21.1.jar/assets/minecraft/textures/item/{golden_apple,golden_carrot,glistering_melon_slice,glow_berries}.png` | mesmo jar | `assets/minecraft/textures/item/<item>.png` (4; nenhum `.png.mcmeta`) |
| `mods/allthemodium-3.0.1_mc_1.21.1.jar/assets/allthemodium/models/item/allthemodium_{apple,carrot}.json` | `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons/mods/allthemodium-3.0.1_mc_1.21.1.jar` | `assets/allthemodium/models/item/allthemodium_{apple,carrot}.json` |
| `mods/allthemodium-3.0.1_mc_1.21.1.jar/assets/allthemodium/textures/item/allthemodium_{apple,carrot}.png` | mesmo jar | `assets/allthemodium/textures/item/allthemodium_{apple,carrot}.png` |
| arquivos de receita/loot/tag/estrutura/lang que citam os 8 ids | instancia real e jar vanilla | definidos pelo laco diferencial de B2.1 |

Ja no snapshot (conferido, nada a copiar): 78 `spawn_bait_effects` do jar + 3 do kubejs, tag `bait_seasoning` + `berries/*`, `data/cobblemon/pokerods/*.json`, `kubejs/server_scripts/Tweaks/tags.js`, `campfire_pot/poke_snack.json` e `poke_bait.json`, lang `block.cobblemon.poke_snack`, lang vanilla com `item.minecraft.<os 5>` (en_us e pt_br), `assets/allthemodium/lang/en_us.json` e `kubejs/assets/allthemodium/lang/pt_br.json`.

## 5c. Autorizacao

N/A: site estatico sem login nem papeis; todo visitante ve tudo.

---

## 6. Divisao do trabalho

## Backend

"Backend" aqui = pipeline `tools/dataset/` (Node + tsx), arquivo curado, acrescimos ao snapshot `data-source/`, auditoria `tools/dataset/audit/` e republicacao do dataset em `public/data/<versao>/`. Sprints B1 (contrato + pipeline) e B2 (snapshot, auditoria, publicacao). O contrato (B1.1) e a primeira coisa a entrar e congela os tipos que o Frontend consome.

## Frontend

"Frontend" = app React em `src/`: funcao de dominio da recomendacao, bloco "Iscas" no `WherePanel`, chips de pesca na linha do spawn, painel de efeitos e ingredientes na pagina do item, rotulo da estacao, i18n PT/EN. Referencia visual obrigatoria: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/UISPEC_spawn-bait.md` (secoes 3 a 7) e as capturas em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/ui-refs/`. Nao re-derivar a identidade: tokens e componentes do UISPEC secao 3 e 4. Sprints F1 (ficha do Pokemon) e F2 (pagina do item). O Frontend so COMECA depois de B2.3 verde (dataset novo publicado): entre B1.1 e B2.3 o app nao abre (o `items.json`/`species` publicado ainda e o velho e os schemas novos o rejeitam).

Sprint final T1: testes (definidos aqui, escritos na etapa de testes).

---

## 7. Sprints

### Regras gerais de toda feature de frontend (auto-fill da categoria `frontend`)

- **Loading**: enquanto `useItems()` devolve `null`, o bloco "Iscas" mostra as linhas de contexto (os `ItemLink` com `items === null` ja renderizam como link, `ItemLink.tsx:24`) e um `<Skeleton height={14} width="60%" className="bait-skeleton" />` (`src/components/Skeleton.tsx:4`) no lugar das bagas e dos reforcos; nunca area vazia piscando.
- **Erro**: falha de `loadItems` ja cai no `console.warn` de `useItems` (`EvolutionPanel.tsx:29`); o bloco fica no estado de loading (linhas de contexto sem bagas), sem quebrar o painel. A pagina do item ja tem `InlineError` (`ItemScreen.tsx:434`).
- **Vazio**: sem baga aplicavel, texto `where.bait.noBerries`; sem spawn, sem bloco (RF-06).
- **Offline**: nada novo de rede; tudo vem de `items.json` e `species/<dex>.json` ja em cache.
- **Classes proibidas dentro do bloco e dos chips de pesca**: `.spawn-entry`, `.spawn-more`, `.drop`, `[data-drop]`, `.where-rarity`, `.ob-none`, `.ob-link`, `[data-obtain]`, `.badge-nospawn`, `.seal`; e dentro de `.spawn-entry` tambem `.tag`, `.badge`, `.biome`, `.cond` (UISPEC secao 6; CONTEXT secao 7). `ItemLink` sempre com `className` explicito sem `tag`.
- **Tema/mobile**: so variaveis (`--surface-2`, `--border`, `--secondary`, `--secondary-soft`, `--muted`, `--radius-md`), `flex-wrap` e `overflow-wrap: anywhere`, sem hex; 360/390/1280 px sem vazamento nem sobreposicao (`expectNoOverlap`, `tests/harness/no-overlap.ts`).
- **Textos**: todo texto por `t()` (regra de lint `pontindex/no-literal-jsx-text`); nomes de jogo (item, tipo, grupo de ovo) pelo idioma do toggle do card (`useTermsLanguage("where")` / `useTermsLanguage("itempage")`).
- **Done when (dente)**: toda feature de frontend so esta verde depois de renderizada headless: dev server proprio (`npx vite --port 4177 --strictPort`, em background) e um spec temporario `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/zz-spawn-bait-capture.spec.ts` (copia `boot`/`openDetail`/`settle` de `tests/e2e/detail.spec.ts:22-60` e `openItem` de `tests/e2e/item.spec.ts:45`), rodado com `PW_DEV=1 PW_PORT=4177 npx playwright test tests/e2e/zz-spawn-bait-capture.spec.ts` (headless, sem slowMo, sem sleep; esperas por `settle`/auto-wait), que salva PNGs `after-<alvo>-{pt,en,pt-mobile}.png` em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/ui-refs/` para comparar com as capturas "antes" do UISPEC secao 2. O spec temporario e APAGADO antes do commit (nunca versionado); os PNGs `after-*` sao versionados (regra do projeto: todo `.forge` versionado). Parar o dev server ao terminar.

### Regras gerais de toda feature de pipeline (auto-fill `build`/`estrutura`/`outro`)

- **Edge cases padrao**: JSON invalido (usar `parseLenient`/`readJsonEntries` que ja reportam), arquivo ausente (aviso `W_*`, nunca inventa dado), ordem deterministica (ordenar por id/caminho antes de escrever), mesma saida em modo snapshot e instancia.
- **Janela quebrada B1.1 -> B2.3**: B1.1 torna `fishing`/`bait` obrigatorios; ate B2.3 republicar, `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` (linhas 91 e 140 validam o dataset publicado) falham, e o app e o e2e nao abrem. Por isso: todo "Done when" de B1.x e de B2.1/B2.2 roda o vitest com `--exclude tests/unit/data/published-schemas.test.ts --exclude tests/unit/dataset/join.test.ts`; os dois voltam e TEM de passar em B2.3; o Frontend so comeca depois de B2.3 verde; o agente de backend anota a janela nas notas do checklist e no HANDOFF.
- **Done when (dente)**: rodar o pipeline no snapshot em pasta de teste e inspecionar o arquivo gerado: `npm run dataset -- --offline --out tools/dataset/out/_sb_stage --publish-dir tools/dataset/out/_sb_pub` (se o cache da PokeAPI em `tools/dataset/.cache/pokeapi` faltar alguma resposta, rodar sem `--offline`). Os arquivos ficam em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/out/_sb_pub/data/<versao>/`. Nunca publicar em `public/` antes de B2.3.

---

## Backend

### Sprint B1: Contrato e pipeline

- **Descricao**: congela o contrato novo (tipos + zod), publica condicoes de pesca tipadas, efeitos de isca + tempero, os 8 itens novos com tag/categoria/ingredientes e as texturas.
- **Deliverable**: pipeline gera no snapshot `items.json` com 951 itens (`bait`, `potRecipes`) e `species/*.json` com `fishing`, validos contra os schemas.
- **Risco**: medio (contrato compartilhado; refatoracao de `collectRecipes`).
- **Prerequisito**: nenhum (B1.1 primeiro; B1.2 e B1.3 dependem de B1.1; B1.4 de B1.3; B1.5 de B1.4).
- **Files**: ver cada feature.

#### Feature B1.1: Contrato do dataset (tipos, zod e fixtures) `[category: estrutura]`
- **Traces**: RF-41, RF-46 (forma), RF-38/RF-40 (forma), RF-42 (forma), RNF-04, RNF-05.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts` (modificar: novos tipos antes da linha 234 e depois da linha 358; `SpawnEntry` linha 252; craftable linha 362; `ItemInfo` linha 446)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts` (modificar: `spawnEntrySchema` linha 149; schemas novos entre as linhas 241 e 243; craftable linha 257; `cooking` linha 303)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/spawns.ts` (placeholder `fishing: null` no objeto de `parseEntry`, antes de `extra: extraOf(raw)` linha 115)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts` (placeholder `bait: null` depois de `cooking` linha 197)
  - fixtures tipadas (acrescentar `bait: null` ao lado de `cooking`, ou `fishing: null` ao lado de `extra`): `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-link-missing.test.tsx`, `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-obtain-sources.test.tsx`, `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-obtain-v2.test.tsx`, `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-screen.test.tsx` (linhas 20 e 57), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/items-screen.test.tsx`, `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/trainers-screen.test.tsx`, `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/item-obtain-v2.spec.ts` (mocks de item: acrescentar `bait: null` se o objeto for validado pelo schema), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/domain/ball-ranking.test.ts` (fixture `spawn` linha 12: `fishing: null`)
- **Steps**:
  1. Colar os tipos da secao 5.1 exatamente (nomes, ordem de campos, comentarios pt-BR sem acento).
  2. Colar os schemas da secao 5.2; `potRecipes` opcional; objetos novos `.strict()`.
  3. Placeholders `fishing: null` e `bait: null` no pipeline para o `typecheck` passar (B1.2/B1.3 trocam pelos valores reais).
  4. Rodar `grep -rn "cooking: null\|cooking: {" C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests` e `grep -rn "neededBaseBlocks: \[\]" C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests` para achar toda fixture; atualizar cada uma.
- **Edge cases**: `potRecipes` ausente tem de continuar valido (itens antigos); `bait: null` e `fishing: null` validos; campo extra em `fishing`/`bait` rejeitado (`.strict()`).
- **Consumes**: nada.
- **Done when**: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts --exclude tests/unit/dataset/join.test.ts` verde com o dataset ATUAL (os dois arquivos excluidos validam o dataset PUBLICADO com os schemas, `join.test.ts:91` e `:140`, e so voltam a passar em B2.3; o app e o e2e tambem ficam quebrados de B1.1 ate B2.3; o agente de backend registra isso nas notas do checklist e no HANDOFF); o pipeline no snapshot (comando das regras gerais) roda sem erro e todo `species/*.json` tem `"fishing":null` e todo item `"bait":null`.
- **Commit**: `feat(data): contrato do spawn-bait (fishing no spawn, bait e potRecipes no item)`
- **Rollback**: `git revert` do commit.

#### Feature B1.2: Condicoes de pesca tipadas no spawn `[category: build]`
- **Traces**: RF-19, RF-20, RF-21, RF-24 (dados), RF-41, RF-46, RNF-01, RNF-08.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/fishing.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/species/spawns.ts` (modificar: `extraOf` linha 38, `parseEntry` linha 82, `collectFile` linha 119, `collectSpawnsBySlug` linha 306)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/README.md` (documentar `fishing` na secao "Saida")
- **Steps**:
  1. `fishing.ts` exporta:
     - `const LURE_KEYS = new Set(["minLureLevel", "maxLureLevel"])`;
     - `isLureOnlyCondition(c: unknown): boolean` (objeto com >= 1 chave e todas em `LURE_KEYS`, valores numericos);
     - `lureMultiplierOf(m: unknown): SpawnLureMultiplier | null` (`{ multiplier: number, condition }` so-Lure -> `{ lureMin: condition.minLureLevel ?? null, lureMax: condition.maxLureLevel ?? null, multiplier }`);
     - `collectPokeRods(ctx: Pick<PipelineContext, "reader">): Map<string, string>`: para cada jar de `ctx.reader.listJars()`, `readJsonEntries(ctx.reader.readJar(jar, [prefix]), prefix, jar.fileName)` com `prefix = "data/cobblemon/pokerods/"` (so esse prefixo; nunca ler `data/` inteiro), e `ctx.reader.readTree("kubejs/data/cobblemon/pokerods")` (chaves relativas); id = `cobblemon:<nome do arquivo sem .json>` -> `pokeBallId` (string); kubejs vence;
     - `fishingOf(raw: Json, rods: ReadonlyMap<string, string>): SpawnFishing | null`: le `raw.condition.bait` (string), `raw.condition.rodType` (string), `minLureLevel`/`maxLureLevel` (number), `raw.weightMultiplier` (objeto) e `raw.weightMultipliers` (lista); `rodBall = rodType ? rods.get(rodType) ?? null : null`; devolve `null` se tudo nulo e lista vazia.
  2. `spawns.ts`:
     - `extraOf(raw)` (linha 38): antes de copiar, tratar `weightMultiplier` (se so-Lure, nao copiar) e `weightMultipliers` (copiar so as entradas que NAO sao so-Lure; se sobrar lista vazia, nao copiar a chave); em `condition`, acrescentar `bait`, `rodType`, `minLureLevel`, `maxLureLevel` ao filtro (nao vao para `extra.condition`); se `rest` ficar vazio a chave `condition` continua omitida (comportamento atual da linha 45).
     - `parseEntry(raw, source, report, where, rods)` ganha o 5o parametro `rods: ReadonlyMap<string, string>` e grava `fishing: fishingOf(raw, rods)` imediatamente antes de `extra` (ordem de chave = contrato).
     - `collectFile(..., rods)` repassa; `collectSpawnsBySlug` (linha 306) chama `const rods = collectPokeRods(ctx)` uma vez e passa adiante. Nenhum outro chamador de `parseEntry`/`collectFile` existe (conferir com `grep -rn "parseEntry\|collectFile" C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools`).
     - `rodType` sem arquivo de pokerod: `rodBall: null` + aviso `W_SPAWN_ROD_UNKNOWN` (id) uma vez por rodType.
  3. README: paragrafo "Pesca (spawn-bait)" com a regra so-Lure e o `rodBall`.
- **Edge cases**: `weightMultiplier` com `minLureLevel` + outra chave (0 casos hoje) fica em `extra`; `minLureLevel` nao numerico ignorado; `bait`/`rodType` em spawn que nao e `fishing` (0 casos) publicado igual; kubejs sobrescreve pokerod; determinismo: `collectPokeRods` itera jars na ordem de `listJars()` e kubejs por ultimo.
- **Consumes**: `SpawnFishing`, `SpawnLureMultiplier` (B1.1).
- **Done when**: pipeline no snapshot; em `tools/dataset/out/_sb_pub/data/<versao>/species/`: `120.json` spawn `allthemons:staryu-10` igual ao exemplo da secao 5.3 (fishing e extra); `194.json` `cobblemon:wooper-true-16` com `rodBall "cobblemon:love_ball"` e 2 multiplicadores; `704.json` Goomy `minLureLevel 2, maxLureLevel 2`; script de contagem (node inline) sobre todos os `species/*.json`: 143 spawns com `fishing.minLureLevel != null`, 3 com `maxLureLevel`, 3 com `bait`, 6 com `rodType`, soma de `lureMultipliers` = 357 (159 singular + 198 da lista), e 0 ocorrencias de `minLureLevel`/`maxLureLevel`/`rodType`/`bait` dentro de `extra`; `species` em bytes <= 5.693.585.
- **Commit**: `feat(dataset): condicoes de pesca tipadas no spawn (isca, vara, Lure e multiplicadores)`
- **Rollback**: `git revert`; B1.1 continua (placeholder `fishing: null`).

#### Feature B1.3: Efeitos de isca e temperos aceitos em items.json `[category: build]`
- **Traces**: RF-25 (dados), RF-27, RF-38, RF-39, RF-40, RF-09, RF-55 (dados), RNF-01, RNF-08.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/bait.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/curated/bait-seasoning-extra.json` (criar, conteudo da secao 5b)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/recipes.ts` (modificar: `RecipeCollection` linha 695 ganha `itemTags: Map<string, Set<string>>`; `collectRecipes` linha 705 devolve `tags` da linha 738 nesse campo, no `return` da linha 814)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts` (modificar: substituir `collectBaitItemIds` linhas 26-40 e o uso nas linhas 107/126; preencher `bait` no objeto das linhas 186-198)
- **Steps**:
  1. `bait.ts` exporta:
     - `BAIT_PREFIX = "data/cobblemon/spawn_bait_effects/"` (movido de `stage.ts:26`), `BAIT_SEASONING_TAG = "cobblemon:recipe_filters/bait_seasoning"`, `SEASONING_EXTRA_FILE = path.resolve(import.meta.dirname, "../../curated/bait-seasoning-extra.json")`;
     - `BAIT_EFFECT_KINDS: Readonly<Record<string, BaitEffectKind>>` = `{ typing:"typing", egg_group:"eggGroup", nature:"nature", ev:"ev", iv:"iv", bite_time:"biteTime", level_raise:"levelRaise", pokemon_chance:"pokemonChance", gender_chance:"genderChance", ha_chance:"haChance", friendship:"friendship", drops_reroll:"dropsReroll", shiny_reroll:"shinyReroll", rarity_bucket:"rarityBucket" }`;
     - `interface RawBaitEffect { type: string; subcategory: string | null; chance: number; value: number | null }` e `collectBaitEffects(ctx: Pick<PipelineContext, "reader" | "report">): Map<string, RawBaitEffect[]>`: jars de `listJars()` com `readJar(jar, [BAIT_PREFIX])` + `readJsonEntries`, depois `ctx.reader.readTree("kubejs/data/cobblemon/spawn_bait_effects")` (parse com `JSON.parse` do texto UTF-8; JSON invalido = `W_BAIT_EFFECT_INVALID`); chave = `data.item`; ultimo vence; `effects` nao-array = `[]`; `subcategory` = `typeof s === "string" ? s : null`; `value` = numero ou `null`;
     - `normalizeBaitEffects(raw: RawBaitEffect[], report): Omit<BaitEffect,"text">[]` (path do type -> `BAIT_EFFECT_KINDS`, desconhecido pula com `W_BAIT_EFFECT_UNKNOWN`; subcategoria sem namespace; dedupe por `kind|subcategory` com `W_BAIT_EFFECT_DUPLICATE`);
     - `STAT_LANG = { hp:"hp", atk:"attack", def:"defence", spa:"special_attack", spd:"special_defence", spe:"speed" }`;
     - `renderBaitTooltip(effect, typePath: string, lang: LangTable): LocalizedText` com a regra da secao 2.4 item 1 (formatar `%1$s` com `String(Number((chance * 100).toFixed(2)))`, `%3$s` com `Math.trunc`; substituir `%1$s`, `%2$s`, `%3$s` e depois `%%` -> `%`); template EN ausente = aviso `W_BAIT_TOOLTIP_MISSING` e texto `{ pt: typePath, en: typePath }` (nunca vazio);
     - `loadSeasoningExtra(file = SEASONING_EXTRA_FILE): Map<string, string>` (zod `z.record(z.string().regex(/^[a-z0-9_.-]+:[a-z0-9_./-]+$/), z.string().min(1))`);
     - `buildSeasoningSet(itemTags, extra): Set<string>` = `itemTags.get(BAIT_SEASONING_TAG) ?? new Set()` uniao chaves do extra.
  2. `recipes.ts`: expor `itemTags` na `RecipeCollection` (sem outra mudanca aqui; a separacao gather/report e da B1.4).
  3. `stage.ts`: `const baitEffects = collectBaitEffects(ctx)`; ids com tag `bait` = `baitEffects.keys()` (mesma regra de hoje, agora com kubejs); `const seasoning = buildSeasoningSet(recipeCollection.itemTags, loadSeasoningExtra())` (nesta feature obter a colecao com `collectRecipes(ctx, catalogIds)` no lugar de `collectCraftable` da linha 108, usando `.craftable` e `.itemTags`); para cada item do catalogo: `bait = baitEffects.has(id) ? { effects: normalize(...).map(e => ({ ...e, text: renderBaitTooltip(...) })), seasoning: seasoning.has(id) } : null`; ids curados sem efeito -> `W_BAIT_SEASONING_EXTRA_UNKNOWN`.
  4. Report: `ctx.report.section("bait", { items: n, seasoning: n, withTyping: n, withEggGroup: n, boosters: [ids] })`.
- **Edge cases**: `mythical_pecha_berry` nao aparece (nao esta em `spawn_bait_effects`; `seasonings/**` nao e lido: RF-09); `poke_bait` com `effects: []` -> `{ effects: [], seasoning: false }`; item com efeito fora do catalogo (os 7 novos ainda fora ate B1.4) nao gera nada; locale: formatacao com ponto decimal (valores atuais sao inteiros apos x100).
- **Consumes**: `ItemBait`, `BaitEffect`, `BaitEffectKind` (B1.1).
- **Done when**: pipeline no snapshot; em `items.json`: `cobblemon:occa_berry.bait` igual ao exemplo da secao 5.3 (texto PT e EN exatos); `cobblemon:lum_berry.bait.effects` = 2 `eggGroup` (`dragon`, `monster`); `cobblemon:starf_berry` tem `shinyReroll` com texto en "100% - 5× Shiny Chance"; nenhum `subcategory` com ":" (script inline); 73 itens com `bait != null` nesta etapa (os 72 bagas/frutas ja no catalogo + `poke_bait`; conferir contagem real e registrar); `cobblemon:pecha_berry.bait.seasoning === true`; `items.json` em bytes <= 1.659.908.
- **Commit**: `feat(dataset): efeitos de isca com texto do jogo e temperos aceitos pela panela`
- **Rollback**: `git revert`.

#### Feature B1.4: Catalogo com os 8 itens novos, tag/categoria e ingredientes da panela `[category: build]`
- **Traces**: RF-28 (dados), RF-29 (dados), RF-30 (dados), RF-33, RF-35, RF-36, RF-37, RF-39, RF-42, RF-54.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/pot-recipes.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/recipes.ts` (modificar: `RecipeRecord` linha 145 ganha `potRecipe: RawPotRecipe | null`; `buildRecipeIndex` linha 182 preenche; `RecipeCollection` linha 695 ganha `potRecipes` e `stats`; `collectRecipes` linha 705 vira `gatherRecipes` + `reportRecipes`; bloco do report linhas 797-813 movido para `reportRecipes`; `collectCraftable` linha 818 mantido)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/catalog.ts` (modificar: `CatalogEntry` linha 11 ganha `viaBait: boolean`; `BuildCatalogDeps` linha 97 ganha `baitItemIds?: ReadonlySet<string>`; ids de isca acrescentados a `allIds` depois da linha 121; `viaBait` no `catalog.push` linha 140)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts` (modificar: `runItemsStage` linha 78; chamada `buildCatalog` linha 90; `craftable` linha 108; tags linha 126; rota craftable linha 130; objeto linhas 186-198)
- **Steps**:
  1. `pot-recipes.ts`: `interface RawPotRecipe { seasoningTag: string; ingredients: RawIngredient[] }`, `type RawIngredient = { kind: "item" | "tag"; id: string; count: number }`; `parsePotIngredients(data: Record<string, unknown>): RawIngredient[] | null`: se `Array.isArray(data.pattern) && isObject(data.key)` = shaped (varre `pattern` linha a linha, caractere a caractere, ignora espaco; cada simbolo -> `key[simbolo]`); senao se `Array.isArray(data.ingredients)` = shapeless; cada ingrediente precisa ser objeto com `item` string ou `tag` string, senao retorna `null`; soma iguais (`kind|id`) mantendo a ordem da primeira ocorrencia.
  2. `recipes.ts`:
     - em `buildRecipeIndex` (linha 182), depois de `status`: `potRecipe: typeof data.seasoningTag === "string" ? toPot(data) : null`, onde `toPot` usa `parsePotIngredients` (resultado `null` = `potRecipe` com `ingredients: []` e flag `unparsed: true` para o report);
     - `gatherRecipes(ctx)`: corpo atual de `collectRecipes` (linhas 709-796 e 815), SEM o `ctx.report.section`; guarda em `stats` as listas NAO filtradas (`droppedAll`, `removed`, `additions`, contadores) e devolve `{ craftable, recipes, removed, unparsedRemovals, scriptRecipes, itemTags, potRecipes, stats }`; `potRecipes: Map<outputId, PotRecipeRecord[]>` = receitas com `status === "ok"`, nao removidas pelo kubejs, `potRecipe.seasoningTag === BAIT_SEASONING_TAG` (importar de `bait.ts`), para cada `output`; `PotRecipeRecord = { recipeId, recipeType, seasoningTag, ingredients: RawIngredient[] }`, lista ordenada por `recipeId`;
     - `reportRecipes(ctx, collection, catalogIds?)`: o `ctx.report.section("recipes", ...)` identico ao de hoje, aplicando `relevant` sobre `stats` (o report tem de sair igual ao atual para o mesmo catalogo), mais `potRecipes: [...ids]`;
     - `collectRecipes(ctx, catalogIds?)` = `const c = gatherRecipes(ctx); reportRecipes(ctx, c, catalogIds); return c;` (mesma assinatura).
  3. `catalog.ts`: `CatalogEntry` (linha 11) ganha `viaBait: boolean` ("entrou so pela fonte de referencia de isca"). Em `buildCatalog`, depois de montar `allIds` com lang + `referenced` (linhas 114-121) e ANTES de acrescentar os ids de isca: `const baitOnly = new Set([...(deps.baitItemIds ?? [])].filter((id) => !allIds.has(id)))`; depois `for (const id of baitOnly) allIds.add(id)`; no `catalog.push` (linha 140) `viaBait: baitOnly.has(id)` (entram como `referenceOnly`, pois nao estao em `fromLangKeys`). Hoje `baitOnly` = os 5 vanilla + os 2 allthemodium + `cobblemon:poke_snack`.
  4. `stage.ts`, nova ordem em `runItemsStage`:
     1. `const recipeData = gatherRecipes(ctx)` e `const baitEffects = collectBaitEffects(ctx)` ANTES do `buildCatalog` (linha 90);
     2. `const potOutputs = new Set(recipeData.potRecipes.keys())`; `baitItemIds = new Set([...baitEffects.keys(), ...potOutputs])`; passar em `buildCatalog(ctx, { ..., baitItemIds })`;
     3. depois do catalogo: `reportRecipes(ctx, recipeData, new Set(catalog.map((e) => e.id)))`; `const craftable = recipeData.craftable` (substitui a linha 108);
     4. tag `bait` (linha 126): `if (baitEffects.has(entry.id) || potOutputs.has(entry.id)) tags.add("bait")`;
     5. categoria: depois do `categorize` (linha 124): `const finalCategory: ItemCategory = entry.viaBait || potOutputs.has(entry.id) ? "bait" : category`; usar `finalCategory` em `category` (linha 192), em `cooking: finalCategory === "cooking" ? { effectNote: "pending" } : null` (linha 197; o `poke_snack` fica `null`) e na regra de `mint` (linha 136). Esperado: categoria `bait` para `minecraft:golden_apple`, `minecraft:enchanted_golden_apple`, `minecraft:golden_carrot`, `minecraft:glistering_melon_slice`, `minecraft:glow_berries`, `allthemodium:allthemodium_apple`, `allthemodium:allthemodium_carrot`, `cobblemon:poke_snack`, `cobblemon:poke_bait` (9); as bagas seguem `berry`, `minecraft:apple`/`minecraft:sweet_berries` seguem `other`;
     6. rota craftable (linha 130): `const pots = recipeData.potRecipes.get(entry.id)`; `obtain.push({ kind: "craftable", recipeTypes: [...], ...(pots && pots.length ? { potRecipes: pots.map(toPublished) } : {}) })`, onde `toPublished` converte ingrediente `item` em `{ kind:"item", id, count, name: gameItemName(id) }` e `tag` em `{ kind:"tag", id, count }`;
     7. report `items` ganha `bait: { newCatalogIds: [os ids que entraram so por baitItemIds] }`.
- **Edge cases**: receita de isca removida pelo kubejs (0 hoje) nao gera `potRecipes`; duas receitas para o mesmo item = duas entradas; nome `null` quando o jogo nao tem chave (RF-54: nome do catalogo segue a regra atual `en` obrigatorio, `pt` cai para `en`, `catalog.ts:130-144`); item fantasma (sem textura e sem rota) continua fora com `W_ITEM_REFERENCE_UNKNOWN` (os 2 allthemodium so passam a ter textura em B1.5: nesta feature eles podem entrar pela rota `craftable` do jar allthemodium se a receita estiver no snapshot; B2.1 garante a paridade).
- **Consumes**: `PotRecipe`, `RecipeIngredient` (B1.1); `collectBaitEffects`, `BAIT_SEASONING_TAG` (B1.3).
- **Done when**: pipeline no snapshot; `items.json`: `cobblemon:poke_snack` igual ao exemplo da secao 5.3 (categoria `bait`, tag `bait`, `cooking: null`, `potRecipes` com os 4 ingredientes 3/2/1/3 nessa ordem); `cobblemon:poke_bait` com `potRecipes` mel x1, `c:mushrooms` x1, `minecraft:wheat` x1 (`name.pt` "Trigo"); nenhum outro item com `potRecipes` (script inline: exatamente 2); os 9 itens da regra de categoria (secao 2.4 item 7) com `category: "bait"` e as 72 bagas com `berry`; `minecraft:golden_apple` e `minecraft:enchanted_golden_apple` presentes com tag `bait` (a textura vanilla ja resolve pelo `publishVanillaTextures` se B1.5 ja copiou os modelos; senao registrar e seguir); `tools/dataset/out/_sb_stage/report.json` secao `recipes` com as mesmas chaves e contagens de antes (`recipeIds`, `status`, `removedByKubejsTotal` iguais aos do report anterior do mesmo snapshot); `npx vitest run tests/unit/dataset/recipes.test.ts` verde.
- **Commit**: `feat(dataset): iscas e Poke-Lanche no catalogo com ingredientes da panela de fogueira`
- **Rollback**: `git revert` (volta `collectRecipes` monolitica).

#### Feature B1.5: Texturas dos itens novos e copia para o snapshot `[category: build]`
- **Traces**: RF-34, RF-33 (textura), RNF-02.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/media/mod-item-textures.ts` (criar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts` (modificar: depois do `publishVanillaTextures` linhas 92-96)
  - snapshot (copiar, tabela da secao 5b): `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/vanilla/1.21.1.jar/assets/minecraft/models/item/` (5 json), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/vanilla/1.21.1.jar/assets/minecraft/textures/item/` (4 png), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/mods/allthemodium-3.0.1_mc_1.21.1.jar/assets/allthemodium/models/item/` (2 json, pasta nova), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/mods/allthemodium-3.0.1_mc_1.21.1.jar/assets/allthemodium/textures/item/` (2 png, pasta nova)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/MANIFEST.json` (nova entrada em `additions`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/README.md` (novo paragrafo datado 2026-09-29)
- **Steps**:
  1. Copiar com `unzip -o -j "<jar>" "<entrada>" -d "<pasta destino>"` (bytes identicos; nada re-encodado). Conferir com `cmp` contra `unzip -p`.
  2. `mod-item-textures.ts`: `export const MOD_TEXTURE_JAR_PREFIX: Readonly<Record<string, string>> = { allthemodium: "allthemodium-" };` e `publishModItemTextures(ctx, refs: readonly { namespace: string; path: string }[]): Promise<{ published: Map<string, string>; missing: { id: string; reason: string }[] }>`: para cada namespace, jar = unico de `modJarPaths(ctx.reader.root)` (`recipes.ts:655`) cujo `fileName` comeca com o prefixo (0 ou >1 = `missing`); leitor igual ao `vanillaReader` (`vanilla-textures.ts:52`) mas filtrando `assets/<ns>/models/item/` e `assets/<ns>/textures/item/`; modelo `assets/<ns>/models/item/<path>.json` -> `textures.layer0` (`<ns>:item/<x>`) -> PNG `assets/<ns>/textures/<x>.png`; frame de animacao igual ao vanilla (`parseTextureAnimation`/`extractAnimationFrame`); grava `ctx.assetPath("items", ns, `${path}.png`)` com `writeFileAtomic`; `ctx.flags.skipMedia` = retorna vazio. Aviso `W_MOD_TEXTURE_UNRESOLVED` com a lista.
  3. `stage.ts`: depois das linhas 92-96, `const modTextures = await publishModItemTextures(ctx, built.filter((e) => e.texture === null && e.namespace in MOD_TEXTURE_JAR_PREFIX && baitItemIds.has(e.id)))`; `entry.texture = "assets/items/" + rel`; report `items.modTextures`.
  4. MANIFEST `additions`: `{ "date": "2026-09-29", "what": "spawn-bait: modelos e texturas dos 5 itens de isca vanilla (jar do cliente 1.21.1) e dos 2 itens de isca do allthemodium (jar allthemodium-3.0.1 da instancia), lidos por vanilla-textures.ts e mod-item-textures.ts", "files": [13 caminhos relativos ao snapshot] }`.
  5. README do snapshot: paragrafo "2026-09-29 (spawn-bait, texturas das iscas, 13 arquivos)" com origem e regra.
- **Edge cases**: `enchanted_golden_apple` usa a textura do `golden_apple` (publicada como `minecraft/enchanted_golden_apple.png`, sem o brilho do encantamento, que o jogo desenha em tempo real); jar allthemodium ausente = aviso, item segue sem textura (e cai como fantasma se tambem nao tiver rota).
- **Consumes**: `baitItemIds` (B1.4).
- **Done when**: pipeline no snapshot; os 8 ids em `items.json` com `texture` nao nula e arquivo existente em `tools/dataset/out/_sb_pub/assets/items/` (`minecraft/golden_apple.png` etc., `allthemodium/allthemodium_apple.png`, `cobblemon/food/poke_snack.png`); texturas distintas referenciadas por `items.json` = 931 (< 1200); abrir os 7 PNGs novos com o Read (conferencia visual).
- **Commit**: `feat(dataset): texturas das iscas vanilla e allthemodium, com os arquivos copiados para o snapshot`
- **Rollback**: `git revert` (remove os arquivos copiados junto).

### Sprint B2: Snapshot, auditoria e publicacao

- **Descricao**: garante a regra byte a byte instancia x snapshot para os ids novos, estende a auditoria e publica a versao nova do dataset.
- **Deliverable**: `public/data/<versao nova>/` + `current.json`; auditoria 0 divergencias; prova byte a byte registrada.
- **Risco**: alto (B2.1 depende de varredura da instancia real).
- **Prerequisito**: Sprint B1 completo.

#### Feature B2.1: Paridade do snapshot para os ids novos e checagem byte a byte `[category: outro]`
- **Traces**: RF-44, RF-34, RF-35, RNF-08, RNF-09.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/**` (arquivos que o laco apontar)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/atm-1.3.0/MANIFEST.json` (entrada `additions` "spawn-bait: fontes dos 8 ids novos")
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/data-source/README.md` (paragrafo datado)
- **Steps**:
  1. Rodar os dois pipelines (instancia real e snapshot) em pastas de teste:
     - `npm run dataset -- --offline --instance "C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons" --out tools/dataset/out/_sb_inst_stage --publish-dir tools/dataset/out/_sb_inst`
     - `npm run dataset -- --offline --out tools/dataset/out/_sb_snap_stage --publish-dir tools/dataset/out/_sb_snap`
  2. Comparar `data/<versao>/items.json` e todos os `species/*.json` (`cmp`; se as versoes diferirem, e porque algum arquivo difere). Species devem sair iguais (as unicas leituras novas de species sao `pokerods`, ja no snapshot).
  3. Para cada id que difere em `items.json`, comparar rota a rota (`obtain`, `name`, `texture`) e localizar a fonte que falta no snapshot pela regra da secao do `data-source/README.md` correspondente ao tipo de rota: `craftable` -> U7a (receitas `data/<ns>/recipe/**` cuja saida e o id, de qualquer jar de `mods/` ou do jar vanilla, e sobrescritas de mesmo id); `structureLoot`/`fishing` -> U7b (tabela que contem o id, tabelas alcancaveis e tags de item usadas); `blockDrop`/`mobDrop` -> U7b/U7c (tabelas `blocks/**`, `entities/**`, global loot modifiers); `structurePlaced` -> U7c/U10 (`.nbt` que contem o id e a cadeia `structure_set`->`structure`->`template_pool`); `trade`/`worldgen`/`questReward`/`shop` -> U7c; nomes de ref -> U8 (lang que vence a chave). Varredura da instancia com um script TEMPORARIO no scratchpad do agente (nunca no repo), que abre cada jar de `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons/mods/` e `C:/Users/Usuario/curseforge/minecraft/Install/versions/1.21.1/1.21.1.jar` com `fflate.unzipSync` filtrando a pasta do tipo de rota e procura o id no texto (`.nbt`: `gunzipSync` antes) ou usa as funcoes do pipeline (`collectRecipes`, `collectLoot`, `collectExtraSources`) com um `ZipSourceReader` para listar a origem.
  4. Copiar cada arquivo achado para o mesmo caminho relativo no snapshot (`mods/<jar>/...` ou `vanilla/1.21.1.jar/...`), bytes identicos, e repetir 1 a 3 ate `items.json` e todos os `species/*.json` ficarem identicos.
  5. Registrar a lista em MANIFEST `additions` (data, "what" com a regra, "files") e paragrafo no README do snapshot, citando so o nome da variavel `ATM_INSTANCE_DIR` quando falar da instancia (RNF-09).
- **Edge cases**: arquivo ja presente com o mesmo conteudo (ignorando CR) nao copia; arquivo do kubejs nunca muda (ja copiado inteiro); se o laco nao convergir em 5 rodadas, parar e registrar em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/STATE_spawn-bait.md` a diferenca restante (nao publicar).
- **Consumes**: pipeline completo de B1.
- **Done when**: `cmp` sem saida entre `_sb_inst/data/<v>/items.json` e `_sb_snap/data/<v>/items.json` e entre cada par de `species/<dex>.json` (1027), e as duas `datasetVersion` iguais; o resultado (hash sha256 dos dois `items.json`) anotado no paragrafo do README do snapshot.
- **Commit**: `chore(data-source): fontes dos itens de isca no snapshot (paridade byte a byte com a instancia)`
- **Rollback**: `git revert` (so arquivos do snapshot + MANIFEST/README).

#### Feature B2.2: Auditoria com checks de isca, tempero, receita e pesca `[category: outro]`
- **Traces**: RF-45, RF-39, RF-40, RF-41, RF-46.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/expected.ts` (modificar: `RawSpawnEntry` linha 79, `ExpSpawn` linha 119, construcao do spawn linha 434, `Expected` linha 199 e retorno linha 627)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/compare.ts` (modificar: loop de spawns linha 314; secao de itens linhas 181-221)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/AUDIT_REPORT.md` (regenerado pelo `run.ts`, com nota "Rodada 5 (2026-09-29, spawn-bait)" no topo, no formato das rodadas 3 e 4)
- **Steps** (a auditoria NAO importa nada de `tools/dataset/src`; reimplementa a leitura do cru):
  1. `expected.ts`:
     - `RawSpawnEntry` ganha `condition?: { biomes?: string[]; bait?: string; rodType?: string; minLureLevel?: number; maxLureLevel?: number; [k: string]: unknown }`, `weightMultiplier?: { multiplier: number; condition?: Record<string, unknown> }`, `weightMultipliers?: { multiplier: number; condition?: Record<string, unknown> }[]`;
     - pokerods: ler `data/cobblemon/pokerods/*.json` da fonte `cobblemon` (e do kubejs se existir) -> `Map<"cobblemon:<nome>", pokeBallId>`;
     - `ExpSpawn` ganha `fishing: { bait; rodType; rodBall; minLureLevel; maxLureLevel; lureMultipliers: { lureMin; lureMax; multiplier }[] } | null` com a mesma regra da secao 2.4 item 10, reescrita aqui;
     - `Expected` ganha `baitItems: Map<string, { effects: { kind: string; subcategory: string | null; chance: number; value: number | null }[]; seasoning: boolean; file: string }>` (todas as fontes: `datapackFiles(s, "spawn_bait_effects")` so do namespace `cobblemon`, kubejs por ultimo vence por `item`; `kind` pelo mapa snake->camel reescrito; subcategoria sem namespace) e `potRecipes: Map<string, { type: string; ingredients: { kind: string; id: string; count: number }[]; file: string }>` (receitas `data/cobblemon/recipe/**` da fonte cobblemon com `seasoningTag === "cobblemon:recipe_filters/bait_seasoning"`, mesma regra de contagem/ordem);
     - tempero: resolver a tag `cobblemon:recipe_filters/bait_seasoning` a partir dos arquivos `data/<ns>/tags/item/**` das fontes (tags `#` aninhadas) e somar os ids achados por regex em `kubejs/server_scripts/**/*.js`: `/\.add\(\s*['"]cobblemon:recipe_filters\/bait_seasoning['"]\s*,\s*\[([^\]]*)\]/g` (lista de strings entre aspas). Isto confere o arquivo curado de forma independente.
  2. `compare.ts`:
     - no loop de spawns (linha 314): `eq(scope, \`spawn ${s.id} fishing\`, s.fishing, m.fishing ?? null, s.file, pf)`;
     - na secao de itens: para cada `[id, exp]` de `baitItems` com `items[id]` presente (o catalogo decide quem entra): `eq("item "+id, "bait.effects", exp.effects, items[id].bait?.effects.map(({kind,subcategory,chance,value}) => ({kind,subcategory,chance,value})))`, `eq(..., "bait.seasoning", exp.seasoning, items[id].bait?.seasoning)` e `eq(..., "tags has bait", true, items[id].tags.includes("bait"))`; para cada `potRecipes`: `eq(..., "potRecipes ingredients", exp.ingredients, rota craftable .potRecipes[0].ingredients sem name)`; os 8 ids novos: `MISSING` se ausentes em `items.json` ou com `texture` nula; `allthemons:mythical_pecha_berry` presente = `EXTRA`.
  3. Rodar `npx tsx tools/dataset/audit/run.ts tools/dataset/out/_sb_snap/data/current.json` (antes de B2.3) e `npx tsx tools/dataset/audit/run.ts` (depois de B2.3, dataset publicado).
- **Edge cases**: spawn sem `fishing` no publicado mas com condicao no cru = `MISSING`; `weightMultipliers` misto (0 hoje) fica fora dos dois lados.
- **Consumes**: dataset gerado em B1/B2.1.
- **Done when**: `run.ts` contra `_sb_snap` imprime `divergencias {}` (0 em todas as severidades) com o numero de checks maior que 43102 (checks novos contados); `AUDIT_REPORT.md` com a tabela da rodada 5 toda 0; `npx vitest run tests/unit/dataset/audit.test.ts` verde.
- **Commit**: `feat(audit): checks de isca, tempero, receita da panela e pesca`
- **Rollback**: `git revert`.

#### Feature B2.3: Republicar o dataset `[category: build]`
- **Traces**: RF-43, RF-44, RNF-01, RNF-02, RNF-08.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/data/current.json` (gerado)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/data/<versao nova>/**` (gerado; a pasta `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba` e removida pelo `write.ts`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/assets/items/minecraft/{golden_apple,enchanted_golden_apple,golden_carrot,glistering_melon_slice,glow_berries}.png` e `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/assets/items/allthemodium/allthemodium_{apple,carrot}.png` (gerados)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/README.md` (secao "Saida": `bait`, `potRecipes`, `fishing`, 8 itens, texturas allthemodium)
- **Steps**:
  1. `npm run dataset -- --offline` (publica em `public/`); se faltar cache da PokeAPI, sem `--offline`.
  2. Rodar de novo no mesmo snapshot em `--publish-dir tools/dataset/out/_sb_again` e `cmp` do `items.json` e `species/*.json` com os publicados (RNF-08: mesma `datasetVersion`).
  3. Medir: `wc -c public/data/<v>/items.json` (<= 1.659.908), soma `du -sb public/data/<v>/species` (<= 5.693.585), texturas distintas referenciadas (script inline sobre `items.json`, removendo `?v=`) <= 931 e < 1200. Anotar os 3 numeros no STATE.
  4. `npx tsx tools/dataset/audit/run.ts` (0 divergencias) e `npx vitest run tests/unit/data/published-schemas.test.ts tests/unit/dataset/join.test.ts tests/unit/ui-screens/item-page.test.ts` (o ultimo continua verde: o rotulo so muda em F2.2, junto do teste).
- **Edge cases**: `current.json` aponta para versao inexistente = nao commitar; versao igual a `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba` = pipeline nao mudou nada (erro).
- **Consumes**: B1, B2.1, B2.2.
- **Done when**: `current.json` com `datasetVersion` != `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba`; `published-schemas.test.ts` e `join.test.ts` verdes; os 3 numeros dentro das metas; `items.json` publicado identico (sha256) ao de `_sb_snap` e `_sb_inst` (mesmo conteudo).
- **Commit**: `feat(data): dataset republicado com iscas, receitas da panela e pesca tipada`
- **Rollback**: `git revert` (restaura a pasta e o `current.json` anteriores).

---

## Frontend

### Sprint F1: Ficha do Pokemon (bloco "Iscas" e pesca na linha do spawn)

- **Descricao**: textos PT/EN, rotulo da estacao, regra das 3 melhores (dominio puro), bloco "Iscas" no `WherePanel` e chips de pesca.
- **Deliverable**: ficha de Charizard, Gyarados, Magikarp, Wooper, Staryu, Feebas e Dipplin conforme CA-01..17, com capturas `after-*` em `ui-refs/`.
- **Risco**: medio (contagens do e2e de `#where-panel`).
- **Prerequisito**: B2.3 verde (dataset novo publicado; o app so abre de novo a partir dele). Nao comecar depois de B1.1.

#### Feature F1.1: Textos i18n do bloco, da pesca e dos efeitos `[category: frontend]`
- **Traces**: RF-47, RF-13, RNF-04, RNF-11, UISPEC secao 7.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/detail.ts` (acrescentar depois de `"egg.undiscovered"` linha 107)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/item.ts` (acrescentar depois de `"ip.special"` linha 56)
- **Steps**:
  1. `detail.ts` (valores exatos):
     - `"where.bait.title": { pt: "Iscas", en: "Bait" }`
     - `"where.bait.snackHint": { pt: "no chão: atrai quem nasce em terra ou na água", en: "on the ground: attracts land and water spawns" }`
     - `"where.bait.rodOr": { pt: "ou baga na vara", en: "or a berry on the rod" }`
     - `"where.bait.rodHint": { pt: "na Pokévara: atrai quem vem na pesca", en: "on the Poké Rod: attracts fishing spawns" }`
     - `"where.bait.berries": { pt: "Melhores bagas", en: "Best berries" }`
     - `"where.bait.noBerries": { pt: "Nenhuma baga de tipo ou grupo de ovo para este Pokémon", en: "No type or egg group berry for this Pokémon" }`
     - `"where.bait.boosts": { pt: "Reforços (qualquer Pokémon)", en: "Boosters (any Pokémon)" }`
     - `"where.bait.rarity": { pt: "raridade", en: "rarity" }`
     - `"where.bait.shiny": { pt: "shiny", en: "shiny" }`
     - `"where.fish.bait": { pt: "Isca exigida:", en: "Required bait:" }`
     - `"where.fish.rod": { pt: "Pokévara com boia:", en: "Poké Rod with bobber:" }`
     - `"where.fish.lure": { pt: "Lure {range}", en: "Lure {range}" }`
     - `"where.fish.lureMult": { pt: "Lure {range}: x{m}", en: "Lure {range}: x{m}" }`
     - `"where.fish.rangeMin": { pt: "{min}+", en: "{min}+" }`
     - `"where.fish.rangeMax": { pt: "até {max}", en: "up to {max}" }`
     - `"where.fish.rangeBoth": { pt: "{min} a {max}", en: "{min} to {max}" }`
  2. `item.ts`:
     - `"ip.bait": { pt: "Efeitos de isca", en: "Bait effects" }`
     - `"ip.bait.seasoning": { pt: "Tempero da Panela de Fogueira", en: "Campfire Pot seasoning" }`
     - `"ip.bait.seasoningYes": { pt: "Aceito como tempero do Poké-Lanche e da Pokéisca", en: "Accepted as seasoning for the Poké Snack and the Poké Bait" }`
     - `"ip.bait.seasoningNo": { pt: "Só na vara: a Panela de Fogueira não aceita este item como tempero", en: "Rod only: the Campfire Pot does not accept this item as seasoning" }`
     - `"ip.bait.kind.typing": { pt: "Tipo", en: "Type" }`, `".eggGroup": { pt: "Grupo de ovo", en: "Egg group" }`, `".nature": { pt: "Natureza", en: "Nature" }`, `".ev": { pt: "EV", en: "EV" }`, `".iv": { pt: "IV", en: "IV" }`, `".biteTime": { pt: "Tempo de mordida", en: "Bite time" }`, `".levelRaise": { pt: "Nível", en: "Level" }`, `".pokemonChance": { pt: "Chance de Pokémon", en: "Pokémon chance" }`, `".genderChance": { pt: "Gênero", en: "Gender" }`, `".haChance": { pt: "Habilidade oculta", en: "Hidden ability" }`, `".friendship": { pt: "Amizade", en: "Friendship" }`, `".dropsReroll": { pt: "Drops", en: "Drops" }`, `".shinyReroll": { pt: "Shiny", en: "Shiny" }`, `".rarityBucket": { pt: "Raridade", en: "Rarity" }` (chaves completas `ip.bait.kind.<kind>`)
     - `"ip.pot.ingredients": { pt: "Ingredientes:", en: "Ingredients:" }`
     - `"ip.pot.count": { pt: "{n}x", en: "{n}x" }`
     - `"ip.pot.seasoning": { pt: "mais até 3 temperos da lista de iscas (bagas e frutas aceitas pela panela)", en: "plus up to 3 seasonings from the bait list (berries and fruits the pot accepts)" }`
     - `"ip.ingredientTag.milk": { pt: "Qualquer leite", en: "Any milk" }`
     - `"ip.ingredientTag.mushrooms": { pt: "Qualquer cogumelo", en: "Any mushroom" }`
     - `"ip.ingredientTag.any": { pt: "Qualquer {name}", en: "Any {name}" }`
  (O rotulo da estacao "Panela de Fogueira" e da F2.2.)
- **Edge cases**: chave nova sem PT ou EN falha o teste de completude do dicionario (`tests/unit/ui-foundation/i18n.test.tsx`); nenhum texto com numero no bloco (os unicos numeros ficam em `where.fish.*`, fora do bloco).
- **Consumes**: nada do dataset.
- **Done when**: `npx vitest run tests/unit/ui-foundation/i18n.test.tsx tests/unit/ui-shell/i18n-modules.test.ts` verde; `npm run lint` limpo; captura headless (regra geral) da ficha do Charizard sem mudanca visual (as chaves ainda nao sao usadas): `after-detail-charizard-i18n-pt.png` igual a `detail-where-charizard-pt.png`.
- **Commit**: `feat(i18n): textos do bloco de iscas, da pesca e dos efeitos de isca`
- **Rollback**: `git revert`.

#### Feature F1.2: Regra das 3 melhores bagas (dominio puro) `[category: outro]`
- **Traces**: RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-12 (dados), RF-15, RF-16, RF-17, RF-18, RF-21 (formato), RF-24 (formato), RF-49, RF-50, RF-51, RF-52, RF-53, RF-55, RNF-06, RNF-10.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/domain/bait.ts` (criar)
- **Steps**:
  1. Constantes: `SNACK_ITEM_ID = "cobblemon:poke_snack"`, `POKE_BAIT_ITEM_ID = "cobblemon:poke_bait"`, `MAX_SEASONINGS = 3`.
  2. Tipos: `interface BaitPick { itemId: string; kind: "typing" | "eggGroup"; labels: string[] }` (labels = subcategorias do mesmo `kind` da baga, ordem do arquivo); `interface BaitBooster { itemId: string; rarity: boolean; shiny: boolean }`; `interface BaitIndex { byType: Map<string, string[]>; byEggGroup: Map<string, string[]>; labels: Map<string, { typing: string[]; eggGroup: string[] }>; boosters: BaitBooster[] }`.
  3. `buildBaitIndex(items: ItemsFile): BaitIndex`: so itens com `bait?.seasoning === true` (RF-08/16/55); cada lista de `byType`/`byEggGroup` ordenada por id; `boosters` = itens com efeito `rarityBucket` (rarity) ou `shinyReroll` (shiny), ordenados por id; cache `const cache = new WeakMap<ItemsFile, BaitIndex>()` com `getBaitIndex(items)`.
  4. `baitContexts(spawns: readonly Pick<SpawnEntry, "context">[]): { snack: boolean; rod: boolean } | null`: `null` quando `spawns.length === 0` (RF-06); `snack = spawns.some(s => s.context !== "fishing")`; `rod = spawns.some(s => s.context === "fishing")`.
  5. `recommendBerries(species: Pick<SpeciesDetail, "types" | "eggGroups">, index: BaitIndex, max = MAX_SEASONINGS): BaitPick[]`: percorre `species.types` e depois `species.eggGroups`, empilhando ids ainda nao vistos, ate `max`; grupo sem baga (`undiscovered`, `ditto`) simplesmente nao acrescenta (RF-52); nunca preenche com outra baga (RF-53).
  6. `lureRange(min: number | null, max: number | null): { key: "where.fish.rangeMin" | "where.fish.rangeMax" | "where.fish.rangeBoth"; vars: Record<string, number> } | null` (ambos -> `rangeBoth`; so min -> `rangeMin`; so max -> `rangeMax`; nenhum -> null).
  7. Sem `fetch`, sem efeito colateral, sem import de React (RNF-10).
- **Edge cases**: `items` com baga `seasoning: false` (ex. fora da tag) nunca entra (RF-55); Pokemon com tipo duplicado nos dados (nao ocorre) nao duplica; `eggGroups` vazio; baga com `typing` e `eggGroup` ao mesmo tempo (0 hoje) aparece na primeira posicao com `kind` do criterio que casou primeiro.
- **Consumes**: `ItemInfo.bait.effects[].kind/subcategory`, `ItemInfo.bait.seasoning` (via `ItemsFile`, que e `Record<string, ItemInfo>`), `SpeciesDetail.types/eggGroups/spawns[].context`, `SpawnFishing.minLureLevel/maxLureLevel/lureMultipliers` (via `lureRange`).
- **Done when**: com o `items.json` publicado (B2.3) e as fichas reais, um teste rapido em node (`npx tsx -e` importando `src/domain/bait.ts`) imprime: dex 6 -> `occa_berry(fire), coba_berry(flying), lum_berry(dragon/monster)`; 130 -> `passho, coba, aspear`; 95 -> `charti, shuca, persim`; 129 -> `passho, aspear, lum`; 120 -> `passho, pecha` (2); 132 -> `chilan` (1); 172 -> `wacan` (1); 194 -> `passho, shuca, aspear`; 349 -> `passho, aspear, lum`; `baitContexts` 6 -> snack so, 349 -> rod so, 129 -> ambos, 1011 -> null; boosters = 7 ids (`allthemodium:allthemodium_apple`, `allthemodium:allthemodium_carrot`, `cobblemon:starf_berry`, `minecraft:enchanted_golden_apple`, `minecraft:glistering_melon_slice`, `minecraft:golden_apple`, `minecraft:golden_carrot`); pior tempo de `recommendBerries` nas 1027 fichas < 5 ms e `buildBaitIndex` < 5 ms. Os testes definitivos sao T1.1.
- **Commit**: `feat(domain): regra das 3 melhores bagas, contextos de isca e reforcos`
- **Rollback**: `git revert`.

#### Feature F1.3: Bloco "Iscas" no painel "Onde encontrar" `[category: frontend]`
- **Traces**: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-10, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-18, RF-22, RF-48, RF-49, RF-50, RF-51, RF-52, RF-53, RNF-03, RNF-06, RNF-07, UISPEC secoes 5, 6, 7.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/BaitBlock.tsx` (criar; exporta `BaitBlock`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/WherePanel.tsx` (modificar: import; inserir `<BaitBlock detail={detail} items={items} lang={lang} />` entre a linha 331 (`SpawnList`) e a linha 332 (`Drops`), so quando `spawns.length > 0`; nova funcao exportada `eggGroupLabel(group, lang)` ao lado de `eggGroupText` linha 39)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/detail.css` (acrescentar regras `.bait*` depois da linha 192, bloco de drops)
- **Steps**:
  1. `eggGroupLabel(group: string, lang: UiLanguage): string` = `hasMessage("egg."+group) ? translate(lang, "egg."+group) : humanizado` (`translate`/`hasMessage` de `src/i18n/useT.ts:32`/`:20`), para o grupo seguir o toggle do card (RF-48). Tipo: `TYPE_NAMES[type][lang]` de `src/i18n/types.ts:4`.
  2. `BaitBlock` (`memo`): `const ctx = baitContexts(detail.spawns)`; `null` -> nao renderiza. `const index = items ? getBaitIndex(items) : null`; `const picks = useMemo(() => index ? recommendBerries(detail, index) : null, [detail, index])`.
  3. Marcacao (anatomia do UISPEC secao 6, com classes proprias):
     ```
     <div className="bait" data-bait style={{ "--i": 7 }}>
       <span className="k">{t("where.bait.title")}</span>
       {ctx.snack ? <div className="bait-row" data-bait-row="snack"><span className="bait-ico"><Cake/></span>
          <ItemLink id={SNACK_ITEM_ID} items lang className="bait-name it-link" size={24}/>
          <span className="bait-hint">{t("where.bait.snackHint")}</span></div> : null}
       {ctx.rod ? <div className="bait-row" data-bait-row="rod"><span className="bait-ico"><Fish/></span>
          <ItemLink id={POKE_BAIT_ITEM_ID} ... className="bait-name it-link" size={24}/>
          <span className="bait-or">{t("where.bait.rodOr")}</span>
          <span className="bait-hint">{t("where.bait.rodHint")}</span></div> : null}
       <div className="bait-line" data-bait-line="berries"><span className="bait-label">{t("where.bait.berries")}</span>
          {picks === null ? <Skeleton .../> : picks.length ? picks.map(p =>
            <span className="bait-berry" data-bait-berry={p.itemId}>
              <ItemLink id={p.itemId} items lang className="bait-berry-link it-link" size={18}/>
              <span className="bait-why">({labels})</span></span>) : <span className="bait-empty">{t("where.bait.noBerries")}</span>}</div>
       <div className="bait-line" data-bait-line="boosts"><span className="bait-label">{t("where.bait.boosts")}</span>
          {index?.boosters.map(b => <span className="bait-boost" data-bait-boost={b.itemId}>
             <ItemLink ... className="bait-boost-link it-link" size={18}/>
             {b.rarity ? <span className="bait-badge bait-badge-rarity">{t("where.bait.rarity")}</span> : null}
             {b.shiny ? <span className="bait-badge bait-badge-shiny">{t("where.bait.shiny")}</span> : null}</span>)}</div>
     </div>
     ```
     `labels` = `p.kind === "typing" ? p.labels.map(x => TYPE_NAMES[x as TypeId]?.[lang] ?? x) : p.labels.map(g => eggGroupLabel(g, lang))`, unidos por "/". Icones `Cake` e `Fish` de `lucide-react` (ja dependencia; `cake.js` e `fish.js` existem em `node_modules/lucide-react/dist/esm/icons/`). O bloco NAO usa o componente `Badge` (ele gera `.badge`): os selos "raridade"/"shiny" sao `<span className="bait-badge ...">` com CSS proprio copiado de `.badge` + `.badge-sm` (`src/styles/components.css:101`), para nenhum `.badge` novo aparecer sob `#where-panel` (UISPEC secao 6, classes a evitar). Isto substitui a sugestao "Badge badge-sm" da anatomia do UISPEC secao 6, mantendo a mesma aparencia.
  4. CSS (so variaveis): `.bait { display: grid; gap: 8px; }`; `.bait-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; padding: 10px 12px; border-radius: var(--radius-md); background: var(--surface-2); border: 1px solid var(--border); animation: cardIn .4s var(--ease-out) both; animation-delay: calc(min(var(--i, 0), 8) * 40ms); min-width: 0; }`; `.bait-ico` 36x36 radius 10 bg `--secondary-soft` com svg 18px (espelha `.ob-ico`); `.bait-name, .bait-berry-link, .bait-boost-link { display: inline-flex; align-items: center; gap: 6px; font: inherit; font-weight: 800; color: var(--text); text-align: left; min-width: 0; }` + `:hover span { text-decoration: underline; }`; `.bait-hint, .bait-or, .bait-why, .bait-label, .bait-empty { font-size: 12.5px; font-weight: 600; color: var(--muted); overflow-wrap: anywhere; }`; `.bait-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }`; `.bait-line { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; min-width: 0; }`; `.bait-berry, .bait-boost { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px 4px 4px; border-radius: 999px; background: var(--surface); border: 1.5px solid var(--border); font-size: 12px; transition: border-color .2s; }` + `:hover { border-color: var(--secondary); }`; `.app.mobile .bait-row { align-items: flex-start; }`; `.bait-badge { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 8px; font-size: 9.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; flex: none; }` (medidas de `.badge` + `.badge-sm`), `.bait-badge-rarity { background: var(--secondary-soft); color: var(--text); }`, `.bait-badge-shiny { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }` (so variaveis, sem hex).
  5. Nao alterar `SpawnList`, `Drops`, `ObtainPanel`, `RarityBadge` nem o texto de nada existente (RF-02).
- **Edge cases**: Pokemon so com pesca (Feebas 349) = so a linha rod; so terra (Charizard 6) = so snack; ambos (Magikarp 129, Gyarados 130); sem spawn (Dipplin 1011) = sem bloco; sem baga = `where.bait.noBerries`; `items` carregando = Skeleton; toggle PT/EN do card muda nomes de item, tipo e grupo; nenhum numero no bloco (RF-13); clique no item navega e Voltar retorna (RF-14, via `ItemLink`).
- **Consumes**: `ItemInfo.bait`, `ItemInfo.name/texture` (via `ItemLink`), `SpeciesDetail.types/eggGroups/spawns`; `getBaitIndex`, `recommendBerries`, `baitContexts`, `SNACK_ITEM_ID`, `POKE_BAIT_ITEM_ID` (F1.2).
- **Done when**: dev server + spec temporario (regra geral): capturas `after-detail-where-charizard-{pt,en,pt-mobile}.png`, `after-detail-where-magikarp-fishing-{pt,en,pt-mobile}.png`, `after-detail-where-staryu-lure-{pt,en,pt-mobile}.png`, `after-detail-where-wooper-fishing-{pt,en,pt-mobile}.png`, `after-detail-where-no-spawn-1011-{pt,en,pt-mobile}.png` em `ui-refs/`; comparadas com as "antes" do UISPEC secao 2: tudo o que existia igual e o bloco novo entre spawns e drops; no spec temporario: Charizard `[data-bait-berry]` = `occa_berry, coba_berry, lum_berry` na ordem e texto do bloco com "(Fogo)", "(Voador)", "(Dragão/Monstro)"; Magikarp 2 `[data-bait-row]`; 1011 `[data-bait]` count 0; o texto de `[data-bait]` nao casa `/x\d/`; e os asserts existentes de `tests/e2e/detail.spec.ts` bloco "F5.1" (linhas 413-490) rodados com `PW_DEV=1 PW_PORT=4177 npx playwright test tests/e2e/detail.spec.ts -g "F5.1"` verdes; `expectNoOverlap` em `#where-panel` a 360/390/1280 PT e EN (ja coberto pelo teste "where panel without overlap", que usa o Mewtwo; rodar tambem manualmente no spec temporario para o Gyarados).
- **Commit**: `feat(detail): bloco Iscas no painel Onde encontrar com as 3 melhores bagas e reforcos`
- **Rollback**: `git revert`.

#### Feature F1.4: Condicoes de pesca na linha do spawn `[category: frontend]`
- **Traces**: RF-19, RF-20, RF-21, RF-22, RF-23, RF-24, RF-48, RNF-03, UISPEC secao 6.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/BaitBlock.tsx` (acrescentar e exportar `FishingConds`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/WherePanel.tsx` (modificar: `SpawnEntryRow` linha 80 recebe `items: ItemsFile | null`; depois da linha 123 (`<div className="chips">{conds}</div>`) renderizar `{entry.fishing ? <FishingConds fishing={entry.fishing} items={items} lang={lang} /> : null}`; `SpawnList` linha 128 recebe e repassa `items`; chamada da linha 331 passa `items`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Detail/detail.css` (regras `.fish-*`)
- **Steps**:
  1. `FishingConds({ fishing, items, lang })`: `<div className="chips fish-conds" data-fishing>`; chips `<span className="fish-cond">`:
     - `bait`: `{t("where.fish.bait")} <ItemLink id={fishing.bait} items lang className="fish-item it-link" size={16}/>` (sem pagina = texto simples pelo proprio `ItemLink`, RF-19);
     - `rodType`: `{t("where.fish.rod")}` + `ItemLink` do `rodBall` (`className="fish-item it-link"`); `rodBall === null` -> texto `humanItemId(rodType)` (`ItemLink.tsx:10`);
     - Lure: `lureRange(minLureLevel, maxLureLevel)` != null -> `t("where.fish.lure", { range: t(r.key, r.vars) })`;
     - cada `lureMultipliers[i]`: `t("where.fish.lureMult", { range: t(lureRange(m.lureMin, m.lureMax).key, ...), m: m.multiplier })`.
  2. CSS: `.fish-conds { display: flex; flex-wrap: wrap; gap: 6px; }`; `.fish-cond { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: var(--secondary-soft); font-size: 12px; font-weight: 800; overflow-wrap: anywhere; min-width: 0; }` (mesma aparencia do `.cond`, classe propria); `.fish-item { display: inline-flex; align-items: center; gap: 4px; font: inherit; color: var(--text); }`.
  3. NENHUMA classe `.tag`, `.badge`, `.biome` ou `.cond` dentro do chip (RF-23; `detail.spec.ts` conta `.spawn-entry .badge/.tag/.biome`).
- **Edge cases**: `fishing` com so `lureMultipliers` (Staryu-4) mostra so o multiplicador; Staryu-10 mostra "Lure 1+" e "Lure 3+: x3"; Goomy "Lure 2 a 2"; Wooper-16 "Pokévara com boia: [Bola Amor]" + "Lure 2 a 2: x3" + "Lure 3+: x5"; Wooper-17 "Isca exigida: [Doce Amor]"; o bloco "Iscas" do Wooper continua com as bagas (RF-22).
- **Consumes**: `SpawnEntry.fishing` (todos os campos), `ItemInfo` de `cobblemon:love_sweet`, `cobblemon:love_ball`, `cobblemon:master_ball`; `lureRange` (F1.2).
- **Done when**: capturas `after-detail-where-wooper-fishing-expanded-{pt,en}.png` (apos "Mostrar todas") e `after-detail-where-staryu-lure-expanded-{pt,en,pt-mobile}.png` em `ui-refs/`; no spec temporario: `[data-spawn='cobblemon:wooper-true-17'] [data-fishing] [data-item='cobblemon:love_sweet']` visivel e clicavel (abre a pagina, Voltar volta); `[data-spawn='allthemons:staryu-10'] [data-fishing]` contem "Lure 3+: x3"; os asserts do Mewtwo (`entry.locator(".badge")` "Ultra-raro", `.tag` "Cobblemon Community Content") continuam verdes (`-g "F5.1"`).
- **Commit**: `feat(detail): isca exigida, vara e Lure na linha do spawn de pesca`
- **Rollback**: `git revert`.

### Sprint F2: Pagina do item (efeitos e receita da panela)

- **Descricao**: painel de efeitos de isca com os textos do jogo e ingredientes da Panela de Fogueira na rota Craftavel.
- **Deliverable**: paginas de Occa, Lum, maca dourada encantada, Poke-Lanche e Pokeisca conforme CA-18..22.
- **Risco**: baixo.
- **Prerequisito**: B2.3 verde e F1.1 (textos).

#### Feature F2.1: Painel "Efeitos de isca" na pagina do item `[category: frontend]`
- **Traces**: RF-25, RF-26, RF-55, RF-48, RNF-07, UISPEC secao 6 (pagina do item).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/BaitParts.tsx` (criar; exporta `BaitEffectsPanel`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/ItemScreen.tsx` (modificar: exportar `Row` da linha 141 para reuso; em `ItemBody` linha 393, depois da `section.item-obtain` (linhas 405-412) e antes de `UsedIn` (linha 413): `{item?.bait && item.bait.effects.length ? <BaitEffectsPanel bait={item.bait} lang={lang} /> : null}`; `UsedIn` mantem `--i: 2` e o painel novo usa tambem `--i: 2`; a animacao escalonada tolera empate)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item.css` (regras `.item-bait`)
- **Steps**:
  1. `BaitEffectsPanel({ bait, lang })`: `<section className="panel item-bait" data-bait-effects style={{ "--i": 2 }}><h3>{t("ip.bait")}</h3><div className="ob-list">` + um `Row` por efeito: `icon` `<Sparkles/>` (de `../../components/Icon`) para `shinyReroll`/`rarityBucket`, `<Fish/>` para o resto; `title = t("ip.bait.kind." + e.kind)`; filho `<span className="bait-effect-text">{e.text[lang] || e.text.en}</span>`; `kind = "bait-" + e.kind`. Depois, uma `Row` de tempero: `title = t("ip.bait.seasoning")`, texto `t(bait.seasoning ? "ip.bait.seasoningYes" : "ip.bait.seasoningNo")`, `kind = "bait-seasoning"`, icone `<CookingPot/>` (lucide `cooking-pot.js` existe).
  2. Nenhuma lista de Pokemon (RF-26).
  3. CSS: `.item-screen .item-bait .bait-effect-text b { color: var(--secondary); }` (reservado; o texto do jogo vem inteiro, sem `<b>`); nada de hex.
- **Edge cases**: item com `bait.effects` vazio (`poke_bait`) = sem painel; item sem `bait` = sem painel; baga com efeito e `seasoning: false` mostra os efeitos + "Só na vara" (RF-55); texto PT ausente cai para EN (ja no dado); toggle do card troca o idioma do texto (`useTermsLanguage("itempage")`).
- **Consumes**: `ItemInfo.bait.effects[].kind/text`, `ItemInfo.bait.seasoning`.
- **Done when**: capturas `after-item-occa_berry-{pt,en,pt-mobile}.png`, `after-item-lum_berry-{pt,en,pt-mobile}.png`, `after-item-enchanted_golden_apple-{pt,en}.png` em `ui-refs/` (comparar com `item-occa_berry-*`/`item-lum_berry-*` do UISPEC: hero e "Como obter" iguais, painel novo abaixo); no spec temporario: Occa `[data-bait-effects]` contem "Tipo Fogo" (PT) e "Fire Types" (EN); maca dourada encantada contem "+10" e "6×"; `.item-obtain .ob-row` do Occa com a mesma contagem de antes; `expectNoOverlap` na pagina a 360/390/1280.
- **Commit**: `feat(item): painel de efeitos de isca com os textos do jogo`
- **Rollback**: `git revert`.

#### Feature F2.2: Ingredientes da receita da Panela de Fogueira `[category: frontend]`
- **Traces**: RF-28, RF-29, RF-30, RF-31, RF-32, RF-36, RF-37, RF-47, RF-48, UISPEC secao 5 (pagina do item).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/item.ts` (acrescentar `"ip.station.campfirePot": { pt: "Panela de Fogueira", en: "Campfire Pot" }` junto das chaves `ip.pot.*` da F1.1)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-page.test.ts` (linha 26: esperado `["Brewing stand", "Campfire Pot"]`; mudanca por decisao, RF-31)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/BaitParts.tsx` (acrescentar e exportar `PotRecipeList`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item-page-model.ts` (linha 20: entrada `cooking_pot` de `RECIPE_LABELS` aponta para o dicionario; novo import no topo, linhas 2-3; acrescentar `INGREDIENT_TAG_KEYS` e `ingredientTagLabel(tag, t)` depois de `recipeLabels` linha 118)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/ItemScreen.tsx` (modificar: `ObtainRow` linha 155 recebe `items: Record<string, ItemInfo>`; `case "craftable"` linhas 158-165 renderiza, depois do `badge`, `{route.potRecipes?.length ? <PotRecipeList recipes={route.potRecipes} items={items} lang={lang} /> : null}`; `ItemBody` linha 409 passa `items`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item.css` (regras `.pot-*`)
- **Steps**:
  1. `item-page-model.ts`: `export const INGREDIENT_TAG_KEYS: Readonly<Record<string, string>> = { "c:drinks/milk": "ip.ingredientTag.milk", "c:mushrooms": "ip.ingredientTag.mushrooms" };` e `export function ingredientTagLabel(tag: string, t: TranslateFn): string` (mapa; senao `t("ip.ingredientTag.any", { name: humanizeId(ultimo segmento) })`; nunca o id cru, RF-30).
  2. `PotRecipeList({ recipes, items, lang })`: para cada receita `<div className="pot-recipe" data-pot-recipe={r.recipeId}><span className="pot-label">{t("ip.pot.ingredients")}</span>` + por ingrediente `<span className="pot-ing" data-ingredient={ing.id}><b>{t("ip.pot.count", { n: ing.count })}</b>` + (`kind === "item"` e `items[ing.id]` existe -> `<ItemLink id items lang className="pot-item it-link" size={18}/>` (RF-29); `kind === "item"` sem pagina -> `<span className="pot-text">{ing.name ? (ing.name[lang] || ing.name.en) : humanItemId(ing.id)}</span>` (RF-29, texto simples); `kind === "tag"` -> `<span className="pot-text pot-tag">{ingredientTagLabel(ing.id, t)}</span>`) + `</span>`; se `r.seasoningTag === "cobblemon:recipe_filters/bait_seasoning"`: `<span className="pot-seasoning">{t("ip.pot.seasoning")}</span>` (RF-32).
  3. CSS escopado: `.item-screen .pot-recipe { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin-top: 6px; min-width: 0; }`, `.item-screen .pot-ing { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px 3px 6px; border-radius: 999px; background: var(--surface); border: 1.5px solid var(--border); font-size: 12px; font-weight: 800; }`, `.item-screen .pot-ing b { color: var(--secondary); }`, `.item-screen .pot-seasoning, .item-screen .pot-label { font-size: 12.5px; font-weight: 600; color: var(--muted); overflow-wrap: anywhere; }`.
  4. Rotulo da estacao (RF-31/RF-47): chave `ip.station.campfirePot` em `item.ts`; em `item-page-model.ts` importar `ITEM_MESSAGES` de `../../i18n/messages/item` e trocar a linha 20 por `[/cooking_pot/, ITEM_MESSAGES["ip.station.campfirePot"]]`; nenhuma outra entrada de `RECIPE_LABELS` muda. Atualizar `item-page.test.ts:26` para `["Brewing stand", "Campfire Pot"]` e acrescentar no mesmo teste `recipeLabels(["cobblemon:cooking_pot"], "pt")` = `["Panela de Fogueira"]`.
- **Edge cases**: rota craftable sem `potRecipes` (todos os outros itens) renderiza exatamente como hoje (`item.spec.ts:122` "Sim, tem receita"); ingrediente com nome nulo = id humanizado; Poke-Lanche sem nota de "efeito pendente" (dado `cooking: null`, RF-36); Pokeisca na aba Iscas (tag, RF-37).
- **Consumes**: `ItemObtainRoute.craftable.potRecipes[].{recipeId, seasoningTag, ingredients[].{kind,id,count,name}}`, `ItemInfo.category/cooking` do `poke_snack`.
- **Done when**: capturas `after-item-poke_snack-{pt,en,pt-mobile}.png`, `after-item-poke_bait-{pt,en,pt-mobile}.png`, `after-items-list-bait-{pt,en,pt-mobile}.png` (lista Itens, aba "Iscas" `[data-icat="bait"]`, comparar com `items-list-iscas-*` do UISPEC) em `ui-refs/`; no spec temporario: Poke-Lanche `[data-pot-recipe]` com 4 `.pot-ing` na ordem leite(3x, "Qualquer leite"), `[data-item='minecraft:honey_bottle']` (2x), `[data-item='cobblemon:vivichoke']` (1x), `[data-item='cobblemon:hearty_grains']` (3x) + nota dos 3 temperos; hero com chip "Iscas" e sem `.item-cooking-note`; Pokeisca com chip "Iscas" (era "Outros", decisao de categoria); na lista, os cards dos 7 itens novos e do `poke_bait` com chip "Iscas" e os das bagas com chip de bagas; Pokeisca: `[data-ingredient='minecraft:wheat'] button` count 0 e texto "Trigo"; "Qualquer cogumelo"; "Panela de Fogueira" no badge; aba Iscas lista os 8 ids novos (`[data-item]` de cada um visivel).
- **Commit**: `feat(item): ingredientes da receita e estacao Panela de Fogueira, com a nota dos temperos`
- **Rollback**: `git revert`.

---

### Sprint T1: Testes (definidos aqui, escritos na etapa de testes)

- **Descricao**: testes unitarios, de pipeline, de contrato, RTL e e2e da feature, mais a regressao completa, a auditoria e a prova byte a byte.
- **Deliverable**: suite verde com cobertura nos limites; e2e headless verde; audit 0; byte a byte provado.
- **Risco**: medio.
- **Prerequisito**: B1, B2, F1, F2 completos.
- **Regras**: Vitest em `tests/unit/**` (nomes de `it` em ingles); Playwright SEMPRE headless, sem `slowMo`, sem `waitForTimeout`/sleep (auto-wait, `expect.poll`, `settle`); nenhum teste existente removido ou afrouxado (unica mudanca por decisao: `item-page.test.ts:26`, ja feita em F2.2).

#### Feature T1.1: Unitarios da regra das 3 melhores `[category: teste]`
- **Traces**: RF-03..18, RF-49..53, RF-55, RF-21/24 (formato), RNF-05, RNF-06.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/domain/bait.test.ts` (criar)
- **Steps**: (1) com `items.json` e `species/<dex>.json` REAIS (leitura de `public/data/current.json` como em `item-page.test.ts:9-11`): Charizard (6) = `["cobblemon:occa_berry","cobblemon:coba_berry","cobblemon:lum_berry"]` com `labels` `["fire"]`, `["flying"]`, `["dragon","monster"]`; Gyarados (130) = passho, coba, aspear (lum cortada); Onix (95) = charti, shuca, persim (`labels ["mineral","amorphous"]`); Magikarp (129) = passho, aspear, lum; Staryu (120) = passho, pecha (2); Feebas (349) = passho, aspear, lum; Ditto (132) = chilan; Pichu (172) = wacan; Wooper (194) = passho, shuca, aspear; (2) `baitContexts`: 6 `{snack:true,rod:false}`, 349 `{snack:false,rod:true}`, 129 `{true,true}`, 1011 `null`; (3) fixtures sinteticas: baga com efeito e `seasoning:false` nunca aparece (RF-55); baga de natureza/EV nao aparece (RF-17); `max` respeitado; dedupe na primeira posicao; ordem por id em empate de tipo; (4) `baitBoosters` = os 7 ids da F1.2 com `rarity`/`shiny` corretos (golden_apple ambos; starf so shiny; glistering so rarity); nenhum id fora da tag, nem `allthemons:mythical_pecha_berry`; (5) `lureRange` 4 casos; (6) desempenho: `performance.now()` em `recommendBerries` para as 1027 fichas, maximo < 5 ms; `buildBaitIndex` < 5 ms; `getBaitIndex` devolve o mesmo objeto para o mesmo `items` (WeakMap).
- **Done when**: `npx vitest run tests/unit/domain/bait.test.ts` verde; cobertura de `src/domain/bait.ts` >= 95/95.
- **Commit**: `test(domain): regra das 3 melhores bagas com os exemplos do PRD`
- **Rollback**: revert.

#### Feature T1.2: Pipeline (pesca, efeitos, kubejs, tempero, receitas, catalogo, midia) `[category: teste]`
- **Traces**: RF-27, RF-33..46, RF-54, RNF-05, RNF-08.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/spawn-bait.test.ts` (criar); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/recipes.test.ts` (acrescentar casos, sem mudar os existentes); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/audit.test.ts` (acrescentar casos)
- **Steps**: (1) `fishing.ts`: `isLureOnlyCondition` (so min, so max, ambos, misto -> false, vazio -> false); `fishingOf` com os 4 exemplos da secao 5.3 (Staryu-10, Staryu-4, Wooper-16, Wooper-17) e `null` para Staryu-2; `extraOf` remove so o que foi tipado; `collectPokeRods` no snapshot: `cobblemon:love_rod -> cobblemon:love_ball`; (2) `bait.ts`: `renderBaitTooltip` para typing (Occa PT/EN), eggGroup (Lum EN "100% - 10× Chance for Dragon Egg Group"), biteTime 0.125 -> "12%", shinyReroll 4 -> "5×", nature `cobblemon:atk` -> "Attack", genderChance `cobblemon:male` -> "Male", chance 0.05 -> "5%", template ausente; `normalizeBaitEffects` (namespace removido, tipo desconhecido pulado com aviso, duplicata); `collectBaitEffects` no snapshot: 81 ids, `minecraft:enchanted_golden_apple` com os valores do kubejs (0.1, 10, 5.0), `allthemodium:allthemodium_apple` presente, `allthemons:mythical_pecha_berry` ausente; `buildSeasoningSet`: contem as 72 bagas com efeito, os 7 vanilla da tag e os 2 allthemodium; `loadSeasoningExtra` rejeita id invalido; (3) `pot-recipes.ts`: shaped do Poke-Lanche (ordem e contagens 3/2/1/3) e shapeless da Pokeisca; ingrediente em lista de alternativas -> `null`; (4) `gatherRecipes` + `reportRecipes`: o report `recipes` com e sem separacao e igual (deepEqual) para o mesmo `catalogIds`; `potRecipes` com exatamente `cobblemon:poke_snack` e `cobblemon:poke_bait`; (5) `buildCatalog` com `baitItemIds`: os 8 ids entram `referenceOnly`; (6) `publishModItemTextures` no snapshot publica os 2 PNGs (flag `skipMedia` falso, `outDir` temporario dentro de `tools/dataset/out/`); (7) auditoria: `buildExpected()` tem `baitItems.size === 81`, `seasoning` de `allthemodium:allthemodium_carrot` true (via regex do script), `potRecipes` com 2, e `ExpSpawn.fishing` do Staryu-10 igual ao exemplo.
- **Done when**: `npx vitest run tests/unit/dataset` verde; cobertura `tools/dataset/src/**` >= 80/80.
- **Commit**: `test(dataset): pesca tipada, efeitos de isca, temperos, receitas da panela e texturas`
- **Rollback**: revert.

#### Feature T1.3: Contrato publicado e paridade com o dataset real `[category: teste]`
- **Traces**: RF-41, RF-42, RF-43, RF-33, RF-34, RNF-01, RNF-02, RNF-05.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/data/published-schemas.test.ts` (acrescentar `it`s sem mudar os existentes); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/join.test.ts` (acrescentar perto da linha 237)
- **Steps**: (1) `published-schemas`: o `it.each` existente ja cobre items/species com `toEqual` (nenhum campo descartado); acrescentar: `items["cobblemon:poke_snack"]` passa no schema com `potRecipes`; um item com `potRecipes` extra-campo e rejeitado (schema estrito); `fishing` com campo extra rejeitado; (2) `join.test`: `items.json` tem 951 itens; os 8 ids com `texture` e tag `bait`; `poke_snack.category === "bait"` e `cooking === null`; `poke_bait.category === "bait"`; os 7 itens novos de isca com `category === "bait"`; exatamente 9 itens com categoria `bait`; `cobblemon:occa_berry.category === "berry"` e `minecraft:apple.category === "other"` (inalterados, com tag `bait`); `enchanted_golden_apple.bait.effects` = biteTime 0.1, rarityBucket 10, shinyReroll 5; `occa_berry.bait.effects[0].subcategory === "fire"`; nenhuma `subcategory` com ":"; `mythical_pecha_berry` ausente; exatamente 2 itens com `potRecipes`; `species/120.json` Staryu-10 `fishing` igual ao exemplo; nenhum `extra.condition.minLureLevel` em nenhum spawn; `datasetVersion` != `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba`; bytes: `items.json` <= 1.659.908 e soma de species <= 5.693.585 (RNF-01); texturas distintas <= 931 < 1200 (RNF-02).
- **Done when**: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
- **Commit**: `test(data): contrato e dataset publicado do spawn-bait`
- **Rollback**: revert.

#### Feature T1.4: RTL do bloco, dos chips de pesca e da pagina do item `[category: teste]`
- **Traces**: RF-01..06, RF-12..16, RF-19..26, RF-28..32, RF-36, RF-47, RF-48, RF-55, RNF-03, RNF-05.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/detail-bait.test.tsx` (criar); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-bait.test.tsx` (criar)
- **Steps**: seguir o padrao de `tests/unit/ui-screens/detail-screen.test.tsx` e `item-screen.test.tsx` (mock de `loadItems`/`loadBiomes`, store de preferencias). (1) `BaitBlock`: com fixture pequena (Occa, Coba, Lum com `seasoning:true`; uma baga com efeito e `seasoning:false`; golden_apple booster): ordem `[data-bait-berry]`, texto "(Fogo)" e "(Dragão/Monstro)" em PT e "(Fire)"/"(Dragon/Monster)" com o card em EN; linhas snack/rod por contexto; sem spawn = nada; `items === null` = `.skeleton`; sem numero `x\d` no texto; nenhum `.tag`, `.badge`, `.drop`, `.ob-none`, `[data-obtain]` dentro de `[data-bait]`; clique em `[data-bait-berry] button` chama `navigate("item", { itemId })`; (2) `FishingConds`: 4 casos da secao 5.3, `.spawn-entry .badge/.tag/.biome/.cond` com a mesma contagem que sem `fishing`; (3) `BaitEffectsPanel`: textos PT/EN pelo toggle `itempage`, linha de tempero sim/nao, sem painel com `effects: []`; (4) `PotRecipeList`: 4 ingredientes na ordem, tag com rotulo humano, item sem pagina como texto (sem `button`), nota dos temperos; craftable sem `potRecipes` inalterado ("Sim, tem receita"); (5) estacao: craftable do Poke-Lanche mostra "Panela de Fogueira" em PT e "Campfire Pot" com a interface em EN, vindo de `ip.station.campfirePot`.
- **Done when**: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70 e `src/components/**` >= 70/70.
- **Commit**: `test(ui): bloco de iscas, chips de pesca e pagina do item`
- **Rollback**: revert.

#### Feature T1.5: e2e headless (ficha, pagina do item, lista) sem quebrar contagens existentes `[category: teste]`
- **Traces**: RF-01, RF-02, RF-05, RF-06, RF-13, RF-14, RF-19..24, RF-25, RF-28..37, RF-49..51, RNF-03, RNF-07.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/detail.spec.ts` (novo `test.describe("spawn-bait: Iscas e pesca", ...)` DEPOIS do bloco "F5.1" que termina na linha 492; sem tocar nos testes existentes); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/item.spec.ts` (novo describe, reusando `openItem` linha 45); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/items.spec.ts` (aba Iscas)
- **Steps**: (1) ficha: Charizard (CA-01) bloco entre `.spawn-list` e `.drops` (`compareDocumentPosition`), linha snack so, bagas na ordem com rotulos; Gyarados (CA-02) 2 linhas + 3 bagas; Onix (CA-03); Magikarp (CA-04) e contagens de `.spawn-entry` 6/46 inalteradas; Feebas (CA-09) so rod; Dipplin 1011 sem `[data-bait]` (CA-08); nenhum texto `x\d` no bloco (CA-05); clicar Occa abre o item e `page.goBack()` volta a ficha do mesmo dex (CA-06); linha de reforcos com 7 itens e "raridade"/"shiny" (CA-07); Wooper (CA-14/15) isca exigida clicavel + boia; Staryu (CA-16/17) "Lure 1+" e "Lure 3+: x3" e contagens de `.spawn-entry .tag/.biome/.badge` iguais as do mesmo Pokemon sem os chips (contar antes/depois por seletor escopado ao `[data-spawn]` sem `[data-fishing]`); `expectNoOverlap` do `#where-panel` do Gyarados a 360/390/1280 em PT e EN e nos temas `classic` e `black` (CA-33); (2) item: Occa (CA-18), maca dourada encantada (CA-19), Poke-Lanche (CA-20), Pokeisca (CA-21), "Panela de Fogueira"/"Campfire Pot" em `cobblemon:love_sweet` (CA-22); (3) lista: aba Iscas com os 8 ids e `poke_bait`/`poke_snack` (CA-23), todos com `img` (CA-24).
- **Done when**: `npx playwright test tests/e2e/detail.spec.ts tests/e2e/item.spec.ts tests/e2e/items.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
- **Commit**: `test(e2e): iscas na ficha, pesca na linha do spawn e pagina do item`
- **Rollback**: revert.

#### Feature T1.6: Regressao completa, qualidade, PWA, auditoria e byte a byte `[category: teste]`
- **Traces**: RF-43, RF-44, RF-45, RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-08, RNF-09, RNF-10.
- **Files**: nenhum arquivo de codigo; resultados anotados em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/spawn-bait/STATE_spawn-bait.md`
- **Steps**: (1) `npm run typecheck`, `npm run lint` limpos; (2) `npx vitest run --coverage` verde com >= 79 arquivos / >= 618 testes (baseline) mais os novos e limites de cobertura do `vitest.config.ts` (global 80/80, `tools/dataset/src/**` 80/80, `src/screens/**` 70/70, `src/components/**` 70/70, `src/domain/**` 95/95); (3) `npx playwright test` inteiro (headless, build + preview) com >= 230 testes verdes; (4) `npm run build` e conferir no `dist/sw.js` gerado que nenhuma URL `assets/items/` esta no precache (`grep -c "assets/items/" dist/sw.js` = 0 dentro da lista do precache) e que o `runtimeCaching` `items` continua com `maxEntries: 1200` (CA-32); (5) `npx tsx tools/dataset/audit/run.ts` = 0 divergencias (CA-26); (6) byte a byte: repetir os dois comandos de B2.1 e `cmp` de `items.json` e dos 1027 `species/*.json` (CA-25); (7) determinismo: segunda execucao no snapshot = mesma `datasetVersion` (RNF-08); (8) `git grep -n "USERPROFILE\|Usuario" -- data-source tools src` so com caminhos ja existentes e sem valor de segredo (RNF-09); (9) confirmar que nenhum `fetch` novo existe em `src/domain/bait.ts` e `src/screens/Detail/BaitBlock.tsx` (RNF-10).
- **Done when**: todos os 9 passos verdes e os numeros (testes, cobertura, checks da auditoria, sha256 dos `items.json`) anotados no STATE.
- **Commit**: `test: regressao completa do spawn-bait (vitest, e2e, auditoria, byte a byte)` (so se houver arquivo alterado; senao sem commit)
- **Rollback**: n/a.

---

## 8. Matriz de cobertura do PRD

| Req | Features |
|---|---|
| RF-01 | F1.3, T1.4, T1.5 |
| RF-02 | F1.3, T1.5 |
| RF-03 | F1.2, F1.3, T1.1 |
| RF-04 | F1.2, F1.3, T1.1 |
| RF-05 | F1.2, F1.3, T1.5 |
| RF-06 | F1.2, F1.3, T1.1, T1.5 |
| RF-07 | F1.2, T1.1 |
| RF-08 | B1.3, F1.2, T1.1, T1.2 |
| RF-09 | B1.3, F1.2, B2.2, T1.3 |
| RF-10 | F1.2, F1.3, T1.1 |
| RF-11 | F1.2, T1.1 |
| RF-12 | F1.2, F1.3, T1.4 |
| RF-13 | F1.1, F1.3, T1.4, T1.5 |
| RF-14 | F1.3, T1.5 |
| RF-15 | F1.2, F1.3, T1.1 |
| RF-16 | F1.2, F1.3, T1.1 |
| RF-17 | F1.2, T1.1 |
| RF-18 | F1.2, F1.3, T1.4 |
| RF-19 | B1.2, F1.4, T1.5 |
| RF-20 | B1.2, F1.4, T1.5 |
| RF-21 | B1.2, F1.2, F1.4, T1.5 |
| RF-22 | F1.4, T1.5 |
| RF-23 | F1.4, T1.4, T1.5 |
| RF-24 | B1.2, F1.2, F1.4, T1.5 |
| RF-25 | B1.3, F2.1, T1.5 |
| RF-26 | F2.1, T1.4 |
| RF-27 | B1.3, T1.2, T1.3 |
| RF-28 | B1.4, F2.2, T1.5 |
| RF-29 | B1.4, F2.2, T1.4 |
| RF-30 | B1.4, F2.2, T1.4 |
| RF-31 | F2.2, T1.4, T1.5 |
| RF-32 | F2.2, T1.4 |
| RF-33 | B1.4, B1.5, T1.3, T1.5 |
| RF-34 | B1.5, B2.1, T1.3 |
| RF-35 | B1.4, B2.1, T1.5 |
| RF-36 | B1.4, F2.2, T1.3 |
| RF-37 | B1.4, F2.2, T1.5 |
| RF-38 | B1.3, B2.2, T1.2 |
| RF-39 | B1.3, B2.2, T1.2, T1.5 |
| RF-40 | B1.3, B2.2, T1.2 |
| RF-41 | B1.1, B1.2, B2.2, T1.3 |
| RF-42 | B1.4, T1.3 |
| RF-43 | B2.3, T1.3, T1.6 |
| RF-44 | B2.1, B2.3, T1.6 |
| RF-45 | B2.2, T1.6 |
| RF-46 | B1.2, B2.2, T1.2 |
| RF-47 | F1.1, F2.2, T1.6 |
| RF-48 | F1.3, F1.4, F2.1, F2.2, T1.4 |
| RF-49 | F1.2, F1.3, T1.1, T1.5 |
| RF-50 | F1.2, F1.3, T1.1 |
| RF-51 | F1.2, F1.3, T1.5 |
| RF-52 | F1.2, T1.1 |
| RF-53 | F1.2, T1.1 |
| RF-54 | B1.4, T1.2 |
| RF-55 | B1.3, F1.2, F2.1, T1.1, T1.4 |
| RNF-01 | B1.2, B1.3, B2.3, T1.3 |
| RNF-02 | B1.5, B2.3, T1.3, T1.6 |
| RNF-03 | F1.3, F1.4, T1.5, T1.6 |
| RNF-04 | B1.1, F1.1, T1.6 |
| RNF-05 | B1.1, T1.1, T1.2, T1.4, T1.6 |
| RNF-06 | F1.2, T1.1, T1.6 |
| RNF-07 | F1.3, F2.1, T1.5 |
| RNF-08 | B1.2, B1.3, B2.1, B2.3, T1.6 |
| RNF-09 | B2.1, T1.6 |
| RNF-10 | F1.2, T1.6 |
| RNF-11 | F1.1 |

Total: 55 RF + 11 RNF = 66 requisitos; 66 cobertos; 0 orfaos. CA-01..34 exercitados em T1.1, T1.3, T1.5 e T1.6 (CA-29 = RNF-01 em T1.3; CA-32 em T1.6; CA-34 em T1.1).

## 9. Assuncoes e perguntas em aberto

Assuncoes (modo autonomo, revisaveis):
1. **Texto do Lure com "+"**: o PRD da "Lure 2" e "Lure 3: x3" como exemplos (RNF-11 deixa a redacao para a SPEC); a SPEC usa "Lure 1+" (minimo), "Lure 2 a 2" (min e max) e "Lure 3+: x3" (Staryu), porque a condicao do jogo e "nivel minimo" (e o Apotheosis do pack permite Lure acima de III).
2. **"6×" na maca dourada encantada**: a pagina mostra o tooltip do jogo, que soma 1 ao `shiny_reroll` (bytecode conferido); o PRD rev 5 alinhou o CA-19 a isso (texto da UI "6×", `value` publicado 5). O teste confere "6×" no texto e 5 no `value`.
3. **Nomes vindos do dataset**: "Poké-Lanche" (kubejs `block.cobblemon.poke_snack`, e nao "Poke-lanche" do jar), "Grãos Saudáveis" e "Brotovital" (nomes PT do jogo para Hearty Grains e Vivichoke, onde o PRD escreveu "Graos Robustos" e "Vivichoke"). Vale o texto do jogo (RF-35/RF-54).
4. **Rotulo da estacao no dicionario central (decidido pelo orquestrador)**: "Panela de Fogueira"/"Campfire Pot" fica na chave `ip.station.campfirePot` de `src/i18n/messages/item.ts` (RF-47); `RECIPE_LABELS` so aponta para ela (secao 2.4 item 14).
5. **Rotulos de ingrediente por tag**: "Qualquer leite"/"Any milk" e "Qualquer cogumelo"/"Any mushroom" (o jogo nao tem chave de lang para `c:drinks/milk`/`c:mushrooms` no snapshot).
6. **Vara pela boia**: a linha do spawn mostra "Pokévara com boia: [Bola Amor]" (via `rodBall`), ja que o jogo nao da nome a `cobblemon:love_rod`.
7. **Categoria `bait` (decidido pelo orquestrador)**: `poke_snack`, `poke_bait` e os 7 itens novos de isca ficam com categoria `bait` (chip "Iscas"); as bagas do Cobblemon e `apple`/`sweet_berries` mantem a categoria propria e entram na aba Iscas pela tag (RF-36/37). O chip do `poke_bait` muda de "Outros" para "Iscas" por decisao.
8. **Reforcos ordenados por id** (a lista do PRD e ilustrativa; a regra governa).
9. **Textura da maca dourada encantada sem brilho**: o jogo desenha o brilho em tempo real; o PNG publicado e o do modelo (`golden_apple`).
10. **Paridade do snapshot (B2.1)**: o volume exato de arquivos a copiar so e conhecido rodando o laco diferencial; se nao convergir em 5 rodadas a feature para e registra no STATE, sem publicar.

Perguntas em aberto: nenhuma que bloqueie a implementacao.

Dry-run de implementabilidade (feito): cada feature foi percorrida como um agente sem contexto. Conferido: (a) todo arquivo a modificar existe e as linhas citadas batem com o HEAD `ff3a26b0` (stage.ts 26/31/78/90/92/107/108/124/126/130/136/167/186-198/192/197; catalog.ts 11/97/106/108/114-121/140; recipes.ts 145/182/216/655/695/705/738/797/814/818; spawns.ts 38/82/115/119/306; types.ts 232/234/252/358/362/431/446; schemas.ts 135/149/241/243/257/303; WherePanel.tsx 39/80/123/128/146/306/331/332; ItemScreen.tsx 141/155/158/162/393/405/409/413; item-page-model.ts 2-3/11-21/20/113/118; components.css 101; join.test.ts 91/140; detail.ts 107; item.ts 56; expected.ts 79/119/199/434/627; compare.ts 181/223/314); (b) toda fonte de copia do snapshot foi listada com `unzip -l` no jar real; (c) os exemplos de dados da secao 5.3 foram lidos do dataset atual e do snapshot; (d) a regra do tooltip foi conferida no bytecode do jar Cobblemon 1.7.3; (e) a ordem das features respeita dependencias (B1.1 antes de tudo; janela quebrada B1.1 -> B2.3 declarada, com `published-schemas.test.ts` e `join.test.ts` excluidos ate B2.3; Frontend so depois de B2.3 verde); (f) nenhum passo exige adivinhar nome, caminho ou valor.

Revisao 2026-09-29 (reviewer: 3 WARNING, 5 NIT) aplicada: regra de categoria `bait` (9 itens), janela B1.1 -> B2.3 e prerequisito do Frontend, rotulo da estacao no dicionario i18n, selos do bloco com `.bait-badge` (sem `.badge`), `ItemInfo.bait` no Consumes da F1.2, capturas `after-items-list-bait-*`, fingerprints de PRD (rev 5), IDEA e UISPEC atualizados. Dry-run refeito sobre as features alteradas (B1.1, B1.4, F1.1, F1.2, F1.3, F2.2, T1.3, T1.4) e a matriz (66/66).

Self-check: PASS
