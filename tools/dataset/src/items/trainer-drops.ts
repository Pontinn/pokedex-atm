// U5a (pwa-auto-update): "Drop de treinador" no Como obter do item. Fonte: loot tables do rctmod
// (data/rctmod/loot_table/**, jar rctmod + kubejs; kubejs vence no mesmo caminho, como nas outras etapas).
// Cada treinador tem data/rctmod/loot_table/trainers/single/<trainerId>.json (nome do arquivo = id do
// treinador em trainers/*.json). Entram:
//   - entradas "minecraft:item" direto nas pools da tabela do treinador (ex. Satherov -> allthemons:the_kitty_badge);
//   - entradas "minecraft:loot_table" que apontam para rctmod:generic/** (um nivel), ex. Giovanni ->
//     rctmod:generic/legendary/masterball -> cobblemon:master_ball.
// NAO entram as referencias a rctmod:trainers/groups/** (loot generico sorteado para o grupo inteiro de
// treinadores, nao e um drop do treinador).
// So fatos das tabelas: chance calculada das rolls/weights quando o formato e conhecido (senao null);
// levelRange = condicao "rctmod:level_range" da pool, como esta no arquivo; firstDefeatOnly = condicao
// "rctmod:defeat_count" == 1 na entrada ou na pool. Condicao desconhecida = chance null.
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";

export const RCT_LOOT_PREFIX = "data/rctmod/loot_table/";
const SINGLE_DIR = "trainers/single/";
const NESTED_ALLOWED = "rctmod:generic/";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

export interface TrainerDropSource {
  /** id do treinador (= nome do arquivo da loot table); igual ao TrainerInfo.id quando o site tem o treinador */
  id: string;
  /** TrainerInfo.name; null quando o treinador nao esta em trainers/*.json */
  name: string | null;
  /** SeriesInfo.id cujo trainersFile contem o treinador; null quando nao esta */
  series: string | null;
  /** probabilidade (0..1) de o item cair ao vencer, das rolls/weights; 1 = garantido; null = nao calculavel */
  chance: number | null;
  /** condicao rctmod:level_range da pool, copiada como esta no arquivo; null = sem condicao */
  levelRange: { min: number; max: number } | null;
  /** condicao rctmod:defeat_count == 1: so na primeira vitoria contra o treinador */
  firstDefeatOnly: boolean;
}

export interface TrainerDropRoute {
  kind: "trainerDrop";
  trainers: TrainerDropSource[];
}

export interface TrainerRef {
  name: string;
  series: string;
}

interface Conditions {
  levelRange: { min: number; max: number } | null;
  firstDefeatOnly: boolean;
  unknown: boolean;
}

function readConditions(list: unknown, into: Conditions): void {
  if (!Array.isArray(list)) return;
  for (const c of list) {
    if (!isObject(c)) {
      into.unknown = true;
      continue;
    }
    if (c.condition === "rctmod:level_range" && isObject(c.range) && typeof c.range.min === "number" && typeof c.range.max === "number") {
      into.levelRange = { min: c.range.min, max: c.range.max };
    } else if (c.condition === "rctmod:defeat_count" && c.comparator === "==" && c.count === 1) {
      into.firstDefeatOnly = true;
    } else {
      into.unknown = true;
    }
  }
}

/** P(o item sai ao menos uma vez) numa pool, dado q = chance de cada roll escolher a entrada. null = formato desconhecido. */
export function poolChance(rolls: unknown, q: number): number | null {
  const atLeastOnce = (k: number) => 1 - (1 - q) ** k;
  if (typeof rolls === "number" && Number.isInteger(rolls) && rolls >= 0) return atLeastOnce(rolls);
  if (!isObject(rolls)) return null;
  if (rolls.type === "minecraft:binomial" && typeof rolls.n === "number" && typeof rolls.p === "number") {
    return 1 - (1 - rolls.p * q) ** rolls.n;
  }
  if (rolls.type === "minecraft:constant" && typeof rolls.value === "number" && Number.isInteger(rolls.value)) return atLeastOnce(rolls.value);
  const isUniform = rolls.type === undefined || rolls.type === "minecraft:uniform";
  if (isUniform && typeof rolls.min === "number" && typeof rolls.max === "number" && Number.isInteger(rolls.min) && Number.isInteger(rolls.max) && rolls.max >= rolls.min) {
    let sum = 0;
    for (let k = rolls.min; k <= rolls.max; k++) sum += atLeastOnce(k);
    return sum / (rolls.max - rolls.min + 1);
  }
  return null;
}

/** true quando a pool rola no maximo uma vez (produto de chances com tabela aninhada so e exato assim). */
function atMostOneRoll(rolls: unknown): boolean {
  if (rolls === 1) return true;
  if (!isObject(rolls)) return false;
  if (rolls.type === "minecraft:binomial") return rolls.n === 1;
  if (rolls.type === "minecraft:constant") return rolls.value === 1;
  return rolls.min === 1 && rolls.max === 1;
}

interface ItemHit {
  item: string;
  chance: number | null;
  levelRange: { min: number; max: number } | null;
  firstDefeatOnly: boolean;
}

const round = (n: number) => Math.round(n * 10000) / 10000;

/** Itens de uma tabela (entradas minecraft:item e, se `tables` for dado, um nivel de rctmod:generic/**). */
function itemsOfTable(data: unknown, tables: ReadonlyMap<string, unknown> | null): ItemHit[] {
  const hits: ItemHit[] = [];
  const pools = isObject(data) && Array.isArray(data.pools) ? data.pools : [];
  for (const pool of pools) {
    if (!isObject(pool) || !Array.isArray(pool.entries)) continue;
    const poolConds: Conditions = { levelRange: null, firstDefeatOnly: false, unknown: false };
    readConditions(pool.conditions, poolConds);
    const entries = pool.entries.filter(isObject);
    const totalWeight = entries.reduce((s, e) => s + (typeof e.weight === "number" ? e.weight : 1), 0);
    for (const entry of entries) {
      const conds: Conditions = { ...poolConds };
      readConditions(entry.conditions, conds);
      const q = totalWeight > 0 ? (typeof entry.weight === "number" ? entry.weight : 1) / totalWeight : 0;
      const baseChance = conds.unknown || Array.isArray(entry.functions) ? null : poolChance(pool.rolls, q);
      if (entry.type === "minecraft:item" && typeof entry.name === "string") {
        hits.push({ item: entry.name, chance: baseChance, levelRange: conds.levelRange, firstDefeatOnly: conds.firstDefeatOnly });
      } else if (tables && entry.type === "minecraft:loot_table" && typeof entry.value === "string" && entry.value.startsWith(NESTED_ALLOWED)) {
        const nested = tables.get(entry.value);
        if (nested === undefined) continue;
        for (const inner of itemsOfTable(nested, null)) {
          const chance = baseChance !== null && inner.chance !== null && atMostOneRoll(pool.rolls) ? baseChance * inner.chance : null;
          hits.push({
            item: inner.item,
            chance,
            levelRange: inner.levelRange ?? conds.levelRange,
            firstDefeatOnly: conds.firstDefeatOnly || inner.firstDefeatOnly,
          });
        }
      }
    }
  }
  return hits;
}

/** tabelas "rctmod:<caminho sem .json>" -> JSON; kubejs sobrescreve o jar no mesmo caminho. */
export function collectRctLootTables(ctx: Pick<PipelineContext, "reader">): Map<string, unknown> {
  const tables = new Map<string, unknown>();
  const add = (entries: { path: string; data: unknown }[]) => {
    for (const { path, data } of entries) tables.set(`rctmod:${path.slice(RCT_LOOT_PREFIX.length).replace(/\.json$/, "")}`, data);
  };
  const rct = ctx.reader.jar("rctmod");
  add(readJsonEntries<Json>(ctx.reader.readJar(rct, [RCT_LOOT_PREFIX]), RCT_LOOT_PREFIX, rct.fileName));
  add(readJsonEntries<Json>(ctx.reader.readTree("kubejs"), RCT_LOOT_PREFIX, "kubejs"));
  return tables;
}

/**
 * itemId -> treinadores que o derrubam, ordenados por id do treinador. Mesma combinacao item+treinador em
 * pools diferentes (independentes) vira uma fonte so: chance 1-(1-a)(1-b) quando as duas sao conhecidas.
 */
export function buildTrainerDrops(
  tables: ReadonlyMap<string, unknown>,
  trainers: ReadonlyMap<string, TrainerRef>,
): Map<string, TrainerDropSource[]> {
  const byItem = new Map<string, Map<string, TrainerDropSource>>();
  const singlePrefix = `rctmod:${SINGLE_DIR}`;
  const ids = [...tables.keys()].filter((k) => k.startsWith(singlePrefix)).sort();
  for (const tableId of ids) {
    const trainerId = tableId.slice(singlePrefix.length).split("/").pop() ?? tableId;
    const ref = trainers.get(trainerId) ?? null;
    for (const hit of itemsOfTable(tables.get(tableId), tables)) {
      const perTrainer = byItem.get(hit.item) ?? new Map<string, TrainerDropSource>();
      const prev = perTrainer.get(trainerId);
      if (prev) {
        prev.chance = prev.chance !== null && hit.chance !== null ? 1 - (1 - prev.chance) * (1 - hit.chance) : null;
        prev.firstDefeatOnly = prev.firstDefeatOnly && hit.firstDefeatOnly;
        if (!prev.levelRange || !hit.levelRange || prev.levelRange.min !== hit.levelRange.min || prev.levelRange.max !== hit.levelRange.max) {
          prev.levelRange = null;
        }
      } else {
        perTrainer.set(trainerId, {
          id: trainerId,
          name: ref?.name ?? null,
          series: ref?.series ?? null,
          chance: hit.chance,
          levelRange: hit.levelRange,
          firstDefeatOnly: hit.firstDefeatOnly,
        });
      }
      byItem.set(hit.item, perTrainer);
    }
  }
  const out = new Map<string, TrainerDropSource[]>();
  for (const [item, perTrainer] of byItem) {
    out.set(
      item,
      [...perTrainer.values()]
        .map((s) => ({ ...s, chance: s.chance === null ? null : round(s.chance) }))
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
    );
  }
  return out;
}
