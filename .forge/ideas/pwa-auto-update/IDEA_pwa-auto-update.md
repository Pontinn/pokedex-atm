---
feature: pwa-auto-update
language: pt-BR
type: fix
status: done
mode: quick
created: 2026-09-28
---
# PWA atualiza sozinha (quick)

## 1. Objetivo
Pontin (2026-09-28, depois do deploy do dataset novo): "no site apareceu um botao pra atualizar. pq? era so pra atualizar de uma so vez. Nao e aplicativo ainda". Hoje `vite.config.ts` usa `registerType: "prompt"` (SPEC F12.1, escolha do orquestrador no modo autonomo, nunca pedida pelo Pontin): o service worker novo espera e o `UpdatePrompt` mostra "Atualizar".

## 2. Decisoes
- Atualizacao automatica: SW novo ativa na hora (skipWaiting + clientsClaim) e a pagina recarrega sozinha uma vez quando o novo SW assume o controle. Sem botao, sem aviso. Decisao do orquestrador a partir do pedido ("atualizar de uma so vez"); o reload costuma acontecer logo ao abrir o site.
- Offline/precache continua (RF-101/RNF de offline nao mudam).
- Transicao: quem esta com a versao atual (prompt) ainda ve o botao UMA ultima vez; inevitavel, a versao antiga e quem decide.

## 3. Escopo
- Dentro: `vite.config.ts` (registerType/workbox), `src/pwa/*` (registro, remover UpdatePrompt e o store se ficarem sem uso), onde o UpdatePrompt e montado, textos i18n do prompt, testes (unit + `tests/e2e/pwa-offline.spec.ts`), PRD/SPEC do pontindex (nota de revisao do F12.1).
- NAO mexer: botao "Instalar app" (RF-103), dados locais, dataset, qualquer outra tela.

## 4. Superficie de regressao
Offline (modo aviao) continua abrindo o que ja foi visto; dados locais sobrevivem a atualizacao (RF-96/RNF-06); primeira visita nao recarrega; nenhum loop de reload.

## 7. Regras e exemplos
- Deploy novo publicado -> usuario abre o site com a versao antiga em cache -> o SW novo instala, ativa, a pagina recarrega uma vez e ja mostra a versao nova. Nenhum clique.
- Primeira visita (sem SW anterior): nao recarrega.

## 8. Casos de borda
Duas abas abertas (as duas passam para a versao nova, sem loop); offline no momento do deploy (fica na versao em cache ate voltar a internet); reload no meio de um formulario (aceito: dados persistidos ficam; texto digitado e nao salvo pode se perder).

## 5-6, 9-12
N/A: sem papeis, sem entidades, sem UI nova (so remove o aviso). Prioridade: must. Premissa confirmada: Pontin quer sem botao.

## Adendo 2026-09-28 18:30 (print do Pontin: insignia da Gatinha ainda em tira + texto de obtencao na descricao)
- U3 Cache das imagens: o servidor ja serve 16x16, mas `/assets/(.*)` sai com `Cache-Control: immutable, max-age=1 ano` (vercel.json) e o SW guarda `/assets/items/` em CacheFirst; o caminho nao tem versao, entao quem ja tinha a tira nunca busca de novo. Correcao: o pipeline grava cada caminho de asset referenciado pelo dataset com `?v=<hash curto do conteudo>` (itens, bolas e qualquer outro asset do dataset que possa mudar de conteudo no mesmo caminho). O frontend deve preservar a query.
- U4 Descricoes curadas (282) sem informacao de obtencao (Pontin: "o texto de como obter ta aparecendo na descricao do item"). Descricao = o que o item e / para que serve; obtencao fica so em "Como obter". Textos do jogo nao mudam.
- U5 Como obter com loot de treinador (Pontin aprovou nesta branch): o pipeline le as loot tables de treinador do kubejs (ex. insignia da Gatinha -> Satherov) e publica uma fonte "Drop de treinador" no `obtain`, mostrada no mesmo visual das outras fontes. Hoje a insignia mostra "Sem rota confirmada", contradizendo o fato.
- U6 Uma unica republicacao do dataset + testes completos, depois de U1..U5.
