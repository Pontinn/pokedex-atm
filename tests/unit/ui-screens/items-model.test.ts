// @vitest-environment node
// F9.2: grade de itens contra o dataset REAL: abas na ordem da SPEC, busca PT/EN sem acento em TODOS os itens.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { ItemsFile } from "../../../src/data/types";
import { MESSAGES } from "../../../src/i18n/messages";
import { CATEGORY_LABEL, ITEM_TABS, effectiveTab, filterItems, inTab, visibleTabs } from "../../../src/screens/Items/item-model";

const root = join(__dirname, "../../../public/data");
const version = (JSON.parse(readFileSync(join(root, "current.json"), "utf8")) as { datasetVersion: string }).datasetVersion;
const items = Object.values(JSON.parse(readFileSync(join(root, version, "items.json"), "utf8")) as ItemsFile);

describe("F9.2 item grid", () => {
  it("tabs follow the SPEC order, only with items, and every category has a label", () => {
    const tabs = visibleTabs(items);
    expect(tabs[0]).toBe("medicine");
    expect(tabs).toEqual(ITEM_TABS.filter((t) => tabs.includes(t)));
    for (const it of items) expect(tabs).toContain(it.category);
    for (const c of ITEM_TABS) expect(MESSAGES[CATEGORY_LABEL[c]]).toBeDefined();
    expect(effectiveTab("all", tabs)).toBe("medicine");
    expect(effectiveTab("held", tabs)).toBe("held");
  });

  it("pocao finds Potion in PT and EN, across categories", () => {
    const pt = filterItems(items, "held", "pocao", "pt").map((i) => i.id);
    expect(pt).toContain("cobblemon:potion");
    expect(filterItems(items, "berry", "POTION", "en").map((i) => i.id)).toContain("cobblemon:potion");
    const scarf = filterItems(items, null, "lenco da escolha", "pt").map((i) => i.id);
    expect(scarf).toEqual(["cobblemon:choice_scarf"]);
  });

  it("without text only the tab items, sorted by name; bait tab includes bait-tagged items", () => {
    const med = filterItems(items, "medicine", "  ", "pt");
    expect(med.length).toBe(items.filter((i) => i.category === "medicine").length);
    const names = med.map((i) => i.name.pt);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
    expect(inTab({ category: "berry", tags: ["bait"] }, "bait")).toBe(true);
    expect(inTab({ category: "berry", tags: [] }, "bait")).toBe(false);
    expect(filterItems(items, "medicine", "zzzzqq", "pt")).toEqual([]);
  });
});
