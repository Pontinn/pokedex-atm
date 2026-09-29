# LESSONS (memoria institucional do projeto; regras curtas, sem segredos)

Lidas por forge-prd, forge-spec, forge-review, forge-imp-backend e forge-imp-frontend. Uma regra aqui vence o padrao do agente.

## 2026-09-29 - spawn-bait (iscas de spawn)

- Lista "ilustrativa" virou requisito incompleto (a linha de reforcos tinha 5 itens; a regra selecionava 7) -> quando um requisito seleciona itens por REGRA, o PRD cita a regra e a SPEC/teste DERIVAM a lista dos dados; nunca listar a mao sem conferir com um grep nos arquivos do pack.
- O campo de multiplicador do Cobblemon vem em duas formas (`weightMultiplier` objeto e `weightMultipliers` lista) e o PRD so cobria uma -> ao tipar um campo do jogo, grep pelo singular e pelo plural (e por variantes de nome) em todo o spawn_pool_world antes de fechar o contrato.
- Mudar o contrato (schema zod estrito) sem republicar o dataset quebra join.test/published-schemas e o app ate a republicacao -> toda feature que muda o contrato planeja a "janela quebrada": quais testes ficam excluidos ate a republicacao, e o frontend so comeca depois do dataset novo publicado.
- "Sem textura no snapshot" foi afirmado sem conferir o texture-manifest -> antes de dizer que falta midia/lang de um item, conferir `texture-manifest.json`, `public/assets/items` e as chaves `item.`/`block.` no lang.
- Dois testes e2e antigos ja falhavam na main por timing (grade virtual corrigindo o scroll; grade medida durante a animacao) -> na Stage 4, rodar a suite completa uma vez ANTES de implementar (ou provar na main via worktree) para separar flake preexistente de regressao; corrigir flake pela causa, nunca afrouxando o assert.
- A instancia real do pack esta neste PC (CurseForge, pasta "All the Mons - ATMons") e o jar vanilla 1.21.1 em `Install/versions/` -> a checagem byte a byte e a copia de assets para o snapshot sao sempre possiveis aqui; registrar toda copia em `MANIFEST.json additions` e no `data-source/README.md`.
