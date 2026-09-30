// U7e (pwa-auto-update): fontes do contrato v2 no Como obter do item (blockDrop, mobDrop, questReward, shop,
// structurePlaced, ritual, trade, worldgen, special), schema zod estrito e limite "e mais N" em todas as listas.
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BallsFile, ItemInfo, ItemObtainRoute, ItemsFile } from "../../../src/data/types";

function item(id: string, obtain: ItemObtainRoute[]): ItemInfo {
  const path = id.slice(id.indexOf(":") + 1);
  return {
    id,
    namespace: id.slice(0, id.indexOf(":")),
    path,
    name: { pt: path, en: path },
    description: null,
    category: "other",
    texture: null,
    tags: [],
    obtain,
    usedIn: { evolutions: [], fossils: [], forms: [], ball: false },
    cooking: null,
    bait: null,
    berry: null,
  };
}

const tables = Array.from({ length: 199 }, (_, i) => `mod${i}:chests/box_${i}`);

const items: ItemsFile = {
  "mega_showdown:mega_stone": item("mega_showdown:mega_stone", [
    {
      kind: "blockDrop",
      blocks: [
        { id: "mega_showdown:mega_stone_crystal", name: { pt: "Cristal de Mega Pedra", en: "Mega Stone Crystal" } },
        { id: "mega_showdown:odd_rock_block", name: null },
      ],
    },
  ]),
  "minecraft:totem_of_undying": item("minecraft:totem_of_undying", [
    { kind: "mobDrop", mobs: [{ id: "minecraft:evoker", name: { pt: "Evocador", en: "Evoker" } }] },
  ]),
  "allthemons:quest_thing": item("allthemons:quest_thing", [
    {
      kind: "questReward",
      quests: [
        { chapter: { pt: "Começo", en: "Beginning" }, title: { pt: "Primeiros passos", en: "First steps" } },
        { chapter: null, title: null },
      ],
    },
  ]),
  "cobblemon:bp_item": item("cobblemon:bp_item", [{ kind: "shop", shop: "battleTowerBp", price: 48 }]),
  "cobblemon:bp_free": item("cobblemon:bp_free", [{ kind: "shop", shop: "battleTowerBp", price: null }]),
  "cobblemon:placed": item("cobblemon:placed", [
    { kind: "structurePlaced", structures: [{ id: "legendarymonuments:bell_tower", name: { pt: "Torre do Sino", en: "Bell Tower" } }] },
  ]),
  "cobblemon:ritual_item": item("cobblemon:ritual_item", [{ kind: "ritual", rituals: ["summoningrituals:mew_ritual"] }]),
  "minecraft:emerald_trade": item("minecraft:emerald_trade", [{ kind: "trade", traders: ["villager", "wanderingTrader"] }]),
  "mega_showdown:max_mushroom": item("mega_showdown:max_mushroom", [{ kind: "worldgen", features: ["mega_showdown:max_mushroom_patch"] }]),
  "mega_showdown:tera_shard": item("mega_showdown:tera_shard", [
    {
      kind: "special",
      note: { pt: "Cai ao derrotar um Pokémon terastalizado.", en: "Drops when you defeat a terastallized Pokémon." },
      evidence: "config/mega_showdown.json:teraShardDropRate",
    },
  ]),
  "minecraft:diamond": item("minecraft:diamond", [{ kind: "structureLoot", tables }]),
  "cobblemon:big_block": item("cobblemon:big_block", [
    { kind: "blockDrop", blocks: Array.from({ length: 20 }, (_, i) => ({ id: `mod:block_${i}`, name: null })) },
  ]),
};
const balls: BallsFile = [];

vi.mock("../../../src/data/loaders", async (importOriginal) => {
  const real = await importOriginal<typeof import("../../../src/data/loaders")>();
  return { ...real, loadItems: async () => items, loadBalls: async () => balls, loadBiomes: async () => ({}), loadSeries: async () => [] };
});

const { ItemScreen } = await import("../../../src/screens/Item/ItemScreen");
const { OBTAIN_LIST_CAP, capList, idLabels, namedRefLabel, questLabel, traderKey } = await import("../../../src/screens/Item/item-page-model");
const { itemsFileSchema } = await import("../../../src/data/schemas");
const { translate } = await import("../../../src/i18n/useT");
const { resetDatasetStore, useDatasetStore } = await import("../../../src/state/dataset-store");
const { resetNavigationStore, useNavigationStore } = await import("../../../src/navigation/navigation-store");
const { resetPreferencesStore, usePreferencesStore } = await import("../../../src/state/preferences-store");

const pt = (key: string, vars?: Record<string, string | number>) => translate("pt", key, vars);

beforeEach(() => {
  resetDatasetStore();
  resetNavigationStore();
  resetPreferencesStore();
  useDatasetStore.setState({ status: "ready", ready: true, speciesIndex: [] });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderItem(itemId: string) {
  useNavigationStore.getState().navigate("item", { itemId });
  return render(<ItemScreen entryId={1} params={{ itemId }} />);
}

async function obtainRow(kind: string): Promise<HTMLElement> {
  return waitFor(() => {
    const el = document.querySelector<HTMLElement>(`.item-obtain [data-row='${kind}']`);
    if (!el) throw new Error("carregando");
    return el;
  });
}

const chips = (row: HTMLElement) => [...row.querySelectorAll<HTMLElement>(".ob-entry")].map((e) => e.textContent);
const title = (row: HTMLElement) => row.querySelector(".ob-title")!.textContent;

describe("modelo", () => {
  it("namedRefLabel usa o nome do pack e cai no id humanizado", () => {
    expect(namedRefLabel({ id: "minecraft:evoker", name: { pt: "Evocador", en: "Evoker" } }, "pt")).toBe("Evocador");
    expect(namedRefLabel({ id: "minecraft:evoker", name: { pt: "", en: "Evoker" } }, "pt")).toBe("Evoker");
    expect(namedRefLabel({ id: "mega_showdown:odd_rock_block", name: null }, "en")).toBe("Odd rock block");
  });
  it("questLabel, traderKey e idLabels", () => {
    expect(questLabel({ chapter: { pt: "Começo", en: "Beginning" }, title: null }, "en")).toEqual({ chapter: "Beginning", title: null });
    expect(traderKey("wanderingTrader")).toBe("ip.trader.wanderingTrader");
    expect(idLabels(["summoningrituals:mew_ritual", "x:mew_ritual"])).toEqual(["Mew ritual"]);
  });
  it("capList corta no limite e informa quantos ficaram de fora", () => {
    const list = Array.from({ length: 30 }, (_, i) => i);
    expect(capList(list, false).shown).toHaveLength(OBTAIN_LIST_CAP);
    expect(capList(list, false).hidden).toBe(30 - OBTAIN_LIST_CAP);
    expect(capList(list, true)).toEqual({ shown: list, hidden: 0 });
    expect(capList([1, 2], false)).toEqual({ shown: [1, 2], hidden: 0 });
  });
});

describe("schema do items.json (contrato v2)", () => {
  it("aceita todas as fontes novas", () => {
    expect(itemsFileSchema.safeParse(items).success).toBe(true);
  });
  const bad: [string, unknown][] = [
    ["campo extra no blockDrop", { kind: "blockDrop", blocks: [], tables: [] }],
    ["campo extra no bloco", { kind: "blockDrop", blocks: [{ id: "a:b", name: null, count: 1 }] }],
    ["nome sem en", { kind: "mobDrop", mobs: [{ id: "a:b", name: { pt: "x" } }] }],
    ["nome com campo extra", { kind: "structurePlaced", structures: [{ id: "a:b", name: { pt: "x", en: "x", es: "x" } }] }],
    ["missao com campo extra", { kind: "questReward", quests: [{ chapter: null, title: null, id: "q" }] }],
    ["loja desconhecida", { kind: "shop", shop: "pokemart", price: 1 }],
    ["loja sem price", { kind: "shop", shop: "battleTowerBp" }],
    ["comerciante desconhecido", { kind: "trade", traders: ["piglin"] }],
    ["ritual com campo extra", { kind: "ritual", rituals: [], altar: "x" }],
    ["worldgen sem features", { kind: "worldgen" }],
    ["special sem evidence", { kind: "special", note: { pt: "a", en: "a" } }],
    ["special com campo extra", { kind: "special", note: { pt: "a", en: "a" }, evidence: "f:k", source: "x" }],
    ["kind desconhecido", { kind: "trainerGroupDrop", groups: [] }],
  ];
  it.each(bad)("rejeita %s", (_name, route) => {
    expect(itemsFileSchema.safeParse({ x: item("a:x", [route as ItemObtainRoute]) }).success).toBe(false);
  });
});

describe("Como obter (fontes v2)", () => {
  it("Quebrar bloco: um chip por bloco com o nome do pack, fallback no id humanizado", async () => {
    renderItem("mega_showdown:mega_stone");
    const row = await obtainRow("blockDrop");
    expect(title(row)).toBe("Quebrar bloco");
    expect(row.textContent).toContain(pt("ip.blockDropText"));
    expect(chips(row)).toEqual(["Cristal de Mega Pedra", "Odd rock block"]);
  });

  it("Drop de mob", async () => {
    renderItem("minecraft:totem_of_undying");
    const row = await obtainRow("mobDrop");
    expect(title(row)).toBe("Drop de mob");
    expect(chips(row)).toEqual(["Evocador"]);
  });

  it("Recompensa de missao: titulo + capitulo; sem titulo cai no rotulo generico", async () => {
    renderItem("allthemons:quest_thing");
    const row = await obtainRow("questReward");
    expect(title(row)).toBe("Recompensa de missão");
    expect(chips(row)).toEqual(["Primeiros passosComeço", pt("ip.questUntitled")]);
  });

  it("Loja de BP com e sem preco", async () => {
    const view = renderItem("cobblemon:bp_item");
    const row = await obtainRow("shop");
    expect(title(row)).toBe("Loja de BP (Battle Tower)");
    expect(row.textContent).toContain("Custa 48 BP");
    view.unmount();
    resetNavigationStore();
    renderItem("cobblemon:bp_free");
    expect((await obtainRow("shop")).textContent).toContain(pt("ip.shopNoPrice"));
  });

  it("Colocado em estruturas, Ritual de invocacao, Troca e Gerado no mundo", async () => {
    const cases: [string, string, string, string[]][] = [
      ["cobblemon:placed", "structurePlaced", "Colocado em estruturas", ["Torre do Sino"]],
      ["cobblemon:ritual_item", "ritual", "Ritual de invocação", ["Mew ritual"]],
      ["minecraft:emerald_trade", "trade", "Troca com aldeão / vendedor ambulante", ["Aldeão", "Vendedor ambulante"]],
      ["mega_showdown:max_mushroom", "worldgen", "Gerado no mundo", ["Max mushroom patch"]],
    ];
    for (const [id, kind, rowTitle, expected] of cases) {
      const view = renderItem(id);
      const row = await obtainRow(kind);
      expect(title(row)).toBe(rowTitle);
      expect(chips(row)).toEqual(expected);
      view.unmount();
      resetNavigationStore();
    }
  });

  it("Mecanica especial mostra a nota", async () => {
    renderItem("mega_showdown:tera_shard");
    const row = await obtainRow("special");
    expect(title(row)).toBe(pt("ip.special"));
    expect(row.textContent).toContain("Cai ao derrotar um Pokémon terastalizado.");
    expect(row.querySelector("[data-evidence]")!.getAttribute("data-evidence")).toBe("config/mega_showdown.json:teraShardDropRate");
  });

  it("nomes do jogo seguem o idioma dos termos (toggle), rotulos seguem o idioma da interface", async () => {
    usePreferencesStore.setState({ uiLanguage: "en", termsLanguage: "pt" });
    renderItem("mega_showdown:mega_stone");
    const row = await obtainRow("blockDrop");
    expect(title(row)).toBe("Break a block");
    expect(chips(row)).toEqual(["Cristal de Mega Pedra", "Odd rock block"]);
  });

  it("textos em EN", async () => {
    usePreferencesStore.setState({ uiLanguage: "en", termsLanguage: "en" });
    const cases: [string, string, string, string][] = [
      ["mega_showdown:mega_stone", "blockDrop", "Break a block", "Mega Stone Crystal"],
      ["minecraft:totem_of_undying", "mobDrop", "Mob drop", "Evoker"],
      ["allthemons:quest_thing", "questReward", "Quest reward", "First steps"],
      ["cobblemon:bp_item", "shop", "BP shop (Battle Tower)", "Costs 48 BP"],
      ["cobblemon:placed", "structurePlaced", "Placed in structures", "Bell Tower"],
      ["cobblemon:ritual_item", "ritual", "Summoning ritual", "Mew ritual"],
      ["minecraft:emerald_trade", "trade", "Villager / wandering trader trade", "Wandering trader"],
      ["mega_showdown:max_mushroom", "worldgen", "Generated in the world", "Max mushroom patch"],
      ["mega_showdown:tera_shard", "special", "Special mechanic", "Drops when you defeat a terastallized Pokémon."],
    ];
    for (const [id, kind, rowTitle, text] of cases) {
      const view = renderItem(id);
      const row = await obtainRow(kind);
      expect(title(row)).toBe(rowTitle);
      expect(row.textContent).toContain(text);
      view.unmount();
      resetNavigationStore();
    }
  });
});

describe("listas longas", () => {
  it("Loot de estrutura com 199 tabelas: mostra o limite + 'e mais N', expande e recolhe", async () => {
    renderItem("minecraft:diamond");
    const row = await obtainRow("structureLoot");
    expect(chips(row)).toHaveLength(OBTAIN_LIST_CAP);
    const more = row.querySelector<HTMLButtonElement>(".ob-more")!;
    expect(more.textContent).toBe(`e mais ${199 - OBTAIN_LIST_CAP}`);
    expect(more.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(more);
    expect(chips(row)).toHaveLength(199);
    const less = row.querySelector<HTMLButtonElement>(".ob-more")!;
    expect(less.textContent).toBe(pt("ip.less"));
    fireEvent.click(less);
    expect(chips(row)).toHaveLength(OBTAIN_LIST_CAP);
  });

  it("vale para as fontes novas e em EN ('and N more')", async () => {
    usePreferencesStore.setState({ uiLanguage: "en" });
    renderItem("cobblemon:big_block");
    const row = await obtainRow("blockDrop");
    expect(chips(row)).toHaveLength(OBTAIN_LIST_CAP);
    expect(row.querySelector(".ob-more")!.textContent).toBe(`and ${20 - OBTAIN_LIST_CAP} more`);
  });

  it("lista curta nao ganha o botao", async () => {
    renderItem("mega_showdown:mega_stone");
    const row = await obtainRow("blockDrop");
    expect(row.querySelector(".ob-more")).toBeNull();
  });
});
