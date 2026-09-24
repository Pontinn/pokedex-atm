// Implementacao unica do StorageAdapter (SPEC 5.3) sobre um backend de documentos trocavel:
// IndexedDB (Fase 1), memoria (fallback sem IndexedDB) e arquivo (Fase 2).
import { canonicalJson, crc32Hex } from "./crc32";
import { CURRENT_SCHEMA_VERSION, DOC_KEYS, USER_DOC_KEYS, appVersion, defaultDoc } from "./defaults";
import { toStorageError, StorageFailure } from "./errors";
import { runMigrations, type Migration, type MigrationOutcome } from "./migrations";
import { createV1FromPrototypeMigration, type LegacyStorage } from "./migrations/v1-from-prototype-localstorage";
import { docSchemas, validateDoc } from "./validate";
import { createWriteQueue } from "./write-queue";
import type { BackupFile, DocKey, DocMap, SafetySnapshot, StorageAdapter } from "./types";

export interface DocRecord {
  key: string;
  doc: unknown;
}

/** Operacoes primitivas; `putDocs` e atomica (tudo ou nada). */
export interface StorageBackend {
  open(onNotice: (n: StorageNotice) => void): Promise<void>;
  getDoc(key: string): Promise<unknown>;
  /** grava todos os registros numa transacao; `lastWriteAt != null` tambem atualiza meta.lastWriteAt na MESMA transacao */
  putDocs(records: DocRecord[], lastWriteAt: number | null): Promise<void>;
  getBackup(id: string): Promise<SafetySnapshot | undefined>;
  listBackups(): Promise<SafetySnapshot[]>;
  putBackup(snapshot: SafetySnapshot): Promise<void>;
  clearBackups(): Promise<void>;
  close(): void;
}

export type StorageNotice =
  | { kind: "corrupt"; key: DocKey; snapshotId: string }
  | { kind: "repaired"; key: DocKey }
  | { kind: "blocked" }
  | { kind: "readOnly"; storedVersion: number }
  | { kind: "memoryFallback" };

export interface StorageOptions {
  now?: () => number;
  migrations?: readonly Migration[];
  legacyStorage?: LegacyStorage | null;
  onNotice?: (n: StorageNotice) => void;
}

function defaultLegacyStorage(): LegacyStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export class DocumentStorage implements StorageAdapter {
  readOnly = false;
  migration: MigrationOutcome | null = null;
  readonly notices: StorageNotice[] = [];
  private readonly queue = createWriteQueue();
  private readonly now: () => number;
  private readonly migrations: readonly Migration[];
  private readonly onNotice?: (n: StorageNotice) => void;

  constructor(
    protected readonly backend: StorageBackend,
    opts: StorageOptions = {},
  ) {
    this.now = opts.now ?? Date.now;
    const legacy = opts.legacyStorage === undefined ? defaultLegacyStorage() : opts.legacyStorage;
    this.migrations = opts.migrations ?? [createV1FromPrototypeMigration(legacy)];
    this.onNotice = opts.onNotice;
  }

  protected notify(n: StorageNotice): void {
    this.notices.push(n);
    this.onNotice?.(n);
  }

  async init(): Promise<void> {
    try {
      await this.backend.open((n) => this.notify(n));
    } catch (e) {
      throw toStorageError(e);
    }
    this.migration = await runMigrations(
      {
        readMeta: () => this.read("meta"),
        readUserDocs: () => this.readUserDocs(),
        putSnapshot: (s) => this.backend.putBackup(s),
        commit: (docs) => this.backend.putDocs(toRecords(docs), null),
      },
      this.migrations,
      { now: this.now() },
    );
    if (this.migration.status === "readOnly") {
      this.readOnly = true;
      this.notify({ kind: "readOnly", storedVersion: this.migration.from });
    }
  }

  async read<K extends DocKey>(key: K): Promise<DocMap[K] | null> {
    const raw = await this.backend.getDoc(key);
    if (raw === undefined) return null;
    const result = validateDoc(key, raw);
    if (result.ok) {
      if (result.repaired) {
        console.warn(`[storage] doc "${key}" repaired`);
        this.notify({ kind: "repaired", key });
      }
      return result.doc;
    }
    // Irreparavel: isola uma copia em `backups` e troca pelo padrao (nunca silencioso).
    const ts = this.now();
    const snapshotId = `corrupt-${key}-${ts}`;
    await this.backend.putBackup({
      id: snapshotId,
      createdAt: ts,
      version: CURRENT_SCHEMA_VERSION,
      docs: { [key]: raw } as Partial<DocMap>,
    });
    const fallback = defaultDoc(key, ts);
    if (!this.readOnly) await this.queue.run(() => this.backend.putDocs([{ key, doc: fallback }], null));
    console.warn(`[storage] doc "${key}" corrupted, isolated as ${snapshotId}`);
    this.notify({ kind: "corrupt", key, snapshotId });
    return fallback;
  }

  /** Doc gravado ou o padrao quando ausente. */
  async readOrDefault<K extends DocKey>(key: K): Promise<DocMap[K]> {
    return (await this.read(key)) ?? defaultDoc(key, this.now());
  }

  async readAll(): Promise<Partial<DocMap>> {
    const out: Partial<DocMap> = {};
    for (const key of DOC_KEYS) {
      const doc = await this.read(key);
      if (doc !== null) (out as Record<string, unknown>)[key] = doc;
    }
    return out;
  }

  private async readUserDocs(): Promise<Partial<DocMap>> {
    const all = await this.readAll();
    delete all.meta;
    return all;
  }

  private guardWritable(): void {
    if (this.readOnly) throw new StorageFailure("UNAVAILABLE", "storage is read-only (data from a newer app version)");
  }

  write<K extends DocKey>(key: K, doc: DocMap[K]): Promise<void> {
    return this.writeMany({ [key]: doc } as Partial<DocMap>);
  }

  async writeMany(docs: Partial<DocMap>): Promise<void> {
    this.guardWritable();
    for (const [key, doc] of Object.entries(docs)) {
      // Escrita e estrita (sem reparo): um doc invalido aqui e bug do chamador.
      const r = docSchemas[key as DocKey]?.safeParse(doc);
      if (!r || !r.success) throw new StorageFailure("UNKNOWN", `refusing to write invalid doc "${key}"`);
    }
    const records = toRecords(docs);
    if (records.length === 0) return;
    await this.queue.run(async () => {
      try {
        await this.backend.putDocs(records, this.now());
      } catch (e) {
        throw toStorageError(e);
      }
    });
  }

  /** Volta os docs ao padrao (nunca apaga o store; meta e mantido). */
  async delete(keys: DocKey[]): Promise<void> {
    const docs: Partial<DocMap> = {};
    for (const key of keys) {
      if (key !== "meta") (docs as Record<string, unknown>)[key] = defaultDoc(key, this.now());
    }
    await this.writeMany(docs);
  }

  async exportSnapshot(): Promise<BackupFile> {
    const documents = await this.readAll();
    const meta = documents.meta;
    return {
      app: "pontindex",
      format: 1,
      schemaVersion: meta?.schemaVersion ?? CURRENT_SCHEMA_VERSION,
      appVersion: appVersion(),
      datasetVersion: meta?.datasetVersionSeen ?? null,
      exportedAt: this.now(),
      documents,
      crc32: crc32Hex(canonicalJson(documents)),
    };
  }

  /** Substitui os docs de usuario pelos do arquivo (ja validado/migrado por backup.ts); meta local e mantido. */
  async importSnapshot(b: BackupFile): Promise<void> {
    const docs: Partial<DocMap> = {};
    for (const key of USER_DOC_KEYS) {
      const doc = b.documents[key];
      if (doc !== undefined) (docs as Record<string, unknown>)[key] = doc;
    }
    await this.writeMany(docs);
  }

  listSnapshots(): Promise<SafetySnapshot[]> {
    return this.backend.listBackups();
  }

  /** DOWN (SPEC 5b.3): regrava os docs do snapshot e meta.schemaVersion = snapshot.version. */
  async restorePreMigrationSnapshot(id: string): Promise<void> {
    const snapshot = await this.backend.getBackup(id);
    if (!snapshot) throw new StorageFailure("UNKNOWN", `snapshot not found: ${id}`);
    const meta = (await this.read("meta")) ?? defaultDoc("meta", this.now());
    const docs: Partial<DocMap> = { ...snapshot.docs, meta: { ...meta, schemaVersion: snapshot.version } };
    await this.queue.run(() => this.backend.putDocs(toRecords(docs), this.now()));
    this.readOnly = false;
  }

  clearSnapshots(): Promise<void> {
    return this.queue.run(() => this.backend.clearBackups());
  }

  close(): void {
    this.backend.close();
  }
}

function toRecords(docs: Partial<DocMap>): DocRecord[] {
  return Object.entries(docs)
    .filter(([, doc]) => doc !== undefined)
    .map(([key, doc]) => ({ key, doc }));
}

// ---------------------------------------------------------------------------
// Backend em memoria: fallback sem IndexedDB (aviso persistente) e testes.
// ---------------------------------------------------------------------------

export class MemoryBackend implements StorageBackend {
  private docs = new Map<string, unknown>();
  private backups = new Map<string, SafetySnapshot>();

  async open(): Promise<void> {}
  async getDoc(key: string): Promise<unknown> {
    const v = this.docs.get(key);
    return v === undefined ? undefined : structuredClone(v);
  }
  async putDocs(records: DocRecord[], lastWriteAt: number | null): Promise<void> {
    const next = new Map(this.docs);
    for (const r of records) next.set(r.key, structuredClone(r.doc));
    if (lastWriteAt !== null) {
      const meta = next.get("meta");
      if (meta && typeof meta === "object") next.set("meta", { ...meta, lastWriteAt });
    }
    this.docs = next;
  }
  async getBackup(id: string): Promise<SafetySnapshot | undefined> {
    const v = this.backups.get(id);
    return v && structuredClone(v);
  }
  async listBackups(): Promise<SafetySnapshot[]> {
    return [...this.backups.values()].map((s) => structuredClone(s));
  }
  async putBackup(snapshot: SafetySnapshot): Promise<void> {
    this.backups.set(snapshot.id, structuredClone(snapshot));
  }
  async clearBackups(): Promise<void> {
    this.backups.clear();
  }
  close(): void {}
}

export class MemoryAdapter extends DocumentStorage {
  constructor(opts: StorageOptions = {}) {
    super(new MemoryBackend(), opts);
  }
}
