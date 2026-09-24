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

Uma instancia real do CurseForge (jars zipados em `mods/`) tambem e aceita, sempre somente leitura. Outras flags: `--skip-media`, `--offline`, `--report`, `--keep-old`, `--only <etapa>`, `--out <dir>` (ver `tools/dataset/README.md`).

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run build` | `tsc -b` + build do Vite em `dist/` (com service worker) |
| `npm run preview` | serve `dist/` na porta 4173 |
| `npm run typecheck` | checagem de tipos do projeto inteiro |
| `npm run lint` | ESLint (inclui a regra que proibe o caractere travessao U+2014 e texto literal em JSX fora de `src/i18n`) |
| `npm test` | Vitest (unit/componente) |
| `npm run test:e2e` | Playwright (app completo, headless) |
| `npm run test:harness` | Playwright contra o dev server (paginas de harness) |

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
