# Checklist pwa-auto-update (quick)
- [x] U1 SW em autoUpdate (skipWaiting + clientsClaim), reload unico automatico, UpdatePrompt removido; unit + e2e pwa-offline adaptados (update sem clique, offline, dados preservados, sem loop); build ok. (dfac0441)
- [x] U2 PRD/SPEC do pontindex com nota de revisao do F12.1. (8726584e)
- [x] U1b Recarregar uma vez quando um chunk antigo falhar (`vite:preloadError`), cobrindo a aba antiga na primeira troca.
- [ ] U3 Paths de asset do dataset com `?v=<hash>` (cache busting).
- [x] U4 282 descricoes curadas sem obtencao. (284 ids, 208 reescritas) `009c1b55`
- [ ] U5a Pipeline: loot de treinador do kubejs no `obtain`.
- [ ] U5b Frontend: fonte "Drop de treinador" no Como obter.
- [ ] U7a Receitas de todos os namespaces + remocoes do kubejs + conditions.
- [ ] U7b Loot tables de todos os namespaces.
- [ ] U7c FTB Quests, loja BP, estruturas .nbt, loot modifiers, rituais, interactions, tera shard.
- [ ] U7d Catalogo sem ids fantasma; fonte `unobtainable`; zero `none`.
- [ ] U7e Frontend: fontes novas (inclui U5b) no Como obter.
- [ ] U6 Republicar dataset + testes completos + smoke.
## Notas
- U1: pwa-offline.spec.ts --repeat-each=3 21/21 (producao); vitest completo 476 ok, 1 suite falha so no run paralelo (tests/unit/dataset/join.test.ts, ENOTEMPTY/EPERM em tools/dataset/out, passa sozinha; outro agente mexendo em tools/dataset no mesmo working tree).
## Bugs encontrados
