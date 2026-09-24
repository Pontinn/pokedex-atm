// B4.2 passo 1: data/cobblemon/recipe/**.json (raiz + campfire_pot/ + brewing_stand/) -> craftable com
// recipeTypes. result.id (formato real, verificado) ou result.item/result string; formato desconhecido
// vira report, nunca craftable (SPEC edge case).
import type { PipelineContext } from "../context";
import { readJsonEntries } from "../jar-reader";

const RECIPE_PREFIX = "data/cobblemon/recipe/";

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

function resultItemId(data: Json): string | null {
  const result = data.result;
  if (typeof result === "string") return result;
  if (isObject(result)) {
    if (typeof result.id === "string") return result.id;
    if (typeof result.item === "string") return result.item;
  }
  return null;
}

/** itemId -> conjunto de tipos de receita ("minecraft:crafting_shaped", "cobblemon:cooking_pot_shapeless", ...). */
export function collectCraftable(ctx: Pick<PipelineContext, "reader" | "report">): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  const add = (itemId: string, type: string) => {
    const set = out.get(itemId) ?? new Set<string>();
    set.add(type);
    out.set(itemId, set);
  };

  for (const jar of ctx.reader.listJars()) {
    const entries = ctx.reader.readJar(jar, [RECIPE_PREFIX]);
    for (const { path, data } of readJsonEntries<Json>(entries, RECIPE_PREFIX, jar.fileName)) {
      if (!isObject(data)) continue;
      const itemId = resultItemId(data);
      const type = typeof data.type === "string" ? data.type : null;
      if (!itemId || !type) {
        ctx.report.warn("W_RECIPE_UNKNOWN_RESULT", `receita com result em formato desconhecido: ${path}`, { path });
        continue;
      }
      add(itemId, type);
    }
  }
  const kubejs = ctx.reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries<Json>(kubejs, RECIPE_PREFIX, "kubejs")) {
    if (!isObject(data)) continue;
    const itemId = resultItemId(data);
    const type = typeof data.type === "string" ? data.type : null;
    if (itemId && type) add(itemId, type);
    else ctx.report.warn("W_RECIPE_UNKNOWN_RESULT", `receita (kubejs) com result em formato desconhecido: ${path}`, { path });
  }
  return out;
}
