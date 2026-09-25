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

Agente: forge-imp-frontend (Grupo B). Sessao 1: 2026-09-24 21:35-22:12 (F8; parada por tempo e bloqueio em F9.1). Sessao 2 (continuacao, contexto limpo): 22:21-23:05 (F9.1-F9.3, F7.1).

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F8.1 | verde | `decb4aa0` | store `trainers-store.ts`, picker com bloqueio/Modo Livre, modelo puro testado no dataset real |
| F8.2 | verde | `75d7853d` | cap vigente, linha do tempo, derrotados, acordeao com time/spawn/mochila, busca PT/EN |
| limpeza | verde | `af7c1450` | `refactor(trainers)`: `itemTexturePath()` removido (ItemTile resolve), `ListSearch` tipado por tela, sem cast |
| F9.1 | verde | `496d5330` | 48 bolas (contagem do balls.json), filtros por tag + busca PT/EN, clique abre o item |
| F9.2 | verde | `f294554c` | abas por categoria, busca em todos os itens, tag acima do nome, descricao expansivel |
| F9.3 | verde | `6cc361d1` + `ebb4c88e` | pagina do item (Como obter honesto, Usado em); o fix troca `ip.noDesc` (chave EXCLUIDA pela SPEC) por `item.noDesc` |
| F7.1 | verde | `dd8c16d0` + `20079f5a` | comparar com swap, picker com a busca da Home; o 2o commit so tipa os imports do spec |

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
9. Multiplicador das bolas (F9.1) segue a captura de referencia ("1.5x", "1x a 4x"), "Garantida" para Master/Origin.
10. Checkbox Derrotado toca `levelup` quando o cap sobe.

### Pedidos ao orquestrador (arquivos congelados / de outros agentes)
- `src/data/schemas.ts`: adicionar `"minBaseSpeedAbove"` e `"hasAnyType"` ao `ballCondition` (bloqueia F9.1 e a melhor bola de F5.3). RESOLVIDO em `5f1f18dc`.
- `src/components/ItemTile.tsx`: aceitar `ItemInfo.texture` como vem (`assets/items/...`); hoje dobra o prefixo. Grupo B usa `itemTexturePath()`. RESOLVIDO em `59500a8e` (contorno removido em `af7c1450`).
- `tests/e2e/shell.spec.ts:113` espera `[data-placeholder='trainers']`: com F8 a tela real substituiu o placeholder, esse passo vai falhar (trocar por `.trainers-screen`). RESOLVIDO em `76d2e4f7`.
- `src/navigation/types.ts`: item 2 acima. RESOLVIDO em `767b349b` (cast removido em `af7c1450`).

### Reutilizaveis (grupo B)
- `src/screens/Trainers/ListSearch.tsx` (+ `list-search.css`): busca de lista com o visual da Home, debounce 120 ms, `ListSearch({ screen, id, labelKey, placeholderKey, clearKey })` e `useListQuery(screen)` (`filters.query` em trainers/balls, `query` em items), botao limpar.
- `src/screens/Trainers/use-loader.ts`: `useLoader(load, deps)` -> `{data, error, loading, retry}`.
- `src/screens/Trainers/trainer-model.ts`: `humanizeId`, `biomeLabel`, `roleClass`, regras do cap para a tela.
- `src/screens/Trainers/TrainerTeam.tsx`: `ItemChip` (item clicavel -> pagina do item).

### Sessao 2: testes executados (todos verdes, headless, sem slowMo/sleeps, PW_DEV=1 PW_PORT=4175, dataset real)
- e2e: `balls.spec.ts` 7, `items.spec.ts` 7, `item.spec.ts` 9, `compare.spec.ts` 9, e `trainers.spec.ts` 11 de novo depois da mudanca do `ListSearch` (1 falha transitoria de HMR durante uma edicao em andamento de `ItemsScreen.tsx`; repetido o teste, verde). 0 erros de console, `expectNoOverlap` 360/390/1280 PT e EN em todas.
- unit: `balls-model` 4, `items-model` 3, `item-page` 4, `compare-model` 2, `trainers-model` 10, `trainers-store` 4, `i18n-modules` 3.
- Suite completa fim de F9: 38/39 arquivos, 1 falha minha (`i18n.test.tsx`: `ip.noDesc` e chave excluida pela SPEC), corrigida em `ebb4c88e` e o arquivo repetido sozinho verde. Suite completa fim de F7: 40/40 arquivos, 318/318 testes. `npm run typecheck` 0 erros; eslint limpo nos meus caminhos.
- Screenshots conferidos contra `desktop-balls-full.png`, `desktop-items-grid.png` (cabecalho do card mascarado), `desktop-item-page-full.png`, `desktop-compare.png`.

### Sessao 2: decisoes e desvios
1. `ListSearch(screen)`: `filters.query` em treinadores/bolas e `query` em itens (o `UiStateMap.items` congelado ja tem `query` no topo). A barra acompanha mudanca externa do estado de UI (clicar numa aba de Itens limpa a busca).
2. Itens: sem virtualizacao JS; `content-visibility: auto` nos cards (aba Outros tem 559 itens). Aba Iscas = itens com a tag `bait` (73); aba sem item nao aparece; `ui.category` "all" (padrao congelado) cai na 1a aba (Medicina). Seta so aparece quando ha descricao.
3. Pagina do item: "Como usar" do prototipo omitido (dataset nao tem). Receita = "Sim, tem receita (tipos legiveis)"; loot humanizado ("Ruins: Gilded chests (base)"). `minecraft:gunpowder` EXISTE no `items.json` atual; o caso "item de outro mod" e testado com `othermod:strange_widget`.
4. F9.3 e2e "Charizard > Golpes TM > scroll > item > Voltar": a ficha do Charizard ainda nao tem item clicavel (formas/melhor bola), entao o item e aberto por `navigate` (mesmo efeito do clique). T1 pode trocar por clique real (ex. item da Mega X de F5.2).
5. Comparar: `SearchBox` da Home nao serve direto (navega para a ficha e grava `home.query`); `ComparePicker` reusa `SearchDropdown`, `searchSpecies`, `SEARCH_DEBOUNCE_MS/LIMIT` e o visual `.search`, sem editar arquivos do grupo A. Barras com classe propria `.cmp-bar` (nao depende de `detail.css`).
6. Icones extras importados direto de `lucide-react` (Icon.tsx congelado): Bone, Cherry, CookingPot, Fish, Leaf, CircleArrowUp, Gift, Hammer, PackageOpen, Sprout.
7. Os docs `.forge` (checklist/handoff) NAO foram commitados por mim; o grupo A commitou o checklist com as minhas marcas de F9 em `02de41d2`.

### Reutilizaveis (grupo B, sessao 2)
- `src/screens/Items/item-model.ts`: `ITEM_TABS`, `CATEGORY_CLASS`, `CATEGORY_LABEL`, `inTab`, `visibleTabs`, `filterItems`.
- `src/screens/Item/item-page-model.ts`: `obtainRows`, `recipeLabels`, `lootTableLabel`, `unknownItemName`, `showsEffect`.
- `src/screens/Compare/ComparePicker.tsx` (busca de especie que devolve o dex), `compare-model.ts` (`winner`, `compareDefaults`).

### Onde parei (fim da sessao 2, 2026-09-24 23:05)
- Escopo do grupo B COMPLETO: F8.1, F8.2, F9.1, F9.2, F9.3, F7.1 verdes e commitados. Nada pendente, nenhum `[!]`.
- Nenhum pedido novo de arquivo congelado. Sugestao para T1: trocar a navegacao programatica do e2e de F9.3 por clique real num item da ficha do Charizard quando F5.2/F5.3 estiverem no HEAD.

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

### F4.4 (`69b6719b`), F5.1 (`06370289`), F5.2 (`16aef11f`) + `97494c09` (typecheck do dex-filter.test.ts)

Agente: forge-imp-frontend (Grupo A, continuacao). Inicio 2026-09-24 22:16. Fim 23:00 (limite de tempo).

- Novos em `src/screens/Detail/`: `MovesPanel({ moves })` (+ `buildMoveRows`, `useMovesFile`, coluna PP; poder/precisao 0 do dataset = "-"), `WherePanel({ detail })` (raridade, `SpawnEntryRow`, colapso apos 6, drops, `ObtainPanel`; helpers `biomeText`, `contextText`, `eggGroupText`, `addonText`), `ItemLink({ id, items, lang, className?, size? })` (item clicavel reutilizavel, `itemDisplayName`, `humanItemId`), `FormsPanel({ detail })` (abas em `current.ui.formIndex`).
- Ordem na coluna direita: `WeaknessPanel`, `EvolutionPanel`, `AbilitiesPanel`, `MovesPanel`, `WherePanel`, `FormsPanel`. Proximos: `BestBallPanel` entra ENTRE `WherePanel` e `FormsPanel` (como o prototipo), calculadoras (`<details class="panel calc">`) no fim.
- Testes: `tests/e2e/detail.spec.ts` (+16: F4.4 5, F5.1 6, F5.2 5), unit `detail-moves.test.ts` (3). Opcional `DETAIL_SHOTS_DIR=<pasta>` grava moves-tm, eevee-where e mega-x-form.
- Suite completa no fim de F4 (22:40): 38 arquivos / 312 testes verdes.

### Onde parei (fim da sessao do agente, 2026-09-24 23:00)

- Feitos: F3.1..F5.2. Proximo: F5.3 (melhor bola; o schema das bolas ja foi corrigido em `5f1f18dc`, `rankBalls` de B6.4), F5.4, depois SUITE COMPLETA (fim de F5), F6.1, F6.2 (Capturados precisa de `filters.query` em `UiStateMap.captured`: hoje e so `{ tab }`, pedir ao orquestrador ou usar cast local como o grupo B fazia).
- `HeroCard` aceita `onCapture` (F6.1 liga o overlay; hoje "Capturei" marca direto).
- Falhas atuais FORA do grupo A (arquivos nao commitados do grupo B): `tests/unit/ui-foundation/i18n.test.tsx` falha porque `src/i18n/messages/item.ts` ganhou `ip.noDesc` (chave excluida pela SPEC); `npm run typecheck` falha em `tests/e2e/compare.spec.ts:42` (import `/src/...` sem o cast `as string`).

### F5.3 (`2da2d45d`), F5.4 (`90c0422e` + fix `68200aae`), F6.1 (`788bf7a3`), F6.2 (`4cc507ce` + `b6262271`)

Agente: forge-imp-frontend (Grupo A, continuacao 2). Inicio 2026-09-24 22:57. Fim 23:42.

- Novos em `src/screens/Detail/`: `BestBallPanel({ detail })` (entre WherePanel e FormsPanel; `partitionBalls` -> top 3 + "Ranking completo (n)", garantidas, captura critica, Ver todas; helpers `formatMultiplier`, `criticalBonus`, `bestBallReason`), `CalculatorsPanel({ baseStats, types })` em `StatsCalculator.tsx` (`<details class="panel calc">`, `clampInt`, `readCalcState`) e `TypeCalculator({ initial })` (`selectedTypes`, `EFFECT_LABEL`). Estado em `current.ui.calcInputs` (chaves `level`, `nature`, `iv.<stat>`, `ev.<stat>`, `t1`, `t2`) e `calcOpen`.
- `src/components/CaptureOverlay.tsx` (+ `src/styles/capture.css`): `CaptureOverlay({ dex, name, labels, artworkSrc, onCaptured, onClose })`, `useCaptureSequence(onFinal, onClosed)`, `CAPTURE_TIMELINE`, `captureBackground(labels)`. Montado SEM arquivo congelado: a ficha (`DetailScreen`) renderiza por portal no body a partir do `onCapture` do HeroCard; desmontar a ficha fecha e limpa os timers. Nenhum pedido de arquivo congelado.
- `src/screens/Captured/CapturedScreen.tsx`: `capturedList(index, entries, tab, query)`, `formatCaptureDate(ms, lang)`. `src/navigation/types.ts`: `UiStateMap.captured.filters` (excecao autorizada, `b6262271`).
- Testes: e2e `detail.spec.ts` (+11: F5.3 5, F5.4 6; teste F4.1 do Capturei ajustado ao overlay), `capture.spec.ts` (8), `captured.spec.ts` (6); unit `detail-best-ball` (3), `detail-calc` (4), `capture-sequence` (5), `captured-list` (3). Opcionais: `DETAIL_SHOTS_DIR`, `CAPTURE_SHOTS_DIR`, `CAPTURED_SHOTS_DIR`.
- Suite completa: fim de F5 42 arquivos / 325 testes verdes; fim de F6 44 arquivos / 333 testes verdes; `npm run typecheck` e `npm run lint` limpos.
- Decisoes: (1) Done de F5.3 cita Net 3x e Dusk 3.5x, que no Magikarp ficam fora do top 3 (Love 8x, Quick 5x, Dream 4x): top 3 visivel + ranking completo expansivel. (2) Condicoes das bolas no idioma da UI (`detail.ballCond.*`); o toggle PT/EN do card troca so os nomes. (3) F5.4: Fogo/Agua vs Fogo = x1/4 (SPEC e tabela real; o checklist dizia x1/2). (4) Reduzir animacoes na captura: s-final apos 300 ms, toca so `poke_ball_capture_succeeded`; sons da captura respeitam o toggle (`playSfx`, edge case da SPEC). (5) Capturados sem seletor de ordenacao (o `UiStateMap.captured` nao tem campo): capturados por data desc, faltando por numero. (6) Chave `captured.progress` e excluida pela SPEC; o rodape usa `captured.percent`.
- Observacao de ambiente: com o grupo B editando `src/` ao mesmo tempo, o dev server do Vite faz HMR no meio do e2e e a tampa do boot pode reaparecer por cima (o modulo do BootSplash e reexecutado e o flag de sessao zera). Os testes passam; so os prints esperam `.boot` sumir.

### Onde parei (fim da sessao do agente, 2026-09-24 23:42)

- Grupo A COMPLETO: F3.1..F6.2 todos `[x]`. Parte do grupo A em `CHECKLIST_MANUAL_pontindex.md` (secao Frontend) escrita. Nada pendente do grupo A; proximo e do orquestrador (F7-F9 do grupo B, depois F12/T1).

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

## F12: PWA instalavel e cache

Agente: forge-imp-frontend (F12, unico agente de implementacao). 2026-09-24 23:43 a 2026-09-25 00:12. Commit `70364fb7` `feat(pwa): installable manifest, precache and runtime caching strategy`.

### O que mudou
- `vite.config.ts` (bloco `VitePWA`): manifest com as cores da SPEC (`theme_color #DC0A2D`, `background_color #B0CDF3`), icones 192/512/maskable de B1.4. `readDatasetVersion()` le `public/data/current.json` no build para montar o glob do precache. Precache: `**/*.{js,css,html,svg,woff2}`, `assets/*.{webp,png}` (so imagens do shell empacotadas pelo Vite; nao desce para `assets/items|sprites`), icones (via `includeAssets`), `data/current.json`, `data/<ver>/{dataset-manifest,species-index,type-chart}.json`, `assets/sfx/*.ogg`. Resultado: 73 entradas, 2,49 MiB (orcamento 4 MB). Runtime CacheFirst: `pokeapi-artwork` (600, 30 dias, status 0/200 porque o `<img>` e opaco), `dataset` (`/data/**` exceto `current.json`), `cries` (300, `rangeRequests` porque toca por `<audio>`), `sprites` (1100), `items` (1200); todos com `purgeOnQuotaError`. `navigateFallbackDenylist` para `/data/` e `/assets/`; `cleanupOutdatedCaches`.
- Decisao: `current.json` NAO tem versao no caminho, entao vai no precache (muda junto com um SW novo) em vez do CacheFirst de `/data/` (ficaria preso na versao antiga depois de um dataset novo).
- `src/pwa/register-sw.ts`: BUG corrigido: registrava so no evento `load`, mas `registerServiceWorker()` roda no fim do boot assincrono e o `load` podia ja ter passado (SW nunca registrava). Agora registra na hora se `document.readyState === "complete"`. Detecta SW novo em espera (so quando ja ha controller) e publica em `src/pwa/update-store.ts`. Registro que resolve sem objeto (SW bloqueado) e ignorado.
- `src/pwa/update-store.ts` + `src/pwa/UpdatePrompt.tsx`: toast "Nova versão disponível" + "Atualizar" (manda `SKIP_WAITING` ao SW em espera e recarrega UMA vez no `controllerchange`) + X (esconde na sessao). Renderizado dentro do `ToastHost` (`src/components/Toast.tsx`), empilhado com os toasts. Chaves `pwa.updateAvailable`/`pwa.update` em `src/i18n/messages/core.ts`; estilo `.toast-action` em `src/styles/shell.css`.
- `playwright.config.ts`: `serviceWorkers: "block"` por padrao. Motivo: no build de producao o SW atende as requisicoes e o `page.route` dos mocks das outras specs deixa de enxergar. `tests/e2e/pwa-offline.spec.ts` libera com `test.use({ serviceWorkers: "allow" })`.
- Sem `responsive-fixes.css`: os e2e de todas as telas ja passam `expectNoOverlap` a 360/390/1280 PT e EN; a conferencia no celular de verdade ficou no CHECKLIST_MANUAL (secao PWA).

### Testes (headless, sem slowMo, sem sleeps)
- `npx playwright test tests/e2e/pwa-offline.spec.ts` (SEM `PW_DEV`: build + preview 4173): 4/4. (1) manifest instalavel e icones PNG respondem; (2) `navigator.serviceWorker.controller` no 2o load, precache contem index.html, current.json, os 3 JSON do boot e sfx, e NAO contem cries/sprites/items/species; (3) visita online Dex + ficha (artwork servido por `context.route`, que ve os fetch do SW), `context.setOffline(true)`, reload: Home, Dex e a MESMA ficha abrem, artwork `data-phase=ok` vindo do cache, 0 pageerror; (4) fluxo de atualizacao: sobe um servidor estatico proprio sobre `dist/` (porta livre) que muda o `sw.js` em memoria; `reg.update()` -> toast aparece, SW em espera; Atualizar -> recarrega, sem SW em espera, pagina controlada. Com `PW_DEV=1` a spec se pula (dev nao tem SW).
- Medido: o fetch do SCRIPT do SW (checagem de atualizacao) NAO passa por `page.route`/`context.route` (nem com `PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS`); por isso o servidor proprio no teste 4. Os fetch de subrecursos feitos pelo SW passam pelo `context.route`.
- `npm run typecheck` 0, `npm run lint` 0, `npx vitest --run` 44 arquivos / 333 testes verdes; `tests/e2e/shell.spec.ts` 15/15 com `PW_DEV=1 PW_PORT=4174` e 15/15 tambem no build+preview.

### Como verificar offline na mao
`npm run build` e `npx vite preview --port 4173`; abrir http://localhost:4173/, recarregar uma vez (DevTools > Application > Service Workers mostra `sw.js` ativo), abrir a Pokedex e uma ficha; DevTools > Network > Offline; recarregar: Home, Pokedex e a ficha vista continuam. Cache Storage mostra `workbox-precache-*`, `dataset`, `pokeapi-artwork`, `sprites` etc.

### Para o T1
- As specs que importam modulos com `import("/src/...")` em `page.evaluate` (ex.: `detail.spec.ts`, 44 falhas "Failed to fetch dynamically imported module") so rodam com `PW_DEV=1`; no build+preview isso falha por desenho (nao tem `/src` no dist). T1 precisa decidir: rodar essas no dev ou trocar a semeadura/navegacao por UI.
- O caso "artwork offline nunca visto -> placeholder" da matriz do T1 nao esta na spec PWA (a ficha vista usa o artwork cacheado); o `ArtworkImage` ja cai no placeholder em erro.
