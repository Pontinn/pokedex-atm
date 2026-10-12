---
feature: pokemon-generation
stage: spec
status: in-progress
language: pt-BR
branch: feature/pokemon-generation (base main b7ae68d7)
mode: full
impl_mode: autonomous
top_model: opus
running_agent: forge-spec (opus) - escrevendo SPEC
baselines:
  CONTEXT: { commit: b7ae68d7, idea_hash: 7b81d65ab33a889f056cd3b83e826720a485295e, deps: [IDEA_pokemon-generation.md, tools/dataset/src/pokeapi/client.ts, tools/dataset/src/pokeapi/stage.ts, vite.config.ts, src/screens/Detail/WherePanel.tsx, src/screens/Detail/HeroCard.tsx, src/screens/Dex/PokemonCard.tsx, src/screens/Dex/DexFilters.tsx, src/screens/Dex/use-filtered-species.ts, src/screens/Detail/EvolutionPanel.tsx, src/components/SpeciesBadges.tsx, tools/dataset/src/species/merge.ts, tools/dataset/src/species/index-writer.ts, src/data/schemas.ts, src/data/types.ts] }
  PRD:     { commit: b7ae68d7, idea_hash: 7b81d65ab33a889f056cd3b83e826720a485295e, context_hash: b16864921badb7ad2c37f2f183af29f1625a9253, prd_hash: 30137dd92cd3f1605155a9ec1d4e9ef4ea5b94f9, deps: [IDEA_pokemon-generation.md, CONTEXT_pokemon-generation.md] }
updated: 2026-10-12
---
## 2026-10-12 - Stage 1 aberta
- Objetivo registrado na IDEA. Achado inicial do orquestrador: o Dex JA tem select de geracao (f-gen) e o schema ja tem `generation`; falta mostrar a geracao no Pokemon e na cadeia de evolucao. forge-context disparado em segundo plano.

## 2026-10-12 - forge-context retornou
- CONTEXT escrito. Filtro de geracao ja existe e e usavel (select sempre visivel, testado em tests/e2e/dex.spec.ts:171). Nos da evolutionChain nao trazem generation, mas todo no aponta pra um dex presente no speciesIndex: da pra pintar por lookup sem republicar dataset. ~201 arestas cruzam geracao. Geracao vem dos labels do Cobblemon (generationOf em merge.ts:345). Nenhuma tela mostra geracao em selo; SpeciesBadges e compartilhado (card, Capturados, Hero). Formas nao tem generation. 7 pontos em aberto registrados no CONTEXT.
- Pontin levantou "mostrar em quais jogos o Pokemon esta disponivel" (jogos mainline); dataset nao tem isso, precisaria de fonte externa (provavel PokeAPI) embutida no build. Aguardando decisao de escopo e respostas da Stage 1.

## 2026-10-12 - Pontin: "pode seguir autonomo ate o fim e deixe o modelo maximo como opus"
- Pipeline inteiro autorizado em modo autonomo (gates aprovados antecipadamente, premissas listadas na IDEA secao 11 para correcao a qualquer momento). Push/merge continuam SO com pedido explicito. top_model = opus. forge-context reativado (SendMessage) para conferir a fonte externa de disponibilidade por jogo (PokeAPI) antes de planejar.

## 2026-10-12 - forge-context (follow-up PokeAPI) retornou; IDEA finalizada
- CONTEXT secao 9 nova: 35 pokedexes conferidas, juncao por dex nacional (1..1025), version-group.pokedexes liga jogo->dex, FRLG so kanto (151), pipeline ja tem cliente PokeAPI com cache ignorado pelo git (nao reproduzivel), indice precacheado (293 KB / 36 KB gzip). 7 pontos abertos decididos pelo orquestrador (delegacao total do Pontin) e registrados na IDEA secao 2. Pass de finalizacao feito pelo orquestrador (reconcile, scorecard, premissas, contradicoes). forge-review (context, opus) disparado.

## 2026-10-12 - idea-done; Stage 2 iniciada
- forge-review (context): NEEDS-CHANGES sem blockers, 7 warnings + 3 nits; forge-context corrigiu tudo no CONTEXT (raridade no Hero e WherePanel, RARITY_BADGE importado por WherePanel.tsx:15, inventario de asserts em detail/dex/responsive specs e tests/unit/ui-screens/pokemon-card.test.tsx, PokeAPI ja usada no build, creditos em settings.ts:19 e README:29/116, 8 GETs verificados: RBY->kanto, GSC->original-johto, legends-za->lumiose-city+hyperspace, mega-dimension->hyperspace). Baseline do CONTEXT re-ancorado na IDEA final pelo orquestrador.
- Decisoes extras do orquestrador: mega-dimension = DLC de legends-za; conquest-gallery e champions fora; geracao nos nos da cadeia: SPEC decide (dataset sera republicado de qualquer forma).
- Branch feature/pokemon-generation criada a partir de main (b7ae68d7). forge-prd (sonnet) disparado.

## 2026-10-12 - PRD escrito (rev 2)
- forge-prd: 57 RF, 13 RNF, 64 CA. Pergunta aberta 2 (edicoes japonesas) decidida pelo orquestrador: EXCLUIDAS por nome. Demais perguntas deferidas para SPEC/UISPEC de forma explicita. 9 [ASSUMPTION] aceitas. forge-review (prd, opus) disparado.

## 2026-10-12 - Stage 3b concluida (forge-ui-recon)
- UISPEC render-captured, 7 areas, 21 PNGs em ui-refs/ (1.8 MB, versionados). Achados: badge do card 10/800 pad 3/7 radius 8 altura 20 (phone 9/800, altura 18); Hero .seal .badge 11/800; select 13/700 altura 40, .filter-row 4 colunas no desktop (1fr 1fr 1fr auto) e 2 no phone (5o controle exige decisao de grid); EvoNode 108x126; painel .panel > .panel-head > .kv com ordem --i (stats, weak, evo, abilities, moves, where, best, calc); creditos = InfoLine no AboutCard. Gaps: sem card do Mewtwo (grid virtualizada), .info-line lido do CSS, temas nao-classic reaproveitados do UISPEC de berry-mutations. Dev server parado. forge-review (uispec, opus) disparado.

## 2026-10-12 - revisoes de PRD e UISPEC
- PRD: NEEDS-CHANGES, 0 blocker, 7 warnings (predicado da regra de jogos, lista a mao errada sobre Let's Go, exclusao japonesa fora da IDEA, "correspondencia" ambigua, teto de 10 KB nao verificavel, "so acrescimos" impossivel ao pe da letra, RFs duplicados/HOW/processo), 7 nits. Cascata aplicada pelo orquestrador: IDEA secao 2 (predicado is_main_series, exclusoes por tipo, mega-dimension fundido em legends-za, correspondencia = pokemon-species 1..1025, teto 10.240 bytes gzip, excecoes datasetVersion/manifest/current.json), secoes 3/4/12 atualizadas; CONTEXT secao 8 resolvido e re-ancorado (IDEA 7b81d65a, CONTEXT b1686492). forge-prd reativado para rev 3.
- UISPEC: NEEDS-CHANGES, 0 blocker, 6 warnings, 5 nits. Decisoes do orquestrador: marcador de geracao sobreposto no canto da imagem do EvoNode (classe evo-gen, destaque evo-gen-diff com contorno --secondary + nome acessivel), grade desktop 1fr 1fr 1fr 1fr auto com Jogo apos Geracao (#f-game), classe badge-gen com --secondary-soft/--text, painel Jogos apos where com --i 7 (best 8, forms 9, calc 10), estados (lista semantica de chips, nota da National Dex, vazios "Nao aparece nos jogos oficiais"/"So no pack"), credito como InfoLine irma (settings.pokeapi), source: mixed. forge-ui-recon reativado sem recaptura.

## 2026-10-12 - prd-done + UISPEC corrigido; Stage 3 iniciada
- PRD rev 3: 52 RF, 9 RNF, 65 CA (duplicatas fundidas, HOW/processo movidos para restricoes, predicado dos jogos e exclusoes por tipo, correspondencia definida, teto 10.240 bytes gzip). UISPEC corrigido (source: mixed). Gate de PRD aprovado por delegacao (modo autonomo). Commit 1 dos artefatos feito na branch. forge-spec (opus) disparado.
