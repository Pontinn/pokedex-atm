// Report do pipeline: avisos, secoes por etapa, tempos; tabela no stdout (--report) e <outDir>/report.json.
import path from "node:path";
import type { PipelineContext, ReportSink, ReportWarning, StageName } from "./context";
import { writeJsonAtomic } from "./lib/fs-atomic";
import { log } from "./lib/log";

export function createReportSink(getStage: () => StageName | "setup"): ReportSink {
  const warnings: ReportWarning[] = [];
  const sections: Record<string, unknown> = {};
  const timings: Partial<Record<StageName, number>> = {};
  return {
    warn(code, message, data) {
      warnings.push({ code, message, stage: getStage(), ...(data === undefined ? {} : { data }) });
      log.warn(`[${code}] ${message}`);
    },
    section(name, data) {
      sections[name] = data;
    },
    timing(stage, ms) {
      timings[stage] = ms;
    },
    get warnings() {
      return warnings;
    },
    get sections() {
      return sections;
    },
    get timings() {
      return timings;
    },
  };
}

export interface ReportFile {
  generatedAt: string;
  source: { root: string; mode: string };
  pack: PipelineContext["source"]["pack"];
  cobblemonVersion: string;
  flags: PipelineContext["flags"];
  counts: PipelineContext["counts"];
  media: ReturnType<PipelineContext["media"]["totals"]>;
  levelCapConfig: PipelineContext["levelCapConfig"];
  sources: PipelineContext["source"]["sources"];
  timingsMs: ReportSink["timings"];
  warnings: ReportSink["warnings"];
  sections: ReportSink["sections"];
}

export function buildReport(ctx: PipelineContext): ReportFile {
  return {
    generatedAt: new Date().toISOString(),
    source: { root: ctx.source.root, mode: ctx.source.mode },
    pack: ctx.source.pack,
    cobblemonVersion: ctx.source.cobblemonVersion,
    flags: ctx.flags,
    counts: ctx.counts,
    media: ctx.media.totals(),
    levelCapConfig: ctx.levelCapConfig,
    sources: ctx.source.sources,
    timingsMs: ctx.report.timings,
    warnings: ctx.report.warnings,
    sections: ctx.report.sections,
  };
}

/** Grava <outDir>/report.json e devolve o caminho. */
export function writeReport(ctx: PipelineContext): string {
  const file = path.join(ctx.outDir, "report.json");
  writeJsonAtomic(file, buildReport(ctx), { pretty: true });
  return file;
}

function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / 1024 / 1024).toFixed(2)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${n} B`;
}

/** Tabela de contagens/tamanhos (uma linha "chave valor" por contagem, ex. "species 1027"). */
export function formatReportTable(ctx: PipelineContext): string {
  const lines: string[] = [];
  lines.push("== dataset report ==");
  lines.push(`source ${ctx.source.mode} ${ctx.source.root}`);
  lines.push(`pack ${JSON.stringify(ctx.source.pack)}`);
  lines.push(`cobblemonVersion ${ctx.source.cobblemonVersion}`);
  lines.push("-- counts --");
  for (const [key, value] of Object.entries(ctx.counts)) {
    lines.push(`${key} ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);
  }
  const media = ctx.media.totals();
  lines.push("-- media --");
  lines.push(`cries ${formatBytes(media.criesBytes)}`);
  lines.push(`sfx ${formatBytes(media.sfxBytes)}`);
  lines.push(`itemTextures ${formatBytes(media.itemTexturesBytes)}`);
  lines.push(`sprites ${formatBytes(media.spritesBytes)}`);
  lines.push(`total ${formatBytes(media.totalBytes)}`);
  lines.push("-- timings --");
  for (const [stage, ms] of Object.entries(ctx.report.timings)) lines.push(`${stage} ${ms} ms`);
  lines.push(`warnings ${ctx.report.warnings.length}`);
  return lines.join("\n");
}
