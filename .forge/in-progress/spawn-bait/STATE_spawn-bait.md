---
feature: spawn-bait
stage: impl
status: in-progress
language: pt-BR
branch: feature/spawn-bait
mode: full
top_model: opus
running_agent: forge-imp-backend (opus, autonomous) - sprints B1 e B2 + testes T1.2/T1.3
baselines:
  CONTEXT: { commit: e76ec23a, deps: [IDEA_spawn-bait.md, tools/dataset/src/items/stage.ts, tools/dataset/src/items/categories.ts, tools/dataset/src/items/catalog.ts, tools/dataset/src/species/spawns.ts, tools/dataset/src/species/stage-derive.ts, tools/dataset/src/species/index-writer.ts, tools/dataset/src/context.ts, src/data/types.ts, src/data/schemas.ts, src/data/loaders.ts, src/screens/Detail/WherePanel.tsx, src/screens/Detail/detail.css, src/screens/Detail/ItemLink.tsx, src/screens/Item/ItemScreen.tsx, src/screens/Item/item-page-model.ts, src/screens/Items/item-model.ts, src/i18n/messages/detail.ts, src/i18n/messages/item.ts, tests/unit/data/published-schemas.test.ts, tests/unit/dataset/join.test.ts] }
  PRD:     { commit: e76ec23a, deps: [IDEA_spawn-bait.md, CONTEXT_spawn-bait.md] }
  UISPEC:  { commit: e76ec23a, deps: [src/screens/Detail/WherePanel.tsx, src/screens/Detail/detail.css, src/screens/Item/ItemScreen.tsx, src/screens/Item/item.css, src/styles/components.css, src/components/Badge.tsx, src/screens/Detail/ItemLink.tsx] }
  SPEC:    { commit: e76ec23a, deps: [PRD_spawn-bait.md, CONTEXT_spawn-bait.md, UISPEC_spawn-bait.md, data-source/README.md, data-source/atm-1.3.0/MANIFEST.json, src/data/schemas.ts, src/data/types.ts, src/i18n/messages/detail.ts, src/i18n/messages/item.ts, src/i18n/useT.ts, src/screens/Detail/ItemLink.tsx, src/screens/Detail/WherePanel.tsx, src/screens/Detail/detail.css, src/screens/Item/ItemScreen.tsx, src/screens/Item/item-page-model.ts, src/screens/Item/item.css, src/screens/Items/item-model.ts, tests/e2e/detail.spec.ts, tests/unit/data/published-schemas.test.ts, tests/unit/dataset/join.test.ts, tests/unit/ui-screens/item-page.test.ts, tools/dataset/README.md, tools/dataset/audit/compare.ts, tools/dataset/audit/expected.ts, tools/dataset/audit/raw.ts, tools/dataset/src/items/catalog.ts, tools/dataset/src/items/categories.ts, tools/dataset/src/items/recipes.ts, tools/dataset/src/items/ref-names.ts, tools/dataset/src/items/stage.ts, tools/dataset/src/media/vanilla-textures.ts, tools/dataset/src/species/spawns.ts, vite.config.ts] }
updated: 2026-09-29 03:45
---
## 2026-09-29 - ideia criada
- Pontin pediu iscas de spawn na tela do Pokemon. Investigacao do orquestrador nos dados do pack + wiki: o bolo e o Poke-Lanche (poke_snack), nao o Poke-Bolo. Escopo: Poke-Lanche + Pokeisca. 5 assuncoes aprovadas.

## 2026-09-29 00:40 - forge-context voltou (sonnet, ~5 min)
- CONTEXT_spawn-bait.md escrito (145 linhas, baseline em 5cf52024, 20 arquivos). Ids de tipo/grupo de ovo batem com as bagas; kubejs tem 3 spawn_bait_effects (1 sobrescreve o jar) e o pipeline nao le; 7 iscas + poke_snack fora do catalogo; condicoes de pesca so em extra; e2e do detail.spec conta classes do #where-panel. 10 incognitas, a maioria vai para a SPEC; 3 sao de produto (catalogo das iscas, poke_snack como item, mostrar x10) e vao para o Pontin.
- Decisoes do Pontin antes disso: 3 melhores bagas, tipo antes de grupo, reforcos dentro do bloco.

## 2026-09-29 00:55 - Stage 1 fechada com o Pontin, forge-review no CONTEXT disparado
- Decisoes finais: 7 iscas + poke_snack entram no catalogo (com receita da panela), sem "x10" no bloco, 8 suposicoes confirmadas ("ok"). IDEA status: done (aguardando a revisao do CONTEXT para marcar idea-done).
- top_model ainda nao perguntado ao Pontin (fable disponivel; revisao rodando em opus). Perguntar antes da SPEC.

## 2026-09-29 01:05 - forge-review (opus, ~3 min) no CONTEXT: NEEDS-CHANGES
- 1 BLOCKER (midia: poke_snack TEM textura, falta so a chave item. no lang; 5 itens vanilla e 2 allthemodium sem textura no snapshot), 5 WARNING (baseline da IDEA desatualizado; receitas: pipeline ja le a panela, pagina so mostra a estacao; temperos aceitos nao levantados; ponto de extensao do catalogo; e2e conta tambem .drop), 2 NIT (i18n de tipos em src/i18n/types.ts; texturas vao para cache de runtime, nao precache).
- Cascata aplicada na IDEA: receitas corrigidas (trabalho = catalogo + mostrar ingredientes + rotulo da panela), texturas dos 8 itens (decisao: copiar allthemodium do jar real), regra "so tempero aceito pela panela entra na recomendacao", suposicao 7 corrigida para cache de runtime.
- forge-context retomado por SendMessage para estender o CONTEXT (10 itens). Timer 1h. Depois: re-revisar.

## 2026-09-29 01:25 - Stage 1 CONCLUIDA (idea-done)
- forge-context (retomado, ~4 min) estendeu o CONTEXT: 4.1 catalogo, 4.2 midia dos 8 itens, 4.3 receitas (pipeline descarta ingredientes; pagina mostra so a estacao), 4.4 temperos (tag cobre 72 bagas + 7 vanilla; allthemodium via script kubejs; mythical_pecha_berry fora da tag), e2e classes completas, PWA runtime cache. 7 incognitas, todas de SPEC menos a mythical_pecha (perguntada ao Pontin, regra da IDEA a deixa fora).
- forge-review re-revisao (~1 min): conteudo tecnico resolvido; restavam 3 WARNING de redacao da IDEA + fingerprint e 3 NIT. Orquestrador corrigiu IDEA (linhas 32, 34, 80), CONTEXT (sec 7 PWA fundido, sec 8 item 5 reescrito) e reatualizou o fingerprint da IDEA (bf71782d53ff). Sem travessoes.
- Proximo: Stage 2. Pendente do Pontin: ok para branch feature/spawn-bait a partir da main; escolha top_model (fable ou opus) antes da Stage 3.

## 2026-09-29 01:30 - Stage 2 iniciada (Pontin: "pode seguir autonomo ate o fim")
- Autonomia total ate o fim do pipeline (gates passam sem parar), sem push/merge, top_model opus (Pontin nao escolheu). Branch feature/spawn-bait criada a partir da main (5cf52024). forge-prd disparado (sonnet), timer 1h.

## 2026-09-29 02:20 - Stage 2 CONCLUIDA (prd-done)
- forge-prd (sonnet): PRD rev 1 (54 RF) -> rev 2 (7 perguntas respondidas pelo orquestrador) -> rev 3 (3 WARNING + 4 NIT da revisao: 7 reforcos, RNF-02 por items.json, Lure weightMultipliers no escopo) -> rev 4 (weightMultiplier singular + renumeracao). Final: RF-01..55, RNF-01..11, CA-01..34, 0 perguntas.
- forge-review (opus) no PRD: rev 2 NEEDS-CHANGES, rev 3 NEEDS-CHANGES (1 WARNING), rev 4 PASS.
- Fingerprints: IDEA 0773bf058e17, CONTEXT 6ea22e108cb8, PRD 84ba0da04b1c. Gate aprovado por autonomia. Commit dos artefatos a seguir. Proximo: Stage 3b (forge-ui-recon) e Stage 3 (forge-spec, opus).

## 2026-09-29 02:25 - Stage 3b iniciada
- Commit ff3a26b0 (IDEA, CONTEXT, PRD rev 4, STATE). forge-ui-recon disparado (sonnet, Playwright headless, dev server proprio). Timer 1h. Depois: forge-spec (opus).

## 2026-09-29 02:35 - Stage 3b CONCLUIDA, Stage 3 iniciada
- forge-ui-recon (sonnet, ~6 min): UISPEC_spawn-bait.md render-captured, 10 alvos, 34 PNGs (2,5 MB) em ui-refs/ (versionado). Tokens do tema classic, anatomia recomendada do bloco Iscas (.bait-*), classes a evitar (contadas pelo e2e). Dev server parado. Fingerprint UISPEC 1eae152da70b.
- forge-spec (opus) disparado. Timer 1h.

## 2026-09-29 03:05 - SPEC escrita, revisao disparada
- forge-spec (opus, ~25 min): SPEC 893 linhas, 5 sprints (B1 contrato+pipeline, B2 snapshot/auditoria/publicacao, F1 ficha do Pokemon, F2 pagina do item, T1 testes), 20 features, ~55 arquivos (12 novos), 66/66 requisitos cobertos, 10 assuncoes (nenhuma bloqueante). Decisao do orquestrador: poke_bait tambem vira categoria bait (assuncao 7 da SPEC a corrigir). forge-review no SPEC disparado.

## 2026-09-29 03:15 - forge-review no SPEC: NEEDS-CHANGES (3 WARNING, 5 NIT, 0 BLOCKER)
- Linhas, hashes, matriz 66/66, identificadores en, regra das 3 melhores e Lure conferidos OK. WARNINGs: poke_bait ficava em Outros (decisao: poke_bait, poke_snack e os 7 novos = categoria bait); B1.1 Done when inatingivel (join.test valida o dataset real; decisao: B1.x excluem join/published-schemas ate B2.3, frontend so comeca depois de B2.3); rotulo da estacao vai para o i18n central (RF-47). NITs: CA-19 6x, Badge dentro do bloco, ItemInfo.bait, categoria dos 7, nomes de captura em ingles.
- Cascata feita pelo orquestrador: UISPEC linha 93 e IDEA atualizadas. forge-prd (rev 5) e forge-spec (revisao) rodando em paralelo. Timer 1h.

## 2026-09-29 03:30 - Stage 3 CONCLUIDA (spec-done)
- forge-spec revisao: 8 itens aplicados (9 itens categoria bait via viaBait, janela B1.1->B2.3 declarada e frontend so apos B2.3, rotulo ip.station.campfirePot, .bait-badge, ItemInfo.bait, capturas em ingles). forge-review re-revisao: PASS. PRD rev 5 (CA-19 6x, RF-47, categoria em RF-33/37/CA-23).
- Gate aprovado por autonomia. Commit de SPEC + UISPEC + ui-refs + PRD rev 5 + IDEA + STATE a seguir; depois forge-checklist (sonnet, nunca haiku) e Stage 4.

## 2026-09-29 03:35 - Stage 4 pre-flight e inicio
- Baselines alinhadas ao commit e76ec23a (artefatos consistentes, fingerprints conferidos pelo revisor). Drift check dos deps da SPEC: sem drift. Gate de idioma dos identificadores: revisor confirmou ingles. Feature movida ideas/ -> in-progress/. MODE: autonomous (Pontin). forge-checklist disparado (sonnet).

## 2026-09-29 03:45 - checklist criado, backend disparado
- forge-checklist (sonnet): 5 fases, 20 tarefas, tudo [ ]. Atribuicao dos T1.x inferida (T1.1/T1.4/T1.5 frontend; T1.2/T1.3 backend; T1.6 os dois).
- forge-imp-backend (opus, autonomous) disparado: B1.1..B1.5, B2.1..B2.3, T1.2, T1.3 e a parte backend de T1.6. Timer 1h (ao estourar: parar, conferir o checklist em disco, agente novo continua do primeiro [ ]).

## 2026-09-29 - forge-imp-backend: B2.3 republicado (numeros RNF-01/02)
- datasetVersion atm1.3.0-cobblemon1.7.3-20260929-2ef2f512; items.json 1.499.586 bytes (meta <= 1.659.908); species 5.246.713 bytes (meta <= 5.693.585); 931 texturas distintas (meta <= 931, < 1200); sha256 items.json 6bca7e9d942632f828cd825f5139997c070a5732d0d4510efe768bb578118a95 (publicado = snapshot = instancia). Auditoria 46558 checks, 0 divergencias.
