# HANDOFF backend (pwa-auto-update U3 + U5a)

Commits: `99d6035a` (U3), `26906d9d` (README U3), `142e2ef7` (U5a). Nada publicado em `public/` (U6 faz isso).

## U3: formato da URL das texturas

`items.json[id].texture` = `assets/items/<ns>/<caminho>.png?v=<8 hex>`, onde `<8 hex>` = 8 primeiros hex do sha256 dos bytes do arquivo publicado. O arquivo em disco continua `public/assets/items/<ns>/<caminho>.png` (sem query no nome). Mesmos bytes = mesma query.

Exemplo: `assets/items/allthemons/badges/the_kitty_badge.png?v=baded6c2`.

Frontend (so leitura, nada precisa mudar):
- `src/components/ItemTile.tsx` `itemTextureUrl`: `startsWith("assets/")` -> `"/" + texture` (concatenacao, query preservada).
- `src/screens/Detail/EvolutionPanel.tsx` `itemTexture`: so troca o prefixo `^/?assets/items/` por "" e devolve o resto (query preservada; depois `itemTextureUrl` recoloca `/assets/items/`).
- `src/screens/Items/ItemsScreen.tsx:46` so testa se ha textura.
- Nenhum codigo deriva algo da extensao ou faz `new URL(...)`/split no caminho.
- SW (`vite.config.ts`): `urlPattern: /\/assets\/items\//` casa com query; CacheFirst usa a URL completa como chave, entao a URL nova busca de novo.
- Outros assets NAO estao no JSON como caminho: `cry` e o slug (`/assets/cries/<slug>.ogg`, `src/audio/cries.ts`), sprites `/assets/sprites/<dex>.png` (`src/screens/Home/SpeciesSprite.tsx`), sfx por nome fixo (`src/audio/sfx.ts`). Continuam sem versao; hoje vem de fontes estaveis (jar do Cobblemon, PokeAPI). Se um dia precisarem, o dataset teria que gravar o caminho (mudanca de contrato) ou o app teria que receber um mapa de hashes.

## U5a: nova rota `trainerDrop`

Forma (tipo local do pipeline em `tools/dataset/src/items/trainer-drops.ts`):

```ts
| {
    kind: "trainerDrop";
    trainers: {
      id: string;                                  // id do treinador = TrainerInfo.id (link para a pagina do treinador)
      name: string | null;                         // TrainerInfo.name; null se o treinador nao esta em trainers/*.json
      series: string | null;                       // SeriesInfo.id cujo trainersFile tem o treinador; null se nao esta
      chance: number | null;                       // 0..1 por vitoria; 1 = garantido; null = nao calculavel das tabelas
      levelRange: { min: number; max: number } | null; // condicao rctmod:level_range da pool, como no arquivo
      firstDefeatOnly: boolean;                    // condicao rctmod:defeat_count == 1 (so a 1a vitoria)
    }[];                                           // ordenado por id, sempre >= 1
  }
```

Ordem no `obtain`: depois de `fossilRevive`, antes de `none` (item so com `trainerDrop` NAO tem mais `none`).

Exemplo real (`_publish_test`):

```json
"allthemons:the_kitty_badge": {
  "obtain": [
    { "kind": "trainerDrop", "trainers": [
      { "id": "team_allthemods_satherov", "name": "Satherov", "series": "atm_team", "chance": 1,
        "levelRange": { "min": 90, "max": 100 }, "firstDefeatOnly": false }
    ] }
  ]
}
"cobblemon:master_ball": { "obtain": [ { "kind": "craftable", "recipeTypes": [...] },
  { "kind": "trainerDrop", "trainers": [ { "id": "boss_giovanni_0045", "name": "Boss Giovanni", "series": "radicalred",
    "chance": 1, "levelRange": { "min": 1, "max": 100 }, "firstDefeatOnly": true } ] } ] }
```

14 itens: 12 `allthemons:the_*_badge` (ATM Team), `allthemons:ancient_dna_sample` (Notch, tambem `fossilRevive`), `cobblemon:master_ball` (Giovanni). Todos com `name` e `series` preenchidos (os treinadores existem no site).

`levelRange`: e o valor cru da condicao `rctmod:level_range`; este agente nao confirmou a semantica (nivel do treinador ou do jogador). Satherov tem `maxTeamLevel` 90, dentro de 90..100. Sugestao para a UI: nao mostrar `levelRange` ate confirmar, ou mostrar como "condicao de nivel 90-100" sem interpretar.

### O que o frontend (U5b) precisa mudar

OBRIGATORIO antes do U6: sem isso o app rejeita `items.json` inteiro (`src/data/loaders.ts` faz `safeParse` e lanca `DatasetError("INVALID")`), ou seja, a tela de itens quebra.

1. `src/data/types.ts`, `ItemObtainRoute`: acrescentar
   `| { kind: "trainerDrop"; trainers: { id: string; name: string | null; series: string | null; chance: number | null; levelRange: { min: number; max: number } | null; firstDefeatOnly: boolean }[] }`
2. `src/data/schemas.ts`, `itemInfoSchema.obtain` (union): acrescentar
   `z.object({ kind: z.literal("trainerDrop"), trainers: z.array(z.object({ id: z.string(), name: z.string().nullable(), series: z.string().nullable(), chance: z.number().nullable(), levelRange: z.object({ min: z.number(), max: z.number() }).nullable(), firstDefeatOnly: z.boolean() })) })`
3. `src/screens/Item/item-page-model.ts` e a tela de "Como obter" do item: renderizar a fonte "Drop de treinador" no mesmo visual das outras (chip por treinador com `name ?? id`, link para o treinador via `series` + `id` quando `series != null`; `chance` 1 = "garantido", senao `%`; `firstDefeatOnly` = "so na primeira vitoria"). Conferir qualquer `switch` exaustivo em `kind` (o typecheck aponta).
4. i18n (`src/i18n/messages/item.ts`): textos PT/EN da fonte, ex. "Drop de treinador" / "Trainer drop", "garantido" / "guaranteed", "so na primeira vitoria" / "first win only".
5. Depois do U5b, no pipeline: `tools/dataset/src/items/stage.ts` pode voltar a usar `ItemInfo`/`ItemObtainRoute` (apagar `PipelineItemInfo`/`PipelineItemObtainRoute`) e `tests/unit/dataset/join.test.ts` pode tirar o filtro que retira `trainerDrop` antes do `itemsFileSchema` (comentario U5a no teste).

## Reuso para U7b (loot de todos os namespaces)

`collectRctLootTables(ctx)` (jar rctmod + kubejs, chave `rctmod:<caminho>`) e `poolChance(rolls, q)` estao exportados em `trainer-drops.ts`; a leitura de pools/entries/conditions (`itemsOfTable`) e generica. O loot de `rctmod:trainers/groups/**` (sweet_apple, tart_apple, ancient_origin_ball etc. via `rctmod:generic/**`) foi deixado de fora de proposito: e sorteado para o grupo inteiro, nao e drop de um treinador.

## Ambiente (vai afetar o U6)

A publicacao falha com `E_WRITE_FAILED` (EPERM no rename de `data/species`) enquanto algum processo observa a pasta do repo. Repro: criar pasta em `tools/dataset/out`, esperar 3 s, renomear = EPERM; o mesmo em `Projetos/` ou no scratchpad = ok. Processo suspeito: dev server Vite na porta 4191 (pid 33680 no momento). Este agente nao o parou (nao e dele). Rodadas de teste usaram um preload do scratchpad (`--require copyrename.cjs`) que troca o rename de pasta por copia + remocao.
