---
feature: pontindex
language: pt-BR
generated: 2026-09-23
status: uispec
reference_mode: page:design/prototipo/index.html (prototipo v9 aprovado)
source: render-captured
---

# UISPEC - Pontindex

Contrato de identidade visual extraído do protótipo v9 aprovado (`design/prototipo/`), renderizado de verdade no navegador (Playwright, Chromium, `headless:false`) e servido localmente a partir de `design/` como raiz (`npx http-server design -p 5599`, abrindo `/prototipo/index.html`). Nenhum valor de cor, tipografia, espaçamento ou animação abaixo foi adivinhado: todos vêm da leitura direta de `style.css`/`app.js` ou de `getComputedStyle` no protótipo rodando (ver Seção 1 e capturas em `ui-refs/`).

**Changelog desta versão**: revisão pós-publicação corrigiu um bug de captura (servidor estático estava servindo `design/prototipo/` como raiz em vez de `design/`, quebrando todo `../pokebola.webp` e `../tipos/svg/*.svg` referenciado com caminho relativo ao pai - pokébola e ícones de tipo apareciam ausentes/quebrados em 100% das capturas anteriores); todas as 50 capturas foram refeitas do zero com a raiz corrigida e com checagem automática de asset quebrado (0 requests 4xx/5xx, 0 `<img>` com `naturalWidth 0` na rodada final). Também corrigidos: contagem de capturas na Seção 2, tabela de tokens por tema na Seção 3.3 (colunas que faltavam), terminologia `rarity`(protótipo)/`label`(dataset real) nas Seções 3.5 e 5, ordem real da animação de captura (fundo aparece ANTES da bola cair, não depois) explicitada na Seção 5, e pequenos erros de linha/atributo (`pcard()`, `.mono` vs `.dex-num`).

## 1. Baseline (âncora de drift)

- HEAD no momento desta captura: `fe314dbbe8ac79104ed5b6f04f65c0a1e41afc67` (branch `feature/pontindex`; confirmado com `git rev-parse HEAD` e `git status` limpo). Nota: o PRD/CONTEXT foram commitados como `fe314db` durante o próprio Stage 2, avançando o HEAD que aparecia em CONTEXT/PRD (`5700491`); nenhum arquivo de `design/` mudou entre um commit e outro (hashes idênticos, reconferidos abaixo).
- Hashes de blob confirmados agora com `git hash-object` (idênticos aos já registrados em CONTEXT/PRD, reverificados nesta sessão):
  - `design/prototipo/index.html` - `be69b2b8b467356c0afdf437b025c2a98762f888`
  - `design/prototipo/style.css` - `b836a3eb99cbb7f4ab9effb3bc36774bcb0ef55d`
  - `design/prototipo/app.js` - `09293df62796fd54a02d93536eef4fad82de0ccd`
  - `design/prototipo/LEIA-ME.txt` - `92e9f611d8d7b1f4d698700b51b76ed29eca5b30`
  - `design/tipos/cores.json` - `e9eccf58f159b2ffebccedca547bfeaf312b4cff`
  - `design/tipos/preview.html` - `74c515d22dcff17ccb90fba77cf6cd0723550ba6`
  - `design/referencias/LEIA-ME.txt` - `172b3cd208ab89555eebf99e5ccf7471e8719905`
  - `design/referencias/card-pokemon-gradiente.png` - `008642cc3422439ec2511f6d7f2a1821af8abf61`
  - `design/capture/bg-lendario.avif` - `8ffe4c18830c24a1a5af9c32fd252c41e6fd8b17`
  - `design/capture/bg-mitico.avif` - `dcb6ecff0976671d7f2181edfdebfa26813a981e`
  - `design/capture/bg-outros.avif` - `ef44bda8798dfd4f6905ddd5d3af973bf97e3709`
  - `design/pokebola.webp` - `3d5f2ac4309c797d9baef4b4ea31f7b6aef38691`
- Método de captura: servidor estático local (`http-server` na porta 5599) servindo **`design/`** como raiz (não `design/prototipo/`), abrindo `http://127.0.0.1:5599/prototipo/index.html` - correção necessária porque o protótipo referencia caminhos relativos ao pai (`../pokebola.webp` em `index.html:24,32,44,91,162,244,266` e `app.js:688,952`; `../tipos/svg/${type}.svg` em `app.js:675`), que retornam 404 se `design/prototipo/` for servido como raiz. Uma primeira rodada de captura usou a raiz errada e foi descartada e refeita por inteiro após esse diagnóstico. Playwright/Chromium (`chromium.launch({ headless: false, slowMo: 0 })`, visível) navegou pelo protótipo real e tirou screenshots (`page.screenshot`); cada captura só foi salva depois de esperar todo `<img>` da tela terminar de carregar (`img.complete`) e confirmar `naturalWidth > 0`, e a rodada final não registrou nenhum request HTTP com status 4xx/5xx nem nenhuma imagem quebrada (0 de 0). Os design tokens de cor por tema foram reconferidos com `getComputedStyle(document.documentElement)` em tempo de execução; o resultado bruto está salvo em `ui-refs/tokens.json` (batendo 100% com os valores lidos diretamente de `style.css:62-125`).

## 2. Alvos de referência (áreas capturadas)

50 arquivos em `<FEATURE_DIR>/ui-refs/` (gitignored, não versionado): 16 desktop + 12 temas + 14 animação de captura + 8 mobile = 50 imagens, mais `tokens.json` (dump bruto de `getComputedStyle`, ver Seção 1). Convenção de nome: `<escopo>-<tela>[-<variação>][-full].png`. `-full` = `fullPage` (inclui conteúdo abaixo da dobra).

**Desktop 1280x800, tema Clássico** (16 arquivos):
- `desktop-home.png` - Início (hero de busca, capturados, time, histórico).
- `desktop-dex-grid.png` - Grade da Pokédex com filtros.
- `desktop-detail-charizard-full.png` - Ficha de espécie normal (Charizard #6, Fogo/Voador, raridade "Raro").
- `desktop-detail-charizard-moves-tm.png` - Aba de golpes, sub-aba TM.
- `desktop-detail-charizard-resistances.png` - Painel Fraquezas & Resistências filtrado em "Resistências".
- `desktop-detail-charizard-mega-x-form.png` - Aba de formas, Mega X (item de ativação clicável).
- `desktop-detail-mewtwo-legendary-full.png` - Ficha Lendário (Mewtwo #150): card hero dourado metálico, selos "LENDÁRIO" + raridade juntos.
- `desktop-detail-mew-mythical-full.png` - Ficha Mítico (Mew #151): card hero roxo->azul com brilho ciano.
- `desktop-captured-list.png` - Lista de Capturados (contador "X de 1.025" no protótipo, abas de filtro).
- `desktop-compare.png` - Comparar dois Pokémon lado a lado.
- `desktop-trainers.png` / `desktop-trainers-expanded-full.png` - Treinadores: stepper por série com cap, item expandido (time completo, item de spawn, mochila).
- `desktop-balls-full.png` - Grade de Pokébolas + "Melhor Pokébola".
- `desktop-items-grid.png` / `desktop-item-page-full.png` - Grade de Itens & Comidas e página individual de item (Poção).
- `desktop-settings-full.png` - Configurações (grade de 7 temas, idioma, som, reduzir animações, info de dados).

**Temas (desktop, Home + Ficha do Charizard em cada tema não-Clássico)** (12 arquivos):
- `theme-preto-home.png`, `theme-preto-detail-charizard.png`
- `theme-verde-home.png`, `theme-verde-detail-charizard.png`
- `theme-azul-home.png`, `theme-azul-detail-charizard.png`
- `theme-roxo-home.png`, `theme-roxo-detail-charizard.png`
- `theme-branco-home.png`, `theme-branco-detail-charizard.png`
- `theme-laranja-home.png`, `theme-laranja-detail-charizard.png`
(Clássico já coberto nas capturas desktop acima; 7 de 7 temas cobertos ao todo.)

**Animação de captura** (14 arquivos, 3 categorias de fundo por raridade):
- `capture-outros-01-start.png` a `-08-final-reveal.png` (Charizard, fundo "Outros"/azul: tela preta -> fundo -> bola caindo -> balançando -> abrindo/burst -> silhueta crescendo -> flash -> revelação com nome).
- `capture-legendario-01-bg-ball.png`, `-02-silhouette-grow.png`, `-03-final-reveal.png` (Mewtwo, fundo dourado com raios e relâmpagos).
- `capture-mitico-01-bg-ball.png`, `-02-silhouette-grow.png`, `-03-final-reveal.png` (Mew, fundo roxo/azul com brilho ciano e faíscas).

**Mobile 390x844, tema Clássico** (8 arquivos):
- `mobile-boot-lid-closed.png` - Tampa fechada da Pokédex no boot (lente + LEDs no topo, "Pontindex / Carregando dados..." embaixo) - captura a ~0,25s de `domcontentloaded`, dentro da janela 0-1,4s antes de a tampa começar a deslizar.
- `mobile-boot-splash.png` - Mesma tampa fechada, ~1,15s depois (ainda dentro da janela 0-1,4s, LEDs em outra fase do piscar `ledBlink`). Nota: tentamos por 3 abordagens diferentes capturar o exato instante de deslize da tampa (janela 1,4-2,1s, `lidUp`/`lidDown`), mas o tempo de carregamento do script externo do Lucide (`cdn.jsdelivr.net`, bloqueante, carregado em `<head>` antes do corpo) varia demais entre execuções (rede fria vs. quente) para acertar essa janela de forma confiável sem também quebrar os ícones Lucide da tela revelada logo depois; optamos por duas capturas da tampa fechada, garantidamente corretas, em vez de arriscar uma captura de transição instável. Ver Gaps (Seção 8).
- `mobile-home.png`, `mobile-dex-grid.png`, `mobile-captured.png`
- `mobile-detail-charizard-full.png` - shell "aparelho" (moldura com lente/LEDs no topo) + tab bar inferior com botão-bola central para Capturados.
- `mobile-nav-mais-sheet.png` - bottom sheet "Mais" (Treinadores/Pokébolas/Itens/Configurações) sobre a Dex.
- `mobile-settings.png` - Configurações no layout mobile.

## 3. Design tokens (valores concretos, por tema)

### 3.1 Tipografia
- Display/títulos: `Fredoka` (pesos 400/500/600/700), fallback `Nunito, system-ui, sans-serif`. `h1`=34px/line-height 1.1 (26px mobile), `h2`=26px (22px mobile), `h3`=17px, peso 600, `letter-spacing:.01em`.
- Corpo: `Nunito` (pesos 400/600/700/800), fallback `system-ui, sans-serif`. Confirmado via `getComputedStyle(document.body).fontFamily` = `"Nunito, system-ui, sans-serif"`.
- Pixel/monoespaçada: `Silkscreen`, fallback `monospace`, `font-size:10px` em ambos os usos, mas com `letter-spacing` distinto por classe: `.mono` (`style.css:172`) = `letter-spacing:.05em`; `.dex-num` (número da Dex nos cards/ficha, `style.css:338`) = `letter-spacing:.06em` + `color: var(--muted)`.

### 3.2 Espaçamento e forma
- Radius: `--radius-xl:24px`, `--radius-lg:18px` (cards, painéis), `--radius-md:12px` (chips grandes, botões internos), `--radius-sm:8px`.
- Sombras: `--shadow-sm: 0 1px 2px rgba(15,20,40,.06), 0 2px 8px rgba(15,20,40,.06)`; `--shadow-md: 0 6px 18px rgba(15,20,40,.10), 0 2px 4px rgba(15,20,40,.05)`; `--shadow-lg: 0 18px 40px rgba(15,20,40,.18)`.
- Easings: `--ease-out: cubic-bezier(.2,.8,.2,1)`; `--ease-bounce: cubic-bezier(.34,1.56,.64,1)`. Duração padrão de transição: `--dur:.35s`.
- Grid da Dex/Capturados: `grid-template-columns: repeat(auto-fill, minmax(200px,1fr))` desktop, `repeat(2,1fr)` mobile. Grid de itens: `minmax(280px,1fr)`. Grid de bolas: `minmax(250px,1fr)`.
- Breakpoints: mobile ligado por `max-width:900px` (fallback de media query, independente do JS) e reforçado por classe `.app.mobile`/`body.phone` (JS `updateLayout()`, `window.resize`); layout largo extra em `min-width:1500px` (grid mais espaçoso, `.detail` 420px+1fr).

### 3.3 Paleta por tema (confirmada via `getComputedStyle`, 7 temas)

| Tema | primary | primary-dark | secondary | secondary-soft | accent | screen (fundo da área de conteúdo) | surface (card) | surface-2 | text | muted | border | scroll-thumb |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| classico (padrão) | #DC0A2D | #A50722 | #2A75BB | #DCEBFA | #FFCB05 | #B0CDF3 | #FFFFFF | #E6EFFA | #1C1F2B | #6B7084 | #E4E7EF | #DC0A2D |
| preto | #17171C | #0B0B0E | #F5C518 | #3A3210 | #F5C518 | #2A2410 | **#111111 (cards pretos, RF-80)** | #1C1B15 | #F4F2EA | #B3AE9C | #3D3820 | #F5C518 |
| verde | #2F8F5B | #21683F | #F2E8CF | #E6F2E9 | #F2E8CF | #E4D8B3 | #FFFFFF | #F3EEDD | #1E2A22 | #66756B | #DDE5DA | #2F8F5B |
| azul | #1F5FBF | #154488 | #C6CCD6 | #E3E8F1 | #D8DEE8 | #C3CAD8 | #FFFFFF | #EDF0F5 | #182033 | #66708A | #DCE2EE | #1F5FBF |
| roxo | #6A3FC9 | #4B2B93 | #FF6FB1 | #FFE1EF | #FF6FB1 | #F7BFD8 | #FFFFFF | #FCEAF2 | #221A36 | #73688F | #E5DFF2 | #6A3FC9 |
| branco | #F7F7FA | #E4E4EA | #DC0A2D | #FBE1E6 | #DC0A2D | #F3B9C3 | #FFFFFF | #FBE9EC | #1C1F2B | #6B7084 | #E1E3EA | #DC0A2D |
| laranja | #F0762B | #BE5716 | #1E2A4A | #DEE3F0 | #1E2A4A | #B9C5E3 | #FFFFFF | #EAEEF7 | #24201C | #7A7069 | #EAE3DB | #F0762B |

`--wm-opacity` (marca d'água) = `.03` em todos os temas, exceto `preto` = `.04`. `--lens` (cor da lente/aparelho) varia por tema (ex.: `#4FB2FF` clássico, `#F5C518` preto). `--shell-text` = cor do texto sobre a carcaça (sidebar/topbar), `--on-primary`/`--on-secondary`/`--on-accent` seguem a regra de contraste AA de cada tema (ex. preto usa amarelo `#F5C518` como texto sobre a carcaça escura).

Tabela completa da carcaça/aparelho e cores de contraste (`style.css:62-123`, reconferida via `getComputedStyle` em `ui-refs/tokens.json`):

| Tema | on-primary | on-secondary | on-accent | lens | shell-text | nav-active | scroll-thumb-hover |
|---|---|---|---|---|---|---|---|
| classico | #FFFFFF | #FFFFFF | #2B2200 | #4FB2FF | #FFFFFF | rgba(255,255,255,.18) | #A50722 |
| preto | #F5C518 | #1A1400 | #1A1400 | #F5C518 | #F5C518 | rgba(245,197,24,.16) | #D9AD10 |
| verde | #FFFFFF | #2B3A2E | #2B3A2E | #F2E8CF | #FFFFFF | rgba(255,255,255,.18) | #21683F |
| azul | #FFFFFF | #1B2230 | #1B2230 | #D8DEE8 | #FFFFFF | rgba(255,255,255,.18) | #154488 |
| roxo | #FFFFFF | #3A0F26 | #3A0F26 | #FF8FC5 | #FFFFFF | rgba(255,255,255,.18) | #4B2B93 |
| branco | #1C1F2B | #FFFFFF | #FFFFFF | #DC0A2D | #1C1F2B | rgba(220,10,45,.10) | #A50722 |
| laranja | #FFFFFF | #FFFFFF | #FFFFFF | #A9C4FF | #FFFFFF | rgba(255,255,255,.2) | #BE5716 |

`sidebar`/`topbar` = `linear-gradient(180deg/120deg, var(--primary), var(--primary-dark))`. `scrollbar-thumb` = `var(--scroll-thumb)` (RNF-08), sem trilho (transparente), 8px, `border-radius:8px`.

### 3.4 Paleta por tipo (18 tipos, fonte única `design/tipos/cores.json`, espelhada em `--t-<tipo>` e `--type-<tipo>-a/b`)

| Tipo | base (ícone/circulo) | a (gradiente) | b (gradiente) |
|---|---|---|---|
| fire | #fba54c | #ff5a00 | #ffd000 |
| water | #539ddf | #0066ff | #00e5ff |
| grass | #5fbd58 | #00b34a | #b6ff2e |
| electric | #f2d94e | #ffb300 | #fff200 |
| ice | #75d0c1 | #00c2ff | #c8fbff |
| psychic | #fa8581 | #ff2d7a | #ff9ec4 |
| ghost | #5f6dbc | #4b2bd6 | #a06bff |
| dragon | #0c69c8 | #1a2dff | #5ce1ff |
| dark | #595761 | #23233a | #6b6b9e |
| fairy | #ee90e6 | #ff4fd8 | #ffc2f2 |
| fighting | #d3425f | #e6003d | #ff7a3d |
| poison | #b763cf | #8a1fff | #e55cff |
| ground | #da7c4d | #d96a00 | #ffcc66 |
| rock | #c9bb8a | #a88a2a | #e6cf7a |
| bug | #92bc2c | #5fd400 | #d4ff3d |
| steel | #5695a3 | #2f7fa6 | #9be3ff |
| flying | #a1bbec | #3d8bff | #b3e0ff |
| normal | #a0a29f | #8a8a8a | #dcdcdc |

Uso do par `a`/`b` (RF-117, um único par por tipo em 3 contextos): (1) gradiente do card hero da ficha (classe `.g-<tipo>`, `linear-gradient(160deg, a 0%, b 100%)`); (2) chip de tipo (classe `.t-<tipo>`, `linear-gradient(135deg, a 0%, color-mix(a 40%, b) 100%)`); (3) tinta dos cards compactos (pcard, história, capturados) via `--tc`/`--g1`/`--g2` inline. Ícone de tipo dentro do chip/ficha: círculo de fundo `color-mix(in srgb, g1 82%, #000)` com o SVG branco de `design/tipos/svg/<tipo>.svg` a 60% de tamanho.

### 3.5 Cards especiais Lendário/Mítico (RF-118)
Nota de terminologia (mesmo campo usado na Seção 5 para o fundo de captura): a classe `hero-legendary`/`hero-mythical` do card e a escolha de fundo da animação de captura são aplicadas a partir do mesmo campo (`rarity` no dado fake do protótipo, `labels` no dataset real do Cobblemon - ver nota completa na Seção 5).
- Lendário: `--g1:#d99a1a; --g2:#f7c948`; fundo do hero `linear-gradient(160deg, #d99a1a 0%, #f7c948 42%, #fff1b8 60%, #f0b93a 78%, #c8871a 100%)`; `box-shadow: 0 0 0 2px #f1c85a, 0 18px 44px rgba(217,154,26,.5)`. Fundo de captura correspondente: `bg-lendario` (raios laranja/amarelo em `repeating-conic-gradient`, pontilhado de quadrinho, relâmpagos SVG piscando em ritmos dessincronizados, `boltFlicker 3.7s`).
- Mítico: `--g1:#7b4dff; --g2:#4aa8ff`; fundo do hero `radial-gradient(circle at 50% 58%, rgba(102,240,255,.8) 0%, ... ) + linear-gradient(160deg, #7b4dff 0%, #5d7dff 55%, #4aa8ff 100%)`; `box-shadow: 0 0 0 2px #9d7cff, 0 18px 44px rgba(102,240,255,.4)`. Fundo de captura `bg-mitico` (raios roxo/branco/azul, faíscas SVG derivando com `sparkDrift 4.2s`).
- Ambos: camada `.sheen` (brilho diagonal varrendo, `sheen 6s ease-in-out infinite`) + `.sparkles i` (faíscas/estrelas piscando, `twinkle 2.6s`); selo de raridade (badge dourado/roxo) permanece visível por cima do gradiente especial (confirmado nas capturas `desktop-detail-mewtwo-legendary-full.png`/`desktop-detail-mew-mythical-full.png`).
- Fundo "Outros" (demais Pokémon na animação de captura): `bg-outros`, `radial-gradient(... #2a8ce6 0%, #1c5fc9 55%, #1449a8 100%)`, raios finos azul-claro, sem relâmpago/faísca especial.
- **Nota de fonte**: os arquivos `design/capture/bg-{lendario,mitico,outros}.avif` são só referência de cor/estilo (usados para desenhar a paleta); o protótipo/app NÃO usa essas imagens em runtime, ele recria tudo em CSS (`repeating-conic-gradient`, `radial-gradient`) + SVG inline gerado por JS (`bolt()`/`spark()`/`dot()` em `app.js`).

### 3.6 Camada de raios (RNF-12)
- No hero da ficha: `.hero-art::before` é um círculo de `width:240%` (maior que a diagonal do card), centralizado, `repeating-conic-gradient` de raios brancos translúcidos, `animation: raysSlow 50s linear infinite` (só `transform:rotate`).
- Na animação de captura: `.cap-rays` é um quadrado de `145vmax` (cobre a diagonal de qualquer tela), `animation: raysSpin 50s linear infinite`.
- Em ambos os casos a camada de raios é sempre maior que a área visível e usa só `rotate()`, garantindo que nenhuma borda quadrada apareça (requisito RNF-12 já cumprido pelo próprio protótipo, replicar a mesma proporção "maior que 1,2x a diagonal, ou circular").

### 3.7 Marca d'água (RF-119)
`.watermark`: `position:fixed; right:-14vmin; bottom:-14vmin; width/height:70vmin; opacity: var(--wm-opacity)` (.03 ou .04 no tema preto), `filter: grayscale(1) contrast(.6)` sobre `../pokebola.webp`, `animation: wmSpin 60s linear infinite` (só `rotate`). Sempre monocromática (a imagem original é colorida, mas o filtro `grayscale(1)` a torna neutra na cor do fundo, não na cor do texto do tema - ver Gaps, seção 8).

### 3.8 Animações e durações (todas só `transform`/`opacity`, RNF-02)
| Nome | Duração | Uso |
|---|---|---|
| `screenIn` | .45s `ease-out` | troca de tela inteira |
| `partIn` | .3s `ease-out` | `swapIn()` de qualquer bloco parcial (abas, filtros) |
| `cardIn` | .5s `ease-out`, delay escalonado `i*45ms`/`i*70ms` | entrada de cards em grade/lista |
| `growX`/`shimmer` | 1s / 2.4s linear | barra de progresso |
| `raysSlow`/`raysSpin` | 50s linear infinite | raios atrás do artwork (ficha e captura) |
| `wmSpin` | 60s linear infinite | marca d'água |
| `sheen` | 6s ease-in-out infinite | brilho varrendo cards Lendário/Mítico |
| `twinkle` | 2.6s ease-in-out infinite | faíscas/estrelas dos cards especiais |
| `boltFlicker` | 3.7s ease-in-out infinite | relâmpagos do fundo Lendário |
| `sparkDrift` | 4.2s ease-out infinite | faíscas do fundo Mítico |
| `floatY` | 4s ease-in-out infinite | flutuação do artwork principal |
| Sequência de captura completa | ~5.45s até revelação final | ver linha do tempo exata na Seção 5 |
| `ledBlink` | 1.6s ease-in-out infinite, delay .25s/.5s | LEDs do "aparelho" (vermelho/amarelo/verde) |

Redução de movimento (RF-92/93): `@media (prefers-reduced-motion:reduce)` E classe `html.reduce-motion` forçam `animation-duration/transition-duration:.001s !important; animation-iteration-count:1 !important` globalmente - é um interruptor único que já cobre marca d'água, raios, brilhos/faíscas e a animação de captura inteira (não caso a caso).

## 4. Inventário de componentes (reusar estes; construir as telas novas A PARTIR deles)

Fonte: `design/prototipo/app.js` (funções de render) + `style.css` (seletores). Nomes de função/seletor no próprio protótipo, em inglês (confirma `code_identifier_language: en` do PRD).

| Componente | Origem no protótipo | Notas de reuso |
|---|---|---|
| Card genérico (`.card`) | `style.css:254` | base de todo painel/card |
| Card de Pokémon em grade (`.pcard`, `pcard()`) | `app.js:685` (função), `.pcard` `style.css:406` | gradiente por tipo, selo de raridade canto sup. esq. (RF-121), badge de capturado |
| Hero card da ficha (`.hero-card`, `.hero-art`, `.hero-body`) | `renderDetail()` `app.js:926`, `style.css:449-496` | camada de raios (`::before`), glow inferior (`::after`), variantes `.hero-legendary`/`.hero-mythical` |
| Chip de tipo (`.chip`, `.ti`) | `style.css:284-322` | ícone + nome, gradiente do tipo, variante `.sm`/`.lg` |
| Badge de raridade/selo (`.badge`, `.seal`) | `style.css:325-336`, `483-487` | `badge-common/uncommon/rare/ultra/legendary/mythical/nospawn` |
| Barra de stat (`.stat`, `.bar`) | `statsBlock()` `app.js:768` | animação `scaleX` com delay por índice |
| Painel de fraquezas (`.weak-grid`, `.mult-*`) | `weakGridHTML()` `app.js:813` | seletor Todos/Fraquezas/Resistências (`#weak-seg`) |
| Cadeia de evolução linear e ramificada (`.evo-chain`, `.evo-branching`) | `evoHTML()` `app.js:839` | nós clicáveis, método exato por seta/ramo |
| Habilidades (`.ability`) | `abilitiesHTML()` `app.js:851` | tag "OCULTA" quando aplicável |
| Tabela de golpes com abas (`.tabs`, `table`, `.mv-row`) | `movesTableHTML()` `app.js:778` | abas Nível/TM/Ovo/Tutor, linha expansível com descrição |
| Bloco "Onde encontrar" (`.where`, `.biome`, `.cond`) | `whereHTML()` `app.js:857` | biomas, condição, nível, drops |
| Bloco "Como obter" em camadas (`.ob-row`, `.ob-link`, `.ob-none`) | `obtainHTML()` `app.js:822` | ordem de confiança evo->fóssil->addon->breed->fallback (RF-26); fallback = `.ob-none` |
| Abas de forma (`.forms`, `.form-req`) | `formBodyHTML()` `app.js:788` | item de ativação clicável (`.tag-item`) |
| Calculadora de stats (`<details class="calc">`) | `renderCalc()` `app.js:1002` | `<details>` nativo, inputs + saída em 3 colunas |
| Toggle PT/EN por card (`.terms-tgl`) | `termsTgl()` `app.js:657` | override por card, independente do idioma global |
| Lista de Capturados (`.captured-summary`, `.seg-tabs`) | `renderCaptured()` `app.js:1013` | contador "X de N", filtros por aba |
| Comparar (`.cmp-pick`, `.cmp-row`, `.cmp-vs`) | `renderCompare()` `app.js:1018` | swap de posição, barras espelhadas |
| Treinadores - stepper (`.tr-step`, `.tr-dot`, `.tr-line`, `.tr-card`) | `trStepHTML()`/`trHeaderHTML()` `app.js:1105`/`1087` | linha do tempo vertical, estado done/next, cap grande (`.tr-cap-v`) |
| Time do treinador expandido (`.tr-team`, `.tr-mon`) | `trStepBodyHTML()` `app.js:1094` | por Pokémon: sprite, tipos, habilidade, golpes, item de spawn, mochila |
| Grade/card de Pokébola (`.ball-grid`, `.ball-card`, `.ball-ico`) | `ballGridHTML()` `app.js:1155` | ícone CSS puro (gradiente + faixa + botão central) quando não há textura |
| Melhores bolas (`.best-balls`, `.best-ball`, `.best-rank`) | `bestBallHTML()` `app.js:1176` | ranking 1<sup>o</sup>/2<sup>o</sup>/3<sup>o</sup>, 1<sup>o</sup> com destaque dourado |
| Grade/card de item (`.item-grid`, `.item-card`, `.item-ico`) | `itemGridHTML()` `app.js:1185` | categoria por cor de ícone (`cat-med/iv/vit/candy/evo/held/battle/cook/berry/bait`) |
| Página de item (`.item-hero`, `.item-hero-tile`, `.mon-chips`) | `itemPageBodyHTML()` `app.js:883` | textura real 16x16 (`image-rendering:pixelated`), seção "Usado em" com chips de Pokémon |
| Grade de temas (`.theme-grid`, `.theme-sw`) | `renderThemes()` `app.js:1042` | miniatura com 2 cores (`--p1`/`--p2`) + nome |
| Switch on/off (`.switch`) | `style.css:701` | usado em som e reduzir animações |
| Sidebar desktop (`.sidebar`, `.nav-item`) | `index.html:35-59` | 236px, gradiente primary->primary-dark |
| Topbar mobile "aparelho" (`.topbar`, `.lens`, `.leds`) | `index.html:61-72`, `style.css:174-189` | lente com brilho radial, 3 LEDs piscando |
| Tab bar mobile (`.tabbar`, `.tab`, `.tab-ball`) | `index.html:241-247` | botão central "Capturados" com pokébola destacada (`.tab-ball`) |
| Bottom sheet "Mais" (`.sheet`, `.sheet-panel`, `.sheet-item`) | `index.html:249-259` | usar como base para futuras ações mobile (ex. Sincronizar) |
| Overlay de captura completo (`.capture`, `.cap-stage`, `.cap-bg`) | `startCapture()` `app.js:1278` | ver linha do tempo na Seção 5; único overlay full-screen do app |
| Boot/splash "tampa da Pokédex" (`.boot`, `.boot-lid-*`) | `index.html:16-28`, `style.css:191-204` | reusar para o carregamento inicial real do app |
| Menu flutuante do protótipo (`.proto`) | `index.html:279-311` | **NÃO é parte do produto final** - é ferramenta de navegação do próprio protótipo, não implementar |
| Botão primário/ghost/accent (`.btn`, `.btn-primary/ghost/accent/light`) | `style.css:262-276` | ícone de bola gira 180° no hover (`.btn-ball`) |
| Segmented control (`.seg`, `.seg button`) | `style.css:399-403` | filtros de status, idioma, séries |
| Barra de rolagem customizada | `style.css:127-135` | `::-webkit-scrollbar*` + fallback `scrollbar-color`, cor = `--scroll-thumb` do tema |

## 5. Padrões de layout e interação

- **Grid responsivo**: sidebar fixa (236px) + `.main` fluido no desktop; `.app.mobile` empilha topbar -> `.main` -> tabbar. Fallback puro por `@media (max-width:900px)` garante mobile mesmo sem JS.
- **Navegação com pilha própria** (RF-01 a RF-04): `navigate(screen, fn)` empilha `snapshot()` (tela + params + aba ativa + filtros + scroll + toggles abertos) antes de qualquer mudança; `goBack()`/`popstate` restauram a entrada exata. Implementar em React como uma pilha própria (array de snapshots em contexto/estado global), não `react-router` puro nem `useState` de tela única.
- **`swapIn(el, html)`** (`app.js:803`): troca só o `innerHTML` de um container e reaplica a classe `part-in` (fade+slide de 6px) - é o padrão para toda troca de aba/filtro/toggle sem recarregar a tela (RF-04, RF-14, RF-22). Em React: memoizar o bloco afetado e trocar só ele, mantendo o resto da árvore estável (evitar remount do componente pai).
- **Estados vazio/erro**: `.ob-none`/`.badge-nospawn` = padrão visual para "sem dado confirmado" (fundo tracejado, ícone neutro); mesmo padrão deve cobrir busca sem resultado (RF-08) e placeholder de artwork sem rede (RF-16). Não há, no protótipo, um estado de erro de rede dedicado (ver Seção 8).
- **Loading**: pokébola (`../pokebola.webp`) usada como ícone do botão "Capturei", abertura da captura, e (por decisão do PRD RF-49) também como indicador de carregamento genérico - o protótipo não tem essa terceira variante desenhada; reusar a mesma imagem com uma animação de rotação simples (`spin`, já existe em `.boot-ball`).
- **Sequência da animação de captura** (RF-49, `startCapture()` `app.js:1278-1298`, tempos exatos em ms desde o clique em "Capturei"):

  | t (ms) | Estágio (classe) | O que acontece | Som |
  |---|---|---|---|
  | 0 | `capture on` | tela apaga (preto) | - |
  | 450 | `s-bg` (vazio) | fundo por categoria aparece (Legendário/Mítico/Outros conforme a raridade do Pokémon, não o bucket de spawn - ver nota de terminologia logo abaixo) | - |
  | 1000 | `s-ball` | Pokébola cai do topo e quica | `poke_ball_throw_1` |
  | 1700 | `s-shake` | bola balança (3x, ritmo decrescente) | `poke_ball_shake_1` |
  | 2150 | (mesmo `s-shake`) | 2º balanço | `poke_ball_shake_2` |
  | 2600 | (mesmo `s-shake`) | 3º balanço | `poke_ball_shake_3` |
  | 3200 | `s-open` | bola abre, burst de luz branca | `poke_ball_open` |
  | 3550 | `s-grow` | silhueta 100% preta do artwork cresce ("quem é esse Pokémon?") | - |
  | 5250 | `s-flash` | tela pisca branco + aceleração breve dos efeitos de fundo (`capBoost`, rotate 0->28°) | `poke_ball_shake_critical` |
  | 5450 | `s-final` | revelação colorida completa + nome + botão Fechar | `poke_ball_capture_succeeded` |

  Toque/clique a qualquer momento pula direto para `s-final` (`finishCapture()`); tecla Esc ou clique após `s-final` fecha (`closeCapture()`, som `pokedex_close`). Fundo por raridade (`startCapture()`, `app.js:1280`): `p.rarity === 'legendary'` -> `bg-lendario`; `p.rarity === 'mythical'` -> `bg-mitico`; qualquer outro valor -> `bg-outros`. **Nota de terminologia**: o protótipo usa o campo de dado fake `rarity` (`'common'|'uncommon'|'rare'|'ultra'|'legendary'|'mythical'`, ver `DATA.pokemon` em `app.js:314-328`) só para essa lógica visual; no dataset real do Cobblemon (CONTEXT_pontindex.md seção 4) o campo equivalente é `labels` (ex. `["legendary"]`/`["mythical"]` em `species/<gen>/<nome>.json`), que é o que a implementação real deve ler - `rarity` do protótipo e `label` do dataset real representam o mesmo conceito, não confundir com o bucket de spawn (`common/uncommon/rare/ultra-rare`, RF-27), que é um dado independente.

  **Ordem real da sequência (importante para `forge-imp-frontend`)**: o FUNDO aparece antes da Pokébola cair (450ms de fundo, 1000ms de bola), não depois de a bola abrir. O texto do RF-49 do PRD lista a prosa na ordem "(1) apaga, (2) Pokébola aparece/balança/abre, (3) na sequência aparece um fundo animado, (4) silhueta, (5) flash, (6) revelação", o que pode ser lido como "fundo depois da bola abrir" - a implementação deve seguir a ORDEM REAL do protótipo (fundo primeiro, aos 450ms, bem antes da bola cair aos 1000ms), não reordenar os estágios para bater literalmente com a redação em prosa do PRD. Esta tabela de tempos é a fonte de verdade de ordem/timing, o RF-49 é a fonte de verdade de "o que deve acontecer" (elementos obrigatórios), não da ordem exata em milissegundos.
- **Sons automáticos vs. explícitos**: toggle global (`state.sound`, ligado por padrão) controla todos os sons "automáticos" listados no RF-91; o grito do Pokémon (`#cry-btn`) e a animação de captura já iniciada tocam sempre, mesmo com o toggle desligado, porque são ação explícita do usuário. Autoplay bloqueado pelo navegador antes do 1º gesto é enfileirado (`pendingSfx`) e disparado no próximo `pointerdown` global.
- **Reduzir animações**: interruptor único (`html.reduce-motion` ou `prefers-reduced-motion`) zera `animation-duration`/`transition-duration` globalmente via `!important` - não precisa de lógica condicional espalhada pelos componentes, só aplicar a classe/media query na raiz.
- **Offline/placeholder de imagem**: não há tratamento explícito de `onerror` de imagem em todos os pontos do protótipo (alguns `<img>` de item usam `onerror="this.onerror=null;this.src=...`, mas o artwork principal da ficha não tem fallback visível no protótipo) - a implementação real precisa adicionar esse placeholder (RF-16), o protótipo não cobre esse caso (ver Gaps).
- **Boot real do app**: tampa fecha->abre (`lidUp`/`lidDown`, delay 1.4s, duração .7s) com som `pokedex_open`; ao fechar o app (não aplicável a uma SPA web, mas relevante para os apps da Fase 2) o som seria `pokedex_close`.

## 6. Identidade por área (onde ela diverge do padrão geral)

- **Home**: único lugar com um "hero" de fundo sólido gradiente `primary->primary-dark` (não usa `--screen`); os demais cabeçalhos de tela (`.page-head`) são só texto sobre o fundo `--screen`.
- **Ficha (`detail`)**: único componente com card "hero" cujo gradiente muda por tipo/raridade (Seção 3.4/3.5) e com camada de raios giratória (RNF-12); todas as outras telas usam `.card`/`.panel` neutros na cor de superfície do tema.
- **Tema Preto**: única exceção à regra "fundo da área de conteúdo = `--screen` saturado, cards em tom claro" (RF-120) - aqui os cards (`--surface`) também são escuros/pretos (RF-80), para não se confundir com o fundo.
- **Página de item**: única tela com imagem em pixel art ampliada sem suavização (`image-rendering:pixelated`), refletindo que é textura real extraída do jogo, não arte vetorial.
- **Treinadores**: única tela com uma linha do tempo vertical conectada (`.tr-line`) - padrão de "progresso sequencial" que não aparece em nenhuma outra tela.

## 7. Do / Don't

**Do**
- Fazer chips de tipo, gradiente do card hero e tinta dos cards compactos sempre lerem o MESMO par `a`/`b` de `design/tipos/cores.json` (RF-117) - uma única fonte, nunca 3 paletas hardcoded separadas.
- Manter a camada de raios sempre maior que a área visível do card (círculo de ~240% ou quadrado que cobre a diagonal), girando só com `rotate()` (RNF-12).
- Manter todo o sistema de tema em `[data-theme]` na raiz (`<html>`), nunca classes de tema espalhadas pelos componentes.
- Reproduzir a linha do tempo exata da animação de captura (Seção 5) - inclusive a aceleração dos efeitos de fundo no flash (`capBoost`), não só o flash em si.
- Tratar o toggle "Reduzir animações" como um único interruptor global (CSS), não uma checagem `if (reduceMotion)` repetida em cada componente.
- Selo de raridade sempre no canto superior ESQUERDO do gradiente, botão de shiny sempre no canto superior DIREITO (RF-121) - nunca inverter para "melhor equilíbrio visual".

**Don't**
- Não reintroduzir o badge genérico "NÃO NASCE NO MUNDO" que ainda aparece no protótipo (visível nas capturas de Mewtwo/Mew, `desktop-detail-mewtwo-legendary-full.png`) - o PRD (RF-10) proíbe explicitamente esse aviso genérico; ele deve ser SUBSTITUÍDO pela seção "Como obter" em camadas (RF-26), nunca coexistir com ela.
- Não usar opacidade reduzida para indicar "filtro não selecionado" ou "tipo desabilitado" - o protótipo e o RNF-07 usam contorno/box-shadow (`.chip.on`, `.seg button.active`), nunca `opacity:.5` em chip de tipo.
- Não trocar a barra de rolagem do sistema operacional em nenhum container com overflow - sempre a barra fina customizada (RNF-08).
- Não implementar o menu flutuante `.proto` (engrenagem "Menu do protótipo") no produto final - é ferramenta exclusiva do protótipo de design.
- Não animar propriedades que disparam reflow (`width`, `top`, `left`, `box-shadow` animado) - só `transform`/`opacity` (RNF-02), como o próprio protótipo já faz em 100% das suas animações.

## 8. Lacunas / notas de fallback

1. **Tela "Sincronizar" (RF-72 a RF-78, RF-112, RF-113): sem nenhuma referência visual no protótipo** (confirmado por busca: zero ocorrências de "sincroniz"/"qr"/"baixar app" em `index.html`, `app.js`, `style.css`). Construir a partir destes primitivos já existentes: `.sheet`/`.sheet-panel` (ou uma tela cheia `data-screen`, já que é uma ação de menu, não um popup rápido) para o fluxo "Gerar código"/"Receber código"; `.card` + `.notice`/`.notice-info` para o texto explicativo inicial (mesmo estilo do aviso informativo já usado em Treinadores, ver `desktop-trainers.png`); `.btn-primary`/`.btn-ghost` para as duas ações principais; `.seg` para a escolha Mesclar/Substituir; um novo componente de exibição de QR (não existe nada parecido no protótipo, mas o `.item-hero-tile` - moldura quadrada arredondada com fundo neutro - é o container mais próximo para encaixar um `<canvas>`/`<img>` de QR code); resumo pré-aplicação (RF-75) pode reusar o padrão `.card-info`/`.info-line` de Configurações.
2. **Botão "Baixar app" (RF-109, Fase 2): sem referência visual.** Construir como um `.btn-accent` ou `.btn-primary` adicional na sidebar/topbar (ao lado dos toggles de som/idioma/tema) ou como item de `.sheet-item` no mobile, com um pequeno menu/dropdown de duas opções (Android/Windows) - reusar o padrão de `.search-dd`/`.proto-panel` (painel flutuante com opções) para esse dropdown, nunca o menu do protótipo em si.
3. **Ação "Apagar dados" (RF-97, RF-122): sem referência visual.** Construir a partir do `.card` de Configurações + um `.btn` de destino destrutivo (o protótipo não tem uma variante de botão "perigo"/vermelho-de-alerta já pronta; usar `--fighting`/vermelho semântico ou um novo token `--danger`, já que nenhum `--primary` de tema é seguro nesse papel em todos os 7 temas) + um modal/`.sheet` de confirmação (reusar `.sheet-panel` no mobile; no desktop, o protótipo não tem NENHUM modal centralizado - só o overlay full-screen de captura -, então a confirmação em desktop precisa de um novo componente de modal centralizado, não documentado no protótipo).
4. **Placeholder de Creepyon/Piglich (RF-09): sem referência visual.** O protótipo não tem nenhum Pokémon custom sem sprite; a decisão do PRD é usar uma "silhueta de Pokébola" como placeholder com aviso de que a imagem não vem da PokeAPI - reusar visualmente a silhueta preta já existente na animação de captura (`.cap-art` com `filter:brightness(0)`) como base do ícone estático, dentro do mesmo `.hero-art`/`.pcard > img` que os demais Pokémon usam, mais um `.notice`/`.notice-info` (mesmo componente do aviso informativo de Treinadores) explicando a origem do placeholder.
5. **Aviso genérico de "Não nasce no mundo" ainda presente no protótipo** (badge `.badge-nospawn`, visível em Mewtwo/Mew) contradiz RF-10 do PRD - tratar como bug/comportamento do protótipo a NÃO reproduzir (ver Don't, Seção 7), e usar só o bloco "Como obter" (`.ob-*`) no lugar.
6. **Placeholder de artwork sem rede (RF-16): sem `onerror` visível no `<img>` principal da ficha no protótipo.** A implementação real precisa adicionar um estado de fallback (ex. reusar a silhueta cinza/pokébola) que o protótipo não desenha explicitamente para esse caso específico (só existe `onerror` em alguns ícones de item/pokémon secundários, ex. `evoHTML()`/`obtainHTML()`, não no artwork hero).
7. **Marca d'água "monocromática na cor do texto do tema" (RF-119) vs. implementação atual do protótipo**: o CSS usa `filter: grayscale(1) contrast(.6)` sobre a imagem colorida da pokébola, o que a torna cinza neutro, não necessariamente igual a `var(--text)` do tema ativo (ex. no tema Preto o texto é bege claro `#F4F2EA`, mas a marca d'água em `grayscale` fica num cinza médio fixo, não bege). A implementação real deve seguir a letra do RF-119 (cor = `var(--text)` do tema, via `mask`/`currentColor` num SVG em vez de `filter` sobre um PNG/WEBP), não copiar literalmente o `filter:grayscale` do protótipo.
8. **Pokedex mobile "de verdade" (RF-116, beep de abertura/fechamento)**: o protótipo mostra a tampa fechando/abrindo (boot) e tem sons `pokedex_open`/`pokedex_close` mapeados no código, mas o fechamento só é acionado manualmente pelo menu do protótipo (`replayBoot()`); não há um evento real de "fechar o app" na Fase 1 (site) que dispare `pokedex_close` - esse gancho só faz sentido pleno nos apps nativos da Fase 2 (minimizar/fechar janela); documentar como comportamento a implementar quando a Fase 2 existir, não bloqueante para a Fase 1.
9. **Efeito sonoro do beep de abertura em mobile especificamente**: RF-116 pede "som de beep ao abrir/fechar" para a "aparência de Pokédex de verdade" no mobile; no protótipo o mesmo `boot()`/som `pokedex_open` roda igual em desktop e mobile (não há um som dedicado "só mobile") - tratar como o mesmo evento de boot único do app, não uma segunda sequência sonora exclusiva do layout mobile.
10. **Ícone de loading dedicado (pokébola girando fora do boot/captura)**: citado no RF-49 como reaproveitamento da pokébola em "outros pontos do app" (loading/splash), mas o protótipo só implementa a rotação da bola dentro do `.boot-ball` (splash inicial); não existe, no protótipo, um spinner de carregamento inline (ex. ao trocar de aba/filtro) usando a bola - implementar como um novo componente pequeno reaproveitando a mesma imagem + `animation:spin` já definida.
11. **Cores exatas semânticas de multiplicador de fraqueza** (`.mult-4/.mult-2/.mult-half/.mult-quarter/.mult-0`, `.badge-*`) são fixas em hex absoluto no CSS (não seguem `[data-theme]`), exceto uma pequena adaptação de `.badge-common` no tema Preto - confirmar se isso é intencional (aceitável, pois são cores semânticas de status, não de marca) ou se precisa de variação por tema; o protótipo trata como fixo em todos os 7 temas.
12. **Frame exato do deslize da tampa (`lidUp`/`lidDown`, janela 1,4-2,1s) não foi capturado.** O script `<script src="https://cdn.jsdelivr.net/npm/lucide@latest/...">` fica em `<head>`, antes do `<body>` (logo antes da própria tampa), e é bloqueante: com rede fria, o tempo para baixá-lo varia o bastante para empurrar todo o boot (incluindo a janela de deslize) para depois de qualquer espera fixa razoável, fazendo a screenshot cair ora na tampa ainda fechada, ora no app já 100% revelado. Bloquear esse script de propósito adianta o carregamento, mas quebra os ícones Lucide da tela revelada por trás (erro de `lucide` indefinido interrompe o restante do boot em JS). `mobile-boot-lid-closed.png` e `mobile-boot-splash.png` documentam a tampa fechada em dois instantes (LEDs em fases diferentes do piscar), não o deslize em si; a implementação real (sem dependência de CDN bloqueante, ícones embutidos no bundle via `lucide-react`) não deve ter esse problema de timing, então o deslize da tampa pode ser validado direto no app real durante o Stage 5 (testes), sem bloquear o Stage 3 (SPEC).

