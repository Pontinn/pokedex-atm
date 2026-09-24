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

// ---------------------------------------------------------------------------------------------
// Ordem de carga dos mods (NeoForge): lida SO dos META-INF/neoforge.mods.toml do snapshot.
// Uma dependencia com ordering="AFTER" em [[dependencies.<M>]] faz M carregar DEPOIS dela;
// ordering="BEFORE" faz M carregar ANTES dela (vale para required e optional). A relacao e o
// fecho transitivo dessas arestas. No datapack, o arquivo do mod que carrega depois substitui o
// do anterior no mesmo resource location; pares sem nenhuma ordem nao sao determinaveis.
// ---------------------------------------------------------------------------------------------
export interface ModsToml {
  modIds: string[];
  deps: { owner: string; modId: string; ordering: string; type: string }[];
}

/** Parser minimo de neoforge.mods.toml: so tabelas [[mods]] e [[dependencies.<id>]] com chave = "valor". */
export function parseModsToml(txt: string): ModsToml {
  const out: ModsToml = { modIds: [], deps: [] };
  let table: { kind: "mods" } | { kind: "dep"; owner: string; cur: Record<string, string> } | null = null;
  const flush = () => {
    if (table?.kind === "dep" && table.cur.modId) out.deps.push({ owner: table.owner, modId: table.cur.modId, ordering: (table.cur.ordering ?? "NONE").toUpperCase(), type: table.cur.type ?? (table.cur.mandatory === "true" ? "required" : "optional") });
  };
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    const head = line.match(/^\[\[\s*([^\]]+?)\s*\]\]/);
    if (head) {
      flush();
      const name = head[1]!;
      table = name === "mods" ? { kind: "mods" } : name.startsWith("dependencies.") ? { kind: "dep", owner: name.slice("dependencies.".length).replace(/^"|"$/g, ""), cur: {} } : null;
      continue;
    }
    if (/^\[[^\[]/.test(line)) {
      flush();
      table = null;
      continue;
    }
    const kv = line.match(/^([A-Za-z_]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s#]+))/);
    if (!kv || !table) continue;
    const key = kv[1]!;
    const val = kv[2] ?? kv[3] ?? kv[4] ?? "";
    if (table.kind === "mods" && key === "modId") out.modIds.push(val);
    else if (table.kind === "dep") table.cur[key] = val;
  }
  flush();
  return out;
}

export interface LoadOrder {
  /** modId principal declarado no toml do jar (primeiro [[mods]]) ou null (ex. kubejs) */
  modIdOf(root: string): string | null;
  /** true se `a` carrega ANTES de `b` pelo fecho transitivo das declaracoes */
  before(a: string, b: string): boolean;
  /** -1 a antes de b, 1 a depois de b, 0 sem ordem (ou mesmo mod) */
  cmp(a: string, b: string): -1 | 0 | 1;
  edges: [string, string][];
}

export function buildLoadOrder(tomls: { root: string; toml: ModsToml }[]): LoadOrder {
  const edges: [string, string][] = []; // [antes, depois]
  for (const { toml } of tomls)
    for (const d of toml.deps) {
      if (d.ordering === "AFTER") edges.push([d.modId, d.owner]);
      else if (d.ordering === "BEFORE") edges.push([d.owner, d.modId]);
    }
  const next = new Map<string, Set<string>>();
  for (const [a, b] of edges) next.set(a, new Set([...(next.get(a) ?? []), b]));
  const reach = new Map<string, Set<string>>();
  const reachOf = (a: string): Set<string> => {
    const hit = reach.get(a);
    if (hit) return hit;
    const seen = new Set<string>();
    const stack = [...(next.get(a) ?? [])];
    while (stack.length) {
      const n = stack.pop()!;
      if (seen.has(n)) continue;
      seen.add(n);
      for (const m of next.get(n) ?? []) stack.push(m);
    }
    reach.set(a, seen);
    return seen;
  };
  const byRoot = new Map(tomls.map((t) => [path.resolve(t.root), t.toml.modIds[0] ?? null]));
  const before = (a: string, b: string) => a !== b && reachOf(a).has(b);
  return {
    modIdOf: (root) => byRoot.get(path.resolve(root)) ?? null,
    before,
    cmp: (a, b) => (before(a, b) && !before(b, a) ? -1 : before(b, a) && !before(a, b) ? 1 : 0),
    edges,
  };
}

/** Ordem de carga a partir de TODOS os mods/<jar>/META-INF/neoforge.mods.toml do snapshot. */
export function loadOrder(src: string): LoadOrder {
  const mods = path.join(src, "mods");
  const tomls: { root: string; toml: ModsToml }[] = [];
  for (const n of fs.readdirSync(mods)) {
    const f = path.join(mods, n, "META-INF", "neoforge.mods.toml");
    if (fs.existsSync(f)) tomls.push({ root: path.join(mods, n), toml: parseModsToml(fs.readFileSync(f, "utf8")) });
  }
  return buildLoadOrder(tomls);
}
