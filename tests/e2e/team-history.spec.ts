// T1 (Sprint T1, matriz "team-history.spec.ts"): time e historico com o dataset REAL, headless, sem slowMo, sem
// esperas fixas. O aviso do 7o Pokemon no time e a persistencia apos reload (time com 6 e historico com poucas
// entradas) ja estao cobertos em tests/e2e/home.spec.ts ("remove from team with undo; 7th add warns and does not
// add", "seeded data renders, persists across reload..."). Este arquivo cobre o que faltava: o historico com MAIS
// de 20 visitas reais pela UI corta em 20 (o mais antigo cai fora), com reload mantendo o corte.
import { expect, test, type Page } from "@playwright/test";

async function boot(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

async function openDetail(page: Page, dex: number) {
  if (!(await page.locator(".home-screen").isVisible().catch(() => false))) {
    await page.locator('[data-nav="home"]:visible').first().click();
    await expect(page.locator(".home-screen")).toBeVisible();
  }
  await page.locator("#search-input").fill(String(dex));
  const item = page.locator(`.search-dd .dd-item[data-dex='${dex}']`);
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator(`.detail-screen[data-dex='${dex}'] .hero-card`)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
});

test("21 different fiches viewed via the UI: history keeps only the 20 most recent, oldest drops, survives reload", async ({ page }) => {
  test.setTimeout(120_000);
  await boot(page);
  const dexes = Array.from({ length: 21 }, (_, i) => i + 1); // 1..21
  for (const dex of dexes) await openDetail(page, dex);
  await page.locator('[data-nav="home"]:visible').first().click();
  await expect(page.locator(".home-screen")).toBeVisible();
  const items = () => page.locator("#history-row .hist");
  await expect(items()).toHaveCount(20);
  // mais recente primeiro (dex 21), o mais antigo (dex 1) nao aparece mais
  await expect(items().first()).toHaveAttribute("data-dex", "21");
  await expect(page.locator("#history-row .hist[data-dex='1']")).toHaveCount(0);
  await expect(page.locator("#history-row .hist[data-dex='2']")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
  await expect(items()).toHaveCount(20);
  await expect(items().first()).toHaveAttribute("data-dex", "21");
  await expect(page.locator("#history-row .hist[data-dex='1']")).toHaveCount(0);
});
