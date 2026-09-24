// B4.2 passo 3: data/cobblemon/berries/<id>.json -> plantable (preferredBiomeTags, favoriteMulches);
// apricorns e mints entram como plantable sem bioma preferido [ASSUMPTION SPEC 5.1.6].
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";

const BERRIES_PREFIX = "data/cobblemon/berries/";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

export interface PlantableInfo {
  biomeTags: string[];
  mulches: string[];
}

/** itemId ("cobblemon:<id>_berry") -> dados de plantio, a partir dos arquivos berries/*.json. */
export function collectBerryPlantable(ctx: Pick<PipelineContext, "reader">): Map<string, PlantableInfo> {
  const out = new Map<string, PlantableInfo>();
  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [BERRIES_PREFIX]);
    for (const { path, data } of readJsonEntries<Json>(entries, BERRIES_PREFIX, jar.fileName)) {
      if (!isObject(data)) continue;
      const fileName = (path.split("/").pop() ?? path).replace(/\.json$/, "");
      out.set(`cobblemon:${fileName}`, {
        biomeTags: strings(data.preferredBiomeTags),
        mulches: strings(data.favoriteMulches),
      });
    }
  }
  return out;
}
