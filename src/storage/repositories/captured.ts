// Capturados (RF-47..53): mapa dex -> capturedAt; orfaos nunca apagados (RF-123).
import { filterKnown, type KnownDex } from "../filter-known";
import { readDoc, updateDoc, type RepoStorage } from "./shared";

export interface CapturedItem {
  dex: number;
  capturedAt: number;
}

export function createCapturedRepository(storage: RepoStorage, now: () => number = Date.now) {
  const getAll = async (): Promise<CapturedItem[]> => {
    const doc = await readDoc(storage, "captured");
    return Object.entries(doc.entries).map(([k, v]) => ({ dex: Number(k), capturedAt: v.capturedAt }));
  };
  return {
    getAll,
    async listKnown(datasetIndex: KnownDex): Promise<CapturedItem[]> {
      return filterKnown(await getAll(), datasetIndex);
    },
    async has(dex: number): Promise<boolean> {
      return String(dex) in (await readDoc(storage, "captured")).entries;
    },
    /** Re-marcar um ja capturado mantem a data original. */
    add(dex: number, at: number = now()) {
      return updateDoc(storage, "captured", (doc) => {
        if (!(String(dex) in doc.entries)) doc.entries[String(dex)] = { capturedAt: at };
        return doc;
      });
    },
    remove(dex: number) {
      return updateDoc(storage, "captured", (doc) => {
        delete doc.entries[String(dex)];
        return doc;
      });
    },
  };
}
