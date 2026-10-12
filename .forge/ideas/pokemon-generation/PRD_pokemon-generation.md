---
feature: pokemon-generation
language: pt-BR
status: ready-for-review
---

# PRD - pokemon-generation (geracao visivel em cada Pokemon e em cada evolucao, filtro por geracao e por jogo)

## Revision History

| Data | Revisao | O que mudou |
|---|---|---|
| 2026-10-12 | 1 | Criacao do PRD a partir da IDEA (5fd45dbcc82d) e do CONTEXT (1c433ac28bf3). Escopo = itens (1) geracao visivel e (2) disponibilidade por jogo mainline; item (3) guia por jogo fica fora. Tudo `[MUST]`. |
| 2026-10-12 | 2 | Respostas do orquestrador: edicoes japonesas (`red-green-japan`, `blue-japan`) excluidas por nome (RF-22, CA-24); perguntas em aberto 1, 3, 4 e 5 marcadas como resolvidas na SPEC/UISPEC; as 9 `[ASSUMPTION]` aceitas como decisoes; status = pronto para revisao. |
| 2026-10-12 | 3 | Revisao do forge-review (0 blockers, 7 warnings, 7 nits): predicado de jogos exato da IDEA secao 2 (RF-22); frase manual das dexes kanto removida; definicao de "correspondencia na fonte" (RF-30, RF-51, CA-28); teto de 10.240 bytes gzip (RNF-01, CA-60); excecoes da comparacao "so acrescimos" (RF-46, CA-34); fusao de duplicados (RF-27 em RF-06, RF-34 em RF-15, RF-20 em RF-18, RNF-04 em RF-43, RNF-10 em RF-50, RNF-02 em RF-53, RNF-07 em RF-56; numeros mantidos com lacunas); RF-55, parte de processo do RF-47 e RF-57 movidos para "Restricoes de implementacao e processo" (secao 3); CA novo para RNF-13; baseline recomputado (IDEA e CONTEXT mudaram). |

## Baseline (drift anchor)

- `HEAD`: `b7ae68d78552e3e164091a7878443e89bfc0c97c` (branch `feature/pokemon-generation`)
- `IDEA_pokemon-generation.md` (`git hash-object`): `7b81d65ab33a889f056cd3b83e826720a485295e`
- `CONTEXT_pokemon-generation.md` (`git hash-object`): `b16864921badb7ad2c37f2f183af29f1625a9253`

## 1. Objetivo e visao

**Problema.** Hoje o jogador nao ve a geracao de um Pokemon olhando para ele (o campo `generation` existe no dataset mas so serve ao filtro), e na cadeia de evolucao nao da para saber que um estagio pode ser de outra geracao (ex.: Tyrogue gen 2 evolui para Hitmonlee gen 1; Applin gen 8 para Dipplin gen 9). Alem disso, quem joga os jogos principais (motivo do Pontin: comecar por Pokemon FireRed, que so tem a primeira geracao) nao tem como saber quais Pokemon existem em cada jogo, nem filtrar a Pokedex por jogo.

**Para quem.** Jogador do modpack All the Mons que tambem joga os jogos principais da serie e consulta o Pontindex (persona unica, secao 2).

**Por que agora.** Pedido direto do Pontin em 2026-10-12: "deixe claro em cada pokemon de qual geracao ele e. E cada evolucao tbm", "adicione um filtro pra buscar por gen na pokedex", e "pode fazer 1 e 2" (geracao visivel + disponibilidade por jogo).

**Impacto esperado.** O jogador abre a Pokedex e ve "Gen N" em cada card; abre o Detail do Zubat e ve a geracao no Hero e em cada estagio da cadeia (Crobat destacado como de outra geracao); no bloco "Jogos" ve em quais jogos principais o Pokemon consta; na Pokedex escolhe "FireRed / LeafGreen" no filtro de jogo e ve so os Pokemon daquela epoca.

**Metrica de sucesso (verificavel).**
- 100% dos cards da Pokedex e de Capturados mostram o selo de geracao correto (igual ao `generation` da especie) e 0 card mostra selo de raridade; os selos Lendario/Mitico continuam.
- 100% dos estagios da cadeia de evolucao de toda especie com cadeia mostram o selo de geracao, com destaque nos que diferem da geracao do primeiro estagio da cadeia.
- O filtro de jogo devolve, para cada jogo da lista, exatamente as especies listadas nas Pokedexes regionais daquele version-group na fonte (PokeAPI), conferido por teste que deriva o esperado do recorte curado e o confronta com a regra. Exemplo-ancora: FireRed / LeafGreen devolve 151 especies.
- A lista de jogos e DERIVADA da fonte pela regra da secao 4.5; 0 jogo escrito a mao fora das exclusoes e fusoes nominais.
- Crescimento total dos arquivos precacheados pelo service worker <= 10.240 bytes gzip (teto fixado na IDEA secao 2; medido na SPEC/testes).
- Nenhum teste existente regride, salvo os asserts diretamente afetados pela saida da raridade do card e pelo selo novo (RF-56); suite completa e build verdes antes e depois.

## 2. Publico-alvo (personas)

- **Jogador do ATMons que joga os jogos principais (Pontin e amigos)**: joga o modpack All the Mons 1.3.0 e tambem jogos da serie principal (agora FireRed), usa o Pontindex no desktop ou no celular (PWA), em PT ou EN. Quer ver a geracao de cada Pokemon e de cada evolucao e saber o que existe em cada jogo.

Papeis e permissoes: N/A (site publico, sem login, local, sem backend; todos veem tudo). Ciclo de vida / round-trip de dados: N/A (dados de especie sao somente leitura, vindos do dataset publicado; sem CRUD do usuario).

## 3. Escopo

**Dentro do escopo**
- (a) Selo de geracao em cada card de Pokemon da listagem (Pokedex e Capturados, que reusa o card), no lugar do selo de raridade.
- (b) Pagina individual (Detail): selo de geracao e selo de raridade no Hero; raridade passa a existir so no Detail (Hero e painel "Onde encontrar").
- (c) Selo de geracao em cada estagio da cadeia de evolucao, com destaque quando o estagio e de outra geracao.
- (d) Filtro de geracao da Pokedex (ja existe; mantido como esta) e novo filtro de jogo na Pokedex.
- (e) Bloco "Jogos" no Detail: jogos principais em que a especie consta, em ordem cronologica, com nota sobre a National Dex.
- (f) Dados de jogos vindos da PokeAPI, congelados em recorte curado versionado e embutidos no dataset no build; nova versao de dataset publicada; credito a PokeAPI.
- PT e EN em todo texto novo.

**Fora do escopo (NAO tocar)**
- Guia por jogo: locais de encontro (encounters), metodo de evolucao em cada jogo, obtencao real. Ideia separada se fizer falta.
- Backend de qualquer tipo; chamada de rede nova em runtime.
- Disponibilidade por jogo dentro da cadeia de evolucao (a cadeia mostra so geracao).
- National Dex do pos-jogo (ex.: Crobat em FireRed via National Dex) como criterio de "disponivel".
- Diferenciar versoes individuais (FireRed vs LeafGreen): o filtro e por version-group.
- Edicoes so japonesas (`red-green-japan`, `blue-japan`) e spin-offs (`champions` como version-group; Pokedex `conquest-gallery`): exclusoes nominais da IDEA secao 2 (RF-22).
- Ordenacao do Dex, filtros de tipo/evolucao/status, busca, paineis de spawn/iscas/bagas, telas de itens, Compare (fica como esta), Home, Treinadores e service worker alem do precache do dataset novo.
- Multi-selecao ou "ate a geracao N" no filtro de geracao (continua selecao unica).
- Selo de geracao por forma (Mega, Gmax, regionais): formas herdam da especie base.

### Restricoes de implementacao e processo

Nao sao requisitos de produto, mas obrigam a SPEC e o plano:
- Preservar o export de raridade (`RARITY_BADGE`) que o painel "Onde encontrar" usa; nao e codigo morto enquanto o Detail o usa. A raridade sai so do card.
- Planejar a "janela quebrada" do contrato (LESSONS 2026-09-29): quais testes (`join.test`, `published-schemas`) ficam excluidos ate a republicacao do dataset; o frontend so consome campos novos depois do dataset novo publicado.
- Rodar a suite completa (vitest + Playwright) e o build na main ANTES de implementar, para separar flake preexistente de regressao (LESSONS 2026-09-29); corrigir flake pela causa, nunca afrouxando assert.

## 4. Requisitos funcionais

Numeracao: onde dois requisitos foram fundidos, o numero removido fica como lacuna (RF-20, RF-27, RF-34, RF-55, RF-57; RNF-02, RNF-04, RNF-07, RNF-10) para manter a rastreabilidade.

Prioridade: todos `[MUST]` (regra fixa do Pontin neste projeto; a IDEA nao marca nada como nice-to-have). Restricoes herdadas da IDEA e do codigo (nao sao design): fonte de jogos = PokeAPI; juncao pelo numero da dex nacional (`dex` do indice == id de `pokemon-species`), nunca por nome ou slug; recorte curado e versionado em `tools/dataset/curated/` lido pelo build sem rede; sem backend; PWA offline; o campo `generation` do dataset (label `genN` do Cobblemon) e a fonte da geracao.

### 4.1 Selo de geracao no card da listagem

- **RF-01** `[MUST]` O sistema deve exibir, em todo card de Pokemon da Pokedex, um selo de geracao com o rotulo curto da geracao da especie (valor do campo `generation`).
- **RF-02** `[MUST]` O sistema deve exibir o mesmo selo de geracao nos cards da tela Capturados, que reusa o card da Pokedex.
- **RF-03** `[MUST]` O sistema deve colocar o selo de geracao na MESMA posicao que o selo de raridade ocupa hoje no card, e NAO deve exibir selo de raridade no card (Pokedex e Capturados).
- **RF-04** `[MUST]` O sistema deve manter os selos Lendario/Mitico no card exatamente como hoje, ao lado do selo de geracao.
- **RF-05** `[MUST]` O sistema deve usar o rotulo curto conforme a tabela de mapeamento (unidade: valor de `generation` -> texto do selo no card), em PT e EN:

  | `generation` | Selo no card |
  |---|---|
  | `gen1` a `gen9` | "Gen 1" a "Gen 9" |
  | `gen7b` | "Gen 7 (Let's Go)" |
  | `gen8a` | "Gen 8 (Arceus)" |
  | `custom` | "Pack" |

  Exemplo: Zubat (`gen1`) mostra "Gen 1"; Crobat (`gen2`) mostra "Gen 2"; Meltan (`gen7b`) mostra "Gen 7 (Let's Go)"; Wyrdeer (`gen8a`) mostra "Gen 8 (Arceus)"; Piglich (`custom`) mostra "Pack". Os rotulos vem da IDEA secao 7; a forma visual exata do selo e definida na UISPEC.
- **RF-06** `[MUST]` O sistema deve aplicar a geracao e a disponibilidade em jogos da especie base a qualquer forma (Mega, Gmax, regional): formas nao tem campo de geracao nem entrada propria na fonte e herdam os da especie.
- **RF-07** `[MUST]` O sistema deve manter o selo de geracao legivel e sem quebrar o proprio texto no card mesmo com `dex-num`, Lendario e Mitico presentes (os rotulos "Gen 7 (Let's Go)" e "Gen 8 (Arceus)" sao os mais longos), em 360, 390 e 1280 px, PT e EN.

### 4.2 Pagina individual (Detail)

- **RF-08** `[MUST]` O sistema deve exibir no Hero do Detail o selo de geracao da especie, em rotulo longo ("Geração 1" / "Generation 1"; `gen7b`, `gen8a` e `custom` com os rotulos "Gen 7 (Let's Go)", "Gen 8 (Arceus)" e "Pack" da IDEA), em PT e EN.
- **RF-09** `[MUST]` O sistema deve manter no Hero os selos que ja existem (Lendario/Mitico e raridade de spawn), acrescentando o de geracao; a raridade passa a existir SO no Detail (Hero e painel "Onde encontrar").
- **RF-10** `[MUST]` O sistema deve manter o painel "Onde encontrar" com a raridade (`.where-rarity`, bucket primario e secundarios) exatamente como hoje.
- **RF-11** `[MUST]` O sistema deve manter, no Hero, o espaco reservado aos botoes shiny/grito sem sobreposicao com os selos, com o selo novo presente.

### 4.3 Geracao na cadeia de evolucao

- **RF-12** `[MUST]` O sistema deve exibir, em cada estagio (no) da cadeia de evolucao do Detail, linear ou ramificada, o selo de geracao daquele estagio, inclusive o estagio da propria especie aberta.
- **RF-13** `[MUST]` O sistema deve dar destaque visual (cor ou contorno diferente do selo comum) ao estagio cuja geracao difere da geracao do primeiro estagio da cadeia (raiz), de modo que o cruzamento de geracao fique obvio. Exemplos: Zubat (gen 1) -> Golbat (gen 1) -> Crobat (gen 2): Crobat destacado; Tyrogue (gen 2) -> Hitmonlee (gen 1): Hitmonlee destacado; Pichu (gen 2) -> Pikachu (gen 1) -> Raichu (gen 1): a raiz e Pichu, entao Pikachu e Raichu sao destacados. [ASSUMPTION: a IDEA diz "destaque quando difere da especie base"; interpretada como o primeiro estagio da cadeia, regra igual em qualquer Detail da mesma cadeia. Motivo: independe de qual especie esta aberta.]
- **RF-14** `[MUST]` O sistema NAO deve depender so de cor para o destaque do RF-13: o selo sempre tem o texto da geracao e o destaque tem uma pista nao cromatica (contorno, icone ou rotulo acessivel). A forma exata e da UISPEC.
- **RF-15** `[MUST]` O sistema NAO deve mostrar disponibilidade por jogo nem texto extra por jogo na cadeia de evolucao nem no card da listagem (so no Detail e no filtro).
- **RF-16** `[MUST]` O sistema deve, quando os dados de geracao dos estagios ainda nao estiverem disponiveis ao abrir o Detail (ex.: indice de especies ainda carregando), mostrar os selos dos estagios assim que chegarem, sem quebrar nem deslocar o layout.
- **RF-17** `[MUST]` O sistema deve renderizar o estagio sem selo de geracao, sem erro, quando nao houver geracao conhecida para o estagio (no sintetico sem entrada nos dados).

### 4.4 Filtro de geracao na Pokedex (existente, mantido)

- **RF-18** `[MUST]` O sistema deve manter o filtro de geracao existente (`f-gen`) como esta: selecao unica, mesmas opcoes, mesma ordem (gen1..gen9, depois sufixos `gen7b`, `gen8a`, e `custom` por ultimo), mesmos rotulos das opcoes (rotulo longo existente) e mesma filtragem por igualdade, continuando a combinar com os demais filtros por E logico. [ASSUMPTION: nao alterar o que existe; so ha acrescimo de selos (aceita pelo orquestrador em 2026-10-12)]
- **RF-19** `[MUST]` O sistema deve manter o estado do filtro de geracao restaurado ao voltar do Detail, como hoje (persiste na pilha de navegacao).

### 4.5 Disponibilidade por jogo: regra e dados

- **RF-21** `[MUST]` O sistema deve considerar uma especie "disponivel no jogo X" quando ela consta (entrada em `pokemon_entries`) em qualquer Pokedex regional listada no version-group X da fonte (uniao das Pokedexes do version-group), incluindo as Pokedexes de DLC do mesmo version-group (isle-of-armor e crown-tundra em Sword/Shield; kitakami e blueberry em Scarlet/Violet). A obtencao real (encounters, troca, evolucao, presente) NAO entra.
- **RF-22** `[MUST]` O sistema deve derivar a lista de jogos dos dados da fonte, nunca escrita a mao (LESSONS 2026-09-29). Predicado (IDEA secao 2, que tambem registra a exclusao das edicoes japonesas): um jogo = um version-group da PokeAPI que tenha ao menos uma Pokedex com `is_main_series == true` (sem contar `national`), MENOS a lista nominal de exclusao, cada item com seu tipo:
  - `red-green-japan` e `blue-japan` (version-groups): edicoes exclusivas do Japao, mesma Pokedex `kanto`;
  - `champions` (version-group): spin-off;
  - `conquest-gallery` (Pokedex): spin-off, nunca usada.
  - Fusao (NAO e exclusao): `mega-dimension` e fundido em `legends-za` como DLC (sua Pokedex `hyperspace` conta para Legends: Z-A). Os demais version-groups so de DLC (`the-isle-of-armor`, `the-crown-tundra`, `the-teal-mask`, `the-indigo-disk`) tambem contam como o jogo base, cuja lista de Pokedexes ja os inclui; resultado: um so jogo por familia.
  - Entram pela regra: Legends Arceus (`hisui`), Legends Z-A (`lumiose-city` e `hyperspace`) e Brilliant Diamond / Shining Pearl como jogo proprio (mesma Pokedex `original-sinnoh` de Diamond / Pearl, mapeamento da PokeAPI aceito).
  - A SPEC e os testes DERIVAM a lista do recorte curado; o PRD nao a enumera.
- **RF-23** `[MUST]` O sistema deve rotular cada jogo com os dois nomes do version-group ("FireRed / LeafGreen", "Sword / Shield"); granularidade = version-group, sem distinguir versoes individuais. Nomes de jogo sao nomes proprios, iguais em PT e EN. [ASSUMPTION: nomes oficiais em ingles servem para os dois idiomas, como no resto do app.]
- **RF-24** `[MUST]` O sistema deve ordenar a lista de jogos em ordem cronologica (campo `order` do version-group na fonte), tanto no filtro quanto no bloco do Detail.
- **RF-25** `[MUST]` O sistema deve juntar a especie do dataset a fonte SOMENTE pelo numero da dex nacional (`dex` do indice == id de `pokemon-species`), nunca por nome ou slug.
- **RF-26** `[MUST]` O sistema deve tratar as especies `custom` (dex 9901 e 9902, sem equivalente na fonte) como sem jogo nenhum; o filtro de jogo nunca as inclui.
- **RF-28** `[MUST]` O sistema deve tratar FireRed / LeafGreen como disponibilidade da Pokedex regional `kanto` apenas; a National Dex do pos-jogo NAO entra, e a tela deve dizer isso em uma linha (nota do bloco "Jogos", RF-33).
- **Exemplo trabalhado (RF-21/28):** FireRed / LeafGreen = Pokedex `kanto` = 151 especies. Zubat e Golbat constam; Crobat (gen 2) NAO consta (so via National Dex no pos-jogo, que fica fora). Tyrogue (gen 2) nao consta em FireRed / LeafGreen e sua evolucao Hitmonlee (gen 1) consta. Filtro Jogo = FireRed / LeafGreen E Tipo = Veneno inclui Zubat e Golbat e exclui Crobat.

### 4.6 Bloco "Jogos" no Detail

- **RF-29** `[MUST]` O sistema deve exibir no Detail um bloco novo "Jogos" listando os jogos principais em que a especie consta (RF-21), em ordem cronologica (RF-24), no estilo dos paineis existentes (ex.: "Onde encontrar"), em PT e EN.
- **RF-30** `[MUST]` O sistema deve mostrar no bloco "Jogos" um texto conforme o caso (definicao de "correspondencia na fonte": o numero nacional existe como `pokemon-species` na PokeAPI, 1..1025): (i) especie `custom` (9901, 9902): "Só no pack" (EN equivalente); (ii) especie com correspondencia mas em nenhuma Pokedex de jogo: lista vazia e texto "Não aparece nos jogos oficiais" (EN equivalente), caso defensivo; (iii) especie oficial sem correspondencia na fonte NAO chega ao app, pois o build do dataset falha (RF-51). Sem bloco quebrado em nenhum caso.
- **RF-31** `[MUST]` O sistema deve mostrar a lista de jogos com todos os itens acessiveis em 360 e 390 px (sem omitir nenhum jogo, sem vazar na horizontal), mesmo para especies que constam em muitos jogos; a forma de apresentacao e da UISPEC/SPEC.
- **RF-32** `[MUST]` O sistema NAO deve exibir lista vazia enganosa no bloco "Jogos" quando os dados de jogos nao estiverem disponiveis (ex.: carregamento); nesse caso nao mostra o texto de "nao aparece" nem quebra a pagina. [ASSUMPTION: com o dataset publicado e o contrato estrito isto nao ocorre em producao; requisito defensivo.]
- **RF-33** `[MUST]` O sistema deve mostrar no bloco "Jogos" uma nota de uma linha dizendo que a National Dex do pos-jogo nao e considerada (ex.: Crobat nao conta como disponivel em FireRed / LeafGreen), em PT e EN.

### 4.7 Filtro por jogo na Pokedex

- **RF-35** `[MUST]` O sistema deve oferecer na linha de filtros da Pokedex um select novo "Jogo", ao lado do filtro de geracao, de selecao unica, com a opcao "Todos" (padrao) e um item por jogo da lista derivada (RF-22), em ordem cronologica (RF-24).
- **RF-36** `[MUST]` O sistema deve filtrar, com um jogo selecionado, a listagem para somente as especies disponiveis naquele jogo (RF-21); formas seguem a especie base (RF-06).
- **RF-37** `[MUST]` O sistema deve combinar o filtro de jogo com todos os outros filtros (geracao, tipo, evolucao, status, busca) por E logico; o filtro de geracao continua selecao unica e combina por E com o de jogo. Exemplo: Jogo = FireRed / LeafGreen E Geracao = Gen 2 -> lista vazia (estado vazio do RF-39); Jogo = FireRed / LeafGreen E Tipo = Veneno -> Zubat, Golbat etc.
- **RF-38** `[MUST]` O sistema deve restaurar o filtro de jogo ao voltar do Detail, como ja ocorre com geracao e demais filtros (padrao existente de estado por entrada da navegacao). [ASSUMPTION: o estado de filtros persiste na pilha de navegacao hoje; o filtro novo segue o padrao.]
- **RF-39** `[MUST]` O sistema deve mostrar o estado vazio existente da listagem, sem erro, quando a combinacao de filtros nao devolve nenhum Pokemon.
- **RF-40** `[MUST]` O sistema deve manter, sem jogo selecionado, a listagem identica a de hoje (estado padrao = "Todos").
- **RF-41** `[MUST]` O sistema deve manter a linha de filtros utilizavel em 360 e 390 px (grade de 2 colunas no mobile) e 1280 px com o select novo, sem sobreposicao nem vazamento horizontal.

### 4.8 Dados, pipeline e dataset

- **RF-42** `[MUST]` O projeto deve ter um script separado, rodado a mao, que gera o recorte curado (nome ilustrativo da IDEA: `tools/dataset/curated/pokeapi-game-availability.json`; caminho final na SPEC) a partir da PokeAPI, e o recorte deve ser versionado no git, registrando a origem (URLs consultadas e data da geracao) no proprio JSON ou no `tools/dataset/README.md`.
- **RF-43** `[MUST]` O build do dataset deve ler SO o recorte curado versionado e nunca depender de rede nem do `.cache/` ignorado pelo git; outro PC deve reproduzir o dataset identico sem rede e sem `.cache/` local (build reproduzivel).
- **RF-44** `[MUST]` O build do dataset deve falhar com erro claro quando o recorte curado faltar ou estiver invalido (nao publicar dataset sem os dados de jogos nem ignorar o erro).
- **RF-45** `[MUST]` O pipeline deve embutir no dataset publicado, para cada especie, os dados necessarios ao filtro de jogo (RF-35 a RF-37) e ao bloco "Jogos" (RF-29), e a geracao necessaria a cada estagio da cadeia (RF-12), de forma que o Detail nao fique dependente do indice carregado para mostrar a geracao dos estagios (criterio da IDEA secao 2; escolha de representacao na SPEC).
- **RF-46** `[MUST]` O pipeline deve continuar publicando todos os campos existentes de especies e demais arquivos sem perder nem alterar nenhum (so acrescimos), inclusive `generation` com os mesmos valores (excecoes permitidas na comparacao "so acrescimos": `datasetVersion`, `dataset-manifest.json` (sources) e `current.json`, que mudam por definicao, RF-47; todo o resto so ganha campos) (contagens atuais: gen1 151, gen2 100, gen3 135, gen4 107, gen5 156, gen6 72, gen7 86, gen7b 2, gen8 89, gen8a 7, gen9 120, custom 2; total 1027).
- **RF-47** `[MUST]` O pipeline deve publicar uma versao nova do dataset (`datasetVersion` muda) com `current.json` atualizado; o plano da janela quebrada do contrato esta em "Restricoes de implementacao e processo" (secao 3).
- **RF-48** `[MUST]` O contrato publicado deve validar o dataset real sem descartar campo novo (`published-schemas.test.ts` cobre).
- **RF-49** `[MUST]` A auditoria independente do dataset (`tools/dataset/audit/`) deve seguir com 0 divergencias nos campos que ja cobre (incluindo `generation`); se a SPEC a estender aos campos novos, o esperado nao pode depender do proprio recorte que valida (o pack nao tem dados de jogos).
- **RF-50** `[MUST]` O pipeline deve ser deterministico: duas execucoes no mesmo snapshot geram arquivos identicos e a mesma `datasetVersion`.
- **RF-51** `[MUST]` O pipeline deve cobrir na juncao toda especie do dataset com dex 1..1025 (sem buracos). "Correspondencia na fonte" = o numero nacional existe como `pokemon-species` na PokeAPI (1..1025). Especie oficial sem correspondencia faz o build do dataset FALHAR com erro claro; especie `custom` recebe lista vazia sem falhar. [ASSUMPTION: conferido no CONTEXT: indice 1..1025 sem buracos mais 9901 e 9902 (aceita pelo orquestrador em 2026-10-12)]

### 4.9 Creditos, i18n e nao-regressao

- **RF-52** `[MUST]` O sistema deve creditar a PokeAPI como fonte dos dados de jogos na tela Configuracoes (creditos/"Sobre", hoje `settings.images`) em PT e EN, e ajustar a frase do README "Dados 100% do modpack" (deixa de ser verdade) sem apagar os demais creditos. Mesmo sem exigencia de atribuicao encontrada, o credito entra.
- **RF-53** `[MUST]` O sistema deve ter todo texto novo (rotulos curtos e longos de geracao, nome do filtro "Jogo" e opcao "Todos", titulo do bloco "Jogos", nota da National Dex, "Não aparece nos jogos oficiais", "Só no pack", nomes acessiveis dos selos, credito) no dicionario central em PT e EN, sem texto literal no JSX (lint `no-literal-jsx-text`); nomes proprios de jogos iguais nos dois idiomas.
- **RF-54** `[MUST]` O sistema deve manter, sem alteracao de comportamento, tudo o que ja existe: ordenacao do Dex, filtros de tipo/evolucao/status, busca por nome PT/EN, paineis de spawn, iscas e bagas, telas de itens, tela Compare, selo de raridade no Hero do Detail e no painel "Onde encontrar" (`.where-rarity`), e selos Lendario/Mitico nos cards.
- **RF-56** `[MUST]` O sistema deve manter todos os testes existentes verdes (vitest, Playwright), ajustando SOMENTE os asserts diretamente afetados pela saida da raridade do card e pelo selo novo, sem afrouxar nenhum assert. Hoje identificados (CONTEXT secao 6): `tests/e2e/detail.spec.ts` (contagem de selos no Hero, `.seal .badge`), `tests/e2e/dex.spec.ts` (selo no card lendario; "badges never wrap"), `tests/unit/ui-screens/pokemon-card.test.tsx` (raridade no card; assert de que o card sem raridade nao tem nenhum `[class*="badge-"]`), `tests/e2e/responsive.spec.ts` (selos em Dex, Detail, Capturados e Home). Suite completa e `npm run build` verdes antes e depois. Fixtures de `SpeciesSummary` acompanham qualquer campo novo obrigatorio. A SPEC confirma a lista rodando a suite.

## 5. Requisitos nao funcionais

- **RNF-01 (Peso / boot)** `[MUST]` O crescimento total dos arquivos precacheados pelo service worker (soma sobre os arquivos do dataset precacheados) deve ser <= 10.240 bytes gzip (teto da IDEA secao 2; hoje `species-index.json` = 293.243 bytes, 36.163 bytes gzip). A SPEC escolhe a representacao compacta e mede; se criar arquivo novo, ele entra no precache do dataset (unico ajuste permitido no service worker).
- **RNF-03 (Offline / PWA)** `[MUST]` Comportamento offline inalterado: nenhuma chamada de rede nova em runtime, nenhuma midia nova; todos os dados de jogos saem do dataset empacotado e precacheado.
- **RNF-05 (Acessibilidade)** `[MUST]` O select "Jogo" tem rotulo e e operavel por teclado, como o filtro de geracao; o selo de geracao e legivel (texto, nao so cor) com contraste nos 4 temas; o destaque da cadeia (RF-13/14) tem pista nao cromatica e nome acessivel; o bloco "Jogos" e uma lista semantica acessivel por leitor de tela. [ASSUMPTION: verificacao por tema definida pela SPEC/testes, como nos PRDs anteriores.]
- **RNF-06 (Responsividade / sem sobreposicao)** `[MUST]` Dex, Capturados, Detail (Hero, cadeia e bloco "Jogos") e linha de filtros sem sobreposicao de texto nem vazamento horizontal em 360, 390 e 1280 px, PT e EN (regra "Sem sobreposicao de texto", coberta por `responsive.spec.ts` em Home, Dex, Detail e Capturados).
- **RNF-08 (Qualidade estatica)** `[MUST]` `typecheck` e `lint` (incluindo `no-literal-jsx-text`) limpos.
- **RNF-09 (Cobertura)** `[MUST]` Codigo novo respeita os limites de cobertura v8 do projeto (global 80/80, `tools/dataset/src/**` 80/80, `src/screens/**` 70/70, `src/domain/**` 95/95).
- **RNF-11 (Performance)** `[MUST]` O filtro de jogo e o selo nao degradam a listagem: nenhum download novo na Pokedex, custo por card sem crescimento relevante, filtro aplicado sobre os 1027 itens sem travar a interacao. [ASSUMPTION: sem meta numerica na IDEA; requisito qualitativo, a SPEC fixa uma meta mensuravel (aceita pelo orquestrador em 2026-10-12)]
- **RNF-12 (Seguranca / privacidade)** `[MUST]` Nenhum segredo, credencial ou valor de variavel de ambiente em artefatos versionados (PRD, recorte, codigo); sem novo servico, coleta ou chamada de rede em runtime.
- **RNF-13 (Uso justo da fonte)** `[MUST]` O script de regeneracao do recorte respeita o uso justo da PokeAPI (reuso do cliente existente com cache local e backoff, sem excesso de chamadas) e roda so a mao; o credito de RF-52 acompanha.

## 6. Criterios de aceite

Formato Dado/Quando/Entao; cada criterio cita os RF/RNF que valida.

**Selo no card (RF-01 a RF-07)**
- **CA-01** Dado a Pokedex; quando vejo os cards de Zubat, Crobat, Meltan, Wyrdeer e Piglich; entao mostram "Gen 1", "Gen 2", "Gen 7 (Let's Go)", "Gen 8 (Arceus)" e "Pack". (RF-01, 05)
- **CA-02** Dado a Pokedex inteira; quando comparo o selo de cada card com o `generation` da especie; entao os 1027 batem (teste deriva do `species-index`). (RF-01, 05)
- **CA-03** Dado qualquer card da Pokedex e da tela Capturados; quando o inspeciono; entao nao ha selo de raridade e o selo de geracao esta onde o de raridade ficava. (RF-02, 03)
- **CA-04** Dado o card de um Pokemon lendario e de um mitico (ex.: Mewtwo, Mew); quando o vejo; entao os selos Lendario/Mitico continuam visiveis ao lado do selo de geracao. (RF-04)
- **CA-05** Dado um Pokemon com forma (ex.: Charizard com Mega); quando vejo o card e o Detail; entao a geracao mostrada e a da especie base. (RF-06)
- **CA-06** Dado a Pokedex a 360, 390 e 1280 px, PT e EN, com selos Lendario e "Gen 8 (Arceus)"; quando meco os selos; entao nenhum texto de selo quebra nem sobrepoe. (RF-07, RNF-06)

**Detail (RF-08 a RF-11)**
- **CA-07** Dado o Detail do Charizard; quando abro; entao o Hero mostra o selo de geracao em rotulo longo ("Geração 1" / "Generation 1") e o selo de raridade. (RF-08, 09)
- **CA-08** Dado o Detail de Mewtwo (lendario); quando abro; entao o Hero mostra Lendario, geracao e raridade. (RF-09)
- **CA-09** Dado o painel "Onde encontrar" de um Pokemon com spawn; quando abro; entao `.where-rarity` mostra a raridade como hoje. (RF-10, 54)
- **CA-10** Dado o Hero com o selo novo em 360 px; quando meco; entao os selos nao sobrepoem os botoes shiny/grito. (RF-11, RNF-06)

**Cadeia de evolucao (RF-12 a RF-17)**
- **CA-11** Dado o Detail do Zubat; quando vejo a cadeia; entao Zubat, Golbat e Crobat mostram o selo de geracao e so Crobat (gen 2) tem destaque. (RF-12, 13)
- **CA-12** Dado o Detail do Tyrogue; quando vejo a cadeia ramificada; entao Tyrogue (gen 2) e a raiz e cada evolucao mostra o selo, com destaque nas que diferem da raiz (Hitmonlee, gen 1, destacado; conferido contra o `generation` de cada uma). (RF-12, 13)
- **CA-13** Dado o Detail do Crobat (estagio final); quando vejo a cadeia; entao a mesma regra de destaque se aplica (raiz Zubat gen 1, Crobat destacado), igual ao Detail do Zubat. (RF-13)
- **CA-14** Dado uma cadeia toda da mesma geracao (ex.: Charmander, Charmeleon, Charizard); quando vejo; entao todos os selos aparecem sem destaque. (RF-12, 13)
- **CA-15** Dado o destaque; quando verifico sem cor (escala de cinza ou leitor de tela); entao o estagio destacado continua distinguivel por pista nao cromatica e nome acessivel. (RF-14, RNF-05)
- **CA-16** Dado a cadeia; quando a inspeciono; entao nao ha disponibilidade por jogo nem texto extra por jogo. (RF-15)
- **CA-17** Dado o Detail aberto direto (indice de especies ainda carregando); quando os dados chegam; entao os selos dos estagios aparecem sem salto de layout. (RF-16, 45)
- **CA-18** Dado um estagio sem geracao conhecida (no sintetico); quando renderizo a cadeia; entao o estagio aparece sem selo e sem erro. (RF-17)
- **CA-19** Dado cada cadeia de todas as fichas do dataset; quando derivo dos dados; entao cada estagio mostra a geracao igual ao `generation` da sua especie (teste deriva dos dados, sem lista a mao). (RF-12, 45)

**Filtro de geracao (RF-18 a RF-20)**
- **CA-20** Dado os testes existentes de `f-gen` (unit e e2e: gen1 + Fogo = 12 cards); quando rodo; entao passam sem alteracao. (RF-18, 56)
- **CA-21** Dado o filtro de geracao ativo e a abertura de um Pokemon; quando uso Voltar; entao o filtro e restaurado. (RF-19)
- **CA-22** Dado as opcoes do select de geracao; quando as leio; entao sao as mesmas, na mesma ordem, com os mesmos textos de hoje. (RF-18)

**Jogos: regra e dados (RF-21 a RF-28, RF-42 a RF-51)**
- **CA-23** Dado o recorte curado; quando o teste deriva a lista de jogos pela regra (version-groups com Pokedex regional ligada, menos exclusoes e com fusoes nominais); entao a lista do app e exatamente essa, em ordem cronologica, sem jogo escrito a mao. (RF-22, 24)
- **CA-24** Dado a lista de jogos derivada; quando a leio por version-group; entao nao ha entrada para `red-green-japan`, `blue-japan`, `champions` nem para os version-groups so de DLC (`the-isle-of-armor`, `the-crown-tundra`, `the-teal-mask`, `the-indigo-disk`, `mega-dimension`); ha uma entrada unica para `sword-shield`, `scarlet-violet` e `legends-za`; entradas separadas para `diamond-pearl` e `brilliant-diamond-shining-pearl`; `legends-arceus` presente. (RF-22, 23)
- **CA-25** Dado Jogo = FireRed / LeafGreen; quando vejo a lista; entao ha exatamente 151 especies, todas da Pokedex `kanto`, com Zubat e Golbat presentes e Crobat ausente. (RF-21, 28, 36)
- **CA-26** Dado `sword-shield`; quando vejo a lista; entao o conjunto e a uniao de `galar`, `isle-of-armor` e `crown-tundra`; analogo para `scarlet-violet` (`paldea`, `kitakami`, `blueberry`) e `legends-za` (`lumiose-city` e `hyperspace`, esta ultima vinda da fusao de `mega-dimension`). (RF-21, 22)
- **CA-27** Dado o Detail do Hitmonlee e do Tyrogue; quando abro "Jogos"; entao Hitmonlee lista FireRed / LeafGreen e Tyrogue nao. (RF-21, 28, 29)
- **CA-28** Dado as especies `custom` (dex 9901, 9902) e uma especie com correspondencia na fonte mas sem nenhum jogo (caso defensivo, teste com dado sintetico); quando vejo o Detail e o filtro de jogo; entao as `custom` mostram exatamente "Só no pack", a outra mostra exatamente "Não aparece nos jogos oficiais", e nenhum jogo inclui as `custom`. (RF-26, 30)
- **CA-29** Dado cada especie do `species-index`; quando derivo no teste a lista de jogos a partir do recorte juntando por dex; entao bate com o dataset publicado, sem juncao por nome. (RF-25, 45)
- **CA-30** Dado o script de regeneracao e o recorte curado; quando os inspeciono; entao o script e separado do build, rodado a mao, e o build nao o chama; o recorte esta versionado no git e registra a origem (URLs consultadas e data da captura). (RF-42, 43)
- **CA-31** Dado o recorte curado removido ou corrompido; quando rodo o build do dataset; entao falha com erro claro e nao publica. (RF-44)
- **CA-32** Dado um PC sem rede e sem `.cache/`; quando rodo o build do dataset; entao conclui e gera arquivos identicos aos de outro PC. (RF-43, 50)
- **CA-33** Dado duas execucoes do pipeline no mesmo snapshot; quando comparo; entao arquivos e `datasetVersion` identicos. (RF-50)
- **CA-34** Dado o dataset publicado; quando comparo os campos existentes de especies e demais arquivos com o dataset anterior; entao nenhum foi perdido ou alterado (so acrescimos, exceto `datasetVersion`, `dataset-manifest.json` (sources) e `current.json`, que mudam por definicao) e as contagens de `generation` seguem 151/100/135/107/156/72/86/2/89/7/120/2 (total 1027). (RF-46)
- **CA-35** Dado `current.json`; quando o leio; entao `datasetVersion` e novo e diferente de `atm1.3.0-cobblemon1.7.3-20260930-1949ea67`. (RF-47)
- **CA-36 (criterio de PROCESSO, nao de produto)** Dado o plano da SPEC; quando reviso a ordem; entao o frontend so comeca depois da republicacao do dataset e os testes de contrato/join ficam excluidos so ate ela (restricao da secao 3). (RF-47)
- **CA-37** Dado `published-schemas.test.ts` contra os arquivos reais; quando roda; entao passa e nenhum campo novo e descartado. (RF-48)
- **CA-38** Dado a auditoria `tools/dataset/audit/`; quando rodo; entao 0 divergencias. (RF-49)
- **CA-39** Dado uma especie oficial do indice sem entrada na fonte; quando rodo o build; entao falha com erro claro; e `custom` recebe lista vazia sem falhar. (RF-26, 51)

**Bloco "Jogos" no Detail (RF-29 a RF-34)**
- **CA-40** Dado o Detail do Zubat; quando abro; entao o bloco "Jogos" lista os jogos derivados (inclui FireRed / LeafGreen, em ordem cronologica) e a nota de uma linha sobre a National Dex. (RF-29, 33, 24)
- **CA-41** Dado o Detail do Crobat; quando abro; entao FireRed / LeafGreen NAO aparece na lista. (RF-21, 28)
- **CA-42** Dado uma especie que consta em muitos jogos, a 360 e 390 px; quando abro "Jogos"; entao todos os jogos estao acessiveis, sem vazar nem sobrepor. (RF-31, RNF-06)
- **CA-43** Dado o Detail em PT e EN; quando leio o bloco; entao titulo, nota e mensagens vazias estao traduzidos. (RF-30, 33, 53)
- **CA-44** Dado o card da listagem e a cadeia de evolucao; quando os inspeciono; entao nao mostram jogos. (RF-15)
- **CA-45** Dado os dados de jogos ausentes no carregamento; quando abro o Detail; entao nao ha lista vazia enganosa nem erro. (RF-32)

**Filtro por jogo (RF-35 a RF-41)**
- **CA-46** Dado a linha de filtros da Pokedex; quando a vejo; entao ha o select "Jogo" ao lado do de geracao, com "Todos" por padrao e um item por jogo da lista derivada, em ordem cronologica. (RF-35)
- **CA-47** Dado Jogo = FireRed / LeafGreen; quando vejo a listagem; entao so aparecem as especies disponiveis nele. (RF-36)
- **CA-48** Dado Jogo = FireRed / LeafGreen E Tipo = Veneno; quando vejo a listagem; entao aparecem Zubat, Golbat etc. e nao Crobat. (RF-37)
- **CA-49** Dado Jogo = FireRed / LeafGreen E Geracao = Gen 2; quando vejo a listagem; entao o estado vazio aparece sem erro. (RF-37, 39)
- **CA-50** Dado o filtro de jogo ativo e a abertura de um Pokemon; quando uso Voltar; entao o filtro e restaurado junto com os demais. (RF-38)
- **CA-51** Dado nenhum jogo selecionado; quando uso a listagem (abas, busca, ordenacao, filtros); entao o resultado e identico ao de antes. (RF-40, 54)
- **CA-52** Dado a linha de filtros em 360, 390 e 1280 px, PT e EN; quando meco; entao o select novo nao sobrepoe nem vaza. (RF-41, RNF-06)
- **CA-53** Dado o select "Jogo"; quando navego por teclado; entao e alcancavel, rotulado e operavel. (RNF-05)

**Creditos, i18n e nao-regressao**
- **CA-54** Dado a tela Configuracoes e o README; quando os leio; entao a PokeAPI e creditada como fonte dos dados de jogos em PT e EN e a frase "Dados 100% do modpack" foi ajustada. (RF-52)
- **CA-55** Dado o app em PT e EN; quando percorro card, Detail, cadeia, bloco "Jogos" e filtros; entao nenhum texto novo esta sem traducao nem literal no JSX (lint verde). (RF-53)
- **CA-56** Dado o painel de spawn, iscas, bagas, telas de itens, Compare, busca e ordenacao; quando rodo as suites existentes dessas telas; entao passam sem alteracao e o comportamento antes/depois e identico. (RF-54)
- **CA-57** Dado o `WherePanel`; quando o abro; entao a raridade continua funcionando (export de raridade preservado, restricao da secao 3). (RF-10)
- **CA-58** Dado a suite completa (vitest, Playwright, typecheck, lint, cobertura) e `npm run build`; quando rodo; entao tudo verde, com ajuste somente nos asserts de RF-56 e nenhum outro afrouxado. (RF-56, RNF-08, 09)
- **CA-59 (criterio de PROCESSO)** Dado o plano da SPEC; quando reviso; entao ha execucao da suite completa e do build na main ANTES de implementar, registrando flakes preexistentes (restricao da secao 3). (RF-56)
- **CA-60** Dado os arquivos de dataset precacheados antes e depois; quando somo o gzip de todos; entao o crescimento total e <= 10.240 bytes. (RNF-01)
- **CA-61** Dado o app offline apos a primeira carga; quando uso o filtro de jogo e abro o bloco "Jogos"; entao funciona sem chamada de rede nova. (RNF-03)
- **CA-62** Dado os 4 temas; quando vejo o selo de geracao e o destaque da cadeia; entao ha contraste legivel e foco visivel. (RNF-05)
- **CA-63** Dado os artefatos versionados; quando busco por segredos; entao nao ha credencial, token nem valor de variavel de ambiente. (RNF-12)
- **CA-65** Dado o script de regeneracao do recorte; quando leio o codigo; entao reusa o cliente PokeAPI do pipeline (cache local e backoff) e nenhum passo do build do dataset o executa. (RNF-13)
- **CA-64** Dado o render da Pokedex com 1027 especies e o filtro de jogo; quando o uso; entao nao ha download novo e a interacao nao trava. (RNF-11)

## Perguntas em aberto

Nenhuma para o usuario: o Pontin delegou todas as decisoes restantes ao orquestrador e elas estao na IDEA (secoes 2 e 11). Itens que a IDEA deixou a SPEC/UISPEC e que afetam o PRD (nao bloqueiam o PRD):

1. Representacao dos dados no dataset (codigos curtos no indice, bitmask ou arquivo separado precacheado) e se a geracao entra nos nos da cadeia ou vem por lookup no indice: a SPEC escolhe pelo criterio "Detail nao fica dependente do indice carregado" e pelo orcamento de ~10 KB gzip. Bloqueia: RF-45, RNF-01. Adiado para SPEC/UISPEC (decisao intencional).
2. RESOLVIDO (IDEA secao 2): `red-green-japan` e `blue-japan` sao EXCLUIDOS por nome (RF-22, CA-24).
3. Nome exato de exibicao de cada jogo (ex.: "Legends: Arceus" vs "Legends Arceus", "Legends: Z-A") e rotulos do select "Jogo": UISPEC. Bloqueia: RF-23. Adiado para SPEC/UISPEC (decisao intencional).
4. Se a auditoria independente (`tools/dataset/audit/`) sera estendida aos campos novos: SPEC decide (o pack nao tem dados de jogos). Bloqueia: RF-49. Adiado para SPEC/UISPEC (decisao intencional).
5. Forma visual do selo de geracao, do destaque da cadeia (cor, contorno, icone) e a apresentacao da lista de jogos em tela pequena: UISPEC. Bloqueia: RF-05 (forma), RF-13, RF-14, RF-31. Adiado para SPEC/UISPEC (decisao intencional).

Suposicoes marcadas `[ASSUMPTION]`:
1. (removida: o teto de 10.240 bytes gzip agora e decisao da IDEA secao 2.)
2. RF-13: "especie base" da IDEA interpretada como o primeiro estagio (raiz) da cadeia, igual em qualquer Detail da mesma cadeia. (aceita pelo orquestrador em 2026-10-12)
3. RF-18: rotulos das opcoes do filtro de geracao nao mudam (nao alterar o existente). (aceita pelo orquestrador em 2026-10-12)
4. RF-23: nomes de jogo iguais em PT e EN. (aceita pelo orquestrador em 2026-10-12)
5. RF-32: ausencia de dados de jogos e defensiva (nao ocorre em producao). (aceita pelo orquestrador em 2026-10-12)
6. RF-38: filtro de jogo restaurado no Voltar como os demais filtros. (aceita pelo orquestrador em 2026-10-12)
7. RF-51: indice 1..1025 sem buracos mais 9901 e 9902 (conferido no CONTEXT). (aceita pelo orquestrador em 2026-10-12)
8. RNF-05: verificacao de contraste nos 4 temas definida pela SPEC. (aceita pelo orquestrador em 2026-10-12)
9. RNF-11: performance qualitativa, sem meta numerica na IDEA. (aceita pelo orquestrador em 2026-10-12)
