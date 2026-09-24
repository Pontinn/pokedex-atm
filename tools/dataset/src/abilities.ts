// B3.2: catalogo de habilidades. Nome/descricao do lang; sem PokeAPI (SPEC B3.2 passo 2).
import type { AbilitiesFile, LocalizedText } from "../../../src/data/types";
import type { PipelineContext } from "./context";
import { writeJsonAtomic } from "./lib/fs-atomic";

const ABILITY_DESC_KEY = /^cobblemon\.ability\.([a-z0-9_]+)\.desc$/;

function humanize(id: string): LocalizedText {
  const text = id
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return { pt: text, en: text };
}

/** Uniao das abilities das especies (base + formas) + chaves de lang cobblemon.ability.<id>.desc. */
export function collectAbilityIds(ctx: PipelineContext): Set<string> {
  const ids = new Set<string>();
  for (const species of ctx.species.values()) {
    for (const ability of species.abilities) ids.add(ability.id);
    for (const form of species.forms) for (const ability of form.abilities) ids.add(ability.id);
  }
  for (const key of ctx.lang.pt.keys()) {
    const match = ABILITY_DESC_KEY.exec(key);
    if (match) ids.add(match[1] as string);
  }
  for (const key of ctx.lang.en.keys()) {
    const match = ABILITY_DESC_KEY.exec(key);
    if (match) ids.add(match[1] as string);
  }
  return ids;
}

export function buildAbilities(ctx: PipelineContext): AbilitiesFile {
  const out: AbilitiesFile = {};
  for (const id of [...collectAbilityIds(ctx)].sort()) {
    const langName = ctx.lang.text(`cobblemon.ability.${id}`);
    const langDesc = ctx.lang.text(`cobblemon.ability.${id}.desc`);
    if (!langName) ctx.report.warn("W_ABILITY_NO_LANG", `habilidade sem nome no lang: ${id}`);
    out[id] = { id, name: langName ?? humanize(id), description: langDesc ?? { pt: "", en: "" } };
  }
  return out;
}

export function runAbilities(ctx: PipelineContext): void {
  const abilities = buildAbilities(ctx);
  ctx.setCount("abilities", Object.keys(abilities).length);
  writeJsonAtomic(ctx.dataPath("abilities.json"), abilities);
}
