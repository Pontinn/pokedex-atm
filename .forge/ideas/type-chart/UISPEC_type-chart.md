---
feature: type-chart
language: pt-BR
generated: 2026-10-12
status: uispec
reference_mode: project-identity (delta sobre UISPEC_pontindex-base)
source: render-captured (62 capturas PNG e valores via getComputedStyle, Playwright headless, dev server Vite local em :5174, classic e black, 1280x800 e 390x844); partially-code-derived (nomes de classe e custom property, caminhos, a regra de que `.mult-*` tem cores fixas, nao tematicas, e as regras de Do/Don't). O foco de teclado no tema black NAO foi medido em contraste (ver secao 8).
---

# UISPEC type-chart (nova tela "Tipos")

Identidade unica: a do app (Pontindex/cobblemon-pokedex, tema `classic`, depois `black`). Este documento so traz o DELTA. Tokens globais, temas, tipografia e shell: ver `C:/Users/Usuario/Desktop/Pessoais/Projetos/pontindex/.forge/in-progress/pontindex-base/UISPEC_pontindex-base.md` (secoes 3.1 paleta por tema, 3.2 tipografia e componentes, 4 inventario, 5 layout), que foi capturado do mesmo codigo e nao mudou (os hashes abaixo de `tokens.css`, `themes.css`, `components.css`, `mobile.css`... batem com os dele).

## 1. Baseline (drift anchor)

- Worktree `pokedex-type-chart`, branch `feature/type-chart`, HEAD `04b739884fe2bc95c7fe47c310b0b2b0792b6b3f`. O codigo de aplicacao e o de `main` cee51235 (commits acima dele sao so `.forge/`).
- UISPEC irmao reutilizado: `C:/Users/Usuario/Desktop/Pessoais/Projetos/pontindex/.forge/in-progress/pontindex-base/UISPEC_pontindex-base.md`, repo `pontindex` HEAD `7c85cba782225ac2ffcb4051f216c320c65cc7b2`.
- `git hash-object` (12 chars) dos arquivos por tras das capturas:

| arquivo | hash |
|---|---|
| src/styles/tokens.css | 073a956328b6 |
| src/styles/themes.css | ba927bad413f |
| src/styles/components.css | 097f1ee4311a |
| src/screens/Detail/detail.css | cd52710c05bd |
| src/styles/mobile.css | 813f2987640f |
| src/styles/shell.css | a250bf20d696 |
| src/styles/types.generated.css | eb964a397d3d |
| src/components/TypeChip.tsx | d59123ddeeba |
| src/components/TypeIcon.tsx | d40f9f62779a |
| src/components/SegmentedControl.tsx | fcdbaa78eea6 |
| src/screens/Detail/TypeCalculator.tsx | 0906d2d74663 |
| src/components/nav-items.ts | d9f41614b0ba |
| src/components/EmptyState.tsx | 03531ebfc7db |
| src/components/Icon.tsx | 2f7ab4188d32 |

Atencao: o CSS `.mult-*`, `.type-calc*`, `.tc-cell` e `.weak-grid` mora em `src/screens/Detail/detail.css` (nao em `src/styles/detail.css`, que nao existe). `.chip`, `.ti`, `.seg`, `.panel`, `.chips-scroll` moram em `src/styles/components.css`.

## 2. Alvos de referencia

Todos em `C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart/.forge/ideas/type-chart/ui-refs/` (sufixo `-{classic|black}-{desktop|phone}`). Script: `capture-types.cjs` (versionado; navegacao por clique em `[data-nav]`, busca da Home para abrir Charizard #6, tema por `[data-theme-pick]`, waits por locator e `getAnimations()`). Log: `capture-types.log.txt`. Valores: `tokens-types.json`.

| alvo | como chegar | arquivos (prefixo) |
|---|---|---|
| Calculadora de efetividade grass/flying (cobre x4, x2, x1, x1/2, x1/4, x0) | Ficha Charizard, `details#calc` aberto, `#c-t1`=grass `#c-t2`=flying | `detail-calc-grass-flying-*` |
| Ficha inteira com a calculadora aberta | idem | `detail-full-calc-open-*` |
| Painel Fraquezas (`.panel` com `h3` + `.seg-sm` + chips) | Ficha, `#weak-panel` | `detail-panel-weak-*`, `detail-seg-sm-weak-*` (estado "weak" pressionado) |
| Hero com TypeChip `lg` | Ficha, `.hero-card` | `detail-hero-types-*` |
| Chips de tipo da Dex: nenhum, 2 selecionados, hover (so desktop), foco de teclado | Dex, `#filter-types` | `dex-typechips-*`, `dex-typechips-selected-*`, `dex-typechip-hover-*` (desktop), `dex-typechip-focus-*` |
| SegmentedControl da Dex (status) nao-pressionado/pressionado, filtros inteiros | Dex, `.filter-seg` | `dex-seg-status-*`, `dex-seg-status-caught-*`, `dex-filters-*` |
| Cards da Dex (TypeChip `sm`) | Dex | `dex-cards-*` |
| Sidebar com 9 itens | desktop, `.sidebar` | `shell-sidebar-*-desktop` |
| Sheet "Mais" aberto, painel recortado, tabbar | phone, `[data-nav="more"]` | `shell-more-sheet-*-phone`, `shell-more-sheet-panel-*-phone`, `shell-tabbar-*-phone` |
| EmptyState (Dex sem resultado, busca "zzzzqq") | Dex, `#dex-search` | `empty-state-dex-*` |

Total: 62 PNG (desktop: 31, phone: 31 menos hover = ver `capture-types.log.txt`). As capturas do UISPEC irmao (home, temas, settings, ficha completa, Compare vazio) continuam validas e NAO foram copiadas: consultar `.../pontindex-base/ui-refs/` (ex.: `detail-calc-charizard-*`, `detail-weak-charizard-*`, `compare-empty-*`).

## 3. Tokens de design (so o delta)

Resto (cores de tema, raios `--radius-*`, sombras, fontes `--font-display` Fredoka / `--font-body` Nunito): UISPEC irmao secao 3.1 e 3.2.

### 3.1 Cor por tipo (`src/styles/types.generated.css`, GERADO, nao editar; fonte `design/tipos/cores.json`)

Padrao: cada tipo tem `--t-<tipo>` (cor solida), `--type-<tipo>-a` e `--type-<tipo>-b` (gradiente). A classe `.t-<tipo>` define `--tc`, `--g1`, `--g2`; `.g-<tipo>` so `--g1/--g2`. `.chip` usa `linear-gradient(135deg, var(--g1) 0%, color-mix(... 40%, var(--g2)) 100%)`; `.ti` usa `color-mix(var(--g1) 82%, #000)`. Texto do chip: branco com sombra, exceto `electric, ice, normal, fairy` que usam `#1C1F2B` (regra `.chip.t-electric, ...` em `components.css`). Identico em classic e black (cores de tipo NAO mudam com o tema).

| tipo | `--t-` | `--type-a` | `--type-b` | cor do texto do chip |
|---|---|---|---|---|
| normal | #a0a29f | #8a8a8a | #dcdcdc | #1C1F2B |
| fire | #fba54c | #ff5a00 | #ffd000 | #fff |
| water | #539ddf | #0066ff | #00e5ff | #fff |
| electric | #f2d94e | #ffb300 | #fff200 | #1C1F2B |
| grass | #5fbd58 | #00b34a | #b6ff2e | #fff |
| ice | #75d0c1 | #00c2ff | #c8fbff | #1C1F2B |
| fighting | #d3425f | #e6003d | #ff7a3d | #fff |
| poison | #b763cf | #8a1fff | #e55cff | #fff |
| ground | #da7c4d | #d96a00 | #ffcc66 | #fff |
| flying | #a1bbec | #3d8bff | #b3e0ff | #fff |
| psychic | #fa8581 | #ff2d7a | #ff9ec4 | #fff |
| bug | #92bc2c | #5fd400 | #d4ff3d | #fff |
| rock | #c9bb8a | #a88a2a | #e6cf7a | #fff |
| ghost | #5f6dbc | #4b2bd6 | #a06bff | #fff |
| dragon | #0c69c8 | #1a2dff | #5ce1ff | #fff |
| dark | #595761 | #23233a | #6b6b9e | #fff |
| steel | #5695a3 | #2f7fa6 | #9be3ff | #fff |
| fairy | #ee90e6 | #ff4fd8 | #ffc2f2 | #1C1F2B |

Ordem canonica: `TYPE_IDS` em `src/domain/type-chart.ts` (normal, fire, water, electric, grass, ice, fighting, poison, ground, flying, psychic, bug, rock, ghost, dragon, dark, steel, fairy). Valores computados completos em `tokens-types.json` (`perType`).

### 3.2 Multiplicadores `.mult-*` (`src/screens/Detail/detail.css:93-95, 319`)

Fonte Fredoka 700; `.tc-cell .mult` = 13px, padding 2px 8px, raio 8px (altura 20px; `.mult-1` 22px por ter borda 1px).

| classe | texto | fundo | texto (cor) | tema |
|---|---|---|---|---|
| `.mult-4` | x4 | #FFD9D9 | #A10F0F | FIXO (igual em classic e black) |
| `.mult-2` | x2 | #FFE9D6 | #9A4A00 | FIXO |
| `.mult-1` | x1 | `var(--surface)` + borda 1px `var(--border)` | `var(--muted)` | TEMATICO (classic: branco/#6B7084; black: #111111/#B3AE9C) |
| `.mult-half` | x½ | #E1F5E7 | #1B6B3A | FIXO |
| `.mult-quarter` | x¼ | #C9EED6 | #0F5A2C | FIXO |
| `.mult-0` | x0 | #E6E7EC | #444A5C | FIXO |

Conclusao verificada no render: no tema black as pilulas pastel fixas (fundo claro, texto escuro) leem bem sobre a celula escura `.tc-cell` (fundo `#1C1B15`, `--surface-2`), ver `detail-calc-grass-flying-black-*`. Nao dependem so de cor: cada pilula tem o texto x4/x2/x1/x½/x¼/x0, e x4 vs x2 e x½ vs x¼ diferem tambem pelo texto, nao so pelo tom. Pares x2/x4 (vermelho/laranja palido) sao proximos em matiz: o simbolo textual e obrigatorio.

### 3.3 Chip, seg, panel, calculadora (computado, classic, desktop)

| elemento | valores |
|---|---|
| `.chip` base (md) | inline-flex, gap 6px, padding 4px 11px 4px 4px, raio 999px, Nunito 800 12px, `.ti` 22px |
| `.chip.sm` | padding 2px 8px 2px 2px, fonte 11px, gap 5px, `.ti` 18px; altura 22px, largura 64 a 76px |
| `.chip.lg` (hero) | padding 5px 16px 5px 6px, fonte 14px, gap 8px, `.ti` 28px; 92x38 (fire) |
| chip nao selecionado (Dex) | sem `.on`; `box-shadow: inset 0 -2px 0 rgba(0,0,0,.14)`; sem opacidade (regra RNF-07) |
| chip selecionado `.chips-scroll .chip.on` | `box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--text)`; `translateY(-1px)`; mostra `.chip-check` 12x12 (check). Cor + simbolo. |
| hover do chip | `translateY(-1px) scale(1.04)` + brilho `chipShine` |
| `.chips-scroll` | flex, gap 6px, `overflow-x: auto`, padding 3px 3px 8px; 18 chips = 1374px de largura; no desktop (938px de area) e no phone (332px) rola na horizontal, nao quebra linha |
| `.seg` | inline-flex, fundo `var(--surface-2)`, borda 1.5px `var(--border)`, raio 999px, padding 3px, gap 2px; altura 40px |
| `.seg button` | 13px / 800, padding 7px 14px, cor `var(--muted)`; altura 32px |
| `.seg button[aria-pressed=true]` (classe `.active`) | fundo `var(--secondary)` (#2A75BB classic; #F5C518 black), texto `var(--on-secondary)` (#fff classic; #1A1400 black) |
| `.seg-sm` | altura 34px; botoes 12px / 800, padding 5px 11px, altura 26px |
| `.seg-tabs` | `margin-bottom 16px; max-width 100%; overflow-x: auto`; no phone vai de ponta a ponta (`margin 0 -16px`, sem raio) |
| `.panel` | fundo `var(--surface)`, borda 1px `var(--border)`, raio 18px, padding 18px 20px (phone: 14px), sombra `var(--shadow-sm)`, animacao `cardIn` com `--i` |
| `.panel h3` | flex, gap 8px, Fredoka 17px/600; barra azul antes (`::before` 6x18px, raio 3px, `var(--secondary)`), margin-bottom 14px |
| `.panel-head` | flex, space-between, wrap, gap 10px, margin-bottom 14px (`.ph-right` agrupa seg + toggle) |
| `.type-calc` | grid gap 12px; `h4` Fredoka 15px/600; selects 14px/700 altura 39px |
| `.type-calc-grid` | grid `repeat(auto-fill, minmax(150px, 1fr))` gap 8px; phone: `repeat(2, minmax(0,1fr))` |
| `.tc-cell` | flex, space-between, gap 8px, padding 6px 8px, raio 10px, fundo `var(--surface-2)`, borda 1px `var(--border)`; altura 36px; contem `TypeChip sm` + `.mult` |
| `.empty-state.ob-none` | flex gap 14px, padding 16px 18px, raio 12px, fundo `var(--surface-2)`, borda 1px `var(--border)`, texto `var(--muted)` 700 16px, icone pokebola 40x40 em circulo branco |

### 3.4 Foco

`base.css` e `components.css` NAO definem `:focus-visible` para botoes e chips: o anel e o `outline: auto` padrao do Chrome (computado: `outline-style: auto`, 1px, `rgb(16,16,16)`, offset 0; `:focus-visible` = true) em `.chip` e `.seg button`. Excecoes: `.toast-close:focus-visible` e `.made-by:focus-visible` (shell.css). Select: `outline-width 0` no estado normal. Ver `dex-typechip-focus-*`.

## 4. Inventario de componentes (reusar)

- `TypeChip` (`src/components/TypeChip.tsx`): `<TypeChip type lang size="sm|md|lg" selected className />`; renderiza `<span class="chip t-<tipo> [sm|lg] [on]" data-type>` com `TypeIcon` + nome. Exporta `typeName(type, lang)`. Note: nos filtros da Dex os chips sao `<button class="chip sm t-<tipo> [on]">` montados em `src/screens/Dex/DexFilters.tsx` (nao e o `TypeChip`).
- `TypeIcon` (`src/components/TypeIcon.tsx`): `<span class="ti t-<tipo>"><img></span>`, SVG por `import.meta.glob("../assets/types/*.svg")`; `typeIconUrl(type)` exportado. Tamanhos: 22px base, 18px em chip `sm`, 28px em chip `lg`.
- `SegmentedControl` (`src/components/SegmentedControl.tsx`): `<SegmentedControl<V> options value onChange className ariaLabel />`, `role="group"`, botoes com `aria-pressed`. Usos: `DexFilters` (status, `.filter-seg`), `WeaknessPanel` (`className="seg-sm"`), Balls, Captured, Items, Settings (`LanguageCard`, `TermsCard`), Sync (`SyncScreen`, `SyncSummary`).
- Grade de chips: `.chips-scroll` + `.chip.on` + `.chip-check` (`components.css:78-82`).
- `.panel` / `.panel-head` / `.ph-right` / `h3`: padrao de secao (Detail: `WeaknessPanel.tsx`). Usar `style={{ "--i": n }}` para a animacao escalonada.
- `EmptyState` (`src/components/EmptyState.tsx`): `<EmptyState messageKey="..."> {filhos} </EmptyState>` (`.empty-state.ob-none`), usado em Dex, Compare, Balls, Items, Captured, Detail, Home.
- Padrao de icones (`src/components/Icon.tsx`): reexporta SO os icones lucide usados (tree-shaking). Item de nav novo exige adicionar o icone ao reexport e usar `import { X } from "./Icon"`; nunca importar `lucide-react` direto. Icones ja reexportados que servem a um item "Tipos": `Zap`, `Shield`, `Swords` (ja usado por Treinadores), `Target`, `Sparkles`, `Flame` NAO existe no reexport (adicionar se for usado).
- `src/components/nav-items.ts`: `SIDEBAR_ITEMS` (9 itens), `TAB_SCREENS = [home, dex, captured, compare]`, `MORE_ITEMS = SIDEBAR_ITEMS menos TAB_SCREENS`.

NAO importar na nova pagina: `EFFECT_LABEL` nem `TypeCalculator` de `src/screens/Detail/TypeCalculator.tsx`, nem as classes `.mult-*`, `.tc-cell`, `.type-calc*` (escopo da Ficha). A pagina Tipos define o proprio CSS (arquivo proprio da tela, tokens do tema; cores fixas pastel so se replicadas de forma deliberada, ver 3.2). Nomes de tipo: SEMPRE `uiLanguage` (`usePreferencesStore((s) => s.uiLanguage)`, como `TypeChips` em `DexFilters.tsx`), nunca o toggle de termos (`useTermsLanguage("calc")` / `TermsToggle`, que a Ficha usa).

## 5. Layout e interacao

- Scaffold de tela: `<section className="X-screen">` + `.page-head` (titulo) + blocos `.panel` (cada um com `h3`, opcionalmente `.panel-head` com controles a direita). Exemplo: `DexScreen.tsx`, `WeaknessPanel.tsx`.
- Dex: filtros em `#filters`; chips de tipo numa unica linha com scroll horizontal (`.chips-scroll`, 18 chips, 1374px); selects e `.filter-seg` ao lado. Chips sao `button` (alvo de clique 22px de altura, `sm`).
- Padroes de scroll horizontal ja existentes (para a matriz 18x18 no phone): `.chips-scroll` (`overflow-x: auto`) e `.seg-tabs` (`overflow-x: auto`, sangra ate a borda no phone). NAO ha tabela larga com rolagem horizontal no app; a calculadora reflui em 2 colunas no phone em vez de rolar. A matriz 18x18 teria de seguir o padrao `overflow-x: auto` dentro de um `.panel` (min-width 0 ja esta no `.panel`).
- Shell desktop: sidebar com 9 itens na ordem `home, dex, captured, compare, trainers, balls, items, sync, settings` (capturado de `.sidebar [data-nav]`). O item novo "Tipos" entra logo apos `compare` (indice 5, antes de `trainers`). Item: 44px de altura, 15px/700, raio 12px, ativo com fundo `rgba(255,255,255,.18)`.
- Shell phone: tabbar de 5 posicoes fixas (`home, dex, captured, compare, more`; 4 abas + `more`), por isso um item novo em `SIDEBAR_ITEMS` fora de `TAB_SCREENS` cai AUTOMATICAMENTE no sheet "Mais". Ordem atual do sheet: Treinadores, Pokebolas, Itens & Comidas, Sincronizar, Configuracoes, Feito por Pontin (link), GitHub (link). "Tipos" ficaria no topo do sheet, antes de Treinadores (mesma ordem de `SIDEBAR_ITEMS`). O sheet tem 470px de altura com 7 itens (55px cada, 14px de padding lateral, raio superior 24px); um 8o item cresce o painel em ~61px (cabe em 844px). Cada item: icone, `.sheet-item-label` e `<small class="sheet-item-sub">` (a chave `subKey` e opcional).
- Carregando/vazio/erro: carregando = `PokeballSpinner` em `.dex-loading`; vazio = `EmptyState`; erro = `InlineError` / `ErrorBoundary` (`src/components/`); botoes e chips respondem com `transform` no hover.
- Animacao de entrada dos `.panel` (`cardIn`) e `chipShine` no hover; respeitar `prefers-reduced-motion` como o resto do app (ver Settings, "Movimento").

## 6. Identidade por area

Area unica: o app inteiro (tema `classic` por padrao, `black` como tema de alto contraste). Nao ha areas visuais distintas; a nova tela herda shell, painel e tokens, sem identidade propria.

## 7. Do / Don't

Do:
- Cor E simbolo sempre. Chip selecionado = anel + check (nao so cor); efetividade = texto x4/x2/x1/x½/x¼/x0 mais a cor; a ausencia de dano (x0) tem texto proprio. No tema black nada pode depender so de matiz.
- Reusar a paleta de tipo existente (`--t-*`, `--type-*-a/b`, `.t-<tipo>`); nenhuma paleta nova. Bandas/titulos de efetividade usam icones grandes: `TypeIcon` e chip `lg` (28px) ou tamanho maior via CSS proprio, nao so o chip `sm` 18px.
- Usar tokens do tema (`--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--secondary`, `--on-secondary`, `--radius-*`, `--shadow-sm`) para fundos de painel, celulas e texto; funciona em classic e black (7 temas existem: classic, black, green, blue, purple, white, orange).
- Anel de foco visivel nos controles novos (celulas de matriz clicaveis, seletores): se a pagina tornar celulas focaveis, definir um `:focus-visible` explicito (2px `var(--text)` ou `var(--secondary)`, offset 2px) em vez de depender do `outline: auto` padrao.
- Texto visivel por `t(...)` / chaves de i18n (regra `pontindex/no-literal-jsx-text` = error em `eslint.config.*`): nenhum texto literal em JSX, tudo via `MessageKey`. Rotulos de multiplicador ("x2", "x½") vem de constante/formatador, nao de texto solto em JSX.
- Alvos de clique de pelo menos o tamanho de um chip `sm` (22px de altura) e, no phone, espaco para toque.
- Nomes de tipo por `uiLanguage`.

Don't:
- Nao importar `EFFECT_LABEL`/`TypeCalculator`/`.mult-*` da Ficha; definir CSS proprio.
- Nao usar opacidade para "desligado" em chips (regra RNF-07 do `TypeChip`): contorno/`.on`.
- Nao sobrepor controles: `tests/harness/no-overlap.ts` trata `button, [role=button], a[href], input, select, textarea, img, svg, .badge, .chip, .tag, .tgl, .seg, .switch` como controles; nenhum texto visivel pode cruzar outro texto nem um desses elementos (tolerancia 1px). Isso inclui rotulos de linha/coluna da matriz 18x18, icones sobre celulas e legendas fixas; texto sobre um `.chip`/`img` so se for descendente dele. Testar em 1280x800 e 390x844.
- Nao editar `src/styles/types.generated.css` (gerado por `npm run gen:assets`).
- Nao hardcodar cores novas fora das fixas ja documentadas em 3.2; nao criar gradiente novo.
- Nao usar o travessao (U+2014) em texto, comentarios ou strings.

## 8. Lacunas

- Foco de teclado no tema black: o anel e `outline: auto` do Chrome; so foi medido o classic. O PNG `dex-typechip-focus-black-desktop.png` existe mas o contraste do anel contra `#111` nao foi medido numericamente. Se a pagina usar celulas focaveis, definir anel proprio (secao 7).
- Hover do chip no phone: nao capturado (sem hover real); so existe `dex-typechip-focus-*-phone`.
- A calculadora so foi capturada com grass/flying (cobre os 6 multiplicadores); o estado de um unico tipo (t2 vazio) tem a mesma estrutura mas nao foi fotografado. Para a referencia da Ficha original, ver `detail-calc-charizard-*` do UISPEC irmao.
- Nao existe no app um componente de matriz/tabela (18x18) nem celulas de tipo clicaveis: a matriz e design novo, a ser feito com os tokens acima; nao ha referencia renderizada a copiar.
- Item "Tipos" na sidebar/Mais: so ha previsao a partir do codigo (`nav-items.ts`), nao ha captura com ele (nao existe ainda). Os testes e snapshots afetados pelo novo item estao no CONTEXT_type-chart.md.
- As capturas `shell-tabbar-*` mostram so a barra recortada; no estado com o sheet aberto, ver `shell-more-sheet-*`.
