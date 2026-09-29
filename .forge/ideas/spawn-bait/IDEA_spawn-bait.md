---
feature: spawn-bait
language: pt-BR
type: change
status: done
created: 2026-09-29
---
# IDEA: spawn-bait (iscas de spawn: Poke-Lanche e Pokeisca)

## 1. Objetivo

Pontin (2026-09-29): "no all the mons tem um bolo que voce pode fazer e usar diversos materiais que funcionam como uma isca para spawnar certos pokemons [...] quando voce clica em um pokemon, vai pra tela dela e tem a aba do bolo com a isca certa no bioma certo". Depois: "na pagina individual do pokemon tem a aba de 'como encontrar' [...] daria pra so colocar pra aparecer o tipo de isca que voce pode usar pra spawnar o pokemon". E: "eu quero que seja os dois" (o bolo do chao e a isca da vara). Resumo dele: "na pagina do pokemon vc vai ter q mostrar quais frutas usar pra criar o bolo pra spawnar aquele pokemon com mais facilidade".

Dor: o jogador ve onde o Pokemon spawna, mas nao sabe qual baga/tempero usar no Poke-Lanche ou na Pokevara para fazer ele aparecer mais. Hoje o Pontindex marca os itens como "Iscas" na aba Itens, mas nao mostra efeito nenhum nem liga isca a Pokemon.

## 2. Decisoes

- [2026-09-29] O "bolo" e o **Poke-Lanche** (`cobblemon:poke_snack`, en "Poke Snack", comunidade chama "Lure Cake"). Confirmado nos dados do pack (avanco `cook_snack`: "um bolo delicioso que pode atrair certos Pokemon dependendo das frutas usadas"), na wiki oficial e no jar real (classes `PokeSnackBlockEntity`, `SpawnBaitInfluence`). Pontin confirmou: "e esse mesmo".
- [2026-09-29] O **Poke-Bolo** (`cobblemon:poke_cake`) e so comida do jogador (tempero cosmetico). FORA do escopo.
- [2026-09-29] Escopo cobre os DOIS usos da mesma tabela de efeitos (`spawn_bait_effects`): Poke-Lanche no chao (spawns terrestres) e Pokeisca/baga na Pokevara (spawns de pesca).
- [2026-09-29] Onde mostrar: bloco "Iscas" DENTRO do painel "Onde encontrar" existente (`src/screens/Detail/WherePanel.tsx`), sem aba nova, sem mexer no que ja existe la.
- [2026-09-29] Recomendacao derivada dos DADOS (tipos + grupos de ovo do Pokemon x efeitos `typing`/`egg_group` das bagas). Nenhuma lista manual.
- [2026-09-29] Mostrar tambem os reforcos genericos (maca dourada, maca dourada encantada, cenoura dourada: raridade e shiny) numa linha curta, valem para qualquer Pokemon.
- [2026-09-29] Na pagina de cada baga/isca, mostrar os efeitos dela (tipo, grupo de ovo, natureza, raridade, shiny...). NAO listar todos os Pokemon que ela atrai.
- [2026-09-29] Nomes de item clicaveis, como ja e hoje no painel.
- [2026-09-29] Pontin: mostrar so as **3 melhores** bagas por Pokemon (a panela aceita ate 3 temperos). Ordem de desempate (sugestao aceita): bagas de TIPO primeiro (na ordem dos tipos do Pokemon), depois bagas de GRUPO DE OVO (na ordem dos grupos). Todas tem o mesmo efeito (10x), entao a ordem e so preferencia de leitura.
- [2026-09-29] Pontin: a linha de reforcos genericos (raridade/shiny) fica DENTRO do bloco "Iscas".
- [2026-09-29] Pontin: os 7 itens de isca fora do catalogo ENTRAM no catalogo (aba Itens, categoria "Iscas"), com pagina e link.
- [2026-09-29] Pontin: o Poke-Lanche (`poke_snack`) ENTRA no catalogo, com a receita da Panela de Fogueira na pagina dele, para o bloco "Iscas" linkar.
- [2026-09-29] Pontin: sem numero ("x10") no bloco "Iscas"; so a lista das bagas com o tipo/grupo entre parenteses. Numeros ficam na pagina do item.
- [2026-09-29] Orquestrador (tecnico, para a SPEC): efeitos das iscas publicados em `items.json`; recomendacao por Pokemon calculada no app (nao inflar species/*.json); condicoes de pesca (`bait`, `rodType`, Lure) viram campos tipados de `SpawnEntry` e aparecem na linha do spawn.
- [2026-09-29] Receitas da panela (`cobblemon:cooking_pot`): CORRIGIDO pela revisao do CONTEXT. O pipeline JA le todas as receitas (a Pokeisca ja tem rota `craftable` de `cooking_pot_shapeless`); so itens do catalogo ganham rota. O trabalho real e (a) colocar o Poke-Lanche no catalogo e (b) a pagina do item passar a mostrar os INGREDIENTES da receita, porque hoje mostra so o rotulo da estacao. Alinhar o rotulo "Panela de cozinha" com o nome do jogo: "Panela de Fogueira" (titulo da GUI; o bloco se chama "Panela <Cor> para Fogueira"). O resto da panela continua fora.
- [2026-09-29] Revisao do CONTEXT: texturas dos 8 itens novos. `poke_snack` JA tem textura publicada (falta so a chave `item.cobblemon.poke_snack` no lang, existe so `block.`). Os 5 itens vanilla (golden_apple, enchanted_golden_apple, golden_carrot, glistering_melon_slice, glow_berries) precisam de modelo + textura copiados do jar vanilla para `data-source/` (com `MANIFEST.json additions`). Os 2 de allthemodium nao tem caminho de textura hoje: decisao do orquestrador, copiar a textura do jar real da instancia para o snapshot e estender a midia, para todo item do catalogo continuar com textura (Pontin pode reverter).
- [2026-09-29] Regra: so entra na recomendacao (e na linha de reforcos) item que a panela ACEITA como tempero (SO a tag `cobblemon:recipe_filters/bait_seasoning`, incluindo o que o script `kubejs/server_scripts/Tweaks/tags.js` acrescenta a ela; ter arquivo em `seasonings/**` NAO e criterio, as bagas nem tem). Uma baga com efeito mas fora da tag nao e recomendada para o bolo.
- [2026-09-29] CONTEXT (2a passada): a tag `bait_seasoning` cobre as 72 bagas + 7 itens vanilla; as 2 macas/cenouras de allthemodium entram na tag por script kubejs (`server_scripts/Tweaks/tags.js`). A `mythical_pecha_berry` do kubejs tem efeito de isca proprio (Agua 3 + Inseto, x20) mas NAO esta na tag: pela regra acima fica FORA da recomendacao (a confirmar com o Pontin; se ele quiser, entra como excecao).
- [2026-09-29] Orquestrador: o Poke-Lanche entra no catalogo com a categoria "Iscas" (tag `bait`), nao "cozinha", para nao mostrar a nota de "efeito pendente" da categoria cozinha.
- [2026-09-29] Orquestrador: ingredientes da receita cuja pagina nao existe no catalogo (ex. trigo) aparecem como texto simples, sem link (comportamento atual do `ItemLink`).
- [2026-09-29] Orquestrador (revisao do PRD): os multiplicadores por nivel de Lure ENTRAM, tanto no campo singular `weightMultiplier` (objeto, 159 spawns) quanto na lista `weightMultipliers` (198 spawns): viram um so campo tipado do spawn (lista de {lureMin, lureMax, multiplicador}); multiplicadores com outras condicoes (timeRange, isRaining, isThundering...) seguem em `extra`, fora do escopo e aparecem na linha do spawn de pesca junto com o Lure minimo/maximo (ex. Staryu "Lure 3: x3"). Nao ficam so em `extra`.

- [2026-09-29] Pokemon sem nenhum spawn nao ganha bloco de iscas (isca nao cria spawn onde nao existe; Poke-Lanche so atrai quem ja esta na tabela do bioma).

## 3. Escopo

Dentro:
- Pipeline: publicar os efeitos de `data/cobblemon/spawn_bait_effects/**` (hoje so gera a tag `bait`), e manter no spawn as condicoes `bait` (isca obrigatoria), `rodType` e `minLureLevel`/`maxLureLevel` (peso por encantamento Lure), que hoje sao descartadas ou ficam so em `extra`.
- App: bloco "Iscas" em "Onde encontrar" (por Pokemon) e efeitos na pagina do item.

Fora (NAO tocar):
- Poke-Bolo (`poke_cake`), Poke Puffs, sabores (flavour), Aprijuices e o resto da panela (so as receitas do Poke-Lanche e da Pokeisca entram).
- Lista de Pokemon por isca na pagina do item.
- Tudo que ja existe no painel "Onde encontrar" (biomas, raridade, drops, "Como obter"): so ACRESCENTAR o bloco.
- Apps nativos (ideia `pontindex-app`).

## 4. Superficie de regressao

- Painel "Onde encontrar" (`WherePanel.tsx`): raridade, entradas de spawn (colapsa apos 6), drops, rotas "Como obter".
- Aba Itens: categoria "Iscas" (tag `bait`) e paginas de item (`src/screens/Item/`).
- Pipeline do dataset (`tools/dataset/`): `items.json` e `species/*.json` gerados byte a byte iguais entre instancia real e snapshot `data-source/`; auditoria com 0 divergencias.
- Testes: vitest 79 arquivos / 618, e2e 230 verdes (estado no fim do `pwa-auto-update`).

## 5. Papeis e permissoes

N/A. Site estatico sem login; todo mundo ve tudo.

## 6. Entidades e ciclo de vida

Somente leitura (dataset gerado). Nao ha criar/editar/apagar pelo usuario.
- Efeito de isca: item -> lista de efeitos {type, subcategory?, chance, value}.
- Recomendacao por Pokemon: derivada em tempo de build ou de render (decidir na SPEC) a partir de tipos + grupos de ovo.

## 7. Regras de negocio e exemplos

Fatos verificados nos arquivos do pack (Cobblemon 1.7.3):
- Poke-Lanche: receita na Panela de Fogueira, 3 leite + 2 mel + 1 Vivichoke + 3 Graos Robustos, ate 3 temperos da tag `cobblemon:recipe_filters/bait_seasoning` (bagas, maca, maca dourada, maca dourada encantada, cenoura dourada, glow berries, sweet berries). Processadores `food_colour`, `ingredient`, `spawn_bait`.
- Pokeisca (`poke_bait`): mel + cogumelo + trigo, mesmos temperos, processador `spawn_bait`. Bagas e frutas tambem vao direto na vara.
- Poke-Lanche colocado no chao: Pokemon spawnam em volta e mordem (9 mordidas). Config do pack `pokeSnackPokemonPerChunk: 2`. So atrai Pokemon que ja estao na tabela de spawn do bioma (wiki).
- Efeitos `typing` (18 bagas, uma por tipo): chance 1.0, value 10 = 100% de chance de multiplicar por 10 o peso dos Pokemon daquele tipo. Occa=fire, Passho=water, Wacan=electric, Rindo=grass, Yache=ice, Chople=fighting, Kebia=poison, Shuca=ground, Coba=flying, Payapa=psychic, Tanga=bug, Charti=rock, Kasib=ghost, Haban=dragon, Colbur=dark, Babiri=steel, Roseli=fairy, Chilan=normal.
- Efeitos `egg_group` (7 bagas, value 10): Cheri=fairy+grass, Chesto=human_like+flying, Lum=dragon+monster, Pecha=water_3+bug, Persim=mineral+amorphous, Rawst=field, Aspear=water_1+water_2.
- Outros efeitos: nature (20), ev (6), iv (6), bite_time (9), rarity_bucket (4: golden_carrot +1, golden_apple +1, enchanted_golden_apple +10), shiny_reroll (3), gender_chance (2), level_raise (2), pokemon_chance (2), ha_chance (1), friendship (1), drops_reroll (1).
- Condicoes de spawn ligadas a pesca: `bait: cobblemon:love_sweet` (3 spawns, Wooper com coracao), `rodType` (ex. `cobblemon:love_rod`), `minLureLevel`/`maxLureLevel` e `weightMultipliers` por nivel de Lure.
- Achados do CONTEXT (2026-09-29): os ids de tipo e de grupo de ovo do dataset sao IGUAIS aos `subcategory` das bagas (cruzamento direto). O kubejs do pack tem 3 arquivos de `spawn_bait_effects`: `allthemodium_apple` e `allthemodium_carrot` (novos) e `enchanted_golden_apple` que SOBRESCREVE o do jar (raridade +10, shiny x5); o pipeline hoje nao le esses arquivos (so jars), precisa ler kubejs com precedencia kubejs > jar. 7 itens de isca nao estao no catalogo `items.json` (golden_apple, enchanted_golden_apple, golden_carrot, glistering_melon_slice, glow_berries, allthemodium_apple, allthemodium_carrot). `cobblemon:poke_snack` tambem nao esta no catalogo (tem textura publicada, falta a chave `item.` no lang, ver decisao acima); `poke_bait` esta (categoria `other`). Instancia real do pack existe neste PC (CurseForge, "All the Mons - ATMons", 1.3.0) para a checagem byte a byte.

Exemplo confirmado com o Pontin: Charizard (Fogo/Voador, grupos Monstro e Dragao) -> "Occa (Fogo), Coba (Voador), Lum (Dragao/Monstro)". Spawn no chao -> "Poke-Lanche"; spawn de pesca -> "Pokeisca ou baga na vara"; os dois -> os dois.
Exemplo da regra "3 melhores" (a confirmar): Gyarados (Agua/Voador, grupos Agua 2 e Dragao) bate com Passho (Agua), Coba (Voador), Aspear (Agua 1/Agua 2) e Lum (Dragao/Monstro); mostra so Passho, Coba, Aspear. Pokemon monotipo com 1 grupo, ex. Onix (Pedra/Terra, grupo Mineral): Charti (Pedra), Shuca (Terra), Persim (Mineral/Amorfo).

## 8. Casos de borda / caminhos tristes

- Pokemon sem spawn (so evolucao, fossil, addon): sem bloco de iscas.
- Pokemon so com spawn de pesca: so a linha da vara; so terrestre: so o Poke-Lanche.
- Spawn que exige isca especifica (`bait`) ou vara especifica (`rodType`): mostrar na linha do spawn.
- Baga cujo efeito nao se aplica ao Pokemon (natureza, EV...): nao entra na recomendacao por Pokemon, so na pagina do item.
- Item de isca sem nome no lang: regra atual (en obrigatorio, pt cai para en).

## 9. Referencia de UI

mode: page:/pokemon/<id> (painel "Onde encontrar" atual, `WherePanel.tsx`) e page:/item/<id> (pagina do item). Identidade do projeto. Pontin aprova vendo no navegador (prototipo ou print antes de aprovar).

## 10. Prioridades

Tudo must-have (Pontin nao quer perguntas de must vs nice). Ordem natural: pipeline -> bloco no painel -> efeitos na pagina do item.

## 11. Assuncoes confirmadas

- [2026-09-29] Slug `spawn-bait`: ok ("isso").
- [2026-09-29] Bloco dentro de "Onde encontrar", sem aba nova: ok.
- [2026-09-29] Reforcos genericos numa linha: ok.
- [2026-09-29] Efeitos na pagina do item, sem lista de Pokemon: ok.
- [2026-09-29] Nomes clicaveis: ok.
- [2026-09-29] 3 melhores bagas, tipo antes de grupo de ovo, reforcos dentro do bloco: ok (Pontin: "os 3 melhores", "segue a sugestao", "dentro do iscas").
- [2026-09-29] 7 iscas no catalogo: sim. Poke-Lanche no catalogo com receita: sim. Sem "x10" no bloco: ok ("segue a sugestao").
- [2026-09-29] Suposicoes confirmadas com "ok": (1) bloco "Iscas" logo abaixo da lista de spawns, antes dos drops e do "Como obter"; (2) Poke-Lanche mostrado para todo spawn que nao e pesca (chao, agua, superficie); (3) formas regionais nao ganham lista separada, usa tipos/grupos da pagina da especie; (4) pagina do item usa os textos do proprio jogo (pt e en no pack) com numeros; (5) linha de reforcos = itens com efeito rarity_bucket ou shiny_reroll que a panela aceita: pelos dados sao 7 (cenoura dourada, maca dourada, maca dourada encantada, fatia de melancia reluzente, baga Starf, allthemodium apple/carrot; lista corrigida pela revisao do PRD, a regra e o que vale), so nome + "raridade"/"shiny", sem numero; (6) isca obrigatoria aparece na linha do spawn e o bloco segue com as bagas; (7) versao nova do dataset; as texturas dos itens vao para o cache de runtime do PWA, nao para o precache (corrigido pela revisao do CONTEXT: o `vite.config.ts` so precacheia o app, texturas entram sob demanda); (8) PT e EN.

## 12. Pontos em aberto

- (fechado) recomendacao calculada no app; efeitos publicados em items.json.
- (fechado) Poke-Lanche vale para todo contexto que nao e `fishing` (suposicao 2 confirmada).
- (fechado) ids de grupo de ovo e tipo batem com as bagas (CONTEXT).
