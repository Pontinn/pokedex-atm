---
feature: berry-mutations
language: pt-BR
type: change
status: done
created: 2026-09-30
---
# IDEA: berry-mutations (cruzamento de bagas na pagina do item e tag na listagem)

## 1. Objetivo

Pontin (2026-09-30): "preciso que todas as berries que sao feitas com cruzamento tenham na pagina individual dela as instrucoes de COMO FAZER e quais cruzar e a chance de dar certo (caso haja essa informacao). As bagas que vao aparecer nas quais cruzar tem que ser possivel clicar nelas pra ver onde encontrar." Depois: "se nao tiver a chance, beleza. so a instrucao de como fazer ta otimo" (a chance existe, ver secao 7). E ainda: "preciso que logo na listagem de itens, as berries tenha uma tag se e obtida em mutacao ou no mundo, pra ficar facil de identificar".

O pedido nasceu de uma pesquisa previa: "quero saber se todas as berries sao encontradas no mundo ou se tem algumas que so sao possiveis fazer com cruzamento genetico entre outras berries".

## 2. Decisoes (lista viva)

- [2026-09-30] Slug `berry-mutations` confirmado pelo Pontin.
- [2026-09-30] A chance de mutacao EXISTE no jogo (12,5% por colheita; x4 com Surprise Mulch = 50%) e sera exibida.
- [2026-09-30] Na LISTAGEM de itens, cada baga recebe uma tag visivel: "Mutacao" ou "Mundo" (Pontin confirmou os nomes). Liechi leva as duas. Tambem entra um FILTRO por essa origem na busca de itens (Pontin: "sim").
- [2026-09-30] Correcao do "Plantavel" aprovada: a linha vira duas informacoes. "Encontrada no mundo: biomas X" SO para as 31 bagas com spawn real (`spawnConditions`), e "Cresce melhor em: biomas X" para todas (`preferredBiomeTags`, bonus de rendimento).
- [2026-09-30] Caminho inverso aprovado: na pagina das bagas usadas como ingrediente, mostrar "Usada em cruzamento: + Oran = Lum" (com as bagas clicaveis).
- [2026-09-30] Regra de nao-regressao (Pontin): "nada pode mudar, so deve ser acrescentado essas infos". Tudo e ADITIVO na pagina de item e na listagem; a unica alteracao de conteudo existente e a correcao do "Plantavel" (decisao acima, aprovada explicitamente).

## 3. Escopo

Regra do Pontin para a execucao autonoma (2026-09-30): "nao desvie do rumo ja definido e nao tome decisoes que eu nao tomaria". O escopo e exatamente o desta secao e das decisoes da secao 2; nada alem.

- Dentro: (a) pagina individual de cada baga obtida por cruzamento (39 bagas) mostra "Como cruzar": os pares que geram a baga, a mecanica (plantar lado a lado, sem diagonal, chance por colheita, Surprise Mulch), e cada baga parceira e clicavel (abre a pagina dela, com "Onde encontrar"); (b) pagina das bagas-ingrediente mostra "Usada em cruzamento" (caminho inverso); (c) tag de origem "Mutacao" / "Mundo" nos cards das bagas na listagem de itens + filtro por origem; (d) correcao do "Plantavel" (encontrada no mundo vs cresce melhor em).
- Fora / NAO mexer: nenhum conteudo, layout ou comportamento existente da pagina de item e da listagem muda (Pontin: "nada pode mudar, so deve ser acrescentado essas infos"). Sem tocar em outras telas (Home, Detail do Pokemon, Treinadores). Sem mudar dados de bagas que nao sejam origem/cruzamento (descricao, isca, receitas, drops).

## 4. Superficie de regressao

- Pagina de item (`src/screens/Item/ItemScreen.tsx`), linhas de "Como obter" ja existentes (plantable, drop, structureLoot, questReward, craftable, bait...).
- Listagem de itens (grade CSS simples com `content-visibility`, `ItemCard` memo, abas Berries e Iscas, busca) e os testes e2e dela (ja tiveram flake de timing, ver LESSONS). O card hoje so tem `.item-tag` (categoria) acima do nome e ha e2e que conferem o texto e a posicao dessa tag: ela NAO pode mudar; a tag de origem e um elemento novo com classe propria (como `.bait-badge`).
- Testes que mudam por causa da correcao aprovada do "Plantavel" (e so por ela): `item.spec.ts` (contagem de `.ob-row` da Occa), `item-screen.test.tsx` (linha plantable). Ajuste de teste so onde a mudanca foi aprovada; nenhum outro assert pode ser afrouxado.
- Testes de nao-sobreposicao da listagem em 360/390/1280 px precisam continuar verdes com a tag nova.
- Pipeline do dataset (`tools/dataset`), schema zod estrito, dataset publicado (LESSONS: "janela quebrada" ao mudar contrato; frontend so apos republicacao).
- Testes e2e da tela de itens e do item.

## 5. Papeis e permissoes

N/A: site publico, sem login e sem backend.

## 6. Entidades e ciclo de vida

N/A: sem CRUD; dados derivados do pack e publicados no dataset (somente leitura).

## 7. Regras de negocio e exemplos concretos (PESQUISA 2026-09-30, fontes reais)

Fontes: `data/cobblemon/berries/*.json` do Cobblemon 1.7.3 (snapshot em `data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar`), classes `BerryBlock`/`BerryBlockEntity`/`Berry` do jar real da instancia (strings), codigo-fonte do Cobblemon (GitLab cable-mc/cobblemon, `BerryBlock.kt`, funcao `determineMutation`) e wiki oficial (pagina Berry Tree).

- Cada baga tem `spawnConditions` (arbustos que NASCEM no mundo) e `mutations` (mapa parceiro -> resultado). `preferredBiomeTags` NAO e local de spawn: e so o bioma em que a baga cresce melhor (bonus de rendimento).
- 70 bagas no total: 31 nascem no mundo, 39 so por cruzamento (0 sem nenhuma origem).
- Nascem no mundo (31): aspear, babiri, bluk, charti, cheri, chesto, chilan, chople, coba, colbur, haban, kasib, kebia, liechi*, nanab, occa, oran, passho, payapa, pecha, persim, pinap, rawst, razz, rindo, roseli, shuca, tanga, wacan, wepear, yache. (*liechi so nasce no bioma da tag `cobblemon:is_mirage_island`, que contem `terralith:mirage_isles` (Mirage Isles do Terralith, presente no pack), 1 arbusto por vez; tambem sai de cruzamento kelpsy + pamtre.) oran e persim nascem em qualquer bioma (`all_biome`); as demais em grupos de 3 a 5 arbustos nos biomas preferidos (`preferred_biome`).
- So por cruzamento (39): aguav, apicot, belue, cornn, custap, durin, eggant, enigma, figy, ganlon, grepa, hondew, hopo, iapapa, jaboca, kee, kelpsy, lansat, leppa, lum, magost, mago, maranga, micle, nomel, pamtre, petaya, pomeg, qualot, rabuta, rowap, salac, sitrus, spelon, starf, tamato, touga, watmel, wiki.
- Pares (resultado <- A + B): aguav <- persim+rawst; apicot <- belue+grepa; belue <- nomel+payapa; cornn <- bluk+wiki; custap <- chilan+watmel; durin <- babiri+rabuta; eggant <- leppa + (aguav|figy|iapapa|wiki|mago); enigma <- hopo + (babiri|charti|chilan|chople|coba|colbur|haban|occa|passho|wacan|rindo|yache|kebia|shuca|payapa|tanga|kasib|roseli); figy <- cheri+persim; ganlon <- qualot+watmel; grepa <- nomel+yache; hondew <- rabuta+shuca; hopo <- leppa+lum; iapapa <- aspear+persim; jaboca <- charti+durin; kee <- enigma+kasib; kelpsy <- cornn+rindo; lansat <- chople+spelon; leppa <- oran + (bluk|nanab|razz|wepear|pinap); liechi <- kelpsy+pamtre; lum <- oran + (aspear|cheri|chesto|pecha|rawst); magost <- mago+nanab; mago <- pecha+persim; maranga <- enigma+wacan; micle <- kebia+pamtre; nomel <- iapapa+pinap; pamtre <- cornn+passho; petaya <- durin+hondew; pomeg <- haban+sitrus; qualot <- magost+roseli; rabuta <- aguav+wepear; rowap <- belue+coba; salac <- spelon+tamato; sitrus <- lum + (aguav|figy|iapapa|wiki|mago); spelon <- colbur+touga; starf <- pomeg + (grepa|hondew|kelpsy|qualot|tamato); tamato <- occa+touga; touga <- figy+razz; watmel <- magost+tanga; wiki <- chesto+persim. A SPEC deriva a lista dos arquivos, nunca desta copia (LESSONS).
- Mecanica (codigo `BerryBlock.determineMutation`): a cada colheita de uma arvore, o jogo olha os 4 vizinhos ortogonais (norte, sul, leste, oeste; NAO diagonal); cada vizinho que forma par valido com a arvore colhida entra na lista de mutacoes possiveis; rola `nextInt(1000) < 125` (12,5%); com Surprise Mulch na arvore a chance e x4 (50%); se passar, uma das mutacoes possiveis e sorteada e UMA das frutas da arvore colhida vira a baga mutante (`BerryBlockEntity.mutate` troca um growth point). O codigo nao exige maturidade do vizinho. Exemplo: Cheri ao lado de Oran; ao colher, 12,5% de uma das frutas ser Lum; com Surprise Mulch, 50%.
- Cadeias longas: ex. Starf precisa de Pomeg (haban + sitrus) e Sitrus precisa de Lum (oran + cheri...). A pagina deve permitir seguir a cadeia clicando.
- Fontes alternativas das 39 (dados do pack, ja parcialmente modeladas no dataset como structureLoot/questReward): bau `cobblemonextrastructures:chests/berry` (54 bagas), baus dungeon (apicot, custap, ganlon, lansat, liechi, micle, petaya, salac, sitrus, starf), loot de treinadores RCT (uncommon/rare/epic/legendary), loot ball friendship (Cobbleloots) e loja BP da Battle Tower (grepa, hondew, kelpsy, pomeg, qualot, tamato). Eggant e a UNICA sem nenhuma fonte alternativa: so cruzamento. Nenhum Pokemon dropa baga de cruzamento (species drops so tem bagas naturais).

## 8. Casos de borda / caminhos tristes

- Baga com muitos pares (enigma tem 18 parceiros com hopo; eggant/sitrus/lum/leppa/starf tem 5): a lista precisa caber bem no celular.
- Baga com AS DUAS origens (liechi: nasce na Mirage Isles E cruzamento): leva as duas tags e mostra as duas informacoes na pagina (decidido na secao 2).
- oran e persim nascem em qualquer bioma (`all_biome`): a linha "Encontrada no mundo" diz isso em vez de listar biomas.
- Eggant nao tem nenhuma fonte alem do cruzamento: a pagina dela continua mostrando so o que existe (cruzamento + o que ja aparece hoje).
- Bagas que nao sao de cruzamento nem ingrediente nao existem (todas as 31 naturais entram em algum par): mesmo assim, baga sem par nao ganha bloco vazio.
- Itens que nao sao bagas (apricorns, mints, que hoje tambem tem linha plantable) NAO ganham tag de origem nem blocos novos, e a linha plantable deles nao muda.
- Cadeia recursiva (parceiro que tambem e de cruzamento): link leva a pagina do parceiro, que mostra o proprio cruzamento.
- Pagina em EN e PT (nomes das bagas localizados; texto da mecanica traduzido).

## 9. Referencia de UI

mode: page:/item (pagina de item existente, painel "Como obter", padrao de linhas com icone + chips; bagas clicaveis com o componente ja existente `ItemLink` (src/screens/Detail/ItemLink.tsx, `navigate("item", {itemId})`, Voltar retorna a origem); `mon-chip` e para Pokemon, nao usar) e a listagem de itens (cards) para a tag de origem.

## 10. Prioridades

Tudo must-have (regra fixa do Pontin neste projeto).

## 11. Suposicoes confirmadas

- [2026-09-30] Separar "Encontrada no mundo" (spawn real) de "Cresce melhor em" (bonus): confirmado.
- [2026-09-30] Nomes das tags "Mutacao" e "Mundo"; Liechi leva as duas: confirmado.
- [2026-09-30] Filtro por origem na listagem alem da tag: confirmado.
- [2026-09-30] Caminho inverso ("Usada em cruzamento") nas bagas-ingrediente: confirmado.
- [2026-09-30] Chance exibida como texto fixo da mecanica (12,5%, 50% com Surprise Mulch), igual para todas: confirmado implicitamente ("se nao tiver a chance, beleza"; ela existe).

## 12. Pontos em aberto (lista viva)

- (resolvido 2026-09-30) Bug do "Plantavel": ver decisao na secao 2.
- (resolvido 2026-09-30) Caminho inverso: sim.
- (resolvido 2026-09-30, sem decisao nova) Liechi: a Mirage Isles aparece naturalmente na linha aprovada "Encontrada no mundo: biomas X" (o bioma de spawn dela e esse). Nenhum aviso extra.
- (resolvido 2026-09-30 pelo CONTEXT) Link item -> item ja existe (`ItemLink`); card da listagem so tem `.item-tag`; items.json hoje 1.499.586 bytes.
- Decisoes tecnicas que ficam para a SPEC (nao sao do Pontin): forma do contrato (novo `kind` de obtain vs campo novo no ItemInfo), onde fica a classificacao mundo/mutacao (dataset vs derivada no app), dedupe dos pares (os mapas `mutations` sao simetricos), teto de crescimento do items.json, apresentacao de lista longa (enigma com 18 pares) no padrao visual existente. O texto da mecanica (12,5%, x4, sem diagonal) vem do codigo do jogo, nao de arquivo do pack: fica como texto fixo traduzido PT/EN.
