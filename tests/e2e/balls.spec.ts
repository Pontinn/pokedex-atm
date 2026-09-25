// F9.1: Pokebolas com o dataset REAL, headless, sem slowMo, sem esperas fixas. PW_DEV=1 PW_PORT=4175.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.BALLS_SHOTS_DIR;
type NavModule = typeof import("../../src/navigation/navigation-store");
const NAV_URL = "/src/navigation/navigation-store.ts";

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function go(page: Page, screen: "balls" | "settings") {
  await page.evaluate(
    async ({ url, screen }) => {
      const nav = (await import(/* @vite-ignore */ url)) as NavModule;
      nav.useNavigationStore.getState().navigate(screen);
    },
    { url: NAV_URL, screen },
  );
}

async function openBalls(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await go(page, "balls");
  await expect(page.locator("#ball-grid .ball-card").first()).toBeVisible({ timeout: 30_000 });
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await page.locator(".tgl-lang:visible").first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

async function datasetBallCount(page: Page): Promise<number> {
  return page.evaluate(async () => {
    const { datasetVersion } = (await (await fetch("/data/current.json")).json()) as { datasetVersion: string };
    return ((await (await fetch(`/data/${datasetVersion}/balls.json`)).json()) as unknown[]).length;
  });
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test("F9.1 all balls, textures, filters, PT/EN search with AND, restore on back, item page", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await openBalls(page);
  const total = await datasetBallCount(page);
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(total);
  const great = page.locator('.ball-card[data-ball="great_ball"]');
  await expect(great.locator(".ball-mult")).toHaveText("1.5x");
  await expect(great.locator("small")).toHaveText("Great Ball");
  expect(await great.locator("img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.ball-card[data-ball="master_ball"] .ball-mult')).toHaveText("Garantida");
  await expect(page.locator('.ball-card[data-ball="heavy_ball"] .ball-mult')).toHaveText("1x a 4x");
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/balls-1280.png` });

  const q = page.locator("#ball-q");
  await q.fill("dusk");
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(1);
  await expect(page.locator('.ball-card[data-ball="dusk_ball"]')).toBeVisible();
  await q.fill("crepusculo");
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(1);
  await expect(page.locator('.ball-card[data-ball="dusk_ball"]')).toBeVisible();

  await q.fill("bola");
  await page.locator(".ball-filters button", { hasText: "Água" }).click();
  const n = await page.locator("#ball-grid .ball-card").count();
  expect(n).toBeGreaterThan(0);
  for (const name of await page.locator("#ball-grid .ball-name-main").allTextContents()) expect(name.toLowerCase()).toContain("bola");
  await q.fill("zzzzqq");
  await expect(page.locator(".balls-screen .empty-state")).toContainText('"zzzzqq"');

  await q.fill("");
  await page.locator(".ball-filters button", { hasText: "Todas" }).click();
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(total);

  await q.fill("dusk");
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(1);
  await go(page, "settings");
  await page.goBack();
  await expect(page.locator("#ball-q")).toHaveValue("dusk");
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(1);
  await page.locator(".list-search-clear").click();
  await expect(page.locator("#ball-grid .ball-card")).toHaveCount(total);

  await page.locator('.ball-card[data-ball="dusk_ball"]').click();
  await expect(page.locator(".screen[data-screen='item']")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const lang of ["pt", "en"] as const) {
  for (const width of [360, 390, 1280]) {
    test(`F9.1 no overlap ${lang} ${width}px`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await openBalls(page, width, 800);
      await setLanguage(page, lang);
      await expectNoOverlap(page, ".balls-screen .page-head");
      await expectNoOverlap(page, ".balls-screen .list-top");
      await expectNoOverlap(page, ".balls-screen .page-tools");
      await expectNoOverlap(page, "#ball-grid");
      await page.locator("#ball-q").fill("zzzzqq");
      await expectNoOverlap(page, ".balls-screen .empty-state");
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/balls-${lang}-${width}.png` });
      expect(errors).toEqual([]);
    });
  }
}
