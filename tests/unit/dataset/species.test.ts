// B2.3/B2.4: spawns, raridade, fosseis, rotas "Como obter", evolucoes/cadeia e formas com item necessario.
// Roda sobre o snapshot real (data-source/atm-1.3.0), equivalente a
// `npm run dataset -- --only speciesDerive --out tools/dataset/out/_species` (sem publicar em public/).
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createContext, type PipelineContext } from "../../../tools/dataset/src/context";
import { openSource } from "../../../tools/dataset/src/instance";
import { loadLang } from "../../../tools/dataset/src/lang";
import { createReportSink } from "../../../tools/dataset/src/report";
import { collectSpecies } from "../../../tools/dataset/src/species/collect";
import { mergeSpecies } from "../../../tools/dataset/src/species/merge";
import { deriveSpeciesObtain, type ObtainDeps } from "../../../tools/dataset/src/species/obtain";
import { deriveRarity } from "../../../tools/dataset/src/species/rarity";
import { runSpeciesDerive, type DerivedSpecies } from "../../../tools/dataset/src/species/stage-derive";

process.env.DATASET_QUIET = "1";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const outDir = path.join(repoRoot, "tools/dataset/out/_species");
const cacheRoot = path.join(repoRoot, "tools/dataset/.cache");

// Numeros da pokedex nacional (bem conhecidos; conferidos tambem pelo slug no snapshot real).
const DEX = {
  charmeleon: 5,
  charizard: 6,
  kadabra: 64,
  alakazam: 65,
  clefairy: 35,
  clefable: 36,
  eevee: 133,
  mewtwo: 150,
  aerodactyl: 142,
};

describe("species derive stage on the real snapshot (data-source/atm-1.3.0)", () => {
  let ctx: PipelineContext;
  let derived: (dex: number) => DerivedSpecies;

  beforeAll(async () => {
    const { reader, info } = openSource(path.join(repoRoot, "data-source/atm-1.3.0"), () => {});
    const lang = loadLang(reader);
    const { species } = mergeSpecies(collectSpecies(reader), lang.table);
    const report = createReportSink(() => "speciesDerive");
    ctx = createContext({
      reader,
      source: info,
      lang: lang.table,
      outDir,
      cacheRoot,
      report,
      flags: { instance: null, skipMedia: true, offline: false, report: false, keepOld: false, only: "speciesDerive", out: outDir },
    });
    ctx.species = species;
    ctx.currentStage = "speciesDerive";
    await runSpeciesDerive(ctx);
    derived = (dex: number) => ctx.species.get(dex) as DerivedSpecies;
  }, 120_000);

  it("counts.spawnEntries > 824 e counts.fossilRoutes === 16 (SPEC sprint B2 / 5.1.2)", () => {
    expect(ctx.counts.spawnEntries).toBeGreaterThan(824);
    expect(ctx.counts.fossilRoutes).toBe(16);
  });

  it("Eevee: rarity uncommon/[rare,ultra-rare] e 5 entradas de spawn (SPEC 5.1.4, 0133_eevee.json real)", () => {
    const eevee = derived(DEX.eevee);
    expect(eevee.spawns).toHaveLength(5);
    expect(eevee.rarity).toEqual({ primary: "uncommon", secondary: ["rare", "ultra-rare"] });
  });

  it("Mewtwo: obtain inclui fossil allthemons (SPEC 5.1.5; snapshot real TAMBEM tem spawn ccc/legendary_spawns_ccc, ver HANDOFF)", () => {
    const mewtwo = derived(DEX.mewtwo);
    const fossilRoute = mewtwo.obtain.find((r) => r.kind === "fossil") as { kind: "fossil"; items: string[]; source: string };
    expect(fossilRoute).toEqual({ kind: "fossil", items: ["allthemons:pika_star", "allthemons:ancient_dna_sample"], source: "allthemons" });
  });

  it("Aerodactyl: obtain = [fossil cobblemon:old_amber_fossil, breeding]", () => {
    const aerodactyl = derived(DEX.aerodactyl);
    expect(aerodactyl.obtain.map((r) => r.kind)).toEqual(["fossil", "breeding"]);
    const fossilRoute = aerodactyl.obtain[0] as { kind: "fossil"; items: string[] };
    expect(fossilRoute.items).toEqual(["cobblemon:old_amber_fossil"]);
  });

  it("Charizard: obtain inclui evolution (from Charmeleon) e breeding, na ordem da SPEC 5.1.5", () => {
    const charizard = derived(DEX.charizard);
    expect(charizard.obtain[0]).toMatchObject({ kind: "evolution", from: DEX.charmeleon, fromSlug: "charmeleon" });
    expect(charizard.obtain[1]).toMatchObject({ kind: "breeding" });
  });

  it("undiscovered nunca ganha rota breeding (Mewtwo)", () => {
    const mewtwo = derived(DEX.mewtwo);
    expect(mewtwo.obtain.some((r) => r.kind === "breeding")).toBe(false);
  });

  it("sem nenhuma rota confirmada -> [{kind:'none'}] (deriveSpeciesObtain isolado)", () => {
    const deps: ObtainDeps = {
      species: new Map(),
      slugToDex: new Map(),
      spawnsByDex: new Map(),
      rarityByDex: new Map(),
      fossilsBySlug: new Map(),
      findEdge: () => null,
    };
    expect(deriveSpeciesObtain(999999, deps)).toEqual([{ kind: "none" }]);
  });

  it("Eevee: cadeia de evolucao com 8 arestas (Espeon friendship+day, Sylveon friendship+fairy)", () => {
    const eevee = derived(DEX.eevee);
    expect(eevee.evolutionChain.edges).toHaveLength(8);
    const espeon = eevee.evolutions.find((e) => e.toSlug === "espeon");
    expect(espeon?.requirements).toEqual(expect.arrayContaining([{ kind: "friendship", amount: 160 }, { kind: "timeRange", range: "day" }]));
    const sylveon = eevee.evolutions.find((e) => e.toSlug === "sylveon");
    expect(sylveon?.requirements).toEqual(
      expect.arrayContaining([{ kind: "friendship", amount: 160 }, { kind: "hasMoveType", type: "fairy" }]),
    );
  });

  it("Charizard: formas Mega-X/Mega-Y/Gmax com os itens de ativacao corretos", () => {
    const charizard = derived(DEX.charizard);
    const megaX = charizard.resolvedForms.find((f) => f.name === "Mega-X");
    const megaY = charizard.resolvedForms.find((f) => f.name === "Mega-Y");
    const gmax = charizard.resolvedForms.find((f) => f.name === "Gmax");
    expect(megaX?.requiredItems).toEqual(["mega_showdown:charizardite_x", "mega_showdown:keystone"]);
    expect(megaY?.requiredItems).toEqual(["mega_showdown:charizardite_y", "mega_showdown:keystone"]);
    expect(gmax?.requiredItems).toEqual([]);
  });

  it("Kadabra -> Alakazam: variant trade", () => {
    const kadabra = derived(DEX.kadabra);
    const edge = kadabra.evolutions.find((e) => e.toSlug === "alakazam");
    expect(edge?.variant).toBe("trade");
  });

  it("Clefairy -> Clefable: requiredItem cobblemon:moon_stone", () => {
    const clefairy = derived(DEX.clefairy);
    const edge = clefairy.evolutions.find((e) => e.toSlug === "clefable");
    expect(edge?.requiredItem).toBe("cobblemon:moon_stone");
  });
});

describe("deriveRarity (pure helper)", () => {
  it("sem spawns -> primary null, secondary []", () => {
    expect(deriveRarity([])).toEqual({ primary: null, secondary: [] });
  });
});
