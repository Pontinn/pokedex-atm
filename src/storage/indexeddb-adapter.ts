// Backend IndexedDB (idb): stores `documents` (keyPath key) e `backups` (keyPath id). SPEC 5.3 / B7.1.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { toStorageError } from "./errors";
import {
  DocumentStorage,
  MemoryAdapter,
  type DocRecord,
  type StorageBackend,
  type StorageNotice,
  type StorageOptions,
} from "./storage-adapter";
import type { SafetySnapshot } from "./types";

export const DB_NAME = "pontindex";
/** So muda quando a estrutura de stores muda; a versao dos documentos e meta.schemaVersion. */
export const DB_VERSION = 1;

interface PontindexDb extends DBSchema {
  documents: { key: string; value: DocRecord };
  backups: { key: string; value: SafetySnapshot };
}

export class IndexedDbBackend implements StorageBackend {
  private db: IDBPDatabase<PontindexDb> | null = null;

  constructor(private readonly name: string = DB_NAME) {}

  async open(onNotice: (n: StorageNotice) => void): Promise<void> {
    this.db = await openDB<PontindexDb>(this.name, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("documents")) db.createObjectStore("documents", { keyPath: "key" });
        if (!db.objectStoreNames.contains("backups")) db.createObjectStore("backups", { keyPath: "id" });
      },
      blocked() {
        onNotice({ kind: "blocked" });
      },
      blocking: () => {
        // Outra aba quer uma versao nova do banco: libera a conexao.
        this.db?.close();
      },
    });
  }

  private get conn(): IDBPDatabase<PontindexDb> {
    if (!this.db) throw toStorageError(Object.assign(new Error("database not open"), { name: "InvalidStateError" }));
    return this.db;
  }

  async getDoc(key: string): Promise<unknown> {
    const rec = await this.conn.get("documents", key);
    return rec?.doc;
  }

  async putDocs(records: DocRecord[], lastWriteAt: number | null): Promise<void> {
    const tx = this.conn.transaction("documents", "readwrite");
    const done = tx.done;
    done.catch(() => undefined);
    const pending: Promise<unknown>[] = [];
    try {
      const store = tx.objectStore("documents");
      let metaRecord: DocRecord | undefined = records.find((r) => r.key === "meta");
      if (lastWriteAt !== null && !metaRecord) metaRecord = await store.get("meta");
      for (const r of records) {
        if (r.key === "meta") continue;
        const p = store.put({ key: r.key, doc: r.doc });
        p.catch(() => undefined);
        pending.push(p);
      }
      if (metaRecord && metaRecord.doc && typeof metaRecord.doc === "object") {
        const doc = lastWriteAt === null ? metaRecord.doc : { ...metaRecord.doc, lastWriteAt };
        const p = store.put({ key: "meta", doc });
        p.catch(() => undefined);
        pending.push(p);
      }
      await Promise.all(pending);
      await done;
    } catch (e) {
      try {
        tx.abort();
      } catch {
        // ja abortada
      }
      throw toStorageError(e);
    }
  }

  async getBackup(id: string): Promise<SafetySnapshot | undefined> {
    return this.conn.get("backups", id);
  }

  async listBackups(): Promise<SafetySnapshot[]> {
    return this.conn.getAll("backups");
  }

  async putBackup(snapshot: SafetySnapshot): Promise<void> {
    await this.conn.put("backups", snapshot);
  }

  async clearBackups(): Promise<void> {
    await this.conn.clear("backups");
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }
}

export class IndexedDbAdapter extends DocumentStorage {
  constructor(opts: StorageOptions & { dbName?: string } = {}) {
    super(new IndexedDbBackend(opts.dbName), opts);
  }
}

/** IndexedDB quando existe; senao MemoryAdapter com aviso persistente "seus dados nao serao salvos". */
export function createStorageAdapter(opts: StorageOptions & { dbName?: string } = {}): DocumentStorage {
  if (typeof indexedDB === "undefined" || indexedDB === null) {
    const adapter = new MemoryAdapter(opts);
    queueMicrotask(() => opts.onNotice?.({ kind: "memoryFallback" }));
    adapter.notices.push({ kind: "memoryFallback" });
    return adapter;
  }
  return new IndexedDbAdapter(opts);
}
