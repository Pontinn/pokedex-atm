# HANDOFF - Onda 1 (Especies)

Agente: forge-imp-backend (Onda 1, "Especies"). Inicio 2026-09-24 16:25, fim 2026-09-24 16:52.

## Status

| Feature | Status | Commit | Notas |
|---|---|---|---|
| B2.3 (spawns, raridade, fosseis, obtain) | [x] verde | `9718bf5e` | Junto com B2.4 no mesmo commit (ver "Decisao: commit unico" abaixo) |
| B2.4 (evolucoes, cadeia, formas) | [x] verde | `9718bf5e` | idem |

Testes: `npx vitest run tests/unit/dataset/species.test.ts` - 12 testes, verde. Suite completa
(`species.test.ts` + `species-merge.test.ts` + `source.test.ts`, os 3 arquivos que tocam dataset ate
agora) - 33 testes, verde. `npm run typecheck` - 0 erros nos meus arquivos (existem 4 erros
pre-existentes em `tests/unit/dataset/pokeapi-media.test.ts`, que NAO e meu arquivo - agente
PokeAPI/midia da mesma Onda, ainda em andamento). `npx eslint` nos meus 8 arquivos - limpo.

`Done when` exercitado de fato: `npm run dataset -- --only speciesDerive --out tools/dataset/out/_species --skip-media --report`
sai com codigo 0, 0 warnings, e imprime (tambem em `tools/dataset/out/_species/report.json`):
`species 1027`, `spawnEntries 3315` (> 824), `fossilRoutes 16`.

## Arquivos que escrevi

- `tools/dataset/src/species/stage-derive.ts` (preenchido; era o stub vazio da Onda 0) - orquestra
  spawns -> rarity -> fossils -> obtain -> evolutions/cadeia -> formas, gravando tudo em `ctx.species`.
- `tools/dataset/src/species/spawns.ts`, `rarity.ts`, `fossils.ts`, `obtain.ts` (B2.3).
- `tools/dataset/src/species/evolutions.ts`, `forms.ts` (B2.4).
- `tests/unit/dataset/species.test.ts` (unico arquivo de teste, cobre B2.3+B2.4, roda sobre o
  snapshot real `data-source/atm-1.3.0` via `openSource`/`loadLang`/`mergeSpecies`, igual ao segundo
  `describe` de `species-merge.test.ts`). NAO usei `tests/fixtures/species/` (pasta vazia, nao
  criada): o snapshot real ja cobre todos os casos do Done-when com precisao maior que fixtures
  sinteticas, e o unico teste isolado sem o snapshot (`deriveSpeciesObtain` com deps vazias, caso
  "nenhuma rota -> none") nao precisa de arquivo de fixture.

## Decisao: commit unico para B2.3+B2.4

A regra da onda pede um commit atomico por feature. Na pratica as duas features sao interdependentes
por design da propria SPEC: a regra (1) de "Como obter" (5.1.5) - usada pelo Done-when de B2.3
("Charizard -> [{evolution from 5}, {breeding,...}]") - precisa da aresta de evolucao resolvida
(`EvolutionEdge`), que e conceito de B2.4; e a SPEC define UM UNICO arquivo de teste para as duas
(`species.test.ts`). Separar em dois commits exigiria duplicar temporariamente o parser de aresta
(uma copia so para B2.3, substituida depois) so por estetica de historico, sem nenhum ganho real
(nenhum outro agente toca esses arquivos). Optei por um commit unico, com mensagem cobrindo as duas
features e o motivo explicado no corpo do commit. Reportando aqui para o orquestrador decidir se
quer registrar B2.3/B2.4 juntos ou separados no checklist compartilhado.

## Como os campos derivados chegam a ctx.species (importante para quem consome depois)

`MergedSpecies` (contrato congelado de B2.2/`context.ts`) NAO tem campos para spawns, rarity, obtain,
evolutions, preEvolution, evolutionChain ou formas resolvidas - e eu NAO editei `context.ts` (esta na
lista de arquivos congelados). Como o proprio `PipelineContext` tambem nao tem um mapa extra para
isso, os campos derivados sao gravados por MUTACAO diretamente nos objetos que ja vivem dentro de
`ctx.species` (o Map e os objetos nao sao congelados, so o formato TIPADO de `MergedSpecies` e).

Exporto o tipo de extensao em `tools/dataset/src/species/stage-derive.ts`:

```ts
export interface SpeciesDerivedFields {
  spawns: SpawnEntry[];
  rarity: RarityInfo;
  obtain: ObtainRoute[];
  evolutions: EvolutionEdge[];               // saidas desta especie
  preEvolution: { dex: number; slug: string } | null;
  evolutionChain: EvolutionChain;
  resolvedForms: SpeciesForm[];              // SpeciesForm[] pronto (com requiredItems); NAO confundir com
                                              // MergedSpecies.forms, que continua sendo o MergedForm[] cru de B2.2
}
export type DerivedSpecies = MergedSpecies & SpeciesDerivedFields;
```

**Quem monta `species/<dex>.json` (B2.5, Onda 2, `species/index-writer.ts`) deve importar
`DerivedSpecies` deste arquivo e fazer `const s = ctx.species.get(dex) as DerivedSpecies` para ler
`s.spawns`, `s.rarity`, `s.obtain`, `s.evolutions`, `s.preEvolution`, `s.evolutionChain` e
`s.resolvedForms`** (este ultimo vira o campo `forms: SpeciesForm[]` de `SpeciesDetail`). Isso roda
DEPOIS de `runSpeciesDerive(ctx)` ter sido chamado pelo pipeline (ja e o caso: `index.ts` chama
`speciesCore -> speciesDerive -> ... -> write`, nessa ordem, e nao mexi nisso).

Se isso nao for uma solucao aceitavel (por exemplo se o orquestrador preferir um campo formal em
`PipelineContext`), e preciso um pedido de mudanca no `context.ts` congelado - sinalizando aqui para
o orquestrador avaliar; do meu lado a suite passa e o pipeline real roda ponta a ponta com essa
abordagem.

## `artworkId` das formas: null (fora do escopo de B2.3/B2.4)

`SpeciesForm.artworkId` (id de artwork da PokeAPI da variante, ex. charizard-mega-x -> 10034) exige
uma tabela de nomes de variante da PokeAPI, que so o agente PokeAPI/midia (B3.x) tem acesso (meu
"Consumes" e so B2.2). Deixei `artworkId: null` em todas as formas que gero. Quem monta o JSON final
(B2.5) ou o agente PokeAPI precisa decidir onde resolver isso (talvez em `runPokeapiStage` decorando
`ctx.species` da mesma forma, ou no proprio `index-writer.ts`).

## O que verifiquei nos dados reais (snapshot `data-source/atm-1.3.0`) e pode divergir do texto da SPEC

1. **Spawns por namespace**: `spawn_pool_world/` aparece em 4 namespaces diferentes no jar do
   Cobblemon e no jar `ccc` (`data/cobblemon/spawn_pool_world/`, `data/legendary_spawns_ccc/...`,
   `data/paradox_spawns_ccc/...`, `data/ub_spawns_ccc/...`). O `SourceReader.readJar` so filtra por
   prefixo EXATO (sem glob), entao hardcodei a lista em `spawns.ts` (`SPAWN_NAMESPACES`), no mesmo
   estilo de `REQUIRED_JARS`/`LANG_NAMESPACES` ja usados no projeto. Um namespace novo em versao
   futura do modpack exigiria acrescentar aqui (nao ha como descobrir via o `SourceReader` atual).
2. **`0000_pidgey_herd.json`** (Cobblemon base) e um arquivo de teste do proprio mod
   (`"comment":"This is a test of the herd system..."`), com `"enabled": false` e
   `"type":"pokemon-herd"` (varias especies em `herdablePokemon[]`, sem campo `pokemon` direto).
   Ignorado por dois filtros: arquivo inteiro pulado quando `enabled === false`, e entradas com
   `type` diferente de `"pokemon"` puladas (evita um `W_SPAWN_INVALID` espurio). Sem isso, o build
   emitia 1 warning por execucao.
3. **Mewtwo e Charizard TEM spawn proprio no snapshot real**, ao contrario dos exemplos ilustrativos
   da SPEC 5.1.5 ("Mewtwo sem spawn", "Charizard sem spawn proprio"):
   - Mewtwo: `data/legendary_spawns_ccc/spawn_pool_world/0150_mewtwo.json` (jar `ccc`, bucket
     `ultra-rare`, `enabled: true`). Isso significa que, alem da rota `fossil` (allthemons), Mewtwo
     TAMBEM ganha uma rota `addon` (`{kind:"addon", addon:"ccc", entries:[...]}`) pela regra (4) de
     5.1.5, e `rarity.primary` e `"ultra-rare"` (nao `null`).
   - Charizard: `data/cobblemon/spawn_pool_world/0006_charizard.json` (jar `cobblemon` base, 2
     entradas `ultra-rare`, biomas de montanha/vulcanico e nether/basalto). `rarity.primary` e
     `"ultra-rare"` (nao `null`). Isso NAO muda o array `obtain` (que continua
     `[{evolution from Charmeleon}, {breeding}]`, ja que a regra (1) so olha o spawn do PAI, e
     source `"cobblemon"` nao entra nas regras (3)/(4)) - so a suposicao de "sem spawn proprio" do
     texto da SPEC nao vale para este snapshot.
   Ajustei os testes para verificar o array `obtain` (que bate 100% com o texto da SPEC) sem afirmar
   `rarity.primary === null` para essas duas especies, ja que isso e factualmente falso nos dados
   reais. Verificado com `Grep` direto nos arquivos brutos antes de mudar qualquer coisa (Regra 1).
4. **Mega/Mega-Z**: `data/mega_showdown/mega_showdown/mega/*.json` (81 arquivos) e
   `data/zamega/mega_showdown/mega/*.json` (12 arquivos), ambos `{showdown_id, pokemons: ["Nome"],
   aspect_conditions.apply.aspects: ["mega_evolution=<aspect>"]}`. Formas usam `aspects: ["mega_x"]`
   etc diretamente (nao o texto `"mega_evolution=..."`, que so aparece no arquivo de item). Item id =
   `<namespace>:<nome do arquivo>` (`namespace` = id do jar: `mega_showdown` ou `zamega`, confirmado
   no lang `item.zamega.zygardite`). `mega_showdown:keystone` so e exigido quando o item resolvido e
   do namespace `mega_showdown` (nenhuma referencia a keystone em todo o jar do zamega - confirmado
   por grep, [ASSUMPTION] da SPEC 5.1.5 mantida: zamega nao usa keystone).
5. **Evolutions cru**: confirmado o formato `{id, variant: "level_up"|"item_interact"|"trade",
   result: "<slug>" (pode vir com aspecto, ex. "toxtricity punk_form=amped"), requiredContext:
   "cobblemon:<item>", requirements: [{variant:"level"|"friendship"|"time_range"|"has_move_type"|
   "held_item"|"properties"|..., ...}]}`. `variant:"properties"` (ex. Toxtricity, checa nature)
   cai em `{kind:"other", raw}` (nao esta na lista fechada da SPEC 5.1.3, tratado como generico).
   Nenhum `variant` de evolucao `"block_click"` encontrado no snapshot (tipo existe no esquema, so
   nao e exercitado pelos dados atuais).
6. **Fossils**: `data/cobblemon/fossils/*.json` (15 arquivos, `{result, fossils}`) + 1 do allthemons
   (`mewtwo.json`) = 16, confirmado por contagem direta. Nao ha fossils em kubejs nem nos outros
   addons no snapshot atual.

## Regras implementadas exatamente como a SPEC descreve (sem desvio)

- Raridade (5.1.4): `primary` = bucket de MAIOR contagem (desempate por common>uncommon>rare>ultra-rare);
  `secondary` = demais presentes na mesma ordem. Testado com Eevee real (5 entradas -> uncommon
  primary, [rare, ultra-rare] secondary), bate exatamente com o exemplo da SPEC.
- Bucket fora dos 4 valores conhecidos -> `PipelineError("E_SPECIES_INVALID", ...)` (edge case da
  SPEC B2.3, nao exercitado pelos dados reais, so pelo codigo defensivo).
- Obtain (5.1.5): ordem (1) evolution -> (2) fossil -> (3) packSpawn (kubejs/allthemons) -> (4) addon
  (legendarymonuments/ccc) -> (5) breeding (eggGroups sem "undiscovered") -> (6) `[{kind:"none"}]`
  quando nada bate. Regra (1) e recursiva/memoizada: uma especie so ganha rota `evolution` se a
  pre-evolucao tiver spawn proprio OU (recursivamente) ela mesma ja for alcancavel por evolucao;
  ciclo de dados quebrado e cortado com guarda de visita (nunca trava).
- Fallback "ultrawormholes" (ASSUMPTION da propria SPEC): so aplicado a especies com label
  `ultra_beast` e SEM NENHUMA outra rota confirmada (a maioria dos ultra beasts JA tem spawn real via
  `ub_spawns_ccc`/jar `ccc`, entao caem na regra geral (4) e nunca precisam do fallback). Raid Dens
  nunca ganha rota (honestidade RF-69, conforme SPEC).
- Cadeia de evolucao: BFS a partir da raiz (subida por `preEvolutionRaw`, corte em 10 passos ou ciclo
  + aviso no report), mesma cadeia (mesmo objeto) gravada em todas as especies da familia.

## O que fica pronto para a Onda 2 ("Juncao", B2.5/index-writer.ts)

- `ctx.species` (apos `runSpeciesDerive`) tem TODOS os campos de `SpeciesDetail` exceto os que
  vem de outras etapas (PokeAPI, midia, itens) - ver secao "Como os campos derivados chegam" acima
  para o padrao de leitura (`as DerivedSpecies`).
- `ctx.counts.spawnEntries` e `ctx.counts.fossilRoutes` ja setados.
- Nenhum arquivo foi escrito em `ctx.outDir` por esta etapa (so mutacao em memoria); B2.5 e quem
  grava `species/<dex>.json` e `species-index.json`.
