// Formulas de stats (RF-35) e heuristica de IV/EV (RF-110).
import type { BaseStats } from "../data/types";
import { natureModifier, type StatKey } from "./natures";

export const STAT_KEYS: readonly StatKey[] = ["hp", "attack", "defence", "specialAttack", "specialDefence", "speed"];
export const MAX_IV = 31;
export const MAX_EV = 252;
export const MAX_EV_TOTAL = 510;

export type StatError = "levelOutOfRange" | "ivOutOfRange" | "evOutOfRange" | "evTotalExceeded";

/** Erro tipado que a UI mostra inline. */
export class StatRangeError extends RangeError {
  constructor(
    readonly code: StatError,
    message: string,
  ) {
    super(message);
    this.name = "StatRangeError";
  }
}

export function calculateHp(base: number, iv: number, ev: number, level: number): number {
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10;
}

export function calculateOther(base: number, iv: number, ev: number, level: number, mod: 1.1 | 1 | 0.9): number {
  const raw = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5;
  // floor(raw * mod) em aritmetica inteira (evita erro binario de 1.1/0.9): 299 -> 328 / 299 / 269
  const tenths = mod === 1.1 ? 11 : mod === 0.9 ? 9 : 10;
  return Math.floor((raw * tenths) / 10);
}

function validate(level: number, ivs: BaseStats, evs: BaseStats): void {
  if (!Number.isInteger(level) || level < 1 || level > 100) throw new StatRangeError("levelOutOfRange", "level must be 1..100");
  let total = 0;
  for (const k of STAT_KEYS) {
    const iv = ivs[k];
    const ev = evs[k];
    if (!Number.isInteger(iv) || iv < 0 || iv > MAX_IV) throw new StatRangeError("ivOutOfRange", `IV ${k} must be 0..31`);
    if (!Number.isInteger(ev) || ev < 0 || ev > MAX_EV) throw new StatRangeError("evOutOfRange", `EV ${k} must be 0..252`);
    total += ev;
  }
  if (total > MAX_EV_TOTAL) throw new StatRangeError("evTotalExceeded", "EV total must be <= 510");
}

function statsAt(baseStats: BaseStats, level: number, ivs: BaseStats, evs: BaseStats, natureId: string | null): BaseStats {
  const out = {} as BaseStats;
  for (const k of STAT_KEYS) {
    out[k] =
      k === "hp"
        ? calculateHp(baseStats.hp, ivs.hp, evs.hp, level)
        : calculateOther(baseStats[k], ivs[k], evs[k], level, natureModifier(natureId, k));
  }
  return out;
}

/** Os 6 stats no nivel pedido e no nivel 100. Lanca StatRangeError fora dos limites. */
export function calculateStats(
  baseStats: BaseStats,
  level: number,
  ivs: BaseStats,
  evs: BaseStats,
  natureId: string | null,
): { atLevel: BaseStats; atLevel100: BaseStats } {
  validate(level, ivs, evs);
  return { atLevel: statsAt(baseStats, level, ivs, evs, natureId), atLevel100: statsAt(baseStats, 100, ivs, evs, natureId) };
}

export interface InvestmentRecommendation {
  ivs: BaseStats;
  evs: BaseStats;
  /** os 2 stats destacados (maiores bases) */
  highlight: [StatKey, StatKey];
}

/** Ordena por base desc (desempate: hp, attack, defence, specialAttack, specialDefence, speed): 252/252/4, IV 31 em tudo. */
export function recommendedInvestment(baseStats: BaseStats): InvestmentRecommendation {
  const order = [...STAT_KEYS].sort((a, b) => baseStats[b] - baseStats[a] || STAT_KEYS.indexOf(a) - STAT_KEYS.indexOf(b));
  const [first, second, third] = order as [StatKey, StatKey, StatKey];
  const evs: BaseStats = { hp: 0, attack: 0, defence: 0, specialAttack: 0, specialDefence: 0, speed: 0 };
  evs[first] = 252;
  evs[second] = 252;
  evs[third] = 4;
  return {
    ivs: { hp: 31, attack: 31, defence: 31, specialAttack: 31, specialDefence: 31, speed: 31 },
    evs,
    highlight: [first, second],
  };
}
