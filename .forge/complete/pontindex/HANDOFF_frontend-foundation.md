# HANDOFF - Onda 1b, Frontend fundacao (frontend-foundation)

Agente: forge-imp-frontend (Onda 1b). Inicio 2026-09-24 16:53. Fim 2026-09-24 17:10.

| Feature | Status | Commit | Notas |
|---|---|---|---|
| F1.1 | verde | `a3bfc480` | tokens/themes/base/components.css, theme-meta.ts (THEMES, applyTheme), TypeIcon/TypeChip/Watermark, harness + fixture |
| F1.2 | verde | `e2bc3ad0` | messages.ts (310 chaves), useT/translate/gameName/termPair, TermPair, TermsToggle, preferences-store |
| F1.3 | verde | `311fbd0a` | navigation types/store/history-bridge/useNavigation/sound-hook, ScreenRouter, telas ficticias no harness |

## Testes executados (todos verdes)

- `npx vitest --run tests/unit/ui-foundation`: 3 arquivos, 27 testes (`tokens.test.ts` 6, `i18n.test.tsx` 11, `navigation.test.tsx` 10).
- `npx playwright test -c playwright.harness.config.ts` (headless, sem slowMo, sem timers): 7 testes.
  - F1.1: tokens do UISPEC 3.3 (28 props x 7 temas, de `ui-refs/tokens.json`) via `getComputedStyle` apos `applyTheme`; black: `--surface` #111111, card rgb(17,17,17), `#main` com fundo `--screen`, `--scroll-thumb` #F5C518; id desconhecido -> classic; `.t-fire` `--tc` = base de fogo de `design/tipos/cores.json` e icone SVG carregado; `.watermark` com `mask-image` contendo `pokeball-mask` (URL responde 200), `wmSpin`, opacity .03; 0 erros de console.
  - F1.3: navegar, rolar 800 px, navegar, `page.goBack()` restaura o scroll (tolerancia 2 px, `expect.poll`); Alt+Seta esquerda volta e restaura; Voltar do app volta uma tela so (popstate proprio ignorado); sem sobreposicao titulo x TermsToggle a 360/390/1280 px.
- `npx eslint src tests/unit/ui-foundation tests/harness`: 0 problemas (inclui `pontindex/no-literal-jsx-text` sobre `src/`). `npx tsc -b --noEmit`: 0 erros (no momento do fim; outras ondas seguem escrevendo).
- Screenshot de conferencia do harness (classic e black) conferido contra a identidade do prototipo (chips com gradiente + icone, card branco/preto, fundo `--screen`).

## API pronta para a Onda 3 (F1.4 em diante)

- Estilos: importar na ordem `src/styles/fonts`, `tokens.css`, `types.generated.css`, `themes.css`, `base.css`, `components.css` (o harness `tests/harness/foundation.tsx` e o exemplo). F1.4 cria `shell.css`/`mobile.css`.
- `src/styles/theme-meta.ts`: `THEMES` (`p1`, `p2`, `labelKey`, `subKey`), `DEFAULT_THEME`, `isThemeId`, `normalizeThemeId`, `applyTheme(id, root?)` (devolve o id efetivo).
- `src/i18n/messages.ts`: `MESSAGES`, `MessageKey`, `EXCLUDED_MESSAGE_KEYS`. `src/i18n/useT.ts`: `useT()`, `translate(lang, key, vars)`, `interpolate`, `hasMessage`, `MissingMessageError`, `gameName(entityOrText, lang)`, `termPair(text, lang)`. `src/i18n/TermPair.tsx`. `src/i18n/types.ts`: `TYPE_NAMES`.
- `src/state/preferences-store.ts`: `usePreferencesStore` (campos `theme, uiLanguage, termsLanguage, termsOverrides, soundEnabled, reduceMotion, hydrated, persistError` + setters `setTheme/setUiLanguage/setTermsLanguage/setTermsOverride/setSoundEnabled/setReduceMotion`), `hydratePreferences(repo)` (F1.4 chama no boot com `createPreferencesRepository(adapter)` apos `adapter.init()`; aplica `data-theme` e `lang`), `useTermsLanguage(cardKey)`, `flushPreferences()`, `htmlLang`. Gravacoes em fila serial pelo repositorio de B7.1; erro de gravacao vai para `persistError` (F1.4 mostra toast). `reduceMotion` e so guardado aqui; aplicar `html.reduce-motion` e de F1.4.
- `src/components/`: `TypeIcon` (+ `typeIconUrl`), `TypeChip` (`type`, `lang`, `size` sm/md/lg, `selected`) + `typeName`, `Watermark`, `TermsToggle` (`cardKey`), `ScreenRouter` (`screens: ScreenRegistry`, `fallback`; a tela recebe `{ entryId, params }`).
- `src/navigation/`: `types.ts` (`ScreenId`, `SCREEN_IDS`, `ScreenParamsMap`, `UiStateMap`, `NavEntry`, `defaultUi`), `navigation-store.ts` (`useNavigationStore` com `navigate(screen, params?, ui?)`, `go`, `updateUi`, `goBack(fromPopstate)`, `stack`, `current`, `restoredScroll`; `NAV_STACK_LIMIT` = 40; `reapplyRestoredScroll()` para a ficha chamar apos o lazy load; `resetNavigationStore` para testes), `history-bridge.ts` (`installHistoryBridge()` devolve o uninstall; popstate + Alt+Seta esquerda), `useNavigation.ts` (`useCurrentEntry`, `useCurrentScreen`, `useScreenUi(screen, key)`, `useNavigationActions`, `useHistoryBridge`), `sound-hook.ts` (`setNavigationSoundHook(fn|null)`, `navigationSound`; padrao no-op; hook que lanca e engolido com `console.warn`).
- O scroll container e `#main` (`MAIN_SCROLL_ID`); o AppShell de F1.4 precisa renderizar `<main id="main" class="main">`.

## Decisoes e desvios da SPEC (para o orquestrador)

1. **CSS da marca d'agua em `components.css`**: a SPEC lista `watermark 242-245` em `shell.css` (F1.4), mas `Watermark.tsx` e o teste de `mask-image` sao de F1.1 e `shell.css` nao e caminho meu. Coloquei `.watermark` + `@keyframes wmSpin` em `components.css`. F1.4 nao deve redeclarar.
2. **Chaves i18n `theme.*` em ingles**: `theme.classico/preto/...` do prototipo viraram `theme.classic/black/...` (+ `Sub`), iguais a `THEME_IDS`, para `THEMES[id].labelKey` ser derivavel. Todas as demais chaves do prototipo mantem o nome.
3. **Chaves excluidas**: alem das 6 listadas no Done-when, `captured.gen1` e as `evo.<pedra>` fixas (`evo.fireStone`, `evo.thunderStone`, `evo.waterStone`, `evo.leafStone`, `evo.iceStone`, `evo.linkCable`), conforme o passo de Files de F1.2. Lista em `EXCLUDED_MESSAGE_KEYS`. Chaves novas: `nav.sync(Sub)`, `terms.toggleTitle`, `sync.*`, `backup.*`, `deleteData.*`, `about.*`, `error.*`, `empty.*`, `offline.*`, `obtain.addon.*` (textos de sync/erro copiados da matriz §5c). Telas futuras podem acrescentar chaves (o teste de completude cobre qualquer chave nova).
4. **Tema salvo invalido**: o storage de B7.1 ja repara `theme` invalido na leitura (vira `classic` com `console.warn "[storage] doc repaired"`), entao `applyTheme` recebe `classic`. O teste cobre os dois caminhos: doc cru `theme:"inexistente"` gravado direto no IndexedDB (resultado classic + aviso) e repositorio que devolve id desconhecido (aviso do proprio `applyTheme`).
5. **`.screen`** fica sempre `display:block` (o ScreenRouter so monta a tela atual; no prototipo era `.screen.active`). `.card-head` ganhou `gap` + `flex-wrap` (regra "Sem sobreposicao de texto").
6. **Alt+Seta esquerda**: `installHistoryBridge` intercepta o atalho (`preventDefault`) e chama `history.back()`, que cai no mesmo caminho do popstate; assim funciona tambem em headless e nunca volta duas vezes.
7. **`ScreenRouter` so le `id/screen/params`**: `updateUi` nao re-renderiza a tela inteira (RF-04), testado com contador de render.
8. `TypeChip` recebe `lang` por prop (o chamador decide UI ou termos); `typeName` capitaliza a inicial (RF-87).

## Observacoes

- O dev server do Vite demorou ~16 s para responder no 1o acesso (maquina ocupada com os outros agentes); na 1a execucao do harness 4 testes estouraram o `page.goto` de 30 s. Com o servidor aquecido tudo passa em ~10 s. Se o harness falhar por timeout no `goto`, e so aquecimento, nao bug.
- Nenhum arquivo congelado foi editado. Nenhum `Co-Authored-By` nos commits.
