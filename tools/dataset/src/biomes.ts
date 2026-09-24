// B2.5 passo 3: coleta todas as tags/ids de bioma usados em spawns e biomas de treinador; rotulo en =
// humanizado do id; rotulo pt = tradução palavra-a-palavra pelo dicionario curado (biome-labels.pt.ts);
// palavra sem tradução cai no proprio texto en (reportado). Ex. reais confirmados:
// "#cobblemon:is_overworld" -> "Overworld"; "#legendary_spawns_ccc:jirachi" -> "Special biome: Jirachi";
// "legendarymonuments:distortion_world_biome" -> "Distortion World".
import { existsSync, readFileSync } from "node:fs";
import type { BiomeLabels, LocalizedText, SeriesInfo, TrainersFile } from "../../../src/data/types";
import type { DerivedSpecies } from "./species/stage-derive";
import type { PipelineContext } from "./context";
import { PT_BIOME_WORDS } from "./biome-labels.pt";

/** Namespaces cujo path e o nome de uma especie/evento (rotas especiais de spawn do ccc). */
const SPECIAL_NAMESPACES = new Set(["legendary_spawns_ccc", "paradox_spawns_ccc", "ub_spawns_ccc"]);

function capitalizeWords(s: string): string {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** SPEC B2 passo 9: humaniza a tag/id de bioma para o rotulo en. */
export function humanizeBiomeTagEn(tag: string): string {
  const clean = tag.replace(/^#/, "");
  const colon = clean.indexOf(":");
  const ns = colon === -1 ? "" : clean.slice(0, colon);
  const rest = colon === -1 ? clean : clean.slice(colon + 1);
  if (SPECIAL_NAMESPACES.has(ns)) {
    const first = rest.split("/")[0] ?? rest;
    return `Special biome: ${capitalizeWords(first.replace(/_/g, " "))}`;
  }
  const cleanedPath = rest.replace(/^is_/, "").replace(/_biome$/, "");
  return capitalizeWords(cleanedPath.replace(/[_/]/g, " "));
}

/** Traduz palavra a palavra pelo dicionario curado; palavra ausente fica no proprio texto en. */
export function translateBiomeLabel(en: string): { pt: string; missingWords: string[] } {
  const missingWords: string[] = [];
  const pt = en
    .split(" ")
    .map((word) => {
      const key = word.toLowerCase().replace(/[^a-z]/g, "");
      const translated = PT_BIOME_WORDS[key];
      if (!translated && key.length > 0 && key !== ":") missingWords.push(word);
      return translated ?? word;
    })
    .join(" ");
  return { pt, missingWords };
}

function collectTrainerBiomeTags(ctx: PipelineContext): Set<string> {
  const tags = new Set<string>();
  const seriesPath = ctx.dataPath("series.json");
  if (!existsSync(seriesPath)) return tags;
  const series = JSON.parse(readFileSync(seriesPath, "utf8")) as SeriesInfo[];
  for (const s of series) {
    const file = ctx.dataPath(s.trainersFile);
    if (!existsSync(file)) continue;
    const data = JSON.parse(readFileSync(file, "utf8")) as TrainersFile;
    for (const trainer of data.trainers) {
      for (const tag of trainer.biomes.whitelist) tags.add(tag);
      for (const tag of trainer.biomes.blacklist) tags.add(tag);
    }
  }
  return tags;
}

/** Coleta as tags de spawns (especies) + biomas de treinador ja escritos no staging, monta biomes.json. */
export function buildBiomeLabels(ctx: PipelineContext): BiomeLabels {
  const tags = new Set<string>();
  for (const merged of ctx.species.values()) {
    const species = merged as DerivedSpecies;
    for (const spawn of species.spawns ?? []) {
      for (const t of spawn.biomes) tags.add(t);
      for (const t of spawn.antiBiomes) tags.add(t);
    }
  }
  for (const tag of collectTrainerBiomeTags(ctx)) tags.add(tag);

  const out: BiomeLabels = {};
  for (const tag of tags) {
    const en = humanizeBiomeTagEn(tag);
    const { pt, missingWords } = translateBiomeLabel(en);
    if (missingWords.length > 0) {
      ctx.report.warn("W_BIOME_LABEL_PT_MISSING", `sem traducao pt para palavra(s) de "${tag}"`, { tag, missingWords });
    }
    out[tag] = { pt, en } satisfies LocalizedText;
  }
  return out;
}
