// Contrato compartilhado da persistencia local (SPEC secao 5.3).
// Escrito completo na Onda 0 (B1.5) e CONGELADO durante as Ondas 1 e 1b.
// Somente tipos: DOC_DEFAULTS, CURRENT_SCHEMA_VERSION, adapter e repositorios ficam em B7.1.
import type { ThemeId } from "../styles/themes";

export type UiLanguage = "pt" | "en";

export type DocKey = "captured" | "team" | "history" | "trainerProgress" | "preferences" | "meta";

export interface CapturedDoc {
  schemaVersion: 1;
  /** chave = String(dex) */
  entries: Record<string, { capturedAt: number }>;
}

export interface TeamDoc {
  schemaVersion: 1;
  /** sempre length 6; null = slot vazio */
  slots: (number | null)[];
}

export interface HistoryEntry {
  dex: number;
  viewedAt: number;
}

export interface HistoryDoc {
  schemaVersion: 1;
  /** max 20, [0] = mais recente */
  entries: HistoryEntry[];
}

export interface SeriesProgress {
  defeated: Record<string, { at: number }>;
}

export interface TrainerProgressDoc {
  schemaVersion: 1;
  activeSeriesId: string | null;
  freeroam: { active: boolean; pausedSeriesId: string | null };
  series: Record<string, SeriesProgress>;
}

export interface PreferencesDoc {
  schemaVersion: 1;
  theme: ThemeId;
  uiLanguage: UiLanguage;
  termsLanguage: UiLanguage;
  termsOverrides: Record<string, UiLanguage>;
  soundEnabled: boolean;
  /** null = seguir o sistema */
  reduceMotion: boolean | null;
}

export interface MetaDoc {
  schemaVersion: number;
  createdAt: number;
  lastWriteAt: number;
  datasetVersionSeen: string | null;
  appVersion: string;
}

export interface DocMap {
  captured: CapturedDoc;
  team: TeamDoc;
  history: HistoryDoc;
  trainerProgress: TrainerProgressDoc;
  preferences: PreferencesDoc;
  meta: MetaDoc;
}

/** Arquivo de backup (RF-98), salvo como pontindex-backup-<yyyy-mm-dd>.json. */
export interface BackupFile {
  app: "pontindex";
  format: 1;
  schemaVersion: number;
  appVersion: string;
  datasetVersion: string | null;
  exportedAt: number;
  documents: Partial<DocMap>;
  crc32: string;
}

/** Snapshot de seguranca no store `backups` ("pre-migration-*" ou "corrupt-*"). */
export interface SafetySnapshot {
  id: string;
  createdAt: number;
  version: number;
  docs: Partial<DocMap>;
}

export type StorageErrorCode = "QUOTA_EXCEEDED" | "BLOCKED" | "UNAVAILABLE" | "UNKNOWN";

export interface StorageError {
  code: StorageErrorCode;
  message: string;
  cause?: unknown;
}

/** Interface unica de persistencia (RF-95/RF-107); a Fase 2 troca por arquivo. */
export interface StorageAdapter {
  /** abre DB, roda migracoes, solicita persist() */
  init(): Promise<void>;
  read<K extends DocKey>(key: K): Promise<DocMap[K] | null>;
  readAll(): Promise<Partial<DocMap>>;
  /** atomico */
  write<K extends DocKey>(key: K, doc: DocMap[K]): Promise<void>;
  /** uma unica transacao (sync/backup/migracao) */
  writeMany(docs: Partial<DocMap>): Promise<void>;
  delete(keys: DocKey[]): Promise<void>;
  exportSnapshot(): Promise<BackupFile>;
  importSnapshot(b: BackupFile): Promise<void>;
}
