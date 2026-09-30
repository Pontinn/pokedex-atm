# HANDOFF backend - berry-mutations

Para o agente de frontend. Tudo abaixo foi conferido no dataset publicado (nao so na SPEC).

## Estado

- Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260930-1949ea67/` (`current.json` aponta para ele; a pasta `...-2ef2f512` foi removida pelo `write.ts`, padrao do projeto).
- Commits do backend (branch `feature/berry-mutations`): B1.1 `e5ba8bb0`, B1.2 `ff17d2ce`, B2.1 `ea3aa9a1`, B2.2 = commit `feat(data): dataset republicado com origem e cruzamentos das bagas` (hash no CHECKLIST). T1.1 e T1.2 vem depois (hashes no CHECKLIST).
- Janela quebrada B1.1 -> B2.2: FECHADA. `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` passam de novo; o app e o e2e podem abrir. `npx vitest run` inteiro verde (85 arquivos / 708 testes, ja com os testes novos do backend).
- Contrato em `src/data/types.ts` (`ItemBerry`, `BerrySpawn`, `BerrySpawnVariant`, `BerryMutationPair`, `BerryMutationUse`, `ItemInfo.berry`) e `src/data/schemas.ts` (`itemBerrySchema`, estrito). Congelado; nao mudar sem voltar ao backend.
- Nenhum desvio da SPEC secao 5.

## Contrato real

### `ItemInfo.berry` (items.json, ultima chave, depois de `bait`)

```ts
berry: {
  spawn: { variant: "preferredBiome" | "allBiome" | "specificBiome"; biomeTags: string[] }[]; // [] = nao nasce no mundo
  mutationPairs: { a: string; b: string }[];       // pares que GERAM esta baga; a < b por code unit; ordenado por a, depois b
  mutationUses: { partner: string; result: string }[]; // esta baga + partner = result; ordenado por partner, depois result
} | null
```

- Nao nulo SO nas 70 bagas `cobblemon:*_berry` (todas `category: "berry"`). `null` nos outros 881 itens, inclusive os 40 apricorns/mints que tem rota `plantable`.
- `biomeTags`: `preferredBiome` = os `preferredBiomeTags` da baga (os mesmos da rota `plantable`); `allBiome` = `[]` (nasce em qualquer bioma); `specificBiome` = `[<tag>]` (Liechi: `cobblemon:is_mirage_island`, rotulo existente em `biomes.json` `#cobblemon:is_mirage_island`).
- A rota `plantable` das 110 continua IDENTICA a de antes (comparada por id): e ela que alimenta "Cresce melhor em".
- Nenhum outro campo de nenhum item mudou: `JSON.stringify` de cada um dos 951 itens sem a chave `berry` e identico ao do dataset anterior `2ef2f512`. Os demais arquivos do dataset (abilities, balls, biomes, fossils, moves, series, species-index) sao byte a byte iguais aos anteriores.

### Numeros no dataset publicado (derivados dos 70 arquivos crus; os testes recalculam do pack)

- 70 bagas com `berry`; 31 com `spawn` nao vazio (28 `preferredBiome`, 2 `allBiome`: oran e persim; 1 `specificBiome`: liechi).
- 40 com `mutationPairs` nao vazio; 77 pares no total; 154 usos no total.
- Origem (regra do app, `berryOrigins`): 30 so mundo, 39 so mutacao, 1 ambas (Liechi).

### Exemplos reais (byte a byte no `items.json` publicado)

- `cobblemon:cheri_berry.berry` = `{"spawn":[{"variant":"preferredBiome","biomeTags":["cobblemon:is_plains"]}],"mutationPairs":[],"mutationUses":[{"partner":"cobblemon:oran_berry","result":"cobblemon:lum_berry"},{"partner":"cobblemon:persim_berry","result":"cobblemon:figy_berry"}]}`
- `cobblemon:lum_berry.berry` = `{"spawn":[],"mutationPairs":[{"a":"cobblemon:aspear_berry","b":"cobblemon:oran_berry"},{"a":"cobblemon:cheri_berry","b":"cobblemon:oran_berry"},{"a":"cobblemon:chesto_berry","b":"cobblemon:oran_berry"},{"a":"cobblemon:oran_berry","b":"cobblemon:pecha_berry"},{"a":"cobblemon:oran_berry","b":"cobblemon:rawst_berry"}],"mutationUses":[{"partner":"cobblemon:aguav_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:figy_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:iapapa_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:leppa_berry","result":"cobblemon:hopo_berry"},{"partner":"cobblemon:mago_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:wiki_berry","result":"cobblemon:sitrus_berry"}]}`
- `cobblemon:liechi_berry.berry` = `{"spawn":[{"variant":"specificBiome","biomeTags":["cobblemon:is_mirage_island"]}],"mutationPairs":[{"a":"cobblemon:kelpsy_berry","b":"cobblemon:pamtre_berry"}],"mutationUses":[]}`
- `cobblemon:oran_berry.berry.spawn` = `[{"variant":"allBiome","biomeTags":[]}]`, 10 `mutationUses` (5 com result leppa, 5 com lum). `cobblemon:figy_berry.berry.mutationPairs` = `[{"a":"cobblemon:cheri_berry","b":"cobblemon:persim_berry"}]`.
- `cobblemon:red_apricorn.berry`, `cobblemon:adamant_mint.berry`, `cobblemon:potion.berry` = `null`.

## Provas (B2.2)

- Paridade instancia x snapshot (RF-37): `items.json` da instancia real (`--instance`, datasetVersion `...-2da90a76`), do snapshot (`...-1949ea67`), da repeticao de determinismo (`...-1949ea67`, mesma versao) e o publicado: todos com sha256 `464846fcfeded8de70dfc810d21500e198af3fc5c812ab161bcaece91cd4d558`. As versoes da instancia e do snapshot diferem so pelo `dataset-manifest.json` (fontes/mtimes), desvio ja conhecido desde o spawn-bait.
- Tamanho: `items.json` = 1.533.158 bytes (teto efetivo 1.659.908, `join.test.ts:322`); era 1.499.586 (+33.572, +2,24%).
- Auditoria no publicado: 46768 checks (46558 + 210 novos), `divergencias {}`.

## Notas para o frontend

- Classificacao de origem NAO e publicada: derive de `item.berry` (Mutacao = `mutationPairs.length > 0`; Mundo = `spawn.length > 0`), SPEC 2.4 item 4.
- Todo id em `mutationPairs`/`mutationUses` existe no `items.json` hoje (0 avisos `W_BERRY_MUTATION_UNKNOWN_ID`), mas o app continua tratando id ausente com `ItemLink` (RF-46).
- A mecanica (12,5%, 50% com Surprise Mulch, 4 vizinhos, sorteio quando a arvore floresce) nao vem do dataset: texto fixo no dicionario (SPEC 2.4 item 5). `cobblemon:surprise_mulch` existe no `items.json`.
