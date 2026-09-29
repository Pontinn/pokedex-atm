# CHECKLIST MANUAL - spawn-bait

Legenda: `[ ]` pendente · `[x]` feito · `[A]` coberto por teste automatizado · `[!]` bug

## Backend

Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` (commit `ff9ebce9`). Anterior: `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba` (removido).

### Regressao das areas tocadas

- [x] Dataset regenerado a partir do snapshot (`npm run dataset -- --offline`); `public/data/current.json` aponta para `...-2ef2f512` e a pasta existe.
- [A] Segunda execucao no mesmo snapshot gera a mesma `datasetVersion`, o mesmo `items.json` e os mesmos 1027 `species/*.json` (feito em B2.3 com `--publish-dir tools/dataset/out/_sb_again`).
- [A] `items.json` e `species/*.json` passam nos schemas zod estritos do app (`published-schemas.test.ts`), sem campo descartado.
- [A] `items.json`: 951 itens; os 8 ids novos com textura e tag `bait`; 9 itens com categoria `bait` (os 8 + `cobblemon:poke_bait`); bagas continuam `berry`, `minecraft:apple`/`sweet_berries` continuam `other` com tag `bait`; `allthemons:mythical_pecha_berry` ausente.
- [A] `ItemInfo.bait`: efeitos com `kind` camelCase, `subcategory` sem namespace, texto do tooltip do jogo PT/EN; `minecraft:enchanted_golden_apple` com os valores do kubejs (biteTime 0.1, rarityBucket 10, shinyReroll 5, texto "6×"); `cobblemon:poke_bait.bait = { effects: [], seasoning: false }`; item sem arquivo de efeito = `bait: null`.
- [A] `craftable.potRecipes` so em `cobblemon:poke_snack` (leite 3, mel 2, Brotovital 1, Grãos Saudáveis 3) e `cobblemon:poke_bait` (mel 1, `c:mushrooms` 1, Trigo 1).
- [A] `SpawnEntry.fishing` presente em todo spawn (null sem condicao de pesca); Staryu-10, Wooper-16/17, Goomy-13 e Whiscash iguais a SPEC 5.3; nenhum `minLureLevel`/`maxLureLevel`/`rodType`/`bait` sobrando em `extra.condition`.
- [A] Auditoria independente (`npx tsx tools/dataset/audit/run.ts`): 46558 checks, 0 divergencias (Rodada 5 no `AUDIT_REPORT.md`).
- [x] Byte a byte instancia real x snapshot: `items.json` e os 1027 `species/*.json` iguais; sha256 do `items.json` (publicado = snapshot = instancia) `6bca7e9d942632f828cd825f5139997c070a5732d0d4510efe768bb578118a95`. Refazer: os 2 comandos de B2.1 da SPEC + `cmp`. A `datasetVersion` dos dois difere por desenho (o manifest guarda tamanho/mtime das fontes e contagem de gritos).
- [A] Texturas publicadas: `public/assets/items/minecraft/{golden_apple,enchanted_golden_apple,golden_carrot,glistering_melon_slice,glow_berries}.png` e `public/assets/items/allthemodium/allthemodium_{apple,carrot}.png`; `?v=<sha8>` confere com os bytes.
- [x] 7 PNGs novos conferidos visualmente (maca dourada, maca dourada encantada sem brilho, cenoura dourada, fatia de melancia reluzente, bagas brilhantes, maca e cenoura de allthemodium).
- [A] Metas RNF-01/02: `items.json` 1.499.586 bytes (<= 1.659.908); species 5.246.713 bytes (<= 5.693.585); 931 texturas distintas (<= 931, < 1200).
- [x] Snapshot: 13 arquivos de textura (B1.5) + 41 fontes (B2.1) copiados com bytes identicos e registrados em `data-source/atm-1.3.0/MANIFEST.json` (`additions`) e `data-source/README.md`.
- [x] `git grep -n "USERPROFILE\|Usuario" -- data-source tools src` sem resultado (RNF-09).

### Testes automatizados do backend

| Arquivo | O que cobre |
|---|---|
| `tests/unit/dataset/spawn-bait.test.ts` | `fishing.ts` (so-Lure, `fishingOf` com os exemplos da SPEC 5.3, `collectPokeRods`, `extra` sem o que foi tipado); `bait.ts` (tooltip do jogo: typing, eggGroup, biteTime, shinyReroll, nature, genderChance, haChance, template ausente, PT caindo para EN; `normalizeBaitEffects`; `collectBaitEffects` com kubejs vencendo; `buildSeasoningSet`; `loadSeasoningExtra`); `pot-recipes.ts` (shaped, shapeless, formatos desconhecidos); `buildCatalog` com `baitItemIds`; `publishModItemTextures` |
| `tests/unit/dataset/recipes.test.ts` | `gatherRecipes` + `reportRecipes` = mesmo report de `collectRecipes`; `potRecipes` so Poke-Lanche e Pokeisca |
| `tests/unit/dataset/audit.test.ts` | esperado da auditoria: 80 itens de isca, tempero do allthemodium pelo script do kubejs, 2 receitas da panela, pesca do Staryu-10 e Wooper-16 |
| `tests/unit/dataset/join.test.ts` | pipeline completo no snapshot: 951 itens, 9 com categoria `bait`, efeitos, `potRecipes`, `fishing`, bytes e texturas (RNF-01/02), versao nova |
| `tests/unit/data/published-schemas.test.ts` | dataset publicado passa nos schemas estritos; campo extra em `potRecipes`/`fishing` rejeitado |

Como rodar:

- `npx vitest run tests/unit/dataset tests/unit/data` (backend inteiro)
- `npx vitest run --coverage` (limites do `vitest.config.ts`; `tools/dataset/src/**` ficou em 93,77% linhas / 84,56% branches)
- `npx tsx tools/dataset/audit/run.ts` (auditoria no dataset publicado; reescreve `AUDIT_REPORT.md`, restaurar com `git checkout` e manter so a nota da rodada)

## Frontend

Commits: F1.1 `240462f8`, F1.2 `b7149fc0`, F1.3 `69b9e398`, F1.4 `08349772`, F2.1 `ac94533e`, F2.2 `930663e6`, T1.1 `b876e065`, T1.4 `95960154`, T1.5 `45e1f377`, T1.6 `1be8ac8b`. Capturas "depois" em `ui-refs/after-*.png` (comparar com as "antes" de mesmo alvo). Como abrir: `npm run dev`, busca da Home pelo numero da dex (ficha) ou Itens & Comidas + busca (pagina do item).

### Ficha do Pokemon: bloco "Iscas" em "Onde encontrar"

- [A] Charizard (6, so terra): bloco entre as entradas de spawn e os Drops; so a linha Poké-Lanche ("no chão: atrai quem nasce em terra ou na água"); melhores bagas Baga Occa (Fogo), Baga Coba (Voador), Baga Lum (Dragão/Monstro). `detail.spec.ts` "spawn-bait: Iscas e pesca > Charizard (CA-01/05/06/07)"; `detail-bait.test.tsx`.
- [A] Gyarados (130) Passho/Coba/Aspear com as 2 linhas; Onix (95) Charti/Shuca/Persim; Magikarp (129) Passho/Aspear/Lum com as 2 linhas e o "Mostrar todas (46)" intacto; Feebas (349) so a linha Pokéisca. `detail.spec.ts` "Gyarados, Onix, Magikarp, Feebas, Dipplin".
- [A] Sem spawn (1011, Dipplin): nenhum bloco, painel igual ao de antes (captura `after-detail-where-no-spawn-1011-*` identica pixel a pixel a de antes). Mesmo teste.
- [A] Nenhum numero no bloco (sem "x10"); os 7 reforços com selos "raridade"/"shiny" (maca dourada os dois, Starf so shiny, fatia de melancia so raridade). Teste do Charizard (e2e) e `detail-bait.test.tsx`.
- [A] Clicar numa baga abre a pagina do item e Voltar retorna a mesma ficha. Teste do Charizard (e2e).
- [A] Nomes de item, tipo e grupo de ovo seguem o toggle PT/EN do card "Onde encontrar"; textos da interface seguem o idioma global. `detail-bait.test.tsx` ("names follow the card toggle", "interface in EN").
- [A] Carregando o catalogo: linhas de contexto aparecem e as bagas/reforços ficam em esqueleto (sem piscar vazio). `detail-bait.test.tsx` ("items loading shows skeletons").
- [ ] Conferir a olho que o bloco parece nativo do painel (mesma superficie das entradas de spawn, rotulo "ISCAS" no estilo de "DROPS", pilulas das bagas como as do "Como obter") nos 7 temas, principalmente `black`, `green` e `blue` (as capturas automaticas sao do `classic`).
- [ ] Conferir se o texto "ou baga na vara" ao lado da Pokéisca e a dica de cada linha ficam claros para quem nao conhece a mecanica (UX de texto; automacao so confere a presenca).

### Ficha do Pokemon: pesca na linha do spawn

- [A] Wooper (194) apos "Mostrar todas": spawn 17 com "Isca exigida: Doce Amor" clicavel (abre o item, Voltar volta); spawn 16 com "Pokévara com boia: Bola Amor" + "Lure 2 a 2: x3" + "Lure 3+: x5"; bloco Iscas continua com Passho/Shuca/Aspear. `detail.spec.ts` "Wooper (CA-14/15)".
- [A] Staryu (120): "Lure 1+" e "Lure 3+: x3" nas entradas de pesca; contagens de selo/tag/bioma/condicao por entrada iguais as de antes. `detail.spec.ts` "Staryu (CA-16/17)"; `detail-bait.test.tsx` ("fishing chips do not change the counts").
- [A] Goomy de Hisui (704) spawn 13 "Lure 2 a 2" / "Lure 2 to 2" com a interface em EN. `detail-bait.test.tsx` ("Goomy range in EN").
- [ ] Olhar Whiscash (340): entradas com a vara da Master Ball ("Pokévara com boia:" + a bola, no idioma do card) e clicar na bola.

### Pagina do item

- [A] Baga Occa: painel "Efeitos de isca" abaixo de "Como obter" com o texto do jogo ("...Pokémon do Tipo Fogo" / "100% - 10× Chance for Fire Types" pelo toggle do card) e a linha "Tempero da Panela de Fogueira: Aceito como tempero..."; "Como obter" com as mesmas 4 linhas. `item.spec.ts` "spawn-bait: item page > Occa (CA-18)"; `item-bait.test.tsx`.
- [A] Maçã Dourada Encantada: chip "Iscas", efeitos Tempo de mordida, Raridade (+10) e Shiny (6×). `item.spec.ts` "enchanted golden apple (CA-19)".
- [A] Poké-Lanche: chip "Iscas", sem aviso de "efeito pendente", Craftável "Sim, tem receita (Panela de Fogueira)" com "Ingredientes: 3x Qualquer leite, 2x Frasco de Mel, 1x Brotovital, 3x Grãos Saudáveis" (itens clicaveis) e a nota "mais até 3 temperos...". `item.spec.ts` "Poké Snack (CA-20)".
- [A] Pokéisca: chip "Iscas" (antes "Outros"), "1x Trigo" como texto (sem link), "1x Qualquer cogumelo", sem painel de efeitos. `item.spec.ts` "Poké Bait (CA-21)".
- [A] Estação "Panela de Fogueira" / "Campfire Pot" (ex.: Doce Amor) pelo idioma da interface. `item.spec.ts` "Love Sweet (CA-22)"; `item-bait.test.tsx`.
- [A] Baga fora da tag de tempero mostraria "Só na vara..." (caso sintetico, nao ha no dataset hoje). `item-bait.test.tsx` ("seasoning false shows the rod only line").
- [ ] Ler os textos do jogo em PT de 3 ou 4 bagas (ex. "100% - de probabilidade de aumentar o grupo de raridade em +10 níveis" na maçã encantada tem o "- de" do proprio jogo): decidir se o texto do jogo fica como esta.

### Lista Itens & Comidas

- [A] Aba "Iscas" lista os 8 itens novos e a Pokéisca com chip "Iscas" e textura; bagas continuam com chip "Berries" e aparecem na aba pela tag. `items.spec.ts` "spawn-bait (CA-23/24)".
- [ ] Rolar a aba "Iscas" inteira no celular e conferir a ordem e as texturas dos itens novos (a maçã dourada encantada usa a textura da maçã dourada, sem o brilho do jogo).

### Responsivo, temas e idiomas

- [A] `#where-panel` do Gyarados sem sobreposicao nem rolagem horizontal a 360/390/1280, PT e EN, temas `classic` e `black`. `detail.spec.ts` "Gyarados where panel with Iscas without overlap at <w>px".
- [A] Paginas do Poké-Lanche, Pokéisca e Maçã Dourada Encantada sem sobreposicao a 360/390/1280. `item.spec.ts` "bait item pages without overlap at <w>px".
- [A] Painel "Onde encontrar" do Mewtwo sem sobreposicao (teste existente, continua verde). `detail.spec.ts` "where panel without overlap at <w>px".
- [ ] Celular real (390): conferir o toque nas pilulas das bagas e nos chips de pesca (area de toque) e que a linha da Pokéisca quebra bem.

### O que a automacao nao cobre

- Percepcao visual nos 7 temas (so `classic` e `black` testados por sobreposicao; capturas so no `classic`).
- Clareza dos textos para o jogador (o bloco explica "onde usar" cada isca).
- Conferencia no jogo de que a recomendacao (3 melhores bagas) realmente ajuda no spawn; a regra segue o PRD, nao foi testada in-game.
- PWA offline com a ficha/pagina do item novas abertas sem rede (o `pwa-offline.spec.ts` cobre o app em geral; nada de rede novo foi adicionado).

### Testes automatizados do frontend

| Arquivo | O que cobre |
|---|---|
| `tests/unit/domain/bait.test.ts` | regra das 3 melhores (exemplos do PRD no dataset real), contextos, 7 reforços, WeakMap, desempenho, casos sinteticos, `lureRange` |
| `tests/unit/ui-screens/detail-bait.test.tsx` | `BaitBlock`, `FishingConds`, `eggGroupLabel`, `WherePanel` (ordem e contagens) |
| `tests/unit/ui-screens/item-bait.test.tsx` | `BaitEffectsPanel`, `PotRecipeList`, rotulo da estacao, `ingredientTagLabel` |
| `tests/unit/ui-screens/item-page.test.ts` | `recipeLabels` cooking_pot = "Campfire Pot" / "Panela de Fogueira" |
| `tests/e2e/detail.spec.ts` | describe "spawn-bait: Iscas e pesca" (7 testes) |
| `tests/e2e/item.spec.ts` | describe "spawn-bait: item page" (8 testes) |
| `tests/e2e/items.spec.ts` | "spawn-bait (CA-23/24)" |

Como rodar: `npx vitest run tests/unit/domain/bait.test.ts tests/unit/ui-screens`; e2e em build + preview: `npx playwright test tests/e2e/detail.spec.ts tests/e2e/item.spec.ts tests/e2e/items.spec.ts`.

### Testes existentes que falhavam antes da feature (corrigidos)

- [A] `tests/e2e/items.spec.ts` "F9.2 no overlap <lang> <w>px (long names)": era intermitente (grade medida durante a animacao de entrada e linha escondida pelo line-clamp contada pelo harness); corrigido em `fix(e2e)` (settle por playState + harness so com texto visivel).
- [A] `tests/e2e/dex.spec.ts` "text, filters and scroll are restored after Back from the detail": falhava tambem no main (correcao de medida da grade virtual depois do scroll do teste); corrigido em `fix(e2e)` (espera a posicao assentar), produto inalterado.
