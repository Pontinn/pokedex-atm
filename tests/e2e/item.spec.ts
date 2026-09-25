// F9.3: pagina do item com o dataset REAL, headless, sem slowMo, sem esperas fixas. PW_DEV=1 PW_PORT=4175.
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const SHOTS = process.env.ITEM_SHOTS_DIR;
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

async function boot(page: Page, width = 1280, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
}

async function nav(page: Page, screen: string, params?: unknown) {
  await page.evaluate(
    async ({ url, screen, params }) => {
      const mod = (await import(/* @vite-ignore */ url)) as NavModule;
      (mod.useNavigationStore.getState().navigate as (s: string, p?: unknown) => void)(screen, params);
    },
    { url: NAV_URL, screen, params },
  );
}

async function openItem(page: Page, itemId: string) {
  await nav(page, "item", { itemId });
  await expect(page.locator(`.item-body[data-item="${itemId}"] .item-hero`)).toBeVisible({ timeout: 30_000 });
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await page.locator(".tgl-lang:visible").first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

const mainScroll = (page: Page) => page.locator("#main").evaluate((m) => m.scrollTop);

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
});

test("F9.3 Potion page: hero, honest obtain, used in effect, terms toggle", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openItem(page, "cobblemon:potion");
  const hero = page.locator(".item-hero");
  await expect(hero.locator("h2")).toHaveText("Poção");
  await expect(hero.locator(".item-alt")).toHaveText("Potion");
  await expect(hero.locator(".badge")).toHaveText(/medicina/i);
  await expect(hero.locator(".item-hero-desc")).toHaveText("Restaura 20 PV de um Pokémon");
  const img = hero.locator(".item-hero-tile img");
  await expect(img).toHaveCSS("image-rendering", "pixelated");
  expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  const obtain = page.locator(".item-obtain");
  await expect(obtain.locator(".ob-row[data-row='craftable']")).toContainText("Sim, tem receita");
  await expect(obtain.locator(".ob-row[data-row='structureLoot'] .biome")).toHaveText(["Blocks (potion)"]);
  await expect(page.locator(".item-used .ob-row[data-row='effect']")).toContainText("Restaura 20 PV");
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/item-potion-1280.png` });
  await page.locator('.terms-tgl[data-tcard="itempage"] [data-tl="en"]').click();
  await expect(hero.locator("h2")).toHaveText("Potion");
  await expect(hero.locator(".item-hero-desc")).toHaveText("Restaura 20 PV de um Pokémon");
  expect(errors).toEqual([]);
});

test("F9.3 Fire Stone used in evolutions, chips open the entry; no route; unknown item; ball", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await openItem(page, "cobblemon:fire_stone");
  const evo = page.locator(".item-used .ob-row[data-row='evolutions']");
  await expect(evo).toContainText("Evolui");
  const pairs = await evo
    .locator(".evo-pair")
    .evaluateAll((els) => els.map((e) => [...e.querySelectorAll(".mon-chip span")].map((s) => s.textContent).join(" -> ")));
  for (const p of ["Eevee -> Flareon", "Vulpix -> Ninetales", "Growlithe -> Arcanine"]) expect(pairs).toContain(p);
  await expect(page.locator(".item-obtain .ob-row[data-row='drop'] .mon-chip b").first()).toHaveText(/%$/);
  await evo.locator(".mon-chip[data-dex='133']").click();
  await expect(page.locator(".detail-screen[data-dex='133']")).toBeVisible();
  await page.goBack();
  await expect(page.locator(".item-body[data-item='cobblemon:fire_stone']")).toBeVisible();

  await openItem(page, "allthemodium:allthemodium_ingot");
  await expect(page.locator(".item-obtain .ob-none")).toContainText("Sem rota confirmada");

  await openItem(page, "othermod:strange_widget");
  await expect(page.locator(".item-hero h2")).toHaveText("Strange widget");
  await expect(page.locator(".item-hero .badge")).toHaveText(/item de outro mod/i);
  await expect(page.locator(".item-hero .item-hero-tile img")).toHaveCount(0);
  await expect(page.locator(".item-obtain .ob-none")).toBeVisible();

  await openItem(page, "cobblemon:dusk_ball");
  await expect(page.locator(".item-used .ob-row[data-row='ball']")).toContainText("Multiplicador de captura");
  await page.locator(".item-screen .detail-back").click();
  await expect(page.locator(".item-body[data-item='othermod:strange_widget']")).toBeVisible();
  expect(errors).toEqual([]);
});

test("F9.3 Charizard > TM moves > scroll > item > Back restores tab, scroll and open rows", async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await boot(page);
  await nav(page, "detail", { dex: 6 });
  const panel = page.locator("#moves-panel");
  await expect(panel).toBeVisible({ timeout: 30_000 });
  await panel.locator("#move-tabs [data-mtab='tm']").click();
  await expect(panel.locator("#move-tabs [data-mtab='tm']")).toHaveClass(/active/);
  const eq = panel.locator(".mv-row[data-mv='earthquake']");
  await eq.click();
  await expect(eq).toHaveClass(/open/);
  await page.locator("#main").evaluate((m) => m.scrollTo({ top: m.scrollTop + 700, behavior: "instant" }));
  const saved = await mainScroll(page);
  expect(saved).toBeGreaterThan(0);
  // A ficha do Charizard ainda nao tem item clicavel (formas e melhor bola sao F5): o item e aberto pela pilha, como um clique.
  await openItem(page, "cobblemon:potion");
  await page.goBack();
  await expect(panel.locator("#move-tabs [data-mtab='tm']")).toHaveClass(/active/);
  await expect(panel.locator(".mv-row[data-mv='earthquake']")).toHaveClass(/open/);
  await expect.poll(async () => Math.abs((await mainScroll(page)) - saved)).toBeLessThanOrEqual(2);
  expect(errors).toEqual([]);
});

for (const lang of ["pt", "en"] as const) {
  for (const width of [360, 390, 1280]) {
    test(`F9.3 no overlap ${lang} ${width}px`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      await boot(page, width, 800);
      await setLanguage(page, lang);
      for (const id of ["cobblemon:fire_stone", "cobblemon:potion", "othermod:strange_widget"]) {
        await openItem(page, id);
        await expectNoOverlap(page, ".item-screen");
      }
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/item-${lang}-${width}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });
  }
}
