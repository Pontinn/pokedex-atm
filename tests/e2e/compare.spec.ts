// F7.1: Comparar com o dataset REAL, headless, sem slowMo, sem esperas fixas. PW_DEV=1 PW_PORT=4175.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.COMPARE_SHOTS_DIR;

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function boot(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

// Navegacao por interacao real de UI (busca da Home + sidebar/tabbar): funciona em dev e em build+preview, nao
// depende de "/src/..." em page.evaluate (so existe no dev server).
async function openDetail(page: Page, dex: number) {
  if (!(await page.locator(".home-screen").isVisible().catch(() => false))) {
    await page.locator('[data-nav="home"]:visible').first().click();
    await expect(page.locator(".home-screen")).toBeVisible();
  }
  await page.locator("#search-input").fill(String(dex));
  const item = page.locator(`.search-dd .dd-item[data-dex='${dex}']`);
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator(`.detail-screen[data-dex='${dex}']`)).toBeVisible();
}

/** Visita cada dex pela busca real (empurra o historico de verdade, mais antigo primeiro) e abre Comparar. */
async function openCompare(page: Page, history: number[]) {
  for (const dex of history) {
    await openDetail(page, dex);
    await page.goBack();
    await expect(page.locator(".home-screen")).toBeVisible();
  }
  await page.locator('[data-nav="compare"]:visible').first().click();
  await expect(page.locator(".compare-screen")).toBeVisible({ timeout: 30_000 });
}

async function navigate(page: Page, screen: "settings") {
  await page.locator(`[data-nav="${screen}"]:visible`).first().click();
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await page.locator(".tgl-lang:visible").first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

const side = (page: Page, s: "left" | "right") => page.locator(`.cmp-poke[data-side="${s}"]`);
const values = (page: Page, cls: string) => page.locator(`.cmp-row .v${cls}`).allTextContents();

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test("F7.1 last 2 of history, mirrored stats with winners, swap keeps scroll, change via search, back restores", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page, 1280, 520);
  await openCompare(page, [448, 6]);
  await expect(side(page, "left").locator("h3")).toHaveText("Charizard");
  await expect(side(page, "right").locator("h3")).toHaveText("Lucario");
  await expect(side(page, "left").locator(".chip")).toHaveText(["Fogo", "Voador"]);
  await expect(side(page, "left").locator(".dex-num")).toHaveText("#0006");
  await expect.poll(() => values(page, ":not(.r)")).toEqual(["78", "84", "78", "109", "85", "100", "534"]);
  expect(await values(page, ".r")).toEqual(["70", "110", "70", "115", "70", "90", "525"]);
  expect(await page.locator(".cmp-row .v.win:not(.r)").allTextContents()).toEqual(["78", "78", "85", "100", "534"]);
  expect(await page.locator(".cmp-row .v.r.win").allTextContents()).toEqual(["110", "115"]);
  if (SHOTS) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: `${SHOTS}/compare-1280.png` });
    await page.setViewportSize({ width: 1280, height: 520 });
  }

  // swap: inverte os lados sem navegar e sem perder o scroll
  const entry = await page.locator(".screen").getAttribute("data-entry-id");
  await page.locator("#main").evaluate((m) => m.scrollTo({ top: m.scrollHeight, behavior: "instant" }));
  const before = await page.locator("#main").evaluate((m) => m.scrollTop);
  expect(before).toBeGreaterThan(0);
  await page.locator("#cmp-swap").click();
  await expect(side(page, "left").locator("h3")).toHaveText("Lucario");
  await expect(side(page, "right").locator("h3")).toHaveText("Charizard");
  await expect(page.locator(".screen")).toHaveAttribute("data-entry-id", entry ?? "");
  expect(Math.abs((await page.locator("#main").evaluate((m) => m.scrollTop)) - before)).toBeLessThanOrEqual(2);
  await expect.poll(() => values(page, ":not(.r)")).toEqual(["70", "110", "70", "115", "70", "90", "525"]);

  // trocar o Pokemon da direita pela mesma busca da Home
  await page.locator("#main").evaluate((m) => m.scrollTo({ top: 0, behavior: "instant" }));
  await side(page, "right").locator(".cmp-change").click();
  await page.locator("#cmp-q-right").fill("pantano");
  await page.locator(".cmp-search .dd-item[data-dex='195']").click();
  await expect(side(page, "right").locator("h3")).toHaveText("Pântano");
  await expect(page.locator(".cmp-search")).toHaveCount(0);

  // mesmo Pokemon dos dois lados: permitido, sem .win
  await side(page, "right").locator(".cmp-change").click();
  await page.locator("#cmp-q-right").fill("448");
  await page.locator("#cmp-q-right").press("Enter");
  await expect(side(page, "right").locator("h3")).toHaveText("Lucario");
  await expect.poll(() => values(page, ".r")).toEqual(["70", "110", "70", "115", "70", "90", "525"]);
  await expect(page.locator(".cmp-row .win")).toHaveCount(0);

  // Voltar restaura os lados
  await navigate(page, "settings");
  await page.goBack();
  await expect(side(page, "left").locator("h3")).toHaveText("Lucario");
  await expect(side(page, "right").locator("h3")).toHaveText("Lucario");
  expect(errors).toEqual([]);
});

test("F7.1 empty history: both sides ask for a Pokemon; picking one fills that side", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openCompare(page, []);
  await expect(page.locator(".cmp-empty")).toHaveCount(2);
  await expect(side(page, "left")).toContainText("Escolha um Pokémon");
  await expect(page.locator(".cmp-row .v").first()).toHaveText("-");
  await side(page, "left").locator(".cmp-change").click();
  await page.locator("#cmp-q-left").fill("charizard");
  await page.locator("#cmp-q-left").press("Enter");
  await expect(side(page, "left").locator("h3")).toHaveText("Charizard");
  await expect(side(page, "right").locator(".cmp-empty")).toBeVisible();
  await expect(page.locator(".cmp-row .win")).toHaveCount(0);
  expect(errors).toEqual([]);
});

for (const lang of ["pt", "en"] as const) {
  for (const width of [360, 390, 1280]) {
    test(`F7.1 no overlap ${lang} ${width}px`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width, 800);
      await setLanguage(page, lang);
      await openCompare(page, [448, 6]);
      await expect(side(page, "right").locator("h3")).toHaveText("Lucario");
      await expectNoOverlap(page, ".compare-screen");
      await side(page, "left").locator(".cmp-change").click();
      await page.locator("#cmp-q-left").fill("mew");
      await expect(page.locator(".cmp-search .search-dd.open")).toBeVisible();
      await expectNoOverlap(page, ".cmp-search");
      await page.locator("#cmp-q-left").press("Escape");
      await expect(page.locator(".cmp-search")).toHaveCount(0);
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/compare-${lang}-${width}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test("F7.1 no overlap with empty sides (360px, PT and EN)", async ({ page }) => {
  await boot(page, 360, 800);
  await openCompare(page, []);
  await expectNoOverlap(page, ".compare-screen");
  await setLanguage(page, "en");
  await expectNoOverlap(page, ".compare-screen");
});
