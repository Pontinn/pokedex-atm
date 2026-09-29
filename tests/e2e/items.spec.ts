// F9.2: Itens & Comidas com o dataset REAL, headless, sem slowMo, sem esperas fixas. PW_DEV=1 PW_PORT=4175.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.ITEMS_SHOTS_DIR;

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
