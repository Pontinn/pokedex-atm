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

/**
 * Servidor estatico minimo sobre dist/ (fallback SPA para index.html) que simula deploys sem tocar no dist/:
 * no deploy N o index.html ganha <meta name="x-deploy" content="N"> e o sw.js muda a revisao do index.html no
 * precache (como um build novo faria), entao o SW novo baixa e serve o index.html do deploy N.
 */
async function serveDist(deploy: () => number): Promise<{ url: string; close(): Promise<void> }> {
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
    let file = normalize(join(DIST, pathname));
    if (!file.startsWith(normalize(DIST)) || !existsSync(file) || !statSync(file).isFile()) file = join(DIST, "index.html");
    let body: Buffer | string = readFileSync(file);
    const n = deploy();
    if (pathname === "/sw.js") {
      body = body.toString("utf8").replace(/(url:"index\.html",revision:")([^"]+)"/, `$1$2-${n}"`);
      body = `${body}\n// deploy ${n}\n`;
    } else if (file.endsWith("index.html")) {
      body = body.toString("utf8").replace("<head>", `<head><meta name="x-deploy" content="${n}">`);
    }
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

  // O fetch do script do SW nao passa por page/context.route (medido: 0 interceptacoes, com ou sem
  // PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS). Entao os testes de atualizacao sobem um servidor estatico
  // proprio sobre dist/ (mesma origem localhost, porta livre) e simulam o deploy novo em memoria (serveDist).

  test("first visit: the service worker takes control with no reload", async ({ page }) => {
    const server = await serveDist(() => 0);
    try {
      const errors = trackPageErrors(page);
      let loads = 0;
      page.on("load", () => loads++);
      await page.goto(server.url);
      await bootHome(page);
      await page.evaluate(() => {
        (window as unknown as { __firstPage: boolean }).__firstPage = true;
      });
      // clientsClaim: o 1o SW assume esta mesma pagina (controllerchange) sem recarregar
      await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 30_000 }).toBe(true);
      await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
      expect(await page.evaluate(() => (window as unknown as { __firstPage?: boolean }).__firstPage === true)).toBe(true);
      expect(loads).toBe(1);
      expect(errors).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("new deploy is picked up with no click: page reloads once into the new version", async ({ page }) => {
    let deploy = 0;
    const server = await serveDist(() => deploy);
    try {
      const errors = trackPageErrors(page);
      await installAndControl(page, server.url);
      await expect(page.locator('meta[name="x-deploy"]')).toHaveAttribute("content", "0");
      let loads = 0;
      page.on("load", () => loads++);

      deploy = 1;
      // usuario abre o site de novo: a navegacao ainda sai do SW antigo (deploy 0), o navegador acha o sw.js novo,
      // ele ativa sozinho e a pagina recarrega UMA vez ja servida pelo SW novo (deploy 1). Nenhum clique.
      await page.reload();
      await expect(page.locator('meta[name="x-deploy"]')).toHaveAttribute("content", "1", { timeout: 30_000 });
      await bootHome(page);
      await expect
        .poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting))
        .toBe(false);
      await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
      // sem botao/aviso de atualizacao em nenhum momento
      await expect(page.locator(".pwa-update")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Atualizar" })).toHaveCount(0);
      // reload manual + o reload automatico; nada de loop
      expect(loads).toBe(2);
      expect(errors).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("an open tab picks up a new deploy by itself, keeps local data and still works offline", async ({ page, context }) => {
    let deploy = 0;
    const server = await serveDist(() => deploy);
    try {
      const errors = trackPageErrors(page);
      await installAndControl(page, server.url);
      // dado local (IndexedDB): preferencia de som desligada
      await page.locator(".sidebar .tgl-sound").click();
      await expect(page.locator(".sidebar .tgl-sound")).toHaveClass(/off/);
      const dbsBefore = await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name).sort());
      expect(dbsBefore.length).toBeGreaterThan(0);

      deploy = 1;
      // aba parada (sem navegar): a mesma checagem de versao que o app faz quando o usuario volta para a aba
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        await reg?.update();
      });
      await expect(page.locator('meta[name="x-deploy"]')).toHaveAttribute("content", "1", { timeout: 30_000 });
      await bootHome(page);
      await expect(page.locator(".sidebar .tgl-sound")).toHaveClass(/off/);
      expect(await page.evaluate(async () => (await indexedDB.databases()).map((d) => d.name).sort())).toEqual(dbsBefore);

      // offline depois da atualizacao: abre a versao nova do cache, com os dados locais
      await context.setOffline(true);
      await page.reload();
      await bootHome(page);
      expect(await page.evaluate(() => navigator.onLine)).toBe(false);
      await expect(page.locator('meta[name="x-deploy"]')).toHaveAttribute("content", "1");
      await expect(page.locator(".sidebar .tgl-sound")).toHaveClass(/off/);
      expect(errors).toEqual([]);
    } finally {
      await context.setOffline(false);
      await server.close();
    }
  });

  // sw-legacy-button: aba do build antigo (registerType "prompt") clica "Atualizar" -> manda SKIP_WAITING ao SW
  // que ja assumiu a aba. O SW novo (public/sw-skip-waiting.js via importScripts) recarrega essa aba uma vez.
  test("SKIP_WAITING from a tab (legacy Update button) reloads that tab exactly once", async ({ page }) => {
    const server = await serveDist(() => 0);
    try {
      const errors = trackPageErrors(page);
      await installAndControl(page, server.url);
      let loads = 0;
      page.on("load", () => loads++);
      await page.evaluate(() => {
        (window as unknown as { __before: boolean }).__before = true;
      });
      // como o botao antigo: postMessage direto no ServiceWorker (o que estava em espera e agora e o ativo)
      await page.evaluate(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        reg!.active!.postMessage({ type: "SKIP_WAITING" });
      });
      await expect.poll(() => loads, { timeout: 30_000 }).toBe(1);
      await bootHome(page);
      expect(await page.evaluate(() => (window as unknown as { __before?: boolean }).__before === true)).toBe(false);
      // a pagina nova segue controlada e nao recarrega de novo (sem loop)
      await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
      await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
      expect(loads).toBe(1);
      expect(errors).toEqual([]);
    } finally {
      await server.close();
    }
  });

  // U1b: aba aberta num build antigo pede um chunk lazy cujo hash ja saiu do ar. Sem SW (o page.route ve o pedido
  // do chunk direto) e com o chunk da tela Sincronizar abortado, simulando o 404 pos-deploy.
  test.describe("stale lazy chunk after a deploy", () => {
    test.use({ serviceWorkers: "block", viewport: { width: 1280, height: 900 } });
    const SYNC_CHUNK = /\/assets\/SyncScreen-[^/]+\.js$/;
    const openSync = (page: Page) => page.locator(".sidebar .nav-item").nth(7).click();

    test("missing chunk reloads the page once, then the screen opens on the fresh build", async ({ page }) => {
      const errors = trackPageErrors(page);
      let aborted = 0;
      await page.route(SYNC_CHUNK, (route) => {
        if (aborted++ === 0) return route.abort();
        return route.continue();
      });
      let loads = 0;
      page.on("load", () => loads++);
      await page.goto("/");
      await bootHome(page);
      await openSync(page);
      await expect.poll(() => loads, { timeout: 30_000 }).toBe(2);
      await bootHome(page);
      await openSync(page);
      await expect(page.locator(".sync-screen")).toBeVisible({ timeout: 30_000 });
      expect(loads).toBe(2);
      expect(errors).toEqual([]);
    });

    test("a chunk that is really gone reloads only once (no loop) and falls back to the error screen", async ({ page }) => {
      await page.route(SYNC_CHUNK, (route) => route.abort());
      let loads = 0;
      page.on("load", () => loads++);
      await page.goto("/");
      await bootHome(page);
      await openSync(page);
      await expect.poll(() => loads, { timeout: 30_000 }).toBe(2);
      await bootHome(page);
      await openSync(page);
      await expect(page.locator(".error-fallback")).toBeVisible({ timeout: 30_000 });
      // a trava do sessionStorage segurou: nenhum reload a mais, nem abrindo a tela de novo
      await page.locator(".error-fallback .btn-primary").click();
      await expect(page.locator(".error-fallback")).toBeVisible();
      expect(loads).toBe(2);
    });
  });
});
