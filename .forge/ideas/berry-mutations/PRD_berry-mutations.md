---
feature: berry-mutations
language: pt-BR
status: draft
---

# PRD - berry-mutations (cruzamento de bagas na pagina do item e tag de origem na listagem)

## Revision History

| Data | Revisao | O que mudou |
|---|---|---|
| 2026-09-30 | 1 | Criacao do PRD a partir da IDEA (addbd84d16af) e do CONTEXT (5328d71ac277). Escopo = secoes 2 e 3 da IDEA, tudo aditivo. |
| 2026-09-30 | 2 | Correcoes do forge-review: regra de resultado do filtro de origem (RF-30, CA-25); tag de origem como regra em qualquer aba/visao/busca (RF-28, CA-22); verificacao por tema e nova, nao existente (RF-44, RNF-03, RNF-04); RF-35 so `preferredBiomeTags` alimenta "Cresce melhor em"; RNF-10/CA-44 sem HOW de memoizacao; CA-37 marcado como criterio de processo. |
| 2026-09-30 | 3 | Notas da SPEC: RF-47 e CA-39 (unico assert existente que muda e `tests/e2e/item.spec.ts:259`; `item-screen.test.tsx` nao e afetado); RNF-01 (`tests/unit/dataset/join.test.ts:322` e o teto efetivo). |

## Baseline (drift anchor)

- `HEAD`: `3134cd43` (branch `feature/berry-mutations`)
- `IDEA_berry-mutations.md` (`git hash-object`, 12 chars): `addbd84d16af`
- `CONTEXT_berry-mutations.md` (`git hash-object`, 12 chars): `5328d71ac277`

## 1. Objetivo e visao

**Problema.** No All the Mons, 39 das 70 bagas do Cobblemon nao nascem no mundo: so se obtem por cruzamento (plantar duas arvores lado a lado). A Liechi nasce em um unico bioma e tambem sai de cruzamento. Hoje o Pontindex nao explica nada disso: a pagina de todas as 70 bagas diz "Plantavel: cresce nos biomas X", o que induz a achar que a baga nasce la (bug de informacao, IDEA secao 12), e a listagem de itens nao diferencia baga de mundo de baga de cruzamento.

**Para quem.** Jogador do modpack que consulta a pagina de uma baga para consegui-la (persona unica, secao 2).

**Por que agora.** Pedido direto do Pontin em 2026-09-30: cada baga de cruzamento deve ter, na pagina individual, COMO fazer, quais cruzar e a chance de dar certo; as bagas parceiras devem ser clicaveis para ver onde encontra-las; a listagem de itens deve ter uma tag "se e obtida em mutacao ou no mundo" para identificar de relance.

**Impacto esperado.** O jogador abre a pagina da Lum, ve "Oran + Cheri (ou Aspear, Chesto, Pecha, Rawst)", a mecanica e a chance, clica na Oran e ve onde ela nasce. Na listagem, distingue as bagas de mundo das de mutacao sem abrir nada, e pode filtrar por origem.

**Metrica de sucesso (verificavel).**
- 100% das bagas que sao resultado de ao menos um par nos arquivos `berries/*.json` (hoje 40: as 39 so-por-cruzamento mais a Liechi) mostram o bloco "Como cruzar" com todos os pares, e 0 outras bagas ou itens mostram o bloco. Pares e contagens DERIVADOS dos arquivos do pack, nunca de lista manual.
- 100% das 70 bagas mostram a tag de origem correta na listagem (Mutacao, Mundo, ou as duas na Liechi); 0 item nao-baga mostra a tag.
- A linha "Encontrada no mundo" aparece so nas 31 bagas com `spawnConditions` nao vazio e em nenhuma das 39 de cruzamento.
- Nenhum teste existente regride, salvo os asserts diretamente afetados pela correcao aprovada do "Plantavel" (RF-13 a RF-18), e a auditoria do dataset segue com 0 divergencias.

## 2. Publico-alvo (personas)

- **Jogador do ATMons (Pontin e amigos)**: joga o modpack All the Mons 1.3.0, usa o Pontindex no desktop ou no celular (PWA), em PT ou EN. Quer saber como obter uma baga (mundo ou cruzamento) e o que cruzar.

## 3. Escopo

**Dentro do escopo**
- (a) Pagina individual de cada baga obtida por cruzamento: bloco "Como cruzar" com os pares, a mecanica e a chance; cada baga parceira clicavel para a pagina dela.
- (b) Pagina das bagas usadas como ingrediente: "Usada em cruzamento" (caminho inverso), com as bagas clicaveis.
- (c) Listagem de itens: tag de origem "Mutacao" / "Mundo" nos cards das bagas e filtro por origem na busca de itens.
- (d) Correcao do "Plantavel" das bagas: "Encontrada no mundo" (spawn real) e "Cresce melhor em" (bonus de rendimento).
- Pipeline do dataset (leitura de `mutations` e `spawnConditions` dos arquivos das bagas), contrato e republicacao do dataset, necessarios para (a) a (d).
- PT e EN em todo texto novo.

**Fora do escopo (NAO tocar)**
- Qualquer conteudo, layout ou comportamento existente da pagina de item e da listagem (Pontin: "nada pode mudar, so deve ser acrescentado essas infos"), exceto a linha "Plantavel" das bagas (unica alteracao aprovada).
- A linha "Plantavel" de apricorns e mints (nao muda) e qualquer tag ou bloco novo neles.
- Outras telas: Home, Detail do Pokemon, Treinadores, Pokedex.
- Dados de bagas que nao sejam origem/cruzamento: descricao, isca (`bait`), receitas, drops, loot de estruturas, recompensas, loja.
- Novo bloco com as fontes alternativas das 39 bagas (bau, treinador, loja): o que ja aparece hoje continua como esta; nada e acrescentado alem dos itens (a) a (d).
- Simulador ou calculadora de cruzamento, e chance individual por par (a chance e a mesma para todas, texto fixo da mecanica).
- Apps nativos (ideia `pontindex-app`).

## 4. Requisitos funcionais

Prioridade: todos `[MUST]` (regra fixa do Pontin neste projeto). Papeis e permissoes: N/A (site publico, sem login e sem backend, todos veem tudo). Ciclo de vida / round-trip de dados: N/A (sem CRUD; dados derivados do pack e publicados no dataset somente leitura).

Restricoes tecnicas herdadas da IDEA e do codigo (nao expandir): os pares e a classificacao mundo/mutacao saem dos arquivos `data/cobblemon/berries/*.json` (`mutations`, `spawnConditions`), nunca de lista manual (LESSONS); o dataset precisa ser republicado e o frontend so comeca depois; o texto da mecanica (12,5%, x4 com Surprise Mulch, 4 vizinhos ortogonais sem diagonal) vem do codigo do jogo (`BerryBlock.determineMutation`), nao de arquivo do pack, e fica como texto fixo traduzido PT/EN. A escolha de contrato, de onde vive a classificacao, do dedupe de pares, do teto de tamanho e da apresentacao de lista longa ficam para a SPEC (ver Perguntas em aberto).

### 4.1 Bloco "Como cruzar" na pagina da baga

- **RF-01** `[MUST]` O sistema deve exibir, na pagina de toda baga que e resultado de ao menos um par de cruzamento nos arquivos do pack, um bloco "Como cruzar" acrescentado, sem remover nem reordenar o que a pagina ja mostra. A REGRA governa (baga que aparece como valor em algum `mutations`); a contagem atual e 40 bagas (39 so-por-cruzamento mais Liechi) e deve ser derivada dos arquivos pela SPEC e pelos testes, nunca de lista a mao.
- **RF-02** `[MUST]` O sistema deve listar no bloco todos os pares que geram a baga, cada par como "baga A + baga B". Um par nao ordenado aparece uma unica vez (Oran+Cheri e Cheri+Oran sao o mesmo par, embora os arquivos o tragam nos dois lados).
- **RF-03** `[MUST]` O sistema deve tornar cada baga parceira do bloco clicavel, abrindo a pagina dela (que mostra o proprio "Onde encontrar"/"Como obter") e respeitando a navegacao com historico (Voltar retorna a pagina de origem). Reuso do componente existente de link de item (`ItemLink`); `mon-chip` e de Pokemon e nao se usa.
- **RF-04** `[MUST]` O sistema deve permitir seguir a cadeia clicando: quando um parceiro tambem e baga de cruzamento, o link leva a pagina dele, que mostra o proprio bloco "Como cruzar" (ex. Starf precisa de Pomeg, que precisa de Haban + Sitrus, que precisa de Lum, que precisa de Oran + Cheri).
- **RF-05** `[MUST]` O sistema deve mostrar no bloco, em PT e EN, a mecanica do jogo: plantar as duas arvores lado a lado (vizinhos ortogonais: norte, sul, leste, oeste; NAO vale diagonal); a cada colheita a chance e de 12,5%; com Surprise Mulch na arvore a chance e 4x (50%); se der certo, uma das frutas da arvore colhida vira a baga resultante. O texto e fixo e igual em todas as bagas.
- **RF-06** `[MUST]` O sistema deve exibir a chance como valores fixos "12,5%" e "50% com Surprise Mulch" (EN: "12.5%" e "50% with Surprise Mulch"), formatados conforme o idioma, iguais para todas as bagas (a chance nao esta em nenhum arquivo do pack e nao varia por par).
- **RF-07** `[MUST]` O sistema deve mostrar o nome localizado da Surprise Mulch (idioma dos termos do card, como os demais nomes de item) no texto da chance.
- **RF-08** `[MUST]` O sistema deve manter a lista de pares utilizavel em tela pequena (360 e 390 px) mesmo para a baga com muitos pares: a Enigma tem 18 pares (Hopo + 18 parceiros) e Eggant, Sitrus, Lum, Leppa e Starf tem 5 cada. Nenhum par pode ser omitido nem ficar inacessivel (se houver colapso, ele expoe todos os pares); a forma de apresentacao e da SPEC, dentro do padrao visual existente.
- **RF-09** `[MUST]` O sistema deve exibir o bloco da Liechi (baga com as duas origens) com o cruzamento Kelpsy + Pamtre, mantendo tudo o que a pagina dela ja mostra (inclusive "Encontrada no mundo", RF-14).
- **RF-10** `[MUST]` O sistema deve mostrar na pagina da Eggant (unica baga sem nenhuma fonte alem do cruzamento) o bloco "Como cruzar" mais o que ela ja mostra hoje, sem inventar nenhuma outra fonte.
- **RF-11** `[MUST]` O sistema NAO deve exibir o bloco "Como cruzar" (nem bloco vazio ou titulo solto) em baga que nao e resultado de nenhum par, nem em item que nao e baga (apricorns, mints e demais).
- **RF-12** `[MUST]` O sistema deve exibir o bloco com os nomes das bagas localizados PT/EN (nome do `items.json` ja carregado) e o texto da mecanica traduzido, respeitando o toggle de idioma dos termos do card da pagina do item.

### 4.2 Correcao do "Plantavel" das bagas

- **RF-13** `[MUST]` O sistema deve, nas bagas, substituir a linha unica "Plantavel: cresce nos biomas X" por duas informacoes distintas: "Encontrada no mundo: biomas X" e "Cresce melhor em: biomas X". Esta e a UNICA alteracao de conteudo existente aprovada pelo Pontin.
- **RF-14** `[MUST]` O sistema deve mostrar "Encontrada no mundo" somente nas bagas com spawn real (`spawnConditions` nao vazio nos arquivos; hoje 31) e em nenhuma das bagas so-por-cruzamento (hoje 39). A REGRA governa; a contagem e derivada dos arquivos.
- **RF-15** `[MUST]` O sistema deve mostrar em "Encontrada no mundo", para a baga com spawn em biomas preferidos (`preferred_biome`), os biomas em que ela nasce; para Oran e Persim (`all_biome`), o texto de que nascem em qualquer bioma, sem listar biomas; para a Liechi (`specific_biome`), o bioma dela (tag `cobblemon:is_mirage_island`, rotulo Mirage Ilha/Mirage Island que o dataset ja tem), sem aviso extra.
- **RF-16** `[MUST]` O sistema deve mostrar "Cresce melhor em: biomas X" em todas as 70 bagas, com os biomas de bonus de rendimento (`preferredBiomeTags`), sem afirmar que a baga nasce la.
- **RF-17** `[MUST]` O sistema NAO deve alterar a linha "Plantavel" de apricorns e mints: continuam exatamente como hoje (mesmo texto, mesma posicao, mesmo `data-row`).
- **RF-18** `[MUST]` O sistema deve manter, para baga com `preferredBiomeTags` vazio, o comportamento atual da linha ("Pode ser plantado"). [ASSUMPTION: hoje nenhuma das 70 bagas tem a lista vazia (conferido nos 70 arquivos), entao o caso e defensivo; mantido por nao mudar o que ja existe.]

### 4.3 Caminho inverso: "Usada em cruzamento"

- **RF-19** `[MUST]` O sistema deve exibir, na pagina de toda baga que entra como ingrediente em ao menos um par, o bloco/linha "Usada em cruzamento" acrescentado, listando cada cruzamento no formato "+ parceiro = resultado" (ex. na Cheri: "+ Oran = Lum", "+ Persim = Figy"), com parceiro e resultado clicaveis para as paginas deles (mesmo componente e mesmo Voltar de RF-03).
- **RF-20** `[MUST]` O sistema deve listar cada cruzamento uma unica vez por baga (par "parceiro + resultado" sem repeticao) e derivar a lista dos arquivos do pack, invertendo os mapas `mutations` (regra, nao lista).
- **RF-21** `[MUST]` O sistema NAO deve exibir "Usada em cruzamento" em baga que nao entra como ingrediente em nenhum par, nem bloco vazio, nem em item que nao e baga.
- **RF-22** `[MUST]` O sistema deve manter a lista de "Usada em cruzamento" utilizavel em tela pequena para bagas com muitos cruzamentos (RF-08 se aplica), sem omitir nenhum.
- **RF-23** `[MUST]` O sistema deve permitir que a mesma baga mostre "Como cruzar" e "Usada em cruzamento" ao mesmo tempo (ex. Lum: gerada por Oran + X e ingrediente de Hopo e Sitrus), cada bloco com o proprio titulo.
- **RF-24** `[MUST]` O sistema deve mostrar o bloco em PT e EN, nomes localizados e texto traduzido.

### 4.4 Tag de origem e filtro na listagem de itens

- **RF-25** `[MUST]` O sistema deve mostrar em cada card de baga da listagem de itens uma tag de origem visivel: "Mutacao" (baga que e resultado de algum par) e/ou "Mundo" (baga com spawn real). Liechi mostra as duas. EN: nomes localizados.
- **RF-26** `[MUST]` O sistema deve derivar a origem dos mesmos dados das RF-01 e RF-14 (uma so regra para pagina e listagem), de modo que nenhuma baga mostre tag incompativel com a pagina dela. Dado o estado atual: 30 bagas so "Mundo" (as 31 com spawn menos Liechi), 39 so "Mutacao", 1 (Liechi) as duas. [ASSUMPTION: 30/39/1 e a consequencia direta das regras (31 com spawn, 40 resultados, intersecao Liechi); a SPEC deriva os numeros dos arquivos.]
- **RF-27** `[MUST]` O sistema deve renderizar a tag de origem como elemento NOVO com classe propria, sem reutilizar nem ficar dentro de `.item-tag` (categoria), mantendo o texto e a posicao de `.item-tag` (linha propria acima do nome) exatamente como hoje.
- **RF-28** `[MUST]` O sistema deve garantir que todo card de baga, em qualquer aba, visao geral ou resultado de busca, mostra a tag de origem (hoje as 70 bagas aparecem em Berries e Iscas, pois tem tag `bait`).
- **RF-29** `[MUST]` O sistema NAO deve exibir tag de origem em itens que nao sao bagas (apricorns, mints, iscas nao-baga, demais categorias).
- **RF-30** `[MUST]` O sistema deve oferecer, na busca de itens, um filtro por origem (Mutacao / Mundo). Com o filtro de origem ativo, a listagem mostra somente bagas daquela origem, em qualquer aba, visao geral ou resultado de busca; a Liechi aparece nos dois filtros; itens que nao sao bagas nao aparecem com o filtro ativo; sem filtro ativo, a listagem e identica a de hoje. Pontin confirmou o filtro ("sim"); forma e posicao do controle sao da SPEC, dentro do padrao visual existente.
- **RF-31** `[MUST]` O sistema deve manter o comportamento atual de abas, busca por nome PT/EN e ordenacao quando nenhum filtro de origem esta ativo (estado padrao = sem filtro, listagem identica a de hoje).
- **RF-32** `[MUST]` O sistema deve tratar o filtro de origem como estado de tela da listagem, restaurado ao usar Voltar como ja ocorre com aba e busca (padrao existente de estado por entrada da navegacao). [ASSUMPTION: derivado do comportamento atual de aba/busca (CONTEXT secao 2); a IDEA nao diz explicitamente, mas restauracao e o padrao da tela e nao muda nada existente.]
- **RF-33** `[MUST]` O sistema deve mostrar estado vazio coerente quando o filtro de origem combinado com aba/busca nao retorna itens, no mesmo padrao do estado vazio existente da listagem, sem erro.

### 4.5 Pipeline e dataset

- **RF-34** `[MUST]` O pipeline deve ler `mutations` e `spawnConditions` dos arquivos `data/cobblemon/berries/*.json` e publicar no dataset o necessario para RF-01 a RF-33, com a classificacao e os pares DERIVADOS dos arquivos (nunca de lista manual), invertendo `mutations` e deduplicando pares nao ordenados. Conferir as tres variantes de `spawnConditions.variant` (`preferred_biome`, `all_biome`, `specific_biome` com `biome`) e a forma dos mapas antes de fechar o contrato (LESSONS).
- **RF-35** `[MUST]` O pipeline deve continuar publicando `preferredBiomeTags` (unico campo que alimenta "Cresce melhor em") e `favoriteMulches` (publicado como hoje, nao renderizado) sem perder nem alterar nenhum campo existente das 70 bagas nem de outros itens.
- **RF-36** `[MUST]` O pipeline deve publicar uma versao nova do dataset (`datasetVersion` muda) com `current.json` atualizado, e o frontend so comeca a consumir os campos novos depois da republicacao (janela quebrada planejada pela SPEC: quais testes ficam excluidos ate la, LESSONS).
- **RF-37** `[MUST]` O pipeline deve gerar `items.json` identico (byte a byte) rodando na instancia real do pack e no snapshot `data-source/`, e deterministico em duas execucoes (padrao do projeto).
- **RF-38** `[MUST]` A auditoria independente do dataset (`tools/dataset/audit/`) deve continuar com 0 divergencias, incluindo checks dos campos novos quando a SPEC decidir que se aplicam.
- **RF-39** `[MUST]` O contrato publicado (schema zod estrito) deve validar o dataset real sem descartar campo novo (`published-schemas.test.ts` cobre).

### 4.6 i18n

- **RF-40** `[MUST]` O sistema deve ter todo texto novo (titulo "Como cruzar", "Usada em cruzamento", mecanica, chance, "Encontrada no mundo", "Cresce melhor em", tags "Mutacao"/"Mundo", rotulos do filtro, estado vazio) no dicionario central em PT e EN, sem texto literal no JSX (lint `no-literal-jsx-text`).
- **RF-41** `[MUST]` O sistema deve respeitar em EN e PT os nomes das bagas (localizados) e a formatacao da chance ("12,5%" / "12.5%").

### 4.7 Casos de borda e nao-regressao

- **RF-42** `[MUST]` O sistema NAO deve alterar nenhuma linha existente da pagina do item ("Como obter": craftable, drop, structureLoot, questReward, shop, bait etc., painel de isca, "Usado em") alem da linha "Plantavel" das bagas (RF-13), nem o conteudo, a ordem ou o `data-row` das linhas existentes; o que e novo entra como acrescimo.
- **RF-43** `[MUST]` O sistema NAO deve alterar o card da listagem alem do acrescimo da tag de origem (RF-25/27): `.item-tag` (texto e posicao acima do nome), nome, nome alternativo, descricao, caret, abas, busca por nome e ordenacao permanecem como hoje.
- **RF-44** `[MUST]` O sistema deve manter sem sobreposicao os cards da listagem em 360, 390 e 1280 px, em PT e EN, inclusive com nomes longos, com a tag de origem presente (duas tags na Liechi). Os testes de nao sobreposicao existentes cobrem esses tres tamanhos e os dois idiomas; verificacao por tema e nova e definida pela SPEC/testes.
- **RF-45** `[MUST]` O sistema deve manter o comportamento da tela de item e da listagem offline (PWA) e sem nova chamada de rede: tudo sai do dataset empacotado ja carregado.
- **RF-46** `[MUST]` O sistema deve tratar id de parceiro ou resultado fora do `items.json` como texto simples (comportamento do `ItemLink` atual), sem quebrar a pagina.
- **RF-47** `[MUST]` O sistema deve manter todos os testes existentes verdes (vitest, e2e), ajustando SOMENTE os asserts diretamente afetados pela correcao aprovada do "Plantavel". A SPEC verificou que o UNICO assert existente que muda e `tests/e2e/item.spec.ts:259` (contagem de `.item-obtain .ob-row` da Occa, 4 -> 5, pela divisao do Plantavel); `tests/unit/ui-screens/item-screen.test.tsx` nao e afetado (a fixture nao tem dado de baga), entao ajusta-lo nao e necessario. Nenhum outro assert pode ser afrouxado.

### 4.8 Exemplos trabalhados (regras)

- **Exemplo A (mecanica, RF-05/06):** Cheri ao lado de Oran. A cada colheita da Cheri, ha 12,5% de uma das frutas dela virar Lum; com Surprise Mulch, 50%. Colher a Oran ao lado da Cheri tambem pode gerar Lum (o par e o mesmo).
- **Exemplo B (par simples, RF-02):** Figy: "Cheri + Persim". Aparece um unico par, embora os arquivos tragam o par nos dois lados.
- **Exemplo C (parceiro fixo + lista, RF-02/08):** Lum: "Oran + (Aspear, Cheri, Chesto, Pecha, Rawst)"; Enigma: "Hopo + (18 bagas)". Todos os pares acessiveis em 360 px.
- **Exemplo D (caminho inverso, RF-19):** Na Cheri: "Usada em cruzamento: + Oran = Lum, + Persim = Figy". A lista real e derivada dos arquivos.
- **Exemplo E (cadeia, RF-04):** Starf Berry: "Pomeg + (Grepa, Hondew, Kelpsy, Qualot, Tamato)"; clicar Pomeg abre a pagina dela com "Haban + Sitrus"; clicar Sitrus abre "Lum + (...)"; clicar Lum abre "Oran + (...)".
- **Exemplo F (origem, RF-14/25):** Occa: tag "Mundo", "Encontrada no mundo: biomas X" e "Cresce melhor em: biomas X". Sitrus: tag "Mutacao", sem "Encontrada no mundo", com "Cresce melhor em" e "Como cruzar". Oran: tag "Mundo", "Encontrada no mundo: qualquer bioma". Liechi: tags "Mutacao" e "Mundo", "Encontrada no mundo: Mirage Ilha" e "Como cruzar: Kelpsy + Pamtre". Eggant: tag "Mutacao", "Como cruzar: Leppa + (Aguav, Figy, Iapapa, Wiki, Mago)", sem outra fonte.

(Os pares e biomas desta secao ilustram a regra com dados atuais da pesquisa; a SPEC e os testes derivam a lista dos arquivos do pack.)

## 5. Requisitos nao funcionais

- **RNF-01 (Tamanho do dataset)** `[MUST]` Publicar so o necessario (ids de par e classificacao; o nome vem do `items[id]` ja carregado). Meta: `items.json` (hoje 1.499.586 bytes) cresce no maximo 15% (mesmo teto do spawn-bait); cada par publicado uma unica vez (A+B = B+A). Nota da SPEC: o assert existente `tests/unit/dataset/join.test.ts:322` (`items.json` <= 1.659.908 bytes) e o teto efetivo, mais estrito que os 15%. [ASSUMPTION: a IDEA deixou o teto para a SPEC; 15% e o precedente do projeto e forca publicar so o necessario, ajustavel pela SPEC.]
- **RNF-02 (i18n)** `[MUST]` Todo texto novo em PT e EN no dicionario central; nomes de bagas localizados; sem literal no JSX.
- **RNF-03 (Acessibilidade)** `[MUST]` Parceiros e resultados sao links/botoes navegaveis por teclado (mesmo componente `ItemLink`); tag de origem legivel com contraste nos 4 temas (verificacao por tema e nova, definida pela SPEC/testes) e nao depende so de cor (tem texto); controle do filtro acessivel por teclado com rotulo.
- **RNF-04 (Responsividade)** `[MUST]` Pagina do item e listagem sem sobreposicao nem vazamento horizontal em 360, 390 e 1280 px, PT e EN (medidos nos testes existentes de nao sobreposicao, que nao variam tema); a verificacao nos 4 temas e nova e definida pela SPEC/testes.
- **RNF-05 (Offline / PWA)** `[MUST]` Comportamento offline inalterado: nenhuma chamada de rede nova, nenhuma midia nova (texturas ja existentes), precache continua so com app + boot do dataset.
- **RNF-06 (Sem regressao de testes)** `[MUST]` Vitest e e2e existentes permanecem verdes (excecao unica: asserts diretamente afetados pelo "Plantavel", RF-47); rodar a suite completa uma vez ANTES de implementar para separar flake preexistente de regressao (LESSONS); corrigir flake pela causa, nunca afrouxando assert.
- **RNF-07 (Qualidade estatica)** `[MUST]` `typecheck` e `lint` (incluindo `no-literal-jsx-text`) limpos.
- **RNF-08 (Cobertura)** `[MUST]` Codigo novo respeita os limites de cobertura v8 do projeto (global 80/80, `tools/dataset/src/**` 80/80, `src/screens/**` 70/70, `src/domain/**` 95/95).
- **RNF-09 (Determinismo)** `[MUST]` Pipeline deterministico: duas execucoes no mesmo snapshot geram arquivos identicos e a mesma `datasetVersion`; `items.json` identico entre a instancia real e o snapshot.
- **RNF-10 (Performance)** `[MUST]` Tag de origem e filtro nao degradam a listagem: o custo por card nao cresce de forma relevante e nao ha novo download. [ASSUMPTION: sem meta numerica na IDEA; requisito qualitativo (todos os cards ficam no DOM); a SPEC pode fixar meta medivel.]
- **RNF-11 (Seguranca)** `[MUST]` Nenhum segredo, credencial ou valor de variavel de ambiente em artefatos versionados.
- **RNF-12 (Custo/privacidade)** `[MUST]` Sem novo servico, chamada de rede ou coleta; tudo sai do dataset empacotado.
- **RNF-13 (Fonte da mecanica)** `[MUST]` O texto da mecanica (12,5%, x4 Surprise Mulch, 4 vizinhos ortogonais, sem diagonal) registra na SPEC a fonte (codigo do jogo `BerryBlock.determineMutation` e wiki oficial Berry Tree), pois nao vem de arquivo do pack.

## 6. Criterios de aceite

Formato Dado/Quando/Entao; cada criterio cita os RF/RNF que valida.

**Como cruzar (RF-01 a RF-12)**
- **CA-01** Dado a pagina da Lum; quando abro; entao vejo "Como cruzar" com o par Oran + cada uma de Aspear, Cheri, Chesto, Pecha, Rawst (lista derivada dos arquivos), cada parceiro clicavel, e a mecanica com "12,5%" e "50% com Surprise Mulch". (RF-01, 02, 03, 05, 06, 07)
- **CA-02** Dado a pagina da Figy; quando abro; entao o par Cheri + Persim aparece uma unica vez. (RF-02)
- **CA-03** Dado o par Oran+Cheri; quando conto nas paginas; entao aparece uma vez em Lum (Como cruzar) e uma vez em Oran e em Cheri (Usada em cruzamento), sem duplicata de par dentro de cada pagina. (RF-02, 20)
- **CA-04** Dado a pagina da Starf; quando clico Pomeg, depois Sitrus, depois Lum, depois Oran; entao cada clique abre a pagina do parceiro com o proprio bloco (Oran mostra "Onde encontrar"), e Voltar retorna passo a passo. (RF-03, 04)
- **CA-05** Dado a pagina da Enigma a 360 e 390 px; quando abro o bloco; entao os 18 parceiros de Hopo estao acessiveis, sem vazar nem sobrepor. (RF-08, RNF-04)
- **CA-06** Dado a pagina da Liechi; quando abro; entao aparece "Como cruzar: Kelpsy + Pamtre" E "Encontrada no mundo" com o bioma Mirage. (RF-09, 15)
- **CA-07** Dado a pagina da Eggant; quando abro; entao aparece "Como cruzar: Leppa + (Aguav, Figy, Iapapa, Wiki, Mago)" e nenhuma outra fonte nova alem do que ja existia. (RF-10)
- **CA-08** Dado uma baga que nao e resultado de nenhum par (ex. Cheri) e um item nao-baga (apricorn, mint); quando abro; entao nao ha bloco "Como cruzar" nem bloco vazio. (RF-11)
- **CA-09** Dado a pagina em PT e em EN; quando percorro "Como cruzar"; entao mecanica, chance ("12,5%"/"12.5%") e nomes de baga estao localizados. (RF-06, 12, 40, 41)
- **CA-10** Dado a regra "baga que aparece como valor em `mutations`"; quando derivo dos arquivos do pack no teste; entao o conjunto de bagas com o bloco na UI e exatamente esse conjunto (hoje 40). (RF-01, 34)

**Correcao do Plantavel (RF-13 a RF-18)**
- **CA-11** Dado a pagina da Occa (baga de mundo); quando abro; entao vejo "Encontrada no mundo: biomas X" e "Cresce melhor em: biomas X" no lugar da linha unica "Plantavel". (RF-13, 14, 16)
- **CA-12** Dado a pagina da Sitrus (so cruzamento); quando abro; entao NAO ha "Encontrada no mundo" e HA "Cresce melhor em: biomas X". (RF-14, 16)
- **CA-13** Dado a pagina da Oran e da Persim; quando abro; entao "Encontrada no mundo" diz qualquer bioma, sem lista de biomas. (RF-15)
- **CA-14** Dado a pagina da Liechi; quando abro; entao "Encontrada no mundo" mostra Mirage Ilha (EN Mirage Island), sem aviso extra. (RF-15)
- **CA-15** Dado as 70 bagas do dataset; quando conto; entao "Encontrada no mundo" aparece exatamente nas com `spawnConditions` nao vazio (hoje 31) e "Cresce melhor em" nas 70. (RF-14, 16, 34)
- **CA-16** Dado a pagina de um apricorn e de um mint; quando abro; entao a linha "Plantavel" e identica a de antes (texto, posicao, `data-row`). (RF-17, 42)

**Usada em cruzamento (RF-19 a RF-24)**
- **CA-17** Dado a pagina da Cheri; quando abro; entao "Usada em cruzamento" lista "+ Oran = Lum" e "+ Persim = Figy" (derivados dos arquivos), com parceiro e resultado clicaveis e Voltar restaurando a Cheri. (RF-19, 20)
- **CA-18** Dado a pagina da Lum; quando abro; entao aparecem "Como cruzar" e "Usada em cruzamento" juntos, cada um com o proprio titulo. (RF-23)
- **CA-19** Dado uma baga que nao e ingrediente de nenhum par e um item nao-baga; quando abro; entao nao ha "Usada em cruzamento". (RF-21)
- **CA-20** Dado a pagina de uma baga com muitos cruzamentos a 360 px; quando abro; entao todos os cruzamentos estao acessiveis, sem vazar. (RF-22, RNF-04)

**Listagem: tag e filtro (RF-25 a RF-33)**
- **CA-21** Dado a listagem, aba Berries; quando vejo os cards; entao Occa mostra "Mundo", Sitrus mostra "Mutacao" e Liechi mostra as duas; nas 70 bagas a tag bate com as regras derivadas dos arquivos. (RF-25, 26)
- **CA-22** Dado qualquer card de baga em qualquer aba (Berries, Iscas), na visao geral ou em resultado de busca; quando o vejo; entao a tag de origem aparece. (RF-28)
- **CA-23** Dado um card de apricorn, mint ou isca nao-baga; quando o vejo; entao nao ha tag de origem. (RF-29)
- **CA-24** Dado um card de baga; quando meco no navegador; entao `.item-tag` mantem texto ("Berries") e fica acima do nome como hoje, e a tag de origem e outro elemento com classe propria. (RF-27, 43)
- **CA-25** Dado o filtro "Mutacao" ativo; quando vejo a listagem em qualquer aba, na visao geral ou em um resultado de busca; entao so aparecem bagas com origem Mutacao (hoje 39 + Liechi) e nenhum item que nao seja baga; com "Mundo", so as de mundo (hoje 30 + Liechi); a Liechi aparece nos dois; sem filtro ativo a listagem e identica a de hoje. (RF-30, 31)
- **CA-26** Dado nenhum filtro de origem ativo; quando uso abas, busca por nome PT/EN e ordenacao; entao o resultado e identico ao de antes. (RF-31, 43)
- **CA-27** Dado filtro de origem ativo e busca sem resultado; quando vejo a lista; entao o estado vazio aparece sem erro. (RF-33)
- **CA-28** Dado o filtro ativo e a abertura de um item; quando uso Voltar; entao o filtro e restaurado junto com aba e busca. (RF-32)
- **CA-29** Dado a listagem em 360, 390 e 1280 px, PT e EN, com nomes longos e a Liechi (duas tags); quando meco os cards; entao nao ha sobreposicao. (RF-44, RNF-04)

**Pipeline e dataset (RF-34 a RF-39)**
- **CA-30** Dado o pipeline rodado; quando leio o dataset; entao pares e classificacao batem com a derivacao independente dos arquivos `berries/*.json` (teste deriva do pack, nunca de lista a mao), incluindo as tres variantes de `spawnConditions`. (RF-34)
- **CA-31** Dado o dataset publicado; quando comparo os campos existentes das 70 bagas e dos demais itens com os do dataset anterior; entao nenhum foi perdido ou alterado (so acrescimos). (RF-35)
- **CA-32** Dado `current.json`; quando o leio; entao `datasetVersion` e novo e diferente de `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512`. (RF-36)
- **CA-33** Dado o pipeline rodado na instancia real e no `data-source/`; quando comparo `items.json`; entao identicos byte a byte, e duas execucoes geram a mesma `datasetVersion`. (RF-37, RNF-09)
- **CA-34** Dado a auditoria `tools/dataset/audit/`; quando rodo; entao 0 divergencias. (RF-38)
- **CA-35** Dado `published-schemas.test.ts` contra os arquivos reais; quando roda; entao passa e nenhum campo novo e descartado. (RF-39)
- **CA-36** Dado `items.json` novo; quando comparo o tamanho com 1.499.586 bytes; entao cresce no maximo 15%. (RNF-01)
- **CA-37 (criterio de PROCESSO, nao de produto)** Dado o plano da SPEC; quando reviso a ordem; entao o frontend so comeca depois da republicacao do dataset e os testes de contrato/join ficam excluidos so ate ela. (RF-36)

**Nao-regressao, i18n e nao funcionais**
- **CA-38** Dado uma pagina de item existente (ex. Occa, fire_stone, um item com isca); quando comparo antes e depois; entao todas as linhas existentes, exceto o "Plantavel" das bagas, estao identicas em conteudo, ordem e `data-row`. (RF-42)
- **CA-39** Dado a suite completa; quando rodo vitest, e2e, typecheck, lint e cobertura; entao tudo verde, com ajuste somente em `tests/e2e/item.spec.ts:259` (contagem de `.item-obtain .ob-row` da Occa, 4 -> 5; verificado pela SPEC como o unico assert existente que muda; `item-screen.test.tsx` nao e afetado), e nenhum outro assert afrouxado. (RF-47, RNF-06, 07, 08)
- **CA-40** Dado o app em PT e EN; quando percorro pagina de baga e listagem; entao nenhum texto novo esta sem traducao nem literal no JSX (lint verde). (RF-40, RNF-02)
- **CA-41** Dado o app offline apos a primeira carga; quando abro a pagina de uma baga e a listagem; entao tudo funciona, sem chamada de rede nova. (RF-45, RNF-05)
- **CA-42** Dado a navegacao por teclado e os 4 temas; quando percorro links de parceiros, tag e filtro; entao todos sao alcancaveis, com foco visivel e contraste legivel. (RNF-03)
- **CA-43** Dado um id de parceiro fora do `items.json`; quando renderizo o bloco; entao aparece como texto simples, sem quebrar a pagina. (RF-46)
- **CA-44** Dado o render da listagem; quando comparo antes e depois; entao o custo por card nao cresce de forma relevante e nao ha download novo. (RNF-10)

## Perguntas em aberto

Nenhuma para o usuario. As decisoes tecnicas abaixo a IDEA deferiu explicitamente a SPEC e NAO sao perguntas ao Pontin: forma do contrato (novo `kind` de obtain vs campo novo no `ItemInfo`), onde vive a classificacao mundo/mutacao (dataset vs derivada no app), dedupe dos pares (mapas `mutations` simetricos), teto final de crescimento do `items.json` (RNF-01 propoe 15%), apresentacao de lista longa (Enigma com 18 parceiros) no padrao visual existente, local de render do "Usada em cruzamento" (`UsedIn` vs linha nova) e forma do controle de filtro.

Suposicoes marcadas `[ASSUMPTION]`:
1. RF-18: linha "Plantavel" com bioma vazio mantem "Pode ser plantado" (nenhuma baga real cai no caso).
2. RF-26: numeros 30/39/1 de origem sao consequencia das regras, derivados dos arquivos na SPEC.
3. RF-32: filtro de origem restaurado no Voltar, como aba e busca.
4. RNF-01: teto de +15% no `items.json`, precedente do spawn-bait.
5. RNF-10: requisito qualitativo de performance da listagem, sem meta numerica.
