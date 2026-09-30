---
feature: berry-mutations
language: pt-BR
code_identifier_language: en - mirrors-existing-codebase
generated: 2026-09-30
stack: React 19 + TypeScript + Vite (SPA/PWA), zod 3 (contrato estrito), zustand, vitest + Testing Library, Playwright e2e; pipeline de dataset em Node 24 (tsx), sem backend
---

# CONTEXT: berry-mutations

## 0. Baseline (drift anchor)

- HEAD: `3134cd4303890bb09c981070ad55d76c16865cfb` (branch `feature/spawn-bait`; a base de PR e `main`)
- IDEA `.forge/ideas/berry-mutations/IDEA_berry-mutations.md` - `addbd84d16af79e3fdfcb45671a5f6937e1e9ca6`
- `.forge/LESSONS.md` - `14c5e450e8e9f7592e07f3ed3e8afe4ec3623ebb`
- `tools/dataset/src/items/berries.ts` - 41c2da634ae8c054589dfa7bfb4e8ad8603a4558
- `tools/dataset/src/items/stage.ts` - abd06cd97d56f0bcbc0d4de0c5bdafca79d3a1aa
- `src/data/schemas.ts` - f45f4d4a1cdc65613c65e1fba6a6dc287a57e53e
- `src/data/types.ts` - c0447feede549ed38f044648c9d58dc86bbec643
- `src/screens/Item/ItemScreen.tsx` - 0a6b3b7ea0bc26ef4daddb1781c1900cbc048c98
- `src/screens/Item/item-page-model.ts` - ff300ec052f51b6f1758257a20e75fbc567ccb7c
- `src/screens/Item/BaitParts.tsx` - bc79a5c3ccee7fb344e93733cee746f303f9c23c
- `src/screens/Item/item.css` - bae77ab12406f42611fb2161617849c574ad1d64
- `src/screens/Detail/ItemLink.tsx` - d34132bea5341f08929d00c3ea0b79bd84c88622
- `src/i18n/messages/item.ts` - 4a2d7a711adb8322077059ce1546807be6f9b0f1
- `src/screens/Items/ItemsScreen.tsx` - 7e26276f00e16971d047d979fd4fe67f164ae145
- `src/screens/Items/item-model.ts` - cf7be65da6e8445fffd06038b5b5cd03b30f7316
- `src/screens/Items/items.css` - d8af84462afac83894cdf44bfa0dc8fc23cdfafe
- `tests/unit/ui-screens/item-screen.test.tsx` - 9e719238c990c6d0598bab4861a3d1c42d86d865
- `tests/unit/ui-screens/items-screen.test.tsx` - a01494e5ab80b832e7cc4650eb405da9c8263ecf
- `tests/unit/ui-screens/items-model.test.ts` - 3eba150aa9136753eff6a8202295742ff3f4c8a5
- `tests/unit/data/published-schemas.test.ts` - 125790872bfc23a5e2895b210cf1077a79f90ccf
- `tests/unit/dataset/join.test.ts` - 81446160684e43feff7a8aec5bade4f8bfe39737
- `tests/e2e/item.spec.ts` - bb60e2b816bb176d7535d1a8aca7d3833abeef18
- `tests/e2e/items.spec.ts` - b3a7c66adccc52b4e561967edde8ef2cacc0dc4a
- `public/data/current.json` - 03675d7823dc1c146f0fde24b759602c7f74695d

## 1. Stack e build

- `package.json`: `type: module`, Node >= 24. React 19.1, zod 3.24.4, zustand 5, `@tanstack/react-virtual` (usado em outras telas), lucide-react, vitest 3, Playwright 1.63.
- Scripts: `npm run dataset` (`tsx tools/dataset/src/index.ts`, publica em `public/data/<datasetVersion>/`), `npm test` (vitest), `npm run test:e2e` (Playwright), `npm run typecheck`, `npm run lint`, `npm run build` (prebuild gera assets).
- Sem backend: o site le `public/data/current.json` e depois `public/data/<datasetVersion>/*.json`.

## 2. Arquivos e modulos relevantes

Pipeline (`tools/dataset/src/items/`):
- `berries.ts`: `collectBerryPlantable(ctx)` le `data/cobblemon/berries/*.json` (prefixo `BERRIES_PREFIX`) via `readJsonEntries` e devolve `Map<"cobblemon:<arquivo>", { biomeTags: preferredBiomeTags, mulches: favoriteMulches }>`. Hoje NAO le `mutations` nem `spawnConditions`.
- `stage.ts` (linhas ~116 e ~152-160): monta `obtain[]` por item; `berryPlantable.get(entry.id)` gera `{ kind: "plantable", biomeTags, mulches }`; apricorns e mints entram como `plantable` vazio. E o ponto onde entraria a nova rota ou campo.
- `categories.ts`: categoria "berry" pela subpasta de textura `berries`; tag `evBerry` para 6 bagas.
- `tools/dataset/audit/compare.ts`: auditoria do dataset (menciona bagas; verificar se checa o contrato de items).

Contrato (`src/data`):
- `schemas.ts` (~250-320): `itemInfoSchema` (z.object com `obtain` = z.union de rotas; rotas antigas sem `.strict()`, as novas com `.strict()`; `bait` e `.strict().nullable()`). `plantable` na linha ~271.
- `types.ts` (~365-470): `ItemInfo`, `ItemObtainRoute` (union), `ItemCategory`, `ItemTag = "bait" | "evBerry" | "apricorn"`, `ItemBait`.
- `loaders.ts`: `current.json` -> datasetVersion -> `<ver>/<file>`.

Pagina do item (`src/screens/Item/`, rota `item`, params `{ itemId }`):
- `ItemScreen.tsx` (463 linhas): `ItemScreen` -> `ItemBody` -> secao `.panel.item-obtain` (`obtainRows(item).map(ObtainRow)`), depois `BaitEffectsPanel` (se `item.bait`), depois `UsedIn`. `ObtainRow` e um `switch (route.kind)`; o `case "plantable"` (~198-211) mostra `t("ip.plant")` + `t("ip.plantText")` "Cresce nos biomas:" + `LabelChips` dos `biomeTags` (via `biomeLabel(b, biomes)`), ou `ip.plantAny`. `route.mulches` NAO e renderizado hoje.
- `Row` (exportado): `.ob-row[data-row=<kind>]` com `.ob-ico`, `.ob-title`, `.ob-text`.
- Helpers de chip: `MonChip` (`.mon-chip`, `data-nav`, `navigate("detail", { dex })`), `CappedList` (limite `OBTAIN_LIST_CAP = 12`, "e mais N"), `LabelChips`.
- `BaitParts.tsx`: `BaitEffectsPanel` (painel proprio `.panel.item-bait[data-bait-effects]`) e `PotRecipeList` (usa `ItemLink` para ingredientes com pagina). Exemplo direto de painel/linha com itens clicaveis.
- `item-page-model.ts`: funcoes puras (`obtainRows`, `capList`, `namedRefLabels`, `showsEffect`...), testaveis com o dataset real.
- `item.css`: estilos da pagina (`.ob-*`, `.pot-*`, `.item-*`).
- Ponto de integracao alternativo para o caminho inverso ("Usada em cruzamento"): o tipo `ItemUsedIn` (`src/data/types.ts` ~485-490: `evolutions`, `fossils`, `forms`, `ball`; campo `ItemInfo.usedIn`, ~505, e `usedIn` no `itemInfoSchema`) e o componente `UsedIn` (`ItemScreen.tsx` ~322), que monta a secao `.panel.item-used` "Usado em" com `Row` de `kind` `evolutions`/`fossils`/`forms`/`ball`/`effect` (retorna `null` sem linhas). Uma nova `Row` ali (ou novo campo em `usedIn`, ex. `mutations`) NAO altera a contagem de `.item-obtain .ob-row` do Occa (e2e `item.spec.ts` ~259 espera 4); ja uma nova linha dentro de "Como obter" altera. Ressalva: `UsedIn` usa `data-row` proprio e o teste `item-screen.test.tsx` ~130 assere a lista `["evolutions","fossils","forms"]` em `.item-used [data-row]`, entao uma linha nova aparece so em itens que a tenham (bagas), sem afetar a fire_stone.

Link item para item (JA EXISTE):
- `src/screens/Detail/ItemLink.tsx`: `ItemLink({ id, items, lang, className, size })` = botao `.tag.tag-item.it-link` com `ItemTile` + nome localizado, `data-nav`, `data-item={id}`, `navigate("item", { itemId: id })` (com `stopPropagation`); id fora do `items.json` vira texto simples (`data-item-missing`). Exporta tambem `hasItemPage`, `itemDisplayName`, `humanItemId`. Usado em `PotRecipeList`, fichas de Pokemon e `BaitBlock`. Serve para os parceiros de cruzamento sem codigo novo de navegacao.
- Navegacao: `useNavigationActions()` de `src/navigation/useNavigation`; `navigate("item", { itemId })`; o "Voltar" da pagina usa `goBack()` (pilha), entao seguir cadeias (parceiro -> parceiro) ja restaura a origem. Ha e2e do padrao em `tests/e2e/detail.spec.ts` (~521: berry abre o item e Back retorna).

Listagem (`src/screens/Items/`, rota `items`):
- `ItemsScreen.tsx` (168 linhas): `ItemsScreen` -> `ItemsBody` (abas `ItemTabs` + `ItemGrid`) -> `ItemCard` (memo). NAO e grade virtual: e CSS grid (`.item-grid`, `repeat(auto-fill, minmax(280px, 1fr))`) com todos os cards no DOM e `content-visibility: auto` no card. A "grade virtual" citada no LESSONS/IDEA e da Pokedex, nao desta tela.
- Card: `<article.item-card data-item>` > `.item-head` > `button.item-link.it-link` > `ItemIcon` + `.item-names` { `span.tag.item-tag` (categoria, em linha propria ACIMA do nome, decisao do Pontin 2026-09-24), `.item-name`, `.item-alt` }; caret opcional `.item-caret`; `p.item-desc`. Nao ha outros chips ou badges no card alem de `.item-tag`.
- `item-model.ts`: `ITEM_TABS` (ordem), `CATEGORY_CLASS`, `CATEGORY_LABEL` (berry = `cat.berry` "Berries"), `inTab` (a aba "Iscas" junta categoria `bait` e tag `bait`; as 70 bagas tem tag `bait`, entao aparecem na aba Berries e na aba Iscas), `visibleTabs`, `filterItems` (busca so por nome PT/EN normalizado, ignora a aba quando ha texto; ordena por nome). Nao existe filtro por tag ou origem.
- `items.css`: estilos do card; `.app.mobile .item-grid` = 1 coluna.
- Precedente de badge: `.bait-badge` (`src/screens/Detail/detail.css` ~209-211, `.bait-badge-rarity`, `.bait-badge-shiny`; usado em `BaitBlock.tsx`), pilula 9.5px uppercase.
- i18n: `src/i18n/messages/items.ts` (`item.*`, dono da tela) e `core.ts` (`cat.*`).
- Testes: `tests/unit/ui-screens/items-screen.test.tsx`, `items-model.test.ts`, e2e `tests/e2e/items.spec.ts`.
- Estado de busca/aba (UI por tela): vive na entrada atual da navegacao, em `src/navigation/navigation-store.ts` (zustand; `current.ui`, atualizado por `updateUi(patch)`, que faz merge raso). O tipo e `UiStateMap["items"] = { category: string; query: string; openItemId: string | null }` em `src/navigation/types.ts` (~78), com default `{ category: "all", query: "", openItemId: null }` (~114). Leitura: `useScreenUi("items", "category" | "openItemId")` e `useListQuery("items")` (`src/screens/Trainers/ListSearch.tsx`, le `current.ui.query`); escrita: `updateUi<"items">({ category, query, openItemId })` via `useNavigationActions()` (`src/navigation/useNavigation.ts`), e `writeListQuery` em `ListSearch.tsx`. Por viver na entrada da pilha, o estado volta ao usar Voltar (o e2e F9.2 confere o restore da busca e do card aberto). O campo de busca e `<ListSearch screen="items" id="item-q" .../>` renderizado em `ItemsScreen` dentro de `.item-tools` (junto de `TermsToggle`); as abas sao `ItemTabs` (`#item-tabs`, `data-icat`), que ao clicar limpam `query` e `openItemId`. Onde caberia um filtro de origem: novo campo em `UiStateMap["items"]` (+ default) lido com `useScreenUi`, controle em `.item-tools`/`.item-top` ao lado da busca ou das abas, e a regra pura em `filterItems` (`item-model.ts`), que hoje recebe `(items, tab, query, lang)`. Apenas apontamento, sem desenho.

## 3. Padroes existentes a espelhar

- Precedente mais proximo: spawn-bait (`.forge/complete/spawn-bait/`, SPEC e HANDOFF_backend). Sequencia: (1) backend estende o contrato (`types.ts` + `schemas.ts` estrito) e o pipeline (`tools/dataset/src/items/*.ts` + testes em `tests/unit/dataset/`); (2) republica o dataset (nova pasta `public/data/<ver>/`, `current.json` atualizado, pasta antiga removida); (3) so depois o frontend: painel na pagina do item (`BaitEffectsPanel`, `Row` reaproveitado), textos em `src/i18n/messages/item.ts`, testes vitest (`item-bait.test.tsx`) e e2e (`test.describe("spawn-bait: item page ...")` em `tests/e2e/item.spec.ts`); HANDOFF_backend documenta o contrato real conferido no dataset publicado.
- Chips de item clicaveis: `ItemLink` e o padrao para "cada baga parceira clicavel". A IDEA cita `mon-chip` como referencia visual, mas `mon-chip` e de Pokemon (navega para `detail`); para item o componente correto e `ItemLink`.
- Rotas novas em `obtain` seguem: tipo em `types.ts`, `z.object(...).strict()` no `z.union`, `case` em `ObtainRow`, `Row` com icone lucide e `data-row=<kind>`.
- UI/visual: tela de referencia `/item` (rota `item`, `ItemScreen.tsx`, painel `.item-obtain`, padrao `.ob-row` icone + titulo + chips). Listagem: rota `items`, `ItemsScreen.tsx`, `.item-card`. Nao inferir aparencia; os comentarios citam o prototipo `design/prototipo/style.css` (nao lido aqui), e a regra do Pontin e mostrar no navegador antes de aprovar.

## 4. Arquitetura e dados

Fluxo atual de uma baga: `data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/berries/<x>_berry.json` (no snapshot o "jar" e uma PASTA extraida, nao um zip) -> `collectBerryPlantable` -> `stage.ts` (junto com receitas, drops, loot, extras) -> `items.json` (`Record<id, ItemInfo>`, 951 itens, 1.499.586 bytes) -> `loadItems()` -> `ItemsScreen` / `ItemScreen`.

Dados reais conferidos nos 70 arquivos de baga (batem com as 70 `cobblemon:*_berry` do items.json, todas `category: "berry"`):
- `mutations`: presente nos 70, objeto `{ "cobblemon:<parceiro>": "cobblemon:<resultado>" }`; varias bagas tem `{}` (ex. apicot, custap, eggant, ganlon, jaboca, kee, lansat, liechi, maranga, micle, petaya). Semantica: no arquivo da baga A, `mutations[B] = C` significa "A ao lado de B pode gerar C". O par aparece simetrico no arquivo de B (`B.mutations[A] = C`), entao para "pares que geram C" basta inverter o indice (para cada arquivo A e cada `[B, C]`, registrar em C o par {A, B}) e deduplicar por par nao ordenado (oran+cheri aparece em oran e em cheri). O arquivo nao traz a chance (12,5% e x4 com Surprise Mulch vem do codigo do jogo, `BerryBlock.determineMutation`; texto fixo).
- `spawnConditions`: presente nos 70; 39 com `[]` (so cruzamento), 28 com `[{variant: "cobblemon:preferred_biome", minGroveSize: 3, maxGroveSize: 5}]`, 2 com `[{variant: "cobblemon:all_biome", ...}]` (oran, persim), 1 com `[{variant: "cobblemon:specific_biome", biome: "cobblemon:is_mirage_island", minGroveSize: 1, maxGroveSize: 1}]` (liechi). Bate com os 31/39 da IDEA. Observacao: o arquivo da baga usa a tag `cobblemon:is_mirage_island`, que contem `terralith:mirage_isles`; nao ha conflito com a IDEA. A SPEC deve publicar/mostrar o que o arquivo diz (a tag). O `biomes.json` publicado ja tem rotulo `#cobblemon:is_mirage_island` ("Mirage Ilha"/"Mirage Island", PT por humanizacao automatica).
- `preferredBiomeTags` e `favoriteMulches` continuam alimentando `plantable` (bonus de rendimento, nao spawn).

Rotas `obtain` publicadas hoje (`ItemObtainRoute`, todos os `kind`): `craftable` (+ `potRecipes?`), `drop`, `plantable` (`biomeTags`, `mulches`), `structureLoot`, `fishing`, `fossilRevive`, `trainerDrop`, `blockDrop`, `mobDrop`, `questReward`, `shop` (`battleTowerBp`), `structurePlaced`, `ritual`, `trade`, `worldgen`, `special`, `unobtainable` (`reason?`), `none`.

Perfil real das 70 bagas no `items.json`: todas tem `craftable` (recipeTypes `botanypots:crop`) e `plantable`; combinacoes: craftable+plantable+structureLoot (22), +drop (22), craftable+plantable (10; ex. eggant tem so isso, o que confirma "so por cruzamento"), +shop (6), etc. Ou seja, hoje o site diz "Plantavel: cresce nos biomas X" para todas, inclusive as 39 de cruzamento (bug da IDEA, secao 12). Ex.: sitrus tem `plantable.biomeTags = [is_mountain, is_taiga]`.
- `mulches` (ex. `["peat","loamy"]`) sao ids curtos sem namespace e nao sao renderizados. Surprise Mulch existe como item (`cobblemon:surprise_mulch`, rotas craftable + structureLoot), entao a explicacao da mecanica pode linkar com `ItemLink`.
- Nao existe chave i18n de "cruzamento" ou "mutacao". Hoje: `ip.plant` "Plantavel", `ip.plantText` "Cresce nos biomas:", `ip.plantAny` "Pode ser plantado" (`src/i18n/messages/item.ts`).

## 5. Pontos de integracao

- Sem backend. Republicacao: `npm run dataset` gera `public/data/<datasetVersion>/` com `datasetVersion` = `atm1.3.0-cobblemon1.7.3-<data>-<hash8 do conteudo>` (hoje `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512`, gravado em `public/data/current.json` e em `dataset-manifest.json`). Mudar o pipeline muda o hash e a pasta; o padrao do projeto e commitar a pasta nova e remover a antiga (commits `data(dataset): republica ...`). Cache imutavel por versao (`tests/unit/build/vercel-headers.test.ts`).
- HANDOFF spawn-bait: o `datasetVersion` da instancia real e do snapshot NAO sao iguais (o hash inclui `dataset-manifest.json` com `sources` e mtimes); o que deve bater byte a byte e `items.json` e `species/*.json` (RF-44 da spawn-bait). Conferir se vale aqui (a fonte `data/cobblemon/berries` esta no snapshot).
- Texturas: bagas ja tem textura; a listagem e a pagina nao precisam de midia nova.

## 6. Convencoes

- Pastas: telas em `src/screens/<Tela>/` (`XScreen.tsx`, `x-model.ts` puro, `x.css` carregado so pela tela); i18n por modulo em `src/i18n/messages/<modulo>.ts` (`ip.*` da pagina do item em `item.ts`, `item.*` da listagem em `items.ts`), agregador `src/i18n/messages.ts`; todo texto com `{ pt, en }`.
- Dataset: modulos por assunto em `tools/dataset/src/items/`, funcoes `collectX`/`buildX`, testes em `tests/unit/dataset/*.test.ts`; contrato em `types.ts` + `schemas.ts` (`published-schemas.test.ts` valida o dataset publicado contra o zod).
- Testes: vitest em `tests/unit/{ui-screens,dataset,domain,data,build}`; e2e em `tests/e2e/*.spec.ts` (`item.spec.ts`, `items.spec.ts`, `item-obtain-v2.spec.ts`) com helpers `boot`, `openItem`, `openItems`, `card`, `trackConsoleErrors`. Regras do projeto: Playwright headless sem slowMo (memoria `playwright-fast`), sem em dash.
- Comentarios de codigo em pt-BR (na maior parte sem acento); commits `feat(scope): ...` / `docs(forge): ...`.

**Code identifier language (MANDATORY): en**, mirrors-existing-codebase (identificadores em ingles; comentarios e texto de UI em pt-BR/en). Exemplos: `collectBerryPlantable`, `ObtainRow`, `obtainRows`, `CappedList`, `ItemLink`, `data-row="plantable"`. Sugestao coerente para o novo (nome final e da SPEC): `collectBerryMutations`, `BerryMutation`, `kind: "mutation"`.

## 7. Restricoes e riscos

- Contrato estrito e "janela quebrada" (LESSONS 2026-09-29): mudar `schemas.ts`/`types.ts` e o pipeline sem republicar quebra `tests/unit/data/published-schemas.test.ts` e `tests/unit/dataset/join.test.ts` (e o app com o dataset velho). A SPEC deve planejar quais testes ficam excluidos ate a republicacao, e o frontend so comeca depois do dataset publicado. Rotas antigas (`plantable`, `craftable`) nao tem `.strict()`; as novas tem: campo novo dentro de `plantable` passaria no zod frouxo, mas deve ser tratado como mudanca de contrato do mesmo jeito.
- LESSONS "lista ilustrativa": a lista de 39 bagas e os pares da IDEA sao copia de pesquisa; SPEC e testes devem DERIVAR dos `berries/*.json` (script no snapshot), nunca da IDEA (inverter `mutations` e deduplicar por par nao ordenado). LESSONS pede conferir variantes de campo: `spawnConditions.variant` aparece em 3 formas (`preferred_biome`, `all_biome`, `specific_biome` com `biome`).
- Tamanho: RNF do spawn-bait limitava `items.json` a +15% (era ~1,4 MB, hoje 1.499.586 bytes); a SPEC define o teto desta feature. Pares por baga somam poucas centenas de ids; enigma tem 18 parceiros com hopo; eggant, sitrus, lum, leppa e starf tem 5 cada. Publicar so ids (o nome vem do `items[id]` ja carregado).
- i18n PT/EN: nomes das bagas ja vem do `items.json` (`ItemLink` usa `itemDisplayName`); textos novos (titulo da linha, mecanica, tag de origem) em `item.ts` e `items.ts`, sempre `{ pt, en }`.
- Testes existentes que assertam obtain e cards (rodar a suite completa ANTES de implementar, conforme LESSONS, para separar flake preexistente de regressao):
  - `tests/e2e/item.spec.ts` ~254-262: Occa com `.item-obtain .ob-row` `toHaveCount(4)` e `[data-bait-effects]`. Dividir `plantable` em duas linhas, ou somar uma linha "Usada em cruzamentos", muda essa contagem.
  - `tests/e2e/items.spec.ts` ~156-180: `card(page, "cobblemon:occa_berry").locator(".item-tag")` `toHaveText(/berries/i)` e cards de iscas com `.item-tag` `/iscas/i`. A tag nova de origem NAO pode reutilizar `.item-tag` nem ficar dentro dele; usar classe propria (no molde de `.bait-badge`). O teste F9.2 (linhas 65-118) mede que `.item-tag` fica acima de `.item-name` (`boundingBox`) e ha testes de nao sobreposicao em 360/390/1280 px, PT e EN (~119-155): a tag nova entra nesses layouts (nomes longos).
  - `tests/unit/ui-screens/item-screen.test.tsx`: fixture fire_stone com `plantable` nas linhas 36-37; asserts na 124 (lista de kinds inclui dois `plantable`) e na 128 (`data-row='plantable'` contendo "Floresta"); as linhas 54-57 sao o Oran, sem `plantable`. Mudar texto ou `kind` da linha exige atualizar.
  - `items-screen.test.tsx`, `items-model.test.ts` e `tests/e2e/item-obtain-v2.spec.ts` (contagens de `.ob-row` e `.ob-entry`) tambem consultam card ou obtain.
  - `tests/unit/dataset/join.test.ts`: assertions de bagas (occa categoria berry, tag bait) sobre o dataset publicado.
- Listagem: sem virtualizacao (ver secao 2); o `ItemCard` e `memo`, entao a tag deve derivar so de `item` (sem prop nova por card) para nao quebrar a memoizacao. Os e2e da listagem usam `scrollIntoViewIfNeeded` em cards.
- As 70 bagas estao em duas abas (Berries e Iscas): a tag de origem aparece nas duas. Mints e apricorns tambem tem `plantable`, mas nao devem ganhar a tag.
- Liechi tem as duas origens (spawn especifico e cruzamento kelpsy+pamtre): a regra de classificacao precisa decidir o caso.
- A chance nao esta em nenhum JSON do pack: fixa no codigo do jogo (12,5% / x4 com Surprise Mulch).

## 8. Pontos em aberto

1. Modelo do contrato: nova rota `obtain` (`kind: "mutation"`) ou campo novo em `ItemInfo` (ex. `berry: { mutations, spawn }`)? Afeta o `switch` de `ObtainRow`, a contagem de linhas e o zod.
2. RESOLVIDO (IDEA secao 2): a linha vira duas informacoes: "Encontrada no mundo" (so as 31 com `spawnConditions`) e "Cresce melhor em" (`preferredBiomeTags`, todas).
3. RESOLVIDO (IDEA secao 2): o caminho inverso entra ("Usada em cruzamento: + Oran = Lum", bagas clicaveis). Fica tecnico para a SPEC: onde renderizar (`UsedIn` vs nova `.ob-row`, ver secao 2) e o custo no dataset.
4. RESOLVIDO (IDEA secao 2): Liechi leva as duas tags (Mutacao e Mundo), sem aviso extra.
5. RESOLVIDO (IDEA secao 2): tags "Mutacao"/"Mundo" e filtro por origem na listagem. Fica tecnico para a SPEC: forma do filtro dentro do padrao de `UiStateMap["items"]` e `filterItems` (ver secao 2).
6. Onde vive a regra de classificacao mundo/mutacao: campo derivado publicado no dataset, ou calculada no app a partir de `spawnConditions` e pares (afeta tamanho e a janela quebrada).
7. Teto de tamanho do `items.json` para esta feature (RNF-01 do spawn-bait era +15%) e publicar cada par uma vez so (A+B = B+A).
8. Fonte da mecanica: texto fixo (12,5%, x4 Surprise Mulch, 4 vizinhos ortogonais) vem do codigo do Cobblemon, nao de arquivo do pack; a SPEC precisa registrar a fonte (o padrao `special.evidence` "arquivo:chave" nao se aplica).
9. Apresentacao dos pares longos (enigma: hopo + 18 bagas): agrupar por parceiro fixo, usar `CappedList` (limite 12) ou lista propria no mobile.
