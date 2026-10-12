---
feature: type-chart
language: pt-BR
generated: 2026-10-12
stack: React 19.1 + TypeScript 5.8 + Vite 6 PWA (vite-plugin-pwa), Zustand 5 (pilha de navegacao propria), Vitest 3 + Testing Library (jsdom), Playwright 1.63 headless, CSS puro por tela
status: spec
prd_source: PRD_type-chart.md @ 7178dd7aef51134734115e73f8dc3c060a3ad206
---

# SPEC - type-chart (pagina "Tipos": quem vence quem, didatica e legivel de relance)

Desenho tecnico (COMO) e plano executavel. Escrito para um agente de frontend com contexto limpo que tera so este SPEC, o PRD (rev 5.1), o CONTEXT, o UISPEC e as capturas de `ui-refs/`. Todo caminho a MODIFICAR foi conferido no disco em 2026-10-12 e toda linha citada foi conferida com `sed -n`/`grep -n` no HEAD `6aa3ffd5`. Arquivos marcados "criar" ainda nao existem.

Convencoes de leitura e regras fixas:
- `ROOT` = `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart` (worktree do repo `pokedex`, branch `feature/type-chart`). NUNCA tocar em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex` (outro agente le de la). As listas **Files** trazem o caminho absoluto completo.
- `FEATURE_DIR` = `ROOT/.forge/ideas/type-chart` (se o orquestrador mover a pasta para `.forge/in-progress/type-chart`, usar a nova; os nomes de arquivo nao mudam).
- Identificadores de codigo em INGLES (camelCase/PascalCase; classes CSS, `data-*` e chaves i18n em ingles), espelhando o projeto (CONTEXT `code_identifier_language: en`, CONTEXT secao 6). Comentarios de codigo em pt-BR sem acento. Texto de UI so em `src/i18n/messages/*.ts` (PT com acento, EN).
- PROIBIDO o caractere travessao (em dash, U+2014) em qualquer texto gerado (codigo, comentario, string, i18n, commit, Markdown). O lint (`eslint.config.js:25-27,60-65`) rejeita em codigo; nos `.md` conferir com `git grep -nP "\x{2014}"`.
- Commits: Conventional Commits em pt-BR sem acento, estilo do `git log` (`feat(types): ...`, `test(e2e): ...`), um commit atomico por feature, SEM nenhum trailer de coautoria (nenhuma linha de coautor do Claude; regra do Pontin; vence qualquer outra instrucao). Nunca `git push` nem merge sem o Pontin autorizar. Artefatos `.forge` sao versionados (STATE, CHECKLIST, capturas `after-*`).
- Playwright SEMPRE headless, sem `slowMo`, sem `waitForTimeout`/sleep (auto-wait, `expect.poll`, `settle`) (memoria do projeto `playwright-fast`, vence a regra global).
- ESCOPO FECHADO (PRD secao 3): `src/domain/type-chart.ts` e `src/screens/Detail/TypeCalculator.tsx` intocados; nenhuma tela existente muda alem do item de navegacao e do registro. Teste existente so muda no assert diretamente afetado (lista exata em 2.7); nenhum assert e afrouxado.
- Nenhum agente roda mais de 1h seguida (regra do Pontin): cada feature e pequena e deixa o estado no disco (commit + checklist), para um agente novo continuar do disco.
- Nao ha backend: app PWA estatico, sem servidor, sem autenticacao, sem papeis, sem mudanca de dataset. Todo o trabalho e `## Frontend`.

---

## 1. Baseline (ancora de drift)

- `HEAD`: `2b9dd126` (PRD rev 5.2; depois dele so `.forge/`); ancora de CODIGO `23308678a2516e4043906f4ce78caaa6f97f9407` (`git diff 6aa3ffd5..86c4bde5 -- src tests tools public package.json vite.config.ts` vazio) (branch `feature/type-chart`; so commits em `.forge/` acima de `main` `cee51235`; `git diff cee51235..HEAD -- src tests tools public package.json vite.config.ts` vazio, entao o codigo e o de `main`).
- PRD: `FEATURE_DIR/PRD_type-chart.md` = `7178dd7aef51134734115e73f8dc3c060a3ad206` (rev 5.3, commit e81371db; cascata do review da SPEC: CA-50 so na folha "Mais", RF-37 icones do heroi so em Defendendo, acento em RF-21/CA-18)
- CONTEXT: `FEATURE_DIR/CONTEXT_type-chart.md` = `5cbb8e52f5ef5531d0381f029764d3191572efe3`
- UISPEC: `FEATURE_DIR/UISPEC_type-chart.md` = `c5127ca91db4daae03593dfe552feb9cf64d8001`
- IDEA: `FEATURE_DIR/IDEA_type-chart.md` = `c648af069a1221deba0451200299e81d3ad0a33f` (decisoes [14:58] e [15:25])
- LESSONS: `ROOT/.forge/LESSONS.md` = `753caf6ced364872b59c6d5595642dcbccaa128e`

Arquivos de codigo de que este SPEC depende (`git hash-object`, 12 chars, working tree = HEAD):

| arquivo (relativo a ROOT) | hash | papel |
|---|---|---|
| src/domain/type-chart.ts | 523b99cd7ceb | fonte unica (so leitura) |
| src/data/types.ts | 479e800f0797 | `TypeId` (l.6), `TypeMultiplier` (l.340) |
| src/i18n/types.ts | 727356b5b237 | `TYPE_NAMES` |
| src/components/TypeChip.tsx | d59123ddeeba | `typeName` (l.18) |
| src/components/TypeIcon.tsx | d40f9f62779a | `TypeIcon` (l.20) |
| src/components/SegmentedControl.tsx | fcdbaa78eea6 | seletor de visao e abas |
| src/components/Icon.tsx | 2f7ab4188d32 | MODIFICAR (reexport `Shapes`) |
| src/components/nav-items.ts | d9f41614b0ba | MODIFICAR (item novo) |
| src/components/Sidebar.tsx | 387da255b5f6 | so leitura (nao mostra `subKey`) |
| src/components/MoreSheet.tsx | a22372f9d667 | so leitura (mostra `subKey`) |
| src/components/TabBar.tsx | bff9cbdf5c03 | so leitura (5 vagas) |
| src/components/ScreenRouter.tsx | 154bea7e086e | so leitura |
| src/components/AppShell.tsx | eb7c1378c7c5 | so leitura (`ErrorBoundary` por tela, l.64) |
| src/screens/registry.ts | 795df83680e9 | MODIFICAR (registro da tela) |
| src/navigation/types.ts | 35630c204dbd | MODIFICAR (ScreenId, estado) |
| src/navigation/navigation-store.ts | c9d46ab973b0 | so leitura (`updateUi` l.101, `go` l.93) |
| src/navigation/useNavigation.ts | dd286cb65022 | so leitura (`useScreenUi` l.16) |
| src/i18n/messages.ts | 5138f2d1789b | MODIFICAR (registro do modulo) |
| src/i18n/messages/core.ts | 4c635cfc61ce | so leitura (padrao das chaves `nav.*`) |
| src/i18n/useT.ts | 9ed2b560d188 | so leitura (`useT`, `translate`) |
| src/state/preferences-store.ts | 2b32bf0ba65a | so leitura (`uiLanguage` l.18) |
| src/styles/components.css | 097f1ee4311a | so leitura (`.chip`, `.ti`, `.seg`, `.panel`, `select`) |
| src/styles/themes.css | ba927bad413f | so leitura (7 temas) |
| src/styles/base.css | 637b7f86f968 | so leitura (`.main` l.41, reset de `button` l.34) |
| src/styles/mobile.css | 813f2987640f | so leitura |
| src/screens/Detail/detail.css | cd52710c05bd | so leitura (hex de `.mult-*` l.94-95, 319; override de tema l.121) |
| src/screens/Detail/TypeCalculator.tsx | 0906d2d74663 | so leitura (padrao; NUNCA importado) |
| src/screens/Dex/DexFilters.tsx | fb53e3202050 | so leitura (padrao dos chips-botao, l.52-82) |
| src/screens/Compare/CompareScreen.tsx | 608152842350 | so leitura (scaffold de tela) |
| src/screens/Compare/compare.css | fb728cebd30c | so leitura |
| src/screens/Item/item.css | 0d2d2e5aa5a0 | so leitura (precedente de foco, l.81) |
| src/screens/Trainers/trainers.css | eedb392d2e6e | so leitura (precedente de foco, l.81) |
| eslint.config.js | ecf109ff7a57 | so leitura |
| vite.config.ts | 1e0035bdd4c0 | so leitura (precache l.62-70) |
| vitest.config.ts | 5652c34e632b | so leitura (limiares de cobertura) |
| playwright.config.ts | 6ea1e370dc3d | so leitura |
| package.json | 3244a616e4a9 | so leitura (nenhuma dependencia nova) |
| tests/harness/no-overlap.ts | db6c6a3b80c5 | so leitura |
| tests/unit/ui-shell/shell.test.tsx | 2b20e63161c1 | MODIFICAR (l.114 e l.147) |
| tests/unit/ui-shell/i18n-modules.test.ts | 64a061fbf034 | so leitura (cobre o modulo novo sozinho) |
| tests/unit/domain/type-chart.test.ts | 763d354dfcfc | so leitura |
| tests/unit/ui-screens/compare-screen.test.tsx | 4e7757dc3bf3 | so leitura (padrao RTL) |
| tests/e2e/shell.spec.ts | 814ffbe4e030 | MODIFICAR (l.110 e l.173) |
| tests/e2e/responsive.spec.ts | bad04ff822e9 | so leitura (teste l.186-202); 14 PNGs regenerados |
| tests/e2e/compare.spec.ts | c6a980435015 | so leitura (padrao `boot`/`setLanguage`/`settle`) |
| tests/e2e/perf.spec.ts | cb5026740466 | so leitura (padrao de long task) |
| tests/e2e/navigation.spec.ts | e803d1821862 | so leitura (so seletores `[data-nav]`, nao quebra) |

Fatos medidos no HEAD (conferidos com `npx tsx` sobre `src/domain/type-chart.ts`, script no scratchpad do agente, nada versionado): 324 pares atacante x defensor = 51 x2 + 61 x1/2 + 8 x0 + 204 x1; maior grupo de uma faixa = 10 tipos (Aco, "Resiste a"); 23 grupos vazios no total dos 108 (18 tipos x 6 grupos), ex. Normal "Forte contra", Normal "Resiste a", Fogo "Nao afeta". `Shapes` e `Layers` existem em `lucide-react` 0.577.0 (`node_modules/lucide-react/dist/lucide-react.d.ts:16956` e `:11314`) e nenhum dos dois e usado em `src/`.

---

## 2. Design Overview

### 2.1 Abordagem em uma frase

Uma tela nova `types` (pasta `src/screens/Types/`, padrao de `Compare`/`Settings`) que deriva tudo de `src/domain/type-chart.ts` por um modelo puro (`types-model.ts`), guarda visao, tipo, aba e 2o tipo no `ui` da entrada da pilha (como `calcInputs` da ficha), mostra a legenda fixa, um `SegmentedControl` "Por tipo | Tabela completa", a grade de 18 chips-botao, o bloco heroi com a frase de intuicao, as abas "Atacando | Defendendo" com faixas coloridas por VANTAGEM (hex de UISPEC 3.2b copiados para `types.css`) e uma `<table>` 18 x 18 com cabecalhos clicaveis e primeira coluna fixa; o item "Tipos" entra no `SIDEBAR_ITEMS` depois de "Comparar" (cai sozinho na folha "Mais" no celular).

### 2.2 Fluxo de dados

```
src/domain/type-chart.ts (INTOCADO)
  TYPE_IDS, TYPE_CHART, singleMultiplier, effectivenessAgainst, typeChartMatrix, Effectiveness
     |
src/screens/Types/types-model.ts (puro, sem React, sem store)
  attackGroups(t) / defendGroups([t] | [t1,t2]) -> TypeGroup[] (3 ou 5, nunca omitidos, ordem TYPE_IDS)
  matrixRows() -> 18 linhas x 18 MatrixCell (multiplicador, simbolo curto, tom)
  nextSelection(ui, picked) / secondOptions(first) / parseSecond(value, first)
  MULT_SYMBOL, CELL_SYMBOL, HINT_KEYS, tons
     |
navigation-store (current.ui da entrada "types": { view, selected, tab, second })
  leitura: useScreenUi("types", campo)   escrita: updateUi<"types">(patch) / selectType(type)
     |
TypesScreen.tsx -> TypesLegend (sempre) + SegmentedControl de visao
   view "byType": TypePicker (18 botoes) -> [sem tipo: instrucao] | [com tipo: TypeFocus = heroi + abas + (2o tipo) + faixas]
   view "chart":  TypeMatrix (<table>, so montada nesta visao)
nomes de tipo: typeName(type, uiLanguage) (usePreferencesStore), NUNCA useTermsLanguage
```

### 2.3 Decisoes-chave

1. **Estado no `ui` da pilha** (RF-34..RF-36): `UiStateMap.types = { view: TypesView; selected: TypeId | null; tab: TypesTab; second: TypeId | null }`, padrao `{ view: "byType", selected: null, tab: "attack", second: null }`. Toda mudanca dentro da pagina e `updateUi<"types">` (nao empilha historico, `navigation-store.ts:101-104`); sair pelo item de navegacao cria entrada nova com o padrao (`navigate` -> `createEntry`, `navigation-store.ts:58-66,81-91`); Voltar restaura a entrada salva com `ui` e `scroll` (`goBack`, l.106-127); nada vai para storage (RF-36 por construcao).
2. **Modelo puro separado** (`types-model.ts`, padrao `compare-model.ts`): toda derivacao e testavel em node e e o unico lugar que fala com o dominio. Grupos derivados por filtro de `TYPE_IDS` (ordem canonica garantida), NAO por `groupByMultiplier` (que omite grupos vazios, `type-chart.ts:66-72`; RF-18 exige grupo vazio visivel).
   - Atacando de X: para `m` em `[2, 0.5, 0]`: `TYPE_IDS.filter((d) => singleMultiplier(X, d) === m)`.
   - Defendendo de `defs` (1 ou 2 tipos): `const e = effectivenessAgainst(defs)`; 1 tipo -> `m` em `[2, 0.5, 0]`; 2 tipos -> `m` em `[4, 2, 0.5, 0.25, 0]`; `TYPE_IDS.filter((a) => e[a] === m)`. Com 1 tipo, `e[a] === singleMultiplier(a, X)` (RF-16).
3. **Cor = vantagem por ponto de vista** (IDEA [15:25], RF-17, RF-27, RF-46): o modelo entrega um TOM, nunca um hex; o CSS mapeia tom -> hex copiado de UISPEC 3.2b. Tons: `adv` (verde), `dis` (laranja), `zero` (cinza), `dis-strong` (x4, defesa dupla), `adv-strong` (x1/4, defesa dupla), `neutral` (x1 da matriz). Tabela de tom por grupo na secao 5.4.
4. **Simbolos como constantes de string** (lint `no-literal-jsx-text`): `MULT_SYMBOL` (`x4`, `x2`, `x1`, `x1/2`, `x1/4`, `x0`, usado nos nomes acessiveis da matriz) e `CELL_SYMBOL` (`2`, `""`, `1/2`, `0`, texto visivel das celulas). Os titulos de grupo trazem o simbolo no proprio texto i18n ("Forte contra (x2)").
5. **Grade de tipos = chips-botao** no padrao exato do Dex (`DexFilters.tsx:64-78`): `<button class="chip t-<tipo> tp-pick [on]" aria-pressed>` com `TypeIcon` + nome + `Check.chip-check`; mas em `flex-wrap` (nao `.chips-scroll`), com o anel de selecao copiado para `types.css` (RF-11, UISPEC 3.3).
6. **Tocar no tipo ja selecionado = no-op** (RF-12): `nextSelection` devolve `null` e nada e escrito. Trocar o 1o tipo para o valor do 2o limpa o 2o (RF-38, premissa aceita).
7. **Matriz = `<table>` nativa** (secao 3, decisao): `thead` com 18 `th scope="col"`, `tbody` com 18 `tr` cada um com `th scope="row"` + 18 `td`; cabecalhos sao `button` com `TypeIcon` e `aria-label`; celulas `td` com `aria-label` completo e texto curto; container `overflow-x: auto` com a primeira coluna `position: sticky; left: 0` e fundo opaco `var(--surface)`. A matriz SO e montada na visao "Tabela completa" (RNF-07).
8. **Destaque de linha e coluna sem depender de cor** (RF-28, RNF-02): linhas internas de duas cores (`var(--text)` + `var(--surface)`, o mesmo par do anel `.chip.on`) nas bordas das celulas da linha e da coluna, e anel de duas cores no botao do cabecalho; `aria-pressed="true"` nos dois cabecalhos do tipo. Funciona em escala de cinza (sao linhas, nao tons).
9. **Foco visivel** (RNF-03, CA-34): `outline: 2px solid var(--secondary); outline-offset: 2px` sob `:focus-visible` (precedente `item.css:81`, `trainers.css:81`) em TODO controle novo (18 botoes, botoes dos dois `SegmentedControl` da pagina, 36 cabecalhos, `select` do 2o tipo, regiao rolavel da matriz), com `outline-color: var(--primary)` nos temas green, blue e purple (precedente `detail.css:121`: `--secondary` da 1,2:1 / 1,6:1 / 2,57:1 sobre branco nesses temas).
10. **Nomes de tipo por `uiLanguage`** (RF-20, RF-32): `const lang = usePreferencesStore((s) => s.uiLanguage)` (padrao `DexFilters.tsx:54`) + `typeName(type, lang)`; a pagina nao importa `TermsToggle`, `useTermsLanguage` nem le `termsLanguage`/`termsOverrides`.
11. **i18n num modulo proprio** `src/i18n/messages/types-page.ts` (`TYPES_PAGE_MESSAGES`, chave `types` em `MESSAGE_MODULES`), INCLUINDO `nav.types` e `nav.typesSub` (secao 3: o porte vira copia de arquivo). O nome do arquivo evita colidir com `messages/types.ts` (tipo `Message`). As 18 frases ficam num mapa tipado `HINT_KEYS` (nunca chave montada em runtime sem tipo).
12. **Item de navegacao**: `{ screen: "types", labelKey: "nav.types", subKey: "nav.typesSub", icon: Shapes }` inserido em `SIDEBAR_ITEMS` depois de `compare` (`nav-items.ts:19`); `TAB_SCREENS` (`nav-items.ts:27`) intocado, entao `MORE_ITEMS` (`nav-items.ts:29`) o poe em 1o na folha "Mais" e o `TabBar` acende "Mais" quando a tela esta ativa (`TabBar.tsx:18`). `Shapes` entra no reexport de `Icon.tsx` (fallback `Layers` so se `Shapes` sumir; hoje existe).
13. **Nada importado da ficha** (RF-31, CA-27): nem `EFFECT_LABEL`, nem `selectedTypes`, nem classes `.mult-*`/`.weak-*`/`.tc-cell`; as classes globais de `components.css` (`.chip`, `.ti`, `.seg`, `.panel`, `.panel-head`, `.chip-check`) sao do esqueleto compartilhado, nao de outra tela. Tambem NAO usa `EmptyState` (fora da lista do RF-31): a instrucao e um `p` proprio.
14. **Defesa com 2 tipos `[COULD]`** isolada na ultima feature de UI (F4.1): `select` nativo so na aba "Defendendo"; heroi mostra o 2o icone so nessa aba; Atacando e matriz usam so o 1o tipo; a legenda ganha x4 e x1/4. Se F4.1 nao entrar, nada nas demais depende dela (o campo `second` existe no estado desde F1.2 e fica sempre `null`).

### 2.4 Layout (referencia visual obrigatoria: UISPEC secoes 3.2b, 3.3, 4, 5 e 7; nao re-derivar a identidade aqui)

```
<section class="types-screen">
  .page-head > h2 "Tipos"
  .panel.tp-legend       h3 "Legenda" | ul (x2 / x1/2 / x0 [/ x4 / x1/4]) | p.tp-legend-color x2 (amostras + frase)
  .seg.tp-view           [Por tipo] [Tabela completa]
  view byType:
    .panel.tp-pick-panel   .tp-grid (18 button.chip.tp-pick) | p.tp-instr "Escolha um tipo" (so sem tipo)
    .panel.tp-hero.t-<t>   .tp-hero-icons (TypeIcon 64px [+ 2o]) | h3.tp-hero-name | p.tp-hint (frase)
    .tp-tabs-row           .seg.tp-tab [Atacando][Defendendo] | label.tp-second (select, so em Defendendo, COULD)
    .tp-bands              section.tp-band.tone-<tom> x3 (ou x5): h4 titulo | ul.tp-band-list (li: TypeIcon 44px + nome) | p.tp-none "nenhum"
  view chart:
    .panel.tp-matrix-panel p.tp-matrix-caption | div.tp-matrix-scroll > table.tp-matrix
```
Metricas fixadas (todas em `types.css`, valores conferidos contra UISPEC 3.3): icone do heroi 64px (`.ti.tp-ti-xl`), icone das faixas 44px (`.ti.tp-ti-lg`), icone do cabecalho da matriz 24px; celula e cabecalho da matriz 34 x 34 px com `border-spacing: 2px` (tabela = 19 x 34 + 20 x 2 = 686 px: cabe sem rolagem na area util do desktop 1280, `1280 - 236 - 72 - 42` = 930 px, menos a barra de rolagem de `#main` (sidebar 236 com `box-sizing: border-box`, `base.css:22`; `.main` padding 36 lateral, `base.css:41`; `.panel` padding 20 + borda 1, `components.css:29`); no phone 390 a area util e `390 - 32 - 30` = 328 px e o container rola). Chips da grade no tamanho md do app (12px, `.ti` 22px), quebrando linha (`flex-wrap`, gap 8px).

### 2.5 Convencao de identificadores (obrigatoria)

Ingles. ScreenId `types`. Tipos: `TypesView = "byType" | "chart"`, `TypesTab = "attack" | "defend"` (em `src/navigation/types.ts`), `Tone`, `TypeGroup`, `MatrixCell`, `MatrixRow`, `TypesUi` (alias de `UiStateMap["types"]`, em `types-model.ts`). Funcoes/constantes do modelo: `attackGroups`, `defendGroups`, `matrixRows`, `nextSelection`, `secondOptions`, `parseSecond`, `isTypeId`, `toneOf`, `MULT_SYMBOL`, `CELL_SYMBOL`, `HINT_KEYS`, `TYPE_NAME_JOIN`. Componentes: `TypesScreen`, `TypesLegend`, `ByTypeView`, `TypePicker`, `selectType`, `TypeFocus`, `SecondTypeSelect`, `TypeMatrix`. Arquivos: `src/screens/Types/{TypesScreen.tsx,TypePicker.tsx,TypeFocus.tsx,TypeMatrix.tsx,types-model.ts,types.css}`, `src/i18n/messages/types-page.ts` (`TYPES_PAGE_MESSAGES`). Classes CSS (todas com prefixo `tp-` ou `tone-` e escopo `.types-screen`): `types-screen`, `tp-legend`, `tp-legend-list`, `tp-legend-color`, `tp-swatches`, `tp-view`, `tp-pick-panel`, `tp-grid`, `tp-pick`, `tp-instr`, `tp-hero`, `tp-hero-icons`, `tp-hero-name`, `tp-hint`, `tp-ti-xl`, `tp-ti-lg`, `tp-tabs-row`, `tp-tab`, `tp-second`, `tp-bands`, `tp-band`, `tp-band-list`, `tp-band-item`, `tp-band-name`, `tp-none`, `tp-matrix-panel`, `tp-matrix-caption`, `tp-matrix-scroll`, `tp-matrix`, `tp-corner`, `tp-col-head`, `tp-row-head`, `tp-head`, `tp-cell`, `is-sel`, `is-col`, `tone-adv`, `tone-dis`, `tone-zero`, `tone-dis-strong`, `tone-adv-strong`, `tone-neutral`. Atributos de teste: `data-pick`, `data-hero`, `data-tab`, `data-mult`, `data-tone`, `data-type`, `data-row`, `data-def`, `data-axis`. Ids: `#tp-matrix-cap`, `#tp-second`. Chaves i18n: secao 5.3.

### 2.6 Arquivos (soma da feature)

Criar (7 de codigo + 4 de teste): `src/screens/Types/TypesScreen.tsx`, `TypePicker.tsx`, `TypeFocus.tsx`, `TypeMatrix.tsx`, `types-model.ts`, `types.css`; `src/i18n/messages/types-page.ts`; `tests/unit/ui-screens/types-model.test.ts`, `tests/unit/ui-screens/types-hints.test.ts`, `tests/unit/ui-screens/types-screen.test.tsx`, `tests/e2e/types.spec.ts`.
Modificar (5 de codigo + 2 de teste + 14 PNG): `src/navigation/types.ts`, `src/screens/registry.ts`, `src/components/nav-items.ts`, `src/components/Icon.tsx`, `src/i18n/messages.ts`; `tests/unit/ui-shell/shell.test.tsx`, `tests/e2e/shell.spec.ts`; `tests/e2e/responsive.spec.ts-snapshots/{home,detail-charizard}-{black,blue,classic,green,orange,purple,white}-chromium-win32.png`.

### 2.7 Testes existentes afetados (lista exata, conferida no HEAD)

Mudancas de ASSERT (ajuste ao comportamento aprovado; mesma forca, lista completa e ordenada), todas em F1.2, no MESMO commit que adiciona o item:
- `ROOT/tests/unit/ui-shell/shell.test.tsx:114`: a lista passa a `["Início", "Pokédex", "Capturados", "Comparar", "Tipos", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações"]` (10 itens, `toEqual`).
- `ROOT/tests/unit/ui-shell/shell.test.tsx:147`: a lista passa a `["Tipos", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações", "Feito por Pontin", "GitHub"]`.
- `ROOT/tests/e2e/shell.spec.ts:110`: a lista passa a `"Início", "Pokédex", "Capturados", "Comparar", "Tipos", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações",`.
- `ROOT/tests/e2e/shell.spec.ts:173`: a lista passa a `["Tipos", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações", "Feito por Pontin", "GitHub"]`.

Passa sem mudanca de codigo de teste, mas exige a entrada nova: `ROOT/tests/unit/ui-shell/shell.test.tsx:66` (paridade `SCREENS` x `SCREEN_IDS`). Inalterados e obrigatoriamente verdes: `shell.test.tsx:142` e `shell.spec.ts:168` (tabbar continua Inicio, Pokedex, Capturados, Comparar, Mais), `shell.spec.ts:174` (`.sheet-panel` inteiro na viewport com 8 itens), `tests/e2e/navigation.spec.ts` (so `[data-nav=...]`), `tests/unit/ui-shell/i18n-modules.test.ts` (o modulo novo entra sozinho na checagem de uniao disjunta e de pt/en nao vazios).

Revisao de BASELINE VISUAL (efeito direto e intencional do 10o item da barra), em F1.3: os 14 `ROOT/tests/e2e/responsive.spec.ts-snapshots/{home,detail-charizard}-<tema>-chromium-win32.png` (teste `responsive.spec.ts:186-202`, `fullPage`, 1280 x 800, `maxDiffPixelRatio: 0.02` INALTERADO).

## 2b. Mapa de ciclo de vida das entidades

Nenhuma entidade persistida (sem storage, sem dataset novo, sem rede). A unica "entidade" e o estado efemero da tela, guardado no `ui` da entrada `types` da pilha de navegacao em memoria (`navigation-store.ts`):

| Etapa | Gatilho | Efeito no estado | Onde e lido de volta |
|---|---|---|---|
| Criar | clicar "Tipos" (sidebar ou folha "Mais") vindo de outra tela -> `go("types")` -> `navigate` -> `createEntry` | `{ view: "byType", selected: null, tab: "attack", second: null }` (`defaultUi`) | `useScreenUi("types", campo)` no 1o render |
| Atualizar | escolher tipo (grade ou cabecalho da matriz), trocar aba, trocar visao, escolher/remover 2o tipo | `updateUi<"types">(patch)` so na entrada atual; nenhuma entrada de historico nova | os componentes re-renderizam pelo slice |
| Guardar | navegar para outra tela a partir de "Tipos" | a entrada vai para `stack` com `ui` e `scroll` (`navigation-store.ts:83-84`) | |
| Restaurar | Voltar (botao do navegador ou interno) | `goBack` devolve a entrada com o MESMO `ui` e reaplica o `scroll` (l.125-126); a tela remonta (`key={entryId}`) | `useScreenUi` le o `ui` restaurado |
| Descartar | abrir "Tipos" de novo pelo item de navegacao (entrada nova), recarregar o app, ou a entrada sair da pilha (limite 40) | estado inicial de novo | |
| No-op | clicar "Tipos" estando em "Tipos" (`go`, l.94-96: so rola ao topo) ou tocar no tipo ja selecionado | nada muda | |

Nada e persistido (RF-36): nenhum `localStorage`, `IndexedDB` ou preferencia e escrito pela pagina.

---

## 3. Trade-offs e alternativas rejeitadas

| Decisao | Alternativa rejeitada | Por que |
|---|---|---|
| Visao por tipo (faixas) + matriz 18 x 18 | Diagrama de setas entre os 18 tipos | Mais de 100 relacoes (51 x2 + 61 x1/2 + 8 x0 = 120): ilegivel, nao responde "so de bater o olho" (IDEA [14:30], PRD secao 3). |
| Uma visao por vez, trocada por `SegmentedControl` (RF-47) | Empilhar a matriz abaixo das faixas | No celular a pagina ficaria com 6 faixas + 18 linhas de tabela; a matriz so e montada quando pedida (RNF-07). |
| `<table>` nativa para a matriz | CSS grid de `div` com `role="grid"` | (a) semantica pronta: `th scope="row|col"` da ao leitor de tela "linha Fogo, coluna Planta" sem ARIA manual, e `role="grid"` exigiria navegacao por setas (widget composto) que o PRD nao pede (so os 36 cabecalhos sao controles, celulas nao); (b) `position: sticky` funciona em `th`/`td` com `border-collapse: separate`; (c) no harness `no-overlap.ts` nada muda: `td`/`th` nao sao controles (`DEFAULT_CONTROL_SELECTORS`, l.23-38), so os `button` dos cabecalhos e os `img` dos icones sao, e os cabecalhos nao tem texto visivel (so `aria-label`), entao o unico texto da matriz e o simbolo de cada `td`, que nao cruza nada com o scroll em 0. Com o container rolado, o `td` passa POR BAIXO da coluna fixa e o retangulo do texto cruzaria o `img` do `th` fixo (o harness mede retangulos, nao pintura); por isso o `expectNoOverlap` da matriz roda com `scrollLeft = 0` e a coluna fixa e provada por geometria (CA-26, T1.3), nunca com `ignore`. |
| Grupos por filtro de `TYPE_IDS` com `singleMultiplier`/`effectivenessAgainst` | `groupByMultiplier` cru (`type-chart.ts:67-72`) | Ele OMITE grupos vazios; RF-18 exige grupo sempre visivel com "nenhum". |
| Tom (adv/dis/zero) no modelo, hex so no CSS | Mapear multiplicador -> cor fixa (verde = x2) | A cor depende do ponto de vista (IDEA [15:25]): x2 e verde em Atacando e laranja em Defendendo. |
| Hex copiados para `types.css` | Importar `.mult-*`/`EFFECT_LABEL`/`selectedTypes` da ficha | RF-31/CA-27: a pagina tem de ser copiavel para o `pontindex` sem o Detail; e as classes da ficha so existem hoje porque o Detail e importado estaticamente (acoplamento invisivel). |
| `nav.types`/`nav.typesSub` no modulo da pagina (`types-page.ts`) | Em `core.ts`, junto das demais `nav.*` | RF-33: o porte vira "copiar um arquivo + registrar o modulo"; o `core.ts` do `pontindex` pode divergir (UISPEC secao 0 alerta que o CSS do repo irmao ja diverge). `i18n-modules.test.ts:7-16` so exige chaves disjuntas, nao o dono. |
| Instrucao "Escolha um tipo" em `p.tp-instr` proprio | `EmptyState` (`EmptyState.tsx`) | `EmptyState` nao esta na lista fechada do RF-31; a instrucao e curta e fica dentro do painel da grade. |
| Grade em `flex-wrap` (todos os 18 visiveis) | `.chips-scroll` do Dex (1 linha rolando: 1374 px, UISPEC 3.3) | RF-11 pede grade compacta que quebra em linhas e continua visivel; esconder tipos atras de rolagem lateral atrapalha aprender. |
| Botao-chip no padrao do Dex (`button.chip` + `TypeIcon` + nome + `Check`) | `TypeChip` (`span`) dentro de um `button` | Um controle so (sem `.chip` aninhado em `button`), anel + check como o Dex (UISPEC 3.3), nome acessivel = nome do tipo. `TypeChip` e `span` sem filhos extras (`TypeChip.tsx:28-33`). |
| Estado na pilha (`ui` da entrada) | `useState` local da tela | RF-35: Voltar restaura tipo, aba e rolagem; `useState` morreria no remount (`key={entryId}`, `ScreenRouter.tsx:28`). |
| Destaque de linha/coluna por linhas de duas cores + anel no cabecalho | So escurecer/colorir o fundo | RNF-02/CA-24: precisa funcionar em escala de cinza e no tema `black`; o par `--text` + `--surface` e o do anel `.chip.on` (`components.css:80`), legivel em fundo claro e escuro. |
| Celulas nao clicaveis | Celula seleciona o atacante | RF-48 fixa; evita 324 controles na ordem de tabulacao. |
| Tela importada estaticamente no `registry.ts` | `lazy()` como Sync | Modulos pequenos sem dependencia pesada; chunk extra nao traz ganho e o precache ja cobre `**/*.js` (`vite.config.ts:63`). |
| 2o icone do heroi so na aba Defendendo | 2o icone sempre que `second != null` | RF-37: o 2o tipo so afeta Defendendo; dois icones na aba Atacando (que usa so o 1o) induziriam leitura errada. O `second` fica guardado ao trocar de aba. |
| Linhas x4 e x1/4 da legenda sempre visiveis depois de F4.1 | Aparecer so com 2o tipo escolhido | RF-21: "a legenda e a mesma em todo lugar"; legenda fixa nao pula de altura ao escolher o 2o tipo. |

## 4. Riscos e mitigacoes

| Risco | Impacto | Mitigacao |
|---|---|---|
| 14 baselines de `responsive.spec.ts` (sidebar com 10 itens) | Com `maxDiffPixelRatio: 0.02` a diferenca (so a sidebar) pode ficar ABAIXO da tolerancia e os testes passarem sem regenerar, deixando baselines velhas | F1.3: protocolo fixo (rodar, regenerar com `--update-snapshots=all` restrito por `-g`, diff por pixel com `sharp` provando que 100% dos pixels diferentes estao em `x < 236` (a sidebar), revisao visual de classic/black/purple, tolerancia intocada). |
| Flake preexistente confundido com regressao | Retrabalho ou assert afrouxado | S0.1 roda a suite completa ANTES (LESSONS 2026-09-29) e classifica com `--repeat-each=3`; `tests/unit/domain/bait.test.ts:106` ja e flake conhecido (LESSONS 2026-10-12): registrar, nao mexer. |
| Contraste no tema `black` | Faixa ou celula ilegivel | Tons sao pasteis FIXOS com fundo E texto proprios (UISPEC 3.2: verificados no black); x1 usa tokens; destaque e anel em `--text`/`--surface`; T1.3 mede contraste texto x fundo >= 4,5:1 das faixas nos 7 temas e o foco visivel. |
| Matriz 18 x 18 no phone (686 px em 328 px uteis) | Vazamento horizontal da pagina ou coluna fixa transparente | `.tp-matrix-scroll { overflow-x: auto; max-width: 100% }`, pais com `min-width: 0` (`.panel` ja tem, `components.css:29`), `th[scope=row]` e `.tp-corner` sticky com `background: var(--surface)`; T1.3 prova por geometria e por `getComputedStyle` (alfa 1). Observacao: `.main` tem `overflow-x: hidden` (`base.css:41`), entao "a pagina nao rola na horizontal" se prova medindo que nada da tela passa da borda direita de `#main`, nao so pelo `scrollWidth` do documento. |
| Harness `no-overlap.ts` (img e button sao controles) | Texto do nome encostando no icone | Icone e nome em coluna com `gap` (faixas) ou linha com `gap` (chips, heroi, select); cabecalhos da matriz sem texto visivel; checagem com scroll 0 (secao 3). |
| Lint (`no-literal-jsx-text`, U+2014) | Build vermelho | Simbolos e separador como constantes (`MULT_SYMBOL`, `CELL_SYMBOL`, `TYPE_NAME_JOIN`), todo texto por `t()`; `npm run lint` no Done when de toda feature. |
| Chave i18n montada em runtime inexistente | `MissingMessageError` em dev (`useT.ts:33-35`) | `HINT_KEYS` tipado `satisfies Record<TypeId, MessageKey>` (erro de compilacao se faltar) + teste de completude (T1.1). |
| Sidebar com 10 itens em 1280 x 800 | Rodape (`.sidebar-foot`) empurrado | `.sidebar` ja tem `overflow-y: auto` (`shell.css:44`); F1.2 captura a sidebar e confere que o rodape continua visivel em 1280 x 800 (`toBeInViewport`); se nao couber, parar e registrar no STATE (nao mexer no CSS do shell sem decisao). |
| Folha "Mais" com 8 itens no phone | Painel cortado | `shell.spec.ts:174` (`toBeInViewport({ ratio: 1 })` em 390 x 844) roda inalterado em F1.2; UISPEC secao 5 mediu +61 px (cabe). |
| Tamanho do bundle / precache | Precache cresce | So JS/CSS da pagina (estimativa < 20 KB cru: 4 componentes, 1 modelo, 1 CSS, 50 chaves i18n); nenhum asset novo (os 18 SVG ja estao no precache por `**/*.svg`); nenhuma mudanca em `vite.config.ts`; T1.4 compara a soma de `dist/assets/*.js` + `*.css` com a medida de S0.1 e registra a diferenca no STATE (esperado < 30 KB cru). |
| Desempenho da matriz (324 celulas) | Travada ao abrir | Matriz so montada na visao "Tabela completa"; linhas pre-calculadas uma vez (`matrixRows()` em constante de modulo); T1.3 mede long tasks <= 200 ms (padrao `perf.spec.ts`). |
| Frase da tabela na legenda (RF-21, CA-18) | Divergencia de acento com RNF-06 | Alinhado com o PRD rev 5.2: "cinza = não afeta" com acento (A1, secao 9); o teste compara com o dicionario. |
| Subtitulo do item (CA-50, PRD rev 5.2: so na folha "Mais") | A sidebar nao renderiza `subKey` de NENHUM item (`Sidebar.tsx:38-51`, so `nav-label`) | Nao mexer na sidebar (RF-08, PRD secao 3): o subtitulo aparece onde o app mostra subtitulos (folha "Mais", `MoreSheet.tsx:48`); na sidebar o item se comporta como os demais (alinhado com o PRD rev 5.2, A2). |

---

## 5. Contrato de dados e estado (no lugar de endpoints)

**Endpoints HTTP: N/A.** App PWA estatico sem backend; a pagina nao faz requisicao nenhuma, nao le `public/data` nem `useDatasetStore`. O contrato e: (5.1) as funcoes do dominio consumidas, (5.2) a forma do estado da tela na pilha, (5.3) as chaves i18n, (5.4) a API do modelo puro, (5.5) os exemplos trabalhados que o implementador e os testes reproduzem.

### 5.1 Funcoes do dominio consumidas (SO leitura; `ROOT/src/domain/type-chart.ts`, blob `523b99cd7ceb`)

| Simbolo | Assinatura | Linha |
|---|---|---|
| `TYPE_IDS` | `readonly TypeId[]` (18, ordem canonica: normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy) | 5-8 |
| `TYPE_CHART` | `Readonly<Record<TypeId, AttackerRow>>`, `AttackerRow = { 2; 0.5; 0 }` listas de DEFENSORES | 10-35 |
| `Effectiveness` | `0 \| 0.25 \| 0.5 \| 1 \| 2 \| 4` | 37 |
| `singleMultiplier` | `(attacker: TypeId, defender: TypeId) => TypeMultiplier` | 40-46 |
| `effectivenessAgainst` | `(defenders: readonly TypeId[]) => Record<TypeId, Effectiveness>` (produto por atacante) | 49-57 |
| `typeChartMatrix` | `() => Record<TypeId, Record<TypeId, TypeMultiplier>>` (atacante -> defensor) | 75-82 |

Outros contratos lidos: `TypeId` (`src/data/types.ts:6`), `TypeMultiplier = 0 | 0.5 | 1 | 2` (`src/data/types.ts:340`), `TYPE_NAMES` (`src/i18n/types.ts:4-23`), `typeName(type, lang)` (`src/components/TypeChip.tsx:18-21`), `TypeIcon({ type, className })` (`src/components/TypeIcon.tsx:20-26`, `aria-hidden`), `SegmentedControl<V>({ options, value, onChange, className, ariaLabel })` (`src/components/SegmentedControl.tsx:9-37`, `role="group"`, botoes com `aria-pressed` e classe `active`), `useT()` (`src/i18n/useT.ts:40-43`), `usePreferencesStore((s) => s.uiLanguage)` (`src/state/preferences-store.ts:18`), `useScreenUi` (`src/navigation/useNavigation.ts:16-18`), `useNavigationActions().updateUi` (`useNavigation.ts:20-26`; `navigation-store.ts:101-104`), `useNavigationStore.getState()` (`navigation-store.ts:76`), `Check` (`src/components/Icon.tsx:11`), `ScreenProps` (`src/components/ScreenRouter.tsx:8-11`).

### 5.2 Estado da tela (`ROOT/src/navigation/types.ts`)

```ts
// depois de `export type DexSort = "num" | "name" | "bst";` (linha 48)
export type TypesView = "byType" | "chart";
export type TypesTab = "attack" | "defend";

// ScreenId (l.4-15): `| "types"` logo depois de `| "compare"` (l.9)
// SCREEN_IDS (l.17-29): `"types",` logo depois de `"compare",` (l.22)
// ScreenParamsMap (l.31-43), depois de `compare: ...` (l.36):
  types: Record<string, never>;
// UiStateMap (l.64-84), depois de `compare: ...` (l.77):
  types: { view: TypesView; selected: TypeId | null; tab: TypesTab; second: TypeId | null };
// defaultUi (l.99-122), depois de `compare: () => ...` (l.113):
    types: () => ({ view: "byType", selected: null, tab: "attack", second: null }),
```

Invariantes (garantidos pelo modelo e testados): `second !== selected` sempre; `second !== null` implica `selected !== null`; `selected` so volta a `null` com entrada nova. Leitura: `useScreenUi("types", "view" | "selected" | "tab" | "second")`. Escrita: `updateUi<"types">(patch)` (troca de visao, aba e 2o tipo) e `selectType(type)` (grade e cabecalhos; `TypePicker.tsx`, 5.4).

### 5.3 Chaves i18n (modulo NOVO `ROOT/src/i18n/messages/types-page.ts`, `export const TYPES_PAGE_MESSAGES = { ... } as const satisfies Record<string, Message>;`, registrado como `types` em `MESSAGE_MODULES`)

Valores exatos (PT / EN). Interpolacao no padrao `{nome}` de `useT.ts:24-29`.

Navegacao (F1.1):

| chave | PT | EN |
|---|---|---|
| `nav.types` | Tipos | Types |
| `nav.typesSub` | Quem vence quem | Who beats whom |

Visoes, abas, grade (F1.1):

| chave | PT | EN | uso |
|---|---|---|---|
| `types.viewLabel` | Visão | View | `ariaLabel` do seletor de visao |
| `types.viewByType` | Por tipo | By type | opcao |
| `types.viewChart` | Tabela completa | Full chart | opcao |
| `types.tabLabel` | Ponto de vista | Point of view | `ariaLabel` das abas |
| `types.tabAttack` | Atacando | Attacking | aba |
| `types.tabDefend` | Defendendo | Defending | aba |
| `types.pickLabel` | Os 18 tipos | The 18 types | `aria-label` do grupo da grade |
| `types.pick` | Escolha um tipo | Pick a type | instrucao sem tipo (RF-19) |

Legenda (F1.1; linhas de multiplicador SEM cor, RF-21):

| chave | PT | EN |
|---|---|---|
| `types.legendTitle` | Legenda | Legend |
| `types.legend2` | x2 = causa o dobro de dano | x2 = deals double damage |
| `types.legendHalf` | x1/2 = causa metade do dano | x1/2 = deals half damage |
| `types.legend0` | x0 = não afeta | x0 = has no effect |
| `types.legendBands` | Nas faixas: verde = vantagem para o tipo escolhido, laranja = desvantagem, cinza = não afeta | In the bands: green = advantage for the chosen type, orange = disadvantage, gray = no effect |
| `types.legendTable` | Na tabela: a linha ataca a coluna; verde = vantagem de quem ataca, laranja = desvantagem de quem ataca, cinza = não afeta | In the table: the row attacks the column; green = advantage for the attacker, orange = disadvantage for the attacker, gray = no effect |

Grupos (F1.1; RF-15):

| chave | PT | EN |
|---|---|---|
| `types.atk2` | Forte contra (x2) | Strong against (x2) |
| `types.atkHalf` | Pouco efetivo contra (x1/2) | Not very effective against (x1/2) |
| `types.atk0` | Não afeta (x0) | No effect on (x0) |
| `types.def2` | Fraco contra (recebe x2) | Weak to (takes x2) |
| `types.defHalf` | Resiste a (recebe x1/2) | Resists (takes x1/2) |
| `types.def0` | Imune a (x0) | Immune to (x0) |
| `types.none` | nenhum | none |

Matriz (F1.1; RF-26, RF-27, RF-48):

| chave | PT | EN |
|---|---|---|
| `types.matrixCaption` | Linhas = quem ataca, colunas = quem defende | Rows = attacker, columns = defender |
| `types.rowHeader` | {type} ataca (linha) | {type} attacks (row) |
| `types.colHeader` | {type} defende (coluna) | {type} defends (column) |
| `types.cellLabel` | {atk} contra {def}: {mult} | {atk} against {def}: {mult} |

Frases de intuicao (F1.1; texto EXATO do PRD RF-23, tabela verificada; 18 chaves `types.hint.<TypeId>`):

| chave | PT | EN |
|---|---|---|
| `types.hint.normal` | Normal não acerta Fantasma, e Lutador vence Normal | Normal can't hit Ghost, and Fighting beats Normal |
| `types.hint.fire` | Fogo queima Planta e Gelo, mas Água apaga Fogo | Fire burns Grass and Ice, but Water puts out Fire |
| `types.hint.water` | Água apaga Fogo, mas Planta bebe Água | Water puts out Fire, but Grass drinks Water |
| `types.hint.electric` | Elétrico vence Água e Voador, mas não afeta Terra | Electric beats Water and Flying, but can't hit Ground |
| `types.hint.grass` | Planta vence Água e Terra, mas Fogo queima Planta | Grass beats Water and Ground, but Fire burns Grass |
| `types.hint.ice` | Gelo congela Dragão, mas Fogo derrete Gelo | Ice freezes Dragon, but Fire melts Ice |
| `types.hint.fighting` | Lutador vence Normal, mas Psíquico vence Lutador | Fighting beats Normal, but Psychic beats Fighting |
| `types.hint.poison` | Veneno vence Planta e Fada, mas não afeta Aço | Poison beats Grass and Fairy, but can't hit Steel |
| `types.hint.ground` | Terra vence Elétrico e Fogo, mas Água vence Terra | Ground beats Electric and Fire, but Water beats Ground |
| `types.hint.flying` | Voador vence Planta e Inseto, mas Elétrico vence Voador | Flying beats Grass and Bug, but Electric beats Flying |
| `types.hint.psychic` | Psíquico vence Lutador e Veneno, mas Inseto vence Psíquico | Psychic beats Fighting and Poison, but Bug beats Psychic |
| `types.hint.bug` | Inseto vence Planta e Psíquico, mas Fogo vence Inseto | Bug beats Grass and Psychic, but Fire beats Bug |
| `types.hint.rock` | Pedra vence Fogo e Voador, mas Água vence Pedra | Rock beats Fire and Flying, but Water beats Rock |
| `types.hint.ghost` | Fantasma vence Psíquico, mas não afeta Normal | Ghost beats Psychic, but can't hit Normal |
| `types.hint.dragon` | Dragão vence Dragão, mas Gelo e Fada vencem Dragão | Dragon beats Dragon, but Ice and Fairy beat Dragon |
| `types.hint.dark` | Sombrio vence Psíquico e Fantasma, mas Lutador vence Sombrio | Dark beats Psychic and Ghost, but Fighting beats Dark |
| `types.hint.steel` | Aço vence Gelo, Pedra e Fada, mas Fogo vence Aço | Steel beats Ice, Rock and Fairy, but Fire beats Steel |
| `types.hint.fairy` | Fada vence Dragão, mas Veneno vence Fada | Fairy beats Dragon, but Poison beats Fairy |

Defesa com 2 tipos `[COULD]` (so em F4.1; se F4.1 nao entrar, estas chaves NAO sao criadas):

| chave | PT | EN |
|---|---|---|
| `types.legend4` | x4 = causa o quádruplo de dano | x4 = deals quadruple damage |
| `types.legendQuarter` | x1/4 = causa um quarto do dano | x1/4 = deals a quarter of the damage |
| `types.def4` | Muito fraco contra (recebe x4) | Very weak to (takes x4) |
| `types.defQuarter` | Resiste muito a (recebe x1/4) | Strongly resists (takes x1/4) |
| `types.secondLabel` | Segundo tipo | Second type |

Total: 45 chaves em F1.1 (2 nav + 6 visao/aba + 2 grade + 6 legenda + 7 grupos + 4 matriz + 18 frases) e 5 em F4.1. Nomes acessiveis montados: botao da grade = texto do proprio botao (nome do tipo); cabecalho = `t("types.rowHeader" | "types.colHeader", { type: typeName(ty, lang) })`, ex. "Fogo ataca (linha)" / "Fire defends (column)"; celula = `t("types.cellLabel", { atk: typeName(a, lang), def: typeName(d, lang), mult: MULT_SYMBOL[m] })`, ex. "Fogo contra Planta: x2" / "Fire against Grass: x2" (RF-27, CA-49).

### 5.4 API do modelo puro (NOVO `ROOT/src/screens/Types/types-model.ts`)

```ts
// Modelo puro da pagina Tipos (type-chart): deriva grupos, matriz e regras de selecao de src/domain/type-chart.ts.
import type { TypeId, TypeMultiplier } from "../../data/types";
import { TYPE_IDS, effectivenessAgainst, singleMultiplier, typeChartMatrix, type Effectiveness } from "../../domain/type-chart";
import type { MessageKey } from "../../i18n/messages";
import type { UiStateMap } from "../../navigation/types";

export type TypesUi = UiStateMap["types"];
/** Tom de cor (vantagem do ponto de vista da visao); o hex mora so em types.css. */
export type Tone = "adv" | "dis" | "zero" | "dis-strong" | "adv-strong" | "neutral";
export interface TypeGroup { multiplier: Exclude<Effectiveness, 1>; tone: Tone; titleKey: MessageKey; types: TypeId[] }
export interface MatrixCell { attacker: TypeId; defender: TypeId; multiplier: TypeMultiplier; symbol: string; tone: Tone }
export interface MatrixRow { attacker: TypeId; cells: MatrixCell[] }

export const MULT_SYMBOL: Readonly<Record<Effectiveness, string>> = { 4: "x4", 2: "x2", 1: "x1", 0.5: "x1/2", 0.25: "x1/4", 0: "x0" };
export const CELL_SYMBOL: Readonly<Record<TypeMultiplier, string>> = { 2: "2", 1: "", 0.5: "1/2", 0: "0" };
export const TYPE_NAME_JOIN = " / ";
export const HINT_KEYS = { normal: "types.hint.normal", fire: "types.hint.fire", /* ...os 18, ordem de TYPE_IDS... */ fairy: "types.hint.fairy" } as const satisfies Record<TypeId, MessageKey>;

export function isTypeId(v: unknown): v is TypeId;                       // typeof v === "string" && (TYPE_IDS as readonly string[]).includes(v)
export function toneOf(m: TypeMultiplier): Tone;                          // 2 adv, 0.5 dis, 0 zero, 1 neutral (matriz, otica de quem ataca)
export function attackGroups(type: TypeId): TypeGroup[];                  // 3 grupos fixos (tabela abaixo)
export function defendGroups(defenders: readonly TypeId[]): TypeGroup[];  // 1 tipo: 3 grupos; 2 tipos: 5 grupos (F4.1)
export function matrixRows(): MatrixRow[];                                // 18 x 18 de typeChartMatrix(), ordem TYPE_IDS nos dois eixos
export function nextSelection(ui: Pick<TypesUi, "selected" | "second">, picked: TypeId): Partial<TypesUi> | null;
export function secondOptions(first: TypeId): TypeId[];                   // TYPE_IDS sem `first` (17), ordem canonica
export function parseSecond(value: string, first: TypeId): TypeId | null; // "" ou invalido ou igual ao 1o -> null
```

Tabela de grupos (ordem fixa; `types` = `TYPE_IDS.filter(...)`, nunca omitido, pode ser `[]`):

| funcao | ordem | multiplier | tone | titleKey | filtro |
|---|---|---|---|---|---|
| `attackGroups(X)` | 1 | 2 | `adv` | `types.atk2` | `singleMultiplier(X, d) === 2` |
| | 2 | 0.5 | `dis` | `types.atkHalf` | `=== 0.5` |
| | 3 | 0 | `zero` | `types.atk0` | `=== 0` |
| `defendGroups([X])` | 1 | 2 | `dis` | `types.def2` | `effectivenessAgainst([X])[a] === 2` |
| | 2 | 0.5 | `adv` | `types.defHalf` | `=== 0.5` |
| | 3 | 0 | `zero` | `types.def0` | `=== 0` |
| `defendGroups([X, Y])` (F4.1) | 1 | 4 | `dis-strong` | `types.def4` | `effectivenessAgainst([X, Y])[a] === 4` |
| | 2 | 2 | `dis` | `types.def2` | `=== 2` |
| | 3 | 0.5 | `adv` | `types.defHalf` | `=== 0.5` |
| | 4 | 0.25 | `adv-strong` | `types.defQuarter` | `=== 0.25` |
| | 5 | 0 | `zero` | `types.def0` | `=== 0` |

`defendGroups([])` (nunca chamado pela UI) devolve os 3 grupos de 1 tipo com `types: []`. Antes de F4.1, `defenders.length >= 2` usa so `defenders[0]` (comentario no codigo; F4.1 troca pelo ramo de 5 grupos).

Regras de selecao (`nextSelection`):

| estado `{ selected, second }` | `picked` | retorno |
|---|---|---|
| `{ null, null }` | `fire` | `{ selected: "fire" }` |
| `{ "fire", null }` | `fire` | `null` (no-op, RF-12) |
| `{ "fire", null }` | `water` | `{ selected: "water" }` |
| `{ "water", "ground" }` | `ground` | `{ selected: "ground", second: null }` (RF-38, premissa aceita) |
| `{ "water", "ground" }` | `grass` | `{ selected: "grass" }` (2o mantido) |

`selectType` (em `TypePicker.tsx`, exportado, reusado por `TypeMatrix.tsx`):
```ts
export function selectType(type: TypeId): void {
  const ui = useNavigationStore.getState().current.ui as TypesUi;
  const patch = nextSelection(ui, type);
  if (patch) useNavigationStore.getState().updateUi<"types">(patch);
}
```

Tom -> hex (SO em `types.css`, copiado de UISPEC 3.2b; fonte original `detail.css:94-95,319`, nunca importado):

| tom | fundo | texto | origem |
|---|---|---|---|
| `tone-adv` | #E1F5E7 | #1B6B3A | `.mult-half` |
| `tone-dis` | #FFE9D6 | #9A4A00 | `.mult-2` |
| `tone-zero` | #E6E7EC | #444A5C | `.mult-0` |
| `tone-dis-strong` | #FFD9D9 | #A10F0F | `.mult-4` (F4.1) |
| `tone-adv-strong` | #C9EED6 | #0F5A2C | `.mult-quarter` (F4.1) |
| `tone-neutral` | `var(--surface)` + borda 1px `var(--border)` | `var(--muted)` | `.mult-1` (so na matriz) |

### 5.5 Exemplos trabalhados (conferidos com `npx tsx` contra `TYPE_CHART` no HEAD; os testes DERIVAM do dominio, estes valores servem de referencia e de verificacao manual)

- `attackGroups("fire")` = `[{2, adv, [grass, ice, bug, steel]}, {0.5, dis, [fire, water, rock, dragon]}, {0, zero, []}]` -> faixas: VERDE "Forte contra (x2)" Planta, Gelo, Inseto, Aço; LARANJA "Pouco efetivo contra (x1/2)" Fogo, Água, Pedra, Dragão; CINZA "Não afeta (x0)" "nenhum" (RF-40, RF-46).
- `defendGroups(["fire"])` = `[{2, dis, [water, ground, rock]}, {0.5, adv, [fire, grass, ice, bug, steel, fairy]}, {0, zero, []}]` -> LARANJA "Fraco contra (recebe x2)" Água, Terra, Pedra; VERDE "Resiste a (recebe x1/2)" Fogo, Planta, Gelo, Inseto, Aço, Fada; CINZA "Imune a (x0)" "nenhum".
- `attackGroups("normal")` = `[{2, adv, []}, {0.5, dis, [rock, steel]}, {0, zero, [ghost]}]`; `defendGroups(["normal"])` = `[{2, dis, [fighting]}, {0.5, adv, []}, {0, zero, [ghost]}]` (grupos vazios de RF-18, RF-41).
- `attackGroups("electric")` = `[[water, flying], [electric, grass, dragon], [ground]]`; `defendGroups(["electric"])` = `[[ground], [electric, flying, steel], []]` (RF-42).
- `attackGroups("ghost")` = `[[psychic, ghost], [dark], [normal]]`; `defendGroups(["ghost"])` = `[[ghost, dark], [poison, bug], [normal, fighting]]` (RF-43).
- `attackGroups("steel")` = `[[ice, rock, fairy], [fire, water, electric, steel], []]`; `defendGroups(["steel"])` = `[[fire, fighting, ground], [normal, grass, ice, flying, psychic, bug, rock, dragon, steel, fairy] (10), [poison]]` (RF-44).
- Matriz: linha `fire`, coluna `grass` -> `{ multiplier: 2, symbol: "2", tone: "adv" }`, `aria-label` "Fogo contra Planta: x2"; linha `water`, coluna `fire` -> `{ 2, "2", "adv" }` (com Fogo selecionado essa celula fica na coluna destacada e e VERDE: vantagem de quem ataca, RF-46); linha `fire`, coluna `normal` -> `{ 1, "", "neutral" }`, `aria-label` "Fogo contra Normal: x1"; linha `normal`, coluna `ghost` -> `{ 0, "0", "zero" }`; linha `fire`, coluna `water` -> `{ 0.5, "1/2", "dis" }`. Totais: 51 `adv`, 61 `dis`, 8 `zero`, 204 `neutral`.
- Consistencia (RF-30): para cada X, `matrixRows()[i(X)].cells.filter((c) => c.multiplier === 2).map((c) => c.defender)` = `attackGroups(X)[0].types`; e, para m em 2/0.5/0, `matrixRows().filter((r) => r.cells[i(X)].multiplier === m).map((r) => r.attacker)` = grupo m de `defendGroups([X])`.
- `[COULD]` `defendGroups(["water", "ground"])` = `[{4, dis-strong, [grass]}, {2, dis, []}, {0.5, adv, [fire, poison, rock, steel]}, {0.25, adv-strong, []}, {0, zero, [electric]}]` (Água/Terra contra Planta = x2 * x2 = x4; contra Elétrico = x2 * x0 = x0). `effectivenessAgainst(["water", "flying"]).electric = 4`; `(["rock", "steel"]).normal = 0.25`; `(["grass", "steel"]).fire = 4` (RF-39).
- `secondOptions("water")` = os 17 de `TYPE_IDS` sem `water`; `parseSecond("", "water") = null`, `parseSecond("ground", "water") = "ground"`, `parseSecond("water", "water") = null`, `parseSecond("banana", "water") = null`.

## 5b. Dependencias e configuracao

- Nenhuma dependencia npm nova (`package.json` intocado, CA-43). `lucide-react` 0.577.0 ja instalado: so o reexport `Shapes` entra em `ROOT/src/components/Icon.tsx` (fallback `Layers`, tambem presente, so se `Shapes` deixar de existir).
- Nenhuma variavel de ambiente, nenhum segredo, nenhuma chamada de rede (RNF-11).
- `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `tsconfig*`: SEM mudanca. Precache: o JS/CSS novo entra pelo glob existente `**/*.{js,css,html,svg,woff2}` (`vite.config.ts:63`); nenhum asset novo.
- `src/styles/types.generated.css` NAO e editado (gerado).
- Porta do dev server para os e2e desta feature: `PW_PORT=4183` (evita colisao com 4173 a 4179 usados por outras frentes).

## 5c. Matriz de autorizacao

N/A: app local de usuario unico, sem login, sem papeis, sem recurso com dono, sem endpoint (PRD secao 2).

---

## 6. Divisao do trabalho

## Backend

N/A. Nao ha servidor, API, pipeline de dataset nem mudanca de contrato de dados: a pagina so le o modulo TS do dominio, ja embutido no bundle. Nenhuma sprint de backend; nenhum HANDOFF de backend.

## Frontend

"Frontend" = app React em `ROOT/src/`. Referencia visual obrigatoria: `FEATURE_DIR/UISPEC_type-chart.md` (3.2b semantica de cor com os hex por faixa e por aba e a otica de quem ataca na matriz; 3.3 metricas de chip/seg/panel; 3.4 foco; 4 inventario; 5 layout; 7 Do/Don't) e as capturas de `FEATURE_DIR/ui-refs/`. Toda feature cita a secao que implementa; nenhuma cor nova alem da tabela 5.4 (copia de 3.2b). Sprints: S0 (linha de base), F1 (navegacao e registro), F2 (visao por tipo), F3 (tabela completa), F4 (`[COULD]` defesa com 2 tipos), F5 (fechamento), T1 (testes, definidos aqui e escritos na etapa de testes, mais o inventario do porte).

---

## 7. Sprints

### Regras gerais de toda feature de frontend (auto-fill da categoria `frontend`)

- **Loading**: N/A. A pagina nao carrega nada assincrono (dominio e i18n sao modulos do bundle); renderiza no 1o paint. Sem spinner, sem skeleton.
- **Erro**: o `ErrorBoundary` por tela ja envolve toda tela do registro (`AppShell.tsx:64-68`, `key={entryId}`); nada novo pode lancar com entrada valida: o modelo so recebe `TypeId` (vindos de `TYPE_IDS`, do `ui` tipado ou de `parseSecond`), `HINT_KEYS` e tipado, chaves i18n existem (teste de completude). Nenhum `try/catch` novo.
- **Vazio**: grupo sem tipos mostra o titulo e "nenhum"/"none" (`p.tp-none`, RF-18); sem tipo selecionado, a visao "Por tipo" mostra a grade + `p.tp-instr` e a matriz fica sem destaque (RF-19).
- **Offline**: N/A (nenhuma rede); depois do 1o carregamento o SW ja precacheia o JS/CSS da pagina pelo glob existente.
- **Validacao de entrada**: so o `select` do 2o tipo (F4.1), resolvido por `parseSecond` (valor vazio, desconhecido ou igual ao 1o -> `null`); visao e aba so recebem valores das proprias opcoes tipadas do `SegmentedControl`.
- **Erro de API**: N/A (sem API).
- **Textos**: todo texto visivel e todo `aria-label` por `t()` (regra `pontindex/no-literal-jsx-text`, `eslint.config.js:7-23`); simbolos e separador sao constantes do modelo (`MULT_SYMBOL`, `CELL_SYMBOL`, `TYPE_NAME_JOIN`); nomes de tipo por `typeName(type, uiLanguage)`.
- **Tema/mobile**: so tokens do tema (`--surface`, `--surface-2`, `--text`, `--muted`, `--border`, `--secondary`, `--primary`, `--radius-md`) mais os hex de tom da tabela 5.4; layout mobile por `.app.mobile ...` (padrao do app, nao media query); 360/390/1280 px sem vazamento nem sobreposicao (`tests/harness/no-overlap.ts`). Nada de opacidade para "desligado" (UISPEC 7).
- **Done when (dente: tela RENDERIZADA)**: nenhuma feature de frontend fica verde so com build/typecheck. Toda feature roda um spec TEMPORARIO `ROOT/tests/e2e/zz-type-chart-capture.spec.ts` (copia `trackConsoleErrors` de `tests/e2e/compare.spec.ts:7-14`, `boot` de `compare.spec.ts:16-22`, `setLanguage` de `compare.spec.ts:53-57`, `settle` de `compare.spec.ts:60-68`, `setTheme` de `tests/e2e/responsive.spec.ts:76-86` com `writeDoc` de `./idb-helpers` seguido de `page.reload()` e espera `.boot` 0), com `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/zz-type-chart-capture.spec.ts` (headless, sem slowMo, sem sleep; o `webServer` do `playwright.config.ts` sobe o Vite na 4183), navegando por clique real em `[data-nav="types"]:visible` (no phone: `[data-nav="more"]:visible` e depois `[data-nav="types"]:visible`, padrao de `responsive.spec.ts:36-43`), e salva PNGs `FEATURE_DIR/ui-refs/after-<id-da-feature>-<alvo>-<classic|black>-<desktop|phone>.png` (desktop 1280 x 800, phone 390 x 844) para comparar LADO A LADO com as capturas do UISPEC citadas na feature (regra do Pontin: mostrar no navegador antes de aprovar). O spec temporario roda `expectNoOverlap(page, ".types-screen")` em cada captura e falha com erro de console. Ele e APAGADO antes do commit (nunca versionado); os PNGs `after-*` SAO versionados no mesmo commit da feature. Alem disso: `npm run typecheck`, `npm run lint` e os testes citados verdes.

---

## Sprint 0

### Sprint S0: Pre-voo (linha de base antes de qualquer mudanca)

- **Descricao**: roda typecheck, lint, a suite unitaria com cobertura, o build e a suite e2e INTEIRA no HEAD atual sem mudar codigo, para separar flake preexistente de regressao (LESSONS 2026-09-29) e congelar as medidas de partida.
- **Deliverable**: secao "Baseline (Sprint 0)" no `FEATURE_DIR/STATE_type-chart.md` e no checklist.
- **Risco**: baixo (so leitura).
- **Prerequisito**: `git -C ROOT status --short` vazio (ou so artefatos `.forge`).

#### Feature S0.1: Linha de base completa `[category: outro]`
- **Traces**: RNF-08, RNF-09, RNF-10; restricao "rodar a suite completa e o build na main ANTES" (PRD secao 3, "Restricoes de implementacao e processo").
- **Files**:
  - `ROOT/.forge/ideas/type-chart/STATE_type-chart.md` (modificar: secao nova no fim)
  - `ROOT/.forge/ideas/type-chart/CHECKLIST_type-chart.md` (criar, se o orquestrador ainda nao criou: uma linha por feature deste SPEC)
  - nenhum arquivo de codigo
- **Steps**:
  1. `git -C ROOT rev-parse HEAD` e `git -C ROOT status --short`; anotar.
  2. `npm run typecheck` e `npm run lint` (em ROOT); anotar resultado.
  3. `npx vitest run --coverage`: anotar arquivos, testes, falhas (nome + 5 primeiras linhas do erro) e as porcentagens por grupo do `vitest.config.ts` (global, `src/domain/**`, `src/components/**`, `src/screens/**`). Falha conhecida a conferir: `tests/unit/domain/bait.test.ts:106` (flake de tempo sob carga, LESSONS 2026-10-12): se falhar, rodar sozinho 3 vezes e anotar.
  4. `npm run build`: anotar sucesso e a soma em bytes de `dist/assets/*.js` e `dist/assets/*.css` (`node -e` com `fs.readdirSync`/`statSync`), base para T1.4.
  5. `npx playwright test` (build + preview, headless, sem `PW_DEV`): total/passou/falhou/flaky. Para CADA teste que falhar: `npx playwright test <arquivo> -g "<titulo exato>" --repeat-each=3` e anotar quantas das 3 passaram e a 1a linha do erro. Classificar: 3/3 falha = deterministica preexistente; 1-2/3 = flake preexistente. Anotar explicitamente o status dos 7 testes `theme <tema>: Home and Charizard detail screenshots` (`responsive.spec.ts:186-202`) e dos testes de `shell.spec.ts`.
  6. Anotar que `src/domain/type-chart.ts` (`523b99cd7ceb`), `src/screens/Detail/TypeCalculator.tsx` (`0906d2d74663`) e `package.json` (`3244a616e4a9`) estao nesses blobs (referencia para CA-43).
- **Edge cases**: falha preexistente nao bloqueia, mas fica listada com evidencia e e o criterio de T1.4; nenhum assert e mexido aqui; porta 4173 ocupada = liberar e repetir (anotar), nunca trocar a porta sem registro.
- **Consumes contract**: nada.
- **Done when**: STATE e checklist com os 6 passos e os numeros; `git status` sem mudanca de codigo.
- **Commit**: `docs(forge): linha de base da suite antes do type-chart`
- **Rollback**: `git revert <hash>` (so documento).

---

## Frontend

### Sprint F1: Navegacao e registro da tela

- **Descricao**: textos PT/EN, estado da tela, registro, item "Tipos" na sidebar e na folha "Mais", testes do shell atualizados e as 14 baselines revisadas.
- **Deliverable**: "Tipos" abre uma tela (so o titulo) por clique real, no desktop e no phone; suite verde com os 4 asserts atualizados e as baselines novas.
- **Risco**: medio (testes de shell e baselines).
- **Prerequisito**: S0.1 registrada. Ordem F1.1 -> F1.2 -> F1.3.

#### Feature F1.1: Modulo i18n da pagina `[category: frontend]`
- **Traces**: RF-01, RF-15, RF-20, RF-21, RF-22, RF-23, RF-24 (chaves), RF-26, RF-27, RF-47, RF-49, RNF-06.
- **Files**:
  - `ROOT/src/i18n/messages/types-page.ts` (criar)
  - `ROOT/src/i18n/messages.ts` (modificar: import depois da linha 19 `import { SYNC_MESSAGES } from "./messages/sync";`; entrada depois da linha 37 `sync: SYNC_MESSAGES,`; spread depois da linha 53 `...SYNC_MESSAGES,`)
- **Steps**:
  1. `types-page.ts`: cabecalho `// Mensagens i18n do modulo "types" (pagina Tipos, type-chart). Inclui nav.types/nav.typesSub para o porte ser copia de arquivo (SPEC secao 3).` + `import type { Message } from "./types";` + `export const TYPES_PAGE_MESSAGES = { ... } as const satisfies Record<string, Message>;` com EXATAMENTE as 45 chaves de F1.1 da secao 5.3 (nav 2, visoes/abas/grade 8, legenda 6, grupos 7, matriz 4, frases 18), na ordem das tabelas, valores copiados das tabelas (PT com acento). As 5 chaves `[COULD]` NAO entram aqui.
  2. `messages.ts`: `import { TYPES_PAGE_MESSAGES } from "./messages/types-page";`; em `MESSAGE_MODULES`: `types: TYPES_PAGE_MESSAGES,`; em `MESSAGES`: `...TYPES_PAGE_MESSAGES,`. Nenhuma outra linha muda (o comentario "congelado apos F1.4" fica).
- **Edge cases**: chave repetida em outro modulo (`i18n-modules.test.ts:7-16` reprova; conferido: nenhuma chave `types.*` nem `nav.types*` existe hoje); PT/EN nao vazios (`i18n-modules.test.ts:18-25`); nenhum U+2014; loading/erro/vazio/offline/API N/A (so texto).
- **Consumes contract**: 5.3 (chaves e valores).
- **Done when**: `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts tests/unit/ui-foundation` verde; `npm run typecheck` e `npm run lint` limpos; `node -e` (ou `npx tsx -e`) imprime `Object.keys(TYPES_PAGE_MESSAGES).length === 45`; captura `after-f11-home-classic-desktop.png` sem nenhuma mudanca visual em relacao a `shell-sidebar-classic-desktop.png` (as chaves ainda nao sao usadas).
- **Commit**: `feat(i18n): textos da pagina Tipos (legenda, grupos, matriz e frases de intuicao)`
- **Rollback**: `git revert <hash>`.

#### Feature F1.2: Tela registrada, estado, item de navegacao e testes do shell `[category: frontend]`
- **Traces**: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-34, RF-35, RF-36, RF-49, RNF-10; UISPEC 4 (reexport de icones), 5 (shell desktop e phone).
- **Files**:
  - `ROOT/src/navigation/types.ts` (modificar: linhas 9, 22, 36, 48, 77, 113; secao 5.2)
  - `ROOT/src/components/Icon.tsx` (modificar: `Shapes,` entre a linha 38 `Settings,` e a linha 39 `Shield,`)
  - `ROOT/src/components/nav-items.ts` (modificar: linha 3 import; item novo depois da linha 19)
  - `ROOT/src/screens/registry.ts` (modificar: import depois da linha 15; entrada depois da linha 24)
  - `ROOT/src/screens/Types/TypesScreen.tsx` (criar: esqueleto)
  - `ROOT/src/screens/Types/types.css` (criar: bloco base)
  - `ROOT/tests/unit/ui-shell/shell.test.tsx` (ajuste de assert: linhas 114 e 147, secao 2.7)
  - `ROOT/tests/e2e/shell.spec.ts` (ajuste de assert: linhas 110 e 173, secao 2.7)
- **Steps**:
  1. `navigation/types.ts` exatamente como a secao 5.2 (6 insercoes; nenhuma linha existente removida).
  2. `Icon.tsx`: inserir `  Shapes,` depois de `  Settings,` (ordem alfabetica do reexport). Conferir que `Shapes` resolve (`lucide-react.d.ts:16956`); se o typecheck acusar ausencia, usar `Layers` (`:11314`) no lugar, no reexport e no item, e anotar no STATE.
  3. `nav-items.ts`: linha 3 vira `import { ArrowLeftRight, Backpack, CircleDot, House, List, QrCode, Settings, Shapes, Swords } from "./Icon";`; depois da linha 19 (`compare`): `  { screen: "types", labelKey: "nav.types", subKey: "nav.typesSub", icon: Shapes },`. `TAB_SCREENS` (l.27), `MORE_ITEMS` (l.29) e `navOwner` (l.32-36) intocados.
  4. `TypesScreen.tsx` (esqueleto, completado em F2.2):
     ```tsx
     // Pagina Tipos (type-chart, RF-01..RF-49): legenda fixa, seletor de visao e as duas visoes.
     // Deriva tudo de src/domain/type-chart.ts via types-model.ts; estado no ui da entrada "types" da pilha.
     import "./types.css";
     import type { ScreenProps } from "../../components/ScreenRouter";
     import { useT } from "../../i18n/useT";

     export function TypesScreen(_props: ScreenProps) {
       const t = useT();
       return (
         <section className="types-screen">
           <div className="page-head">
             <h2>{t("nav.types")}</h2>
           </div>
         </section>
       );
     }
     ```
  5. `types.css` (bloco base):
     ```css
     /* Pagina Tipos (type-chart). Carregado SO por TypesScreen.tsx. Cores de efetividade COPIADAS de UISPEC 3.2b
        (origem detail.css .mult-*), nunca importadas. Toda regra com escopo .types-screen. */
     .types-screen { display: grid; gap: 16px; min-width: 0; }
     .types-screen .page-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
     ```
  6. `registry.ts`: `import { TypesScreen } from "./Types/TypesScreen";` depois da linha 15 (`TrainersScreen`); `  types: TypesScreen,` depois da linha 24 (`compare: CompareScreen,`).
  7. Ajustes de assert (secao 2.7, textos exatos; nenhum outro assert muda).
- **Edge cases**: clicar "Tipos" estando em "Tipos" so rola ao topo (`go`, `navigation-store.ts:94-96`); no phone o item NAO entra na tabbar (5 vagas, `mobile.css:13`) e "Mais" acende (`TabBar.tsx:18`); a sidebar nao mostra subtitulos (PRD rev 5.2, CA-50); o rodape da sidebar continua visivel em 1280 x 800; recarregar abre a Home (sem rota por URL); erro/loading/offline/API N/A.
- **Consumes contract**: 5.2 (ScreenId, `UiStateMap.types`, `defaultUi`), 5.3 (`nav.types`, `nav.typesSub`).
- **Done when**: `npm run typecheck`, `npm run lint` limpos; `npx vitest run tests/unit/ui-shell` verde (inclui l.66 paridade e as 2 listas novas); `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/shell.spec.ts tests/e2e/navigation.spec.ts` verde (as 2 listas novas e `toBeInViewport` da folha); captura headless: `after-f12-sidebar-{classic,black}-desktop.png` (comparar com `shell-sidebar-*-desktop.png`: "Tipos" em 5o com icone proprio, ativo ao clicar, rodape visivel), `after-f12-more-sheet-{classic,black}-phone.png` (com `shell-more-sheet-*-phone.png`: "Tipos" + "Quem vence quem" em 1o) e `after-f12-tabbar-classic-phone.png` (com `shell-tabbar-*-phone.png`: "Mais" ativo com "Tipos" aberto); no spec temporario: `history.length` sobe 1 ao abrir "Tipos" pela sidebar e `page.url()` nao muda de caminho. `responsive.spec.ts` NAO roda aqui (F1.3, logo em seguida).
- **Commit**: `feat(types): item Tipos na navegacao, tela registrada e estado na pilha`
- **Rollback**: `git revert <hash>` (reverte tela, item e os 4 asserts juntos).

#### Feature F1.3: Baselines visuais do responsive (10o item da sidebar) `[category: outro]`
- **Traces**: RF-10, RNF-10, CA-07.
- **Files**: `ROOT/tests/e2e/responsive.spec.ts-snapshots/{home,detail-charizard}-{black,blue,classic,green,orange,purple,white}-chromium-win32.png` (modificar, 14); script de diff so no scratchpad (nao versionado).
- **Steps** (protocolo de revisao; `S` = scratchpad do agente):
  1. `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/responsive.spec.ts -g "Home and Charizard detail screenshots"`; anotar por tema passou/falhou e, se falhou, a razao de pixels da mensagem. As duas saidas sao possiveis (a mudanca pode ficar abaixo de `maxDiffPixelRatio: 0.02`); em NENHUM caso a tolerancia muda.
  2. Copiar as 14 baselines atuais: `git -C ROOT show HEAD:tests/e2e/responsive.spec.ts-snapshots/<arquivo> > S/old/<arquivo>` para cada um.
  3. Regenerar so esses 7 testes: `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/responsive.spec.ts -g "Home and Charizard detail screenshots" --update-snapshots=all` (modo `all`: regrava mesmo dentro da tolerancia; baselines sao do modo dev, `responsive.spec.ts:7`).
  4. Diff por pixel com `sharp` (devDependency do projeto, `package.json`): script node ESM em `S/diff.mjs` executado a partir de ROOT; para cada par old/new: mesmas dimensoes (senao FALHA e parar); pixel diferente = maior diferenca de canal RGBA > 16; calcular contagem e caixa envolvente. Criterio: contagem > 0 E caixa inteira com `maxX < 236` (largura da sidebar, `shell.css:43`, `box-sizing: border-box`). Pixel diferente fora da sidebar = regerar uma vez (passo 3) e repetir; se persistir, PARAR e registrar no STATE (nao commitar).
  5. Revisao visual (abrir as imagens) de `home-classic`, `home-black`, `detail-charizard-classic`, `detail-charizard-black` e `detail-charizard-purple`, velha x nova: "Tipos" em 5o lugar com o icone `Shapes`, itens de "Treinadores" a "Configurações" deslocados uma linha, rodape intacto, conteudo de `#main` identico.
  6. Rodar o passo 1 de novo, sem `--update-snapshots`: 7 testes verdes. `git -C ROOT status --short tests/e2e/responsive.spec.ts-snapshots` = exatamente os 14 arquivos.
  7. Registrar no STATE: tabela por arquivo (contagem de pixels diferentes, caixa envolvente, passou/falhou antes da regeneracao).
- **Edge cases**: se S0.1 registrou esses testes como falha preexistente, anotar e ainda assim so regravar depois do criterio do passo 4; mascaras existentes (`.hero-art .sparkles`, `.sheen`) nao mudam; nenhuma outra baseline e tocada.
- **Consumes contract**: nada (efeito visual de F1.2).
- **Done when**: os 7 testes de tema verdes sem `--update-snapshots`; diff = 14 PNGs; tabela do passo 7 no STATE com 100% dos pixels diferentes em `x < 236`; `maxDiffPixelRatio` continua `0.02` (`git diff -- tests/e2e/responsive.spec.ts` vazio).
- **Commit**: `test(e2e): baselines do responsive com o item Tipos na sidebar`
- **Rollback**: `git revert <hash>`.

### Sprint F2: Visao por tipo (principal)

- **Descricao**: modelo puro, legenda fixa, seletor de visao, grade de tipos, bloco heroi, abas e faixas coloridas.
- **Deliverable**: escolher Fogo mostra o heroi, a frase e as 3 faixas de Atacando e de Defendendo conforme 5.5, com capturas `after-*` nos dois temas e nos dois tamanhos.
- **Risco**: medio (sobreposicao icone/nome; contraste).
- **Prerequisito**: F1.2. Ordem F2.1 -> F2.2 -> F2.3.

#### Feature F2.1: Modelo puro `types-model.ts` `[category: frontend]`
- **Traces**: RF-12, RF-15, RF-16, RF-17, RF-25, RF-27, RF-30, RF-31, RF-38 (regra), RNF-01, RNF-07.
- **Files**: `ROOT/src/screens/Types/types-model.ts` (criar)
- **Steps**:
  1. Colar o cabecalho, imports, tipos e constantes da secao 5.4 (com os 18 pares de `HINT_KEYS` escritos, na ordem de `TYPE_IDS`).
  2. Implementar: `isTypeId` (`typeof v === "string" && (TYPE_IDS as readonly string[]).includes(v)`); `toneOf` (switch 2/0.5/0/1); `attackGroups` e `defendGroups` com duas constantes de especificacao `ATTACK_SPEC` e `DEFEND_SINGLE_SPEC` (arrays de `{ multiplier, tone, titleKey }` na ordem da tabela de grupos) e `types: TYPE_IDS.filter(...)` conforme a coluna "filtro"; `defendGroups` usa `effectivenessAgainst(defenders.length > 0 ? [defenders[0]] : [])` ate F4.1 (comentario `// F4.1: ramo de 2 tipos`); `matrixRows` a partir de UMA chamada de `typeChartMatrix()`; `nextSelection` pela tabela de regras; `secondOptions` e `parseSecond` (5.4).
  3. Nenhuma importacao de React, store ou CSS.
- **Edge cases**: grupo vazio = `types: []` (nunca omitido); `defendGroups([])` = 3 grupos vazios; `parseSecond` com lixo = `null`; ordem sempre a de `TYPE_IDS`; erro/loading/offline/API N/A (puro).
- **Consumes contract**: 5.1 (`TYPE_IDS`, `singleMultiplier`, `effectivenessAgainst`, `typeChartMatrix`, `Effectiveness`), 5.2 (`UiStateMap["types"]`), 5.3 (chaves de grupo e `types.hint.*`), 5.4.
- **Done when**: `npm run typecheck` e `npm run lint` limpos; script `npx tsx -e` (scratchpad) imprime para fire/normal/electric/ghost/steel exatamente os grupos da secao 5.5 e as contagens 51/61/8/204 de `matrixRows()`; `nextSelection` reproduz as 5 linhas da tabela; captura `after-f21-types-classic-desktop.png` (tela ainda so com titulo: nada visual muda; o modelo ainda nao e usado).
- **Commit**: `feat(types): modelo puro da pagina Tipos (grupos, matriz e selecao)`
- **Rollback**: `git revert <hash>`.

#### Feature F2.2: Legenda, seletor de visao, grade de tipos e bloco heroi `[category: frontend]`
- **Traces**: RF-11, RF-12, RF-13, RF-19, RF-20, RF-21, RF-22, RF-23, RF-31, RF-32, RF-47, RNF-02, RNF-03, RNF-04, RNF-05; UISPEC 3.2b (amostras da legenda), 3.3 (`.chip`, `.chips-scroll .chip.on`, `.seg`, `.panel`), 3.4 (foco), 4 (`SegmentedControl`, padrao de chip-botao), 7.
- **Files**:
  - `ROOT/src/screens/Types/TypesScreen.tsx` (modificar: substituir o esqueleto de F1.2)
  - `ROOT/src/screens/Types/TypePicker.tsx` (criar)
  - `ROOT/src/screens/Types/TypeFocus.tsx` (criar: so o heroi nesta feature)
  - `ROOT/src/screens/Types/types.css` (modificar: acrescentar o bloco abaixo)
- **Steps**:
  1. `TypePicker.tsx`: imports `memo` (react), `Check` (`../../components/Icon`), `TypeIcon`, `typeName` (`../../components/TypeChip`), `TypeId`, `TYPE_IDS`, `useT`, `useNavigationStore` (`../../navigation/navigation-store`), `useScreenUi`, `usePreferencesStore`, `nextSelection`/`TypesUi` (`./types-model`). Exporta `selectType` (codigo exato em 5.4) e:
     ```tsx
     export const TypePicker = memo(function TypePicker() {
       const t = useT();
       const lang = usePreferencesStore((s) => s.uiLanguage);
       const selected = useScreenUi("types", "selected");
       return (
         <div className="tp-grid" role="group" aria-label={t("types.pickLabel")}>
           {TYPE_IDS.map((type) => {
             const on = type === selected;
             return (
               <button key={type} type="button" className={`chip t-${type} tp-pick${on ? " on" : ""}`} data-pick={type} aria-pressed={on} onClick={() => selectType(type)}>
                 <TypeIcon type={type} />
                 <span>{typeName(type, lang)}</span>
                 <Check className="chip-check" aria-hidden="true" />
               </button>
             );
           })}
         </div>
       );
     });
     ```
  2. `TypeFocus.tsx` (heroi; abas e faixas entram em F2.3): imports `memo` (react), `TypeIcon`, `typeName`, `TypeId`, `useT`, `usePreferencesStore`, `HINT_KEYS` e `TYPE_NAME_JOIN` (`./types-model`); `export const TypeFocus = memo(function TypeFocus({ type }: { type: TypeId }) { ... })` renderizando
     ```tsx
     <div className={`panel tp-hero t-${type}`} data-hero={type}>
       <div className="tp-hero-icons">
         {heroTypes.map((ty) => <TypeIcon key={ty} type={ty} className="tp-ti-xl" />)}
       </div>
       <div className="tp-hero-text">
         <h3>{heroTypes.map((ty) => typeName(ty, lang)).join(TYPE_NAME_JOIN)}</h3>
         <p className="tp-hint">{t(HINT_KEYS[type])}</p>
       </div>
     </div>
     ```
     com `const heroTypes: TypeId[] = [type];` (F4.1 acrescenta o 2o na aba Defendendo) e `lang` de `usePreferencesStore((s) => s.uiLanguage)`.
  3. `TypesScreen.tsx` (versao completa desta sprint): imports `./types.css`, `ScreenProps`, `SegmentedControl`, `useT`, `TypesView` (`../../navigation/types`), `useNavigationActions`/`useScreenUi`, `TypeFocus`, `TypePicker` (e `TypeMatrix` em F3.1). Componentes locais:
     ```tsx
     function TypesLegend() {
       const t = useT();
       return (
         <div className="panel tp-legend">
           <h3>{t("types.legendTitle")}</h3>
           <ul className="tp-legend-list">
             <li>{t("types.legend2")}</li>
             <li>{t("types.legendHalf")}</li>
             <li>{t("types.legend0")}</li>
           </ul>
           <p className="tp-legend-color">
             <span className="tp-swatches" aria-hidden="true"><i className="tone-adv" /><i className="tone-dis" /><i className="tone-zero" /></span>
             <span>{t("types.legendBands")}</span>
           </p>
           <p className="tp-legend-color">
             <span className="tp-swatches" aria-hidden="true"><i className="tone-adv" /><i className="tone-dis" /><i className="tone-zero" /></span>
             <span>{t("types.legendTable")}</span>
           </p>
         </div>
       );
     }

     function ByTypeView() {
       const t = useT();
       const selected = useScreenUi("types", "selected");
       return (
         <>
           <div className="panel tp-pick-panel">
             <TypePicker />
             {selected === null ? <p className="tp-instr">{t("types.pick")}</p> : null}
           </div>
           {selected !== null ? <TypeFocus type={selected} /> : null}
         </>
       );
     }

     export function TypesScreen(_props: ScreenProps) {
       const t = useT();
       const { updateUi } = useNavigationActions();
       const view = useScreenUi("types", "view");
       return (
         <section className="types-screen">
           <div className="page-head">
             <h2>{t("nav.types")}</h2>
           </div>
           <TypesLegend />
           <SegmentedControl<TypesView>
             className="tp-view"
             ariaLabel={t("types.viewLabel")}
             value={view}
             options={[{ value: "byType", label: t("types.viewByType") }, { value: "chart", label: t("types.viewChart") }]}
             onChange={(v) => updateUi<"types">({ view: v })}
           />
           {view === "byType" ? <ByTypeView /> : null}
         </section>
       );
     }
     ```
     (F3.1 troca o `null` por `<TypeMatrix />`.)
  4. `types.css` (acrescentar):
     ```css
     /* tons de efetividade (UISPEC 3.2b): fundo E texto juntos, iguais em todos os temas */
     .types-screen .tone-adv { background: #E1F5E7; color: #1B6B3A; }
     .types-screen .tone-dis { background: #FFE9D6; color: #9A4A00; }
     .types-screen .tone-zero { background: #E6E7EC; color: #444A5C; }
     /* legenda: linhas de multiplicador sem cor; amostras decorativas so ao lado das frases de cor */
     .types-screen .tp-legend h3 { margin-bottom: 10px; }
     .types-screen .tp-legend-list { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 18px; font-weight: 700; font-size: 14px; }
     .types-screen .tp-legend-color { display: flex; align-items: center; gap: 10px; margin: 6px 0 0; font-size: 13px; color: var(--muted); }
     .types-screen .tp-swatches { display: inline-flex; gap: 3px; flex: none; }
     .types-screen .tp-swatches i { display: block; width: 14px; height: 14px; border-radius: 4px; border: 1px solid rgba(0, 0, 0, .12); }
     .types-screen .tp-view { justify-self: start; max-width: 100%; }
     /* grade dos 18 tipos: chip-botao do Dex, quebrando linha; anel + check do .chips-scroll .chip.on (components.css:80-82) */
     .types-screen .tp-grid { display: flex; flex-wrap: wrap; gap: 8px; }
     .types-screen .tp-pick { cursor: pointer; flex: none; }
     .types-screen .tp-pick.on { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text); transform: translateY(-1px); }
     .types-screen .tp-pick.on .chip-check { display: inline-block; width: 12px; height: 12px; margin-left: -2px; }
     .types-screen .tp-instr { margin: 12px 0 0; font-weight: 700; color: var(--muted); }
     /* heroi: tipo grande + frase de intuicao */
     .types-screen .tp-hero { display: flex; align-items: center; gap: 16px; border-left: 6px solid var(--tc, var(--secondary)); }
     .types-screen .tp-hero-icons { display: flex; gap: 8px; flex: none; }
     .types-screen .ti.tp-ti-xl { width: 64px; height: 64px; }
     .types-screen .tp-hero-text { display: grid; gap: 4px; min-width: 0; }
     .types-screen .tp-hero h3 { margin: 0; font-size: 24px; overflow-wrap: anywhere; }
     .types-screen .tp-hero h3::before { content: none; }
     .types-screen .tp-hint { margin: 0; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
     .app.mobile .types-screen .ti.tp-ti-xl { width: 56px; height: 56px; }
     /* foco visivel (precedente item.css:81 e trainers.css:81); green, blue e purple usam --primary (precedente detail.css:121) */
     .types-screen .tp-pick:focus-visible, .types-screen .seg button:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }
     html[data-theme="green"] .types-screen :focus-visible, html[data-theme="blue"] .types-screen :focus-visible, html[data-theme="purple"] .types-screen :focus-visible { outline-color: var(--primary); }
     ```
- **Edge cases**: sem tipo -> grade + instrucao, heroi oculto (RF-19); tocar no selecionado = nada (`nextSelection` null, nenhuma escrita); trocar idioma com tipo selecionado troca nomes, legenda e frase e mantem a selecao (RF-20); toggle de termos em EN nao afeta (RF-32); tipos `electric/ice/normal/fairy` usam texto escuro do chip (regra global `components.css:76`); 360 px: chips quebram linha, heroi encolhe para 56 px; nada de opacidade; foco visivel em chips e nos botoes do seletor; erro/loading/offline/API N/A.
- **Consumes contract**: 5.2 (`view`, `selected`), 5.3 (legenda, visoes, `types.pick`, `types.pickLabel`, `types.hint.*`), 5.4 (`nextSelection`, `HINT_KEYS`, `TYPE_NAME_JOIN`, `selectType`, tons `adv/dis/zero`).
- **Done when**: typecheck/lint limpos; `npx vitest run tests/unit/ui-shell` verde; capturas `after-f22-empty-{classic,black}-{desktop,phone}.png` (sem tipo; comparar a grade com `dex-typechips-*.png`, o seletor com `dex-seg-status-*.png`, a legenda/painel com `detail-panel-weak-*.png`) e `after-f22-fire-{classic,black}-{desktop,phone}.png` (Fogo escolhido: chip com anel + check como `dex-typechips-selected-*.png`, heroi com icone 64/56 px, nome "Fogo" e a frase "Fogo queima Planta e Gelo, mas Água apaga Fogo") e `after-f22-fire-focus-classic-desktop.png` (Tab ate o chip de Fogo: anel 2px visivel, comparar com `dex-typechip-focus-*`); no spec temporario `expectNoOverlap(".types-screen")` a 360/390/1280 nos dois estados, `history.length` inalterado depois de 5 escolhas, e o chip selecionado e o UNICO com `aria-pressed="true"`.
- **Commit**: `feat(types): legenda, seletor de visao, grade dos 18 tipos e bloco heroi`
- **Rollback**: `git revert <hash>`.

#### Feature F2.3: Abas Atacando/Defendendo e faixas coloridas `[category: frontend]`
- **Traces**: RF-14, RF-15, RF-16, RF-17, RF-18, RF-22, RF-40, RF-41, RF-42, RF-43, RF-44, RF-46, RNF-02, RNF-04, RNF-05; UISPEC 3.2b (tabela de cor por faixa e por aba), 3.3 (`.seg`), 7 (cor + simbolo, sem sobreposicao).
- **Files**:
  - `ROOT/src/screens/Types/TypeFocus.tsx` (modificar: abas e faixas depois do heroi)
  - `ROOT/src/screens/Types/types.css` (modificar: acrescentar o bloco abaixo)
- **Steps**:
  1. Em `TypeFocus`: imports adicionais `useMemo` (react), `SegmentedControl`, `TypesTab` (`../../navigation/types`), `useNavigationActions` e `useScreenUi` (`../../navigation/useNavigation`), `attackGroups` e `defendGroups` (`./types-model`); `const { updateUi } = useNavigationActions(); const tab = useScreenUi("types", "tab"); const groups = useMemo(() => (tab === "attack" ? attackGroups(type) : defendGroups([type])), [tab, type]);` e, depois do heroi (o componente passa a devolver um fragmento):
     ```tsx
     <div className="tp-tabs-row">
       <SegmentedControl<TypesTab>
         className="tp-tab"
         ariaLabel={t("types.tabLabel")}
         value={tab}
         options={[{ value: "attack", label: t("types.tabAttack") }, { value: "defend", label: t("types.tabDefend") }]}
         onChange={(v) => updateUi<"types">({ tab: v })}
       />
     </div>
     <div className="tp-bands" data-tab={tab}>
       {groups.map((g) => (
         <section key={g.multiplier} className={`tp-band tone-${g.tone}`} data-mult={g.multiplier} data-tone={g.tone} aria-labelledby={`tp-band-${g.tone}`}>
           <h4 id={`tp-band-${g.tone}`}>{t(g.titleKey)}</h4>
           {g.types.length > 0 ? (
             <ul className="tp-band-list">
               {g.types.map((ty) => (
                 <li key={ty} className="tp-band-item" data-type={ty}>
                   <TypeIcon type={ty} className="tp-ti-lg" />
                   <span className="tp-band-name">{typeName(ty, lang)}</span>
                 </li>
               ))}
             </ul>
           ) : (
             <p className="tp-none">{t("types.none")}</p>
           )}
         </section>
       ))}
     </div>
     ```
     (os `id` sao unicos porque cada tom aparece uma vez por aba; o `data-mult` sai como `"2"`, `"0.5"`, `"0"`).
  2. `types.css` (acrescentar):
     ```css
     /* abas + faixas: cor = vantagem do ponto de vista da aba (tons acima), simbolo no titulo */
     .types-screen .tp-tabs-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
     .types-screen .tp-bands { display: grid; gap: 12px; }
     .types-screen .tp-band { border-radius: var(--radius-md); padding: 12px 14px; border: 1px solid rgba(0, 0, 0, .08); min-width: 0; }
     .types-screen .tp-band h4 { margin: 0 0 10px; font-size: 16px; font-weight: 700; color: inherit; }
     .types-screen .tp-band-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 12px 14px; }
     .types-screen .tp-band-item { display: grid; justify-items: center; gap: 4px; width: 64px; }
     .types-screen .ti.tp-ti-lg { width: 44px; height: 44px; }
     .types-screen .tp-band-name { font-size: 12px; font-weight: 800; text-align: center; line-height: 1.15; overflow-wrap: anywhere; }
     .types-screen .tp-none { margin: 0; font-size: 14px; font-weight: 800; }
     ```
- **Edge cases**: grupo vazio com "nenhum" (Normal: "Forte contra" e "Resiste a"; Fogo: "Não afeta" e "Imune a"); maior faixa = 10 icones (Aco, "Resiste a") quebrando linha sem sobrepor; trocar de aba mantem o tipo e o heroi; tipo x1 nunca aparece; o tom vem do modelo (nunca `if` de cor no JSX); temas: tons fixos com texto proprio (legiveis no `black`); erro/loading/offline/API N/A.
- **Consumes contract**: 5.2 (`tab`), 5.3 (grupos, `types.none`, abas), 5.4 (`attackGroups`, `defendGroups`, `TypeGroup`, tons), 5.5 (Fogo, Normal, Eletrico, Fantasma, Aco).
- **Done when**: typecheck/lint limpos; capturas `after-f23-fire-attack-{classic,black}-{desktop,phone}.png` e `after-f23-fire-defend-{classic,black}-{desktop,phone}.png` (comparar os tons com as pilulas de `detail-calc-grass-flying-*.png`: verde = `x½`, laranja = `x2`, cinza = `x0`; e o painel com `detail-panel-weak-*.png`), `after-f23-normal-attack-classic-phone.png` ("nenhum" em "Forte contra (x2)") e `after-f23-steel-defend-classic-phone.png` (10 icones quebrando linha); no spec temporario, para Fogo, os `data-type` de cada faixa = `attackGroups`/`defendGroups` calculados no proprio teste a partir de `TYPE_CHART` e os `data-tone` = `adv,dis,zero` (Atacando) e `dis,adv,zero` (Defendendo); `getComputedStyle(.tp-band).backgroundColor` = `rgb(225, 245, 231)` / `rgb(255, 233, 214)` / `rgb(230, 231, 236)` conforme o tom; `expectNoOverlap(".types-screen")` a 360/390/1280, PT e EN, nas duas abas.
- **Commit**: `feat(types): abas Atacando e Defendendo com faixas coloridas por vantagem`
- **Rollback**: `git revert <hash>`.

### Sprint F3: Tabela completa (matriz 18 x 18)

- **Descricao**: matriz atacante x defensor com cabecalhos clicaveis, destaque nao cromatico de linha e coluna, rolagem horizontal propria no phone com a 1a coluna fixa.
- **Deliverable**: "Tabela completa" mostra as 324 celulas de 5.5, destaca Fogo e Agua por clique, rola so dentro do container a 390 px.
- **Risco**: medio (sticky, sobreposicao, desempenho).
- **Prerequisito**: F2.2 (seletor de visao e `selectType`).

#### Feature F3.1: Matriz com cabecalhos clicaveis e coluna fixa `[category: frontend]`
- **Traces**: RF-19, RF-25, RF-26, RF-27, RF-28, RF-29, RF-30, RF-46, RF-47, RF-48, RNF-02, RNF-03, RNF-04, RNF-05, RNF-07; UISPEC 3.2b (otica de quem ataca, x1 neutro sem texto), 3.4 (foco), 5 (padrao `overflow-x: auto` de `.chips-scroll`/`.seg-tabs`), 7, 8 (matriz e design novo, sem referencia renderizada).
- **Files**:
  - `ROOT/src/screens/Types/TypeMatrix.tsx` (criar)
  - `ROOT/src/screens/Types/TypesScreen.tsx` (modificar: import de `TypeMatrix`; `{view === "byType" ? <ByTypeView /> : <TypeMatrix />}`)
  - `ROOT/src/screens/Types/types.css` (modificar: acrescentar o bloco abaixo)
- **Steps**:
  1. `TypeMatrix.tsx`: imports `memo`, `TypeIcon`, `typeName`, `TypeId`, `TYPE_IDS`, `useT`, `useScreenUi`, `usePreferencesStore`, `selectType` (`./TypePicker`), `matrixRows`, `MULT_SYMBOL` (`./types-model`). Constante de modulo `const ROWS = matrixRows();` (calculada uma vez).
     ```tsx
     export const TypeMatrix = memo(function TypeMatrix() {
       const t = useT();
       const lang = usePreferencesStore((s) => s.uiLanguage);
       const selected = useScreenUi("types", "selected");
       const name = (ty: TypeId) => typeName(ty, lang);
       return (
         <div className="panel tp-matrix-panel">
           <p className="tp-matrix-caption" id="tp-matrix-cap">{t("types.matrixCaption")}</p>
           <div className="tp-matrix-scroll" role="region" aria-labelledby="tp-matrix-cap" tabIndex={0}>
             <table className="tp-matrix" aria-labelledby="tp-matrix-cap">
               <thead>
                 <tr>
                   <td className="tp-corner" />
                   {TYPE_IDS.map((d) => (
                     <th key={d} scope="col" className={`tp-col-head${d === selected ? " is-sel" : ""}`}>
                       <button type="button" className="tp-head" data-axis="col" data-type={d} aria-pressed={d === selected} aria-label={t("types.colHeader", { type: name(d) })} onClick={() => selectType(d)}>
                         <TypeIcon type={d} />
                       </button>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {ROWS.map((row) => (
                   <tr key={row.attacker} data-row={row.attacker} className={row.attacker === selected ? "is-sel" : undefined}>
                     <th scope="row" className={`tp-row-head${row.attacker === selected ? " is-sel" : ""}`}>
                       <button type="button" className="tp-head" data-axis="row" data-type={row.attacker} aria-pressed={row.attacker === selected} aria-label={t("types.rowHeader", { type: name(row.attacker) })} onClick={() => selectType(row.attacker)}>
                         <TypeIcon type={row.attacker} />
                       </button>
                     </th>
                     {row.cells.map((c) => (
                       <td key={c.defender} className={`tp-cell tone-${c.tone}${c.defender === selected ? " is-col" : ""}`} data-def={c.defender} data-mult={c.multiplier} data-tone={c.tone} aria-label={t("types.cellLabel", { atk: name(c.attacker), def: name(c.defender), mult: MULT_SYMBOL[c.multiplier] })}>
                         {c.symbol}
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       );
     });
     ```
  2. `TypesScreen.tsx`: `import { TypeMatrix } from "./TypeMatrix";` e trocar `null` por `<TypeMatrix />`. A legenda (com as duas frases de cor) continua acima nas duas visoes (RF-21).
  3. `types.css` (acrescentar):
     ```css
     /* matriz 18 x 18: otica de quem ataca (linha); x1 neutro sem texto; 1a coluna fixa com fundo opaco */
     .types-screen .tone-neutral { background: var(--surface); color: var(--muted); border: 1px solid var(--border); }
     .types-screen .tp-matrix-caption { margin: 0 0 10px; font-weight: 700; }
     .types-screen .tp-matrix-scroll { max-width: 100%; overflow-x: auto; overflow-y: hidden; padding: 4px; }
     .types-screen .tp-matrix { border-collapse: separate; border-spacing: 2px; }
     .types-screen .tp-matrix th, .types-screen .tp-matrix td { width: 34px; min-width: 34px; height: 34px; padding: 0; text-align: center; vertical-align: middle; }
     .types-screen .tp-cell { border-radius: 6px; font-family: var(--font-display); font-weight: 700; font-size: 12px; white-space: nowrap; }
     .types-screen .tp-head { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 8px; }
     .types-screen .tp-head .ti { width: 24px; height: 24px; }
     .types-screen .tp-row-head, .types-screen .tp-corner { position: sticky; left: 0; z-index: 1; background: var(--surface); }
     /* destaque nao cromatico: linhas de duas cores (par do .chip.on) + anel no cabecalho */
     .types-screen .tp-matrix th.is-sel { background: var(--surface-2); }
     .types-screen .tp-matrix th.is-sel .tp-head { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text); }
     .types-screen .tp-matrix tr.is-sel > td { box-shadow: inset 0 2px 0 var(--text), inset 0 -2px 0 var(--text), inset 0 3px 0 var(--surface), inset 0 -3px 0 var(--surface); }
     .types-screen .tp-matrix td.is-col { box-shadow: inset 2px 0 0 var(--text), inset -2px 0 0 var(--text), inset 3px 0 0 var(--surface), inset -3px 0 0 var(--surface); }
     .types-screen .tp-matrix tr.is-sel > td.is-col { box-shadow: inset 0 0 0 2px var(--text), inset 0 0 0 3px var(--surface); }
     .types-screen .tp-head:focus-visible, .types-screen .tp-matrix-scroll:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }
     ```
- **Edge cases**: sem tipo -> nenhum `.is-sel`/`.is-col` (RF-19); clicar no cabecalho do tipo ja selecionado = no-op; clicar numa celula nao faz nada (sem handler); 1280: a tabela (686 px) cabe sem rolar; 390/360: so `.tp-matrix-scroll` rola, `th[scope=row]` e o canto ficam fixos e opacos; trocar idioma troca os `aria-label`; a celula x1 fica sem texto mas tem `aria-label` com "x1"; desempenho: `ROWS` calculado uma vez, matriz desmontada na visao "Por tipo"; a regiao rolavel e focavel (`tabIndex=0`) para rolar por teclado; erro/loading/offline/API N/A.
- **Consumes contract**: 5.2 (`selected`, `view`), 5.3 (`types.matrixCaption`, `types.rowHeader`, `types.colHeader`, `types.cellLabel`), 5.4 (`matrixRows`, `MULT_SYMBOL`, `CELL_SYMBOL` via `symbol`, tons incl. `neutral`, `selectType`), 5.5 (celulas Fogo x Planta, Agua x Fogo, Fogo x Normal).
- **Done when**: typecheck/lint limpos; capturas `after-f31-chart-empty-{classic,black}-desktop.png`, `after-f31-chart-fire-{classic,black}-desktop.png` (linha e coluna do Fogo destacadas; celula Agua x Fogo verde com "2"), `after-f31-chart-fire-grayscale-classic-desktop.png` (com `document.documentElement.style.filter = "grayscale(1)"`: destaque continua visivel), `after-f31-chart-fire-{classic,black}-phone.png` (scroll 0) e `after-f31-chart-fire-scrolled-classic-phone.png` (`scrollLeft = 200`: coluna fixa opaca sobre as celulas); comparar a tipografia das celulas e os tons com `detail-calc-grass-flying-*.png` (pilulas) e o painel com `detail-panel-weak-*.png`; no spec temporario: 324 `td`, `getByRole("cell", { name: "Fogo contra Planta: x2" })` com texto "2", clicar no cabecalho de coluna "Água defende (coluna)" deixa `[data-axis=col][data-type=water]` e `[data-axis=row][data-type=water]` com `aria-pressed="true"` e a pagina na tabela; `expectNoOverlap(".types-screen")` com `scrollLeft = 0` a 360/390/1280; `#main` sem conteudo passando da borda direita.
- **Commit**: `feat(types): tabela completa 18x18 com cabecalhos clicaveis e coluna fixa`
- **Rollback**: `git revert <hash>`.

### Sprint F4: Defesa com 2 tipos `[COULD]`

- **Descricao**: 2o tipo opcional so na aba Defendendo, 5 faixas (x4, x2, x1/2, x1/4, x0), dois icones no heroi, legenda com x4 e x1/4.
- **Deliverable**: Agua + Terra mostra Planta em x4 e Eletrico em x0 (5.5), com capturas.
- **Risco**: baixo (isolado; nada depende dele).
- **Prerequisito**: F2.3. Se o tempo nao couber (PRD 4.7: "entra se couber no mesmo sprint sem complicar a tela"), a feature e PULADA inteira: nenhuma chave `[COULD]` e criada, `second` fica sempre `null`, e T1 marca os casos `[COULD]` como `test.skip` com o motivo (nenhum outro teste depende deles).

#### Feature F4.1: Segundo tipo na defesa `[category: frontend]`
- **Traces**: RF-21 (x4, x1/4), RF-37, RF-38, RF-39, RNF-02, RNF-03; UISPEC 3.2b (linhas x4 e x1/4 da tabela de cor), 3.3 (`select` 14px/700), 3.4 (foco do `select`: `outline: 0` de base, `components.css:118`).
- **Files**:
  - `ROOT/src/i18n/messages/types-page.ts` (modificar: as 5 chaves `[COULD]` de 5.3 no fim do objeto, depois de `types.hint.fairy`)
  - `ROOT/src/screens/Types/types-model.ts` (modificar: `DEFEND_DUAL_SPEC` e o ramo de 2 tipos de `defendGroups`)
  - `ROOT/src/screens/Types/TypeFocus.tsx` (modificar: `second`, heroi com 2 icones na aba Defendendo, `SecondTypeSelect`)
  - `ROOT/src/screens/Types/TypesScreen.tsx` (modificar: 2 `li` na legenda depois de `types.legend0`)
  - `ROOT/src/screens/Types/types.css` (modificar: acrescentar o bloco abaixo)
- **Steps**:
  1. `types-page.ts`: `types.legend4`, `types.legendQuarter`, `types.def4`, `types.defQuarter`, `types.secondLabel` com os valores exatos de 5.3.
  2. `types-model.ts`: `DEFEND_DUAL_SPEC` = linhas `[COULD]` da tabela de grupos (4 `dis-strong` `types.def4`; 2 `dis` `types.def2`; 0.5 `adv` `types.defHalf`; 0.25 `adv-strong` `types.defQuarter`; 0 `zero` `types.def0`); `defendGroups(defenders)`: `defenders.length >= 2` -> `effectivenessAgainst([defenders[0], defenders[1]])` com `DEFEND_DUAL_SPEC`; senao o ramo de 1 tipo. Remover o comentario `// F4.1`.
  3. `TypeFocus.tsx`: imports adicionais `parseSecond` e `secondOptions` (`./types-model`); `const second = useScreenUi("types", "second"); const defenders: TypeId[] = tab === "defend" && second !== null ? [type, second] : [type];` ; heroi usa `heroTypes = defenders`; `groups = tab === "attack" ? attackGroups(type) : defendGroups(defenders)` (deps `[tab, type, second]`); na `.tp-tabs-row`, depois do `SegmentedControl`: `{tab === "defend" ? <SecondTypeSelect first={type} /> : null}` com
     ```tsx
     function SecondTypeSelect({ first }: { first: TypeId }) {
       const t = useT();
       const lang = usePreferencesStore((s) => s.uiLanguage);
       const { updateUi } = useNavigationActions();
       const second = useScreenUi("types", "second");
       return (
         <label className="tp-second">
           <span>{t("types.secondLabel")}</span>
           <select id="tp-second" value={second ?? ""} onChange={(e) => updateUi<"types">({ second: parseSecond(e.target.value, first) })}>
             <option value="">{t("types.none")}</option>
             {secondOptions(first).map((ty) => (
               <option key={ty} value={ty}>
                 {typeName(ty, lang)}
               </option>
             ))}
           </select>
         </label>
       );
     }
     ```
     A frase do heroi continua a do 1o tipo (RF-22). A matriz e a aba Atacando nao leem `second` (RF-37).
  4. `TypesScreen.tsx` (`TypesLegend`): depois de `<li>{t("types.legend0")}</li>`: `<li>{t("types.legend4")}</li>` e `<li>{t("types.legendQuarter")}</li>` (ordem da tabela do RF-21).
  5. `types.css` (acrescentar):
     ```css
     /* [COULD] defesa com 2 tipos: x4 e x1/4 (UISPEC 3.2b, origem .mult-4 e .mult-quarter) */
     .types-screen .tone-dis-strong { background: #FFD9D9; color: #A10F0F; }
     .types-screen .tone-adv-strong { background: #C9EED6; color: #0F5A2C; }
     .types-screen .tp-second { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 800; }
     .types-screen .tp-second select:focus-visible { outline: 2px solid var(--secondary); outline-offset: 2px; }
     ```
- **Edge cases** (validacao do `select`): opcoes = "nenhum" + 17 (sem o 1o tipo, ordem `TYPE_IDS`); "nenhum" -> `second: null` e volta a 3 faixas; valor desconhecido -> `null`; trocar o 1o tipo para o valor do 2o (grade ou cabecalho) limpa o 2o (`nextSelection`); trocar para Atacando esconde o `select` e o 2o icone mas GUARDA o `second` (volta ao reabrir Defendendo); Voltar restaura o `second` (esta no `ui`); `id` dos titulos continua unico (5 tons distintos); 360 px: `.tp-tabs-row` quebra linha sem sobrepor; erro/loading/offline/API N/A.
- **Consumes contract**: 5.2 (`second`), 5.3 (5 chaves `[COULD]`, `types.none`), 5.4 (`defendGroups` 2 tipos, `secondOptions`, `parseSecond`, `nextSelection`, tons `dis-strong`/`adv-strong`), 5.5 (Agua/Terra, Agua/Voador, Pedra/Aco, Planta/Aco).
- **Done when**: typecheck/lint limpos; `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts` verde; capturas `after-f41-water-ground-{classic,black}-{desktop,phone}.png` (5 faixas; Planta em "Muito fraco contra (recebe x4)", Eletrico em "Imune a (x0)"; dois icones no heroi; comparar tons x4/x1/4 com `detail-calc-grass-flying-*.png`), `after-f41-water-ground-attack-classic-desktop.png` (aba Atacando: 1 icone, sem `select`) e `after-f41-select-focus-classic-desktop.png` (foco por Tab no `select`: anel 2px); no spec temporario, Agua + Voador poe Eletrico em x4, e `expectNoOverlap(".types-screen")` a 360/390/1280 com o 2o tipo.
- **Commit**: `feat(types): defesa com dois tipos (x4 e x1/4) na aba Defendendo`
- **Rollback**: `git revert <hash>` (nada mais depende dela).

### Sprint F5: Fechamento

- **Descricao**: varredura de codigo morto com protocolo seguro.
- **Deliverable**: relatorio no checklist.
- **Risco**: baixo.
- **Prerequisito**: F1 a F4 (ou F4 pulada) completos.

#### Feature F5.1: Varredura de codigo morto (nada a remover) `[category: outro]`
- **Traces**: RNF-08, RNF-10; PRD secao 3 (nenhuma mudanca em telas existentes).
- **Files**: nenhum arquivo de codigo esperado; relatorio em `FEATURE_DIR/CHECKLIST_type-chart.md`.
- **Steps** (protocolo): esta feature NAO substitui nada (so acrescenta), entao o esperado e "nada a remover". Provar com:
  1. `git -C ROOT diff main...HEAD -- src | grep -E "^-[^-]"`: a UNICA linha removida em `src/` deve ser a antiga linha 3 de `nav-items.ts` (o import, reescrito com `Shapes`). Qualquer outra = investigar (mudanca fora do escopo).
  2. `git -C ROOT diff main...HEAD -- tests | grep -E "^-[^-]"`: so as 4 linhas de lista de 2.7 (`shell.test.tsx:114,147`, `shell.spec.ts:110,173`); PNGs aparecem como binarios.
  3. Chaves sem uso: para cada chave de `TYPES_PAGE_MESSAGES`, `git -C ROOT grep -n "\"<chave>\"" -- src ':!src/i18n'` nao vazio (as `types.hint.*` aparecem em `HINT_KEYS`; `nav.types*` em `nav-items.ts`); chave sem referencia = remover a chave (unico caso de remocao permitido).
  4. Exports sem uso no modulo novo: cada `export` de `types-model.ts`, `TypePicker.tsx`, `TypeFocus.tsx`, `TypeMatrix.tsx` referenciado por outro arquivo de `src/` ou (para os do modelo) pelos testes de T1; `toneOf` e `isTypeId` podem ser so internos + testes.
  5. Depois de qualquer remocao: `npm run typecheck`, `npm run lint`, `npx vitest run`, `npm run build` verdes.
- **Edge cases**: nao remover nada so "provavelmente sem uso"; nao tocar `EFFECT_LABEL`, `selectedTypes` nem `.mult-*` da ficha (continuam usados pela ficha); nao tocar codigo fora da feature.
- **Consumes contract**: nada.
- **Done when**: relatorio (passo, comando, saida, decisao) no checklist; suite + build verdes.
- **Commit**: `chore(types): varredura de codigo morto do type-chart` SO se algo foi removido; senao, sem commit (o relatorio vai no commit de checklist do orquestrador).
- **Rollback**: `git revert <hash>`.

---

### Sprint T1: Testes (definidos aqui, escritos na etapa de testes) e inventario do porte

- **Descricao**: unitarios do modelo e das frases, RTL da tela, e2e headless, regressao completa contra a linha de base, e o inventario do porte.
- **Deliverable**: suite verde nos limites de cobertura; e2e headless verde; inventario do porte no STATE.
- **Risco**: medio.
- **Prerequisito**: F1 a F5 completos (T1.1 pode ser escrito logo depois de F2.1).
- **Regras**: Vitest 3 (`tests/unit/**`, nomes de `it` em ingles, `// @vitest-environment node` nos testes sem DOM) + Testing Library + Playwright 1.63 (headless, sem slowMo, sem sleep). Todo esperado de grupo, matriz e defesa dupla e DERIVADO de `TYPE_CHART` dentro do teste (LESSONS 2026-09-29 e 2026-10-12), por um caminho independente do modelo (as listas `TYPE_CHART[X][m]` para Atacando e `TYPE_CHART[A][m].includes(X)` para Defendendo; produto manual para 2 tipos); as unicas constantes literais permitidas sao as do proprio requisito (textos exatos do PRD/5.3, exemplos nomeados do PRD RF-39..RF-44 e RF-46, hex da tabela 5.4). Nenhum teste existente removido ou afrouxado. Casos `[COULD]` marcados com `[COULD]` no titulo; se F4.1 foi pulada, ficam `test.skip`/`it.skip` com o motivo.

#### Feature T1.1: Modelo puro, frases de intuicao e i18n (unitarios) `[category: outro]`
- **Traces**: RF-12, RF-15, RF-16, RF-17, RF-18, RF-21, RF-23, RF-24, RF-25, RF-27, RF-30, RF-31, RF-32, RF-34, RF-37, RF-38, RF-39, RF-40, RF-41, RF-42, RF-43, RF-44, RF-46, RF-49, RNF-01, RNF-06; CA-11, CA-12, CA-13, CA-14, CA-15, CA-18, CA-19, CA-20, CA-21, CA-23, CA-25, CA-27, CA-29, CA-40, CA-41, CA-47, CA-50.
- **Files**: `ROOT/tests/unit/ui-screens/types-model.test.ts` (criar, `// @vitest-environment node`); `ROOT/tests/unit/ui-screens/types-hints.test.ts` (criar, `// @vitest-environment node`)
- **Steps** (`types-model.test.ts`):
  1. Para os 18 tipos: `attackGroups(X)` = 3 grupos `[2, 0.5, 0]`, tons `[adv, dis, zero]`, titulos `[types.atk2, types.atkHalf, types.atk0]`, `types` = `TYPE_IDS.filter((d) => TYPE_CHART[X][m].includes(d))` (CA-11); `defendGroups([X])` = `[2, 0.5, 0]`, tons `[dis, adv, zero]`, titulos `[types.def2, types.defHalf, types.def0]`, `types` = `TYPE_IDS.filter((a) => TYPE_CHART[a][m].includes(X))`; nenhum tipo x1 em grupo algum; uniao dos 3 grupos + os x1 = os 18 sem repeticao.
  2. Grupos vazios presentes (RF-18, CA-14): `attackGroups("normal")[0].types` = `[]` e `defendGroups(["normal"])[1].types` = `[]`; total de grupos vazios nos 108 = contagem derivada de `TYPE_CHART` no teste.
  3. Exemplos nomeados do PRD (CA-12, CA-13, CA-47): Fogo, Normal, Eletrico, Fantasma e Aco iguais as listas de 5.5 (constantes do requisito), com os tons de RF-46.
  4. `matrixRows()`: 18 linhas e 18 celulas na ordem `TYPE_IDS`; para cada celula, `multiplier` = 2/0.5/0 se o defensor esta na lista correspondente de `TYPE_CHART[atacante]`, senao 1; `symbol` = `"2"`/`"1/2"`/`"0"`/`""`; `tone` = `adv`/`dis`/`zero`/`neutral`; contagens de cada tom = soma dos tamanhos das listas de `TYPE_CHART` (CA-23); `MULT_SYMBOL` e `CELL_SYMBOL` exatos.
  5. RF-30 (CA-25): para os 18 X, os x2 da linha de X = `attackGroups(X)[0].types`; para m em 2/0.5/0, os atacantes da coluna de X com m = grupo m de `defendGroups([X])`.
  6. Selecao: as 5 linhas da tabela de `nextSelection` (5.4); `secondOptions(X)` = 17 sem X na ordem canonica para os 18 X (CA-41); `parseSecond` com `""`, valor valido, igual ao 1o e lixo; `isTypeId`. Estado inicial (CA-29): `defaultUi("types")` = `{ view: "byType", selected: null, tab: "attack", second: null }`.
  7. `[COULD]` Defesa dupla (CA-40): para TODOS os 306 pares ordenados de tipos distintos, `defendGroups([a, b])` = 5 grupos `[4, 2, 0.5, 0.25, 0]` com tons `[dis-strong, dis, adv, adv-strong, zero]` e `types` = atacantes cujo produto `m(a) * m(b)` (com `m` derivado das listas de `TYPE_CHART`) e o do grupo; exemplos RF-39 (Agua/Terra x Planta = 4, Agua/Voador x Eletrico = 4, Agua/Terra x Eletrico = 0, Pedra/Aco x Normal = 0.25, Planta/Aco x Fogo = 4).
  8. Isolamento da pagina (RF-31, RF-32, CA-27): ler com `fs` cada arquivo de `src/screens/Types/` e conferir: nenhum match de `/screens\/Detail|TypeCalculator|WeaknessPanel|EFFECT_LABEL|selectedTypes|TermsToggle|useTermsLanguage|termsLanguage|termsOverrides|EmptyState/`; no CSS, nenhum `.mult-`, `.weak-`, `.tc-cell`, `.type-calc`; todo `from "..."` dos `.ts/.tsx` pertence a: `react`, `./*`, `../../components/{ScreenRouter,SegmentedControl,TypeIcon,TypeChip,Icon}`, `../../data/types`, `../../domain/type-chart`, `../../i18n/{useT,messages}`, `../../navigation/{types,useNavigation,navigation-store}`, `../../state/preferences-store`; o modulo `src/i18n/messages/types-page.ts` so importa `./types`.
  9. Fonte unica (RNF-01): o texto de `src/screens/Types/types-model.ts` nao contem nenhuma lista literal de tipos alem de `HINT_KEYS` (regex: nenhum array literal com 2+ strings de `TYPE_IDS`).
- **Steps** (`types-hints.test.ts`):
  1. Dado de teste `HINT_RELATIONS: Record<TypeId, [TypeId, TypeId, 0 | 2][]>` com as 49 relacoes da coluna "Relacoes citadas" do PRD RF-23 (normal: `[["normal","ghost",0],["fighting","normal",2]]`, ...); cada uma = `singleMultiplier(a, d)` (CA-20: alterar o dominio derruba o teste); total = 49; chaves = os 18 `TYPE_IDS`.
  2. `HINT_KEYS` cobre exatamente os 18 tipos; cada `MESSAGES[HINT_KEYS[X]]` = texto exato PT e EN da tabela 5.3 (dado de teste); cada frase tem no maximo 12 palavras (`split(/\s+/)`) (CA-19).
  3. Textos exatos (CA-18, CA-21, CA-50): as 45 chaves de F1.1 (e as 5 `[COULD]`) existem em `MESSAGES` com PT e EN = 5.3; nenhum valor de `TYPES_PAGE_MESSAGES` contem U+2014; `MESSAGE_MODULES.types` e o objeto do modulo.
- **Edge cases**: grupos vazios e ordem canonica cobertos para os 18 tipos; os 306 pares de defesa dupla rodam em < 1 s (sem medir tempo: nada de assert de tempo absoluto em unitario, LESSONS 2026-10-12); se F4.1 foi pulada, os casos `[COULD]` ficam `it.skip` com o motivo; leitura de arquivos com caminho a partir de `process.cwd()` (ROOT).
- **Consumes contract**: 5.1 (dominio), 5.3 (chaves e textos exatos), 5.4 (API do modelo, tabela de grupos, `nextSelection`), 5.5 (exemplos nomeados).
- **Done when**: `npx vitest run tests/unit/ui-screens/types-model.test.ts tests/unit/ui-screens/types-hints.test.ts` verde.
- **Commit**: `test(types): modelo da pagina Tipos, frases de intuicao e textos`
- **Rollback**: `git revert <hash>`.

#### Feature T1.2: Tela com Testing Library `[category: outro]`
- **Traces**: RF-07, RF-11, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-22, RF-25, RF-26, RF-27, RF-28, RF-32, RF-34, RF-35, RF-37, RF-38, RF-47, RF-48, RNF-02, RNF-03, RNF-06; CA-08, CA-09, CA-10, CA-11, CA-13, CA-14, CA-15, CA-16, CA-17, CA-18, CA-19, CA-22, CA-23, CA-24, CA-29, CA-32, CA-39, CA-41, CA-48, CA-49.
- **Files**: `ROOT/tests/unit/ui-screens/types-screen.test.tsx` (criar; padrao de stores de `tests/unit/ui-screens/compare-screen.test.tsx`, sem mock de loaders: a tela nao usa dataset)
- **Steps**:
  1. Setup: `resetNavigationStore()`, `resetPreferencesStore()`, `useNavigationStore.setState({ current: { id: 99, screen: "types", params: {}, ui: defaultUi("types"), scroll: 0 }, stack: [] })`, `render(<TypesScreen entryId={99} params={{}} />)`; textos esperados por `translate("pt" | "en", chave)`.
  2. Inicial (CA-08, CA-29): `.tp-view` com "Por tipo" `aria-pressed="true"`; 18 `.tp-pick` com os nomes PT na ordem `TYPE_IDS`, nenhum pressionado; `.tp-instr` = "Escolha um tipo"; sem `.tp-hero`, `.tp-tab`, `.tp-band`, `table.tp-matrix`.
  3. Fogo (CA-09, CA-15, CA-19): clicar `[data-pick=fire]` -> so ele `aria-pressed="true"`; `.tp-hero[data-hero=fire] h3` = "Fogo"; `.tp-hint` = `types.hint.fire`; aba "Atacando" pressionada; 3 `.tp-band` com titulos e `data-tone` `adv,dis,zero`; cada faixa so contem titulo + nomes (ou "nenhum"); `.tp-instr` some.
  4. No-op e historico (RF-12, CA-32): guardar `const before = useNavigationStore.getState().current`; clicar Fogo de novo -> `getState().current` e o MESMO objeto (`toBe`); depois de 5 escolhas e 4 trocas de aba, `stack.length` e `current.id` inalterados.
  5. Abas e 18 tipos (CA-10, CA-11, CA-13, CA-14): para cada X de `TYPE_IDS`: escolher X, conferir os `data-type` de cada faixa de Atacando com a derivacao de `TYPE_CHART` (T1.1 passo 1), trocar para "Defendendo" (titulos `types.def2/defHalf/def0`, tons `dis,adv,zero`, listas derivadas, "nenhum" onde vazio), voltar a "Atacando"; o tipo selecionado nunca muda ao trocar de aba.
  6. Idioma e termos (CA-16, CA-17): com Fogo + Defendendo, `act(() => usePreferencesStore.setState({ uiLanguage: "en" }))` -> "Fire", "Weak to (takes x2)", legenda EN, frase EN, mesma selecao e aba; com `uiLanguage: "pt"`, `termsLanguage: "en"` e `termsOverrides: { calc: "en", weak: "en" }` -> nomes em PT; nenhum `.terms-tgl` na tela.
  7. Legenda (CA-18): as 3 linhas e as 2 frases = dicionario, nas duas visoes; nenhum `li` da `.tp-legend-list` tem classe `tone-*`.
  8. Matriz (CA-22, CA-23, CA-24, CA-48, CA-49): com Fogo selecionado, clicar "Tabela completa" -> sem `.tp-grid` e `.tp-bands`; 18 `th[scope=col]` e 18 `th[scope=row]` na ordem `TYPE_IDS` com `aria-label` "<Tipo> defende (coluna)"/"<Tipo> ataca (linha)"; 324 `td.tp-cell` com texto e `aria-label` derivados (ex. `[data-row=fire] [data-def=grass]` = "2" e "Fogo contra Planta: x2"; `[data-row=fire] [data-def=normal]` = "" e "Fogo contra Normal: x1"); `tr[data-row=fire].is-sel` e os 18 `td.is-col[data-def=fire]`; dois cabecalhos com `aria-pressed="true"`; clicar no `button[data-axis=col][data-type=water]` -> `ui.selected = "water"`, `ui.view = "chart"`, destaque movido; clicar num `td` nao muda nada; voltar a "Por tipo" -> `[data-pick=water]` pressionado. Sem tipo (estado novo) -> nenhum `.is-sel`/`.is-col`.
  9. `[COULD]` 2o tipo (CA-39, CA-41): Agua + Defendendo: `#tp-second` com `""` + 17 opcoes sem `water` (rotulos PT); escolher `ground` -> 5 faixas, `grass` no `data-mult="4"`, `electric` no `data-mult="0"`, heroi com 2 `.tp-ti-xl` e "Água / Terra"; `flying` -> `electric` em x4; `""` -> 3 faixas; "Atacando" -> sem `#tp-second`, 1 icone; voltar a "Defendendo" -> `ground` restaurado; escolher Terra na grade com 2o = Terra -> `ui.second = null`.
- **Edge cases**: sem mock de loaders (a tela nao usa dataset); `act()` em toda mudanca de store; idioma restaurado no `beforeEach` por `resetPreferencesStore()`; casos `[COULD]` com `it.skip` se F4.1 foi pulada; nenhum timer.
- **Consumes contract**: 5.2 (`UiStateMap.types`, `defaultUi`), 5.3 (textos por `translate`), 5.4 (derivacao de referencia, `MULT_SYMBOL`), 5.5 (celulas exemplo).
- **Done when**: `npx vitest run tests/unit/ui-screens/types-screen.test.tsx` verde; `npx vitest run --coverage` com `src/screens/**` >= 70/70 e global >= 80/80 (`vitest.config.ts`).
- **Commit**: `test(types): tela Tipos com Testing Library (selecao, abas, matriz, idioma)`
- **Rollback**: `git revert <hash>`.

#### Feature T1.3: e2e headless da pagina `[category: outro]`
- **Traces**: RF-01..RF-08, RF-11, RF-12, RF-17, RF-20, RF-26..RF-29, RF-35, RF-36, RF-45, RF-46, RF-48, RF-49, RNF-02, RNF-03, RNF-04, RNF-05, RNF-07; CA-01, CA-02, CA-03, CA-04, CA-05, CA-12, CA-24, CA-26, CA-30, CA-31, CA-32, CA-33, CA-34, CA-35, CA-36, CA-37, CA-38, CA-42, CA-47, CA-49, CA-50.
- **Files**: `ROOT/tests/e2e/types.spec.ts` (criar). Helpers copiados de `tests/e2e/compare.spec.ts` (`trackConsoleErrors` l.7-14, `boot` l.16-22, `setLanguage` l.53-57, `settle` l.60-68) e de `tests/e2e/responsive.spec.ts` (`go` l.36-43 estendido para `"types"`, `setTheme` l.76-86 + `writeDoc` de `./idb-helpers`). Esperados: `TYPE_IDS`, `TYPE_CHART`, `singleMultiplier` de `../../src/domain/type-chart` (precedente `shell.spec.ts:5`), `MESSAGES` de `../../src/i18n/messages` e `TYPE_NAMES` de `../../src/i18n/types` (modulos puros), com um `msg(key, lang, vars?)` local.
- **Steps**:
  1. Sidebar (CA-01, CA-03, CA-04): 1280 x 800, `.sidebar .nav-item` = os 10 rotulos PT na ordem; em EN o 5o e "Types"; clicar "Tipos" -> `.types-screen` visivel, `.sidebar .nav-item.active` = "Tipos" com `aria-current="page"`; o `svg` de `[data-nav=types]` tem a classe `lucide-shapes` e nenhum outro item a tem.
  2. Phone (CA-02, CA-03, CA-50): 390 x 844, tabbar = 5 rotulos de hoje; abrir "Mais": 1o `.sheet-item-label` = "Tipos" e seu `.sheet-item-sub` = "Quem vence quem" (EN "Who beats whom"); clicar -> `.types-screen`, `.tabbar .tab-more` com classe `active`.
  3. Voltar/avancar (CA-05, CA-31): phone; Fogo + "Defendendo"; `#main.scrollTop = 400` (ou o maximo, se menor; anotar o valor); clicar Pokedex (`[data-nav=dex]`); `page.goBack()` -> Fogo pressionado, "Defendendo" pressionado, `expect.poll(scrollTop)` a 2 px do salvo; sem `page.goForward()` (o app trata todo popstate como Voltar, history-bridge.ts; PRD rev 5.3, CA-31): o teste termina no Voltar; o caminho de `page.url()` nao muda em nenhum passo.
  4. Descarte (CA-30, CA-33): Fogo + "Defendendo", clicar Pokedex e depois "Tipos" -> nenhum `.tp-pick[aria-pressed=true]`, `.tp-instr` visivel; escolher Fogo -> "Atacando" pressionada; `page.reload()` + abrir "Tipos" -> estado inicial.
  5. Historico (CA-32): `history.length` igual antes e depois de 6 escolhas, 4 trocas de aba e 2 trocas de visao.
  6. Faixas e cores (CA-12, CA-47, CA-36): Fogo: listas de `data-type` por faixa = derivadas; `backgroundColor` das faixas `rgb(225, 245, 231)` (adv), `rgb(255, 233, 214)` (dis), `rgb(230, 231, 236)` (zero) conforme RF-46 nas duas abas; para os 7 temas (`setTheme` + reload): contraste WCAG (calculado no teste a partir de `getComputedStyle`) do `h4` e do `.tp-band-name` contra o fundo da faixa >= 4,5:1, do texto da legenda contra o `.panel` >= 4,5:1, e as celulas `adv/dis/zero` da matriz com as mesmas cores em todo tema.
  7. Escala de cinza (CA-37, CA-24): `html.style.filter = "grayscale(1)"`; cada `h4` de faixa contem o simbolo "(x2)"/"(x1/2)"/"(x0)"; cada `td` nao neutro tem texto "2"/"1/2"/"0"; com Fogo, `box-shadow` computado de `tr[data-row=fire] > td` e de `td.is-col` diferente de `none`, e de uma celula fora da linha/coluna = `none`; ao escolher Agua pelo cabecalho, o destaque muda.
  8. Matriz (CA-49, RF-26): `getByRole("cell", { name: "Fogo contra Planta: x2" })` com texto "2"; EN `"Fire against Grass: x2"`; `getByRole("button", { name: "Água defende (coluna)" })` -> Agua selecionada, continua na tabela; clicar numa celula nao muda nada.
  9. Phone e coluna fixa (CA-26, RNF-05): 390 x 844 e 360 x 800, "Tabela completa": `.tp-matrix-scroll` com `scrollWidth > clientWidth`; `.types-screen` e `.tp-matrix-scroll` com `getBoundingClientRect().right <= #main.getBoundingClientRect().right + 1`; `document.documentElement.scrollWidth <= innerWidth`; `scrollLeft = 200` -> `th[scope=row]` da 1a linha com `left` igual ao `left` do container (+/- 1 px, descontado o padding 4 px) e `backgroundColor` com alfa 1; `document.elementFromPoint` no centro desse `th` devolve o `th` ou um descendente (nunca um `td`).
  10. Sem sobreposicao (CA-38): para 360, 390 e 1280 x PT e EN x estados {sem tipo, Fogo Atacando, Fogo Defendendo, tabela sem tipo, tabela com Fogo (scroll 0)} e, `[COULD]`, Agua/Terra: `settle` + `expectNoOverlap(page, ".types-screen")`.
  11. Teclado e foco (CA-34, CA-35): so teclado (`page.keyboard.press`), comecando com `focus()` no 1o botao de `.tp-view` (nenhum clique depois disso): Tab ate o botao "Tabela completa" do seletor de visao (Enter troca), Tab ate um cabecalho (Enter seleciona), Tab de volta ao seletor e "Por tipo", Tab ate `[data-pick=fire]` (Space seleciona), Tab ate "Defendendo" (Enter), e `[COULD]` Tab ate `#tp-second` (ArrowDown escolhe, e de volta "nenhum"); em CADA parada, o elemento focado tem `:focus-visible` com `outlineStyle` diferente de `none` e `outlineWidth` "2px"; loop de Tab limitado a 80 teclas (falha se nao achar); `aria-pressed="true"` no tipo, na visao e na aba ativos.
  12. Erros de console (CA-42): `trackConsoleErrors` vazio em todos os testes.
  13. Desempenho (RNF-07): `PerformanceObserver` de `longtask` (padrao `perf.spec.ts`); trocar para "Tabela completa", escolher 3 tipos pelos cabecalhos, voltar a "Por tipo", escolher 3 tipos: toda long task <= 200 ms; na visao "Por tipo" `table.tp-matrix` tem contagem 0.
- **Edge cases**: roda em dev (`PW_DEV=1`) e em build + preview; tema trocado por `writeDoc` + reload (nunca por `/src` em `page.evaluate`); `#main` pode ter rolagem maxima menor que 400 px (usar o maximo e anotar); `serviceWorkers: "block"` padrao do config; sem `waitForTimeout`; casos `[COULD]` com `test.skip` se F4.1 foi pulada.
- **Consumes contract**: 5.2 (estado observado pelo comportamento), 5.3 (textos exatos e nomes acessiveis), 5.4 (tons e hex da tabela tom -> hex, `MULT_SYMBOL`), 5.5 (Fogo, Agua x Fogo, Agua/Terra).
- **Done when**: `PW_DEV=1 PW_PORT=4183 npx playwright test tests/e2e/types.spec.ts` verde e `npx playwright test tests/e2e/types.spec.ts` (build + preview) verde.
- **Commit**: `test(e2e): pagina Tipos (navegacao, faixas, matriz, temas, teclado e sobreposicao)`
- **Rollback**: `git revert <hash>`.

#### Feature T1.4: Regressao completa contra a linha de base `[category: outro]`
- **Traces**: RF-09, RF-10, RNF-01, RNF-08, RNF-09, RNF-10, RNF-11; CA-06, CA-07, CA-42, CA-43, CA-44, CA-45, CA-46.
- **Files**: nenhum arquivo de codigo; numeros no `FEATURE_DIR/STATE_type-chart.md`.
- **Steps**:
  1. RNF-08: `npm run typecheck` e `npm run lint` limpos.
  2. RNF-09: `npx vitest run --coverage`: arquivos/testes >= S0.1 + os novos; limites do `vitest.config.ts` respeitados.
  3. RNF-10/CA-45/CA-06/CA-07: `npm run build` e `npx playwright test` inteiro (build + preview): so as falhas/flakes ja registradas em S0.1 podem falhar; qualquer outra = regressao (corrigir a causa no codigo da feature, nunca o teste). Inclui inalterados: `detail.spec.ts` (calculadora e fraquezas), `dex.spec.ts`, `captured.spec.ts`, `compare.spec.ts`, `home.spec.ts`, `navigation.spec.ts`, `responsive.spec.ts` (14 baselines de F1.3), `shell.spec.ts`.
  4. CA-06: `git -C ROOT diff main -- tests/unit/ui-shell tests/e2e/shell.spec.ts` mostra so as 4 linhas de 2.7 (listas completas, nenhuma contagem nova, nenhum assert removido).
  5. CA-43/RNF-01: `git -C ROOT diff main -- package.json package-lock.json src/domain/type-chart.ts src/screens/Detail/TypeCalculator.tsx vite.config.ts` vazio; soma de `dist/assets/*.js` + `*.css` comparada com S0.1 (diferenca registrada; esperado < 30 KB cru).
  6. CA-46/RNF-11: `git -C ROOT grep -nIE "(api[_-]?key|token|secret|password)\s*[:=]" -- src/screens/Types src/i18n/messages/types-page.ts tests/e2e/types.spec.ts tests/unit/ui-screens/types-*` vazio; `git -C ROOT grep -n "fetch(" -- src/screens/Types` vazio.
  7. CA-44: `git -C ROOT grep -nP "\x{2014}" -- src tests .forge/ideas/type-chart` vazio.
- **Edge cases**: falhas/flakes ja registrados em S0.1 nao contam como regressao (com evidencia); `bait.test.ts:106` (flake de tempo conhecido) fica como esta; porta 4173 ocupada = liberar e repetir.
- **Consumes contract**: nada (verificacao).
- **Done when**: os 7 passos verdes e os numeros (testes, cobertura, bytes) no STATE.
- **Commit**: `docs(forge): regressao completa do type-chart` (so STATE; sem codigo).
- **Rollback**: n/a.

#### Feature T1.5: Porte: inventario `[category: outro]`
- **Traces**: RF-31, RF-32, RF-33; CA-27, CA-28.
- **Files**: `FEATURE_DIR/STATE_type-chart.md` (modificar: secao "Porte para o pontindex"); nenhum codigo. Esta feature NAO faz o porte (feature propria no `pontindex`, depois da `pontindex-base`).
- **Steps**:
  1. Conferir que `git -C ROOT diff --name-status main...HEAD -- src tests` e EXATAMENTE a uniao das listas abaixo (nada a mais, nada a menos); divergencia = corrigir a lista ou o codigo e registrar.
  2. Escrever no STATE o inventario:
     - **Copiar tal qual** (arquivos da pagina, 7): `src/screens/Types/TypesScreen.tsx`, `src/screens/Types/TypePicker.tsx`, `src/screens/Types/TypeFocus.tsx`, `src/screens/Types/TypeMatrix.tsx`, `src/screens/Types/types-model.ts`, `src/screens/Types/types.css`, `src/i18n/messages/types-page.ts`.
     - **Copiar os testes** (4): `tests/unit/ui-screens/types-model.test.ts`, `tests/unit/ui-screens/types-hints.test.ts`, `tests/unit/ui-screens/types-screen.test.tsx`, `tests/e2e/types.spec.ts`.
     - **Repetir as edicoes de registro** (2 pontos de toque fora da pasta): (a) navegacao: `src/components/nav-items.ts` (item depois de `compare` + import `Shapes`) e `src/components/Icon.tsx` (reexport `Shapes`); (b) registro: `src/navigation/types.ts` (as 6 insercoes de 5.2), `src/screens/registry.ts` (import + entrada) e `src/i18n/messages.ts` (import + `MESSAGE_MODULES.types` + spread).
     - **Ajustar no repo destino** (nao copiar): as listas de rotulos dos testes de shell de la e as baselines visuais de la (protocolo de F1.3).
     - **Pre-condicoes a conferir por hash no `pontindex` antes de copiar** (UISPEC secao 0: o CSS de la ja diverge): `src/domain/type-chart.ts`, `src/components/{TypeChip,TypeIcon,SegmentedControl}.tsx`, `src/i18n/{useT,types}.ts`, `src/navigation/{navigation-store,useNavigation,types}.ts`, `src/state/preferences-store.ts` (`uiLanguage`), e em `src/styles/components.css` as regras `.chip`, `.chip-check`, `.ti`, `.seg`, `.panel`, `.panel h3`, `select`; diferenca = avaliar antes de copiar (a pagina nao pode mudar de comportamento).
     - **Nao copiar**: nada de `TermsToggle`/`useTermsLanguage` (a pagina nao usa, RF-32).
- **Edge cases**: `--name-status` lista `A` para os 11 arquivos novos e `M` para os 7 modificados (+14 PNGs); se F4.1 foi pulada a lista de arquivos nao muda (so o conteudo); qualquer arquivo extra (ex. spec temporario `zz-type-chart-capture.spec.ts` esquecido) = remover antes de fechar.
- **Consumes contract**: 5.2 (insercoes a repetir), 5.3 (modulo i18n a copiar).
- **Done when**: inventario no STATE e o passo 1 batendo.
- **Commit**: `docs(forge): inventario do porte da pagina Tipos para o pontindex`
- **Rollback**: `git revert <hash>`.

---

## 8. Matriz de cobertura do PRD

| RF/RNF | Sprint.Feature | Como e satisfeito |
|---|---|---|
| RF-01 | F1.1, F1.2, T1.3 | `nav.types` + item `types` em `SIDEBAR_ITEMS`; abre `TypesScreen` |
| RF-02 | F1.2, T1.3 | Item depois de `compare` (5o de 10); listas do shell atualizadas |
| RF-03 | F1.2, T1.3 | Fora de `TAB_SCREENS`: 1o de `MORE_ITEMS` na folha "Mais" |
| RF-04 | F1.2, T1.3 | `Shapes` reexportado em `Icon.tsx` (fallback `Layers`) |
| RF-05 | F1.2, T1.3 | `navOwner("types")` = `types`: sidebar `.active`; `TabBar` acende "Mais" |
| RF-06 | F1.2, T1.3 | Entrada da pilha + `history.pushState`; sem rota por URL |
| RF-07 | F1.2, T1.2, T1.3 | `go("types")` de outra tela -> `createEntry` com `defaultUi` |
| RF-08 | F1.2, T1.3, T1.4 | So insercao no `SIDEBAR_ITEMS`; `TAB_SCREENS`/`navOwner` intocados; tabbar inalterada |
| RF-09 | F1.2, T1.4 | 4 listas atualizadas completas (2.7); paridade l.66 com a entrada nova |
| RF-10 | F1.3, T1.4 | 14 baselines regeneradas com diff por pixel so na sidebar; tolerancia intocada |
| RF-11 | F2.2, T1.2, T1.3 | `TypePicker`: 18 chips-botao em `flex-wrap` com anel + check |
| RF-12 | F2.1, F2.2, T1.1, T1.2, T1.3 | `selectType`/`nextSelection` (no-op no re-toque); `updateUi` sem historico |
| RF-13 | F2.2, T1.2 | Bloco heroi `.tp-hero` com icone 64 px, nome e frase, acima das abas |
| RF-14 | F2.3, T1.2 | `SegmentedControl` "Atacando/Defendendo", padrao `attack` |
| RF-15 | F1.1, F2.1, F2.3, T1.1, T1.2 | 3 grupos fixos com os titulos exatos de 5.3 |
| RF-16 | F2.1, F2.3, T1.1, T1.2 | Filtros por `singleMultiplier`/`effectivenessAgainst`; x1 nunca aparece |
| RF-17 | F2.2, F2.3, T1.2, T1.3 | Tons por aba (tabela de grupos) e hex de 5.4 em `types.css` |
| RF-18 | F2.1, F2.3, T1.1, T1.2 | Grupo vazio com `p.tp-none` "nenhum" |
| RF-19 | F2.2, F3.1, T1.2 | Sem tipo: grade + `.tp-instr`; matriz sem `.is-sel` |
| RF-20 | F2.2, T1.2, T1.3 | `typeName(t, uiLanguage)` e `t()` reativos ao idioma |
| RF-21 | F1.1, F2.2, F4.1, T1.1, T1.2 | `TypesLegend` fixa acima do seletor: 3 (+2) linhas sem cor + 2 frases de cor |
| RF-22 | F2.2, T1.2 | `.tp-hint` com `HINT_KEYS[type]` no heroi, nas duas abas |
| RF-23 | F1.1, T1.1 | 18 frases exatas em `types-page.ts` |
| RF-24 | T1.1 | `HINT_RELATIONS` (49) contra `singleMultiplier`; completude PT/EN |
| RF-25 | F2.1, F3.1, T1.1, T1.2 | `matrixRows()` 18 x 18 na ordem `TYPE_IDS` |
| RF-26 | F1.1, F3.1, T1.2, T1.3 | Cabecalhos com `TypeIcon` + `aria-label`; legenda da matriz `#tp-matrix-cap` |
| RF-27 | F2.1, F3.1, T1.1, T1.2, T1.3 | `CELL_SYMBOL`, tom pela otica de quem ataca, `aria-label` com `MULT_SYMBOL` |
| RF-28 | F3.1, T1.2, T1.3 | `tr.is-sel`, `td.is-col`, anel no `th.is-sel`, `aria-pressed` |
| RF-29 | F3.1, T1.3 | `.tp-matrix-scroll` `overflow-x: auto`; `th[scope=row]` sticky opaco |
| RF-30 | F2.1, T1.1 | Mesma derivacao do dominio; teste cruza linha/coluna com as faixas |
| RF-31 | F2.1, F2.2, F3.1, T1.1, T1.5 | Imports restritos (lista do T1.1 passo 8); CSS proprio |
| RF-32 | F2.2, T1.1, T1.2 | `usePreferencesStore(uiLanguage)`; sem `TermsToggle`/`useTermsLanguage` |
| RF-33 | F1.1, T1.5 | Pasta + modulo i18n copiaveis; inventario com os 2 pontos de toque |
| RF-34 | F1.2, T1.1, T1.2 | `UiStateMap.types` e `defaultUi` (5.2) |
| RF-35 | F1.2, T1.2, T1.3 | `updateUi` sem historico; entrada nova pelo nav; `goBack` restaura `ui` e scroll |
| RF-36 | F1.2, T1.3 | Estado so na pilha em memoria; reload = inicial |
| RF-37 | F4.1, T1.1, T1.2 | `SecondTypeSelect` so em Defendendo; 5 grupos; heroi com 2 icones nessa aba |
| RF-38 | F2.1, F4.1, T1.1, T1.2 | `secondOptions`, `parseSecond`, `nextSelection` limpa o 2o |
| RF-39 | F4.1, T1.1 | Exemplos de 5.5 conferidos; derivacao dos 306 pares |
| RF-40 | F2.3, T1.1, T1.2 | Fogo (5.5) |
| RF-41 | F2.3, T1.1, T1.2 | Normal (5.5) |
| RF-42 | F2.3, T1.1, T1.2 | Eletrico (5.5) |
| RF-43 | F2.3, T1.1, T1.2 | Fantasma (5.5) |
| RF-44 | F2.3, T1.1, T1.2 | Aco (5.5) |
| RF-45 | T1.1, T1.2, T1.3 | Unitarios, RTL e e2e derivando de `TYPE_CHART` |
| RF-46 | F2.3, F3.1, T1.1, T1.3 | Tons por aba e otica de quem ataca (Agua x Fogo verde) |
| RF-47 | F2.2, F3.1, T1.2, T1.3 | `SegmentedControl` de visao; `selected` compartilhado |
| RF-48 | F3.1, T1.2, T1.3 | 36 `button.tp-head` com `selectType`; `td` sem handler |
| RF-49 | F1.1, F1.2, T1.3 | `nav.typesSub` como `subKey` (aparece na folha "Mais") |
| RNF-01 | F2.1, T1.1, T1.4 | Sem dependencia; dominio intocado; sem lista duplicada |
| RNF-02 | F2.2, F2.3, F3.1, T1.3 | Simbolo no titulo/celula; destaque por linhas; amostras + texto na legenda |
| RNF-03 | F2.2, F3.1, F4.1, T1.2, T1.3 | `button`/`select` nativos, `aria-pressed`, `aria-label`, `:focus-visible` 2px |
| RNF-04 | F2.2, F2.3, F3.1, T1.3 | Tons fixos com texto proprio; tokens; contraste medido nos 7 temas |
| RNF-05 | F2.2, F2.3, F3.1, T1.3 | `expectNoOverlap` 360/390/1280 PT/EN; so a matriz rola |
| RNF-06 | F1.1, T1.1 | Modulo proprio registrado; teste de completude e de texto exato |
| RNF-07 | F3.1, T1.3 | Matriz so na visao "Tabela completa"; `ROWS` uma vez; long task <= 200 ms |
| RNF-08 | Todas, T1.4 | typecheck e lint limpos; sem U+2014 |
| RNF-09 | T1.1, T1.2, T1.4 | Limites v8 (`src/screens/**` 70/70, global 80/80) |
| RNF-10 | S0.1, F1.2, F1.3, F5.1, T1.4 | Linha de base; so os asserts de 2.7 e as 14 baselines mudam |
| RNF-11 | 5b, T1.4 | Sem segredo, sem rede, sem servico |

Total: 49 RF + 11 RNF = 60 requisitos; 60 cobertos; 0 orfaos (conferido extraindo `RF-\d+`/`RNF-\d+` do PRD e desta tabela). CA-01..CA-50 citados em T1.1 a T1.5 (e CA-06/CA-07 tambem em F1.2/F1.3).

## 9. Assuncoes e perguntas em aberto

Assuncoes (modo autonomo, revisaveis pelo Pontin):
1. **A1 "não afeta" com acento** na frase da tabela (`types.legendTable`): alinhado com o PRD rev 5.2 (RF-21, CA-18 ja trazem "cinza = não afeta" com acento, coerente com RNF-06); nao e mais premissa. Os testes comparam com o dicionario.
2. **A2 Subtitulo so na folha "Mais"** (CA-50): alinhado com o PRD rev 5.2 (CA-50 pede o subtitulo so na folha; a sidebar nao renderiza `subKey` de nenhum item, `Sidebar.tsx:38-51`, e RF-08 proibe muda-la); nao e mais premissa.
3. **A3 2o icone do heroi so na aba Defendendo**; o `second` fica guardado ao ir para Atacando: alinhado com o PRD rev 5.2 (RF-37); nao e mais premissa (secao 3).
4. **A4 Linhas x4 e x1/4 da legenda sempre visiveis** quando F4.1 entra (legenda unica, RF-21).
5. **A5 `nav.types`/`nav.typesSub` no modulo da pagina**, nao em `core.ts` (porte por copia, secao 3).
6. **A6 Meta mensuravel do RNF-07**: nenhuma long task > 200 ms ao abrir a tabela e ao escolher tipos (mesmo limite de `perf.spec.ts`), e matriz desmontada fora da visao "Tabela completa".
7. **A7 Instrucao em `p` proprio**, sem `EmptyState` (fora da lista do RF-31).
8. **A8 Foco em `--primary` nos temas green, blue e purple** (alem de `--secondary` nos demais), precedente `detail.css:121`; continua `outline: 2px solid` (CA-34).
9. **A9 Textos acessorios da SPEC** (`types.viewLabel`, `types.tabLabel`, `types.pickLabel`, `types.matrixCaption`, `types.rowHeader`, `types.colHeader`, `types.cellLabel`, `types.secondLabel`): redacao desta SPEC; o PRD fixa o conteudo (nome do tipo + direcao; "Fogo contra Planta: x2"), nao a frase.
10. **A10 Regiao rolavel da matriz focavel** (`tabIndex=0` + foco visivel) para rolar por teclado.
11. **A11 Porte**: os 4 arquivos de teste viajam junto; as listas do shell e as baselines visuais do repo destino sao ajustadas la, com o mesmo protocolo de F1.3.

Perguntas em aberto: nenhuma que bloqueie a implementacao.

Dry-run de implementabilidade (feito como agente de frontend de contexto limpo): (a) todo arquivo a modificar existe e as linhas citadas batem com o HEAD `6aa3ffd5` (`navigation/types.ts` 4-15/9/17-29/22/31-43/36/48/64-84/77/99-122/113; `Icon.tsx` 11/38/39; `nav-items.ts` 3/19/27/29/32-36; `registry.ts` 15/24; `messages.ts` 19/24-38/37/53; `navigation-store.ts` 58-66/76/81-91/83-84/93-99/101-104/106-127; `useNavigation.ts` 16-18/20-26; `ScreenRouter.tsx` 8-11/28; `AppShell.tsx` 64-68; `Sidebar.tsx` 38-51; `MoreSheet.tsx` 48; `TabBar.tsx` 18; `TypeChip.tsx` 18-21/28-33; `TypeIcon.tsx` 20-26; `SegmentedControl.tsx` 9-37; `useT.ts` 24-29/33-35/40-43; `preferences-store.ts` 18; `type-chart.ts` 5-8/10-35/37/40-46/49-57/66-72/75-82; `data/types.ts` 6/340; `i18n/types.ts` 4-23; `components.css` 29/76/80-82/118; `base.css` 22/34/41; `shell.css` 43-44; `mobile.css` 13; `detail.css` 94-95/121/319; `item.css` 81; `trainers.css` 81; `eslint.config.js` 7-23/25-27/60-65; `vite.config.ts` 62-70/63; `DexFilters.tsx` 52-82/54/64-78; `shell.test.tsx` 66/114/142/147; `shell.spec.ts` 5/110/168/173/174; `responsive.spec.ts` 7/36-43/76-86/186-202; `compare.spec.ts` 7-14/16-22/53-57/60-68; `no-overlap.ts` 23-38; `i18n-modules.test.ts` 7-16/18-25; `lucide-react.d.ts` 11314/16956); (b) os grupos, a matriz e a defesa dupla de 5.5 foram calculados com `npx tsx` sobre o dominio no HEAD; (c) nenhum nome de classe `tp-*`/`tone-*`/`types-screen` existe hoje em `src/**/*.css` (grep vazio) e nenhuma chave `types.*`/`nav.types*` existe; (d) a ordem das features respeita as dependencias (F1.1 -> F1.2 -> F1.3 -> F2.1 -> F2.2 -> F2.3 -> F3.1 -> F4.1 -> F5.1 -> T1); (e) nenhum passo exige adivinhar nome, caminho, valor, ordem ou cor.

Self-check: PASS (todo `Consumes contract` aponta para 5.1 a 5.5 com os mesmos nomes; 60/60 RF+RNF sem orfao e CA-01..CA-50 citados; toda regra quantitativa com exemplo trabalhado e implementada nos passos: grupos de Fogo/Normal/Eletrico/Fantasma/Aco, celulas Fogo x Planta / Agua x Fogo / Fogo x Normal, contagens 51/61/8/204, defesa dupla Agua/Terra e os 4 casos do RF-39, regras de `nextSelection`, metricas 34 px / 686 px / 328 px; Backend, 5c e endpoints N/A com motivo; caminhos conferidos e arquivos novos marcados "criar"; zero travessao U+2014; zero linha de atribuicao de coautoria).
