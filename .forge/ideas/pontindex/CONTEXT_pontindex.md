---
feature: pontindex
language: pt-BR
code_identifier_language: en - new-project-default-en (confirmado pelos identificadores do proprio prototipo aprovado, ver secao 6)
generated: 2026-09-23
stack: React + TypeScript + Vite; Fase 1 site PWA estatico (sem backend, deploy Vercel); Fase 2 Electron (Windows) + Capacitor 8 (Android) a partir do mesmo dist/
---

## 0. Baseline (ancora de drift)

- HEAD: `57004913e39b29d797afdf0028852f62d708e8ff` (branch `feature/pontindex`).
- IDEA fingerprint (`git hash-object .forge/ideas/pontindex/IDEA_pontindex.md`): `47b83e51f90078032a1d79bb28be14dfeeefa8c2`.
- Arquivos do repositorio analisados (`path - blob sha1`):
  - `design/prototipo/index.html - be69b2b8b467356c0afdf437b025c2a98762f888`
  - `design/prototipo/style.css - b836a3eb99cbb7f4ab9effb3bc36774bcb0ef55d`
  - `design/prototipo/app.js - 09293df62796fd54a02d93536eef4fad82de0ccd`
  - `design/prototipo/LEIA-ME.txt - 92e9f611d8d7b1f4d698700b51b76ed29eca5b30`
  - `design/tipos/cores.json - e9eccf58f159b2ffebccedca547bfeaf312b4cff`
  - `design/tipos/preview.html - 74c515d22dcff17ccb90fba77cf6cd0723550ba6`
  - `design/referencias/LEIA-ME.txt - 172b3cd208ab89555eebf99e5ccf7471e8719905`
- Arquivos da INSTANCIA original (fora do git, no PC de casa; referencia historica da extracao do snapshot `data-source/atm-1.3.0/`, que e a fonte padrao hoje; fingerprint = tamanho em bytes + mtime do sistema, todos em `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`):
  - `manifest.json - 43890 bytes - 2026-09-18 17:18` (confirma `"name":"All the Mons"`, `"version":"1.3.0"`, `minecraft.version:"1.21.1"`).
  - `config/rctmod-server.toml - 8715 bytes - 2026-09-18 17:18`.
  - `config/cobblemon/main.json - 3409 bytes - 2026-09-23 14:51` (mexido pelo usuario apos a instalacao; nao afeta os dados de especie/spawn usados pelo app).
  - `mods/Cobblemon-neoforge-1.7.3+1.21.1.jar - 128748941 bytes - 2026-09-18 17:20`
  - `mods/allthemons-0.6.2.jar - 27990421 bytes - 2026-09-18 17:19`
  - `mods/mega_showdown-neoforge-1.9.9+1.7.3+1.21.1.jar - 20498909 bytes - 2026-09-18 17:19`
  - `mods/zamega-neoforge-1.7.6.jar - 1081856 bytes - 2026-09-18 17:18`
  - `mods/legendarymonuments-neoforge-1.21.1-8.1-Love_for_All.jar - 16600936 bytes - 2026-09-18 17:19`
  - `mods/complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar - 18494181 bytes - 2026-09-18 17:20`
  - `mods/rctmod-neoforge-1.21.1-0.18.1-beta.jar - 7536984 bytes - 2026-09-18 17:20`
  - `mods/rctapi-neoforge-1.21.1-0.15.2-beta.jar - 235207 bytes - 2026-09-18 17:20`
  - `kubejs/data/{cobblemon,rctmod,legendary_spawns_ccc}/**` (arvore de pastas listada na secao 4; sem hash unico pratico, tratar como pasta viva da instancia do usuario).

Nota: a IDEA ja continha uma pesquisa extensa (3 rodadas) sobre esses mesmos dados. Este CONTEXT reverificou, em 2026-09-23, contagens e formatos direto nos jars/pastas da instancia (nao apenas confiou no texto da IDEA); os numeros abaixo batem com os da IDEA exceto onde marcado "(divergencia)".

## 1. Stack e build

- Planejado (IDEA secao 2/7/13, confirmado): React + TypeScript + Vite. Fase 1 = site estatico PWA, sem backend, deploy Vercel (plano gratuito), dados/imagens/sons empacotados no build e commitados no repo, dados do usuario em IndexedDB (armazenamento persistente) + exportar/importar backup, chamadas PokeAPI direto do navegador. Fase 2 (so depois do site pronto) = Electron (Windows .exe) + Capacitor 8 (Android .apk, SDK 36 e ANDROID_HOME ja instalados na maquina do usuario, sem Android Studio/emulador) a partir do MESMO `dist/`, com atualizador automatico via GitHub Actions.
- Nao existe nenhum `package.json`, `vite.config.*`, `tsconfig.json` nem pasta `src/` no repositorio ainda: projeto 100% novo (confirmado com `find . -iname package.json` vazio).
- Ferramental disponivel na maquina (verificado 2026-09-23): `node v24.18.0`, `npm 11.17.0`. Nenhuma versao de Vite/React/Electron/Capacitor instalada ainda (a instalar no Stage 4).
- Icones de UI: biblioteca **Lucide** (`lucide-react` na implementacao React; o prototipo usa o Lucide via CDN com `<i data-lucide="...">` + `lucide.createIcons()`). Icones de tipo e a pokebola sao assets proprios (SVG/webp), nao Lucide.
- Fontes usadas no prototipo (`design/prototipo/index.html`, `<link>` Google Fonts): **Fredoka** (display/titulos), **Nunito** (corpo), **Silkscreen** (estilo pixel, usado pontualmente).

## 2. Arquivos e modulos relevantes

- `.forge/ideas/pontindex/IDEA_pontindex.md` (55 KB, 291 linhas): unica fonte de requisitos aprovados; ja documenta pesquisa profunda em 3 rodadas sobre Cobblemon, PokeAPI, All the Mons e a instancia local. Leitura obrigatoria antes do PRD.
- `design/prototipo/` (3,2 MB): referencia visual e comportamental OFICIAL, aprovada pelo usuario ("Tudo aprovado, achei incrivel").
  - `index.html` (316 linhas): shell da SPA vanilla, `<section class="screen" data-screen="...">` para cada tela, menu do prototipo (engrenagem), boot screen (`#boot`), overlay de captura (`#capture`).
  - `style.css` (1142 linhas): design tokens em `:root` (fontes, radius, shadow, easing, `--wm-opacity`), paletas de tipo (`--t-<tipo>` e pares `--type-<tipo>-a/b` para gradiente), stats (`--s-hp` etc.), 7 blocos `html[data-theme="..."]` com `--primary/--primary-dark/--secondary/--secondary-soft/--accent/--screen/--surface/--surface-2/--text/--muted/--border/--lens/--scroll-thumb`, scrollbar customizada (`::-webkit-scrollbar*` + fallback `scrollbar-color`), layout mobile via classe `.app.mobile`.
  - `app.js` (1410 linhas, IIFE unica): dicionario `I18N` (chave -> `{pt, en}`, ~230 chaves), `TYPES` (nomes de tipo PT/EN), `CHART` (tabela de efetividade 18x18 hardcoded), `DATA` (objeto unico com pokemon fake, `chains`/`chainOf` de evolucao, `abilities`, `moves`, `items`, `themes`), `state` (objeto unico de estado de UI), funcoes `render*` por tela/secao, `navigate/go/goBack/restore/snapshot` (pilha de navegacao propria, ver secao 3), `startCapture/finishCapture/closeCapture` (animacao de captura), `sfx/playRaw/sfxEl` (sons), `setLang/setTheme/setSound` (preferencias).
  - `LEIA-ME.txt`: guia de uso do prototipo (o que e real vs fake).
  - `assets/itens/{cobblemon,allthemons,mega_showdown}/*.png` + `assets/itens/manifest.js`: texturas reais de itens extraidas dos jars para o prototipo, nomeadas pelo id do item. Contagem reverificada por pasta: `cobblemon/` 733, `allthemons/` 79, `mega_showdown/` 322 = **1134 arquivos .png** (2,0 MB), mais 1 `manifest.js` na raiz de `assets/itens/`.
  - `assets/sons/{cries,ui,poke_ball,evolution,shiny}/*.ogg` e subpastas (47 arquivos amostrados no prototipo, 940 KB): subset dos sons oficiais do Cobblemon para demonstrar a experiencia sonora.
- `design/tipos/`: `svg/<tipo>.svg` (18 arquivos, glifo branco/fundo transparente, origem `duiker101/pokemon-type-svg-icons`, sem licenca declarada, uso privado combinado com o usuario), `cores.json` (paleta oficial por tipo: `base/a/b` por um dos 18 tipos, é a fonte de verdade dos gradientes tambem usados em `style.css`), `preview.html` (visualizacao dos 18 icones), `_todos-os-tipos.avif` (imagem de referencia original do usuario, nao usada no app).
- `design/capture/bg-{lendario,mitico,outros}.avif`: referencia de cor/estilo dos fundos de captura (o app final recria em SVG/CSS vetorial, ver IDEA feedback v1/v2, secao 2).
- `design/pokebola.webp`: usada como icone do botao "Capturei", abertura da animacao de captura, icone do app e loading.
- `design/referencias/card-pokemon-gradiente.png`: referencia do card principal com gradiente saturado por tipo (feedback v4 da IDEA).

## 3. Padroes de UI existentes (o prototipo como referencia)

Telas mapeadas em `design/prototipo/index.html` (atributo `data-screen`) e suas funcoes de render em `app.js`:

| Tela (`data-screen`) | Funcao(oes) de render | Observacoes |
|---|---|---|
| `home` | `renderHome()`, `renderSearch()` | busca, time de 6, historico (ultimos 20), atalhos |
| `dex` | `renderFilters()`, `renderDex()` | filtros tipo/geracao/evolucao/status/ordenacao, sem recarregar a tela |
| `detail` | `renderDetail()`, `statsBlock()`, `weakGridHTML()`, `evoHTML()`, `abilitiesHTML()`, `movesTableHTML()`, `whereHTML()`, `obtainHTML()`, `formBodyHTML()`, `renderCalc()` | ficha completa do Pokemon; abas de golpes (`data-mtab`) e formas (`data-ftab`) trocam SO o bloco via `swapIn()`, nunca redesenham a ficha inteira (requisito duro da IDEA) |
| `captured` | `renderCaptured()` | lista de capturados, abas/filtro |
| `compare` | `renderCompare()` | comparar 2 Pokemon lado a lado, `#cmp-swap` |
| `trainers` | `renderTrainers()`, `trHeaderHTML()`, `trStepHTML()`, `trStepBodyHTML()`, `refreshTrainerStates()`, `currentCap()` | progressao de level cap por serie (`data-series`), treinador-chave expandido em acordeao (`data-tr`), checkbox de derrotado (`data-trd`) |
| `balls` | `renderBalls()`, `ballGridHTML()`, `bestBalls()`, `bestBallHTML()` | grade de pokebolas + calculo de melhores 3 para o Pokemon aberto |
| `items` | `renderItems()`, `itemGridHTML()` | grade de itens por categoria (`data-icat`) + busca (`#item-q`) |
| `item` | `renderItemPage()`, `itemPageBodyHTML()`, `openItem()` | pagina individual de item, aberta via `[data-item-open]` de qualquer lugar do app |
| `settings` | (render inline) `renderThemes()`, `renderTermsSetting()` | tema (7 opcoes), idioma da interface, idioma dos termos do jogo (padrao + override por card via `termsTgl()`), som, reduzir animacoes |

**Telas exigidas pela IDEA sem nenhuma referencia visual no prototipo aprovado**: busca confirmada (`grep -i "sincroniz\|baixar app\|qr"` em `index.html`, `app.js` e `style.css`, zero ocorrencias) de que o prototipo NAO tem a tela "Sincronizar" (IDEA secao 2, decisao "SINCRONIZAR ENTRE DISPOSITIVOS": explicacao, "Gerar codigo" com QR + texto copiavel, "Receber codigo" via camera ou colar, escolha mesclar/substituir) nem o botao "Baixar app" (IDEA secao 2, decisao "ENTREGA EM FASES": visivel so no site, Fase 2, com opcoes Android e Desktop Windows). Essas duas pecas de UI precisam ser desenhadas do zero no Stage 3 (SPEC/design), seguindo a identidade visual ja aprovada (temas, tipografia, componentes, animacoes); `forge-ui-recon` nao tera nada do prototipo para capturar nelas.

Padroes de estado/infra a reproduzir em React:
- **Navegacao com pilha propria e historico real** (`app.js` linhas ~1202-1250): `snapshot()` captura tela + parametros + UI (aba ativa, filtros, scroll, linhas de golpe abertas, calculadora aberta) antes de cada `navigate()`; `goBack()`/`restore()` restauram exatamente esse snapshot; `window.addEventListener('popstate', ...)` integra com o botao fisico/gesto de voltar e Alt+Seta. Isso é exigencia dura da IDEA (secao 2, "NAVEGACAO DINAMICA COM HISTORICO REAL") e implica, na implementacao React, um roteador com pilha propria (nao um `useState` de tela simples nem `react-router` puro sem guardar UI+scroll).
- **I18N por dicionario de chaves** (`I18N`), com `t(key)` central; **idioma dos termos do jogo e independente da UI**: `state.termsDefault` + `state.termsOverride` por card, persistidos em `localStorage['pontindex.terms']` (`app.js` linhas 654-655).
- **Tema**: `document.documentElement.dataset.theme = id`; 7 temas com paleta propria. A IDEA exige persistir 5 preferencias entre aberturas (tema, idioma da interface, idioma dos termos do jogo, som, reduzir animacoes; decisao mais recente, commit `5700491`, "preferencias tema/idiomas/som/animacoes persistem em toda abertura"). **O prototipo hoje persiste em localStorage so 2 dessas 5**: idioma dos termos (`localStorage['pontindex.terms']`, linhas 654-655) e som (`localStorage['pontindex.sound']`, linhas 1067 e 1407, confirmado com `grep -n "localStorage\." app.js`). Tema (`state.theme`), idioma da interface (`state.lang`) e "reduzir animacoes" (checkbox `#sw-motion`) ficam so em memoria e voltam ao padrao a cada reload. A implementacao real precisa cobrir as 3 que faltam (tema, idioma da interface, reduzir animacoes) na camada de storage duravel (nao so localStorage solto, ver IDEA secao 2 "PERSISTENCIA DOS DADOS LOCAIS").
- **Som**: `Audio` por chave `dir/name` cacheada em `SFX{}`; toggle liga/desliga so os SFX automaticos; grito do Pokemon (`#cry-btn`) toca sempre, ignorando o toggle; autoplay bloqueado antes do 1o gesto e enfileirado em `pendingSfx` e disparado no proximo `pointerdown`.
- **Renderizacao parcial**: `swapIn(el, html)` troca `innerHTML` de um unico container e reaplica uma classe de transicao (`part-in`) + `icons()` (Lucide), padrao usado por todas as abas/filtros/toggles para nunca redesenhar a tela inteira.
- **Animacao de captura** (`startCapture/finishCapture/closeCapture`, linhas ~1276-1305): sequencia orquestrada com `setTimeout` (arremesso, 3 balancos, abertura, crescimento da silhueta, flash, revelacao final), fundo por categoria Legendario/Mitico/Outros (`bg-lendario`/`bg-mitico`/`bg-outros`) com camadas SVG proprias (`bolt()`, `spark()`, `dot()`), tocavel/pulavel com um toque, cada som do Cobblemon disparado no tempo certo.
- Paginas para `forge-ui-recon` referenciar depois: `design/prototipo/index.html` aberto no navegador cobre TODAS as telas listadas acima (inclusive a pagina de item e o preview mobile 390px via menu do prototipo).

## 4. Arquitetura e dados

Regra central da IDEA (secao 2): **dados 100% nativos no app**. Um script de build le a instancia local do usuario UMA VEZ e gera um pacote (JSON + texturas + sons + lang PT/EN) que entra no bundle do site/apps; em runtime o app nunca acessa mods/jars/pastas do Minecraft. Unica chamada de rede em runtime: PokeAPI para artwork grande (com cache local), alem dos sprites pequenos que tambem sao empacotados no build.

Fonte primaria dos dados de jogo: o snapshot versionado `data-source/atm-1.3.0/` (relativo a raiz do repo; copia filtrada da instancia All the Mons 1.3.0, Minecraft 1.21.1, NeoForge, Cobblemon 1.7.3; jars ja abertos em `mods/<nome-do-jar>/` com os caminhos internos originais; ver `data-source/README.md` e `MANIFEST.json`). Fonte padrao do build em qualquer PC, sem precisar do modpack. Opcionalmente o pipeline le uma instancia real (jars zipados) quando `ATM_INSTANCE_DIR` aponta para ela; a instancia original de onde o snapshot foi extraido ficou no PC de casa (`C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`) e nao e necessaria. Nas secoes abaixo, "dentro do jar X" vale igualmente para `data-source/atm-1.3.0/mods/X/`.

### Especies (Cobblemon)
- `data/cobblemon/species/<generationN>/<nome>.json` dentro de `mods/Cobblemon-neoforge-1.7.3+1.21.1.jar`: **1025 arquivos** (contagem reverificada com `unzip -l | grep -c`, bate com a IDEA).
- Campos confirmados por leitura direta de `species/generation1/bulbasaur.json`: `implemented`, `nationalPokedexNumber`, `name`, `primaryType`, `secondaryType`, `maleRatio`, `height`, `weight`, `pokedex` (chaves de lang da dex), `labels` (`gen1`, `legendary`, `starter`...), `aspects`, `abilities` (prefixo `h:` = oculta), `eggGroups`, `baseStats` (`hp/attack/defence/special_attack/special_defence/speed`), `evYield`, `baseExperienceYield`, `experienceGroup`, `catchRate`, `eggCycles`, `baseFriendship`, `hitbox`, `baseScale`, `behaviour` (walk/resting/herd/moving/combat), `drops` (`amount` + `entries[]` com `item` e `percentage` ou `quantityRange`), `moves` (formato real: `"<nivel>:<golpe>"` ex. `"1:tackle"`, `"egg:<golpe>"`, `"tm:<golpe>"`; NAO ha prefixo `"nivel:"` literal, o numero e o proprio nivel; **(divergencia)** a IDEA descreve o formato como prefixado por `nivel:`, mas o arquivo real usa so o numero seguido de dois-pontos), `evolutions[]`, `forms[]`, `preEvolution` (quando aplicavel).
- `evolutions[]` (confirmado em `eevee.json`, 8 ramos reais): cada entrada tem `id`, `variant` (`item_interact`, `level_up`, `trade`...), `result`, `consumeHeldItem`, `learnableMoves`, `requirements[]` (`{variant:"friendship", amount}`, `{variant:"time_range", range:"day|night"}`, `{variant:"has_move_type", type}`, `{variant:"level", minLevel}`...), e `requiredContext` (item exato, ex. `cobblemon:thunder_stone`) quando `variant` e `item_interact`.
- **Tipo/poder/precisao/categoria dos golpes NAO estao nos JSON de especie** (confirmado: `moves` so tem `<gatilho>:<nome-do-golpe>`). O arquivo `data/cobblemon/showdown.json` dentro do mesmo jar so contem `{"showdownVersion":"16"}`; os detalhes mecanicos do golpe vem do motor de batalha Showdown embutido (nao e JSON de dados simples) e devem ser obtidos da **PokeAPI** (`move/{name}`), como a IDEA ja concluiu.

### Fosseis
- `data/cobblemon/fossils/*.json` no jar do Cobblemon: **15 fosseis nativos** (`aerodactyl, amaura, anorith, archen, arctovish, arctozolt, cranidos, dracovish, dracozolt, kabuto, lileep, omanyte, shieldon, tirtouga, tyrunt`; alguns, como `arctovish`/`dracovish`/`dracozolt`/`arctozolt`, combinam 2 fosseis). Formato `{"result": "<especie>", "fossils": ["cobblemon:<item_fossil>", ...]}`. Esse numero e consistente com o total de arquivos de dados do Cobblemon que a IDEA atribui ao jar (1025 species + 824 spawn_pool_world + 15 fossils = 1864); a mencao a "14 especies" em outro trecho da IDEA e imprecisao de texto, nao um dado divergente do jar.
- `allthemons-0.6.2.jar` adiciona 1 fossil extra (`mewtwo.json`, revivido a partir de `allthemons:pika_star` ou `allthemons:ancient_dna_sample`), totalizando **16 rotas de fossil** disponiveis no pack (15 nativas + 1 do addon) - numero que o PRD deve adotar como fonte de verdade para a secao "Como obter".

### Spawn / raridade
- `data/cobblemon/spawn_pool_world/NNNN_nome.json` no jar do Cobblemon: **824 arquivos** (reverificado, bate com a IDEA para 1.7.3; a IDEA tambem cita 842 para a tag 1.8.1 do GitLab, nao usada). Campo chave por entrada em `spawns[]`: `bucket` (`common|uncommon|rare|ultra-rare`), `level` (faixa string), `weight`, `condition` (biomas, luz, ceu, estruturas, horario).
- Overrides/adicoes por addon (mesma estrutura `spawn_pool_world`, contagens reverificadas por soma de `species + species_additions + spawn_pool_world + fossils` dentro de cada jar, batendo exatamente com os totais da IDEA):
  - `allthemons-0.6.2.jar`: species 2, species_additions 11, spawn_pool_world 2, fossils 1 = **16**.
  - `mega_showdown-...jar`: species 52, species_additions 117, spawn_pool_world 29 = **198** (so formas de batalha, nao afeta obtencao).
  - `zamega-neoforge-1.7.6.jar`: species_additions 12, spawn_pool_world 1 = **13**.
  - `legendarymonuments-...jar`: spawn_pool_world 12 = **12**.
  - `complete-cobblemon-collection-myths-and-legends-compat-2.1.0.jar`: species 9, species_additions 225, spawn_pool_world 92 = **326**.
- `kubejs/data/cobblemon/spawn_pool_world/*.json` (na raiz da instancia, fora dos jars): **21 arquivos** que adicionam spawn natural a especies sem spawn no Cobblemon base (lista completa confirmada: `0385_jirachi, 0490_manaphy, 0492_shaymin, 0550_basculin, 0641_tornadus, 0642_thundurus, 0645_landorus, 0719_diancie, 0785_tapukoko, 0786_tapulele, 0787_tapubulu, 0788_tapufini, 0800_necrozma, 0807_zeraora, 0891_kubfu, 0893_zarude, 0901_ursaluna_bloodmoon, 0902_basculegion, 0971_greavard, 0972_houndstone, 1017_ogerpon`). Formato identico ao Cobblemon, condicao usa tags de bioma custom `#legendary_spawns_ccc:<nome>`. `kubejs/data/legendary_spawns_ccc/**` (**21 arquivos**) define essas tags de bioma. `kubejs/data/cobblemon/species_additions/generation7b/zzz_ccc_meltan.json` (1 arquivo) adiciona a especie Meltan.

### Especies custom do pack (Creepyon, Piglich): texturas nao sao sprites exibiveis
- Confirmado por leitura direta de `allthemons-0.6.2.jar`: `assets/allthemons/species/custom/{creepyon,piglich}.json` existem, mas as imagens associadas NAO sao sprites 2D de ficha, sao atlas de UV de modelo 3D (Bedrock) do jogo. `piglich.png`, `piglich_crown.png` e `piglich_shiny.png` estao em `assets/allthemons/textures/pokemon/`, junto com `creepyon_shiny.png`. Nao existe `creepyon.png` (forma normal): o resolver `assets/allthemons/bedrock/pokemon/resolvers/99003_creepyon/0_creepyon_base.json` mostra que a variante normal usa `"texture": "minecraft:textures/entity/creeper/creeper.png"` (a textura vanilla do Creeper), so a variante `shiny` tem textura propria (`allthemons:textures/pokemon/creepyon_shiny.png`).
- Consequencia direta para o app: nenhuma dessas imagens (atlas de UV de modelo 3D, ou a textura vanilla do Creeper) e utilizavel como artwork/sprite de ficha do jeito que a PokeAPI fornece para as outras especies. Creepyon e Piglich precisam de placeholder ou de uma imagem propria gerada/desenhada para o app (ex. um recorte estilizado do modelo, ou um icone generico "especie custom do pack"), nunca a textura de UV bruta.

### Formas / Megas / Gmax
- `forms[]` dentro do proprio JSON de especie do Cobblemon (Gmax nativo, ex. visto em `eevee.json`: `{"name":"Gmax", "aspects":["gmax"], "battleOnly":true, ...}`).
- Formas Mega (X/Y) vem do addon `mega_showdown` (52 species + 117 species_additions + 29 spawn_pool_world, listados acima); ZA Mega (`zamega`) adiciona variantes proprias. O item necessario para ativar a Mega (ex. Charizardite X/Y + Key Stone) fica nos dados/lang do proprio `mega_showdown`.

### Golpes e habilidades (texto/descricao)
- Nomes e descricoes traduzidos: `assets/cobblemon/lang/{pt_br,en_us}.json` dentro do jar do Cobblemon (**pt_br.json = 836.052 bytes / 9000 chaves totais no arquivo**, contando itens/tipos/naturezas/egg groups junto). Contagem de golpes e habilidades reverificada com um script Node lendo direto o `pt_br.json` empacotado nesta instancia (Cobblemon 1.7.3): chaves `cobblemon.move.<golpe>` = 929, `cobblemon.move.<golpe>.desc` = 932, `cobblemon.ability.<habilidade>` = 310, `cobblemon.ability.<habilidade>.desc` = 310. A IDEA cita ora "934 golpes, 314 habilidades" (numeros da tag 1.8.1 do GitLab, que NAO e a versao usada pelo pack) ora "932 golpes, 310 habilidades" (numeros da tag 1.7.3, que batem com esta contagem local). **Fonte de verdade para o dataset: 932 golpes / 310 habilidades**, a contar no build a partir das chaves `.desc` (todo golpe e toda habilidade documentados tem `.desc`; a contagem pelo nome simples do golpe, 929, e levemente menor porque 3 golpes tem `.desc` sem uma chave de nome separada). Padrao de chave confirmado: `item.cobblemon.<id>` / `item.cobblemon.<id>.tooltip`, `cobblemon.move.<golpe>.desc` (citado na IDEA para descricao de golpe).
- Mecanica do golpe (tipo/poder/precisao/categoria): PokeAPI `move/{name}`.

### Trainers / level cap (Radical Cobblemon Trainers)
- `mods/rctmod-neoforge-1.21.1-0.18.1-beta.jar`:
  - `data/rctmod/trainers/<id>.json`: **1559 arquivos** (nome, identidade, `team[]` com especie/nivel/genero/habilidade/moveset, `bag`, `battleRules`).
  - `data/rctmod/mobs/trainers/*.json`: **282 arquivos** de definicao de spawn (`type`, `optional` true/false, `requiredDefeats` = lista de listas AND/OR, `series`, `signatureItem`, biomas).
  - `assets/rctmod/lang/{pt_br,en_us}.json` existem (95.385 / 89.466 bytes) com titulos de series/tipos em PT.
- `kubejs/data/rctmod/`: **30 arquivos** em `trainers/` (treinadores proprios do pack, series `atm_team`/`contentcreators`), **60 arquivos** em `mobs/trainers/` (definicoes de spawn), **30 arquivos** em `loot_table/`, `series/atm_team.json` e `series/contentcreators.json`.
- `config/rctmod-server.toml` (confirmado por leitura direta): `initialLevelCap = 15`, `relativeLevelCap = 0`, `initialSeries = "empty"`. Regra do cap (doc oficial RCT, ja documentada na IDEA e validada com dados reais da cadeia BDSP): cap = nivel maximo do time do PROXIMO treinador-chave da serie ativa (`optional:false`), mais `relativeLevelCap`; `requiredDefeats` e AND entre sublistas, OR dentro de cada sublista.

### Pokebolas
- 48 bolas (Cobblemon 1.7.3, pasta `textures/item/poke_balls/`; as 51 chaves `item.cobblemon.*_ball` do lang incluem 3 itens segurados: `iron_ball`, `light_ball`, `smoke_ball`), tooltip oficial PT/EN no lang do Cobblemon, chave `item.cobblemon.<bola>` + `.tooltip` (confirmado o padrao com `net_ball`: `"item.cobblemon.net_ball":"Bola Tela"`, `"item.cobblemon.net_ball.tooltip":"3× em Pokémon do tipo Água ou Inseto"`).

### Itens / comidas / cozinha
- 932 itens no lang do Cobblemon, 430 com `.tooltip` de descricao (medicina, vitaminas de EV, Power items, doces de EXP e de IV, PP Up, Ability Capsule/Patch, pedras/itens de evolucao, held items, itens de batalha).
- Receitas: `data/cobblemon/recipe/*.json` (nome de pasta no singular, nao "recipes") no jar do Cobblemon: **750 arquivos** (confirmado, bate com a IDEA).
- Cozinha: `seasonings` (76), `spawn_bait_effects` (78, iscas), `berries` (70, dados de plantio) - pastas de mesmo nome dentro de `data/cobblemon/` no jar; overrides de isca/berry tambem aparecem em `kubejs/data/cobblemon/spawn_bait_effects/fruits/`.
- `data/cobblemon/loot_table/` no jar do Cobblemon: **457 arquivos `.json`** (loot nativo, ex. baus de estrutura vanilla; a contagem bruta de entradas do zip, 482, inclui 25 entradas de diretorio sem conteudo, reverificado separando `unzip -l | grep -c` (482, com pastas) de `unzip -l | grep -E '\.json$' | wc -l` (457, so arquivos)). `kubejs/data/cobblemon/loot_table/{injection,sets}/` acrescenta injeções do pack (Pokebolas em baus).

### Texturas / imagens de item
- `assets/cobblemon/textures/item/**/*.png` no jar do Cobblemon: **802 arquivos** (recontagem confirma exatamente o numero da IDEA; pixel art 16x16, subpastas `poke_balls, medicine, iv_candy, experience_candy, mints, berries, evolution, held_items, battle_items, food, poke_puffs, mochis, aprijuice, fossils, mulches`...). `assets/allthemons/textures/item/**/*.png` em `allthemons-0.6.2.jar`: **79 arquivos** (divergencia: a IDEA cita 87; a recontagem direta no jar deu 79 - adotar 79 como fonte de verdade). `assets/mega_showdown/textures/item/**/*.png` em `mega_showdown-...jar`: **322 arquivos** (confirmado). Ja extraidas para o prototipo em `design/prototipo/assets/itens/`, uma subpasta por origem - `cobblemon/` 733, `allthemons/` 79, `mega_showdown/` 322, mais 1 `manifest.js` na raiz - somando **1134 arquivos .png, 2,0 MB**, nomeadas por `<item_id>.png`.

### Sons
- `assets/cobblemon/sounds/**/*.ogg` no jar do Cobblemon: **2778 arquivos** (a IDEA cita 2776; diferenca de 2 provavelmente por arquivos de indice/pasta na contagem do zip, sem impacto pratico). `assets/cobblemon/sounds.json` (254.857 bytes) mapeia os eventos de som (a IDEA cita 2408 eventos). Gritos em `pokemon/<nome>/<nome>_cry.ogg` (1072 arquivos, ~16,5 MB); sons de Pokebola/Pokedex/GUI/evolucao/shiny (~60 arquivos, ~1,75 MB). O prototipo usa uma amostra de 47 `.ogg` em `design/prototipo/assets/sons/` so para demonstrar a experiencia.

### Traducao / idiomas
- Cobblemon: `assets/cobblemon/lang/pt_br.json` e `en_us.json` no jar (836 KB e ~791 KB respectivamente), cobrem nomes de especie, descricoes de dex, golpes, habilidades, tipos, naturezas, egg groups, itens, pokebolas.
- Addons com lang PT/EN proprios confirmados: `allthemons` (`assets/allthemons/lang/{en_us,pt_br}.json`, ~20 KB cada), `mega_showdown` (lang proprio + overrides em `assets/cobblemon/lang/`), `zamega`, `legendarymonuments`, `rctmod` (`assets/rctmod/lang/{en_us,pt_br}.json`, ~89-95 KB). `complete-cobblemon-collection-...` so tem `en_us.json` (153 bytes, praticamente vazio) e depende do lang base do Cobblemon.

### Precedencia entre mods e kubejs
Ordem pratica de merge para o script de build (species/spawn/fossil por `nationalPokedexNumber`/id do arquivo): Cobblemon (base) -> addons em `mods/` que adicionam `species_additions`/`spawn_pool_world` proprios (complete-cobblemon-collection, mega_showdown, allthemons, zamega, legendarymonuments) -> overrides/adicoes do proprio pack em `kubejs/data/cobblemon/` (mais especificos, ex. os 21 spawns de lendarios com bioma custom `#legendary_spawns_ccc:*`) -> `kubejs/data/rctmod/` mescla com os treinadores nativos do `rctmod` jar do mesmo jeito (trainers proprios do pack somados aos 1559 nativos). Nao ha reescrita de arquivo (todos usam `species_additions`/adicoes aditivas do datapack, no estilo Minecraft), entao o merge e uniao por chave, sem necessidade de "vencer" conflitos na maioria dos casos: o unico caso de override real e o campo `bucket`/condicao quando a mesma especie aparece em mais de um `spawn_pool_world` (ai todas as entradas contam, a UI escolhe o bucket mais comum, conforme IDEA).

## 5. Integracao / servicos externos (nomes apenas)

- **PokeAPI** (`pokeapi.co`): artwork oficial (`pokemon/{id}`), sprites, `evolution-chain/{id}`, `move/{name}` (tipo/poder/precisao/categoria/descricao do golpe, unica fonte para isso). `pokemon-species/{id}` (nomes localizados incl. pt-br) e `type/{name}` servem so como fallback/comparacao: a fonte primaria de nomes, descricoes e da tabela de tipos no app e o lang e os dados do Cobblemon empacotados no build (a tabela de tipos fica hardcoded como no prototipo), nao a PokeAPI. Gratuita, sem chave, CORS liberado. **Decisao do PRD**: os dados de `move/{name}` (tipo/poder/precisao/categoria/descricao) tambem sao buscados na PokeAPI SO em build-time e empacotados no dataset, junto com species/spawn/lang do Cobblemon; em runtime o app nao chama `move/{name}` (nem nenhum outro endpoint de dados) - a unica chamada de rede em runtime fica restrita ao artwork grande (com cache local), conforme a regra "dados 100% nativos no app" da IDEA (secao 4).
- Nenhum outro servico externo: sem backend proprio, sem analytics, sem conta/login (confirmado repetidamente na IDEA).

## 6. Convencoes

- **Idioma dos identificadores de codigo: INGLES** (`code_identifier_language: en`), decisao "novo projeto, sem convencao estabelecida -> padrao ingles", e reforcada pelo proprio prototipo aprovado: apesar de todos os comentarios e strings de UI estarem em pt-BR, TODOS os identificadores de `app.js` sao em ingles. Exemplos reais do prototipo: `function renderDetail()`, `function navigate(screen, fn)`, `const state = { lang, theme, sound, screen, detailId, shiny, moveTab, ... }`, `function startCapture(id)`, `const DATA = { pokemon: [...], chains: {...}, abilities: {...} }`. CSS custom properties tambem em ingles/kebab-case: `--primary`, `--secondary-soft`, `--type-fire-a`, `--scroll-thumb`.
- Strings visiveis ao usuario (pt-BR e en-US) ficam em um dicionario central `I18N` chaveado por string tipo `"nav.home"`, `"detail.stats"`, `"tr.explain"` (padrao `<contexto>.<campo>`), nunca hardcoded no meio do JSX/HTML.
- CSS: temas via atributo `[data-theme]` na raiz (`<html>`), nunca classes de tema espalhadas; paleta de cada tipo Pokemon centralizada em `design/tipos/cores.json` (chave = tipo em ingles, campos `base/a/b`) e espelhada em variaveis CSS `--t-<tipo>` / `--type-<tipo>-a/b`.
- Toda animacao usa apenas `transform`/`opacity` (requisito de performance da IDEA) e respeita `prefers-reduced-motion` / toggle "reduzir animacoes".

## 7. Restricoes e riscos

- **Sem CORS no GitLab do Cobblemon**: dados brutos precisam ser baixados/gerados em build-time (script Node rodando no PC do usuario), nunca em runtime no navegador. Igualmente, os jars da instancia so podem ser lidos no PC do usuario; o app final nao acessa nada do Minecraft em runtime (regra dura da IDEA).
- **Volume de midia**: ~20 MB de sons + texturas de item + sprites pequenos da PokeAPI empacotados no bundle (site PWA na Vercel, plano gratuito) - a IDEA ja aceitou esse tamanho, mas e um numero a vigiar conforme mais assets entrarem (1072 gritos = 16,5 MB, UI/evolucao/shiny = 1,75 MB, 802+79+322 texturas de item).
- **1025 especies + ~1559+ treinadores + ~1100 texturas + sons** exigem lista virtualizada e carregamento preguicoso no app real (mencionado como caso de borda na IDEA, secao 8).
- **Licenca dos assets**: icones de tipo (`duiker101/pokemon-type-svg-icons`, sem licenca declarada) e texturas extraidas dos mods (nao sao codigo MPL) sao para uso privado entre amigos, sem distribuicao publica - restricao a lembrar se o projeto algum dia for aberto.
- **Prototipo ainda nao persiste tema, idioma da interface e reducao de movimento em localStorage** (so idioma dos termos por card e som persistem hoje, ver secao 3); a decisao mais recente do usuario (commit `5700491`) exige persistir as 5 preferencias (tema, idioma interface, idioma termos, som, reduzir animacoes). Isso e uma lacuna do prototipo (referencia visual, nao funcional 100%) que a implementacao real precisa cobrir via a camada de storage duravel descrita na IDEA (IndexedDB na Fase 1, arquivo proprio nas Fases 2/Electron/Capacitor), nao um bug a replicar.
- **Mecanica de golpes (tipo/poder/precisao/categoria) nao esta em nenhum JSON simples do Cobblemon**: depende inteiramente da PokeAPI (`move/{name}`). O PRD decidiu buscar esses dados da PokeAPI SO em build-time e empacota-los no dataset junto com o resto (nao ha chamada a `move/{name}` em runtime); isso elimina a dependencia de disponibilidade da PokeAPI para esse dado especifico depois do build, ao custo de precisar rodar o build de novo se a PokeAPI corrigir/atualizar algum golpe.
- **`config/cobblemon/main.json` foi modificado pelo usuario em 2026-09-23** (depois do manifest e dos jars, que sao de 18/09): e configuracao de sessao de jogo (ex. server list, opcoes), nao afeta os dados de especie/spawn usados pelo dataset; ainda assim, ao gerar o pacote de build, preferir ler direto dos jars (`mods/`) e do `kubejs/data/`, que sao a fonte estavel, e tratar `config/` apenas como referencia auxiliar (ex. `rctmod-server.toml` para o level cap).

## 8. Pontos em aberto (nao resolvidos por este CONTEXT)

1. **IVs/EVs recomendados por Pokemon**: nao existem no Cobblemon nem na PokeAPI; decidir no PRD entre heuristica pelos stats base ou dataset de sets competitivos (Smogon) gratuito.
2. **Especies custom do pack sem artwork na PokeAPI** (Creepyon #9902, Piglich, do `allthemons-0.6.2.jar`): confirmado que o mod NAO tem sprite 2D exibivel para nenhuma das duas (so atlas de UV de modelo 3D em `assets/allthemons/textures/pokemon/`, e a forma normal do Creepyon reusa a textura vanilla `minecraft:textures/entity/creeper/creeper.png`, ver secao 4). Decidir no PRD: placeholder generico ou imagem propria desenhada/gerada para o app; e se as duas entram na Pokedex do app.
3. **Qual mod fornece breeding de fato no pack**: `Cobbreeding` nao esta em `mods/`, so `Just Enough Breeding 3.2.1`; o usuario confirmou que da para criar Pokemon no pasture, mas o mecanismo tecnico exato (dados a expor em "Como obter") precisa ser lido do proprio mod na implementacao.
4. **Comportamento de `initialSeries = "empty"`** no RCT quando nenhuma serie foi escolhida ainda (nao documentado na doc oficial nem testado).
5. **Efeito exato de cada prato/curry de cozinha do Cobblemon 1.7** sobre o Pokemon (a IDEA cita a wiki como pendente de leitura mais fina para a secao Itens & Comidas).
6. **Formato final do codigo de transferencia (Sincronizar)**: tamanho pratico do QR/texto com progresso completo (ex. ~1025 capturados) e regra fina de mesclagem merge vs substituir, a decidir no PRD/SPEC.
7. **Telas "Sincronizar" e botao "Baixar app" sem qualquer referencia visual no prototipo aprovado** (confirmado por busca em `index.html`/`app.js`/`style.css`: nenhuma ocorrencia de "sincroniz", "baixar app" ou "qr"): precisam ser desenhadas do zero no Stage 3 (SPEC/design), seguindo a identidade visual ja aprovada (temas, tipografia, componentes, animacoes), sem mockup de referencia para o `forge-ui-recon` capturar.
