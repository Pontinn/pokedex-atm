// B2.2 (Onda 0): lang PT/EN + merge de especies por precedencia (SPEC 5.1.2).
// (a) species/**.json de addon = override completo: o Cobblemon base vence SO nos campos de BASE_WINS_FIELDS
//     (lista fechada); qualquer outro campo presente no addon (ex. implemented) vale o do addon;
//     forms[] = uniao por name (o addon substitui a forma de mesmo nome); labels = uniao.
// (b) species_additions/**.json = merge aditivo estilo datapack: campo presente na adicao sobrescreve/estende
//     (forms uniao por name com a adicao vencendo campo a campo; drops substitui; evolutions/implemented da adicao;
//     labels/features uniao; demais campos = valor da adicao).
import path from "node:path";
import type { AbilityRef, BaseStats, SpeciesDrop, SpeciesMoves, TypeId } from "../../../../src/data/types";
import { normalizeSearch } from "../../../../src/domain/normalize";
import type { LangTable, MergedForm, MergedSpecies, PipelineContext, ReportSink } from "../context";
import { loadLang } from "../lang";
import { PipelineError } from "../lib/errors";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { collectSpecies, type AdditionEntry, type CollectedSpecies, type SpeciesFileEntry } from "./collect";

export const EXPECTED_SPECIES = 1027;

/** Campos em que o Cobblemon base vence um override completo de addon (mecanismo (a)). */
export const BASE_WINS_FIELDS = [
  "baseStats",
  "moves",
  "evolutions",
  "abilities",
  "eggGroups",
  "drops",
  "catchRate",
  "weight",
  "height",
  "maleRatio",
  "preEvolution",
] as const;

const TYPE_IDS: ReadonlySet<string> = new Set<TypeId>([
  "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
]);

const IGNORED_MOVE_PREFIXES = new Set(["legacy", "special", "form_change"]);

// ---------------------------------------------------------------------------
// Merge-report
// ---------------------------------------------------------------------------

export interface MergeReport {
  overrides: {
    dex: number;
    slug: string;
    source: string;
    file: string;
    /** campos da lista BASE_WINS_FIELDS em que o addon diferia do base (o base venceu) */
    baseFieldDiffs: string[];
    /** campos fora da lista em que o addon diferia (o valor do addon foi aplicado) */
    otherFieldDiffs: string[];
    formsAdded: string[];
    formsReplaced: string[];
    labelsAdded: string[];
  }[];
  additions: { target: string; dex: number; source: string; file: string; fields: string[]; formsAdded: string[]; formsMerged: string[] }[];
  unmatchedAdditions: { target: string; source: string; file: string }[];
  slugMismatches: { dex: number; baseSlug: string; overrideSlug: string; source: string }[];
  missingNames: string[];
  notImplemented: string[];
  ignoredMovePrefixes: Record<string, number>;
  unknownMovePrefixes: Record<string, number>;
  langConflicts: number;
  langConflictSample: { key: string; lang: string; kept: string; ignored: string; origin: string }[];
}

function emptyReport(): MergeReport {
  return {
    overrides: [],
    additions: [],
    unmatchedAdditions: [],
    slugMismatches: [],
    missingNames: [],
    notImplemented: [],
    ignoredMovePrefixes: {},
    unknownMovePrefixes: {},
    langConflicts: 0,
    langConflictSample: [],
  };
}

// ---------------------------------------------------------------------------
// Helpers de parse (JSON do Cobblemon -> formato interno)
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, fallback = 0): number => (typeof v === "number" && Number.isFinite(v) ? v : fallback);
const strArray = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
const same = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
const union = (a: readonly string[], b: readonly string[]): string[] => [...new Set([...a, ...b])];

export function parseTypes(obj: Json): TypeId[] {
  const out: TypeId[] = [];
  for (const key of ["primaryType", "secondaryType"]) {
    const t = obj[key];
    if (typeof t === "string" && TYPE_IDS.has(t.toLowerCase())) out.push(t.toLowerCase() as TypeId);
  }
  return out;
}

export function parseStats(v: unknown): BaseStats | null {
  if (!isObject(v)) return null;
  return {
    hp: num(v.hp),
    attack: num(v.attack),
    defence: num(v.defence),
    specialAttack: num(v.special_attack),
    specialDefence: num(v.special_defence),
    speed: num(v.speed),
  };
}

/**
 * "h:<id>" -> hidden; duplicados removidos por (id, hidden). A mesma habilidade listada como normal E como
 * oculta ("levitate", "h:levitate" no Gastly) gera as DUAS entradas, preservando o papel de oculta
 * (BUGFIX auditoria A1: a deduplicacao por id perdia a marca de oculta em 169 especies).
 */
export function parseAbilities(v: unknown): AbilityRef[] {
  const out: AbilityRef[] = [];
  const seen = new Set<string>();
  for (const raw of strArray(v)) {
    const hidden = raw.startsWith("h:");
    const id = hidden ? raw.slice(2) : raw;
    const key = `${id}|${hidden}`;
    if (!id || seen.has(key)) continue;
    seen.add(key);
    out.push({ id, hidden });
  }
  return out;
}

/** "<n>:<move>" (nivel), "egg:", "tm:", "tutor:"; legacy/special/form_change ignorados; outros vao para o report. */
export function parseMoves(v: unknown, report?: MergeReport): SpeciesMoves {
  const moves: SpeciesMoves = { level: [], tm: [], egg: [], tutor: [] };
  const seen = { tm: new Set<string>(), egg: new Set<string>(), tutor: new Set<string>() };
  for (const raw of strArray(v)) {
    const idx = raw.indexOf(":");
    if (idx < 0) continue;
    const prefix = raw.slice(0, idx);
    const move = raw.slice(idx + 1);
    if (/^\d+$/.test(prefix)) {
      moves.level.push({ level: Number(prefix), move });
    } else if (prefix === "tm" || prefix === "egg" || prefix === "tutor") {
      if (!seen[prefix].has(move)) {
        seen[prefix].add(move);
        moves[prefix].push(move);
      }
    } else if (IGNORED_MOVE_PREFIXES.has(prefix)) {
      if (report) report.ignoredMovePrefixes[prefix] = (report.ignoredMovePrefixes[prefix] ?? 0) + 1;
    } else if (report) {
      report.unknownMovePrefixes[prefix] = (report.unknownMovePrefixes[prefix] ?? 0) + 1;
    }
  }
  moves.level.sort((a, b) => a.level - b.level);
  return moves;
}

/** drops.entries[] achatado; amount descartado de proposito (SPEC 5.1.3). */
export function parseDrops(v: unknown): SpeciesDrop[] {
  if (!isObject(v) || !Array.isArray(v.entries)) return [];
  const out: SpeciesDrop[] = [];
  for (const e of v.entries) {
    if (!isObject(e) || typeof e.item !== "string") continue;
    out.push({
      item: e.item,
      percentage: typeof e.percentage === "number" ? e.percentage : null,
      quantityRange: typeof e.quantityRange === "string" ? e.quantityRange : typeof e.quantityRange === "number" ? String(e.quantityRange) : null,
    });
  }
  return out;
}

export function parseForm(raw: Json, source: string): MergedForm {
  return {
    name: typeof raw.name === "string" ? raw.name : "",
    source,
    aspects: strArray(raw.aspects),
    battleOnly: raw.battleOnly === true,
    labels: strArray(raw.labels),
    types: parseTypes(raw),
    baseStats: parseStats(raw.baseStats),
    abilities: parseAbilities(raw.abilities),
    raw,
  };
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

interface Working {
  dex: number;
  slug: string;
  source: string;
  file: string;
  json: Json;
  /** forma -> origem */
  forms: { raw: Json; source: string }[];
  origins: Record<string, string[]>;
}

function addOrigin(w: Working, field: string, source: string): void {
  const list = (w.origins[field] ??= []);
  if (!list.includes(source)) list.push(source);
}

function formsOf(json: Json, source: string): { raw: Json; source: string }[] {
  return (Array.isArray(json.forms) ? json.forms : []).filter(isObject).map((raw) => ({ raw, source }));
}

/** Aplica os dois mecanismos e devolve o estado bruto por dex. */
export function mergeRaw(collected: CollectedSpecies, report: MergeReport): Map<number, Working> {
  const byDex = new Map<number, Working>();
  const bySlug = new Map<string, Working>();

  // (a) arquivos de especie, na ordem de precedencia (Cobblemon primeiro)
  for (const entry of collected.species) {
    const dexValue = entry.data.nationalPokedexNumber;
    if (typeof dexValue !== "number" || !Number.isInteger(dexValue)) {
      throw new PipelineError("E_SPECIES_INVALID", "especie sem nationalPokedexNumber", `${entry.source}!${entry.path}`);
    }
    const existing = byDex.get(dexValue);
    if (!existing) {
      const w: Working = {
        dex: dexValue,
        slug: entry.slug,
        source: entry.source,
        file: entry.path,
        json: { ...entry.data },
        forms: formsOf(entry.data, entry.source),
        origins: {},
      };
      byDex.set(dexValue, w);
      bySlug.set(entry.slug, w);
      continue;
    }
    applyOverride(existing, entry, report);
  }

  // (b) species_additions (jars na ordem, depois kubejs)
  for (const add of collected.additions) {
    const w = bySlug.get(add.target);
    if (!w) {
      report.unmatchedAdditions.push({ target: add.target, source: add.source, file: add.path });
      continue;
    }
    applyAddition(w, add, report);
  }
  return byDex;
}

function applyOverride(w: Working, entry: SpeciesFileEntry, report: MergeReport): void {
  if (entry.slug !== w.slug) {
    report.slugMismatches.push({ dex: w.dex, baseSlug: w.slug, overrideSlug: entry.slug, source: entry.source });
  }
  const baseFieldDiffs: string[] = [];
  const otherFieldDiffs: string[] = [];
  for (const [key, value] of Object.entries(entry.data)) {
    if (key === "forms" || key === "labels") continue;
    if (same(w.json[key], value)) continue;
    if ((BASE_WINS_FIELDS as readonly string[]).includes(key)) {
      baseFieldDiffs.push(key);
    } else {
      // fora da lista fechada de base-wins: semantica de override (valor do addon quando presente)
      w.json[key] = value;
      otherFieldDiffs.push(key);
      addOrigin(w, key, entry.source);
    }
  }
  const formsAdded: string[] = [];
  const formsReplaced: string[] = [];
  for (const form of formsOf(entry.data, entry.source)) {
    const name = typeof form.raw.name === "string" ? form.raw.name : "";
    const idx = w.forms.findIndex((f) => f.raw.name === name);
    if (idx >= 0) {
      if (!same(w.forms[idx]?.raw, form.raw)) {
        w.forms[idx] = form;
        formsReplaced.push(name);
      }
    } else {
      w.forms.push(form);
      formsAdded.push(name);
    }
  }
  if (formsAdded.length || formsReplaced.length) addOrigin(w, "forms", entry.source);
  const baseLabels = strArray(w.json.labels);
  const labelsAdded = strArray(entry.data.labels).filter((l) => !baseLabels.includes(l));
  if (labelsAdded.length) {
    w.json.labels = union(baseLabels, labelsAdded);
    addOrigin(w, "labels", entry.source);
  }
  report.overrides.push({
    dex: w.dex,
    slug: w.slug,
    source: entry.source,
    file: entry.path,
    baseFieldDiffs,
    otherFieldDiffs,
    formsAdded,
    formsReplaced,
    labelsAdded,
  });
}

function applyAddition(w: Working, add: AdditionEntry, report: MergeReport): void {
  const fields: string[] = [];
  const formsAdded: string[] = [];
  const formsMerged: string[] = [];
  for (const [key, value] of Object.entries(add.data)) {
    if (key === "target") continue;
    if (key === "forms") {
      for (const form of formsOf(add.data, add.source)) {
        const name = typeof form.raw.name === "string" ? form.raw.name : "";
        const idx = w.forms.findIndex((f) => f.raw.name === name);
        if (idx >= 0) {
          const current = w.forms[idx] as { raw: Json; source: string };
          w.forms[idx] = { raw: { ...current.raw, ...form.raw }, source: current.source };
          formsMerged.push(name);
        } else {
          w.forms.push(form);
          formsAdded.push(name);
        }
      }
    } else if (key === "labels" || key === "features") {
      w.json[key] = union(strArray(w.json[key]), strArray(value));
    } else {
      // drops (objeto inteiro), evolutions, implemented e demais campos: valor da adicao
      w.json[key] = value;
    }
    fields.push(key);
    addOrigin(w, key, add.source);
  }
  report.additions.push({ target: add.target, dex: w.dex, source: add.source, file: add.path, fields, formsAdded, formsMerged });
}

function generationOf(labels: readonly string[]): string {
  if (labels.includes("custom")) return "custom";
  return labels.find((l) => /^gen\d/.test(l)) ?? "custom";
}

function pokedexText(json: Json, slug: string, lang: LangTable): MergedSpecies["pokedexText"] {
  const keys = strArray(json.pokedex);
  const list = keys.length ? keys : [`cobblemon.species.${slug}.desc`];
  const parts = list.map((k) => (lang.has(k) ? lang.text(k) : null)).filter((t): t is NonNullable<typeof t> => t !== null);
  if (parts.length === 0) return null;
  return { pt: parts.map((p) => p.pt).join(" "), en: parts.map((p) => p.en).join(" ") };
}

/** Converte o estado bruto em MergedSpecies (nomes do lang, parse de golpes/habilidades/drops). */
export function finalizeSpecies(w: Working, lang: LangTable, report: MergeReport): MergedSpecies {
  const json = w.json;
  const nameKey = `cobblemon.species.${w.slug}.name`;
  let name = lang.has(nameKey) ? lang.text(nameKey) : null;
  if (!name) {
    const fallback = typeof json.name === "string" ? json.name : w.slug;
    name = { pt: fallback, en: fallback };
    report.missingNames.push(w.slug);
  }
  const labels = strArray(json.labels);
  const implemented = json.implemented === true;
  if (!implemented) report.notImplemented.push(w.slug);
  const baseStats = parseStats(json.baseStats);
  if (!baseStats) throw new PipelineError("E_SPECIES_INVALID", `especie sem baseStats: ${w.slug}`, w.file);
  return {
    dex: w.dex,
    slug: w.slug,
    source: w.source,
    file: w.file,
    name,
    pokedexText: pokedexText(json, w.slug, lang),
    generation: generationOf(labels),
    labels,
    implemented,
    types: parseTypes(json),
    baseStats,
    evYield: parseStats(json.evYield) ?? { hp: 0, attack: 0, defence: 0, specialAttack: 0, specialDefence: 0, speed: 0 },
    abilities: parseAbilities(json.abilities),
    eggGroups: strArray(json.eggGroups),
    catchRate: num(json.catchRate),
    baseFriendship: num(json.baseFriendship),
    eggCycles: num(json.eggCycles),
    experienceGroup: typeof json.experienceGroup === "string" ? json.experienceGroup : "",
    height: num(json.height),
    weight: num(json.weight),
    maleRatio: num(json.maleRatio, -1),
    moves: parseMoves(json.moves, report),
    drops: parseDrops(json.drops),
    evolutionsRaw: (Array.isArray(json.evolutions) ? json.evolutions : []).filter(isObject),
    preEvolutionRaw: typeof json.preEvolution === "string" ? json.preEvolution : null,
    forms: w.forms.map((f) => parseForm(f.raw, f.source)),
    features: strArray(json.features),
    raw: json,
    origins: w.origins,
  };
}

/** Merge completo (puro, sem IO): usado por runSpeciesCore e pelos testes com fixtures. */
export function mergeSpecies(
  collected: CollectedSpecies,
  lang: LangTable,
): { species: Map<number, MergedSpecies>; report: MergeReport } {
  const report = emptyReport();
  const raw = mergeRaw(collected, report);
  const species = new Map<number, MergedSpecies>();
  for (const dex of [...raw.keys()].sort((a, b) => a - b)) {
    species.set(dex, finalizeSpecies(raw.get(dex) as Working, lang, report));
  }
  return { species, report };
}

/** searchKey do indice (B2.5 usa): nomes pt e en normalizados, separados por "|". */
export function speciesSearchKey(s: Pick<MergedSpecies, "name">): string {
  return `${normalizeSearch(s.name.pt)}|${normalizeSearch(s.name.en)}`;
}

function summarize(report: MergeReport, sink: ReportSink): void {
  if (report.unmatchedAdditions.length) {
    sink.warn("W_ADDITION_UNMATCHED", `${report.unmatchedAdditions.length} species_additions sem especie alvo`, report.unmatchedAdditions);
  }
  if (report.missingNames.length) sink.warn("W_NAME_MISSING", `${report.missingNames.length} especies sem nome no lang`, report.missingNames);
  if (Object.keys(report.unknownMovePrefixes).length) {
    sink.warn("W_MOVE_PREFIX", "prefixos de golpe desconhecidos", report.unknownMovePrefixes);
  }
  sink.section("speciesCore", {
    overrides: report.overrides.length,
    additions: report.additions.length,
    unmatchedAdditions: report.unmatchedAdditions.length,
    slugMismatches: report.slugMismatches.length,
    missingNames: report.missingNames.length,
    notImplemented: report.notImplemented.length,
    ignoredMovePrefixes: report.ignoredMovePrefixes,
    unknownMovePrefixes: report.unknownMovePrefixes,
    langConflicts: report.langConflicts,
  });
}

/** Lang + especies (sempre roda, inclusive com --only). */
export async function runSpeciesCore(ctx: PipelineContext): Promise<void> {
  const langResult = loadLang(ctx.reader, ctx.report);
  ctx.lang = langResult.table;
  const collected = collectSpecies(ctx.reader);
  const { species, report } = mergeSpecies(collected, ctx.lang);
  report.langConflicts = langResult.conflicts.length;
  report.langConflictSample = langResult.conflicts.slice(0, 50);
  ctx.species = species;
  ctx.setCount("species", species.size);
  if (species.size !== EXPECTED_SPECIES) {
    ctx.report.warn("W_SPECIES_COUNT", `esperado ${EXPECTED_SPECIES} especies, calculado ${species.size}`);
  }
  summarize(report, ctx.report);
  writeJsonAtomic(path.join(ctx.outDir, "merge-report.json"), report, { pretty: true });
}
