# CHECKLIST MANUAL - berry-mutations

Legenda: `[ ]` pendente · `[x]` feito · `[A]` coberto por teste automatizado · `[!]` bug

## Backend

Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260930-1949ea67` (commit `89840201`). Anterior: `atm1.3.0-cobblemon1.7.3-20260929-2ef2f512` (removido).

Commits: B1.1 `e5ba8bb0`, B1.2 `ff17d2ce`, B2.1 `ea3aa9a1`, B2.2 `89840201`, T1.1 `6895614b`, T1.2 `98169952`.

### Testes automatizados do backend

| Arquivo | O que cobre |
|---|---|
| `tests/unit/dataset/berry-mutations.test.ts` | `buildBerryOrigins` com fixtures sinteticas (par simetrico, assimetrico, id desconhecido, parceiro sem arquivo, 3 variantes com e sem namespace, variante desconhecida, `specific_biome` sem `biome`, ordem por code unit, `mutations` nao-objeto); `collectBerryOrigins` no snapshot comparado ao recalculo direto dos 70 arquivos crus (resultados, spawn, pares, usos, 0 avisos `W_BERRY_*`); Cheri/Lum/Liechi da SPEC 5.3; `collectBerryPlantable` inalterado (Occa) |
| `tests/unit/dataset/audit.test.ts` (2 testes novos no fim) | `buildExpected().berries` (uma por arquivo cru, Liechi `specificBiome`, Oran `allBiome`); `compare` sobre copia adulterada do dataset publicado: par removido da Lum = WRONG DATA, `berry` num apricorn = EXTRA |
| `tests/unit/dataset/join.test.ts` (describe `berry-mutations: berry origin and crossbreeding`) | pipeline completo no snapshot: so as bagas com arquivo tem `berry`, todas `category: "berry"`; resto `null`; conjuntos de origem iguais aos arquivos crus; 3 variantes; `plantable` das 110 inalterada; versao nova. O teto de bytes continua no assert existente da linha 322 |
| `tests/unit/data/published-schemas.test.ts` (1 teste novo) | dataset publicado passa no schema estrito; campo extra em `berry`/`spawn[]`/`mutationPairs[]` e `variant` fora do enum rejeitados; `berry: null` passa; item sem a chave `berry` rejeitado |

Como rodar:

- `npx vitest run tests/unit/dataset tests/unit/data` (backend inteiro)
- `npx vitest run --coverage` (limites do `vitest.config.ts`; `tools/dataset/src/**` ficou em 93,87% linhas / 84,67% branches; `berries.ts` 100% / 90,41%)
- `npx tsx tools/dataset/audit/run.ts` (auditoria no dataset publicado; reescreve `AUDIT_REPORT.md`, restaurar com `git checkout` e manter so a nota da rodada)

### Regressao das areas tocadas

- [x] Dataset regenerado a partir do snapshot (`npm run dataset -- --offline`); `public/data/current.json` aponta para `...-1949ea67` e a pasta existe.
- [x] Segunda execucao no mesmo snapshot (`--publish-dir tools/dataset/out/_bm_again`) gera a mesma `datasetVersion` e o mesmo `items.json` (sha256 igual).
- [x] Nao-perda: os 951 itens do `items.json` novo, sem a chave `berry`, sao identicos (`JSON.stringify`) aos do dataset anterior; abilities, balls, biomes, fossils, moves, series e species-index byte a byte iguais.
- [A] `items.json` passa no schema zod estrito do app sem campo descartado (`published-schemas.test.ts`).
- [A] Rota `plantable` das 110 (70 bagas + 40 apricorns/mints) igual a de antes: bagas com `preferredBiomeTags`, apricorns e mints com `[]` (`join.test.ts`; conferido tambem por id contra o dataset anterior em B1.2).
- [A] `ItemInfo.berry`: 70 bagas nao nulas, 881 itens `null`; 31 com spawn (28 preferredBiome, 2 allBiome, 1 specificBiome), 40 resultados de par, 77 pares, 154 usos, todos iguais ao recalculo dos arquivos crus (`berry-mutations.test.ts`, `join.test.ts`).
- [A] Cheri, Lum e Liechi iguais a SPEC 5.3 (`berry-mutations.test.ts`; conferido tambem byte a byte no `items.json` publicado).
- [A] Auditoria independente (`npx tsx tools/dataset/audit/run.ts`): 46768 checks (46558 + 210 novos), 0 divergencias (Rodada 6 no `AUDIT_REPORT.md`).
- [x] Byte a byte instancia real x snapshot: `items.json` igual; sha256 (publicado = snapshot = instancia = repeticao) `464846fcfeded8de70dfc810d21500e198af3fc5c812ab161bcaece91cd4d558`. Refazer: os 2 comandos de B2.2 passo 1 da SPEC + `sha256sum`. A `datasetVersion` dos dois difere por desenho (o manifest guarda tamanho/mtime das fontes).
- [A] Tamanho: `items.json` 1.533.158 bytes (<= 1.659.908, assert existente `join.test.ts:322`); era 1.499.586.
- [x] Nenhum arquivo copiado para o snapshot (os 70 `berries/*.json` ja eram identicos ao jar real); `MANIFEST.json` e `data-source/README.md` sem mudanca.
- [x] `git grep -n "Usuario\|USERPROFILE" -- src tools/dataset/src` sem resultado; nenhum travessao nos arquivos tocados.
- [x] Pipeline: `report.json` sem aviso `W_BERRY_*`; secao `berries` = `{ items 70, withSpawn 31, spawnVariants 28/2/1, mutationResults 40, pairs 77, uses 154, bothOrigins [liechi] }`.
- [x] Nenhuma chamada de rede nova no pipeline (tudo `--offline`, cache da PokeAPI local).

### Casos de borda do pipeline

- [A] Variante de spawn desconhecida: pulada com `W_BERRY_SPAWN_UNKNOWN` (inclui chave de prototipo como `toString`).
- [A] `specific_biome` sem `biome`: pulada com `W_BERRY_SPAWN_BIOME_MISSING`.
- [A] Par assimetrico: entra do mesmo jeito com `W_BERRY_MUTATION_ASYMMETRIC`.
- [A] Resultado sem arquivo de baga: nao gravado, `W_BERRY_MUTATION_UNKNOWN_ID`.
- [A] `mutations` ausente, nao objeto ou com valor nao string: sem pares.
- [A] Ordem deterministica por code unit (nao por locale).

### Papeis e acesso

- N/A: sem endpoint, sem login, sem papel (SPEC 5c). O unico "papel" (visitante) le o mesmo dataset estatico.

## Frontend

Commits: F1.1 `7e2c8c5b`, F1.2 `b0623b17`, F1.3 `75d7ade4`, F1.4 `ca290bc5`, F1.5 `16edd960`, F2.1 `91a01fca`, F2.2 `e013fcc3`, T1.3 `65e88bcb`, T1.4 `96207def`, T1.5 `53b2875c`.

Capturas `after-*` em `ui-refs/` (comparar com os `recon-*` do mesmo alvo). Testes: `tests/unit/ui-screens/berry-model.test.ts` (regras puras no dataset real), RTL `item-berry.test.tsx`/`items-origin.test.tsx` (T1.4), e2e nos blocos `berry-mutations` de `item.spec.ts`/`items.spec.ts` e no teste offline de `pwa-offline.spec.ts` (T1.5).

### Pagina do item (fluxo feliz)

- [ ] Abrir Itens > aba Berries > Baga Lum: em "Como obter" aparece "Como cruzar" com "Baga Oran + uma destas: Aspear, Cheri, Chesto, Pecha, Rawst", a linha "Chance: 12,5% por colheita; 50% com Adubo Surpresa" e a explicacao dos 4 vizinhos. Conferir se o texto le bem para quem joga.
- [ ] Clicar numa baga do par (ex. Cheri): abre a pagina dela; Voltar volta para a Lum.
- [ ] Clicar em "Adubo Surpresa": abre a pagina do adubo; Voltar volta.
- [ ] Starf -> Pomeg -> Sitrus -> Lum -> Oran pelos botoes do "Como cruzar"; Voltar volta passo a passo (e2e usa o botao Voltar da pagina; conferir tambem o Voltar do navegador/gesto do celular).
- [ ] Baga Occa: "Plantavel" some; no fim de "Como obter" aparecem "Encontrada no mundo" (Nasce sozinha em: Selva, Arenoso, Termal, Vulcanico) e "Cresce melhor em" (Rende mais frutas nos biomas: os mesmos 4). Conferir se a repeticao dos mesmos biomas nas duas linhas fica clara (hoje todas as bagas `preferredBiome` repetem, por regra do jogo).
- [ ] Baga Oran: "Nasce sozinha em qualquer bioma" sem chips; em "Usado em" a linha "Usada em cruzamento" com 2 grupos (= Leppa, = Lum).
- [ ] Baga Liechi: "Encontrada no mundo" com "Mirage Ilha" e tambem "Como cruzar" (Kelpsy + Pamtre).
- [ ] Baga Sitrus: sem "Encontrada no mundo"; com "Cresce melhor em" e "Como cruzar".
- [ ] Baga Enigma a 360 px (celular real): Hopo + 18 bagas quebrando em varias linhas, sem vazar nem "e mais N".
- [ ] Baga Hopo a 360 px: "Usada em cruzamento" com 18 parceiras e "= Baga Enigma", sem vazar.
- [ ] Trocar a interface para EN e o toggle PT/EN do card: titulos seguem a interface ("How to crossbreed", "12.5%", "50% with"), nomes das bagas seguem o toggle do card.

### Pagina do item (sem mudanca)

- [A] Red Apricorn e Adamant Mint: "Plantavel / Pode ser plantado" identico ao de antes, sem linha nova.
- [A] Fire Stone, Enchanted Golden Apple e qualquer item nao-baga: paineis e linhas iguais aos de antes.
- [ ] Olhar 2 ou 3 paginas de itens nao-baga ao acaso e confirmar que nada mudou visualmente.

### Listagem de itens

- [ ] Aba Berries: cada card de baga mostra MUTACAO ou MUNDO abaixo do nome; Liechi mostra as duas; o selo "BERRIES" continua em cima do nome, igual a antes.
- [ ] Apricorns, mentas e nao-bagas sem selo novo.
- [ ] Filtro "Todos / Mutacao / Mundo" entre a busca e as abas: Berries + Mutacao = 40, Berries + Mundo = 31, Iscas + Mutacao = 40, Medicina + Mutacao = estado vazio.
- [ ] Com "Todos" a listagem e exatamente a de antes (mesma contagem por aba).
- [ ] Filtro + aba + busca voltam iguais depois de abrir uma baga e usar Voltar.
- [ ] Celular (360/390): o filtro vira uma faixa de largura total acima das abas, sem cortar e sem rolagem vertical; conferir se nao confunde com as abas.
- [ ] Temas (7): selos de origem legiveis em todos, principalmente black e os claros; foco por teclado visivel nos botoes do filtro e nos chips de baga.

### Offline e desempenho

- [ ] Com o app instalado (PWA), modo aviao: listagem com selos e filtro e a pagina da Lum com "Como cruzar" funcionam.
- [ ] Nenhuma requisicao nova na aba Network ao abrir listagem e pagina (so `items.json`, `biomes.json`, `balls.json` e texturas).

### Casos que a automacao nao cobre

- [ ] Julgamento visual: o selo de origem (neutro, `--surface-2`) nao compete com o selo de categoria; "uma destas:" e o "=" leem bem em PT e EN.
- [ ] Leitor de tela: o grupo do filtro anuncia "Filtrar bagas por origem" e o estado pressionado.
