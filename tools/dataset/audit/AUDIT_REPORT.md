# Relatorio de auditoria do dataset (A1)

## Rodada 6 (2026-09-30, berry-mutations)

Dataset: `tools/dataset/out/_bm_pub/data/atm1.3.0-cobblemon1.7.3-20260930-1949ea67` (pipeline no snapshot, antes da republicacao). Ferramenta: checks novos de origem e cruzamento das bagas, derivados do cru sem ler `tools/dataset/src`: para cada arquivo `data/cobblemon/berries/<id>.json` (fontes em ordem, a ultima vence), o item existe e `berry.spawn` (`spawnConditions` com a variante com ou sem namespace: `preferred_biome` = `preferredBiomeTags` da baga, `all_biome` = `[]`, `specific_biome` = `[biome]`), `berry.mutationPairs` (par nao ordenado por code unit, uma vez por resultado) e `berry.mutationUses` (derivados dos pares) iguais ao esperado, inclusive a ordem; item com `berry` nao nulo sem arquivo de baga = EXTRA. 70 bagas x 3 = 210 checks novos.

| WRONG DATA | MISSING | EXTRA | SPEC x JOGO | SEM ORDEM | COSMETIC |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

46768 checks, 1027 fichas.

## Rodada 5 (2026-09-29, spawn-bait)

Dataset: `tools/dataset/out/_sb_snap/data/atm1.3.0-cobblemon1.7.3-20260929-a7736f6b` (pipeline no snapshot, antes da republicacao). Ferramenta: checks novos de isca e pesca, derivados do cru sem ler `tools/dataset/src`: `spawn * fishing` (condition.bait/rodType/min e maxLureLevel, multiplicadores so de Lure, `rodBall` de `data/cobblemon/pokerods`); por item com `spawn_bait_effects` no catalogo, `bait.effects` (kind, subcategoria sem namespace, chance, value; kubejs vence), `bait.seasoning` (tag `cobblemon:recipe_filters/bait_seasoning` resolvida + ids do `.add(...)` em `kubejs/server_scripts`, conferindo o arquivo curado de forma independente) e `tags has bait`; `potRecipes ingredients` do Poke-Lanche e da Pokeisca; os 8 ids novos presentes e com textura; `allthemons:mythical_pecha_berry` ausente. A conferencia do arquivo de textura passou a olhar tambem a raiz do `--publish-dir` (dataset de teste fora de `public/`).

| WRONG DATA | MISSING | EXTRA | SPEC x JOGO | SEM ORDEM | COSMETIC |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

46558 checks, 1027 fichas.

## Rodada 4 (2026-09-28, pwa-auto-update U11)

Dataset: `public/data/atm1.3.0-cobblemon1.7.3-20260929-1a7afcba` (mesmo conteudo do U6, pasta nomeada pelo hash do conteudo). Ferramenta: na evolucao por troca (`variant: "trade"`) o `requiredContext` do Cobblemon e a especie parceira (ex. `shelmet`), nao um item; a auditoria deixou de exigir `cobblemon:karrablast`/`cobblemon:shelmet` em `items.json` (ids fantasmas removidos de proposito no U7d) e passou a conferir que a especie parceira existe no cru (check `evolution trade partner`). Os outros itens de evolucao (`item_interact`, `level_up` com item) continuam checados em `items.json`. Na rodada do U6 isso dava MISSING 2.

| WRONG DATA | MISSING | EXTRA | SPEC x JOGO | SEM ORDEM | COSMETIC |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

43102 checks, 1027 fichas.

## Rodada 3 (2026-09-28, item-descriptions D4)

Dataset: `public/data/atm1.3.0-cobblemon1.7.3-20260928-f3c842d2`. A ferramenta passou a aplicar `kubejs/assets/<ns>/lang/{pt_br,en_us}.json` por cima do lang dos jars (mesma regra do pipeline desde item-descriptions D6; JSON invalido ignorado; entre pastas do kubejs a primeira em ordem alfabetica vence). Antes disso a rodada deu WRONG DATA 1 (nome PT Flabebe -> Flabébé) e COSMETIC 90 (`pokedexText.pt`), todos vindos do lang do kubejs.

| WRONG DATA | MISSING | EXTRA | SPEC x JOGO | SEM ORDEM | COSMETIC |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

42992 checks, 1027 fichas. As secoes abaixo sao da rodada 2 (sem mudanca de estrutura).

## Rodada 2 (2026-09-24)

Dataset: `public/data/atm1.3.0-cobblemon1.7.3-20260924-1344fc8b` (commits `f5b0d0f0` fix(dataset) ordem de carga transitiva + `19a7cd3d` regeneracao). Ferramenta corrigida em `f5dce003`:

- `abilities (id+oculta)`: agora e UM check sobre os pares id + flag oculta dos dois lados, sem dedupe (habilidade normal E oculta no cru = 2 pares, como o `AbilityRef` publicado). Os 169 falsos positivos da rodada 1 somem.
- Colisao de `spawn_pool_world`: (a) kubejs substitui o jar; (b) entre jars vence o mod que carrega DEPOIS, pelo fecho transitivo de `ordering="AFTER"/"BEFORE"` de todos os `META-INF/neoforge.mods.toml` do snapshot (required e optional); (c) par sem ordem nenhuma e somado e classificado em `SEM ORDEM`. Ordem relevante: cobblemon < mega_showdown < allthemons < ccc; legendarymonuments < allthemons; cobblemon < zamega; mega_showdown < zamega.

### Contagem por severidade (42992 checks, 1027 fichas)

| WRONG DATA | MISSING | EXTRA | SPEC x JOGO | SEM ORDEM | COSMETIC |
|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 | 0 |

Rodada 1 (dataset `...-5b4a9ffa`, relatorio `6d99aa07`): WRONG DATA 144, MISSING 2, SPEC x JOGO 5, COSMETIC 242. Todas resolvidas (rarity 65, drops 50, obtain 15, Mega-Z keystone 14, items 2, spawns sombreados 5, form source 73) ou eram falso positivo da ferramenta (abilities 169).

Colisoes de spawn: 26 resource locations repetidos entre jars, todos resolvidos pela ordem de carga (2 -> allthemons/zamega sobre cobblemon, 24 -> ccc sobre mega_showdown); 0 SEM ORDEM. 3197 entradas de spawn valem no jogo (= `counts.spawnEntries` do manifesto).

### Pontos em aberto (sem divergencia automatica)

1. **SPEC x JOGO, Meltan -> Melmetal**: `legendarymonuments/.../data/legendarymonuments/species_additions/meltan.json` adiciona a evolucao `meltan_melmetal_candy` (requisito `legendarymonuments:meltan_candy_count` 64); `kubejs/data/cobblemon/species_additions/generation7b/zzz_ccc_meltan.json` traz `"evolutions": []`. Pela regra da SPEC (valor da adicao substitui; kubejs por ultimo) Meltan fica sem evolucao e Melmetal com "Como obter" = `none` (publicado = esperado). No jogo depende da ordem em que o Cobblemon aplica `species_additions` de resource locations diferentes e se `evolutions` substitui ou acumula: nao determinavel pelo snapshot (codigo compilado). Pedir decisao/verificacao in-game.
2. **Limitacao da auditoria**: `species_additions` de jars diferentes sao aplicadas na ordem da SPEC 5.1.1 (alfabetica), nao na ordem de carga. Conferido no cru: os unicos campos em conflito entre jars sao `hitbox`/`baseScale`/`behaviour`/`riding` (ccc x mega_showdown, nao publicados) e o `evolutions` do Meltan (item 1). Sem efeito no dado publicado.
3. **Texto da SPEC 5.1.2**: os 51 `species_additions` do legendarymonuments (namespaces `cobblemon_drops`/`legendarymonuments`) continuam fora da lista da SPEC, mas o pipeline ja os aplica e bate com o cru; falta so atualizar o texto da SPEC.


Gerado em 2026-09-24T21:23:16.836Z por `tools/dataset/audit/run.ts` (esperado derivado SO do snapshot cru, sem ler `tools/dataset/src`).

## Relatorio gerado (rodada 2)

- Esperado: 1027 especies, 3317 entradas de spawn lidas (3197 valem no jogo), 16 rotas de fossil, 48 bolas, series bdsp=43, radicalred=39, unbound=38, atm_team=21, contentcreators=9, levelCap {"initialLevelCap":15,"relativeLevelCap":0,"initialSeries":"empty","freeroamRequiresCompletedSeries":true}.

- Dataset comparado: `public\data\atm1.3.0-cobblemon1.7.3-20260924-1344fc8b`
- Especies com ficha conferida: 1027
- Verificacoes individuais: 42992
- WRONG DATA: 0
- MISSING: 0
- EXTRA: 0
- SPEC x JOGO: 0
- SEM ORDEM: 0
- COSMETIC: 0

Legenda: WRONG DATA = valor diferente do cru; MISSING = ausente no publicado; EXTRA = sobra no publicado; SPEC x JOGO = o pipeline seguiu a SPEC ao pe da letra mas o jogo se comporta diferente; SEM ORDEM = colisao de arquivo entre jars sem ordem de carga declarada (indeterminavel pelo snapshot); COSMETIC = texto/ordem/rotulo sem efeito no dado.

## Achados estruturais do snapshot (independem do pipeline)

- species_additions sombreado pelo kubejs (mesmo resource location cobblemon:species_additions/generation7b/zzz_ccc_meltan.json): data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/species_additions/generation7b/zzz_ccc_meltan.json nao vale no jogo
- 51 species_additions do legendarymonuments (namespaces cobblemon_drops e legendarymonuments) valem no jogo e NAO estao na lista da SPEC 5.1.2
- 12 arquivos spawn_pool_world com "enabled": false (nao nascem no jogo): data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/spawn_pool_world/0000_pidgey_herd.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/0841_flapple.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/0842_appletun.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/1011_dipplin.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/1018_archaludon.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/1019_hydrapple.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/legendary_spawns_ccc/spawn_pool_world/0249_lugia_shadow.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/legendary_spawns_ccc/spawn_pool_world/0773_silvally.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/legendary_spawns_ccc/spawn_pool_world/0790_cosmoem.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/legendary_spawns_ccc/spawn_pool_world/0809_melmetal.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/legendary_spawns_ccc/spawn_pool_world/0892_urshifu.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/ub_spawns_ccc/spawn_pool_world/0804_naganadel_ccc.json
- 5 arquivos spawn_pool_world de jar sombreados pelo kubejs (mesmo resource location, kubejs vence no jogo): data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/spawn_pool_world/0550_basculin.json, data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/spawn_pool_world/0902_basculegion.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/0901_ursaluna_bloodmoon.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/0971_greavard.json, data-source/atm-1.3.0/mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar/data/cobblemon/spawn_pool_world/0972_houndstone.json
- 26 resource locations de spawn_pool_world repetidos entre jars; ordem de carga (fecho transitivo dos neoforge.mods.toml: allthemodium<allthemons, cobblemon<allthemons, pkgbadges<allthemons, create<allthemons, crafting_on_a_stick<allthemons, industrialforegoingsouls<allthemons, rctmod<allthemons, mega_showdown<allthemons, rgs<allthemons, simpletms<allthemons, legendarymonuments<allthemons, allthemons<mr_complete_cobblemoncollectionmythsandlegendscompat, cobblemon<mr_complete_cobblemoncollectionmythsandlegendscompat, architectury<mega_showdown, cobblemon<mega_showdown, accessories<mega_showdown, architectury<rctapi, architectury<zamega, cobblemon<zamega, mega_showdown<zamega, accessories<zamega) resolve 26: 0120_staryu.json [cobblemon=10x uncommon/common vs allthemons=17x uncommon/common] -> vence allthemons; 0670_floette.json [cobblemon=13x common vs zamega=14x common/ultra-rare] -> vence zamega; 0025_pikachu_cosmetic.json [ccc=1x uncommon vs mega_showdown=2x uncommon] -> vence ccc; 0351_castform.json [ccc=4x uncommon vs mega_showdown=4x rare] -> vence ccc; 0412_burmy.json [ccc=3x common vs mega_showdown=2x common] -> vence ccc; 0413_wormadam.json [ccc=3x common/uncommon vs mega_showdown=2x common] -> vence ccc; 0414_mothim.json [ccc=1x common vs mega_showdown=3x common] -> vence ccc; 0420_cherubi.json [ccc=1x common vs mega_showdown=1x common] -> vence ccc; 0421_cherrim.json [ccc=2x uncommon vs mega_showdown=3x common] -> vence ccc; 0459_snover.json [ccc=1x common vs mega_showdown=1x common] -> vence ccc; 0460_abomasnow.json [ccc=1x uncommon vs mega_showdown=1x common] -> vence ccc; 0479_rotom.json [ccc=4x rare/uncommon/ultra-rare vs mega_showdown=2x rare] -> vence ccc; 0531_audino.json [ccc=1x rare vs mega_showdown=1x rare] -> vence ccc; 0554_darumaka_galarian.json [ccc=1x uncommon vs mega_showdown=2x uncommon/common] -> vence ccc; 0555_darmanitan_galarian.json [ccc=1x uncommon vs mega_showdown=2x uncommon/common] -> vence ccc; 0741_oricorio.json [ccc=4x uncommon vs mega_showdown=4x uncommon] -> vence ccc; 0744_rockruff.json [ccc=1x uncommon vs mega_showdown=1x uncommon] -> vence ccc; 0745_lycanroc.json [ccc=1x uncommon vs mega_showdown=2x uncommon] -> vence ccc; 0774_minior.json [ccc=8x rare/uncommon vs mega_showdown=16x uncommon] -> vence ccc; 0824_blipbug.json [ccc=2x common vs mega_showdown=1x common] -> vence ccc; 0825_dottler.json [ccc=2x uncommon vs mega_showdown=1x common] -> vence ccc; 0826_orbeetle.json [ccc=1x rare vs mega_showdown=1x common] -> vence ccc; 0837_rolycoly.json [ccc=2x common/uncommon vs mega_showdown=2x common/uncommon] -> vence ccc; 0838_carkol.json [ccc=2x common/uncommon vs mega_showdown=2x common/uncommon] -> vence ccc; 0839_coalossal.json [ccc=2x rare/ultra-rare vs mega_showdown=2x common/uncommon] -> vence ccc; 0884_duraludon.json [ccc=2x rare vs mega_showdown=2x rare] -> vence ccc

## Amostra manual (50 especies)

| Dex | Slug | Motivo |
|---|---|---|
| 16 | pidgey | comum; tem arquivo 0000_pidgey_herd.json com enabled:false |
| 19 | rattata | comum, forma regional (Alola) |
| 10 | caterpie | comum, evolucao por nivel curta |
| 161 | sentret | comum gen2 |
| 396 | starly | comum gen4 (BDSP) |
| 1 | bulbasaur | inicial; linha com Mega/Gmax do Venusaur |
| 4 | charmander | inicial; raiz da cadeia do Charizard |
| 7 | squirtle | inicial |
| 152 | chikorita | inicial gen2 |
| 387 | turtwig | inicial gen4 |
| 906 | sprigatito | inicial gen9 |
| 144 | articuno | lendario com forma Galar |
| 249 | lugia | lendario; ccc tem 0249_lugia_shadow.json enabled:false |
| 384 | rayquaza | lendario sobrescrito pelo mega_showdown (Mega) |
| 483 | dialga | lendario sobrescrito pelo mega_showdown (Origin) |
| 888 | zacian | lendario gen8 com forma por item |
| 1007 | koraidon | lendario gen9 |
| 151 | mew | mitico |
| 385 | jirachi | mitico com spawn so via kubejs + ccc |
| 490 | manaphy | mitico com spawn kubejs |
| 492 | shaymin | mitico com spawn kubejs e forma Sky |
| 719 | diancie | mitico com spawn kubejs e tag de bioma kubejs |
| 807 | zeraora | mitico com spawn kubejs e Mega do zamega |
| 6 | charizard | Mega-X/Mega-Y (charizardite_x/_y + keystone) e Gmax sem item |
| 3 | venusaur | Mega e Gmax; override do mega_showdown |
| 359 | absol | Mega (mega_showdown) e Mega-Z (zamega:absolitez) |
| 445 | garchomp | Mega e Mega-Z (zamega:garchompitez) |
| 94 | gengar | Mega e Gmax; override do mega_showdown |
| 448 | lucario | Mega e Mega-Z |
| 179 | mareep | adicao allthemons: drop silentgear:sinew 25% |
| 180 | flaaffy | adicao allthemons |
| 120 | staryu | adicao allthemons + spawn 0120_staryu duplicado (cobblemon x allthemons) |
| 241 | miltank | adicao allthemons |
| 334 | altaria | adicao legendarymonuments (cobblemon_drops) fora da lista da SPEC |
| 808 | meltan | adicao kubejs zzz_ccc_meltan sombreando a do ccc + adicao legendarymonuments |
| 809 | melmetal | override ccc + spawn ccc enabled:false |
| 9901 | piglich | custom allthemons (Piglichu), sem sprite |
| 9902 | creepyon | custom allthemons com spawn proprio |
| 550 | basculin | spawn do jar sombreado pelo kubejs (0550_basculin.json) |
| 901 | ursaluna | kubejs 0901_ursaluna_bloodmoon sombreando o ccc |
| 971 | greavard | kubejs 0971_greavard sombreando o ccc |
| 142 | aerodactyl | fossil old_amber + breeding (exemplo da SPEC) |
| 138 | omanyte | fossil helix |
| 566 | archen | fossil plume |
| 133 | eevee | 8 evolucoes; raridade uncommon + [rare, ultra-rare] |
| 150 | mewtwo | spawn ultra-rare do ccc + fossil allthemons; Megas |
| 129 | magikarp | muitos spawns (46), pesca |
| 718 | zygarde | formas 10%/Complete + Mega do zamega (zygardite) |
| 745 | lycanroc | formas; override mega_showdown; spawn duplicado entre jars |
| 25 | pikachu | muitas formas cosmeticas/Gmax; spawn 0025_pikachu_cosmetic duplicado |

## Conferencia manual (rodada 2, cru x publicado lado a lado via `manual.ts`)

Amostra fixa (50 especies de `sample.ts`): `npx tsx tools/dataset/audit/manual.ts` -> 0 linhas divergentes em nome PT/EN, descricao, tipos, labels, stats, habilidades, egg groups, catch rate/peso/altura/genero, pre-evolucao, evolucoes + requisitos, formas + itens, drops, spawns (id/fonte/bucket/nivel/contexto), raridade e "Como obter". (`manual.ts` agora tira o prefixo de fonte do id publicado, ex. `cobblemon:abra-1`, que antes aparecia como diferenca so de rotulo.)

Especies afetadas pelas correcoes da rodada 1 e pela ordem de carga: `npx tsx tools/dataset/audit/manual.ts --species dragonite,dragonair,altaria,meltan,garchomp,goodra,cursola,obstagoon,sirfetchd,mrrime,perrserker,runerigus,overqwil,sneasler,clodsire,basculegion,shedinja,naganadel,ursaluna,greavard,houndstone,absol,lucario,zeraora,coalossal,rotom,staryu,floette --out <arquivo>` -> 28 especies, 0 linhas divergentes. Conferido a olho, com o arquivo cru aberto:

- Raridade: Dragonite (`Cobblemon .../spawn_pool_world/0149_dragonite.json`: 2 uncommon, 2 rare, 3 ultra-rare) e Dragonair publicados `uncommon` + `[rare, ultra-rare]`: correto (rodada 1 saia `ultra-rare`).
- Drops do legendarymonuments (`data/cobblemon_drops/species_additions/*`): Dragonite (`lightstone_shard`/`darkstone_shard` 10%), Dragonair (6%), Altaria (6%), Garchomp (10%), Goodra (10%), Naganadel (50%): presentes e com o percentual cru. Meltan: so `minecraft:iron_ingot` 50% 1-5 (o arquivo do legendarymonuments para Meltan so tem evolucao, sem drops): correto.
- "Como obter": Cursola, Obstagoon, Sirfetch'd, Mr. Rime, Perrserker, Runerigus, Overqwil, Sneasler, Clodsire, Basculegion, Shedinja agora com `evolution` (pre-evolucao regional resolvida); Naganadel `evolution` + `addon` (ultrawormholes, label ultra_beast); Ursaluna `evolution, packSpawn, breeding` (spawn `ccc-ursaluna-3` do kubejs); Greavard `packSpawn, breeding`; Houndstone `evolution, packSpawn, breeding` (arquivos do ccc substituidos pelo kubejs nao geram mais `addon`): corretos.
- Mega-Z (zamega): Absol `Mega-Z[zamega:absolitez, mega_showdown:keystone]`, Garchomp `zamega:garchompitez + keystone`, Lucario `zamega:lucarionitez + keystone`; Zeraora Mega `zamega:zeraorite + keystone`: corretos.
- Colisoes resolvidas pela ordem de carga: Coalossal so `ccc-coalossal-1/2` (ccc, rare/ultra-rare; o 0839_coalossal.json do mega_showdown, common/uncommon, e substituido) -> `rare` + `[ultra-rare]`; Rotom so `ccc-rotom-1..4` (ccc) -> `uncommon` + `[rare, ultra-rare]`; Staryu so os 17 spawns do allthemons (cobblemon < allthemons) -> `common` + `[uncommon]`; Floette so os 14 do zamega (cobblemon < zamega), incluindo `floette-eternal-1` ultra-rare -> `common` + `[ultra-rare]`: corretos.

