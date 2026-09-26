// Auditoria independente de treinadores (2026-09-26).
// Le SO o cru (data-source/atm-1.3.0) e o JSON publicado. Nao importa nada de tools/dataset/src nem src/.
// Uso: node tools/dataset/audit/manual-2026-09-26/trainers.mjs [--out <arquivo.json>]
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "../../../..");
const SRC = path.join(ROOT, "data-source/atm-1.3.0");
const JAR = path.join(SRC, "mods/rctmod-neoforge-1.21.1-0.18.1-beta.jar/data/rctmod");
const KJS = path.join(SRC, "kubejs/data/rctmod");
const cur = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/current.json"), "utf8")).datasetVersion;
const PUB = path.join(ROOT, "public/data", cur);
const outArg = process.argv.indexOf("--out");
const OUT = outArg > 0 ? process.argv[outArg + 1] : null;

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const listJson = (d) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => f.endsWith(".json")) : []);

// ---------- cru ----------
// treinadores: jar, depois kubejs (mesmo id -> kubejs vence)
const trainers = new Map();
for (const [dir, src] of [[path.join(JAR, "trainers"), "rctmod"], [path.join(KJS, "trainers"), "kubejs"]]) {
  for (const f of listJson(dir)) trainers.set(f.slice(0, -5), { ...readJson(path.join(dir, f)), __src: src });
}
const defaultMob = readJson(path.join(JAR, "mobs/trainers/default.json"));
const singleMobs = new Map();
for (const [dir, src] of [[path.join(JAR, "mobs/trainers/single"), "rctmod"], [path.join(KJS, "mobs/trainers/single"), "kubejs"]]) {
  for (const f of listJson(dir)) singleMobs.set(f.slice(0, -5), { ...readJson(path.join(dir, f)), __src: src });
}
const groupMobs = new Map();
for (const f of listJson(path.join(JAR, "mobs/trainers/groups"))) groupMobs.set(f.slice(0, -5), readJson(path.join(JAR, "mobs/trainers/groups", f)));
const seriesRaw = new Map();
for (const [dir, src] of [[path.join(JAR, "series"), "rctmod"], [path.join(KJS, "series"), "kubejs"]]) {
  for (const f of listJson(dir)) seriesRaw.set(f.slice(0, -5), { ...readJson(path.join(dir, f)), __src: src });
}
// config toml (so as chaves que interessam)
const toml = fs.readFileSync(path.join(SRC, "config/rctmod-server.toml"), "utf8");
const tomlNum = (k) => Number(new RegExp(`^\\s*${k}\\s*=\\s*(-?\\d+)`, "m").exec(toml)[1]);
const CFG = { initialLevelCap: tomlNum("initialLevelCap"), relativeLevelCap: tomlNum("relativeLevelCap") };

function mobFor(id) {
  const s = singleMobs.get(id);
  return s ? { ...defaultMob, ...s } : { ...defaultMob, __src: "default" };
}
const normHeld = (h) => {
  if (h == null) return null;
  if (Array.isArray(h)) return h.length ? String(h[0]) : null;
  return String(h);
};
const stripNs = (s) => (s == null ? s : String(s).replace(/^cobblemon:/, ""));

// ---------- publicado ----------
const pubSeries = readJson(path.join(PUB, "series.json"));
const pubTrainers = new Map(); // seriesId -> trainers[]
for (const s of pubSeries) pubTrainers.set(s.id, readJson(path.join(PUB, s.trainersFile)).trainers);

// ---------- comparacao ----------
const divs = [];
let checks = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function check(sev, where, field, raw, pub, cmp = eq) {
  checks++;
  if (!cmp(raw, pub)) divs.push({ sev, where, field, raw, pub });
}

// membros esperados por serie (mob single ou default)
const expectedMembers = new Map();
for (const sid of seriesRaw.keys()) expectedMembers.set(sid, []);
for (const [id] of trainers) {
  const m = mobFor(id);
  for (const sid of m.series ?? []) {
    if (!expectedMembers.has(sid)) expectedMembers.set(sid, []);
    expectedMembers.get(sid).push(id);
  }
}
// mob sem arquivo de treinador
for (const id of singleMobs.keys()) if (!trainers.has(id)) divs.push({ sev: "INFO", where: id, field: "mob sem trainers/<id>.json", raw: singleMobs.get(id).__src, pub: null });

// series.json
const rawSeriesIds = [...seriesRaw.keys()].sort();
const pubSeriesIds = pubSeries.filter((s) => s.special === null).map((s) => s.id).sort();
check("WRONG DATA", "series.json", "ids de serie (nao especiais)", rawSeriesIds, pubSeriesIds);
for (const s of pubSeries) {
  if (s.special) continue;
  const r = seriesRaw.get(s.id);
  if (!r) continue;
  check("WRONG DATA", `series/${s.id}`, "difficulty", r.difficulty, s.difficulty);
  check("WRONG DATA", `series/${s.id}`, "requiredSeries", r.requiredSeries ?? [], s.requiredSeries);
  const exp = (expectedMembers.get(s.id) ?? []).filter((id) => mobFor(id).optional === false).sort();
  check("WRONG DATA", `series/${s.id}`, "keyTrainerIds (conjunto)", exp, [...s.keyTrainerIds].sort());
  // ordem: cada treinador-chave deve vir depois de ao menos um de cada grupo OR (se o grupo cita treinador-chave)
  const pos = new Map(s.keyTrainerIds.map((id, i) => [id, i]));
  for (const id of s.keyTrainerIds) {
    const rd = mobFor(id).requiredDefeats ?? [];
    for (const g of rd) {
      const inSeries = g.filter((x) => pos.has(x));
      if (!inSeries.length) continue;
      checks++;
      if (!inSeries.some((x) => pos.get(x) < pos.get(id))) divs.push({ sev: "WRONG DATA", where: `series/${s.id}`, field: `ordem keyTrainerIds: ${id} antes do pre-requisito`, raw: g, pub: pos.get(id) });
    }
  }
}

// treinadores por serie
for (const [sid, pubList] of pubTrainers) {
  if (sid === "freeroam") { check("WRONG DATA", "trainers/freeroam", "vazio", 0, pubList.length); continue; }
  const exp = (expectedMembers.get(sid) ?? []).slice().sort();
  const pubIds = pubList.map((t) => t.id).sort();
  check("WRONG DATA", `trainers/${sid}`, "ids de membros", exp, pubIds);
  for (const pt of pubList) {
    const w = `${sid}/${pt.id}`;
    const rt = trainers.get(pt.id);
    if (!rt) { divs.push({ sev: "WRONG DATA", where: w, field: "existe no cru", raw: null, pub: pt.id }); continue; }
    const m = mobFor(pt.id);
    check("WRONG DATA", w, "name", rt.name, pt.name);
    check("WRONG DATA", w, "optional", m.optional, pt.optional);
    check("WRONG DATA", w, "requiredDefeats", m.requiredDefeats ?? [], pt.requiredDefeats);
    check("WRONG DATA", w, "type", m.type, pt.type);
    check("WRONG DATA", w, "signatureItem", m.signatureItem ?? null, pt.signatureItem);
    check("WRONG DATA", w, "biomes.whitelist", m.biomeTagWhitelist ?? [], pt.biomes?.whitelist);
    check("WRONG DATA", w, "biomes.blacklist", m.biomeTagBlacklist ?? [], pt.biomes?.blacklist);
    const mobSrc = singleMobs.get(pt.id)?.__src;
    const expSrc = rt.__src === "kubejs" || mobSrc === "kubejs" ? "kubejs" : "rctmod";
    check("COSMETIC", w, "source", expSrc, pt.source);
    const team = rt.team ?? [];
    check("WRONG DATA", w, "tamanho do time", team.length, pt.team.length);
    const maxLvl = Math.max(0, ...team.map((p) => Number(p.level)));
    check("WRONG DATA", w, "maxTeamLevel", maxLvl, pt.maxTeamLevel);
    team.forEach((p, i) => {
      const q = pt.team[i] ?? {};
      const wi = `${w}#${i}`;
      check("WRONG DATA", wi, "species", String(p.species).toLowerCase(), String(q.species).toLowerCase());
      check("WRONG DATA", wi, "level", Number(p.level), q.level);
      check("WRONG DATA", wi, "ability", p.ability ?? null, q.ability ?? null);
      check("WRONG DATA", wi, "moveset", p.moveset ?? [], q.moveset);
      check("WRONG DATA", wi, "gender", p.gender ?? null, q.gender ?? null);
      check("COSMETIC", wi, "nature", p.nature ?? null, q.nature ?? null);
      check("WRONG DATA", wi, "heldItem", stripNs(normHeld(p.heldItem)), stripNs(q.heldItem ?? null));
    });
    const bag = (rt.bag ?? []).map((b) => ({ item: b.item, quantity: b.quantity }));
    check("WRONG DATA", w, "bag", bag, (pt.bag ?? []).map((b) => ({ item: b.item, quantity: b.quantity })));
  }
}

// forma do heldItem no cru (para o relatorio)
const heldShapes = { string: 0, array1: 0, arrayN: 0, arrayEmpty: 0, none: 0 };
for (const [, t] of trainers) for (const p of t.team ?? []) {
  const h = p.heldItem;
  if (h == null) heldShapes.none++;
  else if (Array.isArray(h)) heldShapes[h.length === 0 ? "arrayEmpty" : h.length === 1 ? "array1" : "arrayN"]++;
  else heldShapes.string++;
}

// grupos: treinadores sem mob single cujo id comeca com o nome de um grupo que tem series nao vazia
const groupSeriesHits = {};
for (const [gname, g] of groupMobs) {
  if (!(g.series ?? []).length) continue;
  const ids = [...trainers.keys()].filter((id) => !singleMobs.has(id) && id.startsWith(gname + "_"));
  groupSeriesHits[gname] = { series: g.series, optional: g.optional, trainersSemMobSingle: ids.length, exemplo: ids.slice(0, 3) };
}

// ---------- level cap (implementacao propria do RF-59) ----------
function ownCaps(sid) {
  const key = (expectedMembers.get(sid) ?? []).filter((id) => mobFor(id).optional === false);
  const info = new Map();
  const lvlOf = (id) => Math.max(0, ...(trainers.get(id)?.team ?? []).map((p) => Number(p.level)));
  const memo = new Map();
  const tl = (id, stack = new Set()) => {
    if (memo.has(id)) return memo.get(id);
    const own = Math.min(100, Math.max(0, lvlOf(id) + CFG.relativeLevelCap));
    if (stack.has(id)) return own;
    stack.add(id);
    let best = own;
    for (const g of mobFor(id).requiredDefeats ?? []) for (const p of g) if (trainers.has(p)) best = Math.max(best, tl(p, stack));
    stack.delete(id);
    memo.set(id, best);
    return best;
  };
  for (const id of key) info.set(id, { id, req: mobFor(id).requiredDefeats ?? [], tl: tl(id) });
  const defeated = new Set();
  const avail = () => key.filter((id) => !defeated.has(id) && info.get(id).req.every((g) => g.length === 0 || g.some((x) => defeated.has(x))));
  const steps = [];
  for (;;) {
    const a = avail();
    if (!a.length) {
      const done = key.every((id) => defeated.has(id));
      steps.push({ defeatedCount: defeated.size, cap: Math.max(CFG.initialLevelCap, 100), next: null, reason: done ? "completed" : "inconsistent" });
      break;
    }
    // proximo da linha do tempo: o disponivel de menor trainerLevel (empate: menor nivel do proprio time, depois id)
    a.sort((x, y) => info.get(x).tl - info.get(y).tl || lvlOf(x) - lvlOf(y) || x.localeCompare(y));
    const x = info.get(a[0]).tl;
    steps.push({ defeatedCount: defeated.size, cap: Math.max(CFG.initialLevelCap, x), next: a[0], nextTeamMax: lvlOf(a[0]), available: a.length, defeatedSnapshot: [...defeated] });
    defeated.add(a[0]);
  }
  return steps;
}
const caps = {};
for (const sid of seriesRaw.keys()) caps[sid] = ownCaps(sid);

const summary = {
  datasetVersion: cur,
  config: CFG,
  checks,
  bySeverity: divs.reduce((a, d) => ((a[d.sev] = (a[d.sev] ?? 0) + 1), a), {}),
  counts: { trainersRaw: trainers.size, singleMobs: singleMobs.size, groups: groupMobs.size, series: Object.fromEntries([...expectedMembers].map(([k, v]) => [k, { membros: v.length, chave: v.filter((id) => mobFor(id).optional === false).length }])) },
  heldShapes,
  groupSeriesHits,
  caps: Object.fromEntries(Object.entries(caps).map(([k, v]) => [k, v.map((s) => s.cap)])),
};
console.log(JSON.stringify(summary, null, 1));
const byField = {};
for (const d of divs) (byField[`${d.sev} | ${d.field}`] ??= []).push(d);
for (const [k, v] of Object.entries(byField)) {
  console.log(`\n### ${k}: ${v.length}`);
  for (const d of v.slice(0, 6)) console.log(`  ${d.where}: cru=${JSON.stringify(d.raw)} pub=${JSON.stringify(d.pub)}`);
}
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ summary, divs, caps }, null, 1));
