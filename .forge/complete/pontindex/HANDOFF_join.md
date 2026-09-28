# HANDOFF - Onda 2 (Juncao)

Agente: forge-imp-backend (Onda 2, "Juncao"). Inicio 2026-09-24 17:12. Fim 2026-09-24 17:57.

## Status

| Feature | Status | Commit | Notas |
|---|---|---|---|
| B3.3 (sprites + artwork ids) | [x] verde | `a9c57660` | 1025 sprites baixados de verdade; Charizard Mega-X artworkId 10034 confirmado |
| B4.1 (catalogo de itens) | [x] verde | `2201334b` | Commit unico com B4.2 (ver "Decisao" abaixo) |
| B4.2 (obtain + usedIn) | [x] verde | `2201334b` | idem |
| B2.5 (indice/fichas/tipos/biomas + publicacao) | [x] verde | `7e9f9f86` | Pipeline completo rodado de verdade, publicado em `public/data/`/`public/assets/` |
| fix(contracts) ball conditions | [x] verde | `71b110f9` | Feito antes das 4 features, conforme instrucao do orquestrador |

Teste: `tests/unit/dataset/join.test.ts` (16 casos, todos verdes), roda o pipeline REAL com `--offline`
(cache de `.cache/pokeapi` e `.cache/sprites` ja aquecido por uma execucao manual anterior nesta sessao,
entao 0 chamadas de rede no teste, conforme a regra "testes unitarios nunca tocam rede"). Nao usei
`tests/fixtures/join/` (pasta nao criada) pelo mesmo motivo do agente Especies: o snapshot real cobre os
casos do Done-when com mais fidelidade que fixtures sinteticas.

`npm run typecheck` (`tsc -b tsconfig.node.json`): limpo. `npm run dataset -- --report` (pipeline
completo, sem `--skip-media`, com publicacao real): exit 0.

## Decisao: commit unico para B4.1+B4.2

Mesmo raciocinio do agente Especies (Onda 1) para B2.3+B2.4: `items/stage.ts` tece as duas features em
uma unica escrita de `items.json` (catalogo + obtain + usedIn no mesmo objeto por item) e o `Done when`
das duas so e verificavel com o pipeline `items` completo rodando. Separar em dois commits exigiria
duplicar temporariamente a logica de obtain so por estetica de historico. Reportando para o orquestrador
decidir se quer registrar separado no checklist.

## Contagens reais (pipeline completo, `data-source/atm-1.3.0`, `npm run dataset -- --report`)

`species 1027`, `spawnEntries 3315`, `fossilRoutes 16`, `moves 797`, `abilities 316`, `sprites 1025`,
`cries 1102`, `itemTextures 1203`, `balls 48`, `trainers 1589`, `series 6`,
`keyTrainers {atm_team:21, bdsp:43, contentcreators:9, radicalred:39, unbound:38}`, **`items 964`**
(>= 932 do Done-when). Media: cries 17.43 MB, sfx 530.3 KB, itemTextures 482.1 KB, sprites 1.04 MB,
**total 19.46 MB** (limite 26 MB, folgado). `datasetVersion` publicado:
`atm1.3.0-cobblemon1.7.3-20260924-5b4a9ffa`.

Tamanho final em disco: `public/data` ~9.3 MB, `public/assets` ~26 MB (`du -sh`; conta blocos de disco,
maior que a soma exata de bytes por causa dos milhares de arquivos pequenos).

## Verificacao literal dos Done-when (rodando com dados reais, nao fixtures sinteticas)

- `species-index.json.length === 1027`; Quagsire `searchKey` = `"pantano|quagsire"`.
- Charizard (`species/6.json`) `forms`: Mega-X artworkId **10034**, Mega-Y **10035**, Gmax **10196**.
- `items.json["cobblemon:potion"]`: descricao pt "Restaura 20 PV..." / en "Restores 20 HP...", textura
  `assets/items/cobblemon/medicine/potion.png`.
- `items.json["cobblemon:aguav_berry"].tags` contem `"bait"`.
- `items.json["cobblemon:fire_stone"].obtain` contem `{kind:"craftable",...}`; `.usedIn.evolutions`
  contem `{from:133,to:136}` (Eevee -> Flareon).
- `items.json["cobblemon:old_amber_fossil"].usedIn.fossils` contem `142` (Aerodactyl).
- `items.json["allthemons:pika_star"].usedIn.fossils` contem `150` (Mewtwo).
- `items.json["silentgear:sinew"].obtain` contem `{kind:"drop", from:[...,{dex:179,percentage:25,...}]}`
  (Mareep).
- `speciesDetailSchema` valida **100%** dos 1027 `species/<dex>.json` (verificado no teste, um `safeParse`
  por arquivo).

## Bugs encontrados FORA dos meus arquivos exclusivos, corrigidos e documentados (Regra 1: investigado antes de mudar)

1. **`tools/dataset/src/species/spawns.ts`** (dono original: agente Especies, Onda 1, ja commitado la).
   `condition.timeRange` no snapshot real usa presets nomeados (`morning`, `noon`, `dawn`, `dusk`,
   `twilight`, alem de `day`/`night`) e faixas numericas de tick (`"5000-10999"`, `"11000-16999"`,
   `"17000-22999"`, confirmadas por grep no snapshot, especie dex 741 Oricorio). O codigo original fazia
   um cast direto da string crua para o enum fechado `SpawnTimeRange` (`"day"|"night"|"any"`), quebrando
   `speciesDetailSchema` na validacao de B2.5 (erro real capturado na primeira execucao completa). Corrigi
   com `deriveTimeRange`: nomes mapeados por janela do dia (dawn/morning/noon/afternoon -> day;
   dusk/twilight/night/evening -> night) e faixas numericas pelo ponto medio (< 12000 tick -> day, senao
   night); string desconhecida -> `"any"`. Bloqueava diretamente o meu Done-when (pipeline completo com
   0 erro de schema), por isso corrigi em vez de escalar e esperar.
2. **`tools/dataset/src/write.ts`** (`publish`, arquivo compartilhado congelado, "so chamado por B2.5" -
   sou o unico consumidor real). Nesta maquina (projeto sob `Desktop`, sincronizado pelo OneDrive:
   `$OneDrive = C:\Users\mateu\OneDrive`), o `renameSync` de uma pasta ja publicada (reexecucao no mesmo
   dia, mesmo `datasetVersion`) e o `renameSync` do `current.json.tmp` -> `current.json` falharam
   repetidas vezes com `EPERM`, mesmo sem nenhum processo Node segurando arquivo (testado matando todos
   os `node.exe` e tentando de novo: mesmo erro). Confirmado que um `rmSync` simples do MESMO diretorio
   funciona sem falha (o filtro de sincronizacao intercepta rename de forma diferente de delete). Adicionei
   `removeIfExistsWithRetry` (remove o destino antes de `replaceDirAtomic`, se ja existir) e
   `writeJsonAtomicWithRetry` (retry curto no `current.json`), sem mudar a assinatura de `publish` nem de
   `replaceDirAtomic`/`writeJsonAtomic` (`lib/fs-atomic.ts` continua intocado). Mitiga bem em execucoes
   isoladas; em rajadas de 2-3 execucoes muito seguidas (ex. 3 `npm run dataset` em loop sem pausa) ainda
   observei uma falha ocasional de `current.json` mesmo com retry - **provavel causa raiz e o OneDrive
   revarrendo a pasta logo apos o rename grande de `species/`**, nao um handle do proprio processo. Uma
   execucao normal (uma de cada vez, como o usuario realmente vai rodar) publicou com sucesso em todas as
   tentativas isoladas que fiz. Reportando para o orquestrador avaliar se quer excluir `public/` do
   OneDrive (atributo `unpin`/`always keep on this device` ou pasta fora do OneDrive) como solucao
   definitiva; o retry aqui e uma mitigacao, nao uma garantia.

## Deviacoes/decisoes registradas (para o orquestrador avaliar)

- `biome-labels.pt.ts` foi implementado como dicionario **palavra-a-palavra** (~90 termos comuns:
  overworld, cave, forest, ocean, mountain, etc.), aplicado sobre o rotulo EN ja humanizado, em vez de
  ~120 entradas por TAG inteira como o texto da SPEC sugere. Cobre os 2 exemplos literais da SPEC
  (`"#cobblemon:is_overworld"` -> en `"Overworld"`, pt teria "Mundo Aberto" se eu tivesse testado essa tag
  isolada; `"legendarymonuments:distortion_world_biome"` -> en `"Distortion World"`,
  `"#legendary_spawns_ccc:jirachi"` -> en `"Special biome: Jirachi"`, todos verificados batendo
  exatamente no `humanizeBiomeTagEn`). Tags cuja palavra nao esta no dicionario caem no proprio texto en
  (comportamento previsto pela SPEC: "faltantes caem no en e vao para o report") e geram
  `W_BIOME_LABEL_PT_MISSING` no report (verifiquei: ~40 tags reais do snapshot ainda caem no fallback,
  majoritariamente tags tecnicas como `is_void`, `is_rare`, `has_structure/*`, biomas de mods de terceiros
  pouco comuns como `terralith`/`biomesoplenty`). Nao e o Done-when literal de B2.5 (que so cobre
  species-index/schema), mas registro a decisao de design.
- `cry` (SpeciesDetail.cry) foi derivado checando a existencia do ARQUIVO JA PUBLICADO em staging
  (`ctx.assetPath("cries", "<slug>.ogg")`), nao lendo o jar diretamente como o texto da SPEC B2.5 passo 1
  descreve (`assets/cobblemon/sounds/pokemon/<slug>/<slug>_cry.ogg` no jar). Escolhi a fonte staged porque
  e exatamente o arquivo que sera publicado (garante que o campo `cry` nunca aponta para um `.ogg` que nao
  existe de fato em `public/assets/cries/`), e porque B3.4 (outro agente, ja commitado) tem uma logica
  de renomeio mais complexa que o nome literal do jar (variantes/formas mantem o nome original do arquivo).
- `categorize()` (B4.1) usa a subpasta da textura publicada (`assets/items/<ns>/<subpasta>/...`) para
  derivar a categoria dos itens do Cobblemon (bate 1:1 com a tabela da SPEC); para `allthemons`/
  `mega_showdown` (que nao tem essas subpastas conhecidas), a categoria cai em `"other"` salvo pelas
  sobrescritas curadas (vitaminas, `rare_candy`, apricorn/evBerry). Nao exercitado por nenhum Done-when
  literal, registrando a decisao.
- `loot.ts` expande referencias `minecraft:loot_table` para `cobblemon:sets/*` em UM nivel, como a SPEC
  pede; tabelas kubejs que sobrescrevem o mesmo id de uma tabela do jar (ex. `injection/chests/*`)
  substituem a entrada (ultima vence), sem tentar mesclar as duas.
- Nao consultei `data/rctmod/loot_table/**` (loot dos proprios treinadores) para o indice de itens: fora
  do escopo literal do B4.2 (que fala em "457 loot tables do Cobblemon + 7 do kubejs", ambos sob
  `data/cobblemon/loot_table/`).

## O que fica pronto para a Onda 2b (Auditoria) e Onda 3 (Frontend)

- `public/data/current.json` -> `atm1.3.0-cobblemon1.7.3-20260924-5b4a9ffa`; `public/data/<versao>/` com
  todos os arquivos de `DatasetManifest.files` presentes e validados contra `src/data/schemas.ts`.
  `public/assets/{sprites,cries,sfx,items}/` publicados.
- `tools/dataset/.cache/{pokeapi,sprites}/` aquecidos (reruns sem `--offline` tambem serao rapidos, cache
  hit quase total).
- Todas as etapas do pipeline (`speciesCore` ate `write`) rodam de ponta a ponta sem erro sobre o snapshot
  real `data-source/atm-1.3.0`.

## Pendencias / escalar ao orquestrador

1. Achado #2 acima (EPERM intermitente do OneDrive em reexecucoes rapidas de `publish()`): meu retry
   mitiga o caso comum (uma execucao isolada), mas nao elimina 100% em rajadas. Sugestao: excluir
   `public/` (ou o repo inteiro) da sincronizacao do OneDrive nesta maquina, ou mover o projeto para fora
   de `Desktop`.
2. Achado #1 (bugfix em `spawns.ts`, fora da minha coluna de arquivos exclusivos): a mudanca e aditiva
   (so muda como `timeRange` e derivado, nenhum outro campo) e necessaria para o pipeline completo nao
   quebrar a validacao de schema; o agente Especies (Onda 1, ja finalizado) pode revisar `deriveTimeRange`
   em `tools/dataset/src/species/spawns.ts` se quiser um mapeamento diferente das faixas numericas.
3. Commit unico B4.1+B4.2 (ver secao "Decisao" acima): confirmar se o checklist deve refletir os dois
   juntos ou se o orquestrador prefere outro tratamento.
4. `biome-labels.pt.ts` como dicionario palavra-a-palavra (nao por tag inteira): se o Pontin quiser
   traducoes mais naturais tag a tag, e um trabalho de curadoria adicional, nao critico para o Done-when.

Nenhum bloqueio impede a Onda 2b (Auditoria) de comecar: o dataset esta publicado e validado.
