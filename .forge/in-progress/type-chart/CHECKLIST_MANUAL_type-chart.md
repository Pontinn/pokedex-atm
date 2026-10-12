# CHECKLIST MANUAL - type-chart (pagina Tipos: quem vence quem)

Legenda: `[ ]` pendente · `[x]` feito · `[A]` coberto por teste automatizado · `[!]` bug

Backend: N/A (feature so de frontend).

## Frontend

Branch `feature/type-chart` (worktree `Projetos/pokedex-type-chart`). Commits de codigo: F1.1 `48a70443`, F1.2 `621b6a71`, F1.3 `0aafba5a`, F2.1 `7887202b`, F2.2 `cb9db403`, F2.3 `5db4ae97`, F3.1 `90da65af`, F4.1 `da9b671e`, T1.1 `29131372`, T1.2 `986eb0b9`, T1.3 `3ed74317`.

Como rodar: `npm run dev` e abrir "Tipos" na sidebar (desktop) ou em "Mais" (celular). Testes: `npx vitest run tests/unit/ui-screens/types-*` e `npx playwright test tests/e2e/types.spec.ts` (build + preview).

### Entrada e navegacao

- [A] Desktop: "Tipos" aparece em 5o na sidebar (depois de "Comparar"), com icone proprio, e abre a pagina. (`tests/e2e/types.spec.ts` "sidebar lists Tipos in 5th place...")
- [A] Celular: "Tipos" aparece em 1o na folha "Mais", com o subtitulo "Quem vence quem". (`tests/e2e/types.spec.ts` "phone opens Tipos from the Mais sheet...")
- [A] Escolher Fogo, aba "Defendendo", rolar, abrir a Pokedex e usar o Voltar do navegador: volta com Fogo, "Defendendo" e a rolagem. O Avancar do navegador fica fora do contrato (PRD rev 5.3, CA-31). (`tests/e2e/types.spec.ts` "back restores type, tab and scroll...")
- [A] Entrar de novo pelo menu ou recarregar: a pagina comeca do zero; trocar tipo/aba nao cria entradas no historico. (`tests/e2e/types.spec.ts` "a new entry and a reload start from scratch...")
- [ ] Olhar a olho: o item "Tipos" fica com o estado ativo na sidebar enquanto a pagina esta aberta.

### Visao "Por tipo" (feliz e vazio)

- [A] Sem tipo escolhido: 18 chips, a instrucao e nenhum detalhe. (`tests/unit/ui-screens/types-screen.test.tsx` "starts on By type with the 18 chips...")
- [A] Escolher Fogo: heroi grande, frase de intuicao e 3 faixas (x2, x1/2, x0) derivadas da tabela; tocar de novo em Fogo nao muda nada. (`tests/unit/ui-screens/types-screen.test.tsx` "shows the hero, hint and 3 attack bands for Fire..."; `tests/e2e/types.spec.ts` "Fire bands are derived from TYPE_CHART...")
- [A] As 18 combinacoes de ataque e defesa batem com o TYPE_CHART. (`tests/unit/ui-screens/types-screen.test.tsx` "derives the attack and defense bands of all 18 types...")
- [ ] Ler as frases de intuicao de 3 ou 4 tipos (ex.: Fogo, Agua, Fantasma, Normal) e conferir que soam naturais em PT e em EN.
- [ ] Faixa vazia (ex.: Normal atacando nao tem x2): mostra "Nenhum" e nao fica estranha.

### Abas "Atacando" e "Defendendo"

- [A] As cores das faixas seguem a vantagem do ponto de vista da aba (verde = bom para voce) nas duas abas. (`tests/e2e/types.spec.ts` "Fire bands are derived from TYPE_CHART with the advantage colors on both tabs")
- [ ] Trocar de aba varias vezes com um tipo escolhido: a troca e imediata, sem piscar.

### Segundo tipo (so em "Defendendo")

- [A] O select do segundo tipo so aparece em "Defendendo"; Agua + Terra mostra x4 e x1/4; voltar para "Nenhum" volta ao tipo unico. (`tests/unit/ui-screens/types-screen.test.tsx` "[COULD] adds a second type only on Defending"; `tests/e2e/types.spec.ts` "no overlap" e "keyboard")
- [ ] O select nao lista o proprio tipo escolhido como opcao.
- [ ] Trocar o primeiro tipo com um segundo escolhido: o resultado continua coerente (nunca o mesmo tipo duas vezes).

### Visao "Tabela completa"

- [A] Celulas com nome acessivel completo; clicar no cabecalho de linha ou coluna seleciona o tipo; destaque de linha/coluna. PT e EN. (`tests/e2e/types.spec.ts` "cells have full accessible names and headers select the type (pt|en)"; `tests/unit/ui-screens/types-screen.test.tsx` "shows the full chart...")
- [A] Celular 390 e 360 px: so a tabela rola na horizontal, a 1a coluna fica fixa e opaca, a pagina nao rola de lado. (`tests/e2e/types.spec.ts` "at 390px|360px only the chart scrolls...")
- [ ] No celular real: arrastar a tabela na horizontal com o dedo e conferir que o gesto nao dispara o Voltar do sistema nem rola a pagina inteira.
- [A] Trocar de visao nao gera tarefa longa > 200 ms; a tabela e desmontada em "Por tipo". (`tests/e2e/types.spec.ts` "performance")

### Teclado e foco

- [A] Toda parada de Tab mostra anel de foco de 2 px; chips, visao, abas, select e cabecalhos funcionam sem mouse. (`tests/e2e/types.spec.ts` "every stop shows a 2px focus ring...")
- [ ] Com leitor de tela (NVDA ou Narrador): o nome de uma celula da tabela e lido por inteiro ("Fogo ataca Planta: x2" ou equivalente).

### Idioma PT/EN

- [A] Nomes, legenda, abas e frase trocam com o idioma da interface; o interruptor de termos nao afeta a pagina. (`tests/unit/ui-screens/types-screen.test.tsx` "switches names, legend and hint with uiLanguage...")
- [A] Sem sobreposicao em 360, 390 e 1280 px, em PT e em EN, em todos os estados. (`tests/e2e/types.spec.ts` "no overlap")
- [ ] Ler a pagina inteira em EN procurando texto em PT esquecido.

### Temas (7)

- [A] Nos 7 temas (classic, black, green, blue, purple, white, orange): texto das faixas e da legenda com contraste >= 4,5:1; tons da tabela fixos. (`tests/e2e/types.spec.ts` "theme <tema>: band text and legend reach 4.5:1...")
- [A] Em escala de cinza os simbolos e o destaque de linha/coluna ainda carregam o sentido. (`tests/e2e/types.spec.ts` "in grayscale...")
- [ ] Olhar a pagina nos 7 temas (desktop e celular) e conferir que nada destoa do resto do app.

### Regressao

- [A] Suite completa: vitest 96 arquivos / 823 testes; e2e build + preview sem regressao (2 flakes preexistentes provados na main, ver STATE 17:00).
- [ ] Calculadora de tipos e painel de fraquezas da ficha do Pokemon continuam iguais (abrir Charizard).
