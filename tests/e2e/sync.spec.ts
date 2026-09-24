// F11.1/F11.2: Sincronizar (Playwright headless, sem slowMo, sem esperas fixas).
// /data/** servido por rotas com a fixture de tests/fixtures/ui-shell (nao depende de public/data).
import { expect, test, type Page, type Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import { TYPE_IDS, typeChartMatrix } from "../../src/domain/type-chart";
import { expectNoOverlap } from "../harness/no-overlap";

const manifest = JSON.parse(readFileSync(new URL("../fixtures/ui-shell/manifest.json", import.meta.url), "utf8")) as { datasetVersion: string };
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

async function waitBooted(page: Page) {
  await expect(page.locator("#app")).toBeAttached({ timeout: 30_000 });
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
}

type Docs = Record<string, unknown>;

async function seedDocs(page: Page, docs: Docs) {
  await page.evaluate(async (docs) => {
    const req = indexedDB.open("pontindex");
    const db: IDBDatabase = await new Promise((res, rej) => {
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
    const tx = db.transaction("documents", "readwrite");
    for (const [key, doc] of Object.entries(docs)) tx.objectStore("documents").put({ key, doc });
    await new Promise((r) => (tx.oncomplete = r));
    db.close();
  }, docs);
}

async function openSync(page: Page, width: number, seed?: Docs) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/");
  await waitBooted(page);
  if (seed) {
    await seedDocs(page, seed);
    await page.reload();
    await waitBooted(page);
  }
  if (width < 900) {
    await page.locator(".tabbar .tab-more").click();
    await page.locator(".more-sheet .sheet-item").nth(3).click();
  } else {
    await page.locator(".sidebar .nav-item").nth(7).click();
  }
  // 1o acesso ao chunk lazy no dev server compila qrcode/fflate: pode passar do timeout padrao
  await expect(page.locator(".sync-screen")).toBeVisible({ timeout: 60_000 });
}

const T0 = 1_760_000_000_000;

function capturedDoc(dexes: number[]) {
  return { schemaVersion: 1, entries: Object.fromEntries(dexes.map((d, i) => [String(d), { capturedAt: T0 + i * 1000 }])) };
}

function bigDocs(): Docs {
  const dexes = [...Array.from({ length: 1025 }, (_, i) => i + 1), 9901, 9902];
  const defeated = Object.fromEntries(Array.from({ length: 110 }, (_, i) => [`trainer_${String(i).padStart(4, "0")}_x`, { at: T0 + i * 1000 }]));
  return {
    captured: capturedDoc(dexes),
    team: { schemaVersion: 1, slots: [6, 448, 94, 149, 25, 1] },
    history: { schemaVersion: 1, entries: Array.from({ length: 20 }, (_, i) => ({ dex: i + 1, viewedAt: T0 + (20 - i) * 1000 })) },
    trainerProgress: { schemaVersion: 1, activeSeriesId: "bdsp", freeroam: { active: false, pausedSeriesId: null }, series: { bdsp: { defeated } } },
  };
}

test.beforeEach(async ({ page }) => {
  await mockData(page);
});

test.describe("F11.1 generate code", () => {
  test("20 caught -> a single QR, text, summary; no network request during the action", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    // som desligado: o clique global tocaria click.ogg (asset do shell), que nao e da acao de gerar
    const prefs = { schemaVersion: 1, theme: "classic", uiLanguage: "pt", termsLanguage: "pt", termsOverrides: {}, soundEnabled: false, reduceMotion: null };
    await openSync(page, 1280, { captured: capturedDoc(Array.from({ length: 20 }, (_, i) => i + 1)), preferences: prefs });
    await expect(page.locator(".sync-explainer p")).toHaveCount(4);
    const requests: string[] = [];
    await page.route("**/*", (route) => {
      requests.push(route.request().url());
      return route.abort();
    });
    await page.locator("[data-action=generate]").click();
    const result = page.locator("[data-result]");
    await expect(result.locator(".qr-frames")).toHaveAttribute("data-frames", "1");
    await expect(result.locator(".qr-nav")).toHaveCount(0);
    await expect(result.locator(".sync-code-text")).toHaveValue(/^PDX1\.[A-Za-z0-9_-]+$/);
    await expect(result.locator("[data-sum=captured]")).toHaveText("20 capturados");
    await expect(result.locator("[data-generated-at]")).toContainText("Gerado em");
    await expect(result.locator("[data-nothing]")).toHaveCount(0);
    // o canvas foi desenhado (pixels nao brancos)
    await expect
      .poll(() => page.locator(".qr-canvas").evaluate((c: HTMLCanvasElement) => c.toDataURL().length))
      .toBeGreaterThan(1000);
    expect(requests).toEqual([]);
    await page.unroute("**/*");
    expect(errors).toEqual([]);
  });

  test("1027 caught + everything -> n >= 2 frames in a carousel and the full text", async ({ page }) => {
    await openSync(page, 1280, bigDocs());
    await page.locator("[data-action=generate]").click();
    const frames = page.locator(".qr-frames");
    await expect(frames).toHaveAttribute("data-frames", /^[2-9]$/);
    const n = Number(await frames.getAttribute("data-frames"));
    await expect(page.locator(".qr-counter")).toHaveText(new RegExp(`^Frame \\d de ${n}$`));
    const text = await page.locator(".sync-code-text").inputValue();
    expect(text.startsWith("PDX1.")).toBe(true);
    // cada frame cabe em 900 caracteres e a concatenacao dos chunks e o texto completo
    await page.locator(".qr-next").click();
    const seen = new Map<number, string>();
    for (let i = 0; i < n; i++) {
      const idx = Number(await frames.getAttribute("data-frame-index"));
      const f = (await page.locator(".qr-canvas").getAttribute("data-qr-text"))!;
      expect(f.length).toBeLessThanOrEqual(900);
      expect(f.startsWith(`PDXF.${idx}/${n}.`)).toBe(true);
      seen.set(idx, f.split(".").slice(3).join("."));
      await page.locator(".qr-next").click();
      await expect(frames).toHaveAttribute("data-frame-index", String((idx % n) + 1));
    }
    expect(seen.size).toBe(n);
    expect(Array.from({ length: n }, (_, i) => seen.get(i + 1)).join("")).toBe(text);
    await expect(page.locator("[data-sum=captured]")).toHaveText("1027 capturados");
  });

  test("empty data still generates a minimal code with a notice", async ({ page }) => {
    await openSync(page, 1280);
    await page.locator("[data-action=generate]").click();
    await expect(page.locator("[data-nothing]")).toBeVisible();
    await expect(page.locator(".sync-code-text")).toHaveValue(/^PDX1\./);
  });

  for (const lang of ["pt", "en"] as const) {
    for (const width of [360, 390, 1280]) {
      test(`generate: no text overlap at ${width}px (${lang})`, async ({ page }) => {
        await openSync(page, width, { ...bigDocs(), preferences: { schemaVersion: 1, theme: "classic", uiLanguage: lang, termsLanguage: "pt", termsOverrides: {}, soundEnabled: true, reduceMotion: true } });
        await page.locator("[data-action=generate]").click();
        await expect(page.locator(".qr-frames")).toBeVisible();
        await expectNoOverlap(page, ".sync-screen");
        if (SHOTS) await page.screenshot({ path: `${SHOTS}/sync-gen-${width}-${lang}.png` });
      });
    }
  }
});

// ---------------------------------------------------------------------------------------------------------------
// F11.2: receber codigo
// ---------------------------------------------------------------------------------------------------------------

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

const prefs = (theme: string, soundEnabled = true) => ({
  schemaVersion: 1, theme, uiLanguage: "pt", termsLanguage: "pt", termsOverrides: {}, soundEnabled, reduceMotion: null,
});

/** Dispositivo A do criterio de aceite (SPEC 5.4.4). */
const DEVICE_A: Docs = {
  captured: capturedDoc([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  team: { schemaVersion: 1, slots: [6, 448, 94, 149, null, null] },
  history: { schemaVersion: 1, entries: [{ dex: 6, viewedAt: T0 + 30_000 }, { dex: 448, viewedAt: T0 + 20_000 }, { dex: 25, viewedAt: T0 + 10_000 }] },
  trainerProgress: { schemaVersion: 1, activeSeriesId: "bdsp", freeroam: { active: false, pausedSeriesId: null }, series: { bdsp: { defeated: { gym_leader_roark_0395: { at: T0 } } } } },
  preferences: prefs("black"),
};
/** Dispositivo B. */
const DEVICE_B: Docs = {
  captured: capturedDoc([11, 12, 13, 14, 15]),
  team: { schemaVersion: 1, slots: [null, null, null, null, null, null] },
  history: { schemaVersion: 1, entries: [{ dex: 150, viewedAt: T0 + 50_000 }, { dex: 133, viewedAt: T0 + 40_000 }] },
  trainerProgress: { schemaVersion: 1, activeSeriesId: null, freeroam: { active: false, pausedSeriesId: null }, series: {} },
  preferences: prefs("purple"),
};

async function generateText(page: Page): Promise<{ text: string; frames: string[] }> {
  await page.locator("[data-action=generate]").click();
  const text = await page.locator(".sync-code-text").inputValue();
  const frames = page.locator(".qr-frames");
  const n = Number(await frames.getAttribute("data-frames"));
  const out: string[] = [];
  if (n > 1) {
    for (let i = 0; i < n; i++) {
      await page.locator(".qr-next").click();
      out.push((await page.locator(".qr-canvas").getAttribute("data-qr-text"))!);
    }
  }
  return { text, frames: out };
}

async function paste(page: Page, text: string) {
  await page.locator("#sync-code-in").fill(text);
  await page.locator("[data-action=receive]").click();
}

test.describe("F11.2 receive code", () => {
  test("A/B acceptance: B receives A in Merge (two browser contexts)", async ({ page, browser }) => {
    const errorsA = trackConsoleErrors(page);
    await openSync(page, 1280, DEVICE_A);
    const { text } = await generateText(page);

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await mockData(pageB);
    const errorsB = trackConsoleErrors(pageB);
    await openSync(pageB, 1280, DEVICE_B);
    await pageB.locator(".sync-mode-seg button", { hasText: "Receber código" }).click();
    await expect(pageB.locator("[data-action=receive]")).toBeDisabled();
    await paste(pageB, `\n${text.slice(0, 40)}\n${text.slice(40)}\n`); // quebras de linha do WhatsApp
    const review = pageB.locator(".sync-review");
    await expect(review.locator("[data-sum=captured]")).toHaveText("10 capturados");
    await expect(review.locator("[data-sum=trainers]")).toHaveText("Treinadores derrotados: bdsp (1)");
    await expect(review.locator("[data-preview]")).toHaveText("Depois de mesclar você terá: 15 capturados");
    await review.locator(".merge-seg button", { hasText: "Substituir" }).click();
    await expect(review.locator("[data-preview]")).toHaveText("Depois de substituir você terá: 10 capturados");
    await review.locator(".merge-seg button", { hasText: "Mesclar" }).click();
    await review.locator("[data-action=apply]").click();
    await expect(pageB.locator(".toast", { hasText: "Dados sincronizados" })).toBeVisible();
    await expect(pageB.locator("[data-panel=generate]")).toBeVisible();
    const after = await readDocs(pageB);
    expect(Object.keys((after.captured as { entries: object }).entries).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect((after.trainerProgress as { series: Record<string, { defeated: object }> }).series.bdsp!.defeated).toEqual({ gym_leader_roark_0395: { at: T0 } });
    expect((after.team as { slots: unknown[] }).slots).toEqual([6, 448, 94, 149, null, null]);
    expect((after.history as { entries: { dex: number }[] }).entries.map((e) => e.dex)).toEqual([150, 133, 6, 448, 25]);
    expect((after.preferences as { theme: string }).theme).toBe("purple");
    await ctxB.close();
    expect(errorsA).toEqual([]);
    expect(errorsB).toEqual([]);
  });

  test("corrupted, foreign and newer codes: error message and IndexedDB identical", async ({ page }) => {
    await openSync(page, 1280, DEVICE_B);
    const { text } = await generateText(page);
    await page.locator(".sync-mode-seg button", { hasText: "Receber código" }).click();
    const before = await readDocs(page);
    const flipped = text.slice(0, 20) + (text[20] === "A" ? "B" : "A") + text.slice(21);
    await paste(page, flipped);
    await expect(page.locator("[data-error='sync.corrupted'] [role=alert]")).toHaveText("Código inválido ou corrompido. Confira se copiou tudo.");
    await paste(page, "hello world");
    await expect(page.locator("[data-error='sync.foreignApp']")).toBeVisible();
    await expect(page.locator(".sync-review")).toHaveCount(0);
    expect(await readDocs(page)).toEqual(before);
  });

  test("frames pasted one by one go through the frame collector (other session warned)", async ({ page }) => {
    await openSync(page, 1280, bigDocs());
    const { frames } = await generateText(page);
    expect(frames.length).toBeGreaterThanOrEqual(2);
    const other = await (async () => {
      await page.locator("[data-action=generate]").click();
      await page.locator(".qr-next").click();
      return (await page.locator(".qr-canvas").getAttribute("data-qr-text"))!;
    })();
    await page.locator(".sync-mode-seg button", { hasText: "Receber código" }).click();
    const n = frames.length;
    // ordem invertida: o coletor aceita qualquer ordem
    await paste(page, frames[n - 1]!);
    await expect(page.locator("[data-progress]")).toHaveText(`Faltam ${n - 1} frames (1/${n} lidos)`);
    await paste(page, other);
    await expect(page.locator("[data-warn='sync.otherSession']")).toBeVisible();
    for (let i = n - 2; i >= 0; i--) await paste(page, frames[i]!);
    await expect(page.locator(".sync-review [data-sum=captured]")).toHaveText("1027 capturados");
  });

  test("camera denied -> Camera unavailable and the paste field stays usable", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia: () => Promise.reject(new DOMException("denied", "NotAllowedError")), enumerateDevices: () => Promise.resolve([]) },
      });
    });
    await openSync(page, 390);
    await page.locator(".sync-mode-seg button", { hasText: "Receber código" }).click();
    await page.locator("[data-action=open-camera]").click();
    await expect(page.locator("[data-camera-off]")).toContainText("Câmera indisponível");
    await expect(page.locator("#sync-code-in")).toBeFocused();
  });

  for (const lang of ["pt", "en"] as const) {
    test(`receive: no text overlap at 360/390/1280px (${lang})`, async ({ page }) => {
      await openSync(page, 1280, { ...DEVICE_A, preferences: { ...prefs("classic"), uiLanguage: lang } });
      const { text } = await generateText(page);
      await page.locator(".sync-mode-seg button").nth(1).click();
      await expectNoOverlap(page, ".sync-screen");
      await paste(page, text);
      await expect(page.locator(".sync-review")).toBeVisible();
      for (const width of [1280, 390, 360]) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.locator(".sync-review")).toBeVisible();
        await expectNoOverlap(page, ".sync-screen");
        if (SHOTS) await page.screenshot({ path: `${SHOTS}/sync-recv-${width}-${lang}.png` });
      }
    });
  }
});
