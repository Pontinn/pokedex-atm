// Leitura de jar zipado (instancia real) com fflate, filtrando por prefixo; e helpers de JSON estrito.
import { readFileSync } from "node:fs";
import { unzipSync } from "fflate";
import { PipelineError } from "./lib/errors";

/** Le as entradas do zip cujo caminho comeca com algum dos prefixos. */
export function readJar(jarPath: string, prefixes: readonly string[]): Map<string, Uint8Array> {
  let data: Uint8Array;
  try {
    data = readFileSync(jarPath);
  } catch (error) {
    throw new PipelineError("E_JAR_UNREADABLE", "nao foi possivel ler o jar", `${jarPath}: ${String(error)}`);
  }
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(data, {
      filter: (file) => !file.name.endsWith("/") && prefixes.some((p) => file.name.startsWith(p)),
    });
  } catch (error) {
    throw new PipelineError("E_JAR_UNREADABLE", "jar corrompido", `${jarPath}: ${String(error)}`);
  }
  return new Map(Object.entries(entries).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

const decoder = new TextDecoder("utf-8", { fatal: true });

/** JSON estrito (sem BOM, sem comentarios): entrada invalida -> erro com o caminho, nunca pulada em silencio. */
export function parseJsonStrict<T = unknown>(bytes: Uint8Array, where: string): T {
  let text: string;
  try {
    text = decoder.decode(bytes);
  } catch (error) {
    throw new PipelineError("E_JSON_INVALID", "UTF-8 invalido", `${where}: ${String(error)}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new PipelineError("E_JSON_INVALID", "JSON invalido", `${where}: ${String(error)}`);
  }
}

/** Entradas .json do mapa sob o prefixo, ordenadas por caminho, ja parseadas. */
export function readJsonEntries<T = unknown>(
  entries: ReadonlyMap<string, Uint8Array>,
  prefix: string,
  where = "",
): { path: string; data: T }[] {
  const out: { path: string; data: T }[] = [];
  for (const [entryPath, bytes] of entries) {
    if (!entryPath.startsWith(prefix) || !entryPath.endsWith(".json")) continue;
    out.push({ path: entryPath, data: parseJsonStrict<T>(bytes, where ? `${where}!${entryPath}` : entryPath) });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}
