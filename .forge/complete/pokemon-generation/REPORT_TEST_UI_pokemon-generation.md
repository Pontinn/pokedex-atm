# REPORT TEST UI - pokemon-generation

Data: 2026-10-12. Build + `vite preview` na porta 4173 (encerrado ao final), Playwright 1.63 headless, sem slowMo, sem esperas fixas, contextos novos por fluxo. Desktop 1366x768 e phone 390x844. O harness bloqueou a escrita direta deste arquivo; o conteudo foi devolvido ao orquestrador, que o persistiu sem alterar os resultados (prosa traduzida para pt-BR).

## Fluxos

| Fluxo | Desktop | Phone | Nota |
|---|---|---|---|
| Cards do Dex: selo "Gen 1", sem raridade | OK | OK | 25 selos visiveis no desktop, 10 no phone |
| Mewtwo #150: selo Lendario antes de Gen 1, sem raridade | OK | OK | |
| `#f-game` ao lado de `#f-gen` (mesma linha, a direita) | OK | OK | phone: 2 colunas de cards, filtros em grade 2x2 |
| FRLG = 151; FRLG + Geracao 1 = 151 | OK | OK | |
| FRLG + Veneno = 33 (igual a contagem derivada do indice) | OK | OK | |
| Abrir um card, Voltar do navegador: jogo e chip restaurados, mesma contagem; "Todos" volta a 1027 | OK | OK | |
| Caminho triste: FRLG + busca sem resultado; limpar volta a 151 | OK | OK | |
| Capturados (semeado 94, 448, 150): 3 selos de geracao, sem raridade | OK | OK | |
| Detail #41: Hero com Geracao 1 antes de Comum; raridade mantida no "Onde encontrar" | OK | OK | |
| Cadeia do Zubat: 3 selos, so Crobat destacado, aria-label "Geracao 2, diferente da base", `findOverlaps` = 0 | OK | OK | |
| Painel Jogos depois de "Onde encontrar" e antes de "Melhores"; 20 chips em lista semantica (20 `li`); nota da National Dex; sem sobreposicao | OK | OK | |
| Tyrogue #236: Hitmonlee e Hitmonchan destacados, Hitmontop nao | OK | OK | |
| Pichu #172: Pikachu e Raichu destacados, Pichu nao | OK | OK | Raichu aparece duas vezes (variantes), ambas destacadas |
| Eevee #133: cadeia larga legivel, sem sobreposicao | OK | OK | |
| Custom 9901: "So no pack", sem chips | OK | OK | |
| Especie oficial com `games` = [] | n/a | n/a | o dataset nao tem nenhuma; coberto so por `games-panel.test.tsx` |
| Configuracoes: credito da PokeAPI em PT e EN | OK | OK | |
| EN: "Generation 1", filtro "Game" com label associado, painel "Games" / "Available in", aria-label em ingles | OK | OK | |
| Teclado: Tab a partir de `#f-gen` chega em `#f-game` (label "Jogo"), ArrowDown muda o valor; selo com texto acessivel | OK | n/a | |
| 7 temas no Zubat: outline solido; contraste classic 4,82, black 11,58, green 4,04, blue 6,09, purple 6,63, white 5,09, orange 14,14 (todos >= 3) | OK | n/a | |
| PWA offline (SW ativo, `setOffline`): recarregar Dex (FRLG = 151, selos) e Zubat (painel Jogos, Crobat destacado) | OK | n/a | dataset novo servido do precache |
| Varredura do Dex inteiro em 390x844 e 360x740: 1027 cards, selo em todos, nenhum cortado, fora do card ou sobreposto ao numero | n/a | OK | |

Total: 19 fluxos automatizados OK, 0 falhas, mais a varredura completa dos 1027 cards.

## Console e requisicoes

Contextos online: 0 erros de console e 0 respostas >= 400. O contexto PWA offline teve 17 requisicoes falhas de `/assets/items/*.png`: icones de item nao estao no precache, esperado offline e sem relacao com a feature.

## Visual

42 PNGs em `ui-refs/test/`, no tamanho da viewport: dex-cards, dex-mewtwo, dex-filters (e en), dex-frlg-poison, dex-frlg-empty, captured, detail-41 hero/evo/games (e games-en), detail-236/172/133-evo, detail-9901-games, settings-credit pt/en, theme-<tema>-evo (7), offline-detail-41. Comparados com `ui-refs/*` (recon) e `ui-refs/impl/*` (implementacao): mesma identidade. O selo fica no canto do card onde ficava a raridade, o selo da cadeia fica abaixo do nome com outline no destaque, e o painel Jogos usa chips em pilula com a nota em caixa alta. Outline legivel em classic, black e green (conferido a olho). Sem drift visual.

## Achados

Nenhum Critical, High, Medium ou Low em aberto.

Informativo:
- O estado "Nao aparece nos jogos oficiais" nao pode ser aberto no app (nenhuma especie oficial com `games` = []); coberto apenas por teste unitario.
- Icones de item fora do precache offline (comportamento preexistente, fora do escopo).

## Pendente para o Pontin (so em aparelho real)

- [ ] Celular: instalar o app (PWA), abrir a Pokedex e o Zubat, ativar modo aviao, fechar e reabrir o app, repetir o filtro FireRed / LeafGreen. Esperado: 151 cards, selos de geracao nos cards, Zubat com o painel Jogos e Crobat destacado na cadeia. O offline foi validado no Playwright com o service worker ativo; so o aparelho real confirma a instalacao e a atualizacao do SW.
