// Entrada do pipeline de dataset (`npm run dataset`). Contrato congelado: ordem das etapas, --only e --out.
// Nenhum agente paralelo edita este arquivo: cada etapa ja esta encaixada aqui e so o corpo do stub muda.
import { rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { runBallsStage } from "./balls/stage";
import { parseCliArgs } from "./cli";
import { assertNodeVersion, resolveConfig } from "./config";
import { createContext, emptyLangTable, type PipelineContext, type StageName } from "./context";
import { openSource } from "./instance";
import { runItemsStage } from "./items/stage";
import { isPipelineError } from "./lib/errors";
import { resetDir } from "./lib/fs-atomic";
import { log } from "./lib/log";
import { runMediaStage } from "./media/stage";
import { runPokeapiStage } from "./pokeapi/stage";
import { createReportSink, formatReportTable, writeReport } from "./report";
import { runWriteStage } from "./species/index-writer";
import { runSpeciesCore } from "./species/merge";
import { runSpeciesDerive } from "./species/stage-derive";
import { runTrainersStage } from "./trainers/stage";

type StageFn = (ctx: PipelineContext) => Promise<void>;

/** Ordem final (SPEC B2.1 passo 7). speciesCore sempre roda primeiro. */
export const PIPELINE: readonly (readonly [StageName, StageFn])[] = [
  ["speciesCore", runSpeciesCore],
  ["speciesDerive", runSpeciesDerive],
  ["pokeapi", runPokeapiStage],
  ["media", runMediaStage],
  ["balls", runBallsStage],
  ["trainers", runTrainersStage],
  ["items", runItemsStage],
  ["write", runWriteStage],
];

/** Etapas que rodam para as flags dadas: tudo, ou speciesCore + a etapa de --only. */
export function selectStages(only: StageName | null): (readonly [StageName, StageFn])[] {
  return PIPELINE.filter(([name]) => only === null || name === "speciesCore" || name === only);
}

export async function runPipeline(argv: readonly string[], env: NodeJS.ProcessEnv = process.env): Promise<PipelineContext> {
  assertNodeVersion();
  const flags = parseCliArgs(argv);
  const config = resolveConfig(flags, env);
  let stage: StageName | "setup" = "setup";
  const report = createReportSink(() => stage);
  // Valida a fonte ANTES de tocar em qualquer pasta de saida.
  const { reader, info } = openSource(config.sourceRoot, (code, message) => report.warn(code, message));
  log.info(`fonte: ${info.mode} ${path.relative(config.repoRoot, info.root) || info.root} (${config.sourceOrigin})`);

  resetDir(config.outDir);
  const ctx = createContext({
    reader,
    source: info,
    lang: emptyLangTable(),
    outDir: config.outDir,
    cacheRoot: config.cacheRoot,
    report,
    flags,
  });

  try {
    for (const [name, run] of selectStages(flags.only)) {
      stage = name;
      ctx.currentStage = name;
      const started = performance.now();
      await run(ctx);
      report.timing(name, Math.round(performance.now() - started));
    }
  } catch (error) {
    // artefato parcial nunca fica: o staging desta execucao e removido
    rmSync(config.outDir, { recursive: true, force: true });
    throw error;
  }
  stage = "setup";
  ctx.currentStage = "setup";
  const reportFile = writeReport(ctx);
  if (flags.report) log.info(formatReportTable(ctx));
  log.info(`report: ${path.relative(config.repoRoot, reportFile)}`);
  return ctx;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPipeline(process.argv.slice(2)).catch((error: unknown) => {
    if (isPipelineError(error)) log.error(error.message);
    else log.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exitCode = 1;
  });
}
