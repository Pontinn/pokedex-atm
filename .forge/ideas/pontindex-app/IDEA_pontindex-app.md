# IDEA: pontindex-app (apps Windows e Android do Pontindex)

Criada em 2026-09-26 a pedido do Pontin: "criar uma ideia separada so para o app e deixar essa so pro site pra nao ter confusao". Esta ideia AINDA NAO foi discutida na Stage 1: e uma semente, com o que ja estava decidido no pontindex (site). Antes do PRD, rodar a Stage 1 com o Pontin (`/forge --resume-idea pontindex-app`).

## Regra principal

- So comeca DEPOIS que o site (`pontindex`, em `.forge/complete/pontindex/`) estiver finalizado, testado pelo Pontin e aprovado (FEITO em 2026-09-28: site no ar em https://pontindex.pontin.dev). Pontin, 2026-09-26: "agora e so site; app vai ser so depois".
- A feature `pontindex` (site) nao executa nada de app: os antigos sprints P1-P3 e RF-105 a RF-109 foram movidos para ca.

## O que ja estava decidido (vem da IDEA/PRD/SPEC do pontindex; conferir com o Pontin na Stage 1)

- [2026-09-23] Plataformas: PC (Windows) via Electron + Android via Capacitor, a partir do MESMO codigo/`dist/` do site. iOS fora do escopo (o Pontin nao tem Mac nem precisa).
- [2026-09-23] Electron sozinho nao roda em celular; a combinacao web + Electron + Capacitor foi explicada e aceita.
- [2026-09-23] Ambiente Android no PC ANTIGO (mateu): SDK 36, build-tools 36.0.0, platform-tools, ANDROID_HOME, sem Android Studio. No PC ATUAL (milap) NAO ha JDK nem Android SDK (Pontin 2026-09-24: nao instalar enquanto o foco for o site). Vai precisar instalar quando esta ideia comecar (avisar antes).
- [2026-09-23] Persistencia local e requisito duro: os dados do usuario nunca podem se perder em atualizacao do app, so se ele quiser.
- Sem backend (nem no site nem nos apps).
- Atualizador automatico: um push atualiza o site e gera novos instaladores via GitHub Actions.
- Botao "Baixar app" SO no site (nunca dentro dos apps instalados), com 2 opcoes: Android (.apk) e Windows (.exe); so aparece quando os apps estiverem prontos.
- Botao fisico "voltar" do Android deve voltar na navegacao do app (RF-02 do site).
- O site ja foi construido pensando nisso: `StorageAdapter` unico (IndexedDB no site; arquivo proprio nos apps), pasta `src/platform/` (web.ts), `dist/` unico, service worker.

## Requisitos herdados do PRD do site (copiados literalmente, secao 6.20)

- **RF-105** `[MUST - Fase 2]` O mesmo codigo/`dist/` da Fase 1 deve ser empacotado como app desktop Windows via Electron, gerando um instalador `.exe`.
- **RF-106** `[MUST - Fase 2]` O mesmo codigo/`dist/` da Fase 1 deve ser empacotado como app Android via Capacitor 8, gerando um `.apk` distribuivel sem Play Store.
- **RF-107** `[MUST - Fase 2]` Os apps Windows e Android devem usar a mesma camada de storage duravel definida em RF-95, adaptada ao ambiente nativo (arquivo proprio fora de cache), preservando os dados entre atualizacoes do app (mesmo requisito de RF-96, testado tambem nos apps).
- **RF-108** `[MUST - Fase 2]` Deve existir um atualizador automatico: um push no repositorio deve atualizar o site e, via pipeline de CI (GitHub Actions), gerar novos instaladores Windows/Android.
- **RF-109** `[MUST - Fase 2]` O botao "Baixar app" deve existir SOMENTE no site (nunca dentro dos proprios apps instalados), oferecendo duas opcoes de download: Android (.apk) e Desktop Windows (.exe); esse botao so deve aparecer quando os apps da Fase 2 estiverem prontos para distribuicao.

## Plano tecnico herdado da SPEC do site (sprints P1-P3, copiados literalmente; revisar na SPEC propria desta ideia)

### Sprint P1: Electron (Windows .exe) `[Fase 2]`
- **Descricao**: empacota o mesmo `dist/` como app desktop com storage em arquivo.
- **Deliverable**: `pontindex-setup-<versao>.exe` (NSIS) que instala, abre o app e preserva os dados entre reinstalacoes.
- **Risco**: medio.
- **Prerequisito**: Fase 1 completa (F12, T1).
- **Files** (criar): `phase2/electron/main.ts`, `phase2/electron/preload.ts`, `phase2/electron/electron-builder.yml`, `src/storage/file-storage-adapter.ts` (usa IPC exposto pelo preload), `src/platform/electron.ts`.
- **Feature P1.1: Empacotamento e FileStorageAdapter** `[category: build]` - Traces RF-105, RF-107, RF-95, RF-99. Steps: `main.ts` cria `BrowserWindow` carregando `dist/index.html` (protocolo `app://` custom para o SW funcionar ou desabilita o SW no Electron); `preload.ts` expõe `storage.read/write/delete` via `contextBridge` (sem `nodeIntegration`); `FileStorageAdapter` grava `<userData>/pontindex/<doc>.json` com `write tmp -> fsync -> rename` (RF-99) e `meta.json`; migracoes e backups identicos (`StorageAdapter` unica); `electron-builder` NSIS `perMachine: false`, `deleteAppDataOnUninstall: false` (RF-107). `platform/electron.ts`: `isNative = true` (esconde "Baixar app", RF-109). Edge cases: pasta `userData` sem permissao -> dialogo nativo; arquivo `.tmp` orfao de crash -> ignorado/removido no boot; app antigo lendo esquema novo -> somente leitura. Done when: instalar v1, criar dados, instalar v2 por cima, dados intactos (teste manual obrigatorio do PRD). Commit: `feat(electron): windows packaging with file-based storage adapter`. Rollback: nao publicar o instalador.

### Sprint P2: Capacitor 8 (Android .apk) `[Fase 2]`
- **Descricao**: mesmo `dist/` como app Android com storage no armazenamento interno.
- **Deliverable**: `pontindex-<versao>.apk` assinado, instalavel fora da Play Store.
- **Risco**: medio (ambiente: SDK 36 e ANDROID_HOME ja instalados, sem Android Studio).
- **Prerequisito**: P1 (adapter de arquivo) ou Fase 1.
- **Files** (criar): `phase2/capacitor/capacitor.config.ts`, `phase2/capacitor/android/` (gerado por `npx cap add android`), `src/storage/capacitor-storage-adapter.ts` (`@capacitor/filesystem`, `Directory.Data`), `src/platform/capacitor.ts`, `src/navigation/android-back.ts` (`App.addListener("backButton")` -> `goBack`).
- **Feature P2.1: Projeto Android e adapter** `[category: build]` - Traces RF-106, RF-107, RF-02 (botao fisico). Steps: `capacitor.config.ts` `{ appId: "com.pontin.pontindex", webDir: "dist", android: { allowMixedContent: false } }`; `CapacitorStorageAdapter` com `Filesystem.writeFile` em `.tmp` + `rename` (RF-99); `android-back.ts` liga o botao fisico a `goBack` (RF-02); build `./gradlew assembleRelease` com keystore (nomes de env: `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_ALIAS`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_PASSWORD`; valores nunca no repo). Edge cases: permissao de camera declarada no `AndroidManifest` para o scanner; `Directory.Data` sobrevive a atualizacao por APK (RF-107). Done when: instalar APK v1, dados, instalar v2, dados intactos. Commit: `feat(android): capacitor project with data-directory storage adapter and hardware back`. Rollback: nao distribuir o APK.

### Sprint P3: Atualizador automatico e botao "Baixar app" `[Fase 2]`
- **Descricao**: CI que, a cada push em `main`, publica o site (Vercel) e gera instaladores como release do GitHub; botao "Baixar app" so no site.
- **Deliverable**: `.github/workflows/release.yml` gerando `.exe` e `.apk` como assets de release; site exibe "Baixar app" com 2 opcoes.
- **Risco**: baixo.
- **Prerequisito**: P1, P2.
- **Files** (criar): `.github/workflows/release.yml`, `src/components/DownloadAppButton.tsx`, `src/screens/settings/DownloadCard.tsx`, `public/downloads.json` (gerado pelo CI: `{ windows: url, android: url, version }`).
- **Feature P3.1: Pipeline e botao** `[category: integracao]` - Traces RF-108, RF-109. Steps: workflow com jobs `web` (build + `vercel deploy --prod` via `VERCEL_TOKEN`, nome de secret), `windows` (electron-builder em runner windows), `android` (gradle em runner ubuntu com secrets do keystore), `release` (cria release `v<versao>` e publica `downloads.json`); `DownloadAppButton` aparece na sidebar/topbar e em Configuracoes somente quando `platform.isNative === false` E `downloads.json` responde com URLs (RF-109: escondido ate os apps existirem); dropdown com "Android (.apk)" e "Windows (.exe)" no padrao `.search-dd` (UISPEC 8.2); apps nativos: `UpdatePrompt` aponta para a release (Electron via `electron-updater` [ASSUMPTION], Android via link do APK). Edge cases: `downloads.json` 404 -> botao oculto; secret ausente -> job falha sem publicar. Done when: push -> site atualizado e release com 2 assets. Commit: `feat(release): github actions building site, windows and android artifacts with download button`. Rollback: desabilitar o workflow; botao some sem `downloads.json`.


## Perguntas para a Stage 1 (a fazer com o Pontin)

- Ainda quer Windows E Android, ou so um deles primeiro?
- Distribuicao: .apk direto (sem Play Store) e .exe direto continuam valendo?
- O app deve funcionar 100% offline desde a instalacao (dataset embutido) ou pode baixar dados na primeira abertura?
- Assinatura do APK: quem guarda a keystore? (nunca no repo)
- Algo que o app deve ter e o site nao (ou o contrario)?
