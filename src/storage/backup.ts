// Backup exportar/importar (RF-97, RF-98) e "Apagar dados" (RF-122). SPEC 5.3 e B7.3.
import { z } from "zod";
import { mergeDocuments, type MergeMode } from "../sync/merge";
import { SyncError, type Result } from "../sync/types";
import { canonicalJson, crc32Hex } from "./crc32";
import { CURRENT_SCHEMA_VERSION, DOC_KEYS, USER_DOC_KEYS, defaultDoc } from "./defaults";
import { applyMigrations, type Migration } from "./migrations";
import { createV1FromPrototypeMigration } from "./migrations/v1-from-prototype-localstorage";
import type { DocumentStorage } from "./storage-adapter";
import { validateDoc } from "./validate";
import type { BackupFile, DocKey, DocMap, StorageAdapter } from "./types";

/** Limite do arquivo de backup (edge case B7.3). */
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export function exportBackup(adapter: StorageAdapter): Promise<BackupFile> {
  return adapter.exportSnapshot();
}

/** "pontindex-backup-<yyyy-mm-dd>.json" (data local). */
export function backupFileName(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `pontindex-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

export function serializeBackup(file: BackupFile): string {
  return JSON.stringify(file, null, 2);
}

const envelopeSchema = z.object({
  app: z.string(),
  format: z.number(),
  schemaVersion: z.number().int().nonnegative(),
  appVersion: z.string(),
  datasetVersion: z.string().nullable(),
  exportedAt: z.number(),
  documents: z.record(z.string(), z.unknown()),
  crc32: z.string().regex(/^[0-9a-f]{8}$/),
});

function fail(code: SyncError["code"], message?: string): Result<never, SyncError> {
  return { ok: false, error: new SyncError(code, message) };
}

export function parseBackup(text: string): Result<BackupFile, SyncError> {
  if (text.trim().length === 0) return fail("empty");
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) return fail("oversized");
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // BOM aceito
  let raw: unknown;
  try {
    raw = JSON.parse(clean);
  } catch {
    return fail("corrupted", "invalid json");
  }
  if (!raw || typeof raw !== "object" || (raw as { app?: unknown }).app !== "pontindex") return fail("foreignApp");
  const env = envelopeSchema.safeParse(raw);
  if (!env.success) return fail("corrupted", "invalid backup envelope");
  const file = env.data;
  if (file.format !== 1) return fail("corrupted", "unknown backup format");
  if (file.schemaVersion > CURRENT_SCHEMA_VERSION) return fail("unsupportedVersion");
  if (crc32Hex(canonicalJson(file.documents)) !== file.crc32) return fail("corrupted", "crc mismatch");
  const documents: Partial<DocMap> = {};
  for (const [key, doc] of Object.entries(file.documents)) {
    if (!DOC_KEYS.includes(key as DocKey)) continue; // chave desconhecida: ignorada
    const r = validateDoc(key as DocKey, doc);
    if (!r.ok) return fail("corrupted", r.reason);
    (documents as Record<string, unknown>)[key] = r.doc;
  }
  return { ok: true, value: { ...file, app: "pontindex", format: 1, documents } };
}

/** Migra (se antigo), mescla ou substitui e grava tudo com um unico writeMany. Meta local nunca e sobrescrito. */
export async function applyBackup(
  adapter: DocumentStorage,
  file: BackupFile,
  mode: MergeMode,
  opts: { migrations?: readonly Migration[] } = {},
): Promise<DocMap> {
  let incoming: Partial<DocMap> = { ...file.documents };
  delete incoming.meta;
  if (file.schemaVersion < CURRENT_SCHEMA_VERSION) {
    const migrations = opts.migrations ?? [createV1FromPrototypeMigration(null)];
    incoming = applyMigrations(incoming, file.schemaVersion, CURRENT_SCHEMA_VERSION, migrations).docs;
  }
  const local = {} as DocMap;
  for (const key of DOC_KEYS) (local as unknown as Record<string, unknown>)[key] = await adapter.readOrDefault(key);
  const merged = mergeDocuments(local, incoming, mode);
  const toWrite: Partial<DocMap> = {};
  for (const key of USER_DOC_KEYS) (toWrite as Record<string, unknown>)[key] = merged[key];
  await adapter.writeMany(toWrite);
  return merged;
}

/** Grava os padroes; "all" tambem limpa os snapshots de seguranca (`backups`). */
export async function deleteData(adapter: DocumentStorage, keys: DocKey[] | "all"): Promise<void> {
  const list: DocKey[] = keys === "all" ? [...USER_DOC_KEYS] : keys.filter((k) => k !== "meta");
  const docs: Partial<DocMap> = {};
  for (const key of list) (docs as Record<string, unknown>)[key] = defaultDoc(key);
  await adapter.writeMany(docs);
  if (keys === "all") await adapter.clearSnapshots();
}
