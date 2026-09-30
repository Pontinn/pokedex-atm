// F9.2: Itens & Comidas com o dataset REAL, headless, sem slowMo, sem esperas fixas. PW_DEV=1 PW_PORT=4175.
import { readFileSync, readdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { THEME_IDS } from "../../src/styles/themes";
import { writeDoc } from "./idb-helpers";

const SHOTS = process.env.ITEMS_SHOTS_DIR;
const DEV = process.env.PW_DEV === "1";

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

// Navegacao por interacao real de UI (sidebar no desktop, sheet "Mais" no mobile): funciona em dev e producao.
async function go(page: Page, screen: "items" | "settings") {
  let link = page.locator(`[data-nav="${screen}"]:visible`).first();
  if ((await link.count()) === 0) {
    await page.locator('[data-nav="more"]:visible').first().click();
    link = page.locator(`[data-nav="${screen}"]:visible`).first();
  }
  await link.click();
}

async function openItems(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await go(page, "items");
  await expect(page.locator("#item-grid .item-card").first()).toBeVisible({ timeout: 30_000 });
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await page.locator(".tgl-lang:visible").first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

/**
 * Espera as animacoes finitas (cardIn da grade, disparada ao abrir a tela, trocar de aba ou buscar) terminarem: durante
 * a entrada os cards ainda estao deslocados (translateY) e o .item-desc de um card cruza o .item-link do seguinte.
 * Confere o playState a cada frame em vez de aguardar a promessa finished: a transicao de hover desfeita (mouse sobre o
 * card apos o scrollIntoView) vira "idle" sem nunca resolver nem rejeitar essa promessa.
 */
async function settle(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const busy = () =>
          document.getAnimations().some((a) => (a.playState === "running" || a.pending) && a.effect?.getComputedTiming().iterations !== Infinity);
        const tick = () => (busy() ? requestAnimationFrame(tick) : resolve());
        tick();
      }),
  );
}

const card = (page: Page, id: string) => page.locator(`.item-card[data-item="${id}"]`);

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test("F9.2 tabs, tag above the name, pocao finds Potion with EN card, expand, restore on back, item page", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await openItems(page);
  await expect(page.locator("#item-tabs button.active")).toHaveText("Medicina");
  const potion = card(page, "cobblemon:potion");
  await expect(potion.locator(".item-name")).toHaveText("Poção");
  await expect(potion.locator(".item-alt")).toHaveText("Potion");
  await expect(potion.locator(".item-tag")).toHaveText(/medicina/i);
  // tag em linha propria, ACIMA do nome
  const tagBox = (await potion.locator(".item-tag").boundingBox())!;
  const nameBox = (await potion.locator(".item-name").boundingBox())!;
  expect(tagBox.y + tagBox.height).toBeLessThanOrEqual(nameBox.y + 1);
  expect(await potion.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/items-1280.png` });

  await page.locator("#item-tabs button", { hasText: "Itens Segurados" }).click();
  await expect(card(page, "cobblemon:choice_scarf")).toBeVisible();
  await expect(card(page, "cobblemon:potion")).toHaveCount(0);

  const q = page.locator("#item-q");
  await q.fill("pocao");
  await expect(card(page, "cobblemon:potion")).toBeVisible();
  await expect(page.locator("#item-tabs button.active")).toHaveCount(0);
  await page.locator('.terms-tgl[data-tcard="items"] [data-tl="en"]').click();
  await expect(card(page, "cobblemon:potion").locator(".item-name")).toHaveText("Potion");
  await expect(card(page, "cobblemon:potion").locator(".item-alt")).toHaveText("Poção");
  await page.locator('.terms-tgl[data-tcard="items"] [data-tl="pt"]').click();

  await card(page, "cobblemon:potion").locator(".item-caret").click();
  await expect(card(page, "cobblemon:potion")).toHaveClass(/open/);

  await q.fill("zzzzqq");
  await expect(page.locator(".items-screen .empty-state")).toContainText('"zzzzqq"');
  await q.fill("potion");
  await expect(card(page, "cobblemon:potion")).toBeVisible();
  await go(page, "settings");
  await page.goBack();
  await expect(page.locator("#item-q")).toHaveValue("potion");
  await expect(card(page, "cobblemon:potion")).toHaveClass(/open/);

  // clicar numa aba limpa a busca e mostra a aba
  await page.locator("#item-tabs button", { hasText: "Evolução" }).click();
  await expect(page.locator("#item-q")).toHaveValue("");
  await expect(card(page, "cobblemon:fire_stone")).toBeVisible();

  await card(page, "cobblemon:fire_stone").locator(".item-link").click();
  await expect(page.locator(".screen[data-screen='item']")).toBeVisible();
  await page.goBack();
  await expect(page.locator("#item-tabs button.active")).toHaveText("Evolução");
  expect(errors).toEqual([]);
});

for (const lang of ["pt", "en"] as const) {
  for (const width of [360, 390, 1280]) {
    test(`F9.2 no overlap ${lang} ${width}px (long names)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await openItems(page, width, 800);
      await setLanguage(page, lang);
      await settle(page);
      await expectNoOverlap(page, ".items-screen .item-top");
      await settle(page);
      await expectNoOverlap(page, "#item-grid");
      await page.locator("#item-tabs button[data-icat='held']").click();
      await expect(card(page, "cobblemon:choice_scarf")).toBeVisible();
      await page.locator('.terms-tgl[data-tcard="items"] [data-tl="en"]').click();
      for (const id of ["cobblemon:choice_scarf", "cobblemon:leftovers"]) {
        const c = card(page, id);
        await c.scrollIntoViewIfNeeded();
        await settle(page);
        await expectNoOverlap(page, `.item-card[data-item="${id}"]`);
        // nome em no maximo 1 linha a mais que o necessario: "Choice Scarf"/"Leftovers" cabem numa linha
        const lines = await c.locator(".item-name").evaluate((el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)));
        expect(lines).toBe(1);
      }
      await settle(page);
      await expectNoOverlap(page, "#item-grid");
      await page.locator("#item-q").fill("mecanismo");
      // a busca (com debounce) desmarca a aba: so entao a grade nova entra e anima
      await expect(page.locator("#item-tabs button.active")).toHaveCount(0);
      await settle(page);
      await expectNoOverlap(page, "#item-grid");
      await page.locator("#item-q").fill("zzzzqq");
      await expect(page.locator(".items-screen .empty-state")).toBeVisible();
      await settle(page);
      await expectNoOverlap(page, ".items-screen .empty-state");
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/items-${lang}-${width}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test("spawn-bait (CA-23/24): Iscas tab lists the 8 new bait items and the Poke Bait with the Iscas chip and texture; berries keep their chip", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await openItems(page);
  await page.locator("#item-tabs button[data-icat='bait']").click();
  await expect(page.locator("#item-tabs button[data-icat='bait']")).toHaveClass(/active/);
  const ids = [
    "minecraft:golden_apple",
    "minecraft:enchanted_golden_apple",
    "minecraft:golden_carrot",
    "minecraft:glistering_melon_slice",
    "minecraft:glow_berries",
    "allthemodium:allthemodium_apple",
    "allthemodium:allthemodium_carrot",
    "cobblemon:poke_snack",
    "cobblemon:poke_bait",
  ];
  for (const id of ids) {
    const c = card(page, id);
    await c.scrollIntoViewIfNeeded();
    await expect(c).toBeVisible();
    await expect(c.locator(".item-tag")).toHaveText(/iscas/i);
    await expect.poll(() => c.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  const occa = card(page, "cobblemon:occa_berry");
  await occa.scrollIntoViewIfNeeded();
  await expect(occa.locator(".item-tag")).toHaveText(/berries/i);
  const apple = card(page, "minecraft:apple");
  await apple.scrollIntoViewIfNeeded();
  await expect(apple).toBeVisible();
  expect(errors).toEqual([]);
});

// berry-mutations T1.5: contagens DERIVADAS dos 70 arquivos crus de berries do snapshot (LESSONS). Headless, sem esperas fixas.
const BERRIES_DIR = new URL("../../data-source/atm-1.3.0/mods/Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/berries/", import.meta.url);
function berryOriginSets(): { all: string[]; mutation: Set<string>; world: Set<string> } {
  const all: string[] = [];
  const mutation = new Set<string>();
  const world = new Set<string>();
  for (const f of readdirSync(BERRIES_DIR).filter((x) => x.endsWith(".json"))) {
    const id = `cobblemon:${f.replace(/\.json$/, "")}`;
    const raw = JSON.parse(readFileSync(new URL(f, BERRIES_DIR), "utf8")) as { spawnConditions?: unknown[]; mutations?: Record<string, string> };
    all.push(id);
    if ((raw.spawnConditions ?? []).length > 0) world.add(id);
    for (const result of Object.values(raw.mutations ?? {})) mutation.add(result);
  }
  return { all, mutation, world };
}

async function itemTab(page: Page, cat: string) {
  await page.locator(`#item-tabs button[data-icat='${cat}']`).click();
  await expect(page.locator(`#item-tabs button[data-icat='${cat}']`)).toHaveAttribute("aria-selected", "true");
  await settle(page);
}
const originButton = (page: Page, label: RegExp) => page.locator(".item-origin-filter button", { hasText: label });
const gridIds = (page: Page) => page.locator("#item-grid .item-card").evaluateAll((els) => els.map((e) => e.getAttribute("data-item")!));
async function showLiechi(page: Page) {
  await card(page, "cobblemon:liechi_berry").evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }));
  await page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
  await settle(page);
}

test.describe("berry-mutations: origin tag and filter", () => {
  test("origin tags on berry cards only, in Berries, Iscas and search (CA-21..CA-24)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const sets = berryOriginSets();
    await openItems(page);
    await itemTab(page, "berry");
    const ids = await gridIds(page);
    expect(ids.slice().sort()).toEqual(sets.all.slice().sort());
    const expectedTags = sets.all.reduce((n, id) => n + (sets.mutation.has(id) ? 1 : 0) + (sets.world.has(id) ? 1 : 0), 0);
    await expect(page.locator("#item-grid .item-origin")).toHaveCount(expectedTags);
    for (const id of sets.all) {
      const want = [...(sets.mutation.has(id) ? ["mutation"] : []), ...(sets.world.has(id) ? ["world"] : [])];
      expect(await card(page, id).locator(".item-origin").evaluateAll((els) => els.map((e) => e.getAttribute("data-origin"))), id).toEqual(want);
    }
    await expect(card(page, "cobblemon:liechi_berry").locator(".item-origin")).toHaveText(["Mutação", "Mundo"]);
    const occa = card(page, "cobblemon:occa_berry");
    await expect(occa.locator(".item-names > *").first()).toHaveClass("tag item-tag");
    await expect(occa.locator(".item-tag")).toHaveText(/berries/i);
    const tagBox = (await occa.locator(".item-tag").boundingBox())!;
    const nameBox = (await occa.locator(".item-name").boundingBox())!;
    expect(tagBox.y + tagBox.height).toBeLessThanOrEqual(nameBox.y + 1);
    await itemTab(page, "bait");
    const baitIds = await gridIds(page);
    for (const id of baitIds) expect(await card(page, id).locator(".item-origins").count(), id).toBe(sets.all.includes(id) ? 1 : 0);
    await page.locator("#item-q").fill("ber");
    await settle(page);
    await expect(page.locator("#item-grid .item-card").first()).toBeVisible();
    for (const id of await gridIds(page)) expect(await card(page, id).locator(".item-origins").count(), id).toBe(sets.all.includes(id) ? 1 : 0);
    for (const [q, id] of [
      ["Red Apricorn", "cobblemon:red_apricorn"],
      ["Adamant Mint", "cobblemon:adamant_mint"],
      ["Golden Apple", "minecraft:golden_apple"],
    ] as const) {
      await page.locator("#item-q").fill(q);
      await expect(card(page, id)).toBeVisible();
      await expect(card(page, id).locator(".item-origins")).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });

  test("origin filter counts, Todos unchanged, empty state (CA-25..CA-27)", async ({ page }) => {
    test.setTimeout(DEV ? 300_000 : 120_000);
    const errors = trackConsoleErrors(page);
    const sets = berryOriginSets();
    await openItems(page);
    await expect(page.locator(".item-origin-filter")).toHaveAttribute("role", "group");
    await expect(page.locator(".item-origin-filter button")).toHaveCount(3);
    await expect(originButton(page, /^Todos$/)).toHaveAttribute("aria-pressed", "true");
    const cats = await page.locator("#item-tabs button[data-icat]").evaluateAll((els) => els.map((e) => e.getAttribute("data-icat")!));
    const before: Record<string, number> = {};
    for (const c of cats) {
      await itemTab(page, c);
      before[c] = Number(await page.locator("#item-grid").getAttribute("data-count"));
    }
    await itemTab(page, "bait");
    const baitIds = await gridIds(page);
    await itemTab(page, "berry");
    await originButton(page, /^Mutação$/).click();
    await expect(page.locator("#item-grid")).toHaveAttribute("data-count", String(sets.mutation.size));
    await originButton(page, /^Mundo$/).click();
    await expect(page.locator("#item-grid")).toHaveAttribute("data-count", String(sets.world.size));
    await expect(card(page, "cobblemon:liechi_berry")).toHaveCount(sets.world.has("cobblemon:liechi_berry") ? 1 : 0);
    await itemTab(page, "bait");
    await originButton(page, /^Mutação$/).click();
    await expect(page.locator("#item-grid")).toHaveAttribute("data-count", String(baitIds.filter((id) => sets.mutation.has(id)).length));
    await itemTab(page, "medicine");
    await expect(page.locator(".items-screen .empty-state")).toBeVisible();
    await expect(page.locator("#item-grid")).toHaveCount(0);
    await page.locator("#item-q").fill("zzzzqq");
    await originButton(page, /^Mundo$/).click();
    await expect(page.locator(".items-screen .empty-state")).toContainText('"zzzzqq"');
    await page.locator("#item-q").fill("");
    await originButton(page, /^Todos$/).click();
    for (const c of cats) {
      await itemTab(page, c);
      await expect(page.locator("#item-grid")).toHaveAttribute("data-count", String(before[c]));
    }
    expect(errors).toEqual([]);
  });

  test("filter, tab and search restored after opening an item and going back (CA-28)", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    const sets = berryOriginSets();
    await openItems(page);
    await itemTab(page, "berry");
    await originButton(page, /^Mutação$/).click();
    await page.locator(".item-card[data-item='cobblemon:sitrus_berry'] .item-link").click();
    await expect(page.locator(".item-body[data-item='cobblemon:sitrus_berry'] .item-hero")).toBeVisible();
    await page.goBack();
    await expect(originButton(page, /^Mutação$/)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#item-tabs button[data-icat='berry']")).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#item-grid")).toHaveAttribute("data-count", String(sets.mutation.size));
    await page.locator("#item-q").fill("ber");
    await originButton(page, /^Mundo$/).click();
    const count = await page.locator("#item-grid").getAttribute("data-count");
    await page.locator(".item-card[data-item='cobblemon:occa_berry'] .item-link").click();
    await expect(page.locator(".item-body[data-item='cobblemon:occa_berry'] .item-hero")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#item-q")).toHaveValue("ber");
    await expect(originButton(page, /^Mundo$/)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#item-grid")).toHaveAttribute("data-count", count!);
    expect(errors).toEqual([]);
  });

  for (const width of [360, 390, 1280]) {
    test(`Berries tab with Liechi visible, no overlap at ${width}px in PT and EN (CA-29/RF-44)`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await openItems(page, width, 800);
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        await itemTab(page, "berry");
        await showLiechi(page);
        await expectNoOverlap(page, "#item-grid");
        await page.locator("#main").evaluate((m) => m.scrollTo({ top: 0, behavior: "instant" }));
        await settle(page);
        await expectNoOverlap(page, ".items-screen .item-top");
        expect(await page.locator(".item-origin-filter").evaluate((e) => e.scrollHeight <= e.clientHeight + 1)).toBe(true);
      }
      expect(errors).toEqual([]);
    });
  }

  test("all themes: origin tag contrast >= 4.5, no overlap; keyboard reaches the filter and a crossbreed chip (CA-42/RNF-03)", async ({ page }) => {
    test.setTimeout(DEV ? 400_000 : 120_000);
    const errors = trackConsoleErrors(page);
    await openItems(page);
    for (const theme of THEME_IDS) {
      await writeDoc(page, "preferences", { schemaVersion: 1, theme, uiLanguage: "pt", termsLanguage: "pt", termsOverrides: {}, soundEnabled: false, reduceMotion: true });
      await page.reload();
      await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await go(page, "items");
      await itemTab(page, "berry");
      await showLiechi(page);
      const ratio = await card(page, "cobblemon:liechi_berry")
        .locator(".item-origin")
        .first()
        .evaluate((el) => {
          const parse = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
          const blend = (fg: number[], bg: number[]) => {
            const a = fg[3] ?? 1;
            return [0, 1, 2].map((i) => fg[i]! * a + bg[i]! * (1 - a));
          };
          // fundo efetivo: sobe pelos ancestrais ate achar cor opaca e compoe as camadas translucidas
          const layers: number[][] = [];
          for (let n: Element | null = el; n; n = n.parentElement) {
            const c = parse(getComputedStyle(n).backgroundColor);
            if (c.length && (c[3] ?? 1) > 0) {
              layers.push(c);
              if ((c[3] ?? 1) >= 1) break;
            }
          }
          let bg = [255, 255, 255];
          for (const l of layers.reverse()) bg = blend(l, bg);
          const fg = blend(parse(getComputedStyle(el).color), bg);
          const lum = (rgb: number[]) => {
            const [r, g, b] = rgb.map((v) => {
              const s = v / 255;
              return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
          };
          const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x);
          return (l1! + 0.05) / (l2! + 0.05);
        });
      expect(ratio, theme).toBeGreaterThanOrEqual(4.5);
      await expectNoOverlap(page, "#item-grid");
    }
    await page.locator("#main").evaluate((m) => m.scrollTo({ top: 0, behavior: "instant" }));
    await page.locator("#item-q").focus();
    let reached = false;
    for (let i = 0; i < 12 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await page.evaluate(() => !!document.activeElement?.closest(".item-origin-filter"));
    }
    expect(reached).toBe(true);
    expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).not.toBe("none");
    await page.keyboard.press("Enter");
    await page.locator(".item-card[data-item='cobblemon:lum_berry'] .item-link").click();
    await expect(page.locator(".item-body[data-item='cobblemon:lum_berry'] .item-hero")).toBeVisible();
    const chip = page.locator(".item-obtain [data-row='mutation'] button.mut-berry").first();
    await chip.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(chip).toBeFocused();
    expect(await chip.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe("solid");
    expect(errors).toEqual([]);
  });
});
