// F1.4: shell desktop/mobile, boot, sons e reduzir animacoes (Playwright headless, sem slowMo, sem esperas fixas).
// Nao depende do dataset real: /data/** e /assets/sfx/** sao servidos por rotas com a fixture de tests/fixtures/ui-shell.
import { expect, test, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import { TYPE_IDS, typeChartMatrix } from "../../src/domain/type-chart";
import { expectNoOverlap, findOverlaps } from "../harness/no-overlap";

const manifest = JSON.parse(readFileSync(new URL("../fixtures/ui-shell/manifest.json", import.meta.url), "utf8")) as { datasetVersion: string };
const VER = manifest.datasetVersion;
const SHOTS = process.env.SHELL_SHOTS_DIR;

interface DataOptions {
  missing?: boolean;
  /** segura o manifesto ate o teste liberar */
  hold?: Promise<void>;
}

async function mockData(page: Page, opts: DataOptions = {}) {
  // predicado por pathname: um glob "**/data/**" tambem pegaria os modulos do Vite em /src/data/
  await page.route((url) => url.pathname.startsWith("/data/"), async (route: Route) => {
    const path = new URL(route.request().url()).pathname;
    if (opts.missing) return route.fulfill({ status: 404, body: "not found" });
    if (path === "/data/current.json") return route.fulfill({ json: { datasetVersion: VER } });
    if (path === `/data/${VER}/dataset-manifest.json`) {
      if (opts.hold) await opts.hold;
      return route.fulfill({ json: manifest });
    }
    if (path === `/data/${VER}/species-index.json`) return route.fulfill({ json: [] });
    // a tela real de Treinadores (F8) carrega series.json ao abrir
    if (path === `/data/${VER}/series.json`) return route.fulfill({ json: [] });
    if (path === `/data/${VER}/type-chart.json`) return route.fulfill({ json: { attackers: TYPE_IDS, matrix: typeChartMatrix() } });
    return route.fulfill({ status: 404, body: "not found" });
  });
  // os .ogg sao publicados pela Onda 2; aqui basta responder algo
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
}

/** Espiao de som: registra o src de cada play() (sem tocar audio de verdade). */
async function spyAudio(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __played: string[] };
    w.__played = [];
    HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
      w.__played.push(new URL(this.src).pathname);
      return Promise.resolve();
    };
  });
}

const played = (page: Page) => page.evaluate(() => (window as unknown as { __played: string[] }).__played);

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function openApp(page: Page, width: number, height = 800) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 15_000 });
}

test.describe("boot splash", () => {
  test("lid stays closed while the dataset loads, then plays pokedex_open and opens", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await spyAudio(page);
    let release!: () => void;
    await mockData(page, { hold: new Promise<void>((r) => (release = r)) });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const boot = page.locator(".boot");
    await expect(boot).toHaveAttribute("data-phase", "closed");
    await expect(page.locator(".boot-sub")).toHaveText("Carregando dados...");
    await expect(page.locator(".boot-title")).toHaveText("Pontindex");
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/mobile-boot-lid-closed.png` });
    expect(await played(page)).toEqual([]);
    release();
    await expect.poll(() => played(page)).toContain("/assets/sfx/pokedex_open.ogg");
    await expect(boot).toHaveCount(0, { timeout: 15_000 });
    expect((await played(page)).filter((s) => s.endsWith("pokedex_open.ogg"))).toHaveLength(1);
    expect(errors).toEqual([]);
  });

  test("missing dataset opens the lid and shows the error with retry", async ({ page }) => {
    await mockData(page, { missing: true });
    await openApp(page, 1280);
    const alert = page.locator("#main [role='alert']");
    await expect(alert).toContainText("npm run dataset");
    await expect(alert.getByRole("button", { name: "Tentar de novo" })).toBeVisible();
    await expect(page.locator(".sidebar-version")).toHaveText("Dados: indisponíveis");
  });
});

test.describe("desktop shell", () => {
  test("sidebar, data version, navigation sound and no console errors", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await spyAudio(page);
    await mockData(page);
    await openApp(page, 1280);
    await expect(page.locator(".sidebar")).toBeVisible();
    await expect(page.locator(".tabbar")).toBeHidden();
    await expect(page.locator(".topbar")).toBeHidden();
    await expect(page.locator("main#main")).toBeVisible();
    await expect(page.locator(".sidebar-version")).toHaveText("Dados: All the Mons 1.3.0 / Cobblemon 1.7.3");
    await expect(page.locator(".sidebar .nav-item")).toHaveText([
      "Início", "Pokédex", "Capturados", "Comparar", "Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações",
    ]);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/desktop-shell.png`, mask: [page.locator("#main")] });
    const before = (await played(page)).length;
    await page.locator(".sidebar .nav-item", { hasText: "Treinadores" }).click();
    await expect(page.locator(".trainers-screen")).toBeVisible();
    await expect(page.locator(".sidebar .nav-item.active")).toHaveText("Treinadores");
    const after = (await played(page)).slice(before);
    expect(after).toEqual(["/assets/sfx/pokedex_click_short.ogg"]);
    // Voltar do navegador (popstate) volta para a Home
    await page.goBack();
    await expect(page.locator(".home-screen")).toBeVisible();
    // Sincronizar e lazy: carrega e renderiza
    await page.locator(".sidebar .nav-item", { hasText: "Sincronizar" }).click();
    await expect(page.locator(".sync-screen")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("sound toggle off silences UI sounds", async ({ page }) => {
    await spyAudio(page);
    await mockData(page);
    await openApp(page, 1280);
    await page.locator(".sidebar .tgl-sound").click();
    await expect(page.locator(".sidebar .tgl-sound")).toHaveClass(/off/);
    const before = (await played(page)).length;
    await page.locator(".sidebar .nav-item", { hasText: "Pokédex" }).click();
    await expect(page.locator(".dex-screen")).toBeVisible();
    expect((await played(page)).length).toBe(before);
  });
});

test.describe("reduce motion", () => {
  test("system preference applies html.reduce-motion and zeroes the watermark animation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockData(page);
    await openApp(page, 1280);
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);
    const duration = await page.locator(".watermark").evaluate((el) => getComputedStyle(el).animationDuration);
    expect(duration).toBe("0.001s");
  });

  test("without the preference the watermark keeps its 60s spin", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await mockData(page);
    await openApp(page, 1280);
    await expect(page.locator("html")).not.toHaveClass(/reduce-motion/);
    const duration = await page.locator(".watermark").evaluate((el) => getComputedStyle(el).animationDuration);
    expect(duration).toBe("60s");
  });
});

test.describe("mobile shell", () => {
  test("topbar, tab bar and the Mais sheet", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await mockData(page);
    await openApp(page, 390, 844);
    await expect(page.locator(".sidebar")).toBeHidden();
    await expect(page.locator(".topbar")).toBeVisible();
    await expect(page.locator(".tabbar .tab-label")).toHaveText(["Início", "Pokédex", "Capturados", "Comparar", "Mais"]);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/mobile-shell.png`, mask: [page.locator("#main")] });
    await page.locator(".tabbar .tab-more").click();
    const sheet = page.locator(".more-sheet");
    await expect(sheet).toHaveClass(/open/);
    await expect(sheet.locator(".sheet-item-label")).toHaveText(["Treinadores", "Pokébolas", "Itens & Comidas", "Sincronizar", "Configurações"]);
    await expect(sheet.locator(".sheet-panel")).toBeInViewport({ ratio: 1 });
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/mobile-nav-mais-sheet.png` });
    await sheet.locator(".sheet-item", { hasText: "Configurações" }).click();
    await expect(sheet).not.toHaveClass(/open/);
    await expect(page.locator(".settings-screen")).toBeVisible();
    await expect(page.locator(".tabbar .tab-more")).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });

  test("resizing across 900 px switches layouts", async ({ page }) => {
    await mockData(page);
    await openApp(page, 1280);
    await expect(page.locator("#app")).not.toHaveClass(/mobile/);
    await page.setViewportSize({ width: 899, height: 800 });
    await expect(page.locator("#app")).toHaveClass(/mobile/);
    await page.setViewportSize({ width: 900, height: 800 });
    await expect(page.locator("#app")).not.toHaveClass(/mobile/);
  });
});

test.describe("no-overlap helper has teeth", () => {
  test("detects a button placed over a nav label", async ({ page }) => {
    await mockData(page);
    await openApp(page, 1280);
    expect(await findOverlaps(page, ".sidebar")).toEqual([]);
    await page.locator(".sidebar .nav-item").nth(1).evaluate((item) => {
      const r = item.querySelector(".nav-label")!.getBoundingClientRect();
      const btn = document.createElement("button");
      btn.className = "tgl";
      btn.style.cssText = `position:fixed;left:${r.left + 4}px;top:${r.top}px;width:30px;height:20px;z-index:5`;
      item.closest(".sidebar")!.appendChild(btn);
    });
    const issues = await findOverlaps(page, ".sidebar");
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]!.a).toContain("Pokédex");
  });
});

test.describe("no text overlap in the shell (PT and EN)", () => {
  for (const width of [360, 390, 1280]) {
    for (const lang of ["pt", "en"] as const) {
      test(`${width}px ${lang.toUpperCase()}`, async ({ page }) => {
        await mockData(page);
        await openApp(page, width, 800);
        const mobile = width < 900;
        const langToggle = page.locator(mobile ? ".topbar .tgl-lang" : ".sidebar .tgl-lang");
        if (lang === "en") {
          await langToggle.click();
          await expect(page.locator("html")).toHaveAttribute("lang", "en");
          await expect(langToggle).toHaveText("EN");
        }
        if (mobile) {
          await expectNoOverlap(page, ".topbar");
          await expectNoOverlap(page, ".tabbar");
          await page.locator(".tabbar .tab-more").click();
          await expect(page.locator(".more-sheet")).toHaveClass(/open/);
          await expect(page.locator(".more-sheet .sheet-panel")).toBeInViewport({ ratio: 1 });
          await expectNoOverlap(page, ".more-sheet .sheet-panel");
          if (lang === "en") await expect(page.locator(".more-sheet .sheet-item-label").nth(2)).toHaveText("Items & Food");
        } else {
          await expectNoOverlap(page, ".sidebar");
          if (lang === "en") await expect(page.locator(".sidebar .nav-item").nth(6)).toHaveText("Items & Food");
        }
      });
    }
  }
});
