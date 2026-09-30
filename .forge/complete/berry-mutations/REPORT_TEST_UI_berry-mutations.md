# REPORT_TEST_UI berry-mutations (Stage 5 enxuto)

Data: 2026-09-30. Branch feature/berry-mutations. Build + `vite preview` local (porta 4173), Playwright headless, sem slowMo e sem esperas fixas. Sem backend, sem login, sem endpoint novo (o contrato do dataset ja foi testado). Pulado por decisao do usuario (ja registrado por T1.6): vitest completo, Playwright completo, typecheck, lint, audit, byte a byte do dataset.

## 1. Decisao de flake (branch feature/berry-mutations)

| Alvo | Execucoes | Passaram |
|---|---|---|
| detail-screen.test.tsx + bait.test.ts (21 testes) | 10 | 10/10 |
| items-screen.test.tsx (4 testes) | 10 | 10/10 |

Nenhum teste foi alterado. Obs: com `--coverage` restrito a 3 arquivos o vitest sai com codigo 1 so pelos limiares globais de cobertura (esperado ao restringir); todos os testes passaram em todas as rodadas (conferido pela linha "Tests N passed"). O flake 1/5 do items-screen visto na main em rodada completa nao reproduziu aqui.

## 2. Smoke de UI

Paginas de item: Sitrus, Liechi, Enigma, Cheri, Occa, Eggant, Red Apricorn e Adamant Mint em 9 combinacoes largura/tema/idioma: 1280 classic PT, 1280 classic EN, 390 classic PT, 390 classic EN, 360 classic PT, 1280 black EN, 390 black PT, 1280 green PT, 390 blue EN.

| Verificacao | Resultado |
|---|---|
| "Encontrada no mundo" so nas mundo (Cheri, Occa, Liechi); Sitrus, Enigma e Eggant sem; Liechi mostra Mirage Ilha | OK |
| "Cresce melhor em" em todas as bagas | OK |
| "Como cruzar" nas bagas de mutacao (Sitrus, Liechi, Enigma, Eggant); Cheri e Occa sem | OK |
| Enigma: Hopo + 18 parceiras todas visiveis, sem `.ob-more`, sem overflow em 360/390 | OK |
| Chance "12,5% por colheita; 50% com [Adubo Surpresa]" com link e espaco real, PT e EN | OK |
| "Usada em cruzamento" no painel Usado em das bagas ingrediente (Sitrus 1, Enigma 2, Cheri 2, Occa 2) | OK |
| Red Apricorn e Adamant Mint: linha `plantable` como antes, sem berryWorld/berryGrowth/mutation | OK |
| Clicar numa parceira (Starf -> Pomeg) abre a pagina; Voltar volta a Starf | OK (1280, 390, 360) |
| Listagem: 70 cards na aba Berries, todos com tag de origem, Liechi com as duas, `.item-tag` unico por card | OK |
| Iscas: as 70 bagas com tag, nao-bagas sem; busca "ber": bagas todas com tag | OK |
| Filtro Todos/Mutacao/Mundo = 70/40/31; com filtro ativo nenhuma aba mostra nao-baga; "Todos" devolve a contagem original de todas as 14 abas | OK |
| Filtro + aba restaurados apos abrir item e Voltar | OK |
| Console sem erro, sem HTTP >= 400, sem overflow horizontal (documento e #main) em 360/390/1280 | OK |

Visual: screenshots em `ui-refs/test-*.png` (15) comparadas com `after-*` e `recon-*`. Sem deriva de identidade: mesmo painel/linha de "Como obter", mesmas pilulas, tag de origem discreta abaixo do nome, filtro em pilula acima das abas, cores legiveis em classic, black e green (texto colorido com contraste bom).

## 3. Achados

Nenhum Critical, High, Medium ou Low aberto.

Observacao informativa (sem severidade): a contagem "20 botoes" na linha Como cruzar do Enigma = Hopo fixa + 18 parceiras + link do Adubo Surpresa; consistente com "Hopo + 18" do checklist manual.

## 4. Limpeza

Servidor de preview encerrado; `src/assets/types/*.svg` e `src/styles/types.generated.css` (regeneracao so de fim de linha pelo prebuild) restaurados com git checkout. Sem dados de teste criados (contextos Playwright descartaveis). `.vite/` untracked ja existia antes.

## 5. Itens do checklist manual que ficam para o usuario

Julgamento humano ou aparelho real, nao marcados: leitura do texto do Lum, repeticao dos biomas Occa (world x growth), Voltar do gesto do celular, Enigma/Hopo em 360 px no celular real, toggle PT/EN do card, olhar 2-3 nao-baga, filtro no celular como faixa de largura total (e se nao confunde com as abas).

Definicao de pronto do Stage 5: sem Critical/High aberto; restam apenas os itens manuais acima.
