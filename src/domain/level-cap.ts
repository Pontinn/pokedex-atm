// Level cap do Radical Cobblemon Trainers (RF-59..61, RF-111, PRD decisao 9). SPEC B6.3.
import type { LevelCapConfig, SeriesInfo, TrainerInfo } from "../data/types";
import type { TrainerProgressDoc } from "../storage/types";

export type CapMode = "series" | "freeroam" | "none";
export type TrainerLookup = ReadonlyMap<string, TrainerInfo>;

const MAX_LEVEL = 100;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** AND entre sublistas, OR dentro de cada sublista; sublista vazia = satisfeita. */
export function requiredDefeatsSatisfied(groups: readonly (readonly string[])[], defeated: ReadonlySet<string>): boolean {
  return groups.every((g) => g.length === 0 || g.some((id) => defeated.has(id)));
}

export function isAvailable(t: Pick<TrainerInfo, "id" | "requiredDefeats">, defeated: ReadonlySet<string>): boolean {
  return !defeated.has(t.id) && requiredDefeatsSatisfied(t.requiredDefeats, defeated);
}

/**
 * own = clamp(maxTeamLevel + relativeLevelCap, 0, 100); prereq = max dos trainerLevel de todos os ids de requiredDefeats
 * (0 se nenhum); resultado = max(own, prereq). Clamp ANTES de comparar. Memoizado; ciclo -> own.
 */
export function computeTrainerLevel(
  t: TrainerInfo,
  byId: TrainerLookup,
  relativeLevelCap: number,
  memo: Map<string, number> = new Map(),
  visiting: Set<string> = new Set(),
): number {
  const cached = memo.get(t.id);
  if (cached !== undefined) return cached;
  const own = clamp(t.maxTeamLevel + relativeLevelCap, 0, MAX_LEVEL);
  if (visiting.has(t.id)) return own;
  visiting.add(t.id);
  let prereq = 0;
  for (const id of t.requiredDefeats.flat()) {
    const p = byId.get(id);
    if (p) prereq = Math.max(prereq, computeTrainerLevel(p, byId, relativeLevelCap, memo, visiting));
  }
  visiting.delete(t.id);
  const level = Math.max(own, prereq);
  memo.set(t.id, level);
  return level;
}

export interface SeriesCapInput {
  keyTrainers: readonly TrainerInfo[];
  defeated: ReadonlySet<string>;
  config: Pick<LevelCapConfig, "initialLevelCap" | "relativeLevelCap">;
  mode: CapMode;
  /** todos os treinadores conhecidos (pre-requisitos fora dos chave); padrao = keyTrainers */
  allTrainers?: readonly TrainerInfo[];
}

export interface SeriesCapResult {
  cap: number;
  /** X antes do max com initialLevelCap */
  x: number;
  available: TrainerInfo[];
  reason: "freeroam" | "none" | "available" | "completed" | "inconsistent";
}

export function computeSeriesCap(input: SeriesCapInput): SeriesCapResult {
  const { keyTrainers, defeated, config, mode } = input;
  if (mode === "freeroam") return { cap: MAX_LEVEL, x: MAX_LEVEL, available: [], reason: "freeroam" };
  if (mode === "none") return { cap: Math.max(config.initialLevelCap, 1), x: 1, available: [], reason: "none" };

  const byId: Map<string, TrainerInfo> = new Map((input.allTrainers ?? keyTrainers).map((t) => [t.id, t]));
  for (const t of keyTrainers) if (!byId.has(t.id)) byId.set(t.id, t);
  const memo = new Map<string, number>();
  const available = keyTrainers.filter((t) => isAvailable(t, defeated));
  let x: number;
  let reason: SeriesCapResult["reason"];
  if (available.length > 0) {
    x = Math.min(...available.map((t) => computeTrainerLevel(t, byId, config.relativeLevelCap, memo)));
    reason = "available";
  } else if (keyTrainers.every((t) => defeated.has(t.id))) {
    x = MAX_LEVEL;
    reason = "completed";
  } else {
    console.warn("[level-cap] no key trainer available but some are pending (inconsistent data)");
    x = MAX_LEVEL;
    reason = "inconsistent";
  }
  return { cap: Math.max(config.initialLevelCap, x), x, available, reason };
}

export function isSeriesCompleted(series: Pick<SeriesInfo, "keyTrainerIds">, defeated: ReadonlySet<string>): boolean {
  return series.keyTrainerIds.every((id) => defeated.has(id));
}

/** Freeroam: desbloqueado se nao exige serie concluida ou se alguma serie (nao especial) esta concluida. */
export function isFreeroamUnlocked(
  allSeries: readonly SeriesInfo[],
  defeated: ReadonlySet<string>,
  config: Pick<LevelCapConfig, "freeroamRequiresCompletedSeries">,
): boolean {
  if (!config.freeroamRequiresCompletedSeries) return true;
  return allSeries.some((s) => s.special === null && isSeriesCompleted(s, defeated));
}

/** requiredSeries: AND entre grupos, OR dentro (serie citada inexistente nao conta como concluida). */
export function isSeriesUnlocked(
  series: SeriesInfo,
  allSeries: readonly SeriesInfo[],
  defeated: ReadonlySet<string>,
  config?: Pick<LevelCapConfig, "freeroamRequiresCompletedSeries">,
): boolean {
  if (series.special === "freeroam") return isFreeroamUnlocked(allSeries, defeated, config ?? { freeroamRequiresCompletedSeries: true });
  const byId = new Map(allSeries.map((s) => [s.id, s]));
  return series.requiredSeries.every(
    (group) => group.length === 0 || group.some((id) => {
      const s = byId.get(id);
      return s !== undefined && isSeriesCompleted(s, defeated);
    }),
  );
}

/** Uniao dos derrotados de todas as series (pre-requisitos podem citar outra serie) [ASSUMPTION B6.3]. */
export function defeatedSet(progress: Pick<TrainerProgressDoc, "series">): Set<string> {
  const out = new Set<string>();
  for (const s of Object.values(progress.series)) for (const id of Object.keys(s.defeated)) out.add(id);
  return out;
}

export function capModeFromProgress(progress: Pick<TrainerProgressDoc, "activeSeriesId" | "freeroam">): CapMode {
  if (progress.freeroam.active) return "freeroam";
  return progress.activeSeriesId === null ? "none" : "series";
}
