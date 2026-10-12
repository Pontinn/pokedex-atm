# Checklist - pokemon-generation

- Feature: pokemon-generation
- Branch: feature/pokemon-generation
- Baseline HEAD: 979fc78fced0785e969b306da38f518d489ddd00 (SPEC secao 1)
- Data de criacao: 2026-10-12
- SPEC: SPEC_pokemon-generation.md

Legenda: `[ ]` pendente, `[~]` em andamento, `[x]` concluida (commit existe), `[!]` bloqueada.

Ordem: a parte Backend (S0, B1, B2, T1 backend) roda primeiro; a parte Frontend so comeca depois de B2.2 verde (SPEC secao 6).

Janela quebrada B1.1 -> B2.2 (SPEC secao 7, regras gerais): todo "Done when" de B1.x e B2.1 roda `npx vitest run --exclude tests/unit/data/published-schemas.test.ts`; `published-schemas.test.ts` volta e TEM de passar em B2.2; nenhum e2e roda na janela. Janela ABERTA: anotar aqui e no HANDOFF.

---

## Backend

Pipeline `tools/dataset/` (Node 24 + tsx) e contrato `src/data/`. Sprint S0 (pre-voo) e a primeira fase.

### Sprint S0 - Pre-voo (linha de base antes de qualquer mudanca)

> roda a suite completa, o build, o pipeline e a auditoria no branch atual SEM nenhuma mudanca de codigo, para separar flake preexistente de regressao (LESSONS 2026-09-29, CA-59) e congelar as medidas de partida.

- [x] **S0.1 - Linha de base completa** (categoria: outro)
  - Done when: STATE e checklist com os 9 passos e os numeros; `git status` sem mudanca de codigo.
  - commit:
  - status: concluida (numeros em Notas por fase e no STATE)

### Sprint B1 - Contrato, regra dos jogos e juncao

> congela o contrato (jogos por especie, catalogo, geracao nos nos), cria o modulo de jogos com o recorte curado capturado da PokeAPI e liga tudo no `write`.

- [x] **B1.1 - Contrato do dataset (tipos, zod, geracao nos nos, placeholders e fixtures)** (categoria: estrutura)
  - Done when: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde (inclui `join.test.ts`, que roda o pipeline com os placeholders e valida contra o schema novo); pipeline de teste (regra geral) roda sem erro e TODO no de `species/*.json` gerado tem `generation` igual ao `generation` da especie do no no indice gerado (script node inline sobre `_pg_pub`); janela quebrada ABERTA anotada no checklist e no HANDOFF (nenhum e2e ate B2.2).
  - commit: 64e0b4f1
  - status: concluida (janela quebrada aberta)

- [x] **B1.2 - Regra dos jogos e recorte curado da PokeAPI** (categoria: build)
  - Done when: o JSON existe, passa em `gameSnapshotSchema`, `deriveGames` devolve os 22 jogos da secao 5.3 na mesma ordem (script node inline via `npx tsx -e`), `kanto.species` = 1..151, `pokemonSpeciesIds` = 1..1025; segunda execucao sem `--fresh` faz 0 requisicoes (contar no log/cache) e gera o mesmo conteudo exceto `capturedAt`; `npm run typecheck`/`lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde; `git grep -n "games/snapshot" -- tools/dataset/src ':!tools/dataset/src/games'` vazio (nenhum modulo do pipeline importa o coletor nem o CLI; a palavra "snapshot" sozinha ja aparece em `species/collect.ts`, `forms.ts` e `spawns.ts` e nao serve de criterio).
  - commit: 11423420
  - status: concluida

- [x] **B1.3 - Jogos por especie e catalogo no dataset** (categoria: build)
  - Done when: pipeline de teste (regra geral); em `_pg_pub/data/<versao>/`: Zubat, Crobat, Tyrogue, Hitmonlee, Charizard, Piglich e Creepyon iguais a secao 5.3 (script inline); `manifest.games` = 22 entradas da secao 5.3 na ordem; contagem por jogo do report igual a coluna "especies" da secao 5.3 (anotar no checklist; divergencia = parar); `officialWithoutGame` = `[]`, `packOnly` = `[9901, 9902]`; ultima entrada de `sources` canonica; `report.json` sem aviso novo; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde.
  - commit: 89c1b8cf
  - status: concluida

### Sprint B2 - Auditoria e publicacao

> auditoria independente dos campos novos e republicacao com provas de paridade, determinismo, "so acrescimos" e orcamento.

- [x] **B2.1 - Auditoria com geracao dos nos e fatos de jogos** (categoria: outro)
  - Done when: `run.ts` contra `_pg_pub` imprime `divergencias {}` com `checks` > 46.768 e com pelo menos 1027 x 2 + (numero total de nos) + 4 checks novos; `npx vitest run tests/unit/dataset/audit.test.ts` verde (testes existentes inalterados); Rodada 7 no `AUDIT_REPORT.md`.
  - commit: f7ba7273
  - status: concluida

- [x] **B2.2 - Republicacao, provas e HANDOFF** (categoria: build)
  - Done when: `current.json` com `datasetVersion` nova (diferente de `atm1.3.0-cobblemon1.7.3-20260930-1949ea67`); passos 1 a 7 verdes; numeros no HANDOFF e no STATE.
  - commit: a4d1cf4e
  - status: concluida (janela quebrada fechada; frontend liberado)

### Sprint T1 (backend) - Testes de dataset, contrato publicado e orcamento

> unitarios do modulo de jogos e da auditoria, contrato publicado, orcamento, regras puras e RTL, e2e headless e regressao completa.

- [x] **T1.1 - Modulo de jogos (regra, recorte, coletor, CLI) e auditoria** (categoria: outro)
  - Done when: `npx vitest run tests/unit/dataset/game-availability.test.ts tests/unit/dataset/audit.test.ts` verde; cobertura de `tools/dataset/src/**` >= 80/80.
  - commit: 4bc9dc74
  - status: concluida

- [x] **T1.2 - Contrato publicado, juncao e orcamento do precache** (categoria: outro)
  - Done when: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
  - commit: bdda90a3
  - status: concluida

---

## Frontend

App React em `src/`. Referencia visual: UISPEC secoes 3 a 7 e `ui-refs/`. So comeca depois de B2.2 verde.

### Sprint F1 - Selo de geracao (card, Capturados, Hero)

> textos PT/EN, rotulos e componente do selo, card com geracao no lugar da raridade, Hero com geracao + raridade.

- [x] **F1.1 - Textos i18n** (categoria: frontend)
  - Done when: `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts tests/unit/ui-foundation/i18n.test.tsx` verde; `npm run lint` e `npm run typecheck` limpos; captura headless `after-f11-dex-pt.png` da Dex sem nenhuma mudanca visual (as chaves ainda nao sao usadas).
  - commit: 6b398719
  - status: concluida

- [x] **F1.2 - Rotulo e componente do selo de geracao** (categoria: frontend)
  - Done when: `npm run typecheck`/`lint` limpos; `npx vitest run tests/unit/ui-screens` verde (nenhum teste usa o componente ainda, prova que `Badge` sem `label` nao mudou nada); captura headless `after-f12-dex-pt.png` igual a `dex-cards-desktop.png` (sem mudanca visual).
  - commit: 94e4f6c7
  - status: concluida

- [x] **F1.3 - Geracao no card no lugar da raridade e no Hero** (categoria: frontend)
  - Done when: capturas `after-f13-dex-{desktop,phone}.png` (comparar com `dex-cards-*.png`), `after-f13-captured-{desktop,phone}.png` (com `captured-*.png`, semeando o IndexedDB como `tests/e2e/captured.spec.ts:39-43`), `after-f13-hero-{mewtwo,charizard}-{desktop,phone}.png` (com `detail-hero-*.png`), `after-f13-dex-meltan-phone.png` (card do 808 a 360); no spec temporario: cards 41/169/808/899/9901 com "Gen 1"/"Gen 2"/"Gen 7 (Let's Go)"/"Gen 8 (Arceus)"/"Pack"; nenhuma classe de raridade em `.pcard`; `npx vitest run tests/unit/ui-screens/pokemon-card.test.tsx tests/unit/ui-screens/detail-hero.test.ts` verde; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts` verde (com os 3 ajustes e nenhum outro assert mexido).
  - commit: cd8979f1
  - status: concluida

### Sprint F2 - Geracao na cadeia de evolucao

> selo em cada estagio, destaque nao cromatico quando difere da raiz.

- [x] **F2.1 - Selo de geracao no EvoNode** (categoria: frontend)
  - Done when: capturas `after-f21-evo-zubat-{desktop,phone}.png` e `after-f21-evo-tyrogue-{desktop,phone}.png` (comparar com `detail-evolution-*.png`), `after-f21-evo-pichu-desktop.png`, `after-f21-evo-eevee-phone.png`; no spec temporario: Zubat/Golbat sem `.evo-gen-diff`, Crobat com; Tyrogue (raiz gen2) sem, Hitmonlee e Hitmonchan (gen1) com destaque, Hitmontop (gen2) sem (esperado DERIVADO no spec do `generation` de cada no da ficha publicada, nunca lista a mao, LESSONS 2026-09-29); Pichu sem, Pikachu e Raichu com; Charmander/Charmeleon/Charizard sem nenhum; `aria-label` do Crobat = "Geração 2, diferente da base"; `expectNoOverlap("#evo-panel")` a 360/390/1280 PT e EN para 41, 236, 172, 133 e 6; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/detail.spec.ts tests/e2e/navigation.spec.ts` verde sem mudar assert.
  - commit: 74a6032e
  - status: concluida

### Sprint F3 - Jogos (filtro, painel) e credito

> select "Jogo" na Pokedex, painel "Jogos" no Detail, credito da PokeAPI.

- [x] **F3.1 - Filtro por jogo na Pokedex** (categoria: frontend)
  - Done when: capturas `after-f31-filters-{desktop,desktop-en,phone}.png` (comparar com `dex-filters-*.png`), `after-f31-frlg-desktop.png` (Jogo = FireRed / LeafGreen), `after-f31-frlg-gen2-empty.png`; no spec temporario: `#dex-count` = 151 com FRLG, opcoes do `#f-game` = "Todos" + os 22 nomes do manifest na ordem, Voltar do Zubat mantem FRLG; `expectNoOverlap("#filters")` a 360/390/1280 PT e EN; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/dex.spec.ts tests/e2e/navigation.spec.ts` verde; `npx vitest run tests/unit/ui-screens/dex-filter.test.ts tests/unit/ui-screens/dex-screen.test.tsx` verde sem mudar assert.
  - commit: 66cc9532
  - status: concluida

- [x] **F3.2 - Painel "Jogos" no Detail** (categoria: frontend)
  - Done when: capturas `after-f32-games-zubat-{desktop,phone}.png`, `after-f32-games-crobat-desktop.png`, `after-f32-games-piglich-desktop.png`, `after-f32-games-zubat-en-phone.png` (comparar com `detail-where-zubat-*.png`: mesma identidade de painel); no spec temporario: `#games-panel` logo depois de `#where-panel` no DOM; Zubat inclui `[data-game='firered-leafgreen']`, Crobat nao; 9901 mostra `[data-games='pack']` "Só no pack"; nota presente so com lista; `expectNoOverlap("#games-panel")` e `scrollWidth <= clientWidth` do `#main` a 360/390/1280 PT/EN; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/detail.spec.ts` verde.
  - commit: e2f49362
  - status: concluida

- [x] **F3.3 - Credito da PokeAPI (Configuracoes e README)** (categoria: frontend)
  - Done when: capturas `after-f33-credits-{desktop,phone}.png` (comparar com `settings-credits-*.png`); `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/settings.spec.ts` verde; `npx vitest run tests/unit/ui-screens/settings-screen.test.tsx` verde.
  - commit: 043dc2ea
  - status: concluida

### Sprint F4 - Limpeza e baseline visual

> varredura de codigo morto com protocolo seguro e revisao das 7 baselines visuais do Detail do Charizard.

- [x] **F4.1 - Varredura de codigo morto** (categoria: outro)
  - Done when: relatorio no checklist (candidato, referencias encontradas, decisao); suite + build verdes.
  - commit: sem commit de codigo (nada removido; relatorio abaixo)
  - status: concluida

- [x] **F4.2 - Baselines visuais do Detail do Charizard** (categoria: outro)
  - Done when: os 14 testes visuais verdes; diff de snapshots = 7 arquivos.
  - commit: 3072a77c
  - status: concluida

### Sprint T1 (frontend) - Testes de regras puras, RTL, e2e headless e regressao final

> unitarios do modulo de jogos e da auditoria, contrato publicado, orcamento, regras puras e RTL, e2e headless e regressao completa.

- [x] **T1.3 - Regras puras e RTL (selo, cadeia, filtro, painel, credito)** (categoria: outro)
  - Done when: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70 e global >= 80/80.
  - commit: f9bfe94d
  - status: concluida

- [x] **T1.4 - e2e headless (Dex, Capturados, Detail, temas, Configuracoes, offline)** (categoria: outro)
  - Done when: `npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts tests/e2e/settings.spec.ts tests/e2e/pwa-offline.spec.ts tests/e2e/responsive.spec.ts tests/e2e/navigation.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
  - commit: f514e80f
  - status: concluida

- [x] **T1.5 - Regressao completa contra a linha de base** (categoria: outro)
  - Done when: os 7 passos verdes e os numeros (testes, cobertura, checks da auditoria, bytes gzip) no STATE.
  - commit: sem codigo (SPEC: so docs); numeros no STATE
  - status: concluida

---

## Notas por fase

### S0.1 - Linha de base (2026-10-12)

- HEAD `ff3fbfab` (codigo `979fc78f`), status so `?? .vite/`. typecheck e lint limpos.
- vitest --coverage: 88 arquivos, 744 testes, 0 falhas. Cobertura linhas/branches: global 94,39/87,76; domain 99,61/98,11; storage 96,77/90,95; sync 99,50/92,01; tools/dataset/src 93,86/84,67; components 93,99/92,42; screens 94,73/88,05.
- build ok; dist/sw.js 6.467 bytes; precache de dado = current.json + {dataset-manifest,species-index,type-chart}.json da versao 1949ea67.
- e2e (build + preview, headless): 269 = 253 ok + 16 pulados (dev-only), 0 falha, 0 flaky; os 7 visuais de responsive.spec.ts:186 (14 comparacoes) ok. LINHA DE BASE: nenhuma falha preexistente.
- Dataset regerado offline: sufixo 1949ea67 igual, 1044 arquivos, 0 diferencas.
- Gzip precache: 91 + 913 + 36.200 + 547 = 37.751 (teto 47.991).
- Auditoria: 46.768 checks, 1027 especies, 0 divergencias.
- Ambiente: build (prebuild gen:assets) regrava 17 arquivos de tipo so com LF (sem diff de conteudo); restaurar com git checkout depois de cada build. Rodada e2e com 246 "worker exited 0xC0000142" foi falha de processo do Windows, repetida limpa.


### B1.1 - BLOQUEADA (2026-10-12)

- Tipos (5.1), zod (5.2), `generation` em `buildChain`, placeholders do `index-writer` e as 10 fixtures da lista aplicados. `npm run lint` limpo; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` = 87 arquivos, 730 testes, 0 falhas (inclui join.test.ts com o schema novo).
- `npm run typecheck` FALHA fora do escopo do backend: `src/screens/Detail/EvolutionPanel.tsx:190` monta um no sintetico `{ dex, slug, name, types: [] }` (fallback de `EvolutionChainView`) que deixa de ser `EvolutionChainNode` quando `generation: string` vira obrigatorio; erros TS2322 nas linhas 202, 204, 216 e 246. A SPEC so trata esse fallback em F2.1 passo 1 (`ChainNodeView` + `generation: null`), mas exige typecheck limpo ja em B1.1. Tela React e do Frontend: nao mexido.
- Proposta: antecipar para B1.1 SO o passo 1 de F2.1 (tipo local `ChainNodeView = Omit<EvolutionChainNode, "generation"> & { generation: string | null }` no fallback e na prop de `EvoNode`), sem efeito visual; ou o orquestrador autorizar outra saida. B1.2 (modulo de jogos) ja tem rascunho e a captura da PokeAPI foi testada com sucesso (22 jogos iguais a SPEC 5.3, 123 GETs), mas nada disso foi commitado.

### B1.1 - desbloqueada e concluida (2026-10-12)

- Decisao do orquestrador (opcao a, SPEC revisada em 8cfc236c): F2.1 passo 1 antecipado, so tipo: `ChainNodeView` local em `EvolutionPanel.tsx` (prop do `EvoNode`) e `generation: null` no no sintetico do fallback. Nada mais mexido no arquivo.
- typecheck e lint limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` = 87 arquivos, 730 testes, 0 falhas; pipeline de teste em `_pg_pub` (versao `-715d43b3`): 1027 fichas, 2316 nos, 0 nos com `generation` diferente do indice.
- JANELA QUEBRADA ABERTA desde este commit: `published-schemas.test.ts` excluido e nenhum e2e ate B2.2 (o app rejeita o manifest publicado sem `games`).

### B1.2 - concluida (2026-10-12)

- Recorte capturado com `npm run dataset:snapshot-games -- --fresh`: 32 version-groups, 35 Pokedexes, 1025 especies, 123 URLs, 123 requisicoes de rede; `capturedAt` 2026-10-12T05:08:37.859Z; arquivo 132.314 bytes (pretty).
- `deriveGames`: 22 jogos na ordem da SPEC 5.3 (ids 1,2,3,4,5,6,7,8,9,10,11,14,15,16,17,18,19,20,23,24,25,30); `kanto.species` = 1..151; `pokemonSpeciesIds` = 1..1025.
- 2a execucao sem `--fresh` (`--out` no scratchpad): 0 requisicoes de rede, conteudo igual exceto `capturedAt`.
- typecheck/lint limpos; vitest (sem published-schemas) 87 arquivos / 730 testes verdes; `git grep -n "games/snapshot" -- tools/dataset/src ':!tools/dataset/src/games'` vazio; sem travessao no recorte.

### B1.3 - concluida (2026-10-12)

- Pipeline de teste `_pg_pub` (`-20261012-...`): Zubat, Crobat, Tyrogue, Hitmonlee, Charizard, 9901 e 9902 iguais a SPEC 5.3 no indice e na ficha (`games` ultima chave do resumo, logo depois de `artworkId`); cadeia do Zubat 41:gen1 42:gen1 169:gen2.
- `manifest.games` = 22 entradas da SPEC 5.3 na ordem (ultima chave). Ultima entrada de `sources` canonica: `{ file: tools/dataset/curated/pokeapi-game-availability.json, sizeBytes: 46877, mtime: 2026-10-12T05:08:37.859Z }` (12 sources).
- Report `games.perGame` = coluna "especies" da SPEC 5.3 inteira (151, 151, 251, 251, 202, 202, 151, 151, 210, 256, 156, 301, 457, 211, 302, 403, 153, 584, 151, 242, 664, 364); `packOnly` [9901, 9902]; `officialWithoutGame` [].
- report.json: 190 avisos, identicos (codigo + mensagem) aos de uma execucao com o index-writer de antes (nenhum aviso novo).
- typecheck/lint limpos; vitest (sem published-schemas) 87 / 730 verdes.

### B2.1 - concluida (2026-10-12)

- `run.ts` contra `_pg_pub` (`-20261012-78568233`): `checks 51146, especies 1027, divergencias {}` (46.768 + 4.378 novos = 2.316 nos + 1027 x 2 + 8 do catalogo).
- `npx vitest run tests/unit/dataset/audit.test.ts` = 16/16 (existentes inalterados); suite sem published-schemas 87 / 730 verde. Rodada 7 escrita no topo do `AUDIT_REPORT.md`.

### B2.2 - concluida (2026-10-12)

- Passo 1 so acrescimos (contra `...-1949ea67`, antes de publicar): mesma lista de 1044 arquivos; 15 iguais byte a byte; indice, fichas e manifest iguais sem os campos novos; `sources` antigo = prefixo (11 -> 12); geracoes 151/100/135/107/156/72/86/2/89/7/120/2.
- Passo 2: publicado `atm1.3.0-cobblemon1.7.3-20261012-78568233` (`current.json` atualizado; `...-1949ea67` removida; `public/assets` intocado).
- Passo 3 determinismo: 2a execucao em `_pg_again` = mesma versao, 1044 arquivos iguais (manifest so `generatedAt`).
- Passo 4 gzip: 88 + 1.434 + 38.336 + 547 = 40.405 (<= 47.991).
- Passo 5 auditoria no publicado: 51.146 checks, 0 divergencias.
- Passo 6 janela FECHADA: published-schemas + join = 47 testes verdes; `npx vitest run` = 88 / 744 verde.
- Passo 7: build ok (SW precache com a versao nova); `npx playwright test` = 253 ok, 16 pulados, 0 falha, 0 flaky (igual a S0.1); visuais ok sem atualizar baseline.
- HANDOFF_backend.md escrito (contrato real, numeros, desvio F2.1 passo 1 antecipado).

### T1.1 - concluida (2026-10-12)

- `tests/unit/dataset/game-availability.test.ts` (19 testes): loadGameSnapshot (ausente/JSON quebrado/campo extra); deriveGames no recorte REAL contra a regra reimplementada no teste, exclusoes, DLC fundido, conjuntos iguais separados, nome FRLG, ordem; sinteticos (desempate por id, espelho quebrado nos dois sentidos, Pokedex inexistente, id duplicado, nenhum jogo); FRLG = kanto (1..151), Zubat/Golbat sim, Crobat nao, Hitmonlee sim, Tyrogue nao; custom null / custom colidindo / oficial fora / oficial sem jogo; sem rede no build (fetch trocado nunca chamado); coletor com msw (objeto esperado, urls ordenadas, `source.api` real, 0 requisicoes com cache, paginacao, sem nome EN, espelho, 404, URL de especie fora do padrao); CLI (`parseSnapshotArgs`, `runSnapshotCli` com cliente injetado e `--out`); separacao do coletor, scripts npm, origem e segredos.
- `tests/unit/dataset/audit.test.ts`: novo describe com 2 testes (copia limpa sem divergencia nos checks novos e checks >= 46.768 + 1027 x 2 + nos + 4; adulteracoes -> lista exata de WRONG DATA; catalogo sem jogo -> MISSING e ids fora -> EXTRA; sem catalogo -> MISSING). Testes existentes inalterados.
- `npx vitest run --coverage`: 89 arquivos / 765 testes verdes; `tools/dataset/src` 93,84 / 85,18 (availability 100/98,68, snapshot 94,25/92,85, snapshot-cli 74,19/76,92: so o caminho de rede real e a guarda de execucao direta ficam fora). Global 94,37 / 87,93.

### T1.2 - concluida (2026-10-12)

- `published-schemas.test.ts`: novo `it` (ficha 41 e manifest passam sem campo descartado; campo extra em `games[0]`, manifest sem `games`, entrada do indice sem `games`, `games: [1.5]` e `[0]`, no sem `generation` rejeitados; `games: null` e `[]` passam). Existentes inalterados.
- `join.test.ts`: novo describe com 4 testes sobre o pipeline em pasta temporaria (catalogo = regra reimplementada sobre o recorte; `games` de TODA especie = derivado por numero; `null` sse custom; indice = ficha; todo no com a geracao da especie; contagem de geracoes = `buildExpected()` da auditoria; ultima `sources` canonica; versao diferente de `...-1949ea67`).
- `precache-budget.test.ts` (novo): `BASELINE_GZIP` 91/913/36.200/547 (= 37.751) e crescimento <= 10.240 (hoje +2.654); glob de dado do `vite.config.ts` fixado.
- `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` = 22 arquivos / 293 testes verdes. Suite inteira: 90 arquivos / 772 testes; 3 execucoes, 1 com falha no teste de tempo preexistente `tests/unit/domain/bait.test.ts:106` (worst 5,17 ms > 5 ms sob carga paralela), ver Bugs.

### F1.1 - concluida (2026-10-12)

- Chaves novas (valores exatos da SPEC): `dex.game`, `dex.genBadge`, `dex.genBadge7b`, `dex.genBadge8a`, `dex.genBadgePack`; `detail.genDiff`, `detail.games`, `games.availableIn`, `games.note`, `games.none`, `games.packOnly`; `settings.pokeapi`.
- `i18n-modules.test.ts` + `i18n.test.tsx` = 14/14; lint e typecheck limpos.
- Captura `ui-refs/impl/after-f11-dex-pt.png` (dev 4179, headless, 1366x768): igual a `dex-cards-desktop.png`, 0 erro de console. Capturas do frontend ficam em `ui-refs/impl/` (pedido do orquestrador; a SPEC dizia `ui-refs/`).

### F1.2 - concluida (2026-10-12)

- `src/screens/Dex/GenerationBadge.tsx` (`generationLabel`, `GenerationBadge`, `GenerationForm`); `Badge` ganhou `label?` (role="img" + aria-label so com label); `.badge-gen` em `components.css` (`--secondary-soft` + `--text`).
- typecheck/lint limpos; `npx vitest run tests/unit/ui-screens` = 38 arquivos / 262 testes verdes.
- `after-f12-dex-pt.png` byte a byte igual a `after-f11-dex-pt.png` (que bate com `dex-cards-desktop.png`): sem mudanca visual.

### F1.3 - concluida (2026-10-12)

- `SpeciesBadges` com `variant` ("card": especial + geracao curta; "hero": especial + geracao longa + raridade); `HeroCard.hasSeal` conta a geracao. `RARITY_BADGE`/`specialLabel` intocados.
- 3 ajustes de assert da SPEC 2.7 (pokemon-card.test.tsx, detail.spec.ts:82, dex.spec.ts:114), nenhum outro assert mexido.
- Spec temporario: cards 41/169/808/899/9901 = "Gen 1"/"Gen 2"/"Gen 7 (Let's Go)"/"Gen 8 (Arceus)"/"Pack"; 0 classe de raridade em `.pcard` (Dex desktop/phone e Capturados com 6 semeados); Hero Mewtwo = Lendario + "Geração 1" + Ultra-raro; Charizard = "Geração 1" + Ultra-raro; 0 erro de console. Capturas `after-f13-*` (9) conferidas com `dex-cards-*`, `captured-*`, `detail-hero-*`: mesmas metricas do selo que substitui.
- vitest pokemon-card + detail-hero = 8/8; `PW_DEV=1 PW_PORT=4179` dex + detail + captured = 71/71.

### F2.1 - concluida (2026-10-12)

- Passo 1 ja estava feito (B1.1): `ChainNodeView` + `generation: null` no fallback conferidos. Passos 2 a 4: `rootGeneration` em toda chamada de `EvoNode`; `.evo-label` (nome + `badge badge-gen evo-gen`), `evo-gen-diff` com outline `--secondary` (`--primary` em green/blue/purple, D2), aria-label longo / "..., diferente da base".
- Spec temporario (esperado DERIVADO do `generation` dos nos da ficha publicada): Zubat/Golbat sem destaque, Crobat com; Tyrogue sem, Hitmonlee e Hitmonchan com, Hitmontop sem; Pichu sem, Pikachu e Raichu com (a cadeia do Pichu tem 2 nos 26: Raichu e Raichu de Alola, ambos destacados); Charmander/Charmeleon/Charizard sem; aria-label do Crobat "Geração 2, diferente da base"; `expectNoOverlap("#evo-panel")` 360/390/1280 PT e EN para 41, 236, 172, 133, 6 ok; 0 erro de console.
- Capturas `after-f21-*` (6) conferidas com `detail-evolution-*`: selo em fluxo abaixo do nome, sem sobrepor sprite, caixa ~22 px mais alta.
- `PW_DEV=1 PW_PORT=4179` detail + navigation = 55/55 sem mudar assert; vitest ui-screens verde.

### F3.1 - concluida (2026-10-12)

- `DexFilters.game` (default null), `filterSpecies` com `games.includes` (E logico), `#f-game` irmao logo depois de `#f-gen` ("Todos" + `manifest.games`), desktop `1fr 1fr 1fr 1fr auto`; fixtures `game: null` em dex-filter.test.ts e dex-screen.test.tsx (so dado).
- Spec temporario: opcoes = "Todos" + 22 nomes do manifest na ordem; FRLG -> `#dex-count` 151; FRLG + Geracao 2 -> EmptyState; Voltar do Zubat mantem FRLG (valor 7) e 151; `expectNoOverlap("#filters")` + sem scroll horizontal 360/390/1280 PT/EN; 0 erro de console.
- Capturas `after-f31-*` (5) conferidas com `dex-filters-*`: mesmos selects/rotulos; phone Geracao | Jogo, Evolucao | Ordenar, Status linha inteira.
- vitest dex-filter + dex-screen = 16/16 sem mudar assert; `PW_DEV=1` dex + navigation = 14/14.

### F3.2 - concluida (2026-10-12)

- `GamesPanel.tsx` (`gamesOf`, `GamesPanel`) logo depois do `WherePanel`, `--i` 7; best 8, forms 9, calc 10. CSS `.games-list`, `.game-chip`, `.games-note`, `.games-empty`.
- Revisao 2026-10-12 (commit ccf49cb4): painel movido para depois de weak a pedido do usuario; ordem e `--i`: stats 1, weak 2, games 3, evo 4, abilities 5, moves 6, where 7, best 8, forms 9, calc 10. `detail.spec.ts` reapontado (`weak-panel` + 1 = `games-panel`, `games-panel` + 1 = `evo-panel`); 7 `detail-charizard-*` regravados, `home-*` intocados; vitest 93/800, e2e inteiro 276 ok / 16 pulados / 0 falha (1a rodada: 1 falha em `home.spec.ts:241`, reload logo apos o desfazer do time, 5/5 isolado e verde na 2a rodada inteira; Home nao tocada); capturas `ui-refs/impl/detail-41-games-after-weak-{d,p}.png`.
- Spec temporario: `#games-panel` logo depois de `#where-panel`; Zubat = jogos do manifest com o id na ficha, na ordem, inclui `firered-leafgreen`, com nota; Crobat sem FRLG; 9901 `[data-games='pack']` "Só no pack" sem nota; EN "Games"; `expectNoOverlap("#games-panel")` + sem scroll horizontal do `#main` 360/390/1280 PT/EN (41 e 9901); 0 erro de console.
- Capturas `after-f32-*` (5) conferidas com `detail-where-zubat-*`: mesma identidade de painel (h3 + barra, `.k`, chips como `.method`).
- `PW_DEV=1` detail.spec.ts = 53/53 (ver Bugs: 1a rodada com 1 falha de HMR do dev server, nao regressao).

### F3.3 - concluida (2026-10-12)

- `<InfoLine testId="pokeapi" text={t("settings.pokeapi")} />` logo depois de `settings.images` (texto existente intocado); README linhas 29 e 116 ajustadas sem apagar creditos.
- Spec temporario: `[data-info='pokeapi']` PT "Jogos de cada Pokémon: PokeAPI (recorte no build)" e EN; capturas `after-f33-credits-{desktop,phone}.png` conferidas com `settings-credits-*` (mesma `.info-line`); 0 erro.
- `PW_DEV=1` settings.spec.ts = 14/14; settings-screen.test.tsx = 11/11.

### F4.1 - concluida (2026-10-12): varredura de codigo morto

Protocolo: `git grep -n` em `src`, `tests`, `tools` (inclui CSS), sem contar o spec temporario. Nada removido.

| candidato | referencias vivas | decisao |
|---|---|---|
| `RARITY_BADGE` | `WherePanel.tsx:15,73`, `PokemonCard.tsx:46` (variant hero) | kept: still referenced by WherePanel.tsx e SpeciesBadges (Hero) |
| ramo de raridade de `SpeciesBadges` | `HeroCard.tsx` (`variant="hero"`) | kept: Hero |
| chaves `rarity.common/uncommon/rare/ultra/legendary/mythical` | `RARITY_BADGE` (key), `PokemonCard.tsx:52` (`rarity.${special}`) | kept: Hero, WherePanel, selo especial |
| CSS `.badge-common/-uncommon/-rare/-ultra` | `RARITY_BADGE`, `ItemScreen.tsx:182,401`, `item.css:57` | kept: Hero/WherePanel/Item |
| `.pcard-top .badge` (`dex.css:25,26,48`) | selo de geracao e especial no card | kept |
| `genLabel`, `dex.genCustom` | `DexFilters.tsx:105`, `dex-screen.test.tsx:108` | kept: filtro `#f-gen` (RF-18) |
| classe `seal-empty` | `HeroCard.tsx:186` (alcancavel com geracao desconhecida e sem raridade/especial) | kept (sem regra CSS, fato preexistente) |

Suite + build: nenhum arquivo mudou nesta feature; o verde de F3.3 vale (rodada completa em T1.5).

### F4.2 - concluida (2026-10-12)

- 1a rodada `PW_DEV=1 ... -g "Home and Charizard detail screenshots"`: os 7 `home-*` passaram; `detail-charizard-{classic,blue,white,orange}` falharam (selo "Geração 1" no Hero e "GEN 1" nos 3 estagios); black/green/purple passaram dentro dos 2% de tolerancia.
- Revisados os actual/novos de classic, black e purple: so o selo de geracao no Hero e nos estagios mudou (o painel Jogos fica abaixo da dobra no print de 1280x800).
- DESVIO de comando: `--update-snapshots` (modo "changed") so regravaria os 4 que falharam e deixaria 3 baselines sem o selo. Usado `--update-snapshots=all` limitado ao teste + `git checkout` dos 7 `home-*` (regravados sem mudanca visual); diff final = exatamente os 7 `detail-charizard-*`. 2a rodada sem update: 7/7 (14 comparacoes) verdes.

### T1.3 - concluida (2026-10-12)

- Novos: `generation-badge.test.tsx` (7: tabela RF-05/RF-08 PT/EN, gen10, desconhecido -> null/sem selo, toda geracao do indice publicado com rotulo, `PokemonCard` das 1027 especies com o selo esperado e sem classe de raridade, ordem card/hero, `Badge` sem label = HTML de antes); `detail-generation.test.tsx` (7: cadeias reais 41/169/236/172/4/133 com destaque DERIVADO do `generation` dos nos, aria-label PT/EN, indice ausente, no sintetico, nenhum texto de jogo; Hero Charizard/Mewtwo/9901 e `seal-empty`); `games-panel.test.tsx` (7: `gamesOf`, lista semantica com `aria-labelledby`, Crobat/Hitmonlee/Tyrogue, "Só no pack", "Não aparece nos jogos oficiais", manifest nulo, EN).
- Blocos novos no fim de `dex-filter.test.ts` (3: game null = antes, E logico, custom nunca, indice real FRLG = 151 e mediana de 20 < 5 ms), `dex-screen.test.tsx` (3: `#f-game` por label, opcoes, grava `filters.game`, sem catalogo, restaurado da pilha) e `settings-screen.test.tsx` (1: `data-info=pokeapi` PT/EN). Nenhum teste existente mexido.
- `npx vitest run tests/unit/ui-screens` = 41 arquivos / 290 testes. `npx vitest run --coverage` inteiro = 93 arquivos / 800 testes verdes; cobertura linhas/branches: global 94,48/88,29; `src/screens/**` 94,99/89,17; `tools/dataset/src/**` 93,85/85,18 (limites 80/80, 70/70).

### T1.4 - concluida (2026-10-12)

- Retomada por agente novo (o frontend #1 parou no limite de 1h com os blocos ja escritos e sem commit). Blocos revisados contra os passos 1 a 5 da SPEC; esperados derivados do indice/manifest/ficha publicados via `fetch`.
- Novos: `dex.spec.ts` describe `pokemon-generation: generation seal and game filter` (CA-01, CA-03..CA-06, CA-25, CA-44, CA-46..CA-53, CA-64); `detail.spec.ts` describe `pokemon-generation: hero, chain, games panel and themes` (CA-07..CA-09, CA-11..CA-16, CA-27, CA-28, CA-40..CA-43, CA-62); `captured.spec.ts` (CA-03), `settings.spec.ts` (CA-54), `pwa-offline.spec.ts` no describe F12.1 (CA-61). Nenhum teste existente mexido.
- DESVIO (CA-53 e o "foco visivel no #f-game" do CA-62): o "outline nao none" nao e verificavel porque todo `select` do app tem `outline: 0` (`components.css:118`, preexistente, igual no `#f-gen`). O teste confere Tab -> `:focus-visible`, label "Jogo" resolve o select, ArrowDown opera e a mesma regra de foco do `#f-gen`. Mudar o foco de todos os selects esta fora do escopo.
- Done when: 139 testes = 138 ok + 1 pulado (`detail.spec.ts:155`, so roda com PW_DEV, preexistente), 0 falha, 1,9 min. Spec temporario `zz-pokemon-generation-capture.spec.ts` apagado (capturas ficam em `ui-refs/impl/`). Nenhum PNG de baseline novo.

### T1.5 - concluida (2026-10-12)

- typecheck/lint limpos; vitest 93 arquivos / 800 testes, 0 falha (S0.1 88/744), limites de cobertura ok (global 94,47/88,30); build ok (`sw.js` 6.467 bytes, so a versao nova no precache); e2e inteiro 276 ok / 16 pulados / 0 falha / 0 flaky (S0.1 253/16/0); auditoria 51.146 checks, 0 divergencias; greps de segredo, `fetch(` em `src/screens` e U+2014 sem ocorrencia; `git diff main -- tests/` so com as mudancas permitidas (lista no STATE).
- Flake `bait.test.ts:106` nao reproduziu nesta rodada (vitest rodado sem e2e em paralelo). Segue registrado como preexistente, nao regressao.

---

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Correcao / commit |
|---|---|---|---|
| T1.2 (suite inteira) | `tests/unit/domain/bait.test.ts:106` ("buildBaitIndex and recommendBerries ... stay under 5 ms") falhou 1 de 3 rodadas da suite inteira: worst 5,17 ms > 5 ms. Isolado 3/3 verde; suite inteira 2/3 verde. | Assert de tempo de parede (pior chamada isolada) sensivel a carga: roda em paralelo com o pipeline real do `join.test.ts` (8 workers). O caminho medido (`recommendBerries`) nao le `games` nem `generation`. Nao reproduziu na S0 (2 rodadas). | Nao corrigido (fora do escopo do backend, assert nao afrouxado). Flake registrado para o T1.5 comparar; se voltar, investigar a causa (isolamento do teste de tempo), nunca subir o limite. |
| F3.2 (e2e dev) | `detail.spec.ts:155` ("unknown dex ... not-found", so PW_DEV) falhou 1 vez: `.ob-none` nao apareceu. | O teste navega por `import("/src/navigation/navigation-store.ts")` no page.evaluate; depois de editar `navigation/types.ts` (F3.1) com o mesmo dev server de pe, o HMR deixou uma instancia nova do modulo e a navegacao foi para outra store. Artefato do dev server reaproveitado, nao do codigo. | Dev server reiniciado: detail.spec.ts 53/53, o teste passou. Nada mudado no teste. |
