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

- [ ] **S0.1 - Linha de base completa** (categoria: outro)
  - Done when: STATE e checklist com os 9 passos e os numeros; `git status` sem mudanca de codigo.
  - commit:
  - status: pendente

### Sprint B1 - Contrato, regra dos jogos e juncao

> congela o contrato (jogos por especie, catalogo, geracao nos nos), cria o modulo de jogos com o recorte curado capturado da PokeAPI e liga tudo no `write`.

- [ ] **B1.1 - Contrato do dataset (tipos, zod, geracao nos nos, placeholders e fixtures)** (categoria: estrutura)
  - Done when: `npm run typecheck` e `npm run lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde (inclui `join.test.ts`, que roda o pipeline com os placeholders e valida contra o schema novo); pipeline de teste (regra geral) roda sem erro e TODO no de `species/*.json` gerado tem `generation` igual ao `generation` da especie do no no indice gerado (script node inline sobre `_pg_pub`); janela quebrada ABERTA anotada no checklist e no HANDOFF (nenhum e2e ate B2.2).
  - commit:
  - status: pendente

- [ ] **B1.2 - Regra dos jogos e recorte curado da PokeAPI** (categoria: build)
  - Done when: o JSON existe, passa em `gameSnapshotSchema`, `deriveGames` devolve os 22 jogos da secao 5.3 na mesma ordem (script node inline via `npx tsx -e`), `kanto.species` = 1..151, `pokemonSpeciesIds` = 1..1025; segunda execucao sem `--fresh` faz 0 requisicoes (contar no log/cache) e gera o mesmo conteudo exceto `capturedAt`; `npm run typecheck`/`lint` limpos; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde; `git grep -n "games/snapshot" -- tools/dataset/src ':!tools/dataset/src/games'` vazio (nenhum modulo do pipeline importa o coletor nem o CLI; a palavra "snapshot" sozinha ja aparece em `species/collect.ts`, `forms.ts` e `spawns.ts` e nao serve de criterio).
  - commit:
  - status: pendente

- [ ] **B1.3 - Jogos por especie e catalogo no dataset** (categoria: build)
  - Done when: pipeline de teste (regra geral); em `_pg_pub/data/<versao>/`: Zubat, Crobat, Tyrogue, Hitmonlee, Charizard, Piglich e Creepyon iguais a secao 5.3 (script inline); `manifest.games` = 22 entradas da secao 5.3 na ordem; contagem por jogo do report igual a coluna "especies" da secao 5.3 (anotar no checklist; divergencia = parar); `officialWithoutGame` = `[]`, `packOnly` = `[9901, 9902]`; ultima entrada de `sources` canonica; `report.json` sem aviso novo; `npx vitest run --exclude tests/unit/data/published-schemas.test.ts` verde.
  - commit:
  - status: pendente

### Sprint B2 - Auditoria e publicacao

> auditoria independente dos campos novos e republicacao com provas de paridade, determinismo, "so acrescimos" e orcamento.

- [ ] **B2.1 - Auditoria com geracao dos nos e fatos de jogos** (categoria: outro)
  - Done when: `run.ts` contra `_pg_pub` imprime `divergencias {}` com `checks` > 46.768 e com pelo menos 1027 x 2 + (numero total de nos) + 4 checks novos; `npx vitest run tests/unit/dataset/audit.test.ts` verde (testes existentes inalterados); Rodada 7 no `AUDIT_REPORT.md`.
  - commit:
  - status: pendente

- [ ] **B2.2 - Republicacao, provas e HANDOFF** (categoria: build)
  - Done when: `current.json` com `datasetVersion` nova (diferente de `atm1.3.0-cobblemon1.7.3-20260930-1949ea67`); passos 1 a 7 verdes; numeros no HANDOFF e no STATE.
  - commit:
  - status: pendente

### Sprint T1 (backend) - Testes de dataset, contrato publicado e orcamento

> unitarios do modulo de jogos e da auditoria, contrato publicado, orcamento, regras puras e RTL, e2e headless e regressao completa.

- [ ] **T1.1 - Modulo de jogos (regra, recorte, coletor, CLI) e auditoria** (categoria: outro)
  - Done when: `npx vitest run tests/unit/dataset/game-availability.test.ts tests/unit/dataset/audit.test.ts` verde; cobertura de `tools/dataset/src/**` >= 80/80.
  - commit:
  - status: pendente

- [ ] **T1.2 - Contrato publicado, juncao e orcamento do precache** (categoria: outro)
  - Done when: `npx vitest run tests/unit/data tests/unit/dataset/join.test.ts` verde.
  - commit:
  - status: pendente

---

## Frontend

App React em `src/`. Referencia visual: UISPEC secoes 3 a 7 e `ui-refs/`. So comeca depois de B2.2 verde.

### Sprint F1 - Selo de geracao (card, Capturados, Hero)

> textos PT/EN, rotulos e componente do selo, card com geracao no lugar da raridade, Hero com geracao + raridade.

- [ ] **F1.1 - Textos i18n** (categoria: frontend)
  - Done when: `npx vitest run tests/unit/ui-shell/i18n-modules.test.ts tests/unit/ui-foundation/i18n.test.tsx` verde; `npm run lint` e `npm run typecheck` limpos; captura headless `after-f11-dex-pt.png` da Dex sem nenhuma mudanca visual (as chaves ainda nao sao usadas).
  - commit:
  - status: pendente

- [ ] **F1.2 - Rotulo e componente do selo de geracao** (categoria: frontend)
  - Done when: `npm run typecheck`/`lint` limpos; `npx vitest run tests/unit/ui-screens` verde (nenhum teste usa o componente ainda, prova que `Badge` sem `label` nao mudou nada); captura headless `after-f12-dex-pt.png` igual a `dex-cards-desktop.png` (sem mudanca visual).
  - commit:
  - status: pendente

- [ ] **F1.3 - Geracao no card no lugar da raridade e no Hero** (categoria: frontend)
  - Done when: capturas `after-f13-dex-{desktop,phone}.png` (comparar com `dex-cards-*.png`), `after-f13-captured-{desktop,phone}.png` (com `captured-*.png`, semeando o IndexedDB como `tests/e2e/captured.spec.ts:39-43`), `after-f13-hero-{mewtwo,charizard}-{desktop,phone}.png` (com `detail-hero-*.png`), `after-f13-dex-meltan-phone.png` (card do 808 a 360); no spec temporario: cards 41/169/808/899/9901 com "Gen 1"/"Gen 2"/"Gen 7 (Let's Go)"/"Gen 8 (Arceus)"/"Pack"; nenhuma classe de raridade em `.pcard`; `npx vitest run tests/unit/ui-screens/pokemon-card.test.tsx tests/unit/ui-screens/detail-hero.test.ts` verde; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts` verde (com os 3 ajustes e nenhum outro assert mexido).
  - commit:
  - status: pendente

### Sprint F2 - Geracao na cadeia de evolucao

> selo em cada estagio, destaque nao cromatico quando difere da raiz.

- [ ] **F2.1 - Selo de geracao no EvoNode** (categoria: frontend)
  - Done when: capturas `after-f21-evo-zubat-{desktop,phone}.png` e `after-f21-evo-tyrogue-{desktop,phone}.png` (comparar com `detail-evolution-*.png`), `after-f21-evo-pichu-desktop.png`, `after-f21-evo-eevee-phone.png`; no spec temporario: Zubat/Golbat sem `.evo-gen-diff`, Crobat com; Tyrogue (raiz gen2) sem, Hitmonlee e Hitmonchan (gen1) com destaque, Hitmontop (gen2) sem (esperado DERIVADO no spec do `generation` de cada no da ficha publicada, nunca lista a mao, LESSONS 2026-09-29); Pichu sem, Pikachu e Raichu com; Charmander/Charmeleon/Charizard sem nenhum; `aria-label` do Crobat = "Geração 2, diferente da base"; `expectNoOverlap("#evo-panel")` a 360/390/1280 PT e EN para 41, 236, 172, 133 e 6; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/detail.spec.ts tests/e2e/navigation.spec.ts` verde sem mudar assert.
  - commit:
  - status: pendente

### Sprint F3 - Jogos (filtro, painel) e credito

> select "Jogo" na Pokedex, painel "Jogos" no Detail, credito da PokeAPI.

- [ ] **F3.1 - Filtro por jogo na Pokedex** (categoria: frontend)
  - Done when: capturas `after-f31-filters-{desktop,desktop-en,phone}.png` (comparar com `dex-filters-*.png`), `after-f31-frlg-desktop.png` (Jogo = FireRed / LeafGreen), `after-f31-frlg-gen2-empty.png`; no spec temporario: `#dex-count` = 151 com FRLG, opcoes do `#f-game` = "Todos" + os 22 nomes do manifest na ordem, Voltar do Zubat mantem FRLG; `expectNoOverlap("#filters")` a 360/390/1280 PT e EN; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/dex.spec.ts tests/e2e/navigation.spec.ts` verde; `npx vitest run tests/unit/ui-screens/dex-filter.test.ts tests/unit/ui-screens/dex-screen.test.tsx` verde sem mudar assert.
  - commit:
  - status: pendente

- [ ] **F3.2 - Painel "Jogos" no Detail** (categoria: frontend)
  - Done when: capturas `after-f32-games-zubat-{desktop,phone}.png`, `after-f32-games-crobat-desktop.png`, `after-f32-games-piglich-desktop.png`, `after-f32-games-zubat-en-phone.png` (comparar com `detail-where-zubat-*.png`: mesma identidade de painel); no spec temporario: `#games-panel` logo depois de `#where-panel` no DOM; Zubat inclui `[data-game='firered-leafgreen']`, Crobat nao; 9901 mostra `[data-games='pack']` "Só no pack"; nota presente so com lista; `expectNoOverlap("#games-panel")` e `scrollWidth <= clientWidth` do `#main` a 360/390/1280 PT/EN; `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/detail.spec.ts` verde.
  - commit:
  - status: pendente

- [ ] **F3.3 - Credito da PokeAPI (Configuracoes e README)** (categoria: frontend)
  - Done when: capturas `after-f33-credits-{desktop,phone}.png` (comparar com `settings-credits-*.png`); `PW_DEV=1 PW_PORT=4179 npx playwright test tests/e2e/settings.spec.ts` verde; `npx vitest run tests/unit/ui-screens/settings-screen.test.tsx` verde.
  - commit:
  - status: pendente

### Sprint F4 - Limpeza e baseline visual

> varredura de codigo morto com protocolo seguro e revisao das 7 baselines visuais do Detail do Charizard.

- [ ] **F4.1 - Varredura de codigo morto** (categoria: outro)
  - Done when: relatorio no checklist (candidato, referencias encontradas, decisao); suite + build verdes.
  - commit:
  - status: pendente

- [ ] **F4.2 - Baselines visuais do Detail do Charizard** (categoria: outro)
  - Done when: os 14 testes visuais verdes; diff de snapshots = 7 arquivos.
  - commit:
  - status: pendente

### Sprint T1 (frontend) - Testes de regras puras, RTL, e2e headless e regressao final

> unitarios do modulo de jogos e da auditoria, contrato publicado, orcamento, regras puras e RTL, e2e headless e regressao completa.

- [ ] **T1.3 - Regras puras e RTL (selo, cadeia, filtro, painel, credito)** (categoria: outro)
  - Done when: `npx vitest run tests/unit/ui-screens` verde; cobertura `src/screens/**` >= 70/70 e global >= 80/80.
  - commit:
  - status: pendente

- [ ] **T1.4 - e2e headless (Dex, Capturados, Detail, temas, Configuracoes, offline)** (categoria: outro)
  - Done when: `npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts tests/e2e/settings.spec.ts tests/e2e/pwa-offline.spec.ts tests/e2e/responsive.spec.ts tests/e2e/navigation.spec.ts` (build + preview, headless) verde, incluindo TODOS os testes existentes desses arquivos.
  - commit:
  - status: pendente

- [ ] **T1.5 - Regressao completa contra a linha de base** (categoria: outro)
  - Done when: os 7 passos verdes e os numeros (testes, cobertura, checks da auditoria, bytes gzip) no STATE.
  - commit:
  - status: pendente

---

## Notas por fase


---

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Correcao / commit |
|---|---|---|---|
