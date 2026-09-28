// item-descriptions D1: descricao do item a partir das chaves de tooltip do jogo (fixtures em memoria, sem snapshot).
import { describe, expect, it } from "vitest";
import { buildLangTable, type LangLayer } from "../../../tools/dataset/src/lang";
import {
  createGameDescriptionResolver,
  joinTooltipLines,
  stripFormattingCodes,
} from "../../../tools/dataset/src/items/descriptions";

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
