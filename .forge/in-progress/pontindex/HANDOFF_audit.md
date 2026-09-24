# HANDOFF audit (A1)

## Rodada 2
- Inicio: 2026-09-24 18:15
- Fim: 2026-09-24 18:24
- Status: concluida. Ferramenta corrigida (f5dce003): comparacao de habilidades por pares id+oculta num unico check; colisao de spawn pela semantica de datapack (kubejs vence jar; entre jars vence o mod que carrega depois pelo fecho transitivo de AFTER/BEFORE dos `neoforge.mods.toml`; par sem ordem = categoria `SEM ORDEM`, somado). Rodada contra `public/data/atm1.3.0-cobblemon1.7.3-20260924-1344fc8b` (f5b0d0f0 + 19a7cd3d): 42992 checks, 1027 fichas, 0 divergencias em todas as severidades. 26 colisoes de spawn resolvidas pela ordem de carga, 0 SEM ORDEM.
- Conferencia manual: 50 da amostra + 28 especies das correcoes da rodada 1 (`manual.ts --species ...`), 0 linhas divergentes.
- Em aberto (sem divergencia automatica, ver topo do AUDIT_REPORT.md): (1) SPEC x JOGO Meltan: evolucao por doce do legendarymonuments apagada pelo `evolutions: []` do kubejs `zzz_ccc_meltan.json`, depende da ordem/merge de `species_additions` no Cobblemon; (2) limitacao: additions entre jars aplicadas na ordem da SPEC 5.1.1, conflitos reais so em campos nao publicados + Meltan; (3) texto da SPEC 5.1.2 nao lista o legendarymonuments.

## Rodada 1
- Inicio: 2026-09-24 17:15
- Fim: 2026-09-24 ~18:05
- Status: fase 1 concluida (cd96c8ac, 46276574, 61bd92cd); fase 2 rodada contra public/data/atm1.3.0-cobblemon1.7.3-20260924-5b4a9ffa. Relatorio: tools/dataset/audit/AUDIT_REPORT.md (6d99aa07). 44489 checks, 1027 fichas: WRONG DATA 144, MISSING 2, SPEC x JOGO 5, COSMETIC 242.

## Ferramenta
- `tools/dataset/audit/raw.ts`: leitura crua + `loadOrder(src)` (parser de `neoforge.mods.toml`, fecho transitivo).
- `tools/dataset/audit/expected.ts`: esperado derivado SO do snapshot cru (regras SPEC 5.1.2-5.1.5, B2.2-B2.4, B4.3, B5.x).
- `tools/dataset/audit/compare.ts`: compara com `public/data/<ver>/`.
- `tools/dataset/audit/run.ts`: `npx tsx tools/dataset/audit/run.ts [dir|current.json]` grava `AUDIT_REPORT.md` (a secao "Rodada 2" do topo foi escrita a mao; rerodar sobrescreve).
- `tools/dataset/audit/manual.ts`: dump cru x publicado das 50 especies de `sample.ts` ou de `--species a,b,c` (`--out` muda o arquivo; `manual-dump.txt` e gerado, nao versionado).
- Testes: `tests/unit/dataset/audit.test.ts` (12 verdes).

## Achados ja confirmados no cru (independem do dataset)
- 51 `species_additions` do legendarymonuments (namespaces `cobblemon_drops` e `legendarymonuments`) valem no jogo e nao estao na lista da SPEC 5.1.2.
- 12 arquivos `spawn_pool_world` com `enabled:false`; 5 arquivos de jar sombreados pelo kubejs; 26 caminhos de spawn repetidos entre jars, todos com ordem de carga declarada (Staryu -> allthemons, Floette -> zamega, 24 -> ccc sobre mega_showdown).
- Series: com semantica E-de-OU em `requiredDefeats`, as 5 series batem 100% (contagem e ordem).
