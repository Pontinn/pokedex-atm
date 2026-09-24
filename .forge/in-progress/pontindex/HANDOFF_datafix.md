# HANDOFF datafix (correcoes da auditoria A1 no pipeline de dados)

- Agente: forge-imp-backend (datafix)
- Inicio: 2026-09-24 17:59
- Fim: 2026-09-24 18:25 (rodada 2 pela decisao do orquestrador: ordem de carga transitiva)
- Dataset publicado: `atm1.3.0-cobblemon1.7.3-20260924-1344fc8b` (antes `...-550de566`, e antes disso `...-5b4a9ffa`)

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
| 5b | Decisao do orquestrador: colisoes seguem a ordem de carga TRANSITIVA (fecho de todos os AFTER/BEFORE dos neoforge.mods.toml); `chain` registrada em `spawnCollisions` | corrigido | f5b0d0f0 |
| - | Dataset regenerado (rodada 2) | feito | 19a7cd3d |

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

- (fechado na rodada 2) politica das 24 colisoes ccc x mega_showdown: ordem transitiva, ccc vence.
- `npm run typecheck` falha SO em `src/screens/Settings/AboutCard.tsx` (`__APP_VERSION__`, commit 048f5b9c do agente de frontend); nenhum erro em tools/ ou tests/.
- A auditoria (nao alterada, e o arbitro) precisaria alinhar a checagem "abilities (id+oculta)" e modelar ordering entre mods para zerar.

## Rodada 2 (decisao do orquestrador, 2026-09-24)

- Evidencia: `allthemons-0.6.2.jar/META-INF/neoforge.mods.toml` declara mega_showdown `ordering="AFTER"` e mr_complete_cobblemoncollectionmythsandlegendscompat `ordering="BEFORE"` ("fix load order of CCC"), logo mega_showdown < allthemons < ccc.
- `resolveSpawnFiles` agora usa o fecho transitivo; `SPAWN_COLLISION_WINNER` ("sum") so vale para pares sem nenhuma ordem (nenhum no atm-1.3.0).
- merge-report `spawnCollisions` (31): 5 kubejs, 24 loadOrder:ccc (chain "mega_showdown < allthemons < ccc"), 1 loadOrder:allthemons (0120_staryu), 1 loadOrder:zamega (0670_floette); 0 policy.
- Coalossal (839) fica so com o arquivo do ccc: rarity rare/[ultra-rare]. spawnEntries 3257 -> 3197.
- `npx vitest --run tests/unit/dataset` 93/93 verde. A decisao pendente das 24 colisoes esta fechada.
