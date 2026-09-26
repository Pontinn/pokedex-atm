# Retomada do Pontindex (LEIA PRIMEIRO numa sessao nova)

Atualizado em 2026-09-24 19:35 (PC atual desde 21:00: `C:/Users/milap/OneDrive/Desktop/leo/pokedex-atm`; PC anterior: `C:/Users/mateu/Desktop/Nova pasta`). Branch `feature/pontindex`, remoto `origin` = github.com/Pontinn/pokedex-atm. Tudo do `.forge` e versionado. Ordem de leitura: este arquivo -> `STATE_pontindex.md` (frontmatter + ultimas entradas) -> `CHECKLIST_pontindex.md` -> `HANDOFF_frontend.md` (secoes F1.4, Grupo C, F2) -> SPEC da proxima feature.

## Onde paramos (PARADO a pedido do Pontin, 2026-09-24)

- Stage 4 (implementacao) em andamento, pasta `.forge/in-progress/pontindex/`.
- Checklist: 40 de 59 itens `[x]` (58 features da Fase 1 + A1 auditoria). Prontos: TODO o backend (B1-B7), fundacao visual (F1.1-F1.4), Home e busca (F2), Configuracoes (F10) e Sincronizar (F11), auditoria A1 limpa.
- Faltam: grupo A (F3 Pokedex, F4 ficha, F5 ficha parte 2, F6 captura e capturados, F7 comparar), grupo B (F8 treinadores, F9 pokebolas, itens, pagina de item), depois F12 (PWA) e T1 (testes finais), depois Stage 5 (testes de validacao com o Pontin).
- Ultima verificacao completa (19:32): typecheck 0 erros, lint 0, vitest 27 arquivos / 256 testes verdes, build ok, `public/` intacto, nenhum commit com assinatura.
- Dataset publicado e auditado: `public/data/atm1.3.0-cobblemon1.7.3-20260924-1344fc8b/` (1027 especies, 964 itens, 48 bolas, 1589 treinadores, 6 series). Auditoria rodada 2: 0 divergencias em 42.992 checagens.

## Proximo passo ao retomar

## PENDENCIAS (Pontin 2026-09-26: "anota tudo pra fazer depois"; NAO executar sem o ok dele)

Em andamento quando anotado: agente de correcao do chip de cap (cap apos derrotar o treinador: Roark 16, Mars 20, Jupiter 22) e do scroll vertical das abas (.tabs). Ao retomar: conferir no git log se commitou (fix(trainers)... e fix(ui): tabs...); se nao, disparar agente novo a partir do disco (HANDOFF_frontend.md, "Onde parei").

Para fazer:
1. Calculadora de stats (RF-110). ATUALIZACAO Pontin 2026-09-26: exibir de forma SIMPLES, sem valores exatos de EV/IV: so a funcao (ex. "Atacante rapido") e os 2 stats para priorizar (ex. "Priorize Ataque Especial e Velocidade"). Em aberto: mostrar natureza sugerida? manter botao Aplicar? A regra abaixo continua decidindo o que priorizar. Regra original: trocar a regra pela recomendacao por funcao + natureza. Pontin escolheu a opcao 2. Regra: lado ofensivo = maior entre Atk e SpA (empate Atk); DEFENSIVO se maior ataque < 80 e maior defesa >= 100 (252 HP / 252 maior defesa / 4 outra; natureza Bold/Impish/Calm/Careful); ATACANTE RAPIDO se Spe >= 80 (252 ataque / 252 Spe / 4 HP; Jolly ou Timid); senao ATACANTE LENTO (252 HP / 252 ataque / 4 maior defesa; Adamant ou Modest); IV 31 em tudo. Exemplos: Charizard Timid 252SpA/252Spe/4HP; Gyarados Jolly 252Atk/252Spe/4HP; Snorlax Adamant 252HP/252Atk/4SpD; Blissey Calm 252HP/252SpD/4Def; Shuckle Bold 252HP/252Def/4SpD; Mew Jolly. Atualizar PRD RF-110 e SPEC B6.2/F5.4. Mostrar natureza e funcao na UI; Aplicar tambem seta a natureza.
2. Bug de dados (auditoria 2026-09-26, AUDIT_2026-09-26.md): itens segurados dos times de treinador viram null quando o arquivo cru usa LISTA (729 casos; tools/dataset/src/trainers/merge.ts:41 so aceita string). Ex.: Scrafty do Giovanni = Psychic Seed. Corrigir no pipeline, regenerar e publicar o dataset, re-rodar auditoria.
3. Decisoes do Pontin (auditoria): (a) 219 Pokemon com 2 itens (ex. Mega Stone + item): mostrar os dois?; (b) groups/ de mobs de treinadores nao mesclados (so opcionais, ex. soldados Galactic/Rocket; nao afeta o cap); (c) golpes legacy:/special: nao publicados (40 de 50 especies da amostra tem); (d) Magby/Mantyke com Como obter = nenhum apesar de nascerem no mundo (regra 5.1.5); (e) 12 especies ccc/mega_showdown com o mesmo caminho do Cobblemon: no jogo o arquivo inteiro e substituido, o app mostra o do Cobblemon (ex. Dialga do ccc sem golpes).
4. Cobertura de testes: linhas de src/screens 35% (meta 70) e global 70% (meta 80); limiares rebaixados no vitest.config. Pontin aceita ou quer testes de unidade das telas?
5. Suite e2e COMPLETA nunca rodou de uma vez (morreu por falta de RAM no teste 9/210). Rodar com o PC folgado: PW_DEV=1 PW_PORT=4178 npx playwright test --workers=1 --grep-invert pwa-offline; depois npm run build e npx playwright test tests/e2e/pwa-offline.spec.ts.
6. Tempo do 1o carregamento: medido so em dev (tampa some em 3,6 a 4,5 s; 247 arquivos; 1,4 s de espera da tampa pela SPEC). Medir em producao (build + preview) e decidir se reduz a espera da tampa.
7. Stage 5: itens do CHECKLIST_MANUAL que so o Pontin faz (instalar no PC e no celular, modo aviao, 360/390 no celular real, conferir no jogo: Meltan sem Melmetal, cap apos um Cedric).
8. Push: a branch foi enviada ao GitHub em 2026-09-25 05:52 sem registro do Claude; perguntar ao Pontin se foi ele. Nao dar push sem pedido explicito. Merge e deploy so quando ele pedir.
9. Detalhe: checklist F5.4 dizia Fogo/Agua vs Fogo x1/2; o correto (SPEC e tabela de tipos) e x1/4, implementado x1/4. Corrigir o texto do checklist.

1. Ler este arquivo e o STATE; rodar `npm run typecheck`, `npm run lint`, `npx vitest --run` para confirmar o verde.
2. Disparar em PARALELO (risco baixo, avaliado e aprovado pelo Pontin):
   - Grupo A (opus): F3 -> F4 -> F5 -> F6 (em fila). Sugestao PENDENTE de resposta do Pontin: mover F7 (comparar) do grupo A para o B.
   - Grupo B (opus): F8, F9 (e F7 se o Pontin aprovar).
   - Cada grupo: arquivos proprios (lista em `HANDOFF_frontend.md`, secao F1.4), modulo i18n proprio em `src/i18n/messages/<tela>.ts`, porta de e2e propria (A 4174, B 4175), `PW_DEV=1`.
   - Grupo A PRECISA chamar `useHistoryStore.getState().push(dex)` ao abrir a ficha; stores ouvem o evento `pontindex:data-changed`; o store de treinadores (grupo B) tambem deve ouvir esse evento.
   - Toda tela de lista tem barra de busca PT e EN (regra geral de Frontend na SPEC; F3.2, F6.2, F8.2, F9.1, F9.2).
3. Rodar a suite COMPLETA no fim de cada onda (licao de 2026-09-24), nao so no fim da sessao.
4. Depois dos grupos: F12, T1, Stage 5. Merge e deploy na Vercel so quando o Pontin pedir (deploy so no fim do projeto).

## Regras combinadas com o Pontin (valem ate o fim)

- Respostas em pt-BR, texto curto; sem travessao em nada; commits sem assinatura do Claude; commits atomicos por feature.
- Push SO quando o Pontin pedir. Merge nunca sem pedido explicito.
- Nenhum agente roda mais de 1h (Regra 2 do CLAUDE.md global): timer por agente; agente retomado por mensagem conta o tempo total; ao estourar, agente NOVO de contexto zerado a partir do disco. Neste PC Windows, parar timers com TaskStop pelo ID (pkill nao funciona).
- Playwright SEMPRE `headless: true`, sem `slowMo`, sem timers/sleeps.
- Paralelizar SO quando o risco para a qualidade for baixo ou nulo.
- Avisar ANTES de instalar qualquer coisa neste PC. PC atual (milap, 2026-09-24): Node 24.19.0 + npm 11.17.0 (winget, `C:/Program Files/nodejs`; o shell do Claude Code NAO tem no PATH: prefixar `export PATH="/c/Program Files/nodejs:$APPDATA/npm:$PATH"`), Playwright 1.63.0 global + Chromium, git identidade local `Pontinn <leo.pontin2@gmail.com>`, gh logado como Pontinn. Sem JDK/Android SDK (Pontin: nao instalar, objetivo e terminar o site). NAO ha Python: nunca rodar `python`/`python3` (abre a Microsoft Store). Cache `tools/dataset/.cache` reaquecido neste PC (join.test depende dele). Arquivos gerados (`types.generated.css`, snapshot do type-css) aparecem modificados so por LF/CRLF (core.autocrlf=true): conteudo identico, ignorar.
- Site primeiro (Fase 1, PWA); apps Windows/Android so depois que o Pontin testar tudo.
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
