// Helpers de e2e para ler/escrever docs do IndexedDB "pontindex" (store "documents", keyPath "key") direto pela
// API do navegador, sem depender de `import("/src/...")` em page.evaluate (isso so funciona com PW_DEV=1; no
// build de producao nao ha `/src` no dist). Usado para semear e conferir dados de usuario (capturados, historico,
// time) de forma identica em dev e producao. Depois de escrever, dispara o evento global "pontindex:data-changed"
// para que as stores da pagina (ja hidratadas) releiam o doc nao vao ficar com a copia antiga em memoria.
import type { Page } from "@playwright/test";

const DB_NAME = "pontindex";

export async function writeDoc(page: Page, key: string, doc: unknown): Promise<void> {
  await page.evaluate(
    async ({ key, doc, dbName }) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(dbName);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("documents", "readwrite");
        tx.objectStore("documents").put({ key, doc });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    },
    { key, doc, dbName: DB_NAME },
  );
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("pontindex:data-changed")));
}

export async function readDoc<T>(page: Page, key: string): Promise<T | undefined> {
  return page.evaluate(
    async ({ key, dbName }) => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(dbName);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const rec = await new Promise<{ key: string; doc: unknown } | undefined>((resolve, reject) => {
        const tx = db.transaction("documents", "readonly");
        const r = tx.objectStore("documents").get(key);
        r.onsuccess = () => resolve(r.result as { key: string; doc: unknown } | undefined);
        r.onerror = () => reject(r.error);
      });
      db.close();
      return rec?.doc as T | undefined;
    },
    { key, dbName: DB_NAME },
  );
}
