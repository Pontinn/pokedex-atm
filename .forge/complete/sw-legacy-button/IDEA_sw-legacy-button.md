---
feature: sw-legacy-button
language: pt-BR
type: fix
status: done
mode: quick
created: 2026-09-28
---
# Botao "Atualizar" antigo sem efeito (quick)
Pontin (2026-09-28): fora da aba anonima aparece o botao Atualizar, clica e nada acontece; tudo igual antes.
Causa (confirmada no codigo antigo, `git show dfac0441^:src/pwa/update-store.ts`): o `applyPwaUpdate` antigo so registra o listener de `controllerchange` NO CLIQUE e manda `SKIP_WAITING` ao SW em espera. O SW novo (autoUpdate, skipWaiting + clientsClaim) ja assumiu sozinho antes do clique, entao o `controllerchange` ja passou e a pagina antiga nunca recarrega.
Correcao: o SW novo trata a mensagem `{ type: "SKIP_WAITING" }` vinda de uma aba: chama `skipWaiting()` (inofensivo) e recarrega a aba de origem (`client.navigate(client.url)` ou equivalente). Assim o botao antigo passa a funcionar na transicao. Nada muda para quem ja esta na versao nova.
Escopo: so o SW (vite.config.ts / script importado pelo workbox) + teste. Nao mexer em dados nem telas.
Pontin autorizou merge na main e push quando os testes passarem.

## Adendo: link do portfolio (Pontin, 2026-09-28)
- URL: https://portfolio.pontin.dev (responde 200).
- "Tem que ser um lugar que apareca sempre mas sem atrapalhar." Escolha do Pontin: rodape lateral + card Sobre.
- Desktop: linha discreta "Feito por Pontin" com icone de link externo no rodape da barra lateral (`.sidebar-foot`, abaixo de "Dados: ..."). Mobile (barra lateral some): a mesma linha pequena no FIM do conteudo de cada tela (nao flutua, nao cobre nada) e no sheet "Mais". Configuracoes: card "Sobre" com "Pontindex, feito por Pontin." e o botao "Ver meu portfolio". Abre em nova aba (`target="_blank" rel="noopener"`). PT e EN.
