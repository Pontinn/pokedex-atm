---
feature: type-chart
language: pt-BR
code_identifier_language: en - espelha o codigo existente (camelCase/PascalCase, modulos kebab-case ou PascalCase por componente, chaves i18n em ingles "grupo.chave")
generated: 2026-10-12
stack: React 19.1 + TypeScript 5.8 + Vite 6 PWA (vite-plugin-pwa), Zustand 5 (pilha de navegacao propria, sem router), Vitest 3 + Testing Library (jsdom), Playwright 1.63 headless, CSS puro por tela
---

# CONTEXT - type-chart (pagina "Tipos")

## 0. Baseline (drift anchor)

- HEAD: `9e848ad1327214fee40e2a5c77b2579dadaa619c` (branch `feature/type-chart`; codigo identico a f0a82aa3 e a main cee51235; so a IDEA/STATE mudaram; os blobs de codigo abaixo continuam validos)
- IDEA fingerprint: `git hash-object .forge/ideas/type-chart/IDEA_type-chart.md` = `6f07242ebd3424357b886d815ba30f7daf7cd5da` (inclui a decisao [14:58])
- Arquivos analisados (`path - blob hash`, via `git rev-parse HEAD:<path>`):
  - src/domain/type-chart.ts - 523b99cd7cebbdd5734c8472a3f9a26fd0b19d5d
  - src/components/TypeChip.tsx - d59123ddeeba474c33172d3c47e10b38fc423b47
  - src/components/TypeIcon.tsx - d40f9f62779a16aebc6018cd25ac36c7300755c0
  - src/assets/types/fire.svg (amostra dos 18) - 956fb8ba6f0a2876b294c482b9f672671b21a20b
  - src/styles/types.generated.css - eb964a397d3d6d982cc6b1599616b82c8f33ac3d
  - tools/gen/type-css.ts - 6b2210f5c0370fc9fa7206ea005efbc41b98d84d
  - src/screens/Detail/TypeCalculator.tsx - 0906d2d74663a1f7e79acb16a1a48b7979a6d9c7
  - src/screens/Detail/WeaknessPanel.tsx - 38a12ce3f518fd9e8242aeeddd6446cafc04ae3d
  - src/components/nav-items.ts - d9f41614b0ba201e0eb7540b4c4345f15a650988
  - src/components/SegmentedControl.tsx - fcdbaa78eea6406cfa5774acebab9fcb7e55ef82
  - src/components/ScreenRouter.tsx - 154bea7e086ef32daf16c9fd4b6139c5c72f0778
  - src/components/TabBar.tsx - bff9cbdf5c037ab640a269af1bbb26f27904556e
  - src/components/Sidebar.tsx - 387da255b5f61fee9b862e9c64fe55b7996406de
  - src/components/MoreSheet.tsx - a22372f9d6672e39981f6108bb8e8a47a164f76b
  - src/components/TermsToggle.tsx - 5a8cd90e294109c9efe7ad14d668f35d9fe19efd
  - src/screens/registry.ts - 795df83680e94efb621275ad04649d75ce4ff175
  - src/screens/Compare/CompareScreen.tsx - 6081528423502f75f99051e7263dc5512e6f2f07
  - src/screens/Compare/compare.css - fb728cebd30c4795cfa537dffe40f91c92d234cf
  - src/navigation/types.ts - 35630c204dbde37016ef2d772e2107dc6b53a4c9
  - src/navigation/navigation-store.ts - c9d46ab973b0cc40ed14fcb7b32928640925b815
  - src/navigation/useNavigation.ts - dd286cb650225dc62d925d42ff3d7aa7b82976eb
  - src/i18n/messages.ts - 5138f2d1789beeb73c881da2df0c0374df41c810
  - src/i18n/messages/core.ts - 4c635cfc61ce1103adc0f737409daf4363786360
  - src/i18n/messages/compare.ts - f30aa6dc22b4f9915c1646454871085758ea627f
  - src/i18n/types.ts - 727356b5b237cff3742e06cac491caea6f17d09d
  - src/i18n/useT.ts - 9ed2b560d188aa64125979bd656535b81df70688
  - src/state/preferences-store.ts - 2b32bf0ba65ad266c22a9c39f9cf6e81b3c2d44b
  - src/styles/components.css - 097f1ee4311a43f2284b96b18f2d160aa6d5c2bd
  - src/styles/themes.css - ba927bad413fa5844a47a628e0a50c934792eab9
  - src/styles/mobile.css - 813f2987640fb94b7d0115515219db797c859248
  - src/screens/Detail/detail.css - cd52710c05bd10d51fcd4e53a43b2bd93eded223
  - tests/harness/no-overlap.ts - db6c6a3b80c5eae83d47c64a7edbd6c31129939b
  - tests/unit/domain/type-chart.test.ts - 763d354dfcfc9dd1ff165e9d2b2d5c293820fe54
  - tests/unit/ui-screens/compare-screen.test.tsx - 4e7757dc3bf38b9d15b8da806cdd42a786fedb6d
  - tests/unit/ui-shell/shell.test.tsx - 2b20e63161c10db01c1c561916eac1fcf15c7eb7
  - tests/e2e/compare.spec.ts - c6a9804350152b41f83538193562d763fdeceffe
  - tests/e2e/shell.spec.ts - 814ffbe4e0301c2438271ae230f992c8f1cdb3f9
  - eslint.config.js - ecf109ff7a576bb6e2e588c619f78193f69a72d2
  - vite.config.ts - 1e0035bdd4c0ff06c0d6240acc821af8d74d5364
  - .forge/LESSONS.md - 753caf6ced364872b59c6d5595642dcbccaa128e

## 1. Stack & build

(verificado em package.json, vitest.config.ts, playwright.config.ts, eslint.config.js)
- Node >= 24; React 19.1.9, TS 5.8.3, Vite 6.3.7, vite-plugin-pwa 1.0.3, zustand 5.0.15, lucide-react 0.577.0 (icones de UI). Sem router: pilha propria em Zustand.
- Scripts: `npm run dev` (vite), `build` (`tsc -b && vite build`; `prebuild` roda `gen:assets`), `typecheck` (`tsc -b --noEmit`), `lint` (`eslint .`), `test` (vitest), `test:e2e` (playwright), `test:harness`, `gen:assets` (`tsx tools/gen/type-css.ts && tsx tools/gen/icons.ts`).
- Vitest: jsdom, `include tests/unit/**/*.test.{ts,tsx}`, setup `tests/setup.ts`, testTimeout 20000; limiares de cobertura: global 80%, `src/domain/**` 95%, `src/components/**` 70%, `src/screens/**` 70% (linhas e branches). Arquivos de dominio sem DOM usam `// @vitest-environment node` (ex. type-chart.test.ts).
- Playwright: headless, sem slowMo, sem sleeps; `PW_DEV=1 PW_PORT=<porta>` usa o dev server (1 worker), sem PW_DEV faz build + preview na 4173; `serviceWorkers: "block"` por padrao. Comando tipico: `PW_DEV=1 PW_PORT=4177 npx playwright test tests/e2e/<spec>.ts`.
- Nao rodei install nem build (conforme pedido).

## 2. Relevantes: arquivos e modulos

Dominio e dados de tipo
- `src/domain/type-chart.ts` - fonte unica. `TYPE_IDS` (l.5-8, 18 ids ordem canonica: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy); `AttackerRow` (l.10-14); `TYPE_CHART` (l.16-35); `Effectiveness = 0|0.25|0.5|1|2|4` (l.37); `singleMultiplier(attacker, defender)` (l.40-46, devolve `TypeMultiplier`); `effectivenessAgainst(defenders[])` (l.49-57, produto por atacante, lista vazia = tudo x1); `MultiplierGroup` (l.59-62); `groupByMultiplier(map)` (l.67-72, ordem 4,2,0.5,0.25,0; omite x1 e grupos vazios); `typeChartMatrix()` (l.75-81, matriz atacante->defensor completa de `singleMultiplier`: serve direto a matriz 18x18).
- `src/data/types.ts` - `TypeId` (union dos 18, l.6), `TypeMultiplier`; compartilhado com o pipeline do dataset (alias `@dataset-types`).
- `src/i18n/types.ts` - `TYPE_NAMES: Record<TypeId, {pt,en}>` (nomes dos 18 tipos: Normal, Fogo/Fire, Agua/Water ...).
- `src/components/TypeChip.tsx` - `TypeChip({type, lang, size "sm"|"md"|"lg", selected?, className?})` (l.23), `typeName(type, lang)` (l.18, capitaliza). Renderiza `<span class="chip t-<type> [sm|lg] [on]" data-type>` com `TypeIcon` + nome. E `span`, NAO botao: para chips selecionaveis a pagina precisa de wrapper `button` (ver como o Dex faz em 3).
- `src/components/TypeIcon.tsx` - `TypeIcon({type, className?})` (l.20): `<span class="ti t-<type>" aria-hidden><img/></span>`; `typeIconUrl(type)` (l.11) via `import.meta.glob("../assets/types/*.svg", eager, ?url)`. Icone e circulo na cor do tipo com SVG branco; `aria-hidden`, entao o nome acessivel tem de vir do botao/celula. Tamanho padrao 22px (`components.css` l.85); variantes por contexto `.chip.sm .ti` 18px e `.chip.lg .ti` 28px; para icones GRANDES (faixas) sera preciso CSS novo para `.ti` em contexto novo (a classe nao tem tamanho "xl").
- `src/assets/types/*.svg` - 18 arquivos `<type>.svg` (bug, dark, dragon, electric, fairy, fighting, fire, flying, ghost, grass, ground, ice, normal, poison, psychic, rock, steel, water). Gerados/copiados por `tools/gen/icons.ts`.
- `src/styles/types.generated.css` - GERADO (nao editar) por `tools/gen/type-css.ts` a partir de `design/tipos/cores.json` (campos `base`, `a`, `b`). `:root` define `--t-<type>`, `--type-<type>-a`, `--type-<type>-b`; depois `.t-<type> { --tc; --g1; --g2 }` por tipo. Importado em `src/main.tsx` (l.5), global.

Navegacao
- `src/navigation/types.ts` - `ScreenId` union (l.4-15: home, dex, detail, captured, compare, trainers, balls, items, item, settings, sync); `SCREEN_IDS` (l.17-29); `ScreenParamsMap` (l.31-43); `UiStateMap` (l.64-84); `defaultUi(screen)` (l.99-, tem `{ [K in ScreenId]: () => UiStateMap[K] }`: faltar entrada para a tela nova e erro de TS).
- `src/navigation/navigation-store.ts` - Zustand: `navigate(screen, params?, ui?)` (l.16/81), `go(screen)` (chama navigate sem params; l.98), `goBack(fromPopstate?)`, `updateUi<S>(patch: Partial<UiStateMap[S]>)` (l.18/101); limite da pilha 40 (l.7); `pushHistory` (l.68, `history.pushState({pontindex:id})`).
- `src/navigation/useNavigation.ts` - `useScreenUi(screen, key)` (l.16, le UM campo de `current.ui`), `useNavigationActions()` (l.20, `{navigate, go, goBack, updateUi}`), `useCurrentScreen`.
- `src/navigation/history-bridge.ts` - popstate/Alt+Seta -> `goBack(true)`. Nada a mudar.
- `src/components/ScreenRouter.tsx` - renderiza `screens[screen]` dentro de `<div class="screen" data-screen={screen} data-entry-id>` com `key={entryId}`; `ScreenRegistry = Partial<Record<ScreenId, ComponentType<ScreenProps>>>`; `ScreenProps = {entryId, params}`.
- `src/screens/registry.ts` - `SCREENS = {...} satisfies Required<ScreenRegistry>` (l.19-31): TODO ScreenId precisa de entrada (teste do shell l.66 compara `Object.keys(SCREENS)` com `SCREEN_IDS`). Importa cada tela diretamente; so `sync` e `lazy` (l.17).
- `src/components/nav-items.ts` - `NavItemDef {screen, labelKey: MessageKey, subKey?, icon: LucideIcon|null}` (l.7-13); `SIDEBAR_ITEMS` (l.15-25); `TAB_SCREENS = ["home","dex","captured","compare"]` (l.27); `MORE_ITEMS = SIDEBAR_ITEMS.filter(!TAB_SCREENS)` (l.29); `navOwner(screen)` (l.32: detail->dex, item->items). `Sidebar.tsx` (l.38) itera `SIDEBAR_ITEMS`; `TabBar.tsx` (l.7-18) usa `TAB_ITEMS` (os 4 de TAB_SCREENS) + botao "Mais" e acende "Mais" se o ativo esta em `MORE_ITEMS`; `MoreSheet.tsx` itera `MORE_ITEMS` (botoes `data-nav`, `go(item.screen)`), depois os links "Feito por Pontin" e "GitHub".
- `src/components/Icon.tsx` - reexport explicito dos icones lucide usados (l.3-53). Decisao IDEA [14:58]: icone da nav = `Shapes` (fallback `Layers`); ambos existem em lucide-react 0.577.0 e nenhum esta no reexport nem em uso, entao devem ser ADICIONADOS aqui. Icones usados na nav hoje: House, List, ArrowLeftRight, Swords, CircleDot, Backpack, QrCode, Settings.

Estrutura de telas existentes (ScreenId -> pasta/componente; posicao atual na barra)
| ScreenId | Componente | Nav (desktop SIDEBAR_ITEMS) | Mobile |
|---|---|---|---|
| home | `src/screens/Home/HomeScreen` | 1 Inicio | aba |
| dex | `Dex/DexScreen` | 2 Pokedex | aba |
| detail | `Detail/DetailScreen` | (acende dex via navOwner) | |
| captured | `Captured/CapturedScreen` | 3 Capturados | aba |
| compare | `Compare/CompareScreen` | 4 Comparar | aba |
| trainers | `Trainers/TrainersScreen` | 5 Treinadores | Mais |
| balls | `Balls/BallsScreen` | 6 Pokebolas | Mais |
| items | `Items/ItemsScreen` | 7 Itens & Comidas | Mais |
| item | `Item/ItemScreen` | (acende items) | |
| sync (lazy) | `Sync/SyncScreen` | 8 Sincronizar | Mais |
| settings | `Settings/SettingsScreen` | 9 Configuracoes | Mais |
Nao ha rota por URL: tudo via pilha interna + `history.pushState`. Decisao IDEA [14:58]: "Tipos" entra em `SIDEBAR_ITEMS` logo depois de `compare` (antes de `trainers`), ficando no 5o lugar do sidebar e no 1o da folha "Mais" no celular.

i18n
- `src/i18n/messages.ts` - agregador: `MESSAGE_MODULES` (l.24-38, 13 modulos: core, home, dex, detail, capture, captured, compare, trainers, balls, items, item, settings, sync), `MESSAGES` (spread, l.40-54), `type MessageKey = keyof typeof MESSAGES` (l.56). Cabecalho diz "congelado apos F1.4" - ainda assim e o ponto onde um modulo novo e registrado (2 edicoes: import + entrada em `MESSAGE_MODULES` + spread em `MESSAGES`).
- `src/i18n/messages/<modulo>.ts` - formato: `export const COMPARE_MESSAGES = { "compare.vs": { pt: "VS", en: "VS" }, ... } as const satisfies Record<string, Message>;` (import `type { Message } from "./types"`). Interpolacao `{n}`.
- `src/i18n/messages/core.ts` - chaves de nav: `nav.home` l.7, `nav.dex` l.8, `nav.captured` l.9, `nav.compare` l.10, `nav.settings` l.11, `nav.settingsShort` l.12, `nav.trainers` l.44, `nav.balls` l.45, `nav.items` l.46, `nav.more` l.47, `nav.*Sub` l.48-51, `nav.sync` l.78, `nav.syncSub` l.79. Convencao para a chave nova: `nav.types` (+ opcional `nav.typesSub`) em core.ts; chaves da tela em modulo novo `src/i18n/messages/types-page.ts` ou similar (o arquivo `messages/types.ts` ja existe e e o TIPO `Message`, nao colidir).
- `src/i18n/useT.ts` - `useT()` (l.40) le `uiLanguage`; `translate` lanca `MissingMessageError` em dev se a chave nao existe (o teste falha); `TranslationKey = MessageKey | (string & {})` permite chaves montadas em runtime (ex. `` `typeHint.${type}` ``), mas chave inexistente quebra em dev: o teste de completude deve cobrir as 18.
- `tests/unit/ui-shell/i18n-modules.test.ts` - confere uniao disjunta dos modulos e pt/en nao vazios em toda chave: o modulo novo entra automaticamente se registrado em `MESSAGE_MODULES`.
- `src/state/preferences-store.ts` - `uiLanguage` (idioma da interface); `termsLanguage` (l.19) + `termsOverrides` (l.20) = idioma dos TERMOS de jogo por card; `useTermsLanguage(cardKey)` (l.134-136) devolve `termsOverrides[cardKey] ?? termsLanguage`.
- `src/components/TermsToggle.tsx` - toggle PT|EN por card `<TermsToggle cardKey="..."/>`; usa chaves `terms.*`.

## 3. Padroes e features semelhantes

Calculadora de tipos (mais proxima) - `src/screens/Detail/TypeCalculator.tsx`
- `EFFECT_LABEL: Record<Effectiveness, {text, cls}>` (l.13-20): 4 `x4`/`mult-4`; 2 `x2`/`mult-2`; 1 `x1`/`mult-1`; 0.5 `x½`/`mult-half`; 0.25 `x¼`/`mult-quarter`; 0 `x0`/`mult-0`. Existe uma copia quase igual `MULT_LABEL` em `WeaknessPanel.tsx` l.15-21 (sem a chave 1). Reusar o simbolo `x½`/`x¼` mantem coerencia; importar de TypeCalculator acoplaria a pagina ao Detail (preferivel extrair ou duplicar uma constante na pagina nova; decisao da SPEC).
- `isType` (l.22) e `selectedTypes(inputs, initial)` (l.25-30, exportada): t1 obrigatorio, t2 opcional, `t2 !== t1`. Mesma regra "2o tipo != 1o" que a IDEA exige; a tela nova guarda `types: TypeId[]` no `ui` em vez de `calcInputs` string-map.
- Estado no `ui`: `setTypeInput` (l.32-35) le `useNavigationStore.getState().current.ui` e chama `updateUi<"detail">({calcInputs})`; leitura por `useScreenUi("detail","calcInputs")` (l.40). Padrao exato a espelhar com `updateUi<"types">`.
- Grade: `.type-calc-grid` (detail.css l.316, `repeat(auto-fill,minmax(150px,1fr))`, mobile 2 colunas l.321), `.tc-cell` (l.317, flex chip + `.mult`), `.mult` (detail.css l.93, fonte display 15px, padding 4px 8px) com cores FIXAS (nao dependem do tema): `.mult-4 #FFD9D9/#A10F0F`, `.mult-2 #FFE9D6/#9A4A00`, `.mult-half #E1F5E7/#1B6B3A`, `.mult-quarter #C9EED6/#0F5A2C`, `.mult-0 #E6E7EC/#444A5C`, `.mult-1` usa `var(--surface)`/`var(--muted)` (l.319). Atencao: esses estilos vivem em `src/screens/Detail/detail.css`, carregado por import da tela Detail; na pagina nova as classes so existem depois que o chunk/CSS de Detail carrega. Como as telas sao importadas estaticamente no `registry.ts` (so Sync e lazy), o CSS de Detail ja esta no bundle; ainda assim a pagina nova NAO deve depender de classe de outra tela: definir suas proprias classes em `src/screens/Types/types.css`.
- `calc.typeTitle`, `calc.type1`, `calc.type2`, `calc.typeNone` (messages/detail.ts) ja existem para "tipo 1/tipo 2/nenhum" (podem ser reaproveitados no nice-to-have de 2 tipos ou duplicados em chaves da pagina nova).

Fraquezas na ficha - `src/screens/Detail/WeaknessPanel.tsx`
- `WeakGrid` (l.~28-52): `groupByMultiplier(effectivenessAgainst(types))` -> `.weak-grid`/`.weak-row` (detail.css l.91-92: `52px 1fr`, `.chips` flex wrap). E a "visao Defendendo" em formato lista de chips; a pagina nova refaz em faixas de icones grandes.
- `WeakSelector` usa `SegmentedControl<WeakFilter>` com `className="seg-sm"` e `ariaLabel`; estado em `current.ui.weakFilter` via `updateUi<"detail">`.

Abas / controle segmentado (EXISTE, reusar)
- `src/components/SegmentedControl.tsx` (l.9-37): generico `SegmentedControl<V extends string>({options:{value,label}[], value, onChange, className?, ariaLabel?})`; renderiza `<div class="seg [className]" role="group" aria-label>` com `<button type=button class="active" aria-pressed>`. Nao e `role=tablist`; as "abas" do app sao grupos de botoes com `aria-pressed`. Usado em: Dex (`DexFilters.tsx`), Balls, Captured, Items, Settings (`LanguageCard`, `TermsCard`), Sync, `WeaknessPanel`, `SyncSummary`.
- CSS: `.seg` (components.css l.119-122, pilula `--surface-2`, ativo `var(--secondary)`/`var(--on-secondary)`), `.seg-tabs` (l.123, `max-width:100%; overflow-x:auto`), `.seg-sm` (detail.css l.90). Mobile: `.app.mobile .seg-tabs` vira faixa de largura total (mobile.css l.28); `.app.mobile .panel-head .seg:not(.terms-tgl)` ocupa a linha (detail.css l.97-98).
- Estado de aba na pilha: `captured: {tab}`, `items: {category}`, `balls: {filter}`, `detail: {moveTab, weakFilter}`.

Grade de chips no Dex - `src/screens/Dex/DexFilters.tsx`
- Filtro de tipos: chips clicaveis (`.chips-scroll .chip` com `cursor:pointer`, `.chip.on` com anel `box-shadow` + `.chip-check`, components.css l.79-82; "nao selecionado = contorno, nunca opacidade" no comentario de TypeChip). Estado `ui.filters.types: TypeId[]`. Padrao a espelhar para os 18 chips selecionaveis (usar `button` envolvendo o chip/icone e `aria-pressed`).

Outro exemplo de tela completa a espelhar - `src/screens/Compare/` (CompareScreen.tsx, ComparePicker.tsx, compare-model.ts, compare.css): import do CSS no topo (`import "./compare.css"`), `ScreenProps`, `useNavigationActions`/`useScreenUi`, separacao modelo puro (`compare-model.ts`) x componente (modelo testado em `tests/unit/ui-screens/compare-model.test.ts`).

Referencias de UI para `forge-ui-recon` (modo project-identity; shell: desktop sidebar 236px, mobile < 900px)
- Home: ScreenId `home`, `src/screens/Home/HomeScreen.tsx` (root `.home-screen`), cards `.card`, `.home-grid`.
- Dex: ScreenId `dex`, `src/screens/Dex/DexScreen.tsx` + `DexFilters.tsx` (chips de tipo + `SegmentedControl`), `.poke-grid`, css `dex.css`.
- Ficha com calculadora: ScreenId `detail` (params `{dex}`), `src/screens/Detail/DetailScreen.tsx`; paineis `WeaknessPanel.tsx` (`.weak-grid`) e `TypeCalculator.tsx` (`.type-calc`, `#type-calc`, abre com `ui.calcOpen`); selects `#c-t1`/`#c-t2`; css `detail.css`.
- Navegacao: selectors `.sidebar .nav-item`, `.tabbar .tab-more`, `.more-sheet .sheet-item[data-nav]`.

## 4. Arquitetura e dados

- Forma de `TYPE_CHART`: `Record<TypeId, AttackerRow>`; `AttackerRow` = `{2: TypeId[]; 0.5: TypeId[]; 0: TypeId[]}`. Semantica: chave = ATACANTE, listas = DEFENSORES; ausente = x1. Formato "atacante -> {2, 0.5, 0}" confirmado. Linhas contem Fairy (tabela Gen 6+). Conferido: fire 2 = [grass, ice, bug, steel], 0.5 = [fire, water, rock, dragon], 0 = [] (bate com o exemplo da IDEA, secao 7).
- Visao Atacando de X = `TYPE_CHART[X][2|0.5|0]` direto. Visao Defendendo de X = `effectivenessAgainst([X])` agrupado por `groupByMultiplier` (grupos 2, 0.5, 0; x1 omitido) ou `TYPE_IDS.filter(a => singleMultiplier(a, X) === m)`. Defesa de 2 tipos = `effectivenessAgainst([t1, t2])` (x4, x1/4 ja suportados).
- `groupByMultiplier` OMITE grupos vazios; a IDEA exige mostrar "nenhum" para grupo vazio: a pagina nao pode usar `groupByMultiplier` cru para os 3 grupos fixos (derivar com filtro por multiplicador ou completar os grupos ausentes).
- Matriz 18x18: `typeChartMatrix()` (type-chart.ts l.75) ou `singleMultiplier(atk, def)` por celula; `x1` celula neutra sem texto (decisao IDEA).
- Cores de tipo: `design/tipos/cores.json` -> `tools/gen/type-css.ts` -> `src/styles/types.generated.css` (`--t-<type>`, `--type-<type>-a/-b`, `.t-<type>{--tc,--g1,--g2}`). Usar `class="t-<type>"` num elemento expõe `--tc/--g1/--g2` para CSS da pagina (ex. fundo do cabecalho do tipo selecionado grande). Icones: `src/assets/types/<type>.svg` + `TypeIcon`. Nada a gerar para a pagina nova.
- Store de navegacao: `UiStateMap` por tela; `defaultUi` fornece o estado inicial. Para a tela nova: acrescentar `"types"` em `ScreenId` (l.4-15), `SCREEN_IDS` (l.17-29), `ScreenParamsMap` (`types: Record<string, never>`), `UiStateMap` (ex. `types: { selected: TypeId | null; tab: "attack"|"defend"; second: TypeId | null }`) e `defaultUi` (ex. `() => ({ selected: null, tab: "attack", second: null })`); registrar em `SCREENS` (registry.ts) e em `SIDEBAR_ITEMS`. Como `UiStateMap` e `defaultUi` sao exaustivos por `ScreenId`, o compilador aponta tudo que falta. Back/historico: `navigate` empurra entrada com copia do `ui`; `updateUi` altera so a entrada atual (nao re-renderiza a tela inteira, RF-04); `goBack` restaura `ui` salvo e `scroll`; a tela remonta com `key={entryId}`.
- ScreenId decidido (IDEA [14:58]): `types`, pasta `src/screens/Types/`. Nao ha colisao real com `src/i18n/messages/types.ts` (aquele e o tipo `Message`); modulo de mensagens da pagina deve ter nome distinto (ex. `types-page.ts`).

## 5. Pontos de integracao

Nenhum. A pagina e 100% local: sem rede, sem dataset (nao le `public/data`, nao usa `useDatasetStore`/`loaders`), sem backend, sem mudanca de contrato. Nem `data/type-chart.json` (publicado no dataset, usado so para conferencia em testes de B2.5, ver comentario type-chart.ts l.74) e necessario: a pagina le o modulo TS.

## 6. Convencoes

- Idioma dos identificadores: ingles. Componentes `PascalCase.tsx`; modelos/helpers `kebab-case.ts` (`compare-model.ts`, `use-filtered-species.ts`); chaves i18n `grupo.chave` camelCase; comentarios e prose do codigo em pt-BR sem acentos (padrao do repo: "Tabela de tipos (RF-17...)").
- Layout por tela: pasta `src/screens/<Tela>/` com `<Tela>Screen.tsx`, subcomponentes, modelo puro opcional e UM `<tela>.css` importado no topo do `Screen` (`import "./compare.css"`). Raiz da tela com classe propria (`.compare-screen`, `.detail-screen`, `.trainers-screen`, `.balls-screen`, `.home-screen`, `.settings`) usada pelos e2e. Estilos globais ficam em `src/styles/` (importados por `main.tsx`). Mobile por `.app.mobile ...` (classe aplicada em largura < 900 px, `useIsMobile`), nao por media query.
- Estado: `ui` da entrada da pilha, lido por `useScreenUi(tela, campo)` (1 campo por hook) e escrito por `updateUi<"tela">(patch)`; tipar em `UiStateMap`.
- Lint (`eslint.config.js`): regra propria `pontindex/no-literal-jsx-text` (erro): texto literal em JSX so em `src/i18n/`; ate `{"-"}` e escrito como expressao string (ver WeaknessPanel l.32 `<p className="muted">{"-"}</p>`). `no-restricted-syntax` proibe o em dash U+2014 em Literal, TemplateElement e JSXText (aplica-se a `**/*.{ts,tsx,js,mjs}`; `.forge/**`, `design/**` ignorados). `@typescript-eslint/no-unused-vars` com prefixo `_` ignorado; regras recomendadas de react-hooks. Consequencias: simbolos `x2`, `x½`, `x¼`, `x0` sao strings em constantes (como `EFFECT_LABEL`), nao texto em JSX; frases de intuicao e titulos de grupo vao para o dicionario i18n; `aria-label`/`title` tambem via `t()`.
- Acessibilidade: foco por `:focus-visible` (nao `:focus`; todo `select` tem `outline: 0` em components.css ~l.118 e usa `:focus-visible`, ver LESSONS 2026-10-12 sobre citar a propriedade real); estados de seleçao `aria-pressed` + classe `.active`/`.on`; cor sempre acompanhada de simbolo (`.mult` mostra `x2`, etc.); `TypeIcon` e `aria-hidden`, o nome acessivel vem do rotulo textual/`aria-label` do controle.
- Testes unitarios: `tests/unit/domain/*.test.ts` (dominio, ambiente node); `tests/unit/ui-screens/<tela>-screen.test.tsx` (RTL; padrao Compare: `vi.mock` de loaders, `resetNavigationStore`, `MemoryAdapter`, `translate`); `tests/unit/ui-shell/shell.test.tsx` e `i18n-modules.test.ts`. Tela sem dataset (como Tipos) nao precisa de mock de loaders: basta `render`, store de navegacao e preferencias.
- Testes e2e: `tests/e2e/<tela>.spec.ts`; boot com `boot(page, width, height)` (`#app`, `.boot` count 0, `#search-input` habilitado); navegar por clique real em `.sidebar .nav-item` / `.tabbar` + `.more-sheet` (nao depender de `/src/...` em `page.evaluate`); `trackConsoleErrors`; `expectNoOverlap(page, ".<tela>-screen")` do harness. Specs que ja usam o harness: balls, capture, captured, compare, detail, dex, home, item-obtain-v2, item, items, portfolio-link, responsive, settings, shell, sync, trainers (`grep -l no-overlap`). `tests/e2e/responsive.spec.ts` (tem snapshots em `responsive.spec.ts-snapshots`) e `tests/e2e/navigation.spec.ts` merecem leitura da SPEC por afetarem a barra.
- Harness `tests/harness/no-overlap.ts`: `findOverlaps`/`expectNoOverlap(page, root, {tolerance=1, controls, ignore})`; controles padrao = `button, [role=button], a[href], input, select, textarea, img, svg, .badge, .chip, .tag, .tgl, .seg, .switch`; falha se texto visivel cruza texto ou controle que nao seja ancestral/descendente. Para esta pagina: a celula da matriz com texto `x2` sobre um fundo colorido e OK (texto da propria celula), mas icone `img`/`.ti` dentro de cabecalho de matriz + rotulo de texto adjacente nao podem se tocar; icones grandes com nome embaixo precisam de espaco; NAO sobrepor texto a `img`/`.chip` (LESSONS: "selo sobre imagem reprova"); usar `ignore` so para decoracao. Sticky da primeira coluna: o cabecalho sticky pode cobrir celulas rolando: o harness mede retangulos, entao testar com scroll em zero e, se for sobrepor de proposito, discutir `ignore`.

## 7. Restricoes e riscos

- Precache/PWA: adicionar a tela NAO muda precache. `vite.config.ts` l.62-70: `globPatterns` = `**/*.{js,css,html,svg,woff2}` + `assets/*.{webp,png}` + dataset (so `current.json`, manifest, species-index, type-chart.json) + sfx. Os SVG dos 18 tipos ja entram (`svg`); o JS/CSS da tela entram no bundle. `maximumFileSizeToCacheInBytes: 4_000_000` (l.75): o chunk principal cresce pouco (modulos pequenos). `navigateFallback: /index.html` (nao ha rotas por URL). Se a tela for `lazy` (como Sync), gera chunk extra coberto pelo glob; nao e necessario para uma pagina leve.
- Temas (7: classic, black, green, blue, purple, white, orange; `THEME_IDS` em `src/styles/themes.ts` l.4; tokens em `themes.css`). Usar tokens `--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--secondary`, `--on-secondary`. Tema `black` (themes.css l.13-21) tem `--surface #111111`, `--surface-2 #1C1B15`, `--text #F4F2EA`, `--secondary #F5C518`. Risco: as cores `.mult-*` de `detail.css` sao pasteis FIXOS com texto escuro proprio; funcionam em qualquer tema porque trazem fundo e cor proprios, mas faixas coloridas novas (verde/ambar-vermelho/cinza) devem definir fundo E cor de texto juntos, e a borda/contorno contra `--surface #111` precisa de verificacao visual no tema preto. Cor nunca e o unico sinal (simbolo e titulo do grupo).
- Layout de telefone: mobile = largura < 900 px (`useIsMobile`, `.app.mobile`); `.main` tem padding 16px lateral (mobile.css l.12). Matriz 18x18: celulas minimas ~32-36 px dao ~650 px de largura util, > 358 px de viewport (390): precisa de container `overflow-x: auto` com primeira coluna `position: sticky; left: 0` com fundo opaco (`var(--surface)`), sem quebrar a largura da pagina (usar `min-width:0` no pai; `.panel` ja tem `min-width:0`). Grade dos 18 chips: 6 colunas no desktop, 3 a 4 no celular (icone + nome curto).
- Termos (CRITICO para o porte): o toggle de "idioma dos termos" (`useTermsLanguage(cardKey)` + `<TermsToggle cardKey=…/>`) e do esqueleto Cobblemon (preferences-store `termsLanguage`/`termsOverrides`, `src/components/TermsToggle.tsx`, cardKey por painel). O esqueleto oficial `pontindex` NAO o tem (IDEA secao 2: "unica diferenca permitida e o toggle de termos"). Hoje todo uso de `typeName(type, lang)` recebe `lang` de `useTermsLanguage("calc"|"weak"|...)`. Recomendacao: a pagina usa `usePreferencesStore((s) => s.uiLanguage)` (idioma da interface, disponivel nos dois esqueletos) para os nomes de tipo, e NAO inclui `TermsToggle`/`useTermsLanguage`; assim e identica nos dois. Se a SPEC optar por mostrar o toggle aqui, isolar em um unico ponto (um wrapper pequeno) para o porte remove-lo sem tocar o resto. Outras dependencias compartilhadas (devem existir no esqueleto oficial, segundo a IDEA/PRD da base RF-104): `TypeChip`/`TypeIcon`/`typeName`, `domain/type-chart.ts`, `data/types.ts` (`TypeId`), `i18n/types.ts` (`TYPE_NAMES`), `types.generated.css`, store de navegacao (`useNavigationActions`, `useScreenUi`), `SegmentedControl`, `useT`, `Icon.tsx`, `nav-items.ts`, registry. A conferir no repo `pontindex` (fora do meu escopo aqui): `SegmentedControl`, `EmptyState` e as classes `.panel`/`.seg`/`.chip` estarem la.
- Outro: `Effectiveness` e `MultiplierGroup` (dominio) sao compartilhados; `EFFECT_LABEL` mora em `Detail/TypeCalculator.tsx` (tela do Detail, que no pontindex-base pode nao existir igual) - nao importar dele; mover o mapa de simbolos para dentro da pagina nova (ou para um modulo compartilhado so se a base tambem tiver).
- Testes que QUEBRAM ao adicionar o item (atualizar no mesmo PR; linhas conferidas): `tests/unit/ui-shell/shell.test.tsx` l.113 (lista de 9 labels do sidebar PT, passa a 10) e l.147 (labels do sheet "Mais", ganha "Tipos" no inicio); `tests/unit/ui-shell/shell.test.tsx` l.66 (paridade `SCREENS` x `SCREEN_IDS`, exige a entrada nova); `tests/e2e/shell.spec.ts` l.109-111 (lista de 9 do sidebar) e l.173 (lista do sheet "Mais" mobile, ganha "Tipos"); `tests/e2e/responsive.spec.ts` l.185-202: 14 screenshots fullPage a 1280x800 (`home-<tema>` e `detail-charizard-<tema>` para os 7 temas) com o sidebar visivel, entao o 10o item do sidebar altera TODOS os 14 baselines (tolerancia `maxDiffPixelRatio` 0.02): regenerar com `--update-snapshots` e revisar visualmente. NAO quebram: `tests/unit/ui-shell/shell.test.tsx` l.142 (tabbar mobile continua Inicio, Pokedex, Capturados, Comparar, Mais) e `tests/e2e/navigation.spec.ts` (usa so seletores `[data-nav=...]`, sem contagens). Tabbar fica com 5 vagas fixas (`mobile.css` l.13, `repeat(5, ...)`): por isso "Tipos" NAO entra em `TAB_SCREENS`.
- Atribuicao/commits: nao e responsabilidade do CONTEXT.

## 8. Incognitas abertas

Todas FECHADAS pelo orquestrador em IDEA secao 2, decisao [14:58]. Nenhuma incognita aberta restante neste CONTEXT.

- U1 (fechada, IDEA [14:58]). Item "Tipos" em `SIDEBAR_ITEMS` logo depois de `compare` (antes de `trainers`); entra na folha "Mais" no celular, nao em `TAB_SCREENS`.
- U2 (fechada, IDEA [14:58]). ScreenId `types`; pasta `src/screens/Types/`.
- U3 (fechada, IDEA [14:58]). Icone `Shapes` (fallback `Layers`): ambos existem em lucide-react 0.577.0 (conferido em `node_modules/lucide-react/dist/lucide-react.d.ts`) e NAO estao em uso nem exportados em `src/components/Icon.tsx`; sera preciso adiciona-los ao reexport.
- U4 (fechada, IDEA [14:58]; levantamento na secao 7). Testes afetados listados com linhas verificadas.
- U5 (fechada, IDEA [14:58]). O porte copia `src/` inteiro menos o Cobblemon, entao SegmentedControl, EmptyState e `.seg/.panel/.chip` vem junto.
- U6 (fechada, IDEA [14:58]). CSS proprio em `src/screens/Types/types.css` (faixas por resultado com cor + simbolo, override para o tema preto).
- U7 (fechada, IDEA [14:58]). Tamanho grande do TypeIcon definido em `types.css`, sem mexer no componente compartilhado.
- U8 (fechada, IDEA [14:58]). Nada importado de `Detail/TypeCalculator` (EFFECT_LABEL, selectedTypes, `.mult-*`); rotulos e helper de selecao proprios; nomes de tipo por `uiLanguage`.
