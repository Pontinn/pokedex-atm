// Auditoria independente (A1): leitura crua do snapshot. NAO importa nada de tools/dataset/src.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));
export const DEFAULT_SRC = path.join(REPO_ROOT, "data-source", "atm-1.3.0");

/** Jars na ordem de precedencia da SPEC 5.1.1: base primeiro, addons em ordem alfabetica. */
export const JAR_PREFIXES = [
  "Cobblemon-neoforge",
  "allthemons",
  "complete-cobblemon-collection",
  "legendarymonuments",
  "mega_showdown",
  "zamega",
] as const;

export interface RawSource {
  /** nome curto: cobblemon | allthemons | ccc | legendarymonuments | mega_showdown | zamega | kubejs | rctmod */
  name: string;
  /** raiz que contem data/ e assets/ */
  root: string;
}

export function shortName(prefix: string): string {
  if (prefix.startsWith("Cobblemon")) return "cobblemon";
  if (prefix.startsWith("complete-cobblemon")) return "ccc";
  if (prefix.startsWith("rctmod")) return "rctmod";
  return prefix;
}

export function findJar(src: string, prefix: string): string {
  const mods = path.join(src, "mods");
  const hit = fs.readdirSync(mods).filter((n) => n.startsWith(prefix));
  if (hit.length !== 1) throw new Error(`audit: jar ${prefix} encontrado ${hit.length} vezes em ${mods}`);
  return path.join(mods, hit[0]!);
}

export function sources(src: string): RawSource[] {
  const out: RawSource[] = JAR_PREFIXES.map((p) => ({ name: shortName(p), root: findJar(src, p) }));
  out.push({ name: "kubejs", root: path.join(src, "kubejs") });
  return out;
}

export function readJson<T = any>(file: string): T {
  const txt = fs.readFileSync(file, "utf8").replace(/^﻿/, "");
  return JSON.parse(txt) as T;
}

export function walk(dir: string, ext = ".json"): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop()!;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name.endsWith(ext)) out.push(p);
    }
  }
  return out.sort();
}

/**
 * Todos os arquivos de um "tipo" de datapack (ex. "species_additions") em QUALQUER namespace
 * (o Minecraft lista recursos por caminho em todos os namespaces). Retorna com o resource location
 * `<ns>:<tipo>/<resto>` para detectar sombreamento entre pacotes.
 */
export function datapackFiles(s: RawSource, kind: string): { file: string; rl: string; ns: string }[] {
  const data = path.join(s.root, "data");
  if (!fs.existsSync(data)) return [];
  const out: { file: string; rl: string; ns: string }[] = [];
  for (const ns of fs.readdirSync(data)) {
    const base = path.join(data, ns, kind);
    for (const f of walk(base)) {
      const rel = path.relative(base, f).split(path.sep).join("/");
      out.push({ file: f, rl: `${ns}:${kind}/${rel}`, ns });
    }
  }
  return out;
}

export function rel(file: string): string {
  return path.relative(REPO_ROOT, file).split(path.sep).join("/");
}
