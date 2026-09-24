// Uso: tsx tools/dataset/audit/manual.ts [datasetDir|current.json]
// Gera tools/dataset/audit/manual-dump.txt: cru x publicado lado a lado para as 50 especies da amostra manual.
// A conferencia em si e feita a olho pelo auditor; o resultado vai para manual-check.md (incluido no AUDIT_REPORT.md).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildExpected } from "./expected";
import { resolveDatasetDir } from "./compare";
import { MANUAL_SAMPLE } from "./sample";
import { readJson } from "./raw";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const exp = buildExpected();
const dir = resolveDatasetDir(process.argv[2]);
const out: string[] = [];
const J = (v: unknown) => JSON.stringify(v);
for (const s of MANUAL_SAMPLE) {
  const e = exp.species.get(s.dex)!;
  const f = path.join(dir, "species", `${s.dex}.json`);
  const a = fs.existsSync(f) ? readJson(f) : null;
  out.push(`==== ${s.dex} ${s.slug} (${s.reason})  cru: ${e.file}  touchedBy: ${e.touchedBy.join("+")}`);
  if (!a) {
    out.push("  PUBLICADO AUSENTE");
    continue;
  }
  const row = (k: string, x: unknown, y: unknown) => out.push(`  ${J(x) === J(y) ? "  " : "!!"} ${k.padEnd(14)} cru=${J(x)}\n  ${" ".repeat(17)} pub=${J(y)}`);
  row("name", e.name, a.name);
  row("desc", e.desc, a.pokedexText);
  row("types", e.types, a.types);
  row("labels", e.labels, a.labels);
  row("baseStats", e.baseStats, a.baseStats);
  row("abilities", e.abilities, a.abilities);
  row("eggGroups", e.eggGroups, a.eggGroups);
  row("catch/w/h/m", [e.catchRate, e.weight, e.height, e.maleRatio], [a.catchRate, a.weight, a.height, a.maleRatio]);
  row("preEvolution", e.preEvolution, a.preEvolution);
  row("evolutions", e.evolutions.map((x) => `${x.toSlug}/${x.variant}/${x.requiredItem}/${x.requirements.join("+")}`), (a.evolutions ?? []).map((x: any) => `${x.toSlug}/${x.variant}/${x.requiredItem}/${(x.requirements ?? []).map((r: any) => r.kind + ":" + (r.minLevel ?? r.amount ?? r.range ?? r.type ?? r.item ?? r.raw?.variant)).join("+")}`));
  row("forms", e.forms.map((x) => `${x.name}[${x.requiredItems.join(",")}]`), (a.forms ?? []).map((x: any) => `${x.name}[${(x.requiredItems ?? []).join(",")}]`));
  row("drops", e.drops, a.drops);
  row("spawns", e.spawns.map((x) => `${x.id}/${x.source}/${x.bucket}/${x.level}/${x.context}`).sort(), (a.spawns ?? []).map((x: any) => `${x.id}/${x.source}/${x.bucket}/${x.level}/${x.context}`).sort());
  row("rarity", e.rarity, a.rarity);
  row("obtain", e.obtainKinds.map((k) => (k === "fossil" ? `fossil:${e.fossils[0]!.items.join(",")}` : k === "addon" ? `addon:${e.spawns.find((x) => x.source === "ccc" || x.source === "legendarymonuments")?.source ?? "ultrawormholes"}` : k)), (a.obtain ?? []).map((o: any) => o.kind + (o.addon ? `:${o.addon}` : "") + (o.items ? `:${o.items.join(",")}` : "")));
}
fs.writeFileSync(path.join(HERE, "manual-dump.txt"), out.join("\n"), "utf8");
console.log(`manual-dump.txt: ${MANUAL_SAMPLE.length} especies, ${out.filter((l) => l.includes("!!")).length} linhas divergentes`);
