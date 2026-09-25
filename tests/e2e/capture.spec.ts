// F6.1: overlay de captura com o dataset REAL, headless, sem slowMo, sem esperas fixas (a linha do tempo e esperada
// pelo data-stage). Sons espiados por HTMLMediaElement.prototype.play; artwork servido por page.route.
// Opcional CAPTURE_SHOTS_DIR=<pasta> grava as capturas de conferencia (outros 01-08, lendario e mitico).
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";
import { readDoc } from "./idb-helpers";

const SHOTS = process.env.CAPTURE_SHOTS_DIR;
const ART = readFileSync(new URL("../../src/assets/pokeball.webp", import.meta.url));

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
  await page.addInitScript(() => {
    const w = window as unknown as { __sounds: string[] };
    w.__sounds = [];
    HTMLMediaElement.prototype.play = function play(this: HTMLMediaElement) {
      w.__sounds.push(this.src.split("/").pop() ?? "");
      return Promise.resolve();
    };
  });
  await page.goto("/");
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
}

// Navega por interacao real de UI (busca da Home): funciona em dev e em build+preview (nao depende de
// "/src/..." em page.evaluate, que so existe no dev server).
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

async function captureSounds(page: Page): Promise<string[]> {
  const all = await page.evaluate(() => (window as unknown as { __sounds: string[] }).__sounds);
  return all.filter((s) => /^(poke_ball_|pokedex_close)/.test(s)).map((s) => s.replace(/\.\w+$/, ""));
}

async function setLanguage(page: Page, lang: "pt" | "en") {
  const toggle = page.locator(".tgl-lang:visible").first();
  const current = (await page.locator("html").getAttribute("lang")) === "en" ? "en" : "pt";
  if (current !== lang) await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("lang", lang === "en" ? "en" : "pt-BR");
}

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
  await page.route("https://raw.githubusercontent.com/**", (route) => route.fulfill({ status: 200, contentType: "image/webp", body: ART }));
});

const STAGES = ["on", "s-bg", "s-ball", "s-shake", "s-open", "s-grow", "s-flash", "s-final"] as const;
const SHOT_NAMES = ["01-start", "02-bg", "03-ball", "04-shake", "05-open-burst", "06-silhouette-grow", "07-flash", "08-final-reveal"];

test.describe("F6.1 capture overlay", () => {
  test("Charizard: full timeline in order with the 7 sounds, marks caught once, Close plays pokedex_close", async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await boot(page);
    await openDetail(page, 6);
    await page.evaluate(() => {
      const w = window as unknown as { __stages: string[] };
      w.__stages = [];
      const record = (el: Element) => {
        const v = el.getAttribute("data-stage");
        if (v && w.__stages.at(-1) !== v) w.__stages.push(v);
      };
      new MutationObserver((muts) => {
        for (const m of muts) {
          if (m.type === "attributes" && m.target instanceof Element && m.target.id === "capture") record(m.target);
          m.addedNodes.forEach((n) => n instanceof Element && n.id === "capture" && record(n));
        }
      }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-stage"] });
    });
    await page.locator("#btn-caught").click();
    const cap = page.locator("#capture");
    await expect(cap).toBeVisible();
    await expect(cap.locator(".cap-bg")).toHaveAttribute("data-bg", "bg-outros");
    for (const [i, stage] of STAGES.entries()) {
      // s-flash dura 200 ms: a ordem completa e conferida pelo observador; o print e tirado quando o estagio e pego
      if (stage === "s-flash") continue;
      await expect(cap).toHaveAttribute("data-stage", stage, { timeout: 10_000 });
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/capture-outros-${SHOT_NAMES[i]}.png` });
    }
    expect(await page.evaluate(() => (window as unknown as { __stages: string[] }).__stages)).toEqual([...STAGES]);
    await expect(cap).toHaveClass(/capture on s-bg s-final/);
    await expect(cap.locator(".cap-name")).toHaveText("Charizard");
    await expect(cap.locator(".cap-caught")).toHaveText("Capturado!");
    await expect(page.locator("#btn-caught")).toHaveAttribute("aria-pressed", "true");
    await cap.locator(".cap-close").click();
    await expect(cap).toHaveCount(0);
    expect(await captureSounds(page)).toEqual([
      "poke_ball_throw_1",
      "poke_ball_shake_1",
      "poke_ball_shake_2",
      "poke_ball_shake_3",
      "poke_ball_open",
      "poke_ball_shake_critical",
      "poke_ball_capture_succeeded",
      "pokedex_close",
    ]);
    await expect
      .poll(async () => {
        const doc = await readDoc<{ entries: Record<string, unknown> }>(page, "captured");
        return Object.keys(doc?.entries ?? {});
      })
      .toEqual(["6"]);
    await page.reload();
    await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
    await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
    await openDetail(page, 6);
    await expect(page.locator("#btn-caught")).toHaveAttribute("aria-pressed", "true");
    expect(errors).toEqual([]);
  });

  test("tap skips to the final reveal; Esc closes; unmark then re-mark runs the whole sequence again", async ({ page }) => {
    await boot(page);
    await openDetail(page, 25);
    await page.locator("#btn-caught").click();
    const cap = page.locator("#capture");
    await expect(cap).toHaveAttribute("data-stage", "s-ball", { timeout: 10_000 });
    await cap.click({ position: { x: 20, y: 200 } });
    await expect(cap).toHaveAttribute("data-stage", "s-final");
    await expect(page.locator("#btn-caught")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(cap).toHaveCount(0);
    await page.locator("#btn-caught").click();
    await page.locator("#btn-unmark-confirm").click();
    await expect(page.locator("#btn-caught")).toHaveAttribute("aria-pressed", "false");
    await page.locator("#btn-caught").click();
    await expect(cap).toHaveAttribute("data-stage", "on");
    await expect(cap).toHaveAttribute("data-stage", "s-final", { timeout: 10_000 });
    await cap.click();
    await expect(cap).toHaveCount(0);
  });

  test("navigating Back during the capture closes the overlay and stops the timeline", async ({ page }) => {
    await boot(page);
    await openDetail(page, 1);
    await openDetail(page, 4);
    await page.locator("#btn-caught").click();
    await expect(page.locator("#capture")).toHaveAttribute("data-stage", "s-bg", { timeout: 10_000 });
    await page.goBack();
    await expect(page.locator(".detail-screen[data-dex='1']")).toBeVisible();
    await expect(page.locator("#capture")).toHaveCount(0);
    const before = (await captureSounds(page)).length;
    await expect.poll(async () => (await captureSounds(page)).length, { timeout: 7000, intervals: [1000, 2000, 3000] }).toBe(before);
  });

  test("Mewtwo uses the legendary background with bolts; Mew the mythical one with sparks", async ({ page }) => {
    await boot(page);
    for (const [dex, bg, shape, prefix] of [
      [150, "bg-lendario", ".bolt", "legendario"],
      [151, "bg-mitico", ".spark", "mitico"],
    ] as const) {
      await openDetail(page, dex);
      await page.locator("#btn-caught").click();
      const cap = page.locator("#capture");
      await expect(cap.locator(".cap-bg")).toHaveAttribute("data-bg", bg);
      expect(await cap.locator(`.cap-bg svg ${shape}`).count()).toBeGreaterThan(10);
      await expect(cap).toHaveAttribute("data-stage", "s-ball", { timeout: 10_000 });
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/capture-${prefix}-01-bg-ball.png` });
      await expect(cap).toHaveAttribute("data-stage", "s-grow", { timeout: 10_000 });
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/capture-${prefix}-02-silhouette-grow.png` });
      await expect(cap).toHaveAttribute("data-stage", "s-final", { timeout: 10_000 });
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/capture-${prefix}-03-final-reveal.png` });
      await cap.locator(".cap-close").click();
      await expect(cap).toHaveCount(0);
    }
  });

  test("reduced motion goes straight to the final reveal", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await boot(page);
    await openDetail(page, 7);
    await page.locator("#btn-caught").click();
    await expect(page.locator("#capture")).toHaveAttribute("data-stage", "s-final", { timeout: 3000 });
  });

  for (const width of [360, 390, 1280]) {
    test(`final reveal without overlap at ${width}px (PT and EN)`, async ({ page }) => {
      await boot(page, width, 800);
      await openDetail(page, 10);
      for (const lang of ["pt", "en"] as const) {
        await setLanguage(page, lang);
        if (lang === "en") {
          await page.locator("#btn-caught").click();
          await page.locator("#btn-unmark-confirm").click();
        }
        await page.locator("#btn-caught").click();
        const cap = page.locator("#capture");
        await cap.click({ position: { x: 10, y: 100 } });
        await expect(cap).toHaveAttribute("data-stage", "s-final");
        await expect(cap.locator(".cap-text")).toHaveCSS("opacity", "1");
        await expectNoOverlap(page, cap.locator(".cap-text"));
        await cap.locator(".cap-close").click();
        await expect(cap).toHaveCount(0);
      }
    });
  }
});
