// Ranking de Pokebolas (RF-64), SPEC B6.4: intrinsecas avaliadas pela especie, externas no melhor caso do tooltip.
import type { BallCondition, BallInfo, SpeciesDetail } from "../data/types";
import { heavyBallMultiplier } from "./ball-rules-types";

export interface RankedBall {
  ball: BallInfo;
  multiplier: number;
  conditional: boolean;
  conditionKey: BallCondition | null;
  guaranteed: boolean;
}

export type BallSpecies = Pick<SpeciesDetail, "types" | "baseStats" | "labels" | "spawns" | "maleRatio" | "weight">;

export interface BallPartition {
  /** ordenado: multiplier desc, incondicional antes de condicional, name.en asc */
  ranked: RankedBall[];
  /** "Captura garantida" (Master, Ancient Origin) */
  guaranteed: RankedBall[];
  /** nao se aplicam a esta especie (ex. Fast com speed < 100, Repeat sem captura) */
  excluded: BallInfo[];
}

const EXTERNAL_CONDITIONS: ReadonlySet<BallCondition> = new Set([
  "firstTurn",
  "lightLevel0",
  "turn10",
  "targetLevelBelow30",
  "playerLevelHigher",
  "fullMoonNight",
  "fishing",
  "submerged",
  "sleeping",
  "forestOrPlains",
  "outsideBattle",
  "oppositeGender",
]);

function evaluate(species: BallSpecies, ball: BallInfo, captured: boolean): RankedBall | "excluded" {
  const rule = ball.rule;
  const make = (multiplier: number, conditional: boolean, conditionKey: BallCondition | null, guaranteed = false): RankedBall => ({
    ball,
    multiplier,
    conditional,
    conditionKey,
    guaranteed,
  });
  if (rule.kind === "flat") return make(rule.multiplier, false, null);
  if (rule.kind === "guaranteed") return make(Number.POSITIVE_INFINITY, false, null, true);

  // heavyTarget: intrinseca, sempre incluida, multiplicador pela faixa de peso
  if (rule.condition === "heavyTarget" && !rule.applies) return make(heavyBallMultiplier(species.weight), false, null);

  const a = rule.applies;
  if (a) {
    const checks: boolean[] = [];
    if (a.types) checks.push(species.types.some((t) => a.types!.includes(t)));
    if (a.minBaseSpeed !== undefined) checks.push(species.baseStats.speed >= a.minBaseSpeed);
    if (a.label !== undefined) checks.push(species.labels.includes(a.label));
    if (a.spawnContext) checks.push(species.spawns.some((s) => a.spawnContext!.includes(s.context)));
    if (a.genderless === false) checks.push(species.maleRatio !== -1);
    const satisfied = checks.every(Boolean);
    if (!satisfied) {
      // Beast Ball sem o label: entra como incondicional com o pior multiplicador (0.1)
      if (a.label !== undefined && rule.condition === "ultraBeast") return make(rule.worstMultiplier, false, null);
      return "excluded";
    }
    // Intrinsecas (tipo, velocidade base, label): valem sempre para esta especie
    if (a.types || a.minBaseSpeed !== undefined || a.label !== undefined) return make(rule.bestMultiplier, false, null);
  }
  if (rule.condition === "registeredCaught") return captured ? make(rule.bestMultiplier, false, null) : "excluded";
  if (EXTERNAL_CONDITIONS.has(rule.condition)) return make(rule.bestMultiplier, true, rule.condition);
  // condicao intrinseca sem `applies` (ex. ultraBeast/heavyTarget com applies ja tratados): melhor caso incondicional
  return make(rule.bestMultiplier, false, null);
}

export function compareRanked(x: RankedBall, y: RankedBall): number {
  if (x.multiplier !== y.multiplier) return y.multiplier - x.multiplier;
  if (x.conditional !== y.conditional) return x.conditional ? 1 : -1;
  return x.ball.name.en.localeCompare(y.ball.name.en, "en");
}

export function partitionBalls(species: BallSpecies, balls: readonly BallInfo[], ctx: { captured: boolean }): BallPartition {
  const ranked: RankedBall[] = [];
  const guaranteed: RankedBall[] = [];
  const excluded: BallInfo[] = [];
  for (const ball of balls) {
    const r = evaluate(species, ball, ctx.captured);
    if (r === "excluded") excluded.push(ball);
    else if (r.guaranteed) guaranteed.push(r);
    else ranked.push(r);
  }
  ranked.sort(compareRanked);
  guaranteed.sort((x, y) => x.ball.name.en.localeCompare(y.ball.name.en, "en"));
  return { ranked, guaranteed, excluded };
}

/** Lista ranqueada completa (sem as garantidas nem as excluidas); a UI mostra o top 3. */
export function rankBalls(species: BallSpecies, balls: readonly BallInfo[], ctx: { captured: boolean }): RankedBall[] {
  return partitionBalls(species, balls, ctx).ranked;
}
