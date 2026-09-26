// Auditoria independente de 50 especies sorteadas (2026-09-26).
// Le SO o cru (data-source/atm-1.3.0) e o JSON publicado. Nao importa tools/dataset/src nem src/.
// Uso: node tools/dataset/audit/manual-2026-09-26/species.mjs [--seed N] [--out arquivo.json]
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "data-source/atm-1.3.0");
const cur = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/current.json"), "utf8")).datasetVersion;
const PUB = path.join(ROOT, "public/data", cur);
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SEED = Number(arg("--seed") ?? (Date.now() % 2147483647));
const OUT = arg("--out");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

// ---------- amostra ----------
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry32(SEED);
const PREV = new Set("pidgey rattata caterpie sentret starly bulbasaur charmander squirtle chikorita turtwig sprigatito articuno lugia rayquaza dialga zacian koraidon mew jirachi manaphy shaymin diancie zeraora charizard venusaur absol garchomp gengar lucario mareep flaaffy staryu miltank altaria meltan melmetal piglich creepyon basculin ursaluna greavard aerodactyl omanyte archen eevee mewtwo magikarp zygarde lycanroc pikachu".split(" "));
const index = readJson(path.join(PUB, "species-index.json"));
const detail = (dex) => readJson(path.join(PUB, "species", `${dex}.json`));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pool = shuffle(index.filter((s) => !PREV.has(s.slug)));
const isLegend = (s) => s.labels.some((l) => ["legendary", "mythical", "ultra_beast", "paradox"].includes(l)) && s.labels.some((l) => l === "legendary" || l === "mythical");
const regionalOrMega = (s) => detail(s.dex).forms.some((f) => /mega|alol|galar|hisui|paldea/i.test(f.name + " " + (f.aspects ?? []).join(" ")));
const sample = [];
const add = (s, why) => { if (!sample.find((x) => x.slug === s.slug)) sample.push({ ...s, why }); };
// custom do All the Mons: so existem 2 (dex >= 9900), ambos ja estavam na amostra anterior; entram mesmo assim
for (const s of index.filter((s) => s.dex >= 9000)) add(s, "custom allthemons");
for (const s of pool.filter(isLegend).slice(0, 6)) add(s, "lendario/mitico");
let rm = 0; for (const s of pool) { if (rm >= 6) break; if (!sample.find((x) => x.slug === s.slug) && regionalOrMega(s)) { add(s, "forma regional/mega"); rm++; } }
for (const s of pool) { if (sample.length >= 50) break; add(s, "aleatorio"); }

// ---------- cru: arquivos de especie ----------
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
const MODS = path.join(SRC, "mods");
const modDirs = fs.readdirSync(MODS);
// ordem de carga (fecho transitivo documentado em AUDIT_REPORT/HANDOFF_datafix): maior = carrega depois = vence
const rank = (mod) => /^Cobblemon-/.test(mod) ? 0 : /^mega_showdown/.test(mod) ? 1 : /^legendarymonuments/.test(mod) ? 1 : /^zamega/.test(mod) ? 2 : /^allthemons/.test(mod) ? 3 : /^complete-cobblemon/.test(mod) ? 4 : mod === "kubejs" ? 9 : 1;
const shortMod = (mod) => /^Cobblemon-/.test(mod) ? "cobblemon" : /^mega_showdown/.test(mod) ? "mega_showdown" : /^complete-cobblemon/.test(mod) ? "ccc" : /^allthemons/.test(mod) ? "allthemons" : /^zamega/.test(mod) ? "zamega" : /^legendarymonuments/.test(mod) ? "legendarymonuments" : mod;
function walk(dir, out = []) { if (!fs.existsSync(dir)) return out; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walk(p, out); else if (e.name.endsWith(".json")) out.push(p); } return out; }
const roots = [...modDirs.map((m) => ({ mod: m, dir: path.join(MODS, m, "data") })), { mod: "kubejs", dir: path.join(SRC, "kubejs/data") }];
const speciesFiles = []; const additionFiles = []; const spawnFiles = [];
for (const r of roots) {
  if (!fs.existsSync(r.dir)) continue;
  for (const ns of fs.readdirSync(r.dir)) {
    for (const [sub, arr] of [["species", speciesFiles], ["species_additions", additionFiles], ["spawn_pool_world", spawnFiles]]) {
      const d = path.join(r.dir, ns, sub);
      for (const p of walk(d)) arr.push({ mod: r.mod, rl: `${ns}:${sub}/${path.relative(d, p).replace(/\\/g, "/")}`, p });
    }
  }
}
const wanted = new Set(sample.map((s) => norm(s.slug)));
const byName = new Map(); // norm -> [{mod, rl, json}]
for (const f of speciesFiles) {
  const base = norm(path.basename(f.p, ".json"));
  let j = null;
  if (!wanted.has(base)) { j = readJson(f.p); if (!wanted.has(norm(j.name))) continue; } else j = readJson(f.p);
  const k = wanted.has(base) ? base : norm(j.name);
  (byName.get(k) ?? byName.set(k, []).get(k)).push({ ...f, json: j });
}
const additions = new Map();
for (const f of additionFiles) {
  const j = readJson(f.p); const t = norm(String(j.target ?? "").split(":").pop());
  if (wanted.has(t)) (additions.get(t) ?? additions.set(t, []).get(t)).push({ ...f, json: j });
}
// spawns: vencedor por resource location, enabled:false fora
const spawnByRl = new Map();
for (const f of spawnFiles) { const prev = spawnByRl.get(f.rl); if (!prev || rank(f.mod) > rank(prev.mod)) spawnByRl.set(f.rl, f); }
const spawnsBySlug = new Map();
for (const f of spawnByRl.values()) {
  const j = readJson(f.p);
  if (j.enabled === false) continue;
  for (const s of j.spawns ?? []) {
    const first = norm(String(s.pokemon ?? "").split(" ")[0]);
    if (!wanted.has(first)) continue;
    (spawnsBySlug.get(first) ?? spawnsBySlug.set(first, []).get(first)).push({ ...s, __mod: shortMod(f.mod), __rl: f.rl });
  }
}
// lang
const lang = { pt: {}, en: {} };
for (const r of [...modDirs.map((m) => path.join(MODS, m, "assets")), path.join(SRC, "kubejs/assets")]) {
  if (!fs.existsSync(r)) continue;
  for (const ns of fs.readdirSync(r)) for (const [k, file] of [["pt", "pt_br.json"], ["en", "en_us.json"]]) {
    const p = path.join(r, ns, "lang", file);
    if (!fs.existsSync(p)) continue;
    let j; try { j = readJson(p); } catch { continue; }
    for (const [key, v] of Object.entries(j)) if (key.startsWith("cobblemon.species.") && key.endsWith(".name") && lang[k][key] === undefined) lang[k][key] = v;
  }
}

// ---------- comparacao ----------
const divs = []; let checks = 0;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const check = (sev, w, field, raw, pub, cmp = eq) => { checks++; if (!cmp(raw, pub)) divs.push({ sev, where: w, field, raw, pub }); };
const sortS = (a) => [...a].sort();
const stats = (b) => b && ({ hp: b.hp, attack: b.attack, defence: b.defence, specialAttack: b.special_attack, specialDefence: b.special_defence, speed: b.speed });
const abil = (a) => (a ?? []).map((x) => ({ id: x.replace(/^h:/, ""), hidden: x.startsWith("h:") }));
const CLOSED = ["baseStats", "moves", "evolutions", "abilities", "eggGroups", "drops", "catchRate", "weight", "height", "maleRatio", "preEvolution"];
const overrideNotes = [];

for (const s of sample) {
  const k = norm(s.slug); const pub = detail(s.dex); const w = `${s.dex} ${s.slug}`;
  const files = (byName.get(k) ?? []).sort((a, b) => rank(a.mod) - rank(b.mod));
  if (!files.length) { divs.push({ sev: "MISSING", where: w, field: "arquivo de especie no cru", raw: null, pub: s.slug }); continue; }
  const base = files[0].json; const winner = files[files.length - 1];
  // regra da SPEC: base vence na lista fechada; demais campos do override
  let spec = { ...base };
  for (const f of files.slice(1)) { for (const [kk, v] of Object.entries(f.json)) if (!CLOSED.includes(kk) && kk !== "forms") spec[kk] = v; }
  const formsByName = new Map((base.forms ?? []).map((f) => [f.name, { ...f, __src: shortMod(files[0].mod) }]));
  for (const f of files.slice(1)) for (const fo of f.json.forms ?? []) formsByName.set(fo.name, { ...fo, __src: shortMod(f.mod) });
  // species_additions (ordem: mod alfabetico, kubejs por ultimo)
  const adds = (additions.get(k) ?? []).sort((a, b) => (a.mod === "kubejs") - (b.mod === "kubejs") || a.mod.localeCompare(b.mod));
  for (const a of adds) for (const [kk, v] of Object.entries(a.json)) {
    if (kk === "target") continue;
    if (kk === "forms") { for (const fo of v) formsByName.set(fo.name, { ...(formsByName.get(fo.name) ?? {}), ...fo }); continue; }
    spec[kk] = v;
  }
  if (files.length > 1) {
    const diff = CLOSED.filter((f) => winner.json[f] !== undefined && !eq(winner.json[f], base[f]) && !adds.some((a) => a.json[f] !== undefined));
    if (diff.length) overrideNotes.push({ species: w, override: winner.rl + " (" + shortMod(winner.mod) + ")", camposOndeOBaseVenceu: diff, exemplo: diff.includes("moves") ? { baseMoves: (base.moves ?? []).length, overrideMoves: (winner.json.moves ?? []).length } : null });
  }
  const r = spec;
  // nomes
  const nk = `cobblemon.species.${path.basename((files[0].p), ".json")}.name`;
  check("COSMETIC", w, "nome EN (lang)", lang.en[nk] ?? r.name, pub.name.en);
  check("COSMETIC", w, "nome PT (lang)", lang.pt[nk] ?? lang.en[nk] ?? r.name, pub.name.pt);
  check("WRONG DATA", w, "tipos", [r.primaryType, r.secondaryType].filter(Boolean), pub.types);
  check("WRONG DATA", w, "baseStats", stats(r.baseStats), pub.baseStats);
  check("WRONG DATA", w, "abilities", abil(r.abilities), pub.abilities);
  check("WRONG DATA", w, "catchRate", r.catchRate, pub.catchRate);
  check("WRONG DATA", w, "weight", r.weight, pub.weight);
  check("WRONG DATA", w, "height", r.height, pub.height);
  check("WRONG DATA", w, "maleRatio", r.maleRatio, pub.maleRatio);
  check("WRONG DATA", w, "eggGroups", r.eggGroups ?? [], pub.eggGroups);
  // golpes
  const mv = { level: [], tm: [], egg: [], tutor: [], legacy: [], special: [] };
  for (const m of r.moves ?? []) { const [a, b] = m.split(":"); if (/^\d+$/.test(a)) mv.level.push(`${a}:${b}`); else (mv[a] ?? (mv[a] = [])).push(b); }
  check("WRONG DATA", w, "moves.level", sortS(mv.level), sortS((pub.moves.level ?? []).map((x) => `${x.level}:${x.move}`)));
  for (const t of ["tm", "egg", "tutor"]) check("WRONG DATA", w, `moves.${t}`, sortS(new Set(mv[t])), sortS(new Set(pub.moves[t] ?? [])));
  if (mv.legacy.length || mv.special.length) { checks++; if (!pub.moves.legacy && !pub.moves.special) divs.push({ sev: "SPEC x JOGO", where: w, field: "moves legacy/special nao publicados", raw: { legacy: mv.legacy.length, special: mv.special.length }, pub: Object.keys(pub.moves) }); }
  // evolucoes
  const ev = (r.evolutions ?? []).map((e) => ({ id: e.id, variant: e.variant, to: norm(String(e.result).split(" ")[0]), item: e.variant === "item_interact" ? e.requiredContext : null, minLevel: (e.requirements ?? []).find((q) => q.variant === "level")?.minLevel ?? null, nReq: (e.requirements ?? []).length }));
  const pe = (pub.evolutions ?? []).map((e) => ({ id: e.id, variant: e.variant, to: norm(e.toSlug), item: e.variant === "item_interact" ? e.requiredItem : null, minLevel: (e.requirements ?? []).find((q) => (q.kind ?? q.variant) === "level")?.minLevel ?? null, nReq: (e.requirements ?? []).length }));
  check("WRONG DATA", w, "evolutions (id/variant/destino/item/nivel/n requisitos)", ev, pe);
  // formas
  const rf = [...formsByName.values()].map((f) => ({ name: f.name, types: [f.primaryType ?? r.primaryType, f.primaryType ? f.secondaryType : (f.secondaryType ?? r.secondaryType)].filter(Boolean), baseStats: stats(f.baseStats ?? r.baseStats), battleOnly: !!f.battleOnly }));
  const pf = (pub.forms ?? []).map((f) => ({ name: f.name, types: f.types, baseStats: f.baseStats ?? stats(r.baseStats), battleOnly: !!f.battleOnly }));
  check("WRONG DATA", w, "formas (nomes)", sortS(rf.map((f) => f.name)), sortS(pf.map((f) => f.name)));
  for (const f of rf) { const p = pf.find((x) => x.name === f.name); if (!p) continue; check("WRONG DATA", `${w}/${f.name}`, "forma tipos+stats+battleOnly", f, p); }
  // drops
  const rd = (r.drops?.entries ?? []).map((d) => ({ item: d.item, percentage: d.percentage ?? null, quantityRange: d.quantityRange ?? null }));
  check("WRONG DATA", w, "drops", rd, (pub.drops ?? []).map((d) => ({ item: d.item, percentage: d.percentage ?? null, quantityRange: d.quantityRange ?? null })));
  // spawns
  const rs = (spawnsBySlug.get(k) ?? []).map((x) => ({ id: String(x.id), bucket: x.bucket, level: String(x.level), context: x.spawnablePositionType ?? x.context ?? null, biomes: sortS(x.condition?.biomes ?? []), time: x.condition?.timeRange ?? "any" }));
  const ps = (pub.spawns ?? []).map((x) => ({ id: String(x.id).replace(/^[a-z_]+:/, ""), bucket: x.bucket, level: String(x.level), context: x.context, biomes: sortS(x.biomes ?? []), time: x.timeRange ?? "any" }));
  check("WRONG DATA", w, "spawns (ids)", sortS(rs.map((x) => x.id)), sortS(ps.map((x) => x.id)));
  for (const x of rs) { const p = ps.find((y) => y.id === x.id); if (p) check("WRONG DATA", `${w}/${x.id}`, "spawn bucket/nivel/contexto/biomas/horario", x, p); }
  // como obter (so coerencia: tem spawn -> rota de spawn; tem pre-evolucao -> rota evolution)
  const kinds = new Set((pub.obtain ?? []).map((o) => o.kind));
  // regra 5.1.5: spawn nativo do Cobblemon/mega_showdown/zamega fica em "Onde encontrar"; kubejs/allthemons -> packSpawn; ccc/legendarymonuments -> addon
  const srcs = new Set((spawnsBySlug.get(k) ?? []).map((x) => x.__mod));
  if (srcs.has("kubejs") || srcs.has("allthemons")) check("WRONG DATA", w, "obtain packSpawn (spawn kubejs/allthemons no cru)", true, kinds.has("packSpawn"));
  if (srcs.has("ccc") || srcs.has("legendarymonuments")) check("WRONG DATA", w, "obtain addon (spawn ccc/legendarymonuments no cru)", true, kinds.has("addon"));
  if (rs.length) check("WRONG DATA", w, "obtain nao e none com spawn no cru", false, kinds.has("none"));
  if (pub.preEvolution) check("WRONG DATA", w, "obtain inclui evolution", true, kinds.has("evolution"));
  if (pub.cry) check("MISSING", w, "grito existe em disco", true, fs.existsSync(path.join(ROOT, "public/assets/cries", `${pub.cry}.ogg`)));
  // midia
  if (pub.hasSprite) check("MISSING", w, "sprite existe em disco", true, fs.existsSync(path.join(ROOT, "public/assets/sprites", `${s.dex}.png`)));
}

const summary = { seed: SEED, datasetVersion: cur, checks, bySeverity: divs.reduce((a, d) => ((a[d.sev] = (a[d.sev] ?? 0) + 1), a), {}), sample: sample.map((s) => `${s.dex} ${s.slug} (${s.why})`) };
console.log(JSON.stringify(summary, null, 1));
for (const d of divs) console.log(`[${d.sev}] ${d.where} | ${d.field}\n   cru=${JSON.stringify(d.raw).slice(0, 400)}\n   pub=${JSON.stringify(d.pub).slice(0, 400)}`);
console.log("\nOverrides onde o arquivo vencedor no jogo difere do base em campo da lista fechada:");
for (const o of overrideNotes) console.log(" ", JSON.stringify(o));
if (OUT) fs.writeFileSync(OUT, JSON.stringify({ summary, divs, overrideNotes }, null, 1));
