// B2.3: fossils.json - uniao de data/cobblemon/fossils/*.json de todos os jars + kubejs (SPEC 5.1.1, 5.1.2).
import type { FossilRoute } from "../../../../src/data/types";
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";

const FOSSILS_PREFIX = "data/cobblemon/fossils/";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

interface RawFossilRoute {
  resultSlug: string;
  fossils: string[];
  source: string;
}

function parseFile(data: unknown, source: string, where: string, report: PipelineContext["report"]): RawFossilRoute | null {
  if (!isObject(data) || typeof data.result !== "string" || !Array.isArray(data.fossils)) {
    report.warn("W_FOSSIL_INVALID", "arquivo de fossil sem result/fossils", where);
    return null;
  }
  const fossils = data.fossils.filter((f): f is string => typeof f === "string");
  return { resultSlug: data.result, fossils, source };
}

/** Coleta bruta (sem resolver dex ainda); stage-derive resolve resultSlug -> dex via ctx.species. */
export function collectFossils(ctx: Pick<PipelineContext, "reader" | "report">): RawFossilRoute[] {
  const out: RawFossilRoute[] = [];
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [FOSSILS_PREFIX]);
    for (const { path, data } of readJsonEntries(entries, FOSSILS_PREFIX, jar.fileName)) {
      const parsed = parseFile(data, jar.id, `${jar.fileName}!${path}`, ctx.report);
      if (parsed) out.push(parsed);
    }
  }
  const kubejs = ctx.reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries(kubejs, FOSSILS_PREFIX, "kubejs")) {
    const parsed = parseFile(data, "kubejs", `kubejs!${path}`, ctx.report);
    if (parsed) out.push(parsed);
  }
  return out;
}

/** Resolve resultSlug -> dex (slugToDex); rota sem especie correspondente e descartada + report. */
export function resolveFossils(
  raw: readonly RawFossilRoute[],
  slugToDex: ReadonlyMap<string, number>,
  report: PipelineContext["report"],
): FossilRoute[] {
  const out: FossilRoute[] = [];
  for (const r of raw) {
    const dex = slugToDex.get(r.resultSlug);
    if (dex === undefined) {
      report.warn("W_FOSSIL_UNMATCHED", `fossil aponta para especie desconhecida: ${r.resultSlug}`, r);
      continue;
    }
    out.push({ result: dex, resultSlug: r.resultSlug, fossils: r.fossils, source: r.source });
  }
  return out;
}
