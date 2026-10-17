---
feature: natures
language: pt-BR
type: create
mode: quick
status: in-progress
created: 2026-10-17
repo: pokedex (Pontindex Cobblemon), branch feature/natures, worktree Projetos/pokedex-type-chart
also_in: pontindex (porte por copia de arquivo logo depois, branch feature/natures, worktree Projetos/pontindex-type-chart)
---

# IDEA - natures (pagina "Naturezas": o que cada natureza aumenta e diminui)

## 1. Objetivo

Pontin (2026-10-17): "Adicione as natures dos pokemons, assim como fez com os tipos, um pagina so pra isso" e "vou precisar de uma pagina q mostre oq cada nature aumenta ou diminui". Mesmo criterio da pagina Tipos: didatica, "so de bater o olho a pessoa ja sabe". Decisoes de design delegadas ("pode seguir autonomo ai"). Merge e push autorizados por ele na mesma mensagem.

Dor: Pontin esta aprendendo Pokemon (FireRed) e nao tem onde VER quais naturezas existem e o que cada uma muda. A calculadora da ficha (StatsCalculator) so lista as 25 num select, com "(+Ataque -Defesa)" no rotulo: serve para calcular, nao para aprender.

Criterio de sucesso: abrir a pagina, achar "Adamant/Rigida" e entender em 5 segundos que ela aumenta Ataque em 10% e diminui At. Esp. em 10%; ou escolher "Velocidade" e ver na hora as 4 naturezas que a aumentam e as 4 que a diminuem.

## 2. Decisoes (orquestrador, 2026-10-17, por delegacao)

Conferido antes: `src/domain/natures.ts` ja existe IDENTICO nos dois repos (25 naturezas, nomes pt/en, `up`/`down` em `BattleStatKey`, `natureModifier`). Nao existe tela de naturezas em nenhum dos dois. Rotulos de status existem em `core.ts` (`stat.atk`, `stat.def`, `stat.spa`, `stat.spd`, `stat.spe`). A pagina Tipos (`src/screens/Types/*`) e a referencia de identidade e de estrutura.

- Fonte unica = `src/domain/natures.ts`. NAO duplicar a tabela; nao alterar o dominio nem `StatsCalculator`.
- ScreenId `natures`, pasta `src/screens/Natures/` (NaturesScreen.tsx, NatureTable.tsx, NatureFocus.tsx, natures-model.ts, natures.css), i18n em `src/i18n/messages/natures-page.ts` (`nav.natures` "Naturezas"/"Natures", `nav.naturesSub` "O que cada uma muda"/"What each one changes", `natures.*`), registrado em `messages.ts` como `types-page.ts`. Item de navegacao em `SIDEBAR_ITEMS` logo DEPOIS de `types` (no celular entra na folha "Mais", nunca em `TAB_SCREENS`). Icone lucide 0.577.0 nao usado ainda, exportado em `Icon.tsx`: preferencia `Smile`, senao `Dna`.
- Estado da tela na pilha (`UiStateMap.natures`): `{ view: "table" | "byStat"; selected: string | null; stat: BattleStatKey | null }`, default `{ view: "table", selected: null, stat: null }`.
- Layout, de cima para baixo:
  1. `page-head` com h2 "Naturezas".
  2. Painel explicativo fixo (como a legenda de Tipos): "Toda natureza AUMENTA um status em 10% e DIMINUI outro em 10%. HP nunca muda. Cinco naturezas sao neutras: nao mudam nada." Com amostras de cor: verde = aumenta (+10%), laranja = diminui (-10%), cinza = neutra. Mesmos hex da pagina Tipos (`tone-adv` #E1F5E7/#1B6B3A, `tone-dis` #FFE9D6/#9A4A00, `tone-zero` #E6E7EC/#444A5C), copiados para `natures.css`.
  3. SegmentedControl "Tabela | Por status" (views `table` | `byStat`).
  4. Visao **Tabela** (padrao): `<table>` 5x5. Linha = status que AUMENTA (cabecalho verde "+ Ataque"), coluna = status que DIMINUI (cabecalho laranja "- Defesa"). Celula = botao com o nome da natureza; a diagonal (mesmo status) traz a natureza neutra em cinza com a marca "neutra". Canto superior esquerdo explica: "linha = aumenta, coluna = diminui". Clicar numa celula seleciona (`selected`) e abre o painel de foco abaixo da tabela; a celula selecionada ganha o anel `.on` como o `tp-pick.on` de Tipos.
  5. **Painel de foco** (NatureFocus): nome grande no idioma da UI com o nome em ingles menor embaixo quando a UI esta em pt (Pontin joga em ingles); dois chips grandes: "+10% Ataque" verde e "-10% At. Esp." laranja; natureza neutra mostra um chip cinza "Neutra: nenhum status muda". Uma frase de uso gerada por template (nao 25 frases a mao): "Boa para quem usa {up} e nao depende de {down}"; neutra: "Nao atrapalha nem ajuda: serve para qualquer Pokemon".
  6. Visao **Por status**: 5 chips-botao (Ataque, Defesa, At. Esp., Def. Esp., Velocidade). Ao escolher um, duas faixas: verde "Aumentam {stat} (+10%)" com as 4 naturezas (cada uma com "-{down}" pequeno) e laranja "Diminuem {stat} (-10%)" com as 4 (cada uma com "+{up}" pequeno). Abaixo, faixa cinza fixa "Neutras" com as 5. Clicar numa natureza aqui tambem seleciona e mostra o foco.
- Nomes das naturezas sempre por `uiLanguage` (nunca pelo toggle de termos, que so existe no Cobblemon), como em Tipos.
- Celular (`.app.mobile`, < 900 px): a tabela 5x5 precisa caber em 360 px sem sobreposicao (harness `tests/harness/no-overlap.ts` trata button/.chip/.seg como controles): cabecalhos com os rotulos curtos de `core.ts` ("At. Esp.", "Def. Esp.") e fonte menor; se nao couber, rolagem horizontal com a primeira coluna fixa como a matriz de Tipos. Painel explicativo compacto no celular como em Tipos.
- Cor SEMPRE acompanhada de sinal (+10% / -10% / neutra): temas preto e branco e acessibilidade.
- Simbolos "+10%", "-10%" sao constantes de string (lint `no-literal-jsx-text`); zero U+2014 em qualquer texto.
- Porte: a pagina so depende de arquivos compartilhados pelos dois apps (natures.ts, SegmentedControl, core.ts, navegacao, i18n). Depois de verde aqui, copia de arquivo para o pontindex (mesmos arquivos, mesmo item de nav, mesmas chaves, testes de shell/e2e do oficial ajustados).

## 3. Escopo

In-scope: pagina nova com as duas visoes + foco, item de nav, i18n pt/en, estado na pilha, testes unit (modelo + render) e e2e (navegacao, selecao, as duas visoes, celular 360 sem sobreposicao, smoke dos temas), capturas em `.forge/ideas/natures/captures/` (1280 e 360).

Out-of-scope / NAO tocar: `src/domain/natures.ts`, `StatsCalculator.tsx`, sabores de bagas/Pokeblocks (gosta/nao gosta), link da calculadora para a pagina, naturezas por geracao (nao variam), qualquer outra tela alem do item de nav e do registro.

## 4. Superficie de regressao

Navegacao (barra, folha "Mais", pilha, Voltar), testes de shell que listam os itens (`tests/e2e/shell.spec.ts`, `tests/unit/ui-shell/shell.test.tsx`, qualquer `.nth(` em tests/ conforme LESSONS type-chart), baselines do `responsive.spec` se a sidebar aparecer nelas, calculadora da ficha (compartilha o dominio).

## 5. Plano inline (quick)

- F1 nav + registro: ScreenId/SCREEN_IDS/ScreenParamsMap/UiStateMap/defaultUi, registry, nav-items, Icon.tsx, i18n `natures-page.ts` + `messages.ts`, tela vazia renderizando; ajustar os testes de shell que listam itens.
- F2 modelo + Tabela + foco: `natures-model.ts` (grade 5x5 derivada de NATURES, grupos por status, helpers de rotulo), NatureTable, NatureFocus, natures.css; unit do modelo (25 naturezas, 5 neutras na diagonal, 4 por status em cada direcao, toda celula preenchida).
- F3 Por status: chips de status + faixas + neutras; unit de render da tela.
- F4 celular + temas + a11y: 360 px sem sobreposicao, `aria-pressed`/`aria-label`, foco visivel (precedente types.css), painel compacto.
- T1 e2e `tests/e2e/natures.spec.ts` (padrao de `types.spec.ts`, proporcional: nao a bateria inteira), capturas 1280/360 das duas visoes com uma natureza selecionada, suite completa + typecheck + lint + build verdes.

## 6. Pontos em aberto

Nenhum. (Nice-to-have fora: sabores de bagas; link a partir da calculadora.)
