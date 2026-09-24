// B5.1 passo 3: escreve trainers/<seriesId>.json em <outDir>/data/ (staging; nunca public/).
// B5.2 acrescenta series.json (proximo commit, mesmo agente).
import type { TrainersFile } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { writeJsonAtomic } from "../lib/fs-atomic";
import type { MergedTrainer } from "./merge";

function trainersOfSeries(trainers: ReadonlyMap<string, MergedTrainer>, seriesId: string) {
  return [...trainers.values()].filter((t) => t.series.includes(seriesId)).map((t) => t.info);
}

/**
 * Agrupa por serie a partir do `series[]` de cada treinador mesclado (sem SeriesInfo/ordem topologica,
 * que sao de B5.2) e escreve trainers/<seriesId>.json para cada serie referenciada.
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
