---
feature: spawn-bait
language: pt-BR
generated: 2026-09-29
status: uispec
reference_mode: [page:/pokemon/<id>, page:/item/<id>]
source: render-captured
---

# UISPEC spawn-bait (extensao do UISPEC_pontindex)

Extensao focada: painel "Onde encontrar" (`#where-panel`) + pagina do item. Tokens e inventario de `.forge/complete/pontindex/UISPEC_pontindex.md` continuam valendo; nada aqui os contradiz. O app e SPA sem URL por tela: navegacao via `useNavigationStore.navigate("detail", {dex})` / `("item", {itemId})` (capturas em dev, headless, tema `classic`).

## 1. Baseline (drift anchor)

HEAD `ff3a26b0` (branch feature/spawn-bait). Fingerprints (`git hash-object`, 12 chars):

| arquivo | hash |
|---|---|
| src/screens/Detail/WherePanel.tsx | eb0f3a69d560 |
| src/screens/Detail/detail.css | 0b35cdcf0f4f |
| src/screens/Detail/ItemLink.tsx | d34132bea534 |
| src/screens/Item/ItemScreen.tsx | 26f58b34768b |
| src/screens/Item/item.css | 21fd89b2e542 |
| src/styles/components.css | 20542c615719 |
| src/styles/tokens.css | 073a956328b6 |
| src/components/Badge.tsx | 6a6d5f74fcf7 |
| src/components/TermsToggle.tsx | 5a8cd90e2941 |
| src/components/ItemTile.tsx | 288f44b7c369 |
| src/screens/Items/ItemsScreen.tsx | 7e26276f00e1 |

## 2. Reference targets

Pasta: `.forge/ideas/spawn-bait/ui-refs/` (PNG; desktop 1280, mobile 390 = `-mobile`; `-en` = ingles, so desktop).

| alvo | rota (nav) | arquivos |
|---|---|---|
| Charizard (6: so terra, 2 spawns, 2 drops, obtain evolution+breeding) | detail dex 6 | `detail-where-charizard-{pt,en,pt-mobile}.png` |
| Magikarp (129: 46 spawns submerged/surface/fishing) | detail dex 129 | `detail-where-magikarp-fishing-{pt,en,pt-mobile}.png`, `detail-where-magikarp-expanded-pt.png` (apos "Mostrar todas") |
| Wooper (194: grounded+submerged+fishing, 32 spawns) | detail dex 194 | `detail-where-wooper-fishing-{pt,en,pt-mobile}.png` |
| Staryu (120: weightMultiplier noturno 1.5) | detail dex 120 | `detail-where-staryu-lure-{pt,en,pt-mobile}.png` |
| Sem spawn (1011, so evolucao) | detail dex 1011 | `detail-where-no-spawn-1011-{pt,en,pt-mobile}.png` |
| Poke Bait (categoria other, tag bait, craftable cooking_pot) | item `cobblemon:poke_bait` | `item-poke_bait-{pt,en,pt-mobile}.png` |
| Occa Berry, Lum Berry | item `cobblemon:occa_berry`, `cobblemon:lum_berry` | `item-occa_berry-*`, `item-lum_berry-*` |
| Item craftable (crafting_shaped) | item `cobblemon:ability_capsule` | `item-ability_capsule-craft-*` |
| Item com fogueira | item `cobblemon:roasted_leek` | `item-roasted_leek-campfire-*` |
| Lista Itens, aba "Iscas" | screen items, `[data-icat="bait"]` | `items-list-iscas-{pt,en,pt-mobile}.png` |

Nota: hoje nenhum item tem a rota "campfire_pot" na pagina (Poke-Lanche ainda nao esta no catalogo).

## 3. Design tokens (computados, tema classic)

Variaveis (`src/styles/tokens.css`, `themes.css`): `--surface #FFFFFF`, `--surface-2 #E6EFFA`, `--border #E4E7EF`, `--text #1C1F2B`, `--muted #6B7084`, `--primary #DC0A2D`, `--secondary #2A75BB`, `--secondary-soft #DCEBFA`, `--radius-md 12px`, `--radius-lg 18px`, `--shadow-sm`, `--ease-out`, `--font-display Fredoka`, `--font-body Nunito`. Temas green/blue trocam `.drop .pct` para `--primary` (detail.css:193): usar variaveis, nunca hex.

Painel (`.panel`, components.css:29-33): bg surface, borda 1px `--border`, radius 18, padding 18/20, h3 Fredoka 17/600 com barra `::before` 6x18 `--secondary`.

| elemento | valores computados | fonte |
|---|---|---|
| `.kv .k`, `.drops .k`, `.ob-head` (rotulo de bloco) | Nunito 11/800, uppercase, ls .88px, `--muted` | detail.css:175,194 |
| `.spawn-entry` | bg `--surface-2`, borda 1px `--border`, radius 12, pad 10/12, gap 8, `cardIn` com `--i` | detail.css:179 |
| `.spawn-head` | flex wrap gap 6/10, 13/700; `.spawn-ctx` 13/800 `--muted` | detail.css:180-181 |
| `.biome` (chip texto) | bg `--surface`, borda 1px `--border`, radius 999, pad 4/10, 12/800 | detail.css:183 |
| `.cond` (chip condicao) | bg `--secondary-soft`, radius 999, pad 4/10, 12/800, icone 14px | detail.css:184-185 |
| `.badge` | 11/800 uppercase ls .44, pad 3/9, radius 8; `.badge-sm` 9.5px pad 2/7 | components.css:101-108 |
| `.tag` | 10/800 uppercase, pad 2/7, radius 6, bg `--secondary-soft` | components.css:110 |
| `.drop` | grid `1fr auto`, gap 10, 13/800; `.pct` `--secondary`; `.drop-bar` 6px `--surface-2` com `i` `--secondary` | detail.css:186-193 |
| `.ob-row` | flex gap 12, pad 10/12, radius 12, bg `--surface-2`, borda 1px; hover translateX(3px) | detail.css:196-197 |
| `.ob-ico` | 36x36, radius 10, bg `--secondary-soft`, svg 18px | detail.css:198-199 |
| `.ob-title` / `.ob-text` | 13/800 / 12.5/600 `--muted` flex wrap gap 4/6 | detail.css:201-203 |
| `.ob-link` | pilula radius 999, borda 1.5px, pad 4/10/4/4, 12/800, hover sobe 2px e borda `--secondary` | detail.css:205-208 |
| `.ob-none` | linha com borda tracejada, icone em `--surface` | detail.css:209-210 |
| `.where` | grid gap 14; `.where + .obtain` margin-top 16, pad-top 14, borda superior 1.5px dashed `--border` | detail.css:172-173 |
| `.spawn-more` | `btn btn-ghost` pilula 14/800, pad 11/18, borda 1px | WherePanel.tsx:138 |
| Item `.item-hero` | pad 22/24, tile 140x140 radius 28, h2 Fredoka 30/600, desc 14/600 `--muted`; tile por `cat-<x>` (bait `#DCEAF8`, berry `#E4F3DB`) | item.css:9-21 |
| Item `.item-obtain` | panel com h3 "Como obter"; `.item-screen .ob-row` mesmas medidas | item.css:24-34 |
| Abas da lista | `.tabs button` 13/800, pad 8/14; ativa: cor `--text` + borda inferior 3px `--secondary` (e aba underline, nao chip) | components.css:127-129 |

## 4. Inventario de componentes (reusar)

| componente | onde | uso na feature |
|---|---|---|
| `Badge` | src/components/Badge.tsx:4 | "raridade"/"shiny" nos reforcos |
| `RarityBadge`, `RARITY_BADGE` | WherePanel.tsx:64, src/screens/Dex/PokemonCard.tsx:17 | selo de raridade |
| `ItemLink` (`className`, `size`) | src/screens/Detail/ItemLink.tsx:33 (`itemDisplayName` :19, `hasItemPage` :27) | todo nome de item clicavel (isca, baga, reforco); abre `navigate("item")`, tem `data-item`; id fora do catalogo vira texto sem link |
| `ItemTile` | src/components/ItemTile.tsx:17 | textura pixelada (ja dentro do ItemLink) |
| `TermsToggle cardKey="where"` | WherePanel.tsx:316, src/components/TermsToggle.tsx:15 | ja no cabecalho; bloco novo usa `useTermsLanguage("where")` |
| chips `.biome`, `.cond`, `.tag` | detail.css:183-184, components.css:110 | referencia visual de tipo/grupo de ovo |
| `ObtainRow` | WherePanel.tsx:186 | modelo de linha com icone |
| lucide-react direto | WherePanel.tsx:4 (ArrowUpCircle, Bone, Egg, Puzzle); `src/components/Icon.tsx` (Sparkles etc.) | Fish/Sparkles/Hammer |
| `SpawnList` colapso 6 | WherePanel.tsx:21,128 | nao alterar |
| Pagina item `Row` / `ObtainRow` | ItemScreen.tsx:141 / :155 (craftable :158, fishing :197) | linhas de efeito |
| `recipeLabels` | src/screens/Item/item-page-model.ts:118 (cooking_pot = "Panela de cozinha", campfire = "Fogueira") | rotulo de estacao |
| `CATEGORY_LABEL/CLASS`, aba Iscas (category bait OU tag bait) | src/screens/Items/item-model.ts:35,53,64-66 | Hoje Poke Bait mostra chip "Outros"; DECISAO da feature: poke_bait, poke_snack e os 7 itens de isca novos passam a categoria `bait` (chip "Iscas"), as bagas mantem a categoria delas e entram na aba pela tag |

Textos sempre por `t("chave")`; nomes de jogo pelo idioma do toggle do card (pt cai para en).

## 5. Layout e interacao

Painel `#where-panel` (`.panel.where-panel`, `--i:6`), de cima para baixo (WherePanel.tsx:313-336):
1. `.panel-head`: h3 "Onde encontrar (All the Mons)" + `TermsToggle` (PT/EN) a direita; em mobile o seg ocupa a linha toda.
2. `.where` (grid gap 14): `.kv.where-rarity` (rotulo "RARIDADE (SPAWN BUCKET)" + badge principal + secundarias `badge-sm`); `.spawn-list` (grid gap 8) com `.spawn-entry` (cabecalho: badge raridade, "Nivel N-M", contexto Terra/Submerso/Pesca; `.tag` de origem se nao cobblemon; linha de `.biome`; linha de `.cond` dia/noite/qualquer hora, ceu, luz); botao `.spawn-more` "Mostrar todas (N)" apos 6 (alterna "Mostrar menos"); depois `.drops` (rotulo DROPS; linhas `.drop`: tile 24px + nome clicavel + pct a direita + barra fina).
3. `.obtain` (separador tracejado): rotulo "COMO OBTER" + `.ob-list` de `.ob-row` (icone 36 + titulo + texto muted; evolution tem `.ob-link` com sprite a direita; none e tracejada).
- Sem spawn (1011): sem `.where`, so o Como obter.
- Carregamento: `useItems()` e `useBiomes()` assincronos; ItemLink com `items===null` renderiza como link (sem piscar).
- Animacao `cardIn` escalonada (`--i`, max 8 x 40ms): capturas esperam animacoes finitas.
- Mobile (`.app.mobile`, 390): `.ob-row` com `flex-wrap`, `.ob-link` recuado 48px; coluna unica.
- PT/EN: o toggle do card so muda nomes de jogo (biomas, itens); idioma da interface e global (`setUiLanguage`).
- Pagina do item: "Voltar" + TermsToggle no topo; `.item-hero` (tile pixelado, chip de categoria `badge badge-common`, h2, nome alternativo, descricao); `section.panel.item-obtain` (h3 "Como obter", `.ob-list`; Craftavel: icone Hammer + texto verde "Sim, tem receita (Panela de cozinha)"); `section.panel.item-used` (h3 "Usado em"). Listas longas com "e mais N" (`.biome.ob-more` tracejado).
- Lista Itens: abas underline; aba "Iscas" ja existe; cards com badge de categoria (ex. BERRIES), nome PT, nome EN, descricao.

## 6. Identidade por area

Area unica publica (sem admin, sem areas distintas): mesma identidade do tema escolhido.

Anatomia recomendada do bloco "Iscas" (dentro de `.where`, entre `.spawn-list` e `.drops`):

```
<div class="bait" data-bait>                 grid gap 8 (padrao de .drops)
  <span class="k">ISCAS</span>               tipografia do rotulo .k (11/800 uppercase muted)
  <div class="bait-row" data-bait-row>       visual de .spawn-entry (surface-2, borda, radius 12, pad 10/12, gap 8)
    linha 1: ItemLink (className "bait-name it-link", size 24) da isca + .tag "obrigatoria" quando houver
    linha 2: rotulo muted + ItemLink das 3 melhores bagas em pilula (estilo .ob-link/.mon-chip: borda 1.5px, radius 999)
    linha 3: chips estilo .biome (prefixo bait-chip) para tipo / grupo de ovo
    linha 4: reforcos genericos numa linha: ItemLink + Badge badge-sm "raridade"/"shiny", sem numeros
  </div>
</div>
```

Regras: cores so por variaveis (`--surface-2`, `--border`, `--secondary`, `--secondary-soft`); icone lucide (Fish, Sparkles) em quadrado 36px estilo `.ob-ico` se houver icone de linha; `cardIn` com `--i`; mobile com `flex-wrap` e `overflow-wrap:anywhere`, sem scroll horizontal.

Classes/atributos que o bloco NAO pode usar como marcacao (e2e em `tests/e2e/detail.spec.ts` ~413-470 conta dentro de `#where-panel`; CONTEXT sec. 7): `.spawn-entry`, `.spawn-more`, `.drop` e `[data-drop]`, `.where-rarity` (nao por Badge dentro dele), `.ob-none`, `.ob-link`, `[data-obtain]`, e `.biome`/`.badge`/`.tag` DENTRO de `.spawn-entry`. Tambem evitar `.badge-nospawn` e `.seal .badge`. Compartilhar aparencia por CSS proprio `.bait-*`, nao por essas classes. Usar `data-bait`, `data-bait-item`. Se usar `.biome` ou `.badge` fora de `.spawn-entry` e `.where-rarity` nao colide com os seletores listados, mas preferir prefixo `bait-`.

Pagina do item (efeitos): `Row`/`.ob-row` dentro de `section.panel` proprio (item.css escopa `.item-screen .ob-row`, entao as classes podem ser reutilizadas ali; conferir `tests/e2e/item*.spec.ts` antes). Valores em `<b>` com cor `--secondary` (como `.mon-chip b`). Textos do proprio jogo (pt/en do pack).

## 7. Do / Don't

Do: `ItemLink` para todo nome de item; nomes pelo `lang` do card; variaveis de tema; rotulos de bloco no estilo `.k`; linhas em `--surface-2` radius 12; mobile em coluna unica; textos em `t()`.

Don't: alterar `SpawnList` (colapso 6), `Drops`, `ObtainPanel` ou raridade; usar as classes contadas por e2e; usar hex (exceto o mapa `cat-*` existente); usar travessao; criar aba nova; mostrar "x10" nas bagas do painel; transformar a aba "Iscas" em chip.

## 8. Gaps / notas

- Renderizado ao vivo (Playwright headless, dev server). Tokens computados so do tema `classic`; green/blue derivam das variaveis (nao capturados).
- Nao existe hoje bloco de iscas nem item com receita campfire_pot (Poke-Lanche): a anatomia da secao 6 e recomendacao, sem referencia renderizada.
- Isca obrigatoria/multiplicadores de Lure ficam em `SpawnEntry.extra` e nao aparecem na UI atual (Wooper/Magikarp/Staryu so mostram nivel/bioma/condicoes).
- Capturas do painel usam viewport alto (1500/2400) para nao cortar o scroll interno; `detail-where-magikarp-expanded-pt.png` e 1280x4600.
- Rotulo "Fogueira" no item roasted_leek nao foi conferido visualmente no PNG.
