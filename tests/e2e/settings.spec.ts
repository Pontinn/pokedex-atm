// F10.1/F10.2: Configuracoes (Playwright headless, sem slowMo, sem esperas fixas).
// /data/** servido por rotas com a fixture de tests/fixtures/ui-shell (nao depende de public/data).
import { expect, test, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import { TYPE_IDS, typeChartMatrix } from "../../src/domain/type-chart";
import { expectNoOverlap } from "../harness/no-overlap";

const baseManifest = JSON.parse(readFileSync(new URL("../fixtures/ui-shell/manifest.json", import.meta.url), "utf8")) as {
  datasetVersion: string;
  counts: Record<string, unknown>;
};
const manifest = { ...baseManifest, counts: { ...baseManifest.counts, species: 1027, fossilRoutes: 42, trainers: 3110 } };
const VER = manifest.datasetVersion;
const SHOTS = process.env.SETTINGS_SHOTS_DIR;

async function mockData(page: Page) {
  await page.route((url) => url.pathname.startsWith("/data/"), async (route: Route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/data/current.json") return route.fulfill({ json: { datasetVersion: VER } });
    if (path === `/data/${VER}/dataset-manifest.json`) return route.fulfill({ json: manifest });
    if (path === `/data/${VER}/species-index.json`) return route.fulfill({ json: [] });
    if (path === `/data/${VER}/type-chart.json`) return route.fulfill({ json: { attackers: TYPE_IDS, matrix: typeChartMatrix() } });
    return route.fulfill({ status: 404, body: "not found" });
  });
  await page.route((url) => url.pathname.startsWith("/assets/sfx/"), (route) => route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }));
}

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

/** O boot so e montado junto com o app: espera o #app existir e a tampa sumir (nao basta checar a tampa logo apos o goto). */
async function waitBooted(page: Page) {
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
}

async function openSettings(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto("/");
  await waitBooted(page);
  if (width < 900) {
    await page.locator(".tabbar .tab-more").click();
    await page.locator(".more-sheet .sheet-item").last().click();
  } else {
    await page.locator(".sidebar .nav-item").last().click();
  }
  await expect(page.locator(".settings-screen")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await mockData(page);
});

test.describe("F10.1 preferences", () => {
  test("renders the reference layout with 7 themes, language, sound, motion, terms, install and about", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openSettings(page, 1280, 800);
    const screen = page.locator(".settings-screen");
    await expect(screen.locator(".page-head h2")).toHaveText("Configurações");
    await expect(screen.locator(".theme-sw .sw-name > span:first-child")).toHaveText(["Clássico", "Preto", "Verde", "Azul", "Roxo", "Branco", "Laranja"]);
    await expect(screen.locator(".theme-sw.active")).toHaveAttribute("data-theme-pick", "classic");
    await expect(screen.locator(".theme-sw").first().locator(".pill")).toHaveText("Padrão");
    await expect(screen.locator(".lang-seg button")).toHaveText(["Português (BR)", "English"]);
    await expect(screen.locator("#sw-sound")).toBeChecked();
    await expect(screen.locator(".terms-seg button")).toHaveText(["Português", "Inglês"]);
    const about = screen.locator("[data-card=about]");
    await expect(about.locator("[data-info=data]")).toHaveText("Dados: All the Mons 1.3.0 / Cobblemon 1.7.3");
    await expect(about.locator("[data-info=dataset]")).toHaveText(`Versão do dataset: ${VER}`);
    await expect(about.locator("[data-info=counts]")).toHaveText("1027 espécies, 42 rotas de fóssil, 3110 treinadores");
    await expect(about.locator("[data-info=app]")).toHaveText(/^Pontindex v\d+\.\d+\.\d+/);
    await expect(about.locator("[data-info=persist]")).toHaveText(/Armazenamento persistente: (sim|não)/);
    // sem beforeinstallprompt no headless: instrucao textual
    await expect(screen.locator("[data-card=install] .install-manual")).toBeVisible();
    // tema troca na hora
    await screen.locator("[data-theme-pick=purple]").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "purple");
    await screen.locator("[data-theme-pick=classic]").click();
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/desktop-settings.png`, fullPage: true });
    expect(errors).toEqual([]);
  });

  test("Preto + English + sound off + reduce motion on persists after reload", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openSettings(page, 1280, 800);
    const screen = page.locator(".settings-screen");
    await screen.locator("[data-theme-pick=black]").click();
    await screen.locator(".lang-seg button", { hasText: "English" }).click();
    await expect(screen.locator(".page-head h2")).toHaveText("Settings");
    await screen.locator("[data-row=sound] .switch").click();
    await expect(screen.locator("#sw-sound")).not.toBeChecked();
    await screen.locator("[data-row=motion] .switch").click();
    await expect(screen.locator("#sw-motion")).toBeChecked();
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);
    await expect(screen.locator(".motion-system input")).not.toBeChecked();
    await page.reload();
    await waitBooted(page);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "black");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveClass(/reduce-motion/);
    await page.locator(".sidebar .nav-item").last().click();
    await expect(screen.locator(".page-head h2")).toHaveText("Settings");
    await expect(screen.locator(".theme-sw.active")).toHaveAttribute("data-theme-pick", "black");
    await expect(screen.locator("#sw-sound")).not.toBeChecked();
    await expect(screen.locator("#sw-motion")).toBeChecked();
    await expect(page.locator(".sidebar .tgl-sound")).toHaveClass(/off/);
    // seguir o sistema volta para null (sem preferencia do sistema = animacoes ligadas)
    await screen.locator(".motion-system input").check();
    await expect(page.locator("html")).not.toHaveClass(/reduce-motion/);
    expect(errors).toEqual([]);
  });

  test("changing the terms default clears per-card overrides", async ({ page }) => {
    await openSettings(page, 1280, 800);
    await page.evaluate(async () => {
      const req = indexedDB.open("pontindex");
      const db: IDBDatabase = await new Promise((res, rej) => {
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      const tx = db.transaction("documents", "readwrite");
      const store = tx.objectStore("documents");
      const get = store.get("preferences");
      await new Promise((r) => (get.onsuccess = r));
      const rec = get.result as { key: string; doc: { termsOverrides: Record<string, string> } };
      rec.doc.termsOverrides = { "detail.moves": "en" };
      store.put(rec);
      await new Promise((r) => (tx.oncomplete = r));
      db.close();
    });
    await page.reload();
    await waitBooted(page);
    await page.locator(".sidebar .nav-item").last().click();
    await page.locator(".terms-seg button", { hasText: "Inglês" }).click();
    await expect(page.locator(".terms-seg button.active")).toHaveText("Inglês");
    await expect
      .poll(() =>
        page.evaluate(async () => {
          const req = indexedDB.open("pontindex");
          const db: IDBDatabase = await new Promise((res) => (req.onsuccess = () => res(req.result)));
          const get = db.transaction("documents").objectStore("documents").get("preferences");
          await new Promise((r) => (get.onsuccess = r));
          db.close();
          const doc = (get.result as { doc: { termsLanguage: string; termsOverrides: Record<string, string> } }).doc;
          return `${doc.termsLanguage}|${JSON.stringify(doc.termsOverrides)}`;
        }),
      )
      .toBe("en|{}");
  });

  for (const lang of ["pt", "en"] as const) {
    for (const width of [360, 390, 1280]) {
      test(`no text overlap at ${width}px (${lang})`, async ({ page }) => {
        await openSettings(page, width);
        if (lang === "en") {
          await page.locator(".lang-seg button", { hasText: "English" }).click();
          await expect(page.locator(".settings-screen .page-head h2")).toHaveText("Settings");
        }
        await expectNoOverlap(page, ".settings-screen");
        if (SHOTS) await page.screenshot({ path: `${SHOTS}/settings-${width}-${lang}.png`, fullPage: true });
      });
    }
  }
});
