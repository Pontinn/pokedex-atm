// spawn-bait B1.3: efeitos de isca (spawn_bait_effects, kubejs vence) com o tooltip do jogo e temperos aceitos pela panela.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { BaitEffect, BaitEffectKind, LocalizedText } from "../../../../src/data/types";
import type { LangTable, PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";
import { PipelineError } from "../lib/errors";

export const BAIT_PREFIX = "data/cobblemon/spawn_bait_effects/";
const KUBEJS_BAIT_DIR = "kubejs/data/cobblemon/spawn_bait_effects";
export const BAIT_SEASONING_TAG = "cobblemon:recipe_filters/bait_seasoning";
/** Excecao curada: itens postos na tag bait_seasoning por script do kubejs (JS nao e lido pelo pipeline). */
export const SEASONING_EXTRA_FILE = path.resolve(import.meta.dirname, "../../curated/bait-seasoning-extra.json");

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** path do type ("cobblemon:<path>") -> kind publicado (camelCase). Os 14 tipos presentes nos arquivos do pack. */
export const BAIT_EFFECT_KINDS: Readonly<Record<string, BaitEffectKind>> = {
  typing: "typing",
  egg_group: "eggGroup",
  nature: "nature",
  ev: "ev",
  iv: "iv",
  bite_time: "biteTime",
  level_raise: "levelRaise",
  pokemon_chance: "pokemonChance",
  gender_chance: "genderChance",
  ha_chance: "haChance",
  friendship: "friendship",
  drops_reroll: "dropsReroll",
  shiny_reroll: "shinyReroll",
  rarity_bucket: "rarityBucket",
};
const KIND_TYPE_PATH = new Map<string, string>(Object.entries(BAIT_EFFECT_KINDS).map(([p, k]) => [k, p]));

/** kind -> path do type no jogo ("eggGroup" -> "egg_group"), chave do tooltip. */
export function baitTypePath(kind: BaitEffectKind): string {
  return KIND_TYPE_PATH.get(kind) ?? kind;
}

export interface RawBaitEffect {
  type: string;
  subcategory: string | null;
  chance: number;
  value: number | null;
}

type Report = Pick<PipelineContext["report"], "warn">;

function rawEffectsOf(data: Json): RawBaitEffect[] {
  if (!Array.isArray(data.effects)) return [];
  return data.effects.filter(isObject).map((e) => ({
    type: typeof e.type === "string" ? e.type : "",
    subcategory: typeof e.subcategory === "string" ? e.subcategory : null,
    chance: typeof e.chance === "number" ? e.chance : 0,
    value: typeof e.value === "number" ? e.value : null,
  }));
}

/** item -> efeitos crus do arquivo vencedor: jars obrigatorios (ordem de listJars) e depois kubejs/data; o ultimo vence. */
export function collectBaitEffects(ctx: Pick<PipelineContext, "reader" | "report">): Map<string, RawBaitEffect[]> {
  const out = new Map<string, RawBaitEffect[]>();
  const add = (data: unknown) => {
    if (isObject(data) && typeof data.item === "string") out.set(data.item, rawEffectsOf(data));
  };
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [BAIT_PREFIX]);
    for (const { data } of readJsonEntries<Json>(entries, BAIT_PREFIX, jar.fileName)) add(data);
  }
  const decoder = new TextDecoder("utf-8");
  for (const [rel, bytes] of ctx.reader.readTree(KUBEJS_BAIT_DIR)) {
    if (!rel.endsWith(".json")) continue;
    let text = decoder.decode(bytes);
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (error) {
      ctx.report.warn("W_BAIT_EFFECT_INVALID", `JSON invalido em ${KUBEJS_BAIT_DIR}/${rel} (ignorado)`, { file: `${KUBEJS_BAIT_DIR}/${rel}`, error: String(error) });
      continue;
    }
    add(data);
  }
  return out;
}

/** Subcategoria como o jogo (getSubcategory().getPath()): sem namespace. */
const pathOf = (id: string): string => (id.includes(":") ? id.slice(id.indexOf(":") + 1) : id);

/** kind camelCase, subcategoria sem namespace, tipo desconhecido pulado e repetido (kind|subcategoria) mantido uma vez. */
export function normalizeBaitEffects(raw: readonly RawBaitEffect[], report: Report, itemId = ""): Omit<BaitEffect, "text">[] {
  const out: Omit<BaitEffect, "text">[] = [];
  const seen = new Set<string>();
  for (const e of raw) {
    const kind = BAIT_EFFECT_KINDS[pathOf(e.type)];
    if (!kind) {
      report.warn("W_BAIT_EFFECT_UNKNOWN", `efeito de isca desconhecido "${e.type}" em ${itemId} (pulado)`, { item: itemId, type: e.type });
      continue;
    }
    const subcategory = e.subcategory === null ? null : pathOf(e.subcategory);
    const key = `${kind}|${subcategory ?? ""}`;
    if (seen.has(key)) {
      report.warn("W_BAIT_EFFECT_DUPLICATE", `efeito de isca repetido ${key} em ${itemId} (fica o primeiro)`, { item: itemId, key });
      continue;
    }
    seen.add(key);
    out.push({ kind, subcategory, chance: e.chance, value: e.value });
  }
  return out;
}

/** Stats do jogo (classe Stats): subcategoria curta -> nome usado em cobblemon.stat.<nome>.name. */
export const STAT_LANG: Readonly<Record<string, string>> = {
  hp: "hp",
  atk: "attack",
  def: "defence",
  spa: "special_attack",
  spd: "special_defence",
  spe: "speed",
};

function subcategoryLabelKey(typePath: string, sub: string): string | null {
  if (typePath === "ev" || typePath === "iv" || typePath === "nature") return STAT_LANG[sub] ? `cobblemon.stat.${STAT_LANG[sub]}.name` : null;
  if (typePath === "gender_chance") return `cobblemon.gender.${sub}`;
  if (typePath === "typing") return `cobblemon.type.${sub}`;
  if (typePath === "egg_group") return `cobblemon.egg_group.${sub}`;
  return null;
}

/** DecimalFormat("0.##"): ate 2 casas, sem zeros a direita, ponto decimal. */
const formatPercent = (chance: number): string => String(Number((chance * 100).toFixed(2)));
/** (int) do jogo; o toFixed(6) evita 28.999999 virar 28 por erro de ponto flutuante. */
const truncInt = (n: number): number => Math.trunc(Number(n.toFixed(6)));

function thirdArg(typePath: string, value: number | null): string {
  const v = value ?? 0;
  if (typePath === "bite_time") return String(truncInt(v * 100));
  if (typePath === "shiny_reroll") return String(truncInt(v + 1));
  return String(truncInt(v));
}

/**
 * Tooltip do jogo (SeasoningTooltipHelperKt.generateAdditionalBaitEffectTooltip): template
 * cobblemon.fishing_bait_effects.<typePath>.tooltip com %1$s (chance %), %2$s (rotulo da subcategoria) e %3$s (inteiro).
 * PT cai para EN (template e rotulo); template EN ausente = aviso e o proprio typePath como texto.
 */
export function renderBaitTooltip(
  effect: Omit<BaitEffect, "text">,
  typePath: string,
  lang: Pick<LangTable, "pt" | "en">,
  report?: Report,
): LocalizedText {
  const key = `cobblemon.fishing_bait_effects.${typePath}.tooltip`;
  const enTemplate = lang.en.get(key);
  if (enTemplate === undefined) {
    report?.warn("W_BAIT_TOOLTIP_MISSING", `sem template en para ${key}`, { key });
    return { pt: typePath, en: typePath };
  }
  const render = (template: string, table: "pt" | "en"): string => {
    let label = "";
    if (effect.subcategory !== null) {
      const labelKey = subcategoryLabelKey(typePath, effect.subcategory);
      const fromLang = labelKey ? (table === "pt" ? (lang.pt.get(labelKey) ?? lang.en.get(labelKey)) : lang.en.get(labelKey)) : undefined;
      label = fromLang ?? effect.subcategory;
    }
    return template
      .replaceAll("%1$s", formatPercent(effect.chance))
      .replaceAll("%2$s", label)
      .replaceAll("%3$s", thirdArg(typePath, effect.value))
      .replaceAll("%%", "%");
  };
  return { pt: render(lang.pt.get(key) ?? enTemplate, "pt"), en: render(enTemplate, "en") };
}

const seasoningExtraSchema = z.record(z.string().regex(/^[a-z0-9_.-]+:[a-z0-9_./-]+$/), z.string().min(1));

/** id -> prova (linha do script do kubejs). Arquivo ausente = vazio. */
export function loadSeasoningExtra(file: string = SEASONING_EXTRA_FILE): Map<string, string> {
  if (!existsSync(file)) return new Map();
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new PipelineError("E_JSON_INVALID", "JSON invalido", `${file}: ${String(error)}`);
  }
  const parsed = seasoningExtraSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 20).map((i) => `${i.path.join(".") || "(raiz)"}: ${i.message}`);
    throw new PipelineError("E_JSON_INVALID", "temperos curados invalidos", `${file}: ${issues.join("; ")}`);
  }
  return new Map(Object.entries(parsed.data));
}

/** Tag bait_seasoning resolvida (tags aninhadas) + ids da excecao curada. */
export function buildSeasoningSet(itemTags: ReadonlyMap<string, ReadonlySet<string>>, extra: ReadonlyMap<string, string>): Set<string> {
  return new Set([...(itemTags.get(BAIT_SEASONING_TAG) ?? []), ...extra.keys()]);
}
