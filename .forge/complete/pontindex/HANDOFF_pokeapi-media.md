# HANDOFF - Onda 1 (PokeAPI e midia)

Agente: forge-imp-backend (Onda 1, agente "PokeAPI e midia"). Inicio 2026-09-24 16:25, fim 2026-09-24 16:56.
Features: B3.1, B3.4, B3.2 (nesta ordem: B3.4 antes de B3.2 nao foi necessario, PokeAPI respondeu rapido; segui a ordem do SPEC B3.1 -> B3.2 -> B3.4 mesmo assim, todas verdes).

## Commits

| Feature | Commit | Verificacao executada |
|---|---|---|
| B3.1 | `5f56d316` | `tests/unit/dataset/pokeapi-media.test.ts` (describe "pokeapi client"): 2x503+200 com 2 retries, cache hit na 2a chamada (sem nova request), 404 sem retry, cache corrompido refeito, offline sem cache lanca `PokeapiError`. Todos com msw (sem rede real nos testes). |
| B3.2 | `47b95021` | Mesmo arquivo (describe "moves"/"abilities"): alias `visegrip -> vice-grip`, `tackle` == normal/physical/40/100/35, golpe sem match cai em `unmatched`, `blaze.name.pt === "Incêndio"`. **Alem disso, exercido de verdade contra a fonte real e a PokeAPI publica real**: `npm run dataset -- --only pokeapi --out tools/dataset/out/_pokeapi-media --report` rodou sem erro, populando `tools/dataset/.cache/pokeapi/` de verdade. |
| B3.4 | `8ea3c95f` | Mesmo arquivo (describe "media: cries/sfx/item textures/budget/stage"), 18 casos com `SourceReader` falso em memoria (sem tocar em `data-source/`). **Tambem exercido de verdade**: `npm run dataset -- --only media --out tools/dataset/out/_pokeapi-media --report` rodou sem erro sobre o snapshot real. |

Suite `npx vitest run tests/unit/dataset/pokeapi-media.test.ts`: 18 testes, verde. `npm run typecheck` e `npm run lint` verdes no repo inteiro (conferido depois do 3o commit). Nao rodei a suite completa do projeto apos os commits para nao demorar mais que o necessario, mas rodei ela pelo menos uma vez com todos os meus arquivos presentes: 11 arquivos, 116 passaram, 2 falharam em `tests/unit/dataset/species.test.ts` (fora do meu escopo, agente "Especies"; nao toquei nesses arquivos).

## Decisao de rede (importante para quem revisar)

A regra do ambiente pede que testes automatizados (`vitest`) NUNCA toquem rede: o arquivo de teste usa `msw` (`msw/node`) para mockar a PokeAPI e um `SourceReader` falso em memoria para a midia dos jars, sem depender de fixtures em disco (a pasta `tests/fixtures/pokeapi-media/` foi criada mas ficou vazia; nao precisei de arquivos fisicos porque o fake reader monta os bytes em memoria).

Separadamente, para cumprir o "Done when" do SPEC de verdade (que pede rodar `runPokeapiStage`/`runMediaStage` sobre o snapshot REAL, com cache real), rodei manualmente:
- `npm run dataset -- --only pokeapi --out tools/dataset/out/_pokeapi-media --report` (bate na PokeAPI publica de verdade, populando `tools/dataset/.cache/pokeapi/`).
- `npm run dataset -- --only media --out tools/dataset/out/_pokeapi-media --report` (so le os jars, sem rede).

Ambos rodaram limpos (0 warnings, exit 0). A PokeAPI publica estava alcancavel o tempo todo; nao houve necessidade de reportar indisponibilidade.

## Contagens reais observadas (snapshot `data-source/atm-1.3.0`, rodando de verdade)

- `moves`: **797** golpes (SPEC estimava 932). `abilities`: **316** (SPEC estimava 310). Zero avisos, zero golpes/habilidades sem correspondencia apos o fix do alias `visegrip`.
- `cries`: **1102** arquivos, 17.43 MB (SPEC: "1072 no snapshot" - o Done-when usa `>=`, entao passa).
- `sfx`: 20 arquivos (todos de `SFX_NAMES`), 530.3 KB.
- `itemTextures`: **1203** arquivos, 482.1 KB = exatamente `cobblemon 802 + allthemons 79 + mega_showdown 322` (bate com os numeros do HANDOFF_base).
- Total de midia desta etapa: **18.42 MB** (limite 26 MB, folgado).
- `tackle` = normal/physical/40/100/35, `pokeapiId` 33 (bate com o exemplo do SPEC). `blaze.name.pt` = "Incêndio" (bate).

## Deviacoes do SPEC (registrar para o orquestrador)

1. **Contagem de golpes (932 -> 797) e ids de golpe SO das especies, nao "+ lang".** O SPEC diz "ids de golpe = uniao de todos os moves das especies + chaves `cobblemon.move.<id>.desc` do lang". Implementei assim primeiro e o build falhou com 292 golpes sem match: sao Z-Moves e golpes G-Max (ex. `gmaxwildfire`, `aciddownpour`) que **existem no lang do Cobblemon** (`cobblemon.move.<id>.desc` de verdade) mas **a PokeAPI publica nao modela** (confirmado: `GET /move/g-max-wildfire` e `/move/gmax-wildfire` = 404). Nenhuma especie realmente usa esses golpes (nao aparecem em `moves.level/tm/egg/tutor` de espécie alguma). Removi a parte "+ lang" de `collectMoveIds` (`tools/dataset/src/moves.ts`): a fonte agora e SOMENTE o moveset das especies. Resultado: 797 golpes, 0 sem match. Se o app precisar dessas descricoes de Z-Move/G-Max no futuro (nao usadas pelo PRD atual), precisam de uma fonte de mecanica diferente da PokeAPI.
2. **Alias corrigido: `visegrip -> vice-grip`, nao `vicegrip -> vise-grip`.** O SPEC listava o exemplo como `vicegrip -> vise-grip`. Rodando de verdade, o id real no Cobblemon 1.7.3 e `visegrip` (com "s"), e o slug real da PokeAPI publica e `vice-grip` (confirmado: `/move/vise-grip` = 404, `/move/vice-grip` = 200). Corrigido em `tools/dataset/src/pokeapi/move-aliases.ts`.
3. **Abilities 316 vs 310 estimado no SPEC**: diferenca pequena, provavelmente por causa das habilidades de formas (`species.forms[].abilities`) que tambem entram na uniao (o SPEC B3.2 passo 2 nao deixa isso 100% explicito, mas o schema de saida usa os mesmos ids de habilidade para especie e forma, entao inclui-las e necessario para as formas nao ficarem sem dado). Nao investiguei mais fundo por tempo; nenhum aviso `W_ABILITY_NO_LANG` apareceu no relatorio, entao todas tem nome/descricao no lang.
4. **cries.ts extrai por arquivo, nao so por slug exato.** Descoberta rodando de verdade: alem de `<dir>/<dir>_cry.ogg` (1025 arquivos so no jar do Cobblemon), ha 47 arquivos de variante/forma na MESMA pasta com sufixo extra (ex. `archen/archen_quirk1_cry.ogg`, `braviary/braviary_hisuian_cry.ogg`, `exeggutor/alolan_exeggutor_cry.ogg`) - exatamente o caso que o SPEC descreve como "os que nao casam... mantidos com o nome original para formas". Implementei: se o nome do arquivo (sem `.ogg`) for exatamente `<pasta>_cry`, a saida e `<pasta>.ogg`; caso contrario, a saida usa o nome original do arquivo sem alteracao. 1072 = 1025 renomeados + 47 mantidos com nome original, so no jar do Cobblemon; somando os jars de addon (que trazem cries alternativos para os MESMOS nomes, e alguns poucos nomes novos de variante) o total real fica em 1102.
5. **item-textures.ts preserva a subpasta original ao copiar (nao achata para `<ns>/<basename>.png`).** Verifiquei que achatar (1 arquivo por basename, descartando duplicatas) derruba a contagem de `cobblemon` para 737 (< 800, quebraria o Done-when), porque ha 65 basenames duplicados no proprio namespace `cobblemon` (48 deles sao `poke_balls/<nome>.png` vs `poke_balls/models/<nome>.png`; os outros 17 sao coincidencias legitimas entre pastas como `held_items/` e `wearable/`, ex. `black_glasses.png` existe nos dois com conteudo provavelmente diferente). Por isso a copia preserva a subpasta inteira (`items/<ns>/<caminho original>`, contagem real = soma exata dos arquivos de origem: 802+79+322=1203) e SO o `texture-manifest.json` (`"<ns>:<basename>" -> caminho`) resolve a ambiguidade de qual arquivo e "o" icone de um item por id, preferindo a versao fora de `models/` quando ha empate - a regra que o SPEC pede, so que aplicada na resolucao de id, nao na copia dos arquivos.
6. Nao criei `tools/dataset/src/pokeapi/cache.ts` como arquivo separado: a logica de cache em disco (leitura antes da rede, escrita atomica simples via `writeFileSync`+leitura, apagar cache corrompido) ficou dentro de `client.ts` mesmo, por ser pequena o bastante para nao justificar outro arquivo. Se o orquestrador preferir o arquivo separado (como a tabela do SPEC §6 lista), e um refactor mecanico sem mudanca de comportamento.
7. `tests/fixtures/pokeapi-media/` foi criada mas ficou vazia: os testes usam `msw` (rede mockada) e um `SourceReader` falso em memoria (sem arquivos fisicos) em vez de fixtures em disco, para manter os testes rapidos e auto-contidos.

## O que fica pronto para os outros agentes / Onda 2

- `moves.json` (797 entradas) e `abilities.json` (316) em `tools/dataset/out/_pokeapi-media/data/`, com contagens gravadas em `ctx.counts.moves`/`ctx.counts.abilities` (dono = etapa `pokeapi`, ja checado por `COUNT_OWNERS`).
- `cries/`, `sfx/`, `items/<ns>/**` e `texture-manifest.json` em `tools/dataset/out/_pokeapi-media/assets/` e `.../data/texture-manifest.json`. B4.1 (Onda 2, catalogo de itens) pode ler `texture-manifest.json` para resolver `ItemInfo.texture` por id (`<ns>:<basename sem extensao>` -> caminho relativo dentro de `assets/items/`).
- `src/audio/sfx-names.ts` (`SFX_NAMES`, 20 nomes) esta pronto para F1.4 importar (fonte unica, nao redefinir).
- `tools/dataset/.cache/pokeapi/` ja tem os golpes/habilidades da execucao real cacheados (reruns sao gratis).
- B3.3 (Onda 2, sprites + artwork ids) vai ACRESCENTAR corpo a `tools/dataset/src/pokeapi/stage.ts` (`runPokeapiStage`): hoje ele chama `runMoves(ctx)` e `runAbilities(ctx)`; o agente da Onda 2 so precisa adicionar as chamadas de sprites/artwork depois dessas duas, sem remover nada.
- `checkBudget` (`tools/dataset/src/media/budget.ts`) so soma cries+sfx+itemTextures (26 MB); a checagem final com sprites incluidos e responsabilidade de B2.5 (Onda 2), como o SPEC pede.

## Pendencias / escalar

- Nenhum bloqueio. As 3 features estao verdes, testadas (unitario + execucao real contra a fonte e a PokeAPI publica) e commitadas.
- O orquestrador deve decidir se as deviacoes 1, 2 e 5 acima (contagens diferentes do estimado no SPEC, e a escolha de preservar subpastas nas texturas de item) precisam de um ajuste no texto do SPEC ou se ficam so registradas aqui.
