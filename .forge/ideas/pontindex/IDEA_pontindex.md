---
feature: pontindex
language: pt-BR
type: create
status: in-progress
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
- [2026-09-23] **Silhueta** da captura = artwork oficial do Pokemon (PokeAPI) totalmente preta, estilo "quem e esse Pokemon?" (usuario: ok).
- [2026-09-23] **Animacao de captura pode ser pulada com um toque** (usuario).
- [2026-09-23] **Pasta de referencias** criada a pedido do usuario: `design/referencias/` (desktop/, mobile/, LEIA-ME.txt). Como ele nao achou referencias, pediu um prototipo HTML proposto por mim (ver secao 9).
- [2026-09-23] **Animacoes: o maximo possivel, SEM deixar o app lento** (usuario). Restricao de performance explicita: animacoes por GPU (transform/opacity), sem travar o celular.
- [2026-09-23] **Premissas 1 a 16 da secao 11 aceitas em bloco** (usuario: "concordo com tudo").
- [2026-09-23] **Custo zero**: nenhuma API paga; so fontes gratuitas (PokeAPI, dados publicos do Cobblemon).

## 3. Escopo

**Dentro:**
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

N/A - projeto novo, nao existe nada para quebrar.

## 5. Papeis e permissoes

Sem papeis. App de consulta, sem conta; todo mundo ve a mesma coisa. Confirmado pelo usuario (plug and play).

## 6. Entidades e ciclo de vida

Pokemon, golpes, habilidades, tipos: somente leitura (vindos das APIs).
Dados locais criados pelo usuario (sem servidor, guardados no aparelho):
- **Historico de pesquisa**: criado automaticamente a cada busca; guarda **ate 20 itens** (o mais antigo sai quando entra o 21o); **so informacao basica** por item (numero, nome, sprite, tipos), sem duplicar a ficha; listado; sem edicao; sem apagar/limpar (usuario: nao precisa).
- **Meu time**: **time de 6** Pokemon (limite do jogo); adicionar, remover, listar; ao tentar o 7o, avisar que o time esta cheio.
- **Capturados**: marcar como capturado pela ficha (botao "capturei", dispara a animacao de captura); listar capturados; (a confirmar) desmarcar; (a confirmar) contador "X de 1.025" e filtro "so capturados / so faltando"; sem limite.
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
  - Consequencia para o app: a secao Treinadores mostra, por serie, a cadeia de treinadores-chave em ordem com o **cap que cada vitoria libera** (= nivel max do time do proximo), o time de cada um (especie, nivel, golpes, habilidade), tipo (lider/E4/campeao/rival/chefe) e bioma de spawn. Tudo calculado dos JSON locais.
- **Pokebolas: formula e captura critica** (Cobblemon): formulas de captura gen 1 a 9 configuraveis; se a taxa modificada passa de 255, captura garantida; **captura critica** com chance que cresce com o progresso da Pokedex (0.5x a partir de 31 capturados, 1x a 151, 1.5x a 301, 2x a 451, 2.5x acima de 600). Valores exatos de Level/Heavy/Moon/Love Ball: usar os tooltips oficiais do lang (fonte primaria) e nao a wiki.
- **Cozinha 1.7 (wiki)**: Campfire Pot com 3 slots de tempero; 4 tipos de seasoning: Nutricao (Ponigiri: fome/saturacao), Efeito (Sinister Tea: efeitos de pocao), Sabor (Aprijuice: bonus de stats de montaria), Isca (Poke Bait/Snacks: atrai Pokemon). Amizade: Poke Puff bonus fixo; Malasada varia pela natureza. Mints mudam o efeito da natureza nos stats (natureza em si nao muda). Ability Patch: obtencao "nao por meios normais" (nao confirmado se mudou na 1.7.3).
- **Decisao**: o app ganha secoes de **Treinadores (progressao do level cap por serie, com times e niveis), Pokebolas (efeito + melhor bola para o Pokemon aberto) e Itens/Comidas (descricao, como usar, PT/EN)**. Todos os dados vem da instancia local (jars + kubejs + config), sem API externa.

Fontes: curseforge.com/minecraft/modpacks/all-the-mons, github.com/AllTheMods/All-the-Mons/discussions/148, wiki.cobblemon.com (Species, Spawn_Pool_World), gitlab.com/cable-mc/cobblemon, cobblemon.gg/guides/evolutions, cobblewiki.com/blog/how-cobblemon-spawning-works, pokeapi.co/docs/v2, pokeapi.co/api/v2/language/, github.com/PokeAPI/pokeapi.

## 8. Casos de borda / caminhos tristes

(a levantar)

## 9. Referencia de UI

Modo: **prototipo proprio aprovado pelo usuario**. O usuario nao encontrou referencias externas (2026-09-23) e pediu que eu criasse um HTML com um design proposto, mantendo ao maximo a identidade Pokemon/Pokedex, da pagina inicial ate a pagina do Pokemon, com valores ficticios, para ele aprovar ou pedir alteracao. Fica em `design/prototipo/`. A pasta `design/referencias/` (desktop/, mobile/) existe para prints que ele queira adicionar.
Quando aprovado, o prototipo e a referencia visual oficial: `forge-ui-recon` captura dele (page: design/prototipo) e o `forge-imp-frontend` o segue.

## 10. Prioridades

Tudo entra. Ordem aprovada pelo usuario (2026-09-23):
1. **Nucleo (must)**: busca por nome/numero + ficha (tipos, fraquezas/resistencias, evolucoes com nivel/metodo do Cobblemon, stats + Total/BST, habilidades, drops, onde encontrar, raridade) + tema de cores + historico + idioma pt-BR/EN + layouts desktop e mobile + animacoes.
2. **Segunda etapa**: cadeia de evolucao clicavel, golpes por nivel com tipo/poder, filtros (tipo, geracao, metodo de evolucao), time de 6.
3. **Terceira etapa (nice)**: calculadora de efetividade, calculadora de stats IV/EV/natureza, comparar dois Pokemon, sprite shiny, Pokemon aleatorio, Pokedex "de verdade" no mobile com som.

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
12. Som (beep) desligado por padrao, com botao para ligar.
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
- Ordem de prioridade entre as features (tudo entra, mas o que vem primeiro).
- **IVs e EVs recomendados por Pokemon** (usuario perguntou "conseguimos de alguma forma?"): NAO existe no Cobblemon nem na PokeAPI. Opcoes: (a) heuristica a partir dos stats base (investir nos 2 melhores atributos; IV 31); (b) sets competitivos do Smogon (publicos; verificar se ha dataset gratuito consumivel pelo app, ex. pacote @pkmn/smogon ou JSON no GitHub). Pesquisar no PRD e decidir com o usuario.
- Especies custom do pack (Creepyon, Piglich): mostrar na Pokedex? (sem artwork na PokeAPI; precisaria do sprite do proprio mod.)
- Referencia visual: prototipo HTML em construcao (2026-09-23); a ideia fecha quando o usuario aprovar o prototipo. Sem isso, o forge-ui-recon nao tem o que capturar; fallback = Pokedex classica vermelha/azul desenhada do zero e aprovada em prototipo.
- Dados sao locais em cada aparelho ou compartilhados?
- Precisa funcionar offline?
- Quais geracoes / quantos Pokemon o All the Mons inclui?
