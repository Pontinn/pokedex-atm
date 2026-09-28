# Checklist item-descriptions (quick)

Legenda: `[ ]` pendente, `[x]` feito (hash), `[!]` bloqueado.

## Backend (pipeline)
- [x] D1 (e4920b1c) Pipeline le `tooltip_N`, `tooltip.<ns>.<path>.tooltip`, `block.<ns>.<path>.tooltip`; remove `§x`; testes.
- [x] D2 (0399be87) Pipeline le `tools/dataset/curated/item-descriptions.json` (jogo vence; PT e EN obrigatorios; id inexistente = aviso); testes.
- [x] D1b (00d74ff4) Pipeline le tambem `tooltip.<ns>.<path>` (sem `.tooltip`), depois de `tooltip.<ns>.<path>.tooltip`; testes.
- [x] D5 (2fca6667) Texturas animadas (18 itens, ex. insignias do allthemons, stellar_tera_shard): copiar os `.png.mcmeta` do modpack para `data-source/` e publicar so o 1o quadro (o de `frames[0]`), sem esticar.
- [x] D6 (9b127dea dados, da8dd7b0 pipeline) Lang do kubejs (pt_br e en_us, se houver) copiado para `data-source/` e aplicado por cima dos jars; ids iguais; diff por categoria medido.
- [ ] D7 Textos curados: nomes PT alinhados ao lang do kubejs + 110 textos minecraft revisados mesclados no arquivo curado.
- [ ] D4 Dataset regenerado e publicado; auditoria e testes verdes; 3 paginas de item renderizadas.

## Textos
- [x] D3 (05245de0) `tools/dataset/curated/item-descriptions.json` com os 283 ids de `MISSING_ITEMS_item-descriptions.txt` (174 nao-minecraft escritos por este agente + `cobblemon:medicinal_brew` adicional; os 110 `minecraft:` ficam com outro agente).

## Notas
- D6: 8 arquivos de lang do kubejs copiados (pastas allthemodium, artifacts, cobblemon, cobblemon_legendary_monuments pt+en, cobblemon_mega_showdown, cobblemon_navas_za_megas, silent_gear); modular_bees/supplementaries/kubejs fora (sem chaves usadas). Kubejs: 579 chaves pt trocadas, 2093 acrescentadas; 1 en trocada/1 acrescentada. Diff vs mesma base sem D6 (mesmo curado): nomes PT de item 111, descricoes PT de item 13 trocadas e 0 novas (null segue 112), nomes de golpe 10, descricoes de golpe 54, descricoes de especie 90, nome de especie 1 (Flabebe -> Flabébé, tambem na evolutionChain de 669-671), habilidade 1 nome (Estamina -> Vigor) + 36 descricoes; nenhum texto EN mudou; ids iguais. Ajuste: nome de item so em pt (allthemodium, artifacts, silentgear) mantem EN humanizado em vez de copiar o PT.
- D5: 24 `.png.mcmeta` copiados dos jars para data-source (MANIFEST.additions, README). Pipeline recorta o quadro de frames[0] (sharp, sem redimensionar); 24 texturas mudam (18 usadas em items.json, todas 16x16 agora; 6 fora do items.json: deoxys_crystal x3, pokedex_screen x2, wearable/exp_share 32x32); nenhuma outra das 1347 texturas mudou em bytes; ids 949 iguais. Nenhuma textura usada ficou mais alta que larga.
- D1b: so legendarymonuments:darkstone_shard e lightstone_shard mudam (curado passa a ser sombreado pelo jogo, esperado); ids 949 iguais. Com curado (05245de0) + D1b: jogo 665, curado 172, sem descricao 112.
- D1 medido (pipeline completo, publicado so em tools/dataset/out/_publish_test): ids do catalogo iguais ao publicado (949 = 949, mesmo conjunto); description null 605 -> 286; nenhum outro campo mudou. 2 descricoes existentes mudaram so por espaco no fim removido (allthemons:unobtainium_ball, allthemons:ancient_unobtainium_ball).
- Ordem das fontes do jogo: item.<ns>.<path>.tooltip, tooltip_1..N, tooltip.<ns>.<path>.tooltip, block.<ns>.<path>.tooltip. Valor vazio ou so com codigos conta como ausente. A descricao nao gera mais W_LANG_MISSING (le os mapas pt/en direto).
- D2: arquivo curado ausente = sem curadas (nao precisa placeholder). Entrada invalida (idioma faltando/vazio, campo extra, id sem namespace) derruba o pipeline com E_JSON_INVALID. Report: sections.items.descriptions {fromGame, fromCurated, none, curatedShadowedByGame, curatedUnknownIds} + aviso W_CURATED_ITEM_UNKNOWN.
- Neste PC foi preciso npm ci e aquecer tools/dataset/.cache (rede), autorizados pelo Pontin.

## Bugs encontrados
