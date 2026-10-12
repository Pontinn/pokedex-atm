---
feature: pokemon-generation
language: pt-BR
code_identifier_language: en - mirrors-existing-codebase
generated: 2026-10-12
stack: React 19 + TypeScript + Vite 6 (SPA/PWA), zod 3 (contrato estrito), zustand, vitest + Testing Library, Playwright e2e; pipeline de dataset em Node 24 (tsx), sem backend
---

# CONTEXT: pokemon-generation

## 0. Baseline (drift anchor)

- HEAD: `b7ae68d78552e3e164091a7878443e89bfc0c97c` (branch `feature/berry-mutations` == `main`)
- IDEA `.forge/ideas/pokemon-generation/IDEA_pokemon-generation.md` - `7b81d65ab33a889f056cd3b83e826720a485295e` (reconferido em 2026-10-12 apos as edicoes do orquestrador; os blob hashes dos demais arquivos abaixo foram reconferidos contra o working tree e seguem iguais, `git status` so mostra `.forge/ideas/pokemon-generation/` e `.vite/` nao rastreados)
- `src/data/schemas.ts` - a7b20fd16613a61aa3f72fabf1c7cbd956148935
- `src/data/types.ts` - 2445067397b8f588f971e35156dde20fde77ea81
- `src/navigation/types.ts` - 894b64047e17241cf1e514eba9ed67d03f76b7b6
- `src/screens/Dex/DexFilters.tsx` - 1886ec2ea037a63cc586bf482a458c0b8a30a157
- `src/screens/Dex/use-filtered-species.ts` - 7207f8ec023ef3be43b218ed51397ced5778f6c6
- `src/screens/Dex/PokemonCard.tsx` - 4fe29da94b5672b1f89fdd8c103416bf1c47a584
- `src/screens/Dex/DexGrid.tsx` - 5d9f4df82dfe71eed580f9ba2ba4450d1ee297fd
- `src/screens/Dex/dex.css` - a365cd9eebc4321cc83c1164ef0ce4baa90d89c6
- `src/screens/Detail/HeroCard.tsx` - b61c7bb5003c712ed5d5c725e3a03d7406092d63
- `src/screens/Detail/EvolutionPanel.tsx` - 8ed5046bcc66ff9ce3518910103a6c8f07403fa4
- `src/screens/Detail/detail.css` - a6f3a9cb95d241512ba2fd1d928daed055c5048a
- `src/screens/Detail/use-species-detail.ts` - 135393f5ea31cd16bc127b3c93c839950bba80e0
- `src/state/dataset-store.ts` - c67f0ced008aea58d95dd4aa33d407b500360951
- `src/i18n/messages/dex.ts` - b57175bd3a44d009c26162c46174a612c9ac97ac
- `src/i18n/messages/detail.ts` - c5e8d640cdf51554c65b44075e63e6db3394c038
- `tools/dataset/src/species/merge.ts` - 1000452bc0f0f0d543f4f00e42291f39ee409453
- `tools/dataset/src/species/index-writer.ts` - c3515f02f63458be40f4dc9bbb0dbe55d67b51eb
- `tests/unit/ui-screens/dex-filter.test.ts` - afd801f55c668524e0ad4ab5d2229147b9b784f2
- `tests/unit/ui-screens/dex-screen.test.tsx` - 5f3a745fa3b5d02e51678cc7e2231b0344fd3c19
- `tests/unit/ui-screens/pokemon-card.test.tsx` - 464b105e10357327761f1686166f616237523e0d
- `tests/unit/ui-screens/detail-hero.test.ts` - abc9c25b77f84474753834e170ddf8316ad30e1f
- `tests/e2e/dex.spec.ts` - 6aa0658cb21d38e51b3724bc1f3e936e9e66318c
- `tests/e2e/detail.spec.ts` - 22245e47411dd4e6380378bb3523492773aae718
- `tests/e2e/responsive.spec.ts` - bad04ff822e95305fa31c85ac9f9ff80482ce918
- `public/data/current.json` - 59e428c9cfdf3ae23c159e8b1ec9307d7809d397
- `tools/dataset/src/pokeapi/client.ts` - e70456f0cb937bc5475d27449bf044140d491f02
- `tools/dataset/src/pokeapi/stage.ts` - 78e1833c4983f7f24028d17bfee491e7bf59d03a
- `tools/dataset/src/artwork-ids.ts` - db9195ce396c336ad8f9fde502b6f03bb74dfc2d
- `tools/dataset/src/context.ts` - 357fe302518a82163152d13e2c51da3b4ba7e88d
- `data-source/README.md` - 4255d2dd6d871104f11c3f11c7848ca861fadbfe
- `data-source/atm-1.3.0/MANIFEST.json` - 3bd0ac51179cb4c0c66465c6d0d755da5b2a8442
- `vite.config.ts` - 1e0035bdd4c0ff06c0d6240acc821af8d74d5364
- `tests/unit/data/published-schemas.test.ts` - 49bca7634086ce611f9b91c3cff3047fadd58b04

## 1. Stack e build

- `package.json`: `type: module`, Node >= 24, React 19, zod 3.24.4, zustand, Vite 6.3.7, vitest 3.2.7, Playwright. Scripts: `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run dataset` (publica em `public/data/<datasetVersion>/`).
- Sem backend: `public/data/current.json` aponta o `datasetVersion` atual (`atm1.3.0-cobblemon1.7.3-20260930-1949ea67`); o app le `<ver>/*.json`.

## 2. Arquivos e modulos relevantes

Dados (`src/data`):
- `schemas.ts:104` `summaryShape.generation: z.string()` (compartilhado por `speciesSummarySchema` e `speciesDetailSchema`, que faz spread de `summaryShape`). `evolutionChain.nodes` e `{ dex, slug, name, types }`: NAO tem `generation`.
- `types.ts:140` `SpeciesSummary.generation` (doc: "gen1".."gen9", "gen7b", "gen8a" ou "custom"); `EvolutionChainNode` sem generation.
- `src/state/dataset-store.ts`: `useDatasetStore(s => s.speciesIndex)` expoe o `species-index.json` inteiro em memoria (1027 especies), com `generation` por dex.

Dex (`src/screens/Dex`):
- `DexFilters.tsx`: `genLabel(gen, t)` (exportado: `custom` -> `dex.genCustom`; `genN` -> `dex.genN` com `{n}` = "1", "7b", "8a"); `SelectsAndStatus` renderiza `<select id="f-gen">` (opcoes: `dex.all` + `sortGenerations(index.map(generation))`), junto de `f-evo`, `f-sort` e o SegmentedControl de status, tudo em `.filter-row`. `patchFilters({ generation })` grava em `current.ui.filters.generation` (pilha de navegacao).
- `use-filtered-species.ts`: `filterSpecies` (igualdade estrita `s.generation === filters.generation`, linha 47), `sortGenerations` (gen1..gen9, sufixos depois do numero base, custom por ultimo).
- `PokemonCard.tsx`: card da grade. `.pcard-top` = `dex-num` + `.pcard-badges` (`SpeciesBadges`: selo Lendario/Mitico + raridade de spawn). Exporta tambem `RARITY_BADGE`, `specialLabel`. Usado por `DexGrid.tsx:99`, que a tela Capturados tambem reusa (com `footer`).
- `dex.css`: `.pcard-badges` flex-wrap; mobile (`.app.mobile`): badge 9px, `.poke-grid` 2 colunas; `.filter-row` 4 colunas no desktop, 2 no mobile, `.filter-seg` ocupa a linha toda.

Detail (`src/screens/Detail`):
- `HeroCard.tsx` (~linha 180): `.seal` com `SpeciesBadges` em fluxo acima do titulo; `.hero-title` = `dex-num` + `h2`; `.hero-body` com TypeChips. `detail` e um `SpeciesDetail`, que ja traz `generation`.
- `EvolutionPanel.tsx`: `EvolutionChainView` (linear `.evo-chain` ou ramificada `.evo-branching`); `EvoNode({ node, current, known, lang })` renderiza sprite + `.evo-name` e e o ponto onde a geracao de cada estagio seria pintada. `node(dex)` tem fallback sintetico `{dex, slug, name, types: []}`. `MethodChip` ja usa `useDatasetStore(s => s.speciesIndex)` + `findPartnerSpecies` (busca por slug) como exemplo de lookup no index.
- `FormsPanel.tsx`: formas (Mega, Gmax, regionais) tem so `labels` proprios (ex. Mega-X de Charizard com `gen6`, Gmax `gen8`); o schema de forma NAO tem campo `generation`.
- `WherePanel.tsx`, `BestBallPanel.tsx`, `DetailScreen.tsx`: nao exibem geracao hoje.

i18n: `src/i18n/messages/dex.ts` (`dex.gen` "Geração"/"Generation", `dex.genN` "Geração {n}"/"Generation {n}", `dex.genCustom` "Do pack (All the Mons)"/"From the pack (All the Mons)", `dex.all`), `detail.ts` (`evo.*`, `detail.*`). Formato `"chave": { pt: "...", en: "..." }`, agregados em `src/i18n/messages.ts`.

Pipeline (`tools/dataset/src/species`):
- `merge.ts:345` `generationOf(labels)`: `custom` se o label `custom` existir; senao o primeiro label que casa `/^gen\d/`; senao `custom`. A geracao vem dos `labels` do JSON de especie do Cobblemon/pack, nao de um campo `generation` proprio.
- `index-writer.ts`: copia `generation` para `SpeciesSummary` e para o detalhe (`buildSpeciesDetail`), valida contra `speciesDetailSchema`/`speciesIndexSchema`, grava `species/<dex>.json` + `species-index.json`.
- `tools/dataset/audit/compare.ts:301` e `expected.ts:585`: auditoria compara `generation` (COSMETIC). A auditoria (`compare.ts`/`expected.ts`) NAO cobre nenhum campo de jogos hoje; a SPEC decide se estende (ela reconstroi o esperado a partir dos arquivos do pack, que nao tem esse dado).

Raridade hoje na UI (2 superficies no Detail + card; mapa para a SPEC nao duplicar nem apagar export em uso):
- Card da listagem: `PokemonCard.tsx:79` renderiza `<SpeciesBadges>` dentro de `.pcard-badges`; `SpeciesBadges` (`PokemonCard.tsx:32`) monta selo Lendario/Mitico + selo de raridade (`species.rarity.primary` via `RARITY_BADGE`, linha 35). Mesmo card usado por Capturados (via `DexGrid.tsx:99`).
- Hero do Detail: `HeroCard.tsx:184-185` (`.seal` > `<SpeciesBadges species={detail}/>`, import em `HeroCard.tsx:18`). Hoje o Hero mostra Lendario/Mitico + raridade pelo MESMO componente do card.
- Painel "Onde encontrar": `WherePanel.tsx:341` (`.kv.where-rarity` com `RarityBadge` do bucket primario e dos secundarios; `RarityBadge` em `WherePanel.tsx:71-73` usa `RARITY_BADGE[bucket]`).
- Dependencia: `WherePanel.tsx:15` importa `RARITY_BADGE` de `../Dex/PokemonCard`; o export (`PokemonCard.tsx:17`) tem consumidores alem do card, nao e codigo morto se a raridade sair do card. Tirar raridade de `SpeciesBadges` tambem tira do Hero (mesmo componente), o que contradiz a IDEA (Hero mantem raridade): exige separar card e Hero.

Creditos/atribuicao hoje: `src/i18n/messages/settings.ts:19` (`settings.images`: "Imagens: PokeAPI (online)" / "Images: PokeAPI (online)"); `README.md:29` ("Dados 100% do modpack: ... Em runtime so o artwork grande vem da PokeAPI", deixa de ser verdade com os jogos vindos da PokeAPI); `README.md:116` (creditos: Nintendo/Game Freak/TPC; "Dados, sons e texturas vem do Cobblemon e dos addons do All the Mons; sprites e artwork da PokeAPI; icones de tipo baseados em duiker101/pokemon-type-svg-icons").

## 3. Funcionalidades e padroes similares

- Selo/badge em card: `SpeciesBadges` (Lendario/Mitico/raridade) e o padrao existente de etiqueta em card e hero; `Badge` em `src/components/Badge.tsx`. A regra "Sem sobreposicao de texto" (RF-121) exige selos em linha propria/fluxo, quebrando linha quando preciso.
- Telas de referencia de identidade: Dex (rota `dex`, `src/screens/Dex/`) e Detail (rota `detail`, `HeroCard.tsx` + `detail.css`). Usar `.badge` e `.chip` existentes; nao inferir o visual.
- Lookup de especie no index a partir do store: padrao em `EvolutionPanel.tsx` (`findPartnerSpecies`).
- `genLabel` ja existe e e reaproveitavel, mas so na forma longa ("Geração 1"); badge compacto exigiria forma curta.
- Compare (`src/screens/Compare/`) usa `useSpeciesDetail` e nao tem card com selos; Home (`SpeciesSprite`, `SearchDropdown`, `HistoryRow`, `TeamSlots`) mostra especie sem selos. Fora do pedido salvo decisao.

## 4. Arquitetura e dados

- `species-index.json` (array de `SpeciesSummary`), contagem por geracao: gen1 151, gen2 100, gen3 135, gen4 107, gen5 156, gen6 72, gen7 86, gen7b 2 (808 Meltan, 809 Melmetal), gen8 89, gen8a 7 (899..905: Wyrdeer, Kleavor, Ursaluna, Basculegion, Sneasler, Overqwil, Enamorus), gen9 120, custom 2 (9901 Piglich, 9902 Creepyon).
- `species/<dex>.json` (verificado em `25.json`): `generation` (por spread do `summaryShape`), `evolutions`, `preEvolution {dex, slug}`, `evolutionChain { root, nodes[{dex,slug,name,types}], edges[EvolutionEdge{id,from,to,toSlug,variant,requiredItem,requirements}] }`, `forms[]`.
- Verificado por script em todas as fichas: toda aresta/no da cadeia referencia dex presente no `species-index.json` (0 faltando). Logo e possivel obter a geracao de cada estagio via `speciesIndex` (lookup por `dex`) SEM mudar o contrato do dataset. Existem arestas que cruzam geracao (201 ocorrencias contando duplicatas entre fichas, ex. 236>107 e 236>106 gen2>gen1 Tyrogue -> Hitmon, 840>1011 gen8>gen9 Applin -> Dipplin, 884>1018 gen8>gen9 Duraludon -> Archaludon): o caso do pedido e real e frequente.
- Alternativa que muda o contrato: incluir `generation` em `evolutionChain.nodes` (pipeline + `schemas.ts` + `types.ts`) e republicar o dataset (nova pasta de `datasetVersion`, `current.json`, `published-schemas.test.ts`, precache do service worker em `vite.config.ts` que le `current.json`). LESSONS 2026-09-29: mudar schema estrito sem republicar quebra `join.test`/`published-schemas`; planejar a "janela quebrada".
- Filtro: estado `DexFilters.generation: string | null` em `src/navigation/types.ts:52` (default em `:100`), persiste na pilha de navegacao (voltar do Detail mantem o filtro).
- Para o motivo (FireRed): "primeira geracao" = `gen1` (151). O filtro atual e selecao unica por igualdade; "ate a geracao N" ou multipla selecao nao existe.

## 5. Pontos de integracao / servicos externos

- Sem backend e sem servico externo em RUNTIME para estes dados. Em BUILD o pipeline ja usa a PokeAPI viva (`tools/dataset/src/pokeapi/client.ts`: cache em disco `tools/dataset/.cache/pokeapi/`, flag `--offline`, backoff; hoje para golpes, habilidades, sprites e artwork ids; em runtime so o artwork grande vem da PokeAPI, ver README.md:29). A disponibilidade por jogo e uma FONTE EXTERNA NOVA: PokeAPI (`/pokedex/*`, `/version-group/*`, ver secao 9), congelada num recorte versionado em `tools/dataset/curated/` e embutida no dataset.
- Fonte upstream da geracao: labels `genN` nos JSON de especie do Cobblemon 1.7.3 e do pack ATM (snapshot em `data-source/atm-1.3.0`; `data-source/README.md` e `MANIFEST.json` registram as copias).

## 6. Convencoes

- **Code identifier language: en**, camelCase em funcoes/variaveis, PascalCase em componentes, kebab-case em modulos de hooks/modelos (`use-filtered-species.ts`). Exemplos: `filterSpecies`, `sortGenerations`, `SpeciesBadges`, `useFilteredSpecies`. Comentarios em pt-BR (sem acento nos cabecalhos); textos de UI em pt/en via i18n.
- i18n: chaves `modulo.chave` com `{ pt, en }`, acentos nos textos de UI; novas chaves em `dex.ts`/`detail.ts`; `useT()` no componente, `translate("pt", k)` nos testes.
- CSS: um arquivo por tela (`dex.css`, `detail.css`), variaveis de tema, regras mobile sob `.app.mobile`.
- Testes: unit (vitest) em `tests/unit/ui-screens/`: `dex-filter.test.ts` (`filterSpecies` com INDEX sintetico, helper `sp(dex, pt, en, types, generation, evo)`), `dex-screen.test.tsx` (opcoes de `#f-gen`, `ui().filters.generation`), `pokemon-card.test.tsx`, `detail-hero.test.ts`, `detail-evolution.test.ts` (so `methodParts`/`itemTexture`, sem teste de render dos nos). E2E Playwright: `tests/e2e/dex.spec.ts:171` (`#f-gen` gen1 + Fire = 12 cards), `detail.spec.ts`, `responsive.spec.ts` (badges intactos, sem sobreposicao e chips dentro da viewport em varias larguras para Home (`:138`), Dex (`:149`), Detail Mewtwo (`:160`) e Captured (`:170`); um novo selo entra nessa regressao nas quatro telas). Regra do projeto: Playwright headless, sem slowMo.
- Inventario (so o que existe hoje, sem dizer como mudar) de asserts ligados a selo/raridade que o selo de geracao ou a saida da raridade do card tocam (grep por rarity/seal/badge em `tests/` e `src/**`; nao ha `*.test.tsx` dentro de `src/`; o teste do card fica em `tests/unit/ui-screens/pokemon-card.test.tsx`, nao em `src/screens/Dex/`):
  - `tests/e2e/detail.spec.ts:82`: Hero do Charizard (dex 6), `hero.locator(".seal .badge")` `toHaveCount(1)` (hoje 1 = o selo de raridade); `:83` `.badge-nospawn` count 0.
  - `tests/e2e/detail.spec.ts:120` e `:130`: Hero legendario/mitico, `.seal .badge-legendary` / `.seal .badge-mythical` visiveis (devem seguir verdes).
  - `tests/e2e/detail.spec.ts:419`: `.where-rarity .badge` com textos `["Incomum", "Raro", "Ultra-raro"]` (painel Onde encontrar; fica); `:445` `entry.locator(".badge")` "Ultra-raro" (entrada de spawn).
  - `tests/e2e/dex.spec.ts:114-119`: "legendary card has the special seal and rarity; clicking a card opens the detail": Mewtwo (dex 150) tem classe `rar-legendary` e `.badge-legendary` visivel (o titulo diz "and rarity" mas o corpo so confere o selo lendario; nao assere `.badge-rare`/raridade).
  - `tests/e2e/dex.spec.ts:124-132`: "badges never wrap their own text" a 360/390 em PT e EN, mede `.pcard .badge` (um selo novo entra nessa medicao).
  - `tests/unit/ui-screens/pokemon-card.test.tsx:58-65`: "badge de raridade so aparece quando primary != null": sem raridade nenhum `[class*="badge-"]`; com `rarity.primary: "rare"` existe `.badge-rare` (linha 64). Linhas 48-56: `.badge-legendary` presente e `.badge-mythical` ausente para `["legendary","mythical"]`. Atencao: `:60` assere que o card sem raridade nao tem NENHUM elemento `[class*="badge-"]`, o que um selo de geracao com classe `badge-*` quebraria.
  - `tests/e2e/responsive.spec.ts:149` (Dex), `:160` (Detail Mewtwo), `:170` (Captured: "badges intact, no overlap, chips in viewport"), `:138` (Home): usam `expectBadgesIntact` (`:103`, `.badge` sem texto cortado), `expectNoOverlap` (`tests/harness/no-overlap.ts`, seletor `.badge` na linha 32) e `expectChipsInViewport`. Captured (`.captured-screen`, `.captured-results .pcard`) e superficie de regressao do selo no card tanto quanto Dex, porque reusa o `PokemonCard`.
  - Nao ha assert de selo no Captured em `tests/e2e/captured.spec.ts` (grep sem ocorrencias) nem em `tests/unit/ui-screens/detail-hero.test.ts` (sem rarity/badge).
  - Fixtures que montam `SpeciesSummary` com `rarity` (so dados, nao asserts de selo): `dex-filter.test.ts:18`, `dex-screen.test.tsx:30`, `pokemon-card.test.tsx:20`, `search-box.test.tsx:19`, `search.test.ts:15`, `item-screen.test.tsx:91`, `trainers-screen.test.tsx:132`; qualquer campo novo obrigatorio no `SpeciesSummary` (ex. lista de jogos) obriga atualizar todas.

## 7. Restricoes e riscos

- Selos do card ja competem por largura (dex-num + Lendario + raridade, 9px no mobile): um selo de geracao pode estourar `.pcard-top` ou violar "Sem sobreposicao de texto" (coberto por `responsive.spec.ts`).
- No hero, `.seal` reserva largura para os botoes shiny/grito (padding-right).
- `SpeciesBadges` e usado em card do Dex, Capturados e Hero, e aceita `Pick<SpeciesSummary,"labels"|"rarity">`: incluir geracao ali afeta os tres e exige passar `generation`.
- Formas (Mega/Gmax/regionais) nao tem `generation`, so labels `genN` proprios, que diferem da especie base.
- `gen7b`, `gen8a` e `custom` nao sao geracoes oficiais numeradas: rotulo e ordem precisam de decisao (hoje "Geração 7b", "Geração 8a", "Do pack (All the Mons)").
- Especies sem label `genN` caem em `custom` por fallback de `generationOf`; so 2 hoje, conferir ao republicar.
- Testes de `#f-gen` (unit e e2e) sao a superficie de regressao e devem continuar verdes.

## 8. Pontos em aberto

- RESOLVIDO na IDEA secao 11: o filtro de geracao existente fica como esta (selecao unica); o filtro novo e "Jogo", um select ao lado. (Fato do codigo: `#f-gen` esta SEMPRE visivel em `.filter-row`, sem painel recolhido; no mobile fica na grade de 2 colunas.)
- RESOLVIDO na IDEA secoes 2 e 11: selo de geracao no card (no lugar da raridade, Capturados herda), no Hero do Detail e em cada estagio da cadeia; Compare nao muda; Home nao e citada (fora do escopo).
- RESOLVIDO na IDEA secao 7: card "Gen 1" (curto), Detail "Geracao 1" (longo); forma exata final na UISPEC.
- RESOLVIDO na IDEA secao 7: gen7b = "Gen 7 (Let's Go)", gen8a = "Gen 8 (Arceus)", custom = "Pack".
- RESOLVIDO na IDEA secoes 2 e 7: formas herdam geracao e disponibilidade da especie base.
- Em aberto para a SPEC (a IDEA secao 8 so diz "selos dos estagios aparecem quando o indice chegar"): lookup via `speciesIndex` (sem republicar) ou `generation` em `evolutionChain.nodes` (muda contrato). Como a feature ja republica o dataset (jogos), o custo de republicar deixa de ser argumento contra.
- RESOLVIDO na IDEA secao 8: com o `speciesIndex` ainda carregando, os selos dos estagios aparecem quando o indice chegar, sem quebrar o layout.
- RESOLVIDO na IDEA secao 2: disponivel = especie listada na Pokedex regional do version-group (inclui dexes de DLC do mesmo grupo); encounters fora.
- RESOLVIDO na IDEA secao 2: FRLG = so `kanto` (151); National Dex pos-jogo nao entra e a tela diz isso em uma linha.
- RESOLVIDO na IDEA secao 2: granularidade = version-group com os dois nomes ("FireRed / LeafGreen"), lista derivada de `pokedex.version_groups`.
- RESOLVIDO na IDEA secao 2: Legends Arceus (hisui) entra; Legends Z-A (lumiose-city) entra se o version-group existir na fonte (existe: `legends-za`, ver 9.2). RESOLVIDO na IDEA secao 2: `mega-dimension` e fundido em `legends-za` como DLC (dex `hyperspace` conta para Legends: Z-A); exclusoes nominais sao os version-groups `red-green-japan`, `blue-japan` e `champions` e a pokedex `conquest-gallery`.
- RESOLVIDO na IDEA secao 2: recorte curado versionado em `tools/dataset/curated/` (ex. `pokeapi-game-availability.json`), gerado por script a mao a partir da PokeAPI com o cache existente; o build nunca depende da rede.
- RESOLVIDO na IDEA secao 2: BDSP aceita o mapeamento da PokeAPI para `original-sinnoh`.
- RESOLVIDO na IDEA secoes 2 e 8: `custom` (9901/9902) sem jogos, rotulo "So no pack" / "Nao aparece nos jogos oficiais".

## 9. Fonte externa: disponibilidade por jogo

Tudo abaixo foi conferido em 2026-10-12 com GET real em https://pokeapi.co/api/v2/ (URLs citadas); nada de memoria.

### 9.1 PokeAPI: recursos relevantes

- `GET /pokedex?limit=100` (campos `count`, `next`, `previous`, `results`): `count` = 35. Nomes, em ordem: national, kanto, original-johto, hoenn, original-sinnoh, extended-sinnoh, updated-johto, original-unova, updated-unova, conquest-gallery, kalos-central, kalos-coastal, kalos-mountain, updated-hoenn, original-alola, original-melemele, original-akala, original-ulaula, original-poni, updated-alola, updated-melemele, updated-akala, updated-ulaula, updated-poni, letsgo-kanto, galar, isle-of-armor, crown-tundra, hisui, paldea, kitakami, blueberry, lumiose-city, hyperspace, champions.
- `GET /pokedex/{nome}` (ex. kanto): campos `id`, `name`, `is_main_series`, `descriptions`, `names`, `pokemon_entries`, `region`, `version_groups`. Cada item de `pokemon_entries` = `{ entry_number, pokemon_species: { name, url } }` (a `url` termina no id da especie). Contagens verificadas: kanto 151, hoenn 202, original-sinnoh 151, galar 400, hisui 242, letsgo-kanto 153. A pokedex `national` nao e usada como filtro de jogo.
- `GET /version-group?limit=100`: `count` = 32. Nomes, em ordem: red-blue, yellow, gold-silver, crystal, ruby-sapphire, emerald, firered-leafgreen, diamond-pearl, platinum, heartgold-soulsilver, black-white, colosseum, xd, black-2-white-2, x-y, omega-ruby-alpha-sapphire, sun-moon, ultra-sun-ultra-moon, lets-go-pikachu-lets-go-eevee, sword-shield, the-isle-of-armor, the-crown-tundra, brilliant-diamond-shining-pearl, legends-arceus, scarlet-violet, the-teal-mask, the-indigo-disk, red-green-japan, blue-japan, legends-za, mega-dimension, champions.
- `GET /version-group/{nome}`: campos `pokedexes[]`, `versions[]`, `regions[]`, `generation`, `order`. Mapa version-group -> pokedexes -> versions (verificado um a um):
  - firered-leafgreen (order 11): kanto; firered, leafgreen
  - ruby-sapphire (7): hoenn; ruby, sapphire. emerald (8): hoenn; emerald
  - diamond-pearl (12): original-sinnoh; diamond, pearl. platinum (13): extended-sinnoh; platinum
  - heartgold-soulsilver (14): updated-johto; heartgold, soulsilver
  - black-white (15): original-unova; black, white. black-2-white-2 (16): updated-unova; black-2, white-2
  - x-y (17): kalos-central, kalos-coastal, kalos-mountain; x, y
  - omega-ruby-alpha-sapphire (18): updated-hoenn; omega-ruby, alpha-sapphire
  - sun-moon (19): original-alola + original-melemele/akala/ulaula/poni; sun, moon. ultra-sun-ultra-moon (20): updated-alola + updated-melemele/akala/ulaula/poni; ultra-sun, ultra-moon
  - lets-go-pikachu-lets-go-eevee (21): letsgo-kanto; lets-go-pikachu, lets-go-eevee
  - sword-shield (22): galar, isle-of-armor, crown-tundra (os DLCs estao DENTRO do grupo base); sword, shield. the-isle-of-armor (23): isle-of-armor. the-crown-tundra (24): crown-tundra (versoes `the-..-sword/shield`)
  - brilliant-diamond-shining-pearl (25): original-sinnoh (o mesmo de DP); brilliant-diamond, shining-pearl
  - legends-arceus (26): hisui; legends-arceus
  - scarlet-violet (27): paldea, kitakami, blueberry (DLCs dentro do grupo base); scarlet, violet. the-teal-mask (28): kitakami. the-indigo-disk (29): blueberry
  - (ver 9.2 para os version-groups antigos e Z-A, agora verificados; colosseum, xd e champions seguem sem GET individual.)
- `GET /pokemon-species/{id|nome}` (ex. pikachu, id 25): traz `pokedex_numbers[] = { entry_number, pokedex: { name, url } }` (22 entradas para o Pikachu: national, kanto, original-johto, hoenn, original-sinnoh, extended-sinnoh, updated-johto, conquest-gallery, kalos-central, updated-hoenn, original-alola, original-melemele, updated-alola, updated-melemele, letsgo-kanto, galar, isle-of-armor, hisui, paldea, kitakami, lumiose-city, champions), alem de `generation`, `varieties[]` (`is_default`). Um unico GET por especie (1025) da todas as dexes; alternativa: ~35 GETs de `/pokedex/*` (menos requisicoes, mesma informacao). `GET /pokemon-species?limit=1&offset=1020` => `count` 1025 (ultimo id 1025, Pecharunt).
- `/pokemon/{id}/encounters` existe (lista de locais/versoes onde o Pokemon aparece na natureza), fora de escopo (nao cobre troca, evolucao, presente, legendarios fixos de forma consistente).

### 9.2 O que "esta no jogo X" significa e lacunas conhecidas

- Regra candidata: especie esta no jogo (version-group G) se existe entrada em qualquer pokedex de `G.pokedexes` (uniao). Funciona porque o recurso do version-group lista as pokedexes.
- FRLG: `kanto` = so os 151 originais. Em FireRed/LeafGreen o jogo tambem tem Ilhas Sevii e a Nacional pos-game (ate 386 via troca/Hoenn), que a PokeAPI NAO modela em `kanto`. Para o caso do Pontin (so a gen 1 em FireRed) a regional bate, mas "o que existe em FRLG" fica subcontado.
- Pokedex compartilhada por varios version-groups: `original-sinnoh` serve DP e BDSP (151 entradas, nao ha dex propria do BDSP); `hoenn` serve RS e Emerald; `kanto` serve RB, Y, FRLG e os japoneses; `updated-hoenn` so ORAS. Logo a pokedex sozinha nao distingue o jogo; sempre passar por `version-group.pokedexes`.
- DLC: Sword/Shield e Scarlet/Violet incluem as dexes de DLC no proprio grupo base (`isle-of-armor`, `crown-tundra`; `kitakami`, `blueberry`), e ainda ha os grupos de DLC separados. Para "disponivel em SwSh" a uniao das tres inclui DLC (precisa decidir se o DLC e rotulado a parte).
- Legends Arceus usa `hisui` (242); ha especies de outras gens listadas (ex. Pikachu entrada 56, Wyrdeer 50, Ursaluna 114).
- `pokedex_numbers` do Pikachu NAO traz `blueberry`/`hyperspace`/outras: so aparece onde ha entrada.
- Version-groups antigos e novos verificados com GET real (2026-10-12): red-blue e yellow -> pokedex `kanto` (regiao kanto, gen I, versions red/blue e yellow); gold-silver e crystal -> pokedex `original-johto` (regioes kanto e johto, gen II; versions gold/silver e crystal); legends-za -> pokedexes `lumiose-city` e `hyperspace` (gen IX, sem regiao listada, version legends-za); mega-dimension -> pokedex `hyperspace` (gen IX, sem regiao, version mega-dimension). `GET /pokedex/original-johto`: is_main_series true, 251 entradas, region johto, version_groups gold-silver e crystal. `GET /pokedex/lumiose-city`: is_main_series true, 232 entradas, region kalos, version_groups so legends-za. Nao verificados individualmente: colosseum, xd, champions (e a pokedex `champions`). Colosseum/XD nao sao jogos da Pokedex regional da lista pedida.
- Versao individual (FireRed vs LeafGreen) nao e diferenciada pelas pokedexes (exclusivos de versao nao aparecem); so `encounters` diferencia (fora de escopo).

### 9.3 Licenca, uso justo e dump estatico

- Docs (https://pokeapi.co/docs/v2): API "free and open to use"; exige respeitar a fair use policy: cache local dos recursos pedidos, sem autenticacao; rate limit removido apos a migracao para hospedagem estatica, mas pede-se limitar a frequencia de chamadas; IP pode ser banido por abuso. A pagina lida nao traz clausula de atribuicao (nao confirmado: o trecho final da pagina ficou fora da leitura).
- Dump estatico: https://github.com/PokeAPI/api-data ("Static JSON data from the API, plus a JSON Schema"), licenca BSD-3-Clause, pastas `data/api/v2/...` e `data/schema/`. O pipeline poderia vendorizar so o recorte necessario (35 pokedexes + 32 version-groups, ou o resultado ja reduzido) em vez de bater na API viva.
- O pipeline JA usa a PokeAPI viva com cache em disco: `tools/dataset/src/pokeapi/client.ts` (`POKEAPI_BASE`, User-Agent `pontindex-dataset`, timeout 20s, concorrencia 6, backoff 1s..16s, cache sha1 por URL em `tools/dataset/.cache/pokeapi/`, `--offline` = so cache). O cache fica fora do git (`.gitignore`: `tools/dataset/.cache/`), logo o modo offline em outro PC so funciona se o cache existir.

### 9.4 Chave de juncao

- Chave recomendada: numero nacional (`dex` do `species-index.json`) == id numerico de `pokemon-species` na PokeAPI. Verificado: o indice tem dex 1..1025 sem buracos (0 faltando) e a PokeAPI tem 1025 especies; exemplos conferidos no pack: 29 nidoranf, 32 nidoranm, 128 tauros (slug unico, forma regional vem como label `kantonian_form`, nao como especie extra), 718 zygarde, 808 meltan (gen7b), 1025 pecharunt. O id vem da `url` de `pokemon_entries[].pokemon_species.url` ou do `id` da especie; nao juntar por nome (nomes PokeAPI como `nidoran-f`/`mr-mime` diferem do slug Cobblemon).
- Nao junta: `dex` 9901 (piglich) e 9902 (creepyon), `generation: custom` (sem equivalente na PokeAPI; ficam com lista vazia ou rotulo "so no pack").
- Formas (Mega, Gmax, regionais): a disponibilidade e da ESPECIE (dex base). Formas regionais do pack vivem em `forms[]`/`labels` e nao tem entrada propria em `pokedex_numbers` (a PokeAPI as lista em `varieties`); nao ha dex de jogo por forma nesse recurso.
- O pipeline ja junta por dex: `tools/dataset/src/artwork-ids.ts` chama `pokemon-species/<dex>` para dex 1..`MAX_ARTWORK_DEX` (padrao a seguir).

### 9.5 Como o pipeline versiona dados externos hoje

- Dois padroes existentes. (A) Snapshot do pack: `data-source/` (README em `data-source/README.md`, contagens e `additions` em `data-source/atm-1.3.0/MANIFEST.json`); cada acrescimo e datado e registrado no README. Serve a arquivos extraidos de jars/instancia.
- (B) Dados curados e versionados: `tools/dataset/curated/*.json` (`item-not-registered.json`, `bait-seasoning-extra.json`, `item-descriptions.json`). ESTE e o padrao que a feature segue (decisao da IDEA secoes 2 e 11): o recorte `tools/dataset/curated/pokeapi-game-availability.json` e gerado por script a mao a partir da PokeAPI (reusando `pokeapi/client.ts` e seu cache) e lido pelo pipeline sem rede; falta do arquivo = erro claro. Nao vai para `data-source/` (que e so do pack). Registrar a origem (URLs, data da geracao) dentro do proprio JSON ou no `tools/dataset/README.md`.
- Etapas do pipeline em `tools/dataset/src/index.ts` (`speciesCore` -> `speciesDerive` -> `pokeapi` -> ... -> `write`); a etapa `pokeapi` (`pokeapi/stage.ts`) ja roda `runMoves`, `runAbilities`, `runSprites`, `runArtworkIds`; um `runGameAvailability` natural entra ai, antes do `write`. Contagens por etapa via `COUNT_OWNERS` em `context.ts`.
- Nome da pasta do dataset: `atm1.3.0-cobblemon1.7.3-<data>-<8 hex>` (`buildDatasetVersion` em `species/index-writer.ts:224`; o `dataset-manifest.json` guarda `sources`). Mudar o conteudo publicado gera nova pasta e atualiza `public/data/current.json` (`write.ts` apaga as pastas antigas). Contrato novo = `schemas.ts` + `types.ts` + `published-schemas.test.ts` + republicacao (LESSONS 2026-09-29).

### 9.6 Tamanho e service worker

- `species-index.json` hoje: 293.243 bytes (36.163 bytes com gzip), 1027 especies, ~285 bytes/especie.
- Se cada especie ganhar uma lista de ids de jogo/version-group (ex. ate ~25 ids curtos, media menor porque so ~65% das especies existem em gens antigas; media estimada 12 a 18 ids x ~4 bytes `"fr",` = ~50 a 100 bytes): +50 a +100 KB cru (~+17 a +35%), pouco no gzip por repeticao. Alternativa compacta: bitmask numerico por especie (1 inteiro de ~6 digitos, +~9 KB). Opcao 3: arquivo separado `game-availability.json` carregado so no Dex quando o filtro de jogo for usado.
- O indice E precacheado pelo service worker: `vite.config.ts:68` inclui `data/<datasetVersion>/{dataset-manifest,species-index,type-chart}.json` no `globPatterns`; engordar o `species-index.json` aumenta o precache e o carregamento de boot. O `species/<dex>.json` (detalhe) nao e precacheado (runtime CacheFirst, regex `/data/...json`). Um arquivo novo so entra no precache se for adicionado a esse glob.
