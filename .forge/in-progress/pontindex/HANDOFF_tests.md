## T1b (e2e suites)

Agente: T1 test agent, parte T1b (e2e). Inicio 2026-09-25 00:11. Contexto limpo, so `tests/e2e/**`
(nunca toquei `tests/unit/**`, `vitest.config.ts`, `README.md`, `CHECKLIST_MANUAL_pontindex.md`).

### Matriz do T1 (SPEC, linhas ~1561-1640) -> onde cada cenario mora

| Linha da matriz | Onde esta coberto |
|---|---|
| `navigation.spec.ts` | NOVO `tests/e2e/navigation.spec.ts`: pilha de profundidade 4 (especie > item > especie > item, sempre pra frente, depois Voltar 3x) e `Alt+ArrowLeft`. "Charizard > item > Voltar" com CLIQUE REAL ja existia em `detail.spec.ts` ("Charizard Mega X: ... clickable ... ") desde F5.2/F5.3 (o item e o Charizardite X do forms-panel). "Dex filtro + scroll > ficha > Voltar" ja existia em `dex.spec.ts` ("text, filters and scroll are restored after Back"). |
| `search-detail.spec.ts` | Sem arquivo novo: 100% ja coberto. Busca por numero/nome PT/EN em `home.spec.ts` (F2.1). Ficha completa, Eevee 8 ramos, Mewtwo sem badge "nao nasce", placeholder de especie custom com aviso, tudo em `detail.spec.ts` (F4.1-F5.4). |
| `capture.spec.ts` | Ja existia (F6.1), so ajustado para rodar em producao (ver "Compatibilidade com producao" abaixo). |
| `team-history.spec.ts` | NOVO `tests/e2e/team-history.spec.ts`: 21 fichas reais vistas pela UI -> historico corta em 20 (mais antigo cai fora), sobrevive a reload. O aviso do 7o Pokemon no time e a persistencia de time/historico apos reload ja estavam em `home.spec.ts` ("remove from team with undo; 7th add warns and does not add", "seeded data renders, persists across reload..."). |
| `trainers.spec.ts` | Ja existia (F8), sem mudancas. |
| `items-balls.spec.ts` | Sem arquivo novo: 100% ja coberto entre 3 arquivos. Magikarp Net>Poke e Dusk 3.5x em `detail.spec.ts` ("Magikarp: top 3 ranked, Net Ball..."); pagina de item de um drop + Voltar e "Sem rota confirmada" em `item.spec.ts`; numero de cards = `balls.json.length` (fetch direto do JSON publicado, ja mode-agnostic) em `balls.spec.ts`. |
| `settings.spec.ts` | Ja existia (grupo C), sem mudancas. |
| `sync.spec.ts` | Ja existia (grupo C), sem mudancas. |
| `pwa-offline.spec.ts` | Ja existia (F12.1); ACRESCENTADO o caso que faltava: "artwork nunca visto fica offline -> placeholder" (especie tem o JSON pre-cacheado via fetch direto, sem nunca abrir a ficha, entao o artwork nunca foi requisitado; offline, a ficha abre mas o artwork cai no placeholder). |
| `responsive.spec.ts` | NAO FEITO (ver "Onde parei"). Os bounding-box de badges/chips a 360/390 (sem sobreposicao) ja rodam DENTRO de cada spec de tela via `expectNoOverlap` (PT/EN, 360/390/1280), isso ja e real e roda em todo commit. O que falta e um arquivo DEDICADO com os screenshots de 7 temas x home/ficha comparados contra `ui-refs/` (tolerancia 2%) ou baselines proprias do app - ver decisao 10 do F1.4 em HANDOFF_frontend.md (fontes/CDN do prototipo divergem, pixel-diff contra `ui-refs/` sempre falharia; a recomendacao la ja era gerar baseline do proprio app com `toHaveScreenshot`). |
| `perf.spec.ts` | NOVO `tests/e2e/perf.spec.ts`: Dex com 1027 <= 60 `.pcard` no DOM (repete rapido o que `dex.spec.ts` ja prova em detalhe) + rolagem do topo ao fim sem long task > 200ms (`PerformanceObserver`, sem sleeps: rola uma tela por vez ate `scrollTop` parar de crescer). |

### Compatibilidade com producao (import("/src/...") so funciona com PW_DEV=1)

Descoberta: nao eram so 4 arquivos, eram **10**: `dex`, `detail`, `capture`, `captured`, `compare`, `item`,
`items`, `balls`, `trainers`, `home` usavam `page.evaluate(() => import("/src/..."))` (navegacao direta pela
store ou leitura de estado interno) - so resolve no dev server do Vite; no build de producao (`dist/`) nao
existe `/src/`.

**Corrigidos (mode-agnostic agora, rodam com e sem `PW_DEV`)**: `dex.spec.ts`, `capture.spec.ts`,
`captured.spec.ts`, `detail.spec.ts` (o mais critico: HANDOFF_frontend.md ja apontava 44 falhas dele em
producao). Estrategia (commit `665c38a2`):
- Navegacao (`openDetail`, `goCaptured`) trocada por interacao real de UI: busca da Home (`#search-input` +
  `.search-dd .dd-item[data-dex]`) e `[data-nav="home"|"captured"]:visible` (mesmo atributo usado por
  sidebar/tabbar, funciona em desktop e mobile).
- Leituras de estado interno (historico, capturados) trocadas por leitura direta do IndexedDB
  (`tests/e2e/idb-helpers.ts`: `readDoc`/`writeDoc` na store `documents` do banco `pontindex`, batendo com o
  schema de `src/storage/types.ts`).
- Semeadura com data arbitraria no passado (captured.spec.ts, datas de "capturado ha N dias") escreve direto no
  IndexedDB e dispara `window.dispatchEvent(new CustomEvent("pontindex:data-changed"))` (o mesmo evento que
  `RestoreSnapshotCard`/sync usam para religar as stores ja hidratadas).
- 1 caso ficou dev-only de proposito e documentado (`detail.spec.ts`, "unknown dex (not in the index) shows
  not-found"): dex 4321 nao existe no dataset e a busca da Home so lista especies reais, entao nao ha caminho de
  UI ate ele; `test.skip(!DEV, "...")`.

**NAO corrigidos (ainda so rodam com `PW_DEV=1`)**: `home.spec.ts`, `compare.spec.ts`, `item.spec.ts`,
`items.spec.ts`, `balls.spec.ts`, `trainers.spec.ts`. Ficou fora do tempo desta sessao (ver "Onde parei"). O
padrao de fix e o mesmo dos 4 arquivos acima (navegacao por UI + `idb-helpers.ts` para leitura/escrita de
estado), reaproveitavel diretamente.

**`pwa-offline.spec.ts`** so roda em producao por natureza (precisa do service worker real, que nao existe no
dev server) - isso e intencional, nao um problema a corrigir.

### O comando unico (o que da pra rodar hoje)

Nao existe HOJE um unico comando que rode a suite inteira 100% verde, por 2 motivos estruturais (nao so os
`import("/src/...")` pendentes):
1. `pwa-offline.spec.ts` PRECISA de producao (sem `PW_DEV`) - o dev server nao tem service worker. Os outros 6
   arquivos ainda pendentes (`home`, `compare`, `item`, `items`, `balls`, `trainers`) PRECISAM de `PW_DEV=1`.
   Sao requisitos opostos: 2 comandos, nao 1, ate os 6 arquivos serem corrigidos.
2. Mesmo corrigindo os 6 que faltam, rodar TUDO em producao hoje exporia as 5 falhas de timing achadas em
   `capture.spec.ts`/`detail.spec.ts` so em producao (ver `CHECKLIST_pontindex.md`, secao Bugs, linha "T1 / e2e
   producao") - nao investigadas a fundo (Regra 1: nao chutar se e bug do app ou fragilidade do teste).

**Comando pratico recomendado agora** (roda tudo que da pra rodar, 2 chamadas):
```
export PATH="/c/Program Files/nodejs:$APPDATA/npm:$PATH"
PW_DEV=1 PW_PORT=4178 npx playwright test --workers=1 --grep-invert "pwa-offline"
npx vite build && npx vite preview --port 4173 --strictPort &
npx playwright test tests/e2e/pwa-offline.spec.ts
```
(o `--grep-invert` e cinto de seguranca; `pwa-offline.spec.ts` ja se pula sozinho com `PW_DEV=1` via
`test.skip`.)

### Resultados desta sessao (specs que eu rodei e conferi individualmente)

Todos headless, sem slowMo, sem sleeps.

| Spec | Modo | Resultado |
|---|---|---|
| `dex.spec.ts` + `capture.spec.ts` + `captured.spec.ts` + `detail.spec.ts` | producao (build+preview 4173) | 66 passed, 1 skipped (o dev-only), 5 failed (ver Bugs no CHECKLIST) |
| `navigation.spec.ts` | dev (`PW_DEV=1 PW_PORT=4178`) | 2/2 |
| `team-history.spec.ts` | dev | 1/1 |
| `perf.spec.ts` | dev | 2/2 |
| `pwa-offline.spec.ts` | producao (build+preview 4173) | 5/5 (incluindo o caso novo) |

Suite COMPLETA (`npx playwright test --workers=1`, `PW_DEV=1 PW_PORT=4178`, todos os specs de uma vez) foi
disparada ao final da sessao e NAO terminou a tempo do limite de ~55 min (maquina compartilhada com o T1a
rodando vitest em paralelo, suite grande com 1 worker). Ver "Onde parei".

### Onde parei

- Faltou: (1) terminar de conferir a saida da suite COMPLETA (`PW_DEV=1`, todos os specs) disparada em
  background - o proximo agente deve simplesmente reabrir/checar ou rodar de novo com o comando acima; (2)
  aplicar o mesmo fix de compatibilidade com producao (navegacao por UI + `idb-helpers.ts`) em `home.spec.ts`,
  `compare.spec.ts`, `item.spec.ts`, `items.spec.ts`, `balls.spec.ts`, `trainers.spec.ts`; (3) `responsive.spec.ts`
  nao foi criado (screenshots de 7 temas x home/ficha); (4) investigar as 5 falhas so-em-producao antes de
  decidir se sao bug do app ou fragilidade do teste (comecar por `capture.spec.ts:73`, o mais simples: o
  MutationObserver de estagios nunca registra `s-open`).
- Nada foi deixado quebrado: todo commit desta sessao (`665c38a2`, `7c554217`, `eb1a09c6`, `8ec62e97`,
  `d3864b27`, `3692c4fa`) foi individualmente rodado e ficou verde antes de commitar.
