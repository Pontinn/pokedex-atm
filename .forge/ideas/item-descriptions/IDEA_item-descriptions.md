---
feature: item-descriptions
language: pt-BR
type: fix
status: done
mode: quick
created: 2026-09-28
---
# Descricoes dos itens (quick)

## 1. Objetivo
Pontin (2026-09-28): "tem muito item que ta sem descricao, nao consegue buscar isso em algum lugar?". No dataset publicado `atm1.3.0-cobblemon1.7.3-20260927-1344fc8b`, 605 de 949 itens tem `description: null`.

## 2. Decisoes
- Pontin (2026-09-28): "cheque tudo pra nao cometer erros, se necessario cheque mais de uma fonte". Cada fato do texto curado confirmado em mais de uma fonte quando possivel; divergencia = arquivos do modpack vencem e o id vira baixa confianca.
- Rodar como `--quick` na branch `feature/item-descriptions` (criada de `feature/pontindex` em 753364a6). Pontin: "use agentes pra tudo".
- Fonte 1 (jogo, prioridade maxima): os arquivos de idioma que ja estao em `data-source/atm-1.3.0/`. Hoje o pipeline so le `item.<ns>.<path>.tooltip` (`tools/dataset/src/items/catalog.ts:122`). Ha texto em outras chaves:
  - `item.<ns>.<path>.tooltip_1`, `tooltip_2`, ... (Cobblemon, ex. `air_balloon`, `kings_rock`, `brittle_candy`): 52 itens.
  - `tooltip.<ns>.<path>.tooltip` (mega_showdown e zamega, ex. `abomasite`, com codigos de cor `§7`): 266 itens.
  - `block.<ns>.<path>.tooltip`: 1 item. Total ~320, quase todos com PT.
- Fonte 2 (itens sem texto no jogo, 283 ids em `MISSING_ITEMS_item-descriptions.txt`): texto PROPRIO, curto, em PT e EN, escrito por agente a partir de pesquisa (PokeAPI `item/<id>` flavor text em EN para 37 deles; wiki do Minecraft, wiki do Cobblemon, paginas do All the Mons/mega_showdown para o resto). Guardado num arquivo curado versionado `tools/dataset/curated/item-descriptions.json`, que o pipeline le. Pontin: SEM aviso na tela; aparece igual as outras descricoes. Nunca copiar texto de wiki literalmente: reescrever.
- Precedencia: texto do jogo vence o curado.
- O modpack instalado (`C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`) foi varrido (lang de 323 jars + resourcepacks + kubejs): so +2 textos (`silentgear:sinew` via `.desc`), entao ele NAO e fonte do pipeline; o agente de textos pode consulta-lo.

## 3. Escopo
- Dentro: descricoes (campo `description`) dos itens ja existentes em `items.json`; republicar o dataset.
- Fora / NAO mexer: quais itens entram no catalogo (o conjunto de ids NAO muda); nomes; categorias; UI (so se a descricao nova quebrar o layout); os 2 ids quebrados `karrablast` e `shelmet` (bug antigo, anotado, fora deste escopo).

## 4. Superficie de regressao
Pagina de item e lista de itens; auditoria `tools/dataset/audit/`; testes do dataset (`tests/unit/dataset/`); precache da PWA (tamanho do items.json).

## 5-6. Papeis / entidades
N/A: site estatico, sem usuarios nem CRUD.

## 7. Regras e exemplos
- Varias linhas de tooltip (`tooltip_1`, `tooltip_2`) viram UM texto, na ordem numerica, unidas por espaco (ex. `kings_rock` EN: "When the holder successfully inflicts damage, the target may also flinch. Evolves Poliwhirl into Politoed and Slowpoke into Slowking when held during trading").
- Codigos de formatacao do Minecraft (`§` + 1 caractere) sao removidos (ex. `§7Allows Abomasnow to Mega Evolve into Mega Abomasnow` -> `Allows Abomasnow to Mega Evolve into Mega Abomasnow`).
- Se so houver EN no jogo, PT cai no comportamento atual de fallback do `lang.text`.

## 8. Casos de borda
Chave de tooltip vazia; tooltip so com codigos de cor; `tooltip_N` com buraco na numeracao; id curado que nao existe no catalogo (ignorar e avisar no relatorio do pipeline); texto curado so em um idioma (invalido: exigir PT e EN).

## 9. Referencia de UI
N/A (sem mudanca de UI).

## 10. Prioridades
Tudo must-have: o maximo de itens com descricao.

## 11. Premissas confirmadas
Pontin confirmou: texto proprio sem aviso; pesquisar na internet o que sobrar; agentes para tudo.

## 12. Pontos em aberto
Nenhum.

## Plano (quick)
1. Agente pipeline (Opus): em `catalog.ts`/`lang.ts`, ler as chaves extras + remover `§x` + ler o arquivo curado (schema validado, PT e EN obrigatorios, jogo vence). Testes unitarios. Commit.
2. Agente textos (Sonnet, em paralelo, arquivos disjuntos): escrever `tools/dataset/curated/item-descriptions.json` para os 283 ids. Commit.
3. Agente pipeline (continua): regenerar e publicar o dataset, rodar a auditoria e os testes, abrir a pagina de 3 itens (um de cada fonte) para ver que renderiza. Commit do dataset.

## Adendo 2026-09-28: texturas animadas (Pontin, print da "Insignia da Gatinha")
- 18 texturas de item publicadas sao tiras animadas (16x128 a 16x288): no jogo um `.png.mcmeta` anima os quadros; o site mostra a tira inteira espremida. `data-source/` nao tem nenhum `.mcmeta`.
- Decisao do orquestrador (default seguro, Pontin pode pedir animacao depois): publicar SO o quadro de `frames[0]` (ou o 0 se nao houver lista), quadrado (largura x largura, ou `width`/`height` do mcmeta). Ids do catalogo e UI nao mudam.

## Adendo 2026-09-28: traducao PT-BR do kubejs (Pontin aprovou nesta branch)
- O modpack traz `kubejs/assets/<ns>/lang/pt_br.json` (154 arquivos, 61 mil chaves), que no jogo em portugues vale por cima do lang dos jars. `data-source/` nao tem esses arquivos e o pipeline nao os le. A regra do projeto ja e "kubejs substitui o jar" (dados); passa a valer tambem para idioma.
- Impacto medido vs dataset publicado: 113 nomes PT de item (ex. Bola Grande -> Grande Bola; Allthemodium Ingot -> Lingote de Allthemodium), 317 descricoes PT de item novas, 19 diferentes, 44 nomes de golpe (maiusculas), 138 descricoes de especie, 63 de golpe, 1 habilidade (Estamina -> Vigor), 1 especie (Flabebe -> Flabébé).
- O resource pack "Cobblemon PT-BR.zip" da instancia NAO esta ativo (options.txt) e fica de fora. 2 arquivos do kubejs sao JSON invalido (modular_bees, supplementaries): namespaces fora do app; ignorados com aviso.
- D6: pipeline le o lang do kubejs por cima dos jars. D7: textos curados passam a citar os nomes PT novos + mesclar os 110 textos minecraft revisados. D4: publicar.
