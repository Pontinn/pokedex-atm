// Contrato compartilhado (Onda 0, B1.5, congelado): tipos de regra de Pokebola e faixas da Heavy Ball.
// Consumido por B4.3 (pipeline) e B6.4 (rankBalls).
export type { BallRule, BallCondition, BallApplies } from "../data/types";

export interface HeavyBallBand {
  aboveHg: number;
  multiplier: 1 | 2 | 3 | 4;
}

/** Vale a ultima faixa com weight > aboveHg (<= 1000 hg -> 1, > 1000 -> 2, > 2000 -> 3, > 3000 -> 4). [ASSUMPTION A7] */
export const HEAVY_BALL_BANDS: readonly HeavyBallBand[] = [
  { aboveHg: 0, multiplier: 1 },
  { aboveHg: 1000, multiplier: 2 },
  { aboveHg: 2000, multiplier: 3 },
  { aboveHg: 3000, multiplier: 4 },
];

/** Multiplicador da Heavy Ball pelo peso em hectogramas (peso ausente ou 0 -> 1). */
export function heavyBallMultiplier(weightHg: number | null | undefined): 1 | 2 | 3 | 4 {
  if (weightHg == null || !Number.isFinite(weightHg) || weightHg <= 0) return 1;
  let multiplier: 1 | 2 | 3 | 4 = 1;
  for (const band of HEAVY_BALL_BANDS) {
    if (weightHg > band.aboveHg) multiplier = band.multiplier;
  }
  return multiplier;
}
