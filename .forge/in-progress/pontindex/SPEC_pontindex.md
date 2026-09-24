---
feature: pontindex
language: pt-BR
generated: 2026-09-23
stack: React 19 + TypeScript + Vite 6 (PWA estatica na Vercel, sem backend); pipeline de dados Node 24/TS em build-time; IndexedDB; Fase 2 Electron + Capacitor 8 (futura)
status: spec
prd_source: PRD_pontindex.md @ c22a97f1c6784726634dc52a90ed20c12ae36c1e
---

# SPEC - Pontindex

Este documento e, ao mesmo tempo, o desenho tecnico (COMO) e o plano executavel da Fase 1 do Pontindex. Ele foi escrito para ser executado por agentes de implementacao que so terao este SPEC, o CONTEXT e o UISPEC em maos. Toda regra quantitativa carrega um exemplo trabalhado; todo caminho existente citado foi verificado no repositorio (sessao original 2026-09-23 na instancia local; revisao 2026-09-24 no snapshot `data-source/atm-1.3.0/`, somente leitura).

Convencoes de leitura:
- `[ASSUMPTION]` = decisao tomada em modo autonomo, com padrao justificado, revisavel.
- `[OPEN]` = ponto que realmente nao pode ser decidido aqui (lista completa na secao 9).
- **Caminhos RELATIVOS a raiz do repositorio** (`<ROOT>` = raiz do git, onde quer que esteja clonado). Decisao do orquestrador (portabilidade): o projeto trocou de PC, entao este SPEC nao usa caminhos absolutos de maquina; toda lista de arquivos e todo caminho citado (`src/...`, `tools/...`, `design/...`, `data-source/...`) e repo-relativo. Isto substitui a regra generica "todo caminho absoluto".
- **Fonte de dados do pipeline** (`<SRC>`): padrao = `data-source/atm-1.3.0/` (snapshot versionado dos arquivos da instancia, com cada jar ja "aberto" como DIRETORIO `mods/<nome-do-jar>.jar/`; ver `data-source/README.md` e `data-source/atm-1.3.0/MANIFEST.json`). OPCIONAL: `ATM_INSTANCE_DIR` (ou `--instance`) pode apontar para uma instancia real do CurseForge (jars zipados), sempre READ-ONLY. Nota historica: o snapshot foi extraido em 2026-09-23 da instancia que ficava em `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons` no PC antigo; esse caminho nao existe mais e nao e usado por nada.
- "cria" = arquivo novo; "modifica" = arquivo existente (com linha verificada); nenhum arquivo do prototipo, de `data-source/` ou de uma instancia real e modificado em sprint algum.
- **Premissas do orquestrador (revisao 2026-09-24, vinculantes)**: (1) caminhos repo-relativos e fonte padrao `data-source/atm-1.3.0/`, instancia real opcional (acima); (2) Playwright neste projeto roda com `headless: true`, sem `slowMo` e sem timers/esperas artificiais (auto-waiting, `expect.poll`), regra do usuario de 2026-09-24; (3) TODOS os artefatos do `.forge` (STATE, checklists, relatorios, `ui-refs/`) sao versionados, nada de `.forge/` no `.gitignore`; (4) escopo atual = somente a Fase 1 (site PWA); a Fase 2 (Electron/Capacitor, sprints P1-P3) continua como sprint futuro, sem alteracao.

---

## 1. Baseline (ancora de drift)

- HEAD: `eacafc48026f8ee90d4dc385e2b333cdb8abdcac` (branch `feature/pontindex`, revisao de 2026-09-24).
- Fingerprints (`git hash-object`, conferidos em 2026-09-24):
  - `.forge/in-progress/pontindex/PRD_pontindex.md` - `c22a97f1c6784726634dc52a90ed20c12ae36c1e` (rev 5+: exemplos de level cap/stats corrigidos, RF-63 com contagem de bolas derivada)
  - `.forge/in-progress/pontindex/CONTEXT_pontindex.md` - `6205663d819207d15de97117b34d0e19353f171e` (versao do working tree com `data-source/atm-1.3.0/` como fonte padrao, linhas 21 e 92)
  - `.forge/in-progress/pontindex/UISPEC_pontindex.md` - `c791c6d90dca68211ac5556b63c05617f89c975e` (2026-09-24: nota do card de item na linha 205, tag acima do nome; antes `e65b7d65`, versao pos-recaptura: 50 capturas em `ui-refs/` + `tokens.json`, 0 assets quebrados; nomes de arquivo conferidos nesta sessao e identicos aos citados neste SPEC. Nota: as capturas originais tinham icones de tipo e pokebola quebrados por raiz de servidor errada; isso era bug de captura, nao traco do prototipo: o app DEVE mostrar os SVGs de tipo e a pokebola em todo lugar em que o prototipo os usa, empacotados pelo Vite, nunca por caminho relativo `../` nem por CDN.)
  - `.forge/in-progress/pontindex/IDEA_pontindex.md` - `78ba7d1b16f88312efc42f3b586f5c2f96110eee` (exemplo de stats corrigido)
- Arquivos do repositorio dos quais este SPEC depende (path - blob sha1):
  - `design/prototipo/index.html` - `be69b2b8b467356c0afdf437b025c2a98762f888` (316 linhas)
  - `design/prototipo/style.css` - `b836a3eb99cbb7f4ab9effb3bc36774bcb0ef55d` (1142 linhas)
  - `design/prototipo/app.js` - `09293df62796fd54a02d93536eef4fad82de0ccd` (1410 linhas)
  - `design/prototipo/assets/itens/manifest.js` - `6fb51c04bd99f02061b797c1e2564db4c2afcdff`
  - `design/tipos/cores.json` - `e9eccf58f159b2ffebccedca547bfeaf312b4cff` (18 tipos, campos `base/a/b`)
  - `design/tipos/svg/<tipo>.svg` - 18 arquivos (`bug dark dragon electric fairy fighting fire flying ghost grass ground ice normal poison psychic rock steel water`)
  - `design/pokebola.webp` - `3d5f2ac4309c797d9baef4b4ea31f7b6aef38691`
  - `design/capture/bg-{lendario,mitico,outros}.avif` - somente referencia de cor (nao usados em runtime)
- Snapshot versionado da instancia (fonte padrao do build em qualquer PC): `data-source/atm-1.3.0/` com `MANIFEST.json` - `62522472ee3c6a1473ea0846492f175823cdc83e` (git hash-object; 8 jars abertos em `mods/<nome-do-jar>/` com os caminhos internos originais, filtrados para `data/**/*.json`, `assets/*/lang/{pt_br,en_us}.json`, `assets/*/textures/{item,gui}/**`, `assets/*/sounds.json`, gritos `*_cry.ogg` e as pastas pequenas de sons de UI; mais `kubejs/data/{cobblemon,rctmod,legendary_spawns_ccc}` e `config/{rctmod-server.toml,cobblemon/}` copiados como estao). Ausentes no snapshot, de proposito: texturas de modelo 3D (`textures/pokemon`), estruturas `.nbt`, `.mcfunction`, sons de golpes/blocos/pesca/montaria/musica e sons de Pokemon que nao sao grito; nada disso e usado pelo app. Ver `data-source/README.md`.
- Fontes de dados (`<SRC>` = `data-source/atm-1.3.0/` por padrao; no snapshot cada `mods/<jar>` e um diretorio, numa instancia real e um zip com os mesmos caminhos internos). As contagens abaixo foram tiradas em 2026-09-23 abrindo os jars da instancia real (`System.IO.Compression.ZipFile`) e reconferidas no snapshot em 2026-09-24 (species 1025, spawn 824, fossils 15, recipes 750, loot 457, trainers 1559 identicos; diferencas do snapshot: 802 PNG em `textures/item/**` e 1072 gritos `*_cry.ogg`, contra 805/1074 contados na instancia; B3.4 ja aceita `>= 1072` e `>= 800`). Todo jar tem `META-INF/neoforge.mods.toml` (presente tambem no snapshot); o do Cobblemon traz `version="1.7.3+1.21.1"` (linha 8) e a dependencia `modId="minecraft"` com `versionRange="[1.21.1]"` (linhas 28-30):
  - `<SRC>/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar`: 1025 `data/cobblemon/species/generation*/**.json`; 824 `spawn_pool_world`; 15 `fossils`; 750 `recipe/**` (608 na raiz + 117 `campfire_pot` + 27 `brewing_stand`, contagem total 750 confirmada); 457 `loot_table/**` (pastas `blocks fishing fossils injection/chests injection/gameplay/fishing ruins sets shipwreck_coves villages`); 70 `berries`; 76 `seasonings`; 78 `spawn_bait_effects` (73 `berries/` + 6 `fruits/` + `poke_bait.json`; 80 entradas contadas por caminho, 78 arquivos de item unicos conforme CONTEXT); 805 texturas `assets/cobblemon/textures/item/**/*.png` (802 na contagem da IDEA, 805 nesta recontagem incluindo 3 em `poke_balls/models/`, ver B3); 1074 gritos `assets/cobblemon/sounds/pokemon/*/*_cry.ogg`; `assets/cobblemon/lang/{pt_br,en_us}.json`; `assets/cobblemon/sounds.json` (2408 eventos).
  - `<SRC>/mods/allthemons-0.6.2.jar`: `data/cobblemon/species/custom/{creepyon,piglich}.json` (Creepyon `nationalPokedexNumber: 9902`, Normal; Piglich `9901`, Dark/Fire, nome PT no lang do addon = "Piglichu"), `fossils/mewtwo.json` (`{"result":"mewtwo","fossils":["allthemons:pika_star","allthemons:ancient_dna_sample"]}`), `spawn_pool_world/{0120_staryu,creepyon}.json`, 11 `species_additions`, `assets/allthemons/lang/{pt_br,en_us}.json`, 79 texturas de item.
  - `<SRC>/mods/mega_showdown-neoforge-1.9.9+1.7.3+1.21.1.jar`: 52 `data/cobblemon/species/**` (overrides completos, ex. `generation1/charizard.json` com `forms[] Mega-X/Mega-Y/Gmax`), 117 `species_additions`, 29 `spawn_pool_world`, `assets/mega_showdown/lang/{en_us,pt_br,...}.json` (281 chaves `item.mega_showdown.*`, ex. `charizardite_x`, `keystone`), 322 texturas.
  - `<SRC>/mods/zamega-neoforge-1.7.6.jar`: 12 `species_additions` (formas `Mega-Z`, ex. `absol-mega-z`), 1 `spawn_pool_world`.
  - `<SRC>/mods/legendarymonuments-neoforge-1.21.1-8.1-Love_for_All.jar`: 12 `spawn_pool_world/90NN_distortion_*.json` (bioma `legendarymonuments:distortion_world_biome`).
  - `<SRC>/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar`: 9 `species` (overrides de arceus, dialga, giratina, palkia, thundurus, zygarde, lycanroc, silvally, ogerpon), 225 `species_additions`, 92 `spawn_pool_world`.
  - `<SRC>/mods/rctmod-neoforge-1.21.1-0.18.1-beta.jar`: 1559 `data/rctmod/trainers/*.json`; 282 `data/rctmod/mobs/trainers/**` (165 em `single/`, resto em `groups/` + `default.json`); `data/rctmod/series/{bdsp,radicalred,unbound}.json`; `assets/rctmod/lang/{pt_br,en_us}.json` (chaves `series.rctmod.<id>.title/.description`, incluindo `empty` e `freeroam` = "Modo Livre"). Treinadores-chave (`optional:false`) por serie, contados nesta sessao: bdsp 33, radicalred 39, unbound 38 (so o jar; com os overrides do kubejs a BDSP fica com 43, ver B5.2).
  - `<SRC>/kubejs/data/rctmod/`: 30 `trainers/`, 60 `mobs/trainers/single/`, `series/{atm_team,contentcreators}.json` (`atm_team.requiredSeries = [["bdsp"]]`), 5 `trainer_types/`, 30 `loot_table/`, 24 `advancement/`.
  - `<SRC>/kubejs/data/cobblemon/`: 21 `spawn_pool_world`, 1 `species_additions/generation7b/zzz_ccc_meltan.json`, 7 `loot_table/{injection,sets}`, `seasonings/`, `spawn_bait_effects/fruits/`. `<SRC>/kubejs/data/legendary_spawns_ccc/tags/worldgen/biome/**` (21 tags).
  - `<SRC>/config/rctmod-server.toml`: `initialLevelCap = 15` (linha 144), `relativeLevelCap = 0` (150), `initialSeries = "empty"` (156), `freeroamRequiresCompletedSeries = true` (161).
  - Metadados do pack: numa instancia real, `manifest.json` do CurseForge (`"name":"All the Mons"`, `"version":"1.3.0"`, `minecraft.version`); no snapshot, `data-source/atm-1.3.0/MANIFEST.json` (`source: "All the Mons 1.3.0 instance (CurseForge)"`, `extracted`, `files_per_jar`; SEM versao do Minecraft). Qual dos dois e lido depende do modo detectado (B2.1), nunca do nome do arquivo (NTFS nao diferencia maiusculas).

---

## 2. Design Overview

### 2.1 Arquitetura em uma frase

Um site estatico (PWA) React + TypeScript gerado pelo Vite e publicado na Vercel, cujo conteudo de jogo vem de um **dataset versionado gerado em build-time** por scripts Node que leem os dados do All the Mons (jars + kubejs + config) a partir do snapshot versionado `data-source/atm-1.3.0/` (ou de uma instancia real, opcional) e a PokeAPI (mecanica de golpes, ids de artwork por forma, sprites 96px); em runtime o app so acessa a rede para o artwork grande da PokeAPI, e guarda todos os dados do usuario em IndexedDB versionado atras de uma interface de storage unica (que a Fase 2 troca por arquivo).

### 2.2 Camadas e pastas (a criar)

```
<ROOT>/
  package.json, vite.config.ts, tsconfig.json, tsconfig.node.json, vercel.json, .gitignore, README.md
  index.html                       # shell do app (substitui o do prototipo, que NAO e alterado)
  public/
    data/<datasetVersion>/         # dataset gerado (B2..B5), commitado (RF-100)
    assets/cries/<slug>.ogg        # 1072 gritos no snapshot (B3)
    assets/sfx/<name>.ogg          # ~20 sons de UI/bola/evolucao/shiny (B3)
    assets/items/<namespace>/<id>.png   # texturas de item (B3)
    assets/sprites/<dex>.png       # sprites 96px da PokeAPI (B3)
    icons/                         # icones PWA gerados da pokebola (B1)
  src/
    main.tsx, App.tsx
    assets/                        # pokeball.webp, types/<type>.svg (copiados de design/, B1)
    styles/                        # tokens.css, themes.css, types.generated.css, base.css, components.css, mobile.css, capture.css
    i18n/                          # messages.ts (dicionario pt/en), useT.ts
    domain/                        # regras puras (sem React): normalize, ball-rules-types (Onda 0), type-chart, stats, natures, level-cap, ball-ranking, search, history, team
    data/                          # loaders do dataset (fetch + cache em memoria), tipos TS do dataset (schemas de §5.1)
    storage/                       # StorageAdapter, IndexedDbAdapter, migrations, backup, repositories
    sync/                          # codec binario, frames QR, validacao, merge
    audio/                         # sfx.ts, cries.ts
    navigation/                    # pilha propria (store + hooks + integracao popstate)
    state/                         # stores Zustand: preferences, captured, team, history, trainers
    components/                    # componentes reutilizaveis (PascalCase)
    screens/                       # uma pasta por tela (Home, Dex, Detail, Captured, Compare, Trainers, Balls, Items, Item, Settings, Sync)
    pwa/                           # registro do service worker, install prompt
  tools/dataset/                   # pipeline de build (Node 24 + tsx), com .cache/ gitignored
  tests/                           # unit (Vitest) + e2e (Playwright)
  phase2/                          # (Fase 2, futura) electron/, capacitor/
```

### 2.3 Convencao de identificadores (obrigatoria)

- Idioma: **ingles** em 100% dos identificadores, nomes de arquivo, chaves JSON, chaves de storage, nomes de componentes, nomes de testes (`code_identifier_language: en`, CONTEXT secao 6). Portugues so em prosa (comentarios curtos sao permitidos em pt-BR) e nas strings de UI dentro dos dicionarios i18n.
- Variaveis/funcoes/hooks: `camelCase` (`computeLevelCap`, `useNavigationStack`). Tipos/interfaces/enums/componentes: `PascalCase` (`SpeciesSummary`, `PokemonDetailScreen`). Constantes globais: `SCREAMING_SNAKE_CASE` (`TYPE_CHART`, `HISTORY_LIMIT`).
- Arquivos: componentes React `PascalCase.tsx` (`CaptureOverlay.tsx`); qualquer outro modulo `kebab-case.ts` (`level-cap.ts`, `indexeddb-adapter.ts`); testes `<nome>.test.ts(x)`; e2e `<fluxo>.spec.ts`.
- Chaves JSON do dataset e do storage: `camelCase` (`nationalDexNumber`, `capturedAt`). Ids de jogo permanecem no formato do Cobblemon (`fire_stone`, `cobblemon:thunder_stone`, `gym_leader_roark_0395`).
- Chaves i18n: `"<contexto>.<campo>"` como no prototipo (`app.js:13-268`), ex. `nav.home`, `detail.caught`, `sync.generate`.
- CSS: custom properties em ingles/kebab-case exatamente como `style.css` (`--primary`, `--type-fire-a`, `--scroll-thumb`); classes reaproveitam os nomes do prototipo quando o componente e portado (`.pcard`, `.hero-card`, `.tr-step`) para que o UISPEC continue rastreavel.
- Proibido: travessao (U+2014) em qualquer texto; `any` sem justificativa; strings de UI hardcoded fora de `src/i18n/messages.ts`; numeros de contagem fixos na UI (RF-114).

### 2.4 Fluxo de dados

1. **Build-time** (qualquer PC com o repo clonado): `npm run dataset` -> `tools/dataset` le `<SRC>` (padrao `data-source/atm-1.3.0/`), consulta PokeAPI com cache em disco, escreve `public/data/<datasetVersion>/*.json` e `public/assets/**`, e um `dataset-manifest.json` com contagens derivadas (RF-114). `npm run build` -> Vite empacota `src/` + `public/` em `dist/` com service worker (Workbox via `vite-plugin-pwa`). Deploy = push no GitHub -> Vercel (estatico).
2. **Runtime**: boot carrega `dataset-manifest.json` + `species-index.json` + `type-chart.json` (leves); todo o resto e carregado sob demanda (`species/<dex>.json`, `moves.json`, `items.json`, `trainers/<series>.json`, `balls.json`) e fica em cache do service worker. Estado do usuario e hidratado do IndexedDB na abertura e gravado a cada mutacao (transacao atomica).
3. **Rede em runtime**: somente `raw.githubusercontent.com/PokeAPI/sprites/.../official-artwork/<id>.png` (artwork grande, normal e shiny), com cache do service worker (CacheFirst) e placeholder de Pokebola em falha (RF-16). Fontes (Fredoka, Nunito, Silkscreen) e icones Lucide sao empacotados (sem CDN, RNF-11).

### 2.5 Decisoes de volume (RNF-01, RNF-04)

- **Chunking do dataset**: `species-index.json` (1027 entradas x ~140 bytes = ~145 KB, ~35 KB gzip) e o unico arquivo de especies carregado no boot; a ficha completa fica em `species/<dex>.json` (1027 arquivos, media ~6 KB), carregado ao abrir a ficha. `moves.json` (~932 golpes, ~320 KB), `abilities.json` (~310, ~60 KB) e `items.json` (~932, ~280 KB) sao carregados na primeira ficha/tela que precisa deles e mantidos em memoria. `trainers/<seriesId>.json` por serie (5 arquivos).
- **Lazy loading de midia**: sprites 96px (`<img loading="lazy">`), gritos (fetch so ao tocar), texturas de item (lazy). Nada disso entra no precache.
- **Service worker (Workbox, `generateSW`)**: precache = app shell (JS/CSS/HTML/fontes/SVG de tipos/pokebola/icones) + `dataset-manifest.json` + `species-index.json` + `type-chart.json` + `assets/sfx/*` (1,75 MB). Runtime caching: `data/**` e `assets/**` CacheFirst (o caminho carrega `<datasetVersion>`, entao nunca fica obsoleto sem trocar de URL); artwork PokeAPI CacheFirst (max 600 entradas, 30 dias); gritos CacheFirst (max 300 entradas); sprites CacheFirst (max 1100). Nenhuma promessa offline-first formal (RNF-03), mas na pratica tudo que ja foi visto funciona sem rede.
- **Orcamento de bundle** [ASSUMPTION]: JS inicial <= 250 KB gzip (React + Zustand + virtualizador + i18n; `qrcode`, `@zxing/browser` e `fflate` em chunks lazy da tela Sincronizar); CSS <= 60 KB gzip; precache total <= 4 MB; midia total em `public/assets` ~ 22-23 MB (16,5 MB gritos + 1,75 MB sfx + ~2 MB texturas + ~3 MB sprites), dentro do orcamento "~20 MB" aceito (RNF-04) com folga documentada no relatorio do build (B3 falha se ultrapassar 26 MB).
- **Lista virtualizada** (RNF-01): `@tanstack/react-virtual` com virtualizacao por linha (colunas calculadas pela largura, `minmax(200px,1fr)` desktop / 2 colunas mobile, UISPEC 3.2).

### 2.6 Telas e componentes (mapa rapido)

| Tela (`screen` na pilha) | Origem no prototipo | Componente raiz |
|---|---|---|
| `home` | `renderHome()` `app.js:699-713`, `renderSearch()` `715-724` | `HomeScreen.tsx` |
| `dex` | `renderFilters()` `729-732`, `renderDex()` `733-744` | `DexScreen.tsx` |
| `detail` | `renderDetail()` `926-1000` + parciais `768-869`, `1002-1008` | `DetailScreen.tsx` |
| `captured` | `renderCaptured()` `1013-1016` | `CapturedScreen.tsx` |
| `compare` | `renderCompare()` `1018-1036` | `CompareScreen.tsx` |
| `trainers` | `renderTrainers()` `1122-1129`, `trStepHTML()` `1105-1121`, `trStepBodyHTML()` `1094-1104`, `trHeaderHTML()` `1087-1093` | `TrainersScreen.tsx` |
| `balls` | `renderBalls()` `1159-1162`, `ballGridHTML()` `1155-1158`, `bestBallHTML()` `1176-1180` | `BallsScreen.tsx` |
| `items` | `renderItems()` `1196-1200`, `itemGridHTML()` `1185-1195` | `ItemsScreen.tsx` |
| `item` | `renderItemPage()` `913-915`, `itemPageBodyHTML()` `883-912` | `ItemScreen.tsx` |
| `settings` | `renderThemes()` `1042-1045`, `renderTermsSetting()` `1038-1041`, `index.html:206-236` | `SettingsScreen.tsx` |
| `sync` | sem referencia no prototipo (UISPEC 8.1) | `SyncScreen.tsx` |
| overlay de captura | `startCapture()` `1278-1298`, `finishCapture()` `1299-1304`, `closeCapture()` `1305` | `CaptureOverlay.tsx` |
| boot/splash | `boot()` `1310-1313`, `index.html:16-28`, `style.css:192-204` | `BootSplash.tsx` |

---

## 2b. Mapa de ciclo de vida das entidades

Nao ha backend: "Create/List/Edit/Delete" sao operacoes na camada de storage local (`src/storage`), e o "read-back" e a leitura do IndexedDB que restaura o estado em toda abertura. Entidades de jogo (especies, golpes, itens, treinadores...) sao somente leitura (dataset).

| Entidade | Create | List (read-back) | Edit | Delete | Tela(s) | Storage op (§5.3) |
|---|---|---|---|---|---|---|
| Capturado (`CapturedEntry {dexNumber, capturedAt}`) | "Capturei" na ficha (RF-48) -> `capturedRepository.add(dex, now)` -> dispara `CaptureOverlay` | Lista Capturados (RF-52/53), badge no card da Dex, contador na Home; read-back no boot via `capturedRepository.getAll()` | nao ha (re-marcar apos desmarcar = novo `add`, animacao repete RF-51) | Desmarcar na ficha ou na lista (RF-50) -> `remove(dex)`; "Apagar dados > Capturados" (RF-122) | `detail`, `captured`, `dex`, `home`, `settings` | doc `captured` (mapa `dex -> capturedAt`) |
| Time (`Team {slots: (number|null)[6]}`) | "Adicionar ao time" na ficha (RF-38); 7o = aviso "time cheio" (RF-39) | Home (RF-41); read-back no boot | reordenar nao existe na Fase 1 [ASSUMPTION: nao pedido] | remover na ficha ou na Home (RF-40); "Apagar dados > Time" | `detail`, `home`, `settings` | doc `team` |
| Historico (`HistoryEntry {dexNumber, viewedAt}` x max 20) | automatico ao abrir ficha (RF-33/43): move para o topo se ja existe (RF-45), remove o mais antigo ao passar de 20 (RF-44) | Home (ultimos 20); read-back no boot | nao ha (RF-46) | so por "Apagar dados > Historico" (RF-46/RF-122) | `home`, `detail`, `settings` | doc `history` |
| Progresso de treinadores (`TrainerProgress {seriesId -> {defeated: string[]}}`) + serie ativa (`activeSeriesId`, `freeroamPausedSeriesId`) | marcar derrotado (RF-60) -> `add(seriesId, trainerId)`; escolher serie (RF-111) -> `setActiveSeries` | Tela Treinadores (cap recalculado); read-back no boot (RF-62/RF-124) | desmarcar (RF-60) -> `remove` | "Apagar dados > Treinadores" | `trainers`, `settings` | doc `trainerProgress` |
| Preferencias (`Preferences {theme, uiLanguage, termsLanguage, termsOverrides, soundEnabled, reduceMotion}`) | valores padrao na 1a abertura (tema `classic`, `pt`, `pt`, `{}`, som ligado RF-88, reduceMotion = `prefers-reduced-motion` RF-93) | aplicadas no boot antes do 1o paint (RF-82/84/90/94); read-back no boot | qualquer toggle em Configuracoes/sidebar/topbar ou toggle PT/EN de card (RF-85/86) | "Apagar dados > Preferencias" (volta aos padroes) | todas | doc `preferences` |
| Backup (arquivo `pontindex-backup-<data>.json`) | "Exportar backup" (RF-98) | n/a (arquivo no dispositivo do usuario) | n/a | n/a | `settings` | `backup.export()` le todos os docs |
| Codigo de sincronizacao (QR/texto/arquivo `.pdx`) | "Gerar codigo" (RF-73) | "Receber codigo" mostra resumo (RF-75) | n/a | n/a (efemero) | `sync` | `sync.encode()` le todos os docs; `sync.apply()` escreve em uma unica transacao |
| Snapshot de seguranca (store `backups`: `pre-migration-*` e `corrupt-*`) | criado por B7.1 antes de cada migracao ou ao isolar um doc corrompido | listado em Configuracoes > Sobre (F10.2 `RestoreSnapshotCard`); "Restaurar" faz `writeMany(snapshot.docs)` | n/a | apenas por "Apagar dados > Tudo" (RF-122) | `settings` | store `backups` (§5.3) |
| Registro orfao (dex/trainer id que sumiu do dataset, RF-123) | nunca criado pelo app; surge por atualizacao do dataset | NUNCA listado nem contado | n/a | so com "Apagar dados" | `captured`, `home`, `trainers` | permanece no doc, filtrado na leitura por `datasetIndex.has(dex)` |

---

## 3. Trade-offs e alternativas rejeitadas

| Decisao | Escolhida | Rejeitada | Motivo |
|---|---|---|---|
| Roteamento | Pilha propria em store (`src/navigation`) integrada a `history.pushState/popstate` | `react-router` puro | RF-01..03 exigem restaurar aba/filtro/scroll/toggles por entrada; o prototipo (`app.js:1207-1250`) ja prova o modelo; react-router nao guarda estado de UI nem scroll de container. |
| Estado global | Zustand (stores pequenas por entidade) | Redux Toolkit / Context puro | Zustand permite seletores finos para que trocar aba re-renderize so o bloco (RF-04) sem boilerplate; Context puro re-renderiza a arvore inteira. |
| Persistencia | IndexedDB via `idb` atras de `StorageAdapter` | `localStorage` | RNF-06 proibe localStorage solto; IndexedDB tem transacoes atomicas (RF-99) e `navigator.storage.persist()`; a interface unica permite trocar por arquivo na Fase 2 (RF-107). |
| Dataset | JSON estatico chunkado por especie, versionado no caminho | SQLite no navegador (sql.js) / um unico JSON gigante | Chunk por especie carrega ~6 KB por ficha; um JSON unico teria ~6 MB no boot; SQLite exigiria WASM de ~1 MB e nao traz ganho para consultas por id. |
| Mecanica de golpes | PokeAPI em build-time, empacotada | PokeAPI em runtime | Decisao 8 do PRD; elimina rede em runtime e dependencia de disponibilidade. |
| Compressao do codigo de sync | `fflate` (deflate-raw) + base64url | `CompressionStream` nativo | `CompressionStream` nao esta em todos os WebViews/Android antigos que a Fase 2 pode atingir; `fflate` tem 8 KB e e deterministico nas duas pontas. |
| QR scan | `@zxing/browser` (camera via `getUserMedia`) | `BarcodeDetector` nativo | `BarcodeDetector` nao existe em Firefox/Safari; zxing cobre multi-frame com leitura continua. |
| Virtualizacao | `@tanstack/react-virtual` | `react-window` | headless (respeita o grid CSS do UISPEC), mede alturas dinamicas, ativo em manutencao. |
| Fontes | `@fontsource/{fredoka,nunito,silkscreen}` empacotadas | `<link>` Google Fonts (como o prototipo, `index.html:7-9`) | RNF-11 permite apenas a PokeAPI como rede em runtime. |
| Icones | `lucide-react` com versao fixa | CDN `lucide@latest` (`index.html:11`) | Nota do orquestrador: nada pode depender de CDN sem pin. |
| Leitura de jars no build | `fflate` (`unzipSync`) em Node | `adm-zip` / `yauzl` | um so pacote para build e runtime; pure JS; o maior jar (128 MB) cabe em memoria no PC de build. |
| Placeholder de imagem | componente unico `ArtworkPlaceholder` (silhueta de Pokebola) | placeholders diferentes por caso | RF-09/RF-16 exigem o MESMO componente. |
| Marca d'agua monocromatica | `mask-image` com `mask-mode: alpha` sobre `pokeball-mask.png` (mascara gerada em B1.4 com o canal alfa = luminancia invertida da pokebola) + `background: var(--text)`; o prototipo nao usa mascara (`style.css:242-243` so tem `filter`), entao `alpha` sobre a mascara pre-processada e a escolha unica, igual a F1.1 | `filter: grayscale` do prototipo (`style.css:243`) | UISPEC 8.7: a letra do RF-119 pede a cor do texto do tema. |

---

## 4. Riscos

| # | Risco | Impacto | Mitigacao no plano |
|---|---|---|---|
| R1 | Normalizacao de nomes de golpe Cobblemon -> PokeAPI (`thundershock` vs `thunder-shock`) falhar para alguns golpes | golpe sem tipo/poder | B3: casamento por nome sem hifens/apostrofos contra a lista completa `move?limit=2000`; lista de excecoes `move-aliases.ts`; build FALHA listando golpes sem match (nunca silencioso). |
| R2 | PokeAPI/GitHub sprites indisponiveis durante o build | build incompleto | B3: cache em disco `tools/dataset/.cache/`, retry com backoff exponencial (5 tentativas), build falha com lista do que faltou; nada parcial e commitado. |
| R3 | Regra do level cap em ramificacoes (varios treinadores-chave disponiveis): implementacao errada da ordem clamp -> max com prerequisitos mostraria 21 em vez de 22 apos Gardenia | numero exibido diferente do jogo | B6.3 implementa a formula literal da decisao 9 do PRD (rev 5) e o teste unitario fixa 22 no passo dos Cedric. |
| R4 | Formula de stats implementada com arredondamento diferente do RF-35 (ex. arredondar em vez de truncar) | valores fora do jogo | B6.2 usa `Math.floor` em cada etapa e o teste fixa 299/328/269/404 para base 100, L100, IV 31, EV 252 (valores do PRD rev 5). |
| R5 | Multiplicadores exatos de bolas condicionais (Heavy por faixa de peso, Nest, Level, Timer, Moon) nao estao em JSON, so no codigo Kotlin do Cobblemon | ranking aproximado | B4: tabela `ball-rules.ts` curada a partir dos tooltips oficiais (fonte primaria do PRD), com melhor caso + texto de condicao (RF-64); faixas de peso da Heavy Ball marcadas [ASSUMPTION]. |
| R6 | 1027 arquivos `species/<dex>.json` + 1074 gritos + 1134 texturas + ~1027 sprites no repositorio (~3.300 arquivos, ~25 MB) | repo pesado, deploy lento | aceito pelo usuario (IDEA); `.gitattributes` marca binarios; Vercel serve estatico; alternativa (Git LFS) rejeitada por custo/complexidade. |
| R7 | Camera indisponivel ou sem permissao no fluxo "Receber codigo" | sync bloqueado | RF-74: colar texto e importar arquivo sempre disponiveis; erro claro quando `getUserMedia` falha. |
| R8 | Quota do IndexedDB excedida / navegador em modo privado | perda de gravacao | §5.3: toda escrita retorna `Result`; falha exibe toast persistente com acao "Exportar backup"; estado em memoria continua; `navigator.storage.persist()` solicitado no 1o gesto. |
| R9 | Migracao de esquema com bug corrompe dados | perda (violacao do RF-96) | §5b: snapshot automatico do doc antigo em `backups` antes de migrar; DOWN = restaurar snapshot; testes de migracao com fixtures da versao anterior. |
| R10 | Overrides de especie de addons (mega_showdown reescreve o JSON inteiro de 52 especies) divergirem do Cobblemon base em campos nao relacionados a formas | dados "errados" na ficha | B2: merge por campo com regra explicita (§5.1.2): Cobblemon base vence em stats/moves/evolucoes; addon contribui `forms[]` (uniao por `name`) e `labels`; relatorio de diff no build. |
| R11 | Contagem de gritos (1074) > especies (1025): arquivos de formas | mapeamento ambiguo | B3: mapear `pokemon/<slug>/<slug>_cry.ogg` pelo `slug` da especie; extras (formas) ficam disponiveis por `slug-forma` para a aba de formas quando existir. |
| R12 | Exemplo PT/EN da busca "pantano" depende do lang do Cobblemon | busca falha se chave mudar | B2 le `cobblemon.species.quagsire.name` = "Pântano" (verificado nesta sessao) e o indice de busca normaliza acentos (NFD). |
| R13 | Drift entre o snapshot `data-source/atm-1.3.0/` e uma atualizacao futura do modpack (novos jars, spawns ou treinadores) | dataset desatualizado sem ninguem perceber | o `datasetVersion` carrega a versao do pack lida do snapshot; ao atualizar o pack, re-extrair o snapshot (mesmo filtro do `data-source/README.md`), atualizar `MANIFEST.json` e rodar `npm run dataset`; `MANIFEST.json` entra em `sources[]` do `dataset-manifest.json` e no Baseline. |

---

## 5. Contratos

**Nao existem endpoints HTTP proprios nem backend em nenhuma fase.** Os contratos abaixo substituem a secao de API: (5.1) pipeline de dados em build-time e seus esquemas de saida; (5.2) chamadas externas em runtime; (5.3) persistencia local; (5.4) codec de sincronizacao. Todos os tipos abaixo sao TypeScript e vivem em `src/data/types.ts` (dataset) e `src/storage/types.ts` (persistencia), ambos escritos completos na Onda 0 (B1.5) e congelados durante as Ondas 1 e 1b (secao 6), e em `src/sync/types.ts` (sync, B7.2); o pipeline em `tools/dataset` importa os mesmos tipos (via `paths` no tsconfig) para garantir que build e runtime concordem.

### 5.1 Pipeline de dados (build-time)

#### 5.1.1 Entradas, ordem de precedencia e comandos

- Comando: `npm run dataset` (= `tsx tools/dataset/src/index.ts`). Flags: `--instance <dir>` (precedencia: flag > env `ATM_INSTANCE_DIR` > padrao `data-source/atm-1.3.0` relativo a raiz do repo; aceita tanto uma instancia real, com jars zipados em `mods/`, quanto o snapshot com cada `mods/<jar>.jar/` ja aberto como diretorio), `--skip-media` (so JSON), `--offline` (usa somente o cache da PokeAPI; falha se faltar algo), `--report` (imprime tabela de contagens e tamanhos).
- **Deteccao do modo da fonte (regra UNICA, a mesma de §5b.2 e B2.1)**: para cada um dos 7 jars obrigatorios, localiza a entrada de `mods/` cujo nome comeca com o prefixo do jar e faz `fs.statSync(<SRC>/mods/<entrada>)`: `isDirectory()` => modo **snapshot** (`DirSourceReader`); `isFile()` => modo **instancia real** (`ZipSourceReader`, jar zipado). Todos os 7 precisam dar o mesmo modo; mistura (uns diretorios, outros arquivos) ou entrada que nao e nem arquivo nem diretorio -> `E_SOURCE_MODE_UNKNOWN`. O modo NUNCA e decidido pela existencia ou pelo nome de `manifest.json`/`MANIFEST.json` (no Windows/NTFS o nome nao diferencia maiusculas: `manifest.json` abre o `MANIFEST.json` do snapshot).
- Ordem de leitura/merge (CONTEXT secao 4 "Precedencia"): (1) `Cobblemon-neoforge-1.7.3+1.21.1.jar` (base); (2) jars de addons em ordem alfabetica de nome de arquivo: `allthemons`, `complete-cobblemon-collection...`, `legendarymonuments`, `mega_showdown`, `zamega`; (3) `kubejs/data/cobblemon/**`; (4) `kubejs/data/rctmod/**` sobre `rctmod-neoforge...jar`; (5) `config/rctmod-server.toml`. O pipeline le cada jar pelo `SourceReader` (zip: `fflate.unzipSync`; snapshot: leitura do diretorio) e filtra por prefixo (`META-INF/neoforge.mods.toml`, `data/cobblemon/`, `assets/<ns>/lang/`, `assets/<ns>/textures/item/`, `assets/cobblemon/sounds/`).
- Validacao de runtime: `node >= 24` (falha com mensagem se menor); `<SRC>` inexistente ou sem pasta `mods/` -> erro `E_INSTANCE_NOT_FOUND` com o caminho tentado; modo ambiguo -> `E_SOURCE_MODE_UNKNOWN` (regra acima); jar obrigatorio ausente -> `E_JAR_MISSING <nome>`; arquivo de metadados do modo detectado ausente ou com esquema errado (snapshot sem `files_per_jar`; instancia sem `name`/`version`) -> `E_SOURCE_MODE_UNKNOWN`; versao do pack diferente de `1.3.0` -> aviso (nao bloqueia) e o valor real entra no `dataset-manifest.json`.
- Limpeza de artefatos: antes de escrever, o pipeline remove `public/data/<datasetVersion>/` (mesma versao) e regrava; versoes antigas em `public/data/` sao removidas ao final se `--keep-old` nao for passado (o site publica uma unica versao).
- `datasetVersion` = `atm<packVersion>-cobblemon<cobblemonVersion>-<yyyymmdd>-<sha8>`, onde `sha8` = 8 primeiros hex do SHA-256 do `species-index.json` gerado (ex. `atm1.3.0-cobblemon1.7.3-20260923-3f9a1c2b`).

#### 5.1.2 Regras de merge de especies (B2)

- Chave de merge: `nationalPokedexNumber` (Cobblemon) ; arquivos `species/custom/*.json` do allthemons entram com seus proprios numeros (9901, 9902). Ha DOIS mecanismos distintos: (a) `species/**.json` de addon = **override completo** (base do Cobblemon vence nos campos centrais, regra abaixo); (b) `species_additions/*.json` (`{"target":"cobblemon:<slug>", ...}`) = **merge aditivo no estilo datapack**: qualquer campo presente na adicao sobrescreve/estende o base: `forms` = uniao por `name` (adicao vence), `drops` = o objeto inteiro da adicao substitui o do base, `evolutions` e `implemented` = valores da adicao quando presentes, `labels`/`features` = uniao, demais campos escalares presentes = valor da adicao. Cobre as 11 adicoes do allthemons (`ampharos, bouffalant, dubwool, flaaffy, lechonk, mareep, miltank, oinkologne, staryu, tauros, wooloo`; ex. `mareep.json` da a Mareep o drop `silentgear:sinew` 25%), as 225 do ccc, as 117 do mega_showdown, as 12 do zamega e `kubejs/.../zzz_ccc_meltan.json`. Cada campo alterado por adicao e registrado em `merge-report.json` com origem.
- Regra por campo do mecanismo (a), ao encontrar override completo de addon para uma especie ja existente: `baseStats`, `moves`, `evolutions`, `abilities`, `eggGroups`, `drops`, `catchRate`, `weight`, `height`, `maleRatio`, `preEvolution` = valor do **Cobblemon base** (fonte de verdade da 1.7.3); `forms[]` = uniao por `name` (addon vence no conflito do mesmo nome, pois e ele quem define Megas); `labels` = uniao. Toda diferenca em campo "base" e registrada em `tools/dataset/out/merge-report.json` (R10).
- Spawns: TODAS as entradas de todos os `spawn_pool_world/*.json` (por `spawns[].pokemon`, ignorando sufixos de aspecto apos espaco, ex. `"magikarp"`) contam; cada entrada registra `source` (`cobblemon` | `<addon>` | `kubejs`).
- (Corrigido 2026-09-24 pela auditoria, ja implementado) `species_additions` sao lidos de QUALQUER namespace e jar, inclusive os 51 do legendarymonuments (`data/cobblemon_drops/species_additions/*`, `data/legendarymonuments/species_additions/meltan.json`). Arquivos com o MESMO resource location seguem a semantica de datapack do jogo: kubejs substitui o jar; entre jars, vence o arquivo do mod que carrega por ultimo, pela ordem transitiva das declaracoes `ordering="AFTER"/"BEFORE"` de todos os `neoforge.mods.toml` (ex.: mega_showdown < allthemons < ccc, entao o ccc vence as 24 colisoes com o mega_showdown). Pares sem ordem seriam somados (nenhum no snapshot atual). Meltan: o kubejs `zzz_ccc_meltan.json` zera `evolutions`, entao o dataset nao mostra evolucao para Melmetal [OPEN: conferir no jogo].
- Fosseis: uniao de `fossils/*.json` de todos os jars: 15 + 1 = **16 rotas**, contadas em build (`datasetManifest.counts.fossilRoutes`), nunca fixadas na UI (RF-114).
- Total de especies esperado: 1025 + 2 = **1027** (`counts.species`); se o valor calculado for diferente, o build imprime aviso, e a UI sempre usa o valor do manifesto (RF-52 "X de 1.027" nasce daqui).

#### 5.1.3 Esquemas de saida (arquivos em `public/data/<datasetVersion>/`)

```ts
// dataset-manifest.json
interface DatasetManifest {
  datasetVersion: string;            // "atm1.3.0-cobblemon1.7.3-20260923-3f9a1c2b"
  generatedAt: string;               // ISO
  pack: { name: string; version: string; minecraft: string };   // "All the Mons", "1.3.0", "1.21.1"
  cobblemonVersion: string;          // "1.7.3"
  sources: { file: string; sizeBytes: number; mtime: string }[];// jars/pastas lidos (fingerprint)
  counts: { species: number; spawnEntries: number; fossilRoutes: number; moves: number; abilities: number;
            items: number; balls: number; trainers: number; keyTrainers: Record<string, number>; series: number;
            cries: number; itemTextures: number; sprites: number };
  levelCapConfig: { initialLevelCap: number; relativeLevelCap: number; initialSeries: string; freeroamRequiresCompletedSeries: boolean };
  media: { criesBytes: number; sfxBytes: number; itemTexturesBytes: number; spritesBytes: number; totalBytes: number };
  files: { speciesIndex: string; typeChart: string; moves: string; abilities: string; items: string; balls: string;
           series: string; fossils: string; biomes: string; speciesDir: string; trainersDir: string };
}

// species-index.json  (array ordenado por dexNumber; custom 9901/9902 no fim)
interface SpeciesSummary {
  dex: number;                         // nationalPokedexNumber (1..1025, 9901, 9902)
  slug: string;                        // "charizard" (id do Cobblemon, usado em cries e busca)
  name: { pt: string; en: string };    // lang cobblemon.species.<slug>.name (pt_br / en_us)
  searchKey: string;                   // "charizard|charizard" -> nomes pt e en normalizados (NFD, sem acento, minusculo) separados por "|"
  types: TypeId[];                     // ["fire","flying"]
  generation: string;                  // "gen1".."gen9", "gen7b", "gen8a", ou "custom"
  labels: string[];                    // inclui "legendary" | "mythical" | "ultra_beast" | "custom" quando presentes
  bst: number;
  rarity: RarityInfo;                  // §5.1.4
  evolutionMethods: EvolutionMethod[]; // ["level","item","friendship","trade","move","other"] ou ["none"] (filtro RF-13)
  hasSprite: boolean;                  // false para 9901/9902 (placeholder, RF-09)
  artworkId: number | null;            // id da PokeAPI para artwork (== dex; null para custom)
}
type TypeId = "normal"|"fire"|"water"|"electric"|"grass"|"ice"|"fighting"|"poison"|"ground"|"flying"|"psychic"|"bug"|"rock"|"ghost"|"dragon"|"dark"|"steel"|"fairy";
type RarityBucket = "common"|"uncommon"|"rare"|"ultra-rare";
interface RarityInfo { primary: RarityBucket | null; secondary: RarityBucket[]; }   // null = sem spawn

// species/<dex>.json
interface SpeciesDetail extends SpeciesSummary {
  pokedexText: { pt: string; en: string } | null;
  height: number; weight: number;      // como no Cobblemon (dm, hg); Charizard 17 / 905
  maleRatio: number;                   // -1 = sem genero
  catchRate: number; baseFriendship: number; eggCycles: number; experienceGroup: string;
  baseStats: { hp: number; attack: number; defence: number; specialAttack: number; specialDefence: number; speed: number };
  evYield: SpeciesDetail["baseStats"];
  abilities: { id: string; hidden: boolean }[];      // "h:" -> hidden true
  eggGroups: string[];                               // ids do Cobblemon, ex. "monster","dragon","undiscovered"
  moves: { level: { level: number; move: string }[]; tm: string[]; egg: string[]; tutor: string[] }; // ids de golpe
  evolutions: EvolutionEdge[];                       // saidas desta especie
  preEvolution: { dex: number; slug: string } | null;
  evolutionChain: EvolutionChain;                    // cadeia completa (raiz + arestas) para desenhar (RF-19)
  forms: SpeciesForm[];                              // [] quando nao ha; nunca inclui a forma base
  drops: { item: string; percentage: number | null; quantityRange: string | null }[]; // achatado de Cobblemon `drops.entries[]`; ex. "cobblemon:silk_scarf", 5
  // O JSON do Cobblemon e `drops: { amount: number; entries: [...] }`; o pipeline grava SO `entries` (array acima) e DESCARTA `amount`
  // de proposito (numero de sorteios por derrota; o PRD RF-25 pede item + chance, e a UI nao exibe sorteios). Entrada sem `percentage` = null.
  spawns: SpawnEntry[];                              // todas as entradas (RF-115)
  obtain: ObtainRoute[];                             // §5.1.5, ordem de confianca ja aplicada
  cry: string | null;                                // "charizard" -> assets/cries/charizard.ogg
}
interface EvolutionEdge {
  id: string; from: number; to: number; toSlug: string;
  variant: "level_up"|"item_interact"|"trade"|"block_click"|"other";
  requiredItem: string | null;                       // "cobblemon:thunder_stone"
  requirements: EvolutionRequirement[];              // ver B2 (level/minLevel, friendship/amount, time_range/range, has_move_type/type, ...)
}
type EvolutionRequirement = { kind: "level"; minLevel: number } | { kind: "friendship"; amount: number } | { kind: "timeRange"; range: string }
  | { kind: "hasMoveType"; type: TypeId } | { kind: "heldItem"; item: string } | { kind: "other"; raw: Record<string, unknown> };
interface EvolutionChain { root: number; nodes: { dex: number; slug: string; name: {pt: string; en: string}; types: TypeId[] }[]; edges: EvolutionEdge[]; }
interface SpeciesForm {
  name: string;                        // "Mega-X" | "Mega-Y" | "Gmax" | "Mega-Z" | "Patrickyu" | regionais
  aspects: string[]; battleOnly: boolean; labels: string[];
  types: TypeId[]; baseStats: SpeciesDetail["baseStats"] | null; abilities: { id: string; hidden: boolean }[];
  source: string;                      // "cobblemon" | "mega_showdown" | "zamega" | "allthemons" | ...
  requiredItems: string[];             // ids de item resolvidos (§B2 passo 7), ex. ["mega_showdown:charizardite_x","mega_showdown:keystone"]
  artworkId: number | null;            // id da PokeAPI da variante (charizard-mega-x -> 10034), null se nao existir
}
interface SpawnEntry {
  id: string; source: string; bucket: RarityBucket; level: string;   // "5-33"
  context: string;                     // "grounded" | "submerged" | "surface" | "fishing" | ...
  presets: string[];
  biomes: string[];                    // tags/ids brutos, ex. "#cobblemon:is_overworld", "#legendary_spawns_ccc:jirachi"
  antiBiomes: string[];
  skyLight: { min: number; max: number } | null; canSeeSky: boolean | null;
  timeRange: "day"|"night"|"any";      // derivado: minSkyLight>=8 => "day"? NAO: skyLight e luz do ceu; timeRange vem de condition.timeRange quando existir, senao "any"
  structures: string[]; neededBaseBlocks: string[]; extra: Record<string, unknown>;
}

// type-chart.json : { attackers: TypeId[]; matrix: Record<TypeId, Record<TypeId, 0|0.5|1|2>> }  (atacante -> defensor -> mult)
// moves.json : Record<string, MoveInfo>
interface MoveInfo { id: string; name: {pt: string; en: string}; description: {pt: string; en: string};
  type: TypeId | null; category: "physical"|"special"|"status"|null; power: number|null; accuracy: number|null; pp: number|null;
  pokeapiId: number | null; }        // null quando a PokeAPI nao conhece (lista em dataset-manifest? nao: build falha, R1)
// abilities.json : Record<string, { id: string; name: {pt,en}; description: {pt,en} }>
// items.json : Record<string, ItemInfo>  (chave = id completo "cobblemon:potion")
interface ItemInfo {
  id: string; namespace: string; path: string;               // "cobblemon", "potion"
  name: {pt: string; en: string}; description: {pt: string; en: string} | null;   // .tooltip do lang
  category: ItemCategory; texture: string | null;            // "assets/items/cobblemon/potion.png"
  tags: ("bait"|"evBerry"|"apricorn")[];                  // B4.1: aba Iscas filtra por tag
  obtain: ItemObtainRoute[];                                 // §5.1.6
  usedIn: { evolutions: { from: number; to: number }[]; fossils: number[]; forms: { dex: number; form: string }[]; ball: boolean; };
  cooking: { effectNote: "pending" } | null;                 // itens de cozinha sem efeito numerico confirmado (PRD Pontos em Aberto 1)
}
type ItemCategory = "medicine"|"ivCandy"|"vitamin"|"expCandy"|"evolution"|"held"|"battle"|"cooking"|"berry"|"bait"|"ball"|"fossil"|"mint"|"other";
// balls.json : BallInfo[] (contagem derivada em build: 48 hoje, = arquivos em textures/item/poke_balls/ sem models/)
interface BallInfo { id: string; itemId: string; name: {pt,en}; effect: {pt,en}; rule: BallRule; tags: ("night"|"water"|"fishing"|"first"|"caught"|"after")[]; }
type BallRule = { kind: "flat"; multiplier: number }
  | { kind: "guaranteed" }
  | { kind: "conditional"; bestMultiplier: number; worstMultiplier: number; condition: BallCondition; applies?: BallApplies };
type BallCondition = "firstTurn"|"lightLevel0"|"turn10"|"targetLevelBelow30"|"playerLevelHigher"|"fullMoonNight"|"fishing"|"submerged"|"registeredCaught"|"oppositeGender"|"sleeping"|"forestOrPlains"|"outsideBattle"|"heavyTarget"|"ultraBeast";
type BallApplies = { types?: TypeId[]; minBaseSpeed?: number; label?: string; spawnContext?: string[]; genderless?: false };
// heavyTarget NAO usa `applies`: e intrinseca e sempre se aplica; o multiplicador sai da faixa de peso (B4.3, HEAVY_BALL_BANDS).
// series.json : SeriesInfo[]
interface SeriesInfo { id: string; title: {pt,en}; description: {pt,en}; difficulty: number|null; requiredSeries: string[][]; special: "freeroam"|null; keyTrainerIds: string[]; trainersFile: string; }
// trainers/<seriesId>.json : { seriesId; trainers: TrainerInfo[] }   (todos os treinadores da serie, chave ou nao)
interface TrainerInfo { id: string; name: string; type: string; typeLabel: {pt,en}; optional: boolean; requiredDefeats: string[][];
  signatureItem: string | null; biomes: { whitelist: string[]; blacklist: string[] }; source: "rctmod"|"kubejs";
  team: { species: string; dex: number|null; level: number; gender: string|null; nature: string|null; ability: string|null; moveset: string[]; heldItem: string|null }[];
  maxTeamLevel: number; bag: { item: string; quantity: number }[]; }
// fossils.json : { result: number; resultSlug: string; fossils: string[]; source: string }[]
// biomes.json : Record<string, {pt: string; en: string}>   (tag -> rotulo humanizado, ver B2 passo 9)
```

#### 5.1.4 Raridade (RF-27), regra e exemplo

`primary` = o bucket **mais comum** presente em `spawns[]` na ordem `common > uncommon > rare > ultra-rare`; `secondary` = os demais buckets presentes, na mesma ordem, sem repetir. Exemplo real (`0133_eevee.json`, verificado): entradas `ultra-rare, rare, uncommon, uncommon, uncommon` -> `primary = "uncommon"`, `secondary = ["rare","ultra-rare"]`. Especie sem spawn (ex. Mewtwo): `primary = null`, `secondary = []` e a UI NAO mostra badge "nao nasce" (RF-10); mostra "Como obter".

#### 5.1.5 Rotas "Como obter" da especie (RF-26), ordem e exemplo

```ts
type ObtainRoute =
  | { kind: "evolution"; from: number; fromSlug: string; edge: EvolutionEdge; fromHasSpawn: boolean }   // (1)
  | { kind: "fossil"; items: string[]; source: string }                                                  // (2)
  | { kind: "packSpawn"; entries: SpawnEntry[] }                                                         // (3) source "kubejs" ou "allthemons"
  | { kind: "addon"; addon: "legendarymonuments"|"raiddens"|"ultrawormholes"|"summoningrituals"|"ccc"; entries?: SpawnEntry[] } // (4)
  | { kind: "breeding"; eggGroups: string[] }                                                            // (5)
  | { kind: "none" };                                                                                    // (6)
```
Regras de derivacao: (1) existe `preEvolution` cujo `species` tem `rarity.primary != null` OU (recursivo) ela mesma tem rota (1); (2) `fossils.json` contem `result == slug`; (3) `spawns` com `source in {kubejs, allthemons}`; (4) `spawns` com `source in {legendarymonuments, complete-cobblemon-collection...}` viram `addon` com o nome do addon (texto curto fixo por addon em i18n: `obtain.addon.legendarymonuments` = "via Legendary Monuments", etc.); Raid Dens e Ultra Wormholes nao tem datapack legivel de spawn no jar [ASSUMPTION: entram como `addon` apenas para `ultra_beast` (Ultra Wormholes) e nao entram para Raid Dens, pois nenhuma rota confirmada por dados existe; RF-69 honestidade]; (5) `eggGroups` nao contem `undiscovered`; (6) lista vazia. O array final segue essa ordem. Exemplo: Mewtwo (sem spawn, `eggGroups: ["undiscovered"]`, `fossils/mewtwo.json` do allthemons) -> `[{fossil, items:["allthemons:pika_star","allthemons:ancient_dna_sample"], source:"allthemons"}]`. Aerodactyl -> `[{fossil, ["cobblemon:old_amber_fossil"]}, {breeding, ["flying"]}]`. Charizard -> `[{evolution from 5}, {breeding, ["monster","dragon"]}]`.

#### 5.1.6 Rotas "Como obter" do item (RF-68/69)

```ts
type ItemObtainRoute =
  | { kind: "craftable"; recipeTypes: string[] }          // existe recipe com result.id == item (qualquer tipo: crafting, smelting, cooking_pot)
  | { kind: "drop"; from: { dex: number; percentage: number|null; quantityRange: string|null }[] }  // indice invertido de species.drops
  | { kind: "plantable"; biomeTags: string[]; mulches: string[] }   // berries/*.json preferredBiomeTags; apricorns/mints [ASSUMPTION: apricorns e mints marcados plantable sem bioma preferido]
  | { kind: "structureLoot"; tables: string[] }            // loot_table/**.json (cobblemon + kubejs injection) cujo entries[].name == item; tables = ids humanizados ("chests/abandoned_mineshaft")
  | { kind: "fishing" }                                    // loot_table/fishing/** ou injection/gameplay/fishing contem o item
  | { kind: "fossilRevive"; species: number[] }            // item aparece em fossils[].fossils
  | { kind: "none" };
```
Exemplo: `cobblemon:fire_stone` -> `craftable` (recipes `fire_stone_from_block`, `..._from_smelting_fire_stone_ore`, verificados) + `drop` (especies cujos drops incluem `cobblemon:fire_stone`) + `structureLoot` (tabelas que o contem, ex. `sets/any_evo_stone` quando referenciada) ; `cobblemon:potion` -> `craftable` (recipe `campfire_pot/*` com `result.id == "cobblemon:potion"`) e o que mais o indice achar; item sem nada -> `[{kind:"none"}]`.

### 5.2 Chamadas externas em runtime

| Chamada | URL | Quando | Fallback |
|---|---|---|---|
| Artwork oficial | `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/<artworkId>.png` (shiny: `.../official-artwork/shiny/<artworkId>.png`) (mesma origem usada pelo prototipo, `app.js:304-307`) | ficha (hero, formas), comparar, overlay de captura (silhueta e revelacao), slots do time (RF-41 usa sprite 96px local; artwork so no hover/desktop [ASSUMPTION]) | `ArtworkPlaceholder` (silhueta de Pokebola, RF-16) apos `onerror` ou timeout de 8 s; se `artworkId == null` (custom), nem tenta e mostra o aviso "imagem nao vem da PokeAPI" (RF-09) |

Nenhuma outra chamada de rede existe em runtime (RNF-11). O service worker faz cache CacheFirst dessas imagens (§2.5). Camera (`getUserMedia`) e leitura de arquivo sao APIs locais, nao rede.

### 5.3 Persistencia local (Fase 1: IndexedDB)

```ts
// src/storage/types.ts
interface StorageAdapter {                     // interface unica (RF-95/RF-107)
  init(): Promise<void>;                       // abre DB, roda migracoes (§5b), solicita persist()
  read<K extends DocKey>(key: K): Promise<DocMap[K] | null>;
  readAll(): Promise<Partial<DocMap>>;
  write<K extends DocKey>(key: K, doc: DocMap[K]): Promise<void>;          // atomico
  writeMany(docs: Partial<DocMap>): Promise<void>;                          // uma unica transacao (sync/backup/migracao)
  delete(keys: DocKey[]): Promise<void>;
  exportSnapshot(): Promise<BackupFile>; importSnapshot(b: BackupFile): Promise<void>;
}
type DocKey = "captured"|"team"|"history"|"trainerProgress"|"preferences"|"meta";
interface DocMap {
  captured: { schemaVersion: 1; entries: Record<string, { capturedAt: number }> };           // chave = String(dex)
  team: { schemaVersion: 1; slots: (number|null)[] };                                        // sempre length 6
  history: { schemaVersion: 1; entries: { dex: number; viewedAt: number }[] };               // max 20, [0] = mais recente
  trainerProgress: { schemaVersion: 1; activeSeriesId: string|null; freeroam: { active: boolean; pausedSeriesId: string|null };
                     series: Record<string, { defeated: Record<string, { at: number }> }> };
  preferences: { schemaVersion: 1; theme: ThemeId; uiLanguage: "pt"|"en"; termsLanguage: "pt"|"en";   // ThemeId = "classic"|"black"|"green"|"blue"|"purple"|"white"|"orange" (THEME_IDS em src/styles/themes.ts, ordem canonica do RF-79, append-only; nomes do prototipo/UISPEC: classico, preto, verde, azul, roxo, branco, laranja)
                 termsOverrides: Record<string, "pt"|"en">; soundEnabled: boolean; reduceMotion: boolean | null };  // null = seguir o sistema
  meta: { schemaVersion: number; createdAt: number; lastWriteAt: number; datasetVersionSeen: string|null; appVersion: string };
}
```
- Banco: `indexedDB.open("pontindex", DB_VERSION)`; object stores: `documents` (keyPath `key`), `backups` (keyPath `id`, guarda snapshots pre-migracao). `DB_VERSION` so muda quando a estrutura de stores muda; a versao de esquema dos DOCUMENTOS e `meta.schemaVersion` (RF-96), independente.
- **Escrita atomica (RF-99)**: `write` abre UMA transacao `readwrite` em `documents`, grava o doc e atualiza `meta.lastWriteAt` na mesma transacao; IndexedDB garante tudo-ou-nada. Para a Fase 2 (arquivo), `FileStorageAdapter.write` grava `<doc>.json.tmp`, faz `fsync`, e renomeia sobre `<doc>.json`. Escritas sao serializadas por uma fila (`writeQueue`) para evitar reordenacao; salvar o mesmo conteudo duas vezes e idempotente (docs sao substituidos por inteiro, nunca "append").
- **Leitura defensiva**: doc ausente -> padrao; doc com JSON invalido/campos faltando -> `validateDoc` (zod) tenta reparar campo a campo (ex. `team.slots` com 5 posicoes vira 6; `history` com >20 e truncado; entrada com `dex` nao numerico e descartada) e registra `console.warn`; se irreparavel, o doc corrompido e copiado para `backups` (`id = "corrupt-<key>-<ts>"`) e substituido pelo padrao, com toast informando (nunca silencioso).
- **Orfaos (RF-123)**: repositorios nunca apagam ids desconhecidos; toda leitura para UI passa por `filterKnown(datasetIndex)`.
- **Quota/erro**: `write` rejeita com `StorageError { code: "QUOTA_EXCEEDED"|"BLOCKED"|"UNAVAILABLE"|"UNKNOWN" }`; a store mantem o estado em memoria e mostra toast persistente com "Tentar de novo" e "Exportar backup".
- **Persistencia duravel**: no 1o gesto do usuario, `navigator.storage.persist()`; resultado exibido em Configuracoes > Sobre ("Armazenamento persistente: sim/nao").
- **Backup (RF-98)**: `BackupFile { app: "pontindex"; format: 1; schemaVersion; appVersion; datasetVersion; exportedAt; documents: Partial<DocMap>; crc32: string }` salvo como `pontindex-backup-<yyyy-mm-dd>.json` via `<a download>` (Fase 1). Import: valida `app`, `format`, `crc32`, migra `schemaVersion` se antigo, mostra resumo e pergunta Mesclar/Substituir (mesmo fluxo do sync, §5.4.4), aplica com `writeMany`.

### 5.4 Codigo de sincronizacao (RF-72..78, RF-112, RF-113)

#### 5.4.1 Payload binario (antes da compressao), little-endian

| Offset | Campo | Tipo | Notas |
|---|---|---|---|
| 0 | magic | 3 bytes ASCII `"PDX"` | rejeita qualquer outro (`foreignApp`) |
| 3 | formatVersion | u8 = 1 | > `SUPPORTED_SYNC_VERSION` => `unsupportedVersion` |
| 4 | schemaVersion | u8 | versao dos documentos na origem (migrada na recepcao) |
| 5 | exportedAt | u32 (segundos unix) | docs guardam ms; codec grava `Math.floor(ms/1000)` e le `*1000` (vale para todos os `at`/`viewedAt`/`capturedAt` abaixo) |
| 9 | maxDex | u16 | maior dex "normal" coberto pelo bitmap (1025 hoje) |
| 11 | capturedBitmap | `ceil((maxDex+1)/8)` bytes | bit `dex` = capturado (bit 0 nao usado); 1026 bits = 129 bytes |
| 11+B | customCapturedCount | u8 | especies com dex > maxDex (9901, 9902) |
| ... | customCaptured | u16 x count | |
| ... | capturedAtMode | u8 | 0 = sem datas; 1 = lista de (u16 dex, u32 at) para todos os capturados [ASSUMPTION: modo 1 sempre, para a mesclagem de "Capturado em" preservar a data mais antiga] |
| ... | team | u16 x 6 (fixo, 12 bytes) | um u16 por slot na ordem 0..5; `0` = slot vazio (`null`). Nao ha `teamCount` nem omissao de vazios, para `decode(encode(x)) == x` valer: `[6,null,94,null,null,149]` volta identico, com os `null` nas mesmas posicoes |
| ... | historyCount | u8 | 0..20 |
| ... | history | (u16 dex, u32 viewedAt) x count | mais recente primeiro |
| ... | activeSeries | u8 len + ASCII | "" = nenhuma |
| ... | freeroamActive | u8 | 0/1 |
| ... | pausedSeries | u8 len + ASCII | |
| ... | seriesCount | u8 | |
| ... | series[] | u8 len + ASCII id, u16 defeatedCount, (u8 len + ASCII trainerId, u32 at) x defeatedCount | |
| ... | prefs | u8 theme (indice em `THEME_IDS` de `src/styles/themes.ts`, ordem canonica append-only do RF-79), u8 uiLang (0 pt/1 en), u8 termsLang, u8 sound, u8 reduceMotion (0/1/2=system), u8 overrideCount, (u8 len + ASCII cardKey, u8 lang) x n | |

Envelope (camada unica): `compressed = deflateRaw(payload)` (`fflate`); `text = "PDX1." + base64url(compressed + crc32(compressed) as u32 LE)`; o magic `PDX` existe SOMENTE no cabecalho do payload. Ordem exata de verificacao no decode (a primeira que falhar define o erro; nenhuma escrita em caso algum de erro):
1. Normaliza: remove todo whitespace (quebras de linha de WhatsApp etc.); texto vazio -> `empty`.
2. `text.length > 200000` caracteres -> `oversized` (barato, antes de qualquer decodificacao; mesmo limite de §5c).
3. Prefixo: comeca com `PDXF.` -> nao e erro, o texto vai para o `FrameCollector` (§5.4.2); nao comeca com `PDX1.` -> `foreignApp`.
4. base64url do restante invalido, ou menos de 5 bytes decodificados -> `corrupted`.
5. Tamanho comprimido: `compressed = bytes.slice(0, -4)`; `compressed.length > 65536` -> `oversized` (antes de inflar).
6. `crc32(compressed)` diferente do trailer u32 LE -> `corrupted`.
7. Inflate em streaming (`fflate.Inflate`) contando os bytes de saida: passou de 512 KB (524288 bytes) -> aborta com `oversized`; erro de deflate -> `corrupted`.
8. Cabecalho do payload: magic != `PDX` -> `foreignApp`; `formatVersion > SUPPORTED_SYNC_VERSION` ou `schemaVersion > CURRENT_SCHEMA_VERSION` -> `unsupportedVersion`.
9. Validacao campo a campo com bounds check em cada leitura (contagens, comprimentos de string, ids ASCII, bytes sobrando no fim) -> `corrupted`.

Resumo por codigo: `empty` (1), `oversized` (2, 5, 7), `foreignApp` (3, 8), `corrupted` (4, 6, 7, 9), `unsupportedVersion` (8), `incomplete` (so no `FrameCollector`). Comprimento tipico: 100 capturados + 10 treinadores derrotados ~ 420 caracteres (1 QR); caso maximo (1027 capturados com datas, 6 no time, 20 no historico, 110 treinadores derrotados, prefs) ~ 129 + 6.200 (datas) + 12 (time fixo) + 121 + 3.400 (ids) bytes = ~9,9 KB brutos -> ~3,2 KB deflate -> ~4,3 K caracteres -> 5 frames.

#### 5.4.2 Multi-frame QR (RF-113)

- `FRAME_CAPACITY = 900` caracteres por QR, em modo byte (QR versao 24, correcao M: 914 codewords de dados, cerca de 911 bytes uteis em modo byte; base64url nao cabe no modo alfanumerico) [ASSUMPTION: escaneavel por camera de celular comum]; o cabecalho do frame conta dentro dos 900. Se `text.length <= 900`: um QR com o texto `PDX1.<b64>`. Senao: frames `PDXF.<index>/<total>.<sessionId>.<chunk>` (index 1-based, `sessionId` = 6 chars base36 aleatorios para nao misturar sessoes; o parser divide apenas nos 3 primeiros pontos, o `chunk` pode conter qualquer caractere base64url), exibidos em carrossel automatico (troca a cada 1,5 s) com setas manuais e contador "Frame 2 de 5".
- Receptor: aceita frames em qualquer ordem, mostra "Faltam N frames (2/5 lidos)", rejeita frame de outro `sessionId` com aviso; ao completar, concatena e decodifica como o caso simples. Texto colado / arquivo `.pdx` sempre contem o codigo inteiro (sem frames).

#### 5.4.3 Validacao (matriz completa em §5c)

`decodeSyncCode(text): Result<SyncPayload, SyncError>` com `SyncError.code in { "foreignApp","unsupportedVersion","corrupted","incomplete","oversized","empty" }`. Qualquer erro => NENHUMA escrita (RF-76). Ids desconhecidos no dataset local (dex ou trainerId) sao preservados como orfaos (RF-123) mas contados no resumo como "N registros de uma versao diferente do dataset (mantidos, nao exibidos)".

#### 5.4.4 Resumo e mesclagem (RF-75, RF-78)

- Resumo exibido antes de aplicar: `{ captured: n, team: n, history: n, trainersDefeated: { seriesId: n }, preferences: true, exportedAt, unknownIds: n }` e a previa do resultado por modo.
- **Substituir**: todos os docs locais sao trocados pelos do codigo (uma transacao `writeMany`).
- **Mesclar** (padrao), por entidade:
  - capturados = uniao; `capturedAt` = o menor (mais antigo) dos dois quando ambos tem.
  - treinadores derrotados = uniao por serie (ids); em conflito de `at`, o menor (mais antigo) vence, como em `capturedAt`; `activeSeriesId`/freeroam = mantem os do receptor, a menos que o receptor nao tenha serie ativa, caso em que usa a do codigo.
  - time = mantem o do receptor, a menos que esteja totalmente vazio (6 `null`), caso em que usa o recebido.
  - historico = concatena as duas listas, remove duplicados por `dex` mantendo o maior `viewedAt`, ordena por `viewedAt` desc, corta em 20.
  - preferencias = mantem as do receptor (incluindo overrides por card).
- Exemplo trabalhado (criterio de aceite do PRD): A tem 10 capturados {1..10}, BDSP com Roark derrotado, time [6,448,94,149,null,null], historico [6,448,25]; B tem 5 capturados {11..15}, nenhum treinador, time vazio, historico [150,133]. B recebe A em Mesclar => capturados = 15 (`{1..15}`); `trainerProgress.series.bdsp.defeated = {gym_leader_roark_0395}`; time de B = [6,448,94,149,null,null] (B estava vazio); historico = os 5 ordenados por `viewedAt` desc (cabem nos 20); preferencias = as de B.

### 5.5 API dos modulos de dominio e infra consumida pelo Frontend (nomes canonicos)

Definidos nos sprints B6/B7 e citados verbatim nas entradas "Consumes" das features de Frontend:

| Modulo | Exports |
|---|---|
| `src/domain/type-chart.ts` | `TYPE_CHART`, `effectivenessAgainst(defenders)`, `groupByMultiplier(map)` |
| `src/domain/stats.ts`, `natures.ts` | `calculateStats(baseStats, level, ivs, evs, natureId)`, `calculateHp`, `calculateOther`, `recommendedInvestment(baseStats)`, `NATURES` |
| `src/domain/level-cap.ts` | `requiredDefeatsSatisfied`, `isAvailable`, `computeTrainerLevel`, `computeSeriesCap`, `isSeriesCompleted`, `isSeriesUnlocked` |
| `src/domain/ball-ranking.ts` | `rankBalls(species, balls, ctx)` -> `RankedBall[]` |
| `src/domain/normalize.ts` (Onda 0, B1.5) | `normalizeSearch` (fonte unica; usada pelo pipeline em B2.2 `searchKey` e por `search.ts`) |
| `src/domain/search.ts` | `normalizeSearch` (reexportada de `normalize.ts`), `parseDexQuery`, `searchSpecies(index, q, limit)`, `searchItems(items, q)` |
| `src/domain/history.ts`, `team.ts` | `HISTORY_LIMIT`, `pushHistory`, `mergeHistory`, `TEAM_SIZE`, `addToTeam`, `removeFromTeam` |
| `src/domain/ball-rules-types.ts` (Onda 0, B1.5) | reexporta `BallRule`/`BallCondition`/`BallApplies` de `src/data/types.ts`, `HEAVY_BALL_BANDS` (consumido por B4.3 e B6.4) |
| `tools/dataset/src/species/rarity.ts`, `obtain.ts` (so build-time) | `deriveRarity(spawns)`, `deriveSpeciesObtain(species, ctx)`; nenhum codigo de runtime os importa (a UI le `rarity`/`obtain` prontos no dataset), por isso ficam na pasta do agente Especies e nao em `src/domain/` |
| `src/storage/*` | `StorageAdapter` (`init/read/readAll/write/writeMany/delete/exportSnapshot/importSnapshot`), `filterKnown(datasetIndex)`, `requestPersistence()`, `restorePreMigrationSnapshot(id)`, repositorios `captured/team/history/trainerProgress/preferences` |
| `src/storage/backup.ts` | `exportBackup`, `parseBackup`, `applyBackup`, `deleteData` |
| `src/sync/*` | `encodeSyncCode(docs)` -> `SyncEncoded {text, frames, bytes, summary}`, `decodeSyncCode(text)`, `splitFrames`, `FrameCollector`, `mergeDocuments(local, incoming, mode)`, `summarize`, `SyncError` |
| `src/data/loaders.ts` | `loadManifest`, `loadSpeciesIndex`, `loadSpecies(dex)`, `loadMoves`, `loadAbilities`, `loadItems`, `loadBalls`, `loadSeries`, `loadTrainers(seriesId)`, `loadTypeChart`, `loadBiomes`, `loadFossils` |
| `src/data/schemas.ts` (B7.4) | esquemas zod de §5.1.3 (`speciesDetailSchema`, `speciesSummarySchema`, `datasetManifestSchema`, ...), usados pelos loaders e pela validacao do pipeline em B2.5 |
| `src/styles/themes.ts` (Onda 0, B1.5) | `ThemeId`, `THEME_IDS` (ordem canonica append-only do RF-79) |
| `src/audio/*` | `playSfx(name)` (respeita o toggle), `playCry(slug)` (sempre toca); nomes de som = lista unica de B3.4 passo 2 |

---

## 5b. Dependencias e configuracao

### 5b.1 Bibliotecas (versoes fixas no `package.json`, sem `^`) [ASSUMPTION nas versoes exatas: usar a ultima estavel no dia da instalacao e travar]

| Pacote | Versao alvo | Uso |
|---|---|---|
| `react`, `react-dom` | 19.1.x | UI |
| `typescript` | 5.8.x | tipos |
| `vite` | 6.3.x | bundler/dev server |
| `@vitejs/plugin-react` | 4.4.x | JSX |
| `vite-plugin-pwa` | 1.0.x (Workbox 7) | manifest + service worker (RF-103, §2.5) |
| `zustand` | 5.0.x | estado global |
| `idb` | 8.0.x | IndexedDB com promises |
| `zod` | 3.24.x | validacao de docs/dataset/backup |
| `@tanstack/react-virtual` | 3.13.x | lista virtualizada (RNF-01) |
| `lucide-react` | 0.5xx (fixa) | icones de UI (nota do orquestrador: sem CDN) |
| `@fontsource/fredoka`, `@fontsource/nunito`, `@fontsource/silkscreen` | 5.x | fontes empacotadas (RNF-11) |
| `fflate` | 0.8.x | deflate-raw (sync) e unzip (pipeline) |
| `qrcode` | 1.5.x | gerar QR em `<canvas>` |
| `@zxing/browser` + `@zxing/library` | 0.1.x / 0.21.x | scan pela camera (lazy chunk) |
| `tsx` | 4.19.x | rodar o pipeline TS em Node |
| `sharp` | 0.34.x | gerar icones PWA da pokebola e a mascara da marca d'agua (build) |
| `@iarna/toml` | 2.2.x | ler `rctmod-server.toml` |
| `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `fake-indexeddb` | ultimas estaveis | testes unit/componente (T1) |
| `@playwright/test` | 1.5x | e2e (T1), `headless: true`, sem `slowMo`, sem esperas artificiais (auto-waiting / `expect.poll`) |
| `fast-check` | 3.x | property tests do codec de sync (T1) |
| `msw` | 2.x | mock de `fetch` (dataset/artwork) nos testes de componente (T1) |
| `eslint`, `typescript-eslint`, `prettier` | ultimas estaveis | qualidade |
| Fase 2: `electron`, `electron-builder`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, `@capacitor/filesystem` | 8.x (Capacitor) | nao instalar na Fase 1 |

### 5b.2 Configuracao e variaveis (NOMES apenas; nenhum valor sensivel existe neste projeto)

- `ATM_INSTANCE_DIR`: caminho da fonte de dados do pipeline; padrao = `data-source/atm-1.3.0` (repo-relativo, funciona em qualquer PC sem o modpack); pode apontar para uma instancia real do CurseForge (jars zipados em `mods/`). Modo da fonte (regra UNICA, identica a §5.1.1 e B2.1): `fs.statSync(<SRC>/mods/<jar>)` de cada um dos 7 jars obrigatorios; `isDirectory()` => snapshot, `isFile()` => instancia real zipada; mistura -> `E_SOURCE_MODE_UNKNOWN`; nunca decidido pelo nome ou pela existencia de `manifest.json`/`MANIFEST.json` (NTFS nao diferencia maiusculas). Precedencia: `--instance` > `ATM_INSTANCE_DIR` > padrao.
- `POKEAPI_BASE_URL` (padrao `https://pokeapi.co/api/v2`), `POKEAPI_SPRITES_BASE_URL` (padrao raw GitHub), `DATASET_CACHE_DIR` (padrao `tools/dataset/.cache`; uma subpasta por etapa, `pokeapi/` e `sprites/`, cada uma com um unico dono, B2.1 passo 4b).
- `VITE_APP_VERSION` (injetada pelo `vite.config.ts` a partir de `package.json`), `VITE_DATASET_VERSION` (lida de `public/data/current.json` no build).
- `vercel.json`: `{"cleanUrls": true, "headers": [cache imutavel para /data/*, /assets/*; `Service-Worker-Allowed`]}`; sem env na Vercel.
- `.gitignore`: o arquivo atual do repo (`node_modules/`, `dist/`, `dist-electron/`, `release/`, `out/`, `android/app/build/`, `android/.gradle/`, `android/build/`, `*.log`, `.DS_Store`, `Thumbs.db`, `.env`, `.env.*`) mais `tools/dataset/.cache/`, `test-results/`, `playwright-report/`, `*.local` (B1.2). Nenhuma regra para `.forge/` (tudo versionado, decisao do usuario) nem para `data-source/`.

### 5b.3 Versoes de esquema e migracoes

- `meta.schemaVersion` inicial = **1** (docs de §5.3). Migracoes em `src/storage/migrations/index.ts`: array ordenado `{ from: number; to: number; up(docs): docs }`. `init()`: le `meta`; se `schemaVersion < CURRENT`, (a) grava snapshot `backups[{id:"pre-migration-v<from>-<ts>", docs}]`, (b) aplica `up` em memoria, (c) `writeMany` de todos os docs + `meta` na MESMA transacao (atomico), (d) mantem o snapshot (limpo apenas por "Apagar dados > Tudo"). Se `schemaVersion > CURRENT` (app antigo lendo dados novos): modo somente-leitura com aviso "atualize o app", nenhuma escrita (protege RF-96).
- **DOWN/rollback**: `restorePreMigrationSnapshot(id)` disponivel em Configuracoes > Sobre > "Restaurar dados de antes da atualizacao" (lista os snapshots), que faz `writeMany(snapshot.docs)` e regrava `meta.schemaVersion = snapshot.version`; combinado com o app antigo (rollback de deploy na Vercel), restaura o estado. Backup exportado (RF-98) e o rollback manual universal.
- Versao 1 -> nao ha migracao a executar na Fase 1; o mecanismo e testado com uma migracao sintetica `0 -> 1` (docs antigos do prototipo em `localStorage['pontindex.terms']` e `['pontindex.sound']`, `app.js:654-655` e `1067/1407`): se existirem, `up` os importa para `preferences` e os remove do localStorage (migracao real e util para quem testou o prototipo no mesmo host).

---

## 5c. Autorizacao e matriz de validacao

Usuario unico local, sem autenticacao, sem papeis, sem sessao (PRD secao 5). Nao ha matriz de permissoes. A unica superficie de "entrada externa" e o codigo de sincronizacao / arquivo de backup; a matriz abaixo define o comportamento obrigatorio (RF-76: erro => zero escrita):

| Entrada | Deteccao | Codigo de erro | Comportamento na UI | Escrita |
|---|---|---|---|---|
| Codigo valido, mesma versao | magic `PDX`, versao suportada, CRC ok, todos os frames | - | resumo (RF-75) -> Mesclar/Substituir -> aplica | uma transacao |
| Codigo valido, `schemaVersion` mais antigo | idem + `schemaVersion < CURRENT` | - | migra em memoria (mesmas `up`), depois resumo | idem |
| Codigo de app/versao mais nova | `formatVersion > SUPPORTED` ou `schemaVersion > CURRENT` | `unsupportedVersion` | "Este codigo foi gerado por uma versao mais nova do Pontindex. Atualize o app." | nenhuma |
| Corrompido (CRC, base64 invalido, deflate falha, campos truncados) | qualquer excecao no decode | `corrupted` | "Codigo invalido ou corrompido. Confira se copiou tudo." | nenhuma |
| Incompleto (multi-frame faltando) | `frames.size < total` | `incomplete` | "Faltam N frames" (estado, nao erro final); botao "Cancelar" limpa | nenhuma |
| Frames de sessoes diferentes | `sessionId` diferente | `incomplete` + aviso | "Este frame e de outro codigo; continue lendo os frames do mesmo codigo ou recomece." | nenhuma |
| Muito grande | texto > 200.000 caracteres, comprimido > 65536 bytes ou inflado > 512 KB (passos 2, 5 e 7 de §5.4.1) | `oversized` | "Codigo grande demais para ser um codigo do Pontindex." | nenhuma |
| App estrangeiro / texto qualquer | magic != `PDX` | `foreignApp` | "Isso nao parece um codigo do Pontindex." | nenhuma |
| Vazio | texto em branco | `empty` | botao "Receber" desabilitado; mensagem inline | nenhuma |
| Ids desconhecidos (dex/trainer fora do dataset) | pos-decode | - (aviso) | resumo mostra "N registros de outra versao do dataset (mantidos, nao exibidos)" | preservados como orfaos (RF-123) |
| Backup (`.json`) com `app != "pontindex"` ou `format` desconhecido ou CRC errado | validacao zod + crc | `corrupted`/`foreignApp` | mesmas mensagens | nenhuma |
| Camera negada/indisponivel | `getUserMedia` rejeita | - | painel mostra "Camera indisponivel" + campos colar/arquivo em destaque | n/a |

---

## 6. Divisao do trabalho

- **Backend** (agente `forge-imp-backend`): scaffolding do projeto (Vite/TS/PWA/Vercel), pipeline de dados e esquemas, extracao de midia, modulos de dominio puros, camada de persistencia (IndexedDB + migracoes + backup), codec de sincronizacao e loaders do dataset. Nada de React aqui alem de `main.tsx` placeholder.
- **Frontend** (agente `forge-imp-frontend`): toda a UI React, seguindo o UISPEC (contrato visual) e consumindo os contratos da secao 5 e os modulos de dominio do Backend.
- **Fase 2** (futura, NAO executar na Fase 1): Electron e Capacitor sobre o mesmo `dist/`, atualizador e botao "Baixar app".
- **Testes** (sprint T1, Fase 1): definidos, nao escritos aqui.

Ordem de execucao (plano em ondas aprovado pelo Pontin em 2026-09-24; respeita os campos **Consumes** de cada feature):

| Onda | Agente (modelo) | Features | Arquivos exclusivos (escreve so aqui) | Pre-requisito |
|---|---|---|---|---|
| 0 | Base (Opus) | B1.1-B1.5, B2.1, B2.2 | arquivos da raiz do projeto (`package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.gitattributes`, `.npmrc`, `vercel.json`, `README.md`, `index.html`), `src/main.tsx`, `src/vite-env.d.ts`, `src/components/Icon.tsx`, `src/styles/fonts.ts`, `src/styles/types.generated.css`, `tools/gen/`, `src/assets/`, `public/icons/`, `public/data/.gitkeep`, `tests/setup.ts`, `tools/dataset/README.md`, saida temporaria `tools/dataset/out/_base/`, contratos compartilhados (lista abaixo), `tools/dataset/src/{index,cli,config,context,instance,source-reader,jar-reader,lang,write,report}.ts`, `tools/dataset/src/lib/`, `species/{collect,merge}.ts`, stubs de etapa; testes `tests/unit/build/`, `tests/unit/dataset/{source,species-merge}.test.ts`, `tests/fixtures/{source,species-merge}/` | - |
| 1 | Especies (Sonnet) | B2.3, B2.4 | `tools/dataset/src/species/{stage-derive,spawns,rarity,fossils,obtain,evolutions,forms}.ts`; `tests/unit/dataset/species.test.ts`, `tests/fixtures/species/`; saida temporaria `tools/dataset/out/_species/` | Onda 0 |
| 1 | PokeAPI e midia (Sonnet) | B3.1, B3.2, B3.4 | `tools/dataset/src/pokeapi/{client,cache,move-aliases,stage}.ts`, `tools/dataset/src/{moves,abilities}.ts`, `tools/dataset/src/media/`, `src/audio/sfx-names.ts`; `tests/unit/dataset/pokeapi-media.test.ts`, `tests/fixtures/pokeapi-media/`; saida temporaria `tools/dataset/out/_pokeapi-media/`; cache `tools/dataset/.cache/pokeapi/` | Onda 0 |
| 1 | Treinadores e bolas (Sonnet) | B5.1, B5.2, B4.3 | `tools/dataset/src/trainers/`, `tools/dataset/src/config-toml.ts`, `tools/dataset/src/balls/`; `tests/unit/dataset/trainers-balls.test.ts`, `tests/fixtures/trainers-balls/`; saida temporaria `tools/dataset/out/_trainers-balls/` | Onda 0 |
| 1 | Regras e armazenamento (Opus) | B6.1-B6.6, B7.1-B7.4 | `src/domain/` (exceto `normalize.ts` e `ball-rules-types.ts`, congelados), `src/storage/` (exceto `types.ts`), `src/sync/`, `src/data/{loaders,cache,schemas}.ts`, `src/platform/`; `tests/unit/{domain,storage,sync,data}/`, `tests/fixtures/rules-storage/` | Onda 0 (so importa os contratos congelados) |
| 1b | Frontend (forge-imp-frontend) | F1.1, F1.2, F1.3 | `src/styles/{tokens,themes,base,components}.css`, `src/styles/theme-meta.ts`, `src/i18n/`, `src/navigation/`, `src/state/preferences-store.ts`, `src/components/{Watermark,TypeChip,TypeIcon,TermsToggle,ScreenRouter}.tsx`; `tests/unit/ui-foundation/`, `tests/harness/`, `tests/harness/foundation.spec.ts`, `tests/fixtures/ui-foundation/` | entra SO quando as DUAS condicoes valem: (a) um agente da Onda 1 terminou (teto de 4 agentes simultaneos) E (b) B7.1 esta verde no checklist (o `preferences-store` usa os repositorios de B7.1) |
| 2 | Juncao (Sonnet) | B3.3, B4.1, B4.2, B2.5 (nesta ordem) | `tools/dataset/src/{sprites,artwork-ids,biomes,type-chart,biome-labels.pt}.ts`, `tools/dataset/src/pokeapi/stage.ts` (acrescenta B3.3; o agente dono ja terminou), `tools/dataset/src/items/`, `tools/dataset/src/species/index-writer.ts`, `tools/dataset/.cache/sprites/` (e reuso de `.cache/pokeapi/`, cujo dono da Onda 1 ja terminou), `tools/dataset/out/_staging/`, e os UNICOS escritores de `public/data/` e `public/assets/` (primeira execucao completa do pipeline, com publicacao); `tests/unit/dataset/join.test.ts`, `tests/fixtures/join/` | Onda 1 completa (B3.3 <- B3.1, B2.4; B4.1 <- B2.1, B3.4; B4.2 <- B2.3, B2.4, B4.1, B4.3; B2.5 <- B2.1-B2.4, B6.1, B7.4 `schemas.ts`, e os contadores de B3/B4/B5 no contexto) |
| 2b | Auditoria de dados (Opus, agente independente que nao escreveu o pipeline) | A1 (sem codigo de produto) | `tools/dataset/audit/` (script de auditoria + `AUDIT_REPORT.md` gerado), `tests/unit/dataset/audit.test.ts`, `.forge/in-progress/pontindex/HANDOFF_audit.md`; SO LEITURA do resto | Onda 2 verde (dataset publicado em `public/data/`) |
| 3 | Frontend | F1.4 (apos B7.1 e B3.4), depois F2 -> F3 -> F4 -> F5 -> F6 -> F7 -> F8 -> F9 -> F10 -> F11 -> F12 | `src/` de UI restante (sequencial, um agente); `tests/harness/no-overlap.ts` (criado em F1.4; `tests/harness/` foi da Onda 1b, ja concluida); testes das features F1.4-F12.1 (`tests/e2e/<tela>.spec.ts` e `tests/unit/ui-screens/`); T1 reutiliza o helper | Onda 1b verde; Onda 2 verde e Onda 2b (auditoria) sem divergencia aberta para F2+ (dataset real); backend verde nas dependencias de cada feature |
| 4 | Testes | T1 | `tests/` restantes | Tudo acima |

**Arquivos compartilhados (Onda 0, congelados durante as Ondas 1 e 1b)**: escritos COMPLETOS pela Onda 0 (B1.5 e B2.1) e depois somente importados; uma mudanca necessaria volta ao orquestrador, que a aplica em um commit proprio e avisa os agentes em curso. Lista: `src/data/types.ts` (todos os tipos de §5.1.3), `src/storage/types.ts` (tipos de §5.3), `src/styles/themes.ts` (`ThemeId`, `THEME_IDS`), `src/domain/ball-rules-types.ts` (`HEAVY_BALL_BANDS`), `src/domain/normalize.ts` (`normalizeSearch`), `tools/dataset/src/context.ts` (`PipelineContext`: contadores, registro de midia, `outDir`, `cacheDir(stage)`), `tools/dataset/src/index.ts` e `cli.ts` (ordem das etapas, encaixes, `--only`/`--out`), `tools/dataset/src/write.ts` (`publish`, so chamado por B2.5), `package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `eslint.config.js`.

Auditoria de dados (Onda 2b, decisao do Pontin 2026-09-24; substitui a conferencia dentro do jogo, que nao e possivel neste PC): um agente Opus independente compara o dataset publicado com os arquivos originais de `data-source/atm-1.3.0/`, sem usar o codigo do pipeline (le os JSON crus por conta propria). Duas partes: (1) checagem EXAUSTIVA automatizada das 1027 especies nos campos mecanicos (tipos, stats base, habilidades, grupos de ovo, taxa de captura, peso/altura, lista de formas, evolucoes com item/nivel/condicao, drops com chance, buckets de raridade e biomas de spawn, fosseis) e dos 48 bolas, itens e treinadores-chave por serie; (2) AMOSTRA manual de 50 especies (comuns, iniciais, lendarias, miticas, com Mega/Gmax, alteradas por addon, as custom Creepyon e Piglich, as com spawn so via kubejs) conferindo campo a campo, inclusive textos PT/EN. Cada divergencia vira bug no checklist e volta ao agente dono; a Onda 3 so comeca com a auditoria sem divergencia aberta (ou divergencia aceita pelo Pontin). Resultado em `tools/dataset/audit/AUDIT_REPORT.md`.
Regras das ondas: agentes paralelos trabalham no mesmo branch e na mesma arvore, cada um SOMENTE nos arquivos da sua coluna "Arquivos exclusivos" (conferido: nenhum caminho aparece em duas linhas da mesma onda) e commitando so os proprios caminhos (`git commit -- <paths>`; em `index.lock` ocupado, repetir). Os stubs de etapa (`species/stage-derive.ts`, `pokeapi/stage.ts`, `media/stage.ts`, `balls/stage.ts`, `trainers/stage.ts`, `items/stage.ts`, `species/index-writer.ts`) sao criados vazios pela Onda 0 e passam a pertencer ao agente da linha que os lista; `index.ts` ja os chama na ordem final, entao nenhum agente paralelo edita `index.ts` ou `package.json` (a Onda 0 instala TODAS as dependencias da secao 5b). Cada agente tem o proprio arquivo de teste e a propria pasta de fixtures (coluna acima). Cada agente escreve `.forge/in-progress/pontindex/HANDOFF_<parte>.md` (o que coletou, contagens reais, formatos, excecoes, decisoes, o que deixou pronto) e marca a sua secao do checklist com o hash do commit. Limite de 1h por agente.

---

## 7. Sprints

## Backend

Regras gerais (auto-fill por categoria, valem em todas as features abaixo):
- `build`: valida `node >= 24` no inicio (`process.versions.node`); entradas ausentes (fonte `<SRC>`, jar, pasta kubejs) produzem erro nomeado e codigo de saida 1; artefatos da mesma versao sao apagados antes de regravar e artefatos parciais nunca ficam (`out/` temporario + rename atomico da pasta final); falha de rede da PokeAPI usa retry com backoff exponencial (1s, 2s, 4s, 8s, 16s) e cache em disco; sem rede e sem cache = falha explicita.
- `estrutura`: pasta ja existente nao e sobrescrita silenciosamente (scaffold roda so em pasta vazia ou com `--force`); permissao negada mostra o caminho; `.gitignore` e `README.md` atualizados na propria feature.
- `database`: esquema versionado com `schemaVersion`, migracao UP com snapshot e DOWN via restauracao; dado corrompido/parcial reparado ou isolado em `backups` (nunca perdido silenciosamente); quota excedida retorna erro tipado; re-salvar o mesmo doc e idempotente; escrita atomica em uma transacao; re-sincronizacao nunca duplica (mapas por chave).
- `integracao`: timeout explicito, retry com backoff, fallback/cache, comportamento offline definido.

### Sprint B1: Scaffolding do projeto (estrutura, build, PWA base, assets)

- **Descricao**: cria o projeto Vite + React + TypeScript do zero, com lint/format, `vite-plugin-pwa`, fontes e icones empacotados, configuracao da Vercel, geradores de CSS de tipos e de icones da pokebola, e a estrutura de pastas da secao 2.2.
- **Deliverable**: `npm run dev` abre uma pagina "Pontindex" vazia com as fontes corretas; `npm run build` gera `dist/` com service worker; `npm run lint`, `npm run typecheck` passam; `npm run gen:assets` produz `types.generated.css`, icones e mascara.
- **Risco**: baixo.
- **Prerequisito**: nenhum (repo sem codigo; confirmado: nao ha `package.json`).
- **Files** (criar): `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc`, `.gitignore` (MODIFICA: ja existe no repo (17 linhas) com `node_modules/`, `dist/`, `dist-electron/`, `release/`, `out/`, `android/...`, `*.log`, `.env*` e o comentario de que TODOS os artefatos do `.forge` sao versionados; manter tudo), `.gitattributes`, `vercel.json`, `README.md`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, `src/assets/pokeball.webp`, `src/assets/types/<18>.svg`, `tools/gen/type-css.ts`, `tools/gen/icons.ts`, `public/icons/.gitkeep`, `public/data/.gitkeep`, `tests/setup.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `.npmrc` (B1.1), `src/styles/fonts.ts` e `src/components/Icon.tsx` (B1.3), `src/styles/types.generated.css` (gerado, B1.4), `tests/unit/build/type-css.test.ts`; contratos compartilhados de B1.5: `src/data/types.ts`, `src/storage/types.ts`, `src/styles/themes.ts`, `src/domain/ball-rules-types.ts`, `src/domain/normalize.ts`.

#### Feature B1.1: Projeto Vite + React + TS com qualidade `[category: estrutura]`
- **Traces**: RNF-10 (custo zero), CONTEXT secao 1 (stack), secao 6 (convencoes).
- **Steps**:
  1. `npm create vite@latest . -- --template react-ts` em pasta com `design/` e `.forge/` ja presentes: rodar com `--force`? NAO: criar `package.json` manualmente (o scaffold do Vite recusa pasta nao vazia) com os pacotes de §5b.1 em versoes fixas; `"type": "module"`; scripts: `dev`, `build` (`tsc -b && vite build`), `preview`, `typecheck`, `lint`, `format`, `test` (vitest), `test:e2e` (playwright), `dataset` (`tsx tools/dataset/src/index.ts`), `gen:assets` (`tsx tools/gen/type-css.ts && tsx tools/gen/icons.ts`).
  2. `tsconfig.json`: `strict: true`, `noUncheckedIndexedAccess: true`, `paths: { "@/*": ["src/*"], "@dataset-types": ["src/data/types.ts"] }` (o pipeline importa os tipos daqui).
  3. `eslint.config.js` (flat): `typescript-eslint` recommended + `react-hooks` + regra custom `no-literal-jsx-text` (nome unico, citado tambem em F1.2) (falha se JSX tiver texto literal fora de `src/i18n`) + `no-restricted-syntax` para o caractere U+2014.
  4. `index.html`: `<html lang="pt-BR" data-theme="classic">`, meta viewport `width=device-width, initial-scale=1, viewport-fit=cover`, `<div id="root">`, script `src/main.tsx`. Sem `<link>` externo (RNF-11).
  5. `src/main.tsx`: renderiza `<h1>Pontindex</h1>` (substituido em F1).
- **Edge cases**: pasta com `node_modules` de tentativa anterior -> `npm ci` limpa; Node < 24 -> `engines` + `.npmrc engine-strict=true` bloqueia; permissao negada em `node_modules` -> mensagem do npm; conflito com arquivos existentes (`design/`, `.forge/`) -> nenhum e tocado.
- **Consumes**: -
- **Done when**: `npm run typecheck && npm run lint && npm run build` verdes; `dist/index.html` existe.
- **Commit**: `chore: scaffold vite react typescript project with lint and strict tsconfig`
- **Rollback**: remover os arquivos criados (nao ha estado persistido).

#### Feature B1.2: Higiene do repositorio e deploy Vercel `[category: estrutura]`
- **Traces**: RNF-10, RF-100 (dataset commitado), RF-103 (deploy estatico).
- **Steps**:
  1. `.gitignore`: acrescenta apenas o que ainda falta (`tools/dataset/.cache/`, `test-results/`, `playwright-report/`, `*.local`; `node_modules/`, `dist/` e `out/` ja existem, e `out/` ja cobre `tools/dataset/out/`), mantendo todas as linhas atuais. Decisao do usuario: TODOS os artefatos do `.forge` (STATE, checklists, relatorios, handoffs, `ui-refs/`) sao versionados; nada de `.forge/` entra no `.gitignore`. `data-source/` tambem e versionado (fonte padrao do build).
  2. `.gitattributes`: `*.png binary`, `*.ogg binary`, `*.webp binary`, `*.avif binary`, `public/data/** -diff` (JSON grandes sem diff).
  3. `vercel.json`: `{"cleanUrls": true, "trailingSlash": false, "headers": [{"source": "/data/(.*)", "headers": [{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}]}, {"source": "/assets/(.*)", "headers": [{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}]}, {"source": "/sw.js", "headers": [{"key":"Cache-Control","value":"no-cache"}]}], "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}` (SPA fallback; assets e data existem fisicamente e nao caem no rewrite).
  4. `README.md`: como rodar (`npm i`, `npm run dataset` (le `data-source/atm-1.3.0/` por padrao; `--instance <dir>` ou `ATM_INSTANCE_DIR` opcionais para uma instancia real), `npm run dev`), estrutura de pastas (§2.2), como publicar (push -> Vercel), nota de licenca dos assets (uso privado, CONTEXT secao 7), como gerar backup. Sem segredos (nao existem).
- **Edge cases**: Vercel detecta Vite automaticamente; se o projeto for importado com root errado, `vercel.json` esta na raiz; limite de 100 MB por deploy no plano gratuito [ASSUMPTION: total ~30 MB cabe].
- **Consumes**: -
- **Done when**: `git status` limpo apos build; deploy de preview na Vercel serve `/` e `/data/<ver>/dataset-manifest.json` com header immutable.
- **Commit**: `chore: repo hygiene, gitattributes for media and vercel static config`
- **Rollback**: remover `vercel.json`/entradas.

#### Feature B1.3: PWA base, fontes e icones empacotados `[category: build]`
- **Traces**: RF-103, RNF-11, nota do orquestrador (sem CDN/pin).
- **Steps**:
  1. `vite.config.ts`: `react()`, `VitePWA({ registerType: "prompt", includeAssets: ["icons/*.png"], manifest: {...F12.1}, workbox: { globPatterns: ["**/*.{js,css,html,svg,webp,woff2}"], maximumFileSizeToCacheInBytes: 4_000_000, navigateFallback: "/index.html", runtimeCaching: [] } })` (o `runtimeCaching` completo entra em F12.1); `define: { __APP_VERSION__: JSON.stringify(pkg.version) }`; `build.rollupOptions.output.manualChunks`: `vendor-react`, `vendor-sync` (`fflate`, `qrcode`, `@zxing/*`).
  2. Fontes: `import "@fontsource/fredoka/400.css"` (+500/600/700), `@fontsource/nunito/{400,600,700,800}.css`, `@fontsource/silkscreen/400.css` em `src/styles/fonts.ts`; `font-display: swap`.
  3. `lucide-react` fixado; `src/components/Icon.tsx` reexporta os icones usados (`import { Search, ... } from "lucide-react"`), tree-shaken.
- **Edge cases**: `maximumFileSizeToCacheInBytes` impede que um chunk gigante entre no precache (build falha se algum arquivo do shell passar de 4 MB); fontes ausentes -> fallback `system-ui` (declarado nos tokens).
- **Consumes**: -
- **Done when**: `dist/sw.js` e `dist/manifest.webmanifest` gerados; nenhum request para dominios externos ao abrir `npm run preview` (verificado com Playwright interceptando `**`).
- **Commit**: `feat(build): pwa plugin, bundled fonts and pinned lucide icons`
- **Rollback**: remover plugin (site continua estatico).

#### Feature B1.4: Geradores de assets (paleta de tipos, icones, mascara) `[category: build]`
- **Traces**: RF-117, RF-119, RF-125, RF-103.
- **Steps**:
  1. `tools/gen/type-css.ts`: le `design/tipos/cores.json` (chaves = 18 tipos; campos `base`, `a`, `b`, verificados) e escreve `src/styles/types.generated.css` com cabecalho "GENERATED, do not edit": `:root { --t-fire: #fba54c; --type-fire-a: #ff5a00; --type-fire-b: #ffd000; ... }`, `.t-fire { --tc: var(--t-fire); --g1: var(--type-fire-a); --g2: var(--type-fire-b); }` (`style.css:305`), `.g-fire { --g1; --g2 }` (`style.css:431`). Falha se faltar tipo ou campo.
  2. Copia `design/tipos/svg/*.svg` -> `src/assets/types/` e `design/pokebola.webp` -> `src/assets/pokeball.webp` (copia versionada; o app nunca referencia `design/`).
  3. `tools/gen/icons.ts` (`sharp`): a partir de `pokeball.webp` gera `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (padding 20%), `apple-touch-icon.png`, `favicon.png`; gera `src/assets/pokeball-mask.png` (alfa = luminancia invertida, para a marca d'agua monocromatica).
  4. Adiciona `gen:assets` como `prebuild`.
- **Edge cases**: `cores.json` com hex invalido -> erro; `sharp` sem binario para a plataforma -> erro claro com instrucao `npm rebuild sharp`; rodar duas vezes e idempotente (saidas identicas).
- **Consumes**: `design/tipos/cores.json`, `design/tipos/svg/*.svg`, `design/pokebola.webp`.
- **Done when**: `types.generated.css` contem 18 blocos; `public/icons` tem 5 PNGs; snapshot test do CSS gerado (`tests/unit/build/type-css.test.ts`).
- **Commit**: `feat(build): generate type palette css, pwa icons and watermark mask from design assets`
- **Rollback**: apagar os gerados.

#### Feature B1.5: Contratos compartilhados congelados e configuracao de testes `[category: outro]`
- **Traces**: RNF-05 (base tecnica unica), RF-79 (ordem dos temas), RF-64 (faixas da Heavy Ball), RF-07 (normalizacao da busca), RF-95/RF-96 (tipos dos documentos); habilita o paralelismo da secao 6 (decisao D1 do orquestrador).
- **Files** (criar): `src/data/types.ts`, `src/storage/types.ts`, `src/styles/themes.ts`, `src/domain/ball-rules-types.ts`, `src/domain/normalize.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `tests/unit/build/contracts.test.ts`; modifica `package.json` (B1.1) so para o script `test:harness`.
- **Steps**:
  1. `src/data/types.ts`: TODOS os tipos de §5.1.3, §5.1.5 e §5.1.6 escritos por completo e exportados (`DatasetManifest`, `SpeciesSummary`, `SpeciesDetail`, `TypeId`, `RarityBucket`, `RarityInfo`, `EvolutionMethod`, `EvolutionEdge`, `EvolutionRequirement`, `EvolutionChain`, `SpeciesForm`, `SpawnEntry`, `ObtainRoute`, `TypeChartFile`, `MoveInfo`, `AbilityInfo`, `ItemInfo` (ja com `tags: ("bait"|"evBerry"|"apricorn")[]`), `ItemCategory`, `ItemObtainRoute`, `BallInfo`, `BallRule`, `BallCondition`, `BallApplies`, `SeriesInfo`, `TrainerInfo`, `TrainersFile`, `FossilRoute`, `BiomeLabels`). Somente tipos (nenhum valor).
  2. `src/storage/types.ts`: `DocKey`, `DocMap` e cada tipo de documento de §5.3, `StorageAdapter` (interface), `BackupFile`, `StorageError`/`StorageErrorCode`. Somente tipos; `DOC_DEFAULTS`, `CURRENT_SCHEMA_VERSION`, adapter e repositorios ficam em B7.1 (`src/storage/defaults.ts` e demais).
  3. `src/styles/themes.ts`: `export const THEME_IDS = ["classic","black","green","blue","purple","white","orange"] as const` (ordem do RF-79, append-only, indice usado pelo codec de sync) e `export type ThemeId = typeof THEME_IDS[number]`. Nada de estilo aqui: F1.1 importa e estende so a parte visual em `src/styles/theme-meta.ts`; B7.1/B7.2 importam os ids.
  4. `src/domain/ball-rules-types.ts`: reexporta `BallRule`, `BallCondition`, `BallApplies` de `src/data/types.ts` e define `HEAVY_BALL_BANDS: readonly { aboveHg: number; multiplier: 1|2|3|4 }[]` = `[{aboveHg: 0, multiplier: 1}, {aboveHg: 1000, multiplier: 2}, {aboveHg: 2000, multiplier: 3}, {aboveHg: 3000, multiplier: 4}]` (vale a ultima faixa com `weight > aboveHg`) (faixas de B4.3/A7: `<= 1000` hg -> 1, `> 1000` -> 2, `> 2000` -> 3, `> 3000` -> 4) e `heavyBallMultiplier(weightHg)` (peso ausente ou 0 -> 1). Consumido por B4.3 (pipeline) e B6.4 (`rankBalls`).
  5. `src/domain/normalize.ts`: `normalizeSearch(s) = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()`; fonte unica para B2.2 (`searchKey`) e B6.5 (busca).
  6. `vitest.config.ts` (jsdom, `tests/setup.ts`, `coverage.thresholds` de T1) e DUAS configuracoes Playwright separadas (ambas `headless: true`, sem `slowMo`, sem timers), para que nenhum agente paralelo precise editar configuracao: `playwright.config.ts` (app completo: `testDir: "tests/e2e"`, `webServer` = `npm run build && npm run preview` na porta 4173; so usada da Onda 3 em diante) e `playwright.harness.config.ts` (`testDir: "tests/harness"`, `webServer` = SOMENTE o dev server do Vite, `npx vite --port 5173 --strictPort`, que compila sob demanda apenas os modulos importados pela pagina de harness: nada de `npm run preview` nem `tsc -b` de todo o `src/`, entao codigo em andamento da Onda 1 nao quebra a Onda 1b). Script `test:harness` = `playwright test -c playwright.harness.config.ts`.
  7. Congelamento: ao fechar a Onda 0, estes arquivos (e os demais da lista "Arquivos compartilhados" da secao 6) ficam congelados durante as Ondas 1 e 1b.
- **Edge cases**: tipo de §5 esquecido -> `npm run typecheck` de qualquer agente falha no import e o pedido volta ao orquestrador (nunca redefinir localmente); pasta `src/domain/` ja existente -> so acrescenta os 2 arquivos; `normalizeSearch` com string vazia -> `""`.
- **Consumes**: secao 5 (contratos).
- **Done when**: `npm run typecheck` verde com os 5 arquivos; `tests/unit/build/contracts.test.ts`: `THEME_IDS.length === 7` e `THEME_IDS[0] === "classic"`, `heavyBallMultiplier(905) === 1`, `(1001) === 2`, `(3500) === 4`, `normalizeSearch("Pântano") === "pantano"`; `npx playwright test --list`, `npx playwright test -c playwright.harness.config.ts --list` e `npx vitest --run --passWithNoTests` sobem sem erro de configuracao.
- **Commit**: `feat(contracts): frozen shared dataset, storage, theme, ball-rule and normalize contracts plus test config`
- **Rollback**: revert (nenhum dado persistido).

### Sprint B2: Pipeline de dados, parte 1 (especies, spawns, fosseis, evolucoes, formas)

- **Descricao**: implementa o nucleo do `tools/dataset`: leitura dos jars/kubejs/config, merge de especies por precedencia, lang PT/EN, raridade, spawns, fosseis, rotas "Como obter", cadeia de evolucao, formas e itens de forma, indice de busca; escreve `dataset-manifest.json`, `species-index.json`, `species/<dex>.json`, `type-chart.json`, `fossils.json`, `biomes.json`.
- **Deliverable**: `npm run dataset -- --skip-media` gera os arquivos com `counts.species = 1027`, `counts.fossilRoutes = 16`, `counts.spawnEntries` > 824.
- **Risco**: alto (merge e formatos reais).
- **Prerequisito**: B1.
- **Files** (criar): `tools/dataset/src/index.ts`, `tools/dataset/src/config.ts`, `tools/dataset/src/cli.ts`, `tools/dataset/src/jar-reader.ts`, `tools/dataset/src/source-reader.ts` (`SourceReader`, `ZipSourceReader`, `DirSourceReader`), `tools/dataset/src/instance.ts`, `tools/dataset/src/context.ts` (`PipelineContext`, compartilhado e congelado, B2.1), `tools/dataset/src/lang.ts`, `tools/dataset/src/species/{collect,merge,stage-derive,evolutions,forms,spawns,rarity,fossils,obtain,index-writer}.ts` (`rarity.ts` e `obtain.ts` sao so build-time: nenhum codigo de `src/` os importa, por isso ficam aqui e nao em `src/domain/`), `tools/dataset/src/biomes.ts`, `tools/dataset/src/type-chart.ts`, `tools/dataset/src/write.ts`, `tools/dataset/src/report.ts`, `tools/dataset/src/lib/{fs-atomic,hash,log}.ts`, stubs de etapa criados em B2.1 (`pokeapi/stage.ts`, `media/stage.ts`, `balls/stage.ts`, `trainers/stage.ts`, `items/stage.ts`), `tools/dataset/README.md`; testes: `tests/unit/dataset/{source,species-merge}.test.ts` + `tests/fixtures/{source,species-merge}/` (Onda 0), `tests/unit/dataset/species.test.ts` + `tests/fixtures/species/` (B2.3/B2.4), `tests/unit/dataset/join.test.ts` + `tests/fixtures/join/` (B2.5). `src/data/types.ts` NAO e criado aqui: vem pronto de B1.5.

#### Feature B2.1: Leitor da fonte (snapshot ou instancia real), manifesto e escrita atomica `[category: build]`
- **Traces**: RF-100, RF-101, RF-104, RF-114.
- **Steps**:
  1. `cli.ts`: parse de `--instance`, `--skip-media`, `--offline`, `--report`, `--keep-old`, `--only <stage>` e `--out <dir>`. `--only <stage>` (`speciesCore|speciesDerive|pokeapi|media|balls|trainers|items|write`) roda `runSpeciesCore` (sempre necessario: lang + especies) e depois SO a etapa pedida; `--out <dir>` troca a raiz de staging. Com `--only`, a publicacao (passo 4) NUNCA roda: nada e escrito em `public/data/`, `public/assets/` nem `current.json`. Uso das Ondas 1: `npm run dataset -- --only media --out tools/dataset/out/_pokeapi-media` (pasta coberta pelo `out/` do `.gitignore`). `config.ts` resolve a fonte com precedencia `--instance` > env `ATM_INSTANCE_DIR` > padrao `data-source/atm-1.3.0` (relativo a raiz do repo, via `path.resolve(import.meta.dirname, "../../..")`; o projeto e `"type": "module"`, entao `__dirname` NAO existe; `import.meta.dirname` e nativo no Node 24); valida `node >= 24`.
  2. `instance.ts`: detecta o modo da fonte com a regra UNICA de §5.1.1 (a mesma de §5b.2): para cada um dos 7 jars obrigatorios, resolve a entrada de `<SRC>/mods/` pelo prefixo de nome (`Cobblemon-neoforge-`, `allthemons-`, `complete-cobblemon-collection-`, `legendarymonuments-`, `mega_showdown-`, `zamega-`, `rctmod-neoforge-`) e faz `fs.statSync`: `isDirectory()` => snapshot, `isFile()` => instancia real (jar zipado); todos iguais ou `E_SOURCE_MODE_UNKNOWN`; ausencia = `E_JAR_MISSING`. O modo NUNCA e inferido de `manifest.json`/`MANIFEST.json` (no NTFS os dois nomes abrem o mesmo arquivo). So DEPOIS de decidir o modo le os metadados do pack: (a) instancia real: `manifest.json` do CurseForge -> `pack.name` (`name`), `pack.version` (`version`); (b) snapshot: `MANIFEST.json` (esquema `{source, extracted, files_per_jar}`) -> `pack.name` e `pack.version` extraidos de `source` pela regex `^(.*?)\s+(\d+\.\d+\.\d+)\b` ("All the Mons", "1.3.0"), conferidos contra o nome da pasta `atm-<versao>` (divergencia -> aviso). Em AMBOS os modos, `cobblemonVersion` e `pack.minecraft` vem do mesmo arquivo, `META-INF/neoforge.mods.toml` do jar do Cobblemon (existe no zip e no snapshot, verificado): `cobblemonVersion` = parte antes do `+` de `version="1.7.3+1.21.1"` (linha 8) e `pack.minecraft` = `versionRange` da dependencia `modId="minecraft"` sem colchetes (`"[1.21.1]"` -> `"1.21.1"`, linhas 28-30; lido com `@iarna/toml`); na instancia real, se `manifest.json` trouxer `minecraft.version` diferente, vale o do toml e o report registra o aviso. Registra `sources[]` (nome, bytes, mtime; para diretorio, soma dos bytes e mtime mais recente) para o manifesto.
  3. `source-reader.ts` (abstracao unica usada por TODO o pipeline, B2-B5): `interface SourceReader { listJars(): JarRef[]; readJar(ref, prefixes[]): Map<entryPath, Uint8Array>; readTree(relDir): Map<relPath, Uint8Array> }` com duas implementacoes: `ZipSourceReader` (instancia real) e `DirSourceReader` (snapshot: `readJar` percorre `mods/<jar>/` e filtra pelos mesmos prefixos; `readTree` cobre `kubejs/` e `config/`); nos dois modos `readTree` le `kubejs/` e `config/` direto do sistema de arquivos (sao pastas normais tambem na instancia real) e a lista de prefixos sempre inclui `META-INF/neoforge.mods.toml` (versoes, passo 2); o resto do pipeline nunca sabe qual modo esta ativo. Implementacao zip em `jar-reader.ts`: `readJar(path, prefixes[]) -> Map<entryPath, Uint8Array>` com `fflate.unzipSync(data, { filter: f => prefixes.some(p => f.name.startsWith(p)) })`; `readJsonEntries(map, prefix)`; tolera JSON com BOM e comentarios? NAO: JSON estrito; entrada invalida -> erro com o caminho (nunca pular em silencio).
  4. `fs-atomic.ts`: `writeJsonAtomic(path, data)` escreve `path.tmp` e renomeia; `replaceDirAtomic(finalDir, stagingDir)`. Toda etapa escreve SO dentro de `ctx.outDir` (staging): JSON em `<outDir>/data/` e midia em `<outDir>/assets/{cries,sfx,items,sprites}/`; padrao `tools/dataset/out/_staging/`, ou o `--out`. A publicacao (`publish(ctx)` em `write.ts`, chamada somente por `runWriteStage` de B2.5, Onda 2, e nunca com `--only`) move `<outDir>/data/` para `public/data/<datasetVersion>/`, `<outDir>/assets/` para `public/assets/` e atualiza `public/data/current.json` (`{ "datasetVersion": "..." }`). Assim a primeira execucao que escreve em `public/data/` e `public/assets/` e a da Onda 2.
  4b. Cache em disco por etapa (seguro para agentes em paralelo): `ctx.cacheDir(stage)` = `<DATASET_CACHE_DIR>/<stage>/` (padrao `tools/dataset/.cache/<stage>/`); cada etapa usa SO a sua subpasta: `pokeapi/` (B3.1/B3.2 na Onda 1, B3.3 na Onda 2) e `sprites/` (B3.3, Onda 2); nenhuma outra etapa usa cache.
  5. `report.ts`: tabela final (contagens, bytes por tipo de midia, tempo, `pack`, `cobblemonVersion`) e grava `<outDir>/report.json` (padrao `tools/dataset/out/_staging/report.json`).
  6. `context.ts` (contrato compartilhado da pipeline, dono = Onda 0/B2.1, congelado nas Ondas 1 e 1b): `interface PipelineContext { reader: SourceReader; lang: LangTable; species: Map<number, MergedSpecies>; counts: Partial<DatasetManifest["counts"]>; media: MediaRegistry; levelCapConfig: DatasetManifest["levelCapConfig"] | null; outDir: string; report: ReportSink; flags: CliFlags }` e `MediaRegistry { register(category: "cries"|"sfx"|"itemTextures"|"sprites", files: number, bytes: number): void; totals(): DatasetManifest["media"] }`. Cada etapa escreve SO as proprias chaves de `counts`: `species` (B2.2); `spawnEntries`, `fossilRoutes` (B2.3); `moves`, `abilities` (B3.2); `cries`, `itemTextures` (B3.4); `sprites` (B3.3); `items` (B4.1); `balls` (B4.3); `trainers`, `keyTrainers`, `series` (B5.1/B5.2). `media.register` e chamado por B3.4 e B3.3; `levelCapConfig` por B5.2; B2.5 le tudo para montar `dataset-manifest.json`.
  7. `index.ts`: chama as etapas na ordem final com stubs vazios (`export async function runX(ctx: PipelineContext) {}`), criados aqui e depois preenchidos pelo agente dono de cada um (secao 6): `runSpeciesCore` (B2.2, `species/merge.ts`) -> `runSpeciesDerive` (`species/stage-derive.ts`, B2.3/B2.4) -> `runPokeapiStage` (`pokeapi/stage.ts`, B3.2 e depois B3.3) -> `runMediaStage` (`media/stage.ts`, B3.4) -> `runBallsStage` (`balls/stage.ts`, B4.3) -> `runTrainersStage` (`trainers/stage.ts`, B5.x) -> `runItemsStage` (`items/stage.ts`, B4.1/B4.2) -> `runWriteStage` (`species/index-writer.ts`, B2.5). Com `--skip-media`, `runMediaStage` e a parte de sprites de `runPokeapiStage` retornam cedo.
- **Edge cases**: `<SRC>` inexistente ou sem `mods/` -> `E_INSTANCE_NOT_FOUND`; os 7 jars obrigatorios nao sao todos do mesmo tipo (uns diretorios, outros arquivos) ou uma entrada nao e arquivo nem diretorio -> `E_SOURCE_MODE_UNKNOWN`; modo decidido mas arquivo de metadados do modo ausente ou com esquema errado (snapshot sem `files_per_jar`, instancia sem `name`/`version`) -> `E_SOURCE_MODE_UNKNOWN` com o caminho; `META-INF/neoforge.mods.toml` do Cobblemon ausente -> `E_SNAPSHOT_INCOMPLETE`; snapshot sem um arquivo que o pipeline pede (ex. som de UI fora do filtro) -> `E_SNAPSHOT_INCOMPLETE` listando o caminho (re-extrair conforme `data-source/README.md`); jar corrompido -> `E_JAR_UNREADABLE`; dois jars com o mesmo prefixo (versao duplicada) -> erro pedindo para limpar `mods/`; falta de espaco em disco ao escrever -> erro e `out/` removido; versao do pack diferente de `1.3.0` -> aviso, prossegue (o valor real vai para o manifesto, RF-104).
- **Consumes**: -
- **Done when**: (obrigatorio, sempre; `species 1027` so aparece depois de B2.2, que fecha a Onda 0 junto com esta feature) `npm run dataset -- --only speciesCore --out tools/dataset/out/_base --skip-media --report` termina com codigo 0 e imprime `species 1027` rodando APENAS com o snapshot `data-source/atm-1.3.0` em uma maquina limpa sem o modpack (sem `--instance` e sem `ATM_INSTANCE_DIR`), com `pack = {name:"All the Mons", version:"1.3.0", minecraft:"1.21.1"}` e `cobblemonVersion = "1.7.3"` conferidos na saida do `--report` e em `tools/dataset/out/_base/report.json` (o `dataset-manifest.json` so e escrito por B2.5, Onda 2); teste unitario da deteccao com fixtures sinteticas (`mods/` so com diretorios -> snapshot; so com arquivos zip -> instancia; misto -> `E_SOURCE_MODE_UNKNOWN`; snapshot cujo `MANIFEST.json` tambem responde por `manifest.json` nao muda o modo); rodar com `ATM_INSTANCE_DIR` apontando para pasta inexistente falha com `E_INSTANCE_NOT_FOUND` sem criar `public/data/<ver>/` nem alterar `public/data/current.json`; os testes ficam em `tests/unit/dataset/source.test.ts` com fixtures em `tests/fixtures/source/`. (A paridade snapshot x instancia real por hash de `species-index.json` foi movida para B2.5, que e quem escreve esse arquivo.)
- **Commit**: `feat(dataset): instance reader, jar unzip, atomic output and manifest skeleton`
- **Rollback**: `git rm -r tools/dataset public/data`.

#### Feature B2.2: Lang PT/EN e merge de especies `[category: build]`
- **Traces**: RF-07, RF-09, RF-20, RF-24 (ids de habilidade), RF-100.
- **Steps**:
  1. `lang.ts`: carrega `assets/cobblemon/lang/{pt_br,en_us}.json` e depois os langs de `allthemons`, `mega_showdown`, `zamega`, `legendarymonuments`, `rctmod` (chaves de addon so complementam; se um addon redefinir uma chave do Cobblemon, o Cobblemon vence e o conflito vai para o report). Helper `text(key) -> {pt, en}` com fallback `en -> pt` e, sem nenhum, `null` + aviso.
  2. `collect.ts`: percorre `data/cobblemon/species/**.json` de todos os jars na ordem de §5.1.1 (mecanismo (a), override completo) e depois `species_additions/**.json` de jars + kubejs (mecanismo (b), merge aditivo de §5.1.2: campo presente na adicao sobrescreve/estende; `forms` uniao por `name`, `drops` substitui, `evolutions`/`implemented` da adicao, `labels`/`features` uniao; verificado em `allthemons/species_additions/{staryu,mareep}.json`, nos 117 do mega_showdown e em `kubejs/.../zzz_ccc_meltan.json`); cada campo tocado por adicao vai para `merge-report.json` com a origem.
  3. `merge.ts`: regra por campo de §5.1.2; produz `MergedSpecies` (formato interno) com `slug` = nome do arquivo sem extensao, `dex = nationalPokedexNumber`, `generation` = label `gen*` ou `"custom"` (label `custom` em Creepyon/Piglich, verificado); `drops` = `entries[]` do objeto `drops` vencedor, achatado para o array de `SpeciesDetail.drops` (`percentage`/`quantityRange` ausentes -> `null`), com `amount` descartado de proposito (§5.1.3).
  4. Nomes: `name.pt = lang["cobblemon.species.<slug>.name"]` (pt_br), `name.en` idem en_us; Creepyon/Piglich vem do lang do allthemons (`Piglichu` em PT, verificado); `pokedexText` de `cobblemon.species.<slug>.desc`.
  5. `moves`: parse de `"<n>:<move>"` (numero = nivel, `app.js` e CONTEXT: sem prefixo literal), `"egg:"`, `"tm:"`, `"tutor:"`; os prefixos `legacy:`, `special:` e `form_change:` sao ignorados de proposito (nao sao golpes aprendiveis no fluxo normal); qualquer outro prefixo vai para o report.
  6. `abilities`: `"h:<id>"` -> `{id, hidden: true}`; duplicados removidos.
  7. `searchKey` = `normalizeSearch(name.pt) + "|" + normalizeSearch(name.en)`, importando `normalizeSearch` de `src/domain/normalize.ts` (contrato congelado de B1.5; a mesma funcao e usada por `src/domain/search.ts` em B6.5, entao pipeline e runtime normalizam igual).
- **Edge cases**: especie sem `nationalPokedexNumber` -> erro; dois arquivos com o mesmo `dex` em jars diferentes -> merge (esperado: mega_showdown, ccc); `name` ausente no lang -> usa `name` do JSON e report; `implemented: false` -> ainda entra? [ASSUMPTION: entra, com flag no report; o PRD conta 1027 = todos os arquivos].
- **Consumes**: B2.1, B1.5 (`normalizeSearch`, tipos de §5.1.3).
- **Done when**: teste unitario (`tests/unit/dataset/species-merge.test.ts`, fixtures em `tests/fixtures/species-merge/`: bulbasaur, charizard do Cobblemon + charizard do mega_showdown) garante `baseStats` do Cobblemon e `forms` com Mega-X/Mega-Y/Gmax; Quagsire `name.pt === "Pântano"`; `counts.species === 1027`; Mareep (`dex 179`) tem `SpeciesDetail.drops` (array achatado de `drops.entries` da adicao do allthemons, `amount: 5` descartado) contendo `{ item: "silentgear:sinew", percentage: 25, quantityRange: null }` e 4 entradas no total. (A verificacao `items.json["silentgear:sinew"].obtain` contem `{kind:"drop", from:[{dex:179,...}]}` (RF-68) pertence ao Done de B4.2, Onda 2.)
- **Commit**: `feat(dataset): bilingual lang loader and precedence-based species merge`
- **Rollback**: revert.

#### Feature B2.3: Spawns, raridade, fosseis e rotas "Como obter" `[category: build]`
- **Traces**: RF-10, RF-26, RF-27, RF-114, RF-115, PRD decisoes 3 e 7.
- **Steps**:
  1. `spawns.ts`: le `spawn_pool_world/*.json` de todos os jars + `kubejs/data/cobblemon/spawn_pool_world/`; para cada `spawns[]` cria `SpawnEntry` (§5.1.3) com `source` = origem; `pokemon` pode ter sufixo de aspecto (`"magikarp calico=..."`)? Nos dados verificados o campo e so o slug (`"magikarp"`, `"creepyon"`); tratar `split(" ")[0]` por seguranca; `context = spawnablePositionType ?? context` (os dois nomes ocorrem: Eevee usa `spawnablePositionType`, Jirachi/Creepyon usam `context`); `timeRange` = `condition.timeRange` se existir, senao `"any"`; `skyLight` de `minSkyLight/maxSkyLight`; `structures` de `condition.structures`; `neededBaseBlocks`; tudo o mais em `extra`.
  2. `tools/dataset/src/species/rarity.ts` (so build-time): `deriveRarity(spawns)` conforme §5.1.4 (ordem `common > uncommon > rare > ultra-rare`).
  3. `fossils.ts`: uniao de `fossils/*.json` (15 do Cobblemon + `mewtwo.json` do allthemons) -> `fossils.json`; `ctx.counts.fossilRoutes = length` (16).
  4. `tools/dataset/src/species/obtain.ts` (so build-time): `deriveSpeciesObtain(species, ctx)` com a ordem e regras de §5.1.5; `ctx` = mapa dex -> rarity, fosseis, egg groups. `species/stage-derive.ts` (`runSpeciesDerive`) chama spawns -> rarity -> fossils -> obtain e depois B2.4 (evolutions, forms), gravando em `ctx.species`.
- **Edge cases**: especie com spawn so via addon (ex. `9001_distortion_gastly` do legendarymonuments para Gastly que TAMBEM tem spawn base) -> conta as duas; `bucket` fora dos 4 valores -> erro; `level` sem hifen ("30") -> aceito como "30-30"? NAO: manter string original e a UI exibe como esta.
- **Consumes**: B2.2.
- **Done when**: em `tests/unit/dataset/species.test.ts` (fixtures em `tests/fixtures/species/`, unico arquivo de teste do agente Especies; chama `runSpeciesDerive(ctx)` com `outDir = tools/dataset/out/_species/`, equivalente a `npm run dataset -- --only speciesDerive --out tools/dataset/out/_species`, sem pipeline completo e sem escrever em `public/`): Eevee -> `primary uncommon`, `secondary [rare, ultra-rare]`, 5 entradas; Mewtwo -> `rarity.primary "ultra-rare"` (spawn do ccc em `legendary_spawns_ccc/spawn_pool_world/0150_mewtwo.json`, corrigido 2026-09-24 pelos dados reais), `obtain = [fossil allthemons, addon ccc]`; Charizard tambem tem spawn proprio ultra-rare na base (`0006_charizard.json`), mostrado em "Onde encontrar" e fora do `obtain` (regras 3/4); Aerodactyl -> `[fossil, breeding]`; Charizard -> `[evolution, breeding]`; `undiscovered` sem breeding; sem rota -> `none`; `counts.fossilRoutes === 16`.
- **Commit**: `feat(dataset): spawn entries, rarity buckets, fossil routes and layered obtain routes`
- **Rollback**: revert.

#### Feature B2.4: Evolucoes, cadeia e formas com item necessario `[category: build]`
- **Traces**: RF-19, RF-20, RF-29, RF-30.
- **Steps**:
  1. `evolutions.ts`: para cada especie, `evolutions[]` -> `EvolutionEdge` (`variant`, `requiredContext` -> `requiredItem`, `requirements[]` mapeados: `level.minLevel`, `friendship.amount`, `time_range.range`, `has_move_type.type`, `held_item.itemCondition` -> `heldItem`, resto `other` com `raw`); `to` resolvido por slug (`result` pode vir com aspecto, ex. `"toxtricity lowkey=true"`: usar `split(" ")[0]`); cadeia: raiz = subir por `preEvolution` ate o topo; `EvolutionChain` = BFS a partir da raiz coletando nos e arestas; a mesma cadeia e gravada em cada especie da familia.
  2. `forms.ts`: `forms[]` (sem a base) -> `SpeciesForm`; `source` = jar de origem do form; `requiredItems`: (a) Mega X/Y/Mega: le `data/mega_showdown/mega_showdown/mega/*.json` (81 arquivos, verificado: `{ "showdown_id": "charizarditex", "pokemons": ["Charizard"], "aspect_conditions": { "apply": { "aspects": ["mega_evolution=mega_x"] } } }`) e casa `pokemons[]` (nome) com a especie e o aspecto `mega_evolution=<aspect>` com `form.aspects` (`mega_x`, `mega_y`, `mega`); item = `mega_showdown:<nome do arquivo>` (ex. `charizardite_x`) + `mega_showdown:keystone` (sempre, verificado no lang: "Keystone"/"Pedra Chave"); (b) Mega-Z (zamega): varre `data/zamega/**/*.json` com a mesma heuristica (`pokemons` + aspecto) [ASSUMPTION]; (c) Gmax e demais: `[]` (nenhum dado de item encontrado nos jars; a UI mostra "Item nao identificado nos dados", nunca inventa "Max Soup" do prototipo).
  3. `evolutionMethods` do indice: conjunto de `variant`/`requirements` mapeado para `level | item | friendship | trade | move | other`, ou `["none"]`.
- **Edge cases**: `result` aponta para slug inexistente -> aresta descartada + report; ciclo em `preEvolution` (dados quebrados) -> corta apos 10 passos + report; forma cujo `pokemons[]` usa nome com espaco/hifen ("Mr. Mime") -> comparar normalizado.
- **Consumes**: B2.2; ids de item so como string; validacao em B4.2.
- **Done when**: (em `tests/unit/dataset/species.test.ts`) Eevee `evolutionChain.edges.length === 8` (Espeon = friendship 160 + timeRange day; Sylveon = friendship + hasMoveType fairy), Charizard `forms` = Mega-X (`requiredItems = ["mega_showdown:charizardite_x","mega_showdown:keystone"]`), Mega-Y, Gmax (`[]`); Kadabra -> Alakazam `variant trade`; Clefairy -> Clefable `requiredItem cobblemon:moon_stone`.
- **Commit**: `feat(dataset): evolution edges, full chains and forms with activation items`
- **Rollback**: revert.

#### Feature B2.5: Escrita do indice, fichas, tabela de tipos e biomas `[category: build]`
- **Traces**: RF-09, RF-17, RF-100, RF-102 (sprites referenciados), RF-114.
- **Steps**:
  1. `index-writer.ts`: gera `species-index.json` (ordem: dex asc, custom no fim) e `species/<dex>.json` (um por especie) conforme §5.1.3; `hasSprite = dex <= 1025` [ASSUMPTION: custom sem sprite]; `artworkId = dex` para 1..1025, `null` para custom; `cry = slug` se existir `assets/cobblemon/sounds/pokemon/<slug>/<slug>_cry.ogg` no jar, senao `null`.
  2. `type-chart.ts`: emite `type-chart.json` a partir de `src/domain/type-chart.ts` (fonte unica, B6.1) para que o app e o pipeline usem a mesma tabela.
  3. `biomes.ts`: coleta todas as tags/ids de bioma usados em spawns e biomas de treinadores; rotulo `en` = humanizado do id (`#cobblemon:is_overworld` -> "Overworld", `is_cave` -> "Cave", `#legendary_spawns_ccc:jirachi` -> "Special biome: Jirachi", `legendarymonuments:distortion_world_biome` -> "Distortion World"); rotulo `pt` = dicionario curado `tools/dataset/src/biome-labels.pt.ts` (~120 entradas para as tags do Cobblemon/vanilla/aether/allthemodium encontradas; faltantes caem no `en` e vao para o report) [ASSUMPTION: nao existe lang oficial de tags de bioma; CONTEXT confirma que o lang do Cobblemon nao tem chaves de bioma].
  4. `dataset-manifest.json` com todos os `counts` (lidos de `ctx.counts`), `media` (`ctx.media.totals()`, com o teto de 26 MB checado por `checkBudget` de `media/budget.ts`, B3.4, agora que os sprites de B3.3 tambem estao registrados) e `files` (§5.1.3); `datasetVersion` calculado (§5.1.1).
  5. Validacao: cada arquivo escrito passa pelos esquemas zod de `src/data/schemas.ts` (B7.4; importado, nunca redefinido aqui).
- **Edge cases**: ficha > 64 KB (Magikarp com 46 spawns, contados no snapshot) -> aceito (report lista as 10 maiores); `species/` com arquivo orfao de versao anterior -> pasta e recriada do zero.
- **Consumes**: B2.1-B2.4, B6.1 (`src/domain/type-chart.ts`), B7.4 (`src/data/schemas.ts`), contadores de B3.2/B3.3/B3.4/B4.1/B4.3/B5.x em `ctx`.
- **Done when**: (testes em `tests/unit/dataset/join.test.ts`, fixtures em `tests/fixtures/join/`) `speciesDetailSchema` de `src/data/schemas.ts` valida 100% dos `species/*.json`; `species-index.json` tem 1027 entradas e `searchKey` de Quagsire contem `pantano`. (CONDICIONAL, movido de B2.1) Somente se `ATM_INSTANCE_DIR` apontar para uma instancia real disponivel na maquina: rodar o pipeline com ela produz um `species-index.json` identico ao do snapshot (paridade por hash); sem instancia real, o teste e marcado `skip` com o motivo e NAO bloqueia o Done.
- **Commit**: `feat(dataset): write species index, per-species files, type chart and biome labels`
- **Rollback**: revert.

### Sprint B3: Pipeline de dados, parte 2 (PokeAPI em build, sprites, midia)

- **Descricao**: cliente PokeAPI com cache/retry, mecanica de golpes e nomes/descricoes de habilidades, ids de artwork das formas, download dos sprites 96px, extracao de gritos, sons de UI e texturas de item dos jars, relatorio de orcamento de midia.
- **Deliverable**: `moves.json` (932 golpes com tipo/categoria/poder/precisao/PP), `abilities.json` (310), `public/assets/{cries,sfx,items,sprites}` preenchidos (publicados so na Onda 2, por B2.5; na Onda 1 a midia fica em `tools/dataset/out/_pokeapi-media/assets/`), `media.totalBytes` no manifesto.
- **Risco**: medio (rede, mapeamento de nomes).
- **Prerequisito**: B2.
- **Files** (criar): `tools/dataset/src/pokeapi/{client,cache,move-aliases}.ts`, `tools/dataset/src/pokeapi/stage.ts` (stub da Onda 0; `runPokeapiStage`: B3.2 na Onda 1, B3.3 acrescentado na Onda 2), `tools/dataset/src/moves.ts`, `tools/dataset/src/abilities.ts`, `tools/dataset/src/sprites.ts`, `tools/dataset/src/artwork-ids.ts`, `tools/dataset/src/media/{stage,cries,sfx,item-textures,budget}.ts`, `src/audio/sfx-names.ts` (lista unica de sons, B3.4); testes do agente PokeAPI e midia: `tests/unit/dataset/pokeapi-media.test.ts` + `tests/fixtures/pokeapi-media/` (B3.1, B3.2, B3.4); B3.3 testa em `tests/unit/dataset/join.test.ts` (Onda 2).

#### Feature B3.1: Cliente PokeAPI com cache e backoff `[category: integracao]`
- **Traces**: RF-21, RF-100, RNF-10, PRD decisao 8.
- **Steps**: `client.ts`: `getJson(path)` com `fetch` (Node 24 nativo), timeout 20 s (`AbortController`), retry 5x com backoff 1/2/4/8/16 s em 429/5xx/rede, cache em `tools/dataset/.cache/pokeapi/<sha1(url)>.json` (le do cache antes de qualquer rede; `--offline` = so cache); concorrencia maxima 6 (fila) e `User-Agent: pontindex-dataset`; `getBinary(url)` idem para sprites (`.cache/sprites/`).
- **Edge cases**: 404 -> retorna `null` sem retry (recurso inexistente); cache corrompido (JSON invalido) -> apaga e refaz; sem rede e sem cache -> `E_POKEAPI_UNAVAILABLE` listando as URLs pendentes; build nunca prossegue com dados parciais.
- **Consumes**: -
- **Done when**: teste (`tests/unit/dataset/pokeapi-media.test.ts`, fixtures em `tests/fixtures/pokeapi-media/`, cache do teste em pasta temporaria do proprio teste, nunca em `.cache/` de outra etapa) com servidor fake: 2 falhas 503 depois 200 -> sucesso com 2 retries; segunda execucao nao faz rede (cache hit 100%).
- **Commit**: `feat(dataset): pokeapi client with disk cache, timeout and exponential backoff`
- **Rollback**: revert.

#### Feature B3.2: Golpes e habilidades `[category: build]`
- **Traces**: RF-21, RF-23, RF-24.
- **Steps**:
  1. `moves.ts`: ids de golpe = uniao de todos os `moves` das especies + chaves `cobblemon.move.<id>.desc` do lang (932); `name = text("cobblemon.move.<id>")`, `description = text("cobblemon.move.<id>.desc")`; lista PokeAPI `move?limit=2000` -> mapa `nameNormalized -> {id, url}` com `normalize = s.replace(/[^a-z0-9]/g, "")`; casa `id` do Cobblemon (ja sem separadores) com o mapa; `move-aliases.ts` cobre excecoes conhecidas (ex. `vicegrip` -> `vise-grip`, `hijumpkick` -> `high-jump-kick`, `faintattack` -> `feint-attack`, `smellingsalts` -> `smelling-salts`, `thunderpunch`, `softboiled` -> `soft-boiled`, `doubleslap` -> `double-slap`, `solarbeam`, `dynamicpunch`, `extremespeed`, `ancientpower`, `feintattack`, `smokescreen`, `selfdestruct` -> `self-destruct`, `lockon` -> `lock-on`, `willowisp` -> `will-o-wisp`, `uturn` -> `u-turn`, `xscissor` -> `x-scissor`, `vcreate` -> `v-create`, `mudslap` -> `mud-slap`, `kingsshield` -> `king-s-shield`, `landswrath` -> `land-s-wrath`, `forestscurse` -> `forest-s-curse`, `bahamut`? nao existe) [ASSUMPTION: a lista e completada na execucao ate zero pendencias]; para cada match, `move/<id>` -> `type.name`, `damage_class.name`, `power`, `accuracy`, `pp`; golpes sem match -> build falha listando-os (R1).
  2. `abilities.ts`: ids = uniao das `abilities` das especies + `cobblemon.ability.<id>.desc` (310); nome/descricao do lang; sem PokeAPI.
- **Edge cases**: golpe presente na especie mas sem lang (custom) -> nome = id humanizado + report; `power: null` (status) preservado; PokeAPI com `accuracy: null` (nunca erra) -> `null` e a UI mostra "-".
- **Consumes**: B3.1, B2.2.
- **Done when** (sem rodar o pipeline completo e sem escrever em `public/`): `tests/unit/dataset/pokeapi-media.test.ts` monta um `ctx` com `runSpeciesCore` sobre o snapshot real, `outDir = tools/dataset/out/_pokeapi-media/` e cache em `tools/dataset/.cache/pokeapi/`, chama `runPokeapiStage(ctx)` (equivalente: `npm run dataset -- --only pokeapi --out tools/dataset/out/_pokeapi-media`) e confere em `tools/dataset/out/_pokeapi-media/data/`: `moves.json` tem >= 932 entradas e 0 com `type == null`; `tackle` = normal/physical/40/100/35; `abilities.json` tem 310, `blaze.name.pt === "Incêndio"`.
- **Commit**: `feat(dataset): move mechanics from pokeapi at build time and ability catalog`
- **Rollback**: revert.

#### Feature B3.3: Sprites 96px e ids de artwork por forma `[category: integracao]`
- **Traces**: RF-102, RF-29 (artwork de formas), RF-16.
- **Steps**:
  1. `sprites.ts`: para dex 1..1025 baixa `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/<dex>.png` -> `public/assets/sprites/<dex>.png` (cache em `.cache/sprites/`); custom (9901/9902) sem sprite.
  2. `artwork-ids.ts`: para especies com `forms`, consulta `pokemon-species/<dex>` -> `varieties[]` (`pokemon.name` como `charizard-mega-x`, `pokemon.url` -> id 10034); casa `form.name` normalizado (`Mega-X` -> `mega-x`, `Gmax` -> `gmax`, `Mega-Z` sem correspondencia -> `null`, regionais `Alolan` -> `alola`, `Galarian` -> `galar`, `Hisuian` -> `hisui`, `Paldean` -> `paldea`) e grava `form.artworkId`; verifica existencia do artwork com HEAD (cacheado) [ASSUMPTION: evita 404 em runtime].
- **Edge cases**: sprite 404 -> `hasSprite = false` para aquela dex + report (a UI usa placeholder); variedade sem artwork -> `null`.
- **Consumes**: B3.1, B2.4.
- **Done when**: 1025 PNGs em `<outDir>/assets/sprites/` (publicados em `public/assets/sprites` por B2.5, mesma onda; cache em `tools/dataset/.cache/sprites/`) (`ctx.media.register("sprites", ...)` e `ctx.counts.sprites`); Charizard Mega-X `artworkId === 10034` (teste em `tests/unit/dataset/join.test.ts`).
- **Commit**: `feat(dataset): download 96px sprites and resolve artwork ids for forms`
- **Rollback**: revert (apagar `public/assets/sprites`).

#### Feature B3.4: Extracao de midia dos jars e orcamento `[category: build]`
- **Traces**: RF-32, RF-49, RF-91, RF-68 (texturas), RF-100, RNF-04.
- **Steps**:
  0. Destino de TODA a midia desta feature: `<ctx.outDir>/assets/...` (staging); `public/assets/...` so recebe os arquivos na publicacao de B2.5 (Onda 2). Os caminhos `public/assets/...` abaixo indicam o destino FINAL publicado.
  1. `cries.ts`: `assets/cobblemon/sounds/pokemon/<slug>/<slug>_cry.ogg` -> `public/assets/cries/<slug>.ogg` (1072 no snapshot, 1074 contados na instancia real; os que nao casam com uma especie do indice sao mantidos com o nome original para formas, ex. `<slug>_<forma>_cry`).
  2. `sfx.ts`: **fonte UNICA da lista de sons de UI** (F1.4 e qualquer tela apenas referenciam esta lista; nenhuma outra lista existe). A lista vive em `src/audio/sfx-names.ts` (`export const SFX_NAMES = [...] as const; export type SfxName = typeof SFX_NAMES[number]`, 20 nomes), criado por esta feature (nenhum outro agente das Ondas 1/1b escreve em `src/audio/`); o pipeline a importa (como faz com `src/domain/type-chart.ts`) e F1.4 (`src/audio/sfx.ts`) tambem, sem redefinir. Copia de `assets/cobblemon/sounds/{poke_ball,item/pokedex,gui,evolution,shiny}/` -> `public/assets/sfx/<name>.ogg`. Os 20 nomes, todos conferidos no snapshot `data-source/atm-1.3.0/` em 2026-09-24: `poke_ball/`: `poke_ball_throw_1`, `poke_ball_shake_1`, `poke_ball_shake_2`, `poke_ball_shake_3`, `poke_ball_shake_critical`, `poke_ball_open`, `poke_ball_shut`, `poke_ball_capture_succeeded` (8); `item/pokedex/`: `pokedex_open`, `pokedex_close`, `pokedex_click`, `pokedex_click_short`, `pokedex_scan_open` (5); `gui/`: `click`, `levelup`, `levelup_start` (3); `evolution/`: `evolution_notification`, `evolution_ui`, `evolution_full` (3); `shiny` = primeiro arquivo em ordem alfabetica de `sounds/shiny/` (`shiny_ambient_chime_1.ogg` no snapshot), copiado como `shiny.ogg` (1). Arquivo ausente = erro. `ctx.media.register("sfx", ...)`.
  3. `item-textures.ts`: `assets/<ns>/textures/item/**/*.png` dos 3 jars (cobblemon 802 no snapshot / 805 na instancia real, allthemons 79, mega_showdown 322) -> `public/assets/items/<ns>/<basename>.png`; basenames duplicados dentro do mesmo namespace (verificado: `poke_balls/models/*.png` repete 3 nomes) -> a versao fora de `models/` vence; grava `texture-manifest.json` (`id -> path`) usado por B4.
  4. `budget.ts`: `checkBudget(totals)` soma bytes por categoria a partir de `ctx.media` (cada etapa registra a sua: cries/sfx/itemTextures aqui, sprites em B3.3); falha se `totalBytes > 26 MB` [ASSUMPTION: limite de seguranca acima dos ~22 MB previstos]; imprime tabela. Aqui roda sobre as 3 categorias desta etapa; a checagem final, com sprites, e feita por B2.5 ao montar o manifesto. `media/stage.ts` (`runMediaStage`) chama os passos 1-4.
- **Edge cases**: `--skip-media` pula tudo e `media.*` fica 0 com flag `mediaSkipped: true` (o app mostra aviso em Sobre); ogg corrompido (0 bytes) -> erro.
- **Consumes**: B2.1.
- **Done when** (sem rodar o pipeline completo e sem escrever em `public/assets/`, que so recebe a midia na publicacao da Onda 2 por B2.5): `tests/unit/dataset/pokeapi-media.test.ts` chama `runMediaStage(ctx)` com `outDir = tools/dataset/out/_pokeapi-media/` (equivalente: `npm run dataset -- --only media --out tools/dataset/out/_pokeapi-media`) e confere em `tools/dataset/out/_pokeapi-media/assets/`: `cries/` >= 1072 arquivos, `sfx/` = os 20 nomes de `SFX_NAMES`, `items/cobblemon/` >= 800; soma cries + sfx + texturas <= 26 MB (a faixa final de `media.totalBytes`, 18 a 26 MB com sprites, e conferida em B2.5).
- **Commit**: `feat(dataset): extract cries, ui sounds and item textures with media budget check`
- **Rollback**: revert (apagar `public/assets`).

### Sprint B4: Pipeline de dados, parte 3 (itens, receitas, loot, bolas)

- **Descricao**: catalogo de itens com categoria, textura, descricao oficial, rotas de obtencao (receitas, drops, plantio, loot, pesca, fossil), indice "Usado em", e catalogo das Pokebolas (contagem derivada das texturas, 48 hoje) com regras de multiplicador.
- **Deliverable**: `items.json` e `balls.json` validados.
- **Risco**: medio.
- **Prerequisito**: B2, B3.4.
- **Files** (criar): `tools/dataset/src/items/{stage,catalog,categories,recipes,drops-index,berries,loot,used-in}.ts` (B4.1/B4.2, Onda 2), `tools/dataset/src/balls/{stage,catalog,ball-rules}.ts` (B4.3, Onda 1, agente Treinadores e bolas). `src/domain/ball-rules-types.ts` NAO e criado aqui: vem pronto e congelado de B1.5 (tipos + `HEAVY_BALL_BANDS`). Testes: B4.3 em `tests/unit/dataset/trainers-balls.test.ts` (fixtures `tests/fixtures/trainers-balls/`); B4.1/B4.2 em `tests/unit/dataset/join.test.ts` (fixtures `tests/fixtures/join/`).

#### Feature B4.1: Catalogo de itens com categoria e textura `[category: build]`
- **Traces**: RF-66, RF-68, RF-71.
- **Steps**:
  1. `catalog.ts`: ids = chaves `item.cobblemon.<path>` (sem sufixo `.tooltip`) do lang do Cobblemon + `item.allthemons.*` + `item.mega_showdown.*` que tenham textura ou tooltip + qualquer id referenciado por `drops`, `signatureItem`, `bag`, `heldItem`, `fossils`, `requiredItem` e `requiredItems` (esses ultimos entram como "referenciados", com nome humanizado do path se nao houver lang, `category: "other"`, `texture: null`).
  2. `categories.ts`: `category` pela subpasta da textura no jar (`medicine` -> `medicine`, `iv_candy` -> `ivCandy`, `experience_candy` -> `expCandy`, `evolution` -> `evolution`, `held_items` -> `held`, `battle_items` -> `battle`, `mints` -> `mint`, `berries` -> `berry`, `poke_balls` -> `ball`, `fossils` -> `fossil`, `food|poke_puffs|mochis|aprijuice|campfire_pots` -> `cooking`, resto `other`); sobrescritas por lista curada: vitaminas (`hp_up, protein, iron, calcium, zinc, carbos`) e `power_*` -> `vitamin`; `rare_candy` -> `expCandy`; `tags`: `bait` para todo item em `spawn_bait_effects` (73 berries + 6 fruits + `poke_bait`), `evBerry` para as 6 berries redutoras de EV (`pomeg, kelpsy, qualot, hondew, grepa, tamato`), `apricorn` para `*_apricorn`. (O campo `tags: ("bait"|"evBerry"|"apricorn")[]` ja existe em `ItemInfo` (§5.1.3, contrato congelado de B1.5); esta feature so o preenche; a aba "Iscas" da UI filtra por tag.)
  3. `description = text("item.cobblemon.<path>.tooltip")` (430 itens tem); `cooking = { effectNote: "pending" }` para `category === "cooking"` (PRD Pontos em Aberto 1).
- **Edge cases**: item com textura mas sem lang (ex. `keystone_base`) -> nome humanizado; namespace desconhecido (`allthemodium:piglich_heart`) -> entrada minima.
- **Consumes**: B2.1, B3.4 (`texture-manifest.json`).
- **Done when**: `items.json` >= 932 entradas; `cobblemon:potion` tem descricao pt/en e textura; `cobblemon:aguav_berry` tem `tags` contendo `bait`.
- **Commit**: `feat(dataset): item catalog with categories, tags, tooltips and textures`
- **Rollback**: revert.

#### Feature B4.2: Rotas de obtencao do item e "Usado em" `[category: build]`
- **Traces**: RF-68, RF-69, RF-70, RF-25 (indice invertido).
- **Steps**:
  1. `recipes.ts`: le 750 `data/cobblemon/recipe/**.json` (raiz + `campfire_pot/` + `brewing_stand/`): `result.id` (formato verificado: `{"result":{"id":"cobblemon:antidote"}}`) ou `result.item`/`result` string -> `craftable` com `recipeTypes` (`type` do JSON, ex. `minecraft:crafting_shaped`, `cobblemon:cooking_pot_shapeless`, `minecraft:smelting`).
  2. `drops-index.ts`: inverte `SpeciesDetail.drops[]` (ja achatado em B2.2) -> `drop.from[]`.
  3. `berries.ts`: `data/cobblemon/berries/<id>.json` (`preferredBiomeTags`, `favoriteMulches`, verificado) -> `plantable`; apricorns e mints -> `plantable` sem biomas [ASSUMPTION].
  4. `loot.ts`: percorre 457 loot tables do Cobblemon + 7 do kubejs (`injection/chests/*.json`, verificado formato `pools[].entries[].name`); entradas `type: "minecraft:item"` -> `structureLoot.tables` (id = caminho relativo sem `.json`); `type: "minecraft:loot_table"` referenciando `cobblemon:sets/*` e expandido um nivel; tabelas em `fishing/` e `injection/gameplay/fishing/` -> `fishing`.
  5. `used-in.ts`: `evolutions` (arestas com `requiredItem`), `fossils` (`fossils[].fossils`), `forms` (`requiredItems`), `ball` (id em `balls.json`).
  6. Validacao cruzada: todo id referenciado por especies/treinadores/formas existe em `items.json` (senao entrada minima ja criada em B4.1).
- **Edge cases**: receita com `result` em formato desconhecido -> report, nao craftable; loot table com `conditions` complexas -> ainda conta (a UI so diz "pode aparecer em"); item sem nenhuma rota -> `[{kind:"none"}]`.
- **Consumes**: B2.3, B2.4, B4.1, B4.3.
- **Done when**: `cobblemon:fire_stone.obtain` contem `craftable` e `usedIn.evolutions` contem `{from:133,to:136}`; `cobblemon:old_amber_fossil.usedIn.fossils` contem 142; `allthemons:pika_star.usedIn.fossils` contem 150; `items.json["silentgear:sinew"].obtain` contem `{kind:"drop", from:[{dex:179,...}]}` (RF-68, Mareep, vindo de B2.2).
- **Commit**: `feat(dataset): item obtain routes from recipes, drops, berries, loot and fishing plus used-in index`
- **Rollback**: revert.

#### Feature B4.3: Pokebolas e tabela de regras `[category: build]`
- **Traces**: RF-63, RF-64, RF-65.
- **Steps**:
  1. `catalog.ts` (balls): ids = basenames dos PNGs em `assets/cobblemon/textures/item/poke_balls/` (excluindo `models/`), 48 hoje (verificado pelo orquestrador; o lang tem 51 chaves `*_ball`, as 3 sem textura ficam fora); `name`/`effect = tooltip` (pt/en) do lang, `itemId = "cobblemon:<x>_ball"`; `counts.balls = balls.json.length` (RF-114): nenhuma contagem fixa na UI.
  2. `ball-rules.ts`: tabela curada `Record<ballId, BallRule>` (uma entrada por bola do catalogo, 48; build falha se faltar ou sobrar id), derivada literalmente dos tooltips `item.cobblemon.<id>.tooltip` de `<SRC>/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/assets/cobblemon/lang/en_us.json` (e `pt_br.json`), reconferidos em 2026-09-24. Nenhum arquivo `data/` do Cobblemon define multiplicador de bola (so o codigo Kotlin), entao o tooltip e a fonte. `worstMultiplier` = valor quando a condicao NAO vale (1 salvo quando o tooltip diz outro):

     | Bola(s) | Tooltip EN (verbatim) | Regra |
     |---|---|---|
     | `poke_ball`, `premier_ball`, `cherish_ball`, `slate_ball`, `azure_ball`, `verdant_ball`, `roseate_ball`, `citrine_ball` | "1× catch rate" | `flat 1` |
     | `great_ball` | "1.5× catch rate" | `flat 1.5` |
     | `sport_ball` | "1.5× catch rate" | `flat 1.5` |
     | `ultra_ball` | "2× catch rate" | `flat 2` |
     | `master_ball`, `ancient_origin_ball` | "Guaranteed capture" | `guaranteed` |
     | `safari_ball` | "1.5× outside of battle" | `conditional 1.5/1 outsideBattle` |
     | `park_ball` | "2.5× in all Forest or Plains biomes" | `conditional 2.5/1 forestOrPlains` |
     | `fast_ball` | "4× on Pokémon with 100 or more Base Speed" | `conditional 4/1 applies {minBaseSpeed: 100}` (intrinseca: satisfeita = 4x incondicional; nao satisfeita = excluida) |
     | `net_ball` | "3× on Water- or Bug-types" | `conditional 3/1 applies {types: [water, bug]}` (intrinseca: satisfeita = 3x incondicional, UI sem texto de condicao) |
     | `heavy_ball` | "1× to 4×, increases by target's weight" | `conditional 4/1 heavyTarget` (intrinseca, SEMPRE incluida; multiplicador = faixa de `HEAVY_BALL_BANDS` pelo `weight` em hg: `<= 1000` (<= 100 kg) -> 1; `> 1000` -> 2; `> 2000` -> 3; `> 3000` -> 4) [ASSUMPTION: faixas; o tooltip so da 1x a 4x] |
     | `level_ball` | "1× to 4×, increases the higher the player's Pokémon level is compared to the target" | `conditional 4/1 playerLevelHigher` |
     | `lure_ball` | "4× on Pokémon reeled in with a Poké Rod" | `conditional 4/1 fishing applies {spawnContext: [fishing]}` |
     | `moon_ball` | "1× to 4×, increases at night depending on how close the moon phase is to a full moon" | `conditional 4/1 fullMoonNight` |
     | `love_ball` | "2.5× if the target is the opposite gender of the player's Pokémon, 8× if also the same species" | `conditional 8/1 oppositeGender applies {genderless: false}` (melhor caso 8x = genero oposto E mesma especie; o texto exibido e o tooltip, que cita os dois degraus) |
     | `dive_ball` | "3.5× on Pokémon submerged in water" | `conditional 3.5/1 submerged applies {spawnContext: [submerged]}` |
     | `nest_ball` | "1× to 4×, increases the lower the target's level is from 30" | `conditional 4/1 targetLevelBelow30` |
     | `repeat_ball` | "3.5× on Pokémon registered as caught in the Pokédex" | `conditional 3.5/1 registeredCaught` |
     | `timer_ball` | "1× to 4×, increases by the number of turns passed, up to 10" | `conditional 4/1 turn10` |
     | `dusk_ball` | "3.5× if target is in Light Level 0, 3× if in Light Level 1-7" | `conditional 3.5/1 lightLevel0` (degrau intermediario 3x fica no texto do tooltip) |
     | `quick_ball` | "5× on the first turn of battle" | `conditional 5/1 firstTurn` |
     | `dream_ball` | "4× on sleeping Pokémon" | `conditional 4/1 sleeping` |
     | `beast_ball` | "5× on Ultra Beasts, 0.1× otherwise" | `conditional 5/0.1 ultraBeast applies {label: ultra_beast}` (sem o label = `flat 0.1`) |
     | `friend_ball` | "1×, caught Pokémon start with 150 Friendship" | `flat 1`, tag `after` |
     | `luxury_ball` | "1×, caught Pokémon gain Friendship twice as fast" | `flat 1`, tag `after` |
     | `heal_ball` | "1×, fully restores HP, PP, and status conditions upon capture" | `flat 1`, tag `after` |
     | `ancient_poke_ball`, `ancient_citrine_ball`, `ancient_verdant_ball`, `ancient_azure_ball`, `ancient_roseate_ball`, `ancient_slate_ball`, `ancient_ivory_ball` | "1× catch rate" | `flat 1` |
     | `ancient_great_ball` | "1.5× catch rate" | `flat 1.5` |
     | `ancient_ultra_ball` | "2× catch rate" | `flat 2` |
     | `ancient_feather_ball` / `ancient_wing_ball` / `ancient_jet_ball` | "1×, flies further" / "1.5×, flies further" / "2×, flies further" | `flat 1` / `flat 1.5` / `flat 2` |
     | `ancient_heavy_ball` / `ancient_leaden_ball` / `ancient_gigaton_ball` | "1×, throws less far" / "1.5×, throws less far" / "2×, throws less far" | `flat 1` / `flat 1.5` / `flat 2` (NAO sao como a Heavy Ball: nao dependem do peso) |

     Conferencia por id: 8 ("1×") + great, sport, ultra (3) + master, origin (2) + 20 individuais (safari a heal) + 7 ancestrais "1×" + ancient great, ancient ultra (2) + feather/wing/jet (3) + heavy/leaden/gigaton (3) = **48**, igual as 48 texturas de `poke_balls/`. `tags` derivadas: `night` (dusk, moon), `water` (net, dive, lure), `fishing` (lure), `first` (quick), `caught` (repeat), `after` (friend, heal, luxury).
- **Edge cases**: tooltip mudar de texto em outra versao -> a regra continua a mesma (curada) e o texto exibido acompanha o lang; id novo de bola -> build falha pedindo a regra.
- **Consumes**: B2.2 (`lang.ts`), B1.5 (`BallRule` e `HEAVY_BALL_BANDS` de `src/domain/ball-rules-types.ts`).
- **Done when**: (sem pipeline completo nem escrita em `public/`: `tests/unit/dataset/trainers-balls.test.ts` chama `runBallsStage(ctx)` com `outDir = tools/dataset/out/_trainers-balls/`, equivalente a `npm run dataset -- --only balls --out tools/dataset/out/_trainers-balls`, e le `tools/dataset/out/_trainers-balls/data/balls.json`) `balls.json.length === 48` (igual ao numero de texturas em `poke_balls/`) e `counts.balls` bate; `net_ball.rule.applies.types` = `[water, bug]`; `ancient_gigaton_ball.rule` = `{kind:"flat", multiplier:2}` e `ancient_wing_ball.rule` = `{kind:"flat", multiplier:1.5}`; `heavy_ball.rule` = `{kind:"conditional", bestMultiplier:4, worstMultiplier:1, condition:"heavyTarget"}` sem `applies`; `park_ball` = `conditional 2.5/1 forestOrPlains`; `sport_ball` = `flat 1.5`; `dusk_ball.effect.pt` = "3.5× se o Pokémon estiver no Nível de Luz 0, e 3× se estiver no Nível de Luz 1-7".
- **Commit**: `feat(dataset): poke ball catalog with curated multiplier rules`
- **Rollback**: revert.

### Sprint B5: Pipeline de dados, parte 4 (treinadores e series)

- **Descricao**: merge dos treinadores do rctmod e do kubejs, definicoes de spawn (`mobs/trainers`), series (jar + kubejs + Modo Livre), ordem topologica dos treinadores-chave, resolucao de especies do time, config de level cap.
- **Deliverable**: `series.json` (5 series + freeroam), `trainers/<seriesId>.json`, `levelCapConfig` no manifesto, `counts.keyTrainers = { bdsp: 43 (33 do jar + 10 revanches pos-jogo que o kubejs do All the Mons torna obrigatorias: Cynthia x2 e Elite dos 4 x8; corrigido 2026-09-24 pelos dados reais, a IDEA ja dizia 43), radicalred: 39, unbound: 38, atm_team: n, contentcreators: n }`.
- **Risco**: medio.
- **Prerequisito**: B2.
- **Files** (criar): `tools/dataset/src/trainers/{stage,collect,merge,series,order,writer}.ts` (`stage.ts` = stub da Onda 0, `runTrainersStage`), `tools/dataset/src/config-toml.ts`; testes: `tests/unit/dataset/trainers-balls.test.ts` + `tests/fixtures/trainers-balls/` (arquivo unico do agente Treinadores e bolas, compartilhado com B4.3 do mesmo agente).

#### Feature B5.1: Treinadores e definicoes de spawn `[category: build]`
- **Traces**: RF-57, RF-58, RF-61, RF-100.
- **Steps**:
  1. `collect.ts`: `data/rctmod/trainers/<id>.json` (1559; formato verificado: `name`, `team[] {species, gender, level, nature, ability, moveset, ivs, evs, heldItem?}`, `bag[] {item, quantity}`) + `kubejs/data/rctmod/trainers/*.json` (30); `data/rctmod/mobs/trainers/single/<id>.json` (165; formato verificado: `optional`, `requiredDefeats: string[][]`, `series: string[]`, `signatureItem?`, `type`, `biomeTagWhitelist/Blacklist`) + `groups/` + `kubejs .../mobs/trainers/single/*.json` (60); `default.json` fornece os padroes (`optional: true`, `series: []`).
  2. `merge.ts`: `TrainerInfo` por id = trainer file + mob file (mesmo id); treinador sem mob file herda `default.json` (`optional: true`, sem serie) e so entra em `trainers/<serie>.json` se tiver serie; `dex` de cada `team[].species` resolvido pelo slug no indice de especies (`null` + report se nao existir); `maxTeamLevel = max(team.level)`; `typeLabel = text("type.rctmod.<type>")` com fallback humanizado; `source`.
  3. Um treinador pode pertencer a varias `series` -> aparece no arquivo de cada uma.
- **Edge cases**: `requiredDefeats` referenciando id inexistente -> report e a sublista mantem o id (a UI mostra "desconhecido"); `team` vazio -> `maxTeamLevel = 0`; kubejs sobrescrevendo um id do jar -> kubejs vence (report).
- **Consumes**: B2.2 (slugs).
- **Done when**: (em `tests/unit/dataset/trainers-balls.test.ts`, chamando `runTrainersStage(ctx)` com `outDir = tools/dataset/out/_trainers-balls/`, sem escrever em `public/`) `gym_leader_roark_0395`: `optional false`, `signatureItem cobblemon:smooth_rock`, `maxTeamLevel 14`, `series [bdsp]`; `pokemon_trainer_cedric_0445.requiredDefeats = [["gym_leader_gardenia_03d6"]]`; `gym_leader_maylene_03d8.requiredDefeats = [[cedric_0445, cedric_0446, cedric_0447]]`.
- **Commit**: `feat(dataset): merge rctmod and kubejs trainers with spawn definitions`
- **Rollback**: revert.

#### Feature B5.2: Series, ordem dos treinadores-chave e config do cap `[category: build]`
- **Traces**: RF-57, RF-59 (dados), RF-111, RF-124 (ids estaveis).
- **Steps**:
  1. `series.ts`: `data/rctmod/series/{bdsp,radicalred,unbound}.json` + `kubejs/data/rctmod/series/{atm_team,contentcreators}.json` (formato verificado: `title.translatable`, `description.translatable`, `difficulty`, `requiredSeries: string[][]`) -> `SeriesInfo` com textos de `assets/rctmod/lang` (pt: "Diamante brilhante/Pérola reluzente", "Radical Red", "Livre" (unbound), etc.); entrada extra `{ id: "freeroam", special: "freeroam", title: text("series.rctmod.freeroam.title") }` ("Modo Livre"); `keyTrainerIds` = ids com `optional === false` na serie, na ordem de B5.2.2.
  2. `order.ts`: ordenacao topologica (Kahn) pelo grafo `requiredDefeats` (todas as sublistas), desempate por `maxTeamLevel` asc e nome; ciclos -> erro de build.
  3. `config-toml.ts`: le `config/rctmod-server.toml` (`@iarna/toml`) -> `levelCapConfig { initialLevelCap: 15, relativeLevelCap: 0, initialSeries: "empty", freeroamRequiresCompletedSeries: true }` (valores verificados); ausencia do arquivo -> usa os padroes do mod e report.
  4. `writer.ts`: `series.json` e `trainers/<seriesId>.json` (todos os treinadores da serie, chave ou nao; a UI lista os chave e pode expandir os opcionais [ASSUMPTION: opcionais ficam em uma secao colapsada "Outros treinadores da serie"]).
- **Edge cases**: serie sem treinadores-chave (ex. `contentcreators` se todos forem opcionais) -> `keyTrainerIds = []` e a UI mostra "Esta serie nao tem treinadores-chave: cap = 100" (regra X=100 quando nao ha chave disponivel e nenhum pendente) [ASSUMPTION]; `requiredSeries` citando serie inexistente -> report.
- **Consumes**: B5.1.
- **Done when**: (em `tests/unit/dataset/trainers-balls.test.ts`; equivalente `npm run dataset -- --only trainers --out tools/dataset/out/_trainers-balls`; confere `ctx.counts` e os arquivos em `tools/dataset/out/_trainers-balls/data/`, nunca `public/data/`) `ctx.counts.keyTrainers.bdsp === 43` (kubejs vence; ver Deliverable); ordem BDSP comeca com `gym_leader_roark_0395`; `series.json` tem `atm_team.requiredSeries = [["bdsp"]]` e `freeroam.special === "freeroam"`.
- **Commit**: `feat(dataset): series catalog, topological key trainer order and level cap config`
- **Rollback**: revert.

### Sprint B6: Modulos de dominio (regras puras, sem UI)

- **Descricao**: implementa em `src/domain/` as regras quantitativas com testes unitarios: tabela de tipos, stats/naturezas/recomendacao, level cap, ranking de bolas, busca, historico/time. Sao consumidos pelo pipeline (rarity/obtain/type-chart) e pela UI.
- **Deliverable**: modulos com 100% dos exemplos trabalhados abaixo passando em Vitest.
- **Risco**: medio (R3/R4).
- **Prerequisito**: B1.5 (contratos congelados: tipos de dataset, `normalize.ts`, `ball-rules-types.ts`). Nao depende de nenhum arquivo do pipeline.
- **Files** (criar): `src/domain/{type-chart,stats,natures,level-cap,ball-ranking,search,history,team}.ts` e `tests/unit/domain/*.test.ts` (definidos em T1; pasta exclusiva do agente Regras e armazenamento), fixtures em `tests/fixtures/rules-storage/`. NAO edita `src/domain/normalize.ts` nem `src/domain/ball-rules-types.ts` (congelados, B1.5).

#### Feature B6.1: Tabela de tipos e efetividade `[category: outro]`
- **Traces**: RF-17, RF-34.
- **Steps**: `TYPE_CHART` portado literalmente de `app.js:280-299` (atacante -> {2: [...], 0.5: [...], 0: [...]}); `effectivenessAgainst(defenders: TypeId[]): Record<TypeId, 0|0.25|0.5|1|2|4>` multiplicando por defensor (`app.js:749-757`); `groupByMultiplier(map)` -> linhas x4, x2, x0.5, x0.25, x0 (x1 omitido). Exemplo obrigatorio: Charizard (fire, flying) vs rock: fire->rock 2 (rock esta em `rock[2]`? NAO: a tabela e atacante->defensores; `rock: {2: [fire, ice, flying, bug]}` => 2 x 2 = **4**; vs water: `water: {2:[fire,...]}`, flying neutro => 2; vs ground: `ground: {0: [flying]}` => 0; vs fire: `fire: {0.5: [fire, ...]}`, flying neutro => 0.5. Fogo/Agua vs fire: 0.5 x 0.5 = **0.25** (fire resiste a fire e water resiste a fire; corrigido 2026-09-24, o exemplo antigo dizia 0.5).
- **Edge cases**: lista vazia de defensores -> tudo x1; tipo desconhecido -> erro de tipo em compile time.
- **Consumes**: -
- **Done when**: testes dos exemplos acima (`tests/unit/domain/type-chart.test.ts`). A igualdade com o `type-chart.json` gerado so e conferida em B2.5 (Onda 2, `tests/unit/dataset/join.test.ts`), porque o arquivo nao existe na Onda 1.
- **Commit**: `feat(domain): type chart and dual-type effectiveness`
- **Rollback**: revert.

#### Feature B6.2: Stats, naturezas e recomendacao de IV/EV `[category: outro]`
- **Traces**: RF-35, RF-110.
- **Steps**:
  1. `natures.ts`: as 25 naturezas com `{ id, name: {pt,en}, up: StatKey|null, down: StatKey|null }` (nomes PT do lang `cobblemon.nature.<id>`, 25 chaves verificadas; ex. hardy/docile/serious/bashful/quirky neutras).
  2. `stats.ts`: `calculateHp(base, iv, ev, level) = floor((2*base + iv + floor(ev/4)) * level / 100) + level + 10`; `calculateOther(base, iv, ev, level, mod) = floor((floor((2*base + iv + floor(ev/4)) * level / 100) + 5) * mod)` com `mod = 1.1 | 1 | 0.9`; `calculateStats(baseStats, level, ivs, evs, natureId)` retorna os 6 no nivel e no nivel 100; validacoes: IV 0..31, EV 0..252, soma EV <= 510, level 1..100 (lanca `RangeError`).
  3. Exemplo trabalhado (formula do RF-35): base 100, L100, IV 31, EV 252: `2*100+31+63 = 294`; `floor(294*100/100) = 294`; outro stat neutro = `294+5 = 299`; favoravel = `floor(299*1.1) = 328`; desfavoravel = `floor(299*0.9) = 269`; HP = `294+100+10 = 404`. Estes sao os valores do criterio de aceite do PRD rev 5.
  4. `recommendedInvestment(baseStats)`: ordena os 6 stats por valor base desc (desempate pela ordem hp, attack, defence, specialAttack, specialDefence, speed) e devolve `{ ivs: 31 nos 2 primeiros (e 31 nos demais tambem, pois IV 31 nunca prejudica; a RECOMENDACAO destaca os 2), evs: 252 no 1o, 252 no 2o, 4 no 3o (total 508 <= 510), highlight: [stat1, stat2] }`. Exemplo: Charizard (78/84/78/109/85/100) -> highlight `[specialAttack, speed]`, EV 252 SpA / 252 Spe / 4 SpD (3o maior = 85).
- **Edge cases**: empate total (Mew 100 em tudo) -> ordem canonica (hp, attack); EV soma > 510 -> erro tipado que a UI mostra inline.
- **Consumes**: -
- **Done when**: testes 299/328/269/404 e Charizard/Mew.
- **Commit**: `feat(domain): stat formulas, 25 natures and iv/ev recommendation heuristic`
- **Rollback**: revert.

#### Feature B6.3: Level cap (Radical Cobblemon Trainers) `[category: outro]`
- **Traces**: RF-59, RF-60, RF-61, RF-111, PRD decisao 9.
- **Steps**:
  1. `requiredDefeatsSatisfied(groups: string[][], defeated: Set<string>) = groups.every(g => g.length === 0 || g.some(id => defeated.has(id)))` (AND entre sublistas, OR dentro; RF-61).
  2. `isAvailable(t, defeated) = !defeated.has(t.id) && requiredDefeatsSatisfied(t.requiredDefeats, defeated)`.
  3. `computeTrainerLevel(t, byId, relativeLevelCap, memo)`: `own = clamp(t.maxTeamLevel + relativeLevelCap, 0, 100)`; `prereq = max over all ids in flatten(t.requiredDefeats) of computeTrainerLevel(byId[id])` (0 se nenhum); `return max(own, prereq)` (ordem exata da decisao 9: clamp ANTES de comparar). Memoizado; ciclo -> `own`.
  4. `computeSeriesCap({ keyTrainers, defeated, config, mode })`: `mode === "freeroam"` -> 100; `mode === "none"` (nenhuma serie) -> `X = 1`; senao `available = keyTrainers.filter(t => isAvailable(t, defeated))`; se `available.length > 0`: `X = min(available.map(trainerLevel))`; senao se todos os `keyTrainers` derrotados: `X = 100`; senao (nenhum disponivel e nenhum pendente satisfazivel = dados inconsistentes) `X = 100` + `console.warn`. `cap = max(config.initialLevelCap, X)`.
  5. `isSeriesCompleted(series, defeated) = keyTrainerIds.every(id => defeated.has(id))` (PRD [ASSUMPTION decisao 4]); `isSeriesUnlocked(series, progress) = series.requiredSeries.every(group => group.some(id => isSeriesCompleted(byId[id])))`; freeroam desbloqueado se `!config.freeroamRequiresCompletedSeries || alguma serie concluida`.
  6. Exemplo trabalhado BDSP (dados verificados: Roark 14, Mars `03c2` 16, Jupiter `041d` 20, Gardenia `03d6` 22, Cedric `0445/0446/0447` 21, Maylene `03d8` 30; `initialLevelCap 15`, `relativeLevelCap 0`): nenhum derrotado -> disponivel = {Roark}, `trainerLevel(Roark) = 14`, cap = max(15, 14) = **15**; Roark derrotado -> {Mars}: `max(16, 14) = 16` -> **16**; + Mars -> {Jupiter}: `max(20, 16) = 20` -> **20**; + Jupiter -> {Gardenia}: `max(22, 20) = 22` -> **22**; + Gardenia -> {Cedric x3}: cada um `max(21, trainerLevel(Gardenia) = 22) = 22`, `min = 22` -> cap **22** (cada Cedric herda o `trainerLevel` 22 de Gardenia, seu prerequisito; e o valor do criterio de aceite do PRD rev 5); + um Cedric -> Maylene fica disponivel (seu `requiredDefeats` e `[[cedric_0445, cedric_0446, cedric_0447]]`, basta um), mas os outros 2 Cedric continuam disponiveis (prerequisito Gardenia satisfeito, nao derrotados), entao `min(22, 22, 30) = 22` -> cap continua **22** (regra confirmada por bytecode no PRD: minimo entre TODOS os disponiveis; corrigido 2026-09-24, o exemplo antigo dizia 30); + os 3 Cedric -> {Maylene}: `max(30, 22) = 30` -> **30**. [OPEN: conferir no jogo, no PC de casa, se o mod de fato mantem o cap em 22 com dois Cedric alternativos pendentes.] Serie concluida -> 100. Serie `none` -> `max(15, 1) = 15`. Freeroam -> 100.
- **Edge cases**: desmarcar Roark com Mars marcado -> Mars continua "derrotado" no storage, mas `isAvailable(Roark)` volta a true e o cap cai para 15 (RF-60); treinador-chave com `requiredDefeats` citando id de outra serie -> considerado pelo `defeated` global (progresso e por serie no storage: a checagem usa a uniao de todos os derrotados de todas as series [ASSUMPTION]).
- **Consumes**: `TrainerInfo`, `SeriesInfo`, `DatasetManifest.levelCapConfig`, `DocMap.trainerProgress`.
- **Done when**: testes com fixtures reais dos 7 treinadores acima reproduzem 15/16/20/22/22 (apos um Cedric continua 22)/30 (apos os 3 Cedric)/100, mais AND/OR de `requiredDefeats`, `none` e `freeroam`.
- **Commit**: `feat(domain): radical cobblemon trainers level cap with prerequisites, freeroam and empty series`
- **Rollback**: revert.

#### Feature B6.4: Ranking de Pokebolas `[category: outro]`
- **Traces**: RF-64.
- **Steps**:
  1. `rankBalls(species: SpeciesDetail, balls: BallInfo[], ctx: { captured: boolean }): RankedBall[]` onde `RankedBall = { ball, multiplier, conditional: boolean, conditionKey: BallCondition|null, guaranteed: boolean }`.
  2. Avaliacao por `rule.kind`: `flat` -> multiplier, incondicional; `guaranteed` -> separado (nao rankeado); `conditional`: primeiro checa `applies` (tipos, `minBaseSpeed`, `label`, `spawnContext` presente em `species.spawns[].context`, `genderless` via `maleRatio !== -1`): se `applies` existe e NAO e satisfeito -> bola excluida (net, fast, lure, dive, love), exceto beast, que sem o label `ultra_beast` entra como incondicional 0.1; se satisfeito e a condicao e intrinseca (`types`, `minBaseSpeed`) -> `conditional: false` com `bestMultiplier`; `heavyTarget` (sem `applies`) -> SEMPRE incluida, `conditional: false`, multiplicador = `HEAVY_BALL_BANDS` pelo `weight` (B4.3; peso ausente ou 0 -> faixa 1x); condicoes externas (`firstTurn`, `lightLevel0`, `turn10`, `targetLevelBelow30`, `playerLevelHigher`, `fullMoonNight`, `fishing`, `submerged`, `sleeping`, `forestOrPlains`, `outsideBattle`, `oppositeGender`) -> `conditional: true` com `bestMultiplier` (melhor caso do tooltip, sem excecao: a Love Ball entra com 8x); `registeredCaught` -> se `ctx.captured` entao 3.5 incondicional, senao excluida.
  3. Ordenacao (total e deterministica): (a) `multiplier` desc; (b) empate: incondicional antes de condicional; (c) empate: `name.en` asc com `localeCompare(…, "en")`. Top 3 exibido; lista completa disponivel. Regra mantida como estava; o exemplo abaixo foi recalculado literalmente a partir dela (a versao anterior do exemplo omitia a Love Ball e nao ordenava os empates de 4x por nome).
  4. Exemplo Magikarp (dados do snapshot: water, speed 80, `weight` 100 hg = 10 kg, `maleRatio` 0.5, sem label `ultra_beast`, 46 spawns com contexts `fishing` x43, `submerged` x2, `surface` x1, nivel 1-20; nao capturado). Ranking completo: (1) **Love 8x** cond. genero oposto e mesma especie; (2) **Quick 5x** cond. 1o turno; (3-8) 4x cond., por nome EN: **Dream**, Level, Lure, Moon, Nest, Timer; (9-10) 3.5x cond.: Dive, Dusk; (11) **Net 3x incondicional** (tipo Agua); (12) Park 2.5x cond.; (13-16) 2x incond.: Ancient Gigaton, Ancient Jet, Ancient Ultra, Ultra; (17-21) 1.5x incond.: Ancient Great, Ancient Leaden, Ancient Wing, Great, Sport; (22) Safari 1.5x cond. fora de batalha; (23-43) 1x incond. (21 bolas, por nome EN, incluindo Heavy Ball pela faixa <= 100 kg e Poké Ball); (44) Beast 0.1x. Excluidas: Fast (speed 80 < 100) e Repeat (nao capturado). Separadas como "Captura garantida": Master e Ancient Origin. Conferencia: 44 + 2 + 2 = 48. Top 3 exibido: Love 8x, Quick 5x, Dream 4x. Net Ball fica acima da Poke Ball (criterio de aceite) e Fast Ball nao aparece.
- **Edge cases**: especie custom sem spawns -> so regras intrinsecas (Lure/Dive excluidas); peso ausente ou 0 -> Heavy na faixa 1x (nunca excluida); genderless (`maleRatio -1`) -> Love excluida.
- **Consumes**: `BallInfo`, `SpeciesDetail` (`src/data/types.ts`), `HEAVY_BALL_BANDS`/`heavyBallMultiplier` (`src/domain/ball-rules-types.ts`, B1.5).
- **Done when**: teste Magikarp reproduz exatamente o ranking completo acima (44 posicoes na ordem, 2 excluidas, 2 garantidas); teste Charizard (`weight` 905 hg = 90,5 kg, speed 100): Fast Ball 4x incondicional logo apos Love 8x e Quick 5x e ANTES das 4x condicionais; Heavy Ball presente como 1x incondicional (faixa `<= 1000` hg), no bloco de 1x entre `Heal Ball` e `Luxury Ball` pela ordem EN; teste de peso 3500 hg -> Heavy 4x incondicional.
- **Commit**: `feat(domain): poke ball ranking with intrinsic and best-case conditional multipliers`
- **Rollback**: revert.

#### Feature B6.5: Busca `[category: outro]`
- **Traces**: RF-05, RF-06, RF-07, RF-67.
- **Steps**: `normalizeSearch` importada de `src/domain/normalize.ts` (B1.5, congelada; NFD, remove diacriticos, minusculo, trim) e reexportada por `search.ts`, nunca reimplementada; `parseDexQuery(q)`: `/^#?0*(\d{1,4})$/` -> numero (aceita "25", "025", "0025", "#25"); `searchSpecies(index, q, limit)`: numero -> match exato de `dex`; texto -> `searchKey.includes(norm)` com ranking (prefixo antes de substring, PT e EN iguais); `searchItems(items, q)` idem sobre `name.pt + " " + name.en`.
- **Edge cases**: query vazia -> `[]`; "0" -> `[]`; caracteres especiais escapados (nao usa regex sobre a query).
- **Consumes**: `SpeciesSummary`, `ItemInfo`, `normalizeSearch` (B1.5).
- **Done when**: testes "025"/"pantano"/"charizar"/"9902".
- **Commit**: `feat(domain): accent-insensitive bilingual search and dex-number parsing`
- **Rollback**: revert.

#### Feature B6.6: Historico e time `[category: outro]`
- **Traces**: RF-38, RF-39, RF-40, RF-43, RF-44, RF-45.
- **Steps**: `HISTORY_LIMIT = 20`; `pushHistory(entries, dex, now)`: remove entrada existente com o mesmo `dex`, insere `{dex, viewedAt: now}` no inicio, corta em 20; `mergeHistory(a, b)` (usado pelo sync) dedup por dex mantendo maior `viewedAt`, ordena desc, corta 20. `TEAM_SIZE = 6`; `addToTeam(slots, dex)`: ja presente -> `{ok:true, slots}`; primeiro `null` -> preenche; nenhum -> `{ok:false, reason:"full"}`; `removeFromTeam(slots, dex)` -> `null` na posicao (mantem ordem).
- **Edge cases**: `slots.length !== 6` -> normaliza para 6; `dex` invalido (<= 0) -> erro.
- **Consumes**: -
- **Done when**: testes 21o item / duplicado ao topo / 7o no time.
- **Commit**: `feat(domain): history rotation and six-slot team rules`
- **Rollback**: revert.

### Sprint B7: Persistencia, sincronizacao, backup e loaders

- **Descricao**: camada de storage (interface + IndexedDB + migracoes + repositorios), codec de sincronizacao com mesclagem, backup, e loaders do dataset com cache.
- **Deliverable**: `storage.init()` cria o DB, todos os docs fazem round-trip, migracao sintetica testada com rollback, `encodeSyncCode/decodeSyncCode` round-trip, `mergeDocuments` cobre o exemplo do PRD, `loadSpecies` com cache/retry.
- **Risco**: alto (dados do usuario).
- **Prerequisito**: B1, B6.
- **Files** (criar): `src/storage/{defaults,storage-adapter,indexeddb-adapter,migrations/index,migrations/v1-from-prototype-localstorage,validate,backup,write-queue,errors}.ts` (`src/storage/types.ts` NAO: vem pronto e congelado de B1.5), `src/storage/repositories/{captured,team,history,trainer-progress,preferences}.ts`, `src/sync/{types,codec,frames,merge,summary}.ts`, `src/data/{loaders,cache,schemas}.ts` (`schemas.ts` = esquemas zod de §5.1.3, dono B7.4, importado por B2.5; `src/data/types.ts` vem de B1.5), `src/platform/{index,web}.ts` (deteccao de plataforma para a Fase 2); testes em `tests/unit/{storage,sync,data}/` e fixtures em `tests/fixtures/rules-storage/` (pastas exclusivas do agente Regras e armazenamento).

#### Feature B7.1: StorageAdapter, IndexedDB, migracoes e repositorios `[category: database]`
- **Traces**: RF-42, RF-47, RF-56, RF-62, RF-82, RF-84, RF-90, RF-94, RF-95, RF-96, RF-99, RF-123, RF-124, RNF-06.
- **Steps**:
  1. `defaults.ts`: `DOC_DEFAULTS` (padroes de §5.3 e §2b) e `CURRENT_SCHEMA_VERSION = 1`, tipados pelos `DocMap`/`DocKey`/`StorageAdapter` importados de `src/storage/types.ts` (B1.5, congelado; esta feature nao o edita). O tema padrao vem de `THEME_IDS[0]` (`src/styles/themes.ts`).
  2. `indexeddb-adapter.ts` (`idb`): `openDB("pontindex", 1, { upgrade(db) { db.createObjectStore("documents", { keyPath: "key" }); db.createObjectStore("backups", { keyPath: "id" }); } })`; `read` -> `validateDoc(key, raw)` (zod + reparos de §5.3); `write(key, doc)` -> `tx(["documents"], "readwrite")`: `put({key, doc})` + `put({key:"meta", doc: {...meta, lastWriteAt}})` na mesma transacao; `writeMany` idem para n docs; `delete(keys)` -> `put` dos padroes (nunca `clear` do store, para manter `meta`); `write-queue.ts` serializa chamadas; erros mapeados em `StorageError` (`QuotaExceededError` -> `QUOTA_EXCEEDED`, `InvalidStateError` -> `UNAVAILABLE`, `blocked` -> `BLOCKED`).
  3. `migrations/index.ts`: `runMigrations(adapter)`: le `meta`; se ausente -> cria com `schemaVersion = CURRENT` (instalacao nova); se menor -> snapshot em `backups` (`pre-migration-v<from>-<ts>`), aplica `up` em cadeia, `writeMany` + `meta` em uma transacao; se maior -> `readOnly = true` (UI mostra aviso e bloqueia escritas). `v1-from-prototype-localstorage.ts`: `from: 0, to: 1`: se `localStorage["pontindex.terms"]`/`["pontindex.sound"]` existirem (`app.js:654-655`, `1067`), importa para `preferences` e remove.
  4. Repositorios (um por doc) expõem operacoes de dominio (`captured.add(dex, at)`, `remove`, `has`, `listKnown(datasetIndex)`; `team.add/remove`; `history.push`; `trainerProgress.markDefeated/unmarkDefeated/setActiveSeries/enterFreeroam/leaveFreeroam`; `preferences.set(patch)`), sempre "ler doc -> aplicar regra de dominio (B6.6) -> escrever doc inteiro" (idempotente, sem duplicatas porque os docs sao mapas por chave).
  5. `init()` tambem chama `navigator.storage?.persist?.()` (no 1o gesto, via `requestPersistence()` exposto para F1.4) e guarda o resultado em memoria.
  6. `filterKnown`: helper que recebe o indice do dataset e devolve apenas entradas com `dex` existente (RF-123), sem alterar o storage.
- **Edge cases**: DB bloqueado por outra aba com versao antiga -> `BLOCKED` + toast "Feche as outras abas do Pontindex"; `documents` com doc de chave desconhecida -> ignorado (mantido); escrita concorrente de dois repositorios -> fila; `fake-indexeddb` nos testes; corrupcao parcial (doc `team` como string) -> `backups["corrupt-team-<ts>"]` + padrao; navegador sem IndexedDB (privado antigo) -> `MemoryAdapter` de fallback com aviso persistente "Seus dados nao serao salvos neste modo" [ASSUMPTION].
- **Consumes**: `DocMap` (§5.3, `src/storage/types.ts` de B1.5), `THEME_IDS` (B1.5), B6.6.
- **Done when**: testes: round-trip dos 6 docs; migracao 0->1 importa `pontindex.terms`; snapshot criado e `restorePreMigrationSnapshot` reverte; escrita com `QuotaExceededError` simulado nao corrompe o doc anterior (leitura apos falha = valor antigo); `filterKnown` esconde dex 99999 sem apaga-lo.
- **Commit**: `feat(storage): versioned indexeddb adapter with atomic writes, migrations, snapshots and repositories`
- **Rollback**: revert; dados existentes continuam legiveis pela versao anterior (esquema v1 nao muda).

#### Feature B7.2: Codec de sincronizacao e mesclagem `[category: integracao]`
- **Traces**: RF-73, RF-74, RF-76, RF-78, RF-112, RF-113.
- **Steps**:
  1. `codec.ts`: `encodeSyncCode(docs: Partial<DocMap>, opts?: { now?: number }): SyncEncoded { text: string; frames: string[]; bytes: number; summary: SyncSummary }` implementando o layout de §5.4.1 (tema = indice em `THEME_IDS`; timestamps em ms nos docs viram u32 segundos com `Math.floor(ms/1000)` e voltam com `*1000`) (DataView little-endian; ids ASCII validados `/^[a-z0-9_:\-\.]+$/`, senao erro), `deflateRawSync` do `fflate`, CRC32 (implementacao propria de 20 linhas), base64url; `decodeSyncCode(text): Result<{ docs: Partial<DocMap>; summary: SyncSummary }, SyncError>` com a matriz de §5c (checa magic, versao, CRC, tamanho, campos truncados via bounds check em cada leitura).
  2. `frames.ts`: `splitFrames(text, capacity = 900)`, `FrameCollector` (`add(frameText) -> { complete, received, total, sessionId, error? }`, `assemble()`); um texto sem prefixo `PDXF.` e tratado como codigo inteiro.
  3. `merge.ts`: `mergeDocuments(local: DocMap, incoming: Partial<DocMap>, mode: "merge"|"replace"): DocMap` conforme §5.4.4 (usa `mergeHistory` de B6.6); `replace` copia os docs recebidos e mantem os padroes para docs ausentes; nunca toca `meta`.
  4. `summary.ts`: `summarize(docs, datasetIndex)` -> contagens e `unknownIds`.
- **Edge cases**: bitmap com bits acima de `maxDex` do receptor (dataset mais novo na origem) -> dex mantidos como orfaos; `capturedAt` ausente (modo 0) -> `Date.now()` do receptor; `formatVersion` 1 com `schemaVersion` 1; texto com espacos/quebras de linha (colado de WhatsApp) -> `trim` e remocao de whitespace antes de decodificar; frames repetidos -> ignorados.
- **Consumes**: `DocMap`, `THEME_IDS` (B1.5), B6.6, §5.4.
- **Done when**: property test (`fast-check`) de round-trip `decode(encode(x)) == x` para docs aleatorios, igualdade modulo precisao de segundo nos timestamps (inclui times com `null` em qualquer posicao, ex. `[6,null,94,null,null,149]`, que voltam identicos); texto de 200.001 caracteres -> `oversized` sem decodificar; payload que infla alem de 512 KB -> `oversized`; caso maximo (1027 capturados, 110 derrotados) gera >= 2 frames e reconstroi identico; exemplo A/B do PRD; CRC corrompido -> `corrupted`; magic errado -> `foreignApp`; `formatVersion 9` -> `unsupportedVersion`.
- **Commit**: `feat(sync): binary bitmap sync codec with deflate, crc, multi-frame qr and per-entity merge`
- **Rollback**: revert (nao ha dados persistidos no formato de sync).

#### Feature B7.3: Backup exportar/importar `[category: database]`
- **Traces**: RF-97, RF-98, RF-122.
- **Steps**: `backup.ts`: `exportBackup(adapter): BackupFile` (§5.3, `crc32` do JSON canonico de `documents`); `parseBackup(text): Result<BackupFile, SyncError>` (zod + crc + versao); `applyBackup(adapter, file, mode)` = migra docs se `schemaVersion < CURRENT` (mesmas `up`) e chama `mergeDocuments` + `writeMany`; `deleteData(adapter, keys | "all")` grava padroes (e limpa `backups` quando `all`).
- **Edge cases**: backup gerado com dataset diferente -> ids orfaos preservados; arquivo > 5 MB -> `oversized`; JSON com BOM -> aceito.
- **Consumes**: `StorageAdapter`, B7.2 `mergeDocuments`.
- **Done when**: round-trip export -> `deleteData("all")` -> import = docs identicos (deep equal, exceto `meta.lastWriteAt`).
- **Commit**: `feat(storage): backup export/import with crc and delete-data`
- **Rollback**: revert.

#### Feature B7.4: Loaders do dataset com cache e retry `[category: integracao]`
- **Traces**: RF-100, RF-101, RF-102, RNF-03.
- **Files** (criar): `src/data/loaders.ts`, `src/data/cache.ts`, `src/data/schemas.ts` (zod; dono unico = B7.4; B2.5 so importa), `src/platform/{index,web}.ts`.
- **Steps**: `loaders.ts`: `loadManifest()` (le `/data/current.json` -> `datasetVersion` -> `/data/<ver>/dataset-manifest.json`), `loadSpeciesIndex()`, `loadSpecies(dex)`, `loadMoves()`, `loadAbilities()`, `loadItems()`, `loadBalls()`, `loadSeries()`, `loadTrainers(seriesId)`, `loadTypeChart()`, `loadBiomes()`, `loadFossils()`; todos com cache em memoria (`Map`), dedup de requests em voo, timeout 15 s, 2 retries (500 ms, 1500 ms), validacao zod com os esquemas de `schemas.ts` (criado aqui, um esquema por tipo de §5.1.3 importado de `src/data/types.ts`; o pipeline em B2.5 importa os mesmos esquemas) (falha -> `DatasetError { code: "INVALID" }`); `platform/web.ts`: `isNative = false`, `hasCamera`, `canInstall`. Nenhum loader acessa nada fora de `/data` e `/assets` (RF-101).
- **Edge cases**: `current.json` ausente (build sem dataset) -> tela de erro de boot "Dataset não encontrado: rode `npm run dataset`" (nunca tela branca); offline com SW cache -> serve do cache; offline sem cache -> `DatasetError NETWORK` com botao "Tentar de novo".
- **Consumes**: §5.1.3 (`src/data/types.ts`, B1.5).
- **Done when**: testes com `fetch` mockado (`tests/unit/data/loaders.test.ts`; `schemas.ts` aceita uma ficha de exemplo de `tests/fixtures/rules-storage/`): cache hit nao refaz request; 2 falhas + sucesso; JSON invalido -> `INVALID`.
- **Commit**: `feat(data): dataset loaders with in-memory cache, retry and schema validation`
- **Rollback**: revert.


## Frontend

Regras gerais de toda feature de frontend (auto-fill da categoria `frontend`, valem em TODAS as features abaixo mesmo quando nao repetidas):
- **Loading**: qualquer bloco que espera dados mostra `<PokeballSpinner>` (RF-125) ou skeleton (`<Skeleton>` com `shimmer`, `style.css:281`), nunca tela em branco.
- **Erro**: `ErrorBoundary` por tela (mensagem + botao "Tentar de novo" + "Voltar ao inicio"); falhas de fetch do dataset mostram `<InlineError>` com retry; nunca `console.error` silencioso sem UI.
- **Vazio**: estado vazio explicito com o padrao `.ob-none` (UISPEC 5, "Estados vazio/erro").
- **Offline**: tudo funciona sem rede exceto artwork (placeholder RF-16); a tela Sincronizar nao usa rede.
- **Validacao de input**: inputs numericos com `min/max/step` e clamp; texto de busca sem limite mas debounced (120 ms).
- **Sem re-render global** (RF-04): cada bloco parcial le seu proprio slice da store (`useNavigationStore(s => s.current.ui.moveTab)`) e e memoizado; a tela pai nao muda de identidade ao trocar aba/filtro/toggle.
- **UISPEC**: cores/tipografia/radius/animacoes vem dos tokens de `src/styles/*` (F1); nao redefinir inline.
- **Sem sobreposicao de texto** (feedback do Pontin, 2026-09-24, prints do prototipo versionados em `.forge/in-progress/pontindex/feedback/`: `1.png` selo "NAO NASCE NO MUNDO" do Mewtwo passando por baixo do botao de som; `2.png` tag "ITENS SEGURADOS" atravessando e espremendo o nome nos cards de item). Regra de layout (decisao do Pontin): em cards, tags e selos (categoria, raridade, Lendario/Mitico) ficam em linha propria ACIMA do titulo, nunca na mesma linha do titulo; no hero da ficha a linha de selos ja fica acima do titulo e reserva a largura dos botoes shiny/grito a direita, quebrando em mais linhas se precisar. Nenhum texto pode atravessar/ficar por baixo de outro elemento (botao, selo, chip, icone) em nenhuma tela, tema ou idioma (PT e EN), a 360 px, 390 px e 1280 px. Linhas com elementos a esquerda e botoes a direita reservam o espaco dos botoes (ex. `padding-right` = largura dos botoes + gap) e quebram linha ou reduzem o selo em vez de sobrepor. Verificacao automatica em toda feature de frontend: helper `expectNoOverlap(page, root)` em `tests/harness/no-overlap.ts` (criado em F1.4) que compara os `getBoundingClientRect()` dos elementos com texto visivel e dos controles irmaos/posicionados e falha se dois se cruzam (tolerancia 1 px), rodado headless, sem timers.
- **Done when** implicito em todas: "renderiza sem erros no console (Vitest + Playwright) e corresponde a captura de referencia do UISPEC citada". EXCECAO: F1.1, F1.2 e F1.3 (Onda 1b) rodam antes de existir qualquer tela real, entao o Done delas e unitario/harness (tokens via `getComputedStyle` numa pagina de teste, completude do dicionario, store de navegacao com telas ficticias); as comparacoes visuais com `ui-refs/` e o fluxo e2e de navegacao foram movidos para as features onde as telas existem (F2.2, F4.1, F9.3, F10.1) e para T1, como indicado em cada uma.

### Sprint F1: Fundacao visual, i18n, navegacao e shell (desktop + mobile)

- **Descricao**: cria a base React: tokens e temas CSS portados do prototipo, paleta por tipo gerada de `cores.json`, dicionario i18n, pilha de navegacao propria, layout desktop (sidebar) e mobile (topbar-aparelho + tabbar + sheet "Mais"), boot splash, marca d'agua, barras de rolagem, reduzir animacoes, motor de som, componentes primitivos e a hidratacao das preferencias antes do 1o paint.
- **Deliverable**: app abre na Home (vazia por enquanto) com tema/idioma/som/animacoes persistidos, navegacao entre telas placeholder com Voltar real, layouts desktop e mobile identicos as capturas `desktop-home.png` (moldura) e `mobile-home.png` (shell), 7 temas trocaveis.
- **Risco**: medio (fundacao que todas as telas usam).
- **Prerequisito**: F1.1-F1.3 (Onda 1b): B1 completo (inclui os contratos congelados de B1.5) E B7.1 verde no checklist (o `preferences-store` usa os repositorios de B7.1), e um agente da Onda 1 ja terminado (teto de 4). F1.4 (Onda 3): F1.1-F1.3, B7.1 e B3.4 (`src/audio/sfx-names.ts`). Nenhuma parte de B6 e necessaria.
- **Files** (todos criar, exceto onde indicado; entre parenteses a feature dona):
  - `index.html` (F1.4; modifica o gerado em B1: adiciona meta theme-color e links do manifest; `<div id="root">` e viewport ja vem de B1.1)
  - `src/main.tsx` (F1.4, modifica o de B1.1), `src/App.tsx` (F1.4)
  - `src/styles/tokens.css` (F1.1; porta `style.css:1-61`: fontes, radius, sombras, easings, `--wm-opacity`, cores de stat `--s-*`), `src/styles/themes.css` (F1.1; porta `style.css:62-125`, 7 blocos `html[data-theme=...]` + `--on-primary/--on-secondary/--on-accent/--shell-text/--lens/--scroll-thumb`), `src/styles/theme-meta.ts` (F1.1; `THEMES: Record<ThemeId, { p1: string; p2: string; labelKey: string }>` para o `ThemeGrid`, importando `ThemeId`/`THEME_IDS` de `src/styles/themes.ts`, que NAO e editado), `src/styles/types.generated.css` (nao recriar, gerado em B1.4 de `cores.json`: `--t-<tipo>`, `--type-<tipo>-a/b`, classes `.t-<tipo>` e `.g-<tipo>` como `style.css:305` e `431`), `src/styles/base.css` (F1.1; reset, scrollbar `style.css:128-132`, `.part-in/.screen` `247-251`, reduce-motion `1139-1142`, `@media (max-width:900px)` `887`, `min-width:1500px` `895`), `src/styles/components.css` (F1.1; `.card 254`, `.btn 262-275`, `.chip 284-304`, `.badge 325-335`, `.seg 399-403`, `.notice 493-494`, `.panel 498-500`, `.switch 701-706`, `.tag 573`, `.tabs 576-578`, `.it-tile 902-924`), `src/styles/mobile.css` (F1.4; `style.css:802-875`), `src/styles/shell.css` (F1.4; sidebar `208-226`, topbar/lens/leds `175-189` e `804-809`, tabbar `811-819`, sheet `985-993`, boot `192-204`, watermark `242-245`)
  - (F1.2) `src/i18n/messages.ts` (porta as ~230 chaves de `app.js:13-268` EXCETO `detail.noSpawn`, `detail.noSpawnDesc` (RF-10), `evo.methods` (IDEA), `captured.progress/gen1`, `home.lastCaught`, `ip.noDesc` (textos fake) e as chaves `evo.<pedra>` fixas (nomes de item vem do dataset); adiciona `sync.*`, `backup.*`, `deleteData.*`, `about.*`, `error.*`, `empty.*`, `offline.*`, `obtain.addon.*`), `src/i18n/useT.ts`, `src/i18n/types.ts` (`TYPE_NAMES` de `app.js:270-277`)
  - (F1.3) `src/navigation/navigation-store.ts`, `src/navigation/useNavigation.ts`, `src/navigation/history-bridge.ts`, `src/navigation/types.ts`, `src/navigation/sound-hook.ts` (gancho de som injetado, sem importar `src/audio/`)
  - `src/state/preferences-store.ts` (F1.2; persiste pelo repositorio `preferences` de B7.1 e chama `applyTheme` de F1.1; F1.1 nao o importa), `src/state/dataset-store.ts` (F1.4)
  - (F1.4) `src/audio/sfx.ts`, `src/audio/cries.ts` (`src/audio/sfx-names.ts` NAO: vem pronto de B3.4)
  - `src/components/{Watermark,TypeChip,TypeIcon}.tsx` (F1.1), `src/components/TermsToggle.tsx` (F1.2), `src/components/ScreenRouter.tsx` (F1.3), `src/components/{AppShell,Sidebar,Topbar,TabBar,MoreSheet,BootSplash,ErrorBoundary,Toast,PokeballSpinner,Skeleton,InlineError,EmptyState,Badge,SegmentedControl,Switch,ArtworkPlaceholder,ItemTile,Modal}.tsx` (F1.4)
  - (F1.4) `src/pwa/register-sw.ts`, `src/pwa/manifest.webmanifest` (gerado por vite-plugin-pwa a partir de `vite.config.ts`)
  - `src/assets/pokeball.webp`, `src/assets/types/<tipo>.svg`, `src/assets/pokeball-mask.png`: nao recriar, gerados/copiados em B1.4 (aqui so importados)
  - Testes da Onda 1b (pastas exclusivas do agente): `tests/unit/ui-foundation/{tokens,i18n,navigation}.test.ts(x)`; `tests/harness/foundation.html` + `tests/harness/foundation.tsx` (pagina de teste servida pelo `npm run dev`, importa `src/styles/*` e monta chips/cards/watermark com `data-theme` alternavel, sem nenhuma tela real); `tests/harness/foundation.spec.ts` (Playwright `headless: true`, sem `slowMo`, sem timers); `tests/fixtures/ui-foundation/` (valores esperados da tabela do UISPEC 3.3, tirados de `ui-refs/tokens.json`). F1.4 (Onda 3) testa em `tests/unit/ui-shell/` e `tests/e2e/shell.spec.ts`.

#### Feature F1.1: Tokens, temas e paleta por tipo `[category: frontend]`
- **Traces**: RF-79, RF-80, RF-81, RF-87, RF-117, RF-119, RF-120, RNF-07, RNF-08, UISPEC 3.1-3.4, 3.7.
- **Steps**:
  1. Portar `style.css:1-61` para `tokens.css` e `style.css:62-125` para `themes.css`, mantendo os NOMES das custom properties, mas com ids de tema em ingles no seletor `html[data-theme=...]`, iguais aos de `THEME_IDS` importado de `src/styles/themes.ts` (criado e congelado em B1.5; esta feature NAO o edita, so o importa; as cores das amostras `--p1/--p2` do `ThemeGrid` ficam em `src/styles/theme-meta.ts`, criado aqui); tabela de mapeamento para o prototipo/UISPEC: classic=classico, black=preto, green=verde, blue=azul, purple=roxo, white=branco, orange=laranja (as capturas `theme-<nome pt>-*.png` mantem o nome); `--surface` do tema `black` = `#111111` (RF-80, UISPEC 3.3).
  2. `types.generated.css` (gerado em B1.4) define, para cada um dos 18 tipos: `--t-<tipo>: base`, `--type-<tipo>-a: a`, `--type-<tipo>-b: b`, `.t-<tipo> { --tc; --g1; --g2 }`, `.g-<tipo> { --g1; --g2 }`. Nenhum outro arquivo pode declarar cores de tipo (RF-117).
  3. `applyTheme(themeId: string)` (exportada de `src/styles/theme-meta.ts`; id fora de `THEME_IDS` vira `classic` com `console.warn`) seta `document.documentElement.dataset.theme` (como `app.js:1061-1064`); a troca e instantanea porque tudo deriva das variaveis, inclusive `scrollbar-color`/`::-webkit-scrollbar-thumb` (`style.css:128-132`).
  4. Fundo da area de conteudo = `var(--screen)` (RF-120); cards `var(--surface)`.
  5. `Watermark.tsx`: `<div class="watermark">` com `mask-image: url(pokeball-mask.png); mask-mode: alpha; background: var(--text); opacity: var(--wm-opacity)`; a mascara PNG (gerada em B1.4 por `sharp`: canal alfa = luminancia invertida da pokebola) preserva o desenho (faixa e botao) em monocromo; fallback `@supports not (mask-image: url())` -> `filter: grayscale(1) contrast(.6)` (prototipo `style.css:243`). Animacao `wmSpin 60s` (`style.css:245`).
  6. Chips de tipo (`TypeChip.tsx`): icone SVG (`TypeIcon`, `src/assets/types/<tipo>.svg` importado como URL pelo Vite, nunca caminho relativo `../tipos`) + nome via `TYPE_NAMES[type][lang]` com inicial maiuscula (RF-87); classe `.t-<tipo>`; estado "nao selecionado" nos filtros = contorno (`.chip` sem `.on`), nunca opacidade (RNF-07).
- **Edge cases**: tema salvo inexistente (ex. dataset futuro) -> cai para `classic` com aviso; `prefers-color-scheme` e ignorado (tema e escolha explicita); `color-mix` sem suporte -> fallback de cor solida definido em `components.css` via `@supports`.
- **Consumes**: `ThemeId`/`THEME_IDS` (`src/styles/themes.ts`, B1.5), `types.generated.css` e `pokeball-mask.png` (B1.4). NAO consome o `preferences-store` (F1.2): `applyTheme(themeId: string)` e pura sobre o `<html>` e ela mesma normaliza id desconhecido para `classic`; quem le o tema salvo e chama `applyTheme` e o `preferences-store` de F1.2 (ordem de execucao F1.1 -> F1.2 -> F1.3 mantida).
- **Done when** (unitario/harness, verificavel na Onda 1b sem telas reais): em `tests/harness/foundation.spec.ts` (Playwright `headless: true`, sem `slowMo`, sem timers) a pagina `tests/harness/foundation.html`, para cada um dos 7 ids de `THEME_IDS`, seta `data-theme` e `getComputedStyle(document.documentElement)` devolve os valores da tabela de tokens do UISPEC 3.3 (esperados em `tests/fixtures/ui-foundation/`), incluindo `--surface` = `#111111` no `black` e `--scroll-thumb`; um `.t-fire` do harness tem `--tc` = cor base de fogo de `cores.json`; o `.watermark` tem `mask-image` com `pokeball-mask`; `tests/unit/ui-foundation/tokens.test.ts`: `applyTheme("inexistente")` deixa `data-theme="classic"` (sem store). O caso "tema SALVO inexistente no IndexedDB cai para `classic`" e testado em F1.2, depois que o `preferences-store` existe. As comparacoes visuais com `ui-refs/` foram movidas: tema `classic` = `desktop-home.png` (F2.2) e `desktop-detail-charizard-full.png` (F4.1); os outros 6 temas = `theme-<azul|branco|laranja|preto|roxo|verde>-home.png` e `theme-<...>-detail-charizard.png` em T1 (`tests/e2e/responsive.spec.ts`), pois `ui-refs/` nao tem `theme-classico-*`.
- **Commit**: `feat(ui): design tokens, 7 themes and generated type palette`
- **Rollback**: `git revert` do commit; nenhum dado persistido depende dele.

#### Feature F1.2: i18n e toggle de termos por card `[category: frontend]`
- **Traces**: RF-83, RF-84, RF-85, RF-86, RNF-05.
- **Steps**:
  1. `messages.ts`: `export const MESSAGES = { "nav.home": { pt: "Início", en: "Home" }, ... } as const`; `useT()` retorna `t(key, vars?)` que le `uiLanguage` da `preferences-store` e faz interpolacao `{n}`; chave ausente lanca em dev (teste falha) e em prod devolve a chave (nunca vazio).
  2. `TermsToggle.tsx` (porta `termsTgl()` `app.js:657`): recebe `cardKey`; le `termsOverrides[cardKey] ?? termsLanguage`; ao clicar grava `setTermsOverride(cardKey, lang)` na store (persistido, RF-86) e so o card consumidor re-renderiza (o card le `useTermsLanguage(cardKey)`).
  3. `gameName(entity, lang)`: helper que escolhe `name.pt`/`name.en` de qualquer objeto do dataset com `{pt,en}`; termos secundarios exibidos em `<small>` como `termPair()` (`app.js:665`).
  4. `document.documentElement.lang = "pt-BR" | "en"` (`app.js:1055`).
- **Edge cases**: override salvo para card que nao existe mais -> ignorado; troca de idioma da interface nao toca overrides (RF-85).
- **Consumes**: `DocMap.preferences` (`theme`, `uiLanguage`, `termsLanguage`, `termsOverrides`; tipos de B1.5; persistencia pelo repositorio `preferences` de B7.1), `applyTheme` (F1.1).
- **Done when** (unitario, Onda 1b): `tests/unit/ui-foundation/i18n.test.ts`: toda chave de `MESSAGES` tem `pt` e `en` nao vazios (completude do dicionario); nenhuma das chaves excluidas (`detail.noSpawn`, `detail.noSpawnDesc`, `evo.methods`, `captured.progress`, `home.lastCaught`, `ip.noDesc`) existe; `t("chave.inexistente")` lanca em dev; interpolacao `{n}`; `TermsToggle` com `cardKey="moves"` grava o override pelo repositorio (com `fake-indexeddb`) e so o card consumidor re-renderiza (contador de render); trocar `uiLanguage` nao altera `termsOverrides`; o `preferences-store` hidratado com `theme: "inexistente"` (doc gravado via `fake-indexeddb`) chama `applyTheme` (F1.1) e resulta em `data-theme="classic"` com aviso; `npm run lint` verde com a regra `no-literal-jsx-text` (B1.1) sobre `src/`. A comparacao com `desktop-settings-full.png` (bloco de idioma/termos) foi movida para F10.1, onde a tela existe.
- **Commit**: `feat(i18n): message dictionary, useT and per-card terms toggle`
- **Rollback**: revert.

#### Feature F1.3: Pilha de navegacao com historico real `[category: frontend]`
- **Traces**: RF-01, RF-02, RF-03, RF-04, RF-71 (parte de navegacao), RF-91 (clique de navegacao).
- **Steps**:
  1. `navigation/types.ts`: `interface NavEntry { id: number; screen: ScreenId; params: ScreenParams; ui: UiState; scroll: number }`, `type ScreenId = "home"|"dex"|"detail"|"captured"|"compare"|"trainers"|"balls"|"items"|"item"|"settings"|"sync"`, `UiState` = uniao dos estados por tela (ex. detail: `{ moveTab, formIndex, weakFilter, shiny, openMoveRows: string[], calcOpen, calcInputs }`; dex: `{ filters, sort, status }`; trainers: `{ seriesId, openTrainerId }`; balls: `{ filter }`; items: `{ category, query, openItemId }`; captured: `{ tab }`; compare: `{ left, right }`; sync: `{ mode }`; settings: `{ openCard }`; home: `{ query }`).
  2. `navigation-store.ts` (Zustand): `stack: NavEntry[]`, `current: NavEntry`; `navigate(screen, params)`: snapshot do `current` (le `scrollTop` de `#main`), push na `stack` (limite 40 como no prototipo, `app.js:1223`; o PRD nao fixa um limite, entao o valor do prototipo e mantido; alem disso descarta o mais antigo), cria novo `current` com `ui` padrao da tela, `history.pushState({ pontindex: id }, "")`, scroll de `#main` para 0 e chama o gancho de som injetado `navigationSound("navigate")` (RF-91). O gancho vive em `src/navigation/sound-hook.ts` (`let hook: (event: "navigate") => void = () => {}` + `setNavigationSoundHook(fn)`), com padrao no-op; a navegacao NAO importa `src/audio/sfx.ts` (F1.4, Onda 3). F1.4 liga o gancho no boot com `setNavigationSoundHook(() => playSfx("pokedex_click_short"))`. `go(screen)` (menu): se ja esta na tela, so scroll 0; senao `navigate`. `updateUi(patch)`: atualiza `current.ui` (sem push). `goBack(fromPopstate)`: pop; se vazio, vai para `home`; senao restaura `current = entry` e agenda `restoreScroll(entry.scroll)` em `requestAnimationFrame` duplo com `scrollBehavior: auto` (`app.js:1239`).
  3. `history-bridge.ts`: `window.addEventListener("popstate")` chama `goBack(true)` com o flag `ignorePop` para o botao do app (`app.js:1242-1250`); cobre botao fisico Android, gesto e Alt+Seta.
  4. `ScreenRouter.tsx`: renderiza o componente da `current.screen` com `key={current.id}`; telas restauradas re-montam com o `ui` salvo (abas, filtros, linhas abertas, calculadora aberta) e o scroll e reaplicado apos o primeiro paint (e novamente apos o carregamento lazy do detalhe terminar, para nao "pular").
  5. Botao "Voltar" (`.detail-back`) chama `goBack(false)`.
- **Edge cases**: pilha vazia + popstate (usuario apertou voltar do navegador na 1a tela) -> nada muda; refresh da pagina limpa a pilha (aceito, comportamento de SPA) mas o `current` volta para `home`; `pushState` indisponivel (iframe restrito) -> pilha interna continua funcionando.
- **Consumes**: nenhum contrato de dados (infra); nenhum import de `src/audio/` (som via gancho injetado).
- **Done when** (unitario/harness, Onda 1b, com telas ficticias registradas no `ScreenRouter` so no teste): `tests/unit/ui-foundation/navigation.test.ts`: `navigate` A -> B -> C e `goBack` duas vezes restaura `current.ui` de B e A exatamente (ex. `moveTab: "tm"`, `openMoveRows: ["flamethrower"]`) e o `scroll` salvo; pilha limitada a 40 (41o push descarta o mais antigo); `goBack` com pilha vazia vai para `home`; `updateUi` nao faz push; o gancho de som e chamado 1 vez por `navigate` (spy via `setNavigationSoundHook`) e o padrao no-op nao lanca; `tests/harness/foundation.spec.ts` (Playwright `headless: true`, sem `slowMo`, sem timers) no harness com telas ficticias rolaveis: navegar, rolar 800 px, navegar, `page.goBack()` (popstate) restaura o scroll com tolerancia de 2 px (`expect.poll`) e Alt+Seta esquerda tambem volta. Os fluxos reais foram movidos: "Dex com filtro Fogo + scroll > ficha > Voltar" para F4.1 (primeira feature com Dex e ficha) e "Charizard > Golpes TM > scroll > item > Voltar" para F9.3 (primeira com a pagina de item), ambos repetidos em T1 `tests/e2e/navigation.spec.ts`.
- **Commit**: `feat(nav): own navigation stack with exact restore and popstate bridge`
- **Rollback**: revert.

#### Feature F1.4: Shell desktop e mobile, boot, tabbar/sheet e som `[category: frontend]`
- **Traces**: RF-88, RF-89, RF-90, RF-91, RF-92, RF-93, RF-94, RF-116, RF-125, RNF-02, RNF-09, RNF-12 (camada de raios e definida em F4), UISPEC 4 (Sidebar, Topbar, Tab bar, Bottom sheet, Boot).
- **Steps**:
  1. `AppShell.tsx`: `<div id="app" class="app [mobile]">` com `Sidebar` (desktop, `index.html:35-59`, nav items Home/Dex/Capturados/Comparar/Treinadores/Pokebolas/Itens/Sincronizar/Configuracoes + toggles som/idioma/tema + `sidebar-version` = "Dados: All the Mons {pack} / Cobblemon {cobblemon}" do `DatasetManifest`, RF-104), `Topbar` (mobile, `index.html:61-72`: lente `.lens-lg`, LEDs, titulo, toggles) e `TabBar` (`index.html:241-247`: Inicio, Dex, botao-bola central Capturados, Comparar, Mais) + `MoreSheet` (`index.html:250-259`: Treinadores, Pokebolas, Itens, Sincronizar, Configuracoes). `mobile` = `window.innerWidth < 900` (`app.js:1072`) com fallback CSS `@media (max-width:900px)`.
  2. `BootSplash.tsx` (`index.html:16-28`, `style.css:192-204`): tampa superior/inferior na cor `--primary`, `boot-ball` girando (`spin 1.2s`), titulo "Pontindex" + `boot.loading`; enquanto `dataset-store.ready === false` a tampa fica fechada; ao ficar pronta, toca `pokedex_open` (RF-116, RF-91) e anima `lidUp/lidDown` (delay 1.4 s so na 1a abertura da sessao; reaberturas por navegacao nao mostram boot). Mesma sequencia em desktop e mobile (UISPEC 8.9).
  3. `audio/sfx.ts`: porta `sfxEl/playRaw/sfx/pendingSfx` (`app.js:633-647`), mapa `SFX_FILES` -> `/assets/sfx/<name>.ogg` gerado a partir de `SFX_NAMES` importado de `src/audio/sfx-names.ts` (B3.4, fonte UNICA dos 20 nomes, incluindo `pokedex_scan_open` e `evolution_full`; esta feature nao mantem lista propria); `playSfx(name: SfxName)` respeita `soundEnabled`; no boot, `setNavigationSoundHook(() => playSfx("pokedex_click_short"))` liga o gancho de F1.3; `playCry(slug)` (`cries.ts`) ignora o toggle (RF-32/RF-89). Autoplay bloqueado -> fila `pendingSfx` disparada no proximo `pointerdown`. Clique global: `pokedex_click_short` em navegacao e `click` em botoes (`app.js:1324-1325`).
  4. Reduzir animacoes: `preferences.reduceMotion === null` -> segue `matchMedia("(prefers-reduced-motion: reduce)")` (RF-93); `true/false` sobrescreve; aplica `html.reduce-motion` (`style.css:1142`) que zera todas as animacoes/transicoes (interruptor unico, UISPEC 5).
  5. Preferencias hidratadas ANTES do primeiro render (`main.tsx` aguarda `storage.init()` + `preferences` e aplica `data-theme`, `lang` e `reduce-motion` no `<html>` antes de `createRoot`), para nenhum flash de tema padrao (RF-82).
  6. `PokeballSpinner.tsx` (RF-125): `<img src=pokeball.webp class="spin">` em 3 tamanhos; `ArtworkPlaceholder.tsx`: silhueta preta da pokebola (`filter: brightness(0)`, como `.cap-art`, UISPEC 8.4) + opcional `notice` "Imagem nao disponivel" / "Imagem nao vem da PokeAPI" (RF-09/RF-16).
  7. `Toast.tsx` (fila global, 4 s, ou persistente para erros de storage), `Modal.tsx` (centralizado no desktop, `sheet-panel` no mobile, UISPEC 8.3), `ErrorBoundary.tsx`.
  8. `register-sw.ts`: registra o service worker gerado; `beforeinstallprompt` guardado para o botao "Instalar app" em Configuracoes (RF-103).
- **Edge cases**: `Audio.play()` rejeitado (autoplay) -> enfileira; arquivo de som 404 -> `console.warn` uma vez, sem toast; `matchMedia` indisponivel -> `reduceMotion=false`; largura entre 900 e 1500 px = desktop normal; largura minima do desktop = 900 px (abaixo vira mobile; RNF-09).
- **Consumes**: `DatasetManifest` (versao no rodape), `DocMap.preferences`, `StorageAdapter.init` (B7.1), `SFX_NAMES` (B3.4), `setNavigationSoundHook` (F1.3).
- **Done when**: `mobile-boot-lid-closed.png`, `mobile-nav-mais-sheet.png`; `desktop-home.png` e `mobile-home.png` comparados SO na regiao do shell (sidebar no desktop; topbar-aparelho e tabbar no mobile), com a area de conteudo `#main` mascarada (`toHaveScreenshot({ mask: [page.locator("#main")] })`), porque a Home real so existe em F2; teste: com som ligado, abrir o app toca `pokedex_open` (spy); `navigate` toca `pokedex_click_short` pelo gancho; com "Reduzir animacoes" ligado, `getComputedStyle(watermark).animationDuration === "0.001s"`. Cria `tests/harness/no-overlap.ts` (`expectNoOverlap`, regra geral "Sem sobreposicao de texto") e aplica no shell (tabbar, sheet "Mais", cabecalho) a 360 px, 390 px e 1280 px, PT e EN.
- **Commit**: `feat(shell): desktop sidebar, mobile pokedex shell, boot splash, sfx engine and motion preference`
- **Rollback**: revert.

### Sprint F2: Home, busca e blocos de time e historico

- **Descricao**: tela inicial com hero de busca (autocomplete por nome PT/EN e numero), botoes Pokedex/Aleatorio, resumo de capturados, time de 6 e historico (ultimos 20).
- **Deliverable**: `desktop-home.png` e `mobile-home.png` reproduzidos com dados reais do dataset.
- **Risco**: baixo.
- **Prerequisito**: F1, B2 (species-index), B6 (`search.ts`, `history.ts`, `team.ts`), B7 (repositories).
- **Files**: criar `src/screens/home/{HomeScreen,SearchBox,SearchDropdown,CapturedSummaryCard,TeamSlots,HistoryRow}.tsx`, `src/state/{captured-store,team-store,history-store}.ts`, `src/styles/home.css` (`style.css` blocos `.hero`, `.search`, `.search-dd 353-354`, `.summary*`, `.slot`, `.hist`, `.home-grid`).

#### Feature F2.1: Busca com autocomplete `[category: frontend]`
- **Traces**: RF-05, RF-06, RF-07, RF-08, RF-37 (botao aleatorio na Home).
- **Steps**:
  1. `SearchBox`: input controlado (debounce 120 ms) -> `searchSpecies(index, query, 8)` (B6.5) que aceita `"25"|"025"|"0025"|"#25"` (numero) e texto parcial sem acento em `searchKey` (pt|en). Resultado em `SearchDropdown` (`.dd-item` com sprite 96px local `/assets/sprites/<dex>.png`, `#0025`, nome no idioma da UI, chips `sm`).
  2. Enter abre o 1o resultado; clique abre `navigate("detail", {dex})`; sem resultado com texto nao vazio -> `EmptyState` inline "Nenhum Pokémon encontrado para '{q}'" (RF-08).
  3. Botao "Pokémon aleatório": `navigate("detail", { dex: index[Math.floor(Math.random()*index.length)].dex })` sobre as 1027 (RF-37). Botao "Abrir Pokédex": `go("dex")`.
- **Edge cases**: query so com `#` ou zeros ("000") -> sem resultado; especie custom (9902) encontrada por nome "creepyon" e por numero "9902"; dataset ainda carregando -> input desabilitado com spinner.
- **Consumes**: `SpeciesSummary[]` (`species-index.json`), `searchSpecies` (B6.5).
- **Done when**: testes: "025"/"25"/"0025" -> Pikachu; "pantano" com UI em ingles -> Quagsire; "charizar" -> Charizard; dropdown de autocomplete: sem captura de referencia (nenhuma imagem em `ui-refs/` cobre o dropdown aberto); validar contra as regras `.search-dd` de `style.css:353-354`.
- **Commit**: `feat(home): species search with dex-number and accent-insensitive pt/en autocomplete`
- **Rollback**: revert.

#### Feature F2.2: Time, historico e resumo de capturados na Home `[category: frontend]`
- **Traces**: RF-40, RF-41, RF-42, RF-43, RF-44, RF-45, RF-47, RF-52 (contador tambem na Home), RF-123.
- **Steps**:
  1. `team-store`: hidrata `DocMap.team` no boot; `addToTeam(dex)` usa `domain/team.ts` (retorna `{ok:false, reason:"full"}` quando 6 ocupados -> toast `team.full`, RF-39); `removeFromTeam(dex)`; cada mutacao chama `storage.write("team", doc)`.
  2. `TeamSlots`: 6 slots (`.slot`), vazios com "+" (`app.js:700-704`); ocupados com sprite 96px + nome e botao "x" (RF-40, com confirmacao simples em toast "Removido, desfazer" 4 s [ASSUMPTION]); slots com dex orfao (RF-123) renderizam como vazios mas nao sao apagados.
  3. `history-store`: `push(dex)` = `pushHistory(entries, dex, Date.now())` (B6.6: move ao topo, corta em 20); `HistoryRow`: cards `.hist` com sprite, `#dex`, nome, chips, ordenados do mais recente (`app.js:705-711`), filtrados por `filterKnown`. Sem botao de limpar (RF-46).
  4. `CapturedSummaryCard`: "X de {counts.species}" (`DatasetManifest.counts.species`, RF-52/RF-114), barra de progresso (`growX`), link "Ver todos" -> `go("captured")`.
- **Edge cases**: time com 6 orfaos aparece vazio mas "Adicionar" ainda responde "time cheio"? NAO: `addToTeam` considera orfaos como ocupados (RF-123 manda manter); toast explica "6 posicoes ocupadas (algumas de outra versao do dataset)". Historico com dex repetido corrompido -> deduplicado na leitura.
- **Consumes**: `DocMap.team`, `DocMap.history`, `DocMap.captured`, `DatasetManifest.counts`, `pushHistory`, `addToTeam/removeFromTeam` (B6.6).
- **Done when**: `desktop-home.png` (tambem e a referencia do tema `classic` para a Home, movida de F1.1); testes: 7o Pokemon -> aviso e nao adiciona; 21o no historico -> o mais antigo sai; reload mantem time e historico (fake-indexeddb).
- **Commit**: `feat(home): team slots, history row and captured summary bound to persisted stores`
- **Rollback**: revert (dados persistidos continuam validos).

### Sprint F3: Pokedex (lista virtualizada e filtros)

- **Descricao**: grade de 1027 cards com filtros de tipo (multi), geracao, metodo de evolucao, status capturado e ordenacao; virtualizada; filtros atualizam so a lista.
- **Deliverable**: `desktop-dex-grid.png`, `mobile-dex-grid.png`.
- **Risco**: medio (performance).
- **Prerequisito**: F1, F2 (stores), B2.
- **Files**: criar `src/screens/dex/{DexScreen,DexFilters,DexGrid,PokemonCard}.tsx`, `src/screens/dex/use-filtered-species.ts`, `src/styles/dex.css` (`.filters`, `.pcard 406-423`, `cardIn 423`, `.poke-grid`).

#### Feature F3.1: Grade virtualizada e card de Pokemon `[category: frontend]`
- **Traces**: RF-09, RF-28 (selo no card), RF-117, RF-121 (selo a esquerda no card), RNF-01, RNF-07, RNF-09.
- **Steps**:
  1. `PokemonCard` (porta `pcard()` `app.js:685-694`): `<button class="pcard g-<tipo1> rar-<legendary|mythical>">`, topo com `#0006` + `Badge` de raridade (`rarity.primary` ou, para lendario/mitico, o selo especial `badge-legendary/mythical` + raridade se houver), marca de capturado (pokebola pequena `caught-mark`) quando `capturedStore.has(dex)`, sprite 96px local (`hasSprite ? /assets/sprites/<dex>.png : <ArtworkPlaceholder size=sm>`), nome, chips `sm`. Cores via `--tc/--g1/--g2` da classe `.t-`/`.g-` (RF-117).
  2. `DexGrid`: `useVirtualizer` por linhas; `columns = Math.max(1, Math.floor((width + gap) / (200 + gap)))` no desktop, 2 no mobile; cada linha renderiza `columns` cards; `overscan = 3`; animacao `cardIn` so nos itens que entram (delay `i*45ms` limitado a 12 itens por lote).
  3. `DexScreen`: cabecalho com contagem `dex.results` = `list.length`.
- **Edge cases**: largura muda (resize/rotacao) -> recalcula colunas; lista vazia -> `EmptyState dex.none`; scroll restaurado ao voltar (F1.3) reaplica `scrollToOffset`.
- **Consumes**: `SpeciesSummary[]`, `DocMap.captured`.
- **Done when**: com 1027 itens, o DOM contem <= 60 `.pcard` simultaneos (teste Playwright conta nos); `desktop-dex-grid.png`; a 360 px e 390 px nenhum badge quebra o proprio texto (a LINHA de selos pode quebrar, regra "Sem sobreposicao de texto") (teste de largura, RNF-09).
- **Commit**: `feat(dex): virtualized grid with type-tinted pokemon cards`
- **Rollback**: revert.

#### Feature F3.2: Filtros combinaveis `[category: frontend]`
- **Traces**: RF-11, RF-12, RF-13, RF-14, RF-53 (filtro so capturados/faltando tambem aqui), RF-04, RF-05, RF-06, RF-07 (busca tambem na Pokedex, decisao do Pontin).
- **Steps**:
  1. `DexFilters` (porta `renderFilters` `app.js:729-732` e selects de `index.html:120-147`): chips de tipo (multi, `.chip.on` = selecionado, contorno = nao), select geracao (`gen1..gen9, gen7b, gen8a, custom` derivados de `index.map(s=>s.generation)` unicos, ordenados), select metodo de evolucao (`level, item, friendship, trade, move, other, none`), segmento status (`all|caught|missing`), select ordenacao (`num|name|bst`).
  2. Estado dos filtros vive em `current.ui.filters` (pilha, RF-01/02); `use-filtered-species` memoiza `index.filter(...)` com: tipo = `types.some(t => selected.includes(t))` (OR entre tipos, como `app.js:736`); geracao =; evo = `evolutionMethods.includes(method)`; status usa `capturedStore`.
  3. So `DexGrid` re-renderiza ao mudar filtro (seletor memoizado); `DexFilters` mantem foco.
  4. (Decisao do Pontin 2026-09-24; nao existe no prototipo) `DexSearch`: barra de busca no topo da Pokedex, igual a da Home no visual e no comportamento de texto: input com debounce 120 ms, aceita numero (`"25"|"025"|"0025"|"#25"`) e nome parcial PT ou EN sem acento, reusando `normalizeSearch`/`parseDexQuery` de `src/domain/search.ts` (B6.5; nada novo no dominio). Diferenca da Home: em vez de dropdown de autocomplete, o texto FILTRA a grade em conjunto com os demais filtros (E logico: texto E tipos E geracao E evolucao E status), mantendo a ordenacao escolhida; botao limpar (x). O texto vive em `current.ui.filters.query` (restaura ao voltar, RF-01/02); so `DexGrid` re-renderiza a cada tecla (RF-04). Placeholder e rotulos no modulo i18n `dex` (PT/EN).
- **Edge cases**: combinacao sem resultado (inclusive texto) -> `EmptyState` com o texto buscado; texto so com espacos = sem filtro de texto; geracao `custom` mostra Creepyon/Piglich.
- **Consumes**: `SpeciesSummary.evolutionMethods/generation/types`, `DocMap.captured`.
- **Done when**: Fogo + gen1 -> somente Fogo gen1; "item" -> so especies com evolucao por item; remover filtro nao remonta `DexScreen` (teste com `data-mount-id`). Busca na Pokedex: "char" + filtro Fogo -> Charmander, Charmeleon, Charizard (e mais nada que nao seja Fogo); "25" -> Pikachu; "pantano" -> Quagsire; texto + Voltar da ficha restaura texto, filtros e scroll; `expectNoOverlap` da barra a 360/390/1280 px em PT e EN.
- **Commit**: `feat(dex): combinable search, type, generation, evolution and status filters`
- **Rollback**: revert.

### Sprint F4: Ficha do Pokemon (parte 1: hero, stats, fraquezas, evolucao, habilidades, golpes)

- **Descricao**: tela de detalhe com card hero por tipo/lendario/mitico, selos, shiny, grito, botoes Capturei/time, stats com BST, painel de fraquezas com seletor, cadeia de evolucao clicavel com metodo exato, habilidades e tabela de golpes com abas e descricao.
- **Deliverable**: `desktop-detail-charizard-full.png`, `desktop-detail-charizard-moves-tm.png`, `desktop-detail-charizard-resistances.png`, `desktop-detail-mewtwo-legendary-full.png`, `desktop-detail-mew-mythical-full.png`, `mobile-detail-charizard-full.png`.
- **Risco**: alto (tela mais densa).
- **Prerequisito**: F1-F3, B2, B3, B6.
- **Files**: criar `src/screens/detail/{DetailScreen,HeroCard,StatsPanel,WeaknessPanel,EvolutionPanel,AbilitiesPanel,MovesPanel,MovesTable,MoveRow}.tsx`, `src/screens/detail/use-species-detail.ts` (consome `loadSpecies(dex)`, `loadMoves()`, `loadAbilities()` de `src/data/loaders.ts`, ja definidos por B7.4; nao redefine nem modifica os loaders), `src/styles/detail.css` (`style.css:449-487` hero, `503-514` stats, `517-527` weak, `530-564` evo, `567-573` abilities, `576-597` tabs/moves).

#### Feature F4.1: Hero card, selos, shiny, grito e acoes `[category: frontend]`
- **Traces**: RF-15 (parte), RF-09, RF-16, RF-28, RF-31, RF-32, RF-33, RF-38, RF-39, RF-48 (botao), RF-91 (grito ao abrir, som shiny), RF-117, RF-118, RF-121, RF-125, RNF-12, UISPEC 3.5, 3.6, 4 (Hero).
- **Steps**:
  1. `DetailScreen` recebe `params.dex`; `use-species-detail` chama `loadSpecies(dex)` (skeleton do hero enquanto carrega); ao montar (nao ao restaurar via Voltar), `historyStore.push(dex)` (RF-33) e, se som ligado, `playCry(detail.cry)` apos 350 ms (RF-91); se a especie tem `evolutionChain.edges.length > 0`, toca `evolution_notification` (`app.js:1253`) [ASSUMPTION: manter o comportamento do prototipo].
  2. `HeroCard` (porta `app.js:940-956`, `style.css:449-487`, COM a correcao de layout da regra "Sem sobreposicao de texto": no prototipo `.seal` e absoluto com `max-width: calc(100% - 76px)`, que reserva so o shiny, enquanto o `cry-btn` fica em `right: 62px` e ocupa ate 102 px da borda direita, causa do `feedback/1.png`; no app `.seal` reserva a largura dos botoes: `max-width: calc(100% - 124px)` com `cry-btn` (14 esq. + 102 dir. + 8 gap) e `calc(100% - 76px)` sem grito; o titulo NAO usa o `padding-top` fixo de `.hero-art.stacked/.stacked3` (40/64 px): a linha de selos fica em fluxo para que o titulo sempre comece abaixo dela, mesmo quando ela quebra em mais linhas): classes `.hero-card g-<tipo1>` + `.hero-legendary` se `labels` contem `legendary`, `.hero-mythical` se `mythical`; `.hero-art::before` circulo de 240% com `raysSlow 50s` (RNF-12); `.sheen` + 8 `.sparkles i` nos especiais (RF-118); `.seal` no canto superior ESQUERDO com [selo Lendario/Mitico] + [badge de raridade `rarity.primary`, omitido se `null`] (RF-121, RF-10: nunca `badge-nospawn`); `shiny-btn` no canto superior direito (RF-31) e `cry-btn` ao lado (RF-32, so se `cry != null`); titulo `#0006 Charizard`; imagem: `ArtworkImage` que tenta `official-artwork/<artworkId>[shiny]` (§5.2) com timeout 8 s e `onerror` -> `ArtworkPlaceholder` (RF-16); para `artworkId == null` (RF-09) mostra placeholder + `notice` "Esta espécie é do All the Mons: a imagem não vem da PokeAPI". Loading do artwork = `PokeballSpinner` sobreposto (RF-125). Shiny alterna a URL com animacao `artSwap` e som `shiny`.
  3. Faixa inferior: chips `lg` dos tipos + `btn-accent` "Capturei" com `<img class="ball-ico" src=pokeball>` (RF-48/RF-125; `done` se capturado, texto "Capturado" e clique = desmarcar com confirmacao em `Modal`, RF-50) + `btn-ghost` "Adicionar ao time"/"No time" (toggle; cheio -> toast RF-39).
- **Edge cases**: `dex` inexistente no dataset (link antigo/orfao) -> `EmptyState` "Espécie não encontrada nesta versão dos dados" + Voltar; rede lenta -> spinner ate 8 s, depois placeholder mas continua tentando em background uma vez; `labels` com `legendary` E `mythical` -> lendario prevalece [ASSUMPTION].
- **Consumes**: `SpeciesDetail` (`species/<dex>.json`), `DocMap.captured/team`, `playCry`, `SpeciesForm.artworkId`.
- **Done when**: `desktop-detail-charizard-full.png` (hero; tambem e a referencia do tema `classic` para a ficha, movida de F1.1), `desktop-detail-mewtwo-legendary-full.png` sem o badge "NAO NASCE NO MUNDO", `desktop-detail-mew-mythical-full.png`; teste: raios `::before` tem `width: 240%` e `border-radius: 50%`; e2e movido de F1.3 (primeira feature com Dex e ficha reais): "Dex com filtro Fogo + scroll > ficha > Voltar" restaura filtro e scroll (tolerancia 2 px, `expect.poll`, sem timers). Hero sem sobreposicao: `expectNoOverlap` no hero a 360 px, 390 px e 1280 px, em PT e EN, com o caso mais longo de selos (Lendario + raridade `ultra-rare`, e Mitico) e os botoes shiny/grito; nenhum selo cruza os botoes.
- **Commit**: `feat(detail): hero card with type/legendary/mythical gradients, seals, shiny, cry and actions`
- **Rollback**: revert.

#### Feature F4.2: Stats, fraquezas/resistencias e habilidades `[category: frontend]`
- **Traces**: RF-15 (stats, BST, fraquezas, habilidades), RF-17, RF-18, RF-24.
- **Steps**:
  1. `StatsPanel` (porta `statsBlock` `app.js:768-775`): 6 barras (`--w = min(100, v/2)%`, cores `--s-*`, delay `i*80ms`) + Total = BST (`--w = total/8`).
  2. `WeaknessPanel` (porta `weakGridHTML` `app.js:813-819`): `effectivenessAgainst(types)` (B6.1) agrupado em linhas x4, x2, x1/2, x1/4, x0; `SegmentedControl` Todos/Fraquezas/Resistencias em `current.ui.weakFilter` (RF-18) re-renderiza so a grade; `TermsToggle cardKey="weak"`.
  3. `AbilitiesPanel` (porta `abilitiesHTML` `app.js:851-856`): `abilities.json[id]` -> nome no idioma dos termos + `<small>` outro idioma + tag "Oculta" se `hidden` + descricao no idioma da UI.
- **Edge cases**: habilidade ausente em `abilities.json` -> mostra o id humanizado e `console.warn` (build deveria ter falhado); especie mono-tipo -> mesma funcao com 1 tipo.
- **Consumes**: `SpeciesDetail.baseStats/abilities/types`, `abilities.json`, `effectivenessAgainst` (B6.1).
- **Done when**: Charizard: Pedra x4, Agua x2, Eletrico x2, Fogo x1/2, Terra x0 (imune); `desktop-detail-charizard-resistances.png`.
- **Commit**: `feat(detail): base stats, weakness panel with selector and abilities`
- **Rollback**: revert.

#### Feature F4.3: Cadeia de evolucao clicavel `[category: frontend]`
- **Traces**: RF-19, RF-20, RF-71 (item de evolucao clicavel), RF-91 (som de evolucao ao visualizar).
- **Steps**:
  1. `EvolutionPanel` (porta `evoHTML` `app.js:839-850`, `style.css:530-564`): usa `SpeciesDetail.evolutionChain` (raiz + arestas); layout linear (`.evo-chain`) quando cada no tem <= 1 saida; ramificado (`.evo-branching`) quando um no tem > 1 saida (Eevee: 8 ramos).
  2. Cada aresta renderiza `MethodChip` a partir de `EvolutionEdge`: `item_interact` -> `<ItemTile item=requiredItem>` + nome do item (dataset `items.json`, idioma do card) clicavel (`navigate("item", {id})`); `level_up` com `requirements`: `level` -> "Nível {minLevel}"; `friendship` -> "Amizade {amount}"; `timeRange` -> "+ de dia/de noite"; `hasMoveType` -> "sabendo golpe de {Tipo}"; `heldItem` -> item; `trade` -> "Troca"; `other` -> texto generico "Condição especial" + tooltip com o `raw` (nunca inventar). Sem legenda generica (RF-19).
  3. Nos clicaveis -> `navigate("detail", {dex})`; ao abrir a cadeia de uma especie que evolui, som `evolution_ui` uma vez por montagem (RF-91) [ASSUMPTION: "ao visualizar uma evolucao" = ao renderizar a cadeia].
- **Edge cases**: especie sem evolucao -> "Não evolui"; no da cadeia ausente no dataset -> renderiza sem link.
- **Consumes**: `EvolutionChain`, `EvolutionEdge`, `ItemInfo` (nomes), `SpeciesForm` nao.
- **Done when**: Eevee mostra 8 ramos com metodos reais (Espeon = Amizade 160 + de dia; Sylveon = Amizade 160 + golpe de Fada; Jolteon = Pedra do Trovão clicavel); Charizard linear 16/36.
- **Commit**: `feat(detail): clickable evolution chain with exact Cobblemon methods`
- **Rollback**: revert.

#### Feature F4.4: Golpes com abas e descricao `[category: frontend]`
- **Traces**: RF-21, RF-22, RF-23, RF-04.
- **Steps**:
  1. `MovesPanel`: abas Nível/TM/Ovo/Tutor (`current.ui.moveTab`), `TermsToggle cardKey="moves"`; `MovesTable` (porta `movesTableHTML` `app.js:778-787`) renderiza `SpeciesDetail.moves[tab]` juntando `moves.json[id]`: colunas Nv./Golpe (nome no idioma do card + `<small>` outro)/Tipo (chip sm)/Categoria (`.cat-physical|special|status`)/Poder/Precisão/PP; linha com descricao expansivel (`.mv-row.has-desc`, `desc-wrap`), estado das linhas abertas em `current.ui.openMoveRows` (restaurado ao voltar, RF-02).
  2. Trocar aba re-renderiza apenas `MovesTable` (memo por `[dex, tab, termsLang]`); a tabela de "Nível" e ordenada por nivel asc.
- **Edge cases**: aba vazia (ex. sem golpes de tutor) -> `EmptyState` "Nenhum golpe nesta categoria"; golpe sem mecanica (`type == null`) -> "-" nas colunas e tooltip "Mecânica não disponível na PokeAPI".
- **Consumes**: `SpeciesDetail.moves`, `MoveInfo` (`moves.json`).
- **Done when**: `desktop-detail-charizard-moves-tm.png`; trocar aba mantem scroll da tela e nao remonta `DetailScreen`.
- **Commit**: `feat(detail): move tabs with mechanics, PP and official descriptions`
- **Rollback**: revert.

### Sprint F5: Ficha do Pokemon (parte 2: onde encontrar, como obter, formas, melhor bola, calculadoras)

- **Descricao**: completa a ficha com "Onde encontrar" (todas as entradas de spawn), raridade principal/secundaria, drops clicaveis, "Como obter" em camadas, abas de forma com item necessario, painel Melhor Pokebola com condicoes, calculadora de stats com recomendacao e calculadora de efetividade.
- **Deliverable**: `desktop-detail-charizard-full.png` (blocos inferiores), `desktop-detail-charizard-mega-x-form.png`, `desktop-balls-full.png` (painel Melhor Pokebola).
- **Risco**: medio.
- **Prerequisito**: F4, B4, B6.
- **Files**: criar `src/screens/detail/{WherePanel,SpawnEntryRow,ObtainPanel,FormsPanel,BestBallPanel,StatsCalculator,TypeCalculator}.tsx`, `src/styles/detail-extra.css` (`style.css:604-661`, `640-646`).

#### Feature F5.1: Onde encontrar, raridade, drops e Como obter `[category: frontend]`
- **Traces**: RF-10, RF-25, RF-26, RF-27, RF-71, RF-114, RF-115.
- **Steps**:
  1. `WherePanel` (porta `whereHTML` `app.js:857-869` mas SEM o ramo `noSpawn`): linha "Raridade": badge `rarity.primary` + badges secundarios menores `rarity.secondary`; se `primary == null`, a linha nao aparece (RF-10). Lista `SpawnEntryRow` para CADA `spawns[]` (RF-115): biomas (`biomes.json[tag]` no idioma do card, chips `.biome`; tags sem rotulo mostram o id humanizado), condicao de luz (`skyLight` -> "Luz do céu {min}-{max}"), horario (`timeRange` -> Dia/Noite/Qualquer com icones sun/moon/cloud), `canSeeSky` -> "Céu aberto"/"Coberto", estruturas (`structures`), contexto (`context`: "Terra/Submerso/Superfície/Pesca"), nivel (`level`), bucket da entrada, origem (`source` != cobblemon -> tag "Adicionado pelo pack"/nome do addon).
  2. Drops: lista com `ItemTile` clicavel + nome (idioma do card) + `%` ou `quantityRange` + barra (`.drop-bar`).
  3. `ObtainPanel` (porta `obtainHTML` `app.js:822-837`): renderiza `SpeciesDetail.obtain[]` na ordem recebida: `evolution` -> "Evolua {preNome} ({metodo})" + `ob-link` para a pre-evolucao; `fossil` -> "Reviva na máquina de fósseis" + `ItemTile` por item; `packSpawn` -> "Spawn adicionado pelo All the Mons" + resumo das entradas; `addon` -> `t("obtain.addon.<addon>")`; `breeding` -> "Breeding (pasture)" + grupos de ovo (RF-26 item 5); `none` -> `.ob-none` "Sem rota confirmada no All the Mons". Contagem de rotas de fossil nunca aparece como numero fixo; se a UI precisar citar, usa `counts.fossilRoutes` (RF-114).
- **Edge cases**: especie com 40+ entradas de spawn (Magikarp tem 46) -> lista colapsavel "Mostrar todas ({n})" apos 6; bioma tag custom `#legendary_spawns_ccc:jirachi` -> rotulo derivado "Bioma especial: Jirachi" (B2.9).
- **Consumes**: `SpeciesDetail.spawns/rarity/drops/obtain`, `biomes.json`, `ItemInfo`, `DatasetManifest.counts.fossilRoutes`.
- **Done when**: Eevee mostra 5 entradas com bucket principal Incomum e secundarios Raro/Ultra-raro; Mewtwo mostra em "Onde encontrar" o spawn ultra-raro do addon (cavernas/Deep Dark, nivel 70-75) e em "Como obter" Fóssil (Pika Star / Ancient DNA Sample) + "via" addon de lendarios, sem aviso generico; especie sem rota mostra `.ob-none`.
- **Commit**: `feat(detail): where-to-find entries, rarity buckets, drops and layered how-to-obtain`
- **Rollback**: revert.

#### Feature F5.2: Abas de forma com item necessario `[category: frontend]`
- **Traces**: RF-29, RF-30, RF-71.
- **Steps**:
  1. `FormsPanel` (porta `formBodyHTML` `app.js:788-797`): abas = ["Normal", ...`forms.map(f=>f.name)`] em `current.ui.formIndex`; corpo mostra artwork da forma (`form.artworkId` ou placeholder), tipos, "Requer:" `ItemTile` clicavel por `requiredItems` (+ `(source)` do addon) ou "Forma base, sem item"; habilidades e stats da forma (`baseStats` da forma ou da base se `null`).
  2. Sem `forms` -> painel oculto.
- **Edge cases**: forma `battleOnly` recebe tag "Só em batalha"; `requiredItems` vazio para Mega -> texto "Item não identificado nos dados do addon" (nunca inventar).
- **Consumes**: `SpeciesForm`, `ItemInfo`.
- **Done when**: `desktop-detail-charizard-mega-x-form.png`: Mega X exibe Charizardite X + Keystone clicaveis.
- **Commit**: `feat(detail): form tabs with activation items`
- **Rollback**: revert.

#### Feature F5.3: Melhor Pokebola na ficha `[category: frontend]`
- **Traces**: RF-64, RF-65, RF-71.
- **Steps**:
  1. `BestBallPanel` (porta `bestBallHTML` `app.js:1176-1180`): `rankBalls(detail, balls, { captured })` (B6.4) -> top 3 com `best-rank` 1/2/3 (1o dourado), `ItemTile` da bola clicavel (`navigate("item", {id: ball.itemId})`), nome (idioma do card), multiplicador "x{best}" e, para `conditional`, o texto da condicao `t("ball.cond.<condition>")` (ex. "3.5x com luz 0", RF-64); link "Ver todas" -> `go("balls")`. Bolas `guaranteed` listadas em linha separada "Captura garantida: Master Ball, Ancient Origin Ball".
  2. Bloco "Captura crítica": bonus por total de capturados conforme IDEA (0.5x a partir de 31, 1x 151, 1.5x 301, 2x 451, 2.5x > 600) [ASSUMPTION: manter o texto informativo do prototipo `app.js:1177`].
- **Edge cases**: especie sem contexto de pesca/agua -> Lure/Dive nao aparecem; genderless -> Love Ball nao aparece.
- **Consumes**: `rankBalls`, `BallInfo[]`, `DocMap.captured`.
- **Done when**: Magikarp: Net Ball (3x) acima da Poké Ball; Dusk Ball exibe "3.5x com luz 0".
- **Commit**: `feat(detail): best ball ranking with best-case conditions`
- **Rollback**: revert.

#### Feature F5.4: Calculadoras (stats e efetividade) `[category: frontend]`
- **Traces**: RF-34, RF-35, RF-110.
- **Steps**:
  1. `StatsCalculator` (porta `renderCalc` `app.js:1002-1008` + `<details class="calc">` `984-995`): inputs por stat: IV 0-31 (6 campos) e EV 0-252 (6 campos, soma <= 510 com validacao inline e clamp), nivel 1-100, natureza (`NATURES`, 25, nome pt/en com +/- indicados); saida = 6 stats no nivel escolhido e no nivel 100 (`calculateStats`, B6.2), `up/down` coloridos; bloco "Recomendação" = `recommendedInvestment(baseStats)` (B6.2): "IV 31 em {stat1} e {stat2}; EV 252/252/4 sugeridos" com botao "Aplicar" que preenche os inputs (nao substitui automaticamente, RF-110). Estado dos inputs e "aberto" em `current.ui.calcInputs/calcOpen` (RF-01).
  2. `TypeCalculator`: seletor de 1-2 tipos "meu Pokémon" (pre-preenchido com os tipos da ficha, editavel) -> grade dos 18 atacantes com multiplicador (x4, x2, x1, x1/2, x1/4, x0) via `effectivenessAgainst` (RF-34), independente da ficha.
- **Edge cases**: EV total > 510 -> campo em vermelho e resultado nao atualiza ate corrigir; IV/EV nao numericos -> 0; nivel fora de 1..100 -> clamp.
- **Consumes**: `calculateStats`, `NATURES`, `recommendedInvestment`, `effectivenessAgainst`.
- **Done when**: base 100/L100/IV31/EV252 neutro = 299, favoravel = 328, desfavoravel = 269; Charizard recomenda IV 31 em Sp. Atk (109) e Speed (100); Fogo/Agua vs Fogo = x1/4.
- **Commit**: `feat(detail): stats calculator with recommendation and type effectiveness calculator`
- **Rollback**: revert.

### Sprint F6: Captura (animacao) e lista de capturados

- **Descricao**: overlay de captura completo (linha do tempo do UISPEC 5) com fundos vetoriais por categoria, silhueta, flash, revelacao, sons e pulo; tela de capturados com contador "X de N" e filtros.
- **Deliverable**: sequencia `capture-outros-01..08`, `capture-legendario-01..03`, `capture-mitico-01..03`, `desktop-captured-list.png`, `mobile-captured.png`.
- **Risco**: medio (timing/som).
- **Prerequisito**: F4, B7.
- **Files**: criar `src/screens/capture/{CaptureOverlay,CaptureBackground,captureSvg.ts,useCaptureSequence.ts}`, `src/screens/captured/{CapturedScreen,CapturedTabs}.tsx`, `src/styles/capture.css` (`style.css:712-781`), `src/styles/captured.css` (`664-667`).

#### Feature F6.1: Animacao de captura `[category: frontend]`
- **Traces**: RF-48, RF-49, RF-51, RF-54, RF-91, RF-92, RF-125, RNF-02, UISPEC 3.5, 3.6, 5.
- **Steps**:
  1. `useCaptureSequence(dex)`: porta `startCapture` (`app.js:1278-1298`) com os tempos exatos: 0 `on`; 450 `s-bg`; 1000 `s-ball` + `poke_ball_throw_1`; 1700 `s-shake` + `poke_ball_shake_1`; 2150 `shake_2`; 2600 `shake_3`; 3200 `s-open` + `poke_ball_open`; 3550 `s-grow`; 5250 `s-flash` + `poke_ball_shake_critical`; 5450 `s-final` + `poke_ball_capture_succeeded`. Categoria de fundo por `labels`: `legendary` -> `bg-legendary`, `mythical` -> `bg-mythical`, senao `bg-default` (nunca por bucket). Mapeamento para as classes do prototipo/UISPEC: `bg-legendary` = `bg-lendario`, `bg-mythical` = `bg-mitico`, `bg-default` = `bg-outros` (os nomes das capturas `capture-legendario/mitico/outros-*.png` nao mudam).
  2. `CaptureBackground`: `LAYERS` (`cap-boost > cap-rays + cap-glow`, `cap-dots`) + SVG por categoria portado de `captureSvg.ts` (`bolt/spark/dot` `app.js:1268-1270`, `CAP_SVG` `1271-1275`); CSS `style.css:712-753` (raios 145vmax, `capBoost` no flash).
  3. Silhueta = `ArtworkImage` com `filter: brightness(0)` (`.cap-art`, `style.css:766`); se o artwork falhar/custom, usa a silhueta da pokebola (placeholder) para manter a sequencia.
  4. Toque/clique pula para `s-final` (`finishCapture`, RF-54); clique em `s-final` ou Esc fecha (`closeCapture`, som `pokedex_close`). `finishCapture` grava `capturedStore.add(dex, now)` (uma vez) e mostra nome + "Capturado!" + botao Fechar.
  5. Re-marcar apos desmarcar roda tudo de novo (RF-51). Com `reduce-motion`, o CSS zera as animacoes; a sequencia de timeouts e encurtada para 0/0/0 e vai direto ao `s-final` apos 300 ms [ASSUMPTION], sons mantidos.
- **Edge cases**: usuario navega (popstate) durante a captura -> overlay fecha e limpa timers; overlay ja aberto -> segundo clique ignorado; som desligado -> so a animacao (RF-49 "quando o som automatico estiver ligado").
- **Consumes**: `SpeciesDetail.labels/artworkId/name`, `DocMap.captured`, `playSfx`.
- **Done when**: capturas `capture-outros-01-start` ... `08-final-reveal`, `capture-legendario-*`, `capture-mitico-*`; teste (Vitest, fake timers do Vitest no hook, nao no Playwright): a timeline dispara os 7 sons na ordem `poke_ball_throw_1`, `poke_ball_shake_1`, `poke_ball_shake_2`, `poke_ball_shake_3`, `poke_ball_open`, `poke_ball_shake_critical`, `poke_ball_capture_succeeded`, e fechar o overlay toca o 8o, `pokedex_close` (spy).
- **Commit**: `feat(capture): full capture sequence overlay with vector backgrounds, sounds and skip`
- **Rollback**: revert.

#### Feature F6.2: Lista de capturados `[category: frontend]`
- **Traces**: RF-50, RF-52, RF-53, RF-55, RF-56, RF-123.
- **Steps**:
  1. `CapturedScreen` (porta `renderCaptured` `app.js:1013-1016`): cabecalho `.captured-summary` (pokebola `wobble`, "X de {counts.species}", barra), `CapturedTabs` (Todos capturados / Só faltando) em `current.ui.tab`; grade `DexGrid` reutilizada (virtualizada) com `PokemonCard showDate` ("Capturado em {data}", formato pt-BR `dd/mm/aaaa` ou en `yyyy-mm-dd`, `app.js:670`).
  2. Cada card tem botao "Desmarcar" (icone x, com `Modal` de confirmacao) -> `capturedStore.remove(dex)` (RF-50).
  3. `X` = `entries` filtrados por `filterKnown` (orfaos nao contam, RF-123); sem limite (RF-55).
- **Edge cases**: nenhum capturado -> `EmptyState` "Nenhum Pokémon capturado ainda" com link para a Dex; "Só faltando" com tudo capturado -> `EmptyState` "Você completou a Pontindex!".
- **Consumes**: `DocMap.captured`, `SpeciesSummary[]`, `DatasetManifest.counts.species`.
- **Done when**: `desktop-captured-list.png` com "X de 1.027" (formatado pelo `Intl.NumberFormat` do idioma); reload mantem a lista.
- **Commit**: `feat(captured): captured list with counter, filters and unmark`
- **Rollback**: revert.

### Sprint F7: Comparar

- **Descricao**: comparacao lado a lado de dois Pokemon com swap e troca de cada lado via busca.
- **Deliverable**: `desktop-compare.png`.
- **Risco**: baixo.
- **Prerequisito**: F2, F4.
- **Files**: criar `src/screens/compare/{CompareScreen,ComparePicker}.tsx`, `src/styles/compare.css` (`style.css:670-684`).

#### Feature F7.1: Comparar dois Pokemon `[category: frontend]`
- **Traces**: RF-36.
- **Steps**:
  1. `CompareScreen` (porta `renderCompare` `app.js:1018-1036`): `current.ui = { left: dex|null, right: dex|null }` (padrao: os 2 ultimos do historico, senao vazio); cada lado = card com artwork (placeholder em falha), `#dex`, nome, chips, botao "Trocar Pokémon" que abre `ComparePicker` (reusa `SearchBox`); linhas de stat espelhadas (`.bar.left` `scaleX(-1)`), maior valor em verde `.win`, Total; botao "Trocar lados" (`#cmp-swap`).
  2. Ambos os detalhes via `loadSpecies` (skeleton por lado).
- **Edge cases**: um lado vazio -> `EmptyState` "Escolha um Pokémon"; mesmo Pokemon dos dois lados -> permitido, sem `.win`.
- **Consumes**: `SpeciesDetail.baseStats/types`, `searchSpecies`.
- **Done when**: `desktop-compare.png`; swap inverte os lados sem perder scroll.
- **Commit**: `feat(compare): side-by-side comparison with swap`
- **Rollback**: revert.

### Sprint F8: Treinadores e level cap

- **Descricao**: tela por serie com picker (bloqueio por pre-requisito e Modo Livre), cap vigente, linha do tempo de treinadores-chave com time completo, item de spawn e mochila, checkbox derrotado com recalculo imediato.
- **Deliverable**: `desktop-trainers.png`, `desktop-trainers-expanded-full.png`.
- **Risco**: alto (regra do cap).
- **Prerequisito**: F1, B5, B6.3, B7.
- **Files**: criar `src/screens/trainers/{TrainersScreen,SeriesPicker,CapHeader,TrainerStep,TrainerTeam,TrainerMon}.tsx`, `src/state/trainer-progress-store.ts`, `src/styles/trainers.css` (`style.css` blocos `.tr-*`, `.role-*`, `.progress`).

#### Feature F8.1: Picker de series, serie ativa e Modo Livre `[category: frontend]`
- **Traces**: RF-57, RF-111, RF-124.
- **Steps**:
  1. `trainer-progress-store` hidrata `DocMap.trainerProgress`; `setActiveSeries(id)`, `enterFreeroam()` (guarda `pausedSeriesId = activeSeriesId`, `freeroam.active = true`), `leaveFreeroam()` (restaura), `markDefeated(seriesId, trainerId)`, `unmarkDefeated`.
  2. `SeriesPicker` (`chips-scroll` `.seg-chip`, `app.js:1124`): lista `series.json` + entrada especial "Modo Livre"; `isSeriesUnlocked(series, progress)` (B6.3): `requiredSeries` (AND entre sublistas, OR dentro) com "concluida" = todos os `keyTrainerIds` derrotados; bloqueada = chip com cadeado + "Requer: {titulo da serie pre-requisito}" (RF-111); Modo Livre bloqueado enquanto `freeroamRequiresCompletedSeries && nenhuma serie concluida` (config do `DatasetManifest.levelCapConfig`).
  3. Primeira abertura sem serie ativa -> `notice` "Escolha a série que você está acompanhando" e nenhum treinador listado ate escolher (RF-111).
- **Edge cases**: serie ativa salva nao existe mais no dataset -> volta a "nenhuma" com toast; progresso de series orfas permanece salvo.
- **Consumes**: `SeriesInfo[]`, `DatasetManifest.levelCapConfig`, `DocMap.trainerProgress`, `isSeriesUnlocked/isSeriesCompleted`.
- **Done when**: `atm_team` aparece bloqueada com "Requer: Diamante brilhante/Pérola reluzente" ate a BDSP ficar completa; Modo Livre bloqueado sem serie concluida; escolha persiste no reload.
- **Commit**: `feat(trainers): series picker with prerequisites, active series persistence and freeroam`
- **Rollback**: revert.

#### Feature F8.2: Linha do tempo, cap vigente e derrotados `[category: frontend]`
- **Traces**: RF-58, RF-59, RF-60, RF-61, RF-62, RF-71, RF-91 (level-up).
- **Steps**:
  1. `CapHeader` (porta `trHeaderHTML` `app.js:1087-1093`): "Seu cap atual" = `computeSeriesCap(...)` (B6.3), progresso "n de {keyTrainers.length} treinadores-chave derrotados", "Próximo: {nomes dos disponiveis}".
  2. Lista (porta `trStepHTML` `app.js:1105-1121`): somente treinadores-chave (`optional === false`) em ordem topologica por `requiredDefeats` (B5 pre-ordena; empate por `maxTeamLevel`, depois nome); estado `done` (derrotado), `next` (disponivel), bloqueado (pre-requisito pendente, com "Requer um de: ..." por sublista, RF-61); `tr-capchip` "Cap -> {trainerLevel}" ; checkbox `Derrotado` (RF-60) chama `markDefeated/unmarkDefeated`, `CapHeader` recalcula imediatamente e toca `levelup` se o cap subiu.
  3. Acordeao (`current.ui.openTrainerId`) com `TrainerTeam` (porta `trStepBodyHTML` `app.js:1094-1104`): por Pokemon sprite 96px + nome + Lv + chips + habilidade + golpes (`moves.json` nomes) + item segurado; "Item de spawn" = `ItemTile signatureItem` clicavel + `tr.spawnHow`; biomas (`biomes.json` whitelist); mochila com `ItemTile` x quantidade; tipo do treinador (`typeLabel`, badge `role-*`).
- **Edge cases**: treinador-chave com `team` vazio (dados) -> "Time não informado", `maxTeamLevel = 0`; `signatureItem == null` -> linha omitida; desmarcar um treinador do meio da cadeia -> treinadores dependentes continuam marcados mas ficam "bloqueados" visualmente e o cap desce (RF-60).
- **Consumes**: `TrainerInfo[]` (`trainers/<seriesId>.json`), `computeSeriesCap/computeTrainerLevel/isAvailable`, `MoveInfo`, `ItemInfo`, `biomes.json`.
- **Done when**: BDSP sem derrotados = cap 15; Roark derrotado = 16; Mars = 20; Jupiter = 22; apos Gardenia os 3 Cedric aparecem como "Próximo" e o cap exibido e 22; apos um Cedric o cap continua 22 (outros 2 Cedric pendentes); apos os 3 Cedric, Maylene = 30; `desktop-trainers-expanded-full.png`.
- **Commit**: `feat(trainers): key trainer timeline with live level cap and defeat tracking`
- **Rollback**: revert.

### Sprint F9: Pokebolas, Itens e pagina de item

- **Descricao**: grade de todas as bolas do dataset (`balls.json.length`, 48 hoje) com filtros, grade de itens por categoria com busca PT/EN, pagina individual de item com Como obter e Usado em; todo item citado em qualquer lugar abre esta pagina.
- **Deliverable**: `desktop-balls-full.png`, `desktop-items-grid.png`, `desktop-item-page-full.png`.
- **Risco**: baixo.
- **Prerequisito**: F1, B4.
- **Files**: criar `src/screens/balls/{BallsScreen,BallCard}.tsx`, `src/screens/items/{ItemsScreen,ItemCard,ItemSearch}.tsx`, `src/screens/item/{ItemScreen,ItemHero,ItemObtain,ItemUsedIn}.tsx`, `src/styles/items.css` (`style.css:902-969`, `.ball-*`, `.item-*`, `.mon-chip 957-961`).

#### Feature F9.1: Grade de Pokebolas `[category: frontend]`
- **Traces**: RF-63, RF-65.
- **Steps**: `BallsScreen` (porta `renderBalls/ballGridHTML` `app.js:1155-1162`): `SegmentedControl` de tags (Todas/Noite/Água/Pesca/1º turno/Já capturado/Após capturar) em `current.ui.filter`; `BallCard` com textura (`ItemTile`), nome (idioma do card) + `<small>`, multiplicador resumido (`flat` -> "x1.5"; `conditional` -> "x{worst} a x{best}"; `guaranteed` -> "Garantida"), efeito oficial (`effect` no idioma da UI); clique -> `navigate("item", {id: itemId})`.
- **Edge cases**: filtro sem bolas -> `EmptyState`.
- **Consumes**: `BallInfo[]`.
- **Done when**: `desktop-balls-full.png`; `balls.json.length` cards com filtro "Todas" (48 no dataset atual; nunca um numero fixo no codigo).
- **Commit**: `feat(balls): poke ball grid with official effects and filters`
- **Rollback**: revert.

#### Feature F9.2: Grade de itens com busca PT/EN `[category: frontend]`
- **Traces**: RF-66, RF-67, RF-71.
- **Steps**: `ItemsScreen` (porta `renderItems/itemGridHTML` `app.js:1185-1200`): abas de categoria (`ItemCategory` ordenadas: medicine, vitamin, ivCandy, expCandy, evolution, held, battle, mint, cooking, berry, bait, ball, fossil, other) em `current.ui.category`; `ItemSearch` (`#item-q`) normaliza NFD e busca em `name.pt + " " + name.en` de TODOS os itens ignorando a categoria quando ha texto (RF-67, `app.js:1186-1189`); `ItemCard` com `ItemTile lg cat-<categoria>` e, ao lado, um bloco vertical na ordem: tag da categoria (em linha PROPRIA, ACIMA do nome), nome, nome alternativo; a seta de expandir fica a direita e nada mais divide a linha com o nome (decisao do Pontin 2026-09-24, `feedback/2.png`: no prototipo `.item-head` e uma linha unica tile | nomes | tag `flex: none` | seta, `style.css:1102` e `1110`, e a tag espremia e atravessava o nome; NAO portar esse layout). Nome com `min-width: 0` e quebra so por palavra quando realmente nao cabe; descricao (idioma da UI), expansivel; clique no cabecalho -> `navigate("item")`. Lista virtualizada se > 150 itens visiveis [ASSUMPTION].
- **Edge cases**: item sem textura -> icone Lucide por categoria (`app.js:1149-1151`); busca sem resultado -> `EmptyState item.none`.
- **Consumes**: `ItemInfo` (`items.json`).
- **Done when**: `desktop-items-grid.png` (referencia vale para grade, cores, icones e abas; o cabecalho do `.item-card` e MASCARADO na comparacao, porque o layout mudou: tag acima do nome, ver UISPEC nota de 2026-09-24); buscar "pocao" acha "Poção/Potion" com card em EN. Card de item: tag da categoria acima do nome; `expectNoOverlap` na grade de itens a 360 px, 390 px e 1280 px, PT e EN, incluindo nomes longos (ex. "Choice Scarf", "Leftovers"), sem o nome quebrar por falta de espaco causada pela tag.
- **Commit**: `feat(items): categorized item grid with bilingual accent-insensitive search`
- **Rollback**: revert.

#### Feature F9.3: Pagina do item `[category: frontend]`
- **Traces**: RF-68, RF-69, RF-70, RF-71, RF-65.
- **Steps**: `ItemScreen` (porta `itemPageBodyHTML` `app.js:883-912`): `ItemHero` (textura pixelada 112 px `image-rendering: pixelated`, badge da categoria, nome + alternativo, descricao oficial ou "Sem descrição oficial neste item", `TermsToggle cardKey="itempage"`); `ItemObtain` renderiza `ItemInfo.obtain[]`: `craftable` -> "Sim, tem receita ({tipos})" (nunca a receita, RF-68); `drop` -> `mon-chip` por especie com `%`; `plantable` -> biomas (`biomes.json`); `structureLoot` -> chips com nomes das tabelas humanizados; `fishing` -> "Pode vir na vara de pescar"; `fossilRevive` -> chips das especies; `none` -> `.ob-none` (RF-69). `ItemUsedIn` (RF-70): evolucoes (`mon-chip` from -> to), fosseis, formas (`{dex, form}`), bola (multiplicador + efeito, `usedIn.ball`). Cozinha: se `cooking.effectNote === "pending"` mostra `notice` "Efeito numérico ainda não confirmado; descrição oficial acima".
- **Edge cases**: `id` desconhecido (ex. `minecraft:gunpowder` citado em drops do Creepyon mas fora do lang do Cobblemon) -> pagina minima com id humanizado, sem textura, "Item de outro mod"; Voltar restaura a origem exata (F1.3).
- **Consumes**: `ItemInfo`, `SpeciesSummary` (nomes dos chips), `biomes.json`.
- **Done when**: e2e movido de F1.3 (criterio de aceite, primeira feature em que a pagina de item existe): "Charizard > Golpes TM > scroll > item > Voltar" restaura aba, scroll (tolerancia 2 px) e linhas abertas (Playwright `headless: true`, sem `slowMo`, `expect.poll`); `desktop-item-page-full.png` (Poção); Fire Stone lista "Usado em: Eevee -> Flareon, Vulpix -> Ninetales, Growlithe -> Arcanine"; item sem rota mostra "Sem rota confirmada".
- **Commit**: `feat(item): item page with honest obtain routes and used-in section`
- **Rollback**: revert.

### Sprint F10: Configuracoes, backup, apagar dados e Sobre

- **Descricao**: tela de configuracoes completa: temas, idioma da interface, idioma dos termos, som, reduzir animacoes, instalar app (PWA), Sobre (versao do app e do dataset, armazenamento persistente), Exportar/Importar backup, Apagar dados por entidade ou tudo com confirmacao, restaurar snapshot pre-migracao.
- **Deliverable**: `desktop-settings-full.png`, `mobile-settings.png` (+ blocos novos seguindo o mesmo padrao `.card`/`.card-info`).
- **Risco**: medio (acoes destrutivas).
- **Prerequisito**: F1, B7.
- **Files**: criar `src/screens/settings/{SettingsScreen,ThemeGrid,LanguageCard,TermsCard,SoundCard,MotionCard,InstallCard,AboutCard,BackupCard,DeleteDataCard,RestoreSnapshotCard}.tsx`, `src/styles/settings.css` (`style.css:690-709`), token `--danger` em `tokens.css` (UISPEC 8.3).

#### Feature F10.1: Preferencias visuais e de som `[category: frontend]`
- **Traces**: RF-79, RF-81, RF-82, RF-83, RF-84, RF-86, RF-88, RF-89, RF-90, RF-92, RF-93, RF-94, RF-103, RF-104.
- **Steps**: `ThemeGrid` (porta `renderThemes` `app.js:1042-1045`; 7 `theme-sw` na ordem de `THEME_IDS` (`src/styles/themes.ts`) com `--p1/--p2` de `THEMES` em `src/styles/theme-meta.ts`, F1.1); `LanguageCard` (`seg` PT/EN -> `setUiLanguage`); `TermsCard` (porta `renderTermsSetting` `app.js:1038-1041`: padrao PT/EN; mudar o padrao limpa overrides como `app.js:1343`); `SoundCard` (switch); `MotionCard` (switch com 3o estado "Seguir o sistema"); `InstallCard` (botao "Instalar app" usando o `beforeinstallprompt` guardado; oculto se ja instalado/`standalone`); `AboutCard`: "Pontindex v{appVersion}", "Dados: All the Mons {pack.version} / Cobblemon {cobblemonVersion}" (RF-104), `datasetVersion`, contagens (`counts.species`, `counts.fossilRoutes`, `counts.trainers`) e "Armazenamento persistente: {sim/nao}". Todas as mudancas gravam em `preferences` imediatamente.
- **Edge cases**: `beforeinstallprompt` nunca disparado (Safari/iOS fora do escopo, Firefox) -> card mostra instrucao textual "Use 'Adicionar à tela inicial' do navegador".
- **Consumes**: `DocMap.preferences`, `DatasetManifest`.
- **Done when**: `desktop-settings-full.png` (inclui o bloco de idioma/termos, comparacao movida de F1.2); criterio "Preto + Inglês + som off + reduzir on" persiste apos reload.
- **Commit**: `feat(settings): theme, language, terms, sound, motion, install and about cards`
- **Rollback**: revert.

#### Feature F10.2: Backup, apagar dados e restaurar snapshot `[category: frontend]`
- **Traces**: RF-97, RF-98, RF-122, RF-96 (rollback), RNF-06.
- **Steps**:
  1. `BackupCard`: "Exportar backup" -> `storage.exportSnapshot()` -> download `pontindex-backup-<yyyy-mm-dd>.json`; "Importar backup" -> `<input type=file accept=.json>` -> `parseBackup` (B7.3) -> `Modal` com resumo + Mesclar/Substituir (mesmo `SyncSummary` de F11) -> `importSnapshot`/`applyMerge`; erros conforme §5c.
  2. `DeleteDataCard` (RF-122): checkboxes Histórico / Time / Capturados / Treinadores / Preferências / Tudo; botao `btn-danger` (novo token `--danger: #C62828`) abre `Modal` "Isto vai apagar: {lista} ({n} registros). Esta ação não pode ser desfeita." com botao "Apagar" que exige digitar "APAGAR" quando "Tudo" esta marcado [ASSUMPTION]; executa `storage.delete(keys)` (uma transacao) e reidrata stores; "Tudo" tambem limpa `backups`.
  3. `RestoreSnapshotCard`: lista `backups` pre-migracao (`id`, data, versao) com "Restaurar" (Modal de confirmacao) -> §5b.3 DOWN.
- **Edge cases**: arquivo de backup de versao mais nova -> `unsupportedVersion`; nada selecionado -> botao desabilitado; falha de storage durante apagar -> toast e nada parcial (transacao).
- **Consumes**: `StorageAdapter.exportSnapshot/importSnapshot/delete`, `BackupFile`, `mergeDocuments`.
- **Done when**: round-trip exportar -> instalacao limpa -> importar = 5 entidades identicas (teste e2e com dois contextos de navegador); apagar so historico mantem as outras 4.
- **Commit**: `feat(settings): backup export/import, delete data with confirmation and snapshot restore`
- **Rollback**: revert.

### Sprint F11: Sincronizar entre dispositivos

- **Descricao**: tela nova (sem prototipo, UISPEC 8.1): explicacao, Gerar codigo (QR single/multi-frame + texto copiavel + baixar `.pdx`), Receber codigo (camera, colar, arquivo) com progresso de frames, resumo e Mesclar/Substituir.
- **Deliverable**: tela construida com `.card`, `.notice-info`, `.btn-primary/ghost`, `.seg`, `.item-hero-tile` (QR), `.card-info/.info-line` (resumo), conforme UISPEC 8.1; no mobile e uma tela cheia acessivel pelo sheet "Mais".
- **Risco**: medio (camera).
- **Prerequisito**: F1, F10 (Modal/resumo), B7.
- **Files**: criar `src/screens/sync/{SyncScreen,SyncExplainer,GenerateCodePanel,QrFrames,ReceiveCodePanel,CameraScanner,SyncSummary}.tsx`, `src/styles/sync.css`.

#### Feature F11.1: Gerar codigo `[category: frontend]`
- **Traces**: RF-72, RF-73, RF-112, RF-113, RNF-11.
- **Steps**:
  1. `SyncScreen`: `SyncExplainer` (`notice-info` com 3 paragrafos: e manual, e uma foto do momento, nada sai do aparelho) + `seg` "Gerar código | Receber código" em `current.ui.mode`.
  2. `GenerateCodePanel`: botao "Gerar código" -> `encodeSyncCode(await storage.readAll())` (B7.2, chunk lazy com `fflate`/`qrcode`) -> mostra `QrFrames` (canvas 280 px; single ou carrossel automatico 1,5 s com setas e "Frame i de n"), textarea somente-leitura com o texto + "Copiar" (`navigator.clipboard`, fallback selecionar) + "Baixar arquivo .pdx" + resumo do que esta no codigo (contagens) + carimbo de data/hora.
- **Edge cases**: dados vazios -> codigo minimo ainda e gerado (aviso "Nada para sincronizar ainda"); clipboard indisponivel -> instrucao para copiar manualmente; payload > 64 KB (impossivel na pratica) -> erro `oversized`.
- **Consumes**: `encodeSyncCode`, `StorageAdapter.readAll`.
- **Done when**: com 1027 capturados + tudo, gera n frames (n >= 2) e o texto completo; com 20 capturados gera 1 QR; nenhuma requisicao de rede durante a acao (teste Playwright intercepta `**/*` e falha se houver).
- **Commit**: `feat(sync): generate sync code as single/multi-frame QR, text and file`
- **Rollback**: revert.

#### Feature F11.2: Receber codigo, resumo e mesclar/substituir `[category: frontend]`
- **Traces**: RF-74, RF-75, RF-76, RF-77, RF-78, RF-113.
- **Steps**:
  1. `ReceiveCodePanel`: tres entradas: `CameraScanner` (`@zxing/browser`, lazy; pede permissao ao clicar "Abrir câmera"; le continuamente; cada frame lido vai para `frameCollector`; mostra "Faltam N frames (i/n lidos)"), textarea "Colar código" + botao "Receber", input de arquivo `.pdx/.txt`.
  2. `decodeSyncCode` (B7.2) -> em erro, `InlineError` com a mensagem da matriz §5c e NENHUMA escrita; em sucesso, `SyncSummary` (`card-info`: capturados, time, historico, treinadores por serie, preferencias, data, ids desconhecidos) + previa "Depois de mesclar você terá: X capturados" + `seg` Mesclar (padrao) / Substituir + botao "Aplicar" -> `mergeDocuments(local, incoming, mode)` (B7.2) -> `storage.writeMany(result)` (uma transacao) -> reidrata todas as stores -> toast "Sincronizado" e volta ao modo inicial.
  3. Texto fixo lembrando que serve so para os proprios dispositivos (RF-77).
- **Edge cases**: camera negada -> painel "Câmera indisponível" e foco no textarea; frames de outra sessao -> aviso; usuario cola o texto de um frame isolado (`PDXF...`) -> tratado como frame (entra no coletor) em vez de erro.
- **Consumes**: `decodeSyncCode`, `mergeDocuments`, `StorageAdapter.writeMany`, `SyncError` (§5c).
- **Done when**: criterio de aceite dos dois dispositivos (A/B) reproduzido em teste unitario de `mergeDocuments` e em e2e com dois contextos; codigo corrompido -> erro e IndexedDB identico (snapshot antes/depois).
- **Commit**: `feat(sync): receive code via camera, paste or file with summary and merge/replace`
- **Rollback**: revert.

### Sprint F12: PWA, offline e responsividade final

- **Descricao**: manifest com icones da pokebola, precache/runtime cache conforme §2.5, tela de "atualizacao disponivel", verificacao 360/390 px e limpeza de console.
- **Deliverable**: Lighthouse PWA instalavel; app abre sem rede apos 1a visita (dados ja vistos).
- **Risco**: baixo.
- **Prerequisito**: F1-F11, B1.
- **Files**: modifica `vite.config.ts` (bloco `VitePWA`), cria `src/pwa/UpdatePrompt.tsx`, `src/styles/responsive-fixes.css`; usa `public/icons/*` (nao recriar, gerados em B1.4).

#### Feature F12.1: PWA instalavel e cache `[category: frontend]`
- **Traces**: RF-103, RF-102 (cache de artwork), RNF-03, RNF-04, RNF-09.
- **Steps**: `VitePWA({ registerType: "prompt", manifest: { name: "Pontindex", short_name: "Pontindex", theme_color: "#DC0A2D", background_color: "#B0CDF3", display: "standalone", icons: 192/512/maskable }, workbox: { globPatterns: app shell + `data/<ver>/{dataset-manifest,species-index,type-chart}.json` + `assets/sfx/*.ogg`, runtimeCaching: [artwork PokeAPI CacheFirst 600/30d, `/data/` CacheFirst, `/assets/cries/` CacheFirst 300, `/assets/sprites/` CacheFirst 1100, `/assets/items/` CacheFirst 1200] })`; `UpdatePrompt` (toast "Nova versão disponível: Atualizar"); teste manual 360/390 px em todas as telas com chips/badges (RNF-09).
- **Edge cases**: SW falha ao registrar (http sem TLS local) -> app funciona sem cache; quota do cache cheia -> Workbox expira por LRU.
- **Consumes**: `DatasetManifest.datasetVersion` (caminho dos dados).
- **Done when**: `navigator.serviceWorker.controller` presente no 2o load; recarregar offline (Playwright `context.setOffline(true)`) mantem Home, Dex e uma ficha ja aberta.
- **Commit**: `feat(pwa): installable manifest, precache and runtime caching strategy`
- **Rollback**: revert (remover SW: `registerType` + `self.skipWaiting` com `clientsClaim` e um deploy que desregistra).



## Fase 2 (futura, nao executar na Fase 1)

Os sprints P1-P3 sao obrigatorios (RF-105 a RF-109, `[MUST - Fase 2]`) mas so comecam depois que o site da Fase 1 estiver finalizado e aprovado. Ficam aqui para que a Fase 1 nao tome decisoes que os inviabilizem (interface `StorageAdapter`, `platform/`, `dist/` unico).

### Sprint P1: Electron (Windows .exe) `[Fase 2]`
- **Descricao**: empacota o mesmo `dist/` como app desktop com storage em arquivo.
- **Deliverable**: `pontindex-setup-<versao>.exe` (NSIS) que instala, abre o app e preserva os dados entre reinstalacoes.
- **Risco**: medio.
- **Prerequisito**: Fase 1 completa (F12, T1).
- **Files** (criar): `phase2/electron/main.ts`, `phase2/electron/preload.ts`, `phase2/electron/electron-builder.yml`, `src/storage/file-storage-adapter.ts` (usa IPC exposto pelo preload), `src/platform/electron.ts`.
- **Feature P1.1: Empacotamento e FileStorageAdapter** `[category: build]` - Traces RF-105, RF-107, RF-95, RF-99. Steps: `main.ts` cria `BrowserWindow` carregando `dist/index.html` (protocolo `app://` custom para o SW funcionar ou desabilita o SW no Electron); `preload.ts` expõe `storage.read/write/delete` via `contextBridge` (sem `nodeIntegration`); `FileStorageAdapter` grava `<userData>/pontindex/<doc>.json` com `write tmp -> fsync -> rename` (RF-99) e `meta.json`; migracoes e backups identicos (`StorageAdapter` unica); `electron-builder` NSIS `perMachine: false`, `deleteAppDataOnUninstall: false` (RF-107). `platform/electron.ts`: `isNative = true` (esconde "Baixar app", RF-109). Edge cases: pasta `userData` sem permissao -> dialogo nativo; arquivo `.tmp` orfao de crash -> ignorado/removido no boot; app antigo lendo esquema novo -> somente leitura. Done when: instalar v1, criar dados, instalar v2 por cima, dados intactos (teste manual obrigatorio do PRD). Commit: `feat(electron): windows packaging with file-based storage adapter`. Rollback: nao publicar o instalador.

### Sprint P2: Capacitor 8 (Android .apk) `[Fase 2]`
- **Descricao**: mesmo `dist/` como app Android com storage no armazenamento interno.
- **Deliverable**: `pontindex-<versao>.apk` assinado, instalavel fora da Play Store.
- **Risco**: medio (ambiente: SDK 36 e ANDROID_HOME ja instalados, sem Android Studio).
- **Prerequisito**: P1 (adapter de arquivo) ou Fase 1.
- **Files** (criar): `phase2/capacitor/capacitor.config.ts`, `phase2/capacitor/android/` (gerado por `npx cap add android`), `src/storage/capacitor-storage-adapter.ts` (`@capacitor/filesystem`, `Directory.Data`), `src/platform/capacitor.ts`, `src/navigation/android-back.ts` (`App.addListener("backButton")` -> `goBack`).
- **Feature P2.1: Projeto Android e adapter** `[category: build]` - Traces RF-106, RF-107, RF-02 (botao fisico). Steps: `capacitor.config.ts` `{ appId: "com.pontin.pontindex", webDir: "dist", android: { allowMixedContent: false } }`; `CapacitorStorageAdapter` com `Filesystem.writeFile` em `.tmp` + `rename` (RF-99); `android-back.ts` liga o botao fisico a `goBack` (RF-02); build `./gradlew assembleRelease` com keystore (nomes de env: `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD`; valores nunca no repo). Edge cases: permissao de camera declarada no `AndroidManifest` para o scanner; `Directory.Data` sobrevive a atualizacao por APK (RF-107). Done when: instalar APK v1, dados, instalar v2, dados intactos. Commit: `feat(android): capacitor project with data-directory storage adapter and hardware back`. Rollback: nao distribuir o APK.

### Sprint P3: Atualizador automatico e botao "Baixar app" `[Fase 2]`
- **Descricao**: CI que, a cada push em `main`, publica o site (Vercel) e gera instaladores como release do GitHub; botao "Baixar app" so no site.
- **Deliverable**: `.github/workflows/release.yml` gerando `.exe` e `.apk` como assets de release; site exibe "Baixar app" com 2 opcoes.
- **Risco**: baixo.
- **Prerequisito**: P1, P2.
- **Files** (criar): `.github/workflows/release.yml`, `src/components/DownloadAppButton.tsx`, `src/screens/settings/DownloadCard.tsx`, `public/downloads.json` (gerado pelo CI: `{ windows: url, android: url, version }`).
- **Feature P3.1: Pipeline e botao** `[category: integracao]` - Traces RF-108, RF-109. Steps: workflow com jobs `web` (build + `vercel deploy --prod` via `VERCEL_TOKEN`, nome de secret), `windows` (electron-builder em runner windows), `android` (gradle em runner ubuntu com secrets do keystore), `release` (cria release `v<versao>` e publica `downloads.json`); `DownloadAppButton` aparece na sidebar/topbar e em Configuracoes somente quando `platform.isNative === false` E `downloads.json` responde com URLs (RF-109: escondido ate os apps existirem); dropdown com "Android (.apk)" e "Windows (.exe)" no padrao `.search-dd` (UISPEC 8.2); apps nativos: `UpdatePrompt` aponta para a release (Electron via `electron-updater` [ASSUMPTION], Android via link do APK). Edge cases: `downloads.json` 404 -> botao oculto; secret ausente -> job falha sem publicar. Done when: push -> site atualizado e release com 2 assets. Commit: `feat(release): github actions building site, windows and android artifacts with download button`. Rollback: desabilitar o workflow; botao some sem `downloads.json`.

---

### Sprint T1: Testes (definidos, nao escritos aqui; cobre a Fase 1)

Framework [ASSUMPTION]: **Vitest** (+ `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `fake-indexeddb`) para unit/componente; **Playwright** (`@playwright/test`) para e2e/smoke com `headless: true`, SEM `slowMo` e SEM timers/esperas artificiais (`page.waitForTimeout` e sleeps proibidos; sincronizar pelo auto-waiting dos locators, `expect(...).toBeVisible()`, `expect.poll` e `toPass`), regra do usuario de 2026-09-24 para este projeto (substitui a preferencia global de janela visivel/`slowMo`). Comandos: `npm test` (unit, CI), `npm run test:e2e` (contra `npm run preview`, com dataset real gerado ou fixture reduzida em `tests/fixtures/dataset-mini/`).

Metas de cobertura (Vitest `coverage.thresholds`): `src/domain` 95% linhas/branches; `src/storage` e `src/sync` 90%; `tools/dataset` 80% (com fixtures de jars sinteticos em uma pasta por parte: `tests/fixtures/{source,species-merge,species,pokeapi-media,trainers-balls,join}/`, cada uma de um unico agente, secao 6); `src/components` e `src/screens` 70%; global 80%.

Mocks: `fetch` (dataset e artwork) via `msw` ou stub por teste; `Audio` (spy em `play`); `matchMedia`; `navigator.mediaDevices.getUserMedia` (video fake) + injecao direta de texto de frame no `FrameCollector`; `navigator.clipboard`; `indexedDB` = `fake-indexeddb/auto`; PokeAPI no pipeline = servidor fake local com fixtures (`tackle`, `move?limit`, `pokemon-species/6`) e modo de falha (503 x2).

| Arquivo (criar) | Cenarios (felizes + tristes) |
|---|---|
| `tests/unit/domain/type-chart.test.ts` | Charizard vs rock=4, water=2, ground=0, fire=0.5; Fogo/Agua vs fire=0.25; mono-tipo (a igualdade com `type-chart.json` fica em `tests/unit/dataset/join.test.ts`, B2.5). |
| `tests/unit/domain/stats.test.ts` | 299/328/269/404; IV 32 -> RangeError; EV soma 511 -> erro; nivel 0 -> erro; recomendacao Charizard `[specialAttack, speed]`, Mew canonica. |
| `tests/unit/domain/level-cap.test.ts` | BDSP 15/16/20/22/22 (um Cedric)/30 (3 Cedric)/100 (fixtures reais); AND/OR; desmarcar Roark com Mars marcado -> 15; `none` -> 15; freeroam -> 100; ciclo -> nao trava; serie sem chave. |
| `tests/unit/domain/ball-ranking.test.ts` | Magikarp: ranking completo de B6.4 passo 4 (Love 8x, Quick 5x, 4x Dream/Level/Lure/Moon/Nest/Timer, ..., Net 3x acima da Poke 1x, Fast e Repeat ausentes, Master/Origin separadas); Charizard (Fast 4x incondicional antes das 4x condicionais; Heavy 1x incondicional entre Heal e Luxury); peso 3500 hg -> Heavy 4x; peso 0 -> Heavy 1x; genderless sem Love; capturado -> Repeat 3.5x; custom sem spawns; sem label `ultra_beast` -> Beast 0.1x no fim. |
| `tests/unit/domain/search.test.ts` | "25"/"025"/"0025"/"#25"; "pantano" -> quagsire; "charizar"; "9902"; vazio; "0"; caracteres regex. |
| `tests/unit/domain/history-team.test.ts` | 21o item; duplicado ao topo; 7o no time; remover; slots invalidos normalizados. |
| `tests/unit/storage/indexeddb-adapter.test.ts` | round-trip 6 docs; escrita atomica sob `QuotaExceededError`; doc corrompido -> backup + padrao; idempotencia; fila de escrita; `BLOCKED`. |
| `tests/unit/storage/migrations.test.ts` | 0->1 importa localStorage do prototipo; snapshot criado; restore reverte; esquema maior -> readOnly. |
| `tests/unit/storage/backup.test.ts` | export/import identicos; crc errado -> corrupted; `app` errado -> foreignApp; oversized. |
| `tests/unit/sync/codec.test.ts` | round-trip aleatorio; caso maximo multi-frame; CRC -> corrupted; magic -> foreignApp; versao 9 -> unsupportedVersion; texto com quebras de linha; frames fora de ordem/repetidos/sessao diferente; bits alem de maxDex -> orfaos. |
| `tests/unit/sync/merge.test.ts` | exemplo A/B do PRD; time nao vazio mantido; historico 20 mais recentes; prefs do receptor; replace. |
| `tests/unit/data/loaders.test.ts` | cache hit; retry 2x; JSON invalido; `current.json` ausente. |
| `tests/unit/build/{type-css,contracts}.test.ts` (Onda 0, B1.4/B1.5) | CSS de tipos gerado (18 blocos, snapshot); `THEME_IDS` (7, `classic` primeiro); `heavyBallMultiplier` 905/1001/3500; `normalizeSearch("Pântano")`. |
| `tests/unit/dataset/source.test.ts` (Onda 0, B2.1; fixtures `tests/fixtures/source/`) | fonte ausente -> `E_INSTANCE_NOT_FOUND`; deteccao de modo por `stat` (so diretorios -> snapshot, so zips -> instancia, misto -> `E_SOURCE_MODE_UNKNOWN`, `MANIFEST.json` nunca decide o modo); versoes lidas de `META-INF/neoforge.mods.toml` (`1.7.3` / `1.21.1`); jar faltando; escrita atomica (crash simulado deixa `out/` e nao `public/data`). |
| `tests/unit/dataset/species-merge.test.ts` (Onda 0, B2.2; fixtures `tests/fixtures/species-merge/`) | merge precedencia (charizard base x mega); `species_additions` (Mareep/sinew, `amount` descartado); Quagsire "Pântano"; `searchKey` via `normalizeSearch`. |
| `tests/unit/dataset/species.test.ts` (Onda 1, agente Especies, B2.3/B2.4; fixtures `tests/fixtures/species/`) | spawns/rarity (Eevee uncommon + [rare, ultra-rare]); fossils 16; obtain: Mewtwo fossil + addon ccc (rarity ultra-rare), Aerodactyl fossil+breeding, Charizard evolution+breeding, undiscovered sem breeding, sem rota -> none; evolutions Eevee 8 ramos; forms + mega items. |
| `tests/unit/dataset/pokeapi-media.test.ts` (Onda 1, agente PokeAPI e midia, B3.1/B3.2/B3.4; fixtures `tests/fixtures/pokeapi-media/`) | moves com alias e com falha (503x2, 404); cache hit; abilities 310; sfx = `SFX_NAMES` (20); gritos e texturas. |
| `tests/unit/dataset/trainers-balls.test.ts` (Onda 1, agente Treinadores e bolas, B4.3/B5.1/B5.2; fixtures `tests/fixtures/trainers-balls/`) | balls = numero de texturas em poke_balls (48 hoje) e regras; trainers Roark/Cedric/Maylene; series/order; toml ausente. |
| `tests/unit/dataset/join.test.ts` (Onda 2, B3.3/B4.1/B4.2/B2.5; fixtures `tests/fixtures/join/`) | sprites e `artworkId` Mega-X; itens/rotas/usado-em (fire_stone, sinew); `schemas.ts` valida as fichas; `type-chart.json` igual a `TYPE_CHART`; teto de midia; paridade snapshot x instancia real so se `ATM_INSTANCE_DIR` apontar para uma (senao `skip`). |
| `tests/unit/ui-foundation/*.test.ts(x)` + `tests/harness/foundation.spec.ts` (Onda 1b, F1.1-F1.3; harness `tests/harness/`) | tokens dos 7 temas por `getComputedStyle`; dicionario i18n completo; pilha de navegacao com telas ficticias e gancho de som. |
| `tests/unit/components/*.test.tsx` | `TypeChip` capitaliza; `TermsToggle` override; `PokemonCard` placeholder custom; `ArtworkImage` onerror -> placeholder; `WeaknessPanel` seletor; `MovesTable` aba vazia; `SearchBox` vazio; `Modal` confirmacao; `Toast` erro de storage persistente; snapshot pt/en sem literais. |
| `tests/e2e/navigation.spec.ts` | criterio Charizard > TM > scroll > item > Voltar; Dex filtro + scroll > ficha > Voltar; Alt+Left; profundidade Pokemon > item > Pokemon > item. |
| `tests/e2e/search-detail.spec.ts` | busca por numero/nome pt/en; ficha completa carrega; Eevee 8 ramos; Mewtwo sem badge "nao nasce"; placeholder custom Creepyon com aviso. |
| `tests/e2e/capture.spec.ts` | Capturei -> sequencia -> lista; pular com toque; desmarcar e marcar de novo repete; reload mantem; contador "X de 1.027". |
| `tests/e2e/team-history.spec.ts` | 7o -> aviso; reload mantem time/historico; 21 fichas -> 20. |
| `tests/e2e/trainers.spec.ts` | picker obrigatorio; BDSP 15 -> Roark 16 -> ...; `atm_team` bloqueada ate concluir; Modo Livre bloqueado/desbloqueado; reload mantem serie/progresso; desmarcar desce o cap. |
| `tests/e2e/items-balls.spec.ts` | Magikarp Net > Poke; Dusk "3.5x com luz 0"; pagina de item de um drop e Voltar; item sem rota -> "Sem rota confirmada"; numero de cards = `balls.json.length`. |
| `tests/e2e/settings.spec.ts` | preferencias persistem (Preto/EN/som off/reduzir on); override de card persiste; exportar -> contexto limpo -> importar identico; apagar so historico; Sobre mostra "Dados: All the Mons 1.3.0 / Cobblemon 1.7.3". |
| `tests/e2e/sync.spec.ts` | dois contextos A/B: gerar em A (sem rede: `route("**")` falha se houver request), colar em B, resumo, Mesclar = 15 capturados etc.; codigo corrompido -> erro e IndexedDB inalterado; multi-frame reconstruido. |
| `tests/e2e/pwa-offline.spec.ts` | 2o load com SW; offline mantem Home/Dex/ficha vista; artwork offline -> placeholder. |
| `tests/e2e/responsive.spec.ts` | 360 e 390 px: badges nao quebram o proprio texto (a linha de selos pode quebrar), `expectNoOverlap` sem cruzamentos, chips nao vazam (bounding boxes) em Home/Dex/ficha/capturados; 7 temas x home/ficha screenshots comparados ao `ui-refs` (tolerancia 2%): `classic` contra `desktop-home.png` e `desktop-detail-charizard-full.png` (nao existe `theme-classico-*` em `ui-refs/`); os outros 6 contra `theme-<azul|branco|laranja|preto|roxo|verde>-home.png` e `theme-<...>-detail-charizard.png` (verificados na listagem de `ui-refs/`). |
| `tests/e2e/perf.spec.ts` | Dex com 1027: <= 60 `.pcard` no DOM; scroll do topo ao fim sem long tasks > 200 ms (Performance API). |

Commit do sprint: `test: unit, component and e2e suites for phase 1` (um commit por arquivo de suite e permitido). Rollback: remover `tests/`.

---

## 8. Matriz de cobertura do PRD

| Requisito | Sprint.Feature |
|---|---|
| RF-01, RF-02, RF-03 | F1.3 (+ P2.1 botao fisico) |
| RF-04 | F1.3, F3.2, F4.2, F4.4, F5.2 |
| RF-05, RF-06, RF-07 | B6.5, F2.1 |
| RF-08 | F2.1 |
| RF-09 | B2.2, B2.5, F3.1, F4.1 |
| RF-10 | B2.3, F4.1, F5.1 |
| RF-11, RF-12, RF-13, RF-14 | F3.2 |
| RF-15 | F4.1, F4.2, F4.3, F4.4, F5.1 |
| RF-16 | B7.4, F1.4, F4.1 |
| RF-17 | B6.1, F4.2 |
| RF-18 | F4.2 |
| RF-19 | B2.4, F4.3 |
| RF-20 | B2.4 |
| RF-21 | B3.1, B3.2, F4.4 |
| RF-22 | F4.4 |
| RF-23 | B3.2, F4.4 |
| RF-24 | B3.2, F4.2 |
| RF-25 | B4.2, F5.1 |
| RF-26 | B2.3, F5.1 |
| RF-27 | B2.3, F5.1 |
| RF-28 | F3.1, F4.1 |
| RF-29 | B2.4, B3.3, F5.2 |
| RF-30 | B2.4, F5.2 |
| RF-31, RF-32, RF-33 | F4.1 |
| RF-34 | B6.1, F5.4 |
| RF-35 | B6.2, F5.4 |
| RF-36 | F7.1 |
| RF-37 | F2.1 |
| RF-38, RF-39 | B6.6, F2.2, F4.1 |
| RF-40, RF-41 | F2.2 |
| RF-42 | B7.1, F2.2 |
| RF-43, RF-44, RF-45 | B6.6, F2.2 |
| RF-46 | F2.2 |
| RF-47 | B7.1, F2.2 |
| RF-48 | F4.1, F6.1 |
| RF-49 | F6.1 |
| RF-50 | F4.1, F6.2 |
| RF-51 | F6.1 |
| RF-52 | B2.1, F2.2, F6.2 |
| RF-53 | F3.2, F6.2 |
| RF-54 | F6.1 |
| RF-55 | F6.2 |
| RF-56 | B7.1, F6.2 |
| RF-57 | B5.1, B5.2, F8.1, F8.2 |
| RF-58 | B5.1, F8.2 |
| RF-59 | B5.2, B6.3, F8.2 |
| RF-60 | B6.3, F8.2 |
| RF-61 | B6.3 |
| RF-62 | B7.1, F8.2 |
| RF-63 | B4.3, F9.1 |
| RF-64 | B4.3, B6.4, F5.3 |
| RF-65 | F5.3, F9.1 |
| RF-66 | B4.1, F9.2 |
| RF-67 | B6.5, F9.2 |
| RF-68 | B4.1, B4.2, F9.3 |
| RF-69 | B4.2, F9.3 |
| RF-70 | B4.2, F9.3 |
| RF-71 | F1.3, F4.3, F5.1, F5.2, F5.3, F8.2, F9.1, F9.2, F9.3 |
| RF-72 | F11.1 |
| RF-73 | B7.2, F11.1 |
| RF-74 | F11.2 |
| RF-75 | B7.2, F11.2 |
| RF-76 | B7.2, F11.2 |
| RF-77 | F11.2 |
| RF-78 | B6.6, B7.2, F11.2 |
| RF-79, RF-80, RF-81 | F1.1, F10.1 |
| RF-82 | B7.1, F1.4, F10.1 |
| RF-83, RF-84 | F1.2, F10.1 |
| RF-85 | F1.2 |
| RF-86 | F1.2, F10.1 |
| RF-87 | F1.1 |
| RF-88, RF-89, RF-90 | F1.4, F10.1 |
| RF-91 | B3.4, F1.4, F4.1, F4.3, F6.1, F8.2 |
| RF-92, RF-93, RF-94 | F1.4, F10.1 |
| RF-95 | B7.1 (+ P1.1, P2.1) |
| RF-96 | B7.1, F10.2 |
| RF-97 | B7.3, F10.2 |
| RF-98 | B7.3, F10.2 |
| RF-99 | B7.1 (+ P1.1, P2.1) |
| RF-100 | B2.1, B2.2, B2.3, B2.4, B2.5, B3.2, B3.3, B3.4, B4.1, B4.2, B4.3, B5.1, B5.2 |
| RF-101 | B2.1, B7.4 |
| RF-102 | B3.3, B7.4, F4.1, F12.1 |
| RF-103 | B1.3, F12.1 |
| RF-104 | B2.1, F1.4, F10.1 |
| RF-105 | P1.1 (Fase 2) |
| RF-106 | P2.1 (Fase 2) |
| RF-107 | P1.1, P2.1 (Fase 2) |
| RF-108 | P3.1 (Fase 2) |
| RF-109 | P3.1 (Fase 2) |
| RF-110 | B6.2, F5.4 |
| RF-111 | B5.2, B6.3, F8.1 |
| RF-112 | B7.2 |
| RF-113 | B7.2, F11.1, F11.2 |
| RF-114 | B2.1, B2.3, B2.5, F2.2, F5.1, F6.2, F10.1 |
| RF-115 | B2.3, F5.1 |
| RF-116 | F1.4 |
| RF-117 | B1.4, F1.1, F3.1, F4.1 |
| RF-118 | F4.1 |
| RF-119 | B1.4, F1.1 |
| RF-120 | F1.1 |
| RF-121 | F3.1, F4.1 |
| RF-122 | B7.3, F10.2 |
| RF-123 | B7.1, F2.2, F6.2, F8.1 |
| RF-124 | B7.1, F8.1 |
| RF-125 | B1.4, F1.4, F4.1, F6.1 |
| RNF-01 | F3.1, T1 (perf) |
| RNF-02 | F1.1, F1.4, F6.1 |
| RNF-03 | B7.4, F12.1 |
| RNF-04 | B3.4, F12.1 |
| RNF-05 | F1.2 (lint), T1 |
| RNF-06 | B7.1 |
| RNF-07 | F1.1, F3.2 |
| RNF-08 | F1.1 |
| RNF-09 | F1.4, F3.1, F12.1, T1 (responsive) |
| RNF-10 | B1.1, B1.2 |
| RNF-11 | B1.3, B7.4, F11.1 |
| RNF-12 | F4.1 |

Conferencia: RF-01 a RF-125 (125 itens) e RNF-01 a RNF-12 (12 itens) estao todos mapeados; nao ha orfaos. RF-105 a RF-109 mapeiam para sprints de Fase 2 (futuros), conforme o PRD.

---

## 9. Assumptions & Open Questions

### [ASSUMPTION] (adotadas com padrao justificado; revisaveis)
1. **A1 Versoes de bibliotecas**: as versoes de §5b.1 sao alvos; o implementador instala a ultima estavel do dia e trava no `package.json` sem `^`.
2. **A2 Fontes e icones empacotados** (`@fontsource/*`, `lucide-react` fixo) em vez do CDN/Google Fonts do prototipo, por RNF-11 e nota do orquestrador.
3. **A3 Roteamento sem URL por tela**: a URL nao muda ao navegar (apenas `pushState` com id); links diretos para uma ficha nao existem na Fase 1 (nao pedidos).
4. **A4 Orcamento de bundle** (JS inicial <= 250 KB gz, precache <= 4 MB, midia total <= 26 MB com falha de build acima disso).
5. **A5 Capacidade de frame QR** = 900 caracteres por frame em modo byte (QR versao 24, correcao M: 914 codewords de dados, cerca de 911 bytes uteis em modo byte), como em §5.4.2; carrossel automatico de 1,5 s.
6. **A6 Modo de datas no sync**: sempre com `capturedAt` por especie (modo 1), para preservar "Capturado em" na mesclagem.
7. **A7 Heavy Ball**: `HEAVY_BALL_BANDS` por `weight` (hg): `<= 1000` (<= 100 kg) -> 1x, `> 1000` -> 2x, `> 2000` -> 3x, `> 3000` -> 4x (o tooltip so diz "1× to 4×, increases by target's weight"); a Heavy Ball e SEMPRE incluida no ranking como incondicional com o valor da faixa (nunca excluida). As ancestrais `ancient_heavy/leaden/gigaton` sao flat 1/1.5/2 pelo tooltip, sem relacao com o peso. Demais bolas condicionais usam o melhor caso do tooltip; Park = Floresta/Planicies (2.5x), Safari = fora de batalha (1.5x), Sport = flat 1.5x.
8. **A8 Master Ball e Ancient Origin Ball** ("captura garantida") sao listadas separadamente, fora do ranking numerico.
9. **A9 Itens de forma**: Mega X/Y/Mega via `data/mega_showdown/mega_showdown/mega/*.json` + `keystone`; Mega-Z via heuristica sobre o jar do zamega; Gmax e regionais sem item ("Item nao identificado nos dados"), nunca o "Max Soup" do prototipo.
10. **A10 Rotas por addon**: Ultra Wormholes entra como rota `addon` para `ultra_beast`; Raid Dens NAO entra (nenhum datapack de spawn legivel confirma); Legendary Monuments e CCC entram pelos seus `spawn_pool_world`.
11. **A11 Rotulos de bioma**: EN humanizado do id da tag + dicionario PT curado (~120 entradas); faltantes caem no EN e vao para o relatorio.
12. **A12 Apricorns e mints** marcados `plantable` sem biomas preferidos; `rare_candy` na categoria de doces de EXP; vitaminas por lista curada.
13. **A13 Especies `implemented: false`** (se houver) entram no dataset e no contador, com flag no relatorio.
14. **A14 Sprites** apenas para dex 1..1025; custom usam placeholder; `artworkId` de formas verificado com HEAD em build.
15. **A15 Som de evolucao**: `evolution_notification` ao abrir a ficha de uma especie com cadeia (como o prototipo) e `evolution_ui` ao renderizar a cadeia.
16. **A16 Reduzir animacoes na captura**: pula direto para a revelacao apos 300 ms, mantendo os sons.
17. **A17 Lendario E mitico na mesma especie**: lendario prevalece no card e no fundo de captura.
18. **A18 Progresso de treinadores** e checado com a uniao dos derrotados de todas as series quando `requiredDefeats` cruza series; treinadores opcionais aparecem em secao colapsada.
19. **A19 Serie sem treinadores-chave** mostra cap 100 com aviso.
20. **A20 Apagar "Tudo"** exige digitar "APAGAR"; remover do time pela Home tem "desfazer" de 4 s.
21. **A21 `MemoryAdapter`** como fallback quando IndexedDB nao existe, com aviso persistente.
22. **A22 Artwork nos slots do time**: sprite 96px local; artwork grande so na ficha/comparar/captura.
23. **A23 Testes**: Vitest + Testing Library + Playwright com `headless: true`, sem `slowMo` e sem esperas artificiais (`waitForTimeout`/sleep proibidos; usar o auto-waiting do Playwright e `expect.poll`/`toPass`), regra do usuario de 2026-09-24 para este projeto; metas de cobertura de T1.
24. **A24 Fase 2**: `electron-updater` para o atualizador do Windows; nomes de secrets listados em P2/P3 (valores nunca no repo).
25. **A25 Limite do plano gratuito da Vercel** comporta ~30 MB de site estatico.

### [OPEN] (restante) e itens resolvidos
- **RESOLVIDO (ex-OPEN-1) Level cap com varios treinadores-chave disponiveis**: o orquestrador confirmou a formula (decisao 9) e corrigiu o PRD (rev 5) e a IDEA: apos Gardenia o cap e **22**, porque cada Cedric herda o `trainerLevel` 22 do prerequisito. B6.3 e F8.2 implementam e testam 22.
- **RESOLVIDO (ex-OPEN-2) Exemplo da calculadora de stats**: PRD (rev 5) e IDEA corrigidos para **299** neutra / **328** favoravel / **269** desfavoravel (base 100, L100, IV 31, EV 252). B6.2 e F5.4 testam esses valores.
- **[OPEN-3] Efeito numerico dos itens de cozinha** (ja listado no PRD como pesquisa pendente): entram com a descricao oficial e a nota "efeito numerico ainda nao confirmado" (`cooking.effectNote = "pending"`).

### Self-check

Reli o SPEC como agente de implementacao com apenas SPEC + CONTEXT + UISPEC: cada feature tem arquivos repo-relativos, passos, casos de borda, contratos consumidos por nome (`SpeciesSummary`, `SpeciesDetail`, `MoveInfo`, `ItemInfo`, `BallInfo`, `SeriesInfo`, `TrainerInfo`, `DatasetManifest`, `DocMap.*`, `StorageAdapter`, `encodeSyncCode/decodeSyncCode/mergeDocuments`, `effectivenessAgainst`, `calculateStats/recommendedInvestment`, `computeSeriesCap`, `rankBalls`, `searchSpecies`, `pushHistory/addToTeam`), criterio "Done when" verificavel, commit e rollback. Regras quantitativas com exemplo trabalhado e implementadas por passos: raridade (Eevee), level cap (BDSP 15/16/20/22/22/30, conforme PRD rev 5), stats (299/328/269/404, conforme PRD rev 5), efetividade (Charizard x4, Fogo/Agua x0.5), ranking de bolas (Magikarp, ranking completo de 44 posicoes recalculado literalmente pela regra), mesclagem do sync (A/B do PRD), tamanho do codigo (1 frame tipico, 5 no maximo). Matriz de cobertura sem orfaos (125 RF + 12 RNF, conferidos por script contra os ids unicos do PRD). Todas as linhas citadas de `app.js`, `style.css` e `index.html` foram lidas; os dados de jogo citados foram reconferidos no snapshot `data-source/atm-1.3.0/` (somente leitura). Correcoes feitas durante o self-check: (a) fingerprint do UISPEC atualizado para a versao recapturada; (b) adicionado `tags` ao `ItemInfo` (B4.1) para a aba "Iscas"; (c) explicitado que `context`/`spawnablePositionType` coexistem nos dados de spawn (B2.3); (d) removida qualquer dependencia de `design/` em runtime (assets copiados em B1.4); (e) nenhum travessao no documento (verificado por busca); (f) OPEN-1/OPEN-2 fechados apos a correcao do PRD rev 5 e da IDEA, fingerprints do Baseline e do frontmatter atualizados; (g) forge-review: dois mecanismos de merge (override x species_additions, com Mareep/sinew testado), ids em ingles para temas e fundos de captura (THEME_IDS canonico), bolas derivadas das texturas (48, sem numero fixo), unidades de tempo e envelope do codec com ordem de verificacao, capacidade de QR em modo byte, limite de pilha 40, UiState completo, linha de `backups` no ciclo de vida, `fast-check`/`msw` nas dependencias; (h) fonte de dados abstraida em `SourceReader` (instancia real zipada ou snapshot `data-source/atm-1.3.0` aberto), padrao repo-relativo para rodar sem o modpack, risco R13; (i) revisao 2026-09-24 (forge-review, 21 achados): caminhos repo-relativos em todo o documento (o unico caminho de maquina restante e a nota historica da origem do snapshot); deteccao de modo da fonte por `stat` do jar, regra unica em §5.1.1, §5b.2 e B2.1, nunca pelo nome do manifesto (NTFS); `pack.minecraft` e `cobblemonVersion` lidos de `META-INF/neoforge.mods.toml` nos dois modos; paridade com instancia real so condicional; `source-reader.ts` na lista de arquivos de B2; `import.meta.dirname`; Playwright `headless: true` sem `slowMo` nem esperas artificiais; `.gitignore` alinhado ao arquivo real (nada de `.forge/` ignorado); time do sync com 6 slots fixos (0 = vazio) e envelope do decode reordenado com o limite de 200.000 caracteres e o codigo de cada passo; tabela de bolas refeita com os 48 tooltips verbatim (ancestrais flat 1/1.5/2, Park 2.5x Floresta/Planicies, Safari 1.5x fora de batalha, Sport flat 1.5, Love pior caso 1, Dusk pior caso 1); Heavy Ball sempre incluida pela faixa de peso (sem `minWeightHg`); drops achatados com `amount` descartado de proposito; 11 adicoes do allthemons; Magikarp com 46 spawns; F6.1 com 7 sons + `pokedex_close`; nome unico da regra de lint; `mask-mode: alpha` em §3 e F1.1; A5 alinhada a QR v24-M; Baseline com HEAD `eacafc48`, CONTEXT `6205663d` e contagens do snapshot (802 texturas, 1072 gritos); (j) revisao do plano em ondas (decisoes D1-D5 do orquestrador): nova feature B1.5 (Onda 0) com os contratos compartilhados congelados (`src/data/types.ts`, `src/storage/types.ts`, `src/styles/themes.ts`, `src/domain/ball-rules-types.ts` com `HEAVY_BALL_BANDS`, `src/domain/normalize.ts`) e a configuracao de Vitest/Playwright; `tools/dataset/src/context.ts` (`PipelineContext`, contadores e registro de midia por dono) e stubs de etapa em B2.1; `src/data/schemas.ts` com dono B7.4 e importado por B2.5; Onda 1b so com um agente da Onda 1 terminado E B7.1 verde; F1.3 sem import de `src/audio/` (gancho de som injetado, ligado por F1.4); lista de sons UNICA em B3.4 (`src/audio/sfx-names.ts`, 20 nomes, `pokedex_scan_open` e `evolution_full` conferidos no snapshot); Done de F1.1-F1.3 unitario/harness, com as comparacoes visuais e os e2e de navegacao movidos para F2.2, F4.1, F9.3, F10.1 e T1; referencia do tema `classic` = `desktop-home.png`/`desktop-detail-charizard-full.png` (nao ha `theme-classico-*` em `ui-refs/`, conferido na listagem); `rarity.ts`/`obtain.ts` movidos para `tools/dataset/src/species/` (so build-time); um arquivo de teste e uma pasta de fixtures por agente; paridade snapshot x instancia movida de B2.1 para B2.5; igualdade com `type-chart.json` movida de B6.1 para B2.5; tabela da secao 6 com coluna de arquivos exclusivos, conferida contra os Consumes de cada feature (nenhuma feature agendada antes do que consome) e sem nenhum caminho repetido entre agentes da mesma onda (0 sobreposicoes); delta-review do plano em ondas (2 WARNING + 5 NIT): o Done das Ondas 0 e 1 nunca roda o pipeline completo nem escreve em `public/`: cada etapa e validada pelo teste do proprio agente (ou por `--only <stage> --out <dir>`, flags definidas em B2.1) numa saida temporaria `tools/dataset/out/_<parte>/`, e a unica escrita em `public/data/` e `public/assets/` e a publicacao de B2.5 (Onda 2); cache em disco com uma subpasta e um dono por etapa (`.cache/pokeapi/`, `.cache/sprites/`); Done de B2.1 confere `pack`/`cobblemonVersion` no `--report`/`report.json` e "sem criar `public/data/<ver>/` nem alterar `current.json`"; config Playwright separada para o harness (`playwright.harness.config.ts`, so dev server do Vite, specs em `tests/harness/`); F1.1 nao consome o `preferences-store` (`applyTheme` puro; o caso "tema salvo inexistente" e testado em F1.2); F4.4 removida da lista de destinos; igualdade com `type-chart.json` fora de `type-chart.test.ts`; coluna de arquivos da Onda 0 completada (`Icon.tsx`, `fonts.ts`, `types.generated.css`, `tests/setup.ts`, configs da raiz); F1.4 compara `desktop-home.png`/`mobile-home.png` so na regiao do shell, com `#main` mascarado. Reconferido apos o delta: 0 sobreposicoes na mesma onda, nenhuma feature antes do que consome. Cobertura: 125 RF + 12 RNF do PRD presentes na matriz (conferido por script, 0 orfaos); 0 travessoes. `Self-check: PASS`
