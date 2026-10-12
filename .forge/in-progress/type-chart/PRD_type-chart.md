---
feature: type-chart
language: pt-BR
status: ready-for-review
---

# PRD - type-chart (pagina "Tipos": a hierarquia dos tipos, didatica e legivel de relance)

## Revision History

| Data | Revisao | O que mudou |
|---|---|---|
| 2026-10-12 | 5 | Passe 2 do review (0 BLOCKER, 1 WARNING, 3 NIT): a legenda ganha duas frases de cor, uma para as faixas e outra para a matriz (quem ataca tem a vantagem), nas duas visoes (RF-21, CA-18); CA-47 em subtitulo proprio "Cor por ponto de vista"; RNF-03 sem frase duplicada; nota de baseline: so commits em `.forge/` desde o HEAD. |
| 2026-10-12 | 5.1 | NITs da passada 3 do forge-review (PASS), aplicados pelo orquestrador: repeticao removida em RF-21, plural "frases de cor", frase da tabela completa com laranja e cinza (RF-21, CA-18). |
| 2026-10-12 | 5.2 | Cascata do review da SPEC (2 WARNING, 2 NIT): CA-50 pede o subtitulo so na folha "Mais" (a barra lateral nao renderiza subtitulo de nenhum item e a RF-08 proibe muda-la); RF-37 deixa explicito que os dois icones do heroi aparecem so na aba Defendendo (a aba Atacando ignora o 2o tipo); acento de "não afeta" na frase da tabela (RF-21, CA-18). Aplicado pelo orquestrador. |
| 2026-10-12 | 4 | Revisao do forge-review (0 BLOCKER, 3 WARNING, 5 NIT): legenda sem cor nas linhas de multiplicador, so frase unica de cor (RF-21, CA-18); RF-19 por visao; acessibilidade inclui seletor de visao e 36 cabecalhos (RNF-03, CA-34, CA-35); UISPEC no baseline; RF-37 deixa claro que o 2o tipo so afeta Defendendo e o heroi; RF-07 "a partir de outra tela"; RF-11 e RF-13 sem tamanhos (HOW); RF-45 movido antes de RF-46 a RF-49 e CA-47 a CA-50 depois de CA-46, sem renumerar (a secao 4.9 passou a se chamar "Testes e requisitos complementares" e agora abriga RF-45 a RF-49, RF-46 incluido; os ids nao mudaram). |
| 2026-10-12 | 3 | Respostas do orquestrador (sob delegacao do Pontin): as 6 perguntas em aberto viram decisoes e as 5 `[ASSUMPTION]` sao aceitas como decididas. Novos: seletor de visao "Por tipo" / "Tabela completa" (RF-47), cabecalhos da matriz clicaveis (RF-48), bloco "heroi" com a frase (RF-13, RF-22), 2o tipo como `select` nativo so em "Defendendo" (RF-37, RF-38), subtitulo `nav.typesSub` (RF-49); RF-11, RF-12, RF-19, RF-28, RF-34 e CA relacionados revisados. |
| 2026-10-12 | 2 | Decisao IDEA 15:25: a cor codifica vantagem do ponto de vista da visao (verde/laranja/cinza), nao o multiplicador fixo; paleta reusada da calculadora da ficha. Revisados RF-17, RF-21, RF-27, CA-15, CA-24 e novos RF-46, CA-47; baseline recomputado. |
| 2026-10-12 | 1 | Criacao do PRD a partir da IDEA (9ff24568d3b1, com a decisao 15:25; fingerprint atual 1d1a4121ebb8) e do CONTEXT (5cbb8e52f5ef). Inclui as 18 frases de intuicao (PT/EN) conferidas contra `TYPE_CHART`, os textos de legenda e de grupo, e exemplos trabalhados conferidos. MoSCoW da IDEA secao 10: defesa com 2 tipos = `[COULD]`; seletor por geracao = `[WON'T]`. |

## Baseline (drift anchor)

- `HEAD`: `04b739884fe2bc95c7fe47c310b0b2b0792b6b3f` (branch `feature/type-chart`; codigo identico a main `cee51235`; a nota abaixo trata dos commits posteriores)
- Nota: depois do HEAD `04b73988` entraram so commits em `.forge/` (IDEA, UISPEC, STATE, PRD); `git diff 04b73988..HEAD` em `src`, `tests`, `tools`, `public`, `package.json` e `vite.config.ts` esta vazio, entao a baseline de codigo continua valida.
- `IDEA_type-chart.md` (`git hash-object`): `1d1a4121ebb8d443ea1f898bba8b7f466210fadf`
- `UISPEC_type-chart.md` (`git hash-object`): `c5127ca91db4daae03593dfe552feb9cf64d8001` (RF-17 e RF-37 espelham a sua secao 3.2b)
- `CONTEXT_type-chart.md` (`git hash-object`): `5cbb8e52f5ef5531d0381f029764d3191572efe3`

## 1. Objetivo e visao

**Problema.** Quem esta aprendendo Pokemon do zero (o Pontin, jogando FireRed) nao tem onde VER, de forma clara, quem bate em quem. A calculadora de tipos da ficha responde "este Pokemon contra tal ataque", mas nao ensina a tabela. A pagina nova serve para APRENDER a tabela, nao so consulta-la.

**Para quem.** O jogador do Pontindex (persona unica, secao 2), no desktop ou no celular, em PT ou EN.

**Por que agora.** Pedido direto do Pontin em 2026-10-12: "Quero adicionar uma nova pagina que mostre visualmente a 'hierarquia' dos tipos dos pokemons. qual e mais forte contra qual e tal."; "tem q ser algo didatico"; "algo que so de bater o olho a pessoa ja sabe direitinho"; e, sobre os dois projetos, "quero q essa pagina exista nos dois projetos. pode ser a exata mesma pagina". As demais decisoes foram delegadas ao orquestrador ("faz do jeito q achar q vai ficar melhor").

**Impacto esperado.** O jogador abre "Tipos", toca em Fogo e, em ate 10 segundos, entende contra quem Fogo e forte, contra quem apanha e por que, sem ler paragrafos: a cor da faixa diz o resultado e os icones dizem quem. A mesma pagina (mesmo comportamento, mesmos textos) existe depois no `pontindex`.

**Metrica de sucesso (verificavel).**
- Para cada um dos 18 tipos, os 6 grupos da visao por tipo (3 atacando, 3 defendendo) listam EXATAMENTE os tipos derivados de `TYPE_CHART`, sem lista escrita a mao (teste deriva do dado).
- A matriz mostra, nas 324 celulas (18 x 18), o simbolo e a cor corretos para o multiplicador de `TYPE_CHART`.
- As 18 frases de intuicao existem em PT e EN e cada relacao que citam existe em `TYPE_CHART` (RF-23, verificada).
- 0 informacao transmitida so por cor, em todos os 7 temas (incluindo `black`).
- Nenhum teste existente regride, salvo os asserts diretamente afetados pelo item novo na navegacao e os 14 baselines de `responsive.spec.ts`, atualizados (RF-09, RF-10).

## 2. Publico-alvo (personas)

- **Jogador do Pontindex (Pontin e amigos)**: usa o app no desktop (barra lateral) ou no celular (PWA), em PT ou EN; pode nunca ter jogado Pokemon (o Pontin comeca agora). Quer ver a tabela de tipos de forma visual e entender o porque, sem decorar tabelas de texto.

Papeis e permissoes: N/A (app local, usuario unico, sem login). Ciclo de vida / round-trip de dados: N/A (nenhuma entidade persistida; o estado da tela e efemero, RF-34 a RF-36).

## 3. Escopo

**Dentro do escopo**
- Pagina nova "Tipos" / "Types", com duas visoes na mesma pagina: **visao por tipo** (principal, didatica) e **tabela completa** (matriz 18 x 18).
- Legenda didatica fixa e uma frase de intuicao por tipo (PT e EN).
- Item "Tipos" na navegacao (barra lateral no desktop, folha "Mais" no celular), registro da tela, icone de navegacao.
- i18n PT/EN de todo texto novo; nomes de tipo pelo idioma da interface.
- Estado da tela (tipo selecionado, aba, 2o tipo) na pilha de navegacao.
- Testes unitarios e e2e no padrao do projeto; atualizacao dos testes existentes afetados.
- `[COULD]` Defesa com 2 tipos (x4 / x1/4).

**Fora do escopo (NAO tocar)**
- `src/domain/type-chart.ts` (a fonte unica do dado) e `src/screens/Detail/TypeCalculator.tsx` (calculadora da ficha): intocados. A calculadora continua identica.
- Seletor por geracao (ex. FireRed sem Fairy, Aco resistindo a Fantasma e Sombrio): `[WON'T]` nesta feature; fica para a fatia "jogos em profundidade" do `pontindex`.
- Diagrama de setas entre tipos (18 tipos, mais de 100 relacoes: ilegivel). Alternativa rejeitada.
- Golpes, dados por jogo, habilidades que alteram multiplicadores.
- Qualquer biblioteca de grafico ou dependencia nova.
- Qualquer mudanca na `pontindex-base` enquanto estiver em andamento; neste repo, nenhuma mudanca em telas existentes alem do item novo na navegacao e do registro da tela.
- O porte para o `pontindex` e uma feature propria, depois que a `pontindex-base` fechar; este PRD so garante que o porte seja uma copia de arquivos (RF-31 a RF-33).

### Restricoes de implementacao e processo

Nao sao requisitos de produto, mas obrigam a SPEC e o plano:
- Fonte unica de verdade = `TYPE_CHART` / `singleMultiplier` / `effectivenessAgainst` de `src/domain/type-chart.ts`; a pagina deriva tudo dele (nao duplica a tabela).
- Lint do projeto: `pontindex/no-literal-jsx-text` (texto literal em JSX so em `src/i18n/`; simbolos como constantes de string) e proibicao do travessao U+2014 em literais.
- Rodar a suite completa (vitest + Playwright) e o build na main ANTES de implementar, para separar flake preexistente de regressao; corrigir flake pela causa, nunca afrouxando assert (LESSONS 2026-09-29).
- Todo exemplo trabalhado e toda frase de intuicao que cita tipos concretos ficam conferidos contra `TYPE_CHART` (LESSONS 2026-10-12); os testes derivam o esperado do dado, nunca da frase.
- A pagina e compativel com `tests/harness/no-overlap.ts` desde o desenho (LESSONS 2026-10-12): nada de texto ou selo sobreposto a `img`/`.chip`/controle; a UISPEC le o harness.

## 4. Requisitos funcionais

Prioridade (MoSCoW da IDEA secao 10): `[MUST]` para visao por tipo com abas, tabela completa, legenda, frases de intuicao, item na barra, i18n e testes; `[COULD]` para defesa com 2 tipos; `[WON'T]` para seletor por geracao. A forma visual exata (tamanhos, espacamentos, posicionamento) e definida na UISPEC; o PRD fixa o comportamento observavel e os textos.

Convencoes: "tipo" = um dos 18 `TYPE_IDS`; "multiplicador" = `singleMultiplier(atacante, defensor)`; simbolos de texto `x2`, `x1/2`, `x0` (e, no `[COULD]`, `x4` e `x1/4`); nas celulas da matriz o simbolo e curto: `2`, `1/2`, `0`. Testes (RF-45) estao em 4.9.

### 4.1 Navegacao e entrada

- **RF-01** `[MUST]` O sistema deve oferecer um item de navegacao "Tipos" (PT) / "Types" (EN) que abre a pagina nova (ScreenId `types`).
- **RF-02** `[MUST]` No desktop, o item deve aparecer na barra lateral imediatamente depois de "Comparar" e antes de "Treinadores" (5a posicao; os 9 itens atuais passam a 10).
- **RF-03** `[MUST]` No celular (largura < 900 px, definicao do app), o item NAO deve ocupar vaga fixa da barra inferior (que continua com Inicio, Pokedex, Capturados, Comparar e Mais); deve aparecer na folha "Mais", como primeiro item da lista de itens de navegacao.
- **RF-04** `[MUST]` O item deve ter um icone de navegacao proprio, distinto dos dos outros itens: `Shapes` da lib de icones do app, ou `Layers` se `Shapes` nao estiver disponivel (ambos existem na versao instalada).
- **RF-05** `[MUST]` Quando a pagina esta ativa, o item "Tipos" deve aparecer destacado na barra lateral e, no celular, o botao "Mais" deve aparecer destacado (como acontece com os demais itens da folha).
- **RF-06** `[MUST]` A pagina deve entrar na pilha de navegacao e no historico como as demais telas: o botao Voltar do navegador e a navegacao interna funcionam como hoje, sem rota por URL nova.
- **RF-07** `[MUST]` Ao abrir "Tipos" a partir de outra tela (pelo item de navegacao), a pagina deve mostrar a pagina sem tipo selecionado (estado inicial, RF-34).
- **RF-08** `[MUST]` O sistema deve manter inalterados, no desktop e no celular, os demais itens de navegacao, sua ordem relativa e seu comportamento.
- **RF-09** `[MUST]` Os testes existentes afetados pelo item novo devem ser ATUALIZADOS, nao enfraquecidos: a lista de rotulos da barra lateral em PT (9 para 10 itens), a lista de rotulos da folha "Mais" (ganha "Tipos" no inicio), a paridade entre o registro de telas e `SCREEN_IDS`, e as listas equivalentes no e2e do shell (desktop e folha "Mais" mobile). Cada assert continua verificando a ordem e o conteudo completos; nenhuma contagem e removida ou relaxada.
- **RF-10** `[MUST]` Os 14 snapshots de `responsive.spec.ts` (Inicio e ficha do Charizard, nos 7 temas, 1280 x 800, com a barra lateral visivel) mudam porque a barra ganha o 10o item: devem ser regenerados e revisados visualmente (nao aceitos as cegas), sem aumentar a tolerancia `maxDiffPixelRatio` existente.

### 4.2 Visao por tipo (principal)

- **RF-11** `[MUST]` A pagina deve oferecer a visao por tipo como visao padrao, com uma grade dos 18 tipos como botoes selecionaveis, cada um mostrando o icone do tipo (cor do tipo) e o nome curto do tipo no idioma da interface. A grade fica no topo da visao e continua visivel depois da escolha, compacta (cabe sem rolagem vertical excessiva no celular), com os botoes quebrando em linhas; o botao do tipo selecionado tem um anel de selecao.
- **RF-12** `[MUST]` Escolher um tipo deve marca-lo como selecionado (estado visivel e exposto a tecnologia assistiva) e mostrar o resultado sem sair da pagina e sem criar nova entrada de historico. Escolher outro tipo troca a selecao. Tocar no tipo ja selecionado nao faz nada (continua selecionado); nao ha "desmarcar": depois da primeira escolha ha sempre um tipo selecionado, e o estado vazio so existe na abertura (RF-34). (Decisao do orquestrador, 2026-10-12.)
- **RF-13** `[MUST]` Com um tipo selecionado, logo abaixo da grade deve aparecer um bloco "heroi" com o tipo grande (icone grande, claramente maior que os chips da grade, cor do tipo e nome) e a frase de intuicao (RF-22), de modo que o jogador saiba de relance qual tipo esta vendo; abaixo dele vem o controle Atacando/Defendendo e as faixas coloridas.
- **RF-14** `[MUST]` A visao por tipo deve ter duas abas, "Atacando" e "Defendendo" (EN: "Attacking" e "Defending"), com "Atacando" como aba padrao. Apenas uma aba e mostrada por vez; trocar de aba mantem o tipo selecionado.
- **RF-15** `[MUST]` Cada aba deve mostrar exatamente 3 grupos, sempre os 3 (nunca omitidos), na ordem abaixo, com estes titulos exatos:

  | Aba | Ordem | Titulo PT | Titulo EN | Multiplicador do grupo |
  |---|---|---|---|---|
  | Atacando | 1 | Forte contra (x2) | Strong against (x2) | x2 |
  | Atacando | 2 | Pouco efetivo contra (x1/2) | Not very effective against (x1/2) | x1/2 |
  | Atacando | 3 | Não afeta (x0) | No effect on (x0) | x0 |
  | Defendendo | 1 | Fraco contra (recebe x2) | Weak to (takes x2) | x2 |
  | Defendendo | 2 | Resiste a (recebe x1/2) | Resists (takes x1/2) | x1/2 |
  | Defendendo | 3 | Imune a (x0) | Immune to (x0) | x0 |

- **RF-16** `[MUST]` Na aba "Atacando" de um tipo X, cada grupo deve conter os tipos DEFENSORES em que `TYPE_CHART[X]` tem o multiplicador do grupo (lista `2`, `0.5` ou `0`). Na aba "Defendendo" de X, cada grupo deve conter os tipos ATACANTES A tais que `singleMultiplier(A, X)` e o multiplicador do grupo. Tipos com multiplicador x1 nunca aparecem em grupo algum.
- **RF-17** `[MUST]` Cada grupo deve ser uma faixa cheia de icones dos tipos (icone grande, com o nome curto do tipo embaixo), sem frases a ler alem do titulo do grupo. A COR da faixa codifica VANTAGEM do ponto de vista da aba, nao o multiplicador fixo (decisao IDEA 15:25): verde = vantagem para o tipo escolhido, laranja = desvantagem, cinza = nao afeta (x0). Aba Atacando: "Forte contra (x2)" verde, "Pouco efetivo contra (x1/2)" laranja, "Não afeta (x0)" cinza. Aba Defendendo: "Fraco contra (recebe x2)" laranja, "Resiste a (recebe x1/2)" verde, "Imune a (x0)" cinza. A cor vem sempre acompanhada do simbolo (x2, x1/2, x0) no titulo do grupo. Paleta: a mesma da calculadora da ficha, sem cor nova (verde = fundo `#E1F5E7` / texto `#1B6B3A`, os valores de `.mult-half`; laranja = `#FFE9D6` / `#9A4A00`, os de `.mult-2`; cinza = os de `.mult-0`), com os valores copiados para o CSS proprio da pagina e nunca importados de `detail.css` (RF-31). Regra de leitura em 1 olhada: cor da faixa = vantagem ou desvantagem, icones = quem.
- **RF-18** `[MUST]` Um grupo sem nenhum tipo deve continuar visivel, com o titulo e o texto "nenhum" (PT) / "none" (EN) no lugar dos icones; nunca some.
- **RF-19** `[MUST]` Sem nenhum tipo selecionado (so na abertura): na visao "Por tipo", a pagina mostra a grade dos 18 tipos e a instrucao "Escolha um tipo" / "Pick a type", e o bloco heroi, o controle Atacando/Defendendo e as faixas ficam ocultos; na visao "Tabela completa", nenhuma linha nem coluna fica destacada. (So uma visao e visivel por vez, RF-47.)
- **RF-20** `[MUST]` Os nomes de tipo (nos botoes, no tipo grande, nas faixas, nos cabecalhos acessiveis) devem seguir o idioma da interface; trocar o idioma com um tipo selecionado troca os nomes, os titulos e as frases e mantem a selecao.

### 4.3 Legenda didatica e frases de intuicao

- **RF-21** `[MUST]` A pagina deve mostrar, no topo e sempre visivel (nao dentro de uma aba), uma legenda em palavras, com estes textos exatos:

  | Simbolo | Texto PT | Texto EN | Prioridade |
  |---|---|---|---|
  | x2 | x2 = causa o dobro de dano | x2 = deals double damage | `[MUST]` |
  | x1/2 | x1/2 = causa metade do dano | x1/2 = deals half damage | `[MUST]` |
  | x0 | x0 = não afeta | x0 = has no effect | `[MUST]` |
  | x4 | x4 = causa o quádruplo de dano | x4 = deals quadruple damage | `[COULD]` (so com a defesa com 2 tipos, RF-37) |
  | x1/4 | x1/4 = causa um quarto do dano | x1/4 = deals a quarter of the damage | `[COULD]` (idem) |

  As linhas de multiplicador da legenda (x2, x1/2, x0 e, no `[COULD]`, x4 e x1/4) levam SOMENTE simbolo + palavras, SEM cor, porque a cor depende do ponto de vista (aba Atacando, aba Defendendo, matriz). A legenda inclui tambem duas frases sobre a cor, com estes textos exatos. A primeira vale para a visao "Por tipo": PT "Nas faixas: verde = vantagem para o tipo escolhido, laranja = desvantagem, cinza = não afeta"; EN "In the bands: green = advantage for the chosen type, orange = disadvantage, gray = no effect". Para a matriz, uma segunda frase diz quem tem a vantagem (as celulas sao lidas do ponto de vista de quem ataca, a linha; ex. com Fogo selecionado, a celula Água x Fogo e verde = vantagem para Água): PT "Na tabela: a linha ataca a coluna; verde = vantagem de quem ataca, laranja = desvantagem de quem ataca, cinza = não afeta"; EN "In the table: the row attacks the column; green = advantage for the attacker, orange = disadvantage for the attacker, gray = no effect". As duas frases aparecem na legenda nas duas visoes (a legenda e a mesma em todo lugar). A cor nunca e o unico sinal (RNF-02). A legenda e a mesma para as duas visoes. `[ASSUMPTION: o texto exato da frase de ponto de vista da matriz e das frases de cor e meu; a IDEA fixa o conteudo, nao a redacao]`
- **RF-22** `[MUST]` Com um tipo selecionado, a pagina deve mostrar a frase de intuicao daquele tipo (tabela de RF-23) dentro do bloco heroi, em uma linha curta, visivel nas duas abas, no idioma da interface. Sem tipo selecionado, nenhuma frase e mostrada.
- **RF-23** `[MUST]` As 18 frases sao exatamente as da tabela abaixo (escritas a mao, no maximo 12 palavras cada). Cada frase cita SOMENTE relacoes que existem em `TYPE_CHART` (atacante x2 sobre defensor, ou atacante x0 sobre defensor, conforme a coluna de relacoes).

  **Verificadas.** As 49 relacoes citadas abaixo foram conferidas uma a uma contra `TYPE_CHART` em `src/domain/type-chart.ts` (HEAD `04b73988`) com `node`: todas batem. Notacao da coluna: `A>D=m` significa "tipo atacante A contra defensor D tem multiplicador m".

  | Tipo | PT | EN | Relacoes citadas (verificadas) |
  |---|---|---|---|
  | normal | Normal não acerta Fantasma, e Lutador vence Normal | Normal can't hit Ghost, and Fighting beats Normal | normal>ghost=0; fighting>normal=2 |
  | fire | Fogo queima Planta e Gelo, mas Água apaga Fogo | Fire burns Grass and Ice, but Water puts out Fire | fire>grass=2; fire>ice=2; water>fire=2 |
  | water | Água apaga Fogo, mas Planta bebe Água | Water puts out Fire, but Grass drinks Water | water>fire=2; grass>water=2 |
  | electric | Elétrico vence Água e Voador, mas não afeta Terra | Electric beats Water and Flying, but can't hit Ground | electric>water=2; electric>flying=2; electric>ground=0 |
  | grass | Planta vence Água e Terra, mas Fogo queima Planta | Grass beats Water and Ground, but Fire burns Grass | grass>water=2; grass>ground=2; fire>grass=2 |
  | ice | Gelo congela Dragão, mas Fogo derrete Gelo | Ice freezes Dragon, but Fire melts Ice | ice>dragon=2; fire>ice=2 |
  | fighting | Lutador vence Normal, mas Psíquico vence Lutador | Fighting beats Normal, but Psychic beats Fighting | fighting>normal=2; psychic>fighting=2 |
  | poison | Veneno vence Planta e Fada, mas não afeta Aço | Poison beats Grass and Fairy, but can't hit Steel | poison>grass=2; poison>fairy=2; poison>steel=0 |
  | ground | Terra vence Elétrico e Fogo, mas Água vence Terra | Ground beats Electric and Fire, but Water beats Ground | ground>electric=2; ground>fire=2; water>ground=2 |
  | flying | Voador vence Planta e Inseto, mas Elétrico vence Voador | Flying beats Grass and Bug, but Electric beats Flying | flying>grass=2; flying>bug=2; electric>flying=2 |
  | psychic | Psíquico vence Lutador e Veneno, mas Inseto vence Psíquico | Psychic beats Fighting and Poison, but Bug beats Psychic | psychic>fighting=2; psychic>poison=2; bug>psychic=2 |
  | bug | Inseto vence Planta e Psíquico, mas Fogo vence Inseto | Bug beats Grass and Psychic, but Fire beats Bug | bug>grass=2; bug>psychic=2; fire>bug=2 |
  | rock | Pedra vence Fogo e Voador, mas Água vence Pedra | Rock beats Fire and Flying, but Water beats Rock | rock>fire=2; rock>flying=2; water>rock=2 |
  | ghost | Fantasma vence Psíquico, mas não afeta Normal | Ghost beats Psychic, but can't hit Normal | ghost>psychic=2; ghost>normal=0 |
  | dragon | Dragão vence Dragão, mas Gelo e Fada vencem Dragão | Dragon beats Dragon, but Ice and Fairy beat Dragon | dragon>dragon=2; ice>dragon=2; fairy>dragon=2 |
  | dark | Sombrio vence Psíquico e Fantasma, mas Lutador vence Sombrio | Dark beats Psychic and Ghost, but Fighting beats Dark | dark>psychic=2; dark>ghost=2; fighting>dark=2 |
  | steel | Aço vence Gelo, Pedra e Fada, mas Fogo vence Aço | Steel beats Ice, Rock and Fairy, but Fire beats Steel | steel>ice=2; steel>rock=2; steel>fairy=2; fire>steel=2 |
  | fairy | Fada vence Dragão, mas Veneno vence Fada | Fairy beats Dragon, but Poison beats Fairy | fairy>dragon=2; poison>fairy=2 |

  Total de relacoes citadas: 2+3+2+3+3+2+2+3+3+3+3+3+3+2+3+3+4+2 = 49. Os nomes dos tipos nas frases coincidem com `TYPE_NAMES` (Água, Elétrico, Psíquico, Dragão, Aço, Sombrio etc.). As frases ficam no dicionario i18n (a regra de lint proibe texto literal em JSX).
- **RF-24** `[MUST]` A cada frase de intuicao deve corresponder, nos testes, um registro (dado de teste) das relacoes citadas, conferido contra `TYPE_CHART`; se o dado do dominio mudar, o teste acusa a frase desatualizada. As 18 chaves de frase existem em PT e EN (teste de completude).

### 4.4 Tabela completa (matriz 18 x 18)

- **RF-25** `[MUST]` A pagina deve oferecer a tabela completa: uma matriz com os 18 tipos atacantes nas LINHAS e os 18 tipos defensores nas COLUNAS (324 celulas), na ordem canonica de `TYPE_IDS`.
- **RF-26** `[MUST]` Os cabecalhos de linha e de coluna devem usar o icone do tipo (nao texto) e ter nome acessivel com o nome do tipo no idioma da interface. A matriz tem um rotulo que explica a convencao (linhas = quem ataca, colunas = quem defende), em PT e EN.
- **RF-27** `[MUST]` Cada celula deve ser colorida do ponto de vista de quem ATACA (a linha): x2 verde, x1/2 laranja, x0 cinza (mesma paleta de RF-17), e mostrar um simbolo curto, constante e identico nos dois idiomas: `2` (x2), `1/2` (x1/2), `0` (x0). A celula x1 fica neutra e SEM texto visivel (para nao poluir); seu nome acessivel ainda informa o resultado. Cada celula tem nome acessivel completo (ex. "Fogo contra Planta: x2"), no idioma da interface.
- **RF-28** `[MUST]` Com um tipo selecionado, a linha desse tipo (como atacante) e a coluna desse tipo (como defensor) devem ficar destacadas, de forma visivel sem depender so de cor (ex. contorno/realce de cabecalho); sem tipo selecionado, nada fica destacado. A selecao e a mesma da visao por tipo (um unico estado compartilhado entre as duas visoes, RF-47).
- **RF-29** `[MUST]` No celular (largura < 900 px), a matriz deve rolar na horizontal dentro do proprio container, com a primeira coluna (os atacantes) fixa durante a rolagem; a pagina em si nunca ganha rolagem horizontal nem tem o layout quebrado. A coluna fixa tem fundo opaco para nao deixar as celulas aparecerem por baixo.
- **RF-30** `[MUST]` A matriz e a visao por tipo devem ser consistentes: para o tipo selecionado X, os tipos x2 na linha de X sao exatamente os da faixa "Forte contra (x2)", e os da coluna de X sao exatamente os da aba "Defendendo" (teste cruza as duas derivacoes).

### 4.5 Mesma pagina nos dois projetos (restricao de produto)

- **RF-31** `[MUST]` A pagina deve depender SOMENTE de codigo que existe nos dois apps: `TypeChip`/`TypeIcon`/`typeName`, `domain/type-chart.ts`, `data/types.ts` (`TypeId`), `TYPE_NAMES`, `types.generated.css`, a pilha de navegacao, `SegmentedControl`, `useT`, o reexport de icones, `nav-items` e o registro de telas. Nao deve importar nada de `Detail/TypeCalculator` nem `Detail/WeaknessPanel`, nem usar classes CSS de outra tela (`.mult-*`, `.weak-*`): tem seus proprios rotulos, helper de selecao e estilos.
- **RF-32** `[MUST]` Os nomes de tipo da pagina devem usar SEMPRE o idioma da interface (`uiLanguage`), nunca o toggle de idioma dos termos do Cobblemon (`termsLanguage`/`termsOverrides`/`TermsToggle`/`useTermsLanguage`), que so existe neste app. A pagina nao mostra esse toggle.
- **RF-33** `[MUST]` Em consequencia de RF-31 e RF-32, portar a pagina para o `pontindex` deve exigir somente copiar os arquivos da pagina (pasta, CSS proprio, modulo de mensagens) e repetir as mesmas edicoes de registro (item de navegacao, registro de tela, `ScreenId`, icone, modulo i18n): zero divergencia de comportamento, mesmos textos, mesmas chaves i18n.

### 4.6 Estado da tela (pilha de navegacao)

- **RF-34** `[MUST]` O estado da tela e: visao ativa (inicial: "Por tipo"), tipo selecionado (inicial: nenhum), aba ativa (inicial: "Atacando") e, no `[COULD]`, o 2o tipo da defesa (inicial: nenhum). Ele vive no estado `ui` da entrada da pilha de navegacao da tela, como `calcInputs` da ficha.
- **RF-35** `[MUST]` Comportamento observavel: dentro da pagina, mudar tipo, aba ou 2o tipo nao empilha nova entrada de historico; sair da pagina (outro item da barra ou outra tela) e voltar pelo item de navegacao abre a pagina no estado inicial (estado descartado); voltar com o botao Voltar (navegador ou interno) de uma tela aberta a partir de "Tipos" restaura a pagina exatamente como estava (tipo, aba, 2o tipo e posicao de rolagem).
- **RF-36** `[MUST]` Nenhum estado da pagina e persistido entre sessoes (nem localStorage, nem preferencias): recarregar o app abre a pagina no estado inicial.

### 4.7 Defesa com 2 tipos `[COULD]`

Entra se couber no mesmo sprint sem complicar a tela; se nao entrar, nada nos demais requisitos depende dele.

- **RF-37** `[COULD]` Na aba "Defendendo" (e SOMENTE nela) aparece um `select` nativo compacto para escolher um 2o tipo, com as opcoes "nenhum" / "none" mais os outros 17 tipos; com 2o tipo, o bloco heroi mostra os dois icones SOMENTE enquanto a aba Defendendo esta ativa (o 2o tipo fica guardado ao trocar de aba, mas a aba Atacando mostra so o 1o icone; a aba Atacando e a matriz continuam usando SO o 1o tipo; o 2o tipo afeta apenas as faixas de Defendendo e os icones do heroi) e a aba passa a mostrar o resultado da combinacao dos dois tipos, com o produto dos multiplicadores de `effectivenessAgainst([t1, t2])`, e os grupos passam a ser 5 (cores: x4 usa a paleta de `.mult-4`, x1/4 a de `.mult-quarter`, x2 laranja, x1/2 verde, x0 cinza, copiadas para o CSS da pagina): x4, x2, x1/2, x1/4, x0, cada um sempre visivel (com "nenhum" quando vazio). Titulos dos grupos novos (decisao do orquestrador: seguem o padrao dos existentes): "Muito fraco contra (recebe x4)" / "Very weak to (takes x4)" e "Resiste muito a (recebe x1/4)" / "Strongly resists (takes x1/4)"; os de x2, x1/2 e x0 mantem os titulos de RF-15. A legenda ganha as entradas x4 e x1/4 (RF-21).
- **RF-38** `[COULD]` O 2o tipo nunca e igual ao 1o (mesma regra de `selectedTypes` da calculadora da ficha): o tipo selecionado nao e oferecido no `select` do 2o tipo. Escolher "nenhum" remove o 2o tipo e volta ao resultado de um tipo so. `[ASSUMPTION: se o 1o tipo for trocado para o valor do 2o, o 2o tipo e limpo (caso nao decidido; mantem a regra "nunca igual")]`
- **RF-39** `[COULD]` Exemplos trabalhados (conferidos contra `TYPE_CHART`): Água/Terra contra Planta = x2 * x2 = x4; Água/Voador contra Elétrico = x2 * x2 = x4; Água/Terra contra Elétrico = x2 * x0 = x0; Pedra/Aço contra Normal = x1/2 * x1/2 = x1/4; Planta/Aço contra Fogo = x2 * x2 = x4.

### 4.8 Exemplos trabalhados (conferidos)

Todos conferidos contra `TYPE_CHART` com `node` (HEAD `04b73988`); os testes derivam o esperado do dado, nao destas listas.

- **RF-40** `[MUST]` Fogo. Atacando: forte contra Planta, Gelo, Inseto, Aço; pouco efetivo contra Fogo, Água, Pedra, Dragão; não afeta: nenhum. Defendendo: fraco contra Água, Terra, Pedra; resiste a Fogo, Planta, Gelo, Inseto, Aço, Fada; imune a: nenhum.
- **RF-41** `[MUST]` Normal. Atacando: forte contra: nenhum; pouco efetivo contra Pedra, Aço; não afeta Fantasma. Defendendo: fraco contra Lutador; resiste a: nenhum; imune a Fantasma. (Exercita o grupo vazio de RF-18.)
- **RF-42** `[MUST]` Elétrico. Atacando: forte contra Água, Voador; pouco efetivo contra Elétrico, Planta, Dragão; não afeta Terra. Defendendo: fraco contra Terra; resiste a Elétrico, Voador, Aço; imune a: nenhum.
- **RF-43** `[MUST]` Fantasma. Atacando: forte contra Psíquico, Fantasma; pouco efetivo contra Sombrio; não afeta Normal. Defendendo: fraco contra Fantasma, Sombrio; resiste a Veneno, Inseto; imune a Normal, Lutador.
- **RF-44** `[MUST]` Aço. Atacando: forte contra Gelo, Pedra, Fada; pouco efetivo contra Fogo, Água, Elétrico, Aço; não afeta: nenhum. Defendendo: fraco contra Fogo, Lutador, Terra; resiste a Normal, Planta, Gelo, Voador, Psíquico, Inseto, Pedra, Dragão, Aço, Fada (10 tipos); imune a Veneno.

### 4.9 Testes e requisitos complementares (ids estaveis: RF-45 vem antes de RF-46 a RF-49)

- **RF-45** `[MUST]` O sistema deve ter testes no padrao do projeto: unitarios (derivacao dos grupos e da matriz a partir de `TYPE_CHART`, completude i18n, estado da tela, a tela com Testing Library) e e2e (abrir "Tipos" por clique real no sidebar e na folha "Mais", escolher tipo, trocar de aba, ver a matriz, `expectNoOverlap`, sem erros de console). Os testes derivam o esperado do dominio, nunca das frases ou das listas deste PRD, e cobrem os 18 tipos.
- **RF-46** `[MUST]` Exemplo de cor (Fogo, conferido contra `TYPE_CHART`): aba Atacando, a faixa "Forte contra (x2)" e VERDE com Planta, Gelo, Inseto, Aço, e "Pouco efetivo contra (x1/2)" e LARANJA com Fogo, Água, Pedra, Dragão; aba Defendendo, a faixa "Fraco contra (recebe x2)" e LARANJA com Água, Terra, Pedra, e "Resiste a (recebe x1/2)" e VERDE com Fogo, Planta, Gelo, Inseto, Aço, Fada. Na matriz, com Fogo selecionado, a linha do Fogo tem verde em Planta, Gelo, Inseto, Aço e laranja em Fogo, Água, Pedra, Dragão; na coluna do Fogo, a celula Água x Fogo (a linha Água ataca Fogo) e verde, porque a leitura e sempre do ponto de vista da linha que ataca.

- **RF-47** `[MUST]` No topo da pagina, abaixo da legenda, um controle segmentado (padrao `SegmentedControl` do app) com duas opcoes, "Por tipo" / "By type" (padrao) e "Tabela completa" / "Full chart". Apenas uma visao e visivel por vez. O tipo selecionado e estado COMPARTILHADO entre as duas visoes: escolher na grade e abrir a tabela destaca a linha e a coluna do tipo, e vice-versa. (Decisao do orquestrador: empilhar a matriz abaixo das faixas ficaria longo demais no celular.)
- **RF-48** `[MUST]` Na tabela completa, os cabecalhos de linha e de coluna (icones de tipo) sao clicaveis e operaveis por teclado: ativar um deles seleciona aquele tipo, permanece na tabela completa e destaca a linha E a coluna dele (RF-28). As celulas nao sao clicaveis; cada uma expoe o nome acessivel descrito em RF-27 (ex. "Fogo contra Planta: x2" / "Fire against Grass: x2").
- **RF-49** `[MUST]` O item de navegacao "Tipos" tem subtitulo (`nav.typesSub`): PT "Quem vence quem" / EN "Who beats whom".



## 5. Requisitos nao funcionais

- **RNF-01 (Fonte unica e zero dependencia)** `[MUST]` Nenhuma dependencia nova (npm), nenhuma biblioteca de grafico, nenhuma duplicacao da tabela de tipos: tudo derivado de `src/domain/type-chart.ts`, que fica intocado. Nenhum dado novo, sem rede, sem mudanca de dataset; o precache do service worker nao muda alem do JS/CSS da propria pagina.
- **RNF-02 (Acessibilidade: cor nunca sozinha)** `[MUST]` Toda informacao transmitida por cor tem tambem simbolo ou texto: faixas pelo titulo do grupo e pelo simbolo do multiplicador; celulas da matriz pelo simbolo `2`/`1/2`/`0` e pelo nome acessivel; x1 pelo nome acessivel e pela ausencia de simbolo; tipo selecionado e linha/coluna destacadas por pista nao cromatica; legenda com simbolo + texto + cor.
- **RNF-03 (Acessibilidade: teclado e leitor de tela)** `[MUST]` Tudo e operavel por teclado: o seletor de visao "Por tipo" / "Tabela completa" (RF-47), os 18 botoes de tipo, as abas, os 36 cabecalhos clicaveis da matriz (18 de linha e 18 de coluna, RF-48) e (no `[COULD]`) a escolha do 2o tipo. Cada um tem nome acessivel (nos botoes de tipo, o nome do tipo; nos cabecalhos da matriz, o nome do tipo e a direcao) e, quando aplicavel, estado selecionado/pressionado exposto (`aria-pressed`, padrao dos chips do Dex e do `SegmentedControl`). Icones de tipo sao decorativos (`aria-hidden`), o nome vem do controle/celula. Foco visivel por `:focus-visible` (ver CA-34).
- **RNF-04 (Temas)** `[MUST]` A pagina funciona e e legivel nos 7 temas (`classic`, `black`, `green`, `blue`, `purple`, `white`, `orange`), incluindo `black` (alto contraste, `--surface #111111`): faixas e celulas definem fundo E cor de texto juntos, x2, x1/2 e x0 continuam distinguiveis (cor + simbolo), bordas e destaques visiveis contra o fundo.
- **RNF-05 (Responsividade / sem sobreposicao)** `[MUST]` Em 360, 390 e 1280 px, PT e EN, sem tipo e com tipo selecionado, nas duas abas e na matriz: nenhum texto sobrepoe texto ou controle (harness `no-overlap`), nenhum vazamento horizontal da pagina (so o container da matriz rola), icones grandes com nome embaixo com espaco suficiente, 18 botoes de tipo em grade que quebra em linhas.
- **RNF-06 (i18n)** `[MUST]` Todo texto novo existe em PT e EN no dicionario i18n do app (nenhuma chave vazia nem faltando: titulos de grupo, legenda, 18 frases, rotulos acessiveis); registrado como modulo de mensagens proprio, sem colisao com o tipo `Message`; pt-BR com acentos como no restante da interface.
- **RNF-07 (Desempenho)** `[MUST]` Escolher um tipo ou trocar de aba responde de imediato (sem recarregar a tela inteira de forma perceptivel); a matriz (324 celulas) nao degrada a abertura nem a rolagem. `[ASSUMPTION: sem meta numerica na IDEA; requisito qualitativo, a SPEC fixa uma meta mensuravel]`
- **RNF-08 (Qualidade estatica)** `[MUST]` `typecheck` e `lint` (incluindo `no-literal-jsx-text` e a proibicao do travessao U+2014) limpos; build verde.
- **RNF-09 (Cobertura)** `[MUST]` Codigo novo respeita os limites de cobertura v8 do projeto (global 80/80, `src/domain/**` 95/95, `src/components/**` 70/70, `src/screens/**` 70/70).
- **RNF-10 (Nao regressao)** `[MUST]` Calculadora e painel de fraquezas da ficha, Dex, Capturados, Compare, Home e demais telas continuam identicos; suite completa (vitest + Playwright) e build verdes antes e depois, salvo os asserts diretamente afetados (RF-09, RF-10).
- **RNF-11 (Seguranca / privacidade)** `[MUST]` Nenhum segredo, credencial ou valor de variavel de ambiente em artefatos versionados; sem novo servico, coleta ou chamada de rede.

## 6. Criterios de aceite

Formato Dado/Quando/Entao; cada criterio cita os RF/RNF que valida. Os testes derivam o esperado de `TYPE_CHART` (nunca das frases ou das listas de exemplo deste PRD).

**Navegacao (RF-01 a RF-10)**
- **CA-01** Dado o desktop em PT; quando vejo a barra lateral; entao os itens estao na ordem Inicio, Pokedex, Capturados, Comparar, Tipos, Treinadores, Pokebolas, Itens & Comidas, Sincronizar, Configuracoes (10 itens), e em EN "Types" ocupa a mesma posicao. (RF-01, RF-02)
- **CA-02** Dado o celular (390 px); quando vejo a barra inferior; entao ela tem os mesmos 5 botoes de hoje (Inicio, Pokedex, Capturados, Comparar, Mais); quando abro "Mais"; entao "Tipos" e o primeiro item da lista de navegacao, antes de Treinadores. (RF-03, RF-08)
- **CA-03** Dado o item "Tipos" ativo; quando vejo a barra lateral (desktop) e, no celular, o botao "Mais"; entao o destaque de item ativo aparece. (RF-05)
- **CA-04** Dado o item "Tipos" na barra lateral e na folha "Mais"; quando o inspeciono; entao tem um icone de navegacao proprio, diferente dos 8 icones existentes (Shapes, ou Layers como fallback). (RF-04)
- **CA-05** Dado que clico em "Tipos" e depois em "Pokedex" e uso o Voltar do navegador; quando volto; entao reaparece a pagina "Tipos"; sem rota por URL nova. (RF-06)
- **CA-06** Dado o teste de shell (unitario) e o e2e de shell; quando os executo; entao as listas de rotulos do sidebar e da folha "Mais" estao atualizadas (10 itens; "Tipos" no inicio da folha), a paridade registro x `SCREEN_IDS` passa, e nenhum assert foi removido, afrouxado ou convertido em contagem. (RF-09, RNF-10)
- **CA-07** Dado `responsive.spec.ts`; quando o executo; entao os 14 snapshots (7 temas x Inicio e ficha) foram regenerados e revisados, com a tolerancia `maxDiffPixelRatio` original inalterada, e a unica diferenca visual e o 10o item na barra lateral. (RF-10)

**Visao por tipo (RF-11 a RF-20)**
- **CA-08** Dado a pagina sem tipo selecionado; quando a abro; entao vejo o controle "Por tipo" / "Tabela completa" com "Por tipo" ativo, a grade dos 18 tipos (icone + nome curto) e a instrucao "Escolha um tipo" / "Pick a type"; o bloco heroi, o controle Atacando/Defendendo, as faixas e a frase de intuicao nao aparecem. (RF-11, RF-19, RF-22, RF-47)
- **CA-09** Dado a pagina; quando escolho Fogo; entao o tipo aparece grande no topo, o botao de Fogo fica marcado (selecionado), a aba "Atacando" esta ativa e vejo as 3 faixas com os titulos "Forte contra (x2)", "Pouco efetivo contra (x1/2)", "Não afeta (x0)". (RF-12, RF-13, RF-14, RF-15)
- **CA-10** Dado Fogo selecionado; quando troco para "Defendendo"; entao vejo as 3 faixas "Fraco contra (recebe x2)", "Resiste a (recebe x1/2)", "Imune a (x0)", e o tipo selecionado continua Fogo. (RF-14, RF-15)
- **CA-11** Dado cada um dos 18 tipos e cada aba; quando derivo o esperado de `TYPE_CHART` (atacando: listas `2`, `0.5`, `0` da linha do tipo; defendendo: atacantes A com `singleMultiplier(A, X)` igual ao multiplicador do grupo); entao os 6 grupos mostram exatamente esses tipos, na ordem canonica de `TYPE_IDS`, e nenhum tipo x1 aparece. (RF-16)
- **CA-12** Dado Fogo; quando vejo as faixas; entao as listas batem com RF-40 (atacando: Planta, Gelo, Inseto, Aço / Fogo, Água, Pedra, Dragão / nenhum; defendendo: Água, Terra, Pedra / Fogo, Planta, Gelo, Inseto, Aço, Fada / nenhum). (RF-16, RF-40)
- **CA-13** Dado Normal, Elétrico, Fantasma e Aço; quando vejo as duas abas de cada um; entao as listas batem com RF-41 a RF-44 (Normal sem "forte contra", Elétrico não afeta Terra, Fantasma e Normal imunes entre si no ataque, Aço imune a Veneno na defesa). (RF-16, RF-41 a RF-44)
- **CA-14** Dado Normal com a aba "Atacando"; quando vejo o grupo "Forte contra (x2)"; entao ele continua visivel com o texto "nenhum" (EN "none"); idem "Resiste a (recebe x1/2)" na aba "Defendendo". (RF-18)
- **CA-15** Dado uma faixa de grupo; quando a inspeciono; entao a cor da faixa corresponde ao resultado (Atacando: x2 verde, x1/2 laranja, x0 cinza; Defendendo: x2 laranja, x1/2 verde, x0 cinza), os tipos aparecem como icones grandes com nome curto embaixo, e a faixa nao tem texto alem do titulo (e de "nenhum" quando vazia). (RF-17)
- **CA-16** Dado um tipo selecionado e a pagina em PT; quando troco o idioma da interface para EN; entao nomes de tipo, titulos de grupo, legenda, instrucoes e frase trocam de idioma e o mesmo tipo continua selecionado, na mesma aba. (RF-20, RNF-06)
- **CA-17** Dado o toggle de idioma dos termos do Cobblemon em EN e o idioma da interface em PT; quando abro a pagina; entao os nomes de tipo estao em PT (seguem a interface) e a pagina nao exibe o toggle de termos. (RF-32)

**Legenda e frases (RF-21 a RF-24)**
- **CA-18** Dado a pagina em qualquer visao, com ou sem tipo; quando rolo ao topo; entao a legenda "x2 = causa o dobro de dano / x1/2 = causa metade do dano / x0 = não afeta" (EN: "deals double damage / deals half damage / has no effect") esta visivel; cada linha de multiplicador tem so simbolo + palavras, sem cor; e ha duas frases de cor, ambas presentes nas duas visoes: PT "Nas faixas: verde = vantagem para o tipo escolhido, laranja = desvantagem, cinza = não afeta" / EN "In the bands: green = advantage for the chosen type, orange = disadvantage, gray = no effect"; e PT "Na tabela: a linha ataca a coluna; verde = vantagem de quem ataca, laranja = desvantagem de quem ataca, cinza = não afeta" / EN "In the table: the row attacks the column; green = advantage for the attacker, orange = disadvantage for the attacker, gray = no effect". (RF-21)
- **CA-19** Dado cada um dos 18 tipos selecionado, em PT e EN; quando vejo a frase de intuicao; entao ela e exatamente a da tabela de RF-23, tem no maximo 12 palavras e aparece nas duas abas. (RF-22, RF-23)
- **CA-20** Dado o dado de teste das relacoes citadas por frase (RF-24); quando o confronto com `TYPE_CHART`; entao as 49 relacoes batem com o multiplicador declarado (x2 ou x0), e uma relacao alterada no dominio faz o teste falhar. (RF-23, RF-24)
- **CA-21** Dado o dicionario i18n; quando o teste de completude roda; entao as 18 chaves de frase, os 6 titulos de grupo, os textos de legenda e os rotulos acessiveis existem em PT e EN, nao vazios. (RF-24, RNF-06)

**Tabela completa (RF-25 a RF-30)**
- **CA-22** Dado a matriz; quando a inspeciono; entao ha 18 linhas e 18 colunas na ordem de `TYPE_IDS`, cabecalhos com icone e nome acessivel, e 324 celulas. (RF-25, RF-26)
- **CA-23** Dado cada uma das 324 celulas; quando derivo o esperado de `singleMultiplier(atacante, defensor)`; entao x2 mostra `2`, x1/2 mostra `1/2`, x0 mostra `0` (cada um com sua cor) e x1 nao mostra texto visivel; cada celula tem nome acessivel completo (ex. "Fogo contra Planta: x2" em PT). (RF-27)
- **CA-24** Dado Fogo selecionado; quando vejo a matriz; entao a linha do Fogo (atacante) e a coluna do Fogo (defensor) estao destacadas, e a distincao funciona em escala de cinza (nao so cor); sem tipo selecionado, nada esta destacado; ao escolher outro tipo, o destaque se move. (RF-28)
- **CA-25** Dado a visao por tipo com X selecionado; quando comparo com a matriz; entao os x2 da linha de X batem com a faixa "Forte contra (x2)" e os da coluna de X batem com a aba "Defendendo", nos 18 tipos. (RF-30)
- **CA-26** Dado o celular a 390 px; quando abro a matriz e rolo na horizontal; entao so o container da matriz rola, a primeira coluna (atacantes) fica fixa, as celulas nao aparecem por baixo dela, e a pagina nao ganha rolagem horizontal. (RF-29, RNF-05)

**Mesma pagina nos dois projetos (RF-31 a RF-33)**
- **CA-27** Dado o codigo da pagina; quando listo seus imports e classes CSS; entao so ha dependencias da lista de RF-31 (nada de `Detail/TypeCalculator`, `WeaknessPanel`, `TermsToggle`, `useTermsLanguage`, `.mult-*`), e os nomes de tipo vem de `uiLanguage`. (RF-31, RF-32)
- **CA-28** Dado a SPEC; quando leio o plano de porte; entao ele consiste em copiar os arquivos da pagina e repetir as edicoes de registro (item, `ScreenId`, registro de tela, icone, modulo i18n), sem alterar comportamento. (RF-33)

**Estado da tela (RF-34 a RF-36)**
- **CA-29** Dado a pagina recem aberta; quando leio o estado; entao a visao e "Por tipo", nao ha tipo selecionado, a aba e "Atacando" e (no `[COULD]`) nao ha 2o tipo. (RF-34)
- **CA-30** Dado Fogo selecionado e aba "Defendendo"; quando clico em "Pokedex" e depois em "Tipos" pelo item de navegacao; entao a pagina abre sem tipo selecionado e na aba "Atacando". (RF-35)
- **CA-31** Dado Fogo selecionado e aba "Defendendo"; quando uso o Voltar do navegador e avanco de novo (ou volto de uma tela aberta a partir de "Tipos"); entao a pagina reaparece com Fogo, "Defendendo" e a rolagem restaurados. (RF-35)
- **CA-32** Dado que mudo tipo e aba varias vezes; quando conto as entradas de historico; entao nenhuma foi adicionada por essas mudancas. (RF-12, RF-35)
- **CA-33** Dado um tipo selecionado; quando recarrego o app; entao a pagina abre no estado inicial (nada persistido). (RF-36)

**Acessibilidade, temas e layout (RNF-02 a RNF-05)**
- **CA-34** Dado cada controle interativo novo (seletor de visao, 18 botoes de tipo, abas, 36 cabecalhos da matriz e, no `[COULD]`, o seletor do 2o tipo); quando navego por Tab e o foco cai nele; entao ha indicador de foco visivel por `:focus-visible` com `outline` diferente de `none`. Padrao real do app (conferido por grep): o reset de `button` em `base.css` nao remove o foco, e as telas que o estilizam usam `outline: 2px solid var(--secondary); outline-offset: 2px` sob `:focus-visible` (ex. `item.css`); todo `select` do app tem `outline: 0` de base (`components.css`), entao um `select` novo (se houver) repete esse padrao e acrescenta o indicador por `:focus-visible`. (RNF-03)
- **CA-35** Dado o teclado; quando uso Tab, Enter e Espaco; entao consigo trocar de visao, escolher qualquer um dos 18 tipos (pela grade e pelos 36 cabecalhos da matriz), trocar de aba e (no `[COULD]`) escolher e remover o 2o tipo, sem mouse; o estado de selecao e anunciavel (`aria-pressed` no botao do tipo selecionado e na opcao ativa do seletor de visao e das abas), e cada cabecalho da matriz tem nome acessivel com o nome do tipo e a direcao (linha/coluna). (RNF-03, RF-47, RF-48)
- **CA-36** Dado cada um dos 7 temas, incluindo `black`; quando vejo a pagina com um tipo selecionado (faixas, matriz, legenda); entao x2, x1/2 e x0 continuam distinguiveis por simbolo e por cor, e texto e borda tem contraste legivel. (RNF-02, RNF-04)
- **CA-37** Dado a escala de cinza (ou uma simulacao de daltonismo); quando vejo faixas, matriz e legenda; entao toda informacao continua legivel por simbolo/texto. (RNF-02)
- **CA-38** Dado a pagina a 360, 390 e 1280 px, em PT e EN, sem tipo e com tipo selecionado, nas duas abas e na matriz; quando rodo `expectNoOverlap` na raiz da pagina; entao 0 sobreposicao, e nenhum vazamento horizontal da pagina (so a matriz rola). (RNF-05)

**Defesa com 2 tipos `[COULD]` (RF-37 a RF-39)**
- **CA-39** Dado Água selecionada e a aba "Defendendo" com 2o tipo Terra; quando vejo o resultado; entao Planta aparece em "Muito fraco contra (recebe x4)" e Elétrico aparece em "Imune a (x0)"; com 2o tipo Voador, Elétrico aparece em x4. (RF-37, RF-39)
- **CA-40** Dado dois tipos escolhidos; quando derivo o esperado de `effectivenessAgainst([t1, t2])`; entao os 5 grupos (x4, x2, x1/2, x1/4, x0) batem para todos os pares possiveis de tipos distintos; Pedra/Aço contra Normal fica em x1/4. (RF-37, RF-39)
- **CA-41** Dado Água selecionada na aba "Defendendo"; quando abro o `select` do 2o tipo; entao ele lista "nenhum" mais os outros 17 tipos, sem Água; escolher "nenhum" volta ao resultado de um tipo so; na aba "Atacando" o `select` nao aparece. (RF-37, RF-38)


**Testes e qualidade (RF-45, RNF-01, RNF-06 a RNF-11)**
- **CA-42** Dado a suite do projeto; quando executo os testes novos; entao existem testes unitarios (grupos, matriz, i18n, estado, tela) e e2e (abrir pelo sidebar e pela folha "Mais", escolher tipo, trocar de aba, matriz, sem sobreposicao, sem erros de console) cobrindo os 18 tipos, todos derivando o esperado de `TYPE_CHART`. (RF-45)
- **CA-43** Dado o repositorio; quando comparo `package.json`, `src/domain/type-chart.ts` e `TypeCalculator.tsx` com a main; entao nao ha dependencia nova nem mudanca nesses arquivos. (RNF-01)
- **CA-44** Dado o repositorio; quando rodo typecheck, lint (incluindo `no-literal-jsx-text`), a suite unitaria com cobertura, o e2e e o build; entao tudo passa, os limites de cobertura sao respeitados e o travessao U+2014 nao aparece em codigo, strings nem i18n. (RNF-08, RNF-09, RNF-10)
- **CA-45** Dado a calculadora e o painel de fraquezas da ficha, Dex, Compare e Home; quando executo seus testes existentes; entao passam sem alteracao. (RNF-10)
- **CA-46** Dado o artefato versionado (PRD, codigo, testes); quando procuro segredos ou valores de ambiente; entao nao ha nenhum. (RNF-11)

**Cor por ponto de vista (RF-17, RF-27, RF-46, RNF-02)**
- **CA-47** Dado Fogo selecionado; quando vejo as duas abas e a matriz; entao as cores seguem RF-46 (Atacando: Planta, Gelo, Inseto, Aço em faixa verde, Fogo, Água, Pedra, Dragão em laranja; Defendendo: Água, Terra, Pedra em laranja, Fogo, Planta, Gelo, Inseto, Aço, Fada em verde; x0 sempre cinza) e cada faixa e celula traz o simbolo junto da cor; os valores de cor da pagina sao os da paleta da calculadora, definidos no CSS proprio da pagina. A mesma derivacao e testada nos 18 tipos a partir de `TYPE_CHART`. (RF-17, RF-27, RF-46, RNF-02)
**Visoes, matriz clicavel e subtitulo (RF-47 a RF-49)**
- **CA-48** Dado a pagina; quando escolho Fogo em "Por tipo" e troco para "Tabela completa"; entao so a matriz e visivel, com a linha e a coluna do Fogo destacadas; quando volto para "Por tipo"; entao Fogo continua selecionado. (RF-47, RF-28)
- **CA-49** Dado a tabela completa; quando ativo (clique ou teclado) o cabecalho de coluna da Água; entao Água passa a ser o tipo selecionado, a pagina continua na tabela completa e a linha e a coluna da Água ficam destacadas; clicar numa celula nao muda a selecao; a celula Fogo x Planta tem o nome acessivel "Fogo contra Planta: x2" (EN "Fire against Grass: x2"). (RF-48, RF-27)
- **CA-50** Dado o item "Tipos" na folha "Mais" do celular (a barra lateral do desktop nao mostra subtitulo de nenhum item, e a RF-08 proibe muda-la); quando o leio; entao o subtitulo e "Quem vence quem" (EN "Who beats whom"). (RF-49)

## Perguntas em aberto

Nenhuma. As 6 perguntas da revisao 2 foram respondidas pelo orquestrador em 2026-10-12 (sob delegacao do Pontin) e viraram requisitos: arranjo das visoes (RF-47), matriz clicavel nos cabecalhos (RF-48), grade compacta e bloco heroi (RF-11, RF-13), frase no heroi e 2o tipo em `select` so em "Defendendo" (RF-22, RF-37, RF-38), sem "desmarcar" (RF-12) e subtitulo do item (RF-49). As 5 suposicoes anteriores foram aceitas como decididas. Detalhes que a UISPEC define (tamanhos, espacamentos) nao sao perguntas de produto.

Suposicoes marcadas `[ASSUMPTION]` restantes (baixo risco):
1. RF-38: trocar o 1o tipo para o valor do 2o limpa o 2o tipo (caso nao decidido).
2. RNF-07: desempenho qualitativo, sem meta numerica na IDEA; a SPEC fixa uma meta mensuravel.
3. RF-21: redacao exata das frases de cor e de ponto de vista da matriz (a IDEA fixa o conteudo, nao o texto).
