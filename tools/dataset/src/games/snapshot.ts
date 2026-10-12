// pokemon-generation B1.2: coletor do recorte curado de jogos (UNICO codigo com rede da feature, rodado so a mao
// por npm run dataset:snapshot-games). Nenhum modulo do pipeline (npm run dataset) importa este arquivo.
import { POKEAPI_BASE, type PokeapiClient } from "../pokeapi/client";
import { PipelineError } from "../lib/errors";
import { deriveGames, gameSnapshotSchema, type GameSnapshot } from "./availability";

export const GAME_SNAPSHOT_SCRIPT = "npm run dataset:snapshot-games";
export const GAME_SNAPSHOT_LICENSE =
  "PokeAPI (pokeapi.co): API livre, sem autenticacao; uso justo com cache local. Dump estatico PokeAPI/api-data sob BSD-3-Clause.";

const SPECIES_URL = /\/pokemon-species\/(\d+)\/?$/;

interface NamedRef {
  name: string;
  url: string;
}
interface ListResponse {
  count: number;
  results: NamedRef[];
}
interface VersionGroupResponse {
  id: number;
  name: string;
  order: number;
  pokedexes: NamedRef[];
  versions: NamedRef[];
}
interface PokedexResponse {
  id: number;
  name: string;
  is_main_series: boolean;
  version_groups: NamedRef[];
  pokemon_entries: { entry_number: number; pokemon_species: NamedRef }[];
}
interface VersionResponse {
  name: string;
  names: { name: string; language: { name: string } }[];
}

function invalid(message: string, detail?: string): PipelineError {
  return new PipelineError("E_GAME_SNAPSHOT_INVALID", message, detail);
}

function speciesIdOf(url: string): number {
  const m = SPECIES_URL.exec(url);
  if (!m) throw invalid(`URL de especie fora do padrao /pokemon-species/<id>/`, url);
  return Number(m[1]);
}

const byCodeUnit = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const sortedUnique = (ids: readonly number[]): number[] => [...new Set(ids)].sort((a, b) => a - b);

/**
 * Captura o recorte cru (version-groups, Pokedexes, versoes, ids de especie) pelo cliente existente (cache + backoff).
 * Nunca devolve recorte parcial: 404, paginacao incompleta, nome EN ausente ou espelho quebrado = erro.
 */
export async function collectGameSnapshot(client: PokeapiClient, capturedAt: Date): Promise<GameSnapshot> {
  const urls = new Set<string>();
  const get = async <T>(rel: string): Promise<T> => {
    urls.add(rel);
    const data = await client.getJson<T>(rel);
    if (data === null) throw invalid("recurso inexistente na PokeAPI (404)", rel);
    return data;
  };
  const getList = async (rel: string): Promise<ListResponse> => {
    const list = await get<ListResponse>(rel);
    if (list.count > list.results.length) throw invalid(`paginacao: aumente o limit (${list.count} > ${list.results.length})`, rel);
    return list;
  };

  const [groupList, dexList, speciesList] = await Promise.all([
    getList("/version-group?limit=100"),
    getList("/pokedex?limit=100"),
    getList("/pokemon-species?limit=10000"),
  ]);

  const [groups, dexes] = await Promise.all([
    Promise.all(groupList.results.map((r) => get<VersionGroupResponse>(`/version-group/${r.name}`))),
    Promise.all(dexList.results.map((r) => get<PokedexResponse>(`/pokedex/${r.name}`))),
  ]);

  const versionNames = [...new Set(groups.flatMap((g) => g.versions.map((v) => v.name)))];
  const versions = await Promise.all(versionNames.map((name) => get<VersionResponse>(`/version/${name}`)));
  const nameEnByVersion = new Map<string, string>();
  versionNames.forEach((name, i) => {
    const en = versions[i]?.names.find((n) => n.language.name === "en")?.name;
    if (!en) throw invalid(`versao sem nome em ingles`, `/version/${name}`);
    nameEnByVersion.set(name, en);
  });

  const pokemonSpeciesIds = sortedUnique(speciesList.results.map((r) => speciesIdOf(r.url)));
  if (pokemonSpeciesIds.length !== speciesList.count) {
    throw invalid(`pokemon-species: ${pokemonSpeciesIds.length} ids distintos para count ${speciesList.count}`, "/pokemon-species?limit=10000");
  }

  const snapshot: GameSnapshot = {
    source: {
      api: POKEAPI_BASE,
      capturedAt: capturedAt.toISOString(),
      script: GAME_SNAPSHOT_SCRIPT,
      license: GAME_SNAPSHOT_LICENSE,
      urls: [...urls].sort(byCodeUnit),
    },
    pokemonSpeciesIds,
    versionGroups: groups
      .map((g) => ({
        id: g.id,
        name: g.name,
        order: g.order,
        pokedexes: g.pokedexes.map((p) => p.name),
        versions: g.versions.map((v) => ({ name: v.name, nameEn: nameEnByVersion.get(v.name) as string })),
      }))
      .sort((a, b) => a.id - b.id),
    pokedexes: dexes
      .map((p) => ({
        id: p.id,
        name: p.name,
        isMainSeries: p.is_main_series,
        versionGroups: p.version_groups.map((v) => v.name),
        species: sortedUnique(p.pokemon_entries.map((e) => speciesIdOf(e.pokemon_species.url))),
      }))
      .sort((a, b) => a.id - b.id),
  };

  const parsed = gameSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    const issues = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`);
    throw invalid(`recorte capturado fora do formato: ${issues.join("; ")}`);
  }
  deriveGames(parsed.data); // sanidade (espelho, ids, ao menos 1 jogo) antes de devolver
  return parsed.data;
}
