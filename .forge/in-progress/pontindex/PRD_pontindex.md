---
feature: pontindex
language: pt-BR
status: draft
---

# PRD - Pontindex

## Revision History

| Data | Revisao | O que mudou |
|---|---|---|
| 2026-09-23 | 1 | Criacao do PRD a partir da IDEA e do CONTEXT aprovados. |
| 2026-09-23 | 2 | Modo de autonomia total: as 7 perguntas em aberto da revisao 1 foram resolvidas adotando a [ASSUMPTION] recomendada em cada uma. Adicionado o bloco "Decisoes assumidas (modo autonomo)", com cada decisao marcada como suposicao revisavel. Requisitos e criterios de aceite atualizados/adicionados (RF-09, RF-26, RF-52, RF-57, RF-73, RF-74, RF-78, RF-110 a RF-114) para refletir essas decisoes. "Pontos em Aberto" reduzido ao que continua genuinamente nao resolvido. |
| 2026-09-23 | 3 | Correcoes do forge-review (NEEDS-CHANGES), em modo de autonomia total. BLOCKER: RF-10 reescrito para nao contradizer RF-26 (nunca mostra aviso generico "Nao nasce no mundo"; usa sempre a secao "Como obter" em camadas). WARNINGS: decisao 2 revisada (Creepyon/Piglich usam placeholder de silhueta de Pokebola, nao textura do mod allthemons, que so tem atlas 3D - RF-09 atualizado); nova decisao 8 (mecanica de golpes tipo/poder/precisao/categoria/PP tambem empacotada em build a partir da PokeAPI, RF-21/RF-100 atualizados); adicionado RF-115 (Onde encontrar); adicionado RF-116 (Pokedex mobile de verdade) e RF-117 a RF-121 (identidade visual: gradiente por tipo, cards Lendario/Mitico, marca d'agua, fundo secundario saturado, posicao do selo) mais RNF-12 (raios maiores que o card), na nova subsecao 4.19, com clausula normativa de que `design/prototipo/` v9 e a referencia oficial; RF-60 e RF-111 atualizados para permitir desmarcar treinador-chave, e RF-124 (persistencia da serie ativa) e trava de series com pre-requisito (ex. atm_team exige bdsp, confirmado em kubejs/data/rctmod/series/atm_team.json); RF-59 e a nova decisao 9 reescritos com a regra REAL do level cap, confirmada por decompilacao (javap) do bytecode de rctmod-neoforge-0.18.1-beta.jar (classes LevelUtils e SeriesManager$SeriesGraph): cap = max(initialLevelCap, MENOR trainerLevel entre os treinadores-chave disponiveis), com initialSeries="empty" esclarecido (cap travado em 15, nunca avanca); RF-43 ganhou carimbo de data/hora para a mesclagem do historico funcionar. NITS: contagem de especies unificada em 1.027 (Objetivo, metrica, RF-37, RNF-01); RF-49 passou a incluir a etapa da Pokebola antes da silhueta; adicionados RF-122 (Apagar dados) e RF-123 (capturado orfao mantido oculto, nao contado, nao apagado); exemplo de busca PT/EN trocado para "Pantano"/Quagsire, verificado direto no lang pt_br.json do Cobblemon; RF-74/RF-113 deduplicados (RF-74 agora referencia RF-113); adicionados criterios de aceite cobrindo RNF-01/04/05/07/08/09, RF-11 a RF-14 e RF-100 a RF-104; RF-64 marcado com [ASSUMPTION] para bolas com efeito condicional (melhor caso assumido, condicao exibida). Secoes renumeradas para numeracao unica e sem ambiguidade: Requisitos Funcionais agora e secao 6, Requisitos Nao Funcionais secao 7, Criterios de Aceite secao 8; referencias cruzadas corrigidas (Papeis -> RF-76; Superficie de regressao -> RF-95 a RF-99; Fase 2 -> RF-105 a RF-109 secao 4.20; Personas -> secao 5). |
| 2026-09-23 | 4 | Re-review PASSOU; polimento final, em modo de autonomia total. Baseline NAO foi alterado (re-ancorado pelo orquestrador apos atualizacao do CONTEXT). (1) Subsecoes 4.1 a 4.20 dentro de Requisitos Funcionais renumeradas para 6.1 a 6.20, e todas as citacoes no corpo do texto corrigidas ("secao 4.7" -> 6.7, "secao 4.12" -> 6.12, "secao 4.20" -> 6.20, "Requisitos Funcionais (secao 4)" -> "(secao 6)"). (2) RF-111 e decisao 4: marcado [ASSUMPTION] que "serie concluida" = "todos os treinadores-chave derrotados" (o mod nao expoe esse campo explicitamente); investigado no jar/config real (read-only) e confirmada a serie especial "Modo Livre" (Freeroam): cap fixo em 100, pausa a serie anterior (retomar reverte o cap), e neste pack exige `freeroamRequiresCompletedSeries = true` no `rctmod-server.toml` (so libera apos concluir alguma serie); adicionada ao picker de series em RF-111, com criterio de aceite proprio. (3) "Pontos em Aberto": texto reescrito para refletir que o bloco de decisoes hoje tem 9 itens, 8 dos quais ja sao decisoes tomadas (so o item 5, cozinha, continua como pesquisa pendente). (4) RF-59 e decisao 9: adicionada a nota de divergencia "IDEA cita 43 treinadores-chave na BDSP; a contagem real dos arquivos da instancia e 33, adotada como fonte de verdade"; corrigida a ordem da formula: `relativeLevelCap` e somado ao nivel do PROPRIO time do treinador e limitado a 0-100 ANTES de comparar (maior valor) com o `trainerLevel` dos prerequisitos, nao depois. (5) Cabecalhos de criterios de aceite atualizados (Treinadores agora inclui RF-111/RF-124; Ficha e calculos agora cita RF-21/RF-110 explicitamente); adicionados criterios novos para a regra de mesclagem por entidade de RF-78 (exemplo completo com dois dispositivos) e para o texto de condicao das bolas condicionais de RF-64. (6) RF-49 dividido: o uso da Pokebola como splash/indicador de loading fora da animacao de captura virou um RF proprio, RF-125. (7) RF-09 e RF-16 agora declaram explicitamente que usam o MESMO componente de placeholder (silhueta de Pokebola), evitando duas implementacoes visuais diferentes para "imagem principal indisponivel". |
| 2026-09-23 | 5 | Correcao de exemplos apontada pela SPEC (OPEN-1/OPEN-2), conferida pelo orquestrador: calculadora de stats (base 100, nivel 100, IV 31, EV 252) = 299 neutra / 328 favoravel / 269 desfavoravel, conforme a formula do RF-35; cap BDSP apos Gardenia = 22 (Cedric herda o trainerLevel 22 do prerequisito, conforme a formula da decisao 9). Regras inalteradas, so os exemplos. |
| 2026-09-23 | 6 | Cascata da revisao da SPEC: texto do RF-59 alinhado ao cap 22 apos Gardenia; RF-63 corrigido de "51 Pokebolas" para as 48 reais do jar (as 51 chaves de lang incluiam 3 itens segurados: iron_ball, light_ball, smoke_ball), contagem derivada do dataset. |

## Baseline (ancora de drift)

- HEAD: `57004913e39b29d797afdf0028852f62d708e8ff` (branch `feature/pontindex`).
- `git hash-object .forge/ideas/pontindex/IDEA_pontindex.md`: `78ba7d1b16f88312efc42f3b586f5c2f96110eee`.
- `git hash-object .forge/ideas/pontindex/CONTEXT_pontindex.md`: `fc72ef604ad7b15a6e4d7ea39fb5ba773c53fd05`.

---

## Decisoes assumidas (modo autonomo, 2026-09-23)

O usuario colocou o processo em modo de autonomia total e delegou as decisoes das perguntas em aberto (revisao 1) e dos pontos levantados pelo forge-review (revisao 3) aos padroes [ASSUMPTION]/recomendacoes ja adotados neste PRD. As 9 decisoes abaixo foram adotadas e ja estao refletidas nos Requisitos Funcionais (secao 6) e nos Criterios de Aceite (secao 8). Cada uma continua sendo uma suposicao revisavel: se o usuario discordar ao ver o resultado, e so pedir o ajuste.

1. **IV/EV recomendados**: adotada a heuristica simples (investir IV 31 nos 2 melhores stats base do Pokemon) como recomendacao exibida na calculadora de stats. Um dataset de sets competitivos (ex. Smogon) fica registrado como melhoria futura, nao bloqueante. Refletido em RF-110.
2. **Especies custom do pack sem artwork na PokeAPI** (Creepyon #9902, Piglich): entram na Dex e no contador de capturados, que passa a ser "X de 1.027". **Revisado no forge-review**: o jar `allthemons-0.6.2.jar` so contem atlases de modelo 3D dessas duas especies, sem nenhum sprite 2D aproveitavel como imagem de ficha; a decisao de usar a textura do mod foi substituida por um placeholder no estilo/identidade visual do proprio app (silhueta de Pokebola), com aviso de que a imagem nao vem da PokeAPI. Refletido em RF-09 e RF-52. Revisavel se uma fonte de imagem 2D melhor for encontrada depois.
3. **Mod de breeding**: a secao "Como obter" usa o texto generico "Breeding (pasture)" quando o egg group permite, ate a implementacao confirmar o mecanismo tecnico exato (Just Enough Breeding 3.2.1) lendo os dados do mod na instancia. Refletido em RF-26.
4. **Serie ativa do Radical Cobblemon Trainers** (`initialSeries = "empty"` sem comportamento documentado): como o app nao le o save do Minecraft, o proprio usuario do Pontindex escolhe manualmente, na tela de Treinadores, qual serie esta acompanhando; todas as series desbloqueadas ficam disponiveis e o progresso de derrotados e guardado por serie, independente de qual esta marcada como "ativa" no momento. Refletido em RF-111. [ASSUMPTION] "Serie concluida" (usado na regra de X=100 de RF-59 e no desbloqueio de series com pre-requisito) e definido neste PRD como "todos os treinadores-chave (`optional:false`) daquela serie marcados como derrotados"; o bytecode do mod nao expoe um campo explicito de "serie concluida" separado disso, entao essa e uma interpretacao, nao um dado lido diretamente. Achado adicional confirmado por leitura do jar e do `rctmod-server.toml` da instancia (read-only): existe uma serie especial selecionavel chamada **Freeroam / "Modo Livre"** (`series.rctmod.freeroam.title`), que concede cap = 100 (sem restricao) e pausa a progressao da serie atual (retomar reverte o cap); no config da instancia, `freeroamRequiresCompletedSeries = true`, ou seja, neste pack o Modo Livre so fica disponivel depois que o jogador ja tiver concluido pelo menos uma outra serie. O app deve listar "Modo Livre" como uma opcao selecionavel na tela de Treinadores, com essa regra (cap 100, exige ao menos uma serie ja concluida neste pack, pausa/retoma a serie anterior), em vez de trata-lo como uma serie de progressao comum.
5. **Efeito exato de cada prato de cozinha do Cobblemon 1.7**: os itens de cozinha entram na secao Itens/Comidas com a descricao oficial do lang (quando existir); o efeito numerico detalhado (amizade, stats de montaria, efeitos de pocao) fica como pesquisa adicional pendente, nao bloqueante para o restante do escopo de Itens/Comidas. Este item continua listado em "Pontos em Aberto" por ser pesquisa, nao decisao de comportamento.
6. **Formato do codigo de transferencia (Sincronizar)**: adotada a codificacao binaria compacta (bitmap de capturados por indice de especie, nao lista de nomes) com QR code multi-frame quando o payload nao couber em um unico QR, e fallback para copiar/colar um texto longo (ou exportar um arquivo) quando o QR nao for pratico. Regra de mesclagem por entidade: capturados e treinadores derrotados = uniao; time = mantem o time do dispositivo que recebe, a menos que esteja vazio; historico = os 20 mais recentes somando as duas origens; preferencias = mantem as do dispositivo que recebe. Refletido em RF-73, RF-74, RF-78 e RF-112/RF-113.
7. **Contagem de rotas de fossil**: adotadas 16 rotas de fossil como fonte de verdade (15 nativas do jar do Cobblemon + 1 do `allthemons` para Mewtwo), derivadas sempre dos arquivos de dados reais, nunca hardcodadas como "14" em nenhum texto do app. Refletido em RF-26 e RF-114.
8. **Mecanica dos golpes (tipo/poder/precisao/categoria/PP)**: decidido no forge-review que esses dados tambem sao obtidos da PokeAPI e empacotados no BUILD (junto com o resto do dataset), em vez de consultados em runtime; a unica chamada de rede que sobra em tempo de execucao e a PokeAPI para artwork grande (RF-102, RNF-11). Refletido em RF-21 e RF-100.
9. **Regra do level cap do Radical Cobblemon Trainers quando ha varios treinadores-chave disponiveis ao mesmo tempo** (ex. os "Cedric x3" da BDSP): investigado por decompilacao do bytecode real de `rctmod-neoforge-1.21.1-0.18.1-beta.jar` (classes `LevelUtils` e `SeriesManager$SeriesGraph`, extraidas e desmontadas com `javap` a partir da instancia local, leitura somente). Regra CONFIRMADA (nao e mais suposicao): o cap de uma serie e `max(initialLevelCap(serie), X)`, onde `X` e o MENOR (minimo, nao o maior) valor de `trainerLevel` entre todos os treinadores-chave atualmente "disponiveis" (prerequisitos satisfeitos, ainda nao derrotados) daquela serie; se nao houver nenhum treinador-chave disponivel porque a serie foi concluida, `X = 100` (nivel maximo, ou seja, o cap deixa de restringir); se a serie ativa for "vazia" (nenhuma escolhida, RF-111) e nao houver nenhum treinador-chave, `X = 1` e o cap fica travado no `initialLevelCap` (15 no pack atual). `trainerLevel` de um treinador e, por sua vez, calculado nesta ordem: primeiro soma-se `relativeLevelCap` ao nivel maximo do PROPRIO time e limita-se o resultado entre 0 e 100; so depois esse valor e comparado (maior vence) com o `trainerLevel` de cada um dos seus proprios prerequisitos (recursivo). Divergencia de dados encontrada durante a investigacao: a IDEA (secao 7) cita 43 treinadores-chave para a serie BDSP, mas a contagem direta dos arquivos `optional:false` na instancia da 33; adotado 33 como fonte de verdade (RF-59). Refletido em RF-59 e RF-111 (comportamento de `initialSeries = "empty"` totalmente esclarecido: cap fixo em 15, nunca avanca, ate o usuario escolher uma serie real).

---

## 1. Objetivo e Visao

**Problema**: Pontin e o grupo de amigos jogam o modpack de Minecraft All the Mons (foco em Cobblemon/Pokemon) e nao tem, hoje, uma forma pratica de consultar informacoes de Pokemon especificas daquele modpack (niveis de evolucao reais do Cobblemon, onde cada especie aparece no mundo, progressao de treinadores/level cap, melhor Pokebola, itens e comidas) enquanto jogam. Fontes genericas (PokeAPI, wikis) nao refletem as regras do modpack (evolucoes diferentes, spawns customizados, treinadores do Radical Cobblemon Trainers).

**Impacto esperado**: um app "Pontindex", com estetica de Pokedex, que qualquer amigo do grupo abre sem cadastro, no PC ou no celular, e encontra em segundos qualquer informacao de qualquer um dos 1.027 Pokemon do pack (1.025 do Cobblemon 1.7.3 + Creepyon e Piglich do All the Mons), incluindo as regras especificas do All the Mons 1.3.0 / Cobblemon 1.7.3, junto com ferramentas de consulta pessoal (time, capturados, historico) que sobrevivem a atualizacoes do app.

**Metrica de sucesso** [ASSUMPTION: a IDEA nao define uma metrica quantitativa; a metrica abaixo e proposta por refletir os requisitos duros ja aceitos (persistencia e cobertura de dados) e deve ser confirmada com o usuario]:
1. 100% dos 1.027 Pokemon do dataset (Cobblemon 1.7.3 mais Creepyon e Piglich do All the Mons) sao encontrados por busca (nome PT, nome EN ou numero da Dex) e abrem uma ficha completa.
2. Apos instalar uma nova versao do site/app por cima de uma anterior, 100% dos dados locais (historico, time, capturados, progresso de treinadores, preferencias) persistem sem perda, validado pelo teste de migracao do Stage 5 da IDEA.
3. O app e usado pelo Pontin e pelo grupo de amigos durante as sessoes de jogo (uso real, nao mensuravel automaticamente na Fase 1 sem analytics, que e proibido pela IDEA).

## 2. Publico-alvo (Personas)

Papel unico, sem contas nem permissoes (ver secao 5 "Papeis e permissoes").

- **Persona unica: "Jogador do grupo"** - amigo do Pontin jogando All the Mons, joga o jogo em ingles mas prefere ler a interface em portugues, consulta o app no PC (enquanto joga no mesmo PC ou em outro monitor) ou no celular (do lado do PC, sem alt-tab), quer respostas rapidas ("qual o nivel de evolucao do meu Pokemon", "que bola eu uso", "qual treinador eu preciso vencer para o cap subir") e quer manter registro pessoal (time, capturados) que nao se perde quando o app atualiza.

## 3. Escopo

### Dentro do escopo - Fase 1 (site PWA estatico, sem backend, deploy Vercel)

Tudo que a IDEA lista nas secoes 3 e 10 (secao 1: nucleo; secao 2: cadeia de evolucao/golpes/filtros/time; secao 3: calculadoras/comparar/shiny/aleatorio/Pokedex com som), mais os sistemas adicionados ao longo da conversa (capturados, treinadores, Pokebolas, itens/comidas, pagina de item, navegacao com historico real, sincronizacao entre dispositivos, temas, idiomas, som, reduzir animacoes, persistencia duravel com backup). Detalhado nos Requisitos Funcionais (secao 6).

### Fase 2 (planejada, apos o site da Fase 1 estar finalizado) - NAO e "fora de escopo"

- Apps nativos **Windows (.exe, Electron)** e **Android (.apk, Capacitor 8)** a partir do MESMO codigo/`dist/` da Fase 1.
- Atualizador automatico: um push atualiza o site e gera novos instaladores via GitHub Actions.
- Botao **"Baixar app"**, existente somente no site, com duas opcoes (Android, Desktop Windows); os apps instalados nao mostram esse botao.
- Camada de armazenamento isolada atras de uma interface unica: o mesmo codigo de dominio usa IndexedDB no site e um arquivo proprio (fora de cache do SO) nos apps, sem mudar as regras de negocio.
- Sem backend em nenhuma fase (Fase 1 ou Fase 2).

Esses itens sao requisitos reais do produto (RF-105 a RF-109, secao 6.20), apenas com entrega adiada. Nenhum deles deve ser tratado como descartado.

### Fora de escopo (nao fazer, em nenhuma fase)

- iOS.
- Criacao de conta, login, perfis, qualquer nocao de identidade de usuario.
- Servidor/backend proprio; qualquer dado compartilhado entre amigos (a sincronizacao da secao 6.12 e so entre os proprios dispositivos de UM usuario, via codigo manual, sem servidor).
- Modo "aba Amigos" / progresso de outros jogadores (removido explicitamente pelo usuario).
- Nome de jogador fixo e ID de instalacao fixo (removidos explicitamente pelo usuario).
- Qualquer API ou servico pago; qualquer analytics ou coleta de dados.
- Batalha simulada (motor de batalha Pokemon).
- Leitura do save do Minecraft ou de qualquer arquivo do jogo em runtime (os dados sao empacotados em build-time; ver RNF de arquitetura de dados).
- Garantia formal de "funciona 100% offline" como feature vendida ao usuario: a IDEA declara "somente online" como decisao explicita; na pratica quase tudo funciona sem rede porque os dados vao empacotados, mas isso e efeito colateral da regra "dados 100% nativos no app", nao uma promessa de PWA offline-first com service worker completo. [ASSUMPTION: ver RNF-03.]

## 4. Superficie de regressao

Projeto novo, sem codigo anterior (confirmado: nenhum `package.json`/`src/` no repositorio). A partir da primeira versao publicada, a superficie de regressao e:
1. **Os dados locais dos usuarios** (historico, time, capturados, progresso de treinadores, preferencias): toda versao nova deve ler os dados da versao anterior sem perda (RF-95 a RF-99).
2. **O dataset empacotado**: qualquer atualizacao do pacote de dados (novo build a partir da instancia) nao pode quebrar referencias que os dados locais guardam (ex. um Pokemon capturado por `nationalPokedexNumber` continua existindo apos o dataset mudar).

## 5. Papeis e permissoes

**Papel unico, sem autenticacao.** Nao existe conceito de conta, sessao ou usuario identificado; qualquer pessoa que abra o site ou o app tem acesso identico a 100% das funcionalidades de consulta e aos seus proprios dados locais (armazenados so naquele navegador/instalacao). Nao ha matriz de permissao alem disso. A unica superficie sensivel a "identidade errada" e o recebimento de um codigo de sincronizacao (secao 6.12), que e tratado com requisito de negacao (RF-76) em vez de um sistema de permissoes.

---

## 6. Requisitos Funcionais

Notacao: `[MUST]` em todos os RFs de Fase 1 (a IDEA declara tudo must-have). RFs de Fase 2 levam a tag `[MUST - Fase 2]` para deixar explicito que sao obrigatorios, porem entregues depois do site.

**Clausula normativa de referencia visual**: `design/prototipo/` (v9, commit `eb197ca`, aprovado pelo usuario: "Tudo aprovado, achei incrivel") e a referencia visual e comportamental OFICIAL do produto. `forge-ui-recon` deve capturar dele e `forge-imp-frontend` deve segui-lo, para toda tela, componente, animacao e regra visual nao detalhada de outra forma nesta secao. Excecao: onde a IDEA ou este PRD afirmam explicitamente um comportamento diferente do prototipo (ex.: persistencia de tema/idioma de interface/som/reduzir animacoes entre aberturas, RF-82/RF-84/RF-90/RF-94, que o prototipo nao implementa; ou qualquer correcao de bug listada como "feedback" na IDEA secao 2), a IDEA e este PRD prevalecem sobre o prototipo.

### 6.1 Navegacao com historico real

- **RF-01** `[MUST]` O sistema deve manter uma pilha de navegacao propria onde cada entrada guarda: tela, parametros (ex. id do Pokemon ou do item), aba/subaba ativa, filtros ativos, posicao de scroll e quaisquer togles locais abertos (ex. linha de golpe expandida, calculadora aberta).
- **RF-02** `[MUST]` Ao acionar "Voltar" (botao do app, gesto/botao fisico do Android, ou Alt+Seta no desktop), o sistema deve restaurar exatamente a entrada anterior da pilha: mesma tela, mesmo Pokemon/item, mesma aba, mesmos filtros e mesma posicao de scroll, para qualquer profundidade de navegacao. Exemplo (IDEA): usuario esta no Charizard, aba Golpes em TM, rolado ate certo ponto; clica na Pedra do Fogo; abre a pagina do item; clica Voltar; deve retornar ao Charizard, aba TM, na mesma rolagem.
- **RF-03** `[MUST]` O sistema nunca deve tratar "Voltar" como "voltar para a lista" generico: sempre restaura a tela de origem exata, mesmo quando essa origem for outra ficha de Pokemon ou outra pagina de item (cadeias como Pokemon -> item -> Pokemon que dropa -> item).
- **RF-04** `[MUST]` Trocar aba, filtro ou toggle dentro de uma tela deve atualizar somente o componente/bloco afetado (ex. tabela de golpes, painel de fraquezas), sem re-renderizar ou recarregar o restante da tela.

### 6.2 Busca

- **RF-05** `[MUST]` O sistema deve aceitar busca por numero da Pokedex nacional em qualquer formatacao equivalente: "25", "025" e "0025" devem retornar o mesmo resultado (Pikachu).
- **RF-06** `[MUST]` O sistema deve aceitar busca por nome parcial, sem diferenciar acentuacao (ex. "charizar" ou "pikachu" sem acento encontram o Pokemon), com sugestoes de autocomplete conforme o usuario digita.
- **RF-07** `[MUST]` A busca por nome deve funcionar tanto pelo nome em ingles quanto pelo nome traduzido (pt-BR), independente do idioma de interface ativo no momento.
- **RF-08** `[MUST]` Quando a busca nao encontra nenhum resultado, o sistema deve exibir um estado vazio explicito (nao uma lista em branco silenciosa).

### 6.3 Listagem / Dex e filtros

- **RF-09** `[MUST]` O sistema deve listar todos os Pokemon presentes no dataset do Cobblemon 1.7.3 mais as especies custom adicionadas pelo `allthemons-0.6.2.jar` (Creepyon #9902 e Piglich), totalizando **1.027** entradas na Dex (decisao assumida, item 2). Para Creepyon e Piglich, a imagem principal usa o mesmo componente de placeholder de silhueta de Pokebola definido em RF-16 (pois o jar `allthemons` so contem atlases de modelo 3D dessas especies, sem sprite 2D aproveitavel); a ficha exibe um aviso visivel de que a imagem nao vem da PokeAPI.
- **RF-10** `[MUST]` Especies sem spawn natural confirmado na 1.7.3 (nem no Cobblemon base nem nas adicoes do All the Mons) NAO devem exibir um aviso generico de "Nao nasce no mundo"; em vez disso, a ficha exibe a secao "Como obter" em camadas (RF-26), que ja cobre esse caso com a rota real (evolucao, fossil, addon de estrutura, breeding) ou com o fallback honesto "Sem rota confirmada no All the Mons" quando nenhuma rota se aplica. A consulta do resto das informacoes da ficha nunca e impedida por essa condicao.
- **RF-11** `[MUST]` A listagem deve oferecer filtro por tipo (um ou mais dos 18 tipos).
- **RF-12** `[MUST]` A listagem deve oferecer filtro por geracao (gen1 a gen9, incluindo gen7b/gen8a conforme labels do dataset).
- **RF-13** `[MUST]` A listagem deve oferecer filtro por metodo de evolucao (ex. nivel, item, amizade, troca, sem evolucao).
- **RF-14** `[MUST]` Os filtros devem ser combinaveis entre si (ex. tipo Fogo + geracao 1) e a aplicacao/remocao de qualquer filtro deve atualizar somente a lista, sem recarregar a tela (ver RF-04).

### 6.4 Ficha do Pokemon

- **RF-15** `[MUST]` A ficha do Pokemon deve exibir: artwork oficial (PokeAPI), nome (PT/EN conforme idioma e/ou toggle do card), numero da Dex, tipo(s), os 6 stats base em barra visual, Total/BST, fraquezas e resistencias, cadeia de evolucao, habilidades (incluindo oculta), golpes, drops, secao "Como obter" e raridade de spawn.
- **RF-16** `[MUST]` Se a chamada a PokeAPI para o artwork falhar ou nao houver internet, o sistema deve exibir um placeholder no lugar da imagem e manter o restante da ficha funcional (todos os outros dados sao locais). Este placeholder e o MESMO componente visual de silhueta de Pokebola usado em RF-09 para Creepyon/Piglich: um unico componente de "imagem principal indisponivel" reutilizado nos dois casos (especie sem sprite 2D proprio, e falha/ausencia de rede ao buscar o artwork), evitando duas implementacoes visuais diferentes para o mesmo tipo de ausencia de imagem.
- **RF-17** `[MUST]` O painel de fraquezas/resistencias deve ser calculado a partir dos dois tipos do Pokemon usando a tabela de efetividade de tipos (18x18), aplicando multiplicacao em dual-type. Exemplo verificavel: Charizard (Fogo/Voador) recebe x2 de Pedra pelo tipo Fogo ser fraco a Pedra E x2 pelo tipo Voador ser fraco a Pedra, resultando em **x4** de dano de ataques do tipo Pedra; um Pokemon Fogo/Agua receberia x0.5 de um ataque de Fogo pelo tipo Fogo resistir a Fogo, mas x1 do tipo Agua neutro a Fogo, dando **x0.5** combinado (nao ha resistencia dupla nesse par).
- **RF-18** `[MUST]` O painel de fraquezas/resistencias deve ter um seletor Todos / Fraquezas / Resistencias; o padrao mostra os dois; trocar o seletor atualiza somente o painel.
- **RF-19** `[MUST]` A cadeia de evolucao deve ser clicavel (cada Pokemon da cadeia navega para a ficha dele) e cada seta/etapa deve exibir o metodo exato daquela evolucao: nivel minimo, item exato com nome (ex. "Pedra do Trovao / Thunder Stone", seguindo o toggle PT/EN do card), amizade + horario (dia/noite), golpe de um tipo especifico conhecido, ou troca. A cadeia mostra somente os metodos reais daquele Pokemon (nunca uma legenda generica de "metodos possiveis").
- **RF-20** `[MUST]` O nivel/condicao de evolucao exibido deve vir dos dados de `evolutions[]` do Cobblemon 1.7.3 (via dataset empacotado da instancia), nunca da PokeAPI, porque o Cobblemon reimplementa condicoes que podem divergir dos jogos oficiais.
- **RF-21** `[MUST]` A ficha deve listar os golpes aprendidos por nivel, com o nivel, nome (PT/EN), tipo, categoria (fisico/especial/status), poder, precisao e PP do golpe. Esses dados de mecanica do golpe vem da PokeAPI, mas sao obtidos e empacotados em tempo de BUILD junto com o resto do dataset (decisao assumida, item 8), nao consultados em runtime.
- **RF-22** `[MUST]` A lista de golpes deve ser organizada em abas (por exemplo: por nivel, TM, ovo, tutor) e trocar de aba deve atualizar somente a tabela de golpes, nunca redesenhar a ficha inteira.
- **RF-23** `[MUST]` Cada golpe na tabela deve exibir sua descricao oficial (origem: `cobblemon.move.<golpe>.desc` no lang PT/EN do Cobblemon).
- **RF-24** `[MUST]` A secao de habilidades deve listar todas as habilidades do Pokemon com descricao, identificando claramente qual e a habilidade oculta.
- **RF-25** `[MUST]` A ficha deve listar os drops do Pokemon (itens que ele solta ao ser derrotado no Minecraft) com a porcentagem/quantidade de cada um, e cada item deve ser clicavel (ver RF-71).
- **RF-26** `[MUST]` A secao "Como obter" deve substituir qualquer aviso generico por um bloco em camadas, na seguinte ordem de confianca: (1) evolucao a partir de uma pre-evolucao com spawn confirmado; (2) fossil, citando o item exato, entre as **16 rotas de fossil** consideradas fonte de verdade (15 nativas do jar do Cobblemon + 1 do `allthemons` para Mewtwo, decisao assumida, item 7; sempre derivadas dos arquivos de dados reais, nunca um numero hardcodado no texto); (3) spawn adicionado pelo proprio All the Mons (bioma/condicao real lida dos JSONs do pack); (4) addon com mecanica de estrutura, com texto curto fixo por addon (ex. "via Legendary Monuments", "via Raid Dens"); (5) breeding, quando o egg group da especie nao for "Undiscovered", exibido com o texto generico "Breeding (pasture)" ate a implementacao confirmar o mecanismo exato do mod Just Enough Breeding 3.2.1 (decisao assumida, item 3); (6) fallback honesto: "Sem rota confirmada no All the Mons" quando nenhuma das anteriores se aplica. O sistema nunca deve inventar uma rota de obtencao nao confirmada nos dados.
- **RF-115** `[MUST]` A ficha deve ter uma secao "Onde encontrar" separada da raridade, listando, para cada entrada de spawn da especie (Cobblemon base + adicoes do All the Mons): bioma(s), condicao de luz, horario (dia/noite/qualquer), estruturas quando aplicavel, e a faixa de nivel de spawn (ex. "5-33"); quando a especie tiver mais de uma entrada de spawn, todas aparecem listadas.
- **RF-27** `[MUST]` A raridade exibida deve ser o bucket de spawn mais comum entre todas as entradas daquela especie (common > uncommon > rare > ultra-rare em ordem de "mais comum"), com os demais buckets em que a especie tambem aparece listados como secundarios. Exemplo: Eevee aparece em ultra-rare, rare e 3x uncommon no dataset da instancia; o bucket principal exibido e "uncommon" (o mais comum entre eles), com "rare" e "ultra-rare" listados como adicionais.
- **RF-28** `[MUST]` Pokemon com a label `legendary` ou `mythical` no dataset devem exibir um selo proprio (Lendario ou Mitico) na ficha, distinto do selo de raridade de spawn.
- **RF-29** `[MUST]` Formas alternativas do Pokemon (Mega X/Y, Gigamax, variantes regionais presentes no dataset) devem aparecer como abas dentro da propria ficha do Pokemon base, nao como entradas separadas na Dex.
- **RF-30** `[MUST]` Cada aba de forma deve exibir o item necessario para ativa-la quando aplicavel (ex. Charizardite X/Y + Key Stone para Mega, lido dos dados do addon Mega Showdown/ZA Mega), com o item clicavel (ver RF-71).
- **RF-31** `[MUST]` O sprite/artwork da ficha deve alternar entre normal e shiny ao toque/clique em um controle dedicado.
- **RF-32** `[MUST]` A ficha deve ter um botao de "grito" (alto-falante) ao lado do controle de shiny que toca o som de grito do Pokemon (`pokemon/<nome>/<nome>_cry.ogg`); essa acao toca o som mesmo se o toggle global de som estiver desligado, pois e uma acao explicita do usuario (o toggle global governa apenas sons automaticos).
- **RF-33** `[MUST]` Toda vez que uma ficha e aberta, o sistema deve criar/atualizar uma entrada no historico de pesquisa (ver secao 6.7).

### 6.5 Calculadoras

- **RF-34** `[MUST]` O sistema deve oferecer uma calculadora de efetividade de tipo: o usuario escolhe o(s) tipo(s) do "meu Pokemon" (defensor) e ve o multiplicador de dano recebido de cada um dos 18 tipos atacantes (x4, x2, x1, x0.5, x0.25, x0), calculado pela mesma tabela de tipos da ficha (RF-17), independente de qual Pokemon esta selecionado na ficha.
- **RF-35** `[MUST]` O sistema deve oferecer uma calculadora de stats que recebe nivel, IV (0-31) e EV (0-252, maximo 510 total) por stat, e natureza (25 naturezas: 20 com +10%/-10% em um par de stats, 5 neutras), e calcula os 6 stats resultantes no nivel escolhido e no nivel 100, usando as formulas:
  - HP = floor((2*Base + IV + floor(EV/4)) * Nivel / 100) + Nivel + 10
  - Demais stats = floor((floor((2*Base + IV + floor(EV/4)) * Nivel / 100) + 5) * Modificador de natureza)
  - Exemplo verificavel (IDEA): stat base 100, nivel 100, IV 31, EV 252 -> **299** com natureza neutra, **328** com natureza favoravel aquele stat, **269** com natureza desfavoravel (corrigido na rev 5: o exemplo anterior 328/361 nao batia com a formula).
  - [ASSUMPTION: a IDEA registra que "amplamente reportado, mas nao confirmado em fonte primaria" que o Cobblemon usa exatamente essas formulas dos jogos oficiais; ver Pontos em Aberto se for preciso validar contra o proprio Cobblemon antes de shipar a calculadora.]
- **RF-110** `[MUST]` A calculadora de stats (RF-35) deve exibir tambem uma recomendacao de IV/EV por Pokemon, calculada pela heuristica: IV 31 nos 2 stats base mais altos daquela especie (decisao assumida, item 1); a recomendacao e um ponto de partida sugerido, nao substitui a entrada manual de IV/EV/natureza que o usuario ja informa. Um dataset de sets competitivos (ex. Smogon) fica registrado como melhoria futura, fora do escopo desta versao.

### 6.6 Comparar, aleatorio e time

- **RF-36** `[MUST]` O sistema deve permitir comparar dois Pokemon lado a lado (tipos, stats, BST), com opcao de trocar a posicao dos dois (swap).
- **RF-37** `[MUST]` O sistema deve oferecer um botao "Pokemon aleatorio" que abre a ficha de uma especie sorteada entre as 1.027 do dataset.
- **RF-38** `[MUST]` O sistema deve permitir adicionar um Pokemon ao "Meu time", com limite de **6** Pokemon (limite do jogo).
- **RF-39** `[MUST]` Ao tentar adicionar um 7 Pokemon ao time cheio, o sistema deve avisar explicitamente que o time esta cheio e nao adicionar.
- **RF-40** `[MUST]` O sistema deve permitir remover qualquer Pokemon do time a qualquer momento.
- **RF-41** `[MUST]` O time atual (ate 6 posicoes) deve ser exibido na tela inicial.
- **RF-42** `[MUST]` O time deve ser persistido localmente e recarregado identico ao reabrir o app (ver RNF de persistencia e Acceptance Criteria).

### 6.7 Historico de pesquisa

- **RF-43** `[MUST]` O historico deve guardar no maximo **20** itens, contendo apenas informacao basica por item (numero, nome, sprite pequeno, tipos) mais um carimbo de data/hora de quando foi visto, sem duplicar a ficha completa; esse carimbo e o que permite a regra de mesclagem "20 mais recentes" do Sincronizar (RF-78) funcionar corretamente ao combinar o historico de dois dispositivos.
- **RF-44** `[MUST]` Ao ultrapassar 20 itens, o item mais antigo deve sair automaticamente quando um 21 item entra (rotacao FIFO por recencia).
- **RF-45** `[MUST]` Se o Pokemon aberto ja estiver no historico, sua entrada deve mover para o topo (mais recente) em vez de duplicar.
- **RF-46** `[MUST]` O historico nao deve ter opcao de edicao nem de apagar/limpar manualmente (decisao explicita do usuario: nao precisa).
- **RF-47** `[MUST]` O historico deve ser persistido localmente e recarregado identico ao reabrir o app.

### 6.8 Sistema de capturados

- **RF-48** `[MUST]` A ficha do Pokemon deve ter um botao "Capturei" que marca aquele Pokemon como capturado e dispara a animacao de captura (RF-49).
- **RF-49** `[MUST]` Ao marcar "Capturei", o sistema deve executar a sequencia de animacao: (1) a tela apaga; (2) a Pokebola aparece, balanca e se abre; (3) na sequencia, aparece um fundo animado cuja categoria e Lendario, Mitico ou Outros (conforme a label do Pokemon, nao o bucket de spawn), com raios girando devagar, brilho central pulsando, e efeitos especificos por categoria (relampagos piscando no Lendario, faiscas flutuando no Mitico); (4) sobre esse fundo aparece a silhueta totalmente preta do artwork oficial do Pokemon (estilo "quem e esse Pokemon?"), crescendo; (5) a tela pisca branco rapidamente, com uma breve aceleracao dos efeitos do fundo nesse instante; (6) o Pokemon aparece por completo, com o nome exibido embaixo. A sequencia deve reproduzir os sons do Cobblemon (Pokebola, captura) no tempo correto de cada etapa (quando o som automatico estiver ligado).
- **RF-125** `[MUST]` A Pokebola deve ser usada como elemento de identidade visual em outros pontos do app, alem da animacao de captura: icone do botao "Capturei" (RF-48), icone do app e tela de splash/carregamento inicial, e indicador de loading girando em qualquer tela que aguarde dados (ex. artwork da PokeAPI ainda nao cacheado), conforme a decisao original da IDEA de uso da Pokebola.
- **RF-50** `[MUST]` O usuario deve poder desmarcar um Pokemon capturado, tanto pela ficha quanto pela lista de capturados.
- **RF-51** `[MUST]` Marcar novamente como capturado (apos desmarcar) deve repetir a animacao de captura por completo.
- **RF-52** `[MUST]` Deve existir uma tela de lista de capturados, mostrando um contador no formato "X de 1.027" (total do dataset incluindo Creepyon e Piglich, decisao assumida, item 2).
- **RF-53** `[MUST]` A lista de capturados deve permitir filtrar por "so capturados" e "so faltando".
- **RF-54** `[MUST]` A animacao de captura deve poder ser pulada com um toque/clique a qualquer momento.
- **RF-55** `[MUST]` Nao ha limite de quantidade de Pokemon capturados.
- **RF-56** `[MUST]` A lista de capturados deve ser persistida localmente e recarregada identica ao reabrir o app.

### 6.9 Treinadores e level cap

- **RF-57** `[MUST]` O sistema deve exibir, por serie de progressao (ex. Radical Red, BDSP, Unbound, series proprias do All the Mons como ATM Team e Content Creators), a lista de treinadores-chave em ordem de progressao.
- **RF-58** `[MUST]` Cada treinador-chave exibido deve mostrar: nome, tipo (normal/rival/lider/E4/campeao/etc.), time completo (especie, nivel, genero, habilidade, moveset), bioma de spawn natural, e o `signatureItem` (com instrucao de uso no Trainer Spawner), clicavel (ver RF-71).
- **RF-59** `[MUST]` O sistema deve calcular e exibir o level cap vigente de cada serie seguindo a regra real do mod (CONFIRMADA por decompilacao do bytecode de `rctmod-neoforge-1.21.1-0.18.1-beta.jar`, decisao assumida item 9, nao mais uma suposicao): `cap = max(initialLevelCap(serie), X)`, onde `X` e o MENOR (minimo) valor de `trainerLevel` entre TODOS os treinadores-chave atualmente disponiveis (prerequisitos de `requiredDefeats` satisfeitos, ainda nao derrotados) daquela serie; se nenhum treinador-chave estiver disponivel porque a serie inteira foi concluida, `X = 100`. `trainerLevel` de um treinador e calculado NESTA ORDEM: (1) soma-se o `relativeLevelCap` (0 no pack atual) ao nivel maximo do PROPRIO time daquele treinador; (2) o resultado e limitado entre 0 e 100 (`min(100, max(0, nivel_do_time + relativeLevelCap))`); (3) SO DEPOIS desse limite, o valor e comparado (maior valor vence) com o `trainerLevel` de cada um dos seus prerequisitos, calculado recursivamente da mesma forma. Ou seja, o `relativeLevelCap` afeta apenas o proprio time do treinador antes do limite de 100, nao o resultado final ja comparado com os prerequisitos. Quando so ha UM treinador-chave disponivel por vez (caso comum, cadeia linear), isso equivale a "nivel maximo do proximo treinador-chave"; quando VARIOS treinadores-chave se tornam disponiveis ao mesmo tempo (ex. ramificacoes com `requiredDefeats` do tipo OR), o cap usa o MENOR entre eles, nao o maior. Exemplo verificavel com dados reais da serie BDSP (**33** treinadores-chave `optional:false`, extraidos de `mobs/trainers/single/*.json` + `trainers/*.json` na instancia; divergencia: a IDEA, secao 7, cita 43 treinadores-chave para a BDSP, um numero que nao bate com a contagem direta dos arquivos da instancia - adotar 33, derivado dos dados reais, como fonte de verdade): cap inicial = max(15, 14) = **15** (Roark, unico disponivel, time maximo nivel 14); apos derrotar Roark, cap = **16** (Mars, unico disponivel); apos Mars, cap = **20** (Jupiter); apos Jupiter, cap = **22** (Gardenia); apos derrotar Gardenia, TRES treinadores-chave ficam disponiveis ao mesmo tempo ("Pokemon Trainer Cedric" x3, ids `pokemon_trainer_cedric_0445/0446/0447`), todos com time maximo nivel 21 neste pack, mas cada um herda o `trainerLevel` 22 do prerequisito Gardenia (max(21, 22) = 22); o cap sobe para **22** e so avanca de novo quando pelo menos um dos tres Cedric for derrotado, liberando Maylene (nivel 30).
- **RF-60** `[MUST]` O usuario deve poder marcar um treinador-chave como derrotado; ao marcar, o cap da serie deve ser recalculado imediatamente e, se o toggle de som automatico estiver ligado, o som de level-up deve tocar. O usuario tambem deve poder DESMARCAR um treinador-chave ja marcado como derrotado; ao desmarcar, o cap da serie e recalculado imediatamente (podendo descer para um valor anterior).
- **RF-61** `[MUST]` Quando um treinador tiver `requiredDefeats` com multiplas sublistas, a logica deve exigir TODAS as sublistas satisfeitas (AND); dentro de cada sublista, basta UM dos treinadores listados estar derrotado (OR).
- **RF-62** `[MUST]` O progresso de treinadores derrotados por serie deve ser persistido localmente e recarregado identico ao reabrir o app.
- **RF-111** `[MUST]` Como o app nao le o save do Minecraft, o usuario deve escolher manualmente, na tela de Treinadores, qual serie esta acompanhando no momento (decisao assumida, item 4). Nota tecnica confirmada por decompilacao (decisao assumida, item 9): o comportamento de `initialSeries = "empty"` no mod real e um cap travado no valor de `initialLevelCap` (15 no pack atual) que nunca avanca, ja que a serie "empty" nao tem treinadores; a escolha manual do usuario no app existe justamente para sair desse estado e acompanhar uma serie real com progressao. Series com pre-requisito de outra serie (ex. `atm_team`, que exige a serie `bdsp` concluida, confirmado em `kubejs/data/rctmod/series/atm_team.json`) devem aparecer BLOQUEADAS na lista de selecao, com o nome da serie pre-requisito exibido, ate que o pre-requisito seja cumprido ([ASSUMPTION, decisao 4] definido aqui como "todos os treinadores-chave daquela serie derrotados", ja que o mod nao expoe um campo explicito de "serie concluida"). O picker de series tambem deve incluir a opcao especial **"Modo Livre" (Freeroam)**, confirmada no jar e no config da instancia (`freeroamRequiresCompletedSeries = true`, decisao assumida item 4): ao escolher Modo Livre, o cap fica fixo em 100 (sem restricao) e a progressao da serie anteriormente ativa fica pausada (retomar aquela serie reverte o cap ao valor de antes); neste pack, Modo Livre so aparece desbloqueado depois que o usuario ja tiver concluido pelo menos uma outra serie.
- **RF-124** `[MUST]` A serie ativa escolhida pelo usuario (RF-111) deve ser persistida localmente e restaurada em toda abertura do app, junto com o progresso de treinadores derrotados por serie (RF-62).

### 6.10 Pokebolas

- **RF-63** `[MUST]` O sistema deve exibir uma grade com as Pokebolas do Cobblemon 1.7.3 (48 no jar, pasta `textures/item/poke_balls/`; contagem derivada do dataset, RF-114), cada uma com seu efeito oficial em PT e EN (origem: tooltip do lang do Cobblemon, nao a wiki), clicavel para a pagina do item (RF-71).
- **RF-64** `[MUST]` Na ficha de cada Pokemon, o sistema deve calcular e listar as melhores Pokebolas para aquele Pokemon especifico, considerando tipo, peso, velocidade base, nivel, condicoes de horario/luz, status de Ultra Beast e status de "ja visto na Pokedex" quando esses fatores forem parte da regra oficial daquela bola. Exemplo verificavel: para um Magikarp (tipo Agua), a Net Ball (3x em Pokemon do tipo Agua ou Inseto) deve aparecer classificada acima da Poke Ball comum (1x), no painel "Melhor Pokebola" daquela ficha. [ASSUMPTION] Para bolas cujo multiplicador depende de uma condicao externa ao Pokemon (ex. Dusk Ball por nivel de luz, Level Ball por diferenca de nivel do time do jogador, Timer Ball por numero de turnos de batalha), o ranking assume o MELHOR CASO daquela condicao (ex. Dusk Ball assume luz 0) e exibe o texto da condicao ao lado da bola no painel, deixando claro que o multiplicador mostrado depende de o jogador cumprir aquela condicao no jogo.
- **RF-65** `[MUST]` Toda Pokebola citada em qualquer parte do app (grade, painel "Melhor Pokebola" da ficha) deve ser clicavel e abrir a pagina individual daquele item.

### 6.11 Itens, comidas e pagina de item

- **RF-66** `[MUST]` O sistema deve exibir uma grade de itens organizada por categoria (medicina, vitaminas de EV, doces de EXP e de IV, evolucao, held items, batalha, cozinha, berries, iscas, Pokebolas, etc.).
- **RF-67** `[MUST]` A grade de itens deve ter uma barra de busca que encontra itens pelo nome em portugues OU em ingles simultaneamente, sem diferenciar acentuacao, independente do toggle de idioma de termos daquele card.
- **RF-68** `[MUST]` Cada item deve ter uma pagina individual com: nome (PT/EN), descricao oficial (tooltip do lang do Cobblemon), imagem real (textura extraida do jogo), categoria, e uma secao "Como obter" mostrando somente o metodo (nunca a receita de crafting em si): craftavel (existe no dataset de receitas), drop de algum Pokemon (indice invertido dos `drops` das especies, com % e link para a ficha daquele Pokemon), plantavel (biomas preferidos, no caso de berries/apricorns/mints), loot de estrutura (origem: loot tables do Cobblemon + injecoes do pack), pesca, ou "sem rota confirmada" se nada se aplicar.
- **RF-69** `[MUST]` A secao "Como obter" da pagina de item nunca deve exibir uma rota nao confirmada nos dados (mesma regra de honestidade de RF-26).
- **RF-70** `[MUST]` Quando fizer sentido (ex. uma pedra de evolucao), a pagina do item deve exibir uma secao "Usado em" listando os Pokemon que usam aquele item (ex. quais evoluem com aquela pedra), cada um clicavel para a propria ficha.
- **RF-71** `[MUST]` Qualquer item citado em qualquer lugar do app (drop na ficha, item de evolucao na cadeia, item de forma, mochila de treinador, painel de Pokebolas, grade de itens) deve ser clicavel e abrir a pagina individual daquele item, respeitando a navegacao com historico real (RF-01 a RF-04): "Voltar" a partir da pagina do item retorna exatamente para onde o usuario estava, incluindo aba/scroll.

### 6.12 Sincronizar entre dispositivos

- **RF-72** `[MUST]` O sistema deve ter um item de menu "Sincronizar" (presente no site e nos apps da Fase 2), abrindo uma tela com explicacao textual de como funciona: e um processo MANUAL, e uma "foto" do progresso local naquele momento (nao automatico, nao continuo).
- **RF-73** `[MUST]` A tela de Sincronizar deve ter uma acao "Gerar codigo" que comprime o progresso local do dispositivo (capturados, time, historico, treinadores derrotados, preferencias) em uma codificacao binaria compacta (bitmap de capturados por indice de especie, nao lista de nomes, decisao assumida, item 6), exibida como QR code e como codigo de texto copiavel, gerados inteiramente no navegador/app, sem qualquer chamada de rede/servidor.
- **RF-74** `[MUST]` A tela de Sincronizar deve ter uma acao "Receber codigo" que aceita escanear um QR code (ou sequencia multi-frame, ver RF-113) pela camera, ou colar o texto copiado / importar um arquivo quando o QR nao for pratico (ex. camera indisponivel).
- **RF-75** `[MUST]` Ao receber um codigo valido, o sistema deve mostrar um resumo legivel do que sera aplicado (ex. quantidade de capturados, itens do time, treinadores derrotados) antes de aplicar qualquer mudanca, e perguntar se o usuario quer **Mesclar** (uniao dos dados, padrao) ou **Substituir** (sobrescrever os dados locais).
- **RF-76** `[MUST]` Ao receber um codigo invalido, corrompido, incompleto ou de um formato/versao nao reconhecida, o sistema deve exibir um erro claro e **nao alterar nenhum dado local existente** (requisito de negacao; nenhum estado parcial deve ser aplicado).
- **RF-77** `[MUST]` A funcao "Sincronizar" serve exclusivamente para levar o proprio progresso de um usuario entre os proprios dispositivos (ex. PC para celular); nao existe, em nenhum fluxo, compartilhamento do progresso com outro usuario/amigo (a aba "Amigos" e qualquer nocao de progresso alheio foram removidas pelo usuario).
- **RF-78** `[MUST]` No modo Mesclar, o resultado por entidade deve ser (decisao assumida, item 6): capturados = uniao (um Pokemon capturado em qualquer um dos dois lados fica capturado); treinadores derrotados = uniao por serie; time = mantem o time do dispositivo que recebe, a menos que esteja vazio, caso em que usa o time recebido; historico = mantem os 20 mais recentes considerando ambas as origens; preferencias = mantem as do dispositivo que recebe. [ASSUMPTION: a IDEA nao detalha regra de mesclagem por entidade; esta e a decisao adotada em modo autonomo, revisavel se o usuario pedir outro comportamento ao ver o resultado.]
- **RF-112** `[MUST]` A codificacao do codigo de sincronizacao deve representar capturados como um bitmap indexado por `nationalPokedexNumber`/id de especie (1 bit por especie do dataset, incluindo Creepyon e Piglich), nunca como lista de nomes, para manter o payload pequeno mesmo com todas as 1.027 especies capturadas.
- **RF-113** `[MUST]` Quando o codigo de sincronizacao gerado exceder a capacidade pratica de um unico QR code, o sistema deve dividir o payload em multiplos QR codes sequenciais (multi-frame) e orientar o usuario a escanear todos em ordem; a tela de "Receber codigo" deve indicar quantos frames faltam durante a leitura.

### 6.13 Temas de cor

- **RF-79** `[MUST]` O sistema deve oferecer 7 temas de cor (nomeados no prototipo: classico/vermelho-azul, preto, verde, azul, roxo, branco, laranja), cada um com cor primaria e secundaria proprias; o tema classico (vermelho e azul) e o padrao.
- **RF-80** `[MUST]` No tema Preto (preto/amarelo), todos os cards devem ter fundo preto (em vez da cor de superficie padrao dos outros temas), para nao se confundir com o fundo geral do app naquele tema.
- **RF-81** `[MUST]` Trocar de tema deve aplicar a nova paleta instantaneamente em toda a interface (incluindo barras de scroll customizadas, chips de tipo, gradientes de card), sem recarregar a pagina/app.
- **RF-82** `[MUST]` O tema escolhido deve ser persistido localmente e restaurado em toda abertura do app; o tema nunca volta ao padrao sozinho.

### 6.14 Idiomas

- **RF-83** `[MUST]` O sistema deve permitir alternar o idioma da interface entre portugues (padrao) e ingles.
- **RF-84** `[MUST]` O idioma de interface escolhido deve ser persistido localmente e restaurado em toda abertura do app.
- **RF-85** `[MUST]` Todo card que exibe termos do jogo (itens, biomas, golpes, habilidades, bolas, condicoes, treinadores/series, grupos de ovo, naturezas) deve ter um toggle PT/EN proprio no cabecalho, que troca somente os termos daquele card, sem alterar o idioma do restante da interface.
- **RF-86** `[MUST]` Deve existir uma preferencia global em Configuracoes ("Nomes do jogo em: Portugues / Ingles", padrao Portugues) que define o valor inicial do toggle de cada card; a escolha feita em um card individual (override) deve ser lembrada localmente e ter prioridade sobre a preferencia global para aquele card especifico.
- **RF-87** `[MUST]` Todo chip de tipo deve mostrar icone + nome do tipo, com o nome traduzido conforme o idioma aplicavel aquele contexto e sempre com inicial maiuscula (ex. "Fire", "Fogo"; nunca "fire" ou "fogo" em minusculo).

### 6.15 Som

- **RF-88** `[MUST]` O som deve vir **ligado por padrao** na primeira abertura do app.
- **RF-89** `[MUST]` Deve existir um toggle para ligar/desligar os sons automaticos (navegacao, captura, evolucao, level-up, abrir/fechar Pokedex); esse toggle nao afeta acoes explicitas como o botao de grito (RF-32), que toca sempre.
- **RF-90** `[MUST]` A preferencia de som (ligado/desligado) deve ser persistida localmente e restaurada em toda abertura do app.
- **RF-91** `[MUST]` O sistema deve reproduzir, quando o som automatico estiver ligado: grito ao abrir a ficha do Pokemon; brilho/efeito sonoro ao alternar para shiny; sequencia completa de sons na animacao de captura (arremesso, balancos, captura ou critica); som de abrir/fechar Pokedex ao entrar/sair do app; clique curto na navegacao entre telas; som de evolucao ao visualizar uma evolucao na cadeia; som de level-up ao marcar um treinador-chave como derrotado.

### 6.16 Reduzir animacoes

- **RF-92** `[MUST]` Deve existir um toggle "Reduzir animacoes" que, quando ativado, torna estatica toda animacao do app: transicoes de tela, cards de entrada, animacao de captura completa, marca d'agua giratoria, brilho/faiscas dos cards Lendario/Mitico, rotacao dos raios atras do artwork.
- **RF-93** `[MUST]` O valor inicial do toggle "Reduzir animacoes" deve respeitar a preferencia `prefers-reduced-motion` do sistema operacional/navegador quando disponivel, podendo ser sobrescrito manualmente pelo usuario.
- **RF-94** `[MUST]` A preferencia "Reduzir animacoes" deve ser persistida localmente e restaurada em toda abertura do app.

### 6.17 Persistencia de dados e backup (requisito duro)

- **RF-95** `[MUST]` Historico, time, capturados, progresso de treinadores (derrotados/cap) e preferencias (tema, idioma de interface, idioma de termos padrao e por card, som, reduzir animacoes) devem ser gravados em uma camada de armazenamento duravel, fora de cache volatil: IndexedDB com armazenamento persistente na Fase 1 (site); arquivo proprio fora da pasta de cache do sistema operacional nas Fases 2 (pasta de dados do usuario no Windows/Electron; armazenamento interno do app no Android/Capacitor).
- **RF-96** `[MUST]` Instalar/publicar uma nova versao do app (novo build do site, novo instalador .exe, ou nova versao do .apk) por cima de uma anterior nunca deve apagar ou corromper os dados locais existentes; toda leitura de dados de uma versao anterior deve passar por migracao de esquema quando o formato mudar (campo `schemaVersion` no registro de dados).
- **RF-97** `[MUST]` Apagar dados locais (qualquer entidade ou tudo) so pode acontecer por acao explicita do usuario, precedida de uma confirmacao clara do que sera apagado.
- **RF-122** `[MUST]` Deve existir, em Configuracoes, uma acao "Apagar dados" que permite ao usuario apagar seus dados locais (por entidade especifica, ex. so o historico, ou tudo), sempre passando pela confirmacao exigida em RF-97 antes de executar.
- **RF-123** `[MUST]` Se um id de especie salvo como capturado (ou presente no time/historico) deixar de existir em uma atualizacao futura do dataset empacotado, esse registro deve ser mantido silenciosamente no armazenamento local (nunca apagado automaticamente), mas nao deve aparecer na interface (listagens, contador "X de 1.027") nem ser contado em nenhum total, ate que uma versao futura do dataset volte a incluir aquele id ou o usuario apague os dados manualmente (RF-97/RF-122).
- **RF-98** `[MUST]` O sistema deve oferecer, em Configuracoes, uma acao "Exportar backup" que gera um unico arquivo contendo todos os dados locais (historico, time, capturados, progresso de treinadores, preferencias) e uma acao "Importar backup" que restaura esse arquivo, para o usuario trocar de aparelho, reinstalar do zero, ou levar os dados do PC para o celular.
- **RF-99** `[MUST]` Toda escrita nos dados locais deve ser atomica (gravar em local temporario e so trocar pelo definitivo apos sucesso), para nao corromper os dados em caso de fechamento abrupto do app durante a escrita.

### 6.18 Empacotamento de dados e PWA

- **RF-100** `[MUST]` Em tempo de build, um script deve ler a instancia local do modpack (jars de mods + `kubejs/data/` + configuracoes relevantes) uma unica vez e gerar um pacote de dados (JSON de especies/spawns/fosseis/treinadores/itens/receitas + texturas de item + sons + traducoes PT/EN), consultar a PokeAPI para trazer tambem a mecanica de golpes (tipo/poder/precisao/categoria/PP, decisao assumida, item 8) e os sprites pequenos, e gerar um pacote unico que e commitado/empacotado junto ao codigo do app.
- **RF-101** `[MUST]` Em tempo de execucao, o app nunca deve tentar ler mods, jars ou pastas do Minecraft; toda a informacao de jogo empacotada deve funcionar sem o modpack instalado no dispositivo que roda o app.
- **RF-102** `[MUST]` A unica chamada de rede em runtime deve ser a PokeAPI, exclusivamente para artwork oficial em tamanho grande (com cache local apos o primeiro carregamento); sprites pequenos (96px) tambem devem ser empacotados no build para a lista, historico, time e capturados funcionarem sem depender de rede.
- **RF-103** `[MUST]` O site deve ser instalavel como PWA (manifest, icone do app usando a Pokebola conforme decidido), permitindo adicionar a tela inicial/area de trabalho.
- **RF-104** `[MUST]` A ficha e qualquer tela do app devem exibir, em algum ponto de Configuracoes/Sobre, a versao do dataset empacotado (ex. "Dados: All the Mons 1.3.0 / Cobblemon 1.7.3"), para rastrear divergencias quando o pack do usuario mudar de versao.
- **RF-114** `[MUST]` O script de build deve derivar a contagem de rotas de fossil (e qualquer outra contagem exibida na interface, como total de especies ou total de fosseis) diretamente dos arquivos de dados reais lidos da instancia (decisao assumida, item 7: hoje 16 rotas, 15 do jar do Cobblemon + 1 do allthemons para Mewtwo); nenhuma contagem pode ser um numero fixo escrito no codigo/texto da interface, para que o dataset possa mudar sem exigir edicao manual desses textos.

### 6.19 Identidade visual e Pokedex mobile

- **RF-116** `[MUST]` No layout mobile, o app deve ter aparencia de Pokedex de verdade: tampa, luz, botoes fisicos e som de beep ao abrir/fechar (conforme a referencia comportamental do prototipo, ver clausula normativa no inicio desta secao).
- **RF-117** `[MUST]` O card principal do Pokemon na ficha deve usar um gradiente pelo tipo PRIMARIO do Pokemon, com um par de cores saturado definido para cada um dos 18 tipos em `design/tipos/cores.json`; o mesmo par de cores e usado pelos chips de tipo e pelo tom dos cards compactos (historico, listagem, capturados), formando uma paleta unica por tipo compartilhada entre os tres contextos.
- **RF-118** `[MUST]` Pokemon com a label `legendary` deve ter o card inteiro (nao so o selo) com gradiente dourado metalico, com um brilho que varre devagar e faiscas cintilando; Pokemon com a label `mythical` deve ter o card com gradiente roxo para azul com brilho ciano (mesma paleta do fundo de captura mitico), tambem com brilho e faiscas. Em ambos os casos, o selo Lendario/Mitico continua visivel sobre o gradiente, e os chips de tipo mantem o gradiente do proprio tipo (RF-117), nao o gradiente especial do card. Os efeitos de brilho/faiscas respeitam a preferencia "Reduzir animacoes" (RF-92 a RF-94).
- **RF-119** `[MUST]` Deve existir uma marca d'agua de Pokebola girando devagar, monocromatica (na cor do texto do tema ativo, nunca colorida), com opacidade bem baixa, fixa atras de toda a interface; respeita "Reduzir animacoes".
- **RF-120** `[MUST]` O fundo da area de conteudo de cada tela deve usar a cor secundaria do tema ativo, suficientemente saturada para ser perceptivel (nunca branco puro nem uma tonalidade quase imperceptivel), mantendo os cards em tom claro e legivel por cima; a regra vale em todos os 7 temas (RF-79), exceto o tema Preto, onde os cards usam fundo preto (RF-80).
- **RF-121** `[MUST]` O selo de raridade do card principal deve ficar no canto superior ESQUERDO da area do gradiente, sempre oposto ao botao de shiny (RF-31, canto superior direito); quando houver tambem selo Lendario/Mitico (RF-28), os dois selos ficam juntos nesse mesmo canto. A faixa inferior do card fica somente com chips de tipo e botoes de acao.

### 6.20 Fase 2 - apps nativos (planejado, obrigatorio, entrega adiada)

> MOVIDO em 2026-09-26 (Pontin): os apps (RF-105 a RF-109, sprints P1-P3) sairam desta feature e viraram a ideia separada `pontindex-app` (`.forge/ideas/pontindex-app/`). Esta feature (pontindex) e SO o site. O texto abaixo fica apenas como historico.

- **RF-105** `[MUST - Fase 2]` O mesmo codigo/`dist/` da Fase 1 deve ser empacotado como app desktop Windows via Electron, gerando um instalador `.exe`.
- **RF-106** `[MUST - Fase 2]` O mesmo codigo/`dist/` da Fase 1 deve ser empacotado como app Android via Capacitor 8, gerando um `.apk` distribuivel sem Play Store.
- **RF-107** `[MUST - Fase 2]` Os apps Windows e Android devem usar a mesma camada de storage duravel definida em RF-95, adaptada ao ambiente nativo (arquivo proprio fora de cache), preservando os dados entre atualizacoes do app (mesmo requisito de RF-96, testado tambem nos apps).
- **RF-108** `[MUST - Fase 2]` Deve existir um atualizador automatico: um push no repositorio deve atualizar o site e, via pipeline de CI (GitHub Actions), gerar novos instaladores Windows/Android.
- **RF-109** `[MUST - Fase 2]` O botao "Baixar app" deve existir SOMENTE no site (nunca dentro dos proprios apps instalados), oferecendo duas opcoes de download: Android (.apk) e Desktop Windows (.exe); esse botao so deve aparecer quando os apps da Fase 2 estiverem prontos para distribuicao.

---

## 7. Requisitos Nao Funcionais

- **RNF-01 (Performance de lista)** `[MUST]` A listagem de Pokemon (1.027 especies) deve usar renderizacao virtualizada (apenas os itens visiveis no viewport sao montados no DOM), de forma que o scroll da lista completa nao trave a interface em hardware de celular de gama media. [ASSUMPTION: a IDEA pede "nao travar o celular" sem numero; meta operacional proposta = manter o scroll fluido (sem quedas perceptiveis de quadro) percebido em teste manual no Stage 5, ja que nao ha ferramenta de medicao de FPS especificada.]
- **RNF-02 (Animacoes por GPU)** `[MUST]` Toda animacao do app (transicoes, entrada de cards, marca d'agua, captura, brilho de cards Lendario/Mitico, raios giratorios) deve usar exclusivamente propriedades `transform` e `opacity`, nunca propriedades que disparam reflow/repaint pesado (ex. `width`, `top`, `left`, `box-shadow` animado), e deve respeitar o toggle/preferencia "Reduzir animacoes" (RF-92 a RF-94) desligando-se completamente quando ativo.
- **RNF-03 (Comportamento sem rede)** `[MUST]` Com a rede indisponivel, o app deve continuar funcional para 100% das telas exceto pelo artwork grande de Pokemon ainda nao cacheado (que cai para placeholder, RF-16); nao ha exigencia de service worker com estrategia offline-first completa alem do cache de artwork ja carregado e do proprio empacotamento de dados (RF-100 a RF-102); esta e uma consequencia da regra "dados 100% nativos", nao uma promessa formal de PWA offline, que a IDEA explicitamente marca como nao necessaria.
- **RNF-04 (Tamanho de bundle/midia)** `[MUST]` O volume total de midia empacotada (gritos de Pokemon, sons de UI/evolucao/shiny, texturas de item, sprites pequenos) deve ficar no orcamento ja aceito pelo usuario de aproximadamente **20 MB** (1.072 gritos ~16,5 MB + ~60 arquivos de UI/evolucao/shiny ~1,75 MB + ~1.100 texturas de item + sprites pequenos ~3 MB), compativel com o plano gratuito da Vercel.
- **RNF-05 (i18n)** `[MUST]` 100% das strings visiveis ao usuario na interface devem vir de um dicionario central chaveado (nunca hardcoded no meio do markup/JSX), cobrindo integralmente portugues e ingles; nenhuma tela pode ficar parcialmente traduzida.
- **RNF-06 (Persistencia duravel)** `[MUST]` Os dados locais (historico, time, capturados, progresso de treinadores, preferencias) devem sobreviver a: fechar e reabrir o navegador/app; limpar o cache do navegador sem limpar dados do site (quando aplicavel); atualizar para uma nova versao do app/site/instalador. Formato de armazenamento versionado (`schemaVersion`), nunca `localStorage` solto sem controle de versao.
- **RNF-07 (Temas e contraste)** `[MUST]` Em qualquer um dos 7 temas, os chips de tipo devem permanecer com cores vivas (nunca apagados/baixa opacidade) e o texto sobre qualquer fundo de card deve permanecer legivel; estados "nao selecionado" de filtros sao indicados por contorno, nunca por reducao de opacidade.
- **RNF-08 (Barra de rolagem customizada)** `[MUST]` Todo container com overflow (desktop e mobile) deve exibir uma barra de rolagem fina, com cantos arredondados, polegar na cor primaria do tema ativo e trilho transparente (sem fundo), nunca a barra padrao cinza do sistema operacional; trocar de tema deve trocar a cor da barra imediatamente.
- **RNF-09 (Responsividade)** `[MUST]` O app deve ter layout desktop redimensionavel com largura minima definida e layout mobile fixo em orientacao retrato; nenhum chip ou selo pode vazar ou quebrar de forma que deixe espaco vazio grande (validado a 360px e 390px de largura, conforme os bugs ja identificados e corrigidos no prototipo).
- **RNF-10 (Custo)** `[MUST]` Custo de operacao igual a zero: nenhuma chamada a API paga, nenhum servico pago, hospedagem no plano gratuito da Vercel.
- **RNF-11 (Privacidade)** `[MUST]` Nenhuma coleta de dados do usuario, nenhum analytics, nenhuma chamada de rede alem da PokeAPI (artwork em runtime; mecanica de golpes e sprites pequenos ja empacotados no build, decisao assumida item 8) e, no fluxo de Sincronizar, nenhuma chamada de rede (tudo local ao gerar/ler o codigo/QR).
- **RNF-12 (Camada de raios do card)** `[MUST]` A camada de raios giratorios atras do artwork no card principal da ficha deve ser maior que a area visivel do card (ou circular), de forma que nenhuma borda quadrada da camada apareca durante a rotacao lenta continua.

---

## 8. Criterios de Aceite

Cada criterio referencia o(s) RF/RNF que valida. Formato Dado/Quando/Entao (Given/When/Then).

**Navegacao (RF-01 a RF-04)**
- Dado que o usuario esta na ficha do Charizard, aba Golpes = TM, rolado ate a metade da tabela; quando ele clica em um item citado (ex. uma pedra) e depois clica em "Voltar"; entao a tela retorna exatamente ao Charizard, aba TM, na mesma posicao de rolagem.
- Dado que o usuario esta na tela de Dex com filtro "tipo Fogo" aplicado, rolado ate o meio da lista; quando ele abre um Pokemon e volta; entao a Dex reaparece com o mesmo filtro e a mesma posicao de rolagem.

**Busca (RF-05 a RF-08)**
- Dado o campo de busca vazio; quando o usuario digita "025"; entao o Pikachu aparece como resultado (mesmo resultado de "25" e "0025").
- Dado o idioma de interface em ingles; quando o usuario busca "pantano" sem acento (nome PT de Quagsire, verificado em `cobblemon.species.quagsire.name` no lang `pt_br.json` do Cobblemon: "Pântano" contra "Quagsire" em ingles); entao o Pokemon correto aparece independente do idioma de interface ativo, demonstrando tambem a busca sem diferenciar acentuacao (RF-06).

**Ficha e calculos (RF-15 a RF-35, incl. RF-21 e RF-110)**
- Dado o Charizard (Fogo/Voador) aberto; quando o usuario olha o painel de fraquezas; entao Pedra aparece com multiplicador **x4**.
- Dado a calculadora de stats com base 100, nivel 100, IV 31, EV 252, natureza neutra; quando o usuario calcula; entao o stat resultante e **299**; com uma natureza favoravel ao stat, o resultado e **328**; com uma desfavoravel, **269**.
- Dado um Pokemon aberto na calculadora de stats; quando o usuario olha a recomendacao de IV/EV (RF-110); entao os 2 stats base mais altos daquele Pokemon aparecem sugeridos com IV 31, sem que isso substitua os campos de entrada manual.
- Dado o Eevee aberto; quando o usuario ve a cadeia de evolucao; entao aparecem 8 ramos reais, cada um com o metodo especifico (ex. Espeon = amizade 160 + dia; Sylveon = amizade 160 + golpe de tipo Fairy conhecido), sem nenhuma legenda generica de "metodos possiveis".

**Capturados (RF-48 a RF-56, round-trip)**
- Dado um Pokemon nao capturado; quando o usuario clica "Capturei"; entao a animacao completa roda (fundo por categoria, silhueta crescendo, flash, revelacao com nome) e o Pokemon passa a aparecer na lista de Capturados.
- Dado um Pokemon ja capturado; quando o usuario recarrega o app (fecha e reabre o navegador ou reinstala uma nova build); entao ele continua aparecendo como capturado, sem nenhuma perda de dado (RNF-06).
- Dado um Pokemon capturado; quando o usuario o desmarca e depois marca de novo; entao a animacao de captura roda novamente por completo.
- Dado o dataset com 1.027 especies (incluindo Creepyon e Piglich); quando o usuario abre a lista de Capturados; entao o contador exibido usa o formato "X de 1.027", e as fichas de Creepyon/Piglich exibem o placeholder de silhueta de Pokebola como imagem principal (o jar `allthemons` nao tem sprite 2D dessas especies), com o aviso de que a imagem nao vem da PokeAPI.

**Time e Historico (round-trip, RF-38 a RF-47)**
- Dado um time com 6 Pokemon; quando o usuario tenta adicionar um 7; entao o sistema avisa "time cheio" e nao adiciona.
- Dado um time com Pokemon adicionados; quando o usuario recarrega o app; entao o mesmo time (mesma ordem, mesmos Pokemon) aparece na tela inicial.
- Dado um historico com 20 itens; quando o usuario abre a ficha de um 21 Pokemon diferente; entao o item mais antigo do historico desaparece e o novo aparece no topo; ao recarregar o app, o historico persiste identico.

**Treinadores (RF-57 a RF-62, RF-111, RF-124)**
- Dado a serie BDSP com nenhum treinador-chave derrotado; quando o usuario abre a tela de Treinadores; entao o cap exibido e **15**.
- Dado que o usuario marca Roark (BDSP) como derrotado; quando a tela recalcula; entao o cap exibido passa a **16** (nivel maximo do time de Mars).
- Dado o progresso de treinadores derrotados salvo; quando o usuario recarrega o app; entao os mesmos treinadores continuam marcados como derrotados e o cap calculado bate.
- Dado que nenhuma serie foi escolhida ainda; quando o usuario abre a tela de Treinadores pela primeira vez; entao o sistema pede para ele escolher manualmente qual serie esta acompanhando, entre as series desbloqueadas no dataset; a escolha nao depende do `initialSeries` do config do modpack, que o app nao le.
- Dado a serie `atm_team`, que exige a serie `bdsp` totalmente concluida; quando o usuario abre a lista de series antes de terminar a BDSP; entao `atm_team` aparece bloqueada, com o nome "bdsp" exibido como pre-requisito pendente; apos derrotar todos os treinadores-chave da BDSP, `atm_team` aparece desbloqueada.
- Dado a serie ativa escolhida e o progresso de treinadores derrotados salvos; quando o usuario fecha e reabre o app; entao a mesma serie continua marcada como ativa e o mesmo progresso/cap aparecem, sem precisar escolher de novo.
- Dado a BDSP com Gardenia recem-derrotada, liberando 3 treinadores-chave Cedric simultaneamente (time de cada um com nivel maximo 21 neste pack); quando o usuario olha o cap; entao o cap exibido e **22**: pela formula da decisao 9, o `trainerLevel` de cada Cedric e max(21, trainerLevel do prerequisito Gardenia = 22) = 22, e o cap e o MENOR entre os disponiveis = 22 (corrigido na rev 5: o valor anterior 21 ignorava a heranca do prerequisito).
- Dado um treinador-chave marcado como derrotado; quando o usuario o desmarca; entao o cap da serie e recalculado imediatamente, podendo descer para o valor anterior a essa vitoria.
- Dado que o usuario ainda nao concluiu nenhuma serie; quando ele abre o picker de series; entao "Modo Livre" aparece bloqueado (neste pack, `freeroamRequiresCompletedSeries = true`); dado que ele ja concluiu uma serie inteira (todos os treinadores-chave derrotados); quando reabre o picker; entao "Modo Livre" aparece desbloqueado e, ao ser selecionado, o cap passa a 100 e a serie anterior fica pausada (retomar reverte o cap ao valor anterior).

**Pokebolas (RF-63 a RF-65)**
- Dado a ficha de um Magikarp (tipo Agua) aberta; quando o usuario olha o painel "Melhor Pokebola"; entao a Net Ball aparece classificada acima da Poke Ball comum.

**Itens (RF-66 a RF-71)**
- Dado a ficha de um Pokemon com um drop de item; quando o usuario clica no item; entao abre a pagina daquele item com nome, descricao, imagem, categoria e "Como obter"; quando o usuario clica "Voltar"; entao retorna exatamente para a ficha do Pokemon de origem, na mesma posicao.
- Dado um item sem nenhuma rota de obtencao confirmada nos dados; quando sua pagina e aberta; entao a secao "Como obter" mostra "Sem rota confirmada", nunca uma rota inventada.

**Sincronizar (RF-72 a RF-78, negacao)**
- Dado um dispositivo A com progresso local; quando o usuario gera um codigo e escaneia/cola em um dispositivo B; entao B mostra um resumo do que sera aplicado e pergunta Mesclar ou Substituir antes de qualquer mudanca.
- Dado um codigo colado invalido/corrompido; quando o dispositivo tenta recebe-lo; entao o sistema exibe um erro claro e os dados locais do dispositivo permanecem exatamente como estavam antes (nenhuma alteracao parcial).
- Dado um progresso local grande (proximo de 1.027 capturados, historico e treinadores completos); quando o usuario gera o codigo de sincronizacao; entao o sistema usa o bitmap binario compacto e, se o payload nao couber em um unico QR, gera uma sequencia de QR codes numerados (multi-frame) ou oferece o fallback de copiar/colar um texto longo/arquivo; ao escanear todos os frames em ordem no outro dispositivo, o progresso e reconstruido de forma identica ao original.
- Dado um dispositivo A com 10 Pokemon capturados e a serie BDSP com Roark derrotado, e um dispositivo B com 5 capturados diferentes (sem sobreposicao) e nenhum treinador derrotado, time vazio em B e preenchido em A, e historico com itens diferentes em cada um; quando B recebe o codigo de A em modo Mesclar; entao B fica com 15 capturados (uniao), Roark continua derrotado (uniao de treinadores por serie), o time de B passa a ser o de A (porque o de B estava vazio), o historico de B mostra os 20 mais recentes somando os dois, e as preferencias de B (tema/idioma/som) permanecem as de B, exatamente conforme a regra de RF-78.

**Pokebolas condicionais (RF-64)**
- Dado a ficha de um Pokemon aberta; quando o usuario olha uma Pokebola cujo multiplicador depende de uma condicao externa (ex. Dusk Ball); entao o painel "Melhor Pokebola" mostra o multiplicador assumindo o melhor caso da condicao (ex. luz 0) junto com o texto da condicao ao lado (ex. "3x com luz 0"), deixando claro que o valor depende de o jogador cumprir aquela condicao no jogo.

**Backup (RF-98, round-trip)**
- Dado um dispositivo com historico, time, capturados, progresso de treinadores e preferencias configurados; quando o usuario exporta um backup e o importa em uma instalacao nova/limpa; entao todas as cinco entidades aparecem identicas a origem.

**Preferencias (RF-79 a RF-94, round-trip)**
- Dado o tema alterado para "Preto", idioma de interface para "Ingles", som desligado e "Reduzir animacoes" ligado; quando o usuario fecha e reabre o app; entao os quatro valores continuam exatamente como configurados (nenhum volta ao padrao).
- Dado o card de um golpe com toggle individual definido para "Ingles" enquanto a preferencia global de termos e "Portugues"; quando o usuario recarrega o app e reabre aquele mesmo card; entao o override individual daquele card persiste, e outros cards sem override seguem a preferencia global.

**Filtros e listagem (RF-11 a RF-14)**
- Dado a Dex completa; quando o usuario aplica o filtro de tipo "Fogo" e o filtro de geracao "1" ao mesmo tempo; entao a lista mostra somente Pokemon de tipo Fogo da geracao 1, e remover qualquer um dos dois filtros atualiza so a lista, sem recarregar a tela.
- Dado a Dex completa; quando o usuario aplica o filtro de metodo de evolucao "item"; entao so aparecem Pokemon cuja evolucao usa um item.

**Onde encontrar (RF-115)**
- Dado um Pokemon com mais de uma entrada de spawn (ex. Eevee, presente em ultra-rare, rare e uncommon); quando o usuario abre a secao "Onde encontrar"; entao todas as entradas aparecem listadas, cada uma com seu bioma, luz, horario, estrutura (se houver) e faixa de nivel.

**Identidade visual (RF-116 a RF-121, RNF-12)**
- Dado o layout mobile aberto; quando o usuario ve a tela inicial; entao a interface tem aparencia de Pokedex fisica (tampa, luz, botoes) e toca o beep de abertura (quando o som automatico estiver ligado).
- Dado um Pokemon de tipo Fogo aberto; quando o usuario compara o gradiente do card principal, o gradiente dos chips de tipo e o tom do card compacto do mesmo Pokemon na listagem; entao os tres usam o mesmo par de cores de `design/tipos/cores.json`.
- Dado um Pokemon Lendario aberto; quando o usuario ve o card principal; entao o card inteiro (nao so o selo) tem gradiente dourado com brilho e faiscas; dado um Pokemon Mitico, o card tem gradiente roxo-azul com brilho ciano; em ambos os casos o selo Lendario/Mitico continua visivel.
- Dado o card principal de qualquer Pokemon; quando a camada de raios gira devagar atras do artwork; entao nenhuma borda quadrada da camada aparece durante a rotacao (RNF-12).
- Dado "Reduzir animacoes" ativado; quando o usuario abre qualquer tela; entao a marca d'agua de Pokebola, o brilho/faiscas dos cards Lendario/Mitico e a rotacao dos raios ficam todos estaticos.

**Apagar dados e dados orfaos (RF-97, RF-122, RF-123)**
- Dado dados locais existentes; quando o usuario aciona "Apagar dados" em Configuracoes; entao o sistema pede confirmacao explicita do que sera apagado antes de executar qualquer exclusao.
- Dado um Pokemon capturado cujo id deixa de existir apos uma atualizacao do dataset empacotado; quando o usuario abre a lista de Capturados; entao esse registro nao aparece na lista nem e contado no "X de 1.027", mas o dado continua salvo no armazenamento local (nao e apagado automaticamente).

**Empacotamento e build (RF-100 a RF-104)**
- Dado o pacote de dados gerado pelo script de build; quando o app roda em um dispositivo sem o modpack instalado e sem internet; entao especies, spawns, fosseis, treinadores, itens, receitas, texturas, sons e mecanica de golpes (tipo/poder/precisao/categoria/PP) continuam disponiveis, e so o artwork grande ainda nao cacheado falha (RF-16).
- Dado o app aberto; quando o usuario vai em Configuracoes/Sobre; entao a versao do dataset empacotado aparece no formato "Dados: All the Mons 1.3.0 / Cobblemon 1.7.3".

**Qualidade tecnica (RNF-01, RNF-04, RNF-05, RNF-07, RNF-08, RNF-09)**
- Dado a lista completa de 1.027 Pokemon; quando o usuario rola rapidamente do topo ao fim; entao so os itens visiveis no viewport sao montados no DOM (lista virtualizada) e o scroll permanece fluido em um celular de gama media.
- Dado o pacote de midia final; quando o build e gerado; entao o total de gritos + sons de UI/evolucao/shiny + texturas de item + sprites pequenos fica proximo do orcamento de ~20 MB combinado.
- Dado qualquer tela do app; quando o usuario troca o idioma da interface; entao nenhum texto visivel fica no idioma anterior (100% das strings vem do dicionario central).
- Dado qualquer um dos 7 temas ativo; quando o usuario olha os chips de tipo e os filtros nao selecionados; entao os chips permanecem com cores vivas e os filtros nao selecionados sao indicados por contorno, nunca por opacidade reduzida.
- Dado qualquer container com scroll, em qualquer tema; quando o usuario rola o conteudo; entao a barra de rolagem aparece fina, arredondada, com trilho transparente e polegar na cor primaria do tema ativo (nunca a barra padrao do sistema operacional).
- Dado a tela mobile a 360px e 390px de largura; quando o usuario ve um selo de raridade ou um chip de tipo com nome longo (ex. "Ultra-raro", "Fighting"); entao nenhum selo quebra linha e nenhum chip vaza da borda do card.

**Migracao de dados (RF-96, teste obrigatorio do Stage 5)**
- Dado dados criados na versao N do app (historico, time, capturados, progresso de treinadores, preferencias); quando a versao N+1 e instalada por cima (Windows e Android nas Fases 2; nova build do site na Fase 1); entao todos os dados continuam intactos e legiveis.

**Persistencia atomica (RF-99)**
- Dado uma escrita de dados em andamento; quando o processo/app e encerrado abruptamente durante essa escrita; entao, na proxima abertura, os dados permanecem no ultimo estado consistente anterior (nunca corrompidos/parciais).

---

## Pontos em Aberto

O bloco "Decisoes assumidas" registra hoje **9 decisoes** (itens 1 a 9): 8 delas (1, 2, 3, 4, 6, 7, 8 e 9) sao decisoes de comportamento ja tomadas e refletidas nos Requisitos Funcionais, cada uma revisavel se o usuario pedir. Resta genuinamente nao resolvido, como pesquisa pendente (nao como decisao em aberto):

1. **Efeito exato de cada prato/curry de cozinha do Cobblemon 1.7** sobre o Pokemon (amizade, stats de montaria, efeitos de pocao). Nao bloqueia o restante do escopo de Itens & Comidas (RF-66 a RF-70): remedios, vitaminas e doces ja tem descricao oficial completa no lang e ja estao cobertos. Bloqueia apenas o nivel de detalhe numerico dos itens de cozinha especificamente, que e pesquisa adicional (wiki/testes no jogo) a fazer durante a implementacao, sem inventar numeros enquanto isso. [ASSUMPTION ja adotada, nao bloqueante: os itens de cozinha entram com a descricao oficial do lang (quando existir); o efeito numerico detalhado fica pendente de pesquisa adicional, documentado como tal na ficha do item ate ser confirmado.]
