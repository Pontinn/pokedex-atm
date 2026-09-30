// Auditoria independente (A1): valores ESPERADOS derivados do snapshot cru seguindo as regras escritas
// na SPEC 5.1.2-5.1.5, B2.2-B2.4, B4.3 e B5.x. Nao importa nada de tools/dataset/src (regra de independencia).
import fs from "node:fs";
import path from "node:path";
import { datapackFiles, DEFAULT_SRC, findJar, loadOrder, readJson, rel, sources, walk, type RawSource } from "./raw";

export type Bucket = "common" | "uncommon" | "rare" | "ultra-rare";
export const BUCKET_ORDER: Bucket[] = ["common", "uncommon", "rare", "ultra-rare"];

// ---------------------------------------------------------------------------------------------
// Formas cruas dos arquivos lidos por readJson (snapshot); somente os campos usados aqui.
// ---------------------------------------------------------------------------------------------
interface RawBaseStats {
  hp: number;
  attack: number;
  defence: number;
  special_attack: number;
  special_defence: number;
  speed: number;
}

interface RawForm {
  name: string;
  aspects?: string[];
  battleOnly?: boolean;
  primaryType?: string;
  secondaryType?: string;
}

interface RawEvolutionRequirement {
  variant?: string;
  minLevel?: number;
  amount?: number;
  range?: string;
  type?: string;
  itemCondition?: string | Record<string, unknown>;
}

interface RawEvolution {
  id?: string;
  result?: string;
  variant?: string;
  requiredContext?: string;
  requirements?: RawEvolutionRequirement[];
}

interface RawDrop {
  item: string;
  percentage?: number;
  quantityRange?: string;
}

interface RawSpeciesJson {
  nationalPokedexNumber: number;
  name?: string;
  forms?: RawForm[];
  labels?: string[];
  features?: string[];
  baseStats: RawBaseStats;
  abilities: string[];
  eggGroups: string[];
  catchRate: number;
  weight: number;
  height: number;
  maleRatio: number;
  primaryType: string;
  secondaryType?: string;
  pokedex?: string[];
  preEvolution?: string;
  evolutions?: RawEvolution[];
  drops?: { entries?: RawDrop[] };
  [key: string]: unknown;
}

interface RawAddition extends RawSpeciesJson {
  target?: string;
}

interface RawSpawnEntry {
  pokemon?: string;
  id: string | number;
  bucket: Bucket;
  level?: string | number;
  spawnablePositionType?: string;
  context?: string;
  condition?: { biomes?: string[]; bait?: string; rodType?: string; minLureLevel?: number; maxLureLevel?: number; [k: string]: unknown };
  weightMultiplier?: { multiplier: number; condition?: Record<string, unknown> };
  weightMultipliers?: { multiplier: number; condition?: Record<string, unknown> }[];
}

interface RawSpawnFile {
  enabled?: boolean;
  spawns?: RawSpawnEntry[];
}

interface RawFossilFile {
  result: string;
  fossils: string[];
}

interface RawMegaFile {
  aspect_conditions?: { apply?: { aspects?: string[] } };
  pokemons?: string[];
}

interface RawTrainerMob {
  optional?: boolean;
  series?: string[];
  requiredDefeats?: string[][];
}

interface RawTrainerTeamMember {
  level?: number;
}

interface RawTrainerFile {
  name?: string;
  team?: RawTrainerTeamMember[];
}

export interface ExpSpawn {
  id: string;
  source: string;
  bucket: Bucket;
  level: string;
  context: string;
  biomes: string[];
  file: string;
  /** arquivo com enabled:false (nao nasce no jogo) */
  disabled: boolean;
  /** arquivo substituido por outro pacote com o mesmo resource location (kubejs vence jar; entre jars vence o mod que carrega depois) */
  shadowedBy: string | null;
  /** colide com estes pacotes sem nenhuma ordem de carga declarada (indeterminavel; somado) */
  unorderedWith: string[];
  /** spawn-bait: condicoes de pesca (mesma forma de SpawnEntry.fishing, chaves na ordem do contrato) */
  fishing: ExpFishing | null;
}

export interface ExpFishing {
  bait: string | null;
  rodType: string | null;
  rodBall: string | null;
  minLureLevel: number | null;
  maxLureLevel: number | null;
  lureMultipliers: { lureMin: number | null; lureMax: number | null; multiplier: number }[];
}

export interface ExpBaitItem {
  effects: { kind: string; subcategory: string | null; chance: number; value: number | null }[];
  seasoning: boolean;
  file: string;
}

export interface ExpPotRecipe {
  type: string;
  ingredients: { kind: string; id: string; count: number }[];
  file: string;
}

/** berry-mutations: origem e cruzamentos esperados de uma baga (data/cobblemon/berries/<id>.json). */
export interface ExpBerry {
  spawn: { variant: string; biomeTags: string[] }[];
  mutationPairs: { a: string; b: string }[];
  mutationUses: { partner: string; result: string }[];
  file: string;
}

export interface ExpEdge {
  id: string;
  toSlug: string;
  variant: string;
  requiredItem: string | null;
  requirements: string[]; // normalizadas "level:16", "friendship:160", "timeRange:day", "hasMoveType:fairy", "heldItem:x", "other:<variant>"
}

export interface ExpForm {
  name: string;
  aspects: string[];
  battleOnly: boolean;
  types: string[];
  source: string;
  requiredItems: string[];
}

export interface ExpSpecies {
  dex: number;
  slug: string;
  file: string; // arquivo base (cru) de onde veio a especie
  touchedBy: string[]; // origens que alteraram (override/adicao)
  name: { pt: string | null; en: string | null };
  desc: { pt: string | null; en: string | null };
  types: string[];
  labels: string[];
  generation: string;
  baseStats: Record<string, number>;
  abilities: { id: string; hidden: boolean }[];
  eggGroups: string[];
  catchRate: number;
  weight: number;
  height: number;
  maleRatio: number;
  forms: ExpForm[];
  evolutions: ExpEdge[];
  preEvolution: { dex: number; slug: string } | null;
  drops: { item: string; percentage: number | null; quantityRange: string | null }[];
  /** spawns que valem no jogo (sem enabled:false e sem arquivo sombreado) */
  spawns: ExpSpawn[];
  /** todos os spawns lidos, regra literal da SPEC ("TODAS as entradas") */
  spawnsAll: ExpSpawn[];
  rarity: { primary: Bucket | null; secondary: Bucket[] };
  rarityAll: { primary: Bucket | null; secondary: Bucket[] };
  fossils: { items: string[]; source: string }[];
  obtainKinds: string[];
}

export interface ExpBall {
  id: string;
  itemId: string;
  rule: Record<string, unknown>;
  tooltip: { pt: string | null; en: string | null };
  textureFile: string;
}

export interface ExpSeries {
  id: string;
  keyTrainers: string[]; // ordem topologica esperada
  deps: Record<string, string[][]>; // trainer -> grupos de required defeats (E de OUs) dentro da serie
  maxLevel: Record<string, number>;
  sourceOf: Record<string, "rctmod" | "kubejs">;
}

export interface Expected {
  src: string;
  species: Map<number, ExpSpecies>;
  slugToDex: Map<string, number>;
  fossilRoutes: { result: string; fossils: string[]; source: string; file: string }[];
  balls: ExpBall[];
  series: ExpSeries[];
  levelCap: { initialLevelCap: number; relativeLevelCap: number; initialSeries: string; freeroamRequiresCompletedSeries: boolean };
  lang: Lang;
  itemTextures: Set<string>; // "<ns>:<path>" com textura em assets/<ns>/textures/item/**
  /** spawn-bait: item -> efeitos de isca (spawn_bait_effects do cobblemon, kubejs vence) + tempero aceito pela panela */
  baitItems: Map<string, ExpBaitItem>;
  /** spawn-bait: item de saida -> receita da panela com seasoningTag bait_seasoning (fonte cobblemon) */
  potRecipes: Map<string, ExpPotRecipe>;
  /** berry-mutations: item -> spawn, pares e usos (data/cobblemon/berries, ultima fonte vence) */
  berries: Map<string, ExpBerry>;
  notes: string[]; // achados estruturais descobertos durante a leitura (sombreamento, enabled:false, adicoes fora da SPEC)
}

// ---------------------------------------------------------------------------------------------
// Lang
// ---------------------------------------------------------------------------------------------
export interface Lang {
  pt: Map<string, string>;
  en: Map<string, string>;
}

function loadLang(srcs: RawSource[], extraRoots: string[]): Lang {
  const pt = new Map<string, string>();
  const en = new Map<string, string>();
  const roots = [...srcs.filter((s) => s.name !== "kubejs").map((s) => s.root), ...extraRoots];
  for (const root of roots) {
    const assets = path.join(root, "assets");
    if (!fs.existsSync(assets)) continue;
    for (const ns of fs.readdirSync(assets)) {
      for (const [code, map] of [["pt_br", pt], ["en_us", en]] as const) {
        const f = path.join(assets, ns, "lang", `${code}.json`);
        if (!fs.existsSync(f)) continue;
        const obj = readJson<Record<string, string>>(f);
        // Cobblemon (primeiro root) vence; addons so complementam (SPEC B2.2 passo 1)
        for (const [k, v] of Object.entries(obj)) if (!map.has(k)) map.set(k, v);
      }
    }
  }
  // kubejs/assets/<ns>/lang vale por cima dos jars (no jogo o kubejs e aplicado depois; item-descriptions D6).
  // JSON invalido e ignorado; entre pastas do kubejs a primeira em ordem alfabetica vence.
  const kube = srcs.find((s) => s.name === "kubejs");
  const kubeAssets = kube ? path.join(kube.root, "assets") : null;
  const kubeSet = new Set<string>();
  if (kubeAssets && fs.existsSync(kubeAssets)) {
    for (const ns of fs.readdirSync(kubeAssets).sort()) {
      for (const [code, map] of [["pt_br", pt], ["en_us", en]] as const) {
        const f = path.join(kubeAssets, ns, "lang", `${code}.json`);
        if (!fs.existsSync(f)) continue;
        let obj: Record<string, string>;
        try {
          obj = readJson<Record<string, string>>(f);
        } catch {
          continue;
        }
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v !== "string" || kubeSet.has(`${code}|${k}`)) continue;
          kubeSet.add(`${code}|${k}`);
          map.set(k, v);
        }
      }
    }
  }
  return { pt, en };
}

// ---------------------------------------------------------------------------------------------
// Especies
// ---------------------------------------------------------------------------------------------
const CORE_BASE_WINS = [
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
];

function normName(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function unionBy<T>(a: T[], b: T[], key: (x: T) => string): T[] {
  const out = new Map<string, T>();
  for (const x of a) out.set(key(x), x);
  for (const x of b) out.set(key(x), x); // b vence
  return [...out.values()];
}

interface Working {
  json: RawSpeciesJson;
  file: string;
  touchedBy: string[];
  formSource: Map<string, string>;
}

function applyAddition(w: Working, add: RawAddition, origin: string) {
  for (const [k, v] of Object.entries(add)) {
    if (k === "target") continue;
    if (k === "forms") {
      const forms = (v as RawForm[]) ?? [];
      w.json.forms = unionBy<RawForm>(w.json.forms ?? [], forms, (f) => f.name);
      for (const f of forms) w.formSource.set(f.name, origin);
    } else if (k === "labels" || k === "features") {
      const existing = (w.json[k] as string[] | undefined) ?? [];
      w.json[k] = [...new Set([...existing, ...((v as string[]) ?? [])])];
    } else {
      w.json[k] = v; // drops, evolutions, implemented e escalares: valor da adicao
    }
  }
  w.touchedBy.push(origin);
}

function mapRequirement(r: RawEvolutionRequirement): string {
  switch (r.variant) {
    case "level":
      return `level:${r.minLevel}`;
    case "friendship":
      return `friendship:${r.amount}`;
    case "time_range":
      return `timeRange:${r.range}`;
    case "has_move_type":
      return `hasMoveType:${r.type}`;
    case "held_item":
      return `heldItem:${typeof r.itemCondition === "string" ? r.itemCondition : JSON.stringify(r.itemCondition)}`;
    default:
      return `other:${r.variant}`;
  }
}

export function rarityOf(spawns: { bucket: Bucket }[]): { primary: Bucket | null; secondary: Bucket[] } {
  const present = BUCKET_ORDER.filter((b) => spawns.some((s) => s.bucket === b));
  return { primary: present[0] ?? null, secondary: present.slice(1) };
}

export function buildExpected(src: string = DEFAULT_SRC): Expected {
  const notes: string[] = [];
  const srcs = sources(src);
  const rctRoot = findJar(src, "rctmod-neoforge");
  const lang = loadLang(srcs, [rctRoot]);

  // (1) especies base + override completo (mecanismo a)
  const work = new Map<number, Working>();
  const slugToDex = new Map<string, number>();
  for (const s of srcs) {
    for (const { file } of datapackFiles(s, "species").filter((f) => f.ns === "cobblemon")) {
      const j = readJson<RawSpeciesJson>(file);
      const dex = j.nationalPokedexNumber;
      const slug = path.basename(file, ".json");
      const cur = work.get(dex);
      if (!cur) {
        work.set(dex, { json: structuredClone(j), file, touchedBy: [s.name], formSource: new Map((j.forms ?? []).map((f): [string, string] => [f.name, s.name])) });
        slugToDex.set(slug, dex);
        continue;
      }
      // override: base vence nos campos centrais; forms uniao (addon vence); labels uniao; demais = addon
      const base = cur.json;
      const merged: RawSpeciesJson = { ...base };
      for (const [k, v] of Object.entries(j)) {
        if (CORE_BASE_WINS.includes(k)) continue;
        if (k === "forms") {
          merged.forms = unionBy<RawForm>(base.forms ?? [], (v as RawForm[]) ?? [], (f) => f.name);
          for (const f of (v as RawForm[]) ?? []) cur.formSource.set(f.name, s.name);
        } else if (k === "labels") merged.labels = [...new Set([...(base.labels ?? []), ...((v as string[]) ?? [])])];
        else merged[k] = v;
      }
      cur.json = merged;
      cur.touchedBy.push(s.name);
    }
  }

  // (2) species_additions (mecanismo b), todos os namespaces, kubejs sombreia jar no mesmo resource location
  const addFiles: { file: string; rl: string; origin: string }[] = [];
  const seenRl = new Map<string, string>();
  for (const s of srcs) for (const f of datapackFiles(s, "species_additions")) addFiles.push({ file: f.file, rl: f.rl, origin: s.name + (f.ns !== "cobblemon" ? `(${f.ns})` : "") });
  const kubeRl = new Set(addFiles.filter((a) => a.origin.startsWith("kubejs")).map((a) => a.rl));
  for (const a of addFiles) {
    if (!a.origin.startsWith("kubejs") && kubeRl.has(a.rl)) {
      notes.push(`species_additions sombreado pelo kubejs (mesmo resource location ${a.rl}): ${rel(a.file)} nao vale no jogo`);
      continue;
    }
    if (seenRl.has(a.rl)) notes.push(`species_additions com resource location duplicado entre jars: ${a.rl} (${seenRl.get(a.rl)} e ${a.origin})`);
    seenRl.set(a.rl, a.origin);
    if (a.origin.startsWith("legendarymonuments")) {
      // SPEC 5.1.2 lista allthemons/ccc/mega_showdown/zamega/kubejs, mas o jogo aplica tambem estas
    }
    const j = readJson<RawAddition>(a.file);
    const target = String(j.target ?? "").replace(/^cobblemon:/, "");
    const dex = slugToDex.get(target);
    if (dex === undefined) {
      notes.push(`species_additions para especie inexistente: ${rel(a.file)} (${j.target})`);
      continue;
    }
    applyAddition(work.get(dex)!, j, a.origin);
  }
  const lmCount = addFiles.filter((a) => a.origin.startsWith("legendarymonuments")).length;
  if (lmCount) notes.push(`${lmCount} species_additions do legendarymonuments (namespaces cobblemon_drops e legendarymonuments) valem no jogo e NAO estao na lista da SPEC 5.1.2`);

  // (3) spawns. Colisao de resource location (semantica de datapack do jogo):
  //   (a) arquivo do kubejs substitui o do jar; (b) entre jars, o do mod que carrega DEPOIS substitui o anterior
  //   (fecho transitivo de ordering AFTER/BEFORE nos neoforge.mods.toml); (c) par sem ordem nenhuma: indeterminavel,
  //   os dois sao somados e marcados como SEM ORDEM.
  const order = loadOrder(src);
  const modOf = new Map(srcs.map((s) => [s.name, order.modIdOf(s.root)]));
  const spawnFiles: { file: string; rl: string; source: string }[] = [];
  for (const s of srcs) for (const f of datapackFiles(s, "spawn_pool_world")) spawnFiles.push({ file: f.file, rl: f.rl, source: s.name });
  const byRl = new Map<string, string[]>();
  for (const f of spawnFiles) byRl.set(f.rl, [...(byRl.get(f.rl) ?? []), f.source]);
  const resolveCollision = (source: string, owners: string[]): { shadowedBy: string | null; unorderedWith: string[] } => {
    const others = owners.filter((o) => o !== source);
    if (!others.length) return { shadowedBy: null, unorderedWith: [] };
    if (source === "kubejs") return { shadowedBy: null, unorderedWith: [] };
    if (others.includes("kubejs")) return { shadowedBy: "kubejs", unorderedWith: [] };
    const me = modOf.get(source);
    const later = others.filter((o) => me && modOf.get(o) && order.cmp(me, modOf.get(o)!) === -1);
    if (later.length) return { shadowedBy: later.join("/"), unorderedWith: [] };
    const unordered = others.filter((o) => !me || !modOf.get(o) || order.cmp(me, modOf.get(o)!) === 0);
    return { shadowedBy: null, unorderedWith: unordered };
  };
  const rods = readPokeRods(srcs);
  const spawnsAllByDex = new Map<number, ExpSpawn[]>();
  for (const f of spawnFiles) {
    const j = readJson<RawSpawnFile>(f.file);
    const { shadowedBy, unorderedWith } = resolveCollision(f.source, byRl.get(f.rl)!);
    for (const sp of j.spawns ?? []) {
      const slug = String(sp.pokemon ?? "").split(" ")[0]!;
      const dex = slugToDex.get(slug);
      if (dex === undefined) continue;
      const e: ExpSpawn = {
        id: String(sp.id),
        source: f.source,
        bucket: sp.bucket,
        level: String(sp.level ?? ""),
        context: String(sp.spawnablePositionType ?? sp.context ?? ""),
        biomes: [...(sp.condition?.biomes ?? [])],
        file: rel(f.file),
        disabled: j.enabled === false,
        shadowedBy,
        unorderedWith,
        fishing: expFishing(sp, rods),
      };
      spawnsAllByDex.set(dex, [...(spawnsAllByDex.get(dex) ?? []), e]);
    }
  }
  const disabledFiles = new Set(spawnFiles.filter((f) => readJson<RawSpawnFile>(f.file).enabled === false).map((f) => rel(f.file)));
  if (disabledFiles.size) notes.push(`${disabledFiles.size} arquivos spawn_pool_world com "enabled": false (nao nascem no jogo): ${[...disabledFiles].join(", ")}`);
  const kubeShadow = spawnFiles.filter((f) => f.source !== "kubejs" && (byRl.get(f.rl) ?? []).includes("kubejs"));
  if (kubeShadow.length) notes.push(`${kubeShadow.length} arquivos spawn_pool_world de jar sombreados pelo kubejs (mesmo resource location, kubejs vence no jogo): ${kubeShadow.map((f) => rel(f.file)).join(", ")}`);
  const jarCollide = [...byRl.entries()].filter(([, o]) => o.length > 1 && !o.includes("kubejs"));
  if (jarCollide.length) {
    const fmt = (rl: string) =>
      spawnFiles
        .filter((f) => f.rl === rl)
        .map((f) => {
          const j = readJson<RawSpawnFile>(f.file);
          const bs = [...new Set((j.spawns ?? []).map((s) => s.bucket))].join("/");
          return `${f.source}${j.enabled === false ? "(OFF)" : ""}=${(j.spawns ?? []).length}x ${bs}`;
        })
        .join(" vs ");
    const ordered: string[] = [];
    const unordered: string[] = [];
    for (const [rl, owners] of jarCollide) {
      const winners = owners.filter((o) => resolveCollision(o, owners).shadowedBy === null);
      const label = `${rl.replace("cobblemon:spawn_pool_world/", "")} [${fmt(rl)}]`;
      if (winners.length === 1) ordered.push(`${label} -> vence ${winners[0]}`);
      else unordered.push(`${label} -> sem ordem entre ${winners.join("/")}`);
    }
    notes.push(`${jarCollide.length} resource locations de spawn_pool_world repetidos entre jars; ordem de carga (fecho transitivo dos neoforge.mods.toml: ${order.edges.map(([a, b]) => `${a}<${b}`).join(", ")}) resolve ${ordered.length}: ${ordered.join("; ")}`);
    if (unordered.length) notes.push(`SEM ORDEM: ${unordered.length} colisoes entre jars sem nenhuma declaracao de ordem (indeterminavel pelo snapshot; a auditoria soma os dois e classifica divergencias como SEM ORDEM): ${unordered.join("; ")}`);
  }

  // (4) fosseis
  const fossilRoutes: Expected["fossilRoutes"] = [];
  for (const s of srcs) for (const f of datapackFiles(s, "fossils").filter((x) => x.ns === "cobblemon")) {
    const j = readJson<RawFossilFile>(f.file);
    fossilRoutes.push({ result: String(j.result), fossils: j.fossils, source: s.name, file: rel(f.file) });
  }

  // (5) megas: arquivos mega de mega_showdown e zamega
  const megaDefs: { item: string; pokemons: string[]; aspect: string }[] = [];
  for (const [prefix, ns, sub] of [["mega_showdown", "mega_showdown", "data/mega_showdown/mega_showdown/mega"], ["zamega", "zamega", "data/zamega/mega_showdown/mega"]] as const) {
    for (const f of walk(path.join(findJar(src, prefix), sub))) {
      const j = readJson<RawMegaFile>(f);
      const asp = (j.aspect_conditions?.apply?.aspects ?? []).map((a: string) => a.split("=")[1]).filter((x): x is string => Boolean(x));
      for (const a of asp) megaDefs.push({ item: `${ns}:${path.basename(f, ".json")}`, pokemons: j.pokemons ?? [], aspect: a });
    }
  }

  // (6) montar especies
  const species = new Map<number, ExpSpecies>();
  for (const [dex, w] of work) {
    const j = w.json;
    const slug = path.basename(w.file, ".json");
    const bs = j.baseStats;
    const types = [j.primaryType, j.secondaryType].filter(Boolean) as string[];
    const labels: string[] = j.labels ?? [];
    const gen = labels.find((l) => /^gen\d/.test(l)) ?? (labels.includes("custom") ? "custom" : "?");
    const nameKey = `cobblemon.species.${slug}.name`;
    const descKey = (j.pokedex ?? [])[0] ?? `cobblemon.species.${slug}.desc`;
    const forms: ExpForm[] = (j.forms ?? []).map((f: RawForm) => {
      const aspects: string[] = f.aspects ?? [];
      const req: string[] = [];
      for (const m of megaDefs) {
        if (!aspects.includes(m.aspect)) continue;
        if (!m.pokemons.some((p) => normName(p) === normName(j.name ?? slug))) continue;
        req.push(m.item);
      }
      if (req.length) req.push("mega_showdown:keystone");
      return {
        name: f.name,
        aspects,
        battleOnly: !!f.battleOnly,
        types: [f.primaryType ?? j.primaryType, f.secondaryType ?? (f.primaryType ? undefined : j.secondaryType)].filter(Boolean) as string[],
        source: w.formSource.get(f.name) ?? "?",
        requiredItems: [...new Set(req)],
      };
    });
    const evolutions: ExpEdge[] = (j.evolutions ?? [])
      .map((e: RawEvolution) => ({
        id: String(e.id ?? ""),
        toSlug: String(e.result ?? "").split(" ")[0]!,
        variant: String(e.variant),
        requiredItem: typeof e.requiredContext === "string" ? e.requiredContext : null,
        requirements: (e.requirements ?? []).map(mapRequirement),
      }))
      .filter((e: ExpEdge) => slugToDex.has(e.toSlug));
    const preSlug = j.preEvolution ? String(j.preEvolution).split(" ")[0]! : null;
    const preDex = preSlug ? slugToDex.get(preSlug) : undefined;
    const spawnsAll = spawnsAllByDex.get(dex) ?? [];
    const spawns = spawnsAll.filter((s) => !s.disabled && s.shadowedBy === null);
    species.set(dex, {
      dex,
      slug,
      file: rel(w.file),
      touchedBy: w.touchedBy,
      name: { pt: lang.pt.get(nameKey) ?? null, en: lang.en.get(nameKey) ?? null },
      desc: { pt: lang.pt.get(descKey) ?? null, en: lang.en.get(descKey) ?? null },
      types,
      labels,
      generation: labels.includes("custom") ? "custom" : gen,
      baseStats: {
        hp: bs.hp,
        attack: bs.attack,
        defence: bs.defence,
        specialAttack: bs.special_attack,
        specialDefence: bs.special_defence,
        speed: bs.speed,
      },
      abilities: [...new Map<string, { id: string; hidden: boolean }>((j.abilities ?? []).map((a: string) => {
        const hidden = a.startsWith("h:");
        const id = hidden ? a.slice(2) : a;
        return [`${id}|${hidden}`, { id, hidden }];
      })).values()],
      eggGroups: j.eggGroups ?? [],
      catchRate: j.catchRate,
      weight: j.weight,
      height: j.height,
      maleRatio: j.maleRatio,
      forms,
      evolutions,
      preEvolution: preSlug && preDex !== undefined ? { dex: preDex, slug: preSlug } : null,
      drops: (j.drops?.entries ?? []).map((d: RawDrop) => ({ item: d.item, percentage: d.percentage ?? null, quantityRange: d.quantityRange ?? null })),
      spawns,
      spawnsAll,
      rarity: rarityOf(spawns),
      rarityAll: rarityOf(spawnsAll),
      fossils: fossilRoutes.filter((f) => f.result === slug).map((f) => ({ items: f.fossils, source: f.source })),
      obtainKinds: [],
    });
  }

  // (7) rotas "Como obter" (SPEC 5.1.5)
  const evoMemo = new Map<number, boolean>();
  const hasEvoRoute = (dex: number, depth = 0): boolean => {
    if (evoMemo.has(dex)) return evoMemo.get(dex)!;
    const sp = species.get(dex)!;
    let r = false;
    if (sp.preEvolution && depth < 10) {
      const pre = species.get(sp.preEvolution.dex);
      r = !!pre && (pre.rarity.primary !== null || hasEvoRoute(pre.dex, depth + 1));
    }
    evoMemo.set(dex, r);
    return r;
  };
  for (const sp of species.values()) {
    const k: string[] = [];
    if (hasEvoRoute(sp.dex)) k.push("evolution");
    if (sp.fossils.length) k.push("fossil");
    if (sp.spawns.some((s) => s.source === "kubejs" || s.source === "allthemons")) k.push("packSpawn");
    if (sp.spawns.some((s) => s.source === "legendarymonuments" || s.source === "ccc") || sp.labels.includes("ultra_beast")) k.push("addon");
    if (!sp.eggGroups.includes("undiscovered")) k.push("breeding");
    if (!k.length) k.push("none");
    sp.obtainKinds = k;
  }

  // (8) bolas
  const cobJar = findJar(src, "Cobblemon-neoforge");
  const ballDir = path.join(cobJar, "assets/cobblemon/textures/item/poke_balls");
  const balls: ExpBall[] = fs
    .readdirSync(ballDir)
    .filter((n) => n.endsWith(".png"))
    .map((n) => n.replace(/\.png$/, ""))
    .sort()
    .map((id) => ({
      id,
      itemId: `cobblemon:${id}`,
      rule: BALL_RULES[id] ?? { kind: "MISSING_RULE" },
      tooltip: { pt: lang.pt.get(`item.cobblemon.${id}.tooltip`) ?? null, en: lang.en.get(`item.cobblemon.${id}.tooltip`) ?? null },
      textureFile: rel(path.join(ballDir, `${id}.png`)),
    }));

  // (9) texturas de item existentes (qualquer jar)
  const itemTextures = new Set<string>();
  for (const root of [...srcs.map((s) => s.root), rctRoot]) {
    const assets = path.join(root, "assets");
    if (!fs.existsSync(assets)) continue;
    for (const ns of fs.readdirSync(assets)) {
      const base = path.join(assets, ns, "textures", "item");
      for (const f of walk(base, ".png")) itemTextures.add(`${ns}:${path.relative(base, f).split(path.sep).join("/").replace(/\.png$/, "")}`);
    }
  }

  return {
    src,
    species,
    slugToDex,
    fossilRoutes,
    balls,
    series: buildSeries(src, rctRoot),
    levelCap: readLevelCap(src),
    lang,
    itemTextures,
    baitItems: buildBaitItems(src, srcs),
    potRecipes: buildPotRecipes(srcs),
    berries: buildBerries(srcs),
    notes,
  };
}

// ---------------------------------------------------------------------------------------------
// spawn-bait: pesca, efeitos de isca, tempero e receitas da panela (regras da SPEC 2.4 itens 2-10, reescritas aqui)
// ---------------------------------------------------------------------------------------------
const LURE_KEYS = new Set(["minLureLevel", "maxLureLevel"]);
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const numOrNull = (v: unknown): number | null => (typeof v === "number" ? v : null);

function lureOnly(m: unknown): { lureMin: number | null; lureMax: number | null; multiplier: number } | null {
  if (!isObj(m) || typeof m.multiplier !== "number" || !isObj(m.condition)) return null;
  const c = m.condition;
  const keys = Object.keys(c);
  if (!keys.length || !keys.every((k) => LURE_KEYS.has(k) && typeof c[k] === "number")) return null;
  return { lureMin: numOrNull(c.minLureLevel), lureMax: numOrNull(c.maxLureLevel), multiplier: m.multiplier };
}

/** "cobblemon:<arquivo>" -> pokeBallId de data/cobblemon/pokerods/*.json (cobblemon, depois kubejs, que vence). */
function readPokeRods(srcs: RawSource[]): Map<string, string> {
  const rods = new Map<string, string>();
  for (const s of srcs.filter((x) => x.name === "cobblemon" || x.name === "kubejs")) {
    for (const f of datapackFiles(s, "pokerods").filter((x) => x.ns === "cobblemon")) {
      const j = readJson<{ pokeBallId?: string }>(f.file);
      if (typeof j.pokeBallId === "string") rods.set(`cobblemon:${path.basename(f.file, ".json")}`, j.pokeBallId);
    }
  }
  return rods;
}

function expFishing(sp: RawSpawnEntry, rods: ReadonlyMap<string, string>): ExpFishing | null {
  const c = sp.condition ?? {};
  const bait = typeof c.bait === "string" ? c.bait : null;
  const rodType = typeof c.rodType === "string" ? c.rodType : null;
  const minLureLevel = numOrNull(c.minLureLevel);
  const maxLureLevel = numOrNull(c.maxLureLevel);
  const lureMultipliers = [lureOnly(sp.weightMultiplier), ...(sp.weightMultipliers ?? []).map(lureOnly)].filter((m): m is NonNullable<typeof m> => m !== null);
  if (bait === null && rodType === null && minLureLevel === null && maxLureLevel === null && !lureMultipliers.length) return null;
  return { bait, rodType, rodBall: rodType ? (rods.get(rodType) ?? null) : null, minLureLevel, maxLureLevel, lureMultipliers };
}

const BAIT_KIND: Record<string, string> = {
  typing: "typing", egg_group: "eggGroup", nature: "nature", ev: "ev", iv: "iv", bite_time: "biteTime", level_raise: "levelRaise",
  pokemon_chance: "pokemonChance", gender_chance: "genderChance", ha_chance: "haChance", friendship: "friendship",
  drops_reroll: "dropsReroll", shiny_reroll: "shinyReroll", rarity_bucket: "rarityBucket",
};
const BAIT_SEASONING = "cobblemon:recipe_filters/bait_seasoning";
const noNs = (id: string) => (id.includes(":") ? id.slice(id.indexOf(":") + 1) : id);

/** Tag de item resolvida (tags aninhadas, replace) a partir de data/<ns>/tags/item(s)/** das fontes, em ordem. */
function resolveTag(srcs: RawSource[], tag: string): Set<string> {
  const raw = new Map<string, string[]>();
  for (const s of srcs) {
    for (const kind of ["tags/item", "tags/items"]) {
      for (const f of datapackFiles(s, kind)) {
        const t = `${f.ns}:${f.rl.slice(`${f.ns}:${kind}/`.length).replace(/\.json$/, "")}`;
        const j = readJson<{ replace?: boolean; values?: unknown[] }>(f.file);
        const vals = (j.values ?? []).map((v) => (typeof v === "string" ? v : isObj(v) && typeof v.id === "string" ? v.id : null)).filter((v): v is string => v !== null);
        raw.set(t, j.replace === true ? vals : [...(raw.get(t) ?? []), ...vals]);
      }
    }
  }
  const out = new Set<string>();
  const seen = new Set<string>();
  const visit = (t: string) => {
    if (seen.has(t)) return;
    seen.add(t);
    for (const v of raw.get(t) ?? []) if (v.startsWith("#")) visit(v.slice(1));
      else out.add(v);
  };
  visit(tag);
  return out;
}

/** Ids postos na tag bait_seasoning por script do kubejs (`.add('cobblemon:recipe_filters/bait_seasoning', [...])`). */
function kubejsSeasoningIds(src: string): Set<string> {
  const out = new Set<string>();
  const re = /\.add\(\s*['"]cobblemon:recipe_filters\/bait_seasoning['"]\s*,\s*\[([^\]]*)\]/g;
  for (const f of walk(path.join(src, "kubejs", "server_scripts"), ".js")) {
    const txt = fs.readFileSync(f, "utf8");
    for (const m of txt.matchAll(re)) for (const q of m[1]!.matchAll(/['"]([^'"]+)['"]/g)) out.add(q[1]!);
  }
  return out;
}

function buildBaitItems(src: string, srcs: RawSource[]): Map<string, ExpBaitItem> {
  const seasoning = new Set([...resolveTag(srcs, BAIT_SEASONING), ...kubejsSeasoningIds(src)]);
  const out = new Map<string, ExpBaitItem>();
  for (const s of srcs) {
    for (const f of datapackFiles(s, "spawn_bait_effects").filter((x) => x.ns === "cobblemon")) {
      const j = readJson<{ item?: string; effects?: { type?: string; subcategory?: string; chance?: number; value?: number }[] }>(f.file);
      if (typeof j.item !== "string") continue;
      const effects: ExpBaitItem["effects"] = [];
      const seen = new Set<string>();
      for (const e of j.effects ?? []) {
        const kind = BAIT_KIND[noNs(String(e.type ?? ""))];
        if (!kind) continue;
        const subcategory = typeof e.subcategory === "string" ? noNs(e.subcategory) : null;
        if (seen.has(`${kind}|${subcategory}`)) continue;
        seen.add(`${kind}|${subcategory}`);
        effects.push({ kind, subcategory, chance: typeof e.chance === "number" ? e.chance : 0, value: numOrNull(e.value) });
      }
      out.set(j.item, { effects, seasoning: seasoning.has(j.item), file: rel(f.file) });
    }
  }
  return out;
}

/** Ingredientes da receita: shaped conta simbolos do pattern (ordem da 1a ocorrencia), shapeless conta entradas. */
function potIngredients(j: Record<string, unknown>): ExpPotRecipe["ingredients"] | null {
  const seq: unknown[] = [];
  if (Array.isArray(j.pattern) && isObj(j.key)) {
    for (const row of j.pattern as string[]) for (const ch of String(row)) if (ch !== " ") seq.push((j.key as Record<string, unknown>)[ch]);
  } else if (Array.isArray(j.ingredients)) seq.push(...j.ingredients);
  else return null;
  const out: ExpPotRecipe["ingredients"] = [];
  for (const x of seq) {
    const ing = isObj(x) && typeof x.item === "string" ? { kind: "item", id: x.item } : isObj(x) && typeof x.tag === "string" ? { kind: "tag", id: x.tag } : null;
    if (!ing) return null;
    const prev = out.find((o) => o.kind === ing.kind && o.id === ing.id);
    if (prev) prev.count++;
    else out.push({ ...ing, count: 1 });
  }
  return out;
}

function buildPotRecipes(srcs: RawSource[]): Map<string, ExpPotRecipe> {
  const out = new Map<string, ExpPotRecipe>();
  const cob = srcs.find((s) => s.name === "cobblemon");
  if (!cob) return out;
  for (const f of datapackFiles(cob, "recipe").filter((x) => x.ns === "cobblemon")) {
    const j = readJson<Record<string, unknown>>(f.file);
    if (j.seasoningTag !== BAIT_SEASONING) continue;
    const result = isObj(j.result) ? String(j.result.id ?? j.result.item ?? "") : "";
    const ingredients = potIngredients(j);
    if (!result || !ingredients) continue;
    out.set(result, { type: String(j.type), ingredients, file: rel(f.file) });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Bolas: tabela da SPEC B4.3 (derivada dos tooltips). Conferida contra o tooltip cru no compare.
// ---------------------------------------------------------------------------------------------
const flat = (m: number) => ({ kind: "flat", multiplier: m });
const cond = (best: number, worst: number, condition: string, applies?: Record<string, unknown>) =>
  applies ? { kind: "conditional", bestMultiplier: best, worstMultiplier: worst, condition, applies } : { kind: "conditional", bestMultiplier: best, worstMultiplier: worst, condition };
export const BALL_RULES: Record<string, Record<string, unknown>> = {
  poke_ball: flat(1), premier_ball: flat(1), cherish_ball: flat(1), slate_ball: flat(1), azure_ball: flat(1), verdant_ball: flat(1), roseate_ball: flat(1), citrine_ball: flat(1),
  great_ball: flat(1.5), sport_ball: flat(1.5), ultra_ball: flat(2),
  master_ball: { kind: "guaranteed" }, ancient_origin_ball: { kind: "guaranteed" },
  safari_ball: cond(1.5, 1, "outsideBattle"),
  park_ball: cond(2.5, 1, "forestOrPlains"),
  fast_ball: cond(4, 1, "minBaseSpeedAbove", { minBaseSpeed: 100 }),
  net_ball: cond(3, 1, "hasAnyType", { types: ["water", "bug"] }),
  heavy_ball: cond(4, 1, "heavyTarget"),
  level_ball: cond(4, 1, "playerLevelHigher"),
  lure_ball: cond(4, 1, "fishing", { spawnContext: ["fishing"] }),
  moon_ball: cond(4, 1, "fullMoonNight"),
  love_ball: cond(8, 1, "oppositeGender", { genderless: false }),
  dive_ball: cond(3.5, 1, "submerged", { spawnContext: ["submerged"] }),
  nest_ball: cond(4, 1, "targetLevelBelow30"),
  repeat_ball: cond(3.5, 1, "registeredCaught"),
  timer_ball: cond(4, 1, "turn10"),
  dusk_ball: cond(3.5, 1, "lightLevel0"),
  quick_ball: cond(5, 1, "firstTurn"),
  dream_ball: cond(4, 1, "sleeping"),
  beast_ball: cond(5, 0.1, "ultraBeast", { label: "ultra_beast" }),
  friend_ball: flat(1), luxury_ball: flat(1), heal_ball: flat(1),
  ancient_poke_ball: flat(1), ancient_citrine_ball: flat(1), ancient_verdant_ball: flat(1), ancient_azure_ball: flat(1), ancient_roseate_ball: flat(1), ancient_slate_ball: flat(1), ancient_ivory_ball: flat(1),
  ancient_great_ball: flat(1.5), ancient_ultra_ball: flat(2),
  ancient_feather_ball: flat(1), ancient_wing_ball: flat(1.5), ancient_jet_ball: flat(2),
  ancient_heavy_ball: flat(1), ancient_leaden_ball: flat(1.5), ancient_gigaton_ball: flat(2),
};

/** Multiplicador principal que o tooltip EN declara (primeiro numero seguido de x/×), para conferir a tabela. */
export function tooltipMultipliers(t: string): number[] {
  return [...t.matchAll(/(\d+(?:\.\d+)?)\s*[×x]/g)].map((m) => Number(m[1]));
}

// ---------------------------------------------------------------------------------------------
// Treinadores e series (SPEC B5.1/B5.2), kubejs vence o jar no mesmo id
// ---------------------------------------------------------------------------------------------
function buildSeries(src: string, rctRoot: string): ExpSeries[] {
  const kube = path.join(src, "kubejs", "data", "rctmod");
  const jar = path.join(rctRoot, "data", "rctmod");
  const def = readJson<RawTrainerMob>(path.join(jar, "mobs/trainers/default.json"));
  const mobs = new Map<string, { j: RawTrainerMob; src: "rctmod" | "kubejs" }>();
  for (const f of walk(path.join(jar, "mobs/trainers/single"))) mobs.set(path.basename(f, ".json"), { j: { ...def, ...readJson<RawTrainerMob>(f) }, src: "rctmod" });
  for (const f of walk(path.join(kube, "mobs/trainers/single"))) mobs.set(path.basename(f, ".json"), { j: { ...def, ...readJson<RawTrainerMob>(f) }, src: "kubejs" });
  const trainers = new Map<string, RawTrainerFile>();
  for (const f of walk(path.join(jar, "trainers"))) trainers.set(path.basename(f, ".json"), readJson<RawTrainerFile>(f));
  for (const f of walk(path.join(kube, "trainers"))) trainers.set(path.basename(f, ".json"), readJson<RawTrainerFile>(f));
  const seriesIds = [...walk(path.join(jar, "series")), ...walk(path.join(kube, "series"))].map((f) => path.basename(f, ".json"));
  const out: ExpSeries[] = [];
  for (const sid of [...new Set(seriesIds)]) {
    const keys = [...mobs.entries()].filter(([, m]) => m.j.optional === false && (m.j.series ?? []).includes(sid)).map(([id]) => id);
    const set = new Set(keys);
    const deps: Record<string, string[][]> = {};
    const maxLevel: Record<string, number> = {};
    const sourceOf: Record<string, "rctmod" | "kubejs"> = {};
    for (const id of keys) {
      // requiredDefeats: lista externa = E; sublista = OU (variantes do mesmo treinador, ex. lorelei_004d/004e)
      deps[id] = ((mobs.get(id)!.j.requiredDefeats ?? []) as string[][]).map((g) => g.filter((d) => set.has(d))).filter((g) => g.length > 0);
      const team = trainers.get(id)?.team ?? [];
      maxLevel[id] = team.reduce((m: number, t: RawTrainerTeamMember) => Math.max(m, Number(t.level ?? 0)), 0);
      sourceOf[id] = mobs.get(id)!.src;
    }
    // Kahn (grupo satisfeito quando algum membro ja foi colocado), desempate por maxTeamLevel asc e nome
    const name = (id: string) => String(trainers.get(id)?.name ?? id);
    const order: string[] = [];
    const placed = new Set<string>();
    const ready = () =>
      keys
        .filter((k) => !placed.has(k) && deps[k]!.every((g) => g.some((d) => placed.has(d))))
        .sort((a, b) => maxLevel[a]! - maxLevel[b]! || name(a).localeCompare(name(b)));
    let r = ready();
    while (r.length) {
      const n = r[0]!;
      order.push(n);
      placed.add(n);
      r = ready();
    }
    if (order.length !== keys.length) order.push(...keys.filter((k) => !placed.has(k))); // ciclo: mantem no fim
    out.push({ id: sid, keyTrainers: order, deps, maxLevel, sourceOf });
  }
  return out;
}

function readLevelCap(src: string): Expected["levelCap"] {
  const txt = fs.readFileSync(path.join(src, "config", "rctmod-server.toml"), "utf8");
  const get = (k: string) => txt.match(new RegExp(`^\\s*${k}\\s*=\\s*(.+?)\\s*$`, "m"))?.[1];
  return {
    initialLevelCap: Number(get("initialLevelCap")),
    relativeLevelCap: Number(get("relativeLevelCap")),
    initialSeries: String(get("initialSeries")).replace(/^"|"$/g, ""),
    freeroamRequiresCompletedSeries: get("freeroamRequiresCompletedSeries") === "true",
  };
}

// ---------------------------------------------------------------------------------------------
// berry-mutations: origem (spawnConditions) e cruzamento (mutations) das bagas (regra da SPEC 2.4 itens 2 e 3, reescrita aqui)
// ---------------------------------------------------------------------------------------------
const BERRY_VARIANT: Record<string, string> = { preferred_biome: "preferredBiome", all_biome: "allBiome", specific_biome: "specificBiome" };
const cu = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
const strList = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function buildBerries(srcs: RawSource[]): Map<string, ExpBerry> {
  const raw = new Map<string, { j: Record<string, unknown>; file: string }>();
  for (const s of srcs) {
    for (const f of datapackFiles(s, "berries").filter((x) => x.ns === "cobblemon")) {
      const j = readJson<unknown>(f.file);
      if (!isObj(j)) continue;
      const relName = f.rl.slice("cobblemon:berries/".length).replace(/\.json$/, "");
      raw.set(`cobblemon:${relName}`, { j, file: rel(f.file) });
    }
  }
  const out = new Map<string, ExpBerry>();
  for (const [id, { j, file }] of raw) {
    const spawn: ExpBerry["spawn"] = [];
    for (const c of Array.isArray(j.spawnConditions) ? j.spawnConditions : []) {
      if (!isObj(c)) continue;
      const v = BERRY_VARIANT[String(c.variant).replace(/^cobblemon:/, "")];
      if (v === "preferredBiome") spawn.push({ variant: v, biomeTags: strList(j.preferredBiomeTags) });
      else if (v === "allBiome") spawn.push({ variant: v, biomeTags: [] });
      else if (v === "specificBiome" && typeof c.biome === "string") spawn.push({ variant: v, biomeTags: [c.biome] });
    }
    out.set(id, { spawn, mutationPairs: [], mutationUses: [], file });
  }
  // pares nao ordenados por resultado
  const pairs = new Map<string, Map<string, { a: string; b: string }>>();
  for (const [x, { j }] of raw) {
    if (!isObj(j.mutations)) continue;
    for (const [y, result] of Object.entries(j.mutations)) {
      if (typeof result !== "string" || !out.has(result)) continue;
      const [a, b] = x < y ? [x, y] : [y, x];
      const m = pairs.get(result) ?? new Map<string, { a: string; b: string }>();
      pairs.set(result, m);
      m.set(`${a}|${b}`, { a, b });
    }
  }
  for (const [result, m] of pairs) {
    const e = out.get(result)!;
    e.mutationPairs = [...m.values()].sort((p, q) => cu(p.a, q.a) || cu(p.b, q.b));
    for (const { a, b } of e.mutationPairs) {
      for (const [owner, partner] of [[a, b], [b, a]] as const) {
        const o = out.get(owner);
        if (o && !o.mutationUses.some((u) => u.partner === partner && u.result === result)) o.mutationUses.push({ partner, result });
      }
    }
  }
  for (const e of out.values()) e.mutationUses.sort((p, q) => cu(p.partner, q.partner) || cu(p.result, q.result));
  return out;
}
