// B5.1: treinadores (rctmod + kubejs) e definicoes de spawn. B5.2 (proximo commit) acrescenta
// series.json, ordem topologica dos treinadores-chave e levelCapConfig.
import type { PipelineContext } from "../context";
import { collectTrainers } from "./collect";
import { mergeTrainers } from "./merge";
import { writeTrainerFilesBySeries } from "./writer";

/** Treinadores e definicoes de spawn (B5.1); series/ordem/level cap chegam em B5.2. */
export async function runTrainersStage(ctx: PipelineContext): Promise<void> {
  const collected = collectTrainers(ctx.reader);
  const trainers = mergeTrainers(collected, ctx.species, ctx.lang, ctx.report);
  writeTrainerFilesBySeries(ctx, trainers);
  ctx.setCount("trainers", trainers.size);
  ctx.report.section("trainers", { total: trainers.size });
}
