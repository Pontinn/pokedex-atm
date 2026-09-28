// B2.2: carrega lang pt_br/en_us do Cobblemon e dos addons. Chaves de addon so complementam:
// se um addon redefinir uma chave do Cobblemon (com outro valor), o Cobblemon vence e o conflito vai para o report.
// item-descriptions D6: kubejs/assets/<pasta>/lang/{pt_br,en_us}.json vale POR CIMA dos jars (como no jogo e como
// kubejs/data ja substitui o jar); entre pastas do kubejs, a primeira em ordem alfabetica vence (conflito no report).
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import type { LocalizedText } from "../../../src/data/types";
import type { LangTable, ReportSink } from "./context";
import { parseJsonStrict } from "./jar-reader";
import { isPipelineError } from "./lib/errors";
import type { JarRef, SourceReader } from "./source-reader";

export type LangCode = "pt_br" | "en_us";

export interface LangLayer {
  /** ex. "cobblemon:assets/cobblemon/lang/pt_br.json" */
  origin: string;
  lang: LangCode;
  entries: Record<string, string>;
}

export interface LangLoadResult {
  table: LangTable;
  /** chaves redefinidas por addon com valor diferente (o primeiro, Cobblemon, venceu) */
  conflicts: { key: string; lang: LangCode; kept: string; ignored: string; origin: string }[];
  layers: { origin: string; lang: LangCode; keys: number }[];
  /** chaves que o kubejs trocou (valor diferente do jar) ou acrescentou, por idioma */
  kubejs: { overridden: Record<LangCode, number>; added: Record<LangCode, number> };
}

const LANG_FILE = /^assets\/([^/]+)\/lang\/(pt_br|en_us)\.json$/;

/** Namespaces de lang lidos (conferido no snapshot: cobblemon em 4 jars + o namespace proprio de cada addon). */
export const LANG_NAMESPACES = ["cobblemon", "allthemons", "legendarymonuments", "mega_showdown", "zamega", "rctmod"] as const;
const LANG_PREFIXES = LANG_NAMESPACES.map((ns) => `assets/${ns}/lang/`);

/** Camadas na ordem de precedencia: Cobblemon (assets/cobblemon) primeiro, depois cada jar na ordem de REQUIRED_JARS. */
export function readLangLayers(reader: SourceReader): LangLayer[] {
  const layers: LangLayer[] = [];
  const jars: JarRef[] = reader.listJars();
  for (const jar of jars) {
    const entries = reader.readJar(jar, LANG_PREFIXES);
    const files = [...entries.keys()].filter((p) => LANG_FILE.test(p));
    // dentro do jar do Cobblemon, assets/cobblemon vem antes de qualquer outro namespace
    files.sort((a, b) => {
      const ca = a.startsWith("assets/cobblemon/") ? 0 : 1;
      const cb = b.startsWith("assets/cobblemon/") ? 0 : 1;
      return ca - cb || (a < b ? -1 : a > b ? 1 : 0);
    });
    for (const file of files) {
      const match = LANG_FILE.exec(file);
      if (!match) continue;
      const data = parseJsonStrict<Record<string, unknown>>(entries.get(file) as Uint8Array, `${jar.fileName}!${file}`);
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) if (typeof v === "string") clean[k] = v;
      layers.push({ origin: `${jar.id}:${file}`, lang: match[2] as LangCode, entries: clean });
    }
  }
  return layers;
}

const KUBEJS_ASSETS = "kubejs/assets";
const LANG_CODES: readonly LangCode[] = ["en_us", "pt_br"];

/** Camadas do kubejs (kubejs/assets/<pasta>/lang/<idioma>.json), pastas em ordem alfabetica. JSON invalido e pulado com
 * aviso, como o jogo faz (o arquivo simplesmente nao carrega). */
export function readKubejsLangLayers(reader: SourceReader, report?: ReportSink): LangLayer[] {
  const assetsDir = path.join(reader.root, KUBEJS_ASSETS);
  if (!existsSync(assetsDir)) return [];
  const folders = readdirSync(assetsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const layers: LangLayer[] = [];
  for (const folder of folders) {
    for (const lang of LANG_CODES) {
      const rel = `${KUBEJS_ASSETS}/${folder}/lang/${lang}.json`;
      if (!reader.exists(rel)) continue;
      let data: Record<string, unknown>;
      try {
        data = parseJsonStrict<Record<string, unknown>>(reader.readFile(rel), rel);
      } catch (error) {
        if (!isPipelineError(error)) throw error;
        report?.warn("W_KUBEJS_LANG_INVALID", `lang do kubejs ignorado (JSON invalido): ${rel}`);
        continue;
      }
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(data)) if (typeof v === "string") clean[k] = v;
      layers.push({ origin: `kubejs:assets/${folder}/lang/${lang}.json`, lang, entries: clean });
    }
  }
  return layers;
}

/** Monta a tabela (primeira camada vence); depois aplica as camadas do kubejs por cima (kubejs vence o jar). */
export function buildLangTable(layers: readonly LangLayer[], report?: ReportSink, kubejsLayers: readonly LangLayer[] = []): LangLoadResult {
  const pt = new Map<string, string>();
  const en = new Map<string, string>();
  const conflicts: LangLoadResult["conflicts"] = [];
  for (const layer of layers) {
    const target = layer.lang === "pt_br" ? pt : en;
    for (const [key, value] of Object.entries(layer.entries)) {
      const existing = target.get(key);
      if (existing === undefined) target.set(key, value);
      else if (existing !== value) conflicts.push({ key, lang: layer.lang, kept: existing, ignored: value, origin: layer.origin });
    }
  }
  const kubejs: LangLoadResult["kubejs"] = { overridden: { pt_br: 0, en_us: 0 }, added: { pt_br: 0, en_us: 0 } };
  const kubejsSet = new Map<string, string>();
  for (const layer of kubejsLayers) {
    const target = layer.lang === "pt_br" ? pt : en;
    for (const [key, value] of Object.entries(layer.entries)) {
      const setKey = `${layer.lang}|${key}`;
      const earlier = kubejsSet.get(setKey);
      if (earlier !== undefined) {
        if (earlier !== value) conflicts.push({ key, lang: layer.lang, kept: earlier, ignored: value, origin: layer.origin });
        continue;
      }
      kubejsSet.set(setKey, value);
      const existing = target.get(key);
      if (existing === undefined) kubejs.added[layer.lang]++;
      else if (existing !== value) kubejs.overridden[layer.lang]++;
      target.set(key, value);
    }
  }
  const warned = new Set<string>();
  const table: LangTable = {
    pt,
    en,
    has: (key) => pt.has(key) || en.has(key),
    text(key): LocalizedText | null {
      const p = pt.get(key);
      const e = en.get(key);
      if (p === undefined && e === undefined) {
        if (report && !warned.has(key)) {
          warned.add(key);
          report.warn("W_LANG_MISSING", `chave de lang ausente: ${key}`);
        }
        return null;
      }
      return { pt: p ?? (e as string), en: e ?? (p as string) };
    },
  };
  return {
    table,
    conflicts,
    layers: [...layers, ...kubejsLayers].map((l) => ({ origin: l.origin, lang: l.lang, keys: Object.keys(l.entries).length })),
    kubejs,
  };
}

export function loadLang(reader: SourceReader, report?: ReportSink): LangLoadResult {
  return buildLangTable(readLangLayers(reader), report, readKubejsLangLayers(reader, report));
}
