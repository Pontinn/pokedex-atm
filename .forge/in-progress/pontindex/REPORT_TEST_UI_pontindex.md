# REPORT_TEST_UI - Pontindex (suite e2e completa, 1a execucao ponta a ponta)

Escrito pelo orquestrador a partir do retorno do agente forge-test (o agente foi impedido pelo harness de gravar o arquivo). Dados literais do agente.

- Quando: 2026-09-26 23:57 a 2026-09-27 00:35 (local).
- Maquina: PC milap (Windows 11, 7,8 GB RAM), navegador do Pontin fechado.
- HEAD testado: `2ab2e5d7` (inclui RF-110 rev 7 8fcc1268, wildOnly db52b4a2, heldItems f2983a6d + dataset 61d8f8f9).
- Modo: Playwright headless, `--workers=1`, UM arquivo por vez (a RAM nao deixou rodar tudo junto na tentativa anterior). Dev: `PW_DEV=1 PW_PORT=4178`. Producao: `npm run build` + preview 4173 (so `pwa-offline.spec.ts`).
- Antes de comecar: `npm run typecheck` 0, `npm run lint` 0.

## Totais

| Etapa | Arquivos | Passaram | Falharam | Pulados | Tempo |
|---|---|---|---|---|---|
| Dev (PW_DEV=1) | 17 | 213 | 0 | 0 | 1269 s (21 min 09 s) |
| Producao (build 68 s) | 1 (`pwa-offline.spec.ts`) | 4 | 1 | 0 | 61 s |
| **Total** | **18** | **217** | **1** | **0** | ~23 min 20 s |

## Por arquivo (dev): passaram / segundos

balls 7/63, capture 8/64, captured 6/32, compare 9/60, detail 46/246, dex 12/60, home 24/119, item 16/100, items 7/53, navigation 2/13, perf 2/21, responsive 18/71, settings 14/102, shell 15/32, sync 15/120, team-history 1/30, trainers 11/83.

- As 14 baselines de screenshot passaram com tolerancia de 2%. Nenhuma foi atualizada (a ficha capturada e a visao geral, sem a calculadora nem o painel Como obter).
- Recursos desta noite cobertos e verdes: RF-110 (aviso de IA) e `obtain.wildOnly` em detail; chips de item segurado em trainers; `items.json` com 949 ids em item/items.

## Falhas

### F1 (Medium, ABERTA): `tests/e2e/pwa-offline.spec.ts:202` "new service worker waiting -> 'Nova versao disponivel' toast; Atualizar activates it and reloads"

- Erro: `Test timeout of 30000ms exceeded. page.waitForEvent: waiting for event "load"` (linha 224). Falha sempre: 2/2 na spec + 4 rodadas de diagnostico.
- Comportamento: o toast aparece e o SW novo fica `installed`. Depois de clicar em Atualizar, ele nunca ativa, `controllerchange` nao dispara e a pagina nao recarrega.
- Evidencia: `postMessage SKIP_WAITING` direto para `reg.waiting` tambem nao ativa (o handler existe em `dist/sw.js`); `self.skipWaiting()` chamado dentro do SW em espera nunca resolve (antes do clique o worker responde normalmente); nenhuma requisicao pendente da pagina ou do SW.
- Historico: o mesmo fluxo passou 4/4 no F12 e 5/5 no T1b (2026-09-25). O codigo de PWA (`src/pwa/*`, `register-sw.ts`, config VitePWA) nao mudou desde 70364fb7 e os commits desta noite nao tocam em PWA.
- Classificacao: INDETERMINADA (regressao real x efeito do Chromium/Playwright). Nao corrigida (causa nao provada), nenhuma asercao removida, sem skip.
- Impacto se for real: usuario fica na versao antiga ate fechar todas as abas; sem perda de dados.
- Proximos passos: (1) comparar com um build de `c62eee65` (antes das mudancas de hoje) no mesmo ambiente; (2) item do CHECKLIST_MANUAL "Deploy novo com a aba aberta" no Chrome real (build + preview, trocar o build com a aba aberta).

## Achados em aberto

| Sev | Id | Resumo | Estado |
|---|---|---|---|
| Medium | F1 | Atualizar do toast de nova versao nao ativa o SW em espera (producao, headless) | Aberto, em investigacao |

Nenhum Critical/High.

## Commits desta execucao

Nenhum do agente (nada precisou de fix de teste ou produto). Arvore limpa; servidores 4173/4178 encerrados.
