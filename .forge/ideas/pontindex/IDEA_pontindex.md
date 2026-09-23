---
feature: pontindex
language: pt-BR
type: create
status: done
created: 2026-09-23
---

# IDEA - Pontindex

## 1. Objetivo

Pontin e os amigos estao jogando o modpack de Minecraft **All the Mons** (foco em Pokemon). Ele quer um app chamado **Pontindex**: uma Pokedex, com estetica de Pokemon, "simples pra usar entre amigos, nada demais", para consultar informacoes dos Pokemon enquanto jogam.

Nas palavras dele: "Quero que crie um app, com estetica do pokemon mesmo, o app tem q ser uma pokedex e ele deve ter um visual unico e responsivo para desktop e outro especificamente para mobile de forma com que o usuario tenha a melhor experiencia possivel."

Ele nao domina ainda a mecanica de stats/IV/EV e pediu que eu pesquisasse ("de uma pesquisada sobre isso ate para que voce entenda melhor").

## 2. Decisoes

- [2026-09-23] Nome do app: **Pontindex**.
- [2026-09-23] Plataformas: **PC (Windows) via Electron + Android via Capacitor**, um unico codigo web. iOS FORA do escopo (usuario nao tem Mac nem precisa).
- [2026-09-23] Electron sozinho nao roda em celular; a solucao combinada (web app + Electron + Capacitor) foi explicada e aceita.
- [2026-09-23] Ambiente Android ja instalado nesta sessao: SDK 36, build-tools 36.0.0, platform-tools, ANDROID_HOME. Sem Android Studio. Sem emulador (instalar so se pedido).
- [2026-09-23] Cores da Pokedex: tema padrao **vermelho e azul**; deve existir **preto, verde e varias outras cores**, cada uma com sua cor secundaria. O usuario alterna o tema no app.
- [2026-09-23] Dois layouts distintos: um para desktop (responsivo) e outro especifico para mobile.
- [2026-09-23] **Plug and play**: sem criacao de conta, sem login, sem servidor proprio. Abriu, usou.
- [2026-09-23] **Historico de pesquisa**: o usuario pode acessar o historico do que pesquisou; armazenado **localmente** no aparelho.
- [2026-09-23] **Animacoes**: o app deve ser "repleto de animacoes", agradavel aos olhos (transicoes, entrada de cards, abertura da Pokedex, etc.).
- [2026-09-23] **Todas as sugestoes de features entram** (usuario: "1- tudo"). Lista na secao 3.
- [2026-09-23] **"Poder maximo" = Base Stat Total (BST)**: a coluna "Total" da tabela do pokemondb.net que o usuario mostrou (Bulbasaur 45+49+49+65+65+45 = 318). Explicado ao usuario que BST nao e o stat no nivel 100; como a calculadora de stats tambem entra, o app mostra os dois (BST na ficha + stats maximos no nivel 100 na calculadora).
- [2026-09-23] **Dados so no aparelho de cada um**, nada compartilhado entre amigos.
- [2026-09-23] **Somente online**: nao precisa funcionar offline; depende de internet para falar com as APIs. Nenhum servidor proprio; "hospedado" na maquina/celular de cada um.
- [2026-09-23] **Idioma**: interface em **pt-BR** por padrao, com **opcao de alternar para ingles**. Motivo: eles jogam o jogo em ingles, entao habilidades, golpes e afins precisam poder ser vistos em ingles para bater com o jogo.
- [2026-09-23] **Idioma dos TERMOS DO JOGO e separado do idioma da interface** (usuario, 2026-09-23): cada card que mostra nomes de coisas do jogo (itens, biomas, golpes, habilidades, bolas, condicoes, treinadores/series, grupos de ovo, naturezas) tem um **toggle PT/EN proprio no cabecalho** que troca SO os termos daquele card; o resto do texto continua no idioma da interface. Preferencia global em Configuracoes ("Nomes do jogo em: Portugues / Ingles", padrao Portugues); a escolha por card e lembrada localmente. Motivo: jogam em ingles e precisam bater os nomes com o jogo sem trocar a interface inteira.
- [2026-09-23] **Historico guarda ate 20 itens, so informacao basica** (usuario).
- [2026-09-23] **Time de 6** Pokemon, nao lista livre de favoritos (usuario).
- [2026-09-23] **All the Mons versao 1.3.0** (usuario; confirmado no manifest da instancia). Instancia em `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`. Dataset do app gerado a partir dessa instancia (ver secao 7).
- [2026-09-23] **Versao do Cobblemon = 1.7.3** (a que o All the Mons dos amigos usa; usuario conferiu). Os dados do app devem ser puxados da tag `1.7.3` do GitLab do Cobblemon, nao da 1.8.1. Verificado em 2026-09-23: a tag existe; mesma estrutura de species/spawn/lang; 1.025 especies, 824 arquivos de spawn (vs 842 na 1.8.1), pt_br com 1.025 nomes, 932 golpes, 310 habilidades.
- [2026-09-23] **Drops e "Onde encontrar"** (biomas, luz, dia/noite, estruturas, faixa de nivel de spawn) entram na ficha (usuario).
- [2026-09-23] **Raridade**: bucket mais comum como raridade principal, demais buckets listados; selo proprio para Lendario e Mitico (usuario).
- [2026-09-23] **Historico sem apagar/limpar**: nao precisa (usuario). Rotaciona sozinho nos 20 itens.
- [2026-09-23] **Ordem das etapas aprovada**: (1) busca + ficha + tema + historico; (2) evolucao clicavel, golpes, habilidades, filtros, raridade, time de 6; (3) calculadoras, comparar, shiny, aleatorio, Pokedex com som (usuario: "ok").
- [2026-09-23] **Sistema de capturados** (usuario): na ficha de um Pokemon ha um botao "capturei"; o Pokemon entra na lista de capturados do usuario; existe uma tela que lista os capturados. Local, sem servidor.
- [2026-09-23] **Animacao de captura** (usuario, nas palavras dele): ao clicar em "capturei", a tela do app apaga; aparece um fundo com a cor da RARIDADE do Pokemon e somente a SILHUETA dele; a silhueta vem crescendo; a tela pisca branco bem rapido; o Pokemon aparece por completo, com o nome embaixo.
- [2026-09-23] **Fundos da animacao de captura** fornecidos pelo usuario (3 imagens AVIF, estilo "explosao" de quadrinho com raios saindo do centro), organizadas por mim em `design/capture/`: `bg-lendario.avif` (amarelo/laranja com raios), `bg-mitico.avif` (roxo/azul com brilho ciano), `bg-outros.avif` (azul com raios). A categoria do fundo e **Lendario / Mitico / Outros**, nao o bucket de spawn (premissa 17).
- [2026-09-23] **Pokebola** fornecida pelo usuario (`design/pokebola.webp`). Uso decidido por mim (usuario: "onde achar melhor"): icone do botao "capturei"; abertura da animacao de captura (balanca e abre antes da silhueta); icone do app (Windows e Android) e splash; indicador de loading girando.
- [2026-09-23] **Icones dos 18 tipos**: o usuario forneceu uma imagem unica (grade 6x3, 1400x700 AVIF, guardada em `design/tipos/_todos-os-tipos.avif`). O recorte em PNG ficou borrado e o usuario pediu qualidade melhor e SEM FUNDO. Solucao: os mesmos glifos em **SVG** (glifo branco, fundo transparente), do repositorio duiker101/pokemon-type-svg-icons (origem Dribbble "Pokedex iOS app"; sem licenca declarada; uso privado entre amigos), em `design/tipos/svg/<tipo>.svg`. Circulo colorido em CSS com a paleta `design/tipos/cores.json`. Preview em `design/tipos/preview.html`. Regra do usuario: todo chip de tipo mostra **icone + nome**, nome traduzido conforme o idioma e **sempre com inicial maiuscula** ("Fire", "Fogo"; nunca "fire"). Verificado renderizando os 18 com Playwright: identicos ao desenho do usuario e nitidos.
- [2026-09-23] **Feedback do usuario no prototipo v1** ("de resto eu gostei"): (a) chips de tipo compactos apareciam sem o glifo (bug); (b) NAO quer o fundo de raios girando atras do artwork na ficha; (c) as 3 imagens de fundo da captura (740x493) ficam borradas em tela cheia: recriar o mesmo visual em vetor (SVG/CSS), mantendo as imagens do usuario so como referencia de cor/estilo; (d) **fundo da area de conteudo = cor secundaria do tema, bem clara**, no lugar do branco (tema padrao: azul bem clarinho); mesma regra em todos os temas; cards continuam claros.
- [2026-09-23] **Feedback v2** ("gostei de tudo"): o fundo secundario ainda estava claro demais; deixar mais evidente (mais saturado, cards brancos continuam legiveis). E o usuario pediu **animacao no fundo da captura**: raios girando devagar, brilho central pulsando, relampagos piscando (lendario), faiscas flutuando (mitico), acelerando brevemente no flash de revelacao; so transform/opacity; respeita "reduzir animacoes". A rotacao continua proibida na FICHA segue valendo; no overlay de captura ela e desejada.
- [2026-09-23] **Feedback v2 (cont.)**: no tema escuro os chips de tipo ficaram apagados (corrigir: cores dos tipos sempre vivas em todo tema; estado "nao selecionado" nos filtros por contorno, nao por opacidade). E **todas as barras de scroll devem ser estilizadas** (finas, arredondadas, na cor do tema; nunca a barra cinza padrao do Windows), em todo container com overflow, **tanto no desktop quanto no mobile**, e com as cores vindas do **tema atualmente selecionado** (trocou o tema, trocou a barra): polegar fino e arredondado na cor primaria do tema, **trilho transparente (sem fundo)**.
- [2026-09-23] **Feedback v2 (cont.)**: nos cards compactos (historico, mobile e possivelmente desktop) os chips de tipo vazam/cortam na borda do card. Regra: chip nunca vaza do card, em qualquer idioma (nomes longos como "Fighting"/"Fantasma"); quebrar linha ou reduzir o chip.
- [2026-09-23] **Feedback v2 (cont.)**: selo de raridade "ULTRA-RARO" quebrava em duas linhas no card mobile, deixando um espaco vazio enorme. Regra: selos de raridade nunca quebram linha e cabem ao lado do numero da dex a 390px, em PT e EN.
- [2026-09-23] **Descricao dos golpes** entra na tabela de golpes (usuario perguntou; temos: `cobblemon.move.<golpe>.desc` em pt_br e en_us no lang do Cobblemon).
- [2026-09-23] **Nenhuma aba, filtro ou toggle recarrega a tela**: so o componente afetado atualiza (usuario reclamou das abas de golpes redesenhando a ficha inteira no prototipo). Requisito para a implementacao (React) e corrigido no prototipo.
- [2026-09-23] **Marca d'agua de Pokebola** girando devagar, com opacidade bem baixa, atras de toda a interface (usuario). Um elemento fixo, transform only, respeita "reduzir animacoes".
- [2026-09-23] **Feedback v4**: (a) marca d'agua da Pokebola **sem cor** (monocromatica, na cor do texto do tema) e com opacidade **ainda mais baixa**; (b) **card principal do Pokemon na ficha** deve seguir a referencia `design/referencias/card-pokemon-gradiente.png` (cards Vulpix/Ninetales com gradiente saturado e chamativo): gradiente pela cor do **tipo principal** do Pokemon, ex. Fogo = laranja para amarelo bem saturado, com um par de cores definido para cada um dos 18 tipos; os **chips de tipo** usam o MESMO par de gradiente saturado (uma paleta unica por tipo, compartilhada entre chip, card principal e tom dos cards compactos; registrada em `design/tipos/cores.json`). Excecao: Pokemon **Lendario** = card inteiro com gradiente **dourado** (metalico, com brilho que varre devagar e faiscas cintilando); **Mitico** = card com gradiente **parecido com o fundo de captura dos miticos** (roxo para azul com brilho ciano), tambem com brilho e faiscas. Selo Lendario/Mitico continua visivel; chips mantem o gradiente do tipo; respeita "reduzir animacoes"; (c) **so no tema Preto/Amarelo**: todos os cards com fundo **preto**, porque a cor atual do card se confunde com o fundo.
- [2026-09-23] **Correcao de entendimento sobre os raios da ficha**: os raios atras do artwork no card principal DEVEM girar devagar. A reclamacao original ("fundo ta girando") era porque, ao girar, apareciam as bordas quadradas da camada de raios. Regra: a camada de raios e maior que o card (ou circular) para que nenhuma borda apareca durante a rotacao. Gradientes de todos os tipos: ainda mais saturados.
- [2026-09-23] **Filtro no painel Fraquezas & resistencias** (usuario): seletor Todos / Fraquezas / Resistencias; padrao mostra os dois; atualiza so o painel.
- [2026-09-23] **Icones de interface: biblioteca Lucide** (usuario autorizou). Vale para o prototipo e para a implementacao (pacote `lucide-react`). Icones de tipo e Pokebola continuam sendo os assets proprios.
- [2026-09-23] **Secao "Como obter"** na ficha (usuario perguntou; pesquisa confirmou fontes): substitui o aviso "Nao nasce no mundo" por um bloco com o metodo, em camadas: evolucao, fossil, spawn adicionado pelo All the Mons, addon (Legendary Monuments / Raid Dens / breeding via Cobbreeding quando o egg group permite), fallback honesto. Dados do repo do All the Mons entram no pacote do app.
- [2026-09-23] **Breeding existe no All the Mons 1.3.0** (usuario confirmou: da para criar Pokemon no pasture). "Breeding" entra em "Como obter" quando o egg group nao e Undiscovered. Qual mod fornece o breeding (Cobbreeding nao esta nos jars): descobrir na implementacao lendo a instancia; o Just Enough Breeding 3.2.1 esta presente.
- [2026-09-23] **Novas secoes pedidas pelo usuario**: (a) **Treinadores para subir o level cap** (quem bater, em que ordem, times e niveis); (b) **Pokebolas**: o que cada uma faz e qual e a melhor para determinado Pokemon; (c) **Comidas e itens** para usar nos Pokemon: descricao, como usar. Fontes confirmadas na instancia (secao 7). Detalhes da regra do level cap e efeito das comidas: pesquisa em andamento.
- [2026-09-23] **PERSISTENCIA DOS DADOS LOCAIS E REQUISITO DURO** (usuario: "e muito importante que no app final as informacoes locais nao sejam perdidas, a nao ser que o usuario queira. Mesmo se ele atualizar o app ou algo do tipo as informacoes devem se manter"). Cobre: historico, time, capturados, progresso de treinadores (derrotados / cap), preferencias (tema, idioma, som). Implicacoes: (1) armazenamento duravel fora de cache: Windows = pasta de dados do usuario do app (sobrevive a reinstalar o .exe); Android = armazenamento interno do app (atualizacao por APK mantem); formato proprio versionado (SQLite ou JSON com `schemaVersion`), NAO localStorage solto; (2) migracoes de esquema a cada atualizacao, nunca apagar; (3) apagar so por acao explicita do usuario com confirmacao; (4) **exportar/importar backup** em Configuracoes (arquivo unico) para trocar de aparelho, reinstalar do zero ou levar do PC ao celular; (5) escrita atomica (arquivo temporario + troca) para nao corromper em fechamento brusco. Teste obrigatorio no Stage 5: instalar versao N, criar dados, instalar versao N+1 por cima, dados intactos (Windows e Android).
- [2026-09-23] **Itens & Comidas, escopo confirmado pelo usuario**: inclui doces de EXP (Rare Candy, Exp. Candy XS a XL), **doces de IV** (Cobblemon 1.7.3 tem: Health/Mighty/Tough/Smart/Courage/Quick Candy = +1 IV; Sickly/Weak/Brittle/Numb/Coward/Slow = -1 IV; confirmado no lang), vitaminas e Power items de EV, berries redutoras de EV, mints, Ability Capsule/Patch, medicina, evolucao, held items, batalha, cozinha, berries, iscas: "tudo que e interessante usar no proprio Pokemon". **Barra de pesquisa que busca pelo nome em portugues OU em ingles** ao mesmo tempo, sem acento, independente do toggle do card.
- [2026-09-23] **Evolucoes mostram o item exato** (usuario perguntou sobre as pedras): cada seta da cadeia exibe o metodo com o nome do item (Pedra do Trovao / Thunder Stone), amizade + hora, golpe de tipo, troca; nome segue o toggle PT/EN do card. Exemplo de ramificacao no prototipo: Eevee com 8 evolucoes (dados reais do Cobblemon). A cadeia mostra SO os metodos reais do Pokemon (a legenda generica "Metodos possiveis" do prototipo v1 confundiu o usuario e foi removida). **Formas** (Mega X/Y, Gmax) mostram o item necessario (Charizardite X/Y + Key Stone, via Mega Showdown), lido dos dados do addon no pack.
- [2026-09-23] **Selo de raridade no card principal**: fica no canto superior ESQUERDO da area do gradiente, oposto ao botao de shiny (superior direito); junto com o selo Lendario/Mitico quando houver. A faixa inferior do card fica so com chips de tipo e botoes (usuario).
- [2026-09-23] **Pagina individual de item + links** (usuario): todo item citado no app (bola no painel Melhor Pokebola, drop, pedra de evolucao, item de forma, mochila do treinador, cards de Itens/Pokebolas) e clicavel e abre a pagina do item com: nome (PT/EN), descricao oficial, imagem real, categoria, e **como obter** (so o metodo, sem mostrar crafting): craftavel (existe receita nos dados: Cobblemon 750 recipes), drop de Pokemon (indice invertido dos `drops` das especies, com % e link para a ficha), plantavel (biomas preferidos das berries/apricorns; mints em montanha), loot de estrutura (loot tables do Cobblemon + injecoes do pack em baus), pesca; se nada se aplica, "sem rota confirmada". Secao "Usado em" quando fizer sentido (pedra -> quais Pokemon evoluem com ela).
- [2026-09-23] **NAVEGACAO DINAMICA COM HISTORICO REAL (requisito fixo, usuario)**: "Voltar" sempre retorna EXATAMENTE para onde o usuario estava antes: mesma tela, mesmo Pokemon/item, mesma posicao de scroll, mesmas abas/filtros/toggles selecionados. Ex.: estou no Charizard, aba Golpes em TM, rolado ate os golpes, clico na Pedra do Fogo -> pagina do item -> Voltar -> Charizard, aba TM, mesma rolagem. Vale para qualquer profundidade (Pokemon -> item -> Pokemon que dropa -> item ...), para o botao Voltar do app, o botao fisico/gesto de voltar do Android e Alt+Seta no desktop. Implementacao: pilha de navegacao propria (rota + estado da tela + scroll) integrada ao roteador; nunca "voltar para a lista" generico.
- [2026-09-23] **Plano de encerramento da Stage 1** (usuario): apos ele ver a pagina de itens e aprovar a IDEA, o orquestrador anota TODO o contexto (IDEA completa, STATE, nota de retomada) e PARA. O desenvolvimento continua em uma NOVA sessao, comecando pelo PRD (`/forge --prd pontindex`).
- [2026-09-23] **SONS** (usuario perguntou apos aprovar; fonte = jar do Cobblemon 1.7.3, `assets/cobblemon/sounds/`, 2.776 .ogg, 38,8 MB; `sounds.json` com 2.408 eventos): **1.072 gritos de Pokemon** (`pokemon/<nome>/<nome>_cry.ogg`), Pokebola (`poke_ball.throw/shake/shake.critical/open/shut/capture_succeeded/bounce`), Pokedex do jogo (`item.pokedex.open/close/click/click_short/scan_open`), `gui/click`, `gui/levelup`, `evolution/*`, `shiny/*`. Plano: grito na ficha (botao + ao abrir), brilho no shiny, sequencia completa na animacao de captura (arremesso, 3 balancos, captura ou critica), abrir/fechar Pokedex ao entrar/sair do app, clique curto na navegacao, level up ao marcar treinador-chave derrotado (cap sobe), som de evolucao na cadeia. **Som LIGADO por padrao** (usuario, 2026-09-23, revoga a premissa 12); toggle para desligar, escolha persistida. Arquivos extraidos da instancia no build, como as imagens. **Tamanho medido**: 1.072 gritos = 16,5 MB (media 15 KB); bola + Pokedex + gui + evolucao + shiny = 1,75 MB (60 arquivos). Decisao (usuario perguntou se ficaria pesado; nao fica): **todos os gritos entram**; total de midia do app ~20 MB com as texturas. **Botao de grito no card principal** (usuario): um botao de alto-falante ao lado do shiny toca o grito do Pokemon; acao explicita, toca mesmo com o toggle global desligado (o toggle governa so os sons automaticos; padrao = ligado). Sons de UI usados: `item/pokedex/pokedex_open|close|click|click_short|scan_open`, `gui/click|levelup|levelup_start`, `poke_ball/poke_ball_throw_1-4|shake_1-4|shake_critical|open|shut|capture_succeeded`, `evolution/*`, `shiny/*`.
- [2026-09-23] **DADOS 100% NATIVOS NO APP (regra explicita, usuario)**: "quero que todas as informacoes estejam nativamente ja no app, porque o celular nao tem acesso aos mods". A instancia do All the Mons e lida UMA vez, no PC do usuario, em BUILD time, por um script que gera o pacote de dados (JSON + texturas + sons + lang PT/EN). Esse pacote vai dentro do .exe e do .apk. Em runtime o app NUNCA le mods, jars ou pastas do Minecraft; funciona sem o modpack instalado. Unica rede: artwork grande da PokeAPI (com cache local apos a 1a vez). Melhoria decidida: empacotar tambem os sprites pequenos da PokeAPI (96px, ~3 MB no total) no build, para lista/historico/time/capturados funcionarem sem internet. Atualizacao do pack = novo build no PC + novo instalador para os amigos.
- [2026-09-23] **ENTREGA EM FASES: SITE PRIMEIRO, APPS DEPOIS** (usuario, decisao final do dia, SUPERSEDE a ordem "Electron + Capacitor" como primeira entrega): Fase 1 = **site estatico (PWA) na Vercel, sem backend** (plano gratuito; dados, imagens e sons empacotados no build e commitados no repositorio; dados locais do usuario em IndexedDB com armazenamento persistente + exportar/importar backup; PokeAPI chamada do navegador). Fase 2 = SO DEPOIS de o site estar finalizado: apps **Windows (.exe, Electron)** e **Android (.apk, Capacitor)** a partir do MESMO codigo, com atualizador automatico (um push atualiza site e apps; GitHub Actions gera os instaladores). **Botao "Baixar app"**: existe SOMENTE no site, aparece quando os apps estiverem prontos, com duas opcoes: Android e Desktop Windows; os apps nao mostram esse botao. Camada de armazenamento isolada atras de uma interface unica (web = IndexedDB; apps = arquivo proprio conforme o requisito de persistencia). Sem backend em nenhuma fase.
- [2026-09-23] **SINCRONIZAR (codigo de transferencia, sem banco)** (usuario): botao "Sincronizar" nos menus (site e apps) abre uma tela com (1) explicacao de como funciona, como fazer e o que esperar (e manual; e uma foto do progresso naquele momento; nao e automatico), (2) "Gerar codigo": o aparelho comprime o progresso local (capturados, time, historico, treinadores derrotados, preferencias) em um QR code + codigo curto de texto copiavel, tudo no navegador, sem servidor, (3) "Receber codigo": escanear o QR (camera) ou colar o texto; ao receber, o app mostra um resumo e pergunta se quer MESCLAR (uniao; padrao) ou SUBSTITUIR. Serve para levar o progresso do PC ao celular e vice-versa.
- [2026-09-23] **AMIGOS** (usuario): aba "Amigos" onde voce recebe o QR/codigo de um amigo e passa a ver **os Pokemon que ele capturou** (e, se ele quiser compartilhar, time e progresso de treinadores). O codigo do amigo e uma foto do momento: para atualizar, recebe o codigo de novo. Lista de amigos local (nome + data da ultima sincronizacao), remover amigo, comparar "tenho / ele tem / falta nos dois". Sem conta, sem servidor: o amigo gera o codigo no app dele e manda por WhatsApp ou mostra o QR. Conteudo do codigo: nome do jogador, ID fixo, capturados, time atual e progresso de treinadores, SEMPRE (decisao posterior do usuario: sem opcao de privado).
- [2026-09-23] **NOME DO TREINADOR NA PRIMEIRA ABERTURA** (usuario): antes de a Pokedex abrir pela primeira vez, uma tela pede o nome do jogador (obrigatorio; editavel depois em Configuracoes). Esse nome vai dentro do codigo de transferencia e aparece na lista de Amigos de quem te adicionar.
- [2026-09-23] **Compartilhamento sem opcao de privado** (usuario, revoga a privacidade opcional de Amigos): o codigo SEMPRE inclui capturados, time atual e progresso de treinadores. Nao existe opcao de esconder.
- [2026-09-23] **Identidade fixa por pessoa** (usuario perguntou "cada um ter um codigo fixo pra nao precisar pedir pra sincronizar"): SEM servidor, um codigo fixo so pode ser IDENTIDADE, nao canal de dados: nao ha de onde o app buscar o progresso do amigo. Decisao: cada instalacao gera um **ID fixo** (gerado na primeira abertura, guardado com os dados locais e incluido no backup) que vai em todo codigo de transferencia; ao receber um codigo novo do mesmo ID, o app ATUALIZA o amigo existente (sem duplicar, sem pedir nada). Mas o progresso continua viajando por codigo/QR a cada atualizacao; sincronizacao automatica exigiria banco/armazenamento remoto (fora do escopo).
- [2026-09-23] **PROTOTIPO APROVADO** (usuario: "Tudo aprovado, achei incrivel"). `design/prototipo/` v9 (commit eb197ca) e a referencia visual oficial.
- [2026-09-23] **Silhueta** da captura = artwork oficial do Pokemon (PokeAPI) totalmente preta, estilo "quem e esse Pokemon?" (usuario: ok).
- [2026-09-23] **Animacao de captura pode ser pulada com um toque** (usuario).
- [2026-09-23] **Pasta de referencias** criada a pedido do usuario: `design/referencias/` (desktop/, mobile/, LEIA-ME.txt). Como ele nao achou referencias, pediu um prototipo HTML proposto por mim (ver secao 9).
- [2026-09-23] **Animacoes: o maximo possivel, SEM deixar o app lento** (usuario). Restricao de performance explicita: animacoes por GPU (transform/opacity), sem travar o celular.
- [2026-09-23] **Premissas 1 a 16 da secao 11 aceitas em bloco** (usuario: "concordo com tudo").
- [2026-09-23] **Custo zero**: nenhuma API paga; so fontes gratuitas (PokeAPI, dados publicos do Cobblemon).

## 3. Escopo

**Dentro:**
- Navegacao dinamica com historico real (Voltar restaura tela, item, abas e scroll exatos; ver decisao na secao 2).
- Busca de Pokemon por **nome** e por **numero**.
- Ficha do Pokemon com o maximo de informacao possivel: nomes, evolucoes, **nivel para evoluir no All the Mons**, tipos, resistencias e fraquezas.
- "Poder maximo de cada pokemon" (definicao exata: ver Pontos em aberto).
- Troca de tema de cores.
- Layout desktop + layout mobile.
- Historico de pesquisa (local).
- Alternar idioma pt-BR / ingles.
- Animacoes por todo o app.
- Sugestoes aceitas em bloco ("tudo"):
  - Calculadora de efetividade (meu Pokemon x adversario: x2, x4, x0.5, x0).
  - Cadeia de evolucao completa e clicavel, com nivel/metodo de cada etapa.
  - Filtros na listagem: tipo, geracao, metodo de evolucao.
  - Golpes por nivel (tipo, poder, nivel em que aprende).
  - Habilidades com descricao, incluindo habilidade oculta.
  - Stats visuais (barras dos 6 stats base + Total/BST).
  - Favoritos / "meu time" (local, sem servidor).
  - Autocomplete na busca.
  - Comparar dois Pokemon lado a lado.
  - Sprite shiny com toque para alternar.
  - Aparencia de Pokedex de verdade no mobile (tampa, luz, botoes, som de beep ao abrir).
  - Pokemon aleatorio ("me surpreenda").
  - Calculadora de stats com IV/EV/natureza informados pelo jogador (mostra stats no nivel escolhido e no nivel 100).
- Sistema de capturados: botao "capturei" na ficha + lista de capturados + animacao de captura (fundo por raridade, silhueta crescendo, flash branco, revelacao com nome).

**Fora / nao fazer:**
- iOS.
- Criacao de conta, login, perfis.
- Servidor/backend proprio; qualquer dado compartilhado entre amigos.
- Modo offline (o app depende de internet).
- Qualquer API ou servico pago.

## 4. Superficie de regressao

Projeto novo, sem codigo anterior. A partir da primeira versao instalada, a superficie de regressao passa a ser **os dados locais dos usuarios**: toda versao nova deve abrir os dados da anterior sem perda (ver decisao de persistencia na secao 2).

## 5. Papeis e permissoes

Sem papeis. App de consulta, sem conta; todo mundo ve a mesma coisa. Confirmado pelo usuario (plug and play).

## 6. Entidades e ciclo de vida

Pokemon, golpes, habilidades, tipos: somente leitura (vindos das APIs).
Dados locais criados pelo usuario (sem servidor, guardados no aparelho):
- **Historico de pesquisa**: criado automaticamente a cada busca; guarda **ate 20 itens** (o mais antigo sai quando entra o 21o); **so informacao basica** por item (numero, nome, sprite, tipos), sem duplicar a ficha; listado; sem edicao; sem apagar/limpar (usuario: nao precisa).
- **Meu time**: **time de 6** Pokemon (limite do jogo); adicionar, remover, listar; ao tentar o 7o, avisar que o time esta cheio.
- **Amigos**: adicionar (por codigo/QR), atualizar (novo codigo), remover, listar; dados do amigo sao snapshot local. **Codigo de transferencia**: gerar, receber (mesclar/substituir).
- **Itens**: somente leitura; pagina individual; navegacao item <-> Pokemon nos dois sentidos (drop de / evolui com).
- **Capturados**: marcar como capturado pela ficha (botao "capturei", dispara a animacao de captura); listar capturados; (a confirmar) desmarcar; (a confirmar) contador "X de 1.025" e filtro "so capturados / so faltando"; sem limite.
- **Perfil**: nome do jogador (pedido na 1a abertura, editavel) e ID fixo da instalacao (gerado na 1a abertura, nunca muda, entra no backup).
- **Preferencias**: tema de cores, idioma. Persistem entre aberturas do app.
Round-trip: ao reabrir o app, historico, favoritos e preferencias carregam do armazenamento local.

## 7. Regras de negocio e exemplos

Pesquisa feita em 2026-09-23 (fontes no fim da secao):

- **All the Mons** = modpack oficial da equipe ATM (CurseForge), Minecraft 1.21.1 + NeoForge, All the Mods 10 + **Cobblemon**. O mod de Pokemon e o Cobblemon. Quantidade exata de Pokemon/addons do pack: nao confirmado.
- **Cobblemon** cobre todos os 1.017 Pokemon; os dados de cada especie (stats base, tipos, evolucoes com `minLevel`, golpes) sao JSON publicos no GitLab oficial (gitlab.com/cable-mc/cobblemon). **As condicoes de evolucao NAO sao sempre iguais aos jogos oficiais** (o Cobblemon reimplementa; alguns usam gatilhos do Minecraft). Logo, o "nivel para evoluir no All the Mons" deve vir dos JSON do Cobblemon, nao da PokeAPI.
- **Tabela de tipos**: 18 tipos, x2 / x0.5 / x0 e multiplicacao em dual-type (x4, x0.25). PokeAPI expoe em `type/{name}` (`damage_relations`).
- **Stats** (jogos oficiais): 6 stats base por especie; IV 0-31 por stat; EV 0-252 por stat, 510 total, 4 EV = +1 ponto no nivel 100; 25 naturezas (20 dao +10%/-10%, 5 neutras).
  - HP = floor((2*Base + IV + floor(EV/4)) * Nivel / 100) + Nivel + 10
  - Outros = floor((floor((2*Base + IV + floor(EV/4)) * Nivel / 100) + 5) * Natureza)
  - Exemplo confirmado: base 100, nivel 100, IV 31, EV 252 -> 328 (natureza neutra) ou 361 (natureza favoravel).
  - Cobblemon usar exatamente as mesmas formulas: amplamente reportado, NAO confirmado em fonte primaria.
- **PokeAPI**: gratuita, sem chave, CORS liberado, sem rate limit explicito (pede cache local). Endpoints: `pokemon/{id}` (stats, sprites, tipos), `pokemon-species/{id}` (nomes localizados), `evolution-chain/{id}`, `type/{name}`. Dataset offline em CSV no repo oficial (`data/v2/csv/`).
- **Capacitor + Electron** no mesmo Vite/React: viavel, uma unica pasta `dist/` consumida pelos dois; separar bem os scripts de build; abstrair APIs nativas atras de uma camada comum. Capacitor 8 + Electron especificamente: sem relatos, testar no projeto.

Pesquisa 2 (2026-09-23), fontes de dados gratuitas:

- **All the Mons NAO tem API nem dataset proprio** (confirmado: pagina CurseForge, changelog, discussao oficial no GitHub). E um modpack; os dados de Pokemon sao do Cobblemon.
- **Cobblemon GitLab** (gitlab.com/cable-mc/cobblemon, licenca MPL-2.0):
  - Species: `common/src/main/resources/data/cobblemon/species/generation1/bulbasaur.json`. Campos confirmados: `primaryType`, `secondaryType`, `abilities` (`h:` = oculta), `baseStats` (hp, attack, defence, special_attack, special_defence, speed), `moves` (prefixos `nivel:`, `egg:`, `tm:`), `evolutions[]` com `variant` (ex. `level_up`), `result`, `requirements[].minLevel`.
  - Raridade de spawn: `common/src/main/resources/data/cobblemon/spawn_pool_world/0025_pikachu.json` (padrao `NNNN_nome.json`). Campo `bucket` em cada entrada de `spawns[]`: **common / uncommon / rare / ultra-rare**. Uma especie pode ter varias entradas em buckets diferentes (Eevee aparece em ultra-rare, rare e uncommon). Pesos padrao (fonte comunitaria, nao verificada no config): common ~94,3%, uncommon ~5,0%, rare ~0,5%, ultra-rare ~0,2%. Regra de exibicao (a confirmar): mostrar o bucket MAIS COMUM em que a especie aparece, e listar os demais.
  - Raw via HTTPS funciona (200 OK), mas **SEM CORS**: o navegador nao consegue buscar direto em runtime. Consequencia: os JSON do Cobblemon precisam ser **empacotados no app em build-time** (script baixa do GitLab fixando uma TAG de release, ex. `1.8.1`, nunca `main`).
  - Versao do Cobblemon no All the Mons: pack 0.16.0-beta (abril/2026) usava Cobblemon 1.7.3; pack 1.0.0 (atual) nao lista no changelog. Cobblemon standalone esta em 1.8.1 (2026-09-13). **Nao confirmado** qual build o pack 1.0.0 embala; conferir no launcher do usuario / manifest do pack.
- **PokeAPI**: CORS confirmado (`Access-Control-Allow-Origin: *`); idioma **pt-br existe** (id 13) alem de en, es, fr, de, it, ja, ko, zh, cs. Sem campo de raridade: so `is_legendary`, `is_mythical`, `is_baby`, `capture_rate` (3 a 255). Testado em 2026-09-23: Pikachu capture_rate 190, Mewtwo 3 e legendary, Mew mythical.
- Sites comunitarios (cobblemon.tools, cobblemonspawns.com, cobblemondex.com, cobbledex no GitHub): nao oficiais, CORS nao confirmado; NAO usar como fonte principal.
- **Estrategia recomendada (custo zero)**: dados do Cobblemon (species + spawn) empacotados no build a partir de uma tag fixa; PokeAPI em runtime para nomes/descricoes traduzidos, sprites/artwork e o que o Cobblemon nao tiver. App 100% client-side, sem servidor.

Inspecao direta dos dados do Cobblemon 1.8.1 (2026-09-23, arquivos baixados do GitLab, tag 1.8.1):

- **1.025 especies** (gen1 151, gen2 100, gen3 135, gen4 107, gen5 156, gen6 72, gen7 86, gen7b 2, gen8 89, gen8a 7, gen9 120), um JSON por especie.
- Campos por especie: `nationalPokedexNumber`, `name`, `primaryType`/`secondaryType`, `maleRatio`, `height`, `weight`, `labels` (ex. `gen1`, `legendary`, `restricted`), `abilities` (`h:` = oculta), `eggGroups`, `baseStats`, `evYield`, `baseExperienceYield`, `experienceGroup`, `catchRate`, `eggCycles`, `baseFriendship`, `drops` (itens que o Pokemon dropa no Minecraft, com %), `moves` (`nivel:golpe`, `egg:`, `tm:`, `tutor:`), `evolutions`, `forms` (Mega-X, Mega-Y, Gmax, regionais), `preEvolution`, `behaviour`, `hitbox`, `baseScale`, `shoulderMountable`, `riding`.
- Evolucoes cobrem metodos alem de nivel: `item_interact` (pedras, ex. Eevee + thunder_stone), `level_up` com `requirements` (`level.minLevel`, `friendship.amount`, `time_range` day/night, `has_move_type`), `trade`, etc. Exemplo real: Eevee -> Espeon = friendship 160 + dia; Eevee -> Sylveon = friendship 160 + golpe do tipo fairy.
- Os `moves` das especies trazem SO o nome e o nivel. Tipo/poder/precisao do golpe NAO estao nos species (ficam no showdown.zip do Cobblemon); usar a PokeAPI (`move/{name}`) para esses detalhes.
- **Spawn**: 842 arquivos em `spawn_pool_world` (so 842 das 1.025 especies aparecem no mundo; ex. Mewtwo e Lucario NAO tem spawn natural em 1.8.1, retornam 404). Cada entrada: `bucket`, `level` (faixa, ex. "5-33"), `weight`, `condition` (biomas, luz, ceu, estruturas). Eevee real: ultra-rare, rare e 3x uncommon.
- **Traducao pt_br oficial do Cobblemon** (`assets/cobblemon/lang/pt_br.json`, ~930 KB): nomes das 1.025 especies, 1.459 descricoes de Pokedex, 934 golpes, 314 habilidades, tipos, naturezas, egg groups, com descricoes. Exemplo: Overgrow = "Supercrescimento", Tackle = "Investida", Grass = "Planta". O mesmo existe em `en_us.json`. Isso cobre o toggle pt-BR/EN sem depender da PokeAPI para texto.
- Consequencia pratica: quase tudo que o app precisa vem do proprio Cobblemon (empacotado). A PokeAPI fica para: imagens/artwork/sprites, tipo/poder/precisao dos golpes, e cadeia de evolucao "oficial" se quisermos comparar.

Pesquisa 3 (2026-09-23), "como obter" Pokemon sem spawn natural:

- **Repositorio oficial do All the Mons** (github.com/AllTheMods/All-the-Mons) contem os arquivos reais do pack (`config/`, `kubejs/`). Em `kubejs/data/cobblemon/spawn_pool_world/` ha **23 JSONs que ADICIONAM spawn natural** a especies sem spawn no Cobblemon base (Jirachi, Manaphy, Shaymin, Tornadus, Thundurus, Landorus, Diancie, os 4 Tapu, Necrozma, Zeraora, Kubfu, Zarude, Ogerpon, mais variantes de Rockruff/Lycanroc, Basculin/Basculegion, Greavard/Houndstone, Ursaluna). Mesmo formato do Cobblemon (bucket, nivel, condicao com tags de bioma custom `#legendary_spawns_ccc:*`). Tambem: `species_additions/` (Meltan), `loot_table/injection/chests/` (Pokebolas em baus de estruturas vanilla), estruturas custom do Cobblemon Extra Structures.
- **Addons do pack que afetam obtencao** (confirmados por pastas de lang/assets no repo): Complete Cobblemon Collection w/ Legendary Spawns (base dos spawns custom), **Legendary Monuments** (estruturas/altares + item para invocar lendarios/miticos, ex. Distortion World/Giratina, Hall of Origin + Azure Flute/Arceus), **Raid Dens** (raids em dimensao propria; loot pode dar lendarios), **Cobbreeding** (breeding: pasture vira incubadora; egg group `undiscovered` bloqueia, ex. Mewtwo), Mega Showdown (so formas de batalha, nao afeta obtencao), Extra Structures, Battle Tower, Quests, etc.
- **Cobblemon 1.7.3 base**: sem breeding, sem troca com NPC, sem loot de estrutura nativo. Mecanismos derivaveis dos dados: **evolucao** (`preEvolution`, ex. Lucario <- Riolu) e **fosseis** (`data/cobblemon/fossils/*.json`, 14 especies, ex. `{"result":"aerodactyl","fossils":["cobblemon:old_amber_fossil"]}`).
- **Estrategia da secao "Como obter"** (ordem de confianca): (1) evolucao a partir de pre-evolucao com spawn; (2) fossil (item exato); (3) spawn adicionado pelo proprio All the Mons (ler os 23 JSONs do repo do pack: mostrar bioma/condicao real); (4) addon com mecanica de estrutura (texto curto fixo por addon: "via Legendary Monuments" / "via Raid Dens"); (5) fallback honesto: "sem rota confirmada no All the Mons". Consequencia: os dados empacotados no build passam a incluir tambem o `kubejs/data/cobblemon/` do repo do All the Mons (fixado em uma tag/commit).

Inspecao da INSTANCIA LOCAL do usuario (2026-09-23), `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`:

- **All the Mons 1.3.0** (manifest.json), Minecraft 1.21.1, **398 mods**, Cobblemon 1.7.3 confirmado pelo jar.
- **Fontes de dados Cobblemon efetivas no pack** (arquivos `data/cobblemon/{spawn_pool_world,species,species_additions,fossils}` por jar): Cobblemon 1.864; **complete-cobblemon-collection-myths-and-legends-compat** 326 (spawns/adicoes de lendarios); mega_showdown 198 (formas); **allthemons-0.6.2.jar** 16 (especies custom Creepyon #9902 e Piglich, spawn de Staryu/Creepyon, e **`fossils/mewtwo.json`: Mewtwo e revivido na maquina de fosseis a partir de `allthemons:pika_star` ou `allthemons:ancient_dna_sample`**); zamega 13; legendarymonuments 12. Mais `kubejs/data/cobblemon/`: 21 spawns extras (ex. Jirachi ultra-rare nivel 60-80 em bioma `#legendary_spawns_ccc:jirachi`), 1 species_addition, loot tables; e `kubejs/data/legendary_spawns_ccc/` com 21 tags de bioma.
- Addons relevantes presentes: Legendary Monuments 8.1, Raid Dens 0.11.7, Ultra Wormholes 1.1.1 (Ultra Beasts), Mega Showdown 1.9.9, ZA Mega, Cobbleloots, Lootrmon, Summoning Rituals, Extra Structures 1.3.0, Battle Tower, Cobblenav, Cobblepedia, Just Enough Breeding 3.2.1. **Cobbreeding NAO esta na lista**; so o Just Enough Breeding (sem dependencia declarada). Se breeding existe no pack: NAO confirmado; perguntar ao usuario.
- **Decisao de dados**: o pacote de dados do app deve ser gerado por um script que le a INSTANCIA LOCAL (jars em `mods/` + `kubejs/data/` + `config/cobblemon/`) e mescla tudo em um dataset unico, fixado na versao 1.3.0 do pack. Isso captura Cobblemon + todos os addons + os ajustes do proprio pack (algo que GitLab/GitHub sozinhos nao dao). Cobblemon 1.7.3 do GitLab fica como fallback/verificacao.

Inspecao 2 da instancia (2026-09-23): TREINADORES, POKEBOLAS, ITENS

- **Treinadores / level cap = mod Radical Cobblemon Trainers** (`rctmod-neoforge-1.21.1-0.18.1-beta.jar` + rctapi 0.15.2 + "Radical Gyms Structures"). Dados no jar: **1.559 times de treinador** (`data/rctmod/trainers/<id>.json`: nome, identidade, `team[]` com especie/nivel/genero/habilidade/moveset, bag, battleRules) e **282 definicoes de spawn** (`data/rctmod/mobs/trainers/`: `type` = normal 128, rival 48, leader 24, e4 16, team_rocket 16, champ 14, team_galactic 10, team_shadow 10, battleground 8, ligh_of_ruin 8; `optional` true 172 / **false 110 = treinadores-chave**; `requiredDefeats` = lista de listas com os pre-requisitos (cadeia de progressao); `series` = radicalred 53, bdsp 53, unbound 66; `signatureItem`; biomas). Exemplo real da cadeia Radical Red: Brock (nivel max 14) -> Archer (21) -> Terry (21) -> Misty (27) -> Brendan (29) -> Lt. Surge (34) -> Erika (44) -> Giovanni (46)... Nao existe campo de "reward level cap" nos arquivos; a regra de como o cap sobe fica no codigo do mod (pesquisa em andamento). Config `rctmod-server.toml`: `initialLevelCap = 15`, `relativeLevelCap = 0`, `initialSeries = "empty"`.
- **O pack adiciona treinadores proprios** em `kubejs/data/rctmod/`: series `atm_team` (requer a serie bdsp, dificuldade 9) e `contentcreators`; tipos `team_allthemods_{trainer,custom_gym,elite_gym,wandering}` e `contentcreators`; ~40 treinadores (Notch, Direwolf20, ChosenArchitect, etc., times nivel 100) com 60 definicoes de spawn e 30 loot tables. rctmod tem lang **pt_br** (titulos de series/tipos).
- **Pokebolas (Cobblemon 1.7.3)**: 51 bolas, cada uma com **tooltip oficial em EN e PT** no lang (ex. Net Ball "3x em Agua ou Inseto"; Dusk Ball "3.5x em luz 0, 3x em luz 1-7"; Fast Ball "4x em base Speed >= 100"; Heavy Ball "1x a 4x pelo peso"; Love Ball "2.5x genero oposto, 8x se mesma especie"; Beast Ball "5x em Ultra Beasts, 0.1x no resto"; Master/Ancient Origin "captura garantida"; Friend/Luxury/Heal com efeitos pos-captura; bolas de apricorn coloridas = 1x). Com isso o app pode calcular a **melhor bola para cada Pokemon** (por tipo, peso, velocidade base, nivel, hora/luz, se esta na Pokedex, se e Ultra Beast) e mostrar a lista ordenada.
- **Itens de uso no Pokemon**: 932 itens no lang, **430 com tooltip de descricao** (EN + PT): remedios (Potion, Revive, Ether, Antidote...), vitaminas de EV (Protein +10 Atk EV, HP Up, Calcium...), Power items (+8 EV ao ganhar exp), Rare Candy / Exp. Candy XS-XL, PP Up, Ability Capsule/Patch, pedras e itens de evolucao (Link Cable, Metal Coat...), itens de batalha X, held items (Everstone, Eviolite, Light Ball...). Tudo derivavel do lang do Cobblemon.
- **Comida / cozinha (Cobblemon 1.7)**: 76 `seasonings` (ingrediente -> cor/sabor), receitas de Poke Puff (Frosted/Fancy/Deluxe), Cream Puff, Poke Cake, Poke Snack, Berry Juice, Aprijuice (7 cores), Leek and Potato Stew, Smoked Tail Curry, Open-faced Sandwich, Lava Cookie; qualidades plain/tasty/delicious. 78 `spawn_bait_effects` (iscas: ex. Aguav Berry = 50% de chance de natureza com foco em Sp. Def). 70 `berries` com dados de plantio (bioma preferido, mulch, tempo de crescimento). O que cada prato faz ao Pokemon: pesquisa em andamento (wiki).
- **Regra do level cap (doc oficial do RCT 0.18, srcmc.gitlab.io/rct/docs)**: Pokemon no nivel do cap ou acima NAO ganham exp; treinadores recusam batalha se o time do jogador tiver Pokemon acima do cap. Para subir o cap, o jogador derrota os **treinadores-chave em ordem**; o cap = **nivel do Pokemon mais forte do proximo treinador-chave** da serie ativa, mais `relativeLevelCap` (no pack = 0, sem folga). `initialLevelCap` = 15 (piso). `requiredDefeats` e AND entre as sublistas e OR dentro de cada sublista. Series escolhida na **Trainer Association**; o item **Trainer Card** aponta quem e o proximo treinador-chave. `initialSeries = "empty"`: comportamento exato nao confirmado (modo livre).
  - **Regra VALIDADA com dado real + memoria do usuario** (2026-09-23): cadeia BDSP calculada dos arquivos da instancia (43 treinadores-chave): Roark (max 14) -> Mars (16) -> Jupiter (20) -> Gardenia (22) -> Cedric x3 (21) -> Maylene (30) -> Wake (30) -> Cedric x3 (31) -> Fantina (36)... O usuario lembra "cap inicial 15, depois do Roark vai a 16, depois 20": bate exatamente com cap = nivel max do PROXIMO treinador-chave (cap inicial = max(initialLevelCap 15, exigencia do primeiro)). Exemplo canonico para o PRD/SPEC e para os testes.
  - **Item de spawn do treinador (signatureItem)** (usuario pediu em 2026-09-23): 116 treinadores do mod tem `signatureItem` (110 chave; ex. Brock = `cobblemon:hard_stone`; os do pack usam `allthemodium:allthemodium_ingot`, `allthemodium:unobtainium_block`, `minecraft:white_concrete`). Uso (doc oficial, pagina Blocks): o bloco **Trainer Spawner** e craftavel; o jogador clica nele com o signature item e o bloco passa a spawnar aquele treinador naquele ponto (aceita varios itens; com redstone forca o spawn ignorando condicoes; nunca duplica um treinador ja vivo no mundo). O Trainer Card mostra o item na aba "Spawning". O app mostra em cada treinador-chave: o item (chip clicavel -> pagina do item) e a instrucao "use no Trainer Spawner", alem dos biomas de spawn natural.
  - Consequencia para o app: a secao Treinadores mostra, por serie, a cadeia de treinadores-chave em ordem com o **cap que cada vitoria libera** (= nivel max do time do proximo), o time de cada um (especie, nivel, golpes, habilidade), tipo (lider/E4/campeao/rival/chefe) e bioma de spawn. Tudo calculado dos JSON locais.
- **Pokebolas: formula e captura critica** (Cobblemon): formulas de captura gen 1 a 9 configuraveis; se a taxa modificada passa de 255, captura garantida; **captura critica** com chance que cresce com o progresso da Pokedex (0.5x a partir de 31 capturados, 1x a 151, 1.5x a 301, 2x a 451, 2.5x acima de 600). Valores exatos de Level/Heavy/Moon/Love Ball: usar os tooltips oficiais do lang (fonte primaria) e nao a wiki.
- **Cozinha 1.7 (wiki)**: Campfire Pot com 3 slots de tempero; 4 tipos de seasoning: Nutricao (Ponigiri: fome/saturacao), Efeito (Sinister Tea: efeitos de pocao), Sabor (Aprijuice: bonus de stats de montaria), Isca (Poke Bait/Snacks: atrai Pokemon). Amizade: Poke Puff bonus fixo; Malasada varia pela natureza. Mints mudam o efeito da natureza nos stats (natureza em si nao muda). Ability Patch: obtencao "nao por meios normais" (nao confirmado se mudou na 1.7.3).
- **Imagens dos itens** (usuario perguntou): as texturas oficiais estao nos jars: Cobblemon 1.7.3 tem **802 texturas de item** em `assets/cobblemon/textures/item/` (subpastas poke_balls, medicine, iv_candy, experience_candy, mints, berries, evolution, held_items, battle_items, food, poke_puffs, mochis, aprijuice, fossils, mulches, fishing...), pixel art 16x16 identico ao jogo; allthemons 87 (ex. ancient_dna_sample, pika_star, apricorns do pack); mega_showdown 322 (mega stones, Key Stone). Extraidas no build a partir da instancia, exibidas com escala "nearest neighbor" para nao borrar. Verificado com amostra de 18 itens. Para o prototipo, 1.134 texturas foram extraidas em `design/prototipo/assets/itens/{cobblemon,allthemons,mega_showdown}/<item_id>.png` (2 MB). Nota de licenca: sao assets dos mods (nao sao codigo MPL); uso privado entre amigos, sem distribuicao publica.
- **Decisao**: o app ganha secoes de **Treinadores (progressao do level cap por serie, com times e niveis), Pokebolas (efeito + melhor bola para o Pokemon aberto) e Itens/Comidas (descricao, como usar, PT/EN)**. Todos os dados vem da instancia local (jars + kubejs + config), sem API externa.

Fontes: curseforge.com/minecraft/modpacks/all-the-mons, github.com/AllTheMods/All-the-Mons/discussions/148, wiki.cobblemon.com (Species, Spawn_Pool_World), gitlab.com/cable-mc/cobblemon, cobblemon.gg/guides/evolutions, cobblewiki.com/blog/how-cobblemon-spawning-works, pokeapi.co/docs/v2, pokeapi.co/api/v2/language/, github.com/PokeAPI/pokeapi.

## 8. Casos de borda / caminhos tristes

Levantados ao longo da conversa e nas pesquisas:
- **Sem internet**: dados, textos, imagens de itens e sons sao locais; so o artwork/sprite da PokeAPI falha -> placeholder, resto da ficha funciona. (Na pratica o app fica quase todo offline, embora o usuario tenha dito que nao precisa.)
- **PokeAPI fora do ar ou lenta**: nao bloquear a ficha; imagem carrega depois; cache local das imagens ja baixadas.
- **Pokemon sem spawn natural** (201 na 1.7.3, menos os 23 que o pack adiciona): sem aviso laranja; secao "Como obter" em camadas; fallback honesto "sem rota confirmada".
- **Especie em varios buckets de spawn**: mostrar o mais comum como principal e listar os demais.
- **Item sem metodo de obtencao nos dados**: texto neutro de fallback; nunca inventar.
- **Especies custom do pack** (Creepyon 9902, Piglich): sem artwork na PokeAPI -> usar sprite/texture do proprio mod ou placeholder; decidir no PRD.
- **Time cheio** (6): avisar; **historico** rotaciona nos 20 sem apagar manual.
- **Capturado desmarcado / marcado de novo**: animacao repete (premissa 18).
- **Nomes longos** (Fighting, Fantasma, Ultra-raro): chips quebram linha, badges nao quebram; testado a 360/390px.
- **Reduzir animacoes** (sistema ou switch): tudo estatico, inclusive captura, marca d'agua, cards lendario/mitico.
- **Termos PT/EN por card**: override por card persiste; texto da interface nunca muda com o toggle do card.
- **Navegacao**: Voltar (app, hardware Android, teclado) restaura tela + estado + scroll em qualquer profundidade; nunca "voltar para a lista".
- **Level cap**: cap inicial = max(initialLevelCap, exigencia do 1o treinador); grupos OR em requiredDefeats ("requer um de"); series com pre-requisito (ATM Team requer BDSP); `initialSeries = "empty"` (comportamento a confirmar no PRD).
- **Dados locais x atualizacao**: migracao de esquema; nunca perder; backup/restauracao; escrita atomica (requisito duro).
- **Versao do pack muda** (Cobblemon/ATM): dataset regenerado no build a partir da instancia; app mostra a versao dos dados ("Dados: All the Mons 1.3.0 / Cobblemon 1.7.3").
- **Desempenho no celular**: animacoes so transform/opacity; 1.025 Pokemon + 1.500 treinadores + 1.100 texturas + sons precisam de indice local e carregamento preguicoso (lista virtualizada).

## 9. Referencia de UI

Modo: **prototipo proprio aprovado pelo usuario**. O usuario nao encontrou referencias externas (2026-09-23) e pediu que eu criasse um HTML com um design proposto, mantendo ao maximo a identidade Pokemon/Pokedex, da pagina inicial ate a pagina do Pokemon, com valores ficticios, para ele aprovar ou pedir alteracao. Fica em `design/prototipo/`. A pasta `design/referencias/` (desktop/, mobile/) existe para prints que ele queira adicionar.
Quando aprovado, o prototipo e a referencia visual oficial: `forge-ui-recon` captura dele (page: design/prototipo) e o `forge-imp-frontend` o segue.

## 10. Prioridades

**TUDO nesta IDEA e MUST-HAVE** (usuario, 2026-09-23: "Tudo aqui e must-have. Ja estamos a muito tempo planejando"). Nao existe nice-to-have; a ordem abaixo e so a sequencia de construcao, nao prioridade de corte. Ordem aprovada pelo usuario (2026-09-23):
1. **Nucleo**: busca por nome/numero + ficha (tipos, fraquezas/resistencias, evolucoes com nivel/metodo do Cobblemon, stats + Total/BST, habilidades, drops, onde encontrar, raridade) + tema de cores + historico + idioma pt-BR/EN + layouts desktop e mobile + animacoes.
2. **Segunda etapa**: cadeia de evolucao clicavel, golpes por nivel com tipo/poder, filtros (tipo, geracao, metodo de evolucao), time de 6.
3. **Terceira etapa** (ainda must-have): calculadora de efetividade, calculadora de stats IV/EV/natureza, comparar dois Pokemon, sprite shiny, Pokemon aleatorio, Pokedex "de verdade" no mobile com som.

## 11. Premissas confirmadas

Premissas listadas ao usuario em 2026-09-23 e ACEITAS EM BLOCO ("concordo com tudo"):
1. Busca por numero aceita "25", "025", "0025" (Pokedex nacional).
2. Busca por nome parcial, sem acento, com autocomplete.
3. Busca por nome funciona no nome em ingles e no traduzido, independente do idioma ativo.
4. Mostra todos os 1.025; os sem spawn natural na 1.7.3 aparecem com aviso "nao nasce no mundo".
5. Formas (Mega, Gmax, regionais) como abas dentro da ficha do Pokemon base.
6. Fraquezas/resistencias calculadas pelos tipos (defensivo), com x4 e x0.25 em dual-type; calculadora de efetividade tambem so por tipos.
7. Imagem principal = artwork oficial da PokeAPI; sem internet, placeholder e o resto da ficha (local) continua.
8. Entrada de historico ao ABRIR a ficha; repetido vai pro topo.
9. Time de 6 na tela inicial.
10. Tema padrao vermelho/azul e idioma padrao pt-BR; escolhas persistem.
11. Mobile so retrato; desktop redimensionavel com tamanho minimo.
12. ~~Som desligado por padrao~~ REVOGADA em 2026-09-23: som LIGADO por padrao, com botao para desligar.
13. Animacoes respeitam "reduzir movimento" do sistema.
14. Stack: React + TypeScript + Vite; Electron (Windows); Capacitor (Android).
15. Entrega: instalador .exe (Windows) + .apk (Android, sem Play Store), distribuidos pelo usuario aos amigos.
16. Sem coleta de dados, sem analytics, unica chamada externa = PokeAPI.
Fora do escopo confirmado: batalha simulada, dados do save do Minecraft, sincronizacao entre aparelhos, iOS.

Premissas adicionais (ainda NAO confirmadas explicitamente; adotadas por padrao, confirmar no gate do PRD):
17. Fundos da captura por categoria Lendario / Mitico / Outros (3 imagens), e nao pelos 4 buckets de spawn; a raridade de spawn aparece como texto na ficha.
18. Capturado pode ser desmarcado (na ficha e na lista). Marcar de novo repete a animacao.
19. Lista de capturados mostra contador "X de 1.025" e permite filtrar a listagem por "so capturados" / "so faltando".

Outras:
- Simples, entre amigos, nada demais (usuario).
- Sem conta, sem servidor, dados so no aparelho (usuario, 2026-09-23).
- Somente online (usuario, 2026-09-23).
- "Poder maximo" = coluna Total do pokemondb = BST (usuario mostrou a print; eu expliquei a diferenca para stats no nivel 100).

## 12. Pontos em aberto

- Fonte dos dados: PokeAPI (geral) + JSON de especies do Cobblemon (nivel de evolucao real do modpack)? Ou so Cobblemon? Confirmar versao do Cobblemon usada pelo All the Mons.
- **IVs e EVs recomendados por Pokemon** (usuario perguntou "conseguimos de alguma forma?"): NAO existe no Cobblemon nem na PokeAPI. Opcoes: (a) heuristica a partir dos stats base (investir nos 2 melhores atributos; IV 31); (b) sets competitivos do Smogon (publicos; verificar se ha dataset gratuito consumivel pelo app, ex. pacote @pkmn/smogon ou JSON no GitHub). Pesquisar no PRD e decidir com o usuario.
- Especies custom do pack (Creepyon, Piglich): mostrar na Pokedex? (sem artwork na PokeAPI; precisaria do sprite do proprio mod.)
- Referencia visual: RESOLVIDO (prototipo aprovado em 2026-09-23).
- Para o PRD decidir: (a) IV/EV recomendados: heuristica pelos stats base vs sets do Smogon (verificar dataset gratuito); (b) especies custom do pack na Pokedex (Creepyon, Piglich) e a fonte da imagem; (c) qual mod fornece o breeding no pack (Cobbreeding ausente; Just Enough Breeding presente) para descrever o "como usar"; (d) comportamento de `initialSeries = "empty"` no RCT; (e) RESOLVIDO: todos os gritos entram (16,5 MB); (f) formato do codigo de transferencia (tamanho do QR com 1.025 capturados -> usar bitmap comprimido; codigo texto pode ficar longo: avaliar copiar/colar vs arquivo) e regra de mesclagem. Sem isso, o forge-ui-recon nao tem o que capturar; fallback = Pokedex classica vermelha/azul desenhada do zero e aprovada em prototipo.
- Dados sao locais em cada aparelho ou compartilhados?
- Precisa funcionar offline?
- Quais geracoes / quantos Pokemon o All the Mons inclui?

## 13. Retomada (para a proxima sessao)

- **Onde estamos**: Stage 1 (IDEA) CONCLUIDA em 2026-09-23, prototipo aprovado. Proximo passo: `/forge --prd pontindex` (Stage 2). O branch de feature (`feature/pontindex`) ainda NAO existe: criar a partir de `main` no inicio do PRD.
- **Git**: repositorio local em `main`, sem remoto. Commits ate `eb197ca`. `.forge/ideas/pontindex/IDEA_pontindex.md` e `design/` versionados; `STATE_*.md` ignorado.
- **Referencia visual**: `design/prototipo/index.html` (abrir no navegador; menu do prototipo na engrenagem inferior direita). `design/tipos/svg/` + `cores.json` (paleta por tipo), `design/capture/` (referencia dos fundos), `design/pokebola.webp`, `design/prototipo/assets/itens/` (1.134 texturas), `design/referencias/card-pokemon-gradiente.png`.
- **Fontes de dados (todas locais)**: instancia `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons` (ATM 1.3.0, Cobblemon 1.7.3): jars em `mods/` (Cobblemon, complete-cobblemon-collection-myths-and-legends-compat, allthemons, mega_showdown, zamega, legendarymonuments, rctmod, rctapi) + `kubejs/data/{cobblemon,rctmod,legendary_spawns_ccc}` + `config/{cobblemon,rctmod-server.toml}`. Lang PT/EN em `assets/<mod>/lang/`. PokeAPI so para artwork/sprites e detalhes de golpe (tipo/poder/precisao).
- **Stack decidida**: React + TypeScript + Vite; **Fase 1 = site PWA na Vercel (sem backend)**; Fase 2 = Electron (Windows .exe) e Capacitor 8 (Android .apk, SDK 36 ja instalado, ANDROID_HOME configurado) com atualizador automatico e botao "Baixar app" so no site; Lucide icons; tudo must-have.
- **Nao existe CONTEXT_pontindex.md**: projeto sem codigo; no PRD, rodar `forge-context` sobre `design/prototipo/` + esta IDEA + as fontes de dados acima.
- **Regras de trabalho do usuario nesta feature**: respostas em texto (nao gosta de widgets de pergunta), ver o resultado no navegador antes de aprovar, "tudo e must-have", sem travessao, commits sem assinatura do Claude, nada de push sem pedir.
