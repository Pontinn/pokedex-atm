# REPORT TEST UI - type-chart (pagina Tipos)

Executado por forge-test em 2026-10-12 (17:03 a ~17:20), alvo local (`vite preview` em :4178, e2e em :4177). Sem API: a feature e estatica, **nao tem endpoints, credenciais nem autorizacao**; as secoes de API foram puladas.

## Regressao (passo 0)

| Gate | Resultado |
|---|---|
| typecheck (`tsc -b --noEmit`) | limpo |
| lint (`eslint .`) | limpo |
| vitest + coverage | 96 arquivos, 823 testes, todos passam; cobertura All files 94.59 stmts / 88.46 branch / 91.97 funcs / 94.59 lines |
| e2e build + preview | 301 passed, 16 skipped, 0 failed (os 2 flakes preexistentes, dex.spec.ts:324 e items.spec.ts:69, passaram nesta rodada) |
| harness (`test:harness`) | 7 passed |

Ruido restaurado com `git checkout --`: `types.generated.css` e `type-css.test.ts.snap`.

## Fluxos (passo 2, Playwright headless, sem slowMo/sleep)

| Fluxo | Resultado | Notas |
|---|---|---|
| Sidebar "Tipos" ativo | OK | classe `active` |
| 18 chips + instrucao sem tipo | OK | |
| Fogo: heroi, frase, 3 faixas | OK | "Forte contra (x2) / Pouco efetivo contra (x1/2) / Nao afeta (x0)" |
| Frases PT (fire/water/ghost/normal) | OK | naturais |
| Faixa vazia (Normal atacando x2) | OK | mostra "nenhum" |
| Tocar de novo no mesmo tipo | OK | continua selecionado |
| Defendendo: cores (laranja x2, verde x1/2, cinza x0) | OK | tons `dis,adv,zero`; simbolo sempre no titulo |
| Normal defendendo x0 = Fantasma; Agua>Fogo x2; Eletrico>Terra x0 | OK | confere com `type-chart.ts` |
| Select 2o tipo so em Defendendo; sem o proprio tipo | OK | 17 tipos + Nenhum |
| Agua+Terra: x4 e x1/4 | OK | 5 faixas (x4, x2, x1/2, x1/4, x0) |
| Trocar 1o tipo para o do 2o | OK | 2o limpa, heroi so Terra |
| Voltar para "Nenhum" | OK | tipo unico |
| Troca de aba x6 | OK | sem erro |
| Tabela completa: aria-label "Fogo contra Planta: x2" etc | OK | |
| Cabecalho seleciona + destaca linha/coluna (clique e Enter) | OK | `is-sel` / `is-col` |
| Tab/foco | OK | anel solido 2px a 3px em todas as paradas testadas |
| Voltar restaura tipo/aba | OK | |
| Phone 360: scroll so da tabela, 1a coluna fixa, pagina nao rola de lado | OK | |
| EN: sem palavra PT; label "Fire against Grass: x2" | OK | texto em `ui-refs/test-en-text.txt` |
| 7 temas x desktop/phone x 2 visoes | OK (renderiza) | 28 capturas; julgamento visual fino fica para o Pontin |
| Charizard: painel de fraquezas | OK | comparacao fina com a main nao feita |
| Console / rede | OK | 0 erros de console, 0 respostas 4xx locais |
| Roda horizontal do mouse na tabela (360) | nota | scrollLeft ficou 0 com `mouse.wheel(300,0)` apos reset; scroll programatico funciona. Gesto de dedo real ficou para o usuario |

## Checklist manual
5 itens `[ ]` restantes, todos de olho humano (ja anotados no arquivo): frases em EN, "sem piscar", gesto de dedo no celular real, leitor de tela, olhar os 7 temas. Resolvidos `[x]` por mim: 6 (sidebar ativo, faixa vazia, select sem o proprio tipo, trocar 1o tipo, varredura EN, Charizard). Nenhum `[!]`.

## Visual (passo 3)
Comparado `test-*` com `after-f22/f23/f31/f41-*`: identidade preservada (sidebar vermelha, cards brancos arredondados, chips de tipo com gradiente, tipografia Fredoka/Nunito, destaque do item ativo, tons verde/laranja/cinza fixos nos 7 temas). Sem deriva. Capturas em `.forge/in-progress/type-chart/ui-refs/`:
`test-empty-desktop-classic.png`, `test-empty-phone.png`, `test-bytype-fire-attack-desktop.png`, `test-bytype-fire-attack-phone.png`, `test-bytype-fire-defend-desktop.png`, `test-bytype-fire-defend-phone.png`, `test-bytype-normal-attack-desktop.png`, `test-bytype-water-ground-defend-desktop.png`, `test-chart-desktop.png`, `test-chart-grass-desktop.png`, `test-chart-phone.png`, `test-chart-phone-scrolled.png`, `test-chart-en-desktop.png`, `test-focus-desktop.png`, `test-detail-charizard-desktop.png`, `test-theme-<tema>-<desktop|phone>-<bytype|chart>.png`.

## Higiene de dados (passo 4)
localStorage vazio; IndexedDB so com `meta` e `preferences`; DOM sem token/secret/password/api key. Contextos de teste descartados.

## Achados
- Critical: nenhum. High: nenhum. Medium: nenhum.
- Low: a legenda (5 linhas no phone) ocupa cerca de 40% da primeira tela e empurra os chips para baixo; avaliar se vale recolher no celular (subjetivo, nao e bug). Arquivo: `src/screens/Types/` (legenda).
- Low (a confirmar): roda horizontal do mouse nao moveu a tabela no teste simulado; confirmar com dedo real.

Definicao de pronto: sem Critical/High abertos; restam 5 itens exclusivamente humanos.
