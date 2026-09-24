// Fachada publica da persistencia (SPEC 5.5).
export * from "./types";
export { CURRENT_SCHEMA_VERSION, DOC_DEFAULTS, DOC_KEYS, USER_DOC_KEYS, defaultDoc, defaultDocs } from "./defaults";
export { StorageFailure, isStorageError, toStorageError } from "./errors";
export { DocumentStorage, MemoryAdapter, MemoryBackend, type StorageNotice, type StorageOptions } from "./storage-adapter";
export { IndexedDbAdapter, IndexedDbBackend, createStorageAdapter, DB_NAME, DB_VERSION } from "./indexeddb-adapter";
export { filterKnown, toKnownSet, type KnownDex } from "./filter-known";
export { requestPersistence, getPersistenceResult } from "./persistence";
export { validateDoc } from "./validate";
export { runMigrations, applyMigrations, type Migration } from "./migrations";
export { createCapturedRepository, type CapturedItem } from "./repositories/captured";
export { createTeamRepository } from "./repositories/team";
export { createHistoryRepository } from "./repositories/history";
export { createTrainerProgressRepository } from "./repositories/trainer-progress";
export { createPreferencesRepository, type PreferencesPatch } from "./repositories/preferences";
