# Checklist manual do Pontindex (testes de UX com o Pontin)

> **FECHADA em 2026-09-28.** Validada pelo Pontin, que fez os testes por conta propria e publicou o deploy em https://pontindex.pontin.dev. Os itens `[ ]` abaixo nao foram marcados um a um.

Legenda: `[ ]` conferir a mao; `[A]` ja coberto pelo e2e automatico (headless), conferir so a sensacao/visual.

## Frontend

### Grupo A: Pokedex, ficha, captura e capturados

Como abrir: `npm run dev` e acessar `http://localhost:5173/`. Conferir em PT e EN, no desktop (janela larga) e no celular (ou janela com menos de 900 px).

#### Pokedex (F3)
- [A] A grade mostra os 1.027 Pokemon, rola lisa ate o fim, 2 colunas no celular.
- [A] Busca por numero, nome PT ou EN (sem acento) filtra junto com tipo, geracao, evolucao, status e ordenacao.
- [A] Voltar da ficha para a Pokedex mantem filtros e a posicao da rolagem.
- [ ] Rolagem rapida ate o fim e de volta sem cards piscando ou em branco por muito tempo.
- [ ] Selos (Lendario/Mitico, raridade) legiveis e acima do nome em todos os temas.

#### Ficha (F4, F5)
- [A] Hero com gradiente do tipo, selos, shiny, grito; Lendario dourado e Mitico roxo com brilhos.
- [A] Stats, fraquezas (filtro Todos/Fraquezas/Resistencias), evolucoes clicaveis, habilidades, golpes por aba com descricao.
- [A] Onde encontrar (raridade, biomas, luz, horario), drops e Como obter clicaveis; formas com itens clicaveis.
- [A] Melhor Pokebola: top 3 com o 1o dourado, "Ranking completo", "Captura garantida", "Captura critica"; clicar numa bola abre a pagina do item.
- [A] Calculadora: 299/328/269 no exemplo base 100; Recomendacao por funcao (RF-110 rev 7: funcao, "Priorize X e Y", natureza sugerida e aviso de IA, sem numeros de EV/IV; no Charizard: Atacante rapido, At. Esp. e Velocidade, Timida) + Aplicar (preenche IV 31, EVs 252 SpA/252 Spe/4 HP e a natureza Timida); EV acima de 510 fica vermelho e congela o resultado; efetividade Fogo/Agua contra Fogo = x1/4.
- [ ] A ordem das bolas faz sentido para 3 ou 4 Pokemon que o Pontin conhece no jogo (ex. Magikarp, Gastly, Onix).
- [ ] Digitar nos campos da calculadora e confortavel no celular (teclado numerico, sem pular o cursor).
- [ ] A calculadora aberta e os valores digitados continuam la depois de ir a outra ficha e Voltar.

#### Captura (F6.1)
- [A] "Capturei" abre a animacao: fundo, bola cai, balanca 3 vezes, abre, silhueta cresce, flash, revelacao com nome e "Capturado!"; os 7 sons na ordem e `pokedex_close` ao fechar.
- [A] Tocar pula para o final; Esc, clique no final ou Fechar fecham; Voltar no meio fecha e para os sons.
- [A] Mewtwo com fundo dourado e relampagos, Mew com fundo roxo e faiscas, demais com fundo azul.
- [A] Com "Reduzir animacoes" vai direto para a revelacao.
- [ ] Ritmo da animacao e volume dos sons agradaveis no celular de verdade (sem travadas).
- [ ] Com o som desligado a animacao roda muda.
- [ ] Artwork real (com internet) aparece como silhueta preta e depois colorida; sem internet, a silhueta da pokebola.

#### Capturados (F6.2)
- [A] "X de 1.027" com o formato do idioma, barra e porcentagem; lista do mais recente ao mais antigo com "Capturado em".
- [A] Desmarcar pelo x pede confirmacao; recarregar a pagina mantem a lista.
- [A] Busca PT/EN combinada com as abas Todos capturados / So faltando; sem resultado mostra o texto buscado; Voltar restaura busca e aba.
- [ ] Com muitos capturados (100+) a lista continua fluida e a data aparece em todos os cards.
- [ ] O botao x de desmarcar e facil de tocar no celular e nao e confundido com abrir a ficha.

#### PWA (F12.1)
- [A] Build de producao: o 2o load ja e controlado pelo service worker; offline (sem rede) recarrega Home, Pokedex e uma ficha ja aberta, com o artwork que ja tinha carregado.
- [A] Deploy novo com a aba aberta: aparece "Nova versão disponível" com Atualizar; Atualizar recarrega uma vez na versao nova.
- [ ] Instalar pelo navegador do PC (Chrome/Edge) e do celular (Android "Instalar app", iPhone "Adicionar à Tela de Início"): icone da pokebola, abre em janela propria com a cor vermelha no topo.
- [ ] Botao "Instalar app" em Configuracoes abre o prompt do navegador (so aparece quando o navegador oferece).
- [ ] No celular, modo aviao depois de ver algumas telas: o que ja foi visto abre; ficha nunca vista mostra erro com "Tentar de novo", nunca tela branca.
- [ ] Todas as telas com chips/selos a 360 e 390 px no celular de verdade: nada cortado nem sobreposto (RNF-09).

### Grupo B: Treinadores, Pokebolas, Itens, pagina de item e Comparar

Como abrir: `npm run dev` e acessar `http://localhost:5173/`. Conferir em PT e EN, no desktop (janela larga) e no celular (ou janela com menos de 900 px). `[A]` = coberto por `tests/e2e/{trainers,balls,items,item,compare}.spec.ts` (T1b); conferir so a sensacao/visual.

#### Treinadores (F8)
- [A] Sem serie escolhida: aviso, sem treinadores, Modo Livre e a serie `atm_team` bloqueados; a escolha sobrevive a um reload.
- [A] Concluir a BDSP libera `atm_team` e o Modo Livre (cap 100); sair do Modo Livre volta para a BDSP de onde parou.
- [A] Linha do tempo ao vivo: cap 15 no inicio, sobe a cada treinador-chave marcado (Roark 16, Mars 20, Jupiter 22), precisa dos 3 Cedric para passar de 22, so entao Maylene libera 30; desmarcar um treinador-chave desce o cap de novo.
- [A] Accordion do treinador mostra o time completo, item de assinatura e mochila; clicar no item abre a pagina de item e Voltar retorna.
- [A] Busca PT/EN so filtra a exibicao (nao desmarca ningeum); estado vazio com o texto buscado; Voltar restaura busca e serie.
- [ ] A ordem dos treinadores dentro de cada serie faz sentido pra quem esta jogando (proximo desafio sempre visivel sem rolar demais).
- [ ] Marcar/desmarcar um treinador no celular e facil de acertar (alvo de toque) sem abrir o accordion sem querer.
- [ ] Trocar de serie e voltar mantem o progresso de cada uma separado (nunca mistura).

#### Pokebolas (F9.1)
- [A] Todas as bolas (contagem = `balls.json`) com a textura certa; filtros combinam com a busca PT/EN (E logico); Voltar restaura filtro, busca e rolagem.
- [ ] As texturas das bolas parecem nitidas (sem serrilhado) nos tamanhos usados no card e no destaque.
- [ ] O card da bola deixa claro qual e a condicao pra ganhar o multiplicador maximo (sem precisar abrir a pagina do item).

#### Itens & Comidas (F9.2)
- [A] Abas por categoria, selo acima do nome, busca (ex. "pocao" acha Potion com o card em EN), expandir linha, Voltar restaura aba/busca/linha aberta; clicar num item abre a pagina de item.
- [ ] Nomes longos (PT e EN) nao cortam nem empurram o layout no celular (360/390 px).
- [ ] A categoria de um item e obvia de bater o olho (icone/selo), sem precisar ler o nome inteiro.

#### Pagina de item (F9.3)
- [A] Hero com a textura pixelada, "Como obter" honesto (receita sem revelar o passo a passo, drops com % e chip pro Pokemon, plantavel com biomas, sem rota confirmada quando for o caso); "Usado em" (evolucoes, bolas) com chips clicaveis.
- [A] Fire Stone mostra as 3 evolucoes que usam; item sem rota conhecida e item de outro mod (id desconhecido) tem uma pagina minima decente; toggle de termos PT/EN funciona no card.
- [A] Charizard > aba TM > rolar > abrir um golpe > abrir o item > Voltar restaura a aba, a linha aberta e a posicao da rolagem.
- [ ] O aviso "sem rota confirmada" nao parece um erro do site (linguagem e visual calmos, nao vermelho de alarme).

#### Comparar (F7.1)
- [A] Abre com os 2 ultimos vistos no historico; stats espelhados com o vencedor destacado de cada lado; trocar um lado pela busca preserva o outro e a rolagem; Voltar restaura os dois lados.
- [A] Historico vazio: os 2 lados pedem um Pokemon; escolher um preenche so aquele lado.
- [ ] Fica claro visualmente qual lado venceu em cada stat (cor/seta), mesmo pra quem nao le os numeros com atencao.
- [ ] Trocar de Pokemon no celular (busca ocupando a tela toda) e confortavel, sem perder o lado que ja estava preenchido.

### Configuracoes e Sincronizar (F10, F11)

Como abrir: Configuracoes pelo menu lateral (desktop) ou "Mais" (celular); Sincronizar do mesmo lugar. `[A]` = coberto por `tests/e2e/{settings,sync}.spec.ts` (T1b).

#### Configuracoes (F10)
- [A] Os 7 temas, idioma, som, reduzir movimento, termos padrao, instalar e sobre aparecem como no layout de referencia.
- [A] Preto + Ingles + som desligado + reduzir movimento ligado sobrevive a um reload.
- [A] Trocar o idioma padrao dos termos limpa os overrides por card (cada card volta a seguir o padrao).
- [A] Exportar -> instalacao limpa -> importar (substituir) devolve as 5 entidades identicas (dois contextos de navegador).
- [A] Erros de backup (versao mais nova, app errado, arquivo corrompido) nao escrevem nada no IndexedDB.
- [A] Apagar so o historico preserva as outras 4 entidades; apagar tudo exige digitar a palavra de confirmacao e limpa os snapshots.
- [A] Restaurar um snapshot antigo (pre-migracao) funciona apos confirmar.
- [ ] Trocar de tema da uma sensacao de resposta imediata (sem flash de tela branca/cor errada) em todos os 7 temas.
- [ ] O botao "Instalar app" some sozinho depois de instalado (nao fica oferecendo instalar de novo).
- [ ] Exportar/importar backup no celular (compartilhar/abrir arquivo) funciona pelo fluxo nativo do Android/iOS.

#### Sincronizar (F11)
- [A] 20 capturados -> um unico QR e texto, com resumo; nenhuma requisicao de rede durante a geracao.
- [A] 1.027 capturados + tudo -> 2 ou mais frames em carrossel e o texto completo reconstruido.
- [A] Sem nenhum dado -> ainda gera um codigo minimo com aviso.
- [A] A/B: B recebe A em modo Mesclar (dois contextos de navegador) com o resumo batendo.
- [A] Codigo corrompido, de outro app ou de uma versao mais nova mostra erro e nao altera o IndexedDB.
- [A] Colar frames um a um (carrossel manual) monta o codigo certo; frame de outra sessao avisa sem travar.
- [A] Camera negada mostra "Camera indisponivel" e o campo de colar continua utilizavel.
- [ ] Ler o QR com a camera de verdade do celular (luz, distancia, tremedeira) funciona sem travar em 2-3 tentativas.
- [ ] O carrossel automatico dos frames da tempo de fotografar cada QR sem perder nenhum (1,5s por frame).
- [ ] Feito num aparelho e lido em outro de verdade (nao so dois contextos do mesmo navegador): o resultado bate.
