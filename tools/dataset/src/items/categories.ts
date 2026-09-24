// B4.1 passo 2: categoria pela subpasta da textura no jar + sobrescritas curadas; tags bait/evBerry/apricorn.
import type { ItemCategory, ItemTag } from "../../../../src/data/types";

/** subpasta de assets/<ns>/textures/item/<subpasta>/... -> categoria (SPEC B4.1 passo 2). */
const FOLDER_CATEGORY: Readonly<Record<string, ItemCategory>> = {
  medicine: "medicine",
  iv_candy: "ivCandy",
  experience_candy: "expCandy",
  evolution: "evolution",
  held_items: "held",
  battle_items: "battle",
  mints: "mint",
  berries: "berry",
  poke_balls: "ball",
  fossils: "fossil",
  food: "cooking",
  poke_puffs: "cooking",
  mochis: "cooking",
  aprijuice: "cooking",
  campfire_pots: "cooking",
};

const VITAMIN_PATHS = new Set(["hp_up", "protein", "iron", "calcium", "zinc", "carbos"]);
const EV_BERRY_PATHS = new Set(["pomeg_berry", "kelpsy_berry", "qualot_berry", "hondew_berry", "grepa_berry", "tamato_berry"]);

/** subpasta imediatamente sob textures/item/ (parts[0] = namespace, parts[1] = subpasta). */
function topFolderOf(texturePath: string | null): string | null {
  if (!texturePath) return null;
  // texturePath aqui e o valor final "assets/items/<ns>/<subpasta>/<arquivo>.png" (ja com o prefixo publicado).
  const withoutPrefix = texturePath.replace(/^assets\/items\//, "");
  const parts = withoutPrefix.split("/");
  return parts.length >= 3 ? (parts[1] ?? null) : null; // ns/arquivo.png direto na raiz -> sem subpasta
}

export function categorize(itemPath: string, texturePath: string | null): { category: ItemCategory; tags: ItemTag[] } {
  const top = topFolderOf(texturePath);
  let category: ItemCategory = (top && FOLDER_CATEGORY[top]) || "other";
  if (VITAMIN_PATHS.has(itemPath) || itemPath.startsWith("power_")) category = "vitamin";
  if (itemPath === "rare_candy") category = "expCandy";

  const tags: ItemTag[] = [];
  if (itemPath.endsWith("_apricorn")) tags.push("apricorn");
  if (EV_BERRY_PATHS.has(itemPath)) tags.push("evBerry");
  // "bait" e acrescentada por quem chama (precisa da lista de spawn_bait_effects, ver items/stage.ts).
  return { category, tags };
}
