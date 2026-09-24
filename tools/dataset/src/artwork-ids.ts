// B3.3 (Onda 2): ids de artwork da PokeAPI por forma (SpeciesForm.artworkId). So especies com forms
// (dex 1..1025) consultam pokemon-species/<dex> -> varieties[]; o sufixo apos "<slug>-" e comparado
// com o nome da forma normalizado. Verifica a existencia do PNG de artwork com HEAD (cacheado) para
// nunca deixar a UI com um link morto (SPEC B3.3 passo 2, [ASSUMPTION]).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { PipelineContext } from "./context";
import type { DerivedSpecies } from "./species/stage-derive";
import { writeJsonAtomic } from "./lib/fs-atomic";
import { createPokeapiClient, isPokeapiError, type PokeapiClient } from "./pokeapi/client";

export const ARTWORK_BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
export const MAX_ARTWORK_DEX = 1025;

/** "Alolan" -> "alola" etc: as 4 formas regionais citadas pela SPEC. Demais nomes tentam o proprio texto. */
const FORM_NAME_ALIASES: Readonly<Record<string, string>> = {
  alolan: "alola",
  galarian: "galar",
  hisuian: "hisui",
  paldean: "paldea",
};

/**
 * Nome da forma -> sufixo esperado de variedade da PokeAPI ("charizard-mega-x" -> "mega-x"), ou null
 * quando a forma nao tem correspondente conhecido (ex. "Mega-Z", "Patrickyu": customs sem variety).
 */
export function formNameToVarietySuffix(name: string): string | null {
  const lower = name.toLowerCase();
  const alias = FORM_NAME_ALIASES[lower];
  if (alias) return alias;
  if (/^mega(-[xy])?$/.test(lower)) return lower; // "mega", "mega-x", "mega-y" (nao casa "mega-z")
  if (lower === "gmax") return "gmax";
  return null;
}

interface PokeapiVariety {
  pokemon: { name: string; url: string };
}
interface PokeapiSpeciesDetail {
  varieties?: PokeapiVariety[];
}

function idFromPokemonUrl(url: string): number | null {
  const match = /\/pokemon\/(\d+)\/?$/.exec(url);
  return match?.[1] ? Number(match[1]) : null;
}

/** slug -> sufixo de variedade -> id da PokeAPI, a partir de pokemon-species/<dex>.varieties[]. */
async function fetchVarietyIds(client: PokeapiClient, dex: number, slug: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const data = await client.getJson<PokeapiSpeciesDetail>(`/pokemon-species/${dex}`);
  const prefix = `${slug}-`;
  for (const variety of data?.varieties ?? []) {
    const name = variety.pokemon.name;
    if (!name.startsWith(prefix)) continue;
    const id = idFromPokemonUrl(variety.pokemon.url);
    if (id !== null) map.set(name.slice(prefix.length), id);
  }
  return map;
}

/** Cache simples em disco (url -> existe?), usado so por este HEAD check. */
function loadHeadCache(file: string): Record<string, boolean> {
  if (!existsSync(file)) return {};
  try {
    return JSON.parse(readFileSync(file, "utf8")) as Record<string, boolean>;
  } catch {
    return {};
  }
}

async function artworkExists(id: number, cacheFile: string, cache: Record<string, boolean>, offline: boolean): Promise<boolean> {
  const url = `${ARTWORK_BASE_URL}/${id}.png`;
  if (url in cache) return cache[url] as boolean;
  if (offline) return false; // sem rede: nao confirma, nao afirma (evita link morto)
  let exists: boolean;
  try {
    const res = await fetch(url, { method: "HEAD" });
    exists = res.ok;
  } catch {
    exists = false;
  }
  cache[url] = exists;
  writeJsonAtomic(cacheFile, cache);
  return exists;
}

/** Preenche form.artworkId em ctx.species (mutacao in-place, mesmo padrao de B2.3/B2.4). */
export async function runArtworkIds(ctx: PipelineContext, client?: PokeapiClient): Promise<void> {
  const pokeapi = client ?? createPokeapiClient({ cacheDir: ctx.cacheDir("pokeapi"), offline: ctx.flags.offline });
  const headCacheFile = path.join(ctx.cacheDir("pokeapi"), "artwork-head-cache.json");
  const headCache = loadHeadCache(headCacheFile);

  for (const [dex, merged] of ctx.species) {
    if (dex > MAX_ARTWORK_DEX) continue;
    const species = merged as DerivedSpecies;
    if (!species.resolvedForms || species.resolvedForms.length === 0) continue;

    let varieties: Map<string, number>;
    try {
      varieties = await fetchVarietyIds(pokeapi, dex, species.slug);
    } catch (error) {
      const detail = isPokeapiError(error) ? error.message : String(error);
      ctx.report.warn("W_ARTWORK_SPECIES_UNAVAILABLE", `pokemon-species indisponivel para dex ${dex}`, { dex, detail });
      continue;
    }

    for (const form of species.resolvedForms) {
      const suffix = formNameToVarietySuffix(form.name);
      const id = suffix ? varieties.get(suffix) : undefined;
      if (id === undefined) {
        form.artworkId = null;
        continue;
      }
      const exists = await artworkExists(id, headCacheFile, headCache, ctx.flags.offline);
      if (!exists) {
        ctx.report.warn("W_ARTWORK_404", `artwork ausente para variedade ${species.slug}-${suffix} (id ${id})`, { dex, id });
      }
      form.artworkId = exists ? id : null;
    }
  }
}
