---
feature: berry-mutations
language: pt-BR
generated: 2026-09-30
stack: React 19 + TypeScript + Vite (SPA/PWA), zustand, zod 3.24 (contrato estrito), Vitest 3 + Testing Library, Playwright 1.63; pipeline de dados Node 24 + tsx em tools/dataset; sem backend HTTP
status: spec
prd_source: PRD_berry-mutations.md @ 62ac25dcb0b5
---

# SPEC - berry-mutations (cruzamento de bagas na pagina do item e tag/filtro de origem na listagem)

Desenho tecnico (COMO) e plano executavel. Escrito para agentes de implementacao com contexto limpo que terao so este SPEC, o PRD (rev 2), o CONTEXT e o UISPEC. Todo caminho de arquivo a MODIFICAR foi conferido no disco em 2026-09-30; toda linha citada foi conferida por Read/Grep no HEAD `bc113bd9`. Arquivos marcados "criar" ainda nao existem.

Revisao 2 (2026-09-30, forge-review: 5 WARNING, 3 NIT): momento do sorteio corrigido para quando a arvore floresce (secao 2.4 item 5, `ip.mut.how`, assuncao 1); tag de origem mantida como wrapper `span.item-origins` e UISPEC revisado (rev 3, hash no baseline); excecao explicita de `LabelChips` nas linhas `berryWorld`/`berryGrowth`; chance com `{" "}` e asserts por partes (F1.4); teto efetivo do `items.json` = assert existente `join.test.ts:322`; props `items`/`lang` do `BerryObtainRow` so a partir de F1.4.

Convencoes de leitura e regras fixas:
- `ROOT` = `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex` (as listas **Files** trazem sempre o caminho absoluto completo).
- Identificadores de codigo em INGLES (camelCase/PascalCase; `data-*` e classes CSS em ingles), espelhando o projeto (CONTEXT `code_identifier_language: en`). Comentarios de codigo em pt-BR sem acento. Texto de UI so em `src/i18n/messages/*.ts` (PT com acento, EN).
- PROIBIDO o caractere travessao (em dash, U+2014) em qualquer texto gerado (codigo, comentario, string, commit, i18n). O lint do projeto ja rejeita.
- Commits: Conventional Commits em pt-BR sem acento, no estilo do `git log` (`feat(data): ...`, `feat(item): ...`, `test(e2e): ...`), um commit atomico por feature, SEM linha `Co-Authored-By`. Nunca `git push` nem merge sem o Pontin autorizar. Todo artefato `.forge` e versionado (inclusive capturas `after-*`).
- Playwright SEMPRE headless, sem `slowMo`, sem `waitForTimeout`/sleep (auto-wait, `expect.poll`, `settle`).
- ESCOPO FECHADO (Pontin): so o que esta na IDEA secoes 2 e 3 e no PRD. Tudo aditivo. A unica mudanca de conteudo existente e o "Plantavel" das 70 bagas (apricorns e mints nao mudam). Nenhuma refatoracao, nenhuma "melhoria" incidental. Teste existente so muda no assert diretamente afetado pela correcao aprovada (lista exata na secao 2.6); nenhum assert e afrouxado.

---

## 1. Baseline (ancora de drift)

- `HEAD`: `bc113bd91c43` (branch `feature/berry-mutations`, base `main` `3134cd43`).
- PRD: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/PRD_berry-mutations.md` = `62ac25dcb0b5` (rev 2)
- CONTEXT: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/CONTEXT_berry-mutations.md` = `5328d71ac277`
- UISPEC: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/UISPEC_berry-mutations.md` = `97e1761bd71a` (revisao 3: anatomia da tag de origem alinhada a F2.1; as 3 decisoes de posicionamento da revisao do UISPEC estao na secao 2.4 itens 6, 9 e 10)
- IDEA: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/IDEA_berry-mutations.md` = `addbd84d16af`
- LESSONS: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/LESSONS.md` = `14c5e450e8e9`

Arquivos de codigo de que este SPEC depende (`git hash-object`, 12 chars):

| arquivo (relativo a ROOT) | hash |
|---|---|
| tools/dataset/src/items/berries.ts | 41c2da634ae8 |
| tools/dataset/src/items/stage.ts | abd06cd97d56 |
| tools/dataset/audit/expected.ts | d1d1e9bf23a2 |
| tools/dataset/audit/compare.ts | a6b180a2fa9f |
| tools/dataset/audit/AUDIT_REPORT.md | 3b976a03948c |
| tools/dataset/README.md | f46af711b5fd |
| src/data/types.ts | c0447feede54 |
| src/data/schemas.ts | f45f4d4a1cdc |
| src/screens/Item/ItemScreen.tsx | 0a6b3b7ea0bc |
| src/screens/Item/item-page-model.ts | ff300ec052f5 |
| src/screens/Item/BaitParts.tsx | bc79a5c3ccee |
| src/screens/Item/item.css | bae77ab12406 |
| src/screens/Detail/ItemLink.tsx | d34132bea534 |
| src/i18n/messages/item.ts | 4a2d7a711adb |
| src/i18n/messages/items.ts | b812514e0ca7 |
| src/screens/Items/ItemsScreen.tsx | 7e26276f00e1 |
| src/screens/Items/item-model.ts | cf7be65da6e8 |
| src/screens/Items/items.css | d8af84462afa |
| src/navigation/types.ts | 9f36a8ecd8d6 |
| src/components/SegmentedControl.tsx | fcdbaa78eea6 |
| src/components/EmptyState.tsx | 03531ebfc7db |
| tests/e2e/item.spec.ts | bb60e2b816bb |
| tests/e2e/items.spec.ts | b3a7c66adccc |
| tests/e2e/item-obtain-v2.spec.ts | 1c97fc59c3ab |
| tests/e2e/pwa-offline.spec.ts | d384d2c220e6 |
| tests/unit/ui-screens/item-screen.test.tsx | 9e719238c990 |
| tests/unit/ui-screens/items-screen.test.tsx | a01494e5ab80 |
| tests/unit/ui-screens/items-model.test.ts | 3eba150aa913 |
| tests/unit/ui-screens/item-link-missing.test.tsx | 8b0ff2932f92 |
| tests/unit/ui-screens/item-obtain-sources.test.tsx | f62e14a8838a |
| tests/unit/ui-screens/item-obtain-v2.test.tsx | e651cea8caf8 |
| tests/unit/ui-screens/trainers-screen.test.tsx | a9227ceda714 |
| tests/unit/ui-screens/item-page.test.ts | 6c1dd722c3ea |
| tests/unit/data/published-schemas.test.ts | 125790872bfc |
| tests/unit/dataset/join.test.ts | 81446160684e |
| tests/unit/dataset/audit.test.ts | a1408b894103 |
| public/data/current.json | 03675d7823dc |
| data-source/atm-1.3.0/MANIFEST.json | 3bd0ac51179c |

Medidas de partida (dataset publicado `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512`): `items.json` = 1.499.586 bytes, 951 itens, 70 com `category: "berry"` (todas `cobblemon:<nome>_berry`), 110 com rota `plantable` (70 bagas + 40 apricorns/mints). Snapshot: 70 arquivos em `data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/berries/`, identicos byte a byte aos do jar real da instancia (`diff -rq` em 2026-09-30); `kubejs/data/cobblemon/` da instancia nao tem `berries/`.

---

## 2. Design Overview

### 2.1 Abordagem em uma frase

O pipeline passa a ler `spawnConditions` e `mutations` dos 70 arquivos `data/cobblemon/berries/*.json` e publica, em cada baga do `items.json`, um campo novo `berry` com o spawn real no mundo, os pares que geram a baga (deduplicados) e os cruzamentos em que ela e ingrediente; o app deriva disso, com funcoes puras, a tag/filtro de origem da listagem e as linhas novas da pagina do item, sem tocar no que ja existe fora do "Plantavel" das bagas.

### 2.2 Fluxo de dados

```
data/cobblemon/berries/<x>_berry.json (jars obrigatorios, ultimo vence)
  preferredBiomeTags + favoriteMulches --> collectBerryPlantable (INALTERADO) --> rota obtain "plantable" (INALTERADA)
  spawnConditions + mutations ----------> collectBerryOrigins (NOVO, berries.ts) --> ItemInfo.berry (NOVO, depois de bait)
                                                   |
public/data/<versao nova>/items.json (zod estrito em src/data/schemas.ts)
                                                   |
src/screens/Items/item-model.ts      berryOrigins / filterByOrigin --> ItemsScreen: tag no card + filtro (SegmentedControl)
src/screens/Item/item-page-model.ts  pageObtainRoutes / berryObtainExtras / groupMutationPairs / groupMutationUses / berryWorldBiomes
                                                   +--> ItemScreen + BerryParts.tsx: linhas novas em .item-obtain e no UsedIn
```

### 2.3 Mudanca no modelo de dados (resumo; contrato exato na secao 5)

- `ItemInfo` ganha `berry: ItemBerry | null` (ultima chave, depois de `bait`). Nao nulo SO nos ids que tem arquivo em `data/cobblemon/berries/` (as 70 bagas). `null` em todo o resto (apricorns, mints, iscas nao-baga etc.).
- Nenhum campo existente muda. A rota `plantable` das bagas continua publicada exatamente como hoje (`biomeTags` = `preferredBiomeTags`, `mulches` = `favoriteMulches`): e ela que alimenta "Cresce melhor em" (RF-35).
- A classificacao de origem NAO e publicada como campo separado: e derivada por UMA funcao pura do proprio `item.berry` (Mutacao = `mutationPairs.length > 0`; Mundo = `spawn.length > 0`), usada pela listagem E pela pagina (RF-26: uma so regra).

### 2.4 Decisoes-chave

1. **Contrato = campo novo `ItemInfo.berry`, nao `kind` novo em `obtain`** (CONTEXT secao 8 ponto 1). Motivo: o bloco precisa de 3 conjuntos (spawn, pares, usos) e o caminho inverso nao e rota de obtencao; um `kind` novo mudaria o `switch` de `ObtainRow` e contagens de rotas de itens que nao sao alvo. Precedente direto: `ItemInfo.bait` (spawn-bait).
2. **Pares deduplicados por par nao ordenado no pipeline** (RF-02/RF-20). Para cada arquivo A e cada entrada `mutations[B] = C`: par canonico `{ a, b }` com `a` < `b` (comparacao de string por code unit, `x < y ? -1 : x > y ? 1 : 0`, sem `localeCompare`); guardado em C uma vez por chave `a|b`. Os usos derivam dos PARES (nao de cada lado do arquivo): cada par `{a,b}` de C gera `{ partner: b, result: C }` em a e `{ partner: a, result: C }` em b, dedupe pela chave `partner|result`. Ordenacao publicada: `mutationPairs` por `a` depois `b`; `mutationUses` por `partner` depois `result` (mesmo comparador). Assim a saida e deterministica e simetrica mesmo se um arquivo futuro vier assimetrico (hoje 0 assimetrias em 154 entradas; aviso `W_BERRY_MUTATION_ASYMMETRIC` se aparecer, o par entra do mesmo jeito).
3. **Spawn resolvido no pipeline** (RF-14/RF-15, LESSONS "variantes de campo"). Grep nos 70 arquivos: as unicas chaves ligadas a origem sao `spawnConditions` e `mutations` (sem forma singular nem variante de nome); `spawnConditions[].variant` tem 3 valores (`cobblemon:preferred_biome` 28, `cobblemon:all_biome` 2, `cobblemon:specific_biome` 1), com chaves `variant`, `minGroveSize`, `maxGroveSize` e `biome`. Viram `variant` camelCase e `biomeTags` ja resolvido:
   - `preferred_biome` -> `{ variant: "preferredBiome", biomeTags: <preferredBiomeTags da baga> }` (a classe `PreferredBiomeCondition.canSpawn` do jar le `Berry.getPreferredBiomeTags()`: conferido por `javap` no jar real em 2026-09-30);
   - `all_biome` -> `{ variant: "allBiome", biomeTags: [] }`;
   - `specific_biome` -> `{ variant: "specificBiome", biomeTags: [<campo biome>] }` (e uma `TagKey<Biome>` no jar: `SpecificBiomeCondition.biome`; Liechi = `cobblemon:is_mirage_island`, rotulo ja existente em `biomes.json` `#cobblemon:is_mirage_island` = "Mirage Ilha"/"Mirage Island").
   Aceita `variant` com ou sem namespace `cobblemon:`. Variante desconhecida = entrada pulada + aviso `W_BERRY_SPAWN_UNKNOWN`; `specific_biome` sem `biome` string = pulada + `W_BERRY_SPAWN_BIOME_MISSING`. `minGroveSize`/`maxGroveSize` NAO sao publicados (fora do escopo).
4. **Classificacao derivada no app com uma unica funcao** `berryOrigins(item)` em `src/screens/Items/item-model.ts`: `[]` se `item.berry` e nulo; senao, na ordem fixa `["mutation", "world"]`, inclui `"mutation"` se `berry.mutationPairs.length > 0` e `"world"` se `berry.spawn.length > 0`. Resultado atual derivado dos arquivos: 30 so "world", 39 so "mutation", 1 (Liechi) os dois, 0 sem nenhum (o teste deriva do pack, nunca desta frase). O `ItemCard` (memo) calcula a tag so a partir de `item`: nenhuma prop nova por card.
5. **Mecanica = texto fixo PT/EN no dicionario** (RF-05/06/07, RNF-13). Fonte conferida por `javap -c -p` nas classes do jar real `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar` em 2026-09-30, e wiki oficial (pagina "Berry Tree"):
   - `com/cobblemon/mod/common/block/BerryBlock.determineMutation`: percorre `lookupDirections` = `setOf(NORTH, EAST, WEST, SOUTH)` (4 vizinhos ortogonais, sem diagonal); cada vizinho que forma par entra no conjunto oferecido (evento `BERRY_MUTATION_OFFER`); chance base `125`; se o mulch da arvore e `MulchVariant.SURPRISE` a chance vira `125 * 4 = 500` (e o mulch perde 1 de duracao); sorteio `random.nextInt(1000) < chance` (125/1000 = 12,5%; 500/1000 = 50%); se passar, uma mutacao do conjunto e sorteada e `BerryBlockEntity.mutate` troca UM growth point (uma fruta) da arvore pela baga resultante.
   - `BerryBlock.growHelper` (codigo-fonte `BerryBlock.kt`, conferido no bytecode) chama `determineMutation` quando a idade atual e `MATURE_AGE` (3) e a arvore passa para `FLOWER_AGE` (4), isto e, quando a arvore FLORESCE; os frutos so aparecem em `FRUIT_AGE` (5); `BerryBlockEntity.refresh` volta a idade para 3 depois da colheita. Ou seja: 1 sorteio por ciclo, cada vez que a arvore floresce (a primeira vez e de novo depois de cada colheita). O texto do app diz "por colheita" (PRD RF-06) e a explicacao detalha o momento; ver `[ASSUMPTION]` 1 na secao 9.
   - Surprise Mulch: item `cobblemon:surprise_mulch` existe no `items.json` ("Adubo Surpresa"/"Surprise Mulch", rotas craftable + structureLoot): entra como `ItemLink` (RF-07).
6. **Pagina do item: tudo dentro dos paineis existentes, sem painel novo** (decisao da revisao do UISPEC, orquestrador 2026-09-30). `BaitEffectsPanel`, a ordem dos paineis e os `--i` dos paineis NAO mudam.
   - Em `.item-obtain`, para item com `berry` nao nulo: a rota `plantable` sai da posicao dela; as demais rotas existentes ficam na mesma ordem; DEPOIS delas entram, nesta ordem e so quando se aplicam, as linhas `berryWorld` ("Encontrada no mundo"), `berryGrowth` ("Cresce melhor em") e `mutation` ("Como cruzar"). Para item com `berry === null` (apricorn, mint, qualquer outro) o painel e identico ao de hoje (mesmas rotas, mesma ordem, mesmo `data-row`).
   - Em `UsedIn` (`.item-used`): nova linha `mutationUses` ("Usada em cruzamento") DEPOIS de todas as linhas existentes (evolutions, fossils, forms, ball, effect).
   - Exemplo trabalhado (posicional, dados atuais): Occa hoje `[craftable, drop, plantable, structureLoot]` (4 `.ob-row`) -> depois `[craftable, drop, structureLoot, berryWorld, berryGrowth]` (5; Occa nao e resultado de par). Sitrus: rotas atuais sem `plantable` + `[berryGrowth, mutation]`. Liechi: rotas atuais sem `plantable` + `[berryWorld, berryGrowth, mutation]`. Eggant hoje `[craftable, plantable]` -> `[craftable, berryGrowth, mutation]`. Red Apricorn: identico ao de hoje.
7. **Lista longa sem colapso** (RF-08/RF-22; resolve o `CappedList` do UISPEC). Pares e usos NAO passam por `CappedList`/`capList`/`.ob-more`: todos os chips ficam no DOM, em `flex-wrap` com `min-width: 0` e `overflow-wrap: anywhere`, no mesmo visual de pilula ja usado em `.pot-ing`/`.mon-chip` (classe propria `mut-berry`). Para nao repetir a baga fixa 18 vezes, os pares sao AGRUPADOS por um parceiro comum (regra do item 8), que e exatamente a forma dos exemplos do PRD ("Oran + (Aspear, Cheri, ...)", "Hopo + (18 bagas)").
8. **Regras de agrupamento (puras, `item-page-model.ts`)**:
   - `groupMutationPairs(pairs)`: enquanto sobrar par, escolhe o id que aparece em MAIS pares restantes (empate: menor id pelo comparador do item 2); o grupo e `{ fixed: <esse id>, partners: <o outro id de cada par que o contem, ordenados pelo comparador> }`; remove esses pares; repete. Exemplos (dados atuais): Lum `[{fixed: oran, partners: [aspear, cheri, chesto, pecha, rawst]}]`; Figy (cheri+persim, empate 1-1) `[{fixed: cheri, partners: [persim]}]`; Enigma `[{fixed: hopo, partners: <18 ids>}]`; Liechi `[{fixed: kelpsy, partners: [pamtre]}]`. Hoje todo resultado cabe em 1 grupo (40/40), mas a regra cobre N grupos.
   - `groupMutationUses(uses)`: agrupa por `result` (grupos ordenados por `result`, parceiros ordenados), `{ result, partners }`. Exemplos: Cheri `[{result: figy, partners: [persim]}, {result: lum, partners: [oran]}]`; Oran `[{result: leppa, partners: [bluk, nanab, pinap, razz, wepear]}, {result: lum, partners: [aspear, cheri, chesto, pecha, rawst]}]`; Hopo `[{result: enigma, partners: <18>}]`; Lum `[{result: hopo, partners: [leppa]}, {result: sitrus, partners: [aguav, figy, iapapa, mago, wiki]}]`.
   - Render: grupo com 1 parceiro = "Fixa + Parceira" / "+ Parceira = Resultado"; grupo com 2+ parceiros ganha o texto "uma destas:" antes da lista. Todo nome de baga e `ItemLink` (RF-03/RF-04/RF-46).
9. **Tag de origem no card** (decisao da revisao do UISPEC): elemento NOVO `span.item-origins` como ULTIMO filho do grid `.item-names` (linha propria, abaixo de `.item-name`/`.item-alt`), com um `span.item-origin[data-origin]` por origem. `.item-tag` fica intocado como filho direto de `.item-names` (texto, posicao e DOM iguais; `items.spec.ts:72-76` mede isso). Nenhum wrapper em volta de `.item-tag`.
10. **Filtro de origem** (decisao da revisao do UISPEC): `SegmentedControl` (`className="seg-tabs item-origin-filter"`, padrao de `BallFilters` em `BallsScreen.tsx:79-93`) em linha PROPRIA dentro de `.item-top`, entre `.item-tools` e `#item-tabs` (renderizado no topo de `ItemsBody`); NAO dentro de `.item-tools`. Opcoes `all` / `mutation` / `world` ("Todos"/"Mutação"/"Mundo"). Estado em `UiStateMap["items"].origin` (default `"all"`), escrito com `updateUi<"items">({ origin })` e lido com `useScreenUi("items", "origin")`: por viver na entrada da pilha, volta ao usar Voltar (RF-32). Clicar numa aba ou buscar NAO mexe no filtro (codigo de `ItemTabs` e `ListSearch` inalterado).
    - Regra do resultado (RF-30/31/33): `shown = filterByOrigin(filterItems(items, tab, query, lang), origin)`; `filterByOrigin(list, "all")` devolve o MESMO array (listagem identica a de hoje); com `mutation`/`world` devolve `list.filter((it) => berryOrigins(it).includes(origin))`, preservando a ordem de `filterItems`. Exemplos (dados atuais): aba Berries + Mutação = 40 cards (39 + Liechi); aba Berries + Mundo = 31 (30 + Liechi); aba Iscas + Mutação = os mesmos 40 (as bagas estao na aba Iscas pela tag `bait`); aba Medicina + Mutação = 0 -> `EmptyState` `item.none` (sem texto de busca); busca "ber" + Mundo = so bagas de Mundo cujo nome contem "ber"; valor desconhecido em `ui.origin` = tratado como `"all"`.
11. **Janela quebrada planejada** (LESSONS 2026-09-29): B1.1 torna `berry` obrigatorio no schema. De B1.1 ate B2.2 (republicacao): `tests/unit/data/published-schemas.test.ts` (le `public/data/current.json`, linhas 25-26 e 40) FALHA e fica excluido; `tests/unit/dataset/join.test.ts` NAO e excluido (roda o proprio pipeline em pasta temporaria, linha 57, e valida o que gera); o app e todo o e2e nao abrem (os loaders rejeitam o `items.json` publicado sem `berry`) e nao sao rodados. O Frontend so comeca depois de B2.2 verde (CA-37).

### 2.5 Convencao de identificadores (obrigatoria)

Ingles: tipos `ItemBerry`, `BerrySpawn`, `BerrySpawnVariant`, `BerryMutationPair`, `BerryMutationUse`; pipeline `collectBerryOrigins`, `buildBerryOrigins`; app `berryOrigins`, `BerryOrigin`, `OriginFilter`, `ORIGIN_FILTERS`, `isOriginFilter`, `filterByOrigin`, `pageObtainRoutes`, `berryObtainExtras`, `BerryObtainExtra`, `groupMutationPairs`, `groupMutationUses`, `berryWorldBiomes`, `SURPRISE_MULCH_ID`, componentes `BerryObtainRow`, `BerryUsesRow`, `OriginFilter`. Valores JSON `preferredBiome`/`allBiome`/`specificBiome`. `data-row`: `berryWorld`, `berryGrowth`, `mutation`, `mutationUses`. Classes CSS novas com prefixo `mut-` (pagina) e `item-origin` (listagem); atributos `data-origin`, `data-mut-fixed`, `data-mut-result`, `data-mut-chance`. Chaves i18n `ip.berryWorld*`, `ip.berryGrowth*`, `ip.mut.*` (em `item.ts`) e `item.origin.*` (em `items.ts`). Avisos do pipeline `W_BERRY_*`.

### 2.6 Testes existentes afetados (lista exata)

Unica mudanca de ASSERT existente, causada pela correcao aprovada do "Plantavel" (RF-47):
- `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/item.spec.ts:259`: `expect(page.locator(".item-obtain .ob-row")).toHaveCount(4)` passa a `toHaveCount(5)` (Occa: a linha `plantable` vira `berryWorld` + `berryGrowth`; Occa nao e resultado de par, entao sem linha `mutation`). Feita em F1.3, no mesmo commit que causa a mudanca.

NAO mudam (conferido): `tests/unit/ui-screens/item-screen.test.tsx:124` e `:128` (a fixture `fire_stone` tem `berry: null`, entao as linhas `plantable` seguem iguais; o PRD RF-47 previa ajuste aqui, mas pelo desenho acima ele nao e afetado e por isso NAO se mexe); `items.spec.ts:72-76` (`.item-tag` intocado); `items.spec.ts:176,181` (`.item-tag` de iscas e da Occa); `item-obtain-v2.spec.ts:97` (item mock sem `berry`); `detail.spec.ts` (bloco Iscas).

Mudancas de FIXTURE (sem tocar em assert), obrigatorias pelo contrato: acrescentar `berry: null` ao lado de `bait: null` em `item-link-missing.test.tsx:22`, `item-obtain-sources.test.tsx:21`, `item-obtain-v2.test.tsx:21`, `item-screen.test.tsx:21`, `items-screen.test.tsx:9`, `trainers-screen.test.tsx:90`, `tests/e2e/item-obtain-v2.spec.ts:29` (B1.1).

## 2b. Mapa de ciclo de vida das entidades

| Entidade | Create (tela -> endpoint) | List | Edit (read-back -> tela) | Delete | Notes |
|---|---|---|---|---|---|
| `ItemInfo.berry` (spawn, pares, usos) | N/A: gerado pelo pipeline (`collectBerryOrigins`) e publicado em `public/data/<versao>/items.json`; nao ha criacao pelo usuario | Listagem de itens (`ItemsScreen`, tag e filtro) e pagina do item (`ItemScreen`) leem `loadItems()` | N/A: somente leitura, sem tela de edicao | N/A | Contrato de dados na secao 5; sem endpoint HTTP |
| Filtro de origem (`UiStateMap["items"].origin`) | `OriginFilter` -> `updateUi<"items">({ origin })` (store em memoria, sem rede) | `ItemGrid` le com `useScreenUi("items", "origin")` | Read-back: a mesma entrada da pilha de navegacao guarda `origin`; ao voltar (`goBack`) a entrada restaurada devolve o valor e o `SegmentedControl` pre-seleciona (`aria-pressed`) | Voltar a `"all"` pelo proprio controle; entrada nova de navegacao comeca em `"all"` (`defaultUi`) | Nao persistido em IndexedDB (a pilha e so em memoria, `navigation-store.ts`) |

---

## 3. Trade-offs e alternativas rejeitadas

| Decisao | Alternativa rejeitada | Por que |
|---|---|---|
| Campo `ItemInfo.berry` | Novo `kind: "mutation"` em `obtain` | Nao cobre o caminho inverso nem o spawn; mexeria no `switch` de `ObtainRow` e em contagens de rotas; o precedente (`bait`) e campo proprio. |
| Classificacao derivada de `berry` por funcao unica | Publicar `origins: ["mutation","world"]` no item | Duplicaria a informacao (pares e spawn ja estao la) e abriria espaco para pagina e listagem divergirem (RF-26). |
| Pares E usos publicados por baga | So `mutations` cru e indice invertido no app | Cada pagina e card ficam autocontidos (sem indice global); custo ~33 KB (+2,24%, secao 5.4). |
| Spawn resolvido (`biomeTags`) no pipeline | Publicar `variant` cru e resolver `preferred_biome` no app | O app nao conhece a semantica do jogo; a resolucao foi conferida no bytecode e fica num lugar so, auditado de forma independente. |
| Linhas novas dentro de `.item-obtain` e `UsedIn` | Painel novo "Como cruzar" | Decisao da revisao do UISPEC (orquestrador): sem painel novo, ordem de paineis intacta. |
| Linhas de baga DEPOIS das rotas existentes | Split do "Plantavel" na posicao original | Decisao da revisao do UISPEC ("AFTER the existing rows"); as rotas existentes mantem a ordem relativa. |
| Grupos por parceiro comum, sem colapso | `CappedList` (limite 12, "e mais N") | RF-08 exige todos os pares acessiveis; o agrupamento reproduz os exemplos do PRD e evita repetir "Hopo" 18 vezes. |
| `collectBerryOrigins` separado, lendo os arquivos de novo | Refatorar `collectBerryPlantable` para ler uma vez | Regra "sem refatoracao": `listJars()` devolve so os jars obrigatorios (`source-reader.ts:78`), a releitura de 70 JSON pequenos e barata; `collectBerryPlantable` fica byte a byte igual. |
| Filtro via `SegmentedControl` + `updateUi` | Chips novos, aba nova ou filtro dentro de `.item-tools` | Reuso do componente (teclado e `aria-pressed` prontos); sem aba nova (UISPEC Don't); `.item-tools` fica so com busca e `TermsToggle`. |
| Texto da chance fixo no dicionario (12,5% / 50%) | Calcular com `chanceLabel` | `chanceLabel` usa ponto sempre ("12.5%"); o PRD pede "12,5%" em PT (RF-41). Valor fixo do jogo, igual para todas as bagas. |

## 4. Riscos e mitigacoes

| Risco | Impacto | Mitigacao |
|---|---|---|
| Schema estrito + dataset velho (janela quebrada) | App, e2e e `published-schemas.test.ts` quebrados de B1.1 a B2.2 | Secao 2.4 item 11: exclusao explicita so de `published-schemas.test.ts`, sem e2e na janela, Frontend so apos B2.2; backend anota no checklist e no HANDOFF. |
| Flake preexistente confundido com regressao | Retrabalho ou assert afrouxado | LESSONS: a suite completa roda UMA vez antes de implementar (baseline do orquestrador em worktree isolado, resultado no STATE); o backend le o STATE antes de B1.1; flake se corrige pela causa. |
| Contagem de `.ob-row` mudar alem da Occa | Regressao em e2e | Split so para `berry` nao nulo; unico assert afetado listado (secao 2.6); T1.5 roda `item.spec.ts`, `item-obtain-v2.spec.ts`, `items.spec.ts`, `detail.spec.ts` inteiros. |
| Tag nova sobrepor texto ou mudar a medida de `.item-tag` | e2e F9.2 e nao sobreposicao | Elemento proprio no fim de `.item-names`, `.item-tag` intocado; T1.5 mede `.item-tag` acima do nome em card de baga e `expectNoOverlap` na aba Berries (360/390/1280, PT/EN, Liechi com 2 tags). |
| Card mais alto com `content-visibility` (`contain-intrinsic-size: auto 110px`) | Salto de scroll | Tag de 9,5px numa linha (+~18px so nas 70 bagas); T1.5 roda os testes existentes de scroll/restore (`items.spec.ts:65-115`). |
| Filtro no mobile (`.app.mobile .seg-tabs` com margem `0 -16px 14px`) | Sobreposicao ou rolagem vertical | CSS escopado `.app.mobile .items-screen .item-origin-filter { margin-bottom: 0; }`; T1.5: `expectNoOverlap(".items-screen .item-top")` (teste existente) e sem rolagem vertical do filtro. |
| Texto da mecanica ("por colheita") x codigo (sorteio quando a arvore floresce) | Informacao imprecisa | Explicacao cita "cada vez que uma delas floresce (a primeira vez e de novo depois de cada colheita)"; registrado como `[ASSUMPTION]` 1. |
| Paridade instancia x snapshot | RF-37 | Berries do snapshot identicos ao jar real (conferido); B2.2 roda os dois e compara `items.json` (sha256). Nenhuma copia para o snapshot prevista. |
| Crescimento do `items.json` | RNF-01 | Estimativa por prototipo no snapshot: +33.572 bytes (1.533.158, +2,24%); teto <= 1.659.908 bytes (teto EFETIVO: assert existente `tests/unit/dataset/join.test.ts:322`, mais apertado que os +15% = 1.724.523 do PRD RNF-01), conferido em B2.2 e T1.2. |

---

## 5. Contrato de dados (no lugar de endpoints)

**Endpoints HTTP: N/A.** O site e SPA estatico sem backend (CONTEXT secao 1): esta feature nao cria nem modifica endpoint. O CONTRATO e o JSON publicado em `public/data/<datasetVersion>/items.json`, validado por zod na carga (`src/data/loaders.ts` -> `itemsFileSchema`). Produzido por `tools/dataset/src/items/stage.ts` (com `collectBerryOrigins` de `tools/dataset/src/items/berries.ts`); tipos em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts` (o pipeline importa via `../../../../src/data/types`), schemas em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts`. Consumidores: `ItemsScreen`/`item-model.ts` (tag e filtro), `ItemScreen`/`BerryParts.tsx`/`item-page-model.ts` (linhas da pagina), auditoria `tools/dataset/audit/compare.ts`, testes `published-schemas.test.ts` e `join.test.ts`.

### 5.1 Tipos novos (em `src/data/types.ts`)

Inserir depois de `ItemUsedIn` (fecha na linha 490) e antes de `export interface ItemInfo` (linha 492):

```ts
/** berry-mutations: variante de spawn natural da baga (spawnConditions[].variant sem namespace, em camelCase). */
export type BerrySpawnVariant = "preferredBiome" | "allBiome" | "specificBiome";

export interface BerrySpawn {
  variant: BerrySpawnVariant;
  /** preferredBiome = preferredBiomeTags da baga; specificBiome = [biome] (tag); allBiome = [] */
  biomeTags: string[];
}

/** Par nao ordenado que gera a baga (a < b por code unit). */
export interface BerryMutationPair {
  a: string;
  b: string;
}

/** Cruzamento em que a baga e ingrediente: esta baga + partner = result. */
export interface BerryMutationUse {
  partner: string;
  result: string;
}

/** Origem e cruzamentos da baga (data/cobblemon/berries/<id>.json); null em todo item sem esse arquivo. */
export interface ItemBerry {
  /** spawnConditions resolvidas; [] = nao nasce no mundo */
  spawn: BerrySpawn[];
  /** pares que geram esta baga, cada par uma vez, ordenados por a e depois b */
  mutationPairs: BerryMutationPair[];
  /** cruzamentos em que esta baga entra, ordenados por partner e depois result */
  mutationUses: BerryMutationUse[];
}
```

Em `ItemInfo` (linhas 492-510), depois de `bait: ItemBait | null;` (linha 509):
```ts
  /** berry-mutations: origem e cruzamentos; null quando o item nao tem arquivo em data/cobblemon/berries/ */
  berry: ItemBerry | null;
```

### 5.2 Schema zod (em `src/data/schemas.ts`)

Depois de `potRecipeSchema` (linha 250), antes de `itemInfoSchema` (linha 252):

```ts
/** berry-mutations: origem e cruzamentos da baga (objetos estritos). */
const itemBerrySchema = z.object({
  spawn: z.array(z.object({ variant: z.enum(["preferredBiome", "allBiome", "specificBiome"]), biomeTags: z.array(z.string()) }).strict()),
  mutationPairs: z.array(z.object({ a: z.string(), b: z.string() }).strict()),
  mutationUses: z.array(z.object({ partner: z.string(), result: z.string() }).strict()),
}).strict();
```

Em `itemInfoSchema`, depois da linha 313 (`bait: ...nullable(),`) e antes do `});` da linha 314: `berry: itemBerrySchema.nullable(),`. Obrigatorio (nao `.optional()`): todo item publica a chave.

### 5.3 Exemplos reais esperados (snapshot atm-1.3.0; gerados por prototipo da regra em 2026-09-30)

`items.json["cobblemon:cheri_berry"].berry`:
```json
{"spawn":[{"variant":"preferredBiome","biomeTags":["cobblemon:is_plains"]}],"mutationPairs":[],"mutationUses":[{"partner":"cobblemon:oran_berry","result":"cobblemon:lum_berry"},{"partner":"cobblemon:persim_berry","result":"cobblemon:figy_berry"}]}
```
`items.json["cobblemon:lum_berry"].berry`:
```json
{"spawn":[],"mutationPairs":[{"a":"cobblemon:aspear_berry","b":"cobblemon:oran_berry"},{"a":"cobblemon:cheri_berry","b":"cobblemon:oran_berry"},{"a":"cobblemon:chesto_berry","b":"cobblemon:oran_berry"},{"a":"cobblemon:oran_berry","b":"cobblemon:pecha_berry"},{"a":"cobblemon:oran_berry","b":"cobblemon:rawst_berry"}],"mutationUses":[{"partner":"cobblemon:aguav_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:figy_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:iapapa_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:leppa_berry","result":"cobblemon:hopo_berry"},{"partner":"cobblemon:mago_berry","result":"cobblemon:sitrus_berry"},{"partner":"cobblemon:wiki_berry","result":"cobblemon:sitrus_berry"}]}
```
`items.json["cobblemon:liechi_berry"].berry`:
```json
{"spawn":[{"variant":"specificBiome","biomeTags":["cobblemon:is_mirage_island"]}],"mutationPairs":[{"a":"cobblemon:kelpsy_berry","b":"cobblemon:pamtre_berry"}],"mutationUses":[]}
```
`items.json["cobblemon:oran_berry"].berry.spawn` = `[{"variant":"allBiome","biomeTags":[]}]` com 10 `mutationUses` (5 com `result` leppa, 5 com lum). `items.json["cobblemon:figy_berry"].berry.mutationPairs` = `[{"a":"cobblemon:cheri_berry","b":"cobblemon:persim_berry"}]`. `items.json["cobblemon:red_apricorn"].berry` = `null`; `items.json["cobblemon:adamant_mint"].berry` = `null`; `items.json["cobblemon:potion"].berry` = `null`.

Totais derivados dos 70 arquivos (os testes recalculam do pack, nunca copiam estes numeros): 70 com `berry` nao nulo; 31 com `spawn` nao vazio (28 `preferredBiome`, 2 `allBiome`: oran, persim; 1 `specificBiome`: liechi); 40 com `mutationPairs` nao vazio; 77 pares no total; 154 usos no total; 56 bagas com `mutationUses`; 14 sem uso (apicot, custap, eggant, ganlon, jaboca, kee, lansat, liechi, maranga, micle, petaya, rowap, salac, starf); maiores listas: enigma com 18 pares (hopo + 18) e hopo com 18 usos.

### 5.4 Formatos EXISTENTES modificados

| Formato | Mudanca | Quem consome |
|---|---|---|
| `ItemInfo` (types.ts:492, schemas.ts:252) | + `berry` (ultima chave) | ItemsScreen (tag/filtro), ItemScreen/BerryParts, auditoria, fixtures de testes |
| `items.json` | +1 chave por item (`"berry":null` em 881 itens; objeto nas 70 bagas); estimativa +33.572 bytes (1.533.158, +2,24%); teto <= 1.659.908 bytes (teto EFETIVO: assert existente `tests/unit/dataset/join.test.ts:322`, mais apertado que os +15% = 1.724.523 do PRD RNF-01) | App (loaders), `join.test.ts`, `published-schemas.test.ts` |
| `UiStateMap["items"]` (navigation/types.ts:78, default :114) | + `origin: string` (default `"all"`) | `ItemsScreen` (`OriginFilter`, `ItemGrid`) |
| Rota `plantable` | NENHUMA mudanca no dado (RF-35) | Pagina: para bagas passa a alimentar `berryGrowth` |

## 5b. Dependencias e configuracao

- Nenhuma dependencia nova (icones `Dna`, `Trees`, `Combine` ja existem no `lucide-react` 0.577.0 instalado: `node_modules/lucide-react/dist/esm/icons/{dna,trees,combine}.js` conferidos).
- Nenhuma variavel de ambiente nova. A execucao na instancia real usa o nome ja existente `ATM_INSTANCE_DIR` ou `--instance` (so o nome, sem valor em artefato versionado).
- Nenhuma migracao de banco (nao ha banco). Reversao do dado = `git revert` do commit de republicacao (restaura a pasta do dataset anterior e o `current.json`).
- Snapshot `data-source/`: nada a copiar (os 70 `berries/*.json` ja estao no snapshot e sao identicos ao jar real); `MANIFEST.json` e `data-source/README.md` nao mudam.

## 5c. Matriz de autorizacao

N/A: nao ha endpoint novo nem modificado (secao 5) e o site e publico, sem login, sem papeis e sem recurso por usuario (IDEA secao 5, PRD secao 4). Todo visitante (o unico "papel", nao autenticado) le o mesmo dataset estatico; nao existe risco de IDOR porque nao ha recurso com dono. O unico estado novo (`origin`) vive na memoria da aba do proprio visitante.

---

## 6. Divisao do trabalho

## Backend

"Backend" = pipeline `tools/dataset/` (Node 24 + tsx), contrato em `src/data/` (tipos + zod + fixtures), auditoria `tools/dataset/audit/` e republicacao em `public/data/<versao>/`. Sprints B1 (contrato + pipeline) e B2 (auditoria + republicacao). B1.1 congela o contrato que o Frontend consome.

Pre-condicao obrigatoria (LESSONS, RNF-06): a suite completa (vitest + e2e) roda UMA vez na `main` antes de implementar (o orquestrador esta rodando em worktree isolado; o resultado vai para `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/STATE_berry-mutations.md`). O agente de backend le esse resultado antes de B1.1; falha preexistente listada la e flake, nao regressao desta feature, e so se corrige (pela causa, nunca afrouxando assert) se o orquestrador pedir.

## Frontend

"Frontend" = app React em `src/`: textos i18n, regras puras, linhas novas na pagina do item, tag e filtro na listagem. Referencia visual obrigatoria: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/UISPEC_berry-mutations.md` (secoes 3 a 7; tokens, `Row`/`.ob-row`, `LabelChips`, `ItemLink`, `SegmentedControl`, `EmptyState`) e as capturas `recon-*` em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/ui-refs/`. Nao re-derivar identidade: so variaveis de tema, sem hex novo; texto colorido em `--secondary` repete a troca por `--primary` nos temas green e blue. Sprints F1 (pagina do item) e F2 (listagem). O Frontend so COMECA depois de B2.2 verde.

Sprint final T1: testes (definidos aqui, escritos na etapa de testes).

---

## 7. Sprints

### Regras gerais de toda feature de pipeline (auto-fill `build` / `estrutura` / `outro`)

- **Runtime**: Node >= 24 (`package.json`); rodar com `npm run dataset` (tsx). Sem variavel nova; instancia real so pelo nome `ATM_INSTANCE_DIR` ou `--instance`.
- **Rede**: sempre `--offline` (cache da PokeAPI em `tools/dataset/.cache/pokeapi`); se faltar alguma resposta no cache, rodar sem `--offline` e registrar no checklist.
- **Artefatos**: saidas de teste em `tools/dataset/out/_bm_*` (pasta `out/` ja e gitignored); apagar as pastas `_bm_*` ao terminar a feature. Nunca publicar em `public/` antes de B2.2.
- **Edge cases padrao**: JSON invalido (usar `readJsonEntries`, que ja reporta), arquivo ausente (aviso `W_*`, nunca inventa dado), ordem deterministica (comparador por code unit antes de escrever), mesma saida em snapshot e instancia.
- **Janela quebrada B1.1 -> B2.2** (secao 2.4 item 11): todo "Done when" de B1.x e B2.1 roda `npx vitest run --exclude tests/unit/data/published-schemas.test.ts`; `published-schemas.test.ts` volta e TEM de passar em B2.2; nenhum e2e roda na janela; o agente de backend registra a janela nas notas do checklist e no HANDOFF.
- **Done when (dente)**: pipeline no snapshot em pasta de teste: `npm run dataset -- --offline --out tools/dataset/out/_bm_stage --publish-dir tools/dataset/out/_bm_pub`; arquivos em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/out/_bm_pub/data/<versao>/`.

### Regras gerais de toda feature de frontend (auto-fill da categoria `frontend`)

- **Loading**: a pagina do item so renderiza `ItemBody` com os dados carregados (`PokeballSpinner` antes, `ItemScreen.tsx:459`); a listagem idem (`ItemsScreen.tsx:165`). As linhas novas nao tem carregamento proprio (skeleton N/A: nao ha dado assincrono novo, tudo vem do `items.json` ja carregado).
- **Erro**: falha de `loadItems` ja cai no `InlineError` com retry (pagina `ItemScreen.tsx:455`, listagem `ItemsScreen.tsx:165`); nada novo pode lancar: toda leitura de `item.berry` trata `null` e listas vazias.
- **Vazio**: sem pares = sem linha `mutation`; sem usos = sem linha `mutationUses`; sem spawn = sem `berryWorld`; nunca titulo solto ou linha vazia (RF-11/RF-21). Filtro sem resultado = `EmptyState messageKey="item.none"` existente (RF-33).
- **Offline**: nenhuma chamada de rede nova, nenhuma midia nova (texturas das bagas e da Surprise Mulch ja publicadas).
- **Validacao de entrada**: `ui.origin` desconhecido vira `"all"` (`isOriginFilter`); id de baga fora do `items.json` vira texto simples (`ItemLink`, RF-46).
- **Textos**: todo texto por `t()` (a regra `pontindex/no-literal-jsx-text` rejeita QUALQUER JSXText nao vazio, inclusive "+" e "="); nomes de baga pelo idioma do toggle do card (`useTermsLanguage("itempage")` na pagina, `useTermsLanguage("items")` na listagem, via `ItemLink`/`termPair`); rotulos de bioma por `biomeLabel(b, biomes)[uiLang]`, como a linha `plantable` atual.
- **Tema/mobile**: so variaveis (`--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--secondary`, `--on-secondary`), `flex-wrap`, `min-width: 0`, `overflow-wrap: anywhere`; 360/390/1280 px sem vazamento nem sobreposicao (`expectNoOverlap`, `tests/harness/no-overlap.ts`).
- **Classes proibidas nas linhas `mutation` e `mutationUses` e na tag/filtro da listagem**: `.item-tag`, `.tag`, `.mon-chip`, `.ob-more`, `.ob-entry` (evita mudar contagens e medidas de e2e existentes e garante pares sem colapso). EXCECAO explicita: as linhas `berryWorld` e `berryGrowth` (F1.3) USAM `LabelChips` para os biomas, exatamente como a linha `plantable` de hoje, e portanto contem `.biome`, `.ob-entry` e, so se passar de 12 biomas, `.ob-more` (hoje no maximo 5 biomas por baga). `ItemLink` sempre com `className` explicito (`"mut-berry it-link"`).
- **Done when (dente)**: toda feature de frontend so fica verde depois de renderizada headless: dev server proprio (`npx vite --port 4178 --strictPort`, em background) e um spec TEMPORARIO `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/zz-berry-mutations-capture.spec.ts` (copia `boot`/`openItem`/`settle`/`setLanguage` de `tests/e2e/item.spec.ts:19-92` e `openItems`/`card` de `tests/e2e/items.spec.ts:26-59`), rodado com `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/zz-berry-mutations-capture.spec.ts` (headless, sem slowMo, sem sleep), salvando PNGs `after-<alvo>.png` em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/ui-refs/` para comparar com os `recon-*` do UISPEC (regra do Pontin: mostrar no navegador antes de aprovar). O spec temporario e APAGADO antes do commit (nunca versionado); os PNGs `after-*` sao versionados. Parar o dev server ao terminar.

---

## Backend

### Sprint B1: Contrato e pipeline

- **Descricao**: congela o contrato (`ItemInfo.berry`) e faz o pipeline publicar spawn, pares e usos das 70 bagas.
- **Deliverable (entregavel)**: pipeline no snapshot gera `items.json` com `berry` valido contra o schema e igual aos exemplos da secao 5.3.
- **Risco**: medio (contrato compartilhado; janela quebrada).
- **Prerequisito**: pre-condicao da secao 6 (baseline da suite registrada no STATE). B1.2 depende de B1.1.

#### Feature B1.1: Contrato do dataset (tipo, zod, placeholder e fixtures) `[category: estrutura]`
- **Traces**: RF-34 (forma), RF-39, RNF-01 (forma), RNF-07.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/types.ts` (modificar: tipos novos entre as linhas 490 e 492; campo `berry` depois da linha 509 em `ItemInfo`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/data/schemas.ts` (modificar: `itemBerrySchema` entre as linhas 250 e 252; `berry` depois da linha 313)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts` (modificar: placeholder `berry: null,` depois de `bait: baitOf(entry.id),` linha 219, dentro do objeto `items[entry.id]` das linhas 207-220)
  - fixtures (acrescentar `berry: null,` logo depois de `bait: null,`; nenhum assert muda): `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-link-missing.test.tsx` (linha 22), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-obtain-sources.test.tsx` (linha 21), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-obtain-v2.test.tsx` (linha 21), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-screen.test.tsx` (linha 21, no helper `item()`; a fixture do Oran na linha 59 herda pelo helper), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/items-screen.test.tsx` (linha 9, objeto em linha unica: `..., cooking: null, bait: null, berry: null }`), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/trainers-screen.test.tsx` (linha 90), `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/item-obtain-v2.spec.ts` (linha 29; o mock e validado pelo schema na carga)
- **Steps**:
  1. Colar os tipos da secao 5.1 exatamente (nomes, ordem de campos, comentarios pt-BR sem acento).
  2. Colar o schema da secao 5.2; objetos `.strict()`; `berry` obrigatorio e `.nullable()`.
  3. Placeholder `berry: null` no `stage.ts` (a chave depois de `bait`, ordem = contrato) para o `typecheck` passar; B1.2 troca pelo valor real.
  4. Conferir fixtures com `grep -rn "bait: null" C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests` e acrescentar `berry: null` em cada objeto `ItemInfo` literal (a lista acima e a de 2026-09-30; fixtures que espalham um item real, `...items[x]`, nao mudam).
- **Edge cases**: nenhuma pasta nova (sem conflito de pasta, sem permissao especial); `berry: null` valido; campo extra em `berry`, `spawn[]`, `mutationPairs[]` ou `mutationUses[]` rejeitado (`.strict()`); `variant` fora do enum rejeitado; `.gitignore` nao muda (saidas em `tools/dataset/out/`); README do pipeline atualizado em B1.2 (a forma so fica completa com o dado real).
- **Consumes (contrato)**: nada (define o contrato).
- **Done when**: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde (janela quebrada aberta: `published-schemas.test.ts` le o `items.json` publicado sem `berry` e so volta em B2.2; nenhum e2e roda ate B2.2; anotar no checklist e no HANDOFF); pipeline no snapshot (regra geral) roda sem erro e todo item do `items.json` gerado tem `"berry":null`.
- **Commit**: `feat(data): contrato do berry-mutations (berry no item: spawn, pares e usos de cruzamento)`
- **Rollback**: `git revert <hash>`.

#### Feature B1.2: Origem e cruzamentos das bagas no pipeline `[category: build]`
- **Traces**: RF-01, RF-02, RF-14, RF-15, RF-19, RF-20, RF-26 (dados), RF-34, RF-35, RNF-01, RNF-09.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/berries.ts` (modificar: acrescentar DEPOIS da linha 32, fim do arquivo; `collectBerryPlantable` linhas 17-32 e `BERRIES_PREFIX` linha 6 intocados; novo import de tipo no topo, depois da linha 4)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/src/items/stage.ts` (modificar: import na linha 10; `const berryOrigins = collectBerryOrigins(ctx);` depois da linha 116; valor real no lugar do placeholder da B1.1 junto da linha 219; secao de report depois da linha 247)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/README.md` (secao "## Saida", linha 28: novo item depois da linha 39, "Bagas (berry-mutations, `src/items/berries.ts`)")
- **Steps**:
  1. `berries.ts`: `import type { BerrySpawn, ItemBerry } from "../../../../src/data/types";` (o tipo do report vem de `Pick<PipelineContext, "reader" | "report">`, mesmo padrao de `bait.ts:5-6`).
  2. `const SPAWN_VARIANTS: Readonly<Record<string, BerrySpawn["variant"]>> = { preferred_biome: "preferredBiome", all_biome: "allBiome", specific_biome: "specificBiome" };` e `const byCodeUnit = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);`.
  3. `export function buildBerryOrigins(files: ReadonlyMap<string, Json>, report: PipelineContext["report"]): Map<string, ItemBerry>` (pura, testavel sem leitor), com `files` = id `cobblemon:<nome do arquivo>` -> JSON:
     - para cada id (ordem de `[...files.keys()].sort(byCodeUnit)`) cria `{ spawn: [], mutationPairs: [], mutationUses: [] }`;
     - spawn: para cada entrada de `spawnConditions` (nao array = `[]`): `key = String(e.variant).replace(/^cobblemon:/, "")`; `v = SPAWN_VARIANTS[key]`; sem `v` -> `report.warn("W_BERRY_SPAWN_UNKNOWN", ...)` e pula; `preferredBiome` -> `biomeTags = strings(data.preferredBiomeTags)` (helper `strings` ja existe na linha 10); `allBiome` -> `[]`; `specificBiome` -> `typeof e.biome === "string" ? [e.biome] : ` aviso `W_BERRY_SPAWN_BIOME_MISSING` e pula;
     - pares: para cada arquivo A e cada `[B, C]` de `mutations` (so se for objeto) com `B` e `C` string: se `files.get(B)?.mutations?.[A] !== C` -> `W_BERRY_MUTATION_ASYMMETRIC` (o par entra mesmo assim); se `C` ou `B` nao esta em `files` -> `W_BERRY_MUTATION_UNKNOWN_ID` (o par so e gravado se `C` esta em `files`); `[a, b] = [A, B].sort(byCodeUnit)`; grava `{ a, b }` em C se a chave `a|b` ainda nao existe para C;
     - usos: depois de todos os pares, para cada C e cada `{a, b}`: grava `{ partner: b, result: C }` em a e `{ partner: a, result: C }` em b (so se o dono esta em `files`), dedupe pela chave `partner|result`;
     - ordena `mutationPairs` (por `a`, depois `b`) e `mutationUses` (por `partner`, depois `result`) com `byCodeUnit`.
  4. `export function collectBerryOrigins(ctx: Pick<PipelineContext, "reader" | "report">): Map<string, ItemBerry>`: mesma leitura de `collectBerryPlantable` (para cada `ctx.reader.listJars()`, `readJar(jar, [BERRIES_PREFIX])` + `readJsonEntries`, id `cobblemon:<arquivo>`, ultimo vence) montando `files`, depois `return buildBerryOrigins(files, ctx.report)`.
  5. `stage.ts`: linha 10 vira `import { collectBerryOrigins, collectBerryPlantable } from "./berries";`; `const berryOrigins = collectBerryOrigins(ctx);` depois da linha 116; no objeto do item: `berry: berryOrigins.get(entry.id) ?? null,` (ultima chave, depois de `bait`). Rota `plantable` (linhas 154-160) NAO muda.
  6. Report (depois da linha 247): `ctx.report.section("berries", { items: <n com berry>, withSpawn: <n>, spawnVariants: { preferredBiome, allBiome, specificBiome }, mutationResults: <n com pares>, pairs: <soma>, uses: <soma>, bothOrigins: [ids com pares e spawn] })`.
  7. README: paragrafo com a regra da secao 2.4 itens 2 e 3 (campos, dedupe, ordenacao, variantes, avisos) e a fonte da mecanica (secao 2.4 item 5), dizendo que a chance nao vem de arquivo do pack.
- **Edge cases**: variante desconhecida ou sem `biome` (aviso, pula, nunca inventa); `mutations` ausente/nao objeto (sem pares); valor nao string (ignorado); arquivo de baga sem item no catalogo (nao aparece: `stage.ts` so percorre o catalogo); determinismo (ordem de arquivos e comparador fixos); snapshot x instancia (mesma leitura, arquivos identicos); rede (nenhuma chamada nova); limpeza (`_bm_*` apagadas ao fim).
- **Consumes (contrato)**: `ItemBerry`, `BerrySpawn`, `BerryMutationPair`, `BerryMutationUse` (B1.1, secao 5.1).
- **Done when**: pipeline no snapshot (regra geral); em `tools/dataset/out/_bm_pub/data/<versao>/items.json`: `cobblemon:cheri_berry`, `cobblemon:lum_berry` e `cobblemon:liechi_berry` com `berry` byte a byte igual a secao 5.3; script inline (node) sobre o arquivo: 70 itens com `berry` nao nulo, todos com `category === "berry"`; 31/40/77/154 (spawn/resultados/pares/usos) iguais ao recalculo independente direto dos 70 arquivos do snapshot (o script le `data-source/.../berries/*.json`, nao o pipeline); `tools/dataset/out/_bm_stage/report.json` sem nenhum aviso `W_BERRY_*`; rota `plantable` das 110 com `plantable` identica a do `items.json` publicado atual (comparacao por id); tamanho do `items.json` <= 1.659.908 bytes (teto EFETIVO: assert existente `tests/unit/dataset/join.test.ts:322`, mais apertado que os +15% = 1.724.523 do PRD RNF-01); `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde.
- **Commit**: `feat(dataset): origem e cruzamentos das bagas lidos de berries/*.json (spawnConditions e mutations)`
- **Rollback**: `git revert <hash>` (volta ao placeholder `berry: null` da B1.1).

### Sprint B2: Auditoria e publicacao

- **Descricao**: auditoria independente dos campos novos, paridade instancia x snapshot, determinismo e republicacao.
- **Deliverable**: `public/data/<versao nova>/` + `current.json`; auditoria 0 divergencias; janela quebrada fechada; HANDOFF para o frontend.
- **Risco**: medio.
- **Prerequisito**: Sprint B1 completa. B2.2 depende de B2.1.

#### Feature B2.1: Auditoria com checks de origem e cruzamento `[category: outro]`
- **Traces**: RF-38, RF-34, RF-14, RF-20.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/expected.ts` (modificar: interface `Expected` linhas 224-238 ganha `berries` depois de `potRecipes` linha 237; retorno de `buildExpected` linhas 658-671 ganha `berries: buildBerries(srcs),` depois da linha 669; funcao nova `buildBerries` no fim do arquivo, depois da linha 909)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/compare.ts` (modificar: bloco novo depois da linha 254, antes do `} else push(...)` da linha 255)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tools/dataset/audit/AUDIT_REPORT.md` (regenerado pelo `run.ts`, com nota "## Rodada 6 (2026-09-30, berry-mutations)" no topo, no formato da Rodada 5, linhas 3-11)
- **Steps** (a auditoria NAO importa nada de `tools/dataset/src`; reescreve a regra lendo o cru):
  1. `expected.ts`: `export interface ExpBerry { spawn: { variant: string; biomeTags: string[] }[]; mutationPairs: { a: string; b: string }[]; mutationUses: { partner: string; result: string }[]; file: string }`; `Expected.berries: Map<string, ExpBerry>`; `buildBerries(srcs)`: para cada fonte de `srcs` (ordem de `sources()`, kubejs por ultimo), `datapackFiles(s, "berries").filter((x) => x.ns === "cobblemon")` (`raw.ts:71`), id `cobblemon:<rel sem .json>`, ultimo vence; mesma regra da secao 2.4 itens 2 e 3 reescrita aqui (variante com/sem namespace, 3 variantes, dedupe por par nao ordenado, usos a partir dos pares, ordenacao por code unit).
  2. `compare.ts`, depois da linha 254: para cada `[id, e]` de `exp.berries`: item ausente -> `MISSING` (`field: "items.json"`); senao `eq(\`item ${id}\`, "berry.spawn", e.spawn, it.berry?.spawn, e.file, pub(itemsFile))`, idem `berry.mutationPairs` e `berry.mutationUses`; para cada `[id, it]` de `items` com `it.berry != null` e sem entrada em `exp.berries` -> `EXTRA` (`field: "berry"`).
  3. Rodar `npx tsx tools/dataset/audit/run.ts tools/dataset/out/_bm_pub/data/current.json` (antes da B2.2) e registrar a Rodada 6 no `AUDIT_REPORT.md`.
- **Edge cases**: baga com `berry` publicado mas sem arquivo = `EXTRA`; item nao-baga com `berry` nao nulo = `EXTRA`; arquivo de baga sem item = `MISSING`; divergencia de ordem = `WRONG DATA` (a ordem e parte do contrato).
- **Consumes (contrato)**: `items.json` gerado em B1.2 (secao 5).
- **Done when**: `run.ts` contra `_bm_pub` imprime `divergencias {}` (0 em todas as severidades) com numero de checks MAIOR que 46558 (baseline da Rodada 5) e pelo menos 210 checks novos (70 x 3); `AUDIT_REPORT.md` com a Rodada 6 toda 0; `npx vitest run tests/unit/dataset/audit.test.ts` verde.
- **Commit**: `feat(audit): checks de origem e cruzamento das bagas`
- **Rollback**: `git revert <hash>`.

#### Feature B2.2: Paridade, determinismo e republicacao do dataset `[category: build]`
- **Traces**: RF-35, RF-36, RF-37, RF-39, RNF-01, RNF-09, CA-31, CA-32, CA-33, CA-36, CA-37.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/data/current.json` (gerado)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/public/data/<versao nova>/**` (gerado; a pasta `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` e removida pelo `write.ts`, padrao do projeto)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/HANDOFF_backend.md` (criar: contrato REAL conferido no dataset publicado, no formato de `.forge/complete/spawn-bait/HANDOFF_backend.md`)
- **Steps**:
  1. Paridade (RF-37): `npm run dataset -- --offline --instance "C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons" --out tools/dataset/out/_bm_inst_stage --publish-dir tools/dataset/out/_bm_inst` e `npm run dataset -- --offline --out tools/dataset/out/_bm_snap_stage --publish-dir tools/dataset/out/_bm_snap`; `cmp` dos dois `items.json` (as `datasetVersion` da instancia e do snapshot NAO precisam bater: o hash inclui `dataset-manifest.json` com `sources`/mtimes, desvio ja registrado no HANDOFF do spawn-bait). Se diferir, parar e registrar a diferenca no STATE (nenhuma copia para o snapshot esta prevista: os `berries/*.json` ja sao identicos).
  2. Publicar: `npm run dataset -- --offline` (grava em `public/`).
  3. Determinismo (RNF-09): nova execucao no snapshot com `--publish-dir tools/dataset/out/_bm_again`; mesma `datasetVersion` e `cmp` do `items.json` igual ao publicado.
  4. Nao-perda (CA-31): script inline compara, para os 951 ids, o `items.json` publicado ANTERIOR (`git show HEAD:public/data/atm1.3.0-cobblemon1.7.3-20260929-2ef2f512/items.json`) com o novo sem a chave `berry`: `JSON.stringify` identico item a item.
  5. Medir: `wc -c public/data/<v>/items.json` <= 1.659.908 bytes (teto EFETIVO: assert existente `tests/unit/dataset/join.test.ts:322`, mais apertado que os +15% = 1.724.523 do PRD RNF-01) (anotar o numero no STATE).
  6. `npx tsx tools/dataset/audit/run.ts` (0 divergencias no publicado) e `npx vitest run tests/unit/data/published-schemas.test.ts tests/unit/dataset/join.test.ts` (janela FECHADA). Depois `npx vitest run` inteiro verde.
  7. HANDOFF: estado, commits, janela fechada, contrato real (secao 5 conferida no publicado), numeros (70/31/40/77/154, bytes), desvios.
- **Edge cases**: `current.json` apontando para versao inexistente = nao commitar; `datasetVersion` igual a `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` = pipeline nao mudou nada (erro); cache PokeAPI incompleto (rodar sem `--offline` e registrar); apagar `_bm_*` ao fim.
- **Consumes (contrato)**: pipeline completo de B1 e auditoria de B2.1.
- **Done when**: `current.json` com `datasetVersion` nova (diferente de `...-2ef2f512`); `published-schemas.test.ts` e `join.test.ts` verdes; `items.json` instancia = snapshot = publicado (sha256 anotado no HANDOFF); passo 4 sem diferenca; tamanho dentro do teto; auditoria 0; `npx vitest run` inteiro verde.
- **Commit**: `feat(data): dataset republicado com origem e cruzamentos das bagas` (inclui o HANDOFF)
- **Rollback**: `git revert <hash>` (restaura a pasta e o `current.json` anteriores).

---

## Frontend

### Sprint F1: Pagina do item (Encontrada no mundo, Cresce melhor em, Como cruzar, Usada em cruzamento)

- **Descricao**: textos PT/EN, regras puras e linhas novas na pagina das bagas, dentro de `.item-obtain` e `UsedIn`.
- **Deliverable**: paginas de Occa, Sitrus, Oran, Liechi, Eggant, Lum, Enigma, Starf, Cheri e Hopo conforme CA-01..CA-20, com capturas `after-*`.
- **Risco**: medio (contagem de `.ob-row`; lista longa no mobile).
- **Prerequisito**: B2.2 verde (dataset novo publicado). Ordem: F1.1 -> F1.2 -> F1.3 -> F1.4 -> F1.5.

#### Feature F1.1: Textos i18n (pagina e listagem) `[category: frontend]`
- **Traces**: RF-05, RF-06, RF-12, RF-24, RF-40, RF-41, RNF-02, RNF-13.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/item.ts` (acrescentar depois da linha 81 `"ip.station.campfirePot"`, antes do fechamento da linha 82)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/i18n/messages/items.ts` (acrescentar depois da linha 20 `"item.cat.other"`, antes do fechamento da linha 21)
- **Steps**:
  1. `item.ts` (valores exatos; comentario de uma linha acima do bloco: `// berry-mutations: mecanica do jogo (BerryBlock.determineMutation, Cobblemon 1.7.3): 4 vizinhos ortogonais, 125/1000, x4 com Surprise Mulch`):
     - `"ip.berryWorld": { pt: "Encontrada no mundo", en: "Found in the world" }`
     - `"ip.berryWorldText": { pt: "Nasce sozinha em:", en: "Grows wild in:" }`
     - `"ip.berryWorldAny": { pt: "Nasce sozinha em qualquer bioma", en: "Grows wild in any biome" }`
     - `"ip.berryGrowth": { pt: "Cresce melhor em", en: "Grows best in" }`
     - `"ip.berryGrowthText": { pt: "Rende mais frutas nos biomas:", en: "Yields more fruit in biomes:" }`
     - `"ip.mut.title": { pt: "Como cruzar", en: "How to crossbreed" }`
     - `"ip.mut.plus": { pt: "+", en: "+" }`
     - `"ip.mut.equals": { pt: "=", en: "=" }`
     - `"ip.mut.oneOf": { pt: "uma destas:", en: "one of:" }`
     - `"ip.mut.chance": { pt: "Chance: 12,5% por colheita;", en: "Chance: 12.5% per harvest;" }`
     - `"ip.mut.chanceMulch": { pt: "50% com", en: "50% with" }`
     - `"ip.mut.how": { pt: "Plante as duas árvores lado a lado: norte, sul, leste ou oeste (diagonal não vale). Cada vez que uma delas floresce (a primeira vez e de novo depois de cada colheita), o jogo tenta o cruzamento; se der certo, uma das frutas dessa árvore vira esta baga.", en: "Plant both trees side by side: north, south, east or west (diagonals don't count). Each time one of them flowers (the first time and again after every harvest), the game tries the crossbreed; if it works, one of that tree's fruits becomes this berry." }`
     - `"ip.mut.uses": { pt: "Usada em cruzamento", en: "Used in crossbreeding" }`
  2. `items.ts`:
     - `"item.origin.mutation": { pt: "Mutação", en: "Mutation" }`
     - `"item.origin.world": { pt: "Mundo", en: "World" }`
     - `"item.origin.all": { pt: "Todos", en: "All" }`
     - `"item.origin.filter": { pt: "Filtrar bagas por origem", en: "Filter berries by origin" }`
- **Edge cases**: chave duplicada entre modulos (o teste `i18n-modules.test.ts` pega); PT/EN nao vazios; nenhum travessao; "12,5%" com virgula so no PT (RF-41); form validation/API error N/A (feature so de texto).
- **Consumes (contrato)**: nada.
- **Done when**: `npx vitest run tests/unit/ui-foundation/i18n.test.tsx tests/unit/ui-shell/i18n-modules.test.ts` verde; `npm run lint` e `npm run typecheck` limpos; captura headless (regra geral) da pagina da Occa `after-f11-occa-pt.png` sem nenhuma mudanca visual (as chaves ainda nao sao usadas).
- **Commit**: `feat(i18n): textos de cruzamento, origem das bagas e filtro de origem`
- **Rollback**: `git revert <hash>`.

#### Feature F1.2: Regras puras de origem, linhas e agrupamento `[category: outro]`
- **Traces**: RF-02, RF-11, RF-14, RF-15, RF-17, RF-20, RF-21, RF-26, RF-29, RF-30, RF-31, RNF-10.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Items/item-model.ts` (acrescentar depois da linha 92, fim do arquivo; `filterItems` linhas 83-92 intocada)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item-page-model.ts` (acrescentar depois da linha 236, fim do arquivo; o import de tipos da linha 2 ganha `BerryMutationPair, BerryMutationUse, BerrySpawn`; `obtainRows` linhas 8-11 intocada)
- **Steps**:
  1. `item-model.ts`:
     - `export type BerryOrigin = "mutation" | "world";`
     - `export function berryOrigins(item: Pick<ItemInfo, "berry">): BerryOrigin[]` (secao 2.4 item 4; ordem fixa mutation, world; `item.berry == null` -> `[]`, tolerando `undefined`);
     - `export type OriginFilter = "all" | BerryOrigin;` `export const ORIGIN_FILTERS: readonly OriginFilter[] = ["all", "mutation", "world"];` `export function isOriginFilter(v: unknown): v is OriginFilter`;
     - `export function filterByOrigin<T extends Pick<ItemInfo, "berry">>(list: T[], origin: OriginFilter): T[]`: `"all"` devolve `list` (mesma referencia); senao `list.filter((it) => berryOrigins(it).includes(origin))`.
  2. `item-page-model.ts`:
     - `export const SURPRISE_MULCH_ID = "cobblemon:surprise_mulch";`
     - `export type BerryObtainExtra = "berryWorld" | "berryGrowth" | "plantable" | "mutation";`
     - `export function berryObtainExtras(item: Pick<ItemInfo, "obtain" | "berry"> | null): BerryObtainExtra[]`: `[]` se `!item?.berry`; senao, na ordem: `"berryWorld"` se `berry.spawn.length > 0`; para a primeira rota `plantable` de `item.obtain` (se houver): `"berryGrowth"` se `biomeTags.length > 0`, senao `"plantable"` (a linha atual "Pode ser plantado", RF-18); `"mutation"` se `berry.mutationPairs.length > 0`.
     - `export function pageObtainRoutes(item: Pick<ItemInfo, "obtain" | "berry"> | null): ItemObtainRoute[]`: sem `item?.berry` devolve `obtainRows(item)` (caminho de hoje, sem mudanca); com `berry`: `kept = item.obtain.filter((r) => r.kind !== "none" && r.kind !== "plantable")`; se `kept.length === 0 && berryObtainExtras(item).length === 0` devolve `[{ kind: "none" }]`; senao `kept`.
     - `export function berryWorldBiomes(spawn: readonly BerrySpawn[]): { any: boolean; biomeTags: string[] }`: `any = spawn.some((s) => s.variant === "allBiome")`; `biomeTags` = uniao sem repeticao, na ordem, dos `biomeTags` das demais entradas.
     - `export function groupMutationPairs(pairs: readonly BerryMutationPair[]): { fixed: string; partners: string[] }[]` e `export function groupMutationUses(uses: readonly BerryMutationUse[]): { result: string; partners: string[] }[]` exatamente como a secao 2.4 item 8 (comparador por code unit).
- **Edge cases**: `berry` nulo ou ausente = nada muda; listas vazias = `[]`; par repetido na entrada (defensivo) nao duplica grupo; empate de contagem resolvido pelo menor id; `filterByOrigin` nunca recebe valor invalido (o chamador valida com `isOriginFilter`).
- **Consumes (contrato)**: `ItemInfo.berry.spawn[].variant/biomeTags`, `ItemInfo.berry.mutationPairs[].a/b`, `ItemInfo.berry.mutationUses[].partner/result`, `ItemInfo.obtain` (rota `plantable`.biomeTags).
- **Done when**: teste rapido em node (`npx tsx -e` importando os dois modelos e o `items.json` publicado de B2.2) imprime: `berryOrigins` com contagens 30/39/1 (so world/so mutation/ambas) e 0 para nao-bagas; `pageObtainRoutes` da Occa = `craftable, drop, structureLoot` e `berryObtainExtras` = `berryWorld, berryGrowth`; Eggant extras = `berryGrowth, mutation`; Red Apricorn com `pageObtainRoutes` identico a `obtainRows` e extras `[]`; `groupMutationPairs` de Lum, Figy, Enigma e `groupMutationUses` de Cheri, Oran, Lum iguais aos exemplos da secao 2.4 item 8; `filterByOrigin(list, "all") === list`; `npm run typecheck` limpo.
- **Commit**: `feat(item): regras puras de origem, pares e usos de cruzamento das bagas`
- **Rollback**: `git revert <hash>`.

#### Feature F1.3: "Encontrada no mundo" e "Cresce melhor em" no lugar do "Plantavel" das bagas `[category: frontend]`
- **Traces**: RF-09 (parte mundo), RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-42, RF-47, RNF-04; UISPEC secoes 4, 5 e 6 (pagina do item).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/BerryParts.tsx` (criar; exporta `BerryObtainRow`, no molde de `BaitParts.tsx`, importando `Row` e `LabelChips` de `./ItemScreen`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/ItemScreen.tsx` (modificar: `function LabelChips` linha 138 passa a `export function LabelChips` (so o `export`); `ItemBody` linhas 425-432: trocar `obtainRows(item)` da linha 428 por `pageObtainRoutes(item)` e, depois do `.map` (linha 430) e ainda dentro de `.ob-list`, renderizar `berryObtainExtras(item)`; o import de `./item-page-model` (linhas 28-43) ganha `pageObtainRoutes, berryObtainExtras`; novo import `import { BerryObtainRow } from "./BerryParts";` junto da linha 24)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/item.spec.ts` (linha 259: `toHaveCount(4)` -> `toHaveCount(5)`; unica mudanca de assert existente aprovada, secao 2.6)
- **Steps**:
  1. `BerryObtainRow({ kind, item, index, biomes, uiLang }: { kind: BerryObtainExtra; item: ItemInfo; index: number; biomes: BiomeLabels | null; uiLang: UiLanguage })` (SO essas props nesta feature: `items` e `lang` entram em F1.4, que as usa; declarar antes quebraria o lint `no-unused-vars`), com `item.berry` garantido pelo chamador:
     - `"berryWorld"`: `const w = berryWorldBiomes(item.berry!.spawn)`; `<Row icon={<Trees />} title={t("ip.berryWorld")} index={index} kind="berryWorld">` + (`w.any` ? `<span>{t("ip.berryWorldAny")}</span>` : `<><span>{t("ip.berryWorldText")}</span><LabelChips labels={[...new Set(w.biomeTags.map((b) => biomeLabel(b, biomes)[uiLang]))]} /></>`);
     - `"berryGrowth"`: rota `p` = primeira `plantable` de `item.obtain`; `<Row icon={<Sprout />} title={t("ip.berryGrowth")} index={index} kind="berryGrowth"><span>{t("ip.berryGrowthText")}</span><LabelChips labels={[...new Set(p.biomeTags.map((b) => biomeLabel(b, biomes)[uiLang]))]} /></Row>`;
     - `"plantable"`: marcacao IDENTICA a da linha de hoje sem bioma (`ItemScreen.tsx:200` e `:207`): `<Row icon={<Sprout />} title={t("ip.plant")} index={index} kind="plantable"><span>{t("ip.plantAny")}</span></Row>`;
     - `"mutation"`: implementado em F1.4 (nesta feature o `case` devolve `null`).
     Icones `Sprout` e `Trees` de `lucide-react` (import direto, como `ItemScreen.tsx:8`); `biomeLabel` de `../Trainers/trainer-model`.
  2. `ItemBody`: `const routes = pageObtainRoutes(item); const extras = berryObtainExtras(item);` `routes.map(...)` como hoje (mesmas props do `ObtainRow`) e depois `extras.map((k, j) => <BerryObtainRow key={k} kind={k} item={item!} index={routes.length + j} biomes={biomes} uiLang={uiLang} />)`. Item com `berry === null`: `routes` e o mesmo array de `obtainRows(item)` e `extras` vazio (DOM identico ao de hoje).
  3. `item.spec.ts:259`: 4 -> 5, com comentario de uma linha `// berry-mutations RF-13: Plantavel da baga vira Encontrada no mundo + Cresce melhor em`.
- **Edge cases**: baga sem spawn (Sitrus) nao mostra "Encontrada no mundo" (RF-14); `allBiome` mostra o texto de qualquer bioma sem chips (RF-15); `specificBiome` mostra "Mirage Ilha"/"Mirage Island" (RF-15); baga com `preferredBiomeTags` vazio mantem "Plantavel / Pode ser plantado" (RF-18; nenhuma hoje); apricorn/mint identicos (RF-17); bioma sem rotulo cai no nome humanizado (`biomeLabel`); loading/erro/offline pelas regras gerais.
- **Consumes (contrato)**: `ItemInfo.berry.spawn[].variant/biomeTags`, `ItemInfo.obtain[kind="plantable"].biomeTags`, `biomes.json` (ja carregado pela pagina).
- **Done when**: capturas (regra geral) `after-item-occa-{pt,en,pt-390}.png`, `after-item-oran-pt.png`, `after-item-liechi-pt.png`, `after-item-sitrus-pt.png`, `after-item-red_apricorn-pt.png` em `ui-refs/`; no spec temporario: Occa `.item-obtain .ob-row` = 5 com `data-row` na ordem `craftable, drop, structureLoot, berryWorld, berryGrowth`; Occa `[data-row='berryWorld']` contem "Nasce sozinha em:"; Oran `[data-row='berryWorld']` contem "qualquer bioma" e 0 `.biome`; Liechi `[data-row='berryWorld']` contem "Mirage Ilha"; Sitrus 0 `[data-row='berryWorld']` e 1 `[data-row='berryGrowth']`; Red Apricorn com `[data-row='plantable']` e texto "Pode ser plantado" iguais aos de hoje e 0 linhas novas; `expectNoOverlap(".item-screen")` a 360/390/1280; `npx vitest run tests/unit/ui-screens` verde; `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/item.spec.ts` verde (com o 5 da linha 259).
- **Commit**: `feat(item): Plantavel das bagas vira Encontrada no mundo e Cresce melhor em`
- **Rollback**: `git revert <hash>` (volta tambem a linha 259).

#### Feature F1.4: Linha "Como cruzar" (pares clicaveis, chance e mecanica) `[category: frontend]`
- **Traces**: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-12, RF-23 (parte 1), RF-42, RF-46, RNF-03, RNF-04; UISPEC secoes 4 a 7.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/BerryParts.tsx` (modificar: `case "mutation"`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/ItemScreen.tsx` (modificar: a chamada de `BerryObtainRow` dentro de `.ob-list` do `ItemBody`, criada em F1.3, passa tambem `items={items} lang={lang}`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/item.css` (acrescentar depois da linha 74, fim do arquivo)
- **Steps**:
  0. `BerryObtainRow` ganha agora as props `items: Record<string, ItemInfo>` e `lang: UiLanguage` (usadas pelos `ItemLink`), e a chamada em `ItemBody` passa `items={items} lang={lang}`.
  1. `case "mutation"`: `<Row icon={<Dna />} title={t("ip.mut.title")} index={index} kind="mutation">` com:
     - para cada grupo de `groupMutationPairs(item.berry!.mutationPairs)`: `<span className="mut-pair" data-mut-fixed={g.fixed}><ItemLink id={g.fixed} items={items} lang={lang} className="mut-berry it-link" /><span className="mut-op">{t("ip.mut.plus")}</span>{g.partners.length > 1 ? <span className="mut-hint">{t("ip.mut.oneOf")}</span> : null}{g.partners.map((p) => <ItemLink key={p} id={p} items={items} lang={lang} className="mut-berry it-link" />)}</span>`;
     - `<span className="mut-chance" data-mut-chance=""><b>{t("ip.mut.chance")}</b>{" "}<b>{t("ip.mut.chanceMulch")}</b>{" "}<ItemLink id={SURPRISE_MULCH_ID} items={items} lang={lang} className="mut-berry it-link" /></span>` (o espaco real no DOM vem da expressao JSX `{" "}`, um `JSXExpressionContainer` com literal de string, permitido pela regra `pontindex/no-literal-jsx-text`, que so reporta `JSXText`; construcao ja usada em `src/screens/Detail/BestBallPanel.tsx:149` e `src/screens/Trainers/TrainersScreen.tsx:84`. Texto resultante PT "Chance: 12,5% por colheita; 50% com Adubo Surpresa", EN "Chance: 12.5% per harvest; 50% with Surprise Mulch");
     - `<span className="mut-how">{t("ip.mut.how")}</span>`.
     Sem `CappedList` (secao 2.4 item 7). `Dna` de `lucide-react`; `ItemLink` de `../Detail/ItemLink`.
  2. CSS (so variaveis):
     - `.item-screen .mut-pair, .item-screen .mut-use, .item-screen .mut-chance { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; width: 100%; min-width: 0; }`
     - `.item-screen .mut-op { font-weight: 800; color: var(--text); }` e `.item-screen .mut-hint { color: var(--muted); }`
     - `.item-screen .mut-berry { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px 3px 4px; border-radius: 999px; background: var(--surface); border: 1.5px solid var(--border); font: inherit; font-size: 12px; font-weight: 800; color: var(--text); text-align: left; min-width: 0; max-width: 100%; overflow-wrap: anywhere; transition: border-color .2s; }`
     - `.item-screen button.mut-berry:hover { border-color: var(--secondary); }` e `.item-screen button.mut-berry:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }`
     - `.item-screen .mut-how { width: 100%; overflow-wrap: anywhere; }`
- **Edge cases**: Enigma com 18 parceiros quebra em varias linhas a 360/390 sem vazar (RF-08); parceiro que tambem e de cruzamento abre a pagina dele com a propria linha (RF-04, `ItemLink` -> `navigate("item")`, Voltar pela pilha); id fora do `items.json` vira texto simples com `data-item-missing` (RF-46); Surprise Mulch ausente do dataset = texto simples; baga que nao e resultado nao tem a linha (RF-11); Liechi mostra a linha e mantem "Encontrada no mundo" (RF-09); Eggant so ganha esta linha (RF-10); nomes pelo toggle `itempage`, textos pela interface (RF-12).
- **Consumes (contrato)**: `ItemInfo.berry.mutationPairs[].a/b`; `items["cobblemon:surprise_mulch"]` (nome/textura).
- **Done when**: capturas `after-item-lum-{pt,en,pt-390}.png`, `after-item-enigma-{pt,pt-390,pt-360}.png`, `after-item-eggant-pt.png`, `after-item-starf-pt.png`, `after-item-liechi-pt.png` (refeita) em `ui-refs/`; no spec temporario: Lum `[data-row='mutation'] [data-mut-fixed='cobblemon:oran_berry']` com 6 `button[data-item]` (Oran + 5), asserts POR PARTES: `[data-mut-chance]` contem "12,5%" e "50% com" e `[data-mut-chance] button[data-item='cobblemon:surprise_mulch']` contem "Adubo Surpresa"; em EN (interface e card) `[data-mut-chance]` contem "12.5%" e "50% with" e o botao da mulch contem "Surprise Mulch"; e o `textContent` de `[data-mut-chance]` normalizado (`replace(/\s+/g, " ")`) contem "50% com Adubo Surpresa" (prova o espaco real do `{" "}`); Enigma com 19 `button[data-item]` no grupo (Hopo + 18), todos visiveis e sem `.ob-more`; Figy com 1 grupo Cheri + Persim; Starf -> clique Pomeg -> Sitrus -> Lum -> Oran, cada pagina com a propria linha (Oran sem `mutation` e com `berryWorld`), e `page.goBack()` volta passo a passo; `expectNoOverlap(".item-screen")` da Enigma a 360/390/1280.
- **Commit**: `feat(item): linha Como cruzar com pares clicaveis, chance e mecanica`
- **Rollback**: `git revert <hash>`.

#### Feature F1.5: "Usada em cruzamento" no Usado em `[category: frontend]`
- **Traces**: RF-19, RF-20, RF-21, RF-22, RF-23 (parte 2), RF-24, RF-42, RF-46, RNF-03, RNF-04.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/BerryParts.tsx` (acrescentar `BerryUsesRow`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Item/ItemScreen.tsx` (modificar: `UsedIn` linha 322 recebe a prop `items: Record<string, ItemInfo>`; nova linha depois do bloco `showsEffect` (linhas 373-379) e antes do `if (!rows.length)` da linha 380; `ItemBody` linha 434 passa `items={items}`; import `BerryUsesRow` junto do `BerryObtainRow`)
- **Steps**:
  1. `BerryUsesRow({ uses, items, lang, index })`: `<Row icon={<Combine />} title={t("ip.mut.uses")} index={index} kind="mutationUses">` + para cada grupo de `groupMutationUses(uses)`: `<span className="mut-use" data-mut-result={g.result}><span className="mut-op">{t("ip.mut.plus")}</span>{g.partners.length > 1 ? <span className="mut-hint">{t("ip.mut.oneOf")}</span> : null}{g.partners.map((p) => <ItemLink key={p} id={p} items={items} lang={lang} className="mut-berry it-link" />)}<span className="mut-op">{t("ip.mut.equals")}</span><ItemLink id={g.result} items={items} lang={lang} className="mut-berry it-link" /></span>`. Sem `CappedList`. `Combine` de `lucide-react`.
  2. `UsedIn`: `if (item.berry?.mutationUses.length) rows.push(<BerryUsesRow key="mutationUses" uses={item.berry.mutationUses} items={items} lang={lang} index={rows.length} />);` DEPOIS das linhas existentes (ordem das existentes intacta).
- **Edge cases**: baga sem uso (ex. Starf, Eggant) nao ganha linha (RF-21); item nao-baga nunca (RF-21); Hopo com 18 usos todos visiveis a 360 (RF-22); Lum mostra "Como cruzar" (em Como obter) E "Usada em cruzamento" (em Usado em), cada um com o proprio titulo (RF-23); id sem pagina = texto simples (RF-46); `UsedIn` continua devolvendo `null` para item sem nenhuma linha.
- **Consumes (contrato)**: `ItemInfo.berry.mutationUses[].partner/result`.
- **Done when**: capturas `after-item-cheri-{pt,en}.png`, `after-item-hopo-pt-360.png`, `after-item-oran-used-pt.png`, `after-item-lum-used-pt.png` em `ui-refs/`; no spec temporario: Cheri `.item-used [data-row='mutationUses'] [data-mut-result]` = 2 (`cobblemon:figy_berry`, `cobblemon:lum_berry`, nessa ordem) e clicar Oran abre a Oran e `goBack()` volta a Cheri; Oran com 2 grupos (leppa, lum) de 5 parceiros cada; Lum tem `[data-row='mutation']` em `.item-obtain` e `[data-row='mutationUses']` em `.item-used`; Starf com 0 `mutationUses`; `.item-used [data-row]` da Occa comeca pelas mesmas linhas de hoje e termina em `mutationUses`; `expectNoOverlap(".item-screen")` do Hopo a 360/390/1280.
- **Commit**: `feat(item): Usada em cruzamento no Usado em das bagas`
- **Rollback**: `git revert <hash>`.

### Sprint F2: Listagem de itens (tag e filtro de origem)

- **Descricao**: tag Mutacao/Mundo nos cards das bagas e filtro por origem.
- **Deliverable**: listagem conforme CA-21..CA-29, com capturas `after-*`.
- **Risco**: medio (medidas e sobreposicao de e2e existentes).
- **Prerequisito**: B2.2 verde, F1.1 e F1.2.

#### Feature F2.1: Tag de origem nos cards das bagas `[category: frontend]`
- **Traces**: RF-25, RF-26, RF-27, RF-28, RF-29, RF-43, RF-44, RNF-03, RNF-04, RNF-10; UISPEC secoes 3, 5 e 6 (listagem).
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Items/ItemsScreen.tsx` (modificar: `ItemCard` linha 63; dentro de `.item-names` (linhas 73-77), depois da linha 76 (`.item-alt`) e antes do `</span>` da linha 77; o import da linha 24 ganha `berryOrigins`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Items/items.css` (acrescentar depois da linha 38, fim do arquivo)
- **Steps**:
  1. `ItemCard`: `const origins = berryOrigins(item);` e, como ultimo filho de `.item-names`: `{origins.length ? <span className="item-origins">{origins.map((o) => <span key={o} className="item-origin" data-origin={o}>{t(\`item.origin.${o}\`)}</span>)}</span> : null}`. Nenhuma prop nova no `ItemCard` (memo intacto); `.item-tag` e todo o resto do card sem nenhuma mudanca.
  2. CSS: `.item-origins { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 2px; max-width: 100%; }` e `.item-origin { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 8px; font-size: 9.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; white-space: nowrap; background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }` (molde de `.bait-badge-shiny`, `detail.css:209-211`; nao usa `--secondary-soft` para nao competir com `.item-tag`).
- **Edge cases**: Liechi com as duas tags na mesma linha (quebra se faltar espaco); item nao-baga sem elemento (RF-29); card em qualquer aba/busca (a tag vem do item, RF-28); tema escuro (texto `--text` sobre `--surface-2`); nomes longos EN a 360.
- **Consumes (contrato)**: `ItemInfo.berry.spawn`, `ItemInfo.berry.mutationPairs` (via `berryOrigins`).
- **Done when**: capturas `after-items-berries-{pt,en,pt-360,pt-390}.png`, `after-items-berries-pt-black.png`, `after-items-iscas-pt.png`, `after-items-search-ber-pt.png` em `ui-refs/` (comparar com `recon-items-*`); no spec temporario: aba Berries com 70 cards e `.item-origin` = 71 (70 + a segunda da Liechi); Occa `[data-origin='world']`, Sitrus `[data-origin='mutation']`, Liechi os dois; cards de apricorn e mint sem `.item-origins`; `.item-tag` da Occa "Berries" acima de `.item-name` (mesma medida de `items.spec.ts:74-76`); `expectNoOverlap("#item-grid")` a 360/390/1280 PT e EN na aba Berries; `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/items.spec.ts` verde sem mudar nenhum assert.
- **Commit**: `feat(items): tag de origem Mutacao/Mundo nos cards das bagas`
- **Rollback**: `git revert <hash>`.

#### Feature F2.2: Filtro de origem na listagem `[category: frontend]`
- **Traces**: RF-30, RF-31, RF-32, RF-33, RF-43, RF-45, RNF-03, RNF-04, RNF-10.
- **Files**:
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/navigation/types.ts` (linha 78: `items: { category: string; query: string; openItemId: string | null; origin: string };` linha 114: default `{ category: "all", query: "", openItemId: null, origin: "all" }`)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Items/ItemsScreen.tsx` (modificar: novo componente `OriginFilter` antes de `ItemsBody` (linha 137); `ItemsBody` renderiza `<OriginFilter />` antes de `<ItemTabs .../>` (linha 144); `ItemGrid` linha 103 passa a aplicar `filterByOrigin`; imports: `SegmentedControl` de `../../components/SegmentedControl`, e `ORIGIN_FILTERS`, `isOriginFilter`, `filterByOrigin` na linha 24)
  - `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/src/screens/Items/items.css` (acrescentar ao fim, depois das regras da F2.1)
- **Steps**:
  1. `OriginFilter` (memo, molde de `BallFilters`, `BallsScreen.tsx:79-93`): `const raw = useScreenUi("items", "origin")`; `options = ORIGIN_FILTERS.map((f) => ({ value: f, label: t(\`item.origin.${f}\`) }))` (memo por `t`); `<SegmentedControl className="seg-tabs item-origin-filter" ariaLabel={t("item.origin.filter")} options={options} value={isOriginFilter(raw) ? raw : "all"} onChange={(v) => updateUi<"items">({ origin: v })} />`.
  2. `ItemGrid`: `const origin = useScreenUi("items", "origin");` e `const shown = useMemo(() => filterByOrigin(filterItems(items, tab, query, lang), isOriginFilter(origin) ? origin : "all"), [items, tab, query, lang, origin]);`. O `EmptyState` existente (linhas 104-108) cobre o vazio (com a busca entre aspas quando ha texto).
  3. `ItemTabs` e `ListSearch` NAO mudam (aba e busca nao zeram o filtro).
  4. CSS: `.items-screen .item-origin-filter { margin-bottom: 0; justify-self: start; }` e `.app.mobile .items-screen .item-origin-filter { margin-bottom: 0; justify-self: stretch; }` (o `.app.mobile .seg-tabs` global de `mobile.css:28` segue dando a faixa de largura total com rolagem horizontal).
- **Edge cases**: exemplos da secao 2.4 item 10 (Berries+Mutacao 40, Berries+Mundo 31, Iscas+Mutacao 40, Medicina+Mutacao 0 com `EmptyState`, busca + filtro); valor invalido em `ui.origin` = "Todos"; Voltar de uma pagina de item restaura filtro, aba e busca (RF-32); "Todos" = listagem identica a de hoje (mesmo array de `filterItems`, RF-31); teclado: botoes nativos com `aria-pressed` e grupo com `aria-label` (RNF-03); o filtro nao se confunde com `TermsToggle` (linha propria, fora de `.item-tools`); validacao de formulario/erro de API N/A (controle de 3 valores fixos, sem rede).
- **Consumes (contrato)**: `ItemInfo.berry` (via `berryOrigins`); estado `UiStateMap["items"].origin` (secao 5.4).
- **Done when**: capturas `after-items-filter-mutation-pt.png`, `after-items-filter-world-pt-390.png`, `after-items-filter-empty-pt.png` (Medicina + Mutacao), `after-items-filter-pt-360.png` em `ui-refs/`; no spec temporario: `#item-grid[data-count]` = 40 (Berries + Mutacao), 31 (Berries + Mundo) e 40 (Iscas + Mutacao); Medicina + Mutacao mostra `.items-screen .empty-state`; com "Todos" a contagem de cada aba e igual a de antes; abrir Sitrus com filtro Mutacao e `page.goBack()` volta com o botao Mutacao `aria-pressed="true"` e a mesma aba; `expectNoOverlap(".items-screen .item-top")` a 360/390/1280 PT/EN; `.item-origin-filter` sem rolagem vertical; `PW_DEV=1 PW_PORT=4178 npx playwright test tests/e2e/items.spec.ts tests/e2e/responsive.spec.ts` verde sem mudar assert.
- **Commit**: `feat(items): filtro de origem das bagas na listagem`
- **Rollback**: `git revert <hash>`.

---

### Sprint T1: Testes (definidos aqui, escritos na etapa de testes)

- **Descricao**: unitarios de pipeline e auditoria, contrato publicado, regras puras, RTL, e2e headless e regressao completa.
- **Deliverable**: suite verde nos limites de cobertura; e2e headless verde; auditoria 0; byte a byte provado.
- **Risco**: medio.
- **Prerequisito**: B1, B2, F1, F2 completos (T1.1 e T1.2 podem ser escritos logo depois de B2.2, como no spawn-bait; T1.6 fica para o fim).
- **Regras**: framework detectado = Vitest 3 (`tests/unit/**`, nomes de `it` em ingles, `// @vitest-environment node` para testes de dado) + Testing Library (RTL) + Playwright 1.63 (`tests/e2e/*.spec.ts`, headless, sem slowMo, sem sleep; helpers `boot`, `openItem`, `openItems`, `card`, `settle`, `trackConsoleErrors`, `expectNoOverlap`). Toda lista esperada (bagas com par, com spawn, pares, usos) e DERIVADA dos 70 `data-source/.../berries/*.json` dentro do teste (LESSONS), nunca copiada da IDEA/PRD/SPEC. Mocks: so os de loader (`loadItems`/`loadBalls`/`loadBiomes`) no RTL, no padrao de `item-screen.test.tsx:68-79`; pipeline e e2e usam dados reais. Nenhum teste existente removido ou afrouxado (unica mudanca de assert: `item.spec.ts:259`, feita em F1.3).

#### Feature T1.1: Pipeline e auditoria (origem e cruzamentos) `[category: outro]`
- **Traces**: RF-02, RF-14, RF-15, RF-20, RF-34, RF-35, RF-38, RNF-08, RNF-09.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/berry-mutations.test.ts` (criar); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/audit.test.ts` (acrescentar `it`s depois da linha 166, sem mudar os existentes)
- **Steps**: (1) `buildBerryOrigins` com fixtures sinteticas (mapa em memoria, sem leitor; report no padrao `warnSink` de `spawn-bait.test.ts:33-36`): par simetrico A/B -> C aparece 1 vez em C e 1 uso em A e em B; par assimetrico entra e gera `W_BERRY_MUTATION_ASYMMETRIC`; resultado fora dos arquivos gera `W_BERRY_MUTATION_UNKNOWN_ID` e nao grava; `variant` com e sem namespace; variante desconhecida -> `W_BERRY_SPAWN_UNKNOWN` e pula; `specific_biome` sem `biome` -> `W_BERRY_SPAWN_BIOME_MISSING`; `preferred_biome` copia `preferredBiomeTags`; `all_biome` -> `[]`; ordenacao por code unit (com id com maiuscula/digito, para provar que nao usa locale); `mutations` nao-objeto = sem pares; (2) `collectBerryOrigins` no snapshot (`openSource(snapshot, () => {})`, como `spawn-bait.test.ts:30`): recalcular no proprio teste, lendo os 70 JSON com `readFileSync`, o conjunto de resultados (valores de `mutations`), o de spawn (`spawnConditions` nao vazio), os pares nao ordenados e os usos, e comparar com a saida (hoje 40/31/77/154, 56 com uso); Cheri, Lum e Liechi iguais a secao 5.3; 0 avisos `W_BERRY_*`; as 3 variantes presentes; (3) `collectBerryPlantable` continua devolvendo o mesmo de antes (Occa `biomeTags` `["cobblemon:is_jungle","cobblemon:is_sandy","cobblemon:is_thermal","cobblemon:is_volcanic"]` e `mulches` `["humid","sandy"]`, lidos do arquivo cru no teste); (4) auditoria: `buildExpected()` expoe `berries` com 70 entradas e Liechi `specificBiome`; `compare` com um `items.json` adulterado em memoria (par removido da Lum; `berry` nao nulo num apricorn) acusa `WRONG DATA` e `EXTRA`.
- **Done when**: `npx vitest run tests/unit/dataset/berry-mutations.test.ts tests/unit/dataset/audit.test.ts` verde; cobertura de `tools/dataset/src/**` >= 80/80.
- **Commit**: `test(dataset): origem e cruzamentos das bagas no pipeline e na auditoria`
- **Rollback**: `git revert <hash>`.

#### Feature T1.2: Contrato publicado e dataset real `[category: outro]`
- **Traces**: RF-34, RF-35, RF-36, RF-39, RNF-01, CA-10, CA-15, CA-30, CA-31, CA-32, CA-35, CA-36.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/data/published-schemas.test.ts` (acrescentar `it` depois da linha 72, fim do teste spawn-bait, sem mudar os existentes); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/dataset/join.test.ts` (novo `describe("berry-mutations: berry origin and crossbreeding", ...)` no fim, depois da linha 349)
- **Steps**: (1) `published-schemas`: o `it.each` existente (linhas 45-57) ja valida `items` com `toEqual` (nenhum campo descartado); acrescentar: `items["cobblemon:lum_berry"]` passa em `itemInfoSchema`; campo extra em `berry`, em `berry.spawn[0]` ou em `berry.mutationPairs[0]` e `variant: "x"` sao rejeitados; `berry: null` passa; item sem a chave `berry` e rejeitado; (2) `join.test`: 70 itens com `berry` nao nulo, todos `category === "berry"` e ids `cobblemon:*_berry`; os 881 restantes com `berry === null` (inclui os 40 apricorns/mints com `plantable`); conjuntos de origem iguais aos derivados dos arquivos do snapshot (resultados de `mutations` = com pares; `spawnConditions` nao vazio = com spawn); as 3 variantes e Liechi `specificBiome` `cobblemon:is_mirage_island`; rota `plantable` de todas as 110 com `biomeTags` = `preferredBiomeTags` (bagas) ou `[]` (apricorn/mint); `datasetVersion` diferente de `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512`; tamanho: o assert existente `join.test.ts:322` (`items.json` <= 1.659.908 bytes) ja e o teto efetivo e continua valendo sem mudanca; nao criar assert novo de tamanho mais frouxo.
- **Done when**: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
- **Commit**: `test(data): contrato e dataset publicado do berry-mutations`
- **Rollback**: `git revert <hash>`.

#### Feature T1.3: Regras puras com o dataset real `[category: outro]`
- **Traces**: RF-02, RF-11, RF-17, RF-20, RF-21, RF-26, RF-29, RF-30, RF-31, RNF-10, CA-02, CA-03, CA-10, CA-25, CA-26, CA-44.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/berry-model.test.ts` (criar; le `public/data/current.json` como `items-model.test.ts:10-12`)
- **Steps**: (1) `berryOrigins`: contagens derivadas dos arquivos do snapshot (so world, so mutation, ambas) batem com a funcao sobre o `items.json`; 0 origem para todo nao-baga; (2) `filterByOrigin`: `"all"` devolve a mesma referencia (`toBe`); para cada aba de `visibleTabs` e para as buscas "ber", "baga", "pocao": `filterByOrigin(filterItems(...), "all")` identico a `filterItems(...)`; Berries+mutation/world e Iscas+mutation com as contagens derivadas; Medicina+mutation `[]`; Liechi nos dois; ordem de `filterItems` preservada; (3) `pageObtainRoutes`/`berryObtainExtras`: Occa, Sitrus, Eggant, Liechi, Oran conforme secao 2.4 item 6; TODOS os itens com `berry === null` tem `pageObtainRoutes(it)` igual (`toEqual`) a `obtainRows(it)` e extras `[]`; (4) `groupMutationPairs`/`groupMutationUses`: exemplos da secao 2.4 item 8 e, para as 70 bagas, a uniao dos grupos reconstroi exatamente os pares/usos publicados (nenhum omitido, nenhum repetido); empate resolvido pelo menor id (fixture sintetica); (5) `berryWorldBiomes`: allBiome, preferred, specific e combinacao; (6) desempenho: `filterByOrigin` sobre os 951 itens < 5 ms (`performance.now()`, maximo de 20 execucoes).
- **Done when**: `npx vitest run tests/unit/ui-screens/berry-model.test.ts` verde; as funcoes novas com >= 95% de linhas cobertas.
- **Commit**: `test(ui): regras puras de origem e cruzamento das bagas com o dataset real`
- **Rollback**: `git revert <hash>`.

#### Feature T1.4: RTL da pagina do item e da listagem `[category: outro]`
- **Traces**: RF-03, RF-05..RF-08, RF-11..RF-25, RF-27..RF-33, RF-40, RF-46, RNF-02, RNF-03.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/item-berry.test.tsx` (criar, padrao de `item-screen.test.tsx`: mock de `loadItems`/`loadBalls`/`loadBiomes`, stores resetadas); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/unit/ui-screens/items-origin.test.tsx` (criar, padrao de `items-screen.test.tsx`)
- **Steps**: (1) pagina, fixture pequena (baga de mundo com 2 rotas + plantable; baga so de cruzamento com grupo de 3 parceiros; baga all_biome; baga com `preferredBiomeTags` vazio; apricorn com plantable; Surprise Mulch; um parceiro fora do catalogo): ordem de `data-row` em `.item-obtain`; "Encontrada no mundo" com chips de bioma (rotulo de `loadBiomes`) e texto de qualquer bioma sem chips; "Cresce melhor em"; baga com bioma vazio mostra `[data-row='plantable']` "Pode ser plantado"; apricorn identico ao de hoje; linha `mutation` com "uma destas:" so em grupo de 2+, sem `.ob-more`; "12,5%" com interface PT e "12.5%" com interface EN; nomes de baga seguem o toggle `itempage` (EN com interface PT); parceiro fora do catalogo = `[data-item-missing]` sem `button`; clique em parceiro chama `navigate("item", { itemId })`; `mutationUses` em `.item-used` depois de `effect`; nada novo em item com `berry: null`; nenhum `.mon-chip`/`.tag` dentro das linhas novas; (2) listagem: card de baga com `.item-origin[data-origin]` na ordem mutation, world; `.item-tag` e o PRIMEIRO filho de `.item-names` com o mesmo texto de antes; nao-baga sem `.item-origins`; `OriginFilter` com `role="group"` e `aria-label`, 3 botoes, "Todos" com `aria-pressed="true"` por padrao; clicar "Mutação" grava `ui.origin === "mutation"` e reduz a grade; aba clicada mantem `origin`; `ui.origin = "xyz"` tratado como "Todos"; filtro sem resultado mostra `.empty-state` com `item.none`.
- **Done when**: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70.
- **Commit**: `test(ui): linhas de baga na pagina do item e tag e filtro de origem na listagem`
- **Rollback**: `git revert <hash>`.

#### Feature T1.5: e2e headless (pagina, listagem, temas, offline) sem quebrar os existentes `[category: outro]`
- **Traces**: RF-01..RF-33, RF-42..RF-46, RNF-03, RNF-04, RNF-05, RNF-12, CA-01..CA-29, CA-38, CA-41, CA-42, CA-43.
- **Files**: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/item.spec.ts` (novo `test.describe("berry-mutations: item page", ...)` no fim, depois da linha 337; reusa `openItem` linha 45, `settle` linha 83, `setLanguage` linha 74); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/items.spec.ts` (novo `test.describe("berry-mutations: origin tag and filter", ...)` no fim, depois da linha 186; reusa `openItems` linha 26, `card` linha 59, `settle` linha 47); `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/tests/e2e/pwa-offline.spec.ts` (novo `test` dentro de `test.describe("F12.1 PWA installable and cache", ...)` da linha 99, no padrao do teste da linha 155)
- **Steps**: (1) item: CA-01 (Lum), CA-02 (Figy 1 par), CA-03 (Oran+Cheri: 1 vez na Lum, 1 vez na Oran e na Cheri, sem duplicata por pagina), CA-04 (Starf -> Pomeg -> Sitrus -> Lum -> Oran e Voltar passo a passo), CA-05 (Enigma 18 parceiros a 360/390 com `expectNoOverlap` e sem scroll horizontal: `scrollWidth <= clientWidth` de `#main`), CA-06/CA-14 (Liechi), CA-07 (Eggant: as linhas de `.item-obtain` sao as de antes sem `plantable` + `berryGrowth` + `mutation`), CA-08 (Cheri, Red Apricorn e Adamant Mint sem `mutation`), CA-09 (PT/EN), CA-10 (conjunto de paginas com `[data-row='mutation']` = resultados derivados dos arquivos: iterar os ids derivados e conferir, e conferir 3 nao-resultados), CA-11/12/13/15 (15 = para TODAS as 70 bagas, derivado dos arquivos: presenca de `berryWorld` se e so se ha spawn e `berryGrowth` em todas; em lote com `openItem` + `settle`), CA-16 (apricorn e mint: `[data-row='plantable']` com o mesmo texto e posicao de antes), CA-17..CA-20, CA-38 (Occa, Fire Stone, Enchanted Golden Apple: `data-row` das linhas existentes na mesma ordem relativa), CA-43 (parceiro fora do catalogo coberto no RTL; aqui 0 erros de console); (2) listagem: CA-21, CA-22 (aba Berries, aba Iscas e busca "ber"), CA-23 (apricorn, mint e `minecraft:golden_apple` sem tag), CA-24 (Occa: `.item-tag` "Berries" acima do nome, mesma medida de `items.spec.ts:74-76`), CA-25 (contagens derivadas), CA-26 (com "Todos" as contagens de todas as abas iguais as sem o filtro), CA-27 (Medicina + Mutacao, e busca "zzzzqq" + Mundo: `.empty-state`), CA-28 (filtro + aba + busca restaurados apos abrir item e Voltar), CA-29/RF-44 (`expectNoOverlap("#item-grid")` e `(".items-screen .item-top")` na aba Berries com a Liechi visivel a 360/390/1280 em PT e EN), CA-42/RNF-03 (para os 7 temas de `THEME_IDS`, via `writeDoc(page, "preferences", ...)` + reload como `detail.spec.ts:604-609`: contraste de `.item-origin` texto x fundo >= 4.5:1 calculado no teste a partir de `getComputedStyle`, `expectNoOverlap("#item-grid")` a 1280, e foco por teclado (Tab) alcanca os botoes do filtro e um `button.mut-berry` com `outline` visivel); (3) offline (CA-41, RNF-05/12): com o SW no controle, abrir a listagem e a Lum online, `context.setOffline(true)`, recarregar, abrir a listagem (tags visiveis, filtro funciona) e a Lum (`[data-row='mutation']` visivel), 0 erros; e contar as requisicoes de rede de listagem + pagina online: nenhuma URL nova alem das de hoje (`items.json`, `biomes.json`, `balls.json`, texturas `assets/items/`).
- **Done when**: `npx playwright test tests/e2e/item.spec.ts tests/e2e/items.spec.ts tests/e2e/item-obtain-v2.spec.ts tests/e2e/detail.spec.ts tests/e2e/responsive.spec.ts tests/e2e/pwa-offline.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
- **Commit**: `test(e2e): cruzamento na pagina da baga, tag e filtro de origem, temas e offline`
- **Rollback**: `git revert <hash>`.

#### Feature T1.6: Regressao completa, qualidade, auditoria e byte a byte `[category: outro]`
- **Traces**: RF-37, RF-38, RF-45, RF-47, RNF-01, RNF-05, RNF-06, RNF-07, RNF-08, RNF-09, RNF-11, RNF-12, CA-33, CA-34, CA-39, CA-40.
- **Files**: nenhum arquivo de codigo; numeros anotados em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex/.forge/ideas/berry-mutations/STATE_berry-mutations.md`
- **Steps**: (1) `npm run typecheck` e `npm run lint` limpos (inclui `no-literal-jsx-text` e a regra do travessao); (2) `npx vitest run --coverage` verde, com numero de arquivos e testes >= baseline do STATE mais os novos, e limites do `vitest.config.ts` (global 80/80, `tools/dataset/src/**` 80/80, `src/screens/**` 70/70, `src/domain/**` 95/95); (3) `npx playwright test` inteiro (build + preview, headless) verde, comparado com o baseline do STATE (falha preexistente registrada la nao conta como regressao; falha nova = regressao); (4) `git diff main -- tests/` mostra, fora dos arquivos criados, so: fixtures `berry: null` (B1.1), `item.spec.ts:259` (F1.3) e os blocos novos acrescentados (conferir no diff que nenhum assert existente mudou alem da linha 259); (5) `npx tsx tools/dataset/audit/run.ts` = 0 divergencias (CA-34); (6) byte a byte e determinismo: repetir os comandos de B2.2 passos 1 e 3 (CA-33, RNF-09); (7) `npm run build` e conferir no `dist/sw.js` que o precache nao ganhou URL nova (RNF-05); (8) `git grep -n "Usuario\|USERPROFILE" -- src tools/dataset/src` sem caminho novo e nenhum valor de segredo em artefato (RNF-11); `git grep -n "fetch(" -- src/screens/Item/BerryParts.tsx src/screens/Items` sem ocorrencia nova (RNF-12); (9) nenhum caractere U+2014 nos arquivos tocados (`git grep -nP "\x{2014}"`).
- **Done when**: os 9 passos verdes e os numeros (testes, cobertura, checks da auditoria, sha256 do `items.json`, bytes) anotados no STATE.
- **Commit**: `test: regressao completa do berry-mutations (vitest, e2e, auditoria, byte a byte)` (so se algum arquivo mudou; senao sem commit)
- **Rollback**: n/a.

---

## 8. Matriz de cobertura do PRD

| RF/RNF | Sprint.Feature | Como e satisfeito |
|---|---|---|
| RF-01 | B1.2, F1.4, T1.5 | `mutationPairs` publicado; linha `mutation` so quando ha pares; teste deriva o conjunto dos arquivos (CA-10) |
| RF-02 | B1.2, F1.2, F1.4, T1.1, T1.3 | Dedupe por par nao ordenado no pipeline; grupos por parceiro comum, cada par uma vez |
| RF-03 | F1.4, T1.4, T1.5 | Parceiros via `ItemLink` (`navigate("item")`, pilha de Voltar) |
| RF-04 | F1.4, T1.5 | Parceiro de cruzamento abre a propria pagina com a propria linha (CA-04) |
| RF-05 | F1.1, F1.4 | Texto fixo `ip.mut.how` (4 vizinhos, sem diagonal, uma fruta vira a baga) |
| RF-06 | F1.1, F1.4 | `ip.mut.chance` "12,5%"/"12.5%" e `ip.mut.chanceMulch` "50% com"/"50% with" |
| RF-07 | F1.4 | Surprise Mulch como `ItemLink` com nome pelo toggle do card |
| RF-08 | F1.4, T1.5 | Sem `CappedList`; flex-wrap; Enigma 18 parceiros a 360/390 (CA-05) |
| RF-09 | F1.3, F1.4 | Liechi: `berryWorld` + `mutation` (Kelpsy + Pamtre) |
| RF-10 | F1.4, T1.5 | Eggant: so a linha `mutation` a mais, nenhuma fonte inventada |
| RF-11 | F1.2, F1.4, T1.3 | `berryObtainExtras` so inclui `mutation` com pares; `berry: null` sem nada |
| RF-12 | F1.1, F1.4, T1.4 | Nomes pelo toggle `itempage`, textos pelo dicionario |
| RF-13 | F1.3 | Split do "Plantavel" das bagas em `berryWorld` + `berryGrowth` |
| RF-14 | B1.2, F1.3, T1.5 | `berryWorld` so com `spawn` nao vazio (CA-15 nas 70) |
| RF-15 | B1.2, F1.3 | Variantes resolvidas; allBiome = texto de qualquer bioma; Liechi = Mirage Ilha |
| RF-16 | F1.3 | `berryGrowth` com `plantable.biomeTags` (= `preferredBiomeTags`) |
| RF-17 | F1.2, F1.3, T1.5 | `berry === null` = caminho de hoje (apricorn/mint identicos, CA-16) |
| RF-18 | F1.2, F1.3, T1.4 | `preferredBiomeTags` vazio = linha "Plantavel / Pode ser plantado" |
| RF-19 | F1.5 | Linha `mutationUses` "+ parceiro = resultado" com `ItemLink` |
| RF-20 | B1.2, F1.2, T1.1 | Usos derivados dos pares, dedupe `partner|result` |
| RF-21 | F1.5, T1.4 | Sem usos = sem linha; nao-baga nunca |
| RF-22 | F1.5, T1.5 | Sem colapso; Hopo 18 usos a 360 |
| RF-23 | F1.4, F1.5 | Lum com `mutation` (Como obter) e `mutationUses` (Usado em), cada um com titulo |
| RF-24 | F1.1, F1.5 | Textos PT/EN e nomes localizados |
| RF-25 | F2.1 | `.item-origin` Mutacao/Mundo; Liechi com as duas |
| RF-26 | F1.2, T1.3 | `berryOrigins` como regra unica (pagina e listagem leem o mesmo `berry`) |
| RF-27 | F2.1, T1.4 | Elemento proprio no fim de `.item-names`; `.item-tag` intocado |
| RF-28 | F2.1, T1.5 | Tag derivada do item: qualquer aba/busca |
| RF-29 | F2.1, T1.5 | Nao-baga sem tag (`berry === null`) |
| RF-30 | F2.2, T1.3, T1.5 | `filterByOrigin` sobre `filterItems` (exemplos 2.4 item 10) |
| RF-31 | F2.2, T1.3 | "Todos" devolve o mesmo array |
| RF-32 | F2.2, T1.5 | `origin` na entrada da pilha (`updateUi`/`useScreenUi`) |
| RF-33 | F2.2, T1.5 | `EmptyState item.none` existente |
| RF-34 | B1.2, T1.1 | `collectBerryOrigins` le `mutations`/`spawnConditions`, 3 variantes |
| RF-35 | B1.2, B2.2, T1.2 | `plantable` intocado; comparacao item a item com o dataset anterior |
| RF-36 | B2.2 | Nova `datasetVersion`; Frontend so apos B2.2 |
| RF-37 | B2.2, T1.6 | `cmp` instancia x snapshot x publicado; determinismo |
| RF-38 | B2.1, T1.6 | Auditoria independente com checks de `berry` (0 divergencias) |
| RF-39 | B1.1, T1.2 | `itemBerrySchema` estrito; `published-schemas` sem campo descartado |
| RF-40 | F1.1 | Chaves `ip.berry*`, `ip.mut.*`, `item.origin.*` no dicionario; lint |
| RF-41 | F1.1, T1.4 | "12,5%" PT, "12.5%" EN; nomes localizados |
| RF-42 | F1.3, F1.4, F1.5, T1.5 | Rotas existentes na mesma ordem; linhas novas so no fim (CA-38) |
| RF-43 | F2.1, F2.2, T1.5 | Card, abas, busca e ordem iguais; so acrescimos |
| RF-44 | F2.1, T1.5 | `expectNoOverlap` 360/390/1280 PT/EN com Liechi; 7 temas |
| RF-45 | T1.5 | Offline via SW; nenhuma requisicao nova |
| RF-46 | F1.4, F1.5, T1.4 | `ItemLink` com id fora do catalogo = texto simples |
| RF-47 | F1.3, T1.6 | So `item.spec.ts:259` muda (4 -> 5); diff de testes conferido |
| RNF-01 | B1.1, B2.2, T1.2 | So ids; teto efetivo 1.659.908 bytes (`join.test.ts:322`; PRD +15% = 1.724.523); estimativa +2,24% |
| RNF-02 | F1.1 | Dicionario central PT/EN; sem literal no JSX |
| RNF-03 | F1.4, F2.1, F2.2, T1.5 | `ItemLink`/botoes nativos, `aria-pressed`/`aria-label`, texto na tag, contraste nos 7 temas |
| RNF-04 | F1.3, F1.4, F1.5, F2.1, F2.2, T1.5 | flex-wrap/min-width 0; 360/390/1280 PT/EN; 7 temas |
| RNF-05 | T1.5, T1.6 | Offline e precache inalterados |
| RNF-06 | Secao 6 (pre-condicao), T1.6 | Baseline antes de implementar; so o assert aprovado muda |
| RNF-07 | Todas, T1.6 | typecheck e lint limpos |
| RNF-08 | T1.1, T1.2, T1.3, T1.4, T1.6 | Limites v8 do projeto |
| RNF-09 | B2.2, T1.6 | Duas execucoes = mesma versao; instancia = snapshot |
| RNF-10 | F2.1, F2.2, T1.3 | Tag derivada do item (memo intacto); `filterByOrigin` < 5 ms; sem download novo |
| RNF-11 | Todas, T1.6 | Sem segredo; so o nome `ATM_INSTANCE_DIR` |
| RNF-12 | T1.5, T1.6 | Sem servico, rede ou coleta nova |
| RNF-13 | F1.1, secao 2.4 item 5 | Fonte registrada (bytecode `BerryBlock.determineMutation` + wiki Berry Tree) e comentario no i18n |

Total: 47 RF + 13 RNF = 60 requisitos; 60 cobertos; 0 orfaos. CA-01..CA-44 exercitados em T1.1..T1.6 (CA-37 e criterio de processo: ordem B2.2 -> Frontend, secao 2.4 item 11).

## 9. Assuncoes e perguntas em aberto

Assuncoes (modo autonomo, revisaveis pelo Pontin):
1. **Momento do sorteio**: o PRD diz "a cada colheita"; o codigo (`BerryBlock.kt` `growHelper`: `curAge == MATURE_AGE` 3 -> `FLOWER_AGE` 4; frutos em `FRUIT_AGE` 5) mostra que o sorteio acontece quando a arvore floresce, uma vez por ciclo: na primeira florada e de novo depois de cada colheita (`BerryBlockEntity.refresh` volta a idade para 3). A chance fica "12,5% por colheita" (texto do PRD) e a explicacao diz "cada vez que uma delas floresce (a primeira vez e de novo depois de cada colheita)". Nenhum numero muda.
2. **Posicao das linhas novas**: seguindo a revisao do UISPEC ("AFTER the existing rows"), a linha `plantable` da baga sai da posicao original e "Encontrada no mundo"/"Cresce melhor em"/"Como cruzar" entram depois de TODAS as rotas existentes. Se o Pontin preferir o split na posicao original, muda so o passo 2 da F1.3 e a regra de `pageObtainRoutes`.
3. **Agrupamento dos pares e usos** (parceiro comum, "uma destas:"): e a forma dos exemplos do PRD (secao 4.8, Exemplo C) e resolve os 18 pares da Enigma sem colapso; cada chip continua sendo um par clicavel.
4. **`item-screen.test.tsx` nao muda**: o PRD RF-47 previa ajustar a linha `plantable` desse teste, mas a fixture `fire_stone` tem `berry: null` e segue no caminho de hoje; ajustar sem necessidade contrariaria "nenhum assert alterado alem do afetado".
5. **Rotulos do filtro**: "Todos"/"Mutação"/"Mundo" (os mesmos nomes das tags aprovadas) com `aria-label` "Filtrar bagas por origem".
6. **Temas**: o PRD fala em "4 temas"; o app tem 7 (`THEME_IDS`, `contracts.test.ts`). O teste cobre os 7 (superconjunto).
7. **Textos novos** (valores exatos em F1.1): redacao PT/EN definida aqui dentro do sentido aprovado ("Encontrada no mundo", "Cresce melhor em", "Como cruzar", "Usada em cruzamento", "Mutação", "Mundo").
8. **Teto de tamanho**: o PRD RNF-01 fala em +15% (= 1.724.523 bytes), mas o teto EFETIVO e o assert existente `join.test.ts:322` (<= 1.659.908 bytes, herdado do spawn-bait), que continua valendo; estimativa 1.533.158 bytes (+2,24%), dentro dos dois.

Perguntas em aberto: nenhuma que bloqueie a implementacao.

Dry-run de implementabilidade (feito, como agente de contexto limpo): cada feature foi percorrida perguntando "da para implementar sem perguntar nada?". Conferido: (a) todo arquivo a modificar existe e as linhas citadas batem com o HEAD `bc113bd9` (berries.ts 4/6/10/17-32; stage.ts 10/116/154-160/207-220/219/240-247; types.ts 485-490/492-510/509; schemas.ts 250/252/313/314; ItemScreen.tsx 8/24/28-43/138/142/156/198-210/322/373-380/413/425-432/428/434/455/459; item-page-model.ts 2/8-11/236; item.css 74; item.ts 81-82; items.ts 20-21; ItemsScreen.tsx 24/63/73-77/97/103/104-108/137/144/165; item-model.ts 83-92; items.css 38; navigation/types.ts 78/114; BallsScreen.tsx 79-93; source-reader.ts 78; expected.ts 224-238/658-671/669/909; compare.ts 254-255; raw.ts 71; AUDIT_REPORT.md 3-11; README.md 28/39; item.spec.ts 19-92/45/74/83/259/337; items.spec.ts 26-59/72-76/186; pwa-offline.spec.ts 99/155; published-schemas.test.ts 25-26/40/45-57/72; join.test.ts 57/349; audit.test.ts 166; detail.spec.ts 604-609; fixtures 22/21/21/21/9/90/29); (b) contagens e exemplos da secao 5.3 gerados por prototipo da regra sobre os 70 arquivos do snapshot; (c) semantica de `preferred_biome`/`specific_biome` e da mecanica conferida por `javap` no jar real; (d) icones lucide conferidos no `node_modules`; (e) a ordem das features respeita as dependencias e a janela quebrada B1.1 -> B2.2 esta declarada, com so `published-schemas.test.ts` excluido e o Frontend depois de B2.2; (f) nenhum passo exige adivinhar nome, caminho ou valor.

Self-check: PASS (sem endpoint: secoes 5 e 5c N/A com motivo e contrato de dados descrito; todo `Consumes` existe na secao 5 com os mesmos campos; secao 2b com read-back do filtro; 60/60 sem orfao; toda regra posicional/quantitativa com exemplo trabalhado (ordem das linhas, agrupamento, filtro, teto de bytes, chance 125/1000 e x4); caminhos absolutos e linhas conferidos; nenhum travessao no arquivo).
