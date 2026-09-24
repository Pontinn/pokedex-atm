# CHECKLIST - Pontindex

**Feature**: Pontindex  
**Branch**: feature/pontindex  
**Baseline HEAD**: fe421ec1  
**Created**: 2026-09-24  

## Legenda

- `[ ]` pendente
- `[~]` em andamento
- `[x]` feito (commit existe)
- `[!]` bloqueado

---

## Onda 0 - Base

**Agente**: Base (Opus)  
**Modelo**: Opus  
**Inicio quando**: repo sem codigo backend  
**Arquivos exclusivos**: arquivos da raiz (`package.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `playwright.harness.config.ts`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `.gitattributes`, `.npmrc`, `vercel.json`, `README.md`, `index.html`), `src/main.tsx`, `src/vite-env.d.ts`, `src/components/Icon.tsx`, `src/styles/fonts.ts`, `src/styles/types.generated.css`, `tools/gen/`, `src/assets/`, `public/icons/`, `public/data/.gitkeep`, `tests/setup.ts`, `tools/dataset/README.md`, saida temporaria `tools/dataset/out/_base/`, contratos compartilhados (congelados), `tools/dataset/src/{index,cli,config,context,instance,source-reader,jar-reader,lang,write,report}.ts`, `tools/dataset/src/lib/`, `species/{collect,merge}.ts`, stubs de etapa; testes `tests/unit/build/`, `tests/unit/dataset/{source,species-merge}.test.ts`, `tests/fixtures/{source,species-merge}/`  
**Pasta temporaria**: `tools/dataset/out/_base/`

### Sprint B1: Scaffolding do projeto

- [ ] B1.1 Projeto Vite + React + TS com qualidade
  - hash:
  - Done when: `npm run typecheck && npm run lint && npm run build` verdes; `dist/index.html` existe
  - notas:

- [ ] B1.2 Higiene do repositorio e deploy Vercel
  - hash:
  - Done when: `git status` limpo apos build; deploy de preview na Vercel serve `/` e `/data/<ver>/dataset-manifest.json` com header immutable
  - notas:

- [ ] B1.3 PWA base, fontes e icones empacotados
  - hash:
  - Done when: `dist/sw.js` e `dist/manifest.webmanifest` gerados; nenhum request para dominios externos ao abrir `npm run preview`
  - notas:

- [ ] B1.4 Geradores de assets (paleta de tipos, icones, mascara)
  - hash:
  - Done when: `types.generated.css` contem 18 blocos; `public/icons` tem 5 PNGs; snapshot test do CSS gerado
  - notas:

- [ ] B1.5 Contratos compartilhados congelados e configuracao de testes
  - hash:
  - Done when: testes de contratos passam; `src/data/types.ts`, `src/storage/types.ts`, `src/styles/themes.ts`, `src/domain/ball-rules-types.ts`, `src/domain/normalize.ts` criados e congelados
  - notas:

### Sprint B2: Pipeline de dados, parte 1 (especies, spawns, fosseis, evolucoes, formas)

- [ ] B2.1 Leitor da fonte (snapshot ou instancia real), manifesto e escrita atomica
  - hash:
  - Done when: `runSourceReader(ctx)` com `--instance <dir>` ou snapshot padrao completa; manifesto gerado; atomicidade testada
  - notas:

- [ ] B2.2 Lang PT/EN e merge de especies
  - hash:
  - Done when: Eevee merge com 5 formas; searchKey normalizado; `counts.species` 1027
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_base.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 1 - Especies

**Agente**: Especies (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 0 completa  
**Arquivos exclusivos**: `tools/dataset/src/species/{stage-derive,spawns,rarity,fossils,obtain,evolutions,forms}.ts`; `tests/unit/dataset/species.test.ts`, `tests/fixtures/species/`; saida temporaria `tools/dataset/out/_species/`  
**Pasta temporaria**: `tools/dataset/out/_species/`

### Sprint B2 (continuacao): Pipeline de dados, parte 1

- [ ] B2.3 Spawns, raridade, fosseis e rotas "Como obter" (derivacao)
  - hash:
  - Done when: em `tests/unit/dataset/species.test.ts` com fixture snapshot; Eevee com buckets corretos; fossil routes 16
  - notas:

- [ ] B2.4 Evolucoes, cadeia e formas com item necessario (derivacao)
  - hash:
  - Done when: testes em `tests/unit/dataset/species.test.ts`; Charizard forms com items de mega evolution
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_species.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 1 - PokeAPI e midia

**Agente**: PokeAPI e midia (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 0 completa  
**Arquivos exclusivos**: `tools/dataset/src/pokeapi/{client,cache,move-aliases,stage}.ts`, `tools/dataset/src/{moves,abilities}.ts`, `tools/dataset/src/media/`, `src/audio/sfx-names.ts`; `tests/unit/dataset/pokeapi-media.test.ts`, `tests/fixtures/pokeapi-media/`; saida temporaria `tools/dataset/out/_pokeapi-media/`; cache `tools/dataset/.cache/pokeapi/`  
**Pasta temporaria**: `tools/dataset/out/_pokeapi-media/`

### Sprint B3: Pipeline de dados, parte 2 (PokeAPI em build, sprites, midia)

- [ ] B3.1 Cliente PokeAPI com cache e backoff
  - hash:
  - Done when: teste com servidor fake: 2 falhas 503 depois 200 = sucesso com 2 retries; cache hit 100% na segunda execucao
  - notas:

- [ ] B3.2 Golpes e habilidades
  - hash:
  - Done when: `moves.json` >= 932 entradas; `tackle` = normal/physical; `abilities.json` 310; `blaze.name.pt === "Incendio"`
  - notas:

- [ ] B3.4 Extracao de midia dos jars e orcamento
  - hash:
  - Done when: `cries/` >= 1072, `sfx/` = 20 nomes, `items/cobblemon/` >= 800; soma cries+sfx+texturas <= 26 MB
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_pokeapi-media.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 1 - Treinadores e bolas

**Agente**: Treinadores e bolas (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 0 completa  
**Arquivos exclusivos**: `tools/dataset/src/trainers/`, `tools/dataset/src/config-toml.ts`, `tools/dataset/src/balls/`; `tests/unit/dataset/trainers-balls.test.ts`, `tests/fixtures/trainers-balls/`; saida temporaria `tools/dataset/out/_trainers-balls/`  
**Pasta temporaria**: `tools/dataset/out/_trainers-balls/`

### Sprint B5: Pipeline de dados, parte 4 (treinadores e series)

- [ ] B5.1 Treinadores e definicoes de spawn
  - hash:
  - Done when: `gym_leader_roark_0395` com propriedades corretas; `requiredDefeats` resolvidos
  - notas:

- [ ] B5.2 Series, ordem dos treinadores-chave e config do cap
  - hash:
  - Done when: `ctx.counts.keyTrainers.bdsp === 33`; ordem topologica correta; `series.json` valido
  - notas:

### Sprint B4: Pipeline de dados, parte 3 (itens, receitas, loot, bolas)

- [ ] B4.3 Pokebolas e tabela de regras
  - hash:
  - Done when: 48 bolas no catalogo; tabela de regras curada com multiplicadores; teste Magikarp ranking completo
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_trainers-balls.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 1 - Regras e armazenamento

**Agente**: Regras e armazenamento (Opus)  
**Modelo**: Opus  
**Inicio quando**: Onda 0 completa (importa contratos congelados de B1.5)  
**Arquivos exclusivos**: `src/domain/` (exceto `normalize.ts` e `ball-rules-types.ts`), `src/storage/` (exceto `types.ts`), `src/sync/`, `src/data/{loaders,cache,schemas}.ts`, `src/platform/`; `tests/unit/{domain,storage,sync,data}/`, `tests/fixtures/rules-storage/`  
**Pasta temporaria**: `tests/fixtures/rules-storage/`

### Sprint B6: Modulos de dominio (regras puras, sem UI)

- [ ] B6.1 Tabela de tipos e efetividade
  - hash:
  - Done when: testes dos exemplos de efetividade contra Charizard; igualdade com `type-chart.json` em B2.5
  - notas:

- [ ] B6.2 Stats, naturezas e recomendacao de IV/EV
  - hash:
  - Done when: testes 299/328/269/404 HP; Charizard highlight `[specialAttack, speed]`; Mew empate
  - notas:

- [ ] B6.3 Level cap (Radical Cobblemon Trainers)
  - hash:
  - Done when: BDSP 15/16/20/22/22/30/100; AND/OR de `requiredDefeats`; `none` e `freeroam`
  - notas:

- [ ] B6.4 Ranking de Pokebolas
  - hash:
  - Done when: teste Magikarp com 44 posicoes; Charizard Fast Ball 4x; Heavy Ball na faixa correta
  - notas:

- [ ] B6.5 Busca
  - hash:
  - Done when: testes "025"/"pantano"/"charizar"/"9902"
  - notas:

- [ ] B6.6 Historico e time
  - hash:
  - Done when: testes 21o item / duplicado ao topo / 7o no time; history rotation; team rules
  - notas:

### Sprint B7: Persistencia, sincronizacao, backup e loaders

- [ ] B7.1 StorageAdapter, IndexedDB, migracoes e repositorios
  - hash:
  - Done when: round-trip 6 docs; migracao 0->1 importa legacy; snapshot e rollback funcionam; `filterKnown` correto
  - notas:

- [ ] B7.2 Codec de sincronizacao e mesclagem
  - hash:
  - Done when: property test round-trip; texto 200.001 chars = oversized; CRC corrupted; exemplo A/B do PRD
  - notas:

- [ ] B7.3 Backup exportar/importar
  - hash:
  - Done when: round-trip export -> deleteData -> import = identico; arquivo > 5 MB = oversized
  - notas:

- [ ] B7.4 Loaders do dataset com cache e retry
  - hash:
  - Done when: cache hit nao refaz request; 2 falhas + sucesso; JSON invalido = `INVALID`
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_rules-storage.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 1b - Frontend fundacao

**Agente**: forge-imp-frontend  
**Modelo**: Opus  
**Inicio quando**: (a) um agente da Onda 1 terminou (teto 4 simultaneos) E (b) B7.1 verde no checklist  
**Arquivos exclusivos**: `src/styles/{tokens,themes,base,components}.css`, `src/styles/theme-meta.ts`, `src/i18n/`, `src/navigation/`, `src/state/preferences-store.ts`, `src/components/{Watermark,TypeChip,TypeIcon,TermsToggle,ScreenRouter}.tsx`; `tests/unit/ui-foundation/`, `tests/harness/`, `tests/harness/foundation.spec.ts`, `tests/fixtures/ui-foundation/`  
**Pasta temporaria**: `tests/fixtures/ui-foundation/`

### Sprint F1: Fundacao visual, i18n, navegacao e shell

- [ ] F1.1 Tokens, temas e paleta por tipo
  - hash:
  - Done when: 7 temas com cores corretas; `--surface` black = `#111111`; `.t-fire` com cor base; mask-image do watermark
  - notas:

- [ ] F1.2 i18n e toggle de termos por card
  - hash:
  - Done when: `MESSAGES` completo pt/en; sem chaves excluidas; `TermsToggle` grava override; completude de dicionario
  - notas:

- [ ] F1.3 Pilha de navegacao com historico real
  - hash:
  - Done when: navigate A->B->C e goBack restaura `ui` e scroll; pilha 40; popstate funciona; gancho de som chamado 1x
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_frontend-foundation.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 2 - Juncao

**Agente**: Juncao (Sonnet)  
**Modelo**: Sonnet  
**Inicio quando**: Onda 1 completa  
**Arquivos exclusivos**: `tools/dataset/src/{sprites,artwork-ids,biomes,type-chart,biome-labels.pt}.ts`, `tools/dataset/src/pokeapi/stage.ts` (acrescenta B3.3), `tools/dataset/src/items/`, `tools/dataset/src/species/index-writer.ts`, `tools/dataset/.cache/sprites/`, reuso de `.cache/pokeapi/`, `tools/dataset/out/_staging/`, UNICOS escritores de `public/data/` e `public/assets/`; `tests/unit/dataset/join.test.ts`, `tests/fixtures/join/`  
**Pasta temporaria**: `tools/dataset/out/_staging/`

### Sprint B3 (continuacao): Pipeline de dados, parte 2

- [ ] B3.3 Sprites 96px e ids de artwork por forma
  - hash:
  - Done when: 1025 PNGs em `<outDir>/assets/sprites/`; Charizard Mega-X `artworkId === 10034`; cache em `.cache/sprites/`
  - notas:

### Sprint B4 (continuacao): Pipeline de dados, parte 3

- [ ] B4.1 Catalogo de itens com categoria e textura
  - hash:
  - Done when: `items.json` >= 932 entradas; `cobblemon:potion` descricao pt/en e textura; `aguav_berry` tags contendo `bait`
  - notas:

- [ ] B4.2 Rotas de obtencao do item e "Usado em"
  - hash:
  - Done when: `cobblemon:fire_stone.obtain` = craftable; `old_amber_fossil.usedIn.fossils` = 142; item drops e loot corretos
  - notas:

### Sprint B2 (finalizacao): Pipeline de dados, parte 1

- [ ] B2.5 Escrita do indice, fichas, tabela de tipos e biomas (pipeline completo com publicacao)
  - hash:
  - Done when: primeira execucao completa do pipeline; `public/data/` e `public/assets/` publicados; manifesto valido
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_join.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 3 - Frontend

**Agente**: Frontend (forge-imp-frontend)  
**Modelo**: Opus  
**Inicio quando**: Onda 1b verde; Onda 2 verde (dataset real); backend verde nas dependencias de cada feature  
**Arquivos exclusivos**: `src/` de UI restante (telas F1.4-F12.2)  
**Pasta temporaria**: `tests/fixtures/ui-screens/`

### Sprint F1 (finalizacao): Fundacao visual, i18n, navegacao e shell

- [ ] F1.4 Shell desktop e mobile, boot, tabbar/sheet e som (paginas reais)
  - hash:
  - Done when: `desktop-home.png` e `mobile-home.png` shell correto; som toca; reducao de animacao em home; cria tests/harness/no-overlap.ts e aplica no shell
  - notas:

### Sprint F2: Home, busca e blocos de time e historico

- [ ] F2.1 Busca com autocomplete
  - hash:
  - Done when: autocomplete funciona; busca "025" e "pantano" encontram; sem rede usa cache
  - notas:

- [ ] F2.2 Time, historico e resumo de capturados na Home
  - hash:
  - Done when: blocos corretos em Home; layout responsivo; dados do storage exibem
  - notas:

### Sprint F3: Pokedex (lista virtualizada e filtros)

- [ ] F3.1 Grade virtualizada e card de Pokemon
  - hash:
  - Done when: 1027 cards virtualizados; scroll suave; card clicavel
  - notas:

- [ ] F3.2 Filtros combinaveis
  - hash:
  - Done when: filtros por tipo, bioma, rarity; estados salvos ao navegar
  - notas:

### Sprint F4: Ficha do Pokemon (parte 1: hero, stats, fraquezas, evolucao, habilidades, golpes)

- [ ] F4.1 Hero card, selos, shiny, grito e acoes
  - hash:
  - Done when: Charizard exibe numero/forma/shiny/selos corretos; clique grito funciona; hero sem sobreposicao de texto (expectNoOverlap, 390 e 1280 px, PT e EN)
  - notas:

- [ ] F4.2 Stats, fraquezas/resistencias e habilidades
  - hash:
  - Done when: stats calculados; efetividade exibida; aba habilidades
  - notas:

- [ ] F4.3 Cadeia de evolucao clicavel
  - hash:
  - Done when: cadeia visual; cliques navegam; requirements exibidos
  - notas:

- [ ] F4.4 Golpes com abas e descricao
  - hash:
  - Done when: abas Nevel/TMxx/Golpes; descricoes tipo/poder/precisao
  - notas:

### Sprint F5: Ficha do Pokemon (parte 2: onde encontrar, como obter, formas, melhor bola, calculadoras)

- [ ] F5.1 Onde encontrar, raridade, drops e Como obter
  - hash:
  - Done when: tabela spawns com bioma/rarity; rotas de obtencao listadas
  - notas:

- [ ] F5.2 Abas de forma com item necessario
  - hash:
  - Done when: formas listadas; mega evolution items exibidos
  - notas:

- [ ] F5.3 Melhor Pokebola na ficha
  - hash:
  - Done when: top 3 bolas por ranking; condicoes explicadas
  - notas:

- [ ] F5.4 Calculadoras (stats e efetividade)
  - hash:
  - Done when: calc stats nível 100; calc efetividade com IV/EV
  - notas:

### Sprint F6: Captura (animacao) e lista de capturados

- [ ] F6.1 Animacao de captura
  - hash:
  - Done when: animacao ball shake e capture funciona ao clicar
  - notas:

- [ ] F6.2 Lista de capturados
  - hash:
  - Done when: lista com cards capturados; adicionar/remover do time; ordenacao
  - notas:

### Sprint F7: Comparar

- [ ] F7.1 Comparar dois Pokemon
  - hash:
  - Done when: dois cards lado a lado; stats, tipos, moveset comparados
  - notas:

### Sprint F8: Treinadores e timeline

- [ ] F8.1 Picker de series, serie ativa e Modo Livre
  - hash:
  - Done when: picker series; cap level atualiza; Modo Livre disponivel
  - notas:

- [ ] F8.2 Linha do tempo, cap vigente e derrotados
  - hash:
  - Done when: timeline series; treinadores-chave com status; cap exibido
  - notas:

### Sprint F9: Colecoes (Pokebolas e itens)

- [ ] F9.1 Grade de Pokebolas
  - hash:
  - Done when: 48 bolas em grid; filtros por tipo/multiplicador
  - notas:

- [ ] F9.2 Grade de itens com busca PT/EN
  - hash:
  - Done when: items filtrados; categoria; rarity; textura; tag acima do nome no card de item, sem sobreposicao (prints/2.png)
  - notas:

- [ ] F9.3 Pagina do item
  - hash:
  - Done when: nome/descricao/textura; rotas obtencao; "Usado em"
  - notas:

### Sprint F10: Configuracoes

- [ ] F10.1 Preferencias visuais e de som
  - hash:
  - Done when: toggles tema/idioma/som/reducao animacao; salvam em storage
  - notas:

- [ ] F10.2 Backup, apagar dados e restaurar snapshot
  - hash:
  - Done when: export `.json`; import com validacao; deleteData funciona; restore pre-migration
  - notas:

### Sprint F11: Sincronizacao

- [ ] F11.1 Gerar codigo
  - hash:
  - Done when: codigo gerado; QR code exibido; frames para textos grandes
  - notas:

- [ ] F11.2 Receber codigo, resumo e mesclar/substituir
  - hash:
  - Done when: decodifica codigo; resume mudancas; merge/replace opcoes
  - notas:

### Sprint F12: PWA avancada

- [ ] F12.1 PWA instalavel e cache
  - hash:
  - Done when: app instalavel; service worker cache funciona; offline modo read-only
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_frontend.md`

**inicio**: / **fim**: / **duracao**:

---

## Onda 4 - Testes

**Agente**: Testes  
**Modelo**: Sonnet  
**Inicio quando**: Tudo acima verde  
**Arquivos exclusivos**: `tests/` restantes  
**Pasta temporaria**: `test-results/`, `playwright-report/`

### Sprint T1: Testes e2e, cobertura, visual

- [ ] T1 Testes e2e, visual snapshot, cobertura e documentacao final
  - hash:
  - Done when: `npm run test:e2e` verde; cobertura >= limites T1; visual `ui-refs/` vs real; docs atualizados
  - notas:

HANDOFF: `.forge/ideas/pontindex/HANDOFF_tests.md`

**inicio**: / **fim**: / **duracao**:

---

## Fase 2 - NAO executar agora

Sprints P1-P3 da SPEC (so depois que o Pontin testar e aprovar o site):

- [ ] P1 Electron (Windows .exe)
- [ ] P2 Capacitor 8 (Android .apk)
- [ ] P3 Atualizador automatico e botao "Baixar app"

---

## Notas por fase

(Preenchidas durante execucao com desvios, blocadores e decisoes)

---

## Bugs encontrados

| Fase/Feature | Descricao | Causa | Fix / commit |
|---|---|---|---|

(Preenchida durante execucao)

---

**Gerado em**: 2026-09-24  
**SPEC**: commit fe421ec1  
**Verificacao**: sem em dash (U+2014) em qualquer linha
