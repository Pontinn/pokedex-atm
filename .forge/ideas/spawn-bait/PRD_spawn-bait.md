---
feature: spawn-bait
language: pt-BR
status: draft
---

# PRD - spawn-bait (iscas de spawn: Poke-Lanche e Pokeisca)

## Revision History

| Data | Revisao | O que mudou |
|---|---|---|
| 2026-09-29 | 1 | Criacao do PRD a partir da IDEA (bf71782d53ff; 9418c23e99eb na revisao 3; 0773bf058e17 na revisao 4; 3121bd574c08 na revisao 5) e do CONTEXT (6ea22e108cb8). |
| 2026-09-29 | 2 | Respostas do orquestrador (autonomia total do usuario) incorporadas: mythical_pecha_berry confirmado fora; 2 itens de Allthemodium como excecao curada de tempero; texturas de Allthemodium confirmadas; limites numericos aceitos; exemplo do Magikarp aceito; textos de UI vao para SPEC/UISPEC; auditoria virou requisito. Perguntas em aberto reduzidas a 0. |
| 2026-09-29 | 3 | Correcoes do reviewer: reforcos genericos passam a 7 itens (regra governa, lista ilustrativa); RNF-02 mede texturas referenciadas por `items.json`; `weightMultipliers` por Lure entram no escopo (RF-40, RF-55, RF-56, CA-34); RF-45 fundido em RF-09; CA-02 corrigido (agua/superficie e pesca); nota do teste `item-page.test.ts` (RF-30, RNF-03); RNF renumerados em ordem crescente; fingerprint da IDEA atualizado. |
| 2026-09-29 | 4 | `weightMultiplier` singular e lista `weightMultipliers` de Lure unificados no mesmo campo tipado (RF-46, CA-17), outras condicoes seguem em `extra`; RF de UI dos multiplicadores movido para a secao 4.2 (RF-24); RF e CA RENUMERADOS em ordem crescente (o antigo RF-45 "removido" foi eliminado; ids das revisoes anteriores nao valem mais); fingerprint da IDEA atualizado. |
| 2026-09-29 | 5 | CA-19 separa texto da UI ("6x" do proprio jogo) do dado publicado (`value` 5); RF-47 explicita que o rotulo da estacao vive no dicionario i18n central, sem excecao; categoria dos itens de isca esclarecida em RF-33, RF-37 e CA-23; fingerprint da IDEA atualizado. |

## Baseline (drift anchor)

- `HEAD`: `5cf52024`
- `IDEA_spawn-bait.md` (`git hash-object`, 12 chars): `3121bd574c08`
- `CONTEXT_spawn-bait.md` (`git hash-object`, 12 chars): `6ea22e108cb8`

## 1. Objetivo e visao

**Problema.** No All the Mons o jogador pode cozinhar um bolo (o Poke-Lanche, `cobblemon:poke_snack`) e usar frutas e bagas como tempero para atrair certos Pokemon, e pode usar a Pokeisca ou a baga direto na Pokevara para atrair Pokemon de pesca. Hoje o Pontindex mostra onde o Pokemon spawna (painel "Onde encontrar"), mas nao diz qual baga ou tempero usar para faze-lo aparecer mais. Os itens marcados como "Iscas" na aba Itens nao mostram efeito nenhum nem se ligam a Pokemon.

**Para quem.** Jogador do modpack que consulta a ficha de um Pokemon para caca-lo (persona unica, secao 2).

**Por que agora.** Pedido direto do Pontin em 2026-09-29: "na pagina do pokemon vc vai ter q mostrar quais frutas usar pra criar o bolo pra spawnar aquele pokemon com mais facilidade".

**Impacto esperado.** O jogador abre a ficha, ve em uma linha quais 3 bagas colocar no Poke-Lanche (ou na vara) e clica no nome da baga para ler o efeito dela, sem sair do app nem consultar wiki.

**Metrica de sucesso (verificavel).**
- 100% dos Pokemon com ao menos um spawn e ao menos uma baga aplicavel mostram o bloco "Iscas" com no maximo 3 bagas, calculadas dos dados (zero lista manual).
- Os 4 exemplos de referencia (Charizard, Gyarados, Onix, Magikarp) produzem exatamente a saida da secao 6.
- Nenhum teste existente regride (vitest e e2e verdes) e a auditoria do dataset segue com 0 divergencias.

## 2. Publico-alvo (personas)

- **Jogador do ATMons (Pontin e amigos)**: joga o modpack All the Mons 1.3.0, usa o Pontindex no desktop ou no celular (PWA), em PT ou EN. Quer saber como atrair um Pokemon especifico e o que cada baga faz.

## 3. Escopo

**Dentro do escopo**
- Pipeline: publicar os efeitos de isca de `data/cobblemon/spawn_bait_effects/**` (hoje so gera a tag `bait`), com o override do kubejs sobre o jar; manter no spawn as condicoes de pesca `bait` (isca obrigatoria), `rodType` e `minLureLevel`/`maxLureLevel` (Lure); publicar os ingredientes das receitas da panela do Poke-Lanche e da Pokeisca.
- Catalogo de itens: entram 8 itens novos (7 iscas fora do catalogo + Poke-Lanche), categoria "Iscas", com textura, nome PT/EN, pagina e link.
- App: bloco "Iscas" dentro do painel "Onde encontrar" (por Pokemon) e efeitos + receita na pagina do item.
- PT e EN em todo texto novo.

**Fora do escopo (NAO tocar)**
- Poke-Bolo (`cobblemon:poke_cake`), Poke Puffs, sabores (flavour), Aprijuices e o resto da panela (so as receitas do Poke-Lanche e da Pokeisca entram).
- Lista de Pokemon atraidos por cada isca na pagina do item.
- Tudo que ja existe no painel "Onde encontrar" (biomas, raridade, drops, "Como obter"): so ACRESCENTAR o bloco.
- Apps nativos (ideia `pontindex-app`).

## 4. Requisitos funcionais

Prioridade: todos `[MUST]` (declarado pelo usuario). Papeis e permissoes: N/A (site estatico sem login, todo mundo ve tudo). Ciclo de vida: dados gerados somente leitura, sem criar/editar/apagar pelo usuario.

Restricoes tecnicas registradas na IDEA (constraints, nao expandir): efeitos das iscas publicados em `items.json`; recomendacao por Pokemon calculada no app (sem inflar `species/*.json`); condicoes de pesca viram campos tipados de `SpawnEntry`.

### 4.1 Bloco "Iscas" na ficha do Pokemon

- **RF-01** `[MUST]` O sistema deve exibir, no painel "Onde encontrar" da ficha do Pokemon, um bloco "Iscas" posicionado logo abaixo da lista de spawns e antes dos drops e do "Como obter", sem aba nova.
- **RF-02** `[MUST]` O sistema deve manter inalterado tudo o que o painel "Onde encontrar" ja mostra (raridade, entradas de spawn com colapso, drops, rotas "Como obter"); o bloco e apenas acrescentado.
- **RF-03** `[MUST]` O sistema deve mostrar no bloco "Iscas" uma linha "Poke-Lanche" quando o Pokemon tem ao menos um spawn cujo contexto NAO e `fishing` (chao, agua, superficie, fundo).
- **RF-04** `[MUST]` O sistema deve mostrar no bloco "Iscas" uma linha "Pokeisca ou baga na vara" quando o Pokemon tem ao menos um spawn de contexto `fishing`.
- **RF-05** `[MUST]` O sistema deve mostrar as duas linhas (RF-03 e RF-04) quando o Pokemon tem spawns dos dois tipos, e somente a linha aplicavel quando tem so um tipo.
- **RF-06** `[MUST]` O sistema NAO deve exibir o bloco "Iscas" para Pokemon sem nenhum spawn (so evolucao, fossil, addon), porque isca nao cria spawn onde ele nao existe.
- **RF-07** `[MUST]` O sistema deve recomendar as bagas comparando os tipos e os grupos de ovo do Pokemon (da pagina da especie, sem lista separada para formas regionais) com os efeitos de tipo (`typing`) e de grupo de ovo (`egg_group`) das iscas publicadas nos dados, sem nenhuma lista manual de Pokemon x baga.
- **RF-08** `[MUST]` O sistema deve considerar na recomendacao somente itens que a panela aceita como tempero (tag `cobblemon:recipe_filters/bait_seasoning`), contando tambem como tempero aceito `allthemodium:allthemodium_apple` e `allthemodium:allthemodium_carrot` (acrescentados a tag pelo script `kubejs/server_scripts/Tweaks/tags.js`); a presenca de arquivo em `seasonings/**` nao e criterio.
- **RF-09** `[MUST]` O sistema NAO deve recomendar `allthemons:mythical_pecha_berry`: ela fica fora da recomendacao e fora do catalogo; nenhum efeito dela e publicado (os efeitos dela vem de `seasonings/*.baitEffects`, que o pipeline nao le, e ela nao esta na tag de tempero). Decidido (confirmado pelo orquestrador).
- **RF-10** `[MUST]` O sistema deve mostrar no maximo as 3 melhores bagas por Pokemon (a panela aceita ate 3 temperos).
- **RF-11** `[MUST]` O sistema deve ordenar as bagas candidatas por: primeiro bagas de TIPO na ordem dos tipos do Pokemon, depois bagas de GRUPO DE OVO na ordem dos grupos do Pokemon, cortando em 3. Uma baga que casa por mais de um criterio aparece uma unica vez, na posicao do primeiro criterio em que casou.
- **RF-12** `[MUST]` O sistema deve exibir cada baga do bloco como "Nome (tipo)" ou "Nome (grupo de ovo)", com o tipo pelo nome localizado do tipo e o grupo pelo rotulo localizado do grupo de ovo; baga de grupo com dois grupos mostra os dois separados por "/" (ex. "Lum (Dragao/Monstro)").
- **RF-13** `[MUST]` O sistema NAO deve exibir numeros (ex. "x10") no bloco "Iscas"; os numeros ficam so na pagina do item.
- **RF-14** `[MUST]` O sistema deve tornar cada nome de item do bloco (Poke-Lanche, Pokeisca, bagas, reforcos) clicavel, abrindo a pagina do item e respeitando a navegacao com historico (Voltar retorna a ficha do Pokemon).
- **RF-15** `[MUST]` O sistema deve mostrar, dentro do bloco "Iscas", uma linha curta de reforcos genericos com todo item que tem efeito `rarity_bucket` ou `shiny_reroll` E que a panela aceita como tempero (RF-08), cada um como nome clicavel + "raridade" ou "shiny", sem numero, valida para qualquer Pokemon que tenha o bloco. A REGRA governa; a lista e ilustrativa dos dados atuais (7 itens): cenoura dourada, maca dourada, maca dourada encantada, maca de Allthemodium, cenoura de Allthemodium, fatia de melancia cintilante (`minecraft:glistering_melon_slice`, rarity_bucket 1) e Starf Berry (`cobblemon:starf_berry`, shiny_reroll 4).
- **RF-16** `[MUST]` O sistema deve incluir na linha de reforcos somente itens aceitos como tempero pela panela (RF-08).
- **RF-17** `[MUST]` O sistema NAO deve recomendar no bloco por Pokemon baga cujo efeito nao se aplica ao Pokemon (natureza, EV, IV etc.); esses efeitos aparecem so na pagina do item.
- **RF-18** `[MUST]` O sistema deve continuar exibindo o bloco (com as linhas de contexto e a linha de reforcos) quando o Pokemon tem spawn mas nenhuma baga de tipo/grupo aplicavel (menos de 3 ou nenhuma), listando apenas as que existem.

### 4.2 Condicoes de pesca na linha do spawn

- **RF-19** `[MUST]` O sistema deve mostrar na linha de um spawn de pesca que exige isca especifica (`bait`, ex. `cobblemon:love_sweet` no Wooper) o nome da isca exigida, como item clicavel quando ela tem pagina e como texto simples quando nao tem.
- **RF-20** `[MUST]` O sistema deve mostrar na linha de um spawn de pesca que exige tipo de vara especifico (`rodType`, ex. `cobblemon:love_rod`) o nome do tipo de vara.
- **RF-21** `[MUST]` O sistema deve mostrar na linha do spawn o nivel de Lure exigido ou limitado (`minLureLevel`/`maxLureLevel`), em texto localizado (ex. "Lure 2" ou faixa "Lure 2 a 2" quando min e max existem).
- **RF-22** `[MUST]` O sistema deve manter, para um spawn com isca obrigatoria, o bloco "Iscas" seguindo com as bagas do Pokemon; a isca obrigatoria aparece so na linha do spawn.
- **RF-23** `[MUST]` O sistema NAO deve alterar a contagem nem o conteudo dos elementos ja existentes da linha do spawn (biomas, badges, tags, `.cond`); os chips novos usam classe propria.
- **RF-24** `[MUST]` O sistema deve mostrar na linha do spawn de pesca os multiplicadores por Lure junto com o Lure minimo/maximo (RF-21), em texto localizado (ex. Staryu: "Lure 3: x3", conforme os valores reais de `species/120.json`); numeros permitidos aqui (a regra de RF-13 vale so para o bloco "Iscas").

### 4.3 Pagina do item

- **RF-25** `[MUST]` O sistema deve exibir na pagina de cada baga/isca com efeitos um painel de efeitos, com os textos do proprio jogo em PT e EN (idioma dos termos do card) e com os numeros (tipo/grupo de ovo com multiplicador, natureza, EV, IV, tempo de mordida, raridade, shiny, genero, nivel, chance de Pokemon, habilidade oculta, amizade, drops etc.).
- **RF-26** `[MUST]` O sistema NAO deve listar na pagina do item os Pokemon que a isca atrai.
- **RF-27** `[MUST]` O sistema deve normalizar ao publicar as subcategorias de efeito que misturam formas com e sem prefixo `cobblemon:` (ex. `cobblemon:atk` e `atk`), de forma que cada efeito apareca uma unica vez e correto na pagina.
- **RF-28** `[MUST]` O sistema deve exibir na pagina do Poke-Lanche e da Pokeisca os INGREDIENTES da receita da Panela de Fogueira (excecao explicita a RF-68 do PRD pontindex, que mostrava so o metodo): Poke-Lanche = 3 leite, 2 mel, 1 Vivichoke, 3 Graos Robustos (mais ate 3 temperos); Pokeisca = mel, cogumelo, trigo (mais ate 3 temperos).
- **RF-29** `[MUST]` O sistema deve exibir cada ingrediente da receita como item clicavel quando existe pagina no catalogo, e como texto simples (sem link) quando nao existe (ex. trigo).
- **RF-30** `[MUST]` O sistema deve exibir ingredientes definidos por tag (leite, cogumelo) com rotulo localizado legivel, nunca o id cru da tag.
- **RF-31** `[MUST]` O sistema deve rotular a estacao da receita com o nome do jogo, "Panela de Fogueira" (EN: "Campfire Pot"), no lugar de "Panela de cozinha"/"Cooking pot", em todas as paginas que mostram essa estacao. Nota: `tests/unit/ui-screens/item-page.test.ts` afirma hoje "Panela de cozinha"/"Cooking pot" e muda por decisao (nao e regressao).
- **RF-32** `[MUST]` O sistema deve informar nas paginas do Poke-Lanche e da Pokeisca que a panela aceita ate 3 temperos da lista de temperos (RF-08).

### 4.4 Novos itens no catalogo

- **RF-33** `[MUST]` O sistema deve incluir no catalogo (aba Itens, categoria "Iscas" (`bait`), tag `bait`) os 8 itens: `minecraft:golden_apple`, `minecraft:enchanted_golden_apple`, `minecraft:golden_carrot`, `minecraft:glistering_melon_slice`, `minecraft:glow_berries`, `allthemodium:allthemodium_apple`, `allthemodium:allthemodium_carrot` e `cobblemon:poke_snack`, cada um com pagina e link. Berries mantem a propria categoria e aparecem na aba "Iscas" pela tag `bait`.
- **RF-34** `[MUST]` O sistema deve exibir cada um dos 8 itens com textura real do jogo (nenhum item do catalogo pode ficar sem textura). Os 5 itens vanilla usam modelo e textura copiados do jar vanilla para o snapshot `data-source/` (registrados em `MANIFEST.json` `additions`); os 2 de Allthemodium usam a textura do jar real da instancia copiada para o snapshot, com a midia estendida. Decidido (confirmado pelo orquestrador).
- **RF-35** `[MUST]` O sistema deve exibir o nome PT/EN dos 8 itens (regra atual: EN obrigatorio, PT cai para EN quando ausente; `poke_snack`: PT "Poke-lanche", EN "Poke Snack"; Allthemodium com o PT do kubejs).
- **RF-36** `[MUST]` O sistema deve classificar o Poke-Lanche na categoria "Iscas" e NAO na categoria "cozinha", portanto sem a nota de "efeito pendente" da cozinha.
- **RF-37** `[MUST]` O sistema deve manter `cobblemon:poke_bait` (Pokeisca) no catalogo, agora com categoria "Iscas" (`bait`) e com a receita de RF-28. Portanto `poke_bait`, `poke_snack` e os 7 itens novos tem categoria "Iscas".

### 4.5 Pipeline e dataset

- **RF-38** `[MUST]` O pipeline deve publicar em `items.json` os efeitos de isca de cada item, lendo `data/cobblemon/spawn_bait_effects/**` dos jars e do kubejs da instancia, com precedencia kubejs sobre jar no mesmo caminho.
- **RF-39** `[MUST]` O pipeline deve refletir o override do kubejs: `enchanted_golden_apple` com raridade +10 e shiny x5 (e nao os valores do jar), e `allthemodium_apple`/`allthemodium_carrot` recebem tag `bait` e efeitos.
- **RF-40** `[MUST]` O pipeline deve publicar quais itens sao aceitos como tempero (tag `bait_seasoning` do jar mais os 2 itens de Allthemodium), para o app aplicar RF-08 e RF-16. Restricao imposta pelo orquestrador: o pipeline NAO interpreta o script JS do kubejs; os 2 itens de Allthemodium sao excecao curada no padrao existente `tools/dataset/curated/*.json`, com comentario citando `kubejs/server_scripts/Tweaks/tags.js` (mecanica de arquivo fica para a SPEC).
- **RF-41** `[MUST]` O pipeline deve publicar `bait`, `rodType`, `minLureLevel` e `maxLureLevel` como campos tipados de `SpawnEntry` (hoje descartados ou soltos em `extra`), preservando o comportamento dos demais campos. Os `weightMultipliers` por nivel de Lure tambem entram (RF-46).
- **RF-42** `[MUST]` O pipeline deve publicar os ingredientes das receitas do Poke-Lanche e da Pokeisca na rota "craftable" do item.
- **RF-43** `[MUST]` O pipeline deve publicar uma versao nova do dataset (`datasetVersion` muda) com `current.json` atualizado.
- **RF-44** `[MUST]` O pipeline deve gerar `items.json` e `species/*.json` byte a byte identicos rodando na instancia real do pack e no snapshot `data-source/`.
- **RF-45** `[MUST]` A auditoria independente do dataset (`tools/dataset/audit/`) deve continuar com 0 divergencias, incluindo checks dos campos novos.
- **RF-46** `[MUST]` O pipeline deve publicar os multiplicadores de peso por nivel de Lure como campo tipado do spawn (lista de {lureMin, lureMax, multiplier}), unificando as DUAS formas de origem: o campo singular `weightMultiplier` (objeto; 159 spawns com condicao de Lure, ex. `staryu-10`, `staryu-10-atm`, `staryu-12-atm`) e a lista `weightMultipliers` (198 spawns). Multiplicadores com outras condicoes (`timeRange`, `isRaining`, `isThundering` etc.) continuam em `extra` e estao fora do escopo. Decidido pelo orquestrador.

### 4.6 i18n

- **RF-47** `[MUST]` O sistema deve ter todo texto novo (rotulos do bloco, linhas Poke-Lanche/Pokeisca, condicoes de pesca, reforcos "raridade"/"shiny", painel de efeitos, rotulo da estacao, nota dos 3 temperos) no dicionario central em PT e EN, sem texto literal no JSX. Isso vale sem excecao para o rotulo da estacao "Panela de Fogueira"/"Campfire Pot" (RF-31), que vive no mesmo dicionario central como os demais textos de UI.
- **RF-48** `[MUST]` O sistema deve respeitar o toggle de idioma dos termos do card (`where`/`itempage`) para nomes de item e de tipo/grupo no bloco.

### 4.7 Casos de borda

- **RF-49** `[MUST]` O sistema deve mostrar so a linha "Pokeisca ou baga na vara" para Pokemon que so tem spawns de pesca.
- **RF-50** `[MUST]` O sistema deve mostrar so a linha "Poke-Lanche" para Pokemon que so tem spawns terrestres/agua/superficie/fundo.
- **RF-51** `[MUST]` O sistema deve mostrar as duas linhas para Pokemon com os dois tipos de spawn (ex. Magikarp, Gyarados).
- **RF-52** `[MUST]` O sistema deve, para Pokemon com grupo de ovo sem baga (`undiscovered`, `ditto`), recomendar apenas bagas de tipo (e de grupo com baga), sem erro e sem item vazio.
- **RF-53** `[MUST]` O sistema deve mostrar menos de 3 bagas quando houver menos de 3 correspondencias, sem preencher com bagas nao aplicaveis.
- **RF-54** `[MUST]` O sistema deve tratar item de isca sem nome no lang pela regra atual (EN obrigatorio, PT cai para EN).
- **RF-55** `[MUST]` O sistema deve tratar uma baga com efeito de isca mas fora da tag de tempero como nao recomendavel (RF-08), sem quebrar a pagina do item dela.

## 5. Requisitos nao funcionais

- **RNF-01 (Tamanho do dataset)** `[MUST]` Publicar so os efeitos que a UI usa. Meta: `items.json` (hoje ~1,4 MB) cresce no maximo 15% e `species/*.json` (hoje ~7,7 MB no total) cresce no maximo 10% com os campos de pesca tipados. [ASSUMPTION: a IDEA nao deu numero; limites propostos para forcar publicar so o necessario, ajustaveis na SPEC.]
- **RNF-02 (PWA e cache)** `[MUST]` As 8 texturas novas ficam sob `assets/items/` e entram no cache de runtime `items` (CacheFirst), NAO no precache; o precache continua so com app + boot do dataset. O numero de texturas referenciadas por `items.json` (923 hoje, mais 8 novas) deve permanecer abaixo do `maxEntries` 1200 do cache de runtime, medido a partir do `items.json` (nao pela contagem de PNGs em disco).
- **RNF-03 (Sem regressao de testes)** `[MUST]` Vitest (baseline 79 arquivos / 618 testes) e e2e (baseline 230) permanecem todos verdes; os seletores do e2e de `#where-panel` (`.spawn-entry`, `.drop`, `.ob-none`, `.badge`, `.tag`, `.biome`, `data-obtain`) mantem suas contagens (excecao por decisao: `item-page.test.ts` muda o rotulo da estacao, RF-31), e o bloco e o chip de pesca usam classes/atributos proprios.
- **RNF-04 (Qualidade estatica)** `[MUST]` `typecheck` e `lint` (incluindo a regra `no-literal-jsx-text`) passam limpos.
- **RNF-05 (Cobertura)** `[MUST]` Codigo novo mantem os limites de cobertura v8: global 80/80, `tools/dataset/src/**` 80/80, `src/screens/**` 70/70, `src/components/**` 70/70, `src/domain/**` 95/95; contrato novo coberto por `published-schemas.test.ts` (schemas nao descartam campo do arquivo real).
- **RNF-06 (Performance)** `[MUST]` O calculo das bagas recomendadas roda no render da ficha em menos de 5 ms por Pokemon e nao dispara download extra alem de `items.json` (ja carregado no painel). [ASSUMPTION: meta numerica proposta; a IDEA nao definiu.]
- **RNF-07 (Acessibilidade e consistencia)** `[MUST]` O bloco usa os mesmos tokens/CSS do painel (4 temas, layout mobile a 360px e 390px sem vazamento), rotulo de secao no padrao `.k`, links navegaveis por teclado (chips `ItemLink`) e contraste legivel em todos os temas.
- **RNF-08 (Determinismo)** `[MUST]` A saida do pipeline e deterministica (rodar duas vezes no mesmo snapshot gera arquivos identicos e a mesma `datasetVersion`).
- **RNF-09 (Seguranca)** `[MUST]` Nenhum segredo, credencial ou valor de variavel de ambiente entra em artefatos versionados; so nomes de variaveis (ex. `ATM_INSTANCE_DIR`).
- **RNF-10 (Custo/privacidade)** `[MUST]` Sem novo servico, chamada de rede ou coleta de dados; tudo sai do dataset empacotado.
- **RNF-11 (Textos de UI)** `[MUST]` A redacao exata dos textos de UI e definida na etapa SPEC/UISPEC; restricoes ja fixadas: PT e EN; sem numeros no bloco "Iscas"; rotulo da estacao = nome da GUI do jogo "Panela de Fogueira" (EN vindo do lang do jogo); ingredientes por tag (leite, cogumelo) com rotulo humano; ingredientes sem pagina no catalogo como texto simples.

## 6. Criterios de aceite

Formato Dado/Quando/Entao. Cada criterio cita os RF/RNF que valida.

**Bloco na ficha (RF-01 a RF-18)**
- **CA-01** Dado o Charizard (Fogo/Voador, grupos Monstro e Dragao, spawns so terrestres); quando abro a ficha; entao o bloco "Iscas" aparece abaixo da lista de spawns e antes dos drops/"Como obter", com a linha "Poke-Lanche" e sem a linha da vara, e as bagas "Occa (Fogo), Coba (Voador), Lum (Dragao/Monstro)". (RF-01, 03, 05, 07, 10, 11, 12, 50)
- **CA-02** Dado o Gyarados (Agua/Voador, grupos Agua 2 e Dragao, spawns de agua/superficie e pesca); quando abro a ficha; entao aparecem as duas linhas e exatamente 3 bagas "Passho (Agua), Coba (Voador), Aspear (Agua 1/Agua 2)", com Lum (Dragao/Monstro) cortada pelo limite de 3. (RF-03, 04, 05, 10, 11, 51)
- **CA-03** Dado o Onix (Pedra/Terra, grupo Mineral, spawns terrestres); quando abro a ficha; entao as bagas sao "Charti (Pedra), Shuca (Terra), Persim (Mineral/Amorfo)". (RF-07, 11, 12)
- **CA-04** Dado o Magikarp (exemplo aceito pelo orquestrador, segue os dados e a regra das 3 melhores) (Agua, grupos Agua 2 e Dragao, spawns de agua/superficie e pesca); quando abro a ficha; entao as duas linhas aparecem e as bagas sao "Passho (Agua), Aspear (Agua 1/Agua 2), Lum (Dragao/Monstro)" (3 correspondencias exatas, sem corte). (RF-05, 10, 11, 51, 53)
- **CA-05** Dado qualquer bloco "Iscas"; quando inspeciono o texto; entao nao ha "x10" nem outro multiplicador. (RF-13)
- **CA-06** Dado qualquer nome do bloco (Poke-Lanche, Pokeisca, baga, reforco); quando clico; entao abre a pagina do item e "Voltar" retorna a ficha do mesmo Pokemon. (RF-14)
- **CA-07** Dado um Pokemon com spawn; quando vejo a linha de reforcos; entao ela lista os itens da regra, cada um com "raridade" ou "shiny", sem numero, dentro do bloco. Sao os 7 itens da regra nos dados atuais (cenoura dourada, maca dourada, maca dourada encantada, maca de Allthemodium, cenoura de Allthemodium, fatia de melancia cintilante, Starf Berry); a regra governa, a lista e ilustrativa. (RF-15, 16)
- **CA-08** Dado um Pokemon sem nenhum spawn; quando abro a ficha; entao nao existe bloco "Iscas". (RF-06)
- **CA-09** Dado um Pokemon so com spawn de pesca; quando abro a ficha; entao so a linha "Pokeisca ou baga na vara" aparece. (RF-49)
- **CA-10** Dado um Pokemon com grupo `undiscovered` ou `ditto`; quando abro a ficha; entao o bloco aparece sem erro, com bagas de tipo apenas (mais grupos que tenham baga). (RF-52)
- **CA-11** Dado um Pokemon com menos de 3 correspondencias; quando abro a ficha; entao aparecem so as que existem, sem preenchimento. (RF-53, 18)
- **CA-12** Dado qualquer recomendacao; quando comparo com a tag de tempero; entao nenhuma baga fora da tag (incluindo `mythical_pecha_berry`) aparece no bloco ou nos reforcos, e nenhuma baga de natureza/EV/IV aparece. (RF-08, 09, 16, 17, 55)
- **CA-13** Dado o painel "Onde encontrar" antes e depois da mudanca; quando comparo raridade, spawns (colapso apos 6), drops e "Como obter"; entao ficam identicos. (RF-02, RNF-03)

**Condicoes de pesca (RF-19 a RF-24, RF-46)**
- **CA-14** Dado o Wooper, spawn de pesca com `bait` `cobblemon:love_sweet`; quando vejo a linha do spawn; entao ela mostra a isca exigida (com link se houver pagina, senao texto) e o bloco "Iscas" continua com as bagas. (RF-19, 22)
- **CA-15** Dado o Wooper, spawn com `rodType` `cobblemon:love_rod`; quando vejo a linha; entao o tipo de vara aparece. (RF-20)
- **CA-16** Dado um spawn com `minLureLevel` (ex. Staryu 1, Goomy 2 a 2); quando vejo a linha; entao o nivel de Lure aparece localizado, e as contagens de `.spawn-entry .tag`, `.biome` e `.badge` dos e2e existentes nao mudam. (RF-21, 23, RNF-03)
- **CA-17** Dado o Staryu (spawns de pesca com `minLureLevel` 1 e multiplicador x3 a partir de Lure 3, tanto na forma singular `weightMultiplier` (`staryu-10`, `staryu-10-atm`, `staryu-12-atm`) quanto na lista `weightMultipliers`, em `species/120.json`); quando vejo a linha do spawn; entao aparece o Lure minimo e o multiplicador por Lure ("Lure 3: x3") localizados, vindos do campo tipado unificado, sem incluir multiplicadores de `timeRange` e outras condicoes, e as contagens de `.spawn-entry .tag`, `.biome` e `.badge` dos e2e nao mudam. (RF-46, 24, 23, RNF-03)

**Pagina do item (RF-25 a RF-32)**
- **CA-18** Dado Occa Berry; quando abro a pagina; entao ve o efeito de tipo Fogo com o multiplicador, com o texto do jogo em PT e EN conforme o idioma, e nao ha lista de Pokemon. (RF-25, 26)
- **CA-19** Dado a maca dourada encantada; quando abro a pagina; entao os efeitos refletem o kubejs e nao o jar: no DADO publicado a raridade e +10 e o `shiny_reroll` tem `value` 5; na UI o texto do proprio jogo mostra "6x" para shiny (o jogo soma 1 ao valor publicado, verificado no bytecode do jar pela SPEC), e o `value` publicado continua 5. (RF-38, 39, 25)
- **CA-20** Dado a pagina do Poke-Lanche; quando a abro; entao mostra textura, nome ("Poke-lanche"/"Poke Snack"), categoria "Iscas", estacao "Panela de Fogueira" e os ingredientes 3 leite, 2 mel, 1 Vivichoke, 3 Graos Robustos, com Vivichoke, Graos Robustos e mel clicaveis, leite com rotulo legivel, e a nota de ate 3 temperos; sem nota de "efeito pendente". (RF-28 a RF-32, 36)
- **CA-21** Dado a pagina da Pokeisca; quando a abro; entao mostra mel + cogumelo + trigo, com trigo como texto simples sem link e cogumelo com rotulo legivel. (RF-28, 29, 30, 37)
- **CA-22** Dado qualquer pagina que mostrava "Panela de cozinha"; quando a abro; entao o rotulo agora e "Panela de Fogueira" (EN "Campfire Pot"). (RF-31)

**Catalogo (RF-33 a RF-37)**
- **CA-23** Dado a aba Itens, categoria "Iscas"; quando a abro; entao os 8 itens novos e `poke_bait` aparecem, todos com categoria "Iscas" (`bait`), textura, nome PT/EN e pagina; as berries continuam na propria categoria e tambem aparecem na aba pela tag `bait`. (RF-33 a RF-37)
- **CA-24** Dado o `items.json` publicado; quando conto itens sem textura; entao sao 0 entre os 8 novos. (RF-34)

**Pipeline (RF-38 a RF-46)**
- **CA-25** Dado o pipeline rodado na instancia real e no `data-source/`; quando comparo `items.json` e todos os `species/*.json`; entao sao identicos byte a byte. (RF-44, RNF-08)
- **CA-26** Dado a auditoria `tools/dataset/audit/`; quando rodo; entao 0 divergencias, com checks dos campos novos (isca/tempero/receita/pesca). (RF-45)
- **CA-27** Dado o dataset publicado; quando leio `current.json`; entao `datasetVersion` e novo e diferente de `atm1.3.0-cobblemon1.7.3-20260929-1a7afcba`. (RF-43)
- **CA-28** Dado `published-schemas.test.ts`; quando roda contra os arquivos reais; entao passa (nenhum campo novo descartado pelo schema). (RF-41, 42, RNF-05)
- **CA-29** Dado `items.json` e `species/*.json` novos; quando comparo tamanho com os atuais; entao crescimento dentro de +15% e +10%. (RNF-01)


**i18n e nao funcionais**
- **CA-30** Dado o app em PT e em EN; quando percorro bloco, condicoes de pesca, pagina do item e do Poke-Lanche; entao nenhum texto novo esta sem traducao nem hardcoded no JSX (lint verde). (RF-47, 48, RNF-04)
- **CA-31** Dado o build final; quando rodo vitest, e2e, typecheck, lint e cobertura; entao 79+ arquivos/618+ testes e 230+ e2e verdes, tipagem e lint limpos, cobertura nos limites. (RNF-03, 04, 05)
- **CA-32** Dado o service worker gerado; quando inspeciono o precache; entao as 8 texturas novas nao estao nele e o cache `items` as recebe sob demanda. (RNF-02)
- **CA-33** Dado a ficha do Gyarados a 360px e 390px nos 4 temas; quando abro o bloco; entao nada vaza, chips navegam por teclado e o contraste e legivel. (RNF-07)
- **CA-34** Dado o calculo das bagas de qualquer Pokemon; quando meco no render; entao fica abaixo de 5 ms. (RNF-06)

## Perguntas em aberto

Nenhuma. Resolvidas na revisao 2:

1. `mythical_pecha_berry` fora da recomendacao: decidido (RF-09).
2. Tag de tempero com o acrescimo do kubejs: decidido, excecao curada dos 2 itens de Allthemodium, sem parsear JS (RF-40).
3. Texturas de Allthemodium copiadas do jar real: decidido (RF-34).
4. Limites numericos (RNF-01, RNF-06): aceitos; a origem dos numeros segue marcada `[ASSUMPTION]` (proposta deste PRD, nao da IDEA).
5. Exemplo do Magikarp: aceito (CA-04).
6. Textos exatos de UI: definidos na SPEC/UISPEC, restricoes em RNF-11.
7. Auditoria: requisito (RF-45); a SPEC verifica se precisa de checks novos de isca/tempero ou tolerancia aos campos novos de `SpawnEntry`.
