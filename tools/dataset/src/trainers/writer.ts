// B5.1 passo 3 / B5.2 passo 4: escreve trainers/<seriesId>.json e series.json em <outDir>/data/
// (staging; nunca public/).
import type { SeriesInfo, TrainersFile } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { writeJsonAtomic } from "../lib/fs-atomic";
import type { MergedTrainer } from "./merge";
import { trainersOfSeries } from "./series";

/**
 * B5.1: agrupa por serie so a partir do `series[]` de cada treinador mesclado (sem SeriesInfo/ordem
 * topologica, que sao de B5.2) e escreve trainers/<seriesId>.json para cada serie referenciada.
 */
export function writeTrainerFilesBySeries(ctx: PipelineContext, trainers: ReadonlyMap<string, MergedTrainer>): string[] {
  const seriesIds = new Set<string>();
  for (const t of trainers.values()) for (const s of t.series) seriesIds.add(s);
  for (const seriesId of seriesIds) {
    const file: TrainersFile = { seriesId, trainers: trainersOfSeries(trainers, seriesId) };
    writeJsonAtomic(ctx.dataPath(`trainers/${seriesId}.json`), file);
  }
  return [...seriesIds].sort();
}

/**
 * B5.2: series.json (SeriesInfo[] com keyTrainerIds ja ordenados) + reescreve trainers/<seriesId>.json,
 * agora incluindo series sem nenhum treinador (ex. freeroam).
 */
export function writeSeriesAndTrainers(
  ctx: PipelineContext,
  series: readonly SeriesInfo[],
  trainers: ReadonlyMap<string, MergedTrainer>,
): void {
  writeJsonAtomic(ctx.dataPath("series.json"), series);
  for (const s of series) {
    const file: TrainersFile = { seriesId: s.id, trainers: trainersOfSeries(trainers, s.id) };
    writeJsonAtomic(ctx.dataPath(s.trainersFile), file);
  }
}
