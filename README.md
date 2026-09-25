# Pontindex

Pokedex pessoal (PWA estatica) para o modpack **All the Mons 1.3.0** (Cobblemon 1.7.3). React 19 + TypeScript + Vite 6, dados gerados em build-time a partir do snapshot versionado em `data-source/atm-1.3.0/` e publicada na Vercel. Sem backend: os dados do usuario ficam no IndexedDB do navegador.

## Requisitos

- Node **24** ou mais novo (o `.npmrc` usa `engine-strict=true`).
- npm 11.

## Como rodar

```bash
npm i                      # instala as dependencias (versoes fixas)
npm run gen:assets         # gera types.generated.css, icones PWA e a mascara da marca d'agua
npm run dataset            # gera public/data/<datasetVersion>/ a partir de data-source/atm-1.3.0/
npm run dev                # servidor de desenvolvimento (http://localhost:5173)
```

Fonte de dados do pipeline (`npm run dataset`), por precedencia:

1. `--instance <dir>` (flag);
2. variavel de ambiente `ATM_INSTANCE_DIR`;
3. padrao `data-source/atm-1.3.0/` (snapshot com cada jar ja aberto como diretorio; funciona em qualquer PC, sem o modpack).

Uma instancia real do CurseForge (jars zipados em `mods/`) tambem e aceita, sempre somente leitura. Outras flags: `--skip-media`, `--offline`, `--report`, `--keep-old`, `--only <etapa>`, `--out <dir>`, `--publish-dir <dir>` (ver `tools/dataset/README.md`).

`--publish-dir <dir>` publica em `<dir>/data/` e `<dir>/assets/` em vez de `public/`; e o que os testes (unit e e2e) usam quando precisam gerar um dataset de verdade sem tocar `public/` (ex. `tools/dataset/out/_publish_test/`). O app em si (`npm run dev`/`build`) sempre le de `public/data/`.

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | `tsc -b` + build do Vite em `dist/` (com service worker) |
| `npm run preview` | serve `dist/` na porta 4173 |
| `npm run typecheck` | checagem de tipos do projeto inteiro |
| `npm run lint` | ESLint (inclui a regra que proibe o caractere travessao U+2014 e texto literal em JSX fora de `src/i18n`) |
| `npm test` | Vitest (unit/componente) |
| `npm test -- --coverage` | Vitest com relatorio de cobertura (metas por pasta em `vitest.config.ts`) |
| `npm run test:e2e` | Playwright (app completo, headless, sem `slowMo`) |
| `npm run test:harness` | Playwright contra o dev server (paginas de harness) |

### Testes e2e (Playwright)

`npm run test:e2e` roda por padrao contra `npm run build` + `npm run preview` (porta 4173), sempre `headless: true`, sem `slowMo` e sem `page.waitForTimeout` (sincroniza pelo auto-waiting dos locators e `expect.poll`/`toPass`). Duas variaveis de ambiente controlam o servidor usado pelos testes (`playwright.config.ts`):

- `PW_PORT` (padrao `4173`): porta do servidor e do `baseURL`. Util para rodar suites de telas diferentes em paralelo sem conflito (ex. `4174`, `4175`).
- `PW_DEV=1`: sobe o dev server do Vite em vez de build + preview (mais rapido para iterar; nao precisa de `tsc -b`).

```bash
# build + preview na porta padrao
npm run test:e2e

# contra o dev server, numa porta especifica, so um arquivo
PW_DEV=1 PW_PORT=4174 npx playwright test tests/e2e/home.spec.ts
```

Os testes e2e usam o dataset publicado em `public/data/`; rode `npm run dataset` antes se a pasta nao existir ainda.

### Testes unitarios e cobertura

`npm test` roda o Vitest (jsdom para UI; `node` para os testes de `tools/dataset` e `tests/unit/build`, com `fake-indexeddb`, `matchMedia` e `Audio` mockados por `tests/setup.ts` ou por teste). `npm test -- --coverage` aplica as metas de `vitest.config.ts` (`coverage.thresholds`): `src/domain` 95% linhas/branches, `src/storage` e `src/sync` 90%, `tools/dataset/src` 80%, `src/components` 70%, global 80% de branches (linhas globais e de `src/screens/**` ajustadas ao alcancado pela T1a; telas inteiras sao majoritariamente validadas pela suite e2e em paralelo, nao por unit/component; ver `.forge/in-progress/pontindex/HANDOFF_tests.md`, secao T1a, para a justificativa completa).

## PWA e uso offline

O app e instalavel (manifesto + service worker gerados no build, `npm run build`). Depois do 1o load com o service worker ativo, Home, Pokedex e qualquer ficha ja aberta continuam funcionando sem rede; artwork da PokeAPI que nunca carregou cai no placeholder da pokebola (nunca imagem quebrada ou tela branca). Uma nova versao publicada mostra "Nova versão disponível" com "Atualizar" na proxima vez que o app for aberto com uma aba antiga ja em uso.

## Estrutura

```
package.json, vite.config.ts, tsconfig*.json, vercel.json
index.html                 shell do app
public/
  data/<datasetVersion>/   dataset gerado (commitado)
  assets/                  gritos, sons, texturas de item, sprites (gerados)
  icons/                   icones PWA gerados da pokebola
src/
  assets/ styles/ i18n/ domain/ data/ storage/ sync/ audio/ navigation/ state/ components/ screens/ pwa/
tools/
  dataset/                 pipeline de build (Node 24 + tsx), cache em tools/dataset/.cache/ (ignorado)
  gen/                     geradores de assets (paleta de tipos, icones)
tests/                     unit (Vitest) + e2e/harness (Playwright)
data-source/atm-1.3.0/     snapshot somente leitura dos arquivos do modpack
design/                    prototipo e assets de referencia (nunca referenciados pelo app)
```

## Publicar

Push no GitHub -> a Vercel faz o build estatico (Vite detectado automaticamente; `vercel.json` na raiz define cache imutavel para `/data/*` e `/assets/*`, `no-cache` para `/sw.js` e o fallback SPA).

## Backup dos dados do usuario

Configuracoes > Backup > "Exportar backup" salva `pontindex-backup-<data>.json`; "Importar" restaura (mesclar ou substituir). Para levar os dados a outro dispositivo, use Configuracoes > Sincronizar (QR, texto ou arquivo `.pdx`).

## Licenca dos assets

Nomes, textos, sprites, gritos e texturas pertencem aos seus donos (Nintendo/Game Freak/The Pokemon Company, equipe Cobblemon e autores dos addons). Uso privado e sem fins lucrativos; nada disso e redistribuido fora deste projeto pessoal.
