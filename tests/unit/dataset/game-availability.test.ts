// pokemon-generation T1.1: regra dos jogos principais, recorte curado da PokeAPI, coletor (msw) e CLI do recorte.
// Toda lista esperada e DERIVADA do recorte curado dentro do teste (LESSONS 2026-09-29); as unicas constantes sao as
// exclusoes nominais do requisito e os nomes exemplo do PRD.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  buildGameAvailability,
  deriveGames,
  EXCLUDED_POKEDEXES,
  EXCLUDED_VERSION_GROUPS,
  GAME_SNAPSHOT_FILE,
  gameSnapshotSchema,
  gameSnapshotSource,
  gamesForSpecies,
  loadGameSnapshot,
  type GameSnapshot,
} from "../../../tools/dataset/src/games/availability";
import { collectGameSnapshot } from "../../../tools/dataset/src/games/snapshot";
import { GAME_SNAPSHOT_CACHE_DIR, parseSnapshotArgs, runSnapshotCli } from "../../../tools/dataset/src/games/snapshot-cli";
import { isPipelineError } from "../../../tools/dataset/src/lib/errors";
import { createPokeapiClient } from "../../../tools/dataset/src/pokeapi/client";

process.env.DATASET_QUIET = "1";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const TMP = path.join(REPO_ROOT, "tools/dataset/out/_pg_test");
const FAKE = "https://fake-pokeapi.test";

const server = setupServer();
beforeAll(() => {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  server.listen({ onUnhandledRequest: "error" });
});
afterEach(() => server.resetHandlers());
afterAll(() => {
  server.close();
  rmSync(TMP, { recursive: true, force: true });
});

function codeOf(fn: () => unknown): string | null {
  try {
    fn();
  } catch (error) {
    return isPipelineError(error) ? error.code : `not a PipelineError: ${String(error)}`;
  }
  return null;
}

async function codeOfAsync(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
  } catch (error) {
    return isPipelineError(error) ? error.code : `not a PipelineError: ${String(error)}`;
  }
  return null;
}

const real: GameSnapshot = loadGameSnapshot();
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

/** Regra da IDEA secao 2 reimplementada aqui, independente de availability.ts (CA-23). */
function expectedGames(s: GameSnapshot) {
  const excludedGroups = new Set(["red-green-japan", "blue-japan", "champions"]);
  const excludedDex = new Set(["national", "conquest-gallery"]);
  const eligible = new Set(s.pokedexes.filter((p) => p.isMainSeries && !excludedDex.has(p.name)).map((p) => p.name));
  const candidates = s.versionGroups
    .filter((g) => !excludedGroups.has(g.name))
    .map((g) => ({ g, d: g.pokedexes.filter((n) => eligible.has(n)) }))
    .filter((c) => c.d.length > 0);
  return candidates
    .filter((c) => !candidates.some((o) => o !== c && o.d.length > c.d.length && c.d.every((x) => o.d.includes(x))))
    .sort((a, b) => a.g.order - b.g.order || a.g.id - b.g.id)
    .map((c) => ({ id: c.g.id, slug: c.g.name, name: c.g.versions.map((v) => v.nameEn).join(" / "), order: c.g.order, pokedexes: c.d }));
}

describe("loadGameSnapshot (pokemon-generation)", () => {
  it("missing file -> E_GAME_SNAPSHOT_MISSING; broken JSON and unknown field -> E_GAME_SNAPSHOT_INVALID; the curated file passes", () => {
    expect(codeOf(() => loadGameSnapshot(path.join(TMP, "nope.json")))).toBe("E_GAME_SNAPSHOT_MISSING");
    const broken = path.join(TMP, "broken.json");
    writeFileSync(broken, "{ not json");
    expect(codeOf(() => loadGameSnapshot(broken))).toBe("E_GAME_SNAPSHOT_INVALID");
    const extra = path.join(TMP, "extra.json");
    writeFileSync(extra, JSON.stringify({ ...real, extra: 1 }));
    expect(codeOf(() => loadGameSnapshot(extra))).toBe("E_GAME_SNAPSHOT_INVALID");
    const extraNested = path.join(TMP, "extra-nested.json");
    writeFileSync(extraNested, JSON.stringify({ ...real, versionGroups: [{ ...real.versionGroups[0], extra: 1 }, ...real.versionGroups.slice(1)] }));
    expect(codeOf(() => loadGameSnapshot(extraNested))).toBe("E_GAME_SNAPSHOT_INVALID");
    expect(gameSnapshotSchema.safeParse(real).success).toBe(true);
    expect(GAME_SNAPSHOT_FILE.split(path.sep).join("/")).toMatch(/tools\/dataset\/curated\/pokeapi-game-availability\.json$/);
  });
});

describe("deriveGames on the curated snapshot (pokemon-generation)", () => {
  const games = deriveGames(real);
  const slugs = games.map((g) => g.slug);

  it("matches the rule re-implemented in the test (CA-23) and the nominal exclusions", () => {
    expect(games).toEqual(expectedGames(real));
    expect([...EXCLUDED_VERSION_GROUPS]).toEqual(["red-green-japan", "blue-japan", "champions"]);
    expect([...EXCLUDED_POKEDEXES]).toEqual(["national", "conquest-gallery"]);
  });

  it("drops Japan-only editions, spin-offs and DLC; keeps games with equal Pokedex sets apart (CA-24)", () => {
    for (const out of ["red-green-japan", "blue-japan", "champions", "colosseum", "xd", "the-isle-of-armor", "the-crown-tundra", "the-teal-mask", "the-indigo-disk", "mega-dimension"]) {
      expect(slugs, out).not.toContain(out);
    }
    for (const one of ["sword-shield", "scarlet-violet", "legends-za"]) expect(slugs.filter((s) => s === one)).toHaveLength(1);
    expect(slugs).toContain("diamond-pearl");
    expect(slugs).toContain("brilliant-diamond-shining-pearl");
    expect(slugs).toContain("legends-arceus");
    expect(slugs).toContain("red-blue");
    expect(slugs).toContain("yellow");
    expect(games.find((g) => g.slug === "firered-leafgreen")?.name).toBe("FireRed / LeafGreen");
    expect(games.find((g) => g.slug === "red-blue")?.pokedexes).toEqual(games.find((g) => g.slug === "yellow")?.pokedexes);
  });

  it("base games carry their DLC Pokedexes (CA-26) and the order is strictly increasing", () => {
    const groupDex = (name: string) => real.versionGroups.find((g) => g.name === name)?.pokedexes ?? [];
    const merged: Record<string, string[]> = {
      "sword-shield": ["the-isle-of-armor", "the-crown-tundra"],
      "scarlet-violet": ["the-teal-mask", "the-indigo-disk"],
      "legends-za": ["mega-dimension"],
    };
    for (const [base, dlcs] of Object.entries(merged)) {
      const game = games.find((g) => g.slug === base);
      const union = [...new Set([...groupDex(base), ...dlcs.flatMap(groupDex)])].filter((n) => !["national", "conquest-gallery"].includes(n));
      expect(new Set(game?.pokedexes)).toEqual(new Set(union));
    }
    for (let i = 1; i < games.length; i++) expect(games[i]!.order).toBeGreaterThan(games[i - 1]!.order);
  });
});

/** Recorte sintetico minimo e coerente (espelho nos dois sentidos). */
function synthetic(): GameSnapshot {
  return {
    source: { api: "https://pokeapi.co/api/v2", capturedAt: "2026-10-12T00:00:00.000Z", script: "x", license: "x", urls: ["/x"] },
    pokemonSpeciesIds: [1, 2, 3, 4, 5],
    versionGroups: [
      { id: 9, name: "b-game", order: 2, pokedexes: ["shared"], versions: [{ name: "b", nameEn: "B" }] },
      { id: 4, name: "a-game", order: 2, pokedexes: ["shared"], versions: [{ name: "a", nameEn: "A" }] },
      { id: 6, name: "big", order: 1, pokedexes: ["main", "dlc"], versions: [{ name: "big", nameEn: "Big" }] },
      { id: 7, name: "big-dlc", order: 3, pokedexes: ["dlc"], versions: [{ name: "big-dlc", nameEn: "Big DLC" }] },
    ],
    pokedexes: [
      { id: 1, name: "national", isMainSeries: true, versionGroups: [], species: [1, 2, 3, 4, 5] },
      { id: 2, name: "shared", isMainSeries: true, versionGroups: ["b-game", "a-game"], species: [1, 2] },
      { id: 3, name: "main", isMainSeries: true, versionGroups: ["big"], species: [3] },
      { id: 4, name: "dlc", isMainSeries: true, versionGroups: ["big", "big-dlc"], species: [3, 4] },
    ],
  };
}

describe("deriveGames on synthetic snapshots (pokemon-generation)", () => {
  it("ties on order resolve by id, equal sets do not merge, a proper subset is DLC", () => {
    expect(deriveGames(synthetic()).map((g) => [g.slug, g.name])).toEqual([
      ["big", "Big"],
      ["a-game", "A"],
      ["b-game", "B"],
    ]);
  });

  it("dangling Pokedex, broken mirror, duplicate id and no eligible game -> E_GAME_SNAPSHOT_INVALID", () => {
    const dangling = synthetic();
    dangling.versionGroups[0]!.pokedexes = ["shared", "ghost"];
    expect(codeOf(() => deriveGames(dangling))).toBe("E_GAME_SNAPSHOT_INVALID");
    const mirror = synthetic();
    mirror.pokedexes[2]!.versionGroups = [];
    expect(codeOf(() => deriveGames(mirror))).toBe("E_GAME_SNAPSHOT_INVALID");
    const reverse = synthetic();
    reverse.pokedexes[1]!.versionGroups = ["b-game", "a-game", "big"];
    expect(codeOf(() => deriveGames(reverse))).toBe("E_GAME_SNAPSHOT_INVALID");
    const unknownGroup = synthetic();
    unknownGroup.pokedexes[1]!.versionGroups = ["b-game", "a-game", "nowhere"];
    expect(codeOf(() => deriveGames(unknownGroup))).toBe("E_GAME_SNAPSHOT_INVALID");
    const dup = synthetic();
    dup.versionGroups[1]!.id = 9;
    expect(codeOf(() => deriveGames(dup))).toBe("E_GAME_SNAPSHOT_INVALID");
    const none = synthetic();
    for (const p of none.pokedexes) p.isMainSeries = false;
    expect(codeOf(() => deriveGames(none))).toBe("E_GAME_SNAPSHOT_INVALID");
  });
});

describe("buildGameAvailability + gamesForSpecies (pokemon-generation)", () => {
  const games = deriveGames(real);
  const availability = buildGameAvailability(real, games);
  const ids = new Set(real.pokemonSpeciesIds);
  const frlg = games.find((g) => g.slug === "firered-leafgreen")!;
  const inGame = (dex: number, slug: string) => (gamesForSpecies(dex, "gen1", availability, ids) ?? []).includes(games.find((g) => g.slug === slug)!.id);

  it("FireRed / LeafGreen = exactly the species of the kanto Pokedex (CA-25 in the data)", () => {
    const kanto = real.pokedexes.find((p) => p.name === "kanto")!.species;
    expect(kanto).toEqual(range(1, 151));
    const withFrlg = [...availability.entries()].filter(([, list]) => list.includes(frlg.id)).map(([dex]) => dex).sort((a, b) => a - b);
    expect(withFrlg).toEqual(kanto);
  });

  it("Zubat and Golbat are in FRLG, Crobat is not; Hitmonlee is, Tyrogue is not (CA-27 in the data)", () => {
    expect(inGame(41, "firered-leafgreen")).toBe(true);
    expect(inGame(42, "firered-leafgreen")).toBe(true);
    expect(inGame(169, "firered-leafgreen")).toBe(false);
    expect(inGame(106, "firered-leafgreen")).toBe(true);
    expect(inGame(236, "firered-leafgreen")).toBe(false);
  });

  it("lists follow the catalog order without duplicates; every official species has at least one game", () => {
    const order = new Map(games.map((g, i) => [g.id, i]));
    for (const [dex, list] of availability) {
      expect(new Set(list).size, String(dex)).toBe(list.length);
      for (let i = 1; i < list.length; i++) expect(order.get(list[i]!)!).toBeGreaterThan(order.get(list[i - 1]!)!);
    }
    for (const dex of real.pokemonSpeciesIds) expect(availability.get(dex)?.length ?? 0, String(dex)).toBeGreaterThan(0);
  });

  it("custom outside the source -> null; custom inside -> E_GAMES_CUSTOM_IN_SOURCE; official outside -> E_GAMES_NO_SOURCE (CA-39); official without a game -> []", () => {
    expect(gamesForSpecies(9901, "custom", availability, ids)).toBeNull();
    expect(codeOf(() => gamesForSpecies(41, "custom", availability, ids))).toBe("E_GAMES_CUSTOM_IN_SOURCE");
    expect(codeOf(() => gamesForSpecies(1026, "gen9", availability, ids))).toBe("E_GAMES_NO_SOURCE");
    const s = synthetic();
    expect(gamesForSpecies(5, "gen1", buildGameAvailability(s, deriveGames(s)), new Set(s.pokemonSpeciesIds))).toEqual([]);
    const copy = gamesForSpecies(41, "gen1", availability, ids)!;
    copy.push(999);
    expect(availability.get(41)).not.toContain(999);
  });

  it("gameSnapshotSource is canonical: compact JSON size and capturedAt", () => {
    expect(gameSnapshotSource(real)).toEqual({
      file: "tools/dataset/curated/pokeapi-game-availability.json",
      sizeBytes: Buffer.byteLength(JSON.stringify(real)),
      mtime: real.source.capturedAt,
    });
  });
});

describe("build side uses no network and no cache (RF-43, CA-32)", () => {
  it("load + derive + availability never call fetch", () => {
    const spy = vi.fn(() => {
      throw new Error("network forbidden");
    });
    vi.stubGlobal("fetch", spy);
    try {
      const s = loadGameSnapshot();
      const availability = buildGameAvailability(s, deriveGames(s));
      expect(availability.size).toBe(s.pokemonSpeciesIds.length);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(spy).not.toHaveBeenCalled();
    const source = readFileSync(path.join(REPO_ROOT, "tools/dataset/src/games/availability.ts"), "utf8");
    expect(source).not.toContain(".cache");
    expect(source).not.toMatch(/from "\.\.\/pokeapi\//);
  });
});

// ---------------------------------------------------------------------------
// Coletor (msw) e CLI
// ---------------------------------------------------------------------------

interface FakeApi {
  groups: Record<string, { id: number; name: string; order: number; pokedexes: string[]; versions: string[] }>;
  pokedexes: Record<string, { id: number; name: string; is_main_series: boolean; version_groups: string[]; species: number[] }>;
  versions: Record<string, { lang: string; name: string }[]>;
  species: number[];
  groupCount?: number;
}

function fakeApi(): FakeApi {
  return {
    groups: {
      "gold-silver": { id: 3, name: "gold-silver", order: 2, pokedexes: ["johto"], versions: ["gold"] },
      "red-blue": { id: 5, name: "red-blue", order: 1, pokedexes: ["kanto"], versions: ["red", "blue"] },
    },
    pokedexes: {
      national: { id: 1, name: "national", is_main_series: true, version_groups: [], species: [5, 4, 3, 2, 1] },
      johto: { id: 3, name: "johto", is_main_series: true, version_groups: ["gold-silver"], species: [5, 4, 1, 1] },
      kanto: { id: 2, name: "kanto", is_main_series: true, version_groups: ["red-blue"], species: [3, 1, 2] },
    },
    versions: {
      red: [
        { lang: "ja", name: "赤" },
        { lang: "en", name: "Red" },
      ],
      blue: [{ lang: "en", name: "Blue" }],
      gold: [{ lang: "en", name: "Gold" }],
    },
    species: [1, 2, 3, 4, 5],
  };
}

const ref = (kind: string, name: string) => ({ name, url: `https://pokeapi.co/api/v2/${kind}/${name}/` });
const speciesRef = (id: number) => ({ name: `s${id}`, url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` });

function serve(api: FakeApi): { hits: () => number } {
  let hits = 0;
  const count = () => hits++;
  server.use(
    http.get(`${FAKE}/version-group`, () => {
      count();
      const results = Object.keys(api.groups).map((n) => ref("version-group", n));
      return HttpResponse.json({ count: api.groupCount ?? results.length, results });
    }),
    http.get(`${FAKE}/version-group/:name`, ({ params }) => {
      count();
      const g = api.groups[String(params.name)];
      if (!g) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({ id: g.id, name: g.name, order: g.order, pokedexes: g.pokedexes.map((p) => ref("pokedex", p)), versions: g.versions.map((v) => ref("version", v)) });
    }),
    http.get(`${FAKE}/pokedex`, () => {
      count();
      const results = Object.keys(api.pokedexes).map((n) => ref("pokedex", n));
      return HttpResponse.json({ count: results.length, results });
    }),
    http.get(`${FAKE}/pokedex/:name`, ({ params }) => {
      count();
      const p = api.pokedexes[String(params.name)];
      if (!p) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({
        id: p.id,
        name: p.name,
        is_main_series: p.is_main_series,
        version_groups: p.version_groups.map((v) => ref("version-group", v)),
        pokemon_entries: p.species.map((id, i) => ({ entry_number: i + 1, pokemon_species: speciesRef(id) })),
      });
    }),
    http.get(`${FAKE}/version/:name`, ({ params }) => {
      count();
      const v = api.versions[String(params.name)];
      if (!v) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({ name: params.name, names: v.map((n) => ({ name: n.name, language: { name: n.lang, url: "" } })) });
    }),
    http.get(`${FAKE}/pokemon-species`, () => {
      count();
      return HttpResponse.json({ count: api.species.length, results: api.species.map(speciesRef) });
    }),
  );
  return { hits: () => hits };
}

let cacheSeq = 0;
const fakeClient = () => createPokeapiClient({ cacheDir: path.join(TMP, `cache-${cacheSeq++}`), offline: false, baseUrl: FAKE, backoffMs: [1, 1, 1] });

describe("collectGameSnapshot with msw (pokemon-generation)", () => {
  const capturedAt = new Date("2026-10-12T01:02:03.000Z");

  it("builds the sorted raw snapshot with relative sorted urls; source.api is the real PokeAPI base", async () => {
    serve(fakeApi());
    const s = await collectGameSnapshot(fakeClient(), capturedAt);
    expect(s).toEqual({
      source: {
        api: "https://pokeapi.co/api/v2",
        capturedAt: "2026-10-12T01:02:03.000Z",
        script: "npm run dataset:snapshot-games",
        license: expect.stringContaining("PokeAPI"),
        urls: [
          "/pokedex/johto",
          "/pokedex/kanto",
          "/pokedex/national",
          "/pokedex?limit=100",
          "/pokemon-species?limit=10000",
          "/version-group/gold-silver",
          "/version-group/red-blue",
          "/version-group?limit=100",
          "/version/blue",
          "/version/gold",
          "/version/red",
        ],
      },
      pokemonSpeciesIds: [1, 2, 3, 4, 5],
      versionGroups: [
        { id: 3, name: "gold-silver", order: 2, pokedexes: ["johto"], versions: [{ name: "gold", nameEn: "Gold" }] },
        { id: 5, name: "red-blue", order: 1, pokedexes: ["kanto"], versions: [{ name: "red", nameEn: "Red" }, { name: "blue", nameEn: "Blue" }] },
      ],
      pokedexes: [
        { id: 1, name: "national", isMainSeries: true, versionGroups: [], species: [1, 2, 3, 4, 5] },
        { id: 2, name: "kanto", isMainSeries: true, versionGroups: ["red-blue"], species: [1, 2, 3] },
        { id: 3, name: "johto", isMainSeries: true, versionGroups: ["gold-silver"], species: [1, 4, 5] },
      ],
    });
    expect(deriveGames(s).map((g) => g.name)).toEqual(["Red / Blue", "Gold"]);
  });

  it("second run with the same cache makes 0 requests (RNF-13)", async () => {
    const counter = serve(fakeApi());
    const cacheDir = path.join(TMP, "cache-shared");
    const client = () => createPokeapiClient({ cacheDir, offline: false, baseUrl: FAKE, backoffMs: [1] });
    const first = await collectGameSnapshot(client(), capturedAt);
    const afterFirst = counter.hits();
    expect(afterFirst).toBe(11);
    const second = await collectGameSnapshot(client(), new Date("2026-10-13T00:00:00.000Z"));
    expect(counter.hits()).toBe(afterFirst);
    expect({ ...second, source: { ...second.source, capturedAt: "" } }).toEqual({ ...first, source: { ...first.source, capturedAt: "" } });
  });

  it("incomplete pagination, version without English name, broken mirror, 404 and bad species URL -> E_GAME_SNAPSHOT_INVALID", async () => {
    const paged = fakeApi();
    paged.groupCount = 99;
    serve(paged);
    expect(await codeOfAsync(() => collectGameSnapshot(fakeClient(), capturedAt))).toBe("E_GAME_SNAPSHOT_INVALID");

    server.resetHandlers();
    const noEn = fakeApi();
    noEn.versions.gold = [{ lang: "ja", name: "金" }];
    serve(noEn);
    expect(await codeOfAsync(() => collectGameSnapshot(fakeClient(), capturedAt))).toBe("E_GAME_SNAPSHOT_INVALID");

    server.resetHandlers();
    const mirror = fakeApi();
    mirror.pokedexes.kanto!.version_groups = [];
    serve(mirror);
    expect(await codeOfAsync(() => collectGameSnapshot(fakeClient(), capturedAt))).toBe("E_GAME_SNAPSHOT_INVALID");

    server.resetHandlers();
    const missing = fakeApi();
    delete missing.versions.blue;
    serve(missing);
    expect(await codeOfAsync(() => collectGameSnapshot(fakeClient(), capturedAt))).toBe("E_GAME_SNAPSHOT_INVALID");

    server.resetHandlers();
    serve(fakeApi());
    server.use(http.get(`${FAKE}/pokemon-species`, () => HttpResponse.json({ count: 1, results: [{ name: "x", url: "https://pokeapi.co/api/v2/pokemon/1/" }] })));
    expect(await codeOfAsync(() => collectGameSnapshot(fakeClient(), capturedAt))).toBe("E_GAME_SNAPSHOT_INVALID");
  });
});

describe("snapshot CLI (pokemon-generation)", () => {
  it("parseSnapshotArgs: defaults, --fresh, --out, unknown flag and --out without value -> E_CLI_ARGS", () => {
    expect(parseSnapshotArgs([])).toEqual({ fresh: false, out: GAME_SNAPSHOT_FILE });
    expect(parseSnapshotArgs(["--fresh", "--out", "x.json"])).toEqual({ fresh: true, out: path.resolve("x.json") });
    expect(codeOf(() => parseSnapshotArgs(["--nope"]))).toBe("E_CLI_ARGS");
    expect(codeOf(() => parseSnapshotArgs(["--out"]))).toBe("E_CLI_ARGS");
    expect(codeOf(() => parseSnapshotArgs(["--out", "--fresh"]))).toBe("E_CLI_ARGS");
    expect(GAME_SNAPSHOT_CACHE_DIR.split(path.sep).join("/")).toMatch(/tools\/dataset\/\.cache\/pokeapi-games$/);
  });

  it("runSnapshotCli with an injected client writes the pretty JSON to --out and leaves the curated file alone", async () => {
    serve(fakeApi());
    const curatedBefore = readFileSync(GAME_SNAPSHOT_FILE);
    const out = path.join(TMP, "cli-out.json");
    const s = await runSnapshotCli(["--out", out], fakeClient());
    expect(existsSync(out)).toBe(true);
    expect(readFileSync(out, "utf8")).toBe(`${JSON.stringify(s, null, 2)}\n`);
    expect(loadGameSnapshot(out)).toEqual(s);
    expect(readFileSync(GAME_SNAPSHOT_FILE).equals(curatedBefore)).toBe(true);
  });
});

describe("separation, origin and secrets (CA-30, CA-63, CA-65, RF-42)", () => {
  const src = path.join(REPO_ROOT, "tools/dataset/src");
  const tsIn = (dir: string) => readdirSync(path.join(src, dir)).filter((f) => f.endsWith(".ts")).map((f) => path.join(src, dir, f));

  it("no pipeline module imports the collector or the CLI; the CLI uses the existing client; npm scripts", () => {
    for (const file of [path.join(src, "index.ts"), ...tsIn("species"), ...tsIn("pokeapi")]) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/games\/snapshot/);
    }
    expect(readFileSync(path.join(src, "games/snapshot-cli.ts"), "utf8")).toMatch(/createPokeapiClient/);
    const pkg = JSON.parse(readFileSync(path.join(REPO_ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
    expect(pkg.scripts["dataset:snapshot-games"]).toBe("tsx tools/dataset/src/games/snapshot-cli.ts");
    expect(pkg.scripts.dataset).toBe("tsx tools/dataset/src/index.ts");
  });

  it("the curated snapshot records its origin and nothing looks like a secret", () => {
    expect(real.source.api).toBe("https://pokeapi.co/api/v2");
    expect(new Date(real.source.capturedAt).toISOString()).toBe(real.source.capturedAt);
    expect(real.source.urls.length).toBeGreaterThan(0);
    expect(real.source.urls).toEqual([...new Set(real.source.urls)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
    const secret = /(api[_-]?key|token|secret|password)/i;
    expect(readFileSync(GAME_SNAPSHOT_FILE, "utf8")).not.toMatch(secret);
    for (const file of tsIn("games")) expect(readFileSync(file, "utf8"), file).not.toMatch(secret);
  });
});
