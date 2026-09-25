// F12.1: PWA instalavel e cache. So faz sentido no caminho de PRODUCAO (build + preview): no dev server o sw.js
// nao existe. Headless, sem slowMo, sem esperas fixas (expect/expect.poll).
// O artwork da PokeAPI e servido por context.route (imagem local): context.route tambem ve as requisicoes feitas
// pelo service worker (Chromium), entao o CacheFirst do SW guarda essa resposta como guardaria a da rede.
import { existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

test.use({ serviceWorkers: "allow" });
test.skip(process.env.PW_DEV === "1", "service worker so existe no build de producao (rode sem PW_DEV)");

const ART = readFileSync(new URL("../../src/assets/pokeball.webp", import.meta.url));
const ARTWORK = /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\//;

const DIST = fileURLToPath(new URL("../../dist/", import.meta.url));
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ogg": "audio/ogg",
};

/** Servidor estatico minimo sobre dist/ (fallback SPA para index.html); sw.js ganha um sufixo por "deploy". */
async function serveDist(deploy: () => number): Promise<{ url: string; close(): Promise<void> }> {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
    let file = normalize(join(DIST, pathname));
    if (!file.startsWith(normalize(DIST)) || !existsSync(file) || !statSync(file).isFile()) file = join(DIST, "index.html");
    let body: Buffer | string = readFileSync(file);
    if (pathname === "/sw.js") body = `${body.toString("utf8")}\n// deploy ${deploy()}\n`;
    res.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream", "cache-control": "no-cache" });
    res.end(body);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://localhost:${port}/`,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function routeArtwork(context: BrowserContext) {
  await context.route(ARTWORK, (route) => route.fulfill({ status: 200, contentType: "image/webp", body: ART }));
}

async function bootHome(page: Page) {
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#btn-open-dex")).toBeVisible({ timeout: 30_000 });
}

/** 1o load registra e instala o SW; o 2o load ja nasce controlado por ele. */
async function installAndControl(page: Page, base = "/") {
  await page.goto(base);
  await bootHome(page);
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await bootHome(page);
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? null)).toMatch(/\/sw\.js$/);
}

async function openDexAndFirstDetail(page: Page) {
  await page.locator("#btn-open-dex").click();
  const first = page.locator(".dex-screen .pcard").first();
  await expect(first).toBeVisible({ timeout: 30_000 });
  await first.click();
  await expect(page.locator(".detail-screen[data-dex] .hero-card")).toBeVisible({ timeout: 30_000 });
  return page.locator(".detail-screen[data-dex]").getAttribute("data-dex");
}

test.describe("F12.1 PWA installable and cache", () => {
  test("manifest is installable (name, colors, standalone, 192/512/maskable icons that load)", async ({ page, request }) => {
    await page.goto("/");
    await bootHome(page);
    const href = await page.locator("link[rel='manifest']").getAttribute("href");
    expect(href).toBeTruthy();
    const res = await request.get(href!);
    expect(res.ok()).toBe(true);
    const m = (await res.json()) as {
      name: string;
      short_name: string;
      display: string;
      start_url: string;
      theme_color: string;
      background_color: string;
      icons: { src: string; sizes: string; purpose?: string }[];
    };
    expect(m).toMatchObject({
      name: "Pontindex",
      short_name: "Pontindex",
      display: "standalone",
      start_url: "/",
      theme_color: "#DC0A2D",
      background_color: "#B0CDF3",
    });
    expect(m.icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(m.icons.some((i) => i.purpose === "maskable")).toBe(true);
    for (const icon of m.icons) {
      const r = await request.get(icon.src);
      expect(r.ok(), icon.src).toBe(true);
      expect(r.headers()["content-type"]).toContain("image/png");
    }
  });

  test("service worker controls the page on the 2nd load; precache has shell, boot JSON and sfx", async ({ page }) => {
    const errors = trackPageErrors(page);
    await installAndControl(page);
    const cached = await page.evaluate(async () => {
      const names = await caches.keys();
      const pre = names.find((n) => n.startsWith("workbox-precache"));
      if (!pre) return { names, urls: [] as string[] };
      const keys = await (await caches.open(pre)).keys();
      return { names, urls: keys.map((r) => new URL(r.url).pathname) };
    });
    expect(cached.urls).toContain("/index.html");
    expect(cached.urls).toContain("/data/current.json");
    for (const f of ["dataset-manifest", "species-index", "type-chart"]) {
      expect(cached.urls.some((u) => new RegExp(`^/data/[^/]+/${f}\\.json$`).test(u)), f).toBe(true);
    }
    expect(cached.urls.some((u) => u.startsWith("/assets/sfx/"))).toBe(true);
    // midia pesada e dados sob demanda NAO entram no precache
    expect(cached.urls.some((u) => /^\/assets\/(cries|sprites|items)\//.test(u) || /\/species\//.test(u))).toBe(false);
    expect(errors).toEqual([]);
  });

  test("offline reload keeps Home, Dex and an already opened detail (with its artwork from cache)", async ({ page, context }) => {
    const errors = trackPageErrors(page);
    await routeArtwork(context);
    await installAndControl(page);
    // visita online: Dex e uma ficha (species/<dex>.json, moves etc. entram no runtime cache "dataset")
    const dex = await openDexAndFirstDetail(page);
    expect(dex).toBeTruthy();
    await expect(page.locator(".detail-screen .artwork[data-phase='ok']").first()).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() =>
        page.evaluate(async (d) => {
          const c = await caches.open("dataset");
          const keys = await c.keys();
          return keys.some((r) => r.url.endsWith(`/species/${d}.json`));
        }, dex),
      )
      .toBe(true);

    await context.unroute(ARTWORK);
    await context.setOffline(true);
    await page.reload();
    await bootHome(page);
    expect(await page.evaluate(() => navigator.onLine)).toBe(false);

    const dexAgain = await openDexAndFirstDetail(page);
    expect(dexAgain).toBe(dex);
    await expect(page.locator(".detail-screen .hero-card")).toBeVisible();
    // artwork ja visto vem do cache do SW mesmo sem rede e sem a rota
    await expect(page.locator(".detail-screen .artwork[data-phase='ok']").first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator(".detail-screen .artwork-failed")).toHaveCount(0);
    expect(errors).toEqual([]);
    await context.setOffline(false);
  });

  test("offline detail whose artwork was never fetched falls back to the placeholder", async ({ page, context }) => {
    const errors = trackPageErrors(page);
    await installAndControl(page);
    // pre-cacheia so o JSON da especie (via fetch, sem abrir a ficha: a ficha abriria o <img> e cachearia o
    // artwork tambem). Assim a ficha carrega offline, mas o artwork nunca foi visto/cacheado.
    const dex = 143; // Snorlax: nao usado em nenhum outro teste deste arquivo
    await page.evaluate(async (d) => {
      const current = (await (await fetch("/data/current.json")).json()) as { datasetVersion: string };
      await fetch(`/data/${current.datasetVersion}/species/${d}.json`);
    }, dex);
    await context.setOffline(true);
    await page.reload();
    await bootHome(page);
    expect(await page.evaluate(() => navigator.onLine)).toBe(false);
    await page.locator("#search-input").fill(String(dex));
    await page.locator(`.search-dd .dd-item[data-dex='${dex}']`).click();
    await expect(page.locator(`.detail-screen[data-dex='${dex}'] .hero-card`)).toBeVisible();
    await expect(page.locator(".hero-card .art-placeholder")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".hero-card .artwork-img")).toHaveCount(0);
    expect(errors).toEqual([]);
    await context.setOffline(false);
  });

  test("new service worker waiting -> 'Nova versão disponível' toast; Atualizar activates it and reloads", async ({ page }) => {
    // O fetch do script do SW nao passa por page/context.route (medido: 0 interceptacoes, com ou sem
    // PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS). Entao este teste sobe um servidor estatico proprio sobre
    // dist/ (mesma origem localhost, porta livre) e simula o deploy novo trocando o conteudo do sw.js em memoria,
    // sem tocar no dist/ que os outros testes usam.
    let deploy = 0;
    const server = await serveDist(() => deploy);
    try {
      const errors = trackPageErrors(page);
      await installAndControl(page, server.url);
      deploy = 1;
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
      });
      const toast = page.locator(".pwa-update");
      await expect(toast).toBeVisible({ timeout: 15_000 });
      await expect(toast).toContainText("Nova versão disponível");
      expect(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true);
      // o aviso se empilha com os toasts e nao cobre a tab bar/sidebar: mesmo host
      await expect(page.locator(".toast-host .pwa-update")).toHaveCount(1);

      await Promise.all([page.waitForEvent("load"), toast.getByRole("button", { name: "Atualizar" }).click()]);
      await bootHome(page);
      await expect(page.locator(".pwa-update")).toHaveCount(0);
      await expect
        .poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting))
        .toBe(false);
      await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
      expect(errors).toEqual([]);
    } finally {
      await server.close();
    }
  });
});
