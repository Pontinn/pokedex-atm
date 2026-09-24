// Base dos repositorios: "ler doc -> aplicar regra de dominio -> escrever doc inteiro" (idempotente).
import { defaultDoc } from "../defaults";
import type { DocKey, DocMap, StorageAdapter } from "../types";

export type RepoStorage = Pick<StorageAdapter, "read" | "write">;

export async function readDoc<K extends DocKey>(storage: RepoStorage, key: K): Promise<DocMap[K]> {
  return (await storage.read(key)) ?? defaultDoc(key);
}

/** Aplica `fn`; so escreve se o doc mudou (re-salvar o mesmo conteudo e no-op). */
export async function updateDoc<K extends DocKey>(
  storage: RepoStorage,
  key: K,
  fn: (doc: DocMap[K]) => DocMap[K],
): Promise<DocMap[K]> {
  const current = await readDoc(storage, key);
  const next = fn(structuredClone(current));
  if (JSON.stringify(next) !== JSON.stringify(current)) await storage.write(key, next);
  return next;
}
