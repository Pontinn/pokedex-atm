// F2.1/F2.2: Home com o dataset REAL publicado (public/data/current.json), headless, sem slowMo, sem esperas fixas.
// So os sons sao servidos vazios (evita decodificar .ogg a cada clique).
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.HOME_SHOTS_DIR;

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function waitBooted(page: Page) {
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator(".home-screen")).toBeVisible();
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

async function openHome(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await waitBooted(page);
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const toggle = page.locator(".tgl-lang:visible").first();
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

async function search(page: Page, q: string) {
  const input = page.locator("#search-input");
  await input.fill(q);
  await expect(page.locator(".search-dd")).toHaveClass(/open/);
}

const firstItem = (page: Page) => page.locator(".search-dd .dd-item").first();

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test.describe("F2.1 search", () => {
  test("dex numbers 25, 025, 0025, #25 find Pikachu", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openHome(page);
    for (const q of ["25", "025", "0025", "#25"]) {
      await search(page, q);
      await expect(page.locator(".search-dd .dd-item")).toHaveCount(1);
      await expect(firstItem(page)).toHaveAttribute("data-dex", "25");
      await expect(firstItem(page).locator(".dd-name")).toHaveText("Pikachu");
      await expect(firstItem(page).locator(".dex-num")).toHaveText("#0025");
      await expect(firstItem(page).locator(".chip")).toHaveCount(1);
    }
    await search(page, "6");
    await expect(firstItem(page).locator(".dd-name")).toHaveText("Charizard");
    expect(errors).toEqual([]);
  });

  test("pantano (PT name) finds Quagsire and shows the EN name with the UI in English", async ({ page }) => {
    await openHome(page);
    await search(page, "pantano");
    await expect(firstItem(page)).toHaveAttribute("data-dex", "195");
    await expect(firstItem(page).locator(".dd-name")).toHaveText("Pântano");
    await setLanguage(page, "en");
    await page.locator("#search-input").fill("");
    await search(page, "pântano");
    await expect(firstItem(page)).toHaveAttribute("data-dex", "195");
    await expect(firstItem(page).locator(".dd-name")).toHaveText("Quagsire");
    await expect(firstItem(page).locator(".chip")).toHaveText(["Water", "Ground"]);
  });

  test("partial and accent-insensitive text, prefix ranked first, max 8 results", async ({ page }) => {
    await openHome(page);
    await search(page, "charizar");
    await expect(firstItem(page).locator(".dd-name")).toHaveText("Charizard");
    await search(page, "a");
    await expect(page.locator(".search-dd .dd-item")).toHaveCount(8);
    await search(page, "char");
    // dataset real: 7 especies com "char" (Charmander, Charmeleon, Charizard, Charjabug, Charcadet + substrings)
    await expect(page.locator(".search-dd .dd-item")).toHaveCount(7);
    await expect(page.locator(".search-dd .dd-item .dd-name").nth(0)).toHaveText("Charmander");
    await expect(page.locator(".search-dd .dd-item .dd-name").nth(1)).toHaveText("Charmeleon");
    await expect(page.locator(".search-dd .dd-item .dd-name").nth(2)).toHaveText("Charizard");
    // sprite local 96px carregado de verdade
    const sprite = firstItem(page).locator("img").first();
    await expect(sprite).toHaveAttribute("src", "/assets/sprites/4.png");
    await expect.poll(() => sprite.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  });

  test("custom species by name and number, placeholder sprite", async ({ page }) => {
    await openHome(page);
    await search(page, "creepyon");
    await expect(firstItem(page)).toHaveAttribute("data-dex", "9902");
    await expect(firstItem(page).locator("img.sprite-fallback")).toHaveCount(1);
    await search(page, "9902");
    await expect(firstItem(page).locator(".dd-name")).toHaveText("Creepyon");
  });

  test("no results shows the inline empty state; # alone and 000 find nothing", async ({ page }) => {
    await openHome(page);
    await search(page, "zzzzqq");
    await expect(page.locator(".search-dd .dd-empty")).toHaveText('Nenhum Pokémon encontrado para "zzzzqq"');
    await expect(page.locator(".search-dd .dd-item")).toHaveCount(0);
    for (const q of ["#", "000"]) {
      await search(page, q);
      await expect(page.locator(".search-dd .dd-empty")).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(page.locator(".search-dd")).not.toHaveClass(/open/);
  });

  test("Enter opens the first result, click opens the picked one, Back restores the query", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openHome(page);
    await search(page, "charizar");
    await page.locator("#search-input").press("Enter");
    await expect(page.locator("[data-placeholder='detail']")).toBeVisible();
    await page.goBack();
    await expect(page.locator(".home-screen")).toBeVisible();
    await expect(page.locator("#search-input")).toHaveValue("charizar");
    await search(page, "gengar");
    await page.locator(".search-dd .dd-item[data-dex='94']").click();
    await expect(page.locator("[data-placeholder='detail']")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("ArrowDown + Enter opens the second result", async ({ page }) => {
    await openHome(page);
    await search(page, "char");
    await page.locator("#search-input").press("ArrowDown");
    await expect(page.locator(".search-dd .dd-item").nth(1)).toHaveClass(/active/);
    await page.locator("#search-input").press("Enter");
    await expect(page.locator("[data-placeholder='detail']")).toBeVisible();
  });

  test("random and open-dex buttons navigate", async ({ page }) => {
    await openHome(page);
    await page.locator("#btn-random").click();
    await expect(page.locator("[data-placeholder='detail']")).toBeVisible();
    await page.goBack();
    await page.locator("#btn-open-dex").click();
    await expect(page.locator("[data-placeholder='dex']")).toBeVisible();
  });

  for (const width of [360, 390, 1280]) {
    for (const lang of ["pt", "en"] as const) {
      test(`no overlap in hero and open dropdown at ${width}px (${lang})`, async ({ page }) => {
        await openHome(page, width, 844);
        await setLanguage(page, lang);
        await expectNoOverlap(page, ".hero");
        await search(page, "char");
        await expectNoOverlap(page, ".search-dd");
        await search(page, "zzzzqq");
        await expectNoOverlap(page, ".search-dd");
        await search(page, "creepyon");
        await expectNoOverlap(page, ".search-dd");
        if (SHOTS) {
          await search(page, "char");
          await expect(firstItem(page).locator(".dd-name")).toHaveText("Charmander");
          await page.screenshot({ path: `${SHOTS}/f21-search-${width}-${lang}.png` });
        }
      });
    }
  }
});
