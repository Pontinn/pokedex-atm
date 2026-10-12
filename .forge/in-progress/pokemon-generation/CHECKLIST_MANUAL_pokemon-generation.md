# CHECKLIST MANUAL - pokemon-generation

Legenda: `[ ]` pendente · `[x]` feito · `[A]` coberto por teste automatizado (arquivo indicado) · `[!]` bug

## Backend

Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20261012-78568233` (commit `a4d1cf4e`). Anterior: `atm1.3.0-cobblemon1.7.3-20260930-1949ea67` (removido pelo `write.ts`).

Commits: S0.1 `748cbeba`, B1.1 `64e0b4f1`, B1.2 `11423420`, B1.3 `89c1b8cf`, B2.1 `f7ba7273`, B2.2 `a4d1cf4e`, T1.1 `4bc9dc74`, T1.2 `bdda90a3`.

### Testes automatizados do backend

| Arquivo | O que cobre |
|---|---|
| `tests/unit/dataset/game-availability.test.ts` (novo, 19 testes) | `loadGameSnapshot` (ausente, JSON quebrado, campo extra no topo e aninhado, curado passa); `deriveGames` no recorte REAL contra a regra reimplementada no teste (exclusoes nominais, DLC fundido por subconjunto proprio, conjuntos iguais separados, nome "FireRed / LeafGreen", ordem); sinteticos (desempate por id, espelho quebrado nos dois sentidos, Pokedex/grupo inexistente, id duplicado, nenhum jogo); `buildGameAvailability` + `gamesForSpecies` (FRLG = kanto 1..151, Zubat/Golbat sim e Crobat nao, Hitmonlee sim e Tyrogue nao, custom `null`, custom colidindo, oficial fora, oficial sem jogo `[]`); `gameSnapshotSource` canonica; build sem rede (fetch trocado nunca chamado, sem `.cache`); coletor com msw (objeto esperado, `urls` relativas ordenadas, `source.api` real, 0 requisicoes com cache, paginacao, sem nome EN, espelho, 404, URL de especie fora do padrao); CLI (`parseSnapshotArgs`, `runSnapshotCli` com cliente injetado e `--out`); separacao do coletor, scripts npm, origem e segredos |
| `tests/unit/dataset/audit.test.ts` (describe `audit: generation in the chain and games (pokemon-generation)`, 2 testes) | `compare` sobre copia do publicado: limpo = 0 divergencias nos checks novos e checks >= 46.768 + 1027 x 2 + nos + 4; geracao adulterada do no 169 na ficha 41, id 7 tirado do Zubat so no indice e `games: [1]` no 9901 = lista exata de WRONG DATA (inclui os fatos fixos de Red / Blue e FireRed / LeafGreen); catalogo sem Gold / Silver = MISSING + EXTRA por especie com o id; sem catalogo = MISSING |
| `tests/unit/dataset/join.test.ts` (describe `pokemon-generation: games and chain generation`, 4 testes) | pipeline completo no snapshot em pasta temporaria: catalogo = regra reimplementada sobre o recorte; `games` de TODA especie derivado por numero; `null` sse custom; indice = ficha; todo no com a geracao da especie; contagem de geracoes = `buildExpected()` da auditoria; ultima `sources` canonica; versao nova |
| `tests/unit/data/published-schemas.test.ts` (1 teste novo) | ficha 41 e manifest publicados passam sem campo descartado; campo extra em `games[0]`, manifest sem `games`, entrada do indice sem `games`, `games: [1.5]`/`[0]`, no sem `generation` rejeitados; `games: null` e `[]` passam |
| `tests/unit/data/precache-budget.test.ts` (novo) | soma gzip (`zlib.gzipSync`) de `current.json` + `{dataset-manifest,species-index,type-chart}.json` publicados cresce <= 10.240 bytes sobre a linha de base 37.751; glob de dado do `vite.config.ts` fixado |

Como rodar:

- `npx vitest run tests/unit/dataset tests/unit/data` (backend inteiro)
- `npx vitest run --coverage` (limites do `vitest.config.ts`; `tools/dataset/src/**` em 93,84% linhas / 85,18% branches; `games/availability.ts` 100 / 98,68)
- `npx tsx tools/dataset/audit/run.ts` (auditoria no publicado; reescreve `AUDIT_REPORT.md`: restaurar com `git checkout -- tools/dataset/audit/AUDIT_REPORT.md`, a Rodada 7 ja esta no topo)
- `npm run dataset:snapshot-games -- --out <arquivo fora do repo>` (so com internet; confere a captura sem mexer no recorte versionado)

### Regressao das areas tocadas

- [x] Linha de base S0.1 antes de qualquer mudanca: vitest 744/744, e2e 253 ok + 16 pulados + 0 falha/flaky, dataset regerado identico (sufixo `1949ea67`), gzip 37.751, auditoria 46.768 / 0.
- [x] Dataset regenerado (`npm run dataset -- --offline`); `public/data/current.json` aponta para `...-78568233` e a pasta existe; `public/assets` intocado.
- [x] Determinismo: 2a execucao no mesmo dia (`--publish-dir tools/dataset/out/_pg_again`) = mesma `datasetVersion` e os 1044 arquivos iguais (manifest so `generatedAt`).
- [x] So acrescimos contra `...-1949ea67`: mesma lista de 1044 arquivos; 15 arquivos fora de indice/fichas/manifest byte a byte iguais; indice e fichas iguais sem `games`/`nodes[].generation`; manifest igual sem `datasetVersion`/`generatedAt`/`sources`/`games`; `sources` antigo = prefixo (11 -> 12).
- [A] Contrato estrito sem campo descartado (`published-schemas.test.ts`).
- [A] Catalogo de 22 jogos e `games` por especie derivados do recorte (`join.test.ts`, `game-availability.test.ts`); Zubat, Crobat, Tyrogue, Hitmonlee, Charizard, 9901 e 9902 iguais a SPEC 5.3 (conferido tambem no publicado).
- [A] `generation` em todos os 2316 nos (`join.test.ts`; auditoria).
- [A] Auditoria independente: 51.146 checks (46.768 + 4.378 novos), 0 divergencias (Rodada 7 do `AUDIT_REPORT.md`; `audit.test.ts`).
- [A] Orcamento do precache: 88 + 1.434 + 38.336 + 547 = 40.405 gzip (+2.654; teto 47.991) (`precache-budget.test.ts`).
- [A] Build do dataset sem rede para jogos; coletor e CLI isolados do pipeline (`game-availability.test.ts`).
- [x] Recorte curado com origem (`source.api`, `capturedAt` 2026-10-12T05:08:37.859Z, 123 `urls`, `script`, `license`); sem token/segredo e sem caminho local (`git grep`); sem travessao.
- [x] `report.json`: secao `games` (`perGame` = coluna "especies" da SPEC 5.3, `packOnly` [9901, 9902], `officialWithoutGame` []); 190 avisos, identicos aos de antes.
- [x] READMEs: `tools/dataset/README.md` (Uso, Saida/Jogos, Erros) e `data-source/README.md` (linha do pokemon-generation).

### Janela quebrada do dataset (B1.1 -> B2.2)

- [x] Aberta em B1.1 (`64e0b4f1`): `published-schemas.test.ts` excluido; nenhum e2e rodado ate a republicacao.
- [x] Fechada em B2.2 (`a4d1cf4e`): `published-schemas.test.ts` + `join.test.ts` verdes (47); `npx vitest run` inteiro verde (88 / 744 antes dos testes de T1).
- [x] Portao de nao-regressao do dado com a UI intocada: `npm run build` + `npx playwright test` inteiro = 253 ok, 16 pulados, 0 falha, 0 flaky (igual a S0.1); 7 visuais de `responsive.spec.ts` sem atualizar baseline.
- [ ] Manual (opcional, sem regressao esperada): abrir o app com `npm run dev`, Pokedex e ficha do Charizard carregam com o dataset novo (sem tela de erro de boot).

### Observacao

- [!] Flake de tempo preexistente fora da feature: `tests/unit/domain/bait.test.ts:106` (pior chamada de `recommendBerries` < 5 ms) falhou 1 de 3 rodadas da suite inteira (5,17 ms) sob carga paralela; isolado 3/3 verde. `recommendBerries` nao le `games` nem `generation`. Registrado em "Bugs encontrados" do checklist; nenhum assert mexido.

## Frontend

Commits: F1.1 `6b398719`, F1.2 `94e4f6c7`, F1.3 `cd8979f1`, F2.1 `74a6032e`, F3.1 `66cc9532`, F3.2 `e2f49362`, F3.3 `043dc2ea`, F4.2 `3072a77c`, T1.3 `f9bfe94d`, T1.4 `f514e80f`.

Como rodar: `npm run dev` (app em http://localhost:5173) ou `npm run build && npx vite preview` (para o PWA). Testes: `npx vitest run tests/unit/ui-screens`; `npx playwright test tests/e2e/dex.spec.ts tests/e2e/detail.spec.ts tests/e2e/captured.spec.ts tests/e2e/settings.spec.ts tests/e2e/pwa-offline.spec.ts tests/e2e/responsive.spec.ts tests/e2e/navigation.spec.ts`.

### Selo de geracao (card, Capturados, Hero)

- [A] Pokedex: cada card mostra o selo curto no lugar da raridade: Zubat "Gen 1", Pichu (169) "Gen 2", Meltan (808) "Gen 7 (Let's Go)", Wyrdeer (899) "Gen 8 (Arceus)", especie do pack (9901) "Pack" (`dex.spec.ts`, `generation-badge.test.tsx`).
- [A] Nenhum card mostra raridade (Comum/Incomum/Raro/Ultra-raro) em nenhuma posicao da rolagem (`dex.spec.ts`, `generation-badge.test.tsx` nas 1027 especies).
- [A] Mewtwo e Mew: selo especial (Lendario/Mitico) antes do selo de geracao (`dex.spec.ts`).
- [A] Selos nunca quebram linha nem sobrepoem o numero, com Meltan e Wyrdeer a 360/390/1280 em PT e EN (`dex.spec.ts`).
- [A] Capturados: os cards semeados mostram o selo de geracao e nenhuma raridade (`captured.spec.ts`).
- [A] Hero do Charizard: "Geração 1" + raridade; em EN "Generation 1"; Mewtwo: Lendario + "Geração 1" + raridade (`detail.spec.ts`).
- [A] Raridade continua no painel "Onde encontrar" (`detail.spec.ts`, testes existentes de `.where-rarity`).
- [ ] Manual: no celular (ou DevTools 390x844), rolar a Pokedex inteira e conferir visualmente que nenhum selo fica cortado.

### Cadeia de evolucao

- [A] Zubat: Zubat e Golbat sem destaque, Crobat (Gen 2) destacado com contorno; aria-label "Geração 2, diferente da base" (`detail.spec.ts`, `detail-generation.test.tsx`).
- [A] Tyrogue: Hitmonlee e Hitmonchan destacados, Hitmontop NAO (`detail.spec.ts`, `detail-generation.test.tsx`).
- [A] Charmander: nenhum destaque (todos Gen 1) (`detail.spec.ts`).
- [A] Destaque nao depende so de cor: contorno solido de 2px, continua com o app em tons de cinza (`detail.spec.ts`).
- [A] Nenhum nome de jogo aparece na cadeia nem nos cards (`detail.spec.ts`, `dex.spec.ts`).
- [ ] Manual: abrir Eevee (133) e Pichu (172) e conferir que a cadeia larga continua legivel no celular, selo abaixo do nome sem cobrir o sprite.

### Filtro "Jogo" na Pokedex

- [A] Select "Jogo" logo depois de "Geração", com "Todos" + os 22 jogos na ordem do catalogo (`dex.spec.ts`, `dex-screen.test.tsx`).
- [A] FireRed / LeafGreen = 151 cards, exatamente as especies com o jogo; Zubat e Golbat aparecem, Pichu nao (`dex.spec.ts`).
- [A] Combinado: FRLG + Veneno reduz por E logico; FRLG + Geração 2 = estado vazio (`dex.spec.ts`).
- [A] FRLG + Fogo, abrir Charizard e voltar (Voltar do navegador): o jogo e o chip de tipo continuam selecionados e a contagem e a mesma (`dex.spec.ts`).
- [A] "Todos" volta a 1027 (`dex.spec.ts`).
- [A] Filtros sem sobreposicao nem rolagem horizontal a 360/390/1280 PT/EN (`dex.spec.ts`).
- [A] Teclado: Tab do "Geração" chega no "Jogo", rotulo resolve, seta para baixo troca o valor (`dex.spec.ts`).
- [A] Trocar o jogo nao baixa nenhum arquivo de dado novo (`dex.spec.ts`).
- [ ] Manual (infeliz): escolher um jogo e digitar uma busca sem resultado; a tela mostra o estado vazio e limpar a busca volta a lista do jogo.

### Painel "Jogos" no Detail

- [A] Zubat: lista na ordem do catalogo com FireRed / LeafGreen e a nota da Pokedex regional (`detail.spec.ts`, `games-panel.test.tsx`).
- [A] Crobat e Tyrogue sem FRLG; Hitmonlee com (`detail.spec.ts`).
- [A] Especie do pack (9901): "Só no pack", sem nota e sem chips (`detail.spec.ts`).
- [A] Especie oficial sem jogo: "Não aparece nos jogos oficiais"; manifest ausente: painel nao aparece (`games-panel.test.tsx`).
- [A] EN: "Games", "Available in" e a nota em ingles (`detail.spec.ts`).
- [A] Celular 360/390: todos os chips visiveis dentro do painel, sem sobreposicao nem rolagem horizontal (`detail.spec.ts`).
- [ ] Manual: conferir que o painel fica logo abaixo de "Onde encontrar" e acima de "Melhores" no desktop e no celular.

### Credito, idioma e temas

- [A] Configuracoes > Sobre: "Jogos de cada Pokémon: PokeAPI (recorte no build)" e em EN "Games each Pokémon appears in: PokeAPI (snapshot at build time)"; credito de imagens intacto (`settings.spec.ts`, `settings-screen.test.tsx`).
- [A] Toggle PT/EN troca todos os textos novos (selo, cadeia, filtro, painel, credito) (`dex.spec.ts`, `detail.spec.ts`, `settings.spec.ts`, `generation-badge.test.tsx`).
- [A] 7 temas: contraste do selo >= 4,5:1 no Hero e nos estagios e do contorno do destaque >= 3:1 (`detail.spec.ts`).
- [A] Baselines visuais: 7 `home-*` inalterados, 7 `detail-charizard-*` regravados com o selo (`responsive.spec.ts`).
- [ ] Manual: percorrer os 7 temas (Configuracoes > Tema) na Pokedex e no Zubat e conferir legibilidade do selo e do contorno a olho.

### PWA offline com o dataset novo

- [A] Com o service worker ativo, offline: Pokedex com o filtro FRLG mostra 151 e o Zubat ja visitado mostra o painel Jogos e o destaque do Crobat; nenhum dominio novo (`pwa-offline.spec.ts`).
- [ ] Manual: no celular, instalar o app, abrir a Pokedex e o Zubat, ativar modo aviao, reabrir e repetir o filtro FRLG.

### Regressao

- [A] Suite completa (vitest + e2e) igual ou melhor que a linha de base S0.1 (T1.5: vitest 800/800, e2e 276 ok / 16 pulados / 0 falha; numeros no STATE).
