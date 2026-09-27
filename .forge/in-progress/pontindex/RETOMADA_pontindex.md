# Retomada do Pontindex (LEIA PRIMEIRO numa sessao nova)

Atualizado em 2026-09-27 01:30 pelo orquestrador (Claude), ao fim da sessao autonoma noturna (ver a secao "Sessao noturna" logo abaixo; o resto do arquivo e o contexto anterior, ainda valido onde nao foi marcado como FEITO). PC atual: `C:/Users/milap/OneDrive/Desktop/leo/pokedex-atm` (Windows 11, 7,8 GB de RAM: POUCA MEMORIA, ver "Ambiente"). PC anterior: `C:/Users/mateu/Desktop/Nova pasta`. Branch `feature/pontindex`, remoto `origin` = github.com/Pontinn/pokedex-atm. Ultimo push: `15362d9b` (2026-09-27 ~01:45, pedido explicito do Pontin; 26 commits da sessao noturna). Tudo do `.forge` e versionado.

Como retomar: rodar `/forge` e pedir para continuar o pontindex (ou `/forge --test pontindex` para a Stage 5). Ordem de leitura: este arquivo -> `STATE_pontindex.md` (frontmatter + entradas de 2026-09-25 e 2026-09-26 no fim) -> `CHECKLIST_pontindex.md` (+ "Bugs encontrados") -> `HANDOFF_frontend.md` (todas as secoes) -> `HANDOFF_tests.md` -> `AUDIT_2026-09-26.md` -> `CHECKLIST_MANUAL_pontindex.md`.

## Sessao noturna 2026-09-26 23:00 a 2026-09-27 ~01:30 (Pontin dormindo, autonomia total) - LEIA ISTO PRIMEIRO

Regras da noite (Pontin): orquestrador nao coda, so agentes (Opus max, Sonnet min); timer de 25 min por agente; paralelo so sem risco; sem push; mensagens curtas. Tudo abaixo esta commitado em `feature/pontindex` (push feito depois, a pedido do Pontin: 15362d9b).

FEITO (tudo verde, em ordem):
1. PRIORIDADE 1 verificada: typecheck e lint falhavam SO nos scripts de auditoria `tools/dataset/audit/manual-2026-09-26/` (eslint sem `.mjs` no glob; argv sem guarda). Fix 90bd2689. vitest 55/385, e2e trainers 11/11 e responsive 18/18 verdes. Nenhuma regressao de produto dos fixes do chip/abas.
2. Calculadora de stats (RF-110, PRD rev 7): recomendacao por FUNCAO (Atacante rapido / lento / Defensivo) + "Priorize X e Y" + natureza sugerida + aviso "Sugestao automatica, criada com ajuda de IA...". Sem numeros de EV/IV na tela; Aplicar seta IV 31, EVs da regra e a natureza. 8fcc1268. PRD/SPEC atualizados (2ab2e5d7). Prints em `ui-refs/rf110-*.png`. Detalhe: o rotulo PT do stat e "At. Esp." (ja existia), nao "Atq. Esp.".
3. Bug dos itens segurados (auditoria T1): pipeline aceita string OU lista; campo virou `heldItems: string[]` (0-2 itens, UI mostra todos, decisao 3a = mostrar os dois). f2983a6d. Dataset republicado `public/data/atm1.3.0-cobblemon1.7.3-20260927-1344fc8b/` (61d8f8f9; data em UTC; pasta antiga removida). 805 membros com item (112 com 2). Bonus: 76 itens antigos sem namespace geravam 20 ids quebrados em items.json (966 -> 949). Auditoria re-rodada: 0 divergencias. AUDIT_2026-09-26.md marca T1 CORRIGIDO.
4. Decisoes da auditoria (item 3 antigo), tomadas pelo orquestrador com base nas escolhas anteriores: (a) 2 itens: mostrar os dois (feito); (b) groups/ opcionais: sem acao (nao afeta cap); (c) golpes legacy/special: continuam nao publicados; (d) Magby/Mantyke: SO UI, "Como obter" mostra "Nasce no mundo: veja Onde encontrar" quando so ha `none` + spawns (db52b4a2; vale para Pichu tambem); (e) 12 overrides ccc/mega_showdown: MANTIDA a regra por campo da SPEC (R10, base do Cobblemon vence), sem acao. Pontin pode reverter qualquer uma.
5. Vite: watcher ignora `coverage/` (37e54a2e). Texto do checklist F5.4 corrigido para x1/4 (9a2718a9).
6. Suite e2e COMPLETA rodou pela 1a vez: 18 arquivos, 217 verdes, 1 falha (F1). ~23 min, um arquivo por vez. Relatorio `REPORT_TEST_UI_pontindex.md` (a7ebce96).
7. F1 (pwa-offline, botao Atualizar nao ativava o SW novo): BUG REAL e antigo (build de c62eee65 tambem falhava 4/6), nao regressao. Causa provada via CDP: o som de clique do botao (fetch de click.ogg) reanimava o SW antigo enquanto ele parava. Fix dec90eb2: `data-silent` no botao Atualizar. pwa-offline 5/5 x5. Detalhes na secao "Resolucao" do REPORT.
8. Cobertura (item 4 antigo): 8 arquivos RTL novos em `tests/unit/ui-screens/` (61 testes; Detail, Trainers, Dex, Settings, Sync, Item, Compare, Items). Linhas: telas 35% -> 90,7%, global 70% -> 92,4%. Metas da SPEC restauradas no vitest.config (80 global / 70 telas), 2309a9cb. Nenhum bug real; 2 observacoes no HANDOFF_tests.md (isFreeroamUnlocked x seriesChips com serie sem treinador-chave; grade virtualizada em jsdom).
9. Tempo do 1o carregamento em PRODUCAO medido (HANDOFF_tests.md, 9eee00d8): frio DOMContentLoaded 104 ms, dataset pronto 304 ms, tampa some 2,47 s (18 req, ~505 KB); quente com SW 40 / 166 ms / 2,31 s, 0 bytes. O 1,4 s e `animation-delay` da tampa (shell.css:28-29) que comeca DEPOIS do dataset pronto.
10. Verificacao final consolidada (agente Sonnet, ~01:15): resultado na entrada final do STATE.

PARA O PONTIN DECIDIR DE MANHA (nao executado de proposito):
- A. Reduzir o atraso de 1,4 s da tampa? Agente recomenda reduzir (producao fica em ~2,5 s). Nao mexi: e escolha estetica sua.
- B. Conferir as decisoes do item 4 acima (principalmente (e), overrides mantidos, e (d), texto do Magby).
- C. Stage 5 manual (item 7 antigo): instalar no PC e no celular, modo aviao, 360/390 no celular real, conferir no jogo Meltan sem Melmetal e cap apos um Cedric. So voce faz.
- D. Push: FEITO em 2026-09-27 ~01:45 a pedido do Pontin (15362d9b).
- E. Depois do Stage 5 manual: mover para `.forge/complete/` e merge/deploy (Vercel) so com pedido seu.

## Onde paramos (2026-09-26 06:15, Pontin saiu; contexto ANTERIOR a sessao noturna)

- Stage 4 (implementacao) da Fase 1 (site/PWA) CONCLUIDA: TODAS as telas e a PWA estao prontas e commitadas. Checklist: tudo `[x]` menos T1 (testes finais feitos por T1a/T1b, mas a suite e2e completa nunca rodou de uma vez) (P1-P3 movidos para a ideia `pontindex-app`).
- Feito na noite de 2026-09-24/25 (autonomia total): grupos A (F3-F6) e B (F8, F9, F7), F12 (PWA: precache 73 entradas 2,49 MiB, offline, UpdatePrompt), T1a (unit/componente/cobertura/README/manual), T1b (e2e mode-agnostic, navigation, team-history, perf, responsive + 14 baselines, pwa artwork offline), correcoes: schema das bolas (5f1f18dc), ItemTile prefixo duplo (59500a8e), item page evolucoes duplicadas (7221dc51), 5 falhas de e2e que eram fragilidade de teste (fb2ecac9).
- Feito em 2026-09-26 com o Pontin testando no navegador: chip "Cap -> X" dos treinadores agora mostra o cap APOS derrotar o treinador (99dd56fe; BDSP Roark 16, Mars 20, Jupiter 22; o cabecalho "Seu cap atual" ja estava certo e nao mudou); scroll vertical nas barras de abas `.tabs` (91d26ec1, box-shadow inset no lugar de border + margin negativa); auditoria independente (90e00346, `AUDIT_2026-09-26.md`): level cap 155 passos = app, 50 especies (semente 1558599613) 0 erros, 1 BUG real (itens segurados dos treinadores).
- Ultima verificacao completa conhecida (antes dos 2 fixes de hoje): typecheck 0, lint 0, vitest 55 arquivos / 385 testes verdes. Os fixes de hoje NAO foram verificados por inteiro (ver PRIORIDADE 1).
- Dataset publicado: `public/data/atm1.3.0-cobblemon1.7.3-20260924-1344fc8b/` (1027 especies, 964 itens, 48 bolas, 1589 treinadores, 6 series).
- Stage 5 (validacao) NAO comecou: `forge-test` ainda nao foi disparado. Nao ha API (site estatico); Stage 5 = suite completa + itens do CHECKLIST_MANUAL.
- Proxima grande etapa depois de tudo isso: Stage 5 com o Pontin, mover a feature para `.forge/complete/`, e merge/deploy (Vercel) SO quando ele pedir. Os apps sao outra feature (`pontindex-app`).

## Proximo passo ao retomar

## PRIORIDADE 1 (Pontin 2026-09-26 06:0x): VERIFICAR O ULTIMO PUSH - FEITO em 2026-09-26 23:20 (ver "Sessao noturna", item 1)
O Pontin mandou parar, commitar e dar push SEM esperar verificacao. O agente commitou o fix das abas + teste (91d26ec1) e foi parado antes do vitest completo e da conferencia final; eu nao verifiquei nada antes do push (nem typecheck/lint). Ao retomar, rodar tudo isso PRIMEIRO; se algo falhar, corrigir antes de qualquer outra pendencia. O chip do cap (99dd56fe) o agente commitou verde.

## PENDENCIAS (Pontin 2026-09-26: "anota tudo pra fazer depois") - STATUS apos a sessao noturna: 1 FEITO, 2 FEITO, 3 DECIDIDO (ver item 4 da sessao noturna), 4 FEITO, 5 FEITO, 6 MEDIDO (decisao A pendente), 7 PENDENTE (so o Pontin), 8 sem push, 9 FEITO, 10 FEITO (watcher). Texto original mantido abaixo como historico.

Chip do cap: FEITO (99dd56fe). Scroll das abas: 91d26ec1, sem verificacao completa (ver PRIORIDADE 1).

Para fazer:
1. Calculadora de stats (RF-110). ATUALIZACAO Pontin 2026-09-26: exibir de forma SIMPLES, sem valores exatos de EV/IV: so a funcao (ex. "Atacante rapido") e os 2 stats para priorizar (ex. "Priorize Ataque Especial e Velocidade"). Pontin: deixar CLARO na UI que e so recomendacao, nao regra (o usuario escolhe o que quiser), e que foi feita por IA. Texto sugerido pelo Claude (confirmar com o Pontin): PT "Sugestao automatica, criada com ajuda de IA. E so uma recomendacao: treine o que preferir." / EN "Automatic suggestion, created with the help of AI. It is only a recommendation: train whatever you prefer." (a regra e fixa, o app nao consulta IA em tempo real). Em aberto: mostrar natureza sugerida? manter botao Aplicar? A regra abaixo continua decidindo o que priorizar. Regra original: trocar a regra pela recomendacao por funcao + natureza. Pontin escolheu a opcao 2. Regra: lado ofensivo = maior entre Atk e SpA (empate Atk); DEFENSIVO se maior ataque < 80 e maior defesa >= 100 (252 HP / 252 maior defesa / 4 outra; natureza Bold/Impish/Calm/Careful); ATACANTE RAPIDO se Spe >= 80 (252 ataque / 252 Spe / 4 HP; Jolly ou Timid); senao ATACANTE LENTO (252 HP / 252 ataque / 4 maior defesa; Adamant ou Modest); IV 31 em tudo. Exemplos: Charizard Timid 252SpA/252Spe/4HP; Gyarados Jolly 252Atk/252Spe/4HP; Snorlax Adamant 252HP/252Atk/4SpD; Blissey Calm 252HP/252SpD/4Def; Shuckle Bold 252HP/252Def/4SpD; Mew Jolly. Atualizar PRD RF-110 e SPEC B6.2/F5.4. Mostrar natureza e funcao na UI; Aplicar tambem seta a natureza.
2. Bug de dados (auditoria 2026-09-26, AUDIT_2026-09-26.md): itens segurados dos times de treinador viram null quando o arquivo cru usa LISTA (729 casos; tools/dataset/src/trainers/merge.ts:41 so aceita string). Ex.: Scrafty do Giovanni = Psychic Seed. Corrigir no pipeline, regenerar e publicar o dataset, re-rodar auditoria.
3. Decisoes do Pontin (auditoria): (a) 219 Pokemon com 2 itens (ex. Mega Stone + item): mostrar os dois?; (b) groups/ de mobs de treinadores nao mesclados (so opcionais, ex. soldados Galactic/Rocket; nao afeta o cap); (c) golpes legacy:/special: nao publicados (40 de 50 especies da amostra tem); (d) Magby/Mantyke com Como obter = nenhum apesar de nascerem no mundo (regra 5.1.5); (e) 12 especies ccc/mega_showdown com o mesmo caminho do Cobblemon: no jogo o arquivo inteiro e substituido, o app mostra o do Cobblemon (ex. Dialga do ccc sem golpes).
4. Cobertura de testes: linhas de src/screens 35% (meta 70) e global 70% (meta 80); limiares rebaixados no vitest.config. Pontin aceita ou quer testes de unidade das telas?
5. Suite e2e COMPLETA nunca rodou de uma vez (morreu por falta de RAM no teste 9/210). Rodar com o PC folgado: PW_DEV=1 PW_PORT=4178 npx playwright test --workers=1 --grep-invert pwa-offline; depois npm run build e npx playwright test tests/e2e/pwa-offline.spec.ts.
6. Tempo do 1o carregamento: medido so em dev (tampa some em 3,6 a 4,5 s; 247 arquivos; 1,4 s de espera da tampa pela SPEC). Medir em producao (build + preview) e decidir se reduz a espera da tampa.
7. Stage 5: itens do CHECKLIST_MANUAL que so o Pontin faz (instalar no PC e no celular, modo aviao, 360/390 no celular real, conferir no jogo: Meltan sem Melmetal, cap apos um Cedric).
8. Push: houve um push em 2026-09-25 05:52 sem registro do Claude (perguntar ao Pontin se foi ele). Em 2026-09-26 o Pontin pediu e foi feito o push de c62eee65. Continuar: push so com pedido explicito; merge e deploy so quando ele pedir.
10. Layout quebrado visto pelo Pontin as 05:55 (pokebola gigante, sidebar no meio): o npm run dev dele pega na hora (HMR) as edicoes que os agentes estao fazendo; nessa hora um agente editava src/styles/components.css (HMR as 05:53, 05:55 e 05:56). Recarregando depois, a Home renderiza certa (conferido com screenshot headless). Causa provavel, nao 100% provada. Para o Pontin testar sem pegar edicao pela metade: servir o build (npm run build + npx vite preview) em vez do dev, ou nao rodar agentes enquanto ele testa. Vitest --coverage tambem gera coverage/ e faz o Vite recarregar a pagina: ignorar coverage/ no watcher do vite.config.
9. Detalhe: checklist F5.4 dizia Fogo/Agua vs Fogo x1/2; o correto (SPEC e tabela de tipos) e x1/4, implementado x1/4. Corrigir o texto do checklist.

Ordem sugerida ao retomar (confirmar com o Pontin antes de executar as PENDENCIAS):
1. PRIORIDADE 1: typecheck, lint, vitest completo e e2e das abas/treinadores (PW_DEV=1, --workers=1). Corrigir o que falhar.
2. Suite e2e completa (item 5), com o PC folgado.
3. Perguntar ao Pontin as decisoes em aberto (itens 1, 3, 4, 6) e executar o que ele aprovar (itens 1 e 2 via agentes).
4. Stage 5 (item 7).

## Regras combinadas com o Pontin (valem ate o fim)

- Respostas em pt-BR, texto curto; sem travessao em nada; commits sem assinatura do Claude; commits atomicos por feature.
- Push SO quando o Pontin pedir. Merge nunca sem pedido explicito.
- Nenhum agente roda mais de 1h (Regra 2 do CLAUDE.md global): timer por agente; agente retomado por mensagem conta o tempo total; ao estourar, agente NOVO de contexto zerado a partir do disco. Neste PC Windows, parar timers com TaskStop pelo ID (pkill nao funciona).
- Playwright SEMPRE `headless: true`, sem `slowMo`, sem timers/sleeps.
- Paralelizar SO quando o risco para a qualidade for baixo ou nulo.
- Avisar ANTES de instalar qualquer coisa neste PC. PC atual (milap, 2026-09-24): Node 24.19.0 + npm 11.17.0 (winget, `C:/Program Files/nodejs`; o shell do Claude Code NAO tem no PATH: prefixar `export PATH="/c/Program Files/nodejs:$APPDATA/npm:$PATH"`), Playwright 1.63.0 global + Chromium, git identidade local `Pontinn <leo.pontin2@gmail.com>`, gh logado como Pontinn. Sem JDK/Android SDK (Pontin: nao instalar, objetivo e terminar o site). NAO ha Python: nunca rodar `python`/`python3` (abre a Microsoft Store). Cache `tools/dataset/.cache` reaquecido neste PC (join.test depende dele). Arquivos gerados (`types.generated.css`, snapshot do type-css) aparecem modificados so por LF/CRLF (core.autocrlf=true): conteudo identico, ignorar.
- Esta feature e SO o site (PWA). Apps Windows/Android foram movidos para a ideia separada `pontindex-app` (`.forge/ideas/pontindex-app/`, 2026-09-26) e so comecam depois do site aprovado. NUNCA citar P1-P3 como pendencia do site.
- O Pontin acompanha pelo Remote Control: mandar so avisos curtos de andamento, sem prints.
- Modelos: dados e regras criticas e frontend em Opus; coleta mecanica em Sonnet; checklist/contagens em Sonnet. NUNCA usar Haiku (Pontin, 2026-09-24: o Haiku errou o checklist).

## Decisoes de dados tomadas hoje (por evidencia nos arquivos)

- BDSP tem 43 treinadores-chave (kubejs do All the Mons torna 10 revanches obrigatorias).
- Level cap: minimo entre TODOS os treinadores-chave disponiveis (regra do bytecode); apos UM Cedric continua 22 [OPEN: conferir no jogo].
- Mewtwo tem spawn ultra-raro do ccc (cavernas/Deep Dark) + fossil; Charizard tem spawn proprio.
- Colisoes de arquivos entre mods: kubejs substitui o jar; entre jars vence o mod que carrega por ultimo pela ordem transitiva dos `neoforge.mods.toml` (mega_showdown < allthemons < ccc: ccc vence 24 colisoes). Constante `SPAWN_COLLISION_WINNER` em `tools/dataset/src/species/spawns.ts`.
- Meltan sem evolucao para Melmetal (kubejs `zzz_ccc_meltan.json` zera evolutions) [OPEN: conferir no jogo].
- Pokedex: lista virtualizada (sem paginacao) + barra de busca combinada com os filtros.

## Ambiente e cuidados

- O Desktop deste PC esta sincronizado com o OneDrive: causou EPERM ao renomear pastas. Mitigado (delete-then-rename com retry; Vite ignora `tools/dataset/out` e `.cache`). Sugerido ao Pontin tirar o repo do OneDrive.
- `npm run dataset` publica em `public/`; testes usam `--publish-dir tools/dataset/out/_publish_test` e nunca tocam `public/`.
- `prints/` (raiz) e rascunho do Pontin, fora do git. Feedbacks versionados em `.forge/in-progress/pontindex/feedback/`.
- Para ver o site: `npm run dev` e abrir http://localhost:5173/.
- Novo PC com pouca RAM: o Claude Code mata processos em segundo plano quando a memoria acaba (aconteceu 2x: instalacao do Node e a suite e2e completa). Rodar e2e com `--workers=1`, um arquivo por vez se possivel, e com o navegador do Pontin fechado ou leve.
- Enquanto agentes editam codigo, o `npm run dev` aberto pelo Pontin recarrega na hora e pode mostrar a tela quebrada no meio de uma edicao (visto em 2026-09-26 05:55). Para ele testar com calma: `npm run build` + `npx vite preview` (porta 4173) ou esperar os agentes terminarem.
- `vitest --coverage` gera a pasta `coverage/` e o Vite recarrega a pagina a cada arquivo gerado (pendencia: ignorar `coverage/` no watcher do vite.config).
- Comandos: typecheck `npm run typecheck`; lint `npm run lint`; unit `npx vitest --run`; e2e dev `PW_DEV=1 PW_PORT=4178 npx playwright test <spec> --workers=1`; PWA em producao `npm run build` e `npx playwright test tests/e2e/pwa-offline.spec.ts` (sem PW_DEV, porta 4173). Detalhes em `HANDOFF_tests.md`.
- Auditoria de dados: ferramenta `tools/dataset/audit/` (AUDIT_REPORT.md) + scripts independentes `tools/dataset/audit/manual-2026-09-26/`.
