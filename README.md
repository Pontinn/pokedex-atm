<p align="center">
  <img src="docs/readme/icon.png" width="80" alt="Pontindex" />
</p>

<h1 align="center">Pontindex</h1>

<p align="center">
  Pokedex para o modpack <b>All the Mons 1.3.0</b> (Cobblemon 1.7.3).<br />
  Site estatico (PWA), sem backend, com os dados do modpack empacotados no build.<br />
  <a href="https://pontindex.pontin.dev"><b>pontindex.pontin.dev</b></a>
</p>

<p align="center">
  <img src="docs/readme/desktop-home.webp" width="760" alt="Tela inicial" />
</p>

## A ideia

Acho que todo mundo que comeca a programar faz uma Pokedex em algum momento, e comigo nao foi diferente. Em 2024, ainda no inicio dos estudos, fiz uma [Pokedex bem simples](https://github.com/Pontinn/projetos-estudo/tree/main/pokedex) em HTML, CSS e JavaScript puro, so consumindo a PokeAPI, para testar o que eu ja conseguia fazer. Para quem estava comecando, ate que ficou boa.

Alguns anos de experiencia depois, resolvi fazer a Pokedex definitiva: uma que nao se limita a PokeAPI, mas entende um modpack de Minecraft com Pokemon, o Cobblemon e todos os addons que vem junto, com as regras que valem de verdade dentro do jogo.

Eu e meus amigos jogamos All the Mons, um modpack de Minecraft baseado no Cobblemon. No meio do jogo sempre surge a duvida: em que nivel evolui, qual Pokebola usar, quem e o proximo treinador que libera o level cap, o que aquele item faz. Sites de Pokemon nao servem porque o Cobblemon e os addons do pack mudam evolucoes, spawns e itens. E no celular nao da para abrir a pasta dos mods. E mesmo os sites feitos para o Cobblemon separam demais as informacoes: raridade de spawn num lugar, treinadores em outro, itens em outro, e voce acaba com cinco abas abertas para responder uma pergunta. A ideia e centralizar tudo num lugar so, com um design que traga a essencia de Pokemon, com animacoes e sons, e nao algo generico.

O Pontindex resolve isso com quatro regras:

- **Estetica de Pokemon**: cores de Pokedex, cards com gradiente por tipo, sons do jogo, animacao de captura. Um layout para desktop e outro para celular.
- **Plug and play**: sem conta, sem login, sem servidor. Os dados de cada pessoa ficam so no aparelho dela.
- **Dados 100% do modpack**: os jars e configs da instancia sao lidos uma vez, no build, e viram JSON, texturas, sons e traducoes PT/EN dentro do app. Em runtime so o artwork grande vem da PokeAPI.
- **Custo zero**: site estatico, nenhuma API paga.

## O que o app faz

- **Busca** por nome (PT ou EN, sem acento, com autocomplete) ou numero da Pokedex, Pokemon aleatorio, historico dos ultimos 20.
- **Pokedex** com os 1.027 Pokemon do pack, filtros por tipo, geracao, evolucao e capturados.
- **Ficha completa**: stats e total, fraquezas e resistencias, evolucoes com o metodo exato do Cobblemon, habilidades, golpes (nivel, TM, ovo, tutor), formas (Mega, Gmax), onde encontrar (bioma, luz, hora, nivel, raridade), como obter (evolucao, fossil, spawn do pack, addon ou "sem rota confirmada"), drops, melhor Pokebola, calculadora de stats e de efetividade, grito e shiny.
- **Capturados** com animacao de captura, contador e lista. **Time** de 6.
- **Treinadores**: linha do tempo dos treinadores-chave por serie com o level cap que cada vitoria libera, time de cada um, item de spawn e biomas. Voce marca quem derrotou e o app calcula seu cap.
- **Pokebolas** com o efeito oficial e **Itens e comidas** com descricao, textura real, como obter e onde e usado. Todo item citado no app e clicavel.
- **Comparar** dois Pokemon lado a lado.
- **Sincronizar** o progresso entre aparelhos por QR code, texto ou arquivo, sem servidor.
- **Configuracoes**: 7 temas, idioma da interface (pt-BR / en), toggle PT/EN dos termos do jogo em cada card, som, reduzir animacoes, backup (exportar / importar).
- **PWA**: instalavel e funciona offline depois do primeiro acesso.

<table>
  <tr>
    <td><img src="docs/readme/desktop-detail-charizard-full.webp" alt="Ficha do Charizard" /></td>
    <td><img src="docs/readme/desktop-trainers-expanded-full.webp" alt="Treinadores e level cap" /></td>
    <td><img src="docs/readme/mobile-home.webp" alt="Mobile" /></td>
  </tr>
</table>

## Os dados

Tudo vem da instancia do All the Mons 1.3.0: Cobblemon, addons (Complete Cobblemon Collection, Mega Showdown, Legendary Monuments, Radical Cobblemon Trainers e outros) e os ajustes do proprio pack em `kubejs/`. O pipeline em `tools/dataset/` le esses arquivos, mescla por precedencia, baixa sprites e mecanica dos golpes da PokeAPI e gera o dataset versionado em `public/data/`. Uma ferramenta de auditoria separada recalcula os valores direto dos arquivos crus e compara com o dataset publicado.

No dataset atual: 1.027 especies, 3.197 entradas de spawn, 797 golpes, 316 habilidades, 1.589 treinadores, 48 Pokebolas, 949 itens, 1.102 gritos e 1.347 texturas.

## Como foi feito

Desenvolvido com o Claude Code como par de programacao. Primeiro a pesquisa das fontes de dados e das regras do jogo, depois um prototipo em HTML aprovado como referencia visual, um PRD com os requisitos e so entao o codigo. Os dados passaram por uma auditoria independente antes de publicar, e o app tem testes de unidade, componente e e2e.

## Tecnologias

|              |                                                                                  |
| ------------ | -------------------------------------------------------------------------------- |
| App          | React 19, TypeScript, Vite 6, Zustand, Zod                                       |
| Dados locais | IndexedDB (versionado, com migracoes e backup)                                   |
| Sync         | fflate + qrcode + zxing (tudo no navegador)                                      |
| UI           | Lucide (icones), SVG proprios dos 18 tipos, fontes Fredoka / Nunito / Silkscreen |
| Pipeline     | Node 24 + tsx, sharp                                                             |
| Testes       | Vitest, Testing Library, Playwright                                              |

## Estrutura

```
public/data/<versao>/   dataset gerado (commitado)
public/assets/          gritos, sons, texturas, sprites
src/                    app (screens, components, domain, data, storage, sync, i18n, audio, navigation, pwa)
tools/dataset/          pipeline que le o modpack e gera o dataset, mais a ferramenta de auditoria
tools/gen/              geradores de paleta de tipos e icones
tests/                  unit (Vitest) e e2e (Playwright)
data-source/atm-1.3.0/  snapshot somente leitura dos arquivos do modpack
design/                 prototipo aprovado e assets de referencia
```

## Como rodar

Requer Node 24 ou mais novo.

```bash
npm i
npm run gen:assets   # paleta de tipos, icones PWA
npm run dataset      # opcional: regenera public/data/ a partir de data-source/
npm run dev          # http://localhost:5173
```

| Comando             | O que faz                              |
| ------------------- | -------------------------------------- |
| `npm run build`     | build de producao em `dist/`           |
| `npm run typecheck` | checagem de tipos                      |
| `npm run lint`      | ESLint                                 |
| `npm test`          | Vitest                                 |
| `npm run test:e2e`  | Playwright (build + preview, headless) |

O pipeline le por padrao o snapshot em `data-source/atm-1.3.0/`. Para usar uma instancia real do CurseForge: `npm run dataset -- --instance <pasta>` (somente leitura). Mais flags em `tools/dataset/README.md`.

## Planejamento futuro

- **Fechar o site**: validacao manual no PC e no celular e conferir no jogo dois pontos dos dados ainda em aberto.
- **Apps Windows e Android**: mesmo codigo empacotado com Electron (.exe) e Capacitor (.apk), storage em arquivo proprio que sobrevive a atualizacoes, instaladores gerados por GitHub Actions e botao "Baixar app" no site.
- **Atualizacao dos dados**: quando o All the Mons ou o Cobblemon atualizarem, apontar o pipeline para a instancia nova, rodar a auditoria e commitar o dataset novo.

## Creditos

Pokemon pertence a Nintendo, Game Freak e The Pokemon Company. Dados, sons e texturas vem do Cobblemon e dos addons do All the Mons; sprites e artwork da PokeAPI; icones de tipo baseados em `duiker101/pokemon-type-svg-icons`. Projeto de fa, pessoal e sem fins lucrativos.
