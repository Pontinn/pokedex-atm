---
feature: berry-mutations
language: pt-BR
generated: 2026-09-30
status: uispec
reference_mode: [page:/item, page:items]
source: mixed (render do estado atual + anatomias novas recomendadas a partir do codigo)
---

# UISPEC berry-mutations (extensao de UISPEC_spawn-bait e UISPEC_pontindex)

Extensao focada em duas areas: (A) pagina do item de baga (painel "Como obter", `UsedIn`, novo bloco de cruzamento) e (B) listagem de itens (card de baga, tag de origem, filtro de origem). Tokens e inventario de `.forge/complete/spawn-bait/UISPEC_spawn-bait.md` continuam valendo. O app e SPA sem URL por tela: capturas via `useNavigationStore.navigate("item", {itemId})` / `("items")` no dev server (Vite, porta 4175), Playwright headless, sem slowMo, esperando so animacoes finitas. O dataset publicado atual (`atm1.3.0-cobblemon1.7.3-20260929-2ef2f512`) ainda NAO tem dados de mutacao: as capturas mostram o estado de hoje (sem bloco de cruzamento, sem tag de origem, sem filtro).

## 1. Baseline (drift anchor)

Revisao 2 (forge-review): tag de origem so em linha propria; linhas novas dentro de `.item-obtain`/`UsedIn`; filtro em `.item-top`; fonte de "Sim, tem receita" corrigida; source e gap da Enigma ajustados.

Revisao 3 (forge-review da SPEC, decisao do orquestrador 2026-09-30): anatomia da tag de origem alinhada a SPEC F2.1 (wrapper `span.item-origins` como ultimo filho de `.item-names`, tags lado a lado, `.item-tag` intocado), substituindo "sem wrapper, cada tag em linha propria".

HEAD `bc113bd91c43` (branch feature/berry-mutations). Fingerprints (`git hash-object`, 12 chars):

| arquivo | hash |
|---|---|
| src/screens/Item/ItemScreen.tsx | 0a6b3b7ea0bc |
| src/screens/Item/item.css | bae77ab12406 |
| src/screens/Item/BaitParts.tsx | bc79a5c3ccee |
| src/screens/Item/item-page-model.ts | ff300ec052f5 |
| src/screens/Items/ItemsScreen.tsx | 7e26276f00e1 |
| src/screens/Items/items.css | d8af84462afa |
| src/screens/Items/item-model.ts | cf7be65da6e8 |
| src/screens/Detail/ItemLink.tsx | d34132bea534 |
| src/screens/Detail/detail.css | a6f3a9cb95d2 |
| src/screens/Trainers/ListSearch.tsx | a484d3f92d46 |
| src/screens/Trainers/list-search.css | 58a786625ff8 |
| src/components/SegmentedControl.tsx | fcdbaa78eea6 |
| src/components/TermsToggle.tsx | 5a8cd90e2941 |
| src/components/EmptyState.tsx | 03531ebfc7db |
| src/screens/Balls/BallsScreen.tsx | d6c35c0774f2 |
| src/screens/Balls/balls.css | 23a4042551c9 |
| src/styles/components.css | 20542c615719 |
| src/styles/themes.css | ba927bad413f |
| src/styles/tokens.css | 073a956328b6 |
| src/styles/mobile.css | 813f2987640f |

`src/styles/shell.css` (`.empty-state`, linhas 120-124) foi so lido, sem hash.

## 2. Reference targets

Pasta: `.forge/ideas/berry-mutations/ui-refs/` (32 PNG, cerca de 3 MB). Tema `classic` e PT salvo indicacao. `-1280` desktop, `-390`/`-360` mobile (`.app.mobile`). As telas rolam num container interno: os PNG sem `-tall` mostram so a viewport; para a pagina inteira use os `-tall` e os crops.

| alvo | arquivos |
|---|---|
| Item Cheri (so mundo) | `recon-item-cheri-pt-1280.png`, `recon-item-cheri-pt-390.png` |
| Item Sitrus (so mutacao; hoje sem bloco de origem) | `recon-item-sitrus-pt-1280.png`, `recon-item-sitrus-pt-390.png` |
| Item Liechi (as duas) | `recon-item-liechi-pt-1280.png`, `recon-item-liechi-pt-390.png`, `recon-item-liechi-pt-1280-black.png` (tema escuro) |
| Item Occa (4 `.ob-row`: Craftavel, Drop de Pokemon, Plantavel, Loot de estrutura) | `recon-item-occa-pt-1280.png`, `recon-item-occa-pt-390.png`, `recon-item-occa-pt-1280-tall.png`, `recon-item-occa-pt-390-tall.png`, `recon-item-occa-en-1280.png`, `recon-item-occa-pt-1280-purple.png`, crops `recon-item-occa-obtain-crop.png`, `recon-item-occa-usedin-crop.png` |
| Item Enigma (maior lista de parceiros) | `recon-item-enigma-pt-1280.png`, `recon-item-enigma-pt-390.png`, `recon-item-enigma-pt-360.png`, crops `recon-item-enigma-obtain-crop.png`, `recon-item-enigma-usedin-crop.png` |
| Listagem, aba Berries | `recon-items-berries-pt-1280-classic.png`, `recon-items-berries-pt-1280-black.png`, `recon-items-berries-pt-390.png`, `recon-items-berries-pt-360.png`, `recon-items-berries-en-1280.png` |
| Listagem, aba Iscas | `recon-items-iscas-pt-1280.png` |
| Busca com resultado de bagas ("ber") | `recon-items-search-ber-pt-1280.png` |
| Estado vazio (busca "zzzz") | `recon-items-empty-search-pt-1280.png` |
| Card de baga (crop, `.item-tag`) | `recon-item-card-berry-crop.png`, `recon-item-card-berry-crop-black.png` (tema preto) |
| Barra de ferramentas (`.item-tools`) | `recon-items-toolbar-crop.png` |
| Controle a reutilizar (filtros de Pokebolas) | `recon-ref-seg-balls-filters-1280.png` |

## 3. Design tokens (computados)

Variaveis por NOME (nunca hex no CSS novo). Valores por tema (`src/styles/themes.css`, `html[data-theme=...]`; temas: classic, black, green, blue, purple, white, orange):

| variavel | classic | black (escuro) | purple | green | blue | white | orange |
|---|---|---|---|---|---|---|---|
| `--surface` | #FFFFFF | #111111 | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF |
| `--surface-2` | #E6EFFA | #1C1B15 | #FCEAF2 | #F3EEDD | #EDF0F5 | #FBE9EC | #EAEEF7 |
| `--border` | #E4E7EF | #3D3820 | #E5DFF2 | #DDE5DA | #DCE2EE | #E1E3EA | #EAE3DB |
| `--text` | #1C1F2B | #F4F2EA | #221A36 | #1E2A22 | #182033 | #1C1F2B | #24201C |
| `--muted` | #6B7084 | #B3AE9C | #73688F | #66756B | #66708A | #6B7084 | #7A7069 |
| `--primary` | #DC0A2D | #17171C | #6A3FC9 | #2F8F5B | #1F5FBF | #F7F7FA | #F0762B |
| `--secondary` | #2A75BB | #F5C518 | #FF6FB1 | #F2E8CF | #C6CCD6 | #DC0A2D | #1E2A4A |
| `--secondary-soft` | #DCEBFA | #3A3210 | #FFE1EF | #E6F2E9 | #E3E8F1 | #FBE1E6 | #DEE3F0 |
| `--on-secondary` | #FFFFFF | #1A1400 | #3A0F26 | #2B3A2E | #1B2230 | #FFFFFF | #FFFFFF |

Comuns a todos: `--radius-md 12px`, `--radius-lg 18px`, `--shadow-sm 0 1px 2px rgba(15,20,40,.06), 0 2px 8px rgba(15,20,40,.06)`, `--shadow-md 0 6px 18px rgba(15,20,40,.10), 0 2px 4px rgba(15,20,40,.05)`, `--font-display "Fredoka"`, `--font-body "Nunito"`. Nos temas green e blue `--secondary` e claro (bege/cinza): texto de valor em `--secondary` perde contraste, por isso `item.css` troca para `--primary` (`html[data-theme="green"] .item-screen .mon-chip b`); texto colorido novo deve repetir essa troca ou usar `--text`.

Computados (classic; nos outros temas mudam so pelas variaveis; renderizado tambem em black e purple):

| elemento | computado | fonte |
|---|---|---|
| `.panel` | bg `--surface`, borda 1px `--border`, radius 18, shadow `--shadow-sm`; h3 Fredoka 17/600 ls .17px, barra `::before` `--secondary` | components.css:29-33 |
| `.ob-row` (pagina) | flex, gap 12, pad 10/12, radius 12, bg `--surface-2`, borda 1px `--border`, altura 64 (1 linha), `cardIn .4s` com `--i`, hover `translateX(3px)`, `min-width:0` | item.css:25-26 |
| `.ob-ico` | 36x36, radius 10, bg `--secondary-soft`, cor `--text`, svg 18 | item.css:27-28 |
| `.ob-title` | Nunito 13/800 `--text` | item.css:30 |
| `.ob-text` | Nunito 12.5/600 `--muted`, flex wrap gap 4/6, margin-top 2; `b` em `--text` | item.css:31-32 |
| `.ob-none` | borda tracejada, icone em `--surface` | item.css:33-34 |
| `.biome` (chip de `LabelChips`) | pad 4/10, radius 999, bg `--surface`, borda 1px `--border`, 12/800 `--text`; `.ob-more` ("e mais N") igual, borda tracejada, `--muted` | item.css:36 e 51-52 |
| `.chips` / `.mon-chips` | flex wrap gap 6 | item.css:35,37 |
| `.mon-chip` | pad 3/10/3/4, radius 999, bg `--surface`, borda 1.5px `--border`, 12/800, hover sobe 2px e borda `--secondary`; `b` `--secondary` (green/blue: `--primary`) | item.css:38-42 |
| `ItemLink` padrao | `className="tag tag-item it-link"`: `.tag` 10/800 uppercase pad 2/7 radius 6 bg `--secondary-soft`; `.tag-item` sobrescreve: 12px, sem uppercase, pad 3/9, gap 4 (tile 18 + nome) | components.css:110, detail.css:235 |
| `ItemLink` em pilula (precedente da isca) | `className="bait-berry it-link"`: pad 4/10/4/4, radius 999, bg `--surface`, borda 1.5px `--border`, 12px, hover borda `--secondary` | detail.css (`.bait-berry`, `.bait-boost`) |
| `.bait-badge` | inline-flex, pad 2/7, radius 8, 9.5/800 uppercase ls .04em, nowrap; `-rarity` bg `--secondary-soft`; `-shiny` bg `--surface-2` + borda 1px | detail.css:209-211 |
| `.badge.badge-common` (categoria no hero) | 11/800 uppercase ls .44, pad 3/9, radius 8, bg rgb(232,233,238), cor rgb(78,84,104) | components.css:101-108 |
| nota "Sim, tem receita" | pilula 12/800, cor rgb(31,122,70) sobre rgb(223,243,230), radius 8 | `.badge-uncommon` (components.css:103, ajustado em item.css:57) |
| `.item-card` | bg `--surface`, borda 1px `--border`, radius 18, pad 12/14, shadow `--shadow-sm`, hover `translateY(-3px)` + `--shadow-md`, `cardIn` com `--i` (max 16 x 40ms), `content-visibility:auto` | items.css:11-13 |
| `.item-tag` (`span.tag.item-tag`) | 10/800 uppercase ls .6px, pad 2/7, radius 6, bg `--secondary-soft`, cor `--text`, margin-bottom 1; linha PROPRIA acima do nome dentro de `.item-names` (grid, `justify-items:start`, gap 2) | items.css:27, ItemsScreen.tsx:69 |
| `.item-name` / `.item-alt` / `.item-desc` | 15/800 lh 1.25 / 11/700 `--muted` / 13/600 `--muted` clamp 2 linhas | items.css:28-35 |
| `.tabs.item-tabs` | flex gap 4, base inset 1.5px `--border`, `overflow-x:auto`; botao 13/800 pad 8/14 `--muted`; ativo `--text` + borda inferior 3px `--secondary` (aba underline) | components.css:127-129 |
| `.list-search` | pilula bg `--surface`, radius 999, pad 6/6/6/18, `--shadow-md`, min-height 54, max 680, `flex:1 1 320px` | list-search.css:3, items.css:8 |
| `.item-tools` | flex, `justify-content:space-between`, gap 12, wrap; contem `ListSearch` e `TermsToggle` | items.css:7 |
| `.seg` / `.seg-tabs` (controle segmentado) | pilula bg `--surface-2`, borda 1.5px `--border`, pad 3, gap 2; botao 13/800 pad 7/14 `--muted`; `.active` bg `--secondary` + cor `--on-secondary`; `.seg-sm` botao 12px pad 5/11; `.terms-tgl` botao 11px pad 3/8 | components.css:117-124, detail.css:90 |
| `.empty-state.ob-none` | flex gap 14, pad 16/18, radius 12, borda 1.5px tracejada `--border`, bg `--surface-2`, cor `--muted`; icone pokebola 24px cinza | shell.css:120-124 |

## 4. Component inventory (reusar)

| componente | onde | uso na feature |
|---|---|---|
| `Row` (`.ob-row` + `.ob-ico` + `.ob-title` + `.ob-text`, `data-row=<kind>`) | src/screens/Item/ItemScreen.tsx:142 | linhas "Como cruzar", "Usada em cruzamento", "Encontrada no mundo", "Cresce melhor em" (icone lucide) |
| `ObtainRow`, `UsedIn` (`section.panel.item-used`, h3 `ip.used`) | ItemScreen.tsx:156, :322 | ponto de encaixe do "Usada em cruzamento" (rows `data-row`: evolutions, fossils, forms, ball, effect) |
| `LabelChips` (`.chips` > `.biome`) e `CappedList` (limite + `.ob-more`) | ItemScreen.tsx:138, :111 | biomas de "Encontrada no mundo" / "Cresce melhor em"; `CappedList` colapsa, mas RF-08 exige todos os pares acessiveis |
| `ItemLink` (`id`, `items`, `lang`, `className`, `size`) | src/screens/Detail/ItemLink.tsx:33 | cada baga parceira/resultado clicavel (`data-item`, teclado, `navigate("item")`); id sem pagina vira texto (`data-item-missing`) |
| `ItemTile` | src/components/ItemTile.tsx | textura pixelada (ja dentro do ItemLink) |
| `.bait-badge` (`-rarity`, `-shiny`) | detail.css:209-211 | selo pequeno reutilizavel, sem criar classe de badge nova |
| `.tag` (e `.item-tag`) | components.css:110, ItemsScreen.tsx:69 | referencia visual da tag de origem (10/800 uppercase, bg `--secondary-soft`); usar classe propria |
| `ItemCard` | src/screens/Items/ItemsScreen.tsx:60 | recebe a tag de origem como elemento novo em `.item-names` |
| `ListSearch` (`screen="items"`) | src/screens/Trainers/ListSearch.tsx:41 | inalterado |
| `ItemTabs` (`.tabs.item-tabs`, `data-icat`) | ItemsScreen.tsx:117 | inalterado (Berries e Iscas listam as 70 bagas) |
| `SegmentedControl` (`.seg`, `role=group`, `aria-pressed`, `ariaLabel`) | src/components/SegmentedControl.tsx:12 | **controle a reutilizar para o filtro de origem** (Todas / Mutacao / Mundo); ja usado em Pokebolas (`ball-filters`, BallsScreen.tsx:80-92), Capturados e `WeaknessPanel` (`seg-sm`); teclado e `aria-pressed` prontos |
| `TermsToggle` (`seg seg-xs terms-tgl`) | src/components/TermsToggle.tsx:15 | ja em `.item-tools`; o filtro nao pode se confundir com ele |
| `EmptyState messageKey="item.none"` | src/components/EmptyState.tsx:7, ItemsScreen.tsx:96 | estado vazio existente (mostra a query); reutilizar para filtro sem resultado |
| estado de UI por entrada (`useScreenUi`, `updateUi<"items">`) | ItemsScreen.tsx:97,121 | filtro de origem persistido junto de `category`/`query`/`openItemId` (RF-32) |
| i18n `t()` e `src/i18n/messages/item.ts` | item.ts (`ip.*`, `item.*`) | todo texto novo em PT/EN |

## 5. Layout & interaction patterns

Pagina do item (`.item-body`, grid gap 16): `.item-hero` (card) > `section.panel.item-obtain` (`--i:1`) > `BaitEffectsPanel` (se houver isca) > `section.panel.item-used` (`--i:2`). Cada painel: h3 + `.ob-list` (grid gap 8) de `.ob-row`. Contrato: "Encontrada no mundo", "Cresce melhor em" e "Como cruzar" sao entradas `Row` DENTRO de `.item-obtain` (Como obter), DEPOIS das linhas existentes (a linha Plantavel da baga e a unica aprovada para ser dividida); "Usada em cruzamento" e uma `Row` dentro do painel `UsedIn` existente. Nenhum painel novo; `BaitEffectsPanel`, ordem dos paineis e `--i` inalterados; as 4 linhas do Occa (`data-row` craftable/drop/plantable/structureLoot) seguem intactas.
- `.ob-row` desktop: icone 36 a esquerda, corpo `flex:1`, chips em `flex-wrap` gap 4/6; altura 64 com uma linha.
- Mobile (`.app.mobile`, 390 e 360): `.ob-row` ganha `flex-wrap:wrap` e `.ob-body` `flex:1 1 calc(100% - 48px)` (item.css:63-64); chips quebram em varias linhas dentro do corpo; sem scroll horizontal. Listas longas (Enigma, 18 parceiros) hoje seriam cortadas por `CappedList` ("e mais N"): o bloco novo deve expor todos os pares (RF-08), com `flex-wrap`, `min-width:0` e `overflow-wrap:anywhere` (padrao `.biome`).
- Hero no mobile vira coluna centralizada (tile 120).
- Pilula `ItemLink`/`.mon-chip`: hover sobe 2px, borda `--secondary`; foco de teclado vem do botao nativo.
- `cardIn` escalonado por `--i`; as capturas esperam so animacoes finitas (a flutuacao `itemFloatY` do hero e infinita).

Listagem: `.items-screen` > `.page-head` (h2 "Itens & Comidas") > `.item-top` (grid gap 12) > `.item-tools` (busca a esquerda `flex:1 1 320px`, `TermsToggle` a direita; em mobile o toggle fica a direita, `margin-left:auto`, items.css:38) > `.tabs.item-tabs` > `.item-grid` (`auto-fill minmax(280px,1fr)` gap 12; mobile 1 coluna). Busca ativa desmarca a aba (`searching`) e procura em TODOS os itens, PT/EN. Card: `.item-head` (botao `.item-link` com tile 48 + `.item-names`, caret 32) + `.item-desc`. Cards usam `content-visibility:auto` com `contain-intrinsic-size: auto 110px`: a tag nova nao deve aumentar muito a altura do card.
- Onde colocar o filtro: em `.item-top`, em linha propria (padrao Pokebolas: `SegmentedControl` com `seg-tabs`/`seg-sm`), NAO dentro de `.item-tools` (em mobile `.seg-tabs` vira faixa de largura total e conflitaria com busca e `TermsToggle`, mobile.css:28).
- Estado vazio: `EmptyState` (`.empty-state.ob-none`, pokebola cinza, texto `item.none`, query entre aspas se houver). Filtro ativo sem resultado reutiliza exatamente esse bloco.
- Tag de origem (encaixe): wrapper proprio `span.item-origins` como ULTIMO filho direto da grade `.item-names` (`justify-items:start`), em linha propria abaixo de `.item-name`/`.item-alt`; dentro dele um `span.item-origin[data-origin]` por origem, lado a lado (`display:flex; flex-wrap:wrap; gap:4px`). `.item-tag` fica intocado como filho direto de `.item-names` (texto, posicao e DOM iguais; a posicao dele e medida em `tests/e2e/items.spec.ts:72-76`); nenhum wrapper em volta de `.item-tag`. Liechi tera duas tags (Mutacao e Mundo) lado a lado no mesmo wrapper, quebrando linha se faltar espaco: validar 360/390 e EN.

## 6. Per-area identity

Pagina do item: painel branco (`--surface`), linhas em `--surface-2` com borda `--border`, icone em quadrado 36 `--secondary-soft`, titulo 13/800, texto 12.5/600 `--muted`, chips em pilula (`.biome` texto puro; `ItemLink`/`.mon-chip` com sprite e hover). Densidade media, cantos 12 (linha) e 18 (painel). Valores numericos em `<b>` (`--secondary`; green/blue `--primary`).

Listagem: card branco radius 18 com sombra; tile colorido por categoria (`cat-berry` #E4F3DB, `cat-bait` #DCEAF8, tema preto `#1F1D14`: unicos hex permitidos, ja existentes); tag de categoria 10/800 uppercase no topo do bloco de nomes; nome 15/800; alt 11/700 muted; descricao 2 linhas. Abas em underline (nao chip). Busca em pilula grande com sombra; toggle PT/EN em `.seg` pequeno. Identidade "compacta e escaneavel": nada novo pode competir com `.item-tag` nem inflar o card.

Temas (renderizados: classic, black, purple; green, blue, white, orange so por variavel): em black o card e `#111111`, `--secondary` e amarelo `#F5C518`, `--secondary-soft` `#3A3210`, texto `#F4F2EA`; tag e segmento ativo devem usar `--secondary`/`--on-secondary`/`--secondary-soft` para manter contraste. Verificacao por tema dos cards com duas tags e nova (RNF-03, RF-44).

## 7. Do / Don't

Do:
- `ItemLink` para todo nome de baga (parceiro, resultado); `Row`/`.ob-row` para linhas de informacao; nomes pelo `lang` do card (`useTermsLanguage`).
- Elementos novos com CLASSES PROPRIAS (ex.: prefixo `mut-` ou `origin-`), copiando a aparencia por CSS proprio (tag de origem espelha `.tag`; chips espelham `.biome`/`.bait-berry`).
- Reutilizar estilos existentes de chip, link e badge (`.biome`, `.bait-berry`, `.bait-badge`, `.tag`); filtro via `SegmentedControl`.
- So variaveis de tema; trocar `--secondary` por `--primary` em texto colorido de green/blue quando aplicavel.
- `t()` para todo texto, PT e EN; mobile em coluna unica com `flex-wrap`, `min-width:0`, `overflow-wrap:anywhere`.
- Tudo aditivo: nao remover nem reordenar nada existente.

Don't:
- Alterar texto ou posicao de `.item-tag` (categoria, "Berries", linha propria acima do nome), nem colocar a tag de origem dentro dele.
- Usar `mon-chip` (e de Pokemon) como visual de baga; usar `CappedList`/`.ob-more` para esconder pares (RF-08).
- Cores novas fora da paleta/variaveis (sem hex novo); travessao (em dash) em qualquer texto.
- Criar aba nova, nem chip solto no meio da grade; misturar o filtro com `TermsToggle`.
- Exibir tag de origem ou filtro para item que nao e baga.
- Mudar classes/atributos contados por e2e (`.ob-row`, `data-row`, `.item-card`, `[data-icat]`, `.item-tag`) de forma que quebre `tests/e2e/item.spec.ts`, `item-obtain-v2.spec.ts`, `items.spec.ts`.

## 8. Gaps

- O dataset publicado nao tem mutacoes: nao existe render de "Como cruzar", "Usada em cruzamento", "Encontrada no mundo", "Cresce melhor em", tag de origem nem filtro. As anatomias acima sao recomendacao a partir de padroes existentes; mostrar no navegador antes de aprovar (regra do Pontin).
- Paginas de Sitrus, Cheri, Liechi e Enigma capturadas so com o "Como obter" de hoje; o painel `UsedIn` ja tem a linha "Efeito", entao existe em todas as bagas.
- `.bait-badge` nao aparece nas paginas de baga capturadas (so em item com `bait.effects`); valores lidos do CSS (detail.css:209-211), nao de render.
- Temas green, blue, white e orange nao foram renderizados; tokens vem de `themes.css`. Contraste da tag por tema fica para testes.
- Sem captura de foco de teclado nem do card aberto com duas tags (nao existe ainda).
- Filtro de origem: decidido em `.item-top` em linha propria (padrao Pokebolas, `seg-tabs`); a variante mobile (faixa de largura total com scroll) segue mobile.css:28.
- `.vite/` (cache do dev server) segue sem versionar; `STATE_berry-mutations.md` aparece modificado por outro agente, nao por este.
