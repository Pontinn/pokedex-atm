// B2.2: lang PT/EN e merge de especies por precedencia (fixtures reais recortadas + snapshot completo).
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { openSource } from "../../../tools/dataset/src/instance";
import { buildLangTable, loadLang, type LangLayer } from "../../../tools/dataset/src/lang";
import { collectSpecies, type CollectedSpecies } from "../../../tools/dataset/src/species/collect";
import { mergeSpecies, parseMoves, speciesSearchKey } from "../../../tools/dataset/src/species/merge";
import type { MergedSpecies } from "../../../tools/dataset/src/context";

process.env.DATASET_QUIET = "1";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const fx = path.join(repoRoot, "tests/fixtures/species-merge");
const json = (rel: string) => JSON.parse(readFileSync(path.join(fx, rel), "utf8")) as Record<string, unknown>;

function fixtureInput(): CollectedSpecies {
  const sp = (source: string, file: string, gen: string) => ({
    source,
    path: `data/cobblemon/species/${gen}/${file}`,
    slug: file.replace(/\.json$/, ""),
    data: json(`${source}/${file}`),
  });
  return {
    species: [
      sp("cobblemon", "bulbasaur.json", "generation1"),
      sp("cobblemon", "charizard.json", "generation1"),
      sp("cobblemon", "mareep.json", "generation2"),
      sp("cobblemon", "quagsire.json", "generation2"),
      sp("mega_showdown", "charizard.json", "generation1"),
    ],
    additions: [
      {
        source: "allthemons",
        path: "data/cobblemon/species_additions/mareep.json",
        target: "mareep",
        data: json("allthemons-additions/mareep.json"),
      },
    ],
  };
}

function fixtureLang() {
  const layers: LangLayer[] = [
    { origin: "fixture:pt_br", lang: "pt_br", entries: json("lang-pt_br.json") as Record<string, string> },
    { origin: "fixture:en_us", lang: "en_us", entries: json("lang-en_us.json") as Record<string, string> },
  ];
  return buildLangTable(layers).table;
}

const bySlug = (map: Map<number, MergedSpecies>, slug: string) => {
  const found = [...map.values()].find((s) => s.slug === slug);
  if (!found) throw new Error(`especie ${slug} ausente`);
  return found;
};

describe("species merge with fixtures", () => {
  const { species, report } = mergeSpecies(fixtureInput(), fixtureLang());

  it("keeps Cobblemon baseStats on a full addon override and unions forms (Mega-X/Mega-Y/Gmax)", () => {
    const charizard = bySlug(species, "charizard");
    const baseFile = json("cobblemon/charizard.json");
    const baseStats = baseFile.baseStats as Record<string, number>;
    expect(charizard.baseStats).toEqual({
      hp: baseStats.hp,
      attack: baseStats.attack,
      defence: baseStats.defence,
      specialAttack: baseStats.special_attack,
      specialDefence: baseStats.special_defence,
      speed: baseStats.speed,
    });
    expect(charizard.baseStats.specialAttack).toBe(109);
    expect(charizard.forms.map((f) => f.name)).toEqual(expect.arrayContaining(["Mega-X", "Mega-Y", "Gmax"]));
    expect(charizard.forms.find((f) => f.name === "Mega-X")?.types).toEqual(["fire", "dragon"]);
    expect(charizard.weight).toBe(905);
    expect(charizard.height).toBe(17);
    const override = report.overrides.find((o) => o.slug === "charizard");
    expect(override?.source).toBe("mega_showdown");
    expect(species.size).toBe(4);
  });

  it("reads PT/EN names from lang (Quagsire = Pantano) and builds the search key", () => {
    const quagsire = bySlug(species, "quagsire");
    expect(quagsire.name.pt).toBe("Pântano");
    expect(quagsire.name.en).toBe("Quagsire");
    expect(speciesSearchKey(quagsire)).toBe("pantano|quagsire");
  });

  it("species_addition replaces drops (Mareep, dex 179): flattened entries, amount discarded", () => {
    const mareep = bySlug(species, "mareep");
    expect(mareep.dex).toBe(179);
    expect(mareep.drops).toHaveLength(4);
    expect(mareep.drops).toContainEqual({ item: "silentgear:sinew", percentage: 25, quantityRange: null });
    expect(mareep.drops.every((d) => !("amount" in d))).toBe(true);
    expect(mareep.origins.drops).toEqual(["allthemons"]);
    expect(report.additions.find((a) => a.target === "mareep")?.fields).toEqual(["drops"]);
  });

  it("parses abilities (h: = hidden), moves by prefix and generation", () => {
    const bulbasaur = bySlug(species, "bulbasaur");
    expect(bulbasaur.abilities).toEqual([
      { id: "overgrow", hidden: false },
      { id: "chlorophyll", hidden: true },
    ]);
    expect(bulbasaur.moves.level[0]).toEqual({ level: 1, move: "tackle" });
    expect(bulbasaur.moves.tm).toContain("bodyslam");
    expect(bulbasaur.moves.egg).toContain("curse");
    expect(bulbasaur.generation).toBe("gen1");
    expect(bulbasaur.types).toEqual(["grass", "poison"]);
    const r = { ignoredMovePrefixes: {}, unknownMovePrefixes: {} } as Parameters<typeof parseMoves>[1] & object;
    const moves = parseMoves(["5:ember", "legacy:x", "special:y", "form_change:z", "weird:w", "tm:a", "tm:a"], r);
    expect(moves).toEqual({ level: [{ level: 5, move: "ember" }], tm: ["a"], egg: [], tutor: [] });
    expect(r.ignoredMovePrefixes).toEqual({ legacy: 1, special: 1, form_change: 1 });
    expect(r.unknownMovePrefixes).toEqual({ weird: 1 });
  });

  it("lang: first layer (Cobblemon) wins and the conflict is reported; fallback en <-> pt", () => {
    const { table, conflicts } = buildLangTable([
      { origin: "cobblemon", lang: "pt_br", entries: { a: "A pt" } },
      { origin: "addon", lang: "pt_br", entries: { a: "outro", b: "B pt" } },
      { origin: "addon", lang: "en_us", entries: { c: "C en" } },
    ]);
    expect(table.text("a")).toEqual({ pt: "A pt", en: "A pt" });
    expect(table.text("c")).toEqual({ pt: "C en", en: "C en" });
    expect(table.text("zzz")).toBeNull();
    expect(conflicts).toHaveLength(1);
  });
});

describe("species merge on the real snapshot (data-source/atm-1.3.0)", () => {
  let species: Map<number, MergedSpecies>;

  beforeAll(() => {
    const { reader } = openSource(path.join(repoRoot, "data-source/atm-1.3.0"), () => {});
    const lang = loadLang(reader);
    species = mergeSpecies(collectSpecies(reader), lang.table).species;
  }, 60_000);

  it("counts 1027 species (1025 + Piglich 9901 + Creepyon 9902)", () => {
    expect(species.size).toBe(1027);
    expect(species.get(9901)?.name.pt).toBe("Piglichu");
    expect(species.get(9902)?.slug).toBe("creepyon");
    expect(species.get(9901)?.generation).toBe("custom");
  });

  it("Quagsire pt name and Mareep drops from the allthemons addition", () => {
    expect(bySlug(species, "quagsire").name.pt).toBe("Pântano");
    const mareep = species.get(179);
    expect(mareep?.drops).toHaveLength(4);
    expect(mareep?.drops).toContainEqual({ item: "silentgear:sinew", percentage: 25, quantityRange: null });
  });

  it("species_additions from other namespaces apply (legendarymonuments data/cobblemon_drops: Dragonite shards 10%; audit A1)", () => {
    const dragonite = species.get(149);
    expect(dragonite?.drops).toHaveLength(6);
    expect(dragonite?.drops).toContainEqual({ item: "legendarymonuments:darkstone_shard", percentage: 10, quantityRange: null });
    expect(dragonite?.drops).toContainEqual({ item: "legendarymonuments:lightstone_shard", percentage: 10, quantityRange: null });
    expect(dragonite?.origins.drops).toContain("legendarymonuments");
    // data/legendarymonuments/species_additions/meltan.json (evolucao por meltan_candy_count)
    expect(bySlug(species, "meltan").origins.evolutions).toContain("legendarymonuments");
  });

  it("same ability listed as normal and hidden keeps both roles (Gastly levitate; audit A1)", () => {
    expect(species.get(92)?.abilities).toEqual([
      { id: "levitate", hidden: false },
      { id: "levitate", hidden: true },
    ]);
  });

  it("fields outside the base-wins list follow the addon override (zygarde/lycanroc implemented via ccc)", () => {
    const zygarde = bySlug(species, "zygarde");
    const lycanroc = bySlug(species, "lycanroc");
    expect(zygarde.implemented).toBe(true);
    expect(lycanroc.implemented).toBe(true);
    expect(zygarde.origins.implemented).toContain("ccc");
    expect([...species.values()].filter((s) => !s.implemented).map((s) => s.slug)).toEqual([]);
  });

  it("base-wins fields keep the Cobblemon value (ccc dialga has moves: [], base moves win)", () => {
    const dialga = bySlug(species, "dialga");
    expect(dialga.moves.level.length).toBeGreaterThan(0);
    expect(dialga.moves.tm.length).toBeGreaterThan(0);
  });

  it("Charizard keeps Cobblemon stats with Mega-X/Mega-Y/Gmax forms", () => {
    const charizard = species.get(6);
    expect(charizard?.baseStats.specialAttack).toBe(109);
    expect(charizard?.forms.map((f) => f.name)).toEqual(expect.arrayContaining(["Mega-X", "Mega-Y", "Gmax"]));
  });
});
