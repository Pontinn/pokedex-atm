# Retomada do Pontindex (para continuar em outro PC)

Atualizado em 2026-09-23. Neste projeto TODOS os artefatos do `.forge` sao versionados (inclusive `STATE_pontindex.md`, checklists, relatorios e `ui-refs/`); so a memoria do Claude fica no PC original (fora do repo), por isso as regras dela estao copiadas abaixo. Em um PC novo, leia ESTE arquivo primeiro. A secao 13 da IDEA ficou desatualizada (descreve o fim da Stage 1) e nao foi editada para nao disparar o drift check.

## Onde estamos

- Branch: `feature/pontindex` (remoto `origin` = github.com/Pontinn/pokedex-atm).
- Stage 1 (IDEA), Stage 2 (PRD) e Stage 3b (UI recon) concluidas. Stage 3 (SPEC) escrita e em revisao final (forge-review) no momento deste commit.
- Artefatos: `IDEA`, `CONTEXT`, `PRD` (rev 5, 125 RFs, 12 RNFs), `UISPEC` (50 prints), `SPEC` (23 sprints, 60 features, 100% de cobertura).
- Falta: fechar a revisao da SPEC (aplicar achados, se houver), commitar, gerar o `CHECKLIST_pontindex.md` (forge-checklist) e PARAR antes da implementacao para o Pontin aprovar.
- Proximo comando no PC novo: `/forge --imp pontindex` so depois de a SPEC estar aprovada e o checklist existir. Se a revisao da SPEC nao tiver terminado, rode `/forge --review-spec pontindex` antes.

## PENDENTE AGORA (sessao caiu por limite em 2026-09-23)

A revisao da SPEC deu NEEDS-CHANGES. Os itens 1 a 10 abaixo JA FORAM APLICADOS na SPEC (Self-check PASS). Falta so a nova revisao (`/forge --review-spec pontindex`), o checklist e parar. No PC novo: abrir o SPEC, conferir item a item o que falta, aplicar (via forge-spec novo, contexto zerado) e rodar `/forge --review-spec pontindex`. PRD (rev 6) e CONTEXT ja estao corrigidos.
1. [BLOCKER] Merge de dados: `species/` de addon = override completo (base vence nos campos nucleares); `species_additions/*.json` = merge aditivo estilo datapack (campo presente na addition sobrescreve/estende: forms uniao por name, drops da addition, evolutions/implemented da addition, labels/features uniao). Cobre allthemons (10, ex. Mareep ganha drop `silentgear:sinew` 25%), ccc (225) e kubejs `zzz_ccc_meltan.json`. Registrar no merge-report.json; Done-when de B2.2 checa Mareep/sinew no drop e no indice invertido (RF-68).
2. [BLOCKER] Identificadores em ingles: fundos `bg-legendary|bg-mythical|bg-default`; ThemeId `classic|black|green|blue|purple|white|orange` (preferences.theme, data-theme, THEME_IDS) + tabela de correspondencia com os nomes do prototipo (nomes dos prints ficam).
3. Pokebolas pela pasta `textures/item/poke_balls/` (48), completar tabela (slate/azure/verdant/roseate/citrine_ball), trocar "51" por `balls.json.length`.
4. Tempo: docs em ms, codec em u32 segundos (encode floor(ms/1000), decode *1000); round-trip igual modulo segundo.
5. Envelope unico: texto = `PDX1.` + base64url(deflate(payload) + crc32 dos bytes comprimidos); magic "PDX" so no payload. Ordem: prefixo, base64url, crc32, inflate, magic/versao, tamanho, campos; dizer qual etapa gera foreignApp/corrupted/wrongVersion/oversized.
6. THEME_IDS: ordem canonica append-only = ordem do RF-79, em `src/styles/themes.ts`, enumerada em 5.3 e citada em B7.2.
7. F2.1 Done-when: tirar `mobile-boot-splash.png` (e a tampa do boot); marcar "sem captura de referencia".
8. Nits: B2.2 ignorar prefixos `legacy`/`special`/`form_change`; B2.4 mega = 81 arquivos; F1.3 historico = 40 no prototipo (app.js:1223); UiState com compare/sync/settings/home; QR modo byte v24-M (914), cabecalho dentro dos 900, parser corta so nos 3 primeiros pontos; uniao de derrotados: menor `at` vence; `fast-check` e `msw` na tabela de dependencias; linha do store `backups` no mapa 2b.
10. [NOVO, decisao do orquestrador] O Pontin NAO tem o modpack no outro PC. Os dados da instancia foram copiados para `data-source/atm-1.3.0/` (69 MB, ver `data-source/README.md`). A SPEC deve fazer o pipeline aceitar essa pasta como fonte (jars ja abertos em `mods/<nome-do-jar>/`) alem da instancia real; `ATM_INSTANCE_DIR` com default `data-source/atm-1.3.0`. Ajustar B1/B2 e o CONTEXT.
9. Baseline do SPEC: PRD c22a97f1, CONTEXT fc72ef60 (reconferir com git hash-object).
Depois: commitar, `forge-checklist` (haiku) gera o CHECKLIST, commitar/push e PARAR antes da implementacao.

## Regras combinadas com o Pontin (valem para o resto do pipeline)

- Autonomia total ate o fim da Stage 3: aprovar gates sozinho, decidir perguntas abertas pelo default recomendado e registrar como premissa. PARAR antes da Stage 4 (implementacao) e esperar o ok.
- Nenhum agente roda mais de 1h seguida: ao bater 1h, parar e continuar com agente novo de contexto zerado a partir do disco (tambem no CLAUDE.md global, Regra 2).
- Playwright neste projeto: `headless: false` e SEM `slowMo` (sobrepoe os 2000 ms do CLAUDE.md global).
- Respostas em pt-BR, em texto (sem widgets de pergunta), sem travessao, commits sem assinatura do Claude, push/merge so com pedido explicito.
- Tudo e must-have; nao perguntar prioridade.

## O que o PC novo precisa ter

- NAO precisa do modpack: os dados usados estao em `data-source/atm-1.3.0/` (copia extraida em 2026-09-23). A instancia original ficou no PC de casa (`C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`).
- Node 24 + npm 11 (versoes usadas aqui), Git, Playwright instalado globalmente.
- Para a Fase 2 (apps, futura): JDK 21 e Android SDK 36 (ANDROID_HOME).
- `ui-refs/` (50 prints de referencia) e `STATE_pontindex.md` vem no clone. Se precisar refazer os prints: `/forge --ui-recon pontindex`, servindo a pasta `design/` como raiz (nao `design/prototipo/`).
