# HANDOFF datafix (correcoes da auditoria A1 no pipeline de dados)

- Agente: forge-imp-backend (datafix)
- Inicio: 2026-09-24 17:59
- Fim: 2026-09-24 18:15
- Dataset publicado: `atm1.3.0-cobblemon1.7.3-20260924-550de566` (antes `...-5b4a9ffa`)

## Status

| # | Item | Status | Commit |
|---|---|---|---|
| 1 | Raridade pela ordem fixa (SPEC 5.1.4) | corrigido | f4bcdf92 |
| 2 | species_additions de todos os namespaces (legendarymonuments drops, meltan), kubejs sombreia jar, texturas legendarymonuments | corrigido | e1e623e7 |
| 4+5 | spawn_pool_world por resource location: kubejs substitui jar; ordering direto do neoforge.mods.toml; `SPAWN_COLLISION_WINNER` (padrao "sum"); `spawnCollisions` no merge-report | corrigido | 701c352c |
| 3 | Rota evolution com pre-evolucao regional (arestas de forms[].evolutions) e shedder (Shedinja); ultra_beast sem addon ganha ultrawormholes (Naganadel); 3c resolvido pelo item 4 | corrigido | 996110cf |
| 6 | Mega-Z (zamega) exige mega_showdown:keystone | corrigido | 473b796a |
| 7a | Habilidade normal + oculta mantem as duas entradas AbilityRef | corrigido (ver divergencia com a auditoria) | db720f16 |
| 7b | source da forma = addon que a define | corrigido | b72f041f |
| - | Dataset regenerado | feito | 54c7a8ac |

## Auditoria (npx tsx tools/dataset/audit/run.ts)

- Antes: 144 WRONG DATA / 2 MISSING / 5 SPEC x JOGO / 242 COSMETIC
- Depois: 169 WRONG DATA / 2 MISSING / 0 SPEC x JOGO / 0 COSMETIC
  - 169 WRONG DATA = todas "abilities (id+oculta)": a auditoria tem duas checagens mutuamente exclusivas (compare.ts linhas 217 e 218): a de id compara ids UNICOS do cru com os ids publicados SEM deduplicar, a de flag exige id+oculta. Com o contrato `AbilityRef {id, hidden}` so ha como manter o papel de oculta publicando duas entradas (levitate normal + levitate oculta), o que a checagem de id acusa. O dado publicado agora e fiel ao cru.
  - 2 MISSING = spawns cobblemon de 0120_staryu e 0670_floette: a auditoria soma arquivos repetidos entre jars; o pipeline aplica a ordem de carga declarada (allthemons e zamega declaram ordering AFTER cobblemon/mega_showdown), como pedido pelo orquestrador.

## Evidencias

- Mega-Z: `zamega.jar/data/zamega/mega_showdown/mega/absolitez.json` tem o mesmo esquema de `mega_showdown.jar/data/mega_showdown/mega_showdown/mega/absolite.json` (mesmo registro de Mega do mega_showdown, dependencia obrigatoria do zamega), e o lang do zamega diz "Mega Evolve into Mega Absol Z". Zygardite (zamega) usa aspecto `mega` com `required_aspects complete-percent`.
- Ordem transitiva: allthemons declara mega_showdown AFTER e ccc BEFORE, entao pelo fecho transitivo ccc carrega depois do mega_showdown. As 24 colisoes ccc x mega_showdown NAO tem ordering direto entre os dois; o pipeline so usa ordering DIRETO para decidir e registra `transitiveLoadOrder:ccc` na resolution (`policy:sum; transitiveLoadOrder:ccc`) para o usuario decidir.
- Validacao: `npx vitest --run tests/unit/dataset` 93/93 verde; `npm run dataset -- --report` ok (sem EPERM).

## O que falta / decisoes pendentes

- Usuario: politica das 24 colisoes ccc x mega_showdown (`SPAWN_COLLISION_WINNER` em tools/dataset/src/species/spawns.ts; hoje "sum"). Ordem transitiva aponta ccc.
- `npm run typecheck` falha SO em `src/screens/Settings/AboutCard.tsx` (`__APP_VERSION__`, commit 048f5b9c do agente de frontend); nenhum erro em tools/ ou tests/.
- A auditoria (nao alterada, e o arbitro) precisaria alinhar a checagem "abilities (id+oculta)" e modelar ordering entre mods para zerar.
