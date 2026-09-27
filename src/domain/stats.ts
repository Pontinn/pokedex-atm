// Formulas de stats (RF-35) e recomendacao de treino por funcao (RF-110 rev 7).
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

export type TrainingRole = "defensive" | "fastAttacker" | "slowAttacker";

export interface InvestmentRecommendation {
  /** funcao sugerida pela regra (RF-110 rev 7) */
  role: TrainingRole;
  /** os 2 stats a priorizar */
  highlight: [StatKey, StatKey];
  /** id da natureza sugerida (ids de NATURES) */
  natureId: string;
  ivs: BaseStats;
  evs: BaseStats;
}

const ZERO_EVS = (): BaseStats => ({ hp: 0, attack: 0, defence: 0, specialAttack: 0, specialDefence: 0, speed: 0 });

/**
 * Recomendacao por funcao (RF-110 rev 7, SPEC B6.2 passo 4). Empates: attack antes de specialAttack, defence antes
 * de specialDefence. (a) defensivo se max(Atq, AtqEsp) < 80 e max(Def, DefEsp) >= 100; (b) atacante rapido se
 * speed >= 80; (c) senao atacante lento. IV 31 nos 6; EVs 252/252/4 (508).
 */
export function recommendedInvestment(baseStats: BaseStats): InvestmentRecommendation {
  const offense: StatKey = baseStats.attack >= baseStats.specialAttack ? "attack" : "specialAttack";
  const defense: StatKey = baseStats.defence >= baseStats.specialDefence ? "defence" : "specialDefence";
  const otherDefense: StatKey = defense === "defence" ? "specialDefence" : "defence";
  const weakOffense: StatKey = baseStats.attack <= baseStats.specialAttack ? "attack" : "specialAttack";
  const ivs: BaseStats = { hp: 31, attack: 31, defence: 31, specialAttack: 31, specialDefence: 31, speed: 31 };
  const evs = ZERO_EVS();

  if (Math.max(baseStats.attack, baseStats.specialAttack) < 80 && Math.max(baseStats.defence, baseStats.specialDefence) >= 100) {
    evs.hp = 252;
    evs[defense] = 252;
    evs[otherDefense] = 4;
    const natureId =
      defense === "defence" ? (weakOffense === "attack" ? "bold" : "impish") : weakOffense === "attack" ? "calm" : "careful";
    return { role: "defensive", highlight: ["hp", defense], natureId, ivs, evs };
  }
  if (baseStats.speed >= 80) {
    evs[offense] = 252;
    evs.speed = 252;
    evs.hp = 4;
    return { role: "fastAttacker", highlight: [offense, "speed"], natureId: offense === "attack" ? "jolly" : "timid", ivs, evs };
  }
  evs.hp = 252;
  evs[offense] = 252;
  evs[defense] = 4;
  return { role: "slowAttacker", highlight: ["hp", offense], natureId: offense === "attack" ? "adamant" : "modest", ivs, evs };
}
