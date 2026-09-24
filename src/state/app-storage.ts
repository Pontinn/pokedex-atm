// Instancia unica do StorageAdapter do app (F1.4). Criada e iniciada no boot (main.tsx); as telas pegam por getAppStorage().
import { createStorageAdapter, type DocumentStorage, type StorageNotice } from "../storage";

let instance: DocumentStorage | null = null;

export function initAppStorage(onNotice?: (n: StorageNotice) => void): DocumentStorage {
  instance = createStorageAdapter({ onNotice });
  return instance;
}

export function getAppStorage(): DocumentStorage {
  if (!instance) throw new Error("storage not initialized");
  return instance;
}
