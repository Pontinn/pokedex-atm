---
feature: pokemon-generation
language: pt-BR
type: change
status: done
created: 2026-10-12
---
# IDEA: pokemon-generation (geracao visivel em cada Pokemon e em cada evolucao)

## 1. Objetivo

Pontin, 2026-10-12: "Eu quero que voce deixe claro em cada pokemon de qual geracao ele e. E cada evolucao tbm pq o pokemon pode ser de uma e a evolucao pode ser de outra entao preciso que tenha isso. Tambem quero q adicione um filtro pra buscar por gen na pokedex."

Pontin, 2026-10-12 (motivo): "eu to jogando outros jogos de pokemon e to comecando la do Pokemon FireRed e quero saber quais pokemons tem naquela epoca. e como la e so da primeira geracao eu quero poder filtrar".

Dor: hoje o usuario nao ve a geracao do Pokemon olhando pra ele, e na cadeia de evolucao nao da pra saber que a evolucao pode ser de outra geracao (ex.: base da gen 1 com evolucao da gen 4).

## 2. Decisoes (lista viva)

- [2026-10-12] Escopo = (1) geracao visivel + (2) disponibilidade por jogo mainline. Pontin: "pode fazer 1 e 2". O item 3 (guia por jogo: onde encontrar e metodo de evolucao em cada jogo) fica FORA, ideia separada se fizer falta.
- [2026-10-12] Card da listagem da Pokedex: TIRAR o selo de raridade e colocar o selo de geracao no lugar. Pontin: "quero q tire o selo de raridade da listagem na pokedex e substitua pra geracao".
- [2026-10-12] Pagina individual (Detail): mostra geracao E raridade; a raridade passa a existir SO la. Pontin: "Coloque tambem a geracao na pagina individual e a raridade so la. Isso em cada pokemon".
- [2026-10-12] Pontin: "pode seguir autonomo ate o fim e deixe o modelo maximo como opus". Pipeline autonomo; agentes de topo em opus. Pontos nao respondidos fechados por premissa do orquestrador (secao 11), corrigiveis a qualquer momento.
- [2026-10-12] Fonte dos jogos: PokeAPI (conferida pelo forge-context com GET reais; ver CONTEXT secao 9). Juncao pelo numero da dex nacional (`dex` do indice == id de `pokemon-species`; 1..1025 sem buracos). Nunca por nome/slug.
- [2026-10-12] "Disponivel no jogo X" = especie LISTADA na Pokedex regional do version-group X (campo `pokedex.pokemon_entries`), incluindo as dexes de DLC do mesmo version-group (isle-of-armor, crown-tundra, kitakami, blueberry). Obtencao real (encounters) fica fora.
- [2026-10-12] FireRed/LeafGreen = so a dex `kanto` (151). National Dex do pos-jogo NAO entra; a tela diz isso em uma linha.
- [2026-10-12] Granularidade = version-group, rotulado com os dois nomes ("FireRed / LeafGreen", "Sword / Shield"). Lista de jogos DERIVADA dos dados, nunca escrita a mao (LESSONS 2026-09-29). PREDICADO: entra todo version-group da PokeAPI que tenha ao menos uma pokedex com `is_main_series == true` (sem contar `national`), MENOS a lista nominal de exclusao: version-groups `red-green-japan` e `blue-japan` (edicoes exclusivas do Japao, mesma dex kanto) e `champions` (spin-off); a pokedex `conquest-gallery` (spin-off) nunca e usada. O version-group `mega-dimension` nao e excluido: e fundido em `legends-za` como DLC (sua dex `hyperspace` conta para Legends: Z-A). Legends Arceus (hisui) e Legends Z-A (lumiose-city + hyperspace) ENTRAM.
- [2026-10-12] BDSP aceita o mapeamento da PokeAPI para `original-sinnoh` (mesma dex regional de 151 de DP).
- [2026-10-12] Fonte do build REPRODUZIVEL: recorte curado e VERSIONADO (ex.: `tools/dataset/curated/pokeapi-game-availability.json`, gerado por script a partir da PokeAPI com o cache existente), registrado em MANIFEST/README no padrao de `data-source/`. O build nunca depende de rede nem do `.cache/` ignorado pelo git (outro PC precisa reproduzir).
- [2026-10-12] "Correspondencia na fonte" = o numero nacional existe como `pokemon-species` na PokeAPI (1..1025). Especie oficial sem correspondencia -> o build do dataset FALHA. Especie com correspondencia mas sem nenhuma dex de jogo -> lista vazia e texto "Nao aparece nos jogos oficiais" (caso defensivo). Especie `custom` (9901, 9902) -> texto "So no pack".
- [2026-10-12] Teto de peso verificavel: crescimento total dos arquivos precacheados pelo service worker <= 10.240 bytes gzip (medido na SPEC/testes). Excecoes permitidas na comparacao "so acrescimos" entre dataset antigo e novo: `datasetVersion`, `dataset-manifest.json` (sources) e `current.json`, que mudam por definicao.
- [2026-10-12] Geracao dos estagios da cadeia de evolucao: a SPEC escolhe entre lookup no `speciesIndex` ou `generation` nos nos; como o dataset sera republicado de qualquer forma (jogos), o custo de mudar o contrato dos nos e baixo. Criterio: a opcao que nao deixa o Detail dependente do indice carregado.
- [2026-10-12] Especies `custom` (9901, 9902) ficam sem jogos, rotulo "So no pack"; formas herdam a disponibilidade e a geracao da especie base.
- [2026-10-12] Peso: o indice e precacheado pelo service worker; a representacao escolhida na SPEC deve manter o crescimento do boot pequeno (ordem de 10 KB gzip; codigos curtos por jogo ou arquivo separado precacheado). Creditar a PokeAPI em "Sobre"/README mesmo sem exigencia de atribuicao encontrada.
- [2026-10-12] Pontin: "tome todas as decisoes sozinho, desde que nao interfira em nada q foi feito nem brake nada". Decisoes de produto/tecnica delegadas ao orquestrador. Restricao dura: NAO alterar comportamento existente alem do pedido (raridade sai do card; geracao e jogos entram) e NAO quebrar nada: suite completa + build verdes antes e depois; e2e existentes que dependem do selo de raridade no card sao ajustados ao novo comportamento, nunca afrouxados.

## 3. Escopo

- Dentro: selo de geracao em cada Pokemon (card da listagem e Detail); geracao em cada estagio da cadeia de evolucao; filtro por geracao na Pokedex (ja existe; fica como esta); lista de jogos mainline em que o Pokemon esta disponivel (Detail) + filtro por jogo na Pokedex; raridade sai do card e fica so no Detail.
- Fora: guia por jogo (locais de encontro, metodo de evolucao por jogo); backend de qualquer tipo.
- NAO mexer (premissa): ordenacao do Dex, filtros de tipo/evolucao/status, busca, paineis de spawn/iscas/bagas, telas de itens, Compare (fica como esta), service worker alem do precache do dataset novo.

## 4. Superficie de regressao

- REGRA DO PONTIN (2026-10-12): nada do que ja existe pode mudar de comportamento nem quebrar. Rodar a suite completa (vitest + Playwright) e o build na main ANTES de implementar para separar flake preexistente de regressao (LESSONS 2026-09-29).

- Filtro de geracao que JA EXISTE no Dex (`src/screens/Dex/DexFilters.tsx`, select `f-gen`, valores gen1..gen9, gen7b, gen8a, custom) e a filtragem em `use-filtered-species.ts`. (decidido: fica como esta, sem mudanca)
- Campo `generation` ja presente no schema e no `species-index.json` (1027 especies: gen1 151, gen2 100, gen3 135, gen4 107, gen5 156, gen6 72, gen7 86, gen7b 2, gen8 89, gen8a 7, gen9 120, custom 2).

## 5. Papeis e permissoes

N/A: site sem login, tudo publico e local.

## 6. Entidades e ciclo de vida

- Especie (leitura apenas; dataset publicado). Sem CRUD do usuario.

## 7. Regras de negocio e exemplos

- Geracao da especie = campo `generation` do dataset (vem do label `genN` do Cobblemon). Ex.: Zubat gen1, Golbat gen1, Crobat gen2; Tyrogue gen2 -> Hitmonlee gen1.
- Formas (Mega, Gmax, regionais) herdam a geracao da especie base (nao ha campo proprio).
- "Disponivel no jogo X" = a especie consta na Pokedex regional do jogo X (incluindo as dexes de DLC do mesmo jogo). Ex.: Zubat e Golbat constam em FireRed/LeafGreen (Kanto); Crobat NAO (so via National Dex no pos-jogo, que fica fora: documentar essa limitacao na tela).
- Filtro "Jogo" na Pokedex: selecao unica; combina com os outros filtros por E logico (Jogo = FireRed E Tipo = Veneno -> Zubat, Golbat, ...).
- Filtro de geracao: continua selecao unica de uma geracao (ja existe); combina por E com o filtro de jogo.
- Rotulos: card mostra forma curta ("Gen 1"); Detail mostra forma longa ("Geracao 1"). gen7b = "Gen 7 (Let's Go)", gen8a = "Gen 8 (Arceus)", custom = "Pack" (Pokemon exclusivo do modpack). Forma exata final definida na UISPEC.

## 8. Casos de borda / caminhos tristes

- Valores `gen7b`, `gen8a` e `custom`: rotulos definidos na secao 7.
- Especie sem correspondencia na fonte externa (custom, dex fora da faixa oficial): lista de jogos vazia, mostrar "Nao aparece nos jogos oficiais"; o filtro de jogo nunca a inclui.
- Fonte externa fora do ar no build: o pipeline le o recorte curado versionado em `tools/dataset/curated/` (mesmo padrao de `bait-seasoning-extra.json`); o build do dataset nunca depende da rede para esse dado; se o arquivo faltar, falha com erro claro. Regenerar o recorte e um script separado, rodado a mao.
- Cadeia de evolucao: estagio de outra geracao recebe destaque visual (cor/contorno diferente do selo) para o cruzamento ficar obvio; sem texto extra por jogo.
- `speciesIndex` ainda carregando ao abrir o Detail: selos de geracao dos estagios aparecem quando o indice chegar (sem quebrar o layout).

## 9. Referencia de UI

- mode: project-identity. Referencias: card do Dex (`SpeciesBadges`, selos Lendario/Mitico/raridade existentes), Hero do Detail e painel de evolucao (`EvolutionPanel`), linha de filtros do Dex (`DexFilters`, selects existentes). O selo de geracao segue o estilo dos selos atuais; o bloco "Jogos" no Detail segue os paineis existentes (ex.: "Onde encontrar").

## 10. Prioridades

- Pontin: tudo must-have (regra do projeto; nao perguntar MoSCoW).

## 11. Premissas confirmadas

Premissas assumidas pelo orquestrador em 2026-10-12 (modo autonomo), NAO confirmadas uma a uma pelo Pontin; valem ate ele corrigir:
- O filtro de geracao existente fica como esta (selecao unica); nao vira chips nem multi-selecao. O filtro novo e "Jogo", um select ao lado dele.
- Capturados usa o mesmo card do Dex: a raridade sai de la tambem e o selo de geracao entra. Compare nao muda.
- Selo de geracao no card substitui o de raridade na MESMA posicao; Lendario/Mitico continuam no card.
- No Detail: selo de geracao + selo de raridade no Hero; bloco novo "Jogos" listando os jogos oficiais em que a especie consta (ordem cronologica), com nota sobre a National Dex.
- Cadeia de evolucao: selo de geracao em cada estagio, com destaque quando difere da especie base; disponibilidade por jogo NAO aparece na cadeia.
- Dados de jogos: PokeAPI (confirmada pelo CONTEXT secao 9), recorte curado versionado em `tools/dataset/curated/` e embutido no dataset no build, registrado no MANIFEST/README do data-source. Credito a PokeAPI na tela Configuracoes ("Sobre"/creditos de imagens, `settings.images`) e no README (ajustar a frase "Dados 100% do modpack"). Nova versao de dataset publicada.
- Rotulos pt/en para tudo (i18n existente).
- Raridade no Detail: ja aparece hoje no Hero (selos) e no painel "Onde encontrar" (`.where-rarity`); ambos FICAM. O export `RARITY_BADGE` do card continua existindo enquanto o Detail o usar (nao e codigo morto).
- Testes que mudam com o selo novo (ajustar ao novo comportamento, nunca afrouxar): `tests/e2e/detail.spec.ts` (contagem de selos no Hero), `tests/e2e/dex.spec.ts` (selo de raridade no card lendario), `tests/unit/ui-screens/pokemon-card.test.tsx` (raridade no card), `tests/e2e/responsive.spec.ts` (selos no Dex, Detail e Capturados).

## 12. Pontos em aberto (lista viva)

- (resolvidos em 2026-10-12, ver secoes 2 e 11) filtro existente mantido; onde a geracao aparece; rotulos; fonte externa; criterio "disponivel"; FRLG; granularidade; BDSP; custom/formas.
- (resolvido) version-groups antigos e novos conferidos no CONTEXT secao 9.2 (red-blue e yellow -> kanto; gold-silver e crystal -> original-johto; legends-za -> lumiose-city + hyperspace; mega-dimension -> hyperspace).
- Nenhum ponto em aberto. Decisoes de representacao (codigos curtos vs arquivo separado, geracao nos nos da cadeia), nomes de exibicao dos jogos e forma visual do selo ficam ADIADAS para SPEC/UISPEC por decisao, nao por esquecimento.
- Pontin, 2026-10-12: "tambem vou jogar os outros jogos do pokemon. vc acha q da pra fazer alguma coisa pra me ajudar em relacao a isso? algumas informacoes" e "talvez mostrar o jogo q esse pokemon ta disponivel. n sei". Decidido depois: disponibilidade por jogo entra NESTA feature (secao 2). O dataset do pack NAO tem dados de jogos mainline (so `generation` e `labels` como kantonian_form, starter, fossil); precisaria de fonte externa embutida no dataset no build (sem backend).
