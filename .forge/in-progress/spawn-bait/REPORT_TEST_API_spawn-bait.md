# REPORT_TEST_API_spawn-bait (contrato de dados)

Stage 5, 2026-09-29. Site estatico: nao ha endpoints. Este relatorio cobre o CONTRATO DE DADOS (items.json e species/*.json publicados) e a regressao automatizada. Alvo: `public/data/atm1.3.0-cobblemon1.7.3-20260929-2ef2f512/`, somente leitura, local. Conteudo escrito pelo orquestrador a partir do retorno do forge-test (o harness bloqueou a escrita direta pelo agente).

## Regressao automatizada

| Check | Alvo | Resultado | Notas |
|---|---|---|---|
| typecheck / lint | repo | PASS | limpos |
| vitest --coverage | 84 arquivos / 694 testes | PASS (2a rodada) | 1a rodada teve 1 falha flaky (F-01); limites ok: 94,29 linhas / 87,57 branches / 91,71 funcoes / 94,29 statements |
| build | repo | PASS | regenera `src/assets/types/*.svg` e `types.generated.css` so com fim de linha; restaurados com `git checkout` |
| playwright --workers=1 (build + preview) | 253 testes | 236 verdes / 1 falha / 16 skipped | a falha e o flaky preexistente do home.spec (F-02); esperado 237/16 |

## Contrato de dados

| Check | Alvo | Resultado | Notas |
|---|---|---|---|
| `current.json` aponta para a versao publicada | `public/data/current.json` | PASS | `...-2ef2f512`, pasta existe |
| schemas zod estritos, nenhum campo descartado | items.json, 1027 species, demais arquivos | PASS | `npx vitest run tests/unit/data tests/unit/dataset`: 19 arquivos / 245 testes |
| 951 itens | items.json | PASS | |
| exatamente 9 itens com categoria `bait` | items.json | PASS | allthemodium_apple/carrot, poke_bait, poke_snack, enchanted_golden_apple, glistering_melon_slice, glow_berries, golden_apple, golden_carrot |
| `mythical_pecha_berry` nao publicada | pasta inteira do dataset | PASS | nenhum arquivo, chave ou texto |
| `cobblemon:occa_berry` | items.json | PASS | categoria berry, typing/fire chance 1 value 10, PT "...Pokemon do Tipo Fogo", EN "100% - 10x Chance for Fire Types", seasoning true |
| `cobblemon:lum_berry` | items.json | PASS | 2 efeitos eggGroup (dragon, monster) na ordem do arquivo |
| `minecraft:enchanted_golden_apple` | items.json | PASS | biteTime 0.1, rarityBucket 10, shinyReroll (5, texto "6x"), categoria bait |
| `allthemodium:allthemodium_apple` / `_carrot` | items.json | PASS | apple: biteTime 0.1, rarityBucket 12, shinyReroll 10; carrot: biteTime 0.1, shinyReroll 10 ("11x") |
| `cobblemon:poke_bait.bait` | items.json | PASS | `{effects: [], seasoning: false}` |
| `cobblemon:poke_snack.bait` | items.json | PASS | null |
| `potRecipes` so em 2 itens | items.json | PASS | poke_snack: 3x c:drinks/milk, 2x honey_bottle, 1x vivichoke, 3x hearty_grains; poke_bait: 1x honey_bottle, 1x c:mushrooms, 1x wheat |
| chave `fishing` em todo spawn | 1027 species, 3197 spawns | PASS | 0 faltando |
| nenhum minLureLevel/maxLureLevel/rodType/bait sobrando em `extra.condition` | 1027 species | PASS | 0 sobrando |
| Charizard 6 / Gyarados 130 / Onix 95 / Dipplin 1011 | species | PASS | 2 / 5 / 3 / 0 spawns, nenhum com fishing nao nulo |
| Magikarp 129 | species/129.json | PASS | 46 spawns, 41 com fishing |
| Staryu 120 `staryu-10` | species/120.json | PASS | minLureLevel 1, lureMultipliers [{3,null,x3}], extra {weight 1.84, condition {minY -60, maxY 13}} |
| Wooper 194 spawns 16 e 17 | species/194.json | PASS | 16: love_rod, love_ball, mult [{2,2,x3},{3,null,x5}]; 17: bait `cobblemon:love_sweet` |
| Whiscash 340 | species/340.json | PASS | 5/6/9: master_rod + master_ball |
| texturas novas publicadas | public/assets/items/{minecraft,allthemodium} | PASS | golden_apple, enchanted_golden_apple, golden_carrot, glistering_melon_slice, glow_berries, allthemodium_apple/carrot |
| nenhum caminho absoluto de usuario | `git grep` em data-source tools src public | PASS | sem resultado |

Total: 21 checks de contrato, 21 PASS, 0 FAIL.

## Achados

Nenhum Critical ou High.

- **F-01 (Low, testes, preexistente):** `tests/unit/ui-screens/items-screen.test.tsx` "abas so das categorias presentes..." e flaky sob carga (afirma logo apos `fireEvent.click`, antes de a grade filtrar). Falhou 1 vez na rodada completa com cobertura; passou 3x isolado e na 2a rodada completa. Sugestao: `await findBy...`/`waitFor` antes do assert.
- **F-02 (Medium, testes, preexistente):** `tests/e2e/home.spec.ts:241` "remove from team with undo; 7th add..." e flaky (`.team-count` 5/6 apos `page.reload()`, esperado 6/6: o reload acontece antes de o undo persistir no IndexedDB). Falhou na suite completa e em 1 de 3 rodadas isoladas. A feature nao toca `src/screens/Home`, `src/state`, `src/storage` nem esse teste. Sugestao: esperar a persistencia (ou um flush) antes do reload.

Decisao do orquestrador (autonomia): os dois sao preexistentes e fora do escopo da feature; ficam registrados para o Pontin decidir se corrige numa `--quick`.
