// B5.2 passo 1: series (jar + kubejs) -> SeriesInfo, com o texto do lang de assets/rctmod/lang e o
// treinador-chave ordenado (order.ts); acrescenta a entrada especial "freeroam" (Modo Livre).
import type { LocalizedText, SeriesInfo } from "../../../../src/data/types";
import type { LangTable, ReportSink } from "../context";
import { readJsonEntries } from "../jar-reader";
import type { SourceReader } from "../source-reader";
import { humanize, type MergedTrainer } from "./merge";
import { orderKeyTrainers } from "./order";

export const SERIES_PREFIX = "data/rctmod/series/";
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function translatable(raw: unknown): string | null {
  if (isObject(raw) && typeof raw.translatable === "string") return raw.translatable;
  return null;
}

function textOrFallback(key: string | null, lang: LangTable, fallback: string): LocalizedText {
  if (key) {
    const found = lang.text(key);
    if (found) return found;
  }
  return { pt: fallback, en: fallback };
}

interface RawSeriesFile {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  difficulty: number | null;
  requiredSeries: string[][];
}

function parseSeriesFile(id: string, data: Record<string, unknown>, lang: LangTable): RawSeriesFile {
  const titleKey = translatable(data.title);
  const descKey = translatable(data.description);
  return {
    id,
    // titleKey/descKey ausentes do lang (atm_team, contentcreators: verificado, nao existem em nenhum
    // jar/kubejs lang) -> nome humanizado do id, igual ao fallback ja usado para tipos de treinador.
    title: textOrFallback(titleKey, lang, humanize(id)),
    description: textOrFallback(descKey, lang, ""),
    difficulty: typeof data.difficulty === "number" ? data.difficulty : null,
    requiredSeries: Array.isArray(data.requiredSeries)
      ? data.requiredSeries.map((g) => (Array.isArray(g) ? g.filter((x): x is string => typeof x === "string") : []))
      : [],
  };
}

/** Le todos os *.json sob data/rctmod/series/ do jar rctmod e do kubejs (kubejs vence em colisao de id). */
export function collectSeriesFiles(reader: SourceReader): Map<string, Record<string, unknown>> {
  const out = new Map<string, Record<string, unknown>>();
  const jar = reader.jar("rctmod");
  const jarEntries = reader.readJar(jar, [SERIES_PREFIX]);
  for (const { path, data } of readJsonEntries<Record<string, unknown>>(jarEntries, SERIES_PREFIX, jar.fileName)) {
    out.set((path.split("/").pop() as string).replace(/\.json$/, ""), data);
  }
  const kubejs = reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries<Record<string, unknown>>(kubejs, SERIES_PREFIX, "kubejs")) {
    out.set((path.split("/").pop() as string).replace(/\.json$/, ""), data);
  }
  return out;
}

export const FREEROAM_ID = "freeroam";

/** SeriesInfo[] (inclui a entrada especial freeroam), com keyTrainerIds ja na ordem topologica. */
export function buildSeries(
  reader: SourceReader,
  trainers: ReadonlyMap<string, MergedTrainer>,
  lang: LangTable,
  report: ReportSink,
): SeriesInfo[] {
  const rawFiles = collectSeriesFiles(reader);
  const allTrainerIds = new Set(trainers.keys());
  const knownSeriesIds = new Set([...rawFiles.keys(), FREEROAM_ID]);

  const result: SeriesInfo[] = [];
  for (const [id, data] of [...rawFiles].sort(([a], [b]) => a.localeCompare(b))) {
    const raw = parseSeriesFile(id, data, lang);
    for (const group of raw.requiredSeries) {
      for (const req of group) {
        if (!knownSeriesIds.has(req)) {
          report.warn("W_REQUIRED_SERIES_UNKNOWN", `serie ${id}: requiredSeries referencia serie inexistente "${req}"`, {
            seriesId: id,
            req,
          });
        }
      }
    }
    const seriesTrainers = [...trainers.values()].filter((t) => t.series.includes(id)).map((t) => t.info);
    const keyTrainers = seriesTrainers.filter((t) => t.optional === false);
    result.push({
      id,
      title: raw.title,
      description: raw.description,
      difficulty: raw.difficulty,
      requiredSeries: raw.requiredSeries,
      special: null,
      keyTrainerIds: orderKeyTrainers(keyTrainers, allTrainerIds, report),
      trainersFile: `trainers/${id}.json`,
    });
  }

  result.push({
    id: FREEROAM_ID,
    title: textOrFallback("series.rctmod.freeroam.title", lang, "Freeroam"),
    description: textOrFallback("series.rctmod.freeroam.description", lang, ""),
    difficulty: null,
    requiredSeries: [],
    special: "freeroam",
    keyTrainerIds: [],
    trainersFile: `trainers/${FREEROAM_ID}.json`,
  });

  return result;
}

/** Treinadores (chave ou nao) que pertencem a uma serie, para trainers/<seriesId>.json. */
export function trainersOfSeries(trainers: ReadonlyMap<string, MergedTrainer>, seriesId: string) {
  return [...trainers.values()].filter((t) => t.series.includes(seriesId)).map((t) => t.info);
}
