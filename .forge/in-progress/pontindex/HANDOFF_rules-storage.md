# HANDOFF - Onda 1, Regras e armazenamento (rules-storage)

Agente: forge-imp-backend (Onda 1, Regras e armazenamento). Inicio 2026-09-24 16:25. Fim: (em andamento)

| Feature | Status | Commit | Notas |
|---|---|---|---|
| B6.6 | verde | `07994a2f` | tests/unit/domain/history-team.test.ts (8) |
| B7.1 | verde | `34a1bd4c` | tests/unit/storage/storage.test.ts (17). API em `src/storage/index.ts` (ver secao B7.1) |
| B7.2 | pendente | | |
| B7.3 | pendente | | |
| B6.1 | pendente | | |
| B6.2 | pendente | | |
| B6.3 | pendente | | |
| B6.4 | pendente | | |
| B6.5 | pendente | | |
| B7.4 | pendente | | |

## B7.1 (pronto para a Onda 1b)

Importar de `src/storage` (fachada `src/storage/index.ts`):
- `createStorageAdapter(opts?)` -> `IndexedDbAdapter` (ou `MemoryAdapter` + notice `memoryFallback` sem IndexedDB). Chamar `await adapter.init()` no boot.
- Adapter (`DocumentStorage`): metodos do `StorageAdapter` + `readOrDefault(key)`, `readOnly`, `migration`, `notices`, `listSnapshots()`, `restorePreMigrationSnapshot(id)`, `clearSnapshots()`, `close()`. `opts.onNotice(n)` recebe `corrupt | repaired | blocked | readOnly | memoryFallback` (para toasts).
- `read(key)` devolve `null` quando o doc nunca foi gravado; repositorios ja usam o padrao (`DOC_DEFAULTS`/`defaultDoc`).
- Repositorios: `createCapturedRepository(adapter)` (`getAll/listKnown/has/add/remove`), `createTeamRepository` (`get/add/remove`, `add` devolve `{ok:false, reason:"full"}` no 7o), `createHistoryRepository` (`get/push`), `createTrainerProgressRepository` (`get/markDefeated/unmarkDefeated/setActiveSeries/enterFreeroam/leaveFreeroam`), `createPreferencesRepository` (`get/set(patch)`).
- `filterKnown(entries, datasetIndex)` (Set de dex ou array `{dex}`), `requestPersistence()` (chamar no 1o gesto), `getPersistenceResult()`.
- Erros de escrita: `StorageFailure` (`code` = `QUOTA_EXCEEDED | BLOCKED | UNAVAILABLE | UNKNOWN`); escrita em modo somente-leitura rejeita com `UNAVAILABLE`.

Decisoes B7.1:
- Sem `meta` no banco = instalacao nova = versao 0: roda a migracao 0->1 (importa `pontindex.terms`/`pontindex.sound` do localStorage se existirem, depois remove as chaves) SEM snapshot (nao ha dados). Com `meta.schemaVersion` antigo: snapshot `pre-migration-v<from>-<ts>` + migracao + commit numa transacao.
- `init()` NAO chama `navigator.storage.persist()`; isso fica em `requestPersistence()` (1o gesto, SPEC B7.1 passo 5).
- `writeMany` valida estrito com zod (sem reparo) e recusa doc invalido (`UNKNOWN`); a leitura e que repara.
- `delete(keys)` grava os padroes e ignora `meta`.
- `importSnapshot` grava so os docs de usuario (meta local mantido).
- Testes de storage/dominio rodam em ambiente node (`// @vitest-environment node`), pois o jsdom custa ~20 s de setup; fake-indexeddb carregado no proprio teste.
