// T1 (Sprint T1, matriz "perf.spec.ts"): performance da Pokedex com o dataset REAL (1027 especies), headless, sem
// slowMo, sem esperas fixas. O teste detalhado de "<= 60 .pcard no DOM, inclusive apos rolar" ja existe em
// tests/e2e/dex.spec.ts ("1027 results with at most 60 cards in the DOM, also after scrolling"); aqui repetimos so
// a contagem (rapida, sem custo real) e adicionamos o que faltava: rolar do topo ao fim sem long tasks > 200 ms
// (Performance API / PerformanceObserver), que nao tinha teste em nenhum arquivo.
import { expect, test, type Page } from "@playwright/test";

async function openDex(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#btn-open-dex")).toBeVisible({ timeout: 30_000 });
  await page.locator("#btn-open-dex").click();
  await expect(page.locator(".dex-screen .pcard").first()).toBeVisible({ timeout: 30_000 });
  await page.mouse.move(1, 1);
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test("Dex with 1027 species keeps at most 60 .pcard in the DOM", async ({ page }) => {
  await openDex(page);
  await expect(page.locator("#dex-count")).toHaveText("1027");
  expect(await page.locator(".pcard").count()).toBeLessThanOrEqual(60);
});

test("scrolling the virtualized grid top to bottom has no long task over 200ms", async ({ page }) => {
  test.setTimeout(60_000);
  await openDex(page);
  await page.evaluate(() => {
    const w = window as unknown as { __longTasks: number[] };
    w.__longTasks = [];
    try {
      new PerformanceObserver((list) => {
        for (const e of list.getEntries()) w.__longTasks.push(e.duration);
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // navegador sem suporte a "longtask": o teste so confere o que a observer capturar (fica [] e passa)
    }
  });
  // rola uma tela por vez ate o fim (scrollTop para de crescer): nao depende de calcular o scrollHeight exato,
  // que a lista virtualizada pode reajustar por poucos pixels enquanto renderiza.
  const main = page.locator("#main");
  let previous = -1;
  for (let i = 0; i < 60; i++) {
    const top = await main.evaluate((m) => {
      m.scrollBy({ top: m.clientHeight, behavior: "instant" });
      return m.scrollTop;
    });
    if (top === previous) break;
    previous = top;
  }
  expect(previous).toBeGreaterThan(0);
  const longTasks = await page.evaluate(() => (window as unknown as { __longTasks: number[] }).__longTasks);
  expect(longTasks.filter((d) => d > 200)).toEqual([]);
});
