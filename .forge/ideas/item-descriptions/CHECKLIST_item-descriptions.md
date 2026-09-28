# Checklist item-descriptions (quick)

Legenda: `[ ]` pendente, `[x]` feito (hash), `[!]` bloqueado.

## Backend (pipeline)
- [x] D1 (e4920b1c) Pipeline le `tooltip_N`, `tooltip.<ns>.<path>.tooltip`, `block.<ns>.<path>.tooltip`; remove `§x`; testes.
- [x] D2 (0399be87) Pipeline le `tools/dataset/curated/item-descriptions.json` (jogo vence; PT e EN obrigatorios; id inexistente = aviso); testes.
- [ ] D4 Dataset regenerado e publicado; auditoria e testes verdes; 3 paginas de item renderizadas.

## Textos
- [ ] D3 `tools/dataset/curated/item-descriptions.json` com os 283 ids de `MISSING_ITEMS_item-descriptions.txt`.

## Notas
- D1 medido (pipeline completo, publicado so em tools/dataset/out/_publish_test): ids do catalogo iguais ao publicado (949 = 949, mesmo conjunto); description null 605 -> 286; nenhum outro campo mudou. 2 descricoes existentes mudaram so por espaco no fim removido (allthemons:unobtainium_ball, allthemons:ancient_unobtainium_ball).
- Ordem das fontes do jogo: item.<ns>.<path>.tooltip, tooltip_1..N, tooltip.<ns>.<path>.tooltip, block.<ns>.<path>.tooltip. Valor vazio ou so com codigos conta como ausente. A descricao nao gera mais W_LANG_MISSING (le os mapas pt/en direto).
- D2: arquivo curado ausente = sem curadas (nao precisa placeholder). Entrada invalida (idioma faltando/vazio, campo extra, id sem namespace) derruba o pipeline com E_JSON_INVALID. Report: sections.items.descriptions {fromGame, fromCurated, none, curatedShadowedByGame, curatedUnknownIds} + aviso W_CURATED_ITEM_UNKNOWN.
- Neste PC foi preciso npm ci e aquecer tools/dataset/.cache (rede), autorizados pelo Pontin.

## Bugs encontrados
