---
feature: type-chart
language: pt-BR
type: create
status: in-progress
created: 2026-10-12
repo: pokedex (Pontindex Cobblemon), branch feature/type-chart, worktree Projetos/pokedex-type-chart
also_in: pontindex (porte apos a pontindex-base; IDEA espelhada em pontindex/.forge/ideas/type-chart)
---

# IDEA - type-chart (pagina "Tipos": a hierarquia dos tipos, didatica)

## 1. Objetivo

Pontin (2026-10-12, 14:30): "Quero adicionar uma nova pagina que mostre visualmente a 'hierarquia' dos tipos dos pokemons. qual e mais forte contra qual e tal." E depois: "faz do jeito q achar q vai ficar melhor. confio em voce, tem q ser algo didatico." E (14:34): "algo que so de bater o olho a pessoa ja sabe direitinho."

Dor: Pontin esta aprendendo Pokemon do zero (jogando FireRed) e nao tem onde VER, de forma clara, quem bate em quem. A calculadora da ficha responde "este Pokemon contra tal ataque", mas nao ensina a tabela. A pagina nova e para APRENDER a tabela, nao so consultar.

Criterio de sucesso (em palavras do orquestrador, aprovado por delegacao): alguem que nunca jogou abre a pagina, escolhe Fogo e entende em 10 segundos contra quem Fogo e forte, contra quem apanha e por que.

## 2. Decisoes (lista viva)

Todas decididas pelo orquestrador em 2026-10-12 por delegacao explicita do Pontin ("faz do jeito q achar q vai ficar melhor"). Conferido antes: no esqueleto NAO existe pagina de tipos; existe so `src/domain/type-chart.ts` (18 tipos, tabela moderna com Fairy, formato atacante -> {2, 0.5, 0}) e a calculadora `src/screens/Detail/TypeCalculator.tsx` dentro da ficha.

- [14:30] Feature SEPARADA da `pontindex-base`; nao mexe na SPEC da base (rumo mantido).
- [14:40, Pontin: "quero q essa pagina exista nos dois projetos. pode ser a exata mesma pagina"] A pagina e CONSTRUIDA PRIMEIRO no Pontindex Cobblemon (repo `pokedex`, branch `feature/type-chart`, worktree `Projetos/pokedex-type-chart`, base main cee51235), porque o codigo ja existe la, e depois PORTADA para o `pontindex` (mesmos arquivos, mesmo item de navegacao, mesmas chaves i18n) numa feature propria quando a `pontindex-base` fechar. Regra do porte: zero divergencia de comportamento; a unica diferenca permitida e o que o esqueleto oficial nao tem (ex. toggle de termos). A pagina depende so de arquivos compartilhados pelos dois apps (TypeChip, TypeIcon, `domain/type-chart.ts`, `types.generated.css`, navegacao, i18n), confirmado no CONTEXT.
- [14:30] Duas visoes na mesma pagina, a "por tipo" e a principal (didatica):
  - **Visao por tipo** (padrao): grade dos 18 tipos como botoes (TypeChip/TypeIcon). Ao escolher um, mostra duas abas: **Atacando** (Fogo ataca...) e **Defendendo** (...atacam Fogo). Cada aba lista grupos com titulo em linguagem simples: Atacando = "Forte contra (x2)", "Pouco efetivo contra (x1/2)", "Nao afeta (x0)"; Defendendo = "Fraco contra (recebe x2)", "Resiste a (recebe x1/2)", "Imune a (x0)". Grupo vazio mostra "nenhum".
  - **Tabela completa**: matriz 18x18, atacante nas linhas, defensor nas colunas, celula colorida (x2 / x1/2 / x0; x1 fica neutra e sem texto para nao poluir). Linha e coluna do tipo selecionado ficam destacadas. No celular a matriz rola na horizontal com a primeira coluna fixa.
- [14:30] Legenda didatica fixa no topo da pagina, em palavras: "x2 = causa o dobro de dano", "x1/2 = causa metade", "x0 = nao afeta", mais uma frase de intuicao por tipo quando o tipo esta selecionado (ex. Agua: "Agua apaga Fogo, mas Planta bebe Agua"). As 18 frases sao escritas a mao (PT e EN) no PRD e conferidas contra a tabela (toda frase cita so relacoes reais do `type-chart.ts`).
- [14:30] Tabela usada = a moderna (Gen 6+, com Fairy), que e a do `domain/type-chart.ts`. Seletor por geracao (ex. FireRed sem Fairy, Steel resistindo a Ghost e Dark) FICA PARA a fatia "jogos em profundidade" da pontindex; aqui e nice-to-have NAO incluido.
- [14:30] Tipo duplo na defesa (escolher 2 tipos e ver x4 / x1/4), reaproveitando `effectivenessAgainst` do dominio: nice-to-have, entra se couber no mesmo sprint sem complicar a tela.
- [14:30] Entrada: item novo na barra de navegacao, "Tipos" (PT) / "Types" (EN). Posicao: depois dos itens existentes de consulta (Dex), antes de Configuracoes; a SPEC confirma a ordem real na `nav-items` copiada pela base.
- [14:30] Identidade visual: a do projeto (UISPEC da base: tokens, cores de tipo ja geradas em `types.generated.css`, TypeChip). Nada de biblioteca de grafico nova.
- [14:30] Fonte unica de verdade = `src/domain/type-chart.ts` (nao duplicar a tabela; a pagina deriva tudo dele). Zero dependencia nova.
- [14:30] Sem diagrama de setas (18 tipos, mais de 100 relacoes: ilegivel). Decisao registrada como alternativa rejeitada.
- [14:34, Pontin: "so de bater o olho"] A visao por tipo e VISUAL, nao lista de texto: o tipo escolhido fica grande no centro/topo (icone + cor), e cada grupo e uma faixa colorida pelo resultado (verde = x2, vermelho/ambar = x1/2, cinza = x0) cheia de ICONES dos tipos (TypeIcon grande, nome curto embaixo), sem frases para ler alem do titulo do grupo. Regra de leitura em 1 olhada: cor da faixa = resultado, icones = quem. A matriz 18x18 usa icones nos cabecalhos (nao texto) e celulas so com cor + simbolo curto (2, 1/2, 0). Toda cor vem acompanhada de simbolo (acessibilidade e tema preto).

- [14:58, apos o CONTEXT] Pontos em aberto do CONTEXT fechados pelo orquestrador: (U1) posicao na barra: em `SIDEBAR_ITEMS` logo depois de `compare` (antes de `trainers`); no celular a barra tem 5 vagas fixas (`mobile.css`, `TAB_SCREENS` com 4 + Mais), entao Tipos entra na folha "Mais", nao em `TAB_SCREENS`. (U2) `ScreenId` = `types`; pasta `src/screens/Types/` com os nomes no padrao das telas existentes (a SPEC espelha `Compare`/`Settings`). (U3) icone de navegacao: um icone lucide que exista na versao instalada e nao esteja em uso, preferencia `Shapes`, senao `Layers`; exportado em `Icon.tsx` como os demais. (U4) a SPEC le `tests/e2e/navigation.spec.ts`, `responsive.spec.ts` e `shell.test.tsx` e lista cada asserção/snapshot que o item novo altera. (U5) o porte para o pontindex e garantido porque a base copia `src/` inteiro menos o Cobblemon (SegmentedControl, EmptyState, `.seg/.panel/.chip` vem junto). (U6/U7) CSS proprio em `src/screens/Types/types.css` (faixas por resultado com cor + simbolo, override para o tema preto) e um tamanho grande novo para o TypeIcon definido nesse CSS, sem mexer no componente compartilhado. (U8) nao importar nada de `Detail/TypeCalculator` (EFFECT_LABEL, selectedTypes, `.mult-*`): a pagina tem seus proprios rotulos e helper de selecao; os simbolos x2, x1/2, x1/4, x0 sao constantes de string (lint `no-literal-jsx-text`). Nomes dos tipos sempre por `uiLanguage` (nunca pelo toggle de termos, que so existe no Cobblemon).

## 3. Escopo

In-scope:
- Pagina nova `Tipos` com visao por tipo (abas Atacando/Defendendo), tabela completa 18x18, legenda didatica, frase de intuicao por tipo, item na navegacao, i18n PT/EN, estado da tela (tipo selecionado, aba) na pilha de navegacao como as outras telas, testes unit + e2e no padrao do projeto.
- Nice-to-have: defesa com 2 tipos.

Out-of-scope / NAO tocar:
- `src/domain/type-chart.ts` (dado) e `TypeCalculator.tsx` (calculadora da ficha): intocados.
- Seletor por geracao; golpes; dados por jogo.
- Qualquer mudanca na pontindex-base enquanto ela estiver em andamento.
- Neste repo (Cobblemon): nenhuma mudanca em telas existentes alem do item novo na barra e do registro da tela.

## 4. Superficie de regressao

- Navegacao: barra, pilha, Voltar do navegador, historico (a tela nova entra no registry como as demais).
- Calculadora de tipos da ficha (compartilha o dominio): continua identica.
- Precache/PWA: a pagina e codigo estatico, sem dado novo; o teto de precache do dataset nao muda.
- Temas (7) e i18n: a tela precisa funcionar em todos.

## 5. Papeis e permissoes

N/A: app local, usuario unico, sem login (mesma situacao da base).

## 6. Entidades e ciclo de vida

Nenhuma entidade persistida. Estado efemero da tela (tipo selecionado, aba, 2o tipo de defesa) vive no `ui` da entrada da pilha de navegacao, como `calcInputs` da ficha; some ao sair, volta com o Voltar.

## 7. Regras de negocio e exemplos

- Multiplicador atacante -> defensor vem de `TYPE_CHART[atacante]`: listado em `2` = x2; em `0.5` = x1/2; em `0` = x0; ausente = x1.
- Exemplo (conferido em `type-chart.ts`): Fogo atacando: forte contra Planta, Gelo, Inseto, Aco; pouco efetivo contra Fogo, Agua, Pedra, Dragao; nao afeta ninguem. Fogo defendendo: fraco contra Agua, Terra, Pedra; resiste a Fogo, Planta, Gelo, Inseto, Aco, Fada; imune a nada.
- Exemplo (conferido): Eletrico nao afeta Terra (x0); Normal nao afeta Fantasma; Fantasma nao afeta Normal.
- Defesa com 2 tipos (nice): produto dos dois multiplicadores, ex. Agua/Terra contra Planta = x2 * x2 = x4; Agua/Voador contra Eletrico = x2 * x2 = x4; Agua/Terra contra Eletrico = x2 * x0 = x0.

## 8. Casos de borda / caminhos tristes

- Nenhum tipo selecionado: a visao por tipo mostra a instrucao "escolha um tipo" e a tabela completa sem destaque.
- Grupo vazio (ex. Normal "forte contra"): mostra "nenhum", nunca some.
- 2o tipo igual ao 1o: nao permitido (mesma regra de `selectedTypes` da calculadora).
- Tela estreita: tabela 18x18 rola na horizontal; primeira coluna (atacante) fixa; nunca quebra o layout da pagina.
- Troca de idioma com tipo selecionado: nomes e frases trocam, selecao mantida.
- Tema de alto contraste / preto: celulas x2, x1/2, x0 precisam continuar distinguiveis (cor + texto, nunca so cor).

## 9. Referencia de UI

Modo: project-identity (identidade do app atual; o forge-ui-recon captura a Home, o Dex e a ficha deste repo). Componentes: TypeChip, TypeIcon, paineis `.panel` da ficha, abas no padrao existente (se houver abas no esqueleto; senao, botoes segmentados no padrao dos filtros do Dex).

## 10. Prioridades

Must: visao por tipo com Atacando/Defendendo (visual, por icones e cor, legivel de relance), tabela completa, legenda didatica, frases de intuicao, item na barra, i18n, testes.
Nice: defesa com 2 tipos.
Fora: por geracao.

## 11. Premissas confirmadas

- Pontin delegou todas as decisoes ("confio em voce"); o unico requisito explicito dele e "tem que ser algo didatico".
- Os dois apps compartilham `domain/type-chart.ts`, TypeChip/TypeIcon, `types.generated.css` e a navegacao (a base copia tudo sem mudanca de comportamento, PRD da base RF-104), entao a mesma pagina serve aos dois.

## 12. Pontos em aberto (lista viva)

- Nenhum. (A ordem exata do item na barra e as 18 frases de intuicao sao fechadas no PRD.)
