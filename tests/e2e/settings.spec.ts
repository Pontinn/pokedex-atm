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
    await page.locator(".more-sheet [data-nav=settings]").click();
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
        if (SHOTS) {
          await page.screenshot({ path: `${SHOTS}/settings-${width}-${lang}.png`, fullPage: true });
          await page.locator("[data-card=delete]").scrollIntoViewIfNeeded();
          await page.screenshot({ path: `${SHOTS}/settings-cards-${width}-${lang}.png` });
        }
      });
    }
  }
});

// ---------------------------------------------------------------------------------------------------------------
// F10.2: backup, apagar dados e snapshot
// ---------------------------------------------------------------------------------------------------------------

type Docs = Record<string, unknown>;

const T0 = 1_760_000_000_000;
const SEED: Docs = {
  captured: { schemaVersion: 1, entries: { "6": { capturedAt: T0 }, "25": { capturedAt: T0 + 1000 }, "448": { capturedAt: T0 + 2000 } } },
  team: { schemaVersion: 1, slots: [6, null, 94, null, null, 149] },
  history: { schemaVersion: 1, entries: [{ dex: 448, viewedAt: T0 + 5000 }, { dex: 6, viewedAt: T0 + 4000 }] },
  trainerProgress: {
    schemaVersion: 1,
    activeSeriesId: "bdsp",
    freeroam: { active: false, pausedSeriesId: null },
    series: { bdsp: { defeated: { gym_leader_roark_0395: { at: T0 + 3000 } } } },
  },
  preferences: {
    schemaVersion: 1,
    theme: "green",
    uiLanguage: "pt",
    termsLanguage: "en",
    termsOverrides: {},
    soundEnabled: false,
    reduceMotion: null,
  },
};
const USER_KEYS = ["captured", "team", "history", "trainerProgress", "preferences"];

/** Grava docs crus no IndexedDB do app (ja aberto pelo boot) e, opcionalmente, snapshots em `backups`. */
async function seedDocs(page: Page, docs: Docs, backups: unknown[] = []) {
  await page.evaluate(
    async ({ docs, backups }) => {
      const req = indexedDB.open("pontindex");
      const db: IDBDatabase = await new Promise((res, rej) => {
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      const tx = db.transaction(["documents", "backups"], "readwrite");
      for (const [key, doc] of Object.entries(docs)) tx.objectStore("documents").put({ key, doc });
      for (const b of backups) tx.objectStore("backups").put(b);
      await new Promise((r) => (tx.oncomplete = r));
      db.close();
    },
    { docs, backups },
  );
}

async function readDocs(page: Page): Promise<Docs> {
  return page.evaluate(async () => {
    const req = indexedDB.open("pontindex");
    const db: IDBDatabase = await new Promise((res) => (req.onsuccess = () => res(req.result)));
    const all = db.transaction("documents").objectStore("documents").getAll();
    await new Promise((r) => (all.onsuccess = r));
    db.close();
    const out: Record<string, unknown> = {};
    for (const rec of all.result as { key: string; doc: unknown }[]) out[rec.key] = rec.doc;
    return out;
  });
}

function pick(docs: Docs, keys: string[]): Docs {
  return Object.fromEntries(keys.map((k) => [k, docs[k]]));
}

async function openSeeded(page: Page, docs: Docs, width = 1280, backups: unknown[] = []) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await waitBooted(page);
  await seedDocs(page, docs, backups);
  await openSettings(page, width);
}

test.describe("F10.2 backup, delete data and snapshot restore", () => {
  test("export -> clean install -> import (replace) = 5 identical entities (two browser contexts)", async ({ page, browser }) => {
    const errors = trackConsoleErrors(page);
    await openSeeded(page, SEED);
    const before = pick(await readDocs(page), USER_KEYS);
    const downloadP = page.waitForEvent("download");
    await page.locator("[data-card=backup] [data-action=export]").click();
    const download = await downloadP;
    expect(download.suggestedFilename()).toMatch(/^pontindex-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const text = readFileSync((await download.path())!, "utf8");
    expect(JSON.parse(text).app).toBe("pontindex");

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await mockData(pageB);
    const errorsB = trackConsoleErrors(pageB);
    await openSettings(pageB, 1280);
    await pageB.locator("[data-input=backup-file]").setInputFiles({ name: "b.json", mimeType: "application/json", buffer: Buffer.from(text) });
    const modal = pageB.locator(".modal");
    await expect(modal.locator("[data-sum=captured]")).toHaveText("3 capturados");
    await expect(modal.locator("[data-sum=team]")).toHaveText("3 no time");
    await expect(modal.locator("[data-sum=history]")).toHaveText("2 no histórico");
    await expect(modal.locator("[data-sum=trainers]")).toHaveText("Treinadores derrotados: bdsp (1)");
    await expect(modal.locator("[data-preview]")).toHaveText("Depois de mesclar você terá: 3 capturados");
    await modal.locator(".merge-seg button", { hasText: "Substituir" }).click();
    await expect(modal.locator("[data-preview]")).toHaveText("Depois de substituir você terá: 3 capturados");
    await expectNoOverlap(pageB, ".modal");
    await modal.locator("[data-action=apply-import]").click();
    await expect(modal).toHaveCount(0);
    await expect(pageB.locator(".toast", { hasText: "Backup restaurado" })).toBeVisible();
    const after = pick(await readDocs(pageB), USER_KEYS);
    expect(after).toEqual(before);
    // preferencias importadas foram reidratadas na hora (tema verde)
    await expect(pageB.locator("html")).toHaveAttribute("data-theme", "green");
    await ctxB.close();
    expect(errors).toEqual([]);
    expect(errorsB).toEqual([]);
  });

  test("backup errors: newer version, foreign app and corrupted file write nothing", async ({ page }) => {
    await openSeeded(page, SEED);
    const before = await readDocs(page);
    const input = page.locator("[data-input=backup-file]");
    const cases: [string, string][] = [
      [JSON.stringify({ app: "pontindex", format: 1, schemaVersion: 99, appVersion: "9", datasetVersion: null, exportedAt: 1, documents: {}, crc32: "00000000" }), "sync.unsupportedVersion"],
      [JSON.stringify({ app: "other", format: 1 }), "sync.foreignApp"],
      [JSON.stringify({ app: "pontindex", format: 7, schemaVersion: 1, appVersion: "1", datasetVersion: null, exportedAt: 1, documents: {}, crc32: "00000000" }), "sync.corrupted"],
    ];
    for (const [body, code] of cases) {
      await input.setInputFiles({ name: "x.json", mimeType: "application/json", buffer: Buffer.from(body) });
      await expect(page.locator(`[data-card=backup] [data-error="${code}"]`)).toBeVisible();
      await expect(page.locator(".modal")).toHaveCount(0);
    }
    await expect(page.locator("[data-card=backup] [role=alert]")).toContainText("Código inválido ou corrompido");
    expect(await readDocs(page)).toEqual(before);
  });

  test("delete only history keeps the other 4 entities", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openSeeded(page, SEED);
    const before = await readDocs(page);
    const card = page.locator("[data-card=delete]");
    await expect(card.locator("[data-action=delete]")).toBeDisabled();
    await card.locator("[data-delete=history]").check();
    await card.locator("[data-action=delete]").click();
    const modal = page.locator(".modal");
    await expect(modal.locator("[data-confirm-text]")).toHaveText("Isto vai apagar: Histórico (2 registros). Esta ação não pode ser desfeita.");
    await expect(modal.locator("[data-input=confirm-word]")).toHaveCount(0);
    await modal.locator("[data-action=confirm-delete]").click();
    await expect(page.locator(".toast", { hasText: "Dados apagados" })).toBeVisible();
    const after = await readDocs(page);
    expect((after.history as { entries: unknown[] }).entries).toEqual([]);
    expect(pick(after, ["captured", "team", "trainerProgress", "preferences"])).toEqual(pick(before, ["captured", "team", "trainerProgress", "preferences"]));
    expect(errors).toEqual([]);
  });

  test("delete everything requires typing the confirmation word and clears snapshots", async ({ page }) => {
    const snap = { id: "pre-migration-v0-1", createdAt: T0, version: 0, docs: { captured: SEED.captured } };
    await openSeeded(page, SEED, 390, [snap]);
    const card = page.locator("[data-card=delete]");
    await card.locator("[data-delete=all]").check();
    await expect(card.locator("[data-delete=captured]")).toBeChecked();
    await card.locator("[data-action=delete]").click();
    const sheet = page.locator(".modal-sheet");
    await expect(sheet.locator("[data-confirm-text]")).toContainText("Tudo");
    await expectNoOverlap(page, ".modal-sheet .sheet-panel");
    const confirm = sheet.locator("[data-action=confirm-delete]");
    await expect(confirm).toBeDisabled();
    await sheet.locator("[data-input=confirm-word]").fill("apag");
    await expect(confirm).toBeDisabled();
    await sheet.locator("[data-input=confirm-word]").fill("APAGAR");
    await confirm.click();
    await expect(page.locator(".toast", { hasText: "Dados apagados" })).toBeVisible();
    const after = await readDocs(page);
    expect(Object.keys((after.captured as { entries: object }).entries)).toEqual([]);
    expect((after.team as { slots: unknown[] }).slots).toEqual([null, null, null, null, null, null]);
    expect((after.preferences as { theme: string }).theme).toBe("classic");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "classic");
    await expect(page.locator("[data-card=restore] [data-restore-empty]")).toBeVisible();
  });

  test("restore a pre-migration snapshot after confirmation", async ({ page }) => {
    const snapDocs = { captured: { schemaVersion: 1, entries: { "1": { capturedAt: T0 } } } };
    const snap = { id: "pre-migration-v0-123", createdAt: T0, version: 1, docs: snapDocs };
    await openSeeded(page, SEED, 1280, [snap]);
    const row = page.locator("[data-snapshot='pre-migration-v0-123']");
    await expect(row).toContainText("esquema v1");
    await row.getByRole("button", { name: "Restaurar" }).click();
    await page.locator(".modal [data-action=confirm-restore]").click();
    await expect(page.locator(".toast", { hasText: "Snapshot restaurado" })).toBeVisible();
    const after = await readDocs(page);
    expect(after.captured).toEqual(snapDocs.captured);
  });
});
