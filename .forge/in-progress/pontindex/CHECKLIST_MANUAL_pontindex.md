# Checklist manual do Pontindex (testes de UX com o Pontin)

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
- [A] Calculadora: 299/328/269 no exemplo base 100; Recomendacao + Aplicar; EV acima de 510 fica vermelho e congela o resultado; efetividade Fogo/Agua contra Fogo = x1/4.
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
