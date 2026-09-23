# Retomada do Pontindex (para continuar em outro PC)

Atualizado em 2026-09-23. Neste projeto TODOS os artefatos do `.forge` sao versionados (inclusive `STATE_pontindex.md`, checklists, relatorios e `ui-refs/`); so a memoria do Claude fica no PC original (fora do repo), por isso as regras dela estao copiadas abaixo. Em um PC novo, leia ESTE arquivo primeiro. A secao 13 da IDEA ficou desatualizada (descreve o fim da Stage 1) e nao foi editada para nao disparar o drift check.

## Onde estamos

- Branch: `feature/pontindex` (remoto `origin` = github.com/Pontinn/pokedex-atm).
- Stage 1 (IDEA), Stage 2 (PRD) e Stage 3b (UI recon) concluidas. Stage 3 (SPEC) escrita e em revisao final (forge-review) no momento deste commit.
- Artefatos: `IDEA`, `CONTEXT`, `PRD` (rev 5, 125 RFs, 12 RNFs), `UISPEC` (50 prints), `SPEC` (23 sprints, 60 features, 100% de cobertura).
- Falta: fechar a revisao da SPEC (aplicar achados, se houver), commitar, gerar o `CHECKLIST_pontindex.md` (forge-checklist) e PARAR antes da implementacao para o Pontin aprovar.
- Proximo comando no PC novo: `/forge --imp pontindex` so depois de a SPEC estar aprovada e o checklist existir. Se a revisao da SPEC nao tiver terminado, rode `/forge --review-spec pontindex` antes.

## Regras combinadas com o Pontin (valem para o resto do pipeline)

- Autonomia total ate o fim da Stage 3: aprovar gates sozinho, decidir perguntas abertas pelo default recomendado e registrar como premissa. PARAR antes da Stage 4 (implementacao) e esperar o ok.
- Nenhum agente roda mais de 1h seguida: ao bater 1h, parar e continuar com agente novo de contexto zerado a partir do disco (tambem no CLAUDE.md global, Regra 2).
- Playwright neste projeto: `headless: false` e SEM `slowMo` (sobrepoe os 2000 ms do CLAUDE.md global).
- Respostas em pt-BR, em texto (sem widgets de pergunta), sem travessao, commits sem assinatura do Claude, push/merge so com pedido explicito.
- Tudo e must-have; nao perguntar prioridade.

## O que o PC novo precisa ter

- A instancia do modpack instalada (CurseForge): All the Mons 1.3.0 (Cobblemon 1.7.3). O pipeline de dados le os jars em `mods/`, `kubejs/data/` e `config/` dessa instancia. No PC original o caminho e `C:/Users/Usuario/curseforge/minecraft/Instances/All the Mons - ATMons`; em outro PC o caminho muda e a SPEC preve a variavel `ATM_INSTANCE_DIR` para apontar para ela.
- Node 24 + npm 11 (versoes usadas aqui), Git, Playwright instalado globalmente.
- Para a Fase 2 (apps, futura): JDK 21 e Android SDK 36 (ANDROID_HOME).
- `ui-refs/` (50 prints de referencia) e `STATE_pontindex.md` vem no clone. Se precisar refazer os prints: `/forge --ui-recon pontindex`, servindo a pasta `design/` como raiz (nao `design/prototipo/`).
