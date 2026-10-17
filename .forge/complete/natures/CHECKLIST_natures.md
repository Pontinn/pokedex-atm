# CHECKLIST - natures (quick)

Marcar `[x]` + hash do commit quando VERDE (build + render sem erro de console + testes do item).

- [x] F1 nav + registro + i18n + tela vazia; testes de shell ajustados (20790eac)
- [x] F2 natures-model + Tabela 5x5 + NatureFocus + natures.css; unit do modelo (1088ad09)
- [x] F3 visao Por status (chips + faixas + neutras); unit de render da tela (70b535a0)
- [x] F4 celular 360 sem sobreposicao, temas, a11y, painel compacto (a483aa6c; line-height dos botoes da tabela/faixas corrigido no T1 pelo harness no-overlap)
- [x] T1 e2e natures.spec + capturas 1280/360 em .forge/ideas/natures/captures/ + suite completa, typecheck, lint, build verdes (ae2985b0; vitest 98 arquivos/842 testes; e2e build+preview 317 passed/16 skipped; natures.spec 16/16; responsive.spec sem baseline regenerada)

## Bugs found

- (T1) harness no-overlap pegou nome + marca "neutra" e as duas linhas do canto da tabela com line-height 1.15/1.2: subido para 1.3/1.4.
- (T1) `data-stat` repetido no container das faixas colidia com os chips no seletor do e2e: container passou a `data-band-stat`.

## Notes

- Icone: `Smile` (lucide), exportado em Icon.tsx. Item logo depois de `types` em SIDEBAR_ITEMS; no celular entra na folha "Mais".
- Seletores `.nth(` deslocados pelo item novo trocados por `[data-nav=...]`: shell.spec (Itens no sheet e na sidebar), sync.spec (sheet e sidebar), pwa-offline.spec (openSync). types.spec, shell.spec e shell.test listas atualizadas com "Naturezas".
- Diagonal da grade: a natureza neutra herda o `up` do seu bloco de 5 em NATURES (dominio intocado); `neutralStat` no modelo.
- Selecao fica em `select.ts` (selectNature), como `selectType` de TypePicker.
- Arquivos para o porte ao pontindex: src/screens/Natures/{NaturesScreen,NatureTable,NatureFocus,NatureByStat}.tsx, natures-model.ts, select.ts, natures.css; src/i18n/messages/natures-page.ts; edicoes em src/navigation/types.ts, src/screens/registry.ts, src/components/nav-items.ts, src/components/Icon.tsx, src/i18n/messages.ts; testes tests/unit/ui-screens/natures-{model,screen}.test.ts(x), tests/e2e/natures.spec.ts e ajustes de lista/nth em shell.spec, types.spec, sync.spec, pwa-offline.spec, shell.test.
- Fix pos-T1 (0dae0f3f): na tabela a 360 px, celulas da 1a coluna de dados apareciam cortadas entre a coluna fixa e a seguinte depois de rolar, e o rotulo do canto era cortado. Coluna fixa opaca (sem border-spacing), larguras fixas no celular, container com largura de colunas inteiras (round) e scroll-snap; e2e "phone table scroll" (360/390) confere que nenhuma celula fica cortada com a tabela rolada ate o fim. Capturas refeitas + table-360-scrolled.png.
