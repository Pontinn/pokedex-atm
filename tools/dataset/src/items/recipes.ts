// B4.2 passo 1 + U7a (pwa-auto-update): rota "craftable" a partir das receitas de TODOS os namespaces.
// Fontes (ordem de prioridade crescente, id igual = o de cima sobrescreve, como os datapacks):
//   1. vanilla: snapshot `vanilla/1.21.1.jar/` | instancia `../../Install/versions/1.21.1/1.21.1.jar`
//   2. todo jar de `mods/` (snapshot: pasta, instancia: zip), em ordem alfabetica
//   3. `kubejs/data/<ns>/recipe/**`
// Saida lida das chaves de resultado (qualquer tipo de receita, inclusive customizados de Create, Oritech,
// Mekanism, Botany Pots...), `neoforge:conditions` avaliadas contra os mods instalados e remocoes do kubejs
// (`<evento>.remove(...)` em `kubejs/server_scripts/**`) aplicadas. Nunca inventa rota: condicao que o
// pipeline nao sabe avaliar (config de mod, abelha existe...) tira a receita e vai para o report.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";
import type { PipelineContext } from "../context";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

export const VANILLA_VERSION = "1.21.1";
// 1.21 le so a pasta singular `recipe/`; `recipes/` (formato 1.20) nao carrega no jogo e fica de fora
const RECIPE_RE = /^data\/([^/]+)\/recipe\/(.+)\.json$/;
const ITEM_TAG_RE = /^data\/([^/]+)\/tags\/items?\/(.+)\.json$/;
const ID_RE = /^[a-z0-9_.-]+:[a-z0-9_./-]+$/;

/** Chaves cujo valor e saida da receita (string, {id}, {item}, lista). */
const RESULT_KEYS = new Set([
  "result",
  "results",
  "output",
  "outputs",
  "output_item",
  "result_item",
  "item_output",
  "main_output",
  "secondary_outputs",
  "secondary_output",
]);
/** Chaves de entrada (ou etapas intermediarias) que nunca sao saida. */
const SKIP_KEYS = new Set([
  "ingredients",
  "ingredient",
  "key",
  "input",
  "inputs",
  "base",
  "addition",
  "template",
  "sequence",
  "transitional_item",
  "neoforge:conditions",
]);

function idsOfResult(v: unknown, out: Set<string>): void {
  if (typeof v === "string") {
    if (ID_RE.test(v)) out.add(v);
  } else if (Array.isArray(v)) {
    for (const x of v) idsOfResult(x, out);
  } else if (isObject(v)) {
    if (typeof v.id === "string") idsOfResult(v.id, out);
    else if (typeof v.item === "string" || isObject(v.item)) idsOfResult(v.item, out);
    else for (const [k, x] of Object.entries(v)) if (RESULT_KEYS.has(k)) idsOfResult(x, out);
  }
}

function walkOutputs(v: unknown, out: Set<string>): void {
  if (Array.isArray(v)) {
    for (const x of v) walkOutputs(x, out);
  } else if (isObject(v)) {
    for (const [k, x] of Object.entries(v)) {
      if (RESULT_KEYS.has(k)) idsOfResult(x, out);
      else if (!SKIP_KEYS.has(k)) walkOutputs(x, out);
    }
  }
}

/** Ids de item/bloco produzidos pela receita (tags `#...` ficam de fora), ordenados. */
export function recipeOutputs(data: unknown): string[] {
  const out = new Set<string>();
  walkOutputs(data, out);
  return [...out].sort();
}

export type ConditionResult = "ok" | "absentMod" | "unknown";

/** Avalia `neoforge:conditions`. Tipos fora do neoforge (config de mod etc.) = "unknown" (nao comprovavel). */
export interface ConditionFacts {
  /** abelhas do Productive Bees definidas em `data/<ns>/productivebees/**.json` (id `productivebees:<nome>`) */
  bees?: ReadonlySet<string>;
}

export function evalConditions(conditions: unknown, modIds: ReadonlySet<string>, facts: ConditionFacts = {}): ConditionResult {
  if (conditions === undefined) return "ok";
  if (!Array.isArray(conditions)) return "unknown";
  const one = (c: unknown): boolean | "unknown" => {
    if (!isObject(c) || typeof c.type !== "string") return "unknown";
    switch (c.type) {
      case "neoforge:true":
        return true;
      case "neoforge:false":
        return false;
      case "neoforge:mod_loaded":
        return typeof c.modid === "string" ? modIds.has(c.modid) : "unknown";
      case "productivebees:bee_exists":
        // so comprova a presenca; abelha fora das definicoes lidas continua "unknown"
        return typeof c.bee === "string" && facts.bees?.has(c.bee) ? true : "unknown";
      case "productivelib:lazy":
        return one(c.value);
      case "neoforge:item_exists":
        // item de mod instalado: o registro do item nao esta nos arquivos; aceita pelo namespace
        return typeof c.item === "string" ? modIds.has(c.item.split(":")[0] as string) : "unknown";
      case "neoforge:not": {
        const r = one(c.value);
        return r === "unknown" ? r : !r;
      }
      case "neoforge:and":
      case "neoforge:or": {
        if (!Array.isArray(c.values)) return "unknown";
        const rs = c.values.map(one);
        if (c.type === "neoforge:and") return rs.includes(false) ? false : rs.includes("unknown") ? "unknown" : true;
        return rs.includes(true) ? true : rs.includes("unknown") ? "unknown" : false;
      }
      default:
        return "unknown";
    }
  };
  let unknown = false;
  for (const c of conditions) {
    const r = one(c);
    if (r === false) {
      // falha comprovada: so e "mod ausente" se envolve mod_loaded; senao tambem conta como ausente/desligada
      return "absentMod";
    }
    if (r === "unknown") unknown = true;
  }
  return unknown ? "unknown" : "ok";
}

export interface RecipeFile {
  /** rotulo da origem: "vanilla", nome do jar ou "kubejs" */
  source: string;
  /** caminho interno `data/<ns>/recipe/<caminho>.json` */
  path: string;
  bytes: Uint8Array;
}

export interface RecipeRecord {
  id: string;
  type: string | null;
  outputs: string[];
  source: string;
  status: ConditionResult | "invalidJson";
  /** tipos das condicoes nao comprovaveis (status "unknown") */
  unknownConditionTypes: string[];
}

const decoder = new TextDecoder("utf-8");

function parseLenient(bytes: Uint8Array): unknown {
  let text = decoder.decode(bytes);
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function conditionTypes(conditions: unknown): string[] {
  const out = new Set<string>();
  const walk = (c: unknown) => {
    if (Array.isArray(c)) c.forEach(walk);
    else if (isObject(c)) {
      if (typeof c.type === "string" && !c.type.startsWith("neoforge:")) out.add(c.type);
      walk(c.value);
      walk(c.values);
    }
  };
  walk(conditions);
  return [...out].sort();
}

/** id da receita -> registro vencedor (ultimo arquivo com o id na ordem dada), condicoes avaliadas. */
export function buildRecipeIndex(
  files: readonly RecipeFile[],
  modIds: ReadonlySet<string>,
  facts: ConditionFacts = {},
): { recipes: Map<string, RecipeRecord>; overridden: number } {
  const recipes = new Map<string, RecipeRecord>();
  let overridden = 0;
  for (const file of files) {
    const m = RECIPE_RE.exec(file.path);
    if (!m) continue;
    const id = `${m[1]}:${m[2]}`;
    if (recipes.has(id)) overridden++;
    const data = parseLenient(file.bytes);
    if (!isObject(data)) {
      recipes.set(id, { id, type: null, outputs: [], source: file.source, status: "invalidJson", unknownConditionTypes: [] });
      continue;
    }
    const status = evalConditions(data["neoforge:conditions"], modIds, facts);
    recipes.set(id, {
      id,
      // tipo sem namespace = minecraft (regra do ResourceLocation)
      type: typeof data.type === "string" ? (data.type.includes(":") ? data.type : `minecraft:${data.type}`) : null,
      outputs: recipeOutputs(data),
      source: file.source,
      status,
      unknownConditionTypes: status === "unknown" ? conditionTypes(data["neoforge:conditions"]) : [],
    });
  }
  return { recipes, overridden };
}

// ---------- tags de item (para remocao por `output: "#tag"`) ----------

/** tag -> itens (tags aninhadas resolvidas). Entrada: arquivos `data/<ns>/tags/item(s)/<caminho>.json` em ordem. */
export function resolveItemTags(files: readonly { path: string; bytes: Uint8Array }[]): Map<string, Set<string>> {
  const raw = new Map<string, string[]>();
  for (const file of files) {
    const m = ITEM_TAG_RE.exec(file.path);
    if (!m) continue;
    const tag = `${m[1]}:${m[2]}`;
    const data = parseLenient(file.bytes);
    if (!isObject(data) || !Array.isArray(data.values)) continue;
    const values = data.values
      .map((v) => (typeof v === "string" ? v : isObject(v) && typeof v.id === "string" ? v.id : null))
      .filter((v): v is string => v !== null);
    raw.set(tag, data.replace === true ? values : [...(raw.get(tag) ?? []), ...values]);
  }
  const resolved = new Map<string, Set<string>>();
  const resolve = (tag: string, visiting: Set<string>): Set<string> => {
    const done = resolved.get(tag);
    if (done) return done;
    const out = new Set<string>();
    if (visiting.has(tag)) return out;
    visiting.add(tag);
    for (const v of raw.get(tag) ?? []) {
      if (v.startsWith("#")) for (const x of resolve(v.slice(1), visiting)) out.add(x);
      else out.add(v);
    }
    visiting.delete(tag);
    resolved.set(tag, out);
    return out;
  };
  for (const tag of raw.keys()) resolve(tag, new Set());
  return resolved;
}

// ---------- remocoes do kubejs ----------

export interface RemovalFilter {
  id?: string | RegExp;
  output?: string;
  type?: string;
  mod?: string;
  input?: string;
  /** `<arquivo>:<linha>` */
  where: string;
}

export interface UnparsedRemoval {
  where: string;
  text: string;
}

/** Tira comentarios `//` e `/* *\/` sem mexer em strings. */
function stripComments(src: string): string {
  let out = "";
  let i = 0;
  let quote: string | null = null;
  while (i < src.length) {
    const ch = src[i] as string;
    if (quote) {
      out += ch;
      if (ch === "\\") {
        out += src[i + 1] ?? "";
        i += 2;
        continue;
      }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const chunk = src.slice(i, end < 0 ? src.length : end + 2);
      out += chunk.replace(/[^\n]/g, " ");
      i += chunk.length;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** Conteudo entre o `(` em `open` e o `)` que fecha (respeita strings). null se nao fecha. */
function balancedArgs(src: string, open: number): string | null {
  let depth = 0;
  let quote: string | null = null;
  for (let i = open; i < src.length; i++) {
    const ch = src[i] as string;
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return src.slice(open + 1, i);
    }
  }
  return null;
}

type Literal = string | number | boolean | RegExp | Literal[] | { [k: string]: Literal };

/** Parser minimo de literais JS (string sem interpolacao, regex, objeto, array). Qualquer outra coisa = null. */
function parseLiteralAt(text: string, start: number): { value: Literal; end: number } | null {
  let i = start;
  const ws = () => {
    while (i < text.length && /\s/.test(text[i] as string)) i++;
  };
  const value = (): Literal | null => {
    ws();
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      let s = "";
      i++;
      while (i < text.length && text[i] !== ch) {
        if (text[i] === "\\") i++;
        else if (ch === "`" && text[i] === "$" && text[i + 1] === "{") return null;
        s += text[i];
        i++;
      }
      if (text[i] !== ch) return null;
      i++;
      return s;
    }
    const scalar = /^(?:-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|true|false|null)(?![\w$])/.exec(text.slice(i));
    if (scalar) {
      i += scalar[0].length;
      const w = scalar[0];
      return w === "true" ? true : w === "false" || w === "null" ? false : Number(w);
    }
    if (ch === "/") {
      const m = /^\/((?:\\.|[^/\\\n])+)\/([a-z]*)/.exec(text.slice(i));
      if (!m) return null;
      i += m[0].length;
      try {
        return new RegExp(m[1] as string, m[2]);
      } catch {
        return null;
      }
    }
    if (ch === "[") {
      i++;
      const arr: Literal[] = [];
      for (;;) {
        ws();
        if (text[i] === "]") {
          i++;
          return arr;
        }
        const v = value();
        if (v === null) return null;
        arr.push(v);
        ws();
        if (text[i] === ",") i++;
        else if (text[i] !== "]") return null;
      }
    }
    if (ch === "{") {
      i++;
      const obj: Record<string, Literal> = {};
      for (;;) {
        ws();
        if (text[i] === "}") {
          i++;
          return obj;
        }
        let key: string;
        const q = text[i];
        if (q === '"' || q === "'") {
          const k = value();
          if (typeof k !== "string") return null;
          key = k;
        } else {
          const m = /^[A-Za-z_$][\w$]*/.exec(text.slice(i));
          if (!m) return null;
          key = m[0];
          i += key.length;
        }
        ws();
        if (text[i] !== ":") return null;
        i++;
        const v = value();
        if (v === null) return null;
        obj[key] = v;
        ws();
        if (text[i] === ",") i++;
        else if (text[i] !== "}") return null;
      }
    }
    return null;
  };
  const v = value();
  return v === null ? null : { value: v, end: i };
}

function parseLiteral(text: string): Literal | null {
  const r = parseLiteralAt(text, 0);
  return r !== null && text.slice(r.end).trim() === "" ? r.value : null;
}

const CUSTOM_TYPE_RE = /^\s*\{[^]*?(?<![\w$])["']?type["']?\s*:\s*(["'])([a-z0-9_.-]+:[a-z0-9_./-]+)\1/;
const CUSTOM_RESULT_KEY_RE = new RegExp(`(?<![\\w$])["']?(${[...RESULT_KEYS].join("|")})["']?\\s*:\\s*`, "g");

/**
 * `custom({...})` com partes dinamicas (Ingredient.of, variaveis): aproveita so o que e literal, o `type`
 * no inicio do objeto e os valores literais das chaves de resultado. Nada literal = null.
 */
function customRecipeFallback(text: string): { type: string; outputs: string[] } | null {
  const t = CUSTOM_TYPE_RE.exec(text);
  if (!t) return null;
  const outputs = new Set<string>();
  for (const m of text.matchAll(CUSTOM_RESULT_KEY_RE)) {
    const r = parseLiteralAt(text, (m.index ?? 0) + m[0].length);
    if (r) for (const id of recipeOutputs({ [m[1] as string]: r.value })) outputs.add(id);
  }
  return outputs.size > 0 ? { type: t[2] as string, outputs: [...outputs].sort() } : null;
}

const FILTER_KEYS = new Set(["id", "output", "type", "mod", "input"]);

function toFilters(lit: Literal, where: string): RemovalFilter[] | null {
  if (typeof lit === "string") return [{ id: lit, where }];
  if (Array.isArray(lit)) {
    const out: RemovalFilter[] = [];
    for (const x of lit) {
      const f = toFilters(x, where);
      if (!f) return null;
      out.push(...f);
    }
    return out;
  }
  if (lit instanceof RegExp || typeof lit !== "object") return null;
  const f: RemovalFilter = { where };
  for (const [k, v] of Object.entries(lit)) {
    if (!FILTER_KEYS.has(k)) return null;
    if (k === "id" && (typeof v === "string" || v instanceof RegExp)) f.id = v;
    else if (k !== "id" && typeof v === "string") (f as unknown as Record<string, string>)[k] = v;
    else return null;
  }
  return Object.keys(f).length > 1 ? [f] : null;
}

/**
 * `<evento>.remove(...)` dentro de `ServerEvents.recipes(<evento> => ...)`. Argumento literal (id em string,
 * objeto {id|output|type|mod|input}, lista) vira filtro; argumento dinamico (variavel, template com ${})
 * nao e aplicado e volta em `unparsed` para o report.
 */
export function parseKubejsRemovals(scripts: ReadonlyMap<string, string>): { filters: RemovalFilter[]; unparsed: UnparsedRemoval[] } {
  const filters: RemovalFilter[] = [];
  const unparsed: UnparsedRemoval[] = [];
  for (const [file, rawSrc] of [...scripts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!rawSrc.includes("ServerEvents.recipes")) continue;
    const src = stripComments(rawSrc);
    const receivers = new Set<string>();
    for (const m of src.matchAll(/ServerEvents\.recipes\(\s*(?:\(\s*)?([A-Za-z_$][\w$]*)/g)) receivers.add(m[1] as string);
    for (const name of receivers) {
      const re = new RegExp(`(?<![\\w$.])${name.replace(/\$/g, "\\$")}\\s*\\.\\s*remove\\s*\\(`, "g");
      for (const m of src.matchAll(re)) {
        const open = (m.index ?? 0) + m[0].length - 1;
        const line = src.slice(0, open).split("\n").length;
        const where = `${file}:${line}`;
        const args = balancedArgs(src, open);
        const lit = args === null ? null : parseLiteral(args.trim());
        const f = lit === null ? null : toFilters(lit, where);
        if (f) filters.push(...f);
        else unparsed.push({ where, text: (args ?? "").replace(/\s+/g, " ").trim().slice(0, 160) });
      }
    }
  }
  return { filters, unparsed };
}

const SCRIPT_RECIPE_TYPES: Record<string, string> = {
  shaped: "minecraft:crafting_shaped",
  shapeless: "minecraft:crafting_shapeless",
  smelting: "minecraft:smelting",
  blasting: "minecraft:blasting",
  smoking: "minecraft:smoking",
  campfireCooking: "minecraft:campfire_cooking",
  stonecutting: "minecraft:stonecutting",
  smithing: "minecraft:smithing_transform",
};
const SCRIPT_OUTPUT_RE = /^(?:Item\.of\(\s*)?(["'`])(?:\d+x\s+)?([a-z0-9_.-]+:[a-z0-9_./-]+)\1/;

/** Primeiro argumento de nivel 0 (antes da primeira virgula fora de parenteses/colchetes/chaves/strings). */
function firstArg(args: string): string {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < args.length; i++) {
    const ch = args[i] as string;
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
    else if (ch === "," && depth === 0) return args.slice(0, i).trim();
  }
  return args.trim();
}

export interface ScriptRecipe {
  id: string;
  type: string;
  outputs: string[];
  where: string;
}

/**
 * Receitas ACRESCENTADAS pelo kubejs em `ServerEvents.recipes`: `<evento>.shaped|shapeless|smelting|blasting|
 * smoking|campfireCooking|stonecutting|smithing(<saida>, ...)` e `<evento>.recipes.kubejs.shaped(...)` com saida
 * literal (`'ns:id'`, `'2x ns:id'`, `Item.of('ns:id', n)`), e `<evento>.custom({...})` com objeto literal.
 * O resto (saida dinamica, `<evento>.recipes.<mod>.<tipo>(...)`) volta em `unparsed`.
 */
export function parseKubejsAdditions(scripts: ReadonlyMap<string, string>): { recipes: ScriptRecipe[]; unparsed: UnparsedRemoval[] } {
  const recipes: ScriptRecipe[] = [];
  const unparsed: UnparsedRemoval[] = [];
  for (const [file, rawSrc] of [...scripts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (!rawSrc.includes("ServerEvents.recipes")) continue;
    const src = stripComments(rawSrc);
    const receivers = new Set<string>();
    for (const m of src.matchAll(/ServerEvents\.recipes\(\s*(?:\(\s*)?([A-Za-z_$][\w$]*)/g)) receivers.add(m[1] as string);
    for (const name of receivers) {
      const re = new RegExp(`(?<![\\w$.])${name.replace(/\$/g, "\\$")}\\s*\\.\\s*(?:recipes\\s*\\.\\s*([A-Za-z_]+)\\s*\\.\\s*)?([A-Za-z_]+)\\s*\\(`, "g");
      for (const m of src.matchAll(re)) {
        const ns = m[1];
        const method = m[2] as string;
        if (!ns && (method === "remove" || method === "replaceInput" || method === "replaceOutput" || method === "forEachRecipe" || method === "findRecipes")) continue;
        const open = (m.index ?? 0) + m[0].length - 1;
        const line = src.slice(0, open).split("\n").length;
        const where = `${file}:${line}`;
        const args = balancedArgs(src, open);
        const close = args === null ? -1 : open + args.length + 1;
        const idMatch = close < 0 ? null : /^\s*\.\s*id\(\s*(["'])([^"']+)\1\s*\)/.exec(src.slice(close + 1));
        const id = idMatch ? (idMatch[2] as string) : `kubejs:script/${file}:${line}`;
        const scriptType = (!ns || ns === "kubejs") ? SCRIPT_RECIPE_TYPES[method] : undefined;
        if (scriptType && args !== null) {
          const out = SCRIPT_OUTPUT_RE.exec(firstArg(args));
          if (out) recipes.push({ id, type: scriptType, outputs: [out[2] as string], where });
          else unparsed.push({ where, text: args.replace(/\s+/g, " ").trim().slice(0, 160) });
          continue;
        }
        if (!ns && method === "custom" && args !== null) {
          const lit = parseLiteral(args.trim());
          const data = lit !== null && typeof lit === "object" && !Array.isArray(lit) && !(lit instanceof RegExp) ? lit : null;
          const outputs = data ? recipeOutputs(data) : [];
          const fallback = data ? null : customRecipeFallback(args);
          if (data && typeof data.type === "string" && outputs.length > 0) recipes.push({ id, type: data.type, outputs, where });
          else if (fallback) recipes.push({ id, ...fallback, where });
          else unparsed.push({ where, text: args.replace(/\s+/g, " ").trim().slice(0, 160) });
          continue;
        }
        if (ns) unparsed.push({ where, text: `recipes.${ns}.${method}(...)` });
      }
    }
  }
  return { recipes, unparsed };
}

/** O filtro casa com a receita? `input` nao e suportado (a receita nao guarda entradas): nunca casa. */
export function removalMatches(f: RemovalFilter, r: Pick<RecipeRecord, "id" | "type" | "outputs">, tags: ReadonlyMap<string, ReadonlySet<string>>): boolean {
  if (f.input !== undefined) return false;
  if (f.id !== undefined && (typeof f.id === "string" ? f.id !== r.id : !f.id.test(r.id))) return false;
  if (f.type !== undefined && f.type !== r.type) return false;
  if (f.mod !== undefined && r.id.split(":")[0] !== f.mod) return false;
  if (f.output !== undefined) {
    if (f.output.startsWith("#")) {
      const members = tags.get(f.output.slice(1));
      if (!members || !r.outputs.some((o) => members.has(o))) return false;
    } else if (!r.outputs.includes(f.output)) return false;
  }
  return true;
}

const BEE_RE = /^data\/[^/]+\/productivebees\/(?:.+\/)?([^/]+)\.json$/;

/** Abelhas definidas (com as proprias condicoes aceitas): `productivebees:<nome do arquivo>`. */
export function beeIds(files: readonly { path: string; bytes: Uint8Array }[], modIds: ReadonlySet<string>): Set<string> {
  const out = new Set<string>();
  for (const f of files) {
    const m = BEE_RE.exec(f.path);
    const data = parseLenient(f.bytes);
    if (!m || !isObject(data)) continue;
    if (evalConditions(data["neoforge:conditions"], modIds) === "ok") out.add(`productivebees:${m[1] as string}`);
  }
  return out;
}

// ---------- leitura das fontes ----------

function walkFiles(dir: string, base: string, out: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, base, out);
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
}

/** Arquivos `data/<ns>/<sub>/**` de um jar aberto (pasta) ou zip, filtrados por regex. */
function readJarData(jarPath: string, subdirs: readonly string[], re: RegExp): { path: string; bytes: Uint8Array }[] {
  const out: { path: string; bytes: Uint8Array }[] = [];
  if (statSync(jarPath).isDirectory()) {
    const dataDir = path.join(jarPath, "data");
    if (!existsSync(dataDir)) return out;
    for (const ns of readdirSync(dataDir).sort()) {
      for (const sub of subdirs) {
        const dir = path.join(dataDir, ns, sub);
        if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
        const files: string[] = [];
        walkFiles(dir, jarPath, files);
        for (const rel of files) if (re.test(rel)) out.push({ path: rel, bytes: readFileSync(path.join(jarPath, rel)) });
      }
    }
  } else {
    const entries = unzipSync(readFileSync(jarPath), { filter: (f) => re.test(f.name) });
    for (const [p, bytes] of Object.entries(entries)) out.push({ path: p, bytes });
  }
  return out.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

function vanillaJarPath(root: string, mode: "snapshot" | "instance"): string {
  return mode === "snapshot"
    ? path.join(root, "vanilla", `${VANILLA_VERSION}.jar`)
    : path.resolve(root, "..", "..", "Install", "versions", VANILLA_VERSION, `${VANILLA_VERSION}.jar`);
}

function modJarPaths(root: string): { fileName: string; path: string }[] {
  const modsDir = path.join(root, "mods");
  return readdirSync(modsDir)
    .sort()
    .map((fileName) => ({ fileName, path: path.join(modsDir, fileName) }))
    .filter((j) => statSync(j.path).isDirectory() || j.fileName.endsWith(".jar"));
}

const TOML_MODID_RE = /modId\s*=\s*"([^"]+)"/g;

function modIdsOfZip(bytes: Uint8Array, depth: number): string[] {
  const entries = unzipSync(bytes, {
    filter: (f) => f.name === "META-INF/neoforge.mods.toml" || (depth === 0 && f.name.startsWith("META-INF/jarjar/") && f.name.endsWith(".jar")),
  });
  const ids: string[] = [];
  for (const [name, data] of Object.entries(entries)) {
    if (name.endsWith(".toml")) for (const m of decoder.decode(data).matchAll(TOML_MODID_RE)) ids.push(m[1] as string);
    else ids.push(...modIdsOfZip(data, depth + 1));
  }
  return ids;
}

/** Mods instalados: snapshot = `mod-ids.json`; instancia = modId de todo neoforge.mods.toml (incl. jarjar). */
function readModIds(ctx: Pick<PipelineContext, "reader" | "report">): Set<string> {
  const ids = new Set(["minecraft", "neoforge", "c"]);
  if (ctx.reader.mode === "snapshot") {
    if (!ctx.reader.exists("mod-ids.json")) {
      ctx.report.warn("W_RECIPE_MOD_IDS_MISSING", "snapshot sem mod-ids.json: receitas com neoforge:mod_loaded caem");
      return ids;
    }
    for (const id of JSON.parse(decoder.decode(ctx.reader.readFile("mod-ids.json"))) as string[]) ids.add(id);
    return ids;
  }
  for (const jar of modJarPaths(ctx.reader.root)) {
    if (!jar.fileName.endsWith(".jar") || statSync(jar.path).isDirectory()) continue;
    for (const id of modIdsOfZip(readFileSync(jar.path), 0)) ids.add(id);
  }
  return ids;
}

export interface RecipeCollection {
  /** itemId -> tipos de receita das receitas validas que o produzem */
  craftable: Map<string, Set<string>>;
  recipes: Map<string, RecipeRecord>;
  removed: { id: string; outputs: string[]; type: string | null; by: string }[];
  unparsedRemovals: UnparsedRemoval[];
  scriptRecipes: ScriptRecipe[];
}

/** Le todas as fontes, aplica condicoes e remocoes do kubejs. `catalogIds` so filtra o que vai para o report. */
export function collectRecipes(
  ctx: Pick<PipelineContext, "reader" | "report">,
  catalogIds?: ReadonlySet<string>,
): RecipeCollection {
  const root = ctx.reader.root;
  const files: RecipeFile[] = [];
  const vanilla = vanillaJarPath(root, ctx.reader.mode);
  if (existsSync(vanilla)) {
    for (const f of readJarData(vanilla, ["recipe"], RECIPE_RE)) files.push({ source: "vanilla", ...f });
  } else {
    ctx.report.warn("W_RECIPE_VANILLA_MISSING", `jar vanilla ${VANILLA_VERSION} nao encontrado: receitas do minecraft ficam de fora`, { path: vanilla });
  }
  const tagFiles: { path: string; bytes: Uint8Array }[] = [];
  const beeFiles: { path: string; bytes: Uint8Array }[] = [];
  const requiredJarPaths = new Set(ctx.reader.listJars().map((j) => path.resolve(j.path)));
  for (const jar of modJarPaths(root)) {
    for (const f of readJarData(jar.path, ["recipe"], RECIPE_RE)) files.push({ source: jar.fileName, ...f });
    // tags: so dos 7 jars do app + kubejs (o snapshot so tem esses; igual nos dois modos)
    if (requiredJarPaths.has(path.resolve(jar.path))) {
      tagFiles.push(...readJarData(jar.path, ["tags"], ITEM_TAG_RE));
      beeFiles.push(...readJarData(jar.path, ["productivebees"], BEE_RE));
    }
  }
  const kubejsData = ctx.reader.readTree("kubejs/data");
  for (const [rel, bytes] of kubejsData) {
    const p = `data/${rel}`;
    if (RECIPE_RE.test(p)) files.push({ source: "kubejs", path: p, bytes });
    else if (ITEM_TAG_RE.test(p)) tagFiles.push({ path: p, bytes });
    else if (BEE_RE.test(p)) beeFiles.push({ path: p, bytes });
  }

  const modIds = readModIds(ctx);
  const { recipes, overridden } = buildRecipeIndex(files, modIds, { bees: beeIds(beeFiles, modIds) });
  const tags = resolveItemTags(tagFiles);

  const scripts = new Map<string, string>();
  for (const [rel, bytes] of ctx.reader.readTree("kubejs/server_scripts")) if (rel.endsWith(".js")) scripts.set(rel, decoder.decode(bytes));
  if (scripts.size === 0) ctx.report.warn("W_RECIPE_KUBEJS_SCRIPTS_MISSING", "kubejs/server_scripts ausente: remocoes do kubejs nao aplicadas");
  const { filters, unparsed } = parseKubejsRemovals(scripts);

  const removed: RecipeCollection["removed"] = [];
  const craftable = new Map<string, Set<string>>();
  const noOutputByType = new Map<string, number>();
  const statusCount = { ok: 0, absentMod: 0, unknown: 0, invalidJson: 0 };
  const unknownTypes = new Map<string, number>();
  const relevant = (r: { outputs: readonly string[] }) => !catalogIds || r.outputs.some((o) => catalogIds.has(o));
  const droppedCatalog: { id: string; status: string; outputs: string[]; conditions?: string[] }[] = [];
  for (const r of recipes.values()) {
    statusCount[r.status]++;
    if (r.status !== "ok") {
      for (const t of r.unknownConditionTypes) unknownTypes.set(t, (unknownTypes.get(t) ?? 0) + 1);
      if (relevant(r) && r.status !== "invalidJson") {
        droppedCatalog.push({ id: r.id, status: r.status, outputs: r.outputs.filter((o) => !catalogIds || catalogIds.has(o)), ...(r.status === "unknown" ? { conditions: r.unknownConditionTypes } : {}) });
      }
      continue;
    }
    const by = filters.find((f) => removalMatches(f, r, tags));
    if (by) {
      removed.push({ id: r.id, outputs: r.outputs, type: r.type, by: by.where });
      continue;
    }
    if (!r.type) continue;
    if (r.outputs.length === 0) {
      noOutputByType.set(r.type, (noOutputByType.get(r.type) ?? 0) + 1);
      continue;
    }
    for (const o of r.outputs) {
      const set = craftable.get(o) ?? new Set<string>();
      set.add(r.type);
      craftable.set(o, set);
    }
  }

  // receitas acrescentadas pelos scripts (depois das remocoes, que valem para as receitas dos datapacks)
  const additions = parseKubejsAdditions(scripts);
  for (const r of additions.recipes) {
    for (const o of r.outputs) {
      const set = craftable.get(o) ?? new Set<string>();
      set.add(r.type);
      craftable.set(o, set);
    }
  }

  const inputFilters = filters.filter((f) => f.input !== undefined).map((f) => f.where);
  if (unparsed.length > 0 || inputFilters.length > 0) {
    ctx.report.warn(
      "W_RECIPE_KUBEJS_REMOVAL_UNPARSED",
      `${unparsed.length} remocao(oes) do kubejs dinamicas e ${inputFilters.length} por input nao aplicadas (lista no report, secao recipes)`,
      { unparsed, inputFilters },
    );
  }
  const sortObj = (m: Map<string, number>) => Object.fromEntries([...m].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
  ctx.report.section("recipes", {
    files: files.length,
    recipeIds: recipes.size,
    overriddenById: overridden,
    status: statusCount,
    unknownConditionTypes: sortObj(unknownTypes),
    droppedForCatalog: droppedCatalog.sort((a, b) => (a.id < b.id ? -1 : 1)),
    noOutputByType: sortObj(noOutputByType),
    kubejsRemovalFilters: filters.length,
    removedByKubejs: removed.filter(relevant).sort((a, b) => (a.id < b.id ? -1 : 1)),
    removedByKubejsTotal: removed.length,
    kubejsRemovalsUnparsed: unparsed,
    kubejsRemovalsByInputNotApplied: inputFilters,
    kubejsAdded: additions.recipes.length,
    kubejsAddedForCatalog: additions.recipes.filter(relevant).map((r) => ({ id: r.id, type: r.type, outputs: r.outputs, where: r.where })),
    kubejsAdditionsUnparsed: additions.unparsed,
  });
  return { craftable, recipes, removed, unparsedRemovals: unparsed, scriptRecipes: additions.recipes };
}

/** itemId -> conjunto de tipos de receita ("minecraft:crafting_shaped", "create:pressing", ...). */
export function collectCraftable(ctx: Pick<PipelineContext, "reader" | "report">, catalogIds?: ReadonlySet<string>): Map<string, Set<string>> {
  return collectRecipes(ctx, catalogIds).craftable;
}
