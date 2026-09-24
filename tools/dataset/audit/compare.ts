// Auditoria independente (A1): compara o esperado (derivado do cru) com um dataset publicado.
import fs from "node:fs";
import path from "node:path";
import { BALL_RULES, rarityOf, tooltipMultipliers, type Expected, type ExpSpecies } from "./expected";
import { REPO_ROOT, readJson } from "./raw";

export type Severity = "WRONG DATA" | "MISSING" | "EXTRA" | "COSMETIC" | "SPEC x JOGO";

export interface Divergence {
  severity: Severity;
  scope: string; // "species 6 charizard", "ball dusk_ball", "series bdsp", "manifest"
  field: string;
  expected: string;
  actual: string;
  evidence: string; // arquivo cru
  published: string; // arquivo publicado
  cause?: string;
}

export interface CompareResult {
  datasetDir: string;
  checks: number;
  speciesChecked: number;
  divergences: Divergence[];
}

const J = (v: unknown) => (v === undefined ? "undefined" : JSON.stringify(v));
const sortStr = (a: string[]) => [...a].sort();
const canonSource = (s: string) => (/^(ccc|complete)/.test(s) ? "ccc" : /^cobblemon/i.test(s) ? "cobblemon" : s.split(/[-_]neoforge|-\d/)[0]!);

export function resolveDatasetDir(arg?: string): string {
  if (arg && fs.existsSync(path.join(arg, "dataset-manifest.json"))) return arg;
  const cur = arg ?? path.join(REPO_ROOT, "public", "data", "current.json");
  const ptr = readJson<{ datasetVersion: string }>(cur);
  return path.join(path.dirname(cur), ptr.datasetVersion);
}

export function compare(exp: Expected, datasetDir: string): CompareResult {
  const out: Divergence[] = [];
  let checks = 0;
  const push = (d: Divergence) => out.push(d);
  const pub = (p: string) => path.relative(REPO_ROOT, path.join(datasetDir, p)).split(path.sep).join("/");
  const manifest = readJson(path.join(datasetDir, "dataset-manifest.json"));
  const files = manifest.files ?? {};
  const idxFile = files.speciesIndex ?? "species-index.json";
  const index: any[] = readJson(path.join(datasetDir, idxFile));
  const speciesDir = files.speciesDir ?? "species";

  const eq = (scope: string, field: string, e: unknown, a: unknown, evidence: string, published: string, sev: Severity = "WRONG DATA", cause?: string) => {
    checks++;
    if (J(e) !== J(a)) push({ severity: a === undefined || a === null ? (e === null ? sev : "MISSING") : sev, scope, field, expected: J(e), actual: J(a), evidence, published, cause });
  };

  // ---- manifesto
  eq("manifest", "counts.species", exp.species.size, manifest.counts?.species, "data-source (1025 base + 2 custom)", pub("dataset-manifest.json"));
  eq("manifest", "counts.fossilRoutes", exp.fossilRoutes.length, manifest.counts?.fossilRoutes, exp.fossilRoutes.map((f) => f.file).join(", "), pub("dataset-manifest.json"));
  eq("manifest", "counts.balls", exp.balls.length, manifest.counts?.balls, "Cobblemon jar assets/cobblemon/textures/item/poke_balls/*.png", pub("dataset-manifest.json"));
  eq("manifest", "levelCapConfig", exp.levelCap, manifest.levelCapConfig, "data-source/atm-1.3.0/config/rctmod-server.toml", pub("dataset-manifest.json"));
  for (const s of exp.series) eq("manifest", `counts.keyTrainers.${s.id}`, s.keyTrainers.length, manifest.counts?.keyTrainers?.[s.id], "rctmod jar + kubejs mobs/trainers/single (optional:false, kubejs vence)", pub("dataset-manifest.json"));

  // ---- indice
  eq("species-index", "length", exp.species.size, index.length, "data-source", pub(idxFile));
  const idxByDex = new Map(index.map((s) => [s.dex, s]));
  for (const dex of exp.species.keys()) if (!idxByDex.has(dex)) push({ severity: "MISSING", scope: `species ${dex} ${exp.species.get(dex)!.slug}`, field: "species-index", expected: "presente", actual: "ausente", evidence: exp.species.get(dex)!.file, published: pub(idxFile) });
  for (const s of index) if (!exp.species.has(s.dex)) push({ severity: "EXTRA", scope: `species ${s.dex} ${s.slug}`, field: "species-index", expected: "ausente", actual: "presente", evidence: "-", published: pub(idxFile) });
  const dexOrder = index.map((s) => s.dex);
  const sorted = [...dexOrder].sort((a, b) => a - b);
  eq("species-index", "ordem por dex asc", J(sorted), J(dexOrder), "SPEC 5.1.3", pub(idxFile), "COSMETIC");

  let speciesChecked = 0;
  for (const e of exp.species.values()) {
    const f = path.join(datasetDir, speciesDir, `${e.dex}.json`);
    const pf = pub(`${speciesDir}/${e.dex}.json`);
    const scope = `species ${e.dex} ${e.slug}`;
    if (!fs.existsSync(f)) {
      push({ severity: "MISSING", scope, field: "ficha", expected: "arquivo", actual: "ausente", evidence: e.file, published: pf });
      continue;
    }
    speciesChecked++;
    const a = readJson(f);
    const idx = idxByDex.get(e.dex);
    compareSpecies(e, a, idx, scope, pf, exp, eq, push);
  }

  // ---- fosseis
  const fossilsFile = files.fossils ?? "fossils.json";
  if (fs.existsSync(path.join(datasetDir, fossilsFile))) {
    const pf: any[] = readJson(path.join(datasetDir, fossilsFile));
    eq("fossils", "length", exp.fossilRoutes.length, pf.length, "fossils/*.json", pub(fossilsFile));
    for (const r of exp.fossilRoutes) {
      const hit = pf.find((x) => x.resultSlug === r.result && J(sortStr(x.fossils)) === J(sortStr(r.fossils)));
      checks++;
      if (!hit) push({ severity: "MISSING", scope: `fossil ${r.result}`, field: "route", expected: J(r), actual: J(pf.filter((x) => x.resultSlug === r.result)), evidence: r.file, published: pub(fossilsFile) });
    }
  } else push({ severity: "MISSING", scope: "fossils", field: "arquivo", expected: fossilsFile, actual: "ausente", evidence: "-", published: pub(fossilsFile) });

  // ---- bolas
  const ballsFile = files.balls ?? "balls.json";
  if (fs.existsSync(path.join(datasetDir, ballsFile))) {
    const pb: any[] = readJson(path.join(datasetDir, ballsFile));
    eq("balls", "length", exp.balls.length, pb.length, "poke_balls/*.png", pub(ballsFile));
    for (const b of exp.balls) {
      const a = pb.find((x) => x.id === b.id);
      const scope = `ball ${b.id}`;
      if (!a) {
        push({ severity: "MISSING", scope, field: "ball", expected: b.id, actual: "ausente", evidence: b.textureFile, published: pub(ballsFile) });
        continue;
      }
      eq(scope, "itemId", b.itemId, a.itemId, b.textureFile, pub(ballsFile));
      // condicao de fast/net: a SPEC nao nomeia; contrato posterior usa minBaseSpeedAbove/hasAnyType. Compara o resto.
      const er = { ...b.rule } as any;
      const ar = { ...(a.rule ?? {}) } as any;
      if (b.id === "fast_ball" || b.id === "net_ball") {
        delete er.condition;
        delete ar.condition;
      }
      eq(scope, "rule", er, ar, "SPEC B4.3 (tooltip item.cobblemon." + b.id + ".tooltip)", pub(ballsFile));
      eq(scope, "effect.en (tooltip)", b.tooltip.en, a.effect?.en, "Cobblemon lang en_us.json", pub(ballsFile), "COSMETIC");
      eq(scope, "effect.pt (tooltip)", b.tooltip.pt, a.effect?.pt, "Cobblemon lang pt_br.json", pub(ballsFile), "COSMETIC");
      // sanidade da propria tabela: melhor multiplicador do tooltip cru
      const mults = tooltipMultipliers(b.tooltip.en ?? "");
      const best = (BALL_RULES[b.id] as any).kind === "flat" ? (BALL_RULES[b.id] as any).multiplier : (BALL_RULES[b.id] as any).bestMultiplier;
      checks++;
      if (best !== undefined && mults.length && !mults.includes(best) && Math.max(...mults) !== best)
        push({ severity: "WRONG DATA", scope, field: "tabela da SPEC x tooltip", expected: `tooltip: ${b.tooltip.en}`, actual: `regra: ${J(BALL_RULES[b.id])}`, evidence: "Cobblemon lang en_us.json", published: "SPEC B4.3" });
    }
    for (const a of pb) if (!exp.balls.some((b) => b.id === a.id)) push({ severity: "EXTRA", scope: `ball ${a.id}`, field: "ball", expected: "ausente", actual: "presente", evidence: "poke_balls/", published: pub(ballsFile) });
  } else push({ severity: "MISSING", scope: "balls", field: "arquivo", expected: ballsFile, actual: "ausente", evidence: "-", published: pub(ballsFile) });

  // ---- series e treinadores-chave
  const seriesFile = files.series ?? "series.json";
  if (fs.existsSync(path.join(datasetDir, seriesFile))) {
    const ps: any[] = readJson(path.join(datasetDir, seriesFile));
    for (const s of exp.series) {
      const a = ps.find((x) => x.id === s.id);
      const scope = `series ${s.id}`;
      if (!a) {
        push({ severity: "MISSING", scope, field: "series", expected: s.id, actual: "ausente", evidence: "rctmod/kubejs series", published: pub(seriesFile) });
        continue;
      }
      const ak: string[] = a.keyTrainerIds ?? [];
      eq(scope, "keyTrainerIds.length", s.keyTrainers.length, ak.length, "mobs/trainers/single (optional:false)", pub(seriesFile));
      const missing = s.keyTrainers.filter((k) => !ak.includes(k));
      const extra = ak.filter((k) => !s.keyTrainers.includes(k));
      checks++;
      if (missing.length) push({ severity: "MISSING", scope, field: "keyTrainerIds", expected: J(missing), actual: "ausentes", evidence: missing.map((m) => `${m} (${s.sourceOf[m]})`).join(", "), published: pub(seriesFile), cause: missing.some((m) => s.sourceOf[m] === "kubejs") ? "provavel: override do kubejs nao aplicado" : undefined });
      if (extra.length) push({ severity: "EXTRA", scope, field: "keyTrainerIds", expected: "ausentes", actual: J(extra), evidence: "mobs/trainers/single", published: pub(seriesFile), cause: "provavel: kubejs deveria sobrescrever o jar (optional/series)" });
      // ordem: viola dependencia = WRONG DATA; so desempate diferente = COSMETIC
      checks++;
      const pos = new Map(ak.map((k, i) => [k, i]));
      const viol: string[] = [];
      for (const k of ak) for (const d of s.deps[k] ?? []) if (pos.has(d) && pos.get(d)! > pos.get(k)!) viol.push(`${k} antes de ${d}`);
      if (viol.length) push({ severity: "WRONG DATA", scope, field: "ordem (requiredDefeats)", expected: "dependencias antes", actual: viol.slice(0, 10).join("; "), evidence: "mobs/trainers/single requiredDefeats", published: pub(seriesFile) });
      else if (J(ak) !== J(s.keyTrainers)) push({ severity: "COSMETIC", scope, field: "ordem (desempate)", expected: J(s.keyTrainers), actual: J(ak), evidence: "Kahn + maxTeamLevel asc + nome (SPEC B5.2)", published: pub(seriesFile) });
    }
  } else push({ severity: "MISSING", scope: "series", field: "arquivo", expected: seriesFile, actual: "ausente", evidence: "-", published: pub(seriesFile) });

  // ---- itens: ids referenciados existem e texturas publicadas existem
  const itemsFile = files.items ?? "items.json";
  if (fs.existsSync(path.join(datasetDir, itemsFile))) {
    const items: Record<string, any> = readJson(path.join(datasetDir, itemsFile));
    const referenced = new Map<string, string>();
    for (const e of exp.species.values()) {
      for (const d of e.drops) referenced.set(d.item, `drop de ${e.slug}`);
      for (const ev of e.evolutions) if (ev.requiredItem) referenced.set(ev.requiredItem, `evolucao de ${e.slug}`);
      for (const fo of e.forms) for (const it of fo.requiredItems) referenced.set(it, `forma ${fo.name} de ${e.slug}`);
    }
    for (const r of exp.fossilRoutes) for (const it of r.fossils) referenced.set(it, `fossil de ${r.result}`);
    for (const b of exp.balls) referenced.set(b.itemId, "bola");
    for (const [id, why] of referenced) {
      checks++;
      if (!items[id]) push({ severity: "MISSING", scope: `item ${id}`, field: "items.json", expected: `presente (${why})`, actual: "ausente", evidence: why, published: pub(itemsFile), cause: id.startsWith("minecraft:") || id.startsWith("silentgear:") ? "item de outro mod/vanilla (pode ser decisao de escopo)" : undefined });
    }
    for (const [id, it] of Object.entries(items)) {
      if (!it.texture) continue;
      checks++;
      const cands = [path.join(REPO_ROOT, "public", it.texture), path.join(datasetDir, it.texture), path.join(REPO_ROOT, it.texture)];
      if (!cands.some((c) => fs.existsSync(c))) push({ severity: "MISSING", scope: `item ${id}`, field: "texture (arquivo)", expected: "arquivo existe", actual: it.texture, evidence: exp.itemTextures.has(id) ? `textura crua existe (${id})` : "sem textura crua", published: pub(itemsFile) });
    }
    for (const b of exp.balls) {
      const it = items[b.itemId];
      checks++;
      if (it && !it.texture) push({ severity: "MISSING", scope: `item ${b.itemId}`, field: "texture", expected: b.textureFile, actual: "null", evidence: b.textureFile, published: pub(itemsFile) });
    }
  } else push({ severity: "MISSING", scope: "items", field: "arquivo", expected: itemsFile, actual: "ausente", evidence: "-", published: pub(itemsFile) });

  return { datasetDir, checks, speciesChecked, divergences: out };
}

function compareSpecies(
  e: ExpSpecies,
  a: any,
  idx: any,
  scope: string,
  pf: string,
  exp: Expected,
  eq: (scope: string, field: string, e: unknown, a: unknown, evidence: string, published: string, sev?: Severity, cause?: string) => void,
  push: (d: Divergence) => void,
) {
  const ev = e.file;
  eq(scope, "slug", e.slug, a.slug, ev, pf);
  eq(scope, "name.pt", e.name.pt, a.name?.pt, "lang pt_br cobblemon.species." + e.slug + ".name", pf);
  eq(scope, "name.en", e.name.en, a.name?.en, "lang en_us cobblemon.species." + e.slug + ".name", pf);
  if (e.desc.en || e.desc.pt) {
    eq(scope, "pokedexText.en", e.desc.en, a.pokedexText?.en, "lang en_us (pokedex[0])", pf, "COSMETIC");
    eq(scope, "pokedexText.pt", e.desc.pt, a.pokedexText?.pt, "lang pt_br (pokedex[0])", pf, "COSMETIC");
  }
  eq(scope, "types", e.types, a.types, ev, pf);
  eq(scope, "generation", e.generation, a.generation, ev, pf, "COSMETIC");
  for (const l of ["legendary", "mythical", "ultra_beast", "custom"]) eq(scope, `labels has ${l}`, e.labels.includes(l), (a.labels ?? []).includes(l), ev, pf);
  eq(scope, "baseStats", e.baseStats, a.baseStats, ev, pf, "WRONG DATA", e.touchedBy.length > 1 ? `especie alterada por ${e.touchedBy.join(" + ")}; SPEC: base do Cobblemon vence` : undefined);
  eq(scope, "bst", Object.values(e.baseStats).reduce((s, n) => s + n, 0), a.bst, ev, pf);
  eq(scope, "abilities", sortStr(e.abilities.map((x) => `${x.id}${x.hidden ? "(H)" : ""}`)), sortStr((a.abilities ?? []).map((x: any) => `${x.id}${x.hidden ? "(H)" : ""}`)), ev, pf);
  eq(scope, "eggGroups", sortStr(e.eggGroups), sortStr(a.eggGroups ?? []), ev, pf);
  eq(scope, "catchRate", e.catchRate, a.catchRate, ev, pf);
  eq(scope, "weight", e.weight, a.weight, ev, pf);
  eq(scope, "height", e.height, a.height, ev, pf);
  eq(scope, "maleRatio", e.maleRatio, a.maleRatio, ev, pf);
  eq(scope, "preEvolution", e.preEvolution, a.preEvolution ? { dex: a.preEvolution.dex, slug: a.preEvolution.slug } : null, ev, pf);
  // drops
  const dk = (d: any) => `${d.item}|${d.percentage ?? null}|${d.quantityRange ?? null}`;
  eq(scope, "drops", sortStr(e.drops.map(dk)), sortStr((a.drops ?? []).map(dk)), ev, pf, "WRONG DATA", e.touchedBy.length > 1 ? `adicoes: ${e.touchedBy.slice(1).join(", ")}` : undefined);
  // evolucoes
  const ek = (x: any) => `${x.toSlug}|${x.variant}|${x.requiredItem ?? null}`;
  eq(scope, "evolutions (destino|variant|item)", sortStr(e.evolutions.map(ek)), sortStr((a.evolutions ?? []).map(ek)), ev, pf);
  const reqKey = (r: any) =>
    r.kind === "level" ? `level:${r.minLevel}` : r.kind === "friendship" ? `friendship:${r.amount}` : r.kind === "timeRange" ? `timeRange:${r.range}` : r.kind === "hasMoveType" ? `hasMoveType:${r.type}` : r.kind === "heldItem" ? `heldItem:${r.item}` : `other:${r.raw?.variant}`;
  for (const x of e.evolutions) {
    const cands = (a.evolutions ?? []).filter((y: any) => y.toSlug === x.toSlug && y.variant === x.variant);
    const m = cands.find((y: any) => y.id === x.id) ?? (cands.length === 1 ? cands[0] : undefined);
    if (m) eq(scope, `evolution ${x.id || x.toSlug} requirements`, sortStr(x.requirements), sortStr((m.requirements ?? []).map(reqKey)), ev, pf);
  }
  // formas
  const fa: any[] = a.forms ?? [];
  eq(scope, "forms (nomes)", sortStr(e.forms.map((f) => f.name)), sortStr(fa.map((f) => f.name)), ev, pf);
  for (const f of e.forms) {
    const m = fa.find((x) => x.name === f.name);
    if (!m) continue;
    eq(scope, `form ${f.name} requiredItems`, sortStr(f.requiredItems), sortStr(m.requiredItems ?? []), "mega_showdown/zamega mega/*.json", pf);
    eq(scope, `form ${f.name} types`, f.types, m.types, ev, pf);
    eq(scope, `form ${f.name} source`, canonSource(f.source), canonSource(String(m.source)), ev, pf, "COSMETIC");
  }
  // spawns
  const as: any[] = a.spawns ?? [];
  const sk = (s: any) => `${s.id}|${canonSource(String(s.source))}`;
  const expGame = sortStr(e.spawns.map(sk));
  const expAll = sortStr(e.spawnsAll.map(sk));
  const act = sortStr(as.map(sk));
  if (J(act) !== J(expGame)) {
    const missing = expGame.filter((x) => !act.includes(x));
    const extra = act.filter((x) => !expGame.includes(x));
    const extraExplained = extra.every((x) => expAll.includes(x));
    if (missing.length) push({ severity: "MISSING", scope, field: "spawns", expected: J(missing), actual: "ausentes", evidence: [...new Set(e.spawns.filter((s) => missing.includes(sk(s))).map((s) => s.file))].join(", "), published: pf });
    if (extra.length)
      push({
        severity: extraExplained ? "SPEC x JOGO" : "EXTRA",
        scope,
        field: "spawns",
        expected: "ausentes no jogo",
        actual: J(extra),
        evidence: [...new Set(e.spawnsAll.filter((s) => extra.includes(sk(s))).map((s) => `${s.file}${s.disabled ? " (enabled:false)" : ""}${s.shadowedBy ? ` (sombreado por ${s.shadowedBy})` : ""}`))].join(", ") || "-",
        published: pf,
        cause: extraExplained ? "SPEC 5.1.2 manda contar TODAS as entradas; no jogo arquivo enabled:false nao nasce e arquivo do jar com o mesmo caminho do kubejs e substituido" : undefined,
      });
  }
  // detalhes de spawn por id (bucket, level, context, biomes)
  for (const s of e.spawnsAll) {
    const m = as.find((x) => x.id === s.id && canonSource(String(x.source)) === canonSource(s.source));
    if (!m) continue;
    eq(scope, `spawn ${s.id} bucket`, s.bucket, m.bucket, s.file, pf);
    eq(scope, `spawn ${s.id} level`, s.level, m.level, s.file, pf);
    eq(scope, `spawn ${s.id} context`, s.context, m.context, s.file, pf);
    eq(scope, `spawn ${s.id} biomes`, sortStr(s.biomes), sortStr(m.biomes ?? []), s.file, pf);
  }
  // raridade
  const pr = a.rarity ?? idx?.rarity;
  if (J(pr) !== J(e.rarity)) {
    const spec = J(pr) === J(e.rarityAll);
    push({ severity: spec ? "SPEC x JOGO" : "WRONG DATA", scope, field: "rarity", expected: J(e.rarity), actual: J(pr), evidence: e.spawns.map((s) => `${s.bucket}@${s.file}`).join(", ") || "sem spawn", published: pf, cause: spec ? "raridade conta spawns enabled:false/sombreados" : J(pr) === J(rarityOf(as)) ? "raridade coerente com os spawns publicados; erro esta nos spawns" : undefined });
  }
  if (idx) eq(scope, "index.rarity = ficha.rarity", J(a.rarity), J(idx.rarity), pf, "species-index.json");
  // como obter (tipos e ordem)
  const kinds = (a.obtain ?? []).map((o: any) => o.kind);
  eq(scope, "obtain (kinds em ordem)", e.obtainKinds, kinds, "regras SPEC 5.1.5 sobre spawns/fosseis/preEvolution/eggGroups", pf);
  const fos = (a.obtain ?? []).find((o: any) => o.kind === "fossil");
  if (e.fossils.length && fos) eq(scope, "obtain fossil items", sortStr(e.fossils[0]!.items), sortStr(fos.items ?? []), "fossils/*.json", pf);
  if (idx) eq(scope, "index.types = ficha.types", J(a.types), J(idx.types), pf, "species-index.json");
  void exp;
}
