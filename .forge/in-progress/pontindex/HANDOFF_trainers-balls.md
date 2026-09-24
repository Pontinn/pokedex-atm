# HANDOFF - Onda 1 (Treinadores e bolas)

Agente: forge-imp-backend (Onda 1, slug `trainers-balls`). Inicio 2026-09-24 16:25, fim 2026-09-24 16:53.
Features: B5.1, B5.2, B4.3 (todas com commit e verdes).

## Commits

| Feature | Commit | Verificacao executada |
|---|---|---|
| B5.1 | `4971c783` | `tests/unit/dataset/trainers-balls.test.ts` (equivalente a `npm run dataset -- --only trainers --out tools/dataset/out/_trainers-balls`): gym_leader_roark_0395 (optional false, signatureItem, maxTeamLevel 14), cedric/maylene requiredDefeats |
| B5.2 | `9bc85c18` | mesmo arquivo: series.json (atm_team.requiredSeries, freeroam.special), ordem topologica do bdsp (comeca em roark), levelCapConfig |
| B4.3 | `00466ace` | mesmo arquivo: balls.json.length 48, net_ball/heavy_ball/park_ball/sport_ball/ancient_*/dusk_ball.effect.pt |

Suite completa (`npx vitest run`) rodada apos o commit de B4.3: 14 arquivos, 137 testes, 1 falha -- **nao e minha**:
`tests/unit/domain/level-cap.test.ts` (arquivo/fixture de outro agente, "Regras e armazenamento";
`tests/fixtures/rules-storage/bdsp-key-trainers.json`, fora do meu escopo). Nao toquei nesse arquivo.
`npm run typecheck`: limpo nos meus arquivos (so ha erros pre-existentes, nao meus, em
`tests/unit/dataset/pokeapi-media.test.ts`, do agente "PokeAPI e midia"). `npx eslint` nos meus arquivos: limpo.

## Contagens reais observadas no snapshot `data-source/atm-1.3.0`

- **Treinadores**: `data/rctmod/trainers/` (jar) = 1559 arquivos; `kubejs/data/rctmod/trainers/` = 30 (todos
  ids NOVOS, 0 colisao com o jar: atm_team/contentcreators). Total de treinadores mesclados = 1589
  (`counts.trainers`).
- **Mob defs** (`mobs/trainers/single/`): jar = 165; kubejs = 60, dos quais 29 SOBRESCREVEM um id ja
  existente no jar (colisao real, nao so adicao) e 31 sao novos (atm_team/contentcreators/leader_clair_0026).
  1589 - 225 (id unicos com mob file) = 1364 treinadores herdam `default.json` (`optional: true`, `series: []`)
  e por isso nunca entram em nenhum `trainers/<serie>.json`.
- **`groups/`** (`mobs/trainers/groups/*.json`, 116 arquivos): existe no jar e e citada na SPEC (Files da B5.1),
  mas a regra de merge escrita no passo 2/edge-cases so fala em fallback por `default.json` (nao por grupo);
  nao ha uma chave de juncao id->grupo documentada nem verificavel nos dados (o nome do grupo nao aparece
  em nenhum arquivo de treinador). Decisao: NAO usei `groups/` no merge (so `default.json`, como o texto da
  SPEC realmente descreve); documentando aqui para o orquestrador confirmar se `groups/` deveria alimentar
  outro campo (ex. cor/simbolo do "trainer card" da UI, que ja vem so de `trainer_types/*.json`).
- **Series**: jar = `bdsp`, `radicalred`, `unbound`; kubejs = `atm_team`, `contentcreators` (0 colisao de id).
  Mais a entrada especial `freeroam` = 6 no `series.json` (`counts.series = 6`).
- **`counts.keyTrainers`** (id nao-opcional por serie, apos o merge kubejs completo):
  `{ bdsp: 43, radicalred: 39, unbound: 38, atm_team: 21, contentcreators: 9 }` (freeroam fica de fora,
  nunca tem treinador-chave).
- **Ordem topologica do bdsp**: comeca em `gym_leader_roark_0395` (sem prerequisito, `maxTeamLevel` 14, o
  mais baixo entre os sem prerequisito), confirmado pelo teste.
- **`levelCapConfig`**: `config/rctmod-server.toml` existe e bate exatamente com os valores da SPEC
  (`initialLevelCap 15, relativeLevelCap 0, initialSeries "empty", freeroamRequiresCompletedSeries true`).
- **Pokebolas**: 48 texturas em `assets/cobblemon/textures/item/poke_balls/` (exclui `models/`); os 48
  tooltips (en_us e pt_br) foram lidos e comparados um a um com a tabela da B4.3 na SPEC -- **nenhum
  mismatch encontrado** (inclusive o texto exato do `dusk_ball.effect.pt` do Done-when). O lang tem 51 chaves
  `*_ball`: as 3 sem textura (`iron_ball`, `light_ball`, `smoke_ball`) sao itens segurados, nao Pokebolas,
  confirmando a nota da SPEC.

## Achados/decisoes importantes (para o orquestrador)

1. **`counts.keyTrainers.bdsp`: 43, nao 33 (Done-when da SPEC B5.2 diz 33).** Investiguei a fundo antes de
   decidir (Regra 1): aplicando literalmente a regra de merge escrita na propria SPEC (B5.1 edge case:
   "kubejs sobrescrevendo um id do jar -> kubejs vence"), 10 ids de `mobs/trainers/single/` que o kubejs
   redefine (`champion_cynthia_05a2`/`05a7`, `elite_four_{aaron,bertha,flint,lucian}_05??` x2 cada) trocam
   `optional` de `true` (no jar) para `false` (no kubejs) -- sao rematches pos-jogo que o pack All the Mons
   torna obrigatorios. Contando SO o jar (ignorando esses 10 overrides), a conta bate exatamente com 33
   (o numero "vanilla" do BDSP: 8 lideres + 4 Elite dos 4 + 1 campea + 12 encontros do rival Cedric + 6
   comandantes + 2 Cyrus). Escolhi seguir a regra ESCRITA (kubejs vence, dando 43) em vez do numero do
   Done-when, e documentei os dois valores e a causa exata nos testes/commit. **Decisao do orquestrador
   necessaria**: manter 43 (regra como escrita) ou tratar esses 10 overrides como excecao e voltar a 33
   (mudaria a regra de merge, que e a mesma usada por B5.1 para o restante do merge).
2. **GAP no contrato congelado `src/data/types.ts` (`BallCondition`, B1.5).** A uniao tem 15 valores, um por
   bola condicional "por nome" (safari->outsideBattle, park->forestOrPlains, heavy->heavyTarget, ... beast->
   ultraBeast), todos ja ocupados 1:1. A tabela de regras da B4.3 pede MAIS DUAS bolas condicionais:
   `fast_ball` (4x se Velocidade Base >= 100) e `net_ball` (3x se tipo Agua/Inseto), cada uma com seu proprio
   `applies` (`minBaseSpeed`/`types`) mas SEM um nome de condicao correspondente na uniao. Reaproveitar um
   dos 15 nomes existentes faria o dominio (B6.4 `rankBalls`, agente "Regras e armazenamento", em paralelo)
   aplicar a logica ERRADA (ex. checar bioma para `net_ball`). Como o arquivo esta congelado, usei dois
   literais fora da uniao oficial (`"minBaseSpeedAbove"`, `"hasAnyType"`) via cast documentado em
   `tools/dataset/src/balls/ball-rules.ts` -- funcionam em runtime (o JSON gravado so tem uma string; o
   `applies` carrega o dado real que o dominio deveria usar), mas o `npm run typecheck` do `src/domain`
   (B6.4) vai reclamar se aquele codigo tentar apertar `condition` contra a uniao oficial de `BallCondition`.
   **Pedido ao orquestrador**: estender `BallCondition` com esses 2 valores (ou os que preferir) em um commit
   proprio; nao quebra nada existente (so adiciona).
3. **`typeLabel` da SPEC usa a chave errada.** A SPEC B5.1 diz `typeLabel = text("type.rctmod.<type>")`; a
   chave real (conferida em `assets/rctmod/lang/{en_us,pt_br}.json`) e `trainer_type.rctmod.<type>.title`
   (ex. `"trainer_type.rctmod.leader.title": "Leader"`). Usei a chave real (verificada, nao a do texto da
   SPEC). Fallback humanizado quando a chave falta (nenhum `type` usado no snapshot ficou sem lang).
4. **`series.rctmod.{atm_team,contentcreators}.{title,description}` nao existem em NENHUM lang** (jar nem
   kubejs; busquei em toda a arvore `kubejs/`). Uso o fallback humanizado do id (`"Atm Team"`,
   `"Content Creators"`) so para esses dois; os outros 4 (bdsp, radicalred, unbound, freeroam) tem lang real.
5. **`counts.trainers` = 1589** (total de treinadores mesclados, uniao jar+kubejs por id) -- a SPEC nao
   define explicitamente o que essa contagem soma; segui o mesmo padrao de `counts.species` (total de
   entidades apos o merge, nao a soma de linhas nos arquivos por serie, que teria duplicatas).
6. Erros de validacao (bola sem regra curada, id de bola novo, ciclo em requiredDefeats) usam `Error` comum,
   nao `PipelineError`: `tools/dataset/src/lib/errors.ts` esta congelado (Onda 0) e nenhum dos codigos
   existentes serve; nao editei esse arquivo.

## O que esta pronto para a Onda 2 (Juncao) e outros agentes da Onda 1

- `runBallsStage(ctx)` e `runTrainersStage(ctx)` totalmente implementados, testados contra o snapshot real,
  nunca escrevem em `public/`. `tools/dataset/src/balls/{catalog,ball-rules,stage}.ts` e
  `tools/dataset/src/trainers/{collect,merge,order,series,writer,stage}.ts` e `tools/dataset/src/config-toml.ts`.
- Saidas em `tools/dataset/out/_trainers-balls/data/`: `balls.json` (48), `series.json` (6, incl. freeroam),
  `trainers/<seriesId>.json` para cada serie (bdsp, radicalred, unbound, atm_team, contentcreators, freeroam
  vazio).
- `ctx.levelCapConfig` preenchido; `ctx.counts.balls/trainers/series/keyTrainers` preenchidos.
- B4.2 (Onda 2, "Usado em") pode consultar `usedIn.ball` cruzando `items.json` com `balls.json[].itemId`.
- B6.4 (`rankBalls`, "Regras e armazenamento", em paralelo nesta Onda) deve ler o achado #2 acima antes de
  implementar `fast_ball`/`net_ball`.

## Pendencias / escalar

- Achados #1 e #2 acima precisam de uma decisao do orquestrador (numero certo do `keyTrainers.bdsp`;
  extensao de `BallCondition`).
- Achado #3 (chave de lang do `typeLabel`) e uma correcao silenciosa de um detalhe da SPEC (nao um contrato
  congelado); nao acho que precise de decisao, so registro.
