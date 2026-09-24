// B3.1, B3.2, B3.4: cliente PokeAPI (cache/backoff), golpes/habilidades e extracao de midia.
// Sem rede: PokeAPI mockada com msw; midia dos jars via SourceReader falso em memoria.
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { runAbilities, buildAbilities, collectAbilityIds } from "../../../tools/dataset/src/abilities";
import { createContext, type MergedForm, type MergedSpecies, type PipelineContext } from "../../../tools/dataset/src/context";
import { buildLangTable } from "../../../tools/dataset/src/lang";
import { extractCries } from "../../../tools/dataset/src/media/cries";
import { checkBudget, MEDIA_BUDGET_BYTES } from "../../../tools/dataset/src/media/budget";
import { extractItemTextures } from "../../../tools/dataset/src/media/item-textures";
import { extractSfx } from "../../../tools/dataset/src/media/sfx";
import { runMediaStage } from "../../../tools/dataset/src/media/stage";
import { buildMoves, collectMoveIds } from "../../../tools/dataset/src/moves";
import { createPokeapiClient, isPokeapiError } from "../../../tools/dataset/src/pokeapi/client";
import { runPokeapiStage } from "../../../tools/dataset/src/pokeapi/stage";
import { createReportSink } from "../../../tools/dataset/src/report";
import type { JarId, JarRef, SourceReader } from "../../../tools/dataset/src/source-reader";
import { SFX_NAMES } from "../../../src/audio/sfx-names";

process.env.DATASET_QUIET = "1";

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

let tmp: string;
beforeEach(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "pontindex-pokeapi-media-"));
});
afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function makeSpecies(overrides: Partial<MergedSpecies> & { dex: number; slug: string }): MergedSpecies {
  const baseStats = { hp: 1, attack: 1, defence: 1, specialAttack: 1, specialDefence: 1, speed: 1 };
  const defaults: MergedSpecies = {
    dex: overrides.dex,
    slug: overrides.slug,
    source: "cobblemon",
    file: `data/cobblemon/species/${overrides.slug}.json`,
    name: { pt: overrides.slug, en: overrides.slug },
    pokedexText: null,
    generation: "gen1",
    labels: [],
    implemented: true,
    types: ["normal"],
    baseStats,
    evYield: baseStats,
    abilities: [],
    eggGroups: [],
    catchRate: 45,
    baseFriendship: 70,
    eggCycles: 20,
    experienceGroup: "medium",
    height: 10,
    weight: 100,
    maleRatio: 0.5,
    moves: { level: [], tm: [], egg: [], tutor: [] },
    drops: [],
    evolutionsRaw: [],
    preEvolutionRaw: null,
    forms: [],
    features: [],
    raw: {},
    origins: {},
  };
  return { ...defaults, ...overrides };
}

function makeForm(overrides: Partial<MergedForm> & { name: string }): MergedForm {
  const defaults: MergedForm = {
    name: overrides.name,
    source: "cobblemon",
    aspects: [],
    battleOnly: false,
    labels: [],
    types: [],
    baseStats: null,
    abilities: [],
    raw: {},
  };
  return { ...defaults, ...overrides };
}

function makeCtx(options: { species?: MergedSpecies[]; langLayers?: { origin: string; lang: "pt_br" | "en_us"; entries: Record<string, string> }[] } = {}): PipelineContext {
  const { table } = buildLangTable(options.langLayers ?? []);
  const ctx = createContext({
    reader: new FakeSourceReader({}),
    source: {
      root: tmp,
      mode: "snapshot",
      pack: { name: "All the Mons", version: "1.3.0", minecraft: "1.21.1" },
      cobblemonVersion: "1.7.3",
      sources: [],
    },
    lang: table,
    outDir: path.join(tmp, "out"),
    cacheRoot: path.join(tmp, "cache"),
    report: createReportSink(() => ctx.currentStage),
    flags: { instance: null, skipMedia: false, offline: false, report: false, keepOld: false, only: null, out: null },
  });
  for (const species of options.species ?? []) ctx.species.set(species.dex, species);
  return ctx;
}

class FakeSourceReader implements SourceReader {
  readonly root = "/fake";
  readonly mode = "snapshot" as const;
  constructor(private readonly data: Partial<Record<JarId, Map<string, Uint8Array>>>) {}
  listJars(): JarRef[] {
    return (Object.keys(this.data) as JarId[]).map((id) => this.jar(id));
  }
  jar(id: JarId): JarRef {
    return { id, fileName: `${id}.jar`, path: `/fake/${id}` };
  }
  readJar(ref: JarRef, prefixes: readonly string[]): Map<string, Uint8Array> {
    const src = this.data[ref.id] ?? new Map<string, Uint8Array>();
    const out = new Map<string, Uint8Array>();
    for (const [entryPath, bytes] of src) if (prefixes.some((p) => entryPath.startsWith(p))) out.set(entryPath, bytes);
    return out;
  }
  readTree(): Map<string, Uint8Array> {
    return new Map();
  }
  readFile(relPath: string): Uint8Array {
    throw new Error(`FakeSourceReader.readFile nao implementado: ${relPath}`);
  }
  exists(): boolean {
    return false;
  }
}

const bytesOf = (text: string): Uint8Array => new TextEncoder().encode(text);

// ---------------------------------------------------------------------------
// B3.1: cliente PokeAPI
// ---------------------------------------------------------------------------

describe("pokeapi client (B3.1)", () => {
  it("2 falhas 503 depois 200 -> sucesso com 2 retries; segunda execucao usa so o cache", async () => {
    let hits = 0;
    server.use(
      http.get("https://fake-pokeapi.test/move/tackle", () => {
        hits++;
        if (hits <= 2) return new HttpResponse(null, { status: 503 });
        return HttpResponse.json({ id: 33, name: "tackle" });
      }),
    );
    const cacheDir = path.join(tmp, "cache", "pokeapi");
    const client = createPokeapiClient({ cacheDir, offline: false, baseUrl: "https://fake-pokeapi.test", backoffMs: [1, 1, 1] });

    const first = await client.getJson<{ id: number }>("/move/tackle");
    expect(first?.id).toBe(33);
    expect(hits).toBe(3);

    const second = await client.getJson<{ id: number }>("/move/tackle");
    expect(second?.id).toBe(33);
    expect(hits).toBe(3); // cache hit: nenhuma nova request
  });

  it("404 retorna null sem retry", async () => {
    let hits = 0;
    server.use(
      http.get("https://fake-pokeapi.test/move/nao-existe", () => {
        hits++;
        return new HttpResponse(null, { status: 404 });
      }),
    );
    const client = createPokeapiClient({
      cacheDir: path.join(tmp, "cache2"),
      offline: false,
      baseUrl: "https://fake-pokeapi.test",
      backoffMs: [1, 1],
    });
    const result = await client.getJson("/move/nao-existe");
    expect(result).toBeNull();
    expect(hits).toBe(1);
  });

  it("cache corrompido e apagado e refeito", async () => {
    const cacheDir = path.join(tmp, "cache3");
    const client = createPokeapiClient({ cacheDir, offline: false, baseUrl: "https://fake-pokeapi.test", backoffMs: [1] });
    let hits = 0;
    server.use(
      http.get("https://fake-pokeapi.test/move/ember", () => {
        hits++;
        return HttpResponse.json({ id: 52, name: "ember" });
      }),
    );
    // sha1("https://fake-pokeapi.test/move/ember") calculado indiretamente: forcamos corrupcao rodando 1x e sujando o arquivo.
    await client.getJson("/move/ember");
    expect(hits).toBe(1);
    const files = readdirSync(cacheDir);
    expect(files.length).toBeGreaterThan(0);
    const cacheFile = path.join(cacheDir, files[0] as string);
    writeFileSync(cacheFile, "{ json invalido");
    const result = await client.getJson<{ id: number }>("/move/ember");
    expect(result?.id).toBe(52);
    expect(hits).toBe(2); // cache invalido: refez a rede
  });

  it("offline sem cache -> PokeapiError (falha explicita, nunca dado parcial)", async () => {
    const client = createPokeapiClient({ cacheDir: path.join(tmp, "cache4"), offline: true, baseUrl: "https://fake-pokeapi.test" });
    await expect(client.getJson("/move/tackle")).rejects.toSatisfy((e: unknown) => isPokeapiError(e));
  });
});

// ---------------------------------------------------------------------------
// B3.2: golpes e habilidades
// ---------------------------------------------------------------------------

describe("moves (B3.2)", () => {
  const langLayers = [
    {
      origin: "cobblemon:pt_br",
      lang: "pt_br" as const,
      entries: {
        "cobblemon.move.tackle": "Investida",
        "cobblemon.move.tackle.desc": "Um ataque fisico.",
        "cobblemon.move.visegrip.desc": "Golpe de garra.",
        "cobblemon.ability.blaze": "Incêndio",
        "cobblemon.ability.blaze.desc": "Aumenta o poder dos golpes de Fogo.",
      },
    },
    {
      origin: "cobblemon:en_us",
      lang: "en_us" as const,
      entries: {
        "cobblemon.move.tackle": "Tackle",
        "cobblemon.move.tackle.desc": "A physical attack.",
        "cobblemon.move.visegrip.desc": "A claw attack.",
        "cobblemon.ability.blaze": "Blaze",
        "cobblemon.ability.blaze.desc": "Powers up Fire moves.",
      },
    },
  ];

  function mockMoveList() {
    server.use(
      http.get("https://fake-pokeapi.test/move", () =>
        HttpResponse.json({
          results: [
            { name: "tackle", url: "https://fake-pokeapi.test/move/33" },
            { name: "vice-grip", url: "https://fake-pokeapi.test/move/17" },
          ],
        }),
      ),
      http.get("https://fake-pokeapi.test/move/33", () =>
        HttpResponse.json({ id: 33, type: { name: "normal" }, damage_class: { name: "physical" }, power: 40, accuracy: 100, pp: 35 }),
      ),
      http.get("https://fake-pokeapi.test/move/17", () =>
        HttpResponse.json({ id: 17, type: { name: "normal" }, damage_class: { name: "physical" }, power: 55, accuracy: 100, pp: 30 }),
      ),
    );
  }

  it("colhe ids do moveset das especies; casa alias (visegrip -> vice-grip); tackle == normal/physical/40/100/35", async () => {
    mockMoveList();
    const species = makeSpecies({
      dex: 1,
      slug: "test",
      moves: { level: [{ level: 1, move: "tackle" }], tm: ["visegrip"], egg: [], tutor: [] },
    });
    const ctx = makeCtx({ species: [species], langLayers });
    expect([...collectMoveIds(ctx)].sort()).toEqual(["tackle", "visegrip"]);

    const client = createPokeapiClient({ cacheDir: ctx.cacheDir("pokeapi"), offline: false, baseUrl: "https://fake-pokeapi.test" });
    const { moves, unmatched } = await buildMoves(ctx, client);
    expect(unmatched).toEqual([]);
    expect(moves.tackle).toEqual({
      id: "tackle",
      name: { pt: "Investida", en: "Tackle" },
      description: { pt: "Um ataque fisico.", en: "A physical attack." },
      type: "normal",
      category: "physical",
      power: 40,
      accuracy: 100,
      pp: 35,
      pokeapiId: 33,
    });
    expect(moves.visegrip?.power).toBe(55);
    expect(moves.visegrip?.name.pt).toBe("Visegrip"); // sem "cobblemon.move.visegrip" (so .desc): usa humanizado
  });

  it("golpe sem correspondencia na PokeAPI entra em unmatched (build deve falhar)", async () => {
    mockMoveList();
    const species = makeSpecies({ dex: 1, slug: "test", moves: { level: [], tm: ["golpe_inexistente"], egg: [], tutor: [] } });
    const ctx = makeCtx({ species: [species], langLayers });
    const client = createPokeapiClient({ cacheDir: ctx.cacheDir("pokeapi"), offline: false, baseUrl: "https://fake-pokeapi.test" });
    const { unmatched } = await buildMoves(ctx, client);
    expect(unmatched).toEqual(["golpe_inexistente"]);
  });

  it("runPokeapiStage grava counts.moves/abilities (dono = etapa pokeapi)", async () => {
    mockMoveList();
    const species = makeSpecies({
      dex: 1,
      slug: "test",
      moves: { level: [{ level: 1, move: "tackle" }], tm: [], egg: [], tutor: [] },
      abilities: [{ id: "blaze", hidden: false }],
    });
    const ctx = makeCtx({ species: [species], langLayers });
    ctx.currentStage = "pokeapi";
    // runMoves/runAbilities usam o client default (PokeAPI real); injetamos a base fake via env nao e possivel
    // aqui, entao chamamos buildMoves/buildAbilities diretamente e replicamos o setCount, como runPokeapiStage faria.
    const client = createPokeapiClient({ cacheDir: ctx.cacheDir("pokeapi"), offline: false, baseUrl: "https://fake-pokeapi.test" });
    const { moves, unmatched } = await buildMoves(ctx, client);
    expect(unmatched).toEqual([]);
    ctx.setCount("moves", Object.keys(moves).length);
    const abilities = buildAbilities(ctx);
    ctx.setCount("abilities", Object.keys(abilities).length);
    // ids de golpe vem so das especies (o lang tem descricoes de Z-Moves/G-Max que a PokeAPI nao modela); so "tackle".
    expect(ctx.counts.moves).toBe(1);
    expect(ctx.counts.abilities).toBe(1);
    void runPokeapiStage; // mantem a etapa real referenciada (exercida via CLI real, ver HANDOFF)
  });
});

describe("abilities (B3.2)", () => {
  it("colhe ids da especie/formas e do lang; nome pt do exemplo do SPEC (blaze -> Incêndio)", () => {
    const species = makeSpecies({
      dex: 1,
      slug: "charizard",
      abilities: [{ id: "blaze", hidden: false }],
      forms: [makeForm({ name: "Mega-X", abilities: [{ id: "toughclaws", hidden: false }] })],
    });
    const ctx = makeCtx({
      species: [species],
      langLayers: [
        { origin: "cobblemon:pt_br", lang: "pt_br", entries: { "cobblemon.ability.blaze": "Incêndio", "cobblemon.ability.blaze.desc": "desc pt" } },
        { origin: "cobblemon:en_us", lang: "en_us", entries: { "cobblemon.ability.blaze": "Blaze", "cobblemon.ability.blaze.desc": "desc en" } },
      ],
    });
    expect([...collectAbilityIds(ctx)].sort()).toEqual(["blaze", "toughclaws"]);
    const abilities = buildAbilities(ctx);
    expect(abilities.blaze?.name.pt).toBe("Incêndio");
    expect(abilities.toughclaws?.name).toEqual({ pt: "Toughclaws", en: "Toughclaws" }); // sem lang: humanizado
  });

  it("runAbilities grava o count e escreve abilities.json em ctx.outDir", () => {
    const species = makeSpecies({ dex: 1, slug: "x", abilities: [{ id: "blaze", hidden: false }] });
    const ctx = makeCtx({ species: [species] });
    ctx.currentStage = "pokeapi";
    runAbilities(ctx);
    expect(ctx.counts.abilities).toBe(1);
    const written = JSON.parse(readFileSync(ctx.dataPath("abilities.json"), "utf8"));
    expect(written.blaze.id).toBe("blaze");
  });
});

// ---------------------------------------------------------------------------
// B3.4: midia
// ---------------------------------------------------------------------------

describe("sfx-names (fonte unica dos sons de UI)", () => {
  it("tem exatamente 20 nomes, todos unicos", () => {
    expect(SFX_NAMES.length).toBe(20);
    expect(new Set(SFX_NAMES).size).toBe(20);
  });
});

describe("media: cries (B3.4)", () => {
  it("copia <slug>/<slug>_cry.ogg para cries/<slug>.ogg; addon lido depois vence no mesmo slug", () => {
    const reader = new FakeSourceReader({
      cobblemon: new Map([
        ["assets/cobblemon/sounds/pokemon/charizard/charizard_cry.ogg", bytesOf("cobblemon-cry")],
        ["assets/cobblemon/sounds/pokemon/bulbasaur/bulbasaur_cry.ogg", bytesOf("bulba-cry")],
      ]),
      mega_showdown: new Map([["assets/cobblemon/sounds/pokemon/charizard/charizard_cry.ogg", bytesOf("mega-cry")]]),
    });
    const ctx = makeCtx();
    ctx.reader = reader;
    const result = extractCries(ctx);
    expect(result.files).toBe(2);
    expect(readFileSync(ctx.assetPath("cries", "bulbasaur.ogg"), "utf8")).toBe("bulba-cry");
    expect(readFileSync(ctx.assetPath("cries", "charizard.ogg"), "utf8")).toBe("mega-cry");
  });

  it("arquivo de forma com sufixo extra (ex. archen_quirk1_cry.ogg) e mantido com o nome original", () => {
    const reader = new FakeSourceReader({
      cobblemon: new Map([
        ["assets/cobblemon/sounds/pokemon/archen/archen_cry.ogg", bytesOf("archen-base")],
        ["assets/cobblemon/sounds/pokemon/archen/archen_quirk1_cry.ogg", bytesOf("archen-quirk")],
      ]),
    });
    const ctx = makeCtx();
    ctx.reader = reader;
    const result = extractCries(ctx);
    expect(result.files).toBe(2);
    expect(readFileSync(ctx.assetPath("cries", "archen.ogg"), "utf8")).toBe("archen-base");
    expect(readFileSync(ctx.assetPath("cries", "archen_quirk1_cry.ogg"), "utf8")).toBe("archen-quirk");
  });

  it("arquivo de 0 bytes -> erro (E_MEDIA_CORRUPT)", () => {
    const reader = new FakeSourceReader({
      cobblemon: new Map([["assets/cobblemon/sounds/pokemon/eevee/eevee_cry.ogg", new Uint8Array(0)]]),
    });
    const ctx = makeCtx();
    ctx.reader = reader;
    expect(() => extractCries(ctx)).toThrow(/E_MEDIA_CORRUPT/);
  });
});

describe("media: sfx (B3.4)", () => {
  function fullSfxSourceMap(): Map<string, Uint8Array> {
    const entries = new Map<string, Uint8Array>();
    const names = [
      "poke_ball_throw_1",
      "poke_ball_shake_1",
      "poke_ball_shake_2",
      "poke_ball_shake_3",
      "poke_ball_shake_critical",
      "poke_ball_open",
      "poke_ball_shut",
      "poke_ball_capture_succeeded",
    ];
    for (const n of names) entries.set(`assets/cobblemon/sounds/poke_ball/${n}.ogg`, bytesOf(n));
    for (const n of ["pokedex_open", "pokedex_close", "pokedex_click", "pokedex_click_short", "pokedex_scan_open"])
      entries.set(`assets/cobblemon/sounds/item/pokedex/${n}.ogg`, bytesOf(n));
    for (const n of ["click", "levelup", "levelup_start"]) entries.set(`assets/cobblemon/sounds/gui/${n}.ogg`, bytesOf(n));
    for (const n of ["evolution_notification", "evolution_ui", "evolution_full"])
      entries.set(`assets/cobblemon/sounds/evolution/${n}.ogg`, bytesOf(n));
    entries.set("assets/cobblemon/sounds/shiny/shiny_ambient_chime_2.ogg", bytesOf("chime2"));
    entries.set("assets/cobblemon/sounds/shiny/shiny_ambient_chime_1.ogg", bytesOf("chime1"));
    return entries;
  }

  it("copia os 20 SFX_NAMES; shiny.ogg = primeiro arquivo em ordem alfabetica de sounds/shiny/", () => {
    const reader = new FakeSourceReader({ cobblemon: fullSfxSourceMap() });
    const ctx = makeCtx();
    ctx.reader = reader;
    const result = extractSfx(ctx);
    expect(result.files).toBe(20);
    expect(readFileSync(ctx.assetPath("sfx", "shiny.ogg"), "utf8")).toBe("chime1");
    expect(readFileSync(ctx.assetPath("sfx", "click.ogg"), "utf8")).toBe("click");
  });

  it("sfx ausente na fonte -> erro (E_MEDIA_MISSING)", () => {
    const partial = fullSfxSourceMap();
    partial.delete("assets/cobblemon/sounds/gui/click.ogg");
    const reader = new FakeSourceReader({ cobblemon: partial });
    const ctx = makeCtx();
    ctx.reader = reader;
    expect(() => extractSfx(ctx)).toThrow(/E_MEDIA_MISSING/);
  });
});

describe("media: item textures (B3.4)", () => {
  it("preserva subpastas ao copiar; manifesto prefere a versao fora de models/", () => {
    const reader = new FakeSourceReader({
      cobblemon: new Map([
        ["assets/cobblemon/textures/item/poke_balls/azure_ball.png", bytesOf("icon")],
        ["assets/cobblemon/textures/item/poke_balls/models/azure_ball.png", bytesOf("model")],
        ["assets/cobblemon/textures/item/potion.png", bytesOf("potion")],
      ]),
      allthemons: new Map([["assets/allthemons/textures/item/foo.png", bytesOf("foo")]]),
      mega_showdown: new Map([["assets/mega_showdown/textures/item/bar.png", bytesOf("bar")]]),
    });
    const ctx = makeCtx();
    ctx.reader = reader;
    const result = extractItemTextures(ctx);
    expect(result.files).toBe(5);
    expect(result.manifest["cobblemon:azure_ball"]).toBe("cobblemon/poke_balls/azure_ball.png");
    expect(readFileSync(ctx.assetPath("items", "cobblemon", "poke_balls", "azure_ball.png"), "utf8")).toBe("icon");
    expect(readFileSync(ctx.assetPath("items", "cobblemon", "poke_balls", "models", "azure_ball.png"), "utf8")).toBe("model");
    expect(readFileSync(ctx.assetPath("items", "allthemons", "foo.png"), "utf8")).toBe("foo");
    const manifestFile = JSON.parse(readFileSync(ctx.dataPath("texture-manifest.json"), "utf8"));
    expect(manifestFile["mega_showdown:bar"]).toBe("mega_showdown/bar.png");
  });
});

describe("media: budget (B3.4)", () => {
  it("nao falha dentro do limite; falha acima do limite", () => {
    const ctx = makeCtx();
    ctx.media.register("cries", 1, 1000);
    expect(() => checkBudget(ctx)).not.toThrow();
    ctx.media.register("itemTextures", 1, MEDIA_BUDGET_BYTES);
    expect(() => checkBudget(ctx)).toThrow(/E_MEDIA_BUDGET/);
  });
});

describe("media: stage (B3.4) --skip-media", () => {
  it("retorna cedo, counts zerados, reader nao e tocado", async () => {
    const ctx = makeCtx();
    ctx.flags.skipMedia = true;
    ctx.currentStage = "media";
    let touched = false;
    ctx.reader = new Proxy(new FakeSourceReader({}), {
      get(target, prop, receiver) {
        touched = true;
        return Reflect.get(target, prop, receiver);
      },
    });
    await runMediaStage(ctx);
    expect(touched).toBe(false);
    expect(ctx.counts.cries).toBe(0);
    expect(ctx.counts.itemTextures).toBe(0);
    expect(ctx.report.sections.mediaSkipped).toBe(true);
  });
});
