---
feature: pokemon-generation
language: pt-BR
generated: 2026-10-12
status: uispec
reference_mode: project-identity (Dex cards, Dex filters, Detail Hero, Detail EvolutionPanel, Detail WherePanel, Captured, Settings credits)
source: mixed
---

# UISPEC pokemon-generation

Identidade unica: a do Pontindex atual (tema `classic`, PT). A feature e aditiva: selo de geracao no card/Hero/estagios da evolucao, select "Jogo" nos filtros, bloco "Jogos" no Detail, credito PokeAPI em Configuracoes. Nada de visual novo: tudo compoe primitivos existentes. Capturas via Playwright headless, sem slowMo, sem sleeps, dev server Vite (porta 5173), navegacao por clique real (`[data-nav]`, busca da Home) como nos e2e. Estende `.forge/complete/berry-mutations/UISPEC_berry-mutations.md` (tokens por tema continuam validos; so `classic` foi re-renderizado aqui e bate com ele).

## 1. Baseline (drift anchor)

HEAD `b7ae68d78552` (branch feature/pokemon-generation). `git hash-object` (12 chars):

| arquivo | hash |
|---|---|
| src/screens/Dex/PokemonCard.tsx | 4fe29da94b56 |
| src/screens/Dex/DexGrid.tsx | 5d9f4df82dfe |
| src/screens/Dex/DexFilters.tsx | 1886ec2ea037 |
| src/screens/Dex/dex.css | a365cd9eebc4 |
| src/screens/Detail/HeroCard.tsx | b61c7bb5003c |
| src/screens/Detail/EvolutionPanel.tsx | 8ed5046bcc66 |
| src/screens/Detail/WherePanel.tsx | 024c72a96d55 |
| src/screens/Detail/detail.css | a6f3a9cb95d2 |
| src/screens/Captured/CapturedScreen.tsx | 91a1bea3718b |
| src/screens/Settings/AboutCard.tsx | bb96d7576fc6 |
| src/components/Badge.tsx | 6a6d5f74fcf7 |
| src/styles/components.css | 20542c615719 |
| src/styles/tokens.css | 073a956328b6 |
| src/styles/themes.css | ba927bad413f |
| src/styles/mobile.css | 813f2987640f |
| src/i18n/messages/settings.ts | d7c50978a0e8 |

(Os hashes de `WherePanel.tsx`, `CapturedScreen.tsx`, `AboutCard.tsx`, `Badge.tsx`, `components.css` e `settings.ts` nao constam no CONTEXT secao 0; `WherePanel.tsx` e o mais relevante.)

## 2. Reference targets

Pasta `.forge/ideas/pokemon-generation/ui-refs/` (PNG viewport/elemento, tema classic, PT salvo `-en`). Desktop 1366x768, phone 390x844 (`.app.mobile`).

| area | como se chegou | arquivos |
|---|---|---|
| 1. Cards da Dex | clique `[data-nav=dex]` | `dex-cards-desktop.png`, `dex-cards-phone.png` |
| 2. Filtros da Dex | idem, crop de `.filters` | `dex-filters-desktop.png`, `dex-filters-desktop-en.png`, `dex-filters-phone.png` |
| 3. Hero | busca da Home por numero | `detail-hero-mewtwo-desktop.png`, `detail-hero-mewtwo-phone.png` (lendario + Ultra-raro), `detail-hero-charizard-desktop.png`, `detail-hero-charizard-phone.png` (so raridade) |
| 4. Evolucoes | crop `#evo-panel` | `detail-evolution-zubat-{desktop,phone}.png` (linear Zubat > Golbat > Crobat), `detail-evolution-tyrogue-{desktop,phone}.png` (ramificada) |
| 5. Onde encontrar | crop `#where-panel` e `.where-rarity` | `detail-where-zubat-{desktop,phone}.png`, `detail-where-rarity-{desktop,phone}.png` |
| 6. Capturados | perfil semeado no IndexedDB (6 especies, mesmo metodo de `captured.spec.ts`) | `captured-desktop.png`, `captured-phone.png` |
| 7. Creditos | `[data-nav=settings]` (phone via "Mais"), crop `[data-card=about]` | `settings-credits-desktop.png`, `settings-credits-phone.png` |

## 3. Design tokens (computados, classic)

`:root` (renderizado): `--surface #FFFFFF`, `--surface-2 #E6EFFA`, `--border #E4E7EF`, `--text #1C1F2B`, `--muted #6B7084`, `--primary #DC0A2D`, `--secondary #2A75BB`, `--secondary-soft #DCEBFA`, `--on-secondary #FFFFFF`, `--radius-md 12px`, `--radius-lg 18px`, `--shadow-sm`, `--shadow-md`, `--font-display "Fredoka"`, `--font-body "Nunito"`. Demais temas: tabela do UISPEC berry-mutations secao 3.

| elemento | computado | fonte |
|---|---|---|
| `.badge` base | inline-flex, gap 5, pad 3/9, radius 8, 11/800 uppercase ls .04em, nowrap, `flex:none`; cores hex FIXAS por classe (nao seguem tema, salvo `badge-common` no tema black) | components.css:101-109 |
| `.badge-common` / `-uncommon` / `-rare` / `-ultra` | bg/cor: #E8E9EE/#4E5468; #DFF3E6/#1F7A46; #DDE9FB/#1F55B0; #EFE2FB/#6B2FB3 | components.css:102-105 |
| `.badge-legendary` / `-mythical` | gradiente #FFE27A>#FFB300 cor #4A3000 / #C79BFF>#7B5CFF cor #fff, glow `0 2px 8px`; icone Star/Sparkle 11px no card | components.css:106-107 |
| Badge no CARD (desktop) | 10/800, ls .02em (0.2px), pad 3/7, radius 8; altura 20; larguras: Comum 54.5, Incomum 65.4, Ultra-raro 82.0 | dex.css:25 (`.pcard-top .badge`, logo apos `.pcard-badges` na linha 24; icone svg 11px na 26) |
| Badge no CARD (phone) | 9/800, ls normal, pad 3/6, radius 8; altura 18; Comum 47.6, Ultra-raro 71.4 | dex.css:48 |
| `.pcard` | pad 12/12/14 (mobile 10), radius 18, 200x228 no desktop, gradiente por `g-<tipo>`; `.pcard-top` flex gap 6 (`dex-num` 10px `--muted` + `.pcard-badges` flex-wrap gap 4, justify flex-end); grade 2 colunas no mobile gap 10 | dex.css:8-54 |
| Badge no HERO (`.seal .badge`) | 11/800, pad 3/9, radius 8, sombra `0 2px 8px rgba(0,0,0,.18)`; `.seal` flex-wrap gap 6, `min-height 40`, `margin-right 44` (92 com botao de grito) | detail.css:40-42 |
| `.badge-sm` | 9.5px, pad 2/7 (chips secundarios de raridade no WherePanel) | detail.css:177 |
| `.filters` | bg `--surface`, borda 1px `--border`, radius 18, pad 14/16 (mobile 12), grid gap 12 | dex.css:62,68 |
| `.filter-group label` | 11/800 uppercase ls .08em (0.88px) `--muted` | dex.css:64 |
| `.filter-row select` (`#f-gen`) | 13/700, pad 9/12, radius 10, borda 1px `--border`, bg `--surface-2`, cor `--text`, altura 40, `width:100%` | dex.css:66 |
| `.filter-row` | desktop grid 4 colunas `1fr 1fr 1fr auto` gap 12 (231,7/231,7/231,7/292,9); phone `1fr 1fr` (160/160), `.filter-seg` ocupa a linha toda | dex.css:65,69-70 |
| `.evo` (EvoNode) | grid, justify center, gap 4, pad 10/12, radius `--radius-md`; `.current` bg `--secondary-soft`; caixa 108x126, imagem 84x84; `.evo-name` 13/800 | detail.css:110-116 |
| `.method` (MethodChip) | 11/800, pad 2/8, radius 999, bg `--surface-2`, borda 1px `--border`, cor `--muted` | detail.css:120 e :136 (em `.evo-edge`: pad 3/9, white-space normal) |
| `.panel` | bg `--surface`, borda 1px `--border`, radius 18, pad 18/20, `--shadow-sm`; h3 Fredoka 17/600 ls .17px + barra `::before` `--secondary` | components.css:498-500 |
| `.where-rarity` | `.kv` grid gap 6; `.k` 11/800 uppercase ls .08em `--muted`; `.chips` flex-wrap gap 6 com `RarityBadge` (11px, 21 de altura) e secundarios `badge-sm` | detail.css:174-176, WherePanel.tsx:341 |
| `.card-info` (Configuracoes) | grid gap 8, 13/700 `--muted`; titulo `--text`; cada linha `.info-line` = `.dot` + `<span>` | settings.css:24-25, AboutCard.tsx:12 |

**Selo de geracao (decisao do orquestrador): classe nova `badge-gen`**, so com variaveis de tema: bg `--secondary-soft`, texto `--text`; metricas do `.badge` do contexto (card desktop 10/800 pad 3/7 h20; card phone 9/800 pad 3/6 h18; Hero `.seal .badge` 11/800 pad 3/9). Como usa variaveis, o contraste segue o tema; a implementacao DEVE conferir contraste >= 4.5:1 de `--text` sobre `--secondary-soft` nos 4 temas (valores do UISPEC berry-mutations secao 3): classic `#1C1F2B` sobre `#DCEBFA`; black `#F4F2EA` sobre `#3A3210`; purple `#221A36` sobre `#FFE1EF`; green `#1E2A22` sobre `#E6F2E9` (blue `#182033`/`#E3E8F1`, white `#1C1F2B`/`#FBE1E6`, orange `#24201C`/`#DEE3F0`, se os 7 temas forem cobertos).

## 4. Component inventory (reuse)

- `Badge` (`src/components/Badge.tsx`) + `.badge` (components.css:101): primitivo de selo. `SpeciesBadges` (`PokemonCard.tsx:32`) e usado por card, Capturados (via `DexGrid`) e Hero.
- **Selo de geracao: construido a partir de `Badge`/`.badge`, com o MESMO tamanho, radius e fonte do selo de raridade que ele substitui no card** (card: 10/800 pad 3/7 radius 8, h 20; phone 9/800 pad 3/6, h 18; Hero: 11/800 pad 3/9). Nao criar elemento fora de `.pcard-badges` / `.seal`. Cor: classe `badge-gen` (secao 3), `--secondary-soft` + `--text`, sem hex novo. Cuidado: `pokemon-card.test.tsx:60` assere zero `[class*="badge-"]` no card sem raridade, e `detail.spec.ts:82` conta 1 `.seal .badge` no Charizard.
- `genLabel` (`DexFilters.tsx`) e a forma longa ("Geracao N"); o selo curto ("Gen 1") precisa de chave i18n propria.
- **Select "Jogo": IRMAO de `#f-gen`**, id `#f-game`, no mesmo `.filter-row`, em um `.filter-group` com `<label htmlFor>` + `<select>` (label 11/800 uppercase `--muted`; select 13/700, pad 9/12, radius 10, h40, bg `--surface-2`, borda 1px `--border`). Layout: desktop `.filter-row` passa a `1fr 1fr 1fr 1fr auto` com ordem Geracao, Jogo (logo apos `#f-gen`), Evolucao, Ordenar, Status. Phone: continua 2 colunas; Jogo fica ao lado de Geracao na primeira linha, Evolucao/Ordenar na segunda, `.filter-seg` (Status) mantem a linha inteira.
- **Painel "Jogos": segue o scaffolding de `WherePanel`** e entra logo apos `weak` (Fraquezas) e antes de `evo`. Nova ordem e `--i`: stats 1, weak 2, **games 3**, evo 4, abilities 5, moves 6, where 7, best 8, forms 9, calc 10 (`BaitBlock` usa `--i:7` mas e interno ao where, nao e painel). Revisao 2026-10-12 (commit ccf49cb4): painel movido para depois de weak a pedido do usuario; ordem e `--i`: stats 1, weak 2, games 3, evo 4, abilities 5, moves 6, where 7, best 8, forms 9, calc 10. Antes: logo apos `where`, `--i` 7.
  - (a) Normal: `<div className="panel games-panel" id="games-panel">` > `.panel-head` > `h3` "Jogos"; depois `.kv` com `.k` "Disponivel em" + `<ul className="chips games-list">` com um `<li>` por jogo em ordem cronologica (`order` do version-group). Chip = aparencia de `.method`: 11/800, pad 2/8, radius 999, bg `--surface-2`, borda 1px `--border`, cor `--text` (nome do jogo, ex. "FireRed / LeafGreen"). Lista semantica `ul/li` (RNF-05); `.chips` ja e flex-wrap gap 6 (zerar `list-style`/padding do `ul`).
  - (b) Nota da National Dex: sempre sob a lista, `<p className="games-note">` com a tipografia do `.k` (11/800 uppercase `--muted` ls .08em), texto i18n "Lista pela Pokedex regional de cada jogo; a National Dex do pos-jogo nao entra".
  - (c) Especie oficial sem jogos: linha unica `<p className="muted">` "Nao aparece nos jogos oficiais" (padrao `p.muted` ja usado em `EvolutionPanel`, `evo-none`; `EmptyState` e de tela/lista, nao de painel).
  - (d) Especie custom: mesmo layout de (c) com "So no pack". A nota (b) nao aparece em (c) e (d).
- **Marcador de geracao no `EvoNode` (revisado, D1/D2 aceitos):** selo EM FLUXO logo ABAIXO de `.evo-name`, dentro do `.evo` existente (nao e overlay: `tests/e2e/detail.spec.ts:306-318` usa o harness no-overlap, que trata `img` como controle, entao texto sobre o sprite reprovaria o teste existente, e asserts nao se afrouxam). Classe `evo-gen`, metricas do selo do card no phone (9/800, pad 3/6, h18, radius 8, base `badge-gen`). O no cresce cerca de 22px em altura: caixa esperada ~108x148 no desktop (largura 108 mantida); no phone (ramo `.evo-branch .evo > img` 52px) o selo tambem fica abaixo do nome. Quando a geracao do estagio difere da da RAIZ da cadeia: classe extra `evo-gen-diff`, outline de 2px em `--secondary` por padrao, trocando para `--primary` SOMENTE nos temas green, blue e purple (onde `--secondary` medido contra o fundo do no da 1.22, 1.6 e 2.57:1); com essa regra o outline fica >= 3.5:1 nos 7 temas (`--primary` em todos os temas falharia em black #17171C sobre #111111 e white #F7F7FA sobre #FFFFFF) e nome acessivel ("Geracao 2, diferente da base" / "Generation 2, different from the base"), para o sinal nao depender so de cor. Resultado esperado: Zubat (raiz Gen 1), Golbat Gen 1, Crobat Gen 2 destacado; Tyrogue (raiz Gen 2): Hitmonlee Gen 1 e Hitmonchan Gen 1 destacados, Hitmontop Gen 2 sem destaque; Pichu (raiz Gen 2) > Pikachu Gen 1 > Raichu Gen 1, os dois estagios gen1 destacados. Os resultados esperados sempre derivam da `generation` de cada estagio no dataset, nunca de lista escrita a mao. A geracao do estagio vem no JSON de detalhe da especie (os nos de `evolutionChain` carregam `generation`), entao o selo renderiza ja no primeiro paint, sem lookup no indice e sem placeholder.
- **Ordem dos selos no Hero (`.seal`):** especial (Lendario/Mitico), depois geracao, depois raridade (SPEC, suposicao A6).
- `MethodChip`/`.method` e `ItemLink`: nao mudam.
- Credito: adicionar um `InfoLine` irmao em `AboutCard.tsx`, logo apos o de `settings.images`, com chave i18n nova `settings.pokeapi` (PT/EN em `settings.ts`); NAO editar o texto existente de `settings.images` ("Imagens: PokeAPI (online)", `settings.ts:19`). Sem componente novo.
- i18n: `useT()`; chaves `modulo.chave` com `{ pt, en }` em `src/i18n/messages/{dex,detail,settings}.ts`.

## 5. Layout & interaction patterns

- Card (`.pcard`, grade `auto-fill minmax(200px,1fr)`, 2 colunas no mobile): `.pcard-top` (dex-num a esquerda, `.pcard-badges` flex-wrap a direita, gap 4) > `.pcard-art` > `.pcard-name` > `.pcard-types`. No phone um card ja mostra "Ultra-raro" de 71px ao lado de `#0001`; Mewtwo mostra Lendario + raridade (quebra para segunda linha dentro de `.pcard-badges`). O selo de geracao entra no lugar da raridade, entao a carga de largura nao cresce no caso comum; no caso Lendario/Mitico sao dois selos como hoje.
- Capturados reusa `DexGrid`/`PokemonCard` (`captured-*.png`): mesmo selo, com `footer` (data + desmarcar).
- Filtros: sempre visiveis (nao recolhidos). Desktop 1 linha de 4 colunas (passa a 5 com Jogo, ver secao 4) apos a linha de tipos (`#f-type-label` / `filter-types`); phone: tipos (chips com scroll horizontal), depois grade 2 colunas (Geracao, Evolucao / Ordenar), Status em linha inteira (`.seg`). Opcao do `#f-gen` hoje: Todos, Geracao 1..9, 7b, 8a, "Do pack (All the Mons)".
- Detail (coluna de `.panel`s, ordem atual stats, weak, evo, abilities, moves, where, best, forms, calc; com a feature `games` entra apos `weak`, revisao 2026-10-12): Hero (`.hero-card g-<tipo>`, `.seal` acima de `.hero-title`), depois paineis. Hero legendario muda para `hero-legendary` (gradiente proprio); selos ficam sobre ele com sombra.
- Evolucoes: linear (`.evo-chain` flex wrap center, `.evo` > seta + `.method`) ou ramificada (`.evo-branching` grid `auto 1fr`; no mobile 1 coluna, `.evo-edge` wrap).
- Onde encontrar: `.panel-head` (h3 + `TermsToggle` PT/EN) > `.where` (`.kv.where-rarity`, `SpawnList`, `BaitBlock` `.bait*`, `Drops`) > `ObtainPanel`. Idioma por painel via `TermsToggle`; idioma global no `.tgl-lang` (`dex-filters-desktop-en.png` mostra os rotulos em EN).
- Carregamento/vazio: o `speciesIndex` e carregado antes da Dex renderizar (boot `.boot`); estado vazio da Dex usa `EmptyState`.
- Animacao: `cardIn` com `--i` (45ms por passo no card); esperar so animacoes finitas nas capturas.

## 6. Identidade por area

Identidade unica em todas as areas (classic: azul `--secondary`, fundo `--surface`, cantos 12/18, Fredoka em titulos, Nunito 11-13px nos rotulos). Os selos sao a unica exceção cromatica: usam hex fixos por classe de raridade, nao variaveis de tema (ja assim hoje).

## 7. Do / Don't

Do:
- Construir o selo de geracao com `Badge`/`.badge`, mesmas metricas do selo que substitui (card 10px/9px mobile, Hero 11px).
- `#f-game` como `.filter-group` irmao de `#f-gen`; mesmas regras `.filter-row select`.
- Painel "Jogos" com `.panel`/`.panel-head`/`.kv`/`ul.chips`, `--i` 3 logo apos weak e deslocar evo/abilities/moves/where (revisao 2026-10-12; antes `--i` 7 apos where).
- Variaveis de tema para cores novas; `flex-wrap`, `min-width:0`, `overflow-wrap:anywhere` no mobile.
- Texto via `t()` PT/EN; credito PokeAPI em `settings.ts` + `AboutCard`.
- Rodar `responsive.spec.ts` (badges intactos, sem sobreposicao) em Home, Dex, Detail Mewtwo e Captured.

Don't:
- Pintar texto sobre o sprite do `EvoNode` (o no cresce ~22px para o selo abaixo do nome, ~108x148; a largura de 108 nao muda) nem aumentar a altura do card; nao quebrar texto de selo em duas linhas (`white-space: nowrap` do `.badge`).
- Remover a raridade do Hero/WherePanel ao tirar do card (hoje `SpeciesBadges` serve card e Hero; precisa separar).
- Cor nova em hex fora da paleta existente; travessao (em dash) em qualquer texto.
- Chip solto ou aba nova; tocar `.where-rarity` ou `.badge-legendary`/`-mythical`.
- Ajustar os asserts existentes ao novo comportamento (ex.: `detail.spec.ts:82` passa de 1 para 2 selos no Hero do Charizard), nunca afrouxar.

## 8. Gaps / fallback notes

- Source `mixed`. Code-derived, exceto o render: temas nao-classic (tabela do UISPEC berry-mutations), `.info-line` (computed nao extraido; valores de `settings.css:24-25`), card do Mewtwo (so o Hero foi capturado; grade virtualizada, `dex-card-mewtwo-*.png` nao gerado), `.badge-sm` e `.badge-nospawn` (lidos do CSS). Todo o resto foi renderizado.
- O app e SPA sem URL por tela: navegacao por clique, nao por rota.
- Capturados semeado com 6 especies via IndexedDB (dado local, sem PII). `.vite/` segue sem versionar.
- Dev server (porta 5173) iniciado por este agente foi encerrado.
