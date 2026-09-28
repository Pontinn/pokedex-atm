// U7e: fontes do contrato v2 no Como obter com items.json mockado (dataset real + itens de teste), em 360/390 px,
// PT e EN, lista longa fechada e aberta: sem sobreposicao e nada passa da viewport. Headless, sem slowMo, sem esperas
// fixas. Usa o dev server (PW_DEV=1): abre o item pela store de navegacao, os itens de teste nao existem no dataset.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

type NavModule = typeof import("../../src/navigation/navigation-store");
type PrefsModule = typeof import("../../src/state/preferences-store");

const LONG = "u7e:long_item";
const ALL = "u7e:all_sources";

function mockItem(id: string, obtain: unknown[]) {
  const path = id.slice(id.indexOf(":") + 1);
  return {
    id,
    namespace: "u7e",
    path,
    name: { pt: "Item de teste com um nome bem comprido", en: "Test item with a rather long name" },
    description: null,
    category: "other",
    texture: null,
    tags: [],
    obtain,
    usedIn: { evolutions: [], fossils: [], forms: [], ball: false },
    cooking: null,
  };
}

const longName = { pt: "Cristal de Mega Pedra das Profundezas Esquecidas", en: "Mega Stone Crystal of the Forgotten Depths" };
const MOCK = {
  [ALL]: mockItem(ALL, [
    { kind: "blockDrop", blocks: [{ id: "mega_showdown:mega_stone_crystal", name: longName }, { id: "mega_showdown:a_really_long_block_identifier_without_name", name: null }] },
    { kind: "mobDrop", mobs: [{ id: "minecraft:evoker", name: { pt: "Evocador", en: "Evoker" } }] },
    { kind: "questReward", quests: [{ chapter: { pt: "Capítulo inicial da jornada", en: "Opening chapter of the journey" }, title: { pt: "Os primeiros passos no mundo Cobblemon", en: "First steps in the Cobblemon world" } }, { chapter: null, title: null }] },
    { kind: "shop", shop: "battleTowerBp", price: 48 },
    { kind: "structurePlaced", structures: [{ id: "legendarymonuments:bell_tower", name: { pt: "Torre do Sino", en: "Bell Tower" } }] },
    { kind: "ritual", rituals: ["summoningrituals:mew_ritual"] },
    { kind: "trade", traders: ["villager", "wanderingTrader"] },
    { kind: "worldgen", features: ["mega_showdown:max_mushroom_patch"] },
    { kind: "special", note: { pt: "Cai ao derrotar um Pokémon terastalizado, conforme a chance da config.", en: "Drops when you defeat a terastallized Pokémon, at the configured chance." }, evidence: "config/mega_showdown.json:teraShardDropRate" },
  ]),
  [LONG]: mockItem(LONG, [
    { kind: "structureLoot", tables: Array.from({ length: 199 }, (_, i) => `dungeons_arise:chests/some_very_long_structure_name_${i}/loot_table_part`) },
    { kind: "mobDrop", mobs: Array.from({ length: 40 }, (_, i) => ({ id: `minecraft:mob_${i}`, name: null })) },
  ]),
};

async function boot(page: Page, width: number) {
  await page.route("**/items.json", async (route) => {
    const res = await route.fetch();
    const real = (await res.json()) as Record<string, unknown>;
    await route.fulfill({ response: res, json: { ...real, ...MOCK } });
  });
  await page.setViewportSize({ width, height: 800 });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
}

async function openItem(page: Page, itemId: string, lang: "pt" | "en") {
  await page.evaluate(
    async ({ itemId, lang }) => {
      const prefs = (await import(/* @vite-ignore */ "/src/state/preferences-store.ts")) as PrefsModule;
      prefs.usePreferencesStore.setState({ uiLanguage: lang, termsLanguage: lang });
      const nav = (await import(/* @vite-ignore */ "/src/navigation/navigation-store.ts")) as NavModule;
      (nav.useNavigationStore.getState().navigate as (s: string, p?: unknown) => void)("item", { itemId });
    },
    { itemId, lang },
  );
  await expect(page.locator(`.item-body[data-item="${itemId}"] .item-obtain .ob-row`).first()).toBeVisible({ timeout: 30_000 });
}

async function expectInsideViewport(page: Page) {
  const overflow = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [...document.querySelectorAll<HTMLElement>(".item-obtain .ob-row, .item-obtain .biome, .item-obtain .ob-text")]
      .filter((el) => el.getBoundingClientRect().right > vw + 1)
      .map((el) => el.textContent);
    return { scroll: document.documentElement.scrollWidth - vw, bad };
  });
  expect(overflow.bad).toEqual([]);
  expect(overflow.scroll).toBeLessThanOrEqual(0);
}

test.skip(process.env.PW_DEV !== "1", "usa a store de navegacao do dev server");

for (const width of [360, 390]) {
  for (const lang of ["pt", "en"] as const) {
    test(`fontes v2 em ${width}px (${lang}): todas as linhas, sem sobreposicao, dentro da viewport`, async ({ page }) => {
      await boot(page, width);
      await openItem(page, ALL, lang);
      const rows = page.locator(".item-obtain .ob-row");
      await expect(rows).toHaveCount(9);
      await expect(page.locator(".item-obtain [data-row='trade']")).toContainText(lang === "pt" ? "Vendedor ambulante" : "Wandering trader");
      await expectNoOverlap(page, ".item-obtain");
      await expectInsideViewport(page);
    });

    test(`lista longa em ${width}px (${lang}): 'e mais N' fechado e aberto`, async ({ page }) => {
      await boot(page, width);
      await openItem(page, LONG, lang);
      const loot = page.locator(".item-obtain [data-row='structureLoot']");
      const more = loot.locator(".ob-more");
      await expect(more).toHaveText(lang === "pt" ? "e mais 187" : "and 187 more");
      await expectNoOverlap(page, ".item-obtain");
      await expectInsideViewport(page);
      await more.click();
      await expect(loot.locator(".ob-entry")).toHaveCount(199);
      await expectNoOverlap(page, ".item-obtain");
      await expectInsideViewport(page);
    });
  }
}
