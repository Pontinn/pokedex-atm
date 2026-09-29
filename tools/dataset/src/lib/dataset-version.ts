// U11 (pwa-auto-update): o sufixo do datasetVersion e o hash do CONTEUDO de todos os arquivos publicados.
// Antes era o sha8 do species-index.json: republicar no mesmo dia com especies iguais reusava a pasta ja no ar
// (immutable no Vercel + CacheFirst no SW) mesmo com items.json/series.json diferentes.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { DatasetManifest } from "../../../../src/data/types";
import { sha256Hex } from "./hash";

export const MANIFEST_FILE = "dataset-manifest.json";

/** Campos do manifest que nao entram no hash: a propria versao (autorreferente) e a data/hora da geracao. */
export type ManifestContent = Omit<DatasetManifest, "datasetVersion" | "generatedAt">;

/** Todos os arquivos sob `dir` (recursivo), caminho relativo com "/" e ordenado (ordem deterministica). */
export function listDatasetFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (rel: string): void => {
    for (const entry of readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) out.push(child);
    }
  };
  walk("");
  return out.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/**
 * Hash (hex SHA-256) do conteudo do dataset: cada arquivo de `dataDir` (menos o manifest) como
 * `caminho\0tamanho\0bytes`, em ordem de caminho, mais o manifest sem `datasetVersion`/`generatedAt`.
 * Mesmo conteudo = mesmo hash; qualquer byte, arquivo ou caminho diferente = hash diferente.
 */
export function datasetContentHash(dataDir: string, manifest: ManifestContent): string {
  const parts: (string | Uint8Array)[] = [];
  for (const rel of listDatasetFiles(dataDir)) {
    if (rel === MANIFEST_FILE) continue;
    const bytes = readFileSync(path.join(dataDir, rel));
    parts.push(`${rel}\0${bytes.length}\0`, bytes, "\0");
  }
  parts.push(`${MANIFEST_FILE}\0`, stableStringify(manifest));
  return sha256Hex(Buffer.concat(parts.map((p) => (typeof p === "string" ? Buffer.from(p, "utf8") : p))));
}

/** `atm<pack>-cobblemon<ver>-<yyyymmdd>-<hash8>` (formato mantido; o hash agora cobre todo o conteudo). */
export function buildDatasetVersion(packVersion: string, cobblemonVersion: string, date: Date, contentHash: string): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `atm${packVersion}-cobblemon${cobblemonVersion}-${day}-${contentHash.slice(0, 8)}`;
}

/** JSON com chaves ordenadas (a ordem de insercao do objeto nao muda o hash). */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}
