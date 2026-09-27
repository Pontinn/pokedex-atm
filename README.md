<p align="center">
  <img src="docs/readme/icon.png" width="96" alt="Pontindex" />
</p>

<h1 align="center">Pontindex</h1>

<p align="center">
  Pokedex pessoal para o modpack <b>All the Mons 1.3.0</b> (Cobblemon 1.7.3).<br />
  PWA estatica, sem backend, com todos os dados do modpack empacotados no build.
</p>

<p align="center">
  <a href="https://pontindex.pontin.dev"><b>pontindex.pontin.dev</b></a>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb" />
  <img alt="TypeScript 5.8" src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" />
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" />
  <img alt="PWA" src="https://img.shields.io/badge/PWA-instalavel-5a0fc8?logo=pwa&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-unit%20%2B%20componente-6e9f18?logo=vitest&logoColor=white" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-e2e-2ead33?logo=playwright&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white" />
</p>

<p align="center">
  <img src="docs/readme/desktop-home.webp" width="800" alt="Tela inicial do Pontindex no desktop" />
</p>

---

## Sumario

- [A ideia](#a-ideia)
- [O que o app faz](#o-que-o-app-faz)
- [Temas](#temas)
- [Mobile: uma Pokedex de verdade](#mobile-uma-pokedex-de-verdade)
- [Como foi desenvolvido](#como-foi-desenvolvido)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Os dados](#os-dados)
- [Decisoes de projeto](#decisoes-de-projeto)
- [Como rodar](#como-rodar)
- [Testes e qualidade](#testes-e-qualidade)
- [Publicacao](#publicacao)
- [Planejamento futuro](#planejamento-futuro)
- [Creditos e licenca](#creditos-e-licenca)

---

## A ideia

Eu (Pontin) e meus amigos jogamos **All the Mons**, um modpack de Minecraft baseado no **Cobblemon**. O problema de sempre: no meio do jogo voce quer saber em que nivel o Charmeleon evolui, qual Pokebola usar num Pokemon pesado, quem e o proximo treinador que libera o level cap, o que a Poke Puff faz. Sites como pokemondb nao servem, porque o Cobblemon e os addons do pack mudam evolucoes, spawns, raridades e itens. E abrir a pasta dos mods no celular nao da.

Dai nasceu o Pontindex, com quatro regras que guiaram tudo:

1. **Estetica de Pokemon de verdade.** Vermelho e azul de Pokedex, cards com gradiente por tipo, sons do jogo, animacao de captura. Um layout responsivo para desktop e outro pensado so para o celular.
2. **Plug and play.** Sem conta, sem login, sem servidor. Abriu, usou. Os dados de cada pessoa (capturados, time, historico, progresso dos treinadores) ficam so no aparelho dela.
3. **Dados 100% nativos do modpack.** O app le os jars e o `kubejs/` da instancia do All the Mons **uma vez, em build time**, e empacota tudo: especies, spawns, evolucoes, golpes, habilidades, treinadores, Pokebolas, itens, texturas, gritos e traducoes PT/EN. Em runtime nao existe API do modpack; so o artwork grande vem da PokeAPI.
4. **Custo zero.** Site estatico na Vercel, nenhuma API paga, nenhum banco.

A frase original do pedido resume bem: _"simples pra usar entre amigos, nada demais"_. O "nada demais" virou 125 requisitos funcionais, mas a simplicidade de uso continuou sendo a meta.

---

## O que o app faz

### Inicio

Busca por nome (PT ou EN, sem acento, com autocomplete) ou por numero da Pokedex ("25", "025", "0025"). Botao "Pokemon aleatorio", contador de capturados, o time de 6 e o historico dos ultimos 20 Pokemon consultados.

### Pokedex

Grade virtualizada com os 1.027 Pokemon do pack, cada card com o gradiente do tipo principal, selo de raridade (Comum, Incomum, Raro, Ultra-raro, Lendario, Mitico) e marcacao de capturado. Filtros combinaveis: tipo, geracao, metodo de evolucao, ordenacao e "so capturados / so faltando", tudo junto com a barra de busca.

<p align="center">
  <img src="docs/readme/desktop-dex-grid.webp" width="800" alt="Pokedex com filtros e grade de cards" />
</p>

### Ficha do Pokemon

A tela mais densa do app. Tudo atualiza por componente: trocar de aba ou toggle nunca redesenha a ficha inteira.

- **Card principal** com artwork oficial, gradiente do tipo (dourado para Lendario, roxo/ciano para Mitico), botao de shiny, botao que toca o **grito do Pokemon** (som real do Cobblemon), selos de raridade e "nao nasce no mundo", botoes "Capturei" e "Adicionar ao time".
- **Atributos base** com barras e o total (BST).
- **Fraquezas e resistencias** calculadas pelos dois tipos (x4, x2, x1/2, x1/4, x0), com filtro Todos / Fraquezas / Resistencias.
- **Evolucoes** clicaveis com o metodo exato do Cobblemon: nivel, item (Pedra do Trovao), amizade + hora do dia, golpe de tipo, troca.
- **Habilidades** com descricao oficial, incluindo a oculta.
- **Golpes** por Nivel, TM, Ovo e Tutor, com tipo, categoria, poder, precisao, PP e descricao.
- **Formas** (Mega X/Y, Gmax, regionais) como abas, com o item de ativacao lido dos addons (Charizardita X + Key Stone).
- **Onde encontrar**: biomas, luz, hora, estruturas, faixa de nivel e bucket de raridade de cada entrada de spawn.
- **Como obter**, em camadas honestas: evolucao, fossil, spawn adicionado pelo proprio pack, addon (Legendary Monuments, Raid Dens, breeding) ou "sem rota confirmada". Nunca inventa.
- **Drops** com porcentagem e link para a pagina do item.
- **Melhor Pokebola** para aquele Pokemon, ranqueada pelos multiplicadores oficiais (peso, velocidade base, tipo, luz, Ultra Beast).
- **Calculadora de stats** (IV, EV, natureza, nivel) com recomendacao automatica por funcao (Atacante rapido, Atacante lento, Defensivo), claramente marcada como sugestao criada com ajuda de IA.
- **Calculadora de efetividade** entre dois tipos.

<p align="center">
  <img src="docs/readme/desktop-detail-charizard-full.webp" width="800" alt="Ficha do Charizard" />
</p>

<table>
  <tr>
    <td><img src="docs/readme/desktop-detail-mewtwo-legendary-full.webp" alt="Ficha do Mewtwo com card dourado de Lendario" /></td>
    <td><img src="docs/readme/desktop-detail-mew-mythical-full.webp" alt="Ficha do Mew com card de Mitico" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Lendario: card dourado com brilho e faiscas</sub></td>
    <td align="center"><sub>Mitico: gradiente roxo e ciano</sub></td>
  </tr>
  <tr>
    <td><img src="docs/readme/desktop-detail-charizard-moves-tm.webp" alt="Aba de golpes por TM" /></td>
    <td><img src="docs/readme/desktop-detail-charizard-mega-x-form.webp" alt="Forma Mega Charizard X" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Golpes por TM com mecanica oficial</sub></td>
    <td align="center"><sub>Formas com o item de ativacao</sub></td>
  </tr>
</table>

### Animacao de captura

Ao clicar em "Capturei" a tela apaga, a Pokebola balanca tres vezes e abre, um fundo de raios na cor da categoria (Lendario, Mitico ou Outros) gira devagar, a silhueta preta do Pokemon cresce, a tela pisca branco e o Pokemon aparece com o nome. Tudo em vetor (SVG e CSS), so `transform` e `opacity`, com os sons reais da Pokebola. Pode ser pulada com um toque e respeita "reduzir animacoes".

<table>
  <tr>
    <td><img src="docs/readme/capture-outros-04-shake.webp" alt="Pokebola balancando" /></td>
    <td><img src="docs/readme/capture-outros-06-silhouette-grow.webp" alt="Silhueta crescendo" /></td>
    <td><img src="docs/readme/capture-outros-08-final-reveal.webp" alt="Revelacao final" /></td>
  </tr>
  <tr>
    <td><img src="docs/readme/capture-legendario-03-final-reveal.webp" alt="Captura de Lendario" /></td>
    <td><img src="docs/readme/capture-mitico-03-final-reveal.webp" alt="Captura de Mitico" /></td>
    <td><img src="docs/readme/desktop-captured-list.webp" alt="Lista de capturados" /></td>
  </tr>
</table>

### Treinadores e level cap

O All the Mons usa o mod **Radical Cobblemon Trainers**: seus Pokemon param de ganhar experiencia no level cap, e o cap so sobe derrotando treinadores-chave em ordem. O Pontindex mostra, por serie (Radical Red, BDSP, Unbound, ATM Team, Content Creators), a linha do tempo dos treinadores-chave com o **cap que cada vitoria libera**, o time completo de cada um (especie, nivel, habilidade, golpes, item segurado), o item de spawn para usar no Trainer Spawner, os biomas, os pre-requisitos ("requer um de") e uma sugestao de tipo para levar. Voce marca quem ja derrotou e o app calcula o seu cap atual.

<p align="center">
  <img src="docs/readme/desktop-trainers-expanded-full.webp" width="800" alt="Linha do tempo dos treinadores com level cap" />
</p>

### Pokebolas, Itens e Comidas

As 48 Pokebolas do pack com o efeito oficial (multiplicador, condicao, efeito pos-captura) e filtros. Os 949 itens de uso no Pokemon (remedios, vitaminas, doces de EV e IV, mints, pedras de evolucao, held items, itens de batalha, cozinha, berries, iscas) com descricao oficial, textura pixel art real do jogo e pagina propria dizendo **como obter** (craft, drop de Pokemon com porcentagem, plantio, bau de estrutura, pesca) e **onde e usado** (quais Pokemon evoluem com aquela pedra, por exemplo). Todo item citado em qualquer lugar do app e clicavel.

<table>
  <tr>
    <td><img src="docs/readme/desktop-balls-full.webp" alt="Pokebolas" /></td>
    <td><img src="docs/readme/desktop-items-grid.webp" alt="Itens e comidas" /></td>
    <td><img src="docs/readme/desktop-item-page-full.webp" alt="Pagina de um item" /></td>
  </tr>
</table>

### Comparar, Sincronizar e Configuracoes

- **Comparar** dois Pokemon lado a lado (stats, tipos, fraquezas), com botao de trocar.
- **Sincronizar entre dispositivos** sem servidor: o progresso vira um bitmap comprimido com CRC, exibido como QR code (varios quadros quando precisa), texto copiavel ou arquivo `.pdx`. No outro aparelho voce escaneia com a camera, cola ou abre o arquivo, ve um resumo e escolhe mesclar ou substituir.
- **Configuracoes**: tema, idioma da interface, idioma dos termos do jogo, som, reduzir animacoes, instalar como app, **exportar e importar backup** (JSON com CRC), apagar dados com confirmacao e restaurar o ultimo snapshot.

<table>
  <tr>
    <td><img src="docs/readme/desktop-compare.webp" alt="Comparar dois Pokemon" /></td>
    <td><img src="docs/readme/desktop-settings-full.webp" alt="Configuracoes" /></td>
  </tr>
</table>

---

## Temas

Sete temas, cada um com sua cor primaria e secundaria. A escolha persiste em toda abertura. As barras de rolagem e a marca d'agua da Pokebola seguem o tema. No tema Preto os cards ficam pretos para nao se confundirem com o fundo.

<table>
  <tr>
    <td><img src="docs/readme/desktop-home.webp" alt="Tema Classico" /></td>
    <td><img src="docs/readme/theme-azul-home.webp" alt="Tema Azul" /></td>
    <td><img src="docs/readme/theme-preto-home.webp" alt="Tema Preto" /></td>
    <td><img src="docs/readme/theme-verde-home.webp" alt="Tema Verde" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Classico (vermelho e azul)</sub></td>
    <td align="center"><sub>Azul</sub></td>
    <td align="center"><sub>Preto e amarelo</sub></td>
    <td align="center"><sub>Verde</sub></td>
  </tr>
  <tr>
    <td><img src="docs/readme/theme-laranja-home.webp" alt="Tema Laranja" /></td>
    <td><img src="docs/readme/theme-roxo-home.webp" alt="Tema Roxo" /></td>
    <td><img src="docs/readme/theme-branco-home.webp" alt="Tema Branco" /></td>
    <td></td>
  </tr>
  <tr>
    <td align="center"><sub>Laranja</sub></td>
    <td align="center"><sub>Roxo</sub></td>
    <td align="center"><sub>Branco</sub></td>
    <td></td>
  </tr>
</table>

---

## Mobile: uma Pokedex de verdade

No celular o app abre como uma Pokedex fisica: a tampa vermelha com a luz azul e os tres LEDs, o som de abrir a Pokedex do jogo, a tampa sobe e revela a tela. Navegacao por barra inferior, folha "Mais" para as outras telas, e tudo testado em 360 e 390 px de largura. O botao voltar do celular volta na navegacao do app, nao sai dele.

<table>
  <tr>
    <td><img src="docs/readme/mobile-boot-lid-closed.webp" alt="Tampa fechada" /></td>
    <td><img src="docs/readme/mobile-home.webp" alt="Inicio no mobile" /></td>
    <td><img src="docs/readme/mobile-dex-grid.webp" alt="Pokedex no mobile" /></td>
    <td><img src="docs/readme/mobile-detail-charizard-full.webp" alt="Ficha no mobile" /></td>
    <td><img src="docs/readme/mobile-captured.webp" alt="Capturados no mobile" /></td>
    <td><img src="docs/readme/mobile-nav-mais-sheet.webp" alt="Folha Mais" /></td>
  </tr>
</table>

---

## Como foi desenvolvido

O Pontindex foi construido em **cinco dias** (23 a 27 de setembro de 2026), em **233 commits**, num fluxo de "planejar primeiro, codar depois" conduzido com o **Claude Code** como par de programacao e orquestrador de agentes. Cada etapa deixou um artefato versionado na pasta `.forge/`, entao o projeto inteiro pode ser retomado em outro PC so lendo o disco.

```mermaid
flowchart LR
    A[IDEA<br/>ideia, pesquisa,<br/>decisoes] --> B[Prototipo HTML<br/>v1 a v9]
    B --> C[PRD<br/>125 RFs, 12 RNFs]
    C --> D[SPEC + UISPEC<br/>plano em ondas]
    D --> E[Implementacao<br/>agentes em paralelo]
    E --> F[Auditoria<br/>independente dos dados]
    F --> G[Testes<br/>unit, componente, e2e]
    G --> H[Validacao manual<br/>no PC e no celular]
```

### 1. Ideia e pesquisa (dia 1)

Antes de qualquer codigo: o que e o All the Mons, de onde vem cada dado, o que a PokeAPI tem e o que nao tem, como o Cobblemon calcula stats, como o Radical Cobblemon Trainers decide o level cap. Descobertas importantes dessa fase:

- O All the Mons nao tem API. Os dados estao nos jars do Cobblemon e dos addons, mais os ajustes do proprio pack em `kubejs/`. Os JSON do GitLab do Cobblemon nao tem CORS, entao a unica saida e empacotar em build time.
- A regra do level cap foi validada com dados reais e com a memoria de jogo: cap inicial 15, depois de Roark 16, depois 20. Bateu exatamente com "cap = nivel do Pokemon mais forte do proximo treinador-chave".
- O lang oficial do Cobblemon tem pt_br completo (nomes, descricoes, golpes, habilidades), o que resolveu o toggle PT/EN sem depender de traducao externa.

### 2. Prototipo visual (dia 1)

Sem referencias externas, a solucao foi um **prototipo em HTML puro** (`design/prototipo/`) que evoluiu em nove versoes no mesmo dia, cada uma com feedback: chips compactos, fundo secundario mais saturado, fundos de captura recriados em vetor, gradientes por tipo, cards dourados de Lendario, filtro de fraquezas, secao "Como obter", telas de Treinadores, Pokebolas e Itens, pagina de item com imagens reais. A v9 foi aprovada como referencia visual oficial e virou a `UISPEC`.

### 3. PRD e SPEC (dias 1 e 2)

O PRD listou 125 requisitos funcionais e 12 nao funcionais, com exemplos reais (Eevee e suas 8 evolucoes, a cadeia BDSP, Mewtwo revivido de fossil). A SPEC transformou isso num plano executavel em **ondas**: contratos congelados primeiro (schemas Zod do dataset, do storage, dos temas), depois pipeline de dados, regras de dominio e storage em paralelo, depois a fundacao do frontend, depois as telas em grupos independentes.

### 4. Implementacao por agentes (dias 2 a 4)

Cada onda foi executada por agentes separados (backend de dados, regras de dominio, frontend), em paralelo quando nao havia risco de conflito, cada um com um `HANDOFF` no disco descrevendo o que fez, o que testou e o que ficou aberto. Regras da casa durante a implementacao:

- Commits atomicos por feature, com prefixos `feat/fix/test/docs/chore`.
- Nenhum agente roda mais de uma hora; ao estourar, um agente novo continua do disco.
- Nada de texto literal em JSX fora do modulo de i18n (regra de lint).
- Nada de `waitForTimeout` nos testes e2e; so auto-waiting e `expect.poll`.

### 5. Auditoria independente dos dados (dias 2 e 4)

Como o app afirma coisas concretas ("Brock libera cap 21", "Mewtwo revive com Pika Star"), um agente separado escreveu uma **ferramenta de auditoria** (`tools/dataset/audit/`) que recalcula os valores esperados direto dos arquivos crus, sem usar o codigo do pipeline, e compara com o dataset publicado. Duas rodadas encontraram e corrigiram bugs reais: raridade principal errada, `species_additions` de addons ignoradas, colisao de arquivos de spawn entre jars (resolvida pela ordem de carga transitiva dos `neoforge.mods.toml`), habilidade oculta perdida quando tambem e normal, itens segurados dos treinadores em formato de lista. A ultima rodada fechou com **0 divergencias**.

### 6. Testes e sessao noturna (dias 4 e 5)

Com as telas prontas, a fase de testes cobriu unidade, componente (React Testing Library) e e2e (Playwright), alem de um checklist manual. A suite e2e completa rodou pela primeira vez numa sessao autonoma durante a madrugada e encontrou um bug antigo real: o botao "Atualizar" da PWA nao ativava o service worker novo porque o som de clique reanimava o worker antigo. Foi provado via Chrome DevTools Protocol e corrigido com um botao silencioso.

### Em numeros

|                                 |                                                            |
| ------------------------------- | ---------------------------------------------------------- |
| Dias de desenvolvimento         | 5                                                          |
| Commits                         | 233                                                        |
| Requisitos funcionais no PRD    | 125                                                        |
| Codigo do app (`src/`)          | ~15,7 mil linhas em 184 arquivos TS/TSX                    |
| Pipeline e geradores (`tools/`) | ~6,9 mil linhas                                            |
| Testes (`tests/`)               | ~12,1 mil linhas                                           |
| Testes                          | 459 unit e componente em 64 arquivos + 218 e2e em 18 specs |
| Telas                           | 11                                                         |
| Temas                           | 7                                                          |
| Idiomas                         | pt-BR e en (interface e termos do jogo, separados)         |

---

## Tecnologias

| Camada       | Escolha                                                                  | Por que                                                                  |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| UI           | **React 19 + TypeScript 5.8** (strict)                                   | Componentes isolados, atualizacao por componente, tipos de ponta a ponta |
| Build        | **Vite 6** + `vite-plugin-pwa`                                           | Build rapido, service worker com precache e runtime caching              |
| Estado       | **Zustand 5**                                                            | Stores pequenas, sem boilerplate, persistidas no IndexedDB               |
| Persistencia | **IndexedDB** via `idb`                                                  | Duravel, versionado, com migracoes, snapshots e escrita atomica          |
| Validacao    | **Zod**                                                                  | Schemas compartilhados entre o pipeline (Node) e o app (browser)         |
| Listas       | `@tanstack/react-virtual`                                                | 1.027 cards sem travar o celular                                         |
| Sync         | `fflate` + `qrcode` + `@zxing/browser`                                   | Compressao, geracao e leitura de QR no navegador                         |
| Icones       | `lucide-react` (interface) + SVG proprios (18 tipos)                     | Nitidez em qualquer tamanho                                              |
| Fontes       | Fredoka, Nunito, Silkscreen (empacotadas)                                | Titulos arredondados, corpo legivel, numeros de dex em pixel             |
| Pipeline     | **Node 24 + tsx** + `sharp` + `@iarna/toml`                              | Le jars e configs do modpack, gera JSON, sprites e sons                  |
| Testes       | **Vitest 3** + Testing Library + `fake-indexeddb` + `msw` + `fast-check` | Unit, componente, propriedades e mocks de rede                           |
| E2E          | **Playwright 1.63**                                                      | Fluxos completos, offline, responsivo, baselines visuais                 |
| Qualidade    | ESLint 9 (flat config) + Prettier                                        | Inclui regras proprias: proibe travessao e texto literal em JSX          |
| Deploy       | **Vercel**                                                               | Estatico, gratis, cache imutavel para dados e assets                     |

---

## Arquitetura

### Pipeline de dados (build time)

```mermaid
flowchart LR
    subgraph fontes [Instancia do All the Mons]
        J1[Cobblemon 1.7.3.jar]
        J2[allthemons.jar]
        J3[ccc myths & legends.jar]
        J4[mega_showdown / zamega]
        J5[legendarymonuments.jar]
        J6[rctmod.jar]
        K[kubejs/data + config]
    end
    fontes --> P[tools/dataset<br/>leitura, merge por precedencia,<br/>colisoes por ordem de carga]
    PA[PokeAPI<br/>sprites, artwork ids,<br/>mecanica dos golpes] --> P
    P --> A[tools/dataset/audit<br/>valores esperados<br/>recalculados do zero]
    P --> D[public/data/versao/<br/>species, trainers, items,<br/>balls, moves, abilities...]
    P --> M[public/assets/<br/>gritos, sons, texturas, sprites]
```

O snapshot da instancia esta versionado em `data-source/atm-1.3.0/` (cada jar ja aberto como diretorio), entao o pipeline roda em qualquer PC sem o modpack instalado. Uma instancia real do CurseForge tambem e aceita, sempre em modo somente leitura. A saida e escrita de forma atomica numa pasta com a versao do dataset (`atm1.3.0-cobblemon1.7.3-<data>-<hash>`), e `current.json` aponta para a versao ativa.

### Runtime (no navegador)

```mermaid
flowchart TB
    subgraph app [src/]
        S[screens/<br/>11 telas] --> C[components/]
        S --> N[navigation/<br/>pilha propria com<br/>restauracao exata]
        S --> ST[state/<br/>stores Zustand]
        ST --> R[storage/<br/>IndexedDB versionado,<br/>migracoes, snapshots]
        S --> DM[domain/<br/>tabela de tipos, stats,<br/>naturezas, level cap,<br/>ranking de bolas, busca]
        S --> DA[data/<br/>loaders com cache,<br/>retry e validacao Zod]
        S --> I[i18n/<br/>pt-BR / en por tela,<br/>termos por card]
        S --> AU[audio/<br/>engine de sfx e gritos]
        SY[sync/<br/>codec bitmap + deflate + CRC,<br/>QR multi-quadro, merge] --> R
        PW[pwa/<br/>service worker,<br/>aviso de atualizacao]
    end
    DA --> D[(public/data)]
    AU --> M[(public/assets)]
    S -. artwork grande .-> PA[(PokeAPI)]
```

### Estrutura de pastas

```
index.html                 shell do app
public/
  data/<datasetVersion>/   dataset gerado (commitado)
  assets/                  gritos, sons, texturas de item, sprites (gerados)
  icons/                   icones PWA gerados da Pokebola
src/
  assets/ styles/ i18n/ domain/ data/ storage/ sync/ audio/
  navigation/ state/ components/ screens/ pwa/ platform/
tools/
  dataset/                 pipeline de build (Node 24 + tsx) e ferramenta de auditoria
  gen/                     geradores de assets (paleta de tipos, icones, mascara)
tests/                     unit e componente (Vitest) + e2e e harness (Playwright)
data-source/atm-1.3.0/     snapshot somente leitura dos arquivos do modpack
design/                    prototipo HTML aprovado, paleta de tipos, referencias
docs/readme/               imagens deste README
.forge/                    IDEA, PRD, SPEC, checklists, handoffs, relatorios e prints
```

---

## Os dados

Tudo abaixo vem da instancia do All the Mons 1.3.0 (Minecraft 1.21.1, NeoForge, Cobblemon 1.7.3), lido em build time:

| Conjunto            | Quantidade      | Fonte principal                                                                        |
| ------------------- | --------------- | -------------------------------------------------------------------------------------- |
| Especies            | 1.027           | Cobblemon + addons (inclui as custom do pack, como Creepyon)                           |
| Entradas de spawn   | 3.197           | Cobblemon, CCC Myths & Legends, allthemons, kubejs                                     |
| Rotas de fossil     | 16              | Cobblemon + allthemons (Mewtwo via Pika Star ou Ancient DNA Sample)                    |
| Golpes com mecanica | 797             | Cobblemon (nomes, descricoes) + PokeAPI (tipo, poder, precisao, PP)                    |
| Habilidades         | 316             | Cobblemon                                                                              |
| Treinadores         | 1.589           | Radical Cobblemon Trainers + treinadores proprios do pack                              |
| Treinadores-chave   | 150 em 5 series | rctmod + kubejs (BDSP 43, Radical Red 39, Unbound 38, ATM Team 21, Content Creators 9) |
| Pokebolas           | 48              | Cobblemon (tooltips oficiais PT e EN)                                                  |
| Itens               | 949             | Cobblemon, allthemons, Mega Showdown                                                   |
| Gritos              | 1.102           | Cobblemon (`.ogg`)                                                                     |
| Texturas de item    | 1.347           | Cobblemon, allthemons, Mega Showdown (pixel art 16x16, escala nearest)                 |
| Sprites 96px        | 1.025           | PokeAPI (baixados no build para funcionar offline)                                     |
| Midia total         | ~20 MB          |                                                                                        |

Regras de mesclagem que o pipeline segue (e a auditoria confirma):

- **Precedencia por campo**: o Cobblemon base vence nos campos centrais; um addon so sobrescreve o que define de novo. `species_additions` de qualquer namespace sao aplicadas.
- **Colisoes de arquivo entre jars** seguem a ordem de carga transitiva declarada nos `neoforge.mods.toml`; `kubejs/` substitui qualquer jar.
- **Raridade principal** e o primeiro bucket presente na ordem fixa (comum, incomum, raro, ultra-raro); os demais sao listados.
- **Level cap** = nivel maximo do time do proximo treinador-chave disponivel, com `initialLevelCap` 15 como piso, `requiredDefeats` em AND entre grupos e OR dentro de cada grupo.
- **Como obter** nunca inventa: se nenhuma camada se aplica, o app diz "sem rota confirmada".

---

## Decisoes de projeto

- **Sem backend, em nenhuma fase.** Tudo que e do usuario vive no IndexedDB do aparelho, com armazenamento persistente solicitado ao navegador, migracoes de esquema que nunca apagam nada, escrita atomica e snapshot automatico antes de operacoes destrutivas. Perder dados numa atualizacao e considerado bug grave.
- **Navegacao com historico real.** "Voltar" devolve exatamente onde voce estava: mesma tela, mesmo Pokemon, mesma aba, mesmo scroll, em qualquer profundidade (Pokemon > item > Pokemon que dropa > item...). Vale para o botao do app, o gesto do Android e Alt+Seta no desktop. Isso exigiu uma pilha de navegacao propria em vez de um roteador de URL.
- **Dois idiomas em dois niveis.** A interface e em pt-BR ou en. Os **termos do jogo** (itens, golpes, habilidades, biomas, naturezas) tem um toggle PT/EN proprio no cabecalho de cada card, porque o pessoal joga em ingles e precisa bater os nomes com o jogo sem trocar a interface inteira. A escolha de cada card e lembrada.
- **Sincronizar sem servidor.** O progresso de 1.027 capturados cabe num bitmap de 129 bytes; com time, historico, treinadores e preferencias, comprimido com deflate e protegido por CRC, vira um QR (ou varios) que o outro aparelho le pela camera. Nenhum byte sai do aparelho para lugar nenhum.
- **Sons ligados por padrao**, com os arquivos reais do jogo: grito na ficha, Pokebola na captura, abrir e fechar a Pokedex, level up ao subir o cap. Um toggle desliga os automaticos; o botao de grito toca sempre, porque e uma acao explicita.
- **Animacao com limite.** Tudo em `transform` e `opacity`, nada que bloqueie a thread principal, e um teste e2e mede o orcamento de long tasks ao rolar a Pokedex. "Reduzir animacoes" (do sistema ou do app) deixa tudo estatico, inclusive captura, marca d'agua e cards de Lendario.
- **Honestidade nos dados.** Preferimos "sem rota confirmada" a um chute. A recomendacao de treino da calculadora de stats diz na tela que e uma sugestao automatica criada com ajuda de IA.
- **Regras de codigo aplicadas por lint**: nenhum travessao (U+2014) em lugar nenhum, nenhum texto literal em JSX fora de `src/i18n`, nenhum `waitForTimeout` nos testes.

---

## Como rodar

Requisitos: **Node 24** ou mais novo (o `.npmrc` usa `engine-strict=true`) e npm 11.

```bash
npm i                      # instala as dependencias (versoes fixas)
npm run gen:assets         # gera types.generated.css, icones PWA e a mascara da marca d'agua
npm run dataset            # gera public/data/<datasetVersion>/ a partir de data-source/atm-1.3.0/
npm run dev                # servidor de desenvolvimento (http://localhost:5173)
```

O `public/data/` ja vem commitado, entao `npm run dataset` so e necessario se voce mudar o pipeline ou a fonte.

Fonte do pipeline (`npm run dataset`), por precedencia:

1. `--instance <dir>` (flag);
2. variavel de ambiente `ATM_INSTANCE_DIR`;
3. padrao `data-source/atm-1.3.0/` (snapshot com cada jar ja aberto como diretorio).

Outras flags: `--skip-media`, `--offline`, `--report`, `--keep-old`, `--only <etapa>`, `--out <dir>`, `--publish-dir <dir>` (ver `tools/dataset/README.md`). `--publish-dir` e o que os testes usam para gerar um dataset real sem tocar `public/`.

| Comando                  | O que faz                                                |
| ------------------------ | -------------------------------------------------------- |
| `npm run build`          | `tsc -b` + build do Vite em `dist/` (com service worker) |
| `npm run preview`        | serve `dist/` na porta 4173                              |
| `npm run typecheck`      | checagem de tipos do projeto inteiro                     |
| `npm run lint`           | ESLint                                                   |
| `npm test`               | Vitest (unit e componente)                               |
| `npm test -- --coverage` | Vitest com relatorio de cobertura                        |
| `npm run test:e2e`       | Playwright contra build + preview (headless)             |
| `npm run test:harness`   | Playwright contra o dev server (paginas de harness)      |

### PWA e uso offline

O app e instalavel (manifesto e service worker gerados no build). Depois do primeiro load com o service worker ativo, Inicio, Pokedex e qualquer ficha ja aberta continuam funcionando sem rede; artwork da PokeAPI que nunca carregou cai no placeholder da Pokebola, nunca em imagem quebrada. Uma versao nova mostra "Nova versao disponivel" com o botao "Atualizar".

Primeiro carregamento medido em producao: `DOMContentLoaded` em 104 ms, dataset pronto em 304 ms, 18 requisicoes e ~505 KB a frio; com o service worker quente, 0 bytes de rede.

### Backup dos dados

Configuracoes > Backup > "Exportar backup" salva `pontindex-backup-<data>.json`; "Importar" restaura (mesclar ou substituir). Para levar os dados a outro aparelho, use Configuracoes > Sincronizar (QR, texto ou arquivo `.pdx`).

---

## Testes e qualidade

| Suite              | Onde                                 | O que cobre                                                                                                                                                                                                                    |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unit               | `tests/unit/` (Vitest, jsdom e node) | dominio (tabela de tipos, stats, naturezas, level cap, ranking de bolas, busca), storage (migracoes, reparo, fallback em memoria), sync (codec, quadros, merge), pipeline (leitura, merge, colisoes, join), build (CSS gerado) |
| Componente         | `tests/unit/ui-*` (Testing Library)  | chips, modais, toasts, cards, tabelas e as 8 telas principais renderizadas com stores reais                                                                                                                                    |
| Propriedade        | `fast-check`                         | codec de sync com entradas geradas (round-trip de codificar e decodificar)                                                                                                                                                     |
| E2E                | `tests/e2e/` (Playwright, 18 specs)  | cada tela, navegacao com restauracao exata, historico com 20 itens, virtualizacao e orcamento de long tasks, offline com service worker, responsivo em 360 e 390 px com baselines visuais dos 7 temas                          |
| Auditoria de dados | `tools/dataset/audit/`               | recalcula valores esperados direto dos arquivos crus e compara com o dataset publicado                                                                                                                                         |

Metas de cobertura aplicadas no `vitest.config.ts`: `src/domain` 95% de linhas e branches, `src/storage` e `src/sync` 90%, `tools/dataset/src` 80%, `src/components` 70%, `src/screens` 70% de linhas, global 80%. Ultima medicao: telas em 90,7% e global em 92,4% de linhas.

Os testes e2e rodam por padrao contra `npm run build` + `npm run preview`, sempre headless, sem `slowMo` e sem esperas fixas. Duas variaveis controlam o servidor:

- `PW_PORT` (padrao `4173`): porta do servidor e do `baseURL`, util para rodar suites em paralelo.
- `PW_DEV=1`: usa o dev server do Vite em vez de build + preview.

```bash
npm run test:e2e                                          # build + preview, porta padrao
PW_DEV=1 PW_PORT=4174 npx playwright test tests/e2e/home.spec.ts
```

---

## Publicacao

Push no GitHub e a Vercel faz o build estatico. O `vercel.json` define cache imutavel para `/data/*` e `/assets/*` (as pastas tem a versao no nome), `no-cache` para `/sw.js` e o fallback SPA. Site: **[pontindex.pontin.dev](https://pontindex.pontin.dev)**.

---

## Planejamento futuro

O que ja esta decidido e documentado em `.forge/`:

### Fechar a Fase 1 (site)

- Validacao manual final no PC e no celular real: instalar como app, modo aviao, 360 e 390 px, conferir no jogo dois pontos ainda em aberto nos dados (Meltan sem evolucao para Melmetal; cap depois de um Cedric na serie BDSP).
- Decidir se o atraso de 1,4 s da tampa no boot (escolha estetica) diminui.
- Mover a feature para `.forge/complete/` e fazer o merge em `main`.

### Fase 2: apps Windows e Android (`pontindex-app`)

Mesmo codigo, mesma pasta `dist/`, sem backend:

- **Windows (.exe)** via Electron, com storage em arquivo proprio na pasta de dados do usuario (sobrevive a reinstalar) e escrita atomica.
- **Android (.apk)** via Capacitor 8, distribuido sem Play Store, com o botao fisico de voltar ligado a navegacao do app e storage no armazenamento interno.
- **Atualizador automatico**: um push gera o site e os instaladores via GitHub Actions como release.
- **Botao "Baixar app"** aparece so no site, e so quando os instaladores existirem.
- Teste obrigatorio: instalar a versao N, criar dados, instalar N+1 por cima, dados intactos.

O site ja foi construido pensando nisso: a camada de storage fica atras de uma unica interface (`StorageAdapter`), existe a pasta `src/platform/` e a navegacao ja expoe `goBack` para o botao fisico.

### Manutencao dos dados

Quando o All the Mons ou o Cobblemon atualizarem, basta apontar o pipeline para a instancia nova (`--instance`), rodar `npm run dataset`, rodar a auditoria e commitar a nova versao do dataset. O app mostra a versao dos dados no rodape.

### Ideias anotadas, sem data

- Recomendacoes de treino a partir de sets competitivos reais em vez da heuristica atual.
- Mostrar os golpes `legacy` e `special` que o pipeline hoje nao publica.
- Sprites proprios para as especies custom do pack que nao existem na PokeAPI.

---

## Creditos e licenca

**Pokemon**, nomes, artes, gritos e descricoes pertencem a Nintendo, Game Freak e The Pokemon Company. Os dados de especies, spawns, itens, sons e texturas vem do **Cobblemon** (equipe Cobblemon, codigo sob MPL-2.0) e dos addons usados pelo **All the Mons** (equipe All the Mods e autores de cada mod: Complete Cobblemon Collection, Legendary Monuments, Mega Showdown, ZA Mega, Radical Cobblemon Trainers e outros). Sprites e artwork vem da **PokeAPI**. Os icones dos 18 tipos sao baseados nos glifos do repositorio `duiker101/pokemon-type-svg-icons`. Icones de interface: Lucide.

O Pontindex e um projeto de fa, pessoal e sem fins lucrativos, feito para uso entre amigos. Nao e afiliado a nenhum dos detentores acima. Se voce e detentor de algum desses direitos e quer que algo seja removido, abra uma issue.

Feito por **Pontin** com o **Claude Code** (Anthropic).
