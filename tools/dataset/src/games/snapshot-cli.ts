// pokemon-generation B1.2: `npm run dataset:snapshot-games [-- --fresh] [-- --out <arquivo>]`, rodado SO a mao.
// Regrava tools/dataset/curated/pokeapi-game-availability.json; o build (npm run dataset) nunca chama este script.
import { rmSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { isPipelineError, PipelineError } from "../lib/errors";
import { writeJsonAtomic } from "../lib/fs-atomic";
import { log } from "../lib/log";
import { createPokeapiClient, type PokeapiClient } from "../pokeapi/client";
import { deriveGames, GAME_SNAPSHOT_FILE, type GameSnapshot } from "./availability";
import { collectGameSnapshot } from "./snapshot";

/** Cache proprio do recorte (tools/dataset/.cache/ ja e ignorado pelo git). */
export const GAME_SNAPSHOT_CACHE_DIR = path.resolve(import.meta.dirname, "../../.cache/pokeapi-games");

const USAGE = "uso: npm run dataset:snapshot-games -- [--fresh] [--out <arquivo>]";

export interface SnapshotArgs {
  /** apaga o cache do recorte antes (recaptura tudo da rede) */
  fresh: boolean;
  /** arquivo de saida (padrao: o recorte curado versionado) */
  out: string;
}

export function parseSnapshotArgs(argv: readonly string[]): SnapshotArgs {
  const args: SnapshotArgs = { fresh: false, out: GAME_SNAPSHOT_FILE };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    if (arg === "--fresh") {
      args.fresh = true;
    } else if (arg === "--out") {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith("--")) throw new PipelineError("E_CLI_ARGS", "--out exige um valor", USAGE);
      args.out = path.resolve(value);
      i++;
    } else {
      throw new PipelineError("E_CLI_ARGS", `argumento desconhecido: ${arg}`, USAGE);
    }
  }
  return args;
}

/**
 * Captura e grava o recorte. Sem `client`, cria o cliente PokeAPI existente (cache GAME_SNAPSHOT_CACHE_DIR, backoff,
 * concorrencia 6) e conta as requisicoes de rede reais (0 = tudo veio do cache). Com `client` (teste), usa o dado
 * e nao mexe no cache.
 */
export async function runSnapshotCli(argv: readonly string[], client?: PokeapiClient): Promise<GameSnapshot> {
  const args = parseSnapshotArgs(argv);
  let requests = 0;
  let api = client;
  if (!api) {
    if (args.fresh) rmSync(GAME_SNAPSHOT_CACHE_DIR, { recursive: true, force: true });
    api = createPokeapiClient({
      cacheDir: GAME_SNAPSHOT_CACHE_DIR,
      offline: false,
      fetchImpl: (input, init) => {
        requests++;
        return fetch(input, init);
      },
    });
  }
  const snapshot = await collectGameSnapshot(api, new Date());
  writeJsonAtomic(args.out, snapshot, { pretty: true });
  const games = deriveGames(snapshot);
  log.info(
    `recorte de jogos: ${snapshot.versionGroups.length} version-groups, ${snapshot.pokedexes.length} Pokedexes, ` +
      `${snapshot.pokemonSpeciesIds.length} especies, ${snapshot.source.urls.length} URLs, ${requests} requisicoes de rede`,
  );
  log.info(`jogos derivados (${games.length}):`);
  for (const g of games) log.info(`  ${g.order} ${g.id} ${g.slug} ${g.name}`);
  log.info(`gravado: ${path.relative(process.cwd(), args.out) || args.out}`);
  return snapshot;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSnapshotCli(process.argv.slice(2)).catch((error: unknown) => {
    if (isPipelineError(error)) log.error(error.message);
    else log.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exitCode = 1;
  });
}
