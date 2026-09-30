// @vitest-environment node
// berry-mutations T1.1: origem (spawnConditions) e cruzamentos (mutations) das bagas no pipeline.
// Toda contagem esperada e DERIVADA dos 70 arquivos crus do snapshot dentro do teste (LESSONS), nunca copiada da SPEC.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import { buildBerryOrigins, collectBerryOrigins, collectBerryPlantable } from "../../../tools/dataset/src/items/berries";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const snapshot = path.join(repoRoot, "data-source/atm-1.3.0");
const berriesDir = path.join(snapshot, "mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/berries");
const { reader } = openSource(snapshot, () => {});

function warnSink() {
  const codes: string[] = [];
  return { codes, report: { warn: (code: string) => codes.push(code), section: () => {}, warnings: [], sections: {} } };
}

interface RawBerry {
  preferredBiomeTags?: string[];
  favoriteMulches?: string[];
  spawnConditions?: unknown[];
  mutations?: Record<string, string>;
}

function rawBerries(): Map<string, RawBerry> {
  const out = new Map<string, RawBerry>();
  for (const f of readdirSync(berriesDir).filter((x) => x.endsWith(".json"))) {
    out.set(`cobblemon:${f.replace(/\.json$/, "")}`, JSON.parse(readFileSync(path.join(berriesDir, f), "utf8")) as RawBerry);
  }
  return out;
}

const files = (o: Record<string, Record<string, unknown>>) => new Map(Object.entries(o));

describe("berries.ts: buildBerryOrigins with synthetic fixtures", () => {
  it("a symmetric pair A/B -> C is stored once in C and gives one use to A and one to B", () => {
    const { codes, report } = warnSink();
    const out = buildBerryOrigins(
      files({
        "t:a": { mutations: { "t:b": "t:c" } },
        "t:b": { mutations: { "t:a": "t:c" } },
        "t:c": {},
      }),
      report as never,
    );
    expect(out.get("t:c")).toEqual({ spawn: [], mutationPairs: [{ a: "t:a", b: "t:b" }], mutationUses: [] });
    expect(out.get("t:a")?.mutationUses).toEqual([{ partner: "t:b", result: "t:c" }]);
    expect(out.get("t:b")?.mutationUses).toEqual([{ partner: "t:a", result: "t:c" }]);
    expect(codes).toEqual([]);
  });

  it("an asymmetric pair still enters and warns W_BERRY_MUTATION_ASYMMETRIC", () => {
    const { codes, report } = warnSink();
    const out = buildBerryOrigins(files({ "t:b": { mutations: { "t:a": "t:c" } }, "t:a": {}, "t:c": {} }), report as never);
    expect(out.get("t:c")?.mutationPairs).toEqual([{ a: "t:a", b: "t:b" }]);
    expect(out.get("t:a")?.mutationUses).toEqual([{ partner: "t:b", result: "t:c" }]);
    expect(out.get("t:b")?.mutationUses).toEqual([{ partner: "t:a", result: "t:c" }]);
    expect(codes).toEqual(["W_BERRY_MUTATION_ASYMMETRIC"]);
  });

  it("a result outside the files warns W_BERRY_MUTATION_UNKNOWN_ID and is not stored", () => {
    const { codes, report } = warnSink();
    const out = buildBerryOrigins(files({ "t:a": { mutations: { "t:b": "t:zz" } }, "t:b": { mutations: { "t:a": "t:zz" } } }), report as never);
    expect(out.has("t:zz")).toBe(false);
    expect(out.get("t:a")).toEqual({ spawn: [], mutationPairs: [], mutationUses: [] });
    expect(out.get("t:b")).toEqual({ spawn: [], mutationPairs: [], mutationUses: [] });
    expect(codes).toEqual(["W_BERRY_MUTATION_UNKNOWN_ID", "W_BERRY_MUTATION_UNKNOWN_ID"]);
  });

  it("a partner outside the files warns but the pair is stored when the result has a file", () => {
    const { codes, report } = warnSink();
    const out = buildBerryOrigins(files({ "t:a": { mutations: { "t:ghost": "t:c" } }, "t:c": {} }), report as never);
    expect(out.get("t:c")?.mutationPairs).toEqual([{ a: "t:a", b: "t:ghost" }]);
    expect(out.get("t:a")?.mutationUses).toEqual([{ partner: "t:ghost", result: "t:c" }]);
    expect(out.has("t:ghost")).toBe(false);
    expect(codes).toEqual(["W_BERRY_MUTATION_ASYMMETRIC", "W_BERRY_MUTATION_UNKNOWN_ID"]);
  });

  it("resolves the 3 spawn variants with or without namespace and skips unknown or incomplete ones", () => {
    const { codes, report } = warnSink();
    const out = buildBerryOrigins(
      files({
        "t:p": { preferredBiomeTags: ["t:is_x", "t:is_y"], spawnConditions: [{ variant: "cobblemon:preferred_biome", minGroveSize: 1, maxGroveSize: 3 }] },
        "t:q": { preferredBiomeTags: ["t:is_x"], spawnConditions: [{ variant: "all_biome" }] },
        "t:r": { spawnConditions: [{ variant: "cobblemon:specific_biome", biome: "t:is_island" }] },
        "t:s": { spawnConditions: [{ variant: "cobblemon:specific_biome" }, { variant: "cobblemon:moon_biome" }, { variant: "toString" }, "x"] },
      }),
      report as never,
    );
    expect(out.get("t:p")?.spawn).toEqual([{ variant: "preferredBiome", biomeTags: ["t:is_x", "t:is_y"] }]);
    expect(out.get("t:q")?.spawn).toEqual([{ variant: "allBiome", biomeTags: [] }]);
    expect(out.get("t:r")?.spawn).toEqual([{ variant: "specificBiome", biomeTags: ["t:is_island"] }]);
    expect(out.get("t:s")?.spawn).toEqual([]);
    expect(codes).toEqual(["W_BERRY_SPAWN_BIOME_MISSING", "W_BERRY_SPAWN_UNKNOWN", "W_BERRY_SPAWN_UNKNOWN", "W_BERRY_SPAWN_UNKNOWN"]);
  });

  it("sorts pairs and uses by code unit (digits and uppercase before lowercase), not by locale", () => {
    const { report } = warnSink();
    const out = buildBerryOrigins(
      files({
        "t:b": { mutations: { "t:A": "t:r", "t:9": "t:r" } },
        "t:A": { mutations: { "t:b": "t:r", "t:9": "t:s" } },
        "t:9": { mutations: { "t:b": "t:r", "t:A": "t:s" } },
        "t:r": {},
        "t:s": {},
      }),
      report as never,
    );
    expect([...out.keys()]).toEqual(["t:9", "t:A", "t:b", "t:r", "t:s"]);
    expect(out.get("t:r")?.mutationPairs).toEqual([{ a: "t:9", b: "t:b" }, { a: "t:A", b: "t:b" }]);
    expect(out.get("t:s")?.mutationPairs).toEqual([{ a: "t:9", b: "t:A" }]);
    expect(out.get("t:b")?.mutationUses).toEqual([{ partner: "t:9", result: "t:r" }, { partner: "t:A", result: "t:r" }]);
    expect(out.get("t:9")?.mutationUses).toEqual([{ partner: "t:A", result: "t:s" }, { partner: "t:b", result: "t:r" }]);
  });

  it("mutations that is not an object (or has non-string values) gives no pairs", () => {
    const { codes, report } = warnSink();
    const out = buildBerryOrigins(
      files({ "t:a": { mutations: ["t:b"] }, "t:b": { mutations: { "t:a": 3 } }, "t:c": { mutations: null, spawnConditions: "x" } }),
      report as never,
    );
    for (const b of out.values()) expect(b).toEqual({ spawn: [], mutationPairs: [], mutationUses: [] });
    expect(codes).toEqual([]);
  });
});

describe("berries.ts: collectBerryOrigins on the snapshot (derived from the 70 raw files)", () => {
  const raw = rawBerries();
  const { codes, report } = warnSink();
  const out = collectBerryOrigins({ reader, report: report as never });

  it("one entry per berry file and 0 W_BERRY_* warnings", () => {
    expect(raw.size).toBeGreaterThan(0);
    expect([...out.keys()].sort()).toEqual([...raw.keys()].sort());
    expect(codes.filter((c) => c.startsWith("W_BERRY_"))).toEqual([]);
  });

  it("results, spawns, unordered pairs and uses equal the recalculation from the raw files", () => {
    const results = new Set<string>();
    const pairs = new Set<string>();
    for (const [x, j] of raw) {
      for (const [y, r] of Object.entries(j.mutations ?? {})) {
        results.add(r);
        pairs.add(`${r}|${[x, y].sort().join("|")}`);
      }
    }
    const uses = new Set<string>();
    for (const p of pairs) {
      const [r, a, b] = p.split("|") as [string, string, string];
      uses.add(`${a}|${b}|${r}`);
      uses.add(`${b}|${a}|${r}`);
    }
    const withSpawn = [...raw].filter(([, j]) => (j.spawnConditions ?? []).length > 0).map(([id]) => id).sort();
    const got = [...out];
    expect(got.filter(([, b]) => b.mutationPairs.length > 0).map(([id]) => id).sort()).toEqual([...results].sort());
    expect(got.filter(([, b]) => b.spawn.length > 0).map(([id]) => id).sort()).toEqual(withSpawn);
    expect(got.flatMap(([r, b]) => b.mutationPairs.map((p) => `${r}|${p.a}|${p.b}`)).sort()).toEqual([...pairs].sort());
    expect(got.flatMap(([o, b]) => b.mutationUses.map((u) => `${o}|${u.partner}|${u.result}`)).sort()).toEqual([...uses].sort());
    const useOwners = new Set([...uses].map((u) => u.split("|")[0]));
    expect(got.filter(([, b]) => b.mutationUses.length > 0).length).toBe(useOwners.size);
  });

  it("the 3 spawn variants are present and preferredBiome copies the raw preferredBiomeTags", () => {
    for (const [id, b] of out) {
      const j = raw.get(id)!;
      expect(b.spawn).toHaveLength((j.spawnConditions ?? []).length);
      for (const s of b.spawn) if (s.variant === "preferredBiome") expect(s.biomeTags).toEqual(j.preferredBiomeTags);
    }
    const variants = new Set([...out.values()].flatMap((b) => b.spawn.map((s) => s.variant)));
    expect([...variants].sort()).toEqual(["allBiome", "preferredBiome", "specificBiome"]);
  });

  it("Cheri, Lum and Liechi equal the SPEC 5.3 examples", () => {
    expect(out.get("cobblemon:cheri_berry")).toEqual({
      spawn: [{ variant: "preferredBiome", biomeTags: ["cobblemon:is_plains"] }],
      mutationPairs: [],
      mutationUses: [
        { partner: "cobblemon:oran_berry", result: "cobblemon:lum_berry" },
        { partner: "cobblemon:persim_berry", result: "cobblemon:figy_berry" },
      ],
    });
    expect(out.get("cobblemon:lum_berry")).toEqual({
      spawn: [],
      mutationPairs: [
        { a: "cobblemon:aspear_berry", b: "cobblemon:oran_berry" },
        { a: "cobblemon:cheri_berry", b: "cobblemon:oran_berry" },
        { a: "cobblemon:chesto_berry", b: "cobblemon:oran_berry" },
        { a: "cobblemon:oran_berry", b: "cobblemon:pecha_berry" },
        { a: "cobblemon:oran_berry", b: "cobblemon:rawst_berry" },
      ],
      mutationUses: [
        { partner: "cobblemon:aguav_berry", result: "cobblemon:sitrus_berry" },
        { partner: "cobblemon:figy_berry", result: "cobblemon:sitrus_berry" },
        { partner: "cobblemon:iapapa_berry", result: "cobblemon:sitrus_berry" },
        { partner: "cobblemon:leppa_berry", result: "cobblemon:hopo_berry" },
        { partner: "cobblemon:mago_berry", result: "cobblemon:sitrus_berry" },
        { partner: "cobblemon:wiki_berry", result: "cobblemon:sitrus_berry" },
      ],
    });
    expect(out.get("cobblemon:liechi_berry")).toEqual({
      spawn: [{ variant: "specificBiome", biomeTags: ["cobblemon:is_mirage_island"] }],
      mutationPairs: [{ a: "cobblemon:kelpsy_berry", b: "cobblemon:pamtre_berry" }],
      mutationUses: [],
    });
  });

  it("collectBerryPlantable still returns the raw preferredBiomeTags and favoriteMulches (Occa)", () => {
    const plantable = collectBerryPlantable({ reader });
    const occa = raw.get("cobblemon:occa_berry")!;
    expect(plantable.size).toBe(raw.size);
    expect(plantable.get("cobblemon:occa_berry")).toEqual({ biomeTags: occa.preferredBiomeTags, mulches: occa.favoriteMulches });
    expect(plantable.get("cobblemon:occa_berry")).toEqual({
      biomeTags: ["cobblemon:is_jungle", "cobblemon:is_sandy", "cobblemon:is_thermal", "cobblemon:is_volcanic"],
      mulches: ["humid", "sandy"],
    });
  });
});
