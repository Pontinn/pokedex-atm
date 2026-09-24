// B2.2: coleta os arquivos de especie (mecanismo (a), override completo) e de species_additions
// (mecanismo (b), merge aditivo) de todos os jars na ordem de SPEC 5.1.1, e depois do kubejs.
import { readJsonEntries } from "../jar-reader";
import { PipelineError } from "../lib/errors";
import type { SourceReader } from "../source-reader";

export const SPECIES_PREFIX = "data/cobblemon/species/";
export const ADDITIONS_PREFIX = "data/cobblemon/species_additions/";

export interface SpeciesFileEntry {
  /** "cobblemon" | "allthemons" | "ccc" | "mega_showdown" | ... | "kubejs" */
  source: string;
  /** caminho dentro do jar (ou relativo a kubejs/) */
  path: string;
  /** nome do arquivo sem extensao */
  slug: string;
  data: Record<string, unknown>;
}

export interface AdditionEntry {
  source: string;
  path: string;
  /** slug alvo, sem namespace ("cobblemon:mareep" -> "mareep"; "pikachu" tambem e aceito) */
  target: string;
  data: Record<string, unknown>;
}

export interface CollectedSpecies {
  species: SpeciesFileEntry[];
  additions: AdditionEntry[];
}

export function slugFromPath(p: string): string {
  const base = p.split("/").pop() ?? p;
  return base.replace(/\.json$/, "");
}

export function targetSlug(target: string): string {
  const idx = target.indexOf(":");
  return idx >= 0 ? target.slice(idx + 1) : target;
}

function asObject(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new PipelineError("E_SPECIES_INVALID", "esperado objeto JSON", where);
  }
  return value as Record<string, unknown>;
}

export function collectSpecies(reader: SourceReader): CollectedSpecies {
  const species: SpeciesFileEntry[] = [];
  const additions: AdditionEntry[] = [];
  const pushAdditions = (source: string, list: { path: string; data: unknown }[]) => {
    for (const { path, data } of list) {
      const obj = asObject(data, `${source}!${path}`);
      if (typeof obj.target !== "string") throw new PipelineError("E_SPECIES_INVALID", "species_addition sem target", `${source}!${path}`);
      additions.push({ source, path, target: targetSlug(obj.target), data: obj });
    }
  };
  for (const jar of reader.listJars()) {
    const entries = reader.readJar(jar, [SPECIES_PREFIX, ADDITIONS_PREFIX]);
    for (const { path, data } of readJsonEntries(entries, SPECIES_PREFIX, jar.fileName)) {
      species.push({ source: jar.id, path, slug: slugFromPath(path), data: asObject(data, `${jar.fileName}!${path}`) });
    }
    pushAdditions(jar.id, readJsonEntries(entries, ADDITIONS_PREFIX, jar.fileName));
  }
  // kubejs/data/cobblemon/** (precedencia 3): pastas normais nos dois modos
  const kubejs = reader.readTree("kubejs");
  for (const { path, data } of readJsonEntries(kubejs, SPECIES_PREFIX, "kubejs")) {
    species.push({ source: "kubejs", path, slug: slugFromPath(path), data: asObject(data, `kubejs!${path}`) });
  }
  pushAdditions("kubejs", readJsonEntries(kubejs, ADDITIONS_PREFIX, "kubejs"));
  return { species, additions };
}
