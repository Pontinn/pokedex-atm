// Captura do delta visual para a tela "Tipos" (feature type-chart). Playwright headless, sem slowMo, sem sleeps.
// Uso: node capture-types.cjs   (dev server em http://localhost:5174/, worktree pokedex-type-chart)
const ROOT = "C:/Users/Usuario/Desktop/Pessoais/Projetos/pokedex-type-chart";
const { chromium } = require(ROOT + "/node_modules/playwright");
const fs = require("fs");
const OUT = ROOT + "/.forge/ideas/type-chart/ui-refs/";
const ART = fs.readFileSync(ROOT + "/src/assets/pokeball.webp");
const URL = "http://localhost:5174/";
const log = [];
const tokens = { computed: {}, perType: {}, mult: {}, notes: [] };

async function mk(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: "block" });
  const page = await ctx.newPage();
  await page.route(/raw\.githubusercontent\.com|pokeapi\.co/, (r) => r.request().resourceType() === "image" ? r.fulfill({ contentType: "image/webp", body: ART }) : r.abort());
  await page.goto(URL);
  await page.locator(".boot").waitFor({ state: "detached", timeout: 60000 });
  await page.locator("#search-input").waitFor({ state: "visible" });
  await page.waitForFunction(() => !document.querySelector("#search-input").disabled);
  return page;
}
async function settle(page) {
  await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))));
}
async function nav(page, screen) {
  const vis = page.locator(`[data-nav="${screen}"]:visible`).first();
  if (await vis.count()) { await vis.click(); return; }
  await page.locator('[data-nav="more"]:visible').first().click();
  await page.locator(`.more-sheet.open [data-nav="${screen}"]`).first().click();
}
async function shot(page, name, loc, opts = {}) {
  await settle(page);
  try {
    if (loc) await page.locator(loc).first().screenshot({ path: OUT + name + ".png", timeout: 8000 });
    else await page.screenshot({ path: OUT + name + ".png", fullPage: !!opts.full });
    log.push(name);
  } catch (e) { log.push("FAIL " + name + " " + String(e).slice(0, 100)); }
}
async function setTheme(page, id) {
  await nav(page, "settings");
  await page.locator(`[data-theme-pick="${id}"]`).click();
  await page.waitForFunction((i) => document.documentElement.dataset.theme === i, id);
}
async function openDetail(page, dex) {
  if (!(await page.locator(".home-screen").isVisible().catch(() => false))) await nav(page, "home");
  await page.locator("#search-input").fill(String(dex));
  const item = page.locator(`.search-dd .dd-item[data-dex='${dex}']`);
  await item.waitFor({ state: "visible" });
  await item.click();
  await page.locator(`.detail-screen[data-dex='${dex}'] .hero-card`).waitFor();
  await page.locator(`.detail-screen[data-dex='${dex}'] .evo-panel`).waitFor();
}
const PROPS = ["fontFamily","fontSize","fontWeight","letterSpacing","textTransform","lineHeight","color","backgroundColor","backgroundImage","borderTopWidth","borderTopStyle","borderTopColor","borderTopLeftRadius","paddingTop","paddingRight","paddingBottom","paddingLeft","boxShadow","outlineStyle","outlineWidth","outlineColor","outlineOffset","height","width","display","gap","transform","cursor"];
async function computed(page, sel, key) {
  const r = await page.evaluate(({ sel, props }) => {
    const el = document.querySelector(sel); if (!el) return null;
    const cs = getComputedStyle(el); const o = {};
    for (const p of props) o[p] = cs[p];
    const b = el.getBoundingClientRect(); o.rect = `${b.width.toFixed(1)}x${b.height.toFixed(1)}`;
    o.class = el.className && el.className.toString().slice(0, 80);
    return o;
  }, { sel, props: PROPS });
  tokens.computed[key] = r;
}
const focusInfo = (page) => page.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { tag: e.tagName, cls: e.className, outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow, matchesFocusVisible: e.matches(":focus-visible") }; });

async function dexChips(page, theme, label) {
  await nav(page, "dex");
  await page.locator("#filter-types .chip").first().waitFor();
  const FG = ".filters .filter-group:first-child";
  await shot(page, `dex-typechips-${theme}-${label}`, FG);
  const chips = page.locator("#filter-types .chip");
  await chips.nth(1).click(); // fire
  await chips.nth(4).click(); // grass
  await page.locator("#filter-types .chip.on").first().waitFor();
  await shot(page, `dex-typechips-selected-${theme}-${label}`, FG);
  if (!label.startsWith("phone")) {
    await chips.nth(0).hover();
    await shot(page, `dex-typechip-hover-${theme}-${label}`, FG);
  }
  // foco por teclado: foca o chip 2 (nao selecionado) via Tab a partir do chip 1
  await chips.nth(1).focus();
  await page.keyboard.press("Tab");
  await shot(page, `dex-typechip-focus-${theme}-${label}`, FG);
  if (theme === "classic" && label === "desktop") {
    tokens.computed.focusChip = await focusInfo(page);
    await computed(page, "#filter-types .chip:not(.on)", "chipOff");
    await computed(page, "#filter-types .chip.on", "chipOn");
    await computed(page, ".chips-scroll", "chipsScroll");
    await computed(page, ".chips-scroll .chip.on .ti", "chipOnTi");
    tokens.computed.chipsScrollMetrics = await page.evaluate(() => { const e = document.querySelector("#filter-types"); return { clientWidth: e.clientWidth, scrollWidth: e.scrollWidth, chipCount: e.querySelectorAll(".chip").length, overflow: e.scrollWidth > e.clientWidth ? "scroll-x" : "fits" }; });
    await computed(page, ".filter-seg .seg", "seg");
    await computed(page, ".filter-seg .seg button[aria-pressed=true]", "segPressed");
    await computed(page, ".filter-seg .seg button[aria-pressed=false]", "segUnpressed");
    await page.locator(".filter-seg .seg button").nth(1).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    tokens.computed.focusSeg = await focusInfo(page);
  }
  if (label === "phone") {
    tokens.computed["chipsScrollMetrics-phone-" + theme] = await page.evaluate(() => { const e = document.querySelector("#filter-types"); return { clientWidth: e.clientWidth, scrollWidth: e.scrollWidth, overflow: e.scrollWidth > e.clientWidth ? "scroll-x" : "fits" }; });
  }
  await shot(page, `dex-seg-status-${theme}-${label}`, ".filter-seg");
  const segs = page.locator(".filter-seg .seg button");
  await segs.nth(1).click();
  await page.waitForFunction(() => document.querySelectorAll(".filter-seg .seg button")[1].getAttribute("aria-pressed") === "true");
  await shot(page, `dex-seg-status-caught-${theme}-${label}`, ".filter-seg");
  await shot(page, `dex-filters-${theme}-${label}`, ".filters");
  await segs.nth(0).click();
  for (const i of [1, 4]) await chips.nth(i).click();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const [label, w, h] of [["desktop", 1280, 800], ["phone", 390, 844]]) {
    const page = await mk(browser, w, h);
    const phone = label === "phone";
    for (const theme of ["classic", "black"]) {
      if (theme !== "classic") await setTheme(page, theme);
      await nav(page, "home");
      if (!phone) {
        await shot(page, `shell-sidebar-${theme}-${label}`, ".sidebar");
        if (theme === "classic") {
          tokens.shell = { sidebarItems: await page.locator(".sidebar [data-nav]").evaluateAll((els) => els.map((e) => e.getAttribute("data-nav"))) };
          await computed(page, ".sidebar .nav-item", "navItem");
          await computed(page, ".sidebar .nav-item.active", "navItemActive");
        }
      } else {
        await page.locator('[data-nav="more"]:visible').first().click();
        await page.locator(".more-sheet.open .sheet-item").first().waitFor();
        await shot(page, `shell-more-sheet-${theme}-${label}`, null);
        await shot(page, `shell-more-sheet-panel-${theme}-${label}`, ".more-sheet.open .sheet-panel");
        if (theme === "classic") {
          tokens.shell = await page.evaluate(() => ({
            moreItems: [...document.querySelectorAll(".more-sheet .sheet-item")].map((e) => e.getAttribute("data-nav") || e.getAttribute("href")),
            tabs: [...document.querySelectorAll(".tabbar [data-nav]")].map((e) => e.getAttribute("data-nav")),
          }));
          await computed(page, ".more-sheet .sheet-panel", "sheetPanel");
          await computed(page, ".more-sheet .sheet-item", "sheetItem");
          await computed(page, ".tabbar", "tabbar");
          await computed(page, ".tab.active", "tabActive");
        }
        await page.keyboard.press("Escape");
        await page.waitForFunction(() => !document.querySelector(".more-sheet.open"));
        await shot(page, `shell-tabbar-${theme}-${label}`, ".tabbar");
      }
      await dexChips(page, theme, label);
      // EmptyState na Dex (busca sem resultado)
      try {
        const q = page.locator("#dex-search");
        await q.fill("zzzzqq");
        await page.locator(".empty-state").first().waitFor({ timeout: 8000 });
        await shot(page, `empty-state-dex-${theme}-${label}`, ".empty-state");
        if (theme === "classic" && !phone) { await computed(page, ".empty-state", "emptyState"); await computed(page, ".empty-state .ob-ico", "emptyStateIco"); await computed(page, ".empty-state-text", "emptyStateText"); }
        await q.fill("");
      } catch (e) { log.push("FAIL empty " + String(e).slice(0, 80)); }
      // Ficha: Charizard
      await openDetail(page, 6);
      await shot(page, `detail-hero-types-${theme}-${label}`, ".hero-card");
      await shot(page, `detail-panel-weak-${theme}-${label}`, "#weak-panel");
      if (theme === "classic" && !phone) {
        await computed(page, "#weak-panel", "panel");
        await computed(page, "#weak-panel h3", "panelH3");
        await computed(page, "#weak-panel .panel-head", "panelHead");
        await computed(page, "#weak-panel .seg-sm", "segSm");
        await computed(page, "#weak-panel .seg-sm button[aria-pressed=true]", "segSmPressed");
        await computed(page, "#weak-panel .seg-sm button[aria-pressed=false]", "segSmUnpressed");
        await computed(page, ".hero-card .chip", "heroChip");
        await computed(page, ".hero-card .chip .ti", "heroChipTi");
        await computed(page, "#weak-panel .chip", "weakChip");
      }
      await page.locator("#weak-panel .seg-sm button").nth(1).click();
      await page.waitForFunction(() => document.querySelectorAll("#weak-panel .seg-sm button")[1].getAttribute("aria-pressed") === "true");
      await shot(page, `detail-seg-sm-weak-${theme}-${label}`, "#weak-panel .panel-head");
      await page.locator("#weak-panel .seg-sm button").nth(0).click();
      // Calculadora
      const det = page.locator("details#calc");
      await det.scrollIntoViewIfNeeded();
      if (!(await det.evaluate((d) => d.open))) await det.locator("summary").click();
      await page.locator(".type-calc-grid .tc-cell").first().waitFor();
      await page.locator("#c-t1").selectOption("grass");
      await page.locator("#c-t2").selectOption("flying");
      await page.waitForFunction(() => document.querySelector('.tc-cell[data-attacker="ground"]')?.getAttribute("data-mult") === "0");
      await shot(page, `detail-calc-grass-flying-${theme}-${label}`, ".type-calc");
      if (!phone) {
        tokens.mult[theme] = await page.evaluate(() => {
          const o = {};
          for (const cls of ["mult-4", "mult-2", "mult-1", "mult-half", "mult-quarter", "mult-0"]) {
            const el = document.querySelector(".tc-cell .mult." + cls);
            if (!el) { o[cls] = null; continue; }
            const cs = getComputedStyle(el); const b = el.getBoundingClientRect();
            o[cls] = { text: el.textContent, color: cs.color, backgroundColor: cs.backgroundColor, borderTopWidth: cs.borderTopWidth, borderTopColor: cs.borderTopColor, fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight, padding: cs.padding, borderRadius: cs.borderRadius, rect: `${b.width.toFixed(1)}x${b.height.toFixed(1)}` };
          }
          return o;
        });
      }
      if (theme === "classic" && !phone) {
        const cov = await page.evaluate(() => [...new Set([...document.querySelectorAll(".tc-cell")].map((c) => c.dataset.mult))]);
        tokens.notes.push("grass/flying cobre multiplicadores: " + cov.join(","));
        await computed(page, ".type-calc", "typeCalc");
        await computed(page, ".type-calc-grid", "typeCalcGrid");
        await computed(page, ".tc-cell", "tcCell");
        await computed(page, ".type-calc h4", "typeCalcH4");
        await computed(page, ".type-calc select", "typeCalcSelect");
        tokens.perType = await page.evaluate(() => {
          const root = getComputedStyle(document.documentElement);
          const o = {};
          for (const cell of document.querySelectorAll(".tc-cell")) {
            const ty = cell.dataset.attacker;
            const cc = getComputedStyle(cell.querySelector(".chip")); const tc = getComputedStyle(cell.querySelector(".ti"));
            o[ty] = { "--t": root.getPropertyValue("--t-" + ty).trim(), "--type-a": root.getPropertyValue("--type-" + ty + "-a").trim(), "--type-b": root.getPropertyValue("--type-" + ty + "-b").trim(), chipColor: cc.color, chipBackgroundImage: cc.backgroundImage, tiBackground: tc.backgroundColor };
          }
          return o;
        });
        tokens.chipSizes = await page.evaluate(() => {
          const o = {};
          for (const sel of [".tc-cell .chip", "#weak-panel .chip", ".hero-card .chip"]) {
            const e = document.querySelector(sel); if (!e) continue;
            const b = e.getBoundingClientRect(); const i = e.querySelector(".ti").getBoundingClientRect();
            o[sel] = { cls: e.className, chip: `${b.width.toFixed(1)}x${b.height.toFixed(1)}`, ti: `${i.width}x${i.height}`, fontSize: getComputedStyle(e).fontSize };
          }
          return o;
        });
      }
      await shot(page, `detail-full-calc-open-${theme}-${label}`, null, { full: true });
      await nav(page, "dex");
      await page.locator("#filter-types .chip").first().waitFor();
      await shot(page, `dex-cards-${theme}-${label}`, null);
      if (theme === "classic" && !phone) {
        tokens.dexCard = await page.evaluate(() => { const c = document.querySelector(".dex-screen :is(.card,.dex-card) .chip") || document.querySelector(".dex-screen .chip:not([type=button])"); if (!c) return null; const b = c.getBoundingClientRect(); return { cls: c.className, rect: `${b.width.toFixed(1)}x${b.height.toFixed(1)}`, parent: c.parentElement.className, ti: (() => { const i = c.querySelector(".ti").getBoundingClientRect(); return `${i.width}x${i.height}`; })() }; });
      }
    }
    await setTheme(page, "classic");
    await page.context().close();
  }
  await browser.close();
  fs.writeFileSync(OUT + "tokens-types.json", JSON.stringify(tokens, null, 1));
  fs.writeFileSync(OUT + "capture-types.log.txt", log.join("\n") + "\n");
  console.log(log.join("\n"));
})().catch((e) => { console.error(e); fs.writeFileSync(OUT + "capture-types.log.txt", log.join("\n") + "\nERR " + e + "\n"); process.exit(1); });
