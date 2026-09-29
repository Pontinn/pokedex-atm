# REPORT_TEST_UI_spawn-bait

Stage 5, 2026-09-29. Ambiente: build + `vite preview` porta 4173, Playwright headless Chromium, somente localhost. Coleta de console e de requests com falha em todos os fluxos: 0 erros, 0 respostas >= 400. Conteudo escrito pelo orquestrador a partir do retorno do forge-test (o harness bloqueou a escrita direta pelo agente). Prints em `ui-refs/test-*.png` (53 arquivos).

## Fluxos

| Fluxo | Viewport / idioma | Resultado | Prints |
|---|---|---|---|
| Charizard (6), bloco Iscas | 1280 e 390, PT e EN | OK | test-detail-where-charizard-{pt,en}[-mobile], -pt-360, -pt-768 |
| Magikarp (129) | idem | OK | test-detail-where-magikarp-* |
| Staryu (120), lista expandida | idem | OK | test-detail-where-staryu-expanded-* |
| Wooper (194), lista expandida (Doce Amor, Bola Amor, Lure) | idem | OK | test-detail-where-wooper-expanded-* |
| Dipplin (1011), sem bloco | idem | OK | test-detail-where-no-spawn-1011-* |
| Itens poke_snack (receita da Panela de Fogueira, mel), poke_bait, occa (efeitos de isca), lum, enchanted_golden_apple | idem | OK | test-item-*-{pt,en}[-mobile] |
| Lista de itens, aba Iscas (81 cards) | idem | OK | test-items-list-bait-* |
| Charizard nos 7 temas (classic, black, green, blue, purple, white, orange) | 1280 PT | OK, sem desvio de identidade | test-detail-where-charizard-theme-* |
| Charizard, clique na Baga Occa, pagina do item, Voltar | 1280 | OK, volta para a mesma ficha com o bloco | n/a |
| Wooper, clique em Doce Amor, item, Voltar | 1280 | OK | n/a |
| Whiscash (340), clique na Master Ball, item | 1280 | OK | n/a |
| Responsivo 360/390/768/1280 (fichas 6, 130, 129, 194; itens snack, bait, enchanted, occa) | 4 larguras | sem scroll horizontal na pagina nem em `#main`, sem sobreposicao do bloco | n/a |

## Visual e UX

- O bloco Iscas bate com `after-detail-where-charizard-*` (mesma superficie das entradas de spawn, rotulo no estilo DROPS, pilulas como as do "Como obter"). Dipplin sem bloco e igual ao baseline. Em black e green o bloco herda as cores do painel e fica legivel.
- Os nomes de item no bloco seguem o toggle PT/EN do card, e os rotulos seguem o idioma da UI (conforme a SPEC).
- O detector de overflow marcou a tabela de golpes (`.table-wrap`, `overflow-x: auto`, intencional) e a barra de abas dos itens: falsos positivos, nao sao achados.

## Acessibilidade

- Rotulo visivel "Iscas" mais sub-rotulos. Nao ha role/aria-labelledby no container, igual ao bloco Drops existente. 11 botoes, 0 sem nome acessivel, todos alcancaveis por Tab (Tab vai de Occa para Coba).
- **F-03 (Low, preexistente, opcional):** o foco de teclado usa so o anel padrao do navegador (`outline auto 1px`); o app nao tem estilo global de foco.

## Higiene

- DOM e localStorage sem caminhos de usuario nem segredos (localStorage vazio; IndexedDB `pontindex` e `workbox-expiration`).

## Achados

Nenhum Critical ou High. F-01 (Low) e F-02 (Medium) estao no relatorio de contrato de dados (testes flaky preexistentes, fora da feature). F-03 (Low) acima.

## Itens manuais que ficaram para o Pontin (checklist manual, `[ ]`)

1. Clareza do texto "ou baga na vara" e das dicas por linha (fichas de Charizard, Gyarados e Feebas, bloco Iscas): um jogador que nao conhece a mecanica entende?
2. Decidir se os textos PT do proprio jogo ficam como estao (ex. maca encantada: "100% - de probabilidade de aumentar o grupo de raridade em +10 niveis"). Abrir as paginas de Occa, Lum e maca dourada encantada em PT.
3. Rolar a aba Iscas inteira no celular (Itens e Comidas, aba Iscas): ordem e texturas dos 8 itens novos (a maca dourada encantada usa a textura da maca dourada, sem brilho). O agente so confirmou 81 cards e o topo da lista.
4. Celular real a 390: area de toque das pilulas de baga e dos chips de pesca, e se a linha da Pokeisca quebra bem.
5. Nao automatizavel: validar no jogo a recomendacao das 3 melhores bagas; PWA offline com as paginas novas.
