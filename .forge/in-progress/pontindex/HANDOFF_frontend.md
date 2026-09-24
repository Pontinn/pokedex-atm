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
