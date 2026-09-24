// B5.1/B5.2: treinadores (rctmod + kubejs), series, ordem topologica dos treinadores-chave e level cap config.
import { loadLevelCapConfig } from "../config-toml";
import type { PipelineContext } from "../context";
import { collectTrainers } from "./collect";
import { mergeTrainers } from "./merge";
import { buildSeries } from "./series";
import { writeSeriesAndTrainers } from "./writer";

/** Treinadores, series, treinadores-chave e levelCapConfig. */
export async function runTrainersStage(ctx: PipelineContext): Promise<void> {
  const collected = collectTrainers(ctx.reader);
  const trainers = mergeTrainers(collected, ctx.species, ctx.lang, ctx.report);
  const series = buildSeries(ctx.reader, trainers, ctx.lang, ctx.report);
  writeSeriesAndTrainers(ctx, series, trainers);

  ctx.levelCapConfig = loadLevelCapConfig(ctx.reader, ctx.report);
  ctx.setCount("trainers", trainers.size);
  ctx.setCount("series", series.length);
  const keyTrainers: Record<string, number> = {};
  for (const s of series) {
    if (s.special !== null) continue; // freeroam nunca tem treinador-chave
    keyTrainers[s.id] = s.keyTrainerIds.length;
  }
  ctx.setCount("keyTrainers", keyTrainers);
  ctx.report.section("trainers", { total: trainers.size, series: series.map((s) => ({ id: s.id, keyTrainers: s.keyTrainerIds.length })) });
}
