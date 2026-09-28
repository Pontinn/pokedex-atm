# Relatorio U6: publicacao e testes (2026-09-28 20:29 a 21:00)

Gravado pelo orquestrador a partir do retorno do agente (o harness bloqueou a escrita pelo agente). Headless, sem slowMo, sem sleeps.

## BLOQUEIO DE DEPLOY encontrado
`datasetVersion` = `atm<pack>-cobblemon<ver>-<data>-<sha8 do indice de especies>` (`tools/dataset/src/species/index-writer.ts:201`). Mesmo dia + especies iguais = mesma pasta `atm1.3.0-cobblemon1.7.3-20260928-f3c842d2`, que ja esta no ar (9ba1f7ea). `items.json`, `series.json` e o manifest mudaram dentro dela. `vercel.json` serve `/data/(.*)` (inclusive `current.json`) com `immutable` 1 ano e o SW usa CacheFirst em `/data/<ver>/*.json`: quem abriu o site depois de 9ba1f7ea ficaria com os dados antigos. Correcao: U11.

## Commits
2281cb7c (dataset publicado), bd84c873 e d5213dae (testes ajustados ao dado novo), 97a2a344 (checklist + 33 prints `ui-refs/U6_*.png`).

## Contagens
943 itens (949 - 6 fantasmas); 0 `none`; 923/923 texturas com `?v=`; 110 texturas minecraft (vine e lily_pad verdes); 208 descricoes reescritas; structurePlaced 132; unobtainable 22; especies 1027, golpes 797, treinadores 1589 sem mudanca. Cerca de 12 descricoes OFICIAIS do jogo citam obtencao (ex. `allthemons:imbued_pokemon_egg`): texto do jogo, mantido.

## Testes
- Auditoria: 43102 checks, MISSING 2 (`karrablast`, `shelmet`, removidos de proposito em U7d; expectativa da auditoria desatualizada). `AUDIT_REPORT.md` restaurado.
- tests/unit/dataset 15 arquivos 192/192; typecheck 0; lint 0; vitest 77 arquivos 609 testes; build ok (precache 68, 2443 KiB).
- e2e (dev, um arquivo por vez): item-obtain-v2 8/8, item 16/16 (apos ajuste), items 7/7, balls 7/7, navigation 2/2, shell 15/15, settings 14/14, sync 15/15, home 24/24, dex 12/12, detail 46/46, capture 8/8, captured 6/6, compare 9/9, team-history 1/1, trainers 11/11, perf 2/2, responsive 18/18; pwa-offline (producao) 9/9. Total 230 verdes.
- Falhas, todas mudanca esperada de dado: item-page.test (pocao ganhou missao e estrutura; caso "sem rota" usa item sintetico), item.spec Pocao (tabela de bloco que so solta ele mesmo nao conta mais), item.spec Pedra do Fogo (allthemodium_ingot ganhou receita e missao).

## Smoke (33/33, PT/EN, 1280/390, sem overlap, sem erro de console)
Insignia da Gatinha (16x16 `?v=baded6c2`, descricao sem obtencao, Drop de treinador -> Satherov 100% com link), Osso (nome PT + icone), Diamante ("e mais N"), Placa Terror (Nao obtivel), Legend Plate (Loja de BP), Leite Moomoo (mecanica especial + missao), Pokebola (sem bancada; Montagem sequenciada, Montadora, Camara de Pressao), Karrablast ("Troca com Shelmet" -> dex 616).

## Observacoes
Rotulos de loot de estrutura continuam como id humanizado em ingles ("Chests (burned tower)"), ja era assim. Artwork do Karrablast mostra placeholder no headless (sem erro de console).
