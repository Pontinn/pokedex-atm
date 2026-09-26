// Lista os arquivos de especie com o MESMO resource location do Cobblemon (override de jar) e os campos da
// lista fechada da SPEC em que o override difere do base (no jogo o arquivo do mod que carrega depois vence inteiro).
// Uso: node tools/dataset/audit/manual-2026-09-26/overrides.mjs
import fs from "node:fs";
import path from "node:path";
const SRC = path.join(process.cwd(), "data-source/atm-1.3.0/mods");
const COB = path.join(SRC, "Cobblemon-neoforge-1.7.3+1.21.1.jar/data/cobblemon/species");
const CLOSED = ["baseStats", "moves", "evolutions", "abilities", "eggGroups", "drops", "catchRate", "weight", "height", "maleRatio", "preEvolution"];
for (const mod of fs.readdirSync(SRC)) {
  if (/^Cobblemon-/.test(mod)) continue;
  const d = path.join(SRC, mod, "data/cobblemon/species");
  if (!fs.existsSync(d)) continue;
  for (const gen of fs.readdirSync(d)) for (const f of fs.readdirSync(path.join(d, gen))) {
    const b = path.join(COB, gen, f);
    if (!fs.existsSync(b)) { console.log(`${mod} ${gen}/${f}: especie nova (sem base)`); continue; }
    const o = JSON.parse(fs.readFileSync(path.join(d, gen, f), "utf8")), base = JSON.parse(fs.readFileSync(b, "utf8"));
    const diff = CLOSED.filter((k) => JSON.stringify(o[k]) !== JSON.stringify(base[k])).map((k) => k === "moves" ? `moves(${(base.moves ?? []).length}->${(o.moves ?? []).length})` : k === "baseStats" ? `baseStats(${JSON.stringify(base.baseStats)}->${JSON.stringify(o.baseStats)})` : k);
    console.log(`${mod.split("-")[0]} ${gen}/${f}: ${diff.length ? diff.join(", ") : "igual na lista fechada"}`);
  }
}
