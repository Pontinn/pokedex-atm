// Quick sw-legacy-button L2: links do portfolio e do GitHub sempre presentes e nunca no caminho.
// Desktop: linha no rodape da sidebar. Mobile: fim do conteudo rolavel do <main> (nao cobre nada) e sheet "Mais".
// Configuracoes: card Sobre com o botao. PT e EN, 1280 e 390 px. Headless, sem slowMo, sem esperas fixas.
// Prints opcionais: L2_SHOTS_DIR=<pasta> grava L2_<tela>-<largura>-<idioma>.png.
import { expect, test, type Locator, type Page } from "@playwright/test";
import { expectNoOverlap } from "../harness/no-overlap";

const PORTFOLIO = "https://portfolio.pontin.dev";
const GITHUB = "https://github.com/Pontinn";
const SHOTS = process.env.L2_SHOTS_DIR;
const TEXT = { pt: { line: "Feito por Pontin", about: "Pontindex, feito por Pontin.", btn: "Ver meu portfólio" }, en: { line: "Made by Pontin", about: "Pontindex, made by Pontin.", btn: "See my portfolio" } } as const;

function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function boot(page: Page, width: number, lang: "pt" | "en") {
  await page.setViewportSize({ width, height: width < 900 ? 844 : 800 });
  await page.route((url) => url.pathname.startsWith("/assets/sfx/") || url.pathname.startsWith("/assets/cries/"), (route) =>
    route.fulfill({ status: 200, contentType: "audio/ogg", body: "" }),
  );
  await page.context().route(`${GITHUB}`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>github</title>" }));
  await page.context().route(`${PORTFOLIO}/**`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>portfolio</title>" }));
  await page.goto("/");
  await expect(page.locator("#search-input")).toBeEnabled({ timeout: 30_000 });
  // o splash monta junto com o app e abre com atraso (pointer-events: none): esperar ele sumir depois do mount
  await expect(page.locator(".boot")).toHaveCount(0, { timeout: 30_000 });
  const tgl = page.locator(".tgl-lang:visible").first();
  if ((await tgl.textContent())?.trim().toLowerCase() !== lang) await tgl.click();
  await expect(tgl).toHaveText(lang.toUpperCase());
}

async function go(page: Page, screen: "home" | "dex" | "settings", mobile: boolean) {
  if (mobile && screen === "settings") {
    // no mobile Configuracoes fica no sheet "Mais" (fechado, o sheet segue no DOM fora da tela)
    await page.locator('.tabbar [data-nav="more"]').click();
    await page.locator(`.more-sheet.open [data-nav="${screen}"]`).click();
    return;
  }
  await page.locator(mobile ? `.tabbar [data-nav="${screen}"]` : `.sidebar [data-nav="${screen}"]`).click();
}

async function expectExternal(link: Locator, href = PORTFOLIO) {
  await expect(link).toHaveAttribute("href", href);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
}

/** O centro do link e o proprio link (nada por cima) e ele fica acima da tab bar. */
async function expectNotCovered(link: Locator) {
  const ok = await link.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const tab = document.querySelector(".app.mobile .tabbar")?.getBoundingClientRect();
    return !!hit && el.contains(hit) && (!tab || r.bottom <= tab.top + 0.5);
  });
  expect(ok, "link do portfolio coberto ou atras da tab bar").toBe(true);
}

async function scrollMainToEnd(page: Page) {
  await page.evaluate(() => {
    const main = document.getElementById("main")!;
    main.style.scrollBehavior = "auto";
    main.scrollTop = main.scrollHeight;
  });
}

/** Espera as animacoes/transicoes finitas em curso (entrada dos cards, sheet subindo) antes do print. */
async function settle(page: Page) {
  await page.mouse.move(1, 1);
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    ),
  );
}

async function shot(page: Page, name: string) {
  if (!SHOTS) return;
  await settle(page);
  await page.screenshot({ path: `${SHOTS}/L2_${name}.png` });
}

for (const width of [1280, 390, 360] as const) {
  for (const lang of ["pt", "en"] as const) {
    test(`author links at ${width}px (${lang}): home, dex end, settings, opens in a new tab`, async ({ page }) => {
      const errors = trackConsoleErrors(page);
      const t = TEXT[lang];
      await boot(page, width, lang);
      const mobile = width < 900;
      await expect(page.locator(".home-screen")).toBeVisible();

      // Home
      const line = mobile ? page.locator("#main > .main-foot a[data-portfolio]") : page.locator(".sidebar-foot a[data-portfolio]");
      await expect(line).toHaveText(t.line);
      await expectExternal(line);
      const gh = mobile ? page.locator("#main > .main-foot a[data-github]") : page.locator(".sidebar-foot a[data-github]");
      await expect(gh).toHaveText("GitHub");
      await expectExternal(gh, GITHUB);
      const [lb, gb] = [await line.boundingBox(), await gh.boundingBox()];
      if (mobile) {
        // uma linha compacta com separador (ou quebra) sem vazar a largura
        expect(gb!.x + gb!.width).toBeLessThanOrEqual(width);
        expect(lb!.x).toBeGreaterThanOrEqual(0);
      } else {
        expect(gb!.y, "GitHub logo abaixo do portfolio").toBeGreaterThanOrEqual(lb!.y + lb!.height - 1);
      }
      if (mobile) {
        await expect(page.locator(".sidebar")).toBeHidden();
        await expect(page.locator(".sidebar-foot a[data-portfolio]")).toBeHidden();
        await scrollMainToEnd(page);
        await expect(line).toBeInViewport();
        await expectNotCovered(line);
        await expectNotCovered(gh);
        await expectNoOverlap(page, "#main");
      } else {
        await expect(page.locator("#main .main-foot")).toHaveCount(0);
        await expect(line).toBeInViewport();
        await expectNoOverlap(page, ".sidebar");
      }
      await shot(page, `home-${width}-${lang}`);

      // Pokedex (tela longa) rolada ate o fim
      await go(page, "dex", mobile);
      await expect(page.locator("[data-screen='dex'], .dex-screen").first()).toBeVisible();
      await expect(page.locator(".poke-row").first()).toBeVisible();
      if (mobile) {
        // grade virtualizada: a altura total se ajusta ao medir as linhas, entao rola ate o fim de novo ate assentar
        await expect(async () => {
          await scrollMainToEnd(page);
          await expectNotCovered(line);
          await expectNotCovered(gh);
        }).toPass({ timeout: 20_000 });
        await expectNoOverlap(page, "#main");
      } else {
        await scrollMainToEnd(page);
        await expect(line).toBeInViewport();
      }
      await expect(page.locator(".poke-row").last()).toBeInViewport();
      await shot(page, `dex-end-${width}-${lang}`);

      // Sheet "Mais" (mobile)
      if (mobile) {
        await page.locator('[data-nav="more"]:visible').first().click();
        const entry = page.locator(".more-sheet.open a.sheet-item[data-portfolio]");
        await expect(entry).toBeVisible();
        await expect(entry.locator(".sheet-item-label")).toHaveText(t.line);
        await expectExternal(entry);
        const ghEntry = page.locator(".more-sheet.open a.sheet-item[data-github]");
        await expect(ghEntry.locator(".sheet-item-label")).toHaveText("GitHub");
        await expectExternal(ghEntry, GITHUB);
        await settle(page);
        await ghEntry.scrollIntoViewIfNeeded();
        await expect(ghEntry).toBeInViewport();
        await expectNoOverlap(page, ".more-sheet .sheet-panel");
        await shot(page, `more-sheet-${width}-${lang}`);
        await page.keyboard.press("Escape");
        await expect(page.locator(".more-sheet.open")).toHaveCount(0);
      }

      // Configuracoes: card Sobre
      await go(page, "settings", mobile);
      const about = page.locator("[data-card='about']");
      await expect(about).toBeVisible();
      await expect(about.getByText(t.about)).toBeVisible();
      const btn = about.getByRole("link", { name: new RegExp(`^${t.btn}`) });
      await expectExternal(btn);
      await expectExternal(about.getByRole("link", { name: /GitHub/ }), GITHUB);
      await btn.scrollIntoViewIfNeeded();
      await expect(btn).toBeInViewport();
      await expectNoOverlap(page, "[data-card='about']");
      await about.screenshot(SHOTS ? { path: `${SHOTS}/L2_settings-about-${width}-${lang}.png` } : {});
      if (mobile) {
        await scrollMainToEnd(page);
        await expectNotCovered(line);
      }

      // clique abre nova aba e o app continua na mesma tela
      const popup = page.context().waitForEvent("page");
      await btn.click();
      const tab = await popup;
      expect(tab.url()).toContain("portfolio.pontin.dev");
      await tab.close();
      await expect(page.locator(".settings-screen")).toBeVisible();
      const ghPopup = page.context().waitForEvent("page");
      await about.locator("a[data-github]").click();
      const ghTab = await ghPopup;
      expect(ghTab.url()).toContain("github.com/Pontinn");
      await ghTab.close();
      await expect(page.locator(".settings-screen")).toBeVisible();

      expect(errors).toEqual([]);
    });
  }
}
