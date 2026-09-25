# HANDOFF - Onda 3, Frontend (frontend)

## F1.4

Agente: forge-imp-frontend (Onda 3, F1.4). Inicio 2026-09-24 17:15. Fim 2026-09-24 17:36 (F1.4); preparo das telas em paralelo 17:37-18:01 (vitest 44/44, e2e shell 15/15 com PW_DEV=1 PW_PORT=4174).

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F1.4 | verde | `f0d5b4fa` | shell desktop/mobile, boot, sfx, reduzir animacoes, primitivos, registro COMPLETO de telas com placeholders, `tests/harness/no-overlap.ts` |

### Testes executados (todos verdes)

- `npx vitest --run tests/unit/ui-shell tests/unit/ui-foundation`: 5 arquivos, 41 testes (14 novos de F1.4 em `tests/unit/ui-shell/`).
  - `sfx-motion.test.ts` (7): `SFX_FILES` cobre exatamente `SFX_NAMES`; `playSfx` respeita o toggle e `playCry` toca sempre; autoplay bloqueado fica pendente e toca no `pointerdown`; 404 de som = 1 `console.warn`, sem lancar; `navigate` toca `pokedex_click_short` pelo gancho; reduzir animacoes (null segue o sistema, true/false sobrescreve, sem matchMedia = false, `html.reduce-motion` acompanha a store).
  - `shell.test.tsx` (7, loaders mockados, sem dataset real): registro tem 1 tela por `ScreenId`; tampa fechada enquanto carrega, abre e toca `pokedex_open` 1 vez; som desligado = silencio; `NOT_FOUND` mostra "rode npm run dataset" com retry que recupera; sidebar com 9 itens, versao "Dados: All the Mons 1.3.0 / Cobblemon 1.7.3" do manifesto, navegacao e item ativo; toggles idioma/som/tema; mobile < 900 px, tab bar, sheet "Mais" abre, item navega e fecha.
- `npx playwright test tests/e2e/shell.spec.ts` (headless, sem slowMo, sem sleeps): 15 testes. `/data/**` e `/assets/sfx/**` servidos por `page.route` com `tests/fixtures/ui-shell/manifest.json` (nao depende de `public/data/`). Espiao de som via `HTMLMediaElement.prototype.play`.
  - boot: tampa fechada com "Carregando dados..." enquanto o manifesto esta segurado, 0 sons; liberado -> `pokedex_open` exatamente 1 vez e a tampa some; 0 erros de console.
  - dataset ausente (404): tampa abre, `#main` mostra o erro com "Tentar de novo", rodape "Dados: indisponiveis".
  - desktop: sidebar visivel, tabbar/topbar ocultas, `main#main`, 9 itens, clique em Treinadores toca so `pokedex_click_short`, `page.goBack()` volta, Sincronizar (lazy) carrega; 0 erros de console. Som desligado = nenhum som ao navegar.
  - reduzir animacoes: `emulateMedia({reducedMotion:"reduce"})` -> `html.reduce-motion` e `getComputedStyle(.watermark).animationDuration === "0.001s"`; sem preferencia = `60s`.
  - mobile 390 px: topbar + tab bar (Inicio, Pokedex, Capturados, Comparar, Mais), sheet com 5 itens totalmente visivel, Configuracoes navega e fecha; 899 px = mobile, 900 px = desktop.
  - sem sobreposicao: `expectNoOverlap` na topbar, tab bar e sheet "Mais" aberta (mobile) e na sidebar (desktop) a 360, 390 e 1280 px, em PT E em EN (6 testes). Teste "teeth": um botao posto sobre o rotulo "Pokedex" e detectado.
- `npx tsc -p tsconfig.app.json --noEmit` e `tsc -p tsconfig.node.json`: 0 erros nos meus arquivos. `npx eslint src tests/unit/ui-shell tests/e2e tests/harness`: 0 problemas. `npx vite build --outDir <scratchpad>`: ok (JS inicial ~40 KB gzip + vendor-react ~59 KB; `SyncScreen` em chunk proprio; precache 42 entradas).
- Conferencia visual (screenshots headless com `#main` mascarado, olhados contra `ui-refs/`): `mobile-boot-lid-closed.png` identico em layout (lente, LEDs, bola, titulo, subtitulo); `desktop-home.png` sidebar identica (lente, LEDs, marca, itens com icones, item ativo com barra, toggles, rodape); `mobile-nav-mais-sheet.png` igual, com o item extra Sincronizar exigido pela SPEC. Diferenca aceita: o rodape "Dados: All the Mons 1.3.0 / Cobblemon 1.7.3" quebra em 2 linhas (texto do manifesto e mais longo que o do prototipo).

### Como rodar o e2e (importante)

Hoje: `$env:PW_DEV="1"; $env:PW_PORT="4174"; npx playwright test tests/e2e/shell.spec.ts` (dev server, ver "Preparo das telas em paralelo"). Opcional: `SHELL_SHOTS_DIR=<pasta>` grava os screenshots de conferencia.

### Decisoes e desvios

1. **Registro completo de telas (pedido do orquestrador)**: `src/screens/registry.ts` mapeia os 11 `ScreenId` (home, dex, detail, captured, compare, trainers, balls, items, item, settings, sync) para `src/screens/<Tela>/<Tela>Screen.tsx`, cada um um placeholder (`ScreenPlaceholder`: titulo + estado vazio) importando o PROPRIO CSS `src/screens/<Tela>/<tela>.css` (vazio). Sync e `React.lazy` (chunk proprio para qrcode/zxing/fflate); o `AppShell` tem `Suspense` com `PokeballSpinner`. O overlay de captura NAO e tela (vive fora da pilha): e `src/components/CaptureOverlay.tsx`, do agente A.
2. **`mobile.css`** porta so o shell (802-819) e regras genericas (h1/h2, `.panel`, `.seg-tabs`, `.terms-tgl`); as regras mobile especificas de tela (`.poke-grid`, `.hero`, `.detail`, `.cmp-*`, `.history-row`, `.filters`, `.evo`, `.theme-grid`, `.captured-*`, `.cap-name`) vao para o CSS da propria tela (`.app.mobile .x` dentro de `src/screens/<Tela>/<tela>.css`).
3. **Boot**: a tampa so abre quando o dataset TERMINA (sucesso ou erro); em erro o `#main` mostra `InlineError` (`dataset.missing` para `NOT_FOUND`, `dataset.invalid` para `INVALID`, `error.load` para rede) com retry. `lidUp/lidDown` so rodam com `.boot.opening` (delay 1.4 s da SPEC; com reduzir animacoes o delay vai a 0). Fallback de 2,6 s remove a tampa se `animationend` nao disparar. Som `pokedex_open` 1 vez por sessao (flag de modulo, protege o StrictMode).
4. **Ordem do boot** (`src/boot.ts`): dataset comeca em paralelo; `createStorageAdapter` + `init` + `hydratePreferences(createPreferencesRepository(adapter))` antes do `createRoot` (sem flash de tema); `installMotionPreference`, `setNavigationSoundHook(() => playSfx("pokedex_click_short"))`, `installSfxUnlock`, `installClickSound`, `installHistoryBridge`, `registerServiceWorker`. Falha de storage = segue com padroes + toast persistente `error.storage`; notices `readOnly` -> toast `error.readOnly`, `blocked`/`memoryFallback` -> `error.storage`. `persistError` das preferencias -> toast persistente.
5. **Sons de clique**: elementos com `data-nav` tocam so `pokedex_click_short` (pelo gancho da pilha); outros `button`/`.switch`/`[role=button]` tocam `click` (captura global); `data-silent` silencia. Telas novas: botoes que navegam devem ter `data-nav` para nao tocar 2 sons.
6. **Icone de Sincronizar**: `QrCode` (ja reexportado em `Icon.tsx`, arquivo da Onda 0 nao editado).
7. **i18n**: chaves novas `shell.brand/sound/language/theme/close/dataPending/dataUnavailable`, `dataset.missing`, `dataset.invalid`. O rodape usa `about.dataVersion` com `{pack}` = "All the Mons 1.3.0".
8. **Topbar mobile** tem so som + idioma (como o prototipo); o tema no mobile fica em Configuracoes (F10.1).
9. **Service worker**: `register-sw.ts` registra `/sw.js` so em producao e guarda o `beforeinstallprompt` (`promptInstall()` + `setInstallPromptAvailable` de `src/platform/web.ts`) para F10/F12.
10. Comparacao visual por pixel (`toHaveScreenshot`) nao foi automatizada: nao ha baseline do app (as capturas de `ui-refs/` sao do prototipo com fontes/CDN diferentes, pixel-diff falharia sempre). Feita por conferencia visual; T1 pode gerar baselines do proprio app.

### Pendencias

- Nenhuma checagem do Done-when de F1.4 depende do dataset publicado (todas rodaram com fixture). `public/data/current.json` NAO existia durante esta execucao: rodar o app de verdade hoje mostra o erro "Rode npm run dataset" ate a Onda 2 publicar (comportamento esperado).

### Posse de arquivos para as telas em paralelo (depois de F1.4)

CONGELADOS (nenhum agente de tela edita; mudanca volta ao orquestrador): `index.html`, `src/main.tsx`, `src/App.tsx`, `src/boot.ts`, `src/screens/registry.ts`, `src/screens/ScreenPlaceholder.tsx`, `src/components/{AppShell,Sidebar,Topbar,TabBar,MoreSheet,BootSplash,ShellToggles,PokedexLens,ErrorBoundary,Toast,Modal,PokeballSpinner,Skeleton,InlineError,EmptyState,Badge,SegmentedControl,Switch,ArtworkPlaceholder,ItemTile,ScreenRouter}.tsx`, `src/components/{nav-items,useIsMobile}.ts`, `src/styles/{shell,mobile,tokens,themes,base,components}.css`, `src/state/{dataset-store,shell-store,motion,app-storage,preferences-store}.ts`, `src/audio/{sfx,cries,sfx-names}.ts`, `src/navigation/**`, `src/pwa/**`, `tests/harness/no-overlap.ts`, `tests/e2e/shell.spec.ts`, `tests/unit/ui-shell/**`. Primitivos compartilhados que faltarem: pedir ao orquestrador ou criar dentro da propria pasta de tela.

### Preparo das telas em paralelo (decisao do orquestrador, commit `chore(ui): per-screen i18n modules and per-agent e2e dev server port`)

**i18n por modulo** (API publica inalterada: `MESSAGES`, `MessageKey`, `useT`, `EXCLUDED_MESSAGE_KEYS`; novo `MESSAGE_MODULES`). `src/i18n/messages.ts` virou agregador que importa `src/i18n/messages/<modulo>.ts` (tipo `Message` em `messages/types.ts`). Chaves existentes foram movidas por prefixo (319 no total):
- `core.ts` (105, CONGELADO): `nav`, `shell`, `boot`, `error`, `empty`, `offline`, `dataset`, `terms`, `theme` e os termos compartilhados entre telas `obtain`, `rarity`, `stat`, `cat` (categoria de golpe E de item), `cond`.
- Agente A: `home.ts` (home.*), `dex.ts` (dex.*), `detail.ts` (detail, evo, form, weak, where, calc, tab, col), `capture.ts`, `captured.ts`, `compare.ts`.
- Agente B: `trainers.ts` (tr, role), `balls.ts` (ball), `items.ts` (item.*), `item.ts` (ip.*).
- Agente C: `settings.ts` (settings, about, backup, deleteData), `sync.ts` (sync).
- Cada agente acrescenta chaves SO nos proprios modulos. Precisa de chave nova em `core`? Pede ao orquestrador. `tests/unit/ui-shell/i18n-modules.test.ts`: uniao disjunta (chave em 2 modulos falha), pt/en nao vazios em todo modulo, e `@ts-expect-error` prova que chave desconhecida nao compila. O teste de completude de F1.2 (`tests/unit/ui-foundation/i18n.test.tsx`) continua cobrindo `MESSAGES` inteiro.

**e2e por agente**: `playwright.config.ts` le `PW_PORT` (padrao 4173; baseURL, servidor e `outputDir: test-results/pw-<porta>`) e `PW_DEV=1` sobe `npx vite --port <porta> --strictPort` (sem `tsc -b`, sem build); sem `PW_DEV` continua build + preview (caminho do T1). Em modo dev: `globalSetup` (`tests/e2e/global-setup.ts`) aquece a pagina uma vez, `workers: 1`, timeout de teste 90 s e de expect 20 s (com a maquina dividida entre agentes, 4 workers no dev server estouravam o `page.goto` de 30 s; medido nesta sessao). Comandos (PowerShell, depois do ajuste de PATH):
- Agente A: `$env:PW_DEV="1"; $env:PW_PORT="4174"; npx playwright test tests/e2e/<home|dex|detail|captured|compare|capture>.spec.ts`
- Agente B: `$env:PW_DEV="1"; $env:PW_PORT="4175"; npx playwright test tests/e2e/<trainers|balls|items|item>.spec.ts`
- Agente C: `$env:PW_DEV="1"; $env:PW_PORT="4176"; npx playwright test tests/e2e/<settings|sync>.spec.ts`
- Sempre passar o(s) arquivo(s) de spec proprio(s), nunca a pasta inteira. O Playwright derruba o servidor ao terminar.

Congelados a mais: `src/i18n/messages.ts`, `src/i18n/messages/core.ts`, `src/i18n/messages/types.ts`, `playwright.config.ts`, `tests/e2e/global-setup.ts`, `tests/unit/ui-shell/i18n-modules.test.ts`.

- **Agente A (home, dex, detail, captura, capturados, comparar)**: `src/i18n/messages/{home,dex,detail,capture,captured,compare}.ts`, `src/screens/{Home,Dex,Detail,Captured,Compare}/**` (incluindo os CSS da pasta), `src/components/CaptureOverlay.tsx` (+ `src/styles/capture.css` se usar), stores proprias `src/state/{captured,team,history}-store.ts`, testes `tests/unit/ui-screens/{home,dex,detail,captured,compare,capture}*`, `tests/e2e/{home,dex,detail,captured,compare,capture}.spec.ts`.
- **Agente B (treinadores, pokebolas, itens, pagina de item)**: `src/i18n/messages/{trainers,balls,items,item}.ts`, `src/screens/{Trainers,Balls,Items,Item}/**`, store `src/state/trainers-store.ts`, testes `tests/unit/ui-screens/{trainers,balls,items,item}*`, `tests/e2e/{trainers,balls,items,item}.spec.ts`.
- **Agente C (configuracoes, sincronizar)**: `src/i18n/messages/{settings,sync}.ts`, `src/screens/{Settings,Sync}/**` (Sync continua lazy pelo registro; bibliotecas pesadas importadas so dentro de `src/screens/Sync/`), testes `tests/unit/ui-screens/{settings,sync}*`, `tests/e2e/{settings,sync}.spec.ts`.
- Todos: a tela recebe `{ entryId, params }` (`ScreenProps`); estado de UI por `useScreenUi(screen, key)`/`updateUi`; navegar por `useNavigationActions()`; botoes de navegacao com `data-nav`; loading = `PokeballSpinner`/`Skeleton`, erro = `InlineError`, vazio = `EmptyState`; dataset do boot em `useDatasetStore` (`manifest`, `speciesIndex`, `typeChart`, `status`); storage por `getAppStorage()` (`src/state/app-storage.ts`) + repositorios de `src/storage`; `expectNoOverlap(page, root)` de `tests/harness/no-overlap.ts` em toda tela a 360/390/1280 px, PT e EN.

## F2

Agente: forge-imp-frontend (Onda 3, F2 Home). Inicio 2026-09-24 18:25. Fim 2026-09-24 18:58.

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F2.1 | verde | `04fe3b34` | busca com autocomplete (dataset REAL), 14 e2e |
| F2.2 | verde | `2b93c758` | resumo de capturados, time, historico + stores compartilhadas; 6 unit + 10 e2e |

### Testes executados (todos verdes)

- `npx vitest --run tests/unit/ui-screens/home-stores.test.ts` (fake-indexeddb, jsdom): 6 testes. 7o no time -> `{ok:false, reason:"full"}` + toast `home.teamFull`, nada muda; ja no time = ok sem toast; remover mantem posicoes e `setSlots` desfaz; 3 orfaos + 3 conhecidos = cheio com toast `home.teamFullOrphans`; 21o no historico derruba o mais antigo, revisita vai ao topo sem duplicar; historico corrompido deduplicado na leitura; capturados: re-marcar mantem a data, orfao guardado mas escondido; "reload" (adapter novo no mesmo banco) mantem time/historico/capturados; evento `pontindex:data-changed` com `keys:["team"]` recarrega SO o time e sem `keys` recarrega todas.
- `$env:PW_DEV="1"; $env:PW_PORT="4174"; npx playwright test tests/e2e/home.spec.ts` (headless, sem slowMo, sem sleeps, dataset REAL de `public/data/current.json`): 24 testes.
  - F2.1: "25"/"025"/"0025"/"#25" -> 1 resultado Pikachu `#0025`; "6" -> Charizard; "pantano" -> Quagsire (dex 195, "Pântano" em PT; "Quagsire" + chips Water/Ground com UI em EN); "charizar" -> Charizard; "a" -> 8 (limite); "char" -> 7 no dataset real (Charmander, Charmeleon, Charizard primeiro, por prefixo); sprite `/assets/sprites/4.png` carregado; "creepyon" e "9902" -> custom com silhueta; "zzzzqq", "#", "000" -> estado vazio inline; Esc fecha; Enter abre o 1o, clique abre o escolhido, Voltar restaura o texto; seta + Enter abre o 2o; Aleatorio -> ficha; Abrir Pokedex -> dex; 0 erros de console; `expectNoOverlap` no hero e no dropdown aberto (com resultados, vazio e custom) a 360/390/1280, PT e EN.
  - F2.2: perfil novo "0 de 1.027", "0%", 6 slots vazios "0/6", historico vazio; dados semeados pelas proprias stores + `page.reload()` persistem (IndexedDB real): "5 de 1.027", "0,5%", "4/6", nomes dos slots, historico do mais recente com `#0006` e chips Fogo/Voador; clique no historico/slot abre a ficha, "Ver todos" abre Capturados; time cheio -> toast "Time cheio" e nao adiciona; "x" -> "Gengar removido do time" + Desfazer restaura a mesma posicao e sobrevive ao reload; orfaos escondidos ("2/6" com 1 slot visivel); `expectNoOverlap` na Home inteira com dados (e no card do time com a linha de desfazer) a 360/390/1280, PT e EN.
  - Obs.: na 1a execucao de F2.2 os 2 primeiros testes estouraram 90 s (boot/reload lento com servidor frio e maquina dividida; a execucao inteira levou 12,5 min); repetidos passaram em 1 min. Nao e bug do app.
- `tsc -p tsconfig.app.json` e `eslint` limpos nos meus arquivos.
- `npm run dev` de verdade: `npm run dev -- --port 5180 --strictPort` + sessao Playwright headless em `http://localhost:5180/`: tampa abre, "pantano" acha Pântano, resumo "0 de 1.027", 6 slots, 0 erros de console; servidor parado. Para abrir: `npm run dev` e acessar `http://localhost:5173/` (porta padrao do Vite).
- Conferencia visual: `desktop-home.png` (tema classic) e `mobile-home.png` reproduzidos com dados reais (hero, busca, dropdown `.search-dd`, cards Capturados/Meu time, historico em grade no desktop e carrossel no mobile).

### API das stores compartilhadas (CONGELADAS a partir de agora; grupos A e B consomem)

Base comum em `src/state/captured-store.ts` (time e historico importam de la): `setUserStoreStorage(adapter|null)` (testes; padrao `getAppStorage()`), `DATA_CHANGED_EVENT = "pontindex:data-changed"`, `knownDexSet(index)`, `useKnownDexSet()`, `PersistErrorCode`. Hidratacao preguicosa e idempotente (o `boot.ts` e congelado): cada store tem `hydrate()`/`reload()` e um hook `useXHydrated()` que hidrata ao montar e devolve `hydrated`; toda mutacao espera a hidratacao. Escrita = doc INTEIRO a partir da memoria, fila serial por store; erro de escrita mantem o estado em memoria, grava `persistError` e sobe toast persistente `error.storage`. Orfaos (RF-123) ficam no doc; a UI filtra pelo indice do dataset. **Reidratacao**: as 3 stores ouvem o evento `window` `pontindex:data-changed` (`detail.keys`, disparado pelo agente C apos importar backup, aplicar sync, apagar dados ou restaurar snapshot) e recarregam do storage quando a propria chave esta em `keys` ou quando `keys` falta (testado).

- `captured-store.ts`: `useCapturedStore` (`entries: Record<String(dex), {capturedAt}>`, `hydrated`, `persistError`, `hydrate()`, `reload()`, `mark(dex, at?)` (re-marcar mantem a data), `unmark(dex)`), `useCapturedHydrated()`, `useIsCaptured(dex)`, `useCapturedKnownCount()`, `capturedKnownList(entries, known)`, `resetCapturedStore()`.
- `team-store.ts`: `useTeamStore` (`slots` sempre 6, `hydrated`, `persistError`, `hydrate()`, `reload()`, `addToTeam(dex)` -> `AddToTeamResult` (cheio = toast `home.teamFull` ou `home.teamFullOrphans`, nunca lanca), `removeFromTeam(dex)` -> slots ANTERIORES (para desfazer), `setSlots(slots)`), `useTeamHydrated()`, `useIsInTeam(dex)`, `resetTeamStore()`.
- `history-store.ts`: `useHistoryStore` (`entries` [0] = mais recente, `hydrated`, `persistError`, `hydrate()`, `reload()`, `push(dex, at?)`), `useHistoryHydrated()`, `sanitizeHistory(entries)`, `resetHistoryStore()`. **Quem registra a visita e a ficha (grupo A, F4.1)**: `useHistoryStore.getState().push(dex)` ao abrir a ficha.
- Dex invalido (<= 0 ou nao inteiro) lanca `RangeError` nas mutacoes (regra de B6.6).

### Outros artefatos reutilizaveis

- `src/screens/Home/SpeciesSprite.tsx`: `SpeciesSprite` (sprite 96px local, silhueta para custom/404), `spriteUrl(dex)`, `formatDex(dex)` ("#0025"); `useSpeciesByDex()` em `TeamSlots.tsx`.
- e2e em modo dev pode semear dados importando o modulo do Vite (`await import("/src/state/team-store.ts")` em `page.evaluate`): e a MESMA instancia do app. So vale com `PW_DEV=1`.

### Decisoes e desvios

1. Pastas reais: `src/screens/Home/` (registro de F1.4) e CSS em `src/screens/Home/home.css` (nao `src/styles/home.css`), seguindo a decisao 2 de F1.4.
2. Base comum das stores dentro de `captured-store.ts` (nenhum arquivo novo em `src/state/` alem dos 3 meus).
3. "Removido, desfazer" (passo 2 de F2.2): o `Toast` congelado nao tem botao de acao nem variaveis; fiz uma linha inline no card do time ("{nome} removido do time" + "Desfazer", 4 s = `TOAST_DURATION_MS`). "Time cheio" usa o toast global.
4. Slots e historico usam o sprite 96px local (SPEC), nao o artwork do prototipo; funciona offline.
5. Rodape do resumo mostra so a porcentagem (`home.lastCaught` foi excluida por ser texto fake).
6. Slot vazio nao e clicavel (a SPEC nao define acao). Nenhum arquivo congelado editado; nenhum Co-Authored-By.

## Grupo C (Configuracoes e Sincronizar)

Agente: forge-imp-frontend (Grupo C). Inicio 2026-09-24 18:01. Fim 2026-09-24 18:37.

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F10.1 | verde | `048f5b9c` | temas, idioma, termos (limpa overrides), som, reduzir animacoes (3o estado "Seguir o sistema"), instalar, Sobre |
| F10.2 | verde | `58419b91` | backup exportar/importar (resumo + Mesclar/Substituir), apagar dados (Tudo exige digitar APAGAR/DELETE), restaurar snapshot |
| F11.1 | verde | `b319f0e3` | gerar codigo: QR unico ou carrossel 1,5 s com setas, texto, copiar, baixar .pdx, resumo |
| F11.2 | verde | `bd2468be` | receber: camera (zxing lazy), colar, arquivo; tudo passa pelo FrameCollector; resumo, previa, Mesclar/Substituir |

### Testes (todos verdes, headless, sem slowMo/sleeps, PW_DEV=1 PW_PORT=4176)
- `tests/e2e/settings.spec.ts` (14): layout/rotulos/Sobre (versao do dataset e contagens lidas do manifesto), "Preto + English + som off + reduzir on" persiste apos reload, trocar padrao de termos zera overrides no IndexedDB, no-overlap 360/390/1280 PT e EN; round-trip exportar -> contexto limpo -> importar (Substituir) = 5 entidades identicas; backup mais novo/estrangeiro/format desconhecido -> erro e IndexedDB identico; apagar so Historico mantem as outras 4; Tudo exige a palavra e limpa snapshots; restaurar snapshot pre-migracao; no-overlap do modal (desktop) e sheet (390).
- `tests/e2e/sync.spec.ts` (15): 20 capturados -> 1 QR, nenhuma requisicao de rede durante a acao (`page.route("**/*")`); 1027 capturados + 110 treinadores + 20 historico -> 7 frames <= 900 caracteres cuja concatenacao = texto; dados vazios -> aviso; criterio A/B (dois contextos, Mesclar) exato: 15 capturados, Roark, time de A, historico [150,133,6,448,25], preferencias de B; codigo corrompido/estrangeiro -> mensagem da matriz e IndexedDB identico; frames colados um a um em ordem invertida + frame de outra sessao avisado; camera negada -> "Camera indisponivel" e foco no textarea; no-overlap 360/390/1280 PT e EN (gerar e receber com resumo).
- `tsc -p tsconfig.app.json` e `eslint` limpos nos meus caminhos. Screenshots conferidos contra `desktop-settings-full.png`/`mobile-settings.png` (mesma grade 4 col desktop / 2 col mobile, selo Padrao, seg de idioma, switches).

### Decisoes e desvios
1. `--danger: #C62828` definido em `:root` dentro de `src/screens/Settings/settings.css` (tokens.css e congelado). PEDIDO: mover para `tokens.css` (UISPEC 8.3) quando o orquestrador liberar.
2. `.page-head`, `.notice-info`, `.item-hero-tile`, `.setting-row`, `.card-info/.info-line`, `.btn-danger` nao existiam no CSS compartilhado: definidos nos CSS das minhas telas (`.card-info` e o resumo `SyncSummary` ficam em `settings.css`, que e carregado no chunk principal; Sync e lazy).
3. Reidratacao apos backup/sync/apagar/restaurar: `rehydrateAll` (`src/screens/Settings/data-actions.ts`) recarrega a store de preferencias e dispara `window` event `pontindex:data-changed` com `{ keys }`. As stores de capturados/time/historico (agente A) e treinadores (agente B) precisam OUVIR esse evento e recarregar do storage. PEDIDO ao orquestrador: repassar aos agentes A/B.
4. Leitor de camera: nao ha camera no headless; o caminho do leitor e o mesmo `feed()` usado pelo colar (cada texto lido vai ao FrameCollector), coberto pelos frames colados um a um. A decodificacao real do zxing a partir de video nao foi testada (so camera negada).
5. `requestPersistence()` nao era chamado por ninguem no boot; o card Sobre chama ao abrir se ainda for null.
6. Import de backup usa `applyBackup` (B7.3) nos dois modos em vez de `importSnapshot` direto (mesmo efeito, com migracao e meta local preservado).

## Reatribuicao F7 (orquestrador, 2026-09-24 21:27, aprovado pelo Pontin)

- F7 (Comparar) sai do Agente A e vai para o Agente B. Agente A = F3 -> F4 -> F5 -> F6 (em fila). Agente B = F8, F9 e F7 POR ULTIMO.
- Posse que passa do A para o B: `src/i18n/messages/compare.ts`, `src/screens/Compare/**`, `tests/unit/ui-screens/compare*`, `tests/e2e/compare.spec.ts`.
- F7 CONSOME (so leitura, nao edita): `src/screens/Home/SearchBox.tsx` (e o que ele usa da Home), `useHistoryStore` (padrao = 2 ultimos do historico), `loadSpecies`, e o `ArtworkImage` que o Agente A cria na F4.1. Se `ArtworkImage` nao existir no HEAD quando o B chegar em F7, o B NAO duplica: marca F7 como pendente por dependencia e devolve ao orquestrador.
- Precisa mudar arquivo de outro agente? Pede ao orquestrador.

## Grupo A (Pokedex, ficha, captura, capturados)

Agente: forge-imp-frontend (Grupo A). Inicio 2026-09-24 21:35.

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F3.1 | verde | `9df8548a` | grade virtualizada por linhas (#main e o elemento de rolagem), card com selos em linha propria |
| F3.2 | verde | `4ed202c7` | busca PT/EN + tipos (OR) + geracao + evolucao + status + ordenacao, tudo em `current.ui` |

### Testes executados

- `npx vitest --run tests/unit/ui-screens/dex-filter.test.ts` (9): filtro combinado, OR entre tipos, status por capturados, texto numero/PT/EN sem acento, so espacos = sem filtro, ordenacao nome/bst, `sortGenerations`, `gridColumns`.
- `$env:PW_DEV="1"; $env:PW_PORT="4174"; npx playwright test tests/e2e/dex.spec.ts` (12, dataset real, headless): ver notas de F3.1/F3.2 no checklist. Opcional `DEX_SHOTS_DIR=<pasta>` grava screenshots de conferencia.
- Suite completa no fim do sprint F3: 1 falha fora do meu escopo, `tests/unit/ui-shell/shell.test.tsx` ("shows every nav item ... and navigates") espera `[data-placeholder='trainers']`, que deixou de existir quando o grupo B implementou Treinadores (arquivo congelado; PEDIDO ao orquestrador: ajustar o teste do shell).

### Componentes reutilizaveis (caminhos e props)

- `src/screens/Dex/PokemonCard.tsx`: `PokemonCard({ species: SpeciesSummary, enterIndex?: number, onOpen(dex), footer?: ReactNode })` (o `footer` fica FORA do botao do card, para acoes como desmarcar); `SpeciesBadges({ species })` (selo Lendario/Mitico + badge de raridade, omitido se `rarity.primary == null`); `specialLabel(labels)` (lendario prevalece); `RARITY_BADGE`.
- `src/screens/Dex/DexGrid.tsx`: `DexGrid({ list: SpeciesSummary[], renderFooter?(species) })`, virtualizada, 2 colunas no mobile; `gridColumns(width, mobile)`.
- `src/screens/Dex/ListSearch.tsx`: `ListSearch({ initial, onQuery(query), placeholderKey, labelKey, id? })`, mesmo visual da busca da Home (`.search`), debounce 120 ms, botao limpar.
- `src/screens/Dex/use-filtered-species.ts`: `filterSpecies(index, opts)`, `matchesQuery(species, q)`, `sortSpecies`, `sortGenerations`.

### Decisoes e desvios

1. Card usa o sprite 96px LOCAL (SPEC F3.1, funciona offline), exibido a 120 px com `image-rendering: pixelated` (o prototipo usava o artwork). A marca de capturado fica dentro da area da imagem (canto superior direito), nunca sobre a linha de selos, que pode quebrar em 2 linhas a 360 px.
2. Busca da Pokedex casa por substring no nome PT/EN (mesma regra da Home): "char" + Fogo tambem traz Chimchar e Charcadet (ambos Fogo).
3. Geracoes no select: "Geracao N"/"Generation N" e "Do pack (All the Mons)" para `custom`.

## Grupo B (Treinadores, Pokebolas, Itens, Item, Comparar)

Agente: forge-imp-frontend (Grupo B). Inicio 2026-09-24 21:35. Fim 2026-09-24 22:12 (parado por tempo e por bloqueio em F9.1).

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F8.1 | verde | `decb4aa0` | store `trainers-store.ts`, picker com bloqueio/Modo Livre, modelo puro testado no dataset real |
| F8.2 | verde | `75d7853d` | cap vigente, linha do tempo, derrotados, acordeao com time/spawn/mochila, busca PT/EN |
| F9.1 | [!] bloqueado | - | `loadBalls()` sempre INVALID (schema zod sem `minBaseSpeedAbove`/`hasAnyType`); codigo pronto NAO commitado |
| F9.2, F9.3, F7.1 | nao iniciados | - | parado por tempo |

### Testes executados
- `npx vitest --run tests/unit/ui-screens/trainers-model.test.ts tests/unit/ui-screens/trainers-store.test.ts tests/unit/ui-shell/i18n-modules.test.ts`: 17 verdes. Modelo contra `public/data` REAL: 15/16/20/22, 3 Cedric "next" com 22, um Cedric 22, 3 Cedric -> Maylene 30, desmarcar do meio deixa dependente derrotado+bloqueado e o cap desce; busca "roark"/"garchomp"/"galactica"/"geodude"; atm_team bloqueada com requisito BDSP, Modo Livre bloqueado sem serie concluida. Store (fake-indexeddb): serie ativa persiste no reload, Modo Livre pausa/retoma, derrotados por serie, evento `pontindex:data-changed` (com a chave, sem keys, e ignora outras chaves).
- `$env:PW_DEV="1"; $env:PW_PORT="4175"; npx playwright test tests/e2e/trainers.spec.ts`: 11 verdes (headless, sem slowMo/sleeps, dataset real): picker (aviso inicial, bloqueios, persistencia no reload), BDSP completa -> atm_team e Modo Livre liberados, Modo Livre = cap 100 e sair volta a BDSP; sequencia do cap clicando os checkboxes; acordeao do Roark (3 Pokemon, habilidade/golpes PT, toggle de termos EN, item de spawn com textura carregada, mochila, clique abre a pagina de item e Voltar mantem o acordeao aberto); busca (so exibicao, estado vazio com o texto, restaura ao voltar, limpar volta 43); `expectNoOverlap` 360/390/1280 PT e EN. 0 erros de console. Screenshots conferidos contra `desktop-trainers.png`/`desktop-trainers-expanded-full.png`.
- `npm run typecheck`: meus arquivos limpos (o unico erro e de `tests/unit/ui-screens/dex-filter.test.ts`, do grupo A, nao commitado). `eslint` limpo nos meus caminhos.
- Suite completa (fim de F8): 1 falha em `tests/unit/dataset/join.test.ts` (ENOENT em `tools/dataset/out/_publish_test`, ambiente/OneDrive) e 1 em `tests/unit/ui-shell/shell.test.tsx` ("desktop sidebar", com `vitest-worker Timeout calling onTaskUpdate` na mesma execucao: maquina dividida com o grupo A). Nenhuma das duas toca arquivos do grupo B; rodar de novo com a maquina livre.

### Decisoes e desvios
1. Pastas reais `src/screens/Trainers/` (CSS na pasta); store com o nome `trainers-store.ts` (F1.4).
2. `current.ui.filters.query` (regra geral da SPEC) nao existe no `UiStateMap` congelado para trainers/balls. `ListSearch` le/grava com um cast local (`src/screens/Trainers/ListSearch.tsx`). PEDIDO ao orquestrador: declarar `filters: { query: string }` em `UiStateMap.trainers` e `UiStateMap.balls` (e default) em `src/navigation/types.ts`.
3. Ordem dos treinadores = `series.keyTrainerIds` (B5.2 ja grava em ordem topologica), filtrando `optional === false`.
4. "Derrotados" para cap/bloqueio = uniao de todas as series (`defeatedSet`, ASSUMPTION de B6.3).
5. Nome do treinador exibido como vem do dataset ("Gym Leader Roark"); o badge usa `typeLabel` (idioma da UI) com classe `role-*` (team_* -> estilo rocket, `team_allthemods*`/outros -> `role-other` neutro).
6. Series quebram linha (`flex-wrap`) em vez de rolar na horizontal: com a rolagem, chips escondidos passavam por baixo do toggle de termos (expectNoOverlap pegou) e o Playwright nao clicava.
7. Dica (`tr.tip`) do prototipo omitida: o dataset nao tem dica por treinador. Biomas pelo `biomes.json` (chave `#ns:is_x`), fallback humanizado.
8. Icone `Lock` importado direto de `lucide-react` em `SeriesPicker.tsx` (Icon.tsx e congelado e nao reexporta `Lock`).
9. Multiplicador das bolas (F9.1, nao commitada) segue a captura de referencia ("1.5x", "1x a 4x"), "Garantida" para Master/Origin.
10. Checkbox Derrotado toca `levelup` quando o cap sobe.

### Pedidos ao orquestrador (arquivos congelados / de outros agentes)
- `src/data/schemas.ts`: adicionar `"minBaseSpeedAbove"` e `"hasAnyType"` ao `ballCondition` (bloqueia F9.1 e a melhor bola de F5.3).
- `src/components/ItemTile.tsx`: aceitar `ItemInfo.texture` como vem (`assets/items/...`); hoje dobra o prefixo. Grupo B usa `itemTexturePath()`.
- `tests/e2e/shell.spec.ts:113` espera `[data-placeholder='trainers']`: com F8 a tela real substituiu o placeholder, esse passo vai falhar (trocar por `.trainers-screen`).
- `src/navigation/types.ts`: item 2 acima.

### Reutilizaveis (grupo B)
- `src/screens/Trainers/ListSearch.tsx` (+ `list-search.css`): busca de lista com o visual da Home, debounce 120 ms, `ui.filters.query`, botao limpar. `useListQuery()`.
- `src/screens/Trainers/use-loader.ts`: `useLoader(load, deps)` -> `{data, error, loading, retry}`.
- `src/screens/Trainers/trainer-model.ts`: `itemTexturePath`, `humanizeId`, `biomeLabel`, `roleClass`, regras do cap para a tela.
- `src/screens/Trainers/TrainerTeam.tsx`: `ItemChip` (item clicavel -> pagina do item).

### Onde parou (para o proximo agente do grupo B)
- F9.1: arquivos prontos no working tree (nao commitados): `src/screens/Balls/{BallsScreen.tsx,ball-model.ts,balls.css}`, `src/i18n/messages/balls.ts` (8 chaves novas), `tests/unit/ui-screens/balls-model.test.ts` (verde), `tests/e2e/balls.spec.ts`. Assim que o schema for corrigido: `$env:PW_DEV="1"; $env:PW_PORT="4175"; npx playwright test tests/e2e/balls.spec.ts`, conferir print contra `desktop-balls-full.png`, commitar `feat(balls): poke ball grid with official effects and filters`.
- Depois: F9.2, F9.3, F7.1 (F7 so com `ArtworkImage` do grupo A no HEAD).

### F4.1 (commit `67d571dd`): `ArtworkImage` pronto para o grupo B (F7)

- Caminho: `src/screens/Detail/ArtworkImage.tsx`. Import: `import { ArtworkImage, artworkUrl } from "../Detail/ArtworkImage";` (o CSS base `.artwork`, `.artwork-img`, `.artwork-spinner` esta em `src/screens/Detail/detail.css`, carregado no bundle principal pelo registro).
- Props: `artworkId: number | null` (null = custom, mostra o aviso "imagem nao vem da PokeAPI"), `shiny?: boolean`, `size?: number` (px, quadrado; padrao 260), `alt?: string`, `className?: string`, `showNotice?: boolean` (padrao true), `onSettled?(ok: boolean)` (callback estavel).
- Comportamento: official-artwork (shiny em `/shiny/`), timeout 8 s ou erro -> `ArtworkPlaceholder` e 1 nova tentativa em segundo plano; `PokeballSpinner` sobreposto enquanto carrega.
- Outros da ficha: `src/screens/Detail/use-species-detail.ts` (`useSpeciesDetail(dex)` -> `{status: loading|ready|notFound|error, detail, retry}`), `HeroCard({ detail, onCapture? })` (F6.1 passa `onCapture` para abrir o overlay). A ficha chama `useHistoryStore.getState().push(dex)` ao abrir (nao ao voltar).
- Testes F4.1: `tests/e2e/detail.spec.ts` (9) e `tests/unit/ui-screens/detail-hero.test.ts` (2).

### F4.2 (`595ad987`) e F4.3 (`43bb4403`)

- Novos: `StatsPanel`/`StatBars({ stats })` (`src/screens/Detail/StatsPanel.tsx`, reutilizavel nas formas F5.2 e em Comparar), `WeaknessPanel({ types })` e `WeakGrid({ types, filter, cardKey })` (reutilizavel na calculadora F5.4), `AbilitiesPanel` + `useAbilities()`, `EvolutionPanel({ chain, currentDex })` + `useItems()` + `itemTexture(texture)`.
- ATENCAO grupo B: `ItemTile` prefixa `/assets/items/` e o dataset ja traz `texture` = `assets/items/...`; passar `itemTexture(item.texture)` (senao cai sempre no icone generico).
- Testes: `tests/e2e/detail.spec.ts` agora com 18 testes (F4.1 9, F4.2 4, F4.3 5), unit `detail-hero`, `detail-panels`, `detail-evolution`.

### Onde parei (fim da sessao do agente, 2026-09-24 22:16)

- Feitos: F3.1, F3.2, F4.1, F4.2, F4.3. Proximo: F4.4 (golpes com abas; `MovesPanel` na coluna direita depois de `AbilitiesPanel`, estado em `current.ui.moveTab/openMoveRows`), depois rodar a SUITE COMPLETA do vitest (fim do sprint F4), depois F5.1..F5.4, F6.1, F6.2.
- `DetailScreen.tsx` monta: esquerda = `HeroCard` + `StatsPanel`; direita = `WeaknessPanel`, `EvolutionPanel`, `AbilitiesPanel`. `HeroCard` aceita `onCapture` (F6.1 liga o overlay; hoje "Capturei" marca direto).
- Suite completa (fim de F3): unica falha e `tests/unit/ui-shell/shell.test.tsx` esperando o placeholder de Treinadores (grupo B implementou a tela; teste congelado, fora do escopo do A).

## Correcao compartilhada (grupo B)

Agente: forge-imp-backend (fix, orquestrador). 2026-09-24 22:08-22:35. Arquivos congelados editados com autorizacao do orquestrador.

| Commit | O que mudou |
|---|---|
| `5f1f18dc` | `src/data/schemas.ts`: `ballCondition` ganhou `minBaseSpeedAbove` e `hasAnyType` (igual ao `BallCondition` de `types.ts`); `loadBalls()` aceita o `balls.json` real. Desbloqueia F9.1 e a melhor bola de F5.3. Novo `tests/unit/data/published-schemas.test.ts` valida TODOS os arquivos publicados reais com os schemas dos loaders e confere que nenhum campo e descartado (os outros schemas ja batiam). |
| `59500a8e` | `src/components/ItemTile.tsx`: novo `itemTextureUrl()` exportado; `assets/items/...` vira `/assets/items/...` (sem prefixo dobrado), `/...` passa direto e o caminho curto `<ns>/<nome>.png` continua recebendo `/assets/items/`. Os contornos `itemTexturePath()` (`src/screens/Trainers/trainer-model.ts`, grupo B) e `itemTexture()` (`src/screens/Detail/EvolutionPanel.tsx`, grupo A) seguem funcionando e PODEM ser removidos (passar `item.texture` direto). Teste `tests/unit/ui-foundation/item-tile.test.ts` confere que toda textura do `items.json` real resolve para um arquivo existente em `public/`. |
| `76d2e4f7` | `tests/e2e/shell.spec.ts`: telas reais em vez de placeholders (`.trainers-screen`, `.home-screen`, `.sync-screen`, `.dex-screen`, `.settings-screen`) e mock de `series.json` vazio (a tela de Treinadores gerava 404 no console). 15/15 verdes com `PW_DEV=1 PW_PORT=4177`. |
| `73da7ee3` | `tests/unit/ui-shell/shell.test.tsx`: espera `.trainers-screen` e mocka `loadSeries`. |
| `767b349b` | `src/navigation/types.ts`: `ListFilters { query: string }`; `UiStateMap.trainers.filters` e `UiStateMap.balls.filters` (padrao `{ query: "" }`), no molde do dex. O cast local de `src/screens/Trainers/ListSearch.tsx` pode sair (`updateUi({ filters: { query } })`). |

Verificacao: `npm run lint` 0; `npx vitest --run` 36 arquivos / 306 testes verdes; `npm run typecheck` com 1 erro so em `tests/unit/ui-screens/dex-filter.test.ts:61` (grupo A, commit `4ed202c7`, `SpeciesSummary | undefined`), nada nos arquivos desta correcao.
