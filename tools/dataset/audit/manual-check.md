## Conferencia manual (50 especies, cru x publicado lado a lado via `manual.ts`)

Campos conferidos em todas as 50: nome PT/EN, descricao PT/EN, tipos, labels, stats, habilidades, egg groups, catch rate/peso/altura/genero, pre-evolucao, evolucoes (destino/variante/item/requisitos), formas + itens, drops, spawns (id/fonte/bucket/nivel/contexto), raridade e "Como obter".

- Nomes e descricoes PT/EN: 50/50 identicos ao lang cru (inclui Piglichu 9901 e Creepyon 9902 do lang do allthemons).
- Tipos, stats, egg groups, catch rate, peso, altura, genero, pre-evolucao, evolucoes: 50/50 corretos (Eevee 8 arestas com requisitos certos; Charizard 17/905).
- Formas: Charizard Mega-X/Mega-Y com pedra + keystone, Gmax sem item: correto. Absol/Garchomp/Lucario/Zeraora/Zygarde Mega-Z: publicado so com a pedra `zamega:*`, sem `mega_showdown:keystone` (ver WRONG DATA form requiredItems).
- Drops: Mareep com `silentgear:sinew` 25% e 4 entradas: correto. Altaria, Meltan e demais alvos do legendarymonuments: faltam os drops `legendarymonuments:*_shard` (ver WRONG DATA drops).
- Spawns: ids publicados levam prefixo de fonte (`cobblemon:abra-1`); fora isso, bucket/nivel/contexto/biomas batem. Basculin/Ursaluna/Greavard/Houndstone/Basculegion incluem entradas do arquivo do jar que o kubejs substitui no jogo (duplicadas).
- Raridade: Pidgey, Magikarp, Eevee corretas; Mewtwo ultra-rare correta. Varias especies com buckets mistos divergem (ver WRONG DATA rarity).
- Habilidades: especies com a mesma habilidade normal e oculta (Gastly/Gengar "levitate"/"cursedbody") perdem a marca de oculta (COSMETIC).

## Causas provaveis (por grupo)

1. **drops (50, WRONG DATA)**: o pipeline nao aplica os 51 `species_additions` do legendarymonuments (`data/cobblemon_drops/species_additions/*` e `data/legendarymonuments/species_additions/meltan.json`); o `merge-report` intermediario nao tem nenhuma origem legendarymonuments. A SPEC 5.1.2 tambem omite esse jar da lista. Consequencia extra: `legendarymonuments:lightstone_shard`/`darkstone_shard` ausentes em `items.json` (MISSING 2).
2. **rarity (65, WRONG DATA)**: o publicado nao segue a ordem fixa da SPEC 5.1.4 (`common > uncommon > rare > ultra-rare`, primario = mais comum presente). Ex.: Dragonite tem spawns uncommon/rare/ultra-rare (`Cobblemon .../spawn_pool_world/0149_dragonite.json`) e sai `primary "ultra-rare"`; esperado `uncommon`. Parece ordenar por outra chave (contagem/peso).
3. **obtain (15, WRONG DATA)**: rota `evolution` faltando quando a pre-evolucao e forma regional (Cursola, Obstagoon, Sirfetch'd, Mr. Rime, Perrserker, Runerigus, Overqwil, Sneasler, Clodsire, Basculegion, Shedinja): provavel resolucao de `preEvolution` com aspecto (ex. "corsola galarian") sem `split(" ")[0]`. Naganadel sem `addon` (label ultra_beast, SPEC 5.1.5). Ursaluna/Greavard/Houndstone ganham `addon` ccc vindo de arquivo que o kubejs substitui no jogo.
4. **form requiredItems (14, WRONG DATA, confianca media)**: Mega-Z do zamega publicadas so com a pedra, sem `mega_showdown:keystone` (a SPEC B2.4 manda a mesma heuristica das Megas, que inclui a keystone).
5. **SPEC x JOGO (5)**: spawns de arquivos do jar sombreados pelo kubejs (0550_basculin, 0901_ursaluna_bloodmoon, 0902_basculegion, 0971_greavard, 0972_houndstone) aparecem duplicados; nao alteram raridade.
6. **COSMETIC**: habilidade repetida normal+oculta deduplicada (169); `source` das formas Mega/Gmax que existem na base e no mega_showdown sai "cobblemon" (SPEC: addon vence, 73).
