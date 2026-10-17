# CHECKLIST - natures-lang (quick)

- [x] N1 toggle PT | EN na pagina Naturezas via termos do jogo (useTermsLanguage("natures") + TermsToggle), foco simetrico, unit + e2e + capturas, gates verdes (b2f6a908)

## Bugs found

## Notes
- 2026-10-17 N1 (b2f6a908): typecheck 0, lint 0, vitest 98 arquivos / 843 testes; e2e natures + shell + responsive 53/53 (PW_DEV=1 PW_PORT=4193, fora das portas 5173/4173). Console limpo em PT e EN.
- Toggle no page-head (o Balls usa page-tools; aqui segue a IDEA). O page-head da pagina ja tinha space-between, sem CSS novo; nt-focus-en virou nt-focus-alt.
- No-overlap: o teste "no overlap" ja varre .natures-screen inteiro (toggle incluso); teste novo dedicado a 360 com EN + foco.
- Leitura do idioma para o porte oficial: NatureTable.tsx:15, NatureByStat.tsx:14, NatureFocus.tsx:11 (useTermsLanguage("natures")); toggle em NaturesScreen.tsx:44.
