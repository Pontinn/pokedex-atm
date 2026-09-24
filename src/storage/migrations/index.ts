// Migracoes de esquema dos documentos (SPEC 5b.3): snapshot pre-migracao, `up` em cadeia em memoria,
// `writeMany` + meta em UMA transacao. Versao maior que a atual -> somente leitura.
import { CURRENT_SCHEMA_VERSION, defaultMeta } from "../defaults";
import type { DocMap, SafetySnapshot } from "../types";

export interface Migration {
  from: number;
  to: number;
  up(docs: Partial<DocMap>): Partial<DocMap>;
  /** roda so depois do commit (ex. remover chaves legadas) */
  afterCommit?(): void;
}

export interface MigrationTarget {
  readMeta(): Promise<DocMap["meta"] | null>;
  readUserDocs(): Promise<Partial<DocMap>>;
  putSnapshot(snapshot: SafetySnapshot): Promise<void>;
  /** grava docs + meta numa unica transacao */
  commit(docs: Partial<DocMap>): Promise<void>;
}

export type MigrationOutcome =
  | { status: "fresh"; from: 0; to: number }
  | { status: "current"; from: number; to: number }
  | { status: "migrated"; from: number; to: number; snapshotId: string | null }
  | { status: "readOnly"; from: number; to: number };

export function preMigrationSnapshotId(from: number, now: number): string {
  return `pre-migration-v${from}-${now}`;
}

export function applyMigrations(
  docs: Partial<DocMap>,
  from: number,
  to: number,
  migrations: readonly Migration[],
): { docs: Partial<DocMap>; applied: Migration[] } {
  let current = docs;
  const applied: Migration[] = [];
  for (let v = from; v < to; ) {
    const m = migrations.find((x) => x.from === v);
    if (!m || m.to <= v) throw new Error(`missing migration from schema v${v}`);
    current = m.up(current);
    applied.push(m);
    v = m.to;
  }
  return { docs: current, applied };
}

export async function runMigrations(
  target: MigrationTarget,
  migrations: readonly Migration[],
  opts: { now: number; current?: number },
): Promise<MigrationOutcome> {
  const current = opts.current ?? CURRENT_SCHEMA_VERSION;
  const meta = await target.readMeta();
  const from = meta ? meta.schemaVersion : 0;
  if (from > current) return { status: "readOnly", from, to: current };
  if (from === current) return { status: "current", from, to: current };

  const docs = await target.readUserDocs();
  let snapshotId: string | null = null;
  // Instalacao nova (sem meta) nao tem o que preservar; qualquer meta antigo gera snapshot (DOWN).
  if (meta) {
    snapshotId = preMigrationSnapshotId(from, opts.now);
    await target.putSnapshot({ id: snapshotId, createdAt: opts.now, version: from, docs: structuredClone(docs) });
  }
  const { docs: migrated, applied } = applyMigrations(docs, from, current, migrations);
  const nextMeta: DocMap["meta"] = {
    ...(meta ?? defaultMeta(opts.now)),
    schemaVersion: current,
    lastWriteAt: opts.now,
  };
  await target.commit({ ...migrated, meta: nextMeta });
  for (const m of applied) m.afterCommit?.();
  if (!meta) return { status: "fresh", from: 0, to: current };
  return { status: "migrated", from, to: current, snapshotId };
}
