// item-descriptions D1/D2: descricao do item a partir das chaves de tooltip do jogo e do arquivo curado (fixtures, sem snapshot).
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildLangTable, readKubejsLangLayers, type LangLayer } from "../../../tools/dataset/src/lang";
import type { ReportSink } from "../../../tools/dataset/src/context";
import type { SourceReader } from "../../../tools/dataset/src/source-reader";
import {
  applyCuratedDescriptions,
  createGameDescriptionResolver,
  joinTooltipLines,
  loadCuratedDescriptions,
  parseCuratedDescriptions,
  stripFormattingCodes,
} from "../../../tools/dataset/src/items/descriptions";
import { PipelineError } from "../../../tools/dataset/src/lib/errors";

function langOf(en: Record<string, string>, pt: Record<string, string> = {}) {
  const layers: LangLayer[] = [
    { origin: "fixture:en", lang: "en_us", entries: en },
    { origin: "fixture:pt", lang: "pt_br", entries: pt },
  ];
  return buildLangTable(layers).table;
}

describe("stripFormattingCodes", () => {
  it("removes Minecraft section-sign codes", () => {
    expect(stripFormattingCodes("§7Allows Abomasnow to Mega Evolve into Mega Abomasnow")).toBe(
      "Allows Abomasnow to Mega Evolve into Mega Abomasnow",
    );
    expect(stripFormattingCodes("§l§6Bold §rgold")).toBe("Bold gold");
  });

  it("returns an empty string for a tooltip made only of codes", () => {
    expect(stripFormattingCodes("§7§r ")).toBe("");
  });
});

describe("joinTooltipLines", () => {
  it("joins with a space and adds a period between lines without punctuation", () => {
    expect(joinTooltipLines(["Makes the holder ungrounded", "Destroyed on hit"])).toBe("Makes the holder ungrounded. Destroyed on hit");
  });

  it("keeps existing punctuation and skips empty lines", () => {
    expect(joinTooltipLines(["First line!", "", "§7", "Second line."])).toBe("First line! Second line.");
  });
});

describe("createGameDescriptionResolver", () => {
  it("keeps item.<ns>.<path>.tooltip as the first source", () => {
    const lang = langOf(
      { "item.cobblemon.potion.tooltip": "Restores 20 HP", "item.cobblemon.potion.tooltip_1": "ignored" },
      { "item.cobblemon.potion.tooltip": "Restaura 20 PV" },
    );
    expect(createGameDescriptionResolver(lang)("cobblemon", "potion")).toEqual({ pt: "Restaura 20 PV", en: "Restores 20 HP" });
  });

  it("joins tooltip_1..N in numeric order (kings_rock example from the IDEA)", () => {
    const lang = langOf(
      {
        "item.cobblemon.kings_rock.tooltip_2": "Evolves Poliwhirl into Politoed and Slowpoke into Slowking when held during trading",
        "item.cobblemon.kings_rock.tooltip_1": "When the holder successfully inflicts damage, the target may also flinch",
      },
      {
        "item.cobblemon.kings_rock.tooltip_1": "Quando o portador inflige dano com sucesso, o alvo pode hesitar",
        "item.cobblemon.kings_rock.tooltip_2": "Evolui Poliwhirl para Politoed e Slowpoke para Slowking quando segurado durante a troca",
      },
    );
    expect(createGameDescriptionResolver(lang)("cobblemon", "kings_rock")).toEqual({
      en: "When the holder successfully inflicts damage, the target may also flinch. Evolves Poliwhirl into Politoed and Slowpoke into Slowking when held during trading",
      pt: "Quando o portador inflige dano com sucesso, o alvo pode hesitar. Evolui Poliwhirl para Politoed e Slowpoke para Slowking quando segurado durante a troca",
    });
  });

  it("orders tooltip_N numerically (10 after 2) and tolerates gaps in the numbering", () => {
    const lang = langOf({
      "item.cobblemon.odd.tooltip_10": "Ten",
      "item.cobblemon.odd.tooltip_1": "One",
      "item.cobblemon.odd.tooltip_2": "Two",
    });
    expect(createGameDescriptionResolver(lang)("cobblemon", "odd")?.en).toBe("One. Two. Ten");
    const gap = langOf({ "item.cobblemon.gap.tooltip_1": "One", "item.cobblemon.gap.tooltip_3": "Three" });
    expect(createGameDescriptionResolver(gap)("cobblemon", "gap")?.en).toBe("One. Three");
  });

  it("does not mix lines of an item whose path is a prefix of another", () => {
    const lang = langOf({ "item.cobblemon.rock.tooltip_1": "Rock", "item.cobblemon.rock_x.tooltip_1": "Other" });
    expect(createGameDescriptionResolver(lang)("cobblemon", "rock")?.en).toBe("Rock");
  });

  it("reads tooltip.<ns>.<path>.tooltip with color codes stripped", () => {
    const lang = langOf(
      { "tooltip.mega_showdown.abomasite.tooltip": "§7Allows Abomasnow to Mega Evolve into Mega Abomasnow" },
      { "tooltip.mega_showdown.abomasite.tooltip": "§7Permite que Abomasnow Mega Evolua para Mega Abomasnow" },
    );
    expect(createGameDescriptionResolver(lang)("mega_showdown", "abomasite")).toEqual({
      en: "Allows Abomasnow to Mega Evolve into Mega Abomasnow",
      pt: "Permite que Abomasnow Mega Evolua para Mega Abomasnow",
    });
  });

  it("reads tooltip.<ns>.<path> (no trailing .tooltip) after tooltip.<ns>.<path>.tooltip and before block.*", () => {
    const shard = "Fragments of the Dark stone, it seems to hold immense power";
    const lang = langOf({
      "tooltip.legendarymonuments.darkstone_shard": shard,
      "block.legendarymonuments.darkstone_shard.tooltip": "Block text",
      "tooltip.legendarymonuments.both.tooltip": "Suffixed wins",
      "tooltip.legendarymonuments.both": "Plain",
    });
    const resolve = createGameDescriptionResolver(lang);
    expect(resolve("legendarymonuments", "darkstone_shard")).toEqual({ pt: shard, en: shard });
    expect(resolve("legendarymonuments", "both")?.en).toBe("Suffixed wins");
  });

  it("reads block.<ns>.<path>.tooltip as the last game source", () => {
    const lang = langOf({ "block.cobblemon.big_root.tooltip": "Boosts the amount of HP the holder recovers from HP-stealing moves" });
    expect(createGameDescriptionResolver(lang)("cobblemon", "big_root")?.en).toBe("Boosts the amount of HP the holder recovers from HP-stealing moves");
  });

  it("falls back to the other language when only one exists (same as lang.text)", () => {
    const lang = langOf({ "tooltip.mega_showdown.x.tooltip": "§7Only English" });
    expect(createGameDescriptionResolver(lang)("mega_showdown", "x")).toEqual({ pt: "Only English", en: "Only English" });
  });

  it("treats an empty or codes-only tooltip as missing and moves to the next source", () => {
    const lang = langOf({
      "item.cobblemon.a.tooltip": "",
      "item.cobblemon.a.tooltip_1": "§7",
      "tooltip.cobblemon.a.tooltip": "§7 ",
      "block.cobblemon.a.tooltip": "From block",
    });
    expect(createGameDescriptionResolver(lang)("cobblemon", "a")?.en).toBe("From block");
    expect(createGameDescriptionResolver(langOf({ "item.cobblemon.b.tooltip": "§7" }))("cobblemon", "b")).toBeNull();
  });

  it("returns null when the game has no description", () => {
    expect(createGameDescriptionResolver(langOf({ "item.cobblemon.plain": "Plain" }))("cobblemon", "plain")).toBeNull();
  });
});

describe("curated descriptions (D2)", () => {
  const entry = (id: string, description: { pt: string; en: string } | null) => ({ id, description });

  it("accepts entries with both languages and trims them", () => {
    const curated = parseCuratedDescriptions({ "minecraft:stick": { en: " A stick ", pt: "Um graveto" } }, "fixture");
    expect(curated.get("minecraft:stick")).toEqual({ en: "A stick", pt: "Um graveto" });
  });

  it("rejects an entry with only one language", () => {
    expect(() => parseCuratedDescriptions({ "cobblemon:x": { en: "Only EN" } }, "fixture")).toThrow(PipelineError);
    expect(() => parseCuratedDescriptions({ "cobblemon:x": { en: "EN", pt: "  " } }, "fixture")).toThrow(/E_JSON_INVALID.*cobblemon:x/);
  });

  it("rejects unknown fields and malformed ids", () => {
    expect(() => parseCuratedDescriptions({ "cobblemon:x": { en: "EN", pt: "PT", es: "ES" } }, "fixture")).toThrow(PipelineError);
    expect(() => parseCuratedDescriptions({ "no-namespace": { en: "EN", pt: "PT" } }, "fixture")).toThrow(PipelineError);
    expect(() => parseCuratedDescriptions([], "fixture")).toThrow(PipelineError);
  });

  it("treats a missing file as no curated descriptions and fails on invalid JSON", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "curated-"));
    try {
      expect(loadCuratedDescriptions(path.join(dir, "missing.json")).size).toBe(0);
      const bad = path.join(dir, "bad.json");
      writeFileSync(bad, "{ not json");
      expect(() => loadCuratedDescriptions(bad)).toThrow(/E_JSON_INVALID/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("fills only items without game text; game wins; unknown ids are reported and ignored", () => {
    const curated = parseCuratedDescriptions(
      {
        "cobblemon:empty": { en: "Curated EN", pt: "Curado PT" },
        "cobblemon:has_game": { en: "Curated", pt: "Curado" },
        "cobblemon:not_in_catalog": { en: "Ghost", pt: "Fantasma" },
      },
      "fixture",
    );
    const game = { pt: "Jogo", en: "Game" };
    const result = applyCuratedDescriptions(
      [entry("cobblemon:empty", null), entry("cobblemon:has_game", game), entry("cobblemon:other", null)],
      curated,
    );
    expect(result.entries.map((e) => e.id)).toEqual(["cobblemon:empty", "cobblemon:has_game", "cobblemon:other"]);
    expect(result.entries[0]?.description).toEqual({ en: "Curated EN", pt: "Curado PT" });
    expect(result.entries[1]?.description).toBe(game);
    expect(result.entries[2]?.description).toBeNull();
    expect(result.fromCurated).toEqual(["cobblemon:empty"]);
    expect(result.shadowedByGame).toEqual(["cobblemon:has_game"]);
    expect(result.unknownIds).toEqual(["cobblemon:not_in_catalog"]);
  });
});

describe("kubejs lang overlay (D6)", () => {
  const layer = (origin: string, lang: "pt_br" | "en_us", entries: Record<string, string>): LangLayer => ({ origin, lang, entries });

  it("kubejs wins over the jars per locale; first kubejs folder wins between folders; counts overrides and additions", () => {
    const jars = [
      layer("jar:en", "en_us", { "ability.stamina": "Stamina", "item.x": "Great Ball" }),
      layer("jar:pt", "pt_br", { "ability.stamina": "Estamina", "item.x": "Bola Grande" }),
    ];
    const kubejs = [
      layer("kubejs:a/pt", "pt_br", { "ability.stamina": "Vigor", "item.x": "Grande Bola", "item.only_pt": "So PT" }),
      layer("kubejs:b/pt", "pt_br", { "item.x": "Outra" }),
    ];
    const result = buildLangTable(jars, undefined, kubejs);
    expect(result.table.text("ability.stamina")).toEqual({ pt: "Vigor", en: "Stamina" });
    expect(result.table.text("item.x")).toEqual({ pt: "Grande Bola", en: "Great Ball" });
    expect(result.table.en.has("item.only_pt")).toBe(false);
    expect(result.kubejs).toEqual({ overridden: { pt_br: 2, en_us: 0 }, added: { pt_br: 1, en_us: 0 } });
    expect(result.conflicts).toEqual([{ key: "item.x", lang: "pt_br", kept: "Grande Bola", ignored: "Outra", origin: "kubejs:b/pt" }]);
  });

  it("reads kubejs/assets/<folder>/lang/*.json in folder order and skips invalid JSON with a warning", () => {
    const root = mkdtempSync(path.join(tmpdir(), "kubejs-lang-"));
    try {
      const put = (rel: string, text: string) => {
        mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
        writeFileSync(path.join(root, rel), text);
      };
      put("kubejs/assets/zeta/lang/pt_br.json", JSON.stringify({ k: "zeta" }));
      put("kubejs/assets/alpha/lang/pt_br.json", JSON.stringify({ k: "alpha", n: 1 }));
      put("kubejs/assets/alpha/lang/en_us.json", JSON.stringify({ k: "alpha en" }));
      put("kubejs/assets/broken/lang/pt_br.json", "{ \"k\": \"x\" \"y\" }");
      put("kubejs/assets/alpha/lang/ru_ru.json", JSON.stringify({ k: "ru" }));
      const reader = {
        root,
        exists: (rel: string) => existsSync(path.join(root, rel)),
        readFile: (rel: string) => new Uint8Array(readFileSync(path.join(root, rel))),
      } as unknown as SourceReader;
      const warnings: string[] = [];
      const report = { warn: (code: string) => warnings.push(code) } as unknown as ReportSink;
      const layers = readKubejsLangLayers(reader, report);
      expect(layers.map((l) => l.origin)).toEqual([
        "kubejs:assets/alpha/lang/en_us.json",
        "kubejs:assets/alpha/lang/pt_br.json",
        "kubejs:assets/zeta/lang/pt_br.json",
      ]);
      expect(layers[1]?.entries).toEqual({ k: "alpha" });
      expect(warnings).toEqual(["W_KUBEJS_LANG_INVALID"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
